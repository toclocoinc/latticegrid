/*!
 * Lattice Grid 1.63.2, chart-bubblemap module
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
__def("packages/modules/chart-bubblemap/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"bindBubbleMap",{enumerable:true,get:function(){return bindBubbleMap;}});
Object.defineProperty(__exports,"drawBubbleMap",{enumerable:true,get:function(){return drawBubbleMap;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__ext("@toclocoinc/lattice-grid/modules/charts");
const registerChartType=__m0["registerChartType"];
function bindBubbleMap(grid,spec){
const points=[];
const n=grid.rows.count();
for(let i=0;i<n;i++){
const row=grid.rows.get(i);
if(!row||row.group)continue;
const lon=Number(grid.rows.value(row.key,spec.lon));
const lat=Number(grid.rows.value(row.key,spec.lat));
if(!Number.isFinite(lon)||!Number.isFinite(lat))continue;
const size=spec.size?Number(grid.rows.value(row.key,spec.size)):1;
points.push({lon,lat,size:Number.isFinite(size)?size:0,label:spec.label?grid.rows.text(row.key,spec.label):''});
}
return{points,empty:points.length===0};
}
function packProjection(opts){
const{spec,plot,helpers}=opts;
if(!spec||!spec.shapes)return null;
const{
resolvePack,packRegions,fitted,resolveProjection,
}=helpers;
const resolved=resolvePack(spec.shapes,spec.layer);
if(!resolved)return null;
const regions=packRegions(resolved.topology);
const project=resolveProjection(
spec.projection||resolved.pack.projection,
{...(resolved.pack.projectionOptions||{}),...(spec.projectionOptions||{})},
);
const fit=fitted({project,rings:regions.flatMap((r)=>r.rings),plot});
return{to:fit.to,regions};
}
function drawBubbleMap(ctx){
const{
plot,bound,scheme,groups,spec,helpers,
}=ctx;
const{
extent,linearScale,sqrtScale,Pool,attrs,round,resolveScheme,NS,projectedPath,
}=helpers;
const sch=scheme||resolveScheme();
const colour=sch.series(0);
const{points}=bound;
const marks=new Pool(groups.marks);
const fit=packProjection({spec,plot,helpers});
let project;
if(fit){
for(const region of fit.regions){
const d=region.rings.map((ring)=>projectedPath(ring,fit.to)).filter(Boolean).join(' ');
if(!d)continue;
attrs(marks.next('path',`${NS}__region`),{
d,fill:'var(--lattice-chart-empty, #eceff1)',class:`${NS}__region`,
});
}
project=fit.to;
}else{
const lonD=extent(points.map((p)=>p.lon))||{min:0,max:1};
const latD=extent(points.map((p)=>p.lat))||{min:0,max:1};
const pad=Math.max(8,spec&&spec.maxRadius>0?spec.maxRadius:20);
const xScale=linearScale(lonD,[plot.left+pad,plot.right-pad]);
const yScale=linearScale(latD,[plot.bottom-pad,plot.top+pad]);
project=(lon,lat)=>[xScale.of(lon),yScale.of(lat)];
}
const sizeD=extent(points.map((p)=>p.size))||{min:0,max:1};
const rScale=sqrtScale({min:0,max:Math.max(1e-9,sizeD.max)},[2,spec&&spec.maxRadius>0?spec.maxRadius:20]);
const ordered=[...points].sort((a,b)=>b.size-a.size);
for(const p of ordered){
const[x,y]=project(p.lon,p.lat);
attrs(marks.next('circle',`${NS}__bubblemap-dot ${NS}__mark`),{
cx:round(x),
cy:round(y),
r:round(spec&&spec.size?rScale.of(p.size):4),
fill:colour,
'fill-opacity':0.5,
stroke:colour,
'data-size':p.size,
class:`${NS}__bubblemap-dot ${NS}__mark`,
});
}
marks.finish();
return{points:points.length,legend:[],packed:!!fit};
}
registerChartType('bubblemap',{draw:drawBubbleMap,bind:bindBubbleMap,freeform:true,labelled:false});
const __default=drawBubbleMap;
});
var __entry=__req("packages/modules/chart-bubblemap/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);