import { useRef, useState } from 'react'
import Mi from './Mi'
import { LANGS, LANG_LABELS, t, type Lang } from './i18n'
import type { Level } from './content'
import { journeyName } from './audienceRouting'
import { sound } from './sound'
import { publicUrl } from './publicUrl'

const chapters = {
  ar: ['نافذة تفتح السؤال', 'رحلة تكشف الحكاية', 'مختبر يجعل الفكرة مرئية', 'عالم الغد يبدأ بالمعرفة', 'تعلّم بطريقتك'],
  fr: ['Une fenêtre sur la question', 'Un voyage dans son histoire', 'Un laboratoire pour voir et essayer', 'Demain commence par comprendre', 'Apprenez à votre façon'],
  en: ['A window opens a question', 'A journey traces its story', 'A lab makes ideas visible', 'Tomorrow begins with understanding', 'Learn your way'],
}

export default function LevelGate({lang,current,onPick,onLang}:{lang:Lang;current:Level|null;onPick:(level:Level,destination?:'home'|'time'|'place')=>void;onLang:(lang:Lang)=>void}) {
 const video = useRef<HTMLVideoElement>(null)
 const [phase,setPhase] = useState<'film'|'choices'>(() => current || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'choices' : 'film')
 const [chapter,setChapter] = useState(0)
 const [music,setMusic] = useState(false)
 const pick=(level:Level,destination:'home'|'time'|'place')=>{sound.success();onPick(level,destination)}
 const reveal=()=>{video.current?.pause();setPhase('choices')}
 const replay=()=>{setPhase('film');setChapter(0);if(video.current){video.current.currentTime=0;video.current.muted=!music;void video.current.play().catch(()=>setPhase('choices'))}}
 const toggleMusic=()=>{const next=!music;setMusic(next);if(video.current){video.current.muted=!next;if(video.current.paused&&phase==='film')void video.current.play().catch(()=>{})}}
 const words=lang==='ar'?{children:'المستكشف الصغير',adults:'الرحالة الكبير',child:'حتى 15 سنة: صور وتجارب وأسئلة تقود إلى الفهم.',adult:'شواهد وتحليل ونصوص أعمق ومسارات بحث.',enter:'ادخل موسوعة قلم',journey:'رحلة قلم',time:'المسار الزمني',place:'المسار المكاني',note:'اختر جمهورك الآن؛ يمكنك تغييره لاحقًا من الشريط الجانبي.',skip:'تجاوز المقدمة',replay:'أعد مشاهدة الفيلم',sound:'استمع إلى الموسيقى',mute:'اكتم الموسيقى',scene:'فيلم مدخل موسوعة قلم'}:lang==='fr'?{children:'Jeune explorateur',adults:'Grand voyageur',child:'Jusqu’à 15 ans : images, expériences et questions pour comprendre.',adult:'Sources, analyses, textes approfondis et pistes de recherche.',enter:'Entrer dans Qalam',journey:'Parcours Qalam',time:'Parcours chronologique',place:'Parcours géographique',note:'Choisissez votre public ; changez-le ensuite dans la barre latérale.',skip:'Passer l’introduction',replay:'Revoir le film',sound:'Activer la musique',mute:'Couper la musique',scene:'Film d’introduction de Qalam'}:{children:'Young explorer',adults:'Advanced explorer',child:'Up to 15: images, experiments, and questions that build understanding.',adult:'Evidence, analysis, deeper texts, and research paths.',enter:'Enter Qalam',journey:'Qalam Journey',time:'Timeline path',place:'Spatial path',note:'Choose your audience; you can switch later in the sidebar.',skip:'Skip introduction',replay:'Watch the film again',sound:'Turn on music',mute:'Mute music',scene:'Qalam encyclopedia introduction film'}
 return <div className="gate audience-entry qalam-entrance"><nav className="gate-langs" aria-label={lang==='ar'?'اللغة':'Language'}>{LANGS.map(l=><button key={l} className={l===lang?'lang-btn active':'lang-btn'} onClick={()=>onLang(l)} title={LANG_LABELS[l]}>{l==='ar'?'ع':l.toUpperCase()}</button>)}</nav><div className="gate-inner">
   <div className={'intro-film '+(phase==='choices'?'intro-film-complete':'')}>
     <video ref={video} src={publicUrl('assets/video/qalam-intro-restored-v4.webm')} poster={publicUrl('assets/img/qalam-intro-library-v1.jpg')} autoPlay={phase==='film'} muted={!music} playsInline preload="metadata" aria-label={words.scene} onTimeUpdate={event=>{const time=event.currentTarget.currentTime;setChapter(time<3.5?0:time<6.7?1:time<10?2:time<13.5?3:4)}} onEnded={()=>setPhase('choices')} onError={()=>setPhase('choices')}/>
     <div className="intro-film-shade" aria-hidden="true"/>
     <div className="intro-film-top"><span className="intro-film-brand">{lang==='ar'?'موسوعة قلم':lang==='fr'?'Encyclopédie Qalam':'Qalam Encyclopedia'} <span>✦</span></span><div className="intro-film-actions"><button type="button" onClick={toggleMusic} aria-label={music?words.mute:words.sound}><Mi name={music?'volume_up':'volume_off'}/>{music?words.mute:words.sound}</button>{phase==='film'?<button type="button" onClick={reveal}>{words.skip}<Mi name="arrow_forward"/></button>:<button type="button" onClick={replay}><Mi name="replay"/>{words.replay}</button>}</div></div>
     {phase==='film'&&<div className="intro-film-caption" aria-live="off"><h1 key={lang+chapter}>{chapters[lang][chapter]}</h1><div className="intro-film-progress" aria-hidden="true"><i style={{width:`${(chapter+1)*20}%`}}/></div></div>}
   </div>
   {phase==='choices'&&<div className="intro-choices"><div className="intro-choices-heading"><span className="intro-choices-kicker">{lang==='ar'?'النافذة · الرحلة · الاكتشاف · المستقبل · التعلم':lang==='fr'?'Fenêtre · Voyage · Découverte · Avenir · Apprentissage':'Window · Journey · Discovery · Future · Learning'}</span><h1 className="gate-title">{t(lang,'welcomeTitle')}</h1><p className="gate-sub">{lang==='ar'?'موسوعة قلم، اكتشف وتعلم.':lang==='fr'?'Encyclopédie Qalam : explorez et apprenez.':'Qalam Encyclopedia: explore and learn.'}</p></div><div className="entry-parallel-paths">{(['kids','school'] as const).map(path=><section key={path} className={'entry-path-card path-'+path+(current===path?' active':'')}><span className="entry-path-icon"><Mi name={path==='kids'?'explore':'menu_book'}/></span><h2>{journeyName(path,lang)}</h2><p>{path==='kids'?words.child:words.adult}</p><button type="button" className="entry-path-start" onClick={()=>pick(path,'home')}>{words.enter}<Mi name="arrow_forward"/></button><div className="entry-journey"><small>{words.journey}</small><h3>{journeyName(path,lang)}</h3><button type="button" onClick={()=>pick(path,'time')}><Mi name="timeline"/>{words.time}</button><button type="button" onClick={()=>pick(path,'place')}><Mi name="public"/>{words.place}</button></div></section>)}</div><p className="entry-path-note">{words.note}</p></div>}
   {phase==='choices'&&<p className="intro-music-credit"><a href="https://commons.wikimedia.org/wiki/File:Reaching_The_Sky_by_Alexander_Nakarada.ogg" target="_blank" rel="noreferrer">Reaching The Sky — Alexander Nakarada</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>}
 </div></div>
}
