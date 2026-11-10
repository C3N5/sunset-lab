import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as physics from '../physics.mjs';

// No browser or third-party test library required. This checks interaction logic
// using a tiny DOM stand-in, so slider behavior stays part of CI.
const code=readFileSync(new URL('../app.js',import.meta.url),'utf8')
 .replace(/^\s*import\s+\{[^}]+\}\s+from\s+["']\.\/physics\.mjs["'];?\s*/m,'');

function createApp(){
 const elements=new Map(),listeners=new Map();
 const defaults={low:0,high:1.83,delay:11,rate:100};
 function element(id){
  if(!elements.has(id))elements.set(id,{
   value:defaults[id]??'',textContent:'',style:{},innerHTML:'',
   classList:{toggle(){}},addEventListener(event,fn){listeners.set(id+':'+event,fn)},
   replaceChildren(){},append(){},setAttribute(){}
  });
  return elements.get(id);
 }
 const document={
  getElementById:element,
  createElementNS:()=>({setAttribute(){},textContent:''}),
  createElement:()=>({click(){}})
 };
 const args=['document','cancelAnimationFrame','requestAnimationFrame','navigator','URL','Blob','performance',
  'BASE_RATE','horizonDip','radiusExact','radiusSmallAngle','estimate'];
 const values=[document,()=>{},()=>{}, {},{},()=>{}, {now:()=>0},
  physics.BASE_RATE,physics.horizonDip,physics.radiusExact,physics.radiusSmallAngle,physics.estimate];
 const evaluate=new Function(...args,code+'\nreturn {update,setFrame};');
 return {element,listeners,controls:evaluate(...values)};
}

test('at the start the lower Sun is fully below the horizon',()=>{
 const app=createApp();
 assert.equal(app.element('sunLow').style.top,
  'calc(72% + var(--sun-half) + 0.00px)');
 assert.match(app.element('sunHigh').style.top,/ - \d+\.\d\dpx\)/);
});

test('height and rate sliders change the predicted sunset animation',()=>{
 const a=createApp();
 const before=a.element('predicted').textContent;
 const initialSun=a.element('sunHigh').style.top;
 a.element('high').value=8;
 a.listeners.get('high:input')();
 assert.notEqual(a.element('predicted').textContent,before);
 assert.notEqual(a.element('sunHigh').style.top,initialSun);
 const heightPrediction=a.element('predicted').textContent;
 a.element('rate').value=130;
 a.listeners.get('rate:input')();
 assert.notEqual(a.element('predicted').textContent,heightPrediction);
});

test('observed delay changes inferred radius but not the reference-Earth timing',()=>{
 const a=createApp();
 const predicted=a.element('predicted').textContent;
 const radius=a.element('radius').textContent;
 a.element('delay').value=22;
 a.listeners.get('delay:input')();
 assert.equal(a.element('predicted').textContent,predicted);
 assert.notEqual(a.element('radius').textContent,radius);
});

test('at predicted higher sunset the upper Sun reaches the horizon edge',()=>{
 const a=createApp();
 const t=(
  physics.horizonDip(6371000,1.83)-physics.horizonDip(6371000,0)
 )/physics.BASE_RATE;
 a.controls.setFrame(t);
 assert.equal(a.element('sunHigh').style.top,
  'calc(72% + var(--sun-half) + 0.00px)');
});
