// Moroccan procedural deadlines (آجال الطعن) — computation follows the "full days" rule of
// article 512 of the Code of Civil Procedure: the notification day and the last day are not
// counted, and a deadline ending on a weekend or public holiday moves to the next working day.
import { holidayOn } from "@/lib/morocco";

export interface DeadlineRule { key: string; ar: string; en: string; days: number; ref: string }

export const DEADLINE_RULES: DeadlineRule[] = [
  { key: "appeal", ar: "الاستئناف (مدني / تجاري)", en: "Appeal (civil / commercial)", days: 30, ref: "ف 134 ق.م.م" },
  { key: "cassation", ar: "الطعن بالنقض", en: "Cassation", days: 30, ref: "ف 358 ق.م.م" },
  { key: "opposition", ar: "التعرض على حكم غيابي", en: "Opposition to default judgment", days: 10, ref: "ف 130 ق.م.م" },
  { key: "criminal_appeal", ar: "استئناف حكم جنحي", en: "Criminal appeal", days: 10, ref: "م 400 ق.م.ج" },
  { key: "review", ar: "إعادة النظر", en: "Petition for review", days: 30, ref: "ف 402 ق.م.م" },
  { key: "custom", ar: "أجل آخر", en: "Other deadline", days: 15, ref: "" },
];

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const isNonWorking = (iso: string) => {
  const wd = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 Sun, 6 Sat — Moroccan courts close on weekends
  return wd === 0 || wd === 6 || !!holidayOn(iso);
};

/** Last day to file: notification + days + 1 (full days), pushed past weekends and holidays. */
export function computeDue(notifiedOn: string, days: number): string {
  if (!notifiedOn) return "";
  let due = addDays(notifiedOn, days + 1);
  while (isNonWorking(due)) due = addDays(due, 1);
  return due;
}

/** Whole days from `today` to `iso` (negative = overdue). Both are YYYY-MM-DD; today comes from the server. */
export const daysUntil = (today: string, iso: string) =>
  Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
