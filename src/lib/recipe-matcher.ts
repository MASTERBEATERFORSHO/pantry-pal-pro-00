import { RECIPES, COMMON_STAPLES, type Recipe, type CookingGoal } from "@/lib/recipes-data";
import { INGREDIENTS } from "@/lib/ingredients-data";
import type { PantryItem } from "@/lib/pantry-store";
import { computeCountdown } from "@/lib/pantry-utils";

export type MatchMode = "strict" | "flexible";

export interface RecipeMatch {
  recipe: Recipe;
  matchedRequired: string[]; // names from required that user has selected
  unusedSelected: string[];  // selected items not used in this recipe
  missingIngredients: string[]; // required not in selected (flexible only meaningful)
  matchPct: number; // matchedRequired / required total
  expiringUsedCount: number;
  goalMatchCount: number;
  score: number;
}

export function canonicalName(item: PantryItem): string {
  if (item.ingredient_id) {
    const found = INGREDIENTS.find((i) => i.id === item.ingredient_id);
    if (found) return found.name;
  }
  return (item.custom_name || item.display_name || "").trim();
}

function norm(s: string) {
  return s.toLowerCase().trim();
}

function eqName(a: string, b: string) {
  return norm(a) === norm(b);
}

function includesName(arr: string[], n: string) {
  return arr.some((x) => eqName(x, n));
}

export function isExpiring(item: PantryItem): boolean {
  const info = computeCountdown({
    purchaseDate: item.purchase_date,
    shelfLifeDays: item.shelf_life_days,
    optimalStart: item.optimal_window_start_day,
    optimalEnd: item.optimal_window_end_day,
  });
  return info.status === "past" || info.status === "expired" || info.status === "golden";
}

export interface MatchArgs {
  selectedNames: string[]; // canonical names of selected ingredients
  expiringNames: string[]; // subset of selectedNames considered expiring
  pantryNames: string[];   // all pantry canonical names (for flexible)
  goals: CookingGoal[];    // empty means "any"
  mode: MatchMode;
}

export function matchRecipes(args: MatchArgs): RecipeMatch[] {
  const { selectedNames, expiringNames, pantryNames, goals, mode } = args;

  const matches: RecipeMatch[] = RECIPES.map((recipe) => {
    const matchedRequired = recipe.required_ingredients.filter((r) =>
      includesName(selectedNames, r),
    );
    const matchPct = recipe.required_ingredients.length
      ? matchedRequired.length / recipe.required_ingredients.length
      : 0;

    const unusedSelected = selectedNames.filter(
      (s) =>
        !includesName(recipe.required_ingredients, s) &&
        !includesName(recipe.optional_ingredients, s),
    );

    const availablePool = mode === "flexible"
      ? [...selectedNames, ...pantryNames, ...COMMON_STAPLES]
      : selectedNames;

    const missingIngredients = recipe.required_ingredients.filter(
      (r) => !includesName(availablePool, r),
    );

    const expiringUsedCount = expiringNames.filter(
      (n) =>
        includesName(recipe.required_ingredients, n) ||
        includesName(recipe.optional_ingredients, n),
    ).length;

    const goalMatchCount = goals.length
      ? recipe.cooking_goal.filter((g) => goals.includes(g)).length
      : 0;

    const score =
      expiringUsedCount * 10 +
      matchPct * 6 +
      goalMatchCount * 2 -
      missingIngredients.length * 2.5;

    return {
      recipe,
      matchedRequired,
      unusedSelected,
      missingIngredients,
      matchPct,
      expiringUsedCount,
      goalMatchCount,
      score,
    };
  });

  // Filter
  const filtered = matches.filter((m) => {
    if (goals.length && m.goalMatchCount === 0) return false;
    if (mode === "strict") {
      // Need at least one matched required, and majority overlap
      return m.matchedRequired.length >= 1 && m.matchPct >= 0.5;
    }
    // flexible
    return (
      m.matchedRequired.length >= 1 &&
      m.missingIngredients.length <= 2
    );
  });

  return filtered.sort((a, b) => b.score - a.score).slice(0, 8);
}