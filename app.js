import {BASE_RATE,horizonDip,radiusExact,radiusSmallAngle,estimate} from "./physics.mjs";

const $=id=>document.getElementById(id);
const format=(x,decimals=0)=>Number.isFinite(x)?x.toLocaleString(undefined,{maximumFractionDigits:decimals}):"—";
const REFERENCE_EARTH_RADIUS=6371000;
const inputs=["low","high","delay","rate"];
let state=null,playing=false,frame=0,animationStart=0,elapsedSeconds=0;

function readInputs(){
 const [lower,higher,delay,rate]=inputs.map(id=>Number($(id).value));
 return {lower,higher,delay,rate};
}
function modelValues(raw){
 const result=estimate(raw);
 const validHeights=raw.higher>raw.lower&&raw.lower>=0;
 const difference=validHeights?horizonDip(REFERENCE_EARTH_RADIUS,raw.higher)-horizonDip(REFERENCE_EARTH_RADIUS,raw.lower):NaN;
 const angularRate=BASE_RATE*raw.rate/100;
 const predictedDelay=difference/angularRate;
 return {...raw,...result,angularRate,difference,predictedDelay,validHeights};
}
function update(){
 const raw=readInputs();
 $("lowval").textContent=raw.lower.toFixed(2)+" m";
 $("highval").textContent=raw.higher.toFixed(2)+" m";
 $("delayval").textContent=raw.delay+" s";
 $("rateval").textContent=raw.rate+"%";
 state=modelValues(raw);
 const m=state;
 const valid=m.valid;
 $("error").classList.toggle("hidden",valid);
 $("error").textContent=m.validHeights?"These inputs cannot yield a valid radius for the chosen model.":"The higher observation point must be above the lower observation point.";
 $("radius").textContent=valid?format(m.exact/1000)+" km":"—";
 $("exact").textContent=valid?format(m.exact/1000)+" km":"—";
 $("approx").textContent=Number.isFinite(m.approx)?format(m.approx/1000)+" km":"—";
 $("angle").textContent=m.angle.toFixed(6);
 $("percent").textContent=valid?((Math.abs(m.approx-m.exact)/m.exact)*100).toFixed(3)+"%":"—";
 $("predicted").textContent=Number.isFinite(m.predictedDelay)?format(m.predictedDelay,2)+" s":"—";
 $("observed").textContent=m.delay+" s";
 $("difference").textContent=Number.isFinite(m.predictedDelay)?format(m.delay-m.predictedDelay,2)+" s":"—";
 $("viewLow").textContent=m.lower.toFixed(2)+" m";
 $("viewHigh").textContent=m.higher.toFixed(2)+" m";
 $("geometryCaption").textContent="Lower: "+m.lower.toFixed(2)+" m · Higher: "+m.higher.toFixed(2)+" m · Reference horizon-dip difference: "+(Number.isFinite(m.difference)?(m.difference*180/Math.PI).toFixed(4)+"°":"—");
 renderGraph(m);
 renderGeometry(m);
 stop();
 setFrame(0);
}
function renderGeometry(m){
 const svg=$("geomSVG");
 // This is deliberately a not-to-scale *local* cross-section; the text gives the actual angles.
 svg.innerHTML="";
 const ns="http://www.w3.org/2000/svg";
 function node(name,attrs={},txt){
  const e=document.createElementNS(ns,name);
  for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));
  if(txt!==undefined)e.textContent=txt;
  svg.append(e);return e;
 }
 node("rect",{x:0,y:0,width:500,height:290,rx:12,fill:"#0c182c"});
 node("path",{d:"M 0 250 Q 248 298 500 250 L 500 290 L 0 290 Z",fill:"#1e526e",stroke:"#77aec5","stroke-width":2});
 node("path",{d:"M 18 211 Q 245 265 480 211",fill:"none",stroke:"#487e9a","stroke-width":1.1,"stroke-dasharray":"3 5"});
 const lowerY=138-Math.min(30,m.lower*7),higherY=138-Math.min(55,m.higher*7);
 const lowEndX=145-Math.min(28,m.lower*5);
 const highEndX=115-Math.min(45,m.higher*5);
 // Tangent lines diagrammatic: endpoints shift as viewing height changes.
 node("line",{x1:430,y1:lowerY,x2:lowEndX,y2:236,stroke:"#9bb1ca","stroke-width":2,"stroke-dasharray":"6 5"});
 node("line",{x1:430,y1:higherY,x2:highEndX,y2:226,stroke:"#ffcb89","stroke-width":3});
 node("line",{x1:430,y1:lowerY,x2:430,y2:higherY,stroke:"#f7e3be","stroke-width":2});
 node("circle",{cx:430,cy:lowerY,r:6,fill:"#a5b5cd"});
 node("circle",{cx:430,cy:higherY,r:6,fill:"#ffcb89"});
 node("circle",{cx:lowEndX,cy:236,r:4,fill:"#a5b5cd"});
 node("circle",{cx:highEndX,cy:226,r:4,fill:"#ffcb89"});
 node("text",{x:350,y:lowerY+21,fill:"#b7c7dc","font-size":12},"Lower eye");
 node("text",{x:350,y:higherY-13,fill:"#ffcb89","font-size":12},"Higher eye");
 node("text",{x:22,y:28,fill:"#d8e6f5","font-size":13},"Observer height changes sightlines");
 node("text",{x:22,y:47,fill:"#93aac4","font-size":11},"Diagram exaggerated, not to scale");
 node("text",{x:27,y:274,fill:"#d6e8f5","font-size":12},"Earth's curved surface");
}
function renderGraph(m){
 const svg=$("chart"),ns="http://www.w3.org/2000/svg";
 svg.replaceChildren();
 const add=(name,attrs={},txt)=>{
  const node=document.createElementNS(ns,name);
  for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
  if(txt!==undefined)node.textContent=txt;
  svg.append(node);return node;
 };
 const points=[];
 for(let t=3;t<=50;t++){
  const angle=BASE_RATE*m.rate/100*t;
  points.push({t,radius:radiusSmallAngle(m.lower,m.higher,angle)/1000});
 }
 const ymax=points[0].radius;
 if(!Number.isFinite(ymax))return;
 const x=t=>52+(t-3)/47*428;
 const y=r=>186-(r/ymax)*166;
 for(let i=0;i<=4;i++){
  const yline=186-i*166/4;
  add("line",{x1:52,y1:yline,x2:480,y2:yline,stroke:"#29425b"});
  add("text",{x:44,y:yline+4,fill:"#9db0c9","text-anchor":"end","font-size":"10"},format((i/4)*ymax/1000,1)+"k");
 }
 add("path",{d:points.map((p,i)=>(i?"L":"M")+x(p.t).toFixed(2)+","+y(p.radius).toFixed(2)).join(" "),fill:"none",stroke:"#efb478","stroke-width":3});
 const chosen=radiusSmallAngle(m.lower,m.higher,m.angle)/1000;
 if(m.delay>=3&&m.delay<=50&&Number.isFinite(chosen))add("circle",{cx:x(m.delay),cy:y(chosen),r:5,fill:"#fff",stroke:"#efb478","stroke-width":3});
 add("text",{x:265,y:212,fill:"#9db0c9","text-anchor":"middle","font-size":11},"Observed delay (seconds)");
 add("text",{x:62,y:15,fill:"#9db0c9","font-size":10},"Radius (1000 km)");
}
function stop(){
 playing=false;
 cancelAnimationFrame(frame);
 $("play").textContent="▶ Play sunset";
}
function setFrame(seconds){
 elapsedSeconds=seconds;
 if(!state)return;
 const m=state;
 // 72% is the ocean horizon in each view. Height offsets are proportional to
 // the actual horizon-dip angles for a fixed reference Earth, visually amplified.
 const scale=56000; // px per radian, illustrative and not to scale
 const lowerRise=0;
 const higherRise=Number.isFinite(m.difference)?Math.max(0,m.difference*scale):0;
 const fall=m.angularRate*seconds*scale;
 // The Sun must be fully hidden when the upper edge touches the horizon:
 // add half the rendered Sun diameter to the center's vertical position.
 // Use explicit subtraction for negative offsets to keep CSS calc() valid.
 const position=offset=>offset>=0
  ? "calc(72% + var(--sun-half) + "+offset.toFixed(2)+"px)"
  : "calc(72% + var(--sun-half) - "+(-offset).toFixed(2)+"px)";
 $("sunLow").style.top=position(fall-lowerRise);
 $("sunHigh").style.top=position(fall-higherRise);
 $("clock").textContent=seconds.toFixed(1)+" seconds";
 if(!m.validHeights){
  $("animationCaption").textContent="Raise the higher eye position above the lower eye position to compare sunsets.";
 }else if(seconds===0){
  $("animationCaption").textContent="Lower view: at the horizon. Higher view: "+format(m.predictedDelay,1)+" s of extra visibility on the reference Earth.";
 }else if(seconds>=m.predictedDelay){
  $("animationCaption").textContent="The reference-Earth higher sunset has now passed (predicted "+format(m.predictedDelay,1)+" s).";
 }else{
  $("animationCaption").textContent=format(Math.max(0,m.predictedDelay-seconds),1)+" s of predicted extra visibility remaining at the higher position.";
 }
}
inputs.forEach(id=>$(id).addEventListener("input",update));
$("play").addEventListener("click",()=>{
 if(playing){stop();return;}
 if(!state?.validHeights)return;
 playing=true;
 $("play").textContent="Ⅱ Pause";
 const maxSeconds=Math.max(state.delay,state.predictedDelay)*1.15;
 const durationMs=Math.min(10000,Math.max(2200,maxSeconds*280));
 const initialSeconds=elapsedSeconds>=maxSeconds?0:elapsedSeconds;
 animationStart=performance.now()-initialSeconds/maxSeconds*durationMs;
 const tick=now=>{
  if(!playing)return;
  const fraction=Math.min(1,(now-animationStart)/durationMs);
  setFrame(fraction*maxSeconds);
  if(fraction<1)frame=requestAnimationFrame(tick);
  else stop();
 };
 frame=requestAnimationFrame(tick);
});
$("reset").addEventListener("click",()=>{stop();setFrame(0);});
$("copy").addEventListener("click",async()=>{
 const m=state;
 if(!m)return;
 const summary="Sunset Lab · h1="+m.lower+" m, h2="+m.higher+" m, observed="+m.delay+" s, inferred R="+format(m.exact/1000)+" km, reference Earth predicts "+format(m.predictedDelay,2)+" s. Simplified model.";
 try{await navigator.clipboard.writeText(summary);$("notice").textContent="Copied.";}catch{$("notice").textContent=summary;}
});
$("export").addEventListener("click",()=>{
 const m=state;
 const text="Sunset Lab investigation notes\n\n"+JSON.stringify(m,null,2)+"\n\nMy reasoning:\n"+$("notes").value+"\n\nAssumptions: spherical Earth; apparent angular rate simplified; no refraction.\n";
 const url=URL.createObjectURL(new Blob([text],{type:"text/plain"}));
 const link=document.createElement("a");
 link.href=url;link.download="sunset-lab-notes.txt";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
update();
