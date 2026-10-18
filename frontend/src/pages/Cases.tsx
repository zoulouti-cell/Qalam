import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CaseFormDialog } from "@/components/forms";
import { EmptyState, PageHeader, StatusBadge } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { STATUS_LABELS, useI18n } from "@/lib/i18n";
import type { Case } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Cases() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const list = useQuery({
    queryKey: ["cases", q, status],
    queryFn: () => apiGet<Case[]>(`/cases?q=${encodeURIComponent(q)}&status=${status}`),
  });
  const rows = list.isError ? [] : list.data ?? [];
  const tabs = [["", "الكل", "All"], ...Object.entries(STATUS_LABELS).map(([k, [ar, en]]) => [k, ar, en])];

  return (
    <div>
      <PageHeader
        title={t("الملفات", "Cases")}
        subtitle={t("القضايا وسجل الجلسات والمرفقات", "Case files, hearings log and attachments")}
        actions={<Button onClick={() => setOpen(true)} data-testid="cases-add-button"><Plus className="size-4" />{t("ملف جديد", "New case")}</Button>}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("رقم الملف، الموضوع، المحكمة، الخصم", "File no., subject, court, opponent")} className="h-11 bg-card ps-9" data-testid="cases-search-input" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border bg-card p-1" data-testid="cases-status-filter">
          {tabs.map(([k, ar, en]) => (
            <button key={k || "all"} onClick={() => setStatus(k)} data-testid={`cases-status-filter-${k || "all"}`}
              className={cn("rounded-lg px-3 py-1.5 text-sm transition-colors", status === k ? "bg-ink text-stone-50" : "text-muted-foreground hover:bg-warm")}>
              {t(ar, en)}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 && !list.isPending ? (
        <EmptyState title={t("لا توجد ملفات", "No cases found")} testId="cases-empty" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card animate-rise">
          <Table>
            <TableHeader>
              <TableRow className="bg-warm/60">
                <TableHead className="text-start">{t("رقم الملف", "File no.")}</TableHead>
                <TableHead className="text-start">{t("الموضوع", "Subject")}</TableHead>
                <TableHead className="text-start">{t("الموكل", "Client")}</TableHead>
                <TableHead className="text-start">{t("المحكمة", "Court")}</TableHead>
                <TableHead className="text-start">{t("المكلف", "Assigned")}</TableHead>
                <TableHead className="text-start">{t("الحالة", "Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => nav(`/cases/${c.id}`)} data-testid="case-item-card">
                  <TableCell className="font-mono text-sm" dir="ltr">{c.file_number}</TableCell>
                  <TableCell className="font-medium">{c.subject}</TableCell>
                  <TableCell>{c.client_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.court || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.assigned_name || "—"}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <CaseFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
