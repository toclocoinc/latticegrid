/*!
 * Lattice Grid 1.69.0, kanban module
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
const STAMPED_VERSION="1.69.0";
async function resolveVersion(){
if(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;
return STAMPED_VERSION;
}
const VERSION="1.69.0";
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
__def("packages/modules/kanban/model.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"accessorFor",{enumerable:true,get:function(){return accessorFor;}});
Object.defineProperty(__exports,"keyFn",{enumerable:true,get:function(){return keyFn;}});
Object.defineProperty(__exports,"fieldText",{enumerable:true,get:function(){return fieldText;}});
Object.defineProperty(__exports,"cardSpecs",{enumerable:true,get:function(){return cardSpecs;}});
Object.defineProperty(__exports,"deriveColumns",{enumerable:true,get:function(){return deriveColumns;}});
Object.defineProperty(__exports,"columnIdOf",{enumerable:true,get:function(){return columnIdOf;}});
Object.defineProperty(__exports,"buildCard",{enumerable:true,get:function(){return buildCard;}});
Object.defineProperty(__exports,"groupRows",{enumerable:true,get:function(){return groupRows;}});
Object.defineProperty(__exports,"passesFilter",{enumerable:true,get:function(){return passesFilter;}});
Object.defineProperty(__exports,"BACKLOG",{enumerable:true,get:function(){return BACKLOG;}});
Object.defineProperty(__exports,"DEFAULT_FILTER",{enumerable:true,get:function(){return DEFAULT_FILTER;}});
Object.defineProperty(__exports,"rollup",{enumerable:true,get:function(){return rollup;}});
Object.defineProperty(__exports,"laneIdOf",{enumerable:true,get:function(){return laneIdOf;}});
Object.defineProperty(__exports,"computeOrders",{enumerable:true,get:function(){return computeOrders;}});
Object.defineProperty(__exports,"windowRange",{enumerable:true,get:function(){return windowRange;}});
Object.defineProperty(__exports,"deriveDoneColumns",{enumerable:true,get:function(){return deriveDoneColumns;}});
Object.defineProperty(__exports,"resolveContext",{enumerable:true,get:function(){return resolveContext;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const getPath=__m0["getPath"];
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const isObject=__m0["isObject"];
const humanise=__m0["humanise"];
function accessorFor(accessor){
if(isFunction(accessor))return accessor;
if(typeof accessor==='string')return(row)=>getPath(row,accessor);
return()=>undefined;
}
function rowKeyTypeName(v){
if(Array.isArray(v))return'array';
if(v===null)return'null';
return typeof v;
}
function keyFn(rowKey){
if(rowKey!==undefined&&typeof rowKey!=='function'
&&!(typeof rowKey==='string'&&rowKey.length>0)){
throw new Error(
'lattice-kanban: rowKey must be a property name or a function; composite keys are not supported on boards.',
);
}
if(isFunction(rowKey)){
return(row)=>{
const key=rowKey(row);
if(typeof key==='string')return key;
if(typeof key==='number'&&Number.isFinite(key))return key;
throw new Error(
`lattice-kanban: rowKey function must return a string or number; got ${rowKeyTypeName(key)}.`,
);
};
}
const path=typeof rowKey==='string'?rowKey:'id';
return(row)=>getPath(row,path);
}
function fieldText(ctx,row,key,field){
if(isNil(field))return'';
if(ctx.grid&&typeof field==='string'){
try{
if(ctx.grid.columns&&ctx.grid.columns.get&&ctx.grid.columns.get(field)){
const text=ctx.grid.rows.text(key,field);
if(!isNil(text))return String(text);
}
}catch{}
}
const value=accessorFor(field)(row);
return isNil(value)?'':String(value);
}
function cardSpecs(card){
const out={};
for(const[name,mapping]of Object.entries(card)){
if(mapping&&typeof mapping==='object'&&!isFunction(mapping)){
out[name]={field:mapping.field,edit:!!mapping.edit,editor:mapping.editor};
}else{
out[name]={field:mapping,edit:false,editor:undefined};
}
}
return out;
}
function deriveColumns(ctx,rows){
const configured=Array.isArray(ctx.columns)?ctx.columns.map(normaliseColumnDef):[];
const byId=new Map(configured.map((c)=>[c.id,c]));
const seen=[];
const groupOf=accessorFor(ctx.columnProperty);
for(const row of rows){
const raw=groupOf(row);
const id=columnIdOf(raw);
if(id===null)continue;
if(!byId.has(id)&&!seen.includes(id))seen.push(id);
}
let ids;
if(configured.length){
ids=[...configured.map((c)=>c.id),...seen.filter((id)=>!byId.has(id))];
}else{
ids=seen;
}
if(Array.isArray(ctx.columnOrder)&&ctx.columnOrder.length){
const pinned=ctx.columnOrder.filter((id)=>ids.includes(id));
ids=[...pinned,...ids.filter((id)=>!pinned.includes(id))];
}
return ids.map((id)=>{
const def=byId.get(id)||{id,title:humanise(String(id))};
return{
id,
title:isNil(def.title)?humanise(String(id)):String(def.title),
color:def.color??null,
wipLimit:Number.isFinite(def.wipLimit)?def.wipLimit:null,
collapsed:!!def.collapsed,
};
});
}
function normaliseColumnDef(def){
if(typeof def==='string')return{id:def};
if(isObject(def)&&!isNil(def.id))return def;
return{id:String(def)};
}
function columnIdOf(raw){
if(isNil(raw))return null;
return String(raw);
}
function buildCard(ctx,row){
const key=ctx.key(row);
const columnId=columnIdOf(accessorFor(ctx.columnProperty)(row));
const pointsRaw=ctx.pointsProperty?accessorFor(ctx.pointsProperty)(row):undefined;
const points=Number(pointsRaw);
const fields={};
for(const[name,spec]of Object.entries(ctx.cardSpecs)){
fields[name]=fieldText(ctx,row,key,spec.field);
}
return{
key,
row,
columnId,
points:Number.isFinite(points)?points:0,
hasPoints:Number.isFinite(points),
swimlane:ctx.swimlaneProperty?accessorFor(ctx.swimlaneProperty)(row):undefined,
sprint:ctx.sprintProperty?accessorFor(ctx.sprintProperty)(row):undefined,
epic:ctx.epicProperty?accessorFor(ctx.epicProperty)(row):undefined,
order:ctx.orderProperty?accessorFor(ctx.orderProperty)(row):undefined,
fields,
};
}
function groupRows(ctx,rows,state={}){
const columns=orderAndFlagColumns(deriveColumns(ctx,rows),state);
const byId=new Map(columns.map((c)=>[c.id,{...c,cards:[],points:0}]));
const cardsByKey=new Map();
const unplaced=[];
let filtered=0;
for(const row of rows){
const card=buildCard(ctx,row);
if(!passesFilter(ctx,card,state)){filtered+=1;continue;}
cardsByKey.set(card.key,card);
const bucket=card.columnId===null?null:byId.get(card.columnId);
if(!bucket){unplaced.push(card);continue;}
bucket.cards.push(card);
}
for(const col of byId.values())sortColumn(ctx,col);
if(unplaced.length){
warnOnce(
`kanban:unplaced:${ctx.columnProperty}`,
`${unplaced.length} card(s) have a "${ctx.columnProperty}" value outside the configured `
+'columns and are not shown; add the column or map the value.',
);
}
const cols=[...byId.values()];
const lanes=ctx.swimlanes?deriveLanes(ctx,cols,cardsByKey,state):null;
return{
columns:cols,lanes,cardsByKey,unplaced,filtered,
};
}
function orderAndFlagColumns(columns,state){
let ordered=columns;
if(Array.isArray(state.columnOrder)&&state.columnOrder.length){
const rank=new Map(state.columnOrder.map((id,i)=>[id,i]));
ordered=[...columns].sort((a,b)=>{
const ra=rank.has(a.id)?rank.get(a.id):Number.MAX_SAFE_INTEGER;
const rb=rank.has(b.id)?rank.get(b.id):Number.MAX_SAFE_INTEGER;
return ra-rb;
});
}
const collapsed=state.collapsedColumns;
return ordered.map((c)=>({...c,collapsed:c.collapsed||!!(collapsed&&collapsed.has(c.id))}));
}
function sortColumn(ctx,col){
if(ctx.orderProperty){
col.cards.sort((a,b)=>orderRank(a.order)-orderRank(b.order));
}
col.count=col.cards.length;
col.points=col.cards.reduce((sum,c)=>sum+(c.hasPoints?c.points:0),0);
col.over=col.wipLimit!==null&&col.count>col.wipLimit;
}
function passesFilter(ctx,card,state){
if(state.filters&&state.filters.size){
for(const fn of state.filters.values()){
if(!fn(card.row,card))return false;
}
}
if(!passesSprint(ctx,card,state))return false;
if(!passesEpic(ctx,card,state))return false;
const q=typeof state.quickFilter==='string'?state.quickFilter.trim().toLowerCase():'';
if(!q)return true;
const hay=Object.values(card.fields).join(' ').toLowerCase();
return hay.includes(q)||String(card.columnId).toLowerCase().includes(q);
}
const BACKLOG='\u0000backlog';
const DEFAULT_FILTER='\u0000default';
function passesSprint(ctx,card,state){
if(state.sprint===undefined||!ctx.sprintProperty)return true;
const value=accessorFor(ctx.sprintProperty)(card.row);
if(state.sprint===BACKLOG)return isNil(value)||value==='';
return String(value)===String(state.sprint);
}
function passesEpic(ctx,card,state){
if(state.epic===undefined||!ctx.epicProperty)return true;
return String(accessorFor(ctx.epicProperty)(card.row))===String(state.epic);
}
function rollup(ctx,rows,property,isDone){
const get=accessorFor(property);
const points=ctx.pointsProperty?accessorFor(ctx.pointsProperty):()=>0;
const buckets=new Map();
for(const row of rows){
const value=get(row);
const id=isNil(value)?'':String(value);
let b=buckets.get(id);
if(!b){b={value,count:0,points:0,doneCount:0,donePoints:0,progress:0};buckets.set(id,b);}
const p=Number(points(row));
const pts=Number.isFinite(p)?p:0;
b.count+=1;
b.points+=pts;
if(isFunction(isDone)&&isDone(row)){b.doneCount+=1;b.donePoints+=pts;}
}
const out=[...buckets.values()];
for(const b of out){
const denom=b.points||b.count||1;
const num=b.points?b.donePoints:b.doneCount;
b.progress=Math.round((num/denom)*1000)/1000;
}
return out.sort((a,b)=>(b.points-a.points)||(b.count-a.count));
}
function laneIdOf(raw){
return isNil(raw)?'':String(raw);
}
function deriveLanes(ctx,columns,cardsByKey,state){
const laneOf=accessorFor(ctx.swimlaneProperty);
const configured=Array.isArray(ctx.lanes)
?ctx.lanes.map((l)=>(typeof l==='string'?{id:l}:l)):[];
const byId=new Map(configured.map((l)=>[l.id,l]));
let order=configured.map((l)=>l.id);
for(const card of cardsByKey.values()){
const id=laneIdOf(laneOf(card.row));
if(!byId.has(id)&&!order.includes(id))order.push(id);
}
if(Array.isArray(state.laneOrder)&&state.laneOrder.length){
const pinned=state.laneOrder.filter((id)=>order.includes(id));
order=[...pinned,...order.filter((id)=>!pinned.includes(id))];
}
const collapsed=state.collapsedLanes;
return order.map((id)=>{
const def=byId.get(id)||{id};
const laneColumns=columns.map((col)=>{
const cards=col.cards.filter((c)=>laneIdOf(laneOf(c.row))===id);
return{
id:col.id,
title:col.title,
cards,
count:cards.length,
points:cards.reduce((s,c)=>s+(c.hasPoints?c.points:0),0),
};
});
return{
id,
title:isNil(def.title)?(id===''?'':humanise(id)):String(def.title),
collapsed:!!(collapsed&&collapsed.has(id)),
columns:laneColumns,
count:laneColumns.reduce((s,c)=>s+c.count,0),
points:laneColumns.reduce((s,c)=>s+c.points,0),
};
});
}
function orderRank(value){
const n=Number(value);
return Number.isFinite(n)?n:Number.POSITIVE_INFINITY;
}
function computeOrders(neighbourOrders,index,count){
const at=Math.max(0,Math.min(index,neighbourOrders.length));
const prev=at>0?Number(neighbourOrders[at-1]):null;
const next=at<neighbourOrders.length?Number(neighbourOrders[at]):null;
const out=[];
const prevOk=prev!==null&&Number.isFinite(prev);
const nextOk=next!==null&&Number.isFinite(next);
if(!prevOk&&!nextOk){for(let i=0;i<count;i++)out.push(i);return out;}
if(!prevOk){for(let i=0;i<count;i++)out.push(next-(count-i));return out;}
if(!nextOk){for(let i=0;i<count;i++)out.push(prev+1+i);return out;}
const step=(next-prev)/(count+1);
for(let i=0;i<count;i++)out.push(prev+step*(i+1));
return out;
}
function windowRange(scrollTop,viewportHeight,rowHeight,count,overscan=3){
const h=rowHeight>0?rowHeight:1;
const start=Math.max(0,Math.floor(scrollTop/h)-overscan);
const visible=Math.ceil(viewportHeight/h)+overscan*2;
const end=Math.min(count,start+visible);
return{start,end,padTop:start*h,padBottom:Math.max(0,(count-end)*h)};
}
function deriveDoneColumns(doneColumnsCfg,columns){
return new Set([
...(Array.isArray(doneColumnsCfg)?doneColumnsCfg.map(String):[]),
...(Array.isArray(columns)
?columns.filter((c)=>isObject(c)&&c.done).map((c)=>String(c.id)):[]),
]);
}
function resolveContext(config){
const cfg=isObject(config)?config:{};
if(isNil(cfg.columnProperty)&&!cfg.grid&&!Array.isArray(cfg.columns)){
warnOnce('kanban:columnProperty','a board needs a "columnProperty" to group cards into columns.');
}
return{
grid:cfg.grid||null,
key:keyFn(cfg.rowKey??'id'),
rowKey:cfg.rowKey??'id',
columnProperty:cfg.columnProperty??null,
columns:cfg.columns??null,
columnOrder:cfg.columnOrder??null,
pointsProperty:cfg.pointsProperty??null,
orderProperty:cfg.orderProperty??null,
swimlaneProperty:cfg.swimlaneProperty??null,
sprintProperty:cfg.sprintProperty??null,
epicProperty:cfg.epicProperty??null,
enforceWip:!!cfg.enforceWip,
sprintList:Array.isArray(cfg.sprints)
?cfg.sprints.map((s)=>(isObject(s)?{id:s.id,title:s.title}:{id:s})):null,
swimlanes:!!cfg.swimlanes,
lanes:Array.isArray(cfg.lanes)?cfg.lanes:null,
doneColumns:deriveDoneColumns(cfg.doneColumns,cfg.columns),
showPoints:!!cfg.showPoints,
card:isObject(cfg.card)?cfg.card:{},
cardSpecs:cardSpecs(isObject(cfg.card)?cfg.card:{}),
emptyText:typeof cfg.emptyText==='string'?cfg.emptyText:'',
virtualize:cfg.virtualize?{
rowHeight:(isObject(cfg.virtualize)&&cfg.virtualize.rowHeight)||96,
overscan:(isObject(cfg.virtualize)&&cfg.virtualize.overscan)||3,
threshold:(isObject(cfg.virtualize)&&cfg.virtualize.threshold)||50,
viewport:(isObject(cfg.virtualize)&&cfg.virtualize.viewport)||600,
}:null,
};
}
});
__def("packages/modules/kanban/styles.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"NS",{enumerable:true,get:function(){return NS;}});
Object.defineProperty(__exports,"css",{enumerable:true,get:function(){return css;}});
Object.defineProperty(__exports,"injectStyles",{enumerable:true,get:function(){return injectStyles;}});
const NS='lat-kanban';
const STAMP='data-lattice-kanban-styles';
function css(){
return`
.${NS}{
  display:flex; flex-direction:row; align-items:stretch; gap:var(--lattice-gap,8px);
  box-sizing:border-box; width:100%; height:100%; min-height:0;
  overflow-x:auto; overflow-y:hidden;
  padding:var(--lattice-gap,8px);
  background:var(--lattice-background,#fff);
  color:var(--lattice-foreground,#1a1a1a);
  font-family:var(--lattice-font-family,system-ui,sans-serif);
  font-size:var(--lattice-font-size,13px);
  -webkit-overflow-scrolling:touch;
}
.${NS}__column{
  display:flex; flex-direction:column; min-height:0;
  flex:0 0 var(--lattice-board-column-width,280px);
  max-height:100%;
  border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  border-radius:var(--lattice-radius,6px);
  background:var(--lattice-background-subtle,var(--lattice-group-background,#f7f7f8));
}
.${NS}__column[data-collapsed="true"]{
  flex-basis:auto; align-self:flex-start;
}
.${NS}__column[data-collapsed="true"] .${NS}__cards{ display:none; }
.${NS}__column[data-over="true"] .${NS}__header{
  box-shadow:inset 3px 0 0 var(--lattice-danger,#c0392b);
}
.${NS}__header{
  position:sticky; top:0; z-index:1;
  display:flex; align-items:center; gap:6px;
  padding:var(--lattice-cell-padding-y,6px) var(--lattice-cell-padding-x,8px);
  border-bottom:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  border-top-left-radius:inherit; border-top-right-radius:inherit;
  background:var(--lattice-header-bg,var(--lattice-background,#fff));
  font-weight:var(--lattice-header-font-weight,600);
}
.${NS}__accent{
  width:8px; height:8px; border-radius:50%; flex:0 0 auto;
  background:var(--lattice-accent,#2d7ff9);
}
.${NS}__title{ flex:1 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.${NS}__count{
  flex:0 0 auto; padding:1px 7px; border-radius:var(--lattice-radius-pill,999px);
  background:var(--lattice-muted,#e8e8ea); color:var(--lattice-muted-text,#555);
  font-variant-numeric:tabular-nums; font-weight:600;
}
.${NS}__count[data-over="true"]{
  background:var(--lattice-danger,#c0392b);
  color:var(--lattice-accent-contrast,#fff);
}
.${NS}__points{
  flex:0 0 auto; color:var(--lattice-foreground-muted,#777);
  font-variant-numeric:tabular-nums; font-weight:500;
}
.${NS}__cards{
  flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden;
  display:flex; flex-direction:column; gap:6px;
  padding:6px; margin:0; list-style:none;
}
.${NS}__empty{
  color:var(--lattice-foreground-muted,#999); text-align:center;
  padding:16px 8px; font-style:italic;
}
.${NS}__card{
  position:relative; box-sizing:border-box;
  border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  border-radius:var(--lattice-radius-sm,4px);
  background:var(--lattice-background,#fff);
  padding:8px 10px; cursor:default;
}
.${NS}__card[data-accent]{ border-left-width:3px; }
/* Card aging / SLA (BACKLOG-0000960): a subtle warn bar, a stronger breach bar
   plus a faint tint. An inset box-shadow (not a border) so it composes with the
   accent border and the selection outline instead of fighting them. */
.${NS}__card[data-sla="warn"]{
  box-shadow:inset 3px 0 0 var(--lattice-warning,#e8a317);
}
.${NS}__card[data-sla="breach"]{
  box-shadow:inset 3px 0 0 var(--lattice-danger,#c0392b);
  background:var(--lattice-danger-subtle,#fdf0ef);
}
.${NS}__age{
  padding:0 6px; border-radius:var(--lattice-radius-pill,999px);
  background:var(--lattice-muted,#e8e8ea); color:var(--lattice-muted-text,#555);
  font-variant-numeric:tabular-nums; font-weight:600;
}
.${NS}__age[data-sla="warn"]{
  background:var(--lattice-warning,#e8a317); color:var(--lattice-accent-contrast,#fff);
}
.${NS}__age[data-sla="breach"]{
  background:var(--lattice-danger,#c0392b); color:var(--lattice-accent-contrast,#fff);
}
.${NS}__card[draggable="true"]{ cursor:grab; }
.${NS}__card[data-dragging="true"]{ opacity:.5; }
.${NS}__card[data-selected="true"]{
  outline:2px solid var(--lattice-selection-background,var(--lattice-accent,#2d7ff9));
  outline-offset:-1px;
  background:var(--lattice-selected-background,var(--lattice-range-background,#eaf2ff));
}
.${NS}__card:focus-visible{
  outline:var(--lattice-focus-width,2px) solid var(--lattice-focus-color,var(--lattice-accent,#2d7ff9));
  outline-offset:var(--lattice-focus-offset,1px);
}
.${NS}__drop{
  height:0; margin:0; list-style:none; padding:0;
  border-top:2px solid var(--lattice-accent,#2d7ff9);
}
.${NS}__menu{
  z-index:10; margin:0; padding:4px 0; list-style:none;
  min-width:160px; border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  border-radius:var(--lattice-radius,6px); background:var(--lattice-background,#fff);
  box-shadow:var(--lattice-popup-shadow,0 4px 16px rgba(0,0,0,.18));
  color:var(--lattice-foreground,#1a1a1a);
}
.${NS}__menuitem{
  padding:6px 14px; cursor:pointer; white-space:nowrap;
}
.${NS}__menuitem:hover,.${NS}__menuitem:focus-visible{
  background:var(--lattice-hovered-background,var(--lattice-background-subtle,#f0f0f2)); outline:none;
}
.${NS}__menuitem[aria-disabled="true"]{ color:var(--lattice-foreground-muted,#999); cursor:default; }
.${NS}__cover{
  height:var(--lattice-board-cover-height,96px); margin:-8px -10px 8px;
  border-top-left-radius:inherit; border-top-right-radius:inherit;
  background-size:cover; background-position:center; background-repeat:no-repeat;
}
.${NS}__card-title{ font-weight:600; }
.${NS}__card-subtitle{ color:var(--lattice-foreground-muted,#777); margin-top:2px; }
.${NS}__progress{
  height:4px; margin-top:6px; border-radius:999px; overflow:hidden;
  background:var(--lattice-muted,#e8e8ea);
}
.${NS}__progress-bar{
  display:block; height:100%; border-radius:inherit;
  background:var(--lattice-accent,#2d7ff9);
}
.${NS}__card-meta{
  display:flex; flex-wrap:wrap; gap:4px; align-items:center; margin-top:6px;
  color:var(--lattice-foreground-muted,#777); font-size:var(--lattice-font-size-sm,12px);
}
.${NS}__label{
  padding:0 6px; border-radius:var(--lattice-radius-pill,999px);
  background:var(--lattice-muted,#e8e8ea); color:var(--lattice-muted-text,#555);
}
.${NS}__badge{ font-weight:600; }
.${NS}__badge[data-tone="danger"]{ color:var(--lattice-danger,#c0392b); }
.${NS}[data-readonly="true"]{ cursor:default; }
.${NS}__toggle{
  flex:0 0 auto; background:none; border:none; cursor:pointer;
  font:inherit; color:inherit; padding:0 2px; line-height:1;
}
.${NS}__column[data-collapsed="true"] .${NS}__header{ writing-mode:initial; }
/* --- Swimlanes: a 2D lane x column grid, columns aligned across lanes ------ */
.${NS}[data-swimlanes="true"]{
  flex-direction:column; align-items:stretch; overflow:auto;
}
.${NS}[data-swimlanes="true"] .${NS}__header{ position:static; border-radius:var(--lattice-radius,6px); border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0); }
.${NS}__colheads,.${NS}__lanerow{
  display:grid;
  grid-template-columns:var(--lattice-kanban-lane-label,160px) repeat(var(--cols,1), var(--lattice-board-column-width,280px));
  gap:var(--lattice-gap,8px); align-items:start;
}
.${NS}__colheads{ position:sticky; top:0; z-index:2; padding-bottom:4px; background:var(--lattice-background,#fff); }
.${NS}__corner{ position:sticky; left:0; background:var(--lattice-background,#fff); }
.${NS}__lane{ border-top:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0); }
.${NS}__lanehead{
  position:sticky; left:0; z-index:1; display:flex; align-items:center; gap:6px;
  padding:var(--lattice-cell-padding-y,6px) var(--lattice-cell-padding-x,8px);
  font-weight:var(--lattice-header-font-weight,600);
  background:var(--lattice-background-subtle,#f7f7f8);
}
.${NS}__lane-title{ flex:1 1 auto; }
.${NS}__lane[data-collapsed="true"] .${NS}__lanerow{ display:none; }
.${NS}__lanerow .${NS}__cards{
  border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  border-radius:var(--lattice-radius,6px); background:var(--lattice-background-subtle,#f7f7f8);
  max-height:none;
}
.${NS}__drill{
  position:absolute; top:6px; right:6px; background:none; border:none; cursor:pointer;
  font:inherit; color:var(--lattice-foreground-muted,#777); padding:0 2px; line-height:1;
}
.${NS}__drill:hover,.${NS}__drill:focus-visible{ color:var(--lattice-accent,#2d7ff9); }
/* --- Card pop-out: a nested child grid (drawer / modal / inline) ----------- */
.${NS}__detail{
  display:flex; flex-direction:column; box-sizing:border-box;
  background:var(--lattice-background,#fff); color:var(--lattice-foreground,#1a1a1a);
  border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  border-radius:var(--lattice-radius,6px);
}
.${NS}__detail[data-present="drawer"]{
  position:absolute; top:0; right:0; height:100%; width:min(560px, 80%);
  border-radius:0; box-shadow:var(--lattice-popup-shadow,0 4px 24px rgba(0,0,0,.2)); z-index:20;
}
.${NS}__detail[data-present="inline"]{ width:100%; margin:6px 0; }
.${NS}__overlay{
  position:absolute; inset:0; z-index:30; display:flex; align-items:center; justify-content:center;
  background:var(--lattice-overlay-background,rgba(0,0,0,.4));
}
.${NS}__detail[data-present="modal"]{ width:min(720px, 90%); max-height:85%; box-shadow:var(--lattice-popup-shadow,0 8px 32px rgba(0,0,0,.3)); }
.${NS}__detail-head{
  display:flex; align-items:center; gap:8px;
  padding:var(--lattice-cell-padding-y,6px) var(--lattice-cell-padding-x,10px);
  border-bottom:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  font-weight:var(--lattice-header-font-weight,600);
}
.${NS}__detail-title{ flex:1 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.${NS}__detail-close{ background:none; border:none; cursor:pointer; font:inherit; color:inherit; padding:0 4px; }
.${NS}__detail-body{ flex:1 1 auto; min-height:0; overflow:auto; padding:8px; }
.${NS}__spacer{ list-style:none; margin:0; padding:0; }
.${NS}__editor{
  box-sizing:border-box; width:100%; margin-top:4px; font:inherit;
  padding:4px 6px; border:var(--lattice-border-width,1px) solid var(--lattice-accent,#2d7ff9);
  border-radius:var(--lattice-radius-sm,4px);
  color:var(--lattice-foreground,#1a1a1a); background:var(--lattice-background,#fff);
}
.${NS}__add{
  flex:0 0 auto; margin:6px; padding:6px; font:inherit; cursor:pointer;
  border:1px dashed var(--lattice-border-color,#e0e0e0); border-radius:var(--lattice-radius-sm,4px);
  background:none; color:var(--lattice-foreground-muted,#777);
}
.${NS}__add:hover,.${NS}__add:focus-visible{ color:var(--lattice-accent,#2d7ff9); border-color:var(--lattice-accent,#2d7ff9); }
.${NS}__status{
  position:absolute; top:8px; left:50%; transform:translateX(-50%); z-index:40;
  padding:6px 14px; border-radius:var(--lattice-radius,6px);
  background:var(--lattice-background,#fff); color:var(--lattice-foreground,#1a1a1a);
  border:var(--lattice-border-width,1px) solid var(--lattice-border-color,#e0e0e0);
  box-shadow:var(--lattice-popup-shadow,0 2px 8px rgba(0,0,0,.15));
}
.${NS}__status[data-kind="error"]{
  border-color:var(--lattice-danger,#c0392b); color:var(--lattice-danger,#c0392b);
}
@media (forced-colors: active){
  .${NS}__card,.${NS}__column,.${NS}__header{ border-color:CanvasText; }
  .${NS}__card:focus-visible{ outline-color:Highlight; }
}
`.trim();
}
function injectStyles(doc){
const root=doc&&doc.documentElement;
if(!root||root.getAttribute(STAMP))return;
root.setAttribute(STAMP,'1');
const style=doc.createElement('style');
style.textContent=css();
(doc.head||doc.body||root).appendChild(style);
}
});
__def("packages/modules/kanban/view.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"FALLBACK_EN",{enumerable:true,get:function(){return FALLBACK_EN;}});
Object.defineProperty(__exports,"Emitter",{enumerable:true,get:function(){return Emitter;}});
Object.defineProperty(__exports,"resolveReadonly",{enumerable:true,get:function(){return resolveReadonly;}});
Object.defineProperty(__exports,"renderPreserving",{enumerable:true,get:function(){return renderPreserving;}});
Object.defineProperty(__exports,"renderBoard",{enumerable:true,get:function(){return renderBoard;}});
Object.defineProperty(__exports,"openDetail",{enumerable:true,get:function(){return openDetail;}});
Object.defineProperty(__exports,"closeDetail",{enumerable:true,get:function(){return closeDetail;}});
Object.defineProperty(__exports,"startEdit",{enumerable:true,get:function(){return startEdit;}});
Object.defineProperty(__exports,"installSelectionPainter",{enumerable:true,get:function(){return installSelectionPainter;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const escapeHtml=__m0["escapeHtml"];
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/kanban/styles.js");
const NS=__m1["NS"];
const injectStyles=__m1["injectStyles"];
const __m2=__req("packages/modules/kanban/model.js");
const windowRange=__m2["windowRange"];
const FALLBACK_EN=Object.freeze({
'kanban.columnCards':{one:'{title}, {count} card',other:'{title}, {count} cards'},
'kanban.laneCards':{
one:'{lane}, {title}, {count} card',
other:'{lane}, {title}, {count} cards',
},
});
function formatFallback(key,params){
const message=FALLBACK_EN[key];
if(!message)return key;
const count=params&&typeof params.count==='number'?params.count:NaN;
const template=(count===1?message.one:message.other)||message.other;
return template.replace(/\{(\w+)\}/g,(m,name)=>(params&&name in params?String(params[name]):m));
}
function t(board,key,params){
const cfg=board&&board.config?board.config:{};
const host=(cfg.messages&&isFunction(cfg.messages.t)&&cfg.messages)
||(cfg.grid&&cfg.grid.messages&&isFunction(cfg.grid.messages.t)&&cfg.grid.messages)
||null;
if(host){
let text;
try{text=host.t(key,params);}catch{text=null;}
if(typeof text==='string'&&text&&text!==key)return text;
}
return formatFallback(key,params);
}
class Emitter{
#handlers=new Map();
on(name,fn){
if(!isFunction(fn))return()=>{};
if(!this.#handlers.has(name))this.#handlers.set(name,new Set());
this.#handlers.get(name).add(fn);
return()=>this.off(name,fn);
}
off(name,fn){
const set=this.#handlers.get(name);
if(set)set.delete(fn);
}
emit(name,payload){
const set=this.#handlers.get(name);
if(!set)return;
for(const fn of[...set])fn(payload);
}
emitBefore(name,payload,origin){
const chosen=origin??(payload&&payload.origin);
const resolved=(chosen==='api'||chosen==='user'||chosen==='init'||chosen==='ai')?chosen:'user';
let prevented=false;
let reason=null;
const prevent=(r)=>{
prevented=true;
if(r!=null&&reason===null)reason=String(r);
};
const event={
...(payload||null),
type:name,
origin:resolved,
get defaultPrevented(){return prevented;},
get reason(){return reason;},
preventDefault(r){prevent(r);},
};
const set=this.#handlers.get(name);
if(!set||set.size===0)return true;
const handlers=[...set];
const settle=()=>{
if(prevented&&reason===null)reason='prevented';
if(prevented&&payload&&typeof payload==='object')payload.reason=reason;
return!prevented;
};
const pending=[];
for(const handler of handlers){
try{
const ret=handler(event);
if(ret&&typeof((ret).then)==='function')pending.push(ret);
else if(ret===false)prevent('prevented');
}catch(err){
prevent('error');
warnOnce(`kanban:beforeThrow:${name}`,
`a '${name}' before-handler threw; the action was cancelled.`,err);
}
}
if(pending.length===0)return settle();
return Promise.allSettled(pending).then((results)=>{
for(const res of results){
if(res.status==='rejected'){
prevent('error');
warnOnce(`kanban:beforeReject:${name}`,
`a '${name}' before-handler rejected; the action was cancelled.`,res.reason);
}else if(res.value===false){
prevent('prevented');
}
}
return settle();
});
}
}
function resolveReadonly(readonly){
if(readonly===true)return()=>true;
if(!readonly||typeof readonly!=='object')return()=>false;
const cols=readonly.columns||{};
const cards=readonly.cards||{};
return({column,card}={})=>{
if(readonly.board===true)return true;
if(!isNil(column)&&cols[column]===true)return true;
if(!isNil(card)&&cards[card]===true)return true;
return false;
};
}
function cardLabel(card,column,index,total,sla=null){
const title=card.fields.title||String(card.key);
const base=`${title}, ${column.title}, ${index+1} of ${total}`;
if(sla&&(sla.level==='warn'||sla.level==='breach')){
return`${base}, ${sla.level==='breach'?'SLA breached':'ageing'}, age ${sla.ageText}`;
}
return base;
}
function ageTitle(sla){
if(sla.level==='breach')return`SLA breached — age ${sla.ageText} (limit passed)`;
if(sla.level==='warn')return`Ageing — age ${sla.ageText}`;
return`Age ${sla.ageText}`;
}
function renderCard(board,card,column,index){
const{ctx,doc,isReadonly}=board;
const el=doc.createElement('li');
el.className=`${NS}__card`;
el.setAttribute('role','listitem');
el.setAttribute('tabindex','-1');
el.setAttribute('data-key',String(card.key));
el.dataset.column=column.id;
const sla=board.sla&&isFunction(board.sla.stateFor)?board.sla.stateFor(card):null;
if(sla&&sla.level&&sla.level!=='ok')el.dataset.sla=sla.level;
el.setAttribute('aria-label',cardLabel(card,column,index,column.count,sla));
el.setAttribute('aria-selected','false');
const cardReadonly=isReadonly({column:column.id,card:card.key});
if(cardReadonly)el.setAttribute('aria-readonly','true');
el.setAttribute('draggable',cardReadonly?'false':'true');
const accent=card.fields.accent;
if(!isNil(accent)&&accent!==''){
el.dataset.accent='';
el.style.borderLeftColor=String(accent);
}
const custom=board.config.cardRenderer;
if(isFunction(custom)){
el.dataset.custom='true';
const out=custom(card,{
column,readonly:cardReadonly,el,doc,
});
if(typeof out==='string')el.innerHTML=out;
else if(out&&out.nodeType)el.appendChild(out);
return el;
}
const parts=[];
if(!isNil(card.fields.cover)&&card.fields.cover!==''){
parts.push(`<div class="${NS}__cover" style="background-image:url(${escapeHtml(String(card.fields.cover))})" role="presentation"></div>`);
}
if(card.fields.title)parts.push(`<div class="${NS}__card-title">${escapeHtml(card.fields.title)}</div>`);
if(card.fields.subtitle){
parts.push(`<div class="${NS}__card-subtitle">${escapeHtml(card.fields.subtitle)}</div>`);
}
const pct=progressPercent(card.fields.progress);
if(pct!==null){
parts.push(`<div class="${NS}__progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">`
+`<span class="${NS}__progress-bar" style="width:${pct}%"></span></div>`);
}
const meta=[];
if(card.fields.assignee)meta.push(`<span class="${NS}__assignee">${escapeHtml(card.fields.assignee)}</span>`);
if(card.fields.labels){
for(const label of String(card.fields.labels).split(',').map((s)=>s.trim()).filter(Boolean)){
meta.push(`<span class="${NS}__label">${escapeHtml(label)}</span>`);
}
}
if(card.fields.due)meta.push(`<span class="${NS}__due">${escapeHtml(card.fields.due)}</span>`);
if(card.fields.badges){
meta.push(`<span class="${NS}__badge">${escapeHtml(card.fields.badges)}</span>`);
}
if(ctx.pointsProperty&&card.hasPoints){
meta.push(`<span class="${NS}__badge" data-role="points">${escapeHtml(String(card.points))}</span>`);
}
if(sla&&sla.ageText&&(sla.level==='warn'||sla.level==='breach'
||(board.sla.config.showAge==='always'&&sla.ageMs!==null))){
meta.push(`<span class="${NS}__age" data-sla="${escapeHtml(sla.level||'')}"`
+` title="${escapeHtml(ageTitle(sla))}">${escapeHtml(sla.ageText)}</span>`);
}
if(meta.length)parts.push(`<div class="${NS}__card-meta">${meta.join('')}</div>`);
el.innerHTML=parts.join('');
return el;
}
function progressPercent(raw){
if(isNil(raw)||raw==='')return null;
const n=Number(String(raw).replace('%','').trim());
if(!Number.isFinite(n))return null;
const pct=n<=1&&n>=0?n*100:n;
return Math.max(0,Math.min(100,Math.round(pct)));
}
function renderColumn(board,column){
const{ctx,doc}=board;
const el=doc.createElement('section');
el.className=`${NS}__column`;
el.setAttribute('role','group');
el.dataset.column=column.id;
if(column.collapsed)el.dataset.collapsed='true';
if(column.over)el.dataset.over='true';
const headerId=`${NS}-h-${cssId(column.id)}`;
const header=columnHeader(ctx,column,headerId,doc);
el.setAttribute('aria-labelledby',headerId);
el.appendChild(header);
const list=doc.createElement('ul');
list.className=`${NS}__cards`;
list.dataset.column=column.id;
list.setAttribute('role','list');
list.setAttribute('aria-label',t(board,'kanban.columnCards',{title:column.title,count:column.count}));
fillList(board,list,column.cards,column);
el.appendChild(list);
if(board.config.addCard&&!board.isReadonly({column:column.id})){
const add=doc.createElement('button');
add.className=`${NS}__add`;
add.setAttribute('type','button');
add.dataset.column=column.id;
const addLabel=board.config.labels&&board.config.labels.addCard;
add.setAttribute('aria-label',[addLabel,column.title].filter(Boolean).join(' '));
add.textContent=addLabel||'+';
el.appendChild(add);
}
return el;
}
function fillList(board,list,cards,column,laneId){
const{ctx,doc}=board;
while(list.firstChild)list.removeChild(list.firstChild);
const add=(card,i)=>{
const cardEl=renderCard(board,card,column,i);
if(laneId!==undefined)cardEl.dataset.lane=laneId;
list.appendChild(cardEl);
};
if(!cards.length){
const empty=doc.createElement('li');
empty.className=`${NS}__empty`;
empty.setAttribute('role','presentation');
if(ctx.emptyText)empty.textContent=ctx.emptyText;
list.appendChild(empty);
return;
}
const v=ctx.virtualize;
if(v&&cards.length>v.threshold){
list.dataset.virtual='true';
const renderWindow=()=>{
const viewport=list.clientHeight||v.viewport;
const w=windowRange(list.scrollTop||0,viewport,v.rowHeight,cards.length,v.overscan);
const prev=list.__win;
if(prev&&prev.start===w.start&&prev.end===w.end&&prev.count===cards.length)return;
list.__win={start:w.start,end:w.end,count:cards.length};
while(list.firstChild)list.removeChild(list.firstChild);
list.appendChild(spacer(doc,w.padTop));
for(let i=w.start;i<w.end;i++)add(cards[i],i);
list.appendChild(spacer(doc,w.padBottom));
if(isFunction(board.paintSelection))board.paintSelection();
};
list.__win=null;
renderWindow();
if(!list.__virtualWired){
const onScroll=()=>{
if(list.__raf)return;
const view=doc.defaultView;
const raf=(view&&isFunction(view.requestAnimationFrame))
?view.requestAnimationFrame.bind(view):((fn)=>setTimeout(fn,16));
list.__raf=raf(()=>{list.__raf=0;renderWindow();});
};
list.addEventListener('scroll',onScroll);
list.__virtualWired=true;
}
return;
}
cards.forEach(add);
}
function renderStatus(board){
const{el,doc}=board;
const st=board.status||{};
if(!st.loading&&!st.error)return;
const banner=doc.createElement('div');
banner.className=`${NS}__status`;
if(st.error){
banner.dataset.kind='error';
banner.setAttribute('role','alert');
banner.textContent=st.error;
}else{
banner.dataset.kind='loading';
banner.setAttribute('role','status');
banner.setAttribute('aria-busy','true');
const t=board.config.labels&&board.config.labels.loading;
if(t)banner.textContent=t;
}
el.appendChild(banner);
}
function spacer(doc,height){
const li=doc.createElement('li');
li.className=`${NS}__spacer`;
li.setAttribute('role','presentation');
li.style.height=`${height}px`;
return li;
}
function columnHeader(ctx,column,headerId,doc){
const header=doc.createElement('div');
header.className=`${NS}__header`;
header.id=headerId;
header.dataset.column=column.id;
header.setAttribute('draggable','true');
header.appendChild(toggleButton(column.collapsed,doc));
const content=doc.createElement('span');
content.className=`${NS}__headcontent`;
const pieces=[];
if(column.color)pieces.push(`<span class="${NS}__accent" style="background:${escapeHtml(String(column.color))}"></span>`);
pieces.push(`<span class="${NS}__title">${escapeHtml(column.title)}</span>`);
const overAttr=column.over?' data-over="true"':'';
pieces.push(`<span class="${NS}__count"${overAttr}>${column.count}${column.wipLimit!==null?`/${column.wipLimit}`:''}</span>`);
if(ctx.showPoints&&ctx.pointsProperty){
pieces.push(`<span class="${NS}__points" title="points">${formatPoints(column.points)}</span>`);
}
content.innerHTML=pieces.join('');
header.appendChild(content);
return header;
}
function toggleButton(collapsed,doc){
const btn=doc.createElement('button');
btn.className=`${NS}__toggle`;
btn.setAttribute('type','button');
btn.setAttribute('tabindex','-1');
btn.setAttribute('aria-expanded',collapsed?'false':'true');
btn.textContent=collapsed?'▸':'▾';
return btn;
}
function renderSwimlanes(board){
const{el,ctx,doc}=board;
el.dataset.swimlanes='true';
const columns=board.model.columns;
const heads=doc.createElement('div');
heads.className=`${NS}__colheads`;
heads.style.setProperty('--cols',String(columns.length));
const corner=doc.createElement('div');
corner.className=`${NS}__corner`;
heads.appendChild(corner);
for(const column of columns)heads.appendChild(columnHeader(ctx,column,`${NS}-h-${cssId(column.id)}`,doc));
el.appendChild(heads);
for(const lane of board.model.lanes){
const band=doc.createElement('section');
band.className=`${NS}__lane`;
band.dataset.lane=lane.id;
if(lane.collapsed)band.dataset.collapsed='true';
band.setAttribute('role','group');
const laneHead=doc.createElement('div');
laneHead.className=`${NS}__lanehead`;
laneHead.dataset.lane=lane.id;
laneHead.setAttribute('draggable','true');
laneHead.appendChild(toggleButton(lane.collapsed,doc));
const laneContent=doc.createElement('span');
laneContent.className=`${NS}__headcontent`;
const points=(ctx.showPoints&&ctx.pointsProperty)?`<span class="${NS}__points">${formatPoints(lane.points)}</span>`:'';
laneContent.innerHTML=`<span class="${NS}__lane-title">${escapeHtml(lane.title)}</span>`
+`<span class="${NS}__count">${lane.count}</span>${points}`;
laneHead.appendChild(laneContent);
band.appendChild(laneHead);
if(!lane.collapsed){
const row=doc.createElement('div');
row.className=`${NS}__lanerow`;
row.style.setProperty('--cols',String(columns.length));
const laneSpacer=doc.createElement('div');
laneSpacer.className=`${NS}__corner`;
row.appendChild(laneSpacer);
for(const cell of lane.columns){
const list=doc.createElement('ul');
list.className=`${NS}__cards`;
list.dataset.column=cell.id;
list.dataset.lane=lane.id;
list.setAttribute('role','list');
list.setAttribute('aria-label',t(board,'kanban.laneCards',{
lane:lane.title,title:cell.title,count:cell.count,
}));
const colDesc=columns.find((c)=>c.id===cell.id)||cell;
fillList(board,list,cell.cards,colDesc,lane.id);
row.appendChild(list);
}
band.appendChild(row);
}
el.appendChild(band);
}
}
function captureViewState(board){
const{el,doc}=board;
if(!el)return null;
const lists={};
for(const list of el.querySelectorAll(`.${NS}__cards`)){
lists[`${list.dataset.lane||''}|${list.dataset.column}`]=list.scrollTop;
}
const active=doc&&doc.activeElement&&doc.activeElement.closest
?doc.activeElement.closest(`.${NS}__card`):null;
return{
boardTop:el.scrollTop,
boardLeft:el.scrollLeft,
lists,
focusKey:active?active.dataset.key:null,
};
}
function restoreViewState(board,snap){
const{el}=board;
if(!el||!snap)return;
el.scrollTop=snap.boardTop;
el.scrollLeft=snap.boardLeft;
for(const list of el.querySelectorAll(`.${NS}__cards`)){
const key=`${list.dataset.lane||''}|${list.dataset.column}`;
if(snap.lists[key]!==undefined)list.scrollTop=snap.lists[key];
}
if(snap.focusKey!=null){
const card=el.querySelector(`.${NS}__card[data-key="${cssAttr(String(snap.focusKey))}"]`);
if(card){card.setAttribute('tabindex','0');if(card.focus)card.focus();}
}
}
function renderPreserving(board){
if(!board.el){return;}
const snap=captureViewState(board);
const savedDetail=board.detail;
const savedOverlay=board.detailOverlay;
const detached=savedOverlay||(savedDetail&&savedDetail.el);
if(detached&&detached.parentNode)detached.parentNode.removeChild(detached);
board.detail=null;
board.detailOverlay=null;
renderBoard(board);
if(savedDetail){
board.el.appendChild(detached);
board.detail=savedDetail;
board.detailOverlay=savedOverlay;
}
restoreViewState(board,snap);
}
function formatPoints(points){
return Number.isInteger(points)?String(points):String(Math.round(points*100)/100);
}
function cssId(id){
return String(id).replace(/[^\w-]/g,'_');
}
function renderBoard(board){
const{el,ctx,doc}=board;
if(!el)return;
if(board.sla&&isFunction(board.sla.sync))board.sla.sync();
injectStyles(doc);
closeContextMenu(board);
cancelEdit(board);
closeDetail(board);
el.classList.add(NS);
el.setAttribute('role','group');
el.setAttribute('aria-label',board.config.ariaLabel||'Board');
if(board.isReadonly({}))el.dataset.readonly='true';else delete el.dataset.readonly;
while(el.firstChild)el.removeChild(el.firstChild);
if(board.model.lanes){
renderSwimlanes(board);
}else{
delete el.dataset.swimlanes;
for(const column of board.model.columns){
el.appendChild(renderColumn(board,column));
}
}
renderStatus(board);
const live=doc.createElement('div');
live.className=`${NS}__live`;
live.setAttribute('aria-live','polite');
live.setAttribute('role','status');
live.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
el.appendChild(live);
board.live=live;
setInitialFocus(el);
board.paintSelection();
addDrillButtons(board);
if(!board.wired){wireEvents(board);board.wired=true;}
}
function addDrillButtons(board){
if(!board.el||!isFunction(board.canExpand))return;
const labelExpand=board.config.labels&&board.config.labels.expand;
for(const cardEl of board.el.querySelectorAll(`.${NS}__card`)){
const card=board.model.cardsByKey.get(keyFromDataset(board,cardEl.dataset.key));
if(!card||!board.canExpand(card))continue;
const btn=board.doc.createElement('button');
btn.className=`${NS}__drill`;
btn.setAttribute('type','button');
btn.setAttribute('tabindex','-1');
btn.setAttribute('aria-label',[labelExpand,card.fields.title||String(card.key)].filter(Boolean).join(' '));
btn.textContent='⤢';
cardEl.appendChild(btn);
}
}
function openDetail(board,card,rows,depth){
if(!board.el)return null;
closeDetail(board);
const{doc}=board;
const present=(board.config.children&&board.config.children.present)||'drawer';
const panel=doc.createElement('section');
panel.className=`${NS}__detail`;
panel.dataset.present=present;
panel.dataset.depth=String(depth);
panel.setAttribute('role',present==='modal'?'dialog':'group');
panel.setAttribute('aria-modal',present==='modal'?'true':'false');
const head=doc.createElement('div');
head.className=`${NS}__detail-head`;
const title=doc.createElement('span');
title.className=`${NS}__detail-title`;
const titleFn=board.config.children&&board.config.children.title;
title.textContent=isFunction(titleFn)?String(titleFn(card)):(card.fields.title||String(card.key));
const close=doc.createElement('button');
close.className=`${NS}__detail-close`;
close.setAttribute('type','button');
const closeLabel=board.config.labels&&board.config.labels.close;
if(closeLabel)close.setAttribute('aria-label',closeLabel);
close.textContent='✕';
head.appendChild(title);
head.appendChild(close);
const body=doc.createElement('div');
body.className=`${NS}__detail-body`;
panel.appendChild(head);
panel.appendChild(body);
let host=board.el;
if(present==='modal'){
const overlay=doc.createElement('div');
overlay.className=`${NS}__overlay`;
overlay.appendChild(panel);
board.el.appendChild(overlay);
board.detailOverlay=overlay;
}else if(present==='inline'){
const cardEl=board.el.querySelector(`.${NS}__card[data-key="${cssAttr(String(card.key))}"]`);
host=cardEl&&cardEl.parentNode?cardEl.parentNode:board.el;
if(cardEl&&cardEl.nextSibling)host.insertBefore(panel,cardEl.nextSibling);else host.appendChild(panel);
}else{
board.el.appendChild(panel);
}
const handle=board.buildChild(body,card,rows,depth);
board.detail={el:panel,handle,card};
if(close.focus)close.focus();
return board.detail;
}
function closeDetail(board){
if(!board.detail)return;
const{handle,el}=board.detail;
if(handle&&isFunction(handle.destroy))handle.destroy();
const container=board.detailOverlay||el;
if(container&&container.parentNode)container.parentNode.removeChild(container);
board.detail=null;
board.detailOverlay=null;
}
function startEdit(board,key,field){
if(!board.el)return null;
cancelEdit(board);
const cardEl=board.el.querySelector(`.${NS}__card[data-key="${cssAttr(String(key))}"]`);
if(!cardEl)return null;
const card=board.model.cardsByKey.get(key);
const spec=board.ctx.cardSpecs[field]||{};
const value=(card&&card.fields[field])||'';
if(isFunction(spec.editor)){
const ed=spec.editor({
card,field,value,commit:(v)=>commitEdit(board,v),cancel:()=>cancelEdit(board),
});
board.editing={key,field,custom:ed};
if(ed&&ed.el)cardEl.appendChild(ed.el);
if(ed&&isFunction(ed.focus))ed.focus();
else if(ed&&ed.el&&ed.el.focus)ed.el.focus();
return board.editing;
}
const input=board.doc.createElement('input');
input.className=`${NS}__editor`;
input.dataset.field=field;
input.value=value;
input.addEventListener('keydown',(e)=>{
if(e.stopPropagation)e.stopPropagation();
if(e.key==='Enter'){if(e.preventDefault)e.preventDefault();commitEdit(board,input.value);}
else if(e.key==='Escape'){if(e.preventDefault)e.preventDefault();cancelEdit(board);}
});
input.addEventListener('blur',()=>{if(board.editing&&board.editing.input===input)commitEdit(board,input.value);});
board.editing={key,field,input};
cardEl.appendChild(input);
if(input.focus)input.focus();
if(input.select)input.select();
return board.editing;
}
function commitEdit(board,value){
const e=board.editing;
if(!e)return;
board.editing=null;
if(e.custom&&isFunction(e.custom.destroy))e.custom.destroy();
else if(e.input&&e.input.parentNode)e.input.parentNode.removeChild(e.input);
board.applyEdit(e.key,e.field,value);
}
function cancelEdit(board){
const e=board.editing;
if(!e)return;
board.editing=null;
if(e.custom&&isFunction(e.custom.destroy))e.custom.destroy();
else if(e.input&&e.input.parentNode)e.input.parentNode.removeChild(e.input);
}
function setInitialFocus(el){
const first=el.querySelector(`.${NS}__card`);
if(first)first.setAttribute('tabindex','0');
}
function announce(board,message){
if(board.live)board.live.textContent=message;
}
function label(board,kind){
const labels=board.config.labels;
return(labels&&typeof labels[kind]==='string')?labels[kind]:'';
}
function positionMessage(board,card,columnId,index,verb=''){
const column=board.model.columns.find((c)=>c.id===columnId);
const total=column?Math.max(column.count,index+1):index+1;
const title=card.fields.title||String(card.key);
const colTitle=column?column.title:columnId;
return[verb,title,colTitle,`${index+1}/${total}`].filter(Boolean).join(', ');
}
function installSelectionPainter(board){
board.paintSelection=()=>{
if(!board.el)return;
for(const cardEl of board.el.querySelectorAll(`.${NS}__card`)){
const key=keyFromDataset(board,cardEl.dataset.key);
const on=board.selectionSet&&board.selectionSet.has(key);
if(on)cardEl.dataset.selected='true';else delete cardEl.dataset.selected;
cardEl.setAttribute('aria-selected',on?'true':'false');
}
};
}
function wireEvents(board){
const{el}=board;
el.addEventListener('click',(ev)=>{
if(ev.target&&ev.target.closest){
if(ev.target.closest(`.${NS}__detail-close`)){if(ev.preventDefault)ev.preventDefault();board.closeDetail();return;}
const addBtn=ev.target.closest(`.${NS}__add`);
if(addBtn){if(ev.preventDefault)ev.preventDefault();board.addCard(addBtn.dataset.column);return;}
const drill=ev.target.closest(`.${NS}__drill`);
if(drill){
if(ev.preventDefault)ev.preventDefault();
const card=cardFor(board,drill);
if(card)board.expand(card.card.key);
return;
}
}
const toggle=ev.target&&ev.target.closest?ev.target.closest(`.${NS}__toggle`):null;
if(toggle){
const header=toggle.closest(`.${NS}__header, .${NS}__lanehead`);
if(ev.preventDefault)ev.preventDefault();
if(header&&header.classList.contains(`${NS}__lanehead`))board.collapseLane(header.dataset.lane);
else if(header)board.collapseColumn(header.dataset.column);
return;
}
const hit=cardFor(board,ev.target);
if(!hit)return;
applyClickSelection(board,hit.card,ev);
board.fire('card:click',{card:hit.card,column:hit.card.columnId,el:hit.el,originalEvent:ev});
});
el.addEventListener('dblclick',(ev)=>{
const hit=cardFor(board,ev.target);
if(!hit)return;
board.fire('card:dblclick',{card:hit.card,column:hit.card.columnId,el:hit.el,originalEvent:ev});
if(isFunction(board.editCard)){
const editable=Object.keys(board.ctx.cardSpecs).find((n)=>board.isFieldEditable(n));
if(editable)board.editCard(hit.card.key,editable);
}
});
el.addEventListener('contextmenu',(ev)=>{
const hit=cardFor(board,ev.target);
if(!hit)return;
if(hasContextMenu(board)){openContextMenu(board,hit,ev);return;}
board.fire('card:contextmenu',{card:hit.card,column:hit.card.columnId,el:hit.el,originalEvent:ev});
});
el.addEventListener('keydown',(ev)=>handleKeydown(board,ev));
el.addEventListener('dragstart',(ev)=>{
const laneHeadEl=ev.target&&ev.target.closest?ev.target.closest(`.${NS}__lanehead`):null;
if(laneHeadEl&&!cardFor(board,ev.target)){
board.laneDrag=laneHeadEl.dataset.lane;
if(ev.dataTransfer){try{ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',String(board.laneDrag));}catch{}}
return;
}
const headerEl=ev.target&&ev.target.closest?ev.target.closest(`.${NS}__header`):null;
if(headerEl&&!cardFor(board,ev.target)){
board.colDrag=headerEl.dataset.column;
if(ev.dataTransfer){try{ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',String(board.colDrag));}catch{}}
return;
}
const hit=cardFor(board,ev.target);
if(!hit||board.isReadonly({column:hit.card.columnId,card:hit.card.key})){
if(ev.preventDefault)ev.preventDefault();
return;
}
const keys=draggedKeys(board,hit.card.key);
board.drag={keys};
if(ev.dataTransfer){try{ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',String(hit.card.key));}catch{}}
hit.el.dataset.dragging='true';
board.fire('drag:start',{keys,card:hit.card,originalEvent:ev});
});
el.addEventListener('dragover',(ev)=>{
if(board.colDrag||board.laneDrag){if(ev.preventDefault)ev.preventDefault();return;}
if(!board.drag)return;
if(ev.preventDefault)ev.preventDefault();
const at=dropTargetFrom(board,ev.target);
if(at)showDropIndicator(board,at.columnId,at.index,board.drag.keys);
});
el.addEventListener('drop',(ev)=>{
if(board.laneDrag){
if(ev.preventDefault)ev.preventDefault();
const overHead=ev.target&&ev.target.closest?ev.target.closest(`.${NS}__lanehead`):null;
const before=overHead?overHead.dataset.lane:null;
const dragged=board.laneDrag;
board.laneDrag=null;
if(before!==dragged)board.moveLane(dragged,before);
return;
}
if(board.colDrag){
if(ev.preventDefault)ev.preventDefault();
const overHeader=ev.target&&ev.target.closest?ev.target.closest(`.${NS}__header`):null;
const before=overHeader?overHeader.dataset.column:null;
const dragged=board.colDrag;
board.colDrag=null;
if(before!==dragged)board.moveColumn(dragged,before);
return;
}
if(!board.drag)return;
if(ev.preventDefault)ev.preventDefault();
const at=dropTargetFrom(board,ev.target);
const keys=board.drag.keys;
endDrag(board);
if(at)board.move(keys,at.columnId,at.index,at.lane);
board.fire('drag:end',{keys,originalEvent:ev});
});
el.addEventListener('dragend',()=>{
board.colDrag=null;
board.laneDrag=null;
if(board.drag){const keys=board.drag.keys;endDrag(board);board.fire('drag:end',{keys});}
});
}
function cardFor(board,target){
const node=target&&target.closest?target.closest(`.${NS}__card`):null;
if(!node)return null;
const card=board.model.cardsByKey.get(keyFromDataset(board,node.dataset.key));
return card?{el:node,card}:null;
}
function draggedKeys(board,key){
if(board.selectionSet&&board.selectionSet.size>1&&board.selectionSet.has(key)){
return[...board.selectionSet];
}
board.select(key,'set');
return[key];
}
function applyClickSelection(board,card,ev){
if(board.config.selectable===false)return;
if(ev.ctrlKey||ev.metaKey){board.select(card.key,'toggle');return;}
if(ev.shiftKey){
const column=board.model.columns.find((c)=>c.id===card.columnId);
const keys=column?column.cards.map((c)=>c.key):[card.key];
const anchor=board.selectionAnchor;
const a=anchor!=null?keys.indexOf(anchor):-1;
const b=keys.indexOf(card.key);
if(a>=0&&b>=0){const[lo,hi]=a<b?[a,b]:[b,a];board.select(keys.slice(lo,hi+1),'set');return;}
}
board.select(card.key,'set');
board.selectionAnchor=card.key;
}
function keyFromDataset(board,raw){
if(board.model.cardsByKey.has(raw))return raw;
const n=Number(raw);
if(!Number.isNaN(n)&&board.model.cardsByKey.has(n))return n;
return raw;
}
function targetIndexFor(board,columnId,beforeKey,movedKeys){
const column=board.model.columns.find((c)=>c.id===columnId);
const others=column?column.cards.filter((c)=>!movedKeys.includes(c.key)):[];
if(isNil(beforeKey))return others.length;
const idx=others.findIndex((c)=>c.key===beforeKey);
return idx<0?others.length:idx;
}
function dropTargetFrom(board,target){
const list=target&&target.closest?target.closest(`.${NS}__cards`):null;
const columnEl=list||(target&&target.closest?target.closest(`.${NS}__column`):null);
if(!columnEl)return null;
const columnId=columnEl.dataset.column;
const lane=list&&list.dataset.lane!==undefined?list.dataset.lane:undefined;
const overCard=target.closest?target.closest(`.${NS}__card`):null;
const beforeKey=overCard?keyFromDataset(board,overCard.dataset.key):null;
const movedKeys=(board.drag||board.grab||{}).keys||[];
return{
columnId,lane,index:targetIndexForCell(board,columnId,lane,beforeKey,movedKeys),
};
}
function targetIndexForCell(board,columnId,lane,beforeKey,movedKeys){
if(lane===undefined)return targetIndexFor(board,columnId,beforeKey,movedKeys);
const laneModel=(board.model.lanes||[]).find((l)=>l.id===lane);
const cell=laneModel&&laneModel.columns.find((c)=>c.id===columnId);
const others=cell?cell.cards.filter((c)=>!movedKeys.includes(c.key)):[];
if(isNil(beforeKey))return others.length;
const idx=others.findIndex((c)=>c.key===beforeKey);
return idx<0?others.length:idx;
}
function showDropIndicator(board,columnId,index,movedKeys,laneId){
clearDropIndicator(board);
const list=[...board.el.querySelectorAll(`.${NS}__cards`)].find((l)=>l.dataset.column===columnId
&&(laneId===undefined||(l.dataset.lane||'')===laneId));
if(!list)return;
const others=[...list.querySelectorAll(`.${NS}__card`)].filter((c)=>!movedKeys.includes(keyFromDataset(board,c.dataset.key)));
const marker=board.doc.createElement('li');
marker.className=`${NS}__drop`;
marker.setAttribute('role','presentation');
const before=others[index]||null;
if(before)list.insertBefore(marker,before);else list.appendChild(marker);
board.dropMarker=marker;
}
function clearDropIndicator(board){
if(board.dropMarker&&board.dropMarker.parentNode)board.dropMarker.parentNode.removeChild(board.dropMarker);
board.dropMarker=null;
}
function endDrag(board){
clearDropIndicator(board);
if(board.el)for(const c of board.el.querySelectorAll(`.${NS}__card`))delete c.dataset.dragging;
board.drag=null;
}
function hasContextMenu(board){
const cm=board.config.contextMenu;
return isFunction(cm)||(Array.isArray(cm)&&cm.length>0);
}
function menuItems(board,card){
const cm=board.config.contextMenu;
if(isFunction(cm)){
const selected=board.selection().map((k)=>board.model.cardsByKey.get(k)).filter(Boolean);
return cm(card,selected)||[];
}
return Array.isArray(cm)?cm:[];
}
function openContextMenu(board,hit,ev){
if(ev.preventDefault)ev.preventDefault();
closeContextMenu(board);
const items=menuItems(board,hit.card);
if(!items.length)return;
const menu=board.doc.createElement('ul');
menu.className=`${NS}__menu`;
menu.setAttribute('role','menu');
menu.style.cssText=`position:absolute;left:${(ev.clientX||0)}px;top:${(ev.clientY||0)}px;`;
for(const item of items){
const li=board.doc.createElement('li');
li.className=`${NS}__menuitem`;
li.setAttribute('role','menuitem');
li.setAttribute('tabindex','-1');
if(item.disabled)li.setAttribute('aria-disabled','true');
li.textContent=item.label==null?'':String(item.label);
li.addEventListener('click',(e)=>{
if(e.preventDefault)e.preventDefault();
if(item.disabled)return;
const selected=board.selection().map((k)=>board.model.cardsByKey.get(k)).filter(Boolean);
if(isFunction(item.action))item.action({card:hit.card,cards:selected.length?selected:[hit.card],board});
closeContextMenu(board);
});
menu.appendChild(li);
}
board.el.appendChild(menu);
board.menu=menu;
const first=menu.querySelector(`.${NS}__menuitem`);
if(first){first.setAttribute('tabindex','0');if(first.focus)first.focus();}
}
function closeContextMenu(board){
if(board.menu&&board.menu.parentNode)board.menu.parentNode.removeChild(board.menu);
board.menu=null;
}
function handleKeydown(board,ev){
if(board.editing)return;
if(board.menu){if(ev.key==='Escape'){if(ev.preventDefault)ev.preventDefault();closeContextMenu(board);}return;}
if(board.detail&&ev.key==='Escape'){if(ev.preventDefault)ev.preventDefault();board.closeDetail();return;}
const{el}=board;
const current=ev.target&&ev.target.closest?ev.target.closest(`.${NS}__card`):null;
if(!current)return;
const card=board.model.cardsByKey.get(keyFromDataset(board,current.dataset.key));
if(!card)return;
if(board.grab){handleGrabKeydown(board,ev);return;}
if(ev.key==='Enter'){
if(ev.preventDefault)ev.preventDefault();
board.fire('card:click',{card,column:card.columnId,el:current,originalEvent:ev});
return;
}
if(ev.key===' '){
if(board.isReadonly({column:card.columnId,card:card.key}))return;
if(ev.preventDefault)ev.preventDefault();
const keys=draggedKeys(board,card.key);
const others=(board.model.columns.find((c)=>c.id===card.columnId)?.cards||[])
.filter((c)=>!keys.includes(c.key));
const laneId=board.model.lanes?(current.dataset.lane||''):undefined;
board.grab={
keys,columnId:card.columnId,index:Math.min(indexOfKey(board,card),others.length),cardKey:card.key,laneId,
};
announce(board,positionMessage(board,card,card.columnId,board.grab.index,label(board,'grabbed')));
showDropIndicator(board,board.grab.columnId,board.grab.index,keys,laneId);
return;
}
const next=neighbourCard(el,current,ev.key);
if(!next)return;
if(ev.preventDefault)ev.preventDefault();
current.setAttribute('tabindex','-1');
next.setAttribute('tabindex','0');
if(next.focus)next.focus();
}
function indexOfKey(board,card){
const column=board.model.columns.find((c)=>c.id===card.columnId);
return column?column.cards.findIndex((c)=>c.key===card.key):0;
}
function handleGrabKeydown(board,ev){
const g=board.grab;
const card=board.model.cardsByKey.get(g.cardKey);
const columns=board.model.columns;
const colIdx=columns.findIndex((c)=>c.id===g.columnId);
if(ev.key==='Escape'){
if(ev.preventDefault)ev.preventDefault();
clearDropIndicator(board);
board.grab=null;
announce(board,[label(board,'cancelled'),card.fields.title||String(card.key)].filter(Boolean).join(', '));
return;
}
if(ev.key==='Enter'||ev.key===' '){
if(ev.preventDefault)ev.preventDefault();
const{keys,columnId,index,laneId}=g;
clearDropIndicator(board);
board.grab=null;
Promise.resolve(board.move(keys,columnId,index,board.model.lanes?laneId:undefined)).then(()=>{
const moved=board.model.cardsByKey.get(card.key);
if(moved){
announce(board,positionMessage(board,moved,moved.columnId,indexOfKey(board,moved),label(board,'dropped')));
const elc=board.el.querySelector(`.${NS}__card[data-key="${cssAttr(String(card.key))}"]`);
if(elc&&elc.focus){elc.setAttribute('tabindex','0');elc.focus();}
}
});
return;
}
const lanes=board.model.lanes;
if(lanes&&ev.altKey&&(ev.key==='ArrowUp'||ev.key==='ArrowDown')){
const laneIdx=lanes.findIndex((l)=>l.id===(g.laneId||''));
const target=lanes[laneIdx+(ev.key==='ArrowDown'?1:-1)];
if(!target)return;
g.laneId=target.id;
const cell=target.columns.find((c)=>c.id===g.columnId);
const tOthers=(cell?cell.cards:[]).filter((c)=>!g.keys.includes(c.key));
g.index=Math.min(g.index,tOthers.length);
}else{
const others=(columns[colIdx]?.cards||[]).filter((c)=>!g.keys.includes(c.key));
if(ev.key==='ArrowUp'){g.index=Math.max(0,g.index-1);}
else if(ev.key==='ArrowDown'){g.index=Math.min(others.length,g.index+1);}
else if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){
const target=columns[colIdx+(ev.key==='ArrowRight'?1:-1)];
if(!target)return;
g.columnId=target.id;
const tOthers=target.cards.filter((c)=>!g.keys.includes(c.key));
g.index=Math.min(g.index,tOthers.length);
}else return;
}
if(ev.preventDefault)ev.preventDefault();
showDropIndicator(board,g.columnId,g.index,g.keys,board.model.lanes?g.laneId:undefined);
announce(board,positionMessage(board,card,g.columnId,g.index,label(board,'moved')));
}
function cssAttr(s){
return s.replace(/["\\]/g,'\\$&');
}
function neighbourCard(boardEl,current,key){
const columnEl=current.closest(`.${NS}__column`);
const cardsInColumn=[...columnEl.querySelectorAll(`.${NS}__card`)];
const idx=cardsInColumn.indexOf(current);
if(key==='ArrowUp')return cardsInColumn[idx-1]||null;
if(key==='ArrowDown')return cardsInColumn[idx+1]||null;
if(key==='Home')return cardsInColumn[0]||null;
if(key==='End')return cardsInColumn[cardsInColumn.length-1]||null;
if(key==='ArrowLeft'||key==='ArrowRight'){
const columns=[...boardEl.querySelectorAll(`.${NS}__column`)];
const colIdx=columns.indexOf(columnEl);
const target=columns[colIdx+(key==='ArrowRight'?1:-1)];
if(!target)return null;
const targetCards=[...target.querySelectorAll(`.${NS}__card`)];
if(!targetCards.length)return null;
return targetCards[Math.min(idx,targetCards.length-1)];
}
return null;
}
});
__def("packages/modules/kanban/flow.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"moments",{enumerable:true,get:function(){return moments;}});
Object.defineProperty(__exports,"quantileSorted",{enumerable:true,get:function(){return quantileSorted;}});
Object.defineProperty(__exports,"quantile",{enumerable:true,get:function(){return quantile;}});
Object.defineProperty(__exports,"bucketMs",{enumerable:true,get:function(){return bucketMs;}});
Object.defineProperty(__exports,"summariseDurations",{enumerable:true,get:function(){return summariseDurations;}});
Object.defineProperty(__exports,"TransitionLog",{enumerable:true,get:function(){return TransitionLog;}});
Object.defineProperty(__exports,"createFlowAnalytics",{enumerable:true,get:function(){return createFlowAnalytics;}});
Object.defineProperty(__exports,"FlowAnalytics",{enumerable:true,get:function(){return FlowAnalytics;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const isObject=__m0["isObject"];
const warnOnce=__m0["warnOnce"];
const defaultNow=__m0["now"];
function moments(values){
let n=0;
let mean=0;
let m2=0;
for(let i=0;i<values.length;i++){
const x=values[i];
n++;
const delta=x-mean;
mean+=delta/n;
m2+=delta*(x-mean);
}
return{n,mean,m2};
}
function quantileSorted(sorted,p){
const n=sorted.length;
if(!n)return NaN;
if(n===1)return sorted[0];
const h=(n-1)*Math.min(1,Math.max(0,p));
const lo=Math.floor(h);
const hi=Math.ceil(h);
if(lo===hi)return sorted[lo];
return sorted[lo]+(h-lo)*(sorted[hi]-sorted[lo]);
}
function quantile(values,p){
if(!values.length)return NaN;
const sorted=values.slice().sort();
return quantileSorted(sorted,p);
}
const HOUR=3600*1000;
const BUCKETS=Object.freeze({hour:HOUR,day:24*HOUR,week:7*24*HOUR});
function bucketMs(bucket){
if(typeof bucket==='number'&&Number.isFinite(bucket)&&bucket>0)return bucket;
return BUCKETS[bucket]||BUCKETS.day;
}
function summariseDurations(durations){
const finite=[];
for(const d of durations||[])if(Number.isFinite(d))finite.push(d);
const values=Float64Array.from(finite);
const n=values.length;
if(!n){
return{
count:0,mean:null,median:null,p50:null,p85:null,p95:null,
min:null,max:null,stdev:null,total:0,
};
}
const m=moments(values);
let min=values[0];
let max=values[0];
let total=0;
for(let i=0;i<n;i++){
const x=values[i];
if(x<min)min=x;
if(x>max)max=x;
total+=x;
}
const p50=quantile(values,0.5);
return{
count:n,
mean:m.mean,
median:p50,
p50,
p85:quantile(values,0.85),
p95:quantile(values,0.95),
min,
max,
stdev:n>1?Math.sqrt(m.m2/(n-1)):0,
total,
};
}
class TransitionLog{
entries=[];
#current=new Map();
#now;
constructor(opts={}){
this.#now=isFunction(opts.now)?opts.now:defaultNow;
}
record(entry){
if(!isObject(entry)||isNil(entry.key))return null;
const key=entry.key;
const to=isNil(entry.to)?null:String(entry.to);
const from=entry.from===undefined
?(this.#current.has(key)?this.#current.get(key):null)
:(isNil(entry.from)?null:String(entry.from));
const at=Number.isFinite(entry.at)?Number(entry.at):this.#now();
const recorded={key,from,to,at};
this.entries.push(recorded);
this.#current.set(key,to);
return recorded;
}
remove(entry){
if(!isObject(entry))return false;
const at=this.entries.lastIndexOf(entry);
if(at<0)return false;
this.entries.splice(at,1);
let latest;
for(const e of this.entries)if(e.key===entry.key)latest=e;
if(latest)this.#current.set(entry.key,latest.to);
else this.#current.delete(entry.key);
return true;
}
hydrate(list){
if(Array.isArray(list))for(const e of list)this.record(e);
return this;
}
all(){
return this.entries.map((e)=>({...e}));
}
byKey(){
const out=new Map();
for(const e of this.entries){
if(!out.has(e.key))out.set(e.key,[]);
out.get(e.key).push(e);
}
for(const list of out.values())list.sort((a,b)=>a.at-b.at);
return out;
}
}
function createFlowAnalytics(board,opts={}){
return new FlowAnalytics(board,opts);
}
class FlowAnalytics{
#board;
#opts;
log;
#off=[];
#now;
#pending=new Map();
constructor(board,opts={}){
this.#board=board;
this.#opts=isObject(opts)?opts:{};
this.#now=isFunction(this.#opts.now)?this.#opts.now:defaultNow;
this.log=new TransitionLog({now:this.#now});
if(board&&isFunction(board.on)){
this.#off.push(board.on('card:move',(ev)=>{
const keys=Array.isArray(ev.keys)?ev.keys:[];
const from=Array.isArray(ev.from)?ev.from:[];
const at=this.#now();
keys.forEach((key,i)=>{
const recorded=this.log.record({key,from:from[i],to:ev.to,at});
if(recorded)this.#pending.set(key,recorded);
});
}));
this.#off.push(board.on('card:reverted',(ev)=>{
const keys=Array.isArray(ev.keys)?ev.keys:[];
for(const key of keys){
const recorded=this.#pending.get(key);
if(recorded){this.log.remove(recorded);this.#pending.delete(key);}
}
}));
this.#off.push(board.on('card:confirmed',(ev)=>{
const keys=Array.isArray(ev.keys)?ev.keys:[];
for(const key of keys)this.#pending.delete(key);
}));
this.#off.push(board.on('card:add',(ev)=>{
this.log.record({key:ev.key,from:null,to:ev.column});
}));
}
}
seed(){
if(Array.isArray(this.#opts.history)){
this.log.hydrate(this.#opts.history);
return this;
}
const at=this.#now();
const cards=isFunction(this.#board.cards)?this.#board.cards():[];
for(const card of cards){
this.log.record({key:card.key,from:null,to:card.columnId,at});
}
return this;
}
record(entry){
this.log.record(entry);
return this;
}
transitions(){
return this.log.all();
}
#columnOrder(){
const cols=(this.#board.model&&this.#board.model.columns)||[];
return cols.map((c)=>String(c.id));
}
#classify(){
const order=this.#columnOrder();
const done=new Set(
Array.isArray(this.#opts.doneColumns)
?this.#opts.doneColumns.map(String)
:[...(this.#board.ctx&&this.#board.ctx.doneColumns?this.#board.ctx.doneColumns:[])].map(String),
);
const start=new Set(
Array.isArray(this.#opts.startColumns)
?this.#opts.startColumns.map(String)
:order.slice(1).filter((id)=>!done.has(id)),
);
const wip=new Set(
Array.isArray(this.#opts.wipColumns)?this.#opts.wipColumns.map(String):[...start],
);
return{order,done,start,wip};
}
perCard(){
const{done,start}=this.#classify();
const byKey=this.log.byKey();
const out=[];
for(const[key,list]of byKey){
const arrivedAt=list[0].at;
let startedAt=null;
let doneAt=null;
for(const e of list){
if(startedAt===null&&start.has(e.to))startedAt=e.at;
if(doneAt===null&&done.has(e.to))doneAt=e.at;
}
const column=list[list.length-1].to;
const leadTime=doneAt===null?null:doneAt-arrivedAt;
const cycleTime=(doneAt===null||startedAt===null||startedAt>doneAt)
?null:doneAt-startedAt;
out.push({key,arrivedAt,startedAt,doneAt,leadTime,cycleTime,column});
}
return out;
}
cycleTime(){
return summariseDurations(this.perCard().map((c)=>c.cycleTime).filter((v)=>v!==null));
}
leadTime(){
return summariseDurations(this.perCard().map((c)=>c.leadTime).filter((v)=>v!==null));
}
#boundaries(from,to,size){
const out=[];
for(let t=from;t<=to;t+=size)out.push(t);
if(!out.length||out[out.length-1]<to)out.push(to);
return out;
}
#range(opts={}){
const entries=this.log.entries;
const first=entries.length?entries[0].at:0;
let last=first;
for(const e of entries)if(e.at>last)last=e.at;
return{
from:Number.isFinite(opts.from)?Number(opts.from):first,
to:Number.isFinite(opts.to)?Number(opts.to):last,
};
}
#stateAt(byKey,t){
const state=new Map();
for(const[key,list]of byKey){
let col;
for(const e of list){if(e.at<=t)col=e.to;else break;}
if(col!==undefined)state.set(key,col);
}
return state;
}
cfd(opts={}){
const size=bucketMs(opts.bucket);
const{order,done,wip}=this.#classify();
const byKey=this.log.byKey();
const{from,to}=this.#range(opts);
const points=[];
if(this.log.entries.length){
for(const at of this.#boundaries(from,to,size)){
const state=this.#stateAt(byKey,at);
const counts={};
for(const id of order)counts[id]=0;
let wipN=0;
let doneN=0;
let total=0;
for(const col of state.values()){
if(!(col in counts))counts[col]=0;
counts[col]+=1;
total+=1;
if(wip.has(col))wipN+=1;
if(done.has(col))doneN+=1;
}
points.push({at,counts,wip:wipN,done:doneN,total});
}
}
return{bucket:size,columns:order,points};
}
wipOverTime(opts={}){
return this.cfd(opts).points.map((p)=>({at:p.at,wip:p.wip}));
}
throughput(opts={}){
const size=bucketMs(opts.bucket);
const doneTimes=this.perCard().map((c)=>c.doneAt).filter((v)=>v!==null);
const{from,to}=this.#range(opts);
const buckets=[];
for(let t=from;t<=to;t+=size)buckets.push({at:t,count:0});
if(!buckets.length)buckets.push({at:from,count:0});
for(const dt of doneTimes){
let i=Math.floor((dt-from)/size);
if(i<0)i=0;
if(i>=buckets.length)i=buckets.length-1;
buckets[i].count+=1;
}
return buckets;
}
#label(at,size){
const iso=new Date(at).toISOString();
return size>=BUCKETS.day?iso.slice(0,10):iso.slice(0,16).replace('T',' ');
}
chartData(kind,opts={}){
const size=bucketMs(opts.bucket);
if(kind==='cfd'){
const{columns,points}=this.cfd(opts);
const rows=points.map((p)=>{
const row={t:this.#label(p.at,size)};
for(const id of columns)row[id]=p.counts[id]||0;
return row;
});
return{
columns:[{id:'t',field:'t',title:'Date'},
...columns.map((id)=>({id,field:id,title:id}))],
rows,
spec:{
type:'area',
x:'t',
measures:columns.map((id)=>({col:id})),
stack:true,
title:'Cumulative flow',
},
};
}
if(kind==='wip'){
const rows=this.wipOverTime(opts).map((p)=>({t:this.#label(p.at,size),wip:p.wip}));
return{
columns:[{id:'t',field:'t',title:'Date'},{id:'wip',field:'wip',title:'WIP'}],
rows,
spec:{type:'line',x:'t',y:{col:'wip'},title:'Work in progress'},
};
}
if(kind==='throughput'){
const rows=this.throughput(opts).map((p)=>({t:this.#label(p.at,size),count:p.count}));
return{
columns:[{id:'t',field:'t',title:'Date'},{id:'count',field:'count',title:'Completed'}],
rows,
spec:{type:'bar',x:'t',y:{col:'count'},title:'Throughput'},
};
}
if(kind==='cycleTime'||kind==='leadTime'){
const values=this.perCard()
.map((c)=>(kind==='cycleTime'?c.cycleTime:c.leadTime))
.filter((v)=>v!==null);
return{
columns:[{id:'v',field:'v',title:kind==='cycleTime'?'Cycle time':'Lead time'}],
rows:values.map((v)=>({v})),
spec:{
type:'histogram',
x:'v',
title:kind==='cycleTime'?'Cycle-time distribution':'Lead-time distribution',
},
};
}
return null;
}
renderChart(kind,container,deps={}){
const{createChart,createGrid,spec:override}=deps;
if(!isFunction(createChart)||!isFunction(createGrid)){
warnOnce('kanban:flow-chart-deps',
'flow.renderChart needs createChart and createGrid handed in '
+"(e.g. from 'lattice-grid/modules/charts' and 'lattice-grid').");
return null;
}
const data=this.chartData(kind,deps);
if(!data){
warnOnce(`kanban:flow-chart-kind:${kind}`,
`"${kind}" is not a flow chart; expected cfd, wip, throughput, cycleTime or leadTime.`);
return null;
}
const grid=createGrid({columns:data.columns,rows:data.rows});
return createChart({
grid,container,...data.spec,...(isObject(override)?override:{}),
});
}
destroy(){
for(const off of this.#off)if(isFunction(off))off();
this.#off=[];
}
}
const __default=createFlowAnalytics;
});
__def("packages/modules/kanban/sla.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"MIN_EPOCH",{enumerable:true,get:function(){return MIN_EPOCH;}});
Object.defineProperty(__exports,"toMs",{enumerable:true,get:function(){return toMs;}});
Object.defineProperty(__exports,"parseEpoch",{enumerable:true,get:function(){return parseEpoch;}});
Object.defineProperty(__exports,"resolveSlaConfig",{enumerable:true,get:function(){return resolveSlaConfig;}});
Object.defineProperty(__exports,"formatAge",{enumerable:true,get:function(){return formatAge;}});
Object.defineProperty(__exports,"createSlaMonitor",{enumerable:true,get:function(){return createSlaMonitor;}});
Object.defineProperty(__exports,"SlaMonitor",{enumerable:true,get:function(){return SlaMonitor;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const isObject=__m0["isObject"];
const warnOnce=__m0["warnOnce"];
const MINUTE=60*1000;
const HOUR=60*MINUTE;
const DAY=24*HOUR;
const WEEK=7*DAY;
const MIN_EPOCH=1e12;
const UNITS=Object.freeze({
weeks:WEEK,week:WEEK,w:WEEK,
days:DAY,day:DAY,d:DAY,
hours:HOUR,hour:HOUR,h:HOUR,
minutes:MINUTE,minute:MINUTE,m:MINUTE,min:MINUTE,
seconds:1000,second:1000,s:1000,sec:1000,
ms:1,milliseconds:1,
});
function toMs(spec){
if(typeof spec==='number')return Number.isFinite(spec)&&spec>=0?spec:null;
if(isObject(spec)){
let total=0;
let any=false;
for(const[unit,mult]of Object.entries(UNITS)){
const v=spec[unit];
if(typeof v==='number'&&Number.isFinite(v)){total+=v*mult;any=true;}
}
return any&&total>=0?total:null;
}
return null;
}
function parseEpoch(value){
if(isNil(value))return null;
let n;
if(value instanceof Date)n=value.getTime();
else if(typeof value==='number')n=value;
else if(typeof value==='string'){
const trimmed=value.trim();
if(trimmed==='')return null;
n=/^-?\d+$/.test(trimmed)?Number(trimmed):Date.parse(trimmed);
}else return null;
if(!Number.isFinite(n)||n<MIN_EPOCH)return null;
return n;
}
function thresholdPair(raw){
if(isObject(raw)&&('warn'in raw||'breach'in raw)){
return{warn:toMs(raw.warn),breach:toMs(raw.breach)};
}
return{warn:null,breach:toMs(raw)};
}
function mergePair(base,over){
return{
warn:over.warn!==null?over.warn:base.warn,
breach:over.breach!==null?over.breach:base.breach,
};
}
function resolveSlaConfig(slaCfg,boardCfg={}){
const cfg=isObject(slaCfg)?slaCfg:{};
const global={warn:toMs(cfg.warn),breach:toMs(cfg.breach)};
const columns=new Map();
if(Array.isArray(boardCfg.columns)){
for(const def of boardCfg.columns){
if(!isObject(def)||isNil(def.id))continue;
if(def.sla===undefined&&def.slaWarn===undefined&&def.slaBreach===undefined)continue;
const pair=isObject(def.sla)||typeof def.sla==='number'
?thresholdPair(def.sla)
:{warn:toMs(def.slaWarn),breach:toMs(def.slaBreach)};
columns.set(String(def.id),pair);
}
}
if(isObject(cfg.columns)){
for(const[id,raw]of Object.entries(cfg.columns)){
columns.set(String(id),mergePair(columns.get(String(id))||{warn:null,breach:null},thresholdPair(raw)));
}
}
const lanes=new Map();
if(isObject(cfg.lanes)){
for(const[id,raw]of Object.entries(cfg.lanes))lanes.set(String(id),thresholdPair(raw));
}
return{
global,
columns,
lanes,
basis:cfg.basis==='board'?'board':'column',
enteredProperty:typeof cfg.enteredProperty==='string'?cfg.enteredProperty:null,
createdProperty:typeof cfg.createdProperty==='string'?cfg.createdProperty:null,
ignoreDone:cfg.ignoreDone!==false,
useTransitionLog:cfg.useTransitionLog!==false,
showAge:cfg.showAge==='always'?'always':'threshold',
now:isFunction(cfg.now)?cfg.now:(()=>Date.now()),
tick:Number.isFinite(cfg.tick)&&cfg.tick>0?Number(cfg.tick):0,
onWarn:isFunction(cfg.onWarn)?cfg.onWarn:null,
onBreach:isFunction(cfg.onBreach)?cfg.onBreach:null,
};
}
function formatAge(ms){
if(!Number.isFinite(ms)||ms<0)return'';
if(ms>=WEEK)return`${Math.floor(ms/WEEK)}w`;
if(ms>=DAY)return`${Math.floor(ms/DAY)}d`;
if(ms>=HOUR)return`${Math.floor(ms/HOUR)}h`;
if(ms>=MINUTE)return`${Math.floor(ms/MINUTE)}m`;
return'<1m';
}
const RANK=Object.freeze({ok:0,warn:1,breach:2});
function createSlaMonitor(board,opts={}){
return new SlaMonitor(board,opts);
}
class SlaMonitor{
#board;
#cfg;
#state=new Map();
#last=new Map();
#off=[];
#timer=null;
#started=false;
constructor(board,opts={}){
this.#board=board;
this.#cfg=resolveSlaConfig(opts,board&&board.config);
if(this.#cfg.global.warn===null&&this.#cfg.global.breach===null
&&!this.#cfg.columns.size&&!this.#cfg.lanes.size){
warnOnce('kanban:sla:no-threshold',
'sla is enabled but no warn/breach threshold is set (globally, per column or per lane); no card will ever age.');
}
if(board&&isFunction(board.on)){
for(const ev of['card:move','card:add','card:reverted']){
this.#off.push(board.on(ev,()=>this.evaluate()));
}
}
}
get config(){return this.#cfg;}
#log(){
if(!this.#cfg.useTransitionLog)return null;
const flow=this.#board.flow;
return flow&&flow.log?flow.log:null;
}
#startOf(card,byKey){
const row=card.row||{};
const{enteredProperty,createdProperty,basis}=this.#cfg;
const list=byKey?byKey.get(card.key):null;
const columnEntry=()=>{
if(!Array.isArray(list))return null;
const col=String(card.columnId);
for(let i=list.length-1;i>=0;i--){
if(String(list[i].to)===col){
const at=list[i].at;
return Number.isFinite(at)&&at>=MIN_EPOCH?at:null;
}
}
return null;
};
const arrival=()=>{
if(!Array.isArray(list)||!list.length)return null;
const at=list[0].at;
return Number.isFinite(at)&&at>=MIN_EPOCH?at:null;
};
const entered=()=>(enteredProperty?parseEpoch(row[enteredProperty]):null);
const created=()=>(createdProperty?parseEpoch(row[createdProperty]):null);
const chain=basis==='board'
?[created,arrival,entered]
:[columnEntry,entered,arrival,created];
for(const source of chain){
const v=source();
if(v!==null)return v;
}
return null;
}
#thresholdsFor(card){
let pair=this.#cfg.global;
const col=this.#cfg.columns.get(String(card.columnId));
if(col)pair=mergePair(pair,col);
const laneVal=card.swimlane;
if(!isNil(laneVal)){
const lane=this.#cfg.lanes.get(String(laneVal));
if(lane)pair=mergePair(pair,lane);
}
return pair;
}
#isDone(card){
const done=this.#board.ctx&&this.#board.ctx.doneColumns;
return!!(done&&done.has(String(card.columnId)));
}
#compute(card,at,byKey){
const{warn,breach}=this.#thresholdsFor(card);
const ignored=this.#cfg.ignoreDone&&this.#isDone(card);
const start=ignored?null:this.#startOf(card,byKey);
const ageMs=start===null?null:Math.max(0,at-start);
let level=null;
if(ageMs!==null){
if(breach!==null&&ageMs>=breach)level='breach';
else if(warn!==null&&ageMs>=warn)level='warn';
else level='ok';
}
return{
key:card.key,
columnId:card.columnId,
lane:card.swimlane,
start,
ageMs,
ageText:ageMs===null?'':formatAge(ageMs),
warnMs:warn,
breachMs:breach,
level,
breached:level==='breach',
};
}
sync(){
const at=this.#cfg.now();
const byKey=this.#log()?this.#log().byKey():null;
const cards=isFunction(this.#board.cards)?this.#board.cards():[];
const next=new Map();
for(const card of cards)next.set(card.key,this.#compute(card,at,byKey));
this.#state=next;
return this;
}
evaluate(opts={}){
const emit=opts.emit!==false;
this.sync();
const at=this.#cfg.now();
for(const[key,s]of this.#state){
const prev=this.#last.has(key)?this.#last.get(key):null;
const level=s.level;
if(emit&&level&&(level==='warn'||level==='breach')
&&RANK[level]>(prev===null||prev===undefined?-1:RANK[prev])){
this.#fire(s,prev,at);
}
this.#last.set(key,level);
}
for(const key of[...this.#last.keys()])if(!this.#state.has(key))this.#last.delete(key);
return[...this.#state.values()];
}
#fire(s,prev,at){
const card=this.#board.card?this.#board.card(s.key):null;
const row=card?card.row:undefined;
this.#board.fire('card:sla',{
key:s.key,
card,
level:s.level,
previous:prev,
ageMs:s.ageMs,
ageText:s.ageText,
columnId:s.columnId,
lane:s.lane,
warnMs:s.warnMs,
breachMs:s.breachMs,
at,
});
const cb=s.level==='breach'?this.#cfg.onBreach:this.#cfg.onWarn;
if(cb)cb(s.level,row===undefined?[]:[row]);
}
start(){
if(this.#started)return this;
this.#started=true;
this.sync();
for(const s of this.#state.values())this.#last.set(s.key,s.level?'ok':null);
this.evaluate();
if(this.#cfg.tick>0){
this.#timer=setInterval(()=>{
this.evaluate();
if(this.#board.el&&isFunction(this.#board.repaint))this.#board.repaint();
},this.#cfg.tick);
if(this.#timer&&isFunction(this.#timer.unref))this.#timer.unref();
}
return this;
}
stateFor(cardOrKey){
const key=isObject(cardOrKey)&&'key'in cardOrKey?cardOrKey.key:cardOrKey;
return this.#state.get(key)||null;
}
states(){
return[...this.#state.values()];
}
breaches(){
return this.states().filter((s)=>s.level==='breach');
}
warnings(){
return this.states().filter((s)=>s.level==='warn');
}
destroy(){
if(this.#timer){clearInterval(this.#timer);this.#timer=null;}
for(const off of this.#off)if(isFunction(off))off();
this.#off=[];
}
}
const __default=createSlaMonitor;
});
__def("packages/modules/kanban/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createKanban",{enumerable:true,get:function(){return createKanban;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const isObject=__m0["isObject"];
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const warnOnce=__m0["warnOnce"];
const setPath=__m0["setPath"];
const uid=__m0["uid"];
const mergeRow=__m0["mergeRow"];
const __m1=__req("packages/modules/kanban/model.js");
const resolveContext=__m1["resolveContext"];
const groupRows=__m1["groupRows"];
const keyFn=__m1["keyFn"];
const computeOrders=__m1["computeOrders"];
const accessorFor=__m1["accessorFor"];
const rollup=__m1["rollup"];
const BACKLOG=__m1["BACKLOG"];
const DEFAULT_FILTER=__m1["DEFAULT_FILTER"];
const deriveDoneColumns=__m1["deriveDoneColumns"];
const __m2=__req("packages/modules/kanban/view.js");
const Emitter=__m2["Emitter"];
const resolveReadonly=__m2["resolveReadonly"];
const renderPreserving=__m2["renderPreserving"];
const installSelectionPainter=__m2["installSelectionPainter"];
const openDetail=__m2["openDetail"];
const closeDetail=__m2["closeDetail"];
const startEdit=__m2["startEdit"];
const __m3=__req("packages/modules/kanban/flow.js");
const createFlowAnalytics=__m3["createFlowAnalytics"];
const __m4=__req("packages/modules/kanban/sla.js");
const createSlaMonitor=__m4["createSlaMonitor"];
const __m5=__req("packages/modules/kanban/styles.js");
const NS=__m5["NS"];
const KANBAN_EVENTS=Object.freeze([
'card:click','card:dblclick','card:contextmenu',
'card:move','card:reverted','card:confirmed','selection:changed','column:collapse','card:add',
'drag:start','drag:end','swimlane:collapse','swimlane:reorder','column:reorder',
'filter:changed','sprint:changed','epic:changed','card:expand','card:drill','card:edit',
'card:sla',
'beforeMove','beforeAdd','beforeEdit',
'beforeLaneReorder','beforeColumnReorder','beforeColumnChange',
'move:cancelled','add:cancelled','edit:cancelled',
'laneReorder:cancelled','columnReorder:cancelled','columnChange:cancelled',
]);
const CALLBACKS=Object.freeze({
onCardClick:'card:click',
onCardDblClick:'card:dblclick',
onCardContextMenu:'card:contextmenu',
});
function readRows(cfg,ctx){
if(Array.isArray(cfg.rows))return cfg.rows;
const grid=cfg.grid;
if(!grid||!grid.rows||!isFunction(grid.rows.forEach))return[];
const props=[
ctx.columnProperty,ctx.pointsProperty,ctx.orderProperty,
ctx.swimlaneProperty,ctx.sprintProperty,ctx.epicProperty,
].filter((p)=>typeof p==='string');
const all=grid.columns&&isFunction(grid.columns.all)?grid.columns.all():[];
const idFor=(prop)=>{
if(grid.columns&&isFunction(grid.columns.get)&&grid.columns.get(prop))return prop;
const byField=all.find((c)=>c&&c.field===prop);
return byField?byField.id:prop;
};
const readIds=new Map(props.map((p)=>[p,idFor(p)]));
const rows=[];
grid.rows.forEach((r)=>{
if(r&&r.group)return;
const key=r.key;
const obj={__boardKey:key};
for(const prop of props){
try{obj[prop]=grid.rows.value(key,readIds.get(prop));}catch{obj[prop]=undefined;}
}
rows.push(obj);
});
return rows;
}
function createKanban(el,config={}){
const cfg=isObject(config)?config:{};
const ctx=resolveContext(cfg);
if(cfg.grid&&!Array.isArray(cfg.rows))ctx.key=keyFn('__boardKey');
const emitter=new Emitter();
const isReadonly=resolveReadonly(cfg.readonly);
const doc=(el&&el.ownerDocument)
||(typeof globalThis!=='undefined'&&globalThis.document)
||null;
const gridBound=!!cfg.grid&&!Array.isArray(cfg.rows);
const rowStore=new Map();
let routed=false;
const gridColId=(prop)=>{
if(!gridBound||typeof prop!=='string')return prop;
const cols=cfg.grid.columns;
if(!cols)return prop;
try{
if(isFunction(cols.get)&&cols.get(prop))return prop;
const all=isFunction(cols.all)?cols.all():[];
const byField=all.find((c)=>c&&c.field===prop);
return byField?byField.id:prop;
}catch{return prop;}
};
const state={
collapsedColumns:new Set(),
collapsedLanes:new Set(),
columnOrder:Array.isArray(cfg.columnOrder)?[...cfg.columnOrder]:null,
laneOrder:Array.isArray(cfg.laneOrder)?[...cfg.laneOrder]:null,
filters:new Map(isFunction(cfg.filter)?[[DEFAULT_FILTER,cfg.filter]]:[]),
quickFilter:typeof cfg.quickFilter==='string'?cfg.quickFilter:'',
sprint:cfg.sprint===undefined?undefined:cfg.sprint,
epic:cfg.epic===undefined?undefined:cfg.epic,
};
const board={
el:el||null,
doc,
ctx,
config:cfg,
emitter,
isReadonly,
wired:false,
rowKey:cfg.rowKey??(gridBound?'__boardKey':'id'),
model:{columns:[],cardsByKey:new Map(),unplaced:[]},
live:null,
fire(name,payload){
emitter.emit(name,payload);
for(const[cbName,evName]of Object.entries(CALLBACKS)){
if(evName===name&&isFunction(cfg[cbName]))cfg[cbName](payload);
}
},
};
const gateBefore=(beforeName,cancelledName,payload,apply,onCancel)=>{
const origin=(payload.origin)||'user';
const cancel=()=>{
board.fire(cancelledName,{...payload,reason:(payload.reason)||'prevented'});
return onCancel();
};
const decision=emitter.emitBefore(beforeName,payload,origin);
if(decision===true)return apply();
if(decision===false)return cancel();
return decision.then((ok)=>(ok?apply():cancel()));
};
if(isFunction(cfg.onBeforeMove)){
emitter.on('beforeMove',(ev)=>
cfg.onBeforeMove((ev).card,(ev).from,
(ev).to,(ev).index));
}
const seed=()=>{
rowStore.clear();
for(const row of readRows(cfg,ctx))rowStore.set(ctx.key(row),row);
};
const regroup=()=>{
board.model=groupRows(ctx,[...rowStore.values()],state);
if(board.el)renderPreserving(board);
return board;
};
board.refresh=()=>{
if(!routed)seed();
return regroup();
};
board.repaint=()=>{if(board.el)renderPreserving(board);return board;};
const status={loading:false,error:null};
board.status=status;
board.getState=()=>({
collapsedColumns:[...state.collapsedColumns],
collapsedLanes:[...state.collapsedLanes],
columnOrder:state.columnOrder?[...state.columnOrder]:null,
laneOrder:state.laneOrder?[...state.laneOrder]:null,
quickFilter:state.quickFilter,
sprint:state.sprint,
epic:state.epic,
selection:[...selection],
});
board.setState=(snapshot)=>{
const s=isObject(snapshot)?snapshot:{};
if(Array.isArray(s.collapsedColumns))state.collapsedColumns=new Set(s.collapsedColumns);
if(Array.isArray(s.collapsedLanes))state.collapsedLanes=new Set(s.collapsedLanes);
if('columnOrder'in s)state.columnOrder=Array.isArray(s.columnOrder)?[...s.columnOrder]:null;
if('laneOrder'in s)state.laneOrder=Array.isArray(s.laneOrder)?[...s.laneOrder]:null;
if(typeof s.quickFilter==='string')state.quickFilter=s.quickFilter;
if('sprint'in s)state.sprint=s.sprint;
if('epic'in s)state.epic=s.epic;
if(Array.isArray(s.selection)){selection.clear();for(const k of s.selection)selection.add(k);}
return regroup();
};
board.setLoading=(loading)=>{status.loading=!!loading;return regroup();};
board.setError=(message)=>{status.error=isNil(message)?null:String(message);return regroup();};
const selection=new Set();
board.selection=()=>[...selection];
board.isSelected=(key)=>selection.has(key);
board.select=(keys,mode='set')=>{
const arr=(Array.isArray(keys)?keys:[keys]).filter((k)=>!isNil(k));
if(mode==='set'){selection.clear();for(const k of arr)selection.add(k);}
else if(mode==='add'){for(const k of arr)selection.add(k);}
else if(mode==='remove'){for(const k of arr)selection.delete(k);}
else if(mode==='toggle'){
for(const k of arr){if(selection.has(k))selection.delete(k);else selection.add(k);}
}
board.selectionSet=selection;
if(board.el&&isFunction(board.paintSelection))board.paintSelection();
board.fire('selection:changed',{keys:[...selection]});
return board;
};
board.clearSelection=()=>board.select([],'set');
board.selectionSet=selection;
installSelectionPainter(board);
board.collapseColumn=(id,collapsed)=>{
const next=collapsed===undefined?!state.collapsedColumns.has(id):!!collapsed;
return gateBefore('beforeColumnChange','columnChange:cancelled',
{column:id,collapsed:next,origin:'user'},
()=>{
if(next)state.collapsedColumns.add(id);else state.collapsedColumns.delete(id);
regroup();
board.fire('column:collapse',{column:id,collapsed:next});
return board;
},
()=>board);
};
board.collapseLane=(id,collapsed)=>{
const next=collapsed===undefined?!state.collapsedLanes.has(id):!!collapsed;
if(next)state.collapsedLanes.add(id);else state.collapsedLanes.delete(id);
regroup();
board.fire('swimlane:collapse',{swimlane:id,collapsed:next});
return board;
};
board.reorderColumns=(order)=>{
if(!Array.isArray(order))return board;
return gateBefore('beforeColumnReorder','columnReorder:cancelled',
{order:[...order],origin:'user'},
()=>{
state.columnOrder=[...order];
regroup();
board.fire('column:reorder',{order:board.model.columns.map((c)=>c.id)});
return board;
},
()=>{if(board.el)regroup();return board;});
};
board.moveColumn=(id,beforeId)=>{
const ids=board.model.columns.map((c)=>c.id).filter((c)=>c!==id);
const at=isNil(beforeId)?ids.length:ids.indexOf(beforeId);
ids.splice(at<0?ids.length:at,0,id);
return board.reorderColumns(ids);
};
board.reorderLanes=(order)=>{
if(!Array.isArray(order))return board;
return gateBefore('beforeLaneReorder','laneReorder:cancelled',
{order:[...order],origin:'user'},
()=>{
state.laneOrder=[...order];
regroup();
board.fire('swimlane:reorder',{order:(board.model.lanes||[]).map((l)=>l.id)});
return board;
},
()=>{if(board.el)regroup();return board;});
};
board.moveLane=(id,beforeId)=>{
const ids=(board.model.lanes||[]).map((l)=>l.id).filter((l)=>l!==id);
const at=isNil(beforeId)?ids.length:ids.indexOf(beforeId);
ids.splice(at<0?ids.length:at,0,id);
return board.reorderLanes(ids);
};
const filterChanged=()=>{
board.fire('filter:changed',{
quickFilter:state.quickFilter,
hasFilter:state.filters.size>0,
filters:[...state.filters.keys()],
});
regroup();
};
board.filters={
DEFAULT:DEFAULT_FILTER,
where(name,predicate){
if(name===undefined)return[...state.filters.keys()];
if(typeof name!=='string'||!name.trim()){
warnOnce(
'kanban.filters.where.name',
'board.filters.where(name, fn) needs a non-empty string name; the predicate was not registered.',
);
return board;
}
if(predicate===null){
if(state.filters.delete(name))filterChanged();
return board;
}
if(!isFunction(predicate)){
warnOnce(
`kanban.filters.where.fn:${name}`,
`board.filters.where("${name}", fn) needs a function; the predicate was not registered.`,
'Pass null to remove a registered predicate.',
);
return board;
}
state.filters.set(name,predicate);
filterChanged();
return board;
},
reapply(name){
if(name===undefined){
if(!state.filters.size)return false;
filterChanged();
return true;
}
if(!state.filters.has(name)){
warnOnce(
`kanban.filters.reapply:${name}`,
`board.filters.reapply(${JSON.stringify(name)}) names no registered predicate;`,
'nothing was re-run.',
);
return false;
}
filterChanged();
return true;
},
};
board.setFilter=(fn)=>board.filters.where(DEFAULT_FILTER,isFunction(fn)?fn:null);
board.setQuickFilter=(text)=>{
state.quickFilter=typeof text==='string'?text:'';
filterChanged();
return board;
};
board.facets=(property)=>{
const get=accessorFor(property);
const counts=new Map();
for(const row of rowStore.values()){
const v=get(row);
counts.set(v,(counts.get(v)||0)+1);
}
return[...counts.entries()].map(([value,count])=>({value,count}))
.sort((a,b)=>b.count-a.count);
};
board.BACKLOG=BACKLOG;
board.setSprint=(sprint)=>{
state.sprint=sprint;
board.fire('sprint:changed',{sprint});
return regroup();
};
board.showBacklog=()=>board.setSprint(BACKLOG);
board.setEpic=(epic)=>{
state.epic=epic;
board.fire('epic:changed',{epic});
return regroup();
};
board.sprints=()=>{
const derived=ctx.sprintProperty?board.facets(ctx.sprintProperty).map((f)=>f.value):[];
if(!ctx.sprintList)return derived;
const configured=ctx.sprintList.map((s)=>s.id);
const extras=derived.filter((v)=>!isNil(v)&&v!==''&&!configured.some((id)=>String(id)===String(v)));
return[...configured,...extras];
};
board.sprintDefs=()=>{
const configured=ctx.sprintList||[];
const byId=new Map(configured.map((s)=>[String(s.id),s]));
const out=configured.map((s)=>({id:s.id,title:isNil(s.title)?String(s.id):String(s.title)}));
const derived=ctx.sprintProperty?board.facets(ctx.sprintProperty).map((f)=>f.value):[];
for(const v of derived)if(!isNil(v)&&v!==''&&!byId.has(String(v)))out.push({id:v,title:String(v)});
return out;
};
board.epics=()=>(ctx.epicProperty?board.facets(ctx.epicProperty).map((f)=>f.value):[]);
const isDone=(row)=>ctx.doneColumns.has(String(accessorFor(ctx.columnProperty)(row)));
board.rollup=(property)=>rollup(ctx,[...rowStore.values()],property,isDone);
board.epicRollup=()=>(ctx.epicProperty?board.rollup(ctx.epicProperty):[]);
const childRowsOf=(card)=>{
const children=cfg.children||{};
if(isFunction(children.load))return Promise.resolve(children.load(card));
if(typeof children.property==='string'){
const get=accessorFor(children.property);
return Promise.resolve([...rowStore.values()].filter((r)=>String(get(r))===String(card.key)));
}
return Promise.resolve([]);
};
board.canExpand=(card)=>{
const children=cfg.children;
if(!children)return false;
if(isFunction(children.hasChildren))return!!children.hasChildren(card);
if(isFunction(children.load))return true;
if(typeof children.property==='string'){
const get=accessorFor(children.property);
for(const r of rowStore.values())if(String(get(r))===String(card.key))return true;
}
return false;
};
board.expand=async(key,opts={})=>{
const card=board.model.cardsByKey.get(key);
if(!card||!cfg.children)return null;
const rows=await childRowsOf(card);
const depth=opts.depth!==undefined?opts.depth:(cfg.__depth||0);
const detail=openDetail(board,card,rows,depth);
board.fire('card:expand',{card,rows,present:(cfg.children.present||'drawer')});
if(depth>0)board.fire('card:drill',{card,rows,depth});
return detail;
};
board.buildChild=(container,card,rows,depth)=>{
const children=cfg.children||{};
if(isFunction(children.render)){
const cleanup=children.render(container,{card,rows,board,depth});
return{destroy:()=>{if(isFunction(cleanup))cleanup();}};
}
if(children.asBoard){
const childBoard=createKanban(container,{
...childOptions(children,card),rows,children:cfg.children,__depth:depth+1,
});
return{destroy:()=>childBoard.destroy()};
}
const factory=children.factory
||(typeof globalThis!=='undefined'&&globalThis.LatticeGrid&&globalThis.LatticeGrid.createGrid);
if(!isFunction(factory)){
warnOnce('kanban:children-factory',
'a card pop-out needs children.factory (a createGrid), children.render, or children.asBoard.');
return{destroy:()=>{}};
}
const grid=factory(container,{rows,...childOptions(children,card)});
return{destroy:()=>{if(grid&&isFunction(grid.destroy))grid.destroy();}};
};
const childOptions=(children,card)=>{
const o=children.gridOptions;
const base=isFunction(o)?(o(card)||{}):(isObject(o)?o:{});
return{...base};
};
board.closeDetail=()=>{closeDetail(board);return board;};
board.isFieldEditable=(name)=>{
const spec=ctx.cardSpecs[name];
return!!(spec&&spec.edit&&typeof spec.field==='string');
};
board.editCard=(key,name)=>{
const card=board.model.cardsByKey.get(key);
if(!card)return null;
const field=name||Object.keys(ctx.cardSpecs).find((n)=>board.isFieldEditable(n));
if(!field||!board.isFieldEditable(field))return null;
if(board.isReadonly({column:card.columnId,card:key}))return null;
return startEdit(board,key,field);
};
board.applyEdit=async(key,name,value,opts={})=>{
const origin=opts.origin||'user';
const card=board.model.cardsByKey.get(key);
const spec=ctx.cardSpecs[name];
if(!card||!spec||typeof spec.field!=='string')return false;
const fieldPath=spec.field;
const payload={card,key,field:name,fieldPath,value,origin};
const allowed=await Promise.resolve(emitter.emitBefore('beforeEdit',payload,origin));
if(!allowed){
board.fire('edit:cancelled',{...payload,reason:(payload).reason||'prevented'});
return false;
}
if(gridBound){
const applied=cfg.grid.edit.setCells([{key,colId:gridColId(fieldPath),value}],'cell');
board.refresh();
if(applied===0){
warnOnce('kanban:writeback-noop',
`an inline edit to "${fieldPath}" did not persist through the bound grid `
+'(a read-only, non-editable, permission-blocked or unresolvable column).');
return false;
}
board.fire('card:edit',payload);
return true;
}
const before={...rowStore.get(key)};
setPath(rowStore.get(key),fieldPath,value);
regroup();
board.fire('card:edit',payload);
if(isFunction(cfg.onCardEdit)){
let ok=cfg.onCardEdit(payload);
ok=(ok instanceof Promise)?await ok.then((v)=>v,()=>false):ok;
if(ok===false){rowStore.set(key,before);regroup();return false;}
}
return true;
};
board.addCard=(columnId,seed={})=>{
if(board.isReadonly({column:columnId}))return null;
return gateBefore('beforeAdd','add:cancelled',
{column:columnId,seed,origin:'user'},
()=>{
let row={...seed};
setPath(row,ctx.columnProperty,columnId);
if(gridBound){
const tempKey=cfg.grid.edit.addRow?cfg.grid.edit.addRow(row):null;
if(tempKey==null){warnOnce('kanban:addRow','the bound grid cannot append a row (no mutate.append).');return null;}
board.refresh();
board.fire('card:add',{column:columnId,key:tempKey});
if(board.el)board.editCard(tempKey);
return tempKey;
}
const commit=(finalRow)=>{
let key=ctx.key(finalRow);
if(isNil(key)){
key=uid('card');
if(typeof board.rowKey==='string')setPath(finalRow,board.rowKey,key);
}
rowStore.set(key,finalRow);
regroup();
board.fire('card:add',{column:columnId,key});
if(board.el)board.editCard(key);
return key;
};
if(isFunction(cfg.onAddCard)){
const created=cfg.onAddCard(columnId);
if(created instanceof Promise){
return created.then(
(resolved)=>commit(isObject(resolved)?resolved:row),
()=>null,
);
}
if(isObject(created))row=created;
}
return commit(row);
},
()=>null);
};
const assignOrders=(keys,toColumn,toIndex)=>{
if(!ctx.orderProperty)return null;
const col=board.model.columns.find((c)=>c.id===toColumn);
const others=(col?col.cards:[]).filter((c)=>!keys.includes(c.key));
const neighbourOrders=others.map((c)=>Number(accessorFor(ctx.orderProperty)(c.row)));
const index=isNil(toIndex)?others.length:toIndex;
return computeOrders(neighbourOrders,index,keys.length);
};
const vetoFilter=async(keys,toColumn,toIndex,origin='user')=>{
const accepted=[];
const cancelled=[];
const destCol=board.model.columns.find((c)=>c.id===toColumn);
const wip=ctx.enforceWip&&destCol&&Number.isFinite(destCol.wipLimit)?destCol.wipLimit:null;
let projected=destCol?destCol.cards.filter((c)=>!keys.includes(c.key)).length:0;
for(const key of keys){
const card=board.model.cardsByKey.get(key);
if(!card)continue;
const from=card.columnId;
if(board.isReadonly({column:from,card:key})||board.isReadonly({column:toColumn}))continue;
if(wip!==null&&from!==toColumn&&projected+1>wip){
warnOnce(`kanban:wip:${toColumn}`,
`a move into "${toColumn}" was refused: it is at its WIP limit of ${wip}.`);
continue;
}
const payload={card,key,from,to:toColumn,index:toIndex,origin};
const decision=emitter.emitBefore('beforeMove',payload,origin);
const ok=decision===true?true:decision===false?false:await decision;
if(ok!==false){accepted.push({key,card,from});if(from!==toColumn)projected+=1;}
else cancelled.push({key,card,from,reason:(payload).reason||'prevented'});
}
for(const c of cancelled){
board.fire('move:cancelled',{keys:[c.key],cards:[c.card],from:[c.from],to:toColumn,index:toIndex,reason:c.reason});
}
return accepted;
};
board.move=async(keys,toColumn,toIndex=null,toLane=undefined,opts={})=>{
const origin=opts.origin||'user';
const keyArr=(Array.isArray(keys)?keys:[keys]).filter((k)=>board.model.cardsByKey.has(k));
const accepted=await vetoFilter(keyArr,toColumn,toIndex,origin);
if(!accepted.length)return{moved:[],reverted:false};
const acceptedKeys=accepted.map((a)=>a.key);
const orders=assignOrders(acceptedKeys,toColumn,toIndex);
const writeLane=toLane!==undefined&&!!ctx.swimlaneProperty;
const payload={
keys:acceptedKeys,
cards:accepted.map((a)=>a.card),
from:accepted.map((a)=>a.from),
to:toColumn,
index:toIndex,
origin,
lane:writeLane?toLane:undefined,
orders,
};
if(gridBound){
const grid=cfg.grid;
const writes=[];
const colId=gridColId(ctx.columnProperty);
const orderId=ctx.orderProperty?gridColId(ctx.orderProperty):null;
const laneWriteId=writeLane?gridColId(ctx.swimlaneProperty):null;
accepted.forEach(({key},i)=>{
writes.push({key,colId,value:toColumn});
if(orders&&orderId)writes.push({key,colId:orderId,value:orders[i]});
if(laneWriteId)writes.push({key,colId:laneWriteId,value:toLane});
});
const applied=grid.edit.setCells(writes,'cell');
board.refresh();
if(applied===0&&writes.length){
warnOnce('kanban:writeback-noop',
`a card move did not persist through the bound grid: writing "${ctx.columnProperty}" `
+'was refused (a read-only, non-editable, permission-blocked or unresolvable column), '
+'so the card stayed where it was.');
board.fire('card:reverted',{...payload});
return{moved:[],reverted:true};
}
board.fire('card:move',payload);
return{moved:acceptedKeys,reverted:false};
}
const snapshot=accepted.map(({key})=>({key,row:{...rowStore.get(key)}}));
accepted.forEach(({key},i)=>{
const row=rowStore.get(key);
setPath(row,ctx.columnProperty,toColumn);
if(orders&&ctx.orderProperty)setPath(row,ctx.orderProperty,orders[i]);
if(writeLane)setPath(row,ctx.swimlaneProperty,toLane);
});
regroup();
if(board.el&&isFunction(board.paintSelection))board.paintSelection();
board.fire('card:move',payload);
if(isFunction(cfg.onCardMove)){
let ok=cfg.onCardMove(payload);
ok=(ok instanceof Promise)?await ok.then((v)=>v,()=>false):ok;
if(ok===false){
for(const s of snapshot)rowStore.set(s.key,s.row);
regroup();
if(board.el&&isFunction(board.paintSelection))board.paintSelection();
board.fire('card:reverted',{...payload});
return{moved:[],reverted:true};
}
}
return{moved:acceptedKeys,reverted:false};
};
if(gridBound&&isFunction(cfg.grid.on)){
for(const ev of['cell:confirmed','cell:reverted','cell:conflict']){
cfg.grid.on(ev,()=>board.refresh());
}
cfg.grid.on('cell:reverted',(e)=>{
if(!e||e.colId!==gridColId(ctx.columnProperty))return;
const card=board.card(e.key);
board.fire('card:reverted',{
keys:[e.key],
cards:card?[card]:[],
from:card?[card.columnId]:[],
to:card?card.columnId:null,
index:null,
orders:null,
reverted:true,
reason:e.reason,
});
});
cfg.grid.on('cell:confirmed',(e)=>{
if(!e||e.colId!==gridColId(ctx.columnProperty))return;
const card=board.card(e.key);
board.fire('card:confirmed',{
keys:[e.key],
cards:card?[card]:[],
to:card?card.columnId:null,
});
});
}
board.rows={
apply(change={}){
if(gridBound){
warnOnce('kanban:apply-gridbound',
'rows.apply on a grid-bound board is ignored; route to the bound grid instead.');
return;
}
routed=true;
for(const row of change.add||[])rowStore.set(ctx.key(row),row);
for(const row of change.update||[]){
const key=ctx.key(row);
rowStore.set(key,mergeRow(rowStore.get(key),row));
}
for(const key of change.remove||[])rowStore.delete(key);
board.model=groupRows(ctx,[...rowStore.values()],state);
if(board.el)renderPreserving(board);else if(isFunction(board.paintSelection))board.paintSelection();
if(board.sla&&isFunction(board.sla.evaluate))board.sla.evaluate();
},
forEach(fn){for(const[key,row]of rowStore)fn(row,key);},
get count(){return rowStore.size;},
};
board.setRows=(rows)=>{
if(gridBound){
warnOnce('kanban:setRows-gridbound',
'setRows on a grid-bound board is ignored; the rows come from the bound grid.');
return board;
}
if(Array.isArray(rows))cfg.rows=rows;
routed=false;
seed();
return regroup();
};
board.setColumns=(defs)=>{
if(!Array.isArray(defs))return board;
ctx.columns=defs;
cfg.columns=defs;
ctx.doneColumns=deriveDoneColumns(cfg.doneColumns,defs);
return regroup();
};
board.columns=()=>board.model.columns;
board.column=(id)=>board.model.columns.find((c)=>c.id===id);
board.count=(id)=>(board.column(id)?.count??0);
board.points=(id)=>(board.column(id)?.points??0);
board.cards=()=>[...board.model.cardsByKey.values()];
board.card=(key)=>board.model.cardsByKey.get(key);
board.on=(name,fn)=>{
if(!KANBAN_EVENTS.includes(name)){
warnOnce(`kanban:event:${name}`,
`"${name}" is not a board event; expected one of ${KANBAN_EVENTS.join(', ')}.`);
}
return emitter.on(name,fn);
};
board.off=(name,fn)=>emitter.off(name,fn);
board.readonly=(scope={})=>isReadonly(scope);
board.destroy=()=>{
const node=board.el;
if(node){
while(node.firstChild)node.removeChild(node.firstChild);
node.classList.remove(NS);
}
if(board.flow&&isFunction(board.flow.destroy))board.flow.destroy();
if(board.sla&&isFunction(board.sla.destroy))board.sla.destroy();
board.model={columns:[],cardsByKey:new Map(),unplaced:[]};
};
if(cfg.flow!==false){
board.flow=createFlowAnalytics(board,isObject(cfg.flow)?cfg.flow:{});
}
if(cfg.sla){
board.sla=createSlaMonitor(board,isObject(cfg.sla)?cfg.sla:{});
}
if(isObject(cfg.state)){
const s=cfg.state;
if(Array.isArray(s.collapsedColumns))state.collapsedColumns=new Set(s.collapsedColumns);
if(Array.isArray(s.collapsedLanes))state.collapsedLanes=new Set(s.collapsedLanes);
if('columnOrder'in s&&(Array.isArray(s.columnOrder)||s.columnOrder===null))state.columnOrder=s.columnOrder?[...s.columnOrder]:null;
if('laneOrder'in s&&(Array.isArray(s.laneOrder)||s.laneOrder===null))state.laneOrder=s.laneOrder?[...s.laneOrder]:null;
if(typeof s.quickFilter==='string')state.quickFilter=s.quickFilter;
if('sprint'in s)state.sprint=s.sprint;
if('epic'in s)state.epic=s.epic;
if(Array.isArray(s.selection))for(const k of s.selection)selection.add(k);
}
board.refresh();
if(board.flow&&isFunction(board.flow.seed))board.flow.seed();
if(board.sla&&isFunction(board.sla.start))board.sla.start();
return board;
}
const __default=createKanban;
});
var __entry=__req("packages/modules/kanban/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridKanban"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);