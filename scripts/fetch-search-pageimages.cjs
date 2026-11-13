// Find free article lead images through Wikipedia's title search when an exact
// page-title lookup fails. Only near-exact title matches are accepted.
const fs=require('fs')
const queue=JSON.parse(fs.readFileSync('reports/editorial-progress.json','utf8')).imageQueue
const manifestFile='public/data/articleImages.json'
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'))
const key=value=>value.normalize('NFKC').trim().toLowerCase()
const normalize=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()
const limit=Number(process.argv.find(arg=>arg.startsWith('--limit='))?.split('=')[1]||100)
const preferred=process.argv.find(arg=>arg.startsWith('--language='))?.split('=')[1]||'en'
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const candidates=queue.filter(subject=>!Object.entries(subject.titles||{}).some(([lang,title])=>title&&manifest[lang+':'+key(title)])).slice(0,limit)
const usedFiles=new Set(Object.values(manifest).map(image=>image.file).filter(Boolean))
const review=fs.existsSync('reports/search-pageimage-review.json')?JSON.parse(fs.readFileSync('reports/search-pageimage-review.json','utf8')):[]
const rejected=new Set(JSON.parse(fs.readFileSync('reports/commons-search-image-rejections.json','utf8')).map(row=>row.id))
function chooseTitle(subject){
  const order=[preferred,'en','fr','ar']
  for(const lang of order){const title=subject.titles?.[lang];if(title)return {lang,title}}
  return undefined
}
function titleScore(target,result){
  const a=normalize(target),b=normalize(result)
  if(!a||!b)return 0
  if(a===b)return 1
  if(b.startsWith(a+' ')||b.startsWith(a+' (')||b.startsWith(a+' -'))return .95
  if(a.startsWith(b+' ')||a.startsWith(b+' ('))return .92
  const at=a.split(' '),bt=new Set(b.split(' ')),overlap=at.filter(word=>bt.has(word)).length
  return overlap/Math.max(at.length,b.split(' ').length)
}
async function request(url){
  for(let attempt=0;attempt<4;attempt++){
    const response=await fetch(url,{headers:{'User-Agent':'QalamEncyclopedia/1.0 (educational image metadata)'},signal:AbortSignal.timeout(30000)})
    if(response.ok){const data=await response.json();if(data.error)throw Error(data.error.info);return data}
    if(response.status===429||[500,502,503,504].includes(response.status)){
      if(attempt===3)throw Error(`HTTP ${response.status}`)
      const seconds=response.status===429?Math.max(30,Number(response.headers.get('retry-after')||30)):8*(attempt+1)
      await delay(Math.min(seconds,90)*1000);continue
    }
    throw Error(`HTTP ${response.status}`)
  }
}
async function main(){
  let found=0
  console.log(`Wikipedia near-exact search: ${candidates.length} subjects`)
  for(let index=0;index<candidates.length;index++){
    const subject=candidates[index],choice=chooseTitle(subject)
    if(!choice||rejected.has(subject.id))continue
    try{
      await delay(900)
      const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',generator:'search',gsrsearch:`"${choice.title.replace(/"/g,'')}"`,gsrnamespace:'0',gsrlimit:'8',prop:'pageimages',piprop:'thumbnail|name',pithumbsize:'1200',pilicense:'free'})
      const data=await request(`https://${choice.lang}.wikipedia.org/w/api.php?${params}`)
      const pages=data.query?.pages||[]
      const ranked=pages.map(page=>({page,score:titleScore(choice.title,page.title)})).sort((a,b)=>b.score-a.score)
      const selected=ranked.find(({page,score})=>score>=.9&&page.thumbnail&&!usedFiles.has(page.pageimage||'')&&/\.(?:jpe?g|png|webp)$/i.test(page.pageimage||'')&&!/icon|logo|flag|coat.of.arms|pictogram|symbol|emblem|placeholder|disambig/i.test(page.pageimage))
      if(!selected)continue
      const page=selected.page,file=page.pageimage
      const image={url:page.thumbnail.source.split('?')[0],file,source:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g,'_'))}`,title:page.title,kind:'wikipedia-search-pageimage',caption:{en:`Free lead image for the closely matching Wikipedia article “${page.title}”.`}}
      for(const [lang,title] of Object.entries(subject.titles||{}))if(title)manifest[lang+':'+key(title)]=image
      usedFiles.add(file);found++
      review.push({id:subject.id,branch:subject.branch,titles:subject.titles,wikipediaTitle:page.title,file,score:selected.score})
    }catch(error){console.log(`Search ${index+1}/${candidates.length} unavailable (${choice.lang}): ${error.message}`)}
    if((index+1)%25===0){fs.writeFileSync(manifestFile,JSON.stringify(manifest));fs.writeFileSync('reports/search-pageimage-review.json',JSON.stringify(review,null,2));console.log(`${index+1}/${candidates.length}; new images ${found}`)}
  }
  fs.writeFileSync(manifestFile,JSON.stringify(manifest))
  fs.writeFileSync('reports/search-pageimage-review.json',JSON.stringify(review,null,2))
  console.log(`Wikipedia search finished: ${found} images added; image keys ${Object.keys(manifest).length}`)
}
main().catch(error=>{console.error(error);process.exitCode=1})
