import ScientificMotion from './ScientificMotion'
import RealisticScene from './RealisticScene'
import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import CosmosKids from './CosmosKids'
import Scene3D from './Scenes3D'
import SolarStory from './SolarStory'
import SpaceFabric from './SpaceFabric'
const TOPICS = [
 {id:'planets',ar:'الكواكب',fr:'Planètes',en:'Planets',child:'تدور الكواكب حول الشمس. قارن بين الكواكب الصخرية والكواكب العملاقة.',adult:'يفصل التصنيف بين الكواكب الأرضية والعمالقة الغازية والجليدية. تختلف الكثافة والتركيب والغلاف الجوي؛ أحجام المشهد والمسافات والسرعات مضخمة لأغراض الشرح.'},
 {id:'moons',ar:'الأقمار',fr:'Lunes',en:'Moons',child:'القمر جسم يدور حول كوكب. بعض الكواكب لها أقمار كثيرة، وبعضها بلا أقمار.',adult:'تتنوع الأقمار بين عوالم صخرية وجليدية. يربط القفل المدي دوران كثير منها بمداراتها، وقد تسهم قوى المد في تسخين الداخل. المشهد يوضح مدارًا نموذجيًا ولا يحاكي نظامًا مقاسًا.'},
 {id:'stars',ar:'النجوم',fr:'Étoiles',en:'Stars',child:'النجوم كرات شديدة السخونة تضيء. شمسنا نجم، ويتغير لون النجم مع حرارة سطحه.',adult:'يرتبط اللون بدرجة الحرارة الفعالة، بينما يتحدد اللمعان أيضًا بنصف القطر. تقود الكتلة والتركيب والتطور النجمي موضع النجم في مخطط هرتزبرونغ–راسل؛ الألوان هنا تقريبية.'},
 {id:'galaxies',ar:'المجرات',fr:'Galaxies',en:'Galaxies',child:'تضم المجرة نجومًا وغازًا وغبارًا. نحن نعيش في مجرة درب التبانة.',adult:'تتشكل البنى المجرية بفعل الجاذبية وتطور الغاز والتشكل النجمي والاندماجات. اللولب في المشهد رسم بنيوي تعليمي، وليس خريطة مواقع النجوم في درب التبانة.'},
 {id:'blackholes',ar:'الثقوب السوداء',fr:'Trous noirs',en:'Black holes',child:'حول الثقب الأسود حد لا يستطيع الضوء الخروج من داخله. قد يضيء الغاز الساخن المحيط به.',adult:'أفق الحدث حد سببي في الزمكان؛ لا يمثل سطحًا ماديًا. القرص المضيء تمثيل لتدفق تراكمي، ويتطلب إظهار العدسات الجاذبية والحركة النسبية محاكاة أشعة لا يقدمها هذا المشهد.'},
 {id:'missions',ar:'استكشاف الفضاء',fr:'Exploration',en:'Exploration',child:'تحمل الأقمار الصناعية أدوات للرصد والاتصال، وترسل المسابير معلومات عن عوالم بعيدة.',adult:'تجمع المهمات بين مدار ملائم وميزانية طاقة واتصالات وحمولة علمية. يوضح المجسم قمرًا صناعيًا تعليميًا بألواح شمسية، ولا يمثل مركبة بعينها أو مدارًا آنيًا.'},
] as const
function SpaceScene({topic,academic}:{topic:string;academic:boolean}) {
 const host=useRef<HTMLDivElement>(null)
 useEffect(()=>{let disposed=false;let clean=()=>{};void(async()=>{
 const T=await import('three');const {OrbitControls}=await import('three/examples/jsm/controls/OrbitControls.js');if(disposed||!host.current)return
 const mount=host.current,r=new T.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));mount.appendChild(r.domElement)
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(45,1,.1,100),group=new T.Group();scene.add(group);camera.position.set(0,2,9)
 const controls=new OrbitControls(camera,r.domElement);controls.enableDamping=true;controls.autoRotate=true;controls.enablePan=false;controls.minDistance=3;controls.maxDistance=18
 scene.add(new T.HemisphereLight(0xffffff,0x38597b,3));const light=new T.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light)
 const sphere=(radius:number,color:number,x=0)=>{const m=new T.Mesh(new T.SphereGeometry(radius,40,28),new T.MeshStandardMaterial({color,roughness:.65}));m.position.x=x;group.add(m);return m}
 let moon:import('three').Mesh|undefined
 if(topic==='moons'){sphere(1.5,0x3874bb);moon=sphere(.4,0xc9c6ba,2.6);const ring=new T.Mesh(new T.TorusGeometry(2.6,.012,6,100),new T.MeshBasicMaterial({color:0x89bacc}));ring.rotation.x=Math.PI/2;group.add(ring)}
 if(topic==='stars'){sphere(.6,0xf7774e,-2.4);sphere(1,0xffd477);sphere(1.3,0x8fbfff,2.8)}
 if(topic==='galaxies'){const points=[];for(let i=0;i<1600;i++){const a=i*.17,rad=2.8*Math.sqrt(i/1600);points.push(Math.cos(a+rad*2)*rad,(Math.sin(i*17)*.08),Math.sin(a+rad*2)*rad)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));group.add(new T.Points(g,new T.PointsMaterial({color:0xbad7ff,size:.045})));sphere(.3,0xffe5ac)}
 if(topic==='blackholes'){sphere(.8,0x010208);const ring=new T.Mesh(new T.TorusGeometry(1.6,.28,24,100),new T.MeshBasicMaterial({color:0xffa343}));ring.rotation.x=Math.PI/2.5;group.add(ring)}
 if(topic==='missions'){const body=new T.Mesh(new T.BoxGeometry(1,1.3,1),new T.MeshStandardMaterial({color:0xd6b76c,metalness:.5,roughness:.3}));group.add(body);for(const side of [-1,1]){const panel=new T.Mesh(new T.BoxGeometry(1.7,.05,1),new T.MeshStandardMaterial({color:0x23569c,metalness:.4,roughness:.4}));panel.position.x=side*1.4;group.add(panel)}}
  if(academic){
 const ring=(radius:number,color:number,tilt:number)=>{const mesh=new T.Mesh(new T.TorusGeometry(radius,.012,8,160),new T.MeshBasicMaterial({color,transparent:true,opacity:.65}));mesh.rotation.x=tilt;group.add(mesh);return mesh}
 if(topic==='moons'){
   for(const radius of [2.1,2.6,3.1])ring(radius,0x91b8cf,Math.PI/2)
   const axis=new T.Mesh(new T.CylinderGeometry(.012,.012,4,8),new T.MeshBasicMaterial({color:0xf3cb87}));axis.rotation.z=.22;group.add(axis)
   for(let i=0;i<24;i++){const a=i*Math.PI/12;const point=new T.Mesh(new T.SphereGeometry(.025,8,6),new T.MeshBasicMaterial({color:0xffffff}));point.position.set(Math.cos(a)*2.6,0,Math.sin(a)*2.6);group.add(point)}
 }
 if(topic==='stars'){
   for(const x of [-2.4,0,2.8]){const radii=x===0?1:x<0?.6:1.3;for(let i=1;i<=3;i++){const corona=new T.Mesh(new T.SphereGeometry(radii+i*.045,48,32),new T.MeshBasicMaterial({color:x<0?0xff9e67:x===0?0xffda8f:0xaacaff,transparent:true,opacity:.035,depthWrite:false}));corona.position.x=x;group.add(corona)}}
 }
 if(topic==='galaxies'){
   const halo=new T.Mesh(new T.SphereGeometry(3.1,48,32),new T.MeshBasicMaterial({color:0x8b9be0,transparent:true,opacity:.035,depthWrite:false,wireframe:true}));halo.scale.y=.65;group.add(halo)
   const bulge=new T.Mesh(new T.SphereGeometry(.65,48,32),new T.MeshBasicMaterial({color:0xffdca3,transparent:true,opacity:.32}));bulge.scale.y=.6;group.add(bulge)
   ring(2.9,0x708db0,Math.PI/2)
 }
 if(topic==='blackholes'){
   for(let i=0;i<18;i++){const disk=new T.Mesh(new T.TorusGeometry(.95+i*.065,.025,8,160),new T.MeshBasicMaterial({color:new T.Color().setHSL(.04+i*.007,1,.72-i*.018),transparent:true,opacity:.82}));disk.rotation.x=Math.PI/2.5;group.add(disk)}
   ring(.84,0xffe3b5,Math.PI/2.5)
 }
 if(topic==='missions'){
   for(const side of [-1,1])for(let x=0;x<7;x++)for(let z=0;z<4;z++){const cell=new T.Mesh(new T.BoxGeometry(.19,.012,.19),new T.MeshStandardMaterial({color:0x193d6c,metalness:.55,roughness:.28}));cell.position.set(side*(.64+x*.23),.035,-.36+z*.24);group.add(cell)}
   const dish=new T.Mesh(new T.SphereGeometry(.48,40,24,0,Math.PI*2,0,Math.PI*.38),new T.MeshStandardMaterial({color:0xd9dee0,side:T.DoubleSide,metalness:.6,roughness:.3}));dish.position.y=1.05;dish.rotation.z=.4;group.add(dish)
   const boom=new T.Mesh(new T.CylinderGeometry(.025,.025,1,12),new T.MeshStandardMaterial({color:0xc7c9cb}));boom.position.y=.95;group.add(boom)
 }
 }
 const resize=()=>{const w=mount.clientWidth||600,h=mount.clientHeight||500;r.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};const observer=new ResizeObserver(resize);observer.observe(mount);resize();let frame=0;const clock=new T.Clock();const draw=()=>{if(disposed)return;frame=requestAnimationFrame(draw);const t=clock.getElapsedTime();if(moon)moon.position.set(Math.cos(t*.4)*2.6,0,Math.sin(t*.4)*2.6);controls.update();r.render(scene,camera)};draw();clean=()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{const m=o as import('three').Mesh;m.geometry?.dispose();if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>x.dispose())});r.dispose();r.domElement.remove()}
 })();return()=>{disposed=true;clean()}},[topic,academic])
 return <div ref={host} style={{height:'min(72vh,650px)',minHeight:400,background:'radial-gradient(ellipse,#162f50,#060d1c)',borderRadius:20,overflow:'hidden',touchAction:'none'}}/>
}
export default function SpaceDiscovery({lang,academic}:{lang:Lang;academic:boolean}){
 const [topic,setTopic]=useState<string>('planets');const selected=TOPICS.find(x=>x.id===topic)!
 return <><section className="earth-discovery" data-audience={academic ? "academic" : "kids"}><h3>{lang==='ar'?'مختبر استكشاف الفضاء':lang==='fr'?'Explorer l’espace':'Explore space'}</h3><div className="math-lab-tabs">{TOPICS.map(x=><button key={x.id} className={topic===x.id?'active':''} aria-pressed={topic===x.id} onClick={()=>setTopic(x.id)}>{x[lang]}</button>)}</div>{!academic && topic === 'missions' ? <CosmosKids lang={lang}/> : !academic && topic === 'blackholes' ? <SpaceFabric lang={lang}/> : topic === 'blackholes' ? <ScientificMotion kind="blackhole" lang={lang} academic={academic}/> : academic && topic === 'missions' ? <RealisticScene kind="satellite" lang={lang}/> : academic ? <div className="space-academic-route"><h4>{selected[lang]}</h4><p>{lang==='ar'?'افتح نافذة الكون المتخصصة لاستكشاف البنية والقياسات والتسميات التفصيلية.':lang==='fr'?'Ouvrez l’explorateur spécialisé pour les structures et les données.':'Open the specialist explorer for structures, measurements and annotations.'}</p><a className="ghost-btn" href="#/cosmos">{lang==='ar'?'استكشاف أكاديمي للكون':lang==='fr'?'Exploration académique':'Academic cosmos explorer'}</a></div> : topic==='planets'?<section className="kids-solar-system"><h4>{lang==='ar'?'المجموعة الشمسية التفاعلية — اضغط على كوكب':lang==='fr'?'Système solaire — cliquez sur une planète':'Solar system — click a planet'}</h4><Scene3D kind="sun" lang={lang}/></section>:<SpaceScene topic={topic} academic={academic}/>}{topic!=='planets' && topic!=='blackholes' && topic!=='missions' && <p>{lang==='ar'?'اسحب للتدوير، واستعمل عجلة الفأرة أو إصبعين للتقريب. الأحجام والمسافات تعليمية وغير متناسبة.':lang==='fr'?'Glissez pour tourner, pincez pour zoomer. Échelles schématiques.':'Drag to rotate and pinch to zoom. Sizes and distances are schematic.'}</p>}<p className="earth-layer-explanation">{lang==='ar'?selected[academic?'adult':'child']:lang==='fr'?'Modèle pédagogique. Explorez la structure et comparez les objets à différentes échelles.':'Educational model. Explore structures and compare objects across scales.'}</p><footer className="body-explorer-sources"><a href="https://science.nasa.gov/solar-system/">NASA · Solar System</a><a href="https://science.nasa.gov/universe/">NASA · Universe</a></footer></section>{!academic && <SolarStory lang={lang}/>}</>
}
