import { Link } from "react-router-dom";
import LangToggle from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";

type Section = { h: string; p: string[] };
type Content = { title: string; updated: string; intro: string; sections: Section[]; back: string };

const CONTENT: Record<"ar" | "fr" | "en", Content> = {
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: أكتوبر 2026",
    intro: "«قلم» تطبيق خاص لإدارة مكتب المحاماة، يستعمله المحامي وفريقه وموكلوه. تبيّن هذه الصفحة المعطيات التي يعالجها التطبيق وكيفية حمايتها، طبقاً للقانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.",
    sections: [
      { h: "المعطيات المعالجة", p: ["معطيات الحساب: الاسم والبريد الإلكتروني وصورة الحساب عند الدخول بحساب Google أو بالبريد وكلمة المرور (كلمات المرور تُحفظ مشفّرة).", "معطيات المكتب: الموكلون والملفات والجلسات والمواعيد والوثائق والمرفقات والفواتير التي يدخلها المكتب."] },
      { h: "Google Drive", p: ["عند ربط المكتب لحسابه على Google Drive، يطلب التطبيق صلاحية الوصول إلى Drive لغرض واحد: المزامنة في الاتجاهين مع مجلد «Qalam - قلم» الذي ينشئه، وإنشاء جداول قراءة فقط لمعطيات المكتب. لا يقرأ التطبيق ولا يعدّل ولا يحذف أي ملف خارج هذا المجلد.", "لا تُشارك هذه المعطيات أو تُباع لأي طرف، ولا تُستعمل لأي غرض آخر. يمكن فصل الربط في أي وقت من الإعدادات أو من حساب Google."] },
      { h: "استعمال المعطيات", p: ["تُستعمل المعطيات حصرياً لتشغيل خدمات التطبيق لفائدة المكتب: تدبير الملفات، التذكيرات، تحرير الوثائق، فضاء الموكل، والمساعد القانوني. لا تُستعمل لأغراض إشهارية."] },
      { h: "الحماية والسرية", p: ["الاتصال مشفّر (HTTPS)، والدخول محصور في أعضاء الفريق المضافين من طرف المدير. روابط فضاء الموكل خاصة وقابلة للإلغاء، ولا تُظهر الملاحظات الداخلية إلا ما يختار المكتب إظهاره."] },
      { h: "حقوقكم", p: ["يحق لكل شخص الولوج إلى معطياته وتصحيحها وحذفها والتعرض على معالجتها، بمراسلة المكتب الذي يدبّر ملفه."] },
    ],
    back: "العودة إلى التطبيق",
  },
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : octobre 2026",
    intro: "« Qalam » est une application privée de gestion de cabinet d'avocat, utilisée par l'avocat, son équipe et ses clients. Cette page décrit les données traitées et leur protection, conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
    sections: [
      { h: "Données traitées", p: ["Données de compte : nom, e-mail et photo lors de la connexion avec Google ou par e-mail et mot de passe (les mots de passe sont stockés chiffrés).", "Données du cabinet : clients, dossiers, audiences, rendez-vous, documents, pièces jointes et factures saisis par le cabinet."] },
      { h: "Google Drive", p: ["Lorsque le cabinet relie son compte Google Drive, l'application demande l'accès à Drive dans un seul but : la synchronisation dans les deux sens avec le dossier « Qalam - قلم » qu'elle crée, et la création de tableaux en lecture seule des données du cabinet. Elle ne lit, ne modifie ni ne supprime aucun fichier en dehors de ce dossier.", "Ces données ne sont ni partagées ni vendues à des tiers, ni utilisées à d'autres fins. La liaison peut être supprimée à tout moment depuis les Paramètres ou le compte Google."] },
      { h: "Utilisation des données", p: ["Les données servent exclusivement au fonctionnement des services pour le cabinet : gestion des dossiers, rappels, rédaction, espace client et assistant juridique. Aucune utilisation publicitaire."] },
      { h: "Sécurité et confidentialité", p: ["Les échanges sont chiffrés (HTTPS) et l'accès est réservé aux membres ajoutés par l'administrateur. Les liens de l'espace client sont privés et révocables, et n'affichent que ce que le cabinet choisit de partager."] },
      { h: "Vos droits", p: ["Toute personne peut accéder à ses données, les rectifier, les supprimer ou s'opposer à leur traitement en contactant le cabinet qui gère son dossier."] },
    ],
    back: "Retour à l'application",
  },
  en: {
    title: "Privacy policy",
    updated: "Last updated: October 2026",
    intro: "Qalam is a private law-office management app used by the lawyer, their team and their clients. This page explains what data is processed and how it is protected, in line with Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data.",
    sections: [
      { h: "Data processed", p: ["Account data: name, email and picture when signing in with Google or with email and password (passwords are stored hashed).", "Office data: clients, cases, hearings, appointments, documents, attachments and invoices entered by the office."] },
      { h: "Google Drive", p: ["When the office connects its Google Drive, the app requests Drive access for a single purpose: two-way sync with the \"Qalam - قلم\" folder it creates, and read-only spreadsheets of the office's data. It never reads, changes or deletes any file outside that folder.", "This data is never shared with or sold to third parties, nor used for any other purpose. The connection can be removed at any time from Settings or the Google account."] },
      { h: "Use of data", p: ["Data is used solely to run the app's services for the office: case management, reminders, drafting, the client portal and the legal assistant. No advertising use."] },
      { h: "Security and confidentiality", p: ["Traffic is encrypted (HTTPS) and access is limited to team members added by the administrator. Client portal links are private and revocable and show only what the office chooses to share."] },
      { h: "Your rights", p: ["Anyone may access, correct, delete or object to the processing of their data by contacting the office handling their case."] },
    ],
    back: "Back to the app",
  },
};

/** Public privacy policy — also used as the Google OAuth consent screen privacy URL. */
export default function PrivacyPage() {
  const { lang } = useI18n();
  const c = CONTENT[lang as "ar" | "fr" | "en"] ?? CONTENT.ar;
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink text-stone-50">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <img src="/brand/qalam-badge.png" alt="" className="size-10 rounded-full" />
          <div className="flex-1 font-bold text-[#E6C766]">قلم · Qalam</div>
          <LangToggle className="border-white/20 bg-white/5" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8" data-testid="privacy-page">
        <div>
          <h1 className="text-3xl font-bold" data-testid="privacy-title">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.updated}</p>
        </div>
        <p className="leading-relaxed">{c.intro}</p>
        {c.sections.map((s) => (
          <section key={s.h} className="rounded-2xl border bg-card p-5" data-testid="privacy-section">
            <h2 className="mb-2 text-lg font-bold text-terra">{s.h}</h2>
            {s.p.map((p) => <p key={p} className="mb-2 leading-relaxed text-stone-700 last:mb-0">{p}</p>)}
          </section>
        ))}
        <Link to="/login" className="inline-block text-sm text-terra hover:underline" data-testid="privacy-back-link">{c.back}</Link>
      </main>
    </div>
  );
}
