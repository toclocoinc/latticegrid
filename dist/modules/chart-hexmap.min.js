/*!
 * Lattice Grid 1.63.0, chart-hexmap module
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
__def("packages/modules/chart-hexmap/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"bindHexMap",{enumerable:true,get:function(){return bindHexMap;}});
Object.defineProperty(__exports,"drawHexMap",{enumerable:true,get:function(){return drawHexMap;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__ext("@toclocoinc/lattice-grid/modules/charts");
const registerChartType=__m0["registerChartType"];
const DEFAULT_RADIUS=12;
function bindHexMap(grid,spec){
const points=[];
const n=grid.rows.count();
for(let i=0;i<n;i++){
const row=grid.rows.get(i);
if(!row||row.group)continue;
const lon=Number(grid.rows.value(row.key,spec.lon));
const lat=Number(grid.rows.value(row.key,spec.lat));
if(Number.isFinite(lon)&&Number.isFinite(lat))points.push({lon,lat});
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
function binHex(pts,r){
const dx=r*2*Math.sin(Math.PI/3);
const dy=r*1.5;
const bins=new Map();
for(const{px,py}of pts){
const y=py/dy;
let pj=Math.round(y);
const x=px/dx-(pj&1)/2;
let pi=Math.round(x);
const py1=y-pj;
if(Math.abs(py1)*3>1){
const px1=x-pi;
const pi2=pi+(x<pi?-1:1)/2;
const pj2=pj+(y<pj?-1:1);
const px2=x-pi2;
const py2=y-pj2;
if(px1*px1+py1*py1>px2*px2+py2*py2){pi=pi2+((pj&1)?1:-1)/2;pj=pj2;}
}
const k=`${pi}:${pj}`;
let bin=bins.get(k);
if(!bin){bin={x:(pi+(pj&1)/2)*dx,y:pj*dy,count:0};bins.set(k,bin);}
bin.count+=1;
}
return[...bins.values()];
}
function drawHexMap(ctx){
const{
plot,bound,scheme,groups,spec,helpers,
}=ctx;
const{
extent,measureDomain,linearScale,colourRamp,Pool,attrs,path,round,resolveScheme,
projectedPath,
}=helpers;
const NS=helpers.NS;
const sch=scheme||resolveScheme();
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
const xScale=linearScale(lonD,[plot.left,plot.right]);
const yScale=linearScale(latD,[plot.bottom,plot.top]);
project=(lon,lat)=>[xScale.of(lon),yScale.of(lat)];
}
const radius=spec&&Number.isFinite(spec.radius)&&spec.radius>0?spec.radius:DEFAULT_RADIUS;
const pixels=points.map((p)=>{
const[x,y]=project(p.lon,p.lat);
return{px:x,py:y};
});
const bins=binHex(pixels,radius);
if(!bins.length)return{empty:true,legend:[],packed:!!fit};
let maxCount=0;
for(const b of bins)if(b.count>maxCount)maxCount=b.count;
const ramp=colourRamp(measureDomain([0,maxCount],{zero:true}),false,sch);
const third=Math.PI/3;
const hex=[];
for(let i=0;i<6;i++)hex.push([Math.sin(i*third)*radius,-Math.cos(i*third)*radius]);
for(const bin of bins){
const parts=['M'];
for(let i=0;i<6;i++){
parts.push(round(bin.x+hex[i][0]),round(bin.y+hex[i][1]));
if(i<5)parts.push('L');
}
parts.push('Z');
attrs(marks.next('path',`${NS}__hexmap-cell ${NS}__mark`),{
d:path(parts),
fill:ramp(bin.count),
stroke:'none',
'data-count':bin.count,
class:`${NS}__hexmap-cell ${NS}__mark`,
});
}
marks.finish();
return{
bins:bins.length,maxCount,legend:[],packed:!!fit,
};
}
registerChartType('hexmap',{draw:drawHexMap,bind:bindHexMap,freeform:true,labelled:false});
const __default=drawHexMap;
});
var __entry=__req("packages/modules/chart-hexmap/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);