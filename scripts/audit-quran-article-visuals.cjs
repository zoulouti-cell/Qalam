const fs=require('fs'),ts=require('typescript'),vm=require('vm')
const cache={}
function load(name){if(cache[name])return cache[name];const context={exports:{},URL,require:ref=>load(ref.replace('./',''))};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return cache[name]=context.exports}
const packs=fs.readdirSync('public/data').filter(f=>/^(?:wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f))
const raw=packs.flatMap(f=>JSON.parse(fs.readFileSync('public/data/'+f,'utf8')))
const {sanitizeArticles}=load('sanitize'),{reconcileArticles}=load('articleCollection')
const articles=reconcileArticles([...load('content').ALL_ARTICLES_FULL,...sanitizeArticles(raw.reverse())]).filter(a=>!load('spaceArticles').isReplacedSpaceArticle(a))
const makki='الفاتحة|الأنعام|الأعراف|يونس|هود|يوسف|إبراهيم|الحجر|النحل|الإسراء|الكهف|مريم|طه|الأنبياء|المؤمنون|الفرقان|الشعراء|النمل|القصص|العنكبوت|الروم|لقمان|السجدة|سبأ|فاطر|يس|الصافات|ص|الزمر|غافر|فصلت|الشورى|الزخرف|الدخان|الجاثية|الأحقاف|ق|الذاريات|الطور|النجم|القمر|الواقعة|الملك|القلم|الحاقة|المعارج|نوح|الجن|المزمل|المدثر|القيامة|المرسلات|النبأ|النازعات|عبس|التكوير|الانفطار|المطففين|الانشقاق|البروج|الطارق|الأعلى|الغاشية|الفجر|البلد|الشمس|الليل|الضحى|الشرح|التين|العلق|القدر|العاديات|القارعة|التكاثر|العصر|الهمزة|الفيل|قريش|الماعون|الكوثر|الكافرون|المسد|الإخلاص|الفلق|الناس'.split('|')
const madani='البقرة|آل عمران|النساء|المائدة|الأنفال|التوبة|الرعد|الحج|النور|الأحزاب|محمد|الفتح|الحجرات|الرحمن|الحديد|المجادلة|الحشر|الممتحنة|الصف|الجمعة|المنافقون|التغابن|الطلاق|التحريم|الإنسان|البينة|الزلزلة|النصر'.split('|')
const status=new Map([...makki.map(n=>[n,'makki']),...madani.map(n=>[n,'madani'])])
const aliases=new Map([['آل عمران','آل عمران'],['ال عمران','آل عمران'],['الإنسان','الإنسان'],['الانسان','الإنسان'],['الرحمن','الرحمن'],['سبأ','سبأ'],['ص','ص'],['يس','يس'],['طه','طه'],['ق','ق']])
const surahNames=[...status.keys()].sort((a,b)=>b.length-a.length)
const phrase=new RegExp(`(?:سورة|سورتي|في سورة|من سورة)\\s*(?:ال)?(${surahNames.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})(?![\\p{L}])`,'gu')
const references=new RegExp(`(?:^|[\\s،؛([{])(${surahNames.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\s*(?:سورة)?\\s*[:：]\\s*[\\d٠-٩]+`,'gu')
const surahOrder='الفاتحة|البقرة|آل عمران|النساء|المائدة|الأنعام|الأعراف|الأنفال|التوبة|يونس|هود|يوسف|الرعد|إبراهيم|الحجر|النحل|الإسراء|الكهف|مريم|طه|الأنبياء|الحج|المؤمنون|النور|الفرقان|الشعراء|النمل|القصص|العنكبوت|الروم|لقمان|السجدة|الأحزاب|سبأ|فاطر|يس|الصافات|ص|الزمر|غافر|فصلت|الشورى|الزخرف|الدخان|الجاثية|الأحقاف|محمد|الفتح|الحجرات|ق|الذاريات|الطور|النجم|القمر|الرحمن|الواقعة|الحديد|المجادلة|الحشر|الممتحنة|الصف|الجمعة|المنافقون|التغابن|الطلاق|التحريم|الملك|القلم|الحاقة|المعارج|نوح|الجن|المزمل|المدثر|القيامة|الإنسان|المرسلات|النبأ|النازعات|عبس|التكوير|الانفطار|المطففين|الانشقاق|البروج|الطارق|الأعلى|الغاشية|الفجر|البلد|الشمس|الليل|الضحى|الشرح|التين|العلق|القدر|البينة|الزلزلة|العاديات|القارعة|التكاثر|العصر|الهمزة|الفيل|قريش|الماعون|الكوثر|الكافرون|النصر|المسد|الإخلاص|الفلق|الناس'.split('|')
const manualSurahs={'m-40--r1gs1h':'الشورى','m-430--6izpeg':'آل عمران','m-31--1x5wf6b':'النور','m-4--1h4grib':'الحجرات'}
const manualMixed=new Set(['m-1208','m-434--qdrpht','m-369--1upuue8'])
const explicitVerse=/﴿|﴾|قال(?:\s+الله)?\s+تعالى|قوله\s+تعالى|الآية\s*(?:\(|رقم|الكريمة)|(?:سورة|آية)\s+[\p{L}ء-ي]+\s*\(?\s*\d{1,3}\s*[:/،]\s*\d{1,3}/u
const quranContext=/القرآن|قرآنية|آيات\s+(?:القرآن|قرآنية)|آية\s+(?:من\s+القرآن|قرآنية|الكرسي|النور|الكلالة|المداينة|المودة|وإن\s+يكاد)|الآية\s+(?:الكريمة|القرآنية)|سورة\s+[^\s،.]{2,}|قال\s+(?:الله\s+)?تعالى/u
const result=[],unclassified=[]
for(const article of articles){
  const parts=Object.values(article.content).filter(Boolean)
  const text=parts.flatMap(c=>[c.title,c.summary,...(c.body||[])]).filter(Boolean).join('\n')
  if(!explicitVerse.test(text)&&!quranContext.test(text))continue
  explicitVerse.lastIndex=0
  const hasVerseText=/﴿[^﴾]{5,}﴾|قال(?:\s+الله)?\s+تعالى|قوله\s+تعالى|(?:الآية|آية)\s*\d+|[«“"](?=[^»”"]{30,}[»”"])[^»”"]{30,}[»”"]/u.test(text)
  // Do not mistake long quotations (often hadith, legal texts, or article titles)
  // for Quran verses. These markers specifically indicate a Quran quotation.
  const explicitQuranQuote=/﴿[^﴾]{5,}﴾|قال(?:\s+الله)?\s+تعالى|قوله\s+تعالى|الآية\s+الكريمة/u.test(text)
  const found=[...text.matchAll(phrase),...text.matchAll(references)].map(m=>aliases.get(m[1])||m[1]).filter(n=>status.has(n))
  const hasVerseMarker=/﴿|﴾|قال(?:\s+الله)?\s+تعالى|قوله\s+تعالى|الآية|آية\s+\d/u.test(text)
  if(hasVerseMarker)for(const match of text.matchAll(/(?:سورة\s*)?(\d{1,3}|[٠-٩]{1,3})\s*[:/]\s*(\d{1,3}|[٠-٩]{1,3})/gu)){const chapter=Number(match[1].replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));const name=surahOrder[chapter-1];if(name&&status.has(name))found.push(name)}
  if(manualSurahs[article.id])found.push(manualSurahs[article.id])
  const kinds=[...new Set(found.map(n=>status.get(n)))]
  // A long quoted passage in a Quran-specific context is included as mixed
  // when no surah can be identified. Showing both places avoids assigning a
  // sacred-site image to an unsupported Makki/Madani classification.
  const kind=manualMixed.has(article.id)||kinds.length>1?'mixed':kinds.length===1?kinds[0]:(explicitQuranQuote||hasVerseText)?'mixed':'review'
  const row={id:article.id,branch:article.cat?.en||article.cat?.ar||'',titles:Object.fromEntries(['ar','fr','en'].filter(l=>article.content[l]?.title).map(l=>[l,article.content[l].title])),surahs:[...new Set(found)],kind,hasVerseText,evidence:text.match(/﴿[^﴾]{0,220}﴾|قال(?:\s+الله)?\s+تعالى.{0,180}|(?:سورة|آية)\s+[^\n،.]{0,100}/u)?.[0]||''}
  // A named surah provides a reliable Makki/Madani classification even when
  // the article discusses the surah without quoting a verse. For a clear Quran
  // quote with no identifiable surah, show both places instead of guessing.
  if(kind==='review')unclassified.push(row);else result.push(row)
}
fs.mkdirSync('reports',{recursive:true})
const visualMap=Object.fromEntries(result.map(row=>[row.id,row.kind]))
fs.writeFileSync('src/quranArticleVisuals.ts',`export type QuranVisualKind = 'makki' | 'madani' | 'mixed'\nexport const QURAN_ARTICLE_VISUALS: Record<string, QuranVisualKind> = ${JSON.stringify(visualMap,null,2)}\n`)
fs.writeFileSync('reports/quran-article-visuals.json',JSON.stringify({method:'Classify identified surahs as Makki or Madani for editorial metadata, while using the same Quran manuscript image for Makki, Madani, and mixed articles. General Quran mentions without a quoted passage remain available for review.',classified:result,review:unclassified},null,2))
console.log(JSON.stringify({articles:articles.length,classified:result.length,makki:result.filter(x=>x.kind==='makki').length,madani:result.filter(x=>x.kind==='madani').length,mixed:result.filter(x=>x.kind==='mixed').length,manualReview:unclassified.length},null,2))
