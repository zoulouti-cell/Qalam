const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict')
async function load(name){return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))}
const article=(id,content)=>({id,cat:{ar:'علوم',fr:'Sciences',en:'Science'},content,related:[]})
const text=(title,body=['A complete paragraph describing the subject in detail.'])=>({title,summary:'Summary',body})
;(async()=>{
  const {reconcileArticles,articleMatchesId}=await load('articleCollection')
  const sameId=reconcileArticles([article('reused',{en:text('Ocean')}),article('reused',{en:text('Poetry')})])
  assert.equal(sameId.length,2,'Reused import IDs must not erase distinct subjects')
  assert.equal(new Set(sameId.map(a=>a.id)).size,2)
  const duplicate=reconcileArticles([article('first',{en:text('The Sun')}),article('legacy',{en:text('Sun')})])
  assert.equal(duplicate.length,1);assert.ok(articleMatchesId(duplicate[0],'legacy'))
  const bridge=reconcileArticles([article('arabic',{ar:text('الجبر')}),article('french',{fr:text('Algèbre')}),article('linked',{ar:text('الجبر'),fr:text('Algèbre'),en:text('Algebra')})])
  assert.equal(bridge.length,1);assert.equal(Object.keys(bridge[0].content).length,3)
  const ambiguous=reconcileArticles([article('a',{en:text('Mercury'),fr:text('Mercure (planète)')}),article('b',{en:text('Mercury'),fr:text('Mercure (élément)')})])
  assert.equal(ambiguous.length,2,'Homonyms with contradictory translations need distinct subjects')
  const {EDITORIAL_BATCH}=await load('editorialBatch'); const {EDITORIAL_EXTENSIONS}=await load('editorialExtensions')
  const manifest=JSON.parse(fs.readFileSync('public/data/articleImages.json','utf8'))
  for(const a of [...EDITORIAL_BATCH,...EDITORIAL_EXTENSIONS]){
    assert.ok(a.editorialEdition.parallel)
    for(const lang of ['ar','fr','en']){
      assert.equal(a.content[lang].body.length,6,`${a.id}: academic paragraph sequence`)
      assert.equal(a.kidsContent[lang].body.length,3,`${a.id}: separate child sequence`)
      assert.ok(a.content[lang].body.join(' ').length>a.kidsContent[lang].body.join(' ').length)
      assert.ok(a.sources[lang].length>=2)
      assert.ok(manifest[lang+':'+a.content[lang].title.normalize('NFKC').trim().toLowerCase()],`${a.id}: exact-subject image`)
    }
    const other=article('legacy-'+a.id,{en:text(a.content.en.title,['Unreviewed duplicate paragraph.'])})
    const [merged]=reconcileArticles([a,other]);assert.equal(merged.content.en.body.join(' '),a.content.en.body.join(' '),'Do not append old fragments to a parallel editorial edition')
  }
  console.log('Collection identity, collision preservation, alias, parallel edition and image checks passed')
})().catch(error=>{console.error(error);process.exit(1)})
