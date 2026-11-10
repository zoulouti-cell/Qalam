const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict')
const exportsObject={}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/labModels.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsObject,Math})
const {affineValue,pendulumPeriod,diluteSolution,cardiacOutput,projectileModel}=exportsObject
const near=(actual,expected,epsilon=1e-9)=>assert.ok(Math.abs(actual-expected)<epsilon,`${actual} differs from ${expected}`)
near(affineValue(2,1,3),7)
near(affineValue(-2,1,3),-5)
near(pendulumPeriod(2,9.81)/pendulumPeriod(.5,9.81),2)
assert.ok(pendulumPeriod(1,1.62)>pendulumPeriod(1,9.81))
for(const volume of [100,200,500,1000]){
  const state=diluteSolution(volume)
  near(state.concentration*volume/1000,state.amountMol)
}
near(diluteSolution(100).ph,2)
near(diluteSolution(1000).ph,3)
near(cardiacOutput(70,70),4.9)
near(cardiacOutput(100,70)/cardiacOutput(50,70),2)
for(const speed of [5,15,20])for(const angle of [10,30,45,60,80]){
  const model=projectileModel(speed,angle)
  near(model.point(0).y,0);near(model.point(model.duration).y,0)
  near(model.point(model.duration).x,model.range)
  near(model.point(model.duration/2).y,model.height)
  near(model.range,projectileModel(speed,90-angle).range)
  assert.ok(model.range<45 && model.height<22.5,'Entire physical path fits the graph')
}
console.log('Lab models passed: conservation, logarithmic dilution, pendulum scaling, output units and projectile endpoints/range.')
