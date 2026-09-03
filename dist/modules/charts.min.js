/*!
 * Lattice Grid 1.26.0, charts module
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
Object.defineProperty(__exports,"round",{enumerable:true,get:function(){return round;}});
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
function round(n){
return Math.round(n*100)/100;
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
?Math.min(opts.width/3,margin.left+widest+LABEL_GAP)
:Math.max(BARE_GUTTER,margin.left))+titleRoom(titles.left);
const longest=widestLabel(xLabels.map((l)=>String(l).slice(0,14)),font);
const bottom=(xLabels.length
?(opts.rotated
?Math.min(opts.height/3,LABEL_GAP+longest)
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
function shouldRotate(labels,slot,fontSize){
if(!labels.length||slot<=0)return false;
return widestLabel(labels,fontSize)>slot-4;
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
  --lattice-chart-axis:var(--lattice-foreground-muted,#5b6670)}
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
.${NS}__reference{stroke:var(--lattice-chart-axis);stroke-width:1}
.${NS}__reference-label{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__annotation-line{stroke:var(--lattice-chart-axis);stroke-width:1;stroke-dasharray:4 3;fill:none}
.${NS}__annotation-target{stroke:var(--lattice-success,#107c41);stroke-width:1.5;stroke-dasharray:2 2;fill:none}
.${NS}__annotation-band{stroke:none}
.${NS}__annotation-point{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__annotation-label{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
.${NS}__annotation-list{list-style:none;margin:0;padding:0;
  position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.${NS}__ribbon{stroke:none;fill-opacity:0.62}
.${NS}__ribbon:hover{fill-opacity:0.85}
.${NS}__node{stroke:var(--lattice-background,#fff);stroke-width:1}
.${NS}__edge{stroke:var(--lattice-chart-grid);stroke-opacity:0.7}
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
.${NS}__region{stroke:var(--lattice-background,#fff);stroke-width:0.5}
.${NS}__geo-note{fill:var(--lattice-chart-axis);
  font-size:var(--lattice-font-size-sm,11px)}
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
.${NS}__tooltip{position:absolute;z-index:5;pointer-events:none;max-width:260px;
  padding:5px 8px;border-radius:4px;font-size:var(--lattice-font-size-sm,11px);
  background:var(--lattice-surface,#f7f8f9);color:var(--lattice-foreground,#1c2126);
  border:1px solid var(--lattice-border-color,#dfe3e6);
  box-shadow:var(--lattice-popup-shadow,0 6px 16px -4px rgb(16 20 24/24%))}
.${NS}__tooltip[hidden]{display:none}
.${NS}__tooltip-row{display:flex;align-items:center;gap:5px;white-space:nowrap}
.${NS}__tooltip-value{font-weight:600;margin-inline-start:auto;padding-inline-start:10px}
.${NS}__empty{display:flex;align-items:center;justify-content:center;flex:1 1 auto;
  color:var(--lattice-foreground-muted,#5b6670)}
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
Object.defineProperty(__exports,"drawMeasureAxis",{enumerable:true,get:function(){return drawMeasureAxis;}});
Object.defineProperty(__exports,"drawCategoryAxis",{enumerable:true,get:function(){return drawCategoryAxis;}});
Object.defineProperty(__exports,"drawBandLabels",{enumerable:true,get:function(){return drawBandLabels;}});
Object.defineProperty(__exports,"drawContinuousAxis",{enumerable:true,get:function(){return drawContinuousAxis;}});
Object.defineProperty(__exports,"drawAxisLines",{enumerable:true,get:function(){return drawAxisLines;}});
Object.defineProperty(__exports,"createGroups",{enumerable:true,get:function(){return createGroups;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/svg.js");
const attrs=__m1["attrs"];
const round=__m1["round"];
const setText=__m1["setText"];
const svg=__m1["svg"];
const __m2=__req("packages/modules/charts/typography.js");
const applySize=__m2["applySize"];
const truncateTo=__m2["truncateTo"];
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
const GAP=6;
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
setText(node,opts.text);
opts.group.appendChild(node);
}
function drawMeasureAxis(opts){
const{gridGroup,axisGroup,plot,scale,format}=opts;
const config=opts.config||{};
const values=tickValues(scale,config);
const label=tickLabeller(config,format,opts.grid);
const size=opts.size||11;
const lines=config.grid===false?null:gridGroup;
const grid=lines?new Pool(lines):null;
const labels=new Pool(axisGroup);
for(const value of values){
const at=round(scale.of(value));
const zero=value===0;
if(opts.horizontal){
if(grid)attrs(grid.next('line',`${NS}__gridline`),{
x1:at,x2:at,y1:round(plot.top),y2:round(plot.bottom),
'stroke-opacity':zero?1:0.6,
'stroke-width':zero?1.5:1,
});
if(config.labels===false)continue;
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
if(config.labels===false)continue;
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
const every=Number.isFinite(config.every)&&config.every>0?Number(config.every):1;
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
setText(text,truncateTo(label,plot.gutter.bottom*1.6,fontSize));
}else{
attrs(text,{
x:centre,y:round(plot.bottom+GAP),'text-anchor':'middle',
'dominant-baseline':'hanging',transform:null,
});
setText(text,truncateTo(label,slot,fontSize));
}
}
pool.finish();
}
function drawBandLabels(opts){
const{group,plot,scale,labels}=opts;
const pool=new Pool(group);
const categories=scale.domain;
for(let i=0;i<categories.length;i++){
const centre=round(scale.centre(categories[i]));
if(Number.isNaN(centre))continue;
const text=pool.next('text',`${NS}__tick`);
attrs(text,{
x:round(plot.left-GAP),y:centre,'text-anchor':'end',
'dominant-baseline':'middle',
});
applySize(text,opts.fontSize);
setText(text,truncateTo(labels[i]===undefined?'':labels[i],plot.gutter.left,opts.fontSize));
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
function createGroups(doc,parent){
const groups={
grid:svg(doc,'g',{class:`${NS}__grid`}),
marks:svg(doc,'g',{class:`${NS}__marks`}),
rules:svg(doc,'g',{class:`${NS}__axis`}),
axis:svg(doc,'g',{class:`${NS}__axis`}),
labels:svg(doc,'g',{class:`${NS}__labels`}),
overlay:svg(doc,'g',{class:`${NS}__overlay`}),
};
for(const name of['grid','marks','rules','axis','labels','overlay']){
parent.appendChild(groups[name]);
}
return groups;
}
});
__def("packages/modules/charts/format.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"precisionFor",{enumerable:true,get:function(){return precisionFor;}});
Object.defineProperty(__exports,"axisNumber",{enumerable:true,get:function(){return axisNumber;}});
Object.defineProperty(__exports,"dateFormatFor",{enumerable:true,get:function(){return dateFormatFor;}});
Object.defineProperty(__exports,"formatters",{enumerable:true,get:function(){return formatters;}});
Object.defineProperty(__exports,"measureText",{enumerable:true,get:function(){return measureText;}});
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
function timeTicks(domain,count=5){
const span=domain.max-domain.min;
const target=span/Math.max(1,count);
let step=TIME_STEPS[TIME_STEPS.length-1];
for(const candidate of TIME_STEPS){
if(candidate>=target){
step=candidate;
break;
}
}
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
if(!given)return{show:false,position:'outside',format:null,minGap:2,total:false};
const config=typeof given==='object'?given:{};
return{
show:true,
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
const __m3=__req("packages/modules/charts/styles.js");
const NS=__m3["NS"];
const KINDS=new Set(['line','target','band','callout']);
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
const pool=new Pool(group);
const described=[];
const list=Array.isArray(opts.annotations)?opts.annotations:[];
const ordered=[...list].sort((a,b)=>bandFirst(a)-bandFirst(b));
for(const anno of ordered){
const kind=anno.kind||'line';
if(!KINDS.has(kind))continue;
const axis=annotationAxis(anno);
const scale=axis==='right'&&rightScale?rightScale:yScale;
if(kind==='band'){
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
described.push({text:anno.label?`${anno.label} (marker)`:''});
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
__def("packages/modules/charts/cartesian.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"CARTESIAN",{enumerable:true,get:function(){return CARTESIAN;}});
Object.defineProperty(__exports,"drawFits",{enumerable:true,get:function(){return drawFits;}});
Object.defineProperty(__exports,"drawReferenceLines",{enumerable:true,get:function(){return drawReferenceLines;}});
Object.defineProperty(__exports,"drawCartesian",{enumerable:true,get:function(){return drawCartesian;}});
Object.defineProperty(__exports,"nearestCategory",{enumerable:true,get:function(){return nearestCategory;}});
Object.defineProperty(__exports,"categoryKeyAt",{enumerable:true,get:function(){return categoryKeyAt;}});
const __m0=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m0["drawAxisLines"];
const drawAxisTitle=__m0["drawAxisTitle"];
const drawBandLabels=__m0["drawBandLabels"];
const drawCategoryAxis=__m0["drawCategoryAxis"];
const drawContinuousAxis=__m0["drawContinuousAxis"];
const drawMeasureAxis=__m0["drawMeasureAxis"];
const __m1=__req("packages/modules/charts/frame.js");
const Pool=__m1["Pool"];
const shouldRotate=__m1["shouldRotate"];
const __m2=__req("packages/modules/charts/format.js");
const formatters=__m2["formatters"];
const __m3=__req("packages/modules/charts/scale.js");
const bandScale=__m3["bandScale"];
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
function xScaleFor(bound,plot,type){
const range=([plot.left,plot.right]);
if(bound.kind==='category'||type==='bar'){
return bandScale(bound.categories,range,type==='bar'?0.2:0.4);
}
const numbers=bound.kind==='time'
?bound.categories.map(toTime)
:bound.categories.map(toNumber);
const domain=measureDomain(numbers,{zero:false,nice:bound.kind!=='time'});
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
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
const x=round(xOf(xScale,point));
if(!isNumber(point.y)||Number.isNaN(x)){
open=false;
continue;
}
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
if(!fill)return;
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
function drawReferenceLines(opts){
const pool=new Pool(opts.group);
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
const pool=new Pool(group);
const conf=Number.isFinite(Number(options.confidence))?Number(options.confidence):0.95;
const cap=4;
let drawn=0;
let marks=0;
let single=0;
for(const sery of series){
for(const point of sery.points){
if(point.y===null||point.y===undefined)continue;
marks++;
if(Array.isArray(point.values)&&point.values.length===1)single++;
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
if(lower===null||!Number.isFinite(lower)||!Number.isFinite(upper))continue;
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
return{drawn,marks,single};
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
:xScaleFor(bound,plot,type);
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
rotated:shouldRotate(bound.labels,xScale.step,type_.small),
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
if(shape.marks==='path'||type==='scatter'||type==='bubble'){
for(const series of visible){
if(series.points.length>target*1.5){
series.points=downsample(
series.points.map((point,i)=>({...point,x:i})),
target,
);
}
}
}
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
return{
xScale,yScale,rightScale,dual,series:visible,horizontal,percent,plot,errorBars,annotations,
};
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
Object.defineProperty(__exports,"measureOf",{enumerable:true,get:function(){return measureOf;}});
Object.defineProperty(__exports,"walkRows",{enumerable:true,get:function(){return walkRows;}});
Object.defineProperty(__exports,"leafRows",{enumerable:true,get:function(){return leafRows;}});
Object.defineProperty(__exports,"selectedRows",{enumerable:true,get:function(){return selectedRows;}});
Object.defineProperty(__exports,"topGroups",{enumerable:true,get:function(){return topGroups;}});
Object.defineProperty(__exports,"scaleKindFor",{enumerable:true,get:function(){return scaleKindFor;}});
Object.defineProperty(__exports,"bindSeries",{enumerable:true,get:function(){return bindSeries;}});
Object.defineProperty(__exports,"bindMeasures",{enumerable:true,get:function(){return bindMeasures;}});
Object.defineProperty(__exports,"bindLinks",{enumerable:true,get:function(){return bindLinks;}});
Object.defineProperty(__exports,"bindHierarchy",{enumerable:true,get:function(){return bindHierarchy;}});
const __m0=__req("packages/modules/charts/scale.js");
const key=__m0["key"];
const toNumber=__m0["toNumber"];
const AGGREGATIONS={
sum:(v)=>v.reduce((t,n)=>t+n,0),
avg:(v)=>(v.length?v.reduce((t,n)=>t+n,0)/v.length:0),
min:(v)=>(v.length?Math.min(...v):0),
max:(v)=>(v.length?Math.max(...v):0),
count:(v,rows)=>rows,
countValues:(v)=>v.length,
first:(v)=>(v.length?v[0]:0),
last:(v)=>(v.length?v[v.length-1]:0),
};
const DEFAULT_AGGREGATION='sum';
function measureOf(y){
if(!y)return{col:null,fn:DEFAULT_AGGREGATION};
if(typeof y==='string')return{col:y,fn:DEFAULT_AGGREGATION};
const fn=typeof y.fn==='string'&&y.fn in AGGREGATIONS?y.fn:DEFAULT_AGGREGATION;
return{col:y.col||null,fn};
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
function scaleKindFor(column,values){
const type=column&&typeof column.type==='string'?column.type:'';
if(type==='date'||type==='datetime')return'time';
if(values.length&&values.every((v)=>v instanceof Date))return'time';
if(NUMERIC_TYPES.includes(type)){
const distinct=new Set(values.map(key));
return distinct.size>12?'linear':'category';
}
return'category';
}
function bindSeries(grid,spec){
const measure=measureOf(spec.y);
const dimensionId=spec.x||null;
const seriesId=spec.series
||(typeof spec.multiples==='string'?spec.multiples:null)
||null;
const columns=grid.columns;
const dimensionColumn=dimensionId?columns.get(dimensionId):undefined;
const measureColumn=measure.col?columns.get(measure.col):undefined;
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
const kind=scaleKindFor(dimensionColumn,seenValues);
const numeric=NUMERIC_TYPES.includes(
dimensionColumn&&typeof dimensionColumn.type==='string'?dimensionColumn.type:'',
);
const limited=kind==='category'&&numeric
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
function bindLinks(grid,spec){
const measure=measureOf(spec.y);
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
for(const row of leafRows(grid)){
const from=grid.rows.value(row.key,sourceCol);
const to=grid.rows.value(row.key,targetCol);
if(from===null||from===undefined||to===null||to===undefined)continue;
const amount=measure.col?toNumber(grid.rows.value(row.key,measure.col)):1;
if(amount===null||amount<=0)continue;
const a=node(from,row,sourceCol);
const b=node(to,row,targetCol);
const id=`${a.key}\u0000${b.key}`;
const link=links.get(id)||{source:a,target:b,value:0,rowKeys:[]};
link.value+=amount;
if(link.rowKeys.length<64)link.rowKeys.push(row.key);
links.set(id,link);
a.out+=amount;
b.in+=amount;
}
const ordered=[...links.values()].sort((x,y)=>y.value-x.value);
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
const TAU=Math.PI*2;
const START=-Math.PI/2;
const LABEL_MIN_SWEEP=0.25;
const DONUT_HOLE=0.58;
function polar(cx,cy,r,angle){
return[cx+r*Math.cos(angle),cy+r*Math.sin(angle)];
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
const place=(node,from,to,depth,index)=>{
if(depth>0){
arcs.push({node,from,to,depth,index,label:node.label,total:node.total});
}
if(depth>=tree.maxRings||!node.children.length)return;
const sum=node.children.reduce((t,c)=>t+c.total,0);
const span=to-from;
if(sum<=0||span<=0)return;
let cursor=from;
for(let i=0;i<node.children.length;i++){
const child=node.children[i];
const width=(child.total/sum)*span;
place(child,cursor,cursor+width,depth+1,depth===0?i:index);
cursor+=width;
}
};
place(tree.root,START,START+TAU,0,0);
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
const labels=new Pool(ctx.groups.overlay);
for(const arc of arcs){
if(arc.depth!==1||arc.to-arc.from<LABEL_MIN_SWEEP)continue;
const mid=(arc.from+arc.to)/2;
const at=arc.geometry.inner+(arc.geometry.outer-arc.geometry.inner)/2;
const[x,y]=polar(cx,cy,at,mid);
const text=labels.next('text',`${NS}__slice-label`);
attrs(text,{x:round(x),y:round(y),'dominant-baseline':'middle'});
setText(text,arc.label);
}
labels.finish();
if(ctx.labels&&ctx.labels.show){
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
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
Object.defineProperty(__exports,"histogram",{enumerable:true,get:function(){return histogram;}});
Object.defineProperty(__exports,"valuesByCategory",{enumerable:true,get:function(){return valuesByCategory;}});
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
function histogram(values,buckets=12){
const numbers=values.filter(isNumber);
if(!numbers.length)return[];
let min=Math.min(...numbers);
let max=Math.max(...numbers);
if(min===max){
const pad=Math.abs(min)>0?Math.abs(min)/10:0.5;
min-=pad;
max+=pad;
}
const step=niceStep((max-min)/Math.max(1,buckets));
const first=Math.floor(min/step)*step;
const last=Math.ceil(max/step)*step;
const out=[];
for(let edge=first;edge<last-step/1e6;edge+=step){
out.push({from:Number(edge.toPrecision(12)),to:Number((edge+step).toPrecision(12)),count:0});
}
if(!out.length)out.push({from:first,to:first+step,count:0});
for(const v of numbers){
let index=Math.floor((v-first)/step);
if(index>=out.length)index=out.length-1;
if(index<0)index=0;
out[index].count++;
}
return out;
}
function valuesByCategory(bound){
const out=new Map();
for(const series of bound.series){
for(const point of series.points){
if(!isNumber(point.y))continue;
const key=point.label;
if(!out.has(key))out.set(key,[]);
out.get(key).push((point.y));
}
}
return out;
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
function drawHistogram(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
const values=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y))values.push(point.y);
}
const buckets=histogram(values,ctx.buckets||12);
const counts=buckets.map((b)=>b.count);
const yDomain=measureDomain(counts,{zero:true});
const yScale=linearScale(yDomain,[plot.bottom,plot.top]);
const labels=buckets.map((b)=>String(b.from));
const xScale=bandScale(labels,[plot.left,plot.right],0.08);
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
x:round(xScale.of(labels[i])),
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
x:round(xScale.of(labels[i])+xScale.bandwidth/2),
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
series:[{
key:'',
label:bound.measure.title,
index:0,
points:buckets.map((b,i)=>({
x:labels[i],xKey:labels[i],label:`${b.from} – ${b.to}`,y:b.count,rows:b.count,
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
const yDomain=measureDomain(spread,{zero:false});
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
const values=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y))values.push(point.y);
}
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
const values=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y))values.push(point.y);
}
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
const values=[];
for(const series of bound.series){
for(const point of series.points)if(isNumber(point.y)&&point.y>=0)values.push(point.y);
}
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
const LABEL_MIN=34;
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
function drawTreemap(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,tree}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const items=tree.root.children
.filter((child)=>!ctx.hidden.has(child.label))
.map((child,index)=>({node:child,value:child.total,index}));
const tiles=squarify(items,{
x:plot.left,y:plot.top,width:plot.width,height:plot.height,
});
const pool=new Pool(ctx.groups.marks);
for(const tile of tiles){
attrs(pool.next('rect',`${NS}__tile ${NS}__mark`),{
x:round(tile.x),
y:round(tile.y),
width:round(Math.max(0,tile.width)),
height:round(Math.max(0,tile.height)),
fill:scheme.series(tile.item.index),
'data-point':tile.item.index,
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
for(const tile of tiles){
if(tile.width<LABEL_MIN||tile.height<ctx.fontSize*1.6)continue;
const text=labels.next('text',`${NS}__tile-label`);
attrs(text,{
x:round(tile.x+6),
y:round(tile.y+ctx.fontSize+2),
'text-anchor':'start',
});
setText(text,tile.item.node.label);
}
labels.finish();
if(ctx.labels&&ctx.labels.show){
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize||11;
drawAnchoredLabels({
group:ctx.groups.labels,
size,
minGap:ctx.labels.minGap,
anchors:tiles
.filter((tile)=>tile.width>=LABEL_MIN&&tile.height>=ctx.fontSize*1.6+size)
.sort((a,b)=>(b.width*b.height)-(a.width*a.height))
.map((tile)=>({
x:round(tile.x+6),
y:round(tile.y+ctx.fontSize*2+4),
text:labelText(tile.item.value,ctx.labels,ctx.grid),
anchor:'start',
inside:true,
width:tile.width-12,
})),
});
}
return{tiles};
}
function tileAt(opts){
for(const tile of opts.tiles){
if(opts.x>=tile.x&&opts.x<=tile.x+tile.width
&&opts.y>=tile.y&&opts.y<=tile.y+tile.height)return tile;
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
__def("packages/modules/charts/matrix.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"colourRamp",{enumerable:true,get:function(){return colourRamp;}});
Object.defineProperty(__exports,"drawHeatmap",{enumerable:true,get:function(){return drawHeatmap;}});
Object.defineProperty(__exports,"drawFunnel",{enumerable:true,get:function(){return drawFunnel;}});
Object.defineProperty(__exports,"drawCandlestick",{enumerable:true,get:function(){return drawCandlestick;}});
Object.defineProperty(__exports,"drawCorrelogram",{enumerable:true,get:function(){return drawCorrelogram;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/axis.js");
const drawAxisLines=__m1["drawAxisLines"];
const drawBandLabels=__m1["drawBandLabels"];
const drawCategoryAxis=__m1["drawCategoryAxis"];
const drawMeasureAxis=__m1["drawMeasureAxis"];
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
const widest=Math.max(...stages.map((stage)=>stage.value));
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
for(let i=0;i<size;i++){
const down=labels.next('text',`${NS}__tick`);
applySize(down,ctx.fontSize);
attrs(down,{
x:round(plot.left-4),
y:round(plot.top+i*cellH+cellH/2),
'text-anchor':'end',
'dominant-baseline':'middle',
});
setText(down,title(ctx.grid,columns[i]));
const across=labels.next('text',`${NS}__tick`);
applySize(across,ctx.fontSize);
attrs(across,{
x:round(plot.left+i*cellW+cellW/2),
y:round(plot.top-4),
'text-anchor':'middle',
});
setText(across,title(ctx.grid,columns[i]));
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
Object.defineProperty(__exports,"ringPath",{enumerable:true,get:function(){return ringPath;}});
Object.defineProperty(__exports,"shapesToPaths",{enumerable:true,get:function(){return shapesToPaths;}});
Object.defineProperty(__exports,"drawGeomap",{enumerable:true,get:function(){return drawGeomap;}});
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/matrix.js");
const colourRamp=__m1["colourRamp"];
const __m2=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m2["resolveScheme"];
const __m3=__req("packages/modules/charts/scale.js");
const isNumber=__m3["isNumber"];
const measureDomain=__m3["measureDomain"];
const __m4=__req("packages/modules/charts/svg.js");
const attrs=__m4["attrs"];
const path=__m4["path"];
const round=__m4["round"];
const setText=__m4["setText"];
const __m5=__req("packages/modules/charts/styles.js");
const NS=__m5["NS"];
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
function drawGeomap(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
new Pool(ctx.groups.grid).finish();
new Pool(ctx.groups.axis).finish();
new Pool(ctx.groups.rules).finish();
new Pool(ctx.groups.labels).finish();
const supplied=shapesToPaths({
shapes:ctx.shapes,plot,codeProperty:ctx.codeProperty,
});
const useCountries=supplied.size>0;
const totals=new Map();
const unmatched=[];
const series=bound.series[0];
if(series){
for(let i=0;i<series.points.length;i++){
const point=series.points[i];
if(!isNumber(point.y))continue;
const code=normaliseCode(bound.categories[i]);
const target=useCountries?code:continentOf(code);
if(!target||(useCountries&&!supplied.has(target))){
if(bound.labels[i])unmatched.push(bound.labels[i]);
continue;
}
const entry=totals.get(target)||{value:0,labels:[]};
entry.value+=(point.y);
entry.labels.push(bound.labels[i]);
totals.set(target,entry);
}
}
const antarctic=totals.has('AN');
const project=projection(plot,{antarctic});
const domain=measureDomain([...totals.values()].map((e)=>e.value),{
zero:!ctx.diverging,nice:false,
});
const ramp=colourRamp(domain,!!ctx.diverging,scheme);
const pool=new Pool(ctx.groups.marks);
const regions=[];
const codes=useCountries
?[...supplied.keys()]
:CONTINENTS.filter((code)=>code!=='AN'||antarctic);
for(const code of codes){
const d=useCountries?supplied.get(code):ringPath(OUTLINES[code],project);
const entry=totals.get(code);
const element=pool.next('path',`${NS}__region ${NS}__mark`);
attrs(element,{
d,
fill:entry?ramp(entry.value):'var(--lattice-chart-empty, #eceff1)',
'data-code':code,
});
regions.push({
code,
value:entry?entry.value:null,
label:(!useCountries&&CONTINENT_NAMES[code])||(entry&&entry.labels[0])||code,
element,
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
return{regions,ramp,unmatched,useCountries};
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
const __m0=__req("packages/modules/charts/frame.js");
const Pool=__m0["Pool"];
const __m1=__req("packages/modules/charts/format.js");
const measureText=__m1["measureText"];
const __m2=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m2["resolveScheme"];
const __m3=__req("packages/modules/charts/svg.js");
const attrs=__m3["attrs"];
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
return{arcs,ribbons};
}
function describeLink(link,messages){
return`${link.source.label} → ${link.target.label}: ${measureText(link.value,messages)}`;
}
});
__def("packages/modules/charts/network.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"ITERATIONS",{enumerable:true,get:function(){return ITERATIONS;}});
Object.defineProperty(__exports,"sequence",{enumerable:true,get:function(){return sequence;}});
Object.defineProperty(__exports,"layoutNetwork",{enumerable:true,get:function(){return layoutNetwork;}});
Object.defineProperty(__exports,"drawNetwork",{enumerable:true,get:function(){return drawNetwork;}});
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
const ITERATIONS=220;
const REPULSION=2400;
const ATTRACTION=0.006;
const GRAVITY=0.015;
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
function drawNetwork(ctx){
const scheme=ctx.scheme||resolveScheme();
const{plot,bound}=ctx;
for(const name of['grid','axis','rules','labels'])new Pool(ctx.groups[name]).finish();
const nodes=bound.nodes;
const links=bound.links.map((link)=>({...link,weight:link.value}));
if(!nodes.length)return{nodes:[],links:[]};
const heaviest=links.reduce((max,link)=>Math.max(max,link.value),0)||1;
for(const link of links)link.weight=link.value/heaviest;
layoutNetwork({nodes,links,plot,iterations:ctx.iterations});
const busiest=nodes.reduce((max,node)=>Math.max(max,node.in+node.out),0)||1;
const pool=new Pool(ctx.groups.marks);
for(const link of links){
attrs(pool.next('path',`${NS}__edge`),{
d:path([
'M',round(link.source.x),round(link.source.y),
'L',round(link.target.x),round(link.target.y),
]),
'stroke-width':round(0.5+link.weight*3),
fill:'none',
});
}
for(const node of nodes){
const share=(node.in+node.out)/busiest;
node.r=4+Math.sqrt(share)*12;
attrs(pool.next('circle',`${NS}__node ${NS}__mark`),{
cx:round(node.x),
cy:round(node.y),
r:round(node.r),
fill:scheme.series(node.index),
'data-node':node.key,
});
}
pool.finish();
const labels=new Pool(ctx.groups.overlay);
const size=(ctx.typography&&ctx.typography.small)||ctx.fontSize;
const named=nodes.slice().sort((a,b)=>(b.in+b.out)-(a.in+a.out)).slice(0,12);
for(const node of named){
const text=labels.next('text',`${NS}__flow-label`);
applySize(text,size);
attrs(text,{
x:round(node.x),y:round(node.y-node.r-3),'text-anchor':'middle',
});
setText(text,truncateTo(node.label,90,size));
}
labels.finish();
return{nodes,links};
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
const summarise=__m1["summarise"];
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
rotated:shouldRotate(bound.labels,xScale.step,ctx.fontSize),
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
const grouped=new Map();
for(const series of bound.series){
for(const point of series.points){
if(!isNumber(point.y))continue;
if(!grouped.has(point.label))grouped.set(point.label,[]);
grouped.get(point.label).push((point.y));
}
}
const labels=[...grouped.keys()];
const spread=[];
for(const values of grouped.values())spread.push(...values);
const domain=measureDomain(spread,{zero:false});
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
return axis==='y'||axis==='y2';
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
__def("packages/modules/charts/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"TYPES",{enumerable:true,get:function(){return TYPES;}});
Object.defineProperty(__exports,"Chart",{enumerable:true,get:function(){return Chart;}});
Object.defineProperty(__exports,"createChart",{enumerable:true,get:function(){return createChart;}});
Object.defineProperty(__exports,"deriveRangeSpec",{enumerable:true,get:function(){return deriveRangeSpec;}});
Object.defineProperty(__exports,"chartRange",{enumerable:true,get:function(){return chartRange;}});
Object.defineProperty(__exports,"canChartRange",{enumerable:true,get:function(){return canChartRange;}});
const __m0=__req("packages/modules/charts/cartesian.js");
const drawCartesian=__m0["drawCartesian"];
const nearestCategory=__m0["nearestCategory"];
const __m1=__req("packages/modules/charts/axis.js");
const createGroups=__m1["createGroups"];
const drawAxisTitle=__m1["drawAxisTitle"];
const normaliseAxes=__m1["normaliseAxes"];
const __m2=__req("packages/modules/charts/bind.js");
const bindHierarchy=__m2["bindHierarchy"];
const bindLinks=__m2["bindLinks"];
const bindMeasures=__m2["bindMeasures"];
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
const tileAt=__m8["tileAt"];
const __m9=__req("packages/modules/charts/combo.js");
const drawCombo=__m9["drawCombo"];
const __m10=__req("packages/modules/charts/polar.js");
const drawGauge=__m10["drawGauge"];
const drawRadar=__m10["drawRadar"];
const __m11=__req("packages/modules/charts/matrix.js");
const drawCandlestick=__m11["drawCandlestick"];
const drawCorrelogram=__m11["drawCorrelogram"];
const drawFunnel=__m11["drawFunnel"];
const drawHeatmap=__m11["drawHeatmap"];
const __m12=__req("packages/modules/charts/multiples.js");
const panelRects=__m12["panelRects"];
const splitPanels=__m12["splitPanels"];
const __m13=__req("packages/modules/charts/geo.js");
const drawGeomap=__m13["drawGeomap"];
const __m14=__req("packages/modules/charts/flow.js");
const drawChord=__m14["drawChord"];
const drawSankey=__m14["drawSankey"];
const __m15=__req("packages/modules/charts/network.js");
const drawNetwork=__m15["drawNetwork"];
const __m16=__req("packages/modules/charts/stream.js");
const drawMarimekko=__m16["drawMarimekko"];
const drawStream=__m16["drawStream"];
const drawViolin=__m16["drawViolin"];
const __m17=__req("packages/modules/charts/gantt.js");
const drawGantt=__m17["drawGantt"];
const __m18=__req("packages/modules/charts/svg.js");
const attrs=__m18["attrs"];
const append=__m18["append"];
const clear=__m18["clear"];
const el=__m18["el"];
const round=__m18["round"];
const setText=__m18["setText"];
const svg=__m18["svg"];
const __m19=__req("packages/modules/charts/styles.js");
const NS=__m19["NS"];
const injectStyles=__m19["injectStyles"];
const __m20=__req("packages/modules/charts/scheme.js");
const resolveScheme=__m20["resolveScheme"];
const __m21=__req("packages/modules/charts/typography.js");
const applySize=__m21["applySize"];
const resolveType=__m21["resolveType"];
const __m22=__req("packages/modules/charts/labels.js");
const resolveLabels=__m22["resolveLabels"];
const __m23=__req("packages/modules/charts/interaction.js");
const applySelection=__m23["applySelection"];
const attachBrush=__m23["attachBrush"];
const attachKeyboard=__m23["attachKeyboard"];
const brushCondition=__m23["brushCondition"];
const brushed=__m23["brushed"];
const resolveBrush=__m23["resolveBrush"];
const __m24=__req("packages/modules/charts/dense.js");
const downsample=__m24["downsample"];
const markCount=__m24["markCount"];
const wantsCanvas=__m24["wantsCanvas"];
const __m25=__req("packages/modules/charts/range.js");
const deriveRangeSpec=__m25["deriveRangeSpec"];
Object.defineProperty(__exports,"registerScheme",{enumerable:true,get:function(){return __m20["registerScheme"];}});
Object.defineProperty(__exports,"resolveScheme",{enumerable:true,get:function(){return __m20["resolveScheme"];}});
Object.defineProperty(__exports,"schemeNames",{enumerable:true,get:function(){return __m20["schemeNames"];}});
Object.defineProperty(__exports,"setDefaultScheme",{enumerable:true,get:function(){return __m20["setDefaultScheme"];}});
Object.defineProperty(__exports,"SCHEMES",{enumerable:true,get:function(){return __m20["SCHEMES"];}});
Object.defineProperty(__exports,"PALETTE",{enumerable:true,get:function(){return __m20["PALETTE"];}});
const TYPES=Object.freeze([
'line','step','area','rangeArea',
'bar','horizontalBar','waterfall',
'scatter','bubble',
'combo','pareto',
'histogram','boxplot','heatmap','qq','ecdf','lorenz','correlogram','control',
'capability','movingRange',
'pie','donut','sunburst','treemap',
'radar','gauge','funnel','candlestick','geomap',
'sankey','chord','network','stream','marimekko','violin','gantt',
]);
const LABELLED=new Set([
'bar','column','line','area','scatter','bubble','combo','pareto',
'histogram','heatmap','pie','donut','sunburst','treemap','radar',
]);
const RADIAL=new Set(['pie','donut','sunburst']);
const HIERARCHICAL=new Set(['pie','donut','sunburst','treemap']);
const CORRELOGRAM_MAX=20;
const DISTRIBUTION=new Set(['histogram','boxplot','qq','ecdf','lorenz','control',
'capability','movingRange']);
const MULTI_MEASURE=new Set(['combo','candlestick']);
const DUAL_AXIS=new Set(['bar','line','step','area','scatter','bubble']);
const FLOW=new Set(['sankey','chord','network']);
const PER_ROW=new Set(['gantt']);
const FREEFORM=new Set([
'radar','gauge','funnel','heatmap','geomap','sankey','chord','network',
]);
const FALLBACK=Object.freeze({width:480,height:300});
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
#grid;
#container;
#spec;
#doc;
#root=null;
#svg=null;
#groups=null;
#legend=null;
#tooltip=null;
#table=null;
#empty=null;
#off=[];
#hidden=new Set();
#drawn=null;
#warnedLabels=false;
#warnedError=false;
#bound=null;
#frame=0;
#observer=null;
#destroyed=false;
#listeners=new Map();
#scheme=resolveScheme();
#typography=resolveType();
#canvas=null;
#drill=null;
#mark=null;
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
this.#observer=new view.ResizeObserver(()=>this.schedule());
this.#observer.observe(this.#container);
}
}
#bindPointer(){
const move=(event)=>this.#hover(event);
const leave=()=>this.#hideTooltip();
this.#svg.addEventListener('pointermove',move);
this.#svg.addEventListener('pointerleave',leave);
this.#svg.addEventListener('click',(event)=>this.#click(event));
this.#off.push(attachBrush({
svg:this.#svg,
overlay:this.#groups.overlay,
plot:()=>(this.#drawn&&this.#drawn.plot)||{left:0,top:0,right:0,bottom:0,height:0},
pointOf:(event)=>this.#pointOf(event),
axis:()=>resolveBrush(this.#spec).axis,
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
});
}
#pointOf(event){
const box=this.#svg.getBoundingClientRect
?this.#svg.getBoundingClientRect()
:{left:0,top:0,width:FALLBACK.width,height:FALLBACK.height};
return{x:(event.clientX||0)-box.left,y:(event.clientY||0)-box.top};
}
#hover(event){
if(!this.#drawn||!this.#bound||this.#spec.tooltip===false)return;
const at=this.#pointOf(event);
const rows=[];
let heading='';
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
const index=nearestCategory({
bound:this.#bound,
xScale:this.#drawn.xScale,
at:at.x,
});
if(index<0){
this.#hideTooltip();
return;
}
heading=this.#bound.labels[index]||'';
for(const series of this.#drawn.series){
const point=series.points[index];
if(!point||point.y===null)continue;
rows.push({
label:series.label,
value:measureText(point.y,this.#grid.messages),
colour:this.#scheme.series(series.index),
});
}
}
if(!rows.length){
this.#hideTooltip();
return;
}
this.#showTooltip(heading,rows,at);
const datum=this.#datumAt(at);
if(datum)this.emit('hover',{...datum,native:event});
}
#showTooltip(heading,rows,at){
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
this.#tooltip.setAttribute('style',`left:${Math.round(at.x+12)}px;top:${Math.round(at.y+12)}px`);
}
#hideTooltip(){
if(this.#tooltip)this.#tooltip.setAttribute('hidden','');
this.emit('leave',{});
}
#datumAt(at){
if(!this.#drawn||!this.#bound)return null;
if(this.#drawn.tiles){
const tile=tileAt({tiles:this.#drawn.tiles,x:at.x,y:at.y});
if(!tile)return null;
const node=tile.item.node;
return{
label:node.label,
value:node.total,
category:node.value,
column:this.#bound.measure.col?this.#spec.x||null:null,
series:null,
rowKeys:node.rowKey?[node.rowKey]:[],
};
}
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
rowKeys:arc.node.rowKey?[arc.node.rowKey]:[],
};
}
const index=nearestCategory({bound:this.#bound,xScale:this.#drawn.xScale,at:at.x});
if(index<0)return null;
const points=this.#drawn.series
.map((series)=>({series,point:series.points[index]}))
.filter((entry)=>entry.point&&entry.point.y!==null);
return{
label:this.#bound.labels[index]||'',
category:this.#bound.categories[index],
column:this.#bound.dimension.col,
value:points.length===1?points[0].point.y:null,
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
this.#drill=[...(this.#drill||[]),datum.label];
this.emit('drill',{path:[...this.#drill],label:datum.label});
this.draw();
return;
}
if(!this.#spec.filterOnClick||!datum.column)return;
this.#grid.filters.set({col:datum.column,op:'eq',value:datum.category});
}
#emphasise(){
if(!this.#drawn||!this.#drawn.series)return;
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
if(!point)return;
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
const box=this.#container.getBoundingClientRect
?this.#container.getBoundingClientRect()
:FALLBACK;
const width=Math.round(box.width||FALLBACK.width);
const height=Math.round(box.height||FALLBACK.height);
const type=TYPES.includes(this.#spec.type)?this.#spec.type:'bar';
const scheme=resolveScheme(this.#spec);
this.#scheme=scheme;
const axis=normaliseAxes(this.#spec.axis);
const messages=this.#grid.messages;
const typography=resolveType(this.#spec);
this.#typography=typography;
const fontSize=typography.small;
const labels=resolveLabels(this.#spec);
if(labels.show&&!LABELLED.has(type)&&!this.#warnedLabels){
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
const hierarchical=HIERARCHICAL.has(type);
let bound;
if(hierarchical){
bound=bindHierarchy(this.#grid,this.#spec);
if(this.#drill&&this.#drill.length)bound=descend(bound,this.#drill);
}
else if(MULTI_MEASURE.has(type))bound=bindMeasures(this.#grid,this.#spec);
else if(DUAL_AXIS.has(type)&&Array.isArray(this.#spec.measures)&&this.#spec.measures.length){
bound=bindMeasures(this.#grid,this.#spec);
}
else if(FLOW.has(type))bound=bindLinks(this.#grid,this.#spec);
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
}else bound=bindSeries(this.#grid,this.#spec);
this.#bound=bound;
const short=type==='candlestick'&&(!bound.series||bound.series.length<4);
if(bound.empty||short){
this.#showEmpty(this.#spec.emptyText||messages.t('chart.empty'));
return;
}
this.#empty.setAttribute('hidden','');
this.#svg.removeAttribute('hidden');
if(type==='treemap'){
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
yLabels:type==='heatmap'?['0000000000']:[],
xLabels:type==='heatmap'?bound.labels:[],
rotated:true,
})
:plotRect({
width,
height,
fontSize,
margin:this.#spec.margin,
titleSize:typography.axisTitle,
...(type==='gantt'?{yLabels:['a task name that is long']}:{}),
titles:{
left:axis.y.title,
bottom:axis.x.title,
right:axis.y2.title,
},
rightGutter:this.#hasRightAxis(type,bound)?Math.round(fontSize*3):0,
yLabels:['00000'],
xLabels:bound.labels,
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
this.#drawn=drawNetwork({...shared,iterations:this.#spec.iterations});
this.#drawLegend([]);
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
});
this.#drawLegend([]);
}else if(type==='correlogram'){
this.#drawn=drawCorrelogram({
...shared,
columns:this.#correlogramColumns(),
method:this.#spec.method,
values:this.#spec.values,
});
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
if(this.#spec.error&&bars&&!bars.drawn&&bars.marks&&!this.#warnedError){
this.#warnedError=true;
const view=this.#doc&&this.#doc.defaultView;
const out=(view&&view.console)
||(typeof globalThis!=='undefined'?globalThis.console:null);
if(out&&typeof out.warn==='function'){
out.warn(bars.single===bars.marks
?'[lattice] error bars were requested but every mark has a single reading behind it, so '
+'there is no spread to compute. A chart bound to a summary or derived grid sees one '
+'row per mark: bind it to the rows the summary was computed from, or supply a margin '
+'column with `error: { of: "column" }`.'
:'[lattice] error bars were requested but no mark had enough readings to compute an '
+'interval.');
}
}
if(this.#drawn)this.#drawn.plot=this.#drawn.plot||plotOf(this.#drawn,width,height);
if(this.#spec.selection)this.#emphasise();
this.#watermark();
this.#describe(type,bound,hierarchical);
this.emit('draw',{chartType:type,categories:bound.categories||[],empty:!!bound.empty});
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
if(!values.length)return null;
return sqrtScale(
{min:Math.min(...values),max:Math.max(...values)},
[3,Math.max(6,Math.min(28,this.#spec.maxRadius||22))],
);
}
#showEmpty(text){
this.#watermark();
setText(this.#empty,text);
this.#empty.removeAttribute('hidden');
this.#svg.setAttribute('hidden','');
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
swatch.setAttribute('style',`background:${this.#scheme.series(entry.index)}`);
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
const summary=messages.t(dimension&&!radial?'chart.summary':'chart.summaryShare',{
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
for(const series of bound.series||[]){
const th=el(doc,'th');
setText(th,series.label);
head.appendChild(th);
}
for(let i=0;i<(bound.labels||[]).length;i++){
const tr=el(doc,'tr');
const th=el(doc,'th');
setText(th,bound.labels[i]);
tr.appendChild(th);
for(const series of bound.series||[]){
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
try{
__req("packages/worker/src/inline.js").setWorkerSource("(function(root){\n'use strict';\nvar __mods=Object.create(null);\nvar __cache=Object.create(null);\nfunction __def(id,fn){__mods[id]=fn;}\nfunction __req(id){\nvar hit=__cache[id];\nif(hit)return hit;\nvar exports=Object.create(null);\n__cache[id]=exports;\nvar fn=__mods[id];\nif(!fn)throw new Error('[lattice] missing module: '+id);\nfn(exports,__req);\nreturn exports;\n}\n__def(\"packages/core/src/internal/util.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"VERSION\",{enumerable:true,get:function(){return VERSION;}});\nObject.defineProperty(__exports,\"reportedWarnings\",{enumerable:true,get:function(){return reportedWarnings;}});\nObject.defineProperty(__exports,\"warnOnce\",{enumerable:true,get:function(){return warnOnce;}});\nObject.defineProperty(__exports,\"infoOnce\",{enumerable:true,get:function(){return infoOnce;}});\nObject.defineProperty(__exports,\"resetWarnings\",{enumerable:true,get:function(){return resetWarnings;}});\nObject.defineProperty(__exports,\"fail\",{enumerable:true,get:function(){return fail;}});\nObject.defineProperty(__exports,\"invariant\",{enumerable:true,get:function(){return invariant;}});\nObject.defineProperty(__exports,\"DEV\",{enumerable:true,get:function(){return DEV;}});\nObject.defineProperty(__exports,\"isObject\",{enumerable:true,get:function(){return isObject;}});\nObject.defineProperty(__exports,\"isFunction\",{enumerable:true,get:function(){return isFunction;}});\nObject.defineProperty(__exports,\"isNil\",{enumerable:true,get:function(){return isNil;}});\nObject.defineProperty(__exports,\"isBlank\",{enumerable:true,get:function(){return isBlank;}});\nObject.defineProperty(__exports,\"isCtor\",{enumerable:true,get:function(){return isCtor;}});\nObject.defineProperty(__exports,\"pathGetter\",{enumerable:true,get:function(){return pathGetter;}});\nObject.defineProperty(__exports,\"pathSetter\",{enumerable:true,get:function(){return pathSetter;}});\nObject.defineProperty(__exports,\"getPath\",{enumerable:true,get:function(){return getPath;}});\nObject.defineProperty(__exports,\"setPath\",{enumerable:true,get:function(){return setPath;}});\nObject.defineProperty(__exports,\"humanise\",{enumerable:true,get:function(){return humanise;}});\nObject.defineProperty(__exports,\"escapeHtml\",{enumerable:true,get:function(){return escapeHtml;}});\nObject.defineProperty(__exports,\"titleCase\",{enumerable:true,get:function(){return titleCase;}});\nObject.defineProperty(__exports,\"expand\",{enumerable:true,get:function(){return expand;}});\nObject.defineProperty(__exports,\"toArray\",{enumerable:true,get:function(){return toArray;}});\nObject.defineProperty(__exports,\"merge\",{enumerable:true,get:function(){return merge;}});\nObject.defineProperty(__exports,\"mergeRow\",{enumerable:true,get:function(){return mergeRow;}});\nObject.defineProperty(__exports,\"Lru\",{enumerable:true,get:function(){return Lru;}});\nObject.defineProperty(__exports,\"collator\",{enumerable:true,get:function(){return collator;}});\nObject.defineProperty(__exports,\"defaultCompare\",{enumerable:true,get:function(){return defaultCompare;}});\nObject.defineProperty(__exports,\"now\",{enumerable:true,get:function(){return now;}});\nObject.defineProperty(__exports,\"nextFrame\",{enumerable:true,get:function(){return nextFrame;}});\nObject.defineProperty(__exports,\"cancelFrame\",{enumerable:true,get:function(){return cancelFrame;}});\nObject.defineProperty(__exports,\"frameBatched\",{enumerable:true,get:function(){return frameBatched;}});\nObject.defineProperty(__exports,\"settleDebounce\",{enumerable:true,get:function(){return settleDebounce;}});\nObject.defineProperty(__exports,\"whenIdle\",{enumerable:true,get:function(){return whenIdle;}});\nObject.defineProperty(__exports,\"uid\",{enumerable:true,get:function(){return uid;}});\nconst STAMPED_VERSION=\"1.26.0\";\nasync function resolveVersion(){\nif(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;\ntry{\nif(typeof process==='undefined'||!process.versions||!process.versions.node){\nreturn STAMPED_VERSION;\n}\nconst mod=await import('node:'+'module');\nconst req=mod.createRequire((typeof document!=='undefined'&&document.currentScript?document.currentScript.src:''));\nconst fs=req('node:'+'fs');\nconst url=new URL('../../../../package.json',(typeof document!=='undefined'&&document.currentScript?document.currentScript.src:''));\nconst text=fs.readFileSync(url,'utf8');\nreturn JSON.parse(text).version||STAMPED_VERSION;\n}catch{\nreturn STAMPED_VERSION;\n}\n}\nconst VERSION=\"1.26.0\";\nconst warned=new Set();\nconst WARNED_LIMIT=2000;\nfunction rememberWarned(key){\nwarned.add(key);\nif(warned.size>WARNED_LIMIT){\nconst oldest=warned.values().next().value;\nif(oldest!==undefined)warned.delete(oldest);\n}\n}\nconst reported=[];\nconst REPORT_LIMIT=500;\nfunction record(key,level,message){\nreported.push({\nkey,\nlevel,\nmessage:message.map((m)=>(typeof m==='string'?m:safeString(m))).join(' '),\nat:Date.now(),\n});\nif(reported.length>REPORT_LIMIT)reported.shift();\n}\nfunction safeString(value){\nif(value instanceof Error)return value.message;\ntry{return JSON.stringify(value);}catch{return String(value);}\n}\nfunction reportedWarnings(){return reported.map((r)=>({...r}));}\nfunction warnOnce(key,...message){\nif(warned.has(key))return;\nrememberWarned(key);\nrecord(key,'warn',message);\nconsole.warn('[lattice]',...message);\n}\nfunction infoOnce(key,...message){\nif(warned.has(key))return;\nrememberWarned(key);\nrecord(key,'info',message);\nconsole.info('[lattice]',...message);\n}\nfunction resetWarnings(){\nwarned.clear();\nreported.length=0;\n}\nfunction fail(message,extra){\nconst err=new Error(`[lattice] ${message}`);\nif(extra!==undefined)err.cause=extra;\nthrow err;\n}\nfunction invariant(condition,message){\nif(!condition)fail(message);\n}\nconst DEV=(()=>{\ntry{\nreturn!(typeof process!=='undefined'&&process.env\n&&process.env.NODE_ENV==='production');\n}catch{\nreturn true;\n}\n})();\nfunction isObject(v){\nreturn v!==null&&typeof v==='object'&&!Array.isArray(v);\n}\nfunction isFunction(v){\nreturn typeof v==='function';\n}\nfunction isNil(v){\nreturn v===null||v===undefined;\n}\nfunction isBlank(v){\nreturn v===null||v===undefined||v==='';\n}\nfunction isCtor(v){\nif(typeof v!=='function')return false;\nif(/^class[\\s{]/.test(Function.prototype.toString.call(v)))return true;\nreturn!!(v.prototype&&Object.getOwnPropertyNames(v.prototype).length>1);\n}\nconst pathCache=new Map();\nfunction pathGetter(path){\nlet fn=pathCache.get(path);\nif(fn)return fn;\nif(!path.includes('.')){\nfn=(o)=>(o==null?undefined:o[path]);\n}else{\nconst parts=path.split('.');\nconst n=parts.length;\nfn=(o)=>{\nlet cur=o;\nfor(let i=0;i<n;i++){\nif(cur==null)return undefined;\ncur=cur[parts[i]];\n}\nreturn cur;\n};\n}\npathCache.set(path,fn);\nreturn fn;\n}\nconst setterCache=new Map();\nfunction pathSetter(path){\nlet fn=setterCache.get(path);\nif(fn)return fn;\nif(!path.includes('.')){\nfn=(o,v)=>{if(o!=null)o[path]=v;};\n}else{\nconst parts=path.split('.');\nconst last=parts.length-1;\nfn=(o,v)=>{\nlet cur=o;\nfor(let i=0;i<last;i++){\nif(cur==null)return;\nconst k=parts[i];\nif(cur[k]==null)cur[k]={};\ncur=cur[k];\n}\nif(cur!=null)cur[parts[last]]=v;\n};\n}\nsetterCache.set(path,fn);\nreturn fn;\n}\nfunction getPath(obj,path){\nreturn pathGetter(path)(obj);\n}\nfunction setPath(obj,path,value){\npathSetter(path)(obj,value);\n}\nfunction humanise(field){\nif(!field)return'';\nconst leaf=field.includes('.')?field.slice(field.lastIndexOf('.')+1):field;\nreturn leaf\n.replace(/[_-]+/g,' ')\n.replace(/([a-z0-9])([A-Z])/g,'$1 $2')\n.replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2')\n.replace(/\\s+/g,' ')\n.trim()\n.replace(/^./,(c)=>c.toUpperCase());\n}\nconst ESCAPES={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'};\nfunction escapeHtml(s){\nconst str=s==null?'':String(s);\nreturn/[&<>\"']/.test(str)?str.replace(/[&<>\"']/g,(c)=>ESCAPES[c]):str;\n}\nfunction titleCase(s){\nreturn String(s).replace(/\\w\\S*/g,(t)=>t[0].toUpperCase()+t.slice(1).toLowerCase());\n}\nfunction expand(value,key,whenTrue){\nif(value===undefined)return undefined;\nif(value===true)return{enabled:true,...whenTrue};\nif(value===false)return{enabled:false};\nif(isObject(value))return value;\nreturn{[key]:value,enabled:true};\n}\nfunction toArray(v){\nif(v===undefined||v===null)return[];\nreturn Array.isArray(v)?v:[v];\n}\nconst MERGE_FORBIDDEN_KEYS=Object.freeze(new Set(['__proto__','constructor','prototype']));\nfunction merge(a,b){\nif(!isObject(a))return isObject(b)?{...b}:b;\nif(!isObject(b))return b===undefined?a:b;\nconst out={...a};\nfor(const k of Object.keys(b)){\nif(MERGE_FORBIDDEN_KEYS.has(k))continue;\nconst bv=b[k];\nif(bv===undefined)continue;\nout[k]=isObject(bv)&&isObject(out[k])?merge(out[k],bv):bv;\n}\nreturn out;\n}\nfunction mergeRow(previous,patch){\nif(!isObject(previous)||!isObject(patch)||previous===patch)return patch;\nconst out=Object.create(Object.getPrototypeOf(previous));\nObject.assign(out,previous,patch);\nreturn out;\n}\nclass Lru{\n#max;\n#map=new Map();\n#onEvict;\nconstructor(max=256,onEvict=null){\nthis.#max=max;\nthis.#onEvict=onEvict;\n}\nget size(){\nreturn this.#map.size;\n}\nget max(){\nreturn this.#max;\n}\nset max(v){\nthis.#max=v;\nthis.#trim();\n}\nhas(k){\nreturn this.#map.has(k);\n}\nget(k){\nconst m=this.#map;\nif(!m.has(k))return undefined;\nconst v=m.get(k);\nm.delete(k);\nm.set(k,v);\nreturn v;\n}\npeek(k){\nreturn this.#map.get(k);\n}\nset(k,v){\nconst m=this.#map;\nif(m.has(k))m.delete(k);\nm.set(k,v);\nthis.#trim();\nreturn v;\n}\ndelete(k){\nconst v=this.#map.get(k);\nif(this.#map.delete(k)&&this.#onEvict)this.#onEvict(v,k);\nreturn v;\n}\nclear(){\nif(this.#onEvict)for(const[k,v]of this.#map)this.#onEvict(v,k);\nthis.#map.clear();\n}\nkeys(){\nreturn this.#map.keys();\n}\nvalues(){\nreturn this.#map.values();\n}\n#trim(){\nconst m=this.#map;\nwhile(m.size>this.#max){\nconst oldest=m.keys().next().value;\nconst v=m.get(oldest);\nm.delete(oldest);\nif(this.#onEvict)this.#onEvict(v,oldest);\n}\n}\n}\nconst collators=new Map();\nfunction collator(locale,opts){\nconst key=`${locale||''}|${opts?JSON.stringify(opts):''}`;\nlet c=collators.get(key);\nif(!c){\nc=new Intl.Collator(locale||undefined,{\nnumeric:true,sensitivity:'variant',...opts,\n});\ncollators.set(key,c);\n}\nreturn c;\n}\nfunction defaultCompare(a,b){\nif(a===b)return 0;\nif(a===null||a===undefined)return 1;\nif(b===null||b===undefined)return-1;\nif(typeof a==='number'&&typeof b==='number'){\nif(Number.isNaN(a))return Number.isNaN(b)?0:1;\nif(Number.isNaN(b))return-1;\nreturn a<b?-1:a>b?1:0;\n}\nconst sa=String(a);\nconst sb=String(b);\nreturn sa<sb?-1:sa>sb?1:0;\n}\nfunction now(){\nreturn typeof performance!=='undefined'&&performance.now\n?performance.now()\n:Date.now();\n}\nconst hasRaf=typeof requestAnimationFrame==='function';\nfunction nextFrame(fn){\nif(hasRaf)return requestAnimationFrame(fn);\nreturn setTimeout(()=>fn(now()),16);\n}\nfunction cancelFrame(handle){\nif(handle==null)return;\nif(hasRaf)cancelAnimationFrame(handle);\nelse clearTimeout(handle);\n}\nfunction frameBatched(fn){\nlet handle=null;\nlet lastArgs=null;\nconst run=()=>{\nhandle=null;\nconst a=lastArgs;\nlastArgs=null;\nfn(...(a||[]));\n};\nconst wrapped=(...args)=>{\nlastArgs=args;\nif(handle===null)handle=nextFrame(run);\n};\nwrapped.cancel=()=>{\ncancelFrame(handle);\nhandle=null;\nlastArgs=null;\n};\nwrapped.flush=()=>{\nif(handle!==null){\ncancelFrame(handle);\nrun();\n}\n};\nreturn wrapped;\n}\nfunction settleDebounce(fn,waitMs){\nlet timer=null;\nlet held=null;\nconst trailing=()=>{\ntimer=null;\nif(held===null)return;\nconst args=held;\nheld=null;\nfn(...args);\narm();\n};\nconst arm=()=>{\ntimer=setTimeout(trailing,waitMs);\nif(typeof timer?.unref==='function')timer.unref();\n};\nconst wrapped=(...args)=>{\nif(timer===null){\nfn(...args);\narm();\n}else{\nheld=args;\nclearTimeout(timer);\narm();\n}\n};\nwrapped.flush=()=>{\nif(timer!==null)clearTimeout(timer);\ntimer=null;\nif(held===null)return;\nconst args=held;\nheld=null;\nfn(...args);\n};\nwrapped.cancel=()=>{\nif(timer!==null)clearTimeout(timer);\ntimer=null;\nheld=null;\n};\nwrapped.pending=()=>timer!==null||held!==null;\nreturn wrapped;\n}\nfunction whenIdle(fn,timeout=50){\nif(typeof requestIdleCallback==='function'){\nreturn requestIdleCallback(fn,{timeout});\n}\nreturn setTimeout(()=>fn({timeRemaining:()=>0,didTimeout:true}),1);\n}\nlet idSeq=0;\nfunction uid(prefix='l'){\nreturn`${prefix}${(++idSeq).toString(36)}`;\n}\n});\n__def(\"packages/worker/src/transport.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"PROTOCOL\",{enumerable:true,get:function(){return PROTOCOL;}});\nObject.defineProperty(__exports,\"OPS\",{enumerable:true,get:function(){return OPS;}});\nObject.defineProperty(__exports,\"CONTROL\",{enumerable:true,get:function(){return CONTROL;}});\nObject.defineProperty(__exports,\"ERRORS\",{enumerable:true,get:function(){return ERRORS;}});\nObject.defineProperty(__exports,\"packHandle\",{enumerable:true,get:function(){return packHandle;}});\nObject.defineProperty(__exports,\"packHandles\",{enumerable:true,get:function(){return packHandles;}});\nObject.defineProperty(__exports,\"TransportedDictionary\",{enumerable:true,get:function(){return TransportedDictionary;}});\nObject.defineProperty(__exports,\"unpackHandle\",{enumerable:true,get:function(){return unpackHandle;}});\nObject.defineProperty(__exports,\"unpackHandles\",{enumerable:true,get:function(){return unpackHandles;}});\nObject.defineProperty(__exports,\"createMaskPool\",{enumerable:true,get:function(){return createMaskPool;}});\nObject.defineProperty(__exports,\"isTransferable\",{enumerable:true,get:function(){return isTransferable;}});\nObject.defineProperty(__exports,\"collectTransfers\",{enumerable:true,get:function(){return collectTransfers;}});\nObject.defineProperty(__exports,\"isPortable\",{enumerable:true,get:function(){return isPortable;}});\nObject.defineProperty(__exports,\"filterColumnIds\",{enumerable:true,get:function(){return filterColumnIds;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst collator=__m0[\"collator\"];\nconst isFunction=__m0[\"isFunction\"];\nconst PROTOCOL=1;\nconst OPS=Object.freeze({\nSORT_COLUMN:'sortColumn',\nSORT_MULTI:'sortMulti',\nEVALUATE_FILTERS:'evaluateFilters',\nCOMPACT:'compact',\nGROUP_BY_COLUMNS:'groupByColumns',\nTOTAL:'total',\nPIVOT:'pivot',\nFACET:'facet',\nCOLUMNIZE:'columnize',\nCOLLATE_STRING_RANKS:'collateStringRanks',\n});\nconst CONTROL=Object.freeze({\nREADY:'ready',\nCANCEL:'cancel',\nPING:'ping',\n});\nconst ERRORS=Object.freeze({\nNO_COMPUTE:'E_NO_COMPUTE',\nNO_KERNEL:'E_NO_KERNEL',\nABORTED:'E_ABORTED',\nKERNEL:'E_KERNEL',\nPROTOCOL:'E_PROTOCOL',\n});\nfunction packHandle(handle){\nif(handle==null)return null;\nconst presence=handle.presence;\nreturn{\nid:handle.id,\nkind:handle.kind,\nnullable:!!handle.nullable,\nvalues:handle.values??null,\npresence:presence?(presence.words??presence):null,\npresenceBits:presence?(presence.size??(presence.words??presence).length*8):0,\ndict:handle.dict?sliceDictionary(handle.dict):null,\noffsets:handle.offsets??null,\nversion:handle.version??0,\n};\n}\nfunction sliceDictionary(dict){\nif(Array.isArray(dict))return dict;\nif(isFunction(dict.values))return dict.values();\nreturn[];\n}\nfunction packHandles(handles){\nconst out=new Array(handles.length);\nfor(let i=0;i<handles.length;i++)out[i]=packHandle(handles[i]);\nreturn out;\n}\nclass TransportedBitset{\n#words;\n#bits;\nconstructor(words,bits){\nthis.#words=words;\nthis.#bits=bits;\n}\nget words(){return this.#words;}\nget size(){return this.#bits;}\nget(i){return(this.#words[i>>>3]&(1<<(i&7)))!==0;}\ncount(){\nconst w=this.#words;\nlet n=0;\nfor(let i=0;i<w.length;i++){\nlet v=w[i];\nwhile(v){v&=v-1;n++;}\n}\nreturn n;\n}\n}\nclass TransportedDictionary{\n#values;\n#index=null;\n#version=0;\n#ranks=new Map();\nconstructor(values){\nthis.#values=values||[];\n}\nget size(){return this.#values.length;}\nget version(){return this.#version;}\ncodeOf(value){\nif(this.#index===null){\nthis.#index=new Map();\nfor(let i=0;i<this.#values.length;i++)this.#index.set(this.#values[i],i);\n}\nconst found=this.#index.get(value);\nif(found!==undefined)return found;\nconst code=this.#values.length;\nthis.#values.push(value);\nthis.#index.set(value,code);\nthis.#version++;\nreturn code;\n}\nvalueOf(code){return this.#values[code];}\nvalues(){return this.#values;}\nranks(locale){\nconst key=locale||'';\nconst cached=this.#ranks.get(key);\nif(cached&&cached.version===this.#version)return cached.ranks;\nconst n=this.#values.length;\nconst order=new Uint32Array(n);\nfor(let i=0;i<n;i++)order[i]=i;\nconst cmp=collator(locale).compare;\nconst vals=this.#values;\nconst sorted=Array.from(order).sort((a,b)=>{\nconst av=vals[a];\nconst bv=vals[b];\nif(av===bv)return 0;\nif(av===null||av===undefined)return 1;\nif(bv===null||bv===undefined)return-1;\nreturn cmp(String(av),String(bv));\n});\nconst ranks=new Uint32Array(n);\nfor(let r=0;r<sorted.length;r++)ranks[sorted[r]]=r;\nthis.#ranks.set(key,{version:this.#version,ranks});\nreturn ranks;\n}\n}\nfunction unpackHandle(packed){\nif(packed==null)return null;\nconst presence=packed.presence\n?new TransportedBitset(packed.presence,packed.presenceBits||packed.presence.length*8)\n:null;\nconst dict=packed.dict?new TransportedDictionary(packed.dict):null;\nconst values=packed.values;\nconst offsets=packed.offsets??null;\nconst kind=packed.kind;\nconst get=(physical)=>{\nif(presence&&!presence.get(physical))return null;\nswitch(kind){\ncase'dictionary':\nreturn dict?dict.valueOf(values[physical]):values[physical];\ncase'bitset':\nreturn(values[physical>>>3]&(1<<(physical&7)))!==0;\ncase'multi':{\nif(!offsets)return null;\nconst from=offsets[physical];\nconst to=offsets[physical+1];\nconst out=new Array(to-from);\nfor(let i=from;i<to;i++)out[i-from]=dict?dict.valueOf(values[i]):values[i];\nreturn out;\n}\ndefault:\nreturn values[physical];\n}\n};\nreturn{\nid:packed.id,\nkind,\nnullable:packed.nullable,\nvalues,\npresence,\ndict,\noffsets,\nget,\nversion:packed.version,\n};\n}\nfunction unpackHandles(packed){\nconst out=new Array(packed.length);\nfor(let i=0;i<packed.length;i++)out[i]=unpackHandle(packed[i]);\nreturn out;\n}\nfunction createMaskPool(){\nconst masks=[];\nconst indices=[];\nreturn{\nmask(n){\nfor(let i=0;i<masks.length;i++){\nif(masks[i].length>=n){\nconst buf=masks.splice(i,1)[0].subarray(0,n);\nbuf.fill(0);\nreturn buf;\n}\n}\nreturn new Uint8Array(n);\n},\nindices(n){\nfor(let i=0;i<indices.length;i++){\nif(indices[i].length>=n)return indices.splice(i,1)[0].subarray(0,n);\n}\nreturn new Uint32Array(n);\n},\nrelease(buf){\nif(!buf)return;\nif(buf instanceof Uint8Array)masks.push(buf);\nelse if(buf instanceof Uint32Array)indices.push(buf);\n},\nclear(){masks.length=0;indices.length=0;},\n};\n}\nfunction isTransferable(v){\nif(!ArrayBuffer.isView(v))return false;\nconst buf=(v).buffer;\nif(!buf)return false;\nreturn typeof SharedArrayBuffer==='undefined'||!(buf instanceof SharedArrayBuffer);\n}\nfunction collectTransfers(value,out=[]){\nconst add=(v)=>{\nif(!isTransferable(v))return;\nconst buf=(v).buffer;\nif(!out.includes(buf))out.push(buf);\n};\nif(value==null)return out;\nif(ArrayBuffer.isView(value)){add(value);return out;}\nif(Array.isArray(value)){\nfor(const item of value)add(item);\nreturn out;\n}\nif(typeof value==='object'){\nfor(const key of Object.keys(value)){\nconst item=(value)[key];\nif(Array.isArray(item))for(const sub of item)add(sub);\nelse add(item);\n}\n}\nreturn out;\n}\nfunction isPortable(value,depth=0){\nif(value==null)return true;\nconst t=typeof value;\nif(t==='function'||t==='symbol')return false;\nif(t!=='object')return true;\nif(depth>4)return true;\nif(ArrayBuffer.isView(value)||value instanceof ArrayBuffer||value instanceof Date)return true;\nif(Array.isArray(value)){\nfor(const item of value)if(!isPortable(item,depth+1))return false;\nreturn true;\n}\nfor(const key of Object.keys(value)){\nif(!isPortable((value)[key],depth+1))return false;\n}\nreturn true;\n}\nfunction filterColumnIds(filters,out=new Set()){\nif(!filters||typeof filters!=='object')return out;\nconst node=(filters);\nif(typeof node.col==='string')out.add(node.col);\nconst conditions=node.conditions;\nif(Array.isArray(conditions))for(const child of conditions)filterColumnIds(child,out);\nreturn out;\n}\n});\n__def(\"packages/core/src/store/bitset.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Bitset\",{enumerable:true,get:function(){return Bitset;}});\nconst WORD_BITS=8;\nclass Bitset{\nstatic#POP=new Uint8Array(256);\nstatic{\nfor(let i=1;i<256;i++)Bitset.#POP[i]=Bitset.#POP[i>>1]+(i&1);\n}\n#words;\n#bits;\nconstructor(bits=0){\nconst n=Math.max(0,bits|0);\nthis.#bits=n;\nthis.#words=new Uint8Array(Math.ceil(n/WORD_BITS));\n}\nget size(){return this.#bits;}\nget words(){return this.#words;}\nget bytes(){return this.#words?this.#words.byteLength:0;}\nget(i){\nif(i<0||i>=this.#bits)return 0;\nreturn(this.#words[i>>3]>>(i&7))&1;\n}\nset(i){\nif(i>=0&&i<this.#bits)this.#words[i>>3]|=1<<(i&7);\nreturn this;\n}\nclear(i){\nif(i>=0&&i<this.#bits)this.#words[i>>3]&=~(1<<(i&7));\nreturn this;\n}\nassign(i,bit){return bit?this.set(i):this.clear(i);}\nfill(bit=false){\nthis.#words.fill(bit?0xff:0);\nif(bit)this.#maskTail();\nreturn this;\n}\ngrow(bits){\nconst n=Math.max(0,bits|0);\nif(n<=this.#bits)return this;\nconst need=Math.ceil(n/WORD_BITS);\nif(need>this.#words.length){\nconst next=new Uint8Array(need);\nnext.set(this.#words);\nthis.#words=next;\n}\nthis.#bits=n;\nreturn this;\n}\ncount(){\nconst w=this.#words;\nconst pop=Bitset.#POP;\nlet total=0;\nfor(let i=0;i<w.length;i++)total+=pop[w[i]];\nreturn total;\n}\nand(other){\nconst b=other instanceof Bitset?other.words:other;\nconst w=this.#words;\nconst shared=Math.min(w.length,b.length);\nfor(let i=0;i<shared;i++)w[i]&=b[i];\nfor(let i=shared;i<w.length;i++)w[i]=0;\nreturn this;\n}\nor(other){\nconst b=other instanceof Bitset?other.words:other;\nconst w=this.#words;\nconst shared=Math.min(w.length,b.length);\nfor(let i=0;i<shared;i++)w[i]|=b[i];\nreturn this;\n}\nnot(){\nconst w=this.#words;\nfor(let i=0;i<w.length;i++)w[i]=~w[i]&0xff;\nthis.#maskTail();\nreturn this;\n}\nclone(){\nconst out=new Bitset(this.#bits);\nout.words.set(this.#words.subarray(0,out.words.length));\nreturn out;\n}\nrelease(){\nthis.#words=new Uint8Array(0);\nthis.#bits=0;\n}\n#maskTail(){\nconst used=this.#bits&7;\nif(used===0)return;\nconst last=(this.#bits>>3);\nif(last<this.#words.length)this.#words[last]&=(1<<used)-1;\n}\nstatic from(bools){\nconst arr=Array.isArray(bools)?bools:Array.from(bools);\nconst out=new Bitset(arr.length);\nfor(let i=0;i<arr.length;i++)if(arr[i])out.set(i);\nreturn out;\n}\n}\n});\n__def(\"packages/core/src/store/dictionary.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Dictionary\",{enumerable:true,get:function(){return Dictionary;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst collator=__m0[\"collator\"];\nconst defaultCompare=__m0[\"defaultCompare\"];\nclass Dictionary{\n#values;\n#codes=new Map();\n#version=0;\n#ranks=null;\n#ranksVersion=-1;\n#ranksLocale='\\u0000';\nconstructor(values=[]){\nthis.#values=[];\nfor(let i=0;i<values.length;i++){\nconst v=values[i];\nif(this.#codes.has(v))continue;\nthis.#codes.set(v,this.#values.length);\nthis.#values.push(v);\n}\n}\nget size(){return this.#values.length;}\nget version(){return this.#version;}\nget bytes(){\nlet total=this.#values.length*8;\nfor(let i=0;i<this.#values.length;i++){\nconst v=this.#values[i];\nif(typeof v==='string')total+=v.length*2;\ntotal+=16;\n}\nreturn total;\n}\ncodeOf(value){\nconst existing=this.#codes.get(value);\nif(existing!==undefined)return existing;\nconst code=this.#values.length;\nthis.#values.push(value);\nthis.#codes.set(value,code);\nthis.#version++;\nreturn code;\n}\nlookup(value){\nconst code=this.#codes.get(value);\nreturn code===undefined?-1:code;\n}\nhas(value){return this.#codes.has(value);}\nvalueOf(code){return this.#values[code];}\nvalues(){return this.#values;}\nranks(locale){\nconst key=locale||'';\nif(this.#ranks&&this.#ranksVersion===this.#version&&this.#ranksLocale===key){\nreturn this.#ranks;\n}\nconst n=this.#values.length;\nconst order=new Array(n);\nfor(let i=0;i<n;i++)order[i]=i;\nconst cmp=collator(locale).compare;\nconst values=this.#values;\norder.sort((a,b)=>this.#compare(values[a],values[b],cmp));\nconst ranks=new Uint32Array(n);\nfor(let rank=0;rank<n;rank++)ranks[order[rank]]=rank;\nthis.#ranks=ranks;\nthis.#ranksVersion=this.#version;\nthis.#ranksLocale=key;\nreturn ranks;\n}\n#compare(a,b,compare){\nif(typeof a==='string'&&typeof b==='string')return compare(a,b);\nreturn defaultCompare(a,b);\n}\n}\n});\n__def(\"packages/core/src/store/multivalue.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"MultiValue\",{enumerable:true,get:function(){return MultiValue;}});\nclass MultiValue{\n#values;\n#offsets;\n#rows=0;\n#fill=0;\nconstructor(capacity={}){\nconst rows=Math.max(1,capacity.rows??16);\nconst values=Math.max(1,capacity.values??rows);\nthis.#values=new Int32Array(values);\nthis.#offsets=new Uint32Array(rows+1);\n}\nget values(){return this.#values;}\nget offsets(){return this.#offsets;}\nget rows(){return this.#rows;}\nget length(){return this.#fill;}\nget bytes(){return this.#values.byteLength+this.#offsets.byteLength;}\ncount(r){\nif(r<0||r>=this.#rows)return 0;\nreturn this.#offsets[r+1]-this.#offsets[r];\n}\nat(r){\nif(r<0||r>=this.#rows)return this.#values.subarray(0,0);\nreturn this.#values.subarray(this.#offsets[r],this.#offsets[r+1]);\n}\nhas(r,code){\nif(r<0||r>=this.#rows)return false;\nconst v=this.#values;\nconst end=this.#offsets[r+1];\nfor(let i=this.#offsets[r];i<end;i++)if(v[i]===code)return true;\nreturn false;\n}\nhasAny(r,codes){\nfor(let i=0;i<codes.length;i++)if(this.has(r,codes[i]))return true;\nreturn false;\n}\nhasAll(r,codes){\nfor(let i=0;i<codes.length;i++)if(!this.has(r,codes[i]))return false;\nreturn true;\n}\nhasNone(r,codes){return!this.hasAny(r,codes);}\npush(codes){\nconst r=this.#rows;\nconst n=codes.length;\nthis.#ensureRows(r+1);\nthis.#ensureValues(this.#fill+n);\nconst start=this.#fill;\nfor(let i=0;i<n;i++)this.#values[start+i]=codes[i]|0;\nthis.#fill+=n;\nthis.#rows=r+1;\nthis.#offsets[r]=start;\nthis.#offsets[r+1]=this.#fill;\nreturn r;\n}\nwrite(r,codes){\nif(r===this.#rows){this.push(codes);return;}\nif(r<0||r>this.#rows)return;\nconst start=this.#offsets[r];\nconst end=this.#offsets[r+1];\nconst n=codes.length;\nif(end-start===n){\nfor(let i=0;i<n;i++)this.#values[start+i]=codes[i]|0;\nreturn;\n}\nthis.#rebuild(r,codes);\n}\ncompact(remap,liveCount,dead){\nconst oldValues=this.#values;\nconst oldOffsets=this.#offsets;\nconst oldRows=this.#rows;\nconst values=new Int32Array(Math.max(1,this.#fill));\nconst offsets=new Uint32Array(liveCount+1);\nlet w=0;\nfor(let p=0;p<oldRows;p++){\nif(remap[p]===dead)continue;\nconst start=oldOffsets[p];\nconst end=oldOffsets[p+1];\noffsets[remap[p]]=w;\nfor(let i=start;i<end;i++)values[w++]=oldValues[i];\noffsets[remap[p]+1]=w;\n}\nthis.#values=values;\nthis.#offsets=offsets;\nthis.#rows=liveCount;\nthis.#fill=w;\n}\nrelease(){\nthis.#values=new Int32Array(0);\nthis.#offsets=new Uint32Array(1);\nthis.#rows=0;\nthis.#fill=0;\n}\n#ensureRows(rows){\nif(rows+1<=this.#offsets.length)return;\nlet cap=this.#offsets.length-1;\nwhile(cap<rows)cap=cap*2||16;\nconst next=new Uint32Array(cap+1);\nnext.set(this.#offsets);\nthis.#offsets=next;\n}\n#ensureValues(n){\nif(n<=this.#values.length)return;\nlet cap=this.#values.length;\nwhile(cap<n)cap=cap*2||16;\nconst next=new Int32Array(cap);\nnext.set(this.#values);\nthis.#values=next;\n}\n#rebuild(r,codes){\nconst oldValues=this.#values;\nconst oldOffsets=this.#offsets;\nconst rows=this.#rows;\nconst delta=codes.length-(oldOffsets[r+1]-oldOffsets[r]);\nconst values=new Int32Array(Math.max(1,this.#fill+delta));\nconst offsets=new Uint32Array(oldOffsets.length);\nlet w=0;\nfor(let p=0;p<rows;p++){\noffsets[p]=w;\nif(p===r){\nfor(let i=0;i<codes.length;i++)values[w++]=codes[i]|0;\n}else{\nfor(let i=oldOffsets[p];i<oldOffsets[p+1];i++)values[w++]=oldValues[i];\n}\noffsets[p+1]=w;\n}\nthis.#values=values;\nthis.#offsets=offsets;\nthis.#fill=w;\n}\n}\n});\n__def(\"packages/core/src/compute/handle.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"identity\",{enumerable:true,get:function(){return identity;}});\nObject.defineProperty(__exports,\"rowCount\",{enumerable:true,get:function(){return rowCount;}});\nObject.defineProperty(__exports,\"bitReader\",{enumerable:true,get:function(){return bitReader;}});\nObject.defineProperty(__exports,\"presenceReader\",{enumerable:true,get:function(){return presenceReader;}});\nObject.defineProperty(__exports,\"dictSize\",{enumerable:true,get:function(){return dictSize;}});\nObject.defineProperty(__exports,\"dictValue\",{enumerable:true,get:function(){return dictValue;}});\nObject.defineProperty(__exports,\"multiValue\",{enumerable:true,get:function(){return multiValue;}});\nObject.defineProperty(__exports,\"valueReader\",{enumerable:true,get:function(){return valueReader;}});\nObject.defineProperty(__exports,\"numericTotalOrder\",{enumerable:true,get:function(){return numericTotalOrder;}});\nObject.defineProperty(__exports,\"valueComparator\",{enumerable:true,get:function(){return valueComparator;}});\nObject.defineProperty(__exports,\"dictRanks\",{enumerable:true,get:function(){return dictRanks;}});\nObject.defineProperty(__exports,\"isMissing\",{enumerable:true,get:function(){return isMissing;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst collator=__m0[\"collator\"];\nconst defaultCompare=__m0[\"defaultCompare\"];\nconst warnOnce=__m0[\"warnOnce\"];\nfunction identity(n){\nconst out=new Uint32Array(n);\nfor(let i=0;i<n;i++)out[i]=i;\nreturn out;\n}\nfunction rowCount(handle,opts){\nif(opts&&typeof opts.count==='number')return opts.count;\nif(!handle)return 0;\nif(typeof handle.count==='number')return handle.count;\nif(typeof handle.length==='number')return handle.length;\nconst values=handle.values;\nif(handle.kind==='multi'&&handle.offsets)return Math.max(0,handle.offsets.length-1);\nif(!values)return handle.presence&&typeof handle.presence.size==='number'?handle.presence.size:0;\nif(handle.kind==='bitset'){\nif(typeof values.size==='number')return values.size;\nif(handle.presence&&typeof handle.presence.size==='number')return handle.presence.size;\nwarnOnce(`count:${handle.id}`,`column \"${handle.id}\" is bitset-backed with no declared row count; assuming ${values.length*8}`);\nreturn values.length*8;\n}\nreturn values.length;\n}\nconst bitOrders=new WeakMap();\nfunction bitOrderOf(bitset){\nconst ctor=bitset.constructor;\nif(!ctor)return'unknown';\nconst cached=bitOrders.get(ctor);\nif(cached)return cached;\nlet order='unknown';\ntry{\nlet probe=null;\nif(typeof ctor.from==='function')probe=ctor.from([false,true]);\nelse{\nprobe=new ctor(8);\nprobe.set(1);\n}\nconst words=probe&&probe.words;\nif(words&&words.length){\nif(words[0]===0x02)order='lsb';\nelse if(words[0]===0x40)order='msb';\n}\n}catch{\norder='unknown';\n}\nbitOrders.set(ctor,order);\nreturn order;\n}\nfunction bitReader(bits){\nif(!bits)return()=>0;\nconst raw=bits instanceof Uint8Array?bits:bits.words;\nif(raw instanceof Uint8Array){\nconst order=bits instanceof Uint8Array?'lsb':bitOrderOf(bits);\nif(order==='lsb')return(i)=>(raw[i>>>3]>>>(i&7))&1;\nif(order==='msb')return(i)=>(raw[i>>>3]>>>(7-(i&7)))&1;\n}\nif(typeof bits.get==='function')return(i)=>(bits.get(i)?1:0);\nreturn()=>0;\n}\nfunction presenceReader(handle){\nif(!handle||!handle.presence)return null;\nreturn bitReader(handle.presence);\n}\nfunction dictSize(dict){\nif(!dict)return 0;\nif(typeof dict.size==='number')return dict.size;\nif(typeof dict.values==='function')return dict.values().length;\nreturn 0;\n}\nfunction dictValue(dict,code){\nif(!dict)return null;\nif(typeof dict.valueOf==='function')return dict.valueOf(code);\nif(typeof dict.values==='function')return dict.values()[code];\nreturn null;\n}\nfunction multiValue(handle,i){\nconst offsets=handle.offsets;\nconst values=handle.values;\nif(!offsets||!values)return[];\nconst from=offsets[i];\nconst to=offsets[i+1];\nif(!(to>from))return[];\nconst dict=handle.dict;\nconst out=new Array(to-from);\nfor(let k=from;k<to;k++)out[k-from]=dict?dictValue(dict,values[k]):values[k];\nreturn out;\n}\nfunction valueReader(handle){\nif(!handle)return()=>undefined;\nconst values=handle.values;\nconst present=presenceReader(handle);\nconst kind=handle.kind;\nif(kind==='dictionary'){\nconst dict=handle.dict;\nif(present)return(i)=>(present(i)?dictValue(dict,values[i]):null);\nreturn(i)=>dictValue(dict,values[i]);\n}\nif(kind==='bitset'){\nconst bit=bitReader(values);\nif(present)return(i)=>(present(i)?bit(i)===1:null);\nreturn(i)=>bit(i)===1;\n}\nif(kind==='multi'){\nif(present)return(i)=>(present(i)?multiValue(handle,i):null);\nreturn(i)=>multiValue(handle,i);\n}\nif(!values&&typeof handle.get==='function'){\nconst get=handle.get.bind(handle);\nreturn(i)=>{\nconst v=get(i);\nreturn v===undefined?null:v;\n};\n}\nif(present){\nreturn(i)=>{\nif(!present(i))return null;\nconst v=values[i];\nreturn v===undefined?null:v;\n};\n}\nreturn(i)=>{\nconst v=values[i];\nreturn v===undefined?null:v;\n};\n}\nfunction numericTotalOrder(a,b){\nif(a<b)return-1;\nif(a>b)return 1;\nif(a===b){\nconst na=Object.is(a,-0);\nconst nb=Object.is(b,-0);\nif(na===nb)return 0;\nreturn na?-1:1;\n}\nconst an=Number.isNaN(a);\nconst bn=Number.isNaN(b);\nif(an&&bn)return 0;\nreturn an?1:-1;\n}\nfunction valueComparator(locale){\nconst coll=collator(locale);\nreturn(a,b)=>{\nif(a===b)return 0;\nconst ta=typeof a;\nconst tb=typeof b;\nif(ta==='string'&&tb==='string')return coll.compare(a,b);\nif(ta==='number'&&tb==='number')return numericTotalOrder(a,b);\nif(ta==='boolean'&&tb==='boolean')return a===b?0:a?1:-1;\nif(a instanceof Date||b instanceof Date){\nconst na=a instanceof Date?a.getTime():Number(a);\nconst nb=b instanceof Date?b.getTime():Number(b);\nreturn numericTotalOrder(na,nb);\n}\nreturn defaultCompare(a,b);\n};\n}\nfunction dictRanks(dict,locale){\nif(dict&&typeof dict.ranks==='function')return dict.ranks(locale);\nconst table=dict&&typeof dict.values==='function'?dict.values():[];\nconst n=table.length;\nconst cmp=valueComparator(locale);\nconst order=new Array(n);\nfor(let i=0;i<n;i++)order[i]=i;\norder.sort((a,b)=>cmp(table[a],table[b])||a-b);\nconst ranks=new Uint32Array(n);\nfor(let r=0;r<n;r++)ranks[order[r]]=r;\nreturn ranks;\n}\nfunction isMissing(v){\nreturn v===null||v===undefined||(typeof v==='number'&&Number.isNaN(v));\n}\n});\n__def(\"packages/core/src/compute/sort.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"radixSortFloat64\",{enumerable:true,get:function(){return radixSortFloat64;}});\nObject.defineProperty(__exports,\"radixSortInt32\",{enumerable:true,get:function(){return radixSortInt32;}});\nObject.defineProperty(__exports,\"rankSortDictionary\",{enumerable:true,get:function(){return rankSortDictionary;}});\nObject.defineProperty(__exports,\"mergeSortComparator\",{enumerable:true,get:function(){return mergeSortComparator;}});\nObject.defineProperty(__exports,\"rankSortStrings\",{enumerable:true,get:function(){return rankSortStrings;}});\nObject.defineProperty(__exports,\"collateStringRanks\",{enumerable:true,get:function(){return collateStringRanks;}});\nObject.defineProperty(__exports,\"sortColumn\",{enumerable:true,get:function(){return sortColumn;}});\nObject.defineProperty(__exports,\"sortMulti\",{enumerable:true,get:function(){return sortMulti;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst bitReader=__m0[\"bitReader\"];\nconst dictRanks=__m0[\"dictRanks\"];\nconst dictSize=__m0[\"dictSize\"];\nconst identity=__m0[\"identity\"];\nconst isMissing=__m0[\"isMissing\"];\nconst presenceReader=__m0[\"presenceReader\"];\nconst rowCount=__m0[\"rowCount\"];\nconst valueComparator=__m0[\"valueComparator\"];\nconst valueReader=__m0[\"valueReader\"];\nconst EMPTY_INDICES=new Uint32Array(0);\nconst SCRATCH=new ArrayBuffer(8);\nconst SCRATCH_F64=new Float64Array(SCRATCH);\nconst SCRATCH_U32=new Uint32Array(SCRATCH);\nconst HI=(()=>{\nSCRATCH_F64[0]=-1;\nreturn(SCRATCH_U32[1]&0x80000000)!==0?1:0;\n})();\nconst LO=HI===1?0:1;\nfunction transformDouble(value,out){\nSCRATCH_F64[0]=value;\nlet hi=SCRATCH_U32[HI];\nlet lo=SCRATCH_U32[LO];\nif((hi&0x80000000)!==0){\nhi=~hi>>>0;\nlo=~lo>>>0;\n}else{\nhi=(hi^0x80000000)>>>0;\n}\nout[0]=lo;\nout[1]=hi;\n}\nfunction radixLsd64(idx,lo,hi,n){\nif(n<2)return idx;\nconst hist=new Uint32Array(256*8);\nfor(let i=0;i<n;i++){\nconst l=lo[i];\nconst h=hi[i];\nhist[l&0xff]++;\nhist[256+((l>>>8)&0xff)]++;\nhist[512+((l>>>16)&0xff)]++;\nhist[768+((l>>>24)&0xff)]++;\nhist[1024+(h&0xff)]++;\nhist[1280+((h>>>8)&0xff)]++;\nhist[1536+((h>>>16)&0xff)]++;\nhist[1792+((h>>>24)&0xff)]++;\n}\nlet srcIdx=idx;\nlet srcLo=lo;\nlet srcHi=hi;\nlet dstIdx=new Uint32Array(n);\nlet dstLo=new Uint32Array(n);\nlet dstHi=new Uint32Array(n);\nconst offset=new Uint32Array(256);\nfor(let pass=0;pass<8;pass++){\nconst base=pass<<8;\nconst shift=(pass&3)<<3;\nconst useHi=pass>=4;\nlet skip=false;\nfor(let b=0;b<256;b++){\nif(hist[base+b]===n){skip=true;break;}\n}\nif(skip)continue;\nlet sum=0;\nfor(let b=0;b<256;b++){\noffset[b]=sum;\nsum+=hist[base+b];\n}\nfor(let i=0;i<n;i++){\nconst l=srcLo[i];\nconst h=srcHi[i];\nconst digit=((useHi?h:l)>>>shift)&0xff;\nconst p=offset[digit]++;\ndstIdx[p]=srcIdx[i];\ndstLo[p]=l;\ndstHi[p]=h;\n}\nlet t=srcIdx;srcIdx=dstIdx;dstIdx=t;\nt=srcLo;srcLo=dstLo;dstLo=t;\nt=srcHi;srcHi=dstHi;dstHi=t;\n}\nreturn srcIdx;\n}\nfunction radixLsd32(idx,keys,n){\nif(n<2)return idx;\nconst hist=new Uint32Array(256*4);\nfor(let i=0;i<n;i++){\nconst k=keys[i];\nhist[k&0xff]++;\nhist[256+((k>>>8)&0xff)]++;\nhist[512+((k>>>16)&0xff)]++;\nhist[768+((k>>>24)&0xff)]++;\n}\nlet srcIdx=idx;\nlet srcKeys=keys;\nlet dstIdx=new Uint32Array(n);\nlet dstKeys=new Uint32Array(n);\nconst offset=new Uint32Array(256);\nfor(let pass=0;pass<4;pass++){\nconst base=pass<<8;\nconst shift=pass<<3;\nlet skip=false;\nfor(let b=0;b<256;b++){\nif(hist[base+b]===n){skip=true;break;}\n}\nif(skip)continue;\nlet sum=0;\nfor(let b=0;b<256;b++){\noffset[b]=sum;\nsum+=hist[base+b];\n}\nfor(let i=0;i<n;i++){\nconst k=srcKeys[i];\nconst p=offset[(k>>>shift)&0xff]++;\ndstIdx[p]=srcIdx[i];\ndstKeys[p]=k;\n}\nlet t=srcIdx;srcIdx=dstIdx;dstIdx=t;\nt=srcKeys;srcKeys=dstKeys;dstKeys=t;\n}\nreturn srcIdx;\n}\nfunction countingSort(idx,keys,n,radix){\nconst counts=new Uint32Array(radix+1);\nfor(let i=0;i<n;i++)counts[keys[i]]++;\nlet sum=0;\nfor(let k=0;k<=radix;k++){\nconst c=counts[k];\ncounts[k]=sum;\nsum+=c;\n}\nconst out=new Uint32Array(n);\nfor(let i=0;i<n;i++)out[counts[keys[i]]++]=idx[i];\nreturn out;\n}\nfunction sortUint32Keys(idx,keys,n,radix){\nif(n<2)return idx;\nif(radix<=65536||radix<=n*2)return countingSort(idx,keys,n,radix);\nreturn radixLsd32(idx,keys,n);\n}\nfunction exact(buffer,n){\nif(buffer.length===n&&buffer.byteOffset===0)return buffer;\nreturn Uint32Array.prototype.slice.call(buffer,0,n);\n}\nfunction radixSortFloat64(values,order,descending=false){\nconst src=order||identity(values.length);\nconst n=src.length;\nif(n<2)return Uint32Array.from(src);\nconst idx=new Uint32Array(n);\nconst lo=new Uint32Array(n);\nconst hi=new Uint32Array(n);\nconst nans=new Uint32Array(n);\nconst pair=new Uint32Array(2);\nlet m=0;\nlet nanCount=0;\nfor(let i=0;i<n;i++){\nconst row=src[i];\nconst v=values[row];\nif(Number.isNaN(v)){nans[nanCount++]=row;continue;}\ntransformDouble(v,pair);\nif(descending){\nlo[m]=~pair[0]>>>0;\nhi[m]=~pair[1]>>>0;\n}else{\nlo[m]=pair[0];\nhi[m]=pair[1];\n}\nidx[m++]=row;\n}\nconst sorted=radixLsd64(idx.subarray(0,m),lo.subarray(0,m),hi.subarray(0,m),m);\nif(nanCount===0)return exact(sorted,m);\nconst out=new Uint32Array(n);\nout.set(sorted.subarray(0,m),0);\nout.set(nans.subarray(0,nanCount),m);\nreturn out;\n}\nfunction radixSortInt32(values,order,descending=false){\nconst src=order||identity(values.length);\nconst n=src.length;\nif(n<2)return Uint32Array.from(src);\nconst idx=Uint32Array.from(src);\nconst keys=new Uint32Array(n);\nfor(let i=0;i<n;i++){\nconst k=(values[idx[i]]^0x80000000)>>>0;\nkeys[i]=descending?(~k>>>0):k;\n}\nreturn exact(radixLsd32(idx,keys,n),n);\n}\nfunction rankSortDictionary(handle,order,opts={}){\nconst src=order||identity(rowCount(handle,opts));\nconst n=src.length;\nif(n<2)return Uint32Array.from(src);\nconst ranks=dictRanks(handle.dict,opts.locale);\nconst codes=handle.values;\nconst present=presenceReader(handle);\nconst size=Math.max(dictSize(handle.dict),ranks.length);\nconst absentRank=size;\nconst idx=Uint32Array.from(src);\nconst keys=new Uint32Array(n);\nconst descending=!!opts.descending;\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nlet rank=present&&present(row)===0?absentRank:ranks[codes[row]];\nif(rank===undefined)rank=absentRank;\nkeys[i]=descending?absentRank-rank:rank;\n}\nreturn exact(sortUint32Keys(idx,keys,n,size+1),n);\n}\nfunction mergeSortComparator(values,order,compare){\nconst n=order.length;\nlet src=Uint32Array.from(order);\nif(n<2)return src;\nlet dst=new Uint32Array(n);\nfor(let width=1;width<n;width<<=1){\nfor(let start=0;start<n;start+=width<<1){\nconst mid=Math.min(start+width,n);\nconst end=Math.min(start+(width<<1),n);\nlet i=start;\nlet j=mid;\nlet k=start;\nwhile(i<mid&&j<end){\ndst[k++]=compare(values[src[i]],values[src[j]])<=0?src[i++]:src[j++];\n}\nwhile(i<mid)dst[k++]=src[i++];\nwhile(j<end)dst[k++]=src[j++];\n}\nconst t=src;src=dst;dst=t;\n}\nreturn src;\n}\nfunction sortBitsetColumn(handle,idx,descending){\nconst bit=bitReader(handle.values);\nconst n=idx.length;\nconst out=new Uint32Array(n);\nconst first=descending?1:0;\nlet k=0;\nfor(let i=0;i<n;i++)if(bit(idx[i])===first)out[k++]=idx[i];\nfor(let i=0;i<n;i++)if(bit(idx[i])!==first)out[k++]=idx[i];\nreturn out;\n}\nfunction indexableValues(handle,idx){\nconst values=handle.values;\nconst kind=handle.kind;\nconst direct=(kind==='object'||kind===undefined)&&(Array.isArray(values)||ArrayBuffer.isView(values));\nif(direct&&!handle.presence)return values;\nconst reader=valueReader(handle);\nconst materialised=new Array(rowCount(handle)||0);\nfor(let i=0;i<idx.length;i++){\nconst row=idx[i];\nmaterialised[row]=reader(row);\n}\nreturn materialised;\n}\nfunction allStrings(values,idx){\nfor(let i=0;i<idx.length;i++){\nif(typeof values[idx[i]]!=='string')return false;\n}\nreturn true;\n}\nfunction rankSortStrings(idx,codes,ranks,d,descending){\nconst n=idx.length;\nconst idxOut=Uint32Array.from(idx);\nif(n<2||d<1)return idxOut;\nconst keys=new Uint32Array(n);\nconst top=d-1;\nfor(let i=0;i<n;i++){\nconst rank=ranks[codes[i]];\nkeys[i]=descending?top-rank:rank;\n}\nreturn exact(sortUint32Keys(idxOut,keys,n,d),n);\n}\nfunction collateStringRanks(table,d,locale){\nconst compare=valueComparator(locale);\nconst order=new Array(d);\nfor(let i=0;i<d;i++)order[i]=i;\norder.sort((a,b)=>compare(table[a],table[b])||a-b);\nconst ranks=new Uint32Array(d);\nfor(let r=0;r<d;r++)ranks[order[r]]=r;\nreturn ranks;\n}\nfunction keyedSortStrings(values,idx,opts){\nconst n=idx.length;\nconst codeOf=new Map();\nconst table=[];\nconst codes=new Uint32Array(n);\nfor(let i=0;i<n;i++){\nconst v=values[idx[i]];\nlet c=codeOf.get(v);\nif(c===undefined){c=table.length;codeOf.set(v,c);table.push(v);}\ncodes[i]=c;\n}\nconst d=table.length;\nconst ranks=collateStringRanks(table,d,opts.locale);\nreturn rankSortStrings(idx,codes,ranks,d,!!opts.descending);\n}\nfunction sortByComparator(handle,idx,opts){\nconst values=indexableValues(handle,idx);\nif(idx.length>=2&&allStrings(values,idx)){\nconst index=handle.stringRank;\nif(index&&index.version===handle.version&&index.usable(idx,values,opts.locale)){\nreturn index.sort(idx,opts);\n}\nreturn keyedSortStrings(values,idx,opts);\n}\nconst base=valueComparator(opts.locale);\nconst compare=opts.descending?(a,b)=>base(b,a):base;\nreturn mergeSortComparator(values,idx,compare);\n}\nfunction sortByCompare(handle,idx,opts){\nconst values=indexableValues(handle,idx);\nconst user=opts.compare;\nconst descending=!!opts.descending;\nconst compare=descending\n?(a,b)=>-user(a,b,undefined,undefined,true)\n:(a,b)=>user(a,b,undefined,undefined,false);\nreturn mergeSortComparator(values,idx,compare);\n}\nfunction partitionPresent(handle,idx){\nconst n=idx.length;\nconst present=presenceReader(handle);\nconst values=handle.values;\nconst checkNaN=handle.kind==='float64'&&!!values;\nconst looseKind=handle.kind==='object'||handle.kind==='multi'||handle.kind===undefined;\nif(!present&&!checkNaN&&!looseKind)return{present:idx,absent:EMPTY_INDICES};\nconst keep=new Uint32Array(n);\nconst drop=new Uint32Array(n);\nlet p=0;\nlet a=0;\nif(present&&checkNaN){\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(present(row)===1&&!Number.isNaN(values[row]))keep[p++]=row;else drop[a++]=row;\n}\n}else if(checkNaN&&!present){\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(!Number.isNaN(values[row]))keep[p++]=row;else drop[a++]=row;\n}\n}else if(present&&!looseKind){\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(present(row)===1)keep[p++]=row;else drop[a++]=row;\n}\n}else{\nconst reader=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(!isMissing(reader(row)))keep[p++]=row;else drop[a++]=row;\n}\n}\nif(a===0)return{present:idx,absent:EMPTY_INDICES};\nreturn{present:keep.subarray(0,p),absent:drop.subarray(0,a)};\n}\nfunction joinRuns(sorted,absent,nullsFirst){\nif(absent.length===0)return sorted;\nconst out=new Uint32Array(sorted.length+absent.length);\nif(nullsFirst){\nout.set(absent,0);\nout.set(sorted,absent.length);\n}else{\nout.set(sorted,0);\nout.set(absent,sorted.length);\n}\nreturn out;\n}\nfunction sortColumn(handle,order,opts={}){\nconst src=order||identity(rowCount(handle,opts));\nif(!handle||src.length<2)return Uint32Array.from(src);\nconst{present,absent}=partitionPresent(handle,src);\nif(present.length===0)return Uint32Array.from(src);\nconst descending=!!opts.descending;\nlet sorted;\nif(typeof opts.compare==='function'){\nsorted=sortByCompare(handle,present,opts);\n}else{\nswitch(handle.kind){\ncase'float64':\nsorted=radixSortFloat64(handle.values,present,descending);\nbreak;\ncase'int32':\nsorted=radixSortInt32(handle.values,present,descending);\nbreak;\ncase'dictionary':\nsorted=rankSortDictionary(handle,present,opts);\nbreak;\ncase'bitset':\nsorted=sortBitsetColumn(handle,present,descending);\nbreak;\ndefault:\nsorted=sortByComparator(handle,present,opts);\nbreak;\n}\n}\nreturn joinRuns(sorted,absent,!!opts.nullsFirst);\n}\nfunction sortMulti(handles,entries,order,opts={}){\nconst list=entries||[];\nconst first=(list.length&&(list[0].handle||byId(handles,list[0].col)))||(handles&&handles[0]);\nlet current=order||identity(rowCount(first,opts));\nfor(let i=list.length-1;i>=0;i--){\nconst entry=list[i];\nconst handle=entry.handle||byId(handles,entry.col)||(handles&&handles[i]);\nif(!handle)continue;\ncurrent=sortColumn(handle,current,{\ndescending:entry.descending!==undefined?!!entry.descending:entry.dir==='desc',\nnullsFirst:!!entry.nullsFirst,\nlocale:entry.locale!==undefined?entry.locale:opts.locale,\ncompare:entry.compare,\n});\n}\nreturn current instanceof Uint32Array?current:Uint32Array.from(current);\n}\nfunction byId(handles,id){\nif(!handles||id===undefined)return undefined;\nfor(let i=0;i<handles.length;i++)if(handles[i]&&handles[i].id===id)return handles[i];\nreturn undefined;\n}\n});\n__def(\"packages/core/src/store/stringrank.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"DEFAULT_MAX_DISTINCT\",{enumerable:true,get:function(){return DEFAULT_MAX_DISTINCT;}});\nObject.defineProperty(__exports,\"StringRankIndex\",{enumerable:true,get:function(){return StringRankIndex;}});\nconst __m0=__req(\"packages/core/src/compute/sort.js\");\nconst collateStringRanks=__m0[\"collateStringRanks\"];\nconst rankSortStrings=__m0[\"rankSortStrings\"];\nconst DEFAULT_MAX_DISTINCT=100000;\nclass StringRankIndex{\n#table=[];\n#codeOf=new Map();\n#codeByRow;\n#length=0;\n#generation=0;\n#stamp=-1;\n#maxDistinct;\n#capped=false;\n#ranks=null;\n#ranksGeneration=-1;\n#ranksLocale='\\u0000';\nconstructor(maxDistinct=DEFAULT_MAX_DISTINCT){\nthis.#maxDistinct=maxDistinct>0?maxDistinct:DEFAULT_MAX_DISTINCT;\nthis.#codeByRow=new Uint32Array(0);\n}\nget version(){return this.#stamp;}\nset version(version){this.#stamp=version;}\nget generation(){return this.#generation;}\nget size(){return this.#table.length;}\nget capped(){return this.#capped;}\nget length(){return this.#length;}\nget bytes(){\nlet total=this.#codeByRow.byteLength;\nconst table=this.#table;\nfor(let i=0;i<table.length;i++)total+=table[i].length*2+24;\nreturn total;\n}\n#intern(value,capOnGrowth){\nconst existing=this.#codeOf.get(value);\nif(existing!==undefined)return existing;\nif(this.#capped)return-1;\nif(capOnGrowth&&this.#table.length>=this.#maxDistinct){\nthis.#capped=true;\nreturn-1;\n}\nconst code=this.#table.length;\nthis.#table.push(value);\nthis.#codeOf.set(value,code);\nthis.#generation++;\nreturn code;\n}\nbuild(values,count){\nconst n=count|0;\nthis.#table=[];\nthis.#codeOf=new Map();\nthis.#generation=0;\nthis.#capped=false;\nthis.#ranks=null;\nthis.#ranksGeneration=-1;\nthis.#codeByRow=new Uint32Array(n);\nfor(let row=0;row<n;row++){\nconst v=values[row];\nconst code=typeof v==='string'?this.#intern(v,false):-1;\nthis.#codeByRow[row]=code<0?0:code;\n}\nthis.#length=n;\n}\nappend(values,from,count){\nconst to=(from|0)+(count|0);\nif(to>this.#codeByRow.length){\nconst next=new Uint32Array(to);\nnext.set(this.#codeByRow.subarray(0,this.#length));\nthis.#codeByRow=next;\n}\nfor(let row=from|0;row<to;row++){\nconst v=values[row];\nconst code=typeof v==='string'?this.#intern(v,true):-1;\nthis.#codeByRow[row]=code<0?0:code;\n}\nthis.#length=Math.max(this.#length,to);\n}\nranks(locale){\nconst key=locale||'';\nif(this.#ranks&&this.#ranksGeneration===this.#generation&&this.#ranksLocale===key){\nreturn this.#ranks;\n}\nconst ranks=collateStringRanks(this.#table,this.#table.length,locale);\nthis.#ranks=ranks;\nthis.#ranksGeneration=this.#generation;\nthis.#ranksLocale=key;\nreturn ranks;\n}\nusable(idx,values,locale){\nif(this.#capped||this.#table.length===0)return false;\nconst codeByRow=this.#codeByRow;\nconst table=this.#table;\nconst covered=this.#length;\nfor(let i=0;i<idx.length;i++){\nconst row=idx[i];\nif(row>=covered)return false;\nif(table[codeByRow[row]]!==values[row])return false;\n}\nreturn true;\n}\nsort(idx,opts){\nconst ranks=this.ranks(opts.locale);\nconst d=this.#table.length;\nconst n=idx.length;\nconst codes=new Uint32Array(n);\nconst codeByRow=this.#codeByRow;\nfor(let i=0;i<n;i++)codes[i]=codeByRow[idx[i]];\nreturn rankSortStrings(idx,codes,ranks,d,!!opts.descending);\n}\n}\n});\n__def(\"packages/core/src/store/columnstore.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"REMOVED\",{enumerable:true,get:function(){return REMOVED;}});\nObject.defineProperty(__exports,\"toFloat\",{enumerable:true,get:function(){return toFloat;}});\nObject.defineProperty(__exports,\"ColumnHandle\",{enumerable:true,get:function(){return ColumnHandle;}});\nObject.defineProperty(__exports,\"ColumnStore\",{enumerable:true,get:function(){return ColumnStore;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst warnOnce=__m0[\"warnOnce\"];\nconst isFunction=__m0[\"isFunction\"];\nconst pathGetter=__m0[\"pathGetter\"];\nconst __m1=__req(\"packages/core/src/store/bitset.js\");\nconst Bitset=__m1[\"Bitset\"];\nconst __m2=__req(\"packages/core/src/store/dictionary.js\");\nconst Dictionary=__m2[\"Dictionary\"];\nconst __m3=__req(\"packages/core/src/store/multivalue.js\");\nconst MultiValue=__m3[\"MultiValue\"];\nconst __m4=__req(\"packages/core/src/store/stringrank.js\");\nconst StringRankIndex=__m4[\"StringRankIndex\"];\nconst REMOVED=0xFFFFFFFF;\nconst DEFAULT_CAPACITY=1024;\nconst DEFAULT_COLUMNAR_BELOW=5000;\nconst DEFAULT_COMPACT_RATIO=0.2;\nconst KINDS=new Set(['float64','int32','bitset','dictionary','object','multi']);\nfunction absent(v){return v===null||v===undefined;}\nfunction toFloat(v){\nif(typeof v==='number')return v;\nif(v instanceof Date)return v.getTime();\nif(typeof v==='boolean')return v?1:0;\nconst n=Number(v);\nreturn Number.isNaN(n)&&typeof v==='string'?Date.parse(v):n;\n}\nfunction toInt(v){\nconst n=toFloat(v);\nreturn Number.isFinite(n)?n|0:0;\n}\nfunction toMembers(v){\nif(absent(v))return[];\nreturn Array.isArray(v)?v:[v];\n}\nfunction decodeFrom(old,p){\nswitch(old.kind){\ncase'float64':\ncase'int32':return old.buf[p];\ncase'bitset':return old.bits.get(p)===1;\ncase'dictionary':return old.dict.valueOf(old.buf[p]);\ncase'multi':{\nconst codes=old.mv.at(p);\nconst out=new Array(codes.length);\nfor(let i=0;i<codes.length;i++)out[i]=old.dict.valueOf(codes[i]);\nreturn out;\n}\ndefault:return old.buf[p];\n}\n}\nfunction decodePacked(frag,i){\nswitch(frag.kind){\ncase'float64':\ncase'int32':return frag.values[i];\ncase'bitset':return(frag.values[i>>3]&(1<<(i&7)))!==0;\ncase'dictionary':return(frag.table||[])[frag.values[i]];\ncase'multi':{\nconst start=frag.offsets[i];\nconst end=frag.offsets[i+1];\nconst table=frag.table||[];\nconst out=new Array(end-start);\nfor(let k=start;k<end;k++)out[k-start]=table[frag.values[k]];\nreturn out;\n}\ndefault:return frag.values[i];\n}\n}\nclass ColumnHandle{\n#id;\n#kind;\n#target;\n#nullable;\n#read;\n#host;\n#seed;\n#columnar=false;\n#buf=null;\n#bits=null;\n#mv=null;\n#dict=null;\n#stringRank=null;\n#stringRankOn;\n#stringRankMax;\n#stringRankVersion=-1;\n#presence=null;\n#capacity=0;\n#version=0;\n#overlay=null;\n#cache=null;\n#released=false;\nconstructor(schema,host){\nthis.#id=schema.id;\nconst kind=KINDS.has(schema.kind)?schema.kind:'object';\nif(schema.kind&&!KINDS.has(schema.kind)){\nwarnOnce(`store.kind.${schema.id}`,\n`column \"${schema.id}\" declares unknown storage kind \"${schema.kind}\"; falling back to object`);\n}\nthis.#target=kind;\nthis.#kind=kind;\nthis.#nullable=schema.nullable!==false;\nthis.#seed=schema.dictionary??null;\nthis.#host=host;\nthis.#read=isFunction(schema.read)\n?schema.read\n:pathGetter(schema.field||schema.id);\nthis.#stringRankOn=schema.stringRankIndex!=='off';\nthis.#stringRankMax=typeof schema.stringRankMaxDistinct==='number'\n?schema.stringRankMaxDistinct\n:0;\nthis.#overlay=new Map();\n}\nget id(){return this.#id;}\nget kind(){return this.#columnar?this.#kind:'object';}\nget target(){return this.#target;}\nget nullable(){return this.#nullable;}\nget values(){\nif(this.#released)return null;\nif(!this.#columnar)return this.#lazy().values;\nif(this.#kind==='bitset')return this.#bits.words;\nif(this.#kind==='multi')return this.#mv.values;\nreturn this.#buf;\n}\nget presence(){\nif(this.#released||!this.#nullable)return null;\nreturn this.#columnar?this.#presence:this.#lazy().presence;\n}\nget dict(){\nif(this.#released||!this.#columnar)return null;\nreturn this.#kind==='dictionary'||this.#kind==='multi'?this.#dict:null;\n}\nget stringRank(){\nif(this.#released||!this.#stringRankOn)return null;\nif(this.kind!=='object')return null;\nconst values=this.values;\nconst n=this.#host.physical();\nif(!values||n===0)return null;\nif(this.#stringRank===null){\nif(typeof values[0]!=='string')return null;\nconst index=new StringRankIndex(this.#resolveStringRankMax());\nindex.build(values,n);\nindex.version=this.#version;\nthis.#stringRank=index;\nthis.#stringRankVersion=this.#version;\nreturn index.capped?null:index;\n}\nif(this.#stringRank.length<n){\nthis.#stringRank.append(values,this.#stringRank.length,n-this.#stringRank.length);\n}\nthis.#stringRank.version=this.#version;\nthis.#stringRankVersion=this.#version;\nreturn this.#stringRank.capped?null:this.#stringRank;\n}\n#resolveStringRankMax(){return this.#stringRankMax;}\n#dropStringRank(){\nthis.#stringRank=null;\nthis.#stringRankVersion=-1;\n}\nget offsets(){\nif(this.#released||!this.#columnar||this.#kind!=='multi')return null;\nreturn this.#mv.offsets;\n}\nget version(){return this.#version;}\nget bytes(){\nlet total=0;\nif(this.#buf)total+=this.#buf.byteLength??this.#buf.length*8;\nif(this.#bits)total+=this.#bits.bytes;\nif(this.#mv)total+=this.#mv.bytes;\nif(this.#presence)total+=this.#presence.bytes;\nif(this.#dict)total+=this.#dict.bytes;\nif(this.#overlay)total+=this.#overlay.size*24;\nreturn total;\n}\nget(physical){\nif(this.#released)return undefined;\nif(physical<0||physical>=this.#host.physical())return undefined;\nif(!this.#columnar)return this.#rowValue(physical);\nif(this.#nullable&&this.#presence.get(physical)===0)return null;\nswitch(this.#kind){\ncase'float64':\ncase'int32':return this.#buf[physical];\ncase'bitset':return this.#bits.get(physical)===1;\ncase'dictionary':return this.#dict.valueOf(this.#buf[physical]);\ncase'multi':{\nconst codes=this.#mv.at(physical);\nconst out=new Array(codes.length);\nfor(let i=0;i<codes.length;i++)out[i]=this.#dict.valueOf(codes[i]);\nreturn out;\n}\ndefault:return this.#buf[physical];\n}\n}\nset(physical,value){\nif(this.#released)return;\nif(this.#columnar)this.#writeValue(physical,value);\nelse this.#overlay.set(physical,value===undefined?null:value);\nif(this.#stringRank)this.#dropStringRank();\nthis.#version++;\n}\nread(row){return this.#read(row);}\nappendColumn(objects,from,n){\nif(this.#released||n<=0)return;\nif(!this.#columnar){this.#version++;return;}\nconst read=this.#read;\nconst nullable=this.#nullable;\nconst presence=this.#presence;\nlet sawAbsent=false;\nswitch(this.#kind){\ncase'float64':{\nconst buf=this.#buf;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nif(typeof v==='number'){\nif(nullable)presence.set(from+i);\nbuf[from+i]=v;\ncontinue;\n}\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?NaN:toFloat(v);\n}\nbreak;\n}\ncase'int32':{\nconst buf=this.#buf;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?0:toInt(v);\n}\nbreak;\n}\ncase'bitset':{\nconst bits=this.#bits;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbits.assign(from+i,!gone&&!!v);\n}\nbreak;\n}\ncase'dictionary':{\nconst buf=this.#buf;\nconst dict=this.#dict;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?0:dict.codeOf(v);\n}\nbreak;\n}\ncase'multi':{\nconst mv=this.#mv;\nconst dict=this.#dict;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nconst members=toMembers(v);\nconst codes=new Array(members.length);\nfor(let k=0;k<members.length;k++)codes[k]=dict.codeOf(members[k]);\nmv.write(from+i,codes);\n}\nbreak;\n}\ndefault:{\nconst buf=this.#buf;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?null:v;\n}\nbreak;\n}\n}\nif(sawAbsent){\nwarnOnce(`store.null.${this.#id}`,\n`column \"${this.#id}\" is declared non-nullable but received null; storing a filler value`);\n}\nif(this.#stringRank&&this.#kind==='object'){\nthis.#stringRank.append(this.#buf,from,n);\nthis.#stringRank.version=this.#version+1;\nthis.#stringRankVersion=this.#version+1;\n}\nthis.#version++;\n}\nappendPacked(frag,from,n){\nif(this.#released||n<=0||!frag)return;\nif(!this.#columnar){this.#version++;return;}\nconst presence=this.#presence;\nconst fragPresence=frag.presence;\nif(presence){\nif(fragPresence){\nfor(let i=0;i<n;i++)presence.assign(from+i,(fragPresence[i>>3]&(1<<(i&7)))!==0);\n}else{\nfor(let i=0;i<n;i++)presence.set(from+i);\n}\n}\nconst kindsAgree=frag.kind===this.#kind;\nif(kindsAgree&&(this.#kind==='float64'||this.#kind==='int32')){\nthis.#buf.set(frag.values,from);\nthis.#version++;\nreturn;\n}\nif(kindsAgree&&this.#kind==='bitset'){\nconst words=frag.values;\nfor(let i=0;i<n;i++)this.#bits.assign(from+i,(words[i>>3]&(1<<(i&7)))!==0);\nthis.#version++;\nreturn;\n}\nif(kindsAgree&&this.#kind==='dictionary'){\nconst table=frag.table||[];\nconst remap=new Uint32Array(table.length);\nfor(let t=0;t<table.length;t++)remap[t]=this.#dict.codeOf(table[t]);\nconst codes=frag.values;\nconst buf=this.#buf;\nconst pres=presence;\nfor(let i=0;i<n;i++){\nif(pres&&(fragPresence?(fragPresence[i>>3]&(1<<(i&7)))===0:false)){buf[from+i]=0;continue;}\nbuf[from+i]=remap[codes[i]]??0;\n}\nthis.#version++;\nreturn;\n}\nif(kindsAgree&&this.#kind==='multi'){\nconst table=frag.table||[];\nconst remap=new Uint32Array(table.length);\nfor(let t=0;t<table.length;t++)remap[t]=this.#dict.codeOf(table[t]);\nconst flat=frag.values;\nconst offsets=frag.offsets;\nfor(let i=0;i<n;i++){\nconst start=offsets[i];\nconst end=offsets[i+1];\nconst codes=new Array(end-start);\nfor(let k=start;k<end;k++)codes[k-start]=remap[flat[k]]??0;\nthis.#mv.write(from+i,codes);\n}\nthis.#version++;\nreturn;\n}\nfor(let i=0;i<n;i++){\nconst gone=fragPresence\n?(fragPresence[i>>3]&(1<<(i&7)))===0\n:(frag.kind==='object'?frag.values[i]===null:false);\nthis.#writeValue(from+i,gone?null:decodePacked(frag,i));\n}\nthis.#version++;\n}\ntouch(){this.#version++;}\ncolumnarise(capacity,fill){\nif(this.#columnar||this.#released)return;\nconst values=new Array(fill);\nfor(let p=0;p<fill;p++)values[p]=this.#rowValue(p);\nthis.#kind=this.#target;\nthis.#columnar=true;\nthis.#alloc(capacity);\nfor(let p=0;p<fill;p++)this.#writeValue(p,values[p]);\nthis.#overlay.clear();\nthis.#cache=null;\nthis.#dropStringRank();\nthis.#version++;\n}\ngrow(capacity){\nif(!this.#columnar||this.#released||capacity<=this.#capacity)return;\nswitch(this.#kind){\ncase'float64':case'int32':case'dictionary':{\nconst next=new this.#buf.constructor(capacity);\nnext.set(this.#buf);\nthis.#buf=next;\nbreak;\n}\ncase'bitset':this.#bits.grow(capacity);break;\ncase'multi':break;\ndefault:this.#buf.length=capacity;break;\n}\nif(this.#presence)this.#presence.grow(capacity);\nthis.#capacity=capacity;\nthis.#version++;\n}\nconvert(kind){\nif(this.#released||!KINDS.has(kind))return false;\nthis.#target=kind;\nif(!this.#columnar||kind===this.#kind)return false;\nconst old={kind:this.#kind,buf:this.#buf,bits:this.#bits,mv:this.#mv,dict:this.#dict};\nconst n=this.#host.physical();\nconst presence=this.#presence;\nthis.#kind=kind;\nthis.#alloc(this.#capacity);\nfor(let p=0;p<n;p++){\nconst gone=presence!==null&&presence.get(p)===0;\nif(gone&&kind!=='multi')continue;\nthis.#writeValue(p,gone?null:decodeFrom(old,p));\n}\nthis.#dropStringRank();\nthis.#version++;\nreturn true;\n}\ncompact(remap,oldFill,liveCount){\nif(this.#released)return;\nthis.#dropStringRank();\nif(!this.#columnar){\nconst overlay=this.#overlay;\nif(overlay.size){\nconst next=new Map();\nfor(const[p,v]of overlay)if(remap[p]!==REMOVED)next.set(remap[p],v);\nthis.#overlay=next;\n}\nthis.#cache=null;\nthis.#version++;\nreturn;\n}\nswitch(this.#kind){\ncase'float64':case'int32':case'dictionary':case'object':{\nconst buf=this.#buf;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)buf[remap[p]]=buf[p];\nif(this.#kind==='object')for(let p=liveCount;p<oldFill;p++)buf[p]=undefined;\nbreak;\n}\ncase'bitset':{\nconst bits=this.#bits;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)bits.assign(remap[p],bits.get(p)===1);\nfor(let p=liveCount;p<oldFill;p++)bits.clear(p);\nbreak;\n}\ncase'multi':this.#mv.compact(remap,liveCount,REMOVED);break;\ndefault:break;\n}\nif(this.#presence){\nconst pres=this.#presence;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)pres.assign(remap[p],pres.get(p)===1);\nfor(let p=liveCount;p<oldFill;p++)pres.clear(p);\n}\nthis.#version++;\n}\nrelease(){\nif(this.#released)return;\nthis.#released=true;\nthis.#buf=null;\nif(this.#bits)this.#bits.release();\nthis.#bits=null;\nif(this.#mv)this.#mv.release();\nthis.#mv=null;\nif(this.#presence)this.#presence.release();\nthis.#presence=null;\nthis.#dict=null;\nthis.#stringRank=null;\nthis.#overlay=new Map();\nthis.#cache=null;\nthis.#capacity=0;\nthis.#version++;\n}\n#alloc(capacity){\nconst cap=Math.max(1,capacity);\nthis.#buf=null;\nthis.#bits=null;\nthis.#mv=null;\nswitch(this.#kind){\ncase'float64':this.#buf=new Float64Array(cap);break;\ncase'int32':this.#buf=new Int32Array(cap);break;\ncase'bitset':this.#bits=new Bitset(cap);break;\ncase'dictionary':\nthis.#buf=new Uint32Array(cap);\nthis.#dict=this.#dict??new Dictionary(this.#seed??[]);\nbreak;\ncase'multi':\nthis.#mv=new MultiValue({rows:cap,values:cap});\nthis.#dict=this.#dict??new Dictionary(this.#seed??[]);\nbreak;\ndefault:this.#buf=new Array(cap);break;\n}\nif(this.#kind!=='dictionary'&&this.#kind!=='multi')this.#dict=null;\nif(this.#nullable){\nif(this.#presence)this.#presence.grow(cap);\nelse this.#presence=new Bitset(cap);\n}\nthis.#capacity=cap;\n}\n#writeValue(p,value){\nconst gone=absent(value);\nif(this.#nullable)this.#presence.assign(p,!gone);\nelse if(gone){\nwarnOnce(`store.null.${this.#id}`,\n`column \"${this.#id}\" is declared non-nullable but received null; storing a filler value`);\n}\nswitch(this.#kind){\ncase'float64':this.#buf[p]=gone?NaN:toFloat(value);break;\ncase'int32':this.#buf[p]=gone?0:toInt(value);break;\ncase'bitset':this.#bits.assign(p,!gone&&!!value);break;\ncase'dictionary':this.#buf[p]=gone?0:this.#dict.codeOf(value);break;\ncase'multi':{\nconst members=toMembers(value);\nconst codes=new Array(members.length);\nfor(let i=0;i<members.length;i++)codes[i]=this.#dict.codeOf(members[i]);\nthis.#mv.write(p,codes);\nbreak;\n}\ndefault:this.#buf[p]=gone?null:value;break;\n}\n}\n#rowValue(p){\nif(this.#overlay.has(p))return this.#overlay.get(p);\nconst v=this.#read(this.#host.rowAt(p));\nreturn v===undefined?null:v;\n}\n#lazy(){\nif(this.#cache&&this.#cache.version===this.#version)return this.#cache;\nconst n=this.#host.physical();\nconst values=new Array(n);\nconst presence=this.#nullable?new Bitset(n):null;\nfor(let p=0;p<n;p++){\nconst v=this.#rowValue(p);\nvalues[p]=v;\nif(presence&&!absent(v))presence.set(p);\n}\nthis.#cache={version:this.#version,values,presence};\nreturn this.#cache;\n}\n}\nclass ColumnStore{\n#schema;\n#handles=new Map();\n#list=[];\n#rows=[];\n#fill=0;\n#capacity=0;\n#live=0;\n#dead=0;\n#tombs=new Bitset(0);\n#columnar=false;\n#retainSource=true;\n#columnarBelow;\n#initial;\n#ratio;\n#destroyed=false;\nconstructor(schema,opts={}){\nthis.#schema=Array.isArray(schema)?schema:[];\nthis.#initial=Math.max(1,opts.initialCapacity??DEFAULT_CAPACITY);\nthis.#retainSource=opts.retainSource!==false;\nthis.#columnarBelow=this.#retainSource?(opts.columnarBelow??DEFAULT_COLUMNAR_BELOW):0;\nthis.#ratio=opts.compactRatio??DEFAULT_COMPACT_RATIO;\nconst host={\nrowAt:(p)=>this.#rows[p],\nphysical:()=>this.#fill,\n};\nfor(const entry of this.#schema){\nif(!entry||!entry.id)continue;\nif(this.#handles.has(entry.id)){\nwarnOnce(`store.dup.${entry.id}`,`duplicate column id \"${entry.id}\" in the store schema; ignoring the second`);\ncontinue;\n}\nconst handle=new ColumnHandle(entry,host);\nthis.#handles.set(entry.id,handle);\nthis.#list.push(handle);\n}\nif(this.#columnarBelow<=0)this.#columnarise();\n}\nget count(){return this.#live;}\nget physical(){return this.#fill;}\nget capacity(){return this.#columnar?this.#capacity:this.#rows.length;}\nget tombstones(){return this.#dead;}\nget columnar(){return this.#columnar;}\nget destroyed(){return this.#destroyed;}\nget bytes(){\nlet total=this.#tombs.bytes+this.#rows.length*8;\nfor(const h of this.#list)total+=h.bytes;\nreturn total;\n}\nappend(objects){\nconst from=this.#fill;\nif(this.#destroyed||!objects)return{from,to:from};\nconst n=objects.length|0;\nif(n===0)return{from,to:from};\nif(this.#retainSource)for(let i=0;i<n;i++)this.#rows[from+i]=objects[i];\nthis.#fill=from+n;\nthis.#live+=n;\nthis.#tombs.grow(this.#fill);\nif(!this.#columnar){\nif(this.#fill>=this.#columnarBelow)this.#columnarise();\nelse for(const h of this.#list)h.touch();\nreturn{from,to:this.#fill};\n}\nthis.#ensure(this.#fill);\nconst cols=this.#list;\nfor(let c=0;c<cols.length;c++)cols[c].appendColumn(objects,from,n);\nreturn{from,to:this.#fill};\n}\nappendPacked(chunk,objects){\nconst from=this.#fill;\nif(this.#destroyed||!chunk)return{from,to:from};\nconst n=chunk.count|0;\nif(n===0)return{from,to:from};\nif(this.#retainSource&&objects){\nfor(let i=0;i<n;i++)this.#rows[from+i]=objects[i];\n}\nthis.#fill=from+n;\nthis.#live+=n;\nthis.#tombs.grow(this.#fill);\nif(!this.#columnar)this.#columnarise();\nthis.#ensure(this.#fill);\nconst byId=new Map();\nfor(const col of chunk.columns)byId.set(col.id,col);\nfor(const h of this.#list){\nconst frag=byId.get(h.id);\nif(frag)h.appendPacked(frag,from,n);\nelse{\nh.grow(this.#capacity);\n}\n}\nreturn{from,to:this.#fill};\n}\nsource(physical){\nif(this.#retainSource)return this.#rows[physical];\nif(physical<0||physical>=this.#fill)return undefined;\nreturn this.#reconstruct(physical);\n}\nsetSource(physical,object){\nif(this.#destroyed)return;\nif(physical<0||physical>=this.#fill)return;\nif(!this.#retainSource)return;\nthis.#rows[physical]=object;\n}\nget(colId,physical){\nconst h=this.#handles.get(colId);\nreturn h?h.get(physical):undefined;\n}\nset(colId,physical,value){\nif(this.#destroyed)return;\nif(physical<0||physical>=this.#fill)return;\nconst h=this.#handles.get(colId);\nif(!h){\nwarnOnce(`store.set.${colId}`,`set() on unknown column \"${colId}\"`);\nreturn;\n}\nh.set(physical,value);\n}\nremove(physical){\nif(this.#destroyed||physical<0||physical>=this.#fill)return false;\nif(this.#tombs.get(physical)===1)return false;\nthis.#tombs.set(physical);\nthis.#dead++;\nthis.#live--;\nreturn true;\n}\nlive(physical){\nif(physical<0||physical>=this.#fill)return false;\nreturn this.#tombs.get(physical)===0;\n}\ncompact(opts={}){\nif(this.#destroyed||this.#dead===0)return null;\nif(!opts.force&&this.#dead/this.#fill<this.#ratio)return null;\nconst oldFill=this.#fill;\nconst remap=new Uint32Array(oldFill);\nlet w=0;\nfor(let p=0;p<oldFill;p++)remap[p]=this.#tombs.get(p)===1?REMOVED:w++;\nfor(const h of this.#list)h.compact(remap,oldFill,w);\nif(this.#retainSource){\nconst rows=this.#rows;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)rows[remap[p]]=rows[p];\nrows.length=w;\n}\nthis.#fill=w;\nthis.#live=w;\nthis.#dead=0;\nthis.#tombs=new Bitset(Math.max(this.#capacity,w));\nreturn remap;\n}\ncolumn(colId){return this.#handles.get(colId);}\ncolumns(){return this.#list.slice();}\nliveIndices(){\nconst out=new Uint32Array(this.#live);\nif(this.#dead===0){\nfor(let p=0;p<this.#fill;p++)out[p]=p;\nreturn out;\n}\nlet k=0;\nfor(let p=0;p<this.#fill;p++)if(this.#tombs.get(p)===0)out[k++]=p;\nreturn out;\n}\nconvert(colId,kind){\nconst h=this.#handles.get(colId);\nreturn h?h.convert(kind):false;\n}\ndestroy(){\nif(this.#destroyed)return;\nthis.#destroyed=true;\nfor(const h of this.#list)h.release();\nthis.#handles.clear();\nthis.#list.length=0;\nthis.#rows.length=0;\nthis.#tombs.release();\nthis.#fill=0;\nthis.#live=0;\nthis.#dead=0;\nthis.#capacity=0;\n}\n#ensure(n){\nif(n<=this.#capacity)return;\nlet cap=this.#capacity||this.#initial;\nwhile(cap<n)cap*=2;\nfor(const h of this.#list)h.grow(cap);\nthis.#tombs.grow(cap);\nthis.#capacity=cap;\n}\n#reconstruct(physical){\nconst out={};\nfor(const h of this.#list)out[h.id]=h.get(physical);\nreturn out;\n}\n#columnarise(){\nif(this.#columnar)return;\nlet cap=this.#initial;\nwhile(cap<this.#fill)cap*=2;\nthis.#columnar=true;\nthis.#capacity=cap;\nthis.#tombs.grow(cap);\nfor(const h of this.#list)h.columnarise(cap,this.#fill);\n}\n}\n});\n__def(\"packages/core/src/store/ingest.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"INGEST_DEFAULTS\",{enumerable:true,get:function(){return INGEST_DEFAULTS;}});\nObject.defineProperty(__exports,\"inferKind\",{enumerable:true,get:function(){return inferKind;}});\nObject.defineProperty(__exports,\"decideText\",{enumerable:true,get:function(){return decideText;}});\nObject.defineProperty(__exports,\"createReaders\",{enumerable:true,get:function(){return createReaders;}});\nObject.defineProperty(__exports,\"Ingest\",{enumerable:true,get:function(){return Ingest;}});\nObject.defineProperty(__exports,\"ingest\",{enumerable:true,get:function(){return ingest;}});\nObject.defineProperty(__exports,\"ingestSync\",{enumerable:true,get:function(){return ingestSync;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst now=__m0[\"now\"];\nconst nextFrame=__m0[\"nextFrame\"];\nconst infoOnce=__m0[\"infoOnce\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst isFunction=__m0[\"isFunction\"];\nconst pathGetter=__m0[\"pathGetter\"];\nconst __m1=__req(\"packages/core/src/store/columnstore.js\");\nconst ColumnStore=__m1[\"ColumnStore\"];\nconst INGEST_DEFAULTS=Object.freeze({\nchunkMs:8,\nchunkRows:512,\nsampleSize:100,\ndictionaryRatio:0.1,\ncolumnarBelow:5000,\ninitialCapacity:1024,\n});\nfunction inferKind(samples,hints={}){\nif(hints.multi)return'multi';\nif(samples.length===0)return'object';\nlet numbers=0;let booleans=0;let strings=0;let dates=0;let arrays=0;\nfor(let i=0;i<samples.length;i++){\nconst v=samples[i];\nif(typeof v==='number')numbers++;\nelse if(typeof v==='boolean')booleans++;\nelse if(typeof v==='string')strings++;\nelse if(v instanceof Date)dates++;\nelse if(Array.isArray(v))arrays++;\n}\nconst n=samples.length;\nif(numbers===n)return'float64';\nif(booleans===n)return'bitset';\nif(dates===n)return'float64';\nif(strings===n)return'text';\nif(arrays===n)return'multi';\nreturn'object';\n}\nfunction decideText(distinct,rows,ratio){\nif(rows<=0)return'dictionary';\nreturn distinct<ratio*rows?'dictionary':'object';\n}\nfunction createReaders(columns,computed,context){\nconst readers=new Map();\nconst base=new Map();\nfor(const col of columns){\nif(col.computed)continue;\nconst read=isFunction(col.read)?col.read:pathGetter(col.field||col.id);\nbase.set(col.id,read);\nreaders.set(col.id,read);\n}\nconst order=computed?.order??[];\nconst fns=computed?.fns??{};\nconst deps=computed?.deps??{};\nconst wrapDeps=computed?.wrapDeps??null;\nconst active=order.filter((id)=>isFunction(fns[id]));\nconst wildcard=active.some((id)=>deps[id]==='*');\nlet memo=new WeakMap();\nconst resolve=(data)=>{\nconst values={};\nif(wildcard)for(const[id,read]of base)values[id]=read(data);\nfor(const id of active){\nconst declared=deps[id];\nlet bag;\nif(declared==='*'){\nbag=values;\n}else{\nbag={};\nconst list=declared||[];\nfor(let i=0;i<list.length;i++){\nconst d=list[i];\nbag[d]=d in values?values[d]:base.get(d)?.(data);\n}\n}\nvalues[id]=fns[id](wrapDeps?wrapDeps(bag,id):bag,{\ndata,row:null,column:null,grid:null,context,\n});\n}\nreturn values;\n};\nconst valuesFor=(data)=>{\nif(data===null||(typeof data!=='object'&&typeof data!=='function'))return resolve(data);\nlet v=memo.get(data);\nif(v===undefined){v=resolve(data);memo.set(data,v);}\nreturn v;\n};\nfor(const id of active){\nreaders.set(id,\n(data)=>valuesFor(data)[id]);\n}\nreturn{\nreaders,\nreset(){memo=new WeakMap();},\n};\n}\nclass ColumnPlan{\nspec;\nread;\nkind;\ninferred;\nnullable;\ncandidate=false;\ndistinct=null;\nchange=null;\nreason='';\nconstructor(spec,read){\nthis.spec=spec;\nthis.read=read;\nthis.kind='object';\nthis.inferred=false;\nthis.nullable=spec.nullable!==false;\n}\n}\nclass Ingest{\n#rows;\n#plans=[];\n#store=null;\n#readers;\n#cursor=0;\n#opts;\n#done=false;\n#cancelled=false;\n#elapsed=0;\n#columnar;\nconstructor(rows,plan={},opts={}){\nthis.#rows=Array.isArray(rows)?rows:Array.from(rows||[]);\nthis.#opts={...INGEST_DEFAULTS,...opts};\nconst columns=plan.columns??[];\nthis.#readers=createReaders(columns,plan.computed??null,plan.context);\nthis.#columnar=this.#rows.length>=this.#opts.columnarBelow;\nthis.#planColumns(columns,plan.computed??null);\nthis.#store=new ColumnStore(this.#plans.map((p)=>({\nid:p.spec.id,\nkind:p.kind,\nnullable:p.nullable,\nread:p.read,\ndictionary:p.spec.dictionary,\n})),{\ninitialCapacity:this.#opts.initialCapacity,\ncolumnarBelow:this.#opts.columnarBelow,\n});\n}\nget store(){return this.#store;}\nget done(){return this.#done||this.#cancelled;}\nget progress(){return this.#cursor;}\nslice(){\nif(this.done)return false;\nif(this.#opts.signal?.aborted){this.#cancelled=true;return false;}\nconst started=now();\nconst{chunkMs,chunkRows}=this.#opts;\nconst total=this.#rows.length;\ndo{\nconst end=Math.min(this.#cursor+chunkRows,total);\nthis.#store.append(this.#rows.slice(this.#cursor,end));\nthis.#measure(this.#cursor,end);\nthis.#cursor=end;\nthis.#readers.reset();\nthis.#reviewCardinality(false);\n}while(this.#cursor<total&&now()-started<chunkMs);\nthis.#elapsed+=now()-started;\nthis.#opts.onProgress?.({loaded:this.#cursor,total});\nif(this.#cursor>=total){\nthis.#reviewCardinality(true);\nthis.#done=true;\nreturn false;\n}\nreturn true;\n}\ncancel(){this.#cancelled=true;}\nresult(){\nreturn{\nstore:this.#store,\nschema:this.#plans.map((p)=>({\nid:p.spec.id,kind:p.kind,nullable:p.nullable,read:p.read,\ndictionary:p.spec.dictionary,\n})),\ndecisions:this.#plans.map((p)=>({\nid:p.spec.id,\nkind:p.kind,\nnullable:p.nullable,\ninferred:p.inferred,\ndistinct:p.candidate||p.change?this.#distinctOf(p):null,\nchange:p.change,\nreason:p.reason,\n})),\ncount:this.#store.count,\nelapsed:this.#elapsed,\ncancelled:this.#cancelled,\n};\n}\n#planColumns(columns,computed){\nconst rows=this.#rows;\nconst sampleN=Math.min(this.#opts.sampleSize,rows.length);\nconst ratio=this.#opts.dictionaryRatio;\nconst pure=computed?.pure instanceof Set\n?computed.pure\n:new Set(computed?.pure??computed?.order??[]);\nfor(const spec of columns){\nif(!spec||!spec.id)continue;\nif(spec.computed&&(spec.pure===false||(computed&&!pure.has(spec.id)))){\nwarnOnce(`ingest.impure.${spec.id}`,\n`column \"${spec.id}\" is an impure computed column and is not materialised into the store`);\ncontinue;\n}\nconst read=this.#readers.readers.get(spec.id)\n??(isFunction(spec.read)?spec.read:pathGetter(spec.field||spec.id));\nconst plan=new ColumnPlan(spec,read);\nif(spec.kind){\nplan.kind=spec.kind;\nplan.reason='declared by the caller';\n}else if(spec.dictionary){\nplan.kind=spec.multi?'multi':'dictionary';\nplan.reason='value table supplied (lookup column)';\n}else{\nconst samples=[];\nfor(let i=0;i<sampleN&&samples.length<this.#opts.sampleSize;i++){\nconst v=read(rows[i]);\nif(v!==null&&v!==undefined)samples.push(v);\n}\nplan.inferred=true;\nconst kind=inferKind(samples,{multi:spec.multi});\nif(kind==='text'){\nconst distinct=new Set(samples).size;\nplan.kind=decideText(distinct,samples.length,ratio);\nplan.candidate=this.#columnar;\nplan.reason=`sampled ${distinct} distinct in ${samples.length}`;\n}else{\nplan.kind=kind;\nplan.reason=`inferred from ${samples.length} sampled values`;\nif(kind==='object'&&samples.length){\ninfoOnce(`ingest.mixed.${spec.id}`,\n`column \"${spec.id}\" holds mixed or unrecognised value types; storing as an object array. Declare a type to avoid this.`);\n}\n}\nif(plan.kind==='object'&&plan.candidate)plan.distinct=new Set(samples);\n}\nthis.#plans.push(plan);\n}\n}\n#measure(from,to){\nconst rows=this.#rows;\nfor(const plan of this.#plans){\nif(!plan.candidate||!plan.distinct)continue;\nconst set=plan.distinct;\nfor(let i=from;i<to;i++){\nconst v=plan.read(rows[i]);\nif(v!==null&&v!==undefined)set.add(v);\n}\n}\n}\n#distinctOf(plan){\nif(plan.distinct)return plan.distinct.size;\nconst handle=this.#store.column(plan.spec.id);\nreturn handle?.dict?handle.dict.size:0;\n}\n#reviewCardinality(final){\nconst ratio=this.#opts.dictionaryRatio;\nconst total=this.#rows.length;\nfor(const plan of this.#plans){\nif(!plan.candidate)continue;\nconst distinct=this.#distinctOf(plan);\nif(plan.kind==='dictionary'&&distinct>=ratio*total){\nconst handle=this.#store.column(plan.spec.id);\nplan.distinct=new Set(handle?.dict?handle.dict.values():[]);\nthis.#store.convert(plan.spec.id,'object');\nplan.kind='object';\nplan.change='demoted';\nplan.reason=`${distinct} distinct values is at or above ${ratio*100}% of ${total} rows`;\ncontinue;\n}\nif(plan.kind==='object'&&distinct>=ratio*total){\nplan.candidate=false;\nplan.distinct=null;\nplan.reason=`${distinct} distinct values is at or above ${ratio*100}% of ${total} rows`;\ncontinue;\n}\nif(final&&plan.kind==='object'&&distinct<ratio*total){\nthis.#store.convert(plan.spec.id,'dictionary');\nplan.kind='dictionary';\nplan.change=plan.change==='demoted'?null:'promoted';\nplan.reason=`${distinct} distinct values is below ${ratio*100}% of ${total} rows`;\nplan.distinct=null;\n}\nif(final)plan.candidate=false;\n}\n}\n}\nasync function ingest(rows,plan={},opts={}){\nconst run=new Ingest(rows,plan,opts);\nconst frame=opts.scheduler?.frame??nextFrame;\nwhile(run.slice()){\nawait new Promise((resolve)=>{frame(resolve);});\n}\nreturn run.result();\n}\nfunction ingestSync(rows,plan={},opts={}){\nconst run=new Ingest(rows,plan,{...opts,chunkMs:Infinity});\nwhile(run.slice());\nreturn run.result();\n}\n});\n__def(\"packages/core/src/store/columnpack.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"isPortableSchema\",{enumerable:true,get:function(){return isPortableSchema;}});\nObject.defineProperty(__exports,\"packChunk\",{enumerable:true,get:function(){return packChunk;}});\nObject.defineProperty(__exports,\"packedTransfers\",{enumerable:true,get:function(){return packedTransfers;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst pathGetter=__m0[\"pathGetter\"];\nconst __m1=__req(\"packages/core/src/store/ingest.js\");\nconst inferKind=__m1[\"inferKind\"];\nconst decideText=__m1[\"decideText\"];\nconst INGEST_DEFAULTS=__m1[\"INGEST_DEFAULTS\"];\nconst __m2=__req(\"packages/core/src/store/columnstore.js\");\nconst toFloat=__m2[\"toFloat\"];\nconst PORTABLE_KINDS=new Set(['float64','int32','bitset','dictionary','object','multi']);\nfunction isPortableSchema(schema){\nif(!Array.isArray(schema)||schema.length===0)return false;\nfor(const col of schema){\nif(!col||typeof col.id!=='string')return false;\nif(typeof col.field!=='string'||col.field==='')return false;\nif(col.kind&&!PORTABLE_KINDS.has(col.kind))return false;\n}\nreturn true;\n}\nfunction toInt(v){\nconst n=toFloat(v);\nreturn Number.isFinite(n)?n|0:0;\n}\nfunction toMembers(v){\nif(v===null||v===undefined)return[];\nreturn Array.isArray(v)?v:[v];\n}\nfunction resolveKind(col,values,rows,ratio){\nif(col.kind)return col.kind;\nconst samples=[];\nfor(let i=0;i<values.length&&samples.length<INGEST_DEFAULTS.sampleSize;i++){\nconst v=values[i];\nif(v!==null&&v!==undefined)samples.push(v);\n}\nconst kind=inferKind(samples,{multi:col.multi});\nif(kind!=='text')return kind;\nconst distinct=new Set(samples).size;\nreturn decideText(distinct,samples.length,ratio);\n}\nfunction packChunk(schema,rows,opts={}){\nconst n=rows.length|0;\nconst ratio=opts.dictionaryRatio??INGEST_DEFAULTS.dictionaryRatio;\nconst columns=[];\nfor(const col of schema){\nconst read=pathGetter(col.field||col.id);\nconst nullable=col.nullable!==false;\nconst raw=new Array(n);\nfor(let i=0;i<n;i++){\nconst v=read(rows[i]);\nraw[i]=v===undefined?null:v;\n}\nconst kind=resolveKind(col,raw,n,ratio);\nconst presence=nullable?new Uint8Array((n+7)>>3):null;\nconst present=(i)=>{if(presence)presence[i>>3]|=1<<(i&7);};\nlet packed;\nswitch(kind){\ncase'float64':{\nconst values=new Float64Array(n);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nconst gone=v===null;\nif(!gone)present(i);\nvalues[i]=gone?NaN:toFloat(v);\n}\npacked={id:col.id,kind,nullable,values,presence,offsets:null,table:null};\nbreak;\n}\ncase'int32':{\nconst values=new Int32Array(n);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nconst gone=v===null;\nif(!gone)present(i);\nvalues[i]=gone?0:toInt(v);\n}\npacked={id:col.id,kind,nullable,values,presence,offsets:null,table:null};\nbreak;\n}\ncase'bitset':{\nconst words=new Uint8Array((n+7)>>3);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nconst gone=v===null;\nif(!gone)present(i);\nif(!gone&&!!v)words[i>>3]|=1<<(i&7);\n}\npacked={id:col.id,kind,nullable,values:words,presence,offsets:null,table:null};\nbreak;\n}\ncase'dictionary':{\nconst codes=new Uint32Array(n);\nconst table=[];\nconst index=new Map();\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nif(v===null){codes[i]=0;continue;}\npresent(i);\nlet code=index.get(v);\nif(code===undefined){code=table.length;table.push(v);index.set(v,code);}\ncodes[i]=code;\n}\npacked={id:col.id,kind,nullable,values:codes,presence,offsets:null,table};\nbreak;\n}\ncase'multi':{\nconst table=[];\nconst index=new Map();\nconst offsets=new Uint32Array(n+1);\nconst flat=[];\nfor(let i=0;i<n;i++){\nconst v=raw[i];\noffsets[i]=flat.length;\nconst gone=v===null;\nif(!gone)present(i);\nconst members=toMembers(v);\nfor(let k=0;k<members.length;k++){\nconst m=members[k];\nlet code=index.get(m);\nif(code===undefined){code=table.length;table.push(m);index.set(m,code);}\nflat.push(code);\n}\n}\noffsets[n]=flat.length;\npacked={id:col.id,kind,nullable,values:Int32Array.from(flat),presence,offsets,table};\nbreak;\n}\ndefault:{\nconst values=new Array(n);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nif(v!==null)present(i);\nvalues[i]=v;\n}\npacked={id:col.id,kind:'object',nullable,values,presence,offsets:null,table:null};\nbreak;\n}\n}\ncolumns.push(packed);\n}\nreturn{count:n,columns};\n}\nfunction packedTransfers(chunk){\nconst out=[];\nif(!chunk||!Array.isArray(chunk.columns))return out;\nconst add=(v)=>{\nif(ArrayBuffer.isView(v)&&v.buffer&&!out.includes(v.buffer))out.push(v.buffer);\n};\nfor(const col of chunk.columns){\nadd(col.values);\nadd(col.presence);\nadd(col.offsets);\n}\nreturn out;\n}\n});\n__def(\"packages/core/src/compute/sortspec.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"collationDescriptor\",{enumerable:true,get:function(){return collationDescriptor;}});\nObject.defineProperty(__exports,\"isPortableSort\",{enumerable:true,get:function(){return isPortableSort;}});\nObject.defineProperty(__exports,\"isPortableSortSet\",{enumerable:true,get:function(){return isPortableSortSet;}});\nObject.defineProperty(__exports,\"describeSortEntry\",{enumerable:true,get:function(){return describeSortEntry;}});\nObject.defineProperty(__exports,\"describeSort\",{enumerable:true,get:function(){return describeSort;}});\nfunction collationDescriptor(locale){\nreturn{locale:locale===undefined?undefined:String(locale),numeric:true,sensitivity:'variant'};\n}\nfunction isPortableSort(entry){\nreturn!!entry&&typeof entry.compare!=='function';\n}\nfunction isPortableSortSet(entries){\nif(!entries)return true;\nfor(let i=0;i<entries.length;i++)if(!isPortableSort(entries[i]))return false;\nreturn true;\n}\nfunction describeSortEntry(entry,locale){\nconst col=entry.col!==undefined?entry.col:(entry.handle&&entry.handle.id);\nconst chosen=entry.locale!==undefined?entry.locale:locale;\nreturn{\ncol,\ndescending:entry.descending!==undefined?!!entry.descending:entry.dir==='desc',\nnullsFirst:!!entry.nullsFirst,\ncollation:collationDescriptor(chosen),\n};\n}\nfunction describeSort(entries,locale){\nconst list=entries||[];\nconst out=new Array(list.length);\nfor(let i=0;i<list.length;i++)out[i]=describeSortEntry(list[i],locale);\nreturn out;\n}\n});\n__def(\"packages/core/src/format/date.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"scanPattern\",{enumerable:true,get:function(){return scanPattern;}});\nObject.defineProperty(__exports,\"toDate\",{enumerable:true,get:function(){return toDate;}});\nObject.defineProperty(__exports,\"compilePattern\",{enumerable:true,get:function(){return compilePattern;}});\nObject.defineProperty(__exports,\"compileDate\",{enumerable:true,get:function(){return compileDate;}});\nObject.defineProperty(__exports,\"toIsoDate\",{enumerable:true,get:function(){return toIsoDate;}});\nObject.defineProperty(__exports,\"toIsoDateTime\",{enumerable:true,get:function(){return toIsoDateTime;}});\nObject.defineProperty(__exports,\"compareIso\",{enumerable:true,get:function(){return compareIso;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst isNil=__m0[\"isNil\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst TOKENS=[\n'yyyy','yy','MMMM','MMM','MM','M','dd','d',\n'EEEE','EEE','HH','H','hh','h','mm','m','ss','s','SSS','a',\n];\nfunction scanPattern(pattern){\nconst out=[];\nlet i=0;\nlet literal='';\nconst flush=()=>{if(literal){out.push({token:null,text:literal});literal='';}};\nwhile(i<pattern.length){\nconst ch=pattern[i];\nif(ch===\"'\"){\nif(pattern[i+1]===\"'\"){literal+=\"'\";i+=2;continue;}\nconst end=pattern.indexOf(\"'\",i+1);\nif(end===-1){literal+=pattern.slice(i+1);i=pattern.length;continue;}\nliteral+=pattern.slice(i+1,end);\ni=end+1;\ncontinue;\n}\nconst token=TOKENS.find((t)=>pattern.startsWith(t,i));\nif(token){flush();out.push({token,text:token});i+=token.length;continue;}\nif(/[A-Za-z]/.test(ch)){\nwarnOnce(\n`date.pattern.token:${ch}`,\n`the date pattern \"${pattern}\" contains '${ch}', which is not a supported token, `\n+'so it is rendered as text. Quote it as a literal to silence this. '\n+`Supported: ${TOKENS.join(' ')}.`,\n);\n}\nliteral+=ch;\ni+=1;\n}\nflush();\nreturn out;\n}\nconst WALL_CLOCK=/^(\\d{4})-(\\d{2})-(\\d{2})(?:[T ](\\d{2}):(\\d{2})(?::(\\d{2}))?(?:\\.\\d+)?)?$/;\nfunction toDate(value){\nif(isNil(value)||value==='')return null;\nif(value instanceof Date)return Number.isNaN(value.getTime())?null:value;\nif(typeof value==='number')return Number.isNaN(value)?null:new Date(value);\nif(typeof value==='string'){\nconst wall=WALL_CLOCK.exec(value.trim());\nif(wall){\nconst[,y,mo,d,h='0',mi='0',sec='0']=wall;\nreturn new Date(+y,+mo-1,+d,+h,+mi,+sec);\n}\nconst d=new Date(value);\nreturn Number.isNaN(d.getTime())?null:d;\n}\nreturn null;\n}\nfunction pad(n,w){return String(n).padStart(w,'0');}\nfunction fieldReader(timeZone){\nif(!timeZone){\nreturn(d)=>({\nyear:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),\nhour:d.getHours(),minute:d.getMinutes(),second:d.getSeconds(),\nms:d.getMilliseconds(),weekday:d.getDay(),\n});\n}\nconst zoned=new Intl.DateTimeFormat('en-US',{\ntimeZone,year:'numeric',month:'2-digit',day:'2-digit',\nhour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,weekday:'short',\n});\nconst days={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};\nreturn(d)=>{\nconst f={year:0,month:1,day:1,hour:0,minute:0,second:0,ms:d.getMilliseconds(),weekday:0};\nfor(const part of zoned.formatToParts(d)){\nswitch(part.type){\ncase'year':f.year=Number(part.value);break;\ncase'month':f.month=Number(part.value);break;\ncase'day':f.day=Number(part.value);break;\ncase'hour':f.hour=Number(part.value)%24;break;\ncase'minute':f.minute=Number(part.value);break;\ncase'second':f.second=Number(part.value);break;\ncase'weekday':f.weekday=days[part.value]??0;break;\ndefault:break;\n}\n}\nreturn f;\n};\n}\nfunction compilePattern(pattern,locale,timeZone){\nconst segments=scanPattern(pattern);\nconst read=fieldReader(timeZone);\nconst used=new Set(segments.filter((s)=>s.token).map((s)=>s.token));\nconst monthShort=used.has('MMM')?new Intl.DateTimeFormat(locale,{month:'short',timeZone}):null;\nconst monthLong=used.has('MMMM')?new Intl.DateTimeFormat(locale,{month:'long',timeZone}):null;\nconst dayShort=used.has('EEE')?new Intl.DateTimeFormat(locale,{weekday:'short',timeZone}):null;\nconst dayLong=used.has('EEEE')?new Intl.DateTimeFormat(locale,{weekday:'long',timeZone}):null;\nreturn(d)=>{\nconst f=read(d);\nlet out='';\nfor(const seg of segments){\nif(!seg.token){out+=seg.text;continue;}\nswitch(seg.token){\ncase'yyyy':out+=pad(f.year,4);break;\ncase'yy':out+=pad(f.year%100,2);break;\ncase'MMMM':out+=monthLong.format(d);break;\ncase'MMM':out+=monthShort.format(d);break;\ncase'MM':out+=pad(f.month,2);break;\ncase'M':out+=String(f.month);break;\ncase'dd':out+=pad(f.day,2);break;\ncase'd':out+=String(f.day);break;\ncase'EEEE':out+=dayLong.format(d);break;\ncase'EEE':out+=dayShort.format(d);break;\ncase'HH':out+=pad(f.hour,2);break;\ncase'H':out+=String(f.hour);break;\ncase'hh':out+=pad(f.hour%12===0?12:f.hour%12,2);break;\ncase'h':out+=String(f.hour%12===0?12:f.hour%12);break;\ncase'mm':out+=pad(f.minute,2);break;\ncase'm':out+=String(f.minute);break;\ncase'ss':out+=pad(f.second,2);break;\ncase's':out+=String(f.second);break;\ncase'SSS':out+=pad(f.ms,3);break;\ncase'a':out+=f.hour<12?'AM':'PM';break;\ndefault:out+=seg.text;break;\n}\n}\nreturn out;\n};\n}\nconst UNITS=[\n['year',365*24*3600e3],\n['month',30*24*3600e3],\n['week',7*24*3600e3],\n['day',24*3600e3],\n['hour',3600e3],\n['minute',60e3],\n['second',1e3],\n];\nfunction compileDate(spec,locale){\nconst s=spec||{};\nconst loc=s.locale||locale||undefined;\nconst nullDisplay=s.nullDisplay??'';\nconst timeZone=s.timeZone;\nlet absolute;\nif(s.pattern){\nabsolute=compilePattern(s.pattern,loc,timeZone);\n}else if(s.dateStyle||s.timeStyle){\nconst opts={timeZone};\nif(s.dateStyle)opts.dateStyle=s.dateStyle;\nif(s.timeStyle)opts.timeStyle=s.timeStyle;\nconst dtf=new Intl.DateTimeFormat(loc,opts);\nabsolute=(d)=>dtf.format(d);\n}else{\nconst dtf=new Intl.DateTimeFormat(loc,{dateStyle:'medium',timeZone});\nabsolute=(d)=>dtf.format(d);\n}\nconst relative=s.relative?new Intl.RelativeTimeFormat(loc,{numeric:'auto'}):null;\nconst thresholdDays=typeof s.relative==='object'&&s.relative\n?(s.relative.threshold??7)\n:7;\nconst thresholdMs=thresholdDays*24*3600e3;\nconst format=(value,params)=>{\nconst d=toDate(value);\nif(!d)return nullDisplay;\nif(relative){\nconst now=params&&typeof params.now==='number'?params.now:Date.now();\nconst delta=d.getTime()-now;\nif(Math.abs(delta)<thresholdMs){\nfor(const[unit,ms]of UNITS){\nif(Math.abs(delta)>=ms||unit==='second'){\nreturn relative.format(Math.round(delta/ms),unit);\n}\n}\n}\n}\nreturn absolute(d);\n};\nformat.spec=s;\nreturn format;\n}\nfunction toIsoDate(value){\nif(isNil(value)||value==='')return null;\nif(typeof value==='string'){\nconst match=/^(\\d{4}-\\d{2}-\\d{2})/.exec(value.trim());\nif(match)return match[1];\nconst parsed=toDate(value);\nreturn parsed?toIsoDate(parsed):null;\n}\nconst date=toDate(value);\nif(!date)return null;\nconst pad=(n)=>String(n).padStart(2,'0');\nreturn`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;\n}\nfunction toIsoDateTime(value,timeZone){\nif(isNil(value)||value==='')return null;\nif(typeof value==='string'){\nconst text=value.trim();\nif(ZONE_SUFFIX.test(text)){\nconst instant=toDate(text);\nreturn instant?wallClockIn(instant,timeZone):null;\n}\nconst match=/^(\\d{4}-\\d{2}-\\d{2})[T ](\\d{2}):(\\d{2})(?::(\\d{2}))?/.exec(text);\nif(match){\nconst[,day,hour,minute,second]=match;\nreturn`${day}T${hour}:${minute}${second&&second!=='00'?`:${second}`:''}`;\n}\nif(/^\\d{4}-\\d{2}-\\d{2}$/.test(text))return`${text}T00:00`;\nconst parsed=toDate(text);\nreturn parsed?toIsoDateTime(parsed):null;\n}\nconst date=toDate(value);\nif(!date)return null;\nreturn wallClockIn(date,timeZone);\n}\nconst ZONE_SUFFIX=/(?:Z|[+-]\\d{2}:?\\d{2})$/i;\nfunction wallClockIn(date,timeZone){\nconst pad=(n)=>String(n).padStart(2,'0');\nif(timeZone){\ntry{\nconst parts=new Intl.DateTimeFormat('en-CA',{\ntimeZone,\nyear:'numeric',month:'2-digit',day:'2-digit',\nhour:'2-digit',minute:'2-digit',second:'2-digit',\nhour12:false,\n}).formatToParts(date).reduce((out,part)=>{\nif(part.type!=='literal')out[part.type]=part.value;\nreturn out;\n},{});\nconst hour=parts.hour==='24'?'00':parts.hour;\nconst seconds=Number(parts.second);\nreturn`${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`\n+(seconds?`:${parts.second}`:'');\n}catch{\n}\n}\nconst day=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;\nconst seconds=date.getSeconds();\nconst clock=`${pad(date.getHours())}:${pad(date.getMinutes())}${seconds?`:${pad(seconds)}`:''}`;\nreturn`${day}T${clock}`;\n}\nfunction compareIso(a,b){\nconst left=isNil(a)||a===''?null:String(a);\nconst right=isNil(b)||b===''?null:String(b);\nif(left===null)return right===null?0:1;\nif(right===null)return-1;\nreturn left<right?-1:left>right?1:0;\n}\n});\n__def(\"packages/core/src/compute/filter.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"releaseMask\",{enumerable:true,get:function(){return releaseMask;}});\nObject.defineProperty(__exports,\"compilePredicate\",{enumerable:true,get:function(){return compilePredicate;}});\nObject.defineProperty(__exports,\"testValue\",{enumerable:true,get:function(){return testValue;}});\nObject.defineProperty(__exports,\"evaluateCondition\",{enumerable:true,get:function(){return evaluateCondition;}});\nObject.defineProperty(__exports,\"evaluateFilters\",{enumerable:true,get:function(){return evaluateFilters;}});\nObject.defineProperty(__exports,\"pruneColumn\",{enumerable:true,get:function(){return pruneColumn;}});\nObject.defineProperty(__exports,\"mentionsColumn\",{enumerable:true,get:function(){return mentionsColumn;}});\nObject.defineProperty(__exports,\"compact\",{enumerable:true,get:function(){return compact;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst isBlank=__m0[\"isBlank\"];\nconst toArray=__m0[\"toArray\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst __m1=__req(\"packages/core/src/format/date.js\");\nconst toIsoDate=__m1[\"toIsoDate\"];\nconst __m2=__req(\"packages/core/src/compute/handle.js\");\nconst bitReader=__m2[\"bitReader\"];\nconst dictSize=__m2[\"dictSize\"];\nconst dictValue=__m2[\"dictValue\"];\nconst presenceReader=__m2[\"presenceReader\"];\nconst valueComparator=__m2[\"valueComparator\"];\nconst valueReader=__m2[\"valueReader\"];\nconst ISO_DAY=/^\\d{4}-\\d{2}-\\d{2}$/;\nconst NULL_KEY='\\u0000null\\u0000';\nfunction acquireMask(ctx,n){\nconst pool=ctx&&ctx.pool;\nif(pool){\nconst take=pool.mask||pool.acquireMask||pool.acquire||pool.take;\nif(typeof take==='function'){\nconst mask=take.call(pool,n);\nif(mask&&mask.length>=n)return mask;\n}\n}\nreturn new Uint8Array(n);\n}\nfunction releaseMask(ctx,mask){\nconst pool=ctx&&ctx.pool;\nif(!pool||!mask)return;\nconst give=pool.release||pool.releaseMask||pool.free||pool.recycle;\nif(typeof give==='function')give.call(pool,mask);\n}\nfunction fillMask(mask,n,value){\nmask.fill(value,0,n);\nreturn mask;\n}\nfunction unorderable(v){\nreturn v===null||v===undefined||(typeof v==='number'&&Number.isNaN(v));\n}\nfunction coerceTarget(value,type){\nif(value===null||value===undefined)return value;\nif(type==='number')return typeof value==='number'?value:Number(value);\nif(type==='date'||type==='dateString'){\nconst iso=toIsoDate(value);\nreturn iso===null?toMillis(value):iso;\n}\nif(type==='boolean'){\nif(typeof value==='boolean')return value;\nif(value==='true'||value===1)return true;\nif(value==='false'||value===0)return false;\nreturn!!value;\n}\nreturn value;\n}\nfunction toMillis(value){\nif(value instanceof Date)return value.getTime();\nif(typeof value==='number')return value;\nreturn Date.parse(String(value));\n}\nfunction toNumber(value){\nif(typeof value==='number')return value;\nif(value instanceof Date)return value.getTime();\nif(value===null||value===undefined||value==='')return NaN;\nreturn Number(value);\n}\nfunction textOf(v,caseSensitive){\nconst s=typeof v==='string'?v:String(v);\nreturn caseSensitive?s:s.toLowerCase();\n}\nfunction setKey(v,caseSensitive){\nif(v===null||v===undefined)return NULL_KEY;\nif(typeof v==='string')return caseSensitive?v:v.toLowerCase();\nif(v instanceof Date)return v.getTime();\nreturn v;\n}\nfunction buildSet(value,caseSensitive,type){\nconst set=new Set();\nfor(const raw of toArray(value)){\nconst entry=coerceTarget(raw,type);\nset.add(setKey(entry,caseSensitive));\nif(typeof entry==='string'&&entry!==''&&Number.isFinite(Number(entry)))set.add(Number(entry));\nelse if(typeof entry==='number'&&Number.isFinite(entry))set.add(setKey(String(entry),caseSensitive));\n}\nreturn set;\n}\nfunction valueEquals(a,b,caseSensitive){\nif(a===null||a===undefined||b===null||b===undefined){\nreturn(a===null||a===undefined)&&(b===null||b===undefined);\n}\nconst ta=typeof a;\nconst tb=typeof b;\nif(ta==='string'&&tb==='string')return caseSensitive?a===b:a.toLowerCase()===b.toLowerCase();\nif(a instanceof Date||b instanceof Date)return toMillis(a)===toMillis(b);\nif(ta==='number'&&tb==='number')return a===b||(Number.isNaN(a)&&Number.isNaN(b));\nif(ta==='number'&&tb==='string')return a===Number(b);\nif(ta==='string'&&tb==='number')return Number(a)===b;\nif(ta==='boolean'||tb==='boolean')return a===b;\nif(Array.isArray(a)&&Array.isArray(b)){\nreturn a.length===b.length&&a.every((x,i)=>valueEquals(x,b[i],caseSensitive));\n}\nreturn a===b;\n}\nfunction compileRegExp(value,caseSensitive){\ntry{\nif(value instanceof RegExp){\nconst flags=value.flags.replace(/[gy]/g,'');\nreturn new RegExp(value.source,caseSensitive?flags:flags.includes('i')?flags:`${flags}i`);\n}\nreturn new RegExp(String(value),caseSensitive?'':'i');\n}catch(err){\nwarnOnce(`regex:${String(value)}`,`filter operator \"matches\" received an invalid pattern: ${String(value)}`,err);\nreturn null;\n}\n}\nfunction compilePredicate(condition,locale){\nconst predicate=compileValuePredicate(condition,locale);\nconst type=condition&&condition.type;\nif(type!=='date'&&type!=='dateString')return predicate;\nreturn(v)=>predicate(typeof v==='string'&&ISO_DAY.test(v)?v:(toIsoDate(v)??v));\n}\nfunction compileValuePredicate(condition,locale){\nconst op=condition&&condition.op;\nconst caseSensitive=!!(condition&&condition.caseSensitive);\nconst type=condition&&condition.type;\nconst cmp=valueComparator(locale);\nconst not=(p)=>(v)=>!p(v);\nswitch(op){\ncase'eq':{\nconst target=coerceTarget(condition.value,type);\nreturn(v)=>valueEquals(v,target,caseSensitive);\n}\ncase'ne':{\nconst target=coerceTarget(condition.value,type);\nreturn(v)=>!valueEquals(v,target,caseSensitive);\n}\ncase'lt':case'lte':case'gt':case'gte':{\nconst target=coerceTarget(condition.value,type);\nif(unorderable(target))return()=>false;\nconst want=op==='lt'?-1:op==='lte'?0:op==='gt'?1:2;\nreturn(v)=>{\nif(unorderable(v))return false;\nconst c=cmp(v,target);\nreturn want===-1?c<0:want===0?c<=0:want===1?c>0:c>=0;\n};\n}\ncase'between':case'notBetween':{\nconst pair=toArray(condition.value);\nconst lo=coerceTarget(pair[0],type);\nconst hi=coerceTarget(pair[1],type);\nconst bounds=condition.bounds||'[]';\nconst loInclusive=bounds.charAt(0)!=='(';\nconst hiInclusive=bounds.charAt(1)!==')';\nif(unorderable(lo)||unorderable(hi))return op==='between'?()=>false:()=>true;\nconst inRange=(v)=>{\nif(unorderable(v))return false;\nconst a=cmp(v,lo);\nconst b=cmp(v,hi);\nreturn(loInclusive?a>=0:a>0)&&(hiInclusive?b<=0:b<0);\n};\nreturn op==='between'?inRange:not(inRange);\n}\ncase'in':case'notIn':{\nconst set=buildSet(condition.value,caseSensitive,type);\nconst member=(v)=>set.has(setKey(v,caseSensitive));\nreturn op==='in'?member:not(member);\n}\ncase'contains':case'notContains':{\nconst needle=textOf(coerceTarget(condition.value,type),caseSensitive);\nconst has=(v)=>(v===null||v===undefined?false:textOf(v,caseSensitive).includes(needle));\nreturn op==='contains'?has:not(has);\n}\ncase'startsWith':{\nconst needle=textOf(coerceTarget(condition.value,type),caseSensitive);\nreturn(v)=>(v===null||v===undefined?false:textOf(v,caseSensitive).startsWith(needle));\n}\ncase'endsWith':{\nconst needle=textOf(coerceTarget(condition.value,type),caseSensitive);\nreturn(v)=>(v===null||v===undefined?false:textOf(v,caseSensitive).endsWith(needle));\n}\ncase'matches':{\nconst re=compileRegExp(condition.value,caseSensitive);\nif(!re)return()=>false;\nreturn(v)=>(v===null||v===undefined?false:re.test(String(v)));\n}\ncase'blank':\nreturn(v)=>isBlank(v)||(Array.isArray(v)&&v.length===0);\ncase'notBlank':\nreturn(v)=>!(isBlank(v)||(Array.isArray(v)&&v.length===0));\ncase'containsAny':case'containsNone':{\nconst set=buildSet(condition.value,caseSensitive,type);\nconst any=(v)=>{\nconst list=v===null||v===undefined?[]:toArray(v);\nfor(let i=0;i<list.length;i++)if(set.has(setKey(list[i],caseSensitive)))return true;\nreturn false;\n};\nreturn op==='containsAny'?any:not(any);\n}\ncase'containsAll':{\nconst wanted=toArray(condition.value).map((x)=>setKey(coerceTarget(x,type),caseSensitive));\nreturn(v)=>{\nconst list=v===null||v===undefined?[]:toArray(v);\nif(wanted.length===0)return true;\nconst have=new Set(list.map((x)=>setKey(x,caseSensitive)));\nfor(let i=0;i<wanted.length;i++)if(!have.has(wanted[i]))return false;\nreturn true;\n};\n}\ndefault:\nwarnOnce(`op:${String(op)}`,`unknown filter operator \"${String(op)}\"; the condition passes every row`);\nreturn()=>true;\n}\n}\nfunction testValue(value,condition,locale){\nreturn compilePredicate(condition,locale)(value);\n}\nfunction presenceCondition(handle,wantPresent,mask,count){\nconst present=presenceReader(handle);\nif(present){\nconst target=wantPresent?1:0;\nfor(let i=0;i<count;i++)mask[i]=present(i)===target?1:0;\nreturn mask;\n}\nconst kind=handle.kind;\nif(kind==='float64'||kind==='int32'||kind==='bitset'){\nreturn fillMask(mask,count,wantPresent?1:0);\n}\nconst read=valueReader(handle);\nfor(let i=0;i<count;i++){\nconst v=read(i);\nconst blank=isBlank(v)||(Array.isArray(v)&&v.length===0);\nmask[i]=blank===wantPresent?0:1;\n}\nreturn mask;\n}\nfunction dictionaryCondition(handle,pred,mask,count){\nconst dict=handle.dict;\nconst size=dictSize(dict);\nconst allowed=new Uint8Array(size);\nfor(let code=0;code<size;code++)allowed[code]=pred(dictValue(dict,code))?1:0;\nconst codes=handle.values;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<count;i++)mask[i]=allowed[codes[i]];\nreturn mask;\n}\nconst absentAnswer=pred(null)?1:0;\nfor(let i=0;i<count;i++)mask[i]=present(i)===1?allowed[codes[i]]:absentAnswer;\nreturn mask;\n}\nfunction booleanCondition(handle,pred,mask,count){\nconst bit=bitReader(handle.values);\nconst whenTrue=pred(true)?1:0;\nconst whenFalse=pred(false)?1:0;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<count;i++)mask[i]=bit(i)===1?whenTrue:whenFalse;\nreturn mask;\n}\nconst absentAnswer=pred(null)?1:0;\nfor(let i=0;i<count;i++){\nmask[i]=present(i)===0?absentAnswer:(bit(i)===1?whenTrue:whenFalse);\n}\nreturn mask;\n}\nfunction numericCondition(handle,condition,pred,mask,count){\nconst values=handle.values;\nconst type=condition.type;\nconst op=condition.op;\nlet handled=true;\nswitch(op){\ncase'eq':case'ne':{\nconst target=toNumber(coerceTarget(condition.value,type));\nconst wantNaN=typeof condition.value==='number'&&Number.isNaN(condition.value);\nconst invert=op==='ne'?1:0;\nif(wantNaN){\nfor(let i=0;i<count;i++)mask[i]=(Number.isNaN(values[i])?1:0)^invert;\n}else{\nfor(let i=0;i<count;i++)mask[i]=((values[i]===target)?1:0)^invert;\n}\nbreak;\n}\ncase'lt':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]<t?1:0;\nbreak;\n}\ncase'lte':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]<=t?1:0;\nbreak;\n}\ncase'gt':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]>t?1:0;\nbreak;\n}\ncase'gte':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]>=t?1:0;\nbreak;\n}\ncase'between':case'notBetween':{\nconst pair=toArray(condition.value);\nconst lo=toNumber(coerceTarget(pair[0],type));\nconst hi=toNumber(coerceTarget(pair[1],type));\nconst bounds=condition.bounds||'[]';\nconst loInclusive=bounds.charAt(0)!=='(';\nconst hiInclusive=bounds.charAt(1)!==')';\nconst invert=op==='notBetween'?1:0;\nif(loInclusive&&hiInclusive){\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>=lo)&(values[i]<=hi))?1:0)^invert;\n}else if(loInclusive){\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>=lo)&(values[i]<hi))?1:0)^invert;\n}else if(hiInclusive){\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>lo)&(values[i]<=hi))?1:0)^invert;\n}else{\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>lo)&(values[i]<hi))?1:0)^invert;\n}\nbreak;\n}\ncase'in':case'notIn':{\nconst set=new Set();\nfor(const raw of toArray(condition.value)){\nconst n=toNumber(coerceTarget(raw,type));\nif(!Number.isNaN(n))set.add(n);\n}\nconst invert=op==='notIn'?1:0;\nfor(let i=0;i<count;i++)mask[i]=(set.has(values[i])?1:0)^invert;\nbreak;\n}\ndefault:\nhandled=false;\nbreak;\n}\nif(!handled)return false;\nconst present=presenceReader(handle);\nif(present){\nconst absentAnswer=pred(null)?1:0;\nfor(let i=0;i<count;i++)if(present(i)===0)mask[i]=absentAnswer;\n}\nreturn true;\n}\nfunction genericCondition(handle,pred,mask,count){\nconst read=valueReader(handle);\nfor(let i=0;i<count;i++)mask[i]=pred(read(i))?1:0;\nreturn mask;\n}\nfunction evaluateCondition(condition,ctx,out){\nconst count=ctx.count|0;\nconst mask=out||acquireMask(ctx,count);\nif(!condition)return fillMask(mask,count,1);\nconst handle=typeof ctx.handle==='function'?ctx.handle(condition.col):undefined;\nconst custom=typeof ctx.custom==='function'?ctx.custom:null;\nif(!handle){\nif(custom){\nfor(let i=0;i<count;i++)mask[i]=custom(condition,i)?1:0;\nreturn mask;\n}\nwarnOnce(`filter:col:${String(condition.col)}`,\n`filter references unknown column \"${String(condition.col)}\"; the condition passes every row`);\nreturn fillMask(mask,count,1);\n}\nconst op=condition.op;\nif(op==='blank'||op==='notBlank')return presenceCondition(handle,op==='notBlank',mask,count);\nconst pred=compilePredicate(condition,ctx.locale);\nswitch(handle.kind){\ncase'dictionary':\nreturn dictionaryCondition(handle,pred,mask,count);\ncase'bitset':\nreturn booleanCondition(handle,pred,mask,count);\ncase'float64':case'int32':\nif(numericCondition(handle,condition,pred,mask,count))return mask;\nreturn genericCondition(handle,pred,mask,count);\ndefault:\nreturn genericCondition(handle,pred,mask,count);\n}\n}\nfunction evaluateNode(node,ctx,count){\nif(!node)return fillMask(acquireMask(ctx,count),count,1);\nif(Array.isArray(node.conditions)){\nconst children=node.conditions.filter((c)=>c!=null);\nconst op=node.op==='or'?'or':node.op==='not'?'not':'and';\nif(children.length===0)return fillMask(acquireMask(ctx,count),count,1);\nconst acc=evaluateNode(children[0],ctx,count);\nfor(let k=1;k<children.length;k++){\nconst rhs=evaluateNode(children[k],ctx,count);\nif(op==='or')for(let i=0;i<count;i++)acc[i]|=rhs[i];\nelse for(let i=0;i<count;i++)acc[i]&=rhs[i];\nreleaseMask(ctx,rhs);\n}\nif(op==='not')for(let i=0;i<count;i++)acc[i]^=1;\nreturn acc;\n}\nreturn evaluateCondition(node,ctx,acquireMask(ctx,count));\n}\nfunction evaluateFilters(filters,ctx){\nreturn evaluateNode(filters,ctx,ctx.count|0);\n}\nfunction pruneColumn(filters,colId){\nif(!filters||!colId)return filters||null;\nconst node=(filters);\nif(Array.isArray(node.conditions)){\nconst op=node.op==='or'?'or':node.op==='not'?'not':'and';\nif(op!=='and'){\nreturn mentionsColumn(node,colId)?null:filters;\n}\nconst kept=[];\nfor(const child of node.conditions){\nconst pruned=pruneColumn(child,colId);\nif(pruned)kept.push(pruned);\n}\nif(!kept.length)return null;\nreturn{...node,op:'and',conditions:kept};\n}\nreturn node.col===colId?null:filters;\n}\nfunction mentionsColumn(filters,colId){\nif(!filters||typeof filters!=='object')return false;\nconst node=(filters);\nif(node.col===colId)return true;\nif(Array.isArray(node.conditions)){\nfor(const child of node.conditions)if(mentionsColumn(child,colId))return true;\n}\nreturn false;\n}\nfunction compact(mask,count,out){\nif(out&&out.length>=count){\nlet k=0;\nfor(let i=0;i<count;i++)if(mask[i])out[k++]=i;\nreturn out.subarray(0,k);\n}\nlet survivors=0;\nfor(let i=0;i<count;i++)survivors+=mask[i]?1:0;\nconst result=new Uint32Array(survivors);\nlet k=0;\nfor(let i=0;i<count;i++)if(mask[i])result[k++]=i;\nreturn result;\n}\n});\n__def(\"packages/core/src/compute/group.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"packKeys\",{enumerable:true,get:function(){return packKeys;}});\nObject.defineProperty(__exports,\"groupByColumns\",{enumerable:true,get:function(){return groupByColumns;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst dictSize=__m0[\"dictSize\"];\nconst identity=__m0[\"identity\"];\nconst presenceReader=__m0[\"presenceReader\"];\nconst rowCount=__m0[\"rowCount\"];\nconst valueReader=__m0[\"valueReader\"];\nconst KEY_SEPARATOR='\\u001F';\nconst NULL_MARKER='\\u0000';\nconst MAX_DIRECT_COUNTS=1<<20;\nfunction packKeys(handles,idx,n){\nconst k=handles.length;\nconst readers=handles.map((h)=>valueReader(h));\nconst allDictionary=k>0&&handles.every((h)=>h&&h.kind==='dictionary'&&h.dict);\nif(allDictionary){\nconst cards=handles.map((h)=>dictSize(h.dict)+1);\nlet product=1;\nfor(let j=0;j<k;j++)product*=cards[j];\nif(product<=Number.MAX_SAFE_INTEGER){\nconst codes=handles.map((h)=>h.values);\nconst presence=handles.map((h)=>presenceReader(h));\nconst keyOf=(row)=>{\nlet key=0;\nfor(let j=0;j<k;j++){\nconst present=presence[j];\nconst code=present&&present(row)===0?cards[j]-1:codes[j][row];\nkey=key*cards[j]+code;\n}\nreturn key;\n};\nconst packed=new Float64Array(n);\nfor(let i=0;i<n;i++)packed[i]=keyOf(idx[i]);\nreturn{packed,strings:null,product,readers,keyOf};\n}\n}\nconst keyOf=(row)=>{\nlet key='';\nfor(let j=0;j<k;j++){\nconst v=readers[j](row);\nkey+=(j===0?'':KEY_SEPARATOR)+(v===null||v===undefined?NULL_MARKER:String(v));\n}\nreturn key;\n};\nconst strings=new Array(n);\nfor(let i=0;i<n;i++)strings[i]=keyOf(idx[i]);\nreturn{packed:null,strings,product:Infinity,readers,keyOf};\n}\nfunction scatterBuckets(idx,ids,n,groups){\nconst offsets=new Uint32Array(groups+1);\nfor(let i=0;i<n;i++)offsets[ids[i]+1]++;\nfor(let g=0;g<groups;g++)offsets[g+1]+=offsets[g];\nconst scattered=new Uint32Array(n);\nconst cursor=offsets.slice(0,groups);\nfor(let i=0;i<n;i++)scattered[cursor[ids[i]]++]=idx[i];\nconst buckets=new Array(groups);\nfor(let g=0;g<groups;g++)buckets[g]=scattered.subarray(offsets[g],offsets[g+1]);\nreturn buckets;\n}\nfunction groupByColumns(handles,order,opts={}){\nconst list=handles||[];\nconst idx=order||identity(rowCount(list[0],opts));\nconst n=idx.length;\nif(list.length===0||n===0)return{keys:[],buckets:[]};\nconst{packed,strings,product,readers}=packKeys(list,idx,n);\nconst ids=new Uint32Array(n);\nlet groups=0;\nlet packedKeys=null;\nif(packed&&product<=Math.max(1024,Math.min(MAX_DIRECT_COUNTS,n*4))){\nconst size=product;\nconst seen=new Int32Array(size).fill(-1);\nfor(let i=0;i<n;i++)seen[packed[i]]=0;\nfor(let key=0;key<size;key++)if(seen[key]===0)seen[key]=groups++;\nfor(let i=0;i<n;i++)ids[i]=seen[packed[i]];\npackedKeys=new Float64Array(groups);\nfor(let key=0;key<size;key++)if(seen[key]>=0)packedKeys[seen[key]]=key;\n}else if(packed){\nconst seen=new Map();\nfor(let i=0;i<n;i++){\nconst key=packed[i];\nlet id=seen.get(key);\nif(id===undefined){id=groups++;seen.set(key,id);}\nids[i]=id;\n}\npackedKeys=new Float64Array(groups);\nfor(const[key,id]of seen)packedKeys[id]=key;\n}else{\nconst seen=new Map();\nfor(let i=0;i<n;i++){\nconst key=strings[i];\nlet id=seen.get(key);\nif(id===undefined){id=groups++;seen.set(key,id);}\nids[i]=id;\n}\n}\nconst buckets=scatterBuckets(idx,ids,n,groups);\nconst keys=new Array(groups);\nfor(let g=0;g<groups;g++){\nconst row=buckets[g][0];\nconst tuple=new Array(readers.length);\nfor(let j=0;j<readers.length;j++)tuple[j]=readers[j](row);\nkeys[g]=tuple;\n}\nconst result={keys,buckets};\nif(packedKeys)result.packed=packedKeys;\nreturn result;\n}\n});\n__def(\"packages/core/src/compute/facet.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"STRATEGIES\",{enumerable:true,get:function(){return STRATEGIES;}});\nObject.defineProperty(__exports,\"GRANULARITIES\",{enumerable:true,get:function(){return GRANULARITIES;}});\nObject.defineProperty(__exports,\"DEFAULT_BUCKETS\",{enumerable:true,get:function(){return DEFAULT_BUCKETS;}});\nObject.defineProperty(__exports,\"DEFAULT_CARDINALITY_LIMIT\",{enumerable:true,get:function(){return DEFAULT_CARDINALITY_LIMIT;}});\nObject.defineProperty(__exports,\"QUANTILE_SAMPLE\",{enumerable:true,get:function(){return QUANTILE_SAMPLE;}});\nObject.defineProperty(__exports,\"facetKind\",{enumerable:true,get:function(){return facetKind;}});\nObject.defineProperty(__exports,\"orderedReader\",{enumerable:true,get:function(){return orderedReader;}});\nObject.defineProperty(__exports,\"toNumeric\",{enumerable:true,get:function(){return toNumeric;}});\nObject.defineProperty(__exports,\"cardinalityOf\",{enumerable:true,get:function(){return cardinalityOf;}});\nObject.defineProperty(__exports,\"pickGranularity\",{enumerable:true,get:function(){return pickGranularity;}});\nObject.defineProperty(__exports,\"floorTo\",{enumerable:true,get:function(){return floorTo;}});\nObject.defineProperty(__exports,\"advance\",{enumerable:true,get:function(){return advance;}});\nObject.defineProperty(__exports,\"computeBounds\",{enumerable:true,get:function(){return computeBounds;}});\nObject.defineProperty(__exports,\"countInto\",{enumerable:true,get:function(){return countInto;}});\nObject.defineProperty(__exports,\"bucketOf\",{enumerable:true,get:function(){return bucketOf;}});\nObject.defineProperty(__exports,\"facet\",{enumerable:true,get:function(){return facet;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst presenceReader=__m0[\"presenceReader\"];\nconst valueReader=__m0[\"valueReader\"];\nconst dictSize=__m0[\"dictSize\"];\nconst dictValue=__m0[\"dictValue\"];\nconst STRATEGIES=Object.freeze(['equal','quantile','log']);\nconst GRANULARITIES=Object.freeze(['hour','day','week','month','quarter','year']);\nconst DEFAULT_BUCKETS=20;\nconst DEFAULT_CARDINALITY_LIMIT=50;\nconst QUANTILE_SAMPLE=10_000;\nfunction facetKind(handle,type){\nif(!handle)return'none';\nconst base=type&&type.base;\nif(base==='date'||base==='datetime'||base==='time'||base==='dateString')return'date';\nswitch(handle.kind){\ncase'bitset':return'boolean';\ncase'float64':case'int32':return'numeric';\ncase'dictionary':return'category';\ncase'multi':return'category';\ndefault:\nif(base==='number')return'numeric';\nif(base==='boolean')return'boolean';\nif(base==='text')return'category';\nreturn'none';\n}\n}\nfunction orderedReader(handle){\nconst values=handle.values;\nconst kind=handle.kind;\nif((kind==='float64'||kind==='int32')&&values)return(i)=>values[i];\nconst read=valueReader(handle);\nreturn(i)=>toNumeric(read(i));\n}\nfunction toNumeric(v){\nif(typeof v==='number')return v;\nif(v instanceof Date)return v.getTime();\nif(v===null||v===undefined||v==='')return NaN;\nif(typeof v==='boolean')return v?1:0;\nif(typeof v==='string'){\nconst n=Number(v);\nif(Number.isFinite(n))return n;\nconst t=Date.parse(v);\nreturn Number.isFinite(t)?t:NaN;\n}\nreturn NaN;\n}\nfunction cardinalityOf(handle,indices,count,limit=DEFAULT_CARDINALITY_LIMIT){\nif(!handle)return{cardinality:0,exact:true};\nif(handle.dict)return{cardinality:dictSize(handle.dict),exact:true};\nif(handle.kind==='bitset')return{cardinality:2,exact:true};\nconst read=valueReader(handle);\nconst n=indices?indices.length:count;\nconst seen=new Set();\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined)continue;\nseen.add(v);\nif(seen.size>limit)return{cardinality:seen.size,exact:false};\n}\nreturn{cardinality:seen.size,exact:true};\n}\nconst HOUR_MS=3600_000;\nconst DAY_MS=86_400_000;\nfunction pickGranularity(span,target=DEFAULT_BUCKETS){\nconst ms=Number.isFinite(span)&&span>0?span:0;\nconst wide=Math.max(1,target)*2;\nif(ms/HOUR_MS<=wide)return'hour';\nif(ms/DAY_MS<=wide)return'day';\nif(ms/(7*DAY_MS)<=wide)return'week';\nif(ms/(30*DAY_MS)<=wide)return'month';\nif(ms/(91*DAY_MS)<=wide)return'quarter';\nreturn'year';\n}\nfunction floorTo(ms,granularity){\nif(!Number.isFinite(ms))return NaN;\nconst d=new Date(ms);\nswitch(granularity){\ncase'hour':d.setMinutes(0,0,0);return d.getTime();\ncase'day':d.setHours(0,0,0,0);return d.getTime();\ncase'week':{\nd.setHours(0,0,0,0);\nconst back=(d.getDay()+6)%7;\nd.setDate(d.getDate()-back);\nreturn d.getTime();\n}\ncase'month':d.setDate(1);d.setHours(0,0,0,0);return d.getTime();\ncase'quarter':\nd.setMonth(Math.floor(d.getMonth()/3)*3,1);\nd.setHours(0,0,0,0);\nreturn d.getTime();\ndefault:d.setMonth(0,1);d.setHours(0,0,0,0);return d.getTime();\n}\n}\nfunction advance(ms,granularity){\nconst d=new Date(ms);\nswitch(granularity){\ncase'hour':d.setHours(d.getHours()+1);break;\ncase'day':d.setDate(d.getDate()+1);break;\ncase'week':d.setDate(d.getDate()+7);break;\ncase'month':d.setMonth(d.getMonth()+1);break;\ncase'quarter':d.setMonth(d.getMonth()+3);break;\ndefault:d.setFullYear(d.getFullYear()+1);break;\n}\nreturn d.getTime();\n}\nfunction numericExtent(handle,indices,count){\nconst read=orderedReader(handle);\nconst present=presenceReader(handle);\nconst n=indices?indices.length:count;\nlet min=Infinity;\nlet max=-Infinity;\nlet nulls=0;\nlet finite=0;\nfor(let k=0;k<n;k++){\nconst i=indices?indices[k]:k;\nif(present&&!present(i)){nulls++;continue;}\nconst v=read(i);\nif(!Number.isFinite(v)){nulls++;continue;}\nif(v<min)min=v;\nif(v>max)max=v;\nfinite++;\n}\nreturn{min,max,nulls,finite};\n}\nfunction sortedSample(handle,indices,count,cap){\nconst read=orderedReader(handle);\nconst present=presenceReader(handle);\nconst n=indices?indices.length:count;\nconst step=n>cap?n/cap:1;\nconst out=[];\nfor(let s=0;s<n;s+=step){\nconst i=indices?indices[Math.floor(s)]:Math.floor(s);\nif(present&&!present(i))continue;\nconst v=read(i);\nif(Number.isFinite(v))out.push(v);\n}\nconst arr=Float64Array.from(out);\narr.sort();\nreturn arr;\n}\nfunction computeBounds(handle,indices,count,opts={}){\nconst kind=opts.kind||facetKind(handle,opts.type);\nif(kind==='none'||!handle)return{kind:'none',buckets:[],suppressed:'type'};\nif(kind==='boolean')return boundsForBoolean(handle,indices,count);\nif(kind==='category')return boundsForCategory(handle,indices,count,opts);\nreturn boundsForOrdered(handle,indices,count,kind,opts);\n}\nfunction boundsForBoolean(handle,indices,count){\nconst present=presenceReader(handle);\nlet nulls=0;\nif(present){\nconst n=indices?indices.length:count;\nfor(let k=0;k<n;k++)if(!present(indices?indices[k]:k))nulls++;\n}\nconst buckets=[{value:false,label:'false'},{value:true,label:'true'}];\nif(nulls>0)buckets.push({null:true,label:'Empty'});\nreturn{kind:'boolean',buckets};\n}\nfunction boundsForCategory(handle,indices,count,opts){\nconst limit=opts.cardinalityLimit??DEFAULT_CARDINALITY_LIMIT;\nconst{cardinality}=cardinalityOf(handle,indices,count,limit);\nif(cardinality>limit&&(opts.aboveLimit||'suppress')==='suppress'){\nreturn{kind:'category',buckets:[],suppressed:'cardinality',cardinality};\n}\nconst read=valueReader(handle);\nconst n=indices?indices.length:count;\nconst tally=new Map();\nlet nulls=0;\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined||v===''){nulls++;continue;}\nif(Array.isArray(v)){\nif(!v.length){nulls++;continue;}\nfor(const m of v)tally.set(m,(tally.get(m)||0)+1);\ncontinue;\n}\ntally.set(v,(tally.get(v)||0)+1);\n}\nlet entries=[...tally.entries()];\nif(opts.order==='alpha'){\nentries.sort((a,b)=>String(a[0]).localeCompare(String(b[0])));\n}else{\nentries.sort((a,b)=>b[1]-a[1]);\n}\nlet remainder=0;\nlet dropped=0;\nif(entries.length>limit){\ndropped=entries.length-limit;\nfor(let i=limit;i<entries.length;i++)remainder+=entries[i][1];\nentries=entries.slice(0,limit);\n}\nconst buckets=entries.map(([value])=>({value,label:String(value)}));\nif(remainder>0)buckets.push({remainder:true,label:`Other (${dropped} values)`});\nif(nulls>0)buckets.push({null:true,label:'Empty'});\nreturn{kind:'category',buckets,cardinality};\n}\nfunction boundsForOrdered(handle,indices,count,kind,opts){\nconst{min,max,nulls,finite}=numericExtent(handle,indices,count);\nif(!finite){\nreturn{kind,buckets:nulls?[{null:true,label:'Empty'}]:[],empty:true};\n}\nconst wanted=Math.max(1,Math.floor(opts.buckets||DEFAULT_BUCKETS));\nlet buckets=[];\nif(kind==='date'){\nconst granularity=GRANULARITIES.includes(opts.granularity)\n?opts.granularity:pickGranularity(max-min,wanted);\nlet edge=floorTo(min,granularity);\nwhile(edge<=max&&buckets.length<4096){\nconst next=advance(edge,granularity);\nif(!(next>edge))break;\nbuckets.push({from:edge,to:next});\nedge=next;\n}\nreturn{kind,buckets:withNull(buckets,nulls),granularity};\n}\nconst strategy=STRATEGIES.includes(opts.strategy)?opts.strategy:'equal';\nif(strategy==='quantile'){\nconst sample=sortedSample(handle,indices,count,QUANTILE_SAMPLE);\nif(sample.length){\nconst edges=[sample[0]];\nfor(let b=1;b<wanted;b++){\nconst v=sample[Math.min(sample.length-1,Math.floor((b/wanted)*sample.length))];\nif(v>edges[edges.length-1])edges.push(v);\n}\nedges.push(max);\nfor(let b=0;b<edges.length-1;b++)buckets.push({from:edges[b],to:edges[b+1]});\n}\n}else if(strategy==='log'&&min>0){\nconst lo=Math.log10(min);\nconst hi=Math.log10(max);\nconst step=(hi-lo)/wanted||1;\nfor(let b=0;b<wanted;b++){\nbuckets.push({from:10**(lo+b*step),to:10**(lo+(b+1)*step)});\n}\n}\nif(!buckets.length){\nconst width=(max-min)/wanted||1;\nfor(let b=0;b<wanted;b++)buckets.push({from:min+b*width,to:min+(b+1)*width});\n}\nbuckets[buckets.length-1].to=max;\nreturn{kind,buckets:withNull(buckets,nulls),strategy,min,max};\n}\nfunction withNull(buckets,nulls){\nreturn nulls>0?[...buckets,{null:true,label:'Empty'}]:buckets;\n}\nfunction countInto(handle,indices,count,bounds,out){\nconst buckets=(bounds&&bounds.buckets)||[];\nconst counts=out&&out.length>=buckets.length?out.subarray(0,buckets.length)\n:new Uint32Array(buckets.length);\ncounts.fill(0);\nif(!handle||!buckets.length)return counts;\nconst nullBucket=buckets.length-1;\nconst hasNull=!!buckets[nullBucket]&&buckets[nullBucket].null===true;\nconst n=indices?indices.length:count;\nif(bounds.kind==='boolean'){\nconst read=valueReader(handle);\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined){if(hasNull)counts[nullBucket]++;continue;}\ncounts[v?1:0]++;\n}\nreturn counts;\n}\nif(bounds.kind==='category'){\nconst slot=new Map();\nfor(let b=0;b<buckets.length;b++){\nif(!buckets[b].null&&!buckets[b].remainder)slot.set(buckets[b].value,b);\n}\nconst remainderAt=buckets.findIndex((b)=>b.remainder);\nconst read=valueReader(handle);\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined||v===''){if(hasNull)counts[nullBucket]++;continue;}\nif(Array.isArray(v)){\nif(!v.length){if(hasNull)counts[nullBucket]++;continue;}\nfor(const m of v){\nconst at=slot.get(m);\nif(at!==undefined)counts[at]++;\nelse if(remainderAt>=0)counts[remainderAt]++;\n}\ncontinue;\n}\nconst at=slot.get(v);\nif(at!==undefined)counts[at]++;\nelse if(remainderAt>=0)counts[remainderAt]++;\n}\nreturn counts;\n}\nconst ordered=hasNull?buckets.length-1:buckets.length;\nconst edges=new Float64Array(ordered+1);\nfor(let b=0;b<ordered;b++)edges[b]=buckets[b].from;\nedges[ordered]=ordered?buckets[ordered-1].to:0;\nconst read=orderedReader(handle);\nconst present=presenceReader(handle);\nfor(let k=0;k<n;k++){\nconst i=indices?indices[k]:k;\nif(present&&!present(i)){if(hasNull)counts[nullBucket]++;continue;}\nconst v=read(i);\nif(!Number.isFinite(v)){if(hasNull)counts[nullBucket]++;continue;}\nconst at=bucketOf(edges,ordered,v);\nif(at>=0)counts[at]++;\n}\nreturn counts;\n}\nfunction bucketOf(edges,ordered,v){\nif(!ordered)return-1;\nif(v<edges[0])return-1;\nif(v>=edges[ordered])return v===edges[ordered]?ordered-1:-1;\nlet lo=0;\nlet hi=ordered-1;\nwhile(lo<hi){\nconst mid=(lo+hi+1)>>>1;\nif(v>=edges[mid])lo=mid;else hi=mid-1;\n}\nreturn lo;\n}\nfunction facet(handle,indices,count,opts={}){\nconst bounds=opts.bounds||computeBounds(handle,opts.boundsIndices??indices,count,opts);\nreturn{bounds,counts:countInto(handle,indices,count,bounds)};\n}\nconst __default=facet;\n});\n__def(\"packages/core/src/compute/special.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"logGamma\",{enumerable:true,get:function(){return logGamma;}});\nObject.defineProperty(__exports,\"incompleteBeta\",{enumerable:true,get:function(){return incompleteBeta;}});\nObject.defineProperty(__exports,\"normalQuantile\",{enumerable:true,get:function(){return normalQuantile;}});\nObject.defineProperty(__exports,\"normalCdf\",{enumerable:true,get:function(){return normalCdf;}});\nObject.defineProperty(__exports,\"studentT\",{enumerable:true,get:function(){return studentT;}});\nObject.defineProperty(__exports,\"studentTQuantile\",{enumerable:true,get:function(){return studentTQuantile;}});\nconst LANCZOS=Object.freeze([\n676.5203681218851,-1259.1392167224028,771.32342877765313,\n-176.61502916214059,12.507343278686905,-0.13857109526572012,\n9.9843695780195716e-6,1.5056327351493116e-7,\n]);\nconst EPS=3e-12;\nconst TINY=1e-300;\nfunction logGamma(x){\nif(x<0.5)return Math.log(Math.PI/Math.sin(Math.PI*x))-logGamma(1-x);\nconst z=x-1;\nlet a=0.99999999999980993;\nconst t=z+7.5;\nfor(let i=0;i<LANCZOS.length;i++)a+=LANCZOS[i]/(z+i+1);\nreturn 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(a);\n}\nfunction betaContinuedFraction(a,b,x){\nconst qab=a+b;\nconst qap=a+1;\nconst qam=a-1;\nlet c=1;\nlet d=1-(qab*x)/qap;\nif(Math.abs(d)<TINY)d=TINY;\nd=1/d;\nlet h=d;\nfor(let m=1;m<=300;m++){\nconst m2=2*m;\nlet aa=(m*(b-m)*x)/((qam+m2)*(a+m2));\nd=1+aa*d;\nif(Math.abs(d)<TINY)d=TINY;\nc=1+aa/c;\nif(Math.abs(c)<TINY)c=TINY;\nd=1/d;\nh*=d*c;\naa=(-(a+m)*(qab+m)*x)/((a+m2)*(qap+m2));\nd=1+aa*d;\nif(Math.abs(d)<TINY)d=TINY;\nc=1+aa/c;\nif(Math.abs(c)<TINY)c=TINY;\nd=1/d;\nconst step=d*c;\nh*=step;\nif(Math.abs(step-1)<EPS)break;\n}\nreturn h;\n}\nfunction incompleteBeta(a,b,x){\nif(!(a>0)||!(b>0)||!Number.isFinite(x))return Number.NaN;\nif(x<=0)return 0;\nif(x>=1)return 1;\nconst front=Math.exp(\nlogGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x),\n);\nreturn x<(a+1)/(a+b+2)\n?(front*betaContinuedFraction(a,b,x))/a\n:1-(front*betaContinuedFraction(b,a,1-x))/b;\n}\nfunction normalQuantile(p){\nif(!(p>0)||!(p<1))return p===0?-Infinity:(p===1?Infinity:Number.NaN);\nconst a=[-3.969683028665376e+1,2.209460984245205e+2,-2.759285104469687e+2,\n1.383577518672690e+2,-3.066479806614716e+1,2.506628277459239];\nconst b=[-5.447609879822406e+1,1.615858368580409e+2,-1.556989798598866e+2,\n6.680131188771972e+1,-1.328068155288572e+1];\nconst c=[-7.784894002430293e-3,-3.223964580411365e-1,-2.400758277161838,\n-2.549732539343734,4.374664141464968,2.938163982698783];\nconst d=[7.784695709041462e-3,3.224671290700398e-1,2.445134137142996,\n3.754408661907416];\nconst low=0.02425;\nlet q;\nlet r;\nlet x;\nif(p<low){\nq=Math.sqrt(-2*Math.log(p));\nx=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])\n/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);\n}else if(p<=1-low){\nq=p-0.5;\nr=q*q;\nx=((((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q)\n/ (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);\n}else{\nq=Math.sqrt(-2*Math.log(1-p));\nx=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])\n/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);\n}\nconst e=0.5*erfc(-x/Math.SQRT2)-p;\nconst u=e*Math.sqrt(2*Math.PI)*Math.exp((x*x)/2);\nreturn x-u/(1+(x*u)/2);\n}\nfunction erfc(x){\nconst z=Math.abs(x);\nconst t=2/(2+z);\nconst ty=4*t-2;\nconst cof=[-1.3026537197817094,6.4196979235649026e-1,1.9476473204185836e-2,\n-9.561514786808631e-3,-9.46595344482036e-4,3.66839497852761e-4,\n4.2523324806907e-5,-2.0278578112534e-5,-1.624290004647e-6,\n1.303655835580e-6,1.5626441722e-8,-8.5238095915e-8,6.529054439e-9,\n5.059343495e-9,-9.91364156e-10,-2.27365122e-10,9.6467911e-11,\n2.394038e-12,-6.886027e-12,8.94487e-13,3.13092e-13,-1.12708e-13,\n3.81e-16,7.106e-15];\nlet dd=0;\nlet dv=0;\nlet tmp;\nfor(let j=cof.length-1;j>0;j--){\ntmp=dv;\ndv=ty*dv-dd+cof[j];\ndd=tmp;\n}\nconst ans=t*Math.exp(-z*z+0.5*(cof[0]+ty*dv)-dd);\nreturn x>=0?ans:2-ans;\n}\nfunction normalCdf(x){\nreturn 0.5*erfc(-x/Math.SQRT2);\n}\nfunction studentT(t,df){\nif(!(df>0)||!Number.isFinite(t))return Number.NaN;\nconst tail=0.5*incompleteBeta(df/2,0.5,df/(df+t*t));\nreturn t>0?1-tail:tail;\n}\nfunction studentTQuantile(p,df){\nif(!(p>0)||!(p<1)||!(df>0))return Number.NaN;\nif(df>1e7)return normalQuantile(p);\nlet lo=-1e4;\nlet hi=1e4;\nlet x=normalQuantile(p);\nconst logBeta=logGamma(df/2)+logGamma(0.5)-logGamma((df+1)/2);\nfor(let i=0;i<60;i++){\nconst cdf=studentT(x,df);\nif(cdf<p)lo=x;else hi=x;\nconst pdf=Math.exp(-((df+1)/2)*Math.log(1+(x*x)/df)-logBeta)\n/ Math.sqrt(df);\nconst step=pdf>0?(cdf-p)/pdf:0;\nif(Math.abs(step)<1e-12)break;\nconst next=x-step;\nx=next>lo&&next<hi&&Number.isFinite(next)?next:(lo+hi)/2;\nif(hi-lo<1e-12)break;\n}\nreturn x;\n}\n});\n__def(\"packages/core/src/compute/sketch.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Welford\",{enumerable:true,get:function(){return Welford;}});\nObject.defineProperty(__exports,\"Reservoir\",{enumerable:true,get:function(){return Reservoir;}});\nObject.defineProperty(__exports,\"hash32\",{enumerable:true,get:function(){return hash32;}});\nObject.defineProperty(__exports,\"HyperLogLog\",{enumerable:true,get:function(){return HyperLogLog;}});\nObject.defineProperty(__exports,\"SpaceSaving\",{enumerable:true,get:function(){return SpaceSaving;}});\nObject.defineProperty(__exports,\"KLL\",{enumerable:true,get:function(){return KLL;}});\nObject.defineProperty(__exports,\"SKETCH_BOUNDS\",{enumerable:true,get:function(){return SKETCH_BOUNDS;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nclass Welford{\n#n=0;\n#mean=0;\n#m2=0;\nstatic get errorBound(){\nreturn Object.freeze({\nkind:'exact',metric:'none',value:0,\nstatement:'mean and variance match a full recompute to float rounding',\n});\n}\nget count(){return this.#n;}\nadd(x){\nif(!Number.isFinite(x))return;\nthis.#n++;\nconst delta=x-this.#mean;\nthis.#mean+=delta/this.#n;\nthis.#m2+=delta*(x-this.#mean);\n}\nmerge(other){\nif(other.#n===0)return;\nif(this.#n===0){this.#n=other.#n;this.#mean=other.#mean;this.#m2=other.#m2;return;}\nconst n=this.#n+other.#n;\nconst delta=other.#mean-this.#mean;\nthis.#mean+=delta*(other.#n/n);\nthis.#m2+=other.#m2+delta*delta*(this.#n*other.#n/n);\nthis.#n=n;\n}\nmean(){return this.#n?this.#mean:null;}\nvariance(){return this.#n>1?this.#m2/(this.#n-1):null;}\nvarianceP(){return this.#n?this.#m2/this.#n:null;}\nstddev(){const v=this.variance();return v===null?null:Math.sqrt(v);}\nstddevP(){const v=this.varianceP();return v===null?null:Math.sqrt(v);}\n}\nclass Reservoir{\n#items=[];\n#seen=0;\n#capacity;\n#rng;\nconstructor(capacity,rng=Math.random){\nif(!(capacity>0))throw new RangeError('reservoir capacity must be positive');\nthis.#capacity=Math.floor(capacity);\nthis.#rng=rng;\n}\nstatic get errorBound(){\nreturn Object.freeze({\nkind:'probabilistic',metric:'none',value:0,\nstatement:'uniform sample: each element included with probability capacity/n; sample statistics are unbiased estimators',\n});\n}\nget seen(){return this.#seen;}\nget size(){return this.#items.length;}\nadd(x){\nif(!Number.isFinite(x))return;\nthis.#seen++;\nif(this.#items.length<this.#capacity){\nthis.#items.push(x);\nreturn;\n}\nconst j=Math.floor(this.#rng()*this.#seen);\nif(j<this.#capacity)this.#items[j]=x;\n}\nsample(){return this.#items.slice();}\nmean(){\nif(!this.#items.length)return null;\nlet s=0;\nfor(const v of this.#items)s+=v;\nreturn s/this.#items.length;\n}\nquantile(p){\nconst n=this.#items.length;\nif(!n)return null;\nconst sorted=this.#items.slice().sort((a,b)=>a-b);\nif(n===1)return sorted[0];\nconst h=(n-1)*Math.min(1,Math.max(0,p));\nconst lo=Math.floor(h);\nconst hi=Math.ceil(h);\nreturn lo===hi?sorted[lo]:sorted[lo]+(h-lo)*(sorted[hi]-sorted[lo]);\n}\n}\nfunction fmix32(h){\nh^=h>>>16;\nh=Math.imul(h,0x85ebca6b);\nh^=h>>>13;\nh=Math.imul(h,0xc2b2ae35);\nh^=h>>>15;\nreturn h>>>0;\n}\nfunction hash32(v){\nif(typeof v==='number'){\nconst buf=new DataView(new ArrayBuffer(8));\nbuf.setFloat64(0,v===0?0:v);\nreturn fmix32(buf.getUint32(0)^buf.getUint32(4));\n}\nconst s=typeof v==='string'?v:String(v);\nlet h=0x811c9dc5;\nfor(let i=0;i<s.length;i++){\nh^=s.charCodeAt(i);\nh=Math.imul(h,0x01000193);\n}\nreturn fmix32(h);\n}\nclass HyperLogLog{\n#p;\n#m;\n#registers;\nconstructor(precision=14){\nconst p=Math.floor(precision);\nif(p<4||p>16)throw new RangeError('HLL precision must be 4..16');\nthis.#p=p;\nthis.#m=1<<p;\nthis.#registers=new Uint8Array(this.#m);\n}\nstatic errorBoundFor(precision=14){\nconst m=1<<Math.floor(precision);\nconst rse=1.04/Math.sqrt(m);\nreturn Object.freeze({\nkind:'probabilistic',metric:'relative',value:rse,\nstatement:`distinct count within ~${(rse*100).toFixed(2)}% relative standard error (m=${m} buckets)`,\n});\n}\nerrorBound(){return HyperLogLog.errorBoundFor(this.#p);}\nadd(v){\nconst h=hash32(v);\nconst idx=h&(this.#m-1);\nconst rest=(h>>>this.#p)|(1<<(32-this.#p));\nlet rank=1;\nlet x=rest;\nwhile((x&1)===0){rank++;x>>>=1;}\nif(rank>this.#registers[idx])this.#registers[idx]=rank;\n}\ncount(){\nconst m=this.#m;\nconst q=32-this.#p;\nconst hist=new Float64Array(q+2);\nfor(let i=0;i<m;i++)hist[this.#registers[i]]++;\nlet z=m*tau(1-hist[q+1]/m);\nfor(let k=q;k>=1;k--)z=0.5*(z+hist[k]);\nz+=m*sigma(hist[0]/m);\nconst estimate=(ERTL_ALPHA_INF*m*m)/z;\nreturn Math.round(estimate);\n}\n}\nconst ERTL_ALPHA_INF=0.5/Math.log(2);\nfunction sigma(x){\nif(x===1)return Infinity;\nlet y=1;\nlet z=x;\nlet prev;\ndo{\nx*=x;\nprev=z;\nz+=x*y;\ny+=y;\n}while(z!==prev);\nreturn z;\n}\nfunction tau(x){\nif(x===0||x===1)return 0;\nlet y=1;\nlet z=1-x;\nlet prev;\ndo{\nx=Math.sqrt(x);\nprev=z;\ny*=0.5;\nz-=(1-x)**2*y;\n}while(z!==prev);\nreturn z/3;\n}\nclass SpaceSaving{\n#counters=new Map();\n#capacity;\n#n=0;\nconstructor(capacity){\nif(!(capacity>0))throw new RangeError('Space-Saving capacity must be positive');\nthis.#capacity=Math.floor(capacity);\n}\nerrorBoundFor(n){\nconst value=n/this.#capacity;\nreturn Object.freeze({\nkind:'deterministic',metric:'absolute',value,\nstatement:`each count overestimates the truth by at most N/m = ${value.toFixed(2)} (N=${n}, m=${this.#capacity})`,\n});\n}\nget seen(){return this.#n;}\nadd(item){\nthis.#n++;\nconst existing=this.#counters.get(item);\nif(existing){existing.count++;return;}\nif(this.#counters.size<this.#capacity){\nthis.#counters.set(item,{count:1,error:0});\nreturn;\n}\nlet minItem;\nlet minCount=Infinity;\nfor(const[k,v]of this.#counters){\nif(v.count<minCount){minCount=v.count;minItem=k;}\n}\nthis.#counters.delete(minItem);\nthis.#counters.set(item,{count:minCount+1,error:minCount});\n}\ntop(k=this.#capacity){\nconst all=[...this.#counters.entries()]\n.map(([item,v])=>({item,count:v.count,error:v.error}))\n.sort((a,b)=>b.count-a.count);\nreturn all.slice(0,Math.max(0,Math.floor(k)));\n}\n}\nclass KLL{\n#k;\n#levels=[[]];\n#n=0;\n#rng;\n#capacityFactor;\nconstructor(k=200,rng=Math.random){\nthis.#k=Math.max(8,Math.floor(k));\nthis.#rng=rng;\nthis.#capacityFactor=2/3;\n}\nstatic errorBoundFor(k=200){\nconst eps=1/Math.max(8,Math.floor(k));\nreturn Object.freeze({\nkind:'probabilistic',metric:'rank',value:eps,\nstatement:`queried quantile's true rank within ~${(eps*100).toFixed(2)}% of N of the requested rank (k=${k})`,\n});\n}\nerrorBound(){return KLL.errorBoundFor(this.#k);}\nget count(){return this.#n;}\n#levelCapacity(height){\nconst top=this.#levels.length-1;\nconst depthFromTop=top-height;\nconst cap=Math.ceil(this.#k*this.#capacityFactor**depthFromTop);\nreturn Math.max(2,cap);\n}\nadd(x){\nif(!Number.isFinite(x))return;\nthis.#n++;\nthis.#levels[0].push(x);\nif(this.#levels[0].length>=this.#levelCapacity(0))this.#compact(0);\n}\n#compact(height){\nconst level=this.#levels[height];\nlevel.sort((a,b)=>a-b);\nif(height+1>=this.#levels.length)this.#levels.push([]);\nconst up=this.#levels[height+1];\nconst offset=this.#rng()<0.5?0:1;\nfor(let i=offset;i<level.length;i+=2)up.push(level[i]);\nthis.#levels[height]=[];\nfor(let h=0;h<this.#levels.length;h++){\nif(this.#levels[h].length>=this.#levelCapacity(h)){this.#compact(h);return;}\n}\n}\n#weighted(){\nconst out=[];\nfor(let h=0;h<this.#levels.length;h++){\nconst w=1<<h;\nfor(const v of this.#levels[h])out.push({v,w});\n}\nreturn out;\n}\nquantile(p){\nconst items=this.#weighted();\nif(!items.length)return null;\nitems.sort((a,b)=>a.v-b.v);\nlet totalW=0;\nfor(const it of items)totalW+=it.w;\nconst target=Math.min(1,Math.max(0,p))*totalW;\nlet cum=0;\nfor(const it of items){\ncum+=it.w;\nif(cum>=target)return it.v;\n}\nreturn items[items.length-1].v;\n}\nrank(x){\nlet cum=0;\nfor(let h=0;h<this.#levels.length;h++){\nconst w=1<<h;\nfor(const v of this.#levels[h])if(v<=x)cum+=w;\n}\nreturn cum;\n}\n}\nconst SKETCH_BOUNDS=Object.freeze({\ndistinct:HyperLogLog.errorBoundFor(14),\nmedian:KLL.errorBoundFor(200),\np25:KLL.errorBoundFor(200),\np75:KLL.errorBoundFor(200),\np90:KLL.errorBoundFor(200),\np95:KLL.errorBoundFor(200),\np99:KLL.errorBoundFor(200),\niqr:KLL.errorBoundFor(200),\ntopK:Object.freeze({\nkind:'deterministic',metric:'absolute',value:0,\nstatement:'each count overestimates the truth by at most N/m; top-K exact when the K-th item exceeds N/m',\n}),\n});\nconst __default={\nWelford,Reservoir,HyperLogLog,SpaceSaving,KLL,hash32,SKETCH_BOUNDS,\n};\n});\n__def(\"packages/core/src/compute/statistics.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"KENDALL_LIMIT\",{enumerable:true,get:function(){return KENDALL_LIMIT;}});\nObject.defineProperty(__exports,\"MAINTENANCE\",{enumerable:true,get:function(){return MAINTENANCE;}});\nObject.defineProperty(__exports,\"APPROXIMATE\",{enumerable:true,get:function(){return APPROXIMATE;}});\nObject.defineProperty(__exports,\"maintenanceOf\",{enumerable:true,get:function(){return maintenanceOf;}});\nObject.defineProperty(__exports,\"numbers\",{enumerable:true,get:function(){return numbers;}});\nObject.defineProperty(__exports,\"frequencies\",{enumerable:true,get:function(){return frequencies;}});\nObject.defineProperty(__exports,\"herfindahl\",{enumerable:true,get:function(){return herfindahl;}});\nObject.defineProperty(__exports,\"entropy\",{enumerable:true,get:function(){return entropy;}});\nObject.defineProperty(__exports,\"evenness\",{enumerable:true,get:function(){return evenness;}});\nObject.defineProperty(__exports,\"topShare\",{enumerable:true,get:function(){return topShare;}});\nObject.defineProperty(__exports,\"gini\",{enumerable:true,get:function(){return gini;}});\nObject.defineProperty(__exports,\"moments\",{enumerable:true,get:function(){return moments;}});\nObject.defineProperty(__exports,\"quantileSorted\",{enumerable:true,get:function(){return quantileSorted;}});\nObject.defineProperty(__exports,\"quantile\",{enumerable:true,get:function(){return quantile;}});\nObject.defineProperty(__exports,\"STAT_FNS\",{enumerable:true,get:function(){return STAT_FNS;}});\nObject.defineProperty(__exports,\"STAT_LABELS\",{enumerable:true,get:function(){return STAT_LABELS;}});\nObject.defineProperty(__exports,\"weightedAverage\",{enumerable:true,get:function(){return weightedAverage;}});\nObject.defineProperty(__exports,\"extremeRow\",{enumerable:true,get:function(){return extremeRow;}});\nObject.defineProperty(__exports,\"correlation\",{enumerable:true,get:function(){return correlation;}});\nObject.defineProperty(__exports,\"trimmedMean\",{enumerable:true,get:function(){return trimmedMean;}});\nObject.defineProperty(__exports,\"winsorizedMean\",{enumerable:true,get:function(){return winsorizedMean;}});\nObject.defineProperty(__exports,\"modifiedZOutliers\",{enumerable:true,get:function(){return modifiedZOutliers;}});\nObject.defineProperty(__exports,\"jarqueBera\",{enumerable:true,get:function(){return jarqueBera;}});\nObject.defineProperty(__exports,\"weightedQuantile\",{enumerable:true,get:function(){return weightedQuantile;}});\nObject.defineProperty(__exports,\"pairs\",{enumerable:true,get:function(){return pairs;}});\nObject.defineProperty(__exports,\"covariance\",{enumerable:true,get:function(){return covariance;}});\nObject.defineProperty(__exports,\"regression\",{enumerable:true,get:function(){return regression;}});\nObject.defineProperty(__exports,\"spearman\",{enumerable:true,get:function(){return spearman;}});\nObject.defineProperty(__exports,\"kendall\",{enumerable:true,get:function(){return kendall;}});\nObject.defineProperty(__exports,\"seriesStats\",{enumerable:true,get:function(){return seriesStats;}});\nObject.defineProperty(__exports,\"D2_N2\",{enumerable:true,get:function(){return D2_N2;}});\nObject.defineProperty(__exports,\"D4_N2\",{enumerable:true,get:function(){return D4_N2;}});\nObject.defineProperty(__exports,\"movingRanges\",{enumerable:true,get:function(){return movingRanges;}});\nObject.defineProperty(__exports,\"withinSigma\",{enumerable:true,get:function(){return withinSigma;}});\nObject.defineProperty(__exports,\"capability\",{enumerable:true,get:function(){return capability;}});\nObject.defineProperty(__exports,\"controlLimits\",{enumerable:true,get:function(){return controlLimits;}});\nObject.defineProperty(__exports,\"westernElectricViolations\",{enumerable:true,get:function(){return westernElectricViolations;}});\nObject.defineProperty(__exports,\"nelsonViolations\",{enumerable:true,get:function(){return nelsonViolations;}});\nObject.defineProperty(__exports,\"CONTROL_RULE_SETS\",{enumerable:true,get:function(){return CONTROL_RULE_SETS;}});\nObject.defineProperty(__exports,\"controlViolations\",{enumerable:true,get:function(){return controlViolations;}});\nObject.defineProperty(__exports,\"countOutside\",{enumerable:true,get:function(){return countOutside;}});\nObject.defineProperty(__exports,\"histogram\",{enumerable:true,get:function(){return histogram;}});\nObject.defineProperty(__exports,\"DEFAULT_CONFIDENCE\",{enumerable:true,get:function(){return DEFAULT_CONFIDENCE;}});\nObject.defineProperty(__exports,\"meanInterval\",{enumerable:true,get:function(){return meanInterval;}});\nObject.defineProperty(__exports,\"proportionInterval\",{enumerable:true,get:function(){return proportionInterval;}});\nObject.defineProperty(__exports,\"slopeInterval\",{enumerable:true,get:function(){return slopeInterval;}});\nObject.defineProperty(__exports,\"capabilityInterval\",{enumerable:true,get:function(){return capabilityInterval;}});\nObject.defineProperty(__exports,\"standardizedMeanDifference\",{enumerable:true,get:function(){return standardizedMeanDifference;}});\nObject.defineProperty(__exports,\"normalTotalVariation\",{enumerable:true,get:function(){return normalTotalVariation;}});\nObject.defineProperty(__exports,\"frequencyMap\",{enumerable:true,get:function(){return frequencyMap;}});\nObject.defineProperty(__exports,\"categoricalDistance\",{enumerable:true,get:function(){return categoricalDistance;}});\nObject.defineProperty(__exports,\"SUBSET_RELIABILITY_FLOOR\",{enumerable:true,get:function(){return SUBSET_RELIABILITY_FLOOR;}});\nObject.defineProperty(__exports,\"compareColumn\",{enumerable:true,get:function(){return compareColumn;}});\nObject.defineProperty(__exports,\"isNumericColumn\",{enumerable:true,get:function(){return isNumericColumn;}});\nObject.defineProperty(__exports,\"populationRead\",{enumerable:true,get:function(){return populationRead;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst presenceReader=__m0[\"presenceReader\"];\nconst valueReader=__m0[\"valueReader\"];\nconst __m1=__req(\"packages/core/src/compute/special.js\");\nconst studentTQuantile=__m1[\"studentTQuantile\"];\nconst normalQuantile=__m1[\"normalQuantile\"];\nconst normalCdf=__m1[\"normalCdf\"];\nconst __m2=__req(\"packages/core/src/compute/sketch.js\");\nconst SKETCH_BOUNDS=__m2[\"SKETCH_BOUNDS\"];\nconst KENDALL_LIMIT=5000;\nconst MAINTENANCE=Object.freeze({\nvariance:'rescan',\nvarianceP:'rescan',\nstddev:'rescan',\nstddevP:'rescan',\nsumSquares:'rescan',\nweightedAvg:'rescan',\nmedian:'rescan',\np25:'rescan',\np75:'rescan',\np90:'rescan',\np95:'rescan',\np99:'rescan',\niqr:'rescan',\nmode:'rescan',\ndistinct:'rescan',\nrange:'rescan',\nskewness:'rescan',\nkurtosis:'rescan',\ngeomean:'rescan',\nharmean:'rescan',\nmad:'rescan',\nargmin:'rescan',\nargmax:'rescan',\nhhi:'rescan',\nentropy:'rescan',\nevenness:'rescan',\ntop3Share:'rescan',\ntop10Share:'rescan',\ngini:'rescan',\ntrimmedMean:'rescan',\nwinsorizedMean:'rescan',\nrobustOutliers:'rescan',\njarqueBera:'rescan',\npassRate:'rescan',\nfailureCount:'rescan',\n});\nconst APPROXIMATE=Object.freeze({\ndistinct:Object.freeze({sketch:'HyperLogLog',bound:SKETCH_BOUNDS.distinct}),\nmedian:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.median}),\np25:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p25}),\np75:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p75}),\np90:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p90}),\np95:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p95}),\np99:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p99}),\niqr:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.iqr}),\ntop3Share:Object.freeze({sketch:'SpaceSaving',bound:SKETCH_BOUNDS.topK}),\ntop10Share:Object.freeze({sketch:'SpaceSaving',bound:SKETCH_BOUNDS.topK}),\n});\nfunction maintenanceOf(fn){\nconst exact=fn==='sum'||fn==='avg'||fn==='countValues'||fn==='min'||fn==='max'\n?'maintained'\n:(Object.prototype.hasOwnProperty.call(MAINTENANCE,fn)?MAINTENANCE[fn]:null);\nconst approximate=Object.prototype.hasOwnProperty.call(APPROXIMATE,fn)?APPROXIMATE[fn]:null;\nreturn{stat:fn,exact,approximate};\n}\nfunction numbers(handle,indices){\nconst n=indices.length;\nconst out=new Float64Array(n);\nlet count=0;\nconst numeric=handle&&(handle.kind==='float64'||handle.kind==='int32');\nif(numeric){\nconst values=handle.values;\nconst present=presenceReader(handle);\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present&&present(row)!==1)continue;\nconst v=values[row];\nif(Number.isNaN(v))continue;\nout[count++]=v;\n}\nreturn out.subarray(0,count);\n}\nconst read=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nconst v=typeof raw==='number'?raw:Number(raw);\nif(!Number.isFinite(v))continue;\nout[count++]=v;\n}\nreturn out.subarray(0,count);\n}\nfunction frequencies(handle,indices){\nconst seen=new Map();\nconst read=valueReader(handle);\nlet total=0;\nfor(let i=0;i<indices.length;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nif(typeof raw==='number'&&Number.isNaN(raw))continue;\nconst key=typeof raw==='object'?String(raw):raw;\nseen.set(key,(seen.get(key)||0)+1);\ntotal++;\n}\nconst counts=[...seen.values()].sort((a,b)=>b-a);\nreturn{counts,total,distinct:counts.length};\n}\nfunction sharesOf(freq){\nreturn freq.total>0?freq.counts.map((c)=>c/freq.total):[];\n}\nfunction herfindahl(handle,indices){\nconst freq=frequencies(handle,indices);\nif(!freq.total)return null;\nlet sum=0;\nfor(const share of sharesOf(freq))sum+=share*share;\nreturn sum;\n}\nfunction entropy(handle,indices){\nconst freq=frequencies(handle,indices);\nif(!freq.total)return null;\nlet sum=0;\nfor(const share of sharesOf(freq))if(share>0)sum-=share*Math.log2(share);\nreturn sum;\n}\nfunction evenness(handle,indices){\nconst freq=frequencies(handle,indices);\nif(!freq.total||freq.distinct<2)return freq.total?1:null;\nlet sum=0;\nfor(const share of sharesOf(freq))if(share>0)sum-=share*Math.log2(share);\nreturn sum/Math.log2(freq.distinct);\n}\nfunction topShare(handle,indices,n=3){\nconst freq=frequencies(handle,indices);\nif(!freq.total)return null;\nconst take=Math.max(1,Math.floor(n));\nlet held=0;\nfor(let i=0;i<Math.min(take,freq.counts.length);i++)held+=freq.counts[i];\nreturn held/freq.total;\n}\nfunction gini(handle,indices){\nconst values=numbers(handle,indices);\nconst n=values.length;\nif(!n)return null;\nconst sorted=values.slice().sort();\nif(sorted[0]<0)return null;\nlet total=0;\nlet weighted=0;\nfor(let i=0;i<n;i++){\ntotal+=sorted[i];\nweighted+=(i+1)*sorted[i];\n}\nif(total===0)return 0;\nreturn(2*weighted)/(n*total)-(n+1)/n;\n}\nfunction moments(values){\nlet n=0;\nlet mean=0;\nlet m2=0;\nfor(let i=0;i<values.length;i++){\nconst x=values[i];\nn++;\nconst delta=x-mean;\nmean+=delta/n;\nm2+=delta*(x-mean);\n}\nreturn{n,mean,m2};\n}\nfunction quantileSorted(sorted,p){\nconst n=sorted.length;\nif(!n)return NaN;\nif(n===1)return sorted[0];\nconst h=(n-1)*Math.min(1,Math.max(0,p));\nconst lo=Math.floor(h);\nconst hi=Math.ceil(h);\nif(lo===hi)return sorted[lo];\nreturn sorted[lo]+(h-lo)*(sorted[hi]-sorted[lo]);\n}\nfunction quantile(values,p){\nif(!values.length)return NaN;\nconst sorted=values.slice().sort();\nreturn quantileSorted(sorted,p);\n}\nfunction specTally(handle,indices){\nconst read=valueReader(handle);\nlet pass=0;\nlet fail=0;\nlet warn=0;\nfor(let k=0;k<indices.length;k++){\nconst raw=read(indices[k]);\nif(raw===null||raw===undefined||raw==='')continue;\nconst token=String(raw).toUpperCase();\nif(token==='PASS')pass++;\nelse if(token==='FAIL')fail++;\nelse if(token==='WARN')warn++;\n}\nreturn{pass:pass+warn,fail,warn,judged:pass+warn+fail};\n}\nconst STAT_FNS=Object.freeze({\nhhi:(h,i)=>herfindahl(h,i),\nentropy:(h,i)=>entropy(h,i),\nevenness:(h,i)=>evenness(h,i),\ntop3Share:(h,i)=>topShare(h,i,3),\ntop10Share:(h,i)=>topShare(h,i,10),\ngini:(h,i)=>gini(h,i),\ntrimmedMean:(h,i)=>trimmedMean(numbers(h,i),0.1),\nwinsorizedMean:(h,i)=>winsorizedMean(numbers(h,i),0.1),\nrobustOutliers:(h,i)=>modifiedZOutliers(numbers(h,i),3.5),\njarqueBera:(h,i)=>jarqueBera(numbers(h,i)),\nvariance:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>1?m2/(n-1):null;\n},\nvarianceP:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>0?m2/n:null;\n},\nstddev:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>1?Math.sqrt(m2/(n-1)):null;\n},\nstddevP:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>0?Math.sqrt(m2/n):null;\n},\nmedian:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.5):null;\n},\np25:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.25):null;\n},\np75:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.75):null;\n},\np90:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.9):null;\n},\np95:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.95):null;\n},\np99:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.99):null;\n},\niqr:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nconst sorted=values.slice().sort();\nreturn quantileSorted(sorted,0.75)-quantileSorted(sorted,0.25);\n},\nmad:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nconst middle=quantile(values,0.5);\nconst deviations=new Float64Array(values.length);\nfor(let k=0;k<values.length;k++)deviations[k]=Math.abs(values[k]-middle);\nreturn quantile(deviations,0.5);\n},\nrange:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nlet lo=Infinity;\nlet hi=-Infinity;\nfor(let k=0;k<values.length;k++){\nif(values[k]<lo)lo=values[k];\nif(values[k]>hi)hi=values[k];\n}\nreturn hi-lo;\n},\ndistinct:(h,i)=>{\nconst read=valueReader(h);\nconst seen=new Set();\nfor(let k=0;k<i.length;k++){\nconst v=read(i[k]);\nif(v===null||v===undefined||v==='')continue;\nseen.add(v instanceof Date?v.getTime():v);\n}\nreturn seen.size;\n},\nmode:(h,i)=>{\nconst read=valueReader(h);\nconst counts=new Map();\nfor(let k=0;k<i.length;k++){\nconst v=read(i[k]);\nif(v===null||v===undefined||v==='')continue;\nconst id=v instanceof Date?v.getTime():v;\ncounts.set(id,(counts.get(id)||0)+1);\n}\nlet best=null;\nlet most=1;\nfor(const[value,times]of counts){\nif(times>most){\nmost=times;\nbest=value;\n}\n}\nreturn best;\n},\nskewness:(h,i)=>{\nconst values=numbers(h,i);\nconst{n,mean,m2}=moments(values);\nif(n<3||m2<=0)return null;\nconst sd=Math.sqrt(m2/(n-1));\nlet sum=0;\nfor(let k=0;k<values.length;k++)sum+=((values[k]-mean)/sd)**3;\nreturn(n/((n-1)*(n-2)))*sum;\n},\nkurtosis:(h,i)=>{\nconst values=numbers(h,i);\nconst{n,mean,m2}=moments(values);\nif(n<4||m2<=0)return null;\nconst sd=Math.sqrt(m2/(n-1));\nlet sum=0;\nfor(let k=0;k<values.length;k++)sum+=((values[k]-mean)/sd)**4;\nconst a=(n*(n+1))/((n-1)*(n-2)*(n-3));\nconst b=(3*(n-1)**2)/((n-2)*(n-3));\nreturn a*sum-b;\n},\ngeomean:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nlet sum=0;\nfor(let k=0;k<values.length;k++){\nif(values[k]<=0)return null;\nsum+=Math.log(values[k]);\n}\nreturn Math.exp(sum/values.length);\n},\nharmean:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nlet sum=0;\nfor(let k=0;k<values.length;k++){\nif(values[k]===0)return null;\nsum+=1/values[k];\n}\nreturn values.length/sum;\n},\nsumSquares:(h,i)=>{\nconst values=numbers(h,i);\nlet sum=0;\nfor(let k=0;k<values.length;k++)sum+=values[k]*values[k];\nreturn sum;\n},\npassRate:(h,i)=>{\nconst{pass,judged}=specTally(h,i);\nreturn judged?pass/judged:null;\n},\nfailureCount:(h,i)=>specTally(h,i).fail,\n});\nconst STAT_LABELS=Object.freeze({\nhhi:'Concentration (HHI)',\nentropy:'Entropy',\nevenness:'Evenness',\ntop3Share:'Top 3 share',\ntop10Share:'Top 10 share',\ngini:'Gini coefficient',\ntrimmedMean:'Trimmed mean',\nwinsorizedMean:'Winsorized mean',\nrobustOutliers:'Outliers (robust)',\njarqueBera:'Jarque–Bera',\nmedian:'Median',\np25:'25th percentile',\np75:'75th percentile',\np90:'90th percentile',\np95:'95th percentile',\np99:'99th percentile',\niqr:'Interquartile range',\nmad:'Median absolute deviation',\nvariance:'Variance',\nvarianceP:'Variance (population)',\nstddev:'Standard deviation',\nstddevP:'Standard deviation (population)',\nrange:'Range',\ndistinct:'Distinct',\nmode:'Mode',\nskewness:'Skewness',\nkurtosis:'Kurtosis',\ngeomean:'Geometric mean',\nharmean:'Harmonic mean',\nsumSquares:'Sum of squares',\nweightedAvg:'Weighted average',\nargmin:'Lowest by',\nargmax:'Highest by',\npassRate:'Pass rate',\nfailureCount:'Failures',\n});\nfunction weightedAverage(handle,weights,indices){\nconst readValue=valueReader(handle);\nconst readWeight=valueReader(weights);\nlet top=0;\nlet bottom=0;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst value=Number(readValue(row));\nconst weight=Number(readWeight(row));\nif(!Number.isFinite(value)||!Number.isFinite(weight))continue;\ntop+=value*weight;\nbottom+=weight;\n}\nreturn bottom===0?null:top/bottom;\n}\nfunction extremeRow(handle,indices,largest){\nconst read=valueReader(handle);\nlet best=null;\nlet bestValue=largest?-Infinity:Infinity;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst value=Number(read(row));\nif(!Number.isFinite(value))continue;\nif(largest?value>bestValue:value<bestValue){\nbestValue=value;\nbest=row;\n}\n}\nreturn best;\n}\nfunction correlation(a,b,indices){\nconst readA=valueReader(a);\nconst readB=valueReader(b);\nlet n=0;\nlet sx=0;\nlet sy=0;\nlet sxx=0;\nlet syy=0;\nlet sxy=0;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst x=Number(readA(row));\nconst y=Number(readB(row));\nif(!Number.isFinite(x)||!Number.isFinite(y))continue;\nn++;\nsx+=x;\nsy+=y;\nsxx+=x*x;\nsyy+=y*y;\nsxy+=x*y;\n}\nif(n<2)return null;\nconst top=n*sxy-sx*sy;\nconst bottom=Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));\nif(bottom===0)return null;\nconst r=top/bottom;\nreturn Math.max(-1,Math.min(1,r));\n}\nfunction trimmedMean(values,share=0.1){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values).sort((a,b)=>a-b);\nconst cut=Math.floor(n*Math.min(0.49,Math.max(0,share)));\nconst kept=sorted.slice(cut,n-cut);\nif(!kept.length)return quantileSorted(sorted,0.5);\nlet sum=0;\nfor(const v of kept)sum+=v;\nreturn sum/kept.length;\n}\nfunction winsorizedMean(values,share=0.1){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values).sort((a,b)=>a-b);\nconst cut=Math.floor(n*Math.min(0.49,Math.max(0,share)));\nconst low=sorted[cut];\nconst high=sorted[n-1-cut];\nlet sum=0;\nfor(const v of sorted)sum+=Math.min(high,Math.max(low,v));\nreturn sum/n;\n}\nfunction modifiedZOutliers(values,threshold=3.5){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values).sort((a,b)=>a-b);\nconst middle=quantileSorted(sorted,0.5);\nconst deviations=sorted.map((v)=>Math.abs(v-middle)).sort((a,b)=>a-b);\nconst mad=quantileSorted(deviations,0.5);\nif(mad===0)return null;\nlet count=0;\nfor(const v of sorted)if(Math.abs((0.6745*(v-middle))/mad)>threshold)count++;\nreturn count;\n}\nfunction jarqueBera(values){\nconst n=values.length;\nif(n<8)return null;\nlet mean=0;\nfor(const v of values)mean+=v;\nmean/=n;\nlet m2=0;\nlet m3=0;\nlet m4=0;\nfor(const v of values){\nconst d=v-mean;\nm2+=d*d;\nm3+=d*d*d;\nm4+=d*d*d*d;\n}\nm2/=n;\nm3/=n;\nm4/=n;\nif(m2===0)return null;\nconst skew=m3/m2**1.5;\nconst excess=m4/(m2*m2)-3;\nreturn(n/6)*(skew*skew+(excess*excess)/4);\n}\nfunction weightedQuantile(values,weights,p){\nconst paired=[];\nlet total=0;\nfor(let i=0;i<values.length;i++){\nconst v=Number(values[i]);\nconst w=Number(weights[i]);\nif(!Number.isFinite(v)||!Number.isFinite(w)||w<=0)continue;\npaired.push([v,w]);\ntotal+=w;\n}\nif(!paired.length||total<=0)return null;\npaired.sort((a,b)=>a[0]-b[0]);\nif(paired.length===1)return paired[0][0];\nconst at=[];\nlet seen=0;\nfor(const[,w]of paired){\nat.push((seen+w/2)/total);\nseen+=w;\n}\nconst target=Math.max(0,Math.min(1,p));\nif(target<=at[0])return paired[0][0];\nif(target>=at[at.length-1])return paired[paired.length-1][0];\nfor(let i=1;i<at.length;i++){\nif(target>at[i])continue;\nconst span=at[i]-at[i-1];\nconst within=span>0?(target-at[i-1])/span:0;\nreturn paired[i-1][0]+(paired[i][0]-paired[i-1][0])*within;\n}\nreturn paired[paired.length-1][0];\n}\nfunction pairs(a,b,indices){\nconst readA=valueReader(a);\nconst readB=valueReader(b);\nconst xs=new Float64Array(indices.length);\nconst ys=new Float64Array(indices.length);\nlet n=0;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst x=Number(readA(row));\nconst y=Number(readB(row));\nif(!Number.isFinite(x)||!Number.isFinite(y))continue;\nxs[n]=x;\nys[n]=y;\nn++;\n}\nreturn{xs:xs.subarray(0,n),ys:ys.subarray(0,n),n};\n}\nfunction covariance(a,b,indices,population=false){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2)return null;\nlet mx=0;\nlet my=0;\nfor(let i=0;i<n;i++){mx+=xs[i];my+=ys[i];}\nmx/=n;\nmy/=n;\nlet sum=0;\nfor(let i=0;i<n;i++)sum+=(xs[i]-mx)*(ys[i]-my);\nreturn sum/(population?n:n-1);\n}\nfunction regression(a,b,indices){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2)return null;\nlet mx=0;\nlet my=0;\nfor(let i=0;i<n;i++){mx+=xs[i];my+=ys[i];}\nmx/=n;\nmy/=n;\nlet sxx=0;\nlet sxy=0;\nlet syy=0;\nfor(let i=0;i<n;i++){\nconst dx=xs[i]-mx;\nconst dy=ys[i]-my;\nsxx+=dx*dx;\nsxy+=dx*dy;\nsyy+=dy*dy;\n}\nif(sxx===0)return null;\nconst slope=sxy/sxx;\nconst intercept=my-slope*mx;\nconst r2=syy===0?1:Math.max(0,Math.min(1,(sxy*sxy)/(sxx*syy)));\nconst residual=Math.max(0,syy-slope*sxy);\nconst stdError=n>2?Math.sqrt(residual/(n-2)/sxx):0;\nreturn{slope,intercept,r2,stdError,n};\n}\nfunction ranksOf(values){\nconst n=values.length;\nconst order=Array.from({length:n},(unused,i)=>i)\n.sort((i,j)=>values[i]-values[j]);\nconst ranks=new Float64Array(n);\nlet i=0;\nwhile(i<n){\nlet j=i;\nwhile(j+1<n&&values[order[j+1]]===values[order[i]])j++;\nconst shared=(i+j)/2+1;\nfor(let k=i;k<=j;k++)ranks[order[k]]=shared;\ni=j+1;\n}\nreturn ranks;\n}\nfunction spearman(a,b,indices){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2)return null;\nconst rx=ranksOf(xs);\nconst ry=ranksOf(ys);\nlet mx=0;\nlet my=0;\nfor(let i=0;i<n;i++){mx+=rx[i];my+=ry[i];}\nmx/=n;\nmy/=n;\nlet sxy=0;\nlet sxx=0;\nlet syy=0;\nfor(let i=0;i<n;i++){\nconst dx=rx[i]-mx;\nconst dy=ry[i]-my;\nsxy+=dx*dy;\nsxx+=dx*dx;\nsyy+=dy*dy;\n}\nif(sxx===0||syy===0)return null;\nreturn Math.max(-1,Math.min(1,sxy/Math.sqrt(sxx*syy)));\n}\nfunction kendall(a,b,indices){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2||n>KENDALL_LIMIT)return null;\nlet concordant=0;\nlet discordant=0;\nlet tiedXOnly=0;\nlet tiedYOnly=0;\nfor(let i=0;i<n;i++){\nfor(let j=i+1;j<n;j++){\nconst dx=Math.sign(xs[i]-xs[j]);\nconst dy=Math.sign(ys[i]-ys[j]);\nconst product=dx*dy;\nif(product>0)concordant++;\nelse if(product<0)discordant++;\nelse if(dx===0&&dy===0){}\nelse if(dx===0)tiedXOnly++;\nelse tiedYOnly++;\n}\n}\nconst orderedByX=concordant+discordant+tiedYOnly;\nconst orderedByY=concordant+discordant+tiedXOnly;\nif(orderedByX===0||orderedByY===0)return null;\nreturn(concordant-discordant)/Math.sqrt(orderedByX*orderedByY);\n}\nfunction seriesStats(ordered,opts={}){\nconst n=ordered.length;\nif(n<2)return null;\nconst first=ordered[0];\nconst last=ordered[n-1];\nconst returns=[];\nfor(let i=1;i<n;i++){\nconst previous=ordered[i-1];\nif(previous===0)continue;\nreturns.push((ordered[i]-previous)/Math.abs(previous));\n}\nlet volatility=null;\nif(returns.length>1){\nlet mean=0;\nfor(const r of returns)mean+=r;\nmean/=returns.length;\nlet m2=0;\nfor(const r of returns)m2+=(r-mean)**2;\nvolatility=Math.sqrt(m2/(returns.length-1));\n}\nconst periods=Number(opts.periodsPerYear)>0?Number(opts.periodsPerYear):null;\nlet peak=ordered[0];\nlet peakAt=0;\nlet worst=0;\nlet worstFrom=0;\nlet worstTo=0;\nfor(let i=1;i<n;i++){\nif(ordered[i]>peak){peak=ordered[i];peakAt=i;continue;}\nif(peak<=0)continue;\nconst fall=(peak-ordered[i])/peak;\nif(fall>worst){worst=fall;worstFrom=peakAt;worstTo=i;}\n}\nlet autocorrelation=null;\nif(n>2){\nlet mean=0;\nfor(let i=0;i<n;i++)mean+=ordered[i];\nmean/=n;\nlet top=0;\nlet bottom=0;\nfor(let i=0;i<n;i++){\nconst d=ordered[i]-mean;\nbottom+=d*d;\nif(i>0)top+=d*(ordered[i-1]-mean);\n}\nautocorrelation=bottom>0?top/bottom:null;\n}\nlet up=0;\nlet down=0;\nfor(const r of returns){if(r>0)up++;else if(r<0)down++;}\nlet growth=null;\nif(first>0&&last>0){\nconst perPeriod=(last/first)**(1/(n-1))-1;\ngrowth=periods?(1+perPeriod)**periods-1:perPeriod;\n}\nreturn{\nn,\nfirst,\nlast,\nchange:last-first,\nchangePercent:first===0?null:((last-first)/Math.abs(first))*100,\nvolatility,\nannualisedVolatility:volatility!==null&&periods?volatility*Math.sqrt(periods):null,\ngrowth,\nmaxDrawdown:worst,\nmaxDrawdownFrom:worstFrom,\nmaxDrawdownTo:worstTo,\nautocorrelation,\nupDays:up,\ndownDays:down,\n};\n}\nconst D2_N2=1.128;\nconst D4_N2=3.267;\nfunction movingRanges(ordered){\nconst n=ordered.length;\nif(n<2)return null;\nconst ranges=[];\nfor(let i=1;i<n;i++)ranges.push(Math.abs(ordered[i]-ordered[i-1]));\nconst centre=ranges.reduce((t,r)=>t+r,0)/ranges.length;\nreturn{ranges,centre,upper:D4_N2*centre,lower:0};\n}\nfunction withinSigma(ordered){\nconst n=ordered.length;\nif(n<2)return null;\nlet total=0;\nfor(let i=1;i<n;i++)total+=Math.abs(ordered[i]-ordered[i-1]);\nconst meanRange=total/(n-1);\nreturn{sigma:meanRange/D2_N2,meanRange};\n}\nfunction capability(ordered,spec){\nconst n=ordered.length;\nif(n<2||!spec)return null;\nconst lower=Number.isFinite(Number(spec.lower))?Number(spec.lower):null;\nconst upper=Number.isFinite(Number(spec.upper))?Number(spec.upper):null;\nif(lower===null&&upper===null)return null;\nlet mean=0;\nfor(let i=0;i<n;i++)mean+=ordered[i];\nmean/=n;\nlet m2=0;\nfor(let i=0;i<n;i++)m2+=(ordered[i]-mean)**2;\nconst overall=Math.sqrt(m2/(n-1));\nconst within=withinSigma(ordered);\nconst sigmaWithin=within?within.sigma:null;\nconst indices=(sigma)=>{\nif(!sigma||sigma<=0)return{index:null,k:null};\nconst both=lower!==null&&upper!==null;\nconst index=both?(upper-lower)/(6*sigma):null;\nconst upperSide=upper!==null?(upper-mean)/(3*sigma):Infinity;\nconst lowerSide=lower!==null?(mean-lower)/(3*sigma):Infinity;\nreturn{index,k:Math.min(upperSide,lowerSide)};\n};\nconst short=indices(sigmaWithin);\nconst long=indices(overall);\nlet outOfSpec=0;\nfor(let i=0;i<n;i++){\nif(lower!==null&&ordered[i]<lower){outOfSpec++;continue;}\nif(upper!==null&&ordered[i]>upper)outOfSpec++;\n}\nreturn{\nn,\nmean,\nlower,\nupper,\ntarget:Number.isFinite(Number(spec.target))?Number(spec.target):null,\nsigmaWithin,\nsigmaOverall:overall,\ncp:short.index,\ncpk:short.k,\npp:long.index,\nppk:long.k,\noutOfSpec,\ndefectRate:n?outOfSpec/n:null,\n};\n}\nfunction controlLimits(ordered){\nconst n=ordered.length;\nif(n<2)return null;\nconst within=withinSigma(ordered);\nif(!within||!(within.sigma>0))return null;\nlet centre=0;\nfor(let i=0;i<n;i++)centre+=ordered[i];\ncentre/=n;\nreturn{\ncentre,\nsigma:within.sigma,\nupper:centre+3*within.sigma,\nlower:centre-3*within.sigma,\n};\n}\nfunction westernElectricViolations(ordered,limits){\nif(!limits||!(limits.sigma>0))return[];\nconst n=ordered.length;\nconst{centre,sigma}=limits;\nconst z=(i)=>(ordered[i]-centre)/sigma;\nconst out=[];\nfor(let i=0;i<n;i++){\nif(Math.abs(z(i))>3){\nout.push({index:i,rule:1,description:'beyond three sigma'});\n}\nif(i>=2){\nfor(const side of[1,-1]){\nlet hits=0;\nfor(let k=i-2;k<=i;k++)if(z(k)*side>2)hits++;\nif(hits>=2){\nout.push({index:i,rule:2,description:'two of three past two sigma'});\nbreak;\n}\n}\n}\nif(i>=4){\nfor(const side of[1,-1]){\nlet hits=0;\nfor(let k=i-4;k<=i;k++)if(z(k)*side>1)hits++;\nif(hits>=4){\nout.push({index:i,rule:3,description:'four of five past one sigma'});\nbreak;\n}\n}\n}\nif(i>=7){\nfor(const side of[1,-1]){\nlet all=true;\nfor(let k=i-7;k<=i;k++)if(z(k)*side<=0){all=false;break;}\nif(all){\nout.push({index:i,rule:4,description:'eight in a row on one side'});\nbreak;\n}\n}\n}\n}\nreturn out;\n}\nfunction nelsonViolations(ordered,limits){\nif(!limits||!(limits.sigma>0))return[];\nconst n=ordered.length;\nconst{centre,sigma}=limits;\nconst z=(i)=>(ordered[i]-centre)/sigma;\nconst oneSide=(from,to,past,need)=>{\nfor(const side of[1,-1]){\nlet hits=0;\nfor(let k=from;k<=to;k++)if(z(k)*side>past)hits++;\nif(hits>=need)return true;\n}\nreturn false;\n};\nconst out=[];\nfor(let i=0;i<n;i++){\nif(Math.abs(z(i))>3)out.push({index:i,rule:1,description:'beyond three sigma'});\nif(i>=8){\nfor(const side of[1,-1]){\nlet all=true;\nfor(let k=i-8;k<=i;k++)if(z(k)*side<=0){all=false;break;}\nif(all){out.push({index:i,rule:2,description:'nine in a row on one side'});break;}\n}\n}\nif(i>=5){\nfor(const dir of[1,-1]){\nlet all=true;\nfor(let k=i-4;k<=i;k++){\nif((ordered[k]-ordered[k-1])*dir<=0){all=false;break;}\n}\nif(all){\nout.push({index:i,rule:3,description:dir>0?'six rising':'six falling'});\nbreak;\n}\n}\n}\nif(i>=13){\nlet alternating=true;\nfor(let k=i-12;k<=i;k++){\nconst a=ordered[k]-ordered[k-1];\nconst b=ordered[k+1<=i?k+1:k]-ordered[k];\nif(k+1>i)break;\nif(a===0||b===0||(a>0)===(b>0)){alternating=false;break;}\n}\nif(alternating)out.push({index:i,rule:4,description:'fourteen alternating'});\n}\nif(i>=2&&oneSide(i-2,i,2,2)){\nout.push({index:i,rule:5,description:'two of three past two sigma'});\n}\nif(i>=4&&oneSide(i-4,i,1,4)){\nout.push({index:i,rule:6,description:'four of five past one sigma'});\n}\nif(i>=14){\nlet inside=true;\nfor(let k=i-14;k<=i;k++)if(Math.abs(z(k))>=1){inside=false;break;}\nif(inside)out.push({index:i,rule:7,description:'fifteen within one sigma'});\n}\nif(i>=7){\nlet outside=true;\nfor(let k=i-7;k<=i;k++)if(Math.abs(z(k))<=1){outside=false;break;}\nif(outside)out.push({index:i,rule:8,description:'eight beyond one sigma'});\n}\n}\nreturn out;\n}\nconst CONTROL_RULE_SETS=Object.freeze(['westernElectric','nelson']);\nfunction controlViolations(ordered,limits,ruleSet='westernElectric'){\nreturn String(ruleSet)==='nelson'\n?nelsonViolations(ordered,limits)\n:westernElectricViolations(ordered,limits);\n}\nfunction countOutside(values,low,high){\nlet count=0;\nfor(let i=0;i<values.length;i++){\nif(values[i]<low||values[i]>high)count++;\n}\nreturn count;\n}\nfunction histogram(sorted,q1,q3,cap=20){\nconst n=sorted.length;\nif(!n)return[];\nconst min=sorted[0];\nconst max=sorted[n-1];\nif(max===min)return[{from:min,to:max,count:n}];\nconst iqr=q3-q1;\nconst fence=1.5*iqr;\nlet lo=iqr>0?Math.max(min,q1-fence):min;\nlet hi=iqr>0?Math.min(max,q3+fence):max;\nif(!(hi>lo)){lo=min;hi=max;}\nconst width=iqr>0?(2*iqr)/Math.cbrt(n):(hi-lo)/(Math.ceil(Math.log2(n))+1);\nconst count=width>0\n?Math.min(cap,Math.max(1,Math.ceil((hi-lo)/width)))\n:1;\nconst step=(hi-lo)/count;\nconst bins=[];\nfor(let i=0;i<count;i++){\nbins.push({from:lo+i*step,to:lo+(i+1)*step,count:0});\n}\nfor(let i=0;i<n;i++){\nconst at=Math.min(count-1,Math.max(0,Math.floor((sorted[i]-lo)/step)));\nbins[at].count++;\n}\nbins[0].from=min;\nbins[count-1].to=max;\nreturn bins;\n}\nconst DEFAULT_CONFIDENCE=0.95;\nfunction level(conf){\nconst c=Number(conf);\nreturn Number.isFinite(c)&&c>0&&c<1?c:DEFAULT_CONFIDENCE;\n}\nfunction meanInterval(values,conf=DEFAULT_CONFIDENCE){\nconst n=values.length;\nif(n<2)return null;\nlet sum=0;\nfor(let i=0;i<n;i++)sum+=values[i];\nconst mean=sum/n;\nlet ss=0;\nfor(let i=0;i<n;i++){const d=values[i]-mean;ss+=d*d;}\nconst sd=Math.sqrt(ss/(n-1));\nconst c=level(conf);\nconst t=studentTQuantile(1-(1-c)/2,n-1);\nconst margin=(t*sd)/Math.sqrt(n);\nreturn{mean,lower:mean-margin,upper:mean+margin,margin,n,confidence:c};\n}\nfunction proportionInterval(successes,n,conf=DEFAULT_CONFIDENCE){\nconst k=Number(successes);\nconst total=Number(n);\nif(!(total>0)||!(k>=0)||k>total)return null;\nconst c=level(conf);\nconst z=normalQuantile(1-(1-c)/2);\nconst p=k/total;\nconst z2=z*z;\nconst denominator=1+z2/total;\nconst centre=(p+z2/(2*total))/denominator;\nconst half=(z/denominator)\n*Math.sqrt((p*(1-p))/total+z2/(4*total*total));\nreturn{\nproportion:p,\nlower:Math.max(0,centre-half),\nupper:Math.min(1,centre+half),\nn:total,\nconfidence:c,\n};\n}\nfunction slopeInterval(fit,conf=DEFAULT_CONFIDENCE){\nif(!fit||!(fit.n>2)||!Number.isFinite(fit.stdError))return null;\nconst c=level(conf);\nconst t=studentTQuantile(1-(1-c)/2,fit.n-2);\nconst margin=t*fit.stdError;\nreturn{\nslope:fit.slope,\nlower:fit.slope-margin,\nupper:fit.slope+margin,\nmargin,\nconfidence:c,\n};\n}\nfunction capabilityInterval(index,n,conf=DEFAULT_CONFIDENCE){\nconst k=Number(index);\nconst count=Number(n);\nif(!Number.isFinite(k)||!(count>1))return null;\nconst c=level(conf);\nconst z=normalQuantile(1-(1-c)/2);\nconst margin=z*Math.sqrt(1/(9*count)+(k*k)/(2*(count-1)));\nreturn{index:k,lower:k-margin,upper:k+margin,margin,n:count,confidence:c};\n}\nfunction standardizedMeanDifference(population,subsetMean){\nif(!population||!(population.sd>0))return null;\nif(!Number.isFinite(subsetMean)||!Number.isFinite(population.mean))return null;\nreturn(subsetMean-population.mean)/population.sd;\n}\nfunction normalTotalVariation(d){\nif(!Number.isFinite(d))return 0;\nreturn Math.min(1,Math.max(0,2*normalCdf(Math.abs(d)/2)-1));\n}\nfunction frequencyMap(handle,indices){\nconst map=new Map();\nconst read=valueReader(handle);\nlet total=0;\nfor(let i=0;i<indices.length;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nif(typeof raw==='number'&&Number.isNaN(raw))continue;\nconst key=raw instanceof Date?raw.getTime()\n:(typeof raw==='object'?String(raw):raw);\nmap.set(key,(map.get(key)||0)+1);\ntotal++;\n}\nreturn{map,total};\n}\nfunction categoricalDistance(subset,subsetTotal,population,populationTotal){\nif(!(subsetTotal>0)||!(populationTotal>0))return null;\nlet sum=0;\nconst keys=new Set(subset.keys());\nfor(const k of population.keys())keys.add(k);\nfor(const k of keys){\nconst a=(subset.get(k)||0)/subsetTotal;\nconst b=(population.get(k)||0)/populationTotal;\nsum+=Math.abs(a-b);\n}\nreturn sum/2;\n}\nconst SUBSET_RELIABILITY_FLOOR=10;\nfunction compareColumn(handle,subsetIndices,populationStats){\nconst numeric=populationStats&&populationStats.numeric;\nif(numeric){\nconst values=numbers(handle,subsetIndices);\nconst{n,mean}=moments(values);\nconst d=n>0\n?standardizedMeanDifference(\n{mean:populationStats.mean,sd:populationStats.sd},mean,\n)\n:null;\nreturn{\nmeasure:'standardizedMeanDifference',\nmagnitude:d,\ndistance:d===null?0:normalTotalVariation(d),\ndirection:d===null?0:Math.sign(d),\nsubsetN:n,\npopulationN:populationStats.n||0,\nreliable:n>=SUBSET_RELIABILITY_FLOOR,\n};\n}\nconst{map,total}=frequencyMap(handle,subsetIndices);\nconst tvd=categoricalDistance(map,total,populationStats.map,populationStats.total);\nreturn{\nmeasure:'categoricalTotalVariation',\nmagnitude:tvd,\ndistance:tvd===null?0:tvd,\ndirection:0,\nsubsetN:total,\npopulationN:populationStats.total||0,\nreliable:total>=SUBSET_RELIABILITY_FLOOR,\n};\n}\nfunction isNumericColumn(handle,indices){\nif(handle&&(handle.kind==='float64'||handle.kind==='int32'))return true;\nconst read=valueReader(handle);\nlet seen=0;\nlet numeric=0;\nfor(let i=0;i<indices.length&&seen<200;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nif(raw instanceof Date)return false;\nseen++;\nconst v=typeof raw==='number'?raw:Number(raw);\nif(Number.isFinite(v))numeric++;\n}\nif(seen===0)return false;\nreturn numeric/seen>=0.9;\n}\nfunction populationRead(handle,populationIndices){\nif(isNumericColumn(handle,populationIndices)){\nconst values=numbers(handle,populationIndices);\nconst{n,mean,m2}=moments(values);\nreturn{numeric:true,mean,sd:n>0?Math.sqrt(m2/n):0,n};\n}\nconst{map,total}=frequencyMap(handle,populationIndices);\nreturn{numeric:false,map,total};\n}\n});\n__def(\"packages/core/src/compute/total.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"TOTAL_FNS\",{enumerable:true,get:function(){return TOTAL_FNS;}});\nObject.defineProperty(__exports,\"TOTAL_LABELS\",{enumerable:true,get:function(){return TOTAL_LABELS;}});\nObject.defineProperty(__exports,\"totalLabel\",{enumerable:true,get:function(){return totalLabel;}});\nObject.defineProperty(__exports,\"aggregatesFor\",{enumerable:true,get:function(){return aggregatesFor;}});\nObject.defineProperty(__exports,\"aggregateAllowed\",{enumerable:true,get:function(){return aggregateAllowed;}});\nObject.defineProperty(__exports,\"collectValues\",{enumerable:true,get:function(){return collectValues;}});\nObject.defineProperty(__exports,\"total\",{enumerable:true,get:function(){return total;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst isFunction=__m0[\"isFunction\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst __m1=__req(\"packages/core/src/compute/handle.js\");\nconst presenceReader=__m1[\"presenceReader\"];\nconst valueComparator=__m1[\"valueComparator\"];\nconst valueReader=__m1[\"valueReader\"];\nconst __m2=__req(\"packages/core/src/compute/statistics.js\");\nconst STAT_FNS=__m2[\"STAT_FNS\"];\nconst STAT_LABELS=__m2[\"STAT_LABELS\"];\nfunction isNumericBacking(handle){\nreturn!!handle&&(handle.kind==='float64'||handle.kind==='int32');\n}\nfunction sum(handle,indices){\nconst n=indices.length;\nlet acc=0;\nif(isNumericBacking(handle)){\nconst values=handle.values;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<n;i++){\nconst v=values[indices[i]];\nif(!Number.isNaN(v))acc+=v;\n}\nreturn acc;\n}\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present(row)===1){\nconst v=values[row];\nif(!Number.isNaN(v))acc+=v;\n}\n}\nreturn acc;\n}\nconst read=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst v=numberOf(read(indices[i]));\nif(v!==null)acc+=v;\n}\nreturn acc;\n}\nsum.kernel=true;\nfunction countValues(handle,indices){\nconst n=indices.length;\nlet count=0;\nif(isNumericBacking(handle)){\nconst values=handle.values;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<n;i++)if(!Number.isNaN(values[indices[i]]))count++;\nreturn count;\n}\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present(row)===1&&!Number.isNaN(values[row]))count++;\n}\nreturn count;\n}\nconst read=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst v=read(indices[i]);\nif(v!==null&&v!==undefined&&!(typeof v==='number'&&Number.isNaN(v)))count++;\n}\nreturn count;\n}\ncountValues.kernel=true;\nfunction count(handle,indices){\nreturn indices.length;\n}\ncount.kernel=true;\nfunction avg(handle,indices){\nconst values=countValues(handle,indices);\nif(values===0)return null;\nreturn sum(handle,indices)/values;\n}\navg.kernel=true;\nfunction extreme(handle,indices,direction,locale){\nconst n=indices.length;\nif(isNumericBacking(handle)){\nconst values=handle.values;\nconst present=presenceReader(handle);\nlet best=null;\nif(!present){\nfor(let i=0;i<n;i++){\nconst v=values[indices[i]];\nif(Number.isNaN(v))continue;\nif(best===null||(direction<0?v<best:v>best))best=v;\n}\nreturn best;\n}\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present(row)===0)continue;\nconst v=values[row];\nif(Number.isNaN(v))continue;\nif(best===null||(direction<0?v<best:v>best))best=v;\n}\nreturn best;\n}\nconst read=valueReader(handle);\nconst cmp=valueComparator(locale);\nlet best=null;\nfor(let i=0;i<n;i++){\nconst v=read(indices[i]);\nif(v===null||v===undefined||(typeof v==='number'&&Number.isNaN(v)))continue;\nif(best===null||(direction<0?cmp(v,best)<0:cmp(v,best)>0))best=v;\n}\nreturn best;\n}\nfunction min(handle,indices,ctx){\nreturn extreme(handle,indices,-1,ctx&&ctx.locale);\n}\nmin.kernel=true;\nfunction max(handle,indices,ctx){\nreturn extreme(handle,indices,1,ctx&&ctx.locale);\n}\nmax.kernel=true;\nfunction first(handle,indices){\nif(indices.length===0)return null;\nreturn valueReader(handle)(indices[0]);\n}\nfirst.kernel=true;\nfunction last(handle,indices){\nif(indices.length===0)return null;\nreturn valueReader(handle)(indices[indices.length-1]);\n}\nlast.kernel=true;\nfunction numberOf(v){\nif(typeof v==='number')return Number.isNaN(v)?null:v;\nif(v===null||v===undefined||v===''||typeof v==='boolean')return null;\nif(v instanceof Date)return v.getTime();\nconst n=Number(v);\nreturn Number.isNaN(n)?null:n;\n}\nconst TOTAL_FNS={\nsum,min,max,avg,count,first,last,countValues,\n...STAT_FNS,\n};\nconst TOTAL_LABELS=Object.freeze({\n...STAT_LABELS,\nsum:'Sum',\navg:'Average',\nmin:'Min',\nmax:'Max',\ncount:'Count',\ncountValues:'Count of values',\nfirst:'First',\nlast:'Last',\n});\nfunction totalLabel(fn){\nif(!fn)return'';\nif(typeof fn==='string')return TOTAL_LABELS[fn]||fn;\nreturn'Total';\n}\nconst CHOOSER_ORDER=Object.freeze([\n'sum','avg','min','max','count','countValues','first','last',\n]);\nfunction aggregatesFor(column){\nconst supported=column&&column.dataType\n&&column.dataType.totals&&column.dataType.totals.supported;\nif(Array.isArray(supported))return supported.slice();\nconst named=CHOOSER_ORDER.filter((name)=>name in TOTAL_FNS);\nfor(const name of Object.keys(TOTAL_FNS))if(!named.includes(name))named.push(name);\nreturn named;\n}\nfunction aggregateAllowed(column,name){\nif(typeof name!=='string')return true;\nreturn aggregatesFor(column).includes(name);\n}\nfunction collectValues(handle,indices){\nconst read=valueReader(handle);\nconst out=[];\nfor(let i=0;i<indices.length;i++){\nconst v=read(indices[i]);\nif(v===null||v===undefined)continue;\nout.push(v);\n}\nreturn out;\n}\nfunction total(handle,indices,fn,ctx){\nconst list=indices||[];\nif(typeof fn==='string'){\nconst kernel=TOTAL_FNS[fn];\nif(!kernel){\nwarnOnce(`total:${fn}`,`unknown total function \"${fn}\"; register it in config.totalFns`);\nreturn null;\n}\nreturn kernel(handle,list,ctx);\n}\nif(isFunction(fn)){\nif(fn.kernel===true)return fn(handle,list,ctx);\nreturn fn(collectValues(handle,list),ctx||{});\n}\nreturn null;\n}\n});\n__def(\"packages/core/src/compute/pivot.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"KEY_DELIMITER\",{enumerable:true,get:function(){return KEY_DELIMITER;}});\nObject.defineProperty(__exports,\"DEFAULT_PATH_SEPARATOR\",{enumerable:true,get:function(){return DEFAULT_PATH_SEPARATOR;}});\nObject.defineProperty(__exports,\"DEFAULT_MAX_COLUMNS\",{enumerable:true,get:function(){return DEFAULT_MAX_COLUMNS;}});\nObject.defineProperty(__exports,\"pivotKey\",{enumerable:true,get:function(){return pivotKey;}});\nObject.defineProperty(__exports,\"joinPath\",{enumerable:true,get:function(){return joinPath;}});\nObject.defineProperty(__exports,\"resolvePivotKeys\",{enumerable:true,get:function(){return resolvePivotKeys;}});\nObject.defineProperty(__exports,\"pivot\",{enumerable:true,get:function(){return pivot;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst warnOnce=__m0[\"warnOnce\"];\nconst __m1=__req(\"packages/core/src/compute/handle.js\");\nconst valueComparator=__m1[\"valueComparator\"];\nconst __m2=__req(\"packages/core/src/compute/group.js\");\nconst packKeys=__m2[\"packKeys\"];\nconst __m3=__req(\"packages/core/src/compute/total.js\");\nconst total=__m3[\"total\"];\nconst KEY_DELIMITER='|';\nconst DEFAULT_PATH_SEPARATOR='/';\nconst DEFAULT_MAX_COLUMNS=2000;\nfunction pivotKey(groupPath,pivotPath,colId){\nreturn`${groupPath}${KEY_DELIMITER}${pivotPath}${KEY_DELIMITER}${colId}`;\n}\nfunction joinPath(parts,separator){\nlet out='';\nfor(let i=0;i<parts.length;i++){\nconst v=parts[i];\nout+=(i===0?'':separator)+(v===null||v===undefined?'':String(v));\n}\nreturn out;\n}\nfunction resolvePivotKeys(handles,order,opts={}){\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst n=order.length;\nconst{keyOf,readers}=packKeys(handles,order,0);\nconst seen=new Map();\nconst tuples=[];\nconst rawKeys=[];\nfor(let i=0;i<n;i++){\nconst row=order[i];\nconst key=keyOf(row);\nif(seen.has(key))continue;\nseen.set(key,tuples.length);\nrawKeys.push(key);\nconst tuple=new Array(readers.length);\nfor(let j=0;j<readers.length;j++)tuple[j]=readers[j](row);\ntuples.push(tuple);\n}\nconst cmp=valueComparator(opts.locale);\nconst rank=tuples.map((_,i)=>i);\nrank.sort((a,b)=>{\nconst ta=tuples[a];\nconst tb=tuples[b];\nfor(let j=0;j<ta.length;j++){\nconst c=compareNullable(ta[j],tb[j],cmp);\nif(c!==0)return c;\n}\nreturn a-b;\n});\nconst keys=new Array(rank.length);\nconst paths=new Array(rank.length);\nconst idByKey=new Map();\nfor(let position=0;position<rank.length;position++){\nconst from=rank[position];\nkeys[position]=tuples[from];\npaths[position]=joinPath(tuples[from],separator);\nidByKey.set(rawKeys[from],position);\n}\nconst idOf=(row)=>{\nconst id=idByKey.get(keyOf(row));\nreturn id===undefined?-1:id;\n};\nreturn{keys,paths,idOf};\n}\nfunction compareNullable(a,b,cmp){\nconst na=a===null||a===undefined;\nconst nb=b===null||b===undefined;\nif(na||nb)return na&&nb?0:na?1:-1;\nreturn cmp(a,b);\n}\nfunction resolveValueColumns(opts){\nconst declared=opts.values||opts.totals||[];\nif(declared.length&&typeof declared[0]==='object'&&declared[0]!==null){\nreturn declared.filter((entry)=>entry&&entry.handle);\n}\nconst resolve=typeof opts.handle==='function'?opts.handle:null;\nif(!resolve){\nif(declared.length){\nwarnOnce('pivot:handles',\n'pivot was given total column ids but no handle(colId) resolver, so no cell values were reduced. Pass values: [{ colId, handle, fn }] or opts.handle.');\n}\nreturn[];\n}\nconst totalOf=typeof opts.totalOf==='function'?opts.totalOf:null;\nconst out=[];\nfor(const colId of declared){\nconst handle=resolve(colId);\nif(!handle)continue;\nout.push({colId,handle,fn:totalOf?totalOf(colId):'sum'});\n}\nreturn out;\n}\nfunction normaliseArgs(a,b,c){\nif(Array.isArray(a)){\nconst opts=c||{};\nreturn{...opts,pivotHandles:a,order:b||null,groups:opts.groups||null};\n}\nreturn a||{};\n}\nfunction pivot(input,orderArg,optsArg){\nconst opts=normaliseArgs(input,orderArg,optsArg);\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst valueColumns=resolveValueColumns(opts);\nconst maxColumns=opts.maxColumns===undefined?DEFAULT_MAX_COLUMNS:opts.maxColumns;\nconst groups=opts.groups&&opts.groups.buckets?opts.groups:null;\nconst buckets=groups?groups.buckets:[opts.order||new Uint32Array(0)];\nconst groupPaths=opts.groupPaths\n||(groups?groups.keys.map((tuple)=>joinPath(tuple,separator)):['']);\nconst scope=concatIndices(buckets);\nconst{keys,paths,idOf}=resolvePivotKeys(opts.pivotHandles||[],scope,opts);\nconst columns=paths.length*Math.max(1,valueColumns.length);\nconst fields=derivedFields(paths,valueColumns,separator);\nif(maxColumns&&columns>maxColumns){\nconst empty=new Map();\nreturn{\nkeys,\npaths,\nfields,\ngroupPaths,\ncolumns,\nvalues:empty,\ncells:empty,\nerror:{\ncode:'pivot-max-columns',\nmessage:`[lattice] pivot would generate ${columns} columns, above pivot.maxColumns of ${maxColumns}. Narrow the pivot columns or raise the limit.`,\ncolumns,\nmaxColumns,\n},\n};\n}\nconst cells=new Map();\nconst keyCount=paths.length;\nfor(let g=0;g<buckets.length;g++){\nconst bucket=buckets[g];\nconst groupPath=groupPaths[g]===undefined?'':groupPaths[g];\nconst n=bucket.length;\nif(n===0)continue;\nconst ids=new Int32Array(n);\nconst counts=new Uint32Array(keyCount+1);\nfor(let i=0;i<n;i++){\nconst id=idOf(bucket[i]);\nids[i]=id;\nif(id>=0)counts[id+1]++;\n}\nfor(let k=0;k<keyCount;k++)counts[k+1]+=counts[k];\nconst scattered=new Uint32Array(n);\nconst cursor=counts.slice(0,keyCount);\nfor(let i=0;i<n;i++){\nconst id=ids[i];\nif(id>=0)scattered[cursor[id]++]=bucket[i];\n}\nfor(let k=0;k<keyCount;k++){\nconst from=counts[k];\nconst to=counts[k+1];\nif(to===from)continue;\nconst slice=scattered.subarray(from,to);\nfor(let c=0;c<valueColumns.length;c++){\nconst column=valueColumns[c];\nconst result=total(column.handle,slice,column.fn,opts.totalContext||{locale:opts.locale});\ncells.set(pivotKey(groupPath,paths[k],column.colId),result);\n}\n}\n}\nreturn{keys,paths,fields,groupPaths,columns,values:cells,cells,error:null};\n}\nfunction derivedFields(paths,valueColumns,separator){\nif(valueColumns.length===0)return paths.slice();\nconst out=[];\nfor(const path of paths){\nfor(const column of valueColumns)out.push(`${path}${separator}${column.colId}`);\n}\nreturn out;\n}\nfunction concatIndices(buckets){\nif(buckets.length===1)return buckets[0]||new Uint32Array(0);\nlet n=0;\nfor(const b of buckets)n+=b?b.length:0;\nconst out=new Uint32Array(n);\nlet at=0;\nfor(const b of buckets){\nif(!b||b.length===0)continue;\nout.set(b,at);\nat+=b.length;\n}\nreturn out;\n}\n});\n__def(\"packages/core/src/compute/pivotmatrix.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"GRAND_PATH\",{enumerable:true,get:function(){return GRAND_PATH;}});\nObject.defineProperty(__exports,\"resolveAxis\",{enumerable:true,get:function(){return resolveAxis;}});\nObject.defineProperty(__exports,\"pivotMatrix\",{enumerable:true,get:function(){return pivotMatrix;}});\nObject.defineProperty(__exports,\"cellKey\",{enumerable:true,get:function(){return cellKey;}});\nObject.defineProperty(__exports,\"marginKey\",{enumerable:true,get:function(){return marginKey;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst valueComparator=__m0[\"valueComparator\"];\nconst __m1=__req(\"packages/core/src/compute/total.js\");\nconst total=__m1[\"total\"];\nconst __m2=__req(\"packages/core/src/compute/group.js\");\nconst packKeys=__m2[\"packKeys\"];\nconst __m3=__req(\"packages/core/src/compute/pivot.js\");\nconst joinPath=__m3[\"joinPath\"];\nconst DEFAULT_PATH_SEPARATOR=__m3[\"DEFAULT_PATH_SEPARATOR\"];\nconst DEFAULT_MAX_COLUMNS=__m3[\"DEFAULT_MAX_COLUMNS\"];\nconst GRAND_PATH='';\nfunction resolveAxis(handles,leaves,opts={}){\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst list=handles||[];\nconst order=leaves instanceof Uint32Array?leaves:Uint32Array.from(leaves||[]);\nconst n=order.length;\nif(list.length===0){\nreturn{tuples:[[]],paths:[GRAND_PATH],buckets:[order]};\n}\nconst{keyOf,readers}=packKeys(list,order,0);\nconst seen=new Map();\nconst tuples=[];\nconst rawKeys=[];\nconst rowsByKey=[];\nfor(let i=0;i<n;i++){\nconst row=order[i];\nconst key=keyOf(row);\nlet at=seen.get(key);\nif(at===undefined){\nat=tuples.length;\nseen.set(key,at);\nrawKeys.push(key);\nconst tuple=new Array(readers.length);\nfor(let j=0;j<readers.length;j++)tuple[j]=readers[j](row);\ntuples.push(tuple);\nrowsByKey.push([]);\n}\nrowsByKey[at].push(row);\n}\nconst cmp=valueComparator(opts.locale);\nconst rank=tuples.map((_,i)=>i);\nrank.sort((a,b)=>{\nconst ta=tuples[a];\nconst tb=tuples[b];\nfor(let j=0;j<ta.length;j++){\nconst c=compareNullable(ta[j],tb[j],cmp);\nif(c!==0)return c;\n}\nreturn a-b;\n});\nconst outTuples=new Array(rank.length);\nconst paths=new Array(rank.length);\nconst buckets=new Array(rank.length);\nfor(let position=0;position<rank.length;position++){\nconst from=rank[position];\noutTuples[position]=tuples[from];\npaths[position]=joinPath(tuples[from],separator);\nbuckets[position]=Uint32Array.from(rowsByKey[from]);\n}\nreturn{tuples:outTuples,paths,buckets};\n}\nfunction compareNullable(a,b,cmp){\nconst na=a===null||a===undefined;\nconst nb=b===null||b===undefined;\nif(na||nb)return na&&nb?0:na?1:-1;\nreturn cmp(a,b);\n}\nfunction intersect(a,b,bSet){\nconst out=[];\nfor(let i=0;i<a.length;i++){\nif(bSet.has(a[i]))out.push(a[i]);\n}\nreturn Uint32Array.from(out);\n}\nfunction reduceCell(handle,leaves,fn,ctx){\nconst value=leaves.length?total(handle,leaves,fn,ctx):null;\nreturn{value,leaves,count:leaves.length};\n}\nfunction pivotMatrix(input){\nconst opts=(input&&input.opts)||{};\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst ctx=opts.totalContext||{locale:opts.locale};\nconst measures=(input.measures||[]).filter((m)=>m&&m.handle);\nconst leaves=input.leaves instanceof Uint32Array\n?input.leaves\n:Uint32Array.from(input.leaves||[]);\nconst rowAxis=resolveAxis(input.rowHandles||[],leaves,{...opts,separator});\nconst columnAxis=resolveAxis(input.columnHandles||[],leaves,{...opts,separator});\nconst maxColumns=opts.maxColumns===undefined?DEFAULT_MAX_COLUMNS:opts.maxColumns;\nconst columns=columnAxis.paths.length*Math.max(1,measures.length);\nconst empty=new Map();\nif(maxColumns&&columns>maxColumns){\nreturn{\nrowAxis,\ncolumnAxis,\nmeasures:measures.map((m)=>({colId:m.colId,fn:m.fn})),\nbody:empty,\nrowMargin:empty,\ncolumnMargin:empty,\ngrand:empty,\ncolumns,\nerror:{\ncode:'pivot-max-columns',\nmessage:`[lattice] pivot would generate ${columns} columns, above pivot.maxColumns of `\n+`${maxColumns}. Narrow the pivot columns or raise the limit.`,\ncolumns,\nmaxColumns,\n},\n};\n}\nconst body=new Map();\nconst rowMargin=new Map();\nconst columnMargin=new Map();\nconst grand=new Map();\nconst columnSets=columnAxis.buckets.map((b)=>new Set(b));\nfor(let c=0;c<columnAxis.paths.length;c++){\nconst columnLeaves=columnAxis.buckets[c];\nconst columnPath=columnAxis.paths[c];\nfor(const m of measures){\ncolumnMargin.set(marginKey(columnPath,m.colId),reduceCell(m.handle,columnLeaves,m.fn,ctx));\n}\n}\nfor(let r=0;r<rowAxis.paths.length;r++){\nconst rowLeaves=rowAxis.buckets[r];\nconst rowPath=rowAxis.paths[r];\nfor(const m of measures){\nrowMargin.set(marginKey(rowPath,m.colId),reduceCell(m.handle,rowLeaves,m.fn,ctx));\n}\nfor(let c=0;c<columnAxis.paths.length;c++){\nconst cellLeaves=intersect(rowLeaves,columnAxis.buckets[c],columnSets[c]);\nif(cellLeaves.length===0)continue;\nconst columnPath=columnAxis.paths[c];\nfor(const m of measures){\nbody.set(cellKey(rowPath,columnPath,m.colId),reduceCell(m.handle,cellLeaves,m.fn,ctx));\n}\n}\n}\nfor(const m of measures){\ngrand.set(m.colId,reduceCell(m.handle,leaves,m.fn,ctx));\n}\nreturn{\nrowAxis,\ncolumnAxis,\nmeasures:measures.map((m)=>({colId:m.colId,fn:m.fn})),\nbody,\nrowMargin,\ncolumnMargin,\ngrand,\ncolumns,\nerror:null,\n};\n}\nfunction cellKey(rowPath,columnPath,colId){\nreturn`${rowPath}\\u0000${columnPath}\\u0000${colId}`;\n}\nfunction marginKey(path,colId){\nreturn`${path}\\u0000${colId}`;\n}\n});\n__def(\"packages/core/src/compute/reference.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"referenceValue\",{enumerable:true,get:function(){return referenceValue;}});\nObject.defineProperty(__exports,\"referenceSort\",{enumerable:true,get:function(){return referenceSort;}});\nObject.defineProperty(__exports,\"referenceFilter\",{enumerable:true,get:function(){return referenceFilter;}});\nObject.defineProperty(__exports,\"referencePasses\",{enumerable:true,get:function(){return referencePasses;}});\nObject.defineProperty(__exports,\"referenceGroup\",{enumerable:true,get:function(){return referenceGroup;}});\nObject.defineProperty(__exports,\"referenceTotal\",{enumerable:true,get:function(){return referenceTotal;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst getPath=__m0[\"getPath\"];\nconst __m1=__req(\"packages/core/src/compute/handle.js\");\nconst isMissing=__m1[\"isMissing\"];\nconst valueComparator=__m1[\"valueComparator\"];\nconst __m2=__req(\"packages/core/src/compute/filter.js\");\nconst testValue=__m2[\"testValue\"];\nconst KEY_SEPARATOR=String.fromCharCode(0x1f);\nconst NULL_MARKER=String.fromCharCode(0x00);\nfunction referenceValue(row,col){\nconst v=col.includes('.')?getPath(row,col):(row==null?undefined:row[col]);\nreturn v===undefined?null:v;\n}\nfunction referenceSort(rows,entries,opts={}){\nconst list=entries||[];\nlet order=rows.map((_,i)=>i);\nif(list.length===0)return order;\nfor(let e=list.length-1;e>=0;e--){\norder=referenceSortOne(rows,order,list[e],opts);\n}\nreturn order;\n}\nfunction referenceSortOne(rows,order,entry,opts){\nconst locale=entry.locale!==undefined?entry.locale:opts.locale;\nconst base=valueComparator(locale);\nconst descending=entry.descending!==undefined?!!entry.descending:entry.dir==='desc';\nconst present=[];\nconst absent=[];\nfor(const i of order){\nconst v=referenceValue(rows[i],entry.col);\nif(isMissing(v))absent.push(i);else present.push(i);\n}\nconst position=new Map();\nfor(let p=0;p<present.length;p++)position.set(present[p],p);\nconst compare=(a,b)=>{\nconst va=referenceValue(rows[a],entry.col);\nconst vb=referenceValue(rows[b],entry.col);\nlet c;\nif(typeof entry.compare==='function'){\nc=entry.compare(va,vb,rows[a],rows[b],descending);\nif(descending)c=-c;\n}else{\nc=descending?base(vb,va):base(va,vb);\n}\nreturn c!==0?c:position.get(a)-position.get(b);\n};\npresent.sort(compare);\nreturn entry.nullsFirst?absent.concat(present):present.concat(absent);\n}\nfunction referenceFilter(rows,filters,opts={}){\nconst out=[];\nfor(let i=0;i<rows.length;i++){\nif(referencePasses(rows[i],filters,opts,i))out.push(i);\n}\nreturn out;\n}\nfunction referencePasses(row,node,opts,index){\nif(!node)return true;\nif(Array.isArray(node.conditions)){\nconst children=node.conditions.filter((c)=>c!=null);\nif(children.length===0)return true;\nif(node.op==='or')return children.some((c)=>referencePasses(row,c,opts,index));\nconst all=children.every((c)=>referencePasses(row,c,opts,index));\nreturn node.op==='not'?!all:all;\n}\nif(node.col===undefined&&typeof opts.custom==='function')return!!opts.custom(node,row,index);\nreturn testValue(referenceValue(row,node.col),node,opts.locale);\n}\nfunction referenceGroup(rows,cols,order){\nconst source=order||rows.map((_,i)=>i);\nconst seen=new Map();\nconst keys=[];\nconst buckets=[];\nfor(const i of source){\nconst tuple=cols.map((col)=>referenceValue(rows[i],col));\nconst key=tuple\n.map((v)=>(v===null||v===undefined?NULL_MARKER:String(v)))\n.join(KEY_SEPARATOR);\nlet at=seen.get(key);\nif(at===undefined){\nat=keys.length;\nseen.set(key,at);\nkeys.push(tuple);\nbuckets.push([]);\n}\nbuckets[at].push(i);\n}\nreturn{keys,buckets};\n}\nfunction referenceTotal(values,fn,opts={}){\nconst cmp=valueComparator(opts.locale);\nconst live=values.filter((v)=>!isMissing(v));\nconst numbers=live.map(toNumberOrNull).filter((v)=>v!==null);\nswitch(fn){\ncase'count':return values.length;\ncase'countValues':return live.length;\ncase'sum':return numbers.reduce((a,b)=>a+b,0);\ncase'avg':return live.length===0?null:numbers.reduce((a,b)=>a+b,0)/live.length;\ncase'min':return live.length===0?null:live.reduce((a,b)=>(cmp(b,a)<0?b:a));\ncase'max':return live.length===0?null:live.reduce((a,b)=>(cmp(b,a)>0?b:a));\ncase'first':return values.length===0?null:normaliseNull(values[0]);\ncase'last':return values.length===0?null:normaliseNull(values[values.length-1]);\ndefault:return null;\n}\n}\nfunction toNumberOrNull(v){\nif(typeof v==='number')return Number.isNaN(v)?null:v;\nif(v===null||v===undefined||v===''||typeof v==='boolean')return null;\nif(v instanceof Date)return v.getTime();\nconst n=Number(v);\nreturn Number.isNaN(n)?null:n;\n}\nfunction normaliseNull(v){\nreturn v===undefined?null:v;\n}\n});\n__def(\"packages/core/src/compute/windowed.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Window\",{enumerable:true,get:function(){return Window;}});\nObject.defineProperty(__exports,\"WINDOW_KINDS\",{enumerable:true,get:function(){return WINDOW_KINDS;}});\nObject.defineProperty(__exports,\"openWindow\",{enumerable:true,get:function(){return openWindow;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nconst __m0=__req(\"packages/core/src/compute/sketch.js\");\nconst Welford=__m0[\"Welford\"];\nclass Window{\n#kind;\n#span;\n#ticks=[];\n#now;\n#opened;\nconstructor(kind,span=0,now=Date.now){\nif(kind!=='count'&&kind!=='time'&&kind!=='session'){\nthrow new RangeError(`unknown window kind: ${kind}`);\n}\nif((kind==='count'||kind==='time')&&!(span>0)){\nthrow new RangeError(`a ${kind} window needs a positive span`);\n}\nthis.#kind=kind;\nthis.#span=Math.floor(span);\nthis.#now=now;\nthis.#opened=now();\n}\nget size(){return this.#ticks.length;}\npush(v,t=this.#now()){\nif(!Number.isFinite(v))return;\nthis.#ticks.push({t,v});\nthis.#evict(t);\n}\n#evict(nowT){\nif(this.#kind==='count'){\nwhile(this.#ticks.length>this.#span)this.#ticks.shift();\n}else if(this.#kind==='time'){\nconst cutoff=nowT-this.#span;\nwhile(this.#ticks.length&&this.#ticks[0].t<cutoff)this.#ticks.shift();\n}\n}\nspec(){\nconst span=this.#kind==='session'?this.#now()-this.#opened:this.#span;\nreturn{kind:this.#kind,span,size:this.#ticks.length};\n}\nvalues(){return this.#ticks.map((tk)=>tk.v);}\naggregate(){\nconst spec=this.spec();\nif(!this.#ticks.length){\nreturn{over:spec,count:0,sum:null,mean:null,min:null,max:null,variance:null,stddev:null};\n}\nconst w=new Welford();\nlet sum=0;\nlet min=Infinity;\nlet max=-Infinity;\nfor(const{v}of this.#ticks){\nsum+=v;\nif(v<min)min=v;\nif(v>max)max=v;\nw.add(v);\n}\nreturn{\nover:spec,\ncount:this.#ticks.length,\nsum,\nmean:w.mean(),\nmin,\nmax,\nvariance:w.variance(),\nstddev:w.stddev(),\n};\n}\nreduce(fn){\nconst agg=this.aggregate();\nconst map={\nsum:agg.sum,avg:agg.mean,mean:agg.mean,min:agg.min,max:agg.max,\ncount:agg.count,variance:agg.variance,stddev:agg.stddev,\n};\nif(!(fn in map))throw new RangeError(`unknown windowed aggregate: ${fn}`);\nreturn{value:map[fn],over:agg.over};\n}\n}\nconst WINDOW_KINDS=Object.freeze(['count','time','session']);\nfunction openWindow(opts,now=Date.now){\nconst span=opts.kind==='time'&&opts.minutes!=null\n?opts.minutes*60_000\n:opts.span??0;\nreturn new Window(opts.kind,span,now);\n}\nconst __default={Window,WINDOW_KINDS,openWindow};\n});\n__def(\"packages/core/src/compute/index.js\",function(__exports,__req){\n'use strict';\nconst __m0=__req(\"packages/core/src/compute/sort.js\");\nObject.defineProperty(__exports,\"sortColumn\",{enumerable:true,get:function(){return __m0[\"sortColumn\"];}});\nObject.defineProperty(__exports,\"sortMulti\",{enumerable:true,get:function(){return __m0[\"sortMulti\"];}});\nObject.defineProperty(__exports,\"radixSortFloat64\",{enumerable:true,get:function(){return __m0[\"radixSortFloat64\"];}});\nObject.defineProperty(__exports,\"radixSortInt32\",{enumerable:true,get:function(){return __m0[\"radixSortInt32\"];}});\nObject.defineProperty(__exports,\"rankSortDictionary\",{enumerable:true,get:function(){return __m0[\"rankSortDictionary\"];}});\nObject.defineProperty(__exports,\"mergeSortComparator\",{enumerable:true,get:function(){return __m0[\"mergeSortComparator\"];}});\nObject.defineProperty(__exports,\"collateStringRanks\",{enumerable:true,get:function(){return __m0[\"collateStringRanks\"];}});\nObject.defineProperty(__exports,\"rankSortStrings\",{enumerable:true,get:function(){return __m0[\"rankSortStrings\"];}});\nconst __m1=__req(\"packages/core/src/compute/sortspec.js\");\nObject.defineProperty(__exports,\"collationDescriptor\",{enumerable:true,get:function(){return __m1[\"collationDescriptor\"];}});\nObject.defineProperty(__exports,\"isPortableSort\",{enumerable:true,get:function(){return __m1[\"isPortableSort\"];}});\nObject.defineProperty(__exports,\"isPortableSortSet\",{enumerable:true,get:function(){return __m1[\"isPortableSortSet\"];}});\nObject.defineProperty(__exports,\"describeSortEntry\",{enumerable:true,get:function(){return __m1[\"describeSortEntry\"];}});\nObject.defineProperty(__exports,\"describeSort\",{enumerable:true,get:function(){return __m1[\"describeSort\"];}});\nconst __m2=__req(\"packages/core/src/compute/filter.js\");\nObject.defineProperty(__exports,\"evaluateFilters\",{enumerable:true,get:function(){return __m2[\"evaluateFilters\"];}});\nObject.defineProperty(__exports,\"evaluateCondition\",{enumerable:true,get:function(){return __m2[\"evaluateCondition\"];}});\nObject.defineProperty(__exports,\"compact\",{enumerable:true,get:function(){return __m2[\"compact\"];}});\nObject.defineProperty(__exports,\"testValue\",{enumerable:true,get:function(){return __m2[\"testValue\"];}});\nObject.defineProperty(__exports,\"compilePredicate\",{enumerable:true,get:function(){return __m2[\"compilePredicate\"];}});\nObject.defineProperty(__exports,\"releaseMask\",{enumerable:true,get:function(){return __m2[\"releaseMask\"];}});\nObject.defineProperty(__exports,\"pruneColumn\",{enumerable:true,get:function(){return __m2[\"pruneColumn\"];}});\nObject.defineProperty(__exports,\"mentionsColumn\",{enumerable:true,get:function(){return __m2[\"mentionsColumn\"];}});\nconst __m3=__req(\"packages/core/src/compute/group.js\");\nObject.defineProperty(__exports,\"groupByColumns\",{enumerable:true,get:function(){return __m3[\"groupByColumns\"];}});\nObject.defineProperty(__exports,\"packKeys\",{enumerable:true,get:function(){return __m3[\"packKeys\"];}});\nconst __m4=__req(\"packages/core/src/compute/facet.js\");\nObject.defineProperty(__exports,\"facet\",{enumerable:true,get:function(){return __m4[\"facet\"];}});\nObject.defineProperty(__exports,\"computeBounds\",{enumerable:true,get:function(){return __m4[\"computeBounds\"];}});\nObject.defineProperty(__exports,\"countInto\",{enumerable:true,get:function(){return __m4[\"countInto\"];}});\nObject.defineProperty(__exports,\"bucketOf\",{enumerable:true,get:function(){return __m4[\"bucketOf\"];}});\nObject.defineProperty(__exports,\"facetKind\",{enumerable:true,get:function(){return __m4[\"facetKind\"];}});\nObject.defineProperty(__exports,\"cardinalityOf\",{enumerable:true,get:function(){return __m4[\"cardinalityOf\"];}});\nObject.defineProperty(__exports,\"pickGranularity\",{enumerable:true,get:function(){return __m4[\"pickGranularity\"];}});\nObject.defineProperty(__exports,\"floorTo\",{enumerable:true,get:function(){return __m4[\"floorTo\"];}});\nObject.defineProperty(__exports,\"advance\",{enumerable:true,get:function(){return __m4[\"advance\"];}});\nObject.defineProperty(__exports,\"STRATEGIES\",{enumerable:true,get:function(){return __m4[\"STRATEGIES\"];}});\nObject.defineProperty(__exports,\"GRANULARITIES\",{enumerable:true,get:function(){return __m4[\"GRANULARITIES\"];}});\nObject.defineProperty(__exports,\"DEFAULT_BUCKETS\",{enumerable:true,get:function(){return __m4[\"DEFAULT_BUCKETS\"];}});\nObject.defineProperty(__exports,\"DEFAULT_CARDINALITY_LIMIT\",{enumerable:true,get:function(){return __m4[\"DEFAULT_CARDINALITY_LIMIT\"];}});\nObject.defineProperty(__exports,\"QUANTILE_SAMPLE\",{enumerable:true,get:function(){return __m4[\"QUANTILE_SAMPLE\"];}});\nconst __m5=__req(\"packages/core/src/compute/total.js\");\nObject.defineProperty(__exports,\"TOTAL_FNS\",{enumerable:true,get:function(){return __m5[\"TOTAL_FNS\"];}});\nObject.defineProperty(__exports,\"TOTAL_LABELS\",{enumerable:true,get:function(){return __m5[\"TOTAL_LABELS\"];}});\nObject.defineProperty(__exports,\"totalLabel\",{enumerable:true,get:function(){return __m5[\"totalLabel\"];}});\nObject.defineProperty(__exports,\"total\",{enumerable:true,get:function(){return __m5[\"total\"];}});\nObject.defineProperty(__exports,\"collectValues\",{enumerable:true,get:function(){return __m5[\"collectValues\"];}});\nconst __m6=__req(\"packages/core/src/compute/pivot.js\");\nObject.defineProperty(__exports,\"pivot\",{enumerable:true,get:function(){return __m6[\"pivot\"];}});\nObject.defineProperty(__exports,\"resolvePivotKeys\",{enumerable:true,get:function(){return __m6[\"resolvePivotKeys\"];}});\nObject.defineProperty(__exports,\"pivotKey\",{enumerable:true,get:function(){return __m6[\"pivotKey\"];}});\nObject.defineProperty(__exports,\"joinPath\",{enumerable:true,get:function(){return __m6[\"joinPath\"];}});\nObject.defineProperty(__exports,\"KEY_DELIMITER\",{enumerable:true,get:function(){return __m6[\"KEY_DELIMITER\"];}});\nObject.defineProperty(__exports,\"DEFAULT_PATH_SEPARATOR\",{enumerable:true,get:function(){return __m6[\"DEFAULT_PATH_SEPARATOR\"];}});\nObject.defineProperty(__exports,\"DEFAULT_MAX_COLUMNS\",{enumerable:true,get:function(){return __m6[\"DEFAULT_MAX_COLUMNS\"];}});\nconst __m7=__req(\"packages/core/src/compute/pivotmatrix.js\");\nObject.defineProperty(__exports,\"pivotMatrix\",{enumerable:true,get:function(){return __m7[\"pivotMatrix\"];}});\nObject.defineProperty(__exports,\"resolveAxis\",{enumerable:true,get:function(){return __m7[\"resolveAxis\"];}});\nObject.defineProperty(__exports,\"cellKey\",{enumerable:true,get:function(){return __m7[\"cellKey\"];}});\nObject.defineProperty(__exports,\"marginKey\",{enumerable:true,get:function(){return __m7[\"marginKey\"];}});\nObject.defineProperty(__exports,\"GRAND_PATH\",{enumerable:true,get:function(){return __m7[\"GRAND_PATH\"];}});\nconst __m8=__req(\"packages/core/src/compute/reference.js\");\nObject.defineProperty(__exports,\"referenceSort\",{enumerable:true,get:function(){return __m8[\"referenceSort\"];}});\nObject.defineProperty(__exports,\"referenceFilter\",{enumerable:true,get:function(){return __m8[\"referenceFilter\"];}});\nObject.defineProperty(__exports,\"referenceGroup\",{enumerable:true,get:function(){return __m8[\"referenceGroup\"];}});\nObject.defineProperty(__exports,\"referenceTotal\",{enumerable:true,get:function(){return __m8[\"referenceTotal\"];}});\nObject.defineProperty(__exports,\"referencePasses\",{enumerable:true,get:function(){return __m8[\"referencePasses\"];}});\nObject.defineProperty(__exports,\"referenceValue\",{enumerable:true,get:function(){return __m8[\"referenceValue\"];}});\nconst __m9=__req(\"packages/core/src/compute/handle.js\");\nObject.defineProperty(__exports,\"identity\",{enumerable:true,get:function(){return __m9[\"identity\"];}});\nObject.defineProperty(__exports,\"rowCount\",{enumerable:true,get:function(){return __m9[\"rowCount\"];}});\nObject.defineProperty(__exports,\"presenceReader\",{enumerable:true,get:function(){return __m9[\"presenceReader\"];}});\nObject.defineProperty(__exports,\"bitReader\",{enumerable:true,get:function(){return __m9[\"bitReader\"];}});\nObject.defineProperty(__exports,\"valueReader\",{enumerable:true,get:function(){return __m9[\"valueReader\"];}});\nObject.defineProperty(__exports,\"valueComparator\",{enumerable:true,get:function(){return __m9[\"valueComparator\"];}});\nObject.defineProperty(__exports,\"numericTotalOrder\",{enumerable:true,get:function(){return __m9[\"numericTotalOrder\"];}});\nObject.defineProperty(__exports,\"dictRanks\",{enumerable:true,get:function(){return __m9[\"dictRanks\"];}});\nObject.defineProperty(__exports,\"dictSize\",{enumerable:true,get:function(){return __m9[\"dictSize\"];}});\nObject.defineProperty(__exports,\"dictValue\",{enumerable:true,get:function(){return __m9[\"dictValue\"];}});\nObject.defineProperty(__exports,\"multiValue\",{enumerable:true,get:function(){return __m9[\"multiValue\"];}});\nObject.defineProperty(__exports,\"isMissing\",{enumerable:true,get:function(){return __m9[\"isMissing\"];}});\nconst __m10=__req(\"packages/core/src/compute/sketch.js\");\nObject.defineProperty(__exports,\"Welford\",{enumerable:true,get:function(){return __m10[\"Welford\"];}});\nObject.defineProperty(__exports,\"Reservoir\",{enumerable:true,get:function(){return __m10[\"Reservoir\"];}});\nObject.defineProperty(__exports,\"HyperLogLog\",{enumerable:true,get:function(){return __m10[\"HyperLogLog\"];}});\nObject.defineProperty(__exports,\"SpaceSaving\",{enumerable:true,get:function(){return __m10[\"SpaceSaving\"];}});\nObject.defineProperty(__exports,\"KLL\",{enumerable:true,get:function(){return __m10[\"KLL\"];}});\nObject.defineProperty(__exports,\"hash32\",{enumerable:true,get:function(){return __m10[\"hash32\"];}});\nObject.defineProperty(__exports,\"SKETCH_BOUNDS\",{enumerable:true,get:function(){return __m10[\"SKETCH_BOUNDS\"];}});\nconst __m11=__req(\"packages/core/src/compute/windowed.js\");\nObject.defineProperty(__exports,\"Window\",{enumerable:true,get:function(){return __m11[\"Window\"];}});\nObject.defineProperty(__exports,\"WINDOW_KINDS\",{enumerable:true,get:function(){return __m11[\"WINDOW_KINDS\"];}});\nObject.defineProperty(__exports,\"openWindow\",{enumerable:true,get:function(){return __m11[\"openWindow\"];}});\nconst __m12=__req(\"packages/core/src/compute/statistics.js\");\nObject.defineProperty(__exports,\"MAINTENANCE\",{enumerable:true,get:function(){return __m12[\"MAINTENANCE\"];}});\nObject.defineProperty(__exports,\"APPROXIMATE\",{enumerable:true,get:function(){return __m12[\"APPROXIMATE\"];}});\nObject.defineProperty(__exports,\"maintenanceOf\",{enumerable:true,get:function(){return __m12[\"maintenanceOf\"];}});\n});\n__def(\"packages/worker/src/kernel.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"loadCompute\",{enumerable:true,get:function(){return loadCompute;}});\nObject.defineProperty(__exports,\"setCompute\",{enumerable:true,get:function(){return setCompute;}});\nObject.defineProperty(__exports,\"dispatch\",{enumerable:true,get:function(){return dispatch;}});\nObject.defineProperty(__exports,\"handleMessage\",{enumerable:true,get:function(){return handleMessage;}});\nObject.defineProperty(__exports,\"installKernel\",{enumerable:true,get:function(){return installKernel;}});\nconst __m0=__req(\"packages/worker/src/transport.js\");\nconst PROTOCOL=__m0[\"PROTOCOL\"];\nconst OPS=__m0[\"OPS\"];\nconst CONTROL=__m0[\"CONTROL\"];\nconst ERRORS=__m0[\"ERRORS\"];\nconst unpackHandle=__m0[\"unpackHandle\"];\nconst unpackHandles=__m0[\"unpackHandles\"];\nconst createMaskPool=__m0[\"createMaskPool\"];\nconst collectTransfers=__m0[\"collectTransfers\"];\nconst __m1=__req(\"packages/core/src/store/columnpack.js\");\nconst packChunk=__m1[\"packChunk\"];\nconst packedTransfers=__m1[\"packedTransfers\"];\nlet computeModule=null;\nlet computePromise=null;\nlet computeError=null;\nasync function loadCompute(loader){\nif(computeModule)return computeModule;\nif(!computePromise){\nconst load=loader||(()=>Promise.resolve(__req(\"packages/core/src/compute/index.js\")));\ncomputePromise=Promise.resolve()\n.then(load)\n.then((mod)=>{computeModule=mod;return mod;})\n.catch((err)=>{\ncomputeError=err;\ncomputeModule=null;\nreturn null;\n});\n}\nreturn computePromise;\n}\nfunction setCompute(mod){\ncomputeModule=mod;\ncomputePromise=mod?Promise.resolve(mod):null;\ncomputeError=mod?null:computeError;\n}\nfunction filterContext(handles,count,locale){\nconst byId=new Map();\nfor(const h of handles)if(h)byId.set(h.id,h);\nreturn{\nhandle(colId){return byId.get(colId);},\ncount,\npool:createMaskPool(),\nlocale,\n};\n}\nfunction dispatch(request,compute){\nconst{op,args}=request;\nif(op===OPS.COLUMNIZE){\nreturn packChunk(args.schema||[],args.rows||[],args.opts||{});\n}\nconst fn=compute[op];\nif(typeof fn!=='function'){\nconst err=new Error(`[lattice] compute kernel '${op}' is not exported`);\n(err).code=ERRORS.NO_KERNEL;\nthrow err;\n}\nswitch(op){\ncase OPS.COLLATE_STRING_RANKS:\nreturn fn(args.table||[],(args.table||[]).length,args.locale);\ncase OPS.SORT_COLUMN:\nreturn fn(unpackHandle(args.handle),args.order??null,args.opts||{});\ncase OPS.SORT_MULTI:{\nconst handles=unpackHandles(args.handles||[]);\nconst entries=(args.entries||[]).map((e)=>({\n...e,\nhandle:handles[e.index],\n}));\nreturn fn(handles,entries,args.order??null);\n}\ncase OPS.EVALUATE_FILTERS:\nreturn fn(args.filters,filterContext(unpackHandles(args.handles||[]),args.count,args.locale));\ncase OPS.COMPACT:\nreturn fn(args.mask,args.count,undefined);\ncase OPS.GROUP_BY_COLUMNS:\nreturn fn(unpackHandles(args.handles||[]),args.order??null,args.opts||{});\ncase OPS.TOTAL:\nreturn fn(unpackHandle(args.handle),args.indices??null,args.fn);\ncase OPS.PIVOT:\nreturn fn(unpackHandles(args.handles||[]),args.order??null,args.opts||{});\ncase OPS.FACET:\nreturn fn(unpackHandle(args.handle),args.indices??null,args.count,args.opts||{});\ndefault:{\nconst err=new Error(`[lattice] unknown worker op '${op}'`);\n(err).code=ERRORS.PROTOCOL;\nthrow err;\n}\n}\n}\nasync function handleMessage(message,opts={}){\nif(!message||message.lattice!==PROTOCOL)return null;\nconst{id,op}=message;\nif(op===CONTROL.CANCEL){\nopts.cancelled?.add(message.target);\nreturn null;\n}\nif(op===CONTROL.PING){\nreturn{reply:{lattice:PROTOCOL,id,ok:true,result:'pong'},transfer:[]};\n}\nif(op===OPS.COLUMNIZE){\nif(opts.cancelled?.has(id)){opts.cancelled.delete(id);return null;}\ntry{\nconst result=packChunk(message.args.schema||[],message.args.rows||[],message.args.opts||{});\nif(opts.cancelled?.has(id)){\nopts.cancelled.delete(id);\nreturn{reply:{lattice:PROTOCOL,id,ok:false,error:{code:ERRORS.ABORTED,message:'[lattice] request superseded'}},transfer:[]};\n}\nreturn{reply:{lattice:PROTOCOL,id,ok:true,result},transfer:packedTransfers(result)};\n}catch(err){\nconst e=(err);\nreturn{\nreply:{lattice:PROTOCOL,id,ok:false,error:{code:e.code||ERRORS.KERNEL,message:e.message||String(err),stack:e.stack}},\ntransfer:[],\n};\n}\n}\nconst compute=await loadCompute(opts.loader);\nif(!compute){\nreturn{\nreply:{\nlattice:PROTOCOL,\nid,\nok:false,\nerror:{\ncode:ERRORS.NO_COMPUTE,\nmessage:`[lattice] compute kernels unavailable in worker: ${computeError?computeError.message:'module not found'}`,\n},\n},\ntransfer:[],\n};\n}\nif(opts.cancelled?.has(id)){\nopts.cancelled.delete(id);\nreturn{reply:{lattice:PROTOCOL,id,ok:false,error:{code:ERRORS.ABORTED,message:'[lattice] request superseded'}},transfer:[]};\n}\ntry{\nconst result=dispatch(message,compute);\nif(opts.cancelled?.has(id)){\nopts.cancelled.delete(id);\nreturn{reply:{lattice:PROTOCOL,id,ok:false,error:{code:ERRORS.ABORTED,message:'[lattice] request superseded'}},transfer:[]};\n}\nreturn{reply:{lattice:PROTOCOL,id,ok:true,result},transfer:collectTransfers(result)};\n}catch(err){\nconst e=(err);\nreturn{\nreply:{\nlattice:PROTOCOL,\nid,\nok:false,\nerror:{code:e.code||ERRORS.KERNEL,message:e.message||String(err),stack:e.stack},\n},\ntransfer:[],\n};\n}\n}\nfunction installKernel(scope,opts={}){\nconst cancelled=new Set();\nconst onMessage=async(event)=>{\nconst outcome=await handleMessage(event.data,{loader:opts.loader,cancelled});\nif(!outcome)return;\nscope.postMessage(outcome.reply,outcome.transfer);\n};\nscope.addEventListener('message',onMessage);\nloadCompute(opts.loader).then((mod)=>{\nscope.postMessage({lattice:PROTOCOL,id:0,op:CONTROL.READY,compute:!!mod});\n});\nreturn()=>scope.removeEventListener('message',onMessage);\n}\n});\nvar __entry=__req(\"packages/worker/src/kernel.js\");\nroot[\"__latticeKernel\"]=__entry;\n})(typeof globalThis!=='undefined'?globalThis:this);\n__latticeKernel.installKernel(self);\n",{type:'classic'});
}catch(err){}
var __entry=__req("packages/modules/charts/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);