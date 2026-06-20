import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePantry, removePantryItem, type PantryItem } from "@/lib/pantry-store";
import { canonicalName } from "@/lib/recipe-matcher";
import { AddIngredientSheet } from "@/components/pantry/AddIngredientSheet";
import { StorageTipPanel, type StorageTipData } from "@/components/pantry/StorageTipPanel";
import { computeCountdown } from "@/lib/pantry-utils";
import { cn } from "@/lib/utils";
import { ListFilter as Filter, Search, ChevronRight, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { addDays } from "@/lib/pantry-utils";

const searchSchema = z.object({ add: z.coerce.number().optional() });

export const Route = createFileRoute("/_authenticated/pantry")({
  validateSearch: searchSchema,
  component: PantryPage,
});

type TabKey = "all" | "fridge" | "freezer" | "pantry";

const TAB_LABELS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fridge", label: "Fridge" },
  { key: "freezer", label: "Freezer" },
  { key: "pantry", label: "Pantry" },
];

function categoryTab(it: PantryItem): TabKey {
  const cat = (it.category ?? "").toLowerCase();
  if (cat.includes("freeze") || cat.includes("frozen")) return "freezer";
  if (cat.includes("pantry") || cat.includes("dry") || cat.includes("grain") || cat.includes("bakery")) return "pantry";
  return "fridge";
}

function urgencyColorHex(daysRemaining: number, total: number) {
  const pct = daysRemaining / total;
  if (daysRemaining <= 0) return "#9E9E9E";
  if (pct < 0.25) return "#D93025";
  if (pct < 0.50) return "#E8780C";
  return "#29A657";
}

function daysLabel(d: number) {
  if (d <= 0) return "Expired";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

function daysTextClass(d: number, total: number) {
  const pct = d / total;
  if (d <= 0) return "text-muted-foreground";
  if (pct < 0.25) return "text-red-600 font-semibold";
  if (pct < 0.50) return "text-orange-500 font-semibold";
  return "text-primary font-semibold";
}

function PantryRow({
  it,
  onTips,
  onDelete,
  onUseUp,
}: {
  it: PantryItem;
  onTips: () => void;
  onDelete: () => void;
  onUseUp: () => void;
}) {
  const info = computeCountdown({
    purchaseDate: it.purchase_date,
    shelfLifeDays: it.shelf_life_days,
    optimalStart: it.optimal_window_start_day,
    optimalEnd: it.optimal_window_end_day,
  });

  const barColor = urgencyColorHex(info.daysRemaining, info.totalDays);
  const pct = Math.max(0, info.pctRemaining);
  const useByDate = addDays(new Date(it.purchase_date), it.shelf_life_days);
  const useByStr = useByDate.toLocaleDateString("en", { day: "numeric", month: "short" });
  const tab = categoryTab(it);
  const tabLabel = tab === "fridge" ? "Fridge" : tab === "freezer" ? "Freezer" : tab === "pantry" ? "Pantry" : "";

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-border last:border-0 group">
      {/* Emoji */}
      <div className="size-10 rounded-full bg-surface-warm flex items-center justify-center text-xl shrink-0">
        {it.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{it.display_name}</p>
          <span className={cn("text-xs whitespace-nowrap shrink-0", daysTextClass(info.daysRemaining, info.totalDays))}>
            {daysLabel(info.daysRemaining)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
          {tabLabel && (
            <span className="text-[10px] text-muted-foreground">{tabLabel}</span>
          )}
          {info.status === "golden" && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Peak</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0F0F0" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Use by {useByStr}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onUseUp}
          className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
          aria-label="Find recipes"
          title="Find recipes"
        >
          <ChevronRight className="size-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="size-7 rounded-full bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors"
          aria-label="Remove"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// Group items by date bucket for Freshness Calendar
function FreshnessCalendar({ items }: { items: PantryItem[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = useMemo(() => {
    const map = new Map<string, { date: Date; label: string; items: PantryItem[]; dotColor: string }>();
    for (const it of items) {
      const expiry = addDays(new Date(it.purchase_date), it.shelf_life_days);
      expiry.setHours(0, 0, 0, 0);
      const key = expiry.toISOString().slice(0, 10);
      if (!map.has(key)) {
        const diffDays = Math.round((expiry.getTime() - today.getTime()) / 86400000);
        let label = expiry.toLocaleDateString("en", { day: "numeric", month: "short" });
        if (diffDays === 0) label += " (Today)";
        const dotColor = diffDays <= 1 ? "#D93025" : diffDays <= 3 ? "#E8780C" : "#29A657";
        map.set(key, { date: expiry, label, items: [], dotColor });
      }
      map.get(key)!.items.push(it);
    }
    return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);
  }, [items, today]);

  if (buckets.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base text-foreground">Freshness Calendar</h2>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {buckets.map((b, i) => (
          <div
            key={b.date.toISOString()}
            className={cn("flex items-center px-4 py-3 gap-3", i < buckets.length - 1 && "border-b border-border")}
          >
            <div className="size-2.5 rounded-full shrink-0" style={{ background: b.dotColor }} />
            <p className="text-sm font-medium text-foreground flex-1">{b.label}</p>
            <p className="text-xs text-muted-foreground">{b.items.length} item{b.items.length !== 1 ? "s" : ""}</p>
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PantryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [tipsData, setTipsData] = useState<StorageTipData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (search.add) {
      setAddOpen(true);
      navigate({ to: "/pantry", search: {} as any, replace: true });
    }
  }, [search.add, navigate]);

  const items = usePantry();

  const filtered = useMemo(() => {
    let list = activeTab === "all" ? items : items.filter((it) => categoryTab(it) === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((it) => it.display_name.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeTab, searchQuery]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { all: items.length, fridge: 0, freezer: 0, pantry: 0 };
    for (const it of items) counts[categoryTab(it)]++;
    return counts;
  }, [items]);

  function openTips(it: PantryItem) {
    setTipsData({
      name: it.display_name, emoji: it.emoji, category: it.category ?? null,
      storage_tips: it.storage_tips, shelf_life_days: it.shelf_life_days,
      optimal_window_start_day: it.optimal_window_start_day,
      optimal_window_end_day: it.optimal_window_end_day,
      isCustom: !it.ingredient_id,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="px-5 py-4 flex items-center justify-between md:px-8">
          <h1 className="font-bold text-lg text-foreground">My Pantry</h1>
          <div className="flex items-center gap-2">
            <button className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
              <Filter className="size-4 text-muted-foreground" />
            </button>
            <button className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
              <Search className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-1 border-b border-border overflow-x-auto scrollbar-none md:px-8">
          {TAB_LABELS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px",
                activeTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label} {tabCounts[t.key] > 0 && (
                <span className={cn("ml-1 text-xs", activeTab === t.key ? "text-primary" : "text-muted-foreground")}>
                  ({tabCounts[t.key]})
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 py-4 md:px-8">
        {/* Search bar */}
        {items.length > 3 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-card rounded-2xl border border-dashed border-border mt-4">
            <p className="text-4xl mb-3">🧺</p>
            <p className="font-semibold text-foreground">
              {items.length === 0 ? "Your pantry is empty" : "No items match"}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Add first ingredient
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {filtered.map((it) => (
              <PantryRow
                key={it.id}
                it={it}
                onTips={() => openTips(it)}
                onDelete={() => { removePantryItem(it.id); toast.success("Removed"); }}
                onUseUp={() => navigate({ to: "/recipes", search: { useUp: canonicalName(it) } as any })}
              />
            ))}
          </div>
        )}

        <FreshnessCalendar items={items} />
      </div>

      <AddIngredientSheet open={addOpen} onOpenChange={setAddOpen} />
      <StorageTipPanel open={!!tipsData} onClose={() => setTipsData(null)} data={tipsData} />
    </div>
  );
}
