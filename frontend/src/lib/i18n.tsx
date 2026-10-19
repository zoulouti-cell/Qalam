import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import FR from "@/lib/fr.json";

export type Lang = "ar" | "fr" | "en";
const FR_DICT = FR as Record<string, string>;
export const LOCALES: Record<Lang, string> = { ar: "ar-MA", fr: "fr-MA", en: "en-GB" };

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** t(ar, en, vars?) — "{n}" placeholders are filled from vars after the language pick. */
  t: (ar: string, en: string, vars?: Record<string, string | number>) => string;
  fmtDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    return saved && saved in LOCALES ? saved : "ar";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      // French reuses the English key: FR_DICT maps every English UI string to its French form.
      t: (ar, en, vars) => {
        const s = lang === "ar" ? ar : lang === "fr" ? (FR_DICT[en] ?? en) : en;
        return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? "")) : s;
      },
      fmtDate: (iso, opts = { day: "numeric", month: "long", year: "numeric" }) => {
        if (!iso) return "";
        const d = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
        return d.toLocaleDateString(LOCALES[lang], opts);
      },
    }),
    [lang, setLang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside provider");
  return v;
}

// Shared vocabularies (Moroccan practice).
export const STATUS_LABELS: Record<string, [string, string]> = {
  ongoing: ["جارٍ", "Ongoing"],
  postponed: ["مؤجل", "Postponed"],
  judged: ["محكوم", "Judged"],
  archived: ["مؤرشف", "Archived"],
};
export const KIND_LABELS: Record<string, [string, string]> = {
  hearing: ["جلسة", "Hearing"],
  meeting: ["موعد موكل", "Client meeting"],
  other: ["أخرى", "Other"],
};
export const SECTION_LABELS: Record<string, [string, string]> = {
  texts: ["النصوص القانونية", "Legal texts"],
  jurisprudence: ["القرارات والاجتهادات القضائية", "Court decisions & case law"],
  memos: ["المذكرات", "Legal memoranda"],
  studies: ["الدراسات والمقالات", "Studies & articles"],
};
export const DOMAIN_LABELS: Record<string, [string, string]> = {
  civil: ["مدني", "Civil"],
  criminal: ["جنائي", "Criminal"],
  family: ["أسرة", "Family"],
  commercial: ["تجاري", "Commercial"],
  labor: ["شغل", "Labor"],
  realestate: ["عقار", "Real estate"],
  administrative: ["إداري", "Administrative"],
  other: ["أخرى", "Other"],
};
export const DOC_TYPE_LABELS: Record<string, [string, string]> = {
  petition: ["مقال افتتاحي", "Petition"],
  memo: ["مذكرة", "Memorandum"],
  contract: ["عقد", "Contract"],
  notice: ["إنذار", "Notice"],
  letter: ["مراسلة", "Letter"],
};
