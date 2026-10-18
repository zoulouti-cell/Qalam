import type { ReactNode } from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, CalendarDays, FileText, FolderOpen, LayoutDashboard, LogOut, Menu, Scale, Sparkles, Users, UserCog } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import LangToggle from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";
import { endSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

function Nav({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const { t } = useI18n();
  const items = [
    { to: "/", icon: LayoutDashboard, ar: "اللوحة الرئيسية", en: "Dashboard", id: "dashboard" },
    { to: "/clients", icon: Users, ar: "الموكلون", en: "Clients", id: "clients" },
    { to: "/cases", icon: FolderOpen, ar: "الملفات", en: "Cases", id: "cases" },
    { to: "/calendar", icon: CalendarDays, ar: "المواعيد والجلسات", en: "Calendar", id: "calendar" },
    { to: "/documents", icon: FileText, ar: "التحرير", en: "Documents", id: "documents" },
    { to: "/library", icon: BookOpen, ar: "المكتبة القانونية", en: "Legal library", id: "library" },
    { to: "/assistant", icon: Sparkles, ar: "المساعد الذكي", en: "AI assistant", id: "assistant" },
    ...(user.role === "admin" ? [{ to: "/team", icon: UserCog, ar: "الفريق", en: "Team", id: "team" }] : []),
  ];
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid size-10 place-items-center rounded-xl bg-[#FDBA74] text-ink"><Scale className="size-5" /></div>
        <div>
          <div className="text-lg font-bold leading-none">{t("مكتبي", "Maktabi")}</div>
          <div className="mt-1 text-xs text-stone-400">{t("إدارة مكتب المحاماة", "Law office manager")}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            onClick={onNavigate}
            data-testid={`nav-${it.id}-link`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-stone-300 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <it.icon className="size-[18px]" />
            {t(it.ar, it.en)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img src={user.picture} alt="" className="size-9 rounded-full" />
          ) : (
            <div className="grid size-9 place-items-center rounded-full bg-stone-700 text-sm">{(user.name || user.email)[0]?.toUpperCase()}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium" data-testid="current-user-name">{user.name || user.email}</div>
            <div className="text-xs text-stone-400">{user.role === "admin" ? t("مدير المكتب", "Admin") : t("عضو الفريق", "Team member")}</div>
          </div>
          <button
            onClick={() => void endSession()}
            className="rounded-md p-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
            title={t("تسجيل الخروج", "Sign out")}
            data-testid="logout-button"
          >
            <LogOut className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ user, children }: { user: User; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { lang } = useI18n();
  return (
    <div className="min-h-screen bg-paper">
      <aside className="no-print fixed inset-y-0 start-0 z-30 hidden w-64 lg:block">
        <Nav user={user} />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={lang === "ar" ? "right" : "left"} className="w-64 border-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Nav user={user} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:ps-64">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-paper/80 px-4 py-3 backdrop-blur-md sm:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} data-testid="mobile-menu-button">
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <LangToggle />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
