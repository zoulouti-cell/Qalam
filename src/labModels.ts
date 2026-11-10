/** Ideal teaching models. Units and validity limits are documented in the workbench. */
export const affineValue = (slope:number, intercept:number, x:number) => slope*x+intercept
export const pendulumPeriod = (length:number, gravity:number) => 2*Math.PI*Math.sqrt(length/gravity)
export function diluteSolution(finalVolumeMl:number) {
  const concentration=0.01*100/finalVolumeMl
  return {concentration,ph:-Math.log10(concentration),amountMol:0.001}
}
export const cardiacOutput = (rate:number,strokeMl:number) => rate*strokeMl/1000
export function projectileModel(speed:number,angleDegrees:number,gravity=9.81) {
  const angle=angleDegrees*Math.PI/180
  const vx=speed*Math.cos(angle),vy=speed*Math.sin(angle)
  const duration=2*vy/gravity
  return {duration,range:vx*duration,height:vy*vy/(2*gravity),point:(t:number)=>({x:vx*t,y:Math.max(0,vy*t-gravity*t*t/2)})}
}
