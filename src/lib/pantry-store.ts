import { useSyncExternalStore } from "react";
import { addDays, toISODate } from "@/lib/pantry-utils";
import { INGREDIENTS, type Ingredient } from "@/lib/ingredients-data";

export interface PantryItem {
  id: string;
  ingredient_id: string | null;
  custom_name?: string | null;
  display_name: string;
  emoji: string;
  quantity: string;
  purchase_date: string;
  ripeness?: string | null;
  shelf_life_days: number;
  optimal_window_start_day: number;
  optimal_window_end_day: number;
  expiry_date: string;
  storage_tips?: string | null;
  created_at: string;
}

const KEY = "pantrypal:items:v1";
const listeners = new Set<() => void>();
let cache: PantryItem[] = [];
let hydrated = false;

function read(): PantryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PantryItem[]) : [];
  } catch {
    return [];
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  cache = read();
  hydrated = true;
}

function write(next: PantryItem[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  ensureHydrated();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function snapshot() {
  ensureHydrated();
  return cache;
}

const emptySnapshot: PantryItem[] = [];

export function usePantry(): PantryItem[] {
  return useSyncExternalStore(subscribe, snapshot, () => emptySnapshot);
}

export function getPantry(): PantryItem[] {
  ensureHydrated();
  return cache;
}

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export type AddPayload =
  | {
      kind: "ingredient";
      ingredient: Ingredient;
      quantity: string;
      purchaseDate: string;
      ripeness?: string | null;
    }
  | {
      kind: "custom";
      name: string;
      shelfDays: number;
      quantity: string;
      purchaseDate: string;
    };

export function addPantryItem(p: AddPayload) {
  ensureHydrated();
  let item: PantryItem;
  if (p.kind === "custom") {
    const shelf = Math.max(1, p.shelfDays || 7);
    item = {
      id: uid(),
      ingredient_id: null,
      custom_name: p.name,
      display_name: p.name,
      emoji: "🥗",
      quantity: p.quantity,
      purchase_date: p.purchaseDate,
      shelf_life_days: shelf,
      optimal_window_start_day: Math.floor(shelf * 0.2),
      optimal_window_end_day: Math.floor(shelf * 0.7),
      expiry_date: toISODate(addDays(new Date(p.purchaseDate), shelf)),
      storage_tips: "Store in a cool, dry place.",
      created_at: new Date().toISOString(),
    };
  } else {
    const i = p.ingredient;
    let shelf = i.base_shelf_life_days;
    const startW = i.optimal_window_start_day;
    const endW = i.optimal_window_end_day;
    if (i.ripeness_applicable) {
      if (p.ripeness === "Overripe") shelf = Math.max(1, Math.floor(shelf * 0.4));
      else if (p.ripeness === "Ripe") shelf = Math.max(1, Math.floor(shelf * 0.7));
    }
    item = {
      id: uid(),
      ingredient_id: i.id,
      display_name: i.variant_name,
      emoji: i.emoji,
      quantity: p.quantity,
      purchase_date: p.purchaseDate,
      ripeness: i.ripeness_applicable ? p.ripeness ?? null : null,
      shelf_life_days: shelf,
      optimal_window_start_day: Math.min(startW, shelf - 1),
      optimal_window_end_day: Math.min(endW, shelf),
      expiry_date: toISODate(addDays(new Date(p.purchaseDate), shelf)),
      storage_tips: i.storage_tips,
      created_at: new Date().toISOString(),
    };
  }
  const next = [...cache, item].sort((a, b) =>
    a.expiry_date.localeCompare(b.expiry_date),
  );
  write(next);
}

export function removePantryItem(id: string) {
  ensureHydrated();
  write(cache.filter((x) => x.id !== id));
}

export function searchIngredients(q: string): Ingredient[] {
  if (!q.trim()) return [];
  const s = q.toLowerCase();
  return INGREDIENTS.filter(
    (i) =>
      i.name.toLowerCase().includes(s) ||
      i.variant_name.toLowerCase().includes(s),
  );
}