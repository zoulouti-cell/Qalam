import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import { playTopicSound, sound, speak, stopSpeak, type TopicSoundKind } from './sound'

export default function TopicExperience({lang,title,explanation,subject}:{lang:Lang;title:string;explanation:string;subject:string}) {
  const [speaking,setSpeaking]=useState(false),[playing,setPlaying]=useState(false),[message,setMessage]=useState('')
  const stop=useRef<()=>void>(()=>{}),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined)
  useEffect(()=>{setPlaying(false);setSpeaking(false);setMessage('');return()=>{stop.current();clearTimeout(timer.current);stopSpeak()}},[title])
  const words=lang==='ar'?{title:'اسمع، شاهد، ثم اكتشف',read:'استمع لشرح الموضوع',stop:'إيقاف الصوت',try:'جرّب الصوت التعليمي',muted:'الصوت مكتوم. يمكنك تشغيله من زر الصوت في الشريط.',error:'تعذر تشغيل القراءة بهذه اللغة على جهازك.',note:'هذه أصوات تعليمية تمثيلية وليست تسجيلات حقيقية. لا ينتقل الصوت في فراغ الفضاء.',generic:'هذه نغمات تعليمية تمثيلية، وليست تسجيلًا حقيقيًا للموضوع.'}:lang==='fr'?{title:'Écouter, observer, découvrir',read:'Écouter l’explication',stop:'Arrêter le son',try:'Essayer le son pédagogique',muted:'Le son est coupé. Activez-le dans la barre.',error:'La lecture dans cette langue est indisponible sur cet appareil.',note:'Sons pédagogiques de synthèse, pas des enregistrements réels. Le son ne se propage pas dans le vide.',generic:'Sons pédagogiques de synthèse, pas des enregistrements réels du sujet.'}:{title:'Listen, watch, discover',read:'Listen to the explanation',stop:'Stop sound',try:'Try the learning sound',muted:'Sound is muted. Enable it in the toolbar.',error:'Speech in this language is unavailable on this device.',note:'Illustrative synthetic sounds, not real recordings. Sound does not travel through a vacuum.',generic:'Illustrative synthetic sounds, not actual recordings of the subject.'}
  const text=`${subject} ${title}`
  const kind:TopicSoundKind=/heart|قلب|نبض|cœur|coeur/i.test(text)?'heart':/water|eau|ماء|مياه|محيط|نهر|ocean/i.test(text)?'water':/life|نبات|حيوان|طبيعة|طائر|photosynth|bird|nature/i.test(text)?'nature':/math|algebr|رياض|جبر|حساب|كسر/i.test(text)?'math':'discovery'
  const halt=()=>{stop.current();stopSpeak();clearTimeout(timer.current);setPlaying(false);setSpeaking(false)}
  const read=()=>{halt();setMessage('');if(sound.isMuted()){setMessage(words.muted);return}setSpeaking(true);speak(`${title}. ${explanation}`,lang,()=>setSpeaking(false),()=>{setSpeaking(false);setMessage(words.error)})}
  const effect=()=>{halt();setMessage('');if(sound.isMuted()){setMessage(words.muted);return}stop.current=playTopicSound(kind);setPlaying(true);timer.current=setTimeout(()=>setPlaying(false),2700)}
  return <section className={`topic-experience ${playing||speaking?'is-playing':''}`} aria-label={words.title}>
    <div className="topic-experience-heading"><span aria-hidden="true">♫</span><div><h3>{words.title}</h3><p>{title}</p></div></div>
    <div className="topic-sound-wave" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{'--bar':String((i%5)+1),'--delay':`${i*.045}s`} as React.CSSProperties}/>)}</div>
    <div className="topic-experience-actions"><button onClick={read} aria-pressed={speaking}>{words.read}</button><button onClick={effect} aria-pressed={playing}>{words.try}</button>{(speaking||playing)&&<button onClick={halt}>{words.stop}</button>}</div>
    <small>{/space|فضاء|كوكب|كون|espace/i.test(text)?words.note:words.generic}</small>{message&&<p role="status">{message}</p>}
  </section>
}
