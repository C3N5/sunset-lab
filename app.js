
"use strict";
const el=id=>document.getElementById(id);
import {BASE_RATE, radiusExact, radiusSmallAngle} from "./physics.mjs";
const omega0=BASE_RATE;
const fmt=(v,d=0)=>Number.isFinite(v)?v.toLocaleString(undefined,{maximumFractionDigits:d}):"—";
const inputs=["low","high","delay","rate"];
let last=null,playing=false,frame=0;
const solve=radiusExact;
function update(){
 const [low,high,delay,rate]=inputs.map(id=>+el(id).value);
 el("lowval").textContent=low.toFixed(2)+" m";
 el("highval").textContent=high.toFixed(2)+" m";
 el("delayval").textContent=delay+" s";
 el("rateval").textContent=rate+"%";
 const a=omega0*rate/100*delay;
 const exact=solve(low,high,a);
 const approx=radiusSmallAngle(low,high,a);
 const valid=Number.isFinite(exact);
 const err=el("error");err.classList.toggle("hidden",valid);err.textContent=high<=low?"The higher eye height must exceed the lower one.":"These inputs do not yield a physically meaningful radius within the solver's range. Try different values.";
 el("radius").textContent=valid?fmt(exact/1000)+" km":"—";
 el("exact").textContent=valid?fmt(exact/1000)+" km":"—";
 el("approx").textContent=fmt(approx/1000)+" km";
 el("angle").textContent=a.toFixed(6);
 el("percent").textContent=valid?(100*Math.abs(approx-exact)/exact).toFixed(3)+"%":"—";
 last={low,high,delay,rate,angle:a,radiusKm:exact/1000,approxKm:approx/1000};
 renderGraph(low,high,rate,delay);
 if(!playing){el("sun").style.top="61%";el("clock").textContent="0.0 seconds";}
}
function renderGraph(low,high,rate,selected){
 const svg=el("chart");const ns="http://www.w3.org/2000/svg";svg.replaceChildren();
 function node(name,attrs,text){const x=document.createElementNS(ns,name);Object.entries(attrs||{}).forEach(([k,v])=>x.setAttribute(k,v));if(text!==undefined)x.textContent=text;svg.appendChild(x);return x;}
 const left=52,right=480,top=20,bottom=186,points=[];
 for(let t=3;t<=50;t++){const a=omega0*rate/100*t;const r=2*(Math.sqrt(high)-Math.sqrt(low))**2/a**2/1000;points.push({t,r});}
 const max=points[0].r;const x=t=>left+(t-3)/47*(right-left);const y=r=>bottom-(r/max)*(bottom-top);
 [0,.25,.5,.75,1].forEach(z=>{const yy=bottom-z*(bottom-top);node("line",{x1:left,y1:yy,x2:right,y2:yy,stroke:"#29425b"});node("text",{x:43,y:yy+4,fill:"#9db0c9","text-anchor":"end","font-size":"10"},fmt(max*z/1000,1)+"k");});
 node("path",{d:points.map((p,i)=>(i?"L":"M")+x(p.t).toFixed(2)+","+y(p.r).toFixed(2)).join(" "),fill:"none",stroke:"#efb478","stroke-width":"3"});
 const dot=points.find(p=>p.t===selected);if(dot)node("circle",{cx:x(dot.t),cy:y(dot.r),r:5,fill:"#ffffff",stroke:"#e8a973","stroke-width":3});
 node("text",{x:265,y:212,fill:"#9db0c9","text-anchor":"middle","font-size":"11"},"Extra sunset visibility (seconds)");
 node("text",{x:62,y:18,fill:"#9db0c9","font-size":"10"},"Radius (1000 km)");
}
inputs.forEach(id=>el(id).addEventListener("input",update));
function setFrame(progress){el("sun").style.top=(61+17*progress)+"%";el("clock").textContent=(progress*(+el("delay").value)).toFixed(1)+" seconds";}
function stop(){playing=false;cancelAnimationFrame(frame);el("play").textContent="▶ Play sunset";}
el("play").onclick=()=>{if(playing){stop();return;}playing=true;el("play").textContent="Ⅱ Pause";const start=performance.now();const duration=Math.min(8000,Math.max(2200,(+el("delay").value)*300));const animate=now=>{if(!playing)return;const p=Math.min(1,(now-start)/duration);setFrame(p);if(p<1)frame=requestAnimationFrame(animate);else stop();};frame=requestAnimationFrame(animate);};
el("reset").onclick=()=>{stop();setFrame(0);};
el("copy").onclick=async()=>{if(!last)return;const s="Sunset Lab: R="+fmt(last.radiusKm)+" km; eye heights="+last.low+", "+last.high+" m; time="+last.delay+" s; angle="+last.angle.toFixed(6)+" rad. Educational simplified model.";try{await navigator.clipboard.writeText(s);el("notice").textContent="Copied."; }catch{el("notice").textContent=s;}};
el("export").onclick=()=>{const report="Sunset Lab investigation notes\n\n"+JSON.stringify(last,null,2)+"\n\nMy reasoning:\n"+el("notes").value+"\n\nAssumptions: spherical Earth, simplified angular rate, no refraction.\n";const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([report],{type:"text/plain"}));a.download="sunset-lab-notes.txt";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
update();
