// Conservative fallback for articles without a free Wikipedia lead image.
// Searches Wikimedia Commons by the article's exact title aliases, then only
// accepts files whose filename clearly matches at least one title.
const fs = require('fs')
const queue = JSON.parse(fs.readFileSync('reports/editorial-progress.json','utf8')).imageQueue
const manifestFile = 'public/data/articleImages.json'
const manifest = JSON.parse(fs.readFileSync(manifestFile,'utf8'))
const key = value => value.normalize('NFKC').trim().toLowerCase()
const stop = new Set('the a an and or of in on at to from by for with into from de du des les la le l et en au aux un une der die das und von im in am el la los las y del da do dos di degli e o os as um uma para por com al fi wa min bi li ila عن من في على إلى مع و ثم هذا هذه ذلك هو هي التي الذي إلى أن على عن بين كما من لدى بها لها فيه إلى ذلك بعد كان كانت وهو هي يتم يتمثل تعتبر يعرف يعرف بصفته'.split(' '))
const ambiguousSingleWords = new Set('rally power date life vie art history science country bank post model cell spring light common work law state barn dying luxon morocco maroc athabasca adrenaline'.split(' '))
const delay = ms => new Promise(resolve => setTimeout(resolve,ms))
const limit = Number(process.argv.find(arg=>arg.startsWith('--limit='))?.split('=')[1]||Infinity)
const language = process.argv.find(arg=>arg.startsWith('--language='))?.split('=')[1]||'en'
const idArg=process.argv.find(arg=>arg.startsWith('--ids='))?.split('=')[1]
const idFilter=idArg?new Set(idArg.split(',').filter(Boolean)):undefined
const reusedOnly=process.argv.includes('--reused-only')
const reusedIds=reusedOnly&&fs.existsSync('reports/image-reuse-review.json')?new Set(JSON.parse(fs.readFileSync('reports/image-reuse-review.json','utf8')).flatMap(group=>group.subjects.map(subject=>subject.id))):undefined
const rejectionRows=fs.existsSync('reports/commons-search-image-rejections.json')?JSON.parse(fs.readFileSync('reports/commons-search-image-rejections.json','utf8')):[]
const rejectedFiles=new Map()
for(const row of rejectionRows){if(!rejectedFiles.has(row.id))rejectedFiles.set(row.id,new Set());rejectedFiles.get(row.id).add(row.file)}
const titleAliases = subject => Object.entries(subject.titles||{}).filter(([,title])=>title).map(([lang,title])=>({lang,title}))
const tokenise = value => value.normalize('NFKC').toLowerCase().replace(/\.[a-z0-9]{2,5}$/i,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).filter(token=>token.length>2&&!stop.has(token))
const candidates = queue.filter(subject=>(!idFilter||idFilter.has(subject.id))&&(!reusedIds||reusedIds.has(subject.id))).slice(0,limit).filter(subject=>!titleAliases(subject).some(({lang,title})=>manifest[lang+':'+key(title)]))
function queryTitle(subject){return subject.titles?.[language]||subject.titles?.en||subject.titles?.fr||subject.titles?.ar||''}
function queryKeywords(subject){
 const titleTokens=new Set(titleAliases(subject).flatMap(item=>tokenise(item.title)))
 const synopsis=subject.summaries?.[language]||subject.summaries?.en||subject.summaries?.fr||subject.summaries?.ar||''
 return [...new Set(tokenise(synopsis).filter(token=>!titleTokens.has(token)&&token.length>=4))].slice(0,4)
}
const batches=[]; let current=[],queryLength=0
function queryFor(item){const exact=`"${item.title}"`;const synopsis=item.keywords.length>=2?`"${item.keywords.join(' ')}"`:'';return synopsis?`(${exact} OR ${synopsis})`:exact}
for(const subject of candidates){const title=queryTitle(subject).replace(/"/g,'').split(/\s+/).slice(0,10).join(' ');if(!title)continue;const keywords=queryKeywords(subject);const item={subject,title,keywords};const cost=queryFor(item).length+(current.length?4:0);if(current.length&&(current.length>=14||queryLength+cost>285)){batches.push(current);current=[];queryLength=0}current.push(item);queryLength+=queryFor(item).length+(current.length>1?4:0)}
if(current.length)batches.push(current)
console.log(`Commons search subjects ${candidates.length}; batches ${batches.length}`)

async function request(url) {
  for(let attempt=0;attempt<4;attempt++){
    const response=await fetch(url,{headers:{'User-Agent':'QalamEncyclopedia/1.0 (educational image metadata)'},signal:AbortSignal.timeout(30000)})
    if(response.ok){const data=await response.json();if(data.error)throw Error(data.error.info);return data}
    if(![429,500,502,503,504].includes(response.status)||attempt===3)throw Error(`HTTP ${response.status}`)
    const retryAfter=Number(response.headers.get('retry-after')||0),seconds=response.status===429?Math.max(30,retryAfter||30):Math.max(8,retryAfter||8*(attempt+1))
    console.log(`Commons returned ${response.status}; retrying in ${seconds}s`);await delay(Math.min(seconds,90)*1000)
  }
}
function score(subject,result){
  const aliases=titleAliases(subject)
  const file=result.title.replace(/^File:/,'')
  const filename=tokenise(file)
  const description=tokenise((result.snippet||'').replace(/<[^>]+>/g,' '))
  const evidence=new Set([...filename,...description])
  const synopsisTokens=queryKeywords(subject)
  const synopsisHits=synopsisTokens.filter(token=>evidence.has(token)).length
  const plainFile=key(file.replace(/\.[^.]+$/,'')).replace(/[^\p{L}\p{N}]+/gu,' ').trim()
  let best={score:0,lang:'',title:'',overlap:0,total:0}
  for(const {lang,title} of aliases){
    const tokens=[...new Set(tokenise(title))]
    if(!tokens.length)continue
    const fileHits=tokens.filter(token=>filename.includes(token)).length
    const descHits=tokens.filter(token=>description.includes(token)).length
    const plainTitle=key(title).replace(/[^\p{L}\p{N}]+/gu,' ').trim()
    const phraseAt=plainFile.indexOf(plainTitle)
    const exactPhrase=phraseAt>=0&&plainFile.slice(0,phraseAt).trim().split(/\s+/).filter(Boolean).length<=4
    const overlap=Math.max(fileHits,Math.min(tokens.length,Math.ceil((fileHits+descHits*0.5)*10)/10))
    const fraction=overlap/tokens.length
    const hasNumeral=/\b(?:\d+|ii|iii|iv|v|vi|vii|viii|ix|x)\b/i.test(title)
    const allWordsInFilename=fileHits===tokens.length
    const valid=exactPhrase&&(!hasNumeral||allWordsInFilename)&&(tokens.length>1||!ambiguousSingleWords.has(tokens[0]))||(tokens.length===1&&fileHits===1&&tokens[0].length>=5&&!ambiguousSingleWords.has(tokens[0]))||(tokens.length>1&&allWordsInFilename)
    const synopsisConfirmed=synopsisHits>=2&&fileHits>=1&&tokens.length>1
    const value=valid?fraction+(exactPhrase?1:0)+fileHits*0.05:synopsisConfirmed?0.8+fraction+synopsisHits*0.05:0
    if(value>best.score)best={score:value,lang,title,overlap:fileHits,total:tokens.length}
  }
  return best
}
async function main(){
 let newSubjects=0,review=fs.existsSync('reports/commons-search-image-review.json')?JSON.parse(fs.readFileSync('reports/commons-search-image-review.json','utf8')):[]
 const usedFiles=new Set(Object.values(manifest).map(image=>image.file).filter(Boolean))
 for(let index=0;index<batches.length;index++){
  const batch=batches[index]
  const searchTerms=batch.map(queryFor)
  if(!searchTerms.length)continue
  try{
   await delay(1800)
   const searchParams=new URLSearchParams({action:'query',format:'json',list:'search',srsearch:searchTerms.join(' OR '),srnamespace:'6',srlimit:'200',srprop:'snippet'})
   const searchData=await request(`https://commons.wikimedia.org/w/api.php?${searchParams}`)
   const results=searchData.query?.search||[]
   const selected=new Map()
   for(const {subject} of batch){
    const ranked=results.map(result=>({result,match:score(subject,result)})).sort((a,b)=>b.match.score-a.match.score)
    const best=ranked.find(candidate=>candidate.match.score>0&&!usedFiles.has(candidate.result.title.replace(/^File:/,''))&&!rejectedFiles.get(subject.id)?.has(candidate.result.title.replace(/^File:/,'')))
    if(best){selected.set(subject.id,{subject,...best});usedFiles.add(best.result.title.replace(/^File:/,''))}
   }
   if(selected.size){
    await delay(1800)
    const files=[...new Set([...selected.values()].map(item=>item.result.title))]
    const infoParams=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1200',titles:files.join('|')})
    const info=await request(`https://commons.wikimedia.org/w/api.php?${infoParams}`)
    const pages=Object.values(info.query?.pages||{})
    const byFile=new Map(pages.filter(page=>page.imageinfo?.[0]?.thumburl&&page.imageinfo[0].extmetadata?.LicenseShortName?.value).map(page=>[page.title,page.imageinfo[0]]))
    for(const item of selected.values()){
     const meta=byFile.get(item.result.title); if(!meta)continue
     const file=item.result.title.replace(/^File:/,'')
     if(!/\.(?:jpe?g|png|webp|gif|svg)$/i.test(file)||/icon|logo|flag|coat.of.arms|pictogram|symbol|emblem|placeholder|disambig|signature|association|rally|barn.clip.art/i.test(file))continue
     const image={url:meta.thumburl,file,source:`https://commons.wikimedia.org/wiki/${encodeURIComponent(item.result.title.replace(/ /g,'_'))}`,title:item.result.title.replace(/^File:/,''),kind:'commons-title-search',caption:{en:`Wikimedia Commons image selected from an exact-title search for “${item.match.title}”.`}}
     for(const {lang,title} of titleAliases(item.subject))manifest[lang+':'+key(title)]=image
     newSubjects++
     review.push({id:item.subject.id,branch:item.subject.branch,titles:item.subject.titles,file,score:item.match.score,matchedTokens:item.match.overlap+'/'+item.match.total})
    }
   }
  }catch(error){console.log(`Search batch ${index+1}/${batches.length} failed: ${error.message}`)}
  fs.writeFileSync(manifestFile,JSON.stringify(manifest))
  fs.writeFileSync('reports/commons-search-image-review.json',JSON.stringify(review,null,2))
  if((index+1)%5===0)console.log(`Batches ${index+1}/${batches.length}; new exact-title files ${newSubjects}; image keys ${Object.keys(manifest).length}`)
 }
 console.log(`Commons search finished: ${newSubjects} matched subjects; ${Object.keys(manifest).length} image keys`)
}
main().catch(error=>{console.error(error);process.exitCode=1})
