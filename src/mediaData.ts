import type { Lang } from './i18n'
import { COSMIC_HISTORY, type TimelineEvent } from './timelineData'

export type SceneKind = 'sun' | 'atom' | 'heart' | 'water' | 'pyramid' | 'africa'
export type DiagramKind = 'water' | 'heart' | 'atom' | 'pyramid' | 'africa' | 'solar'

export interface ChartItem {
  label: Record<Lang, string>
  value: number
  color: string
}

export interface ChartDef {
  type: 'bar' | 'pie'
  kidsKind?: 'sizes' | 'cups' | 'beat' | 'blocks' | 'crowd' | 'count'
  title: Record<Lang, string>
  items: ChartItem[]
}

export interface MediaConfig {
  scene?: SceneKind
  diagram?: DiagramKind
  charts?: ChartDef[]
  timeline?: TimelineEvent[]
}

export const MEDIA: Record<string, MediaConfig> = {
  sun: {
    scene: 'sun',
    diagram: 'solar',
    timeline: COSMIC_HISTORY,
    charts: [
      {
        type: 'bar',
        kidsKind: 'sizes',
        title: { ar: 'أقطار الكواكب (كم)', fr: 'Diamètres des planètes (km)', en: 'Planet diameters (km)' },
        items: [
          { label: { ar: 'عطارد', fr: 'Mercure', en: 'Mercury' }, value: 4879, color: '#b8a99a' },
          { label: { ar: 'الزهرة', fr: 'Vénus', en: 'Venus' }, value: 12104, color: '#e8c98a' },
          { label: { ar: 'الأرض', fr: 'Terre', en: 'Earth' }, value: 12742, color: '#4f9dde' },
          { label: { ar: 'المريخ', fr: 'Mars', en: 'Mars' }, value: 6779, color: '#d76b4f' },
          { label: { ar: 'المشتري', fr: 'Jupiter', en: 'Jupiter' }, value: 139820, color: '#d9a066' },
          { label: { ar: 'زحل', fr: 'Saturne', en: 'Saturn' }, value: 116460, color: '#e5cf8a' },
        ],
      },
    ],
  },
  water: {
    scene: 'water',
    diagram: 'water',
    charts: [
      {
        type: 'pie',
        kidsKind: 'cups',
        title: { ar: 'توزيع المياه على الأرض', fr: "Répartition de l'eau sur Terre", en: 'Water distribution on Earth' },
        items: [
          { label: { ar: 'محيطات', fr: 'Océans', en: 'Oceans' }, value: 96.5, color: '#2f6fb3' },
          { label: { ar: 'جليد', fr: 'Glace', en: 'Ice' }, value: 1.76, color: '#bfe3f0' },
          { label: { ar: 'مياه جوفية', fr: 'Eaux souterraines', en: 'Groundwater' }, value: 1.69, color: '#7fb3d5' },
          { label: { ar: 'أنهار وبحيرات', fr: 'Rivières et lacs', en: 'Rivers and lakes' }, value: 0.014, color: '#58c9a5' },
        ],
      },
    ],
  },
  heart: {
    scene: 'heart',
    diagram: 'heart',
    charts: [
      {
        type: 'bar',
        kidsKind: 'beat',
        title: { ar: 'نبضات القلب في الدقيقة', fr: 'Battements du cœur par minute', en: 'Heart beats per minute' },
        items: [
          { label: { ar: 'راحة', fr: 'Repos', en: 'Rest' }, value: 70, color: '#c0392b' },
          { label: { ar: 'مشي', fr: 'Marche', en: 'Walking' }, value: 100, color: '#d96a4f' },
          { label: { ar: 'جري', fr: 'Course', en: 'Running' }, value: 150, color: '#8e2f22' },
        ],
      },
    ],
  },
  pyramids: {
    scene: 'pyramid',
    diagram: 'pyramid',
    charts: [
      {
        type: 'bar',
        kidsKind: 'blocks',
        title: { ar: 'ارتفاع الأهرامات (متر)', fr: 'Hauteur des pyramides (m)', en: 'Pyramid heights (m)' },
        items: [
          { label: { ar: 'خوفو', fr: 'Khéops', en: 'Khufu' }, value: 146.6, color: '#d9a066' },
          { label: { ar: 'خفرع', fr: 'Khéphren', en: 'Khafre' }, value: 136.4, color: '#c78f4f' },
          { label: { ar: 'منقرع', fr: 'Mykérinos', en: 'Menkaure' }, value: 62, color: '#b07a3d' },
        ],
      },
    ],
  },
  africa: {
    scene: 'africa',
    diagram: 'africa',
    charts: [
      {
        type: 'bar',
        kidsKind: 'crowd',
        title: { ar: 'أكبر الدول سكاناً (مليون)', fr: 'Pays les plus peuplés (millions)', en: 'Most populous countries (millions)' },
        items: [
          { label: { ar: 'نيجيريا', fr: 'Nigeria', en: 'Nigeria' }, value: 223, color: '#2e7d32' },
          { label: { ar: 'إثيوبيا', fr: 'Éthiopie', en: 'Ethiopia' }, value: 126, color: '#43a047' },
          { label: { ar: 'مصر', fr: 'Égypte', en: 'Egypt' }, value: 112, color: '#66bb6a' },
          { label: { ar: 'الكونغو الديمقراطية', fr: 'RD Congo', en: 'DR Congo' }, value: 102, color: '#81c784' },
          { label: { ar: 'تنزانيا', fr: 'Tanzanie', en: 'Tanzania' }, value: 67, color: '#a5d6a7' },
        ],
      },
    ],
  },
  atom: {
    scene: 'atom',
    diagram: 'atom',
    charts: [
      {
        type: 'bar',
        kidsKind: 'count',
        title: { ar: 'عدد البروتونات في العناصر', fr: 'Nombre de protons des éléments', en: 'Proton count of elements' },
        items: [
          { label: { ar: 'هيدروجين', fr: 'Hydrogène', en: 'Hydrogen' }, value: 1, color: '#7d5ba6' },
          { label: { ar: 'هيليوم', fr: 'Hélium', en: 'Helium' }, value: 2, color: '#8e6fb5' },
          { label: { ar: 'كربون', fr: 'Carbone', en: 'Carbon' }, value: 6, color: '#9f83c4' },
          { label: { ar: 'أكسجين', fr: 'Oxygène', en: 'Oxygen' }, value: 8, color: '#b097d3' },
          { label: { ar: 'حديد', fr: 'Fer', en: 'Iron' }, value: 26, color: '#c1abe2' },
        ],
      },
    ],
  },
  ai: {
    charts: [
      {
        type: 'pie',
        kidsKind: 'cups',
        title: { ar: 'استخدامات الذكاء الاصطناعي', fr: "Usages de l'intelligence artificielle", en: 'AI usage by sector' },
        items: [
          { label: { ar: 'خدمات', fr: 'Services', en: 'Services' }, value: 30, color: '#7d5ba6' },
          { label: { ar: 'تصنيع', fr: 'Industrie', en: 'Manufacturing' }, value: 25, color: '#9f83c4' },
          { label: { ar: 'صحة', fr: 'Santé', en: 'Health' }, value: 20, color: '#b097d3' },
          { label: { ar: 'تعليم', fr: 'Éducation', en: 'Education' }, value: 15, color: '#c1abe2' },
          { label: { ar: 'أخرى', fr: 'Autres', en: 'Other' }, value: 10, color: '#d8c9ec' },
        ],
      },
    ],
  },
  climate: {
    charts: [
      {
        type: 'bar',
        kidsKind: 'cups',
        title: { ar: 'انبعاثات ثاني أكسيد الكربون حسب القطاع (%)', fr: 'Émissions de CO2 par secteur (%)', en: 'CO2 emissions by sector (%)' },
        items: [
          { label: { ar: 'طاقة', fr: 'Énergie', en: 'Energy' }, value: 34, color: '#c0392b' },
          { label: { ar: 'صناعة', fr: 'Industrie', en: 'Industry' }, value: 24, color: '#d96a4f' },
          { label: { ar: 'زراعة', fr: 'Agriculture', en: 'Agriculture' }, value: 22, color: '#2e7d32' },
          { label: { ar: 'نقل', fr: 'Transports', en: 'Transport' }, value: 15, color: '#4f9dde' },
          { label: { ar: 'مبانٍ', fr: 'Bâtiments', en: 'Buildings' }, value: 5, color: '#8a6d3b' },
        ],
      },
    ],
  },
  mars: {
    charts: [
      {
        type: 'bar',
        kidsKind: 'sizes',
        title: { ar: 'متوسط حرارة الكواكب (°م)', fr: 'Température moyenne des planètes (°C)', en: 'Average planet temperature (°C)' },
        items: [
          { label: { ar: 'الزهرة', fr: 'Vénus', en: 'Venus' }, value: 464, color: '#e8c98a' },
          { label: { ar: 'الأرض', fr: 'Terre', en: 'Earth' }, value: 15, color: '#4f9dde' },
          { label: { ar: 'المريخ', fr: 'Mars', en: 'Mars' }, value: -63, color: '#d76b4f' },
        ],
      },
    ],
  },
  energy: {
    charts: [
      {
        type: 'bar',
        kidsKind: 'cups',
        title: { ar: 'حصة المصادر المتجددة من كهرباء العالم (%)', fr: "Part des renouvelables dans l'électricité mondiale (%)", en: 'Renewable share of world electricity (%)' },
        items: [
          { label: { ar: 'مائية', fr: 'Hydraulique', en: 'Hydro' }, value: 16, color: '#2f6fb3' },
          { label: { ar: 'رياح', fr: 'Éolien', en: 'Wind' }, value: 7, color: '#58c9a5' },
          { label: { ar: 'شمسية', fr: 'Solaire', en: 'Solar' }, value: 5, color: '#ffd54f' },
          { label: { ar: 'حيوية', fr: 'Biomasse', en: 'Biomass' }, value: 2, color: '#8a9a5b' },
        ],
      },
    ],
  },
}
