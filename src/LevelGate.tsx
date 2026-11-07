import Mi from './Mi'
import { LANGS, LANG_LABELS, t, type Lang } from './i18n'
import { LEVELS, levelKey, type Level } from './content'
import { sound } from './sound'

export default function LevelGate({
  lang,
  current,
  onPick,
  onLang,
}: {
  lang: Lang
  current: Level | null
  onPick: (l: Level) => void
  onLang: (l: Lang) => void
}) {
  const pick = (l: Level) => {
    sound.success()
    onPick(l)
  }
  return (
    <div className="gate">
      <nav className="gate-langs">
        {LANGS.map((l) => (
          <button
            key={l}
            className={l === lang ? 'lang-btn active' : 'lang-btn'}
            onClick={() => {
              sound.click()
              onLang(l)
            }}
            title={LANG_LABELS[l]}
          >
            {l === 'ar' ? 'ع' : l.toUpperCase()}
          </button>
        ))}
      </nav>
      <div className="gate-inner">
        <h1 className="gate-title">{t(lang, 'welcomeTitle')}</h1>
        <p className="gate-sub">{t(lang, 'welcomeSub')}</p>
        <div className="gate-cards">
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              className={l.id === current ? 'gate-card active' : 'gate-card'}
              style={{ animationDelay: `${i * 0.09}s` }}
              onClick={() => pick(l.id)}
            >
              <span className="gate-icon">
                <Mi name={l.icon} />
              </span>
              <strong>{t(lang, levelKey(l.id))}</strong>
              <span className="gate-desc">{t(lang, levelKey(l.id) + 'Desc')}</span>
            </button>
          ))}
        </div>
        {current && (
          <button className="gate-continue" onClick={() => pick(current)}>
            {t(lang, 'startExploring')} ←
          </button>
        )}
      </div>
    </div>
  )
}
