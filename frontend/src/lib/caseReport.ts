import type { Appointment, Case, CaseEvent, Deadline, LegalDocument } from "@/lib/types";

const esc = (s: string) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
type T = (ar: string, en: string) => string;

/** Case report HTML (printed / exported on the office letterhead) — e.g. to send to the client. */
export function caseReportHtml(
  c: Case, events: CaseEvent[], deadlines: Deadline[], appts: Appointment[], docs: LegalDocument[], today: string, t: T, fmt: (iso: string) => string,
): string {
  const th = (s: string) => `<th style="text-align:start;padding:6px 8px;background:#0B1F18;color:#E6C766;font-weight:600">${s}</th>`;
  const td = (s: string) => `<td style="padding:6px 8px;border-bottom:1px solid #e7e5e4;vertical-align:top">${s}</td>`;
  const table = (head: string[], rows: string[][]) =>
    rows.length
      ? `<table style="width:100%;border-collapse:collapse;font-size:12.5px;margin:6px 0 18px"><tr>${head.map(th).join("")}</tr>${rows.map((r) => `<tr>${r.map(td).join("")}</tr>`).join("")}</table>`
      : `<p style="color:#78716c">—</p>`;
  const facts: [string, string][] = [
    [t("رقم الملف", "File no."), c.file_number], [t("الموضوع", "Subject"), c.subject], [t("المحكمة", "Court"), c.court],
    [t("الموكل", "Client"), c.client_name], [t("الخصم", "Opponent"), c.opponent], [t("المحامي المكلف", "Assigned lawyer"), c.assigned_name],
  ];
  const upcoming = appts.filter((a) => a.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return [
    `<h1 style="text-align:center;margin:0 0 4px">${t("تقرير عن وضعية الملف", "Case status report")}</h1>`,
    `<p style="text-align:center;color:#57534E;margin:0 0 16px">${esc(fmt(today))}</p>`,
    `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">${facts
      .map(([k, v]) => `<tr><td style="padding:5px 8px;width:32%;color:#57534E;border-bottom:1px solid #f0ede6">${k}</td><td style="padding:5px 8px;font-weight:600;border-bottom:1px solid #f0ede6">${esc(v || "—")}</td></tr>`)
      .join("")}</table>`,
    `<h2>${t("الجلسات المقبلة", "Upcoming hearings")}</h2>`,
    table([t("التاريخ", "Date"), t("الساعة", "Time"), t("الموضوع", "Subject"), t("المكان", "Place")], upcoming.map((a) => [esc(fmt(a.date)), esc(a.time || "—"), esc(a.title), esc(a.location)])),
    `<h2>${t("سجل الجلسات والإجراءات", "Proceedings log")}</h2>`,
    table([t("التاريخ", "Date"), t("الإجراء", "Step"), t("التفاصيل", "Details")], [...events].sort((a, b) => a.date.localeCompare(b.date)).map((e) => [esc(fmt(e.date)), esc(e.title), esc(e.details)])),
    `<h2>${t("آجال الطعن", "Deadlines")}</h2>`,
    table([t("الأجل", "Deadline"), t("آخر أجل", "Last day"), t("الحالة", "Status")], deadlines.map((d) => [esc(d.label), esc(fmt(d.due_date)), d.done ? t("أنجز", "Done") : t("جارٍ", "Open")])),
    `<h2>${t("الوثائق المحررة", "Drafted documents")}</h2>`,
    table([t("الوثيقة", "Document"), t("آخر تعديل", "Last updated")], docs.map((d) => [esc(d.title), esc(fmt(d.updated_at.slice(0, 10)))])),
    c.notes ? `<h2>${t("ملاحظات", "Notes")}</h2><p>${esc(c.notes)}</p>` : "",
  ].join("");
}
