import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Mail, Phone, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientFormDialog } from "@/components/forms";
import { EmptyState, PageHeader } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Client } from "@/lib/types";

export default function Clients() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = useQuery({ queryKey: ["clients", q], queryFn: () => apiGet<Client[]>(`/clients?q=${encodeURIComponent(q)}`) });
  const rows = list.isError ? [] : list.data ?? [];

  return (
    <div>
      <PageHeader
        title={t("الموكلون", "Clients")}
        subtitle={t("بطاقات الزبناء وملفاتهم", "Client records and their files")}
        actions={<Button onClick={() => setOpen(true)} data-testid="client-add-button"><Plus className="size-4" />{t("موكل جديد", "New client")}</Button>}
      />
      <div className="relative mb-6 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ابحث بالاسم أو الهاتف أو رقم البطاقة", "Search by name, phone or ID")} className="h-11 bg-card ps-9" data-testid="clients-search-input" />
      </div>
      {rows.length === 0 && !list.isPending ? (
        <EmptyState title={t("لا يوجد موكلون", "No clients yet")} hint={t("أضف أول موكل للبدء", "Add your first client to get started")} testId="clients-empty" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((c, i) => (
            <Link key={c.id} to={`/clients/${c.id}`} style={{ animationDelay: `${i * 30}ms` }}
              className="group animate-rise rounded-2xl border bg-card p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md" data-testid="client-card-item">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-full bg-warm text-lg font-bold text-terra">{c.name[0]}</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"><FolderOpen className="size-3" />{c.case_count}</span>
              </div>
              <div className="mt-4 text-lg font-bold group-hover:text-terra">{c.name}</div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {c.phone && <div className="flex items-center gap-2"><Phone className="size-3.5" /><span dir="ltr">{c.phone}</span></div>}
                {c.email && <div className="flex items-center gap-2"><Mail className="size-3.5" /><span dir="ltr" className="truncate">{c.email}</span></div>}
              </div>
            </Link>
          ))}
        </div>
      )}
      <ClientFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
