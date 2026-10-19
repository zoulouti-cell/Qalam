import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, Panel, Pick } from "@/components/shared";
import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { useMe, useTeam } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { InviteCode, Role, TeamInvite, User } from "@/lib/types";

export default function Team() {
  const { t, fmtDate } = useI18n();
  const qc = useQueryClient();
  const me = useMe();
  const team = useTeam();
  const [f, setF] = useState<TeamInvite>({ email: "", name: "", role: "member" });
  const roles = [{ value: "member", label: t("عضو الفريق", "Team member") }, { value: "admin", label: t("مدير", "Admin") }];
  const refresh = () => qc.invalidateQueries({ queryKey: ["team"] });

  const invite = useMutation({
    mutationFn: () => apiPost<User>("/team", f),
    onSuccess: () => { refresh(); setF({ email: "", name: "", role: "member" }); toast.success(t("أضيف العضو — يمكنه الآن الدخول بحساب Google", "Member added — they can now sign in with Google")); },
    onError: (e) => toast.error(e instanceof ApiError && e.status === 409 ? (e.body as { detail?: string } | null)?.detail === "email_in_other_office" ? t("هذا البريد مسجل في مكتب آخر", "This email belongs to another office") : t("هذا البريد مضاف مسبقاً", "Email already added") : t("بريد غير صالح", "Invalid email")),
  });
  const setRole = useMutation({ mutationFn: ({ id, role }: { id: string; role: Role }) => apiPatch<User>(`/team/${id}`, { role }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => apiDelete(`/team/${id}`), onSuccess: refresh });

  return (
    <div>
      <PageHeader title={t("الفريق", "Team")} subtitle={t("من يحق له الدخول إلى المكتب", "Who can access the office")} />
      <InviteCodePanel />
      <Panel className="mb-6">
        <form className="grid gap-3 sm:grid-cols-[1.4fr_1fr_180px_auto]" onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}>
          <Input type="email" required dir="ltr" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@gmail.com" data-testid="team-invite-email-input" />
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={t("الاسم (اختياري)", "Name (optional)")} data-testid="team-invite-name-input" />
          <Pick value={f.role} onChange={(v) => setF({ ...f, role: v as Role })} options={roles} testId="team-invite-role-select" />
          <Button type="submit" disabled={invite.isPending} data-testid="team-invite-submit-button"><UserPlus className="size-4" />{t("إضافة", "Add")}</Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">{t("أضف بريد العضو ليدخل مباشرة إلى مكتبك، أو أعطه رمز الدعوة أعلاه.", "Add the member's email so they land in your office, or give them the invite code above.")}</p>
      </Panel>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table data-testid="team-members-table">
          <TableHeader>
            <TableRow className="bg-warm/60">
              <TableHead className="text-start">{t("العضو", "Member")}</TableHead>
              <TableHead className="text-start">{t("الدور", "Role")}</TableHead>
              <TableHead className="text-start">{t("الحالة", "Status")}</TableHead>
              <TableHead className="text-start">{t("أضيف في", "Added")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(team.data ?? []).map((u) => {
              const self = u.user_id === me.data?.user_id;
              return (
                <TableRow key={u.user_id} data-testid="team-member-row">
                  <TableCell>
                    <div className="font-medium">{u.name || "—"}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">{u.email}</div>
                  </TableCell>
                  <TableCell className="w-44">
                    {self ? <span className="text-sm">{t("مدير (أنت)", "Admin (you)")}</span> : (
                      <Pick value={u.role} onChange={(v) => setRole.mutate({ id: u.user_id, role: v as Role })} options={roles} testId="team-member-role-select" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={u.active ? "text-[#166534]" : "text-[#854D0E]"}>{u.active ? t("نشط", "Active") : t("لم يسجل الدخول بعد", "Not signed in yet")}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(u.created_at)}</TableCell>
                  <TableCell>
                    {!self && (
                      <Button variant="ghost" size="icon-sm" onClick={() => { if (confirm(t("إزالة هذا العضو؟", "Remove this member?"))) remove.mutate(u.user_id); }} data-testid="team-member-remove-button">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InviteCodePanel() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["invite-code"], queryFn: () => apiGet<InviteCode>("/team/invite-code") });
  const rotate = useMutation({ mutationFn: () => apiPost<InviteCode>("/team/invite-code"), onSuccess: (d) => { qc.setQueryData(["invite-code"], d); toast.success(t("رمز جديد — القديم لم يعد صالحاً", "New code — the old one no longer works")); } });
  const code = q.data?.code ?? "";
  return (
    <Panel className="mb-6 border-[#D4AF37]/50" data-testid="invite-code-panel">
      <div className="flex flex-wrap items-center gap-3">
        <KeyRound className="size-5 text-[#B8912F]" />
        <div className="min-w-[14rem] flex-1">
          <div className="font-bold">{t("رمز الدعوة إلى مكتبك", "Your office invite code")}</div>
          <p className="text-xs text-muted-foreground">{t("من يسجّل في قلم بهذا الرمز ينضم إلى مكتبك كعضو.", "Anyone who signs up to Qalam with this code joins your office as a member.")}</p>
        </div>
        <code className="rounded-lg bg-ink px-3 py-1.5 font-mono text-lg tracking-[0.25em] text-[#E6C766]" dir="ltr" data-testid="invite-code-value">{code || "…"}</code>
        <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(code); toast.success(t("نُسخ الرمز", "Code copied")); }} disabled={!code} data-testid="invite-code-copy-button"><Copy className="size-4" />{t("نسخ", "Copy")}</Button>
        <Button size="icon" variant="ghost" title={t("رمز جديد", "New code")} onClick={() => { if (confirm(t("إنشاء رمز جديد؟ سيتوقف الرمز الحالي.", "Create a new code? The current one will stop working."))) rotate.mutate(); }} data-testid="invite-code-rotate-button"><RefreshCw className="size-4" /></Button>
      </div>
    </Panel>
  );
}
