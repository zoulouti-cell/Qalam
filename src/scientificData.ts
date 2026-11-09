import type { Lang } from './i18n'
import type { Subject } from './scientificFigure'

export type Annotation = {
  /** hotspot position in % of the figure box */
  x: number
  y: number
  label: Record<Lang, string>
}

export type Datum = { k: Record<Lang, string>; v: string | Record<Lang, string> }

export type SciMeta = {
  annotations: Annotation[]
  data: Datum[]
  topic: { route: string; label: Record<Lang, string> }
  cutaway?: boolean
  /** scale bar caption (academic overlay) */
  scale: Record<Lang, string>
}

export const SCI_META: Record<Subject, SciMeta> = {
  gasGiant: {
    annotations: [
      { x: 30, y: 34, label: { ar: 'أحزمة سحابية بفعل الحمل', fr: 'Bandes nuageuses convectives', en: 'Convective cloud bands' } },
      { x: 62, y: 66, label: { ar: 'دوامة مضادة للأعاصير', fr: 'Anticyclone géant', en: 'Giant anticyclone' } },
      { x: 50, y: 14, label: { ar: 'منطقة استوائية أكثر حرارة', fr: 'Zone équatoriale chaude', en: 'Warmer equatorial zone' } },
    ],
    data: [
      { k: { ar: 'الكتلة', fr: 'Masse', en: 'Mass' }, v: '≈ 318 M⊕' },
      { k: { ar: 'الحرارة السطحية', fr: 'Température', en: 'Temperature' }, v: '≈ 125 K' },
      { k: { ar: 'تركيب الغلاف', fr: 'Atmosphère', en: 'Atmosphere' }, v: 'H₂ 90% · He 10%' },
    ],
    topic: { route: '#/section/فضاء', label: { ar: 'افتح موضوع الكواكب', fr: 'Ouvrir le thème planètes', en: 'Open the planets topic' } },
    scale: { ar: 'قطر ≈ 11 قطر أرضي', fr: 'Diamètre ≈ 11 Terre', en: 'Diameter ≈ 11 Earths' },
  },
  rockyPlanet: {
    annotations: [
      { x: 34, y: 36, label: { ar: 'فوهات اصطدامية', fr: 'Cratères d’impact', en: 'Impact craters' } },
      { x: 52, y: 20, label: { ar: 'قلنسوة قطبية جليدية', fr: 'Calotte polaire', en: 'Polar ice cap' } },
      { x: 66, y: 62, label: { ar: 'مرتفعات صخرية', fr: 'Reliefs rocheux', en: 'Rocky highlands' } },
    ],
    data: [
      { k: { ar: 'القطر', fr: 'Diamètre', en: 'Diameter' }, v: '≈ 6 779 km' },
      { k: { ar: 'الجاذبية', fr: 'Gravité', en: 'Gravity' }, v: '3.7 m/s²' },
      { k: { ar: 'الغلاف الجوي', fr: 'Atmosphère', en: 'Atmosphere' }, v: 'CO₂ 95%' },
    ],
    topic: { route: '#/section/فضاء', label: { ar: 'افتح موضوع الكواكب', fr: 'Ouvrir le thème planètes', en: 'Open the planets topic' } },
    scale: { ar: 'المدى: مئات الكيلومترات', fr: 'Champ : centaines de km', en: 'Field: hundreds of km' },
  },
  nebula: {
    annotations: [
      { x: 44, y: 48, label: { ar: 'قلب متأين ساخن', fr: 'Cœur ionisé chaud', en: 'Hot ionized core' } },
      { x: 24, y: 66, label: { ar: 'أعمدة غبار باردة', fr: 'Colonnes de poussière froides', en: 'Cold dust pillars' } },
      { x: 72, y: 28, label: { ar: 'حدود إضاءة الأشعة فوق البنفسجية', fr: 'Front UV d’ionisation', en: 'UV ionization front' } },
    ],
    data: [
      { k: { ar: 'الحرارة', fr: 'Température', en: 'Temperature' }, v: { ar: '≈ 10 000 كلفن (غاز)', fr: '≈ 10 000 K (gaz)', en: '≈ 10,000 K (gas)' } },
      { k: { ar: 'الكثافة', fr: 'Densité', en: 'Density' }, v: '10²–10⁴ cm⁻³' },
      { k: { ar: 'الاتساع', fr: 'Étendue', en: 'Extent' }, v: { ar: 'سنوات ضوئية', fr: 'années-lumière', en: 'light-years' } },
    ],
    topic: { route: '#/section/فضاء', label: { ar: 'افتح موضوع السدم', fr: 'Ouvrir le thème nébuleuses', en: 'Open the nebulae topic' } },
    scale: { ar: 'مقياس: سنوات ضوئية', fr: 'Échelle : années-lumière', en: 'Scale: light-years' },
  },
  galaxy: {
    annotations: [
      { x: 50, y: 50, label: { ar: 'النواة المجرية', fr: 'Bulbe galactique', en: 'Galactic bulge' } },
      { x: 26, y: 40, label: { ar: 'ذراع حلزوني', fr: 'Bras spiral', en: 'Spiral arm' } },
      { x: 70, y: 66, label: { ar: 'مناطق تشكّل نجوم', fr: 'Régions de formation d’étoiles', en: 'Star-forming regions' } },
    ],
    data: [
      { k: { ar: 'عدد النجوم', fr: 'Étoiles', en: 'Stars' }, v: '≈ 10¹¹' },
      { k: { ar: 'القطر', fr: 'Diamètre', en: 'Diameter' }, v: '≈ 100 000 ly' },
      { k: { ar: 'الدوران', fr: 'Rotation', en: 'Rotation' }, v: '≈ 200 km/s' },
    ],
    topic: { route: '#/section/فضاء', label: { ar: 'افتح موضوع المجرات', fr: 'Ouvrir le thème galaxies', en: 'Open the galaxies topic' } },
    scale: { ar: 'مقياس: 10 آلاف سنة ضوئية', fr: 'Échelle : 10 000 al', en: 'Scale: 10,000 ly' },
  },
  comet: {
    annotations: [
      { x: 38, y: 60, label: { ar: 'النواة الجليدية', fr: 'Noyau glacé', en: 'Icy nucleus' } },
      { x: 62, y: 40, label: { ar: 'ذيل الغاز والأيونات', fr: 'Queue de gaz/ions', en: 'Gas/ion tail' } },
      { x: 74, y: 66, label: { ar: 'ذيل الغبار المنحني', fr: 'Queue de poussière', en: 'Dust tail' } },
    ],
    data: [
      { k: { ar: 'قطر النواة', fr: 'Noyau', en: 'Nucleus' }, v: '1–10 km' },
      { k: { ar: 'السرعة', fr: 'Vitesse', en: 'Speed' }, v: '≈ 50 km/s' },
      { k: { ar: 'التركيب', fr: 'Composition', en: 'Composition' }, v: { ar: 'H₂O 90% · He 10%', fr: 'H₂O · CO₂ · poussière', en: 'H₂O · CO₂ · dust' } },
    ],
    topic: { route: '#/section/فضاء', label: { ar: 'افتح موضوع المذنبات', fr: 'Ouvrir le thème comètes', en: 'Open the comets topic' } },
    scale: { ar: 'الذيل: ملايين الكيلومترات', fr: 'Queue : millions de km', en: 'Tail: millions of km' },
  },
  volcano: {
    annotations: [
      { x: 50, y: 34, label: { ar: 'فوهة بركانية', fr: 'Cratère sommital', en: 'Summit crater' } },
      { x: 46, y: 68, label: { ar: 'تدفق الحمم', fr: 'Coulée de lave', en: 'Lava flow' } },
      { x: 62, y: 84, label: { ar: 'سحابة الرماد', fr: 'Panache de cendres', en: 'Ash plume' } },
    ],
    data: [
      { k: { ar: 'حرارة الحمم', fr: 'Lave', en: 'Lava' }, v: '700–1 200 °C' },
      { k: { ar: 'عمق المصدر', fr: 'Source', en: 'Source depth' }, v: '5–30 km' },
      { k: { ar: 'سرعة الصعود', fr: 'Ascension', en: 'Ascent rate' }, v: '0.1–1 m/s' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع البراكين', fr: 'Ouvrir le thème volcans', en: 'Open the volcanoes topic' } },
    scale: { ar: 'مقطع: 5 كيلومترات', fr: 'Coupe : 5 km', en: 'Section: 5 km' },
    cutaway: true,
  },
  cyclone: {
    annotations: [
      { x: 50, y: 50, label: { ar: 'عين الإعصار', fr: 'Œil du cyclone', en: 'Eye of the storm' } },
      { x: 68, y: 38, label: { ar: 'جدار السحب', fr: 'Mur de nuages', en: 'Eyewall' } },
      { x: 30, y: 64, label: { ar: 'أشرطة مطر حلزونية', fr: 'Bandes de pluie', en: 'Spiral rainbands' } },
    ],
    data: [
      { k: { ar: 'سرعة الرياح', fr: 'Vents', en: 'Winds' }, v: '> 200 km/h' },
      { k: { ar: 'الضغط', fr: 'Pression', en: 'Pressure' }, v: '< 950 hPa' },
      { k: { ar: 'القطر', fr: 'Diamètre', en: 'Diameter' }, v: '300–1 000 km' },
    ],
    topic: { route: '#/section/علوم إنسانية', label: { ar: 'افتح موضوع المناخ', fr: 'Ouvrir le thème climat', en: 'Open the climate topic' } },
    scale: { ar: 'مقياس: 500 كيلومتر', fr: 'Échelle : 500 km', en: 'Scale: 500 km' },
  },
  oceanLayers: {
    annotations: [
      { x: 50, y: 18, label: { ar: 'الطبقة الممتزجة', fr: 'Couche mélangée', en: 'Mixed layer' } },
      { x: 50, y: 45, label: { ar: 'الطبقة الحرارية', fr: 'Thermocline', en: 'Thermocline' } },
      { x: 50, y: 78, label: { ar: 'الأعماق الباردة', fr: 'Eaux profondes', en: 'Cold deep water' } },
    ],
    data: [
      { k: { ar: 'الحرارة السطحية', fr: 'Surface', en: 'Surface temp' }, v: '18–28 °C' },
      { k: { ar: 'الحرارة العميقة', fr: 'Profondeur', en: 'Deep temp' }, v: '2–4 °C' },
      { k: { ar: 'الملوحة', fr: 'Salinité', en: 'Salinity' }, v: '34–37 ‰' },
    ],
    topic: { route: '#/section/علوم إنسانية', label: { ar: 'افتح موضوع المحيطات', fr: 'Ouvrir le thème océans', en: 'Open the oceans topic' } },
    scale: { ar: 'العمق: 0–4 000 م', fr: 'Profondeur : 0–4 000 m', en: 'Depth: 0–4 000 m' },
    cutaway: true,
  },
  cell: {
    annotations: [
      { x: 46, y: 44, label: { ar: 'النواة والكروماتين', fr: 'Noyau et chromatine', en: 'Nucleus and chromatin' } },
      { x: 66, y: 34, label: { ar: 'ميتوكوندريا', fr: 'Mitochondries', en: 'Mitochondria' } },
      { x: 34, y: 70, label: { ar: 'غشاء بلازمي مزدوج', fr: 'Membrane plasmique', en: 'Plasma membrane' } },
    ],
    data: [
      { k: { ar: 'القطر', fr: 'Diamètre', en: 'Diameter' }, v: '10–30 µm' },
      { k: { ar: 'المادة الوراثية', fr: 'Génome', en: 'Genome' }, v: { ar: 'الحمض النووي · متران ممددان', fr: 'ADN · 2 m dépliés', en: 'DNA · 2 m unwound' } },
      { k: { ar: 'الميتوكوندريا', fr: 'Mitochondries', en: 'Mitochondria' }, v: { ar: '10²–10³ لكل خلية', fr: '10²–10³ / cellule', en: '10²–10³ per cell' } },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الخلية', fr: 'Ouvrir le thème cellule', en: 'Open the cell topic' } },
    scale: { ar: 'مقياس: 10 ميكرومتر', fr: 'Échelle : 10 µm', en: 'Scale: 10 µm' },
    cutaway: true,
  },
  dna: {
    annotations: [
      { x: 40, y: 30, label: { ar: 'لولب مزدوج', fr: 'Double hélice', en: 'Double helix' } },
      { x: 58, y: 58, label: { ar: 'أزواج قاعدية A–T / G–C', fr: 'Paires de bases', en: 'Base pairs' } },
      { x: 46, y: 82, label: { ar: 'اتجاه متعاكس للسلسلتين', fr: 'Brin antiparallèle', en: 'Antiparallel strand' } },
    ],
    data: [
      { k: { ar: 'القطر', fr: 'Diamètre', en: 'Diameter' }, v: '2 nm' },
      { k: { ar: 'دورة اللولب', fr: 'Pas', en: 'Turn' }, v: '3.4 nm · 10 bp' },
      { k: { ar: 'الجينوم البشري', fr: 'Génome humain', en: 'Human genome' }, v: '≈ 3 × 10⁹ bp' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الوراثة', fr: 'Ouvrir le thème génétique', en: 'Open the genetics topic' } },
    scale: { ar: 'مقياس: 2 نانومتر', fr: 'Échelle : 2 nm', en: 'Scale: 2 nm' },
  },
  neuron: {
    annotations: [
      { x: 50, y: 50, label: { ar: 'جسم الخلية', fr: 'Corps cellulaire', en: 'Cell body' } },
      { x: 24, y: 34, label: { ar: 'تغصنات شجيرية', fr: 'Dendrites', en: 'Dendrites' } },
      { x: 76, y: 62, label: { ar: 'محور ومشابك', fr: 'Axone et synapses', en: 'Axon and synapses' } },
    ],
    data: [
      { k: { ar: 'سرعة السيال', fr: 'Conduction', en: 'Signal speed' }, v: '1–120 m/s' },
      { k: { ar: 'الفترة', fr: 'Période réfractaire', en: 'Refractory' }, v: '≈ 1–2 ms' },
      { k: { ar: 'عدد المشابك', fr: 'Synapses', en: 'Synapses' }, v: '10³–10⁴' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الأعصاب', fr: 'Ouvrir le thème neurones', en: 'Open the neurons topic' } },
    scale: { ar: 'مقياس: 100 ميكرومتر', fr: 'Échelle : 100 µm', en: 'Scale: 100 µm' },
  },
  heart: {
    annotations: [
      { x: 46, y: 34, label: { ar: 'أذين أيمن/أيسر', fr: 'Oreillettes', en: 'Atria' } },
      { x: 54, y: 62, label: { ar: 'بطين أيسر عضلي', fr: 'Ventricule gauche', en: 'Left ventricle' } },
      { x: 36, y: 54, label: { ar: 'صمامات', fr: 'Valves', en: 'Valves' } },
    ],
    data: [
      { k: { ar: 'النبض', fr: 'Fréquence', en: 'Rate' }, v: '60–100 bpm' },
      { k: { ar: 'النتاج القلبي', fr: 'Débit', en: 'Cardiac output' }, v: '≈ 5 L/min' },
      { k: { ar: 'الضغط', fr: 'Pression', en: 'Pressure' }, v: '120/80 mmHg' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع القلب', fr: 'Ouvrir le thème cœur', en: 'Open the heart topic' } },
    scale: { ar: 'الوزن: 250–350 غ', fr: 'Masse : 250–350 g', en: 'Mass: 250–350 g' },
    cutaway: true,
  },
  leaf: {
    annotations: [
      { x: 50, y: 46, label: { ar: 'عروق ناقلة', fr: 'Nervures', en: 'Veins' } },
      { x: 40, y: 66, label: { ar: 'بلاستيدات خضراء', fr: 'Chloroplastes', en: 'Chloroplasts' } },
      { x: 60, y: 26, label: { ar: 'بشرة وثغور', fr: 'Épiderme et stomates', en: 'Epidermis and stomata' } },
    ],
    data: [
      { k: { ar: 'التمثيل الضوئي', fr: 'Photosynthèse', en: 'Photosynthesis' }, v: '6CO₂+6H₂O→C₆H₁₂O₆+6O₂' },
      { k: { ar: 'الكفاءة', fr: 'Rendement', en: 'Efficiency' }, v: '1–2 %' },
      { k: { ar: 'الكلوروفيل', fr: 'Chlorophylle', en: 'Chlorophyll' }, v: 'abs. 430/662 nm' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع النبات', fr: 'Ouvrir le thème plantes', en: 'Open the plants topic' } },
    scale: { ar: 'مقياس: 5 سم', fr: 'Échelle : 5 cm', en: 'Scale: 5 cm' },
  },
  virus: {
    annotations: [
      { x: 50, y: 50, label: { ar: 'المحفظة البروتينية', fr: 'Capside', en: 'Capsid' } },
      { x: 76, y: 40, label: { ar: 'بروتينات سطحية', fr: 'Glycoprotéines', en: 'Surface proteins' } },
      { x: 50, y: 22, label: { ar: 'المادة الوراثية', fr: 'Génome viral', en: 'Viral genome' } },
    ],
    data: [
      { k: { ar: 'القطر', fr: 'Diamètre', en: 'Diameter' }, v: '20–300 nm' },
      { k: { ar: 'الجينوم', fr: 'Génome', en: 'Genome' }, v: '2–200 kb' },
      { k: { ar: 'التضاعف', fr: 'Réplication', en: 'Replication' }, v: { ar: 'داخل الخلية المضيفة', fr: 'chez l’hôte', en: 'inside the host cell' } },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الفيروسات', fr: 'Ouvrir le thème virus', en: 'Open the viruses topic' } },
    scale: { ar: 'مقياس: 100 نانومتر', fr: 'Échelle : 100 nm', en: 'Scale: 100 nm' },
  },
  waterMolecule: {
    annotations: [
      { x: 50, y: 58, label: { ar: 'ذرة أوكسجين', fr: 'Atome d’oxygène', en: 'Oxygen atom' } },
      { x: 32, y: 36, label: { ar: 'ذرتا هيدروجين', fr: 'Atomes d’hydrogène', en: 'Hydrogen atoms' } },
      { x: 68, y: 36, label: { ar: 'زاوية الرابطة 104.5°', fr: 'Angle 104,5°', en: 'Bond angle 104.5°' } },
    ],
    data: [
      { k: { ar: 'الكتلة المولية', fr: 'Masse molaire', en: 'Molar mass' }, v: '18.015 g/mol' },
      { k: { ar: 'العزم القطبي', fr: 'Dipôle', en: 'Dipole' }, v: '1.85 D' },
      { k: { ar: 'الحرارة النوعية', fr: 'Chaleur massique', en: 'Specific heat' }, v: '4.18 J/g·K' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الماء', fr: 'Ouvrir le thème eau', en: 'Open the water topic' } },
    scale: { ar: 'مقياس: 0.1 نانومتر', fr: 'Échelle : 0,1 nm', en: 'Scale: 0.1 nm' },
  },
  atom: {
    annotations: [
      { x: 50, y: 50, label: { ar: 'نواة بروتونات ونيوترونات', fr: 'Noyau', en: 'Nucleus' } },
      { x: 72, y: 34, label: { ar: 'مدار إلكتروني', fr: 'Orbitale', en: 'Electron orbital' } },
      { x: 26, y: 66, label: { ar: 'سحابة احتمالية', fr: 'Nuage de probabilité', en: 'Probability cloud' } },
    ],
    data: [
      { k: { ar: 'قطر الذرة', fr: 'Diamètre', en: 'Diameter' }, v: '≈ 10⁻¹⁰ m' },
      { k: { ar: 'النواة', fr: 'Noyau', en: 'Nucleus' }, v: '≈ 10⁻¹⁵ m' },
      { k: { ar: 'طاقة التأين', fr: 'Ionisation', en: 'Ionization' }, v: '13.6 eV (H)' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الذرة', fr: 'Ouvrir le thème atome', en: 'Open the atom topic' } },
    scale: { ar: 'مقياس: أنغستروم', fr: 'Échelle : ångström', en: 'Scale: ångström' },
  },
  crystal: {
    annotations: [
      { x: 40, y: 40, label: { ar: 'عقد الشبكة البلورية', fr: 'Nœuds du réseau', en: 'Lattice nodes' } },
      { x: 62, y: 56, label: { ar: 'ثابت الشبكة a', fr: 'Paramètre a', en: 'Lattice constant a' } },
      { x: 30, y: 70, label: { ar: 'مستوى انفلاق', fr: 'Plan de clivage', en: 'Cleavage plane' } },
    ],
    data: [
      { k: { ar: 'ثابت الشبكة', fr: 'Paramètre', en: 'Lattice' }, v: '3–6 Å' },
      { k: { ar: 'الصلابة', fr: 'Dureté', en: 'Hardness' }, v: 'Mohs 2–10' },
      { k: { ar: 'التماثل', fr: 'Symétrie', en: 'Symmetry' }, v: { ar: '7 أنظمة', fr: '7 systèmes', en: '7 systems' } },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع البلورات', fr: 'Ouvrir le thème cristaux', en: 'Open the crystals topic' } },
    scale: { ar: 'مقياس: 1 نانومتر', fr: 'Échelle : 1 nm', en: 'Scale: 1 nm' },
    cutaway: true,
  },
  waveInterference: {
    annotations: [
      { x: 50, y: 30, label: { ar: 'تداخل بنّاء (قمم)', fr: 'Constructif (crêtes)', en: 'Constructive (crests)' } },
      { x: 50, y: 70, label: { ar: 'تداخل هدّام (قيعان)', fr: 'Destructif (creux)', en: 'Destructive (troughs)' } },
      { x: 22, y: 50, label: { ar: 'فرق الطور Δφ', fr: 'Déphasage Δφ', en: 'Phase difference Δφ' } },
    ],
    data: [
      { k: { ar: 'شرط البناء', fr: 'Condition constructive', en: 'Constructive' }, v: 'Δ = nλ' },
      { k: { ar: 'شرط الهدّام', fr: 'Destructive', en: 'Destructive' }, v: 'Δ = (n+½)λ' },
      { k: { ar: 'الطول الموجي', fr: 'λ', en: 'λ' }, v: '380–750 nm' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الموجات', fr: 'Ouvrir le thème ondes', en: 'Open the waves topic' } },
    scale: { ar: 'المحور: المسافة', fr: 'Axe : distance', en: 'Axis: distance' },
  },
  prism: {
    annotations: [
      { x: 26, y: 46, label: { ar: 'ضوء أبيض مركّب', fr: 'Lumière blanche', en: 'White light' } },
      { x: 56, y: 50, label: { ar: 'تشتت داخل الموشور', fr: 'Dispersion', en: 'Dispersion' } },
      { x: 82, y: 40, label: { ar: 'طيف مرئي 400–700 نانومتر', fr: 'Spectre 400–700 nm', en: 'Spectrum 400–700 nm' } },
    ],
    data: [
      { k: { ar: 'معامل الانكسار', fr: 'Indice n', en: 'Refractive n' }, v: '1.52 (verre)' },
      { k: { ar: 'زاوية الانحراف', fr: 'Déviation', en: 'Deviation' }, v: '≈ 40°' },
      { k: { ar: 'الترتيب', fr: 'Ordre', en: 'Order' }, v: 'violet → rouge' },
    ],
    topic: { route: '#/section/علوم', label: { ar: 'افتح موضوع الضوء', fr: 'Ouvrir le thème lumière', en: 'Open the light topic' } },
    scale: { ar: 'مقياس: 1 سم', fr: 'Échelle : 1 cm', en: 'Scale: 1 cm' },
  },
  circuit: {
    annotations: [
      { x: 50, y: 60, label: { ar: 'مقاومة R', fr: 'Résistance R', en: 'Resistor R' } },
      { x: 72, y: 52, label: { ar: 'مصباح/حمل', fr: 'Lampe', en: 'Lamp' } },
      { x: 30, y: 80, label: { ar: 'منبع جهد V', fr: 'Source V', en: 'Source V' } },
    ],
    data: [
      { k: { ar: 'قانون أوم', fr: 'Loi d’Ohm', en: 'Ohm’s law' }, v: 'V = I·R' },
      { k: { ar: 'القدرة', fr: 'Puissance', en: 'Power' }, v: 'P = V·I' },
      { k: { ar: 'الاستطاعة', fr: 'Dissipation', en: 'Dissipation' }, v: 'P = I²R' },
    ],
    topic: { route: '#/section/تقنية', label: { ar: 'افتح موضوع الدارات', fr: 'Ouvrir le thème circuits', en: 'Open the circuits topic' } },
    scale: { ar: 'مقياس: 5 سم', fr: 'Échelle : 5 cm', en: 'Scale: 5 cm' },
  },
  neuralNet: {
    annotations: [
      { x: 26, y: 50, label: { ar: 'طبقة الدخل', fr: 'Couche d’entrée', en: 'Input layer' } },
      { x: 52, y: 50, label: { ar: 'طبقات مخفية وأوزان', fr: 'Couches cachées', en: 'Hidden layers' } },
      { x: 78, y: 50, label: { ar: 'طبقة الخرج', fr: 'Couche de sortie', en: 'Output layer' } },
    ],
    data: [
      { k: { ar: 'الانتشار', fr: 'Propagation', en: 'Forward pass' }, v: 'y = f(Wx+b)' },
      { k: { ar: 'التدريب', fr: 'Entraînement', en: 'Training' }, v: { ar: 'الانتشار العكسي', fr: 'rétropropagation', en: 'backpropagation' } },
      { k: { ar: 'المعاملات', fr: 'Paramètres', en: 'Parameters' }, v: '10³–10¹²' },
    ],
    topic: { route: '#/section/تقنية', label: { ar: 'افتح موضوع الذكاء الاصطناعي', fr: 'Ouvrir le thème IA', en: 'Open the AI topic' } },
    scale: { ar: 'المخطط: بنية الشبكة', fr: 'Schéma : architecture', en: 'Diagram: architecture' },
  },
  chip: {
    annotations: [
      { x: 50, y: 50, label: { ar: 'نواة المعالج', fr: 'Die du processeur', en: 'Processor die' } },
      { x: 74, y: 26, label: { ar: 'أطراف التوصيل', fr: 'Broches', en: 'Pins' } },
      { x: 26, y: 74, label: { ar: 'شبكة التوصيلات', fr: 'Interconnexions', en: 'Interconnects' } },
    ],
    data: [
      { k: { ar: 'العقدة', fr: 'Nœud', en: 'Node' }, v: '3–7 nm' },
      { k: { ar: 'الترانزستورات', fr: 'Transistors', en: 'Transistors' }, v: '> 10¹⁰' },
      { k: { ar: 'التردد', fr: 'Fréquence', en: 'Clock' }, v: '3–5 GHz' },
    ],
    topic: { route: '#/section/تقنية', label: { ar: 'افتح موضوع الشرائح', fr: 'Ouvrir le thème puces', en: 'Open the chips topic' } },
    scale: { ar: 'مقياس: 1 سم', fr: 'Échelle : 1 cm', en: 'Scale: 1 cm' },
  },
}


/** pick a datum value in the current language */
export function datumValue(v: string | Record<Lang, string>, lang: Lang): string {
  return typeof v === 'string' ? v : v[lang]
}
