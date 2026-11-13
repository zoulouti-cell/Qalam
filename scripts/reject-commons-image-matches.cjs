const fs=require('fs'),ts=require('typescript'),vm=require('vm')
const rejectedIds=new Set(['w-58401','w-13891','morocco','m-382','m-30813','m-179--1du2pfg','m-126--o3dnh1','w-70906','m-387--jvjj6g','n-1071','n-680','n-621','n-384','m-87313','w-73556','n-640','n-738','n-636','w-30813','m-649--jchfe5','w-95913','n-803','w-98342'])
const reasons={
  'm-649--jchfe5':'Matches for “Life” used a South Vietnam banknote or the French place-name Val-de-Vie; neither illustrates biological life.',
  'm-387--jvjj6g':'The photograph shows agricultural bales wrapped in plastic film, while the article is the 2014 feature film Plastic.',
  'w-95913':'The photograph documents a specific operation involving twisted cysts, not the article’s general extracorporeal medical techniques.',
  'n-803':'The article is a disambiguation page; a photograph of the station alone does not represent its several distinct subjects.',
  'w-98342':'The image is a Spanish text about sins and virtues, not a clear visual explanation of philosophical relativism.'
}
const cache={}
function load(name){if(cache[name])return cache[name];const context={exports:{},URL,require:ref=>load(ref.replace('./',''))};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return cache[name]=context.exports}
const packs=fs.readdirSync('public/data').filter(f=>/^(?:wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f))
const raw=packs.flatMap(f=>JSON.parse(fs.readFileSync('public/data/'+f,'utf8')))
const {sanitizeArticles}=load('sanitize'),{reconcileArticles}=load('articleCollection')
const articles=reconcileArticles([...load('content').ALL_ARTICLES_FULL,...sanitizeArticles(raw.reverse())]).filter(a=>!load('spaceArticles').isReplacedSpaceArticle(a))
const manifestFile='public/data/articleImages.json',manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),key=s=>s.normalize('NFKC').trim().toLowerCase()
const owners=new Map()
for(const article of articles)for(const lang of ['ar','fr','en'])for(const title of [article.content[lang]?.title,...(article.subjectAliases?.[lang]||[])].filter(Boolean)){const k=lang+':'+key(title);if(!owners.has(k))owners.set(k,new Set());owners.get(k).add(article.id)}
const reviewFile='reports/commons-search-image-review.json',review=JSON.parse(fs.readFileSync(reviewFile,'utf8')),rejects=review.filter(item=>rejectedIds.has(item.id))
for(const item of rejects){const article=articles.find(a=>a.id===item.id);if(!article)continue;for(const lang of ['ar','fr','en'])for(const title of [article.content[lang]?.title,...(article.subjectAliases?.[lang]||[])].filter(Boolean)){const k=lang+':'+key(title);if(owners.get(k)?.size===1&&manifest[k]?.file===item.file)delete manifest[k]}}
const rejectionFile='reports/commons-search-image-rejections.json'
const previous=fs.existsSync(rejectionFile)?JSON.parse(fs.readFileSync(rejectionFile,'utf8')):[]
const byFile=new Map([...previous,...rejects.map(item=>({...item,reason:reasons[item.id]||'Manual relevance review rejected a lexical or context mismatch; title remains queued for an alternative.'}))].map(item=>[item.id+'\0'+item.file,item]))
fs.writeFileSync(manifestFile,JSON.stringify(manifest));fs.writeFileSync(reviewFile,JSON.stringify(review.filter(item=>!rejectedIds.has(item.id)),null,2));fs.writeFileSync(rejectionFile,JSON.stringify([...byFile.values()],null,2))
console.log(`Removed ${rejects.length} weak matches from ${rejectedIds.size} flagged subjects; preserved shared aliases used by other articles.`)
