import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Power } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/shared";
import { apiGet, apiPatch } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useMe } from "@/lib/hooks";
import type { OfficeActive, OfficeSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Platform admin: every registered office, with suspend / reactivate. */
export default function PlatformPage() {
  const { t, fmtDate } = useI18n();
  const qc = useQueryClient();
  const me = useMe();
  const q = useQuery({ queryKey: ["platform-offices"], queryFn: () => apiGet<OfficeSummary[]>("/platform/offices") });
  const toggle = useMutation({
    mutationFn: (o: OfficeSummary) => apiPatch<OfficeSummary>(`/platform/offices/${o.id}`, { active: !o.active } satisfies OfficeActive),
    onSuccess: (o) => { qc.invalidateQueries({ queryKey: ["platform-offices"] }); toast.success(o.active ? t("أُعيد تفعيل المكتب", "Office reactivated") : t("أُوقف المكتب", "Office suspended")); },
    onError: () => toast.error(t("تعذر التحديث", "Could not update")),
  });
  const offices = q.data ?? [];
  const active = offices.filter((o) => o.active).length;
  return (
    <div>
      <PageHeader title={t("إدارة المنصة", "Platform admin")} subtitle={t("{n} مكتب مسجل · {a} مفعّل", "{n} offices · {a} active", { n: String(offices.length), a: String(active) })} />
      {offices.length === 0 ? <EmptyState title={t("لا مكاتب بعد", "No offices yet")} /> : (
        <ul className="grid gap-3 md:grid-cols-2" data-testid="platform-offices-list">
          {offices.map((o) => (
            <li key={o.id} className={cn("rounded-2xl border bg-card p-5 transition-opacity", !o.active && "opacity-70")} data-testid="platform-office-row">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-[#E6C766]"><Building2 className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold" data-testid="platform-office-name">{o.name}</h3>
                    {o.id === me.data?.office_id && <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[11px] text-[#7A5F14]">{t("مكتبك", "Your office")}</span>}
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", o.active ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")} data-testid="platform-office-status">{o.active ? t("مفعّل", "Active") : t("موقوف", "Suspended")}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground" dir="ltr">{o.owner_email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("سُجّل في", "Registered")} {fmtDate(o.created_at.slice(0, 10))}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span data-testid="platform-office-users"><b>{o.users}</b> {t("مستخدم", "users")}</span>
                <span><b>{o.clients}</b> {t("موكل", "clients")}</span>
                <span><b>{o.cases}</b> {t("ملف", "cases")}</span>
                {o.id !== me.data?.office_id && (
                  <Button size="sm" variant={o.active ? "outline" : "default"} className={cn("ms-auto", o.active && "text-destructive")} disabled={toggle.isPending}
                    onClick={() => { if (!o.active || confirm(t("إيقاف هذا المكتب؟ سيُمنع كل أعضائه من الدخول.", "Suspend this office? All its members will be signed out."))) toggle.mutate(o); }} data-testid="platform-office-toggle-button">
                    <Power className="size-4" />{o.active ? t("إيقاف", "Suspend") : t("تفعيل", "Reactivate")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
