import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
  fmtDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "ar");

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
      t: (ar, en) => (lang === "ar" ? ar : en),
      fmtDate: (iso, opts = { day: "numeric", month: "long", year: "numeric" }) => {
        if (!iso) return "";
        const d = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
        return d.toLocaleDateString(lang === "ar" ? "ar-MA" : "en-GB", opts);
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
  jurisprudence: ["الاجتهادات القضائية", "Case law"],
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
