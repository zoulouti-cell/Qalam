import { useMemo, useState } from 'react'
import Mi from './Mi'
import type { Lang } from './i18n'
import { ScientificFigure, SUBJECT_DOMAIN, type Domain, type Mode, type Subject } from './scientificFigure'
import { SCI_META, datumValue } from './scientificData'
import { TOPICS } from './knowledgeGraph'

const topicIdForSubject = (s: Subject): string | null => {
  const t = TOPICS.find((x) => x.figure === s || (x.more ?? []).includes(s))
  return t ? t.id : null
}
import './scientific.css'

type Cap = {
  title: Record<Lang, string>
  kid: Record<Lang, string>
  adult: Record<Lang, string>
}

const CAPTIONS: Record<Subject, Cap> = {
  gasGiant: {
    title: { ar: 'عملاق غازي', fr: 'Géante gazeuse', en: 'Gas giant' },
    kid: { ar: 'كوكب ضخم من الغاز، عليه خطوط ملونة وعاصفة حمراء كبيرة.', fr: 'Une planète géante de gaz, avec des bandes colorées et une grande tempête rouge.', en: 'A giant gas planet with coloured bands and a big red storm.' },
    adult: { ar: 'غلاف جوي هيدروجيني-هيليومي بأحزمة حمل حراري؛ العاصفة دوامة مضادة للأعاصير أوسع من الأرض.', fr: 'Atmosphère H–He avec bandes convectives ; la tempête est un anticyclone plus large que la Terre.', en: 'H–He atmosphere with convective bands; the storm is an anticyclone wider than Earth.' },
  },
  rockyPlanet: {
    title: { ar: 'كوكب صخري', fr: 'Planète rocheuse', en: 'Rocky planet' },
    kid: { ar: 'كوكب له سطح صلب وجبال، وقطبان أبيضان من الجليد.', fr: 'Une planète au sol solide, avec montagnes et calottes blanches.', en: 'A planet with solid ground, mountains and white polar caps.' },
    adult: { ar: 'سطح صخري بفوهات وتضاريس، وقلنسوتان قطبيتان من الجليد المائي وثاني أكسيد الكربون.', fr: 'Surface rocheuse cratérisée, calottes polaires de glace d’eau et de CO₂.', en: 'Cratered rocky surface with polar caps of water ice and CO₂.' },
  },
  nebula: {
    title: { ar: 'سديم', fr: 'Nébuleuse', en: 'Nebula' },
    kid: { ar: 'سحابة فضائية مضيئة بألوان، فيها تولد نجوم جديدة.', fr: 'Un nuage spatial lumineux et coloré où naissent des étoiles.', en: 'A glowing coloured space cloud where new stars are born.' },
    adult: { ar: 'غاز متأين يضيء بخطوط انبعاث؛ الأشعة فوق البنفسجية للنجوم الفتية تحفّز الإضاءة.', fr: 'Gaz ionisé émettant en raies ; le rayonnement UV des jeunes étoiles l’illumine.', en: 'Ionized gas glowing in emission lines, lit by UV radiation from young stars.' },
  },
  galaxy: {
    title: { ar: 'مجرّة حلزونية', fr: 'Galaxie spirale', en: 'Spiral galaxy' },
    kid: { ar: 'مدينة من مليارات النجوم تلتف مثل الدولاب.', fr: 'Une ville de milliards d’étoiles enroulée comme une toupie.', en: 'A city of billions of stars wound like a pinwheel.' },
    adult: { ar: 'أذرع حلزونية من الغاز والنجوم الفتية حول نواة؛ الدوران يفسر البنية الحلزونية.', fr: 'Bras spiraux de gaz et d’étoiles jeunes autour d’un noyau ; la rotation explique la spirale.', en: 'Spiral arms of gas and young stars around a nucleus; rotation explains the pattern.' },
  },
  comet: {
    title: { ar: 'مذنّب', fr: 'Comète', en: 'Comet' },
    kid: { ar: 'جسم جليدي قد يتكون حوله غاز وغبار قرب الشمس؛ يتجه الذيل عمومًا بعيدًا عنها.', fr: 'Un corps glacé dont les queues de gaz et de poussière s’orientent généralement à l’opposé du Soleil.', en: 'An icy body whose gas and dust tails generally point away from the Sun.' },
    adult: { ar: 'نواة جليدية متطايرة؛ تسخين الشمس يحرر الغاز فيتكون ذيلان: غازي وأيوني وغباري.', fr: 'Noyau glacé ; le chauffage solaire libère le gaz et forme deux queues : gaz/ions et poussière.', en: 'Icy nucleus; solar heating releases gas, forming gas/ion and dust tails.' },
  },
  volcano: {
    title: { ar: 'بركان', fr: 'Volcan', en: 'Volcano' },
    kid: { ar: 'جبل يخرج منه الصخر المنصهر من باطن الأرض.', fr: 'Une montagne qui laisse sortir la roche fondue.', en: 'A mountain that lets molten rock out.' },
    adult: { ar: 'صعود الصهارة عبر شقوق القشرة؛ تنخفض الضغوط فتتحرر الغازات محدثة ثوراناً متفجراً أو هادئاً.', fr: 'La magma remonte ; la décompression libère les gaz : éruption explosive ou effusive.', en: 'Magma rises through fractures; decompression releases gases — explosive or effusive.' },
  },
  cyclone: {
    title: { ar: 'إعصار', fr: 'Cyclone', en: 'Cyclone' },
    kid: { ar: 'دوامة رياح ضخمة تدور حول منطقة ضغط منخفض.', fr: 'Une immense tornade de vents autour d’une basse pression.', en: 'A huge spinning wind system around a low-pressure zone.' },
    adult: { ar: 'نظام ضغط منخفض مع دوران كوريوليس؛ عين هادئة محاطة بجدار سحابي.', fr: 'Dépression tournant sous Coriolis ; œil calme entouré d’un mur de nuages.', en: 'Low-pressure system rotating via Coriolis; a calm eye ringed by a cloud wall.' },
  },
  oceanLayers: {
    title: { ar: 'طبقات المحيط', fr: 'Couches océaniques', en: 'Ocean layers' },
    kid: { ar: 'الماء يبرد ويظلم كلما نزلنا أعمق.', fr: 'L’eau refroidit et s’assombrit en profondeur.', en: 'Water gets colder and darker as you go deeper.' },
    adult: { ar: 'تدرج حراري وملحي يتحكم في الكثافة: طبقة ممتزجة، ثم حرارية، ثم أعماق باردة.', fr: 'Gradient thermique et halin contrôlant la densité : mélangée, thermocline, profonde.', en: 'Temperature–salinity gradients control density: mixed layer, thermocline, cold depths.' },
  },
  cell: {
    title: { ar: 'خلية', fr: 'Cellule', en: 'Cell' },
    kid: { ar: 'أصغر وحدة حية؛ لها نواة ومصنع طاقة.', fr: 'La plus petite unité vivante : noyau et centrale énergétique.', en: 'The smallest living unit: nucleus and power plant.' },
    adult: { ar: 'غشاء فسفولي مزدوج، نواة، ميتوكوندريا وشبكة إندوبلازمية؛ توازن الأيض والانقسام.', fr: 'Membrane phospholipidique, noyau, mitochondries et réticulum.', en: 'Phospholipid membrane, nucleus, mitochondria, ER.' },
  },
  dna: {
    title: { ar: 'الحمض النووي', fr: 'ADN', en: 'DNA' },
    kid: { ar: 'خيط حلزوني يحمل تعليمات بناء الكائن الحي.', fr: 'Un fil en double hélice portant les instructions du vivant.', en: 'A double-helix thread carrying the instructions of life.' },
    adult: { ar: 'لولب مزدوج بسلسلتين متقابلتين؛ الاقتران A–T وG–C يحفظ نسخ المعلومة.', fr: 'Double hélice antiparallèle ; appariement A–T, G–C.', en: 'Antiparallel double helix; A–T, G–C pairing.' },
  },
  neuron: {
    title: { ar: 'عصبون', fr: 'Neurone', en: 'Neuron' },
    kid: { ar: 'خلية ترسل إشارات كهربائية في الدماغ والأعصاب.', fr: 'Une cellule qui transmet des signaux électriques.', en: 'A cell that sends electrical signals.' },
    adult: { ar: 'تغصنات ومحور ومشابك؛ كمون الفعل بالزوال الاستقطابي ونقل كيميائي.', fr: 'Dendrites, axone, synapses ; potentiel d’action et transmission chimique.', en: 'Dendrites, axon, synapses; action potentials and chemical transmission.' },
  },
  heart: {
    title: { ar: 'القلب', fr: 'Cœur', en: 'Heart' },
    kid: { ar: 'عضلة تضخّ الدم إلى كل الجسم.', fr: 'Un muscle qui pompe le sang.', en: 'A muscle that pumps blood.' },
    adult: { ar: 'أربع حجرات وصمامات؛ دورة دموية صغرى وكبرى مع تنظيم نظم.', fr: 'Quatre cavités et valves ; circulations pulmonaire et systémique.', en: 'Four chambers and valves; pulmonary and systemic circuits.' },
  },
  leaf: {
    title: { ar: 'ورقة', fr: 'Feuille', en: 'Leaf' },
    kid: { ar: 'مصنع النبات: تصنع الغذاء من ضوء الشمس.', fr: 'L’usine de la plante : nourriture à partir de la lumière.', en: 'The plant’s factory: food from sunlight.' },
    adult: { ar: 'بلاستيدات خضراء بها كلوروفيل؛ التمثيل الضوئي يحول CO₂ والماء إلى سكر وأكسجين.', fr: 'Chloroplastes à chlorophylle ; photosynthèse CO₂ + eau → sucre + O₂.', en: 'Chloroplasts with chlorophyll; photosynthesis converts CO₂ and water to sugar and O₂.' },
  },
  virus: {
    title: { ar: 'فيروس', fr: 'Virus', en: 'Virus' },
    kid: { ar: 'كائن صغير جداً يحتاج خلية ليتكاثر.', fr: 'Un être minuscule qui a besoin d’une cellule.', en: 'A tiny agent that needs a cell.' },
    adult: { ar: 'محفظة بروتينية وحمض نووي؛ يرتبط بمستقبلات الخلية ويستعمل آلاتها للتضاعف.', fr: 'Capside et génome ; détourne la machinerie cellulaire.', en: 'Capsid and genome; hijacks cellular machinery.' },
  },
  waterMolecule: {
    title: { ar: 'جزيء الماء', fr: 'Molécule d’eau', en: 'Water molecule' },
    kid: { ar: 'ذرتا هيدروجين وذرة أوكسجين، مثل رأس مع أذنين.', fr: 'Deux hydrogènes et un oxygène.', en: 'Two hydrogens and one oxygen.' },
    adult: { ar: 'جزيء قطبي بزاوية ~104.5°؛ الروابط الهيدروجينية تفسر التوتر السطحي والحرارة النوعية.', fr: 'Molécule polaire (~104,5°) ; liaisons hydrogène.', en: 'Polar molecule (~104.5°); hydrogen bonds.' },
  },
  atom: {
    title: { ar: 'ذرة', fr: 'Atome', en: 'Atom' },
    kid: { ar: 'نواة صغيرة حولها إلكترونات تدور.', fr: 'Un petit noyau entouré d’électrons.', en: 'A tiny nucleus with electrons.' },
    adult: { ar: 'نواة بروتونات ونيوترونات وسحابة إلكترونية؛ المدارات تحدد الطاقة والتفاعل.', fr: 'Noyau et nuage électronique ; orbitales et énergie.', en: 'Nucleus and electron cloud; orbitals set energy.' },
  },
  crystal: {
    title: { ar: 'بلورة', fr: 'Cristal', en: 'Crystal' },
    kid: { ar: 'ذرات مرتبة في شبكة منظمة.', fr: 'Des atomes rangés en réseau.', en: 'Atoms arranged in a lattice.' },
    adult: { ar: 'شبكة بلورية دورية؛ التماثل والروابط يحددان الصلابة والانكسار.', fr: 'Réseau périodique ; symétrie et liaisons.', en: 'Periodic lattice; symmetry and bonding.' },
  },
  waveInterference: {
    title: { ar: 'تداخل الموجات', fr: 'Interférences', en: 'Wave interference' },
    kid: { ar: 'موجتان تلتقيان فتصنعان قمماً أعلى أو تتلاشيان.', fr: 'Deux ondes : crêtes plus hautes ou effacement.', en: 'Two waves: higher crests or cancellation.' },
    adult: { ar: 'تراكب خطي؛ فرق الطور يحدد تداخلاً بنّاءً أو هدّاماً — أساس الحيود.', fr: 'Superposition ; déphasage → constructif ou destructif.', en: 'Superposition; phase → constructive or destructive.' },
  },
  prism: {
    title: { ar: 'موشور', fr: 'Prisme', en: 'Prism' },
    kid: { ar: 'الضوء الأبيض ينقسم إلى ألوان قوس قزح.', fr: 'La lumière blanche se sépare en couleurs.', en: 'White light splits into rainbow colours.' },
    adult: { ar: 'تشتت: معامل الانكسار يتغير مع الطول الموجي فينفصل الطيف.', fr: 'Dispersion : l’indice dépend de λ, d’où le spectre.', en: 'Dispersion: index varies with wavelength.' },
  },
  circuit: {
    title: { ar: 'دارة كهربائية', fr: 'Circuit électrique', en: 'Electric circuit' },
    kid: { ar: 'مسار مغلق يمر فيه التيار فيضيء المصباح.', fr: 'Un chemin fermé où le courant allume la lampe.', en: 'A closed path where current lights the bulb.' },
    adult: { ar: 'قانون أوم V=IR؛ توليد حرارة بفعل المقاومة وحماية بالمنصهرات.', fr: 'Loi d’Ohm V=IR ; dissipation et fusibles.', en: 'Ohm’s law V=IR; heating and fuses.' },
  },
  neuralNet: {
    title: { ar: 'شبكة عصبية', fr: 'Réseau de neurones', en: 'Neural network' },
    kid: { ar: 'طبقات من «خلايا» حسابية تتعلم من الأمثلة.', fr: 'Des couches de neurones artificiels.', en: 'Layers of artificial neurons.' },
    adult: { ar: 'انتشار أمامي وأوزان تُدرَّب بالانتشار العكسي؛ التمثيلات تتشكل من البيانات.', fr: 'Propagation avant, poids par rétropropagation.', en: 'Forward pass and backprop-trained weights.' },
  },
  chip: {
    title: { ar: 'شريحة إلكترونية', fr: 'Puce électronique', en: 'Microchip' },
    kid: { ar: 'دماغ الأجهزة: ملايين المفاتيح الصغيرة.', fr: 'Le cerveau des appareils.', en: 'The brain of devices.' },
    adult: { ar: 'ترانزستورات نانومترية؛ كثافة التكامل تحدد السرعة والاستطاعة الحرارية.', fr: 'Transistors nanométriques ; densité d’intégration.', en: 'Nanometre transistors; integration density.' },
  },
}

const DOMAINS: { id: Domain; ar: string; fr: string; en: string; icon: string; color: string }[] = [
  { id: 'space', ar: 'الفضاء', fr: 'Espace', en: 'Space', icon: 'rocket_launch', color: '#2e4a9e' },
  { id: 'earth', ar: 'الأرض', fr: 'Terre', en: 'Earth', icon: 'public', color: '#2e5d7a' },
  { id: 'life', ar: 'الحياة', fr: 'Vie', en: 'Life', icon: 'biotech', color: '#1f6b5a' },
  { id: 'chemistry', ar: 'الكيمياء', fr: 'Chimie', en: 'Chemistry', icon: 'science', color: '#7a4b2e' },
  { id: 'physics', ar: 'الفيزياء', fr: 'Physique', en: 'Physics', icon: 'bolt', color: '#5a3d7a' },
  { id: 'tech', ar: 'التقنية', fr: 'Technologie', en: 'Technology', icon: 'memory', color: '#315d6b' },
]

const ALL_SUBJECTS = Object.keys(CAPTIONS) as Subject[]

export default function ScientificGallery({ lang, level, domains }: { lang: Lang; level: 'kids' | 'academic'; domains?: Domain[] }) {
  const [domain, setDomain] = useState<Domain | 'all'>('all')
  const mode: Mode = level === 'kids' ? 'kids' : 'academic'
  const [hotspot, setHotspot] = useState<string | null>(null)
  const [open, setOpen] = useState<Subject | null>(null)
  const [compare, setCompare] = useState(false)

  const items = useMemo(() => (domains ? ALL_SUBJECTS.filter(s => domains.includes(SUBJECT_DOMAIN[s])) : domain === 'all' ? ALL_SUBJECTS : ALL_SUBJECTS.filter((s) => SUBJECT_DOMAIN[s] === domain)), [domain, domains])
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const s of ALL_SUBJECTS) m[SUBJECT_DOMAIN[s]] = (m[SUBJECT_DOMAIN[s]] || 0) + 1
    return m
  }, [])
  const t = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en)

  return (
    <div className="sci-gallery">
      <header className="sci-gallery-head">
        <div>
          <h2>{t('استكشف موضوعات هذا الفرع', 'Explorer les sujets de cette branche', 'Explore topics in this branch')}</h2>
          <p>
            {t(
              'رسوم تفسيرية مرتبطة بهذا الفرع، مع شرح مناسب للفئة المختارة.',
              'Schémas explicatifs associés à cette branche, adaptés au public choisi.',
              'Explanatory figures for this branch, adapted to the selected audience.'
            )}
          </p>
        </div>
        <div className="sci-mode-static" data-register={mode}>
          <Mi name={mode === 'kids' ? 'child_care' : 'school'} />
          {mode === 'kids' ? t('نسخة الطفل · إعداد عام', 'Version enfant · réglage global', 'Child version · global setting') : t('نسخة الأكاديمي · إعداد عام', 'Version académique · réglage global', 'Academic version · global setting')}
        </div>
      </header>

      <div className="sci-topics-strip">
        <span className="sci-topics-label">{t('مواضيع الموسوعة', 'Thèmes de l’encyclopédie', 'Encyclopedia topics')}</span>
        {TOPICS.filter(tp => !domains || domains.includes(tp.branch)).map((tp) => (
          <a key={tp.id} className="sci-topic-chip" href={'#/topic/' + tp.id}>
            <Mi name={tp.icon} />
            {tp.title[lang]}
          </a>
        ))}
      </div>

      {!domains && <nav className="sci-domains" aria-label={t('المجالات', 'Domaines', 'Domains')}>
        <button className={domain === 'all' ? 'active' : ''} onClick={() => setDomain('all')}>
          {t('كل الفروع', 'Tous', 'All')} <em>{ALL_SUBJECTS.length}</em>
        </button>
        {DOMAINS.map((d) => (
          <button key={d.id} className={domain === d.id ? 'active' : ''} onClick={() => setDomain(d.id)}>
            <Mi name={d.icon} style={{ color: d.color }} />
            {t(d.ar, d.fr, d.en)} <em>{counts[d.id] || 0}</em>
          </button>
        ))}
        <label className="sci-compare">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          {t('وضع المقارنة', 'Mode comparaison', 'Compare mode')}
        </label>
      </nav>}

      {compare ? (
        <div className="sci-compare-grid">
          {items.slice(0, 2).map((s) => {
            const cap = CAPTIONS[s]
            const meta = SCI_META[s]
            return (
              <article key={s} className="sci-compare-card">
                <ScientificFigure subject={s} mode={mode} />
                <h3>{cap.title[lang]}</h3>
                <p>{mode === 'kids' ? cap.kid[lang] : cap.adult[lang]}</p>
                <table className="sci-data">
                  <tbody>
                    {meta.data.map((d) => (
                      <tr key={datumValue(d.v, lang)}>
                        <th>{d.k[lang]}</th>
                        <td>{datumValue(d.v, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="sci-grid">
          {items.map((s) => {
            const cap = CAPTIONS[s]
            const meta = SCI_META[s]
            const d = DOMAINS.find((x) => x.id === SUBJECT_DOMAIN[s])!
            return (
              <article key={s} className={'sci-card' + (mode === 'academic' ? ' is-academic' : '')}>
                <div className="sci-card-media">
                  <ScientificFigure subject={s} mode={mode} />
                  <span className="sci-card-domain" style={{ background: d.color }}>{t(d.ar, d.fr, d.en)}</span>
                  {mode === 'academic' && (
                    <>
                      <span className="sci-scale">{meta.scale[lang]}</span>
                      {meta.cutaway && <span className="sci-badge-cut">{t('مقطع', 'Coupe', 'Cutaway')}</span>}
                      <div className="sci-hotspots">
                        {meta.annotations.map((a, i) => {
                          const key = s + '-' + i
                          const isOn = hotspot === key
                          return (
                            <button
                              key={key}
                              className={'sci-hotspot' + (isOn ? ' on' : '')}
                              style={{ left: a.x + '%', top: a.y + '%' }}
                              onClick={() => setHotspot(isOn ? null : key)}
                              onMouseEnter={() => setHotspot(key)}
                              onMouseLeave={() => setHotspot((v) => (v === key ? null : v))}
                              onFocus={() => setHotspot(key)}
                              aria-label={a.label[lang]}
                              aria-expanded={isOn}
                            >
                              {i + 1}
                            </button>
                          )
                        })}
                        {hotspot && hotspot.startsWith(s + '-') && (
                          <span className="sci-tooltip" style={{ left: meta.annotations[Number(hotspot.split('-').pop())].x + '%', top: meta.annotations[Number(hotspot.split('-').pop())].y + '%' }}>
                            {meta.annotations[Number(hotspot.split('-').pop())].label[lang]}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="sci-card-body">
                  <h3>{cap.title[lang]}</h3>
                  <p data-register={mode}>{mode === 'kids' ? cap.kid[lang] : cap.adult[lang]}</p>
                  {mode === 'academic' && (
                    <table className="sci-data">
                      <tbody>
                        {meta.data.map((row) => (
                          <tr key={datumValue(row.v, lang)}>
                            <th>{row.k[lang]}</th>
                            <td>{datumValue(row.v, lang)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="sci-card-actions">
                    <button className="sci-card-more" onClick={() => setOpen(open === s ? null : s)} aria-expanded={open === s}>
                      {open === s ? t('إغلاق', 'Fermer', 'Close') : t('كيف تعمل؟', 'Comment ça marche ?', 'How it works')}
                    </button>
                    {topicIdForSubject(s) ? (
                      <a className="sci-topic" href={'#/topic/' + topicIdForSubject(s)}>
                        {t('الموضوع الكامل', 'Le thème complet', 'Full topic')} ↗
                      </a>
                    ) : null}
                    <a className="sci-topic" href={meta.topic.route}>
                      {meta.topic.label[lang]} ↗
                    </a>
                  </div>
                </div>
                {open === s && (
                  <div className="sci-card-detail">
                    <strong>{t('الشرح العلمي', 'Explication', 'Explanation')}</strong>
                    <p>{cap.adult[lang]}</p>
                    <ul className="sci-anno-list">
                      {meta.annotations.map((a, i) => (
                        <li key={i}>
                          <b>{i + 1}</b> {a.label[lang]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
