import type { Lang } from './i18n'
export type W=Record<Lang,string>
export const h=(ar:string,fr:string,en:string):W=>({ar,fr,en})
export type HistoryEvent={id:string;year:number;date:W;title:W;regions:string[];child:W;adult:W;refs:string[];symbol:string;visual?:string;coordinates?:[number,number];photo?:{path:string;caption:W;credit:string;source:string;licenseUrl?:string};era?:'ancient'|'medieval'|'independence'|'today'}
export type HistoryRegion={id:string;name:W;lon:number;lat:number;child:W;adult:W}
export type HistoryNote={title:W;child:W;adult:W;refs:string[]}
export type HistoryPerson={name:W;date:string;dateLabel?:W;child:W;adult:W;refs:string[]}
export type HistoryData={id:string;title:W;intro:W;events:HistoryEvent[];spatialEvents?:HistoryEvent[];onlyTimeline?:boolean;regions:HistoryRegion[];notes?:HistoryNote[];people?:HistoryPerson[];sources:Record<string,{name:string;url:string}>}
export const e=(id:string,year:number,date:W,title:W,regions:string[],child:W,adult:W,refs:string[],symbol:string,era?:HistoryEvent['era']):HistoryEvent=>({id,year,date,title,regions,child,adult,refs,symbol,era})
