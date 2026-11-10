const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict')
const out={}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/audienceRouting.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:out})
const {routeForAudience:route,journeyName}=out
for(const level of ['kids','school']){
 const selected=level==='kids'?'kids':'academic'
 for(const foreign of ['kids','academic']){
  assert.equal(route(`explorer/${foreign}/earth/time`,level),`explorer/${selected}/earth/time`)
  assert.equal(route(`article/algebra?audience=${foreign}`,level),`article/algebra?audience=${selected}`)
 }
 for(const path of ['journey/time','journey/place','future/ai','lab/physics','library','math','languages'])assert.equal(route(path,level),path)
}
assert.equal(route('cosmos','kids'),'explorer/kids/space/time')
assert.equal(route('mars','kids'),'explorer/kids/space/time')
assert.equal(route('cosmos','school'),'cosmos')
assert.equal(journeyName('kids','ar'),'المستكشف الصغير')
assert.equal(journeyName('school','ar'),'الرحالة الكبير')
assert.equal(route('article/algebra?audience=academic',null),'article/algebra?audience=academic','No saved choice: entrance must ask first')
const app=fs.readFileSync('src/App.tsx','utf8'),atlas=fs.readFileSync('src/Atlas.tsx','utf8'),math=fs.readFileSync('src/MathAcademy.tsx','utf8')
assert.ok(!app.includes('className="ctx-audience"'))
assert.ok(!atlas.includes('setAcademic'))
assert.ok(!math.includes('setTrack'))
assert.ok(app.includes('className="side-icon audience-edit"'),'Keep the edit control alongside languages')
assert.ok(app.includes('level={level}'),'Content must use the global audience')
assert.ok(app.includes("level+':'+route.replace"),'Changing audience clears local component state')
console.log('Audience isolation passed: legacy routes, saved choice authority, journey labels, sidebar edit and no internal audience switches.')
