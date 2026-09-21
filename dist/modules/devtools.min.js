/*!
 * Lattice Grid 1.67.0, devtools module
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
(function(root){
'use strict';
var __mods=Object.create(null);
var __cache=Object.create(null);
function __def(id,fn){__mods[id]=fn;}
function __req(id){
var hit=__cache[id];
if(hit)return hit;
var exports=Object.create(null);
__cache[id]=exports;
var fn=__mods[id];
if(!fn)throw new Error('[lattice] missing module: '+id);
fn(exports,__req);
return exports;
}
__def("packages/modules/devtools/checks.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"parseColour",{enumerable:true,get:function(){return parseColour;}});
Object.defineProperty(__exports,"luminance",{enumerable:true,get:function(){return luminance;}});
Object.defineProperty(__exports,"contrast",{enumerable:true,get:function(){return contrast;}});
Object.defineProperty(__exports,"backgroundOf",{enumerable:true,get:function(){return backgroundOf;}});
Object.defineProperty(__exports,"runAccessibilityChecks",{enumerable:true,get:function(){return runAccessibilityChecks;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const AA_NORMAL=4.5;
const AA_LARGE=3;
function parseColour(value){
if(typeof value!=='string')return null;
const match=value.match(/rgba?\(([^)]+)\)/);
if(!match)return null;
const parts=match[1].split(/[,/\s]+/).filter(Boolean).map(Number);
if(parts.length<3||parts.some((n)=>Number.isNaN(n)))return null;
return{r:parts[0],g:parts[1],b:parts[2],a:parts.length>3?parts[3]:1};
}
function luminance(c){
const channel=(v)=>{
const s=v/255;
return s<=0.03928?s/12.92:((s+0.055)/1.055)**2.4;
};
return 0.2126*channel(c.r)+0.7152*channel(c.g)+0.0722*channel(c.b);
}
function contrast(fg,bg){
const a=luminance(fg);
const b=luminance(bg);
const light=Math.max(a,b);
const dark=Math.min(a,b);
return(light+0.05)/(dark+0.05);
}
function backgroundOf(el,view){
let node=el;
while(node&&node.nodeType===1){
const colour=parseColour(view.getComputedStyle(node).backgroundColor);
if(colour&&colour.a===1)return colour;
node=node.parentElement;
}
return{r:255,g:255,b:255,a:1};
}
function runAccessibilityChecks(grid){
const root=grid.element;
const failures=[];
const passes=[];
if(!root||!root.querySelectorAll)return{passes,failures};
const view=root.ownerDocument.defaultView;
const record=(id,ok,detail)=>{
(ok?passes:failures).push({id,detail});
};
const gridRole=root.getAttribute('role')||root.querySelector('[role=grid],[role=treegrid]')
?'present':null;
record('role-grid',!!gridRole,gridRole?'grid role present':'no grid or treegrid role');
const announced=Number(root.getAttribute('aria-rowcount')
||root.querySelector('[aria-rowcount]')?.getAttribute('aria-rowcount'));
const headerRows=new Set(
[...root.querySelectorAll('.lat-header-row')].map((r)=>r.getAttribute('aria-rowindex')),
).size||1;
const expected=grid.rows.count()+headerRows;
record('aria-rowcount',announced===expected,
`announced ${announced||'none'}, expected ${expected} (${grid.rows.count()} rows + ${headerRows} header)`);
let unnamed=0;
let sampled=0;
for(const cell of root.querySelectorAll('.lat-cell[data-col]')){
const text=(cell.textContent||'').trim();
const label=cell.getAttribute('aria-label')||cell.getAttribute('title');
if(text||label){sampled++;continue;}
const drawsSomething=cell.children&&cell.children.length>0;
if(!drawsSomething)continue;
const colId=cell.getAttribute('data-col')||'';
if(colId.startsWith('__lattice'))continue;
sampled++;
unnamed++;
}
record('cell-accessible-name',unnamed===0,
unnamed?`${unnamed} of ${sampled} cells draw content with nothing to read`
:`all ${sampled} cells with content are named`);
const canReadStyles=!!(view&&typeof view.getComputedStyle==='function');
const seen=new Set();
for(const el of canReadStyles?root.querySelectorAll('.lat-cell, .lat-header-cell'):[]){
const text=(el.textContent||'').trim();
if(!text)continue;
const style=view.getComputedStyle(el);
const fg=parseColour(style.color);
if(!fg)continue;
const bg=backgroundOf(el,view);
const key=`${style.color}|${bg.r},${bg.g},${bg.b}`;
if(seen.has(key))continue;
seen.add(key);
const px=parseFloat(style.fontSize)||13;
const bold=Number(style.fontWeight)>=700;
const threshold=(px>=24||(bold&&px>=18.66))?AA_LARGE:AA_NORMAL;
const ratio=contrast(fg,bg);
record('contrast',ratio>=threshold,
`${style.color} on rgb(${bg.r}, ${bg.g}, ${bg.b}): ${ratio.toFixed(2)}:1, needs ${threshold}:1`);
}
for(const el of root.querySelectorAll('.lat-cell[data-presence]')){
const style=view.getComputedStyle(el);
const fg=parseColour(style.color);
if(!fg||!(el.textContent||'').trim())continue;
const bg=backgroundOf(el,view);
const ratio=contrast(fg,bg);
record('presence-overlay-contrast',ratio>=AA_NORMAL,
`${el.getAttribute('data-presence')} overlay on ${el.getAttribute('data-col')} `
+`,  ${ratio.toFixed(2)}:1, needs ${AA_NORMAL}:1`);
break;
}
const tree=!!(grid.get&&grid.get('tree'));
const gridRootEl=root.getAttribute('role')?root:root.querySelector('[role="grid"], [role="treegrid"]');
const declaredRole=gridRootEl?gridRootEl.getAttribute('role'):null;
record('role-matches-data',!tree||declaredRole==='treegrid',
tree?`hierarchy present, role is ${declaredRole||'none'}`
:`flat grid, role is ${declaredRole||'none'}`);
const hierarchyRows=[...root.querySelectorAll('[data-key][aria-level]')];
const missingPosition=hierarchyRows.filter((r)=>!r.getAttribute('aria-setsize'));
record('hierarchy-position',missingPosition.length===0,
hierarchyRows.length
?`${hierarchyRows.length-missingPosition.length} of ${hierarchyRows.length} nested rows carry aria-setsize`
:'no nested rows rendered');
const headings=[...root.querySelectorAll('.lat-header-cell[data-col]')];
const unfocusable=headings.filter((h)=>h.getAttribute('tabindex')===null);
record('headings-focusable',headings.length===0||unfocusable.length===0,
`${headings.length-unfocusable.length} of ${headings.length} headings are focusable`);
for(const dialog of root.querySelectorAll('[role="dialog"]')){
const modal=dialog.getAttribute('aria-modal');
record('dialog-modality',modal==='true'||modal==='false'||modal===null,
`dialog declares aria-modal ${JSON.stringify(modal)}`);
}
record('live-region',!!root.querySelector('.lat-live'),
root.querySelector('.lat-live')?'present':'no live region: announcements go nowhere');
const popupTriggers=[...root.querySelectorAll(
'button[aria-haspopup], [role="button"][aria-haspopup]',
)];
const silentTriggers=popupTriggers.filter((el)=>{
const state=el.getAttribute('aria-expanded');
return state!=='true'&&state!=='false';
});
record('popup-trigger-expanded',silentTriggers.length===0,
popupTriggers.length
?`${popupTriggers.length-silentTriggers.length} of ${popupTriggers.length} popup buttons declare aria-expanded`
:'no popup-opening buttons rendered');
const box=root.getBoundingClientRect?root.getBoundingClientRect():null;
if(box&&box.width>0){
const targets=[...root.querySelectorAll(
'button, [role="button"], .lat-header-resize, .lat-panel__grip, input, select',
)].map((el)=>{
const r=el.getBoundingClientRect();
return{el,r,cx:r.x+r.width/2,cy:r.y+r.height/2};
}).filter((t)=>t.r.width>0&&t.r.height>0);
const undersized=[];
for(const t of targets){
if(t.r.width>=24&&t.r.height>=24)continue;
let nearest=Infinity;
for(const o of targets){
if(o===t)continue;
nearest=Math.min(nearest,Math.hypot(o.cx-t.cx,o.cy-t.cy));
}
if(nearest<24){
undersized.push(`${(t.el.className||'').toString().split(' ')[0]||t.el.tagName} `
+`${Math.round(t.r.width)}x${Math.round(t.r.height)}, ${Math.round(nearest)}px clear`);
}
}
record('target-size',undersized.length===0,
undersized.length
?`${undersized.length} target(s) under 24px with under 24px clear: check for an equivalent control: ${undersized.slice(0,3).join('; ')}`
:`${targets.length} targets pass on size or spacing`);
const escaped=[...root.querySelectorAll('.lat-status-bar button, .lat-status-bar select, .lat-status-bar input')]
.filter((el)=>el.getBoundingClientRect().right>box.right+1);
record('controls-within-bounds',escaped.length===0,
escaped.length?`${escaped.length} status-bar control(s) sit outside the grid`:'all chrome is inside the grid');
}
return{passes,failures};
}
const __default=runAccessibilityChecks;
});
__def("packages/modules/devtools/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createDevtools",{enumerable:true,get:function(){return createDevtools;}});
Object.defineProperty(__exports,"CONSOLE_ACTIVATION",{enumerable:true,get:function(){return CONSOLE_ACTIVATION;}});
Object.defineProperty(__exports,"expose",{enumerable:true,get:function(){return expose;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/modules/devtools/checks.js");
const runAccessibilityChecks=__m0["runAccessibilityChecks"];
const NS='lat-devtools';
const STORE_KEY='lattice.devtools';
const TABS=['Overview','Rendering','Store','Data','Streaming','Providers',
'Presence','Events','Config','A11y'];
const PANELS=new Set();
function styles(){
return`
.${NS}{position:fixed;z-index:2147483000;display:flex;flex-direction:column;
  background:#0f1216;color:#e8ecf1;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
  border:1px solid #2a323c;box-shadow:0 -2px 16px rgb(0 0 0/40%)}
.${NS}[data-dock=bottom]{left:0;right:0;bottom:0;height:300px;border-width:1px 0 0}
.${NS}[data-dock=right]{top:0;right:0;bottom:0;width:380px;border-width:0 0 0 1px}
.${NS}[data-collapsed]{height:auto!important;width:auto!important;left:auto;top:auto;
  right:12px;bottom:12px;border-radius:4px;border-width:1px}
.${NS}[data-collapsed] .${NS}__body,.${NS}[data-collapsed] .${NS}__tabs{display:none}
.${NS}__bar{display:flex;align-items:center;gap:4px 10px;padding:5px 8px;background:#171b21;
  border-bottom:1px solid #2a323c;flex-wrap:wrap}
.${NS}__title{font-weight:600;color:#6aa9f0}
.${NS}__vital{color:#a3aeba;flex:1 1 auto;min-width:0}
.${NS}__vital b{color:#e8ecf1;font-weight:600}
.${NS}__warn{color:#e0a94e}
.${NS}__spacer{flex:0 1 auto}
.${NS}__btn{padding:1px 6px;border:1px solid #2a323c;border-radius:3px;background:#0f1216;
  color:#a3aeba;cursor:pointer;font:inherit}
.${NS}__btn:hover{color:#e8ecf1;border-color:#46525f}
.${NS}__btn[data-on]{color:#0f1216;background:#6aa9f0;border-color:#6aa9f0}
/* Wrapped, not scrolled. Docked to the side the strip is 380px wide and nine
   tabs need 595px, so overflow scrolling hid four of them behind an edge with
   no affordance, and a tab nobody can see is a tab nobody opens. Two short
   rows cost less than a hidden half of the panel. */
.${NS}__tabs{display:flex;flex-wrap:wrap;gap:2px;padding:4px 6px 0;background:#131820;
  border-bottom:1px solid #2a323c}
.${NS}__tab{padding:3px 9px;border:1px solid transparent;border-bottom:0;border-radius:3px 3px 0 0;
  background:none;color:#78828d;cursor:pointer;font:inherit;white-space:nowrap}
.${NS}__tab[data-active]{background:#0f1216;border-color:#2a323c;color:#e8ecf1}
.${NS}__body{flex:1 1 auto;overflow:auto;padding:8px 10px}
.${NS} table{width:100%;border-collapse:collapse}
.${NS} th{text-align:left;font-weight:600;color:#78828d;padding:2px 8px 2px 0;font-size:11px;
  text-transform:uppercase;letter-spacing:.05em}
.${NS} td{padding:2px 8px 2px 0;vertical-align:top;border-top:1px solid #1c232b}
.${NS} td.n{text-align:right;font-variant-numeric:tabular-nums}
.${NS}__h{margin:10px 0 4px;color:#6aa9f0;font-weight:600}
.${NS}__h:first-child{margin-top:0}
.${NS}__item{padding:4px 6px;margin-bottom:3px;border-left:2px solid #e0a94e;background:#1c1a14}
.${NS}__item[data-src=check]{border-left-color:#f08b83;background:#1f1614}
.${NS}__id{color:#78828d}
.${NS}__none{color:#5b6570;font-style:italic}
.${NS}__grip{position:absolute;z-index:1;background:transparent}
.${NS}[data-dock=bottom] .${NS}__grip{top:-3px;left:0;right:0;height:6px;cursor:ns-resize}
.${NS}[data-dock=right] .${NS}__grip{left:-3px;top:0;bottom:0;width:6px;cursor:ew-resize}
.${NS}[data-collapsed] .${NS}__grip{display:none}
.${NS}__graph{display:block;width:100%;height:44px;background:#131820;border:1px solid #1c232b}
.${NS}__log{width:100%;border-collapse:collapse;font-size:11px}
.${NS}__log td{padding:1px 6px 1px 0;border-top:1px solid #1c232b;vertical-align:top}
.${NS}__log tr[data-slow] td{color:#e0a94e}
.${NS}__pick{background:#0f1216;color:#a3aeba;border:1px solid #2a323c;border-radius:3px;
  font:inherit;padding:1px 4px}
.${NS}__docs{color:#6aa9f0;text-decoration:none}
.${NS}__docs:hover{text-decoration:underline}
/* The heat overlay. Two colours, because "rewrote the same value" and "wrote a
   new value" are different findings and only one of them is waste. */
.lat-heat-changed{box-shadow:inset 0 0 0 9999px rgb(106 169 240 / 28%)!important}
.lat-heat-same{box-shadow:inset 0 0 0 9999px rgb(240 139 131 / 24%)!important}
`;
}
function num(v,dp=0){
if(typeof v!=='number'||!Number.isFinite(v))return'—';
return v.toLocaleString(undefined,{minimumFractionDigits:dp,maximumFractionDigits:dp});
}
function size(bytes){
if(typeof bytes!=='number'||!Number.isFinite(bytes))return'—';
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes/1024).toFixed(1)} KB`;
return`${(bytes/(1024*1024)).toFixed(2)} MB`;
}
function table(doc,rows){
const el=doc.createElement('table');
for(const[label,value]of rows){
const tr=doc.createElement('tr');
const th=doc.createElement('td');
th.textContent=label;
const td=doc.createElement('td');
td.className='n';
td.textContent=value===undefined||value===null?'—':String(value);
tr.appendChild(th);
tr.appendChild(td);
el.appendChild(tr);
}
return el;
}
class Devtools{
#grid;
#doc;
#root;
#body;
#barVitals;
#tab='Overview';
#dock='bottom';
#collapsed=false;
#heat=false;
#seen=new WeakMap();
#redundant=0;
#off=[];
#timer=null;
#picker=null;
#recording=false;
#eventFilter='';
#key;
#label='';
#size=null;
#popped=null;
constructor(opts){
this.#grid=opts.grid;
this.#doc=opts.grid.element?opts.grid.element.ownerDocument:document;
this.#key=`${STORE_KEY}.${opts.id||opts.grid.element?.id||'default'}`;
this.#restore();
if(opts.dock)this.#dock=opts.dock;
if(opts.collapsed!==undefined)this.#collapsed=!!opts.collapsed;
this.#label=opts.id||opts.grid.element?.id||`grid ${PANELS.size+1}`;
PANELS.add(this);
this.#build();
this.#wire();
this.refresh();
}
get element(){return this.#root;}
#restore(){
try{
const saved=JSON.parse(this.#doc.defaultView.localStorage.getItem(this.#key)||'{}');
if(saved.tab&&TABS.includes(saved.tab))this.#tab=saved.tab;
if(saved.dock==='bottom'||saved.dock==='right')this.#dock=saved.dock;
if(typeof saved.collapsed==='boolean')this.#collapsed=saved.collapsed;
if(Number.isFinite(saved.size)&&saved.size>80)this.#size=saved.size;
}catch{
}
}
#save(){
try{
this.#doc.defaultView.localStorage.setItem(this.#key,JSON.stringify({
tab:this.#tab,dock:this.#dock,collapsed:this.#collapsed,size:this.#size,
}));
}catch{}
}
#build(){
const doc=this.#doc;
if(!doc.getElementById(`${NS}-style`)){
const style=doc.createElement('style');
style.id=`${NS}-style`;
style.textContent=styles();
doc.head.appendChild(style);
}
const root=doc.createElement('div');
root.className=NS;
root.setAttribute('data-dock',this.#dock);
if(this.#collapsed)root.setAttribute('data-collapsed','true');
const grip=doc.createElement('div');
grip.className=`${NS}__grip`;
root.appendChild(grip);
const bar=doc.createElement('div');
bar.className=`${NS}__bar`;
const title=doc.createElement('span');
title.className=`${NS}__title`;
title.textContent='Lattice';
bar.appendChild(title);
const picker=doc.createElement('select');
picker.className=`${NS}__pick`;
picker.style.display='none';
picker.addEventListener('change',()=>{
for(const panel of PANELS){
if(panel.label===picker.value)panel.focusPanel();
}
});
bar.appendChild(picker);
this.#picker=picker;
const vitals=doc.createElement('span');
vitals.className=`${NS}__vital`;
bar.appendChild(vitals);
const spacer=doc.createElement('span');
spacer.className=`${NS}__spacer`;
bar.appendChild(spacer);
const heat=this.#button(bar,'heat',()=>{
this.#heat=!this.#heat;
heat.toggleAttribute('data-on',this.#heat);
if(this.#heat)this.#seedHeat();else this.#clearHeat();
});
this.#button(bar,'copy',()=>this.#copyBundle());
this.#button(bar,'pop',()=>this.#detach());
this.#button(bar,'dock',()=>{
this.#dock=this.#dock==='bottom'?'right':'bottom';
root.setAttribute('data-dock',this.#dock);
this.#save();
});
const toggle=this.#button(bar,this.#collapsed?'▲':'▼',()=>{
this.#collapsed=!this.#collapsed;
root.toggleAttribute('data-collapsed',this.#collapsed);
toggle.textContent=this.#collapsed?'▲':'▼';
this.#save();
});
const tabs=doc.createElement('div');
tabs.className=`${NS}__tabs`;
for(const name of TABS){
const tab=doc.createElement('button');
tab.className=`${NS}__tab`;
tab.type='button';
tab.textContent=name;
tab.toggleAttribute('data-active',name===this.#tab);
tab.addEventListener('click',()=>{
this.#tab=name;
for(const other of tabs.children)other.toggleAttribute('data-active',other===tab);
this.#save();
this.refresh();
});
tabs.appendChild(tab);
}
const body=doc.createElement('div');
body.className=`${NS}__body`;
root.appendChild(bar);
root.appendChild(tabs);
root.appendChild(body);
doc.body.appendChild(root);
this.#root=root;
this.#body=body;
this.#barVitals=vitals;
this.#applySize();
this.#wireGrip(grip);
}
get label(){return this.#label;}
focusPanel(){
const el=this.#grid.element;
if(el&&el.scrollIntoView)el.scrollIntoView({block:'center'});
if(!el)return;
const previous=el.style.outline;
el.style.outline='2px solid #6aa9f0';
setTimeout(()=>{el.style.outline=previous;},900);
}
#applySize(){
if(!this.#root)return;
this.#root.style.height='';
this.#root.style.width='';
if(this.#size===null)return;
if(this.#dock==='bottom')this.#root.style.height=`${this.#size}px`;
else this.#root.style.width=`${this.#size}px`;
}
#wireGrip(grip){
const doc=this.#doc;
let dragging=false;
const down=(e)=>{
dragging=true;
if(grip.setPointerCapture&&e.pointerId!==undefined){
try{grip.setPointerCapture(e.pointerId);}catch{}
}
e.preventDefault();
};
const move=(e)=>{
if(!dragging)return;
const view=doc.defaultView;
const next=this.#dock==='bottom'
?view.innerHeight-e.clientY
:view.innerWidth-e.clientX;
this.#size=Math.max(120,Math.min(next,this.#dock==='bottom'
?view.innerHeight-60:view.innerWidth-60));
this.#applySize();
};
const up=()=>{
if(!dragging)return;
dragging=false;
this.#save();
};
grip.addEventListener('pointerdown',down);
grip.addEventListener('pointermove',move);
grip.addEventListener('pointerup',up);
grip.addEventListener('pointercancel',up);
this.#off.push(()=>{
grip.removeEventListener('pointerdown',down);
grip.removeEventListener('pointermove',move);
grip.removeEventListener('pointerup',up);
grip.removeEventListener('pointercancel',up);
});
}
#detach(){
if(this.#popped){this.#popped.focus();return;}
const view=this.#doc.defaultView;
const popped=view.open('',`lattice-devtools-${this.#label}`,
'width=460,height=640,menubar=no,toolbar=no');
if(!popped)return;
popped.document.title=`Lattice devtools: ${this.#label}`;
const style=popped.document.createElement('style');
style.textContent=`${styles()}\n.${NS}{position:static;height:100vh;width:auto;border:0}`;
popped.document.head.appendChild(style);
popped.document.body.style.margin='0';
popped.document.body.appendChild(this.#root);
this.#popped=popped;
const back=()=>{
this.#popped=null;
if(this.#root)this.#doc.body.appendChild(this.#root);
};
popped.addEventListener('beforeunload',back);
view.addEventListener('beforeunload',()=>popped.close());
}
#syncPicker(){
if(!this.#picker)return;
if(PANELS.size<2){this.#picker.style.display='none';return;}
this.#picker.style.display='';
const wanted=[...PANELS].map((p)=>p.label);
const current=[...this.#picker.options].map((o)=>o.value);
if(wanted.join('|')===current.join('|'))return;
this.#picker.textContent='';
for(const label of wanted){
const option=this.#doc.createElement('option');
option.value=label;
option.textContent=label;
if(label===this.#label)option.selected=true;
this.#picker.appendChild(option);
}
}
#button(bar,label,onClick){
const button=this.#doc.createElement('button');
button.className=`${NS}__btn`;
button.type='button';
button.textContent=label;
button.addEventListener('click',onClick);
bar.appendChild(button);
return button;
}
#wire(){
const on=(event,fn)=>{this.#off.push(this.#grid.on(event,fn));};
on('render:done',()=>{this.#paintHeat();this.#schedule();});
on('filter:changed',()=>this.#schedule());
on('rows:changed',()=>this.#schedule());
on('comment:indexLoaded',()=>this.#schedule());
on('facet:computed',()=>this.#schedule());
}
#schedule(){
if(this.#timer!==null)return;
this.#timer=setTimeout(()=>{this.#timer=null;this.refresh();},120);
}
#paintHeat(){
if(!this.#heat)return;
const root=this.#grid.element;
if(!root||!root.querySelectorAll)return;
let redundant=0;
for(const cell of root.querySelectorAll('.lat-cell[data-col]')){
const text=cell.textContent;
const previous=this.#seen.get(cell);
this.#seen.set(cell,text);
cell.classList.remove('lat-heat-changed','lat-heat-same');
if(previous===undefined)continue;
if(previous===text){cell.classList.add('lat-heat-same');redundant++;}
else cell.classList.add('lat-heat-changed');
}
this.#redundant=redundant;
setTimeout(()=>this.#clearHeat(),260);
}
#seedHeat(){
const root=this.#grid.element;
if(!root||!root.querySelectorAll)return;
for(const cell of root.querySelectorAll('.lat-cell[data-col]')){
this.#seen.set(cell,cell.textContent);
}
}
#clearHeat(){
const root=this.#grid.element;
if(!root||!root.querySelectorAll)return;
for(const cell of root.querySelectorAll('.lat-heat-changed, .lat-heat-same')){
cell.classList.remove('lat-heat-changed','lat-heat-same');
}
}
#copyBundle(){
const text=JSON.stringify(this.#grid.diagnostics.bundle(),null,2);
const nav=this.#doc.defaultView.navigator;
if(nav&&nav.clipboard&&nav.clipboard.writeText){
nav.clipboard.writeText(text).catch(()=>this.#download(text));
return;
}
this.#download(text);
}
#download(text){
const doc=this.#doc;
const url=doc.defaultView.URL.createObjectURL(new Blob([text],{type:'application/json'}));
const a=doc.createElement('a');
a.href=url;
a.download='lattice-diagnostics.json';
a.click();
doc.defaultView.URL.revokeObjectURL(url);
}
refresh(){
const d=this.#grid.diagnostics;
const renders=d.renders();
const warnings=d.warnings();
this.#syncPicker();
const vp=renders.viewport||{};
this.#barVitals.innerHTML='';
const parts=[
`rows <b>${num(vp.totalRows)}</b>`,
`dom <b>${num(vp.renderedRows)}</b>`,
`renders <b>${num(renders.total)}</b>`,
`writes <b>${num(renders.dom&&renders.dom.cellWrites)}</b>`,
renders.last?`last <b>${num(renders.last.totalMs,1)}ms</b>`:'',
].filter(Boolean);
this.#barVitals.innerHTML=parts.join(' · ');
if(warnings.length){
const warn=this.#doc.createElement('span');
warn.className=`${NS}__warn`;
warn.textContent=` ⚠ ${warnings.length}`;
this.#barVitals.appendChild(warn);
}
if(this.#collapsed)return;
this.#body.textContent='';
const draw=this[`_${this.#tab}`];
if(draw)draw.call(this,this.#body,d);
}
#domNodes(){
const el=this.#grid.element;
return el&&el.querySelectorAll?el.querySelectorAll('*').length:0;
}
#graph(frames){
const doc=this.#doc;
const canvas=doc.createElement('canvas');
canvas.className=`${NS}__graph`;
const width=300;
const height=44;
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext?canvas.getContext('2d'):null;
if(!ctx)return canvas;
const samples=frames.recent.slice(-width);
const peak=Math.max(frames.budgetMs*2,...samples,1);
const barWidth=Math.max(1,Math.floor(width/Math.max(samples.length,1)));
ctx.fillStyle='#131820';
ctx.fillRect(0,0,width,height);
const budgetY=height-(frames.budgetMs/peak)*height;
ctx.strokeStyle='#46525f';
ctx.beginPath();
ctx.moveTo(0,budgetY);
ctx.lineTo(width,budgetY);
ctx.stroke();
samples.forEach((ms,i)=>{
const h=Math.max(1,(ms/peak)*height);
ctx.fillStyle=ms>frames.budgetMs*1.5?'#f08b83':'#6aa9f0';
ctx.fillRect(i*barWidth,height-h,Math.max(1,barWidth-1),h);
});
return canvas;
}
#heading(into,text){
const h=this.#doc.createElement('div');
h.className=`${NS}__h`;
h.textContent=text;
into.appendChild(h);
}
_Overview(into,d){
const snap=d.snapshot();
this.#heading(into,'Instance');
into.appendChild(table(this.#doc,[
['version',snap.version],
['rows',num(snap.rows)],
['columns',`${snap.columns.visible} of ${snap.columns.total} visible`],
['listeners',num(Object.values(snap.events||{}).reduce((a,b)=>a+b,0))],
['store',size(snap.store&&snap.store.bytes)],
]));
const frames=snap.render&&snap.render.frames;
if(frames){
this.#heading(into,'Frames');
into.appendChild(table(this.#doc,[
['mean interval',`${num(frames.meanMs,1)} ms`],
['dropped',num(frames.dropped)],
['since last render',frames.sinceLastMs===null?'—':`${num(frames.sinceLastMs,0)} ms`],
['dom nodes',num(this.#domNodes())],
]));
into.appendChild(this.#graph(frames));
}
this.#heading(into,`Warnings (${snap.warnings.length})`);
if(!snap.warnings.length){
const none=this.#doc.createElement('div');
none.className=`${NS}__none`;
none.textContent='Nothing flagged.';
into.appendChild(none);
return;
}
for(const w of snap.warnings){
const item=this.#doc.createElement('div');
item.className=`${NS}__item`;
item.setAttribute('data-src',w.source);
const id=this.#doc.createElement('div');
id.className=`${NS}__id`;
id.textContent=w.id+(w.count>1?` ×${w.count}`:'');
const msg=this.#doc.createElement('div');
msg.textContent=w.message;
item.appendChild(id);
item.appendChild(msg);
if(w.docs){
const link=this.#doc.createElement('a');
link.className=`${NS}__docs`;
link.href=`../docs/${w.docs}`;
link.target='_blank';
link.rel='noopener';
link.textContent='documentation →';
item.appendChild(link);
}
if(Object.keys(w.values||{}).length){
const values=this.#doc.createElement('div');
values.className=`${NS}__id`;
values.textContent=JSON.stringify(w.values);
item.appendChild(values);
}
into.appendChild(item);
}
}
_Rendering(into,d){
const r=d.renders();
const vp=r.viewport||{};
const dom=r.dom||{};
this.#heading(into,'Viewport');
into.appendChild(table(this.#doc,[
['rendered / total',`${num(vp.renderedRows)} / ${num(vp.totalRows)}`],
['row window',`${vp.firstRow} – ${vp.lastRow}`],
['overscan',vp.overscan],
['row height',num(vp.rowHeight,1)],
['by region',vp.byRegion
?`${vp.byRegion.start} / ${vp.byRegion.centre} / ${vp.byRegion.end}`:'—'],
]));
this.#heading(into,`Renders (${num(r.total)})`);
into.appendChild(table(this.#doc,
Object.entries(r.byCause||{}).map(([k,v])=>[k,num(v)])));
this.#heading(into,'DOM');
into.appendChild(table(this.#doc,[
['cell writes',num(dom.cellWrites)],
['row updates',num(dom.rowUpdates)],
['paints',num(dom.paints)],
['row pool',`${num(dom.rowReuses)} reused / ${num(dom.rowAllocations)} allocated`],
['cell pool',`${num(dom.cellReuses)} reused / ${num(dom.cellAllocations)} allocated`],
['redundant writes (heat)',this.#heat?num(this.#redundant):'heat off'],
]));
if(r.last){
this.#heading(into,'Last render');
into.appendChild(table(this.#doc,[
['cause',r.last.cause],
['layout',`${num(r.last.layoutMs,2)} ms`],
['source hint',`${num(r.last.hintMs,2)} ms`],
['dom write',`${num(r.last.writeMs,2)} ms`],
['total',`${num(r.last.totalMs,2)} ms`],
]));
}
}
_Store(into,d){
const s=d.store();
this.#heading(into,'Footprint');
into.appendChild(table(this.#doc,[
['total',size(s.bytes)],
['rows',num(s.rows)],
['physical',num(s.physical)],
['tombstoned',num(s.tombstoned)],
['columnar',String(s.columnar)],
]));
if(s.note){
const note=this.#doc.createElement('div');
note.className=`${NS}__none`;
note.textContent=s.note;
into.appendChild(note);
}
this.#heading(into,'Columns');
into.appendChild(table(this.#doc,
(s.columns||[]).map((c)=>[`${c.id} (${c.kind})`,size(c.bytes)])));
this.#heading(into,'Pipeline');
const stages=d.renders().stages||[];
into.appendChild(stages.length?table(this.#doc,stages.map((st)=>[
st.stage,
`${st.materialised?'held':'empty'} · ${st.rows===null?'—':num(st.rows)} rows · `
+`${st.bytes===null?'—':size(st.bytes)} · ${num(st.rebuilds)} rebuilds`,
])):this.#empty('No pipeline on this source.'));
this.#heading(into,'Growth');
const markBtn=this.#doc.createElement('button');
markBtn.className=`${NS}__btn`;
markBtn.type='button';
markBtn.textContent='mark';
markBtn.addEventListener('click',()=>{d.mark();this.refresh();});
into.appendChild(markBtn);
const diff=d.since();
if(!diff){
into.appendChild(this.#empty('Mark the store, then come back to see what changed.'));
return;
}
into.appendChild(table(this.#doc,[
['since',`${num(diff.seconds)}s ago`],
['rows',(diff.rows>=0?'+':'')+num(diff.rows)],
['bytes',(diff.bytes>=0?'+':'')+size(Math.abs(diff.bytes))],
['renders',`+${num(diff.renders)}`],
]));
if(diff.columns.length){
into.appendChild(table(this.#doc,
diff.columns.map((c)=>[c.id,(c.bytes>=0?'+':'-')+size(Math.abs(c.bytes))])));
}
}
_Data(into,d){
const ops=d.operations();
this.#heading(into,`Operations (sample of ${ops.sampleSize})`);
const rows=Object.entries(ops.kinds||{}).map(([kind,o])=>[
kind,`${num(o.count)} × · mean ${num(o.meanMs,2)}ms · worst ${num(o.worstMs,2)}ms`,
]);
into.appendChild(rows.length?table(this.#doc,rows):this.#empty('Nothing recorded yet.'));
this.#heading(into,'Query');
const q=d.snapshot().config?this.#grid.diagnostics.bundle().query:null;
const pre=this.#doc.createElement('pre');
pre.textContent=JSON.stringify(q,null,2);
into.appendChild(pre);
}
_Presence(into){
const presence=this.#grid.presence;
if(!presence||!presence.enabled){
into.appendChild(this.#empty('No presence provider configured.'));
return;
}
const stats=presence.stats();
const peers=presence.peers();
this.#heading(into,'Transport');
into.appendChild(table(this.#doc,[
['publishing',String(presence.publishing)],
['published',num(stats.published)],
['received',num(stats.received)],
['throttle drops',num(stats.dropped)],
['provider errors',num(stats.errors)],
]));
this.#heading(into,`Peers (${peers.length}, ${presence.hiddenCount()} not in view)`);
into.appendChild(peers.length?table(this.#doc,peers.map((p)=>[
p.name,
`${p.idle?'idle':'active'}${p.hidden?' · not in view':''}`
+`${p.cursor?` · ${p.cursor.rowId}/${p.cursor.colId}`:''}`
+`${p.editing?' · editing':''}`,
])):this.#empty('Nobody else is here.'));
}
_Providers(into,d){
const p=d.providers();
this.#heading(into,'Configured');
into.appendChild(p.configured.length
?table(this.#doc,p.configured.map((n)=>[n,p.stats[n]?'active':'no calls yet']))
:this.#empty('No providers configured.'));
for(const[name,s]of Object.entries(p.stats||{})){
this.#heading(into,name);
into.appendChild(table(this.#doc,[
['calls',num(s.calls)],
['errors',num(s.errors)],
['in flight',num(s.inFlight)],
['mean',`${num(s.meanMs,2)} ms`],
['worst',`${num(s.worstMs,2)} ms`],
]));
const failed=(s.recent||[]).filter((c)=>!c.ok);
for(const call of failed){
const item=this.#doc.createElement('div');
item.className=`${NS}__item`;
item.setAttribute('data-src','check');
item.textContent=`${call.detail||'call'}: ${call.error}`;
into.appendChild(item);
}
}
}
_Events(into,d){
const doc=this.#doc;
const counts=d.events();
const rows=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
this.#heading(into,`Listeners (${rows.reduce((n,r)=>n+r[1],0)})`);
into.appendChild(rows.length?table(doc,rows.map(([k,v])=>[k,num(v)]))
:this.#empty('No listeners.'));
this.#heading(into,'Live log');
const controls=doc.createElement('div');
controls.style.display='flex';
controls.style.gap='6px';
controls.style.marginBottom='4px';
const record=doc.createElement('button');
record.className=`${NS}__btn`;
record.type='button';
record.textContent=this.#recording?'recording':'record';
record.toggleAttribute('data-on',this.#recording);
record.addEventListener('click',()=>{
this.#recording=!this.#recording;
d.recordEvents(this.#recording);
this.refresh();
});
controls.appendChild(record);
const filter=doc.createElement('input');
filter.className=`${NS}__pick`;
filter.placeholder='filter by type';
filter.value=this.#eventFilter;
filter.addEventListener('input',()=>{
this.#eventFilter=filter.value;
this.#drawLog(logBody,d);
});
controls.appendChild(filter);
const clear=doc.createElement('button');
clear.className=`${NS}__btn`;
clear.type='button';
clear.textContent='clear';
clear.addEventListener('click',()=>{d.clearEventLog();this.#drawLog(logBody,d);});
controls.appendChild(clear);
into.appendChild(controls);
const logBody=doc.createElement('table');
logBody.className=`${NS}__log`;
into.appendChild(logBody);
this.#drawLog(logBody,d);
}
#drawLog(into,d){
into.textContent='';
if(!this.#recording){
const row=into.insertRow();
row.insertCell().textContent='Not recording.';
return;
}
const needle=this.#eventFilter.trim().toLowerCase();
const entries=d.eventLog()
.filter((e)=>!needle||e.type.toLowerCase().includes(needle))
.slice(-100)
.reverse();
if(!entries.length){
const row=into.insertRow();
row.insertCell().textContent=needle?'Nothing matching.':'No events yet.';
return;
}
for(const e of entries){
const row=into.insertRow();
if(e.ms>16)row.setAttribute('data-slow','true');
row.insertCell().textContent=e.type;
row.insertCell().textContent=`${e.listeners}L`;
row.insertCell().textContent=`${e.ms.toFixed(2)}ms`;
row.insertCell().textContent=Object.entries(e.payload)
.map(([k,v])=>`${k}=${v}`).join(' ').slice(0,80);
}
}
_Config(into,d){
const c=d.config();
this.#heading(into,`Supplied (${c.supplied.length})`);
into.appendChild(table(this.#doc,c.supplied.map((k)=>[k,format(c.effective[k])])));
this.#heading(into,`Defaulted (${c.defaulted.length})`);
into.appendChild(table(this.#doc,c.defaulted.map((k)=>[k,format(c.effective[k])])));
this.#heading(into,`Changed this session (${(c.changes||[]).length})`);
into.appendChild((c.changes||[]).length
?table(this.#doc,c.changes.map((ch)=>[ch.key,`${format(ch.from)} → ${format(ch.to)}`]))
:this.#empty('Nothing has changed since load.'));
}
_Streaming(into){
const updates=this.#grid.updates;
if(!updates){into.appendChild(this.#empty('No streaming API on this grid.'));return;}
const stats=updates.stats();
const mode=(this.#grid.get('source')||{}).mode;
if(mode!=='stream'){
into.appendChild(this.#empty(`No stream attached (source mode: ${mode||'memory'}).`));
}
this.#heading(into,'Throughput');
into.appendChild(table(this.#doc,[
['rows arrived',num(stats.rows)],
['queued',num(stats.queued)],
['pending',num(stats.pending)],
['coalesced',num(stats.coalesced)],
['coalesced total',num(stats.coalescedTotal)],
['flushes',num(stats.flushes)],
]));
this.#heading(into,'Buffer');
into.appendChild(table(this.#doc,[
['paused',String(stats.paused)],
['held rows',`${num(stats.held)} of ${num(stats.heldLimit)}`],
['dropped to stay in cap',num(stats.dropped)],
['span',stats.span?`${new Date(stats.span.from).toLocaleTimeString()} – ${new Date(stats.span.to).toLocaleTimeString()}`:'—'],
]));
}
_A11y(into){
const run=this.#doc.createElement('button');
run.className=`${NS}__btn`;
run.type='button';
run.textContent='Run checks';
into.appendChild(run);
const results=this.#doc.createElement('div');
into.appendChild(results);
const go=()=>{
results.textContent='';
const{passes,failures}=runAccessibilityChecks(this.#grid);
this.#heading(results,`Failures (${failures.length})`);
if(!failures.length)results.appendChild(this.#empty('Nothing failing.'));
for(const f of failures){
const item=this.#doc.createElement('div');
item.className=`${NS}__item`;
item.setAttribute('data-src','check');
const id=this.#doc.createElement('div');
id.className=`${NS}__id`;
id.textContent=f.id;
const detail=this.#doc.createElement('div');
detail.textContent=f.detail;
item.appendChild(id);
item.appendChild(detail);
results.appendChild(item);
}
this.#heading(results,`Passing (${passes.length})`);
results.appendChild(table(this.#doc,passes.map((c)=>[c.id,c.detail])));
};
run.addEventListener('click',go);
go();
}
#empty(text){
const el=this.#doc.createElement('div');
el.className=`${NS}__none`;
el.textContent=text;
return el;
}
destroy(){
PANELS.delete(this);
if(this.#popped){this.#popped.close();this.#popped=null;}
for(const off of this.#off)off();
this.#off=[];
if(this.#timer!==null)clearTimeout(this.#timer);
this.#clearHeat();
if(this.#root&&this.#root.remove)this.#root.remove();
}
}
function format(v){
if(v===null||v===undefined)return'—';
if(typeof v==='object')return JSON.stringify(v);
return String(v);
}
function createDevtools(opts){
if(!opts||!opts.grid)throw new Error('[lattice] createDevtools needs a grid');
if(!opts.grid.diagnostics){
throw new Error('[lattice] this grid has no diagnostics; the version is too old');
}
const panel=new Devtools(opts);
if(opts.hotkey!==false){
const doc=panel.element.ownerDocument;
const onKey=(e)=>{
if(e.ctrlKey&&e.shiftKey&&(e.key==='d'||e.key==='D')){
e.preventDefault();
panel.element.toggleAttribute('data-collapsed');
}
};
doc.addEventListener('keydown',onKey);
const inner=panel.destroy.bind(panel);
panel.destroy=()=>{doc.removeEventListener('keydown',onKey);inner();};
}
return panel;
}
const CONSOLE_ACTIVATION='__LATTICE_DEVTOOLS_CONSOLE__'!=='false';
function expose(grid){
if(!CONSOLE_ACTIVATION)return;
const scope=typeof globalThis==='object'?globalThis:null;
if(!scope)return;
const known=scope.__latticeGrids||(scope.__latticeGrids=new Set());
known.add(grid);
if(typeof scope.__latticeDevtools==='function')return;
scope.__latticeDevtools=()=>[...known].map((g)=>createDevtools({grid:g}));
}
const __default=createDevtools;
});
var __entry=__req("packages/modules/devtools/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);