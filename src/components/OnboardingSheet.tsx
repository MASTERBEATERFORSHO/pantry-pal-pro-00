import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  EQUIPMENT_OPTIONS, DIETARY_OPTIONS, DEFAULT_EQUIPMENT,
  type EquipmentKey, type DietaryTag,
} from "@/lib/preferences-data";
import { updateProfile, type Profile } from "@/lib/profile-store";
import type { CookingGoal } from "@/lib/recipes-data";
import { toast } from "sonner";

const GOALS: { key: CookingGoal; label: string; emoji: string }[] = [
  { key: "snack", label: "Snack", emoji: "🥨" },
  { key: "healthy", label: "Healthy", emoji: "🥗" },
  { key: "filling", label: "Filling", emoji: "🍛" },
  { key: "quick", label: "Quick", emoji: "⚡" },
];

export function OnboardingSheet({
  open, onOpenChange, profile,
}: { open: boolean; onOpenChange: (b: boolean) => void; profile: Profile | null }) {
  const [step, setStep] = useState(0);
  const [equipment, setEquipment] = useState<Set<EquipmentKey>>(
    new Set(profile?.equipment ?? DEFAULT_EQUIPMENT),
  );
  const [dietary, setDietary] = useState<Set<DietaryTag>>(
    new Set(profile?.dietary_preferences ?? ["No Preference"]),
  );
  const [goals, setGoals] = useState<Set<CookingGoal>>(
    new Set(profile?.default_cooking_goals ?? []),
  );
  const [mode, setMode] = useState<"strict" | "flexible">(profile?.default_mode ?? "flexible");

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const n = new Set(set);
    n.has(value) ? n.delete(value) : n.add(value);
    setter(n);
  }

  async function save(close = true) {
    await updateProfile({
      equipment: [...equipment],
      dietary_preferences: dietary.size ? [...dietary] : ["No Preference"],
      default_cooking_goals: [...goals],
      default_mode: mode,
    });
    toast.success("Saved your preferences");
    if (close) onOpenChange(false);
  }

  function nextOrFinish() {
    if (step < 2) setStep(step + 1);
    else save();
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStep(0); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <SheetTitle className="sr-only">Onboarding</SheetTitle>
        <SheetDescription className="sr-only">Set up your kitchen preferences</SheetDescription>

        <div className="flex gap-1.5 mb-4 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all",
              i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">What's in your kitchen?</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5">Pick what you have. We'll filter recipes to match.</p>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((e) => {
                const on = equipment.has(e.key);
                return (
                  <button key={e.key}
                    onClick={() => toggleSet(equipment, e.key, setEquipment)}
                    className={cn("rounded-2xl p-3 border text-left transition-all flex items-center gap-2",
                      on ? "bg-primary/10 border-primary text-foreground" : "bg-card border-border text-muted-foreground")}>
                    <span className="text-xl">{e.emoji}</span>
                    <span className="text-xs font-semibold">{e.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">How do you like to eat?</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5">Dietary preferences and default cooking goals.</p>

            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">Diet</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {DIETARY_OPTIONS.map((d) => {
                const on = dietary.has(d);
                return (
                  <button key={d}
                    onClick={() => {
                      const n = new Set(dietary);
                      if (d === "No Preference") { setDietary(new Set(["No Preference"])); return; }
                      n.delete("No Preference");
                      n.has(d) ? n.delete(d) : n.add(d);
                      if (n.size === 0) n.add("No Preference");
                      setDietary(n);
                    }}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border",
                      on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                    {d}
                  </button>
                );
              })}
            </div>

            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">Default goals</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => {
                const on = goals.has(g.key);
                return (
                  <button key={g.key}
                    onClick={() => toggleSet(goals, g.key, setGoals)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border",
                      on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                    <span className="mr-1">{g.emoji}</span>{g.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">How do you want recipes?</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5">Set your default. You can change it any time.</p>
            {(["strict", "flexible"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn("w-full text-left p-4 rounded-2xl border mb-2 transition-all",
                  mode === m ? "bg-primary/10 border-primary" : "bg-card border-border")}>
                <p className="font-semibold capitalize">{m}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {m === "strict" ? "Only recipes you can make with your selected ingredients."
                    : "Includes recipes needing 1–2 extras or common staples."}
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-6 sticky bottom-0 bg-background pt-3">
          <Button variant="ghost" className="flex-1" onClick={() => save()}>Skip</Button>
          <Button className="flex-1" onClick={nextOrFinish}>
            {step < 2 ? "Next" : "Finish"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}