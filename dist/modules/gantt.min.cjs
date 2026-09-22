/*!
 * Lattice Grid 1.68.1, gantt module
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
const STAMPED_VERSION="1.68.1";
async function resolveVersion(){
if(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;
return STAMPED_VERSION;
}
const VERSION="1.68.1";
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
__def("packages/modules/gantt/time.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"toDayNumber",{enumerable:true,get:function(){return toDayNumber;}});
Object.defineProperty(__exports,"fromDayNumber",{enumerable:true,get:function(){return fromDayNumber;}});
Object.defineProperty(__exports,"toISODate",{enumerable:true,get:function(){return toISODate;}});
Object.defineProperty(__exports,"resolveProjectEpoch",{enumerable:true,get:function(){return resolveProjectEpoch;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const DAY_MS=86400000;
function toDayNumber(value){
if(value==null||value==='')return null;
if(typeof value==='number')return Number.isFinite(value)?value:null;
if(value instanceof Date){
if(!Number.isFinite(value.getTime()))return null;
return Math.floor(Date.UTC(value.getFullYear(),value.getMonth(),value.getDate())/DAY_MS);
}
const ms=Date.parse(value);
if(!Number.isFinite(ms))return null;
return Math.floor(ms/DAY_MS);
}
function fromDayNumber(day){
if(!Number.isFinite(day))return null;
return new Date(Math.round(day)*DAY_MS);
}
function toISODate(day){
const d=fromDayNumber(day);
return d?d.toISOString().slice(0,10):null;
}
function resolveProjectEpoch(spec){
if(spec==null||spec==='')return 0;
const day=toDayNumber(spec);
if(Number.isFinite(day))return(day);
warnOnce(
`gantt.projectEpoch:${String(spec)}`,
`[lattice] gantt: projectEpoch ${JSON.stringify(spec)} is not a date or a day number; the plan is rendered against the Unix epoch (day 0 = 1970-01-01).`,
);
return 0;
}
});
__def("packages/modules/gantt/calendar.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createCalendar",{enumerable:true,get:function(){return createCalendar;}});
const __m0=__req("packages/modules/gantt/time.js");
const fromDayNumber=__m0["fromDayNumber"];
const toDayNumber=__m0["toDayNumber"];
const DEFAULT_WORKDAYS=Object.freeze([1,2,3,4,5]);
function createCalendar(spec,anchorDay=0){
if(spec==null)return null;
let workdays;
let holidays;
if(spec==='weekends'){
workdays=DEFAULT_WORKDAYS;
holidays=new Set();
}else{
workdays=Array.isArray(spec.workdays)&&spec.workdays.length
?spec.workdays.map(Number).filter((n)=>n>=0&&n<=6)
:DEFAULT_WORKDAYS;
holidays=new Set((Array.isArray(spec.holidays)?spec.holidays:[])
.map((h)=>toDayNumber(h))
.filter((d)=>d!=null));
}
const workSet=new Set(workdays);
if(workSet.size===7&&holidays.size===0)return null;
if(workSet.size===0)return null;
const isWorking=(day)=>{
const d=fromDayNumber(day);
if(!d)return false;
return workSet.has(d.getUTCDay())&&!holidays.has(day);
};
const nextWorking=(day)=>{let d=day;while(!isWorking(d))d+=1;return d;};
const prevWorking=(day)=>{let d=day;while(!isWorking(d))d-=1;return d;};
const anchor=nextWorking(Math.round(Number.isFinite(anchorDay)?anchorDay:0));
const dayMemo=new Map([[0,anchor]]);
const indexMemo=new Map([[anchor,0]]);
const dayOf=(index)=>{
const i=Math.round(index);
if(dayMemo.has(i))return dayMemo.get(i);
if(i>0){
let k=i-1;
while(!dayMemo.has(k))k-=1;
let d=dayMemo.get(k);
for(let j=k+1;j<=i;j+=1){d=nextWorking(d+1);dayMemo.set(j,d);indexMemo.set(d,j);}
return dayMemo.get(i);
}
let k=i+1;
while(!dayMemo.has(k))k+=1;
let d=dayMemo.get(k);
for(let j=k-1;j>=i;j-=1){d=prevWorking(d-1);dayMemo.set(j,d);indexMemo.set(d,j);}
return dayMemo.get(i);
};
const indexOf=(day)=>{
const w=nextWorking(Math.round(day));
if(indexMemo.has(w))return indexMemo.get(w);
if(w>anchor){
let idx=0;
let d=anchor;
while(indexMemo.has(nextWorking(d+1))&&d<w){d=nextWorking(d+1);idx=indexMemo.get(d);}
while(d<w){d=nextWorking(d+1);idx+=1;dayMemo.set(idx,d);indexMemo.set(d,idx);}
return idx;
}
let idx=0;
let d=anchor;
while(d>w){d=prevWorking(d-1);idx-=1;dayMemo.set(idx,d);indexMemo.set(d,idx);}
return idx;
};
return{isWorking,nextWorking,dayOf,indexOf,anchor};
}
});
__def("packages/modules/gantt/schedule.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"LINK_TYPES",{enumerable:true,get:function(){return LINK_TYPES;}});
Object.defineProperty(__exports,"CONSTRAINT_TYPES",{enumerable:true,get:function(){return CONSTRAINT_TYPES;}});
Object.defineProperty(__exports,"EPS",{enumerable:true,get:function(){return EPS;}});
Object.defineProperty(__exports,"SCHEDULE_ERROR",{enumerable:true,get:function(){return SCHEDULE_ERROR;}});
Object.defineProperty(__exports,"TASK_FIELDS",{enumerable:true,get:function(){return TASK_FIELDS;}});
Object.defineProperty(__exports,"taskIdReader",{enumerable:true,get:function(){return taskIdReader;}});
Object.defineProperty(__exports,"taskFieldWriters",{enumerable:true,get:function(){return taskFieldWriters;}});
Object.defineProperty(__exports,"normalizeTasks",{enumerable:true,get:function(){return normalizeTasks;}});
Object.defineProperty(__exports,"buildTree",{enumerable:true,get:function(){return buildTree;}});
Object.defineProperty(__exports,"normalizeLinkSpec",{enumerable:true,get:function(){return normalizeLinkSpec;}});
Object.defineProperty(__exports,"normalizeDependencies",{enumerable:true,get:function(){return normalizeDependencies;}});
Object.defineProperty(__exports,"expandDependencies",{enumerable:true,get:function(){return expandDependencies;}});
Object.defineProperty(__exports,"topoOrder",{enumerable:true,get:function(){return topoOrder;}});
Object.defineProperty(__exports,"computeSchedule",{enumerable:true,get:function(){return computeSchedule;}});
Object.defineProperty(__exports,"findViolations",{enumerable:true,get:function(){return findViolations;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/gantt/calendar.js");
const createCalendar=__m1["createCalendar"];
const __m2=__req("packages/modules/gantt/time.js");
const toDayNumber=__m2["toDayNumber"];
const LINK_TYPES=(['FS','SS','FF','SF']);
const CONSTRAINT_TYPES=(['MSO','MFO','ALAP']);
const CONSTRAINT_ALIASES=Object.freeze({
mso:'MSO','must-start-on':'MSO',muststarton:'MSO','start-on':'MSO',
mfo:'MFO','must-finish-on':'MFO',mustfinishon:'MFO','finish-on':'MFO',
alap:'ALAP','as-late-as-possible':'ALAP',aslateaspossible:'ALAP',late:'ALAP',
});
const EPS=1e-9;
const SCHEDULE_ERROR={
CYCLE:'cycle',
DUPLICATE_ID:'duplicate-id',
UNKNOWN_TASK:'unknown-task',
BAD_DURATION:'bad-duration',
BAD_LINK_TYPE:'bad-link-type',
SELF_DEPENDENCY:'self-dependency',
UNKNOWN_PARENT:'unknown-parent',
PARENT_CYCLE:'parent-cycle',
DEP_ACROSS_HIERARCHY:'dep-across-hierarchy',
};
function asNumber(value){
if(value==null||value==='')return null;
const n=typeof value==='number'?value:Number(value);
return Number.isFinite(n)?n:null;
}
function toDay(value){
if(value==null||value==='')return null;
return toDayNumber(value);
}
const TASK_FIELDS=Object.freeze([
'id','name','start','end','duration','milestone','percentComplete',
'parent','baselineStart','baselineEnd','constraint','constraintDate',
]);
function fieldReaders(fields){
const spec=fields&&typeof fields==='object'?fields:{};
const out={};
for(const name of TASK_FIELDS){
const mapped=spec[name];
if(typeof mapped==='function')out[name]=(mapped);
else if(typeof mapped==='string'&&mapped!==''){
const from=mapped;
out[name]=(raw)=>raw[from];
}else{
out[name]=(raw)=>raw[name];
}
}
return out;
}
function taskIdReader(fields){
return fieldReaders(fields).id;
}
function taskFieldWriters(fields){
const spec=fields&&typeof fields==='object'?fields:{};
const out={};
for(const name of TASK_FIELDS){
const mapped=spec[name];
if(typeof mapped==='string'&&mapped!=='')out[name]=mapped;
else if(typeof mapped==='function')out[name]=null;
else out[name]=name;
}
return out;
}
function readConstraint(raw,read){
const mapped=read.constraint(raw);
const rawType=mapped!=null?mapped:(raw&&raw.constraintType);
if(rawType==null||rawType==='')return null;
const code=CONSTRAINT_ALIASES[String(rawType).toLowerCase().replace(/\s+/g,'-')]
??(CONSTRAINT_TYPES.includes(String(rawType).toUpperCase())?String(rawType).toUpperCase():null);
if(!code)return null;
const at=toDay(read.constraintDate(raw)??raw.constraintAt??raw.at);
return{type:code,at};
}
function normalizeTasks(tasks,fields){
const byId=new Map();
const order=[];
const read=fieldReaders(fields);
if(!Array.isArray(tasks)){
return{ok:false,error:{code:SCHEDULE_ERROR.BAD_DURATION,message:'tasks must be an array'},order,byId};
}
for(const raw of tasks){
const rawId=raw?read.id(raw):null;
const id=rawId!=null?String(rawId):null;
if(id==null){
return{ok:false,error:{code:SCHEDULE_ERROR.UNKNOWN_TASK,message:'every task needs an id'},order,byId};
}
if(byId.has(id)){
return{ok:false,error:{code:SCHEDULE_ERROR.DUPLICATE_ID,message:`duplicate task id "${id}"`,id},order,byId};
}
const start=toDay(read.start(raw));
const end=toDay(read.end(raw));
const isMilestone=read.milestone(raw)===true;
let duration=isMilestone?0:asNumber(read.duration(raw));
if(duration==null&&start!=null&&end!=null)duration=end-start;
if(duration!=null&&duration<0){
return{ok:false,error:{code:SCHEDULE_ERROR.BAD_DURATION,message:`task "${id}" has negative duration ${duration}`,id},order,byId};
}
const name=read.name(raw);
const parent=read.parent(raw);
byId.set(id,{
id,
name:name!=null?String(name):id,
duration,
milestoneFlag:isMilestone,
earliestStart:start,
placedStart:start,
placedEnd:end,
percentComplete:asNumber(read.percentComplete(raw)),
parent:parent!=null?String(parent):null,
constraint:readConstraint(raw,read),
baselineStart:toDay(read.baselineStart(raw)??(raw.baseline&&raw.baseline.start)),
baselineEnd:toDay(read.baselineEnd(raw)??(raw.baseline&&raw.baseline.end)),
});
order.push(id);
}
return{ok:true,order,byId};
}
function buildTree(order,byId){
const children=new Map(order.map((id)=>[id,[]]));
for(const id of order){
const p=byId.get(id).parent;
if(p==null)continue;
if(!byId.has(p)){
return{ok:false,error:{code:SCHEDULE_ERROR.UNKNOWN_PARENT,message:`task "${id}" names unknown parent "${p}"`,id}};
}
children.get(p).push(id);
}
for(const id of order){
const seen=new Set();
let cur=byId.get(id).parent;
while(cur!=null){
if(cur===id||seen.has(cur)){
return{ok:false,error:{code:SCHEDULE_ERROR.PARENT_CYCLE,message:`parent cycle at "${id}"`,id}};
}
seen.add(cur);
cur=byId.get(cur)?.parent??null;
}
}
const isSummary=(id)=>children.get(id).length>0;
const leafMemo=new Map();
const descendantLeaves=(id)=>{
if(leafMemo.has(id))return leafMemo.get(id);
const kids=children.get(id);
const leaves=kids.length===0?[id]:kids.flatMap((c)=>descendantLeaves(c));
leafMemo.set(id,leaves);
return leaves;
};
const ancestors=(id)=>{
const out=new Set();
let cur=byId.get(id).parent;
while(cur!=null){out.add(cur);cur=byId.get(cur).parent;}
return out;
};
return{ok:true,children,isSummary,descendantLeaves,ancestors};
}
const LINK_SHORTHAND=/^\s*(FS|SS|FF|SF)\s*(?:([+-])\s*(\d+(?:\.\d+)?))?\s*$/i;
function normalizeLinkSpec(raw){
const dep={...(raw||null)};
if(typeof dep.type!=='string')return dep;
const m=LINK_SHORTHAND.exec(dep.type);
if(!m||!m[2])return dep;
const lag=(m[2]==='-'?-1:1)*Number(m[3]);
dep.type=m[1].toUpperCase();
const explicit=asNumber(raw.lag);
if(explicit!=null&&explicit!==lag){
warnOnce(
`gantt-link-shorthand-${String(raw.type)}-${explicit}`,
`[lattice] gantt: dependency type ${JSON.stringify(raw.type)} carries a lag of ${lag} but lag: ${explicit} was also given; the explicit lag wins. Give one or the other.`,
);
return dep;
}
dep.lag=lag;
return dep;
}
function normalizeDependencies(deps,byId,tree={}){
const edges=[];
if(deps==null)return{ok:true,edges};
if(!Array.isArray(deps)){
return{ok:false,error:{code:SCHEDULE_ERROR.UNKNOWN_TASK,message:'dependencies must be an array'},edges};
}
const ancestors=typeof tree.ancestors==='function'?tree.ancestors:null;
for(const input of deps){
const raw=normalizeLinkSpec(input);
const from=raw&&raw.from!=null?String(raw.from):null;
const to=raw&&raw.to!=null?String(raw.to):null;
const type=raw&&raw.type!=null?String(raw.type).toUpperCase():'FS';
const lag=asNumber(raw.lag)??0;
if(from==null||to==null){
return{ok:false,error:{code:SCHEDULE_ERROR.UNKNOWN_TASK,message:'a dependency needs both `from` and `to`'},edges};
}
if(!byId.has(from)){
return{ok:false,error:{code:SCHEDULE_ERROR.UNKNOWN_TASK,message:`dependency references unknown task "${from}"`,id:from},edges};
}
if(!byId.has(to)){
return{ok:false,error:{code:SCHEDULE_ERROR.UNKNOWN_TASK,message:`dependency references unknown task "${to}"`,id:to},edges};
}
if(from===to){
return{ok:false,error:{code:SCHEDULE_ERROR.SELF_DEPENDENCY,message:`task "${from}" depends on itself`,id:from},edges};
}
if(!LINK_TYPES.includes((type))){
return{ok:false,error:{code:SCHEDULE_ERROR.BAD_LINK_TYPE,message:`unknown link type "${type}" (expected one of ${LINK_TYPES.join('/')})`},edges};
}
if(ancestors&&(ancestors(from).has(to)||ancestors(to).has(from))){
return{ok:false,error:{code:SCHEDULE_ERROR.DEP_ACROSS_HIERARCHY,message:`dependency between "${from}" and "${to}" crosses their own parent/child hierarchy`,from,to},edges};
}
edges.push({from,to,type,lag});
}
return{ok:true,edges};
}
function expandDependencies(edges,tree){
const seen=new Set();
const out=[];
for(const e of edges){
const summaryEnd=tree.isSummary(e.from)||tree.isSummary(e.to);
if(summaryEnd&&e.type!=='FS'){
warnOnce(
`gantt-summary-link-${e.type}-${e.from}-${e.to}`,
`[lattice] gantt: ${e.type} link with a summary endpoint (${e.from} -> ${e.to}) is expanded to descendant leaves — a conservative v1 reading; only FS is exact for summary endpoints.`,
);
}
for(const from of tree.descendantLeaves(e.from)){
for(const to of tree.descendantLeaves(e.to)){
if(from===to)continue;
const key=[from,to,e.type,e.lag].join('\u0001');
if(seen.has(key))continue;
seen.add(key);
out.push({from,to,type:e.type,lag:e.lag});
}
}
}
return out;
}
function topoOrder(order,edges){
const indeg=new Map(order.map((id)=>[id,0]));
const succ=new Map(order.map((id)=>[id,[]]));
for(const e of edges){
indeg_inc(indeg,e.to);
succ.get(e.from).push(e.to);
}
const queue=order.filter((id)=>indeg.get(id)===0);
const sorted=[];
while(queue.length){
const id=queue.shift();
sorted.push(id);
for(const s of succ.get(id)){
const d=indeg.get(s)-1;
indeg.set(s,d);
if(d===0)queue.push(s);
}
}
if(sorted.length===order.length)return{ok:true,sorted};
return{ok:false,cycle:recoverCycle(order,succ,new Set(sorted))};
}
function indeg_inc(indeg,id){
indeg.set(id,indeg.get(id)+1);
}
function recoverCycle(order,succ,settled){
const start=order.find((id)=>!settled.has(id));
const path=[];
const onPath=new Map();
let node=start;
while(node!=null&&!onPath.has(node)){
onPath.set(node,path.length);
path.push(node);
node=succ.get(node).find((s)=>!settled.has(s));
}
if(node==null)return path;
return path.slice(onPath.get(node)).concat(node);
}
function scheduleLeaves(order,byId,edges,projectStart,deadline,constraints=new Map()){
const topo=topoOrder(order,edges);
if(!topo.ok){
warnOnce(
`gantt-cycle-${topo.cycle.join('>')}`,
`[lattice] gantt: dependency cycle detected (${topo.cycle.join(' -> ')}); schedule refused.`,
);
return{ok:false,error:{code:SCHEDULE_ERROR.CYCLE,message:`dependency cycle: ${topo.cycle.join(' -> ')}`,cycle:topo.cycle}};
}
const sorted=topo.sorted;
const inEdges=new Map(order.map((id)=>[id,[]]));
const outEdges=new Map(order.map((id)=>[id,[]]));
for(const e of edges){
inEdges.get(e.to).push(e);
outEdges.get(e.from).push(e);
}
const S=new Map();
for(const id of order){
const t=byId.get(id);
S.set(id,{
id,name:t.name,duration:t.duration,es:0,ef:0,ls:0,lf:0,
totalFloat:0,critical:false,percentComplete:t.percentComplete,
parent:t.parent,isSummary:false,isMilestone:t.duration===0,children:[],
});
}
const conflicts=[];
for(const id of sorted){
const t=byId.get(id);
const s=S.get(id);
let es=Math.max(projectStart,t.earliestStart??projectStart);
for(const e of inEdges.get(id)){
const p=S.get(e.from);
let bound;
switch(e.type){
case'FS':bound=p.ef+e.lag;break;
case'SS':bound=p.es+e.lag;break;
case'FF':bound=p.ef+e.lag-s.duration;break;
case'SF':bound=p.es+e.lag-s.duration;break;
default:bound=-Infinity;
}
if(bound>es)es=bound;
}
const con=constraints.get(id);
if(con&&con.type!=='ALAP'&&con.at!=null){
const want=con.type==='MFO'?con.at-s.duration:con.at;
if(want<es-EPS){
conflicts.push({id,type:con.type,at:con.at,earliestFeasible:es});
}else{
es=want;
}
s.pinned=true;
}
s.es=es;
s.ef=es+s.duration;
}
const projectFinish=order.length
?Math.max(...order.map((id)=>S.get(id).ef))
:projectStart;
const lfInit=Number.isFinite(deadline)?deadline:projectFinish;
for(let i=sorted.length-1;i>=0;i-=1){
const id=sorted[i];
const s=S.get(id);
let lf=lfInit;
for(const e of outEdges.get(id)){
const succ=S.get(e.to);
let boundLf;
switch(e.type){
case'FS':boundLf=succ.ls-e.lag;break;
case'SS':boundLf=(succ.ls-e.lag)+s.duration;break;
case'FF':boundLf=succ.lf-e.lag;break;
case'SF':boundLf=(succ.lf-e.lag)+s.duration;break;
default:boundLf=Infinity;
}
if(boundLf<lf)lf=boundLf;
}
if(s.pinned)lf=s.ef;
s.lf=lf;
s.ls=lf-s.duration;
s.totalFloat=s.ls-s.es;
s.critical=s.totalFloat<=EPS;
}
for(const id of order){
const con=constraints.get(id);
if(!con||con.type!=='ALAP')continue;
const s=S.get(id);
s.es=s.ls;
s.ef=s.lf;
s.totalFloat=0;
s.critical=true;
}
const critical=order.filter((id)=>S.get(id).critical);
const criticalPaths=enumerateCriticalPaths(order,edges,S);
return{ok:true,tasks:S,critical,criticalPaths,projectFinish,conflicts};
}
function computeSchedule(tasks,deps=[],options={}){
const projectStartDay=toDay(options.projectStart)??0;
const deadlineDay=toDay(options.deadline);
const calendar=createCalendar(options.calendar,projectStartDay);
const toIndex=(d)=>(d==null?null:(calendar?calendar.indexOf(d):d));
const toCalDay=(i)=>(calendar?calendar.dayOf(i):i);
const nt=normalizeTasks(tasks,options.fields);
if(!nt.ok)return{ok:false,error:nt.error};
const{order,byId}=nt;
const tree=buildTree(order,byId);
if(!tree.ok)return{ok:false,error:tree.error};
const nd=normalizeDependencies(deps,byId,tree);
if(!nd.ok)return{ok:false,error:nd.error};
for(const id of order){
if(tree.isSummary(id))continue;
if(byId.get(id).duration==null){
return{ok:false,error:{code:SCHEDULE_ERROR.BAD_DURATION,message:`task "${id}" has no duration and no start+end to derive one`,id}};
}
}
const leafOrder=order.filter((id)=>!tree.isSummary(id));
const leafById=new Map(leafOrder.map((id)=>{
const t=byId.get(id);
return[id,{...t,earliestStart:toIndex(t.earliestStart)}];
}));
const constraints=new Map();
for(const id of leafOrder){
const c=byId.get(id).constraint;
if(c)constraints.set(id,{type:c.type,at:toIndex(c.at)});
}
const projectStartIndex=calendar?calendar.indexOf(projectStartDay):projectStartDay;
const deadlineIndex=deadlineDay==null?undefined:toIndex(deadlineDay);
const leafEdges=expandDependencies(nd.edges,tree);
const leaf=scheduleLeaves(leafOrder,leafById,leafEdges,projectStartIndex,deadlineIndex,constraints);
if(!leaf.ok)return{ok:false,error:leaf.error};
const S=leaf.tasks;
for(const id of leafOrder){
const s=S.get(id);
s.es=toCalDay(s.es);
s.ef=toCalDay(s.ef);
s.ls=toCalDay(s.ls);
s.lf=toCalDay(s.lf);
attachBaseline(s,byId.get(id).baselineStart,byId.get(id).baselineEnd);
}
for(let i=order.length-1;i>=0;i-=1){
const id=order[i];
if(!tree.isSummary(id))continue;
S.set(id,deriveSummary(id,byId.get(id),tree,S));
}
for(const id of order){
if(tree.isSummary(id))S.get(id).children=tree.children.get(id).slice();
}
const projectStart=calendar?calendar.anchor:projectStartDay;
const projectFinish=toCalDay(leaf.projectFinish);
return{
ok:true,
tasks:S,
order,
critical:leaf.critical,
criticalPaths:leaf.criticalPaths,
projectStart,
projectFinish,
projectDuration:projectFinish-projectStart,
conflicts:leaf.conflicts||[],
calendar:!!calendar,
};
}
function attachBaseline(rec,baselineStart,baselineEnd){
if(baselineStart==null&&baselineEnd==null)return;
rec.baselineStart=baselineStart??null;
rec.baselineEnd=baselineEnd??null;
rec.startVariance=baselineStart==null?null:rec.es-baselineStart;
rec.finishVariance=baselineEnd==null?null:rec.ef-baselineEnd;
rec.durationVariance=(baselineStart==null||baselineEnd==null)
?null:(rec.ef-rec.es)-(baselineEnd-baselineStart);
}
function deriveSummary(id,raw,tree,S){
const kids=tree.children.get(id).map((c)=>S.get(c));
const es=Math.min(...kids.map((k)=>k.es));
const ef=Math.max(...kids.map((k)=>k.ef));
const ls=Math.min(...kids.map((k)=>k.ls));
const lf=Math.max(...kids.map((k)=>k.lf));
const leaves=tree.descendantLeaves(id).map((l)=>S.get(l));
const weight=leaves.reduce((a,l)=>a+l.duration,0);
const percentComplete=weight>EPS
?leaves.reduce((a,l)=>a+l.duration*(l.percentComplete??0),0)/weight
:null;
const rec={
id,
name:raw.name,
duration:ef-es,
es,ef,ls,lf,
totalFloat:ls-es,
critical:kids.some((k)=>k.critical),
percentComplete,
parent:raw.parent,
isSummary:true,
isMilestone:false,
children:[],
};
const bStarts=leaves.map((l)=>l.baselineStart).filter((v)=>v!=null);
const bEnds=leaves.map((l)=>l.baselineEnd).filter((v)=>v!=null);
if(bStarts.length||bEnds.length){
attachBaseline(rec,bStarts.length?Math.min(...bStarts):null,bEnds.length?Math.max(...bEnds):null);
}
return rec;
}
function enumerateCriticalPaths(order,edges,S){
const crit=new Map(order.map((id)=>[id,[]]));
const hasCritPred=new Set();
for(const e of edges){
const p=S.get(e.from);
const s=S.get(e.to);
if(!p.critical||!s.critical)continue;
let bound;
switch(e.type){
case'FS':bound=p.ef+e.lag;break;
case'SS':bound=p.es+e.lag;break;
case'FF':bound=p.ef+e.lag-s.duration;break;
case'SF':bound=p.es+e.lag-s.duration;break;
default:bound=-Infinity;
}
if(Math.abs(bound-s.es)<=EPS){
crit.get(e.from).push(e.to);
hasCritPred.add(e.to);
}
}
const sources=order.filter((id)=>S.get(id).critical&&!hasCritPred.has(id));
const paths=[];
const walk=(id,acc)=>{
const next=crit.get(id);
if(!next.length){paths.push(acc);return;}
for(const n of next)walk(n,acc.concat(n));
};
for(const src of sources)walk(src,[src]);
return paths;
}
function findViolations(tasks,schedule,fields){
if(!schedule||!schedule.ok)return[];
const violations=[];
const read=fieldReaders(fields);
for(const raw of tasks){
const rawId=raw?read.id(raw):null;
const id=rawId!=null?String(rawId):null;
if(id==null||!schedule.tasks.has(id))continue;
const rec=schedule.tasks.get(id);
if(rec.isSummary)continue;
const placed=asNumber(read.start(raw));
if(placed==null)continue;
if(placed<rec.es-EPS)violations.push({id,placedStart:placed,earliestStart:rec.es,by:rec.es-placed});
}
return violations;
}
});
__def("packages/modules/gantt/resources.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"parseAssignments",{enumerable:true,get:function(){return parseAssignments;}});
Object.defineProperty(__exports,"normalizeCapacities",{enumerable:true,get:function(){return normalizeCapacities;}});
Object.defineProperty(__exports,"sweepLoad",{enumerable:true,get:function(){return sweepLoad;}});
Object.defineProperty(__exports,"computeResourceLoad",{enumerable:true,get:function(){return computeResourceLoad;}});
Object.defineProperty(__exports,"levelResources",{enumerable:true,get:function(){return levelResources;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/gantt/schedule.js");
const computeSchedule=__m1["computeSchedule"];
const EPS=__m1["EPS"];
const taskIdReader=__m1["taskIdReader"];
const __m2=__req("packages/modules/gantt/calendar.js");
const createCalendar=__m2["createCalendar"];
function asNumber(value){
if(value==null||value==='')return null;
const n=typeof value==='number'?value:Number(value);
return Number.isFinite(n)?n:null;
}
function parseAssignments(raw){
if(raw&&Array.isArray(raw.assignments)){
return raw.assignments
.map((a)=>{
const resource=a&&(a.resource??a.name??a.id);
if(resource==null||resource==='')return null;
const units=asNumber(a.units)??asNumber(a.allocation)??1;
return{resource:String(resource),units};
})
.filter(Boolean);
}
const value=raw?(raw.assignee??raw.assignees??raw.owner):null;
const names=Array.isArray(value)?value:(value==null||value===''?[]:[value]);
return names
.map((v)=>String(v))
.filter((v)=>v!=='')
.map((name)=>({resource:name,units:1}));
}
function normalizeCapacities(resources,defaultCapacity){
const map=new Map();
if(Array.isArray(resources)){
for(const r of resources){
const name=r&&(r.id??r.name??r.resource);
if(name==null||name==='')continue;
const cap=asNumber(r.capacity??r.maxUnits??r.max??r.units);
map.set(String(name),cap==null?defaultCapacity:cap);
}
}else if(resources&&typeof resources==='object'){
for(const[name,cap]of Object.entries(resources)){
const c=asNumber(cap);
map.set(String(name),c==null?defaultCapacity:c);
}
}
return map;
}
function sweepLoad(intervals){
if(!intervals.length)return[];
const points=new Set();
for(const it of intervals){points.add(it.s);points.add(it.e);}
const cuts=[...points].sort((a,b)=>a-b);
const segments=[];
for(let i=0;i<cuts.length-1;i+=1){
const s=cuts[i];
const e=cuts[i+1];
if(e<=s)continue;
let load=0;
const taskIds=[];
for(const it of intervals){
if(it.s<=s&&it.e>=e){load+=it.units;taskIds.push(it.taskId);}
}
if(taskIds.length)segments.push({s,e,load,taskIds});
}
return segments;
}
function computeResourceLoad(tasks,schedule,options={}){
const empty={ok:false,resources:[],overAllocations:[],byResource:new Map()};
if(!schedule||!schedule.ok)return empty;
const defaultCapacity=asNumber(options.defaultCapacity)??1;
const capacities=normalizeCapacities(options.resources,defaultCapacity);
const cal=options.calendar!=null?createCalendar(options.calendar,schedule.projectStart):null;
const capacityOf=(name)=>(capacities.has(name)?capacities.get(name):defaultCapacity);
const toIndex=(day)=>(cal?cal.indexOf(day):day);
const toCalDay=(index)=>(cal?cal.dayOf(index):index);
const readId=taskIdReader(options.fields);
const bookings=new Map();
for(const id of schedule.order){
const rec=schedule.tasks.get(id);
if(!rec||rec.isSummary)continue;
const raw=tasks.find((t)=>t&&readId(t)!=null&&String(readId(t))===id);
if(!raw)continue;
const assigns=parseAssignments(raw);
if(!assigns.length)continue;
const s=toIndex(rec.es);
const e=toIndex(rec.ef);
if(e<=s)continue;
for(const a of assigns){
if(!bookings.has(a.resource))bookings.set(a.resource,[]);
bookings.get(a.resource).push({s,e,units:a.units,taskId:id});
}
}
const byResource=new Map();
const resources=[];
const overAllocations=[];
for(const[name,intervals]of bookings){
const capacity=capacityOf(name);
const raw=sweepLoad(intervals);
let peak=0;
const segments=raw.map((seg)=>{
if(seg.load>peak)peak=seg.load;
const out={start:toCalDay(seg.s),end:toCalDay(seg.e),load:seg.load,taskIds:seg.taskIds};
if(seg.load>capacity+EPS){
overAllocations.push({resource:name,capacity,start:out.start,end:out.end,load:seg.load,taskIds:seg.taskIds.slice()});
}
return out;
});
const entry={resource:name,capacity,peak,segments};
byResource.set(name,entry);
resources.push(entry);
}
resources.sort((a,b)=>(a.resource<b.resource?-1:a.resource>b.resource?1:0));
overAllocations.sort((a,b)=>a.start-b.start||(a.resource<b.resource?-1:1));
return{ok:true,resources,overAllocations,byResource};
}
function isPinned(raw){
if(!raw)return false;
const c=raw.constraint??raw.constraintType;
if(c==null||c==='')return false;
const code=String(c).toLowerCase().replace(/\s+/g,'-');
return code==='mso'||code==='must-start-on'||code==='muststarton'||code==='start-on'
||code==='mfo'||code==='must-finish-on'||code==='mustfinishon'||code==='finish-on';
}
function priorityOf(raw,field){
return raw?(asNumber(raw[field])??0):0;
}
function levelResources(tasks,deps,options={}){
const schedOpts={
projectStart:options.projectStart,deadline:options.deadline,calendar:options.calendar,fields:options.fields,
};
const priorityField=options.priorityField||'priority';
const maxIterations=options.maxIterations!=null
?options.maxIterations
:Math.max(100,tasks.length*tasks.length*2);
const readId=taskIdReader(options.fields);
const working=tasks.map((t)=>({...t}));
const order=working.map((t)=>String(readId(t)));
const orderIndex=(id)=>order.indexOf(id);
let schedule=computeSchedule(working,deps,schedOpts);
if(!schedule.ok)return{ok:false,error:schedule.error};
const originalStart=new Map();
for(const id of schedule.order){
const rec=schedule.tasks.get(id);
if(rec&&!rec.isSummary)originalStart.set(id,rec.es);
}
let iterations=0;
for(;iterations<maxIterations;iterations+=1){
const load=computeResourceLoad(working,schedule,options);
if(!load.overAllocations.length){
return{ok:true,resolved:true,tasks:working,schedule,moves:collectMoves(originalStart,schedule),iterations};
}
const seg=load.overAllocations.slice().sort((a,b)=>a.start-b.start||b.load-a.load)[0];
const rawById=new Map(working.map((t)=>[String(readId(t)),t]));
const candidates=seg.taskIds
.map((id)=>schedule.tasks.get(id))
.filter(Boolean);
const movable=candidates.filter((rec)=>!isPinned(rawById.get(rec.id)));
if(!movable.length){
return{ok:true,resolved:false,tasks:working,schedule,moves:collectMoves(originalStart,schedule),remaining:load.overAllocations,iterations};
}
movable.sort((a,b)=>{
if(b.totalFloat!==a.totalFloat)return b.totalFloat-a.totalFloat;
const pa=priorityOf(rawById.get(a.id),priorityField);
const pb=priorityOf(rawById.get(b.id),priorityField);
if(pa!==pb)return pa-pb;
if(b.es!==a.es)return b.es-a.es;
return orderIndex(b.id)-orderIndex(a.id);
});
const victim=movable[0];
const competitorFinishes=candidates
.filter((rec)=>rec.id!==victim.id)
.map((rec)=>rec.ef)
.filter((ef)=>ef>victim.es+EPS);
const target=competitorFinishes.length?Math.min(...competitorFinishes):victim.es+1;
rawById.get(victim.id).start=target;
schedule=computeSchedule(working,deps,schedOpts);
if(!schedule.ok)return{ok:false,error:schedule.error};
}
const finalLoad=computeResourceLoad(working,schedule,options);
if(finalLoad.overAllocations.length){
warnOnce(
'gantt-level-unresolved',
`[lattice] gantt: resource leveling hit its ${maxIterations}-iteration cap with ${finalLoad.overAllocations.length} over-allocation(s) unresolved; returning the partial result.`,
);
}
return{
ok:true,
resolved:finalLoad.overAllocations.length===0,
tasks:working,
schedule,
moves:collectMoves(originalStart,schedule),
remaining:finalLoad.overAllocations,
iterations,
};
}
function collectMoves(originalStart,schedule){
const moves=[];
for(const id of schedule.order){
const rec=schedule.tasks.get(id);
if(!rec||rec.isSummary)continue;
const from=originalStart.get(id);
if(from==null)continue;
if(rec.es>from+EPS)moves.push({id,from,to:rec.es,delay:rec.es-from});
}
return moves;
}
});
__def("packages/modules/gantt/earned-value.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"computeEarnedValue",{enumerable:true,get:function(){return computeEarnedValue;}});
const __m0=__req("packages/modules/gantt/time.js");
const toDayNumber=__m0["toDayNumber"];
const EPS=1e-9;
function asNumber(v){
if(v==null||v==='')return null;
const n=typeof v==='number'?v:Number(v);
return Number.isFinite(n)?n:null;
}
function plannedFraction(status,start,end){
if(end-start<=EPS)return status>=end?1:0;
if(status<=start)return 0;
if(status>=end)return 1;
return(status-start)/(end-start);
}
function leafFigures(rec,raw,status,costField,actualCostField){
const cost=raw?asNumber(raw[costField]):null;
const bac=cost==null?rec.duration:cost;
const ac=raw?asNumber(raw[actualCostField]):null;
const pct=rec.percentComplete==null
?0
:Math.max(0,Math.min(100,rec.percentComplete))/100;
const hasBaseline=rec.baselineStart!=null||rec.baselineEnd!=null;
const bStart=rec.baselineStart!=null?rec.baselineStart:rec.es;
const bEnd=rec.baselineEnd!=null?rec.baselineEnd:rec.ef;
const pv=bac*plannedFraction(status,bStart,bEnd);
const ev=bac*pct;
return{bac,pv,ev,ac,hasBaseline};
}
function metricsOf(a){
const ac=a.ac;
return{
bac:a.bac,
pv:a.pv,
ev:a.ev,
ac,
sv:a.ev-a.pv,
cv:ac==null?null:a.ev-ac,
spi:Math.abs(a.pv)<EPS?null:a.ev/a.pv,
cpi:(ac==null||Math.abs(ac)<EPS)?null:a.ev/ac,
};
}
function computeEarnedValue(tasks,schedule,options={}){
if(!schedule||!schedule.ok||!schedule.tasks||!schedule.order){
return{ok:false,error:{code:'NO_SCHEDULE',message:'earned value needs a successful schedule'}};
}
const costField=options.costField||'cost';
const actualCostField=options.actualCostField||'actualCost';
const status=options.statusDate==null
?schedule.projectFinish
:(toDayNumber(options.statusDate)??schedule.projectFinish);
const rawById=new Map();
for(const t of Array.isArray(tasks)?tasks:[]){
if(t&&t.id!=null)rawById.set(String(t.id),t);
}
const blank=()=>({bac:0,pv:0,ev:0,ac:0,acAny:false,hasBaseline:false});
const acc=new Map();
for(const id of schedule.order)acc.set(id,blank());
const projectAcc=blank();
for(const id of schedule.order){
const rec=schedule.tasks.get(id);
if(!rec||rec.isSummary)continue;
const f=leafFigures(rec,rawById.get(id),status,costField,actualCostField);
let cur=id;
while(cur!=null&&acc.has(cur)){
const a=acc.get(cur);
a.bac+=f.bac;a.pv+=f.pv;a.ev+=f.ev;
if(f.ac!=null){a.ac+=f.ac;a.acAny=true;}
if(f.hasBaseline)a.hasBaseline=true;
cur=schedule.tasks.get(cur).parent;
}
projectAcc.bac+=f.bac;projectAcc.pv+=f.pv;projectAcc.ev+=f.ev;
if(f.ac!=null){projectAcc.ac+=f.ac;projectAcc.acAny=true;}
if(f.hasBaseline)projectAcc.hasBaseline=true;
}
const finalize=(a)=>metricsOf({bac:a.bac,pv:a.pv,ev:a.ev,ac:a.acAny?a.ac:null});
const byTask=new Map();
const rows=[];
for(const id of schedule.order){
const rec=schedule.tasks.get(id);
const a=acc.get(id);
const row={
id:rec.id,
name:rec.name,
isSummary:!!rec.isSummary,
isMilestone:!!rec.isMilestone,
percentComplete:rec.percentComplete??null,
hasBaseline:a.hasBaseline,
hasActualCost:a.acAny,
...finalize(a),
};
byTask.set(id,row);
rows.push(row);
}
return{
ok:true,
statusDate:status,
byTask,
rows,
project:{hasActualCost:projectAcc.acAny,hasBaseline:projectAcc.hasBaseline,...finalize(projectAcc)},
};
}
});
__def("packages/modules/gantt/mspdi.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"parseXml",{enumerable:true,get:function(){return parseXml;}});
Object.defineProperty(__exports,"importMSPDI",{enumerable:true,get:function(){return importMSPDI;}});
Object.defineProperty(__exports,"exportMSPDI",{enumerable:true,get:function(){return exportMSPDI;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/gantt/time.js");
const toDayNumber=__m1["toDayNumber"];
const toISODate=__m1["toISODate"];
const LINK_TYPE_BY_CODE=Object.freeze({0:'FF',1:'FS',2:'SF',3:'SS'});
const CODE_BY_LINK_TYPE=Object.freeze({FF:0,FS:1,SF:2,SS:3});
const CONSTRAINT_BY_CODE=Object.freeze({1:'as-late-as-possible',2:'must-start-on',3:'must-finish-on'});
const CODE_BY_CONSTRAINT=Object.freeze({ALAP:1,MSO:2,MFO:3});
function decodeEntities(text){
return String(text).replace(/&(#x?[0-9a-fA-F]+|lt|gt|amp|quot|apos);/g,(m,e)=>{
if(e[0]==='#'){
const code=(e[1]==='x'||e[1]==='X')?parseInt(e.slice(2),16):parseInt(e.slice(1),10);
return Number.isFinite(code)?String.fromCodePoint(code):m;
}
return{lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"}[e]??m;
});
}
function escapeXml(value){
return String(value==null?'':value)
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function localName(qname){
const i=qname.indexOf(':');
return i<0?qname:qname.slice(i+1);
}
function parseXml(source){
const s=String(source);
let pos=0;
const stack=[];
let root=null;
while(pos<s.length){
const lt=s.indexOf('<',pos);
if(lt<0)break;
if(lt>pos&&stack.length){
const txt=s.slice(pos,lt);
if(txt.trim())stack[stack.length-1].text+=decodeEntities(txt);
}
if(s.startsWith('<?',lt)){const e=s.indexOf('?>',lt);pos=e<0?s.length:e+2;continue;}
if(s.startsWith('<!--',lt)){const e=s.indexOf('-->',lt);pos=e<0?s.length:e+3;continue;}
if(s.startsWith('<![CDATA[',lt)){
const e=s.indexOf(']]>',lt);
if(stack.length)stack[stack.length-1].text+=s.slice(lt+9,e<0?s.length:e);
pos=e<0?s.length:e+3;
continue;
}
if(s.startsWith('<!',lt)){const e=s.indexOf('>',lt);pos=e<0?s.length:e+1;continue;}
const gt=s.indexOf('>',lt);
if(gt<0)break;
let tag=s.slice(lt+1,gt).trim();
if(tag[0]==='/'){stack.pop();pos=gt+1;continue;}
const selfClose=tag.endsWith('/');
if(selfClose)tag=tag.slice(0,-1).trim();
const sp=tag.search(/\s/);
const name=localName(sp<0?tag:tag.slice(0,sp));
const attrs={};
if(sp>=0){
for(const m of tag.slice(sp).matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"|([\w:.-]+)\s*=\s*'([^']*)'/g)){
attrs[localName(m[1]??m[3])]=decodeEntities(m[2]??m[4]??'');
}
}
const node={name,attrs,children:[],text:''};
if(stack.length)stack[stack.length-1].children.push(node);
else if(!root)root=node;
if(!selfClose)stack.push(node);
pos=gt+1;
}
return root;
}
function child(node,name){
return node?node.children.find((c)=>c.name===name):undefined;
}
function childrenOf(node,name){
return node?node.children.filter((c)=>c.name===name):[];
}
function childText(node,name){
const c=child(node,name);
return c?c.text.trim():undefined;
}
function dateToDay(text){
if(!text)return null;
const m=String(text).match(/^\d{4}-\d{2}-\d{2}/);
return m?toDayNumber(m[0]):toDayNumber(text);
}
function dayToDateTime(day,hour){
const iso=toISODate(day);
return`${iso}T${String(hour).padStart(2,'0')}:00:00`;
}
function durationToDays(text,hoursPerDay){
if(!text)return null;
const m=String(text).match(/PT?(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?/);
if(!m)return null;
const hours=(Number(m[1])||0)+(Number(m[2])||0)/60+(Number(m[3])||0)/3600;
return hours/hoursPerDay;
}
function daysToDuration(days,hoursPerDay){
const hours=Math.round((days||0)*hoursPerDay*1000)/1000;
return`PT${hours}H0M0S`;
}
function lagToDays(text,hoursPerDay){
const tenths=Number(text)||0;
return tenths/(10*60*hoursPerDay);
}
function daysToLag(days,hoursPerDay){
return Math.round((days||0)*10*60*hoursPerDay);
}
function importMSPDI(xml,opts={}){
const hoursPerDay=opts.hoursPerDay??8;
const root=parseXml(xml);
if(!root||root.name!=='Project'){
warnOnce('gantt-mspdi-not-project','[lattice] gantt: importMSPDI input is not an MSPDI <Project> document.');
return{ok:false,error:'not an MSPDI <Project> document',tasks:[],dependencies:[],resources:[]};
}
const projectStart=dateToDay(childText(root,'StartDate'));
const resourcesNode=child(root,'Resources');
const resourceName=new Map();
const resources=[];
for(const r of childrenOf(resourcesNode,'Resource')){
const uid=childText(r,'UID');
const name=childText(r,'Name');
if(uid==null)continue;
if(name==null||name==='')continue;
resourceName.set(uid,name);
const maxUnits=childText(r,'MaxUnits');
resources.push({id:name,name,capacity:maxUnits==null?1:Number(maxUnits)});
}
const assignmentsNode=child(root,'Assignments');
const assignsByTask=new Map();
for(const a of childrenOf(assignmentsNode,'Assignment')){
const taskUid=childText(a,'TaskUID');
const resUid=childText(a,'ResourceUID');
const name=resourceName.get(resUid);
if(taskUid==null||name==null)continue;
const units=childText(a,'Units');
if(!assignsByTask.has(taskUid))assignsByTask.set(taskUid,[]);
assignsByTask.get(taskUid).push({resource:name,units:units==null?1:Number(units)});
}
const tasksNode=child(root,'Tasks');
const tasks=[];
const dependencies=[];
const idByUid=new Map();
const parentStack=[];
const linkWork=[];
for(const t of childrenOf(tasksNode,'Task')){
if(childText(t,'IsNull')==='1')continue;
const uid=childText(t,'UID');
if(uid==null)continue;
if(uid==='0')continue;
const id=uid;
idByUid.set(uid,id);
const level=Number(childText(t,'OutlineLevel'))||1;
while(parentStack.length&&parentStack[parentStack.length-1].level>=level)parentStack.pop();
const parent=parentStack.length?parentStack[parentStack.length-1].uid:null;
parentStack.push({uid,level});
const isSummary=childText(t,'Summary')==='1';
const isMilestone=childText(t,'Milestone')==='1';
const task={id,name:childText(t,'Name')??id};
if(parent)task.parent=parent;
if(isMilestone)task.milestone=true;
if(!isSummary&&!isMilestone){
const dur=durationToDays(childText(t,'Duration'),hoursPerDay);
if(dur!=null)task.duration=dur;
}
const start=dateToDay(childText(t,'Start'));
if(!isSummary&&start!=null)task.start=start;
const pc=childText(t,'PercentComplete');
if(pc!=null)task.percentComplete=Number(pc);
const ctype=CONSTRAINT_BY_CODE[Number(childText(t,'ConstraintType'))];
if(ctype){
task.constraint=ctype;
const cdate=dateToDay(childText(t,'ConstraintDate'));
if(cdate!=null)task.constraintDate=cdate;
}
const baseline=child(t,'Baseline');
if(baseline){
const bs=dateToDay(childText(baseline,'Start'));
const bf=dateToDay(childText(baseline,'Finish'));
if(bs!=null)task.baselineStart=bs;
if(bf!=null)task.baselineEnd=bf;
}
const assigns=assignsByTask.get(uid);
if(assigns&&assigns.length)task.assignments=assigns;
tasks.push(task);
for(const link of childrenOf(t,'PredecessorLink'))linkWork.push({raw:link,uid});
}
for(const{raw,uid}of linkWork){
const predUid=childText(raw,'PredecessorUID');
const from=idByUid.get(predUid);
const to=idByUid.get(uid);
if(from==null||to==null)continue;
const type=LINK_TYPE_BY_CODE[Number(childText(raw,'Type')??1)]??'FS';
const lag=lagToDays(childText(raw,'LinkLag'),hoursPerDay);
const dep={from,to,type};
if(lag)dep.lag=lag;
dependencies.push(dep);
}
const calendar=importCalendar(root);
const out={ok:true,tasks,dependencies,resources};
if(projectStart!=null)out.projectStart=projectStart;
if(calendar)out.calendar=calendar;
return out;
}
function importCalendar(root){
const calendarsNode=child(root,'Calendars');
const calendars=childrenOf(calendarsNode,'Calendar');
const baseUid=childText(root,'CalendarUID');
const base=calendars.find((c)=>childText(c,'UID')===baseUid)??calendars[0];
if(!base)return null;
const weekDays=child(base,'WeekDays');
const workdays=[];
let sawWeekDays=false;
for(const wd of childrenOf(weekDays,'WeekDay')){
const dayType=Number(childText(wd,'DayType'));
if(dayType>=1&&dayType<=7){
sawWeekDays=true;
if(childText(wd,'DayWorking')==='1')workdays.push(dayType-1);
}
}
const holidays=[];
const exceptions=child(base,'Exceptions');
for(const ex of childrenOf(exceptions,'Exception')){
if(childText(ex,'DayWorking')==='1')continue;
const period=child(ex,'TimePeriod');
const from=dateToDay(childText(period,'FromDate'));
const to=dateToDay(childText(period,'ToDate'))??from;
if(from==null)continue;
for(let d=from;d<=to;d+=1)holidays.push(d);
}
if(!sawWeekDays&&!holidays.length)return null;
return{workdays:sawWeekDays?workdays:[1,2,3,4,5],holidays};
}
function exportMSPDI(model,opts={}){
const hoursPerDay=opts.hoursPerDay??8;
const tasks=Array.isArray(model.tasks)?model.tasks:[];
const deps=Array.isArray(model.dependencies)?model.dependencies:[];
const resources=Array.isArray(model.resources)?model.resources:[];
const schedule=model.schedule&&model.schedule.ok?model.schedule:null;
const uidOf=new Map();
tasks.forEach((t,i)=>{
const raw=String(t.id);
uidOf.set(raw,/^\d+$/.test(raw)?raw:String(i+1));
});
const childrenById=new Map();
for(const t of tasks){
const p=t.parent!=null?String(t.parent):null;
if(p){if(!childrenById.has(p))childrenById.set(p,[]);childrenById.get(p).push(String(t.id));}
}
const isSummary=(id)=>childrenById.has(id);
const outlineLevel=(id)=>{
let level=1;
let cur=tasks.find((t)=>String(t.id)===id);
while(cur&&cur.parent!=null){level+=1;cur=tasks.find((t)=>String(t.id)===String(cur.parent));}
return level;
};
const linksBySucc=new Map();
for(const d of deps){
const to=String(d.to);
if(!linksBySucc.has(to))linksBySucc.set(to,[]);
linksBySucc.get(to).push(d);
}
const lines=[];
lines.push('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
lines.push('<Project xmlns="http://schemas.microsoft.com/project">');
lines.push(`  <Name>${escapeXml(opts.projectName||'Lattice Gantt export')}</Name>`);
const ps=model.projectStart!=null?toDayNumber(model.projectStart):(schedule?schedule.projectStart:null);
if(ps!=null)lines.push(`  <StartDate>${dayToDateTime(ps,8)}</StartDate>`);
const calendarSpec=normalizeCalendarSpec(model.calendar);
if(calendarSpec)lines.push('  <CalendarUID>1</CalendarUID>');
if(calendarSpec){
lines.push('  <Calendars>');
lines.push('    <Calendar>');
lines.push('      <UID>1</UID>');
lines.push('      <Name>Standard</Name>');
lines.push('      <IsBaseCalendar>1</IsBaseCalendar>');
lines.push('      <WeekDays>');
for(let day=0;day<=6;day+=1){
const working=calendarSpec.workdays.includes(day);
lines.push('        <WeekDay>');
lines.push(`          <DayType>${day+1}</DayType>`);
lines.push(`          <DayWorking>${working?1:0}</DayWorking>`);
lines.push('        </WeekDay>');
}
lines.push('      </WeekDays>');
if(calendarSpec.holidays.length){
lines.push('      <Exceptions>');
for(const h of calendarSpec.holidays){
lines.push('        <Exception>');
lines.push('          <DayWorking>0</DayWorking>');
lines.push(`          <TimePeriod><FromDate>${dayToDateTime(h,0)}</FromDate><ToDate>${dayToDateTime(h,23)}</ToDate></TimePeriod>`);
lines.push('        </Exception>');
}
lines.push('      </Exceptions>');
}
lines.push('    </Calendar>');
lines.push('  </Calendars>');
}
lines.push('  <Tasks>');
for(const t of tasks){
const id=String(t.id);
const uid=uidOf.get(id);
const summary=isSummary(id);
const milestone=!!t.milestone||(!summary&&Number(t.duration)===0);
const rec=schedule?schedule.tasks.get(id):null;
lines.push('    <Task>');
lines.push(`      <UID>${escapeXml(uid)}</UID>`);
lines.push(`      <ID>${escapeXml(uid)}</ID>`);
lines.push(`      <Name>${escapeXml(t.name!=null?t.name:id)}</Name>`);
lines.push(`      <OutlineLevel>${outlineLevel(id)}</OutlineLevel>`);
lines.push(`      <Summary>${summary?1:0}</Summary>`);
lines.push(`      <Milestone>${milestone?1:0}</Milestone>`);
const durDays=rec?rec.duration:(t.duration!=null?Number(t.duration):null);
if(durDays!=null)lines.push(`      <Duration>${daysToDuration(durDays,hoursPerDay)}</Duration>`);
lines.push('      <DurationFormat>7</DurationFormat>');
const startDay=rec?rec.es:(t.start!=null?toDayNumber(t.start):null);
const finishDay=rec?rec.ef:(t.end!=null?toDayNumber(t.end):(startDay!=null&&durDays!=null?startDay+durDays:null));
if(startDay!=null)lines.push(`      <Start>${dayToDateTime(startDay,8)}</Start>`);
if(finishDay!=null)lines.push(`      <Finish>${dayToDateTime(finishDay,17)}</Finish>`);
const pc=rec?rec.percentComplete:t.percentComplete;
if(pc!=null)lines.push(`      <PercentComplete>${Math.round(Number(pc))}</PercentComplete>`);
const ccode=constraintCode(t.constraint??t.constraintType);
if(ccode!=null){
lines.push(`      <ConstraintType>${ccode}</ConstraintType>`);
const cdate=dateOf(t.constraintDate??t.constraintAt??t.at);
if(cdate!=null)lines.push(`      <ConstraintDate>${dayToDateTime(cdate,8)}</ConstraintDate>`);
}
const bs=dateOf(t.baselineStart??(t.baseline&&t.baseline.start));
const bf=dateOf(t.baselineEnd??(t.baseline&&t.baseline.end));
if(bs!=null||bf!=null){
lines.push('      <Baseline>');
lines.push('        <Number>0</Number>');
if(bs!=null)lines.push(`        <Start>${dayToDateTime(bs,8)}</Start>`);
if(bf!=null)lines.push(`        <Finish>${dayToDateTime(bf,17)}</Finish>`);
if(bs!=null&&bf!=null)lines.push(`        <Duration>${daysToDuration(bf-bs,hoursPerDay)}</Duration>`);
lines.push('      </Baseline>');
}
for(const d of linksBySucc.get(id)||[]){
const predUid=uidOf.get(String(d.from));
if(predUid==null)continue;
lines.push('      <PredecessorLink>');
lines.push(`        <PredecessorUID>${escapeXml(predUid)}</PredecessorUID>`);
lines.push(`        <Type>${CODE_BY_LINK_TYPE[(d.type?String(d.type).toUpperCase():'FS')]??1}</Type>`);
if(d.lag){
lines.push(`        <LinkLag>${daysToLag(Number(d.lag),hoursPerDay)}</LinkLag>`);
lines.push('        <LagFormat>7</LagFormat>');
}
lines.push('      </PredecessorLink>');
}
lines.push('    </Task>');
}
lines.push('  </Tasks>');
const resByName=new Map();
resources.forEach((r,i)=>{
const name=String(r.name??r.id??`Resource ${i+1}`);
resByName.set(name,{uid:String(i+1),capacity:r.capacity??r.maxUnits??1});
});
const assignmentRows=[];
for(const t of tasks){
for(const a of readAssignments(t)){
if(!resByName.has(a.resource))resByName.set(a.resource,{uid:String(resByName.size+1),capacity:1});
assignmentRows.push({taskUid:uidOf.get(String(t.id)),resUid:resByName.get(a.resource).uid,units:a.units});
}
}
lines.push('  <Resources>');
for(const[name,r]of resByName){
lines.push('    <Resource>');
lines.push(`      <UID>${escapeXml(r.uid)}</UID>`);
lines.push(`      <ID>${escapeXml(r.uid)}</ID>`);
lines.push(`      <Name>${escapeXml(name)}</Name>`);
lines.push(`      <MaxUnits>${Number(r.capacity)}</MaxUnits>`);
lines.push('    </Resource>');
}
lines.push('  </Resources>');
lines.push('  <Assignments>');
assignmentRows.forEach((a,i)=>{
lines.push('    <Assignment>');
lines.push(`      <UID>${i+1}</UID>`);
lines.push(`      <TaskUID>${escapeXml(a.taskUid)}</TaskUID>`);
lines.push(`      <ResourceUID>${escapeXml(a.resUid)}</ResourceUID>`);
lines.push(`      <Units>${Number(a.units)}</Units>`);
lines.push('    </Assignment>');
});
lines.push('  </Assignments>');
lines.push('</Project>');
return lines.join('\n');
}
function readAssignments(t){
if(t&&Array.isArray(t.assignments)){
return t.assignments
.map((a)=>{
const resource=a&&(a.resource??a.name??a.id);
if(resource==null||resource==='')return null;
const units=Number(a.units??a.allocation??1);
return{resource:String(resource),units:Number.isFinite(units)?units:1};
})
.filter(Boolean);
}
const value=t?(t.assignee??t.assignees??t.owner):null;
const names=Array.isArray(value)?value:(value==null||value===''?[]:[value]);
return names.map((v)=>String(v)).filter((v)=>v!=='').map((name)=>({resource:name,units:1}));
}
function normalizeCalendarSpec(spec){
if(spec==null)return null;
if(spec==='weekends')return{workdays:[1,2,3,4,5],holidays:[]};
const workdays=Array.isArray(spec.workdays)&&spec.workdays.length
?spec.workdays.map(Number).filter((n)=>n>=0&&n<=6)
:[1,2,3,4,5];
const holidays=(Array.isArray(spec.holidays)?spec.holidays:[])
.map((h)=>toDayNumber(h)).filter((d)=>d!=null);
return{workdays,holidays};
}
function constraintCode(constraint){
if(constraint==null||constraint==='')return null;
const code=String(constraint).toLowerCase().replace(/\s+/g,'-');
const map={
mso:'MSO','must-start-on':'MSO',muststarton:'MSO','start-on':'MSO',
mfo:'MFO','must-finish-on':'MFO',mustfinishon:'MFO','finish-on':'MFO',
alap:'ALAP','as-late-as-possible':'ALAP',aslateaspossible:'ALAP',late:'ALAP',
};
const resolved=map[code]??(['MSO','MFO','ALAP'].includes(String(constraint).toUpperCase())?String(constraint).toUpperCase():null);
return resolved?CODE_BY_CONSTRAINT[resolved]:null;
}
function dateOf(value){
if(value==null||value==='')return null;
return toDayNumber(value);
}
});
__def("packages/modules/gantt/workload.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"WORKLOAD_DEFAULTS",{enumerable:true,get:function(){return WORKLOAD_DEFAULTS;}});
Object.defineProperty(__exports,"statedHours",{enumerable:true,get:function(){return statedHours;}});
Object.defineProperty(__exports,"taskContour",{enumerable:true,get:function(){return taskContour;}});
Object.defineProperty(__exports,"contourTotal",{enumerable:true,get:function(){return contourTotal;}});
Object.defineProperty(__exports,"serializeContour",{enumerable:true,get:function(){return serializeContour;}});
Object.defineProperty(__exports,"contourSpan",{enumerable:true,get:function(){return contourSpan;}});
Object.defineProperty(__exports,"spanDuration",{enumerable:true,get:function(){return spanDuration;}});
Object.defineProperty(__exports,"spreadHours",{enumerable:true,get:function(){return spreadHours;}});
Object.defineProperty(__exports,"setContourBucket",{enumerable:true,get:function(){return setContourBucket;}});
Object.defineProperty(__exports,"retimeContour",{enumerable:true,get:function(){return retimeContour;}});
Object.defineProperty(__exports,"recordWorkingDays",{enumerable:true,get:function(){return recordWorkingDays;}});
Object.defineProperty(__exports,"workloadBuckets",{enumerable:true,get:function(){return workloadBuckets;}});
Object.defineProperty(__exports,"computeWorkload",{enumerable:true,get:function(){return computeWorkload;}});
Object.defineProperty(__exports,"formatHours",{enumerable:true,get:function(){return formatHours;}});
const __m0=__req("packages/modules/gantt/resources.js");
const parseAssignments=__m0["parseAssignments"];
const __m1=__req("packages/modules/gantt/schedule.js");
const EPS=__m1["EPS"];
const taskIdReader=__m1["taskIdReader"];
const __m2=__req("packages/modules/gantt/time.js");
const fromDayNumber=__m2["fromDayNumber"];
const toDayNumber=__m2["toDayNumber"];
const toISODate=__m2["toISODate"];
const WORKLOAD_DEFAULTS=Object.freeze({
hoursPerDay:8,
height:160,
rowHeight:28,
decimals:1,
totals:true,
});
function asNumber(value){
if(value==null||value===''||typeof value==='boolean')return null;
const n=typeof value==='number'?value:Number(value);
return Number.isFinite(n)?n:null;
}
function statedHours(raw){
if(!raw)return null;
if(Array.isArray(raw.work))return null;
const work=asNumber(raw.work);
if(work!=null)return work;
return asNumber(raw.hours);
}
function taskContour(raw){
if(!raw||!Array.isArray(raw.work))return null;
const parsed=[];
for(const entry of raw.work){
if(!entry||typeof entry!=='object')continue;
const day=toDayNumber((entry.date));
const hours=asNumber(entry.hours);
if(day==null||hours==null)continue;
parsed.push({day:Math.round(day),hours});
}
parsed.sort((a,b)=>a.day-b.day);
const merged=[];
for(const e of parsed){
const last=merged[merged.length-1];
if(last&&last.day===e.day)last.hours+=e.hours;
else merged.push({day:e.day,hours:e.hours});
}
return merged;
}
function contourTotal(contour){
return(Array.isArray(contour)?contour:[]).reduce((a,e)=>a+(asNumber(e.hours)??0),0);
}
function serializeContour(contour){
const out=[];
for(const e of Array.isArray(contour)?contour:[]){
const hours=asNumber(e.hours);
if(hours==null||!(Math.abs(hours)>EPS))continue;
const date=toISODate(e.day);
if(date==null)continue;
out.push({date,hours:Math.round(hours*1e6)/1e6});
}
return out;
}
function contourSpan(contour){
const live=(Array.isArray(contour)?contour:[]).filter((e)=>Math.abs(asNumber(e.hours)??0)>EPS);
if(!live.length)return null;
return{first:live[0].day,last:live[live.length-1].day};
}
function spanDuration(first,last,isWorking=null){
if(!Number.isFinite(first)||!Number.isFinite(last)||last<first)return 0;
if(typeof isWorking!=='function')return Math.round(last-first)+1;
let n=0;
for(let d=Math.round(first);d<=Math.round(last);d+=1)if(isWorking(d))n+=1;
return n;
}
function spreadHours(days,hours){
if(!Array.isArray(days)||!days.length)return[];
const each=hours/days.length;
return days.map((day)=>({day,hours:each}));
}
function setContourBucket(contour,bucket,days,hours){
const kept=(Array.isArray(contour)?contour:[])
.filter((e)=>!(e.day>=bucket.start&&e.day<bucket.end));
const added=Math.abs(hours)>EPS?spreadHours(days,hours):[];
return[...kept,...added].sort((a,b)=>a.day-b.day);
}
function retimeContour(contour,oldDays,newDays){
const from=Array.isArray(oldDays)?oldDays:[];
const to=Array.isArray(newDays)?newDays:[];
if(!Array.isArray(contour)||!from.length||!to.length)return Array.isArray(contour)?contour:[];
const byDay=new Map(contour.map((e)=>[e.day,asNumber(e.hours)??0]));
const levels=from.map((d)=>byDay.get(d)??0);
const n=levels.length;
const out=[];
for(let j=0;j<to.length;j+=1){
const hours=levels[Math.min(n-1,Math.floor((j*n)/to.length))];
if(Math.abs(hours)>EPS)out.push({day:to[j],hours});
}
return out;
}
function recordWorkingDays(rec,isWorking=null){
const out=[];
if(!rec||!Number.isFinite(rec.es)||!Number.isFinite(rec.ef))return out;
for(let d=Math.floor(rec.es);d<Math.ceil(rec.ef);d+=1){
if(typeof isWorking!=='function'||isWorking(d))out.push(d);
}
return out;
}
function workloadBuckets(level,from,to){
const lo=Math.floor(from);
const hi=Math.ceil(to);
const out=[];
if(!(hi>lo))return out;
if(level==='day'){
for(let d=lo;d<hi;d+=1)out.push({start:d,end:d+1});
return out;
}
if(level==='month'||level==='quarter'){
const first=fromDayNumber(lo);
if(!first)return out;
let cursor=Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),1)/86400000;
while(cursor<hi){
const d=fromDayNumber(cursor);
const next=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)/86400000;
out.push({start:cursor,end:next});
cursor=next;
}
return out;
}
const firstDay=fromDayNumber(lo);
let day=lo-(firstDay?firstDay.getUTCDay():0);
for(;day<hi;day+=7)out.push({start:day,end:day+7});
return out;
}
function computeWorkload(tasks,schedule,options={}){
const buckets=Array.isArray(options.buckets)?options.buckets:[];
const empty={
ok:false,buckets:[],rows:[],totals:buckets.map(()=>null),grandTotal:0,
};
if(!schedule||!schedule.ok)return empty;
const hoursPerDay=asNumber(options.hoursPerDay)??WORKLOAD_DEFAULTS.hoursPerDay;
const isWorking=typeof options.isWorking==='function'?options.isWorking:null;
const capacities=options.capacities instanceof Map?options.capacities:null;
const readId=taskIdReader(options.fields);
const byResource=new Map();
const book=(resource,day,hours,task)=>{
if(!byResource.has(resource))byResource.set(resource,{days:new Map(),tasks:new Map()});
const entry=byResource.get(resource);
entry.days.set(day,(entry.days.get(day)||0)+hours);
if(!entry.tasks.has(task.id))entry.tasks.set(task.id,{...task,days:new Map()});
const sub=entry.tasks.get(task.id);
sub.days.set(day,(sub.days.get(day)||0)+hours);
};
const byId=new Map();
for(const t of Array.isArray(tasks)?tasks:[]){
const k=t?readId(t):null;
if(k!=null)byId.set(String(k),t);
}
const positional=Array.isArray(tasks)&&schedule.order.length===tasks.length;
for(let i=0;i<schedule.order.length;i+=1){
const id=schedule.order[i];
const rec=schedule.tasks.get(id);
if(!rec||rec.isSummary)continue;
const raw=byId.get(id)||(positional?tasks[i]:null);
if(!raw)continue;
const days=recordWorkingDays(rec,isWorking);
const contour=taskContour(raw);
if(!contour&&!days.length)continue;
const assigns=parseAssignments(raw);
const list=assigns.length?assigns:[{resource:null,units:1}];
const sumUnits=list.reduce((a,x)=>a+(asNumber(x.units)??0),0);
if(!(sumUnits>0))continue;
let perDay;
if(contour){
perDay=contour.filter((e)=>Math.abs(e.hours)>EPS);
}else{
const stated=statedHours(raw);
const totalHours=stated!=null?stated:days.length*hoursPerDay*sumUnits;
if(!(Math.abs(totalHours)>EPS))continue;
perDay=spreadHours(days,totalHours);
}
if(!perDay.length)continue;
for(const a of list){
const units=asNumber(a.units)??0;
const fraction=units/sumUnits;
if(!(Math.abs(fraction)>0))continue;
const task={id,name:rec.name,units,unitsTotal:sumUnits,raw};
for(const e of perDay)book(a.resource,e.day,e.hours*fraction,task);
}
}
const bucketOf=(day)=>{
let lo=0;
let hi=buckets.length-1;
while(lo<=hi){
const mid=(lo+hi)>>1;
if(day<buckets[mid].start)hi=mid-1;
else if(day>=buckets[mid].end)lo=mid+1;
else return mid;
}
return-1;
};
const sized=buckets.map((b)=>{
let workingDays=0;
for(let d=Math.floor(b.start);d<Math.ceil(b.end);d+=1){
if(!isWorking||isWorking(d))workingDays+=1;
}
return{start:b.start,end:b.end,workingDays};
});
const bucketise=(days)=>{
const raw=sized.map(()=>0);
for(const[day,hours]of days){
const i=bucketOf(day);
if(i>=0)raw[i]+=hours;
}
return raw;
};
const names=[...byResource.keys()].filter((n)=>n!=null).sort();
const order=byResource.has(null)?[...names,null]:names;
const rows=[];
const totals=sized.map(()=>0);
let grandTotal=0;
for(const resource of order){
const entry=byResource.get(resource);
const raw=bucketise(entry.days);
const capacity=(resource!=null&&capacities&&capacities.has(resource))
?capacities.get(resource):null;
const cells=raw.map((v)=>(Math.abs(v)>EPS?v:null));
const over=raw.map((v,i)=>{
if(capacity==null)return false;
const limit=capacity*hoursPerDay*sized[i].workingDays;
return v>limit+EPS;
});
let total=0;
raw.forEach((v,i)=>{total+=v;totals[i]+=v;});
grandTotal+=total;
const subRows=[...entry.tasks.values()].map((sub)=>{
const subRaw=bucketise(sub.days);
return{
id:sub.id,
name:sub.name,
units:sub.units,
unitsTotal:sub.unitsTotal,
raw:sub.raw,
cells:subRaw.map((v)=>(Math.abs(v)>EPS?v:null)),
total:subRaw.reduce((a,v)=>a+v,0),
};
});
rows.push({resource,capacity,cells,over,total,tasks:subRows});
}
return{
ok:true,
buckets:sized,
rows,
totals:totals.map((v)=>(Math.abs(v)>EPS?v:null)),
grandTotal,
};
}
function formatHours(hours,decimals){
if(hours==null||!Number.isFinite(hours))return'';
const places=Number.isFinite(decimals)?Math.max(0,Math.min(6,Math.round(decimals))):1;
const factor=10**places;
const rounded=Math.round(hours*factor)/factor;
if(Object.is(rounded,-0)||rounded===0)return'0';
return String(rounded);
}
});
__def("packages/modules/shared/autosize.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"contentWidth",{enumerable:true,get:function(){return contentWidth;}});
Object.defineProperty(__exports,"contentHeight",{enumerable:true,get:function(){return contentHeight;}});
Object.defineProperty(__exports,"firstMeasured",{enumerable:true,get:function(){return firstMeasured;}});
Object.defineProperty(__exports,"watchSize",{enumerable:true,get:function(){return watchSize;}});
Object.defineProperty(__exports,"watchBox",{enumerable:true,get:function(){return watchBox;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
function contentWidth(el){
if(!el||typeof el!=='object')return null;
const client=Number(el.clientWidth);
if(Number.isFinite(client)&&client>0)return client;
if(typeof el.getBoundingClientRect==='function'){
const box=el.getBoundingClientRect();
const w=box&&Number(box.width);
if(Number.isFinite(w)&&w>0)return w;
}
return null;
}
function contentHeight(el){
if(!el||typeof el!=='object')return null;
const client=Number(el.clientHeight);
if(Number.isFinite(client)&&client>0)return client;
if(typeof el.getBoundingClientRect==='function'){
const box=el.getBoundingClientRect();
const h=box&&Number(box.height);
if(Number.isFinite(h)&&h>0)return h;
}
return null;
}
function firstMeasured(candidates,read=contentWidth){
for(const el of candidates||[]){
const value=read(el);
if(Number.isFinite(value)&&value>0)return value;
}
return null;
}
function watchSize(spec){
const targets=(spec&&Array.isArray(spec.targets)?spec.targets:[]).filter(Boolean);
const read=spec&&typeof spec.read==='function'?spec.read:()=>null;
const apply=spec&&typeof spec.apply==='function'?spec.apply:()=>{};
const epsilon=Number.isFinite(spec&&spec.epsilon)?Number(spec.epsilon):1;
let applied=null;
let inApply=false;
const refresh=()=>{
if(inApply)return false;
const value=read();
if(!Number.isFinite(value)||value<=0)return false;
if(applied!=null&&Math.abs(value-applied)<epsilon)return false;
applied=value;
inApply=true;
try{apply(value);}finally{inApply=false;}
return true;
};
refresh();
const first=targets[0];
const view=(spec&&spec.view)
||(first&&first.ownerDocument&&first.ownerDocument.defaultView)
||globalThis;
const Observer=view&&view.ResizeObserver;
let observer=null;
if(typeof Observer==='function'&&targets.length){
observer=new Observer(()=>{refresh();});
for(const target of targets){
if(target&&typeof observer.observe==='function')observer.observe(target);
}
}else if(targets.length){
warnOnce(
'shared.autosize.no-resize-observer',
'ResizeObserver is unavailable; this view was sized once at mount and will not follow its container.',
);
}
return{
refresh,
get applied(){return applied;},
release(){
if(observer&&typeof observer.disconnect==='function'){
try{observer.disconnect();}catch{}
}
observer=null;
},
};
}
function watchBox(spec){
const targets=(spec&&Array.isArray(spec.targets)?spec.targets:[]).filter(Boolean);
const read=spec&&typeof spec.read==='function'?spec.read:()=>({});
const apply=spec&&typeof spec.apply==='function'?spec.apply:()=>{};
const epsilon=Number.isFinite(spec&&spec.epsilon)?Number(spec.epsilon):1;
let applied=null;
let inApply=false;
const changed=(box)=>{
if(applied==null)return true;
for(const[key,value]of Object.entries(box)){
if(!Number.isFinite(value)||(value)<=0)continue;
const was=applied[key];
if(!Number.isFinite(was))return true;
if(Math.abs((value)-(was))>=epsilon)return true;
}
return false;
};
const refresh=()=>{
if(inApply)return false;
const box=read();
if(!box||typeof box!=='object')return false;
const usable=Object.values(box).some((v)=>Number.isFinite(v)&&(v)>0);
if(!usable)return false;
if(!changed(box))return false;
applied={...applied,...box};
inApply=true;
try{apply(box);}finally{inApply=false;}
return true;
};
refresh();
const first=targets[0];
const view=(spec&&spec.view)
||(first&&first.ownerDocument&&first.ownerDocument.defaultView)
||globalThis;
const Observer=view&&view.ResizeObserver;
let observer=null;
if(typeof Observer==='function'&&targets.length){
observer=new Observer(()=>{refresh();});
for(const target of targets){
if(target&&typeof observer.observe==='function')observer.observe(target);
}
}else if(targets.length){
warnOnce(
'shared.autosize.no-resize-observer',
'ResizeObserver is unavailable; this view was sized once at mount and will not follow its container.',
);
}
return{
refresh,
get applied(){return applied;},
release(){
if(observer&&typeof observer.disconnect==='function'){
try{observer.disconnect();}catch{}
}
observer=null;
},
};
}
});
__def("packages/modules/shared/axislabels.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"CHAR_RATIO",{enumerable:true,get:function(){return CHAR_RATIO;}});
Object.defineProperty(__exports,"BOLD_FACTOR",{enumerable:true,get:function(){return BOLD_FACTOR;}});
Object.defineProperty(__exports,"MIN_GAP",{enumerable:true,get:function(){return MIN_GAP;}});
Object.defineProperty(__exports,"estimateLabelWidth",{enumerable:true,get:function(){return estimateLabelWidth;}});
Object.defineProperty(__exports,"thinLabels",{enumerable:true,get:function(){return thinLabels;}});
const CHAR_RATIO=0.62;
const BOLD_FACTOR=1.05;
const MIN_GAP=6;
function estimateLabelWidth(text,fontSize,bold=false){
const value=String(text===null||text===undefined?'':text);
return value.length*fontSize*CHAR_RATIO*(bold?BOLD_FACTOR:1);
}
function thinLabels(labels,opts){
const gap=Number.isFinite(opts.gap)?Number(opts.gap):MIN_GAP;
const fontSize=Number.isFinite(opts.fontSize)?Number(opts.fontSize):11;
const measure=typeof opts.measure==='function'
?opts.measure
:(text)=>estimateLabelWidth(text,fontSize,!!opts.bold);
const sized=labels
.filter((label)=>label&&Number.isFinite(label.at))
.map((label)=>({...label,width:measure(String(label.text??''))}))
.sort((a,b)=>a.at-b.at);
if(sized.length<2)return{every:1,kept:sized};
const fits=(every)=>{
let previous=null;
for(let i=0;i<sized.length;i+=every){
const label=sized[i];
if(previous&&label.at-previous.at<previous.width+gap)return false;
previous=label;
}
return true;
};
let every=1;
while(every<sized.length&&!fits(every))every++;
const kept=[];
for(let i=0;i<sized.length;i+=every)kept.push(sized[i]);
return{every,kept};
}
});
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
const YEAR=365.25*DAY;
const YEAR_COUNTS=[1,2,5,10,20,25,50,100];
const TIME_STEPS=[
1,5,10,25,50,100,250,500,
1000,5000,15000,30000,
MINUTE,5*MINUTE,15*MINUTE,30*MINUTE,
HOUR,3*HOUR,6*HOUR,12*HOUR,
DAY,2*DAY,7*DAY,14*DAY,
30*DAY,90*DAY,180*DAY,
...YEAR_COUNTS.map((years)=>years*YEAR),
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
const wanted=Math.max(1,count);
const target=span/wanted;
let picked=TIME_STEPS[TIME_STEPS.length-1];
for(const candidate of TIME_STEPS){
if(candidate>=target){picked=candidate;break;}
}
if(picked<YEAR)return picked;
let best=picked;
let bestDiff=Math.abs(span/picked-wanted);
for(const candidate of TIME_STEPS){
if(candidate<YEAR)continue;
const diff=Math.abs(span/candidate-wanted);
if(diff<bestDiff){bestDiff=diff;best=candidate;}
}
return best;
}
function calendarYearTicks(domain,years){
const minYear=new Date(domain.min).getUTCFullYear();
let year=Math.ceil(minYear/years)*years;
if(Date.UTC(year,0,1)<domain.min)year+=years;
const out=[];
for(;Date.UTC(year,0,1)<=domain.max;year+=years){
out.push(Date.UTC(year,0,1));
}
return out;
}
function timeTicks(domain,count=5){
const step=timeStepFor(domain.max-domain.min,count);
if(step>=YEAR)return calendarYearTicks(domain,Math.round(step/YEAR));
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
__def("packages/modules/gantt/links.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"LINK_SIDES",{enumerable:true,get:function(){return LINK_SIDES;}});
Object.defineProperty(__exports,"linkSides",{enumerable:true,get:function(){return linkSides;}});
Object.defineProperty(__exports,"routeLink",{enumerable:true,get:function(){return routeLink;}});
Object.defineProperty(__exports,"arrowheadPath",{enumerable:true,get:function(){return arrowheadPath;}});
const __m0=__req("packages/modules/charts/svg.js");
const path=__m0["path"];
const round=__m0["round"];
const LINK_SIDES=Object.freeze({
FS:Object.freeze({depart:1,arrive:-1}),
SS:Object.freeze({depart:-1,arrive:-1}),
FF:Object.freeze({depart:1,arrive:1}),
SF:Object.freeze({depart:-1,arrive:1}),
});
function linkSides(type){
return LINK_SIDES[String(type||'FS').toUpperCase()]||LINK_SIDES.FS;
}
function routeLink(spec){
const sx=Number(spec.sx);
const sy=Number(spec.sy);
const ex=Number(spec.ex);
const ey=Number(spec.ey);
const elbow=Number.isFinite(spec.elbow)&&spec.elbow>0?Number(spec.elbow):8;
const rowGap=Number.isFinite(spec.rowGap)&&spec.rowGap>0?Number(spec.rowGap):elbow;
const sides=linkSides(spec.type);
const arrowDir=-sides.arrive;
const sameRow=Math.abs(ey-sy)<0.5;
const reach=(ex-sx)*arrowDir;
if(sameRow&&reach>0){
return{d:path(['M',round(sx),round(sy),'H',round(ex)]),arrowDir,route:'straight'};
}
if(reach>=0){
return{
d:path(['M',round(sx),round(sy),'V',round(ey),'H',round(ex)]),
arrowDir,
route:'drop',
};
}
const lane=sameRow?sy+rowGap:(sy+ey)/2;
const out=sx+sides.depart*elbow;
const approach=ex+sides.arrive*elbow;
return{
d:path(['M',round(sx),round(sy),
'H',round(out),
'V',round(lane),
'H',round(approach),
'V',round(ey),
'H',round(ex)]),
arrowDir,
route:'detour',
};
}
function arrowheadPath(ex,ey,dir,h=4){
return path(['M',round(ex),round(ey),
'L',round(ex-dir*h),round(ey-h),
'L',round(ex-dir*h),round(ey+h),'Z']);
}
});
__def("packages/modules/gantt/messages.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"FALLBACK_EN",{enumerable:true,get:function(){return FALLBACK_EN;}});
Object.defineProperty(__exports,"createTranslator",{enumerable:true,get:function(){return createTranslator;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const FALLBACK_EN=Object.freeze({
'gantt.lag':'+{days}d',
'gantt.lead':'{days}d',
'gantt.a11y.moved':'{name} moved to {date}',
'gantt.a11y.day':'day {day}',
'gantt.a11y.resized':'{name} resized to {days} days',
'gantt.a11y.linkFrom':'Linking from {name}. Focus the successor and press L.',
'gantt.a11y.linked':'Linked {from} to {to}, finish to start.',
'gantt.a11y.linkCancelled':'Link cancelled.',
'gantt.a11y.deleted':'{name} deleted.',
'gantt.workload.title':'Resource workload',
'gantt.workload.resource':'Resource',
'gantt.workload.total':'Total',
'gantt.workload.unassigned':'Unassigned',
'gantt.workload.cell':'{hours} h from {date}',
'gantt.workload.over':'{hours} h from {date}, over a capacity of {capacity} h',
'gantt.workload.expand':'Show {name}’s tasks',
'gantt.workload.collapse':'Hide {name}’s tasks',
'gantt.a11y.hoursSet':'{name}: {hours} h from {date}',
'gantt.a11y.hoursCleared':'{name}: no hours from {date}',
'gantt.a11y.hoursRefused':'{date} is not a working day; {name} was not changed.',
});
function createTranslator(controller,messagesOf){
return function t(key,params){
const supplied=isFunction(messagesOf)?messagesOf():null;
const grid=controller&&controller.grid;
const host=(supplied&&isFunction(supplied.t)&&supplied)
||(grid&&grid.messages&&isFunction(grid.messages.t)&&grid.messages)
||null;
if(host){
let text;
try{text=host.t(key,params);}catch{text=null;}
if(typeof text==='string'&&text&&text!==key)return text;
}
const template=FALLBACK_EN[key];
if(!template)return key;
return template.replace(/\{(\w+)\}/g,(m,name)=>(params&&name in params?String(params[name]):m));
};
}
});
__def("packages/modules/gantt/gestures.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"describeTask",{enumerable:true,get:function(){return describeTask;}});
Object.defineProperty(__exports,"GanttGestures",{enumerable:true,get:function(){return GanttGestures;}});
const __m0=__req("packages/modules/charts/svg.js");
const round=__m0["round"];
function describeTask(rec,fmt){
const kind=rec.isSummary?'summary':(rec.isMilestone?'milestone':'task');
const dates=fmt.dateAxis===false
?`day ${round(rec.es)} to ${round(rec.ef)}`
:`${fmt.iso(rec.es)} to ${fmt.iso(rec.ef)}`;
const parts=[`${rec.name}, ${kind}`,dates];
if(!rec.isMilestone)parts.push(`${round(rec.duration)} days`);
if(rec.percentComplete!=null)parts.push(`${Math.round(rec.percentComplete)}% complete`);
parts.push(`slack ${round(rec.totalFloat)} days`);
if(rec.critical)parts.push('on the critical path');
return parts.join(', ');
}
class GanttGestures{
#host;
#drag=null;
#dragHandlers=null;
#linkFrom=null;
constructor(host){
this.#host=host;
}
#opts(){return this.#host.options()||{};}
get dragging(){return this.#drag!==null;}
#matrix(){
const plot=this.#host.plot();
if(plot&&typeof plot.getScreenCTM==='function'){
let m=null;
try{m=plot.getScreenCTM();}catch{m=null;}
if(m&&Number.isFinite(m.a)&&m.a>0)return{scale:m.a,origin:Number.isFinite(m.e)?m.e:0};
}
const box=plot&&plot.getBoundingClientRect?plot.getBoundingClientRect():null;
return{scale:1,origin:box?(box.left||0):0};
}
#svgX(event){
const{scale,origin}=this.#matrix();
return((event.clientX||0)-origin)/scale;
}
#days(clientDelta){
const{scale}=this.#matrix();
return Math.round((clientDelta/scale)/(this.#host.pxPerDay()||1));
}
onPointerDown(event){
const schedule=this.#host.controller.schedule;
if(!schedule||!schedule.ok)return;
const row=this.#host.rowOf(event.target);
if(!row)return;
const id=row.getAttribute('data-task');
const rec=schedule.tasks.get(id);
if(!rec||rec.isSummary)return;
const barEl=this.#host.barOf(row);
if(!barEl)return;
const px=this.#svgX(event);
const zone=Number.isFinite(this.#opts().resizeZone)?Number(this.#opts().resizeZone):6;
const mode=(!rec.isMilestone&&px>=this.#barRight(barEl)-zone)?'resize':'move';
this.#drag={id,mode,startX:event.clientX||0,origStart:rec.es,origDuration:rec.duration,barEl};
if(event.preventDefault)event.preventDefault();
const move=(e)=>this.#onPointerMove(e);
const up=(e)=>this.#onPointerUp(e);
this.#dragHandlers={move,up};
this.#host.doc.addEventListener('pointermove',move);
this.#host.doc.addEventListener('pointerup',up);
}
#barRight(barEl){
const x=parseFloat(barEl.getAttribute('x'));
const w=parseFloat(barEl.getAttribute('width'));
if(Number.isFinite(x)&&Number.isFinite(w))return x+w;
return Number.POSITIVE_INFINITY;
}
#onPointerMove(event){
if(!this.#drag)return;
const pxPerDay=this.#host.pxPerDay()||1;
const deltaDays=this.#days((event.clientX||0)-this.#drag.startX);
const bar=this.#drag.barEl;
if(this.#drag.mode==='move'){
if(bar.getAttribute('d')){
this.#shiftPath(bar,deltaDays*pxPerDay);
}else{
bar.setAttribute('x',round(parseFloat(bar.getAttribute('x'))+deltaDays*pxPerDay-this.#previewShift(bar)));
this.#setPreviewShift(bar,deltaDays*pxPerDay);
}
}else{
const w=Math.max(1,parseFloat(bar.getAttribute('width'))+(deltaDays*pxPerDay-this.#previewShift(bar)));
bar.setAttribute('width',round(w));
this.#setPreviewShift(bar,deltaDays*pxPerDay);
}
}
#previewShift(bar){return parseFloat(bar.getAttribute('data-preview')||'0');}
#setPreviewShift(bar,px){bar.setAttribute('data-preview',String(px));}
#shiftPath(bar,px){
const prev=this.#previewShift(bar);
const d=bar.getAttribute('d').split(' ');
for(let i=1;i<d.length;i+=1){
const n=parseFloat(d[i]);
if(!Number.isNaN(n)&&(i%3===1))d[i]=String(round(n+(px-prev)));
}
bar.setAttribute('d',d.join(' '));
this.#setPreviewShift(bar,px);
}
#onPointerUp(event){
const drag=this.#drag;
this.#releaseDragHandlers();
this.#drag=null;
if(!drag)return;
const deltaDays=this.#days((event.clientX||0)-drag.startX);
if(deltaDays===0){this.#host.redraw();return;}
if(drag.mode==='move'){
this.#host.controller.applyEdit({id:drag.id,start:drag.origStart+deltaDays},{writeBack:true});
}else{
this.#host.controller.applyEdit({id:drag.id,duration:Math.max(0,drag.origDuration+deltaDays)},{writeBack:true});
}
this.#host.redraw();
}
#releaseDragHandlers(){
if(!this.#dragHandlers)return;
this.#host.doc.removeEventListener('pointermove',this.#dragHandlers.move);
this.#host.doc.removeEventListener('pointerup',this.#dragHandlers.up);
this.#dragHandlers=null;
}
onKey(event){
const controller=this.#host.controller;
const schedule=controller.schedule;
if(!schedule||!schedule.ok)return;
const row=this.#host.rowOf(event.target);
const id=row?row.getAttribute('data-task'):null;
const rec=id?schedule.tasks.get(id):null;
if(!rec)return;
const o=this.#opts();
const step=Number.isFinite(o.moveStep)?Number(o.moveStep):1;
const key=event.key;
const t=this.#host.t;
if(key==='ArrowRight'||key==='ArrowLeft'){
if(rec.isSummary)return;
const dir=key==='ArrowRight'?1:-1;
this.#host.focusTask(id);
if(event.shiftKey){
if(rec.isMilestone)return;
const nd=Math.max(0,rec.duration+dir*step);
controller.applyEdit({id,duration:nd},{writeBack:true});
this.#host.announce(t('gantt.a11y.resized',{name:rec.name,days:nd}));
}else{
const ns=rec.es+dir*step;
const date=o.dateAxis===false?t('gantt.a11y.day',{day:ns}):this.#host.iso(ns);
controller.applyEdit({id,start:ns},{writeBack:true});
this.#host.announce(t('gantt.a11y.moved',{name:rec.name,date}));
}
if(event.preventDefault)event.preventDefault();
}else if(key==='l'||key==='L'){
if(rec.isSummary)return;
if(!this.#linkFrom){
this.#linkFrom=id;
this.#host.announce(t('gantt.a11y.linkFrom',{name:rec.name}));
}else if(this.#linkFrom!==id){
const from=this.#linkFrom;
this.#linkFrom=null;
this.#host.focusTask(id);
controller.setDependencies([...controller.dependencies,{from,to:id,type:'FS'}]);
this.#host.announce(t('gantt.a11y.linked',{from,to:rec.name}));
}
if(event.preventDefault)event.preventDefault();
}else if(key==='Delete'||key==='Backspace'){
if(rec.isSummary)return;
controller.deleteTask(id);
this.#host.announce(t('gantt.a11y.deleted',{name:rec.name}));
if(event.preventDefault)event.preventDefault();
}else if(key==='Escape'&&this.#linkFrom){
this.#linkFrom=null;
this.#host.announce(t('gantt.a11y.linkCancelled'));
}
}
destroy(){
this.#releaseDragHandlers();
this.#drag=null;
this.#linkFrom=null;
}
}
});
__def("packages/modules/gantt/render.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"NS",{enumerable:true,get:function(){return NS;}});
Object.defineProperty(__exports,"GanttView",{enumerable:true,get:function(){return GanttView;}});
Object.defineProperty(__exports,"mountGantt",{enumerable:true,get:function(){return mountGantt;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/shared/autosize.js");
const contentWidth=__m1["contentWidth"];
const firstMeasured=__m1["firstMeasured"];
const watchSize=__m1["watchSize"];
const __m2=__req("packages/modules/shared/axislabels.js");
const thinLabels=__m2["thinLabels"];
const __m3=__req("packages/modules/charts/svg.js");
const svg=__m3["svg"];
const el=__m3["el"];
const setText=__m3["setText"];
const path=__m3["path"];
const round=__m3["round"];
const __m4=__req("packages/modules/charts/scale.js");
const linearScale=__m4["linearScale"];
const __m5=__req("packages/modules/gantt/time.js");
const toISODate=__m5["toISODate"];
const fromDayNumber=__m5["fromDayNumber"];
const toDayNumber=__m5["toDayNumber"];
const resolveProjectEpoch=__m5["resolveProjectEpoch"];
const __m6=__req("packages/modules/gantt/links.js");
const routeLink=__m6["routeLink"];
const arrowheadPath=__m6["arrowheadPath"];
const __m7=__req("packages/modules/gantt/schedule.js");
const EPS=__m7["EPS"];
const __m8=__req("packages/modules/gantt/messages.js");
const createTranslator=__m8["createTranslator"];
const __m9=__req("packages/modules/gantt/gestures.js");
const GanttGestures=__m9["GanttGestures"];
const describeTask=__m9["describeTask"];
Object.defineProperty(__exports,"FALLBACK_EN",{enumerable:true,get:function(){return __m8["FALLBACK_EN"];}});
const NS='lat-gantt';
const STAMP='data-lat-gantt-styles';
const FALLBACK_WIDTH=720;
const DEFAULTS=Object.freeze({
messages:null,
width:'container',
rowHeight:26,
barPadding:4,
labelWidth:160,
axisHeight:22,
rightPadding:16,
rowLabels:true,
showArrows:true,
showCritical:true,
showProgress:true,
hoverChain:true,
dateAxis:true,
label:'name',
today:null,
nonWorking:null,
editable:true,
resizeZone:6,
zoom:null,
projectEpoch:null,
scrollToToday:false,
tooltip:true,
groupBy:null,
keyboard:true,
moveStep:1,
});
const AXIS_FONT_SIZE=11;
const ZOOM=Object.freeze({
day:{px:28,step:1,level:'day'},
week:{px:12,step:7,level:'week'},
month:{px:4,step:30,level:'month'},
quarter:{px:1.6,step:91,level:'quarter'},
});
function css(){
return`
.${NS}{font:12px/1.4 system-ui,sans-serif;color:#1f2933;overflow:auto}
.${NS}__plot{max-width:100%;height:auto;display:block}
.${NS}__shade{fill:#f1f3f5}
.${NS}__gridline{stroke:#e6e8eb;stroke-width:1}
.${NS}__tick{fill:#6b7280;font-size:11px}
.${NS}__lane-band{fill:#eef1f4}
.${NS}__lane-label{fill:#374151;font-size:12px;font-weight:600}
.${NS}__rowlabel{fill:#1f2933;font-size:12px}
.${NS}__rowlabel--summary{font-weight:600}
.${NS}__bar{fill:#4a90d9;rx:3}
.${NS}__bar--critical{fill:#e2513b}
.${NS}__bar--violation{stroke:#d97706;stroke-width:2}
.${NS}__bar--overdue{stroke:#b91c1c;stroke-width:2;stroke-dasharray:3 2}
.${NS}__bar--atrisk{stroke:#f59e0b;stroke-width:2}
.${NS}__summary{fill:#2c3e50}
.${NS}__milestone{fill:#33404d}
.${NS}__milestone--critical{fill:#e2513b}
.${NS}__progress{fill:rgba(0,0,0,0.28)}
.${NS}__label{fill:#374151;font-size:11px;dominant-baseline:middle}
.${NS}__link{fill:none;stroke:#9aa5b1;stroke-width:1.5}
.${NS}__link--critical{stroke:#e2513b}
.${NS}__link--chain{stroke:#2563eb;stroke-width:2.5}
.${NS}__arrowhead{fill:#9aa5b1}
.${NS}__arrowhead--critical{fill:#e2513b}
.${NS}__arrowhead--chain{fill:#2563eb}
.${NS}__bar--chain{stroke:#2563eb;stroke-width:2}
.${NS}__milestone--chain{stroke:#2563eb;stroke-width:2}
.${NS}__summary--chain{stroke:#2563eb;stroke-width:2}
.${NS}__lag{fill:#6b7280;font-size:10px}
.${NS}__today{stroke:#e2513b;stroke-width:1.5;stroke-dasharray:4 3}
.${NS}__tooltip{position:absolute;pointer-events:none;background:#1f2933;color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;white-space:nowrap;z-index:5}
.${NS}__tooltip[hidden]{display:none}
.${NS}__live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.${NS}__row:focus{outline:2px solid #2563eb;outline-offset:1px}
`.trim();
}
function injectStyles(doc){
const root=doc.documentElement;
if(!root||root.getAttribute(STAMP))return;
root.setAttribute(STAMP,'1');
const style=doc.createElement('style');
style.textContent=css();
(doc.head||doc.body||root).appendChild(style);
}
function nonWorkingPredicate(spec,shift=0){
if(spec==='weekends'){
return(day)=>{
const d=fromDayNumber(day+shift);
const wd=d?d.getUTCDay():0;
return wd===0||wd===6;
};
}
return typeof spec==='function'?spec:null;
}
function xmlEscape(s){
return String(s==null?'':s)
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/"/g,'&quot;');
}
function attrPairs(node){
const a=node.attributes;
if(!a)return[];
if(a instanceof Map)return[...a.entries()];
const out=[];
for(let i=0;i<a.length;i+=1)out.push([a[i].name,a[i].value]);
return out;
}
function serialize(node){
const tag=node.tagName?node.tagName.toLowerCase():null;
if(!tag)return'';
const attrs=attrPairs(node).map(([k,v])=>` ${k}="${xmlEscape(v)}"`).join('');
const kids=node.children||[];
if(kids.length){
return`<${tag}${attrs}>${[...kids].map(serialize).join('')}</${tag}>`;
}
const text=node.textContent?xmlEscape(node.textContent):'';
return text?`<${tag}${attrs}>${text}</${tag}>`:`<${tag}${attrs}></${tag}>`;
}
class GanttView{
#controller;
#container;
#doc;
#opts;
#root=null;
#svg=null;
#tip=null;
#live=null;
#focusId=null;
#scrollUnlink=null;
#off=null;
#destroyed=false;
#pxPerDay=1;
#tickStep=null;
#zoomLevel=null;
#todayX=null;
#gestures;
#t;
#epochShift=0;
#today=null;
#drawWidth=FALLBACK_WIDTH;
#sizeWatch=null;
#tickBudget=8;
constructor(controller,container,opts={}){
this.#controller=controller;
this.#container=container;
this.#doc=container.ownerDocument;
this.#opts={...DEFAULTS,...opts};
this.#epochShift=resolveProjectEpoch(this.#opts.projectEpoch);
this.#today=this.#resolveToday(this.#opts.today);
this.#warnZoomWidth(opts);
this.#drawWidth=Number.isFinite(this.#opts.width)?Number(this.#opts.width):FALLBACK_WIDTH;
injectStyles(this.#doc);
this.#root=el(this.#doc,'div',NS);
this.#container.appendChild(this.#root);
if(this.#opts.tooltip){
this.#tip=el(this.#doc,'div',`${NS}__tooltip`);
this.#tip.setAttribute('hidden','');
this.#root.appendChild(this.#tip);
}
this.#live=el(this.#doc,'div',`${NS}__live`);
this.#live.setAttribute('role','status');
this.#live.setAttribute('aria-live','polite');
this.#root.appendChild(this.#live);
this.#t=createTranslator(controller,()=>this.#opts.messages);
this.#gestures=new GanttGestures({
doc:this.#doc,
controller,
options:()=>this.#opts,
plot:()=>this.#svg,
rowOf:(target)=>(target&&target.closest?target.closest(`.${NS}__row`):null),
barOf:(row)=>row.querySelector(`.${NS}__bar`)||row.querySelector(`.${NS}__milestone`),
pxPerDay:()=>this.#pxPerDay,
announce:(message)=>this.#announce(message),
t:(key,params)=>this.#t(key,params),
iso:(day)=>this.#iso(day),
redraw:()=>this.draw(),
focusTask:(id)=>{this.#focusId=id;},
});
this.#followContainer();
this.#off=controller.on('schedule',()=>this.draw());
this.draw();
}
#followContainer(){
if(this.#opts.width!=='container')return;
if(this.#zoom(this.#opts.zoom))return;
this.#sizeWatch=watchSize({
targets:[this.#root,this.#container],
read:()=>firstMeasured([this.#root,this.#container],contentWidth),
apply:(value)=>{
this.#drawWidth=value;
if(this.#svg)this.draw();
},
});
}
#warnZoomWidth(raw){
if(!raw||!Number.isFinite(raw.width))return;
if(!this.#zoom(this.#opts.zoom))return;
warnOnce(
`gantt.zoomWidth:${String(this.#opts.zoom)}`,
`[lattice] gantt: mount was given both zoom (${JSON.stringify(this.#opts.zoom)}) and width (${raw.width}); zoom fixes the pixels-per-day, so the width is ignored and the plot scrolls. Drop one of the two.`,
);
}
#resolveToday(spec){
if(spec==null||spec==='')return null;
if(Number.isFinite(spec))return Number(spec);
const day=toDayNumber(spec);
if(Number.isFinite(day))return(day)-this.#epochShift;
warnOnce(
`gantt.today:${String(spec)}`,
`[lattice] gantt: today ${JSON.stringify(spec)} is not a date or a day number; no today line is drawn.`,
);
return null;
}
#calendarDay(day){return day+this.#epochShift;}
#iso(day){return toISODate(this.#calendarDay(day));}
get element(){return this.#root;}
get options(){return{...this.#opts};}
draw(){
if(this.#destroyed)return;
const schedule=this.#controller.schedule;
if(!schedule||!schedule.ok)return;
const o=this.#opts;
const order=schedule.order;
const plotLeft=o.rowLabels?o.labelWidth:0;
const layout=this.#layout(schedule);
const height=o.axisHeight+layout.count*o.rowHeight;
const lo=schedule.projectStart;
const hi=schedule.projectFinish;
const today=this.#today;
const bounds=[lo,hi];
if(Number.isFinite(today))bounds.push(today);
const min=Math.min(...bounds);
const max=Math.max(...bounds);
const pad=Math.max(1,(max-min)*0.04);
const domainMin=min-pad;
const domainMax=max+pad;
const zoomPreset=this.#zoom(o.zoom);
const fitWidth=this.#drawWidth;
const plotWidth=zoomPreset
?Math.max(1,(domainMax-domainMin)*zoomPreset.px)
:Math.max(1,fitWidth-plotLeft-o.rightPadding);
const totalWidth=zoomPreset?plotLeft+plotWidth+o.rightPadding:fitWidth;
const scale=linearScale({min:domainMin,max:domainMax},[0,plotWidth]);
this.#pxPerDay=scale.of(1)-scale.of(0);
this.#tickStep=zoomPreset?zoomPreset.step:null;
this.#tickBudget=this.#opts.width==='container'
?Math.max(2,Math.min(8,Math.floor(plotWidth/(this.#opts.dateAxis?78:44))))
:8;
this.#zoomLevel=zoomPreset?zoomPreset.level:null;
this.#todayX=Number.isFinite(today)?round(plotLeft+scale.of(today)):null;
const x=(day)=>round(plotLeft+scale.of(day));
const plot=svg(this.#doc,'svg',{
class:`${NS}__plot`,
width:totalWidth,
height,
viewBox:`0 0 ${totalWidth} ${height}`,
preserveAspectRatio:'xMinYMin meet',
role:'img',
'aria-label':'Gantt chart',
});
const rowIndex=layout.rowIndexById;
const depth=this.#depths(schedule);
const violations=new Set(this.#controller.findViolations().map((v)=>v.id));
this.#drawShading(plot,scale,x,min,max,plotLeft,o.axisHeight,height);
this.#drawAxis(plot,scale,x,height);
this.#drawRows(plot,schedule,layout,depth,x,violations);
if(o.showArrows)this.#drawLinks(plot,schedule,rowIndex,x);
if(Number.isFinite(today))this.#drawToday(plot,x,today,o.axisHeight,height);
if(o.editable)plot.addEventListener('pointerdown',(e)=>this.#gestures.onPointerDown(e));
if(o.tooltip){
plot.addEventListener('pointermove',(e)=>this.#onHover(e));
plot.addEventListener('pointerleave',()=>this.#hideTip());
}
if(o.keyboard)plot.addEventListener('keydown',(e)=>this.#gestures.onKey(e));
if(o.showArrows&&o.hoverChain){
plot.addEventListener('pointerover',(e)=>this.#onChainHover(e));
plot.addEventListener('pointerleave',()=>this.#clearHighlight());
}
if(this.#svg)this.#root.removeChild(this.#svg);
this.#root.appendChild(plot);
this.#svg=plot;
if(o.scrollToToday)this.scrollToToday();
if(this.#focusId){
const row=plot.querySelector(`.${NS}__row[data-task="${this.#focusId}"]`);
if(row&&row.focus)row.focus();
}
}
#zoom(zoom){
if(Number.isFinite(zoom))return{px:Number(zoom),step:1,level:'custom'};
return typeof zoom==='string'&&ZOOM[zoom]?ZOOM[zoom]:null;
}
linkVerticalScroll(other){
if(this.#scrollUnlink){this.#scrollUnlink();this.#scrollUnlink=null;}
if(!other||!this.#root||!other.addEventListener)return()=>{};
const a=this.#root;
const b=other;
let lock=false;
const mirror=(from,to)=>{if(lock)return;lock=true;to.scrollTop=from.scrollTop;lock=false;};
const onA=()=>mirror(a,b);
const onB=()=>mirror(b,a);
a.addEventListener('scroll',onA);
b.addEventListener('scroll',onB);
const off=()=>{a.removeEventListener('scroll',onA);b.removeEventListener('scroll',onB);};
this.#scrollUnlink=off;
return off;
}
scrollToToday(){
if(this.#todayX==null||!this.#root)return;
const left=this.#opts.rowLabels?this.#opts.labelWidth:0;
this.#root.scrollLeft=Math.max(0,this.#todayX-left-40);
}
#layout(schedule){
const order=schedule.order;
const rowIndexById=new Map();
if(!this.#opts.groupBy){
const rows=order.map((id)=>({kind:'task',id}));
order.forEach((id,i)=>rowIndexById.set(id,i));
return{rows,rowIndexById,count:rows.length};
}
const raw=new Map(this.#controller.tasks.map((t)=>[String(t.id),t]));
const spec=this.#opts.groupBy;
const groupOf=(id)=>{
const t=raw.get(id)||{};
const v=typeof spec==='function'?spec(t):t[spec];
return v==null||v===''?'Ungrouped':String(v);
};
const groups=new Map();
for(const id of order){
const key=groupOf(id);
if(!groups.has(key))groups.set(key,[]);
groups.get(key).push(id);
}
const rows=[];
for(const[key,ids]of groups){
rows.push({kind:'header',key});
for(const id of ids)rows.push({kind:'task',id});
}
rows.forEach((r,i)=>{if(r.kind==='task')rowIndexById.set(r.id,i);});
return{rows,rowIndexById,count:rows.length};
}
#depths(schedule){
const out=new Map();
for(const id of schedule.order){
let d=0;
let cur=schedule.tasks.get(id).parent;
while(cur!=null&&schedule.tasks.has(cur)){d+=1;cur=schedule.tasks.get(cur).parent;}
out.set(id,d);
}
return out;
}
#drawShading(plot,scale,x,min,max,plotLeft,top,height){
const pred=nonWorkingPredicate(this.#opts.nonWorking,this.#epochShift);
if(!pred)return;
const from=Math.floor(min);
const to=Math.ceil(max);
if(to-from>3660)return;
const g=svg(this.#doc,'g',{class:`${NS}__shading`});
for(let day=from;day<to;day+=1){
if(!pred(day))continue;
const x0=Math.max(plotLeft,x(day));
const x1=x(day+1);
g.appendChild(svg(this.#doc,'rect',{
class:`${NS}__shade`,'data-day':String(day),x:x0,y:top,width:round(Math.max(0,x1-x0)),height:height-top,
}));
}
plot.appendChild(g);
}
#drawAxis(plot,scale,x,height){
const g=svg(this.#doc,'g',{class:`${NS}__axis`});
const top=this.#opts.axisHeight;
const ticks=this.#axisTicks(scale);
for(const tick of ticks){
const px=x(tick);
g.appendChild(svg(this.#doc,'line',{
class:`${NS}__gridline`,x1:px,y1:top,x2:px,y2:height,
}));
}
const labels=ticks.map((tick)=>({at:x(tick),text:this.#tickLabel(tick)}));
const{kept}=this.#tickStep
?thinLabels(labels,{fontSize:AXIS_FONT_SIZE})
:{kept:labels};
for(const label of kept){
const text=svg(this.#doc,'text',{class:`${NS}__tick`,x:label.at+2,y:top-6});
setText(text,label.text);
g.appendChild(text);
}
plot.appendChild(g);
}
#axisTicks(scale){
if(!this.#tickStep)return scale.ticks(this.#tickBudget);
const{min,max}=scale.domain;
const step=this.#tickStep;
const out=[];
for(let t=Math.ceil(min/step)*step;t<=max;t+=step)out.push(t);
return out.length?out:scale.ticks(this.#tickBudget);
}
#tickLabel(tick){
if(!this.#opts.dateAxis)return String(round(tick));
const iso=this.#iso(Math.round(tick));
if(!iso)return String(round(tick));
return(this.#zoomLevel==='month'||this.#zoomLevel==='quarter')?iso.slice(0,7):iso;
}
#drawRows(plot,schedule,layout,depth,x,violations){
const o=this.#opts;
const rows=svg(this.#doc,'g',{class:`${NS}__rows`});
layout.rows.forEach((entry,i)=>{
const rowY=o.axisHeight+i*o.rowHeight;
if(entry.kind==='header'){
this.#drawLaneHeader(rows,entry.key,rowY,o.rowHeight);
return;
}
const id=entry.id;
const rec=schedule.tasks.get(id);
const barY=rowY+o.barPadding;
const barH=o.rowHeight-2*o.barPadding;
const midY=rowY+o.rowHeight/2;
const crit=o.showCritical&&rec.critical;
const violated=violations.has(id);
const incomplete=rec.percentComplete==null||rec.percentComplete<100;
const overdue=Number.isFinite(this.#today)&&incomplete&&!rec.isSummary&&rec.ef<this.#today;
const atRisk=rec.totalFloat<-EPS;
const g=svg(this.#doc,'g',{class:`${NS}__row`});
g.setAttribute('data-task',id);
g.setAttribute('tabindex',o.keyboard?'0':'-1');
g.setAttribute('role',rec.isSummary?'group':'button');
g.setAttribute('aria-label',describeTask(rec,{dateAxis:o.dateAxis,iso:(d)=>this.#iso(d)}));
if(crit)g.setAttribute('data-critical','true');
if(violated)g.setAttribute('data-violation','true');
if(overdue)g.setAttribute('data-overdue','true');
if(atRisk)g.setAttribute('data-atrisk','true');
if(o.rowLabels){
const label=svg(this.#doc,'text',{
class:`${NS}__rowlabel${rec.isSummary?` ${NS}__rowlabel--summary`:''}`,
x:6+(depth.get(id)||0)*12,
y:midY,
'dominant-baseline':'middle',
});
setText(label,rec.name);
g.appendChild(label);
}
if(rec.isMilestone){
this.#drawMilestone(g,x(rec.es),midY,barH/2,crit);
}else{
const x0=x(rec.es);
const w=Math.max(1,x(rec.ef)-x0);
const cls=rec.isSummary
?`${NS}__summary`
:`${NS}__bar${crit?` ${NS}__bar--critical`:''}${violated?` ${NS}__bar--violation`:''}`
+`${overdue?` ${NS}__bar--overdue`:''}${atRisk?` ${NS}__bar--atrisk`:''}`;
g.appendChild(svg(this.#doc,'rect',{
class:cls,x:x0,y:barY,width:round(w),height:barH,rx:3,
}));
if(o.showProgress&&rec.percentComplete!=null&&rec.percentComplete>0){
g.appendChild(svg(this.#doc,'rect',{
class:`${NS}__progress`,x:x0,y:barY,width:round(w*Math.min(1,rec.percentComplete/100)),height:barH,rx:3,
}));
}
const text=this.#labelText(rec);
if(text){
const t=svg(this.#doc,'text',{class:`${NS}__label`,x:round(x0+w+4),y:midY});
setText(t,text);
g.appendChild(t);
}
}
rows.appendChild(g);
});
plot.appendChild(rows);
}
#drawLaneHeader(rows,key,rowY,rowHeight){
const g=svg(this.#doc,'g',{class:`${NS}__lane`});
g.setAttribute('data-group',key);
g.appendChild(svg(this.#doc,'rect',{
class:`${NS}__lane-band`,x:0,y:rowY,width:'100%',height:rowHeight,
}));
const label=svg(this.#doc,'text',{
class:`${NS}__lane-label`,x:6,y:rowY+rowHeight/2,'dominant-baseline':'middle',
});
setText(label,key);
g.appendChild(label);
rows.appendChild(g);
}
#labelText(rec){
const spec=this.#opts.label;
if(typeof spec==='function')return String(spec(rec)??'');
switch(spec){
case'none':return'';
case'percent':return rec.percentComplete==null?'':`${Math.round(rec.percentComplete)}%`;
case'dates':return this.#opts.dateAxis
?`${this.#iso(rec.es)} – ${this.#iso(rec.ef)}`
:`${round(rec.es)} – ${round(rec.ef)}`;
case'name':default:return rec.name;
}
}
#drawMilestone(g,cx,cy,r,critical){
const d=path(['M',round(cx-r),round(cy),'L',round(cx),round(cy-r),
'L',round(cx+r),round(cy),'L',round(cx),round(cy+r),'Z']);
g.appendChild(svg(this.#doc,'path',{
class:`${NS}__milestone${critical?` ${NS}__milestone--critical`:''}`,d,
}));
}
#drawLinks(plot,schedule,rowIndex,x){
const o=this.#opts;
const g=svg(this.#doc,'g',{class:`${NS}__links`});
for(const dep of this.#controller.dependencies){
const from=String(dep.from);
const to=String(dep.to);
const p=schedule.tasks.get(from);
const s=schedule.tasks.get(to);
if(!p||!s||!rowIndex.has(from)||!rowIndex.has(to))continue;
const type=(dep.type?String(dep.type).toUpperCase():'FS');
const startDay=(type==='FS'||type==='FF')?p.ef:p.es;
const endDay=(type==='FF'||type==='SF')?s.ef:s.es;
const sx=x(startDay);
const sy=o.axisHeight+rowIndex.get(from)*o.rowHeight+o.rowHeight/2;
const ex=x(endDay);
const ey=o.axisHeight+rowIndex.get(to)*o.rowHeight+o.rowHeight/2;
const critical=o.showCritical&&p.critical&&s.critical;
const elbow=Math.max(8,o.rowHeight/2);
const route=routeLink({sx,sy,ex,ey,type,elbow,rowGap:o.rowHeight/2});
const line=svg(this.#doc,'path',{class:`${NS}__link${critical?` ${NS}__link--critical`:''}`,d:route.d});
line.setAttribute('data-from',from);
line.setAttribute('data-to',to);
line.setAttribute('data-type',type);
line.setAttribute('data-route',route.route);
if(critical)line.setAttribute('data-critical','true');
g.appendChild(line);
g.appendChild(this.#arrowhead(ex,ey,route.arrowDir,critical));
if(dep.lag){
const label=svg(this.#doc,'text',{
class:`${NS}__lag`,x:round((sx+ex)/2),y:round((sy+ey)/2)-2,
});
setText(label,this.#t(dep.lag>0?'gantt.lag':'gantt.lead',{days:dep.lag}));
g.appendChild(label);
}
}
plot.appendChild(g);
}
#arrowhead(ex,ey,dir,critical){
return svg(this.#doc,'path',{
class:`${NS}__arrowhead${critical?` ${NS}__arrowhead--critical`:''}`,
d:arrowheadPath(ex,ey,dir),
});
}
#drawToday(plot,x,today,top,height){
const px=x(today);
plot.appendChild(svg(this.#doc,'line',{
class:`${NS}__today`,x1:px,y1:top,x2:px,y2:height,'data-today':String(today),
}));
}
#onHover(event){
if(this.#gestures.dragging||!this.#tip)return;
const schedule=this.#controller.schedule;
if(!schedule||!schedule.ok){this.#hideTip();return;}
const target=event.target;
const row=target&&target.closest?target.closest(`.${NS}__row`):null;
const id=row?row.getAttribute('data-task'):null;
const rec=id?schedule.tasks.get(id):null;
if(!rec){this.#hideTip();return;}
setText(this.#tip,this.#tipText(rec));
this.#tip.removeAttribute('hidden');
this.#tip.setAttribute('data-task',id);
}
#tipText(rec){
const dates=this.#opts.dateAxis
?`${this.#iso(rec.es)} to ${this.#iso(rec.ef)}`
:`${round(rec.es)} to ${round(rec.ef)}`;
const parts=[rec.name,dates,`${round(rec.duration)}d`];
if(rec.percentComplete!=null)parts.push(`${Math.round(rec.percentComplete)}%`);
parts.push(`slack ${round(rec.totalFloat)}d`);
return parts.join(' · ');
}
#hideTip(){if(this.#tip)this.#tip.setAttribute('hidden','');}
#chainOf(id){
const preds=new Map();
const succs=new Map();
for(const dep of this.#controller.dependencies){
const from=String(dep.from);
const to=String(dep.to);
(succs.get(from)||succs.set(from,[]).get(from)).push(to);
(preds.get(to)||preds.set(to,[]).get(to)).push(from);
}
const chain=new Set([id]);
const walk=(adj,start)=>{
const stack=[start];
while(stack.length){
const cur=stack.pop();
for(const next of adj.get(cur)||[]){
if(!chain.has(next)){chain.add(next);stack.push(next);}
}
}
};
walk(preds,id);
walk(succs,id);
return chain;
}
#highlightChain(id){
if(!this.#svg)return;
this.#clearHighlight();
const chain=this.#chainOf(id);
for(const link of this.#svg.querySelectorAll(`.${NS}__link`)){
const f=link.getAttribute('data-from');
const t=link.getAttribute('data-to');
if(chain.has(f)&&chain.has(t))link.classList.add(`${NS}__link--chain`);
}
for(const cid of chain){
const row=this.#svg.querySelector(`.${NS}__row[data-task="${cid}"]`);
if(!row)continue;
const bar=row.querySelector(`.${NS}__bar`)||row.querySelector(`.${NS}__milestone`)||row.querySelector(`.${NS}__summary`);
if(!bar)continue;
const kind=bar.getAttribute('class')||'';
if(kind.includes(`${NS}__milestone`))bar.classList.add(`${NS}__milestone--chain`);
else if(kind.includes(`${NS}__summary`))bar.classList.add(`${NS}__summary--chain`);
else bar.classList.add(`${NS}__bar--chain`);
}
}
#clearHighlight(){
if(!this.#svg)return;
for(const cls of['__link--chain','__bar--chain','__milestone--chain','__summary--chain']){
for(const elm of this.#svg.querySelectorAll(`.${NS}${cls}`))elm.classList.remove(`${NS}${cls}`);
}
}
#onChainHover(event){
if(this.#gestures.dragging)return;
const target=event.target;
const row=target&&target.closest?target.closest(`.${NS}__row`):null;
const id=row?row.getAttribute('data-task'):null;
if(id)this.#highlightChain(id);
else this.#clearHighlight();
}
#announce(message){if(this.#live)setText(this.#live,message);}
toSVG(){
return this.#svg?serialize(this.#svg):'';
}
destroy(){
if(this.#destroyed)return;
this.#destroyed=true;
this.#gestures.destroy();
if(this.#sizeWatch){this.#sizeWatch.release();this.#sizeWatch=null;}
if(this.#scrollUnlink){this.#scrollUnlink();this.#scrollUnlink=null;}
if(this.#off)this.#off();
if(this.#root&&this.#root.parentNode)this.#root.parentNode.removeChild(this.#root);
this.#root=null;
this.#svg=null;
}
}
function mountGantt(controller,container,opts={}){
return new GanttView(controller,container,opts);
}
});
__def("packages/modules/gantt/split.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"SPLIT_NS",{enumerable:true,get:function(){return SPLIT_NS;}});
Object.defineProperty(__exports,"GanttSplitView",{enumerable:true,get:function(){return GanttSplitView;}});
Object.defineProperty(__exports,"mountGanttSplit",{enumerable:true,get:function(){return mountGanttSplit;}});
const __m0=__req("packages/modules/shared/axislabels.js");
const thinLabels=__m0["thinLabels"];
const __m1=__req("packages/modules/charts/svg.js");
const svg=__m1["svg"];
const el=__m1["el"];
const setText=__m1["setText"];
const path=__m1["path"];
const round=__m1["round"];
const __m2=__req("packages/modules/charts/scale.js");
const linearScale=__m2["linearScale"];
const __m3=__req("packages/modules/gantt/time.js");
const fromDayNumber=__m3["fromDayNumber"];
const toISODate=__m3["toISODate"];
const toDayNumber=__m3["toDayNumber"];
const __m4=__req("packages/modules/gantt/calendar.js");
const createCalendar=__m4["createCalendar"];
const __m5=__req("packages/modules/gantt/links.js");
const routeLink=__m5["routeLink"];
const arrowheadPath=__m5["arrowheadPath"];
const __m6=__req("packages/modules/gantt/messages.js");
const createTranslator=__m6["createTranslator"];
const __m7=__req("packages/modules/gantt/gestures.js");
const GanttGestures=__m7["GanttGestures"];
const describeTask=__m7["describeTask"];
const __m8=__req("packages/modules/gantt/workload.js");
const WORKLOAD_DEFAULTS=__m8["WORKLOAD_DEFAULTS"];
const computeWorkload=__m8["computeWorkload"];
const workloadBuckets=__m8["workloadBuckets"];
const formatHours=__m8["formatHours"];
const statedHours=__m8["statedHours"];
const taskContour=__m8["taskContour"];
const setContourBucket=__m8["setContourBucket"];
const serializeContour=__m8["serializeContour"];
const spreadHours=__m8["spreadHours"];
const recordWorkingDays=__m8["recordWorkingDays"];
const SPLIT_NS='lat-gantt-split';
const SPLIT_STAMP='data-lat-gantt-split-styles';
const SPLIT_DEFAULTS=Object.freeze({
height:420,
rowHeight:34,
headerHeight:44,
gridWidth:620,
indent:16,
zoom:'day',
today:null,
nonWorking:null,
calendar:null,
showArrows:true,
showProgress:true,
showBaseline:true,
barLabel:'name',
columns:null,
hoverChain:true,
editable:true,
keyboard:true,
resizeZone:6,
workload:null,
});
const BAND_FONT_SIZE=11;
const SPLIT_ZOOM=Object.freeze({
day:{px:26,step:1,level:'day'},
week:{px:12,step:7,level:'week'},
month:{px:4,step:30,level:'month'},
quarter:{px:1.8,step:91,level:'quarter'},
});
const DAY_LETTERS=['S','M','T','W','T','F','S'];
const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SCHEDULE_KINDS=new Set(['start','end','duration']);
const AVATAR_COLORS=['#4a90d9','#e2513b','#2c9c6a','#8b5cf6','#d97706','#0891b2','#be185d'];
function splitCss(){
const n=SPLIT_NS;
return`
.${n}{font:13px/1.4 system-ui,sans-serif;color:#1f2933;display:flex;flex-direction:column;border:1px solid #d7dbe0;border-radius:6px;overflow:hidden;box-sizing:border-box}
.${n} *{box-sizing:border-box}
.${n}__head{display:flex;flex:0 0 auto;overflow:hidden;background:#f6f8fa;border-bottom:1px solid #d0d7de}
.${n}__body{display:flex;flex:1 1 auto;overflow-y:auto;overflow-x:hidden}
.${n}__grid-head,.${n}__grid-body{flex:0 0 auto}
.${n}__grid-head{display:flex;align-items:stretch}
.${n}__colhead{display:flex;align-items:center;padding:0 8px;font-weight:600;color:#57606a;border-right:1px solid #eaeef2;overflow:hidden;white-space:nowrap}
.${n}__divider{flex:0 0 1px;width:1px;background:#c4ccd4;align-self:stretch}
.${n}__time-head,.${n}__time-body{flex:1 1 auto;overflow:hidden;position:relative}
.${n}__time-body{overflow-x:auto;overflow-y:hidden}
.${n}__row{display:flex;align-items:center;border-bottom:1px solid #eef1f4;overflow:hidden}
.${n}__row--summary{background:#f3f6f9}
.${n}__cell{display:flex;align-items:center;padding:0 8px;height:100%;overflow:hidden;border-right:1px solid #f0f2f4}
.${n}__cell--name{gap:2px}
.${n}__name-text{overflow:hidden;text-overflow:ellipsis}
.${n}__name-text--summary{font-weight:600}
.${n}__chevron{flex:0 0 auto;width:16px;height:16px;line-height:16px;text-align:center;cursor:pointer;color:#57606a;border:0;background:none;padding:0;font-size:11px}
.${n}__chevron[aria-hidden="true"]{visibility:hidden}
.${n}__avatars{display:flex}
.${n}__avatar{width:22px;height:22px;border-radius:50%;color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;margin-left:-6px;border:1.5px solid #fff}
.${n}__avatar:first-child{margin-left:0}
.${n}__avatar--overalloc{border-color:#e2513b;box-shadow:0 0 0 1.5px #e2513b}
.${n}__ring{flex:0 0 auto}
.${n}__plot{display:block}
.${n}__shade{fill:#f1f3f5}
.${n}__rowsep{stroke:#eef1f4;stroke-width:1}
.${n}__bar{fill:#4a90d9}
.${n}__bar--critical{fill:#e2513b}
.${n}__bar--overalloc{stroke:#e2513b;stroke-width:2;stroke-dasharray:3 2}
.${n}__progress{fill:rgba(0,0,0,0.26)}
.${n}__summary-bar{fill:#33404d}
.${n}__milestone{fill:#33404d}
.${n}__baseline{fill:#b9c2cc;opacity:0.7}
.${n}__barlabel{fill:#3d4650;font-size:11px;dominant-baseline:middle}
.${n}__startlabel{fill:#57606a;font-size:10px;dominant-baseline:middle}
.${n}__link{fill:none;stroke:#8a94a0;stroke-width:1.5}
.${n}__link--critical{stroke:#e2513b}
.${n}__link--chain{stroke:#2563eb;stroke-width:2.5}
.${n}__arrowhead{fill:#8a94a0}
.${n}__arrowhead--critical{fill:#e2513b}
.${n}__arrowhead--chain{fill:#2563eb}
.${n}__bar--chain{stroke:#2563eb;stroke-width:2}
.${n}__milestone--chain{stroke:#2563eb;stroke-width:2}
.${n}__summary-bar--chain{stroke:#2563eb;stroke-width:2}
.${n}__row--chain{background:#eaf1fb}
.${n}__cell--editable{cursor:text}
.${n}__editor{width:100%;height:22px;box-sizing:border-box;border:1px solid #2563eb;border-radius:3px;padding:0 4px;font:inherit;color:inherit}
.${n}__live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.${n}__barrow:focus{outline:2px solid #2563eb;outline-offset:1px}
.${n}__today{stroke:#e2513b;stroke-width:1.5;stroke-dasharray:4 3}
.${n}__band{fill:#57606a;font-size:11px;font-weight:600}
.${n}__bandsep{stroke:#d0d7de;stroke-width:1}
.${n}__dayletter{fill:#8a94a0;font-size:10px;text-anchor:middle}
.${n}__dayletter--nonwork{fill:#c4ccd4}
.${n}__wl{display:flex;flex-direction:column;flex:0 0 auto;border-top:2px solid #c4ccd4;background:#fbfcfd}
.${n}__wl-head{display:flex;flex:0 0 auto;background:#f6f8fa;border-bottom:1px solid #d0d7de}
.${n}__wl-body{display:flex;flex:1 1 auto;overflow-y:auto;overflow-x:hidden}
.${n}__wl-grid{flex:0 0 auto}
.${n}__wl-time{flex:1 1 auto;overflow-x:auto;overflow-y:hidden}
.${n}__wl-head-spacer{flex:1 1 auto;overflow:hidden}
.${n}__wl-plot{position:relative;overflow:hidden}
.${n}__wl-row{display:flex;align-items:center;border-bottom:1px solid #eef1f4}
.${n}__wl-timerow{position:relative;border-bottom:1px solid #eef1f4}
.${n}__wl-cell{display:flex;align-items:center;padding:0 8px;height:100%;overflow:hidden;white-space:nowrap;border-right:1px solid #f0f2f4}
.${n}__wl-cell--name{overflow:hidden;text-overflow:ellipsis}
.${n}__wl-cell--total{justify-content:flex-end;font-variant-numeric:tabular-nums}
.${n}__wl-bucket{position:absolute;top:0;bottom:0;display:flex;align-items:center;justify-content:center;padding:0;font-variant-numeric:tabular-nums;border-right:1px solid #f0f2f4;font-size:11px;color:#3d4650}
.${n}__wl-bucket--over{background:#fdecea;color:#a4291b;font-weight:600}
.${n}__wl-row--total,.${n}__wl-timerow--total{background:#f1f4f7;font-weight:600}
.${n}__wl-toggle{flex:0 0 auto;width:14px;height:14px;line-height:14px;text-align:center;cursor:pointer;color:#57606a;border:0;background:none;padding:0;font-size:9px}
.${n}__wl-toggle::before{content:"\\25B8"}
.${n}__wl-toggle[aria-expanded="true"]::before{content:"\\25BE"}
.${n}__wl-name-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${n}__wl-row--task .${n}__wl-cell--name{padding-left:28px;color:#57606a}
.${n}__wl-row--task,.${n}__wl-timerow--task{background:#fff}
.${n}__wl-bucket--editable{cursor:text}
.${n}__wl-editor{width:100%;height:20px;box-sizing:border-box;border:1px solid #2563eb;border-radius:3px;padding:0 2px;font:inherit;color:inherit;text-align:center}
`.trim();
}
function injectSplitStyles(doc){
const root=doc.documentElement;
if(!root||root.getAttribute(SPLIT_STAMP))return;
root.setAttribute(SPLIT_STAMP,'1');
const style=doc.createElement('style');
style.textContent=splitCss();
(doc.head||doc.body||root).appendChild(style);
}
function initials(name){
const parts=String(name).trim().split(/\s+/).filter(Boolean);
if(!parts.length)return'?';
if(parts.length===1)return parts[0].slice(0,2).toUpperCase();
return(parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}
function avatarColor(name){
let h=0;
for(let i=0;i<name.length;i+=1)h=(h*31+name.charCodeAt(i))>>>0;
return AVATAR_COLORS[h%AVATAR_COLORS.length];
}
function defaultColumns(){
return[
{key:'name',title:'Task name',width:0,kind:'name'},
{key:'start',title:'Start',width:96,kind:'start'},
{key:'end',title:'Finish',width:96,kind:'end'},
{key:'duration',title:'Duration',width:84,kind:'duration'},
{key:'assignee',title:'Assignee',width:96,kind:'assignee'},
{key:'progress',title:'%',width:56,kind:'progress'},
];
}
class GanttSplitView{
#controller;
#container;
#doc;
#opts;
#columns;
#root=null;
#gridHead=null;
#gridBody=null;
#timeHead=null;
#timeBody=null;
#collapsed=new Set();
#geometry=[];
#overResources=new Set();
#overTasks=new Set();
#evm=null;
#off=null;
#onHScroll=null;
#onRowHover=null;
#onRowOut=null;
#onCellEdit=null;
#onBarPointerDown=null;
#onBarKey=null;
#gestures=null;
#t=null;
#live=null;
#focusId=null;
#pxPerDay=1;
#editing=false;
#destroyed=false;
#workload=null;
#wlRoot=null;
#wlHead=null;
#wlGrid=null;
#wlTime=null;
#onWlScroll=null;
#onWlCellEdit=null;
#wlExpanded=new Set();
#wlLast=null;
#syncing=false;
constructor(controller,container,opts={}){
this.#controller=controller;
this.#container=container;
this.#doc=container.ownerDocument;
this.#opts={...SPLIT_DEFAULTS,...opts};
this.#columns=Array.isArray(opts.columns)&&opts.columns.length?opts.columns:defaultColumns();
injectSplitStyles(this.#doc);
this.#t=createTranslator(controller,()=>this.#opts.messages);
this.#root=el(this.#doc,'div',SPLIT_NS);
this.#root.setAttribute('role','table');
if(Number.isFinite(this.#opts.height))this.#root.style.height=`${this.#opts.height}px`;
const head=el(this.#doc,'div',`${SPLIT_NS}__head`);
this.#gridHead=el(this.#doc,'div',`${SPLIT_NS}__grid-head`);
this.#gridHead.style.width=`${this.#gridWidth()}px`;
this.#timeHead=el(this.#doc,'div',`${SPLIT_NS}__time-head`);
head.appendChild(this.#gridHead);
head.appendChild(el(this.#doc,'div',`${SPLIT_NS}__divider`));
head.appendChild(this.#timeHead);
const body=el(this.#doc,'div',`${SPLIT_NS}__body`);
this.#gridBody=el(this.#doc,'div',`${SPLIT_NS}__grid-body`);
this.#gridBody.style.width=`${this.#gridWidth()}px`;
this.#timeBody=el(this.#doc,'div',`${SPLIT_NS}__time-body`);
body.appendChild(this.#gridBody);
body.appendChild(el(this.#doc,'div',`${SPLIT_NS}__divider`));
body.appendChild(this.#timeBody);
this.#root.appendChild(head);
this.#root.appendChild(body);
this.#workload=this.#resolveWorkload();
if(this.#workload)this.#buildWorkload();
this.#container.appendChild(this.#root);
this.#onHScroll=()=>this.#syncHScroll(this.#timeBody);
this.#timeBody.addEventListener('scroll',this.#onHScroll);
if(this.#opts.hoverChain){
this.#onRowHover=(e)=>this.#onChainHover(e);
this.#onRowOut=()=>this.#clearHighlight();
this.#gridBody.addEventListener('pointerover',this.#onRowHover);
this.#gridBody.addEventListener('pointerleave',this.#onRowOut);
this.#timeBody.addEventListener('pointerover',this.#onRowHover);
this.#timeBody.addEventListener('pointerleave',this.#onRowOut);
}
if(this.#opts.editable){
this.#onCellEdit=(e)=>this.#onCellDblClick(e);
this.#gridBody.addEventListener('dblclick',this.#onCellEdit);
}
this.#live=el(this.#doc,'div',`${SPLIT_NS}__live`);
this.#live.setAttribute('role','status');
this.#live.setAttribute('aria-live','polite');
this.#root.appendChild(this.#live);
this.#gestures=new GanttGestures({
doc:this.#doc,
controller,
options:()=>this.#opts,
plot:()=>(this.#timeBody?this.#timeBody.querySelector(`.${SPLIT_NS}__plot`):null),
rowOf:(target)=>(target&&target.closest?target.closest(`.${SPLIT_NS}__barrow`):null),
barOf:(row)=>row.querySelector(`.${SPLIT_NS}__bar`)||row.querySelector(`.${SPLIT_NS}__milestone`),
pxPerDay:()=>this.#pxPerDay,
announce:(message)=>this.#announce(message),
t:(key,params)=>this.#t(key,params),
iso:(day)=>toISODate(day),
redraw:()=>this.draw(),
focusTask:(id)=>{this.#focusId=id;},
});
if(this.#opts.editable){
this.#onBarPointerDown=(e)=>this.#gestures.onPointerDown(e);
this.#timeBody.addEventListener('pointerdown',this.#onBarPointerDown);
}
if(this.#opts.keyboard){
this.#onBarKey=(e)=>this.#gestures.onKey(e);
this.#timeBody.addEventListener('keydown',this.#onBarKey);
}
this.#off=controller.on('schedule',()=>this.draw());
this.draw();
}
get element(){return this.#root;}
get options(){return{...this.#opts};}
get scroller(){return this.#root?this.#root.querySelector(`.${SPLIT_NS}__body`):null;}
#gridWidth(){return Math.max(80,Number(this.#opts.gridWidth)||620);}
rowGeometry(){return this.#geometry.map((g)=>({...g}));}
get collapsed(){return new Set(this.#collapsed);}
toggle(id){
const key=String(id);
if(this.#collapsed.has(key))this.#collapsed.delete(key);
else this.#collapsed.add(key);
this.draw();
}
draw(){
if(this.#destroyed)return;
const schedule=this.#controller.schedule;
if(!schedule||!schedule.ok)return;
const overAllocations=schedule.overAllocations||[];
this.#overResources=new Set(overAllocations.map((o)=>o.resource));
this.#overTasks=new Set(overAllocations.flatMap((o)=>o.taskIds));
this.#evm=null;
if(this.#opts.evm){
const evmOpts=this.#opts.evm===true?{}:this.#opts.evm;
const statusDate=evmOpts.statusDate!=null
?evmOpts.statusDate
:(Number.isFinite(this.#opts.today)?this.#opts.today:undefined);
const result=this.#controller.earnedValue({...evmOpts,statusDate});
if(result&&result.ok)this.#evm=result.byTask;
}
const rows=this.#visibleRows(schedule);
const geometry=this.#computeGeometry(rows);
this.#geometry=geometry;
const totalHeight=geometry.length?geometry[geometry.length-1].top+geometry[geometry.length-1].height:0;
const zoom=this.#resolveZoom();
const lo=schedule.projectStart;
const hi=schedule.projectFinish;
const bounds=[lo,hi];
if(Number.isFinite(this.#opts.today))bounds.push(this.#opts.today);
const min=Math.floor(Math.min(...bounds));
const max=Math.ceil(Math.max(...bounds));
const pad=Math.max(1,Math.round((max-min)*0.04));
const domainMin=min-pad;
const domainMax=max+pad;
const timelineWidth=Math.max(1,Math.round((domainMax-domainMin)*zoom.px));
const scale=linearScale({min:domainMin,max:domainMax},[0,timelineWidth]);
this.#pxPerDay=scale.of(1)-scale.of(0);
const x=(day)=>round(scale.of(day));
this.#renderGridHead();
this.#renderGridBody(schedule,rows,geometry);
this.#renderTimeHead(zoom,domainMin,domainMax,x,timelineWidth);
this.#renderTimeBody(schedule,rows,geometry,x,timelineWidth,totalHeight,min,max);
if(this.#workload)this.#renderWorkload(schedule,zoom,domainMin,domainMax,x,timelineWidth);
}
#visibleRows(schedule){
const byParent=new Map();
for(const id of schedule.order){
const rec=schedule.tasks.get(id);
const p=rec.parent==null?'__root__':String(rec.parent);
if(!byParent.has(p))byParent.set(p,[]);
byParent.get(p).push(id);
}
const out=[];
const walk=(parentKey,depth)=>{
for(const id of byParent.get(parentKey)||[]){
const rec=schedule.tasks.get(id);
const hasChildren=!!rec.isSummary&&(byParent.get(id)||[]).length>0;
out.push({id,rec,depth,hasChildren});
if(hasChildren&&!this.#collapsed.has(id))walk(id,depth+1);
}
};
walk('__root__',0);
return out;
}
#computeGeometry(rows){
const base=Number(this.#opts.rowHeight)||34;
const raw=new Map(this.#controller.tasks.map((t)=>[String(t.id),t]));
const nameCol=this.#columns.find((c)=>c.kind==='name');
const nameWidth=nameCol&&nameCol.width?nameCol.width:(this.#gridWidth()-this.#columns.filter((c)=>c.kind!=='name').reduce((a,c)=>a+(c.width||0),0));
const out=[];
let top=0;
for(const row of rows){
const t=raw.get(row.id)||{};
let height=base;
if(Number.isFinite(t.height)){
height=Math.max(base,Number(t.height));
}else{
const avail=Math.max(24,nameWidth-row.depth*(this.#opts.indent||16)-28);
const perLine=Math.max(4,Math.floor(avail/7));
const lines=Math.max(1,Math.ceil(String(row.rec.name||'').length/perLine));
if(lines>1)height=Math.max(base,lines*18+12);
}
out.push({id:row.id,top,height});
top+=height;
}
return out;
}
#resolveZoom(){
const z=this.#opts.zoom;
if(Number.isFinite(z))return{px:Number(z),step:1,level:'custom'};
return(typeof z==='string'&&SPLIT_ZOOM[z])?SPLIT_ZOOM[z]:SPLIT_ZOOM.day;
}
#nonWorking(){
if(this.#opts.calendar){
const cal=createCalendar(this.#opts.calendar,0);
if(cal)return(day)=>!cal.isWorking(day);
}
if(this.#opts.nonWorking==='weekends'){
return(day)=>{const d=fromDayNumber(day);const wd=d?d.getUTCDay():0;return wd===0||wd===6;};
}
return typeof this.#opts.nonWorking==='function'?this.#opts.nonWorking:null;
}
#renderGridHead(){
const head=this.#gridHead;
while(head.firstChild)head.removeChild(head.firstChild);
head.style.height=`${this.#opts.headerHeight}px`;
const widths=this.#columnWidths();
this.#columns.forEach((col,i)=>{
const cell=el(this.#doc,'div',`${SPLIT_NS}__colhead`);
cell.style.width=`${widths[i]}px`;
cell.style.flex=`0 0 ${widths[i]}px`;
setText(cell,col.title||col.key);
head.appendChild(cell);
});
}
#columnWidths(){
const total=this.#gridWidth();
const fixed=this.#columns.reduce((a,c)=>a+(c.kind==='name'?0:(c.width||0)),0);
return this.#columns.map((c)=>(c.kind==='name'?Math.max(80,total-fixed):(c.width||80)));
}
#renderGridBody(schedule,rows,geometry){
const body=this.#gridBody;
while(body.firstChild)body.removeChild(body.firstChild);
const raw=new Map(this.#controller.tasks.map((t)=>[String(t.id),t]));
const widths=this.#columnWidths();
rows.forEach((row,i)=>{
const g=geometry[i];
const rowEl=el(this.#doc,'div',`${SPLIT_NS}__row${row.rec.isSummary?` ${SPLIT_NS}__row--summary`:''}`);
rowEl.style.height=`${g.height}px`;
rowEl.setAttribute('role','row');
rowEl.setAttribute('data-task',row.id);
rowEl.setAttribute('data-row-top',String(g.top));
rowEl.setAttribute('data-row-height',String(g.height));
this.#columns.forEach((col,ci)=>{
const editable=this.#opts.editable&&!row.rec.isSummary&&this.#editableField(col)!=null;
const cell=el(this.#doc,'div',`${SPLIT_NS}__cell${col.kind==='name'?` ${SPLIT_NS}__cell--name`:''}${editable?` ${SPLIT_NS}__cell--editable`:''}`);
cell.style.width=`${widths[ci]}px`;
cell.style.flex=`0 0 ${widths[ci]}px`;
cell.setAttribute('data-col',String(ci));
this.#fillCell(cell,col,row,raw.get(row.id)||{});
rowEl.appendChild(cell);
});
body.appendChild(rowEl);
});
}
#fillCell(cell,col,row,rawTask){
if(typeof col.render==='function'){
const text=col.render(row.rec,{rawTask,depth:row.depth});
if(text!=null)setText(cell,String(text));
return;
}
if(col.kind==='name'){this.#fillNameCell(cell,row);return;}
if(col.kind==='assignee'){this.#fillAssigneeCell(cell,rawTask);return;}
if(col.kind==='progress'){this.#fillProgressCell(cell,row.rec);return;}
if(col.kind==='evm'){this.#fillEvmCell(cell,col,row);return;}
if(SCHEDULE_KINDS.has(col.kind)){setText(cell,this.#scheduleText(col.kind,row.rec));return;}
const v=rawTask[col.key];
setText(cell,v==null?'':String(v));
}
#fillEvmCell(cell,col,row){
const metric=col.metric||'spi';
const evmRow=this.#evm?this.#evm.get(row.id):null;
const value=evmRow?evmRow[metric]:null;
if(value==null||!Number.isFinite(value)){setText(cell,'—');return;}
const digits=(metric==='spi'||metric==='cpi')?2:(Number.isFinite(col.digits)?col.digits:0);
setText(cell,value.toFixed(digits));
}
#fillNameCell(cell,row){
cell.style.paddingLeft=`${8+row.depth*(this.#opts.indent||16)}px`;
const chevron=this.#doc.createElement('button');
chevron.setAttribute('class',`${SPLIT_NS}__chevron`);
chevron.setAttribute('type','button');
if(row.hasChildren){
const collapsed=this.#collapsed.has(row.id);
setText(chevron,collapsed?'▸':'▾');
chevron.setAttribute('aria-label',collapsed?`Expand ${row.rec.name}`:`Collapse ${row.rec.name}`);
chevron.setAttribute('aria-expanded',collapsed?'false':'true');
chevron.addEventListener('click',()=>this.toggle(row.id));
}else{
chevron.setAttribute('aria-hidden','true');
}
cell.appendChild(chevron);
const text=el(this.#doc,'span',`${SPLIT_NS}__name-text${row.rec.isSummary?` ${SPLIT_NS}__name-text--summary`:''}`);
setText(text,row.rec.name);
cell.appendChild(text);
}
#fillAssigneeCell(cell,rawTask){
const value=rawTask.assignee??rawTask.assignees??rawTask.owner;
const names=(Array.isArray(value)?value:(value==null?[]:[value])).map((v)=>String(v)).filter(Boolean);
if(!names.length)return;
const wrap=el(this.#doc,'div',`${SPLIT_NS}__avatars`);
for(const name of names.slice(0,3)){
const over=this.#overResources.has(name);
const av=el(this.#doc,'div',`${SPLIT_NS}__avatar${over?` ${SPLIT_NS}__avatar--overalloc`:''}`);
av.style.background=avatarColor(name);
av.setAttribute('title',over?`${name} — over-allocated`:name);
setText(av,initials(name));
wrap.appendChild(av);
}
cell.appendChild(wrap);
}
#fillProgressCell(cell,rec){
const pct=rec.percentComplete==null?null:Math.max(0,Math.min(100,rec.percentComplete));
if(pct==null)return;
const size=26;
const r=10;
const c=2*Math.PI*r;
const ring=svg(this.#doc,'svg',{class:`${SPLIT_NS}__ring`,width:size,height:size,viewBox:`0 0 ${size} ${size}`});
ring.appendChild(svg(this.#doc,'circle',{cx:size/2,cy:size/2,r,fill:'none',stroke:'#e6e8eb','stroke-width':3}));
ring.appendChild(svg(this.#doc,'circle',{
cx:size/2,cy:size/2,r,fill:'none',stroke:pct>=100?'#2c9c6a':'#4a90d9','stroke-width':3,
'stroke-dasharray':`${round(c*pct/100)} ${round(c)}`,'stroke-linecap':'round',
transform:`rotate(-90 ${size/2} ${size/2})`,
}));
const label=svg(this.#doc,'text',{x:size/2,y:size/2+3,'text-anchor':'middle','font-size':8,fill:'#57606a'});
setText(label,String(Math.round(pct)));
ring.appendChild(label);
cell.appendChild(ring);
}
#renderTimeHead(zoom,domainMin,domainMax,x,width){
const pane=this.#timeHead;
while(pane.firstChild)pane.removeChild(pane.firstChild);
pane.style.height=`${this.#opts.headerHeight}px`;
const h=this.#opts.headerHeight;
const bandH=zoom.level==='day'?Math.round(h*0.55):h;
const inner=svg(this.#doc,'svg',{
class:`${SPLIT_NS}__plot`,width,height:h,viewBox:`0 0 ${width} ${h}`,
});
inner.setAttribute('data-role','time-head');
const from=Math.floor(domainMin);
const to=Math.ceil(domainMax);
const pred=this.#nonWorking();
const bandStep=(zoom.level==='month'||zoom.level==='quarter')?null:7;
if(bandStep){
const candidates=[];
let day=from-((fromDayNumber(from)?.getUTCDay()??0));
for(;day<to;day+=bandStep){
const px=x(day);
inner.appendChild(svg(this.#doc,'line',{class:`${SPLIT_NS}__bandsep`,x1:px,y1:0,x2:px,y2:h}));
const d=fromDayNumber(day);
if(d){
candidates.push({
at:px,
text:`${DAY_NAMES[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2,'0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
});
}
}
for(const kept of thinLabels(candidates,{fontSize:BAND_FONT_SIZE,bold:true}).kept){
const label=svg(this.#doc,'text',{class:`${SPLIT_NS}__band`,x:kept.at+4,y:Math.round(bandH*0.62)});
setText(label,kept.text);
inner.appendChild(label);
}
}else{
let d=fromDayNumber(from);
if(d){
const candidates=[];
let cursor=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1)/86400000;
for(;cursor<to;){
const md=fromDayNumber(cursor);
const px=x(cursor);
inner.appendChild(svg(this.#doc,'line',{class:`${SPLIT_NS}__bandsep`,x1:px,y1:0,x2:px,y2:h}));
candidates.push({at:px,text:`${MONTHS[md.getUTCMonth()]} ${md.getUTCFullYear()}`});
cursor=Date.UTC(md.getUTCFullYear(),md.getUTCMonth()+1,1)/86400000;
}
for(const kept of thinLabels(candidates,{fontSize:BAND_FONT_SIZE,bold:true}).kept){
const label=svg(this.#doc,'text',{class:`${SPLIT_NS}__band`,x:kept.at+4,y:Math.round(h*0.6)});
setText(label,kept.text);
inner.appendChild(label);
}
}
}
if(zoom.level==='day'){
inner.appendChild(svg(this.#doc,'line',{class:`${SPLIT_NS}__bandsep`,x1:0,y1:bandH,x2:width,y2:bandH}));
for(let day=from;day<to;day+=1){
const d=fromDayNumber(day);
if(!d)continue;
const cx=(x(day)+x(day+1))/2;
const letter=svg(this.#doc,'text',{
class:`${SPLIT_NS}__dayletter${pred&&pred(day)?` ${SPLIT_NS}__dayletter--nonwork`:''}`,
x:round(cx),y:bandH+Math.round((h-bandH)*0.62),
});
setText(letter,DAY_LETTERS[d.getUTCDay()]);
inner.appendChild(letter);
}
}
pane.appendChild(inner);
pane.scrollLeft=this.#timeBody?this.#timeBody.scrollLeft:0;
}
#renderTimeBody(schedule,rows,geometry,x,width,totalHeight,min,max){
const pane=this.#timeBody;
while(pane.firstChild)pane.removeChild(pane.firstChild);
const plot=svg(this.#doc,'svg',{
class:`${SPLIT_NS}__plot`,width,height:totalHeight,viewBox:`0 0 ${width} ${totalHeight}`,role:'img','aria-label':'Gantt timeline',
});
const pred=this.#nonWorking();
if(pred&&(max-min)<=3660){
const g=svg(this.#doc,'g',{class:`${SPLIT_NS}__shading`});
for(let day=Math.floor(min);day<Math.ceil(max);day+=1){
if(!pred(day))continue;
const x0=x(day);
const x1=x(day+1);
g.appendChild(svg(this.#doc,'rect',{class:`${SPLIT_NS}__shade`,x:x0,y:0,width:round(Math.max(0,x1-x0)),height:totalHeight}));
}
plot.appendChild(g);
}
const rowIndex=new Map(rows.map((r,i)=>[r.id,i]));
const showProgress=this.#opts.showProgress;
const showBaseline=this.#opts.showBaseline;
rows.forEach((row,i)=>{
const g=geometry[i];
const rec=row.rec;
const barH=Math.min(18,g.height-12);
const barY=g.top+(g.height-barH)/2;
const midY=g.top+g.height/2;
const group=svg(this.#doc,'g',{class:`${SPLIT_NS}__barrow`});
group.setAttribute('data-task',row.id);
group.setAttribute('data-y',String(g.top));
group.setAttribute('data-row-height',String(g.height));
group.setAttribute('tabindex',this.#opts.keyboard?'0':'-1');
group.setAttribute('role',rec.isSummary?'group':'button');
group.setAttribute('aria-label',describeTask(rec,{iso:(d)=>toISODate(d)}));
group.appendChild(svg(this.#doc,'rect',{class:`${SPLIT_NS}__rowbg`,x:0,y:round(g.top),width,height:round(g.height),fill:'transparent'}));
group.appendChild(svg(this.#doc,'line',{class:`${SPLIT_NS}__rowsep`,x1:0,y1:round(g.top+g.height),x2:width,y2:round(g.top+g.height)}));
if(showBaseline&&rec.baselineStart!=null&&rec.baselineEnd!=null){
const bx=x(rec.baselineStart);
const bw=Math.max(1,x(rec.baselineEnd)-bx);
group.appendChild(svg(this.#doc,'rect',{class:`${SPLIT_NS}__baseline`,x:bx,y:round(barY+barH),width:round(bw),height:4,rx:2}));
}
if(rec.isMilestone){
const cx=x(rec.es);
const r=barH/2;
group.appendChild(svg(this.#doc,'path',{
class:`${SPLIT_NS}__milestone`,
d:path(['M',round(cx-r),round(midY),'L',round(cx),round(midY-r),'L',round(cx+r),round(midY),'L',round(cx),round(midY+r),'Z']),
}));
}else if(rec.isSummary){
const x0=x(rec.es);
const w=Math.max(2,x(rec.ef)-x0);
group.appendChild(svg(this.#doc,'rect',{class:`${SPLIT_NS}__summary-bar`,x:x0,y:round(barY+barH/3),width:round(w),height:round(barH/3),rx:1}));
group.appendChild(svg(this.#doc,'path',{class:`${SPLIT_NS}__summary-bar`,d:path(['M',round(x0),round(barY+barH/3),'L',round(x0),round(barY+barH),'L',round(x0+5),round(barY+barH/3),'Z'])}));
group.appendChild(svg(this.#doc,'path',{class:`${SPLIT_NS}__summary-bar`,d:path(['M',round(x0+w),round(barY+barH/3),'L',round(x0+w),round(barY+barH),'L',round(x0+w-5),round(barY+barH/3),'Z'])}));
const sl=svg(this.#doc,'text',{class:`${SPLIT_NS}__startlabel`,x:round(x0+w+6),y:round(midY)});
setText(sl,this.#dateLabel(rec.es));
group.appendChild(sl);
}else{
const x0=x(rec.es);
const w=Math.max(1,x(rec.ef)-x0);
const crit=rec.critical;
const over=this.#overTasks.has(String(rec.id));
group.appendChild(svg(this.#doc,'rect',{class:`${SPLIT_NS}__bar${crit?` ${SPLIT_NS}__bar--critical`:''}${over?` ${SPLIT_NS}__bar--overalloc`:''}`,x:x0,y:round(barY),width:round(w),height:round(barH),rx:3}));
if(showProgress&&rec.percentComplete!=null&&rec.percentComplete>0){
group.appendChild(svg(this.#doc,'rect',{class:`${SPLIT_NS}__progress`,x:x0,y:round(barY),width:round(w*Math.min(1,rec.percentComplete/100)),height:round(barH),rx:3}));
}
const text=this.#barLabelText(rec);
if(text){
const t=svg(this.#doc,'text',{class:`${SPLIT_NS}__barlabel`,x:round(x0+w+6),y:round(midY)});
setText(t,text);
group.appendChild(t);
}
}
plot.appendChild(group);
});
if(this.#opts.showArrows)this.#renderLinks(plot,schedule,rows,rowIndex,geometry,x);
if(Number.isFinite(this.#opts.today)){
const px=x(this.#opts.today);
plot.appendChild(svg(this.#doc,'line',{class:`${SPLIT_NS}__today`,x1:px,y1:0,x2:px,y2:totalHeight,'data-today':String(this.#opts.today)}));
}
pane.appendChild(plot);
if(this.#focusId){
const focused=plot.querySelector(`.${SPLIT_NS}__barrow[data-task="${this.#focusId}"]`);
if(focused&&focused.focus)focused.focus();
}
}
#announce(message){if(this.#live)setText(this.#live,message);}
#resolveWorkload(){
const spec=this.#opts.workload;
if(spec==null||spec===false)return null;
const given=(spec&&typeof spec==='object')?spec:{};
const cfg={...WORKLOAD_DEFAULTS,...given};
cfg.hoursPerDay=Number.isFinite(Number(cfg.hoursPerDay))&&Number(cfg.hoursPerDay)>0
?Number(cfg.hoursPerDay):WORKLOAD_DEFAULTS.hoursPerDay;
cfg.rowHeight=Math.max(16,Number(cfg.rowHeight)||WORKLOAD_DEFAULTS.rowHeight);
cfg.height=Math.max(cfg.rowHeight,Number(cfg.height)||WORKLOAD_DEFAULTS.height);
cfg.totals=cfg.totals!==false;
return cfg;
}
#buildWorkload(){
const cfg=this.#workload;
this.#wlRoot=el(this.#doc,'div',`${SPLIT_NS}__wl`);
this.#wlRoot.style.flex=`0 0 ${cfg.height}px`;
this.#wlRoot.setAttribute('role','table');
this.#wlRoot.setAttribute('aria-label',this.#t('gantt.workload.title'));
this.#wlHead=el(this.#doc,'div',`${SPLIT_NS}__wl-head`);
this.#wlHead.style.height=`${cfg.rowHeight}px`;
this.#wlHead.appendChild(el(this.#doc,'div',`${SPLIT_NS}__wl-cell ${SPLIT_NS}__wl-cell--name`));
this.#wlHead.appendChild(el(this.#doc,'div',`${SPLIT_NS}__wl-cell ${SPLIT_NS}__wl-cell--total`));
this.#wlHead.appendChild(el(this.#doc,'div',`${SPLIT_NS}__divider`));
this.#wlHead.appendChild(el(this.#doc,'div',`${SPLIT_NS}__wl-head-spacer`));
this.#wlRoot.appendChild(this.#wlHead);
const wlBody=el(this.#doc,'div',`${SPLIT_NS}__wl-body`);
this.#wlGrid=el(this.#doc,'div',`${SPLIT_NS}__wl-grid`);
this.#wlGrid.style.width=`${this.#gridWidth()}px`;
this.#wlTime=el(this.#doc,'div',`${SPLIT_NS}__wl-time`);
wlBody.appendChild(this.#wlGrid);
wlBody.appendChild(el(this.#doc,'div',`${SPLIT_NS}__divider`));
wlBody.appendChild(this.#wlTime);
this.#wlRoot.appendChild(wlBody);
this.#root.appendChild(this.#wlRoot);
this.#onWlScroll=()=>this.#syncHScroll(this.#wlTime);
this.#wlTime.addEventListener('scroll',this.#onWlScroll);
if(this.#opts.editable){
this.#onWlCellEdit=(e)=>this.#onWorkloadDblClick(e);
this.#wlTime.addEventListener('dblclick',this.#onWlCellEdit);
}
}
#syncHScroll(source){
if(this.#syncing||!source)return;
this.#syncing=true;
const left=source.scrollLeft;
for(const pane of[this.#timeHead,this.#timeBody,this.#wlTime]){
if(pane&&pane!==source&&pane.scrollLeft!==left)pane.scrollLeft=left;
}
this.#syncing=false;
}
#capacities(){
const map=new Map();
const load=this.#controller.resourceLoad;
if(load&&load.byResource instanceof Map){
for(const[name,entry]of load.byResource){
if(entry&&Number.isFinite(entry.capacity))map.set(name,entry.capacity);
}
}
return map;
}
#renderWorkload(schedule,zoom,domainMin,domainMax,x,width){
const cfg=this.#workload;
if(!cfg||!this.#wlGrid||!this.#wlTime||!this.#wlHead)return;
const pred=this.#nonWorking();
const buckets=workloadBuckets(zoom.level,Math.floor(domainMin),Math.ceil(domainMax));
const load=computeWorkload(this.#controller.tasks,schedule,{
buckets,
hoursPerDay:cfg.hoursPerDay,
isWorking:pred?(day)=>!pred(day):null,
capacities:this.#capacities(),
});
const widths=this.#columnWidths();
const nameWidth=Math.max(40,widths[0]||this.#gridWidth());
const totalWidth=Math.max(0,this.#gridWidth()-nameWidth);
const heads=this.#wlHead.querySelectorAll(`.${SPLIT_NS}__wl-cell`);
if(heads[0]){
heads[0].style.width=`${nameWidth}px`;
heads[0].style.flex=`0 0 ${nameWidth}px`;
setText(heads[0],this.#t('gantt.workload.resource'));
}
if(heads[1]){
heads[1].style.width=`${totalWidth}px`;
heads[1].style.flex=`0 0 ${totalWidth}px`;
setText(heads[1],cfg.totals?this.#t('gantt.workload.total'):'');
}
const rows=load.rows.slice();
const columns=load.ok?load.buckets:buckets.map((b)=>({...b,workingDays:0}));
this.#wlLast={buckets:columns,rows};
const grid=this.#wlGrid;
const pane=this.#wlTime;
while(grid.firstChild)grid.removeChild(grid.firstChild);
while(pane.firstChild)pane.removeChild(pane.firstChild);
const plot=el(this.#doc,'div',`${SPLIT_NS}__wl-plot`);
plot.style.width=`${width}px`;
const drawn=rows.reduce((a,r)=>a+1
+(this.#wlExpanded.has(r.resource==null?'':r.resource)?(r.tasks||[]).length:0),0);
plot.style.height=`${(drawn+(cfg.totals?1:0))*cfg.rowHeight}px`;
for(const row of rows){
const key=row.resource==null?'':row.resource;
const label=row.resource==null?this.#t('gantt.workload.unassigned'):row.resource;
const subs=row.tasks||[];
const expanded=this.#wlExpanded.has(key);
this.#appendWorkloadRow(grid,plot,{
key,
label,
cells:row.cells,
over:row.over,
capacity:row.capacity,
total:row.total,
isTotal:false,
taskId:null,
toggle:subs.length?{expanded,name:label}:null,
},columns,x,nameWidth,totalWidth,cfg);
if(!expanded)continue;
for(const sub of subs){
this.#appendWorkloadRow(grid,plot,{
key,
label:sub.name,
cells:sub.cells,
over:sub.cells.map(()=>false),
capacity:null,
total:sub.total,
isTotal:false,
taskId:String(sub.id),
toggle:null,
},columns,x,nameWidth,totalWidth,cfg);
}
}
if(cfg.totals){
this.#appendWorkloadRow(grid,plot,{
key:'__total__',
label:this.#t('gantt.workload.total'),
cells:load.totals,
over:load.totals.map(()=>false),
capacity:null,
total:load.grandTotal,
isTotal:true,
taskId:null,
toggle:null,
},columns,x,nameWidth,totalWidth,cfg);
}
pane.appendChild(plot);
if(this.#timeBody)pane.scrollLeft=this.#timeBody.scrollLeft;
}
#appendWorkloadRow(grid,plot,row,buckets,x,nameWidth,totalWidth,cfg){
const isTask=row.taskId!=null;
const editable=isTask&&!!this.#opts.editable;
const left=el(this.#doc,'div',`${SPLIT_NS}__wl-row${row.isTotal?` ${SPLIT_NS}__wl-row--total`:''}${isTask?` ${SPLIT_NS}__wl-row--task`:''}`);
left.style.height=`${cfg.rowHeight}px`;
left.setAttribute('role','row');
left.setAttribute('data-resource',row.key);
if(isTask)left.setAttribute('data-task',row.taskId);
const name=el(this.#doc,'div',`${SPLIT_NS}__wl-cell ${SPLIT_NS}__wl-cell--name`);
name.style.width=`${nameWidth}px`;
name.style.flex=`0 0 ${nameWidth}px`;
name.setAttribute('role','rowheader');
if(row.toggle){
const toggle=this.#doc.createElement('button');
toggle.setAttribute('class',`${SPLIT_NS}__wl-toggle`);
toggle.setAttribute('type','button');
toggle.setAttribute('aria-expanded',row.toggle.expanded?'true':'false');
toggle.setAttribute('aria-label',this.#t(
row.toggle.expanded?'gantt.workload.collapse':'gantt.workload.expand',
{name:row.toggle.name},
));
toggle.addEventListener('click',()=>this.toggleResource(row.key));
name.appendChild(toggle);
}
const text=el(this.#doc,'span',`${SPLIT_NS}__wl-name-text`);
setText(text,row.label);
name.appendChild(text);
left.appendChild(name);
const total=el(this.#doc,'div',`${SPLIT_NS}__wl-cell ${SPLIT_NS}__wl-cell--total`);
total.style.width=`${totalWidth}px`;
total.style.flex=`0 0 ${totalWidth}px`;
total.setAttribute('role','cell');
if(cfg.totals)setText(total,formatHours(row.total,cfg.decimals));
left.appendChild(total);
grid.appendChild(left);
const right=el(this.#doc,'div',`${SPLIT_NS}__wl-timerow${row.isTotal?` ${SPLIT_NS}__wl-timerow--total`:''}${isTask?` ${SPLIT_NS}__wl-timerow--task`:''}`);
right.style.height=`${cfg.rowHeight}px`;
right.setAttribute('role','row');
right.setAttribute('data-resource',row.key);
if(isTask)right.setAttribute('data-task',row.taskId);
buckets.forEach((bucket,i)=>{
const x0=x(bucket.start);
const x1=x(bucket.end);
const over=!!row.over[i];
const cell=el(this.#doc,'div',`${SPLIT_NS}__wl-bucket${over?` ${SPLIT_NS}__wl-bucket--over`:''}${editable?` ${SPLIT_NS}__wl-bucket--editable`:''}`);
cell.style.left=`${round(x0)}px`;
cell.style.width=`${round(Math.max(0,x1-x0))}px`;
cell.setAttribute('role','cell');
const date=toISODate(bucket.start)??String(bucket.start);
cell.setAttribute('data-bucket',date);
if(editable)cell.setAttribute('data-bucket-index',String(i));
const hours=row.cells[i];
const text=formatHours(hours,cfg.decimals);
if(text!==''){
setText(cell,text);
cell.setAttribute('data-hours',String(hours));
const params={hours:text,date};
cell.setAttribute('aria-label',over
?this.#t('gantt.workload.over',{...params,capacity:formatHours(row.capacity*cfg.hoursPerDay*(bucket.workingDays??0),cfg.decimals)})
:this.#t('gantt.workload.cell',params));
}else if(editable){
cell.setAttribute('aria-label',this.#t('gantt.workload.cell',{hours:'0',date}));
}
right.appendChild(cell);
});
plot.appendChild(right);
}
toggleResource(resource){
const key=String(resource);
if(this.#wlExpanded.has(key))this.#wlExpanded.delete(key);
else this.#wlExpanded.add(key);
this.draw();
}
get expandedResources(){return new Set(this.#wlExpanded);}
#renderLinks(plot,schedule,rows,rowIndex,geometry,x){
const g=svg(this.#doc,'g',{class:`${SPLIT_NS}__links`});
const midOf=(id)=>{const gi=geometry[rowIndex.get(id)];return gi.top+gi.height/2;};
for(const dep of this.#controller.dependencies){
const from=String(dep.from);
const to=String(dep.to);
if(!rowIndex.has(from)||!rowIndex.has(to))continue;
const p=schedule.tasks.get(from);
const s=schedule.tasks.get(to);
if(!p||!s)continue;
const type=dep.type?String(dep.type).toUpperCase():'FS';
const startDay=(type==='FS'||type==='FF')?p.ef:p.es;
const endDay=(type==='FF'||type==='SF')?s.ef:s.es;
const sx=x(startDay);
const sy=midOf(from);
const ex=x(endDay);
const ey=midOf(to);
const critical=p.critical&&s.critical;
const route=routeLink({sx,sy,ex,ey,type,elbow:10,rowGap:geometry[rowIndex.get(from)].height/2});
const line=svg(this.#doc,'path',{class:`${SPLIT_NS}__link${critical?` ${SPLIT_NS}__link--critical`:''}`,d:route.d});
line.setAttribute('data-from',from);
line.setAttribute('data-to',to);
line.setAttribute('data-type',type);
line.setAttribute('data-route',route.route);
g.appendChild(line);
g.appendChild(svg(this.#doc,'path',{
class:`${SPLIT_NS}__arrowhead${critical?` ${SPLIT_NS}__arrowhead--critical`:''}`,
d:arrowheadPath(ex,ey,route.arrowDir),
}));
}
plot.appendChild(g);
}
#barLabelText(rec){
const spec=this.#opts.barLabel;
if(typeof spec==='function')return String(spec(rec)??'');
switch(spec){
case'none':return'';
case'percent':return rec.percentComplete==null?'':`${Math.round(rec.percentComplete)}%`;
case'dates':return`${this.#dateLabel(rec.es)} – ${this.#dateLabel(rec.ef)}`;
case'name':default:return rec.name;
}
}
#dateLabel(day){
const d=fromDayNumber(day);
return d?`${String(d.getUTCDate()).padStart(2,'0')} ${MONTHS[d.getUTCMonth()]}`:(toISODate(day)??String(day));
}
#editableField(col){
if(!col||col.editable===false)return null;
if(col.editField)return String(col.editField);
if(col.kind==='name')return'name';
if(col.kind==='progress')return'percentComplete';
if(SCHEDULE_KINDS.has(col.kind))return col.kind;
if(col.editable===true)return col.key;
return null;
}
#scheduleText(kind,rec){
if(kind==='duration')return String(round(rec.duration));
const day=kind==='start'?rec.es:rec.ef;
return toISODate(day)??String(round(day));
}
#recOf(id){
const schedule=this.#controller.schedule;
return schedule&&schedule.ok?(schedule.tasks.get(String(id))||null):null;
}
#parseDay(raw){
const text=String(raw==null?'':raw).trim();
if(text==='')return null;
if(/^-?\d+(\.\d+)?$/.test(text))return Number(text);
const day=toDayNumber(text);
return Number.isFinite(day)?day:null;
}
#onCellDblClick(event){
if(this.#editing)return;
const target=event.target;
const cell=target&&target.closest?target.closest(`.${SPLIT_NS}__cell`):null;
if(!cell)return;
const rowEl=cell.closest(`.${SPLIT_NS}__row`);
if(!rowEl)return;
const id=rowEl.getAttribute('data-task');
const col=this.#columns[Number(cell.getAttribute('data-col'))];
const field=this.#editableField(col);
if(!id||!field)return;
const rec=this.#controller.schedule&&this.#controller.schedule.ok?this.#controller.schedule.tasks.get(id):null;
if(rec&&rec.isSummary)return;
this.#openEditor(cell,id,field,col);
}
#openEditor(cell,id,field,col){
const task=this.#controller.tasks.find((t)=>String(t.id)===String(id))||{};
const rec=this.#recOf(id);
const numeric=field==='percentComplete'||field==='duration'
||col.kind==='progress'||col.kind==='number';
let current;
if(field==='duration'&&rec)current=round(rec.duration);
else if(field==='start'&&rec)current=this.#scheduleText('start',rec);
else if(field==='end'&&rec)current=this.#scheduleText('end',rec);
else if(field==='percentComplete'&&rec&&rec.percentComplete!=null)current=rec.percentComplete;
else current=task[field]==null?'':task[field];
while(cell.firstChild)cell.removeChild(cell.firstChild);
const input=this.#doc.createElement('input');
input.setAttribute('class',`${SPLIT_NS}__editor`);
const isDate=/^\d{4}-\d{2}-\d{2}$/.test(String(current));
input.setAttribute('type',numeric?'number':(isDate?'date':'text'));
input.value=String(current);
cell.appendChild(input);
this.#editing=true;
if(input.focus)input.focus();
let done=false;
const finish=(commit)=>{
if(done)return;
done=true;
this.#editing=false;
if(commit)this.#commitEdit(id,field,input.value,numeric);
else this.draw();
};
input.addEventListener('keydown',(e)=>{
if(e.key==='Enter'){if(e.preventDefault)e.preventDefault();finish(true);}
else if(e.key==='Escape'){if(e.preventDefault)e.preventDefault();finish(false);}
});
input.addEventListener('blur',()=>finish(true));
}
#commitEdit(id,field,rawValue,numeric){
if(field==='start'||field==='end'){
const day=this.#parseDay(rawValue);
const rec=this.#recOf(id);
if(day==null||!rec){this.draw();return;}
if(field==='start'){
this.#controller.applyEdit({id,start:day},{writeBack:true});
}else{
this.#controller.applyEdit({id,duration:Math.max(0,rec.duration+(day-rec.ef))},{writeBack:true});
}
this.draw();
return;
}
let value=rawValue;
if(numeric){
const n=Number(rawValue);
if(!Number.isFinite(n)){this.draw();return;}
if(field==='percentComplete')value=Math.max(0,Math.min(100,n));
else if(field==='duration')value=Math.max(0,n);
else value=n;
}
this.#controller.applyEdit({id,[field]:value},{writeBack:true});
this.draw();
}
#onWorkloadDblClick(event){
if(this.#editing||!this.#opts.editable)return;
const target=event.target;
const cell=target&&target.closest?target.closest(`.${SPLIT_NS}__wl-bucket`):null;
if(!cell||!cell.getAttribute('data-bucket-index'))return;
const rowEl=cell.closest(`.${SPLIT_NS}__wl-timerow`);
const taskId=rowEl?rowEl.getAttribute('data-task'):null;
if(!taskId)return;
this.#openWorkloadEditor(cell,taskId,rowEl.getAttribute('data-resource')||'',Number(cell.getAttribute('data-bucket-index')));
}
#openWorkloadEditor(cell,taskId,resource,index){
const current=cell.getAttribute('data-hours');
while(cell.firstChild)cell.removeChild(cell.firstChild);
const input=this.#doc.createElement('input');
input.setAttribute('class',`${SPLIT_NS}__wl-editor`);
input.setAttribute('type','number');
input.value=current==null?'':formatHours(Number(current),this.#workload.decimals);
cell.appendChild(input);
this.#editing=true;
if(input.focus)input.focus();
let done=false;
const finish=(commit)=>{
if(done)return;
done=true;
this.#editing=false;
if(commit)this.#commitWorkloadEdit(taskId,resource,index,input.value);
else this.draw();
};
input.addEventListener('keydown',(e)=>{
if(e.key==='Enter'){if(e.preventDefault)e.preventDefault();finish(true);}
else if(e.key==='Escape'){if(e.preventDefault)e.preventDefault();finish(false);}
});
input.addEventListener('blur',()=>finish(true));
}
#commitWorkloadEdit(taskId,resource,index,rawValue){
const cfg=this.#workload;
const last=this.#wlLast;
const bucket=last&&last.buckets?last.buckets[index]:null;
const rowData=last&&last.rows
?last.rows.find((r)=>(r.resource==null?'':r.resource)===resource):null;
const sub=rowData&&rowData.tasks
?rowData.tasks.find((t)=>String(t.id)===String(taskId)):null;
const rec=this.#recOf(taskId);
if(!cfg||!bucket||!sub||!rec){this.draw();return;}
const text=String(rawValue==null?'':rawValue).trim();
const typed=text===''?0:Number(text);
if(!Number.isFinite(typed)||typed<0){this.draw();return;}
const pred=this.#nonWorking();
const isWorking=pred?(day)=>!pred(day):null;
const bucketDays=[];
for(let d=Math.floor(bucket.start);d<Math.ceil(bucket.end);d+=1){
if(!isWorking||isWorking(d))bucketDays.push(d);
}
const date=toISODate(bucket.start)??String(bucket.start);
if(!bucketDays.length){
this.#announce(this.#t('gantt.a11y.hoursRefused',{name:sub.name,date}));
this.draw();
return;
}
const spanDays=recordWorkingDays(rec,isWorking);
const shared=bucketDays.filter((d)=>spanDays.includes(d));
const days=shared.length?shared:bucketDays;
const raw=sub.raw||{};
let contour=taskContour(raw);
if(!contour){
const stated=statedHours(raw);
const total=stated!=null?stated:spanDays.length*cfg.hoursPerDay*sub.unitsTotal;
contour=spreadHours(spanDays,total);
}
const share=sub.units>0?sub.unitsTotal/sub.units:1;
const next=setContourBucket(contour,bucket,days,typed*share);
this.#controller.applyEdit({id:taskId,work:serializeContour(next)},{writeBack:true});
this.#announce(typed>0
?this.#t('gantt.a11y.hoursSet',{name:sub.name,hours:formatHours(typed,cfg.decimals),date})
:this.#t('gantt.a11y.hoursCleared',{name:sub.name,date}));
this.draw();
}
#chainOf(id){
const preds=new Map();
const succs=new Map();
for(const dep of this.#controller.dependencies){
const from=String(dep.from);
const to=String(dep.to);
(succs.get(from)||succs.set(from,[]).get(from)).push(to);
(preds.get(to)||preds.set(to,[]).get(to)).push(from);
}
const chain=new Set([id]);
const walk=(adj)=>{
const stack=[id];
while(stack.length){
const cur=stack.pop();
for(const next of adj.get(cur)||[]){
if(!chain.has(next)){chain.add(next);stack.push(next);}
}
}
};
walk(preds);
walk(succs);
return chain;
}
#highlightChain(id){
if(!this.#root)return;
this.#clearHighlight();
const chain=this.#chainOf(id);
for(const cid of chain){
const gr=this.#gridBody&&this.#gridBody.querySelector(`.${SPLIT_NS}__row[data-task="${cid}"]`);
if(gr)gr.classList.add(`${SPLIT_NS}__row--chain`);
}
const plot=this.#timeBody;
if(!plot)return;
for(const link of plot.querySelectorAll(`.${SPLIT_NS}__link`)){
const f=link.getAttribute('data-from');
const t=link.getAttribute('data-to');
if(chain.has(f)&&chain.has(t))link.classList.add(`${SPLIT_NS}__link--chain`);
}
for(const cid of chain){
const group=plot.querySelector(`.${SPLIT_NS}__barrow[data-task="${cid}"]`);
if(!group)continue;
const bar=group.querySelector(`.${SPLIT_NS}__bar`)||group.querySelector(`.${SPLIT_NS}__milestone`)||group.querySelector(`.${SPLIT_NS}__summary-bar`);
if(!bar)continue;
const kind=bar.getAttribute('class')||'';
if(kind.includes(`${SPLIT_NS}__milestone`))bar.classList.add(`${SPLIT_NS}__milestone--chain`);
else if(kind.includes(`${SPLIT_NS}__summary-bar`))bar.classList.add(`${SPLIT_NS}__summary-bar--chain`);
else bar.classList.add(`${SPLIT_NS}__bar--chain`);
}
}
#clearHighlight(){
if(!this.#root)return;
for(const cls of['__row--chain','__link--chain','__bar--chain','__milestone--chain','__summary-bar--chain']){
for(const elm of this.#root.querySelectorAll(`.${SPLIT_NS}${cls}`))elm.classList.remove(`${SPLIT_NS}${cls}`);
}
}
#onChainHover(event){
if(this.#editing||(this.#gestures&&this.#gestures.dragging))return;
const target=event.target;
const rowEl=target&&target.closest
?(target.closest(`.${SPLIT_NS}__row`)||target.closest(`.${SPLIT_NS}__barrow`)):null;
const id=rowEl?rowEl.getAttribute('data-task'):null;
if(id)this.#highlightChain(id);
else this.#clearHighlight();
}
destroy(){
if(this.#destroyed)return;
this.#destroyed=true;
if(this.#onHScroll&&this.#timeBody)this.#timeBody.removeEventListener('scroll',this.#onHScroll);
this.#onHScroll=null;
if(this.#onWlScroll&&this.#wlTime)this.#wlTime.removeEventListener('scroll',this.#onWlScroll);
this.#onWlScroll=null;
if(this.#onWlCellEdit&&this.#wlTime)this.#wlTime.removeEventListener('dblclick',this.#onWlCellEdit);
this.#onWlCellEdit=null;
this.#wlLast=null;
if(this.#onRowHover){
if(this.#gridBody){this.#gridBody.removeEventListener('pointerover',this.#onRowHover);this.#gridBody.removeEventListener('pointerleave',this.#onRowOut);}
if(this.#timeBody){this.#timeBody.removeEventListener('pointerover',this.#onRowHover);this.#timeBody.removeEventListener('pointerleave',this.#onRowOut);}
}
this.#onRowHover=this.#onRowOut=null;
if(this.#onCellEdit&&this.#gridBody)this.#gridBody.removeEventListener('dblclick',this.#onCellEdit);
this.#onCellEdit=null;
if(this.#timeBody){
if(this.#onBarPointerDown)this.#timeBody.removeEventListener('pointerdown',this.#onBarPointerDown);
if(this.#onBarKey)this.#timeBody.removeEventListener('keydown',this.#onBarKey);
}
this.#onBarPointerDown=this.#onBarKey=null;
if(this.#gestures){this.#gestures.destroy();this.#gestures=null;}
this.#live=null;
if(this.#off)this.#off();
this.#off=null;
if(this.#root&&this.#root.parentNode)this.#root.parentNode.removeChild(this.#root);
this.#root=null;
this.#gridHead=this.#gridBody=this.#timeHead=this.#timeBody=null;
this.#wlRoot=this.#wlHead=this.#wlGrid=this.#wlTime=null;
}
}
function mountGanttSplit(controller,container,opts={}){
return new GanttSplitView(controller,container,opts);
}
});
__def("packages/modules/gantt/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"GANTT_STATE_VERSION",{enumerable:true,get:function(){return GANTT_STATE_VERSION;}});
Object.defineProperty(__exports,"createGantt",{enumerable:true,get:function(){return createGantt;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const isObject=__m0["isObject"];
const __m1=__req("packages/modules/gantt/schedule.js");
const computeSchedule=__m1["computeSchedule"];
const findViolations=__m1["findViolations"];
const normalizeLinkSpec=__m1["normalizeLinkSpec"];
const taskIdReader=__m1["taskIdReader"];
const taskFieldWriters=__m1["taskFieldWriters"];
const __m2=__req("packages/modules/gantt/resources.js");
const computeResourceLoad=__m2["computeResourceLoad"];
const levelResources=__m2["levelResources"];
const __m3=__req("packages/modules/gantt/earned-value.js");
const computeEarnedValue=__m3["computeEarnedValue"];
const __m4=__req("packages/modules/gantt/mspdi.js");
const importMSPDI=__m4["importMSPDI"];
const exportMSPDI=__m4["exportMSPDI"];
const __m5=__req("packages/modules/gantt/time.js");
const toISODate=__m5["toISODate"];
const toDayNumber=__m5["toDayNumber"];
const __m6=__req("packages/modules/gantt/calendar.js");
const createCalendar=__m6["createCalendar"];
const __m7=__req("packages/modules/gantt/workload.js");
const taskContour=__m7["taskContour"];
const contourSpan=__m7["contourSpan"];
const spanDuration=__m7["spanDuration"];
const retimeContour=__m7["retimeContour"];
const recordWorkingDays=__m7["recordWorkingDays"];
const serializeContour=__m7["serializeContour"];
const __m8=__req("packages/modules/gantt/render.js");
const GanttView=__m8["GanttView"];
const __m9=__req("packages/modules/gantt/split.js");
const GanttSplitView=__m9["GanttSplitView"];
Object.defineProperty(__exports,"computeSchedule",{enumerable:true,get:function(){return __m1["computeSchedule"];}});
Object.defineProperty(__exports,"findViolations",{enumerable:true,get:function(){return __m1["findViolations"];}});
Object.defineProperty(__exports,"normalizeTasks",{enumerable:true,get:function(){return __m1["normalizeTasks"];}});
Object.defineProperty(__exports,"normalizeDependencies",{enumerable:true,get:function(){return __m1["normalizeDependencies"];}});
Object.defineProperty(__exports,"topoOrder",{enumerable:true,get:function(){return __m1["topoOrder"];}});
Object.defineProperty(__exports,"LINK_TYPES",{enumerable:true,get:function(){return __m1["LINK_TYPES"];}});
Object.defineProperty(__exports,"SCHEDULE_ERROR",{enumerable:true,get:function(){return __m1["SCHEDULE_ERROR"];}});
Object.defineProperty(__exports,"EPS",{enumerable:true,get:function(){return __m1["EPS"];}});
Object.defineProperty(__exports,"toDayNumber",{enumerable:true,get:function(){return __m5["toDayNumber"];}});
Object.defineProperty(__exports,"fromDayNumber",{enumerable:true,get:function(){return __m5["fromDayNumber"];}});
Object.defineProperty(__exports,"toISODate",{enumerable:true,get:function(){return __m5["toISODate"];}});
Object.defineProperty(__exports,"importMSPDI",{enumerable:true,get:function(){return __m4["importMSPDI"];}});
Object.defineProperty(__exports,"exportMSPDI",{enumerable:true,get:function(){return __m4["exportMSPDI"];}});
Object.defineProperty(__exports,"computeEarnedValue",{enumerable:true,get:function(){return __m3["computeEarnedValue"];}});
const GANTT_STATE_VERSION=1;
function rowKeyTypeName(v){
if(Array.isArray(v))return'array';
if(v===null)return'null';
return typeof v;
}
function assertGanttRowKeyFn(fn){
return(row)=>{
const key=fn(row);
if(typeof key==='string')return key;
if(typeof key==='number'&&Number.isFinite(key))return key;
throw new Error(
`lattice-gantt: rowKey function must return a string or number; got ${rowKeyTypeName(key)}.`,
);
};
}
function emitter(){
const map=new Map();
return{
on(event,fn){
if(typeof fn!=='function')return()=>{};
if(!map.has(event))map.set(event,new Set());
map.get(event).add(fn);
return()=>map.get(event)?.delete(fn);
},
off(event,fn){map.get(event)?.delete(fn);},
emit(event,payload){for(const fn of map.get(event)??[])fn(payload);},
emitBefore(type,payload){
const set=map.get(type);
const handlers=set?[...set]:[];
let prevented=false;
let reason=null;
const prevent=(r)=>{prevented=true;if(r!=null&&reason===null)reason=String(r);};
const event={
...(payload||null),
type,
get defaultPrevented(){return prevented;},
get reason(){return reason;},
preventDefault(r){prevent(r);},
};
if(handlers.length===0)return true;
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
warnOnce(`gantt.beforeThrow:${type}`,`[lattice] gantt: a '${type}' before-handler threw; the action was cancelled.`,err);
}
}
if(pending.length===0)return settle();
return Promise.allSettled(pending).then((results)=>{
for(const res of results){
if(res.status==='rejected'){
prevent('error');
warnOnce(`gantt.beforeReject:${type}`,`[lattice] gantt: a '${type}' before-handler rejected; the action was cancelled.`,res.reason);
}else if(res.value===false){
prevent('prevented');
}
}
return settle();
});
},
clear(){map.clear();},
};
}
function createGantt(opts={}){
const bus=emitter();
let tasks=Array.isArray(opts.tasks)?opts.tasks.map((t)=>({...t})):[];
let dependencies=Array.isArray(opts.dependencies)?opts.dependencies.map(normalizeLinkSpec):[];
const projectStart=opts.projectStart;
const deadline=opts.deadline;
const calendar=opts.calendar??null;
const planCalendar=createCalendar(calendar,toDayNumber((projectStart))??0);
const isWorkingDay=planCalendar?(day)=>planCalendar.isWorking(day):null;
const resourceCaps=opts.resources??null;
const defaultCapacity=opts.defaultCapacity;
const autoSchedule=!!opts.autoSchedule;
const grid=opts.grid??null;
const columns=opts.columns&&typeof opts.columns==='object'?{...opts.columns}:null;
const fields=isObject(opts.fields)?{...opts.fields}:{};
if(opts.rowKey!==undefined&&typeof opts.rowKey!=='function'
&&!(typeof opts.rowKey==='string'&&opts.rowKey.length>0)){
throw new Error(
'lattice-gantt: rowKey must be a property name or a function; composite keys are not supported on tasks.',
);
}
const rowKeySpec=typeof opts.rowKey==='function'
?assertGanttRowKeyFn(opts.rowKey)
:(opts.rowKey??(typeof fields.id==='string'?fields.id:'id'));
const keyOf=(row)=>String(typeof rowKeySpec==='function'?rowKeySpec(row):row[rowKeySpec]);
if(fields.id===undefined){
fields.id=(raw)=>{
if(raw&&raw.id!=null)return raw.id;
if(!raw)return null;
return typeof rowKeySpec==='function'?rowKeySpec(raw):raw[rowKeySpec];
};
}
const readId=taskIdReader(fields);
const writers=taskFieldWriters(fields);
const writeProp=(field)=>writers[field]||field;
const fieldByCol=new Map();
if(columns)for(const f of['start','end','duration','percentComplete','name'])if(columns[f])fieldByCol.set(columns[f],f);
let schedule=null;
let destroyed=false;
let view=null;
let mountedContainer=null;
let mountedOpts=null;
let mountedKind=null;
const pending=new Set();
const gridOff=[];
function compute(){
const result=computeSchedule(tasks,dependencies,{
projectStart,deadline,calendar,fields,
});
if(result.ok){
const load=computeResourceLoad(tasks,result,{
resources:resourceCaps,defaultCapacity,calendar,fields,
});
result.resourceLoad=load;
result.overAllocations=load.overAllocations;
schedule=result;
bus.emit('schedule',result);
}else{
bus.emit('error',result.error);
}
return result;
}
function gateBefore(beforeName,cancelledName,payload,apply,revalidate){
const cancel=(reason)=>{bus.emit(cancelledName,{...payload,reason});return undefined;};
const decision=bus.emitBefore(beforeName,payload);
if(decision===true)return apply();
if(decision===false)return cancel((payload.reason)||'prevented');
return decision.then((ok)=>{
if(!ok)return cancel((payload.reason)||'prevented');
if(typeof revalidate==='function'&&!revalidate())return cancel('stale');
return apply();
});
}
function indexOf(id){return tasks.findIndex((t)=>String(readId(t))===id);}
function setField(id,field,value){
const i=indexOf(id);
if(i<0)return;
const next={...tasks[i],[writeProp(field)]:value};
tasks=tasks.slice();
tasks[i]=next;
}
function readField(i,field){return tasks[i][writeProp(field)];}
function pushWrites(ids){
if(!grid||!grid.edit||typeof grid.edit.setCells!=='function'||!columns||!schedule||!schedule.ok)return 0;
const writes=[];
for(const id of ids){
const rec=schedule.tasks.get(id);
if(!rec||rec.isSummary)continue;
if(columns.start)writes.push({key:id,colId:columns.start,value:rec.es});
if(columns.end)writes.push({key:id,colId:columns.end,value:rec.ef});
if(columns.duration)writes.push({key:id,colId:columns.duration,value:rec.duration});
}
if(!writes.length)return 0;
for(const w of writes)pending.add([w.key,w.colId].join('\u0001'));
return grid.edit.setCells(writes,'cell');
}
function pushFieldWrites(id,fields){
if(!grid||!grid.edit||typeof grid.edit.setCells!=='function'||!columns)return 0;
const i=indexOf(id);
if(i<0)return 0;
const writes=[];
for(const f of fields){
if(!columns[f])continue;
writes.push({key:id,colId:columns[f],value:readField(i,f)});
}
if(!writes.length)return 0;
for(const w of writes)pending.add([w.key,w.colId].join('\u0001'));
return grid.edit.setCells(writes,'cell');
}
function reconcile(kind,e){
const field=fieldByCol.get(e.colId);
if(!field)return;
const cell=[e.key,e.colId].join('\u0001');
const wasOurs=pending.delete(cell);
const id=String(e.key);
if(kind==='confirmed'){
if(e.value!==undefined&&adopt(id,field,e.value))compute();
}else if(kind==='reverted'&&wasOurs&&e.restored!==undefined){
if(adopt(id,field,e.restored))compute();
}else if(kind==='conflict'&&wasOurs&&e.value!==undefined){
if(adopt(id,field,e.value))compute();
}
}
function adopt(id,field,value){
const i=indexOf(id);
if(i<0)return false;
const current=readField(i,field);
if(current===value||String(current)===String(value))return false;
setField(id,field,value);
return true;
}
if(grid&&typeof grid.on==='function'){
gridOff.push(grid.on('cell:changed',(e)=>reconcile('confirmed',e)));
gridOff.push(grid.on('cell:confirmed',(e)=>reconcile('confirmed',e)));
gridOff.push(grid.on('cell:reverted',(e)=>reconcile('reverted',e)));
gridOff.push(grid.on('cell:conflict',(e)=>reconcile('conflict',e)));
}
compute();
const api={
get tasks(){return tasks.map((t)=>({...t}));},
get dependencies(){return dependencies.map((d)=>({...d}));},
get schedule(){return schedule;},
get critical(){return schedule&&schedule.ok?schedule.critical:[];},
get conflicts(){return schedule&&schedule.ok?(schedule.conflicts||[]):[];},
get autoSchedule(){return autoSchedule;},
get resourceLoad(){return schedule&&schedule.ok?(schedule.resourceLoad||null):null;},
get overAllocations(){return schedule&&schedule.ok?(schedule.overAllocations||[]):[];},
setTasks(next){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: setTasks on a destroyed controller ignored.');return schedule;}
tasks=Array.isArray(next)?next.map((t)=>({...t})):[];
return compute();
},
setDependencies(next){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: setDependencies on a destroyed controller ignored.');return schedule;}
const nextList=Array.isArray(next)?next.map(normalizeLinkSpec):[];
const depKey=(d)=>`${String(d.from)}\u0001${String(d.to)}\u0001${(d.type?String(d.type).toUpperCase():'FS')}`;
const have=new Set(dependencies.map(depKey));
const added=nextList.filter((d)=>!have.has(depKey(d)));
const apply=()=>{dependencies=nextList;return compute();};
if(!added.length)return apply();
return gateBefore(
'beforeDependencyCreate','dependencyCreate:cancelled',
{added,dependencies:nextList,origin:'user'},
apply,
);
},
applyEdit(patch,editOpts={}){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: applyEdit on a destroyed controller ignored.');return schedule;}
const unwritable=isObject(opts.fields)
?['start','end','duration','percentComplete','name']
.filter((f)=>typeof opts.fields[f]==='function')
:[];
if(unwritable.length){
warnOnce(
'gantt-edit-mapped-field',
`[lattice] gantt: this plan reads ${unwritable.join(', ')} through a \`fields\` FUNCTION, which `
+'has no inverse, so applyEdit writes the canonical property name and the edit will not be '
+'read back. Map those fields to a field NAME instead, or edit the host row through your own '
+'writer and feed the result in with rows.apply.',
);
}
const id=patch&&patch.id!=null?String(patch.id):null;
if(indexOf(id)<0){
warnOnce(`gantt-edit-unknown-${id}`,`[lattice] gantt: applyEdit for unknown task "${id}" ignored.`);
return schedule;
}
const patchFields=Object.keys(patch).filter((k)=>k!=='id'&&patch[k]!==undefined);
const otherFields=patchFields.filter((k)=>k!=='start'&&k!=='end'&&k!=='duration');
const task={...tasks[indexOf(id)]};
const rec=schedule&&schedule.ok?schedule.tasks.get(id):null;
const isMilestone=rec?!!rec.isMilestone:!!task.milestone;
const moved=patch.start!==undefined||patch.end!==undefined;
const resized=patch.duration!==undefined;
const progressed=patch.percentComplete!==undefined;
let beforeName='beforeTaskEdit';
let cancelledName='taskEdit:cancelled';
if(isMilestone&&moved){beforeName='beforeMilestoneMove';cancelledName='milestoneMove:cancelled';}
else if(progressed){beforeName='beforeProgressChange';cancelledName='progressChange:cancelled';}
else if(resized){beforeName='beforeTaskResize';cancelledName='taskResize:cancelled';}
else if(moved){beforeName='beforeTaskMove';cancelledName='taskMove:cancelled';}
const priorStart=readField(indexOf(id),'start');
const payload={
id,task,patch:{...patch},origin:'user',
from:priorStart!=null?priorStart:(rec?rec.es:undefined),
to:patch.start,
duration:patch.duration,
value:progressed?patch.percentComplete:undefined,
oldValue:progressed?readField(indexOf(id),'percentComplete'):undefined,
};
const apply=()=>{
const before=schedule&&schedule.ok?new Map([...schedule.tasks].map(([k,v])=>[k,v.es])):new Map();
const retiming=patch.work===undefined&&(moved||resized)&&rec&&!rec.isSummary
?taskContour(tasks[indexOf(id)]):null;
const daysBefore=retiming&&retiming.length?recordWorkingDays(rec,isWorkingDay):null;
for(const f of patchFields)setField(id,f,patch[f]);
const contour=Array.isArray(patch.work)?taskContour({work:patch.work}):null;
if(contour&&patch.start===undefined&&patch.end===undefined&&patch.duration===undefined){
const span=contourSpan(contour);
if(span){
setField(id,'start',span.first);
setField(id,'duration',spanDuration(span.first,span.last,isWorkingDay));
}
}
compute();
let retimed=false;
if(daysBefore&&daysBefore.length&&schedule.ok){
const after=schedule.tasks.get(id);
const daysAfter=after&&!after.isSummary?recordWorkingDays(after,isWorkingDay):[];
if(daysAfter.length){
setField(id,'work',serializeContour(retimeContour(retiming,daysBefore,daysAfter)));
retimed=true;
compute();
}
}
const changed=[id];
if(autoSchedule&&schedule.ok){
for(const other of schedule.order){
if(other===id)continue;
const orec=schedule.tasks.get(other);
if(orec.isSummary)continue;
if(before.get(other)!==orec.es){
setField(other,'start',orec.es);
changed.push(other);
}
}
if(changed.length>1)compute();
}
if(editOpts.writeBack){
pushWrites(changed);
const fieldsOut=retimed&&!otherFields.includes('work')?[...otherFields,'work']:otherFields;
if(fieldsOut.length)pushFieldWrites(id,fieldsOut);
}
return schedule;
};
return gateBefore(beforeName,cancelledName,payload,apply,()=>indexOf(id)>=0);
},
deleteTask(taskId){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: deleteTask on a destroyed controller ignored.');return schedule;}
const id=taskId!=null?String(taskId):null;
if(indexOf(id)<0){
warnOnce(`gantt-delete-unknown-${id}`,`[lattice] gantt: deleteTask for unknown task "${id}" ignored.`);
return schedule;
}
const task={...tasks[indexOf(id)]};
const apply=()=>{
tasks=tasks.filter((t)=>String(t.id)!==id);
dependencies=dependencies.filter((d)=>String(d.from)!==id&&String(d.to)!==id);
return compute();
};
return gateBefore(
'beforeTaskDelete','taskDelete:cancelled',
{id,task,origin:'user'},
apply,()=>indexOf(id)>=0,
);
},
compute,
rows:{
apply(change){
if(destroyed||!change)return{added:[],updated:[],removed:[]};
const index=new Map();
tasks.forEach((t,i)=>index.set(keyOf(t),i));
const next=tasks.slice();
const added=[];
const updated=[];
const removed=[];
for(const row of[...(change.add||[]),...(change.update||[])]){
const k=keyOf(row);
if(index.has(k)){next[index.get(k)]={...next[index.get(k)],...row};updated.push(row);}
else{index.set(k,next.length);next.push({...row});added.push(row);}
}
for(const r of change.remove||[]){
const k=r&&typeof r==='object'?keyOf(r):String(r);
if(index.has(k)){next[index.get(k)]=null;removed.push(k);}
}
tasks=next.filter(Boolean);
compute();
return{added,updated,removed};
},
forEach(fn){
if(typeof fn!=='function')return;
for(const t of tasks)fn(t,keyOf(t));
},
get count(){return tasks.length;},
},
toCSV(csvOpts={}){
if(!schedule||!schedule.ok)return'';
const useDates=!!csvOpts.dates;
const fmt=(day)=>(useDates?(toISODate(day)??String(day)):String(day));
const esc=(v)=>{
const s=v==null?'':String(v);
return/[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
};
const header=['id','name','start','end','duration','percentComplete','totalFloat','critical'];
const lines=[header.join(',')];
for(const id of schedule.order){
const r=schedule.tasks.get(id);
lines.push([r.id,r.name,fmt(r.es),fmt(r.ef),r.duration,
r.percentComplete==null?'':r.percentComplete,r.totalFloat,r.critical].map(esc).join(','));
}
return lines.join('\n');
},
toMSPDI(xmlOpts={}){
return exportMSPDI({
tasks,dependencies,resources:resourceCaps,projectStart,calendar,schedule,
},xmlOpts);
},
findViolations(){return findViolations(tasks,schedule,fields);},
resources(loadOpts={}){
return computeResourceLoad(tasks,schedule,{
resources:loadOpts.resources??resourceCaps,
defaultCapacity:loadOpts.defaultCapacity??defaultCapacity,
calendar,
fields,
});
},
level(levelOpts={}){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: level on a destroyed controller ignored.');return{ok:false};}
if(isObject(opts.fields)&&opts.fields.start!==undefined){
warnOnce(
'gantt-level-mapped-start',
'[lattice] gantt: level() is not available on a plan that maps `fields.start`, because '
+'leveling has to write a new start back and a field mapping only says how to READ one. '
+'Level the plan with its own `start` field, or apply the returned moves yourself.',
);
return{ok:false,error:{code:'mapped-start',message:'level() cannot write back through fields.start'}};
}
const result=levelResources(tasks,dependencies,{
projectStart,deadline,calendar,fields,
resources:levelOpts.resources??resourceCaps,
defaultCapacity:levelOpts.defaultCapacity??defaultCapacity,
priorityField:levelOpts.priorityField,
maxIterations:levelOpts.maxIterations,
});
if(!result.ok)return result;
if(levelOpts.dryRun)return result;
tasks=result.tasks.map((t)=>({...t}));
compute();
if(levelOpts.writeBack&&result.moves&&result.moves.length){
pushWrites(result.moves.map((m)=>m.id));
}
return{...result,schedule};
},
on(event,fn){return bus.on(event,fn);},
off(event,fn){bus.off(event,fn);},
get grid(){return grid;},
get view(){return view;},
mount(container,renderOpts={}){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: mount on a destroyed controller ignored.');return null;}
if(view)view.destroy();
view=new GanttView(api,container,renderOpts);
mountedContainer=container;
mountedOpts={...renderOpts};
mountedKind='plain';
return view;
},
mountSplit(container,splitOpts={}){
if(destroyed){warnOnce('gantt-destroyed','[lattice] gantt: mountSplit on a destroyed controller ignored.');return null;}
if(view){view.destroy();view=null;}
view=new GanttSplitView(api,container,splitOpts);
mountedContainer=container;
mountedOpts={...splitOpts};
mountedKind='split';
return view;
},
captureBaseline(){
if(!schedule||!schedule.ok)return[];
const out=[];
for(const id of schedule.order){
const r=schedule.tasks.get(id);
if(r.isSummary)continue;
out.push({id:r.id,baselineStart:r.es,baselineEnd:r.ef,baselineDuration:r.ef-r.es});
}
return out;
},
earnedValue(evmOpts={}){
return computeEarnedValue(tasks,schedule,evmOpts);
},
getState(){
const kind=mountedKind;
const o=view?view.options:{};
const zoom=(typeof o.zoom==='string'||Number.isFinite(o.zoom))?o.zoom:null;
const calendar=(o.calendar==null||typeof o.calendar==='string'||isObject(o.calendar))
?(o.calendar??null):null;
return{
version:GANTT_STATE_VERSION,
mounted:kind,
zoom,
showArrows:o.showArrows===undefined?true:!!o.showArrows,
showProgress:o.showProgress===undefined?true:!!o.showProgress,
showBaseline:kind==='split'?!!o.showBaseline:null,
calendar,
nonWorking:typeof o.nonWorking==='string'?o.nonWorking:null,
groupBy:(kind==='plain'&&typeof o.groupBy==='string')?o.groupBy:null,
gridWidth:(kind==='split'&&Number.isFinite(o.gridWidth))?o.gridWidth:null,
collapsed:(kind==='split'&&view)?[...view.collapsed]:[],
};
},
setState(snapshot){
const s=isObject(snapshot)?snapshot:{};
if(typeof s.version==='number'&&s.version>GANTT_STATE_VERSION){
warnOnce('gantt-state-version',
`[lattice] gantt: setState received a state from a newer version (${s.version} > ${GANTT_STATE_VERSION}); unrecognised fields are ignored.`);
}
const hasMounted=s.mounted==='plain'||s.mounted==='split'||s.mounted===null;
const targetKind=hasMounted?s.mounted:mountedKind;
if(targetKind!=='plain'&&targetKind!=='split'){
if(view)api.unmount();
return api;
}
if(!mountedContainer){
warnOnce('gantt-state-no-container',
'[lattice] gantt: setState was asked to show a view but no container is known yet; call mount()/mountSplit() at least once first.');
return api;
}
const patch={};
if(typeof s.zoom==='string'||Number.isFinite(s.zoom))patch.zoom=s.zoom;
if(typeof s.showArrows==='boolean')patch.showArrows=s.showArrows;
if(typeof s.showProgress==='boolean')patch.showProgress=s.showProgress;
if(targetKind==='split'&&typeof s.showBaseline==='boolean')patch.showBaseline=s.showBaseline;
if(s.calendar===null||typeof s.calendar==='string'||isObject(s.calendar))patch.calendar=s.calendar;
if(typeof s.nonWorking==='string')patch.nonWorking=s.nonWorking;
if(targetKind==='plain'&&typeof s.groupBy==='string')patch.groupBy=s.groupBy;
if(targetKind==='split'&&Number.isFinite(s.gridWidth))patch.gridWidth=s.gridWidth;
const base=(mountedKind===targetKind&&mountedOpts)?mountedOpts:{};
const merged={...base,...patch};
if(targetKind==='split')api.mountSplit(mountedContainer,merged);
else api.mount(mountedContainer,merged);
if(targetKind==='split'&&Array.isArray(s.collapsed)&&view){
for(const id of new Set(s.collapsed.map(String)))view.toggle(id);
}
return api;
},
unmount(){
if(view){view.destroy();view=null;}
mountedKind=null;
},
destroy(){
destroyed=true;
if(view){view.destroy();view=null;}
mountedContainer=null;
mountedOpts=null;
mountedKind=null;
for(const off of gridOff)off();
gridOff.length=0;
pending.clear();
bus.clear();
},
};
if(opts.element)api.mount(opts.element,opts.render||{});
return api;
}
const __default=createGantt;
});
var __entry=__req("packages/modules/gantt/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridGantt"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);