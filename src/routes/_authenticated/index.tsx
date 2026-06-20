import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { usePantry, removePantryItem, type PantryItem } from "@/lib/pantry-store";
import { canonicalName, matchRecipesDetailed } from "@/lib/recipe-matcher";
import { StorageTipPanel, type StorageTipData } from "@/components/pantry/StorageTipPanel";
import { computeCountdown } from "@/lib/pantry-utils";
import { useProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";
import { Bell, User, Plus, ChefHat, ScanLine, ShoppingCart, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function useAttentionItems(items: PantryItem[]) {
  return useMemo(() =>
    items
      .map((it) => ({ it, info: computeCountdown({ purchaseDate: it.purchase_date, shelfLifeDays: it.shelf_life_days, optimalStart: it.optimal_window_start_day, optimalEnd: it.optimal_window_end_day }) }))
      .filter(({ info }) => info.daysRemaining <= 3 && info.daysRemaining > 0)
      .sort((a, b) => a.info.daysRemaining - b.info.daysRemaining)
  , [items]);
}

function useGoldenItems(items: PantryItem[]) {
  return useMemo(() =>
    items
      .map((it) => ({ it, info: computeCountdown({ purchaseDate: it.purchase_date, shelfLifeDays: it.shelf_life_days, optimalStart: it.optimal_window_start_day, optimalEnd: it.optimal_window_end_day }) }))
      .filter(({ info }) => info.status === "golden")
      .slice(0, 4)
  , [items]);
}

function urgencyColor(daysRemaining: number) {
  if (daysRemaining <= 1) return { bar: "#D93025", text: "text-red-600", label: `${daysRemaining} day left` };
  if (daysRemaining <= 2) return { bar: "#E8780C", text: "text-orange-500", label: `${daysRemaining} days left` };
  return { bar: "#E8A50C", text: "text-yellow-600", label: `${daysRemaining} days left` };
}

// Mini horizontal progress bar used in attention cards
function MiniBar({ pctRemaining, color }: { pctRemaining: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(4, pctRemaining)}%`, background: color }}
      />
    </div>
  );
}

// Thin row progress bar for pantry list style
function RowBar({ pctRemaining, color }: { pctRemaining: number; color: string }) {
  return (
    <div className="h-1 rounded-full bg-gray-100 flex-1 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(4, pctRemaining)}%`, background: color }}
      />
    </div>
  );
}

function AttentionCard({ it, info, onClick }: { it: PantryItem; info: ReturnType<typeof computeCountdown>; onClick: () => void }) {
  const c = urgencyColor(info.daysRemaining);
  return (
    <button onClick={onClick} className="bg-card rounded-2xl p-3 border border-border shadow-sm text-left min-w-[130px] shrink-0 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{it.emoji}</div>
      <p className="text-sm font-semibold text-foreground leading-tight truncate">{it.display_name}</p>
      <p className={cn("text-xs font-medium mt-0.5", c.text)}>{c.label}</p>
      <MiniBar pctRemaining={info.pctRemaining} color={c.bar} />
      <p className="text-[10px] text-muted-foreground mt-1">
        Use by {new Date(new Date(it.purchase_date).getTime() + it.shelf_life_days * 86400000).toLocaleDateString("en", { day: "numeric", month: "short" })}
      </p>
    </button>
  );
}

function GoldenCard({ it, info, onClick }: { it: PantryItem; info: ReturnType<typeof computeCountdown>; onClick: () => void }) {
  const expiryDate = new Date(new Date(it.purchase_date).getTime() + it.shelf_life_days * 86400000);
  const goldenEnd = new Date(new Date(it.purchase_date).getTime() + it.optimal_window_end_day * 86400000);
  const today = new Date();
  const todayStr = today.toLocaleDateString("en", { day: "numeric", month: "short" });
  const endStr = goldenEnd.toLocaleDateString("en", { day: "numeric", month: "short" });
  const isTodayEnd = goldenEnd.toDateString() === expiryDate.toDateString();
  void isTodayEnd;

  return (
    <button onClick={onClick} className="bg-card rounded-2xl p-3 border border-border shadow-sm text-left min-w-[130px] shrink-0 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{it.emoji}</div>
      <p className="text-sm font-semibold text-foreground leading-tight truncate">{it.display_name}</p>
      <p className="text-xs font-medium text-primary mt-0.5">Best between</p>
      <p className="text-[11px] text-primary font-semibold">{todayStr} – {endStr}</p>
      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.95 0.03 85)" }}>
        <div className="h-full rounded-full" style={{ width: `${info.pctRemaining}%`, background: "oklch(0.81 0.17 85)" }} />
      </div>
    </button>
  );
}

const QUICK_ACTIONS = [
  { icon: Plus, label: "Add Ingredient", color: "bg-primary/10 text-primary", action: "add" },
  { icon: ChefHat, label: "Find Recipes", color: "bg-accent/10 text-accent", action: "recipes" },
  { icon: ScanLine, label: "Scan Receipt", color: "bg-golden/15 text-amber-700", action: "scan" },
  { icon: ShoppingCart, label: "Shopping List", color: "bg-blue-50 text-blue-600", action: "shopping" },
] as const;

function HomePage() {
  const navigate = useNavigate();
  const ctx = useRouteContext({ from: "/_authenticated" });
  const items = usePantry();
  const { profile } = useProfile();
  const [tipsData, setTipsData] = useState<StorageTipData | null>(null);

  const attention = useAttentionItems(items);
  const goldenItems = useGoldenItems(items);

  // Smart suggestion: find a recipe using expiring/golden items
  const suggestion = useMemo(() => {
    if (!profile || items.length === 0) return null;
    const urgentIds = attention.map((a) => a.it.id);
    const goldenIds = goldenItems.map((g) => g.it.id);
    const targetIds = [...new Set([...urgentIds, ...goldenIds])];
    if (targetIds.length === 0) return null;
    const names = items.filter((it) => targetIds.includes(it.id)).map(canonicalName);
    if (names.length === 0) return null;
    const r = matchRecipesDetailed({
      selectedNames: names,
      expiringNames: attention.map((a) => canonicalName(a.it)),
      pantryNames: items.map(canonicalName),
      goals: [],
      mode: "flexible",
      equipment: profile.equipment,
      dietary: profile.dietary_preferences,
      showAll: false,
    });
    if (!r.matches[0]) return null;
    return { match: r.matches[0], names };
  }, [items, attention, goldenItems, profile]);

  function openTips(it: PantryItem) {
    setTipsData({
      name: it.display_name, emoji: it.emoji, category: it.category ?? null,
      storage_tips: it.storage_tips, shelf_life_days: it.shelf_life_days,
      optimal_window_start_day: it.optimal_window_start_day,
      optimal_window_end_day: it.optimal_window_end_day,
      isCustom: !it.ingredient_id,
    });
  }

  const email = ctx.user?.email ?? "";
  const firstName = email.split("@")[0] ?? "there";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-5 py-4 flex items-center justify-between md:px-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Here's what's happening in your kitchen today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative size-9 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
            <Bell className="size-4.5 text-muted-foreground" />
            {attention.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-danger text-[9px] font-bold text-white flex items-center justify-center">
                {attention.length}
              </span>
            )}
          </button>
          <div className="size-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {displayName.charAt(0)}
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-7 md:px-8">
        {/* Items Needing Attention */}
        {attention.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-foreground">Items Needing Attention</h2>
              <button
                onClick={() => navigate({ to: "/pantry" })}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {attention.map(({ it, info }) => (
                <AttentionCard key={it.id} it={it} info={info} onClick={() => openTips(it)} />
              ))}
            </div>
          </section>
        )}

        {/* Ideal to Consume Now */}
        {goldenItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-foreground">Ideal to Consume Now</h2>
              <button
                onClick={() => navigate({ to: "/pantry" })}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {goldenItems.map(({ it, info }) => (
                <GoldenCard key={it.id} it={it} info={info} onClick={() => openTips(it)} />
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="font-bold text-base text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => {
                    if (a.action === "add") navigate({ to: "/pantry", search: { add: 1 } as any });
                    else if (a.action === "recipes") navigate({ to: "/recipes" });
                  }}
                  className="flex flex-col items-center gap-2 py-3 px-1 bg-card rounded-2xl border border-border hover:shadow-md transition-all text-center"
                >
                  <div className={cn("size-11 rounded-xl flex items-center justify-center", a.color)}>
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground leading-tight">{a.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Smart Suggestions */}
        {suggestion && (
          <section>
            <h2 className="font-bold text-base text-foreground mb-3">Smart Suggestions</h2>
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 shadow-sm">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {suggestion.match.recipe.ingredientsCount ?? suggestion.match.matchedRequired.length} Recipes can help you use
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {suggestion.names.slice(0, 3).join(", ")}
                </p>
                <button
                  onClick={() => navigate({ to: "/recipes", search: { useUp: suggestion.names[0] } as any })}
                  className="mt-2 text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  See Recipes <ChevronRight className="size-3.5" />
                </button>
              </div>
              <div className="size-20 rounded-xl bg-surface-warm flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                {suggestion.match.recipe.emoji}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16 px-6 bg-card rounded-2xl border border-dashed border-border">
            <div className="text-5xl mb-4">🧺</div>
            <p className="font-bold text-foreground text-lg">Your kitchen is empty</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">Add ingredients to start tracking freshness.</p>
            <button
              onClick={() => navigate({ to: "/pantry", search: { add: 1 } as any })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" /> Add Ingredient
            </button>
          </div>
        )}

        {/* How it works */}
        {items.length === 0 && (
          <section>
            <h2 className="font-bold text-base text-foreground mb-4">How It Works</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { num: "1", title: "Add Ingredients", desc: "Add what you have in your kitchen", emoji: "🧺" },
                { num: "2", title: "We Track Freshness", desc: "We calculate expiry & ideal consumption windows", emoji: "📅" },
                { num: "3", title: "Get Recipe Ideas", desc: "We suggest the best recipes to reduce waste", emoji: "🍲" },
                { num: "4", title: "Cook & Save", desc: "Save money, eat better, waste less", emoji: "🌍" },
              ].map((s) => (
                <div key={s.num} className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm">
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <p className="text-xs font-bold text-primary mb-1">{s.num}. {s.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <StorageTipPanel open={!!tipsData} onClose={() => setTipsData(null)} data={tipsData} />
    </div>
  );
}
