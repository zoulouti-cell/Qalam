const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict')
const out={}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/futureCatalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:out})
const {FUTURE_GROUPS:groups,FUTURE_TOPICS:topics,resolveFuturePath:route}=out
assert.equal(groups.length,8)
assert.equal(new Set(topics.map(t=>t.id)).size,topics.length,'No duplicate topics')
assert.ok(topics.length>=16)
for(const group of groups)assert.ok(topics.some(t=>t.group===group.id),'Each branch has actual content')
for(const topic of topics){
 assert.ok(groups.some(g=>g.id===topic.group))
 assert.ok(['deployed','pilot','research'].includes(topic.maturity))
 assert.equal(route(topic.id).topic,topic.id)
 assert.equal(route(topic.id).group,topic.group)
 assert.equal(topic.steps.length,3)
 for(const lang of ['ar','fr','en']){
  for(const key of ['title','child','mechanism','evidence','impact','barrier','watch'])assert.ok(topic[key][lang]?.length>10,`${topic.id}: ${key}/${lang}`)
  for(const step of topic.steps)assert.ok(step[lang])
  if(lang!=='ar')for(const key of ['title','child','mechanism','evidence','impact','barrier','watch'])assert.ok(!/[\u0600-\u06ff]/.test(topic[key][lang]),'No Arabic fragments in the other languages')
 }
 assert.ok(topic.sources.length)
 for(const source of topic.sources)assert.equal(new URL(source.url).protocol,'https:')
}
assert.equal(route('ai').group,'ai')
assert.equal(route('energy').group,'energy')
assert.equal(route('stellar-life').spaceLesson,true)
assert.ok(!topics.some(t=>t.id==='stellar-life'),'Astronomy belongs in the space branch')
assert.equal(route('space').group,'space-tech','Old space URL resolves to engineering')
assert.ok(topics.filter(t=>t.group==='ai').every(t=>!t.id.includes('stellar')))
const app=fs.readFileSync('src/App.tsx','utf8')
const futureRender=app.slice(app.indexOf(') : showFuture ? ('),app.indexOf(') : showLab ? ('))
assert.ok(!futureRender.includes('<Atlas'),'Future pages must not append an unrelated atlas branch')
assert.ok(!fs.readFileSync('src/FrontierExplorer.tsx','utf8').includes('StellarLifecycle'))
assert.ok(fs.readFileSync('src/Atlas.tsx','utf8').includes('<StellarLifecycle'),'Preserve the stellar lab in space')
console.log(`${topics.length} future topics / ${groups.length} paths passed: routing, three-language editions, sources, maturity and astronomy separation.`)
