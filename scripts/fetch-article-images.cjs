// Resolve exact encyclopedia subjects to their Wikipedia lead media. No keyword image search.
const fs = require('fs')
const ts = require('typescript')
const vm = require('vm')
const key = s => s.normalize('NFKC').trim().toLowerCase()
const output = 'public/data/articleImages.json'
const manifest = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {}
const articles = process.argv.includes('--core') ? [] : fs.readdirSync('public/data').filter(f => /^(?:wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f)).flatMap(f => JSON.parse(fs.readFileSync('public/data/' + f, 'utf8')))
const dataJs = ts.transpileModule(fs.readFileSync('src/data.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText
const sandbox={exports:{}};vm.runInNewContext(dataJs,sandbox);articles.push(...sandbox.exports.ARTICLES)
const editorial={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/editorialBatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,editorial);articles.push(...editorial.exports.EDITORIAL_BATCH)
const supplemental = ['Sun','Water','Artificial intelligence','Climate change','Mars','Energy','Atom','Human heart','Hubble Space Telescope','Black hole','Star','Planet','Galaxy','Volcano','Ocean','Cell (biology)','DNA','Human body','Molecule','Wave','Electricity']
for(const title of supplemental) articles.push({content:{en:{title}}})
const jobs={en:new Map(),fr:new Map(),ar:new Map()}
for(const a of articles){const lang=['en','fr','ar'].find(l=>a.content?.[l]?.title);if(!lang)continue;const title=a.content[lang].title;const aliases=Object.entries(a.content).filter(([,c])=>c?.title).map(([l,c])=>l+':'+key(c.title));const existing=aliases.map(k=>manifest[k]).find(Boolean);if(existing){for(const k of aliases)manifest[k]=existing;continue} const group=jobs[lang].get(title)||[];jobs[lang].set(title,[...new Set([...group,...aliases])])}
const batches=[];for(const [lang,map] of Object.entries(jobs)){const entries=[...map];for(let i=0;i<entries.length;i+=30)batches.push({lang,entries:entries.slice(i,i+30)})}
console.log('Exact-subject image batches:',batches.length)
let cursor=0,done=0,failed=0
async function worker(){while(cursor<batches.length){const {lang,entries}=batches[cursor++];await new Promise(r=>setTimeout(r,1400));try{
  const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',redirects:'1',prop:'pageimages',piprop:'thumbnail|name',pithumbsize:'1200',pilicense:'free',titles:entries.map(([t])=>t).join('|')})
  let response=await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`,{headers:{'User-Agent':'QalamEncyclopedia/1.0 (educational image metadata)'},signal:AbortSignal.timeout(25000)});
  if(response.status===429){const pause=Math.min(60000,Math.max(15000,Number(response.headers.get('retry-after')||30)*1000));console.log('Rate limit: pausing',pause/1000,'seconds');await new Promise(r=>setTimeout(r,pause));response=await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`,{signal:AbortSignal.timeout(25000)});if(response.status===429){console.log('Source still rate-limited. Saved partial results; stopping for a later retry.');cursor=batches.length;break}}
  if(!response.ok)throw Error(response.status)
  const data=await response.json();if(data.error)throw Error(data.error.info)
  const redirects=new Map([...(data.query?.normalized||[]),...(data.query?.redirects||[])].map(r=>[r.from,r.to]))
  for(const [original,aliases] of entries){let title=original;for(let i=0;i<6&&redirects.has(title);i++)title=redirects.get(title);const page=data.query?.pages?.find(p=>p.title===title)
    if(!page?.thumbnail||!/\.(?:jpg|jpeg|png|webp)$/i.test(page.pageimage)||/icon|logo|flag|coat.of.arms|pictogram|symbol|emblem|placeholder|disambig/i.test(page.pageimage))continue
    const image={url:page.thumbnail.source.split('?')[0],file:page.pageimage,source:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage.replace(/ /g,'_'))}`,title:page.title}
    for(const alias of aliases)manifest[alias]=image
  }
 }catch(e){failed++;console.log('Batch unavailable:',lang,e.message)}
 done++;fs.writeFileSync(output,JSON.stringify(manifest));if(done%10===0)console.log('Batches',done+'/'+batches.length,'mapped subjects',Object.keys(manifest).length)
}}
worker().then(()=>console.log('Complete:',Object.keys(manifest).length,'language-title images;',failed,'failed batches'))
