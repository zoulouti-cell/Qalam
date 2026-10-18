import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { DOC_TYPE_LABELS, useI18n } from "@/lib/i18n";
import type { LegalDocument, Template } from "@/lib/types";

export default function Documents() {
  const { t, fmtDate } = useI18n();
  const nav = useNavigate();
  const docs = useQuery({ queryKey: ["documents", ""], queryFn: () => apiGet<LegalDocument[]>("/documents") });
  const templates = useQuery({ queryKey: ["templates"], queryFn: () => apiGet<Template[]>("/templates") });
  const rows = docs.isError ? [] : docs.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("التحرير", "Documents")}
        subtitle={t("المذكرات والعقود والمراسلات", "Memos, contracts and correspondence")}
        actions={<Button onClick={() => nav("/documents/new")} data-testid="document-new-button"><FilePlus2 className="size-4" />{t("وثيقة فارغة", "Blank document")}</Button>}
      />
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("ابدأ من قالب", "Start from a template")}</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="doc-template-selector">
        {(templates.data ?? []).map((tpl, i) => (
          <button key={tpl.key} onClick={() => nav(`/documents/new?template=${tpl.key}`)} style={{ animationDelay: `${i * 50}ms` }} data-testid={`template-card-${tpl.key}`}
            className="group animate-rise rounded-2xl border bg-card p-5 text-start transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 h-24 overflow-hidden rounded-lg bg-paper p-3 text-[9px] leading-relaxed text-stone-400">{tpl.content.slice(0, 220)}</div>
            <div className="font-bold group-hover:text-terra">{t(tpl.title_ar, tpl.title_en)}</div>
          </button>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-bold">{t("الوثائق المحفوظة", "Saved documents")}</h2>
      {rows.length === 0 && !docs.isPending ? (
        <EmptyState title={t("لا وثائق بعد", "No documents yet")} testId="documents-empty" />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {rows.map((d) => (
            <li key={d.id}>
              <button onClick={() => nav(`/documents/${d.id}`)} className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-warm/50" data-testid="document-list-item">
                <FileText className="size-5 text-terra" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{d.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{d.case_label || t("غير مرتبطة بملف", "Not linked to a case")}</div>
                </div>
                <span className="rounded-full bg-warm px-2.5 py-0.5 text-xs">{t(...(DOC_TYPE_LABELS[d.doc_type] ?? [d.doc_type, d.doc_type]))}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">{fmtDate(d.updated_at, { day: "numeric", month: "short" })}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
