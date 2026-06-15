import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, Trash2, Sparkles, ChefHat, Clock, BookOpen, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, updateProfile } from "@/lib/profile-store";
import { useSavedRecipes, toggleSaved } from "@/lib/saved-recipes-store";
import {
  EQUIPMENT_OPTIONS, DIETARY_OPTIONS,
  type EquipmentKey, type DietaryTag,
} from "@/lib/preferences-data";
import type { CookingGoal, Recipe } from "@/lib/recipes-data";
import { RECIPES } from "@/lib/recipes-data";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingSheet } from "@/components/OnboardingSheet";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

const GOALS: { key: CookingGoal; label: string; emoji: string }[] = [
  { key: "snack", label: "Snack", emoji: "🥨" },
  { key: "healthy", label: "Healthy", emoji: "🥗" },
  { key: "filling", label: "Filling", emoji: "🍛" },
  { key: "quick", label: "Quick", emoji: "⚡" },
];

function ProfilePage() {
  const { profile } = useProfile();
  const saved = useSavedRecipes();
  const navigate = useNavigate();
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  if (!profile) {
    return (
      <div className="px-5 pt-12 text-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  const equipment = new Set<EquipmentKey>(profile.equipment);
  const dietary = new Set<DietaryTag>(profile.dietary_preferences);
  const goals = new Set<CookingGoal>(profile.default_cooking_goals);

  function toggleEquipment(k: EquipmentKey) {
    const n = new Set(equipment);
    n.has(k) ? n.delete(k) : n.add(k);
    updateProfile({ equipment: [...n] as any });
  }
  function toggleDietary(d: DietaryTag) {
    const n = new Set(dietary);
    if (d === "No Preference") { updateProfile({ dietary_preferences: ["No Preference"] }); return; }
    n.delete("No Preference");
    n.has(d) ? n.delete(d) : n.add(d);
    if (n.size === 0) n.add("No Preference");
    updateProfile({ dietary_preferences: [...n] as any });
  }
  function toggleGoal(g: CookingGoal) {
    const n = new Set(goals);
    n.has(g) ? n.delete(g) : n.add(g);
    updateProfile({ default_cooking_goals: [...n] as any });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function deleteAccount() {
    // Removes user data via cascades; sign out follows.
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("saved_recipes").delete().eq("user_id", u.user.id);
    await supabase.from("profiles").delete().eq("id", u.user.id);
    await supabase.auth.signOut();
    toast.success("Account data removed");
    navigate({ to: "/auth", replace: true });
  }

  const savedRecipes = RECIPES.filter((r) => saved.has(r.id));

  return (
    <div className="px-5 pt-8 pb-6 animate-in fade-in slide-in-from-right-2 duration-300">
      <header className="mb-6 flex items-center gap-4">
        <div className="size-14 rounded-full bg-gradient-to-br from-primary to-fresh flex items-center justify-center text-2xl">
          🥗
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold truncate">{profile.email ?? "You"}</h1>
          <p className="text-xs text-muted-foreground">PantryPal member</p>
        </div>
      </header>

      <Button onClick={() => setOnboardOpen(true)} variant="outline" className="w-full mb-6 rounded-2xl h-11">
        <Sparkles className="size-4 mr-2" /> Run quick setup
      </Button>

      {/* Equipment */}
      <Section title="Kitchen equipment" hint="Recipes that need missing gear are hidden.">
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map((e) => {
            const on = equipment.has(e.key);
            return (
              <button key={e.key} onClick={() => toggleEquipment(e.key)}
                className={cn("rounded-2xl p-3 border text-left flex items-center gap-2 transition-all",
                  on ? "bg-primary/10 border-primary" : "bg-card border-border text-muted-foreground")}>
                <span className="text-xl">{e.emoji}</span>
                <span className="text-xs font-semibold">{e.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Diet */}
      <Section title="Dietary preferences" hint="Restrictive tags hide non-matching recipes.">
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((d) => {
            const on = dietary.has(d);
            return (
              <button key={d} onClick={() => toggleDietary(d)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                {d}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Default goals */}
      <Section title="Default cooking goals" hint="Pre-fills the Recipes tab.">
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const on = goals.has(g.key);
            return (
              <button key={g.key} onClick={() => toggleGoal(g.key)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                <span className="mr-1">{g.emoji}</span>{g.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Default mode */}
      <Section title="Default mode" hint="">
        <div className="flex gap-2 p-1 bg-muted rounded-full">
          {(["strict", "flexible"] as const).map((m) => (
            <button key={m}
              onClick={() => updateProfile({ default_mode: m })}
              className={cn("flex-1 py-2 text-xs font-semibold rounded-full capitalize",
                profile.default_mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {m}
            </button>
          ))}
        </div>
      </Section>

      {/* Saved recipes */}
      <Section title="Saved recipes" hint={`${savedRecipes.length} saved`}>
        {savedRecipes.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border border-dashed">
            <BookOpen className="size-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Tap the heart on any recipe to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedRecipes.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
                <button
                  onClick={() => setOpenRecipe(r)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className="size-11 rounded-xl bg-surface-warm flex items-center justify-center text-xl flex-shrink-0">
                    {r.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" />{r.prep_time_minutes}m</span>
                      <span className="capitalize">{r.cooking_goal.join(" · ")}</span>
                    </p>
                  </div>
                </button>
                <button onClick={() => toggleSaved(r.id)} aria-label="Remove"
                  className="size-8 rounded-full bg-muted hover:bg-danger/10 flex items-center justify-center">
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Account */}
      <Section title="Account" hint="">
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          <div className="p-4 text-sm">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium truncate">{profile.email ?? "—"}</p>
          </div>
          <button onClick={signOut}
            className="w-full p-4 flex items-center gap-3 text-sm font-medium hover:bg-muted/40">
            <LogOut className="size-4" /> Sign out
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full p-4 flex items-center gap-3 text-sm font-medium text-danger hover:bg-danger/5">
                <Trash2 className="size-4" /> Delete account
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your profile and saved recipes. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount} className="bg-danger text-danger-foreground hover:bg-danger/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Section>

      <OnboardingSheet open={onboardOpen} onOpenChange={setOnboardOpen} profile={profile} />

      <Dialog open={!!openRecipe} onOpenChange={(o) => !o && setOpenRecipe(null)}>
        <DialogContent className="rounded-3xl max-h-[85vh] overflow-y-auto">
          {openRecipe && (
            <>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{openRecipe.emoji}</span> {openRecipe.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1"><Clock className="size-3" />{openRecipe.prep_time_minutes}m</span>
                <span><ChefHat className="size-3 inline mr-1" />{openRecipe.equipment_needed.join(", ")}</span>
              </DialogDescription>
              <div className="mt-2">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">Ingredients</p>
                <p className="text-sm">{openRecipe.required_ingredients.join(", ")}{openRecipe.optional_ingredients.length ? `, (opt) ${openRecipe.optional_ingredients.join(", ")}` : ""}</p>
              </div>
              <ol className="space-y-2 text-sm list-decimal list-inside bg-surface-warm rounded-xl p-3 mt-3">
                {openRecipe.instructions.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <Button onClick={() => { toggleSaved(openRecipe.id); setOpenRecipe(null); }}
                variant="outline" className="mt-3 w-full rounded-xl">
                <Heart className="size-4 mr-2 fill-current" /> Remove from saved
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{title}</p>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}