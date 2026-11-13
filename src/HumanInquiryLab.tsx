import { useState } from 'react'
import type { Lang } from './i18n'
import type { Level } from './content'
import type { Words } from './learningRoute'
import './learningRoute.css'

const w = (ar: string, fr: string, en: string): Words => ({ ar, fr, en })

type Inquiry = { question: Words; records: [Words, Words, Words]; explanation: Words; adult: Words; source: string; sourceTitle: Words }

// These are explicitly illustrative evidence records, not claims about a real find.
const INQUIRIES: Record<string, Inquiry> = {
  civilizations: {
    question: w('أي سجل يساعدنا أكثر على دراسة أثر قديم دون أن نخترع قصته؟', 'Quel dossier permet d’étudier un objet ancien sans inventer son histoire ?', 'Which record best helps study an ancient object without inventing its story?'),
    records: [w('صورة جذابة لأثر بلا مكان أو تاريخ', 'Une belle image sans lieu ni date', 'An attractive image without a place or date'), w('سجل يذكر موضع العثور والطبقة والتأريخ وطريقة التوثيق', 'Un dossier indiquant lieu, couche, datation et méthode', 'A record with findspot, layer, dating, and documentation method'), w('رواية منتشرة تزعم معرفة غرض الأثر من شكله', 'Un récit populaire déduisant sa fonction de sa forme', 'A popular story guessing its use from its shape')],
    explanation: w('السجل الموثق يتيح فحص السياق والتأريخ. شكل الأثر وحده لا يثبت وظيفته أو صلته بمجتمع آخر.', 'Le dossier documenté permet de vérifier contexte et datation. La forme seule ne prouve ni fonction ni contact.', 'The documented record lets us check context and dating. Shape alone proves neither purpose nor contact.'),
    adult: w('افصل بين ملاحظة المادة والطبقة، وتأريخها، وتفسير الاستخدام؛ واذكر مصادر عدم اليقين.', 'Séparez observation, datation et interprétation de l’usage, puis indiquez les incertitudes.', 'Separate observation, dating, and interpretation of use; state the uncertainties.'),
    source: 'https://whc.unesco.org/', sourceTitle: w('اليونسكو: التراث العالمي', 'UNESCO : patrimoine mondial', 'UNESCO: World Heritage'),
  },
  'human-history': {
    question: w('تريد معرفة كيف عاش الناس في زمن قديم؛ أي بداية بحث أقوى؟', 'Pour étudier la vie quotidienne d’autrefois, quel départ est le plus solide ?', 'To study everyday life in the past, which starting point is strongest?'),
    records: [w('وصف حديث بلا إحالة إلى وثائق', 'Un récit récent sans références', 'A recent account without references'), w('صورة واحدة مجهولة التاريخ', 'Une seule photo non datée', 'One undated photograph'), w('وثائق وأدوات مؤرخة من أماكن متعددة، مع مقارنة رواياتها', 'Des documents et objets datés de plusieurs lieux, comparés entre eux', 'Dated documents and objects from several places, compared with each other')],
    explanation: w('تقاطع الشواهد يقلل أثر الصدفة والتحيز. حتى الوثيقة الأصلية تعكس منظور صاحبها.', 'Croiser les traces réduit hasard et biais. Même une source primaire exprime un point de vue.', 'Cross-checking evidence reduces chance and bias. Even a primary source has a perspective.'),
    adult: w('حدد مَن أنتج كل شاهد، ولمن، وفي أي ظرف؛ ثم ابحث عما يغيب عن الأرشيف.', 'Précisez auteur, public et contexte de chaque trace, puis cherchez les silences des archives.', 'Identify each source’s creator, audience, and context, then examine archival silences.'),
    source: 'https://www.loc.gov/classroom-materials/', sourceTitle: w('مكتبة الكونغرس: المصادر الأولية', 'Library of Congress : sources primaires', 'Library of Congress: primary sources'),
  },
  arts: {
    question: w('وجدت قصيدة منشورة باسم شاعر؛ كيف تفحص نسبتها قبل عرضها؟', 'Un poème porte le nom d’un auteur : comment vérifier cette attribution ?', 'A poem is attributed to a writer: how do you check that attribution?'),
    records: [w('أكتفي بعدد مرات المشاركة', 'Je me fie au nombre de partages', 'Trust the number of shares'), w('أقارن طبعات أو مخطوطات موثقة وأراجع حقوق النشر', 'Je compare des éditions ou manuscrits documentés et les droits', 'Compare documented editions or manuscripts and usage rights'), w('أحكم من أسلوب القصيدة وحده', 'Je conclus par le style seul', 'Decide from style alone')],
    explanation: w('النسخ الموثقة تساعد على فحص النسبة والتغير بين الطبعات؛ الانتشار والأسلوب وحدهما لا يكفيان.', 'Les témoins documentés aident à examiner attribution et variantes ; popularité et style ne suffisent pas.', 'Documented versions help examine attribution and changes; popularity and style alone are insufficient.'),
    adult: w('سجل النسخة وتاريخها وسلسلة النشر، وميّز النص الأصلي عن التحقيق والترجمة وإعادة الصياغة.', 'Notez version, date et chaîne éditoriale ; distinguez original, édition critique, traduction et adaptation.', 'Record version, date, and publication chain; distinguish original, edition, translation, and adaptation.'),
    source: 'https://www.unesco.org/en/legal-affairs/charter-preservation-digital-heritage', sourceTitle: w('اليونسكو: صون التراث الرقمي', 'UNESCO : préservation du patrimoine numérique', 'UNESCO: digital heritage preservation'),
  },
  religions: {
    question: w('كيف تميز بين نص ديني وبين شرح لاحق له؟', 'Comment distinguer un texte religieux de son commentaire ultérieur ?', 'How do you distinguish a religious text from later commentary?'),
    records: [w('أعدّ كل ما في الصفحة نصًا أصليًا', 'Je considère toute la page comme texte original', 'Treat everything on the page as original text'), w('أنظر إلى شهرة الشرح فقط', 'Je juge par la seule popularité du commentaire', 'Judge only by the commentary’s popularity'), w('أحدد موضع النص، ثم مؤلف الشرح وتاريخه ومدرسته', 'J’identifie le texte, puis l’auteur, la date et l’école du commentaire', 'Identify the text, then the commentary’s author, date, and school')],
    explanation: w('تحديد نوع المصدر يمنع نسبة التفسير إلى النص نفسه. في دراسة الفقه المالكي نذكر أصحاب الأقوال وسياقها.', 'Qualifier la source évite d’attribuer au texte ce qui relève du commentaire. Les avis malikites sont situés et attribués.', 'Identifying source types prevents attributing an interpretation to the text itself. Maliki opinions need attribution and context.'),
    adult: w('قارن نسخ النص المعتمدة ومراجع الشرح، وافصل بين الوصف التاريخي والحكم الفقهي.', 'Comparez les témoins et références du commentaire ; séparez description historique et avis juridique.', 'Compare textual witnesses and commentary references; separate historical description from legal opinion.'),
    source: 'https://rpl.hds.harvard.edu/what-we-do/our-approach/core-research-areas/religious-literacy', sourceTitle: w('جامعة هارفارد: المعرفة الدينية', 'Harvard : culture religieuse', 'Harvard: religious literacy'),
  },
  homeland: {
    question: w('هل تكفي صورة حي واحد لوصف حاجات سكان المغرب؟', 'Une image d’un quartier suffit-elle à décrire les besoins du Maroc ?', 'Can one neighborhood image describe the needs of people across Morocco?'),
    records: [w('نعم، الصورة تمثل كل الجهات', 'Oui, elle représente toutes les régions', 'Yes, it represents all regions'), w('لا؛ أقارن بيانات الإحصاء حسب الجهة والعمر مع شواهد محلية مؤرخة', 'Non ; je croise recensement par région et âge avec des traces locales datées', 'No; compare census data by region and age with dated local evidence'), w('أكتفي بانطباعات زائر واحد', 'Je me fie à un seul visiteur', 'Rely on one visitor’s impression')],
    explanation: w('المغرب متنوع بين جهاته ومدنه وقراه؛ المقارنة تتطلب تعريف الفترة والمنطقة والمؤشر قبل الاستنتاج.', 'Les régions, villes et campagnes diffèrent ; il faut définir période, territoire et indicateur avant de conclure.', 'Morocco varies across regions, cities, and rural areas; define period, place, and measure before concluding.'),
    adult: w('افحص تعريف المؤشر وحجم الفئة وتاريخ الإحصاء، ولا تعامل الإسقاط السكاني كتعداد فعلي.', 'Vérifiez définition, population étudiée et date du recensement ; une projection n’est pas un dénombrement.', 'Check the measure’s definition, population, and census date; a projection is not a count.'),
    source: 'https://www.hcp.ma/Population-legale-du-Royaume-du-Maroc-repartie-par-regions-provinces-et-prefectures-et-communes-selon-les-resultats-du_a3975.html', sourceTitle: w('المندوبية السامية للتخطيط: إحصاء 2024', 'HCP : recensement 2024', 'Morocco HCP: 2024 census'),
  },
  peace: {
    question: w('تريد معرفة هل صمد اتفاق سلام بعد توقف القتال؛ ما الشاهد الأنسب؟','Comment savoir si un accord de paix a tenu après un cessez-le-feu ?','What evidence best shows whether a peace agreement held after a ceasefire?'),
    records: [w('صورة توقيع الاتفاق وحدها','La seule photo de la signature','Only a photograph of the signing'),w('عدد رسائل التهنئة عند التوقيع','Le nombre de félicitations publiées','The number of congratulatory messages'),w('نص الاتفاق وتقارير مؤرخة عن تنفيذه وحماية المدنيين من جهات متعددة','L’accord et des rapports datés sur son application et la protection des civils, croisés entre sources','The agreement and dated, cross-checked reports on its implementation and civilian protection')],
    explanation: w('التوقيع حدث مهم، لكن أثره يُفحص عبر التنفيذ على الأرض، ومدى تراجع العنف، وتجارب السكان.', 'La signature importe, mais l’application, la baisse des violences et l’expérience des habitants doivent être étudiées.', 'Signing matters, but implementation, changes in violence, and civilian experience must also be examined.'),
    adult: w('حدد مدة المتابعة ومصادر البلاغات ومعايير قياس الانتهاكات، وميّز الارتباط عن أثر الاتفاق نفسه.', 'Précisez durée, provenance des rapports et indicateurs, et séparez corrélation et effet de l’accord.', 'Define follow-up period, report provenance, and indicators; separate correlation from the agreement’s effect.'),
    source: 'https://peacekeeping.un.org/en/our-history', sourceTitle: w('الأمم المتحدة: تاريخ حفظ السلام', 'ONU : histoire du maintien de la paix', 'UN: history of peacekeeping'),
  },
}

export default function HumanInquiryLab({ lang, level, themeId }: { lang: Lang; level: Level; themeId: string }) {
  const [choice, setChoice] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const inquiry = INQUIRIES[themeId]
  if (!inquiry) return null
  const correct: number = { civilizations: 1, 'human-history': 2, arts: 1, religions: 2, homeland: 1, peace: 2 }[themeId as 'civilizations'|'human-history'|'arts'|'religions'|'homeland'|'peace']
  return <section className="human-inquiry-lab">
    <header><small>{lang === 'ar' ? 'سجلات تدريبية افتراضية' : lang === 'fr' ? 'Dossiers fictifs pour s’exercer' : 'Illustrative practice records'}</small><h3>{inquiry.question[lang]}</h3><p>{lang === 'ar' ? 'اختر سجلًا، ثم افحص سبب قوته وحدوده. لا تمثل هذه البطاقات اكتشافًا تاريخيًا بعينه.' : lang === 'fr' ? 'Choisissez un dossier et examinez ses forces et limites. Ces cartes ne décrivent aucune découverte précise.' : 'Choose a record and examine its strengths and limits. These cards do not describe a specific historical discovery.'}</p></header>
    <div className="human-inquiry-options">{inquiry.records.map((record, index) => <button key={index} type="button" className={choice === index ? 'selected' : ''} aria-pressed={choice === index} onClick={() => { setChoice(index); setChecked(false) }}><span>{index + 1}</span>{record[lang]}</button>)}</div>
    <button className="primary-btn small" type="button" disabled={choice === null} onClick={() => setChecked(true)}>{lang === 'ar' ? 'افحص اختياري' : lang === 'fr' ? 'Vérifier mon choix' : 'Check my choice'}</button>
    {checked && <div className="human-inquiry-feedback" role="status"><strong>{choice === correct ? (lang === 'ar' ? 'اختيار مدعوم بالشواهد' : lang === 'fr' ? 'Choix étayé' : 'Evidence-based choice') : (lang === 'ar' ? 'أعد النظر في مصدر الشاهد' : lang === 'fr' ? 'Revoyez la provenance' : 'Reconsider the evidence source')}</strong><p>{inquiry.explanation[lang]}</p>{level !== 'kids' && <p>{inquiry.adult[lang]}</p>}</div>}
    <footer><a href={inquiry.source} target="_blank" rel="noreferrer">{inquiry.sourceTitle[lang]} ↗</a></footer>
  </section>
}
