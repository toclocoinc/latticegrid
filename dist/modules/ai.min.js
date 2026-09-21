/*!
 * Lattice Grid 1.67.0, ai module
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
__def("packages/modules/ai/reconcile.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"UNVERIFIED",{enumerable:true,get:function(){return UNVERIFIED;}});
Object.defineProperty(__exports,"formsOf",{enumerable:true,get:function(){return formsOf;}});
Object.defineProperty(__exports,"buildRegistry",{enumerable:true,get:function(){return buildRegistry;}});
Object.defineProperty(__exports,"collectNumbers",{enumerable:true,get:function(){return collectNumbers;}});
Object.defineProperty(__exports,"extractNumbers",{enumerable:true,get:function(){return extractNumbers;}});
Object.defineProperty(__exports,"reconcileNumbers",{enumerable:true,get:function(){return reconcileNumbers;}});
const __m0=__req("packages/core/src/internal/util.js");
const isNil=__m0["isNil"];
const EPSILON=1e-6;
const MAX_DECIMALS=4;
const UNVERIFIED='[unverified]';
function roundTo(value,decimals){
const factor=10**decimals;
const r=Math.round(value*factor)/factor;
return r===0?0:r;
}
function decimalsOf(text){
const dot=text.indexOf('.');
if(dot<0)return 0;
return Math.min(text.length-dot-1,MAX_DECIMALS+4);
}
function formsOf(value){
if(!Number.isFinite(value))return[];
const forms=new Set([value]);
for(let d=0;d<=MAX_DECIMALS;d+=1)forms.add(roundTo(value,d));
if(Math.abs(value)<=1&&value!==0){
const pct=value*100;
for(let d=0;d<=MAX_DECIMALS;d+=1)forms.add(roundTo(pct,d));
}
return[...forms];
}
function buildRegistry(values){
const forms=new Set();
const originals=[];
for(const value of values){
if(!Number.isFinite(value))continue;
originals.push(value);
for(const form of formsOf(value))forms.add(form);
}
const list=[...forms];
return{
size:originals.length,
values:originals,
has(candidate,decimals){
for(const form of list){
if(Math.abs(form-candidate)<=EPSILON)return true;
if(roundTo(form,decimals)===candidate)return true;
}
return false;
},
};
}
function collectNumbers(value,out=[],depth=0){
if(depth>8||isNil(value))return out;
if(typeof value==='number'){
if(Number.isFinite(value))out.push(value);
return out;
}
if(typeof value==='string'){
const n=Number(value);
if(value.trim()!==''&&Number.isFinite(n))out.push(n);
return out;
}
if(Array.isArray(value)){
for(const item of value)collectNumbers(item,out,depth+1);
return out;
}
if(typeof value==='object'){
for(const key of Object.keys(value))collectNumbers(value[key],out,depth+1);
}
return out;
}
const SUFFIX=Object.freeze({
k:1e3,K:1e3,m:1e6,M:1e6,bn:1e9,b:1e9,B:1e9,
});
function isIdentifierContext(lead,beforeLead,after,afterNext){
if((lead==='-'||lead==='/')&&/[A-Za-z0-9]/.test(beforeLead))return true;
if(lead===':'&&/\d/.test(beforeLead))return true;
if(/[A-Za-z_]/.test(after))return true;
if((after==='-'||after==='/'||after===':')&&/\d/.test(afterNext))return true;
return false;
}
function extractNumbers(text){
const out=[];
if(typeof text!=='string'||text==='')return out;
const re=/(^|[^\w.])([$£€¥]?)(-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?)(%?)(bn|[kKmMbB])?/g;
let hit;
while((hit=re.exec(text))!==null){
const[,lead,,digits,percent,suffix]=hit;
const start=hit.index+lead.length;
const end=hit.index+hit[0].length;
const beforeLead=hit.index>0?text[hit.index-1]:'';
const after=end<text.length?text[end]:'';
const afterNext=end+1<text.length?text[end+1]:'';
if(isIdentifierContext(lead,beforeLead,after,afterNext))continue;
const clean=digits.replace(/,/g,'');
let value=Number(clean);
if(!Number.isFinite(value))continue;
const decimals=decimalsOf(clean);
if(suffix&&Object.prototype.hasOwnProperty.call(SUFFIX,suffix))value*=SUFFIX[suffix];
void percent;
out.push({raw:text.slice(start,end),start,end,value,decimals,suffix:suffix||''});
}
return out;
}
function isSpaceChar(ch){
return ch===' '||ch==='\t'||ch==='\n'||ch==='\r';
}
function parenSpans(text){
const spans=[];
const stack=[];
for(let i=0;i<text.length;i+=1){
if(text[i]==='(')stack.push(i);
else if(text[i]===')'&&stack.length){
const open=stack.pop();
if(stack.length===0)spans.push({start:open,end:i+1});
}
}
return spans;
}
function sentenceSegments(text){
const segs=[];
const n=text.length;
let start=0;
let i=0;
while(i<n){
const ch=text[i];
const term=ch==='.'||ch==='!'||ch==='?';
const nextIsBoundary=i+1>=n||isSpaceChar(text[i+1]);
if((term&&nextIsBoundary)||ch==='\n'){
let end=i+1;
while(end<n&&(text[end]==='.'||text[end]==='!'||text[end]==='?'))end+=1;
while(end<n&&isSpaceChar(text[end]))end+=1;
segs.push({start,end});
start=end;
i=end;
continue;
}
i+=1;
}
if(start<n)segs.push({start,end:n});
return segs;
}
function mergeRanges(ranges){
const sorted=ranges.slice().sort((a,b)=>a.start-b.start);
const merged=[];
for(const r of sorted){
const last=merged[merged.length-1];
if(last&&r.start<=last.end)last.end=Math.max(last.end,r.end);
else merged.push({start:r.start,end:r.end});
}
return merged;
}
function tidy(s){
return s
.replace(/\(\s*\)/g,'')
.replace(/[ \t]{2,}/g,' ')
.replace(/[ \t]+([,.;:!?)])/g,'$1')
.replace(/([([])[ \t]+/g,'$1')
.replace(/(^|[.!?\n])[ \t]*[.;:,!?]+(?=[ \t]|$|\n)/g,'$1')
.replace(/[ \t]{2,}/g,' ')
.replace(/[ \t]+\n/g,'\n')
.replace(/\n{3,}/g,'\n\n')
.trim();
}
function dropUngrounded(text,ungrounded){
const ranges=[];
const handled=new Set();
for(const p of parenSpans(text)){
const inside=ungrounded.filter((c)=>c.start>=p.start&&c.end<=p.end);
if(!inside.length)continue;
let s=p.start;
if(s>0&&(text[s-1]===' '||text[s-1]==='\t'))s-=1;
ranges.push({start:s,end:p.end});
for(const c of inside)handled.add(c);
}
const segs=sentenceSegments(text);
for(const c of ungrounded){
if(handled.has(c))continue;
const seg=segs.find((s)=>c.start>=s.start&&c.start<s.end);
ranges.push(seg?{start:seg.start,end:seg.end}:{start:c.start,end:c.end});
}
let out='';
let cursor=0;
for(const r of mergeRanges(ranges)){
out+=text.slice(cursor,r.start);
cursor=r.end;
}
out+=text.slice(cursor);
return tidy(out);
}
function reconcileNumbers(text,registry,opts={}){
const mode=opts.mode==='flag'?'flag':'strip';
const grounded=[];
const flagged=[];
if(typeof text!=='string'||text===''){
return{text:text||'',grounded,flagged};
}
const candidates=extractNumbers(text);
const ungrounded=[];
for(const c of candidates){
const ok=registry.has(c.value,c.decimals)
||(c.suffix?registry.has(c.value,0):false);
if(ok)grounded.push(c.raw);
else{flagged.push(c.raw);ungrounded.push(c);}
}
if(mode==='flag'||ungrounded.length===0){
return{text,grounded,flagged};
}
return{text:dropUngrounded(text,ungrounded),grounded,flagged};
}
});
__def("packages/modules/ai/risk.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"buildRiskFacts",{enumerable:true,get:function(){return buildRiskFacts;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const isObject=__m0["isObject"];
const isFunction=__m0["isFunction"];
const warnOnce=__m0["warnOnce"];
function formatterFor(locale){
const nf=new Intl.NumberFormat(locale||'en',{maximumFractionDigits:2});
return(value)=>(Number.isFinite(value)?nf.format(value):String(value));
}
function fact(id,label,value,display,kind){
return{id,label,value:Number.isFinite(value)?value:null,display,kind};
}
function resolveEarnedValue(target){
if(isObject(target.earnedValue)&&!isFunction(target.earnedValue))return target.earnedValue;
const gantt=target.gantt;
if(gantt&&isFunction(gantt.earnedValue)){
try{return gantt.earnedValue(isObject(target.evmOptions)?target.evmOptions:{});}catch{return null;}
}
return null;
}
function resolveSchedule(target){
if(isObject(target.schedule))return target.schedule;
const gantt=target.gantt;
if(gantt&&isObject(gantt.schedule))return gantt.schedule;
return null;
}
function resolveMonitor(target){
if(target.sla&&isFunction(target.sla.breaches))return target.sla;
const board=target.board;
if(board&&board.sla&&isFunction(board.sla.breaches))return board.sla;
return null;
}
function resolveSla(target){
const breaches=Array.isArray(target.breaches)?target.breaches:null;
const warnings=Array.isArray(target.warnings)?target.warnings:null;
if(breaches||warnings)return{breaches:breaches||[],warnings:warnings||[]};
const monitor=resolveMonitor(target);
if(!monitor)return null;
try{if(isFunction(monitor.sync))monitor.sync();}catch{}
try{
return{
breaches:isFunction(monitor.breaches)?monitor.breaches():[],
warnings:isFunction(monitor.warnings)?monitor.warnings():[],
};
}catch{return null;}
}
function recOf(tasks,id){
if(!tasks)return null;
if(isFunction(tasks.get))return tasks.get(id)||null;
if(isObject(tasks))return tasks[id]||null;
return null;
}
function scheduleIds(schedule){
if(Array.isArray(schedule.order))return schedule.order;
const tasks=schedule.tasks;
if(tasks&&isFunction(tasks.keys))return[...tasks.keys()];
if(isObject(tasks))return Object.keys(tasks);
return[];
}
function isIncomplete(rec){
const pct=rec.percentComplete;
return pct==null||!(pct>=100);
}
function pushMetric(facts,id,label,value,fmt){
if(!Number.isFinite(value))return;
facts.push(fact(id,label,value,fmt(value),'metric'));
}
function buildRiskFacts(target={},opts={}){
const src=isObject(target)?target:{};
const fmt=isFunction(opts.fmt)?opts.fmt:formatterFor(opts.locale);
const includeTaskNames=src.includeTaskNames===true;
const includeCost=src.includeCost===true;
const facts=[];
const meta={
kind:'risk',
sources:{schedule:false,earnedValue:false,sla:false},
exposed:{taskNames:false,cost:false},
};
let atRiskRecs=[];
const schedule=resolveSchedule(src);
if(schedule&&schedule.ok){
meta.sources.schedule=true;
const tasks=schedule.tasks;
const criticalIds=Array.isArray(schedule.critical)?schedule.critical:[];
const criticalLeaves=criticalIds
.map((id)=>recOf(tasks,id))
.filter((rec)=>rec&&!rec.isSummary);
atRiskRecs=criticalLeaves.filter(isIncomplete);
let leafTotal=0;
let behind=0;
for(const id of scheduleIds(schedule)){
const rec=recOf(tasks,id);
if(!rec||rec.isSummary)continue;
leafTotal+=1;
if(Number.isFinite(rec.totalFloat)&&rec.totalFloat<0)behind+=1;
}
facts.push(fact('risk.atRisk','Tasks at risk on the critical path',
atRiskRecs.length,fmt(atRiskRecs.length),'count'));
facts.push(fact('risk.critical','Tasks on the critical path',
criticalLeaves.length,fmt(criticalLeaves.length),'count'));
facts.push(fact('risk.behind','Tasks behind schedule (negative float)',
behind,fmt(behind),'count'));
facts.push(fact('risk.tasks','Total tasks',leafTotal,fmt(leafTotal),'count'));
}
const evm=resolveEarnedValue(src);
if(evm&&evm.ok&&isObject(evm.project)){
meta.sources.earnedValue=true;
const p=evm.project;
pushMetric(facts,'risk.spi','Schedule Performance Index (SPI)',p.spi,fmt);
pushMetric(facts,'risk.cpi','Cost Performance Index (CPI)',p.cpi,fmt);
pushMetric(facts,'risk.sv','Schedule Variance (SV)',p.sv,fmt);
pushMetric(facts,'risk.cv','Cost Variance (CV)',p.cv,fmt);
if(includeCost){
pushMetric(facts,'risk.bac','Budget at Completion (BAC)',p.bac,fmt);
pushMetric(facts,'risk.pv','Planned Value (PV)',p.pv,fmt);
pushMetric(facts,'risk.ev','Earned Value (EV)',p.ev,fmt);
pushMetric(facts,'risk.ac','Actual Cost (AC)',p.ac,fmt);
meta.exposed.cost=true;
}
}
const sla=resolveSla(src);
if(sla){
meta.sources.sla=true;
facts.push(fact('risk.sla.breaches','SLA breaches',
sla.breaches.length,fmt(sla.breaches.length),'count'));
facts.push(fact('risk.sla.warnings','SLA warnings',
sla.warnings.length,fmt(sla.warnings.length),'count'));
}
if(includeTaskNames&&atRiskRecs.length){
meta.exposed.taskNames=true;
const maxTasks=Number.isFinite(src.maxTasks)&&src.maxTasks>0?Math.floor(src.maxTasks):10;
for(const rec of atRiskRecs.slice(0,maxTasks)){
const name=rec.name!=null?String(rec.name):String(rec.id);
facts.push(fact(`risk.task.${rec.id}`,'At-risk task',null,name,'context'));
}
}
if(!meta.sources.schedule&&!meta.sources.earnedValue&&!meta.sources.sla){
warnOnce('ai:risk:no-sources',
'a risk summary needs a Gantt and/or a Kanban board to ground on. Pass '
+'{ kind: "risk", gantt, board } (or precomputed earnedValue/schedule/breaches); '
+'there is nothing to summarise.');
}
return{facts,meta};
}
const __default=buildRiskFacts;
});
__def("packages/modules/ai/facts.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"columnFacts",{enumerable:true,get:function(){return columnFacts;}});
Object.defineProperty(__exports,"forecastFacts",{enumerable:true,get:function(){return forecastFacts;}});
Object.defineProperty(__exports,"viewFacts",{enumerable:true,get:function(){return viewFacts;}});
Object.defineProperty(__exports,"buildFactsPacket",{enumerable:true,get:function(){return buildFactsPacket;}});
const __m0=__req("packages/core/src/internal/util.js");
const isObject=__m0["isObject"];
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const __m1=__req("packages/modules/ai/reconcile.js");
const collectNumbers=__m1["collectNumbers"];
const __m2=__req("packages/modules/ai/risk.js");
const buildRiskFacts=__m2["buildRiskFacts"];
function formatterFor(locale){
const nf=new Intl.NumberFormat(locale,{maximumFractionDigits:2});
return(value)=>(Number.isFinite(value)?nf.format(value):String(value));
}
function fact(id,label,value,display,kind,colId){
return{id,label,value:Number.isFinite(value)?value:null,display,kind,colId};
}
function titleOf(grid,colId){
try{
const col=grid.columns.get(colId);
return(col&&(col.title||col.headerName||col.field))||colId;
}catch{return colId;}
}
function isNumericProfile(profile){
return!!profile&&(profile.mean!==null||profile.min!==null||profile.max!==null)
&&!Array.isArray(profile.topValues);
}
function columnFacts(grid,colId,fmt){
let profile=null;
try{profile=grid.statistics.profile(colId);}catch{profile=null;}
if(!profile)return[];
const title=titleOf(grid,colId);
const out=[
fact(`${colId}.count`,`${title}: values present`,profile.present,
fmt(profile.present),'count',colId),
fact(`${colId}.distinct`,`${title}: distinct values`,profile.distinct,
fmt(profile.distinct),'count',colId),
];
if(profile.missing){
out.push(fact(`${colId}.missing`,`${title}: missing`,profile.missing,
fmt(profile.missing),'count',colId));
}
if(Number.isFinite(profile.present)&&profile.present>0&&profile.distinct===profile.present){
out.push(fact(`${colId}.peroccurrence`,`${title}: rows per distinct value`,1,
fmt(1),'count',colId));
}
if(isNumericProfile(profile)){
const pairs=[
['min','minimum',profile.min],['max','maximum',profile.max],
['mean','mean',profile.mean],['median','median',profile.median],
['stddev','standard deviation',profile.stddev],
['iqr','interquartile range',profile.iqr],['outliers','outliers',profile.outliers],
];
for(const[key,name,value]of pairs){
if(!isNil(value))out.push(fact(`${colId}.${key}`,`${title}: ${name}`,value,fmt(value),'stat',colId));
}
if(!isNil(profile.min)&&!isNil(profile.max)){
const range=profile.max-profile.min;
out.push(fact(`${colId}.range`,`${title}: range (max − min)`,range,fmt(range),'stat',colId));
}
}else if(Array.isArray(profile.topValues)){
for(const top of profile.topValues.slice(0,5)){
const share=Math.round(top.share*1000)/10;
out.push({
...fact(`${colId}.top.${String(top.value)}`,
`${title} = ${String(top.value)}: rows`,top.count,
`${fmt(top.count)} (${fmt(share)}%)`,'category',colId),
share,
});
}
}
return out;
}
function forecastFacts(grid,colId,opts,fmt){
let result=null;
try{result=grid.statistics.forecast(colId,opts);}catch{result=null;}
if(!result||!Array.isArray(result.points))return[];
const title=titleOf(grid,colId);
return result.points.slice(0,12).map((point,i)=>{
const value=isObject(point)?point.value??point.yhat??point:point;
return fact(`${colId}.forecast.${i}`,`${title}: forecast step ${i+1}`,
value,fmt(value),'forecast',colId);
});
}
function viewFacts(grid,isRedacted,fmt,opts={}){
const out=[];
let match=0;let total=0;
try{match=grid.rows.matchCount();}catch{match=0;}
try{total=grid.rows.totalCount();}catch{total=match;}
out.push(fact('view.rows','Rows in view',match,fmt(match),'count'));
if(total!==match){
out.push(fact('view.total','Rows before filtering',total,fmt(total),'count'));
}
const maxColumns=Number.isFinite(opts.maxColumns)?opts.maxColumns:12;
let columns=[];
try{columns=grid.columns.visible();}catch{columns=[];}
let used=0;
for(const col of columns){
if(used>=maxColumns)break;
const colId=col.id||col.field;
if(!colId||isRedacted(colId))continue;
const facts=columnFacts(grid,colId,fmt);
if(facts.length){out.push(...facts);used+=1;}
}
return out;
}
function passthroughFact(raw,i,fmt){
const value=typeof raw.value==='number'?raw.value:Number(raw.value);
const display=raw.display!=null?String(raw.display)
:(Number.isFinite(value)?fmt(value):String(raw.value??''));
return fact(String(raw.id??`fact${i}`),String(raw.label??raw.id??`Figure ${i+1}`),
value,display,String(raw.kind??'given'),raw.colId);
}
function buildFactsPacket(grid,target={},opts={}){
const isRedacted=isFunction(opts.isRedacted)?opts.isRedacted:()=>false;
const fmt=formatterFor(opts.locale||'en');
const kind=target.kind||'view';
const facts=[];
let extraMeta=null;
if(kind==='risk'){
const risk=buildRiskFacts(target,{fmt,locale:opts.locale});
facts.push(...risk.facts);
extraMeta=risk.meta;
}else if(kind==='column'||kind==='forecast'){
const colId=target.colId||target.column;
if(colId&&isRedacted(colId)){
return{target,facts:[],groundedValues:[],meta:{redacted:true,colId}};
}
if(colId){
facts.push(...columnFacts(grid,colId,fmt));
if(kind==='forecast')facts.push(...forecastFacts(grid,colId,target.options||{},fmt));
}
}else if(kind==='kpi'||kind==='chart'){
const given=Array.isArray(target.facts)?target.facts:[];
given.forEach((raw,i)=>facts.push(passthroughFact(raw,i,fmt)));
}else{
facts.push(...viewFacts(grid,isRedacted,fmt,{maxColumns:opts.maxColumns}));
}
if(kind!=='kpi'&&kind!=='chart'&&Array.isArray(target.facts)){
target.facts.forEach((raw,i)=>facts.push(passthroughFact(raw,facts.length+i,fmt)));
}
const groundedValues=[];
for(const f of facts){
collectNumbers(f.value,groundedValues);
if(f.share!=null)collectNumbers(f.share,groundedValues);
}
let filtered=false;
try{filtered=grid.rows.matchCount()!==grid.rows.totalCount();}catch{filtered=false;}
return{
target,
facts,
groundedValues,
meta:{kind,filtered,factCount:facts.length,...(extraMeta||{})},
};
}
});
__def("packages/modules/ai/prompt.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"systemPrompt",{enumerable:true,get:function(){return systemPrompt;}});
Object.defineProperty(__exports,"factsBlock",{enumerable:true,get:function(){return factsBlock;}});
Object.defineProperty(__exports,"userPrompt",{enumerable:true,get:function(){return userPrompt;}});
Object.defineProperty(__exports,"buildMessages",{enumerable:true,get:function(){return buildMessages;}});
function systemPrompt(){
return[
'You are a data narrator embedded in a spreadsheet-grade grid. Your only job is to',
'explain, in clear plain language, the figures you are given.',
'',
'Rules, without exception:',
'- Use ONLY the figures provided (in the facts below and in any tool results).',
'  Do not calculate, estimate, extrapolate, or introduce any number of your own.',
'- When you cite a figure, write it exactly as its display string is given.',
'- Do not invent columns, categories, trends, causes or recommendations that the',
'  figures do not support. If the figures do not show something, do not say it.',
'- Be brief: a few sentences. No preamble, no apology, no restating the question.',
'- Any number you write that is not one of the provided figures will be removed',
'  before the user sees it, so never guess a number.',
].join('\n');
}
function factsBlock(packet){
const facts=(packet&&packet.facts)||[];
if(!facts.length)return'No computed figures are available for this selection.';
const lines=facts.map((f)=>`- ${f.label}: ${f.display}`);
const head=packet.meta&&packet.meta.filtered
?'Computed figures for the current (filtered) view:'
:'Computed figures:';
return`${head}\n${lines.join('\n')}`;
}
function userPrompt(packet,opts={}){
const isRisk=packet&&packet.meta&&packet.meta.kind==='risk';
const fallback=isRisk
?'Summarise the delivery risk in one or two plain sentences, leading with the '
+'tasks at risk on the critical path and the schedule performance.'
:'Explain what these figures show, in a few plain sentences.';
const question=opts.question||fallback;
return`${factsBlock(packet)}\n\n${question}`;
}
function buildMessages(packet,opts={}){
const system=opts.system||systemPrompt();
const message=userPrompt(packet,opts);
return{
system,
message,
prompt:`${system}\n\n${message}`,
messages:[
{role:'system',content:system},
{role:'user',content:message},
],
};
}
});
__def("packages/modules/ai/redact.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"DEFAULT_MAX_ROWS",{enumerable:true,get:function(){return DEFAULT_MAX_ROWS;}});
Object.defineProperty(__exports,"redactor",{enumerable:true,get:function(){return redactor;}});
Object.defineProperty(__exports,"rowCap",{enumerable:true,get:function(){return rowCap;}});
Object.defineProperty(__exports,"redactRow",{enumerable:true,get:function(){return redactRow;}});
Object.defineProperty(__exports,"boundRows",{enumerable:true,get:function(){return boundRows;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const DEFAULT_MAX_ROWS=50;
function redactor(redact){
if(isFunction(redact)){
return(colId)=>{
try{return!!redact(colId);}catch{return true;}
};
}
if(Array.isArray(redact)){
const set=new Set(redact.map(String));
return(colId)=>set.has(String(colId));
}
if(typeof redact==='string'&&redact){
return(colId)=>String(colId)===redact;
}
return()=>false;
}
function rowCap(maxRows){
const n=Number(maxRows);
if(!Number.isFinite(n)||n<=0)return DEFAULT_MAX_ROWS;
return Math.floor(n);
}
function redactRow(row,isRedacted){
const out={};
for(const key of Object.keys(row)){
if(isRedacted(key))continue;
out[key]=row[key];
}
return out;
}
function boundRows(rows,isRedacted,cap){
const total=rows.length;
const kept=rows.slice(0,cap).map((row)=>redactRow(row,isRedacted));
return{rows:kept,total,truncated:total>cap};
}
});
__def("packages/modules/ai/tools.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"toolDefinitions",{enumerable:true,get:function(){return toolDefinitions;}});
Object.defineProperty(__exports,"dispatchTool",{enumerable:true,get:function(){return dispatchTool;}});
Object.defineProperty(__exports,"toolResultNumbers",{enumerable:true,get:function(){return toolResultNumbers;}});
const __m0=__req("packages/core/src/internal/util.js");
const isObject=__m0["isObject"];
const isNil=__m0["isNil"];
const __m1=__req("packages/modules/ai/redact.js");
const boundRows=__m1["boundRows"];
const __m2=__req("packages/modules/ai/reconcile.js");
const collectNumbers=__m2["collectNumbers"];
function toolDefinitions(){
return[
{
name:'getSchema',
description:'Describe the grid: its columns, their types and which are filterable/sortable. No row values.',
parameters:{type:'object',properties:{},additionalProperties:false},
},
{
name:'getProfile',
description:'Profile one column: counts, distinct, and (numeric) min/max/mean/median/stddev/outliers or (categorical) top values.',
parameters:{
type:'object',
properties:{colId:{type:'string',description:'The column id.'}},
required:['colId'],additionalProperties:false,
},
},
{
name:'getStatistics',
description:'A single statistic for one column over the filtered rows. '
+'kind is a reduction (sum, avg, min, max, count, first, last, countValues) '
+'or a profile figure (mean, median, stddev, distinct, outliers).',
parameters:{
type:'object',
properties:{
colId:{type:'string'},
kind:{type:'string',description:'The reduction kernel name.'},
},
required:['colId','kind'],additionalProperties:false,
},
},
{
name:'getForecast',
description:'Project a numeric column forward. options: { method, horizon, by, confidence }.',
parameters:{
type:'object',
properties:{
colId:{type:'string'},
options:{type:'object',description:'Forecast options.'},
},
required:['colId'],additionalProperties:false,
},
},
{
name:'runQuery',
description:'Read-only aggregate/filter over the rows already loaded. '
+'spec: { where?: {field, op, value}, groupBy?: field, aggregate?: {field, fn}, limit? }. '
+'Returns computed rows/aggregates; changes nothing.',
parameters:{
type:'object',
properties:{
where:{type:'object'},
groupBy:{type:'string'},
aggregate:{type:'object'},
limit:{type:'number'},
},
additionalProperties:false,
},
},
];
}
const REDUCERS=Object.freeze({
sum:(xs)=>xs.reduce((a,b)=>a+b,0),
avg:(xs)=>(xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0),
min:(xs)=>(xs.length?Math.min(...xs):0),
max:(xs)=>(xs.length?Math.max(...xs):0),
count:(xs)=>xs.length,
});
const WHERE_OPERATORS=Object.freeze(['eq','ne','gt','gte','lt','lte','contains']);
function whereRefusal(where){
if(!isObject(where)||!where.field)return null;
const op=(where).op;
if(typeof op==='string'&&WHERE_OPERATORS.includes(op))return null;
const named=op===undefined||op===null?'none given':`"${String(op)}"`;
return`runQuery cannot evaluate the where operator ${named} on field `
+`"${String((where).field)}", so the query is refused rather than answered `
+`over a row set the clause did not select. Operators runQuery evaluates: `
+`${WHERE_OPERATORS.join(', ')}.`;
}
function matches(row,where){
if(!isObject(where)||!where.field)return true;
const cell=row[where.field];
const target=where.value;
switch(where.op){
case'eq':return cell===target;
case'ne':return cell!==target;
case'gt':return Number(cell)>Number(target);
case'gte':return Number(cell)>=Number(target);
case'lt':return Number(cell)<Number(target);
case'lte':return Number(cell)<=Number(target);
case'contains':
return String(cell??'').toLowerCase().includes(String(target??'').toLowerCase());
default:
throw new Error(
`[lattice] runQuery cannot evaluate the where operator "${String(where.op)}"; the query is `
+`refused rather than answered over a row set the clause did not select. Operators runQuery `
+`evaluates: ${WHERE_OPERATORS.join(', ')}.`,
);
}
}
function rowObjects(grid){
try{
const data=grid.rows.data();
if(Array.isArray(data))return data.filter(isObject);
}catch{}
return[];
}
function runQuery(grid,spec,isRedacted,cap){
const where=spec&&spec.where;
const refusal=whereRefusal(where);
if(refusal)return{error:refusal};
const rows=rowObjects(grid).filter((row)=>matches(row,where));
const agg=isObject(spec)?spec.aggregate:null;
const fn=agg&&REDUCERS[agg.fn]?REDUCERS[agg.fn]:null;
const field=agg&&agg.field;
if(field&&isRedacted(field))return{error:`column "${field}" is redacted`};
if(spec&&spec.groupBy){
if(isRedacted(spec.groupBy))return{error:`column "${spec.groupBy}" is redacted`};
const groups=new Map();
for(const row of rows){
const key=row[spec.groupBy];
const bucket=groups.get(key)||[];
bucket.push(row);
groups.set(key,bucket);
}
const limit=Number.isFinite(spec.limit)?Math.min(spec.limit,cap):cap;
const out=[];
for(const[key,bucket]of groups){
if(out.length>=limit)break;
const value=fn
?fn(bucket.map((r)=>Number(r[field])).filter(Number.isFinite))
:bucket.length;
out.push({[spec.groupBy]:key,value});
}
return{groups:out,groupCount:groups.size,truncated:groups.size>out.length};
}
if(fn){
const value=fn(rows.map((r)=>Number(r[field])).filter(Number.isFinite));
return{value,rows:rows.length};
}
const bounded=boundRows(rows,isRedacted,Number.isFinite(spec&&spec.limit)
?Math.min(spec.limit,cap):cap);
return bounded;
}
function dispatchTool(name,args,grid,ctx){
const a=isObject(args)?args:{};
const isRedacted=ctx.isRedacted||(()=>false);
const colId=a.colId||a.column;
if(colId&&isRedacted(colId)&&name!=='runQuery'){
return{error:`column "${colId}" is redacted and cannot be inspected`};
}
switch(name){
case'getSchema':{
let schema={};
try{schema=grid.ai.schema({maxColumns:a.maxColumns});}catch{schema={};}
return stripRedactedSchema(schema,isRedacted);
}
case'getProfile':{
if(isNil(colId))return{error:'getProfile needs a colId'};
try{return grid.statistics.profile(colId)??{error:`no profile for "${colId}"`};}
catch(e){return{error:String(e&&e.message||e)};}
}
case'getStatistics':{
if(isNil(colId))return{error:'getStatistics needs a colId'};
return columnStatistic(grid,colId,a.kind);
}
case'getForecast':{
if(isNil(colId))return{error:'getForecast needs a colId'};
try{return grid.statistics.forecast(colId,a.options||{})??{error:`no forecast for "${colId}"`};}
catch(e){return{error:String(e&&e.message||e)};}
}
case'runQuery':
return runQuery(grid,a,isRedacted,ctx.cap);
default:
return{error:`unknown tool "${name}"`};
}
}
const PROFILE_FIGURES=new Set(['mean','median','stddev','distinct','outliers',
'q1','q3','iqr','present','missing']);
function columnStatistic(grid,colId,kind){
if(isNil(kind))return{error:'getStatistics needs a kind'};
if(PROFILE_FIGURES.has(kind)){
try{
const profile=grid.statistics.profile(colId);
if(profile&&kind in profile)return{colId,kind,value:profile[kind]};
}catch{}
}
try{return{colId,kind,value:grid.statistics.reduce(colId,kind)};}
catch(e){return{error:String((e&&e.message)||e)};}
}
function stripRedactedSchema(schema,isRedacted){
if(!isObject(schema))return schema;
const out={...schema};
if(Array.isArray(out.columns)){
out.columns=out.columns.filter((c)=>!isRedacted(c&&(c.id||c.field||c.name)));
}
return out;
}
function toolResultNumbers(results,out){
for(const result of results)collectNumbers(result,out);
return out;
}
});
__def("packages/modules/ai/narrative.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"runNarrative",{enumerable:true,get:function(){return runNarrative;}});
const __m0=__req("packages/core/src/internal/util.js");
const isObject=__m0["isObject"];
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/ai/facts.js");
const buildFactsPacket=__m1["buildFactsPacket"];
const __m2=__req("packages/modules/ai/prompt.js");
const buildMessages=__m2["buildMessages"];
const __m3=__req("packages/modules/ai/tools.js");
const toolDefinitions=__m3["toolDefinitions"];
const dispatchTool=__m3["dispatchTool"];
const toolResultNumbers=__m3["toolResultNumbers"];
const __m4=__req("packages/modules/ai/redact.js");
const redactor=__m4["redactor"];
const rowCap=__m4["rowCap"];
const __m5=__req("packages/modules/ai/reconcile.js");
const buildRegistry=__m5["buildRegistry"];
const reconcileNumbers=__m5["reconcileNumbers"];
const MAX_ROUNDS=4;
function normalise(res){
if(typeof res==='string')return{text:res,toolCalls:[],structured:null};
if(!isObject(res))return{text:'',toolCalls:[],structured:null};
const toolCalls=Array.isArray(res.toolCalls)?res.toolCalls
:(Array.isArray(res.tool_calls)?res.tool_calls:[]);
let text=typeof res.text==='string'?res.text
:(typeof res.content==='string'?res.content:'');
if(!text&&isObject(res.structured)){
const s=res.structured;
text=String(s.narrative||s.text||s.summary||'');
}
return{text,toolCalls,structured:res.structured??null};
}
function readToolCall(call){
const fn=isObject(call.function)?call.function:call;
let args=fn.arguments??call.args??{};
if(typeof args==='string'){
try{args=JSON.parse(args);}catch{args={};}
}
return{id:call.id??call.toolCallId??fn.name,name:fn.name||call.name,args:isObject(args)?args:{}};
}
async function runNarrative(grid,ask,target={},opts={}){
const isRedacted=redactor(opts.redact);
const cap=rowCap(opts.maxRows);
const packet=buildFactsPacket(grid,target,{
isRedacted,locale:opts.locale,maxColumns:opts.maxColumns,
});
const messages=buildMessages(packet,{question:opts.question});
const useTools=opts.tools!==false&&opts.tools!==undefined?!!opts.tools:false;
const groundedValues=[...packet.groundedValues];
const base={
system:messages.system,
message:messages.message,
prompt:messages.prompt,
schema:safeSchema(grid),
signal:opts.signal,
};
if(useTools)base.tools=toolDefinitions();
const chat=[...messages.messages];
let rounds=0;
let text='';
while(true){
const res=normalise(await ask({...base,messages:chat}));
rounds+=1;
if(useTools&&res.toolCalls.length&&rounds<MAX_ROUNDS){
const results=[];
for(const raw of res.toolCalls){
const{id,name,args}=readToolCall(raw);
const result=dispatchTool(name,args,grid,{isRedacted,cap});
results.push(result);
chat.push({role:'assistant',content:'',toolCall:{id,name,args}});
chat.push({role:'tool',toolCallId:id,name,content:JSON.stringify(result)});
}
toolResultNumbers(results,groundedValues);
continue;
}
text=res.text||'';
break;
}
if(!text){
warnOnce('ai:narrative:empty',
'the AI ask() returned no narrative text; nothing to show. Ensure your ask() resolves '
+'to a string or { text } for a narrative prompt.');
}
const registry=buildRegistry(groundedValues);
const reconciled=reconcileNumbers(text,registry,{mode:opts.mode});
return{
text:reconciled.text,
facts:packet.facts,
grounded:reconciled.grounded,
flagged:reconciled.flagged,
packet,
rounds,
mode:useTools?'tools':'packet',
};
}
function safeSchema(grid){
try{return grid.ai.schema();}catch{return{};}
}
});
__def("packages/core/src/ai/schema.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"SCHEMA_VERSION",{enumerable:true,get:function(){return SCHEMA_VERSION;}});
Object.defineProperty(__exports,"OPERATORS",{enumerable:true,get:function(){return OPERATORS;}});
Object.defineProperty(__exports,"OPERATOR_ARITY",{enumerable:true,get:function(){return OPERATOR_ARITY;}});
Object.defineProperty(__exports,"OPERATORS_BY_FAMILY",{enumerable:true,get:function(){return OPERATORS_BY_FAMILY;}});
Object.defineProperty(__exports,"INTENT_ACTIONS",{enumerable:true,get:function(){return INTENT_ACTIONS;}});
Object.defineProperty(__exports,"CLEAR_TARGETS",{enumerable:true,get:function(){return CLEAR_TARGETS;}});
Object.defineProperty(__exports,"DEFAULT_LIMITS",{enumerable:true,get:function(){return DEFAULT_LIMITS;}});
Object.defineProperty(__exports,"familyOf",{enumerable:true,get:function(){return familyOf;}});
Object.defineProperty(__exports,"describeGrid",{enumerable:true,get:function(){return describeGrid;}});
Object.defineProperty(__exports,"columnIndex",{enumerable:true,get:function(){return columnIndex;}});
Object.defineProperty(__exports,"operatorsFor",{enumerable:true,get:function(){return operatorsFor;}});
Object.defineProperty(__exports,"promptText",{enumerable:true,get:function(){return promptText;}});
Object.defineProperty(__exports,"toolDefinition",{enumerable:true,get:function(){return toolDefinition;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isObject=__m0["isObject"];
const SCHEMA_VERSION=1;
const OPERATORS=Object.freeze(([
'eq','ne',
'lt','lte','gt','gte',
'between','notBetween',
'in','notIn',
'contains','notContains','startsWith','endsWith','matches',
'blank','notBlank',
'containsAny','containsAll','containsNone',
]));
const OPERATOR_ARITY=Object.freeze({
eq:'one',ne:'one',
lt:'one',lte:'one',gt:'one',gte:'one',
between:'range',notBetween:'range',
in:'set',notIn:'set',
contains:'one',notContains:'one',startsWith:'one',endsWith:'one',matches:'one',
blank:'none',notBlank:'none',
containsAny:'set',containsAll:'set',containsNone:'set',
});
const OPERATORS_BY_FAMILY=Object.freeze(({
text:Object.freeze([
'eq','ne','contains','notContains','startsWith','endsWith','matches',
'in','notIn','blank','notBlank',
]),
number:Object.freeze([
'eq','ne','lt','lte','gt','gte','between','notBetween','in','notIn',
'blank','notBlank',
]),
boolean:Object.freeze(['eq','ne','blank','notBlank']),
date:Object.freeze([
'eq','ne','lt','lte','gt','gte','between','notBetween','blank','notBlank',
]),
lookup:Object.freeze(['eq','ne','in','notIn','blank','notBlank']),
lookupMulti:Object.freeze([
'containsAny','containsAll','containsNone','in','notIn','blank','notBlank',
]),
object:Object.freeze(['eq','ne','blank','notBlank']),
}));
const INTENT_ACTIONS=Object.freeze([
Object.freeze({
name:'setFilters',
summary:'Replace the whole filter tree. Omit to leave filters alone; use clear to remove them.',
params:Object.freeze({
filters:'a condition {col, op, value} or a group {op: "and"|"or"|"not", conditions: [...]}',
}),
}),
Object.freeze({
name:'setSort',
summary:'Replace the sort model. First entry is the primary sort.',
params:Object.freeze({sort:'array of {col, dir: "asc"|"desc"}'}),
}),
Object.freeze({
name:'groupBy',
summary:'Group rows by one or more columns, outermost first.',
params:Object.freeze({columns:'array of column ids'}),
}),
Object.freeze({
name:'showColumns',
summary:'Make columns visible.',
params:Object.freeze({columns:'array of column ids'}),
}),
Object.freeze({
name:'hideColumns',
summary:'Hide columns.',
params:Object.freeze({columns:'array of column ids'}),
}),
Object.freeze({
name:'setQuick',
summary:'Set the quick-filter text, which matches across every column.',
params:Object.freeze({text:'the search text'}),
}),
Object.freeze({
name:'clear',
summary:'Remove something already applied.',
params:Object.freeze({what:'"filters" | "sort" | "group" | "quick" | "all"'}),
}),
]);
const CLEAR_TARGETS=Object.freeze(['filters','sort','group','quick','all']);
const DEFAULT_LIMITS=Object.freeze({
maxColumns:150,
maxOptions:20,
maxTotalOptions:400,
maxLabelLength:60,
maxFilterChars:600,
});
function resolveLimits(opts){
const out={...DEFAULT_LIMITS};
if(!isObject(opts))return out;
for(const key of Object.keys(DEFAULT_LIMITS)){
const value=(opts)[key];
if(typeof value==='number'&&Number.isFinite(value)&&value>=0){
(out)[key]=Math.floor(value);
}
}
return out;
}
function shorten(value,max){
const text=value===null||value===undefined?'':String(value);
if(text.length<=max)return text;
return`${text.slice(0,Math.max(0,max-1))}…`;
}
function readColumns(grid){
if(Array.isArray(grid))return grid;
if(!grid)return[];
const api=grid.columns;
try{
if(Array.isArray(api))return api;
if(api&&isFunction(api.all))return api.all()||[];
if(isFunction(api))return api()||[];
}catch{
return[];
}
return[];
}
function familyOf(column){
const lookup=column&&column.lookup;
if(lookup)return lookup.multiple?'lookupMulti':'lookup';
const base=(column&&column.dataType&&column.dataType.base)||column?.type||'text';
if(base==='number'||base==='boolean'||base==='object')return base;
if(base==='date'||base==='dateString')return'date';
return'text';
}
function readOptions(column,perColumn,remaining){
const lookup=column&&column.lookup;
if(!lookup||!isFunction(lookup.options))return null;
let all=[];
try{
all=lookup.options()||[];
}catch{
return null;
}
const cap=Math.max(0,Math.min(perColumn,remaining));
const kept=[];
for(const option of all.slice(0,cap)){
if(!isObject(option))continue;
kept.push({value:option.id,label:String(option.label??option.id??'')});
}
return{options:kept,total:all.length,open:lookup.allowCustom===true};
}
function describeColumn(column,limits,budget,truncated){
const id=String(column.id);
const family=familyOf(column);
const out={
id,
title:shorten(column.title??id,limits.maxLabelLength),
type:String(column.type||family),
family,
filterable:!(column.filter&&column.filter.enabled===false),
sortable:!(column.sort&&column.sort.enabled===false),
groupable:column.allowGroup!==false,
hidden:!!(column.layout&&column.layout.hidden),
};
if(column.layout&&column.layout.lockVisible)out.lockVisible=true;
const report=readOptions(column,limits.maxOptions,budget.remaining);
if(report){
out.options=report.options.map((o)=>(
o.label===String(o.value)?{value:o.value}:{value:o.value,label:shorten(o.label,limits.maxLabelLength)}
));
budget.remaining-=report.options.length;
if(report.options.length<report.total){
out.optionsTotal=report.total;
truncated.push(`column "${id}": ${report.options.length} of ${report.total} options listed`);
}
if(report.open)out.optionsOpen=true;
}
return out;
}
function readState(grid,limits,truncated){
const state={sort:[],group:[],quick:'',filters:null};
if(!grid)return state;
try{
if(grid.sort&&isFunction(grid.sort.get)){
state.sort=(grid.sort.get()||[]).map((e)=>({col:e.col,dir:e.dir}));
}
if(grid.columns&&isFunction(grid.columns.state)){
const group=(grid.columns.state()||[])
.filter((c)=>typeof c.groupIndex==='number'&&c.groupIndex>=0)
.sort((a,b)=>a.groupIndex-b.groupIndex);
state.group=group.map((c)=>c.id);
}
if(grid.filters&&isFunction(grid.filters.get)){
const filters=grid.filters.get()||null;
const text=filters?JSON.stringify(filters):'';
if(text.length>limits.maxFilterChars){
truncated.push('the current filter tree was too large to include; it is summarised as "complex"');
state.filters='complex';
}else{
state.filters=filters;
}
}
}catch{
}
return state;
}
function describeGrid(grid,opts={}){
const limits=resolveLimits(opts);
const truncated=[];
const budget={remaining:limits.maxTotalOptions};
let columns=readColumns(grid).filter((c)=>c&&typeof c.id==='string');
if(opts.includeHidden===false){
columns=columns.filter((c)=>!(c.layout&&c.layout.hidden));
}
const total=columns.length;
if(total>limits.maxColumns){
truncated.push(`${total-limits.maxColumns} of ${total} columns omitted; ask the user to narrow the question`);
columns=columns.slice(0,limits.maxColumns);
}
const described=columns.map((c)=>describeColumn(c,limits,budget,truncated));
if(budget.remaining<=0&&described.some((c)=>c.options)){
truncated.push(`the total option budget of ${limits.maxTotalOptions} was reached`);
}
const schema={
schemaVersion:SCHEMA_VERSION,
grid:{columns:total,described:described.length},
columns:described,
operators:{
all:[...OPERATORS],
byFamily:OPERATORS_BY_FAMILY,
arity:OPERATOR_ARITY,
},
actions:INTENT_ACTIONS.map((a)=>({name:a.name,summary:a.summary,params:a.params})),
truncated,
};
if(opts.includeState!==false)schema.state=readState(grid,limits,truncated);
return schema;
}
function columnIndex(schema){
const index=new Map();
const columns=schema&&Array.isArray(schema.columns)?schema.columns:[];
for(const column of columns){
if(column&&typeof column.id==='string')index.set(column.id,column);
}
return index;
}
function operatorsFor(column){
const family=column&&column.family;
return(OPERATORS_BY_FAMILY)[family]||OPERATORS_BY_FAMILY.text;
}
function columnLine(column){
const flags=[
column.filterable?'filter':'',
column.sortable?'sort':'',
column.groupable?'group':'',
column.hidden?'hidden':'',
].filter(Boolean).join(',');
let line=`  ${column.id} | ${column.title} | ${column.family} | ${flags}`;
if(column.options){
const values=column.options.map((o)=>(
o.label===undefined?String(o.value):`${String(o.value)}=${o.label}`
));
const more=column.optionsTotal?` (+${column.optionsTotal-column.options.length} more)`:'';
line+=` | options: ${values.join(', ')}${more}`;
if(column.optionsOpen)line+=' (values outside this list are allowed)';
}
return line;
}
function promptText(schema){
if(!isObject(schema))return'';
const lines=[];
lines.push(`LATTICE GRID SCHEMA v${schema.schemaVersion||SCHEMA_VERSION}`);
lines.push('');
lines.push('COLUMNS  id | title | family | capabilities | options');
for(const column of schema.columns||[])lines.push(columnLine(column));
lines.push('');
lines.push('OPERATORS by family');
for(const[family,ops]of Object.entries(schema.operators?.byFamily||OPERATORS_BY_FAMILY)){
lines.push(`  ${family}: ${ops.join(', ')}`);
}
lines.push('');
lines.push('OPERATOR VALUE SHAPES');
lines.push('  no value: blank, notBlank');
lines.push('  [lo, hi]: between, notBetween');
lines.push('  array:    in, notIn, containsAny, containsAll, containsNone');
lines.push('  scalar:   everything else');
lines.push('');
lines.push('ACTIONS (an intent is {"actions": [...]}; nothing outside this list is permitted)');
for(const action of schema.actions||INTENT_ACTIONS){
lines.push(`  ${action.name}: ${action.summary}`);
for(const[key,shape]of Object.entries(action.params||{}))lines.push(`      ${key}: ${shape}`);
}
if(schema.state){
lines.push('');
lines.push('CURRENT VIEW');
lines.push(`  sort: ${schema.state.sort?.length?schema.state.sort.map((s)=>`${s.col} ${s.dir}`).join(', '):'none'}`);
lines.push(`  group: ${schema.state.group?.length?schema.state.group.join(', '):'none'}`);
lines.push(`  quick filter: ${schema.state.quick?JSON.stringify(schema.state.quick):'none'}`);
lines.push(`  filters: ${schema.state.filters?JSON.stringify(schema.state.filters):'none'}`);
}
if(schema.truncated&&schema.truncated.length){
lines.push('');
lines.push('INCOMPLETE: this schema was shortened to fit:');
for(const note of schema.truncated)lines.push(`  ${note}`);
}
lines.push('');
lines.push('Reply with JSON only. Use exactly the column ids above; never invent one.');
return lines.join('\n');
}
function toolDefinition(schema,opts={}){
const ids=(schema&&Array.isArray(schema.columns)?schema.columns:[]).map((c)=>c.id);
const maxEnum=typeof opts.maxEnum==='number'?opts.maxEnum:200;
const columnId=ids.length&&ids.length<=maxEnum
?{type:'string',description:'A column id from the grid schema.',enum:ids}
:{type:'string',description:'A column id from the grid schema.'};
const condition={
type:'object',
description:'A single condition, or a group combining conditions.',
properties:{
col:columnId,
op:{type:'string',enum:[...OPERATORS,'and','or','not']},
value:{description:'Scalar, [lo, hi] for between, or an array for the set operators.'},
conditions:{type:'array',description:'Child nodes, when op is and/or/not.',items:{type:'object'}},
},
};
return{
name:'lattice_grid_intent',
description:
'Reshape the data grid: filter, sort, group, show or hide columns. Returns a plan the '
+'user reviews before it is applied. Use only column ids from the supplied schema.',
input_schema:{
type:'object',
properties:{
actions:{
type:'array',
description:'The steps to take, in order.',
items:{
type:'object',
properties:{
type:{type:'string',enum:INTENT_ACTIONS.map((a)=>a.name)},
filters:condition,
sort:{
type:'array',
items:{
type:'object',
properties:{col:columnId,dir:{type:'string',enum:['asc','desc']}},
required:['col','dir'],
},
},
columns:{type:'array',items:columnId},
text:{type:'string'},
what:{type:'string',enum:[...CLEAR_TARGETS]},
},
required:['type'],
},
},
explain:{type:'string',description:'One short sentence describing the change, for the user.'},
},
required:['actions'],
},
};
}
});
__def("packages/core/src/i18n/catalogue.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"EN_GB",{enumerable:true,get:function(){return EN_GB;}});
Object.defineProperty(__exports,"MESSAGE_KEYS",{enumerable:true,get:function(){return MESSAGE_KEYS;}});
const EN_GB=Object.freeze({
'count.rows':{one:'{count} row',other:'{count} rows'},
'count.comments':{one:'{count} comment',other:'{count} comments'},
'comments.someUnresolved':'{comments}, {unresolved} unresolved',
'comments.allResolved':'{comments}, all resolved',
'count.unresolvedComments':{
one:'{count} unresolved comment',
other:'{count} unresolved comments',
},
'count.items':{one:'{count} item',other:'{count} items'},
'count.keys':{one:'{count} key',other:'{count} keys'},
'count.values':{one:'value',other:'values'},
'count.waiting':{one:'{count} waiting',other:'{count} waiting'},
'count.rowsAdded':{one:'{count} row added',other:'{count} rows added'},
'count.rowsRemoved':{one:'{count} row removed',other:'{count} rows removed'},
'value.empty':'empty',
'a11y.sort.cleared':'Sort cleared',
'a11y.sort.by':'Sorted by {columns}',
'a11y.sort.column':'{column} {direction}',
'a11y.sort.ascending':'ascending',
'a11y.sort.descending':'descending',
'a11y.filter.cleared':'Filter cleared, {rows}',
'a11y.filter.applied':'Filtered to {shown} of {total}',
'a11y.find.count':{
one:'{current} of {count} match',
other:'{current} of {count} matches',
},
'a11y.find.countLoaded':{
one:'{current} of {count} match in loaded rows',
other:'{current} of {count} matches in loaded rows',
},
'a11y.find.none':'No matches',
'a11y.find.noneLoaded':'No matches in loaded rows',
'a11y.selection.cleared':'Selection cleared',
'a11y.selection.count':{
one:'{count} row selected',
other:'{count} rows selected',
},
'tabs.tablist':'Tabs',
'a11y.tabs.selected':'{label} tab selected',
'a11y.scrollbar.horizontal':'Horizontal scrollbar',
'a11y.scrollbar.vertical':'Vertical scrollbar',
'layout.region':'Dashboard layout',
'layout.move':'Move {title}',
'layout.resize':'Resize {title}',
'layout.close':'Close {title}',
'a11y.layout.grabbed':'{title} grabbed, column {x} of {columns}, row {y}',
'a11y.layout.position':'{title}, column {x} of {columns}, row {y}',
'a11y.layout.dropped':'{title} dropped, column {x} of {columns}, row {y}',
'a11y.layout.cancelled':'{title} move cancelled',
'a11y.layout.resizeCancelled':'{title} resize cancelled',
'a11y.layout.reverted':'{title} returned to column {x}, row {y}',
'a11y.layout.resizeGrabbed':'{title} resize grabbed, {w} by {h} cells',
'a11y.layout.resizeStep':'{title}, {w} by {h} cells',
'a11y.layout.resized':'{title} resized to {w} by {h} cells',
'a11y.layout.closed':'{title} closed',
'layout.maximise':'Maximise {title}',
'layout.minimise':'Minimise {title}',
'layout.restore':'Restore {title}',
'a11y.layout.maximised':'{title} maximised, filling the dashboard; press Escape to restore it',
'a11y.layout.minimised':'{title} minimised',
'a11y.layout.restored':'{title} restored to column {x}, row {y}',
'a11y.group.cleared':'Grouping cleared',
'a11y.group.by':'Grouped by {columns}',
'a11y.group.expanded':'{label} expanded, {rows} shown',
'a11y.group.collapsed':'{label} collapsed, {rows} shown',
'a11y.page.position':'Page {page} of {pages}',
'a11y.updates.paused':'Updates paused',
'a11y.updates.resumed':'Updates resumed',
'a11y.edit.refusedOne':'Edit to {column} was refused and put back to {value}{reason}',
'a11y.edit.refusedMany':{
one:'{count} edit was refused and put back{reason}',
other:'{count} edits were refused and put back{reason}',
},
'a11y.edit.reason':', {reason}',
'a11y.history.undo':'Undid {label}',
'a11y.history.redo':'Redid {label}',
'a11y.history.undoLast':'Undid the last change',
'a11y.history.redoLast':'Redid the last change',
'a11y.column.cannotResize':'{column} cannot be resized',
'a11y.column.resized':'{column} is {width} pixels wide',
'a11y.column.atMinimum':'{column} is at its narrowest, {width} pixels',
'a11y.column.atMaximum':'{column} is at its widest, {width} pixels',
'a11y.column.cannotMove':'{column} cannot be moved',
'a11y.column.alreadyFirst':'{column} is already first in its group',
'a11y.column.alreadyLast':'{column} is already last in its group',
'a11y.column.cannotMoveThere':'{column} cannot be moved there',
'a11y.column.moved':'{column} moved to position {at} of {of}',
'a11y.group.formed':'{column} grouped with {other} in a new band',
'a11y.group.dissolved':'band {group} dissolved',
'a11y.group.renamed':'band renamed to {group}',
'a11y.group.moved':'band {group} moved to position {at} of {of}',
'a11y.column.addedToGroup':'{column} added to band {group}',
'a11y.column.removedFromGroup':'{column} removed from its band',
'a11y.column.notInGroup':'{column} is not in a band',
'a11y.column.cannotGroup':'{column} cannot be grouped',
'a11y.group.cannotMove':'band {group} cannot be moved there',
'columngroup.newGroup':'New group',
'columngroup.rename':'Rename band',
'columngroup.dissolve':'Dissolve band',
'columngroup.group':'Group with adjacent column',
'header.filter':'Filter {column}',
'header.menu':'Column menu for {column}',
'header.toggleGroup':'Toggle {group}',
'header.dragHint':'Drag {column} to reorder, or onto another column to group',
'header.dragRole':'draggable column header',
'header.group':'group',
'header.selectAllRows':'Select all rows',
'header.clearSelection':'Clear selection',
'cell.selectRow':'Select row',
'cell.detail.show':'Show detail',
'cell.detail.hide':'Hide detail',
'cell.detail.showInPane':'Show in the detail pane',
'cell.detail.showingInPane':'Showing in the detail pane',
'a11y.panel.cannotMove':'{column} cannot be moved',
'a11y.panel.alreadyFirst':'{column} is already first',
'a11y.panel.alreadyLast':'{column} is already last',
'a11y.panel.moved':'{column} moved to position {at} of {of}',
'a11y.panel.removedFrom':'{column} removed from {list}',
'a11y.panel.addedTo':'{column} added to {list}',
'a11y.panel.cannotAddTo':'{column} cannot be added to {list}',
'a11y.range.written':{
one:'{count} cell updated',
other:'{count} cells updated',
},
'paste.preview.title':'Review paste',
'paste.preview.summary':{
one:'{changes} cell will change, {rejected} rejected.',
other:'{changes} cells will change, {rejected} rejected.',
},
'paste.preview.changesHeading':{
one:'{count} change',
other:'{count} changes',
},
'paste.preview.rejectedHeading':{
one:'{count} rejected',
other:'{count} rejected',
},
'paste.preview.colOld':'Current',
'paste.preview.colNew':'New',
'paste.preview.colCell':'Cell',
'paste.preview.colReason':'Reason',
'paste.preview.empty':'This paste would change nothing.',
'paste.preview.confirm':'Apply',
'paste.preview.cancel':'Cancel',
'paste.preview.reason.permission':'Not permitted',
'paste.preview.reason.readOnly':'Read-only',
'paste.preview.reason.validation':'Invalid value',
'paste.preview.reason.locked':'Being edited',
'paste.preview.reason.missing':'No such cell',
'a11y.paste.previewOpened':{
one:'Paste preview: {changes} cell changes, {rejected} rejected. Review, then apply or cancel.',
other:'Paste preview: {changes} cell changes, {rejected} rejected. Review, then apply or cancel.',
},
'a11y.paste.cancelled':'Paste cancelled; nothing changed',
'status.total':'{rows}',
'status.shownOfTotal':'{shown} of {total}',
'status.selected':'{count} selected',
'status.count':'Count {count}',
'status.loading':'Loading {count}…',
'status.loadingOf':'Loading {loaded} of {total} ({percent}%)',
'status.stat.sum':'Sum',
'status.stat.min':'Min',
'status.stat.max':'Max',
'status.stat.avg':'Avg',
'status.paused':'Paused',
'status.pausedWaiting':'Paused · {waiting}',
'status.coalesced':'{count} coalesced',
'status.hiddenComments':'{comments} on hidden rows',
'pagination.label':'Pagination',
'pagination.first':'First page',
'pagination.previous':'Previous page',
'pagination.next':'Next page',
'pagination.last':'Last page',
'pagination.page':'Page',
'pagination.ofPages':'of {pages}',
'pagination.summary':'{from}–{to} of {total}',
'pagination.pageSize':'Rows per page',
'pagination.range':'{from}–{to}',
'pagination.jump':'Page number, press Enter to jump',
'pagination.jumpBounded':'Page number, 1 to {pages}, press Enter to jump',
'panel.columns':'Columns',
'panel.filters':'Filters',
'panel.views':'Views',
'panel.quickFilter':'Quick filter',
'find.label':'Find in grid',
'find.placeholder':'Find in grid',
'find.next':'Next match',
'find.previous':'Previous match',
'find.close':'Close find',
'find.matchCase':'Match case',
'find.wholeCell':'Whole cell',
'find.columnScope':'Search in',
'find.allColumns':'All columns',
'find.count':'{current} of {total}',
'find.countPartial':'{current} of {total} so far',
'find.none':'No matches',
'find.searching':'Searching…',
'find.loadedRows':'in loaded rows',
'panel.formatting':'Formatting',
'panel.statistics':'Statistics',
'stat.noData':'No data',
'panel.regression':'Regression',
'panel.compare':'Compare',
'panel.insights':'Insights',
'insights.subset':'Filtered subset vs whole',
'insights.dataset':'This grid vs another dataset',
'insights.groups':'Group comparison',
'insights.noFilter':'Filter the grid to compare the subset against the whole.',
'insights.by':'Group by',
'insights.test':'Test',
'insights.effect':'Effect size',
'insights.interval':'Confidence interval',
'insights.pValue':'p-value',
'insights.smallSample':'small sample — interpret with care',
'insights.needGroups':'Choose two columns with groups to compare.',
'insights.empty':'No columns to analyse.',
'insights.anomalies':'Anomalies',
'insights.anomalyCount':'{count} flagged of {n}',
'insights.anomalyMethod':'Method',
'insights.anomalyThreshold':'Threshold',
'anomaly.chip':'{count} anomalies flagged',
'anomaly.chipActive':'Showing {count} anomalies — clear',
'compare.first':'First column',
'compare.second':'Second column',
'compare.needTwo':'Two numeric columns are needed to compare',
'compare.noPairs':'No rows have a value in both',
'compare.pairs':'{count} pairs',
'compare.pearson':'Correlation (Pearson)',
'compare.spearman':'Rank correlation (Spearman)',
'compare.kendall':'Kendall’s tau',
'compare.covariance':'Covariance',
'compare.slope':'Slope',
'compare.intercept':'Intercept',
'compare.r2':'R²',
'compare.stdError':'Standard error',
'compare.weighted':'Weighted average',
'panel.zone.group':'row groups',
'panel.zone.values':'values',
'panel.zone.pivot':'pivot columns',
'groupZone.label':'Row groups',
'groupZone.title':'Group by',
'groupZone.hint':'Drag a column here to group rows by its values',
'groupZone.chip':'{column}, group {at} of {of}',
'groupZone.remove':'Stop grouping by {column}',
'groupZone.add':'Add a group',
'total.sum':'Sum',
'total.avg':'Average',
'total.min':'Min',
'total.max':'Max',
'total.count':'Count',
'total.countValues':'Count of values',
'total.first':'First',
'total.last':'Last',
'total.median':'Median',
'total.p25':'25th percentile',
'total.p75':'75th percentile',
'total.p90':'90th percentile',
'total.p95':'95th percentile',
'total.p99':'99th percentile',
'total.iqr':'Interquartile range',
'total.mad':'Median absolute deviation',
'total.variance':'Variance',
'total.varianceP':'Variance (population)',
'total.stddev':'Standard deviation',
'total.stddevP':'Standard deviation (population)',
'total.range':'Range',
'total.distinct':'Distinct',
'total.mode':'Mode',
'total.skewness':'Skewness',
'total.kurtosis':'Kurtosis',
'total.geomean':'Geometric mean',
'total.harmean':'Harmonic mean',
'total.sumSquares':'Sum of squares',
'total.weightedAvg':'Weighted average',
'total.argmin':'Lowest by',
'total.argmax':'Highest by',
'total.hhi':'Concentration (HHI)',
'total.entropy':'Entropy',
'total.evenness':'Evenness',
'total.top3Share':'Top 3 share',
'total.top10Share':'Top 10 share',
'total.gini':'Gini coefficient',
'total.trimmedMean':'Trimmed mean',
'total.winsorizedMean':'Winsorized mean',
'total.robustOutliers':'Outliers (robust)',
'total.jarqueBera':'Jarque–Bera',
'stats.column':'Column',
'stats.choose':'Choose a column to profile',
'stats.noColumns':'No numeric columns to profile',
'stats.noValues':'Nothing numeric in this column',
'stats.count':'Count',
'stats.present':'Present',
'stats.missing':'Missing',
'stats.distinct':'Distinct',
'stats.min':'Minimum',
'stats.max':'Maximum',
'stats.mean':'Mean',
'stats.median':'Median',
'stats.q1':'Lower quartile',
'stats.q3':'Upper quartile',
'stats.iqr':'Interquartile range',
'stats.stddev':'Standard deviation',
'stats.outliers':'Outliers',
'stats.distribution':'Distribution',
'stats.bin':'{count} between {from} and {to}',
'stats.topValues':'Top values',
'stats.section.shape':'Shape',
'stats.section.robust':'Robust',
'stats.section.concentration':'Concentration',
'stats.section.capability':'Capability',
'stats.cp':'Cp',
'stats.cpk':'Cpk',
'stats.pp':'Pp',
'stats.ppk':'Ppk',
'stats.outOfSpec':'Out of specification',
'stats.filtered':'Over the {count} filtered rows',
'regression.noModel':'No model configured. Set predictors and a response on the panel.',
'regression.cannotFit':'The model cannot be fitted over the current rows.',
'regression.observations':'Fitted over {count} rows',
'regression.r2':'R²',
'regression.adjR2':'Adjusted R²',
'regression.coefficients':'Coefficients',
'regression.term':'Term',
'regression.estimate':'Estimate ± SE',
'regression.stdError':'Std error',
'regression.t':'t',
'regression.p':'p',
'regression.vif':'Variance inflation (VIF)',
'regression.heteroscedasticity':'Heteroscedasticity (Breusch–Pagan)',
'regression.heteroscedastic':'Heteroscedastic: BP {statistic}, p {p}',
'regression.homoscedastic':'No heteroscedasticity detected: BP {statistic}, p {p}',
'menu.sortAscending':'Sort ascending',
'menu.sortDescending':'Sort descending',
'menu.clearSort':'Clear sort',
'menu.groupBy':'Group by this column',
'menu.ungroup':'Stop grouping by this column',
'menu.hideColumn':'Hide column',
'menu.pinStart':'Pin to start',
'menu.pinEnd':'Pin to end',
'menu.unpin':'Unpin',
'menu.autosize':'Fit to content',
'ai.valuesNotAmongOptions':'{values} {shown} not among the options for "{column}"',
'menu.clearCells':{one:'Clear cell',other:'Clear {count} cells'},
'menu.fillDown':'Fill down',
'menu.copy':'Copy',
'menu.copyWithHeaders':'Copy with headers',
'menu.paste':'Paste',
'menu.filterEllipsis':'Filter…',
'menu.columnStatistics':'Column statistics',
'menu.pinColumn':'Pin column',
'menu.sizeToFit':'Size to fit content',
'menu.sizeAllToFit':'Size all columns to fit',
'menu.width':'Width',
'menu.narrower':'Narrower',
'menu.wider':'Wider',
'menu.moveColumn':'Move column',
'menu.moveLeft':'Move left',
'menu.moveRight':'Move right',
'menu.moveToStart':'Move to start',
'menu.moveToEnd':'Move to end',
'menu.unpivot':'Remove from pivot',
'menu.pivotBy':'Pivot by this column',
'menu.stopTotalling':'Stop totalling',
'menu.totalColumn':'Total this column',
'menu.aggregate':'Aggregate',
'menu.aggregateNone':'None',
'menu.aggregateGroup':'Group subtotals',
'menu.aggregateGrand':'Grand total',
'menu.aggregateSame':'Same as total',
'menu.redactColumn':'Redact column',
'menu.stopRedacting':'Stop redacting',
'menu.stopRedactingAll':'Stop redacting everything',
'menu.sortGroupsAscending':'Sort groups ascending',
'menu.sortGroupsDescending':'Sort groups descending',
'menu.filterGroups':'Filter groups…',
'menu.expandAll':'Expand all',
'menu.collapseAll':'Collapse all',
'menu.clearGrouping':'Clear grouping',
'menu.colour':'Colour',
'menu.importCsv':'Import rows from CSV…',
'import.title':'Import rows',
'import.clipboard':'the clipboard',
'import.summary':{one:'{count} row from {name}',other:'{count} rows from {name}'},
'import.opened':{one:'Import preview open, {count} row',other:'Import preview open, {count} rows'},
'import.done':{one:'{count} row imported',other:'{count} rows imported'},
'import.confirm':'Import',
'import.cancel':'Cancel',
'import.colSource':'Column',
'import.colField':'Maps to',
'import.colType':'Type',
'import.skip':'— skip —',
'import.mapLabel':'Map "{source}" to a field',
'import.modeLabel':'On import',
'import.append':'Add to existing rows',
'import.replace':'Replace all rows',
'menu.deleteRow':{one:'Delete row',other:'Delete {count} rows'},
'toolbar.undo':'Undo',
'toolbar.redo':'Redo',
'toolbar.undoLabelled':'Undo {label}',
'toolbar.redoLabelled':'Redo {label}',
'toolbar.exportCsv':'Export to CSV',
'toolbar.exportExcel':'Export to Excel',
'toolbar.clipboard':'Copy visible rows to the clipboard',
'toolbar.print':'Print',
'toolbar.pause':'Hold incoming updates',
'toolbar.resume':'Resume updates',
'toolbar.applyHeld':{
one:'Apply {count} held update',
other:'Apply {count} held updates',
},
'toolbar.restoreView':'Restore the default view',
'toolbar.maximiseGrid':'Maximise the grid to fill the window',
'toolbar.restoreSize':'Restore the grid to the page (Esc)',
'toolbar.annotate.pen':'Draw freehand',
'toolbar.annotate.arrow':'Draw an arrow',
'toolbar.annotate.rect':'Draw a rectangle',
'toolbar.annotate.highlight':'Highlight',
'overlay.noRows':'No rows to show',
'overlay.noResults':'No rows match the current filters',
'overlay.loading':'Loading…',
'overlay.error':'Something went wrong',
'comments.panel':'Cell comments',
'comments.close':'Close comments',
'comments.write':'Write a comment',
'comments.post':'Comment',
'comments.delete':'Delete',
'comments.valueMoved':'Written when the value was {was}: it is now {now}.',
'presence.hidden':{one:'{count} not in view',other:'{count} not in view'},
'presence.someoneElse':'someone else',
'a11y.presence.refused':'This cell is being edited by {name}',
'facets.filter':'{column} distribution filter',
'header.totalOf':'{total} of {column}',
'diff.before':'Was: {value}',
'diff.empty':'(empty)',
'kanban.columnCards':{one:'{title}, {count} card',other:'{title}, {count} cards'},
'kanban.laneCards':{
one:'{lane}, {title}, {count} card',
other:'{lane}, {title}, {count} cards',
},
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
'timeline.scrub':'Scrub through recent changes',
'timeline.goLive':'Go live',
'timeline.returnToPresent':'Return to the present',
'a11y.fillHandle':'Drag to fill',
'panel.icons':'Icons',
'value.tooLong':'Too long',
'shortcuts.title':'Keyboard shortcuts',
'shortcuts.close':'Close keyboard shortcuts',
'shortcuts.hint':'Press Escape to close.',
'shortcuts.or':'or',
'a11y.reorder.moved':'Moved to position {position} of {total}',
'a11y.reorder.sorted':'Rows cannot be reordered while the grid is sorted',
'a11y.reorder.filtered':'Rows cannot be reordered while a filter is applied',
'a11y.reorder.grouped':'Rows cannot be reordered while the grid is grouped',
'a11y.reorder.grab':'Reorder row',
'a11y.transfer.moved':'Row moved to the other grid',
'a11y.transfer.copied':'Row copied to the other grid',
'a11y.transfer.refused':'That grid does not accept this row',
'a11y.transfer.declined':'The drop was declined; the row stays where it was',
'a11y.transfer.stale':'The drop target changed while it was being confirmed; the row stays where it was',
'shortcuts.group.grid':'In the data',
'shortcuts.group.header':'On a column heading',
'shortcuts.group.panel':'In the column list',
'shortcut.moveCell':'Move the focused cell',
'shortcut.rowEnds':'First / last cell of the row',
'shortcut.gridEnds':'First cell of the first row / last cell of the last row',
'shortcut.pageRows':'Move one viewport of rows',
'shortcut.nextCell':'Next / previous cell, wrapping across rows',
'shortcut.startEdit':'Start editing the focused cell',
'shortcut.toggleRow':'Toggle selection of the focused row',
'shortcut.cancel':'Cancel the current edit or drag',
'shortcut.expandCollapse':'Expand / collapse a group or tree row',
'shortcut.focusHeader':'Move focus to the column header',
'shortcut.focusPanel':'Move focus to the tool panel',
'shortcut.contextMenu':'Open the context menu for the focused cell',
'shortcut.moveRow':'Move the focused row, when row reorder is enabled',
'shortcut.headingMove':'Move between headings',
'shortcut.headingEnds':'First / last heading',
'shortcut.headingSort':'Sort by the column, Shift to add to the sort',
'shortcut.headingResize':'Resize the column, Ctrl for a coarse step',
'shortcut.headingReorder':'Move the column',
'shortcut.headingMenu':'Open the column menu',
'shortcut.headingExit':'Return focus to the data',
'shortcut.listGroup':'Group by the column, or stop grouping by it',
'shortcut.listValues':'Add the column to values, or take it out',
'shortcut.listPivot':'Pivot by the column, or stop pivoting by it',
'shortcut.listMove':'Move the column',
'shortcut.find':'Find in the grid',
'tags.label':'Show columns',
'tags.all':'All columns',
'tags.showing':'Showing {tag}',
'form.title':'Edit row',
'form.save':'Save',
'form.cancel':'Cancel',
'form.loading':'Loading…',
'form.loadFailed':'Could not load this record.',
'form.loadTimeout':'The record did not arrive in time.',
'form.retry':'Try again',
'form.choose':'Choose…',
'presentation.cards':'Showing records as cards',
'presentation.table':'Showing records as a table',
'editor.format':'Format',
'editor.codeHint':'Tab indents · Esc cancels · Ctrl+Enter saves',
'editor.colours':'Colours',
'editor.customColour':'Custom colour',
'editor.hexValue':'Hex value',
'editor.hexPlaceholder':'#rrggbb',
'editor.clearColour':'Clear colour',
'editor.time':'Time',
'editor.noIcon':'No icon',
'editor.selectAll':'Select all',
'editor.passwordHint':'Enter the value twice to save it.',
'editor.clearRating':'Clear rating',
'editor.clear':'Clear',
'editor.value':'Value',
'editor.currency':'Currency',
'formatting.format':'Format',
'formatting.noRules':'No rules yet. The first one that matches a cell wins.',
'formatting.clearAll':'Clear all',
'formatting.addRule':'Add rule',
'formatting.condition':'Condition',
'formatting.value':'Value',
'formatting.secondValue':'Second value',
'formatting.moveEarlier':'Move earlier',
'formatting.moveLater':'Move later',
'formatting.ruleKind':'Rule type',
'formatting.aCondition':'A condition',
'formatting.aColourScale':'A colour scale',
'formatting.compare':'Compare a value',
'formatting.distribution':'By the distribution',
'formatting.colourScale':'Colour scale',
'formatting.scaleBounds':'Scale bounds',
'formatting.preview':'Preview',
'formatting.livePreview':'Live preview',
'history.title':'History',
'history.show':'Show history',
'history.empty':'Nothing to undo yet.',
'prompt.ask':'Ask',
'prompt.apply':'Apply',
'prompt.discard':'Discard',
'panel.searchColumns':'Search columns',
'panel.searchColumnsPlaceholder':'Search columns…',
'panel.searchColumnsToFilter':'Search columns to filter',
'panel.showAll':'Show all',
'panel.hideAll':'Hide all',
'panel.clearAll':'Clear all',
'panel.clear':'Clear',
'panel.filterAllColumns':'Filter all columns',
'panel.columnFiltered':'This column is filtered',
'panel.clearFilterOn':'Clear the filter on {column}',
'panel.clearFilter':'Clear this filter',
'panel.filterEmptyNoMatch':'No column matches “{query}”.',
'panel.filterEmptyNone':'No column on this grid can be filtered.',
'panel.filterSummaryActive':'{active} of {total} columns filtered',
'panel.filterSummaryNone':'No filters · {total} columns available',
'panel.filterBy':'Filter by {column}',
'panel.filteredBy':'Filtered by {column}',
'panel.columnDragHint':'Drag {column} into a zone above, or onto another column to reorder',
'panel.gridActions':'Grid actions',
'views.default':'Default',
'views.namePlaceholder':'Name this view…',
'views.nameLabel':'Name for the current layout',
'views.save':'Save view',
'licence.watermark':'Unlicensed: Lattice Grid trial',
'filter.op.contains':'Contains',
'filter.op.notContains':'Does not contain',
'filter.op.equals':'Equals',
'filter.op.notEqual':'Does not equal',
'filter.op.startsWith':'Starts with',
'filter.op.endsWith':'Ends with',
'filter.op.blank':'Is blank',
'filter.op.notBlank':'Is not blank',
'filter.op.lessThan':'Less than',
'filter.op.lessThanOrEqual':'Less than or equal',
'filter.op.greaterThan':'Greater than',
'filter.op.greaterThanOrEqual':'Greater than or equal',
'filter.op.inRange':'In range',
'filter.op.matches':'Matches',
'filter.op.before':'Before',
'filter.op.after':'After',
'filter.op.relative':'Relative to today',
'filter.rel.today':'Today',
'filter.rel.yesterday':'Yesterday',
'filter.rel.tomorrow':'Tomorrow',
'filter.rel.lastNDays':'Last N days',
'filter.rel.nextNDays':'Next N days',
'filter.rel.thisWeek':'This week',
'filter.rel.lastWeek':'Last week',
'filter.rel.thisMonth':'This month',
'filter.rel.lastMonth':'Last month',
'filter.rel.thisQuarter':'This quarter',
'filter.rel.quarterToDate':'Quarter to date',
'filter.rel.thisYear':'This year',
'filter.rel.yearToDate':'Year to date',
'filter.operator':'Operator',
'filter.join':'Join',
'filter.value':'Value',
'filter.from':'From',
'filter.to':'To',
'filter.addCondition':'Add condition',
'filter.noConditions':'No conditions',
'filter.removeCondition':'Remove condition',
'filter.search':'Search',
'filter.searchValues':'Search values',
'filter.noMatches':'No values match',
'filter.selectAll':'Select all',
'filter.clear':'Clear',
'filter.all':'All',
'filter.expression':'Filter expression',
'filter.column':'Column',
'filter.relativePeriod':'Relative period',
'filter.days':'Number of days',
'filter.tab.set':'Values',
'filter.tab.text':'Text',
'filter.tab.number':'Number',
'filter.tab.date':'Date',
'filter.tab.advanced':'Advanced',
'chart.empty':'Nothing to chart',
'chart.summary':'{type} chart of {measure} by {dimension}',
'chart.summaryShare':'{type} chart of {measure}',
'chart.summaryType':'{type} chart',
'chart.dataTable':'Chart data',
'chart.legendMore':{
one:'+{count} more',
other:'+{count} more',
},
'chart.type.line':'Line',
'chart.type.area':'Area',
'chart.type.bar':'Bar',
'chart.type.pie':'Pie',
'chart.type.donut':'Donut',
'chart.type.sunburst':'Sunburst',
'chart.type.scatter':'Scatter',
'chart.type.step':'Step',
'chart.type.rangeArea':'Range',
'chart.type.horizontalBar':'Horizontal bar',
'chart.type.waterfall':'Waterfall',
'chart.type.bubble':'Bubble',
'chart.type.histogram':'Histogram',
'chart.type.boxplot':'Box plot',
'chart.type.forest':'Forest plot',
'chart.type.qq':'QQ plot',
'chart.type.ecdf':'ECDF',
'chart.type.lorenz':'Lorenz',
'chart.type.correlogram':'Correlogram',
'chart.type.control':'Control',
'chart.type.capability':'Capability',
'chart.type.movingRange':'Moving range',
'chart.type.treemap':'Treemap',
'chart.type.combo':'Combination',
'chart.type.pareto':'Pareto',
'chart.type.heatmap':'Heat map',
'chart.type.radar':'Radar',
'chart.type.gauge':'Gauge',
'chart.type.funnel':'Funnel',
'chart.type.candlestick':'Candlestick',
'chart.type.geomap':'Map',
'chart.type.sankey':'Sankey',
'chart.type.chord':'Chord',
'chart.type.network':'Network',
'chart.type.stream':'Stream',
'chart.type.marimekko':'Marimekko',
'chart.type.violin':'Violin',
'chart.type.gantt':'Gantt',
'chart.tasksDropped':{
one:'{count} more task not shown',
other:'{count} more tasks not shown',
},
'chart.geoUnmatched':{
one:'{count} row could not be placed on the map',
other:'{count} rows could not be placed on the map',
},
});
const MESSAGE_KEYS=Object.freeze(Object.keys(EN_GB));
});
__def("packages/core/src/i18n/format.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"formatList",{enumerable:true,get:function(){return formatList;}});
Object.defineProperty(__exports,"formatMessage",{enumerable:true,get:function(){return formatMessage;}});
Object.defineProperty(__exports,"resolveLocale",{enumerable:true,get:function(){return resolveLocale;}});
Object.defineProperty(__exports,"lookup",{enumerable:true,get:function(){return lookup;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const PLACEHOLDER=/\{(\w+)\}/g;
const pluralRules=new Map();
const listFormats=new Map();
function rulesFor(locale){
const key=locale||'';
if(pluralRules.has(key))return pluralRules.get(key);
let rules=null;
try{
rules=new Intl.PluralRules(locale||undefined);
}catch{
rules=null;
}
pluralRules.set(key,rules);
return rules;
}
function formatList(items,locale,type='conjunction'){
const list=Array.isArray(items)?items.filter((s)=>s!=null&&s!==''):[];
if(list.length===0)return'';
if(list.length===1)return String(list[0]);
const key=`${locale||''}|${type}`;
let fmt=listFormats.get(key);
if(fmt===undefined){
try{
fmt=new Intl.ListFormat(locale||undefined,{style:'long',type});
}catch{
fmt=null;
}
listFormats.set(key,fmt);
}
if(fmt)return fmt.format(list.map(String));
return list.map(String).join(', ');
}
function renderValue(value,locale){
if(value==null)return'';
if(typeof value==='number'){
if(!Number.isFinite(value))return'';
return value.toLocaleString(locale||undefined,{maximumFractionDigits:20});
}
return String(value);
}
function selectTemplate(message,params,locale){
if(typeof message==='string')return message;
if(!message||typeof message!=='object')return'';
const count=params&&typeof params.count==='number'?params.count:null;
if(count===null)return message.other??'';
const rules=rulesFor(locale);
const category=rules?rules.select(count):(count===1?'one':'other');
return message[category]??message.other??'';
}
function formatMessage(message,params={},locale){
const template=selectTemplate(message,params,locale);
if(!template)return'';
return template.replace(PLACEHOLDER,(whole,name)=>(
Object.prototype.hasOwnProperty.call(params,name)
?renderValue(params[name],locale)
:whole
));
}
function resolveLocale(configured,declared,fallback='en-GB'){
if(typeof configured==='string'&&configured)return configured;
if(typeof declared==='string'&&declared)return declared;
return fallback;
}
function lookup(catalogue,key){
const found=catalogue?catalogue[key]:undefined;
if(found===undefined||found===null)return key;
if(isFunction(found))return key;
return(found);
}
});
__def("packages/core/src/i18n/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"DEFAULT_LOCALE",{enumerable:true,get:function(){return DEFAULT_LOCALE;}});
Object.defineProperty(__exports,"Messages",{enumerable:true,get:function(){return Messages;}});
Object.defineProperty(__exports,"defaultMessages",{enumerable:true,get:function(){return defaultMessages;}});
Object.defineProperty(__exports,"createMessages",{enumerable:true,get:function(){return createMessages;}});
Object.defineProperty(__exports,"auditCatalogue",{enumerable:true,get:function(){return auditCatalogue;}});
const __m0=__req("packages/core/src/i18n/catalogue.js");
const EN_GB=__m0["EN_GB"];
const MESSAGE_KEYS=__m0["MESSAGE_KEYS"];
const __m1=__req("packages/core/src/i18n/format.js");
const formatMessage=__m1["formatMessage"];
const formatList=__m1["formatList"];
const lookup=__m1["lookup"];
const resolveLocale=__m1["resolveLocale"];
const __m2=__req("packages/core/src/internal/util.js");
const isFunction=__m2["isFunction"];
const warnOnce=__m2["warnOnce"];
Object.defineProperty(__exports,"EN_GB",{enumerable:true,get:function(){return __m0["EN_GB"];}});
Object.defineProperty(__exports,"MESSAGE_KEYS",{enumerable:true,get:function(){return __m0["MESSAGE_KEYS"];}});
Object.defineProperty(__exports,"formatList",{enumerable:true,get:function(){return __m1["formatList"];}});
Object.defineProperty(__exports,"resolveLocale",{enumerable:true,get:function(){return __m1["resolveLocale"];}});
const DEFAULT_LOCALE='en-GB';
class Messages{
#locale=DEFAULT_LOCALE;
#catalogue=EN_GB;
constructor(opts={}){
this.configure(opts);
}
configure(opts={}){
this.#locale=resolveLocale(opts.locale,opts.declared,DEFAULT_LOCALE);
const overrides=opts.messages;
if(!overrides||typeof overrides!=='object'){
this.#catalogue=EN_GB;
return;
}
const unknown=Object.keys(overrides).filter((k)=>!(k in EN_GB));
if(unknown.length){
warnOnce(
`i18n:unknown:${unknown[0]}`,
`message keys not in the catalogue and so ignored: ${unknown.slice(0,5).join(', ')}${unknown.length>5?`, and ${unknown.length-5} more`:''}`,
);
}
this.#catalogue={...EN_GB,...overrides};
}
get locale(){return this.#locale;}
t(key,params){
return formatMessage(lookup(this.#catalogue,key),params||{},this.#locale);
}
list(items,type){return formatList(items,this.#locale,type);}
number(value,opts){
const n=Number(value);
if(!Number.isFinite(n))return'';
return n.toLocaleString(this.#locale,opts||{maximumFractionDigits:20});
}
}
const defaultMessages=new Messages();
function createMessages(opts){
if(opts instanceof Messages)return opts;
return new Messages(opts||{});
}
function auditCatalogue(catalogue){
const given=catalogue&&typeof catalogue==='object'?catalogue:{};
const missing=MESSAGE_KEYS.filter((k)=>{
const v=given[k];
return v===undefined||v===null||v===''||isFunction(v);
});
const unknown=Object.keys(given).filter((k)=>!(k in EN_GB));
return{missing,unknown};
}
});
__def("packages/core/src/ai/intent.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"ACTION_NAMES",{enumerable:true,get:function(){return ACTION_NAMES;}});
Object.defineProperty(__exports,"INTENT_LIMITS",{enumerable:true,get:function(){return INTENT_LIMITS;}});
Object.defineProperty(__exports,"parseIntent",{enumerable:true,get:function(){return parseIntent;}});
Object.defineProperty(__exports,"planIntent",{enumerable:true,get:function(){return planIntent;}});
Object.defineProperty(__exports,"applyPlan",{enumerable:true,get:function(){return applyPlan;}});
Object.defineProperty(__exports,"buildPrompt",{enumerable:true,get:function(){return buildPrompt;}});
Object.defineProperty(__exports,"retryPrompt",{enumerable:true,get:function(){return retryPrompt;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isObject=__m0["isObject"];
const __m1=__req("packages/core/src/i18n/index.js");
const defaultMessages=__m1["defaultMessages"];
const __m2=__req("packages/core/src/ai/schema.js");
const CLEAR_TARGETS=__m2["CLEAR_TARGETS"];
const INTENT_ACTIONS=__m2["INTENT_ACTIONS"];
const OPERATORS=__m2["OPERATORS"];
const OPERATOR_ARITY=__m2["OPERATOR_ARITY"];
const columnIndex=__m2["columnIndex"];
const operatorsFor=__m2["operatorsFor"];
const ACTION_NAMES=Object.freeze(INTENT_ACTIONS.map((a)=>a.name));
const INTENT_LIMITS=Object.freeze({
maxActions:20,
maxDepth:8,
maxConditions:200,
maxSetMembers:500,
maxTextLength:500,
maxColumnsPerAction:200,
maxInputChars:200000,
});
const GROUP_OPS=Object.freeze(new Set(['and','or','not']));
const FORBIDDEN_KEYS=Object.freeze(new Set(['__proto__','constructor','prototype']));
function pick(obj,key){
if(!isObject(obj)||FORBIDDEN_KEYS.has(key))return undefined;
if(!Object.prototype.hasOwnProperty.call(obj,key))return undefined;
return(obj)[key];
}
function candidates(text){
const out=[];
const fence=/```(?:json|JSON)?\s*([\s\S]*?)```/g;
let match;
while((match=fence.exec(text))!==null){
const body=match[1].trim();
if(body)out.push(body);
}
const trimmed=text.trim();
if(trimmed)out.push(trimmed);
for(const[open,close]of[['{','}'],['[',']']]){
const first=text.indexOf(open);
const last=text.lastIndexOf(close);
if(first!==-1&&last>first)out.push(text.slice(first,last+1));
}
return out;
}
function parseIntent(input){
if(input===null||input===undefined){
return{ok:false,value:null,reason:'the model returned nothing'};
}
if(isObject(input)||Array.isArray(input)){
return{ok:true,value:input,reason:''};
}
if(typeof input!=='string'){
return{ok:false,value:null,reason:`expected an object or JSON text, got ${typeof input}`};
}
if(input.length>INTENT_LIMITS.maxInputChars){
return{ok:false,value:null,reason:`the reply was ${input.length} characters, over the ${INTENT_LIMITS.maxInputChars} limit`};
}
for(const candidate of candidates(input)){
try{
const parsed=JSON.parse(candidate);
if(isObject(parsed)||Array.isArray(parsed))return{ok:true,value:parsed,reason:''};
}catch{
}
}
return{ok:false,value:null,reason:'no JSON object could be read from the reply'};
}
function unwrap(value,depth=0){
if(depth>3)return null;
if(Array.isArray(value))return{actions:value,explain:''};
if(!isObject(value))return null;
const actions=pick(value,'actions');
if(Array.isArray(actions)){
const explain=pick(value,'explain')??pick(value,'explanation')??pick(value,'summary');
return{actions,explain:typeof explain==='string'?explain:''};
}
const single=pick(value,'action');
if(isObject(single))return{actions:[single],explain:''};
if(typeof pick(value,'type')==='string')return{actions:[value],explain:''};
for(const key of['intent','input','tool_input','arguments','parameters','args']){
const inner=pick(value,key);
if(typeof inner==='string'){
const parsed=parseIntent(inner);
if(parsed.ok){
const unwrapped=unwrap(parsed.value,depth+1);
if(unwrapped)return unwrapped;
}
continue;
}
if(isObject(inner)||Array.isArray(inner)){
const unwrapped=unwrap(inner,depth+1);
if(unwrapped)return unwrapped;
}
}
return null;
}
function rejections(){
const list=[];
return{
list,
add(at,what,reason){
let label;
try{
label=typeof what==='string'?what:JSON.stringify(what);
}catch{
label=String(what);
}
if(label===undefined)label='undefined';
if(label.length>80)label=`${label.slice(0,79)}…`;
list.push({at,what:label,reason});
},
};
}
function isScalar(value){
const t=typeof value;
return value===null||t==='string'||t==='number'||t==='boolean';
}
function checkValue(op,value){
const arity=OPERATOR_ARITY[op];
if(arity==='none'){
return{ok:true,value:undefined};
}
if(arity==='range'){
if(!Array.isArray(value)||value.length!==2){
return{ok:false,reason:`"${op}" needs a two-element [low, high] array`};
}
if(!value.every(isScalar))return{ok:false,reason:`"${op}" bounds must be scalars`};
return{ok:true,value:[value[0],value[1]]};
}
if(arity==='set'){
const list=Array.isArray(value)?value:null;
if(!list)return{ok:false,reason:`"${op}" needs an array of values`};
if(list.length===0)return{ok:false,reason:`"${op}" was given an empty list`};
if(list.length>INTENT_LIMITS.maxSetMembers){
return{ok:false,reason:`"${op}" was given ${list.length} values, over the ${INTENT_LIMITS.maxSetMembers} limit`};
}
if(!list.every(isScalar))return{ok:false,reason:`"${op}" values must be scalars`};
return{ok:true,value:list.slice()};
}
if(value===undefined)return{ok:false,reason:`"${op}" needs a value`};
if(!isScalar(value))return{ok:false,reason:`"${op}" needs a single scalar value`};
return{ok:true,value};
}
function checkAgainstOptions(column,value){
if(!column||!Array.isArray(column.options))return'';
if(column.optionsOpen||column.optionsTotal)return'';
const known=new Set(column.options.map((o)=>String(o.value)));
const values=Array.isArray(value)?value:[value];
const bad=values.filter((v)=>v!==null&&v!==undefined&&!known.has(String(v)));
if(!bad.length)return'';
const shown=bad.slice(0,3).map((v)=>JSON.stringify(v)).join(', ');
return defaultMessages.t('ai.valuesNotAmongOptions',{
values:defaultMessages.t('count.values',{count:bad.length}),
shown,
column:column.title||column.id,
});
}
function validateFilters(node,columns,rej,at,budget){
if(node===null||node===undefined)return null;
if(!isObject(node)){
rej.add(at,node,'a filter must be an object');
return null;
}
if(budget.depth>INTENT_LIMITS.maxDepth){
rej.add(at,'group',`filter nesting is deeper than ${INTENT_LIMITS.maxDepth} levels`);
return null;
}
if(budget.count>INTENT_LIMITS.maxConditions){
rej.add(at,'condition',`more than ${INTENT_LIMITS.maxConditions} conditions`);
return null;
}
const op=pick(node,'op');
const children=pick(node,'conditions');
if(Array.isArray(children)||(typeof op==='string'&&GROUP_OPS.has(op))){
if(typeof op!=='string'||!GROUP_OPS.has(op)){
rej.add(at,op,'a filter group needs op "and", "or" or "not"');
return null;
}
if(!Array.isArray(children)){
rej.add(at,op,`the "${op}" group has no conditions array`);
return null;
}
const kept=[];
for(let i=0;i<children.length;i++){
budget.depth++;
const child=validateFilters(children[i],columns,rej,`${at}.conditions[${i}]`,budget);
budget.depth--;
if(child)kept.push(child);
}
if(!kept.length)return null;
if(kept.length===1&&op!=='not')return kept[0];
return{op:(op),conditions:kept};
}
budget.count++;
const col=pick(node,'col')??pick(node,'colId')
??pick(node,'column')??pick(node,'field');
if(typeof col!=='string'||!col){
rej.add(at,col,'a condition needs a "col" naming a column');
return null;
}
const column=columns.get(col);
if(!column){
rej.add(at,col,`unknown column "${col}"`);
return null;
}
if(column.filterable===false){
rej.add(at,col,`column "${column.title||col}" cannot be filtered`);
return null;
}
if(typeof op!=='string'){
rej.add(at,op,`no operator given for "${column.title||col}"`);
return null;
}
if(!OPERATORS.includes((op))){
rej.add(at,op,`unknown operator "${op}"`);
return null;
}
const allowed=operatorsFor(column);
if(!allowed.includes((op))){
rej.add(at,op,`operator "${op}" does not apply to ${column.family} column "${column.title||col}"`);
return null;
}
const checked=checkValue(op,pick(node,'value'));
if(!checked.ok){
rej.add(at,pick(node,'value'),checked.reason||'bad value');
return null;
}
const optionProblem=checkAgainstOptions(column,checked.value);
if(optionProblem){
rej.add(at,pick(node,'value'),optionProblem);
return null;
}
const condition={col,op};
if(checked.value!==undefined)condition.value=checked.value;
return condition;
}
function validateColumnList(value,columns,rej,at,veto){
const list=typeof value==='string'?[value]:value;
if(!Array.isArray(list)){
rej.add(at,value,'expected an array of column ids');
return[];
}
if(list.length>INTENT_LIMITS.maxColumnsPerAction){
rej.add(at,list.length,`more than ${INTENT_LIMITS.maxColumnsPerAction} columns`);
return[];
}
if(list.length===0)rej.add(at,[],'no columns given; use the clear action to remove something');
const kept=[];
for(let i=0;i<list.length;i++){
const id=list[i];
if(typeof id!=='string'){
rej.add(`${at}[${i}]`,id,'a column id must be a string');
continue;
}
const column=columns.get(id);
if(!column){
rej.add(`${at}[${i}]`,id,`unknown column "${id}"`);
continue;
}
const reason=veto(column);
if(reason){
rej.add(`${at}[${i}]`,id,reason);
continue;
}
if(!kept.includes(id))kept.push(id);
}
return kept;
}
function validateSort(value,columns,rej,at){
const list=Array.isArray(value)?value:(isObject(value)?[value]:null);
if(!list){
rej.add(at,value,'expected an array of {col, dir} entries');
return[];
}
if(list.length===0)rej.add(at,[],'no sort entries given; use the clear action to remove the sort');
const kept=[];
for(let i=0;i<list.length;i++){
const entry=list[i];
const path=`${at}[${i}]`;
if(!isObject(entry)){
rej.add(path,entry,'a sort entry must be an object');
continue;
}
const col=pick(entry,'col')??pick(entry,'colId')
??pick(entry,'column')??pick(entry,'field');
if(typeof col!=='string'){
rej.add(path,col,'a sort entry needs a "col"');
continue;
}
const column=columns.get(col);
if(!column){
rej.add(path,col,`unknown column "${col}"`);
continue;
}
if(column.sortable===false){
rej.add(path,col,`column "${column.title||col}" cannot be sorted`);
continue;
}
const raw=pick(entry,'dir')??pick(entry,'direction');
const dir=typeof raw==='string'?raw.toLowerCase():'asc';
if(dir!=='asc'&&dir!=='desc'){
rej.add(path,raw,`sort direction must be "asc" or "desc", not ${JSON.stringify(raw)}`);
continue;
}
if(kept.some((e)=>e.col===col)){
rej.add(path,col,`column "${column.title||col}" is sorted twice`);
continue;
}
kept.push({col,dir});
}
return kept;
}
function validateAction(raw,columns,rej,at){
if(!isObject(raw)){
rej.add(at,raw,'an action must be an object');
return null;
}
const rawType=pick(raw,'type')??pick(raw,'action')??pick(raw,'name');
if(typeof rawType!=='string'){
rej.add(at,rawType,'an action needs a "type"');
return null;
}
const type=rawType;
if(!ACTION_NAMES.includes(type)){
rej.add(at,type,`unknown action "${type}"; permitted actions are ${ACTION_NAMES.join(', ')}`);
return null;
}
switch(type){
case'setFilters':{
const budget={depth:0,count:0};
const filters=validateFilters(pick(raw,'filters')??pick(raw,'filter'),columns,rej,`${at}.filters`,budget);
if(!filters)return null;
return{type,filters};
}
case'setSort':{
const sort=validateSort(pick(raw,'sort')??pick(raw,'entries'),columns,rej,`${at}.sort`);
return sort.length?{type,sort}:null;
}
case'groupBy':{
const ids=validateColumnList(
pick(raw,'columns')??pick(raw,'cols'),columns,rej,`${at}.columns`,
(column)=>(column.groupable===false?`column "${column.title||column.id}" cannot be grouped`:''),
);
return ids.length?{type,columns:ids}:null;
}
case'showColumns':
case'hideColumns':{
const hiding=type==='hideColumns';
const ids=validateColumnList(
pick(raw,'columns')??pick(raw,'cols'),columns,rej,`${at}.columns`,
(column)=>(hiding&&column.lockVisible?`column "${column.title||column.id}" cannot be hidden`:''),
);
return ids.length?{type,columns:ids}:null;
}
case'setQuick':{
const text=pick(raw,'text')??pick(raw,'quick')??pick(raw,'value');
if(typeof text!=='string'){
rej.add(`${at}.text`,text,'the quick filter needs text');
return null;
}
if(text.length>INTENT_LIMITS.maxTextLength){
rej.add(`${at}.text`,text.length,`quick filter text is longer than ${INTENT_LIMITS.maxTextLength} characters`);
return null;
}
return{type,text};
}
case'clear':{
const what=pick(raw,'what')??pick(raw,'target');
if(typeof what!=='string'||!CLEAR_TARGETS.includes(what)){
rej.add(`${at}.what`,what,`clear needs one of ${CLEAR_TARGETS.join(', ')}`);
return null;
}
return{type,what};
}
default:
rej.add(at,type,`action "${type}" is described but not implemented`);
return null;
}
}
const OPERATOR_TEXT=Object.freeze({
eq:'is',ne:'is not',
lt:'is less than',lte:'is at most',gt:'is more than',gte:'is at least',
between:'is between',notBetween:'is not between',
in:'is one of',notIn:'is not one of',
contains:'contains',notContains:'does not contain',
startsWith:'starts with',endsWith:'ends with',matches:'matches',
blank:'is blank',notBlank:'is not blank',
containsAny:'includes any of',containsAll:'includes all of',containsNone:'includes none of',
});
function titleOf(columns,id){
const column=columns.get(id);
return(column&&column.title)||id;
}
function valueText(value,op){
if(value===undefined||value===null)return'';
if(Array.isArray(value)){
const parts=value.map((v)=>valueText(v,'eq'));
if(op==='between'||op==='notBetween')return parts.join(' and ');
return parts.join(' or ');
}
if(typeof value==='string')return value;
return String(value);
}
function describeFilters(node,columns,nested=false){
if(!node)return'';
if(Array.isArray(node.conditions)){
const parts=node.conditions.map((child)=>describeFilters(child,columns,true)).filter(Boolean);
if(!parts.length)return'';
if(node.op==='not')return`not (${parts.join(' and ')})`;
const joined=parts.join(node.op==='or'?' or ':' and ');
return nested&&parts.length>1?`(${joined})`:joined;
}
const phrase=(OPERATOR_TEXT)[node.op]||node.op;
const title=titleOf(columns,node.col);
if(node.value===undefined)return`${title} ${phrase}`;
return`${title} ${phrase} ${valueText(node.value,node.op)}`;
}
function describeAction(action,columns){
switch(action.type){
case'setFilters':
return`filter ${describeFilters(action.filters,columns)}`;
case'setSort':
return`sort ${action.sort.map((e)=>`${titleOf(columns,e.col)} ${e.dir==='desc'?'descending':'ascending'}`).join(', then ')}`;
case'groupBy':
return`group by ${action.columns.map((id)=>titleOf(columns,id)).join(', then ')}`;
case'showColumns':
return`show ${action.columns.map((id)=>titleOf(columns,id)).join(', ')}`;
case'hideColumns':
return`hide ${action.columns.map((id)=>titleOf(columns,id)).join(', ')}`;
case'setQuick':
return`search for "${action.text}"`;
case'clear':
return action.what==='all'?'clear everything':`clear the ${action.what==='group'?'grouping':action.what}`;
default:
return action.type;
}
}
function sentence(text){
if(!text)return'';
return text[0].toUpperCase()+text.slice(1);
}
function planIntent(input,schema){
const columns=columnIndex(schema);
const rej=rejections();
const actions=[];
let explain='';
const parsed=parseIntent(input);
if(!parsed.ok){
rej.add('reply',typeof input==='string'?input.slice(0,80):input,parsed.reason);
}else{
const unwrapped=unwrap(parsed.value);
if(!unwrapped){
rej.add('reply',parsed.value,'the reply carried no "actions" list');
}else{
explain=unwrapped.explain.slice(0,INTENT_LIMITS.maxTextLength);
const list=unwrapped.actions;
if(list.length>INTENT_LIMITS.maxActions){
rej.add('actions',list.length,`${list.length} actions, over the ${INTENT_LIMITS.maxActions} limit; the first ${INTENT_LIMITS.maxActions} were considered`);
}
const considered=list.slice(0,INTENT_LIMITS.maxActions);
for(let i=0;i<considered.length;i++){
const action=validateAction(considered[i],columns,rej,`actions[${i}]`);
if(action)actions.push(action);
}
}
}
return{
ok:actions.length>0,
actions,
rejected:rej.list,
explain,
describe(){
if(!actions.length)return'Nothing to apply.';
return sentence(actions.map((a)=>describeAction(a,columns)).join(', '));
},
};
}
function runAction(action,grid){
switch(action.type){
case'setFilters':grid.filters.set(action.filters);return;
case'setSort':grid.sort.set(action.sort);return;
case'groupBy':grid.columns.group(action.columns);return;
case'showColumns':grid.columns.show(action.columns);return;
case'hideColumns':grid.columns.hide(action.columns);return;
case'setQuick':grid.filters.quick(action.text);return;
case'clear':runClear(action.what,grid);return;
default:throw new Error(`unsupported action "${action.type}"`);
}
}
function runClear(what,grid){
const all=what==='all';
if(all||what==='filters')grid.filters.set(null);
if(all||what==='quick')grid.filters.quick('');
if(all||what==='sort')grid.sort.set([]);
if(all||what==='group')grid.columns.group([]);
}
function applyPlan(plan,grid){
const applied=[];
const failed=[];
const actions=plan&&Array.isArray(plan.actions)?plan.actions:[];
if(!grid)return{ok:false,applied,failed:[{type:'plan',reason:'no grid'}]};
for(const action of actions){
const type=(action).type;
try{
runAction(action,grid);
applied.push(type);
}catch(err){
failed.push({type,reason:err instanceof Error?err.message:String(err)});
}
}
return{ok:applied.length>0&&failed.length===0,applied,failed};
}
function buildPrompt(prompt,schemaText){
return[
'You are controlling a data grid. Translate the user\'s request into a JSON intent.',
'',
schemaText,
'',
'Rules:',
'  - Reply with a single JSON object and no other text.',
'  - Shape: {"actions": [ ... ], "explain": "one short sentence"}.',
'  - Use only the column ids and operators listed above.',
'  - If the request cannot be expressed with these actions, reply {"actions": [], "explain": "why not"}.',
'',
`User request: ${String(prompt||'')}`,
].join('\n');
}
function retryPrompt(plan){
const rejected=plan&&Array.isArray(plan.rejected)?plan.rejected:[];
if(!rejected.length)return'';
const lines=rejected.slice(0,10).map((r)=>`  - ${r.at}: ${r.reason}`);
return[
'That intent was rejected. Fix these and reply again with JSON only:',
...lines,
].join('\n');
}
});
__def("packages/modules/ai/askdata.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"READ_ONLY_ACTIONS",{enumerable:true,get:function(){return READ_ONLY_ACTIONS;}});
Object.defineProperty(__exports,"validateReadOnly",{enumerable:true,get:function(){return validateReadOnly;}});
Object.defineProperty(__exports,"buildQueryRequest",{enumerable:true,get:function(){return buildQueryRequest;}});
Object.defineProperty(__exports,"resolveQuery",{enumerable:true,get:function(){return resolveQuery;}});
Object.defineProperty(__exports,"applyQuery",{enumerable:true,get:function(){return applyQuery;}});
Object.defineProperty(__exports,"runAskData",{enumerable:true,get:function(){return runAskData;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isObject=__m0["isObject"];
const __m1=__req("packages/core/src/ai/schema.js");
const promptText=__m1["promptText"];
const toolDefinition=__m1["toolDefinition"];
const __m2=__req("packages/core/src/ai/intent.js");
const buildPrompt=__m2["buildPrompt"];
const READ_ONLY_ACTIONS=Object.freeze(new Set([
'setFilters','setSort','groupBy','showColumns','hideColumns','setQuick','clear',
]));
function validateReadOnly(plan){
const safe=[];
const unsafe=[];
const actions=plan&&Array.isArray(plan.actions)?plan.actions:[];
for(const action of actions){
const type=isObject(action)?String((action).type):String(action);
if(READ_ONLY_ACTIONS.has(type)){
safe.push((action));
}else{
unsafe.push({
type,
reason:`"${type}" is not a read-only action; ask-your-data is read-only, so it will not run`,
});
}
}
let reason='';
if(unsafe.length)reason=`refused ${unsafe.length} action(s) that would change data`;
else if(!safe.length)reason='nothing to run';
return{ok:safe.length>0&&unsafe.length===0,safe,unsafe,reason};
}
function stripRedacted(schema,isRedacted){
if(!isFunction(isRedacted)||!isObject(schema)||!Array.isArray(schema.columns))return schema;
const out={...schema};
out.columns=schema.columns.filter((c)=>!isRedacted(c&&(c.id||c.field||c.name)));
return out;
}
function buildQueryRequest(grid,question,opts={}){
const ai=grid&&grid.ai;
const schemaOptions=opts.schemaOptions||{};
const rawSchema=isFunction(ai&&ai.schema)?ai.schema(schemaOptions):{};
const schema=stripRedacted(rawSchema,opts.isRedacted);
const schemaText=promptText(schema);
const message=buildPrompt(String(question||''),schemaText);
const request={
prompt:String(question||''),
message,
schema,
schemaText,
context:opts.context,
signal:opts.signal,
};
if(opts.tools)request.tools=[toolDefinition(schema,schemaOptions)];
return request;
}
function resolveQuery(grid,reply,opts={}){
const ai=grid&&grid.ai;
const plan=isFunction(ai&&ai.plan)
?ai.plan(reply,opts.schemaOptions)
:{ok:false,actions:[],rejected:[{at:'grid',what:'ai',reason:'grid.ai.plan is unavailable'}],describe:()=>'Nothing to apply.'};
return makeQueryResult(grid,plan,opts.question,opts);
}
function makeQueryResult(grid,plan,question,opts={}){
const gate=validateReadOnly(plan);
const p=(plan);
const result={
ok:gate.ok,
question:String(question||''),
plan,
actions:gate.safe,
unsafe:gate.unsafe,
rejected:Array.isArray(p.rejected)?p.rejected:[],
explain:typeof p.explain==='string'?p.explain:'',
spec:{actions:gate.safe},
applied:null,
describe(){
if(gate.unsafe.length&&!gate.safe.length){
return gate.unsafe.map((u)=>u.reason).join('; ');
}
return isFunction(p.describe)?p.describe():'Nothing to apply.';
},
apply(applyOpts={}){
const report=applyQuery(grid,result,{...opts,...applyOpts});
result.applied=report;
return report;
},
};
return result;
}
function viewRows(grid){
try{
if(grid&&grid.rows&&isFunction(grid.rows.data)){
const data=grid.rows.data();
if(Array.isArray(data))return data;
}
}catch{}
return[];
}
function applyQuery(grid,result,opts={}){
const plan=result&&result.plan;
const gate=validateReadOnly(plan);
if(!gate.ok){
return{
ok:false,
applied:[],
failed:[],
refused:gate.unsafe.length?gate.unsafe:[{type:'plan',reason:gate.reason||'nothing to run'}],
fannedOut:0,
};
}
const ai=grid&&grid.ai;
const report=isFunction(ai&&ai.apply)
?ai.apply(plan)
:{ok:false,applied:[],failed:[{type:'plan',reason:'grid.ai.apply is unavailable'}]};
let fannedOut=0;
const router=opts.router;
const rows=viewRows(grid);
if(router&&isFunction(router.load)){
try{router.load(rows);fannedOut=rows.length;}catch{fannedOut=0;}
}
if(isFunction(opts.onResult)){
try{opts.onResult(rows);}catch{}
}
return{
ok:!!report.ok,
applied:Array.isArray(report.applied)?report.applied:[],
failed:Array.isArray(report.failed)?report.failed:[],
refused:[],
fannedOut,
};
}
async function runAskData(grid,ask,question,opts={}){
const request=buildQueryRequest(grid,question,opts);
const reply=await ask(request);
return resolveQuery(grid,reply,{...opts,question});
}
});
__def("packages/modules/ai/actor.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"ACTOR_SYSTEM",{enumerable:true,get:function(){return ACTOR_SYSTEM;}});
Object.defineProperty(__exports,"parseProposals",{enumerable:true,get:function(){return parseProposals;}});
Object.defineProperty(__exports,"resolveColumn",{enumerable:true,get:function(){return resolveColumn;}});
Object.defineProperty(__exports,"resolveValue",{enumerable:true,get:function(){return resolveValue;}});
Object.defineProperty(__exports,"readCell",{enumerable:true,get:function(){return readCell;}});
Object.defineProperty(__exports,"displayValue",{enumerable:true,get:function(){return displayValue;}});
Object.defineProperty(__exports,"rowLabel",{enumerable:true,get:function(){return rowLabel;}});
Object.defineProperty(__exports,"locateRows",{enumerable:true,get:function(){return locateRows;}});
Object.defineProperty(__exports,"resolveProposal",{enumerable:true,get:function(){return resolveProposal;}});
Object.defineProperty(__exports,"resolveProposals",{enumerable:true,get:function(){return resolveProposals;}});
Object.defineProperty(__exports,"applyProposal",{enumerable:true,get:function(){return applyProposal;}});
Object.defineProperty(__exports,"buildProposalRequest",{enumerable:true,get:function(){return buildProposalRequest;}});
Object.defineProperty(__exports,"runActor",{enumerable:true,get:function(){return runActor;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isObject=__m0["isObject"];
const getPath=__m0["getPath"];
const __m1=__req("packages/core/src/ai/schema.js");
const promptText=__m1["promptText"];
const ACTOR_SYSTEM=[
'You propose edits to a data grid. You NEVER write data yourself and you never',
'invent rows or columns. Return ONLY a JSON object of the form',
'{ "edits": [ { "match": "<text naming the row>" | "key": <row key> | "scope": "view",',
'"column": "<column id>", "value": <the new value or its human label> } ] }.',
'Use "match" to name a single row by a phrase from its data; use "scope":"view"',
'to change every row in the current view (a bulk edit). Target only real columns',
'from the schema. A human reviews every proposed change as a diff and must approve',
'it before anything is written.',
].join(' ');
function parseProposals(reply){
let obj=reply;
if(typeof reply==='string'){
obj=tryJson(reply);
}else if(isObject(reply)){
const r=(reply);
if(r.structured!==undefined)obj=r.structured;
else if(Array.isArray(r.edits))obj=r;
else if(typeof r.text==='string')obj=tryJson(r.text);
else if(typeof r.content==='string')obj=tryJson(r.content);
}
if(Array.isArray(obj))return obj.filter(isObject);
if(isObject(obj)&&Array.isArray((obj).edits)){
return(obj).edits.filter(isObject);
}
return[];
}
function tryJson(text){
try{return JSON.parse(text);}catch{}
const start=text.indexOf('{');
const end=text.lastIndexOf('}');
if(start>=0&&end>start){
try{return JSON.parse(text.slice(start,end+1));}catch{}
}
return null;
}
function resolveColumn(grid,ref){
if(ref==null||!grid||!grid.columns)return null;
const id=String(ref);
try{
const byId=isFunction(grid.columns.get)?grid.columns.get(id):null;
if(byId)return byId;
const all=isFunction(grid.columns.all)?grid.columns.all():[];
return all.find((c)=>c&&c.field===id)||null;
}catch{return null;}
}
function resolveValue(column,raw,row){
const lookup=column&&column.lookup;
if(lookup&&isFunction(lookup.options)){
let options=[];
try{options=lookup.options()||[];}catch{options=[];}
const byId=options.find((o)=>o&&Object.is(o.id,raw));
if(byId)return{ok:true,value:byId.id};
const rawText=raw==null?'':String(raw).trim().toLowerCase();
const byLabel=options.find((o)=>o&&String(o.label??'').trim().toLowerCase()===rawText);
if(byLabel)return{ok:true,value:byLabel.id};
if(lookup.allowCustom===true)return{ok:true,value:raw};
const known=options.map((o)=>String(o.label??o.id)).join(', ');
return{
ok:false,
reason:`"${raw}" is not a valid value for "${column.title||column.id}"`
+(known?` (expected one of: ${known})`:''),
};
}
const base=column&&column.dataType&&typeof column.dataType==='object'
?column.dataType.base
:column&&column.dataType;
if(base==='number'){
const n=typeof raw==='number'?raw:Number(raw);
if(!Number.isFinite(n)){
return{ok:false,reason:`"${raw}" is not a number for "${column.title||column.id}"`};
}
return validateHook(column,n,row);
}
return validateHook(column,raw,row);
}
function validateHook(column,value,row){
const validate=column&&column.edit&&column.edit.validate;
if(isFunction(validate)){
let result;
try{result=validate({value,row:row||{},colId:column.id});}
catch{result=true;}
if(result!==true){
return{ok:false,reason:typeof result==='string'?result:`invalid value for "${column.title||column.id}"`};
}
}
return{ok:true,value};
}
function readCell(row,column){
if(!row||!column)return undefined;
const field=column.field||column.id;
return getPath(row,field);
}
function displayValue(column,value){
const lookup=column&&column.lookup;
if(lookup&&isFunction(lookup.options)){
try{
const opt=(lookup.options()||[]).find((o)=>o&&Object.is(o.id,value));
if(opt)return String(opt.label??opt.id);
}catch{}
}
if(value==null)return'(empty)';
return String(value);
}
function rowLabel(grid,row,key,columns,isRedacted){
const NAMEY=new Set(['name','title','label','description','subject','summary']);
for(const c of columns){
const id=String(c.id||c.field||'').toLowerCase();
if(!NAMEY.has(id))continue;
if(isRedacted(c.id)||isRedacted(c.field))continue;
const v=readCell(row,c);
if(typeof v==='string'&&v.trim())return v.trim();
}
for(const c of columns){
if(isRedacted(c.id)||isRedacted(c.field))continue;
const v=readCell(row,c);
if(typeof v==='string'&&v.trim()&&v!==key)return v.trim();
}
return`row ${key}`;
}
function locateRows(rows,phrase,columns,isRedacted){
const needle=String(phrase||'').trim().toLowerCase();
if(!needle)return[];
const out=[];
for(const entry of rows){
let hit=false;
for(const c of columns){
if(isRedacted(c.id)||isRedacted(c.field))continue;
const v=readCell(entry.row,c);
if(v!=null&&String(v).toLowerCase().includes(needle)){hit=true;break;}
}
if(hit)out.push(entry);
}
return out;
}
function viewRows(grid){
const out=[];
try{
if(grid&&grid.rows&&isFunction(grid.rows.forEach)){
grid.rows.forEach((r)=>{
if(r&&!r.group&&!r.removed&&r.data!=null)out.push({row:r.data,key:String(r.key)});
});
}
}catch{}
return out;
}
function allRows(grid){
const out=[];
try{
if(grid&&grid.rows&&isFunction(grid.rows.forEachAll)){
grid.rows.forEachAll((r)=>{
if(r&&!r.group&&!r.removed&&r.data!=null)out.push({row:r.data,key:String(r.key)});
});
return out;
}
}catch{}
return viewRows(grid);
}
function resolveProposal(grid,raw,ctx){
const column=resolveColumn(grid,raw.column);
if(!column){
return{kind:'reject',reason:`there is no column "${raw.column}"`,detail:{column:raw.column,value:raw.value}};
}
if(!(column.edit&&column.edit.enabled)){
return{kind:'reject',reason:`"${column.title||column.id}" is not editable`,detail:{column:column.id}};
}
let targets=[];
if(raw.scope==='view'||raw.scope==='all'){
targets=ctx.view;
}else if(raw.key!==undefined&&raw.key!==null){
const wantKey=String(raw.key);
const inView=ctx.view.find((t)=>t.key===wantKey);
if(inView)targets=[inView];
else{
const outside=allRows(grid).find((t)=>t.key===wantKey);
if(outside&&ctx.widen)targets=[outside];
else if(outside)return outOfView(grid,column,raw,[outside],ctx);
else return{kind:'reject',reason:`no row with key "${raw.key}" in the current view`,detail:{key:raw.key}};
}
}else if(raw.match!==undefined&&raw.match!==null){
const found=locateRows(ctx.view,raw.match,ctx.columns,ctx.isRedacted);
if(found.length===1)targets=found;
else if(found.length>1){
return{
kind:'ambiguous',
reason:`"${raw.match}" matches ${found.length} rows in your current view`,
candidates:found.map((f)=>({key:f.key,label:rowLabel(grid,f.row,f.key,ctx.columns,ctx.isRedacted)})),
detail:{match:raw.match,column:column.id,value:raw.value},
};
}else{
const outside=locateRows(allRows(grid),raw.match,ctx.columns,ctx.isRedacted);
if(outside.length&&ctx.widen)targets=outside.slice(0,1);
else if(outside.length)return outOfView(grid,column,raw,outside,ctx);
else return{kind:'reject',reason:`nothing matching "${raw.match}" in the current view`,detail:{match:raw.match}};
}
}else{
return{kind:'reject',reason:'a proposal must name a row (match/key) or a scope',detail:{column:column.id}};
}
const resolved=resolveValue(column,raw.value,targets[0]&&targets[0].row);
if(!resolved.ok)return{kind:'reject',reason:resolved.reason,detail:{column:column.id,value:raw.value}};
const entries=[];
let unchanged=0;
for(const{row,key}of targets){
const before=readCell(row,column);
if(Object.is(before,resolved.value)){unchanged++;continue;}
entries.push({
key,
rowLabel:rowLabel(grid,row,key,ctx.columns,ctx.isRedacted),
colId:column.id,
colTitle:column.title||column.id,
oldValue:before,
oldDisplay:displayValue(column,before),
newValue:resolved.value,
newDisplay:displayValue(column,resolved.value),
});
}
if(!entries.length){
return{kind:'noop',reason:`already set on ${unchanged} row(s)`,detail:{column:column.id}};
}
return{kind:'apply',entries};
}
function outOfView(grid,column,raw,found,ctx){
return{
kind:'outOfView',
reason:`not in the current view — ${found.length} match(es) exist in the full data`,
candidates:found.map((f)=>({key:f.key,label:rowLabel(grid,f.row,f.key,ctx.columns,ctx.isRedacted)})),
detail:{match:raw.match,key:raw.key,column:column.id,value:raw.value},
};
}
function resolveProposals(grid,rawEdits,opts={}){
const isRedacted=isFunction(opts.isRedacted)?opts.isRedacted:()=>false;
const view=viewRows(grid);
let columns=[];
try{columns=isFunction(grid.columns.all)?grid.columns.all():[];}catch{columns=[];}
const ctx={view,columns,isRedacted,widen:opts.widen===true};
const diff=[];
const rejected=[];
const ambiguous=[];
const outOfViewList=[];
const noops=[];
let bulk=false;
for(const raw of Array.isArray(rawEdits)?rawEdits:[]){
if(raw&&(raw.scope==='view'||raw.scope==='all'))bulk=true;
const outcome=resolveProposal(grid,raw,ctx);
if(outcome.kind==='apply')diff.push(...outcome.entries);
else if(outcome.kind==='reject')rejected.push({reason:outcome.reason,...outcome.detail});
else if(outcome.kind==='ambiguous')ambiguous.push({reason:outcome.reason,candidates:outcome.candidates,...outcome.detail});
else if(outcome.kind==='outOfView')outOfViewList.push({reason:outcome.reason,candidates:outcome.candidates,...outcome.detail});
else if(outcome.kind==='noop')noops.push({reason:outcome.reason,...outcome.detail});
}
const scope=opts.widen?'all':'view';
const scopeCount=view.length;
const scopeText=opts.widen
?'the full dataset'
:`your current view (${scopeCount} row${scopeCount===1?'':'s'})`;
const result={
ok:diff.length>0,
instruction:String(opts.instruction||''),
scope,
scopeCount,
scopeText,
bulk,
diff,
rejected,
ambiguous,
outOfView:outOfViewList,
noops,
applied:null,
describe(){
if(!diff.length){
if(ambiguous.length)return ambiguous[0].reason;
if(outOfViewList.length)return outOfViewList[0].reason;
if(rejected.length)return rejected[0].reason;
if(noops.length)return`No change needed — ${noops[0].reason} in ${scopeText}.`;
return`Nothing to change in ${scopeText}.`;
}
const rowWord=diff.length===1?'row':'rows';
const cols=[...new Set(diff.map((d)=>d.colTitle))].join(', ');
const inView=bulk?`the ${diff.length} filtered ${rowWord} in ${scopeText}`:`${diff.length} ${rowWord} in ${scopeText}`;
return`Update ${cols} on ${inView}.`;
},
async apply(applyOpts={}){
const report=await applyProposal(grid,result,{board:applyOpts.board??opts.board});
result.applied=report;
return result.applied;
},
};
return result;
}
async function applyProposal(grid,result,opts={}){
const diff=(result&&Array.isArray(result.diff))?result.diff:[];
if(!diff.length)return{ok:false,applied:0,requested:0,vetoed:0,via:'none'};
const board=opts.board;
const columnProperty=board&&board.config?board.config.columnProperty:null;
if(board&&isFunction(board.move)&&columnProperty
&&diff.every((d)=>d.colId===columnProperty||d.colId===resolveColumnId(grid,columnProperty))){
let applied=0;
for(const d of diff){
const out=await Promise.resolve(board.move(d.key,d.newValue,null,undefined,{origin:'ai'}));
if(out&&Array.isArray(out.moved)&&out.moved.length)applied+=out.moved.length;
}
return{ok:applied>0,applied,requested:diff.length,vetoed:diff.length-applied,via:'board.move'};
}
const writes=diff.map((d)=>({key:d.key,colId:d.colId,value:d.newValue}));
const applied=await Promise.resolve(grid.edit.setCells(writes,'cell',{origin:'ai'}));
const n=typeof applied==='number'?applied:0;
return{ok:n>0,applied:n,requested:writes.length,vetoed:writes.length-n,via:'setCells'};
}
function resolveColumnId(grid,prop){
const column=resolveColumn(grid,prop);
return column?column.id:prop;
}
function buildProposalRequest(grid,instruction,opts={}){
const ai=grid&&grid.ai;
const isRedacted=isFunction(opts.isRedacted)?opts.isRedacted:()=>false;
const rawSchema=isFunction(ai&&ai.schema)?ai.schema(opts.schemaOptions||{}):{};
const schema=stripRedactedSchema(rawSchema,isRedacted);
const schemaText=promptText(schema);
const cap=Number.isFinite(opts.maxRows)?Math.max(0,Number(opts.maxRows)):50;
let columns=[];
try{columns=isFunction(grid.columns.all)?grid.columns.all():[];}catch{columns=[];}
const rows=viewRows(grid).slice(0,cap).map((entry)=>redactRow(entry,columns,isRedacted));
const message=`${instruction}\n\nSCHEMA\n${schemaText}`;
return{
system:ACTOR_SYSTEM,
prompt:`${ACTOR_SYSTEM}\n\n${message}`,
message,
schema,
schemaText,
rows,
context:opts.context,
signal:opts.signal,
};
}
function stripRedactedSchema(schema,isRedacted){
if(!isObject(schema)||!Array.isArray((schema).columns))return schema;
const s=(schema);
return{...s,columns:s.columns.filter((c)=>!isRedacted(c&&(c.id||c.field||c.name)))};
}
function redactRow(entry,columns,isRedacted){
const out={__key:entry.key};
for(const c of columns){
const id=c.id||c.field;
if(isRedacted(c.id)||isRedacted(c.field))continue;
out[id]=readCell(entry.row,c);
}
return out;
}
async function runActor(grid,ask,instruction,opts={}){
const request=buildProposalRequest(grid,instruction,opts);
const reply=await ask(request);
const raw=parseProposals(reply);
return resolveProposals(grid,raw,{
instruction,
isRedacted:opts.isRedacted,
widen:opts.widen,
board:opts.board,
});
}
});
__def("packages/modules/ai/view.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"NS",{enumerable:true,get:function(){return NS;}});
Object.defineProperty(__exports,"Emitter",{enumerable:true,get:function(){return Emitter;}});
Object.defineProperty(__exports,"documentFor",{enumerable:true,get:function(){return documentFor;}});
Object.defineProperty(__exports,"injectStyles",{enumerable:true,get:function(){return injectStyles;}});
Object.defineProperty(__exports,"mountPanel",{enumerable:true,get:function(){return mountPanel;}});
Object.defineProperty(__exports,"paintPanel",{enumerable:true,get:function(){return paintPanel;}});
Object.defineProperty(__exports,"mountAskBar",{enumerable:true,get:function(){return mountAskBar;}});
Object.defineProperty(__exports,"paintAskBar",{enumerable:true,get:function(){return paintAskBar;}});
Object.defineProperty(__exports,"mountActorBar",{enumerable:true,get:function(){return mountActorBar;}});
Object.defineProperty(__exports,"paintActorBar",{enumerable:true,get:function(){return paintActorBar;}});
Object.defineProperty(__exports,"explainButton",{enumerable:true,get:function(){return explainButton;}});
const NS='lat-ai';
class Emitter{
constructor(){this.map=new Map();}
on(name,fn){
if(!this.map.has(name))this.map.set(name,new Set());
this.map.get(name).add(fn);
return()=>this.off(name,fn);
}
off(name,fn){this.map.get(name)?.delete(fn);}
emit(name,payload){
for(const fn of this.map.get(name)||[]){
try{fn(payload);}catch{}
}
}
}
function documentFor(el){
if(el&&el.ownerDocument)return el.ownerDocument;
if(typeof globalThis!=='undefined'&&globalThis.document)return globalThis.document;
return null;
}
function injectStyles(doc){
if(!doc||!doc.createElement||(doc.getElementById&&doc.getElementById(`${NS}-styles`)))return;
const style=doc.createElement('style');
style.id=`${NS}-styles`;
style.setAttribute('id',`${NS}-styles`);
style.textContent=`
.${NS}{border:1px solid var(--${NS}-border,#d7dbe0);border-radius:8px;background:var(--${NS}-bg,#fff);font:inherit;padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.${NS}__head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.${NS}__title{font-weight:600}
.${NS}__btn{font:inherit;cursor:pointer;border:1px solid var(--${NS}-border,#d7dbe0);border-radius:6px;background:var(--${NS}-btn,#f4f6f8);padding:4px 10px}
.${NS}__btn:focus-visible{outline:2px solid var(--${NS}-focus,#2563eb);outline-offset:2px}
.${NS}__btn[disabled]{opacity:.6;cursor:default}
.${NS}__status{font-size:.8em;color:var(--${NS}-muted,#586069)}
.${NS}__body{white-space:pre-wrap;line-height:1.45}
.${NS}__flag{font-size:.8em;color:var(--${NS}-warn,#9a6700)}
.${NS}__error{font-size:.85em;color:var(--${NS}-error,#b42318)}
.${NS}-explain{font:inherit;cursor:pointer;border:1px solid var(--${NS}-border,#d7dbe0);border-radius:6px;background:var(--${NS}-btn,#f4f6f8);padding:2px 8px}
.${NS}-ask{gap:8px}
.${NS}-ask__row{display:flex;gap:8px;align-items:center}
.${NS}-ask__input{flex:1;font:inherit;padding:6px 8px;border:1px solid var(--${NS}-border,#d7dbe0);border-radius:6px}
.${NS}-ask__auto{font-size:.8em;color:var(--${NS}-muted,#586069);display:flex;align-items:center;gap:4px}
.${NS}-ask__preview{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid var(--${NS}-border,#d7dbe0);border-radius:6px;background:var(--${NS}-bg,#fff)}
.${NS}-ask__preview[hidden]{display:none}
.${NS}-ask__summary{font-weight:500}
.${NS}-ask__notes{margin:0;padding-left:18px;font-size:.8em;color:var(--${NS}-warn,#9a6700)}
.${NS}-ask__buttons{display:flex;gap:8px}
.${NS}-act__scope{font-size:.8em;color:var(--${NS}-muted,#586069)}
.${NS}-act__diff{width:100%;border-collapse:collapse;font-size:.85em}
.${NS}-act__diff th,.${NS}-act__diff td{text-align:left;padding:3px 6px;border-bottom:1px solid var(--${NS}-border,#eceef1);vertical-align:top}
.${NS}-act__old{color:var(--${NS}-error,#b42318);text-decoration:line-through}
.${NS}-act__new{color:var(--${NS}-ok,#1a7f37);font-weight:600}
.${NS}-act__note{margin:0;padding-left:18px;font-size:.8em;color:var(--${NS}-warn,#9a6700)}
.${NS}-act__cands{margin:2px 0 0;padding-left:18px;font-size:.8em}
`;
const head=doc.head||doc.documentElement||doc.body;
if(head&&head.appendChild)head.appendChild(style);
}
function make(doc,tag,className,text){
const el=doc.createElement(tag);
if(className)el.className=className;
if(text!=null)el.textContent=text;
return el;
}
function mountPanel(el,opts={}){
const doc=documentFor(el);
injectStyles(doc);
el.classList.add(NS);
el.textContent='';
const head=make(doc,'div',`${NS}__head`);
const title=make(doc,'div',`${NS}__title`,opts.title||'Insights');
const button=make(doc,'button',`${NS}__btn`,opts.action||'Explain this view');
button.setAttribute('type','button');
if(opts.onGenerate)button.addEventListener('click',()=>opts.onGenerate());
head.appendChild(title);
head.appendChild(button);
const status=make(doc,'div',`${NS}__status`,'');
status.setAttribute('aria-live','polite');
const body=make(doc,'div',`${NS}__body`,'');
const flag=make(doc,'div',`${NS}__flag`,'');
const error=make(doc,'div',`${NS}__error`,'');
el.appendChild(head);
el.appendChild(status);
el.appendChild(body);
el.appendChild(flag);
el.appendChild(error);
return{root:el,button,status,body,flag,error};
}
function paintPanel(regions,state){
if(!regions)return;
regions.status.textContent=state.status||'';
regions.body.textContent=state.text||'';
regions.error.textContent=state.error||'';
if(regions.button)regions.button.disabled=!!state.busy;
const flagged=state.flagged||[];
regions.flag.textContent=flagged.length
?`${flagged.length} unverified figure${flagged.length>1?'s were':' was'} removed as ungrounded.`
:'';
}
function mountAskBar(el,opts={}){
const doc=documentFor(el);
injectStyles(doc);
el.classList.add(NS,`${NS}-ask`);
el.textContent='';
el.setAttribute('role','search');
const row=make(doc,'div',`${NS}-ask__row`);
const input=make(doc,'input',`${NS}-ask__input`);
input.setAttribute('type','text');
input.setAttribute('autocomplete','off');
input.setAttribute('placeholder',opts.placeholder||'Ask your data: “EMEA deals over 50k, biggest first”');
input.setAttribute('aria-label',opts.placeholder||'Ask your data');
const ask=make(doc,'button',`${NS}__btn ${NS}-ask__ask`,opts.askLabel||'Ask');
ask.setAttribute('type','button');
row.appendChild(input);
row.appendChild(ask);
const autoWrap=make(doc,'label',`${NS}-ask__auto`);
const auto=make(doc,'input');
auto.setAttribute('type','checkbox');
autoWrap.appendChild(auto);
autoWrap.appendChild(doc.createTextNode(opts.autoLabel||'Auto-apply safe reads'));
const preview=make(doc,'div',`${NS}-ask__preview`);
preview.hidden=true;
preview.setAttribute('hidden','');
const summary=make(doc,'p',`${NS}-ask__summary`,'');
const notes=make(doc,'ul',`${NS}-ask__notes`);
const buttons=make(doc,'div',`${NS}-ask__buttons`);
const apply=make(doc,'button',`${NS}__btn ${NS}-ask__apply`,opts.applyLabel||'Apply');
apply.setAttribute('type','button');
const discard=make(doc,'button',`${NS}__btn ${NS}-ask__discard`,opts.discardLabel||'Discard');
discard.setAttribute('type','button');
buttons.appendChild(apply);
buttons.appendChild(discard);
preview.appendChild(summary);
preview.appendChild(notes);
preview.appendChild(buttons);
const status=make(doc,'div',`${NS}__status`,'');
status.setAttribute('role','status');
status.setAttribute('aria-live','polite');
const error=make(doc,'div',`${NS}__error`,'');
error.setAttribute('role','alert');
el.appendChild(row);
el.appendChild(autoWrap);
el.appendChild(preview);
el.appendChild(status);
el.appendChild(error);
if(opts.onAsk){
ask.addEventListener('click',()=>opts.onAsk(String(input.value||'').trim()));
input.addEventListener('keydown',(ev)=>{
if(ev&&ev.key==='Enter'){
if(typeof ev.preventDefault==='function')ev.preventDefault();
opts.onAsk(String(input.value||'').trim());
}
});
}
if(opts.onApply)apply.addEventListener('click',()=>opts.onApply());
if(opts.onDiscard)discard.addEventListener('click',()=>opts.onDiscard());
if(opts.onAutoChange)auto.addEventListener('change',()=>opts.onAutoChange(!!auto.checked));
return{root:el,input,ask,preview,summary,notes,apply,discard,status,error,auto};
}
function paintAskBar(regions,state){
if(!regions)return;
regions.status.textContent=state.status||'';
regions.error.textContent=state.error||'';
if(regions.ask)regions.ask.disabled=!!state.busy;
if(regions.input)regions.input.disabled=!!state.busy;
const showPreview=!!state.preview;
regions.preview.hidden=!showPreview;
if(showPreview)regions.preview.removeAttribute('hidden');
else regions.preview.setAttribute('hidden','');
regions.summary.textContent=state.summary||'';
regions.notes.textContent='';
const notes=state.notes||[];
const doc=documentFor(regions.root);
for(const note of notes.slice(0,6)){
regions.notes.appendChild(make(doc,'li','',note));
}
}
function mountActorBar(el,opts={}){
const doc=documentFor(el);
injectStyles(doc);
el.classList.add(NS,`${NS}-ask`,`${NS}-act`);
el.textContent='';
el.setAttribute('role','form');
const row=make(doc,'div',`${NS}-ask__row`);
const input=make(doc,'input',`${NS}-ask__input`);
input.setAttribute('type','text');
input.setAttribute('autocomplete','off');
input.setAttribute('placeholder',opts.placeholder||'Ask AI to change data: “set the Network Upgrade project to In Progress”');
input.setAttribute('aria-label',opts.placeholder||'Ask AI to change data');
const propose=make(doc,'button',`${NS}__btn ${NS}-act__propose`,opts.proposeLabel||'Propose');
propose.setAttribute('type','button');
row.appendChild(input);
row.appendChild(propose);
const scope=make(doc,'div',`${NS}-act__scope`,'');
scope.setAttribute('aria-live','polite');
const preview=make(doc,'div',`${NS}-ask__preview`);
preview.hidden=true;
preview.setAttribute('hidden','');
const summary=make(doc,'p',`${NS}-ask__summary`,'');
const diff=make(doc,'table',`${NS}-act__diff`);
const notes=make(doc,'ul',`${NS}-act__note`);
const buttons=make(doc,'div',`${NS}-ask__buttons`);
const approve=make(doc,'button',`${NS}__btn ${NS}-act__approve`,opts.approveLabel||'Approve');
approve.setAttribute('type','button');
const discard=make(doc,'button',`${NS}__btn ${NS}-act__discard`,opts.discardLabel||'Discard');
discard.setAttribute('type','button');
buttons.appendChild(approve);
buttons.appendChild(discard);
preview.appendChild(summary);
preview.appendChild(diff);
preview.appendChild(notes);
preview.appendChild(buttons);
const status=make(doc,'div',`${NS}__status`,'');
status.setAttribute('role','status');
status.setAttribute('aria-live','polite');
const error=make(doc,'div',`${NS}__error`,'');
error.setAttribute('role','alert');
el.appendChild(row);
el.appendChild(scope);
el.appendChild(preview);
el.appendChild(status);
el.appendChild(error);
if(opts.onPropose){
propose.addEventListener('click',()=>opts.onPropose(String(input.value||'').trim()));
input.addEventListener('keydown',(ev)=>{
if(ev&&ev.key==='Enter'){
if(typeof ev.preventDefault==='function')ev.preventDefault();
opts.onPropose(String(input.value||'').trim());
}
});
}
if(opts.onApprove)approve.addEventListener('click',()=>opts.onApprove());
if(opts.onDiscard)discard.addEventListener('click',()=>opts.onDiscard());
return{root:el,input,propose,scope,preview,summary,diff,notes,approve,discard,status,error};
}
function paintActorBar(regions,state){
if(!regions)return;
regions.status.textContent=state.status||'';
regions.error.textContent=state.error||'';
regions.scope.textContent=state.scope||'';
if(regions.propose)regions.propose.disabled=!!state.busy;
if(regions.input)regions.input.disabled=!!state.busy;
const showPreview=!!state.preview;
regions.preview.hidden=!showPreview;
if(showPreview)regions.preview.removeAttribute('hidden');
else regions.preview.setAttribute('hidden','');
regions.summary.textContent=state.summary||'';
const doc=documentFor(regions.root);
regions.diff.textContent='';
const rows=state.diff||[];
if(rows.length){
const thead=make(doc,'tr');
for(const h of['Row','Field','From','To'])thead.appendChild(make(doc,'th','',h));
regions.diff.appendChild(thead);
for(const d of rows.slice(0,200)){
const tr=make(doc,'tr');
tr.appendChild(make(doc,'td','',d.rowLabel));
tr.appendChild(make(doc,'td','',d.colTitle));
tr.appendChild(make(doc,'td',`${NS}-act__old`,d.oldDisplay));
tr.appendChild(make(doc,'td',`${NS}-act__new`,d.newDisplay));
regions.diff.appendChild(tr);
}
}
regions.notes.textContent='';
for(const note of(state.notes||[]).slice(0,8)){
regions.notes.appendChild(make(doc,'li','',note));
}
}
function explainButton(doc,opts={}){
injectStyles(doc);
const button=make(doc,'button',`${NS}-explain`,opts.label||'Explain');
button.setAttribute('type','button');
if(opts.onClick)button.addEventListener('click',()=>opts.onClick());
return button;
}
});
__def("packages/modules/ai/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createAI",{enumerable:true,get:function(){return createAI;}});
Object.defineProperty(__exports,"buildRiskFacts",{enumerable:true,get:function(){return buildRiskFacts;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const isObject=__m0["isObject"];
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/ai/narrative.js");
const runNarrative=__m1["runNarrative"];
const __m2=__req("packages/modules/ai/facts.js");
const buildFactsPacket=__m2["buildFactsPacket"];
const __m3=__req("packages/modules/ai/risk.js");
const buildRiskFacts=__m3["buildRiskFacts"];
const __m4=__req("packages/modules/ai/redact.js");
const redactor=__m4["redactor"];
const __m5=__req("packages/modules/ai/askdata.js");
const runAskData=__m5["runAskData"];
const applyQuerySpec=__m5["applyQuery"];
const __m6=__req("packages/modules/ai/actor.js");
const runActor=__m6["runActor"];
const applyProposalEdits=__m6["applyProposal"];
const __m7=__req("packages/modules/ai/view.js");
const Emitter=__m7["Emitter"];
const mountPanel=__m7["mountPanel"];
const paintPanel=__m7["paintPanel"];
const explainButton=__m7["explainButton"];
const documentFor=__m7["documentFor"];
const mountAskBar=__m7["mountAskBar"];
const paintAskBar=__m7["paintAskBar"];
const mountActorBar=__m7["mountActorBar"];
const paintActorBar=__m7["paintActorBar"];
const AI_EVENTS=Object.freeze(['narrative','query','proposal','error']);
function resolveAsk(grid,cfg){
if(isFunction(cfg.ask)){
return{ask:cfg.ask,tools:cfg.tools!==false};
}
let fromGrid=null;
try{
const gc=isFunction(grid.config)?grid.config():null;
if(gc&&isObject(gc.ai)&&isFunction(gc.ai.ask))fromGrid=gc.ai.ask;
}catch{fromGrid=null;}
if(fromGrid){
return{ask:fromGrid,tools:cfg.tools===true};
}
return{ask:null,tools:false};
}
function enabled(enable,feature){
if(!Array.isArray(enable))return true;
return enable.includes(feature);
}
function createAI(grid,config={}){
const cfg=isObject(config)?config:{};
if(!grid||!grid.statistics||!grid.rows){
warnOnce('ai:no-grid',
'createAI needs a Lattice grid instance to ground on (grid.statistics/grid.rows). '
+'Pass the grid returned by createGrid or createHeadlessGrid.');
}
const{ask,tools}=resolveAsk(grid,cfg);
const emitter=new Emitter();
const isRedacted=redactor(cfg.redact);
let panelRegions=null;
let askRegions=null;
let actorRegions=null;
let destroyed=false;
if(isFunction(cfg.onNarrative))emitter.on('narrative',cfg.onNarrative);
if(isFunction(cfg.onQuery))emitter.on('query',cfg.onQuery);
if(isFunction(cfg.onProposal))emitter.on('proposal',cfg.onProposal);
if(isFunction(cfg.onError))emitter.on('error',cfg.onError);
const runOpts=(opts={})=>({
tools:opts.tools??tools,
maxRows:opts.maxRows??cfg.maxRows,
redact:opts.redact??cfg.redact,
locale:opts.locale??cfg.locale,
mode:opts.mode??cfg.reconcile,
maxColumns:opts.maxColumns??cfg.maxColumns,
question:opts.question,
signal:opts.signal,
});
async function explain(target={kind:'view'},opts={}){
if(destroyed)throw new Error('[lattice] this AI controller has been destroyed');
if(!isFunction(ask)){
const error=new Error('[lattice] no ai ask() is configured; pass createAI(grid, { ask }) '
+'or set ai.ask on the grid');
emitter.emit('error',{error,target});
throw error;
}
try{
const result=await runNarrative(grid,ask,target,runOpts(opts));
emitter.emit('narrative',result);
return result;
}catch(error){
emitter.emit('error',{error,target});
throw error;
}
}
function riskSummary(sources={},opts={}){
return explain({kind:'risk',...(isObject(sources)?sources:{})},opts);
}
function insights(el,opts={}){
const host=el||cfg.element;
if(!enabled(cfg.enable,'insights')&&!enabled(cfg.enable,'narrative'))return controller;
if(!host||!documentFor(host)){
warnOnce('ai:insights:no-el',
'ai.insights() needs a DOM element to mount into; none was given and there is no document.');
return controller;
}
const run=async()=>{
paintPanel(panelRegions,{busy:true,status:'Thinking…'});
try{
const result=await explain({kind:'view'},opts);
paintPanel(panelRegions,{
busy:false,status:'',text:result.text,flagged:result.flagged,
});
}catch(error){
paintPanel(panelRegions,{
busy:false,status:'',
error:'Could not generate insights right now. The grid is unaffected.',
});
}
};
panelRegions=mountPanel(host,{
title:opts.title||'Insights',
action:opts.action||'Explain this view',
onGenerate:run,
});
return controller;
}
function attachExplain(target,opts={}){
const doc=documentFor(opts.mount||cfg.element);
if(!doc){
warnOnce('ai:explain:no-doc','attachExplain() needs a document to build a button.');
return null;
}
const button=explainButton(doc,{
label:opts.label,
onClick:async()=>{
button.disabled=true;
try{
const result=await explain(target,opts);
if(isFunction(opts.onResult))opts.onResult(result);
}catch(error){
if(isFunction(opts.onError))opts.onError(error);
}finally{button.disabled=false;}
},
});
if(opts.mount&&opts.mount.appendChild)opts.mount.appendChild(button);
return button;
}
function facts(target={kind:'view'},opts={}){
return buildFactsPacket(grid,target,{
isRedacted:opts.redact?redactor(opts.redact):isRedacted,
locale:opts.locale??cfg.locale,
maxColumns:opts.maxColumns??cfg.maxColumns,
});
}
async function query(question,opts={}){
if(destroyed)throw new Error('[lattice] this AI controller has been destroyed');
if(!isFunction(ask)){
const error=new Error('[lattice] no ai ask() is configured; pass createAI(grid, { ask }) '
+'or set ai.ask on the grid');
emitter.emit('error',{error,question});
throw error;
}
const router=opts.router??cfg.router;
try{
const result=await runAskData(grid,ask,question,{
schemaOptions:opts.schemaOptions??cfg.schemaOptions,
context:opts.context??cfg.context,
tools:opts.tools??tools,
isRedacted:opts.redact?redactor(opts.redact):isRedacted,
signal:opts.signal,
router,
onResult:opts.onResult,
question,
});
const autoApply=opts.autoApply??cfg.autoApply??false;
if(autoApply&&result.ok)result.apply({router,onResult:opts.onResult});
emitter.emit('query',result);
return result;
}catch(error){
emitter.emit('error',{error,question});
throw error;
}
}
function runQuery(result,opts={}){
return applyQuerySpec(grid,result,{
router:opts.router??cfg.router,
onResult:opts.onResult,
});
}
function askBar(el,opts={}){
const host=el||cfg.element;
if(!enabled(cfg.enable,'query')&&!enabled(cfg.enable,'ask'))return controller;
if(!host||!documentFor(host)){
warnOnce('ai:askbar:no-el',
'ai.askBar() needs a DOM element to mount into; none was given and there is no document.');
return controller;
}
const router=opts.router??cfg.router;
let pending=null;
let autoOn=!!(opts.autoApply??cfg.autoApply);
const fail=(message)=>paintAskBar(askRegions,{busy:false,preview:false,error:message});
askRegions=mountAskBar(host,{
placeholder:opts.placeholder,
askLabel:opts.askLabel,
applyLabel:opts.applyLabel,
discardLabel:opts.discardLabel,
autoLabel:opts.autoLabel,
onAutoChange:(on)=>{autoOn=on;},
onAsk:async(text)=>{
if(!text)return;
paintAskBar(askRegions,{busy:true,status:'Thinking…'});
try{
const result=await query(text,{router,autoApply:false});
if(!result.ok){
pending=null;
const why=result.unsafe.length
?result.unsafe.map((u)=>u.reason)
:result.rejected.map((r)=>r.reason);
fail(`I could not turn that into a safe query: ${why.join('; ')||'nothing to do'}`);
return;
}
if(autoOn){
runQuery(result,{router});
pending=null;
askRegions.input.value='';
paintAskBar(askRegions,{busy:false,preview:false,status:`Applied: ${result.describe()}`});
return;
}
pending=result;
paintAskBar(askRegions,{
busy:false,preview:true,summary:result.describe(),
notes:result.rejected.map((r)=>r.reason),
});
}catch{
fail('Could not reach the model right now. The grid is unaffected.');
}
},
onApply:()=>{
if(!pending)return;
const described=pending.describe();
const report=runQuery(pending,{router});
pending=null;
askRegions.input.value='';
paintAskBar(askRegions,{
busy:false,preview:false,
status:report.ok?`Applied: ${described}`
:`Could not apply: ${(report.refused[0]&&report.refused[0].reason)||'it failed'}`,
});
},
onDiscard:()=>{
pending=null;
paintAskBar(askRegions,{busy:false,preview:false,status:'Discarded.'});
},
});
if(autoOn&&askRegions.auto)askRegions.auto.checked=true;
return controller;
}
async function propose(instruction,opts={}){
if(destroyed)throw new Error('[lattice] this AI controller has been destroyed');
if(!isFunction(ask)){
const error=new Error('[lattice] no ai ask() is configured; pass createAI(grid, { ask }) '
+'or set ai.ask on the grid');
emitter.emit('error',{error,instruction});
throw error;
}
try{
const result=await runActor(grid,ask,instruction,{
schemaOptions:opts.schemaOptions??cfg.schemaOptions,
maxRows:opts.maxRows??cfg.maxRows,
context:opts.context??cfg.context,
isRedacted:opts.redact?redactor(opts.redact):isRedacted,
widen:opts.widen===true,
board:opts.board??cfg.board,
signal:opts.signal,
});
emitter.emit('proposal',result);
return result;
}catch(error){
emitter.emit('error',{error,instruction});
throw error;
}
}
function applyProposal(result,opts={}){
return applyProposalEdits(grid,result,{board:opts.board??cfg.board});
}
function actorBar(el,opts={}){
const host=el||cfg.element;
if(!enabled(cfg.enable,'actor'))return controller;
if(!host||!documentFor(host)){
warnOnce('ai:actorbar:no-el',
'ai.actorBar() needs a DOM element to mount into; none was given and there is no document.');
return controller;
}
const board=opts.board??cfg.board;
let pending=null;
const notesFor=(result)=>{
const notes=[];
for(const a of result.ambiguous){
notes.push(`${a.reason}: ${a.candidates.map((c)=>c.label).join(', ')} — narrow your view or name the row precisely.`);
}
for(const o of result.outOfView)notes.push(`${o.reason}. Clear the filter to include it.`);
for(const r of result.rejected)notes.push(r.reason);
return notes;
};
const regions=mountActorBar(host,{
placeholder:opts.placeholder,
proposeLabel:opts.proposeLabel,
approveLabel:opts.approveLabel,
discardLabel:opts.discardLabel,
onPropose:async(text)=>{
if(!text)return;
paintActorBar(regions,{busy:true,status:'Thinking…'});
try{
const result=await propose(text,{board});
pending=result;
const notes=notesFor(result);
if(!result.ok){
pending=null;
paintActorBar(regions,{busy:false,preview:false,scope:`Scope: ${result.scopeText}`,
status:result.describe(),notes});
return;
}
paintActorBar(regions,{
busy:false,preview:true,
scope:`Scope: ${result.scopeText}`,
summary:result.describe(),
diff:result.diff,
notes,
});
}catch{
pending=null;
paintActorBar(regions,{busy:false,preview:false,error:'Could not reach the model right now. The grid is unaffected.'});
}
},
onApprove:async()=>{
if(!pending)return;
const described=pending.describe();
paintActorBar(regions,{busy:true,preview:false,status:'Applying…'});
let report;
try{report=await applyProposal(pending,{board});}
catch{report={ok:false,applied:0,vetoed:0};}
pending=null;
if(regions.input)regions.input.value='';
paintActorBar(regions,{
busy:false,preview:false,
status:report.ok
?`Applied: ${described}`
:`Nothing was written${report.vetoed?' — a before-handler vetoed it':''}.`,
});
},
onDiscard:()=>{
pending=null;
paintActorBar(regions,{busy:false,preview:false,status:'Discarded. Nothing was written.'});
},
});
actorRegions=regions;
return controller;
}
const controller={
get el(){return panelRegions?panelRegions.root:null;},
get ready(){return isFunction(ask);},
explain,
narrate:explain,
riskSummary,
insights,
attachExplain,
facts,
query,
applyQuery:runQuery,
askBar,
propose,
applyProposal,
actorBar,
on(name,fn){
if(!AI_EVENTS.includes(name)){
warnOnce(`ai:event:${name}`,
`"${name}" is not an AI event; expected one of ${AI_EVENTS.join(', ')}.`);
}
return emitter.on(name,fn);
},
off(name,fn){emitter.off(name,fn);},
destroy(){
destroyed=true;
if(panelRegions&&panelRegions.root){
panelRegions.root.textContent='';
panelRegions.root.classList.remove('lat-ai');
}
if(askRegions&&askRegions.root){
askRegions.root.textContent='';
askRegions.root.classList.remove('lat-ai','lat-ai-ask');
}
if(actorRegions&&actorRegions.root){
actorRegions.root.textContent='';
actorRegions.root.classList.remove('lat-ai','lat-ai-ask','lat-ai-act');
}
panelRegions=null;
askRegions=null;
actorRegions=null;
},
};
if(cfg.element&&enabled(cfg.enable,'insights'))insights(cfg.element);
return controller;
}
const __default=createAI;
});
var __entry=__req("packages/modules/ai/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridAI"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);