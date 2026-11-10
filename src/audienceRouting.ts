import type { Level } from './content'
/** Saved audience is authoritative. Links and history may never switch it. */
export function routeForAudience(route:string,level:Level|null):string {
  if(!level)return route
  const audience=level==='kids'?'kids':'academic'
  if(level==='kids'&&/^(?:cosmos|mars)$/.test(route))return 'explorer/kids/space/time'
  return route.replace(/^(explorer\/)(kids|academic)(?=\/|$)/,`$1${audience}`)
    .replace(/([?&]audience=)(kids|academic)(?=&|$)/,`$1${audience}`)
}
export const journeyName=(level:Level,lang:'ar'|'fr'|'en')=>level==='kids'
  ?{ar:'المستكشف الصغير',fr:'Petit explorateur',en:'Young Explorer'}[lang]
  :{ar:'الرحالة الكبير',fr:'Grand voyageur',en:'Great Voyager'}[lang]
