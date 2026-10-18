import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, Panel, Pick } from "@/components/shared";
import { ApiError, apiDelete, apiPatch, apiPost } from "@/lib/api";
import { useMe, useTeam } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { Role, TeamInvite, User } from "@/lib/types";

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
    onError: (e) => toast.error(e instanceof ApiError && e.status === 409 ? t("هذا البريد مضاف مسبقاً", "Email already added") : t("بريد غير صالح", "Invalid email")),
  });
  const setRole = useMutation({ mutationFn: ({ id, role }: { id: string; role: Role }) => apiPatch<User>(`/team/${id}`, { role }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => apiDelete(`/team/${id}`), onSuccess: refresh });

  return (
    <div>
      <PageHeader title={t("الفريق", "Team")} subtitle={t("من يحق له الدخول إلى المكتب", "Who can access the office")} />
      <Panel className="mb-6">
        <form className="grid gap-3 sm:grid-cols-[1.4fr_1fr_180px_auto]" onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}>
          <Input type="email" required dir="ltr" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@gmail.com" data-testid="team-invite-email-input" />
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={t("الاسم (اختياري)", "Name (optional)")} data-testid="team-invite-name-input" />
          <Pick value={f.role} onChange={(v) => setF({ ...f, role: v as Role })} options={roles} testId="team-invite-role-select" />
          <Button type="submit" disabled={invite.isPending} data-testid="team-invite-submit-button"><UserPlus className="size-4" />{t("إضافة", "Add")}</Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">{t("أضف بريد Google الخاص بالعضو. أي حساب غير مضاف يُمنع من الدخول.", "Add the member's Google email. Any account not listed is denied.")}</p>
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
