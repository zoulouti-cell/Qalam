const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict')
const cache={}
function read(name){
 if(cache[name])return cache[name]
 const exports={};cache[name]=exports
 const file=path.join('src',name+'.ts')
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 vm.runInNewContext(code,{exports,require:id=>read(id.replace('./',''))},{filename:file})
 return exports
}
const sets=[read('medicineHistory').MEDICINE_HISTORY,read('transportHistory').TRANSPORT_HISTORY,read('moroccoHistory').MOROCCO_HISTORY]
for(const d of sets){
 const ids=d.events.map(e=>e.id),regions=new Set(d.regions.map(r=>r.id))
 assert.equal(new Set(ids).size,ids.length,`${d.id}: duplicate stage`)
 for(const item of [...d.events,...d.regions,...d.people||[],...d.notes||[]]){
  for(const field of ['title','name','child','adult','date'])if(item[field]&&typeof item[field]==='object')for(const lang of ['ar','fr','en']){
   assert.ok(item[field][lang]?.trim(),`${d.id}: missing ${field}.${lang}`)
   if(lang!=='ar')assert.ok(!/[\u0600-\u06ff]/.test(item[field][lang]),`${d.id}: Arabic leaked into ${lang}`)
  }
  if(item.child){assert.notEqual(item.child.ar,item.adult.ar,`${d.id}: identical audience editions`)}
  for(const r of item.regions||[])assert.ok(regions.has(r),`${d.id}: unknown region ${r}`)
  for(const ref of item.refs||[])assert.ok(d.sources[ref],`${d.id}: missing source ${ref}`)
 }
 for(const region of regions)assert.ok(d.events.some(e=>e.regions.includes(region)),`${d.id}: empty spatial filter ${region}`)
 for(const source of Object.values(d.sources))assert.equal(new URL(source.url).protocol,'https:')
 for(const e of d.events.filter(e=>e.era))for(const audience of ['kids','academic'])assert.ok(fs.existsSync(`public/assets/img/morocco-${e.era}-${audience}-v1.jpg`))
 console.log(`${d.id}: ${d.events.length} stages; ${d.regions.length} spatial filters; ${d.people?.length||0} figures; complete AR/FR/EN audience editions and source keys`)
}
const medicine=sets[0]
const crypto=require('node:crypto'),imageHashes=new Set()
for(const event of sets[1].events)for(const audience of ['kids','academic']){
 const file=`public/assets/img/transport-${event.id}-${audience}-v1.jpg`
 assert.ok(fs.existsSync(file),`Missing transport illustration ${file}`)
 const bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex')
 assert.ok(!imageHashes.has(hash),`Repeated transport image ${file}`)
 assert.ok(bytes.length<600000,`Image too heavy ${file}`)
 imageHashes.add(hash)
}
console.log(`${imageHashes.size} distinct optimized transport illustrations checked.`)
assert.ok(medicine.people.find(p=>p.name.en.includes('Pasteur')).adult.en.includes('1901'))
assert.ok(medicine.people.find(p=>p.date==='Nobel 2020').adult.en.includes('chemistry'))
assert.ok(medicine.events.find(e=>e.id==='imaging').year<medicine.events.find(e=>e.id==='antibiotics').year)
console.log('History checks passed.')

for(const e of sets[0].events)for(const a of ['kids','academic']){assert.ok(e.visual);const file='public/assets/img/'+e.visual+'-'+a+'-v1.jpg';assert.ok(fs.existsSync(file));assert.ok(fs.existsSync(file.replace(/\.jpg$/,'-thumb.jpg')))}console.log('32 medicine-history images and thumbnails verified.');