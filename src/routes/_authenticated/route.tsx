import { createFileRoute, Outlet, Link, useRouterState, redirect } from "@tanstack/react-router";
import { LayoutDashboard, ShoppingBasket, ChefHat, Calendar, User, Leaf, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const TABS = [
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/pantry", label: "My Pantry", icon: ShoppingBasket, exact: false },
  { to: "/recipes", label: "Recipes", icon: ChefHat, exact: false },
  { to: "/profile", label: "Profile", icon: User, exact: false },
] as const;

function AuthedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — visible on md+ */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="px-5 py-6 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="size-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-sidebar-foreground leading-tight">FreshChef</p>
            <p className="text-[11px] text-sidebar-foreground/60 leading-tight">Cook smart. Waste less.</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                {t.label}
              </Link>
            );
          })}
        </nav>

        {/* Notifications placeholder */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-all">
            <Bell className="size-4.5" />
            Alerts
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 md:pb-6">
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-border">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {TABS.slice(0, 2).map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{t.label === "My Pantry" ? "Pantry" : t.label}</span>
              </Link>
            );
          })}

          {/* Center FAB */}
          <Link
            to="/pantry"
            search={{ add: 1 } as any}
            className="flex flex-col items-center justify-center"
          >
            <div className="size-12 rounded-full bg-primary shadow-lg flex items-center justify-center -translate-y-3">
              <span className="text-primary-foreground text-2xl font-light leading-none">+</span>
            </div>
          </Link>

          {TABS.slice(2).map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
