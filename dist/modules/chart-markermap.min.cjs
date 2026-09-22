/*!
 * Lattice Grid 1.68.1, chart-markermap module
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
var __extmods=Object.create(null);
__extmods["@toclocoinc/lattice-grid/modules/charts"]=(root["LatticeGrid"]||null);
function __ext(spec){
var mod=__extmods[spec];
var g=typeof globalThis!=='undefined'?globalThis:(typeof self!=='undefined'?self:null);
if(mod)return mod;
if(spec==="@toclocoinc/lattice-grid/modules/charts"&&g&&g["LatticeGrid"])return g["LatticeGrid"];
throw new Error('[lattice] this module shares the Lattice core with the page, but it was not found. Load lattice-grid (or its script build) before this module. Missing: '+spec);
}
__def("packages/modules/chart-markermap/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"bindMarkerMap",{enumerable:true,get:function(){return bindMarkerMap;}});
Object.defineProperty(__exports,"drawMarkerMap",{enumerable:true,get:function(){return drawMarkerMap;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__ext("@toclocoinc/lattice-grid/modules/charts");
const registerChartType=__m0["registerChartType"];
const LABEL_GAP=4;
const RADIUS=5;
function fillOf(style){
if(!style||typeof style!=='object')return null;
const background=style.background===undefined||style.background===null
?null:String(style.background);
if(background&&!background.includes('gradient('))return background;
const colour=style.color===undefined||style.color===null?null:String(style.color);
return colour||null;
}
function coordinate(raw){
if(raw===null||raw===undefined||raw===''||typeof raw==='boolean')return NaN;
return Number(raw);
}
function bindMarkerMap(grid,spec){
const points=[];
let unplaced=0;
const valueCol=spec.value||spec.y||null;
const formatting=grid.formatting;
const n=grid.rows.count();
for(let i=0;i<n;i++){
const row=grid.rows.get(i);
if(!row||row.group)continue;
const lon=coordinate(grid.rows.value(row.key,spec.lon));
const lat=coordinate(grid.rows.value(row.key,spec.lat));
if(!Number.isFinite(lon)||!Number.isFinite(lat)
||Math.abs(lon)>180||Math.abs(lat)>90){
unplaced++;
continue;
}
const value=valueCol?grid.rows.value(row.key,valueCol):null;
const style=valueCol&&formatting&&typeof formatting.styleFor==='function'
?formatting.styleFor(valueCol,value)
:null;
points.push({
rowKey:row.key,
lon,
lat,
value:typeof value==='number'&&Number.isFinite(value)?value:null,
text:valueCol?grid.rows.text(row.key,valueCol):'',
label:spec.label?grid.rows.text(row.key,spec.label):'',
fill:fillOf(style),
});
}
return{points,unplaced,empty:points.length===0};
}
function markerLegend(grid,valueCol,points){
const formatting=grid&&grid.formatting;
if(!valueCol||!formatting||typeof formatting.list!=='function')return[];
const worn=new Set();
for(const point of points)if(point.fill)worn.add(point.fill);
if(!worn.size)return[];
const rules=[...formatting.list('*'),...formatting.list(valueCol)];
const out=[];
const taken=new Set();
for(const rule of rules){
if(!rule||rule.enabled===false)continue;
const colour=fillOf(typeof rule.style==='function'?null:rule.style);
if(!colour||!worn.has(colour)||taken.has(colour))continue;
taken.add(colour);
out.push({
key:rule.id||colour,
label:rule.label||thresholdText(rule),
colour,
index:out.length,
});
}
return out;
}
function thresholdText(rule){
const when=(rule&&rule.when)||null;
if(!when||when.value===undefined||when.value===null)return'';
const symbols={
gt:'>',gte:'≥',lt:'<',lte:'≤',eq:'=',ne:'≠',
};
if(when.op==='between'&&when.value2!==undefined)return`${when.value} – ${when.value2}`;
const symbol=symbols[when.op];
return symbol?`${symbol} ${when.value}`:String(when.value);
}
function placement(ctx,points){
const{
spec,plot,helpers,geoView,
}=ctx;
const{
resolvePack,packRegions,fitted,resolveProjection,extent,linearScale,
}=helpers;
const resolved=spec&&spec.shapes?resolvePack(spec.shapes,spec.layer):null;
if(resolved){
const all=packRegions(resolved.topology);
const antarctic=points.some((point)=>point.lat<-60);
const regions=antarctic
?all
:all.filter((region)=>region.code!=='AQ'&&region.code!=='AN');
const project=resolveProjection(
spec.projection||resolved.pack.projection,
{...(resolved.pack.projectionOptions||{}),...(spec.projectionOptions||{})},
);
const fit=fitted({
project,
rings:regions.flatMap((region)=>region.rings),
plot,
zoom:geoView&&geoView.zoom,
centreOffset:geoView&&geoView.offset,
});
return{
to:fit.to,
regions,
scale:fit.scale,
aspect:fit.aspect,
attribution:resolved.pack.attribution||'',
packed:true,
};
}
const lonD=extent(points.map((p)=>p.lon))||{min:0,max:1};
const latD=extent(points.map((p)=>p.lat))||{min:0,max:1};
const pad=RADIUS*3;
const xScale=linearScale(lonD,[plot.left+pad,plot.right-pad]);
const yScale=linearScale(latD,[plot.bottom-pad,plot.top+pad]);
return{
to:(lon,lat)=>[xScale.of(lon),yScale.of(lat)],
regions:null,
scale:null,
aspect:null,
attribution:'',
packed:false,
};
}
function placeLabel(opts){
const width=opts.textWidth(opts.text,opts.size);
const height=opts.size;
const near=RADIUS+LABEL_GAP;
const candidates=[
{x:opts.x+near,y:opts.y,anchor:'start'},
{x:opts.x-near,y:opts.y,anchor:'end'},
{x:opts.x,y:opts.y-near-height/2,anchor:'middle'},
{x:opts.x,y:opts.y+near+height/2,anchor:'middle'},
];
for(const candidate of candidates){
const left=candidate.anchor==='start'?candidate.x
:(candidate.anchor==='end'?candidate.x-width:candidate.x-width/2);
const box={
x:left,y:candidate.y-height/2,width,height,
};
if(box.x<opts.plot.left||box.x+box.width>opts.plot.right)continue;
if(box.y<opts.plot.top||box.y+box.height>opts.plot.bottom)continue;
if(opts.collides(box,opts.placed,2))continue;
return{...candidate,box};
}
return null;
}
function drawMarkerMap(ctx){
const{
plot,bound,scheme,groups,spec,helpers,grid,fontSize,
}=ctx;
const{
Pool,attrs,round,resolveScheme,NS,projectedPath,setText,applySize,
textWidth,collides,
}=helpers;
const sch=scheme||resolveScheme();
const fallback=sch.series(0);
const{points}=bound;
new Pool(groups.axis).finish();
new Pool(groups.rules).finish();
const fit=placement(ctx,points);
const base=new Pool(groups.grid);
if(fit.regions){
for(const region of fit.regions){
const d=region.rings.map((ring)=>projectedPath(ring,fit.to)).filter(Boolean).join(' ');
if(!d)continue;
attrs(base.next('path',`${NS}__region`),{
d,
fill:'var(--lattice-chart-empty, #eceff1)',
'data-code':region.code,
class:`${NS}__region`,
});
}
}
base.finish();
const marks=new Pool(groups.marks);
const ordered=[...points].sort((a,b)=>(b.value||0)-(a.value||0)
||String(a.rowKey).localeCompare(String(b.rowKey)));
const legend=markerLegend(grid,spec.value||spec.y||null,points);
const hiddenFills=new Set();
for(const entry of legend)if(ctx.hidden&&ctx.hidden.has(entry.key))hiddenFills.add(entry.colour);
const markers=[];
for(const point of ordered){
if(point.fill&&hiddenFills.has(point.fill))continue;
const[x,y]=fit.to(point.lon,point.lat);
if(!Number.isFinite(x)||!Number.isFinite(y))continue;
const fill=point.fill||fallback;
const element=marks.next('circle',`${NS}__markermap-dot ${NS}__mark`);
attrs(element,{
cx:round(x),
cy:round(y),
r:RADIUS,
fill,
stroke:'var(--lattice-background, #fff)',
'stroke-width':1.5,
'data-row':point.rowKey,
class:`${NS}__markermap-dot ${NS}__mark`,
});
markers.push({
rowKey:point.rowKey,
label:point.label,
value:point.value,
text:point.text,
lon:point.lon,
lat:point.lat,
fill,
x,
y,
r:RADIUS,
element,
});
}
marks.finish();
const wantLabels=ctx.labels?ctx.labels.names!==false:true;
const labels=new Pool(groups.labels);
let labelsDrawn=0;
if(wantLabels){
const placed=[];
for(const marker of markers){
const text=[marker.label,marker.text].filter(Boolean).join(' ');
if(!text)continue;
const at=placeLabel({
x:marker.x,
y:marker.y,
text,
size:fontSize,
placed,
plot,
textWidth,
collides,
});
if(!at)continue;
placed.push(at.box);
const node=labels.next('text',`${NS}__data-label`);
applySize(node,fontSize);
attrs(node,{
x:round(at.x),
y:round(at.y),
'text-anchor':at.anchor,
'dominant-baseline':'middle',
class:`${NS}__data-label`,
});
setText(node,text);
labelsDrawn++;
}
}
labels.finish();
const overlay=new Pool(groups.overlay);
if(bound.unplaced){
const note=overlay.next('text',`${NS}__geo-note`);
attrs(note,{x:round(plot.left),y:round(plot.bottom),'text-anchor':'start'});
setText(note,grid.messages.t('chart.geoUnmatched',{count:bound.unplaced}));
}
overlay.finish();
return{
markers,
unplaced:bound.unplaced,
legend,
packed:fit.packed,
scale:fit.scale,
aspect:fit.aspect,
attribution:fit.attribution,
labelsDrawn,
};
}
registerChartType('markermap',{
draw:drawMarkerMap,bind:bindMarkerMap,freeform:true,labelled:true,
});
const __default=drawMarkerMap;
});
var __entry=__req("packages/modules/chart-markermap/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);