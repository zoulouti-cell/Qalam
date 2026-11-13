const fs=require('fs'),ts=require('typescript'),vm=require('vm')
const cache={}
function load(name){if(cache[name])return cache[name];const context={exports:{},URL,require:ref=>load(ref.replace('./',''))};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return cache[name]=context.exports}
const packs=fs.readdirSync('public/data').filter(f=>/^(?:wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f))
const raw=packs.flatMap(f=>JSON.parse(fs.readFileSync('public/data/'+f,'utf8')))
const {sanitizeArticles}=load('sanitize'),{reconcileArticles}=load('articleCollection')
const articles=reconcileArticles([...load('content').ALL_ARTICLES_FULL,...sanitizeArticles(raw.reverse())]).filter(a=>!load('spaceArticles').isReplacedSpaceArticle(a))
const manifestFile='public/data/articleImages.json',manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),key=s=>s.normalize('NFKC').trim().toLowerCase()
const stop=new Set('the a an and of in on at to from by for with le la les de du des un une et en au aux la ال في من على إلى مع عن و'.split(' '))
const tokens=s=>s.normalize('NFKC').toLowerCase().replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N}]+/gu,' ').split(/\s+/).filter(t=>t.length>2&&!stop.has(t))
const owners=new Map(),byFile=new Map()
for(const article of articles){
  const aliases=[]
  for(const lang of ['ar','fr','en'])for(const title of [article.content[lang]?.title,...(article.subjectAliases?.[lang]||[])].filter(Boolean)){const k=lang+':'+key(title);aliases.push({lang,title,key:k});if(!owners.has(k))owners.set(k,new Set());owners.get(k).add(article.id)}
  for(const file of new Set(aliases.map(alias=>manifest[alias.key]?.file).filter(Boolean))){if(!byFile.has(file))byFile.set(file,new Map());byFile.get(file).set(article.id,{article,aliases})}
}
const conflicts=[...byFile].filter(([,subjects])=>subjects.size>1),removed=[],used=[]
for(const [file,subjects] of conflicts){
  const ranked=[...subjects.values()].map(({article,aliases})=>{const titleTokens=new Set(aliases.flatMap(alias=>tokens(alias.title)));const overlap=tokens(file).filter(token=>titleTokens.has(token)).length;return{article,aliases,overlap}}).sort((a,b)=>b.overlap-a.overlap)
  const keep=ranked[0].article.id
  for(const item of ranked.slice(1)){
    let deleted=0
    for(const alias of item.aliases)if(owners.get(alias.key)?.size===1&&manifest[alias.key]?.file===file){delete manifest[alias.key];deleted++}
    if(deleted){removed.push({file,id:item.article.id,keptFor:keep,titles:Object.fromEntries(['ar','fr','en'].filter(lang=>item.article.content[lang]?.title).map(lang=>[lang,item.article.content[lang].title])),deletedKeys:deleted})}
  }
  used.push({file,keptFor:keep,otherSubjects:ranked.slice(1).map(item=>item.article.id)})
}
fs.writeFileSync(manifestFile,JSON.stringify(manifest));fs.writeFileSync('reports/image-reuse-removals.json',JSON.stringify(removed,null,2));fs.writeFileSync('reports/image-reuse-canonical.json',JSON.stringify(used,null,2))
console.log(JSON.stringify({reusedFiles:conflicts.length,subjectsUnassigned:removed.length,keysRemoved:removed.reduce((sum,item)=>sum+item.deletedKeys,0),canonicalGroups:used.length},null,2))
