import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

// Rebuild the first Qalam intro from its original generated scenes. The only
// new media ingredient is a recorded, credited music excerpt.
const root = resolve(import.meta.dirname, '..')
const output = join(root, 'public/assets/video/qalam-intro-restored-v4.webm')
const musicPath = join(tmpdir(), 'qalam-intro-sources', 'music.ogg')
try {
  if ((await stat(musicPath)).size < 100_000) throw Error('empty music file')
} catch {
  await mkdir(join(tmpdir(), 'qalam-intro-sources'), { recursive: true })
  const response = await fetch('https://upload.wikimedia.org/wikipedia/commons/d/df/Reaching_The_Sky_by_Alexander_Nakarada.ogg')
  if (!response.ok) throw Error(`Music download failed: ${response.status}`)
  await writeFile(musicPath, Buffer.from(await response.arrayBuffer()))
}

const files = new Map([
  ['/library.jpg', join(root, 'public/assets/img/qalam-intro-library-v1.jpg')],
  ['/discovery.jpg', join(root, 'public/assets/img/qalam-intro-discovery-v1.jpg')],
  ['/mark.png', join(root, 'public/assets/qalam-calligraphy-mark.png')],
  ['/music.ogg', musicPath],
])
const page = `<!doctype html><html><meta charset="utf-8"><style>*{margin:0}html,body{background:#0a2e28}canvas{display:block}</style><canvas id="film" width="1280" height="720"></canvas><script type="module">
const canvas=document.getElementById('film'),ctx=canvas.getContext('2d',{alpha:false});
const images=await Promise.all(['library.jpg','discovery.jpg','mark.png'].map(name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Cannot load '+name));image.src='/'+name})));
const [library,discovery,mark]=images;
const song=new Audio('/music.ogg');song.preload='auto';await new Promise((resolve,reject)=>{song.addEventListener('loadeddata',resolve,{once:true});song.addEventListener('error',reject,{once:true});song.load()});
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
function scene(image,t,start,end,alpha,direction){const p=Math.max(0,Math.min(1,(t-start)/(end-start)));const base=Math.max(1280/image.width,720/image.height);const zoom=1.035+.075*p,w=image.width*base*zoom,h=image.height*base*zoom;const drift=(p-.5)*58*direction;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,(1280-w)/2+drift,(720-h)/2+9*Math.sin(p*Math.PI),w,h);ctx.restore()}
function draw(time){const t=Math.max(0,Math.min(17,time));ctx.fillStyle='#0b3029';ctx.fillRect(0,0,1280,720);
  if(t<4.8){scene(library,t,0,5.3,1,-1)}else if(t<5.9){scene(library,t,0,5.3,1,-1);scene(discovery,t,4.8,11.4,ease((t-4.8)/1.1),1)}
  else if(t<11.1){scene(discovery,t,4.8,11.4,1,1)}else if(t<12.3){scene(discovery,t,4.8,11.4,1,1);scene(library,t,11.1,17,ease((t-11.1)/1.2),-1)}
  else scene(library,t,11.1,17,1,-1);
  const light=ctx.createLinearGradient(0,0,1280,720);light.addColorStop(0,'rgba(3,34,27,.30)');light.addColorStop(.45,'rgba(3,34,27,0)');light.addColorStop(1,'rgba(3,34,27,.40)');ctx.fillStyle=light;ctx.fillRect(0,0,1280,720);
  const path=ease((t-3.1)/1.2)*(1-ease((t-13.0)/1.5));if(path){ctx.save();ctx.globalAlpha=path*.75;ctx.strokeStyle='#e5c481';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(145,585);ctx.bezierCurveTo(400,525,550,620,760,510);ctx.bezierCurveTo(900,445,1050,500,1160,395);ctx.stroke();ctx.restore()}
  const rings=ease((t-7.1)/1.2)*(1-ease((t-12.3)/1.3));if(rings){ctx.save();ctx.globalAlpha=rings*.35;ctx.strokeStyle='#f0d49b';ctx.lineWidth=1.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(925,350,120+i*50,75+i*38,-.17,0,Math.PI*2);ctx.stroke()}ctx.restore()}
  for(let i=0;i<24;i++){const x=(i*193+17)%1280,y=(i*137+61)%720;ctx.fillStyle='rgba(255,224,162,'+(.08+.1*Math.sin(t*.7+i)) +')';ctx.beginPath();ctx.arc(x+Math.sin(t*.3+i)*9,y-Math.max(0,t*1.8),i%5===0?2:1,0,Math.PI*2);ctx.fill()}
  const logo=ease((t-13.8)/1.1);if(logo){ctx.fillStyle='rgba(4,32,26,'+(logo*.58)+')';ctx.fillRect(0,0,1280,720);ctx.save();ctx.globalAlpha=logo;const width=610,height=width*mark.height/mark.width;ctx.drawImage(mark,(1280-width)/2,(720-height)/2,width,height);ctx.restore()}
}
draw(0);
window.makeVideo=async()=>{const audio=new AudioContext(),destination=audio.createMediaStreamDestination(),gain=audio.createGain();audio.createMediaElementSource(song).connect(gain).connect(destination);await audio.resume();const startAudio=audio.currentTime+.1;gain.gain.setValueAtTime(0,startAudio);gain.gain.linearRampToValueAtTime(.75,startAudio+1.1);gain.gain.setValueAtTime(.75,startAudio+14.5);gain.gain.linearRampToValueAtTime(0,startAudio+17);song.currentTime=3;await song.play();
 const stream=new MediaStream([...canvas.captureStream(30).getVideoTracks(),...destination.stream.getAudioTracks()]);const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));if(!mime)throw Error('WebM recording unavailable');const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3000000,audioBitsPerSecond:128000}),chunks=[];recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
 return await new Promise((resolve,reject)=>{recorder.onerror=event=>reject(event.error||Error('Recorder failed'));recorder.onstop=()=>{const blob=new Blob(chunks,{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='qalam-intro-restored-v4.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);resolve({bytes:blob.size,mime})};const start=performance.now();recorder.start(1000);let frame;const paint=()=>{const t=(performance.now()-start)/1000;draw(t);if(t<17){frame=requestAnimationFrame(paint)}else{cancelAnimationFrame(frame);recorder.stop();song.pause()}};frame=requestAnimationFrame(paint)})
};
</script></html>`

const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname
  if (path === '/') { response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(page); return }
  const file = files.get(path)
  if (!file) { response.writeHead(404); response.end(); return }
  const info = await stat(file)
  const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '')
  const start = match ? Number(match[1]) : 0
  const end = match && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1
  const type = path.endsWith('.jpg') ? 'image/jpeg' : path.endsWith('.ogg') ? 'audio/ogg' : 'image/png'
  response.writeHead(match ? 206 : 200, { 'content-type': type, 'content-length': end-start+1, 'accept-ranges': 'bytes', ...(match ? { 'content-range': `bytes ${start}-${end}/${info.size}` } : {}) })
  createReadStream(file, { start, end }).pipe(response)
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const pageUrl = `http://127.0.0.1:${server.address().port}/`
const port = 9400 + process.pid % 500
const profile = join(tmpdir(), `qalam-intro-restored-${process.pid}`)
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--autoplay-policy=no-user-gesture-required',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,pageUrl], { stdio:'ignore', windowsHide:true })
let socket
try {
  let tab
  for(let attempt=0;attempt<60;attempt++){try{const response=await fetch(`http://127.0.0.1:${port}/json`);tab=(await response.json()).find(item=>item.type==='page'&&item.url===pageUrl);if(tab)break}catch{}await delay(250)}
  if(!tab)throw Error('Cannot connect to film renderer')
  socket=new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})})
  let nextId=0
  function send(method,params={},timeout=5000){return new Promise((resolve,reject)=>{const id=++nextId,timer=setTimeout(()=>{socket.removeEventListener('message',handler);reject(Error(`CDP ${method} timed out`))},timeout),handler=event=>{const message=JSON.parse(event.data);if(message.id!==id)return;clearTimeout(timer);socket.removeEventListener('message',handler);message.error?reject(Error(message.error.message)):resolve(message.result)};socket.addEventListener('message',handler);socket.send(JSON.stringify({id,method,params}))})}
  await send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:join(root,'public/assets/video')})
  let ready=false
  for(let attempt=0;attempt<80;attempt++){const result=await send('Runtime.evaluate',{expression:'typeof window.makeVideo',returnByValue:true});if(result.result.value==='function'){ready=true;break}await delay(250)}
  if(!ready)throw Error('Images or music did not load')
  const result=await send('Runtime.evaluate',{expression:'window.makeVideo()',awaitPromise:true,returnByValue:true},55000)
  if(result.exceptionDetails)throw Error(result.exceptionDetails.text)
  for(let attempt=0;attempt<80;attempt++){try{if((await stat(output)).size>100_000)break}catch{}await delay(250)}
  const info=await stat(output)
  if(info.size<100_000)throw Error('Film output is incomplete')
  console.log(JSON.stringify({output,bytes:info.size,recording:result.result.value}))
} finally { socket?.close();browser.kill();server.close() }
