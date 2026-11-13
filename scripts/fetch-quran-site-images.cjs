const fs=require('fs')
const manifestFile='public/data/articleImages.json'
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'))
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const sites=[
  {keys:['quran-visual:makki','quran-visual:madani'],title:'File:Mamluk era Quran, circa 1380, open to sura 16.jpg',caption:{ar:'مصحف من العصر المملوكي مؤرخ نحو سنة 1380، مفتوح على سورة النحل؛ صورة توضيحية للمصحف الشريف وليست دليلاً على مكان نزول الآيات.',fr:'Coran de l’époque mamelouke, daté vers 1380 et ouvert à la sourate 16 ; illustration du manuscrit, sans indication du lieu de révélation.',en:'A Mamluk-era Quran manuscript dated around 1380, open to Surah 16; an illustration of the Quran, not evidence of where a verse was revealed.'}}
]
async function main(){
  for(const site of sites){
    await delay(1200)
    const params=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1440',titles:site.title})
    const response=await fetch(`https://commons.wikimedia.org/w/api.php?${params}`,{headers:{'User-Agent':'QalamEncyclopedia/1.0 (educational image attribution)'},signal:AbortSignal.timeout(30000)})
    if(!response.ok)throw Error(`Commons image lookup failed: HTTP ${response.status}`)
    const data=await response.json(),page=Object.values(data.query?.pages||{})[0],info=page?.imageinfo?.[0]
    if(!info?.thumburl||!info.extmetadata?.LicenseShortName?.value)throw Error(`Image or free license unavailable for ${site.title}`)
    const image={url:info.thumburl,file:page.title.replace(/^File:/,''),source:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,title:page.title.replace(/^File:/,''),kind:'quran-mushaf',creator:'Mustafa-trit20',license:info.extmetadata.LicenseShortName.value,licenseUrl:info.extmetadata.LicenseUrl?.value||'',caption:site.caption}
    for(const key of site.keys)manifest[key]=image
    console.log(`${site.keys.join(', ')}: ${image.file} · ${image.license}`)
  }
  fs.writeFileSync(manifestFile,JSON.stringify(manifest))
  console.log(`Saved sacred-site photos with attribution keys; manifest contains ${Object.keys(manifest).length} image keys.`)
}
main().catch(error=>{console.error(error);process.exitCode=1})
