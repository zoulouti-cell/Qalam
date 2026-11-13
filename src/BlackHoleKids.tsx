import { useState } from 'react'
import type { Lang } from './i18n'

const COPY: Record<Lang, { title: string; steps: [string, string, string]; notes: [string, string, string]; caption: string; horizon: string; gas: string; star: string; limit: string }> = {
  ar: {
    title: 'رحلة الضوء قرب ثقب أسود', steps: ['كيف يتكوّن؟', 'أين يختفي الضوء؟', 'لماذا نرى حلقة مضيئة؟'],
    notes: ['تتكوّن بعض الثقوب السوداء عندما ينهار لبّ نجم شديد الضخامة بعد نفاد وقوده. تنضغط كمية كبيرة من المادة في حيز صغير جدًا.', 'حول الثقب حدّ اسمه أفق الحدث. إذا عبره الضوء إلى الداخل فلن يستطيع الخروج؛ الأفق حدّ في الفضاء، وليس جدارًا صلبًا.', 'قد يسخن الغاز والغبار خارج أفق الحدث ويدوران حوله، فيصدران ضوءًا. الحلقة المضيئة في الرسم تمثل مادة خارج الثقب، لا الثقب نفسه.'],
    caption: 'المخطط يشرح الفكرة، لكنه ليس صورة فوتوغرافية ولا محاكاة بمقياس حقيقي.', horizon: 'أفق الحدث', gas: 'غاز ساخن يضيء حوله', star: 'نجم ضخم', limit: 'رسم توضيحي غير مقياسي',
  },
  fr: {
    title: 'Le trajet de la lumière près d’un trou noir', steps: ['Comment se forme-t-il ?', 'Où va la lumière ?', 'Pourquoi voit-on un anneau lumineux ?'],
    notes: ['Certains trous noirs se forment lorsque le cœur d’une étoile très massive s’effondre après avoir épuisé son combustible. Beaucoup de matière est comprimée dans un espace minuscule.', 'Autour du trou se trouve l’horizon des événements. La lumière qui le franchit vers l’intérieur ne peut plus ressortir. C’est une limite de l’espace, pas un mur solide.', 'Le gaz et la poussière à l’extérieur de l’horizon peuvent chauffer et tourner, puis émettre de la lumière. L’anneau dessiné représente cette matière extérieure, pas le trou noir lui-même.'],
    caption: 'Schéma explicatif : ce n’est ni une photographie ni une simulation à l’échelle.', horizon: 'Horizon des événements', gas: 'Gaz chaud lumineux', star: 'Étoile massive', limit: 'Schéma sans échelle',
  },
  en: {
    title: 'A journey of light near a black hole', steps: ['How can one form?', 'Where does the light go?', 'Why can a bright ring appear?'],
    notes: ['Some black holes form when the core of a very massive star collapses after it runs out of fuel. A great deal of matter is squeezed into a very small space.', 'A boundary called the event horizon surrounds the hole. Once light crosses inward, it cannot get back out. The horizon is a boundary in space, not a solid wall.', 'Gas and dust outside the event horizon can heat up and orbit, giving off light. The bright ring in this drawing is outside the hole; the black hole itself is not glowing.'],
    caption: 'This diagram explains an idea. It is not a photograph or a scale simulation.', horizon: 'Event horizon', gas: 'Glowing hot gas', star: 'Massive star', limit: 'Diagram · not to scale',
  },
}

export default function BlackHoleKids({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0)
  const copy = COPY[lang]
  return <section className="black-hole-kids" aria-label={copy.title}>
    <h4>{copy.title}</h4>
    <svg className="black-hole-kids-diagram" viewBox="0 0 900 390" role="img" aria-label={copy.caption}>
      <defs>
        <radialGradient id="bhk-bg"><stop stopColor="#183b64"/><stop offset="1" stopColor="#071021"/></radialGradient>
        <radialGradient id="bhk-star"><stop stopColor="#fffbd4"/><stop offset=".55" stopColor="#ffc85c"/><stop offset="1" stopColor="#f07b40"/></radialGradient>
        <linearGradient id="bhk-disk"><stop stopColor="#6de8f4" stopOpacity=".2"/><stop offset=".48" stopColor="#fff2bd"/><stop offset=".68" stopColor="#ff9d50"/><stop offset="1" stopColor="#ba58ff" stopOpacity=".2"/></linearGradient>
        <filter id="bhk-glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="bhk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#a7e9ff"/></marker>
      </defs>
      <rect width="900" height="390" rx="24" fill="url(#bhk-bg)"/>
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 173 + 29) % 890 + 5} cy={(i * 83 + 17) % 380 + 5} r={i % 5 ? 1.2 : 2} fill="#d7eaff" opacity={i % 3 ? .62 : .9}/>)}
      <circle cx="135" cy="180" r="39" fill="url(#bhk-star)" filter="url(#bhk-glow)"/>
      <path d="M184 178 C275 145 325 300 435 220 S600 58 708 145" fill="none" stroke="#a7e9ff" strokeWidth="4" strokeDasharray="10 8" markerEnd="url(#bhk-arrow)"/>
      <ellipse cx="610" cy="195" rx="150" ry="53" fill="none" stroke="url(#bhk-disk)" strokeWidth="28" filter="url(#bhk-glow)"/>
      <ellipse cx="610" cy="195" rx="92" ry="34" fill="#02050d" stroke="#74e8f3" strokeWidth="4" strokeDasharray="7 5"/>
      <circle cx="610" cy="195" r="52" fill="#010208"/>
      <path d="M135 245v43h95" fill="none" stroke="#ffd987" strokeWidth="2"/><text x="230" y="300" fill="#fff0c4" fontSize="18" textAnchor="middle">{copy.star}</text>
      <path d="M700 134 764 90h95" fill="none" stroke="#ffd987" strokeWidth="2"/><text x="802" y="81" fill="#fff0c4" fontSize="18" textAnchor="middle">{copy.gas}</text>
      <path d="M650 225 733 305h116" fill="none" stroke="#73e8f3" strokeWidth="2"/><text x="790" y="335" fill="#d6fbff" fontSize="18" textAnchor="middle">{copy.horizon}</text>
    </svg>
    <div className="black-hole-kids-steps" role="tablist" aria-label={copy.title}>{copy.steps.map((step, i) => <button key={step} type="button" role="tab" aria-selected={active === i} className={active === i ? 'active' : ''} onClick={() => setActive(i)}><span>{i + 1}</span>{step}</button>)}</div>
    <p className="black-hole-kids-explanation" role="tabpanel">{copy.notes[active]}</p>
    <small className="black-hole-kids-caption">{copy.caption} · {copy.limit}</small>
  </section>
}
