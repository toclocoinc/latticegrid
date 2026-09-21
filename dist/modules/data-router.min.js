/*!
 * Lattice Grid 1.67.0, data-router module
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
__def("packages/core/src/source/filterwire.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"HOST_FILTER_WARN_ID",{enumerable:true,get:function(){return HOST_FILTER_WARN_ID;}});
Object.defineProperty(__exports,"WHERE_PAGE_RELATIVE_WARN_ID",{enumerable:true,get:function(){return WHERE_PAGE_RELATIVE_WARN_ID;}});
Object.defineProperty(__exports,"warnWherePageRelative",{enumerable:true,get:function(){return warnWherePageRelative;}});
Object.defineProperty(__exports,"warnHostFilterNotApplied",{enumerable:true,get:function(){return warnHostFilterNotApplied;}});
Object.defineProperty(__exports,"WHERE_NOT_APPLIED_WARN_ID",{enumerable:true,get:function(){return WHERE_NOT_APPLIED_WARN_ID;}});
Object.defineProperty(__exports,"warnWhereNotApplied",{enumerable:true,get:function(){return warnWhereNotApplied;}});
Object.defineProperty(__exports,"WHERE_OVER_THRESHOLD_WARN_ID",{enumerable:true,get:function(){return WHERE_OVER_THRESHOLD_WARN_ID;}});
Object.defineProperty(__exports,"warnWhereOverThreshold",{enumerable:true,get:function(){return warnWhereOverThreshold;}});
Object.defineProperty(__exports,"RELATIVE_TOKENS",{enumerable:true,get:function(){return RELATIVE_TOKENS;}});
Object.defineProperty(__exports,"parseRelativeToken",{enumerable:true,get:function(){return parseRelativeToken;}});
Object.defineProperty(__exports,"resolveRelativeRange",{enumerable:true,get:function(){return resolveRelativeRange;}});
Object.defineProperty(__exports,"relativeTokenOf",{enumerable:true,get:function(){return relativeTokenOf;}});
Object.defineProperty(__exports,"relativeTokenHelp",{enumerable:true,get:function(){return relativeTokenHelp;}});
Object.defineProperty(__exports,"isResolvableRelative",{enumerable:true,get:function(){return isResolvableRelative;}});
Object.defineProperty(__exports,"resolveRelativeCondition",{enumerable:true,get:function(){return resolveRelativeCondition;}});
Object.defineProperty(__exports,"isGroup",{enumerable:true,get:function(){return isGroup;}});
Object.defineProperty(__exports,"forEachCondition",{enumerable:true,get:function(){return forEachCondition;}});
Object.defineProperty(__exports,"mapConditions",{enumerable:true,get:function(){return mapConditions;}});
Object.defineProperty(__exports,"normaliseFilterSet",{enumerable:true,get:function(){return normaliseFilterSet;}});
Object.defineProperty(__exports,"buildFilterSet",{enumerable:true,get:function(){return buildFilterSet;}});
Object.defineProperty(__exports,"wireFilters",{enumerable:true,get:function(){return wireFilters;}});
Object.defineProperty(__exports,"querySignature",{enumerable:true,get:function(){return querySignature;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const HOST_FILTER_WARN_ID='source.remote.hostFilter';
const WHERE_PAGE_RELATIVE_WARN_ID='source.where.pageRelative';
function warnWherePageRelative(names,mode){
if(!Array.isArray(names)||!names.length)return;
warnOnce(
WHERE_PAGE_RELATIVE_WARN_ID,
`filters.where (${names.join(', ')}) runs over the rows the ${mode} source fetched,`,
'not the whole dataset: match counts and totals are page-relative.',
'Give the predicate a { condition } twin so the engine can narrow the fetch itself.',
);
}
function warnHostFilterNotApplied(ctx){
const host=(ctx||{}).config;
if(!host||!host.hostFilter)return;
warnOnce(
HOST_FILTER_WARN_ID,
'config.hostFilter is not sent to a server-delegated source (paged/remote) and is not applied:',
'filtering only the fetched window would give wrong counts and totals.',
'Express the filter as a FilterSet condition, or send it through config.context.',
);
}
const WHERE_NOT_APPLIED_WARN_ID='source.where.notApplied';
function warnWhereNotApplied(name,mode){
warnOnce(
`${WHERE_NOT_APPLIED_WARN_ID}:${name}`,
`filters.where("${name}") is registered but the ${mode} source holds only its fetched window`,
'and cannot run the predicate over it: the predicate is not applied there, and rows it would',
'exclude stay on screen.',
'Give it a { condition } twin so the engine can narrow the fetch itself — that is the',
'supported route for a paged or remote source.',
);
}
const WHERE_OVER_THRESHOLD_WARN_ID='source.where.overThreshold';
function warnWhereOverThreshold(names,adapter,size,limit){
if(!Array.isArray(names)||!names.length)return;
warnOnce(
`${WHERE_OVER_THRESHOLD_WARN_ID}:${adapter}`,
`filters.where (${names.join(', ')}) is not applied to the ${adapter} pushdown source:`,
size===null
?'the adapter reports no row total, so the size of the matching set is unknown.'
:`its matching set is ${size.toLocaleString()} rows, at or past the whereRowLimit of `
+`${limit.toLocaleString()}.`,
'Running the predicate needs every matching row fetched and held here, which is the whole',
'download a pushdown source exists to avoid, so it is refused and the rows the predicate',
'would exclude stay on screen.',
'Give the predicate a { condition } twin so the engine narrows the fetch itself — that is the',
'route that works at any size — or raise `whereRowLimit` on the source config if you want the',
'download.',
);
}
const zoneFormatters=new Map();
function zoneFormatter(tz){
let f=zoneFormatters.get(tz);
if(!f){
f=new Intl.DateTimeFormat('en-US',{
timeZone:tz,
hourCycle:'h23',
year:'numeric',
month:'2-digit',
day:'2-digit',
hour:'2-digit',
minute:'2-digit',
second:'2-digit',
});
zoneFormatters.set(tz,f);
}
return f;
}
function localZone(){
try{
return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
}catch{
return'UTC';
}
}
function partsIn(ms,tz){
const parts=zoneFormatter(tz).formatToParts(new Date(ms));
const out={y:1970,m:1,d:1,h:0,mi:0,s:0};
for(const p of parts){
if(p.type==='year')out.y=+p.value;
else if(p.type==='month')out.m=+p.value;
else if(p.type==='day')out.d=+p.value;
else if(p.type==='hour')out.h=+p.value%24;
else if(p.type==='minute')out.mi=+p.value;
else if(p.type==='second')out.s=+p.value;
}
return out;
}
function zoneOffset(ms,tz){
const p=partsIn(ms,tz);
const asUtc=Date.UTC(p.y,p.m-1,p.d,p.h,p.mi,p.s);
return asUtc-Math.floor(ms/1000)*1000;
}
function startOfLocalDay(y,m,d,tz){
const naive=Date.UTC(y,m-1,d);
const first=naive-zoneOffset(naive,tz);
const second=naive-zoneOffset(first,tz);
return second;
}
function localDayPlus(date,n,tz){
const shifted=new Date(Date.UTC(date.y,date.m-1,date.d+n));
return startOfLocalDay(
shifted.getUTCFullYear(),shifted.getUTCMonth()+1,shifted.getUTCDate(),tz,
);
}
const RELATIVE_TOKENS=Object.freeze([
'today',
'yesterday',
'lastNDays',
'thisWeek',
'thisMonth',
'thisQuarter',
'thisYear',
'quarterToDate',
'yearToDate',
]);
function parseRelativeToken(token,fallbackN){
if(typeof token!=='string')return null;
const flat=token.trim().toLowerCase().replace(/[\s_-]+/g,'');
const counted=/^last(\d*|n)days?$/.exec(flat);
if(counted){
const digits=counted[1]==='n'?'':counted[1];
const n=digits?Number(digits):Number(fallbackN);
if(!Number.isFinite(n)||n<=0)return null;
return{kind:'lastNDays',n:Math.floor(n)};
}
switch(flat){
case'today':return{kind:'today',n:0};
case'yesterday':return{kind:'yesterday',n:0};
case'thisweek':return{kind:'thisWeek',n:0};
case'thismonth':return{kind:'thisMonth',n:0};
case'thisquarter':return{kind:'thisQuarter',n:0};
case'thisyear':return{kind:'thisYear',n:0};
case'quartertodate':case'qtd':return{kind:'quarterToDate',n:0};
case'yeartodate':case'ytd':return{kind:'yearToDate',n:0};
default:return null;
}
}
function resolveRelativeRange(token,opts={}){
const parsed=parseRelativeToken(token,opts.n);
if(!parsed)return null;
const tz=opts.tz||localZone();
const nowMs=opts.now instanceof Date?opts.now.getTime()
:typeof opts.now==='number'?opts.now:Date.now();
const today=partsIn(nowMs,tz);
const startToday=startOfLocalDay(today.y,today.m,today.d,tz);
const startTomorrow=localDayPlus(today,1,tz);
let from=startToday;
let to=startTomorrow;
switch(parsed.kind){
case'today':
break;
case'yesterday':
from=localDayPlus(today,-1,tz);
to=startToday;
break;
case'lastNDays':
to=opts.includeToday?startTomorrow:startToday;
from=localDayPlus(today,opts.includeToday?-(parsed.n-1):-parsed.n,tz);
break;
case'thisWeek':{
const startsOn=Number.isFinite(opts.weekStartsOn)?Number(opts.weekStartsOn):1;
const dow=new Date(Date.UTC(today.y,today.m-1,today.d)).getUTCDay();
const back=(dow-startsOn+7)%7;
from=localDayPlus(today,-back,tz);
to=localDayPlus(today,-back+7,tz);
break;
}
case'thisMonth':
from=startOfLocalDay(today.y,today.m,1,tz);
to=startOfLocalDay(today.m===12?today.y+1:today.y,today.m===12?1:today.m+1,1,tz);
break;
case'thisQuarter':
case'quarterToDate':{
const qStart=Math.floor((today.m-1)/3)*3+1;
from=startOfLocalDay(today.y,qStart,1,tz);
to=parsed.kind==='quarterToDate'
?startTomorrow
:(qStart===10
?startOfLocalDay(today.y+1,1,1,tz)
:startOfLocalDay(today.y,qStart+3,1,tz));
break;
}
case'thisYear':
case'yearToDate':
from=startOfLocalDay(today.y,1,1,tz);
to=parsed.kind==='yearToDate'?startTomorrow:startOfLocalDay(today.y+1,1,1,tz);
break;
default:
return null;
}
return{
from:new Date(from).toISOString(),
to:new Date(to).toISOString(),
bounds:'[)',
tz,
relative:parsed.kind==='lastNDays'?`last${parsed.n}Days`:parsed.kind,
n:parsed.n,
};
}
function relativeTokenOf(condition){
if(!condition||typeof condition!=='object')return null;
const value=(condition.value);
if(value&&typeof value==='object'&&!Array.isArray(value)&&'relative'in value){
return{token:String(value.relative),n:typeof value.n==='number'?value.n:undefined};
}
if(condition.op==='relative'&&typeof condition.value==='string'){
return{token:condition.value,n:undefined};
}
const meta=condition.meta;
if(meta&&typeof meta.relative==='string'&&condition.value===undefined){
return{token:meta.relative,n:typeof meta.n==='number'?meta.n:undefined};
}
return null;
}
function relativeTokenHelp(){
const plain=RELATIVE_TOKENS.filter((token)=>token!=='lastNDays');
return`Known tokens: ${plain.join(', ')}. "lastNDays" needs a count: pass "last7Days", `
+"or the value object { relative: 'lastNDays', n: 7 }.";
}
function isResolvableRelative(condition){
const found=relativeTokenOf(condition);
if(!found)return false;
return parseRelativeToken(found.token,found.n)!==null;
}
function resolveRelativeCondition(condition,opts={}){
const found=relativeTokenOf(condition);
if(!found)return condition;
const range=resolveRelativeRange(found.token,{...opts,n:found.n});
if(!range){
warnOnce(
`source.relative.${found.token}`,
`unknown relative date token "${found.token}"; sending the condition unresolved.`,
relativeTokenHelp(),
);
return condition;
}
return{
...condition,
type:condition.type||'date',
op:'between',
value:[range.from,range.to],
bounds:condition.bounds||range.bounds,
meta:{...(condition.meta||{}),relative:range.relative,tz:range.tz},
};
}
function isGroup(node){
return!!node&&typeof node==='object'&&Array.isArray((node).conditions);
}
function forEachCondition(filters,visit){
if(!filters)return;
if(isGroup(filters)){
for(const child of(filters).conditions)forEachCondition(child,visit);
return;
}
visit((filters));
}
function mapConditions(filters,fn){
if(!filters)return null;
if(!isGroup(filters))return fn((filters));
const group=(filters);
let changed=false;
const out=[];
for(const child of group.conditions){
const mapped=mapConditions(child,fn);
if(mapped!==child)changed=true;
if(mapped)out.push(mapped);
}
if(!changed&&out.length===group.conditions.length)return filters;
return out.length?{...group,conditions:out}:null;
}
function prune(filters){
if(!filters)return null;
if(!isGroup(filters))return filters;
const group=(filters);
const kept=[];
for(const child of group.conditions){
const p=prune(child);
if(p)kept.push(p);
}
return kept.length?{op:group.op,conditions:kept}:null;
}
function normaliseFilterSet(filters){
const pruned=prune(filters);
if(!pruned)return null;
if(isGroup(pruned)&&(pruned).op==='and'){
return(pruned);
}
return{op:'and',conditions:[pruned]};
}
function buildFilterSet(conditions){
const list=(conditions||[]).filter(Boolean);
return list.length?{op:'and',conditions:list}:null;
}
function wireFilters(filters,opts={}){
const resolved=mapConditions(filters,(c)=>resolveRelativeCondition(c,opts));
return normaliseFilterSet(resolved);
}
function querySignature(query){
const filterKey=signFilters(query.filters??null);
return JSON.stringify([
filterKey,
query.sort??null,
query.quick??'',
query.groupBy??null,
query.pivotBy??null,
safeContext(query.context),
]);
}
function signFilters(filters){
if(!filters)return null;
if(isGroup(filters)){
const g=(filters);
return{op:g.op,conditions:g.conditions.map(signFilters)};
}
const c=(filters);
const token=c.meta&&typeof c.meta.relative==='string'?c.meta.relative:relativeTokenOf(c)?.token;
return{
col:c.col,
op:c.op,
bounds:c.bounds??null,
caseSensitive:c.caseSensitive??false,
value:token?`rel:${token}`:c.value??null,
};
}
function safeContext(context){
if(context===undefined||context===null)return null;
try{
return JSON.parse(JSON.stringify(context));
}catch{
warnOnce('source.context.unserialisable','config.context is not JSON-serialisable; cache keys ignore it.');
return'[unserialisable]';
}
}
});
__def("packages/core/src/source/aggregates.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"STAT_PUSHDOWN",{enumerable:true,get:function(){return STAT_PUSHDOWN;}});
Object.defineProperty(__exports,"pushableAggregates",{enumerable:true,get:function(){return pushableAggregates;}});
Object.defineProperty(__exports,"fillAggregateSql",{enumerable:true,get:function(){return fillAggregateSql;}});
Object.defineProperty(__exports,"resolveAggregatesConfig",{enumerable:true,get:function(){return resolveAggregatesConfig;}});
Object.defineProperty(__exports,"routeAggregate",{enumerable:true,get:function(){return routeAggregate;}});
Object.defineProperty(__exports,"resolveAggregatePlan",{enumerable:true,get:function(){return resolveAggregatePlan;}});
Object.defineProperty(__exports,"groupKeysPushable",{enumerable:true,get:function(){return groupKeysPushable;}});
Object.defineProperty(__exports,"pushdownDocRows",{enumerable:true,get:function(){return pushdownDocRows;}});
const STAT_PUSHDOWN=Object.freeze({
sum:{pushable:true,class:'identical',sql:'sum(%c)'},
avg:{pushable:true,class:'identical',sql:'avg(%c)'},
min:{pushable:true,class:'identical',sql:'min(%c)'},
max:{pushable:true,class:'identical',sql:'max(%c)'},
count:{pushable:true,class:'identical',sql:'count(*)'},
countValues:{pushable:true,class:'identical',sql:'count(%c)',blankAware:true},
range:{pushable:true,class:'identical',sql:'(max(%c) - min(%c))'},
variance:{pushable:true,class:'identical',sql:'var_samp(%c)'},
varianceP:{pushable:true,class:'identical',sql:'var_pop(%c)'},
stddev:{pushable:true,class:'identical',sql:'stddev_samp(%c)'},
stddevP:{pushable:true,class:'identical',sql:'stddev_pop(%c)'},
sumSquares:{pushable:true,class:'identical',sql:'sum(%c * %c)'},
median:{pushable:true,class:'identical',sql:'median(%c)'},
p25:{pushable:true,class:'identical',sql:'quantile_cont(%c, 0.25)'},
p75:{pushable:true,class:'identical',sql:'quantile_cont(%c, 0.75)'},
p90:{pushable:true,class:'identical',sql:'quantile_cont(%c, 0.9)'},
p95:{pushable:true,class:'identical',sql:'quantile_cont(%c, 0.95)'},
p99:{pushable:true,class:'identical',sql:'quantile_cont(%c, 0.99)'},
iqr:{
pushable:true,class:'identical',
sql:'(quantile_cont(%c, 0.75) - quantile_cont(%c, 0.25))',
},
mad:{pushable:true,class:'identical',sql:'mad(%c)'},
distinct:{pushable:true,class:'identical',sql:'count(DISTINCT %c)',blankAware:true},
skewness:{pushable:true,class:'identical',sql:'skewness(%c)'},
kurtosis:{pushable:true,class:'identical',sql:'kurtosis(%c)'},
geomean:{pushable:true,class:'identical',sql:'exp(avg(ln(%c)))'},
harmean:{pushable:true,class:'identical',sql:'(count(%c) / sum(1.0 / %c))'},
entropy:{pushable:true,class:'identical',sql:'entropy(%c)',blankAware:true},
correlation:{
pushable:true,class:'identical',sql:'corr(%w, %c)',twoColumn:true,
},
hhi:{
pushable:true,class:'identical',blankAware:true,
sql:'CASE WHEN count(%c)=0 THEN NULL ELSE list_sum(list_transform('
+'map_values(histogram(%c)), lambda v: (v::DOUBLE/count(%c))*(v::DOUBLE/count(%c)))) END',
},
evenness:{
pushable:true,class:'identical',blankAware:true,
sql:'CASE WHEN count(%c)=0 THEN NULL WHEN count(DISTINCT %c)<2 THEN 1.0 '
+'ELSE entropy(%c)/log2(count(DISTINCT %c)) END',
},
top3Share:{
pushable:true,class:'identical',blankAware:true,
sql:'CASE WHEN count(%c)=0 THEN NULL ELSE '
+"list_sum(list_slice(list_sort(map_values(histogram(%c)),'DESC'),1,3))::DOUBLE/count(%c) END",
},
top10Share:{
pushable:true,class:'identical',blankAware:true,
sql:'CASE WHEN count(%c)=0 THEN NULL ELSE '
+"list_sum(list_slice(list_sort(map_values(histogram(%c)),'DESC'),1,10))::DOUBLE/count(%c) END",
},
gini:{
pushable:true,class:'identical',
sql:'CASE WHEN list_min(list(%c) FILTER (WHERE isfinite(%c)))<0 THEN NULL '
+'WHEN len(list(%c) FILTER (WHERE isfinite(%c)))=0 THEN NULL '
+'WHEN list_sum(list(%c) FILTER (WHERE isfinite(%c)))=0 THEN 0 ELSE '
+'2.0*list_sum(list_transform(list_sort(list(%c) FILTER (WHERE isfinite(%c))), lambda v, i: i*v))'
+'/(len(list(%c) FILTER (WHERE isfinite(%c)))*list_sum(list(%c) FILTER (WHERE isfinite(%c))))'
+'-(len(list(%c) FILTER (WHERE isfinite(%c)))+1.0)/len(list(%c) FILTER (WHERE isfinite(%c))) END',
},
trimmedMean:{
pushable:true,class:'identical',
sql:'CASE WHEN len(list(%c) FILTER (WHERE isfinite(%c)))=0 THEN NULL ELSE '
+'list_avg(list_slice(list_sort(list(%c) FILTER (WHERE isfinite(%c))), '
+'floor(len(list(%c) FILTER (WHERE isfinite(%c)))*0.1)::BIGINT+1, '
+'len(list(%c) FILTER (WHERE isfinite(%c)))-floor(len(list(%c) FILTER (WHERE isfinite(%c)))*0.1)::BIGINT)) END',
},
winsorizedMean:{
pushable:true,class:'identical',
sql:'CASE WHEN len(list(%c) FILTER (WHERE isfinite(%c)))=0 THEN NULL ELSE '
+'list_avg(list_transform(list_sort(list(%c) FILTER (WHERE isfinite(%c))), lambda v: '
+'least(list_sort(list(%c) FILTER (WHERE isfinite(%c)))'
+'[len(list(%c) FILTER (WHERE isfinite(%c)))-floor(len(list(%c) FILTER (WHERE isfinite(%c)))*0.1)::BIGINT], '
+'greatest(list_sort(list(%c) FILTER (WHERE isfinite(%c)))'
+'[floor(len(list(%c) FILTER (WHERE isfinite(%c)))*0.1)::BIGINT+1], v)))) END',
},
robustOutliers:{
pushable:true,class:'identical',
sql:'(SELECT CASE WHEN len(d.a)=0 THEN NULL WHEN d.mad=0 THEN NULL ELSE '
+'len(list_filter(d.a, lambda v: abs(0.6745*(v-d.med)/d.mad)>3.5)) END FROM '
+'(SELECT xs AS a, list_median(xs) AS med, '
+'list_median(list_transform(xs, lambda w: abs(w-list_median(xs)))) AS mad '
+'FROM (SELECT list(%c) FILTER (WHERE isfinite(%c)) AS xs)) d)',
},
jarqueBera:{
pushable:true,class:'identical',
sql:'CASE WHEN len(list(%c) FILTER (WHERE isfinite(%c)))<8 THEN NULL '
+'WHEN list_avg(list_transform(list(%c) FILTER (WHERE isfinite(%c)), '
+'lambda v: power(v-list_avg(list(%c) FILTER (WHERE isfinite(%c))),2)))=0 THEN NULL ELSE '
+'(len(list(%c) FILTER (WHERE isfinite(%c)))/6.0)*('
+'power(list_avg(list_transform(list(%c) FILTER (WHERE isfinite(%c)), lambda v: power(v-list_avg(list(%c) FILTER (WHERE isfinite(%c))),3)))'
+'/power(list_avg(list_transform(list(%c) FILTER (WHERE isfinite(%c)), lambda v: power(v-list_avg(list(%c) FILTER (WHERE isfinite(%c))),2))),1.5),2)'
+'+power(list_avg(list_transform(list(%c) FILTER (WHERE isfinite(%c)), lambda v: power(v-list_avg(list(%c) FILTER (WHERE isfinite(%c))),4)))'
+'/power(list_avg(list_transform(list(%c) FILTER (WHERE isfinite(%c)), lambda v: power(v-list_avg(list(%c) FILTER (WHERE isfinite(%c))),2))),2)-3,2)/4.0) END',
},
weightedAvg:{
pushable:true,class:'identical',twoColumn:true,
sql:'sum(%c*%w) FILTER (WHERE isfinite(%c) AND isfinite(%w))'
+'/nullif(sum(%w) FILTER (WHERE isfinite(%c) AND isfinite(%w)),0)',
},
mode:{
pushable:true,class:'may-differ',sql:'mode(%c)',
note:'DuckDB returns a modal value even for an all-distinct column; the grid '
+'returns null. Tie-breaking can also differ, and on a text column an empty '
+'string counts as a value. Under pushdown you will see a value.',
},
weightedQuantile:{
pushable:false,class:'fallback',
note:'No SQL equivalent for the grid\'s weighted-quantile midpoint convention; '
+'always computed client-side (needs a full-dataset pull for a correct figure '
+'over a remote source).',
},
});
function pushableAggregates(){
const set=new Set();
for(const[name,spec]of Object.entries(STAT_PUSHDOWN))if(spec.pushable)set.add(name);
return set;
}
function fillAggregateSql(template,colExpr,weightExpr){
let out=template.split('%c').join(colExpr);
if(weightExpr!==undefined)out=out.split('%w').join(weightExpr);
return out;
}
function resolveAggregatesConfig(declared){
const cfg=declared||{};
const def=cfg.default==='engine'||cfg.default==='engine-if-identical'
?cfg.default:'client';
const overrides={};
if(cfg.overrides&&typeof cfg.overrides==='object'){
for(const[name,mode]of Object.entries(cfg.overrides)){
if(mode==='engine'||mode==='client')overrides[name]=mode;
}
}
return{default:def,overrides};
}
function routeAggregate(fn,config){
const spec=STAT_PUSHDOWN[fn];
if(!spec||!spec.pushable)return'client';
const override=config.overrides[fn];
if(override==='engine'||override==='client')return override;
if(config.default==='client')return'client';
if(config.default==='engine-if-identical'){
return spec.class==='identical'?'engine':'client';
}
return'engine';
}
function resolveAggregatePlan(requested,declared){
const config=resolveAggregatesConfig(declared);
const engine=[];
const client=[];
for(const agg of requested||[]){
const spec=STAT_PUSHDOWN[agg.fn];
const where=routeAggregate(agg.fn,config);
const record={
id:agg.id,
col:agg.col,
fn:agg.fn,
class:spec?spec.class:'fallback',
};
if(agg.weight!==undefined)record.weight=agg.weight;
if(agg.params!==undefined)record.params=agg.params;
if(where==='engine'){
engine.push(record);
}else{
record.reason=spec&&!spec.pushable
?(spec.note||'the engine cannot express this stat')
:'client by config';
client.push(record);
}
}
return{engine,client,config};
}
const PLAIN_IDENTIFIER=/^[A-Za-z_][A-Za-z0-9_$]*$/;
function groupKeysPushable(groupBy){
const keys=groupBy||[];
return keys.every((key)=>typeof key==='string'&&PLAIN_IDENTIFIER.test(key));
}
function pushdownDocRows(){
return Object.entries(STAT_PUSHDOWN).map(([stat,spec])=>({
stat,
class:spec.class,
sql:spec.sql?fillAggregateSql(spec.sql,'col',spec.twoColumn?'weight':undefined):'',
note:spec.note||(spec.class==='identical'
?'Pushes to DuckDB with the same result.':''),
}));
}
});
__def("packages/core/src/source/pushdown.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"NO_CAPABILITIES",{enumerable:true,get:function(){return NO_CAPABILITIES;}});
Object.defineProperty(__exports,"resolveMutate",{enumerable:true,get:function(){return resolveMutate;}});
Object.defineProperty(__exports,"capabilitiesOf",{enumerable:true,get:function(){return capabilitiesOf;}});
Object.defineProperty(__exports,"splitFilters",{enumerable:true,get:function(){return splitFilters;}});
Object.defineProperty(__exports,"planQuery",{enumerable:true,get:function(){return planQuery;}});
Object.defineProperty(__exports,"applyResidual",{enumerable:true,get:function(){return applyResidual;}});
Object.defineProperty(__exports,"DEFAULT_WHERE_ROW_LIMIT",{enumerable:true,get:function(){return DEFAULT_WHERE_ROW_LIMIT;}});
Object.defineProperty(__exports,"createPushdownSource",{enumerable:true,get:function(){return createPushdownSource;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/core/src/source/filterwire.js");
const isGroup=__m1["isGroup"];
const warnWherePageRelative=__m1["warnWherePageRelative"];
const warnWhereOverThreshold=__m1["warnWhereOverThreshold"];
const __m2=__req("packages/core/src/source/aggregates.js");
const resolveAggregatePlan=__m2["resolveAggregatePlan"];
const groupKeysPushable=__m2["groupKeysPushable"];
const STAT_PUSHDOWN=__m2["STAT_PUSHDOWN"];
const NO_CAPABILITIES=Object.freeze({
filter:false,
operators:Object.freeze([]),
sort:false,
quick:false,
range:false,
total:false,
group:false,
mutate:false,
});
function resolveMutate(declared){
if(!declared||typeof declared!=='object')return false;
const returning=declared.returning==='row'||declared.returning==='key'
?declared.returning:'none';
return{
append:declared.append===true,
update:declared.update===true,
delete:declared.delete===true,
returning,
};
}
function readPath(row,path){
if(!row||typeof path!=='string')return undefined;
if(!path.includes('.'))return(row)[path];
let cursor=row;
for(const part of path.split('.')){
if(cursor===null||typeof cursor!=='object')return undefined;
cursor=(cursor)[part];
}
return cursor;
}
function wantsEdit(edit){
if(edit===true)return true;
if(!edit||typeof edit!=='object')return false;
const any=(edit);
if(any.enabled===false)return false;
return any.enabled===true||isFunction(any.commit);
}
function capabilitiesOf(declared){
const caps={...NO_CAPABILITIES,...(declared||{})};
caps.operators=new Set(caps.operators||[]);
caps.mutate=resolveMutate(caps.mutate);
return caps;
}
function conditionPushable(condition,caps){
if(!condition||!condition.op)return false;
if(!caps.operators.size)return false;
return caps.operators.has(condition.op);
}
function splitFilters(filters,caps){
if(!filters)return{pushed:null,residual:null};
if(!caps.filter)return{pushed:null,residual:filters};
if(caps.filter==='term'){
if(isGroup(filters)){
const conditions=filters.conditions||[];
if(String(filters.op)!=='and')return{pushed:null,residual:filters};
const at=conditions.findIndex((c)=>!isGroup(c)&&conditionPushable(c,caps));
if(at<0)return{pushed:null,residual:filters};
const rest=conditions.filter((unused,i)=>i!==at);
return{
pushed:conditions[at],
residual:rest.length?{op:'and',conditions:rest}:null,
};
}
return conditionPushable(filters,caps)
?{pushed:filters,residual:null}
:{pushed:null,residual:filters};
}
if(!isGroup(filters)){
return conditionPushable(filters,caps)
?{pushed:filters,residual:null}
:{pushed:null,residual:filters};
}
if(String(filters.op)!=='and'){
const everyBranch=(filters.conditions||[])
.every((c)=>(isGroup(c)?splitFilters(c,caps).residual===null:conditionPushable(c,caps)));
return everyBranch?{pushed:filters,residual:null}:{pushed:null,residual:filters};
}
const pushed=[];
const residual=[];
for(const condition of filters.conditions||[]){
if(isGroup(condition)){
if(caps.filter==='flat'){residual.push(condition);continue;}
const inner=splitFilters(condition,caps);
if(inner.pushed)pushed.push(inner.pushed);
if(inner.residual)residual.push(inner.residual);
continue;
}
(conditionPushable(condition,caps)?pushed:residual).push(condition);
}
const group=(list)=>(list.length===0?null
:(list.length===1?list[0]:{op:'and',conditions:list}));
return{pushed:group(pushed),residual:group(residual)};
}
function groupRefusal(request,caps,filters,sortPushable,quickPushable,where,full){
const groupBy=Array.isArray(request.groupBy)?request.groupBy:[];
const groupPath=Array.isArray(request.groupPath)?request.groupPath:[];
const groupValues=Array.isArray(request.groupValues)?request.groupValues:null;
if(!caps.group)return'the adapter does not declare the `group` capability';
if(!groupKeysPushable(groupBy)){
return'a grouping key is not a plain column the engine can name in a GROUP BY';
}
if(filters.residual){
return'the filter did not fully push, so the engine would group a superset of the matching rows';
}
if(!sortPushable)return'the sort did not push, so the engine would order the groups differently';
if(!quickPushable)return'a quick search did not push, so the engine would group unsearched rows';
if(where)return'a host `where` predicate can only run in the browser, over rows the engine grouped';
if(full)return'fullDataset holds the whole matching set, so the grid groups it itself';
if(!groupValues||groupValues.length!==groupPath.length){
return'the request carries no typed `groupValues` for its group path, and the string `groupPath` '
+'cannot be compared against a typed column';
}
return'';
}
function planQuery(request,caps,fullDataset=false){
const filters=splitFilters(request.filters||null,caps);
const unpushed=[];
if(filters.residual)unpushed.push('filter');
const wanted=request.sort||[];
const sortPushable=wanted.length===0
||(caps.sort==='multi'&&wanted.length>=1)
||(caps.sort==='single'&&wanted.length===1);
if(!sortPushable&&wanted.length)unpushed.push('sort');
const quick=request.quick?String(request.quick):'';
const quickPushable=!quick||!!caps.quick;
if(!quickPushable)unpushed.push('quick');
const where=request.where&&request.where.active?request.where:null;
if(where)unpushed.push('where');
const residual={
filters:filters.residual,
sort:sortPushable?null:wanted,
quick:quickPushable?'':quick,
where,
};
const full=!!fullDataset;
const wantsGroup=Array.isArray(request.groupBy)&&request.groupBy.length>0;
const groupReason=wantsGroup
?groupRefusal(request,caps,filters,sortPushable,quickPushable,where,full):'';
const grouped=wantsGroup&&groupReason==='';
if(wantsGroup&&!grouped)unpushed.push('group');
const groupLevel=grouped&&Array.isArray(request.groupValues)?request.groupValues.length:0;
const needsAll=grouped?false:(full
||!!(residual.filters||residual.sort||residual.quick||residual.where)
||!caps.range);
const pushed={
...request,
filters:filters.pushed,
sort:sortPushable?wanted:[],
quick:quickPushable?quick:'',
range:needsAll?null:request.range,
};
return{
pushed,residual,needsAll,unpushed,full,grouped,groupLevel,groupReason,
};
}
function planGroupTotals(pushed){
const totals=Array.isArray(pushed.totals)?pushed.totals:[];
const fns=pushed.totalFns&&typeof pushed.totalFns==='object'?pushed.totalFns:{};
const engine=[];
const client=[];
for(const raw of totals){
const id=String(raw);
const fn=typeof fns[id]==='string'?fns[id]:null;
const spec=fn?STAT_PUSHDOWN[fn]:null;
if(!fn){
client.push({
id,
fn:null,
class:'fallback',
reason:'the column totals with a host function, so there is no named statistic to push',
});
}else if(!spec||!spec.pushable||!spec.sql){
client.push({
id,
fn,
class:spec?spec.class:'fallback',
reason:spec&&spec.note?spec.note:`the pushdown map cannot express "${fn}"`,
});
}else if(spec.twoColumn){
client.push({
id,
fn,
class:spec.class,
reason:`"${fn}" reduces two columns, and a grouped request carries no weight column`,
});
}else{
engine.push({
id,col:id,fn,class:spec.class,
});
}
}
return{engine,client};
}
function applyResidual(rows,residual,compute){
if(!residual)return rows;
let out=rows;
if(residual.filters&&isFunction(compute.evaluateFilters)){
const ctx={
count:out.length,
handle:(col)=>({id:col,get:(i)=>readPath(out[i],col)}),
};
const mask=compute.evaluateFilters(residual.filters,ctx);
const kept=[];
for(let i=0;i<out.length;i++)if(mask[i])kept.push(out[i]);
out=kept;
}
if(residual.where&&residual.where.active){
if(!residual.whole)warnWherePageRelative(residual.where.names,'pushdown');
out=out.filter((row)=>residual.where.passes(row));
}
if(residual.quick){
const needle=residual.quick.toLowerCase();
out=out.filter((row)=>{
if(!row||typeof row!=='object')return false;
for(const value of Object.values((row))){
if(value!==null&&value!==undefined
&&String(value).toLowerCase().includes(needle))return true;
}
return false;
});
}
if(residual.sort&&residual.sort.length&&isFunction(compute.sortMulti)){
const columns=[...new Set(residual.sort.map((entry)=>entry.col))];
const view=out;
const handles=columns.map((col)=>({id:col,get:(i)=>readPath(view[i],col)}));
const order=compute.sortMulti(
handles,
residual.sort.map((entry)=>({col:entry.col,dir:entry.dir})),
Uint32Array.from({length:out.length},(unused,i)=>i),
{},
);
out=Array.from(order,(i)=>view[i]);
}
return out;
}
function planKey(pushed){
return JSON.stringify({
filters:pushed.filters||null,
sort:pushed.sort||[],
quick:pushed.quick||'',
groupBy:pushed.groupBy||[],
groupPath:pushed.groupPath||[],
context:pushed.context??null,
});
}
function estimateRowBytes(row){
if(!row||typeof row!=='object')return 16;
let text='';
try{text=JSON.stringify(row);}catch{return 200;}
return text.length*2+64;
}
function resolveFullDataset(declared){
const cfg=declared||{};
return{
enabled:!!cfg.enabled,
maxRows:Number.isFinite(cfg.maxRows)?cfg.maxRows:1_000_000,
maxBytesEstimate:Number.isFinite(cfg.maxBytesEstimate)
?cfg.maxBytesEstimate:512*1024*1024,
};
}
const DEFAULT_WHERE_ROW_LIMIT=50_000;
function resolveWhereRowLimit(declared){
return Number.isFinite(declared)&&(declared)>=0
?(declared):DEFAULT_WHERE_ROW_LIMIT;
}
function createPushdownSource(config={}){
const adapter=config.adapter;
if(!adapter||!isFunction(adapter.execute)){
warnOnce('source.pushdown.adapter',
'createPushdownSource needs an `adapter` with an `execute(query)` function.');
return{...config,mode:'remote',fetch:async()=>({rows:[],total:0})};
}
const caps=capabilitiesOf(adapter.capabilities);
const name=adapter.name||'adapter';
const full=resolveFullDataset(config.fullDataset);
const allowPartialResults=!!config.allowPartialResults;
const whereLimit=resolveWhereRowLimit(config.whereRowLimit);
let whereProbe=null;
const aggregatesConfig=config.aggregates;
let held=null;
let lastPlan=null;
let lastAggregates=null;
let lastMatchCount=null;
let lastGrand=null;
let unfilteredRows;
let heldVersion=0;
let heldVersionKey=null;
const fullFrame=()=>{
if(!full.enabled||!held)return null;
if(heldVersionKey!==held.key){
heldVersion++;
heldVersionKey=held.key;
}
return{rows:held.rows,version:heldVersion};
};
const gateWhereBeforeFetch=async(request)=>{
const where=request.where&&request.where.active?request.where:null;
if(!where)return{request,probe:null};
const{where:unused,...without}=request;
const baseline=planQuery(without,caps,full.enabled);
if(baseline.needsAll)return{request,probe:null};
const key=planKey(baseline.pushed);
let probe=null;
if(!whereProbe||whereProbe.key!==key){
if(caps.total){
probe=await adapter.execute(baseline.pushed,request);
whereProbe={
key,
size:probe&&typeof probe.total==='number'?probe.total:null,
};
}else{
whereProbe={key,size:null};
}
}
if(whereProbe.size!==null&&whereProbe.size<whereLimit){
return{request,probe:null};
}
warnWhereOverThreshold(where.names,name,whereProbe.size,whereLimit);
return{request:without,probe};
};
const fetchGroupLevel=async(plan,request)=>{
const split=planGroupTotals(plan.pushed);
lastAggregates={
engine:split.engine,client:split.client,groupBy:plan.pushed.groupBy,
};
if(split.client.length){
warnOnce(`source.pushdown.group.totals.${name}.${split.client.map((c)=>c.id).join('.')}`,
`the ${name} adapter cannot compute the group subtotal for `
+`${split.client.map((c)=>`"${c.id}" (${c.reason})`).join(', ')}, so those group rows carry `
+'no value for that column. A figure computed over anything other than the group would be '
+'wrong, so none is shown; `lastPlan().aggregates.client` names them.');
}
const result=await adapter.executeGroupLevel(plan.pushed,split.engine,request)||{};
let rows=result.rows||[];
if(!caps.range&&request.range)rows=rows.slice(request.range.start,request.range.end);
if(typeof result.matchCount==='number'){
lastMatchCount=result.matchCount;
lastGrand=result.grand
?{totals:result.grand,leafCount:result.matchCount}:null;
if(unfilteredRows===undefined&&isFunction(adapter.unfilteredCount)){
unfilteredRows=null;
Promise.resolve(adapter.unfilteredCount()).then((value)=>{
unfilteredRows=typeof value==='number'?value:null;
}).catch((error)=>{
warnOnce(`source.pushdown.group.unfiltered.${name}`,
`the ${name} adapter could not count the unfiltered set `
+`(${error&&error.message?error.message:error}), so "N of M" falls back to the `
+'display count for its denominator.');
});
}
}
return result.total===undefined?{rows}:{rows,total:result.total};
};
const fetch=async(request)=>{
const decided=await gateWhereBeforeFetch(request);
let plan=planQuery(decided.request,caps,full.enabled);
if(plan.grouped&&!isFunction(adapter.executeGroupLevel)){
warnOnce(`source.pushdown.group.method.${name}`,
`the ${name} adapter declares the \`group\` capability but has no `
+'`executeGroupLevel(query, aggregates, request)`, so grouping is not pushed and the grid '
+'is left to group whatever rows it holds. Implement the method or drop the capability.');
plan=planQuery(decided.request,{...caps,group:false},full.enabled);
}
lastPlan=plan;
if(plan.grouped)return fetchGroupLevel(plan,request);
if(plan.groupReason){
warnOnce(`source.pushdown.group.${name}.${plan.groupReason}`,
`the ${name} adapter was not asked to group this query because ${plan.groupReason}. `
+'The engine returns rows and the grouping is the grid\'s to do, which needs every matching '
+'row in the browser — correct where the grid holds them, and wrong-looking where it holds '
+'a window. `lastPlan().unpushed` names it.');
}
if(!plan.needsAll){
const result=decided.probe||await adapter.execute(plan.pushed,request);
const rows=result.rows||[];
if(!caps.total&&result.total===undefined)return{rows};
return{rows,total:result.total??rows.length};
}
if(plan.unpushed.length){
warnOnce(`source.pushdown.residual.${name}.${plan.unpushed.join('.')}`,
`the ${name} adapter cannot push ${plan.unpushed.join(' or ')}, so every matching row is `
+'fetched and the rest is applied in the browser. Correct, and slower than it needs to be: '
+'widening the adapter is the fix.');
}
const key=planKey(plan.pushed);
if(!held||held.key!==key){
const result=await adapter.execute(plan.pushed,request);
const rows=result.rows||[];
if(plan.full){
const matching=typeof result.total==='number'
?Math.max(result.total,rows.length):rows.length;
if(matching>full.maxRows){
throw new Error(
`[lattice] fullDataset refused: the ${name} adapter's matching set is `
+`${matching.toLocaleString()} rows, past the configured maxRows of `
+`${full.maxRows.toLocaleString()}. The whole set cannot be held client-side, so it `
+'is refused rather than truncated — a fraction shown as the whole would make every '
+'total and statistic silently wrong. Narrow the filter or raise maxRows.');
}
const bytes=rows.length*estimateRowBytes(rows[0]);
if(bytes>full.maxBytesEstimate){
throw new Error(
`[lattice] fullDataset refused: the ${name} adapter's matching set is an estimated `
+`${Math.round(bytes/(1024*1024)).toLocaleString()} MB across `
+`${rows.length.toLocaleString()} rows, past the configured maxBytesEstimate of `
+`${Math.round(full.maxBytesEstimate/(1024*1024)).toLocaleString()} MB. The whole `
+'set cannot be held client-side, so it is refused rather than truncated. Narrow the '
+'filter or raise maxBytesEstimate.');
}
}
if(typeof result.total==='number'&&rows.length<result.total){
const hasResidual=!!(plan.residual.filters||plan.residual.quick
||(plan.residual.sort&&plan.residual.sort.length));
if(hasResidual&&!allowPartialResults){
throw new Error(
`[lattice] the ${name} adapter returned ${rows.length} of ${result.total} matching `
+'rows when asked for the whole result, and the query has residual '
+`${plan.unpushed.join(' and ')||'work'} to finish in the browser. Filtering or `
+'sorting a fraction of the result would return wrong rows, so the result is refused. '
+'Fix the adapter to follow the engine\'s own paging before returning, hold the data in '
+'memory, or set `allowPartialResults: true` on the source config to accept this knowingly.');
}else if(hasResidual){
warnOnce(`source.pushdown.partial.residual.${name}`,
`the ${name} adapter returned ${rows.length} of ${result.total} matching rows when asked `
+'for the whole result, and residual work will run over that fraction. '
+'allowPartialResults is set, so the result is used as-is — it may be wrong. '
+'The adapter must follow the engine\'s own paging to be correct.');
}else{
warnOnce(`source.pushdown.partial.${name}`,
`the ${name} adapter returned ${rows.length} of ${result.total} matching rows when asked `
+'for the whole result. The adapter must follow the engine\'s own paging before returning.');
}
}
held={
key,
rows,
total:typeof result.total==='number'?result.total:null,
};
}
let effective=plan;
if(plan.residual.where){
const size=held.total??held.rows.length;
if(size>=whereLimit){
warnWhereOverThreshold(plan.residual.where.names,name,size,whereLimit);
const{where:unused,...without}=decided.request;
effective=planQuery(without,caps,full.enabled);
lastPlan=effective;
}
}
const whole=held.total!==null&&held.rows.length>=held.total;
const rows=applyResidual(
held.rows,{...effective.residual,whole},config.compute||{},
);
const start=request.range?request.range.start:0;
const end=request.range?request.range.end:rows.length;
return{rows:rows.slice(start,end),total:rows.length};
};
const aggregate=async(request,requested)=>{
const plan=planQuery(request,caps,full.enabled);
lastPlan=plan;
const split=resolveAggregatePlan(requested,aggregatesConfig);
const groupBy=Array.isArray(request.groupBy)?request.groupBy:[];
const grouped=groupBy.length>0;
const filterFullyPushed=!plan.residual.filters;
const groupingPushable=!grouped||groupKeysPushable(groupBy);
let engine=split.engine;
let client=split.client;
const fallAllToClient=(reason)=>{
client=[...engine.map((agg)=>({...agg,reason})),...client];
engine=[];
};
if(engine.length&&!filterFullyPushed){
fallAllToClient('residual filter forces all-client (no mixed provenance)');
}else if(engine.length&&!groupingPushable){
fallAllToClient('a grouping key the engine cannot form forces all-client (no mixed provenance)');
}
let values={};
let groups;
if(engine.length){
const canCompute=grouped
?isFunction(adapter.executeGroupedAggregates)
:isFunction(adapter.executeAggregates);
if(!canCompute){
warnOnce(`source.pushdown.aggregates.${name}${grouped?'.grouped':''}`,
`the ${name} adapter cannot compute ${grouped?'grouped ':''}aggregates, so every `
+'requested statistic is computed client-side. Correct, and slower than it needs to be.');
fallAllToClient(`adapter cannot compute ${grouped?'grouped ':''}aggregates`);
}else if(grouped){
groups=await adapter.executeGroupedAggregates(plan.pushed,groupBy,engine)||[];
}else{
values=await adapter.executeAggregates(plan.pushed,engine)||{};
}
}
lastAggregates={engine,client,...(grouped?{groupBy}:{})};
return{
values,engine,client,...(groups!==undefined?{groups}:{}),
};
};
const editRequested=wantsEdit(config.edit);
const declaredCommit=config.edit&&typeof config.edit==='object'
&&isFunction((config.edit).commit);
let edit=config.edit;
if(editRequested&&!declaredCommit){
if(caps.mutate&&caps.mutate.update){
const commit=(write)=>{
if(!caps.mutate||!caps.mutate.update){
throw new Error(
`[lattice] the ${name} adapter cannot update rows (mutate.update is not declared), `
+'so this edit cannot be persisted. The cell is reverted rather than left looking saved.');
}
const op={
kind:'update',
key:String(write.key),
patch:{[write.colId]:write.value},
};
return adapter.mutate(op,write.request||{});
};
edit={...(config.edit===true?{}:config.edit),commit};
}else{
warnOnce(`source.pushdown.readonly.${name}`,
`edit is enabled but the ${name} adapter declares mutate: ${caps.mutate?'without update':'false'} `
+'(read-only by declaration), so no commit is synthesised and the grid stays read-only. '
+'Declare `mutate: { update: true }` on the adapter to allow cell edits.');
}
}
const rowMutate=(editRequested&&caps.mutate&&(caps.mutate.append||caps.mutate.delete))
?{
append:caps.mutate.append===true,
remove:caps.mutate.delete===true,
returning:caps.mutate.returning,
mutate:(op,request)=>adapter.mutate(op,request||{}),
}
:null;
return{
...config,
edit,
rowMutate,
mode:'remote',
fetch,
aggregate,
lastPlan:()=>(lastPlan
?{...lastPlan,...(lastAggregates?{aggregates:lastAggregates}:{})}
:null),
fullFrame,
counts:()=>({match:lastMatchCount,total:unfilteredRows??null}),
grandTotals:()=>lastGrand,
};
}
});
__def("packages/modules/data-router/devtools.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"mountRouterDevtools",{enumerable:true,get:function(){return mountRouterDevtools;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const NS='lat-router-devtools';
function cell(doc,tag,value){
const c=doc.createElement(tag);
c.textContent=value===null||value===undefined?'—':String(value);
return c;
}
function rate(n){
return Number.isFinite(n)?`${Math.round(n*10)/10}/s`:'—';
}
function section(doc,title,headers,rows){
const sec=doc.createElement('section');
sec.className=`${NS}-section`;
const h=doc.createElement('h4');
h.textContent=title;
sec.appendChild(h);
const table=doc.createElement('table');
const thead=doc.createElement('tr');
for(const head of headers)thead.appendChild(cell(doc,'th',head));
table.appendChild(thead);
for(const r of rows){
const tr=doc.createElement('tr');
for(const v of r)tr.appendChild(cell(doc,'td',v));
table.appendChild(tr);
}
sec.appendChild(table);
return sec;
}
function render(doc,root,m){
root.textContent='';
const globals=section(doc,'Router',['metric','value'],[
['throughput',rate(m.throughput)],
['unrouted',m.unrouted],
['dropped (duplicate)',m.dropped],
['buffer depth',m.buffered],
['lag (deltas behind)',m.lag],
]);
root.appendChild(globals);
root.appendChild(section(doc,'Routes',['#','label','kind','rows','shown','rows/sec'],
m.routes.map((r)=>[r.index,r.label,r.kind,r.rows,r.shown,rate(r.throughput)])));
if(m.sources.length){
root.appendChild(section(doc,'Sources',['id','rows','ingested','rows/sec'],
m.sources.map((s)=>[s.id,s.rows,s.ingested,rate(s.throughput)])));
}
}
function mountRouterDevtools(router,el,o={}){
void o;
const doc=(el&&el.ownerDocument)||(typeof document!=='undefined'?document:null);
if(!router||typeof router.metrics!=='function'||typeof router.on!=='function'||!el||!doc){
warnOnce(
'data-router:devtools-target',
'router.mountDevtools(el) needs a router with metrics()/on() and a DOM element to render into; the panel was not mounted.',
);
return{destroy(){},refresh(){}};
}
const root=doc.createElement('div');
root.className=NS;
el.appendChild(root);
const refresh=()=>render(doc,root,router.metrics());
refresh();
const off=router.on('metrics',()=>refresh());
return{
refresh,
destroy(){
off();
if(root.parentNode)root.parentNode.removeChild(root);
},
};
}
const __default=mountRouterDevtools;
});
__def("packages/modules/data-router/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createDataRouter",{enumerable:true,get:function(){return createDataRouter;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/core/src/source/pushdown.js");
const planQuery=__m1["planQuery"];
const capabilitiesOf=__m1["capabilitiesOf"];
const __m2=__req("packages/modules/data-router/devtools.js");
const mountRouterDevtools=__m2["mountRouterDevtools"];
function resolver(spec,fallback){
if(typeof spec==='function')return spec;
if(typeof spec==='string')return(row)=>row[spec];
return fallback;
}
function rowKeyTypeName(v){
if(Array.isArray(v))return'array';
if(v===null)return'null';
return typeof v;
}
function assertRowKeySpec(spec,where){
if(spec===undefined)return spec;
if(typeof spec==='string'&&spec.length>0)return spec;
if(typeof spec==='function'){
return(row)=>{
const key=spec(row);
if(typeof key==='string')return key;
if(typeof key==='number'&&Number.isFinite(key))return key;
throw new Error(
`lattice-data-router: rowKey function must return a string or number; got ${rowKeyTypeName(key)}.`,
);
};
}
throw new Error(
`lattice-data-router: rowKey must be a property name or a function; composite keys are not supported on ${where}.`,
);
}
function comparator(sort){
if(typeof sort==='function')return sort;
if(sort&&typeof sort==='object'&&typeof sort.key==='string'){
const dir=sort.dir==='desc'?-1:1;
const{key:field}=sort;
return(a,b)=>{
const av=a?a[field]:undefined;
const bv=b?b[field]:undefined;
if(av<bv)return-1*dir;
if(av>bv)return 1*dir;
return 0;
};
}
return null;
}
function normalizeBackpressure(spec){
if(!spec||typeof spec!=='object')return null;
let minInterval=0;
if(Number.isFinite(spec.minInterval)&&spec.minInterval>0)minInterval=Number(spec.minInterval);
else if(Number.isFinite(spec.maxHz)&&spec.maxHz>0)minInterval=1000/Number(spec.maxHz);
const sample=(Number.isFinite(spec.sample)&&spec.sample>1)?Math.floor(Number(spec.sample)):1;
const maxLag=(Number.isFinite(spec.maxLag)&&spec.maxLag>=0)?Math.floor(Number(spec.maxLag)):null;
if(minInterval===0&&sample===1&&maxLag===null)return null;
return{minInterval,sample,maxLag};
}
function grouper(groupBy){
const specs=Array.isArray(groupBy)?groupBy:[groupBy];
const parts=specs.map((s)=>({name:typeof s==='string'?s:null,get:resolver(s,()=>undefined)}));
return(row)=>{
const fields={};
const vals=[];
for(const part of parts){
const v=part.get(row);
vals.push(v);
if(part.name)fields[part.name]=v;
}
return{key:vals.map((v)=>String(v)).join('\u0001'),fields};
};
}
function aggregateOne(spec,rows){
if(typeof spec==='function')return spec(rows);
if(spec&&typeof spec==='object'){
const{op,field}=spec;
if(op==='count')return rows.length;
const nums=field!=null?rows.map((r)=>Number(r[field])).filter((n)=>Number.isFinite(n)):[];
if(op==='sum')return nums.reduce((a,b)=>a+b,0);
if(op==='avg')return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;
if(op==='min')return nums.length?Math.min(...nums):undefined;
if(op==='max')return nums.length?Math.max(...nums):undefined;
}
return undefined;
}
function invertRelation(rel){
if(rel&&typeof rel==='object'&&typeof rel.from==='string'&&typeof rel.to==='string'){
return{from:rel.to,to:rel.from};
}
warnOnce(
'data-router:mutual-fn',
"relate({ mutual: true }) with a function relation cannot be inverted; the same predicate is applied in both directions. Use a { from, to } key map for a mutual edge.",
);
return rel;
}
function andFilters(a,b){
if(!a)return b||null;
if(!b)return a;
return{op:'and',conditions:[a,b]};
}
const RESIDUAL_OPERATORS=Object.freeze([
'eq','ne','lt','lte','gt','gte','between','notBetween','in','notIn',
'contains','notContains','startsWith','endsWith','blank','notBlank',
]);
function evalCondition(cond,row){
const v=row?row[cond.col]:undefined;
const t=cond.value;
const s=(x)=>(cond.caseSensitive?String(x):String(x).toLowerCase());
switch(cond.op){
case'eq':return v===t;
case'ne':return v!==t;
case'lt':return v<t;
case'lte':return v<=t;
case'gt':return v>t;
case'gte':return v>=t;
case'between':return Array.isArray(t)&&v>=t[0]&&v<=t[1];
case'notBetween':return!(Array.isArray(t)&&v>=t[0]&&v<=t[1]);
case'in':return Array.isArray(t)&&t.includes(v);
case'notIn':return!(Array.isArray(t)&&t.includes(v));
case'contains':return v!=null&&s(v).includes(s(t));
case'notContains':return v==null||!s(v).includes(s(t));
case'startsWith':return v!=null&&s(v).startsWith(s(t));
case'endsWith':return v!=null&&s(v).endsWith(s(t));
case'blank':return v===null||v===undefined||v==='';
case'notBlank':return!(v===null||v===undefined||v==='');
default:
throw new Error(
`[lattice] query() cannot evaluate the residual filter operator "${String(cond.op)}" on column `
+`"${String(cond.col)}" client-side, so the query is refused rather than returning rows the `
+`filter excludes. Push it down to an adapter that implements it, or use an operator this `
+`router evaluates: ${RESIDUAL_OPERATORS.join(', ')}.`,
);
}
}
function evalNode(node,row){
if(!node)return true;
if(Array.isArray(node.conditions)){
if(node.op==='or')return node.conditions.some((c)=>evalNode(c,row));
if(node.op==='not')return!node.conditions.every((c)=>evalNode(c,row));
return node.conditions.every((c)=>evalNode(c,row));
}
return evalCondition(node,row);
}
function createDataRouter(opts={}){
const partOf=resolver(opts.key,()=>undefined);
const defaultKeyOf=resolver(assertRowKeySpec(opts.rowKey,'routes'),(row)=>row.rowKey);
const overlap=!!opts.overlap;
const onUnrouted=typeof opts.onUnrouted==='function'?opts.onUnrouted:null;
const debounceMs=Number.isFinite(opts.selectionDebounce)?Number(opts.selectionDebounce):16;
const globalOnWrite=typeof opts.onWrite==='function'?opts.onWrite:null;
const globalOnConflict=typeof opts.onConflict==='function'?opts.onConflict:null;
const seqOf=opts.seq!=null?resolver(opts.seq,()=>undefined):null;
const dedupe=seqOf?(opts.dedupe!==false):false;
const streamKeyOf=defaultKeyOf;
let batchMs=null;
if(typeof opts.batch==='number')batchMs=opts.batch;
else if(opts.batch&&Number.isFinite(opts.batch.intervalMs))batchMs=Number(opts.batch.intervalMs);
const coalesceMode=batchMs!==null||!!opts.coalesce;
const seqSeen=new Map();
let maxSeq;
let dropped=0;
const buffer=[];
let streamTimer=null;
const timeOf=opts.time!=null?resolver(opts.time,()=>undefined):null;
const nowFn=typeof opts.now==='function'?opts.now:Date.now;
const BUFFER_DEFAULT_CAP=10000;
let buffering=false;
let bufMax=null;
let bufWindow=null;
let bufDomain='time';
let baseWorld=new Map();
const bufferLog=[];
let bufPos=0;
let baseSeq;
let baseT;
let traveling=false;
let travelWorld=null;
let replayQueue=[];
let replayIndex=0;
let replaySpeed=0;
let replayDomain='time';
let replayPaused=false;
let replayTimer=null;
let replayResolve=null;
const seqVal=(d)=>{
if(d&&Number.isFinite(d.seq))return d.seq;
if(seqOf&&d&&d.row){const v=seqOf(d.row);return Number.isFinite(v)?v:undefined;}
return undefined;
};
const timeVal=(d)=>{
if(d&&Number.isFinite(d.t))return d.t;
if(timeOf&&d&&d.row){const v=timeOf(d.row);if(Number.isFinite(v))return v;}
return nowFn();
};
const routes=[];
let fallbackRoute=null;
const links=[];
const graphEdges=[];
const selSubs=new Map();
const pending=new Set();
let timer=null;
let unrouted=0;
const writeSubs=new Map();
const revertingCells=new Set();
const idProp=typeof opts.rowKey==='string'?opts.rowKey:'rowKey';
const sources=new Map();
let sourceSeq=0;
const counters=new Map();
const metricAdd=(name,n)=>{counters.set(name,(counters.get(name)||0)+n);};
let totalRouted=0;
const metricSamples=new Map();
const listeners=new Map();
let metricsTimer=null;
const metricsIntervalMs=Number.isFinite(opts.metricsInterval)?Number(opts.metricsInterval):1000;
let viewPos=0;
let durable=null;
let persistKey='lattice-router';
let persistDebounceMs=250;
let persistTimer=null;
let persistInFlight=null;
let persistOn=false;
let restoring=false;
let bchannel=null;
let mirroringIn=false;
let lastQueryPlanState=null;
const alerts=[];
const allRoutes=()=>(fallbackRoute?[...routes,fallbackRoute]:routes);
const routeFor=(grid)=>allRoutes().find((r)=>r.grid===grid)||null;
const targetsFor=(row)=>{
const hits=[];
for(const r of routes){
if(r.match(row)){hits.push(r);if(!overlap)break;}
}
if(hits.length)return hits;
return fallbackRoute?[fallbackRoute]:[];
};
const applyChange=(route,change)=>{
if(change.add.length||change.update.length||change.remove.length){
route.sink(change);
}
return{added:change.add.length,updated:change.update.length,removed:change.remove.length};
};
const passes=(route,row)=>{
for(const link of links){
if(link.to!==route.grid)continue;
if(link.predicate&&!link.predicate(row))return false;
}
if(route.graphPreds)for(const p of route.graphPreds)if(!p(row))return false;
return true;
};
const materialize=(route)=>{
const kept=[];
for(const row of route.partition.values()){
if(route.filter&&!route.filter(row))continue;
if(!passes(route,row))continue;
kept.push(row);
}
let shown;
if(route.rollup){
const groups=new Map();
for(const row of kept){
const{key,fields}=route.rollup.group(row);
let g=groups.get(key);
if(!g){g={key,fields,rows:[]};groups.set(key,g);}
g.rows.push(row);
}
let summaries=[];
for(const g of groups.values()){
const out={...g.fields};
for(const[outField,spec]of route.rollup.specs)out[outField]=aggregateOne(spec,g.rows);
summaries.push({gkey:g.key,row:out});
}
if(route.sort)summaries.sort((a,b)=>route.sort(a.row,b.row));
if(route.transform)summaries=summaries.map((s)=>({gkey:s.gkey,row:route.transform(s.row)}));
shown=new Map(summaries.map((s)=>[s.gkey,s.row]));
}else{
let rows=kept;
if(route.sort)rows=rows.slice().sort(route.sort);
shown=new Map();
for(const row of rows)shown.set(String(route.keyOf(row)),route.transform?route.transform(row):row);
}
const add=[];
const update=[];
const remove=[];
for(const[k,row]of shown){
if(!route.keys.has(k))add.push(row);
else if(!sameRow(route.keys.get(k),row))update.push(row);
}
for(const k of route.keys.keys())if(!shown.has(k))remove.push(k);
route.keys=shown;
return applyChange(route,{add,update,remove});
};
const flushRoute=(route)=>{
if(route.bpTimer){clearTimeout(route.bpTimer);route.bpTimer=null;}
materialize(route);
route.bpPending=0;
route.bpLastFlush=nowFn();
};
const armBpTimer=(route,now)=>{
if(route.bpTimer)return;
const wait=route.bp.minInterval>0?Math.max(route.bp.minInterval-(now-route.bpLastFlush),0):0;
route.bpTimer=setTimeout(()=>{route.bpTimer=null;flushRoute(route);},wait);
if(route.bpTimer&&typeof route.bpTimer.unref==='function')route.bpTimer.unref();
};
const scheduleMaterialize=(route,changed)=>{
if(!route.bp){materialize(route);return;}
route.bpPending+=changed;
route.bpCoalesced+=changed;
const bp=route.bp;
if(bp.maxLag!=null&&route.bpPending<=bp.maxLag&&!route.bpTimer){flushRoute(route);return;}
const now=nowFn();
const canFlushNow=(now-route.bpLastFlush)>=bp.minInterval;
const sampleReady=route.bpPending>=bp.sample;
if(canFlushNow&&sampleReady){flushRoute(route);return;}
armBpTimer(route,now);
};
const resetBackpressure=(route)=>{
if(route.bpTimer){clearTimeout(route.bpTimer);route.bpTimer=null;}
route.bpPending=0;
route.bpLastFlush=nowFn();
};
const buildPredicate=(relation,selectedRows)=>{
if(typeof relation==='function'){
const p=relation(selectedRows);
return typeof p==='function'?p:null;
}
if(relation&&typeof relation==='object'){
const fromKey=relation.from;
const toKey=relation.to;
const set=new Set(selectedRows.map((r)=>r&&r[fromKey]));
return(row)=>set.has(row&&row[toKey]);
}
return null;
};
const selectedRowsOf=(grid)=>{
const r=routeFor(grid);
const sel=grid&&grid.selection;
const keys=sel&&typeof sel.keys==='function'?sel.keys():[];
if(!keys.length||!r)return[];
return keys.map((k)=>r.partition.get(String(k))).filter((row)=>row!==undefined);
};
const recomputeLink=(link)=>{
const selectedRows=selectedRowsOf(link.from);
link.predicate=selectedRows.length?buildPredicate(link.relation,selectedRows):null;
};
const graphNodes=()=>{
const s=new Set();
for(const e of graphEdges){s.add(e.from);s.add(e.to);}
return s;
};
const computeGraph=()=>{
for(const r of allRoutes())r.graphPreds=null;
if(!graphEdges.length)return;
const nodes=graphNodes();
const fixed=new Map();
for(const n of nodes){const rows=selectedRowsOf(n);if(rows.length)fixed.set(n,rows);}
const eff=new Map(fixed);
let changed=true;
let guard=(nodes.size+1)*2;
while(changed&&guard-->0){
changed=false;
for(const n of nodes){
if(fixed.has(n))continue;
const incoming=graphEdges.filter((e)=>e.to===n&&eff.has(e.from));
if(!incoming.length)continue;
const tr=routeFor(n);
if(!tr)continue;
const preds=incoming.map((e)=>buildPredicate(e.rel,eff.get(e.from))).filter(Boolean);
const derived=[];
for(const row of tr.partition.values())if(preds.every((p)=>p(row)))derived.push(row);
const prev=eff.get(n);
if(!prev||prev.length!==derived.length){eff.set(n,derived);changed=true;}
else{const set=new Set(prev);if(derived.some((r)=>!set.has(r))){eff.set(n,derived);changed=true;}}
}
}
for(const e of graphEdges){
if(!eff.has(e.from))continue;
const pred=buildPredicate(e.rel,eff.get(e.from));
if(!pred)continue;
const tr=routeFor(e.to);
if(!tr)continue;
(tr.graphPreds||(tr.graphPreds=[])).push(pred);
}
};
const ensureSelSub=(grid)=>{
const existing=selSubs.get(grid);
if(existing){existing.count+=1;return;}
const off=grid&&typeof grid.on==='function'
?grid.on('selection:changed',()=>scheduleFrom(grid))
:()=>{};
selSubs.set(grid,{off,count:1});
};
const runPending=()=>{
if(timer){clearTimeout(timer);timer=null;}
const sources=pending;
if(!sources.size)return;
const targets=new Set();
for(const link of links){
if(sources.has(link.from)){recomputeLink(link);targets.add(link.to);}
}
pending.clear();
if(graphEdges.length){computeGraph();for(const n of graphNodes())targets.add(n);}
for(const grid of targets){const r=routeFor(grid);if(r)materialize(r);}
};
const scheduleFrom=(grid)=>{
pending.add(grid);
if(debounceMs<=0){runPending();return;}
if(!timer)timer=setTimeout(runPending,debounceMs);
};
const releaseSub=(grid)=>{
const sub=selSubs.get(grid);
if(!sub)return;
sub.count-=1;
if(sub.count<=0){sub.off();selSubs.delete(grid);}
};
const targetSink=(target)=>{
if(typeof target==='function')return(change)=>target(change);
if(target&&target.rows&&typeof target.rows.apply==='function'){
return(change)=>target.rows.apply(change);
}
warnOnce(
'data-router:bad-target',
'attach/subscribe target has no rows.apply and is not a function; its slice goes nowhere. Pass a grid or a handler(change) function.',
);
return()=>{};
};
const makeRoute=(grid,match,o)=>({
grid,
sink:targetSink(grid),
match,
keyOf:resolver(assertRowKeySpec(o.rowKey,'routes'),defaultKeyOf),
partition:new Map(),
keys:new Map(),
transform:typeof o.transform==='function'?o.transform:null,
filter:typeof o.filter==='function'?o.filter:null,
sort:comparator(o.sort),
rollup:o.rollup&&o.rollup.groupBy!=null
?{group:grouper(o.rollup.groupBy),specs:Object.entries(o.rollup.aggregate||{})}
:null,
where:(o.where&&typeof o.where==='object')?o.where:null,
graphPreds:null,
onWrite:typeof o.onWrite==='function'?o.onWrite:null,
onConflict:typeof o.onConflict==='function'?o.onConflict:null,
writable:o.writable===true,
readonly:!!((o.rollup&&o.rollup.groupBy!=null)||typeof o.transform==='function'),
label:typeof o.label==='string'?o.label:null,
metricRows:0,
bp:normalizeBackpressure(o.backpressure),
bpPending:0,
bpTimer:null,
bpLastFlush:-Infinity,
bpCoalesced:0,
});
const warnOverlapCollision=(value)=>{
if(overlap)return;
for(const r of routes){
if(r.hasPartValue&&r.partValue===value){
warnOnce(
`data-router:overlap:${String(value)}`,
`Data Router: value ${JSON.stringify(value)} already routes to another viewer; with overlap:false only the first receives rows. Pass createDataRouter({ overlap: true }) to fan one value to several viewers.`,
);
return;
}
}
};
const cellId=(key,colId)=>`${String(key)}\u001f${String(colId)}`;
const recordOf=(e)=>{
const r=e&&e.row;
if(!r)return null;
const rec=r.data&&typeof r.data==='object'?r.data:r;
return rec?{...rec}:null;
};
const revertCell=(route,change)=>{
const grid=route.grid;
if(!grid||!grid.edit||typeof grid.edit.setCells!=='function')return;
const cid=cellId(change.key,change.colId);
revertingCells.add(cid);
try{grid.edit.setCells([{key:change.key,colId:change.colId,value:change.before}],'cell');}
finally{revertingCells.delete(cid);}
metricAdd('writeReverted',1);
};
const reenterWrite=(row)=>{
if(row)router.apply([{op:'upsert',row}]);
};
const settleWrite=(route,change,res)=>{
const obj=res&&typeof res==='object'?res:null;
const conflict=obj&&obj.conflict!==undefined?obj.conflict:null;
if(conflict){
const onConflict=route.onConflict||globalOnConflict;
if(onConflict){try{onConflict(change,{serverRow:conflict});}catch{}}
metricAdd('writeConflicted',1);
reenterWrite(obj&&obj.row?obj.row:change.row);
return;
}
if(res===false||(obj&&obj.ok===false)){
metricAdd('writeRejected',1);
revertCell(route,change);
return;
}
metricAdd('writeAccepted',1);
reenterWrite(obj&&obj.row?obj.row:change.row);
};
const onGridEdit=(route,e)=>{
if(!e||e.key===undefined||e.colId===undefined)return;
if(revertingCells.has(cellId(e.key,e.colId)))return;
const record=recordOf(e);
const change={key:String(e.key),colId:String(e.colId),value:e.value,before:e.oldValue,row:record};
metricAdd('writeRouted',1);
if(route.readonly){
warnOnce(
'data-router:readonly-write',
'an edit on a derived (rollup/transform) route is read-only and was reverted; a derived row cannot be inverted to a source row. Make the source route writable instead.',
);
revertCell(route,change);
return;
}
const onWrite=route.onWrite||globalOnWrite;
if(!onWrite){
warnOnce(
'data-router:no-onwrite',
'a route attached with { writable: true } has no onWrite handler (per-route or router-global); the edit was left in place but not persisted. Pass onWrite to route the write.',
);
return;
}
let result;
try{result=onWrite(change,{route:route.grid,source:null});}
catch{revertCell(route,change);metricAdd('writeRejected',1);return;}
if(result&&typeof result.then==='function'){
result.then(
(res)=>settleWrite(route,change,res),
()=>{revertCell(route,change);metricAdd('writeRejected',1);},
);
}else{
settleWrite(route,change,result);
}
};
const bindWriteBack=(route)=>{
const grid=route.grid;
if(!grid||typeof grid.on!=='function'||!grid.edit||typeof grid.edit.setCells!=='function'){
warnOnce(
'data-router:writable-target',
'attach({ writable: true }) needs a grid exposing grid.on and grid.edit.setCells; write-back is off for this route.',
);
return;
}
if(writeSubs.has(grid))return;
const off=grid.on('cell:changed',(e)=>onGridEdit(route,e));
writeSubs.set(grid,typeof off==='function'?off:()=>{});
};
const alertRows=(al)=>{
const out=[];
for(const row of al.partition.values()){
if(al.filter&&!al.filter(row))continue;
out.push(row);
}
return out;
};
const evaluateAlert=(al)=>{
const rows=alertRows(al);
let signal;
try{signal=al.condition(rows);}catch{signal=false;}
if(signal){
if(!al.armed)return;
if(al.debounceMs>0){
al.pending={signal,rows};
if(!al.timer){
al.timer=setTimeout(()=>{
al.timer=null;
const p=al.pending;
al.pending=null;
if(p){al.armed=false;al.handler(p.signal,p.rows);}
},al.debounceMs);
}
}else{
al.armed=false;
al.handler(signal,rows);
}
}else{
al.armed=true;
if(al.timer){clearTimeout(al.timer);al.timer=null;}
al.pending=null;
}
};
const seedAlert=(al,rows)=>{
al.partition=new Map();
for(const row of rows){
if(al.match(row))al.partition.set(String(al.keyOf(row)),row);
}
};
const applyAlertDeltas=(al,list)=>{
for(const d of list){
const row=d&&d.row;
if(!row)continue;
const k=String(al.keyOf(row));
if(d.op==='delete'){al.partition.delete(k);continue;}
if(al.match(row))al.partition.set(k,row);
else al.partition.delete(k);
}
};
const worldRows=()=>{
const seen=new Map();
for(const r of allRoutes())for(const row of r.partition.values())seen.set(String(streamKeyOf(row)),row);
return[...seen.values()];
};
const rebaseBuffer=()=>{
baseWorld=new Map();
for(const r of allRoutes()){
for(const row of r.partition.values())baseWorld.set(String(streamKeyOf(row)),row);
}
bufferLog.length=0;
bufPos=0;
baseSeq=maxSeq;
baseT=undefined;
};
const evictFront=()=>{
const e=bufferLog.shift();
if(!e)return;
if(e.op==='del')baseWorld.delete(e.key);
else baseWorld.set(e.key,e.row);
baseSeq=e.seq;
baseT=e.t;
};
const enforceBounds=()=>{
if(bufMax!=null)while(bufferLog.length>bufMax)evictFront();
if(bufWindow!=null&&bufferLog.length){
const newest=bufferLog[bufferLog.length-1].t;
while(bufferLog.length>1&&(newest-bufferLog[0].t)>bufWindow)evictFront();
}
};
const recordDelta=(d)=>{
if(!d||!d.row)return;
bufferLog.push({
pos:bufPos++,
seq:seqVal(d),
t:timeVal(d),
op:d.op==='delete'?'del':'set',
key:String(streamKeyOf(d.row)),
row:d.row,
});
};
const entryVal=(e,domain)=>(domain==='seq'?e.seq:e.t);
const reconstructWorld=(target,domain)=>{
const world=new Map(baseWorld);
for(const e of bufferLog){
const ev=entryVal(e,domain);
if(target!==undefined&&ev!==undefined&&ev>target)break;
if(e.op==='del')world.delete(e.key);
else world.set(e.key,e.row);
}
return world;
};
const renderWorld=(rows)=>{
const buckets=new Map(allRoutes().map((r)=>[r,[]]));
for(const row of rows)for(const r of targetsFor(row))buckets.get(r).push(row);
for(const r of allRoutes()){
r.partition=new Map(buckets.get(r).map((row)=>[String(r.keyOf(row)),row]));
}
for(const lk of links)recomputeLink(lk);
computeGraph();
for(const r of allRoutes())materialize(r);
};
const requireBuffer=(method)=>{
if(buffering)return true;
warnOnce(
'data-router:no-buffer',
`${method}() needs a buffered window; call router.buffer({ window, max }) first to record one.`,
);
return false;
};
const stopReplay=()=>{
if(replayTimer){clearTimeout(replayTimer);replayTimer=null;}
replayPaused=false;
replayQueue=[];
replayIndex=0;
if(replayResolve){const done=replayResolve;replayResolve=null;done();}
};
const finishReplay=()=>{
replayQueue=[];
replayIndex=0;
if(replayResolve){const done=replayResolve;replayResolve=null;done();}
};
const runReplayStep=()=>{
replayTimer=null;
const e=replayQueue[replayIndex++];
if(e.op==='del')travelWorld.delete(e.key);
else travelWorld.set(e.key,e.row);
renderWorld([...travelWorld.values()]);
viewPos=e.pos+1;
scheduleReplayStep();
};
function scheduleReplayStep(){
if(replayPaused)return;
if(replayIndex>=replayQueue.length){finishReplay();return;}
replayTimer=setTimeout(runReplayStep,replaySpeed);
}
function mirrorOut(msg){
if(!bchannel)return;
try{bchannel.postMessage(msg);}catch{}
}
function snapshotMessage(){
return{t:'snapshot',rows:worldRows(),seq:maxSeq,checkpoint:Object.fromEntries(seqSeen)};
}
function onMirror(event){
const msg=event&&event.data;
if(!msg||typeof msg!=='object')return;
if(msg.t==='hello'){
if(worldRows().length)mirrorOut(snapshotMessage());
return;
}
mirroringIn=true;
try{
if(msg.t==='delta')router.apply(msg.deltas||[]);
else if(msg.t==='snapshot'){
router.load(msg.rows||[]);
if(msg.checkpoint)router.seenThrough(msg.checkpoint);
}
}finally{
mirroringIn=false;
}
}
function fillRoute(route,rows){
route.partition=new Map(rows.map((row)=>[String(route.keyOf(row)),row]));
}
function distribute(rows,subset){
const explicit=subset.filter((r)=>!r.isDefault);
const fb=subset.find((r)=>r.isDefault)||null;
for(const r of subset)r.partition=new Map();
for(const row of rows){
const hits=[];
for(const r of explicit){if(r.match(row)){hits.push(r);if(!overlap)break;}}
const targets=hits.length?hits:(fb?[fb]:[]);
if(!targets.length){unrouted+=1;if(onUnrouted)onUnrouted(row);continue;}
for(const r of targets)r.partition.set(String(r.keyOf(row)),row);
}
}
const makeNamespacer=(id,key)=>{
if(typeof key==='function')return(row)=>key(row);
let prefix=null;
if(key===true)prefix=String(id);
else if(typeof key==='string')prefix=key;
if(prefix==null)return null;
return(row)=>`${prefix}:${row[idProp]}`;
};
const normalizeRow=(source,raw)=>{
const out={...(source.map?source.map(raw):raw)};
if(source.ns)out[idProp]=source.ns(out);
return out;
};
const normalizeDeltas=(source,deltas)=>{
const out=[];
for(const d of(deltas||[])){
if(!d||!d.row)continue;
const row=normalizeRow(source,d.row);
const id=String(row[idProp]);
if(d.op==='delete')source.live.delete(id);
else source.live.set(id,row);
out.push({...d,row});
}
source.ingested+=out.length;
metricAdd(`source:${source.id}`,out.length);
return out;
};
const makeSourceHandle=(source)=>({
get id(){return source.id;},
get size(){return source.live.size;},
load(rows){
const normalized=(rows||[]).map((r)=>normalizeRow(source,r));
const next=new Map(normalized.map((r)=>[String(r[idProp]),r]));
const deltas=[];
for(const[id,row]of source.live)if(!next.has(id))deltas.push({op:'delete',row});
for(const row of normalized)deltas.push({op:'upsert',row});
source.live=next;
source.ingested+=normalized.length;
metricAdd(`source:${source.id}`,normalized.length);
ingestSource(source,deltas,(l)=>router.apply(l));
return this;
},
apply(deltas){ingestSource(source,normalizeDeltas(source,deltas),(l)=>router.apply(l));return this;},
push(delta){ingestSource(source,normalizeDeltas(source,Array.isArray(delta)?delta:[delta]),(l)=>router.push(l));return this;},
remove(){
const deltas=[];
for(const row of source.live.values())deltas.push({op:'delete',row});
source.live.clear();
sources.delete(source.id);
if(deltas.length)router.apply(deltas);
return router;
},
});
const fkStr=(v)=>(v==null?null:String(v));
const resolveJoin=(raw,owner)=>{
if(!raw||typeof raw!=='object')return null;
const from=raw.from!=null?String(raw.from):null;
if(!from){
warnOnce('data-router:join-no-from','join needs a `from` (the lookup source id); ignoring the join.');
return null;
}
const lk=raw.localKey!=null?raw.localKey:raw.on;
let localKey;
if(typeof lk==='function')localKey=lk;
else if(typeof lk==='string')localKey=(row)=>row[lk];
else{
warnOnce('data-router:join-no-localkey','join needs a `localKey` (a field name or fn); ignoring the join.');
return null;
}
const fkRaw=raw.foreignKey!=null?raw.foreignKey:raw.fromKey;
let foreignKeyFn;
let ffKey;
if(typeof fkRaw==='function'){foreignKeyFn=fkRaw;ffKey=fkRaw;}
else if(typeof fkRaw==='string'){foreignKeyFn=(row)=>row[fkRaw];ffKey=fkRaw;}
else if(typeof lk==='string'){foreignKeyFn=(row)=>row[lk];ffKey=lk;}
else{
warnOnce('data-router:join-no-foreignkey','join with a fn `localKey` needs an explicit string/fn `foreignKey`; ignoring the join.');
return null;
}
let selectFn=null;
const pairs=[];
const f=raw.fields!=null?raw.fields:raw.select;
if(typeof f==='function')selectFn=f;
else if(Array.isArray(f))for(const name of f)pairs.push([String(name),String(name)]);
else if(f&&typeof f==='object')for(const[src,dst]of Object.entries(f))pairs.push([src,String(dst)]);
else warnOnce('data-router:join-no-fields','join has no `fields`/`select`; rows pass through unenriched.');
let missing=raw.missing;
if(missing!=='hold'&&missing!=='passthrough'&&missing!=='null'){
if(missing!=null)warnOnce('data-router:join-bad-missing',`join.missing "${missing}" is not hold|passthrough|null; using "passthrough".`);
missing='passthrough';
}
return{
from,localKey,foreignKeyFn,ffKey,pairs,selectFn,missing,
keyIndex:new Map(),lastFk:new Map(),owner,probe:null,
};
};
const applyJoinFields=(spec,baseRow,lookupRow)=>{
const out={...baseRow};
if(spec.selectFn){
const add=spec.selectFn(lookupRow,baseRow);
if(add&&typeof add==='object')Object.assign(out,add);
return out;
}
for(const[src,dst]of spec.pairs)out[dst]=lookupRow?lookupRow[src]:null;
return out;
};
const lookupJoinRow=(spec,fk)=>{
if(fk==null||!spec.probe)return null;
const ids=spec.probe.index.get(fk);
if(!ids||!ids.size)return null;
const lsrc=sources.get(spec.from);
if(!lsrc)return null;
let id;
for(id of ids){}
return lsrc.live.get(id)||null;
};
const enrichLeftRow=(spec,baseRow,fk)=>{
const lookupRow=lookupJoinRow(spec,fk);
if(lookupRow)return{emit:true,row:applyJoinFields(spec,baseRow,lookupRow)};
if(spec.missing==='hold')return{emit:false,row:baseRow};
if(spec.missing==='null')return{emit:true,row:applyJoinFields(spec,baseRow,null)};
return{emit:true,row:{...baseRow}};
};
const reindexLeft=(spec,leftId,fk)=>{
const prev=spec.lastFk.get(leftId);
if(prev!==undefined&&prev!==fk){
const set=spec.keyIndex.get(prev);
if(set){set.delete(leftId);if(!set.size)spec.keyIndex.delete(prev);}
}
if(fk==null){spec.lastFk.set(leftId,null);return;}
let bucket=spec.keyIndex.get(fk);
if(!bucket){bucket=new Set();spec.keyIndex.set(fk,bucket);}
bucket.add(leftId);
spec.lastFk.set(leftId,fk);
};
const enrichOutgoing=(source,deltas)=>{
const spec=source.join;
const out=[];
for(const d of deltas){
const leftId=String(d.row[idProp]);
if(d.op==='delete'){
reindexLeft(spec,leftId,null);
spec.lastFk.delete(leftId);
out.push(d);
continue;
}
const fk=fkStr(spec.localKey(d.row));
reindexLeft(spec,leftId,fk);
const res=enrichLeftRow(spec,d.row,fk);
if(res.emit)out.push({...d,row:res.row});
}
return out;
};
const attachProbe=(lookup,spec)=>{
if(!lookup.probes)lookup.probes=new Map();
let probe=lookup.probes.get(spec.ffKey);
if(!probe){
probe={fn:spec.foreignKeyFn,index:new Map(),prev:new Map(),specs:new Set()};
lookup.probes.set(spec.ffKey,probe);
for(const[id,row]of lookup.live){
const fk=fkStr(probe.fn(row));
if(fk==null)continue;
let set=probe.index.get(fk);
if(!set){set=new Set();probe.index.set(fk,set);}
set.add(id);
probe.prev.set(id,fk);
}
}
probe.specs.add(spec);
spec.probe=probe;
};
const reenrichFromLookup=(lookup,deltas)=>{
if(!lookup.probes||!lookup.probes.size)return;
const applyList=[];
for(const probe of lookup.probes.values()){
const changed=new Set();
for(const d of deltas){
const id=String(d.row[idProp]);
if(d.op==='delete'){
const pf=probe.prev.get(id);
if(pf!=null){
const set=probe.index.get(pf);
if(set){set.delete(id);if(!set.size)probe.index.delete(pf);}
changed.add(pf);
}
probe.prev.delete(id);
continue;
}
const nf=fkStr(probe.fn(d.row));
const pf=probe.prev.get(id);
if(pf!=null&&pf!==nf){
const set=probe.index.get(pf);
if(set){set.delete(id);if(!set.size)probe.index.delete(pf);}
changed.add(pf);
}
if(nf!=null){
let set=probe.index.get(nf);
if(!set){set=new Set();probe.index.set(nf,set);}
set.add(id);
changed.add(nf);
}
probe.prev.set(id,nf);
}
if(!changed.size)continue;
for(const spec of probe.specs){
for(const fk of changed){
const bucket=spec.keyIndex.get(fk);
if(!bucket)continue;
for(const leftId of bucket){
const baseRow=spec.owner.live.get(leftId);
if(!baseRow)continue;
const res=enrichLeftRow(spec,baseRow,fk);
applyList.push(res.emit?{op:'upsert',row:res.row}:{op:'delete',row:baseRow});
}
}
}
}
if(applyList.length)router.apply(applyList);
};
const ingestSource=(source,deltas,sink)=>{
sink(source.join?enrichOutgoing(source,deltas):deltas);
if(source.probes&&source.probes.size)reenrichFromLookup(source,deltas);
};
const sample=(key,cur,t)=>{
const prev=metricSamples.get(key);
metricSamples.set(key,{cur,t});
if(!prev)return 0;
const dt=(t-prev.t)/1000;
if(dt<=0)return 0;
return(cur-prev.cur)/dt;
};
const computeLag=()=>{
if(!buffering)return 0;
let n=0;
for(const e of bufferLog)if(e.pos>=viewPos)n+=1;
return n;
};
const emitEvent=(event,payload)=>{
const set=listeners.get(event);
if(!set)return;
for(const cb of set){try{cb(payload);}catch{}}
};
const startMetricsTimer=()=>{
if(metricsTimer||metricsIntervalMs<=0)return;
metricsTimer=setInterval(()=>emitEvent('metrics',router.metrics()),metricsIntervalMs);
if(metricsTimer&&typeof metricsTimer.unref==='function')metricsTimer.unref();
};
const stopMetricsTimer=()=>{
if(metricsTimer){clearInterval(metricsTimer);metricsTimer=null;}
};
const createIndexedDBStore=(o)=>{
const factory=o.indexedDB||(typeof indexedDB!=='undefined'?indexedDB:null);
if(!factory)return null;
const dbName=typeof o.dbName==='string'?o.dbName:'lattice-router';
const storeName=typeof o.storeName==='string'?o.storeName:'snapshots';
let dbPromise=null;
const openDb=()=>{
if(dbPromise)return dbPromise;
dbPromise=new Promise((resolve,reject)=>{
let req;
try{req=factory.open(dbName,1);}catch(err){reject(err);return;}
req.onupgradeneeded=()=>{
const db=req.result;
if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName);
};
req.onsuccess=()=>resolve(req.result);
req.onerror=()=>reject(req.error);
});
return dbPromise;
};
return{
set(key,value){
return openDb().then((db)=>new Promise((resolve,reject)=>{
const tx=db.transaction(storeName,'readwrite');
tx.objectStore(storeName).put(value,key);
tx.oncomplete=()=>resolve();
tx.onerror=()=>reject(tx.error);
tx.onabort=()=>reject(tx.error);
}));
},
get(key){
return openDb().then((db)=>new Promise((resolve,reject)=>{
const tx=db.transaction(storeName,'readonly');
const rq=tx.objectStore(storeName).get(key);
rq.onsuccess=()=>resolve(rq.result);
rq.onerror=()=>reject(rq.error);
}));
},
close(){if(dbPromise)dbPromise.then((db)=>{try{db.close();}catch{}},()=>{});},
};
};
const liveWorld=()=>(buffering?[...reconstructWorld(undefined,bufDomain).values()]:worldRows());
const serializeState=()=>({
v:1,
world:liveWorld(),
maxSeq,
checkpoint:Object.fromEntries(seqSeen),
buffer:buffering
?{
on:true,
max:bufMax,
window:bufWindow,
domain:bufDomain,
pos:bufPos,
baseSeq,
baseT,
base:[...baseWorld.entries()],
log:bufferLog.map((e)=>({pos:e.pos,seq:e.seq,t:e.t,op:e.op,key:e.key,row:e.row})),
}
:{on:false},
});
const restoreState=(state)=>{
if(!state||typeof state!=='object')return false;
restoring=true;
try{
router.load(Array.isArray(state.world)?state.world:[]);
}finally{
restoring=false;
}
if(state.checkpoint)router.seenThrough(state.checkpoint);
if(Number.isFinite(state.maxSeq)&&(maxSeq===undefined||state.maxSeq>maxSeq))maxSeq=state.maxSeq;
const b=state.buffer;
if(b&&b.on){
buffering=true;
bufMax=Number.isFinite(b.max)?b.max:null;
bufWindow=Number.isFinite(b.window)?b.window:null;
bufDomain=b.domain==='seq'||b.domain==='time'?b.domain:(seqOf?'seq':'time');
baseWorld=new Map(Array.isArray(b.base)?b.base:[]);
bufferLog.length=0;
for(const e of(Array.isArray(b.log)?b.log:[]))bufferLog.push({...e});
bufPos=Number.isFinite(b.pos)?b.pos:bufferLog.length;
baseSeq=b.baseSeq;
baseT=b.baseT;
viewPos=bufPos;
}
return true;
};
const writeDurable=()=>{
if(!durable)return Promise.resolve();
const snap=serializeState();
const p=Promise.resolve()
.then(()=>durable.set(persistKey,snap))
.catch(()=>{});
persistInFlight=p;
return p.then(()=>{if(persistInFlight===p)persistInFlight=null;});
};
const schedulePersist=()=>{
if(!persistOn||!durable||restoring)return;
if(persistDebounceMs<=0){void writeDurable();return;}
if(persistTimer)return;
persistTimer=setTimeout(()=>{persistTimer=null;void writeDurable();},persistDebounceMs);
if(persistTimer&&typeof persistTimer.unref==='function')persistTimer.unref();
};
const router={
attach(grid,predicate,o={}){
const isValue=typeof predicate!=='function';
const match=isValue
?(row)=>partOf(row)===predicate
:predicate;
if(isValue)warnOverlapCollision(predicate);
const route=makeRoute(grid,match,o);
if(isValue){route.hasPartValue=true;route.partValue=predicate;}
routes.push(route);
if(route.writable)bindWriteBack(route);
return this;
},
attachDefault(grid,o={}){
fallbackRoute=makeRoute(grid,()=>false,o);
fallbackRoute.isDefault=true;
return this;
},
subscribe(predicate,handler,o={}){
const isValue=typeof predicate!=='function';
const match=isValue
?(row)=>partOf(row)===predicate
:predicate;
if(isValue)warnOverlapCollision(predicate);
const route=makeRoute(handler,match,o);
if(isValue){route.hasPartValue=true;route.partValue=predicate;}
routes.push(route);
return this;
},
alert(predicate,condition,handler,o={}){
const match=typeof predicate==='function'
?predicate
:(row)=>partOf(row)===predicate;
const al={
match,
keyOf:resolver(assertRowKeySpec(o.rowKey,'alerts'),defaultKeyOf),
filter:typeof o.filter==='function'?o.filter:null,
condition:typeof condition==='function'?condition:()=>false,
handler:typeof handler==='function'?handler:()=>{},
debounceMs:Number.isFinite(o.debounce)?Number(o.debounce):0,
armed:true,
timer:null,
pending:null,
partition:new Map(),
};
alerts.push(al);
seedAlert(al,worldRows());
evaluateAlert(al);
return this;
},
configure(spec={}){
const optsOf=(r)=>({
rowKey:r.rowKey,transform:r.transform,filter:r.filter,
sort:r.sort,rollup:r.rollup,debounce:r.debounce,where:r.where,
writable:r.writable,onWrite:r.onWrite,onConflict:r.onConflict,
backpressure:r.backpressure,label:r.label,
});
for(const r of(spec.routes||[])){
if(!r)continue;
if(r.default!==undefined){this.attachDefault(r.default,optsOf(r));continue;}
if(r.alert!==undefined){this.alert(r.when,r.condition,r.alert,optsOf(r));continue;}
if(r.subscribe!==undefined){this.subscribe(r.when,r.subscribe,optsOf(r));continue;}
this.attach(r.grid,r.when,optsOf(r));
}
for(const l of(spec.links||[])){
if(l&&l.from&&l.to)this.link(l.from,l.to,l.on!==undefined?l.on:l.relation);
}
if(spec.relate)this.relate(spec.relate);
if(spec.buffer)this.buffer(spec.buffer);
return this;
},
link(source,target,relation){
const lk={from:source,to:target,relation,predicate:null};
links.push(lk);
ensureSelSub(source);
recomputeLink(lk);
const r=routeFor(target);
if(r)materialize(r);
return this;
},
relate(edges){
for(const spec of(edges||[])){
if(!spec||!spec.from||!spec.to)continue;
const rel=spec.on!==undefined?spec.on:(spec.relation!==undefined?spec.relation:spec.rel);
graphEdges.push({from:spec.from,to:spec.to,rel});
if(spec.mutual)graphEdges.push({from:spec.to,to:spec.from,rel:invertRelation(rel)});
}
for(const n of graphNodes())ensureSelSub(n);
computeGraph();
for(const n of graphNodes()){const r=routeFor(n);if(r)materialize(r);}
return this;
},
flush(){
runPending();
return this;
},
detach(grid){
const affectedTargets=new Set();
for(let i=links.length-1;i>=0;i--){
const lk=links[i];
if(lk.from===grid||lk.to===grid){
if(lk.to!==grid)affectedTargets.add(lk.to);
releaseSub(lk.from);
links.splice(i,1);
}
}
let touchedGraph=false;
for(let i=graphEdges.length-1;i>=0;i--){
if(graphEdges[i].from===grid||graphEdges[i].to===grid){
releaseSub(graphEdges[i].from);
graphEdges.splice(i,1);
touchedGraph=true;
}
}
for(let i=routes.length-1;i>=0;i--)if(routes[i].grid===grid)routes.splice(i,1);
if(fallbackRoute&&fallbackRoute.grid===grid)fallbackRoute=null;
pending.delete(grid);
const woff=writeSubs.get(grid);
if(woff){woff();writeSubs.delete(grid);}
if(touchedGraph){computeGraph();for(const n of graphNodes())affectedTargets.add(n);}
for(const t of affectedTargets){const r=routeFor(t);if(r)materialize(r);}
return this;
},
load(snapshot){
unrouted=0;
const buckets=new Map(allRoutes().map((r)=>[r,[]]));
for(const row of(snapshot||[])){
const targets=targetsFor(row);
if(!targets.length){unrouted+=1;if(onUnrouted)onUnrouted(row);continue;}
for(const r of targets)buckets.get(r).push(row);
}
for(const r of allRoutes()){
const bucket=buckets.get(r);
r.partition=new Map(bucket.map((row)=>[String(r.keyOf(row)),row]));
r.metricRows+=bucket.length;
totalRouted+=bucket.length;
}
if(seqOf){
for(const row of(snapshot||[])){
const s=seqOf(row);
if(!Number.isFinite(s))continue;
const idk=String(streamKeyOf(row));
const last=seqSeen.get(idk);
if(last===undefined||s>last)seqSeen.set(idk,s);
if(maxSeq===undefined||s>maxSeq)maxSeq=s;
}
}
for(const lk of links)recomputeLink(lk);
computeGraph();
for(const al of alerts){seedAlert(al,snapshot||[]);evaluateAlert(al);}
for(const r of allRoutes())if(r.bp)resetBackpressure(r);
const diffs=allRoutes().map((r)=>materialize(r));
if(buffering)rebaseBuffer();
viewPos=bufPos;
if(bchannel&&!mirroringIn)mirrorOut(snapshotMessage());
schedulePersist();
return diffs;
},
apply(deltas){
let list=(deltas||[]).filter((d)=>d&&d.row);
if(dedupe){
list=list
.map((d,i)=>[d,i])
.sort((a,b)=>{
const sa=seqVal(a[0]);
const sb=seqVal(b[0]);
if(sa===undefined||sb===undefined)return a[1]-b[1];
return sa-sb||a[1]-b[1];
})
.map((p)=>p[0]);
const fresh=[];
for(const d of list){
const s=seqVal(d);
if(s!==undefined){
const idk=String(streamKeyOf(d.row));
const last=seqSeen.get(idk);
if(last!==undefined&&s<=last){dropped+=1;continue;}
seqSeen.set(idk,s);
if(maxSeq===undefined||s>maxSeq)maxSeq=s;
}
fresh.push(d);
}
list=fresh;
}
if(bchannel&&!mirroringIn&&list.length){
mirrorOut({t:'delta',deltas:list.map((d)=>({op:d.op,row:d.row,seq:d.seq}))});
}
if(buffering){for(const d of list)recordDelta(d);enforceBounds();}
for(const al of alerts){applyAlertDeltas(al,list);evaluateAlert(al);}
if(traveling){schedulePersist();return;}
const intent=new Map(allRoutes().map((r)=>[r,new Map()]));
for(const d of list){
const row=d&&d.row;
if(!row)continue;
if(d.op==='delete'){
let seen=false;
for(const r of allRoutes()){
const k=String(r.keyOf(row));
if(r.partition.has(k)||intent.get(r).has(k)){intent.get(r).set(k,{op:'del'});seen=true;}
}
if(!seen&&!targetsFor(row).length){unrouted+=1;if(onUnrouted)onUnrouted(d);}
continue;
}
const targets=targetsFor(row);
if(!targets.length){unrouted+=1;if(onUnrouted)onUnrouted(d);continue;}
for(const r of allRoutes()){
if(targets.includes(r))continue;
const k=String(r.keyOf(row));
if(r.partition.has(k)||intent.get(r).get(k)?.op==='set')intent.get(r).set(k,{op:'del'});
}
for(const r of targets)intent.get(r).set(String(r.keyOf(row)),{op:'set',row});
}
const changedByRoute=new Map();
for(const r of allRoutes()){
let sets=0;
const changed=intent.get(r).size;
for(const[k,it]of intent.get(r)){
if(it.op==='del'){r.partition.delete(k);continue;}
r.partition.set(k,it.row);
sets+=1;
}
r.metricRows+=sets;
totalRouted+=sets;
changedByRoute.set(r,changed);
}
for(const lk of links)recomputeLink(lk);
computeGraph();
for(const r of allRoutes())scheduleMaterialize(r,changedByRoute.get(r)||0);
viewPos=bufPos;
schedulePersist();
},
push(delta){
const arr=Array.isArray(delta)?delta:[delta];
if(!coalesceMode){this.apply(arr);return this;}
for(const d of arr)buffer.push(d);
if(batchMs!==null){
if(batchMs<=0)this.flushStream();
else if(!streamTimer)streamTimer=setTimeout(()=>this.flushStream(),batchMs);
}
return this;
},
flushStream(){
if(streamTimer){clearTimeout(streamTimer);streamTimer=null;}
if(!buffer.length)return this;
const batch=buffer.splice(0,buffer.length);
this.apply(batch);
return this;
},
flushBackpressure(){
for(const r of allRoutes())if(r.bp&&(r.bpTimer||r.bpPending>0))flushRoute(r);
return this;
},
addSource(feed,o){
let id;
let opt;
if(feed&&typeof feed==='object'){opt=feed;id=opt.id!=null?String(opt.id):`source${++sourceSeq}`;}
else{id=feed!=null?String(feed):`source${++sourceSeq}`;opt=o||{};}
const existing=sources.get(id);
if(existing){
warnOnce(
'data-router:duplicate-source',
`addSource("${id}") was already registered; returning the existing source handle. Use a distinct id per feed.`,
);
return existing.handle;
}
const source={
id,
map:typeof opt.map==='function'?opt.map:null,
ns:makeNamespacer(id,opt.key),
live:new Map(),
ingested:0,
};
source.handle=makeSourceHandle(source);
source.join=resolveJoin(opt.join,source);
sources.set(id,source);
if(source.join&&sources.has(source.join.from))attachProbe(sources.get(source.join.from),source.join);
for(const other of sources.values()){
if(other!==source&&other.join&&other.join.from===id&&other.join.probe==null){
attachProbe(source,other.join);
}
}
return source.handle;
},
removeSource(ref){
const id=ref&&typeof ref==='object'&&ref.id!==undefined?String(ref.id):String(ref);
const source=sources.get(id);
if(source)source.handle.remove();
return this;
},
sources(){return[...sources.keys()];},
metrics(){
const t=nowFn();
const routeMetrics=allRoutes().map((r,i)=>({
index:i,
label:r.label||(r.isDefault?'default':null),
kind:typeof r.grid==='function'?'view':'grid',
rows:r.partition.size,
shown:r.keys.size,
routed:r.metricRows,
throughput:sample(`route:${i}`,r.metricRows,t),
backpressure:r.bp?{pending:r.bpPending,coalesced:r.bpCoalesced}:null,
}));
const sourceMetrics=[...sources.values()].map((s)=>({
id:s.id,
rows:s.live.size,
ingested:s.ingested,
throughput:sample(`source:${s.id}`,s.ingested,t),
}));
return{
routes:routeMetrics,
sources:sourceMetrics,
unrouted,
dropped,
buffered:bufferLog.length,
lag:computeLag(),
throughput:sample('total',totalRouted,t),
};
},
on(event,handler){
if(typeof handler!=='function')return()=>{};
let set=listeners.get(event);
if(!set){set=new Set();listeners.set(event,set);}
set.add(handler);
if(event==='metrics')startMetricsTimer();
return()=>{
set.delete(handler);
if(event==='metrics'&&set.size===0)stopMetricsTimer();
};
},
mountDevtools(el,o={}){
return mountRouterDevtools(this,el,o);
},
get unrouted(){return unrouted;},
get dropped(){return dropped;},
lastSeq(){return maxSeq;},
checkpoint(){return new Map(seqSeen);},
seenThrough(mark){
const entries=mark instanceof Map?mark.entries():Object.entries(mark||{});
for(const[k,v]of entries){
const s=Number(v);
if(!Number.isFinite(s))continue;
const last=seqSeen.get(String(k));
if(last===undefined||s>last)seqSeen.set(String(k),s);
if(maxSeq===undefined||s>maxSeq)maxSeq=s;
}
return this;
},
persist(o={}){
persistOn=true;
if(typeof o.key==='string')persistKey=o.key;
if(Number.isFinite(o.debounce))persistDebounceMs=Number(o.debounce);
if(o.storage&&typeof o.storage.get==='function'&&typeof o.storage.set==='function'){
durable=o.storage;
}else{
let store=null;
try{store=createIndexedDBStore(o);}catch{store=null;}
if(store){
durable=store;
}else{
durable=null;
warnOnce(
'data-router:no-indexeddb',
'router.persist() found no usable IndexedDB (a non-browser runtime, private mode, or blocked storage); the router runs in-memory with no durable resume. Pass { storage } to use another backend.',
);
}
}
return this;
},
async restore(){
if(!durable)return false;
let state;
try{state=await durable.get(persistKey);}catch{return false;}
if(state==null)return false;
return restoreState(state);
},
async flushPersist(){
if(persistTimer){clearTimeout(persistTimer);persistTimer=null;}
await writeDurable();
if(persistInFlight)await persistInFlight;
return this;
},
get persisting(){return persistOn&&!!durable;},
buffer(o={}){
buffering=true;
if(Number.isFinite(o.max))bufMax=Number(o.max);
else if('max'in o&&o.max==null)bufMax=null;
if(Number.isFinite(o.window))bufWindow=Number(o.window);
else if('window'in o&&o.window==null)bufWindow=null;
if(bufMax==null&&bufWindow==null){
bufMax=BUFFER_DEFAULT_CAP;
warnOnce(
'data-router:buffer-default-cap',
`buffer() called with no window or max; applying a default cap of ${BUFFER_DEFAULT_CAP} deltas so the buffer stays bounded. Pass { window } or { max } to size it.`,
);
}
bufDomain=seqOf?'seq':'time';
rebaseBuffer();
return this;
},
scrubTo(target,o={}){
if(!requireBuffer('scrubTo'))return this;
stopReplay();
traveling=true;
const domain=o.by||bufDomain;
travelWorld=reconstructWorld(target,domain);
renderWorld([...travelWorld.values()]);
viewPos=0;
for(const e of bufferLog){
const ev=entryVal(e,domain);
if(target!==undefined&&ev!==undefined&&ev>target)break;
viewPos=e.pos+1;
}
return this;
},
replay(from,to,o={}){
if(!requireBuffer('replay'))return Promise.resolve();
stopReplay();
traveling=true;
const domain=o.by||bufDomain;
replayDomain=domain;
replaySpeed=Number.isFinite(o.speed)?Number(o.speed):0;
travelWorld=reconstructWorld(from,domain);
renderWorld([...travelWorld.values()]);
replayQueue=bufferLog
.filter((e)=>{const ev=entryVal(e,domain);return ev!==undefined&&ev>from&&ev<=to;})
.slice()
.sort((a,b)=>a.pos-b.pos);
replayIndex=0;
replayPaused=false;
return new Promise((resolve)=>{replayResolve=resolve;scheduleReplayStep();});
},
pause(){
replayPaused=true;
if(replayTimer){clearTimeout(replayTimer);replayTimer=null;}
return this;
},
resume(){
if(!replayPaused)return this;
replayPaused=false;
scheduleReplayStep();
return this;
},
live(){
if(!requireBuffer('live'))return this;
stopReplay();
traveling=false;
travelWorld=null;
renderWorld([...reconstructWorld(undefined,bufDomain).values()]);
viewPos=bufPos;
return this;
},
get traveling(){return traveling;},
get buffered(){return bufferLog.length;},
broadcast(o={}){
if(typeof BroadcastChannel!=='function'){
warnOnce(
'data-router:no-broadcastchannel',
'router.broadcast() needs the BroadcastChannel API, which this runtime does not provide; cross-tab mirroring is off.',
);
return this;
}
const name=o&&typeof o.channel==='string'?o.channel:'';
if(!name){
warnOnce(
'data-router:broadcast-channel',
'router.broadcast({ channel }) needs a string channel name; nothing was mirrored.',
);
return this;
}
if(bchannel){bchannel.close();bchannel=null;}
bchannel=new BroadcastChannel(name);
bchannel.onmessage=onMirror;
mirrorOut({t:'hello'});
return this;
},
get broadcasting(){return!!bchannel;},
async query(adapter,request={}){
if(!adapter||typeof adapter.execute!=='function'){
warnOnce(
'data-router:bad-query-source',
'router.query(adapter) needs an adapter with an execute(query) function (a DFQL/DuckDB adapter or a pushdown source); nothing was fetched.',
);
return this;
}
const caps=capabilitiesOf(adapter.capabilities);
const base=request||{};
const baseFilters=base.filters||null;
const plan=[];
unrouted=0;
const whereRoutes=allRoutes().filter((r)=>r.where);
const plainRoutes=allRoutes().filter((r)=>!r.where);
for(const r of whereRoutes){
const combined=andFilters(baseFilters,r.where);
const p=planQuery({...base,filters:combined},caps);
const result=await adapter.execute(p.pushed,base);
let rows=(result.rows||[]).slice();
if(p.residual&&p.residual.filters)rows=rows.filter((row)=>evalNode(p.residual.filters,row));
rows=rows.filter((row)=>r.match(row));
fillRoute(r,rows);
plan.push({
route:r.grid,
pushedFilter:!!(p.pushed&&p.pushed.filters),
residual:p.unpushed.slice(),
});
}
if(plainRoutes.length){
const p=planQuery(base,caps);
const result=await adapter.execute(p.pushed,base);
let rows=(result.rows||[]).slice();
if(p.residual&&p.residual.filters)rows=rows.filter((row)=>evalNode(p.residual.filters,row));
distribute(rows,plainRoutes);
plan.push({base:true,pushedFilter:!!(p.pushed&&p.pushed.filters),residual:p.unpushed.slice()});
}
lastQueryPlanState=plan;
for(const lk of links)recomputeLink(lk);
computeGraph();
for(const r of allRoutes())materialize(r);
return this;
},
lastQueryPlan(){
return lastQueryPlanState?lastQueryPlanState.map((p)=>({...p})):null;
},
destroy(){
if(timer){clearTimeout(timer);timer=null;}
if(streamTimer){clearTimeout(streamTimer);streamTimer=null;}
if(persistTimer){clearTimeout(persistTimer);persistTimer=null;}
if(durable&&typeof durable.close==='function'){try{durable.close();}catch{}}
persistOn=false;
durable=null;
if(bchannel){bchannel.close();bchannel=null;}
mirroringIn=false;
stopReplay();
buffering=false;
traveling=false;
travelWorld=null;
bufferLog.length=0;
baseWorld.clear();
for(const sub of selSubs.values())sub.off();
selSubs.clear();
for(const off of writeSubs.values())off();
writeSubs.clear();
revertingCells.clear();
sources.clear();
stopMetricsTimer();
listeners.clear();
metricSamples.clear();
for(const al of alerts)if(al.timer){clearTimeout(al.timer);al.timer=null;}
alerts.length=0;
for(const r of allRoutes())if(r.bpTimer){clearTimeout(r.bpTimer);r.bpTimer=null;}
links.length=0;
graphEdges.length=0;
pending.clear();
buffer.length=0;
seqSeen.clear();
routes.length=0;
fallbackRoute=null;
},
};
if(opts.config)router.configure(opts.config);
return router;
}
function sameRow(a,b){
if(a===b)return true;
if(!a||!b)return false;
const ka=Object.keys(a);
const kb=Object.keys(b);
if(ka.length!==kb.length)return false;
for(const k of ka)if(a[k]!==b[k])return false;
return true;
}
const __default=createDataRouter;
});
var __entry=__req("packages/modules/data-router/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridDataRouter"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);