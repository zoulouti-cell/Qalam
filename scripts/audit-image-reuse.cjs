const fs=require('fs'),ts=require('typescript'),vm=require('vm')
const cache={}
function load(name){if(cache[name])return cache[name];const context={exports:{},URL,require:ref=>load(ref.replace('./',''))};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return cache[name]=context.exports}
const packs=fs.readdirSync('public/data').filter(f=>/^(?:wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f))
const raw=packs.flatMap(f=>JSON.parse(fs.readFileSync('public/data/'+f,'utf8')))
const {sanitizeArticles}=load('sanitize'),{reconcileArticles}=load('articleCollection')
const articles=reconcileArticles([...load('content').ALL_ARTICLES_FULL,...sanitizeArticles(raw.reverse())]).filter(a=>!load('spaceArticles').isReplacedSpaceArticle(a))
const manifest=JSON.parse(fs.readFileSync('public/data/articleImages.json','utf8')), key=s=>s.normalize('NFKC').trim().toLowerCase()
const byFile=new Map()
for(const article of articles){
  const images=[]
  for(const lang of ['ar','fr','en'])for(const title of [article.content[lang]?.title,...(article.subjectAliases?.[lang]||[])].filter(Boolean)){const image=manifest[lang+':'+key(title)];if(image?.file)images.push(image.file)}
  const unique=[...new Set(images)]
  for(const file of unique){if(!byFile.has(file))byFile.set(file,[]);byFile.get(file).push({id:article.id,branch:article.cat?.en||article.cat?.ar||'',titles:Object.fromEntries(['ar','fr','en'].filter(l=>article.content[l]?.title).map(l=>[l,article.content[l].title]))})}
}
const repeated=[...byFile].filter(([,subjects])=>new Set(subjects.map(x=>x.id)).size>1).map(([file,subjects])=>({file,subjects})).sort((a,b)=>b.subjects.length-a.subjects.length)
fs.writeFileSync('reports/image-reuse-review.json',JSON.stringify(repeated,null,2))
console.log(JSON.stringify({subjects:articles.length,uniqueFiles:byFile.size,reusedFiles:repeated.length,extraSubjectUses:repeated.reduce((sum,item)=>sum+item.subjects.length-1,0),examples:repeated.slice(0,15)},null,2))
