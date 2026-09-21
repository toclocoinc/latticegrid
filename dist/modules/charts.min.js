/*!
 * Lattice Grid 1.67.0, charts module
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
__def("packages/modules/charts/svg.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"SVG_NS",{enumerable:true,get:function(){return SVG_NS;}});
Object.defineProperty(__exports,"el",{enumerable:true,get:function(){return el;}});
Object.defineProperty(__exports,"svg",{enumerable:true,get:function(){return svg;}});
Object.defineProperty(__exports,"attr",{enumerable:true,get:function(){return attr;}});
Object.defineProperty(__exports,"attrs",{enumerable:true,get:function(){return attrs;}});
Object.defineProperty(__exports,"setText",{enumerable:true,get:function(){return setText;}});
Object.defineProperty(__exports,"clear",{enumerable:true,get:function(){return clear;}});
Object.defineProperty(__exports,"append",{enumerable:true,get:function(){return append;}});
Object.defineProperty(__exports,"path",{enumerable:true,get:function(){return path;}});
Object.defineProperty(__exports,"ribbonPath",{enumerable:true,get:function(){return ribbonPath;}});
Object.defineProperty(__exports,"round",{enumerable:true,get:function(){return round;}});
Object.defineProperty(__exports,"pathRings",{enumerable:true,get:function(){return pathRings;}});
Object.defineProperty(__exports,"insideRings",{enumerable:true,get:function(){return insideRings;}});
const SVG_NS='http://www.w3.org/2000/svg';
function el(doc,tag,className){
const node=doc.createElement(tag);
if(className)node.setAttribute('class',className);
return node;
}
function svg(doc,tag,attrs){
const node=(doc.createElementNS(SVG_NS,tag));
if(attrs)for(const key of Object.keys(attrs))node.setAttribute(key,String(attrs[key]));
return node;
}
function attr(node,name,value){
if(!node)return;
if(value===null||value===undefined)node.removeAttribute(name);
else node.setAttribute(name,String(value));
}
function attrs(node,values){
if(!node)return;
for(const name of Object.keys(values))attr(node,name,values[name]);
}
function setText(node,text){
if(node)node.textContent=text===null||text===undefined?'':String(text);
}
function clear(node){
if(!node)return;
while(node.firstChild)node.removeChild(node.firstChild);
}
function append(parent,children){
for(const child of children)if(child)parent.appendChild(child);
return parent;
}
function path(parts){
return parts.join(' ');
}
function ribbonPath(rows){
if(!rows||rows.length<2)return'';
const shape=['M',rows[0].x,rows[0].upper];
for(let i=1;i<rows.length;i++)shape.push('L',rows[i].x,rows[i].upper);
for(let i=rows.length-1;i>=0;i--)shape.push('L',rows[i].x,rows[i].lower);
shape.push('Z');
return path(shape);
}
function round(n){
return Math.round(n*100)/100;
}
function pathRings(d){
const rings=[];
let ring=[];
const tokens=String(d||'').match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[];
let command='';
let numbers=[];
const flush=()=>{
if(!command||!numbers.length){numbers=[];return;}
if(command==='M'||command==='L'){
for(let i=0;i+1<numbers.length;i+=2)ring.push([numbers[i],numbers[i+1]]);
}else if(command!=='Z'&&numbers.length>=2){
ring.push([numbers[numbers.length-2],numbers[numbers.length-1]]);
}
numbers=[];
};
for(const token of tokens){
if(/[A-Za-z]/.test(token)){
flush();
if(token==='Z'||token==='z'){
if(ring.length>2)rings.push(ring);
ring=[];
command='';
continue;
}
if(token==='M'&&ring.length>2){
rings.push(ring);
ring=[];
}
command=token;
continue;
}
numbers.push(Number(token));
}
flush();
if(ring.length>2)rings.push(ring);
return rings;
}
function insideRings(rings,x,y){
let inside=false;
for(const ring of rings){
for(let i=0,j=ring.length-1;i<ring.length;j=i++){
const[xi,yi]=ring[i];
const[xj,yj]=ring[j];
if((yi>y)!==(yj>y)&&x<((xj-xi)*(y-yi))/((yj-yi)||1e-12)+xi){
inside=!inside;
}
}
}
return inside;
}
});
__def("packages/modules/charts/typography.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"BASE_SIZE",{enumerable:true,get:function(){return BASE_SIZE;}});
Object.defineProperty(__exports,"BASE_FAMILY",{enumerable:true,get:function(){return BASE_FAMILY;}});
Object.defineProperty(__exports,"CHAR_RATIO",{enumerable:true,get:function(){return CHAR_RATIO;}});
Object.defineProperty(__exports,"resolveType",{enumerable:true,get:function(){return resolveType;}});
Object.defineProperty(__exports,"textWidth",{enumerable:true,get:function(){return textWidth;}});
Object.defineProperty(__exports,"widestLabel",{enumerable:true,get:function(){return widestLabel;}});
Object.defineProperty(__exports,"truncateTo",{enumerable:true,get:function(){return truncateTo;}});
Object.defineProperty(__exports,"applySize",{enumerable:true,get:function(){return applySize;}});
const BASE_SIZE=12;
const BASE_FAMILY='var(--lattice-font-family, system-ui, -apple-system, sans-serif)';
const CHAR_RATIO=0.62;
function resolveType(spec){
const given=spec&&spec.font;
const font=typeof given==='number'?{size:given}:(given||{});
const size=positive(font.size,BASE_SIZE);
return{
family:font.family||BASE_FAMILY,
size,
small:positive(font.small??font.tickSize,Math.max(9,size-1)),
title:positive(font.title,Math.round(size*1.15)),
axisTitle:positive(font.axisTitle,Math.max(10,size-1)),
weight:font.weight||'inherit',
};
}
function positive(value,fallback){
const n=Number(value);
return Number.isFinite(n)&&n>0?n:fallback;
}
function textWidth(text,size){
return String(text===null||text===undefined?'':text).length*size*CHAR_RATIO;
}
function widestLabel(labels,size){
let widest=0;
for(const label of labels||[]){
const width=textWidth(label,size);
if(width>widest)widest=width;
}
return widest;
}
function truncateTo(text,px,size){
const value=String(text===null||text===undefined?'':text);
const chars=Math.floor(px/(size*CHAR_RATIO));
if(chars<=0)return'';
if(value.length<=chars)return value;
if(chars===1)return'…';
return`${value.slice(0,chars-1)}…`;
}
function applySize(node,size){
if(!node||!Number.isFinite(size))return;
if(node.style)node.style.fontSize=`${size}px`;
else node.setAttribute('style',`font-size:${size}px`);
}
});
__def("packages/modules/charts/frame.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"LABEL_GAP",{enumerable:true,get:function(){return LABEL_GAP;}});
Object.defineProperty(__exports,"LABEL_GUTTER_SHARE",{enumerable:true,get:function(){return LABEL_GUTTER_SHARE;}});
Object.defineProperty(__exports,"resolveMargin",{enumerable:true,get:function(){return resolveMargin;}});
Object.defineProperty(__exports,"plotRect",{enumerable:true,get:function(){return plotRect;}});
Object.defineProperty(__exports,"shouldRotate",{enumerable:true,get:function(){return shouldRotate;}});
Object.defineProperty(__exports,"Pool",{enumerable:true,get:function(){return Pool;}});
const __m0=__req("packages/modules/charts/svg.js");
const SVG_NS=__m0["SVG_NS"];
const __m1=__req("packages/modules/charts/typography.js");
const textWidth=__m1["textWidth"];
const widestLabel=__m1["widestLabel"];
const BARE_GUTTER=8;
const LABEL_GAP=6;
const LABEL_GUTTER_SHARE=0.4;
function resolveMargin(margin,fallback){
const base=typeof margin==='number'?margin:fallback;
const given=margin&&typeof margin==='object'?margin:{};
const side=(value)=>(Number.isFinite(value)&&value>=0?Number(value):base);
return{
base,
top:side(given.top),
right:side(given.right),
bottom:side(given.bottom),
left:side(given.left),
};
}
function plotRect(opts){
const margin=resolveMargin(opts.margin,typeof opts.padding==='number'?opts.padding:8);
const pad=margin.base;
const font=opts.fontSize||12;
const yLabels=opts.yLabels||[];
const xLabels=opts.xLabels||[];
const titles=opts.titles||{};
const titleSize=opts.titleSize||font;
const titleRoom=(text)=>(text?titleSize+LABEL_GAP:0);
const widest=widestLabel(yLabels,font);
const left=(yLabels.length
?Math.min(opts.width*LABEL_GUTTER_SHARE,margin.left+widest+LABEL_GAP)
:Math.max(BARE_GUTTER,margin.left))+titleRoom(titles.left);
const longest=widestLabel(xLabels.map((l)=>String(l).slice(0,14)),font);
const bottom=(xLabels.length
?(opts.rotated
?Math.min(opts.height*LABEL_GUTTER_SHARE,LABEL_GAP+longest)
:font+LABEL_GAP+margin.bottom)
:Math.max(BARE_GUTTER,margin.bottom))+titleRoom(titles.bottom);
const right=margin.right+titleRoom(titles.right)+(opts.rightGutter||0);
const top=margin.top+(opts.topGutter||0);
const width=Math.max(0,opts.width-left-right);
const height=Math.max(0,opts.height-top-bottom);
return{
left,
top,
width,
height,
right:left+width,
bottom:top+height,
gutter:{left,bottom,right,top},
};
}
function shouldRotate(labels,slot,fontSize,every){
if(!labels.length||slot<=0)return false;
const step=Number.isFinite(every)&&every>0?Number(every):1;
return widestLabel(labels,fontSize)>slot*step-4;
}
class Pool{
#parent;
#used=0;
constructor(parent){
this.#parent=parent;
}
next(tag,className){
const existing=this.#parent.childNodes[this.#used];
const found=existing&&(existing).tagName;
if(found&&String(found).toLowerCase()===tag.toLowerCase()){
this.#used++;
return(existing);
}
const created=this.#parent.ownerDocument.createElementNS(SVG_NS,tag);
if(className)created.setAttribute('class',className);
if(existing)this.#parent.insertBefore(created,existing);
else this.#parent.appendChild(created);
this.#used++;
return created;
}
finish(){
while(this.#parent.childNodes.length>this.#used){
this.#parent.removeChild(this.#parent.lastChild);
}
this.#used=0;
}
}
});
__def("packages/modules/charts/scheme.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"PALETTE",{enumerable:true,get:function(){return PALETTE;}});
Object.defineProperty(__exports,"SCHEMES",{enumerable:true,get:function(){return SCHEMES;}});
Object.defineProperty(__exports,"registerScheme",{enumerable:true,get:function(){return registerScheme;}});
Object.defineProperty(__exports,"setDefaultScheme",{enumerable:true,get:function(){return setDefaultScheme;}});
Object.defineProperty(__exports,"schemeNames",{enumerable:true,get:function(){return schemeNames;}});
Object.defineProperty(__exports,"resolveScheme",{enumerable:true,get:function(){return resolveScheme;}});
Object.defineProperty(__exports,"toRgb",{enumerable:true,get:function(){return toRgb;}});
Object.defineProperty(__exports,"rampStops",{enumerable:true,get:function(){return rampStops;}});
const PALETTE=Object.freeze([
'#0072b2','#e69f00','#009e73','#cc79a7',
'#56b4e9','#d55e00','#7a5195','#6b7d8c',
]);
const SCHEMES=Object.freeze({
default:{
series:PALETTE,
sequential:['#ecf3f9','#005280'],
diverging:['#b04a00','#f7f7f7','#005280'],
positive:'#009e73',
negative:'#d55e00',
},
bright:{
series:['#1f77d0','#ff7f0e','#2ca02c','#d62728','#9467bd','#17becf','#e377c2','#7f7f7f'],
sequential:['#eef4fb','#1f77d0'],
diverging:['#d62728','#f7f7f7','#1f77d0'],
positive:'#2ca02c',
negative:'#d62728',
},
earth:{
series:['#5b7c6f','#c08b52','#7a6a53','#a4553f','#4e6a83','#8f8259','#6d5566','#8c9196'],
sequential:['#f2efe9','#4e6a83'],
diverging:['#a4553f','#f2efe9','#4e6a83'],
positive:'#5b7c6f',
negative:'#a4553f',
},
mono:{
series:['#0b2a3d','#17475f','#2c6480','#4a82a0','#6da0bd','#94bcd6','#bcd7e9','#dfecf5'],
sequential:['#eef3f7','#0b2a3d'],
diverging:['#7a5c00','#f5f5f5','#0b2a3d'],
positive:'#17475f',
negative:'#7a5c00',
},
});
const REGISTERED=new Map();
let fallbackName='default';
function registerScheme(name,scheme){
if(!name||!scheme)return;
REGISTERED.set(String(name),scheme);
}
function setDefaultScheme(scheme){
if(typeof scheme==='string'){
fallbackName=scheme;
return;
}
if(scheme&&typeof scheme==='object'){
REGISTERED.set('__default__',scheme);
fallbackName='__default__';
}
}
function schemeNames(){
return[...Object.keys(SCHEMES),...REGISTERED.keys()].filter((n)=>!n.startsWith('__'));
}
function named(name){
if(REGISTERED.has(name))return REGISTERED.get(name);
return SCHEMES[name]||null;
}
function resolveScheme(spec){
const base=named(fallbackName)||SCHEMES.default;
const asked=spec&&spec.scheme;
const chosen=typeof asked==='string'?named(asked):(asked||null);
const palette=spec&&Array.isArray(spec.palette)&&spec.palette.length
?spec.palette
:null;
const merged={...SCHEMES.default,...base,...(chosen||{})};
if(palette)merged.series=palette;
const explicit=!!(chosen||palette);
const colours=merged.series&&merged.series.length?merged.series:PALETTE;
return{
...merged,
series:(index)=>colourAt(colours,index,explicit),
explicit,
};
}
function colourAt(colours,index,explicit){
const i=((index%colours.length)+colours.length)%colours.length;
if(explicit)return colours[i];
return`var(--lattice-chart-${i+1}, ${colours[i]})`;
}
function toRgb(value){
if(typeof value!=='string')return null;
const text=value.trim();
const hex=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
if(hex){
const digits=hex[1];
if(digits.length===3){
return[0,1,2].map((i)=>parseInt(digits[i]+digits[i],16));
}
return[0,2,4].map((i)=>parseInt(digits.slice(i,i+2),16));
}
const rgb=/^rgba?\(([^)]+)\)$/i.exec(text);
if(!rgb)return null;
const parts=rgb[1].split(/[\s,/]+/).filter(Boolean).slice(0,3).map(Number);
return parts.length===3&&parts.every((n)=>Number.isFinite(n))?parts:null;
}
function rampStops(scheme,diverging){
const source=diverging?scheme.diverging:scheme.sequential;
const fallback=diverging?SCHEMES.default.diverging:SCHEMES.default.sequential;
const stops=(Array.isArray(source)?source:fallback)
.map((colour,i)=>toRgb(colour)||toRgb(fallback[i])||[0,0,0]);
return stops.length>=2?stops:fallback.map((c)=>toRgb(c));
}
});
__def("packages/modules/charts/styles.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"NS",{enumerable:true,get:function(){return NS;}});
Object.defineProperty(__exports,"seriesColour",{enumerable:true,get:function(){return seriesColour;}});
Object.defineProperty(__exports,"css",{enumerable:true,get:function(){return css;}});
Object.defineProperty(__exports,"injectStyles",{enumerable:true,get:function(){return injectStyles;}});
const __m0=__req("packages/modules/charts/scheme.js");
const PALETTE=__m0["PALETTE"];
const NS='lat-chartview';
const STAMP='data-lattice-chartview';
function seriesColour(index){
const i=((index%PALETTE.length)+PALETTE.length)%PALETTE.length;
return`var(--lattice-chart-${i+1}, ${PALETTE[i]})`;
}
function css(){
return`
.${NS}{position:relative;display:flex;flex-direction:column;min-width:0;min-height:0;
  width:100%;height:100%;box-sizing:border-box;
  font-family:var(--lattice-font-family,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif);
  font-size:var(--lattice-font-size,13px);
  color:var(--lattice-foreground,#1c2126);
  background:var(--lattice-background,#fff);
  --lattice-chart-1:${PALETTE[0]};--lattice-chart-2:${PALETTE[1]};
  --lattice-chart-3:${PALETTE[2]};--lattice-chart-4:${PALETTE[3]};
  --lattice-chart-5:${PALETTE[4]};--lattice-chart-6:${PALETTE[5]};
  --lattice-chart-7:${PALETTE[6]};--lattice-chart-8:${PALETTE[7]};
  --lattice-chart-grid:var(--lattice-border-color,#dfe3e6);
  --lattice-chart-empty:var(--lattice-surface,#f7f8f9);
  --lattice-chart-axis:var(--lattice-foreground-muted,#5b6670);
  --lattice-chart-map-stroke:var(--lattice-border-color,#dfe3e6)}
.${NS}__figure{margin:0;display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
.${NS}__caption{padding:2px 4px 6px;display:flex;flex-direction:column;gap:2px}
.${NS}__title{font-weight:var(--lattice-header-font-weight,600);
  font-size:var(--lattice-font-size,13px)}
.${NS}__subtitle{color:var(--lattice-foreground-muted,#5b6670);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__footnote{color:var(--lattice-foreground-muted,#5b6670);
  font-size:var(--lattice-font-size-sm,11px);padding:2px 4px 4px}
/* A label outside its mark sits on the chart's background and takes the axis
   colour; one inside sits on the series colour and needs the contrast the
   background gives it. */
.${NS}__data-label{fill:var(--lattice-chart-axis);pointer-events:none}
.${NS}__data-label[data-inside="true"]{fill:var(--lattice-background,#fff)}
.${NS}__plot{flex:1 1 auto;min-height:0;display:block;width:100%;height:100%;overflow:visible}
/* The plot is hidden while the empty state is up; the author display:block
   above would otherwise keep an empty frame painted behind the message — the
   mirror of the placeholder's own trap (BACKLOG-0001023). */
.${NS}__plot[hidden]{display:none}
.${NS}__grid line{stroke:var(--lattice-chart-grid);stroke-width:1;shape-rendering:crispEdges}
.${NS}__axis line{stroke:var(--lattice-chart-axis);stroke-width:1;shape-rendering:crispEdges}
.${NS}__axis text{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__axis-title{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px);font-weight:600}
.${NS}__line{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.${NS}__area{stroke:none;opacity:0.18}
.${NS}__bar,.${NS}__slice{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__point{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__mark[data-dim]{opacity:0.18}
.${NS}__brush{fill:var(--lattice-range-background,#e7f1fd);fill-opacity:0.5;
  stroke:var(--lattice-range-border,#1a6bc7);stroke-width:1;pointer-events:none}
.${NS}__plot:focus{outline:none}
.${NS}__plot:focus-visible{outline:var(--lattice-focus-width,2px) solid var(--lattice-focus-color,#1a6bc7);
  outline-offset:-2px}
.${NS}__mark:focus{outline:none}
.${NS}__mark:focus-visible{outline:var(--lattice-focus-width,2px) solid var(--lattice-focus-color,#1a6bc7);
  outline-offset:1px}
.${NS}__box{stroke-width:1}
.${NS}__whisker{stroke-width:1;fill:none}
.${NS}__density{stroke-width:1.5;fill:none;opacity:.85}
.${NS}__fit{stroke-width:1.5;fill:none;opacity:.9}
.${NS}__fit-label{font-weight:600;opacity:.9}
.${NS}__trend{stroke-width:1.75;fill:none;opacity:.9}
.${NS}__trend-forecast{stroke-width:1.75;fill:none;opacity:.9;stroke-dasharray:5 4}
.${NS}__trend-label{font-weight:600;opacity:.9}
.${NS}__trend-band{stroke:none;pointer-events:none}
.${NS}__qq-line{stroke:var(--lattice-foreground-muted,#5b6570);stroke-width:1;stroke-dasharray:4 3;fill:none}
.${NS}__ecdf{stroke-width:1.5;fill:none}
.${NS}__control-line{stroke-width:1.25;fill:none}
.${NS}__error-bar{stroke:var(--lattice-foreground,#1a1a1a);stroke-width:1.5;fill:none;stroke-linecap:round}
.${NS}__control-centre{stroke:var(--lattice-foreground-muted,#5b6570);stroke-width:1;fill:none}
.${NS}__control-limit{stroke:var(--lattice-foreground-muted,#5b6570);stroke-width:1;stroke-dasharray:6 3;fill:none}
.${NS}__spec-limit{stroke:var(--lattice-danger,#a4262c);stroke-width:1;stroke-dasharray:2 3;fill:none}
.${NS}__spec-target{stroke:var(--lattice-success,#107c41);stroke-width:1;stroke-dasharray:1 4;fill:none}
.${NS}__control-name{fill:var(--lattice-foreground-muted,#5b6570);font-size:9px;letter-spacing:.04em}
.${NS}__control-rule{fill:var(--lattice-danger,#a4262c);font-size:9px;font-weight:600}
.${NS}__capability-within{stroke:var(--lattice-foreground,#1a1a1a);stroke-width:1.5;fill:none}
.${NS}__capability-overall{stroke:var(--lattice-foreground-muted,#5b6570);stroke-width:1.5;stroke-dasharray:4 3;fill:none}
.${NS}__lorenz{stroke-width:1.75;fill:none}
.${NS}__lorenz-equality{stroke:var(--lattice-foreground-muted,#5b6570);stroke-width:1;stroke-dasharray:4 3;fill:none}
.${NS}__median{fill:none}
.${NS}__tile{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__tile-label{fill:var(--lattice-background,#fff);
  font-size:var(--lattice-font-size-sm,11px);pointer-events:none}
.${NS}__tile-label--branch{fill:var(--lattice-foreground,#1d2733)}
.${NS}__reference{stroke:var(--lattice-chart-axis);stroke-width:1}
.${NS}__reference-label{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__annotation-line{stroke:var(--lattice-chart-axis);stroke-width:1;stroke-dasharray:4 3;fill:none}
.${NS}__annotation-target{stroke:var(--lattice-success,#107c41);stroke-width:1.5;stroke-dasharray:2 2;fill:none}
.${NS}__annotation-band{stroke:none}
.${NS}__annotation-point{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__annotation-event{stroke:var(--lattice-chart-axis);stroke-width:1;fill:none}
.${NS}__annotation-event-flag{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__annotation-label{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__annotation-list{list-style:none;margin:0;padding:0;
  position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.${NS}__ribbon{stroke:none;fill-opacity:0.62}
.${NS}__ribbon:hover{fill-opacity:0.85}
.${NS}__node{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__edge{stroke:var(--lattice-chart-grid);stroke-opacity:0.7}
/* A node's glyph, knocked out of its disc in the chart's own background colour
   so it takes the theme rather than a colour written into the drawing. Drawn as
   SVG paths from the grid's sprite registry, so it is sharp at any chart size
   and any device pixel ratio. */
.${NS}__node-icon{fill:var(--lattice-background,#fff);stroke:none;pointer-events:none}
.${NS}__node-icon--stroke{fill:none;stroke:var(--lattice-background,#fff);
  stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.${NS}__node-icon[data-dim]{opacity:0.18}
.${NS}__flow-label{fill:var(--lattice-chart-axis);pointer-events:none}
.${NS}__stream{stroke:none}
.${NS}__violin{stroke:none;fill-opacity:0.55}
.${NS}__task{stroke:var(--lattice-background,#fff);stroke-width:1;rx:2}
.${NS}__web{stroke:var(--lattice-chart-grid);fill:none}
.${NS}__radar-fill{opacity:0.18;stroke:none}
.${NS}__radar-line{stroke-width:2;fill:none}
.${NS}__gauge-track{fill:var(--lattice-chart-grid)}
.${NS}__gauge-target{stroke:var(--lattice-foreground,#1c2126);stroke-width:2}
.${NS}__gauge-reading{fill:var(--lattice-foreground,#1c2126);
  font-size:calc(var(--lattice-font-size,13px) * 1.8);font-weight:600}
.${NS}__gauge-caption{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__cell{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__funnel{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__funnel-label,.${NS}__funnel-value{fill:var(--lattice-foreground,#1c2126);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__wick{stroke-width:1}
.${NS}__candle{stroke-width:1}
.${NS}__axis-right{stroke-width:1}
.${NS}__panel-title{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__region{stroke:var(--lattice-chart-map-stroke,var(--lattice-chart-grid,#dfe3e6));
  stroke-width:0.5;vector-effect:non-scaling-stroke}
.${NS}__graticule{fill:none;stroke:var(--lattice-chart-grid,#dfe3e6);stroke-width:0.5;
  stroke-opacity:0.6;vector-effect:non-scaling-stroke;pointer-events:none}
.${NS}__geo-note{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__attribution{color:var(--lattice-foreground-muted,#5b6670);
  font-size:var(--lattice-font-size-sm,11px);padding:0 4px 4px}
.${NS}__attribution[hidden]{display:none}
.${NS}__slice-label{fill:var(--lattice-background,#fff);font-size:var(--lattice-font-size-sm,11px);
  pointer-events:none;text-anchor:middle}
.${NS}__legend{display:flex;flex-wrap:wrap;gap:2px 12px;padding:6px 4px 2px;
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__legend-item{display:inline-flex;align-items:center;gap:5px;border:0;padding:1px 3px;
  background:none;color:inherit;font:inherit;cursor:pointer;border-radius:3px}
.${NS}__legend-item:focus-visible{outline:var(--lattice-focus-width,2px) solid var(--lattice-focus-color,#1a6bc7);
  outline-offset:1px}
.${NS}__legend-item[aria-pressed="false"]{opacity:0.45}
.${NS}__swatch{width:10px;height:10px;border-radius:2px;flex:0 0 auto}
.${NS}__swatch--circle{border-radius:50%}
/* A line swatch for a series drawn as a line: the symbol should say which mark
   the reader is looking for, not merely which colour. */
.${NS}__swatch--line{height:3px;border-radius:2px}
.${NS}__legend[data-align="centre"],.${NS}__legend[data-align="center"]{justify-content:center}
.${NS}__legend[data-align="end"]{justify-content:flex-end}
/* Top and bottom are the default row; the sides become a column beside the
   plot, which is why the figure itself changes direction rather than the
   legend floating over the marks. */
.${NS}__figure:has(> .${NS}__legend[data-position="top"]){flex-direction:column}
.${NS}__legend[data-position="top"]{order:-1}
.${NS}__figure:has(> .${NS}__legend[data-position="left"]),
.${NS}__figure:has(> .${NS}__legend[data-position="right"]){flex-direction:row;align-items:stretch}
.${NS}__legend[data-position="left"],.${NS}__legend[data-position="right"]{
  flex-direction:column;flex:0 0 auto;align-content:flex-start;
  max-width:40%;overflow:auto;padding:4px 8px}
.${NS}__legend[data-position="left"]{order:-1}
.${NS}__legend-more{align-self:center;color:var(--lattice-foreground-muted,#5b6670)}
.${NS}__tooltip{position:fixed;z-index:5;pointer-events:none;max-width:260px;
  padding:5px 8px;border-radius:4px;font-size:var(--lattice-font-size-sm,11px);
  background:var(--lattice-surface,#f7f8f9);color:var(--lattice-foreground,#1c2126);
  border:1px solid var(--lattice-border-color,#dfe3e6);
  box-shadow:var(--lattice-popup-shadow,0 6px 16px -4px rgb(16 20 24/24%))}
.${NS}__tooltip[hidden]{display:none}
.${NS}__tooltip-row{display:flex;align-items:center;gap:5px;white-space:nowrap}
.${NS}__tooltip-value{font-weight:600;margin-inline-start:auto;padding-inline-start:10px}
.${NS}__empty{display:flex;align-items:center;justify-content:center;flex:1 1 auto;
  color:var(--lattice-foreground-muted,#5b6670)}
/* The author display:flex above outranks the browser's own [hidden] rule, so
   without this the placeholder stays painted under a drawn chart whenever the
   pane has a fixed height (BACKLOG-0001023). Same guard as the tooltip. */
.${NS}__empty[hidden]{display:none}
.${NS}__watermark{position:absolute;right:4px;bottom:4px;z-index:6;
  font-size:var(--lattice-font-size-sm,11px);pointer-events:auto;
  background:var(--lattice-overlay-background,rgb(255 255 255/72%));
  padding:1px 6px;border-radius:3px}
.${NS}__watermark-link{color:var(--lattice-foreground-muted,#5b6670);text-decoration:none}
.${NS}__watermark-link:hover{text-decoration:underline}
.${NS}__table{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}

.${NS}[data-theme="dark"],
.lattice[data-theme="dark"] .${NS}{
  --lattice-chart-1:#4ea6dd;--lattice-chart-2:#f0b429;--lattice-chart-3:#34c79a;
  --lattice-chart-4:#e39ec4;--lattice-chart-5:#7cc7f0;--lattice-chart-6:#f07c3f;
  --lattice-chart-7:#a48ad4;--lattice-chart-8:#93a3b1}

@media (prefers-color-scheme: dark){
  /* Guarded so an explicit light theme still wins on a dark desktop, which is
     the same rule the grid's own tokens follow. */
  .${NS}:not([data-theme="light"]){
    --lattice-chart-1:#4ea6dd;--lattice-chart-2:#f0b429;--lattice-chart-3:#34c79a;
    --lattice-chart-4:#e39ec4;--lattice-chart-5:#7cc7f0;--lattice-chart-6:#f07c3f;
    --lattice-chart-7:#a48ad4;--lattice-chart-8:#93a3b1}
}

@media (prefers-reduced-motion: no-preference){
  .${NS}__line,.${NS}__area{transition:d 160ms ease-out}
  .${NS}__bar{transition:x 160ms ease-out,y 160ms ease-out,width 160ms ease-out,height 160ms ease-out}
}

@media (forced-colors: active){
  /* Fills are flattened to the system palette, so colour stops carrying
     meaning entirely. What survives is position, the stroke that separates one
     mark from the next, and the label, which is why the legend carries text
     and the tooltip names its series rather than relying on a swatch. */
  .${NS}__bar,.${NS}__slice,.${NS}__point{fill:CanvasText;stroke:Canvas;stroke-width:1}
  .${NS}__line{stroke:CanvasText}
  .${NS}__area{fill:CanvasText;opacity:0.12}
  .${NS}__swatch{border:1px solid CanvasText}
  .${NS}__mark[data-dim]{opacity:1;fill:GrayText}
}
`;
}
function injectStyles(doc){
const root=doc.documentElement;
if(!root||root.getAttribute(STAMP))return;
root.setAttribute(STAMP,'1');
const style=doc.createElement('style');
style.textContent=css();
const head=doc.head||doc.body||root;
head.appendChild(style);
}
});
__def("packages/modules/charts/axis.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"normaliseAxes",{enumerable:true,get:function(){return normaliseAxes;}});
Object.defineProperty(__exports,"tickValues",{enumerable:true,get:function(){return tickValues;}});
Object.defineProperty(__exports,"tickLabeller",{enumerable:true,get:function(){return tickLabeller;}});
Object.defineProperty(__exports,"drawAxisTitle",{enumerable:true,get:function(){return drawAxisTitle;}});
Object.defineProperty(__exports,"labelEvery",{enumerable:true,get:function(){return labelEvery;}});
Object.defineProperty(__exports,"drawMeasureAxis",{enumerable:true,get:function(){return drawMeasureAxis;}});
Object.defineProperty(__exports,"drawCategoryAxis",{enumerable:true,get:function(){return drawCategoryAxis;}});
Object.defineProperty(__exports,"leftLabelRoom",{enumerable:true,get:function(){return leftLabelRoom;}});
Object.defineProperty(__exports,"setLabelText",{enumerable:true,get:function(){return setLabelText;}});
Object.defineProperty(__exports,"drawBandLabels",{enumerable:true,get:function(){return drawBandLabels;}});
Object.defineProperty(__exports,"drawContinuousAxis",{enumerable:true,get:function(){return drawContinuousAxis;}});
Object.defineProperty(__exports,"drawAxisLines",{enumerable:true,get:function(){return drawAxisLines;}});
Object.defineProperty(__exports,"createGroups",{enumerable:true,get:function(){return createGroups;}});
Object.defineProperty(__exports,"MARK_OVERHANG",{enumerable:true,get:function(){return MARK_OVERHANG;}});
Object.defineProperty(__exports,"overhangFor",{enumerable:true,get:function(){return overhangFor;}});
Object.defineProperty(__exports,"setPlotClip",{enumerable:true,get:function(){return setPlotClip;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/svg.js");
const attrs=__m1["attrs"];
const round=__m1["round"];
const setText=__m1["setText"];
const svg=__m1["svg"];
const __m2=__req("packages/modules/charts/typography.js");
const applySize=__m2["applySize"];
const CHAR_RATIO=__m2["CHAR_RATIO"];
const truncateTo=__m2["truncateTo"];
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
const GAP=6;
const LINE_HEIGHT=1.2;
function normaliseAxes(config){
if(config===false){
const off={labels:false,grid:false};
return{x:{...off},y:{...off},y2:{...off}};
}
const given=config&&typeof config==='object'?config:{};
const one=(side)=>{
if(typeof side==='string')return{title:side};
return side&&typeof side==='object'?{...side}:{};
};
return{x:one(given.x),y:one(given.y),y2:one(given.y2||given.right)};
}
function tickValues(scale,config){
const asked=config&&config.ticks;
if(Array.isArray(asked)){
const domain=scale.domain;
if(!domain||domain.min===undefined)return asked;
return asked.filter((v)=>Number(v)>=domain.min&&Number(v)<=domain.max);
}
const count=Number.isFinite(asked)&&asked>0?Number(asked):5;
return scale.ticks(count);
}
function tickLabeller(config,fallback,grid){
const format=config&&config.format;
if(typeof format==='function')return(value)=>String(format(value));
if(typeof format==='string'&&grid&&grid.formatting&&grid.formatting.format){
return(value)=>String(grid.formatting.format(value,format));
}
return fallback.tick;
}
function drawAxisTitle(opts){
if(!opts.text)return;
const band=opts.side==='left'||opts.side==='right'
?opts.plot.height
:opts.plot.width;
const shown=Number.isFinite(band)
?truncateTo(String(opts.text),Math.max(0,band),opts.size)
:String(opts.text);
if(!shown||shown==='…')return;
const node=svg(opts.group.ownerDocument,'text',{class:`${NS}__axis-title`});
applySize(node,opts.size);
if(opts.side==='left'){
const x=Math.max(opts.size,opts.plot.left-opts.plot.gutter.left+opts.size);
const y=opts.plot.top+opts.plot.height/2;
attrs(node,{
transform:`translate(${round(x)} ${round(y)}) rotate(-90)`,
'text-anchor':'middle',
});
}else if(opts.side==='right'){
const x=opts.plot.right+opts.plot.gutter.right-opts.size;
const y=opts.plot.top+opts.plot.height/2;
attrs(node,{
transform:`translate(${round(x)} ${round(y)}) rotate(90)`,
'text-anchor':'middle',
});
}else{
attrs(node,{
x:round(opts.plot.left+opts.plot.width/2),
y:round(opts.plot.bottom+opts.plot.gutter.bottom-2),
'text-anchor':'middle',
});
}
setText(node,shown);
if(shown!==String(opts.text))node.setAttribute('aria-label',String(opts.text));
opts.group.appendChild(node);
}
function labelEvery(opts){
const{values,scale,size,horizontal,label}=opts;
if(values.length<2)return 1;
let pitch=Infinity;
for(let i=1;i<values.length;i++){
const gap=Math.abs(scale.of(values[i])-scale.of(values[i-1]));
if(Number.isFinite(gap)&&gap<pitch)pitch=gap;
}
if(!Number.isFinite(pitch))return 1;
if(pitch<=0)return values.length;
let needed=size*LINE_HEIGHT+2;
if(horizontal){
let widest=0;
for(const value of values){
const width=String(label(value)||'').length*size*CHAR_RATIO;
if(width>widest)widest=width;
}
needed=widest+GAP;
}
return Math.max(1,Math.ceil(needed/pitch));
}
function drawMeasureAxis(opts){
const{gridGroup,axisGroup,plot,scale,format}=opts;
const config=opts.config||{};
const values=tickValues(scale,config);
const label=tickLabeller(config,format,opts.grid);
const size=opts.size||11;
const every=labelEvery({
values,scale,size,horizontal:!!opts.horizontal,label,
});
const lines=config.grid===false?null:gridGroup;
const grid=lines?new Pool(lines):null;
const labels=new Pool(axisGroup);
for(let i=0;i<values.length;i++){
const value=values[i];
const at=round(scale.of(value));
const zero=value===0;
const thinned=i%every!==0;
if(opts.horizontal){
if(grid)attrs(grid.next('line',`${NS}__gridline`),{
x1:at,x2:at,y1:round(plot.top),y2:round(plot.bottom),
'stroke-opacity':zero?1:0.6,
'stroke-width':zero?1.5:1,
});
if(config.labels===false||thinned)continue;
const text=labels.next('text',`${NS}__tick`);
applySize(text,size);
attrs(text,{
x:at,y:round(plot.bottom+GAP),'text-anchor':'middle',
'dominant-baseline':'hanging',
});
setText(text,label(value));
}else{
if(grid)attrs(grid.next('line',`${NS}__gridline`),{
x1:round(plot.left),x2:round(plot.right),y1:at,y2:at,
'stroke-opacity':zero?1:0.6,
'stroke-width':zero?1.5:1,
});
if(config.labels===false||thinned)continue;
const text=labels.next('text',`${NS}__tick`);
applySize(text,size);
attrs(text,{
x:round(plot.left-GAP),y:at,'text-anchor':'end',
'dominant-baseline':'middle',
});
setText(text,label(value));
}
}
if(grid)grid.finish();
else new Pool(gridGroup).finish();
labels.finish();
return values;
}
function drawCategoryAxis(opts){
const{group,plot,scale,labels,fontSize}=opts;
const config=opts.config||{};
if(config.labels===false){
new Pool(group).finish();
return;
}
const pool=new Pool(group);
const categories=scale.domain;
const slot=scale.step;
const rotated=config.rotate===undefined||config.rotate==='auto'
?opts.rotated
:!!config.rotate;
const fitted=rotated&&slot>0
?Math.max(1,Math.ceil((fontSize*Math.SQRT2)/slot))
:1;
const every=Number.isFinite(config.every)&&config.every>0
?Number(config.every)
:fitted;
const room=slot*every;
for(let i=0;i<categories.length;i++){
const centre=round(scale.centre(categories[i]));
if(Number.isNaN(centre))continue;
if(i%every!==0)continue;
const text=pool.next('text',`${NS}__tick`);
applySize(text,fontSize);
const label=labels[i]===undefined?'':labels[i];
if(rotated){
attrs(text,{
x:0,y:0,'text-anchor':'end','dominant-baseline':'middle',
transform:`translate(${centre} ${round(plot.bottom+GAP)}) rotate(-45)`,
});
setLabelText(text,label,Math.max(0,plot.gutter.bottom-GAP)*Math.SQRT2,fontSize);
}else{
attrs(text,{
x:centre,y:round(plot.bottom+GAP),'text-anchor':'middle',
'dominant-baseline':'hanging',transform:null,
});
setLabelText(text,label,room,fontSize);
}
}
pool.finish();
}
function leftLabelRoom(plot){
return Math.max(0,(plot.gutter?plot.gutter.left:plot.left)-GAP);
}
function setLabelText(node,label,room,fontSize){
const full=String(label===null||label===undefined?'':label);
const shown=truncateTo(full,room,fontSize);
setText(node,shown);
if(shown!==full)node.setAttribute('aria-label',full);
else node.removeAttribute('aria-label');
return shown;
}
function drawBandLabels(opts){
const{group,plot,scale,labels}=opts;
const config=opts.config||{};
const pool=new Pool(group);
const categories=scale.domain;
const fontSize=opts.fontSize;
const room=leftLabelRoom(plot);
const fitted=scale.step>0
?Math.max(1,Math.ceil((fontSize*LINE_HEIGHT)/scale.step))
:1;
const every=Number.isFinite(config.every)&&config.every>0
?Number(config.every)
:fitted;
for(let i=0;i<categories.length;i++){
if(i%every!==0)continue;
const centre=round(scale.centre(categories[i]));
if(Number.isNaN(centre))continue;
const text=pool.next('text',`${NS}__tick`);
attrs(text,{
x:round(plot.left-GAP),y:centre,'text-anchor':'end',
'dominant-baseline':'middle',
});
applySize(text,fontSize);
setLabelText(text,labels[i],room,fontSize);
}
pool.finish();
}
function drawContinuousAxis(opts){
const{group,plot,scale,format}=opts;
const config=opts.config||{};
if(config.labels===false){
new Pool(group).finish();
return;
}
const label=tickLabeller(config,format,opts.grid);
const pool=new Pool(group);
for(const value of tickValues(scale,config)){
const at=round(scale.of(value));
if(at<plot.left-1||at>plot.right+1)continue;
const text=pool.next('text',`${NS}__tick`);
applySize(text,opts.size||11);
attrs(text,{
x:at,y:round(plot.bottom+GAP),'text-anchor':'middle',
'dominant-baseline':'hanging',
});
setText(text,label(value));
}
pool.finish();
}
function drawAxisLines(opts){
const{group,plot}=opts;
const pool=new Pool(group);
attrs(pool.next('line'),{
x1:round(plot.left),x2:round(plot.left),
y1:round(plot.top),y2:round(plot.bottom),
});
attrs(pool.next('line'),{
x1:round(plot.left),x2:round(plot.right),
y1:round(plot.bottom),y2:round(plot.bottom),
});
pool.finish();
}
let clipSeq=0;
function createGroups(doc,parent){
const clipId=`${NS}-plot-clip-${++clipSeq}`;
const clipRect=svg(doc,'rect');
const clipPath=svg(doc,'clipPath',{id:clipId});
clipPath.appendChild(clipRect);
const boxClipId=`${NS}-box-clip-${clipSeq}`;
const boxClip=svg(doc,'clipPath',{id:boxClipId});
boxClip.appendChild(svg(doc,'rect',{
x:0,y:0,width:'100%',height:'100%',
}));
const defs=svg(doc,'defs');
defs.appendChild(clipPath);
defs.appendChild(boxClip);
const groups={
grid:svg(doc,'g',{class:`${NS}__grid`}),
marks:svg(doc,'g',{class:`${NS}__marks`}),
rules:svg(doc,'g',{class:`${NS}__axis`}),
axis:svg(doc,'g',{class:`${NS}__axis`}),
labels:svg(doc,'g',{class:`${NS}__labels`}),
overlay:svg(doc,'g',{class:`${NS}__overlay`}),
clip:clipRect,
clipId,
boxClipId,
};
parent.appendChild(defs);
for(const name of['grid','marks','rules','axis','labels','overlay']){
parent.appendChild(groups[name]);
}
return groups;
}
const MARK_OVERHANG=30;
function overhangFor(type){
if(type==='bubble')return MARK_OVERHANG;
if(type==='scatter')return 6;
return 3;
}
function setPlotClip(groups,plot,overhang){
if(!groups||!groups.marks||!groups.clip)return;
if(!plot||!Number.isFinite(plot.width)||!Number.isFinite(plot.height)){
groups.marks.removeAttribute('clip-path');
return;
}
const pad=Number.isFinite(overhang)&&overhang>=0?Number(overhang):MARK_OVERHANG;
attrs(groups.clip,{
x:round(plot.left-pad),
y:round(plot.top-pad),
width:round(Math.max(0,plot.width)+pad*2),
height:round(Math.max(0,plot.height)+pad*2),
});
groups.marks.setAttribute('clip-path',`url(#${groups.clipId})`);
}
});
__def("packages/modules/charts/scale.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"isNumber",{enumerable:true,get:function(){return isNumber;}});
Object.defineProperty(__exports,"toNumber",{enumerable:true,get:function(){return toNumber;}});
Object.defineProperty(__exports,"toTime",{enumerable:true,get:function(){return toTime;}});
Object.defineProperty(__exports,"extent",{enumerable:true,get:function(){return extent;}});
Object.defineProperty(__exports,"niceStep",{enumerable:true,get:function(){return niceStep;}});
Object.defineProperty(__exports,"niceDomain",{enumerable:true,get:function(){return niceDomain;}});
Object.defineProperty(__exports,"measureDomain",{enumerable:true,get:function(){return measureDomain;}});
Object.defineProperty(__exports,"linearTicks",{enumerable:true,get:function(){return linearTicks;}});
Object.defineProperty(__exports,"timeStepFor",{enumerable:true,get:function(){return timeStepFor;}});
Object.defineProperty(__exports,"timeTicks",{enumerable:true,get:function(){return timeTicks;}});
Object.defineProperty(__exports,"linearScale",{enumerable:true,get:function(){return linearScale;}});
Object.defineProperty(__exports,"timeScale",{enumerable:true,get:function(){return timeScale;}});
Object.defineProperty(__exports,"key",{enumerable:true,get:function(){return key;}});
Object.defineProperty(__exports,"bandScale",{enumerable:true,get:function(){return bandScale;}});
Object.defineProperty(__exports,"sqrtScale",{enumerable:true,get:function(){return sqrtScale;}});
const STEPS=[1,2,2.5,5,10];
const MINUTE=60000;
const HOUR=3600000;
const DAY=86400000;
const TIME_STEPS=[
1,5,10,25,50,100,250,500,
1000,5000,15000,30000,
MINUTE,5*MINUTE,15*MINUTE,30*MINUTE,
HOUR,3*HOUR,6*HOUR,12*HOUR,
DAY,2*DAY,7*DAY,14*DAY,
30*DAY,90*DAY,180*DAY,
365*DAY,2*365*DAY,5*365*DAY,10*365*DAY,100*365*DAY,
];
function isNumber(v){
return typeof v==='number'&&Number.isFinite(v);
}
function toNumber(v){
if(v===null||v===undefined||v==='')return null;
if(v instanceof Date){
const t=v.getTime();
return Number.isFinite(t)?t:null;
}
if(typeof v==='boolean')return v?1:0;
const n=Number(v);
return Number.isFinite(n)?n:null;
}
function toTime(v){
if(v===null||v===undefined||v==='')return null;
if(v instanceof Date){
const t=v.getTime();
return Number.isFinite(t)?t:null;
}
if(typeof v==='number')return Number.isFinite(v)?v:null;
const parsed=Date.parse(String(v));
return Number.isFinite(parsed)?parsed:null;
}
function extent(values){
let min=Infinity;
let max=-Infinity;
for(let i=0;i<values.length;i++){
const v=values[i];
if(!isNumber(v))continue;
if((v)<min)min=(v);
if((v)>max)max=(v);
}
return min===Infinity?null:{min,max};
}
function niceStep(step){
if(!(step>0))return 1;
const power=10**Math.floor(Math.log10(step));
for(const s of STEPS){
if(step<=s*power)return s*power;
}
return 10*power;
}
function niceDomain(domain,count=5){
const step=niceStep((domain.max-domain.min)/Math.max(1,count));
return{
min:Math.floor(domain.min/step)*step,
max:Math.ceil(domain.max/step)*step,
step,
};
}
function measureDomain(values,opts={}){
const found=extent(values)||{min:0,max:1};
let{min,max}=found;
if(opts.zero){
if(min>0)min=0;
if(max<0)max=0;
}
if(min===max){
const pad=Math.abs(min)>0?Math.abs(min)/10:1;
min-=pad;
max+=pad;
}
if(opts.nice!==false){
const nice=niceDomain({min,max},opts.ticks||5);
min=nice.min;
max=nice.max;
}
if(isNumber(opts.min))min=(opts.min);
if(isNumber(opts.max))max=(opts.max);
if(min===max)max=min+1;
return{min,max};
}
function linearTicks(domain,count=5){
const step=niceStep((domain.max-domain.min)/Math.max(1,count));
const first=Math.ceil(domain.min/step);
const last=Math.floor(domain.max/step);
const out=[];
for(let i=first;i<=last;i++){
const v=i*step;
out.push(Math.abs(v)<step/1e6?0:Number(v.toPrecision(12)));
}
return out;
}
function timeStepFor(span,count=5){
const target=span/Math.max(1,count);
for(const candidate of TIME_STEPS)if(candidate>=target)return candidate;
return TIME_STEPS[TIME_STEPS.length-1];
}
function timeTicks(domain,count=5){
const step=timeStepFor(domain.max-domain.min,count);
const out=[];
const first=Math.ceil(domain.min/step)*step;
for(let t=first;t<=domain.max;t+=step)out.push(t);
return out;
}
function linearScale(domain,range){
const span=domain.max-domain.min||1;
const[from,to]=range;
return{
kind:'linear',
domain,
range,
of(v){
return from+((v-domain.min)/span)*(to-from);
},
invert(px){
return domain.min+((px-from)/((to-from)||1))*span;
},
ticks(count=5){
return linearTicks(domain,count);
},
};
}
function timeScale(domain,range){
const base=linearScale(domain,range);
return{
...base,
kind:'time',
ticks(count=5){
return timeTicks(domain,count);
},
};
}
function key(v){
if(v===null||v===undefined)return' null';
if(v instanceof Date)return` date:${v.getTime()}`;
if(typeof v==='object'){
const record=(v);
const id=record.id??record.key??record.value;
if(id!==undefined&&typeof id!=='object')return` obj:${String(id)}`;
return` obj:${String(v)}`;
}
return String(v);
}
function bandScale(values,range,padding=0.2){
const pad=Math.min(0.9,Math.max(0,padding));
const[from,to]=range;
const index=new Map();
for(let i=0;i<values.length;i++){
const k=key(values[i]);
if(!index.has(k))index.set(k,i);
}
const step=values.length?(to-from)/values.length:(to-from);
const bandwidth=Math.max(0,step*(1-pad));
return{
kind:'band',
domain:values,
range,
bandwidth,
step,
of(v){
const i=index.get(key(v));
if(i===undefined)return NaN;
return from+i*step+(step-bandwidth)/2;
},
centre(v){
const start=this.of(v);
return Number.isNaN(start)?NaN:start+bandwidth/2;
},
ticks(){
return values;
},
};
}
function sqrtScale(domain,range){
const[from,to]=range;
const max=Math.max(Math.abs(domain.max),Math.abs(domain.min),0)||1;
return{
kind:'sqrt',
domain,
range,
of(v){
const t=Math.sqrt(Math.abs(v)/max);
return from+t*(to-from);
},
};
}
});
__def("packages/modules/charts/format.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"precisionFor",{enumerable:true,get:function(){return precisionFor;}});
Object.defineProperty(__exports,"axisNumber",{enumerable:true,get:function(){return axisNumber;}});
Object.defineProperty(__exports,"dateFormatFor",{enumerable:true,get:function(){return dateFormatFor;}});
Object.defineProperty(__exports,"formatters",{enumerable:true,get:function(){return formatters;}});
Object.defineProperty(__exports,"measureText",{enumerable:true,get:function(){return measureText;}});
const __m0=__req("packages/modules/charts/scale.js");
const timeStepFor=__m0["timeStepFor"];
function precisionFor(step){
if(!Number.isFinite(step)||step<=0)return 0;
const places=Math.ceil(-Math.log10(step));
return Math.min(6,Math.max(0,places));
}
function axisNumber(value,messages,places=0){
if(!Number.isFinite(value))return'';
if(Math.abs(value)>=10000){
return messages.number(value,{notation:'compact',maximumFractionDigits:1});
}
return messages.number(value,{
minimumFractionDigits:places,
maximumFractionDigits:places,
});
}
function dateFormatFor(span){
const DAY=86400000;
if(span>0){
const step=timeStepFor(span);
if(step<1000){
return{minute:'2-digit',second:'2-digit',fractionalSecondDigits:3};
}
if(step<60000)return{hour:'2-digit',minute:'2-digit',second:'2-digit'};
}
if(span<=2*3600000)return{hour:'2-digit',minute:'2-digit'};
if(span<=3*DAY)return{weekday:'short',hour:'2-digit'};
if(span<=180*DAY)return{day:'numeric',month:'short'};
if(span<=3*365*DAY)return{month:'short',year:'numeric'};
return{year:'numeric'};
}
function formatters(grid,axis){
const messages=grid.messages;
const locale=messages.locale;
const timeZone=grid.get('timeZone')||undefined;
if(axis.kind==='time'){
const options=dateFormatFor(axis.span||0);
const short=new Intl.DateTimeFormat(locale,timeZone?{...options,timeZone}:options);
const full=new Intl.DateTimeFormat(
locale,
timeZone
?{dateStyle:'medium',timeStyle:'short',timeZone}
:{dateStyle:'medium',timeStyle:'short'},
);
return{
tick:(v)=>(Number.isFinite(Number(v))?short.format(new Date(Number(v))):''),
value:(v)=>(Number.isFinite(Number(v))?full.format(new Date(Number(v))):''),
};
}
const places=precisionFor(axis.step||0);
return{
tick:(v)=>(typeof v==='number'?axisNumber(v,messages,places):String(v??'')),
value:(v)=>(typeof v==='number'?messages.number(v):String(v??'')),
};
}
function measureText(value,messages){
if(value===null||value===undefined||!Number.isFinite(value))return'';
const rounded=Math.abs(value)>=1e-6?Number(value.toPrecision(6)):value;
return messages.number(rounded);
}
});
__def("packages/modules/charts/labels.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"resolveLabels",{enumerable:true,get:function(){return resolveLabels;}});
Object.defineProperty(__exports,"collides",{enumerable:true,get:function(){return collides;}});
Object.defineProperty(__exports,"placeLabels",{enumerable:true,get:function(){return placeLabels;}});
Object.defineProperty(__exports,"labelText",{enumerable:true,get:function(){return labelText;}});
Object.defineProperty(__exports,"drawAnchoredLabels",{enumerable:true,get:function(){return drawAnchoredLabels;}});
Object.defineProperty(__exports,"drawDataLabels",{enumerable:true,get:function(){return drawDataLabels;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/format.js");
const measureText=__m1["measureText"];
const __m2=__req("packages/modules/charts/svg.js");
const attrs=__m2["attrs"];
const round=__m2["round"];
const setText=__m2["setText"];
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
const __m4=__req("packages/modules/charts/typography.js");
const applySize=__m4["applySize"];
const textWidth=__m4["textWidth"];
const GAP=4;
function resolveLabels(spec){
const given=spec&&spec.labels;
if(!given){
return{
show:false,names:given!==false,position:'outside',format:null,minGap:2,total:false,
};
}
const config=typeof given==='object'?given:{};
return{
show:true,
names:true,
position:['outside','inside','auto'].includes(config.position)?config.position:'outside',
format:config.format||null,
minGap:Number.isFinite(config.minGap)?Number(config.minGap):2,
total:!!config.total,
};
}
function collides(box,placed,gap){
for(const other of placed){
if(box.x-gap<other.x+other.width
&&box.x+box.width+gap>other.x
&&box.y-gap<other.y+other.height
&&box.y+box.height+gap>other.y)return true;
}
return false;
}
function placeLabels(opts){
const{points,plot,size}=opts;
const gap=opts.minGap===undefined?2:opts.minGap;
const placed=[];
const out=[];
for(const point of points){
if(point.px===undefined||point.py===undefined)continue;
const text=opts.text(point);
if(!text)continue;
const width=textWidth(text,size);
const height=size;
let x=point.px;
let y=point.py-GAP;
let anchor='middle';
let inside=false;
if(opts.horizontal){
x=point.px+GAP;
y=point.py;
anchor='start';
if(opts.position!=='outside'&&point.pbase!==undefined
&&Math.abs(point.px-point.pbase)>width+GAP*2){
x=point.px-GAP;
anchor='end';
inside=true;
}
}else if(opts.position!=='outside'&&point.pbase!==undefined
&&Math.abs(point.pbase-point.py)>height+GAP*2){
y=point.py+height+GAP;
inside=true;
}
const boxAt=()=>({
x:anchor==='middle'?x-width/2:(anchor==='end'?x-width:x),
y:y-height,
width,
height,
});
let box=boxAt();
const roomAbove=box.y>=plot.top-1;
if(!roomAbove&&!inside&&!opts.horizontal&&point.pbase!==undefined
&&Math.abs(point.pbase-point.py)>height+GAP*2){
y=point.py+height+GAP;
inside=true;
box=boxAt();
}
if(box.x<plot.left-1||box.x+box.width>plot.right+1)continue;
if(box.y<plot.top-1||box.y+box.height>plot.bottom+height)continue;
if(collides(box,placed,gap))continue;
placed.push(box);
out.push({x:round(x),y:round(y),text,anchor,inside});
}
return out;
}
function labelText(value,options,grid){
if(value===null||value===undefined)return'';
if(typeof options.format==='function')return String(options.format(value));
if(typeof options.format==='string'&&grid&&grid.formatting&&grid.formatting.format){
return String(grid.formatting.format(value,options.format));
}
return measureText(value,grid&&grid.messages);
}
function drawAnchoredLabels(ctx){
const pool=new Pool(ctx.group);
const gap=ctx.minGap===undefined?2:ctx.minGap;
const height=ctx.size;
const placed=[];
let drawn=0;
for(const anchor of ctx.anchors){
if(!anchor||!anchor.text)continue;
const width=anchor.width===undefined
?textWidth(anchor.text,ctx.size)
:anchor.width;
const align=anchor.anchor||'middle';
const left=align==='end'?anchor.x-width
:align==='start'?anchor.x
:anchor.x-width/2;
const box={x:left,y:anchor.y-height/2,width,height};
if(ctx.plot){
if(box.x<ctx.plot.left-1||box.x+box.width>ctx.plot.right+1)continue;
if(box.y<ctx.plot.top-1||box.y+box.height>ctx.plot.bottom+1)continue;
}
if(anchor.width!==undefined&&width>anchor.width)continue;
if(anchor.height!==undefined&&height>anchor.height)continue;
if(collides(box,placed,gap))continue;
placed.push(box);
const node=pool.next('text',anchor.className||`${NS}__data-label`);
applySize(node,ctx.size);
attrs(node,{
x:round(anchor.x),
y:round(anchor.y),
'text-anchor':align,
'dominant-baseline':anchor.baseline||'middle',
'data-inside':anchor.inside?'true':null,
});
setText(node,anchor.text);
drawn++;
}
pool.finish();
return drawn;
}
function drawDataLabels(ctx){
const pool=new Pool(ctx.group);
const{options}=ctx;
let drawn=0;
const text=(point)=>{
if(typeof options.format==='function'&&point.y!==null&&point.y!==undefined){
return String(options.format(point.y,point));
}
return labelText(point.y,options,ctx.grid);
};
for(const series of ctx.series){
const labels=placeLabels({
points:series.points,
plot:ctx.plot,
size:ctx.size,
position:options.position,
horizontal:ctx.horizontal,
minGap:options.minGap,
text,
});
for(const label of labels){
const node=pool.next('text',`${NS}__data-label`);
applySize(node,ctx.size);
attrs(node,{
x:label.x,
y:label.y,
'text-anchor':label.anchor,
'data-inside':label.inside?'true':null,
});
setText(node,label.text);
drawn++;
}
}
pool.finish();
return drawn;
}
});
__def("packages/modules/charts/dense.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"CANVAS_THRESHOLD",{enumerable:true,get:function(){return CANVAS_THRESHOLD;}});
Object.defineProperty(__exports,"downsample",{enumerable:true,get:function(){return downsample;}});
Object.defineProperty(__exports,"markCount",{enumerable:true,get:function(){return markCount;}});
Object.defineProperty(__exports,"wantsCanvas",{enumerable:true,get:function(){return wantsCanvas;}});
Object.defineProperty(__exports,"paintDense",{enumerable:true,get:function(){return paintDense;}});
Object.defineProperty(__exports,"sizeCanvas",{enumerable:true,get:function(){return sizeCanvas;}});
const CANVAS_THRESHOLD=3000;
function downsample(points,target){
const n=points.length;
if(!Number.isFinite(target)||target>=n||target<3||n<3)return points;
const kept=[points[0]];
const every=(n-2)/(target-2);
let previous=0;
for(let i=0;i<target-2;i++){
const from=Math.floor(i*every)+1;
const to=Math.min(Math.floor((i+1)*every)+1,n-1);
const nextFrom=to;
const nextTo=Math.min(Math.floor((i+2)*every)+1,n);
let avgX=0;
let avgY=0;
let count=0;
for(let j=nextFrom;j<nextTo;j++){
const p=points[j];
if(!p||!Number.isFinite(p.y))continue;
avgX+=p.x;
avgY+=p.y;
count++;
}
if(count){avgX/=count;avgY/=count;}
const anchor=points[previous];
if(from>=to)continue;
let best=from;
let bestArea=-1;
for(let j=from;j<to;j++){
const p=points[j];
if(!p||!Number.isFinite(p.y))continue;
const area=Math.abs(
(anchor.x-avgX)*(p.y-anchor.y)-(anchor.x-p.x)*(avgY-anchor.y),
);
if(area>bestArea){
bestArea=area;
best=j;
}
}
if(best<=previous)continue;
kept.push(points[best]);
previous=best;
}
kept.push(points[n-1]);
return kept;
}
function markCount(series){
let total=0;
for(const one of series)total+=one.points.length;
return total;
}
function wantsCanvas(opts){
if(opts.canvas===true)return true;
if(opts.canvas===false)return false;
const threshold=Number.isFinite(opts.canvas)?Number(opts.canvas):CANVAS_THRESHOLD;
return markCount(opts.series)>threshold;
}
function paintDense(opts){
const{context,series,ratio}=opts;
context.save();
context.scale(ratio,ratio);
for(const one of series){
const colour=opts.colour(one.index);
if(opts.type==='scatter'||opts.type==='bubble'){
context.fillStyle=colour;
for(const point of one.points){
if(point.px===undefined)continue;
context.beginPath();
context.arc(point.px,point.py,point.pr||2,0,Math.PI*2);
context.fill();
}
continue;
}
context.strokeStyle=colour;
context.lineWidth=2;
context.lineJoin='round';
context.beginPath();
let open=false;
for(const point of one.points){
if(point.px===undefined||point.py===undefined){
open=false;
continue;
}
if(open)context.lineTo(point.px,point.py);
else context.moveTo(point.px,point.py);
open=true;
}
context.stroke();
}
context.restore();
}
function sizeCanvas(opts){
const{canvas}=opts;
canvas.width=Math.max(1,Math.round(opts.width*opts.ratio));
canvas.height=Math.max(1,Math.round(opts.height*opts.ratio));
if(canvas.style){
canvas.style.width=`${opts.width}px`;
canvas.style.height=`${opts.height}px`;
}
return typeof canvas.getContext==='function'?canvas.getContext('2d'):null;
}
});
__def("packages/modules/charts/annotations.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"overlayLayer",{enumerable:true,get:function(){return overlayLayer;}});
Object.defineProperty(__exports,"annotationValue",{enumerable:true,get:function(){return annotationValue;}});
Object.defineProperty(__exports,"annotationAxis",{enumerable:true,get:function(){return annotationAxis;}});
Object.defineProperty(__exports,"annotationText",{enumerable:true,get:function(){return annotationText;}});
Object.defineProperty(__exports,"drawAnnotations",{enumerable:true,get:function(){return drawAnnotations;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/scale.js");
const isNumber=__m1["isNumber"];
const toNumber=__m1["toNumber"];
const __m2=__req("packages/modules/charts/svg.js");
const attrs=__m2["attrs"];
const path=__m2["path"];
const round=__m2["round"];
const setText=__m2["setText"];
const SVG_NS=__m2["SVG_NS"];
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
function overlayLayer(group,className){
for(const child of group.childNodes||[]){
if(child&&String(child.getAttribute&&child.getAttribute('class'))===className){
return(child);
}
}
const host=group.ownerDocument.createElementNS(SVG_NS,'g');
host.setAttribute('class',className);
group.appendChild(host);
return host;
}
const KINDS=new Set(['line','target','band','callout','event']);
function xPixel(xScale,raw,edge){
if(xScale.kind==='band'){
const left=xScale.of(raw);
if(!Number.isFinite(left))return NaN;
const width=Number(xScale.bandwidth)||0;
return edge==='right'?left+width:left;
}
return xScale.of(toNumber(raw));
}
function xText(raw,fmt){
if(raw instanceof Date){
const t=raw.getTime();
return Number.isFinite(t)?raw.toISOString().slice(0,10):String(raw);
}
if(typeof raw==='number')return Number.isFinite(raw)?fmt(raw):String(raw);
const n=toNumber(raw);
return n===null||typeof raw==='string'?String(raw):fmt(n);
}
function poolFor(series,anno,axis){
const out=[];
for(const s of series){
const side=s.axis==='right'?'right':'left';
if(side!==axis)continue;
if(anno.series!==undefined&&s.key!==anno.series)continue;
for(const p of s.points)if(isNumber(p.y))out.push(Number(p.y));
}
return out;
}
function percentile(values,p){
if(!values.length)return null;
const sorted=[...values].sort((a,b)=>a-b);
if(sorted.length===1)return sorted[0];
const rank=(Math.min(100,Math.max(0,p))/100)*(sorted.length-1);
const low=Math.floor(rank);
const high=Math.ceil(rank);
if(low===high)return sorted[low];
return sorted[low]+(sorted[high]-sorted[low])*(rank-low);
}
function annotationValue(anno,series,axis){
if(!anno.compute){
return toNumber(anno.value);
}
const values=poolFor(series,anno,axis);
if(!values.length)return null;
const compute=String(anno.compute).toLowerCase();
if(compute==='mean'||compute==='avg'){
return values.reduce((t,v)=>t+v,0)/values.length;
}
if(compute==='median'||compute==='p50')return percentile(values,50);
if(compute==='min')return Math.min(...values);
if(compute==='max')return Math.max(...values);
const match=/^p(\d+(?:\.\d+)?)$/.exec(compute);
if(match)return percentile(values,Number(match[1]));
return null;
}
function annotationAxis(anno){
return anno.axis==='right'||anno.axis==='y2'?'right':'left';
}
function annotationText(anno,resolved,fmt,dual){
const label=anno.label?`${anno.label}: `:'';
const axis=dual?` (${annotationAxis(anno)==='right'?'right axis':'left axis'})`:'';
const kind=anno.kind||'line';
if(kind==='band'){
if(!Array.isArray(resolved)||resolved[0]===null||resolved[1]===null)return'';
const[lo,hi]=resolved;
return`${label||'Band: '}${fmt(Math.min(lo,hi))} to ${fmt(Math.max(lo,hi))}${axis}`;
}
if(resolved===null||resolved===undefined)return'';
const noun=kind==='target'?'Target':(kind==='callout'?'Callout':'Reference');
return`${label||`${noun}: `}${fmt((resolved))}${axis}`;
}
function bandFirst(x){
return(x.kind||'line')==='band'?0:1;
}
function drawAnnotations(opts){
const{
group,plot,xScale,yScale,rightScale,series,format,
}=opts;
const pool=new Pool(overlayLayer(group,`${NS}__annotations`));
const described=[];
const list=Array.isArray(opts.annotations)?opts.annotations:[];
const ordered=[...list].sort((a,b)=>bandFirst(a)-bandFirst(b));
for(const anno of ordered){
const kind=anno.kind||'line';
if(!KINDS.has(kind))continue;
const axis=annotationAxis(anno);
const scale=axis==='right'&&rightScale?rightScale:yScale;
if(kind==='band'){
if(anno.orient==='vertical'){
const x1=xPixel(xScale,anno.from,'left');
const x2=xPixel(xScale,anno.to,'right');
if(Number.isNaN(x1)||Number.isNaN(x2))continue;
const left=round(Math.min(x1,x2));
const right=round(Math.max(x1,x2));
attrs(pool.next('rect',`${NS}__annotation-band ${anno.className||''}`.trim()),{
x:left,
y:round(plot.top),
width:Math.max(0,right-left),
height:round(Math.max(0,plot.bottom-plot.top)),
fill:anno.colour||'currentColor',
'fill-opacity':anno.opacity===undefined?0.12:anno.opacity,
});
if(anno.label){
const text=pool.next('text',`${NS}__annotation-label`);
attrs(text,{x:left+4,y:round(plot.top+12),'text-anchor':'start'});
setText(text,anno.label);
}
const noun=anno.label?`${anno.label}: `:'Event window: ';
described.push({text:`${noun}${xText(anno.from,format)} to ${xText(anno.to,format)}`});
continue;
}
const from=annotationValue({...anno,value:anno.from,compute:anno.fromCompute},series,axis);
const to=annotationValue({...anno,value:anno.to,compute:anno.toCompute},series,axis);
if(from===null||to===null)continue;
const y1=round(scale.of(from));
const y2=round(scale.of(to));
attrs(pool.next('rect',`${NS}__annotation-band ${anno.className||''}`.trim()),{
x:round(plot.left),
y:Math.min(y1,y2),
width:round(Math.max(0,plot.right-plot.left)),
height:Math.max(0,Math.abs(y2-y1)),
fill:anno.colour||'currentColor',
'fill-opacity':anno.opacity===undefined?0.12:anno.opacity,
});
if(anno.label){
const text=pool.next('text',`${NS}__annotation-label`);
attrs(text,{x:round(plot.left+4),y:Math.min(y1,y2)+12,'text-anchor':'start'});
setText(text,anno.label);
}
described.push({text:annotationText(anno,[from,to],format,opts.dual)});
continue;
}
if(kind==='event'){
const raw=anno.x!==undefined?anno.x:anno.at;
const at=round(xPixel(xScale,raw,'left')+(xScale.kind==='band'?(Number(xScale.bandwidth)||0)/2:0));
if(Number.isNaN(at))continue;
attrs(pool.next('path',`${NS}__annotation-event`),{
d:path(['M',at,round(plot.top),'L',at,round(plot.bottom)]),
stroke:anno.colour||'currentColor',
fill:'none',
});
attrs(pool.next('circle',`${NS}__annotation-event-flag`),{
cx:at,cy:round(plot.top),r:3,fill:anno.colour||'currentColor',
});
if(anno.label){
const text=pool.next('text',`${NS}__annotation-label`);
attrs(text,{x:at+5,y:round(plot.top+10),'text-anchor':'start'});
setText(text,anno.label);
}
const noun=anno.label?`${anno.label} — `:'Event — ';
described.push({text:`${noun}at ${xText(raw,format)}`});
continue;
}
if(kind==='callout'){
const value=annotationValue(anno,series,axis);
if(value===null)continue;
const cx=anno.at!==undefined
?round(xScale.kind==='band'?xScale.centre(anno.at):xScale.of(toNumber(anno.at)))
:round(plot.right-4);
const cy=round(scale.of(value));
if(Number.isNaN(cx))continue;
attrs(pool.next('circle',`${NS}__annotation-point`),{
cx,cy,r:3.5,fill:anno.colour||'currentColor',
});
if(anno.label){
const text=pool.next('text',`${NS}__annotation-label`);
attrs(text,{x:cx+6,y:cy-6,'text-anchor':'start'});
setText(text,anno.label);
}
described.push({text:annotationText(anno,value,format,opts.dual)});
continue;
}
if(anno.orient==='vertical'||anno.x!==undefined){
const raw=anno.x!==undefined?anno.x:anno.value;
const at=xScale.kind==='band'
?round(xScale.centre(raw))
:round(xScale.of(toNumber(raw)));
if(Number.isNaN(at))continue;
const cls=kind==='target'?`${NS}__annotation-target`:`${NS}__annotation-line`;
attrs(pool.next('path',cls),{
d:path(['M',at,round(plot.top),'L',at,round(plot.bottom)]),
stroke:anno.colour||'currentColor',
fill:'none',
});
if(anno.label){
const text=pool.next('text',`${NS}__annotation-label`);
attrs(text,{
x:at+4,y:round(plot.top+10),'text-anchor':'start',
});
setText(text,anno.label);
}
described.push({text:anno.label?`${anno.label} — at ${xText(raw,format)}`:''});
continue;
}
const value=annotationValue(anno,series,axis);
if(value===null)continue;
const at=round(scale.of(value));
const cls=kind==='target'?`${NS}__annotation-target`:`${NS}__annotation-line`;
attrs(pool.next('path',cls),{
d:path(['M',round(plot.left),at,'L',round(plot.right),at]),
stroke:anno.colour||'currentColor',
fill:'none',
});
if(anno.label){
const text=pool.next('text',`${NS}__annotation-label`);
attrs(text,{x:round(plot.right-4),y:at-4,'text-anchor':'end'});
setText(text,anno.label);
}
described.push({text:annotationText(anno,value,format,opts.dual)});
}
pool.finish();
return described.filter((d)=>d.text);
}
});
__def("packages/modules/charts/combo.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"toPareto",{enumerable:true,get:function(){return toPareto;}});
Object.defineProperty(__exports,"drawCombo",{enumerable:true,get:function(){return drawCombo;}});
Object.defineProperty(__exports,"drawRightAxis",{enumerable:true,get:function(){return drawRightAxis;}});
const __m0=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m0["drawAxisLines"];
const drawCategoryAxis=__m0["drawCategoryAxis"];
const drawMeasureAxis=__m0["drawMeasureAxis"];
const overhangFor=__m0["overhangFor"];
const setPlotClip=__m0["setPlotClip"];
const __m1=__req("packages/modules/charts/frame.js");
const Pool=__m1["Pool"];
const shouldRotate=__m1["shouldRotate"];
const __m2=__req("packages/modules/charts/format.js");
const formatters=__m2["formatters"];
const __m3=__req("packages/modules/charts/scale.js");
const bandScale=__m3["bandScale"];
const isNumber=__m3["isNumber"];
const linearScale=__m3["linearScale"];
const measureDomain=__m3["measureDomain"];
const __m4=__req("packages/modules/charts/svg.js");
const attrs=__m4["attrs"];
const path=__m4["path"];
const round=__m4["round"];
const __m5=__req("packages/modules/charts/styles.js");
const NS=__m5["NS"];
const __m6=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m6["resolveScheme"];
const __m7=__req("packages/modules/charts/labels.js");
const drawDataLabels=__m7["drawDataLabels"];
const __m8=__req("packages/modules/charts/annotations.js");
const drawAnnotations=__m8["drawAnnotations"];
function byAxis(series){
return{
left:series.filter((s)=>s.axis!=='right'),
right:series.filter((s)=>s.axis==='right'),
};
}
function domainFor(series,zero){
const values=[];
for(const s of series)for(const p of s.points)values.push(p.y);
return measureDomain(values,{zero});
}
function toPareto(bound){
const source=bound.series[0];
if(!source)return bound;
const ranked=source.points
.map((point,i)=>({point,label:bound.labels[i],category:bound.categories[i]}))
.filter((entry)=>isNumber(entry.point.y))
.sort((a,b)=>(b.point.y)-(a.point.y));
const total=ranked.reduce((t,entry)=>t+(entry.point.y),0);
let running=0;
const cumulative=ranked.map((entry)=>{
running+=(entry.point.y);
return total>0?(running/total)*100:0;
});
return{
...bound,
categories:ranked.map((entry)=>entry.category),
labels:ranked.map((entry)=>entry.label),
series:[
{
...source,
index:0,
mark:'bar',
axis:'left',
points:ranked.map((entry)=>entry.point),
},
{
key:'cumulative',
label:bound.cumulativeLabel||'%',
index:1,
mark:'line',
axis:'right',
points:ranked.map((entry,i)=>({
x:entry.category,
xKey:entry.point.xKey,
label:entry.label,
y:cumulative[i],
rows:entry.point.rows,
rowKey:entry.point.rowKey,
})),
},
],
};
}
function drawCombo(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot}=ctx;
const bound=ctx.pareto?toPareto(ctx.bound):ctx.bound;
const visible=bound.series.filter((s)=>!ctx.hidden.has(s.key));
const sides=byAxis(visible);
const hasBars=sides.left.some((s)=>(s.mark||'bar')==='bar');
const leftDomain=domainFor(sides.left,hasBars);
const yScale=linearScale(leftDomain,[plot.bottom,plot.top]);
const rightDomain=sides.right.length
?(ctx.pareto?{min:0,max:100}:domainFor(sides.right,false))
:null;
const rightScale=rightDomain?linearScale(rightDomain,[plot.bottom,plot.top]):null;
const xScale=bandScale(bound.categories,[plot.left,plot.right],0.2);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{
kind:'linear',step:(leftDomain.max-leftDomain.min)/5,
}),
});
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels:bound.labels,
fontSize:ctx.fontSize,
rotated:shouldRotate(bound.labels,xScale.step,ctx.fontSize),
});
drawAxisLines({group:ctx.groups.rules,plot});
if(rightScale){
drawRightAxis({
group:ctx.groups.axis,
plot,
scale:rightScale,
colour:scheme.series(sides.right[0].index),
format:formatters(ctx.grid,{
kind:'linear',step:(rightDomain.max-rightDomain.min)/5,
}),
suffix:ctx.pareto?'%':'',
});
}
setPlotClip(ctx.groups,plot,overhangFor(ctx.type));
const pool=new Pool(ctx.groups.marks);
const bars=visible.filter((s)=>(s.mark||'bar')==='bar');
const slot=bars.length?xScale.bandwidth/bars.length:xScale.bandwidth;
let barIndex=0;
for(const series of visible){
const mark=series.mark||'bar';
const scale=series.axis==='right'&&rightScale?rightScale:yScale;
const colour=scheme.series(series.index);
if(mark==='bar'){
const offset=barIndex*slot;
barIndex++;
const base=scale.of(Math.max(scale.domain.min,0));
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const start=xScale.of(point.x);
if(Number.isNaN(start))continue;
const top=scale.of((point.y));
attrs(pool.next('rect',`${NS}__bar ${NS}__mark`),{
x:round(start+offset),
y:round(Math.min(top,base)),
width:round(Math.max(0,slot)),
height:round(Math.max(1,Math.abs(base-top))),
fill:colour,
'data-series':series.index,
'data-point':i,
});
point.px=round(start+offset+slot/2);
point.py=round(Math.min(top,base));
}
continue;
}
const commands=[];
let open=false;
for(const point of series.points){
if(!isNumber(point.y)){open=false;continue;}
const x=round(xScale.centre(point.x));
if(Number.isNaN(x)){open=false;continue;}
const y=round(scale.of((point.y)));
commands.push(open?'L':'M',x,y);
open=true;
point.px=x;
point.py=y;
}
attrs(pool.next('path',`${NS}__line ${NS}__mark`),{
d:commands.length?path(commands):'',
stroke:colour,
'data-series':series.index,
});
for(const point of series.points){
if(point.px===undefined)continue;
attrs(pool.next('circle',`${NS}__point ${NS}__mark`),{
cx:point.px,cy:point.py,r:3,fill:colour,
});
}
}
pool.finish();
if(ctx.labels&&ctx.labels.show){
drawDataLabels({
group:ctx.groups.labels,
series:visible,
plot,
options:ctx.labels,
grid:ctx.grid,
size:(ctx.typography&&ctx.typography.small)||ctx.fontSize,
});
}
let annotations=null;
if(ctx.annotations&&ctx.annotations.length){
annotations=drawAnnotations({
group:ctx.groups.overlay,
plot,
xScale,
yScale,
rightScale,
series:visible,
annotations:ctx.annotations,
dual:!!rightScale,
format:formatters(ctx.grid,{
kind:'linear',step:(leftDomain.max-leftDomain.min)/5,
}).tick,
});
}
return{
xScale,yScale,rightScale,dual:!!rightScale,series:visible,bound,annotations,
};
}
function drawRightAxis(opts){
const{group,plot,scale,format}=opts;
const pool=new Pool(group);
attrs(pool.next('line',`${NS}__axis-right`),{
x1:round(plot.right),x2:round(plot.right),
y1:round(plot.top),y2:round(plot.bottom),
stroke:opts.colour,
});
for(const value of scale.ticks(5)){
const at=round(scale.of(value));
const label=pool.next('text',`${NS}__tick`);
attrs(label,{
x:round(plot.right+6),y:at,'text-anchor':'start',
'dominant-baseline':'middle',fill:opts.colour,
});
label.textContent=`${format.tick(value)}${opts.suffix||''}`;
}
pool.finish();
}
});
__def("packages/modules/charts/quantile.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"normalQuantile",{enumerable:true,get:function(){return normalQuantile;}});
Object.defineProperty(__exports,"studentTQuantile",{enumerable:true,get:function(){return studentTQuantile;}});
const LANCZOS=Object.freeze([
676.5203681218851,-1259.1392167224028,771.32342877765313,
-176.61502916214059,12.507343278686905,-0.13857109526572012,
9.9843695780195716e-6,1.5056327351493116e-7,
]);
const EPS=3e-12;
const TINY=1e-300;
function logGamma(x){
if(x<0.5)return Math.log(Math.PI/Math.sin(Math.PI*x))-logGamma(1-x);
const z=x-1;
let a=0.99999999999980993;
const t=z+7.5;
for(let i=0;i<LANCZOS.length;i++)a+=LANCZOS[i]/(z+i+1);
return 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(a);
}
function betaContinuedFraction(a,b,x){
const qab=a+b;
const qap=a+1;
const qam=a-1;
let c=1;
let d=1-(qab*x)/qap;
if(Math.abs(d)<TINY)d=TINY;
d=1/d;
let h=d;
for(let m=1;m<=300;m++){
const m2=2*m;
let aa=(m*(b-m)*x)/((qam+m2)*(a+m2));
d=1+aa*d;
if(Math.abs(d)<TINY)d=TINY;
c=1+aa/c;
if(Math.abs(c)<TINY)c=TINY;
d=1/d;
h*=d*c;
aa=(-(a+m)*(qab+m)*x)/((a+m2)*(qap+m2));
d=1+aa*d;
if(Math.abs(d)<TINY)d=TINY;
c=1+aa/c;
if(Math.abs(c)<TINY)c=TINY;
d=1/d;
const step=d*c;
h*=step;
if(Math.abs(step-1)<EPS)break;
}
return h;
}
function incompleteBeta(a,b,x){
if(!(a>0)||!(b>0)||!Number.isFinite(x))return Number.NaN;
if(x<=0)return 0;
if(x>=1)return 1;
const front=Math.exp(
logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x),
);
return x<(a+1)/(a+b+2)
?(front*betaContinuedFraction(a,b,x))/a
:1-(front*betaContinuedFraction(b,a,1-x))/b;
}
function erfc(x){
const z=Math.abs(x);
const t=2/(2+z);
const ty=4*t-2;
const cof=[-1.3026537197817094,6.4196979235649026e-1,1.9476473204185836e-2,
-9.561514786808631e-3,-9.46595344482036e-4,3.66839497852761e-4,
4.2523324806907e-5,-2.0278578112534e-5,-1.624290004647e-6,
1.303655835580e-6,1.5626441722e-8,-8.5238095915e-8,6.529054439e-9,
5.059343495e-9,-9.91364156e-10,-2.27365122e-10,9.6467911e-11,
2.394038e-12,-6.886027e-12,8.94487e-13,3.13092e-13,-1.12708e-13,
3.81e-16,7.106e-15];
let dd=0;
let dv=0;
let tmp;
for(let j=cof.length-1;j>0;j--){
tmp=dv;
dv=ty*dv-dd+cof[j];
dd=tmp;
}
const ans=t*Math.exp(-z*z+0.5*(cof[0]+ty*dv)-dd);
return x>=0?ans:2-ans;
}
function normalQuantile(p){
if(!(p>0)||!(p<1))return p===0?-Infinity:(p===1?Infinity:Number.NaN);
const a=[-3.969683028665376e+1,2.209460984245205e+2,-2.759285104469687e+2,
1.383577518672690e+2,-3.066479806614716e+1,2.506628277459239];
const b=[-5.447609879822406e+1,1.615858368580409e+2,-1.556989798598866e+2,
6.680131188771972e+1,-1.328068155288572e+1];
const c=[-7.784894002430293e-3,-3.223964580411365e-1,-2.400758277161838,
-2.549732539343734,4.374664141464968,2.938163982698783];
const d=[7.784695709041462e-3,3.224671290700398e-1,2.445134137142996,
3.754408661907416];
const low=0.02425;
let q;
let r;
let x;
if(p<low){
q=Math.sqrt(-2*Math.log(p));
x=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])
/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}else if(p<=1-low){
q=p-0.5;
r=q*q;
x=((((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q)
/ (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}else{
q=Math.sqrt(-2*Math.log(1-p));
x=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])
/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}
const e=0.5*erfc(-x/Math.SQRT2)-p;
const u=e*Math.sqrt(2*Math.PI)*Math.exp((x*x)/2);
return x-u/(1+(x*u)/2);
}
function studentT(t,df){
if(!(df>0)||!Number.isFinite(t))return Number.NaN;
const tail=0.5*incompleteBeta(df/2,0.5,df/(df+t*t));
return t>0?1-tail:tail;
}
function studentTQuantile(p,df){
if(!(p>0)||!(p<1)||!(df>0))return Number.NaN;
if(df>1e7)return normalQuantile(p);
let lo=-1e4;
let hi=1e4;
let x=normalQuantile(p);
const logBeta=logGamma(df/2)+logGamma(0.5)-logGamma((df+1)/2);
for(let i=0;i<60;i++){
const cdf=studentT(x,df);
if(cdf<p)lo=x;else hi=x;
const pdf=Math.exp(-((df+1)/2)*Math.log(1+(x*x)/df)-logBeta)
/ Math.sqrt(df);
const step=pdf>0?(cdf-p)/pdf:0;
if(Math.abs(step)<1e-12)break;
const next=x-step;
x=next>lo&&next<hi&&Number.isFinite(next)?next:(lo+hi)/2;
if(hi-lo<1e-12)break;
}
return x;
}
});
__def("packages/modules/charts/trendline.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"normaliseTrends",{enumerable:true,get:function(){return normaliseTrends;}});
Object.defineProperty(__exports,"linearTrend",{enumerable:true,get:function(){return linearTrend;}});
Object.defineProperty(__exports,"movingAverageTrend",{enumerable:true,get:function(){return movingAverageTrend;}});
Object.defineProperty(__exports,"exponentialTrend",{enumerable:true,get:function(){return exponentialTrend;}});
Object.defineProperty(__exports,"computeTrend",{enumerable:true,get:function(){return computeTrend;}});
Object.defineProperty(__exports,"trendText",{enumerable:true,get:function(){return trendText;}});
Object.defineProperty(__exports,"drawTrendlines",{enumerable:true,get:function(){return drawTrendlines;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/svg.js");
const attrs=__m1["attrs"];
const path=__m1["path"];
const ribbonPath=__m1["ribbonPath"];
const round=__m1["round"];
const setText=__m1["setText"];
const SVG_NS=__m1["SVG_NS"];
const __m2=__req("packages/modules/charts/typography.js");
const applySize=__m2["applySize"];
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
const __m4=__req("packages/modules/charts/scale.js");
const toNumber=__m4["toNumber"];
const toTime=__m4["toTime"];
const __m5=__req("packages/modules/charts/quantile.js");
const studentTQuantile=__m5["studentTQuantile"];
const METHODS={
linear:new Set(['linear','lr','ols','regression','least-squares']),
movingAverage:new Set(['movingaverage','moving-average','ma','sma','rolling']),
exponential:new Set(['exponential','exp','ewma','ses','holt','smoothing']),
};
const SMOOTH_LO=1e-4;
const SMOOTH_HI=1-1e-4;
function methodOf(name){
const key=String(name||'linear').toLowerCase();
if(METHODS.linear.has(key))return'linear';
if(METHODS.movingAverage.has(key))return'movingAverage';
if(METHODS.exponential.has(key))return'exponential';
return null;
}
function normaliseTrends(trend){
if(!trend)return[];
const raw=Array.isArray(trend)?trend:[trend];
const out=[];
for(const entry of raw){
if(entry===true){out.push({method:'linear'});continue;}
if(typeof entry==='string'){
const method=methodOf(entry);
if(method)out.push({method});
continue;
}
if(entry&&typeof entry==='object'){
const method=methodOf(entry.method);
if(method)out.push({...entry,method});
}
}
return out;
}
function placeX(scale,rawX){
if(scale.kind==='band')return scale.centre(rawX);
const n=scale.kind==='time'?toTime(rawX):toNumber(rawX);
return n===null?NaN:scale.of(n);
}
function sequenceOf(series){
const seq=[];
for(const point of series.points){
const y=Number(point.y);
seq.push({value:Number.isFinite(y)?y:null,rawX:point.x});
}
return seq;
}
function numericPairs(series,xScale){
const pairs=[];
for(const point of series.points){
const x=xScale.kind==='time'?toTime(point.x):toNumber(point.x);
const y=Number(point.y);
if(x===null||!Number.isFinite(x)||!Number.isFinite(y))continue;
pairs.push({x,y});
}
pairs.sort((a,b)=>a.x-b.x);
return pairs;
}
function linearTrend(pairs,forecast,opts={}){
const n=pairs.length;
if(n<2)return null;
let mx=0;
let my=0;
for(const p of pairs){mx+=p.x;my+=p.y;}
mx/=n;
my/=n;
let sxx=0;
let sxy=0;
let syy=0;
for(const p of pairs){
const dx=p.x-mx;
const dy=p.y-my;
sxx+=dx*dx;
sxy+=dx*dy;
syy+=dy*dy;
}
if(sxx===0)return null;
const slope=sxy/sxx;
const intercept=my-slope*mx;
const r2=syy===0?1:Math.max(0,Math.min(1,(sxy*sxy)/(sxx*syy)));
const lo=pairs[0].x;
const hi=pairs[n-1].x;
const at=(x)=>({x,y:intercept+slope*x});
const fit=[at(lo),at(hi)];
const projected=[];
let band=null;
const steps=Math.max(0,Math.floor(Number(forecast)||0));
if(steps>0&&hi>lo){
const step=(hi-lo)/(n-1);
if(step>0){
projected.push(at(hi),at(hi+steps*step));
if(n>2){
const conf=Number.isFinite(opts.confidence)
&&opts.confidence>0&&opts.confidence<1?Number(opts.confidence):0.95;
const tail=1-(1-conf)/2;
const sse=Math.max(0,syy-slope*sxy);
const s=Math.sqrt(sse/(n-2));
const t=studentTQuantile(tail,n-2);
const points=[];
for(let h=0;h<=steps;h++){
const x0=hi+h*step;
const mean=intercept+slope*x0;
const leverage=1/n+((x0-mx)**2)/sxx;
const sePred=s*Math.sqrt(1+leverage);
const seMean=s*Math.sqrt(leverage);
points.push({
x:x0,
mean,
lower:mean-t*sePred,
upper:mean+t*sePred,
lowerMean:mean-t*seMean,
upperMean:mean+t*seMean,
});
}
band={confidence:conf,points};
}
}
}
return{
fit,
forecast:projected,
band,
stats:{
method:'linear',slope,intercept,r2,n,forecast:projected.length?steps:0,
confidence:band?band.confidence:null,
},
};
}
function movingAverageTrend(seq,window){
const span=Math.max(1,Math.floor(Number(window)||3));
const ring=[];
let sum=0;
const fit=[];
for(const row of seq){
if(Number.isFinite(row.value)){
ring.push(row.value);
sum+=row.value;
if(ring.length>span)sum-=ring.shift();
}
if(!ring.length)continue;
fit.push({x:row.rawX,y:sum/ring.length});
}
if(fit.length<2)return null;
return{fit,stats:{method:'movingAverage',window:span}};
}
function runSes(y,alpha){
const n=y.length;
const smoothed=new Array(n).fill(null);
let level=null;
let sse=0;
for(let i=0;i<n;i++){
const v=y[i];
if(!Number.isFinite(v)){
if(level!==null)smoothed[i]=level;
continue;
}
if(level===null){level=v;smoothed[i]=v;continue;}
sse+=(v-level)**2;
level=alpha*v+(1-alpha)*level;
smoothed[i]=level;
}
return{smoothed,sse};
}
function runHolt(y,alpha,beta){
const n=y.length;
const smoothed=new Array(n).fill(null);
let level=null;
let trend=null;
let sse=0;
for(let i=0;i<n;i++){
const v=y[i];
if(!Number.isFinite(v)){
if(level!==null){level+=trend;smoothed[i]=level;}
continue;
}
if(level===null){level=v;smoothed[i]=v;continue;}
if(trend===null){
trend=v-level;
const forecast=level+trend;
sse+=(v-forecast)**2;
const prev=level;
level=alpha*v+(1-alpha)*(prev+trend);
trend=beta*(level-prev)+(1-beta)*trend;
smoothed[i]=level;
continue;
}
const forecast=level+trend;
sse+=(v-forecast)**2;
const prev=level;
level=alpha*v+(1-alpha)*(prev+trend);
trend=beta*(level-prev)+(1-beta)*trend;
smoothed[i]=level;
}
return{smoothed,sse};
}
function goldenMin(f,lo,hi,iters=80){
const invphi=(Math.sqrt(5)-1)/2;
let a=lo;
let b=hi;
let c=b-invphi*(b-a);
let d=a+invphi*(b-a);
let fc=f(c);
let fd=f(d);
for(let i=0;i<iters;i++){
if(fc<fd){b=d;d=c;fd=fc;c=b-invphi*(b-a);fc=f(c);}
else{a=c;c=d;fc=fd;d=a+invphi*(b-a);fd=f(d);}
}
return(a+b)/2;
}
function exponentialTrend(seq,spec){
const holt=String(spec.kind||spec.model||'').toLowerCase()==='holt';
const y=seq.map((row)=>(Number.isFinite(row.value)?row.value:null));
const finite=y.filter((v)=>v!==null).length;
if(finite<(holt?2:1))return null;
const clamp=(x)=>Math.min(SMOOTH_HI,Math.max(SMOOTH_LO,x));
let alpha=Number.isFinite(spec.alpha)?clamp(Number(spec.alpha)):null;
let beta=holt&&Number.isFinite(spec.beta)?clamp(Number(spec.beta)):null;
if(holt){
if(alpha===null||beta===null){
let a=alpha===null?0.5:alpha;
let b=beta===null?0.5:beta;
for(let r=0;r<6;r++){
if(alpha===null)a=goldenMin((x)=>runHolt(y,x,b).sse,SMOOTH_LO,SMOOTH_HI);
if(beta===null)b=goldenMin((x)=>runHolt(y,a,x).sse,SMOOTH_LO,SMOOTH_HI);
}
alpha=alpha===null?a:alpha;
beta=beta===null?b:beta;
}
}else if(alpha===null){
alpha=goldenMin((x)=>runSes(y,x).sse,SMOOTH_LO,SMOOTH_HI);
}
const run=holt?runHolt(y,alpha,beta):runSes(y,alpha);
const fit=[];
for(let i=0;i<seq.length;i++){
const level=run.smoothed[i];
if(level===null||!Number.isFinite(level))continue;
fit.push({x:seq[i].rawX,y:level});
}
if(fit.length<2)return null;
return{
fit,stats:{method:'exponential',kind:holt?'holt':'ses',alpha,beta:holt?beta:null},
};
}
function computeTrend(series,spec,xScale){
if(spec.method==='linear'){
const pairs=numericPairs(series,xScale);
return linearTrend(pairs,spec.forecast,{confidence:spec.confidence});
}
const seq=sequenceOf(series);
if(spec.method==='movingAverage'){
return movingAverageTrend(seq,spec.window||spec.period);
}
return exponentialTrend(seq,spec);
}
function trendText(stats,label,fmt,forecast,band,bandKind){
const who=label?` for ${label}`:'';
if(stats.method==='linear'){
const r2=Number.isFinite(stats.r2)?`, R² ${stats.r2.toFixed(2)}`:'';
let text=`Trend (linear)${who}: slope ${fmt(stats.slope)}${r2}`;
if(stats.forecast>0&&forecast&&forecast.length){
const end=forecast[forecast.length-1];
text+=`; forecast ${stats.forecast} step${stats.forecast===1?'':'s'} ahead to ${fmt(end.y)}`;
if(band&&band.points.length){
const last=band.points[band.points.length-1];
const mean=bandKind==='confidence'||bandKind==='mean';
const lo=mean?last.lowerMean:last.lower;
const up=mean?last.upperMean:last.upper;
const kind=mean?'confidence':'prediction';
const pct=Math.round(band.confidence*100);
text+=`; ${pct}% ${kind} band ${fmt(lo)} to ${fmt(up)} at the horizon`;
}
}
return text;
}
if(stats.method==='movingAverage'){
return`Trend (moving average, window ${stats.window})${who}`;
}
const kind=stats.kind==='holt'?'Holt':'single';
const a=Number.isFinite(stats.alpha)?`, α ${stats.alpha.toFixed(2)}`:'';
const b=Number.isFinite(stats.beta)?`, β ${stats.beta.toFixed(2)}`:'';
return`Trend (exponential, ${kind})${who}${a}${b}`;
}
function drawTrendlines(opts){
const specs=normaliseTrends(opts.trend);
if(!specs.length)return[];
const doc=opts.group.ownerDocument;
let host=null;
for(const child of opts.group.childNodes||[]){
if(child&&String(child.getAttribute&&child.getAttribute('class'))===`${NS}__trends`){
host=child;
break;
}
}
if(!host){
host=doc.createElementNS(SVG_NS,'g');
host.setAttribute('class',`${NS}__trends`);
opts.group.appendChild(host);
}
if(opts.clip)host.setAttribute('clip-path',`url(#${opts.clip})`);
else host.removeAttribute('clip-path');
const pool=new Pool(host);
const described=[];
for(const spec of specs){
for(const series of opts.series){
const yScale=(series.axis==='right'&&opts.rightScale)?opts.rightScale:opts.yScale;
const overlay=computeTrend(series,spec,opts.xScale);
if(!overlay)continue;
const colour=opts.scheme.series(series.index);
const line=[];
for(const point of overlay.fit){
const px=placeX(opts.xScale,point.x);
const py=yScale.of(point.y);
if(!Number.isFinite(px)||!Number.isFinite(py))continue;
line.push(line.length?'L':'M',round(px),round(py));
}
if(line.length<4)continue;
attrs(pool.next('path',`${NS}__trend`),{
d:path(line),
fill:'none',
stroke:colour,
'data-series':series.index,
});
const wantsBand=spec.band!==false&&overlay.band&&overlay.band.points.length>=2;
if(wantsBand){
const mean=spec.band==='confidence'||spec.band==='mean';
const rows=[];
for(const point of overlay.band.points){
const px=placeX(opts.xScale,point.x);
const lo=mean?point.lowerMean:point.lower;
const up=mean?point.upperMean:point.upper;
const pl=yScale.of(lo);
const pu=yScale.of(up);
if(!Number.isFinite(px)||!Number.isFinite(pl)||!Number.isFinite(pu))continue;
rows.push({x:round(px),lower:round(pl),upper:round(pu)});
}
const d=ribbonPath(rows);
if(d){
attrs(pool.next('path',`${NS}__trend-band`),{
d,
fill:colour,
'fill-opacity':0.15,
stroke:'none',
'data-series':series.index,
});
}
}
const forecast=overlay.forecast||[];
if(forecast.length>=2){
const seg=[];
for(const point of forecast){
const px=placeX(opts.xScale,point.x);
const py=yScale.of(point.y);
if(!Number.isFinite(px)||!Number.isFinite(py))continue;
seg.push(seg.length?'L':'M',round(px),round(py));
}
if(seg.length>=4){
attrs(pool.next('path',`${NS}__trend-forecast`),{
d:path(seg),
fill:'none',
stroke:colour,
'data-series':series.index,
});
}
}
if(spec.label!==false&&overlay.stats.method==='linear'
&&Number.isFinite(overlay.stats.r2)){
const last=overlay.fit[overlay.fit.length-1];
const text=pool.next('text',`${NS}__trend-label`);
applySize(text,opts.size);
attrs(text,{
x:round(placeX(opts.xScale,last.x)),
y:round(yScale.of(last.y))-4,
'text-anchor':'end',
fill:colour,
});
setText(text,`R² ${overlay.stats.r2.toFixed(2)}`);
}
described.push({
text:trendText(overlay.stats,series.label,opts.format,forecast,
spec.band===false?null:overlay.band,spec.band),
});
}
}
pool.finish();
return described.filter((d)=>d.text);
}
});
__def("packages/core/src/internal/util.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"VERSION",{enumerable:true,get:function(){return VERSION;}});
Object.defineProperty(__exports,"reportedWarnings",{enumerable:true,get:function(){return reportedWarnings;}});
Object.defineProperty(__exports,"warnOnce",{enumerable:true,get:function(){return warnOnce;}});
Object.defineProperty(__exports,"infoOnce",{enumerable:true,get:function(){return infoOnce;}});
Object.defineProperty(__exports,"resetWarnings",{enumerable:true,get:function(){return resetWarnings;}});
Object.defineProperty(__exports,"fail",{enumerable:true,get:function(){return fail;}});
Object.defineProperty(__exports,"invariant",{enumerable:true,get:function(){return invariant;}});
Object.defineProperty(__exports,"DEV",{enumerable:true,get:function(){return DEV;}});
Object.defineProperty(__exports,"isObject",{enumerable:true,get:function(){return isObject;}});
Object.defineProperty(__exports,"isFunction",{enumerable:true,get:function(){return isFunction;}});
Object.defineProperty(__exports,"isNil",{enumerable:true,get:function(){return isNil;}});
Object.defineProperty(__exports,"isBlank",{enumerable:true,get:function(){return isBlank;}});
Object.defineProperty(__exports,"isCtor",{enumerable:true,get:function(){return isCtor;}});
Object.defineProperty(__exports,"pathGetter",{enumerable:true,get:function(){return pathGetter;}});
Object.defineProperty(__exports,"pathSetter",{enumerable:true,get:function(){return pathSetter;}});
Object.defineProperty(__exports,"getPath",{enumerable:true,get:function(){return getPath;}});
Object.defineProperty(__exports,"setPath",{enumerable:true,get:function(){return setPath;}});
Object.defineProperty(__exports,"humanise",{enumerable:true,get:function(){return humanise;}});
Object.defineProperty(__exports,"escapeHtml",{enumerable:true,get:function(){return escapeHtml;}});
Object.defineProperty(__exports,"titleCase",{enumerable:true,get:function(){return titleCase;}});
Object.defineProperty(__exports,"expand",{enumerable:true,get:function(){return expand;}});
Object.defineProperty(__exports,"toArray",{enumerable:true,get:function(){return toArray;}});
Object.defineProperty(__exports,"merge",{enumerable:true,get:function(){return merge;}});
Object.defineProperty(__exports,"mergeRow",{enumerable:true,get:function(){return mergeRow;}});
Object.defineProperty(__exports,"Lru",{enumerable:true,get:function(){return Lru;}});
Object.defineProperty(__exports,"collator",{enumerable:true,get:function(){return collator;}});
Object.defineProperty(__exports,"defaultCompare",{enumerable:true,get:function(){return defaultCompare;}});
Object.defineProperty(__exports,"now",{enumerable:true,get:function(){return now;}});
Object.defineProperty(__exports,"nextFrame",{enumerable:true,get:function(){return nextFrame;}});
Object.defineProperty(__exports,"cancelFrame",{enumerable:true,get:function(){return cancelFrame;}});
Object.defineProperty(__exports,"frameBatched",{enumerable:true,get:function(){return frameBatched;}});
Object.defineProperty(__exports,"settleDebounce",{enumerable:true,get:function(){return settleDebounce;}});
Object.defineProperty(__exports,"whenIdle",{enumerable:true,get:function(){return whenIdle;}});
Object.defineProperty(__exports,"uid",{enumerable:true,get:function(){return uid;}});
const STAMPED_VERSION="1.67.0";
async function resolveVersion(){
if(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;
return STAMPED_VERSION;
}
const VERSION="1.67.0";
const warned=new Set();
const WARNED_LIMIT=2000;
function rememberWarned(key){
warned.add(key);
if(warned.size>WARNED_LIMIT){
const oldest=warned.values().next().value;
if(oldest!==undefined)warned.delete(oldest);
}
}
const reported=[];
const REPORT_LIMIT=500;
function record(key,level,message){
reported.push({
key,
level,
message:message.map((m)=>(typeof m==='string'?m:safeString(m))).join(' '),
at:Date.now(),
});
if(reported.length>REPORT_LIMIT)reported.shift();
}
function safeString(value){
if(value instanceof Error)return value.message;
try{return JSON.stringify(value);}catch{return String(value);}
}
function reportedWarnings(){return reported.map((r)=>({...r}));}
function warnOnce(key,...message){
if(warned.has(key))return;
rememberWarned(key);
record(key,'warn',message);
console.warn('[lattice]',...message);
}
function infoOnce(key,...message){
if(warned.has(key))return;
rememberWarned(key);
record(key,'info',message);
console.info('[lattice]',...message);
}
function resetWarnings(){
warned.clear();
reported.length=0;
}
function fail(message,extra){
const err=new Error(`[lattice] ${message}`);
if(extra!==undefined)err.cause=extra;
throw err;
}
function invariant(condition,message){
if(!condition)fail(message);
}
const DEV=(()=>{
try{
return!(typeof process!=='undefined'&&process.env
&&process.env.NODE_ENV==='production');
}catch{
return true;
}
})();
function isObject(v){
return v!==null&&typeof v==='object'&&!Array.isArray(v);
}
function isFunction(v){
return typeof v==='function';
}
function isNil(v){
return v===null||v===undefined;
}
function isBlank(v){
return v===null||v===undefined||v==='';
}
function isCtor(v){
if(typeof v!=='function')return false;
if(/^class[\s{]/.test(Function.prototype.toString.call(v)))return true;
return!!(v.prototype&&Object.getOwnPropertyNames(v.prototype).length>1);
}
const pathCache=new Map();
function pathGetter(path){
let fn=pathCache.get(path);
if(fn)return fn;
if(!path.includes('.')){
fn=(o)=>(o==null?undefined:o[path]);
}else{
const parts=path.split('.');
const n=parts.length;
fn=(o)=>{
let cur=o;
for(let i=0;i<n;i++){
if(cur==null)return undefined;
cur=cur[parts[i]];
}
return cur;
};
}
pathCache.set(path,fn);
return fn;
}
const setterCache=new Map();
function pathSetter(path){
let fn=setterCache.get(path);
if(fn)return fn;
if(!path.includes('.')){
fn=(o,v)=>{if(o!=null)o[path]=v;};
}else{
const parts=path.split('.');
const last=parts.length-1;
fn=(o,v)=>{
let cur=o;
for(let i=0;i<last;i++){
if(cur==null)return;
const k=parts[i];
if(cur[k]==null)cur[k]={};
cur=cur[k];
}
if(cur!=null)cur[parts[last]]=v;
};
}
setterCache.set(path,fn);
return fn;
}
function getPath(obj,path){
return pathGetter(path)(obj);
}
function setPath(obj,path,value){
pathSetter(path)(obj,value);
}
function humanise(field){
if(!field)return'';
const leaf=field.includes('.')?field.slice(field.lastIndexOf('.')+1):field;
return leaf
.replace(/[_-]+/g,' ')
.replace(/([a-z0-9])([A-Z])/g,'$1 $2')
.replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2')
.replace(/\s+/g,' ')
.trim()
.replace(/^./,(c)=>c.toUpperCase());
}
const ESCAPES={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
function escapeHtml(s){
const str=s==null?'':String(s);
return/[&<>"']/.test(str)?str.replace(/[&<>"']/g,(c)=>ESCAPES[c]):str;
}
function titleCase(s){
return String(s).replace(/\w\S*/g,(t)=>t[0].toUpperCase()+t.slice(1).toLowerCase());
}
function expand(value,key,whenTrue){
if(value===undefined)return undefined;
if(value===true)return{enabled:true,...whenTrue};
if(value===false)return{enabled:false};
if(isObject(value))return value;
return{[key]:value,enabled:true};
}
function toArray(v){
if(v===undefined||v===null)return[];
return Array.isArray(v)?v:[v];
}
const MERGE_FORBIDDEN_KEYS=Object.freeze(new Set(['__proto__','constructor','prototype']));
function merge(a,b){
if(!isObject(a))return isObject(b)?{...b}:b;
if(!isObject(b))return b===undefined?a:b;
const out={...a};
for(const k of Object.keys(b)){
if(MERGE_FORBIDDEN_KEYS.has(k))continue;
const bv=b[k];
if(bv===undefined)continue;
out[k]=isObject(bv)&&isObject(out[k])?merge(out[k],bv):bv;
}
return out;
}
function mergeRow(previous,patch){
if(!isObject(previous)||!isObject(patch)||previous===patch)return patch;
const out=Object.create(Object.getPrototypeOf(previous));
Object.assign(out,previous,patch);
return out;
}
class Lru{
#max;
#map=new Map();
#onEvict;
constructor(max=256,onEvict=null){
this.#max=max;
this.#onEvict=onEvict;
}
get size(){
return this.#map.size;
}
get max(){
return this.#max;
}
set max(v){
this.#max=v;
this.#trim();
}
has(k){
return this.#map.has(k);
}
get(k){
const m=this.#map;
if(!m.has(k))return undefined;
const v=m.get(k);
m.delete(k);
m.set(k,v);
return v;
}
peek(k){
return this.#map.get(k);
}
set(k,v){
const m=this.#map;
if(m.has(k))m.delete(k);
m.set(k,v);
this.#trim();
return v;
}
delete(k){
const v=this.#map.get(k);
if(this.#map.delete(k)&&this.#onEvict)this.#onEvict(v,k);
return v;
}
clear(){
if(this.#onEvict)for(const[k,v]of this.#map)this.#onEvict(v,k);
this.#map.clear();
}
keys(){
return this.#map.keys();
}
values(){
return this.#map.values();
}
#trim(){
const m=this.#map;
while(m.size>this.#max){
const oldest=m.keys().next().value;
const v=m.get(oldest);
m.delete(oldest);
if(this.#onEvict)this.#onEvict(v,oldest);
}
}
}
const collators=new Map();
function collator(locale,opts){
const key=`${locale||''}|${opts?JSON.stringify(opts):''}`;
let c=collators.get(key);
if(!c){
c=new Intl.Collator(locale||undefined,{
numeric:true,sensitivity:'variant',...opts,
});
collators.set(key,c);
}
return c;
}
function defaultCompare(a,b){
if(a===b)return 0;
if(a===null||a===undefined)return 1;
if(b===null||b===undefined)return-1;
if(typeof a==='number'&&typeof b==='number'){
if(Number.isNaN(a))return Number.isNaN(b)?0:1;
if(Number.isNaN(b))return-1;
return a<b?-1:a>b?1:0;
}
const sa=String(a);
const sb=String(b);
return sa<sb?-1:sa>sb?1:0;
}
function now(){
return typeof performance!=='undefined'&&performance.now
?performance.now()
:Date.now();
}
const hasRaf=typeof requestAnimationFrame==='function';
function nextFrame(fn){
if(hasRaf)return requestAnimationFrame(fn);
return setTimeout(()=>fn(now()),16);
}
function cancelFrame(handle){
if(handle==null)return;
if(hasRaf)cancelAnimationFrame(handle);
else clearTimeout(handle);
}
function frameBatched(fn){
let handle=null;
let lastArgs=null;
const run=()=>{
handle=null;
const a=lastArgs;
lastArgs=null;
fn(...(a||[]));
};
const wrapped=(...args)=>{
lastArgs=args;
if(handle===null)handle=nextFrame(run);
};
wrapped.cancel=()=>{
cancelFrame(handle);
handle=null;
lastArgs=null;
};
wrapped.flush=()=>{
if(handle!==null){
cancelFrame(handle);
run();
}
};
return wrapped;
}
function settleDebounce(fn,waitMs){
let timer=null;
let held=null;
const trailing=()=>{
timer=null;
if(held===null)return;
const args=held;
held=null;
fn(...args);
arm();
};
const arm=()=>{
timer=setTimeout(trailing,waitMs);
if(typeof timer?.unref==='function')timer.unref();
};
const wrapped=(...args)=>{
if(timer===null){
fn(...args);
arm();
}else{
held=args;
clearTimeout(timer);
arm();
}
};
wrapped.flush=()=>{
if(timer!==null)clearTimeout(timer);
timer=null;
if(held===null)return;
const args=held;
held=null;
fn(...args);
};
wrapped.cancel=()=>{
if(timer!==null)clearTimeout(timer);
timer=null;
held=null;
};
wrapped.pending=()=>timer!==null||held!==null;
return wrapped;
}
function whenIdle(fn,timeout=50){
if(typeof requestIdleCallback==='function'){
return requestIdleCallback(fn,{timeout});
}
return setTimeout(()=>fn({timeRemaining:()=>0,didTimeout:true}),1);
}
let idSeq=0;
function uid(prefix='l'){
return`${prefix}${(++idSeq).toString(36)}`;
}
});
__def("packages/modules/charts/cartesian.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"CARTESIAN",{enumerable:true,get:function(){return CARTESIAN;}});
Object.defineProperty(__exports,"axisWindowSpan",{enumerable:true,get:function(){return axisWindowSpan;}});
Object.defineProperty(__exports,"rollingDomain",{enumerable:true,get:function(){return rollingDomain;}});
Object.defineProperty(__exports,"WINDOW_LEAD",{enumerable:true,get:function(){return WINDOW_LEAD;}});
Object.defineProperty(__exports,"aheadOfWindow",{enumerable:true,get:function(){return aheadOfWindow;}});
Object.defineProperty(__exports,"staleWindow",{enumerable:true,get:function(){return staleWindow;}});
Object.defineProperty(__exports,"windowedBound",{enumerable:true,get:function(){return windowedBound;}});
Object.defineProperty(__exports,"drawFits",{enumerable:true,get:function(){return drawFits;}});
Object.defineProperty(__exports,"drawConfidenceBand",{enumerable:true,get:function(){return drawConfidenceBand;}});
Object.defineProperty(__exports,"drawBoundErrorBars",{enumerable:true,get:function(){return drawBoundErrorBars;}});
Object.defineProperty(__exports,"drawForest",{enumerable:true,get:function(){return drawForest;}});
Object.defineProperty(__exports,"drawReferenceLines",{enumerable:true,get:function(){return drawReferenceLines;}});
Object.defineProperty(__exports,"drawCartesian",{enumerable:true,get:function(){return drawCartesian;}});
Object.defineProperty(__exports,"HIT_TOLERANCE",{enumerable:true,get:function(){return HIT_TOLERANCE;}});
Object.defineProperty(__exports,"nearestDrawnPoint",{enumerable:true,get:function(){return nearestDrawnPoint;}});
Object.defineProperty(__exports,"nearestCategory",{enumerable:true,get:function(){return nearestCategory;}});
Object.defineProperty(__exports,"categoryKeyAt",{enumerable:true,get:function(){return categoryKeyAt;}});
const __m0=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m0["drawAxisLines"];
const drawAxisTitle=__m0["drawAxisTitle"];
const drawBandLabels=__m0["drawBandLabels"];
const drawCategoryAxis=__m0["drawCategoryAxis"];
const drawContinuousAxis=__m0["drawContinuousAxis"];
const drawMeasureAxis=__m0["drawMeasureAxis"];
const overhangFor=__m0["overhangFor"];
const setPlotClip=__m0["setPlotClip"];
const __m1=__req("packages/modules/charts/frame.js");
const Pool=__m1["Pool"];
const shouldRotate=__m1["shouldRotate"];
const __m2=__req("packages/modules/charts/format.js");
const formatters=__m2["formatters"];
const __m3=__req("packages/modules/charts/scale.js");
const bandScale=__m3["bandScale"];
const extent=__m3["extent"];
const isNumber=__m3["isNumber"];
const key=__m3["key"];
const linearScale=__m3["linearScale"];
const measureDomain=__m3["measureDomain"];
const timeScale=__m3["timeScale"];
const toNumber=__m3["toNumber"];
const toTime=__m3["toTime"];
const __m4=__req("packages/modules/charts/svg.js");
const attrs=__m4["attrs"];
const path=__m4["path"];
const ribbonPath=__m4["ribbonPath"];
const round=__m4["round"];
const setText=__m4["setText"];
const SVG_NS=__m4["SVG_NS"];
const __m5=__req("packages/modules/charts/styles.js");
const NS=__m5["NS"];
const __m6=__req("packages/modules/charts/labels.js");
const drawDataLabels=__m6["drawDataLabels"];
const __m7=__req("packages/modules/charts/dense.js");
const downsample=__m7["downsample"];
const __m8=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m8["resolveScheme"];
const __m9=__req("packages/modules/charts/typography.js");
const applySize=__m9["applySize"];
const __m10=__req("packages/modules/charts/combo.js");
const drawRightAxis=__m10["drawRightAxis"];
const __m11=__req("packages/modules/charts/annotations.js");
const drawAnnotations=__m11["drawAnnotations"];
const overlayLayer=__m11["overlayLayer"];
const __m12=__req("packages/modules/charts/trendline.js");
const drawTrendlines=__m12["drawTrendlines"];
const __m13=__req("packages/core/src/internal/util.js");
const warnOnce=__m13["warnOnce"];
const POINT_RADIUS=3.5;
const CARTESIAN=Object.freeze({
line:{zero:false,marks:'path'},
step:{zero:false,marks:'path'},
area:{zero:true,marks:'path'},
rangeArea:{zero:false,marks:'path'},
bar:{zero:true,marks:'rect'},
horizontalBar:{zero:true,marks:'rect',horizontal:true},
waterfall:{zero:true,marks:'rect'},
scatter:{zero:false,marks:'circle'},
bubble:{zero:false,marks:'circle'},
});
function stepCommands(points){
const out=[];
for(let i=0;i<points.length;i++){
const p=points[i];
if(i===0){out.push('M',p.x,p.y);continue;}
out.push('L',p.x,points[i-1].y);
out.push('L',p.x,p.y);
}
return out;
}
function measureValues(series,stacked,percent){
if(percent)return[0,100];
if(!stacked){
const out=[];
for(const s of series)for(const p of s.points)out.push(p.y);
return out;
}
const positives=[];
const negatives=[];
const count=series[0]?series[0].points.length:0;
for(let i=0;i<count;i++){
let up=0;
let down=0;
for(const s of series){
const v=s.points[i]?s.points[i].y:null;
if(!isNumber(v))continue;
if((v)>=0)up+=(v);
else down+=(v);
}
positives.push(up);
negatives.push(down);
}
return[...positives,...negatives];
}
function runningExtent(series){
const out=[0];
if(!series)return out;
let running=0;
for(const point of series.points){
if(!isNumber(point.y))continue;
running+=(point.y);
out.push(running);
}
return out;
}
function stacker(count,totals){
const up=new Float64Array(count);
const down=new Float64Array(count);
return{
take(index,raw){
const total=totals?totals[index]:0;
const value=totals?(total?(raw/total)*100:0):raw;
if(value>=0){
const from=up[index];
up[index]+=value;
return[from,up[index]];
}
const from=down[index];
down[index]+=value;
return[from,down[index]];
},
};
}
function axisWindowSpan(config){
const spec=config&&config.window;
if(!spec||typeof spec!=='object')return 0;
const span=Number(spec.span);
if(!Number.isFinite(span)||span<=0)return 0;
if(spec.kind!=='time'){
warnOnce('chart.axis.window.kind',
`axis window kind "${spec.kind}" is not supported on a chart axis; only `
+'{ kind: "time", span } rolls the domain. Bound the row count with the '
+"source's maxRows instead.");
return 0;
}
return span;
}
function rollingDomain(span,values,now){
const limit=now+span*WINDOW_LEAD;
let max=now;
for(const value of values){
if(Number.isFinite(value)&&value>max&&value<=limit)max=value;
}
return{min:max-span,max};
}
const WINDOW_LEAD=0.25;
function windowedValues(bound,config,type){
const span=axisWindowSpan(config);
if(!span||!bound||!Array.isArray(bound.categories))return null;
const shape=CARTESIAN[type];
if(!shape||shape.horizontal||type==='bar'||bound.kind==='category')return null;
const values=bound.categories.map(
(value)=>(bound.kind==='time'?toTime(value):toNumber(value)),
);
return{span,values};
}
function aheadOfWindow(bound,config,type,now){
const read=windowedValues(bound,config,type);
if(!read)return null;
const limit=read.span*WINDOW_LEAD;
let count=0;
let lead=0;
for(const n of read.values){
if(n===null||!Number.isFinite(n)||n-now<=limit)continue;
count+=1;
if(n-now>lead)lead=n-now;
}
return count?{span:read.span,limit,count,lead}:null;
}
function staleWindow(bound,config,type,now){
const read=windowedValues(bound,config,type);
if(!read)return null;
const{span}=read;
const values=read.values.filter((n)=>n!==null&&Number.isFinite(n));
if(!values.length)return null;
const{min,max}=rollingDomain(span,values,now);
let newest=-Infinity;
for(const n of values){
if(n>=min&&n<=max)return null;
if(n<min&&n>newest)newest=n;
}
return newest===-Infinity
?{span,newest:null,age:null,points:values.length}
:{span,newest,age:now-newest,points:values.length};
}
function windowedBound(bound,config,type,now){
const read=windowedValues(bound,config,type);
if(!read)return bound;
const{span,values}=read;
const finite=values.filter((n)=>n!==null&&Number.isFinite(n));
if(!finite.length)return bound;
const{min,max}=rollingDomain(span,(finite),now);
const keep=[];
for(let i=0;i<values.length;i++){
const n=values[i];
if(n===null||!Number.isFinite(n)||(n>=min&&n<=max))keep.push(i);
}
if(keep.length===values.length)return bound;
return{
...bound,
categories:keep.map((i)=>bound.categories[i]),
labels:Array.isArray(bound.labels)?keep.map((i)=>bound.labels[i]):bound.labels,
series:(bound.series||[]).map((series)=>({
...series,
points:Array.isArray(series.points)
?keep.map((i)=>series.points[i]).filter((point)=>point!==undefined)
:series.points,
})),
windowed:values.length-keep.length,
};
}
function xScaleFor(bound,plot,type,config){
const range=([plot.left,plot.right]);
const span=axisWindowSpan(config);
if(bound.kind==='category'||type==='bar'){
if(span){
warnOnce('chart.axis.window.band',
'a rolling time window needs a continuous x axis; this chart bands its x '
+'values, so the window is ignored. Bind a date or numeric column to x.');
}
return bandScale(bound.categories,range,type==='bar'?0.2:0.4);
}
const numbers=bound.kind==='time'
?bound.categories.map(toTime)
:bound.categories.map(toNumber);
if(bound.kind==='time'&&!span){
const found=extent(numbers);
if(found&&found.min===found.max){
return timeScale({min:found.min-30000,max:found.max+30000},range);
}
}
const domain=span
?rollingDomain(span,numbers,Date.now())
:measureDomain(numbers,{zero:false,nice:bound.kind!=='time'});
return bound.kind==='time'?timeScale(domain,range):linearScale(domain,range);
}
function xOf(scale,point){
if(scale.kind==='band')return scale.centre(point.x);
const n=scale.kind==='time'?toTime(point.x):toNumber(point.x);
return n===null?NaN:scale.of(n);
}
function drawPath(opts){
const{series,xScale,yScale,baseline,fill,colour,stack}=opts;
const line=[];
const area=[];
let open=false;
const placed=[];
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
const x=round(xOf(xScale,point));
if(!isNumber(point.y)||Number.isNaN(x)){
open=false;
continue;
}
placed[i]=true;
const value=(point.y);
const span=stack?stack.take(i,value):null;
const y=round(yScale.of(span?span[1]:value));
const base=round(yScale.of(span?span[0]:baseline));
if(opts.step&&open){
line.push('L',x,(opts.previous));
}
line.push(open?'L':'M',x,y);
opts.previous=y;
if(fill)area.push(open?'L':'M',x,y);
if(fill&&!open)area.push('M',x,y);
open=true;
point.px=x;
point.py=y;
point.pbase=base;
}
attrs(opts.pool.next('path',`${NS}__line ${NS}__mark`),{
d:line.length?path(line):'',
stroke:colour,
'data-series':opts.index,
});
if(!fill){
drawIsolated({...opts,placed});
return;
}
const shape=[];
let run=[];
const flush=()=>{
if(run.length<2){
run=[];
return;
}
shape.push('M',run[0].x,run[0].base);
for(const p of run)shape.push('L',p.x,p.y);
for(let i=run.length-1;i>=0;i--)shape.push('L',run[i].x,run[i].base);
shape.push('Z');
run=[];
};
for(const point of series.points){
if(!isNumber(point.y)||point.px===undefined){
flush();
continue;
}
run.push({x:point.px,y:point.py,base:point.pbase});
}
flush();
attrs(opts.pool.next('path',`${NS}__area ${NS}__mark`),{
d:shape.length?path(shape):'',
fill:colour,
'data-series':opts.index,
});
drawIsolated({...opts,placed});
}
function drawIsolated(opts){
const{series,placed}=opts;
for(let i=0;i<series.points.length;i++){
if(!placed[i]||placed[i-1]||placed[i+1])continue;
const point=series.points[i];
attrs(opts.pool.next('circle',`${NS}__point ${NS}__mark`),{
cx:point.px,
cy:point.py,
r:POINT_RADIUS,
fill:opts.colour,
'data-series':opts.index,
'data-point':i,
});
}
}
function drawBars(opts){
const{series,xScale,yScale,baseline,colour,stack,slot}=opts;
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const start=xScale.of(point.x);
if(Number.isNaN(start))continue;
const value=(point.y);
const span=stack?stack.take(i,value):[baseline,value];
const top=yScale.of(span[1]);
const base=yScale.of(span[0]);
const rect=opts.pool.next('rect',`${NS}__bar ${NS}__mark`);
attrs(rect,{
x:round(start+slot.offset),
y:round(Math.min(top,base)),
width:round(Math.max(0,slot.width)),
height:round(Math.max(1,Math.abs(base-top))),
fill:colour,
'data-series':opts.index,
'data-point':i,
});
point.px=round(start+slot.offset+slot.width/2);
point.py=round(Math.min(top,base));
point.pbase=round(Math.max(top,base));
}
}
function drawWaterfall(opts){
const{series,xScale,yScale}=opts;
let running=0;
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const value=(point.y);
const last=i===series.points.length-1;
const from=opts.total&&last?0:running;
const to=opts.total&&last?running+value:running+value;
if(!(opts.total&&last))running+=value;
else running+=value;
const top=yScale.of(Math.max(from,to));
const bottom=yScale.of(Math.min(from,to));
const rect=opts.pool.next('rect',`${NS}__bar ${NS}__mark`);
attrs(rect,{
x:round(xScale.of(point.x)),
y:round(top),
width:round(xScale.bandwidth),
height:round(Math.max(1,bottom-top)),
fill:value>=0?opts.positive:opts.negative,
'data-series':opts.index,
'data-point':i,
});
point.px=round(xScale.of(point.x)+xScale.bandwidth/2);
point.py=round(top);
}
}
function drawHorizontalBars(opts){
const{series,valueScale,baseline,colour,stack,slot}=opts;
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const top=opts.bandScale.of(point.x);
if(Number.isNaN(top))continue;
const value=(point.y);
const span=stack?stack.take(i,value):[baseline,value];
const from=valueScale.of(span[0]);
const to=valueScale.of(span[1]);
attrs(opts.pool.next('rect',`${NS}__bar ${NS}__mark`),{
x:round(Math.min(from,to)),
y:round(top+slot.offset),
width:round(Math.max(1,Math.abs(to-from))),
height:round(Math.max(0,slot.width)),
fill:colour,
'data-series':opts.index,
'data-point':i,
});
point.px=round(to);
point.py=round(top+slot.offset+slot.width/2);
point.pbase=round(from);
}
}
function drawFits(opts){
const doc=opts.group.ownerDocument;
let host=null;
for(const child of opts.group.childNodes||[]){
if(child&&String(child.getAttribute&&child.getAttribute('class'))===`${NS}__fits`){
host=child;
break;
}
}
if(!host){
host=doc.createElementNS(SVG_NS,'g');
host.setAttribute('class',`${NS}__fits`);
opts.group.appendChild(host);
}
const pool=new Pool(host);
const fits=[];
for(const series of opts.series){
let n=0;
let sx=0;
let sy=0;
for(const point of series.points){
const x=Number(point.x);
const y=Number(point.y);
if(!Number.isFinite(x)||!Number.isFinite(y))continue;
n++;
sx+=x;
sy+=y;
}
if(n<2)continue;
const mx=sx/n;
const my=sy/n;
let sxx=0;
let sxy=0;
let syy=0;
let lowest=Infinity;
let highest=-Infinity;
for(const point of series.points){
const x=Number(point.x);
const y=Number(point.y);
if(!Number.isFinite(x)||!Number.isFinite(y))continue;
const dx=x-mx;
const dy=y-my;
sxx+=dx*dx;
sxy+=dx*dy;
syy+=dy*dy;
if(x<lowest)lowest=x;
if(x>highest)highest=x;
}
if(sxx===0)continue;
const slope=sxy/sxx;
const intercept=my-slope*mx;
const r2=syy===0?1:Math.max(0,Math.min(1,(sxy*sxy)/(sxx*syy)));
const colour=opts.scheme.series(series.index);
attrs(pool.next('path',`${NS}__fit`),{
d:path([
'M',round(opts.xScale.of(lowest)),round(opts.yScale.of(intercept+slope*lowest)),
'L',round(opts.xScale.of(highest)),round(opts.yScale.of(intercept+slope*highest)),
]),
fill:'none',
stroke:colour,
'data-series':series.index,
});
if(opts.showR2){
const text=pool.next('text',`${NS}__fit-label`);
applySize(text,opts.size);
attrs(text,{
x:round(opts.xScale.of(highest)),
y:round(opts.yScale.of(intercept+slope*highest))-4,
'text-anchor':'end',
fill:colour,
});
setText(text,`R² ${r2.toFixed(2)}`);
}
fits.push({key:series.key,slope,intercept,r2,n});
}
pool.finish();
return fits;
}
function drawConfidenceBand(opts){
const doc=opts.group.ownerDocument;
let host=null;
for(const child of opts.group.childNodes||[]){
if(child&&String(child.getAttribute&&child.getAttribute('class'))===`${NS}__band`){
host=child;
break;
}
}
if(!host){
host=doc.createElementNS(SVG_NS,'g');
host.setAttribute('class',`${NS}__band`);
if(opts.group.firstChild)opts.group.insertBefore(host,opts.group.firstChild);
else opts.group.appendChild(host);
}
const pool=new Pool(host);
const raw=(opts.band&&Array.isArray(opts.band.points))?opts.band.points:[];
const index=Number.isFinite(opts.index)?Number(opts.index):0;
const colour=opts.scheme.series(index);
const opacity=Number.isFinite(opts.opacity)?Number(opts.opacity):0.15;
const usable=[];
for(const point of raw){
const x=Number(point.x);
const lower=Number(point.lower);
const upper=Number(point.upper);
if(!Number.isFinite(x)||!Number.isFinite(lower)||!Number.isFinite(upper))continue;
const yhat=Number(point.yhat);
usable.push({
x:round(opts.xScale.of(x)),
lower:round(opts.yScale.of(lower)),
upper:round(opts.yScale.of(upper)),
yhat:Number.isFinite(yhat)?round(opts.yScale.of(yhat)):null,
});
}
if(usable.length>=2){
attrs(pool.next('path',`${NS}__band-fill`),{
d:ribbonPath(usable),
fill:colour,
'fill-opacity':opacity,
stroke:'none',
'data-series':index,
});
if(opts.line!==false){
const line=[];
let open=false;
for(const point of usable){
if(point.yhat===null){open=false;continue;}
line.push(open?'L':'M',point.x,point.yhat);
open=true;
}
attrs(pool.next('path',`${NS}__band-line`),{
d:line.length?path(line):'',
fill:'none',
stroke:colour,
'data-series':index,
});
}
}
pool.finish();
return{
points:usable.length,
confidence:(opts.band&&Number.isFinite(opts.band.confidence))?Number(opts.band.confidence):null,
};
}
function drawBoundErrorBars(opts){
const doc=opts.group.ownerDocument;
let host=null;
for(const child of opts.group.childNodes||[]){
if(child&&String(child.getAttribute&&child.getAttribute('class'))===`${NS}__whiskers`){
host=child;
break;
}
}
if(!host){
host=doc.createElementNS(SVG_NS,'g');
host.setAttribute('class',`${NS}__whiskers`);
opts.group.appendChild(host);
}
const pool=new Pool(host);
const cap=Number.isFinite(opts.cap)?Number(opts.cap):4;
const colour=opts.colour||'currentColor';
const horizontal=opts.orient!=='v';
let drawn=0;
for(const point of opts.points||[]){
const main=Number(point.main);
const lo=Number(point.lo);
const hi=Number(point.hi);
if(!Number.isFinite(main)||!Number.isFinite(lo)||!Number.isFinite(hi))continue;
const d=horizontal
?['M',lo,main,'L',hi,main,
'M',lo,main-cap,'L',lo,main+cap,
'M',hi,main-cap,'L',hi,main+cap]
:['M',main,lo,'L',main,hi,
'M',main-cap,lo,'L',main+cap,lo,
'M',main-cap,hi,'L',main+cap,hi];
attrs(pool.next('path',`${NS}__whisker`),{d:path(d),stroke:colour,fill:'none'});
drawn++;
}
pool.finish();
return drawn;
}
function drawForest(ctx){
const scheme=ctx.scheme||resolveScheme();
const type_=ctx.typography||{small:ctx.fontSize||11,axisTitle:11};
const{plot,bound}=ctx;
const points=(bound.series[0]&&bound.series[0].points)||[];
const labels=points.map((p)=>p.label);
const colour=scheme.series(0);
const yScale=bandScale(labels,[plot.top,plot.bottom],0.4);
const values=[0];
for(const p of points){
for(const v of[p.x,p.lower,p.upper])if(Number.isFinite(v))values.push(v);
}
const xScale=linearScale(measureDomain(values,{zero:false}),[plot.left,plot.right]);
drawBoundErrorBars({
group:ctx.groups.overlay,
orient:'h',
colour,
points:points.map((p)=>({
main:round(yScale.centre(p.label)),
lo:round(xScale.of(p.lower)),
hi:round(xScale.of(p.upper)),
})),
});
const marks=new Pool(ctx.groups.marks);
let drawn=0;
for(const p of points){
if(!Number.isFinite(p.x))continue;
attrs(marks.next('circle',`${NS}__point ${NS}__mark`),{
cx:round(xScale.of(p.x)),
cy:round(yScale.centre(p.label)),
r:POINT_RADIUS,
fill:colour,
});
drawn++;
}
marks.finish();
drawReferenceLines({
group:ctx.groups.rules,plot,scale:xScale,lines:[{value:0}],
});
drawContinuousAxis({
group:ctx.groups.axis,
plot,
scale:xScale,
format:formatters(ctx.grid,{
kind:'linear',step:(xScale.domain.max-xScale.domain.min)/5,
}),
config:{},
grid:ctx.grid,
size:type_.small,
});
drawBandLabels({
group:ctx.groups.labels,
plot,
scale:yScale,
labels,
fontSize:type_.small,
config:{},
});
return{series:[],marks:drawn};
}
function drawReferenceLines(opts){
const pool=new Pool(overlayLayer(opts.group,`${NS}__reflines`));
for(const line of opts.lines||[]){
if(!isNumber(line.value))continue;
const at=round(opts.scale.of(line.value));
attrs(pool.next('path',`${NS}__reference`),{
d:path(['M',round(opts.plot.left),at,'L',round(opts.plot.right),at]),
stroke:line.colour||'currentColor',
'stroke-dasharray':'4 3',
fill:'none',
});
if(!line.label)continue;
const text=pool.next('text',`${NS}__reference-label`);
attrs(text,{
x:round(opts.plot.right-4),y:at-4,'text-anchor':'end',
});
setText(text,line.label);
}
pool.finish();
}
function drawPoints(opts){
const{series,xScale,yScale,colour}=opts;
const size=opts.size||null;
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const x=round(xOf(xScale,point));
if(Number.isNaN(x))continue;
const y=round(yScale.of((point.y)));
attrs(opts.pool.next('circle',`${NS}__point ${NS}__mark`),{
cx:x,
cy:y,
r:size&&isNumber(point.size)?round(size.of((point.size))):POINT_RADIUS,
fill:colour,
'fill-opacity':size?0.7:1,
'data-series':opts.index,
'data-point':i,
});
point.px=x;
point.py=y;
}
}
function drawErrorBars(ctx){
const{group,series,xScale,yScale,options}=ctx;
const stats=ctx.grid&&ctx.grid.statistics;
const interval=stats&&typeof stats.intervalOf==='function'
?(values,conf)=>stats.intervalOf(values,conf)
:null;
const pool=new Pool(overlayLayer(group,`${NS}__errorbars`));
const conf=Number.isFinite(Number(options.confidence))?Number(options.confidence):0.95;
const cap=4;
let drawn=0;
let marks=0;
let single=0;
let singleSkipped=0;
for(const sery of series){
for(const point of sery.points){
if(point.y===null||point.y===undefined)continue;
marks++;
const singleReading=Array.isArray(point.values)&&point.values.length===1;
if(singleReading)single++;
let lower=null;
let upper=null;
if(options.of!==undefined&&Number.isFinite(Number(point[options.of]))){
const margin=Math.abs(Number(point[options.of]));
lower=point.y-margin;
upper=point.y+margin;
}else if(Array.isArray(point.values)&&point.values.length>1&&interval){
const ci=interval(point.values,conf);
if(ci){lower=ci.lower;upper=ci.upper;}
}
if(lower===null||!Number.isFinite(lower)||!Number.isFinite(upper)){
if(singleReading)singleSkipped++;
continue;
}
const x=round(xScale.of(point.xKey!==undefined?point.xKey:point.x)
+(xScale.bandwidth?xScale.bandwidth/2:0));
const top=round(yScale.of(upper));
const bottom=round(yScale.of(lower));
attrs(pool.next('path',`${NS}__error-bar ${NS}__mark`),{
d:path([
'M',x-cap,top,'L',x+cap,top,
'M',x,top,'L',x,bottom,
'M',x-cap,bottom,'L',x+cap,bottom,
]),
fill:'none',
stroke:'currentColor',
'data-lower':lower,
'data-upper':upper,
});
drawn++;
}
}
pool.finish();
return{drawn,marks,single,singleSkipped};
}
function drawCartesian(ctx){
const scheme=ctx.scheme||resolveScheme();
const axisConfig=ctx.axis||{x:{},y:{},y2:{}};
const type_=ctx.typography||{small:ctx.fontSize||11,axisTitle:11};
const{bound,plot,type}=ctx;
const shape=CARTESIAN[type]||CARTESIAN.line;
const visible=bound.series.filter((s)=>!ctx.hidden.has(s.key));
const horizontal=!!shape.horizontal;
const rightSeries=(!horizontal&&type!=='waterfall')
?visible.filter((s)=>s.axis==='right')
:[];
const leftSeries=rightSeries.length
?visible.filter((s)=>s.axis!=='right')
:visible;
const dual=rightSeries.length>0;
const stackable=(type==='bar'||type==='area'||type==='horizontalBar')&&!dual;
const percent=ctx.stack==='percent'&&stackable&&leftSeries.length>1;
const stacked=(percent||!!ctx.stack)&&leftSeries.length>1&&stackable;
const spread=type==='waterfall'
?runningExtent(visible[0])
:measureValues(leftSeries,stacked,percent);
const yDomain=ctx.domain||measureDomain(spread,{
zero:shape.zero,
min:axisConfig.y.min,
max:axisConfig.y.max,
});
const yScale=horizontal
?linearScale(yDomain,[plot.left,plot.right])
:linearScale(yDomain,[plot.bottom,plot.top]);
const xScale=horizontal
?bandScale(bound.categories,[plot.top,plot.bottom],0.2)
:xScaleFor(bound,plot,type,axisConfig.x);
const baseline=yDomain.min<=0&&yDomain.max>=0?0:yDomain.min;
const rightZero=rightSeries.some((s)=>(s.mark||(type==='bar'?'bar':type))==='bar');
const rightDomain=dual
?measureDomain(measureValues(rightSeries,false,false),{
zero:rightZero,
min:axisConfig.y2.min,
max:axisConfig.y2.max,
})
:null;
const rightScale=rightDomain
?linearScale(rightDomain,[plot.bottom,plot.top])
:null;
const yFormat=formatters(ctx.grid,{
kind:'linear',
step:(yDomain.max-yDomain.min)/5,
});
const axes=ctx.axes!==false;
if(axes){
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:yFormat,
horizontal,
config:axisConfig.y,
grid:ctx.grid,
size:type_.small,
});
}
if(!axes){
}else if(horizontal){
drawBandLabels({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels:bound.labels,
fontSize:type_.small,
config:axisConfig.x,
});
}else if(xScale.kind==='band'){
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels:bound.labels,
fontSize:type_.small,
rotated:shouldRotate(bound.labels,xScale.step,type_.small,axisConfig.x.every),
config:axisConfig.x,
});
}else{
drawContinuousAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
format:formatters(ctx.grid,{
kind:bound.kind,
span:xScale.domain.max-xScale.domain.min,
step:(xScale.domain.max-xScale.domain.min)/5,
}),
config:axisConfig.x,
grid:ctx.grid,
size:type_.small,
});
}
if(axes){
drawAxisLines({group:ctx.groups.rules,plot});
drawAxisTitle({
group:ctx.groups.axis,plot,text:axisConfig.y.title,side:'left',size:type_.axisTitle,
});
drawAxisTitle({
group:ctx.groups.axis,plot,text:axisConfig.x.title,side:'bottom',size:type_.axisTitle,
});
}
if(axes&&rightScale){
drawRightAxis({
group:ctx.groups.axis,
plot,
scale:rightScale,
colour:scheme.series(rightSeries[0].index),
format:formatters(ctx.grid,{
kind:'linear',step:(rightDomain.max-rightDomain.min)/5,
}),
});
const rightTitle=axisConfig.y2.title
||(rightSeries.length===1?rightSeries[0].label:'');
drawAxisTitle({
group:ctx.groups.axis,plot,text:rightTitle,side:'right',size:type_.axisTitle,
});
if(!axisConfig.y.title&&leftSeries.length===1&&leftSeries[0].label){
drawAxisTitle({
group:ctx.groups.axis,plot,text:leftSeries[0].label,side:'left',size:type_.axisTitle,
});
}
}
const target=Number.isFinite(ctx.downsampleTo)
?Number(ctx.downsampleTo)
:Math.max(2,Math.round(plot.width));
let reduced=false;
if(shape.marks==='path'||type==='scatter'||type==='bubble'){
for(const series of visible){
series.kept=null;
if(series.points.length>target*1.5){
const indexed=series.points.map((point,i)=>({x:i,y:point.y,point}));
const picked=downsample(indexed,target);
series.points=picked.map((entry)=>entry.point);
series.kept=picked.map((entry)=>entry.x);
reduced=true;
}
}
}
if(!ctx.pool)setPlotClip(ctx.groups,plot,overhangFor(type));
const pool=ctx.pool||new Pool(ctx.groups.marks);
const totals=percent
?bound.categories.map((unused,i)=>visible.reduce((t,series)=>{
const v=series.points[i]?series.points[i].y:null;
return isNumber(v)?t+Math.abs((v)):t;
},0))
:null;
const stack=stacked?stacker(bound.categories.length,totals):null;
const barSeries=dual
?visible.filter((s)=>(s.mark||(type==='bar'?'bar':type))==='bar')
:visible;
const slotDenominator=dual
?Math.max(1,barSeries.length)
:Math.max(1,visible.length);
const slotWidth=xScale.kind==='band'
?(stacked?xScale.bandwidth:xScale.bandwidth/slotDenominator)
:0;
const barOrder=new Map();
for(const s of barSeries)barOrder.set(s.key,barOrder.size);
for(let i=0;i<visible.length;i++){
const series=visible[i];
const colour=scheme.series(series.index);
const scale=series.axis==='right'&&rightScale?rightScale:yScale;
const mark=dual?(series.mark||(type==='bar'?'bar':type)):type;
const slotIndex=dual
?(barOrder.has(series.key)?barOrder.get(series.key):i)
:i;
if(type==='horizontalBar'){
drawHorizontalBars({
pool,
series,
bandScale:xScale,
valueScale:yScale,
baseline,
colour,
stack,
index:series.index,
slot:{offset:stacked?0:i*slotWidth,width:slotWidth},
});
}else if(type==='waterfall'){
drawWaterfall({
pool,series,xScale,yScale,index:series.index,total:true,
positive:scheme.positive,negative:scheme.negative,
});
}else if(mark==='bar'){
drawBars({
pool,
series,
xScale,
yScale:scale,
baseline:scale===rightScale?(rightDomain.min<=0&&rightDomain.max>=0?0:rightDomain.min):baseline,
colour,
stack,
index:series.index,
slot:{offset:stacked?0:slotIndex*slotWidth,width:slotWidth},
});
}else if(type==='scatter'||type==='bubble'){
drawPoints({
pool,series,xScale,yScale:scale,colour,index:series.index,
size:type==='bubble'?ctx.sizes:null,
});
}else{
drawPath({
pool,
series,
xScale,
yScale:scale,
baseline,
fill:mark==='area'||mark==='rangeArea',
step:mark==='step',
colour,
stack,
index:series.index,
});
}
}
if(!ctx.pool)pool.finish();
if(ctx.band&&typeof xScale.invert==='function'){
drawConfidenceBand({
group:ctx.groups.overlay,
band:ctx.band,
xScale,
yScale,
scheme,
index:0,
line:ctx.band.line!==false&&!ctx.fit,
});
}
if(ctx.fit&&(type==='scatter'||type==='bubble')&&typeof xScale.invert==='function'){
drawFits({
group:ctx.groups.overlay,
series:visible,
xScale,
yScale,
plot,
scheme,
grid:ctx.grid,
size:type_.small,
showR2:ctx.fit!=='line',
});
}
let trendlines=null;
if(ctx.trend){
trendlines=drawTrendlines({
group:ctx.groups.overlay,
series:visible,
xScale,
yScale,
rightScale,
plot,
scheme,
trend:ctx.trend,
format:(v)=>yFormat.tick(v),
size:type_.small,
clip:ctx.groups.boxClipId,
});
}
let errorBars=null;
if(ctx.error){
errorBars=drawErrorBars({
group:ctx.groups.overlay,
series:visible,
xScale,
yScale,
grid:ctx.grid,
options:ctx.error===true?{}:ctx.error,
});
}
if(ctx.labels&&ctx.labels.show){
drawDataLabels({
group:ctx.groups.labels,
series:visible,
plot,
options:ctx.labels,
grid:ctx.grid,
size:type_.small,
horizontal,
});
}
if(ctx.reference&&ctx.reference.length){
const leftLines=ctx.reference.filter((l)=>!(l.axis==='right'||l.axis==='y2'));
const rightLines=rightScale
?ctx.reference.filter((l)=>l.axis==='right'||l.axis==='y2')
:[];
if(leftLines.length){
drawReferenceLines({
group:ctx.groups.overlay,plot,scale:yScale,lines:leftLines,
});
}
if(rightLines.length){
drawReferenceLines({
group:ctx.groups.overlay,plot,scale:rightScale,lines:rightLines,
});
}
}
let annotations=null;
if(ctx.annotations&&ctx.annotations.length){
annotations=drawAnnotations({
group:ctx.groups.overlay,
plot,
xScale,
yScale,
rightScale,
series:visible,
annotations:ctx.annotations,
dual,
format:(v)=>yFormat.tick(v),
size:type_.small,
});
}
const describedAll=(Array.isArray(trendlines)&&trendlines.length)
?[...(annotations||[]),...trendlines]
:annotations;
return{
xScale,
yScale,
rightScale,
dual,
series:visible,
horizontal,
percent,
plot,
errorBars,
annotations:describedAll,
trendlines,
reduced,
};
}
const HIT_TOLERANCE=32;
function nearestDrawnPoint(opts){
const{series,xScale,at}=opts;
const tolerance=Number.isFinite(opts.tolerance)?Number(opts.tolerance):HIT_TOLERANCE;
const entries=[];
let index=-1;
let best=Infinity;
for(const one of series){
let near=null;
let nearAt=-1;
let nearest=Infinity;
const points=one.points||[];
for(let i=0;i<points.length;i++){
const point=points[i];
if(!point||!isNumber(point.y))continue;
const px=xOf(xScale,point);
if(Number.isNaN(px))continue;
const distance=Math.abs(px-at);
if(distance>=nearest)continue;
nearest=distance;
near=point;
nearAt=Array.isArray(one.kept)?one.kept[i]:i;
}
if(!near||nearest>tolerance)continue;
entries.push({series:one,point:near});
if(nearest<best){
best=nearest;
index=nearAt;
}
}
if(index<0)return null;
return{index,entries};
}
function nearestCategory(opts){
const{bound,xScale,at}=opts;
if(!bound.categories.length)return-1;
if(xScale.kind==='band'){
const index=Math.floor((at-xScale.range[0])/(xScale.step||1));
return index>=0&&index<bound.categories.length?index:-1;
}
let best=-1;
let bestDistance=Infinity;
for(let i=0;i<bound.categories.length;i++){
const n=xScale.kind==='time'?toTime(bound.categories[i]):toNumber(bound.categories[i]);
if(n===null)continue;
const distance=Math.abs(xScale.of(n)-at);
if(distance<bestDistance){
bestDistance=distance;
best=i;
}
}
return best;
}
function categoryKeyAt(bound,index){
if(index<0||index>=bound.categories.length)return'';
return key(bound.categories[index]);
}
});
__def("packages/modules/charts/bind.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"AGGREGATIONS",{enumerable:true,get:function(){return AGGREGATIONS;}});
Object.defineProperty(__exports,"DEFAULT_AGGREGATION",{enumerable:true,get:function(){return DEFAULT_AGGREGATION;}});
Object.defineProperty(__exports,"resolveAggregation",{enumerable:true,get:function(){return resolveAggregation;}});
Object.defineProperty(__exports,"defaultAggregationFor",{enumerable:true,get:function(){return defaultAggregationFor;}});
Object.defineProperty(__exports,"measureOf",{enumerable:true,get:function(){return measureOf;}});
Object.defineProperty(__exports,"walkRows",{enumerable:true,get:function(){return walkRows;}});
Object.defineProperty(__exports,"leafRows",{enumerable:true,get:function(){return leafRows;}});
Object.defineProperty(__exports,"selectedRows",{enumerable:true,get:function(){return selectedRows;}});
Object.defineProperty(__exports,"topGroups",{enumerable:true,get:function(){return topGroups;}});
Object.defineProperty(__exports,"forcedScaleKind",{enumerable:true,get:function(){return forcedScaleKind;}});
Object.defineProperty(__exports,"scaleKindFor",{enumerable:true,get:function(){return scaleKindFor;}});
Object.defineProperty(__exports,"bindSeries",{enumerable:true,get:function(){return bindSeries;}});
Object.defineProperty(__exports,"bindPoints",{enumerable:true,get:function(){return bindPoints;}});
Object.defineProperty(__exports,"bindMeasures",{enumerable:true,get:function(){return bindMeasures;}});
Object.defineProperty(__exports,"bindLinks",{enumerable:true,get:function(){return bindLinks;}});
Object.defineProperty(__exports,"bindHierarchy",{enumerable:true,get:function(){return bindHierarchy;}});
const __m0=__req("packages/modules/charts/scale.js");
const key=__m0["key"];
const toNumber=__m0["toNumber"];
const toTime=__m0["toTime"];
const __m1=__req("packages/core/src/internal/util.js");
const warnOnce=__m1["warnOnce"];
const AGGREGATIONS={
sum:(v)=>(v.length?v.reduce((t,n)=>t+n,0):null),
avg:(v)=>(v.length?v.reduce((t,n)=>t+n,0)/v.length:null),
mean:(v)=>(v.length?v.reduce((t,n)=>t+n,0)/v.length:null),
min:(v)=>{
let found=null;
for(let i=0;i<v.length;i++)if(found===null||v[i]<found)found=v[i];
return found;
},
max:(v)=>{
let found=null;
for(let i=0;i<v.length;i++)if(found===null||v[i]>found)found=v[i];
return found;
},
median:(v)=>{
if(!v.length)return null;
const sorted=v.slice().sort((a,b)=>a-b);
const mid=(sorted.length-1)/2;
const lo=Math.floor(mid);
const hi=Math.ceil(mid);
return lo===hi?sorted[lo]:(sorted[lo]+sorted[hi])/2;
},
count:(v,rows)=>rows,
countValues:(v)=>v.length,
first:(v)=>(v.length?v[0]:null),
last:(v)=>(v.length?v[v.length-1]:null),
};
const DEFAULT_AGGREGATION='sum';
function resolveAggregation(fn){
if(fn===undefined||fn===null)return DEFAULT_AGGREGATION;
if(typeof fn==='string'&&fn in AGGREGATIONS)return fn;
warnOnce(
`chart:measure:fn:${String(fn)}`,
`chart measure fn ${JSON.stringify(fn)} is not a known aggregation; `
+`using '${DEFAULT_AGGREGATION}'. Supported: ${Object.keys(AGGREGATIONS).join(', ')}.`,
);
return DEFAULT_AGGREGATION;
}
function defaultAggregationFor(column){
if(!column)return DEFAULT_AGGREGATION;
const declared=column.groupTotal??column.total;
if(typeof declared==='string'&&declared in AGGREGATIONS)return declared;
const supported=column.dataType&&column.dataType.totals
?column.dataType.totals.supported:null;
if(Array.isArray(supported)&&!supported.includes(DEFAULT_AGGREGATION)){
const pick=['avg','mean','max','min','countValues','count']
.find((name)=>supported.includes(name)&&name in AGGREGATIONS);
if(pick)return pick;
}
return DEFAULT_AGGREGATION;
}
function measureOf(y,column){
const fallback=defaultAggregationFor(column);
if(!y)return{col:null,fn:fallback};
if(typeof y==='string')return{col:y,fn:fallback};
return{col:y.col||null,fn:y.fn==null?fallback:resolveAggregation(y.fn)};
}
function walkRows(grid,visit){
const seen=new Set();
const descend=(row)=>{
if(!row||seen.has(row))return;
seen.add(row);
visit(row);
if(!row.group)return;
if(row.expanded)return;
const children=row.filteredChildren||row.children;
if(Array.isArray(children))for(const child of children)descend(child);
};
grid.rows.forEach(descend);
}
function leafRows(grid){
const out=[];
walkRows(grid,(row)=>{
if(!row.group&&row.data!==null&&row.data!==undefined)out.push(row);
});
return out;
}
function selectedRows(grid){
const keys=new Set(grid.selection.keys());
if(!keys.size)return[];
const out=[];
walkRows(grid,(row)=>{
if(!row.group&&keys.has(row.key))out.push(row);
});
return out;
}
function topGroups(grid){
const out=[];
let level=Infinity;
walkRows(grid,(row)=>{
if(!row.group)return;
if(row.level<level){
level=row.level;
out.length=0;
}
if(row.level===level)out.push(row);
});
return out;
}
function measureValue(grid,row,col){
if(row.group&&row.totals&&col in row.totals)return toNumber(row.totals[col]);
return toNumber(grid.rows.value(row.key,col));
}
function categoryLabel(grid,row,col,value){
if(!row.group){
const text=grid.rows.text(row.key,col);
if(text)return text;
}
if(value===null||value===undefined)return'';
if(value instanceof Date)return value.toISOString().slice(0,10);
return String(value);
}
function reduce(bucket,fn){
const kernel=AGGREGATIONS[fn]||AGGREGATIONS[DEFAULT_AGGREGATION];
return kernel(bucket.values,bucket.rows);
}
const NUMERIC_TYPES=Object.freeze(['number','currency','percent']);
const TEMPORAL_TYPES=Object.freeze(['date','datetime','timestamp','dateString']);
const SCALE_CHOICES=Object.freeze({
auto:'',band:'category',category:'category',linear:'linear',time:'time',
});
function forcedScaleKind(spec){
const axis=spec&&typeof spec==='object'?spec.axis:null;
if(!axis||typeof axis!=='object')return'';
const x=axis.x;
if(!x||typeof x!=='object')return'';
const asked=typeof x.scale==='string'?x.scale:'';
if(!asked)return'';
if(!Object.hasOwn(SCALE_CHOICES,asked)){
warnOnce(
`chart:x:scale:unknown:${asked}`,
`chart axis.x.scale ${JSON.stringify(asked)} is not a scale this chart draws. `
+`Use one of: ${Object.keys(SCALE_CHOICES).join(', ')}. The scale was chosen from `
+'the column instead.',
);
return'';
}
return SCALE_CHOICES[asked];
}
function looksContinuous(values){
if(values.length<3)return'';
let numbers=0;
let times=0;
for(const v of values){
if(v===null||v===undefined||v==='')return'';
if(typeof v==='boolean')return'';
if(toNumber(v)!==null)numbers++;
else if(typeof v==='string'&&toTime(v)!==null)times++;
}
if(times===values.length)return'time';
if(numbers===values.length)return'linear';
return'';
}
function scaleKindFor(column,values,opts={}){
if(opts.forced)return opts.forced;
const type=column&&typeof column.type==='string'?column.type:'';
if(TEMPORAL_TYPES.includes(type))return'time';
if(values.length&&values.every((v)=>v instanceof Date))return'time';
if(NUMERIC_TYPES.includes(type))return'linear';
const id=opts.id?String(opts.id):'';
if(!id)return'category';
const shape=type&&type!=='text'?'':looksContinuous(values);
if(shape){
warnOnce(
`chart:x:banded:${id}`,
`chart x column ${JSON.stringify(id)} is typed ${JSON.stringify(type||'text')}, so its `
+`${values.length} values are drawn as categories on a band scale even though they all `
+`read as ${shape==='time'?'dates':'numbers'}. Type the column `
+`${shape==='time'?"'date' (or 'datetime'/'timestamp'/'dateString')":"'number'"} `
+`for a continuous axis, or pin it with axis: { x: { scale: '${shape}' } }.`,
);
}
return'category';
}
function bindSeries(grid,spec){
const dimensionId=spec.x||null;
const seriesId=spec.series
||(typeof spec.multiples==='string'?spec.multiples:null)
||null;
const columns=grid.columns;
const dimensionColumn=dimensionId?columns.get(dimensionId):undefined;
const named=measureOf(spec.y);
const measureColumn=named.col?columns.get(named.col):undefined;
const measure=measureOf(spec.y,measureColumn);
let source;
const given=typeof spec.rows==='function'?spec.rows(grid):spec.rows;
if(Array.isArray(given))source=given;
else if(spec.from==='groups')source=topGroups(grid);
else if(spec.from==='selection')source=selectedRows(grid);
else source=leafRows(grid);
const rows=source.length?source:leafRows(grid);
const categories=new Map();
const series=new Map();
const seenValues=[];
for(let i=0;i<rows.length;i++){
const row=rows[i];
const rawX=dimensionId
?(row.group&&row.groupColumn===dimensionId?row.groupValue:grid.rows.value(row.key,dimensionId))
:i;
const categoryKey=key(rawX);
if(!categories.has(categoryKey)){
categories.set(categoryKey,{
value:rawX,
label:dimensionId?categoryLabel(grid,row,dimensionId,rawX):String(i),
order:categories.size,
});
seenValues.push(rawX);
}
const rawSeries=seriesId
?(row.group&&row.groupColumn===seriesId?row.groupValue:grid.rows.value(row.key,seriesId))
:null;
const sKey=seriesId?key(rawSeries):'';
if(!series.has(sKey)){
series.set(sKey,{
label:seriesId?categoryLabel(grid,row,seriesId,rawSeries):(measureColumn?.title||''),
points:new Map(),
});
}
const bucket=series.get(sKey);
let point=bucket.points.get(categoryKey);
if(!point){
point={values:[],rows:0,rowKey:row.key};
bucket.points.set(categoryKey,point);
}
point.rows+=row.group?(row.leafCount||1):1;
const value=measure.col?measureValue(grid,row,measure.col):null;
if(value!==null)point.values.push(value);
if(spec.size){
const extra=toNumber(grid.rows.value(row.key,spec.size));
if(extra!==null)point.sizes=(point.sizes||0)+extra;
}
}
const ordered=[...categories.values()].sort((a,b)=>a.order-b.order);
const taken=typeof spec.limit==='number'&&spec.limit>0
?ordered.slice(0,spec.limit)
:ordered;
const kind=scaleKindFor(dimensionColumn,seenValues,{
forced:forcedScaleKind(spec),id:dimensionId,
});
if(kind==='time'&&rows.length>1&&categories.size===1
&&dimensionColumn&&(dimensionColumn.type==='date'||dimensionColumn.type==='dateString')){
warnOnce(
`chart:x:date-bucket:${dimensionId}`,
`chart x column ${JSON.stringify(dimensionId)} is a 'date', which stores a calendar `
+`day, so all ${rows.length} rows collapsed into one point and were reduced by `
+`'${measure.fn}'. For a series inside a single day, type the column 'datetime' `
+'or bind epoch milliseconds.',
);
}
const numeric=NUMERIC_TYPES.includes(
dimensionColumn&&typeof dimensionColumn.type==='string'?dimensionColumn.type:'',
);
const limited=numeric
?[...taken].sort((a,b)=>(toNumber(a.value)??0)-(toNumber(b.value)??0))
:taken;
const out=[...series.entries()].map(([sKey,bucket],index)=>({
key:sKey,
label:bucket.label,
index,
points:limited.map((category)=>{
const cKey=key(category.value);
const point=bucket.points.get(cKey);
return{
x:category.value,
xKey:cKey,
label:category.label,
y:point?reduce(point,measure.fn):null,
size:point&&point.sizes!==undefined?point.sizes:null,
rows:point?point.rows:0,
rowKey:point?point.rowKey:null,
values:point&&point.values?point.values:null,
};
}),
}));
return{
series:out,
categories:limited.map((c)=>c.value),
labels:limited.map((c)=>c.label),
kind,
measure:{...measure,title:measureColumn?.title||measure.col||''},
dimension:{col:dimensionId,title:dimensionColumn?.title||dimensionId||''},
empty:out.length===0||limited.length===0,
rows:rows.length,
truncated:ordered.length-limited.length,
};
}
function bindPoints(spec){
const raw=Array.isArray(spec.points)?spec.points:[];
const numericX=raw.length>0
&&raw.every((p)=>typeof p.x==='number'&&Number.isFinite(p.x));
const num=(v)=>(typeof v==='number'&&Number.isFinite(v)?v:null);
const points=raw.map((p,i)=>({
x:p.x,
xKey:key(p.x),
label:p.label!=null?String(p.label):String(p.x),
y:num(p.y),
size:num(p.size),
lower:num(p.lower),
upper:num(p.upper),
rows:1,
rowKey:p.key!=null?String(p.key):String(i),
values:null,
}));
return{
series:[{
key:spec.seriesKey||'',label:spec.seriesLabel||'',index:0,points,
}],
categories:points.map((p)=>p.x),
labels:points.map((p)=>p.label),
kind:numericX?'linear':'category',
measure:{col:null,fn:'sum',title:spec.measureTitle||''},
dimension:{col:null,title:spec.dimensionTitle||''},
empty:points.length===0,
rows:points.length,
truncated:0,
};
}
function bindMeasures(grid,spec){
const wanted=Array.isArray(spec.measures)?spec.measures:[];
if(!wanted.length)return bindSeries(grid,spec);
const bound=wanted.map((entry)=>{
const measure=typeof entry==='string'?{col:entry}:entry;
return{
spec:measure,
result:bindSeries(grid,{
x:spec.x,from:spec.from,limit:spec.limit,
y:{col:measure.col,fn:measure.fn},
}),
};
});
const first=bound[0].result;
const index=new Map(first.categories.map((value,i)=>[key(value),i]));
const series=bound.map(({spec:measure,result},i)=>{
const column=grid.columns.get(measure.col);
const aligned=first.categories.map(()=>null);
const source=result.series[0];
if(source){
for(const point of source.points){
const at=index.get(point.xKey);
if(at!==undefined)aligned[at]=point;
}
}
return{
key:measure.col,
label:measure.label||(column&&column.title)||measure.col,
index:i,
mark:measure.type||null,
axis:measure.axis==='right'?'right':'left',
points:first.categories.map((value,at)=>aligned[at]||{
x:value,xKey:key(value),label:first.labels[at],y:null,rows:0,rowKey:null,
}),
};
});
return{
series,
categories:first.categories,
labels:first.labels,
kind:first.kind,
measure:{col:null,fn:'sum',title:series.map((sery)=>sery.label).join(', ')},
dimension:first.dimension,
empty:!series.length||!first.categories.length,
rows:first.rows,
truncated:first.truncated,
};
}
function bindLinks(grid,spec,opts={}){
const measure=measureOf(spec.y);
const perRow=!!opts.perRow;
const declared=Array.isArray(opts.nodes)?opts.nodes:[];
const sourceCol=spec.source||spec.x||null;
const targetCol=spec.target||null;
if(!sourceCol||!targetCol){
return{
nodes:[],
links:[],
measure:{...measure,title:''},
dimension:{col:null,title:''},
series:[],
categories:[],
labels:[],
empty:true,
total:0,
};
}
const measureColumn=measure.col?grid.columns.get(measure.col):undefined;
const nodes=new Map();
const links=new Map();
const node=(value,row,column)=>{
const id=key(value);
if(!nodes.has(id)){
nodes.set(id,{
key:id,
value,
label:categoryLabel(grid,row,column,value),
index:nodes.size,
in:0,
out:0,
});
}
return nodes.get(id);
};
const byId=new Map();
for(const spot of declared){
if(!spot||spot.id===null||spot.id===undefined)continue;
byId.set(key(spot.id),spot);
}
for(const row of leafRows(grid)){
const from=grid.rows.value(row.key,sourceCol);
const to=grid.rows.value(row.key,targetCol);
if(from===null||from===undefined||to===null||to===undefined)continue;
const amount=measure.col?toNumber(grid.rows.value(row.key,measure.col)):1;
if(amount===null||amount<=0)continue;
const a=node(from,row,sourceCol);
const b=node(to,row,targetCol);
if(perRow){
const swapped=a.key>b.key;
const one=swapped?b:a;
const two=swapped?a:b;
links.set(`${one.key}\u0000${two.key}\u0000${links.size}`,{
source:one,
target:two,
value:amount,
undirected:true,
pair:`${one.key}\u0000${two.key}`,
rowKeys:[row.key],
});
}else{
const id=`${a.key}\u0000${b.key}`;
const link=links.get(id)||{source:a,target:b,value:0,rowKeys:[]};
link.value+=amount;
if(link.rowKeys.length<64)link.rowKeys.push(row.key);
links.set(id,link);
}
a.out+=amount;
b.in+=amount;
}
for(const[id,spot]of byId){
if(nodes.has(id))continue;
nodes.set(id,{
key:id,value:spot.id,label:String(spot.label??spot.id),index:nodes.size,in:0,out:0,
});
}
for(const[id,spot]of byId){
const found=nodes.get(id);
if(!found)continue;
found.declared=true;
if(spot.label!==undefined&&spot.label!==null)found.label=String(spot.label);
if(typeof spot.icon==='string'&&spot.icon)found.icon=spot.icon;
if(Number.isFinite(spot.x)&&Number.isFinite(spot.y)){
found.fx=Number(spot.x);
found.fy=Number(spot.y);
}
}
const ordered=perRow
?[...links.values()]
:[...links.values()].sort((x,y)=>y.value-x.value);
const kept=typeof spec.limit==='number'&&spec.limit>0
?ordered.slice(0,spec.limit)
:ordered;
return{
nodes:[...nodes.values()],
links:kept,
measure:{...measure,title:measureColumn?.title||measure.col||''},
dimension:{col:sourceCol,title:grid.columns.get(sourceCol)?.title||sourceCol},
series:[],
categories:[],
labels:[],
empty:!kept.length,
total:kept.reduce((t,link)=>t+link.value,0),
};
}
function bindHierarchy(grid,spec){
const measure=measureOf(spec.y);
const maxDepth=typeof spec.depth==='number'&&spec.depth>0?spec.depth:Infinity;
const measureColumn=measure.col?grid.columns.get(measure.col):undefined;
const node=(label,value,depth)=>({
label,value,depth,total:0,children:[],rowKey:null,
});
const root=node('',null,0);
const groups=topGroups(grid);
if(groups.length){
const copy=(row,parent,depth)=>{
const label=row.groupColumn
?categoryLabel(grid,row,row.groupColumn,row.groupValue)
:'';
const built=node(label,row.groupValue,depth);
built.rowKey=row.key;
const total=measure.col?measureValue(grid,row,measure.col):null;
built.total=total===null?0:Math.abs(total);
parent.children.push(built);
const children=row.filteredChildren||row.children;
if(depth<maxDepth&&Array.isArray(children)){
for(const child of children)if(child.group)copy(child,built,depth+1);
}
if(!built.total&&built.children.length){
built.total=built.children.reduce((t,c)=>t+c.total,0);
}
return built;
};
for(const row of groups)copy(row,root,1);
}else{
const flat=bindSeries(grid,{x:spec.x,y:spec.y,limit:spec.limit});
const first=flat.series[0];
if(first){
for(const point of first.points){
const built=node(point.label,point.x,1);
built.total=point.y===null?0:Math.abs(point.y);
built.rowKey=point.rowKey;
root.children.push(built);
}
}
}
root.total=root.children.reduce((t,c)=>t+c.total,0);
let depth=0;
const measureDepth=(n)=>{
if(n.depth>depth)depth=n.depth;
for(const child of n.children)measureDepth(child);
};
measureDepth(root);
return{
root,
depth,
measure:{...measure,title:measureColumn?.title||measure.col||''},
empty:root.total<=0||root.children.length===0,
};
}
});
__def("packages/modules/charts/radial.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"horizontalRoom",{enumerable:true,get:function(){return horizontalRoom;}});
Object.defineProperty(__exports,"arcPath",{enumerable:true,get:function(){return arcPath;}});
Object.defineProperty(__exports,"layoutRings",{enumerable:true,get:function(){return layoutRings;}});
Object.defineProperty(__exports,"drawRadial",{enumerable:true,get:function(){return drawRadial;}});
Object.defineProperty(__exports,"arcAt",{enumerable:true,get:function(){return arcAt;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/svg.js");
const attrs=__m1["attrs"];
const path=__m1["path"];
const round=__m1["round"];
const setText=__m1["setText"];
const __m2=__req("packages/modules/charts/styles.js");
const NS=__m2["NS"];
const __m3=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m3["resolveScheme"];
const __m4=__req("packages/modules/charts/labels.js");
const drawAnchoredLabels=__m4["drawAnchoredLabels"];
const labelText=__m4["labelText"];
const __m5=__req("packages/modules/charts/typography.js");
const applySize=__m5["applySize"];
const truncateTo=__m5["truncateTo"];
const TAU=Math.PI*2;
const START=-Math.PI/2;
const LABEL_MIN_SWEEP=0.25;
const LABEL_PAD=2;
const LABEL_MIN_CHARS=3;
const DONUT_HOLE=0.58;
function polar(cx,cy,r,angle){
return[cx+r*Math.cos(angle),cy+r*Math.sin(angle)];
}
function horizontalRoom(sector,px,py){
const{inner,outer,from,to}=sector;
if(py*py>=outer*outer)return 0;
const edge=Math.sqrt(outer*outer-py*py);
let left=px+edge;
let right=edge-px;
if(inner>0&&py*py<inner*inner){
const hole=Math.sqrt(inner*inner-py*py);
if(px>=hole)left=Math.min(left,px-hole);
else if(px<=-hole)right=Math.min(right,-hole-px);
else return 0;
}
if(to-from<TAU-1e-9){
for(const angle of[from,to]){
const dy=Math.sin(angle);
if(Math.abs(dy)<1e-9)continue;
const t=py/dy;
if(t<=0)continue;
const x=t*Math.cos(angle);
if(x>=px)right=Math.min(right,x-px);
else left=Math.min(left,px-x);
}
}
return Math.max(0,left)+Math.max(0,right);
}
function arcPath(arc){
const{cx,cy,inner,outer}=arc;
const sweep=arc.to-arc.from;
if(sweep<=0)return'';
if(sweep>=TAU-1e-9){
const[ox,oy]=polar(cx,cy,outer,arc.from);
const[oxHalf,oyHalf]=polar(cx,cy,outer,arc.from+Math.PI);
const parts=[
'M',round(ox),round(oy),
'A',round(outer),round(outer),0,1,1,round(oxHalf),round(oyHalf),
'A',round(outer),round(outer),0,1,1,round(ox),round(oy),
];
if(inner>0){
const[ix,iy]=polar(cx,cy,inner,arc.from);
const[ixHalf,iyHalf]=polar(cx,cy,inner,arc.from+Math.PI);
parts.push(
'M',round(ix),round(iy),
'A',round(inner),round(inner),0,1,0,round(ixHalf),round(iyHalf),
'A',round(inner),round(inner),0,1,0,round(ix),round(iy),
);
}
return path(parts);
}
const large=sweep>Math.PI?1:0;
const[x0,y0]=polar(cx,cy,outer,arc.from);
const[x1,y1]=polar(cx,cy,outer,arc.to);
const parts=['M',round(x0),round(y0),'A',round(outer),round(outer),0,large,1,round(x1),round(y1)];
if(inner>0){
const[x2,y2]=polar(cx,cy,inner,arc.to);
const[x3,y3]=polar(cx,cy,inner,arc.from);
parts.push('L',round(x2),round(y2));
parts.push('A',round(inner),round(inner),0,large,0,round(x3),round(y3));
}else{
parts.push('L',round(cx),round(cy));
}
parts.push('Z');
return path(parts);
}
function layoutRings(tree){
const arcs=[];
const place=(node,from,to,depth,index,path)=>{
if(depth>0){
arcs.push({
node,from,to,depth,index,label:node.label,total:node.total,path,
});
}
if(depth>=tree.maxRings||!node.children.length)return;
const sum=node.children.reduce((t,c)=>t+c.total,0);
const span=to-from;
if(sum<=0||span<=0)return;
let cursor=from;
for(let i=0;i<node.children.length;i++){
const child=node.children[i];
const width=(child.total/sum)*span;
place(child,cursor,cursor+width,depth+1,depth===0?i:index,[...path,child.label]);
cursor+=width;
}
};
place(tree.root,START,START+TAU,0,0,[]);
return arcs;
}
function drawRadial(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,tree,type}=ctx;
const cx=plot.left+plot.width/2;
const cy=plot.top+plot.height/2;
const radius=Math.max(0,Math.min(plot.width,plot.height)/2-2);
const rings=type==='sunburst'?Math.max(1,tree.depth):1;
const arcs=layoutRings({root:tree.root,depth:tree.depth,maxRings:rings})
.filter((arc)=>!ctx.hidden.has(arc.label));
const hole=type==='donut'?radius*DONUT_HOLE:0;
const band=rings>0?(radius-hole)/rings:radius;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const pool=new Pool(ctx.groups.marks);
for(const arc of arcs){
const inner=hole+(arc.depth-1)*band;
const outer=inner+band;
const element=pool.next('path',`${NS}__slice ${NS}__mark`);
attrs(element,{
d:arcPath({cx,cy,inner,outer,from:arc.from,to:arc.to}),
fill:scheme.series(arc.index),
'fill-opacity':arc.depth>1?Math.max(0.45,1-(arc.depth-1)*0.22):1,
'data-arc':arcs.indexOf(arc),
});
arc.geometry={cx,cy,inner,outer};
}
pool.finish();
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
const names=!(ctx.labels&&ctx.labels.names===false);
const labels=new Pool(ctx.groups.overlay);
if(names){
for(const arc of arcs){
if(arc.to-arc.from<LABEL_MIN_SWEEP)continue;
if(arc.geometry.outer-arc.geometry.inner<size+LABEL_PAD*2)continue;
const mid=(arc.from+arc.to)/2;
const at=arc.geometry.inner+(arc.geometry.outer-arc.geometry.inner)/2;
if((arc.to-arc.from)*at<size+LABEL_PAD*2)continue;
const[x,y]=polar(cx,cy,at,mid);
const{inner,outer}=arc.geometry;
const room=horizontalRoom({inner,outer,from:arc.from,to:arc.to},x-cx,y-cy)
-LABEL_PAD*2;
const whole=String(arc.label===null||arc.label===undefined?'':arc.label);
const shown=truncateTo(whole,room,size);
if(shown!==whole&&shown.length<LABEL_MIN_CHARS)continue;
const text=labels.next('text',`${NS}__slice-label`);
attrs(text,{x:round(x),y:round(y),'dominant-baseline':'middle'});
applySize(text,size);
setText(text,shown);
}
}
labels.finish();
if(ctx.labels&&ctx.labels.show){
drawAnchoredLabels({
group:ctx.groups.labels,
size,
minGap:ctx.labels.minGap,
anchors:arcs
.filter((arc)=>arc.depth===1&&arc.to-arc.from>=LABEL_MIN_SWEEP)
.map((arc)=>{
const mid=(arc.from+arc.to)/2;
const at=arc.geometry.inner+(arc.geometry.outer-arc.geometry.inner)/2;
const[x,y]=polar(cx,cy,at,mid);
return{
x:round(x),
y:round(y+size+1),
text:labelText(arc.total,ctx.labels,ctx.grid),
inside:true,
};
}),
});
}
return{arcs,centre:{x:cx,y:cy,r:radius}};
}
function arcAt(opts){
for(const arc of opts.arcs){
const geometry=arc.geometry;
if(!geometry)continue;
const dx=opts.x-geometry.cx;
const dy=opts.y-geometry.cy;
const distance=Math.sqrt(dx*dx+dy*dy);
if(distance<geometry.inner||distance>geometry.outer)continue;
let angle=Math.atan2(dy,dx);
while(angle<START)angle+=TAU;
while(angle>=START+TAU)angle-=TAU;
if(angle>=arc.from&&angle<arc.to)return arc;
}
return null;
}
});
__def("packages/modules/charts/distribution.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"FENCE",{enumerable:true,get:function(){return FENCE;}});
Object.defineProperty(__exports,"quantile",{enumerable:true,get:function(){return quantile;}});
Object.defineProperty(__exports,"summarise",{enumerable:true,get:function(){return summarise;}});
Object.defineProperty(__exports,"binEdge",{enumerable:true,get:function(){return binEdge;}});
Object.defineProperty(__exports,"outsideDomain",{enumerable:true,get:function(){return outsideDomain;}});
Object.defineProperty(__exports,"histogram",{enumerable:true,get:function(){return histogram;}});
Object.defineProperty(__exports,"readingsOf",{enumerable:true,get:function(){return readingsOf;}});
Object.defineProperty(__exports,"valuesByCategory",{enumerable:true,get:function(){return valuesByCategory;}});
Object.defineProperty(__exports,"allReadings",{enumerable:true,get:function(){return allReadings;}});
Object.defineProperty(__exports,"distributionDomain",{enumerable:true,get:function(){return distributionDomain;}});
Object.defineProperty(__exports,"density",{enumerable:true,get:function(){return density;}});
Object.defineProperty(__exports,"drawHistogram",{enumerable:true,get:function(){return drawHistogram;}});
Object.defineProperty(__exports,"drawBoxPlot",{enumerable:true,get:function(){return drawBoxPlot;}});
Object.defineProperty(__exports,"probit",{enumerable:true,get:function(){return probit;}});
Object.defineProperty(__exports,"drawQQ",{enumerable:true,get:function(){return drawQQ;}});
Object.defineProperty(__exports,"drawEcdf",{enumerable:true,get:function(){return drawEcdf;}});
Object.defineProperty(__exports,"drawLorenz",{enumerable:true,get:function(){return drawLorenz;}});
Object.defineProperty(__exports,"drawControl",{enumerable:true,get:function(){return drawControl;}});
Object.defineProperty(__exports,"drawCapability",{enumerable:true,get:function(){return drawCapability;}});
Object.defineProperty(__exports,"drawMovingRange",{enumerable:true,get:function(){return drawMovingRange;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m1["drawAxisLines"];
const drawCategoryAxis=__m1["drawCategoryAxis"];
const drawContinuousAxis=__m1["drawContinuousAxis"];
const drawMeasureAxis=__m1["drawMeasureAxis"];
const tickLabeller=__m1["tickLabeller"];
const __m2=__req("packages/modules/charts/format.js");
const formatters=__m2["formatters"];
const __m3=__req("packages/modules/charts/scale.js");
const bandScale=__m3["bandScale"];
const isNumber=__m3["isNumber"];
const linearScale=__m3["linearScale"];
const measureDomain=__m3["measureDomain"];
const niceStep=__m3["niceStep"];
const __m4=__req("packages/modules/charts/svg.js");
const attrs=__m4["attrs"];
const path=__m4["path"];
const round=__m4["round"];
const __m5=__req("packages/modules/charts/styles.js");
const NS=__m5["NS"];
const __m6=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m6["resolveScheme"];
const __m7=__req("packages/modules/charts/labels.js");
const drawAnchoredLabels=__m7["drawAnchoredLabels"];
const labelText=__m7["labelText"];
const FENCE=1.5;
const DASH='\u2013';
function quantile(sorted,p){
const n=sorted.length;
if(!n)return NaN;
if(n===1)return sorted[0];
const h=(n-1)*Math.min(1,Math.max(0,p));
const lo=Math.floor(h);
const hi=Math.ceil(h);
if(lo===hi)return sorted[lo];
return sorted[lo]+(h-lo)*(sorted[hi]-sorted[lo]);
}
function summarise(values){
const sorted=values.filter(isNumber).slice().sort((a,b)=>a-b);
if(!sorted.length)return null;
const q1=quantile(sorted,0.25);
const median=quantile(sorted,0.5);
const q3=quantile(sorted,0.75);
const iqr=q3-q1;
const lowFence=q1-FENCE*iqr;
const highFence=q3+FENCE*iqr;
let low=sorted[0];
for(const v of sorted){
if(v>=lowFence){low=v;break;}
}
let high=sorted[sorted.length-1];
for(let i=sorted.length-1;i>=0;i--){
if(sorted[i]<=highFence){high=sorted[i];break;}
}
return{
min:sorted[0],
q1,
median,
q3,
max:sorted[sorted.length-1],
low,
high,
outliers:sorted.filter((v)=>v<lowFence||v>highFence),
count:sorted.length,
};
}
function binEdge(first,step,i){
const v=first+i*step;
return Math.abs(v)<step/1e6?0:Number(v.toPrecision(12));
}
function outsideDomain(values,domain){
const declared=domain||{};
const hasMin=isNumber(declared.min);
const hasMax=isNumber(declared.max);
if(!hasMin&&!hasMax)return 0;
let out=0;
for(let i=0;i<values.length;i++){
const v=values[i];
if(!isNumber(v))continue;
if((hasMin&&v<declared.min)||(hasMax&&v>declared.max))out++;
}
return out;
}
function histogram(values,buckets=12,domain){
const declared=domain||{};
const hasMin=isNumber(declared.min);
const hasMax=isNumber(declared.max);
let min=Infinity;
let max=-Infinity;
let count=0;
for(let i=0;i<values.length;i++){
const v=values[i];
if(!isNumber(v))continue;
if(hasMin&&v<declared.min)continue;
if(hasMax&&v>declared.max)continue;
if(v<min)min=v;
if(v>max)max=v;
count++;
}
if(!count)return[];
if(hasMin)min=Number(declared.min);
if(hasMax)max=Number(declared.max);
if(min===max){
const pad=Math.abs(min)>0?Math.abs(min)/10:0.5;
min-=pad;
max+=pad;
}
const step=niceStep((max-min)/Math.max(1,buckets));
const first=Math.floor(min/step)*step;
const last=Math.ceil(max/step)*step;
const out=[];
const bins=Math.max(1,Math.round((last-first)/step));
for(let i=0;i<bins;i++){
out.push({from:binEdge(first,step,i),to:binEdge(first,step,i+1),count:0});
}
for(let i=0;i<values.length;i++){
const v=values[i];
if(!isNumber(v))continue;
if(hasMin&&v<declared.min)continue;
if(hasMax&&v>declared.max)continue;
let index=Math.floor((v-first)/step);
if(index>=out.length)index=out.length-1;
if(index<0)index=0;
out[index].count++;
}
return out;
}
function readingsOf(point){
if(!point)return[];
if(Array.isArray(point.values)){
const readings=point.values.filter(isNumber);
if(readings.length)return(readings);
}
return isNumber(point.y)?[(point.y)]:[];
}
function valuesByCategory(bound){
const out=new Map();
const whole=!(bound.dimension&&bound.dimension.col);
const single=whole?(bound.measure&&bound.measure.title)||'':'';
for(const series of bound.series){
for(const point of series.points){
const readings=readingsOf(point);
if(!readings.length)continue;
const key=whole?single:point.label;
if(!out.has(key))out.set(key,[]);
const into=out.get(key);
for(const reading of readings)into.push(reading);
}
}
return out;
}
function allReadings(bound){
const out=[];
for(const series of bound.series||[]){
for(const point of series.points||[]){
for(const reading of readingsOf(point))out.push(reading);
}
}
return out;
}
function distributionDomain(values,axis){
const declared=(axis&&axis.y)||{};
return measureDomain(values,{zero:false,min:declared.min,max:declared.max});
}
function density(values,domain,steps){
const n=values.length;
if(!n)return[];
const mean=values.reduce((t,v)=>t+v,0)/n;
const variance=values.reduce((t,v)=>t+(v-mean)**2,0)/Math.max(1,n-1);
const deviation=Math.sqrt(variance)||1;
const bandwidth=Math.max(1e-9,1.06*deviation*n**(-1/5));
const out=[];
const span=domain.max-domain.min||1;
for(let i=0;i<steps;i++){
const at=domain.min+(span*i)/(steps-1||1);
let sum=0;
for(const value of values){
const u=(at-value)/bandwidth;
sum+=Math.exp(-0.5*u*u);
}
out.push({at,density:sum/(n*bandwidth*Math.sqrt(Math.PI*2))});
}
return out;
}
function binFormatter(ctx,bound,step){
const numbers=formatters(ctx.grid,{kind:'linear',step});
const column=bound.measure&&bound.measure.col&&ctx.grid.columns
?ctx.grid.columns.get(bound.measure.col)
:null;
const formatted=!!(column&&column.format&&typeof column.formatValue==='function');
const fallback=formatted
?{
tick:(v)=>String(column.formatValue(v,null)),
}
:numbers;
return tickLabeller((ctx.axis&&ctx.axis.x)||{},fallback,ctx.grid);
}
function drawHistogram(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
const values=allReadings(bound);
const declared=(ctx.axis&&ctx.axis.y)||{};
const buckets=histogram(values,ctx.buckets||12,declared);
const outside=outsideDomain(values,declared);
const counts=buckets.map((b)=>b.count);
const yDomain=measureDomain(counts,{zero:true});
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
const step=buckets.length?buckets[0].to-buckets[0].from:1;
const edge=binFormatter(ctx,bound,step);
const labels=buckets.map((b)=>edge(b.from));
const ranges=buckets.map((b)=>`${edge(b.from)} ${DASH} ${edge(b.to)}`);
const keys=buckets.map((unused,i)=>i);
const xScale=bandScale(keys,[plot.left,plot.right],0.08);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(yDomain.max-yDomain.min)/5}),
});
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels,
fontSize:ctx.fontSize,
rotated:labels.length>8,
});
drawAxisLines({group:ctx.groups.rules,plot});
const pool=new Pool(ctx.groups.marks);
const base=yScale.of(yDomain.min<=0?0:yDomain.min);
buckets.forEach((bucket,i)=>{
const top=yScale.of(bucket.count);
attrs(pool.next('rect',`${NS}__bar ${NS}__mark`),{
x:round(xScale.of(i)),
y:round(Math.min(top,base)),
width:round(xScale.bandwidth),
height:round(Math.max(bucket.count>0?1:0,Math.abs(base-top))),
fill:scheme.series(0),
'data-point':i,
});
});
pool.finish();
if(ctx.curve&&values.length>1){
const edges={min:buckets[0].from,max:buckets[buckets.length-1].to};
const curve=density(values,edges,Math.max(24,buckets.length*4));
const tallest=curve.reduce((most,p)=>Math.max(most,p.density),0);
if(tallest>0){
const span=(edges.max-edges.min)||1;
const top=yScale.of(yDomain.max);
const points=curve.map((p)=>[
round(plot.left+((p.at-edges.min)/span)*(plot.right-plot.left)),
round(base-(p.density/tallest)*(base-top)),
]);
const line=new Pool(ctx.groups.overlay);
attrs(line.next('path',`${NS}__density ${NS}__mark`),{
d:path(points.flatMap(([x,y],i)=>[i?'L':'M',x,y])),
fill:'none',
stroke:scheme.series(1),
});
line.finish();
}
}
if(ctx.labels&&ctx.labels.show){
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
drawAnchoredLabels({
group:ctx.groups.labels,
size,
minGap:ctx.labels.minGap,
plot,
anchors:buckets.map((bucket,i)=>{
const top=Math.min(yScale.of(bucket.count),base);
const above=top-size/2-2;
const inside=above<plot.top;
return{
x:round(xScale.of(i)+xScale.bandwidth/2),
y:round(inside?top+size/2+2:above),
text:bucket.count?labelText(bucket.count,ctx.labels,ctx.grid):'',
inside,
height:inside?Math.abs(base-top)-2:undefined,
};
}),
});
}
return{
xScale,
yScale,
buckets,
labels:ranges,
categories:buckets.map((b)=>b.from),
outside,
series:[{
key:'',
label:bound.measure.title,
index:0,
points:buckets.map((b,i)=>({
x:i,xKey:String(i),label:ranges[i],from:b.from,to:b.to,y:b.count,rows:b.count,
})),
}],
};
}
function drawBoxPlot(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
const grouped=valuesByCategory(bound);
const labels=[...grouped.keys()];
const summaries=labels.map((label)=>summarise(grouped.get(label))).filter(Boolean);
const spread=[];
for(const s of summaries)spread.push(s.min,s.max);
const yDomain=distributionDomain(spread,ctx.axis);
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
const xScale=bandScale(labels,[plot.left,plot.right],0.4);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(yDomain.max-yDomain.min)/5}),
});
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels,
fontSize:ctx.fontSize,
rotated:labels.length>6,
});
drawAxisLines({group:ctx.groups.rules,plot});
const pool=new Pool(ctx.groups.marks);
const width=xScale.bandwidth;
labels.forEach((label,i)=>{
const s=summaries[i];
if(!s)return;
const left=xScale.of(label);
const mid=left+width/2;
const colour=scheme.series(i);
attrs(pool.next('rect',`${NS}__box ${NS}__mark`),{
x:round(left),
y:round(yScale.of(s.q3)),
width:round(width),
height:round(Math.max(1,yScale.of(s.q1)-yScale.of(s.q3))),
fill:colour,
'fill-opacity':0.35,
stroke:colour,
'data-point':i,
});
attrs(pool.next('path',`${NS}__whisker ${NS}__mark`),{
d:path([
'M',round(mid),round(yScale.of(s.high)),'L',round(mid),round(yScale.of(s.q3)),
'M',round(mid),round(yScale.of(s.q1)),'L',round(mid),round(yScale.of(s.low)),
'M',round(left+width*0.25),round(yScale.of(s.high)),
'L',round(left+width*0.75),round(yScale.of(s.high)),
'M',round(left+width*0.25),round(yScale.of(s.low)),
'L',round(left+width*0.75),round(yScale.of(s.low)),
]),
stroke:colour,
fill:'none',
});
attrs(pool.next('path',`${NS}__median ${NS}__mark`),{
d:path(['M',round(left),round(yScale.of(s.median)),'L',round(left+width),round(yScale.of(s.median))]),
stroke:colour,
'stroke-width':2,
fill:'none',
});
for(const outlier of s.outliers){
attrs(pool.next('circle',`${NS}__point ${NS}__mark`),{
cx:round(mid),cy:round(yScale.of(outlier)),r:2.5,fill:colour,'fill-opacity':0.8,
});
}
});
pool.finish();
return{
xScale,
yScale,
boxes:summaries,
series:[{
key:'',
label:bound.measure.title,
index:0,
points:labels.map((label,i)=>({
x:label,
xKey:label,
label,
y:summaries[i]?summaries[i].median:null,
rows:summaries[i]?summaries[i].count:0,
})),
}],
};
}
function probit(p){
if(!(p>0&&p<1))return Number.NaN;
const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,
1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
const b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,
6.680131188771972e+01,-1.328068155288572e+01];
const c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,
-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
const d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,
3.754408661907416e+00];
const low=0.02425;
if(p<low){
const q=Math.sqrt(-2*Math.log(p));
return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])
/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}
if(p>1-low){
const q=Math.sqrt(-2*Math.log(1-p));
return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])
/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}
const q=p-0.5;
const r=q*q;
return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q
/ (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
function drawQQ(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const values=allReadings(bound);
if(values.length<3)return null;
const sorted=values.slice().sort((a,b)=>a-b);
const n=sorted.length;
const theoretical=sorted.map((unused,i)=>probit((i+1-0.375)/(n+0.25)));
const xDomain=measureDomain(theoretical,{zero:false,nice:true});
const yDomain=measureDomain(sorted,{zero:false,nice:true});
const xScale=linearScale(xDomain,[plot.left,plot.right]);
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(yDomain.max-yDomain.min)/5}),
});
drawContinuousAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
fontSize:ctx.fontSize,
format:formatters(ctx.grid,{kind:'linear',step:(xDomain.max-xDomain.min)/5}),
});
drawAxisLines({group:ctx.groups.rules,plot});
const sampleQ1=quantile(sorted,0.25);
const sampleQ3=quantile(sorted,0.75);
const idealQ1=probit(0.25);
const idealQ3=probit(0.75);
const slope=(sampleQ3-sampleQ1)/(idealQ3-idealQ1);
const intercept=sampleQ1-slope*idealQ1;
const linePool=new Pool(ctx.groups.rules);
attrs(linePool.next('path',`${NS}__qq-line`),{
d:path([
'M',round(xScale.of(xDomain.min)),round(yScale.of(intercept+slope*xDomain.min)),
'L',round(xScale.of(xDomain.max)),round(yScale.of(intercept+slope*xDomain.max)),
]),
fill:'none',
});
linePool.finish();
const pool=new Pool(ctx.groups.marks);
const points=[];
for(let i=0;i<n;i++){
const cx=round(xScale.of(theoretical[i]));
const cy=round(yScale.of(sorted[i]));
attrs(pool.next('circle',`${NS}__point ${NS}__mark`),{
cx,cy,r:2.5,fill:scheme.series(0),'data-point':i,
});
points.push({x:cx,y:cy,theoretical:theoretical[i],sample:sorted[i]});
}
pool.finish();
return{points,line:{slope,intercept}};
}
function drawEcdf(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const values=allReadings(bound);
if(!values.length)return null;
const sorted=values.slice().sort((a,b)=>a-b);
const n=sorted.length;
const xDomain=measureDomain(sorted,{zero:false,nice:true});
const xScale=linearScale(xDomain,[plot.left,plot.right]);
const yScale=linearScale({min:0,max:1},[plot.bottom,plot.top]);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:0.2}),
});
drawContinuousAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
fontSize:ctx.fontSize,
format:formatters(ctx.grid,{kind:'linear',step:(xDomain.max-xDomain.min)/5}),
});
drawAxisLines({group:ctx.groups.rules,plot});
const d=['M',round(xScale.of(xDomain.min)),round(yScale.of(0))];
const steps=[];
for(let i=0;i<n;i++){
const x=round(xScale.of(sorted[i]));
const share=(i+1)/n;
d.push('L',x,round(yScale.of(i/n)),'L',x,round(yScale.of(share)));
steps.push({value:sorted[i],share});
}
d.push('L',round(xScale.of(xDomain.max)),round(yScale.of(1)));
const pool=new Pool(ctx.groups.marks);
attrs(pool.next('path',`${NS}__ecdf ${NS}__mark`),{
d:path(d),fill:'none',stroke:scheme.series(0),
});
pool.finish();
return{steps};
}
function drawLorenz(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const values=allReadings(bound).filter((v)=>v>=0);
if(!values.length)return null;
const sorted=values.slice().sort((a,b)=>a-b);
const n=sorted.length;
const total=sorted.reduce((t,v)=>t+v,0);
if(total<=0)return null;
const share=linearScale({min:0,max:1},[plot.left,plot.right]);
const held=linearScale({min:0,max:1},[plot.bottom,plot.top]);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:held,
format:formatters(ctx.grid,{kind:'linear',step:0.2}),
});
drawContinuousAxis({
group:ctx.groups.overlay,
plot,
scale:share,
fontSize:ctx.fontSize,
format:formatters(ctx.grid,{kind:'linear',step:0.2}),
});
drawAxisLines({group:ctx.groups.rules,plot});
const rules=new Pool(ctx.groups.rules);
attrs(rules.next('path',`${NS}__lorenz-equality`),{
d:path(['M',round(share.of(0)),round(held.of(0)),
'L',round(share.of(1)),round(held.of(1))]),
fill:'none',
});
rules.finish();
const d=['M',round(share.of(0)),round(held.of(0))];
const curve=[{rows:0,held:0}];
let running=0;
for(let i=0;i<n;i++){
running+=sorted[i];
const point={rows:(i+1)/n,held:running/total};
d.push('L',round(share.of(point.rows)),round(held.of(point.held)));
curve.push(point);
}
const pool=new Pool(ctx.groups.marks);
attrs(pool.next('path',`${NS}__lorenz ${NS}__mark`),{
d:path(d),fill:'none',stroke:scheme.series(0),
});
pool.finish();
let weighted=0;
for(let i=0;i<n;i++)weighted+=(i+1)*sorted[i];
const gini=(2*weighted)/(n*total)-(n+1)/n;
return{curve,gini};
}
function drawControl(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.labels).finish();
const values=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y))values.push(point.y);
}
if(values.length<2)return null;
const capability=ctx.capability||null;
const limits=capability&&capability.limits?capability.limits:null;
const bounds=[...values];
if(limits)bounds.push(limits.upper,limits.lower);
if(capability){
if(capability.lower!==null)bounds.push(capability.lower);
if(capability.upper!==null)bounds.push(capability.upper);
}
const yDomain=measureDomain(bounds,{zero:false,nice:true});
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
const step=values.length>1?(plot.right-plot.left)/(values.length-1):0;
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(yDomain.max-yDomain.min)/5}),
});
drawAxisLines({group:ctx.groups.rules,plot});
const rules=new Pool(ctx.groups.overlay);
const named=[];
const rule=(at,className,name,side='end')=>{
if(!Number.isFinite(at)||at<yDomain.min||at>yDomain.max)return;
attrs(rules.next('path',className),{
d:path(['M',round(plot.left),round(yScale.of(at)),
'L',round(plot.right),round(yScale.of(at))]),
fill:'none',
});
if(name)named.push({y:yScale.of(at),text:name,side});
};
if(limits){
rule(limits.centre,`${NS}__control-centre`,'CL','end');
rule(limits.upper,`${NS}__control-limit`,'UCL','end');
rule(limits.lower,`${NS}__control-limit`,'LCL','end');
}
if(capability){
if(capability.lower!==null)rule(capability.lower,`${NS}__spec-limit`,'LSL','start');
if(capability.upper!==null)rule(capability.upper,`${NS}__spec-limit`,'USL','start');
if(capability.target!==null)rule(capability.target,`${NS}__spec-target`,'Target','start');
}
rules.finish();
const breaks=new Map();
for(const v of(capability&&capability.violations?capability.violations:[])){
const at=breaks.get(v.index);
if(at){if(!at.includes(v.rule))at.push(v.rule);}else breaks.set(v.index,[v.rule]);
}
const broken=new Set(breaks.keys());
const pool=new Pool(ctx.groups.marks);
const d=[];
const points=[];
for(let i=0;i<values.length;i++){
const x=round(plot.left+i*step);
const y=round(yScale.of(values[i]));
d.push(i?'L':'M',x,y);
points.push({x,y,index:i,value:values[i],violating:broken.has(i)});
}
attrs(pool.next('path',`${NS}__control-line ${NS}__mark`),{
d:path(d),fill:'none',stroke:scheme.series(0),
});
for(const point of points){
attrs(pool.next('circle',`${NS}__point ${NS}__mark`),{
cx:point.x,
cy:point.y,
r:point.violating?4:2.5,
fill:point.violating?'var(--lattice-danger, #a4262c)':scheme.series(0),
'data-violation':point.violating?'true':null,
});
}
pool.finish();
const anchors=[];
for(const{y,text,side}of named){
anchors.push({
x:side==='start'?plot.left+2:plot.right-2,
y:y-3,
text,
anchor:side,
className:`${NS}__control-name`,
});
}
for(const point of points){
const rulesBroken=breaks.get(point.index);
if(!rulesBroken)continue;
anchors.push({
x:point.x,
y:point.y-7,
text:rulesBroken.sort((a1,b1)=>a1-b1).join(','),
anchor:'middle',
className:`${NS}__control-rule`,
});
}
drawAnchoredLabels({
group:ctx.groups.labels,
anchors,
size:9,
grid:ctx.grid,
minGap:1,
});
return{points,limits,ruleSet:capability?capability.ruleSet:null};
}
function drawCapability(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
const values=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y))values.push(point.y);
}
if(values.length<2)return null;
const capability=ctx.capability||null;
const spread=[...values];
if(capability){
if(capability.lower!==null)spread.push(capability.lower);
if(capability.upper!==null)spread.push(capability.upper);
if(capability.target!==null)spread.push(capability.target);
}
const xDomain=measureDomain(spread,{zero:false,nice:true});
const xScale=linearScale(xDomain,[plot.left,plot.right]);
const buckets=histogram(values,ctx.buckets||14);
const counts=buckets.map((b)=>b.count);
const yDomain=measureDomain(counts,{zero:true});
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(yDomain.max-yDomain.min)/5}),
});
drawContinuousAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
fontSize:ctx.fontSize,
format:formatters(ctx.grid,{kind:'linear',step:(xDomain.max-xDomain.min)/5}),
});
drawAxisLines({group:ctx.groups.rules,plot});
const base=yScale.of(0);
const pool=new Pool(ctx.groups.marks);
for(let i=0;i<buckets.length;i++){
const bucket=buckets[i];
const left=xScale.of(bucket.from);
const right=xScale.of(bucket.to);
const top=yScale.of(bucket.count);
attrs(pool.next('rect',`${NS}__bar ${NS}__mark`),{
x:round(Math.min(left,right)),
y:round(Math.min(top,base)),
width:round(Math.max(1,Math.abs(right-left)-1)),
height:round(Math.max(bucket.count>0?1:0,Math.abs(base-top))),
fill:scheme.series(0),
'data-point':i,
});
}
pool.finish();
const curves=new Pool(ctx.groups.overlay);
const drawn=[];
if(capability&&Number.isFinite(capability.mean)){
const steps=96;
const shape=(sigma)=>{
if(!Number.isFinite(sigma)||sigma<=0)return null;
const out=[];
for(let i=0;i<=steps;i++){
const at=xDomain.min+((xDomain.max-xDomain.min)*i)/steps;
const z=(at-capability.mean)/sigma;
out.push({at,y:Math.exp(-0.5*z*z)/sigma});
}
return out;
};
const within=shape(capability.sigmaWithin);
const overall=shape(capability.sigmaOverall);
let tallest=0;
for(const curve of[within,overall]){
if(curve)for(const p of curve)tallest=Math.max(tallest,p.y);
}
if(tallest>0){
const top=yScale.of(yDomain.max);
const plotCurve=(curve,className,name)=>{
if(!curve)return;
const d=curve.flatMap((p,i)=>[
i?'L':'M',round(xScale.of(p.at)),round(base-(p.y/tallest)*(base-top)),
]);
attrs(curves.next('path',`${className} ${NS}__mark`),{d:path(d),fill:'none'});
drawn.push(name);
};
plotCurve(within,`${NS}__capability-within`,'within');
plotCurve(overall,`${NS}__capability-overall`,'overall');
}
}
const named=[];
const limit=(at,className,name)=>{
if(at===null||!Number.isFinite(at)||at<xDomain.min||at>xDomain.max)return;
const x=round(xScale.of(at));
attrs(curves.next('path',className),{
d:path(['M',x,round(plot.top),'L',x,round(plot.bottom)]),
fill:'none',
});
named.push({x,text:name});
};
if(capability){
limit(capability.lower,`${NS}__spec-limit`,'LSL');
limit(capability.upper,`${NS}__spec-limit`,'USL');
limit(capability.target,`${NS}__spec-target`,'Target');
}
curves.finish();
drawAnchoredLabels({
group:ctx.groups.labels,
anchors:named.map(({x,text})=>({
x,y:plot.top+6,text,anchor:'middle',className:`${NS}__control-name`,
})),
size:9,
grid:ctx.grid,
minGap:1,
});
return{buckets,capability,curves:drawn};
}
function drawMovingRange(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
const readings=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y))readings.push(point.y);
}
if(readings.length<3)return null;
const ranges=[];
for(let i=1;i<readings.length;i++)ranges.push(Math.abs(readings[i]-readings[i-1]));
const centre=ranges.reduce((t,r)=>t+r,0)/ranges.length;
const upper=3.267*centre;
const yDomain=measureDomain([...ranges,0,upper],{zero:true,nice:true});
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
const step=ranges.length>1?(plot.right-plot.left)/(ranges.length-1):0;
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(yDomain.max-yDomain.min)/5}),
});
drawAxisLines({group:ctx.groups.rules,plot});
const rules=new Pool(ctx.groups.overlay);
const named=[];
const rule=(at,className,name)=>{
if(!Number.isFinite(at)||at<yDomain.min||at>yDomain.max)return;
attrs(rules.next('path',className),{
d:path(['M',round(plot.left),round(yScale.of(at)),
'L',round(plot.right),round(yScale.of(at))]),
fill:'none',
});
named.push({y:yScale.of(at),text:name});
};
rule(centre,`${NS}__control-centre`,'MR');
rule(upper,`${NS}__control-limit`,'UCL');
rules.finish();
const pool=new Pool(ctx.groups.marks);
const d=[];
const points=[];
for(let i=0;i<ranges.length;i++){
const x=round(plot.left+i*step);
const y=round(yScale.of(ranges[i]));
d.push(i?'L':'M',x,y);
points.push({x,y,index:i,value:ranges[i],violating:ranges[i]>upper});
}
attrs(pool.next('path',`${NS}__control-line ${NS}__mark`),{
d:path(d),fill:'none',stroke:scheme.series(0),
});
for(const point of points){
attrs(pool.next('circle',`${NS}__point ${NS}__mark`),{
cx:point.x,
cy:point.y,
r:point.violating?4:2.5,
fill:point.violating?'var(--lattice-danger, #a4262c)':scheme.series(0),
'data-violation':point.violating?'true':null,
});
}
pool.finish();
drawAnchoredLabels({
group:ctx.groups.labels,
anchors:named.map(({y,text})=>({
x:plot.right-2,y:y-3,text,anchor:'end',className:`${NS}__control-name`,
})),
size:9,
grid:ctx.grid,
minGap:1,
});
return{points,centre,upper};
}
});
__def("packages/modules/charts/treemap.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"squarify",{enumerable:true,get:function(){return squarify;}});
Object.defineProperty(__exports,"layoutTree",{enumerable:true,get:function(){return layoutTree;}});
Object.defineProperty(__exports,"drawTreemap",{enumerable:true,get:function(){return drawTreemap;}});
Object.defineProperty(__exports,"tileAt",{enumerable:true,get:function(){return tileAt;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/svg.js");
const attrs=__m1["attrs"];
const round=__m1["round"];
const setText=__m1["setText"];
const __m2=__req("packages/modules/charts/styles.js");
const NS=__m2["NS"];
const __m3=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m3["resolveScheme"];
const __m4=__req("packages/modules/charts/labels.js");
const drawAnchoredLabels=__m4["drawAnchoredLabels"];
const labelText=__m4["labelText"];
const __m5=__req("packages/modules/charts/typography.js");
const applySize=__m5["applySize"];
const truncateTo=__m5["truncateTo"];
const LABEL_MIN=34;
const LABEL_PAD=6;
const LABEL_MIN_CHARS=3;
const PAD=3;
const BRANCH_TINT=0.28;
function minTile(fontSize){
return fontSize*1.6;
}
function headerOf(fontSize){
return Math.round(fontSize*1.6);
}
function leafOpacity(depth){
return depth>1?Math.max(0.45,1-(depth-1)*0.22):1;
}
function worst(row,side,total){
if(!row.length||side<=0||total<=0)return Infinity;
const max=Math.max(...row);
const min=Math.min(...row);
const s2=side*side;
const t2=total*total;
return Math.max((s2*max)/t2,t2/(s2*min));
}
function squarify(items,into){
const placed=[];
const positive=items.filter((item)=>item.value>0);
const total=positive.reduce((t,item)=>t+item.value,0);
if(!positive.length||total<=0||into.width<=0||into.height<=0)return placed;
const queue=positive.slice().sort((a,b)=>b.value-a.value);
const scale=(into.width*into.height)/total;
let rect={...into};
let row=[];
let rowValues=[];
const flush=()=>{
if(!row.length)return;
const side=Math.min(rect.width,rect.height);
const rowTotal=rowValues.reduce((t,v)=>t+v,0);
const thickness=rowTotal/side;
let along=0;
for(let i=0;i<row.length;i++){
const length=rowValues[i]/thickness;
placed.push(rect.width>=rect.height
?{item:row[i],x:rect.x,y:rect.y+along,width:thickness,height:length}
:{item:row[i],x:rect.x+along,y:rect.y,width:length,height:thickness});
along+=length;
}
if(rect.width>=rect.height){
rect={x:rect.x+thickness,y:rect.y,width:rect.width-thickness,height:rect.height};
}else{
rect={x:rect.x,y:rect.y+thickness,width:rect.width,height:rect.height-thickness};
}
row=[];
rowValues=[];
};
for(const item of queue){
const area=item.value*scale;
const side=Math.min(rect.width,rect.height);
const current=worst(rowValues,side,rowValues.reduce((t,v)=>t+v,0));
const next=worst([...rowValues,area],side,rowValues.reduce((t,v)=>t+v,0)+area);
if(row.length&&next>current)flush();
row.push(item);
rowValues.push(item.value*scale);
}
flush();
return placed;
}
function layoutTree(ctx){
const{plot,tree}=ctx;
const min=minTile(ctx.fontSize);
const header=headerOf(ctx.fontSize);
const tiles=[];
const place=(node,into,depth,index,path)=>{
const items=node.children
.filter((child)=>depth>0||!ctx.hidden.has(child.label))
.map((child,i)=>({node:child,value:child.total,index:depth===0?i:index}));
for(const laid of squarify(items,into)){
if(depth>0&&(laid.width<min||laid.height<min))continue;
const tile={
...laid,
depth:depth+1,
path:[...path,laid.item.node.label],
children:false,
};
tiles.push(tile);
const inner={
x:tile.x+PAD,
y:tile.y+header,
width:tile.width-PAD*2,
height:tile.height-header-PAD,
};
if(laid.item.node.children.length&&inner.width>=min&&inner.height>=min){
const before=tiles.length;
place(laid.item.node,inner,depth+1,tile.item.index,tile.path);
tile.children=tiles.length>before;
}
}
};
place(tree.root,{x:plot.left,y:plot.top,width:plot.width,height:plot.height},0,0,[]);
return tiles;
}
function drawTreemap(ctx){
const scheme=ctx.scheme||resolveScheme();
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const tiles=layoutTree(ctx);
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
const pool=new Pool(ctx.groups.marks);
for(const tile of tiles){
attrs(pool.next('rect',`${NS}__tile ${NS}__mark${tile.children?` ${NS}__tile--branch`:''}`),{
x:round(tile.x),
y:round(tile.y),
width:round(Math.max(0,tile.width)),
height:round(Math.max(0,tile.height)),
fill:scheme.series(tile.item.index),
'fill-opacity':tile.children?BRANCH_TINT:leafOpacity(tile.depth),
'data-point':tile.item.index,
'data-depth':tile.depth,
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
for(const tile of tiles){
if(tile.width<LABEL_MIN||tile.height<ctx.fontSize*1.6)continue;
const whole=String(tile.item.node.label??'');
const shown=truncateTo(whole,tile.width-LABEL_PAD*2,size);
if(shown!==whole&&shown.length<LABEL_MIN_CHARS)continue;
const text=labels.next('text',`${NS}__tile-label${tile.children?` ${NS}__tile-label--branch`:''}`);
attrs(text,{
x:round(tile.x+LABEL_PAD),
y:round(tile.y+ctx.fontSize+2),
'text-anchor':'start',
});
applySize(text,size);
setText(text,shown);
}
labels.finish();
if(ctx.labels&&ctx.labels.show){
drawAnchoredLabels({
group:ctx.groups.labels,
size,
minGap:ctx.labels.minGap,
anchors:tiles
.filter((tile)=>!tile.children
&&tile.width>=LABEL_MIN&&tile.height>=ctx.fontSize*1.6+size)
.sort((a,b)=>(b.width*b.height)-(a.width*a.height))
.map((tile)=>({
x:round(tile.x+LABEL_PAD),
y:round(tile.y+ctx.fontSize*2+4),
text:labelText(tile.item.value,ctx.labels,ctx.grid),
anchor:'start',
inside:true,
width:tile.width-LABEL_PAD*2,
})),
});
}
return{tiles};
}
function tileAt(opts){
let found=null;
for(const tile of opts.tiles){
if(opts.x>=tile.x&&opts.x<=tile.x+tile.width
&&opts.y>=tile.y&&opts.y<=tile.y+tile.height
&&(!found||(tile.depth||1)>(found.depth||1)))found=tile;
}
return found;
}
});
__def("packages/modules/charts/matrix.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"colourRamp",{enumerable:true,get:function(){return colourRamp;}});
Object.defineProperty(__exports,"drawHeatmap",{enumerable:true,get:function(){return drawHeatmap;}});
Object.defineProperty(__exports,"drawFunnel",{enumerable:true,get:function(){return drawFunnel;}});
Object.defineProperty(__exports,"drawCandlestick",{enumerable:true,get:function(){return drawCandlestick;}});
Object.defineProperty(__exports,"drawCorrelogram",{enumerable:true,get:function(){return drawCorrelogram;}});
Object.defineProperty(__exports,"title",{enumerable:true,get:function(){return title;}});
Object.defineProperty(__exports,"cellAt",{enumerable:true,get:function(){return cellAt;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m1["drawAxisLines"];
const drawBandLabels=__m1["drawBandLabels"];
const drawCategoryAxis=__m1["drawCategoryAxis"];
const drawMeasureAxis=__m1["drawMeasureAxis"];
const leftLabelRoom=__m1["leftLabelRoom"];
const setLabelText=__m1["setLabelText"];
const __m2=__req("packages/modules/charts/format.js");
const formatters=__m2["formatters"];
const measureText=__m2["measureText"];
const __m3=__req("packages/modules/charts/scale.js");
const bandScale=__m3["bandScale"];
const isNumber=__m3["isNumber"];
const measureDomain=__m3["measureDomain"];
const __m4=__req("packages/modules/charts/svg.js");
const attrs=__m4["attrs"];
const path=__m4["path"];
const round=__m4["round"];
const setText=__m4["setText"];
const __m5=__req("packages/modules/charts/typography.js");
const applySize=__m5["applySize"];
const __m6=__req("packages/modules/charts/styles.js");
const NS=__m6["NS"];
const __m7=__req("packages/modules/charts/scheme.js");
const rampStops=__m7["rampStops"];
const resolveScheme=__m7["resolveScheme"];
const __m8=__req("packages/modules/charts/labels.js");
const drawAnchoredLabels=__m8["drawAnchoredLabels"];
const labelText=__m8["labelText"];
const SEQUENTIAL=Object.freeze([[236,243,249],[0,82,128]]);
const DIVERGING=Object.freeze([[176,74,0],[247,247,247],[0,82,128]]);
function mix(a,b,t){
const at=Math.min(1,Math.max(0,t));
const channel=(i)=>Math.round(a[i]+(b[i]-a[i])*at);
return`rgb(${channel(0)} ${channel(1)} ${channel(2)})`;
}
function colourRamp(domain,diverging,scheme){
const span=domain.max-domain.min||1;
const stops=scheme?rampStops(scheme,diverging):(diverging?DIVERGING:SEQUENTIAL);
if(!diverging){
return(value)=>mix(stops[0],stops[stops.length-1],(value-domain.min)/span);
}
const reach=Math.max(Math.abs(domain.min),Math.abs(domain.max))||1;
return(value)=>(value>=0
?mix(stops[1],stops[2],value/reach)
:mix(stops[1],stops[0],-value/reach));
}
function drawHeatmap(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const rows=bound.series.filter((s)=>!ctx.hidden.has(s.key));
const values=[];
for(const series of rows)for(const point of series.points)values.push(point.y);
const domain=measureDomain(values,{zero:false,nice:false});
const ramp=colourRamp(domain,!!ctx.diverging,scheme);
const xScale=bandScale(bound.categories,[plot.left,plot.right],0.04);
const yScale=bandScale(rows.map((s)=>s.label),[plot.top,plot.bottom],0.04);
const pool=new Pool(ctx.groups.marks);
for(const series of rows){
const y=yScale.of(series.label);
if(Number.isNaN(y))continue;
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
const x=xScale.of(point.x);
if(Number.isNaN(x))continue;
const cell=pool.next('rect',`${NS}__cell ${NS}__mark`);
attrs(cell,{
x:round(x),
y:round(y),
width:round(xScale.bandwidth),
height:round(yScale.bandwidth),
fill:isNumber(point.y)?ramp((point.y)):'transparent',
'data-series':series.index,
'data-point':i,
});
point.px=round(x+xScale.bandwidth/2);
point.py=round(y+yScale.bandwidth/2);
}
}
pool.finish();
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels:bound.labels,
fontSize:ctx.fontSize,
rotated:bound.labels.length>6,
});
drawBandLabels({
group:ctx.groups.axis,
plot,
scale:yScale,
labels:rows.map((s)=>s.label),
fontSize:ctx.fontSize,
});
if(ctx.labels&&ctx.labels.show){
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
const anchors=[];
for(const series of rows){
for(const point of series.points){
if(point.px===undefined||!isNumber(point.y))continue;
anchors.push({
x:point.px,
y:point.py,
text:labelText(point.y,ctx.labels,ctx.grid),
inside:true,
width:xScale.bandwidth-4,
height:yScale.bandwidth-2,
});
}
}
drawAnchoredLabels({group:ctx.groups.labels,size,minGap:0,anchors});
}
return{xScale,yScale,series:rows,ramp};
}
function drawFunnel(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const series=bound.series[0];
const stages=series
?series.points
.map((point,i)=>({point,label:bound.labels[i],value:isNumber(point.y)?point.y:0}))
.filter((stage)=>stage.value>0)
:[];
if(!stages.length)return{stages};
let widest=0;
for(let i=0;i<stages.length;i++){
if(stages[i].value>widest)widest=stages[i].value;
}
const height=plot.height/stages.length;
const centre=plot.left+plot.width/2;
const usable=plot.width*0.62;
const pool=new Pool(ctx.groups.marks);
stages.forEach((stage,i)=>{
const next=stages[i+1];
const top=plot.top+i*height;
const halfTop=(stage.value/widest)*usable/2;
const halfBottom=((next?next.value:stage.value)/widest)*usable/2;
attrs(pool.next('path',`${NS}__funnel ${NS}__mark`),{
d:path([
'M',round(centre-halfTop),round(top),
'L',round(centre+halfTop),round(top),
'L',round(centre+halfBottom),round(top+height-2),
'L',round(centre-halfBottom),round(top+height-2),
'Z',
]),
fill:scheme.series(i),
'data-point':i,
});
stage.point.px=round(centre);
stage.point.py=round(top+height/2);
});
pool.finish();
const labels=new Pool(ctx.groups.overlay);
stages.forEach((stage,i)=>{
const top=plot.top+i*height;
const name=labels.next('text',`${NS}__funnel-label`);
attrs(name,{
x:round(plot.left+4),y:round(top+height/2),
'text-anchor':'start','dominant-baseline':'middle',
});
setText(name,stage.label);
const readout=labels.next('text',`${NS}__funnel-value`);
attrs(readout,{
x:round(plot.right-4),y:round(top+height/2),
'text-anchor':'end','dominant-baseline':'middle',
});
const share=i===0?1:stage.value/stages[i-1].value;
const shown=ctx.labels&&ctx.labels.show
?labelText(stage.value,ctx.labels,ctx.grid)
:measureText(stage.value,ctx.grid.messages);
setText(readout,i===0?shown:`${shown} · ${Math.round(share*100)}%`);
});
labels.finish();
return{stages};
}
function drawCandlestick(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
const[open,high,low,close]=bound.series;
if(!open||!high||!low||!close)return{xScale:null,yScale:null,series:[]};
const values=[];
for(const series of[high,low])for(const point of series.points)values.push(point.y);
const domain=measureDomain(values,{zero:false});
const yScale={...bandScale([],[0,0])};
const scale=measureScale(domain,plot);
const xScale=bandScale(bound.categories,[plot.left,plot.right],0.3);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale,
format:formatters(ctx.grid,{
kind:'linear',step:(domain.max-domain.min)/5,
}),
});
drawAxisLines({group:ctx.groups.rules,plot});
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels:bound.labels,
fontSize:ctx.fontSize,
rotated:bound.labels.length>10,
});
const pool=new Pool(ctx.groups.marks);
for(let i=0;i<bound.categories.length;i++){
const o=open.points[i];
const h=high.points[i];
const l=low.points[i];
const c=close.points[i];
if(![o,h,l,c].every((p)=>p&&isNumber(p.y)))continue;
const x=xScale.of(bound.categories[i]);
const mid=x+xScale.bandwidth/2;
const rose=(c.y)>=(o.y);
const colour=rose?scheme.positive:scheme.negative;
attrs(pool.next('path',`${NS}__wick ${NS}__mark`),{
d:path([
'M',round(mid),round(scale.of((h.y))),
'L',round(mid),round(scale.of((l.y))),
]),
stroke:colour,
fill:'none',
});
const top=scale.of(Math.max((o.y),(c.y)));
const bottom=scale.of(Math.min((o.y),(c.y)));
attrs(pool.next('rect',`${NS}__candle ${NS}__mark`),{
x:round(x),
y:round(top),
width:round(xScale.bandwidth),
height:round(Math.max(1,bottom-top)),
fill:rose?'transparent':colour,
stroke:colour,
'data-point':i,
});
c.px=round(mid);
c.py=round(top);
}
pool.finish();
return{xScale,yScale:scale,series:[close],candles:bound.categories.length};
}
function measureScale(domain,plot){
const span=domain.max-domain.min||1;
return{
kind:'linear',
domain,
range:[plot.bottom,plot.top],
of(v){return plot.bottom+((v-domain.min)/span)*(plot.top-plot.bottom);},
ticks(count=5){
const out=[];
for(let i=0;i<=count;i++)out.push(domain.min+(span*i)/count);
return out;
},
};
}
function drawCorrelogram(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const columns=ctx.columns||[];
if(columns.length<2)return null;
const stats=ctx.grid&&ctx.grid.statistics;
if(!stats)return null;
const spearman=ctx.method==='spearman';
const cells=[];
for(let row=0;row<columns.length;row++){
for(let col=0;col<columns.length;col++){
const r=row===col
?1
:(spearman?stats.spearman(columns[row],columns[col])
:stats.correlation(columns[row],columns[col]));
cells.push({row,col,a:columns[row],b:columns[col],r});
}
}
const size=columns.length;
const cellW=plot.width/size;
const cellH=plot.height/size;
const pool=new Pool(ctx.groups.marks);
for(const cell of cells){
const x=plot.left+cell.col*cellW;
const y=plot.top+cell.row*cellH;
cell.x=x;
cell.y=y;
cell.width=cellW;
cell.height=cellH;
const element=pool.next('rect',`${NS}__cell ${NS}__mark`);
attrs(element,{
x:round(x),
y:round(y),
width:round(Math.max(0,cellW-1)),
height:round(Math.max(0,cellH-1)),
fill:cell.row===cell.col||cell.r===null
?'var(--lattice-chart-empty, #eceff1)'
:diverging(cell.r,scheme),
'data-row':cell.row,
'data-col':cell.col,
});
cell.element=element;
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
const room=leftLabelRoom(plot);
for(let i=0;i<size;i++){
const down=labels.next('text',`${NS}__tick`);
applySize(down,ctx.fontSize);
attrs(down,{
x:round(plot.left-4),
y:round(plot.top+i*cellH+cellH/2),
'text-anchor':'end',
'dominant-baseline':'middle',
});
setLabelText(down,title(ctx.grid,columns[i]),room,ctx.fontSize);
const across=labels.next('text',`${NS}__tick`);
applySize(across,ctx.fontSize);
attrs(across,{
x:round(plot.left+i*cellW+cellW/2),
y:round(plot.top-4),
'text-anchor':'middle',
});
setLabelText(across,title(ctx.grid,columns[i]),cellW,ctx.fontSize);
}
if(ctx.values!==false&&cellW>ctx.fontSize*2.6&&cellH>ctx.fontSize*1.5){
for(const cell of cells){
if(cell.row===cell.col||cell.r===null)continue;
const text=labels.next('text',`${NS}__data-label`);
applySize(text,ctx.fontSize);
attrs(text,{
x:round(plot.left+cell.col*cellW+cellW/2),
y:round(plot.top+cell.row*cellH+cellH/2),
'text-anchor':'middle',
'dominant-baseline':'middle',
'data-inside':'true',
});
setText(text,cell.r.toFixed(2));
}
}
labels.finish();
return{cells,columns};
}
function diverging(r,scheme){
const strength=Math.min(1,Math.abs(r));
const stops=scheme?rampStops(scheme,true):DIVERGING;
const middle=stops[Math.floor(stops.length/2)];
const end=r>=0?stops[stops.length-1]:stops[0];
return mix(middle,end,strength);
}
function title(grid,colId){
const column=grid&&grid.columns&&typeof grid.columns.get==='function'
?grid.columns.get(colId)
:null;
return String((column&&column.title)||colId);
}
function cellAt(opts){
for(const cell of opts.cells||[]){
if(cell.x===undefined)continue;
if(opts.x>=cell.x&&opts.x<=cell.x+cell.width
&&opts.y>=cell.y&&opts.y<=cell.y+cell.height)return cell;
}
return null;
}
});
__def("packages/modules/charts/topojson.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"transformer",{enumerable:true,get:function(){return transformer;}});
Object.defineProperty(__exports,"arcPoints",{enumerable:true,get:function(){return arcPoints;}});
Object.defineProperty(__exports,"stitch",{enumerable:true,get:function(){return stitch;}});
Object.defineProperty(__exports,"decodeGeometry",{enumerable:true,get:function(){return decodeGeometry;}});
Object.defineProperty(__exports,"feature",{enumerable:true,get:function(){return feature;}});
Object.defineProperty(__exports,"isTopology",{enumerable:true,get:function(){return isTopology;}});
function transformer(transform){
if(!transform)return(position)=>[position[0],position[1]];
const[kx,ky]=transform.scale;
const[dx,dy]=transform.translate;
let x=0;
let y=0;
return(position,index)=>{
if(!index){
x=0;
y=0;
}
x+=position[0];
y+=position[1];
return[x*kx+dx,y*ky+dy];
};
}
function arcPoints(topology,index){
const arc=topology.arcs[index];
const restore=transformer(topology.transform);
return arc.map((position,i)=>restore(position,i));
}
function referenced(topology,index){
const points=arcPoints(topology,index<0?~index:index);
return index<0?points.slice().reverse():points;
}
function stitch(topology,indices){
const out=[];
for(const index of indices){
const points=referenced(topology,index);
for(let i=out.length?1:0;i<points.length;i++)out.push(points[i]);
}
return out;
}
function decodeGeometry(topology,geometry){
if(!geometry||!geometry.type)return null;
const restore=transformer(topology.transform);
switch(geometry.type){
case'Point':
return{type:'Point',coordinates:restore(geometry.coordinates,0)};
case'MultiPoint':
return{
type:'MultiPoint',
coordinates:geometry.coordinates.map((position)=>restore(position,0)),
};
case'LineString':
return{type:'LineString',coordinates:stitch(topology,geometry.arcs)};
case'MultiLineString':
return{
type:'MultiLineString',
coordinates:geometry.arcs.map((line)=>stitch(topology,line)),
};
case'Polygon':
return{
type:'Polygon',
coordinates:geometry.arcs.map((ring)=>stitch(topology,ring)),
};
case'MultiPolygon':
return{
type:'MultiPolygon',
coordinates:geometry.arcs.map((polygon)=>polygon.map((ring)=>stitch(topology,ring))),
};
case'GeometryCollection':
return{
type:'GeometryCollection',
geometries:(geometry.geometries||[])
.map((one)=>decodeGeometry(topology,one))
.filter(Boolean),
};
default:
return null;
}
}
function feature(topology,object){
const source=typeof object==='string'?(topology.objects||{})[object]:object;
if(!source)return{type:'FeatureCollection',features:[]};
const geometries=source.type==='GeometryCollection'
?(source.geometries||[])
:[source];
const features=[];
for(const geometry of geometries){
const decoded=decodeGeometry(topology,geometry);
if(!decoded)continue;
features.push({
type:'Feature',
id:geometry.id,
properties:geometry.properties||{},
geometry:decoded,
});
}
return{type:'FeatureCollection',features};
}
function isTopology(value){
return!!value&&typeof value==='object'
&&(value).type==='Topology'
&&Array.isArray((value).arcs);
}
});
__def("packages/modules/charts/projection.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"MERCATOR_LIMIT",{enumerable:true,get:function(){return MERCATOR_LIMIT;}});
Object.defineProperty(__exports,"equalEarth",{enumerable:true,get:function(){return equalEarth;}});
Object.defineProperty(__exports,"robinson",{enumerable:true,get:function(){return robinson;}});
Object.defineProperty(__exports,"mercator",{enumerable:true,get:function(){return mercator;}});
Object.defineProperty(__exports,"equirectangular",{enumerable:true,get:function(){return equirectangular;}});
Object.defineProperty(__exports,"albers",{enumerable:true,get:function(){return albers;}});
Object.defineProperty(__exports,"transverseMercator",{enumerable:true,get:function(){return transverseMercator;}});
Object.defineProperty(__exports,"PROJECTIONS",{enumerable:true,get:function(){return PROJECTIONS;}});
Object.defineProperty(__exports,"DEFAULT_PROJECTION",{enumerable:true,get:function(){return DEFAULT_PROJECTION;}});
Object.defineProperty(__exports,"resolveProjection",{enumerable:true,get:function(){return resolveProjection;}});
Object.defineProperty(__exports,"WRAP_DEGREES",{enumerable:true,get:function(){return WRAP_DEGREES;}});
Object.defineProperty(__exports,"splitAntimeridian",{enumerable:true,get:function(){return splitAntimeridian;}});
Object.defineProperty(__exports,"boundsOf",{enumerable:true,get:function(){return boundsOf;}});
Object.defineProperty(__exports,"fitted",{enumerable:true,get:function(){return fitted;}});
Object.defineProperty(__exports,"graticule",{enumerable:true,get:function(){return graticule;}});
const RAD=Math.PI/180;
const EQUAL_EARTH=Object.freeze([1.340264,-0.081106,0.000893,0.003796]);
const ROBINSON=Object.freeze([
[1.0000,0.0000],[0.9986,0.0620],[0.9954,0.1240],[0.9900,0.1860],
[0.9822,0.2480],[0.9730,0.3100],[0.9600,0.3720],[0.9427,0.4340],
[0.9216,0.4958],[0.8962,0.5571],[0.8679,0.6176],[0.8350,0.6769],
[0.7986,0.7346],[0.7597,0.7903],[0.7186,0.8435],[0.6732,0.8936],
[0.6213,0.9394],[0.5722,0.9761],[0.5322,1.0000],
]);
const MERCATOR_LIMIT=85.05113;
function equalEarth(lon,lat){
const[a1,a2,a3,a4]=EQUAL_EARTH;
const phi=lat*RAD;
const theta=Math.asin(Math.min(1,Math.max(-1,(Math.sqrt(3)/2)*Math.sin(phi))));
const t2=theta*theta;
const t6=t2*t2*t2;
const denominator=(Math.sqrt(3)/2)*(a1+3*a2*t2+t6*(7*a3+9*a4*t2));
return[
(lon*RAD*Math.cos(theta))/denominator,
theta*(a1+a2*t2+t6*(a3+a4*t2)),
];
}
function robinson(lon,lat){
const abs=Math.min(Math.abs(lat),90);
const i=Math.min(ROBINSON.length-2,Math.floor(abs/5));
const t=(abs-i*5)/5;
const[x0,y0]=ROBINSON[i];
const[x1,y1]=ROBINSON[i+1];
const x=x0+(x1-x0)*t;
const y=y0+(y1-y0)*t;
return[lon*RAD*x,(lat<0?-y:y)*(Math.PI/2)];
}
function mercator(lon,lat){
const phi=Math.min(MERCATOR_LIMIT,Math.max(-MERCATOR_LIMIT,lat))*RAD;
return[lon*RAD,Math.log(Math.tan(Math.PI/4+phi/2))];
}
function equirectangular(lon,lat){
return[lon*RAD,lat*RAD];
}
function albers(opts={}){
const[p1,p2]=opts.parallels||[29.5,45.5];
const[lon0,lat0]=opts.centre||[-96,37.5];
const phi1=p1*RAD;
const phi2=p2*RAD;
const sin1=Math.sin(phi1);
const n=Math.abs(phi1-phi2)<1e-9?sin1:(sin1+Math.sin(phi2))/2;
const c=Math.cos(phi1)**2+2*n*sin1;
const rho0=Math.sqrt(c-2*n*Math.sin(lat0*RAD))/n;
return(lon,lat)=>{
const theta=n*((lon-lon0)*RAD);
const inner=Math.max(0,c-2*n*Math.sin(lat*RAD));
const rho=Math.sqrt(inner)/n;
return[rho*Math.sin(theta),rho0-rho*Math.cos(theta)];
};
}
function transverseMercator(opts={}){
const[lon0,lat0]=opts.centre||[-2,49];
return(lon,lat)=>{
const phi=lat*RAD;
const lambda=(lon-lon0)*RAD;
const b=Math.cos(phi)*Math.sin(lambda);
const clamped=Math.min(1-1e-12,Math.max(-1+1e-12,b));
return[
0.5*Math.log((1+clamped)/(1-clamped)),
Math.atan2(Math.tan(phi),Math.cos(lambda))-lat0*RAD,
];
};
}
const PROJECTIONS=Object.freeze({
equalEarth:()=>equalEarth,
robinson:()=>robinson,
mercator:()=>mercator,
equirectangular:()=>equirectangular,
albers,
transverseMercator,
britishNationalGrid:(opts)=>transverseMercator({centre:[-2,49],...opts}),
});
const DEFAULT_PROJECTION='equalEarth';
function resolveProjection(named,opts={},warn){
if(typeof named==='function')return named;
const name=typeof named==='string'&&named?named:DEFAULT_PROJECTION;
const make=PROJECTIONS[name];
if(!make){
if(warn){
warn(`chart projection ${JSON.stringify(named)} is not one this module draws; `
+`using '${DEFAULT_PROJECTION}'. Supported: ${Object.keys(PROJECTIONS).join(', ')}.`);
}
return PROJECTIONS[DEFAULT_PROJECTION]({});
}
return make(opts);
}
const WRAP_DEGREES=180;
function splitAntimeridian(ring){
if(!Array.isArray(ring)||ring.length<2)return ring&&ring.length?[ring]:[];
const parts=[];
let current=[ring[0]];
for(let i=1;i<ring.length;i++){
const[lon0,lat0]=ring[i-1];
const[lon,lat]=ring[i];
const delta=lon-lon0;
if(Math.abs(delta)>WRAP_DEGREES){
const side=delta>0?-180:180;
const span=delta>0?delta-360:delta+360;
const at=span===0?0:Math.min(1,Math.max(0,(side-lon0)/span));
const lat1=lat0+(lat-lat0)*at;
current.push([side,lat1]);
parts.push(current);
current=[[-side,lat1],[lon,lat]];
}else{
current.push([lon,lat]);
}
}
parts.push(current);
return parts.filter((part)=>part.length>1);
}
function boundsOf(rings){
let west=Infinity;
let south=Infinity;
let east=-Infinity;
let north=-Infinity;
for(const ring of rings||[]){
for(const[lon,lat]of ring){
if(lon<west)west=lon;
if(lon>east)east=lon;
if(lat<south)south=lat;
if(lat>north)north=lat;
}
}
return Number.isFinite(west)?{
west,south,east,north,
}:null;
}
function fitted(opts){
const{
project,rings,plot,
}=opts;
const padding=typeof opts.padding==='number'?opts.padding:4;
let minX=Infinity;
let minY=Infinity;
let maxX=-Infinity;
let maxY=-Infinity;
for(const ring of rings||[]){
for(const[lon,lat]of ring){
const[x,y]=project(lon,lat);
if(!Number.isFinite(x)||!Number.isFinite(y))continue;
if(x<minX)minX=x;
if(x>maxX)maxX=x;
if(y<minY)minY=y;
if(y>maxY)maxY=y;
}
}
if(!Number.isFinite(minX)||maxX===minX||maxY===minY){
const to=(lon,lat)=>{
const[x,y]=project(lon,lat);
return[plot.left+plot.width/2+x,plot.top+plot.height/2-y];
};
return{
to,
scale:1,
width:plot.width,
height:plot.height,
left:plot.left,
top:plot.top,
aspect:1,
};
}
const usableW=Math.max(1,plot.width-padding*2);
const usableH=Math.max(1,plot.height-padding*2);
const zoom=typeof opts.zoom==='number'&&opts.zoom>0?opts.zoom:1;
const scale=Math.min(usableW/(maxX-minX),usableH/(maxY-minY))*zoom;
const width=(maxX-minX)*scale;
const height=(maxY-minY)*scale;
const[baseCx,baseCy]=opts.centre
?project(opts.centre[0],opts.centre[1])
:[(minX+maxX)/2,(minY+maxY)/2];
const offset=opts.centreOffset||[0,0];
const cx=baseCx+(offset[0]||0);
const cy=baseCy+(offset[1]||0);
const left=plot.left+plot.width/2;
const top=plot.top+plot.height/2;
const to=(lon,lat)=>{
const[x,y]=project(lon,lat);
return[left+(x-cx)*scale,top-(y-cy)*scale];
};
return{
to,
scale,
width,
height,
left:left-width/2,
top:top-height/2,
aspect:(maxX-minX)/(maxY-minY),
};
}
const GRATICULE_STEP_DEG=2;
function graticule(opts={}){
const step=opts.step&&opts.step>0?opts.step:30;
const lines=[];
for(let lon=-180;lon<=180;lon+=step){
const line=[];
for(let lat=-80;lat<=80;lat+=GRATICULE_STEP_DEG)line.push([lon,lat]);
lines.push(line);
}
for(let lat=-60;lat<=60;lat+=step){
const line=[];
for(let lon=-180;lon<=180;lon+=GRATICULE_STEP_DEG)line.push([lon,lat]);
lines.push(line);
}
return lines;
}
});
__def("packages/modules/charts/geo.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"CONTINENTS",{enumerable:true,get:function(){return CONTINENTS;}});
Object.defineProperty(__exports,"CONTINENT_NAMES",{enumerable:true,get:function(){return CONTINENT_NAMES;}});
Object.defineProperty(__exports,"OUTLINES",{enumerable:true,get:function(){return OUTLINES;}});
Object.defineProperty(__exports,"COUNTRY_CONTINENT",{enumerable:true,get:function(){return COUNTRY_CONTINENT;}});
Object.defineProperty(__exports,"ALPHA3",{enumerable:true,get:function(){return ALPHA3;}});
Object.defineProperty(__exports,"NUMERIC",{enumerable:true,get:function(){return NUMERIC;}});
Object.defineProperty(__exports,"normaliseCode",{enumerable:true,get:function(){return normaliseCode;}});
Object.defineProperty(__exports,"continentOf",{enumerable:true,get:function(){return continentOf;}});
Object.defineProperty(__exports,"projection",{enumerable:true,get:function(){return projection;}});
Object.defineProperty(__exports,"projectedPath",{enumerable:true,get:function(){return projectedPath;}});
Object.defineProperty(__exports,"ringPath",{enumerable:true,get:function(){return ringPath;}});
Object.defineProperty(__exports,"shapesToPaths",{enumerable:true,get:function(){return shapesToPaths;}});
Object.defineProperty(__exports,"registerGeoPack",{enumerable:true,get:function(){return registerGeoPack;}});
Object.defineProperty(__exports,"geoPack",{enumerable:true,get:function(){return geoPack;}});
Object.defineProperty(__exports,"geoPacks",{enumerable:true,get:function(){return geoPacks;}});
Object.defineProperty(__exports,"resolvePack",{enumerable:true,get:function(){return resolvePack;}});
Object.defineProperty(__exports,"packRegions",{enumerable:true,get:function(){return packRegions;}});
Object.defineProperty(__exports,"regionLabelPoint",{enumerable:true,get:function(){return regionLabelPoint;}});
Object.defineProperty(__exports,"geoRamp",{enumerable:true,get:function(){return geoRamp;}});
Object.defineProperty(__exports,"drawGeomap",{enumerable:true,get:function(){return drawGeomap;}});
Object.defineProperty(__exports,"regionAt",{enumerable:true,get:function(){return regionAt;}});
Object.defineProperty(__exports,"markerAt",{enumerable:true,get:function(){return markerAt;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/matrix.js");
const colourRamp=__m1["colourRamp"];
const __m2=__req("packages/modules/charts/topojson.js");
const feature=__m2["feature"];
const __m3=__req("packages/modules/charts/projection.js");
const fitted=__m3["fitted"];
const graticuleLines=__m3["graticule"];
const resolveProjection=__m3["resolveProjection"];
const splitAntimeridian=__m3["splitAntimeridian"];
const __m4=__req("packages/modules/charts/labels.js");
const drawAnchoredLabels=__m4["drawAnchoredLabels"];
const __m5=__req("packages/core/src/internal/util.js");
const warnOnce=__m5["warnOnce"];
const __m6=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m6["resolveScheme"];
const __m7=__req("packages/modules/charts/scale.js");
const isNumber=__m7["isNumber"];
const measureDomain=__m7["measureDomain"];
const __m8=__req("packages/modules/charts/svg.js");
const attrs=__m8["attrs"];
const insideRings=__m8["insideRings"];
const path=__m8["path"];
const pathRings=__m8["pathRings"];
const round=__m8["round"];
const setText=__m8["setText"];
const __m9=__req("packages/modules/charts/styles.js");
const NS=__m9["NS"];
const CONTINENTS=Object.freeze(['AF','AN','AS','EU','NA','OC','SA']);
const CONTINENT_NAMES=Object.freeze({
AF:'Africa',
AN:'Antarctica',
AS:'Asia',
EU:'Europe',
NA:'North America',
OC:'Oceania',
SA:'South America',
});
const OUTLINES=Object.freeze({
NA:[
[[-168,66],[-156,71],[-130,70],[-115,69],[-100,69],[-85,70],[-75,73],
[-64,66],[-78,62],[-79,55],[-65,60],[-56,52],[-60,45],[-67,45],
[-70,42],[-74,40],[-76,37],[-81,32],[-80,27],[-81,25],[-84,30],
[-90,29],[-94,29],[-97,26],[-97,21],[-91,19],[-88,21],[-87,16],
[-83,9],[-79,9],[-85,13],[-92,16],[-96,16],[-105,20],[-110,24],
[-114,28],[-117,32],[-122,37],[-124,42],[-124,48],[-130,55],
[-140,60],[-150,59],[-160,55],[-165,60],[-168,66]],
[[-43,60],[-32,64],[-22,70],[-20,74],[-25,78],[-33,83],[-45,83],
[-58,82],[-62,76],[-56,70],[-55,66],[-52,61],[-43,60]],
],
SA:[[[-81,12],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-6],
[-38,-13],[-39,-18],[-48,-25],[-53,-34],[-57,-38],[-62,-40],[-65,-45],
[-68,-52],[-75,-53],[-73,-45],[-73,-37],[-71,-30],[-70,-23],[-71,-18],
[-76,-14],[-81,-6],[-80,-2],[-78,1],[-77,8],[-81,12]]],
EU:[
[[-10,36],[-9,44],[-2,43],[-4,48],[-1,49],[4,52],[7,53],[8,57],
[10,58],[5,58],[5,62],[11,64],[15,69],[21,70],[28,71],[32,70],
[40,67],[44,68],[50,69],[60,70],[60,60],[58,52],[50,46],[40,44],
[36,45],[30,46],[28,41],[26,40],[23,38],[18,40],[13,38],[15,37],
[12,44],[8,44],[3,42],[-2,37],[-10,36]],
[[-5,50],[1,51],[2,53],[-1,55],[-3,58],[-5,58],[-6,55],[-5,50]],
[[-10,52],[-6,52],[-6,55],[-10,55],[-10,52]],
],
AF:[[[-17,21],[-16,15],[-17,12],[-13,8],[-8,5],[-3,5],[3,6],[8,4],
[9,2],[10,-2],[12,-6],[12,-12],[14,-18],[15,-23],[18,-29],[23,-34],
[27,-34],[32,-29],[33,-26],[35,-22],[40,-16],[41,-10],[40,-3],[43,0],
[51,4],[51,11],[45,12],[43,12],[39,15],[37,21],[34,28],[32,31],
[25,32],[20,31],[15,32],[10,37],[3,36],[-2,35],[-6,36],[-10,30],
[-13,27],[-17,21]]],
AS:[
[[26,40],[35,36],[36,31],[43,30],[48,30],[50,27],[56,25],[57,22],
[60,25],[62,25],[67,24],[70,21],[73,16],[77,8],[80,6],[80,13],
[84,19],[87,21],[92,21],[95,16],[98,10],[104,1],[104,10],[107,11],
[109,17],[117,23],[122,30],[122,37],[126,34],[129,35],[130,43],
[135,45],[142,45],[143,53],[140,58],[155,59],[162,60],[170,66],
[180,68],[170,71],[150,73],[130,74],[110,76],[90,76],[75,73],
[70,70],[60,70],[60,60],[58,52],[50,46],[40,44],[36,45],[30,46],
[28,41],[26,40]],
[[130,31],[132,32],[135,33],[137,34],[140,35],[141,38],[141,41],
[142,42],[145,43],[145,45],[141,45],[140,42],[139,40],[137,37],
[135,35],[133,34],[131,33],[130,31]],
],
OC:[
[[113,-22],[114,-26],[115,-34],[119,-34],[126,-32],[132,-32],[137,-35],
[141,-38],[147,-38],[150,-37],[153,-30],[153,-25],[146,-19],[142,-11],
[136,-12],[130,-12],[126,-14],[122,-18],[113,-22]],
[[145,-41],[148,-41],[148,-43],[145,-43],[145,-41]],
[[173,-35],[178,-38],[174,-41],[172,-43],[167,-46],[170,-44],[173,-35]],
],
AN:[[[-180,-78],[-150,-76],[-120,-74],[-100,-73],[-80,-72],[-60,-63],
[-45,-60],[-58,-64],[-70,-70],[-60,-76],[-30,-77],[0,-70],[20,-70],
[40,-68],[60,-67],[80,-66],[100,-66],[120,-66],[140,-66],[160,-78],
[170,-84],[180,-85],[-180,-85],[-180,-78]]],
});
const COUNTRY_CONTINENT=Object.freeze({
AD:'EU',AE:'AS',AF:'AS',AG:'NA',AI:'NA',AL:'EU',AM:'AS',AO:'AF',AQ:'AN',
AR:'SA',AS:'OC',AT:'EU',AU:'OC',AW:'NA',AX:'EU',AZ:'AS',BA:'EU',BB:'NA',
BD:'AS',BE:'EU',BF:'AF',BG:'EU',BH:'AS',BI:'AF',BJ:'AF',BM:'NA',BN:'AS',
BO:'SA',BR:'SA',BS:'NA',BT:'AS',BW:'AF',BY:'EU',BZ:'NA',CA:'NA',CD:'AF',
CF:'AF',CG:'AF',CH:'EU',CI:'AF',CL:'SA',CM:'AF',CN:'AS',CO:'SA',CR:'NA',
CU:'NA',CV:'AF',CY:'AS',CZ:'EU',DE:'EU',DJ:'AF',DK:'EU',DM:'NA',DO:'NA',
DZ:'AF',EC:'SA',EE:'EU',EG:'AF',ER:'AF',ES:'EU',ET:'AF',FI:'EU',FJ:'OC',
FK:'SA',FM:'OC',FO:'EU',FR:'EU',GA:'AF',GB:'EU',GD:'NA',GE:'AS',GF:'SA',
GG:'EU',GH:'AF',GI:'EU',GL:'NA',GM:'AF',GN:'AF',GP:'NA',GQ:'AF',GR:'EU',
GT:'NA',GU:'OC',GW:'AF',GY:'SA',HK:'AS',HN:'NA',HR:'EU',HT:'NA',HU:'EU',
ID:'AS',IE:'EU',IL:'AS',IM:'EU',IN:'AS',IQ:'AS',IR:'AS',IS:'EU',IT:'EU',
JE:'EU',JM:'NA',JO:'AS',JP:'AS',KE:'AF',KG:'AS',KH:'AS',KI:'OC',KM:'AF',
KN:'NA',KP:'AS',KR:'AS',KW:'AS',KY:'NA',KZ:'AS',LA:'AS',LB:'AS',LC:'NA',
LI:'EU',LK:'AS',LR:'AF',LS:'AF',LT:'EU',LU:'EU',LV:'EU',LY:'AF',MA:'AF',
MC:'EU',MD:'EU',ME:'EU',MG:'AF',MH:'OC',MK:'EU',ML:'AF',MM:'AS',MN:'AS',
MO:'AS',MQ:'NA',MR:'AF',MT:'EU',MU:'AF',MV:'AS',MW:'AF',MX:'NA',MY:'AS',
MZ:'AF',NA:'AF',NC:'OC',NE:'AF',NG:'AF',NI:'NA',NL:'EU',NO:'EU',NP:'AS',
NR:'OC',NZ:'OC',OM:'AS',PA:'NA',PE:'SA',PF:'OC',PG:'OC',PH:'AS',PK:'AS',
PL:'EU',PM:'NA',PR:'NA',PS:'AS',PT:'EU',PW:'OC',PY:'SA',QA:'AS',RE:'AF',
RO:'EU',RS:'EU',RU:'EU',RW:'AF',SA:'AS',SB:'OC',SC:'AF',SD:'AF',SE:'EU',
SG:'AS',SI:'EU',SK:'EU',SL:'AF',SM:'EU',SN:'AF',SO:'AF',SR:'SA',SS:'AF',
ST:'AF',SV:'NA',SY:'AS',SZ:'AF',TC:'NA',TD:'AF',TG:'AF',TH:'AS',TJ:'AS',
TL:'AS',TM:'AS',TN:'AF',TO:'OC',TR:'AS',TT:'NA',TV:'OC',TW:'AS',TZ:'AF',
UA:'EU',UG:'AF',US:'NA',UY:'SA',UZ:'AS',VA:'EU',VC:'NA',VE:'SA',VG:'NA',
VI:'NA',VN:'AS',VU:'OC',WS:'OC',YE:'AS',YT:'AF',ZA:'AF',ZM:'AF',ZW:'AF',
});
const ALPHA3=Object.freeze({
AFG:'AF',ALB:'AL',DZA:'DZ',AND:'AD',AGO:'AO',ARG:'AR',ARM:'AM',AUS:'AU',
AUT:'AT',AZE:'AZ',BHS:'BS',BHR:'BH',BGD:'BD',BRB:'BB',BLR:'BY',BEL:'BE',
BLZ:'BZ',BEN:'BJ',BTN:'BT',BOL:'BO',BIH:'BA',BWA:'BW',BRA:'BR',BRN:'BN',
BGR:'BG',BFA:'BF',BDI:'BI',KHM:'KH',CMR:'CM',CAN:'CA',CPV:'CV',CAF:'CF',
TCD:'TD',CHL:'CL',CHN:'CN',COL:'CO',COM:'KM',COG:'CG',COD:'CD',CRI:'CR',
CIV:'CI',HRV:'HR',CUB:'CU',CYP:'CY',CZE:'CZ',DNK:'DK',DJI:'DJ',DMA:'DM',
DOM:'DO',ECU:'EC',EGY:'EG',SLV:'SV',GNQ:'GQ',ERI:'ER',EST:'EE',ETH:'ET',
FJI:'FJ',FIN:'FI',FRA:'FR',GAB:'GA',GMB:'GM',GEO:'GE',DEU:'DE',GHA:'GH',
GRC:'GR',GRL:'GL',GTM:'GT',GIN:'GN',GNB:'GW',GUY:'GY',HTI:'HT',HND:'HN',
HKG:'HK',HUN:'HU',ISL:'IS',IND:'IN',IDN:'ID',IRN:'IR',IRQ:'IQ',IRL:'IE',
ISR:'IL',ITA:'IT',JAM:'JM',JPN:'JP',JOR:'JO',KAZ:'KZ',KEN:'KE',KIR:'KI',
PRK:'KP',KOR:'KR',KWT:'KW',KGZ:'KG',LAO:'LA',LVA:'LV',LBN:'LB',LSO:'LS',
LBR:'LR',LBY:'LY',LIE:'LI',LTU:'LT',LUX:'LU',MKD:'MK',MDG:'MG',MWI:'MW',
MYS:'MY',MDV:'MV',MLI:'ML',MLT:'MT',MHL:'MH',MRT:'MR',MUS:'MU',MEX:'MX',
FSM:'FM',MDA:'MD',MCO:'MC',MNG:'MN',MNE:'ME',MAR:'MA',MOZ:'MZ',MMR:'MM',
NAM:'NA',NRU:'NR',NPL:'NP',NLD:'NL',NZL:'NZ',NIC:'NI',NER:'NE',NGA:'NG',
NOR:'NO',OMN:'OM',PAK:'PK',PLW:'PW',PSE:'PS',PAN:'PA',PNG:'PG',PRY:'PY',
PER:'PE',PHL:'PH',POL:'PL',PRT:'PT',PRI:'PR',QAT:'QA',ROU:'RO',RUS:'RU',
RWA:'RW',KNA:'KN',LCA:'LC',VCT:'VC',WSM:'WS',SMR:'SM',STP:'ST',SAU:'SA',
SEN:'SN',SRB:'RS',SYC:'SC',SLE:'SL',SGP:'SG',SVK:'SK',SVN:'SI',SLB:'SB',
SOM:'SO',ZAF:'ZA',SSD:'SS',ESP:'ES',LKA:'LK',SDN:'SD',SUR:'SR',SWZ:'SZ',
SWE:'SE',CHE:'CH',SYR:'SY',TWN:'TW',TJK:'TJ',TZA:'TZ',THA:'TH',TLS:'TL',
TGO:'TG',TON:'TO',TTO:'TT',TUN:'TN',TUR:'TR',TKM:'TM',TUV:'TV',UGA:'UG',
UKR:'UA',ARE:'AE',GBR:'GB',USA:'US',URY:'UY',UZB:'UZ',VUT:'VU',VEN:'VE',
VNM:'VN',YEM:'YE',ZMB:'ZM',ZWE:'ZW',
});
const NUMERIC=Object.freeze({
4:'AF',8:'AL',12:'DZ',20:'AD',24:'AO',32:'AR',36:'AU',40:'AT',44:'BS',
48:'BH',50:'BD',51:'AM',52:'BB',56:'BE',64:'BT',68:'BO',70:'BA',72:'BW',
76:'BR',84:'BZ',90:'SB',96:'BN',100:'BG',104:'MM',108:'BI',112:'BY',
116:'KH',120:'CM',124:'CA',132:'CV',140:'CF',144:'LK',148:'TD',152:'CL',
156:'CN',170:'CO',174:'KM',178:'CG',180:'CD',188:'CR',191:'HR',192:'CU',
196:'CY',203:'CZ',204:'BJ',208:'DK',212:'DM',214:'DO',218:'EC',222:'SV',
226:'GQ',231:'ET',232:'ER',233:'EE',246:'FI',250:'FR',262:'DJ',266:'GA',
268:'GE',270:'GM',276:'DE',288:'GH',300:'GR',304:'GL',320:'GT',324:'GN',
328:'GY',332:'HT',340:'HN',344:'HK',348:'HU',352:'IS',356:'IN',360:'ID',
364:'IR',368:'IQ',372:'IE',376:'IL',380:'IT',384:'CI',388:'JM',392:'JP',
398:'KZ',400:'JO',404:'KE',408:'KP',410:'KR',414:'KW',417:'KG',418:'LA',
422:'LB',426:'LS',428:'LV',430:'LR',434:'LY',438:'LI',440:'LT',442:'LU',
450:'MG',454:'MW',458:'MY',462:'MV',466:'ML',470:'MT',478:'MR',480:'MU',
484:'MX',496:'MN',498:'MD',499:'ME',504:'MA',508:'MZ',512:'OM',516:'NA',
520:'NR',524:'NP',528:'NL',548:'VU',554:'NZ',558:'NI',562:'NE',566:'NG',
578:'NO',586:'PK',585:'PW',591:'PA',598:'PG',600:'PY',604:'PE',608:'PH',
616:'PL',620:'PT',624:'GW',626:'TL',630:'PR',634:'QA',642:'RO',643:'RU',
646:'RW',682:'SA',686:'SN',688:'RS',690:'SC',694:'SL',702:'SG',703:'SK',
704:'VN',705:'SI',706:'SO',710:'ZA',716:'ZW',724:'ES',728:'SS',729:'SD',
740:'SR',748:'SZ',752:'SE',756:'CH',760:'SY',762:'TJ',764:'TH',768:'TG',
776:'TO',780:'TT',784:'AE',788:'TN',792:'TR',795:'TM',798:'TV',800:'UG',
804:'UA',807:'MK',818:'EG',826:'GB',834:'TZ',840:'US',858:'UY',860:'UZ',
862:'VE',882:'WS',887:'YE',894:'ZM',
});
function normaliseCode(raw){
if(raw===null||raw===undefined||raw==='')return null;
const text=String(raw).trim().toUpperCase();
if(!text)return null;
if(/^\d+$/.test(text))return NUMERIC[String(Number(text))]||null;
if(text.length===2)return text;
if(text.length===3)return ALPHA3[text]||null;
return null;
}
function continentOf(code){
if(!code)return null;
if(CONTINENTS.includes(code)&&!(code in COUNTRY_CONTINENT))return code;
if(CONTINENTS.includes(code))return code;
return COUNTRY_CONTINENT[code]||null;
}
function projection(plot,opts={}){
const south=opts.antarctic?-90:-58;
const north=84;
const span=north-south;
const scale=Math.min(plot.width/360,plot.height/span);
const width=360*scale;
const height=span*scale;
const left=plot.left+(plot.width-width)/2;
const top=plot.top+(plot.height-height)/2;
return(lon,lat)=>[left+(lon+180)*scale,top+(north-lat)*scale];
}
function projectedPath(ring,project){
const parts=[];
for(let i=0;i<ring.length;i++){
const[x,y]=project(ring[i][0],ring[i][1]);
if(!Number.isFinite(x)||!Number.isFinite(y))return parts.length>4?path([...parts,'Z']):'';
parts.push(i?'L':'M',round(x),round(y));
}
return parts.length?path([...parts,'Z']):'';
}
function ringPath(ring,project){
const rings=Array.isArray(ring)&&Array.isArray(ring[0])&&Array.isArray(ring[0][0])
?ring
:[ring];
const parts=[];
for(const one of rings){
if(!Array.isArray(one)||!one.length)continue;
for(let i=0;i<one.length;i++){
const[x,y]=project(one[i][0],one[i][1]);
parts.push(i?'L':'M',round(x),round(y));
}
parts.push('Z');
}
return path(parts);
}
function shapesToPaths(opts){
const out=new Map();
const shapes=opts.shapes;
if(!shapes)return out;
const project=projection(opts.plot);
const property=opts.codeProperty||'iso_a2';
if(!Array.isArray(shapes)&&!shapes.type){
for(const code of Object.keys(shapes)){
const normalised=normaliseCode(code);
if(normalised&&typeof shapes[code]==='string')out.set(normalised,shapes[code]);
}
return out;
}
const features=shapes.type==='FeatureCollection'?(shapes.features||[]):[shapes];
for(const feature of features){
const properties=feature.properties||{};
const code=normaliseCode(properties[property]??properties.iso??properties.code);
const geometry=feature.geometry;
if(!code||!geometry)continue;
const polygons=geometry.type==='MultiPolygon'
?geometry.coordinates
:(geometry.type==='Polygon'?[geometry.coordinates]:[]);
const parts=[];
for(const polygon of polygons){
for(const ring of polygon)parts.push(ringPath(ring,project));
}
if(parts.length)out.set(code,parts.join(' '));
}
return out;
}
const PACKS=new Map();
function registerGeoPack(pack){
if(pack&&typeof pack==='object'&&typeof pack.id==='string')PACKS.set(pack.id,pack);
return pack;
}
function geoPack(id){
return PACKS.get(id)||null;
}
function geoPacks(){
return[...PACKS.keys()];
}
function resolvePack(shapes,layer){
if(!shapes||typeof shapes!=='object')return null;
const asked=(shapes);
let pack=shapes;
if(typeof asked.pack==='string'){
pack=PACKS.get(asked.pack);
if(!pack){
warnOnce(
`chart:geomap:pack:${asked.pack}`,
`geometry pack ${JSON.stringify(asked.pack)} has not been loaded, so the map fell `
+'back to the schematic continents. Import the pack module and pass it as '
+'`shapes` — import { pack } from \'@toclocoinc/lattice-grid/modules/geo-'
+`${asked.pack}'; createChart({ …, shapes: pack })`
+`${PACKS.size?`. Loaded: ${[...PACKS.keys()].join(', ')}.`:'.'}`,
);
return null;
}
}else if(asked.pack&&typeof asked.pack==='object')pack=asked.pack;
if(!pack||typeof pack!=='object')return null;
const one=(pack);
if(one.topology)return{pack:one,topology:one.topology};
if(one.layers){
const name=(typeof asked.layer==='string'&&asked.layer)
||(typeof layer==='string'&&layer)
||one.defaultLayer
||Object.keys(one.layers)[0];
const chosen=one.layers[name];
if(chosen&&chosen.topology)return{pack:one,topology:chosen.topology,layer:name};
}
return null;
}
const DECODED=new WeakMap();
function packRegions(topology){
const cached=DECODED.get(topology);
if(cached)return cached;
const decoded=[];
for(const one of feature(topology,'regions').features){
const rings=[];
const geometry=one.geometry;
const polygons=geometry.type==='MultiPolygon'
?geometry.coordinates
:(geometry.type==='Polygon'?[geometry.coordinates]:[]);
for(const polygon of polygons){
for(const ring of polygon)for(const part of splitAntimeridian(ring))rings.push(part);
}
if(!rings.length)continue;
decoded.push({
code:String(one.id===undefined||one.id===null?'':one.id),
label:(one.properties&&one.properties.name)||String(one.id||''),
properties:one.properties||{},
rings,
});
}
DECODED.set(topology,decoded);
return decoded;
}
function graticulePath(ring,project){
const parts=[];
for(let i=0;i<ring.length;i++){
const[x,y]=project(ring[i][0],ring[i][1]);
if(!Number.isFinite(x)||!Number.isFinite(y))continue;
parts.push(parts.length?'L':'M',round(x),round(y));
}
return parts.length>2?path(parts):'';
}
function regionLabelPoint(projectedRings){
let best=null;
let bestArea=-1;
for(const ring of projectedRings){
if(!ring||ring.length<3)continue;
let area=0;
let cx=0;
let cy=0;
for(let i=0;i<ring.length;i++){
const[x0,y0]=ring[i];
const[x1,y1]=ring[(i+1)%ring.length];
const cross=x0*y1-x1*y0;
area+=cross;
cx+=(x0+x1)*cross;
cy+=(y0+y1)*cross;
}
area/=2;
const abs=Math.abs(area);
if(abs<1e-9)continue;
if(abs>bestArea){
bestArea=abs;
best=[cx/(6*area),cy/(6*area)];
}
}
if(best)return best;
const flat=projectedRings.flat();
if(!flat.length)return null;
const sum=flat.reduce((acc,[x,y])=>[acc[0]+x,acc[1]+y],[0,0]);
return[sum[0]/flat.length,sum[1]/flat.length];
}
function geoRamp(domain,diverging,scheme){
const ramp=colourRamp(domain,diverging,scheme);
if(diverging)return ramp;
const span=domain.max-domain.min||1;
const FLOOR=1/6;
return(value)=>ramp(domain.min+(FLOOR+((value-domain.min)/span)*(1-FLOOR))*span);
}
function drawGeomap(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const packed=resolvePack(ctx.shapes,ctx.layer);
const supplied=packed?new Map():shapesToPaths({
shapes:ctx.shapes,plot,codeProperty:ctx.codeProperty,
});
const useCountries=supplied.size>0||!!packed;
const packRows=packed?packRegions(packed.topology):null;
const byCode=new Map();
if(packRows){
for(const region of packRows){
byCode.set(region.code,region);
const alias=region.properties||{};
if(alias.alpha3)byCode.set(String(alias.alpha3).toUpperCase(),region);
if(alias.numeric)byCode.set(String(Number(alias.numeric)),region);
if(alias.fips)byCode.set(String(alias.fips),region);
}
}
const totals=new Map();
const unmatched=[];
const series=bound.series[0];
if(series){
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const raw=bound.categories[i];
const code=normaliseCode(raw);
const found=packRows
?[code,raw===null||raw===undefined?'':String(raw).trim().toUpperCase()]
.map((one)=>(one?byCode.get(one):null))
.find(Boolean)
:null;
const packCode=found?found.code:null;
const target=packRows?packCode:(useCountries?code:continentOf(code));
if(!target||(useCountries&&!packRows&&!supplied.has(target))){
if(bound.labels[i])unmatched.push(bound.labels[i]);
continue;
}
const entry=totals.get(target)||{value:0,labels:[]};
entry.value+=(point.y);
entry.labels.push(bound.labels[i]);
totals.set(target,entry);
}
}
const antarctic=totals.has('AN')||totals.has('AQ');
const project=projection(plot,{antarctic});
let fit=null;
if(packRows){
const drawn=antarctic
?packRows
:packRows.filter((region)=>region.code!=='AQ'&&region.code!=='AN');
const project2=resolveProjection(
ctx.projection||packed.pack.projection,
{...(packed.pack.projectionOptions||{}),...(ctx.projectionOptions||{})},
(message)=>warnOnce(`chart:geomap:projection:${String(ctx.projection)}`,message),
);
fit={
project:project2,
...fitted({
project:project2,
rings:drawn.flatMap((region)=>region.rings),
plot,
zoom:ctx.zoom,
centre:ctx.centre,
centreOffset:ctx.centreOffset,
}),
drawn,
};
}
const domain=measureDomain([...totals.values()].map((e)=>e.value),{
zero:!ctx.diverging,nice:false,
});
const ramp=geoRamp(domain,!!ctx.diverging,scheme);
const pool=new Pool(ctx.groups.marks);
const wantGraticule=!!ctx.graticule&&!!fit;
if(wantGraticule){
const step=(ctx.graticule&&typeof ctx.graticule==='object'&&ctx.graticule.step)||30;
for(const line of graticuleLines({step})){
for(const part of splitAntimeridian(line)){
const d=graticulePath(part,fit.to);
if(!d)continue;
const element=pool.next('path',`${NS}__graticule`);
attrs(element,{d,class:`${NS}__graticule`});
}
}
}
const regions=[];
const codes=fit
?fit.drawn.map((region)=>region.code)
:(useCountries
?[...supplied.keys()]
:CONTINENTS.filter((code)=>code!=='AN'||antarctic));
const packed_=fit?new Map(fit.drawn.map((region)=>[region.code,region])):null;
for(const code of codes){
const d=fit
?packed_.get(code).rings
.map((ring)=>projectedPath(ring,fit.to))
.filter(Boolean)
.join(' ')
:(useCountries?supplied.get(code):ringPath(OUTLINES[code],project));
const entry=totals.get(code);
const element=pool.next('path',`${NS}__region ${NS}__mark`);
attrs(element,{
d,
fill:entry?ramp(entry.value):'var(--lattice-chart-empty, #eceff1)',
'data-code':code,
class:`${NS}__region ${NS}__mark`,
});
regions.push({
code,
value:entry?entry.value:null,
label:(!useCountries&&CONTINENT_NAMES[code])
||(packed_&&packed_.get(code).label)
||(entry&&entry.labels[0])
||code,
element,
d,
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
if(unmatched.length){
const note=labels.next('text',`${NS}__geo-note`);
attrs(note,{x:round(plot.left),y:round(plot.bottom),'text-anchor':'start'});
setText(note,ctx.grid.messages.t('chart.geoUnmatched',{count:unmatched.length}));
}
labels.finish();
let labelsDrawn=0;
if(ctx.labels&&ctx.labels.show&&fit){
const anchors=regions
.filter((region)=>region.value!==null)
.sort((a,b)=>b.value-a.value)
.map((region)=>{
const rings=packed_.get(region.code).rings
.map((ring)=>ring.map(([lon,lat])=>fit.to(lon,lat)));
const point=regionLabelPoint(rings);
return point&&{x:point[0],y:point[1],text:region.label};
}).filter(Boolean);
labelsDrawn=drawAnchoredLabels({
group:ctx.groups.labels,
size:ctx.fontSize,
minGap:ctx.labels.minGap,
anchors,
plot,
});
}
return{
regions,
ramp,
unmatched,
useCountries,
packed:!!fit,
scale:fit?fit.scale:null,
attribution:packed?packed.pack.attribution||'':'',
aspect:fit?fit.aspect:null,
labelsDrawn,
};
}
function regionAt(opts){
for(const region of opts.regions||[]){
if(!region.rings){
region.rings=pathRings(region.d);
let minX=Infinity;let minY=Infinity;let maxX=-Infinity;let maxY=-Infinity;
for(const ring of region.rings){
for(const[x,y]of ring){
if(x<minX)minX=x;
if(x>maxX)maxX=x;
if(y<minY)minY=y;
if(y>maxY)maxY=y;
}
}
region.box={minX,minY,maxX,maxY};
}
const box=region.box;
if(!box||opts.x<box.minX||opts.x>box.maxX
||opts.y<box.minY||opts.y>box.maxY)continue;
if(insideRings(region.rings,opts.x,opts.y))return region;
}
return null;
}
function markerAt(opts){
const slack=3;
let best=null;
let bestDistance=Infinity;
for(const marker of opts.markers||[]){
if(!marker)continue;
const reach=(marker.r||0)+slack;
const dx=opts.x-marker.x;
const dy=opts.y-marker.y;
const distance=Math.sqrt(dx*dx+dy*dy);
if(distance>reach||distance>=bestDistance)continue;
bestDistance=distance;
best=marker;
}
return best;
}
});
__def("packages/modules/charts/rulecolour.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"colourOf",{enumerable:true,get:function(){return colourOf;}});
Object.defineProperty(__exports,"ruleColour",{enumerable:true,get:function(){return ruleColour;}});
Object.defineProperty(__exports,"ruleLegend",{enumerable:true,get:function(){return ruleLegend;}});
const ALL='*';
function colourOf(style){
if(!style||typeof style!=='object')return null;
for(const field of['background','backgroundColor','color']){
const value=style[field];
if(typeof value==='string'&&value.trim())return value.trim();
}
return null;
}
function ruleColour(opts){
const{grid,col,value}=opts;
if(!grid||!col||!grid.formatting||typeof grid.formatting.styleFor!=='function'){
return null;
}
try{
return colourOf(grid.formatting.styleFor(col,value));
}catch{
return null;
}
}
function ruleLegend(opts){
const{grid,col}=opts;
const used=new Set([...(opts.colours||[])].filter(Boolean));
if(!used.size||!grid||!grid.formatting||typeof grid.formatting.list!=='function'){
return[];
}
let rules;
try{
rules=[...(grid.formatting.list(ALL)||[]),...(col?grid.formatting.list(col)||[]:[])];
}catch{
return[];
}
const out=[];
const seen=new Set();
for(const rule of rules){
if(!rule||rule.enabled===false)continue;
const colour=colourOf(rule.style);
if(!colour||!used.has(colour)||seen.has(colour))continue;
seen.add(colour);
out.push({
key:rule.id||`rule:${out.length}`,
label:rule.label||rule.id||colour,
colour,
index:out.length,
});
}
return out;
}
});
__def("packages/modules/charts/network.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"ITERATIONS",{enumerable:true,get:function(){return ITERATIONS;}});
Object.defineProperty(__exports,"LINK_GAP",{enumerable:true,get:function(){return LINK_GAP;}});
Object.defineProperty(__exports,"ICON_RADIUS",{enumerable:true,get:function(){return ICON_RADIUS;}});
Object.defineProperty(__exports,"sequence",{enumerable:true,get:function(){return sequence;}});
Object.defineProperty(__exports,"layoutNetwork",{enumerable:true,get:function(){return layoutNetwork;}});
Object.defineProperty(__exports,"glyphFor",{enumerable:true,get:function(){return glyphFor;}});
Object.defineProperty(__exports,"glyphTransform",{enumerable:true,get:function(){return glyphTransform;}});
Object.defineProperty(__exports,"offsetParallel",{enumerable:true,get:function(){return offsetParallel;}});
Object.defineProperty(__exports,"drawNetwork",{enumerable:true,get:function(){return drawNetwork;}});
Object.defineProperty(__exports,"emphasiseNetwork",{enumerable:true,get:function(){return emphasiseNetwork;}});
Object.defineProperty(__exports,"nodeAt",{enumerable:true,get:function(){return nodeAt;}});
Object.defineProperty(__exports,"linkAt",{enumerable:true,get:function(){return linkAt;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m1["resolveScheme"];
const __m2=__req("packages/modules/charts/svg.js");
const attrs=__m2["attrs"];
const path=__m2["path"];
const round=__m2["round"];
const setText=__m2["setText"];
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
const __m4=__req("packages/modules/charts/typography.js");
const applySize=__m4["applySize"];
const truncateTo=__m4["truncateTo"];
const __m5=__req("packages/modules/charts/rulecolour.js");
const ruleColour=__m5["ruleColour"];
const ruleLegend=__m5["ruleLegend"];
const __m6=__req("packages/core/src/internal/util.js");
const warnOnce=__m6["warnOnce"];
const ITERATIONS=220;
const REPULSION=2400;
const ATTRACTION=0.006;
const GRAVITY=0.015;
const LINK_GAP=4;
const ICON_RADIUS=10;
function sequence(seed){
let state=seed>>>0||1;
return()=>{
state^=state<<13;
state>>>=0;
state^=state>>17;
state^=state<<5;
state>>>=0;
return state/4294967296;
};
}
function layoutNetwork(opts){
const{nodes,links,plot}=opts;
if(!nodes.length)return nodes;
const random=sequence(nodes.length*2654435761);
const cx=plot.left+plot.width/2;
const cy=plot.top+plot.height/2;
const spread=Math.min(plot.width,plot.height)/3;
for(const node of nodes){
const angle=random()*Math.PI*2;
const distance=spread*(0.35+random()*0.65);
node.x=cx+Math.cos(angle)*distance;
node.y=cy+Math.sin(angle)*distance;
node.vx=0;
node.vy=0;
}
for(const node of nodes){
node.pinned=Number.isFinite(node.fx)&&Number.isFinite(node.fy);
if(!node.pinned)continue;
node.x=plot.left+Math.max(0,Math.min(1,node.fx))*plot.width;
node.y=plot.top+Math.max(0,Math.min(1,node.fy))*plot.height;
}
const rounds=opts.iterations||ITERATIONS;
for(let step=0;step<rounds;step++){
const heat=1-step/rounds;
for(let i=0;i<nodes.length;i++){
const a=nodes[i];
for(let j=i+1;j<nodes.length;j++){
const b=nodes[j];
let dx=a.x-b.x;
let dy=a.y-b.y;
let distance=Math.sqrt(dx*dx+dy*dy);
if(distance<0.01){
dx=(i-j)||1;
dy=1;
distance=Math.sqrt(dx*dx+dy*dy);
}
const push=REPULSION/(distance*distance);
const ux=(dx/distance)*push;
const uy=(dy/distance)*push;
a.vx+=ux;
a.vy+=uy;
b.vx-=ux;
b.vy-=uy;
}
}
for(const link of links){
const a=link.source;
const b=link.target;
if(a===b)continue;
const dx=b.x-a.x;
const dy=b.y-a.y;
const pull=ATTRACTION*(link.weight||1);
a.vx+=dx*pull;
a.vy+=dy*pull;
b.vx-=dx*pull;
b.vy-=dy*pull;
}
for(const node of nodes){
if(node.pinned){
node.vx=0;
node.vy=0;
continue;
}
node.vx+=(cx-node.x)*GRAVITY;
node.vy+=(cy-node.y)*GRAVITY;
node.x+=node.vx*heat*0.08;
node.y+=node.vy*heat*0.08;
node.vx*=0.82;
node.vy*=0.82;
node.x=Math.max(plot.left+8,Math.min(plot.right-8,node.x));
node.y=Math.max(plot.top+8,Math.min(plot.bottom-8,node.y));
}
}
return nodes;
}
function glyphFor(grid,name){
if(!name)return null;
const registry=grid&&grid.icons;
if(!registry||typeof registry.get!=='function'){
warnOnce(
`chart:icons:${name}`,
`A network node asked for the icon '${name}', but this grid publishes no icon `
+'registry — a headless grid has no sprites. The node drew as a plain disc.',
);
return null;
}
const def=registry.get(name);
if(!def){
warnOnce(
`chart:icon:${name}`,
`Unknown icon '${name}' on a network node; drew a plain disc instead. `
+'Register it with registerIcon or config.icons, or name a built-in.',
);
return null;
}
return def;
}
function glyphTransform(def,at){
const parts=String(def.viewBox||'0 0 16 16').trim().split(/[\s,]+/).map(Number);
const[minX,minY,width,height]=parts.length===4&&parts.every(Number.isFinite)
?parts
:[0,0,16,16];
const span=Math.max(width||16,height||16);
const scale=at.size/span;
const left=at.x-(width*scale)/2;
const top=at.y-(height*scale)/2;
return`translate(${round(left-minX*scale)} ${round(top-minY*scale)}) scale(${round(scale)})`;
}
function offsetParallel(links){
const bundles=new Map();
for(const link of links){
const id=link.pair||`${link.source.key}\u0000${link.target.key}`;
if(!bundles.has(id))bundles.set(id,[]);
bundles.get(id).push(link);
}
for(const bundle of bundles.values()){
const n=bundle.length;
for(let i=0;i<n;i++){
const link=bundle[i];
const a=link.source;
const b=link.target;
const dx=b.x-a.x;
const dy=b.y-a.y;
const length=Math.sqrt(dx*dx+dy*dy)||1;
const nx=length?-dy/length:0;
const ny=length?dx/length:1;
const shift=(i-(n-1)/2)*LINK_GAP;
link.offset=shift;
link.bundled=n>1;
link.line={
x1:a.x+nx*shift,
y1:a.y+ny*shift,
x2:b.x+nx*shift,
y2:b.y+ny*shift,
};
}
}
}
function drawNetwork(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
for(const name of['grid','axis','rules','labels'])new Pool(ctx.groups[name]).finish();
const nodes=bound.nodes;
const links=bound.links.map((link)=>({...link,weight:link.value}));
if(!nodes.length)return{nodes:[],links:[],legend:[]};
const heaviest=links.reduce((max,link)=>Math.max(max,link.value),0)||1;
for(const link of links)link.weight=link.value/heaviest;
layoutNetwork({nodes,links,plot,iterations:ctx.iterations});
offsetParallel(links);
const valueCol=(bound.measure&&bound.measure.col)||null;
const used=new Set();
for(const link of links){
link.colour=ruleColour({grid:ctx.grid,col:valueCol,value:link.value});
if(link.colour)used.add(link.colour);
}
const busiest=nodes.reduce((max,node)=>Math.max(max,node.in+node.out),0)||1;
const pool=new Pool(ctx.groups.marks);
const fixedWidth=Number.isFinite(ctx.linkWidth)&&ctx.linkWidth>0
?Number(ctx.linkWidth)
:null;
for(const link of links){
link.drawnWidth=fixedWidth===null?0.5+link.weight*3:fixedWidth;
const el=pool.next('path',`${NS}__edge ${NS}__mark`);
attrs(el,{
d:path([
'M',round(link.line.x1),round(link.line.y1),
'L',round(link.line.x2),round(link.line.y2),
]),
style:link.colour?`stroke:${link.colour};stroke-opacity:1`:null,
'stroke-width':round(link.drawnWidth),
fill:'none',
});
link.el=el;
}
for(const node of nodes){
const share=(node.in+node.out)/busiest;
const icon=node.icon||ctx.icon||null;
node.glyph=glyphFor(ctx.grid,icon);
node.r=4+Math.sqrt(share)*12;
if(node.glyph)node.r=Math.max(node.r,ICON_RADIUS);
const el=pool.next('circle',`${NS}__node ${NS}__mark`);
attrs(el,{
cx:round(node.x),
cy:round(node.y),
r:round(node.r),
fill:scheme.series(node.index),
'data-node':node.key,
});
node.el=el;
}
pool.finish();
const overlay=new Pool(ctx.groups.overlay);
const glyphs=[];
for(const node of nodes){
if(!node.glyph){node.glyphEls=[];continue;}
const stroked=node.glyph.paint==='stroke';
const transform=glyphTransform(node.glyph,{x:node.x,y:node.y,size:node.r*1.3});
node.glyphEls=node.glyph.paths.map((d)=>{
const el=overlay.next('path',`${NS}__node-icon${stroked?` ${NS}__node-icon--stroke`:''}`);
attrs(el,{d,transform});
return el;
});
glyphs.push(...node.glyphEls);
}
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize;
const named=nodes.filter((node)=>node.declared);
const rest=nodes.filter((node)=>!node.declared)
.sort((a,b)=>(b.in+b.out)-(a.in+a.out))
.slice(0,12);
for(const node of[...named,...rest]){
const text=overlay.next('text',`${NS}__flow-label`);
applySize(text,size);
attrs(text,{
x:round(node.x),y:round(node.y+node.r+size),'text-anchor':'middle',
});
setText(text,truncateTo(node.label,90,size));
node.labelEl=text;
}
overlay.finish();
return{
nodes,
links,
glyphs,
legend:ruleLegend({grid:ctx.grid,col:valueCol,colours:used}),
};
}
function emphasiseNetwork(opts){
const drawn=opts.drawn||{};
const keys=opts.keys||new Set();
const any=keys.size>0;
let hit=0;
const live=new Set();
for(const link of drawn.links||[]){
const selected=any&&(link.rowKeys||[]).some((rowKey)=>keys.has(rowKey));
if(selected){hit++;live.add(link.source);live.add(link.target);}
dim(link.el,any&&!selected);
}
for(const node of drawn.nodes||[]){
const selected=live.has(node);
if(selected)hit++;
dim(node.el,any&&!selected);
for(const el of node.glyphEls||[])dim(el,any&&!selected);
}
return hit;
}
function dim(el,on){
if(!el||!el.setAttribute)return;
if(on)el.setAttribute('data-dim','true');
else el.removeAttribute('data-dim');
}
function nodeAt(opts){
const slack=typeof opts.slack==='number'?opts.slack:2;
let best=null;
let closest=Infinity;
for(const node of opts.nodes||[]){
if(typeof node.x!=='number'||typeof node.y!=='number')continue;
const dx=opts.x-node.x;
const dy=opts.y-node.y;
const distance=Math.sqrt(dx*dx+dy*dy);
if(distance<=(node.r||0)+slack&&distance<closest){
closest=distance;
best=node;
}
}
return best;
}
function linkAt(opts){
let best=null;
let closest=Infinity;
for(const link of opts.links||[]){
const drawn=link.line;
const a=drawn?{x:drawn.x1,y:drawn.y1}:link.source;
const b=drawn?{x:drawn.x2,y:drawn.y2}:link.target;
if(!a||!b||typeof a.x!=='number'||typeof b.x!=='number')continue;
const vx=b.x-a.x;
const vy=b.y-a.y;
const length=vx*vx+vy*vy;
const t=length?Math.max(0,Math.min(1,((opts.x-a.x)*vx+(opts.y-a.y)*vy)/length)):0;
const dx=opts.x-(a.x+t*vx);
const dy=opts.y-(a.y+t*vy);
const distance=Math.sqrt(dx*dx+dy*dy);
const stroke=Number.isFinite(link.drawnWidth)
?link.drawnWidth
:0.5+(link.weight||0)*3;
const tolerance=link.bundled
?Math.min(Math.max(2,stroke/2),LINK_GAP/2)
:Math.max(3,stroke/2);
if(distance<=tolerance&&distance<closest){
closest=distance;
best=link;
}
}
return best;
}
});
__def("packages/modules/charts/flow.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"assignDepths",{enumerable:true,get:function(){return assignDepths;}});
Object.defineProperty(__exports,"layoutSankey",{enumerable:true,get:function(){return layoutSankey;}});
Object.defineProperty(__exports,"ribbon",{enumerable:true,get:function(){return ribbon;}});
Object.defineProperty(__exports,"drawSankey",{enumerable:true,get:function(){return drawSankey;}});
Object.defineProperty(__exports,"layoutChord",{enumerable:true,get:function(){return layoutChord;}});
Object.defineProperty(__exports,"drawChord",{enumerable:true,get:function(){return drawChord;}});
Object.defineProperty(__exports,"describeLink",{enumerable:true,get:function(){return describeLink;}});
Object.defineProperty(__exports,"flowNodeAt",{enumerable:true,get:function(){return flowNodeAt;}});
Object.defineProperty(__exports,"ribbonAt",{enumerable:true,get:function(){return ribbonAt;}});
Object.defineProperty(__exports,"chordArcAt",{enumerable:true,get:function(){return chordArcAt;}});
Object.defineProperty(__exports,"chordRibbonAt",{enumerable:true,get:function(){return chordRibbonAt;}});
Object.defineProperty(__exports,"chordPolygon",{enumerable:true,get:function(){return chordPolygon;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/format.js");
const measureText=__m1["measureText"];
const __m2=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m2["resolveScheme"];
const __m3=__req("packages/modules/charts/svg.js");
const attrs=__m3["attrs"];
const insideRings=__m3["insideRings"];
const path=__m3["path"];
const round=__m3["round"];
const setText=__m3["setText"];
const __m4=__req("packages/modules/charts/styles.js");
const NS=__m4["NS"];
const __m5=__req("packages/modules/charts/typography.js");
const applySize=__m5["applySize"];
const textWidth=__m5["textWidth"];
const truncateTo=__m5["truncateTo"];
const TAU=Math.PI*2;
const NODE_WIDTH=12;
const NODE_GAP=8;
const CHORD_START=-Math.PI/2;
const CHORD_STEPS=16;
function assignDepths(nodes,links){
for(const node of nodes)node.depth=0;
const cap=nodes.length+1;
for(let pass=0;pass<cap;pass++){
let moved=false;
for(const link of links){
if(link.source===link.target)continue;
const wanted=link.source.depth+1;
if(wanted>link.target.depth&&wanted<cap){
link.target.depth=wanted;
moved=true;
}
}
if(!moved)break;
}
const deepest=nodes.reduce((max,node)=>Math.max(max,node.depth),0);
const sends=new Set();
const receives=new Set();
for(const link of links){
if(link.source===link.target)continue;
sends.add(link.source);
receives.add(link.target);
}
for(const node of nodes){
if(!sends.has(node)&&receives.has(node))node.depth=deepest;
}
return deepest+1;
}
function layoutSankey(opts){
const{nodes,links,plot}=opts;
const columns=assignDepths(nodes,links);
const width=opts.nodeWidth||NODE_WIDTH;
const byDepth=new Map();
for(const node of nodes){
if(!byDepth.has(node.depth))byDepth.set(node.depth,[]);
byDepth.get(node.depth).push(node);
}
let busiest=0;
for(const column of byDepth.values()){
const total=column.reduce((t,node)=>t+Math.max(node.in,node.out),0);
const gaps=Math.max(0,column.length-1)*NODE_GAP;
if(total>0)busiest=Math.max(busiest,total/Math.max(1,plot.height-gaps));
}
const scale=busiest>0?1/busiest:0;
const step=columns>1?(plot.width-width)/(columns-1):0;
for(const[depth,column]of byDepth){
column.sort((a,b)=>Math.max(b.in,b.out)-Math.max(a.in,a.out));
const heights=column.map((node)=>Math.max(1,Math.max(node.in,node.out)*scale));
const total=heights.reduce((t,h)=>t+h,0)+(column.length-1)*NODE_GAP;
let y=plot.top+Math.max(0,(plot.height-total)/2);
column.forEach((node,i)=>{
node.x=plot.left+depth*step;
node.width=width;
node.y=y;
node.height=heights[i];
node.inAt=y;
node.outAt=y;
y+=heights[i]+NODE_GAP;
});
}
const ordered=links.slice().sort((a,b)=>a.source.y-b.source.y||b.value-a.value);
for(const link of ordered){
const thickness=Math.max(1,link.value*scale);
link.thickness=thickness;
link.y0=link.source.outAt+thickness/2;
link.source.outAt+=thickness;
}
for(const link of ordered.slice().sort((a,b)=>a.target.y-b.target.y||b.value-a.value)){
link.y1=link.target.inAt+link.thickness/2;
link.target.inAt+=link.thickness;
}
return{columns,scale};
}
function ribbon(link){
const x0=link.source.x+link.source.width;
const x1=link.target.x;
const mid=(x0+x1)/2;
const half=link.thickness/2;
return path([
'M',round(x0),round(link.y0-half),
'C',round(mid),round(link.y0-half),round(mid),round(link.y1-half),round(x1),round(link.y1-half),
'L',round(x1),round(link.y1+half),
'C',round(mid),round(link.y1+half),round(mid),round(link.y0+half),round(x0),round(link.y0+half),
'Z',
]);
}
function drawSankey(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
for(const name of['grid','axis','rules','labels'])new Pool(ctx.groups[name]).finish();
const nodes=bound.nodes;
const links=bound.links;
if(!nodes.length||!links.length)return{nodes:[],links:[]};
layoutSankey({nodes,links,plot});
const pool=new Pool(ctx.groups.marks);
for(const link of links){
const element=pool.next('path',`${NS}__ribbon ${NS}__mark`);
attrs(element,{
d:ribbon(link),
fill:scheme.series(link.source.index),
'data-link':`${link.source.key}->${link.target.key}`,
});
}
for(const node of nodes){
attrs(pool.next('rect',`${NS}__node ${NS}__mark`),{
x:round(node.x),
y:round(node.y),
width:round(node.width),
height:round(node.height),
fill:scheme.series(node.index),
'data-node':node.key,
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize;
for(const node of nodes){
const rightward=node.x<plot.left+plot.width/2;
const text=labels.next('text',`${NS}__flow-label`);
applySize(text,size);
attrs(text,{
x:round(rightward?node.x+node.width+4:node.x-4),
y:round(node.y+node.height/2),
'text-anchor':rightward?'start':'end',
'dominant-baseline':'middle',
});
const room=rightward?plot.right-(node.x+node.width)-6:node.x-plot.left-6;
setText(text,truncateTo(node.label,Math.max(0,room),size));
}
labels.finish();
return{nodes,links};
}
function layoutChord(opts){
const{nodes,links}=opts;
const totals=new Map();
for(const node of nodes)totals.set(node.key,0);
for(const link of links){
totals.set(link.source.key,(totals.get(link.source.key)||0)+link.value);
totals.set(link.target.key,(totals.get(link.target.key)||0)+link.value);
}
const grand=[...totals.values()].reduce((t,v)=>t+v,0);
if(grand<=0)return{arcs:[],ribbons:[]};
const padding=Math.min(0.04,TAU/(nodes.length*8||1));
const usable=TAU-padding*nodes.length;
const arcs=[];
let angle=-Math.PI/2;
const cursor=new Map();
for(const node of nodes){
const share=(totals.get(node.key)||0)/grand;
const sweep=share*usable;
arcs.push({node,from:angle,to:angle+sweep});
cursor.set(node.key,angle);
angle+=sweep+padding;
}
const ribbons=[];
for(const link of links.slice().sort((a,b)=>b.value-a.value)){
const sweep=(link.value/grand)*usable;
const from=cursor.get(link.source.key);
const to=cursor.get(link.target.key);
cursor.set(link.source.key,from+sweep);
cursor.set(link.target.key,to+sweep);
ribbons.push({
link,
source:{from,to:from+sweep},
target:{from:to,to:to+sweep},
});
}
return{arcs,ribbons};
}
function drawChord(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
for(const name of['grid','axis','rules','labels'])new Pool(ctx.groups[name]).finish();
const cx=plot.left+plot.width/2;
const cy=plot.top+plot.height/2;
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize;
const room=Math.max(...bound.nodes.map((n)=>textWidth(n.label,size)),0);
const radius=Math.max(10,Math.min(plot.width,plot.height)/2-Math.min(room+8,90));
const inner=radius*0.92;
const{arcs,ribbons}=layoutChord({nodes:bound.nodes,links:bound.links,cx,cy,radius});
const at=(angle,r)=>[cx+r*Math.cos(angle),cy+r*Math.sin(angle)];
const pool=new Pool(ctx.groups.marks);
for(const{link,source,target}of ribbons){
const[x0,y0]=at(source.from,inner);
const[x1,y1]=at(source.to,inner);
const[x2,y2]=at(target.from,inner);
const[x3,y3]=at(target.to,inner);
attrs(pool.next('path',`${NS}__ribbon ${NS}__mark`),{
d:path([
'M',round(x0),round(y0),
'A',round(inner),round(inner),0,0,1,round(x1),round(y1),
'Q',round(cx),round(cy),round(x2),round(y2),
'A',round(inner),round(inner),0,0,1,round(x3),round(y3),
'Q',round(cx),round(cy),round(x0),round(y0),
'Z',
]),
fill:scheme.series(link.source.index),
'fill-opacity':0.55,
'data-link':`${link.source.key}->${link.target.key}`,
});
}
for(const arc of arcs){
const[x0,y0]=at(arc.from,radius);
const[x1,y1]=at(arc.to,radius);
const[x2,y2]=at(arc.to,inner);
const[x3,y3]=at(arc.from,inner);
const large=arc.to-arc.from>Math.PI?1:0;
attrs(pool.next('path',`${NS}__node ${NS}__mark`),{
d:path([
'M',round(x0),round(y0),
'A',round(radius),round(radius),0,large,1,round(x1),round(y1),
'L',round(x2),round(y2),
'A',round(inner),round(inner),0,large,0,round(x3),round(y3),
'Z',
]),
fill:scheme.series(arc.node.index),
'data-node':arc.node.key,
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
for(const arc of arcs){
const mid=(arc.from+arc.to)/2;
const[x,y]=at(mid,radius+6);
const text=labels.next('text',`${NS}__flow-label`);
applySize(text,size);
const rightward=Math.cos(mid)>=0;
attrs(text,{
x:round(x),y:round(y),
'text-anchor':rightward?'start':'end',
'dominant-baseline':'middle',
});
setText(text,arc.node.label);
}
labels.finish();
return{arcs,ribbons,ring:{cx,cy,inner,radius}};
}
function describeLink(link,messages){
return`${link.source.label} → ${link.target.label}: ${measureText(link.value,messages)}`;
}
function flowNodeAt(opts){
for(const node of opts.nodes||[]){
if(typeof node.x!=='number'||typeof node.width!=='number')continue;
if(opts.x>=node.x&&opts.x<=node.x+node.width
&&opts.y>=node.y&&opts.y<=node.y+node.height)return node;
}
return null;
}
function ribbonAt(opts){
let best=null;
let thinnest=Infinity;
for(const link of opts.links||[]){
const source=link.source;
const target=link.target;
if(!source||!target||typeof link.y0!=='number')continue;
const x0=source.x+source.width;
const x1=target.x;
if(opts.x<Math.min(x0,x1)||opts.x>Math.max(x0,x1))continue;
const mid=(x0+x1)/2;
const xAt=(t)=>{
const u=1-t;
return u*u*u*x0+3*u*u*t*mid+3*u*t*t*mid+t*t*t*x1;
};
let lo=0;
let hi=1;
for(let i=0;i<24;i++){
const t=(lo+hi)/2;
if(xAt(t)<opts.x)lo=t;else hi=t;
}
const t=(lo+hi)/2;
const u=1-t;
const y=u*u*u*link.y0+3*u*u*t*link.y0
+3*u*t*t*link.y1+t*t*t*link.y1;
const half=Math.max(1,link.thickness||1)/2;
if(Math.abs(opts.y-y)<=half&&(link.thickness||1)<thinnest){
thinnest=link.thickness||1;
best=link;
}
}
return best;
}
function chordArcAt(opts){
const ring=opts.ring;
if(!ring)return null;
const dx=opts.x-ring.cx;
const dy=opts.y-ring.cy;
const distance=Math.sqrt(dx*dx+dy*dy);
if(distance<ring.inner||distance>ring.radius)return null;
let angle=Math.atan2(dy,dx);
while(angle<CHORD_START)angle+=TAU;
while(angle>=CHORD_START+TAU)angle-=TAU;
for(const arc of opts.arcs||[]){
if(angle>=arc.from&&angle<arc.to)return arc;
}
return null;
}
function chordRibbonAt(opts){
const ring=opts.ring;
if(!ring)return null;
const dx=opts.x-ring.cx;
const dy=opts.y-ring.cy;
if(Math.sqrt(dx*dx+dy*dy)>ring.inner)return null;
for(const ribbon of opts.ribbons||[]){
if(insideRings([chordPolygon(ribbon,ring)],opts.x,opts.y))return ribbon;
}
return null;
}
function chordPolygon(ribbon,ring){
const{cx,cy,inner}=ring;
const at=(angle)=>[cx+inner*Math.cos(angle),cy+inner*Math.sin(angle)];
const points=[];
const arc=(from,to)=>{
for(let i=0;i<=CHORD_STEPS;i++)points.push(at(from+((to-from)*i)/CHORD_STEPS));
};
const through=(a,b)=>{
for(let i=1;i<CHORD_STEPS;i++){
const t=i/CHORD_STEPS;
const u=1-t;
points.push([
u*u*a[0]+2*u*t*cx+t*t*b[0],
u*u*a[1]+2*u*t*cy+t*t*b[1],
]);
}
};
arc(ribbon.source.from,ribbon.source.to);
through(at(ribbon.source.to),at(ribbon.target.from));
arc(ribbon.target.from,ribbon.target.to);
through(at(ribbon.target.to),at(ribbon.source.from));
return points;
}
});
__def("packages/modules/charts/hit.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"valueText",{enumerable:true,get:function(){return valueText;}});
Object.defineProperty(__exports,"ownsGeometry",{enumerable:true,get:function(){return ownsGeometry;}});
Object.defineProperty(__exports,"resolveHit",{enumerable:true,get:function(){return resolveHit;}});
const __m0=__req("packages/modules/charts/format.js");
const measureText=__m0["measureText"];
const __m1=__req("packages/modules/charts/treemap.js");
const tileAt=__m1["tileAt"];
const __m2=__req("packages/modules/charts/geo.js");
const markerAt=__m2["markerAt"];
const regionAt=__m2["regionAt"];
const __m3=__req("packages/modules/charts/matrix.js");
const cellAt=__m3["cellAt"];
const __m4=__req("packages/modules/charts/network.js");
const linkAt=__m4["linkAt"];
const nodeAt=__m4["nodeAt"];
const __m5=__req("packages/modules/charts/flow.js");
const chordArcAt=__m5["chordArcAt"];
const chordRibbonAt=__m5["chordRibbonAt"];
const flowNodeAt=__m5["flowNodeAt"];
const ribbonAt=__m5["ribbonAt"];
const ARROW=' → ';
const JOIN=' – ';
const CRUMB=' › ';
function valueText(value,total,messages){
const text=measureText(value,messages);
if(!total||typeof value!=='number'||!Number.isFinite(value))return text;
const share=value/total;
if(!Number.isFinite(share))return text;
return`${text} (${messages.number(share,{style:'percent',maximumFractionDigits:1})})`;
}
function tileHit(tile,ctx){
const node=tile.item.node;
const total=(ctx.bound.root&&ctx.bound.root.total)||0;
const path=Array.isArray(tile.path)?[...tile.path]:[node.label];
return{
heading:path.length>1?path.join(CRUMB):node.label,
rows:[{
label:ctx.bound.measure.title,
value:valueText(node.total,total,ctx.grid.messages),
colour:ctx.scheme.series(tile.item.index||0),
}],
datum:{
label:node.label,
value:node.total,
category:node.value,
column:ctx.bound.measure.col?ctx.spec.x||null:null,
series:null,
depth:tile.depth,
path,
rowKeys:node.rowKey?[node.rowKey]:[],
},
};
}
function regionHit(region,regions,ctx){
const total=regions.reduce((sum,one)=>sum+(one.value||0),0);
return{
heading:region.label||region.code,
rows:[{
label:ctx.bound.measure.title,
value:valueText(region.value,total,ctx.grid.messages),
colour:ctx.scheme.series(0),
}],
datum:{
label:region.label||region.code,
value:region.value,
category:region.code,
column:ctx.spec.code||ctx.spec.x||null,
series:null,
path:[region.label||region.code],
rowKeys:[],
},
};
}
function markerHit(marker,drawn,ctx){
const valueCol=ctx.spec.value||ctx.spec.y||null;
const column=valueCol?ctx.grid.columns.get(valueCol):null;
const degrees=(value)=>`${Number(value).toFixed(4)}°`;
const status=(drawn.legend||[]).find((entry)=>entry.colour===marker.fill)||null;
const rows=[{
label:(column&&column.title)||valueCol||'',
value:marker.text||'',
colour:marker.fill,
},{
label:'',
value:`${degrees(marker.lat)}, ${degrees(marker.lon)}`,
colour:'transparent',
}];
if(status&&status.label){
rows.push({label:'',value:status.label,colour:marker.fill});
}
return{
heading:marker.label||marker.text||'',
rows,
datum:{
label:marker.label||marker.text||'',
value:marker.value,
category:marker.value,
column:valueCol,
series:null,
path:[marker.label||marker.text||''],
lon:marker.lon,
lat:marker.lat,
status:status?status.label:null,
rowKeys:marker.rowKey?[marker.rowKey]:[],
},
};
}
function cellHit(cell,ctx){
const title=(id)=>{
const column=ctx.grid.columns.get(id);
return(column&&column.title)||id;
};
const rowTitle=title(cell.a);
const colTitle=title(cell.b);
return{
heading:`${rowTitle} × ${colTitle}`,
rows:[{
label:ctx.spec.method==='spearman'?'ρ':'r',
value:typeof cell.r==='number'&&Number.isFinite(cell.r)?cell.r.toFixed(2):'',
colour:ctx.scheme.series(0),
}],
datum:{
label:`${rowTitle} × ${colTitle}`,
value:typeof cell.r==='number'?cell.r:null,
category:null,
column:null,
series:null,
path:[rowTitle,colTitle],
rowKeys:[],
},
};
}
function nodeHit(node,ctx){
const rowKeys=[];
for(const link of(ctx.drawn&&ctx.drawn.links)||[]){
if(link.source!==node&&link.target!==node)continue;
for(const rowKey of link.rowKeys||[])if(!rowKeys.includes(rowKey))rowKeys.push(rowKey);
}
const value=Math.max(node.in||0,node.out||0);
return{
heading:node.label,
rows:[{
label:ctx.bound.measure.title,
value:measureText(value,ctx.grid.messages),
colour:ctx.scheme.series(node.index||0),
}],
datum:{
label:node.label,
value,
category:node.value===undefined?node.key:node.value,
column:null,
series:null,
path:[node.label],
rowKeys,
},
};
}
function linkHit(link,ctx){
const label=`${link.source.label}${link.undirected?JOIN:ARROW}${link.target.label}`;
return{
heading:label,
rows:[{
label:ctx.bound.measure.title,
value:valueText(link.value,link.undirected?0:(ctx.bound.total||0),ctx.grid.messages),
colour:link.colour||ctx.scheme.series(link.source.index||0),
}],
datum:{
label,
value:link.value,
category:null,
column:null,
series:null,
path:[link.source.label,link.target.label],
rowKeys:Array.isArray(link.rowKeys)?[...link.rowKeys]:[],
},
};
}
function ownsGeometry(drawn){
if(!drawn)return false;
if(Array.isArray(drawn.tiles))return true;
if(Array.isArray(drawn.regions))return true;
if(Array.isArray(drawn.markers))return true;
if(Array.isArray(drawn.cells)&&Array.isArray(drawn.columns))return true;
if(Array.isArray(drawn.ribbons)&&drawn.ring)return true;
if(Array.isArray(drawn.nodes)&&Array.isArray(drawn.links))return true;
return false;
}
function resolveHit(ctx){
const drawn=ctx.drawn;
if(!drawn||!ctx.bound||!ownsGeometry(drawn))return null;
const{x,y}=ctx.at;
if(Array.isArray(drawn.tiles)){
const tile=tileAt({tiles:drawn.tiles,x,y});
return tile?tileHit(tile,ctx):null;
}
if(Array.isArray(drawn.regions)){
const region=regionAt({regions:drawn.regions,x,y});
return region?regionHit(region,drawn.regions,ctx):null;
}
if(Array.isArray(drawn.markers)){
const marker=markerAt({markers:drawn.markers,x,y});
return marker?markerHit(marker,drawn,ctx):null;
}
if(Array.isArray(drawn.cells)&&Array.isArray(drawn.columns)){
const cell=cellAt({cells:drawn.cells,x,y});
return cell?cellHit(cell,ctx):null;
}
if(Array.isArray(drawn.ribbons)&&drawn.ring){
const ribbon=chordRibbonAt({ribbons:drawn.ribbons,ring:drawn.ring,x,y});
if(ribbon)return linkHit(ribbon.link,ctx);
const arc=chordArcAt({arcs:drawn.arcs,ring:drawn.ring,x,y});
return arc?nodeHit(arc.node,ctx):null;
}
if(Array.isArray(drawn.nodes)&&Array.isArray(drawn.links)){
const circles=drawn.nodes.some((node)=>typeof node.r==='number');
const node=circles
?nodeAt({nodes:drawn.nodes,x,y})
:flowNodeAt({nodes:drawn.nodes,x,y});
if(node)return nodeHit(node,ctx);
const link=circles
?linkAt({links:drawn.links,x,y})
:ribbonAt({links:drawn.links,x,y});
return link?linkHit(link,ctx):null;
}
return null;
}
});
__def("packages/modules/charts/polar.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"arcBand",{enumerable:true,get:function(){return arcBand;}});
Object.defineProperty(__exports,"drawRadar",{enumerable:true,get:function(){return drawRadar;}});
Object.defineProperty(__exports,"drawGauge",{enumerable:true,get:function(){return drawGauge;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/format.js");
const measureText=__m1["measureText"];
const __m2=__req("packages/modules/charts/scale.js");
const isNumber=__m2["isNumber"];
const measureDomain=__m2["measureDomain"];
const __m3=__req("packages/modules/charts/svg.js");
const attrs=__m3["attrs"];
const path=__m3["path"];
const round=__m3["round"];
const setText=__m3["setText"];
const __m4=__req("packages/modules/charts/styles.js");
const NS=__m4["NS"];
const __m5=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m5["resolveScheme"];
const __m6=__req("packages/modules/charts/labels.js");
const drawAnchoredLabels=__m6["drawAnchoredLabels"];
const labelText=__m6["labelText"];
const TAU=Math.PI*2;
const RINGS=4;
const GAUGE_SWEEP=(TAU*2)/3;
const GAUGE_START=Math.PI/2+(TAU-GAUGE_SWEEP)/2;
function at(cx,cy,r,angle){
const a=angle-Math.PI/2;
return[cx+r*Math.cos(a),cy+r*Math.sin(a)];
}
function arcBand(arc){
const sweep=arc.to-arc.from;
if(sweep<=0)return'';
const inner=Math.max(0,arc.r-arc.width);
const large=sweep>Math.PI?1:0;
const[x0,y0]=at(arc.cx,arc.cy,arc.r,arc.from);
const[x1,y1]=at(arc.cx,arc.cy,arc.r,arc.to);
const[x2,y2]=at(arc.cx,arc.cy,inner,arc.to);
const[x3,y3]=at(arc.cx,arc.cy,inner,arc.from);
return path([
'M',round(x0),round(y0),
'A',round(arc.r),round(arc.r),0,large,1,round(x1),round(y1),
'L',round(x2),round(y2),
'A',round(inner),round(inner),0,large,0,round(x3),round(y3),
'Z',
]);
}
function drawRadar(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const cx=plot.left+plot.width/2;
const cy=plot.top+plot.height/2;
const radius=Math.max(0,Math.min(plot.width,plot.height)/2-ctx.fontSize*2);
const axes=bound.labels;
const visible=bound.series.filter((s)=>!ctx.hidden.has(s.key));
const values=[];
for(const series of visible)for(const point of series.points)values.push(point.y);
const domain=measureDomain(values,{zero:true});
const step=axes.length?TAU/axes.length:TAU;
const radiusOf=(value)=>{
const span=domain.max-domain.min||1;
return Math.max(0,((value-domain.min)/span)*radius);
};
const web=new Pool(ctx.groups.grid);
for(let ring=1;ring<=RINGS;ring++){
const r=(radius*ring)/RINGS;
const points=axes.map((unused,i)=>at(cx,cy,r,i*step));
attrs(web.next('path',`${NS}__web`),{
d:points.length
?path([...points.flatMap(([x,y],i)=>[i?'L':'M',round(x),round(y)]),'Z'])
:'',
fill:'none',
});
}
for(let i=0;i<axes.length;i++){
const[x,y]=at(cx,cy,radius,i*step);
attrs(web.next('path',`${NS}__web`),{
d:path(['M',round(cx),round(cy),'L',round(x),round(y)]),
fill:'none',
});
}
web.finish();
const marks=new Pool(ctx.groups.marks);
for(const series of visible){
const points=[];
for(let i=0;i<axes.length;i++){
const point=series.points[i];
const value=isNumber(point&&point.y)?(point.y):domain.min;
const[x,y]=at(cx,cy,radiusOf(value),i*step);
points.push([round(x),round(y)]);
if(point){point.px=round(x);point.py=round(y);}
}
const d=points.length
?path([...points.flatMap(([x,y],i)=>[i?'L':'M',x,y]),'Z'])
:'';
const colour=scheme.series(series.index);
attrs(marks.next('path',`${NS}__radar-fill ${NS}__mark`),{
d,fill:colour,'data-series':series.index,
});
attrs(marks.next('path',`${NS}__radar-line ${NS}__mark`),{
d,stroke:colour,fill:'none','data-series':series.index,
});
}
marks.finish();
const labels=new Pool(ctx.groups.overlay);
for(let i=0;i<axes.length;i++){
const[x,y]=at(cx,cy,radius+ctx.fontSize,i*step);
const text=labels.next('text',`${NS}__tick`);
const anchor=Math.abs(x-cx)<1?'middle':(x>cx?'start':'end');
attrs(text,{x:round(x),y:round(y),'text-anchor':anchor,'dominant-baseline':'middle'});
setText(text,axes[i]);
}
labels.finish();
if(ctx.labels&&ctx.labels.show){
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
const anchors=[];
for(const series of visible){
for(const point of series.points){
if(!point||point.px===undefined||!isNumber(point.y))continue;
const dx=point.px-cx;
const dy=point.py-cy;
const away=Math.hypot(dx,dy)||1;
anchors.push({
x:round(point.px+(dx/away)*(size*0.8)),
y:round(point.py+(dy/away)*(size*0.8)),
text:labelText(point.y,ctx.labels,ctx.grid),
});
}
}
drawAnchoredLabels({
group:ctx.groups.labels,size,minGap:ctx.labels.minGap,anchors,plot,
});
}
return{centre:{x:cx,y:cy,r:radius},series:visible,axes};
}
function drawGauge(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const series=bound.series[0];
const points=series?series.points.filter((p)=>isNumber(p.y)):[];
const value=points.reduce((t,p)=>t+(p.y),0);
const min=isNumber(ctx.min)?(ctx.min):0;
const max=isNumber(ctx.max)?(ctx.max):Math.max(value,1);
const span=max-min||1;
const share=Math.min(1,Math.max(0,(value-min)/span));
const cx=plot.left+plot.width/2;
const cy=plot.top+plot.height/2;
const radius=Math.max(0,Math.min(plot.width,plot.height)/2-4);
const width=Math.max(6,radius*0.24);
const pool=new Pool(ctx.groups.marks);
attrs(pool.next('path',`${NS}__gauge-track`),{
d:arcBand({cx,cy,r:radius,width,from:GAUGE_START,to:GAUGE_START+GAUGE_SWEEP}),
});
attrs(pool.next('path',`${NS}__gauge-value ${NS}__mark`),{
d:arcBand({
cx,cy,r:radius,width,
from:GAUGE_START,to:GAUGE_START+GAUGE_SWEEP*share,
}),
fill:scheme.series(0),
});
if(isNumber(ctx.target)){
const targetShare=Math.min(1,Math.max(0,((ctx.target)-min)/span));
const angle=GAUGE_START+GAUGE_SWEEP*targetShare;
const[x0,y0]=at(cx,cy,radius-width,angle);
const[x1,y1]=at(cx,cy,radius,angle);
attrs(pool.next('path',`${NS}__gauge-target`),{
d:path(['M',round(x0),round(y0),'L',round(x1),round(y1)]),
fill:'none',
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
const reading=labels.next('text',`${NS}__gauge-reading`);
attrs(reading,{x:round(cx),y:round(cy),'text-anchor':'middle','dominant-baseline':'middle'});
setText(reading,measureText(value,ctx.grid.messages));
const caption=labels.next('text',`${NS}__gauge-caption`);
attrs(caption,{
x:round(cx),y:round(cy+ctx.fontSize*1.6),
'text-anchor':'middle','dominant-baseline':'middle',
});
setText(caption,bound.measure.title||'');
labels.finish();
return{value,domain:{min,max}};
}
});
__def("packages/modules/charts/multiples.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"MAX_PANELS",{enumerable:true,get:function(){return MAX_PANELS;}});
Object.defineProperty(__exports,"panelGrid",{enumerable:true,get:function(){return panelGrid;}});
Object.defineProperty(__exports,"panelRects",{enumerable:true,get:function(){return panelRects;}});
Object.defineProperty(__exports,"splitPanels",{enumerable:true,get:function(){return splitPanels;}});
Object.defineProperty(__exports,"sharedDomain",{enumerable:true,get:function(){return sharedDomain;}});
const MAX_PANELS=24;
function panelGrid(count,into){
if(count<=1)return{columns:1,rows:1};
const ratio=(into.width||1)/(into.height||1);
let columns=Math.max(1,Math.round(Math.sqrt(count*ratio)));
columns=Math.min(columns,count);
const rows=Math.ceil(count/columns);
return{columns,rows};
}
function panelRects(opts){
const count=Math.min(opts.count,MAX_PANELS);
const gap=opts.gap===undefined?10:opts.gap;
const title=opts.titleHeight===undefined?14:opts.titleHeight;
const{columns,rows}=panelGrid(count,opts.plot);
const width=(opts.plot.width-gap*(columns-1))/columns;
const height=(opts.plot.height-gap*(rows-1))/rows;
const out=[];
for(let i=0;i<count;i++){
const column=i%columns;
const row=Math.floor(i/columns);
out.push({
index:i,
x:opts.plot.left+column*(width+gap),
y:opts.plot.top+row*(height+gap)+title,
width:Math.max(0,width),
height:Math.max(0,height-title),
});
}
return out;
}
function splitPanels(bound){
return bound.series.map((series,index)=>({
label:series.label,
key:series.key,
index,
bound:{
...bound,
series:[{...series,index}],
},
}));
}
function sharedDomain(bound,zero,settle){
const values=[];
for(const series of bound.series)for(const point of series.points)values.push(point.y);
return settle(values,{zero});
}
});
__def("packages/modules/charts/stream.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"wiggleBaseline",{enumerable:true,get:function(){return wiggleBaseline;}});
Object.defineProperty(__exports,"drawStream",{enumerable:true,get:function(){return drawStream;}});
Object.defineProperty(__exports,"drawMarimekko",{enumerable:true,get:function(){return drawMarimekko;}});
Object.defineProperty(__exports,"drawViolin",{enumerable:true,get:function(){return drawViolin;}});
const __m0=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m0["drawAxisLines"];
const drawCategoryAxis=__m0["drawCategoryAxis"];
const drawMeasureAxis=__m0["drawMeasureAxis"];
const __m1=__req("packages/modules/charts/distribution.js");
const density=__m1["density"];
const distributionDomain=__m1["distributionDomain"];
const summarise=__m1["summarise"];
const valuesByCategory=__m1["valuesByCategory"];
const __m2=__req("packages/modules/charts/frame.js");
const Pool=__m2["Pool"];
const shouldRotate=__m2["shouldRotate"];
const __m3=__req("packages/modules/charts/format.js");
const formatters=__m3["formatters"];
const __m4=__req("packages/modules/charts/scale.js");
const bandScale=__m4["bandScale"];
const isNumber=__m4["isNumber"];
const linearScale=__m4["linearScale"];
const measureDomain=__m4["measureDomain"];
const __m5=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m5["resolveScheme"];
const __m6=__req("packages/modules/charts/svg.js");
const attrs=__m6["attrs"];
const path=__m6["path"];
const round=__m6["round"];
const __m7=__req("packages/modules/charts/styles.js");
const NS=__m7["NS"];
const VIOLIN_STEPS=32;
function wiggleBaseline(columns){
const out=[];
let previous=0;
for(let i=0;i<columns.length;i++){
const column=columns[i];
const total=column.reduce((t,v)=>t+v,0);
if(i===0){
previous=-total/2;
out.push(previous);
continue;
}
const last=columns[i-1];
let move=0;
const n=column.length;
for(let j=0;j<n;j++){
let below=0;
for(let k=0;k<j;k++)below+=(column[k]||0)-(last[k]||0);
move+=(n-j-0.5)*((column[j]||0)-(last[j]||0))+below*0;
}
previous-=n>0?move/n:0;
out.push(previous);
}
return out;
}
function drawStream(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const visible=bound.series.filter((s)=>!ctx.hidden.has(s.key));
const columns=bound.categories.map((unused,i)=>visible.map((series)=>{
const point=series.points[i];
return isNumber(point&&point.y)?Math.max(0,(point.y)):0;
}));
const baseline=wiggleBaseline(columns);
const spread=[];
columns.forEach((column,i)=>{
spread.push(baseline[i]);
spread.push(baseline[i]+column.reduce((t,v)=>t+v,0));
});
const domain=measureDomain(spread,{zero:false,nice:false});
const yScale=linearScale(domain,[plot.bottom,plot.top]);
const xScale=bandScale(bound.categories,[plot.left,plot.right],0);
const pool=new Pool(ctx.groups.marks);
visible.forEach((series,index)=>{
const upper=[];
const lower=[];
columns.forEach((column,i)=>{
let below=baseline[i];
for(let k=0;k<index;k++)below+=column[k];
const x=round(xScale.centre(bound.categories[i]));
lower.push([x,round(yScale.of(below))]);
upper.push([x,round(yScale.of(below+column[index]))]);
});
const commands=[];
upper.forEach(([x,y],i)=>commands.push(i?'L':'M',x,y));
for(let i=lower.length-1;i>=0;i--)commands.push('L',lower[i][0],lower[i][1]);
commands.push('Z');
attrs(pool.next('path',`${NS}__stream ${NS}__mark`),{
d:path(commands),
fill:scheme.series(series.index),
'data-series':series.index,
});
});
pool.finish();
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels:bound.labels,
fontSize:(ctx.typography&&ctx.typography.small)||ctx.fontSize,
rotated:shouldRotate(bound.labels,xScale.step,ctx.fontSize,
((ctx.axis&&ctx.axis.x)||{}).every),
config:(ctx.axis&&ctx.axis.x)||{},
});
return{xScale,yScale,series:visible};
}
function drawMarimekko(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
const visible=bound.series.filter((s)=>!ctx.hidden.has(s.key));
const totals=bound.categories.map((unused,i)=>visible.reduce((t,series)=>{
const point=series.points[i];
return t+(isNumber(point&&point.y)?Math.abs((point.y)):0);
},0));
const grand=totals.reduce((t,v)=>t+v,0);
if(grand<=0)return{series:visible,columns:[]};
const gap=2;
const usable=plot.width-gap*Math.max(0,bound.categories.length-1);
const yScale=linearScale({min:0,max:100},[plot.bottom,plot.top]);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:20}),
config:(ctx.axis&&ctx.axis.y)||{},
grid:ctx.grid,
size:(ctx.typography&&ctx.typography.small)||ctx.fontSize,
});
drawAxisLines({group:ctx.groups.rules,plot});
const pool=new Pool(ctx.groups.marks);
const columns=[];
let x=plot.left;
bound.categories.forEach((category,i)=>{
const width=(totals[i]/grand)*usable;
let bottom=plot.bottom;
visible.forEach((series,index)=>{
const point=series.points[i];
const value=isNumber(point&&point.y)?Math.abs((point.y)):0;
const share=totals[i]>0?value/totals[i]:0;
const height=share*plot.height;
attrs(pool.next('rect',`${NS}__bar ${NS}__mark`),{
x:round(x),
y:round(bottom-height),
width:round(Math.max(0,width)),
height:round(Math.max(0,height)),
fill:scheme.series(series.index),
'data-series':series.index,
'data-point':i,
});
if(point){
point.px=round(x+width/2);
point.py=round(bottom-height);
}
bottom-=height;
void index;
});
columns.push({category,label:bound.labels[i],x,width,total:totals[i]});
x+=width+gap;
});
pool.finish();
const labels=new Pool(ctx.groups.overlay);
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize;
for(const column of columns){
if(column.width<size*2)continue;
const text=labels.next('text',`${NS}__tick`);
text.style.fontSize=`${size}px`;
attrs(text,{
x:round(column.x+column.width/2),
y:round(plot.top-2),
'text-anchor':'middle',
});
text.textContent=column.label;
}
labels.finish();
return{series:visible,columns};
}
function drawViolin(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
const grouped=valuesByCategory(bound);
const labels=[...grouped.keys()];
const spread=[];
for(const values of grouped.values()){
for(let i=0;i<values.length;i++)spread.push(values[i]);
}
const domain=distributionDomain(spread,ctx.axis);
const yScale=linearScale(domain,[plot.bottom,plot.top]);
const xScale=bandScale(labels,[plot.left,plot.right],0.3);
drawMeasureAxis({
gridGroup:ctx.groups.grid,
axisGroup:ctx.groups.axis,
plot,
scale:yScale,
format:formatters(ctx.grid,{kind:'linear',step:(domain.max-domain.min)/5}),
config:(ctx.axis&&ctx.axis.y)||{},
grid:ctx.grid,
size:(ctx.typography&&ctx.typography.small)||ctx.fontSize,
});
drawCategoryAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
labels,
fontSize:(ctx.typography&&ctx.typography.small)||ctx.fontSize,
rotated:labels.length>6,
config:(ctx.axis&&ctx.axis.x)||{},
});
drawAxisLines({group:ctx.groups.rules,plot});
const pool=new Pool(ctx.groups.marks);
labels.forEach((label,i)=>{
const values=grouped.get(label);
const curve=density(values,domain,VIOLIN_STEPS);
const peak=curve.reduce((max,point)=>Math.max(max,point.density),0)||1;
const half=xScale.bandwidth/2;
const centre=xScale.of(label)+half;
const right=curve.map((point)=>[
round(centre+(point.density/peak)*half),
round(yScale.of(point.at)),
]);
const left=curve.map((point)=>[
round(centre-(point.density/peak)*half),
round(yScale.of(point.at)),
]);
const commands=[];
right.forEach(([x,y],index)=>commands.push(index?'L':'M',x,y));
for(let k=left.length-1;k>=0;k--)commands.push('L',left[k][0],left[k][1]);
commands.push('Z');
attrs(pool.next('path',`${NS}__violin ${NS}__mark`),{
d:path(commands),
fill:scheme.series(i),
'data-point':i,
});
const stats=summarise(values);
if(stats){
attrs(pool.next('path',`${NS}__median ${NS}__mark`),{
d:path([
'M',round(centre-half*0.5),round(yScale.of(stats.median)),
'L',round(centre+half*0.5),round(yScale.of(stats.median)),
]),
stroke:scheme.series(i),
'stroke-width':2,
fill:'none',
});
}
});
pool.finish();
return{
xScale,
yScale,
series:[{
key:'',
label:bound.measure.title,
index:0,
points:labels.map((label)=>{
const stats=summarise(grouped.get(label));
return{x:label,xKey:label,label,y:stats?stats.median:null,rows:(grouped.get(label)||[]).length};
}),
}],
};
}
});
__def("packages/modules/charts/gantt.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"readTasks",{enumerable:true,get:function(){return readTasks;}});
Object.defineProperty(__exports,"drawGantt",{enumerable:true,get:function(){return drawGantt;}});
const __m0=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m0["drawAxisLines"];
const drawBandLabels=__m0["drawBandLabels"];
const drawContinuousAxis=__m0["drawContinuousAxis"];
const __m1=__req("packages/modules/charts/frame.js");
const Pool=__m1["Pool"];
const __m2=__req("packages/modules/charts/format.js");
const formatters=__m2["formatters"];
const __m3=__req("packages/modules/charts/scale.js");
const bandScale=__m3["bandScale"];
const timeScale=__m3["timeScale"];
const toTime=__m3["toTime"];
const __m4=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m4["resolveScheme"];
const __m5=__req("packages/modules/charts/svg.js");
const attrs=__m5["attrs"];
const round=__m5["round"];
const setText=__m5["setText"];
const __m6=__req("packages/modules/charts/styles.js");
const NS=__m6["NS"];
const __m7=__req("packages/modules/charts/typography.js");
const applySize=__m7["applySize"];
const truncateTo=__m7["truncateTo"];
const MIN_ROW=8;
function readTasks(grid,spec,rows){
const tasks=[];
let min=Infinity;
let max=-Infinity;
for(const row of rows){
const from=toTime(grid.rows.value(row.key,spec.start));
const to=toTime(grid.rows.value(row.key,spec.end));
if(from===null||to===null)continue;
const label=spec.label?grid.rows.text(row.key,spec.label):row.key;
const group=spec.series?grid.rows.value(row.key,spec.series):null;
tasks.push({
key:row.key,
label,
group,
from:Math.min(from,to),
to:Math.max(from,to),
});
min=Math.min(min,from,to);
max=Math.max(max,from,to);
}
return{tasks,span:tasks.length?{min,max}:null};
}
function drawGantt(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot}=ctx;
const{tasks,span}=readTasks(ctx.grid,ctx.spec,ctx.rows);
if(!span)return{tasks:[],xScale:null,dropped:0};
const capacity=Math.max(1,Math.floor(plot.height/MIN_ROW));
const shown=tasks.slice(0,capacity);
const dropped=tasks.length-shown.length;
const xScale=timeScale({min:span.min,max:span.max},[plot.left,plot.right]);
const yScale=bandScale(shown.map((task)=>task.key),[plot.top,plot.bottom],0.25);
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize;
drawContinuousAxis({
group:ctx.groups.overlay,
plot,
scale:xScale,
format:formatters(ctx.grid,{kind:'time',span:span.max-span.min}),
config:(ctx.axis&&ctx.axis.x)||{},
grid:ctx.grid,
size,
});
drawBandLabels({
group:ctx.groups.axis,
plot,
scale:yScale,
labels:shown.map((task)=>task.label),
fontSize:size,
});
drawAxisLines({group:ctx.groups.rules,plot});
const groups=[...new Set(shown.map((task)=>String(task.group)))];
const pool=new Pool(ctx.groups.marks);
shown.forEach((task,i)=>{
const y=yScale.of(task.key);
const from=xScale.of(task.from);
const to=xScale.of(task.to);
attrs(pool.next('rect',`${NS}__task ${NS}__mark`),{
x:round(from),
width:round(Math.max(2,to-from)),
y:round(y),
height:round(yScale.bandwidth),
fill:scheme.series(task.group===null?0:groups.indexOf(String(task.group))),
'data-point':i,
'data-key':task.key,
});
task.px=round((from+to)/2);
task.py=round(y+yScale.bandwidth/2);
});
pool.finish();
const notes=new Pool(ctx.groups.labels);
if(dropped>0){
const note=notes.next('text',`${NS}__geo-note`);
applySize(note,size);
attrs(note,{x:round(plot.left),y:round(plot.bottom+size+4),'text-anchor':'start'});
setText(note,truncateTo(
ctx.grid.messages.t('chart.tasksDropped',{count:dropped}),
plot.width,
size,
));
}
notes.finish();
return{
tasks:shown,
xScale,
dropped,
series:[{
key:'',
label:ctx.spec.label||'',
index:0,
points:shown.map((task)=>({
x:task.key,xKey:task.key,label:task.label,y:task.to-task.from,
rows:1,rowKey:task.key,px:task.px,py:task.py,
})),
}],
};
}
});
__def("packages/modules/charts/interaction.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"resolveBrush",{enumerable:true,get:function(){return resolveBrush;}});
Object.defineProperty(__exports,"brushed",{enumerable:true,get:function(){return brushed;}});
Object.defineProperty(__exports,"brushCondition",{enumerable:true,get:function(){return brushCondition;}});
Object.defineProperty(__exports,"attachBrush",{enumerable:true,get:function(){return attachBrush;}});
Object.defineProperty(__exports,"applySelection",{enumerable:true,get:function(){return applySelection;}});
Object.defineProperty(__exports,"attachKeyboard",{enumerable:true,get:function(){return attachKeyboard;}});
const __m0=__req("packages/modules/charts/svg.js");
const attrs=__m0["attrs"];
const BRUSH_MIN=4;
function resolveBrush(spec){
const given=spec&&spec.brush;
if(given===true)return{mode:'filter',axis:'x'};
if(given==='filter'||given==='zoom'||given==='select')return{mode:given,axis:'x'};
if(given&&typeof given==='object'&&given.mode){
const mode=['filter','zoom','select'].includes(given.mode)?given.mode:null;
const axis=given.axis==='y'||given.axis==='y2'?given.axis:'x';
return{mode,axis};
}
return{mode:null,axis:'x'};
}
function brushed(opts){
const{bound,xScale}=opts;
const low=Math.min(opts.from,opts.to);
const high=Math.max(opts.from,opts.to);
if(opts.axis==='y'||opts.axis==='y2'){
const scale=opts.axis==='y2'&&opts.rightScale?opts.rightScale:(opts.yScale||xScale);
if(!scale||typeof scale.invert!=='function'){
return{kind:'range',values:[],range:null,axis:opts.axis};
}
const from=scale.invert(low);
const to=scale.invert(high);
return{kind:'range',values:[],range:[from,to],axis:opts.axis};
}
if(xScale.kind==='band'){
const values=[];
for(const category of bound.categories){
const at=xScale.centre(category);
if(!Number.isNaN(at)&&at>=low&&at<=high)values.push(category);
}
return{kind:'set',values,range:null,axis:'x'};
}
const from=xScale.invert(low);
const to=xScale.invert(high);
return{kind:'range',values:[],range:[from,to],axis:'x'};
}
function brushCondition(opts){
const{column,result}=opts;
if(!column)return null;
if(result.kind==='set'){
if(!result.values.length)return null;
return{col:column,op:'in',value:result.values.slice()};
}
if(!result.range)return null;
const[from,to]=result.range;
if(!Number.isFinite(from)||!Number.isFinite(to))return null;
const value=opts.kind==='time'
?[new Date(Math.min(from,to)),new Date(Math.max(from,to))]
:[Math.min(from,to),Math.max(from,to)];
return{col:column,op:'between',value,bounds:'[]'};
}
function attachBrush(opts){
let start=null;
let band=null;
const vertical=()=>{
const axis=typeof opts.axis==='function'?opts.axis():'x';
const valueAxis=axis==='y'||axis==='y2';
const horizontal=typeof opts.horizontal==='function'?opts.horizontal():false;
return horizontal!==valueAxis;
};
const down=(event)=>{
if(!opts.enabled())return;
const point=opts.pointOf(event);
start=vertical()?point.y:point.x;
const doc=opts.svg.ownerDocument;
band=doc.createElementNS('http://www.w3.org/2000/svg','rect');
band.setAttribute('class','lat-chartview__brush');
opts.overlay.appendChild(band);
};
const move=(event)=>{
if(start===null||!band)return;
const plot=opts.plot();
if(vertical()){
const at=opts.pointOf(event).y;
const from=Math.max(plot.top,Math.min(start,at));
const to=Math.min(plot.bottom,Math.max(start,at));
attrs(band,{
x:plot.left,y:from,width:Math.max(0,plot.right-plot.left),height:Math.max(0,to-from),
});
return;
}
const at=opts.pointOf(event).x;
const from=Math.max(plot.left,Math.min(start,at));
const to=Math.min(plot.right,Math.max(start,at));
attrs(band,{
x:from,y:plot.top,width:Math.max(0,to-from),height:plot.height,
});
};
const up=(event)=>{
if(start===null)return;
const point=opts.pointOf(event);
const at=vertical()?point.y:point.x;
const travelled=Math.abs(at-start);
const from=start;
start=null;
if(band&&band.parentNode)band.parentNode.removeChild(band);
band=null;
if(travelled>=BRUSH_MIN)opts.onBrush(from,at);
};
opts.svg.addEventListener('pointerdown',down);
opts.svg.addEventListener('pointermove',move);
opts.svg.addEventListener('pointerup',up);
opts.svg.addEventListener('pointerleave',up);
return()=>{
opts.svg.removeEventListener('pointerdown',down);
opts.svg.removeEventListener('pointermove',move);
opts.svg.removeEventListener('pointerup',up);
opts.svg.removeEventListener('pointerleave',up);
};
}
function applySelection(opts){
const marks=opts.groups.marks;
const any=opts.keys.size>0||opts.categories.size>0;
let hit=0;
for(const node of marks.childNodes||[]){
if(!node.getAttribute)continue;
const series=Number(node.getAttribute('data-series'));
const point=Number(node.getAttribute('data-point'));
const source=opts.series[series];
const datum=source&&source.points[point];
const selected=!!datum&&(
(datum.rowKey&&opts.keys.has(datum.rowKey))
||(datum.xKey!==undefined&&opts.categories.has(datum.xKey))
);
if(selected)hit++;
if(any&&!selected)node.setAttribute('data-dim','true');
else node.removeAttribute('data-dim');
}
return hit;
}
function attachKeyboard(opts){
let at=0;
const focus=(next)=>{
const marks=opts.marks();
if(!marks.length)return;
at=Math.max(0,Math.min(marks.length-1,next));
for(let i=0;i<marks.length;i++){
marks[i].setAttribute('tabindex',i===at?'0':'-1');
}
if(marks[at].focus)marks[at].focus();
opts.onFocus(at);
};
const key=(event)=>{
const marks=opts.marks();
if(!marks.length)return;
switch(event.key){
case'ArrowRight':
case'ArrowDown':
focus(at+1);
break;
case'ArrowLeft':
case'ArrowUp':
focus(at-1);
break;
case'Home':
focus(0);
break;
case'End':
focus(marks.length-1);
break;
case'Enter':
case' ':
opts.onActivate(at);
break;
default:
return;
}
if(event.preventDefault)event.preventDefault();
};
opts.svg.addEventListener('keydown',key);
return()=>opts.svg.removeEventListener('keydown',key);
}
});
__def("packages/modules/charts/range.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"deriveRangeSpec",{enumerable:true,get:function(){return deriveRangeSpec;}});
const NUMERIC_TYPES=new Set(['number','currency','percent','integer']);
function isNumeric(column){
return!!column&&typeof column.type==='string'&&NUMERIC_TYPES.has(column.type);
}
function newestRange(grid){
const ranges=grid&&grid.selection&&typeof grid.selection.ranges==='function'
?grid.selection.ranges()
:[];
if(!Array.isArray(ranges)||!ranges.length)return null;
return ranges[ranges.length-1];
}
function rowsOfRange(grid,range){
const out=[];
const lo=Math.min(range.startRow,range.endRow);
const hi=Math.max(range.startRow,range.endRow);
for(let i=lo;i<=hi;i++){
const row=grid.rows.get(i);
if(row&&!row.group&&row.data!==null&&row.data!==undefined)out.push(row);
}
return out;
}
function deriveRangeSpec(grid,opts={}){
const none=(reason)=>({
spec:null,type:null,x:null,measures:[],columns:[],reason,
});
const range=opts.range||newestRange(grid);
if(!range)return none('no-range');
const visible=grid.columns.visible();
const visibleIds=new Set(visible.map((c)=>c.id));
const columns=(range.columns||[]).filter((id)=>visibleIds.has(id));
if(!columns.length)return none('no-visible-columns');
const resolved=columns.map((id)=>({id,column:grid.columns.get(id)}));
const numericIds=resolved.filter((c)=>isNumeric(c.column)).map((c)=>c.id);
const categoryIds=resolved.filter((c)=>!isNumeric(c.column)).map((c)=>c.id);
if(!numericIds.length)return none('no-measure');
const x=categoryIds.length?categoryIds[0]:null;
const measures=numericIds;
const rows=rowsOfRange(grid,range);
const base={rows};
const MULTI_MARKS=new Set(['bar','line','area']);
if(measures.length>1){
const requested=opts.type;
const mark=MULTI_MARKS.has(requested)?requested:null;
const type=requested&&!MULTI_MARKS.has(requested)?requested:'combo';
const spec={
...base,
type,
x,
measures:measures.map((col)=>(mark?{col,type:mark}:{col})),
};
return{spec,type,x,measures,columns,reason:null};
}
const type=opts.type||'bar';
const spec={...base,type,x,y:measures[0]};
return{spec,type,x,measures,columns,reason:null};
}
});
__def("packages/modules/charts/regression.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"regressionPlots",{enumerable:true,get:function(){return regressionPlots;}});
const NUMERIC_TYPES=new Set(['number','currency','percent','integer']);
function drawable(spec,extra={}){
return{spec,reason:null,...extra};
}
function absent(reason,extra={}){
return{spec:null,reason,...extra};
}
function scaleLocationPoints(model){
if(!model||!Array.isArray(model.fitted)||!Array.isArray(model.residuals)
||!Array.isArray(model.leverage)||!(model.sigma2>0)){
return null;
}
const s=Math.sqrt(model.sigma2);
const points=[];
for(let i=0;i<model.fitted.length;i++){
const h=model.leverage[i];
if(!Number.isFinite(h)||h>=1)continue;
const denom=s*Math.sqrt(1-h);
if(!(denom>0))continue;
const std=model.residuals[i]/denom;
points.push({x:model.fitted[i],y:Math.sqrt(Math.abs(std)),key:String(i)});
}
return points;
}
function regressionPlots(grid,opts={}){
const model=opts.model
||(grid&&grid.statistics&&typeof grid.statistics.regressionModel==='function'
?grid.statistics.regressionModel(opts.spec||{})
:null);
const allAbsent=(reason)=>({
fit:absent(reason),
residualsFitted:absent(reason),
qq:absent(reason),
multicollinearity:absent(reason),
scaleLocation:absent(reason),
residualsLeverage:absent(reason),
coefficientForest:absent(reason),
});
if(!model||!Array.isArray(model.predictors)||!model.predictors.length||!model.response){
return{model:null,plots:allAbsent('no-model')};
}
const predictors=model.predictors;
const response=model.response;
const rows=opts.rows;
const band=()=>(rows===undefined?{}:{rows});
const fitted=opts.fitted||null;
const residual=opts.residual||null;
const stdResidual=opts.stdResidual||null;
const leverage=opts.leverage||null;
const cooksD=opts.cooksD||null;
const fit=predictors.length===1
?drawable({
type:'scatter',
x:predictors[0],
y:response,
fit:true,
band:model.band||null,
...band(),
})
:absent('multiple-predictors');
const residualsFitted=(fitted&&residual)
?drawable({
type:'scatter',
x:fitted,
y:residual,
reference:[{value:0}],
...band(),
})
:absent('needs-fitted-and-residual-columns');
const qq=residual
?drawable({type:'qq',y:residual,...band()})
:absent('needs-residual-column');
const chartablePredictors=predictors.filter((id)=>{
const column=grid&&grid.columns&&typeof grid.columns.get==='function'
?grid.columns.get(id):null;
return!column||(typeof column.type==='string'&&NUMERIC_TYPES.has(column.type));
});
const multicollinearity=predictors.length>=2
?drawable(
{type:'correlogram',columns:chartablePredictors},
{vif:model.vif||null},
)
:absent('single-predictor',{vif:model.vif||null});
const residualsLeverage=(leverage&&stdResidual)
?drawable({
type:cooksD?'bubble':'scatter',
x:leverage,
y:stdResidual,
...(cooksD?{size:cooksD}:{}),
reference:[{value:0}],
...band(),
})
:absent('needs-leverage-and-standardised-residual-columns');
const slPoints=scaleLocationPoints(model);
const scaleLocation=(slPoints&&slPoints.length)
?drawable({
type:'scatter',
points:slPoints,
fit:true,
dimensionTitle:'Fitted',
measureTitle:'√|standardised residual|',
})
:absent('needs-fitted-model');
const coefPoints=Array.isArray(model.coefficients)
?model.coefficients
.filter((c)=>c&&Number.isFinite(c.estimate)&&Number.isFinite(c.lower)&&Number.isFinite(c.upper))
.map((c)=>({x:c.estimate,label:c.name,lower:c.lower,upper:c.upper}))
:[];
const coefficientForest=coefPoints.length
?drawable(
{
type:'forest',
points:coefPoints,
dimensionTitle:'Coefficient',
measureTitle:'Estimate',
},
{coefficients:model.coefficients||null},
)
:absent('needs-coefficient-intervals',{coefficients:model.coefficients||null});
return{
model,
plots:{
fit,
residualsFitted,
qq,
multicollinearity,
scaleLocation,
residualsLeverage,
coefficientForest,
},
};
}
});
__def("packages/modules/charts/registry.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"registerChartType",{enumerable:true,get:function(){return registerChartType;}});
Object.defineProperty(__exports,"chartTypeDef",{enumerable:true,get:function(){return chartTypeDef;}});
Object.defineProperty(__exports,"registeredChartTypes",{enumerable:true,get:function(){return registeredChartTypes;}});
const REGISTRY=new Map();
function registerChartType(name,def){
if(typeof name!=='string'||!name){
throw new TypeError('[lattice] registerChartType needs a non-empty type name.');
}
if(!def||typeof def.draw!=='function'){
throw new TypeError(`[lattice] registerChartType('${name}') needs a { draw } function.`);
}
REGISTRY.set(name,def);
}
function chartTypeDef(name){
return REGISTRY.get(name)||null;
}
function registeredChartTypes(){
return[...REGISTRY.keys()];
}
});
__def("packages/modules/charts/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"TYPES",{enumerable:true,get:function(){return TYPES;}});
Object.defineProperty(__exports,"Chart",{enumerable:true,get:function(){return Chart;}});
Object.defineProperty(__exports,"createChart",{enumerable:true,get:function(){return createChart;}});
Object.defineProperty(__exports,"deriveRangeSpec",{enumerable:true,get:function(){return deriveRangeSpec;}});
Object.defineProperty(__exports,"regressionPlots",{enumerable:true,get:function(){return regressionPlots;}});
Object.defineProperty(__exports,"chartRange",{enumerable:true,get:function(){return chartRange;}});
Object.defineProperty(__exports,"canChartRange",{enumerable:true,get:function(){return canChartRange;}});
const __m0=__req("packages/modules/charts/cartesian.js");
const aheadOfWindow=__m0["aheadOfWindow"];
const axisWindowSpan=__m0["axisWindowSpan"];
const drawCartesian=__m0["drawCartesian"];
const drawForest=__m0["drawForest"];
const nearestCategory=__m0["nearestCategory"];
const nearestDrawnPoint=__m0["nearestDrawnPoint"];
const staleWindow=__m0["staleWindow"];
const WINDOW_LEAD=__m0["WINDOW_LEAD"];
const windowedBound=__m0["windowedBound"];
const __m1=__req("packages/modules/charts/axis.js");
const createGroups=__m1["createGroups"];
const drawAxisTitle=__m1["drawAxisTitle"];
const normaliseAxes=__m1["normaliseAxes"];
const setPlotClip=__m1["setPlotClip"];
const __m2=__req("packages/modules/charts/bind.js");
const bindHierarchy=__m2["bindHierarchy"];
const bindLinks=__m2["bindLinks"];
const bindMeasures=__m2["bindMeasures"];
const bindPoints=__m2["bindPoints"];
const bindSeries=__m2["bindSeries"];
const leafRows=__m2["leafRows"];
const __m3=__req("packages/modules/charts/frame.js");
const Pool=__m3["Pool"];
const plotRect=__m3["plotRect"];
const __m4=__req("packages/modules/charts/scale.js");
const key=__m4["key"];
const measureDomain=__m4["measureDomain"];
const sqrtScale=__m4["sqrtScale"];
const __m5=__req("packages/modules/charts/format.js");
const measureText=__m5["measureText"];
const __m6=__req("packages/modules/charts/radial.js");
const arcAt=__m6["arcAt"];
const drawRadial=__m6["drawRadial"];
const __m7=__req("packages/modules/charts/distribution.js");
const drawBoxPlot=__m7["drawBoxPlot"];
const drawCapability=__m7["drawCapability"];
const drawControl=__m7["drawControl"];
const drawEcdf=__m7["drawEcdf"];
const drawHistogram=__m7["drawHistogram"];
const drawLorenz=__m7["drawLorenz"];
const drawMovingRange=__m7["drawMovingRange"];
const drawQQ=__m7["drawQQ"];
const __m8=__req("packages/modules/charts/treemap.js");
const drawTreemap=__m8["drawTreemap"];
const __m9=__req("packages/modules/charts/hit.js");
const ownsGeometry=__m9["ownsGeometry"];
const resolveHit=__m9["resolveHit"];
const __m10=__req("packages/modules/charts/combo.js");
const drawCombo=__m10["drawCombo"];
const __m11=__req("packages/modules/charts/polar.js");
const drawGauge=__m11["drawGauge"];
const drawRadar=__m11["drawRadar"];
const __m12=__req("packages/modules/charts/matrix.js");
const drawCandlestick=__m12["drawCandlestick"];
const drawCorrelogram=__m12["drawCorrelogram"];
const drawFunnel=__m12["drawFunnel"];
const drawHeatmap=__m12["drawHeatmap"];
const columnTitle=__m12["title"];
const __m13=__req("packages/modules/charts/multiples.js");
const panelRects=__m13["panelRects"];
const splitPanels=__m13["splitPanels"];
const __m14=__req("packages/modules/charts/geo.js");
const drawGeomap=__m14["drawGeomap"];
const packRegions=__m14["packRegions"];
const projectedPath=__m14["projectedPath"];
const resolvePack=__m14["resolvePack"];
const __m15=__req("packages/modules/charts/projection.js");
const fitted=__m15["fitted"];
const resolveProjection=__m15["resolveProjection"];
const splitAntimeridian=__m15["splitAntimeridian"];
const __m16=__req("packages/modules/charts/flow.js");
const drawChord=__m16["drawChord"];
const drawSankey=__m16["drawSankey"];
const __m17=__req("packages/modules/charts/network.js");
const drawNetwork=__m17["drawNetwork"];
const emphasiseNetwork=__m17["emphasiseNetwork"];
const __m18=__req("packages/modules/charts/stream.js");
const drawMarimekko=__m18["drawMarimekko"];
const drawStream=__m18["drawStream"];
const drawViolin=__m18["drawViolin"];
const __m19=__req("packages/modules/charts/gantt.js");
const drawGantt=__m19["drawGantt"];
const __m20=__req("packages/modules/charts/svg.js");
const attrs=__m20["attrs"];
const append=__m20["append"];
const clear=__m20["clear"];
const el=__m20["el"];
const round=__m20["round"];
const setText=__m20["setText"];
const svg=__m20["svg"];
const __m21=__req("packages/modules/charts/styles.js");
const NS=__m21["NS"];
const injectStyles=__m21["injectStyles"];
const __m22=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m22["resolveScheme"];
const __m23=__req("packages/modules/charts/typography.js");
const applySize=__m23["applySize"];
const resolveType=__m23["resolveType"];
const textWidth=__m23["textWidth"];
const __m24=__req("packages/modules/charts/labels.js");
const collides=__m24["collides"];
const resolveLabels=__m24["resolveLabels"];
const __m25=__req("packages/modules/charts/interaction.js");
const applySelection=__m25["applySelection"];
const attachBrush=__m25["attachBrush"];
const attachKeyboard=__m25["attachKeyboard"];
const brushCondition=__m25["brushCondition"];
const brushed=__m25["brushed"];
const resolveBrush=__m25["resolveBrush"];
const __m26=__req("packages/modules/charts/dense.js");
const downsample=__m26["downsample"];
const markCount=__m26["markCount"];
const wantsCanvas=__m26["wantsCanvas"];
const __m27=__req("packages/modules/charts/range.js");
const deriveRangeSpec=__m27["deriveRangeSpec"];
const __m28=__req("packages/modules/charts/regression.js");
const regressionPlots=__m28["regressionPlots"];
const __m29=__req("packages/modules/charts/registry.js");
const chartTypeDef=__m29["chartTypeDef"];
const registeredChartTypes=__m29["registeredChartTypes"];
const registerChartType=__m29["registerChartType"];
const linearScale=__m4["linearScale"];
const bandScale=__m4["bandScale"];
const extent=__m4["extent"];
const toNumber=__m4["toNumber"];
const isNumber=__m4["isNumber"];
const niceDomain=__m4["niceDomain"];
const linearTicks=__m4["linearTicks"];
const timeScale=__m4["timeScale"];
const toTime=__m4["toTime"];
const niceStep=__m4["niceStep"];
const colourRamp=__m12["colourRamp"];
const path=__m20["path"];
const attr=__m20["attr"];
const __m30=__req("packages/core/src/internal/util.js");
const warnOnce=__m30["warnOnce"];
const drawMeasureAxis=__m1["drawMeasureAxis"];
const drawCategoryAxis=__m1["drawCategoryAxis"];
const drawAxisLines=__m1["drawAxisLines"];
const drawContinuousAxis=__m1["drawContinuousAxis"];
const drawBandLabels=__m1["drawBandLabels"];
const tickValues=__m1["tickValues"];
const density=__m7["density"];
const valuesByCategory=__m7["valuesByCategory"];
const summarise=__m7["summarise"];
const quantile=__m7["quantile"];
const histogram=__m7["histogram"];
const formatters=__m5["formatters"];
Object.defineProperty(__exports,"registerScheme",{enumerable:true,get:function(){return __m22["registerScheme"];}});
Object.defineProperty(__exports,"resolveScheme",{enumerable:true,get:function(){return __m22["resolveScheme"];}});
Object.defineProperty(__exports,"schemeNames",{enumerable:true,get:function(){return __m22["schemeNames"];}});
Object.defineProperty(__exports,"setDefaultScheme",{enumerable:true,get:function(){return __m22["setDefaultScheme"];}});
Object.defineProperty(__exports,"SCHEMES",{enumerable:true,get:function(){return __m22["SCHEMES"];}});
Object.defineProperty(__exports,"PALETTE",{enumerable:true,get:function(){return __m22["PALETTE"];}});
Object.defineProperty(__exports,"registerChartType",{enumerable:true,get:function(){return __m29["registerChartType"];}});
Object.defineProperty(__exports,"registeredChartTypes",{enumerable:true,get:function(){return __m29["registeredChartTypes"];}});
const CHART_TOOLKIT=Object.freeze({
el,svg,attr,attrs,append,clear,path,round,setText,
Pool,plotRect,
linearScale,bandScale,sqrtScale,extent,measureDomain,niceDomain,linearTicks,
timeScale,toTime,niceStep,toNumber,isNumber,key,
drawMeasureAxis,drawCategoryAxis,drawAxisLines,drawContinuousAxis,drawBandLabels,tickValues,
formatters,resolveScheme,colourRamp,
density,valuesByCategory,summarise,quantile,histogram,
resolvePack,packRegions,fitted,resolveProjection,splitAntimeridian,projectedPath,
textWidth,applySize,collides,
NS,
});
const TYPES=Object.freeze([
'line','step','area','rangeArea',
'bar','horizontalBar','waterfall',
'scatter','bubble','forest',
'combo','pareto',
'histogram','boxplot','heatmap','qq','ecdf','lorenz','correlogram','control',
'capability','movingRange',
'pie','donut','sunburst','treemap',
'radar','gauge','funnel','candlestick','geomap',
'sankey','chord','network','stream','marimekko','violin','gantt',
]);
const LABELLED=new Set([
'bar','column','line','area','scatter','bubble','combo','pareto',
'histogram','heatmap','pie','donut','sunburst','treemap','radar','geomap',
]);
const RADIAL=new Set(['pie','donut','sunburst']);
const HIERARCHICAL=new Set(['pie','donut','sunburst','treemap']);
const CORRELOGRAM_MAX=20;
const DISTRIBUTION=new Set(['histogram','boxplot','qq','ecdf','lorenz','control',
'capability','movingRange']);
const READINGS=new Set(['histogram','boxplot','qq','ecdf','lorenz','violin']);
function readingsSpec(spec){
const named=spec.y
||(Array.isArray(spec.measures)&&spec.measures.length?spec.measures[0]:null);
if(!named)return spec;
const col=typeof named==='string'?named:named.col;
if(!col)return spec;
const fn=typeof named==='object'&&named.fn!=null?named.fn:'median';
return{...spec,y:{col,fn}};
}
const MULTI_MEASURE=new Set(['combo','candlestick']);
const DUAL_AXIS=new Set(['bar','line','step','area','scatter','bubble']);
const FLOW=new Set(['sankey','chord','network']);
const PER_ROW=new Set(['gantt']);
const FREEFORM=new Set([
'radar','gauge','funnel','heatmap','geomap','sankey','chord','network',
]);
const FALLBACK=Object.freeze({width:480,height:300});
const MEASURE_LABELS=Object.freeze(['00000']);
const SIDE_LABELLED=new Set(['horizontalBar','forest']);
function leftLabelsFor(type,bound,grid,spec){
if(type==='correlogram'){
const columns=Array.isArray(spec.columns)?spec.columns:[];
return columns.map((id)=>columnTitle(grid,id));
}
if(type==='heatmap')return(bound.series||[]).map((series)=>series.label);
if(type==='gantt'){
return(bound.rows||[]).map((row)=>(spec.label
?grid.rows.text(row.key,spec.label)
:String(row.key)));
}
if(SIDE_LABELLED.has(type))return bound.labels||[];
return MEASURE_LABELS;
}
const WINDOW_TICK_MAX_MS=1000;
const WINDOW_TICK_MIN_MS=50;
let chartSeq=0;
function seconds(ms){
const s=ms/1000;
return`${s>=10?Math.round(s):Math.round(s*10)/10}s`;
}
function exactSeconds(ms){
return`${ms/1000}s`;
}
function viewOf(doc){
return(doc&&doc.defaultView)||globalThis;
}
function resolveContainer(doc,container){
if(!container)return null;
if(typeof container==='string')return doc.querySelector(container);
return container;
}
function inlineStyles(source,clone,view){
const PAINTED=[
'fill','fill-opacity','stroke','stroke-width','stroke-opacity',
'stroke-dasharray','stroke-linejoin','stroke-linecap',
'font-size','font-family','font-weight','opacity','text-anchor',
'dominant-baseline','visibility',
];
const live=[source,...source.querySelectorAll('*')];
const copies=[clone,...clone.querySelectorAll('*')];
for(let i=0;i<live.length&&i<copies.length;i++){
const computed=view.getComputedStyle(live[i]);
const parts=[];
for(const property of PAINTED){
const value=computed.getPropertyValue(property);
if(value)parts.push(`${property}:${value}`);
}
if(parts.length)copies[i].setAttribute('style',parts.join(';'));
}
}
function descend(bound,path){
let node=bound.root;
const walked=[];
for(const label of path){
const next=(node.children||[]).find((child)=>child.label===label);
if(!next||!next.children||!next.children.length)break;
node=next;
walked.push(label);
}
if(!walked.length)return bound;
return{...bound,root:node,path:walked,empty:!node.children.length};
}
function plotOf(drawn,width,height){
if(drawn&&drawn.plot)return drawn.plot;
return{
left:0,top:0,right:width,bottom:height,width,height,
gutter:{left:0,bottom:0,right:0,top:0},
};
}
class Chart{
#id=++chartSeq;
#grid;
#container;
#spec;
#doc;
#root=null;
#svg=null;
#groups=null;
#legend=null;
#tooltip=null;
#tooltipEscapeChecked=false;
#table=null;
#empty=null;
#off=[];
#hidden=new Set();
#drawn=null;
#geoView={zoom:1,offset:[0,0]};
#geoDragFrom=null;
#geoAttribution=null;
#warnedLabels=false;
#warnedError=false;
#bound=null;
#frame=0;
#observer=null;
#containerBox=null;
#mountFlushed=false;
#destroyed=false;
#listeners=new Map();
#scheme=resolveScheme();
#typography=resolveType();
#canvas=null;
#drill=null;
#mark=null;
#windowTimer=null;
#windowPeriod=0;
constructor(opts){
this.#grid=opts.grid;
this.#container=opts.container;
this.#spec=opts.spec;
this.#doc=opts.container.ownerDocument;
this.#build();
this.#listen();
this.draw();
}
#build(){
injectStyles(this.#doc);
const doc=this.#doc;
this.#root=el(doc,'div',NS);
const figure=el(doc,'figure',`${NS}__figure`);
if(this.#spec.title||this.#spec.subtitle){
const caption=el(doc,'figcaption',`${NS}__caption`);
if(this.#spec.title){
const heading=el(doc,'div',`${NS}__title`);
setText(heading,this.#spec.title);
caption.appendChild(heading);
}
if(this.#spec.subtitle){
const sub=el(doc,'div',`${NS}__subtitle`);
setText(sub,this.#spec.subtitle);
caption.appendChild(sub);
}
figure.appendChild(caption);
}
this.#svg=svg(doc,'svg',{
class:`${NS}__plot`,
preserveAspectRatio:'xMidYMid meet',
role:'img',
});
this.#groups=createGroups(doc,this.#svg);
figure.appendChild(this.#svg);
this.#empty=el(doc,'div',`${NS}__empty`);
this.#empty.setAttribute('hidden','');
figure.appendChild(this.#empty);
this.#table=el(doc,'div',`${NS}__table`);
figure.appendChild(this.#table);
this.#legend=el(doc,'div',`${NS}__legend`);
figure.appendChild(this.#legend);
if(this.#spec.footnote){
const note=el(doc,'div',`${NS}__footnote`);
setText(note,this.#spec.footnote);
figure.appendChild(note);
}
this.#geoAttribution=el(doc,'div',`${NS}__attribution`);
this.#geoAttribution.setAttribute('hidden','');
figure.appendChild(this.#geoAttribution);
this.#tooltip=el(doc,'div',`${NS}__tooltip`);
this.#tooltip.setAttribute('hidden','');
this.#root.appendChild(figure);
this.#root.appendChild(this.#tooltip);
this.#container.appendChild(this.#root);
this.#bindPointer();
}
#listen(){
const events=[
'model:changed','rows:changed','filter:changed','sort:changed',
'column:grouped','column:pivoted','cell:changed',
'timeline:seek','timeline:attached','timeline:detached',
];
if(this.#spec.selection){
this.#off.push(this.#grid.on('selection:changed',()=>this.#emphasise()));
}
for(const event of events){
this.#off.push(this.#grid.on(event,()=>this.schedule()));
}
const view=viewOf(this.#doc);
if(view&&typeof view.ResizeObserver==='function'){
this.#containerBox=this.#container.getBoundingClientRect
?this.#container.getBoundingClientRect():null;
this.#observer=new view.ResizeObserver(()=>{
if(!this.#mountFlushed){
this.#mountFlushed=true;
const box=this.#container.getBoundingClientRect
?this.#container.getBoundingClientRect():null;
if(box&&this.#containerBox
&&Math.round(box.width)===Math.round(this.#containerBox.width)
&&Math.round(box.height)===Math.round(this.#containerBox.height)){
return;
}
}
this.schedule();
});
this.#observer.observe(this.#container);
}
}
#plotBox(){
const own=this.#svg&&this.#svg.getBoundingClientRect
?this.#svg.getBoundingClientRect()
:null;
if(own&&own.width>0&&own.height>0)return own;
return this.#container.getBoundingClientRect
?this.#container.getBoundingClientRect()
:FALLBACK;
}
#bindPointer(){
const move=(event)=>{if(!this.#geoDragFrom)this.#hover(event);};
const leave=()=>this.#hideTooltip();
this.#svg.addEventListener('pointermove',move);
this.#svg.addEventListener('pointerleave',leave);
this.#svg.addEventListener('click',(event)=>this.#click(event));
const geoDown=(event)=>{
if(!this.#drawn||!this.#drawn.packed)return;
this.#geoDragFrom={x:event.clientX||0,y:event.clientY||0};
};
const geoMove=(event)=>{
if(!this.#geoDragFrom)return;
const x=event.clientX||0;
const y=event.clientY||0;
this.#panGeoView(x-this.#geoDragFrom.x,y-this.#geoDragFrom.y);
this.#geoDragFrom={x,y};
};
const geoUp=()=>{this.#geoDragFrom=null;};
const geoWheel=(event)=>{
if(!this.#drawn||!this.#drawn.packed)return;
if(event.preventDefault)event.preventDefault();
this.#zoomGeoView(event.deltaY<0?1.15:1/1.15);
};
const geoKey=(event)=>{
if(!this.#drawn||!this.#drawn.packed)return;
const step=40;
if(event.shiftKey&&event.key==='ArrowLeft')this.#panGeoView(-step,0);
else if(event.shiftKey&&event.key==='ArrowRight')this.#panGeoView(step,0);
else if(event.shiftKey&&event.key==='ArrowUp')this.#panGeoView(0,-step);
else if(event.shiftKey&&event.key==='ArrowDown')this.#panGeoView(0,step);
else if(event.key==='+'||event.key==='=')this.#zoomGeoView(1.25);
else if(event.key==='-'||event.key==='_')this.#zoomGeoView(1/1.25);
else if(event.key==='0')this.#resetGeoView();
else return;
if(event.preventDefault)event.preventDefault();
};
this.#svg.addEventListener('pointerdown',geoDown);
this.#svg.addEventListener('pointermove',geoMove);
this.#svg.addEventListener('pointerup',geoUp);
this.#svg.addEventListener('pointerleave',geoUp);
this.#svg.addEventListener('wheel',geoWheel,{passive:false});
this.#svg.addEventListener('keydown',geoKey);
this.#off.push(attachBrush({
svg:this.#svg,
overlay:this.#groups.overlay,
plot:()=>(this.#drawn&&this.#drawn.plot)||{left:0,top:0,right:0,bottom:0,height:0},
pointOf:(event)=>this.#pointOf(event),
axis:()=>resolveBrush(this.#spec).axis,
horizontal:()=>!!(this.#drawn&&this.#drawn.horizontal),
enabled:()=>!!resolveBrush(this.#spec).mode&&!!(this.#drawn&&this.#drawn.xScale),
onBrush:(from,to)=>this.#brush(from,to),
}));
this.#svg.setAttribute('tabindex','0');
this.#off.push(attachKeyboard({
svg:this.#svg,
marks:()=>[...(this.#groups.marks.childNodes||[])].filter((n)=>n.setAttribute),
onFocus:(index)=>this.#describeMark(index),
onActivate:(index)=>this.#activateMark(index),
}));
this.#off.push(()=>{
this.#svg.removeEventListener('pointermove',move);
this.#svg.removeEventListener('pointerleave',leave);
this.#svg.removeEventListener('pointerdown',geoDown);
this.#svg.removeEventListener('pointermove',geoMove);
this.#svg.removeEventListener('pointerup',geoUp);
this.#svg.removeEventListener('pointerleave',geoUp);
this.#svg.removeEventListener('wheel',geoWheel);
this.#svg.removeEventListener('keydown',geoKey);
});
}
#pointOf(event){
const box=this.#svg.getBoundingClientRect
?this.#svg.getBoundingClientRect()
:{left:0,top:0,width:FALLBACK.width,height:FALLBACK.height};
return{x:(event.clientX||0)-box.left,y:(event.clientY||0)-box.top};
}
#categoryAt(at){
return nearestCategory({
bound:{categories:this.#shown().categories},
xScale:this.#drawn.xScale,
at:this.#drawn.horizontal?at.y:at.x,
});
}
#shown(){
const drawn=this.#drawn;
if(drawn&&Array.isArray(drawn.labels)&&Array.isArray(drawn.categories)){
return{labels:drawn.labels,categories:drawn.categories};
}
return{
labels:(this.#bound&&this.#bound.labels)||[],
categories:(this.#bound&&this.#bound.categories)||[],
};
}
#marksAt(at){
if(!this.#drawn||!Array.isArray(this.#drawn.series))return null;
if(this.#drawn.reduced){
return nearestDrawnPoint({
series:this.#drawn.series,
xScale:this.#drawn.xScale,
at:this.#drawn.horizontal?at.y:at.x,
});
}
const index=this.#categoryAt(at);
if(index<0)return null;
return{
index,
entries:this.#drawn.series
.map((series)=>({series,point:series.points[index]}))
.filter((entry)=>entry.point&&entry.point.y!==null),
};
}
#hitAt(at){
return resolveHit({
drawn:this.#drawn,
bound:this.#bound,
spec:this.#spec,
grid:this.#grid,
scheme:this.#scheme,
at,
});
}
#hover(event){
if(!this.#drawn||!this.#bound||this.#spec.tooltip===false)return;
const at=this.#pointOf(event);
const rows=[];
let heading='';
const hit=this.#hitAt(at);
if(hit){
this.#showTooltip(hit.heading,hit.rows,event);
this.emit('hover',{...hit.datum,native:event});
return;
}
if(ownsGeometry(this.#drawn)){
this.#hideTooltip();
return;
}
if(this.#drawn.arcs){
const arc=arcAt({arcs:this.#drawn.arcs,x:at.x,y:at.y});
if(!arc){
this.#hideTooltip();
return;
}
heading=arc.label;
const share=this.#bound.root.total>0?arc.total/this.#bound.root.total:0;
rows.push({
label:this.#bound.measure.title,
value:`${measureText(arc.total,this.#grid.messages)} (${this.#grid.messages.number(share,{style:'percent',maximumFractionDigits:1})})`,
colour:this.#scheme.series(arc.index),
});
}else{
const marks=this.#marksAt(at);
if(!marks){
this.#hideTooltip();
return;
}
heading=this.#shown().labels[marks.index]||'';
for(const entry of marks.entries){
rows.push({
label:entry.series.label,
value:measureText(entry.point.y,this.#grid.messages),
colour:this.#scheme.series(entry.series.index),
});
}
}
if(!rows.length){
this.#hideTooltip();
return;
}
this.#showTooltip(heading,rows,event);
const datum=this.#datumAt(at);
if(datum)this.emit('hover',{...datum,native:event});
}
#showTooltip(heading,rows,event){
const doc=this.#doc;
clear(this.#tooltip);
if(heading){
const title=el(doc,'div',`${NS}__tooltip-row`);
const strong=el(doc,'strong');
setText(strong,heading);
title.appendChild(strong);
this.#tooltip.appendChild(title);
}
for(const row of rows){
const line=el(doc,'div',`${NS}__tooltip-row`);
const swatch=el(doc,'span',`${NS}__swatch`);
swatch.setAttribute('style',`background:${row.colour}`);
const label=el(doc,'span');
setText(label,row.label);
const value=el(doc,'span',`${NS}__tooltip-value`);
setText(value,row.value);
append(line,[swatch,label,value]);
this.#tooltip.appendChild(line);
}
this.#tooltip.removeAttribute('hidden');
this.#positionTooltip(event);
}
#positionTooltip(event){
if(!this.#tooltipEscapeChecked){
this.#tooltipEscapeChecked=true;
if(this.#hasContainingBlockAncestor()){
const body=this.#doc&&this.#doc.body;
if(body&&typeof body.appendChild==='function')body.appendChild(this.#tooltip);
}
}
const view=viewOf(this.#doc);
const margin=12;
const pointerX=(event&&event.clientX)||0;
const pointerY=(event&&event.clientY)||0;
const rect=typeof this.#tooltip.getBoundingClientRect==='function'
?this.#tooltip.getBoundingClientRect()
:{width:0,height:0};
const vw=view.innerWidth||0;
const vh=view.innerHeight||0;
let left=pointerX+margin;
if(vw&&left+rect.width>vw-margin)left=pointerX-margin-rect.width;
left=Math.max(margin,left);
let top=pointerY+margin;
if(vh&&top+rect.height>vh-margin)top=pointerY-margin-rect.height;
top=Math.max(margin,top);
this.#tooltip.style.left=`${Math.round(left)}px`;
this.#tooltip.style.top=`${Math.round(top)}px`;
}
#hasContainingBlockAncestor(){
const view=viewOf(this.#doc);
if(typeof view.getComputedStyle!=='function')return false;
let node=this.#root&&this.#root.parentNode;
while(node){
if(node.nodeType===11&&node.host){node=node.host;continue;}
if(node.nodeType!==1)break;
const style=view.getComputedStyle(node);
if(style&&(
(style.transform&&style.transform!=='none')
||(style.perspective&&style.perspective!=='none')
||(style.filter&&style.filter!=='none')
||(style.backdropFilter&&style.backdropFilter!=='none')
||(style.contain&&/layout|paint|strict|content/.test(style.contain))
))return true;
node=node.parentNode;
}
return false;
}
#hideTooltip(){
if(this.#tooltip)this.#tooltip.setAttribute('hidden','');
this.emit('leave',{});
}
#datumAt(at){
if(!this.#drawn||!this.#bound)return null;
const hit=this.#hitAt(at);
if(hit)return hit.datum;
if(ownsGeometry(this.#drawn))return null;
if(this.#drawn.arcs){
const arc=arcAt({arcs:this.#drawn.arcs,x:at.x,y:at.y});
if(!arc)return null;
return{
label:arc.label,
value:arc.total,
category:arc.node.value,
column:this.#spec.x||null,
series:null,
depth:arc.depth,
path:Array.isArray(arc.path)?[...arc.path]:[arc.label],
rowKeys:arc.node.rowKey?[arc.node.rowKey]:[],
};
}
const marks=this.#marksAt(at);
if(!marks)return null;
const points=marks.entries;
const shown=this.#shown();
const span=points.length===1&&points[0].point.from!==undefined
?{from:points[0].point.from,to:points[0].point.to}
:null;
return{
label:shown.labels[marks.index]||'',
category:shown.categories[marks.index],
column:this.#bound.dimension.col,
value:points.length===1?points[0].point.y:null,
...(span||{}),
series:points.map((entry)=>({
key:entry.series.key,
label:entry.series.label,
value:entry.point.y,
rows:entry.point.rows,
})),
rowKeys:points.map((entry)=>entry.point.rowKey).filter(Boolean),
};
}
#click(event){
if(!this.#drawn||!this.#bound)return;
const datum=this.#datumAt(this.#pointOf(event));
if(!datum)return;
let prevented=false;
const detail=this.emit('click',{
...datum,
native:event,
preventDefault(){prevented=true;},
});
if(prevented||detail.defaultPrevented)return;
if(this.#spec.drill&&this.#bound&&this.#bound.root&&datum.label){
const steps=Array.isArray(datum.path)&&datum.path.length?datum.path:[datum.label];
this.#drill=[...(this.#drill||[]),...steps];
this.emit('drill',{path:[...this.#drill],label:datum.label});
this.draw();
return;
}
if(this.#spec.selection&&Array.isArray(this.#drawn.markers)
&&Array.isArray(datum.rowKeys)&&datum.rowKeys.length){
this.#grid.selection.set([...datum.rowKeys]);
return;
}
if(this.#spec.selection&&this.#spec.type==='network'
&&Array.isArray(datum.rowKeys)&&datum.rowKeys.length){
this.#grid.selection.set([...new Set(datum.rowKeys)]);
return;
}
if(!this.#spec.filterOnClick||!datum.column)return;
this.#grid.filters.set({col:datum.column,op:'eq',value:datum.category});
}
#emphasise(){
if(!this.#drawn)return;
if(Array.isArray(this.#drawn.markers)){
this.#emphasiseMarkers();
return;
}
if(Array.isArray(this.#drawn.links)&&Array.isArray(this.#drawn.nodes)
&&!this.#drawn.series){
emphasiseNetwork({drawn:this.#drawn,keys:new Set(this.#grid.selection.keys())});
return;
}
if(!this.#drawn.series)return;
const keys=this.#grid.selection.keys();
const column=this.#bound&&this.#bound.dimension&&this.#bound.dimension.col;
const categories=new Set();
if(column){
for(const rowKey of keys)categories.add(key(this.#grid.rows.value(rowKey,column)));
}
applySelection({
groups:this.#groups,
series:this.#drawn.series,
keys:new Set(keys),
categories,
});
}
#emphasiseMarkers(){
const keys=new Set(this.#grid.selection.keys());
for(const marker of this.#drawn.markers){
const node=marker.element;
if(!node||!node.setAttribute)continue;
if(keys.size&&!keys.has(marker.rowKey))node.setAttribute('data-dim','true');
else node.removeAttribute('data-dim');
}
}
#brush(from,to){
const brush=resolveBrush(this.#spec);
const mode=brush.mode;
if(!mode||!this.#drawn||!this.#drawn.xScale||!this.#bound)return;
const result=brushed({
bound:this.#bound,
xScale:this.#drawn.xScale,
yScale:this.#drawn.yScale,
rightScale:this.#drawn.rightScale||null,
axis:brush.axis,
from,
to,
});
const detail=this.emit('brush',{
mode,
kind:result.kind,
values:result.values,
range:result.range,
axis:result.axis,
column:(result.axis==='y'||result.axis==='y2')
?((this.#bound.measure&&this.#bound.measure.col)||null)
:this.#bound.dimension.col,
});
if(detail.defaultPrevented)return;
if(mode==='zoom'){
if(result.range){
const key=result.axis==='y2'?'y2':(result.axis==='y'?'y':'x');
this.#spec={
...this.#spec,
axis:{
...(this.#spec.axis||{}),
[key]:{
...((this.#spec.axis||{})[key]||{}),
min:Math.min(result.range[0],result.range[1]),
max:Math.max(result.range[0],result.range[1]),
},
},
};
this.draw();
}
return;
}
if(mode==='select'){
const keys=[];
for(const series of this.#drawn.series||[]){
for(const point of series.points){
if(!point.rowKey)continue;
const inside=result.kind==='set'
?result.values.some((v)=>key(v)===point.xKey)
:true;
if(inside)keys.push(point.rowKey);
}
}
this.#grid.selection.set([...new Set(keys)]);
return;
}
const condition=brushCondition({
column:this.#bound.dimension.col,result,kind:this.#bound.kind,
});
if(condition)this.#grid.filters.set(condition);
}
#describeMark(index){
const node=(this.#groups.marks.childNodes||[])[index];
if(!node||!node.setAttribute)return;
const series=this.#drawn&&this.#drawn.series
?this.#drawn.series[Number(node.getAttribute('data-series'))||0]
:null;
const point=series&&series.points[Number(node.getAttribute('data-point'))||0];
if(!point){
if(!node.getBoundingClientRect)return;
const box=node.getBoundingClientRect();
const hit=this.#hitAt(this.#pointOf({
clientX:box.left+box.width/2,
clientY:box.top+box.height/2,
}));
if(!hit)return;
node.setAttribute('role','img');
node.setAttribute(
'aria-label',
`${hit.heading}: ${hit.rows.map((row)=>row.value).filter(Boolean).join(', ')}`,
);
this.emit('focus',{label:hit.datum.label,value:hit.datum.value,index});
return;
}
node.setAttribute('role','img');
node.setAttribute(
'aria-label',
`${point.label}: ${measureText(point.y,this.#grid.messages)}`,
);
this.emit('focus',{label:point.label,value:point.y,index});
}
#activateMark(index){
const node=(this.#groups.marks.childNodes||[])[index];
if(!node||!node.getBoundingClientRect)return;
const box=node.getBoundingClientRect();
this.#click({clientX:box.left+box.width/2,clientY:box.top+box.height/2});
}
#syncGeoChrome(drawn){
const attribution=(drawn&&drawn.attribution)||'';
if(attribution){
setText(this.#geoAttribution,attribution);
this.#geoAttribution.removeAttribute('hidden');
}else{
this.#geoAttribution.setAttribute('hidden','');
}
const aspect=drawn&&Number.isFinite(drawn.aspect)&&drawn.aspect>0
?drawn.aspect
:null;
if(this.#svg&&this.#svg.style){
if(aspect)this.#svg.style.setProperty('aspect-ratio',String(aspect));
else this.#svg.style.removeProperty('aspect-ratio');
}
}
#resetGeoView(){
this.#geoView={zoom:1,offset:[0,0]};
this.schedule();
}
#zoomGeoView(factor){
const next=this.#geoView.zoom*factor;
this.#geoView={...this.#geoView,zoom:Math.min(8,Math.max(1,next))};
this.schedule();
}
#panGeoView(dxPixels,dyPixels){
const scale=(this.#drawn&&this.#drawn.scale)||0;
if(!scale)return;
const[ox,oy]=this.#geoView.offset;
this.#geoView={
...this.#geoView,
offset:[ox-dxPixels/scale,oy+dyPixels/scale],
};
this.schedule();
}
schedule(){
if(this.#destroyed||this.#frame)return;
const view=viewOf(this.#doc);
const raf=typeof view.requestAnimationFrame==='function'
?view.requestAnimationFrame.bind(view)
:(fn)=>setTimeout(fn,16);
this.#frame=raf(()=>{
this.#frame=0;
this.draw();
})||1;
}
draw(){
if(this.#destroyed)return;
const first=this.#renderPass();
if(!first)return;
const after=this.#plotBox();
const w=Math.round(after.width||FALLBACK.width);
const h=Math.round(after.height||FALLBACK.height);
const final=(w!==first.width||h!==first.height)?this.#renderPass():first;
if(!final)return;
this.emit('draw',{chartType:final.chartType,categories:final.categories,empty:final.empty});
}
#renderPass(){
const box=this.#plotBox();
const width=Math.round(box.width||FALLBACK.width);
const height=Math.round(box.height||FALLBACK.height);
const ext=!TYPES.includes(this.#spec.type)?chartTypeDef(this.#spec.type):null;
const type=(TYPES.includes(this.#spec.type)||ext)?this.#spec.type:'bar';
if(Array.isArray(this.#spec.x)){
warnOnce(
`chart:${this.#id}:x:array`,
`chart "x" expects one column id (a string) and was given an array `
+`[${this.#spec.x.map((v)=>JSON.stringify(v)).join(', ')}]. A chart takes one `
+'category column on "x". For a hierarchy, group the grid — '
+'grid.columns.group([...]) — and the hierarchical types (pie, donut, '
+'sunburst, treemap) read the grouping.',
);
}
const scheme=resolveScheme(this.#spec);
this.#scheme=scheme;
const axis=normaliseAxes(this.#spec.axis);
const messages=this.#grid.messages;
const typography=resolveType(this.#spec);
this.#typography=typography;
const fontSize=typography.small;
const labels=resolveLabels(this.#spec);
if(labels.show&&!LABELLED.has(type)&&!(ext&&ext.labelled)&&!this.#warnedLabels){
this.#warnedLabels=true;
const view=this.#doc&&this.#doc.defaultView;
const out=(view&&view.console)
||(typeof globalThis!=='undefined'?globalThis.console:null);
if(out&&typeof out.warn==='function'){
out.warn(`[lattice] a "${type}" chart does not draw data labels; `
+`"labels" has no effect on it. Types that do: ${[...LABELLED].join(', ')}.`);
}
}
attrs(this.#svg,{viewBox:`0 0 ${width} ${height}`,width,height});
const hierarchical=HIERARCHICAL.has(type)||!!(ext&&ext.hierarchical);
let bound;
if(ext&&typeof ext.bind==='function')bound=ext.bind(this.#grid,this.#spec);
else if(hierarchical){
bound=bindHierarchy(this.#grid,this.#spec);
if(this.#drill&&this.#drill.length)bound=descend(bound,this.#drill);
}
else if(MULTI_MEASURE.has(type))bound=bindMeasures(this.#grid,this.#spec);
else if(DUAL_AXIS.has(type)&&Array.isArray(this.#spec.measures)&&this.#spec.measures.length){
bound=bindMeasures(this.#grid,this.#spec);
}
else if(FLOW.has(type)){
bound=bindLinks(this.#grid,this.#spec,type==='network'
?{perRow:true,nodes:this.#spec.nodes}
:undefined);
}
else if(PER_ROW.has(type)){
const rows=leafRows(this.#grid);
bound={
rows,
series:[],
categories:[],
labels:[],
measure:{col:null,fn:'sum',title:''},
dimension:{col:this.#spec.label||null,title:''},
empty:!rows.length,
};
}
else if(type==='geomap'){
bound=bindSeries(this.#grid,{...this.#spec,x:this.#spec.code||this.#spec.x});
}
else if(Array.isArray(this.#spec.points))bound=bindPoints(this.#spec);
else if(READINGS.has(type))bound=bindSeries(this.#grid,readingsSpec(this.#spec));
else bound=bindSeries(this.#grid,this.#spec);
const now=Date.now();
this.#bound=bound;
const short=type==='candlestick'&&(!bound.series||bound.series.length<4);
const stale=staleWindow(bound,axis&&axis.x,type,now);
const ahead=aheadOfWindow(bound,axis&&axis.x,type,now);
if(ahead){
const column=typeof this.#spec.x==='string'?` "${this.#spec.x}"`:'';
const share=`${Math.round(WINDOW_LEAD*1000)/10}%`;
warnOnce(
`chart:${this.#id}:x:window:ahead`,
`${ahead.count} reading(s) on the x axis${column} were not drawn: stamped up to `
+`${seconds(ahead.lead)} ahead of this device's clock, which is more than the `
+`${exactSeconds(ahead.limit)} (${share} of the ${exactSeconds(ahead.span)} rolling window) a `
+'reading may run ahead and still move the window. This is a producer whose '
+'clock is wrong, not a window that is too narrow: letting that reading carry '
+"the window would push every other producer's recent readings out of it, so "
+"it is left out instead. Correct the producer's clock (NTP), or stamp readings "
+'where they are received.',
);
}
if(stale&&stale.newest!==null){
warnOnce(
`chart:${this.#id}:x:window:stale:${this.#spec.x||''}`,
`the rolling x window covers the last ${stale.span} ms, and the newest of `
+`${stale.points} x value(s) is ${Math.round(stale.age/1000)}s old, `
+'so every mark would be drawn outside the plot. The chart shows its empty '
+'state instead. Seed it with data inside the window, widen axis.x.window.span, '
+'or drop the window while showing history.',
);
}
if(bound.empty||short||stale){
this.#showEmpty(this.#spec.emptyText||messages.t('chart.empty'));
return null;
}
bound=windowedBound(bound,axis&&axis.x,type,now);
this.#bound=bound;
this.#empty.setAttribute('hidden','');
this.#svg.removeAttribute('hidden');
setPlotClip(this.#groups,null);
if(ext){
const plot=ext.freeform
?plotRect({width,height,fontSize,margin:this.#spec.margin})
:plotRect({
width,
height,
fontSize,
margin:this.#spec.margin,
titleSize:typography.axisTitle,
titles:{left:axis.y.title,bottom:axis.x.title,right:axis.y2.title},
yLabels:MEASURE_LABELS,
xLabels:bound.labels,
rotated:true,
});
this.#drawn=ext.draw({
doc:this.#doc,
groups:this.#groups,
plot,
bound,
type,
grid:this.#grid,
fontSize,
hidden:this.#hidden,
scheme,
axis,
typography,
labels,
spec:this.#spec,
geoView:{zoom:this.#geoView.zoom,offset:this.#geoView.offset},
helpers:CHART_TOOLKIT,
})||{};
this.#drawLegend(Array.isArray(this.#drawn.legend)?this.#drawn.legend:[]);
}else if(type==='treemap'){
const plot=plotRect({width,height,fontSize,padding:2,margin:this.#spec.margin});
this.#drawn=drawTreemap({
scheme,
groups:this.#groups,
plot,
tree:bound,
grid:this.#grid,
hidden:this.#hidden,
fontSize,
typography,
labels,
});
this.#drawLegend(bound.root.children.map((child,index)=>({
key:child.label,label:child.label,index,
})));
}else if(RADIAL.has(type)){
const plot=plotRect({width,height,fontSize});
this.#drawn=drawRadial({
scheme,
doc:this.#doc,
groups:this.#groups,
plot,
tree:bound,
type,
grid:this.#grid,
hidden:this.#hidden,
fontSize,
typography,
labels,
});
this.#drawLegend(bound.root.children.map((child,index)=>({
key:child.label,label:child.label,index,
})));
}else{
const plot=FREEFORM.has(type)
?plotRect({
width,
height,
fontSize,
margin:this.#spec.margin,
yLabels:type==='heatmap'
?leftLabelsFor(type,bound,this.#grid,this.#spec)
:[],
xLabels:type==='heatmap'?bound.labels:[],
rotated:true,
})
:plotRect({
width,
height,
fontSize,
margin:this.#spec.margin,
titleSize:typography.axisTitle,
titles:{
left:axis.y.title,
bottom:axis.x.title,
right:axis.y2.title,
},
rightGutter:this.#hasRightAxis(type,bound)?Math.round(fontSize*3):0,
yLabels:leftLabelsFor(type,bound,this.#grid,this.#spec),
xLabels:SIDE_LABELLED.has(type)?[]:bound.labels,
rotated:true,
});
const shared={
doc:this.#doc,
groups:this.#groups,
plot,
bound,
type,
grid:this.#grid,
fontSize,
hidden:this.#hidden,
scheme,
axis,
typography,
labels,
};
if(type!=='geomap')this.#syncGeoChrome(null);
if(this.#spec.multiples){
this.#drawn=this.#drawMultiples(shared);
this.#drawLegend([]);
}else if(type==='combo'||type==='pareto'){
this.#drawn=drawCombo({
...shared,
pareto:type==='pareto',
reference:this.#spec.reference,
annotations:this.#spec.annotations,
});
this.#drawLegend(this.#drawn.series.map((sery)=>({
key:sery.key,label:sery.label,index:sery.index,
})));
}else if(type==='heatmap'){
this.#drawn=drawHeatmap({...shared,diverging:this.#spec.diverging});
this.#drawLegend([]);
}else if(type==='radar'){
this.#drawn=drawRadar(shared);
this.#drawLegend(bound.series.map((sery)=>({
key:sery.key,label:sery.label,index:sery.index,
})));
}else if(type==='gauge'){
this.#drawn=drawGauge({
...shared,min:this.#spec.min,max:this.#spec.max,target:this.#spec.target,
});
this.#drawLegend([]);
}else if(type==='sankey'){
this.#drawn=drawSankey(shared);
this.#drawLegend([]);
}else if(type==='chord'){
this.#drawn=drawChord(shared);
this.#drawLegend([]);
}else if(type==='network'){
this.#drawn=drawNetwork({
...shared,
iterations:this.#spec.iterations,
icon:this.#spec.icon,
linkWidth:this.#spec.linkWidth,
});
this.#drawLegend(Array.isArray(this.#drawn.legend)?this.#drawn.legend:[]);
}else if(type==='stream'){
this.#drawn=drawStream(shared);
this.#drawLegend(bound.series.map((sery)=>({
key:sery.key,label:sery.label,index:sery.index,
})));
}else if(type==='marimekko'){
this.#drawn=drawMarimekko(shared);
this.#drawLegend(bound.series.map((sery)=>({
key:sery.key,label:sery.label,index:sery.index,
})));
}else if(type==='violin'){
this.#drawn=drawViolin(shared);
this.#drawLegend([]);
}else if(type==='gantt'){
this.#drawn=drawGantt({...shared,spec:this.#spec,rows:bound.rows||[]});
this.#drawLegend([]);
}else if(type==='geomap'){
this.#drawn=drawGeomap({
...shared,
shapes:this.#spec.shapes,
codeProperty:this.#spec.codeProperty,
diverging:this.#spec.diverging,
projection:this.#spec.projection,
projectionOptions:this.#spec.projectionOptions,
layer:this.#spec.layer,
graticule:this.#spec.graticule,
zoom:this.#geoView.zoom,
centreOffset:this.#geoView.offset,
});
this.#drawLegend([]);
this.#syncGeoChrome(this.#drawn);
}else if(type==='correlogram'){
this.#drawn=drawCorrelogram({
...shared,
columns:this.#correlogramColumns(),
method:this.#spec.method,
values:this.#spec.values,
});
this.#drawLegend([]);
}else if(type==='forest'){
this.#drawn=drawForest(shared);
this.#drawLegend([]);
}else if(type==='funnel'){
this.#drawn=drawFunnel(shared);
this.#drawLegend([]);
}else if(type==='candlestick'){
this.#drawn=drawCandlestick(shared);
this.#drawLegend([]);
}else if(DISTRIBUTION.has(type)){
if(type==='histogram'){
this.#drawn=drawHistogram({
...shared,buckets:this.#spec.buckets,curve:this.#spec.curve,
});
}else if(type==='movingRange'){
this.#drawn=drawMovingRange(shared);
}else if(type==='control'||type==='capability'){
const measure=this.#spec.y||this.#spec.measure;
const stats=this.#grid&&this.#grid.statistics;
this.#drawn=(type==='capability'?drawCapability:drawControl)({
...shared,
capability:stats&&measure
?stats.capability(measure,{
by:this.#spec.x,
baseline:this.#spec.baseline,
rules:this.#spec.rules,
confidence:this.#spec.confidence,
...(this.#spec.spec||{}),
})
:null,
});
}else if(type==='qq')this.#drawn=drawQQ(shared);
else if(type==='ecdf')this.#drawn=drawEcdf(shared);
else if(type==='lorenz')this.#drawn=drawLorenz(shared);
else this.#drawn=drawBoxPlot(shared);
this.#drawLegend([]);
}else{
this.#drawn=drawCartesian({
...shared,
fit:this.#spec.fit,
trend:this.#spec.trend,
band:this.#spec.band,
error:this.#spec.error,
dense:wantsCanvas({series:bound.series,canvas:this.#spec.canvas}),
downsampleTo:this.#spec.downsample,
stack:this.#spec.stack,
reference:this.#spec.reference,
annotations:this.#spec.annotations,
sizes:this.#sizeScale(bound),
});
this.#drawLegend(bound.series.length>1
?bound.series.map((sery)=>({key:sery.key,label:sery.label,index:sery.index}))
:[]);
}
}
const bars=this.#drawn&&this.#drawn.errorBars;
if(this.#spec.error&&bars&&bars.marks&&!this.#warnedError
&&(!bars.drawn||bars.singleSkipped)){
this.#warnedError=true;
const view=this.#doc&&this.#doc.defaultView;
const out=(view&&view.console)
||(typeof globalThis!=='undefined'?globalThis.console:null);
if(out&&typeof out.warn==='function'){
let message;
if(!bars.drawn){
message=bars.single===bars.marks
?'[lattice] error bars were requested but every mark has a single reading behind it, so '
+'there is no spread to compute. A chart bound to a summary or derived grid sees one '
+'row per mark: bind it to the rows the summary was computed from, or supply a margin '
+'column with `error: { of: "column" }`.'
:'[lattice] error bars were requested but no mark had enough readings to compute an '
+'interval.';
}else{
message=`[lattice] error bars were requested but ${bars.singleSkipped} of ${bars.marks} `
+'marks have a single reading behind them, so their whiskers were not drawn; the other '
+'marks are shown. A bar with no whisker is easily read as the certain one: bind those '
+'categories to the readings they summarise, or supply a margin column with '
+'`error: { of: "column" }`.';
}
out.warn(message);
}
}
if(this.#drawn)this.#drawn.plot=this.#drawn.plot||plotOf(this.#drawn,width,height);
if(this.#bound)this.#bound.outside=(this.#drawn&&this.#drawn.outside)||0;
if(this.#spec.selection)this.#emphasise();
this.#watermark();
this.#describe(type,bound,hierarchical);
this.#syncWindowTimer(axis);
return{
width,height,chartType:type,categories:bound.categories||[],empty:!!bound.empty,
};
}
#syncWindowTimer(axis){
const span=axisWindowSpan(axis&&axis.x);
const period=span
?Math.min(WINDOW_TICK_MAX_MS,Math.max(WINDOW_TICK_MIN_MS,Math.floor(span/4)))
:0;
if(this.#destroyed||!period){this.#stopWindowTimer();return;}
if(this.#windowTimer&&this.#windowPeriod===period)return;
this.#stopWindowTimer();
this.#windowPeriod=period;
const view=viewOf(this.#doc);
const set=(view&&typeof view.setInterval==='function')
?view.setInterval.bind(view):setInterval;
this.#windowTimer=set(()=>{
if(this.#destroyed)return;
if(this.#doc&&this.#doc.hidden)return;
if(this.#root&&this.#root.isConnected===false)return;
this.schedule();
},period);
const handle=(this.#windowTimer);
if(handle&&typeof handle.unref==='function')handle.unref();
}
#stopWindowTimer(){
if(this.#windowTimer===null)return;
const view=viewOf(this.#doc);
const clear=(view&&typeof view.clearInterval==='function')
?view.clearInterval.bind(view):clearInterval;
clear(this.#windowTimer);
this.#windowTimer=null;
this.#windowPeriod=0;
}
#drawMultiples(shared){
const panels=splitPanels(shared.bound);
const rects=panelRects({count:panels.length,plot:shared.plot});
const values=[];
for(const series of shared.bound.series){
for(const point of series.points)values.push(point.y);
}
const domain=measureDomain(values,{zero:shared.type!=='line'});
const titles=new Pool(this.#groups.overlay);
setPlotClip(this.#groups,shared.plot);
const marks=new Pool(this.#groups.marks);
new Pool(this.#groups.grid).finish();
new Pool(this.#groups.axis).finish();
new Pool(this.#groups.rules).finish();
let drawn=null;
for(let i=0;i<rects.length;i++){
const rect=rects[i];
const panel=panels[i];
const plot={
left:rect.x,
top:rect.y,
width:rect.width,
height:rect.height,
right:rect.x+rect.width,
bottom:rect.y+rect.height,
gutter:{left:0,bottom:0},
};
drawn=drawCartesian({
...shared,
plot,
bound:panel.bound,
domain,
pool:marks,
axes:false,
});
const title=titles.next('text',`${NS}__panel-title`);
attrs(title,{x:round(rect.x),y:round(rect.y-4),'text-anchor':'start'});
setText(title,panel.label);
}
marks.finish();
titles.finish();
return{...(drawn||{}),panels:rects,multiples:true};
}
#hasRightAxis(type,bound){
if(type==='combo'||type==='pareto')return true;
if(!DUAL_AXIS.has(type))return false;
if(type==='horizontalBar'||type==='waterfall')return false;
return!!(bound&&Array.isArray(bound.series)
&&bound.series.some((s)=>s.axis==='right'&&!this.#hidden.has(s.key)));
}
#sizeScale(bound){
if(this.#spec.type!=='bubble'||!this.#spec.size)return null;
const values=[];
for(const series of bound.series||[]){
for(const point of series.points)if(typeof point.size==='number')values.push(point.size);
}
const found=extent(values);
if(!found)return null;
return sqrtScale(
found,
[3,Math.max(6,Math.min(28,this.#spec.maxRadius||22))],
);
}
#showEmpty(text){
this.#watermark();
setText(this.#empty,text);
this.#empty.removeAttribute('hidden');
this.#svg.setAttribute('hidden','');
for(const group of Object.values(this.#groups))clear(group);
clear(this.#legend);
clear(this.#table);
this.#drawn=null;
}
#watermark(){
const api=this.#grid.licence;
const wanted=!!(api&&typeof api.watermark==='function'&&api.watermark());
if(!wanted){
if(this.#mark&&this.#mark.parentNode)this.#mark.parentNode.removeChild(this.#mark);
this.#mark=null;
return;
}
if(this.#mark&&this.#mark.parentNode)return;
const doc=this.#doc;
const note=el(doc,'div',`${NS}__watermark`);
note.setAttribute('role','note');
const link=el(doc,'a',`${NS}__watermark-link`);
link.setAttribute('href','https://www.latticegrid.dev');
link.setAttribute('target','_blank');
link.setAttribute('rel','noopener noreferrer');
setText(link,this.#grid.messages.t('licence.watermark'));
note.appendChild(link);
this.#mark=note;
if(this.#root)this.#root.appendChild(note);
}
#legendOptions(){
const given=this.#spec.legend;
if(given===false)return{show:false,position:'bottom',align:'start',shape:'square',maxItems:0,isolate:false};
const config=given&&typeof given==='object'?given:{};
const position=['top','bottom','left','right'].includes(config.position)
?config.position
:'bottom';
return{
show:true,
position,
align:['start','centre','center','end'].includes(config.align)?config.align:'start',
shape:['square','circle','line'].includes(config.shape)?config.shape:'square',
maxItems:Number.isFinite(config.maxItems)&&config.maxItems>0?Number(config.maxItems):0,
isolate:!!config.isolate,
};
}
#correlogramColumns(){
const asked=this.#spec.columns;
if(Array.isArray(asked)&&asked.length)return asked.slice(0,CORRELOGRAM_MAX);
const grid=this.#grid;
if(!grid||!grid.columns||typeof grid.columns.visible!=='function')return[];
return grid.columns.visible()
.filter((c)=>!c.generated&&(c.type==='number'||c.type==='currency'
||c.type==='percent'||c.type==='integer'))
.map((c)=>c.id)
.slice(0,CORRELOGRAM_MAX);
}
#drawLegend(entries){
clear(this.#legend);
const options=this.#legendOptions();
attrs(this.#legend,{
'data-position':options.position,
'data-align':options.align,
});
if(!entries.length||!options.show)return;
const doc=this.#doc;
const shown=options.maxItems?entries.slice(0,options.maxItems):entries;
for(const entry of shown){
const button=el(doc,'button',`${NS}__legend-item`);
button.setAttribute('type','button');
const on=!this.#hidden.has(entry.key);
button.setAttribute('aria-pressed',on?'true':'false');
const swatch=el(doc,'span',`${NS}__swatch ${NS}__swatch--${options.shape}`);
swatch.setAttribute('style',`background:${entry.colour||this.#scheme.series(entry.index)}`);
const label=el(doc,'span');
applySize(label,this.#typography.small);
setText(label,entry.label);
append(button,[swatch,label]);
button.addEventListener('click',()=>{
this.#toggleSeries(entry,entries,options);
});
this.#legend.appendChild(button);
}
if(options.maxItems&&entries.length>shown.length){
const more=el(doc,'span',`${NS}__legend-more`);
applySize(more,this.#typography.small);
setText(more,this.#grid.messages.t('chart.legendMore',{
count:entries.length-shown.length,
}));
this.#legend.appendChild(more);
}
}
#toggleSeries(entry,entries,options){
if(options.isolate){
const others=entries.filter((e)=>e.key!==entry.key);
const alone=others.every((e)=>this.#hidden.has(e.key))&&!this.#hidden.has(entry.key);
this.#hidden.clear();
if(!alone)for(const other of others)this.#hidden.add(other.key);
}else if(this.#hidden.has(entry.key)){
this.#hidden.delete(entry.key);
}else{
this.#hidden.add(entry.key);
}
this.emit('legend',{
label:entry.label,
key:entry.key,
hidden:this.#hidden.has(entry.key),
hiddenKeys:[...this.#hidden],
});
this.draw();
}
#describe(type,bound,radial){
const messages=this.#grid.messages;
const measure=(bound.measure&&bound.measure.title)||'';
const dimension=(bound.dimension&&bound.dimension.title)||'';
const summaryKey=!measure?'chart.summaryType':(dimension&&!radial?'chart.summary':'chart.summaryShare');
const summary=messages.t(summaryKey,{
type:messages.t(`chart.type.${type}`),
measure,
dimension,
});
attrs(this.#svg,{'aria-label':summary});
clear(this.#table);
const doc=this.#doc;
const table=el(doc,'table');
const caption=el(doc,'caption');
setText(caption,messages.t('chart.dataTable'));
table.appendChild(caption);
const head=el(doc,'tr');
const corner=el(doc,'th');
setText(corner,radial?'':dimension);
head.appendChild(corner);
const rows=[];
if(radial&&bound.root){
for(const child of bound.root.children){
const tr=el(doc,'tr');
const th=el(doc,'th');
setText(th,child.label);
const td=el(doc,'td');
setText(td,measureText(child.total,messages));
append(tr,[th,td]);
rows.push(tr);
}
const heading=el(doc,'th');
setText(heading,measure);
head.appendChild(heading);
}else{
const shown=this.#shown();
const table_=this.#drawn&&Array.isArray(this.#drawn.labels)
&&Array.isArray(this.#drawn.series)&&Array.isArray(this.#drawn.categories)
?this.#drawn.series
:(bound.series||[]);
for(const series of table_){
const th=el(doc,'th');
setText(th,series.label);
head.appendChild(th);
}
for(let i=0;i<(shown.labels||[]).length;i++){
const tr=el(doc,'tr');
const th=el(doc,'th');
setText(th,shown.labels[i]);
tr.appendChild(th);
for(const series of table_){
const td=el(doc,'td');
const point=series.points[i];
setText(td,point&&point.y!==null?measureText(point.y,messages):'');
tr.appendChild(td);
}
rows.push(tr);
}
}
table.appendChild(head);
for(const row of rows)table.appendChild(row);
this.#table.appendChild(table);
const described=this.#drawn&&this.#drawn.annotations;
if(Array.isArray(described)&&described.length){
const list=el(doc,'ul',`${NS}__annotation-list`);
for(const anno of described){
if(!anno||!anno.text)continue;
const item=el(doc,'li');
setText(item,anno.text);
list.appendChild(item);
}
if(list.childNodes&&list.childNodes.length)this.#table.appendChild(list);
}
}
on(event,handler){
if(typeof handler!=='function')return()=>{};
if(!this.#listeners.has(event))this.#listeners.set(event,new Set());
this.#listeners.get(event).add(handler);
return()=>{
const set=this.#listeners.get(event);
if(set)set.delete(handler);
};
}
emit(event,payload){
const detail={...payload,type:event,chart:this,grid:this.#grid};
const inline=this.#spec[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`];
const handlers=[...(this.#listeners.get(event)||[])];
if(typeof inline==='function')handlers.unshift(inline);
for(const handler of handlers){
try{
handler(detail);
}catch(err){
const view=viewOf(this.#doc);
if(view.console&&typeof view.console.error==='function'){
view.console.error(`[lattice] a chart "${event}" listener threw`,err);
}
}
}
return detail;
}
data(){
return this.#bound;
}
ascend(levels){
if(!this.#drill||!this.#drill.length)return[];
const rise=Number.isFinite(levels)&&levels>0?Number(levels):this.#drill.length;
this.#drill=this.#drill.slice(0,Math.max(0,this.#drill.length-rise));
this.emit('drill',{path:[...this.#drill],label:this.#drill[this.#drill.length-1]||null});
this.draw();
return[...this.#drill];
}
update(spec){
this.#spec={...this.#spec,...spec};
this.draw();
}
get element(){
return this.#root;
}
toSVG(opts){
if(!this.#svg)return'';
const view=viewOf(this.#doc);
let node=this.#svg;
if(opts&&opts.inlineStyles&&view.getComputedStyle&&this.#svg.cloneNode){
node=this.#svg.cloneNode(true);
inlineStyles(this.#svg,node,view);
node.setAttribute('xmlns','http://www.w3.org/2000/svg');
}
if(typeof view.XMLSerializer==='function'){
return new view.XMLSerializer().serializeToString(node);
}
return node.outerHTML||'';
}
async toPNG(opts){
const view=viewOf(this.#doc);
if(!this.#svg||!view.Image||!this.#doc.createElement)return null;
const scale=(opts&&opts.scale)||view.devicePixelRatio||1;
const box=this.#svg.getBoundingClientRect
?this.#svg.getBoundingClientRect()
:FALLBACK;
const width=Math.max(1,Math.round(box.width||FALLBACK.width));
const height=Math.max(1,Math.round(box.height||FALLBACK.height));
const markup=this.toSVG({inlineStyles:true});
const url=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
const image=new view.Image();
await new Promise((done,fail)=>{
image.onload=done;
image.onerror=()=>fail(new Error('the chart could not be rasterised'));
image.src=url;
});
const canvas=this.#doc.createElement('canvas');
canvas.width=Math.round(width*scale);
canvas.height=Math.round(height*scale);
const context=canvas.getContext('2d');
const background=opts&&'background'in opts?opts.background:'#ffffff';
if(background){
context.fillStyle=background;
context.fillRect(0,0,canvas.width,canvas.height);
}
context.drawImage(image,0,0,canvas.width,canvas.height);
return new Promise((done)=>canvas.toBlob(done,'image/png'));
}
toCSV(){
const bound=this.#bound;
if(!bound)return'';
const cell=(value)=>{
const text=value===null||value===undefined?'':String(value);
return/[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
};
if(bound.root){
const rows=[['Label',bound.measure.title||'Value'].map(cell).join(',')];
for(const child of bound.root.children)rows.push([cell(child.label),cell(child.total)].join(','));
return rows.join('\n');
}
const header=[bound.dimension.title||'',...bound.series.map((one)=>one.label)];
const rows=[header.map(cell).join(',')];
for(let i=0;i<bound.labels.length;i++){
const line=[cell(bound.labels[i])];
for(const one of bound.series){
const point=one.points[i];
line.push(cell(point&&point.y!==null?point.y:''));
}
rows.push(line.join(','));
}
return rows.join('\n');
}
destroy(){
if(this.#destroyed)return;
this.#destroyed=true;
this.#stopWindowTimer();
for(const off of this.#off)off();
this.#off=[];
if(this.#observer)this.#observer.disconnect();
this.#observer=null;
if(this.#root&&this.#root.parentNode)this.#root.parentNode.removeChild(this.#root);
this.#drawn=null;
this.#bound=null;
this.#listeners.clear();
}
}
function createChart(opts){
if(!opts||!opts.grid)throw new Error('createChart needs a grid');
const doc=opts.grid.element?opts.grid.element.ownerDocument:globalThis.document;
const container=resolveContainer(doc,opts.container);
if(!container)throw new Error('createChart needs a container element');
const{grid,container:_ignored,...spec}=opts;
return new Chart({grid,container,spec});
}
function chartRange(grid,opts){
if(!opts||!opts.container)return null;
const derived=deriveRangeSpec(grid,opts);
if(!derived.spec)return null;
const{container,range,...rest}=opts;
const SLOTS=[
{provided:['x'],derivedKeys:['x']},
{provided:['y','measures'],derivedKeys:['y','measures']},
{provided:['series'],derivedKeys:['series']},
];
const spec={...derived.spec};
for(const slot of SLOTS){
if(slot.provided.some((k)=>k in rest)){
for(const key of slot.derivedKeys)delete spec[key];
}
}
return createChart({
...rest,
...spec,
grid,
container,
});
}
function canChartRange(grid,opts={}){
return!!deriveRangeSpec(grid,opts).spec;
}
});
var __entry=__req("packages/modules/charts/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);