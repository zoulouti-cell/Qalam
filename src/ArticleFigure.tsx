import { ScientificFigure, type Subject } from './scientificFigure'
import { SCI_META, datumValue } from './scientificData'
import { topicForArticle } from './knowledgeGraph'
import type { Lang } from './i18n'
import type { Level } from './content'

/** Keyword → scientific figure binding, so every article gets a matching realistic visual. */
const RULES: { match: RegExp; subject: Subject }[] = [
  { match: /قلب|heart|cœur|coeur|دورة دموية|شرايين/i, subject: 'heart' },
  { match: /خلية|cellule|cell\b|نواة الخلية|ميتوكوندريا/i, subject: 'cell' },
  { match: /حمض نووي|dna|adn|جين|génotype|génétique|وراثة/i, subject: 'dna' },
  { match: /عصبون|neuron|عصب|brain|دماغ|cerveau/i, subject: 'neuron' },
  { match: /فيروس|virus|لقاح|vaccin|مناعة|immunité/i, subject: 'virus' },
  { match: /ورقة|feuille|leaf|نبات|plante|تمثيل ضوئي|photosynthèse/i, subject: 'leaf' },
  { match: /ماء|eau|water|جزيء|molécule/i, subject: 'waterMolecule' },
  { match: /ذرة|atome|atom|جسيم|particule/i, subject: 'atom' },
  { match: /بلور|cristal|شبكة بلورية|معدن|minéral/i, subject: 'crystal' },
  { match: /موجة|onde|wave|تداخل|interférence/i, subject: 'waveInterference' },
  { match: /ضوء|lumière|light|طيف|spectre|انكسار|réfraction/i, subject: 'prism' },
  { match: /كهرباء|électricité|circuit|دارة|تيار|courant/i, subject: 'circuit' },
  { match: /شبكة عصبية|réseau de neurones|neural|ذكاء اصطناعي|intelligence artificielle/i, subject: 'neuralNet' },
  { match: /شريحة|puce|معالج|processeur|chip|حاسوب|ordinateur/i, subject: 'chip' },
  { match: /بركان|volcan|زلزال|séisme|صهارة|magma/i, subject: 'volcano' },
  { match: /إعصار|cyclone|مناخ|climat|طقس|météo/i, subject: 'cyclone' },
  { match: /محيط|océan|ocean|بحر|mer|أعماق|profondeurs/i, subject: 'oceanLayers' },
  { match: /كوكب|planète|planet|مشتري|jupiter|زحل|saturne|مريخ|mars/i, subject: 'gasGiant' },
  { match: /قمر|lune|moon|صخري|rocheuse|عطارد|mercure/i, subject: 'rockyPlanet' },
  { match: /سديم|nébuleuse|nebula|ولادة النجوم/i, subject: 'nebula' },
  { match: /مجر[ةّ]|galaxie|galaxy|درب التبانة|voie lactée/i, subject: 'galaxy' },
  { match: /مذنب|comète|comet/i, subject: 'comet' },
]

export function figureForArticle(title: string, category: string): Subject | null {
  const text = `${title} ${category}`
  for (const r of RULES) if (r.match.test(text)) return r.subject
  return null
}

/** Inline realistic figure + academic annotations for an article page. */
export default function ArticleFigure({
  title,
  category,
  lang,
  level,
}: {
  title: string
  category: string
  lang: Lang
  level: Level
}) {
  const subject = figureForArticle(title, category)
  if (!subject) return null
  const meta = SCI_META[subject]
  const academic = level !== 'kids'
  const t = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en)
  return (
    <figure className={'article-figure' + (academic ? ' is-academic' : '')}>
      <ScientificFigure subject={subject} mode={academic ? 'academic' : 'kids'} />
      <figcaption>
        <div className="article-figure-head">
          <span className="article-figure-kicker">
            {t('رسم توضيحي علمي', 'Illustration scientifique', 'Scientific illustration')}
          </span>
          <span className="article-figure-scale">{meta.scale[lang]}</span>
        </div>
        {academic && (
          <ol className="article-figure-labels">
            {meta.annotations.map((a, i) => (
              <li key={i}>{a.label[lang]}</li>
            ))}
          </ol>
        )}
        {academic && (
          <dl className="article-figure-data">
            {meta.data.map((d) => (
              <div key={datumValue(d.v, lang)}>
                <dt>{d.k[lang]}</dt>
                <dd>{datumValue(d.v, lang)}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="article-figure-links">
          {topicForArticle(title, category) ? (
            <a className="article-figure-topic" href={'#/topic/' + topicForArticle(title, category)!.id}>
              {t('افتح الموضوع الكامل', 'Ouvrir le thème complet', 'Open the full topic')} ↗
            </a>
          ) : null}
          <a className="article-figure-topic" href={meta.topic.route}>
            {meta.topic.label[lang]} ↗
          </a>
        </div>
      </figcaption>
    </figure>
  )
}
