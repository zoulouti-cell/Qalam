import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CaseFormDialog, ClientFormDialog } from "@/components/forms";
import { PortalLinkControls } from "@/components/Portal";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/shared";
import { apiDelete, apiGet } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Case, Client } from "@/lib/types";

export default function ClientDetail() {
  const { id = "" } = useParams();
  const { t } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [newCase, setNewCase] = useState(false);
  const client = useQuery({ queryKey: ["client", id], queryFn: () => apiGet<Client>(`/clients/${id}`) });
  const cases = useQuery({ queryKey: ["client-cases", id], queryFn: () => apiGet<Case[]>(`/clients/${id}/cases`) });
  const del = useMutation({
    mutationFn: () => apiDelete(`/clients/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast.success(t("تم الحذف", "Deleted")); nav("/clients"); },
  });
  const c = client.isError ? undefined : client.data;

  const info: [string, string, string | undefined][] = [
    ["الهاتف", "Phone", c?.phone],
    ["البريد الإلكتروني", "Email", c?.email],
    ["رقم البطاقة الوطنية", "National ID", c?.id_number],
    ["العنوان", "Address", c?.address],
  ];

  return (
    <div>
      <Link to="/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-terra" data-testid="client-back-link">
        <ArrowRight className="size-4 ltr:rotate-180" />{t("الموكلون", "Clients")}
      </Link>
      <PageHeader
        title={c?.name ?? "…"}
        actions={
          <>
            {c && <PortalLinkControls clientId={c.id} phone={c.phone} />}
            <Button variant="outline" onClick={() => setEdit(true)} disabled={!c} data-testid="client-edit-button"><Pencil className="size-4" />{t("تعديل", "Edit")}</Button>
            <Button variant="outline" className="text-destructive" disabled={!c} data-testid="client-delete-button"
              onClick={() => { if (confirm(t("حذف هذا الموكل؟", "Delete this client?"))) del.mutate(); }}>
              <Trash2 className="size-4" />
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Panel data-testid="client-details-panel">
          <dl className="space-y-4">
            {info.map(([ar, en, v]) => (
              <div key={en}>
                <dt className="text-xs text-muted-foreground">{t(ar, en)}</dt>
                <dd className="mt-0.5 font-medium">{v || "—"}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs text-muted-foreground">{t("ملاحظات", "Notes")}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{c?.notes || "—"}</dd>
            </div>
          </dl>
        </Panel>
        <Panel data-testid="client-cases-list">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("ملفات الموكل", "Client's cases")}</h2>
            <Button size="sm" onClick={() => setNewCase(true)} data-testid="client-new-case-button"><Plus className="size-4" />{t("ملف", "Case")}</Button>
          </div>
          {cases.data?.length ? (
            <ul className="divide-y">
              {cases.data.map((cs) => (
                <li key={cs.id}>
                  <Link to={`/cases/${cs.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-terra" data-testid="client-case-link">
                    <div>
                      <div className="font-medium">{cs.subject}</div>
                      <div className="text-xs text-muted-foreground"><span dir="ltr" className="font-mono">{cs.file_number}</span> · {cs.court}</div>
                    </div>
                    <StatusBadge status={cs.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("لا ملفات لهذا الموكل", "No cases for this client")} />
          )}
        </Panel>
      </div>
      <ClientFormDialog open={edit} onOpenChange={setEdit} initial={c} />
      <CaseFormDialog open={newCase} onOpenChange={setNewCase} defaultClientId={id} />
    </div>
  );
}
