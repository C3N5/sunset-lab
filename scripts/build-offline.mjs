// Reproduce Sunset_Lab_Offline.html from the modular source. No dependencies.
import {readFileSync,writeFileSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const css=readFileSync('style.css','utf8');
const physics=readFileSync('physics.mjs','utf8');
const app=readFileSync('app.js','utf8');

const htmlTag='<link rel="stylesheet" href="./style.css">';
const scriptTag='<script type="module" src="./app.js"></script>';
if(!html.includes(htmlTag)||!html.includes(scriptTag)){
 throw new Error('Source HTML references changed; update build-offline.mjs.');
}
const embeddedPhysics=physics.replace(/\bexport\s+(?=(?:const|function)\b)/g,'');
const embeddedApp=app.replace(/^\s*import\s+\{[^}]+\}\s+from\s+["']\.\/physics\.mjs["'];?\s*/m,'');
if(embeddedApp===app)throw new Error('Physics import was not removed');
const output=html
 .replace(htmlTag,`<style>\n${css}\n</style>`)
 .replace(scriptTag,`<script type="module">\n${embeddedPhysics}\n${embeddedApp}\n</script>`);
if(process.argv.includes('--check')){
 const committed=readFileSync('Sunset_Lab_Offline.html','utf8');
 if(committed!==output){
  console.error('Offline edition is out of sync. Run npm run build:offline.');
  process.exitCode=1;
 }else console.log('Offline HTML matches the editable source.');
}else{
 writeFileSync('Sunset_Lab_Offline.html',output,'utf8');
 console.log('Updated Sunset_Lab_Offline.html ('+output.length+' characters)');
}
