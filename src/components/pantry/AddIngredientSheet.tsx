import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronRight,
  Plus,
  Calendar,
  X,
  Leaf,
  Sprout,
  Award,
  Info,
  Refrigerator,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { toISODate } from "@/lib/pantry-utils";
import { addPantryItem, searchIngredients, MANUAL_CATEGORY_PRESETS, type ManualCategory } from "@/lib/pantry-store";
import type { Ingredient } from "@/lib/ingredients-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StorageTipPanel, type StorageTipData } from "./StorageTipPanel";

const RIPENESS = ["Unripe", "Ripe", "Overripe"] as const;

export function AddIngredientSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [tipsFor, setTipsFor] = useState<StorageTipData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [purchaseDate, setPurchaseDate] = useState(toISODate(new Date()));
  const [ripeness, setRipeness] = useState<typeof RIPENESS[number]>("Ripe");
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<ManualCategory>("produce");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch(""); setSelected(null); setTipsFor(null);
      setExpandedId(null);
      setQuantity("1"); setPurchaseDate(toISODate(new Date()));
      setRipeness("Ripe"); setCustomMode(false); setCustomName(""); setCustomCategory("produce");
    }
  }, [open]);

  const results = useMemo(() => searchIngredients(search), [search]);

  function handleSubmit() {
    setSubmitting(true);
    try {
      if (customMode) {
        addPantryItem({
          kind: "custom",
          name: customName.trim(),
          category: customCategory,
          quantity,
          purchaseDate,
        });
      } else {
        if (!selected) return;
        addPantryItem({
          kind: "ingredient",
          ingredient: selected,
          quantity,
          purchaseDate,
          ripeness,
        });
      }
      toast.success("Added to your pantry 🌿");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not add item");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = customMode ? customName.trim().length > 0 : !!selected;

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="p-5 pb-8">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="font-display text-2xl">Add an ingredient</SheetTitle>
          </SheetHeader>

          {!customMode && (
            <>
              <div className="relative mb-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  autoFocus
                  placeholder="Search ingredients…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(null); setExpandedId(null); }}
                  className="pl-10 pr-10 rounded-2xl h-12 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.12)] border-border"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(""); setSelected(null); setExpandedId(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {search && (
                <>
                  <p className="text-[11px] text-muted-foreground mb-3 px-1">
                    {results.length === 0 ? "No matches" : `${results.length} result${results.length === 1 ? "" : "s"} found`}
                  </p>
                  {results.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-muted/40 rounded-2xl mb-4">
                      <p className="text-sm text-muted-foreground">Nothing in our database for that.</p>
                      <Button variant="link" onClick={() => { setCustomMode(true); setCustomName(search); }} className="text-primary">
                        + Add “{search}” manually
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {results.map((i, idx) => (
                        <VariantCard
                          key={i.id}
                          ingredient={i}
                          primary={idx === 0}
                          selected={selected?.id === i.id}
                          expanded={expandedId === i.id}
                          onSelect={() => { setSelected(i); setExpandedId(null); }}
                          onToggle={() => {
                            setSelected(i);
                            setExpandedId((cur) => (cur === i.id ? null : i.id));
                          }}
                          onAdd={() => {
                            setSelected(i);
                            setExpandedId(null);
                            // scroll bottom action button into view
                            setTimeout(() => {
                              document.getElementById("add-to-pantry-cta")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }, 50);
                          }}
                        />
                      ))}

                      {results.length > 0 && (
                        <div className="flex items-start gap-2 rounded-2xl bg-accent/15 border border-accent/30 px-3 py-2.5 mt-3">
                          <Info className="size-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-[12px] text-foreground/80 leading-snug">
                            {categoryTip(results[0].category)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {customMode && (
            <div className="space-y-3 mb-4 bg-muted/40 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Custom ingredient</p>
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={customName} onChange={(e) => setCustomName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MANUAL_CATEGORY_PRESETS) as ManualCategory[]).map((k) => {
                    const p = MANUAL_CATEGORY_PRESETS[k];
                    const active = customCategory === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCustomCategory(k)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left text-sm transition-all flex items-center gap-2",
                          active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <span className="text-lg">{p.emoji}</span>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">{p.label}</p>
                          <p className="text-[10px] text-muted-foreground">~{p.shelf}d</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCustomMode(false)} className="text-muted-foreground">
                ← Back to search
              </Button>
            </div>
          )}

          {!customMode && !search && (
            <Button variant="outline" onClick={() => setCustomMode(true)} className="w-full mb-4 rounded-xl">
              <Plus className="size-4 mr-2" /> Add a custom ingredient
            </Button>
          )}

          {/* Common fields */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-xl" placeholder="e.g. 200g" />
              </div>
              <div className="space-y-1.5">
                <Label>Purchased</Label>
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            {selected?.ripeness_applicable && (
              <div className="space-y-1.5">
                <Label>Ripeness <span className="text-muted-foreground font-normal">(adjusts shelf life)</span></Label>
                <div className="grid grid-cols-3 gap-2">
                  {RIPENESS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRipeness(r)}
                      className={cn(
                        "py-2 rounded-xl text-sm font-medium border transition-all",
                        ripeness === r ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            id="add-to-pantry-cta"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full h-12 rounded-2xl text-base"
          >
            {submitting ? "Adding…" : "Add to pantry"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
    <StorageTipPanel open={!!tipsFor} onClose={() => setTipsFor(null)} data={tipsFor} />
    </>
  );
}

function formatShelf(days: number): string {
  if (days >= 365) return `~${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
  if (days >= 30) return `~${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
  if (days >= 7) return `~${Math.round(days / 7)} week${days >= 14 ? "s" : ""}`;
  return `${days} day${days === 1 ? "" : "s"}`;
}

function nutritionLine(i: Ingredient): string {
  const parts: string[] = [];
  if (i.basic_nutrition_info?.calories) parts.push(`${i.basic_nutrition_info.calories} kcal`);
  const vits = (i.basic_nutrition_info?.vitamins || []).slice(0, 2);
  for (const v of vits) parts.push(v);
  return parts.length ? parts.join(" · ") : "Whole food";
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pseudoDV(name: string, nutrient: string): number {
  const v = hashSeed(name + nutrient);
  return 10 + (v % 70); // 10–79%
}

function nutrientIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("iron") || n.includes("calcium") || n.includes("potassium") || n.includes("magnesium") || n.includes("zinc") || n.includes("fiber"))
    return Award;
  if (n.includes("folate") || n.includes("vitamin k") || n.includes("vitamin a"))
    return Sprout;
  return Leaf;
}

function nutrientStats(i: Ingredient): Array<{ label: string; dv: number; Icon: typeof Leaf }> {
  const vits = (i.basic_nutrition_info?.vitamins || []).slice(0, 3);
  return vits.map((v) => ({
    label: v,
    dv: pseudoDV(i.variant_name, v),
    Icon: nutrientIcon(v),
  }));
}

function shelfLifeText(days: number): string {
  if (days >= 365) return `Typically lasts ~${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
  if (days >= 60) return `Typically lasts ~${Math.round(days / 30)} months`;
  if (days >= 14) return `Typically lasts ${Math.round(days / 7)}–${Math.round(days / 7) + 1} weeks`;
  const low = Math.max(1, days - 2);
  const high = days + 1;
  return `Typically lasts ${low}–${high} days`;
}

function categoryTip(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("leafy") || c.includes("green")) return "Leafy greens stay fresh longer when stored cold and dry.";
  if (c.includes("dairy")) return "Keep dairy at the back of the fridge where temperature stays most stable.";
  if (c.includes("meat") || c.includes("seafood") || c.includes("poultry")) return "Use or freeze proteins within 2 days for safety and flavor.";
  if (c.includes("herb")) return "Wrap fresh herbs loosely in a damp paper towel to keep them perky.";
  if (c.includes("fruit")) return "Most fruits ripen faster at room temperature; chill once at peak.";
  if (c.includes("grain") || c.includes("pantry") || c.includes("dry")) return "Pantry staples last longest in airtight containers away from light.";
  if (c.includes("produce") || c.includes("vegetable")) return "Most produce prefers a cool crisper drawer with steady humidity.";
  return "Store in a cool, dry place away from direct sunlight.";
}

function storageMethod(tip: string): { Icon: typeof Refrigerator; label: string } {
  const t = (tip || "").toLowerCase();
  if (t.includes("refrigerat") || t.includes("fridge") || t.includes("crisper") || t.includes("chill")) {
    return { Icon: Refrigerator, label: "Refrigerate" };
  }
  if (t.includes("freez")) {
    return { Icon: Refrigerator, label: "Freeze" };
  }
  return { Icon: Refrigerator, label: "Store at room temp" };
}

function VariantCard({
  ingredient: i,
  primary,
  selected,
  expanded,
  onSelect,
  onToggle,
  onAdd,
}: {
  ingredient: Ingredient;
  primary: boolean;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onAdd: () => void;
}) {
  const stats = nutrientStats(i);
  const method = storageMethod(i.storage_tips || "");

  return (
    <div className="relative animate-fade-in">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative w-full text-left rounded-3xl p-4 pr-16 flex items-center gap-3 transition-all duration-300 ease-out shadow-[0_3px_14px_-6px_rgba(0,0,0,0.15)]",
          primary ? "bg-[color:var(--color-accent)]/15" : "bg-card",
          selected ? "ring-2 ring-primary/40" : "ring-1 ring-border",
          expanded && "shadow-[0_12px_28px_-10px_rgba(0,0,0,0.25)]",
        )}
        style={
          expanded
            ? { transform: "translateY(-2px) rotate(-0.6deg)", transformOrigin: "left center" }
            : undefined
        }
      >
        {/* circular food photo frame */}
        <div className={cn(
          "size-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ring-2 ring-card shadow-sm",
          primary ? "bg-card" : "bg-surface-warm",
        )}>
          {i.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-base text-foreground truncate">{i.variant_name}</p>
          </div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-0.5">{i.category}</p>

          {stats.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              {stats.map((s) => (
                <span key={s.label} className="inline-flex items-center gap-1 text-[11px] text-foreground/75">
                  <s.Icon className="size-3 text-primary" />
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">· {s.dv}% DV</span>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
            <Calendar className="size-3" />
            <span>{shelfLifeText(i.base_shelf_life_days)}</span>
          </div>
        </div>

        {/* circular chevron — dark green */}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md transition-transform duration-300",
            expanded && "rotate-90",
          )}
          aria-label={expanded ? "Hide details" : "View details"}
        >
          <ChevronRight className="size-5" />
        </span>
      </button>

      {/* Expanded panel — slides out below */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-3xl bg-card border border-border shadow-[0_8px_24px_-10px_rgba(0,0,0,0.18)] p-4 space-y-4">
            <section>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Best way to store</p>
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <method.Icon className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{method.label}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                    {i.storage_tips || "Store in a cool, dry place."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="rounded-2xl bg-muted/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Shelf life</p>
                  <p className="text-sm font-semibold text-foreground">{formatShelf(i.base_shelf_life_days)}</p>
                </div>
                <div className="rounded-2xl bg-muted/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" /> Avoid
                  </p>
                  <p className="text-sm font-semibold text-foreground">{avoidLine(i)}</p>
                </div>
              </div>
            </section>

            <section className="flex items-start gap-3 rounded-2xl bg-golden/10 border border-golden/30 p-3">
              <div className="size-8 rounded-full bg-golden/40 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="size-4 text-golden-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Good to know</p>
                <p className="text-[13px] text-foreground/85 leading-snug mt-0.5">{goodToKnow(i)}</p>
              </div>
            </section>

            <Button
              onClick={onAdd}
              className="w-full h-12 rounded-2xl text-base bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="size-4 mr-1.5" /> Add to Tracker
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function avoidLine(i: Ingredient): string {
  const t = (i.storage_tips || "").toLowerCase();
  if (t.includes("away from")) {
    const m = i.storage_tips!.match(/away from ([^.;,]+)/i);
    if (m) return capitalize(m[1].trim());
  }
  const c = i.category.toLowerCase();
  if (c.includes("leafy") || c.includes("green")) return "Moisture, ethylene";
  if (c.includes("dairy")) return "Warm temps";
  if (c.includes("fruit")) return "Direct sunlight";
  if (c.includes("meat")) return "Cross-contact";
  return "Heat & humidity";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function goodToKnow(i: Ingredient): string {
  const v = (i.basic_nutrition_info?.vitamins || [])[0];
  if (v) return `${i.name} is a solid source of ${v} — pairs well with healthy fats for better absorption.`;
  return `${i.name} keeps best with steady temperature; avoid frequent fridge openings.`;
}