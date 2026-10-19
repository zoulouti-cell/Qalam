// Moroccan context: courts, official holidays, Hijri date, phone numbers.

export const COURTS: string[] = [
  "محكمة النقض بالرباط",
  ...["الرباط", "الدار البيضاء", "فاس", "مراكش", "طنجة", "أكادير", "مكناس", "وجدة", "القنيطرة", "تطوان", "الجديدة", "بني ملال", "آسفي", "خريبكة", "سطات", "الناظور", "الحسيمة", "تازة", "الرشيدية", "ورزازات", "العيون", "كلميم", "الصويرة", "خنيفرة", "سلا", "المحمدية", "تمارة", "العرائش"].map(
    (c) => `المحكمة الابتدائية بـ${c}`,
  ),
  ...["الرباط", "الدار البيضاء", "فاس", "مراكش", "طنجة", "أكادير", "مكناس", "وجدة", "القنيطرة", "تطوان", "الجديدة", "بني ملال", "آسفي", "سطات", "الناظور", "الحسيمة", "تازة", "الرشيدية", "ورزازات", "العيون", "كلميم"].map(
    (c) => `محكمة الاستئناف بـ${c}`,
  ),
  ...["الرباط", "الدار البيضاء", "فاس", "مراكش", "طنجة", "أكادير", "مكناس", "وجدة"].map((c) => `المحكمة التجارية بـ${c}`),
  "محكمة الاستئناف التجارية بالدار البيضاء", "محكمة الاستئناف التجارية بفاس", "محكمة الاستئناف التجارية بمراكش",
  ...["الرباط", "الدار البيضاء", "فاس", "مراكش", "أكادير", "مكناس", "وجدة"].map((c) => `المحكمة الإدارية بـ${c}`),
  "محكمة الاستئناف الإدارية بالرباط", "محكمة الاستئناف الإدارية بمراكش", "محكمة الاستئناف الإدارية بفاس",
  "المحكمة الابتدائية الاجتماعية بالدار البيضاء", "المحكمة الابتدائية الزجرية بالدار البيضاء", "قسم قضاء الأسرة بالرباط", "قسم قضاء الأسرة بالدار البيضاء",
];

export interface Holiday { date: string; ar: string; fr: string; en: string; religious?: boolean }

const FIXED: [string, string, string, string][] = [
  ["01-01", "رأس السنة الميلادية", "Nouvel an", "New Year"],
  ["01-11", "ذكرى تقديم وثيقة الاستقلال", "Manifeste de l'indépendance", "Independence Manifesto"],
  ["01-14", "رأس السنة الأمازيغية", "Nouvel an amazigh", "Amazigh New Year"],
  ["05-01", "عيد الشغل", "Fête du travail", "Labour Day"],
  ["07-30", "عيد العرش", "Fête du trône", "Throne Day"],
  ["08-14", "ذكرى استرجاع وادي الذهب", "Récupération d'Oued Eddahab", "Oued Eddahab Day"],
  ["08-20", "ذكرى ثورة الملك والشعب", "Révolution du Roi et du peuple", "Revolution of the King and the People"],
  ["08-21", "عيد الشباب", "Fête de la jeunesse", "Youth Day"],
  ["10-31", "عيد الوحدة", "Fête de l'unité", "Unity Day"],
  ["11-06", "ذكرى المسيرة الخضراء", "Marche verte", "Green March"],
  ["11-18", "عيد الاستقلال", "Fête de l'indépendance", "Independence Day"],
];

// Islamic holidays [hijri month, day, ar, fr, en]; dates follow the Umm al-Qura calendar and may shift ±1 day with the Moroccan moon sighting.
const ISLAMIC: [number, number, string, string, string][] = [
  [1, 1, "فاتح محرم", "Nouvel an de l'Hégire", "Islamic New Year"],
  [3, 12, "عيد المولد النبوي", "Aïd Al Mawlid", "Mawlid"],
  [3, 13, "عيد المولد النبوي (اليوم الثاني)", "Aïd Al Mawlid (2e jour)", "Mawlid (day 2)"],
  [10, 1, "عيد الفطر", "Aïd Al Fitr", "Eid al-Fitr"],
  [10, 2, "عيد الفطر (اليوم الثاني)", "Aïd Al Fitr (2e jour)", "Eid al-Fitr (day 2)"],
  [12, 10, "عيد الأضحى", "Aïd Al Adha", "Eid al-Adha"],
  [12, 11, "عيد الأضحى (اليوم الثاني)", "Aïd Al Adha (2e jour)", "Eid al-Adha (day 2)"],
];

const hijriParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "numeric", timeZone: "UTC" });
const cache = new Map<number, Holiday[]>();

export function holidaysOf(year: number): Holiday[] {
  if (cache.has(year)) return cache.get(year)!;
  const out: Holiday[] = FIXED.map(([md, ar, fr, en]) => ({ date: `${year}-${md}`, ar, fr, en }));
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    const parts = hijriParts.formatToParts(d);
    const m = Number(parts.find((p) => p.type === "month")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    const hit = ISLAMIC.find(([hm, hd]) => hm === m && hd === day);
    if (hit) out.push({ date: d.toISOString().slice(0, 10), ar: hit[2], fr: hit[3], en: hit[4], religious: true });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  cache.set(year, out);
  return out;
}

export function holidayOn(iso: string): Holiday | undefined {
  return holidaysOf(Number(iso.slice(0, 4))).find((h) => h.date === iso);
}

export function nextHoliday(today: string): Holiday | undefined {
  const y = Number(today.slice(0, 4));
  return [...holidaysOf(y), ...holidaysOf(y + 1)].find((h) => h.date >= today);
}

export function hijri(iso: string, lang: "ar" | "fr" | "en"): string {
  if (!iso) return "";
  const loc = lang === "ar" ? "ar-MA-u-ca-islamic-umalqura-nu-latn" : `${lang === "fr" ? "fr-MA" : "en-GB"}-u-ca-islamic-umalqura`;
  return new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
}

/** Normalise Moroccan numbers: 06XXXXXXXX / 07 / 05 → +212 6XX XX XX XX */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  let local = "";
  if (/^0[5-7]\d{8}$/.test(digits)) local = digits.slice(1);
  else if (/^\+?212[5-7]\d{8}$/.test(digits)) local = digits.replace(/^\+?212/, "");
  else if (/^00212[5-7]\d{8}$/.test(digits)) local = digits.slice(5);
  if (!local) return raw.trim();
  return `+212 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}
