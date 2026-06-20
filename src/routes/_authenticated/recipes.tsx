import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePantry } from "@/lib/pantry-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { ChefHat, Clock, Flame, Heart, Settings, ChevronDown, Sparkles, CircleAlert as AlertCircle, ArrowLeft, FileSliders as Sliders, X } from "lucide-react";
import { z } from "zod";
import { canonicalName, isExpiring, matchRecipesDetailed } from "@/lib/recipe-matcher";
import type { CookingGoal } from "@/lib/recipes-data";
import { useProfile } from "@/lib/profile-store";
import { useSavedRecipes, toggleSaved } from "@/lib/saved-recipes-store";

const searchSchema = z.object({ useUp: z.string().optional() });

export const Route = createFileRoute("/_authenticated/recipes")({
  validateSearch: searchSchema,
  component: RecipesPage,
});

const GOALS: { key: CookingGoal; label: string; emoji: string }[] = [
  { key: "snack", label: "Snack", emoji: "🥨" },
  { key: "healthy", label: "Healthy", emoji: "🥗" },
  { key: "filling", label: "Filling", emoji: "🍛" },
  { key: "quick", label: "Quick", emoji: "⚡" },
];

function RecipesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const items = usePantry();
  const { profile } = useProfile();
  const saved = useSavedRecipes();

  const [filter, setFilter] = useState<"all" | "expiring">("all");
  const [extra, setExtra] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [goals, setGoals] = useState<Set<CookingGoal>>(new Set());
  const [mode, setMode] = useState<"strict" | "flexible">("flexible");
  const [hasSearched, setHasSearched] = useState(false);
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  useEffect(() => {
    if (!profile || primed) return;
    setGoals(new Set(profile.default_cooking_goals));
    setMode(profile.default_mode);
    setPrimed(true);
  }, [profile, primed]);

  useEffect(() => {
    if (!search.useUp) return;
    const target = search.useUp;
    const match = items.find((it) => canonicalName(it).toLowerCase() === target.toLowerCase());
    if (match) setSelectedIds(new Set([match.id]));
    else { setExtraNames([target]); setExtra(target); }
    setHasSearched(true);
    navigate({ to: "/recipes", search: {} as any, replace: true });
  }, [search.useUp, items, navigate]);

  const visible = useMemo(() => filter === "all" ? items : items.filter(isExpiring), [items, filter]);

  const toggle = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleGoal = (g: CookingGoal) =>
    setGoals((prev) => { const n = new Set(prev); n.has(g) ? n.delete(g) : n.add(g); return n; });

  function commitExtras(value: string) {
    setExtra(value);
    setExtraNames(value.split(",").map((s) => s.trim()).filter(Boolean));
  }

  const selectedItems = items.filter((it) => selectedIds.has(it.id));
  const selectedNames = [...selectedItems.map(canonicalName), ...extraNames];
  const expiringNames = selectedItems.filter(isExpiring).map(canonicalName);
  const pantryNames = items.map(canonicalName);

  const results = useMemo(
    () =>
      hasSearched && profile
        ? matchRecipesDetailed({ selectedNames, expiringNames, pantryNames, goals: [...goals], mode, equipment: profile.equipment, dietary: profile.dietary_preferences, showAll })
        : { matches: [], equipmentFilteredOut: 0, dietaryHidden: 0 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasSearched, selectedIds, extraNames, goals, mode, items, profile, showAll],
  );

  const canSearch = selectedNames.length > 0;
  const noEquipmentMatches = hasSearched && canSearch && results.matches.length === 0 && results.equipmentFilteredOut > 0 && results.equipmentFilteredOut >= 12;

  // Rescue mode: items expiring in ≤2 days
  const rescueItems = useMemo(() =>
    items
      .map((it) => {
        const info = { daysRemaining: Math.ceil((new Date(it.purchase_date).getTime() + it.shelf_life_days * 86400000 - Date.now()) / 86400000) };
        return { it, days: info.daysRemaining };
      })
      .filter((x) => x.days <= 2 && x.days >= 0)
      .sort((a, b) => a.days - b.days)
  , [items]);

  const daysLeftColor = (d: number) => d <= 1 ? "text-red-500" : d <= 2 ? "text-orange-500" : "text-primary";
  const daysLeftText = (d: number) => d <= 0 ? "Expired" : d === 1 ? "1 day left" : `${d} days left`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-5 py-4 flex items-center justify-between md:px-8">
        <h1 className="font-bold text-lg text-foreground">Find Recipes</h1>
        <button
          onClick={() => setShowInputs(!showInputs)}
          className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
        >
          <Sliders className="size-4 text-muted-foreground" />
        </button>
      </header>

      <div className="px-5 py-5 md:px-8 space-y-5">
        {/* Your Inputs panel */}
        {(selectedNames.length > 0 || showInputs) && (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-foreground">Your Inputs</h2>
              {selectedNames.length > 0 && (
                <button onClick={() => { setSelectedIds(new Set()); setExtraNames([]); setExtra(""); setHasSearched(false); }}
                  className="text-xs text-muted-foreground hover:text-danger flex items-center gap-0.5">
                  <X className="size-3" /> Clear
                </button>
              )}
            </div>
            <div className="space-y-3 text-sm">
              {selectedNames.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-2xl">🧺</span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Ingredients</p>
                    <p className="text-foreground text-xs">{selectedNames.join(", ")}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Goal</p>
                  <p className="text-foreground text-xs">{goals.size === 0 ? "Any" : [...goals].join(", ")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Recipe Mode</p>
                  <p className="text-foreground text-xs capitalize">{mode} Mode</p>
                </div>
              </div>
              {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-2xl">🥗</span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Diet</p>
                    <p className="text-foreground text-xs">{profile.dietary_preferences.join(", ")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode cards */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recipe Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {(["strict", "flexible"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "p-3 rounded-2xl border-2 text-left transition-all",
                  mode === m
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30",
                )}
              >
                <p className="text-sm font-bold text-foreground capitalize mb-0.5">{m} Mode</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {m === "strict"
                    ? "Use only my ingredients"
                    : "Use my ingredients + add others"}
                </p>
                {mode === m && (
                  <div className="mt-1.5 size-4 rounded-full bg-primary flex items-center justify-center ml-auto">
                    <div className="size-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cooking Goal</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGoals(new Set())}
              className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                goals.size === 0 ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border")}
            >Any</button>
            {GOALS.map((g) => (
              <button
                key={g.key}
                onClick={() => toggleGoal(g.key)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1",
                  goals.has(g.key) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40")}
              >
                <span>{g.emoji}</span>{g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pantry filter + chips */}
        <div>
          <div className="flex gap-2 mb-3 p-1 bg-muted rounded-full">
            {(["all", "expiring"] as const).map((k) => (
              <button key={k} onClick={() => setFilter(k)}
                className={cn("flex-1 py-1.5 text-[11px] font-semibold rounded-full transition-all",
                  filter === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
              >
                {k === "all" ? "All Pantry" : "Expiring Soon"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {filter === "expiring" ? "Nothing expiring — nice." : "No pantry items yet."}
              </p>
            ) : visible.map((it) => {
              const isSel = selectedIds.has(it.id);
              return (
                <button key={it.id} onClick={() => toggle(it.id)}
                  className={cn("px-3 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                    isSel ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-foreground border-border hover:border-primary/40")}
                >
                  <span>{it.emoji}</span>
                  {it.display_name}
                  {isExpiring(it) && !isSel && <Flame className="size-3 text-danger" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Extras */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Add extras (optional)</label>
          <Input placeholder="e.g. garlic, chili flakes" value={extra} onChange={(e) => commitExtras(e.target.value)} className="rounded-xl" />
        </div>

        {/* Find Recipes CTA */}
        <Button onClick={() => setHasSearched(true)} disabled={!canSearch} className="w-full h-12 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90">
          <ChefHat className="size-5 mr-2" />
          Find Recipes
        </Button>
        {!canSearch && (
          <p className="text-center text-xs text-muted-foreground -mt-3">Pick at least one ingredient to get started.</p>
        )}

        {/* Rescue Mode */}
        {rescueItems.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <h3 className="font-bold text-sm text-amber-900 mb-0.5">Rescue Mode</h3>
            <p className="text-xs text-amber-700 mb-3">These ingredients need your attention!</p>
            <div className="space-y-2.5">
              {rescueItems.map(({ it, days }) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-white flex items-center justify-center text-base shrink-0 shadow-sm">
                    {it.emoji}
                  </div>
                  <p className="text-sm font-medium text-foreground flex-1">{it.display_name}</p>
                  <span className={cn("text-xs font-semibold", daysLeftColor(days))}>{daysLeftText(days)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const ids = rescueItems.map((r) => r.it.id);
                setSelectedIds(new Set(ids));
                setHasSearched(true);
              }}
              className="mt-4 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Show Recipes
            </button>
          </div>
        )}

        {/* Results */}
        {hasSearched && canSearch && (
          <section>
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
              {results.matches.length === 0 ? "No matches" : `${results.matches.length} recipe${results.matches.length === 1 ? "" : "s"} found`}
            </p>

            {noEquipmentMatches ? (
              <div className="text-center py-8 px-6 bg-card rounded-2xl border border-dashed">
                <Settings className="size-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No recipes match your current equipment.</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Update your kitchen equipment in Profile.</p>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to="/profile">Open Profile</Link>
                </Button>
              </div>
            ) : results.matches.length === 0 ? (
              <div className="text-center py-10 px-6 bg-card rounded-2xl border border-dashed">
                <p className="text-3xl mb-2">🤔</p>
                <p className="text-sm text-foreground font-medium">No recipes match yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Try Flexible mode, fewer goals, or add another ingredient.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.matches.map((m) => {
                  const isOpen = openRecipe === m.recipe.id;
                  const pct = Math.round(m.matchPct * 100);
                  const isSaved = saved.has(m.recipe.id);
                  return (
                    <article key={m.recipe.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      {/* Recipe image placeholder */}
                      <div className="h-32 bg-surface-warm flex items-center justify-center text-5xl">
                        {m.recipe.emoji}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-base text-foreground leading-tight">{m.recipe.name}</h3>
                          <button onClick={() => toggleSaved(m.recipe.id)}
                            aria-label={isSaved ? "Unsave" : "Save recipe"}
                            className={cn("size-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                              isSaved ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground hover:text-danger")}>
                            <Heart className={cn("size-4", isSaved && "fill-current")} />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3.5" /> {m.recipe.prep_time_minutes} min
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize text-muted-foreground font-medium">
                            {m.recipe.cooking_goal[0] ?? "Easy"}
                          </span>
                          {pct >= 80 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              High Protein
                            </span>
                          )}
                        </div>

                        {/* Uses your ingredients */}
                        <div className="mb-3">
                          <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                            Uses {m.matchedRequired.length} ingredients you have
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {m.matchedRequired.slice(0, 5).map((name) => {
                              const itm = items.find((i) => canonicalName(i) === name);
                              return (
                                <div key={name} className="flex flex-col items-center gap-1">
                                  <div className="size-10 rounded-full bg-surface-warm flex items-center justify-center text-lg">
                                    {itm?.emoji ?? "🌿"}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground max-w-[44px] text-center leading-tight truncate">{name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Also needed */}
                        {m.missingIngredients.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                              You'll also need (Optional)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {m.missingIngredients.slice(0, 4).map((name) => (
                                <div key={name} className="flex flex-col items-center gap-1">
                                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-lg">🌿</div>
                                  <span className="text-[10px] text-muted-foreground max-w-[44px] text-center leading-tight truncate">{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {m.unusedSelected.length > 0 && (
                          <div className="mb-3 bg-muted/50 rounded-xl px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">Not in this recipe</p>
                            <p className="text-xs text-foreground">{m.unusedSelected.join(", ")}</p>
                          </div>
                        )}

                        {m.expiringUsedCount > 0 && (
                          <div className="mb-3 bg-danger/8 rounded-xl px-3 py-2 flex items-center gap-2">
                            <Flame className="size-3.5 text-danger shrink-0" />
                            <p className="text-xs text-danger font-semibold">Uses {m.expiringUsedCount} expiring ingredient{m.expiringUsedCount !== 1 ? "s" : ""}</p>
                          </div>
                        )}

                        <button
                          onClick={() => setOpenRecipe(isOpen ? null : m.recipe.id)}
                          className="w-full py-2.5 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {isOpen ? "Hide" : "View Full Recipe"}
                          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                        </button>

                        <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0")}>
                          <ol className="space-y-2 text-sm text-foreground/90 list-decimal list-inside bg-surface-warm rounded-xl p-3">
                            {m.recipe.instructions.map((s, i) => (
                              <li key={i} className="leading-relaxed">{s}</li>
                            ))}
                          </ol>
                          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                            <Sparkles className="size-3" /> Equipment: {m.recipe.equipment_needed.join(", ")}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {results.dietaryHidden > 0 && (
                  <button onClick={() => setShowAll((s) => !s)} className="w-full text-xs text-muted-foreground py-3 hover:text-foreground">
                    {showAll ? "Hide diet-conflicting recipes" : `Show all (${results.dietaryHidden} hidden by diet)`}
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
