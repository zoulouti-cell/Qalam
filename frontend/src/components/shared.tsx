import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABELS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="page-title">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  ongoing: "bg-[#EFF6FF] text-[#1E40AF]",
  postponed: "bg-[#FEF3C7] text-[#92400E]",
  judged: "bg-[#ECFDF5] text-[#065F46]",
  archived: "bg-[#F5F5F4] text-[#44403C]",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const [ar, en] = STATUS_LABELS[status] ?? [status, status];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[status])} data-testid={`status-badge-${status}`}>
      {t(ar, en)}
    </span>
  );
}

export interface Option { value: string; label: string }
const NONE = "__none";

// shadcn Select over string options; "" maps to an explicit "none" choice when `allowNone`.
export function Pick({
  value, onChange, options, placeholder, allowNone, testId, className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  allowNone?: boolean;
  testId?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const all = allowNone ? [{ value: NONE, label: placeholder ?? t("— بدون —", "— None —") }, ...options] : options;
  const labels = Object.fromEntries(all.map((o) => [o.value, o.label]));
  return (
    <Select value={value || (allowNone ? NONE : "")} onValueChange={(v: string) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger className={cn("w-full", className)} data-testid={testId}>
        <SelectValue placeholder={placeholder}>{(v: unknown) => labels[v as string] ?? placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {all.map((o) => (
          <SelectItem key={o.value} value={o.value} data-testid={testId ? `${testId}-option-${o.value}` : undefined}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function EmptyState({ title, hint, testId }: { title: string; hint?: string; testId?: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center" data-testid={testId}>
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ children, className, ...rest }: { children: ReactNode; className?: string; "data-testid"?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]", className)} {...rest}>
      {children}
    </section>
  );
}

export function fmtSize(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`;
}
