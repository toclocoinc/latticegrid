/*!
 * Lattice Grid 1.48.0, ai module
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
const STAMPED_VERSION="1.48.0";
async function resolveVersion(){
if(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;
try{
if(typeof process==='undefined'||!process.versions||!process.versions.node){
return STAMPED_VERSION;
}
const mod=await import('node:'+'module');
const req=mod.createRequire((typeof document!=='undefined'&&document.currentScript?document.currentScript.src:''));
const fs=req('node:'+'fs');
const url=new URL('../../../../package.json',(typeof document!=='undefined'&&document.currentScript?document.currentScript.src:''));
const text=fs.readFileSync(url,'utf8');
return JSON.parse(text).version||STAMPED_VERSION;
}catch{
return STAMPED_VERSION;
}
}
const VERSION="1.48.0";
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
default:return false;
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
const rows=rowObjects(grid).filter((row)=>matches(row,spec&&spec.where));
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
try{
__req("packages/worker/src/inline.js").setWorkerSource("(function(root){\n'use strict';\nvar __mods=Object.create(null);\nvar __cache=Object.create(null);\nfunction __def(id,fn){__mods[id]=fn;}\nfunction __req(id){\nvar hit=__cache[id];\nif(hit)return hit;\nvar exports=Object.create(null);\n__cache[id]=exports;\nvar fn=__mods[id];\nif(!fn)throw new Error('[lattice] missing module: '+id);\nfn(exports,__req);\nreturn exports;\n}\n__def(\"packages/core/src/internal/util.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"VERSION\",{enumerable:true,get:function(){return VERSION;}});\nObject.defineProperty(__exports,\"reportedWarnings\",{enumerable:true,get:function(){return reportedWarnings;}});\nObject.defineProperty(__exports,\"warnOnce\",{enumerable:true,get:function(){return warnOnce;}});\nObject.defineProperty(__exports,\"infoOnce\",{enumerable:true,get:function(){return infoOnce;}});\nObject.defineProperty(__exports,\"resetWarnings\",{enumerable:true,get:function(){return resetWarnings;}});\nObject.defineProperty(__exports,\"fail\",{enumerable:true,get:function(){return fail;}});\nObject.defineProperty(__exports,\"invariant\",{enumerable:true,get:function(){return invariant;}});\nObject.defineProperty(__exports,\"DEV\",{enumerable:true,get:function(){return DEV;}});\nObject.defineProperty(__exports,\"isObject\",{enumerable:true,get:function(){return isObject;}});\nObject.defineProperty(__exports,\"isFunction\",{enumerable:true,get:function(){return isFunction;}});\nObject.defineProperty(__exports,\"isNil\",{enumerable:true,get:function(){return isNil;}});\nObject.defineProperty(__exports,\"isBlank\",{enumerable:true,get:function(){return isBlank;}});\nObject.defineProperty(__exports,\"isCtor\",{enumerable:true,get:function(){return isCtor;}});\nObject.defineProperty(__exports,\"pathGetter\",{enumerable:true,get:function(){return pathGetter;}});\nObject.defineProperty(__exports,\"pathSetter\",{enumerable:true,get:function(){return pathSetter;}});\nObject.defineProperty(__exports,\"getPath\",{enumerable:true,get:function(){return getPath;}});\nObject.defineProperty(__exports,\"setPath\",{enumerable:true,get:function(){return setPath;}});\nObject.defineProperty(__exports,\"humanise\",{enumerable:true,get:function(){return humanise;}});\nObject.defineProperty(__exports,\"escapeHtml\",{enumerable:true,get:function(){return escapeHtml;}});\nObject.defineProperty(__exports,\"titleCase\",{enumerable:true,get:function(){return titleCase;}});\nObject.defineProperty(__exports,\"expand\",{enumerable:true,get:function(){return expand;}});\nObject.defineProperty(__exports,\"toArray\",{enumerable:true,get:function(){return toArray;}});\nObject.defineProperty(__exports,\"merge\",{enumerable:true,get:function(){return merge;}});\nObject.defineProperty(__exports,\"mergeRow\",{enumerable:true,get:function(){return mergeRow;}});\nObject.defineProperty(__exports,\"Lru\",{enumerable:true,get:function(){return Lru;}});\nObject.defineProperty(__exports,\"collator\",{enumerable:true,get:function(){return collator;}});\nObject.defineProperty(__exports,\"defaultCompare\",{enumerable:true,get:function(){return defaultCompare;}});\nObject.defineProperty(__exports,\"now\",{enumerable:true,get:function(){return now;}});\nObject.defineProperty(__exports,\"nextFrame\",{enumerable:true,get:function(){return nextFrame;}});\nObject.defineProperty(__exports,\"cancelFrame\",{enumerable:true,get:function(){return cancelFrame;}});\nObject.defineProperty(__exports,\"frameBatched\",{enumerable:true,get:function(){return frameBatched;}});\nObject.defineProperty(__exports,\"settleDebounce\",{enumerable:true,get:function(){return settleDebounce;}});\nObject.defineProperty(__exports,\"whenIdle\",{enumerable:true,get:function(){return whenIdle;}});\nObject.defineProperty(__exports,\"uid\",{enumerable:true,get:function(){return uid;}});\nconst STAMPED_VERSION=\"1.48.0\";\nasync function resolveVersion(){\nif(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;\ntry{\nif(typeof process==='undefined'||!process.versions||!process.versions.node){\nreturn STAMPED_VERSION;\n}\nconst mod=await import('node:'+'module');\nconst req=mod.createRequire((typeof document!=='undefined'&&document.currentScript?document.currentScript.src:''));\nconst fs=req('node:'+'fs');\nconst url=new URL('../../../../package.json',(typeof document!=='undefined'&&document.currentScript?document.currentScript.src:''));\nconst text=fs.readFileSync(url,'utf8');\nreturn JSON.parse(text).version||STAMPED_VERSION;\n}catch{\nreturn STAMPED_VERSION;\n}\n}\nconst VERSION=\"1.48.0\";\nconst warned=new Set();\nconst WARNED_LIMIT=2000;\nfunction rememberWarned(key){\nwarned.add(key);\nif(warned.size>WARNED_LIMIT){\nconst oldest=warned.values().next().value;\nif(oldest!==undefined)warned.delete(oldest);\n}\n}\nconst reported=[];\nconst REPORT_LIMIT=500;\nfunction record(key,level,message){\nreported.push({\nkey,\nlevel,\nmessage:message.map((m)=>(typeof m==='string'?m:safeString(m))).join(' '),\nat:Date.now(),\n});\nif(reported.length>REPORT_LIMIT)reported.shift();\n}\nfunction safeString(value){\nif(value instanceof Error)return value.message;\ntry{return JSON.stringify(value);}catch{return String(value);}\n}\nfunction reportedWarnings(){return reported.map((r)=>({...r}));}\nfunction warnOnce(key,...message){\nif(warned.has(key))return;\nrememberWarned(key);\nrecord(key,'warn',message);\nconsole.warn('[lattice]',...message);\n}\nfunction infoOnce(key,...message){\nif(warned.has(key))return;\nrememberWarned(key);\nrecord(key,'info',message);\nconsole.info('[lattice]',...message);\n}\nfunction resetWarnings(){\nwarned.clear();\nreported.length=0;\n}\nfunction fail(message,extra){\nconst err=new Error(`[lattice] ${message}`);\nif(extra!==undefined)err.cause=extra;\nthrow err;\n}\nfunction invariant(condition,message){\nif(!condition)fail(message);\n}\nconst DEV=(()=>{\ntry{\nreturn!(typeof process!=='undefined'&&process.env\n&&process.env.NODE_ENV==='production');\n}catch{\nreturn true;\n}\n})();\nfunction isObject(v){\nreturn v!==null&&typeof v==='object'&&!Array.isArray(v);\n}\nfunction isFunction(v){\nreturn typeof v==='function';\n}\nfunction isNil(v){\nreturn v===null||v===undefined;\n}\nfunction isBlank(v){\nreturn v===null||v===undefined||v==='';\n}\nfunction isCtor(v){\nif(typeof v!=='function')return false;\nif(/^class[\\s{]/.test(Function.prototype.toString.call(v)))return true;\nreturn!!(v.prototype&&Object.getOwnPropertyNames(v.prototype).length>1);\n}\nconst pathCache=new Map();\nfunction pathGetter(path){\nlet fn=pathCache.get(path);\nif(fn)return fn;\nif(!path.includes('.')){\nfn=(o)=>(o==null?undefined:o[path]);\n}else{\nconst parts=path.split('.');\nconst n=parts.length;\nfn=(o)=>{\nlet cur=o;\nfor(let i=0;i<n;i++){\nif(cur==null)return undefined;\ncur=cur[parts[i]];\n}\nreturn cur;\n};\n}\npathCache.set(path,fn);\nreturn fn;\n}\nconst setterCache=new Map();\nfunction pathSetter(path){\nlet fn=setterCache.get(path);\nif(fn)return fn;\nif(!path.includes('.')){\nfn=(o,v)=>{if(o!=null)o[path]=v;};\n}else{\nconst parts=path.split('.');\nconst last=parts.length-1;\nfn=(o,v)=>{\nlet cur=o;\nfor(let i=0;i<last;i++){\nif(cur==null)return;\nconst k=parts[i];\nif(cur[k]==null)cur[k]={};\ncur=cur[k];\n}\nif(cur!=null)cur[parts[last]]=v;\n};\n}\nsetterCache.set(path,fn);\nreturn fn;\n}\nfunction getPath(obj,path){\nreturn pathGetter(path)(obj);\n}\nfunction setPath(obj,path,value){\npathSetter(path)(obj,value);\n}\nfunction humanise(field){\nif(!field)return'';\nconst leaf=field.includes('.')?field.slice(field.lastIndexOf('.')+1):field;\nreturn leaf\n.replace(/[_-]+/g,' ')\n.replace(/([a-z0-9])([A-Z])/g,'$1 $2')\n.replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2')\n.replace(/\\s+/g,' ')\n.trim()\n.replace(/^./,(c)=>c.toUpperCase());\n}\nconst ESCAPES={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'};\nfunction escapeHtml(s){\nconst str=s==null?'':String(s);\nreturn/[&<>\"']/.test(str)?str.replace(/[&<>\"']/g,(c)=>ESCAPES[c]):str;\n}\nfunction titleCase(s){\nreturn String(s).replace(/\\w\\S*/g,(t)=>t[0].toUpperCase()+t.slice(1).toLowerCase());\n}\nfunction expand(value,key,whenTrue){\nif(value===undefined)return undefined;\nif(value===true)return{enabled:true,...whenTrue};\nif(value===false)return{enabled:false};\nif(isObject(value))return value;\nreturn{[key]:value,enabled:true};\n}\nfunction toArray(v){\nif(v===undefined||v===null)return[];\nreturn Array.isArray(v)?v:[v];\n}\nconst MERGE_FORBIDDEN_KEYS=Object.freeze(new Set(['__proto__','constructor','prototype']));\nfunction merge(a,b){\nif(!isObject(a))return isObject(b)?{...b}:b;\nif(!isObject(b))return b===undefined?a:b;\nconst out={...a};\nfor(const k of Object.keys(b)){\nif(MERGE_FORBIDDEN_KEYS.has(k))continue;\nconst bv=b[k];\nif(bv===undefined)continue;\nout[k]=isObject(bv)&&isObject(out[k])?merge(out[k],bv):bv;\n}\nreturn out;\n}\nfunction mergeRow(previous,patch){\nif(!isObject(previous)||!isObject(patch)||previous===patch)return patch;\nconst out=Object.create(Object.getPrototypeOf(previous));\nObject.assign(out,previous,patch);\nreturn out;\n}\nclass Lru{\n#max;\n#map=new Map();\n#onEvict;\nconstructor(max=256,onEvict=null){\nthis.#max=max;\nthis.#onEvict=onEvict;\n}\nget size(){\nreturn this.#map.size;\n}\nget max(){\nreturn this.#max;\n}\nset max(v){\nthis.#max=v;\nthis.#trim();\n}\nhas(k){\nreturn this.#map.has(k);\n}\nget(k){\nconst m=this.#map;\nif(!m.has(k))return undefined;\nconst v=m.get(k);\nm.delete(k);\nm.set(k,v);\nreturn v;\n}\npeek(k){\nreturn this.#map.get(k);\n}\nset(k,v){\nconst m=this.#map;\nif(m.has(k))m.delete(k);\nm.set(k,v);\nthis.#trim();\nreturn v;\n}\ndelete(k){\nconst v=this.#map.get(k);\nif(this.#map.delete(k)&&this.#onEvict)this.#onEvict(v,k);\nreturn v;\n}\nclear(){\nif(this.#onEvict)for(const[k,v]of this.#map)this.#onEvict(v,k);\nthis.#map.clear();\n}\nkeys(){\nreturn this.#map.keys();\n}\nvalues(){\nreturn this.#map.values();\n}\n#trim(){\nconst m=this.#map;\nwhile(m.size>this.#max){\nconst oldest=m.keys().next().value;\nconst v=m.get(oldest);\nm.delete(oldest);\nif(this.#onEvict)this.#onEvict(v,oldest);\n}\n}\n}\nconst collators=new Map();\nfunction collator(locale,opts){\nconst key=`${locale||''}|${opts?JSON.stringify(opts):''}`;\nlet c=collators.get(key);\nif(!c){\nc=new Intl.Collator(locale||undefined,{\nnumeric:true,sensitivity:'variant',...opts,\n});\ncollators.set(key,c);\n}\nreturn c;\n}\nfunction defaultCompare(a,b){\nif(a===b)return 0;\nif(a===null||a===undefined)return 1;\nif(b===null||b===undefined)return-1;\nif(typeof a==='number'&&typeof b==='number'){\nif(Number.isNaN(a))return Number.isNaN(b)?0:1;\nif(Number.isNaN(b))return-1;\nreturn a<b?-1:a>b?1:0;\n}\nconst sa=String(a);\nconst sb=String(b);\nreturn sa<sb?-1:sa>sb?1:0;\n}\nfunction now(){\nreturn typeof performance!=='undefined'&&performance.now\n?performance.now()\n:Date.now();\n}\nconst hasRaf=typeof requestAnimationFrame==='function';\nfunction nextFrame(fn){\nif(hasRaf)return requestAnimationFrame(fn);\nreturn setTimeout(()=>fn(now()),16);\n}\nfunction cancelFrame(handle){\nif(handle==null)return;\nif(hasRaf)cancelAnimationFrame(handle);\nelse clearTimeout(handle);\n}\nfunction frameBatched(fn){\nlet handle=null;\nlet lastArgs=null;\nconst run=()=>{\nhandle=null;\nconst a=lastArgs;\nlastArgs=null;\nfn(...(a||[]));\n};\nconst wrapped=(...args)=>{\nlastArgs=args;\nif(handle===null)handle=nextFrame(run);\n};\nwrapped.cancel=()=>{\ncancelFrame(handle);\nhandle=null;\nlastArgs=null;\n};\nwrapped.flush=()=>{\nif(handle!==null){\ncancelFrame(handle);\nrun();\n}\n};\nreturn wrapped;\n}\nfunction settleDebounce(fn,waitMs){\nlet timer=null;\nlet held=null;\nconst trailing=()=>{\ntimer=null;\nif(held===null)return;\nconst args=held;\nheld=null;\nfn(...args);\narm();\n};\nconst arm=()=>{\ntimer=setTimeout(trailing,waitMs);\nif(typeof timer?.unref==='function')timer.unref();\n};\nconst wrapped=(...args)=>{\nif(timer===null){\nfn(...args);\narm();\n}else{\nheld=args;\nclearTimeout(timer);\narm();\n}\n};\nwrapped.flush=()=>{\nif(timer!==null)clearTimeout(timer);\ntimer=null;\nif(held===null)return;\nconst args=held;\nheld=null;\nfn(...args);\n};\nwrapped.cancel=()=>{\nif(timer!==null)clearTimeout(timer);\ntimer=null;\nheld=null;\n};\nwrapped.pending=()=>timer!==null||held!==null;\nreturn wrapped;\n}\nfunction whenIdle(fn,timeout=50){\nif(typeof requestIdleCallback==='function'){\nreturn requestIdleCallback(fn,{timeout});\n}\nreturn setTimeout(()=>fn({timeRemaining:()=>0,didTimeout:true}),1);\n}\nlet idSeq=0;\nfunction uid(prefix='l'){\nreturn`${prefix}${(++idSeq).toString(36)}`;\n}\n});\n__def(\"packages/worker/src/transport.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"PROTOCOL\",{enumerable:true,get:function(){return PROTOCOL;}});\nObject.defineProperty(__exports,\"OPS\",{enumerable:true,get:function(){return OPS;}});\nObject.defineProperty(__exports,\"CONTROL\",{enumerable:true,get:function(){return CONTROL;}});\nObject.defineProperty(__exports,\"ERRORS\",{enumerable:true,get:function(){return ERRORS;}});\nObject.defineProperty(__exports,\"packHandle\",{enumerable:true,get:function(){return packHandle;}});\nObject.defineProperty(__exports,\"packHandles\",{enumerable:true,get:function(){return packHandles;}});\nObject.defineProperty(__exports,\"TransportedDictionary\",{enumerable:true,get:function(){return TransportedDictionary;}});\nObject.defineProperty(__exports,\"unpackHandle\",{enumerable:true,get:function(){return unpackHandle;}});\nObject.defineProperty(__exports,\"unpackHandles\",{enumerable:true,get:function(){return unpackHandles;}});\nObject.defineProperty(__exports,\"createMaskPool\",{enumerable:true,get:function(){return createMaskPool;}});\nObject.defineProperty(__exports,\"isTransferable\",{enumerable:true,get:function(){return isTransferable;}});\nObject.defineProperty(__exports,\"collectTransfers\",{enumerable:true,get:function(){return collectTransfers;}});\nObject.defineProperty(__exports,\"isPortable\",{enumerable:true,get:function(){return isPortable;}});\nObject.defineProperty(__exports,\"filterColumnIds\",{enumerable:true,get:function(){return filterColumnIds;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst collator=__m0[\"collator\"];\nconst isFunction=__m0[\"isFunction\"];\nconst PROTOCOL=1;\nconst OPS=Object.freeze({\nSORT_COLUMN:'sortColumn',\nSORT_MULTI:'sortMulti',\nEVALUATE_FILTERS:'evaluateFilters',\nCOMPACT:'compact',\nGROUP_BY_COLUMNS:'groupByColumns',\nTOTAL:'total',\nPIVOT:'pivot',\nFACET:'facet',\nCOLUMNIZE:'columnize',\nCOLLATE_STRING_RANKS:'collateStringRanks',\n});\nconst CONTROL=Object.freeze({\nREADY:'ready',\nCANCEL:'cancel',\nPING:'ping',\n});\nconst ERRORS=Object.freeze({\nNO_COMPUTE:'E_NO_COMPUTE',\nNO_KERNEL:'E_NO_KERNEL',\nABORTED:'E_ABORTED',\nKERNEL:'E_KERNEL',\nPROTOCOL:'E_PROTOCOL',\n});\nfunction packHandle(handle){\nif(handle==null)return null;\nconst presence=handle.presence;\nreturn{\nid:handle.id,\nkind:handle.kind,\nnullable:!!handle.nullable,\nvalues:handle.values??null,\npresence:presence?(presence.words??presence):null,\npresenceBits:presence?(presence.size??(presence.words??presence).length*8):0,\ndict:handle.dict?sliceDictionary(handle.dict):null,\noffsets:handle.offsets??null,\nversion:handle.version??0,\n};\n}\nfunction sliceDictionary(dict){\nif(Array.isArray(dict))return dict;\nif(isFunction(dict.values))return dict.values();\nreturn[];\n}\nfunction packHandles(handles){\nconst out=new Array(handles.length);\nfor(let i=0;i<handles.length;i++)out[i]=packHandle(handles[i]);\nreturn out;\n}\nclass TransportedBitset{\n#words;\n#bits;\nconstructor(words,bits){\nthis.#words=words;\nthis.#bits=bits;\n}\nget words(){return this.#words;}\nget size(){return this.#bits;}\nget(i){return(this.#words[i>>>3]&(1<<(i&7)))!==0;}\ncount(){\nconst w=this.#words;\nlet n=0;\nfor(let i=0;i<w.length;i++){\nlet v=w[i];\nwhile(v){v&=v-1;n++;}\n}\nreturn n;\n}\n}\nclass TransportedDictionary{\n#values;\n#index=null;\n#version=0;\n#ranks=new Map();\nconstructor(values){\nthis.#values=values||[];\n}\nget size(){return this.#values.length;}\nget version(){return this.#version;}\ncodeOf(value){\nif(this.#index===null){\nthis.#index=new Map();\nfor(let i=0;i<this.#values.length;i++)this.#index.set(this.#values[i],i);\n}\nconst found=this.#index.get(value);\nif(found!==undefined)return found;\nconst code=this.#values.length;\nthis.#values.push(value);\nthis.#index.set(value,code);\nthis.#version++;\nreturn code;\n}\nvalueOf(code){return this.#values[code];}\nvalues(){return this.#values;}\nranks(locale){\nconst key=locale||'';\nconst cached=this.#ranks.get(key);\nif(cached&&cached.version===this.#version)return cached.ranks;\nconst n=this.#values.length;\nconst order=new Uint32Array(n);\nfor(let i=0;i<n;i++)order[i]=i;\nconst cmp=collator(locale).compare;\nconst vals=this.#values;\nconst sorted=Array.from(order).sort((a,b)=>{\nconst av=vals[a];\nconst bv=vals[b];\nif(av===bv)return 0;\nif(av===null||av===undefined)return 1;\nif(bv===null||bv===undefined)return-1;\nreturn cmp(String(av),String(bv));\n});\nconst ranks=new Uint32Array(n);\nfor(let r=0;r<sorted.length;r++)ranks[sorted[r]]=r;\nthis.#ranks.set(key,{version:this.#version,ranks});\nreturn ranks;\n}\n}\nfunction unpackHandle(packed){\nif(packed==null)return null;\nconst presence=packed.presence\n?new TransportedBitset(packed.presence,packed.presenceBits||packed.presence.length*8)\n:null;\nconst dict=packed.dict?new TransportedDictionary(packed.dict):null;\nconst values=packed.values;\nconst offsets=packed.offsets??null;\nconst kind=packed.kind;\nconst get=(physical)=>{\nif(presence&&!presence.get(physical))return null;\nswitch(kind){\ncase'dictionary':\nreturn dict?dict.valueOf(values[physical]):values[physical];\ncase'bitset':\nreturn(values[physical>>>3]&(1<<(physical&7)))!==0;\ncase'multi':{\nif(!offsets)return null;\nconst from=offsets[physical];\nconst to=offsets[physical+1];\nconst out=new Array(to-from);\nfor(let i=from;i<to;i++)out[i-from]=dict?dict.valueOf(values[i]):values[i];\nreturn out;\n}\ndefault:\nreturn values[physical];\n}\n};\nreturn{\nid:packed.id,\nkind,\nnullable:packed.nullable,\nvalues,\npresence,\ndict,\noffsets,\nget,\nversion:packed.version,\n};\n}\nfunction unpackHandles(packed){\nconst out=new Array(packed.length);\nfor(let i=0;i<packed.length;i++)out[i]=unpackHandle(packed[i]);\nreturn out;\n}\nfunction createMaskPool(){\nconst masks=[];\nconst indices=[];\nreturn{\nmask(n){\nfor(let i=0;i<masks.length;i++){\nif(masks[i].length>=n){\nconst buf=masks.splice(i,1)[0].subarray(0,n);\nbuf.fill(0);\nreturn buf;\n}\n}\nreturn new Uint8Array(n);\n},\nindices(n){\nfor(let i=0;i<indices.length;i++){\nif(indices[i].length>=n)return indices.splice(i,1)[0].subarray(0,n);\n}\nreturn new Uint32Array(n);\n},\nrelease(buf){\nif(!buf)return;\nif(buf instanceof Uint8Array)masks.push(buf);\nelse if(buf instanceof Uint32Array)indices.push(buf);\n},\nclear(){masks.length=0;indices.length=0;},\n};\n}\nfunction isTransferable(v){\nif(!ArrayBuffer.isView(v))return false;\nconst buf=(v).buffer;\nif(!buf)return false;\nreturn typeof SharedArrayBuffer==='undefined'||!(buf instanceof SharedArrayBuffer);\n}\nfunction collectTransfers(value,out=[]){\nconst add=(v)=>{\nif(!isTransferable(v))return;\nconst buf=(v).buffer;\nif(!out.includes(buf))out.push(buf);\n};\nif(value==null)return out;\nif(ArrayBuffer.isView(value)){add(value);return out;}\nif(Array.isArray(value)){\nfor(const item of value)add(item);\nreturn out;\n}\nif(typeof value==='object'){\nfor(const key of Object.keys(value)){\nconst item=(value)[key];\nif(Array.isArray(item))for(const sub of item)add(sub);\nelse add(item);\n}\n}\nreturn out;\n}\nfunction isPortable(value,depth=0){\nif(value==null)return true;\nconst t=typeof value;\nif(t==='function'||t==='symbol')return false;\nif(t!=='object')return true;\nif(depth>4)return true;\nif(ArrayBuffer.isView(value)||value instanceof ArrayBuffer||value instanceof Date)return true;\nif(Array.isArray(value)){\nfor(const item of value)if(!isPortable(item,depth+1))return false;\nreturn true;\n}\nfor(const key of Object.keys(value)){\nif(!isPortable((value)[key],depth+1))return false;\n}\nreturn true;\n}\nfunction filterColumnIds(filters,out=new Set()){\nif(!filters||typeof filters!=='object')return out;\nconst node=(filters);\nif(typeof node.col==='string')out.add(node.col);\nconst conditions=node.conditions;\nif(Array.isArray(conditions))for(const child of conditions)filterColumnIds(child,out);\nreturn out;\n}\n});\n__def(\"packages/core/src/store/bitset.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Bitset\",{enumerable:true,get:function(){return Bitset;}});\nconst WORD_BITS=8;\nclass Bitset{\nstatic#POP=new Uint8Array(256);\nstatic{\nfor(let i=1;i<256;i++)Bitset.#POP[i]=Bitset.#POP[i>>1]+(i&1);\n}\n#words;\n#bits;\nconstructor(bits=0){\nconst n=Math.max(0,bits|0);\nthis.#bits=n;\nthis.#words=new Uint8Array(Math.ceil(n/WORD_BITS));\n}\nget size(){return this.#bits;}\nget words(){return this.#words;}\nget bytes(){return this.#words?this.#words.byteLength:0;}\nget(i){\nif(i<0||i>=this.#bits)return 0;\nreturn(this.#words[i>>3]>>(i&7))&1;\n}\nset(i){\nif(i>=0&&i<this.#bits)this.#words[i>>3]|=1<<(i&7);\nreturn this;\n}\nclear(i){\nif(i>=0&&i<this.#bits)this.#words[i>>3]&=~(1<<(i&7));\nreturn this;\n}\nassign(i,bit){return bit?this.set(i):this.clear(i);}\nfill(bit=false){\nthis.#words.fill(bit?0xff:0);\nif(bit)this.#maskTail();\nreturn this;\n}\ngrow(bits){\nconst n=Math.max(0,bits|0);\nif(n<=this.#bits)return this;\nconst need=Math.ceil(n/WORD_BITS);\nif(need>this.#words.length){\nconst next=new Uint8Array(need);\nnext.set(this.#words);\nthis.#words=next;\n}\nthis.#bits=n;\nreturn this;\n}\ncount(){\nconst w=this.#words;\nconst pop=Bitset.#POP;\nlet total=0;\nfor(let i=0;i<w.length;i++)total+=pop[w[i]];\nreturn total;\n}\nand(other){\nconst b=other instanceof Bitset?other.words:other;\nconst w=this.#words;\nconst shared=Math.min(w.length,b.length);\nfor(let i=0;i<shared;i++)w[i]&=b[i];\nfor(let i=shared;i<w.length;i++)w[i]=0;\nreturn this;\n}\nor(other){\nconst b=other instanceof Bitset?other.words:other;\nconst w=this.#words;\nconst shared=Math.min(w.length,b.length);\nfor(let i=0;i<shared;i++)w[i]|=b[i];\nreturn this;\n}\nnot(){\nconst w=this.#words;\nfor(let i=0;i<w.length;i++)w[i]=~w[i]&0xff;\nthis.#maskTail();\nreturn this;\n}\nclone(){\nconst out=new Bitset(this.#bits);\nout.words.set(this.#words.subarray(0,out.words.length));\nreturn out;\n}\nrelease(){\nthis.#words=new Uint8Array(0);\nthis.#bits=0;\n}\n#maskTail(){\nconst used=this.#bits&7;\nif(used===0)return;\nconst last=(this.#bits>>3);\nif(last<this.#words.length)this.#words[last]&=(1<<used)-1;\n}\nstatic from(bools){\nconst arr=Array.isArray(bools)?bools:Array.from(bools);\nconst out=new Bitset(arr.length);\nfor(let i=0;i<arr.length;i++)if(arr[i])out.set(i);\nreturn out;\n}\n}\n});\n__def(\"packages/core/src/store/dictionary.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Dictionary\",{enumerable:true,get:function(){return Dictionary;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst collator=__m0[\"collator\"];\nconst defaultCompare=__m0[\"defaultCompare\"];\nclass Dictionary{\n#values;\n#codes=new Map();\n#version=0;\n#ranks=null;\n#ranksVersion=-1;\n#ranksLocale='\\u0000';\nconstructor(values=[]){\nthis.#values=[];\nfor(let i=0;i<values.length;i++){\nconst v=values[i];\nif(this.#codes.has(v))continue;\nthis.#codes.set(v,this.#values.length);\nthis.#values.push(v);\n}\n}\nget size(){return this.#values.length;}\nget version(){return this.#version;}\nget bytes(){\nlet total=this.#values.length*8;\nfor(let i=0;i<this.#values.length;i++){\nconst v=this.#values[i];\nif(typeof v==='string')total+=v.length*2;\ntotal+=16;\n}\nreturn total;\n}\ncodeOf(value){\nconst existing=this.#codes.get(value);\nif(existing!==undefined)return existing;\nconst code=this.#values.length;\nthis.#values.push(value);\nthis.#codes.set(value,code);\nthis.#version++;\nreturn code;\n}\nlookup(value){\nconst code=this.#codes.get(value);\nreturn code===undefined?-1:code;\n}\nhas(value){return this.#codes.has(value);}\nvalueOf(code){return this.#values[code];}\nvalues(){return this.#values;}\nranks(locale){\nconst key=locale||'';\nif(this.#ranks&&this.#ranksVersion===this.#version&&this.#ranksLocale===key){\nreturn this.#ranks;\n}\nconst n=this.#values.length;\nconst order=new Array(n);\nfor(let i=0;i<n;i++)order[i]=i;\nconst cmp=collator(locale).compare;\nconst values=this.#values;\norder.sort((a,b)=>this.#compare(values[a],values[b],cmp));\nconst ranks=new Uint32Array(n);\nfor(let rank=0;rank<n;rank++)ranks[order[rank]]=rank;\nthis.#ranks=ranks;\nthis.#ranksVersion=this.#version;\nthis.#ranksLocale=key;\nreturn ranks;\n}\n#compare(a,b,compare){\nif(typeof a==='string'&&typeof b==='string')return compare(a,b);\nreturn defaultCompare(a,b);\n}\n}\n});\n__def(\"packages/core/src/store/multivalue.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"MultiValue\",{enumerable:true,get:function(){return MultiValue;}});\nclass MultiValue{\n#values;\n#offsets;\n#rows=0;\n#fill=0;\nconstructor(capacity={}){\nconst rows=Math.max(1,capacity.rows??16);\nconst values=Math.max(1,capacity.values??rows);\nthis.#values=new Int32Array(values);\nthis.#offsets=new Uint32Array(rows+1);\n}\nget values(){return this.#values;}\nget offsets(){return this.#offsets;}\nget rows(){return this.#rows;}\nget length(){return this.#fill;}\nget bytes(){return this.#values.byteLength+this.#offsets.byteLength;}\ncount(r){\nif(r<0||r>=this.#rows)return 0;\nreturn this.#offsets[r+1]-this.#offsets[r];\n}\nat(r){\nif(r<0||r>=this.#rows)return this.#values.subarray(0,0);\nreturn this.#values.subarray(this.#offsets[r],this.#offsets[r+1]);\n}\nhas(r,code){\nif(r<0||r>=this.#rows)return false;\nconst v=this.#values;\nconst end=this.#offsets[r+1];\nfor(let i=this.#offsets[r];i<end;i++)if(v[i]===code)return true;\nreturn false;\n}\nhasAny(r,codes){\nfor(let i=0;i<codes.length;i++)if(this.has(r,codes[i]))return true;\nreturn false;\n}\nhasAll(r,codes){\nfor(let i=0;i<codes.length;i++)if(!this.has(r,codes[i]))return false;\nreturn true;\n}\nhasNone(r,codes){return!this.hasAny(r,codes);}\npush(codes){\nconst r=this.#rows;\nconst n=codes.length;\nthis.#ensureRows(r+1);\nthis.#ensureValues(this.#fill+n);\nconst start=this.#fill;\nfor(let i=0;i<n;i++)this.#values[start+i]=codes[i]|0;\nthis.#fill+=n;\nthis.#rows=r+1;\nthis.#offsets[r]=start;\nthis.#offsets[r+1]=this.#fill;\nreturn r;\n}\nwrite(r,codes){\nif(r===this.#rows){this.push(codes);return;}\nif(r<0||r>this.#rows)return;\nconst start=this.#offsets[r];\nconst end=this.#offsets[r+1];\nconst n=codes.length;\nif(end-start===n){\nfor(let i=0;i<n;i++)this.#values[start+i]=codes[i]|0;\nreturn;\n}\nthis.#rebuild(r,codes);\n}\ncompact(remap,liveCount,dead){\nconst oldValues=this.#values;\nconst oldOffsets=this.#offsets;\nconst oldRows=this.#rows;\nconst values=new Int32Array(Math.max(1,this.#fill));\nconst offsets=new Uint32Array(liveCount+1);\nlet w=0;\nfor(let p=0;p<oldRows;p++){\nif(remap[p]===dead)continue;\nconst start=oldOffsets[p];\nconst end=oldOffsets[p+1];\noffsets[remap[p]]=w;\nfor(let i=start;i<end;i++)values[w++]=oldValues[i];\noffsets[remap[p]+1]=w;\n}\nthis.#values=values;\nthis.#offsets=offsets;\nthis.#rows=liveCount;\nthis.#fill=w;\n}\nrelease(){\nthis.#values=new Int32Array(0);\nthis.#offsets=new Uint32Array(1);\nthis.#rows=0;\nthis.#fill=0;\n}\n#ensureRows(rows){\nif(rows+1<=this.#offsets.length)return;\nlet cap=this.#offsets.length-1;\nwhile(cap<rows)cap=cap*2||16;\nconst next=new Uint32Array(cap+1);\nnext.set(this.#offsets);\nthis.#offsets=next;\n}\n#ensureValues(n){\nif(n<=this.#values.length)return;\nlet cap=this.#values.length;\nwhile(cap<n)cap=cap*2||16;\nconst next=new Int32Array(cap);\nnext.set(this.#values);\nthis.#values=next;\n}\n#rebuild(r,codes){\nconst oldValues=this.#values;\nconst oldOffsets=this.#offsets;\nconst rows=this.#rows;\nconst delta=codes.length-(oldOffsets[r+1]-oldOffsets[r]);\nconst values=new Int32Array(Math.max(1,this.#fill+delta));\nconst offsets=new Uint32Array(oldOffsets.length);\nlet w=0;\nfor(let p=0;p<rows;p++){\noffsets[p]=w;\nif(p===r){\nfor(let i=0;i<codes.length;i++)values[w++]=codes[i]|0;\n}else{\nfor(let i=oldOffsets[p];i<oldOffsets[p+1];i++)values[w++]=oldValues[i];\n}\noffsets[p+1]=w;\n}\nthis.#values=values;\nthis.#offsets=offsets;\nthis.#fill=w;\n}\n}\n});\n__def(\"packages/core/src/compute/handle.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"identity\",{enumerable:true,get:function(){return identity;}});\nObject.defineProperty(__exports,\"rowCount\",{enumerable:true,get:function(){return rowCount;}});\nObject.defineProperty(__exports,\"bitReader\",{enumerable:true,get:function(){return bitReader;}});\nObject.defineProperty(__exports,\"presenceReader\",{enumerable:true,get:function(){return presenceReader;}});\nObject.defineProperty(__exports,\"dictSize\",{enumerable:true,get:function(){return dictSize;}});\nObject.defineProperty(__exports,\"dictValue\",{enumerable:true,get:function(){return dictValue;}});\nObject.defineProperty(__exports,\"multiValue\",{enumerable:true,get:function(){return multiValue;}});\nObject.defineProperty(__exports,\"valueReader\",{enumerable:true,get:function(){return valueReader;}});\nObject.defineProperty(__exports,\"numericTotalOrder\",{enumerable:true,get:function(){return numericTotalOrder;}});\nObject.defineProperty(__exports,\"valueComparator\",{enumerable:true,get:function(){return valueComparator;}});\nObject.defineProperty(__exports,\"dictRanks\",{enumerable:true,get:function(){return dictRanks;}});\nObject.defineProperty(__exports,\"isMissing\",{enumerable:true,get:function(){return isMissing;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst collator=__m0[\"collator\"];\nconst defaultCompare=__m0[\"defaultCompare\"];\nconst warnOnce=__m0[\"warnOnce\"];\nfunction identity(n){\nconst out=new Uint32Array(n);\nfor(let i=0;i<n;i++)out[i]=i;\nreturn out;\n}\nfunction rowCount(handle,opts){\nif(opts&&typeof opts.count==='number')return opts.count;\nif(!handle)return 0;\nif(typeof handle.count==='number')return handle.count;\nif(typeof handle.length==='number')return handle.length;\nconst values=handle.values;\nif(handle.kind==='multi'&&handle.offsets)return Math.max(0,handle.offsets.length-1);\nif(!values)return handle.presence&&typeof handle.presence.size==='number'?handle.presence.size:0;\nif(handle.kind==='bitset'){\nif(typeof values.size==='number')return values.size;\nif(handle.presence&&typeof handle.presence.size==='number')return handle.presence.size;\nwarnOnce(`count:${handle.id}`,`column \"${handle.id}\" is bitset-backed with no declared row count; assuming ${values.length*8}`);\nreturn values.length*8;\n}\nreturn values.length;\n}\nconst bitOrders=new WeakMap();\nfunction bitOrderOf(bitset){\nconst ctor=bitset.constructor;\nif(!ctor)return'unknown';\nconst cached=bitOrders.get(ctor);\nif(cached)return cached;\nlet order='unknown';\ntry{\nlet probe=null;\nif(typeof ctor.from==='function')probe=ctor.from([false,true]);\nelse{\nprobe=new ctor(8);\nprobe.set(1);\n}\nconst words=probe&&probe.words;\nif(words&&words.length){\nif(words[0]===0x02)order='lsb';\nelse if(words[0]===0x40)order='msb';\n}\n}catch{\norder='unknown';\n}\nbitOrders.set(ctor,order);\nreturn order;\n}\nfunction bitReader(bits){\nif(!bits)return()=>0;\nconst raw=bits instanceof Uint8Array?bits:bits.words;\nif(raw instanceof Uint8Array){\nconst order=bits instanceof Uint8Array?'lsb':bitOrderOf(bits);\nif(order==='lsb')return(i)=>(raw[i>>>3]>>>(i&7))&1;\nif(order==='msb')return(i)=>(raw[i>>>3]>>>(7-(i&7)))&1;\n}\nif(typeof bits.get==='function')return(i)=>(bits.get(i)?1:0);\nreturn()=>0;\n}\nfunction presenceReader(handle){\nif(!handle||!handle.presence)return null;\nreturn bitReader(handle.presence);\n}\nfunction dictSize(dict){\nif(!dict)return 0;\nif(typeof dict.size==='number')return dict.size;\nif(typeof dict.values==='function')return dict.values().length;\nreturn 0;\n}\nfunction dictValue(dict,code){\nif(!dict)return null;\nif(typeof dict.valueOf==='function')return dict.valueOf(code);\nif(typeof dict.values==='function')return dict.values()[code];\nreturn null;\n}\nfunction multiValue(handle,i){\nconst offsets=handle.offsets;\nconst values=handle.values;\nif(!offsets||!values)return[];\nconst from=offsets[i];\nconst to=offsets[i+1];\nif(!(to>from))return[];\nconst dict=handle.dict;\nconst out=new Array(to-from);\nfor(let k=from;k<to;k++)out[k-from]=dict?dictValue(dict,values[k]):values[k];\nreturn out;\n}\nfunction valueReader(handle){\nif(!handle)return()=>undefined;\nconst values=handle.values;\nconst present=presenceReader(handle);\nconst kind=handle.kind;\nif(kind==='dictionary'){\nconst dict=handle.dict;\nif(present)return(i)=>(present(i)?dictValue(dict,values[i]):null);\nreturn(i)=>dictValue(dict,values[i]);\n}\nif(kind==='bitset'){\nconst bit=bitReader(values);\nif(present)return(i)=>(present(i)?bit(i)===1:null);\nreturn(i)=>bit(i)===1;\n}\nif(kind==='multi'){\nif(present)return(i)=>(present(i)?multiValue(handle,i):null);\nreturn(i)=>multiValue(handle,i);\n}\nif(!values&&typeof handle.get==='function'){\nconst get=handle.get.bind(handle);\nreturn(i)=>{\nconst v=get(i);\nreturn v===undefined?null:v;\n};\n}\nif(present){\nreturn(i)=>{\nif(!present(i))return null;\nconst v=values[i];\nreturn v===undefined?null:v;\n};\n}\nreturn(i)=>{\nconst v=values[i];\nreturn v===undefined?null:v;\n};\n}\nfunction numericTotalOrder(a,b){\nif(a<b)return-1;\nif(a>b)return 1;\nif(a===b){\nconst na=Object.is(a,-0);\nconst nb=Object.is(b,-0);\nif(na===nb)return 0;\nreturn na?-1:1;\n}\nconst an=Number.isNaN(a);\nconst bn=Number.isNaN(b);\nif(an&&bn)return 0;\nreturn an?1:-1;\n}\nfunction valueComparator(locale){\nconst coll=collator(locale);\nreturn(a,b)=>{\nif(a===b)return 0;\nconst ta=typeof a;\nconst tb=typeof b;\nif(ta==='string'&&tb==='string')return coll.compare(a,b);\nif(ta==='number'&&tb==='number')return numericTotalOrder(a,b);\nif(ta==='boolean'&&tb==='boolean')return a===b?0:a?1:-1;\nif(a instanceof Date||b instanceof Date){\nconst na=a instanceof Date?a.getTime():Number(a);\nconst nb=b instanceof Date?b.getTime():Number(b);\nreturn numericTotalOrder(na,nb);\n}\nreturn defaultCompare(a,b);\n};\n}\nfunction dictRanks(dict,locale){\nif(dict&&typeof dict.ranks==='function')return dict.ranks(locale);\nconst table=dict&&typeof dict.values==='function'?dict.values():[];\nconst n=table.length;\nconst cmp=valueComparator(locale);\nconst order=new Array(n);\nfor(let i=0;i<n;i++)order[i]=i;\norder.sort((a,b)=>cmp(table[a],table[b])||a-b);\nconst ranks=new Uint32Array(n);\nfor(let r=0;r<n;r++)ranks[order[r]]=r;\nreturn ranks;\n}\nfunction isMissing(v){\nreturn v===null||v===undefined||(typeof v==='number'&&Number.isNaN(v));\n}\n});\n__def(\"packages/core/src/compute/sort.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"radixSortFloat64\",{enumerable:true,get:function(){return radixSortFloat64;}});\nObject.defineProperty(__exports,\"radixSortInt32\",{enumerable:true,get:function(){return radixSortInt32;}});\nObject.defineProperty(__exports,\"rankSortDictionary\",{enumerable:true,get:function(){return rankSortDictionary;}});\nObject.defineProperty(__exports,\"mergeSortComparator\",{enumerable:true,get:function(){return mergeSortComparator;}});\nObject.defineProperty(__exports,\"rankSortStrings\",{enumerable:true,get:function(){return rankSortStrings;}});\nObject.defineProperty(__exports,\"collateStringRanks\",{enumerable:true,get:function(){return collateStringRanks;}});\nObject.defineProperty(__exports,\"sortColumn\",{enumerable:true,get:function(){return sortColumn;}});\nObject.defineProperty(__exports,\"sortMulti\",{enumerable:true,get:function(){return sortMulti;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst bitReader=__m0[\"bitReader\"];\nconst dictRanks=__m0[\"dictRanks\"];\nconst dictSize=__m0[\"dictSize\"];\nconst identity=__m0[\"identity\"];\nconst isMissing=__m0[\"isMissing\"];\nconst presenceReader=__m0[\"presenceReader\"];\nconst rowCount=__m0[\"rowCount\"];\nconst valueComparator=__m0[\"valueComparator\"];\nconst valueReader=__m0[\"valueReader\"];\nconst EMPTY_INDICES=new Uint32Array(0);\nconst SCRATCH=new ArrayBuffer(8);\nconst SCRATCH_F64=new Float64Array(SCRATCH);\nconst SCRATCH_U32=new Uint32Array(SCRATCH);\nconst HI=(()=>{\nSCRATCH_F64[0]=-1;\nreturn(SCRATCH_U32[1]&0x80000000)!==0?1:0;\n})();\nconst LO=HI===1?0:1;\nfunction transformDouble(value,out){\nSCRATCH_F64[0]=value;\nlet hi=SCRATCH_U32[HI];\nlet lo=SCRATCH_U32[LO];\nif((hi&0x80000000)!==0){\nhi=~hi>>>0;\nlo=~lo>>>0;\n}else{\nhi=(hi^0x80000000)>>>0;\n}\nout[0]=lo;\nout[1]=hi;\n}\nfunction radixLsd64(idx,lo,hi,n){\nif(n<2)return idx;\nconst hist=new Uint32Array(256*8);\nfor(let i=0;i<n;i++){\nconst l=lo[i];\nconst h=hi[i];\nhist[l&0xff]++;\nhist[256+((l>>>8)&0xff)]++;\nhist[512+((l>>>16)&0xff)]++;\nhist[768+((l>>>24)&0xff)]++;\nhist[1024+(h&0xff)]++;\nhist[1280+((h>>>8)&0xff)]++;\nhist[1536+((h>>>16)&0xff)]++;\nhist[1792+((h>>>24)&0xff)]++;\n}\nlet srcIdx=idx;\nlet srcLo=lo;\nlet srcHi=hi;\nlet dstIdx=new Uint32Array(n);\nlet dstLo=new Uint32Array(n);\nlet dstHi=new Uint32Array(n);\nconst offset=new Uint32Array(256);\nfor(let pass=0;pass<8;pass++){\nconst base=pass<<8;\nconst shift=(pass&3)<<3;\nconst useHi=pass>=4;\nlet skip=false;\nfor(let b=0;b<256;b++){\nif(hist[base+b]===n){skip=true;break;}\n}\nif(skip)continue;\nlet sum=0;\nfor(let b=0;b<256;b++){\noffset[b]=sum;\nsum+=hist[base+b];\n}\nfor(let i=0;i<n;i++){\nconst l=srcLo[i];\nconst h=srcHi[i];\nconst digit=((useHi?h:l)>>>shift)&0xff;\nconst p=offset[digit]++;\ndstIdx[p]=srcIdx[i];\ndstLo[p]=l;\ndstHi[p]=h;\n}\nlet t=srcIdx;srcIdx=dstIdx;dstIdx=t;\nt=srcLo;srcLo=dstLo;dstLo=t;\nt=srcHi;srcHi=dstHi;dstHi=t;\n}\nreturn srcIdx;\n}\nfunction radixLsd32(idx,keys,n){\nif(n<2)return idx;\nconst hist=new Uint32Array(256*4);\nfor(let i=0;i<n;i++){\nconst k=keys[i];\nhist[k&0xff]++;\nhist[256+((k>>>8)&0xff)]++;\nhist[512+((k>>>16)&0xff)]++;\nhist[768+((k>>>24)&0xff)]++;\n}\nlet srcIdx=idx;\nlet srcKeys=keys;\nlet dstIdx=new Uint32Array(n);\nlet dstKeys=new Uint32Array(n);\nconst offset=new Uint32Array(256);\nfor(let pass=0;pass<4;pass++){\nconst base=pass<<8;\nconst shift=pass<<3;\nlet skip=false;\nfor(let b=0;b<256;b++){\nif(hist[base+b]===n){skip=true;break;}\n}\nif(skip)continue;\nlet sum=0;\nfor(let b=0;b<256;b++){\noffset[b]=sum;\nsum+=hist[base+b];\n}\nfor(let i=0;i<n;i++){\nconst k=srcKeys[i];\nconst p=offset[(k>>>shift)&0xff]++;\ndstIdx[p]=srcIdx[i];\ndstKeys[p]=k;\n}\nlet t=srcIdx;srcIdx=dstIdx;dstIdx=t;\nt=srcKeys;srcKeys=dstKeys;dstKeys=t;\n}\nreturn srcIdx;\n}\nfunction countingSort(idx,keys,n,radix){\nconst counts=new Uint32Array(radix+1);\nfor(let i=0;i<n;i++)counts[keys[i]]++;\nlet sum=0;\nfor(let k=0;k<=radix;k++){\nconst c=counts[k];\ncounts[k]=sum;\nsum+=c;\n}\nconst out=new Uint32Array(n);\nfor(let i=0;i<n;i++)out[counts[keys[i]]++]=idx[i];\nreturn out;\n}\nfunction sortUint32Keys(idx,keys,n,radix){\nif(n<2)return idx;\nif(radix<=65536||radix<=n*2)return countingSort(idx,keys,n,radix);\nreturn radixLsd32(idx,keys,n);\n}\nfunction exact(buffer,n){\nif(buffer.length===n&&buffer.byteOffset===0)return buffer;\nreturn Uint32Array.prototype.slice.call(buffer,0,n);\n}\nfunction radixSortFloat64(values,order,descending=false){\nconst src=order||identity(values.length);\nconst n=src.length;\nif(n<2)return Uint32Array.from(src);\nconst idx=new Uint32Array(n);\nconst lo=new Uint32Array(n);\nconst hi=new Uint32Array(n);\nconst nans=new Uint32Array(n);\nconst pair=new Uint32Array(2);\nlet m=0;\nlet nanCount=0;\nfor(let i=0;i<n;i++){\nconst row=src[i];\nconst v=values[row];\nif(Number.isNaN(v)){nans[nanCount++]=row;continue;}\ntransformDouble(v,pair);\nif(descending){\nlo[m]=~pair[0]>>>0;\nhi[m]=~pair[1]>>>0;\n}else{\nlo[m]=pair[0];\nhi[m]=pair[1];\n}\nidx[m++]=row;\n}\nconst sorted=radixLsd64(idx.subarray(0,m),lo.subarray(0,m),hi.subarray(0,m),m);\nif(nanCount===0)return exact(sorted,m);\nconst out=new Uint32Array(n);\nout.set(sorted.subarray(0,m),0);\nout.set(nans.subarray(0,nanCount),m);\nreturn out;\n}\nfunction radixSortInt32(values,order,descending=false){\nconst src=order||identity(values.length);\nconst n=src.length;\nif(n<2)return Uint32Array.from(src);\nconst idx=Uint32Array.from(src);\nconst keys=new Uint32Array(n);\nfor(let i=0;i<n;i++){\nconst k=(values[idx[i]]^0x80000000)>>>0;\nkeys[i]=descending?(~k>>>0):k;\n}\nreturn exact(radixLsd32(idx,keys,n),n);\n}\nfunction rankSortDictionary(handle,order,opts={}){\nconst src=order||identity(rowCount(handle,opts));\nconst n=src.length;\nif(n<2)return Uint32Array.from(src);\nconst ranks=dictRanks(handle.dict,opts.locale);\nconst codes=handle.values;\nconst present=presenceReader(handle);\nconst size=Math.max(dictSize(handle.dict),ranks.length);\nconst absentRank=size;\nconst idx=Uint32Array.from(src);\nconst keys=new Uint32Array(n);\nconst descending=!!opts.descending;\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nlet rank=present&&present(row)===0?absentRank:ranks[codes[row]];\nif(rank===undefined)rank=absentRank;\nkeys[i]=descending?absentRank-rank:rank;\n}\nreturn exact(sortUint32Keys(idx,keys,n,size+1),n);\n}\nfunction mergeSortComparator(values,order,compare){\nconst n=order.length;\nlet src=Uint32Array.from(order);\nif(n<2)return src;\nlet dst=new Uint32Array(n);\nfor(let width=1;width<n;width<<=1){\nfor(let start=0;start<n;start+=width<<1){\nconst mid=Math.min(start+width,n);\nconst end=Math.min(start+(width<<1),n);\nlet i=start;\nlet j=mid;\nlet k=start;\nwhile(i<mid&&j<end){\ndst[k++]=compare(values[src[i]],values[src[j]])<=0?src[i++]:src[j++];\n}\nwhile(i<mid)dst[k++]=src[i++];\nwhile(j<end)dst[k++]=src[j++];\n}\nconst t=src;src=dst;dst=t;\n}\nreturn src;\n}\nfunction sortBitsetColumn(handle,idx,descending){\nconst bit=bitReader(handle.values);\nconst n=idx.length;\nconst out=new Uint32Array(n);\nconst first=descending?1:0;\nlet k=0;\nfor(let i=0;i<n;i++)if(bit(idx[i])===first)out[k++]=idx[i];\nfor(let i=0;i<n;i++)if(bit(idx[i])!==first)out[k++]=idx[i];\nreturn out;\n}\nfunction indexableValues(handle,idx){\nconst values=handle.values;\nconst kind=handle.kind;\nconst direct=(kind==='object'||kind===undefined)&&(Array.isArray(values)||ArrayBuffer.isView(values));\nif(direct&&!handle.presence)return values;\nconst reader=valueReader(handle);\nconst materialised=new Array(rowCount(handle)||0);\nfor(let i=0;i<idx.length;i++){\nconst row=idx[i];\nmaterialised[row]=reader(row);\n}\nreturn materialised;\n}\nfunction allStrings(values,idx){\nfor(let i=0;i<idx.length;i++){\nif(typeof values[idx[i]]!=='string')return false;\n}\nreturn true;\n}\nfunction rankSortStrings(idx,codes,ranks,d,descending){\nconst n=idx.length;\nconst idxOut=Uint32Array.from(idx);\nif(n<2||d<1)return idxOut;\nconst keys=new Uint32Array(n);\nconst top=d-1;\nfor(let i=0;i<n;i++){\nconst rank=ranks[codes[i]];\nkeys[i]=descending?top-rank:rank;\n}\nreturn exact(sortUint32Keys(idxOut,keys,n,d),n);\n}\nfunction collateStringRanks(table,d,locale){\nconst compare=valueComparator(locale);\nconst order=new Array(d);\nfor(let i=0;i<d;i++)order[i]=i;\norder.sort((a,b)=>compare(table[a],table[b])||a-b);\nconst ranks=new Uint32Array(d);\nfor(let r=0;r<d;r++)ranks[order[r]]=r;\nreturn ranks;\n}\nfunction keyedSortStrings(values,idx,opts){\nconst n=idx.length;\nconst codeOf=new Map();\nconst table=[];\nconst codes=new Uint32Array(n);\nfor(let i=0;i<n;i++){\nconst v=values[idx[i]];\nlet c=codeOf.get(v);\nif(c===undefined){c=table.length;codeOf.set(v,c);table.push(v);}\ncodes[i]=c;\n}\nconst d=table.length;\nconst ranks=collateStringRanks(table,d,opts.locale);\nreturn rankSortStrings(idx,codes,ranks,d,!!opts.descending);\n}\nfunction sortByComparator(handle,idx,opts){\nconst values=indexableValues(handle,idx);\nif(idx.length>=2&&allStrings(values,idx)){\nconst index=handle.stringRank;\nif(index&&index.version===handle.version&&index.usable(idx,values,opts.locale)){\nreturn index.sort(idx,opts);\n}\nreturn keyedSortStrings(values,idx,opts);\n}\nconst base=valueComparator(opts.locale);\nconst compare=opts.descending?(a,b)=>base(b,a):base;\nreturn mergeSortComparator(values,idx,compare);\n}\nfunction sortByCompare(handle,idx,opts){\nconst values=indexableValues(handle,idx);\nconst user=opts.compare;\nconst descending=!!opts.descending;\nconst compare=descending\n?(a,b)=>-user(a,b,undefined,undefined,true)\n:(a,b)=>user(a,b,undefined,undefined,false);\nreturn mergeSortComparator(values,idx,compare);\n}\nfunction partitionPresent(handle,idx){\nconst n=idx.length;\nconst present=presenceReader(handle);\nconst values=handle.values;\nconst checkNaN=handle.kind==='float64'&&!!values;\nconst looseKind=handle.kind==='object'||handle.kind==='multi'||handle.kind===undefined;\nif(!present&&!checkNaN&&!looseKind)return{present:idx,absent:EMPTY_INDICES};\nconst keep=new Uint32Array(n);\nconst drop=new Uint32Array(n);\nlet p=0;\nlet a=0;\nif(present&&checkNaN){\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(present(row)===1&&!Number.isNaN(values[row]))keep[p++]=row;else drop[a++]=row;\n}\n}else if(checkNaN&&!present){\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(!Number.isNaN(values[row]))keep[p++]=row;else drop[a++]=row;\n}\n}else if(present&&!looseKind){\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(present(row)===1)keep[p++]=row;else drop[a++]=row;\n}\n}else{\nconst reader=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst row=idx[i];\nif(!isMissing(reader(row)))keep[p++]=row;else drop[a++]=row;\n}\n}\nif(a===0)return{present:idx,absent:EMPTY_INDICES};\nreturn{present:keep.subarray(0,p),absent:drop.subarray(0,a)};\n}\nfunction joinRuns(sorted,absent,nullsFirst){\nif(absent.length===0)return sorted;\nconst out=new Uint32Array(sorted.length+absent.length);\nif(nullsFirst){\nout.set(absent,0);\nout.set(sorted,absent.length);\n}else{\nout.set(sorted,0);\nout.set(absent,sorted.length);\n}\nreturn out;\n}\nfunction sortColumn(handle,order,opts={}){\nconst src=order||identity(rowCount(handle,opts));\nif(!handle||src.length<2)return Uint32Array.from(src);\nconst{present,absent}=partitionPresent(handle,src);\nif(present.length===0)return Uint32Array.from(src);\nconst descending=!!opts.descending;\nlet sorted;\nif(typeof opts.compare==='function'){\nsorted=sortByCompare(handle,present,opts);\n}else{\nswitch(handle.kind){\ncase'float64':\nsorted=radixSortFloat64(handle.values,present,descending);\nbreak;\ncase'int32':\nsorted=radixSortInt32(handle.values,present,descending);\nbreak;\ncase'dictionary':\nsorted=rankSortDictionary(handle,present,opts);\nbreak;\ncase'bitset':\nsorted=sortBitsetColumn(handle,present,descending);\nbreak;\ndefault:\nsorted=sortByComparator(handle,present,opts);\nbreak;\n}\n}\nreturn joinRuns(sorted,absent,!!opts.nullsFirst);\n}\nfunction sortMulti(handles,entries,order,opts={}){\nconst list=entries||[];\nconst first=(list.length&&(list[0].handle||byId(handles,list[0].col)))||(handles&&handles[0]);\nlet current=order||identity(rowCount(first,opts));\nfor(let i=list.length-1;i>=0;i--){\nconst entry=list[i];\nconst handle=entry.handle||byId(handles,entry.col)||(handles&&handles[i]);\nif(!handle)continue;\ncurrent=sortColumn(handle,current,{\ndescending:entry.descending!==undefined?!!entry.descending:entry.dir==='desc',\nnullsFirst:!!entry.nullsFirst,\nlocale:entry.locale!==undefined?entry.locale:opts.locale,\ncompare:entry.compare,\n});\n}\nreturn current instanceof Uint32Array?current:Uint32Array.from(current);\n}\nfunction byId(handles,id){\nif(!handles||id===undefined)return undefined;\nfor(let i=0;i<handles.length;i++)if(handles[i]&&handles[i].id===id)return handles[i];\nreturn undefined;\n}\n});\n__def(\"packages/core/src/store/stringrank.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"DEFAULT_MAX_DISTINCT\",{enumerable:true,get:function(){return DEFAULT_MAX_DISTINCT;}});\nObject.defineProperty(__exports,\"StringRankIndex\",{enumerable:true,get:function(){return StringRankIndex;}});\nconst __m0=__req(\"packages/core/src/compute/sort.js\");\nconst collateStringRanks=__m0[\"collateStringRanks\"];\nconst rankSortStrings=__m0[\"rankSortStrings\"];\nconst DEFAULT_MAX_DISTINCT=100000;\nclass StringRankIndex{\n#table=[];\n#codeOf=new Map();\n#codeByRow;\n#length=0;\n#generation=0;\n#stamp=-1;\n#maxDistinct;\n#capped=false;\n#ranks=null;\n#ranksGeneration=-1;\n#ranksLocale='\\u0000';\nconstructor(maxDistinct=DEFAULT_MAX_DISTINCT){\nthis.#maxDistinct=maxDistinct>0?maxDistinct:DEFAULT_MAX_DISTINCT;\nthis.#codeByRow=new Uint32Array(0);\n}\nget version(){return this.#stamp;}\nset version(version){this.#stamp=version;}\nget generation(){return this.#generation;}\nget size(){return this.#table.length;}\nget capped(){return this.#capped;}\nget length(){return this.#length;}\nget bytes(){\nlet total=this.#codeByRow.byteLength;\nconst table=this.#table;\nfor(let i=0;i<table.length;i++)total+=table[i].length*2+24;\nreturn total;\n}\n#intern(value,capOnGrowth){\nconst existing=this.#codeOf.get(value);\nif(existing!==undefined)return existing;\nif(this.#capped)return-1;\nif(capOnGrowth&&this.#table.length>=this.#maxDistinct){\nthis.#capped=true;\nreturn-1;\n}\nconst code=this.#table.length;\nthis.#table.push(value);\nthis.#codeOf.set(value,code);\nthis.#generation++;\nreturn code;\n}\nbuild(values,count){\nconst n=count|0;\nthis.#table=[];\nthis.#codeOf=new Map();\nthis.#generation=0;\nthis.#capped=false;\nthis.#ranks=null;\nthis.#ranksGeneration=-1;\nthis.#codeByRow=new Uint32Array(n);\nfor(let row=0;row<n;row++){\nconst v=values[row];\nconst code=typeof v==='string'?this.#intern(v,false):-1;\nthis.#codeByRow[row]=code<0?0:code;\n}\nthis.#length=n;\n}\nappend(values,from,count){\nconst to=(from|0)+(count|0);\nif(to>this.#codeByRow.length){\nconst next=new Uint32Array(to);\nnext.set(this.#codeByRow.subarray(0,this.#length));\nthis.#codeByRow=next;\n}\nfor(let row=from|0;row<to;row++){\nconst v=values[row];\nconst code=typeof v==='string'?this.#intern(v,true):-1;\nthis.#codeByRow[row]=code<0?0:code;\n}\nthis.#length=Math.max(this.#length,to);\n}\nranks(locale){\nconst key=locale||'';\nif(this.#ranks&&this.#ranksGeneration===this.#generation&&this.#ranksLocale===key){\nreturn this.#ranks;\n}\nconst ranks=collateStringRanks(this.#table,this.#table.length,locale);\nthis.#ranks=ranks;\nthis.#ranksGeneration=this.#generation;\nthis.#ranksLocale=key;\nreturn ranks;\n}\nusable(idx,values,locale){\nif(this.#capped||this.#table.length===0)return false;\nconst codeByRow=this.#codeByRow;\nconst table=this.#table;\nconst covered=this.#length;\nfor(let i=0;i<idx.length;i++){\nconst row=idx[i];\nif(row>=covered)return false;\nif(table[codeByRow[row]]!==values[row])return false;\n}\nreturn true;\n}\nsort(idx,opts){\nconst ranks=this.ranks(opts.locale);\nconst d=this.#table.length;\nconst n=idx.length;\nconst codes=new Uint32Array(n);\nconst codeByRow=this.#codeByRow;\nfor(let i=0;i<n;i++)codes[i]=codeByRow[idx[i]];\nreturn rankSortStrings(idx,codes,ranks,d,!!opts.descending);\n}\n}\n});\n__def(\"packages/core/src/store/columnstore.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"REMOVED\",{enumerable:true,get:function(){return REMOVED;}});\nObject.defineProperty(__exports,\"toFloat\",{enumerable:true,get:function(){return toFloat;}});\nObject.defineProperty(__exports,\"ColumnHandle\",{enumerable:true,get:function(){return ColumnHandle;}});\nObject.defineProperty(__exports,\"ColumnStore\",{enumerable:true,get:function(){return ColumnStore;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst warnOnce=__m0[\"warnOnce\"];\nconst isFunction=__m0[\"isFunction\"];\nconst pathGetter=__m0[\"pathGetter\"];\nconst __m1=__req(\"packages/core/src/store/bitset.js\");\nconst Bitset=__m1[\"Bitset\"];\nconst __m2=__req(\"packages/core/src/store/dictionary.js\");\nconst Dictionary=__m2[\"Dictionary\"];\nconst __m3=__req(\"packages/core/src/store/multivalue.js\");\nconst MultiValue=__m3[\"MultiValue\"];\nconst __m4=__req(\"packages/core/src/store/stringrank.js\");\nconst StringRankIndex=__m4[\"StringRankIndex\"];\nconst REMOVED=0xFFFFFFFF;\nconst DEFAULT_CAPACITY=1024;\nconst DEFAULT_COLUMNAR_BELOW=5000;\nconst DEFAULT_COMPACT_RATIO=0.2;\nconst KINDS=new Set(['float64','int32','bitset','dictionary','object','multi']);\nfunction absent(v){return v===null||v===undefined;}\nfunction toFloat(v){\nif(typeof v==='number')return v;\nif(v instanceof Date)return v.getTime();\nif(typeof v==='boolean')return v?1:0;\nconst n=Number(v);\nreturn Number.isNaN(n)&&typeof v==='string'?Date.parse(v):n;\n}\nfunction toInt(v){\nconst n=toFloat(v);\nreturn Number.isFinite(n)?n|0:0;\n}\nfunction toMembers(v){\nif(absent(v))return[];\nreturn Array.isArray(v)?v:[v];\n}\nfunction decodeFrom(old,p){\nswitch(old.kind){\ncase'float64':\ncase'int32':return old.buf[p];\ncase'bitset':return old.bits.get(p)===1;\ncase'dictionary':return old.dict.valueOf(old.buf[p]);\ncase'multi':{\nconst codes=old.mv.at(p);\nconst out=new Array(codes.length);\nfor(let i=0;i<codes.length;i++)out[i]=old.dict.valueOf(codes[i]);\nreturn out;\n}\ndefault:return old.buf[p];\n}\n}\nfunction decodePacked(frag,i){\nswitch(frag.kind){\ncase'float64':\ncase'int32':return frag.values[i];\ncase'bitset':return(frag.values[i>>3]&(1<<(i&7)))!==0;\ncase'dictionary':return(frag.table||[])[frag.values[i]];\ncase'multi':{\nconst start=frag.offsets[i];\nconst end=frag.offsets[i+1];\nconst table=frag.table||[];\nconst out=new Array(end-start);\nfor(let k=start;k<end;k++)out[k-start]=table[frag.values[k]];\nreturn out;\n}\ndefault:return frag.values[i];\n}\n}\nclass ColumnHandle{\n#id;\n#kind;\n#target;\n#nullable;\n#read;\n#host;\n#seed;\n#columnar=false;\n#buf=null;\n#bits=null;\n#mv=null;\n#dict=null;\n#stringRank=null;\n#stringRankOn;\n#stringRankMax;\n#stringRankVersion=-1;\n#presence=null;\n#capacity=0;\n#version=0;\n#overlay=null;\n#cache=null;\n#released=false;\nconstructor(schema,host){\nthis.#id=schema.id;\nconst kind=KINDS.has(schema.kind)?schema.kind:'object';\nif(schema.kind&&!KINDS.has(schema.kind)){\nwarnOnce(`store.kind.${schema.id}`,\n`column \"${schema.id}\" declares unknown storage kind \"${schema.kind}\"; falling back to object`);\n}\nthis.#target=kind;\nthis.#kind=kind;\nthis.#nullable=schema.nullable!==false;\nthis.#seed=schema.dictionary??null;\nthis.#host=host;\nthis.#read=isFunction(schema.read)\n?schema.read\n:pathGetter(schema.field||schema.id);\nthis.#stringRankOn=schema.stringRankIndex!=='off';\nthis.#stringRankMax=typeof schema.stringRankMaxDistinct==='number'\n?schema.stringRankMaxDistinct\n:0;\nthis.#overlay=new Map();\n}\nget id(){return this.#id;}\nget kind(){return this.#columnar?this.#kind:'object';}\nget target(){return this.#target;}\nget nullable(){return this.#nullable;}\nget values(){\nif(this.#released)return null;\nif(!this.#columnar)return this.#lazy().values;\nif(this.#kind==='bitset')return this.#bits.words;\nif(this.#kind==='multi')return this.#mv.values;\nreturn this.#buf;\n}\nget presence(){\nif(this.#released||!this.#nullable)return null;\nreturn this.#columnar?this.#presence:this.#lazy().presence;\n}\nget dict(){\nif(this.#released||!this.#columnar)return null;\nreturn this.#kind==='dictionary'||this.#kind==='multi'?this.#dict:null;\n}\nget stringRank(){\nif(this.#released||!this.#stringRankOn)return null;\nif(this.kind!=='object')return null;\nconst values=this.values;\nconst n=this.#host.physical();\nif(!values||n===0)return null;\nif(this.#stringRank===null){\nif(typeof values[0]!=='string')return null;\nconst index=new StringRankIndex(this.#resolveStringRankMax());\nindex.build(values,n);\nindex.version=this.#version;\nthis.#stringRank=index;\nthis.#stringRankVersion=this.#version;\nreturn index.capped?null:index;\n}\nif(this.#stringRank.length<n){\nthis.#stringRank.append(values,this.#stringRank.length,n-this.#stringRank.length);\n}\nthis.#stringRank.version=this.#version;\nthis.#stringRankVersion=this.#version;\nreturn this.#stringRank.capped?null:this.#stringRank;\n}\n#resolveStringRankMax(){return this.#stringRankMax;}\n#dropStringRank(){\nthis.#stringRank=null;\nthis.#stringRankVersion=-1;\n}\nget offsets(){\nif(this.#released||!this.#columnar||this.#kind!=='multi')return null;\nreturn this.#mv.offsets;\n}\nget version(){return this.#version;}\nget bytes(){\nlet total=0;\nif(this.#buf)total+=this.#buf.byteLength??this.#buf.length*8;\nif(this.#bits)total+=this.#bits.bytes;\nif(this.#mv)total+=this.#mv.bytes;\nif(this.#presence)total+=this.#presence.bytes;\nif(this.#dict)total+=this.#dict.bytes;\nif(this.#overlay)total+=this.#overlay.size*24;\nreturn total;\n}\nget(physical){\nif(this.#released)return undefined;\nif(physical<0||physical>=this.#host.physical())return undefined;\nif(!this.#columnar)return this.#rowValue(physical);\nif(this.#nullable&&this.#presence.get(physical)===0)return null;\nswitch(this.#kind){\ncase'float64':\ncase'int32':return this.#buf[physical];\ncase'bitset':return this.#bits.get(physical)===1;\ncase'dictionary':return this.#dict.valueOf(this.#buf[physical]);\ncase'multi':{\nconst codes=this.#mv.at(physical);\nconst out=new Array(codes.length);\nfor(let i=0;i<codes.length;i++)out[i]=this.#dict.valueOf(codes[i]);\nreturn out;\n}\ndefault:return this.#buf[physical];\n}\n}\nset(physical,value){\nif(this.#released)return;\nif(this.#columnar)this.#writeValue(physical,value);\nelse this.#overlay.set(physical,value===undefined?null:value);\nif(this.#stringRank)this.#dropStringRank();\nthis.#version++;\n}\nread(row){return this.#read(row);}\nappendColumn(objects,from,n){\nif(this.#released||n<=0)return;\nif(!this.#columnar){this.#version++;return;}\nconst read=this.#read;\nconst nullable=this.#nullable;\nconst presence=this.#presence;\nlet sawAbsent=false;\nswitch(this.#kind){\ncase'float64':{\nconst buf=this.#buf;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nif(typeof v==='number'){\nif(nullable)presence.set(from+i);\nbuf[from+i]=v;\ncontinue;\n}\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?NaN:toFloat(v);\n}\nbreak;\n}\ncase'int32':{\nconst buf=this.#buf;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?0:toInt(v);\n}\nbreak;\n}\ncase'bitset':{\nconst bits=this.#bits;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbits.assign(from+i,!gone&&!!v);\n}\nbreak;\n}\ncase'dictionary':{\nconst buf=this.#buf;\nconst dict=this.#dict;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?0:dict.codeOf(v);\n}\nbreak;\n}\ncase'multi':{\nconst mv=this.#mv;\nconst dict=this.#dict;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nconst members=toMembers(v);\nconst codes=new Array(members.length);\nfor(let k=0;k<members.length;k++)codes[k]=dict.codeOf(members[k]);\nmv.write(from+i,codes);\n}\nbreak;\n}\ndefault:{\nconst buf=this.#buf;\nfor(let i=0;i<n;i++){\nconst v=read(objects[i]);\nconst gone=v===null||v===undefined;\nif(nullable)presence.assign(from+i,!gone);\nelse if(gone)sawAbsent=true;\nbuf[from+i]=gone?null:v;\n}\nbreak;\n}\n}\nif(sawAbsent){\nwarnOnce(`store.null.${this.#id}`,\n`column \"${this.#id}\" is declared non-nullable but received null; storing a filler value`);\n}\nif(this.#stringRank&&this.#kind==='object'){\nthis.#stringRank.append(this.#buf,from,n);\nthis.#stringRank.version=this.#version+1;\nthis.#stringRankVersion=this.#version+1;\n}\nthis.#version++;\n}\nappendPacked(frag,from,n){\nif(this.#released||n<=0||!frag)return;\nif(!this.#columnar){this.#version++;return;}\nconst presence=this.#presence;\nconst fragPresence=frag.presence;\nif(presence){\nif(fragPresence){\nfor(let i=0;i<n;i++)presence.assign(from+i,(fragPresence[i>>3]&(1<<(i&7)))!==0);\n}else{\nfor(let i=0;i<n;i++)presence.set(from+i);\n}\n}\nconst kindsAgree=frag.kind===this.#kind;\nif(kindsAgree&&(this.#kind==='float64'||this.#kind==='int32')){\nthis.#buf.set(frag.values,from);\nthis.#version++;\nreturn;\n}\nif(kindsAgree&&this.#kind==='bitset'){\nconst words=frag.values;\nfor(let i=0;i<n;i++)this.#bits.assign(from+i,(words[i>>3]&(1<<(i&7)))!==0);\nthis.#version++;\nreturn;\n}\nif(kindsAgree&&this.#kind==='dictionary'){\nconst table=frag.table||[];\nconst remap=new Uint32Array(table.length);\nfor(let t=0;t<table.length;t++)remap[t]=this.#dict.codeOf(table[t]);\nconst codes=frag.values;\nconst buf=this.#buf;\nconst pres=presence;\nfor(let i=0;i<n;i++){\nif(pres&&(fragPresence?(fragPresence[i>>3]&(1<<(i&7)))===0:false)){buf[from+i]=0;continue;}\nbuf[from+i]=remap[codes[i]]??0;\n}\nthis.#version++;\nreturn;\n}\nif(kindsAgree&&this.#kind==='multi'){\nconst table=frag.table||[];\nconst remap=new Uint32Array(table.length);\nfor(let t=0;t<table.length;t++)remap[t]=this.#dict.codeOf(table[t]);\nconst flat=frag.values;\nconst offsets=frag.offsets;\nfor(let i=0;i<n;i++){\nconst start=offsets[i];\nconst end=offsets[i+1];\nconst codes=new Array(end-start);\nfor(let k=start;k<end;k++)codes[k-start]=remap[flat[k]]??0;\nthis.#mv.write(from+i,codes);\n}\nthis.#version++;\nreturn;\n}\nfor(let i=0;i<n;i++){\nconst gone=fragPresence\n?(fragPresence[i>>3]&(1<<(i&7)))===0\n:(frag.kind==='object'?frag.values[i]===null:false);\nthis.#writeValue(from+i,gone?null:decodePacked(frag,i));\n}\nthis.#version++;\n}\ntouch(){this.#version++;}\ncolumnarise(capacity,fill){\nif(this.#columnar||this.#released)return;\nconst values=new Array(fill);\nfor(let p=0;p<fill;p++)values[p]=this.#rowValue(p);\nthis.#kind=this.#target;\nthis.#columnar=true;\nthis.#alloc(capacity);\nfor(let p=0;p<fill;p++)this.#writeValue(p,values[p]);\nthis.#overlay.clear();\nthis.#cache=null;\nthis.#dropStringRank();\nthis.#version++;\n}\ngrow(capacity){\nif(!this.#columnar||this.#released||capacity<=this.#capacity)return;\nswitch(this.#kind){\ncase'float64':case'int32':case'dictionary':{\nconst next=new this.#buf.constructor(capacity);\nnext.set(this.#buf);\nthis.#buf=next;\nbreak;\n}\ncase'bitset':this.#bits.grow(capacity);break;\ncase'multi':break;\ndefault:this.#buf.length=capacity;break;\n}\nif(this.#presence)this.#presence.grow(capacity);\nthis.#capacity=capacity;\nthis.#version++;\n}\nconvert(kind){\nif(this.#released||!KINDS.has(kind))return false;\nthis.#target=kind;\nif(!this.#columnar||kind===this.#kind)return false;\nconst old={kind:this.#kind,buf:this.#buf,bits:this.#bits,mv:this.#mv,dict:this.#dict};\nconst n=this.#host.physical();\nconst presence=this.#presence;\nthis.#kind=kind;\nthis.#alloc(this.#capacity);\nfor(let p=0;p<n;p++){\nconst gone=presence!==null&&presence.get(p)===0;\nif(gone&&kind!=='multi')continue;\nthis.#writeValue(p,gone?null:decodeFrom(old,p));\n}\nthis.#dropStringRank();\nthis.#version++;\nreturn true;\n}\ncompact(remap,oldFill,liveCount){\nif(this.#released)return;\nthis.#dropStringRank();\nif(!this.#columnar){\nconst overlay=this.#overlay;\nif(overlay.size){\nconst next=new Map();\nfor(const[p,v]of overlay)if(remap[p]!==REMOVED)next.set(remap[p],v);\nthis.#overlay=next;\n}\nthis.#cache=null;\nthis.#version++;\nreturn;\n}\nswitch(this.#kind){\ncase'float64':case'int32':case'dictionary':case'object':{\nconst buf=this.#buf;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)buf[remap[p]]=buf[p];\nif(this.#kind==='object')for(let p=liveCount;p<oldFill;p++)buf[p]=undefined;\nbreak;\n}\ncase'bitset':{\nconst bits=this.#bits;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)bits.assign(remap[p],bits.get(p)===1);\nfor(let p=liveCount;p<oldFill;p++)bits.clear(p);\nbreak;\n}\ncase'multi':this.#mv.compact(remap,liveCount,REMOVED);break;\ndefault:break;\n}\nif(this.#presence){\nconst pres=this.#presence;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)pres.assign(remap[p],pres.get(p)===1);\nfor(let p=liveCount;p<oldFill;p++)pres.clear(p);\n}\nthis.#version++;\n}\nrelease(){\nif(this.#released)return;\nthis.#released=true;\nthis.#buf=null;\nif(this.#bits)this.#bits.release();\nthis.#bits=null;\nif(this.#mv)this.#mv.release();\nthis.#mv=null;\nif(this.#presence)this.#presence.release();\nthis.#presence=null;\nthis.#dict=null;\nthis.#stringRank=null;\nthis.#overlay=new Map();\nthis.#cache=null;\nthis.#capacity=0;\nthis.#version++;\n}\n#alloc(capacity){\nconst cap=Math.max(1,capacity);\nthis.#buf=null;\nthis.#bits=null;\nthis.#mv=null;\nswitch(this.#kind){\ncase'float64':this.#buf=new Float64Array(cap);break;\ncase'int32':this.#buf=new Int32Array(cap);break;\ncase'bitset':this.#bits=new Bitset(cap);break;\ncase'dictionary':\nthis.#buf=new Uint32Array(cap);\nthis.#dict=this.#dict??new Dictionary(this.#seed??[]);\nbreak;\ncase'multi':\nthis.#mv=new MultiValue({rows:cap,values:cap});\nthis.#dict=this.#dict??new Dictionary(this.#seed??[]);\nbreak;\ndefault:this.#buf=new Array(cap);break;\n}\nif(this.#kind!=='dictionary'&&this.#kind!=='multi')this.#dict=null;\nif(this.#nullable){\nif(this.#presence)this.#presence.grow(cap);\nelse this.#presence=new Bitset(cap);\n}\nthis.#capacity=cap;\n}\n#writeValue(p,value){\nconst gone=absent(value);\nif(this.#nullable)this.#presence.assign(p,!gone);\nelse if(gone){\nwarnOnce(`store.null.${this.#id}`,\n`column \"${this.#id}\" is declared non-nullable but received null; storing a filler value`);\n}\nswitch(this.#kind){\ncase'float64':this.#buf[p]=gone?NaN:toFloat(value);break;\ncase'int32':this.#buf[p]=gone?0:toInt(value);break;\ncase'bitset':this.#bits.assign(p,!gone&&!!value);break;\ncase'dictionary':this.#buf[p]=gone?0:this.#dict.codeOf(value);break;\ncase'multi':{\nconst members=toMembers(value);\nconst codes=new Array(members.length);\nfor(let i=0;i<members.length;i++)codes[i]=this.#dict.codeOf(members[i]);\nthis.#mv.write(p,codes);\nbreak;\n}\ndefault:this.#buf[p]=gone?null:value;break;\n}\n}\n#rowValue(p){\nif(this.#overlay.has(p))return this.#overlay.get(p);\nconst v=this.#read(this.#host.rowAt(p));\nreturn v===undefined?null:v;\n}\n#lazy(){\nif(this.#cache&&this.#cache.version===this.#version)return this.#cache;\nconst n=this.#host.physical();\nconst values=new Array(n);\nconst presence=this.#nullable?new Bitset(n):null;\nfor(let p=0;p<n;p++){\nconst v=this.#rowValue(p);\nvalues[p]=v;\nif(presence&&!absent(v))presence.set(p);\n}\nthis.#cache={version:this.#version,values,presence};\nreturn this.#cache;\n}\n}\nclass ColumnStore{\n#schema;\n#handles=new Map();\n#list=[];\n#rows=[];\n#fill=0;\n#capacity=0;\n#live=0;\n#dead=0;\n#tombs=new Bitset(0);\n#columnar=false;\n#retainSource=true;\n#columnarBelow;\n#initial;\n#ratio;\n#destroyed=false;\nconstructor(schema,opts={}){\nthis.#schema=Array.isArray(schema)?schema:[];\nthis.#initial=Math.max(1,opts.initialCapacity??DEFAULT_CAPACITY);\nthis.#retainSource=opts.retainSource!==false;\nthis.#columnarBelow=this.#retainSource?(opts.columnarBelow??DEFAULT_COLUMNAR_BELOW):0;\nthis.#ratio=opts.compactRatio??DEFAULT_COMPACT_RATIO;\nconst host={\nrowAt:(p)=>this.#rows[p],\nphysical:()=>this.#fill,\n};\nfor(const entry of this.#schema){\nif(!entry||!entry.id)continue;\nif(this.#handles.has(entry.id)){\nwarnOnce(`store.dup.${entry.id}`,`duplicate column id \"${entry.id}\" in the store schema; ignoring the second`);\ncontinue;\n}\nconst handle=new ColumnHandle(entry,host);\nthis.#handles.set(entry.id,handle);\nthis.#list.push(handle);\n}\nif(this.#columnarBelow<=0)this.#columnarise();\n}\nget count(){return this.#live;}\nget physical(){return this.#fill;}\nget capacity(){return this.#columnar?this.#capacity:this.#rows.length;}\nget tombstones(){return this.#dead;}\nget columnar(){return this.#columnar;}\nget destroyed(){return this.#destroyed;}\nget bytes(){\nlet total=this.#tombs.bytes+this.#rows.length*8;\nfor(const h of this.#list)total+=h.bytes;\nreturn total;\n}\nappend(objects){\nconst from=this.#fill;\nif(this.#destroyed||!objects)return{from,to:from};\nconst n=objects.length|0;\nif(n===0)return{from,to:from};\nif(this.#retainSource)for(let i=0;i<n;i++)this.#rows[from+i]=objects[i];\nthis.#fill=from+n;\nthis.#live+=n;\nthis.#tombs.grow(this.#fill);\nif(!this.#columnar){\nif(this.#fill>=this.#columnarBelow)this.#columnarise();\nelse for(const h of this.#list)h.touch();\nreturn{from,to:this.#fill};\n}\nthis.#ensure(this.#fill);\nconst cols=this.#list;\nfor(let c=0;c<cols.length;c++)cols[c].appendColumn(objects,from,n);\nreturn{from,to:this.#fill};\n}\nappendPacked(chunk,objects){\nconst from=this.#fill;\nif(this.#destroyed||!chunk)return{from,to:from};\nconst n=chunk.count|0;\nif(n===0)return{from,to:from};\nif(this.#retainSource&&objects){\nfor(let i=0;i<n;i++)this.#rows[from+i]=objects[i];\n}\nthis.#fill=from+n;\nthis.#live+=n;\nthis.#tombs.grow(this.#fill);\nif(!this.#columnar)this.#columnarise();\nthis.#ensure(this.#fill);\nconst byId=new Map();\nfor(const col of chunk.columns)byId.set(col.id,col);\nfor(const h of this.#list){\nconst frag=byId.get(h.id);\nif(frag)h.appendPacked(frag,from,n);\nelse{\nh.grow(this.#capacity);\n}\n}\nreturn{from,to:this.#fill};\n}\nsource(physical){\nif(this.#retainSource)return this.#rows[physical];\nif(physical<0||physical>=this.#fill)return undefined;\nreturn this.#reconstruct(physical);\n}\nsetSource(physical,object){\nif(this.#destroyed)return;\nif(physical<0||physical>=this.#fill)return;\nif(!this.#retainSource)return;\nthis.#rows[physical]=object;\n}\nget(colId,physical){\nconst h=this.#handles.get(colId);\nreturn h?h.get(physical):undefined;\n}\nset(colId,physical,value){\nif(this.#destroyed)return;\nif(physical<0||physical>=this.#fill)return;\nconst h=this.#handles.get(colId);\nif(!h){\nwarnOnce(`store.set.${colId}`,`set() on unknown column \"${colId}\"`);\nreturn;\n}\nh.set(physical,value);\n}\nremove(physical){\nif(this.#destroyed||physical<0||physical>=this.#fill)return false;\nif(this.#tombs.get(physical)===1)return false;\nthis.#tombs.set(physical);\nthis.#dead++;\nthis.#live--;\nreturn true;\n}\nlive(physical){\nif(physical<0||physical>=this.#fill)return false;\nreturn this.#tombs.get(physical)===0;\n}\ncompact(opts={}){\nif(this.#destroyed||this.#dead===0)return null;\nif(!opts.force&&this.#dead/this.#fill<this.#ratio)return null;\nconst oldFill=this.#fill;\nconst remap=new Uint32Array(oldFill);\nlet w=0;\nfor(let p=0;p<oldFill;p++)remap[p]=this.#tombs.get(p)===1?REMOVED:w++;\nfor(const h of this.#list)h.compact(remap,oldFill,w);\nif(this.#retainSource){\nconst rows=this.#rows;\nfor(let p=0;p<oldFill;p++)if(remap[p]!==REMOVED)rows[remap[p]]=rows[p];\nrows.length=w;\n}\nthis.#fill=w;\nthis.#live=w;\nthis.#dead=0;\nthis.#tombs=new Bitset(Math.max(this.#capacity,w));\nreturn remap;\n}\ncolumn(colId){return this.#handles.get(colId);}\ncolumns(){return this.#list.slice();}\nliveIndices(){\nconst out=new Uint32Array(this.#live);\nif(this.#dead===0){\nfor(let p=0;p<this.#fill;p++)out[p]=p;\nreturn out;\n}\nlet k=0;\nfor(let p=0;p<this.#fill;p++)if(this.#tombs.get(p)===0)out[k++]=p;\nreturn out;\n}\nconvert(colId,kind){\nconst h=this.#handles.get(colId);\nreturn h?h.convert(kind):false;\n}\ndestroy(){\nif(this.#destroyed)return;\nthis.#destroyed=true;\nfor(const h of this.#list)h.release();\nthis.#handles.clear();\nthis.#list.length=0;\nthis.#rows.length=0;\nthis.#tombs.release();\nthis.#fill=0;\nthis.#live=0;\nthis.#dead=0;\nthis.#capacity=0;\n}\n#ensure(n){\nif(n<=this.#capacity)return;\nlet cap=this.#capacity||this.#initial;\nwhile(cap<n)cap*=2;\nfor(const h of this.#list)h.grow(cap);\nthis.#tombs.grow(cap);\nthis.#capacity=cap;\n}\n#reconstruct(physical){\nconst out={};\nfor(const h of this.#list)out[h.id]=h.get(physical);\nreturn out;\n}\n#columnarise(){\nif(this.#columnar)return;\nlet cap=this.#initial;\nwhile(cap<this.#fill)cap*=2;\nthis.#columnar=true;\nthis.#capacity=cap;\nthis.#tombs.grow(cap);\nfor(const h of this.#list)h.columnarise(cap,this.#fill);\n}\n}\n});\n__def(\"packages/core/src/store/ingest.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"INGEST_DEFAULTS\",{enumerable:true,get:function(){return INGEST_DEFAULTS;}});\nObject.defineProperty(__exports,\"inferKind\",{enumerable:true,get:function(){return inferKind;}});\nObject.defineProperty(__exports,\"decideText\",{enumerable:true,get:function(){return decideText;}});\nObject.defineProperty(__exports,\"createReaders\",{enumerable:true,get:function(){return createReaders;}});\nObject.defineProperty(__exports,\"Ingest\",{enumerable:true,get:function(){return Ingest;}});\nObject.defineProperty(__exports,\"ingest\",{enumerable:true,get:function(){return ingest;}});\nObject.defineProperty(__exports,\"ingestSync\",{enumerable:true,get:function(){return ingestSync;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst now=__m0[\"now\"];\nconst nextFrame=__m0[\"nextFrame\"];\nconst infoOnce=__m0[\"infoOnce\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst isFunction=__m0[\"isFunction\"];\nconst pathGetter=__m0[\"pathGetter\"];\nconst __m1=__req(\"packages/core/src/store/columnstore.js\");\nconst ColumnStore=__m1[\"ColumnStore\"];\nconst INGEST_DEFAULTS=Object.freeze({\nchunkMs:8,\nchunkRows:512,\nsampleSize:100,\ndictionaryRatio:0.1,\ncolumnarBelow:5000,\ninitialCapacity:1024,\n});\nfunction inferKind(samples,hints={}){\nif(hints.multi)return'multi';\nif(samples.length===0)return'object';\nlet numbers=0;let booleans=0;let strings=0;let dates=0;let arrays=0;\nfor(let i=0;i<samples.length;i++){\nconst v=samples[i];\nif(typeof v==='number')numbers++;\nelse if(typeof v==='boolean')booleans++;\nelse if(typeof v==='string')strings++;\nelse if(v instanceof Date)dates++;\nelse if(Array.isArray(v))arrays++;\n}\nconst n=samples.length;\nif(numbers===n)return'float64';\nif(booleans===n)return'bitset';\nif(dates===n)return'float64';\nif(strings===n)return'text';\nif(arrays===n)return'multi';\nreturn'object';\n}\nfunction decideText(distinct,rows,ratio){\nif(rows<=0)return'dictionary';\nreturn distinct<ratio*rows?'dictionary':'object';\n}\nfunction createReaders(columns,computed,context){\nconst readers=new Map();\nconst base=new Map();\nfor(const col of columns){\nif(col.computed)continue;\nconst read=isFunction(col.read)?col.read:pathGetter(col.field||col.id);\nbase.set(col.id,read);\nreaders.set(col.id,read);\n}\nconst order=computed?.order??[];\nconst fns=computed?.fns??{};\nconst deps=computed?.deps??{};\nconst wrapDeps=computed?.wrapDeps??null;\nconst active=order.filter((id)=>isFunction(fns[id]));\nconst wildcard=active.some((id)=>deps[id]==='*');\nlet memo=new WeakMap();\nconst resolve=(data)=>{\nconst values={};\nif(wildcard)for(const[id,read]of base)values[id]=read(data);\nfor(const id of active){\nconst declared=deps[id];\nlet bag;\nif(declared==='*'){\nbag=values;\n}else{\nbag={};\nconst list=declared||[];\nfor(let i=0;i<list.length;i++){\nconst d=list[i];\nbag[d]=d in values?values[d]:base.get(d)?.(data);\n}\n}\nvalues[id]=fns[id](wrapDeps?wrapDeps(bag,id):bag,{\ndata,row:null,column:null,grid:null,context,\n});\n}\nreturn values;\n};\nconst valuesFor=(data)=>{\nif(data===null||(typeof data!=='object'&&typeof data!=='function'))return resolve(data);\nlet v=memo.get(data);\nif(v===undefined){v=resolve(data);memo.set(data,v);}\nreturn v;\n};\nfor(const id of active){\nreaders.set(id,\n(data)=>valuesFor(data)[id]);\n}\nreturn{\nreaders,\nreset(){memo=new WeakMap();},\n};\n}\nclass ColumnPlan{\nspec;\nread;\nkind;\ninferred;\nnullable;\ncandidate=false;\ndistinct=null;\nchange=null;\nreason='';\nconstructor(spec,read){\nthis.spec=spec;\nthis.read=read;\nthis.kind='object';\nthis.inferred=false;\nthis.nullable=spec.nullable!==false;\n}\n}\nclass Ingest{\n#rows;\n#plans=[];\n#store=null;\n#readers;\n#cursor=0;\n#opts;\n#done=false;\n#cancelled=false;\n#elapsed=0;\n#columnar;\nconstructor(rows,plan={},opts={}){\nthis.#rows=Array.isArray(rows)?rows:Array.from(rows||[]);\nthis.#opts={...INGEST_DEFAULTS,...opts};\nconst columns=plan.columns??[];\nthis.#readers=createReaders(columns,plan.computed??null,plan.context);\nthis.#columnar=this.#rows.length>=this.#opts.columnarBelow;\nthis.#planColumns(columns,plan.computed??null);\nthis.#store=new ColumnStore(this.#plans.map((p)=>({\nid:p.spec.id,\nkind:p.kind,\nnullable:p.nullable,\nread:p.read,\ndictionary:p.spec.dictionary,\n})),{\ninitialCapacity:this.#opts.initialCapacity,\ncolumnarBelow:this.#opts.columnarBelow,\n});\n}\nget store(){return this.#store;}\nget done(){return this.#done||this.#cancelled;}\nget progress(){return this.#cursor;}\nslice(){\nif(this.done)return false;\nif(this.#opts.signal?.aborted){this.#cancelled=true;return false;}\nconst started=now();\nconst{chunkMs,chunkRows}=this.#opts;\nconst total=this.#rows.length;\ndo{\nconst end=Math.min(this.#cursor+chunkRows,total);\nthis.#store.append(this.#rows.slice(this.#cursor,end));\nthis.#measure(this.#cursor,end);\nthis.#cursor=end;\nthis.#readers.reset();\nthis.#reviewCardinality(false);\n}while(this.#cursor<total&&now()-started<chunkMs);\nthis.#elapsed+=now()-started;\nthis.#opts.onProgress?.({loaded:this.#cursor,total});\nif(this.#cursor>=total){\nthis.#reviewCardinality(true);\nthis.#done=true;\nreturn false;\n}\nreturn true;\n}\ncancel(){this.#cancelled=true;}\nresult(){\nreturn{\nstore:this.#store,\nschema:this.#plans.map((p)=>({\nid:p.spec.id,kind:p.kind,nullable:p.nullable,read:p.read,\ndictionary:p.spec.dictionary,\n})),\ndecisions:this.#plans.map((p)=>({\nid:p.spec.id,\nkind:p.kind,\nnullable:p.nullable,\ninferred:p.inferred,\ndistinct:p.candidate||p.change?this.#distinctOf(p):null,\nchange:p.change,\nreason:p.reason,\n})),\ncount:this.#store.count,\nelapsed:this.#elapsed,\ncancelled:this.#cancelled,\n};\n}\n#planColumns(columns,computed){\nconst rows=this.#rows;\nconst sampleN=Math.min(this.#opts.sampleSize,rows.length);\nconst ratio=this.#opts.dictionaryRatio;\nconst pure=computed?.pure instanceof Set\n?computed.pure\n:new Set(computed?.pure??computed?.order??[]);\nfor(const spec of columns){\nif(!spec||!spec.id)continue;\nif(spec.computed&&(spec.pure===false||(computed&&!pure.has(spec.id)))){\nwarnOnce(`ingest.impure.${spec.id}`,\n`column \"${spec.id}\" is an impure computed column and is not materialised into the store`);\ncontinue;\n}\nconst read=this.#readers.readers.get(spec.id)\n??(isFunction(spec.read)?spec.read:pathGetter(spec.field||spec.id));\nconst plan=new ColumnPlan(spec,read);\nif(spec.kind){\nplan.kind=spec.kind;\nplan.reason='declared by the caller';\n}else if(spec.dictionary){\nplan.kind=spec.multi?'multi':'dictionary';\nplan.reason='value table supplied (lookup column)';\n}else{\nconst samples=[];\nfor(let i=0;i<sampleN&&samples.length<this.#opts.sampleSize;i++){\nconst v=read(rows[i]);\nif(v!==null&&v!==undefined)samples.push(v);\n}\nplan.inferred=true;\nconst kind=inferKind(samples,{multi:spec.multi});\nif(kind==='text'){\nconst distinct=new Set(samples).size;\nplan.kind=decideText(distinct,samples.length,ratio);\nplan.candidate=this.#columnar;\nplan.reason=`sampled ${distinct} distinct in ${samples.length}`;\n}else{\nplan.kind=kind;\nplan.reason=`inferred from ${samples.length} sampled values`;\nif(kind==='object'&&samples.length){\ninfoOnce(`ingest.mixed.${spec.id}`,\n`column \"${spec.id}\" holds mixed or unrecognised value types; storing as an object array. Declare a type to avoid this.`);\n}\n}\nif(plan.kind==='object'&&plan.candidate)plan.distinct=new Set(samples);\n}\nthis.#plans.push(plan);\n}\n}\n#measure(from,to){\nconst rows=this.#rows;\nfor(const plan of this.#plans){\nif(!plan.candidate||!plan.distinct)continue;\nconst set=plan.distinct;\nfor(let i=from;i<to;i++){\nconst v=plan.read(rows[i]);\nif(v!==null&&v!==undefined)set.add(v);\n}\n}\n}\n#distinctOf(plan){\nif(plan.distinct)return plan.distinct.size;\nconst handle=this.#store.column(plan.spec.id);\nreturn handle?.dict?handle.dict.size:0;\n}\n#reviewCardinality(final){\nconst ratio=this.#opts.dictionaryRatio;\nconst total=this.#rows.length;\nfor(const plan of this.#plans){\nif(!plan.candidate)continue;\nconst distinct=this.#distinctOf(plan);\nif(plan.kind==='dictionary'&&distinct>=ratio*total){\nconst handle=this.#store.column(plan.spec.id);\nplan.distinct=new Set(handle?.dict?handle.dict.values():[]);\nthis.#store.convert(plan.spec.id,'object');\nplan.kind='object';\nplan.change='demoted';\nplan.reason=`${distinct} distinct values is at or above ${ratio*100}% of ${total} rows`;\ncontinue;\n}\nif(plan.kind==='object'&&distinct>=ratio*total){\nplan.candidate=false;\nplan.distinct=null;\nplan.reason=`${distinct} distinct values is at or above ${ratio*100}% of ${total} rows`;\ncontinue;\n}\nif(final&&plan.kind==='object'&&distinct<ratio*total){\nthis.#store.convert(plan.spec.id,'dictionary');\nplan.kind='dictionary';\nplan.change=plan.change==='demoted'?null:'promoted';\nplan.reason=`${distinct} distinct values is below ${ratio*100}% of ${total} rows`;\nplan.distinct=null;\n}\nif(final)plan.candidate=false;\n}\n}\n}\nasync function ingest(rows,plan={},opts={}){\nconst run=new Ingest(rows,plan,opts);\nconst frame=opts.scheduler?.frame??nextFrame;\nwhile(run.slice()){\nawait new Promise((resolve)=>{frame(resolve);});\n}\nreturn run.result();\n}\nfunction ingestSync(rows,plan={},opts={}){\nconst run=new Ingest(rows,plan,{...opts,chunkMs:Infinity});\nwhile(run.slice());\nreturn run.result();\n}\n});\n__def(\"packages/core/src/store/columnpack.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"isPortableSchema\",{enumerable:true,get:function(){return isPortableSchema;}});\nObject.defineProperty(__exports,\"packChunk\",{enumerable:true,get:function(){return packChunk;}});\nObject.defineProperty(__exports,\"packedTransfers\",{enumerable:true,get:function(){return packedTransfers;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst pathGetter=__m0[\"pathGetter\"];\nconst __m1=__req(\"packages/core/src/store/ingest.js\");\nconst inferKind=__m1[\"inferKind\"];\nconst decideText=__m1[\"decideText\"];\nconst INGEST_DEFAULTS=__m1[\"INGEST_DEFAULTS\"];\nconst __m2=__req(\"packages/core/src/store/columnstore.js\");\nconst toFloat=__m2[\"toFloat\"];\nconst PORTABLE_KINDS=new Set(['float64','int32','bitset','dictionary','object','multi']);\nfunction isPortableSchema(schema){\nif(!Array.isArray(schema)||schema.length===0)return false;\nfor(const col of schema){\nif(!col||typeof col.id!=='string')return false;\nif(typeof col.field!=='string'||col.field==='')return false;\nif(col.kind&&!PORTABLE_KINDS.has(col.kind))return false;\n}\nreturn true;\n}\nfunction toInt(v){\nconst n=toFloat(v);\nreturn Number.isFinite(n)?n|0:0;\n}\nfunction toMembers(v){\nif(v===null||v===undefined)return[];\nreturn Array.isArray(v)?v:[v];\n}\nfunction resolveKind(col,values,rows,ratio){\nif(col.kind)return col.kind;\nconst samples=[];\nfor(let i=0;i<values.length&&samples.length<INGEST_DEFAULTS.sampleSize;i++){\nconst v=values[i];\nif(v!==null&&v!==undefined)samples.push(v);\n}\nconst kind=inferKind(samples,{multi:col.multi});\nif(kind!=='text')return kind;\nconst distinct=new Set(samples).size;\nreturn decideText(distinct,samples.length,ratio);\n}\nfunction packChunk(schema,rows,opts={}){\nconst n=rows.length|0;\nconst ratio=opts.dictionaryRatio??INGEST_DEFAULTS.dictionaryRatio;\nconst columns=[];\nfor(const col of schema){\nconst read=pathGetter(col.field||col.id);\nconst nullable=col.nullable!==false;\nconst raw=new Array(n);\nfor(let i=0;i<n;i++){\nconst v=read(rows[i]);\nraw[i]=v===undefined?null:v;\n}\nconst kind=resolveKind(col,raw,n,ratio);\nconst presence=nullable?new Uint8Array((n+7)>>3):null;\nconst present=(i)=>{if(presence)presence[i>>3]|=1<<(i&7);};\nlet packed;\nswitch(kind){\ncase'float64':{\nconst values=new Float64Array(n);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nconst gone=v===null;\nif(!gone)present(i);\nvalues[i]=gone?NaN:toFloat(v);\n}\npacked={id:col.id,kind,nullable,values,presence,offsets:null,table:null};\nbreak;\n}\ncase'int32':{\nconst values=new Int32Array(n);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nconst gone=v===null;\nif(!gone)present(i);\nvalues[i]=gone?0:toInt(v);\n}\npacked={id:col.id,kind,nullable,values,presence,offsets:null,table:null};\nbreak;\n}\ncase'bitset':{\nconst words=new Uint8Array((n+7)>>3);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nconst gone=v===null;\nif(!gone)present(i);\nif(!gone&&!!v)words[i>>3]|=1<<(i&7);\n}\npacked={id:col.id,kind,nullable,values:words,presence,offsets:null,table:null};\nbreak;\n}\ncase'dictionary':{\nconst codes=new Uint32Array(n);\nconst table=[];\nconst index=new Map();\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nif(v===null){codes[i]=0;continue;}\npresent(i);\nlet code=index.get(v);\nif(code===undefined){code=table.length;table.push(v);index.set(v,code);}\ncodes[i]=code;\n}\npacked={id:col.id,kind,nullable,values:codes,presence,offsets:null,table};\nbreak;\n}\ncase'multi':{\nconst table=[];\nconst index=new Map();\nconst offsets=new Uint32Array(n+1);\nconst flat=[];\nfor(let i=0;i<n;i++){\nconst v=raw[i];\noffsets[i]=flat.length;\nconst gone=v===null;\nif(!gone)present(i);\nconst members=toMembers(v);\nfor(let k=0;k<members.length;k++){\nconst m=members[k];\nlet code=index.get(m);\nif(code===undefined){code=table.length;table.push(m);index.set(m,code);}\nflat.push(code);\n}\n}\noffsets[n]=flat.length;\npacked={id:col.id,kind,nullable,values:Int32Array.from(flat),presence,offsets,table};\nbreak;\n}\ndefault:{\nconst values=new Array(n);\nfor(let i=0;i<n;i++){\nconst v=raw[i];\nif(v!==null)present(i);\nvalues[i]=v;\n}\npacked={id:col.id,kind:'object',nullable,values,presence,offsets:null,table:null};\nbreak;\n}\n}\ncolumns.push(packed);\n}\nreturn{count:n,columns};\n}\nfunction packedTransfers(chunk){\nconst out=[];\nif(!chunk||!Array.isArray(chunk.columns))return out;\nconst add=(v)=>{\nif(ArrayBuffer.isView(v)&&v.buffer&&!out.includes(v.buffer))out.push(v.buffer);\n};\nfor(const col of chunk.columns){\nadd(col.values);\nadd(col.presence);\nadd(col.offsets);\n}\nreturn out;\n}\n});\n__def(\"packages/core/src/compute/sortspec.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"collationDescriptor\",{enumerable:true,get:function(){return collationDescriptor;}});\nObject.defineProperty(__exports,\"isPortableSort\",{enumerable:true,get:function(){return isPortableSort;}});\nObject.defineProperty(__exports,\"isPortableSortSet\",{enumerable:true,get:function(){return isPortableSortSet;}});\nObject.defineProperty(__exports,\"describeSortEntry\",{enumerable:true,get:function(){return describeSortEntry;}});\nObject.defineProperty(__exports,\"describeSort\",{enumerable:true,get:function(){return describeSort;}});\nfunction collationDescriptor(locale){\nreturn{locale:locale===undefined?undefined:String(locale),numeric:true,sensitivity:'variant'};\n}\nfunction isPortableSort(entry){\nreturn!!entry&&typeof entry.compare!=='function';\n}\nfunction isPortableSortSet(entries){\nif(!entries)return true;\nfor(let i=0;i<entries.length;i++)if(!isPortableSort(entries[i]))return false;\nreturn true;\n}\nfunction describeSortEntry(entry,locale){\nconst col=entry.col!==undefined?entry.col:(entry.handle&&entry.handle.id);\nconst chosen=entry.locale!==undefined?entry.locale:locale;\nreturn{\ncol,\ndescending:entry.descending!==undefined?!!entry.descending:entry.dir==='desc',\nnullsFirst:!!entry.nullsFirst,\ncollation:collationDescriptor(chosen),\n};\n}\nfunction describeSort(entries,locale){\nconst list=entries||[];\nconst out=new Array(list.length);\nfor(let i=0;i<list.length;i++)out[i]=describeSortEntry(list[i],locale);\nreturn out;\n}\n});\n__def(\"packages/core/src/format/date.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"scanPattern\",{enumerable:true,get:function(){return scanPattern;}});\nObject.defineProperty(__exports,\"toDate\",{enumerable:true,get:function(){return toDate;}});\nObject.defineProperty(__exports,\"compilePattern\",{enumerable:true,get:function(){return compilePattern;}});\nObject.defineProperty(__exports,\"compileDate\",{enumerable:true,get:function(){return compileDate;}});\nObject.defineProperty(__exports,\"toIsoDate\",{enumerable:true,get:function(){return toIsoDate;}});\nObject.defineProperty(__exports,\"toIsoDateTime\",{enumerable:true,get:function(){return toIsoDateTime;}});\nObject.defineProperty(__exports,\"compareIso\",{enumerable:true,get:function(){return compareIso;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst isNil=__m0[\"isNil\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst TOKENS=[\n'yyyy','yy','MMMM','MMM','MM','M','dd','d',\n'EEEE','EEE','HH','H','hh','h','mm','m','ss','s','SSS','a',\n];\nfunction scanPattern(pattern){\nconst out=[];\nlet i=0;\nlet literal='';\nconst flush=()=>{if(literal){out.push({token:null,text:literal});literal='';}};\nwhile(i<pattern.length){\nconst ch=pattern[i];\nif(ch===\"'\"){\nif(pattern[i+1]===\"'\"){literal+=\"'\";i+=2;continue;}\nconst end=pattern.indexOf(\"'\",i+1);\nif(end===-1){literal+=pattern.slice(i+1);i=pattern.length;continue;}\nliteral+=pattern.slice(i+1,end);\ni=end+1;\ncontinue;\n}\nconst token=TOKENS.find((t)=>pattern.startsWith(t,i));\nif(token){flush();out.push({token,text:token});i+=token.length;continue;}\nif(/[A-Za-z]/.test(ch)){\nwarnOnce(\n`date.pattern.token:${ch}`,\n`the date pattern \"${pattern}\" contains '${ch}', which is not a supported token, `\n+'so it is rendered as text. Quote it as a literal to silence this. '\n+`Supported: ${TOKENS.join(' ')}.`,\n);\n}\nliteral+=ch;\ni+=1;\n}\nflush();\nreturn out;\n}\nconst WALL_CLOCK=/^(\\d{4})-(\\d{2})-(\\d{2})(?:[T ](\\d{2}):(\\d{2})(?::(\\d{2}))?(?:\\.\\d+)?)?$/;\nfunction toDate(value){\nif(isNil(value)||value==='')return null;\nif(value instanceof Date)return Number.isNaN(value.getTime())?null:value;\nif(typeof value==='number')return Number.isNaN(value)?null:new Date(value);\nif(typeof value==='string'){\nconst wall=WALL_CLOCK.exec(value.trim());\nif(wall){\nconst[,y,mo,d,h='0',mi='0',sec='0']=wall;\nreturn new Date(+y,+mo-1,+d,+h,+mi,+sec);\n}\nconst d=new Date(value);\nreturn Number.isNaN(d.getTime())?null:d;\n}\nreturn null;\n}\nfunction pad(n,w){return String(n).padStart(w,'0');}\nfunction fieldReader(timeZone){\nif(!timeZone){\nreturn(d)=>({\nyear:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),\nhour:d.getHours(),minute:d.getMinutes(),second:d.getSeconds(),\nms:d.getMilliseconds(),weekday:d.getDay(),\n});\n}\nconst zoned=new Intl.DateTimeFormat('en-US',{\ntimeZone,year:'numeric',month:'2-digit',day:'2-digit',\nhour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,weekday:'short',\n});\nconst days={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};\nreturn(d)=>{\nconst f={year:0,month:1,day:1,hour:0,minute:0,second:0,ms:d.getMilliseconds(),weekday:0};\nfor(const part of zoned.formatToParts(d)){\nswitch(part.type){\ncase'year':f.year=Number(part.value);break;\ncase'month':f.month=Number(part.value);break;\ncase'day':f.day=Number(part.value);break;\ncase'hour':f.hour=Number(part.value)%24;break;\ncase'minute':f.minute=Number(part.value);break;\ncase'second':f.second=Number(part.value);break;\ncase'weekday':f.weekday=days[part.value]??0;break;\ndefault:break;\n}\n}\nreturn f;\n};\n}\nfunction compilePattern(pattern,locale,timeZone){\nconst segments=scanPattern(pattern);\nconst read=fieldReader(timeZone);\nconst used=new Set(segments.filter((s)=>s.token).map((s)=>s.token));\nconst monthShort=used.has('MMM')?new Intl.DateTimeFormat(locale,{month:'short',timeZone}):null;\nconst monthLong=used.has('MMMM')?new Intl.DateTimeFormat(locale,{month:'long',timeZone}):null;\nconst dayShort=used.has('EEE')?new Intl.DateTimeFormat(locale,{weekday:'short',timeZone}):null;\nconst dayLong=used.has('EEEE')?new Intl.DateTimeFormat(locale,{weekday:'long',timeZone}):null;\nreturn(d)=>{\nconst f=read(d);\nlet out='';\nfor(const seg of segments){\nif(!seg.token){out+=seg.text;continue;}\nswitch(seg.token){\ncase'yyyy':out+=pad(f.year,4);break;\ncase'yy':out+=pad(f.year%100,2);break;\ncase'MMMM':out+=monthLong.format(d);break;\ncase'MMM':out+=monthShort.format(d);break;\ncase'MM':out+=pad(f.month,2);break;\ncase'M':out+=String(f.month);break;\ncase'dd':out+=pad(f.day,2);break;\ncase'd':out+=String(f.day);break;\ncase'EEEE':out+=dayLong.format(d);break;\ncase'EEE':out+=dayShort.format(d);break;\ncase'HH':out+=pad(f.hour,2);break;\ncase'H':out+=String(f.hour);break;\ncase'hh':out+=pad(f.hour%12===0?12:f.hour%12,2);break;\ncase'h':out+=String(f.hour%12===0?12:f.hour%12);break;\ncase'mm':out+=pad(f.minute,2);break;\ncase'm':out+=String(f.minute);break;\ncase'ss':out+=pad(f.second,2);break;\ncase's':out+=String(f.second);break;\ncase'SSS':out+=pad(f.ms,3);break;\ncase'a':out+=f.hour<12?'AM':'PM';break;\ndefault:out+=seg.text;break;\n}\n}\nreturn out;\n};\n}\nconst UNITS=[\n['year',365*24*3600e3],\n['month',30*24*3600e3],\n['week',7*24*3600e3],\n['day',24*3600e3],\n['hour',3600e3],\n['minute',60e3],\n['second',1e3],\n];\nfunction compileDate(spec,locale){\nconst s=spec||{};\nconst loc=s.locale||locale||undefined;\nconst nullDisplay=s.nullDisplay??'';\nconst timeZone=s.timeZone;\nlet absolute;\nif(s.pattern){\nabsolute=compilePattern(s.pattern,loc,timeZone);\n}else if(s.dateStyle||s.timeStyle){\nconst opts={timeZone};\nif(s.dateStyle)opts.dateStyle=s.dateStyle;\nif(s.timeStyle)opts.timeStyle=s.timeStyle;\nconst dtf=new Intl.DateTimeFormat(loc,opts);\nabsolute=(d)=>dtf.format(d);\n}else{\nconst dtf=new Intl.DateTimeFormat(loc,{dateStyle:'medium',timeZone});\nabsolute=(d)=>dtf.format(d);\n}\nconst relative=s.relative?new Intl.RelativeTimeFormat(loc,{numeric:'auto'}):null;\nconst thresholdDays=typeof s.relative==='object'&&s.relative\n?(s.relative.threshold??7)\n:7;\nconst thresholdMs=thresholdDays*24*3600e3;\nconst format=(value,params)=>{\nconst d=toDate(value);\nif(!d)return nullDisplay;\nif(relative){\nconst now=params&&typeof params.now==='number'?params.now:Date.now();\nconst delta=d.getTime()-now;\nif(Math.abs(delta)<thresholdMs){\nfor(const[unit,ms]of UNITS){\nif(Math.abs(delta)>=ms||unit==='second'){\nreturn relative.format(Math.round(delta/ms),unit);\n}\n}\n}\n}\nreturn absolute(d);\n};\nformat.spec=s;\nreturn format;\n}\nfunction toIsoDate(value){\nif(isNil(value)||value==='')return null;\nif(typeof value==='string'){\nconst match=/^(\\d{4}-\\d{2}-\\d{2})/.exec(value.trim());\nif(match)return match[1];\nconst parsed=toDate(value);\nreturn parsed?toIsoDate(parsed):null;\n}\nconst date=toDate(value);\nif(!date)return null;\nconst pad=(n)=>String(n).padStart(2,'0');\nreturn`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;\n}\nfunction toIsoDateTime(value,timeZone){\nif(isNil(value)||value==='')return null;\nif(typeof value==='string'){\nconst text=value.trim();\nif(ZONE_SUFFIX.test(text)){\nconst instant=toDate(text);\nreturn instant?wallClockIn(instant,timeZone):null;\n}\nconst match=/^(\\d{4}-\\d{2}-\\d{2})[T ](\\d{2}):(\\d{2})(?::(\\d{2}))?/.exec(text);\nif(match){\nconst[,day,hour,minute,second]=match;\nreturn`${day}T${hour}:${minute}${second&&second!=='00'?`:${second}`:''}`;\n}\nif(/^\\d{4}-\\d{2}-\\d{2}$/.test(text))return`${text}T00:00`;\nconst parsed=toDate(text);\nreturn parsed?toIsoDateTime(parsed):null;\n}\nconst date=toDate(value);\nif(!date)return null;\nreturn wallClockIn(date,timeZone);\n}\nconst ZONE_SUFFIX=/(?:Z|[+-]\\d{2}:?\\d{2})$/i;\nfunction wallClockIn(date,timeZone){\nconst pad=(n)=>String(n).padStart(2,'0');\nif(timeZone){\ntry{\nconst parts=new Intl.DateTimeFormat('en-CA',{\ntimeZone,\nyear:'numeric',month:'2-digit',day:'2-digit',\nhour:'2-digit',minute:'2-digit',second:'2-digit',\nhour12:false,\n}).formatToParts(date).reduce((out,part)=>{\nif(part.type!=='literal')out[part.type]=part.value;\nreturn out;\n},{});\nconst hour=parts.hour==='24'?'00':parts.hour;\nconst seconds=Number(parts.second);\nreturn`${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`\n+(seconds?`:${parts.second}`:'');\n}catch{\n}\n}\nconst day=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;\nconst seconds=date.getSeconds();\nconst clock=`${pad(date.getHours())}:${pad(date.getMinutes())}${seconds?`:${pad(seconds)}`:''}`;\nreturn`${day}T${clock}`;\n}\nfunction compareIso(a,b){\nconst left=isNil(a)||a===''?null:String(a);\nconst right=isNil(b)||b===''?null:String(b);\nif(left===null)return right===null?0:1;\nif(right===null)return-1;\nreturn left<right?-1:left>right?1:0;\n}\n});\n__def(\"packages/core/src/compute/filter.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"releaseMask\",{enumerable:true,get:function(){return releaseMask;}});\nObject.defineProperty(__exports,\"compilePredicate\",{enumerable:true,get:function(){return compilePredicate;}});\nObject.defineProperty(__exports,\"testValue\",{enumerable:true,get:function(){return testValue;}});\nObject.defineProperty(__exports,\"evaluateCondition\",{enumerable:true,get:function(){return evaluateCondition;}});\nObject.defineProperty(__exports,\"evaluateFilters\",{enumerable:true,get:function(){return evaluateFilters;}});\nObject.defineProperty(__exports,\"pruneColumn\",{enumerable:true,get:function(){return pruneColumn;}});\nObject.defineProperty(__exports,\"mentionsColumn\",{enumerable:true,get:function(){return mentionsColumn;}});\nObject.defineProperty(__exports,\"compact\",{enumerable:true,get:function(){return compact;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst isBlank=__m0[\"isBlank\"];\nconst toArray=__m0[\"toArray\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst __m1=__req(\"packages/core/src/format/date.js\");\nconst toIsoDate=__m1[\"toIsoDate\"];\nconst __m2=__req(\"packages/core/src/compute/handle.js\");\nconst bitReader=__m2[\"bitReader\"];\nconst dictSize=__m2[\"dictSize\"];\nconst dictValue=__m2[\"dictValue\"];\nconst presenceReader=__m2[\"presenceReader\"];\nconst valueComparator=__m2[\"valueComparator\"];\nconst valueReader=__m2[\"valueReader\"];\nconst ISO_DAY=/^\\d{4}-\\d{2}-\\d{2}$/;\nconst NULL_KEY='\\u0000null\\u0000';\nfunction acquireMask(ctx,n){\nconst pool=ctx&&ctx.pool;\nif(pool){\nconst take=pool.mask||pool.acquireMask||pool.acquire||pool.take;\nif(typeof take==='function'){\nconst mask=take.call(pool,n);\nif(mask&&mask.length>=n)return mask;\n}\n}\nreturn new Uint8Array(n);\n}\nfunction releaseMask(ctx,mask){\nconst pool=ctx&&ctx.pool;\nif(!pool||!mask)return;\nconst give=pool.release||pool.releaseMask||pool.free||pool.recycle;\nif(typeof give==='function')give.call(pool,mask);\n}\nfunction fillMask(mask,n,value){\nmask.fill(value,0,n);\nreturn mask;\n}\nfunction unorderable(v){\nreturn v===null||v===undefined||(typeof v==='number'&&Number.isNaN(v));\n}\nfunction coerceTarget(value,type){\nif(value===null||value===undefined)return value;\nif(type==='number')return typeof value==='number'?value:Number(value);\nif(type==='date'||type==='dateString'){\nconst iso=toIsoDate(value);\nreturn iso===null?toMillis(value):iso;\n}\nif(type==='boolean'){\nif(typeof value==='boolean')return value;\nif(value==='true'||value===1)return true;\nif(value==='false'||value===0)return false;\nreturn!!value;\n}\nreturn value;\n}\nfunction toMillis(value){\nif(value instanceof Date)return value.getTime();\nif(typeof value==='number')return value;\nreturn Date.parse(String(value));\n}\nfunction toNumber(value){\nif(typeof value==='number')return value;\nif(value instanceof Date)return value.getTime();\nif(value===null||value===undefined||value==='')return NaN;\nreturn Number(value);\n}\nfunction textOf(v,caseSensitive){\nconst s=typeof v==='string'?v:String(v);\nreturn caseSensitive?s:s.toLowerCase();\n}\nfunction setKey(v,caseSensitive){\nif(v===null||v===undefined)return NULL_KEY;\nif(typeof v==='string')return caseSensitive?v:v.toLowerCase();\nif(v instanceof Date)return v.getTime();\nreturn v;\n}\nfunction buildSet(value,caseSensitive,type){\nconst set=new Set();\nfor(const raw of toArray(value)){\nconst entry=coerceTarget(raw,type);\nset.add(setKey(entry,caseSensitive));\nif(typeof entry==='string'&&entry!==''&&Number.isFinite(Number(entry)))set.add(Number(entry));\nelse if(typeof entry==='number'&&Number.isFinite(entry))set.add(setKey(String(entry),caseSensitive));\n}\nreturn set;\n}\nfunction valueEquals(a,b,caseSensitive){\nif(a===null||a===undefined||b===null||b===undefined){\nreturn(a===null||a===undefined)&&(b===null||b===undefined);\n}\nconst ta=typeof a;\nconst tb=typeof b;\nif(ta==='string'&&tb==='string')return caseSensitive?a===b:a.toLowerCase()===b.toLowerCase();\nif(a instanceof Date||b instanceof Date)return toMillis(a)===toMillis(b);\nif(ta==='number'&&tb==='number')return a===b||(Number.isNaN(a)&&Number.isNaN(b));\nif(ta==='number'&&tb==='string')return a===Number(b);\nif(ta==='string'&&tb==='number')return Number(a)===b;\nif(ta==='boolean'||tb==='boolean')return a===b;\nif(Array.isArray(a)&&Array.isArray(b)){\nreturn a.length===b.length&&a.every((x,i)=>valueEquals(x,b[i],caseSensitive));\n}\nreturn a===b;\n}\nfunction compileRegExp(value,caseSensitive){\ntry{\nif(value instanceof RegExp){\nconst flags=value.flags.replace(/[gy]/g,'');\nreturn new RegExp(value.source,caseSensitive?flags:flags.includes('i')?flags:`${flags}i`);\n}\nreturn new RegExp(String(value),caseSensitive?'':'i');\n}catch(err){\nwarnOnce(`regex:${String(value)}`,`filter operator \"matches\" received an invalid pattern: ${String(value)}`,err);\nreturn null;\n}\n}\nfunction compilePredicate(condition,locale){\nconst predicate=compileValuePredicate(condition,locale);\nconst type=condition&&condition.type;\nif(type!=='date'&&type!=='dateString')return predicate;\nreturn(v)=>predicate(typeof v==='string'&&ISO_DAY.test(v)?v:(toIsoDate(v)??v));\n}\nfunction compileValuePredicate(condition,locale){\nconst op=condition&&condition.op;\nconst caseSensitive=!!(condition&&condition.caseSensitive);\nconst type=condition&&condition.type;\nconst cmp=valueComparator(locale);\nconst not=(p)=>(v)=>!p(v);\nswitch(op){\ncase'eq':{\nconst target=coerceTarget(condition.value,type);\nreturn(v)=>valueEquals(v,target,caseSensitive);\n}\ncase'ne':{\nconst target=coerceTarget(condition.value,type);\nreturn(v)=>!valueEquals(v,target,caseSensitive);\n}\ncase'lt':case'lte':case'gt':case'gte':{\nconst target=coerceTarget(condition.value,type);\nif(unorderable(target))return()=>false;\nconst want=op==='lt'?-1:op==='lte'?0:op==='gt'?1:2;\nreturn(v)=>{\nif(unorderable(v))return false;\nconst c=cmp(v,target);\nreturn want===-1?c<0:want===0?c<=0:want===1?c>0:c>=0;\n};\n}\ncase'between':case'notBetween':{\nconst pair=toArray(condition.value);\nconst lo=coerceTarget(pair[0],type);\nconst hi=coerceTarget(pair[1],type);\nconst bounds=condition.bounds||'[]';\nconst loInclusive=bounds.charAt(0)!=='(';\nconst hiInclusive=bounds.charAt(1)!==')';\nif(unorderable(lo)||unorderable(hi))return op==='between'?()=>false:()=>true;\nconst inRange=(v)=>{\nif(unorderable(v))return false;\nconst a=cmp(v,lo);\nconst b=cmp(v,hi);\nreturn(loInclusive?a>=0:a>0)&&(hiInclusive?b<=0:b<0);\n};\nreturn op==='between'?inRange:not(inRange);\n}\ncase'in':case'notIn':{\nconst set=buildSet(condition.value,caseSensitive,type);\nconst member=(v)=>set.has(setKey(v,caseSensitive));\nreturn op==='in'?member:not(member);\n}\ncase'contains':case'notContains':{\nconst needle=textOf(coerceTarget(condition.value,type),caseSensitive);\nconst has=(v)=>(v===null||v===undefined?false:textOf(v,caseSensitive).includes(needle));\nreturn op==='contains'?has:not(has);\n}\ncase'startsWith':{\nconst needle=textOf(coerceTarget(condition.value,type),caseSensitive);\nreturn(v)=>(v===null||v===undefined?false:textOf(v,caseSensitive).startsWith(needle));\n}\ncase'endsWith':{\nconst needle=textOf(coerceTarget(condition.value,type),caseSensitive);\nreturn(v)=>(v===null||v===undefined?false:textOf(v,caseSensitive).endsWith(needle));\n}\ncase'matches':{\nconst re=compileRegExp(condition.value,caseSensitive);\nif(!re)return()=>false;\nreturn(v)=>(v===null||v===undefined?false:re.test(String(v)));\n}\ncase'blank':\nreturn(v)=>isBlank(v)||(Array.isArray(v)&&v.length===0);\ncase'notBlank':\nreturn(v)=>!(isBlank(v)||(Array.isArray(v)&&v.length===0));\ncase'containsAny':case'containsNone':{\nconst set=buildSet(condition.value,caseSensitive,type);\nconst any=(v)=>{\nconst list=v===null||v===undefined?[]:toArray(v);\nfor(let i=0;i<list.length;i++)if(set.has(setKey(list[i],caseSensitive)))return true;\nreturn false;\n};\nreturn op==='containsAny'?any:not(any);\n}\ncase'containsAll':{\nconst wanted=toArray(condition.value).map((x)=>setKey(coerceTarget(x,type),caseSensitive));\nreturn(v)=>{\nconst list=v===null||v===undefined?[]:toArray(v);\nif(wanted.length===0)return true;\nconst have=new Set(list.map((x)=>setKey(x,caseSensitive)));\nfor(let i=0;i<wanted.length;i++)if(!have.has(wanted[i]))return false;\nreturn true;\n};\n}\ndefault:\nwarnOnce(`op:${String(op)}`,`unknown filter operator \"${String(op)}\"; the condition passes every row`);\nreturn()=>true;\n}\n}\nfunction testValue(value,condition,locale){\nreturn compilePredicate(condition,locale)(value);\n}\nfunction presenceCondition(handle,wantPresent,mask,count){\nconst present=presenceReader(handle);\nif(present){\nconst target=wantPresent?1:0;\nfor(let i=0;i<count;i++)mask[i]=present(i)===target?1:0;\nreturn mask;\n}\nconst kind=handle.kind;\nif(kind==='float64'||kind==='int32'||kind==='bitset'){\nreturn fillMask(mask,count,wantPresent?1:0);\n}\nconst read=valueReader(handle);\nfor(let i=0;i<count;i++){\nconst v=read(i);\nconst blank=isBlank(v)||(Array.isArray(v)&&v.length===0);\nmask[i]=blank===wantPresent?0:1;\n}\nreturn mask;\n}\nfunction dictionaryCondition(handle,pred,mask,count){\nconst dict=handle.dict;\nconst size=dictSize(dict);\nconst allowed=new Uint8Array(size);\nfor(let code=0;code<size;code++)allowed[code]=pred(dictValue(dict,code))?1:0;\nconst codes=handle.values;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<count;i++)mask[i]=allowed[codes[i]];\nreturn mask;\n}\nconst absentAnswer=pred(null)?1:0;\nfor(let i=0;i<count;i++)mask[i]=present(i)===1?allowed[codes[i]]:absentAnswer;\nreturn mask;\n}\nfunction booleanCondition(handle,pred,mask,count){\nconst bit=bitReader(handle.values);\nconst whenTrue=pred(true)?1:0;\nconst whenFalse=pred(false)?1:0;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<count;i++)mask[i]=bit(i)===1?whenTrue:whenFalse;\nreturn mask;\n}\nconst absentAnswer=pred(null)?1:0;\nfor(let i=0;i<count;i++){\nmask[i]=present(i)===0?absentAnswer:(bit(i)===1?whenTrue:whenFalse);\n}\nreturn mask;\n}\nfunction numericCondition(handle,condition,pred,mask,count){\nconst values=handle.values;\nconst type=condition.type;\nconst op=condition.op;\nlet handled=true;\nswitch(op){\ncase'eq':case'ne':{\nconst target=toNumber(coerceTarget(condition.value,type));\nconst wantNaN=typeof condition.value==='number'&&Number.isNaN(condition.value);\nconst invert=op==='ne'?1:0;\nif(wantNaN){\nfor(let i=0;i<count;i++)mask[i]=(Number.isNaN(values[i])?1:0)^invert;\n}else{\nfor(let i=0;i<count;i++)mask[i]=((values[i]===target)?1:0)^invert;\n}\nbreak;\n}\ncase'lt':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]<t?1:0;\nbreak;\n}\ncase'lte':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]<=t?1:0;\nbreak;\n}\ncase'gt':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]>t?1:0;\nbreak;\n}\ncase'gte':{\nconst t=toNumber(coerceTarget(condition.value,type));\nfor(let i=0;i<count;i++)mask[i]=values[i]>=t?1:0;\nbreak;\n}\ncase'between':case'notBetween':{\nconst pair=toArray(condition.value);\nconst lo=toNumber(coerceTarget(pair[0],type));\nconst hi=toNumber(coerceTarget(pair[1],type));\nconst bounds=condition.bounds||'[]';\nconst loInclusive=bounds.charAt(0)!=='(';\nconst hiInclusive=bounds.charAt(1)!==')';\nconst invert=op==='notBetween'?1:0;\nif(loInclusive&&hiInclusive){\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>=lo)&(values[i]<=hi))?1:0)^invert;\n}else if(loInclusive){\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>=lo)&(values[i]<hi))?1:0)^invert;\n}else if(hiInclusive){\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>lo)&(values[i]<=hi))?1:0)^invert;\n}else{\nfor(let i=0;i<count;i++)mask[i]=(((values[i]>lo)&(values[i]<hi))?1:0)^invert;\n}\nbreak;\n}\ncase'in':case'notIn':{\nconst set=new Set();\nfor(const raw of toArray(condition.value)){\nconst n=toNumber(coerceTarget(raw,type));\nif(!Number.isNaN(n))set.add(n);\n}\nconst invert=op==='notIn'?1:0;\nfor(let i=0;i<count;i++)mask[i]=(set.has(values[i])?1:0)^invert;\nbreak;\n}\ndefault:\nhandled=false;\nbreak;\n}\nif(!handled)return false;\nconst present=presenceReader(handle);\nif(present){\nconst absentAnswer=pred(null)?1:0;\nfor(let i=0;i<count;i++)if(present(i)===0)mask[i]=absentAnswer;\n}\nreturn true;\n}\nfunction genericCondition(handle,pred,mask,count){\nconst read=valueReader(handle);\nfor(let i=0;i<count;i++)mask[i]=pred(read(i))?1:0;\nreturn mask;\n}\nfunction evaluateCondition(condition,ctx,out){\nconst count=ctx.count|0;\nconst mask=out||acquireMask(ctx,count);\nif(!condition)return fillMask(mask,count,1);\nconst handle=typeof ctx.handle==='function'?ctx.handle(condition.col):undefined;\nconst custom=typeof ctx.custom==='function'?ctx.custom:null;\nif(!handle){\nif(custom){\nfor(let i=0;i<count;i++)mask[i]=custom(condition,i)?1:0;\nreturn mask;\n}\nwarnOnce(`filter:col:${String(condition.col)}`,\n`filter references unknown column \"${String(condition.col)}\"; the condition passes every row`);\nreturn fillMask(mask,count,1);\n}\nconst op=condition.op;\nif(op==='blank'||op==='notBlank')return presenceCondition(handle,op==='notBlank',mask,count);\nconst pred=compilePredicate(condition,ctx.locale);\nswitch(handle.kind){\ncase'dictionary':\nreturn dictionaryCondition(handle,pred,mask,count);\ncase'bitset':\nreturn booleanCondition(handle,pred,mask,count);\ncase'float64':case'int32':\nif(numericCondition(handle,condition,pred,mask,count))return mask;\nreturn genericCondition(handle,pred,mask,count);\ndefault:\nreturn genericCondition(handle,pred,mask,count);\n}\n}\nfunction evaluateNode(node,ctx,count){\nif(!node)return fillMask(acquireMask(ctx,count),count,1);\nif(Array.isArray(node.conditions)){\nconst children=node.conditions.filter((c)=>c!=null);\nconst op=node.op==='or'?'or':node.op==='not'?'not':'and';\nif(children.length===0)return fillMask(acquireMask(ctx,count),count,1);\nconst acc=evaluateNode(children[0],ctx,count);\nfor(let k=1;k<children.length;k++){\nconst rhs=evaluateNode(children[k],ctx,count);\nif(op==='or')for(let i=0;i<count;i++)acc[i]|=rhs[i];\nelse for(let i=0;i<count;i++)acc[i]&=rhs[i];\nreleaseMask(ctx,rhs);\n}\nif(op==='not')for(let i=0;i<count;i++)acc[i]^=1;\nreturn acc;\n}\nreturn evaluateCondition(node,ctx,acquireMask(ctx,count));\n}\nfunction evaluateFilters(filters,ctx){\nreturn evaluateNode(filters,ctx,ctx.count|0);\n}\nfunction pruneColumn(filters,colId){\nif(!filters||!colId)return filters||null;\nconst node=(filters);\nif(Array.isArray(node.conditions)){\nconst op=node.op==='or'?'or':node.op==='not'?'not':'and';\nif(op!=='and'){\nreturn mentionsColumn(node,colId)?null:filters;\n}\nconst kept=[];\nfor(const child of node.conditions){\nconst pruned=pruneColumn(child,colId);\nif(pruned)kept.push(pruned);\n}\nif(!kept.length)return null;\nreturn{...node,op:'and',conditions:kept};\n}\nreturn node.col===colId?null:filters;\n}\nfunction mentionsColumn(filters,colId){\nif(!filters||typeof filters!=='object')return false;\nconst node=(filters);\nif(node.col===colId)return true;\nif(Array.isArray(node.conditions)){\nfor(const child of node.conditions)if(mentionsColumn(child,colId))return true;\n}\nreturn false;\n}\nfunction compact(mask,count,out){\nif(out&&out.length>=count){\nlet k=0;\nfor(let i=0;i<count;i++)if(mask[i])out[k++]=i;\nreturn out.subarray(0,k);\n}\nlet survivors=0;\nfor(let i=0;i<count;i++)survivors+=mask[i]?1:0;\nconst result=new Uint32Array(survivors);\nlet k=0;\nfor(let i=0;i<count;i++)if(mask[i])result[k++]=i;\nreturn result;\n}\n});\n__def(\"packages/core/src/compute/group.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"packKeys\",{enumerable:true,get:function(){return packKeys;}});\nObject.defineProperty(__exports,\"groupByColumns\",{enumerable:true,get:function(){return groupByColumns;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst dictSize=__m0[\"dictSize\"];\nconst identity=__m0[\"identity\"];\nconst presenceReader=__m0[\"presenceReader\"];\nconst rowCount=__m0[\"rowCount\"];\nconst valueReader=__m0[\"valueReader\"];\nconst KEY_SEPARATOR='\\u001F';\nconst NULL_MARKER='\\u0000';\nconst MAX_DIRECT_COUNTS=1<<20;\nfunction packKeys(handles,idx,n,project){\nconst k=handles.length;\nconst base=handles.map((h)=>valueReader(h));\nconst projected=Array.isArray(project)&&project.some(Boolean);\nconst readers=projected\n?base.map((r,j)=>(project[j]?(i)=>project[j](r(i)):r))\n:base;\nconst allDictionary=!projected&&k>0&&handles.every((h)=>h&&h.kind==='dictionary'&&h.dict);\nif(allDictionary){\nconst cards=handles.map((h)=>dictSize(h.dict)+1);\nlet product=1;\nfor(let j=0;j<k;j++)product*=cards[j];\nif(product<=Number.MAX_SAFE_INTEGER){\nconst codes=handles.map((h)=>h.values);\nconst presence=handles.map((h)=>presenceReader(h));\nconst keyOf=(row)=>{\nlet key=0;\nfor(let j=0;j<k;j++){\nconst present=presence[j];\nconst code=present&&present(row)===0?cards[j]-1:codes[j][row];\nkey=key*cards[j]+code;\n}\nreturn key;\n};\nconst packed=new Float64Array(n);\nfor(let i=0;i<n;i++)packed[i]=keyOf(idx[i]);\nreturn{packed,strings:null,product,readers,keyOf};\n}\n}\nconst keyOf=(row)=>{\nlet key='';\nfor(let j=0;j<k;j++){\nconst v=readers[j](row);\nkey+=(j===0?'':KEY_SEPARATOR)+(v===null||v===undefined?NULL_MARKER:String(v));\n}\nreturn key;\n};\nconst strings=new Array(n);\nfor(let i=0;i<n;i++)strings[i]=keyOf(idx[i]);\nreturn{packed:null,strings,product:Infinity,readers,keyOf};\n}\nfunction scatterBuckets(idx,ids,n,groups){\nconst offsets=new Uint32Array(groups+1);\nfor(let i=0;i<n;i++)offsets[ids[i]+1]++;\nfor(let g=0;g<groups;g++)offsets[g+1]+=offsets[g];\nconst scattered=new Uint32Array(n);\nconst cursor=offsets.slice(0,groups);\nfor(let i=0;i<n;i++)scattered[cursor[ids[i]]++]=idx[i];\nconst buckets=new Array(groups);\nfor(let g=0;g<groups;g++)buckets[g]=scattered.subarray(offsets[g],offsets[g+1]);\nreturn buckets;\n}\nfunction groupByColumns(handles,order,opts={}){\nconst list=handles||[];\nconst idx=order||identity(rowCount(list[0],opts));\nconst n=idx.length;\nif(list.length===0||n===0)return{keys:[],buckets:[]};\nconst{packed,strings,product,readers}=packKeys(list,idx,n,opts.project);\nconst ids=new Uint32Array(n);\nlet groups=0;\nlet packedKeys=null;\nif(packed&&product<=Math.max(1024,Math.min(MAX_DIRECT_COUNTS,n*4))){\nconst size=product;\nconst seen=new Int32Array(size).fill(-1);\nfor(let i=0;i<n;i++)seen[packed[i]]=0;\nfor(let key=0;key<size;key++)if(seen[key]===0)seen[key]=groups++;\nfor(let i=0;i<n;i++)ids[i]=seen[packed[i]];\npackedKeys=new Float64Array(groups);\nfor(let key=0;key<size;key++)if(seen[key]>=0)packedKeys[seen[key]]=key;\n}else if(packed){\nconst seen=new Map();\nfor(let i=0;i<n;i++){\nconst key=packed[i];\nlet id=seen.get(key);\nif(id===undefined){id=groups++;seen.set(key,id);}\nids[i]=id;\n}\npackedKeys=new Float64Array(groups);\nfor(const[key,id]of seen)packedKeys[id]=key;\n}else{\nconst seen=new Map();\nfor(let i=0;i<n;i++){\nconst key=strings[i];\nlet id=seen.get(key);\nif(id===undefined){id=groups++;seen.set(key,id);}\nids[i]=id;\n}\n}\nconst buckets=scatterBuckets(idx,ids,n,groups);\nconst keys=new Array(groups);\nfor(let g=0;g<groups;g++){\nconst row=buckets[g][0];\nconst tuple=new Array(readers.length);\nfor(let j=0;j<readers.length;j++)tuple[j]=readers[j](row);\nkeys[g]=tuple;\n}\nconst result={keys,buckets};\nif(packedKeys)result.packed=packedKeys;\nreturn result;\n}\n});\n__def(\"packages/core/src/compute/facet.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"STRATEGIES\",{enumerable:true,get:function(){return STRATEGIES;}});\nObject.defineProperty(__exports,\"GRANULARITIES\",{enumerable:true,get:function(){return GRANULARITIES;}});\nObject.defineProperty(__exports,\"DEFAULT_BUCKETS\",{enumerable:true,get:function(){return DEFAULT_BUCKETS;}});\nObject.defineProperty(__exports,\"DEFAULT_CARDINALITY_LIMIT\",{enumerable:true,get:function(){return DEFAULT_CARDINALITY_LIMIT;}});\nObject.defineProperty(__exports,\"QUANTILE_SAMPLE\",{enumerable:true,get:function(){return QUANTILE_SAMPLE;}});\nObject.defineProperty(__exports,\"facetKind\",{enumerable:true,get:function(){return facetKind;}});\nObject.defineProperty(__exports,\"orderedReader\",{enumerable:true,get:function(){return orderedReader;}});\nObject.defineProperty(__exports,\"toNumeric\",{enumerable:true,get:function(){return toNumeric;}});\nObject.defineProperty(__exports,\"cardinalityOf\",{enumerable:true,get:function(){return cardinalityOf;}});\nObject.defineProperty(__exports,\"pickGranularity\",{enumerable:true,get:function(){return pickGranularity;}});\nObject.defineProperty(__exports,\"floorTo\",{enumerable:true,get:function(){return floorTo;}});\nObject.defineProperty(__exports,\"advance\",{enumerable:true,get:function(){return advance;}});\nObject.defineProperty(__exports,\"computeBounds\",{enumerable:true,get:function(){return computeBounds;}});\nObject.defineProperty(__exports,\"countInto\",{enumerable:true,get:function(){return countInto;}});\nObject.defineProperty(__exports,\"bucketOf\",{enumerable:true,get:function(){return bucketOf;}});\nObject.defineProperty(__exports,\"facet\",{enumerable:true,get:function(){return facet;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst presenceReader=__m0[\"presenceReader\"];\nconst valueReader=__m0[\"valueReader\"];\nconst dictSize=__m0[\"dictSize\"];\nconst dictValue=__m0[\"dictValue\"];\nconst STRATEGIES=Object.freeze(['equal','quantile','log']);\nconst GRANULARITIES=Object.freeze(['hour','day','week','month','quarter','year']);\nconst DEFAULT_BUCKETS=20;\nconst DEFAULT_CARDINALITY_LIMIT=50;\nconst QUANTILE_SAMPLE=10_000;\nfunction facetKind(handle,type){\nif(!handle)return'none';\nconst base=type&&type.base;\nif(base==='date'||base==='datetime'||base==='time'||base==='dateString')return'date';\nswitch(handle.kind){\ncase'bitset':return'boolean';\ncase'float64':case'int32':return'numeric';\ncase'dictionary':return'category';\ncase'multi':return'category';\ndefault:\nif(base==='number')return'numeric';\nif(base==='boolean')return'boolean';\nif(base==='text')return'category';\nreturn'none';\n}\n}\nfunction orderedReader(handle){\nconst values=handle.values;\nconst kind=handle.kind;\nif((kind==='float64'||kind==='int32')&&values)return(i)=>values[i];\nconst read=valueReader(handle);\nreturn(i)=>toNumeric(read(i));\n}\nfunction toNumeric(v){\nif(typeof v==='number')return v;\nif(v instanceof Date)return v.getTime();\nif(v===null||v===undefined||v==='')return NaN;\nif(typeof v==='boolean')return v?1:0;\nif(typeof v==='string'){\nconst n=Number(v);\nif(Number.isFinite(n))return n;\nconst t=Date.parse(v);\nreturn Number.isFinite(t)?t:NaN;\n}\nreturn NaN;\n}\nfunction cardinalityOf(handle,indices,count,limit=DEFAULT_CARDINALITY_LIMIT){\nif(!handle)return{cardinality:0,exact:true};\nif(handle.dict)return{cardinality:dictSize(handle.dict),exact:true};\nif(handle.kind==='bitset')return{cardinality:2,exact:true};\nconst read=valueReader(handle);\nconst n=indices?indices.length:count;\nconst seen=new Set();\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined)continue;\nseen.add(v);\nif(seen.size>limit)return{cardinality:seen.size,exact:false};\n}\nreturn{cardinality:seen.size,exact:true};\n}\nconst HOUR_MS=3600_000;\nconst DAY_MS=86_400_000;\nfunction pickGranularity(span,target=DEFAULT_BUCKETS){\nconst ms=Number.isFinite(span)&&span>0?span:0;\nconst wide=Math.max(1,target)*2;\nif(ms/HOUR_MS<=wide)return'hour';\nif(ms/DAY_MS<=wide)return'day';\nif(ms/(7*DAY_MS)<=wide)return'week';\nif(ms/(30*DAY_MS)<=wide)return'month';\nif(ms/(91*DAY_MS)<=wide)return'quarter';\nreturn'year';\n}\nfunction floorTo(ms,granularity){\nif(!Number.isFinite(ms))return NaN;\nconst d=new Date(ms);\nswitch(granularity){\ncase'hour':d.setMinutes(0,0,0);return d.getTime();\ncase'day':d.setHours(0,0,0,0);return d.getTime();\ncase'week':{\nd.setHours(0,0,0,0);\nconst back=(d.getDay()+6)%7;\nd.setDate(d.getDate()-back);\nreturn d.getTime();\n}\ncase'month':d.setDate(1);d.setHours(0,0,0,0);return d.getTime();\ncase'quarter':\nd.setMonth(Math.floor(d.getMonth()/3)*3,1);\nd.setHours(0,0,0,0);\nreturn d.getTime();\ndefault:d.setMonth(0,1);d.setHours(0,0,0,0);return d.getTime();\n}\n}\nfunction advance(ms,granularity){\nconst d=new Date(ms);\nswitch(granularity){\ncase'hour':d.setHours(d.getHours()+1);break;\ncase'day':d.setDate(d.getDate()+1);break;\ncase'week':d.setDate(d.getDate()+7);break;\ncase'month':d.setMonth(d.getMonth()+1);break;\ncase'quarter':d.setMonth(d.getMonth()+3);break;\ndefault:d.setFullYear(d.getFullYear()+1);break;\n}\nreturn d.getTime();\n}\nfunction numericExtent(handle,indices,count){\nconst read=orderedReader(handle);\nconst present=presenceReader(handle);\nconst n=indices?indices.length:count;\nlet min=Infinity;\nlet max=-Infinity;\nlet nulls=0;\nlet finite=0;\nfor(let k=0;k<n;k++){\nconst i=indices?indices[k]:k;\nif(present&&!present(i)){nulls++;continue;}\nconst v=read(i);\nif(!Number.isFinite(v)){nulls++;continue;}\nif(v<min)min=v;\nif(v>max)max=v;\nfinite++;\n}\nreturn{min,max,nulls,finite};\n}\nfunction sortedSample(handle,indices,count,cap){\nconst read=orderedReader(handle);\nconst present=presenceReader(handle);\nconst n=indices?indices.length:count;\nconst step=n>cap?n/cap:1;\nconst out=[];\nfor(let s=0;s<n;s+=step){\nconst i=indices?indices[Math.floor(s)]:Math.floor(s);\nif(present&&!present(i))continue;\nconst v=read(i);\nif(Number.isFinite(v))out.push(v);\n}\nconst arr=Float64Array.from(out);\narr.sort();\nreturn arr;\n}\nfunction computeBounds(handle,indices,count,opts={}){\nconst kind=opts.kind||facetKind(handle,opts.type);\nif(kind==='none'||!handle)return{kind:'none',buckets:[],suppressed:'type'};\nif(kind==='boolean')return boundsForBoolean(handle,indices,count);\nif(kind==='category')return boundsForCategory(handle,indices,count,opts);\nreturn boundsForOrdered(handle,indices,count,kind,opts);\n}\nfunction boundsForBoolean(handle,indices,count){\nconst present=presenceReader(handle);\nlet nulls=0;\nif(present){\nconst n=indices?indices.length:count;\nfor(let k=0;k<n;k++)if(!present(indices?indices[k]:k))nulls++;\n}\nconst buckets=[{value:false,label:'false'},{value:true,label:'true'}];\nif(nulls>0)buckets.push({null:true,label:'Empty'});\nreturn{kind:'boolean',buckets};\n}\nfunction boundsForCategory(handle,indices,count,opts){\nconst limit=opts.cardinalityLimit??DEFAULT_CARDINALITY_LIMIT;\nconst{cardinality}=cardinalityOf(handle,indices,count,limit);\nif(cardinality>limit&&(opts.aboveLimit||'suppress')==='suppress'){\nreturn{kind:'category',buckets:[],suppressed:'cardinality',cardinality};\n}\nconst read=valueReader(handle);\nconst n=indices?indices.length:count;\nconst tally=new Map();\nlet nulls=0;\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined||v===''){nulls++;continue;}\nif(Array.isArray(v)){\nif(!v.length){nulls++;continue;}\nfor(const m of v)tally.set(m,(tally.get(m)||0)+1);\ncontinue;\n}\ntally.set(v,(tally.get(v)||0)+1);\n}\nlet entries=[...tally.entries()];\nif(opts.order==='alpha'){\nentries.sort((a,b)=>String(a[0]).localeCompare(String(b[0])));\n}else{\nentries.sort((a,b)=>b[1]-a[1]);\n}\nlet remainder=0;\nlet dropped=0;\nif(entries.length>limit){\ndropped=entries.length-limit;\nfor(let i=limit;i<entries.length;i++)remainder+=entries[i][1];\nentries=entries.slice(0,limit);\n}\nconst buckets=entries.map(([value])=>({value,label:String(value)}));\nif(remainder>0)buckets.push({remainder:true,label:`Other (${dropped} values)`});\nif(nulls>0)buckets.push({null:true,label:'Empty'});\nreturn{kind:'category',buckets,cardinality};\n}\nfunction boundsForOrdered(handle,indices,count,kind,opts){\nconst{min,max,nulls,finite}=numericExtent(handle,indices,count);\nif(!finite){\nreturn{kind,buckets:nulls?[{null:true,label:'Empty'}]:[],empty:true};\n}\nconst wanted=Math.max(1,Math.floor(opts.buckets||DEFAULT_BUCKETS));\nlet buckets=[];\nif(kind==='date'){\nconst granularity=GRANULARITIES.includes(opts.granularity)\n?opts.granularity:pickGranularity(max-min,wanted);\nlet edge=floorTo(min,granularity);\nwhile(edge<=max&&buckets.length<4096){\nconst next=advance(edge,granularity);\nif(!(next>edge))break;\nbuckets.push({from:edge,to:next});\nedge=next;\n}\nreturn{kind,buckets:withNull(buckets,nulls),granularity};\n}\nconst strategy=STRATEGIES.includes(opts.strategy)?opts.strategy:'equal';\nif(strategy==='quantile'){\nconst sample=sortedSample(handle,indices,count,QUANTILE_SAMPLE);\nif(sample.length){\nconst edges=[sample[0]];\nfor(let b=1;b<wanted;b++){\nconst v=sample[Math.min(sample.length-1,Math.floor((b/wanted)*sample.length))];\nif(v>edges[edges.length-1])edges.push(v);\n}\nedges.push(max);\nfor(let b=0;b<edges.length-1;b++)buckets.push({from:edges[b],to:edges[b+1]});\n}\n}else if(strategy==='log'&&min>0){\nconst lo=Math.log10(min);\nconst hi=Math.log10(max);\nconst step=(hi-lo)/wanted||1;\nfor(let b=0;b<wanted;b++){\nbuckets.push({from:10**(lo+b*step),to:10**(lo+(b+1)*step)});\n}\n}\nif(!buckets.length){\nconst width=(max-min)/wanted||1;\nfor(let b=0;b<wanted;b++)buckets.push({from:min+b*width,to:min+(b+1)*width});\n}\nbuckets[buckets.length-1].to=max;\nreturn{kind,buckets:withNull(buckets,nulls),strategy,min,max};\n}\nfunction withNull(buckets,nulls){\nreturn nulls>0?[...buckets,{null:true,label:'Empty'}]:buckets;\n}\nfunction countInto(handle,indices,count,bounds,out){\nconst buckets=(bounds&&bounds.buckets)||[];\nconst counts=out&&out.length>=buckets.length?out.subarray(0,buckets.length)\n:new Uint32Array(buckets.length);\ncounts.fill(0);\nif(!handle||!buckets.length)return counts;\nconst nullBucket=buckets.length-1;\nconst hasNull=!!buckets[nullBucket]&&buckets[nullBucket].null===true;\nconst n=indices?indices.length:count;\nif(bounds.kind==='boolean'){\nconst read=valueReader(handle);\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined){if(hasNull)counts[nullBucket]++;continue;}\ncounts[v?1:0]++;\n}\nreturn counts;\n}\nif(bounds.kind==='category'){\nconst slot=new Map();\nfor(let b=0;b<buckets.length;b++){\nif(!buckets[b].null&&!buckets[b].remainder)slot.set(buckets[b].value,b);\n}\nconst remainderAt=buckets.findIndex((b)=>b.remainder);\nconst read=valueReader(handle);\nfor(let k=0;k<n;k++){\nconst v=read(indices?indices[k]:k);\nif(v===null||v===undefined||v===''){if(hasNull)counts[nullBucket]++;continue;}\nif(Array.isArray(v)){\nif(!v.length){if(hasNull)counts[nullBucket]++;continue;}\nfor(const m of v){\nconst at=slot.get(m);\nif(at!==undefined)counts[at]++;\nelse if(remainderAt>=0)counts[remainderAt]++;\n}\ncontinue;\n}\nconst at=slot.get(v);\nif(at!==undefined)counts[at]++;\nelse if(remainderAt>=0)counts[remainderAt]++;\n}\nreturn counts;\n}\nconst ordered=hasNull?buckets.length-1:buckets.length;\nconst edges=new Float64Array(ordered+1);\nfor(let b=0;b<ordered;b++)edges[b]=buckets[b].from;\nedges[ordered]=ordered?buckets[ordered-1].to:0;\nconst read=orderedReader(handle);\nconst present=presenceReader(handle);\nfor(let k=0;k<n;k++){\nconst i=indices?indices[k]:k;\nif(present&&!present(i)){if(hasNull)counts[nullBucket]++;continue;}\nconst v=read(i);\nif(!Number.isFinite(v)){if(hasNull)counts[nullBucket]++;continue;}\nconst at=bucketOf(edges,ordered,v);\nif(at>=0)counts[at]++;\n}\nreturn counts;\n}\nfunction bucketOf(edges,ordered,v){\nif(!ordered)return-1;\nif(v<edges[0])return-1;\nif(v>=edges[ordered])return v===edges[ordered]?ordered-1:-1;\nlet lo=0;\nlet hi=ordered-1;\nwhile(lo<hi){\nconst mid=(lo+hi+1)>>>1;\nif(v>=edges[mid])lo=mid;else hi=mid-1;\n}\nreturn lo;\n}\nfunction facet(handle,indices,count,opts={}){\nconst bounds=opts.bounds||computeBounds(handle,opts.boundsIndices??indices,count,opts);\nreturn{bounds,counts:countInto(handle,indices,count,bounds)};\n}\nconst __default=facet;\n});\n__def(\"packages/core/src/compute/special.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"logGamma\",{enumerable:true,get:function(){return logGamma;}});\nObject.defineProperty(__exports,\"incompleteBeta\",{enumerable:true,get:function(){return incompleteBeta;}});\nObject.defineProperty(__exports,\"normalQuantile\",{enumerable:true,get:function(){return normalQuantile;}});\nObject.defineProperty(__exports,\"normalCdf\",{enumerable:true,get:function(){return normalCdf;}});\nObject.defineProperty(__exports,\"studentT\",{enumerable:true,get:function(){return studentT;}});\nObject.defineProperty(__exports,\"studentTQuantile\",{enumerable:true,get:function(){return studentTQuantile;}});\nObject.defineProperty(__exports,\"regularizedGammaP\",{enumerable:true,get:function(){return regularizedGammaP;}});\nObject.defineProperty(__exports,\"chiSquareCdf\",{enumerable:true,get:function(){return chiSquareCdf;}});\nObject.defineProperty(__exports,\"chiSquareUpperTail\",{enumerable:true,get:function(){return chiSquareUpperTail;}});\nconst LANCZOS=Object.freeze([\n676.5203681218851,-1259.1392167224028,771.32342877765313,\n-176.61502916214059,12.507343278686905,-0.13857109526572012,\n9.9843695780195716e-6,1.5056327351493116e-7,\n]);\nconst EPS=3e-12;\nconst TINY=1e-300;\nfunction logGamma(x){\nif(x<0.5)return Math.log(Math.PI/Math.sin(Math.PI*x))-logGamma(1-x);\nconst z=x-1;\nlet a=0.99999999999980993;\nconst t=z+7.5;\nfor(let i=0;i<LANCZOS.length;i++)a+=LANCZOS[i]/(z+i+1);\nreturn 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(a);\n}\nfunction betaContinuedFraction(a,b,x){\nconst qab=a+b;\nconst qap=a+1;\nconst qam=a-1;\nlet c=1;\nlet d=1-(qab*x)/qap;\nif(Math.abs(d)<TINY)d=TINY;\nd=1/d;\nlet h=d;\nfor(let m=1;m<=300;m++){\nconst m2=2*m;\nlet aa=(m*(b-m)*x)/((qam+m2)*(a+m2));\nd=1+aa*d;\nif(Math.abs(d)<TINY)d=TINY;\nc=1+aa/c;\nif(Math.abs(c)<TINY)c=TINY;\nd=1/d;\nh*=d*c;\naa=(-(a+m)*(qab+m)*x)/((a+m2)*(qap+m2));\nd=1+aa*d;\nif(Math.abs(d)<TINY)d=TINY;\nc=1+aa/c;\nif(Math.abs(c)<TINY)c=TINY;\nd=1/d;\nconst step=d*c;\nh*=step;\nif(Math.abs(step-1)<EPS)break;\n}\nreturn h;\n}\nfunction incompleteBeta(a,b,x){\nif(!(a>0)||!(b>0)||!Number.isFinite(x))return Number.NaN;\nif(x<=0)return 0;\nif(x>=1)return 1;\nconst front=Math.exp(\nlogGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x),\n);\nreturn x<(a+1)/(a+b+2)\n?(front*betaContinuedFraction(a,b,x))/a\n:1-(front*betaContinuedFraction(b,a,1-x))/b;\n}\nfunction normalQuantile(p){\nif(!(p>0)||!(p<1))return p===0?-Infinity:(p===1?Infinity:Number.NaN);\nconst a=[-3.969683028665376e+1,2.209460984245205e+2,-2.759285104469687e+2,\n1.383577518672690e+2,-3.066479806614716e+1,2.506628277459239];\nconst b=[-5.447609879822406e+1,1.615858368580409e+2,-1.556989798598866e+2,\n6.680131188771972e+1,-1.328068155288572e+1];\nconst c=[-7.784894002430293e-3,-3.223964580411365e-1,-2.400758277161838,\n-2.549732539343734,4.374664141464968,2.938163982698783];\nconst d=[7.784695709041462e-3,3.224671290700398e-1,2.445134137142996,\n3.754408661907416];\nconst low=0.02425;\nlet q;\nlet r;\nlet x;\nif(p<low){\nq=Math.sqrt(-2*Math.log(p));\nx=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])\n/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);\n}else if(p<=1-low){\nq=p-0.5;\nr=q*q;\nx=((((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q)\n/ (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);\n}else{\nq=Math.sqrt(-2*Math.log(1-p));\nx=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])\n/ ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);\n}\nconst e=0.5*erfc(-x/Math.SQRT2)-p;\nconst u=e*Math.sqrt(2*Math.PI)*Math.exp((x*x)/2);\nreturn x-u/(1+(x*u)/2);\n}\nfunction erfc(x){\nconst z=Math.abs(x);\nconst t=2/(2+z);\nconst ty=4*t-2;\nconst cof=[-1.3026537197817094,6.4196979235649026e-1,1.9476473204185836e-2,\n-9.561514786808631e-3,-9.46595344482036e-4,3.66839497852761e-4,\n4.2523324806907e-5,-2.0278578112534e-5,-1.624290004647e-6,\n1.303655835580e-6,1.5626441722e-8,-8.5238095915e-8,6.529054439e-9,\n5.059343495e-9,-9.91364156e-10,-2.27365122e-10,9.6467911e-11,\n2.394038e-12,-6.886027e-12,8.94487e-13,3.13092e-13,-1.12708e-13,\n3.81e-16,7.106e-15];\nlet dd=0;\nlet dv=0;\nlet tmp;\nfor(let j=cof.length-1;j>0;j--){\ntmp=dv;\ndv=ty*dv-dd+cof[j];\ndd=tmp;\n}\nconst ans=t*Math.exp(-z*z+0.5*(cof[0]+ty*dv)-dd);\nreturn x>=0?ans:2-ans;\n}\nfunction normalCdf(x){\nreturn 0.5*erfc(-x/Math.SQRT2);\n}\nfunction studentT(t,df){\nif(!(df>0)||!Number.isFinite(t))return Number.NaN;\nconst tail=0.5*incompleteBeta(df/2,0.5,df/(df+t*t));\nreturn t>0?1-tail:tail;\n}\nfunction studentTQuantile(p,df){\nif(!(p>0)||!(p<1)||!(df>0))return Number.NaN;\nif(df>1e7)return normalQuantile(p);\nlet lo=-1e4;\nlet hi=1e4;\nlet x=normalQuantile(p);\nconst logBeta=logGamma(df/2)+logGamma(0.5)-logGamma((df+1)/2);\nfor(let i=0;i<60;i++){\nconst cdf=studentT(x,df);\nif(cdf<p)lo=x;else hi=x;\nconst pdf=Math.exp(-((df+1)/2)*Math.log(1+(x*x)/df)-logBeta)\n/ Math.sqrt(df);\nconst step=pdf>0?(cdf-p)/pdf:0;\nif(Math.abs(step)<1e-12)break;\nconst next=x-step;\nx=next>lo&&next<hi&&Number.isFinite(next)?next:(lo+hi)/2;\nif(hi-lo<1e-12)break;\n}\nreturn x;\n}\nfunction gammaSeries(a,x){\nlet ap=a;\nlet sum=1/a;\nlet del=sum;\nfor(let n=0;n<300;n++){\nap+=1;\ndel*=x/ap;\nsum+=del;\nif(Math.abs(del)<Math.abs(sum)*EPS)break;\n}\nreturn sum*Math.exp(-x+a*Math.log(x)-logGamma(a));\n}\nfunction gammaContinuedFraction(a,x){\nlet b=x+1-a;\nlet c=1/TINY;\nlet d=1/b;\nlet h=d;\nfor(let i=1;i<=300;i++){\nconst an=-i*(i-a);\nb+=2;\nd=an*d+b;\nif(Math.abs(d)<TINY)d=TINY;\nc=b+an/c;\nif(Math.abs(c)<TINY)c=TINY;\nd=1/d;\nconst del=d*c;\nh*=del;\nif(Math.abs(del-1)<EPS)break;\n}\nreturn Math.exp(-x+a*Math.log(x)-logGamma(a))*h;\n}\nfunction regularizedGammaP(a,x){\nif(!(a>0)||!(x>=0)||!Number.isFinite(x))return Number.NaN;\nif(x===0)return 0;\nreturn x<a+1?gammaSeries(a,x):1-gammaContinuedFraction(a,x);\n}\nfunction chiSquareCdf(x,df){\nif(!(df>0))return Number.NaN;\nreturn regularizedGammaP(df/2,x/2);\n}\nfunction chiSquareUpperTail(x,df){\nconst cdf=chiSquareCdf(x,df);\nreturn Number.isNaN(cdf)?Number.NaN:Math.min(1,Math.max(0,1-cdf));\n}\n});\n__def(\"packages/core/src/compute/linalg.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"cholesky\",{enumerable:true,get:function(){return cholesky;}});\nObject.defineProperty(__exports,\"choleskySolve\",{enumerable:true,get:function(){return choleskySolve;}});\nObject.defineProperty(__exports,\"choleskyInverse\",{enumerable:true,get:function(){return choleskyInverse;}});\nObject.defineProperty(__exports,\"normalEquations\",{enumerable:true,get:function(){return normalEquations;}});\nObject.defineProperty(__exports,\"matVec\",{enumerable:true,get:function(){return matVec;}});\nObject.defineProperty(__exports,\"quadForm\",{enumerable:true,get:function(){return quadForm;}});\nfunction cholesky(a){\nconst n=a.length;\nconst l=Array.from({length:n},()=>new Array(n).fill(0));\nfor(let i=0;i<n;i++){\nfor(let j=0;j<=i;j++){\nlet sum=a[i][j];\nfor(let k=0;k<j;k++)sum-=l[i][k]*l[j][k];\nif(i===j){\nif(!(sum>0))return null;\nl[i][j]=Math.sqrt(sum);\n}else{\nl[i][j]=sum/l[j][j];\n}\n}\n}\nreturn l;\n}\nfunction choleskySolve(l,b){\nconst n=l.length;\nconst y=new Array(n).fill(0);\nfor(let i=0;i<n;i++){\nlet sum=b[i];\nfor(let k=0;k<i;k++)sum-=l[i][k]*y[k];\ny[i]=sum/l[i][i];\n}\nconst x=new Array(n).fill(0);\nfor(let i=n-1;i>=0;i--){\nlet sum=y[i];\nfor(let k=i+1;k<n;k++)sum-=l[k][i]*x[k];\nx[i]=sum/l[i][i];\n}\nreturn x;\n}\nfunction choleskyInverse(l){\nconst n=l.length;\nconst inv=Array.from({length:n},()=>new Array(n).fill(0));\nfor(let c=0;c<n;c++){\nconst e=new Array(n).fill(0);\ne[c]=1;\nconst col=choleskySolve(l,e);\nfor(let r=0;r<n;r++)inv[r][c]=col[r];\n}\nreturn inv;\n}\nfunction normalEquations(x,y,w){\nconst n=x.length;\nconst p=n?x[0].length:0;\nconst xtwx=Array.from({length:p},()=>new Array(p).fill(0));\nconst xtwy=new Array(p).fill(0);\nfor(let i=0;i<n;i++){\nconst wi=w?w[i]:1;\nconst row=x[i];\nfor(let a=0;a<p;a++){\nconst wxa=wi*row[a];\nxtwy[a]+=wxa*y[i];\nfor(let b=a;b<p;b++)xtwx[a][b]+=wxa*row[b];\n}\n}\nfor(let a=0;a<p;a++)for(let b=0;b<a;b++)xtwx[a][b]=xtwx[b][a];\nreturn{xtwx,xtwy};\n}\nfunction matVec(m,v){\nreturn m.map((row)=>row.reduce((sum,cell,j)=>sum+cell*v[j],0));\n}\nfunction quadForm(x,m){\nlet sum=0;\nfor(let a=0;a<x.length;a++){\nlet inner=0;\nfor(let b=0;b<x.length;b++)inner+=m[a][b]*x[b];\nsum+=x[a]*inner;\n}\nreturn sum;\n}\n});\n__def(\"packages/core/src/compute/sketch.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Welford\",{enumerable:true,get:function(){return Welford;}});\nObject.defineProperty(__exports,\"Reservoir\",{enumerable:true,get:function(){return Reservoir;}});\nObject.defineProperty(__exports,\"hash32\",{enumerable:true,get:function(){return hash32;}});\nObject.defineProperty(__exports,\"HyperLogLog\",{enumerable:true,get:function(){return HyperLogLog;}});\nObject.defineProperty(__exports,\"SpaceSaving\",{enumerable:true,get:function(){return SpaceSaving;}});\nObject.defineProperty(__exports,\"KLL\",{enumerable:true,get:function(){return KLL;}});\nObject.defineProperty(__exports,\"SKETCH_BOUNDS\",{enumerable:true,get:function(){return SKETCH_BOUNDS;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nclass Welford{\n#n=0;\n#mean=0;\n#m2=0;\nstatic get errorBound(){\nreturn Object.freeze({\nkind:'exact',metric:'none',value:0,\nstatement:'mean and variance match a full recompute to float rounding',\n});\n}\nget count(){return this.#n;}\nadd(x){\nif(!Number.isFinite(x))return;\nthis.#n++;\nconst delta=x-this.#mean;\nthis.#mean+=delta/this.#n;\nthis.#m2+=delta*(x-this.#mean);\n}\nmerge(other){\nif(other.#n===0)return;\nif(this.#n===0){this.#n=other.#n;this.#mean=other.#mean;this.#m2=other.#m2;return;}\nconst n=this.#n+other.#n;\nconst delta=other.#mean-this.#mean;\nthis.#mean+=delta*(other.#n/n);\nthis.#m2+=other.#m2+delta*delta*(this.#n*other.#n/n);\nthis.#n=n;\n}\nmean(){return this.#n?this.#mean:null;}\nvariance(){return this.#n>1?this.#m2/(this.#n-1):null;}\nvarianceP(){return this.#n?this.#m2/this.#n:null;}\nstddev(){const v=this.variance();return v===null?null:Math.sqrt(v);}\nstddevP(){const v=this.varianceP();return v===null?null:Math.sqrt(v);}\n}\nclass Reservoir{\n#items=[];\n#seen=0;\n#capacity;\n#rng;\nconstructor(capacity,rng=Math.random){\nif(!(capacity>0))throw new RangeError('reservoir capacity must be positive');\nthis.#capacity=Math.floor(capacity);\nthis.#rng=rng;\n}\nstatic get errorBound(){\nreturn Object.freeze({\nkind:'probabilistic',metric:'none',value:0,\nstatement:'uniform sample: each element included with probability capacity/n; sample statistics are unbiased estimators',\n});\n}\nget seen(){return this.#seen;}\nget size(){return this.#items.length;}\nadd(x){\nif(!Number.isFinite(x))return;\nthis.#seen++;\nif(this.#items.length<this.#capacity){\nthis.#items.push(x);\nreturn;\n}\nconst j=Math.floor(this.#rng()*this.#seen);\nif(j<this.#capacity)this.#items[j]=x;\n}\nsample(){return this.#items.slice();}\nmean(){\nif(!this.#items.length)return null;\nlet s=0;\nfor(const v of this.#items)s+=v;\nreturn s/this.#items.length;\n}\nquantile(p){\nconst n=this.#items.length;\nif(!n)return null;\nconst sorted=this.#items.slice().sort((a,b)=>a-b);\nif(n===1)return sorted[0];\nconst h=(n-1)*Math.min(1,Math.max(0,p));\nconst lo=Math.floor(h);\nconst hi=Math.ceil(h);\nreturn lo===hi?sorted[lo]:sorted[lo]+(h-lo)*(sorted[hi]-sorted[lo]);\n}\n}\nfunction fmix32(h){\nh^=h>>>16;\nh=Math.imul(h,0x85ebca6b);\nh^=h>>>13;\nh=Math.imul(h,0xc2b2ae35);\nh^=h>>>15;\nreturn h>>>0;\n}\nfunction hash32(v){\nif(typeof v==='number'){\nconst buf=new DataView(new ArrayBuffer(8));\nbuf.setFloat64(0,v===0?0:v);\nreturn fmix32(buf.getUint32(0)^buf.getUint32(4));\n}\nconst s=typeof v==='string'?v:String(v);\nlet h=0x811c9dc5;\nfor(let i=0;i<s.length;i++){\nh^=s.charCodeAt(i);\nh=Math.imul(h,0x01000193);\n}\nreturn fmix32(h);\n}\nclass HyperLogLog{\n#p;\n#m;\n#registers;\nconstructor(precision=14){\nconst p=Math.floor(precision);\nif(p<4||p>16)throw new RangeError('HLL precision must be 4..16');\nthis.#p=p;\nthis.#m=1<<p;\nthis.#registers=new Uint8Array(this.#m);\n}\nstatic errorBoundFor(precision=14){\nconst m=1<<Math.floor(precision);\nconst rse=1.04/Math.sqrt(m);\nreturn Object.freeze({\nkind:'probabilistic',metric:'relative',value:rse,\nstatement:`distinct count within ~${(rse*100).toFixed(2)}% relative standard error (m=${m} buckets)`,\n});\n}\nerrorBound(){return HyperLogLog.errorBoundFor(this.#p);}\nadd(v){\nconst h=hash32(v);\nconst idx=h&(this.#m-1);\nconst rest=(h>>>this.#p)|(1<<(32-this.#p));\nlet rank=1;\nlet x=rest;\nwhile((x&1)===0){rank++;x>>>=1;}\nif(rank>this.#registers[idx])this.#registers[idx]=rank;\n}\ncount(){\nconst m=this.#m;\nconst q=32-this.#p;\nconst hist=new Float64Array(q+2);\nfor(let i=0;i<m;i++)hist[this.#registers[i]]++;\nlet z=m*tau(1-hist[q+1]/m);\nfor(let k=q;k>=1;k--)z=0.5*(z+hist[k]);\nz+=m*sigma(hist[0]/m);\nconst estimate=(ERTL_ALPHA_INF*m*m)/z;\nreturn Math.round(estimate);\n}\n}\nconst ERTL_ALPHA_INF=0.5/Math.log(2);\nfunction sigma(x){\nif(x===1)return Infinity;\nlet y=1;\nlet z=x;\nlet prev;\ndo{\nx*=x;\nprev=z;\nz+=x*y;\ny+=y;\n}while(z!==prev);\nreturn z;\n}\nfunction tau(x){\nif(x===0||x===1)return 0;\nlet y=1;\nlet z=1-x;\nlet prev;\ndo{\nx=Math.sqrt(x);\nprev=z;\ny*=0.5;\nz-=(1-x)**2*y;\n}while(z!==prev);\nreturn z/3;\n}\nclass SpaceSaving{\n#counters=new Map();\n#capacity;\n#n=0;\nconstructor(capacity){\nif(!(capacity>0))throw new RangeError('Space-Saving capacity must be positive');\nthis.#capacity=Math.floor(capacity);\n}\nerrorBoundFor(n){\nconst value=n/this.#capacity;\nreturn Object.freeze({\nkind:'deterministic',metric:'absolute',value,\nstatement:`each count overestimates the truth by at most N/m = ${value.toFixed(2)} (N=${n}, m=${this.#capacity})`,\n});\n}\nget seen(){return this.#n;}\nadd(item){\nthis.#n++;\nconst existing=this.#counters.get(item);\nif(existing){existing.count++;return;}\nif(this.#counters.size<this.#capacity){\nthis.#counters.set(item,{count:1,error:0});\nreturn;\n}\nlet minItem;\nlet minCount=Infinity;\nfor(const[k,v]of this.#counters){\nif(v.count<minCount){minCount=v.count;minItem=k;}\n}\nthis.#counters.delete(minItem);\nthis.#counters.set(item,{count:minCount+1,error:minCount});\n}\ntop(k=this.#capacity){\nconst all=[...this.#counters.entries()]\n.map(([item,v])=>({item,count:v.count,error:v.error}))\n.sort((a,b)=>b.count-a.count);\nreturn all.slice(0,Math.max(0,Math.floor(k)));\n}\n}\nclass KLL{\n#k;\n#levels=[[]];\n#n=0;\n#rng;\n#capacityFactor;\nconstructor(k=200,rng=Math.random){\nthis.#k=Math.max(8,Math.floor(k));\nthis.#rng=rng;\nthis.#capacityFactor=2/3;\n}\nstatic errorBoundFor(k=200){\nconst eps=1/Math.max(8,Math.floor(k));\nreturn Object.freeze({\nkind:'probabilistic',metric:'rank',value:eps,\nstatement:`queried quantile's true rank within ~${(eps*100).toFixed(2)}% of N of the requested rank (k=${k})`,\n});\n}\nerrorBound(){return KLL.errorBoundFor(this.#k);}\nget count(){return this.#n;}\n#levelCapacity(height){\nconst top=this.#levels.length-1;\nconst depthFromTop=top-height;\nconst cap=Math.ceil(this.#k*this.#capacityFactor**depthFromTop);\nreturn Math.max(2,cap);\n}\nadd(x){\nif(!Number.isFinite(x))return;\nthis.#n++;\nthis.#levels[0].push(x);\nif(this.#levels[0].length>=this.#levelCapacity(0))this.#compact(0);\n}\n#compact(height){\nconst level=this.#levels[height];\nlevel.sort((a,b)=>a-b);\nif(height+1>=this.#levels.length)this.#levels.push([]);\nconst up=this.#levels[height+1];\nconst offset=this.#rng()<0.5?0:1;\nfor(let i=offset;i<level.length;i+=2)up.push(level[i]);\nthis.#levels[height]=[];\nfor(let h=0;h<this.#levels.length;h++){\nif(this.#levels[h].length>=this.#levelCapacity(h)){this.#compact(h);return;}\n}\n}\n#weighted(){\nconst out=[];\nfor(let h=0;h<this.#levels.length;h++){\nconst w=1<<h;\nfor(const v of this.#levels[h])out.push({v,w});\n}\nreturn out;\n}\nquantile(p){\nconst items=this.#weighted();\nif(!items.length)return null;\nitems.sort((a,b)=>a.v-b.v);\nlet totalW=0;\nfor(const it of items)totalW+=it.w;\nconst target=Math.min(1,Math.max(0,p))*totalW;\nlet cum=0;\nfor(const it of items){\ncum+=it.w;\nif(cum>=target)return it.v;\n}\nreturn items[items.length-1].v;\n}\nrank(x){\nlet cum=0;\nfor(let h=0;h<this.#levels.length;h++){\nconst w=1<<h;\nfor(const v of this.#levels[h])if(v<=x)cum+=w;\n}\nreturn cum;\n}\n}\nconst SKETCH_BOUNDS=Object.freeze({\ndistinct:HyperLogLog.errorBoundFor(14),\nmedian:KLL.errorBoundFor(200),\np25:KLL.errorBoundFor(200),\np75:KLL.errorBoundFor(200),\np90:KLL.errorBoundFor(200),\np95:KLL.errorBoundFor(200),\np99:KLL.errorBoundFor(200),\niqr:KLL.errorBoundFor(200),\ntopK:Object.freeze({\nkind:'deterministic',metric:'absolute',value:0,\nstatement:'each count overestimates the truth by at most N/m; top-K exact when the K-th item exceeds N/m',\n}),\n});\nconst __default={\nWelford,Reservoir,HyperLogLog,SpaceSaving,KLL,hash32,SKETCH_BOUNDS,\n};\n});\n__def(\"packages/core/src/compute/statistics.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"KENDALL_LIMIT\",{enumerable:true,get:function(){return KENDALL_LIMIT;}});\nObject.defineProperty(__exports,\"MAINTENANCE\",{enumerable:true,get:function(){return MAINTENANCE;}});\nObject.defineProperty(__exports,\"APPROXIMATE\",{enumerable:true,get:function(){return APPROXIMATE;}});\nObject.defineProperty(__exports,\"maintenanceOf\",{enumerable:true,get:function(){return maintenanceOf;}});\nObject.defineProperty(__exports,\"numbers\",{enumerable:true,get:function(){return numbers;}});\nObject.defineProperty(__exports,\"frequencies\",{enumerable:true,get:function(){return frequencies;}});\nObject.defineProperty(__exports,\"herfindahl\",{enumerable:true,get:function(){return herfindahl;}});\nObject.defineProperty(__exports,\"entropy\",{enumerable:true,get:function(){return entropy;}});\nObject.defineProperty(__exports,\"evenness\",{enumerable:true,get:function(){return evenness;}});\nObject.defineProperty(__exports,\"topShare\",{enumerable:true,get:function(){return topShare;}});\nObject.defineProperty(__exports,\"gini\",{enumerable:true,get:function(){return gini;}});\nObject.defineProperty(__exports,\"moments\",{enumerable:true,get:function(){return moments;}});\nObject.defineProperty(__exports,\"quantileSorted\",{enumerable:true,get:function(){return quantileSorted;}});\nObject.defineProperty(__exports,\"quantile\",{enumerable:true,get:function(){return quantile;}});\nObject.defineProperty(__exports,\"STAT_FNS\",{enumerable:true,get:function(){return STAT_FNS;}});\nObject.defineProperty(__exports,\"STAT_LABELS\",{enumerable:true,get:function(){return STAT_LABELS;}});\nObject.defineProperty(__exports,\"weightedAverage\",{enumerable:true,get:function(){return weightedAverage;}});\nObject.defineProperty(__exports,\"extremeRow\",{enumerable:true,get:function(){return extremeRow;}});\nObject.defineProperty(__exports,\"correlation\",{enumerable:true,get:function(){return correlation;}});\nObject.defineProperty(__exports,\"trimmedMean\",{enumerable:true,get:function(){return trimmedMean;}});\nObject.defineProperty(__exports,\"winsorizedMean\",{enumerable:true,get:function(){return winsorizedMean;}});\nObject.defineProperty(__exports,\"modifiedZOutliers\",{enumerable:true,get:function(){return modifiedZOutliers;}});\nObject.defineProperty(__exports,\"jarqueBera\",{enumerable:true,get:function(){return jarqueBera;}});\nObject.defineProperty(__exports,\"weightedQuantile\",{enumerable:true,get:function(){return weightedQuantile;}});\nObject.defineProperty(__exports,\"pairs\",{enumerable:true,get:function(){return pairs;}});\nObject.defineProperty(__exports,\"covariance\",{enumerable:true,get:function(){return covariance;}});\nObject.defineProperty(__exports,\"regression\",{enumerable:true,get:function(){return regression;}});\nObject.defineProperty(__exports,\"fitLinearModel\",{enumerable:true,get:function(){return fitLinearModel;}});\nObject.defineProperty(__exports,\"ADF_CT_CRITICAL\",{enumerable:true,get:function(){return ADF_CT_CRITICAL;}});\nObject.defineProperty(__exports,\"augmentedDickeyFuller\",{enumerable:true,get:function(){return augmentedDickeyFuller;}});\nObject.defineProperty(__exports,\"autocorrelations\",{enumerable:true,get:function(){return autocorrelations;}});\nObject.defineProperty(__exports,\"spearman\",{enumerable:true,get:function(){return spearman;}});\nObject.defineProperty(__exports,\"kendall\",{enumerable:true,get:function(){return kendall;}});\nObject.defineProperty(__exports,\"seriesStats\",{enumerable:true,get:function(){return seriesStats;}});\nObject.defineProperty(__exports,\"D2_N2\",{enumerable:true,get:function(){return D2_N2;}});\nObject.defineProperty(__exports,\"D4_N2\",{enumerable:true,get:function(){return D4_N2;}});\nObject.defineProperty(__exports,\"movingRanges\",{enumerable:true,get:function(){return movingRanges;}});\nObject.defineProperty(__exports,\"withinSigma\",{enumerable:true,get:function(){return withinSigma;}});\nObject.defineProperty(__exports,\"capability\",{enumerable:true,get:function(){return capability;}});\nObject.defineProperty(__exports,\"controlLimits\",{enumerable:true,get:function(){return controlLimits;}});\nObject.defineProperty(__exports,\"westernElectricViolations\",{enumerable:true,get:function(){return westernElectricViolations;}});\nObject.defineProperty(__exports,\"nelsonViolations\",{enumerable:true,get:function(){return nelsonViolations;}});\nObject.defineProperty(__exports,\"CONTROL_RULE_SETS\",{enumerable:true,get:function(){return CONTROL_RULE_SETS;}});\nObject.defineProperty(__exports,\"controlViolations\",{enumerable:true,get:function(){return controlViolations;}});\nObject.defineProperty(__exports,\"countOutside\",{enumerable:true,get:function(){return countOutside;}});\nObject.defineProperty(__exports,\"histogram\",{enumerable:true,get:function(){return histogram;}});\nObject.defineProperty(__exports,\"DEFAULT_CONFIDENCE\",{enumerable:true,get:function(){return DEFAULT_CONFIDENCE;}});\nObject.defineProperty(__exports,\"meanInterval\",{enumerable:true,get:function(){return meanInterval;}});\nObject.defineProperty(__exports,\"proportionInterval\",{enumerable:true,get:function(){return proportionInterval;}});\nObject.defineProperty(__exports,\"slopeInterval\",{enumerable:true,get:function(){return slopeInterval;}});\nObject.defineProperty(__exports,\"capabilityInterval\",{enumerable:true,get:function(){return capabilityInterval;}});\nObject.defineProperty(__exports,\"standardizedMeanDifference\",{enumerable:true,get:function(){return standardizedMeanDifference;}});\nObject.defineProperty(__exports,\"normalTotalVariation\",{enumerable:true,get:function(){return normalTotalVariation;}});\nObject.defineProperty(__exports,\"frequencyMap\",{enumerable:true,get:function(){return frequencyMap;}});\nObject.defineProperty(__exports,\"categoricalDistance\",{enumerable:true,get:function(){return categoricalDistance;}});\nObject.defineProperty(__exports,\"SUBSET_RELIABILITY_FLOOR\",{enumerable:true,get:function(){return SUBSET_RELIABILITY_FLOOR;}});\nObject.defineProperty(__exports,\"compareColumn\",{enumerable:true,get:function(){return compareColumn;}});\nObject.defineProperty(__exports,\"isNumericColumn\",{enumerable:true,get:function(){return isNumericColumn;}});\nObject.defineProperty(__exports,\"populationRead\",{enumerable:true,get:function(){return populationRead;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst presenceReader=__m0[\"presenceReader\"];\nconst valueReader=__m0[\"valueReader\"];\nconst __m1=__req(\"packages/core/src/compute/special.js\");\nconst studentTQuantile=__m1[\"studentTQuantile\"];\nconst studentT=__m1[\"studentT\"];\nconst normalQuantile=__m1[\"normalQuantile\"];\nconst normalCdf=__m1[\"normalCdf\"];\nconst chiSquareUpperTail=__m1[\"chiSquareUpperTail\"];\nconst __m2=__req(\"packages/core/src/compute/linalg.js\");\nconst cholesky=__m2[\"cholesky\"];\nconst choleskySolve=__m2[\"choleskySolve\"];\nconst choleskyInverse=__m2[\"choleskyInverse\"];\nconst normalEquations=__m2[\"normalEquations\"];\nconst quadForm=__m2[\"quadForm\"];\nconst __m3=__req(\"packages/core/src/compute/sketch.js\");\nconst SKETCH_BOUNDS=__m3[\"SKETCH_BOUNDS\"];\nconst KENDALL_LIMIT=5000;\nconst MAINTENANCE=Object.freeze({\nvariance:'rescan',\nvarianceP:'rescan',\nstddev:'rescan',\nstddevP:'rescan',\nsumSquares:'rescan',\nweightedAvg:'rescan',\nmedian:'rescan',\np25:'rescan',\np75:'rescan',\np90:'rescan',\np95:'rescan',\np99:'rescan',\niqr:'rescan',\nmode:'rescan',\ndistinct:'rescan',\nrange:'rescan',\nskewness:'rescan',\nkurtosis:'rescan',\ngeomean:'rescan',\nharmean:'rescan',\nmad:'rescan',\nargmin:'rescan',\nargmax:'rescan',\nhhi:'rescan',\nentropy:'rescan',\nevenness:'rescan',\ntop3Share:'rescan',\ntop10Share:'rescan',\ngini:'rescan',\ntrimmedMean:'rescan',\nwinsorizedMean:'rescan',\nrobustOutliers:'rescan',\njarqueBera:'rescan',\npassRate:'rescan',\nfailureCount:'rescan',\n});\nconst APPROXIMATE=Object.freeze({\ndistinct:Object.freeze({sketch:'HyperLogLog',bound:SKETCH_BOUNDS.distinct}),\nmedian:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.median}),\np25:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p25}),\np75:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p75}),\np90:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p90}),\np95:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p95}),\np99:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.p99}),\niqr:Object.freeze({sketch:'KLL',bound:SKETCH_BOUNDS.iqr}),\ntop3Share:Object.freeze({sketch:'SpaceSaving',bound:SKETCH_BOUNDS.topK}),\ntop10Share:Object.freeze({sketch:'SpaceSaving',bound:SKETCH_BOUNDS.topK}),\n});\nfunction maintenanceOf(fn){\nconst exact=fn==='sum'||fn==='avg'||fn==='countValues'||fn==='min'||fn==='max'\n?'maintained'\n:(Object.prototype.hasOwnProperty.call(MAINTENANCE,fn)?MAINTENANCE[fn]:null);\nconst approximate=Object.prototype.hasOwnProperty.call(APPROXIMATE,fn)?APPROXIMATE[fn]:null;\nreturn{stat:fn,exact,approximate};\n}\nfunction numbers(handle,indices){\nconst n=indices.length;\nconst out=new Float64Array(n);\nlet count=0;\nconst numeric=handle&&(handle.kind==='float64'||handle.kind==='int32');\nif(numeric){\nconst values=handle.values;\nconst present=presenceReader(handle);\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present&&present(row)!==1)continue;\nconst v=values[row];\nif(Number.isNaN(v))continue;\nout[count++]=v;\n}\nreturn out.subarray(0,count);\n}\nconst read=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nconst v=typeof raw==='number'?raw:Number(raw);\nif(!Number.isFinite(v))continue;\nout[count++]=v;\n}\nreturn out.subarray(0,count);\n}\nfunction frequencies(handle,indices){\nconst seen=new Map();\nconst read=valueReader(handle);\nlet total=0;\nfor(let i=0;i<indices.length;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nif(typeof raw==='number'&&Number.isNaN(raw))continue;\nconst key=typeof raw==='object'?String(raw):raw;\nseen.set(key,(seen.get(key)||0)+1);\ntotal++;\n}\nconst counts=[...seen.values()].sort((a,b)=>b-a);\nreturn{counts,total,distinct:counts.length};\n}\nfunction sharesOf(freq){\nreturn freq.total>0?freq.counts.map((c)=>c/freq.total):[];\n}\nfunction herfindahl(handle,indices){\nconst freq=frequencies(handle,indices);\nif(!freq.total)return null;\nlet sum=0;\nfor(const share of sharesOf(freq))sum+=share*share;\nreturn sum;\n}\nfunction entropy(handle,indices){\nconst freq=frequencies(handle,indices);\nif(!freq.total)return null;\nlet sum=0;\nfor(const share of sharesOf(freq))if(share>0)sum-=share*Math.log2(share);\nreturn sum;\n}\nfunction evenness(handle,indices){\nconst freq=frequencies(handle,indices);\nif(!freq.total||freq.distinct<2)return freq.total?1:null;\nlet sum=0;\nfor(const share of sharesOf(freq))if(share>0)sum-=share*Math.log2(share);\nreturn sum/Math.log2(freq.distinct);\n}\nfunction topShare(handle,indices,n=3){\nconst freq=frequencies(handle,indices);\nif(!freq.total)return null;\nconst take=Math.max(1,Math.floor(n));\nlet held=0;\nfor(let i=0;i<Math.min(take,freq.counts.length);i++)held+=freq.counts[i];\nreturn held/freq.total;\n}\nfunction gini(handle,indices){\nconst values=numbers(handle,indices);\nconst n=values.length;\nif(!n)return null;\nconst sorted=values.slice().sort();\nif(sorted[0]<0)return null;\nlet total=0;\nlet weighted=0;\nfor(let i=0;i<n;i++){\ntotal+=sorted[i];\nweighted+=(i+1)*sorted[i];\n}\nif(total===0)return 0;\nreturn(2*weighted)/(n*total)-(n+1)/n;\n}\nfunction moments(values){\nlet n=0;\nlet mean=0;\nlet m2=0;\nfor(let i=0;i<values.length;i++){\nconst x=values[i];\nn++;\nconst delta=x-mean;\nmean+=delta/n;\nm2+=delta*(x-mean);\n}\nreturn{n,mean,m2};\n}\nfunction quantileSorted(sorted,p){\nconst n=sorted.length;\nif(!n)return NaN;\nif(n===1)return sorted[0];\nconst h=(n-1)*Math.min(1,Math.max(0,p));\nconst lo=Math.floor(h);\nconst hi=Math.ceil(h);\nif(lo===hi)return sorted[lo];\nreturn sorted[lo]+(h-lo)*(sorted[hi]-sorted[lo]);\n}\nfunction quantile(values,p){\nif(!values.length)return NaN;\nconst sorted=values.slice().sort();\nreturn quantileSorted(sorted,p);\n}\nfunction specTally(handle,indices){\nconst read=valueReader(handle);\nlet pass=0;\nlet fail=0;\nlet warn=0;\nfor(let k=0;k<indices.length;k++){\nconst raw=read(indices[k]);\nif(raw===null||raw===undefined||raw==='')continue;\nconst token=String(raw).toUpperCase();\nif(token==='PASS')pass++;\nelse if(token==='FAIL')fail++;\nelse if(token==='WARN')warn++;\n}\nreturn{pass:pass+warn,fail,warn,judged:pass+warn+fail};\n}\nconst STAT_FNS=Object.freeze({\nhhi:(h,i)=>herfindahl(h,i),\nentropy:(h,i)=>entropy(h,i),\nevenness:(h,i)=>evenness(h,i),\ntop3Share:(h,i)=>topShare(h,i,3),\ntop10Share:(h,i)=>topShare(h,i,10),\ngini:(h,i)=>gini(h,i),\ntrimmedMean:(h,i)=>trimmedMean(numbers(h,i),0.1),\nwinsorizedMean:(h,i)=>winsorizedMean(numbers(h,i),0.1),\nrobustOutliers:(h,i)=>modifiedZOutliers(numbers(h,i),3.5),\njarqueBera:(h,i)=>jarqueBera(numbers(h,i)),\nvariance:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>1?m2/(n-1):null;\n},\nvarianceP:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>0?m2/n:null;\n},\nstddev:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>1?Math.sqrt(m2/(n-1)):null;\n},\nstddevP:(h,i)=>{\nconst{n,m2}=moments(numbers(h,i));\nreturn n>0?Math.sqrt(m2/n):null;\n},\nmedian:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.5):null;\n},\np25:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.25):null;\n},\np75:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.75):null;\n},\np90:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.9):null;\n},\np95:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.95):null;\n},\np99:(h,i)=>{\nconst values=numbers(h,i);\nreturn values.length?quantile(values,0.99):null;\n},\niqr:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nconst sorted=values.slice().sort();\nreturn quantileSorted(sorted,0.75)-quantileSorted(sorted,0.25);\n},\nmad:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nconst middle=quantile(values,0.5);\nconst deviations=new Float64Array(values.length);\nfor(let k=0;k<values.length;k++)deviations[k]=Math.abs(values[k]-middle);\nreturn quantile(deviations,0.5);\n},\nrange:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nlet lo=Infinity;\nlet hi=-Infinity;\nfor(let k=0;k<values.length;k++){\nif(values[k]<lo)lo=values[k];\nif(values[k]>hi)hi=values[k];\n}\nreturn hi-lo;\n},\ndistinct:(h,i)=>{\nconst read=valueReader(h);\nconst seen=new Set();\nfor(let k=0;k<i.length;k++){\nconst v=read(i[k]);\nif(v===null||v===undefined||v==='')continue;\nseen.add(v instanceof Date?v.getTime():v);\n}\nreturn seen.size;\n},\nmode:(h,i)=>{\nconst read=valueReader(h);\nconst counts=new Map();\nfor(let k=0;k<i.length;k++){\nconst v=read(i[k]);\nif(v===null||v===undefined||v==='')continue;\nconst id=v instanceof Date?v.getTime():v;\ncounts.set(id,(counts.get(id)||0)+1);\n}\nlet best=null;\nlet most=1;\nfor(const[value,times]of counts){\nif(times>most){\nmost=times;\nbest=value;\n}\n}\nreturn best;\n},\nskewness:(h,i)=>{\nconst values=numbers(h,i);\nconst{n,mean,m2}=moments(values);\nif(n<3||m2<=0)return null;\nconst sd=Math.sqrt(m2/(n-1));\nlet sum=0;\nfor(let k=0;k<values.length;k++)sum+=((values[k]-mean)/sd)**3;\nreturn(n/((n-1)*(n-2)))*sum;\n},\nkurtosis:(h,i)=>{\nconst values=numbers(h,i);\nconst{n,mean,m2}=moments(values);\nif(n<4||m2<=0)return null;\nconst sd=Math.sqrt(m2/(n-1));\nlet sum=0;\nfor(let k=0;k<values.length;k++)sum+=((values[k]-mean)/sd)**4;\nconst a=(n*(n+1))/((n-1)*(n-2)*(n-3));\nconst b=(3*(n-1)**2)/((n-2)*(n-3));\nreturn a*sum-b;\n},\ngeomean:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nlet sum=0;\nfor(let k=0;k<values.length;k++){\nif(values[k]<=0)return null;\nsum+=Math.log(values[k]);\n}\nreturn Math.exp(sum/values.length);\n},\nharmean:(h,i)=>{\nconst values=numbers(h,i);\nif(!values.length)return null;\nlet sum=0;\nfor(let k=0;k<values.length;k++){\nif(values[k]===0)return null;\nsum+=1/values[k];\n}\nreturn values.length/sum;\n},\nsumSquares:(h,i)=>{\nconst values=numbers(h,i);\nlet sum=0;\nfor(let k=0;k<values.length;k++)sum+=values[k]*values[k];\nreturn sum;\n},\npassRate:(h,i)=>{\nconst{pass,judged}=specTally(h,i);\nreturn judged?pass/judged:null;\n},\nfailureCount:(h,i)=>specTally(h,i).fail,\n});\nconst STAT_LABELS=Object.freeze({\nhhi:'Concentration (HHI)',\nentropy:'Entropy',\nevenness:'Evenness',\ntop3Share:'Top 3 share',\ntop10Share:'Top 10 share',\ngini:'Gini coefficient',\ntrimmedMean:'Trimmed mean',\nwinsorizedMean:'Winsorized mean',\nrobustOutliers:'Outliers (robust)',\njarqueBera:'Jarque–Bera',\nmedian:'Median',\np25:'25th percentile',\np75:'75th percentile',\np90:'90th percentile',\np95:'95th percentile',\np99:'99th percentile',\niqr:'Interquartile range',\nmad:'Median absolute deviation',\nvariance:'Variance',\nvarianceP:'Variance (population)',\nstddev:'Standard deviation',\nstddevP:'Standard deviation (population)',\nrange:'Range',\ndistinct:'Distinct',\nmode:'Mode',\nskewness:'Skewness',\nkurtosis:'Kurtosis',\ngeomean:'Geometric mean',\nharmean:'Harmonic mean',\nsumSquares:'Sum of squares',\nweightedAvg:'Weighted average',\nargmin:'Lowest by',\nargmax:'Highest by',\npassRate:'Pass rate',\nfailureCount:'Failures',\n});\nfunction weightedAverage(handle,weights,indices){\nconst readValue=valueReader(handle);\nconst readWeight=valueReader(weights);\nlet top=0;\nlet bottom=0;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst value=Number(readValue(row));\nconst weight=Number(readWeight(row));\nif(!Number.isFinite(value)||!Number.isFinite(weight))continue;\ntop+=value*weight;\nbottom+=weight;\n}\nreturn bottom===0?null:top/bottom;\n}\nfunction extremeRow(handle,indices,largest){\nconst read=valueReader(handle);\nlet best=null;\nlet bestValue=largest?-Infinity:Infinity;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst value=Number(read(row));\nif(!Number.isFinite(value))continue;\nif(largest?value>bestValue:value<bestValue){\nbestValue=value;\nbest=row;\n}\n}\nreturn best;\n}\nfunction correlation(a,b,indices){\nconst readA=valueReader(a);\nconst readB=valueReader(b);\nlet n=0;\nlet sx=0;\nlet sy=0;\nlet sxx=0;\nlet syy=0;\nlet sxy=0;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst x=Number(readA(row));\nconst y=Number(readB(row));\nif(!Number.isFinite(x)||!Number.isFinite(y))continue;\nn++;\nsx+=x;\nsy+=y;\nsxx+=x*x;\nsyy+=y*y;\nsxy+=x*y;\n}\nif(n<2)return null;\nconst top=n*sxy-sx*sy;\nconst bottom=Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));\nif(bottom===0)return null;\nconst r=top/bottom;\nreturn Math.max(-1,Math.min(1,r));\n}\nfunction trimmedMean(values,share=0.1){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values).sort((a,b)=>a-b);\nconst cut=Math.floor(n*Math.min(0.49,Math.max(0,share)));\nconst kept=sorted.slice(cut,n-cut);\nif(!kept.length)return quantileSorted(sorted,0.5);\nlet sum=0;\nfor(const v of kept)sum+=v;\nreturn sum/kept.length;\n}\nfunction winsorizedMean(values,share=0.1){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values).sort((a,b)=>a-b);\nconst cut=Math.floor(n*Math.min(0.49,Math.max(0,share)));\nconst low=sorted[cut];\nconst high=sorted[n-1-cut];\nlet sum=0;\nfor(const v of sorted)sum+=Math.min(high,Math.max(low,v));\nreturn sum/n;\n}\nfunction modifiedZOutliers(values,threshold=3.5){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values).sort((a,b)=>a-b);\nconst middle=quantileSorted(sorted,0.5);\nconst deviations=sorted.map((v)=>Math.abs(v-middle)).sort((a,b)=>a-b);\nconst mad=quantileSorted(deviations,0.5);\nif(mad===0)return null;\nlet count=0;\nfor(const v of sorted)if(Math.abs((0.6745*(v-middle))/mad)>threshold)count++;\nreturn count;\n}\nfunction jarqueBera(values){\nconst n=values.length;\nif(n<8)return null;\nlet mean=0;\nfor(const v of values)mean+=v;\nmean/=n;\nlet m2=0;\nlet m3=0;\nlet m4=0;\nfor(const v of values){\nconst d=v-mean;\nm2+=d*d;\nm3+=d*d*d;\nm4+=d*d*d*d;\n}\nm2/=n;\nm3/=n;\nm4/=n;\nif(m2===0)return null;\nconst skew=m3/m2**1.5;\nconst excess=m4/(m2*m2)-3;\nreturn(n/6)*(skew*skew+(excess*excess)/4);\n}\nfunction weightedQuantile(values,weights,p){\nconst paired=[];\nlet total=0;\nfor(let i=0;i<values.length;i++){\nconst v=Number(values[i]);\nconst w=Number(weights[i]);\nif(!Number.isFinite(v)||!Number.isFinite(w)||w<=0)continue;\npaired.push([v,w]);\ntotal+=w;\n}\nif(!paired.length||total<=0)return null;\npaired.sort((a,b)=>a[0]-b[0]);\nif(paired.length===1)return paired[0][0];\nconst at=[];\nlet seen=0;\nfor(const[,w]of paired){\nat.push((seen+w/2)/total);\nseen+=w;\n}\nconst target=Math.max(0,Math.min(1,p));\nif(target<=at[0])return paired[0][0];\nif(target>=at[at.length-1])return paired[paired.length-1][0];\nfor(let i=1;i<at.length;i++){\nif(target>at[i])continue;\nconst span=at[i]-at[i-1];\nconst within=span>0?(target-at[i-1])/span:0;\nreturn paired[i-1][0]+(paired[i][0]-paired[i-1][0])*within;\n}\nreturn paired[paired.length-1][0];\n}\nfunction pairs(a,b,indices){\nconst readA=valueReader(a);\nconst readB=valueReader(b);\nconst xs=new Float64Array(indices.length);\nconst ys=new Float64Array(indices.length);\nlet n=0;\nfor(let i=0;i<indices.length;i++){\nconst row=indices[i];\nconst x=Number(readA(row));\nconst y=Number(readB(row));\nif(!Number.isFinite(x)||!Number.isFinite(y))continue;\nxs[n]=x;\nys[n]=y;\nn++;\n}\nreturn{xs:xs.subarray(0,n),ys:ys.subarray(0,n),n};\n}\nfunction covariance(a,b,indices,population=false){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2)return null;\nlet mx=0;\nlet my=0;\nfor(let i=0;i<n;i++){mx+=xs[i];my+=ys[i];}\nmx/=n;\nmy/=n;\nlet sum=0;\nfor(let i=0;i<n;i++)sum+=(xs[i]-mx)*(ys[i]-my);\nreturn sum/(population?n:n-1);\n}\nfunction regression(a,b,indices){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2)return null;\nlet mx=0;\nlet my=0;\nfor(let i=0;i<n;i++){mx+=xs[i];my+=ys[i];}\nmx/=n;\nmy/=n;\nlet sxx=0;\nlet sxy=0;\nlet syy=0;\nfor(let i=0;i<n;i++){\nconst dx=xs[i]-mx;\nconst dy=ys[i]-my;\nsxx+=dx*dx;\nsxy+=dx*dy;\nsyy+=dy*dy;\n}\nif(sxx===0)return null;\nconst slope=sxy/sxx;\nconst intercept=my-slope*mx;\nconst r2=syy===0?1:Math.max(0,Math.min(1,(sxy*sxy)/(sxx*syy)));\nconst residual=Math.max(0,syy-slope*sxy);\nconst stdError=n>2?Math.sqrt(residual/(n-2)/sxx):0;\nreturn{slope,intercept,r2,stdError,n};\n}\nconst SUPPORTED_METHODS=new Set(['ols','wls','robust']);\nconst DEFERRED_METHODS=new Set(['quantile']);\nconst OUT_OF_SCOPE_METHODS=new Set(['ridge','lasso','elasticnet','mixed','gls']);\nconst HUBER_C=1.345;\nfunction solveWls(design,y,w){\nconst{xtwx,xtwy}=normalEquations(design,y,w);\nconst l=cholesky(xtwx);\nif(!l)return null;\nconst beta=choleskySolve(l,xtwy);\nconst cov=choleskyInverse(l);\nconst fitted=matVecRows(design,beta);\nconst residuals=y.map((yi,i)=>yi-fitted[i]);\nreturn{beta,cov,fitted,residuals};\n}\nfunction matVecRows(rows,v){\nreturn rows.map((row)=>row.reduce((sum,cell,j)=>sum+cell*v[j],0));\n}\nfunction auxiliaryR2(predictors,j){\nconst n=predictors.length;\nconst y=predictors.map((row)=>row[j]);\nconst design=predictors.map((row)=>[1,...row.filter((unused,c)=>c!==j)]);\nconst fit=solveWls(design,y,null);\nif(!fit)return 1;\nconst ybar=y.reduce((s,v)=>s+v,0)/n;\nlet rss=0;\nlet tss=0;\nfor(let i=0;i<n;i++){rss+=fit.residuals[i]**2;tss+=(y[i]-ybar)**2;}\nif(tss===0)return 1;\nreturn Math.max(0,Math.min(1,1-rss/tss));\n}\nfunction madScale(values){\nconst sorted=[...values].sort((a,b)=>a-b);\nconst med=medianOfSorted(sorted);\nconst dev=values.map((v)=>Math.abs(v-med)).sort((a,b)=>a-b);\nreturn medianOfSorted(dev)/0.6745;\n}\nfunction medianOfSorted(sorted){\nconst n=sorted.length;\nif(!n)return 0;\nconst mid=Math.floor(n/2);\nreturn n%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;\n}\nfunction fitLinearModel(matrix,y,opts={}){\nconst method=opts.method||'ols';\nif(OUT_OF_SCOPE_METHODS.has(method)){\nthrow new Error(`[lattice] regression method \"${method}\" is out of scope; use ols, wls or robust.`);\n}\nif(DEFERRED_METHODS.has(method)){\nthrow new Error(`[lattice] quantile regression is coming next and not yet available; use ols, wls or robust.`);\n}\nif(!SUPPORTED_METHODS.has(method)){\nthrow new Error(`[lattice] unknown regression method \"${method}\"; use ols, wls or robust.`);\n}\nconst n=Array.isArray(y)?y.length:0;\nconst k=n&&Array.isArray(matrix[0])?matrix[0].length:0;\nconst p=k+1;\nif(!(n>p))return null;\nfor(let i=0;i<n;i++){\nif(!Number.isFinite(y[i]))return null;\nif(!Array.isArray(matrix[i])||matrix[i].length!==k)return null;\nfor(let j=0;j<k;j++)if(!Number.isFinite(matrix[i][j]))return null;\n}\nlet weights=null;\nif(method==='wls'){\nweights=opts.weights;\nif(!Array.isArray(weights)||weights.length!==n)return null;\nfor(let i=0;i<n;i++)if(!(weights[i]>0)||!Number.isFinite(weights[i]))return null;\n}\nconst design=matrix.map((row)=>[1,...row]);\nlet fit;\nlet robustWeights=null;\nif(method==='robust'){\nfit=solveWls(design,y,null);\nif(!fit)return null;\nfor(let iter=0;iter<50;iter++){\nconst scale=madScale(fit.residuals);\nif(!(scale>0))break;\nconst w=fit.residuals.map((r)=>{\nconst u=Math.abs(r/scale);\nreturn u<=HUBER_C?1:HUBER_C/u;\n});\nconst next=solveWls(design,y,w);\nif(!next)return null;\nconst moved=next.beta.reduce((m,b,j)=>Math.max(m,Math.abs(b-fit.beta[j])),0);\nfit=next;\nrobustWeights=w;\nif(moved<1e-10)break;\n}\n}else{\nfit=solveWls(design,y,weights);\nif(!fit)return null;\n}\nconst w=method==='robust'?robustWeights:weights;\nconst{beta,cov,fitted,residuals}=fit;\nlet rss=0;\nlet sw=0;\nlet swy=0;\nfor(let i=0;i<n;i++){\nconst wi=w?w[i]:1;\nrss+=wi*residuals[i]**2;\nsw+=wi;\nswy+=wi*y[i];\n}\nconst ybar=swy/sw;\nlet tss=0;\nfor(let i=0;i<n;i++){const wi=w?w[i]:1;tss+=wi*(y[i]-ybar)**2;}\nconst df=n-p;\nconst sigma2=rss/df;\nconst r2=tss===0?1:Math.max(0,Math.min(1,1-rss/tss));\nconst adjR2=1-(1-r2)*(n-1)/df;\nconst names=Array.isArray(opts.names)&&opts.names.length===k\n?opts.names:matrix[0].map((unused,j)=>`x${j+1}`);\nconst conf=level(opts.confidence);\nconst tCrit=df>0?studentTQuantile(1-(1-conf)/2,df):Infinity;\nconst coefficients=beta.map((estimate,j)=>{\nconst stdError=Math.sqrt(Math.max(0,sigma2*cov[j][j]));\nconst t=stdError>0?estimate/stdError:(estimate===0?0:Infinity);\nconst pv=Number.isFinite(t)?2*(1-studentT(Math.abs(t),df)):0;\nconst half=Number.isFinite(tCrit)?tCrit*stdError:null;\nreturn{\nname:j===0?'(intercept)':names[j-1],\nestimate,\nstdError,\nt,\np:Math.max(0,Math.min(1,pv)),\nlower:half===null?null:estimate-half,\nupper:half===null?null:estimate+half,\n};\n});\nconst leverage=new Array(n);\nconst cooksD=new Array(n);\nfor(let i=0;i<n;i++){\nconst wi=w?w[i]:1;\nconst h=Math.max(0,Math.min(1,wi*quadForm(design[i],cov)));\nleverage[i]=h;\nconst denom=(1-h)**2;\ncooksD[i]=(denom>0&&sigma2>0)\n?(residuals[i]**2/(p*sigma2))*(h/denom)\n:null;\n}\nconst vif=matrix[0].map((unused,j)=>{\nif(k<2)return 1;\nconst rj=auxiliaryR2(matrix,j);\nreturn rj>=1?Infinity:1/(1-rj);\n});\nlet hetero=null;\n{\nconst e2=residuals.map((r)=>r*r);\nconst aux=solveWls(design,e2,null);\nif(aux){\nconst e2bar=e2.reduce((s,v)=>s+v,0)/n;\nlet arss=0;\nlet atss=0;\nfor(let i=0;i<n;i++){arss+=aux.residuals[i]**2;atss+=(e2[i]-e2bar)**2;}\nconst auxR2=atss===0?0:Math.max(0,Math.min(1,1-arss/atss));\nconst statistic=n*auxR2;\nconst pv=chiSquareUpperTail(statistic,k);\nhetero={statistic,df:k,p:pv,heteroscedastic:pv<0.05};\n}\n}\nlet band=null;\nif(k===1){\nconst order=matrix.map((row,i)=>i).sort((i,j)=>matrix[i][0]-matrix[j][0]);\nband={\nconfidence:conf,\npoints:order.map((i)=>{\nconst xo=design[i];\nconst se=Math.sqrt(Math.max(0,sigma2*quadForm(xo,cov)));\nreturn{x:matrix[i][0],yhat:fitted[i],lower:fitted[i]-tCrit*se,upper:fitted[i]+tCrit*se};\n}),\n};\n}\nreturn{\nmethod,\ncoefficients,\nr2,\nadjR2,\nn,\ndf,\nsigma2,\nfitted,\nresiduals,\nleverage,\ncooksD,\nvif,\nheteroscedasticity:hetero,\nband,\nweights:w?[...w]:null,\n};\n}\nfunction ranksOf(values){\nconst n=values.length;\nconst order=Array.from({length:n},(unused,i)=>i)\n.sort((i,j)=>values[i]-values[j]);\nconst ranks=new Float64Array(n);\nlet i=0;\nwhile(i<n){\nlet j=i;\nwhile(j+1<n&&values[order[j+1]]===values[order[i]])j++;\nconst shared=(i+j)/2+1;\nfor(let k=i;k<=j;k++)ranks[order[k]]=shared;\ni=j+1;\n}\nreturn ranks;\n}\nconst ADF_CT_CRITICAL=Object.freeze({'1%':-3.9638,'5%':-3.4126,'10%':-3.1279});\nfunction adfInterpolatedP(stat){\nconst levels=[0.01,0.05,0.10];\nconst crit=[ADF_CT_CRITICAL['1%'],ADF_CT_CRITICAL['5%'],ADF_CT_CRITICAL['10%']];\nif(stat<=crit[0]){\nconst slope=(Math.log(levels[1])-Math.log(levels[0]))/(crit[1]-crit[0]);\nreturn Math.max(1e-4,Math.min(0.01,Math.exp(Math.log(levels[0])+slope*(stat-crit[0]))));\n}\nif(stat>=crit[2]){\nconst slope=(Math.log(levels[2])-Math.log(levels[1]))/(crit[2]-crit[1]);\nreturn Math.max(0.10,Math.min(0.999,Math.exp(Math.log(levels[2])+slope*(stat-crit[2]))));\n}\nconst i=stat<crit[1]?0:1;\nconst t=(stat-crit[i])/(crit[i+1]-crit[i]);\nreturn Math.exp(Math.log(levels[i])+t*(Math.log(levels[i+1])-Math.log(levels[i])));\n}\nfunction augmentedDickeyFuller(x,opts={}){\nconst series=[];\nfor(let i=0;i<x.length;i++){\nconst v=Number(x[i]);\nif(Number.isFinite(v))series.push(v);\n}\nconst n=series.length;\nconst m=n-1;\nif(n<8||m<6)return null;\nconst xdiff=new Array(m);\nfor(let i=0;i<m;i++)xdiff[i]=series[i+1]-series[i];\nlet maxlag=Number.isFinite(opts.maxlag)\n?Math.floor(opts.maxlag)\n:Math.ceil(12*(n/100)**0.25);\nmaxlag=Math.max(0,Math.min(maxlag,Math.floor((m-5)/2)));\nconst fit=(p,start)=>{\nconst rows=[];\nconst y=[];\nfor(let j=start;j<m;j++){\nconst row=[(j-start)+1,series[j]];\nfor(let d=1;d<=p;d++)row.push(xdiff[j-d]);\nrows.push(row);\ny.push(xdiff[j]);\n}\nreturn fitLinearModel(rows,y,{method:'ols'});\n};\nconst nFixed=m-maxlag;\nlet bestLag=0;\nlet bestAic=Infinity;\nfor(let p=0;p<=maxlag;p++){\nconst model=fit(p,maxlag);\nif(!model)continue;\nconst params=p+3;\nconst rss=model.sigma2*(nFixed-params);\nif(!(rss>0))continue;\nconst aic=nFixed*Math.log(rss/nFixed)+2*params;\nif(aic<bestAic){bestAic=aic;bestLag=p;}\n}\nconst finalModel=fit(bestLag,bestLag);\nif(!finalModel||!finalModel.coefficients[2])return null;\nconst statistic=finalModel.coefficients[2].t;\nconst pValue=adfInterpolatedP(statistic);\nconst stationary=statistic<ADF_CT_CRITICAL['5%'];\nreturn{\nstatistic,\nusedLag:bestLag,\nnobs:m-bestLag,\ncriticalValues:{...ADF_CT_CRITICAL},\npValue,\npApproximate:true,\nstationary,\nverdict:stationary?'stationary':'non-stationary',\nregression:'ct',\n};\n}\nfunction autocorrelations(x,opts={}){\nconst y=[];\nfor(let i=0;i<x.length;i++){\nconst v=Number(x[i]);\nif(Number.isFinite(v))y.push(v);\n}\nconst n=y.length;\nif(n<3)return null;\nlet maxlag=Number.isFinite(opts.maxlag)?Math.floor(opts.maxlag):Math.min(10,n-1);\nmaxlag=Math.max(1,Math.min(maxlag,n-1));\nlet mean=0;\nfor(const v of y)mean+=v;\nmean/=n;\nconst dev=y.map((v)=>v-mean);\nlet c0=0;\nfor(const d of dev)c0+=d*d;\nc0/=n;\nconst acf=new Array(maxlag+1).fill(0);\nacf[0]=1;\nfor(let k=1;k<=maxlag;k++){\nlet s=0;\nfor(let t=k;t<n;t++)s+=dev[t]*dev[t-k];\nacf[k]=c0>0?(s/n)/c0:0;\n}\nconst pacf=new Array(maxlag+1).fill(0);\npacf[0]=1;\nlet prev=[];\nfor(let k=1;k<=maxlag;k++){\nlet num=acf[k];\nfor(let j=1;j<k;j++)num-=prev[j-1]*acf[k-j];\nlet den=1;\nfor(let j=1;j<k;j++)den-=prev[j-1]*acf[j];\nconst phikk=den!==0?num/den:0;\nconst cur=new Array(k);\nfor(let j=1;j<k;j++)cur[j-1]=prev[j-1]-phikk*prev[k-1-j];\ncur[k-1]=phikk;\npacf[k]=phikk;\nprev=cur;\n}\nconst bound=1.96/Math.sqrt(n);\nreturn{acf,pacf,bounds:{upper:bound,lower:-bound},n,nlags:maxlag,approximate:true};\n}\nfunction spearman(a,b,indices){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2)return null;\nconst rx=ranksOf(xs);\nconst ry=ranksOf(ys);\nlet mx=0;\nlet my=0;\nfor(let i=0;i<n;i++){mx+=rx[i];my+=ry[i];}\nmx/=n;\nmy/=n;\nlet sxy=0;\nlet sxx=0;\nlet syy=0;\nfor(let i=0;i<n;i++){\nconst dx=rx[i]-mx;\nconst dy=ry[i]-my;\nsxy+=dx*dy;\nsxx+=dx*dx;\nsyy+=dy*dy;\n}\nif(sxx===0||syy===0)return null;\nreturn Math.max(-1,Math.min(1,sxy/Math.sqrt(sxx*syy)));\n}\nfunction kendall(a,b,indices){\nconst{xs,ys,n}=pairs(a,b,indices);\nif(n<2||n>KENDALL_LIMIT)return null;\nlet concordant=0;\nlet discordant=0;\nlet tiedXOnly=0;\nlet tiedYOnly=0;\nfor(let i=0;i<n;i++){\nfor(let j=i+1;j<n;j++){\nconst dx=Math.sign(xs[i]-xs[j]);\nconst dy=Math.sign(ys[i]-ys[j]);\nconst product=dx*dy;\nif(product>0)concordant++;\nelse if(product<0)discordant++;\nelse if(dx===0&&dy===0){}\nelse if(dx===0)tiedXOnly++;\nelse tiedYOnly++;\n}\n}\nconst orderedByX=concordant+discordant+tiedYOnly;\nconst orderedByY=concordant+discordant+tiedXOnly;\nif(orderedByX===0||orderedByY===0)return null;\nreturn(concordant-discordant)/Math.sqrt(orderedByX*orderedByY);\n}\nfunction seriesStats(ordered,opts={}){\nconst n=ordered.length;\nif(n<2)return null;\nconst first=ordered[0];\nconst last=ordered[n-1];\nconst returns=[];\nfor(let i=1;i<n;i++){\nconst previous=ordered[i-1];\nif(previous===0)continue;\nreturns.push((ordered[i]-previous)/Math.abs(previous));\n}\nlet volatility=null;\nif(returns.length>1){\nlet mean=0;\nfor(const r of returns)mean+=r;\nmean/=returns.length;\nlet m2=0;\nfor(const r of returns)m2+=(r-mean)**2;\nvolatility=Math.sqrt(m2/(returns.length-1));\n}\nconst periods=Number(opts.periodsPerYear)>0?Number(opts.periodsPerYear):null;\nlet peak=ordered[0];\nlet peakAt=0;\nlet worst=0;\nlet worstFrom=0;\nlet worstTo=0;\nfor(let i=1;i<n;i++){\nif(ordered[i]>peak){peak=ordered[i];peakAt=i;continue;}\nif(peak<=0)continue;\nconst fall=(peak-ordered[i])/peak;\nif(fall>worst){worst=fall;worstFrom=peakAt;worstTo=i;}\n}\nlet autocorrelation=null;\nif(n>2){\nlet mean=0;\nfor(let i=0;i<n;i++)mean+=ordered[i];\nmean/=n;\nlet top=0;\nlet bottom=0;\nfor(let i=0;i<n;i++){\nconst d=ordered[i]-mean;\nbottom+=d*d;\nif(i>0)top+=d*(ordered[i-1]-mean);\n}\nautocorrelation=bottom>0?top/bottom:null;\n}\nlet up=0;\nlet down=0;\nfor(const r of returns){if(r>0)up++;else if(r<0)down++;}\nlet growth=null;\nif(first>0&&last>0){\nconst perPeriod=(last/first)**(1/(n-1))-1;\ngrowth=periods?(1+perPeriod)**periods-1:perPeriod;\n}\nreturn{\nn,\nfirst,\nlast,\nchange:last-first,\nchangePercent:first===0?null:((last-first)/Math.abs(first))*100,\nvolatility,\nannualisedVolatility:volatility!==null&&periods?volatility*Math.sqrt(periods):null,\ngrowth,\nmaxDrawdown:worst,\nmaxDrawdownFrom:worstFrom,\nmaxDrawdownTo:worstTo,\nautocorrelation,\nupDays:up,\ndownDays:down,\n};\n}\nconst D2_N2=1.128;\nconst D4_N2=3.267;\nfunction movingRanges(ordered){\nconst n=ordered.length;\nif(n<2)return null;\nconst ranges=[];\nfor(let i=1;i<n;i++)ranges.push(Math.abs(ordered[i]-ordered[i-1]));\nconst centre=ranges.reduce((t,r)=>t+r,0)/ranges.length;\nreturn{ranges,centre,upper:D4_N2*centre,lower:0};\n}\nfunction withinSigma(ordered){\nconst n=ordered.length;\nif(n<2)return null;\nlet total=0;\nfor(let i=1;i<n;i++)total+=Math.abs(ordered[i]-ordered[i-1]);\nconst meanRange=total/(n-1);\nreturn{sigma:meanRange/D2_N2,meanRange};\n}\nfunction capability(ordered,spec){\nconst n=ordered.length;\nif(n<2||!spec)return null;\nconst lower=Number.isFinite(Number(spec.lower))?Number(spec.lower):null;\nconst upper=Number.isFinite(Number(spec.upper))?Number(spec.upper):null;\nif(lower===null&&upper===null)return null;\nlet mean=0;\nfor(let i=0;i<n;i++)mean+=ordered[i];\nmean/=n;\nlet m2=0;\nfor(let i=0;i<n;i++)m2+=(ordered[i]-mean)**2;\nconst overall=Math.sqrt(m2/(n-1));\nconst within=withinSigma(ordered);\nconst sigmaWithin=within?within.sigma:null;\nconst indices=(sigma)=>{\nif(!sigma||sigma<=0)return{index:null,k:null};\nconst both=lower!==null&&upper!==null;\nconst index=both?(upper-lower)/(6*sigma):null;\nconst upperSide=upper!==null?(upper-mean)/(3*sigma):Infinity;\nconst lowerSide=lower!==null?(mean-lower)/(3*sigma):Infinity;\nreturn{index,k:Math.min(upperSide,lowerSide)};\n};\nconst short=indices(sigmaWithin);\nconst long=indices(overall);\nlet outOfSpec=0;\nfor(let i=0;i<n;i++){\nif(lower!==null&&ordered[i]<lower){outOfSpec++;continue;}\nif(upper!==null&&ordered[i]>upper)outOfSpec++;\n}\nreturn{\nn,\nmean,\nlower,\nupper,\ntarget:Number.isFinite(Number(spec.target))?Number(spec.target):null,\nsigmaWithin,\nsigmaOverall:overall,\ncp:short.index,\ncpk:short.k,\npp:long.index,\nppk:long.k,\noutOfSpec,\ndefectRate:n?outOfSpec/n:null,\n};\n}\nfunction controlLimits(ordered){\nconst n=ordered.length;\nif(n<2)return null;\nconst within=withinSigma(ordered);\nif(!within||!(within.sigma>0))return null;\nlet centre=0;\nfor(let i=0;i<n;i++)centre+=ordered[i];\ncentre/=n;\nreturn{\ncentre,\nsigma:within.sigma,\nupper:centre+3*within.sigma,\nlower:centre-3*within.sigma,\n};\n}\nfunction westernElectricViolations(ordered,limits){\nif(!limits||!(limits.sigma>0))return[];\nconst n=ordered.length;\nconst{centre,sigma}=limits;\nconst z=(i)=>(ordered[i]-centre)/sigma;\nconst out=[];\nfor(let i=0;i<n;i++){\nif(Math.abs(z(i))>3){\nout.push({index:i,rule:1,description:'beyond three sigma'});\n}\nif(i>=2){\nfor(const side of[1,-1]){\nlet hits=0;\nfor(let k=i-2;k<=i;k++)if(z(k)*side>2)hits++;\nif(hits>=2){\nout.push({index:i,rule:2,description:'two of three past two sigma'});\nbreak;\n}\n}\n}\nif(i>=4){\nfor(const side of[1,-1]){\nlet hits=0;\nfor(let k=i-4;k<=i;k++)if(z(k)*side>1)hits++;\nif(hits>=4){\nout.push({index:i,rule:3,description:'four of five past one sigma'});\nbreak;\n}\n}\n}\nif(i>=7){\nfor(const side of[1,-1]){\nlet all=true;\nfor(let k=i-7;k<=i;k++)if(z(k)*side<=0){all=false;break;}\nif(all){\nout.push({index:i,rule:4,description:'eight in a row on one side'});\nbreak;\n}\n}\n}\n}\nreturn out;\n}\nfunction nelsonViolations(ordered,limits){\nif(!limits||!(limits.sigma>0))return[];\nconst n=ordered.length;\nconst{centre,sigma}=limits;\nconst z=(i)=>(ordered[i]-centre)/sigma;\nconst oneSide=(from,to,past,need)=>{\nfor(const side of[1,-1]){\nlet hits=0;\nfor(let k=from;k<=to;k++)if(z(k)*side>past)hits++;\nif(hits>=need)return true;\n}\nreturn false;\n};\nconst out=[];\nfor(let i=0;i<n;i++){\nif(Math.abs(z(i))>3)out.push({index:i,rule:1,description:'beyond three sigma'});\nif(i>=8){\nfor(const side of[1,-1]){\nlet all=true;\nfor(let k=i-8;k<=i;k++)if(z(k)*side<=0){all=false;break;}\nif(all){out.push({index:i,rule:2,description:'nine in a row on one side'});break;}\n}\n}\nif(i>=5){\nfor(const dir of[1,-1]){\nlet all=true;\nfor(let k=i-4;k<=i;k++){\nif((ordered[k]-ordered[k-1])*dir<=0){all=false;break;}\n}\nif(all){\nout.push({index:i,rule:3,description:dir>0?'six rising':'six falling'});\nbreak;\n}\n}\n}\nif(i>=13){\nlet alternating=true;\nfor(let k=i-12;k<=i;k++){\nconst a=ordered[k]-ordered[k-1];\nconst b=ordered[k+1<=i?k+1:k]-ordered[k];\nif(k+1>i)break;\nif(a===0||b===0||(a>0)===(b>0)){alternating=false;break;}\n}\nif(alternating)out.push({index:i,rule:4,description:'fourteen alternating'});\n}\nif(i>=2&&oneSide(i-2,i,2,2)){\nout.push({index:i,rule:5,description:'two of three past two sigma'});\n}\nif(i>=4&&oneSide(i-4,i,1,4)){\nout.push({index:i,rule:6,description:'four of five past one sigma'});\n}\nif(i>=14){\nlet inside=true;\nfor(let k=i-14;k<=i;k++)if(Math.abs(z(k))>=1){inside=false;break;}\nif(inside)out.push({index:i,rule:7,description:'fifteen within one sigma'});\n}\nif(i>=7){\nlet outside=true;\nfor(let k=i-7;k<=i;k++)if(Math.abs(z(k))<=1){outside=false;break;}\nif(outside)out.push({index:i,rule:8,description:'eight beyond one sigma'});\n}\n}\nreturn out;\n}\nconst CONTROL_RULE_SETS=Object.freeze(['westernElectric','nelson']);\nfunction controlViolations(ordered,limits,ruleSet='westernElectric'){\nreturn String(ruleSet)==='nelson'\n?nelsonViolations(ordered,limits)\n:westernElectricViolations(ordered,limits);\n}\nfunction countOutside(values,low,high){\nlet count=0;\nfor(let i=0;i<values.length;i++){\nif(values[i]<low||values[i]>high)count++;\n}\nreturn count;\n}\nfunction histogram(sorted,q1,q3,cap=20){\nconst n=sorted.length;\nif(!n)return[];\nconst min=sorted[0];\nconst max=sorted[n-1];\nif(max===min)return[{from:min,to:max,count:n}];\nconst iqr=q3-q1;\nconst fence=1.5*iqr;\nlet lo=iqr>0?Math.max(min,q1-fence):min;\nlet hi=iqr>0?Math.min(max,q3+fence):max;\nif(!(hi>lo)){lo=min;hi=max;}\nconst width=iqr>0?(2*iqr)/Math.cbrt(n):(hi-lo)/(Math.ceil(Math.log2(n))+1);\nconst count=width>0\n?Math.min(cap,Math.max(1,Math.ceil((hi-lo)/width)))\n:1;\nconst step=(hi-lo)/count;\nconst bins=[];\nfor(let i=0;i<count;i++){\nbins.push({from:lo+i*step,to:lo+(i+1)*step,count:0});\n}\nfor(let i=0;i<n;i++){\nconst at=Math.min(count-1,Math.max(0,Math.floor((sorted[i]-lo)/step)));\nbins[at].count++;\n}\nbins[0].from=min;\nbins[count-1].to=max;\nreturn bins;\n}\nconst DEFAULT_CONFIDENCE=0.95;\nfunction level(conf){\nconst c=Number(conf);\nreturn Number.isFinite(c)&&c>0&&c<1?c:DEFAULT_CONFIDENCE;\n}\nfunction meanInterval(values,conf=DEFAULT_CONFIDENCE){\nconst n=values.length;\nif(n<2)return null;\nlet sum=0;\nfor(let i=0;i<n;i++)sum+=values[i];\nconst mean=sum/n;\nlet ss=0;\nfor(let i=0;i<n;i++){const d=values[i]-mean;ss+=d*d;}\nconst sd=Math.sqrt(ss/(n-1));\nconst c=level(conf);\nconst t=studentTQuantile(1-(1-c)/2,n-1);\nconst margin=(t*sd)/Math.sqrt(n);\nreturn{mean,lower:mean-margin,upper:mean+margin,margin,n,confidence:c};\n}\nfunction proportionInterval(successes,n,conf=DEFAULT_CONFIDENCE){\nconst k=Number(successes);\nconst total=Number(n);\nif(!(total>0)||!(k>=0)||k>total)return null;\nconst c=level(conf);\nconst z=normalQuantile(1-(1-c)/2);\nconst p=k/total;\nconst z2=z*z;\nconst denominator=1+z2/total;\nconst centre=(p+z2/(2*total))/denominator;\nconst half=(z/denominator)\n*Math.sqrt((p*(1-p))/total+z2/(4*total*total));\nreturn{\nproportion:p,\nlower:Math.max(0,centre-half),\nupper:Math.min(1,centre+half),\nn:total,\nconfidence:c,\n};\n}\nfunction slopeInterval(fit,conf=DEFAULT_CONFIDENCE){\nif(!fit||!(fit.n>2)||!Number.isFinite(fit.stdError))return null;\nconst c=level(conf);\nconst t=studentTQuantile(1-(1-c)/2,fit.n-2);\nconst margin=t*fit.stdError;\nreturn{\nslope:fit.slope,\nlower:fit.slope-margin,\nupper:fit.slope+margin,\nmargin,\nconfidence:c,\n};\n}\nfunction capabilityInterval(index,n,conf=DEFAULT_CONFIDENCE){\nconst k=Number(index);\nconst count=Number(n);\nif(!Number.isFinite(k)||!(count>1))return null;\nconst c=level(conf);\nconst z=normalQuantile(1-(1-c)/2);\nconst margin=z*Math.sqrt(1/(9*count)+(k*k)/(2*(count-1)));\nreturn{index:k,lower:k-margin,upper:k+margin,margin,n:count,confidence:c};\n}\nfunction standardizedMeanDifference(population,subsetMean){\nif(!population||!(population.sd>0))return null;\nif(!Number.isFinite(subsetMean)||!Number.isFinite(population.mean))return null;\nreturn(subsetMean-population.mean)/population.sd;\n}\nfunction normalTotalVariation(d){\nif(!Number.isFinite(d))return 0;\nreturn Math.min(1,Math.max(0,2*normalCdf(Math.abs(d)/2)-1));\n}\nfunction frequencyMap(handle,indices){\nconst map=new Map();\nconst read=valueReader(handle);\nlet total=0;\nfor(let i=0;i<indices.length;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nif(typeof raw==='number'&&Number.isNaN(raw))continue;\nconst key=raw instanceof Date?raw.getTime()\n:(typeof raw==='object'?String(raw):raw);\nmap.set(key,(map.get(key)||0)+1);\ntotal++;\n}\nreturn{map,total};\n}\nfunction categoricalDistance(subset,subsetTotal,population,populationTotal){\nif(!(subsetTotal>0)||!(populationTotal>0))return null;\nlet sum=0;\nconst keys=new Set(subset.keys());\nfor(const k of population.keys())keys.add(k);\nfor(const k of keys){\nconst a=(subset.get(k)||0)/subsetTotal;\nconst b=(population.get(k)||0)/populationTotal;\nsum+=Math.abs(a-b);\n}\nreturn sum/2;\n}\nconst SUBSET_RELIABILITY_FLOOR=10;\nfunction compareColumn(handle,subsetIndices,populationStats){\nconst numeric=populationStats&&populationStats.numeric;\nif(numeric){\nconst values=numbers(handle,subsetIndices);\nconst{n,mean}=moments(values);\nconst d=n>0\n?standardizedMeanDifference(\n{mean:populationStats.mean,sd:populationStats.sd},mean,\n)\n:null;\nreturn{\nmeasure:'standardizedMeanDifference',\nmagnitude:d,\ndistance:d===null?0:normalTotalVariation(d),\ndirection:d===null?0:Math.sign(d),\nsubsetN:n,\npopulationN:populationStats.n||0,\nreliable:n>=SUBSET_RELIABILITY_FLOOR,\n};\n}\nconst{map,total}=frequencyMap(handle,subsetIndices);\nconst tvd=categoricalDistance(map,total,populationStats.map,populationStats.total);\nreturn{\nmeasure:'categoricalTotalVariation',\nmagnitude:tvd,\ndistance:tvd===null?0:tvd,\ndirection:0,\nsubsetN:total,\npopulationN:populationStats.total||0,\nreliable:total>=SUBSET_RELIABILITY_FLOOR,\n};\n}\nfunction isNumericColumn(handle,indices){\nif(handle&&(handle.kind==='float64'||handle.kind==='int32'))return true;\nconst read=valueReader(handle);\nlet seen=0;\nlet numeric=0;\nfor(let i=0;i<indices.length&&seen<200;i++){\nconst raw=read(indices[i]);\nif(raw===null||raw===undefined||raw==='')continue;\nif(raw instanceof Date)return false;\nseen++;\nconst v=typeof raw==='number'?raw:Number(raw);\nif(Number.isFinite(v))numeric++;\n}\nif(seen===0)return false;\nreturn numeric/seen>=0.9;\n}\nfunction populationRead(handle,populationIndices){\nif(isNumericColumn(handle,populationIndices)){\nconst values=numbers(handle,populationIndices);\nconst{n,mean,m2}=moments(values);\nreturn{numeric:true,mean,sd:n>0?Math.sqrt(m2/n):0,n};\n}\nconst{map,total}=frequencyMap(handle,populationIndices);\nreturn{numeric:false,map,total};\n}\n});\n__def(\"packages/core/src/compute/total.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"TOTAL_FNS\",{enumerable:true,get:function(){return TOTAL_FNS;}});\nObject.defineProperty(__exports,\"TOTAL_LABELS\",{enumerable:true,get:function(){return TOTAL_LABELS;}});\nObject.defineProperty(__exports,\"totalLabel\",{enumerable:true,get:function(){return totalLabel;}});\nObject.defineProperty(__exports,\"aggregatesFor\",{enumerable:true,get:function(){return aggregatesFor;}});\nObject.defineProperty(__exports,\"aggregateAllowed\",{enumerable:true,get:function(){return aggregateAllowed;}});\nObject.defineProperty(__exports,\"collectValues\",{enumerable:true,get:function(){return collectValues;}});\nObject.defineProperty(__exports,\"total\",{enumerable:true,get:function(){return total;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst isFunction=__m0[\"isFunction\"];\nconst warnOnce=__m0[\"warnOnce\"];\nconst __m1=__req(\"packages/core/src/compute/handle.js\");\nconst presenceReader=__m1[\"presenceReader\"];\nconst valueComparator=__m1[\"valueComparator\"];\nconst valueReader=__m1[\"valueReader\"];\nconst __m2=__req(\"packages/core/src/compute/statistics.js\");\nconst STAT_FNS=__m2[\"STAT_FNS\"];\nconst STAT_LABELS=__m2[\"STAT_LABELS\"];\nfunction isNumericBacking(handle){\nreturn!!handle&&(handle.kind==='float64'||handle.kind==='int32');\n}\nfunction sum(handle,indices){\nconst n=indices.length;\nlet acc=0;\nif(isNumericBacking(handle)){\nconst values=handle.values;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<n;i++){\nconst v=values[indices[i]];\nif(!Number.isNaN(v))acc+=v;\n}\nreturn acc;\n}\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present(row)===1){\nconst v=values[row];\nif(!Number.isNaN(v))acc+=v;\n}\n}\nreturn acc;\n}\nconst read=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst v=numberOf(read(indices[i]));\nif(v!==null)acc+=v;\n}\nreturn acc;\n}\nsum.kernel=true;\nfunction countValues(handle,indices){\nconst n=indices.length;\nlet count=0;\nif(isNumericBacking(handle)){\nconst values=handle.values;\nconst present=presenceReader(handle);\nif(!present){\nfor(let i=0;i<n;i++)if(!Number.isNaN(values[indices[i]]))count++;\nreturn count;\n}\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present(row)===1&&!Number.isNaN(values[row]))count++;\n}\nreturn count;\n}\nconst read=valueReader(handle);\nfor(let i=0;i<n;i++){\nconst v=read(indices[i]);\nif(v!==null&&v!==undefined&&!(typeof v==='number'&&Number.isNaN(v)))count++;\n}\nreturn count;\n}\ncountValues.kernel=true;\nfunction count(handle,indices){\nreturn indices.length;\n}\ncount.kernel=true;\nfunction avg(handle,indices){\nconst values=countValues(handle,indices);\nif(values===0)return null;\nreturn sum(handle,indices)/values;\n}\navg.kernel=true;\nfunction extreme(handle,indices,direction,locale){\nconst n=indices.length;\nif(isNumericBacking(handle)){\nconst values=handle.values;\nconst present=presenceReader(handle);\nlet best=null;\nif(!present){\nfor(let i=0;i<n;i++){\nconst v=values[indices[i]];\nif(Number.isNaN(v))continue;\nif(best===null||(direction<0?v<best:v>best))best=v;\n}\nreturn best;\n}\nfor(let i=0;i<n;i++){\nconst row=indices[i];\nif(present(row)===0)continue;\nconst v=values[row];\nif(Number.isNaN(v))continue;\nif(best===null||(direction<0?v<best:v>best))best=v;\n}\nreturn best;\n}\nconst read=valueReader(handle);\nconst cmp=valueComparator(locale);\nlet best=null;\nfor(let i=0;i<n;i++){\nconst v=read(indices[i]);\nif(v===null||v===undefined||(typeof v==='number'&&Number.isNaN(v)))continue;\nif(best===null||(direction<0?cmp(v,best)<0:cmp(v,best)>0))best=v;\n}\nreturn best;\n}\nfunction min(handle,indices,ctx){\nreturn extreme(handle,indices,-1,ctx&&ctx.locale);\n}\nmin.kernel=true;\nfunction max(handle,indices,ctx){\nreturn extreme(handle,indices,1,ctx&&ctx.locale);\n}\nmax.kernel=true;\nfunction first(handle,indices){\nif(indices.length===0)return null;\nreturn valueReader(handle)(indices[0]);\n}\nfirst.kernel=true;\nfunction last(handle,indices){\nif(indices.length===0)return null;\nreturn valueReader(handle)(indices[indices.length-1]);\n}\nlast.kernel=true;\nfunction numberOf(v){\nif(typeof v==='number')return Number.isNaN(v)?null:v;\nif(v===null||v===undefined||v===''||typeof v==='boolean')return null;\nif(v instanceof Date)return v.getTime();\nconst n=Number(v);\nreturn Number.isNaN(n)?null:n;\n}\nconst TOTAL_FNS={\nsum,min,max,avg,count,first,last,countValues,\n...STAT_FNS,\n};\nconst TOTAL_LABELS=Object.freeze({\n...STAT_LABELS,\nsum:'Sum',\navg:'Average',\nmin:'Min',\nmax:'Max',\ncount:'Count',\ncountValues:'Count of values',\nfirst:'First',\nlast:'Last',\n});\nfunction totalLabel(fn){\nif(!fn)return'';\nif(typeof fn==='string')return TOTAL_LABELS[fn]||fn;\nreturn'Total';\n}\nconst CHOOSER_ORDER=Object.freeze([\n'sum','avg','min','max','count','countValues','first','last',\n]);\nfunction aggregatesFor(column){\nconst supported=column&&column.dataType\n&&column.dataType.totals&&column.dataType.totals.supported;\nif(Array.isArray(supported))return supported.slice();\nconst named=CHOOSER_ORDER.filter((name)=>name in TOTAL_FNS);\nfor(const name of Object.keys(TOTAL_FNS))if(!named.includes(name))named.push(name);\nreturn named;\n}\nfunction aggregateAllowed(column,name){\nif(typeof name!=='string')return true;\nreturn aggregatesFor(column).includes(name);\n}\nfunction collectValues(handle,indices){\nconst read=valueReader(handle);\nconst out=[];\nfor(let i=0;i<indices.length;i++){\nconst v=read(indices[i]);\nif(v===null||v===undefined)continue;\nout.push(v);\n}\nreturn out;\n}\nfunction total(handle,indices,fn,ctx){\nconst list=indices||[];\nif(typeof fn==='string'){\nconst kernel=TOTAL_FNS[fn];\nif(!kernel){\nwarnOnce(`total:${fn}`,`unknown total function \"${fn}\"; register it in config.totalFns`);\nreturn null;\n}\nreturn kernel(handle,list,ctx);\n}\nif(isFunction(fn)){\nif(fn.kernel===true)return fn(handle,list,ctx);\nreturn fn(collectValues(handle,list),ctx||{});\n}\nreturn null;\n}\n});\n__def(\"packages/core/src/compute/pivot.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"KEY_DELIMITER\",{enumerable:true,get:function(){return KEY_DELIMITER;}});\nObject.defineProperty(__exports,\"DEFAULT_PATH_SEPARATOR\",{enumerable:true,get:function(){return DEFAULT_PATH_SEPARATOR;}});\nObject.defineProperty(__exports,\"DEFAULT_MAX_COLUMNS\",{enumerable:true,get:function(){return DEFAULT_MAX_COLUMNS;}});\nObject.defineProperty(__exports,\"pivotKey\",{enumerable:true,get:function(){return pivotKey;}});\nObject.defineProperty(__exports,\"joinPath\",{enumerable:true,get:function(){return joinPath;}});\nObject.defineProperty(__exports,\"resolvePivotKeys\",{enumerable:true,get:function(){return resolvePivotKeys;}});\nObject.defineProperty(__exports,\"pivot\",{enumerable:true,get:function(){return pivot;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst warnOnce=__m0[\"warnOnce\"];\nconst __m1=__req(\"packages/core/src/compute/handle.js\");\nconst valueComparator=__m1[\"valueComparator\"];\nconst __m2=__req(\"packages/core/src/compute/group.js\");\nconst packKeys=__m2[\"packKeys\"];\nconst __m3=__req(\"packages/core/src/compute/total.js\");\nconst total=__m3[\"total\"];\nconst KEY_DELIMITER='|';\nconst DEFAULT_PATH_SEPARATOR='/';\nconst DEFAULT_MAX_COLUMNS=2000;\nfunction pivotKey(groupPath,pivotPath,colId){\nreturn`${groupPath}${KEY_DELIMITER}${pivotPath}${KEY_DELIMITER}${colId}`;\n}\nfunction joinPath(parts,separator){\nlet out='';\nfor(let i=0;i<parts.length;i++){\nconst v=parts[i];\nout+=(i===0?'':separator)+(v===null||v===undefined?'':String(v));\n}\nreturn out;\n}\nfunction resolvePivotKeys(handles,order,opts={}){\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst n=order.length;\nconst{keyOf,readers}=packKeys(handles,order,0);\nconst seen=new Map();\nconst tuples=[];\nconst rawKeys=[];\nfor(let i=0;i<n;i++){\nconst row=order[i];\nconst key=keyOf(row);\nif(seen.has(key))continue;\nseen.set(key,tuples.length);\nrawKeys.push(key);\nconst tuple=new Array(readers.length);\nfor(let j=0;j<readers.length;j++)tuple[j]=readers[j](row);\ntuples.push(tuple);\n}\nconst cmp=valueComparator(opts.locale);\nconst rank=tuples.map((_,i)=>i);\nrank.sort((a,b)=>{\nconst ta=tuples[a];\nconst tb=tuples[b];\nfor(let j=0;j<ta.length;j++){\nconst c=compareNullable(ta[j],tb[j],cmp);\nif(c!==0)return c;\n}\nreturn a-b;\n});\nconst keys=new Array(rank.length);\nconst paths=new Array(rank.length);\nconst idByKey=new Map();\nfor(let position=0;position<rank.length;position++){\nconst from=rank[position];\nkeys[position]=tuples[from];\npaths[position]=joinPath(tuples[from],separator);\nidByKey.set(rawKeys[from],position);\n}\nconst idOf=(row)=>{\nconst id=idByKey.get(keyOf(row));\nreturn id===undefined?-1:id;\n};\nreturn{keys,paths,idOf};\n}\nfunction compareNullable(a,b,cmp){\nconst na=a===null||a===undefined;\nconst nb=b===null||b===undefined;\nif(na||nb)return na&&nb?0:na?1:-1;\nreturn cmp(a,b);\n}\nfunction resolveValueColumns(opts){\nconst declared=opts.values||opts.totals||[];\nif(declared.length&&typeof declared[0]==='object'&&declared[0]!==null){\nreturn declared.filter((entry)=>entry&&entry.handle);\n}\nconst resolve=typeof opts.handle==='function'?opts.handle:null;\nif(!resolve){\nif(declared.length){\nwarnOnce('pivot:handles',\n'pivot was given total column ids but no handle(colId) resolver, so no cell values were reduced. Pass values: [{ colId, handle, fn }] or opts.handle.');\n}\nreturn[];\n}\nconst totalOf=typeof opts.totalOf==='function'?opts.totalOf:null;\nconst out=[];\nfor(const colId of declared){\nconst handle=resolve(colId);\nif(!handle)continue;\nout.push({colId,handle,fn:totalOf?totalOf(colId):'sum'});\n}\nreturn out;\n}\nfunction normaliseArgs(a,b,c){\nif(Array.isArray(a)){\nconst opts=c||{};\nreturn{...opts,pivotHandles:a,order:b||null,groups:opts.groups||null};\n}\nreturn a||{};\n}\nfunction pivot(input,orderArg,optsArg){\nconst opts=normaliseArgs(input,orderArg,optsArg);\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst valueColumns=resolveValueColumns(opts);\nconst maxColumns=opts.maxColumns===undefined?DEFAULT_MAX_COLUMNS:opts.maxColumns;\nconst groups=opts.groups&&opts.groups.buckets?opts.groups:null;\nconst buckets=groups?groups.buckets:[opts.order||new Uint32Array(0)];\nconst groupPaths=opts.groupPaths\n||(groups?groups.keys.map((tuple)=>joinPath(tuple,separator)):['']);\nconst scope=concatIndices(buckets);\nconst{keys,paths,idOf}=resolvePivotKeys(opts.pivotHandles||[],scope,opts);\nconst columns=paths.length*Math.max(1,valueColumns.length);\nconst fields=derivedFields(paths,valueColumns,separator);\nif(maxColumns&&columns>maxColumns){\nconst empty=new Map();\nreturn{\nkeys,\npaths,\nfields,\ngroupPaths,\ncolumns,\nvalues:empty,\ncells:empty,\nerror:{\ncode:'pivot-max-columns',\nmessage:`[lattice] pivot would generate ${columns} columns, above pivot.maxColumns of ${maxColumns}. Narrow the pivot columns or raise the limit.`,\ncolumns,\nmaxColumns,\n},\n};\n}\nconst cells=new Map();\nconst keyCount=paths.length;\nfor(let g=0;g<buckets.length;g++){\nconst bucket=buckets[g];\nconst groupPath=groupPaths[g]===undefined?'':groupPaths[g];\nconst n=bucket.length;\nif(n===0)continue;\nconst ids=new Int32Array(n);\nconst counts=new Uint32Array(keyCount+1);\nfor(let i=0;i<n;i++){\nconst id=idOf(bucket[i]);\nids[i]=id;\nif(id>=0)counts[id+1]++;\n}\nfor(let k=0;k<keyCount;k++)counts[k+1]+=counts[k];\nconst scattered=new Uint32Array(n);\nconst cursor=counts.slice(0,keyCount);\nfor(let i=0;i<n;i++){\nconst id=ids[i];\nif(id>=0)scattered[cursor[id]++]=bucket[i];\n}\nfor(let k=0;k<keyCount;k++){\nconst from=counts[k];\nconst to=counts[k+1];\nif(to===from)continue;\nconst slice=scattered.subarray(from,to);\nfor(let c=0;c<valueColumns.length;c++){\nconst column=valueColumns[c];\nconst result=total(column.handle,slice,column.fn,opts.totalContext||{locale:opts.locale});\ncells.set(pivotKey(groupPath,paths[k],column.colId),result);\n}\n}\n}\nreturn{keys,paths,fields,groupPaths,columns,values:cells,cells,error:null};\n}\nfunction derivedFields(paths,valueColumns,separator){\nif(valueColumns.length===0)return paths.slice();\nconst out=[];\nfor(const path of paths){\nfor(const column of valueColumns)out.push(`${path}${separator}${column.colId}`);\n}\nreturn out;\n}\nfunction concatIndices(buckets){\nif(buckets.length===1)return buckets[0]||new Uint32Array(0);\nlet n=0;\nfor(const b of buckets)n+=b?b.length:0;\nconst out=new Uint32Array(n);\nlet at=0;\nfor(const b of buckets){\nif(!b||b.length===0)continue;\nout.set(b,at);\nat+=b.length;\n}\nreturn out;\n}\n});\n__def(\"packages/core/src/compute/pivotmatrix.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"GRAND_PATH\",{enumerable:true,get:function(){return GRAND_PATH;}});\nObject.defineProperty(__exports,\"resolveAxis\",{enumerable:true,get:function(){return resolveAxis;}});\nObject.defineProperty(__exports,\"pivotMatrix\",{enumerable:true,get:function(){return pivotMatrix;}});\nObject.defineProperty(__exports,\"cellKey\",{enumerable:true,get:function(){return cellKey;}});\nObject.defineProperty(__exports,\"marginKey\",{enumerable:true,get:function(){return marginKey;}});\nconst __m0=__req(\"packages/core/src/compute/handle.js\");\nconst valueComparator=__m0[\"valueComparator\"];\nconst __m1=__req(\"packages/core/src/compute/total.js\");\nconst total=__m1[\"total\"];\nconst __m2=__req(\"packages/core/src/compute/group.js\");\nconst packKeys=__m2[\"packKeys\"];\nconst __m3=__req(\"packages/core/src/compute/pivot.js\");\nconst joinPath=__m3[\"joinPath\"];\nconst DEFAULT_PATH_SEPARATOR=__m3[\"DEFAULT_PATH_SEPARATOR\"];\nconst DEFAULT_MAX_COLUMNS=__m3[\"DEFAULT_MAX_COLUMNS\"];\nconst GRAND_PATH='';\nfunction resolveAxis(handles,leaves,opts={}){\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst list=handles||[];\nconst order=leaves instanceof Uint32Array?leaves:Uint32Array.from(leaves||[]);\nconst n=order.length;\nif(list.length===0){\nreturn{tuples:[[]],paths:[GRAND_PATH],buckets:[order]};\n}\nconst{keyOf,readers}=packKeys(list,order,0);\nconst seen=new Map();\nconst tuples=[];\nconst rawKeys=[];\nconst rowsByKey=[];\nfor(let i=0;i<n;i++){\nconst row=order[i];\nconst key=keyOf(row);\nlet at=seen.get(key);\nif(at===undefined){\nat=tuples.length;\nseen.set(key,at);\nrawKeys.push(key);\nconst tuple=new Array(readers.length);\nfor(let j=0;j<readers.length;j++)tuple[j]=readers[j](row);\ntuples.push(tuple);\nrowsByKey.push([]);\n}\nrowsByKey[at].push(row);\n}\nconst cmp=valueComparator(opts.locale);\nconst rank=tuples.map((_,i)=>i);\nrank.sort((a,b)=>{\nconst ta=tuples[a];\nconst tb=tuples[b];\nfor(let j=0;j<ta.length;j++){\nconst c=compareNullable(ta[j],tb[j],cmp);\nif(c!==0)return c;\n}\nreturn a-b;\n});\nconst outTuples=new Array(rank.length);\nconst paths=new Array(rank.length);\nconst buckets=new Array(rank.length);\nfor(let position=0;position<rank.length;position++){\nconst from=rank[position];\noutTuples[position]=tuples[from];\npaths[position]=joinPath(tuples[from],separator);\nbuckets[position]=Uint32Array.from(rowsByKey[from]);\n}\nreturn{tuples:outTuples,paths,buckets};\n}\nfunction compareNullable(a,b,cmp){\nconst na=a===null||a===undefined;\nconst nb=b===null||b===undefined;\nif(na||nb)return na&&nb?0:na?1:-1;\nreturn cmp(a,b);\n}\nfunction intersect(a,b,bSet){\nconst out=[];\nfor(let i=0;i<a.length;i++){\nif(bSet.has(a[i]))out.push(a[i]);\n}\nreturn Uint32Array.from(out);\n}\nfunction reduceCell(handle,leaves,fn,ctx){\nconst value=leaves.length?total(handle,leaves,fn,ctx):null;\nreturn{value,leaves,count:leaves.length};\n}\nfunction pivotMatrix(input){\nconst opts=(input&&input.opts)||{};\nconst separator=opts.separator||DEFAULT_PATH_SEPARATOR;\nconst ctx=opts.totalContext||{locale:opts.locale};\nconst measures=(input.measures||[]).filter((m)=>m&&m.handle);\nconst leaves=input.leaves instanceof Uint32Array\n?input.leaves\n:Uint32Array.from(input.leaves||[]);\nconst rowAxis=resolveAxis(input.rowHandles||[],leaves,{...opts,separator});\nconst columnAxis=resolveAxis(input.columnHandles||[],leaves,{...opts,separator});\nconst maxColumns=opts.maxColumns===undefined?DEFAULT_MAX_COLUMNS:opts.maxColumns;\nconst columns=columnAxis.paths.length*Math.max(1,measures.length);\nconst empty=new Map();\nif(maxColumns&&columns>maxColumns){\nreturn{\nrowAxis,\ncolumnAxis,\nmeasures:measures.map((m)=>({colId:m.colId,fn:m.fn})),\nbody:empty,\nrowMargin:empty,\ncolumnMargin:empty,\ngrand:empty,\ncolumns,\nerror:{\ncode:'pivot-max-columns',\nmessage:`[lattice] pivot would generate ${columns} columns, above pivot.maxColumns of `\n+`${maxColumns}. Narrow the pivot columns or raise the limit.`,\ncolumns,\nmaxColumns,\n},\n};\n}\nconst body=new Map();\nconst rowMargin=new Map();\nconst columnMargin=new Map();\nconst grand=new Map();\nconst columnSets=columnAxis.buckets.map((b)=>new Set(b));\nfor(let c=0;c<columnAxis.paths.length;c++){\nconst columnLeaves=columnAxis.buckets[c];\nconst columnPath=columnAxis.paths[c];\nfor(const m of measures){\ncolumnMargin.set(marginKey(columnPath,m.colId),reduceCell(m.handle,columnLeaves,m.fn,ctx));\n}\n}\nfor(let r=0;r<rowAxis.paths.length;r++){\nconst rowLeaves=rowAxis.buckets[r];\nconst rowPath=rowAxis.paths[r];\nfor(const m of measures){\nrowMargin.set(marginKey(rowPath,m.colId),reduceCell(m.handle,rowLeaves,m.fn,ctx));\n}\nfor(let c=0;c<columnAxis.paths.length;c++){\nconst cellLeaves=intersect(rowLeaves,columnAxis.buckets[c],columnSets[c]);\nif(cellLeaves.length===0)continue;\nconst columnPath=columnAxis.paths[c];\nfor(const m of measures){\nbody.set(cellKey(rowPath,columnPath,m.colId),reduceCell(m.handle,cellLeaves,m.fn,ctx));\n}\n}\n}\nfor(const m of measures){\ngrand.set(m.colId,reduceCell(m.handle,leaves,m.fn,ctx));\n}\nreturn{\nrowAxis,\ncolumnAxis,\nmeasures:measures.map((m)=>({colId:m.colId,fn:m.fn})),\nbody,\nrowMargin,\ncolumnMargin,\ngrand,\ncolumns,\nerror:null,\n};\n}\nfunction cellKey(rowPath,columnPath,colId){\nreturn`${rowPath}\\u0000${columnPath}\\u0000${colId}`;\n}\nfunction marginKey(path,colId){\nreturn`${path}\\u0000${colId}`;\n}\n});\n__def(\"packages/core/src/compute/reference.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"referenceValue\",{enumerable:true,get:function(){return referenceValue;}});\nObject.defineProperty(__exports,\"referenceSort\",{enumerable:true,get:function(){return referenceSort;}});\nObject.defineProperty(__exports,\"referenceFilter\",{enumerable:true,get:function(){return referenceFilter;}});\nObject.defineProperty(__exports,\"referencePasses\",{enumerable:true,get:function(){return referencePasses;}});\nObject.defineProperty(__exports,\"referenceGroup\",{enumerable:true,get:function(){return referenceGroup;}});\nObject.defineProperty(__exports,\"referenceTotal\",{enumerable:true,get:function(){return referenceTotal;}});\nconst __m0=__req(\"packages/core/src/internal/util.js\");\nconst getPath=__m0[\"getPath\"];\nconst __m1=__req(\"packages/core/src/compute/handle.js\");\nconst isMissing=__m1[\"isMissing\"];\nconst valueComparator=__m1[\"valueComparator\"];\nconst __m2=__req(\"packages/core/src/compute/filter.js\");\nconst testValue=__m2[\"testValue\"];\nconst KEY_SEPARATOR=String.fromCharCode(0x1f);\nconst NULL_MARKER=String.fromCharCode(0x00);\nfunction referenceValue(row,col){\nconst v=col.includes('.')?getPath(row,col):(row==null?undefined:row[col]);\nreturn v===undefined?null:v;\n}\nfunction referenceSort(rows,entries,opts={}){\nconst list=entries||[];\nlet order=rows.map((_,i)=>i);\nif(list.length===0)return order;\nfor(let e=list.length-1;e>=0;e--){\norder=referenceSortOne(rows,order,list[e],opts);\n}\nreturn order;\n}\nfunction referenceSortOne(rows,order,entry,opts){\nconst locale=entry.locale!==undefined?entry.locale:opts.locale;\nconst base=valueComparator(locale);\nconst descending=entry.descending!==undefined?!!entry.descending:entry.dir==='desc';\nconst present=[];\nconst absent=[];\nfor(const i of order){\nconst v=referenceValue(rows[i],entry.col);\nif(isMissing(v))absent.push(i);else present.push(i);\n}\nconst position=new Map();\nfor(let p=0;p<present.length;p++)position.set(present[p],p);\nconst compare=(a,b)=>{\nconst va=referenceValue(rows[a],entry.col);\nconst vb=referenceValue(rows[b],entry.col);\nlet c;\nif(typeof entry.compare==='function'){\nc=entry.compare(va,vb,rows[a],rows[b],descending);\nif(descending)c=-c;\n}else{\nc=descending?base(vb,va):base(va,vb);\n}\nreturn c!==0?c:position.get(a)-position.get(b);\n};\npresent.sort(compare);\nreturn entry.nullsFirst?absent.concat(present):present.concat(absent);\n}\nfunction referenceFilter(rows,filters,opts={}){\nconst out=[];\nfor(let i=0;i<rows.length;i++){\nif(referencePasses(rows[i],filters,opts,i))out.push(i);\n}\nreturn out;\n}\nfunction referencePasses(row,node,opts,index){\nif(!node)return true;\nif(Array.isArray(node.conditions)){\nconst children=node.conditions.filter((c)=>c!=null);\nif(children.length===0)return true;\nif(node.op==='or')return children.some((c)=>referencePasses(row,c,opts,index));\nconst all=children.every((c)=>referencePasses(row,c,opts,index));\nreturn node.op==='not'?!all:all;\n}\nif(node.col===undefined&&typeof opts.custom==='function')return!!opts.custom(node,row,index);\nreturn testValue(referenceValue(row,node.col),node,opts.locale);\n}\nfunction referenceGroup(rows,cols,order,project){\nconst source=order||rows.map((_,i)=>i);\nconst seen=new Map();\nconst keys=[];\nconst buckets=[];\nfor(const i of source){\nconst tuple=cols.map((col,j)=>{\nconst v=referenceValue(rows[i],col);\nreturn(project&&project[j])?project[j](v):v;\n});\nconst key=tuple\n.map((v)=>(v===null||v===undefined?NULL_MARKER:String(v)))\n.join(KEY_SEPARATOR);\nlet at=seen.get(key);\nif(at===undefined){\nat=keys.length;\nseen.set(key,at);\nkeys.push(tuple);\nbuckets.push([]);\n}\nbuckets[at].push(i);\n}\nreturn{keys,buckets};\n}\nfunction referenceTotal(values,fn,opts={}){\nconst cmp=valueComparator(opts.locale);\nconst live=values.filter((v)=>!isMissing(v));\nconst numbers=live.map(toNumberOrNull).filter((v)=>v!==null);\nswitch(fn){\ncase'count':return values.length;\ncase'countValues':return live.length;\ncase'sum':return numbers.reduce((a,b)=>a+b,0);\ncase'avg':return live.length===0?null:numbers.reduce((a,b)=>a+b,0)/live.length;\ncase'min':return live.length===0?null:live.reduce((a,b)=>(cmp(b,a)<0?b:a));\ncase'max':return live.length===0?null:live.reduce((a,b)=>(cmp(b,a)>0?b:a));\ncase'first':return values.length===0?null:normaliseNull(values[0]);\ncase'last':return values.length===0?null:normaliseNull(values[values.length-1]);\ndefault:return null;\n}\n}\nfunction toNumberOrNull(v){\nif(typeof v==='number')return Number.isNaN(v)?null:v;\nif(v===null||v===undefined||v===''||typeof v==='boolean')return null;\nif(v instanceof Date)return v.getTime();\nconst n=Number(v);\nreturn Number.isNaN(n)?null:n;\n}\nfunction normaliseNull(v){\nreturn v===undefined?null:v;\n}\n});\n__def(\"packages/core/src/compute/windowed.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"Window\",{enumerable:true,get:function(){return Window;}});\nObject.defineProperty(__exports,\"WINDOW_KINDS\",{enumerable:true,get:function(){return WINDOW_KINDS;}});\nObject.defineProperty(__exports,\"openWindow\",{enumerable:true,get:function(){return openWindow;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nconst __m0=__req(\"packages/core/src/compute/sketch.js\");\nconst Welford=__m0[\"Welford\"];\nclass Window{\n#kind;\n#span;\n#ticks=[];\n#now;\n#opened;\nconstructor(kind,span=0,now=Date.now){\nif(kind!=='count'&&kind!=='time'&&kind!=='session'){\nthrow new RangeError(`unknown window kind: ${kind}`);\n}\nif((kind==='count'||kind==='time')&&!(span>0)){\nthrow new RangeError(`a ${kind} window needs a positive span`);\n}\nthis.#kind=kind;\nthis.#span=Math.floor(span);\nthis.#now=now;\nthis.#opened=now();\n}\nget size(){return this.#ticks.length;}\npush(v,t=this.#now()){\nif(!Number.isFinite(v))return;\nthis.#ticks.push({t,v});\nthis.#evict(t);\n}\n#evict(nowT){\nif(this.#kind==='count'){\nwhile(this.#ticks.length>this.#span)this.#ticks.shift();\n}else if(this.#kind==='time'){\nconst cutoff=nowT-this.#span;\nwhile(this.#ticks.length&&this.#ticks[0].t<cutoff)this.#ticks.shift();\n}\n}\nspec(){\nconst span=this.#kind==='session'?this.#now()-this.#opened:this.#span;\nreturn{kind:this.#kind,span,size:this.#ticks.length};\n}\nvalues(){return this.#ticks.map((tk)=>tk.v);}\naggregate(){\nconst spec=this.spec();\nif(!this.#ticks.length){\nreturn{over:spec,count:0,sum:null,mean:null,min:null,max:null,variance:null,stddev:null};\n}\nconst w=new Welford();\nlet sum=0;\nlet min=Infinity;\nlet max=-Infinity;\nfor(const{v}of this.#ticks){\nsum+=v;\nif(v<min)min=v;\nif(v>max)max=v;\nw.add(v);\n}\nreturn{\nover:spec,\ncount:this.#ticks.length,\nsum,\nmean:w.mean(),\nmin,\nmax,\nvariance:w.variance(),\nstddev:w.stddev(),\n};\n}\nreduce(fn){\nconst agg=this.aggregate();\nconst map={\nsum:agg.sum,avg:agg.mean,mean:agg.mean,min:agg.min,max:agg.max,\ncount:agg.count,variance:agg.variance,stddev:agg.stddev,\n};\nif(!(fn in map))throw new RangeError(`unknown windowed aggregate: ${fn}`);\nreturn{value:map[fn],over:agg.over};\n}\n}\nconst WINDOW_KINDS=Object.freeze(['count','time','session']);\nfunction openWindow(opts,now=Date.now){\nconst span=opts.kind==='time'&&opts.minutes!=null\n?opts.minutes*60_000\n:opts.span??0;\nreturn new Window(opts.kind,span,now);\n}\nconst __default={Window,WINDOW_KINDS,openWindow};\n});\n__def(\"packages/core/src/compute/anomaly.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"MAD_SCALE\",{enumerable:true,get:function(){return MAD_SCALE;}});\nObject.defineProperty(__exports,\"DEFAULT_MODIFIED_Z_THRESHOLD\",{enumerable:true,get:function(){return DEFAULT_MODIFIED_Z_THRESHOLD;}});\nObject.defineProperty(__exports,\"DEFAULT_IQR_K\",{enumerable:true,get:function(){return DEFAULT_IQR_K;}});\nObject.defineProperty(__exports,\"DEFAULT_CHI_SQUARE_P\",{enumerable:true,get:function(){return DEFAULT_CHI_SQUARE_P;}});\nObject.defineProperty(__exports,\"ANOMALY_METHODS\",{enumerable:true,get:function(){return ANOMALY_METHODS;}});\nObject.defineProperty(__exports,\"robustSpread\",{enumerable:true,get:function(){return robustSpread;}});\nObject.defineProperty(__exports,\"modifiedZScores\",{enumerable:true,get:function(){return modifiedZScores;}});\nObject.defineProperty(__exports,\"iqrFences\",{enumerable:true,get:function(){return iqrFences;}});\nObject.defineProperty(__exports,\"chiSquareCdf\",{enumerable:true,get:function(){return chiSquareCdf;}});\nObject.defineProperty(__exports,\"chiSquareQuantile\",{enumerable:true,get:function(){return chiSquareQuantile;}});\nObject.defineProperty(__exports,\"mahalanobis\",{enumerable:true,get:function(){return mahalanobis;}});\nObject.defineProperty(__exports,\"DEFAULT_ROLLING_WINDOW\",{enumerable:true,get:function(){return DEFAULT_ROLLING_WINDOW;}});\nObject.defineProperty(__exports,\"ROLLING_ANOMALY_METHODS\",{enumerable:true,get:function(){return ROLLING_ANOMALY_METHODS;}});\nObject.defineProperty(__exports,\"rollingAnomalies\",{enumerable:true,get:function(){return rollingAnomalies;}});\nObject.defineProperty(__exports,\"anomalyCondition\",{enumerable:true,get:function(){return anomalyCondition;}});\nconst __m0=__req(\"packages/core/src/compute/statistics.js\");\nconst quantileSorted=__m0[\"quantileSorted\"];\nconst __m1=__req(\"packages/core/src/compute/special.js\");\nconst logGamma=__m1[\"logGamma\"];\nconst MAD_SCALE=0.6745;\nconst DEFAULT_MODIFIED_Z_THRESHOLD=3.5;\nconst DEFAULT_IQR_K=1.5;\nconst DEFAULT_CHI_SQUARE_P=0.975;\nconst ANOMALY_METHODS=Object.freeze(['modifiedZScore','iqr','mahalanobis']);\nfunction robustSpread(values){\nconst n=values.length;\nif(!n)return null;\nconst sorted=Array.from(values,Number).sort((a,b)=>a-b);\nconst median=quantileSorted(sorted,0.5);\nconst deviations=sorted.map((v)=>Math.abs(v-median)).sort((a,b)=>a-b);\nconst mad=quantileSorted(deviations,0.5);\nreturn{median,mad};\n}\nfunction modifiedZScores(values,opts={}){\nconst threshold=Number.isFinite(opts.threshold)?opts.threshold:DEFAULT_MODIFIED_Z_THRESHOLD;\nconst n=values.length;\nconst scores=new Array(n).fill(null);\nconst flags=new Array(n).fill(false);\nconst finite=[];\nfor(let i=0;i<n;i++){\nconst v=Number(values[i]);\nif(Number.isFinite(v))finite.push(v);\n}\nif(!finite.length)return{median:null,mad:null,threshold,scores,flags,flagged:0};\nconst spread=robustSpread(finite);\nif(spread.mad===0)return{median:spread.median,mad:0,threshold,scores,flags,flagged:0};\nlet flagged=0;\nfor(let i=0;i<n;i++){\nconst v=Number(values[i]);\nif(!Number.isFinite(v))continue;\nconst score=(MAD_SCALE*(v-spread.median))/spread.mad;\nscores[i]=score;\nif(Math.abs(score)>threshold){flags[i]=true;flagged++;}\n}\nreturn{median:spread.median,mad:spread.mad,threshold,scores,flags,flagged};\n}\nfunction iqrFences(values,opts={}){\nconst k=Number.isFinite(opts.k)?opts.k:DEFAULT_IQR_K;\nconst finite=[];\nfor(let i=0;i<values.length;i++){\nconst v=Number(values[i]);\nif(Number.isFinite(v))finite.push(v);\n}\nif(!finite.length)return null;\nconst sorted=finite.sort((a,b)=>a-b);\nconst q1=quantileSorted(sorted,0.25);\nconst q3=quantileSorted(sorted,0.75);\nconst iqr=q3-q1;\nreturn{q1,q3,iqr,lower:q1-k*iqr,upper:q3+k*iqr,k};\n}\nfunction regularizedGammaP(a,x){\nif(x<=0)return 0;\nconst gln=logGamma(a);\nif(x<a+1){\nlet ap=a;\nlet sum=1/a;\nlet term=sum;\nfor(let i=0;i<1000;i++){\nap+=1;\nterm*=x/ap;\nsum+=term;\nif(Math.abs(term)<Math.abs(sum)*1e-15)break;\n}\nreturn sum*Math.exp(-x+a*Math.log(x)-gln);\n}\nconst tiny=1e-300;\nlet b=x+1-a;\nlet c=1/tiny;\nlet d=1/b;\nlet h=d;\nfor(let i=1;i<1000;i++){\nconst an=-i*(i-a);\nb+=2;\nd=an*d+b;\nif(Math.abs(d)<tiny)d=tiny;\nc=b+an/c;\nif(Math.abs(c)<tiny)c=tiny;\nd=1/d;\nconst delta=d*c;\nh*=delta;\nif(Math.abs(delta-1)<1e-15)break;\n}\nconst q=Math.exp(-x+a*Math.log(x)-gln)*h;\nreturn 1-q;\n}\nfunction chiSquareCdf(x,df){\nif(x<=0)return 0;\nreturn regularizedGammaP(df/2,x/2);\n}\nfunction chiSquareQuantile(df,p=DEFAULT_CHI_SQUARE_P){\nif(!(p>0)||!(p<1))return NaN;\nlet lo=0;\nlet hi=Math.max(1,df);\nwhile(chiSquareCdf(hi,df)<p)hi*=2;\nfor(let i=0;i<200;i++){\nconst mid=(lo+hi)/2;\nif(chiSquareCdf(mid,df)<p)lo=mid;else hi=mid;\nif(hi-lo<1e-10)break;\n}\nreturn(lo+hi)/2;\n}\nfunction invertMatrix(matrix){\nconst k=matrix.length;\nconst a=matrix.map((row,i)=>{\nconst copy=row.slice();\nfor(let j=0;j<k;j++)copy.push(i===j?1:0);\nreturn copy;\n});\nfor(let col=0;col<k;col++){\nlet pivot=col;\nfor(let r=col+1;r<k;r++){\nif(Math.abs(a[r][col])>Math.abs(a[pivot][col]))pivot=r;\n}\nif(Math.abs(a[pivot][col])<1e-12)return null;\nif(pivot!==col){const t=a[pivot];a[pivot]=a[col];a[col]=t;}\nconst div=a[col][col];\nfor(let j=0;j<2*k;j++)a[col][j]/=div;\nfor(let r=0;r<k;r++){\nif(r===col)continue;\nconst factor=a[r][col];\nif(factor===0)continue;\nfor(let j=0;j<2*k;j++)a[r][j]-=factor*a[col][j];\n}\n}\nreturn a.map((row)=>row.slice(k));\n}\nfunction meanAndCovariance(rows,k){\nconst n=rows.length;\nconst mean=new Array(k).fill(0);\nfor(const row of rows)for(let j=0;j<k;j++)mean[j]+=row[j];\nfor(let j=0;j<k;j++)mean[j]/=n;\nconst cov=Array.from({length:k},()=>new Array(k).fill(0));\nfor(const row of rows){\nfor(let a=0;a<k;a++){\nconst da=row[a]-mean[a];\nfor(let b=a;b<k;b++){\ncov[a][b]+=da*(row[b]-mean[b]);\n}\n}\n}\nconst denom=n>1?n-1:1;\nfor(let a=0;a<k;a++){\nfor(let b=a;b<k;b++){\ncov[a][b]/=denom;\ncov[b][a]=cov[a][b];\n}\n}\nreturn{mean,cov};\n}\nfunction mahalanobis(matrix,opts={}){\nconst p=Number.isFinite(opts.p)?opts.p:DEFAULT_CHI_SQUARE_P;\nconst ridgeFraction=Number.isFinite(opts.ridge)?opts.ridge:1e-6;\nconst n=matrix.length;\nif(!n)return null;\nconst k=matrix[0].length;\nif(!k)return null;\nconst distances=new Array(n).fill(null);\nconst squared=new Array(n).fill(null);\nconst flags=new Array(n).fill(false);\nconst completeIndex=[];\nconst complete=[];\nfor(let i=0;i<n;i++){\nconst row=matrix[i];\nlet ok=row.length===k;\nconst coords=new Array(k);\nfor(let j=0;ok&&j<k;j++){\nconst v=Number(row[j]);\nif(!Number.isFinite(v))ok=false;else coords[j]=v;\n}\nif(ok){completeIndex.push(i);complete.push(coords);}\n}\nconst df=k;\nconst cutoff=chiSquareQuantile(df,p);\nif(complete.length<=k){\nreturn{center:[],df,cutoff,singular:true,used:complete.length,distances,squared,flags,flagged:0};\n}\nconst{mean,cov}=meanAndCovariance(complete,k);\nlet inverse=invertMatrix(cov);\nlet singular=false;\nif(!inverse){\nsingular=true;\nlet trace=0;\nfor(let j=0;j<k;j++)trace+=cov[j][j];\nconst ridge=(trace/k)*ridgeFraction||ridgeFraction;\nconst nudged=cov.map((row,i)=>row.map((v,j)=>(i===j?v+ridge:v)));\ninverse=invertMatrix(nudged);\nif(!inverse){\nreturn{center:mean,df,cutoff,singular:true,used:complete.length,distances,squared,flags,flagged:0};\n}\n}\nlet flagged=0;\nfor(let c=0;c<complete.length;c++){\nconst row=complete[c];\nconst dev=new Array(k);\nfor(let j=0;j<k;j++)dev[j]=row[j]-mean[j];\nlet d2=0;\nfor(let a=0;a<k;a++){\nlet sa=0;\nfor(let b=0;b<k;b++)sa+=inverse[a][b]*dev[b];\nd2+=dev[a]*sa;\n}\nif(d2<0)d2=0;\nconst at=completeIndex[c];\nsquared[at]=d2;\ndistances[at]=Math.sqrt(d2);\nif(d2>cutoff){flags[at]=true;flagged++;}\n}\nreturn{\ncenter:mean,df,cutoff,singular,used:complete.length,distances,squared,flags,flagged,\n};\n}\nconst DEFAULT_ROLLING_WINDOW=20;\nconst ROLLING_ANOMALY_METHODS=Object.freeze(['rollingModifiedZScore','rollingIqr']);\nfunction rollingAnomalies(values,opts={}){\nconst method=opts.method==='rollingIqr'?'rollingIqr':'rollingModifiedZScore';\nconst windowLen=Number.isFinite(opts.windowLen)&&opts.windowLen>=1\n?Math.floor(opts.windowLen):DEFAULT_ROLLING_WINDOW;\nconst threshold=Number.isFinite(opts.threshold)?opts.threshold:DEFAULT_MODIFIED_Z_THRESHOLD;\nconst k=Number.isFinite(opts.k)?opts.k:DEFAULT_IQR_K;\nconst minPeriods=Number.isFinite(opts.minPeriods)&&opts.minPeriods>=1\n?Math.floor(opts.minPeriods):windowLen;\nconst n=values.length;\nconst scores=new Array(n).fill(null);\nconst flags=new Array(n).fill(false);\nlet flagged=0;\nfor(let i=0;i<n;i++){\nconst v=Number(values[i]);\nif(!Number.isFinite(v))continue;\nconst start=Math.max(0,i-windowLen+1);\nconst win=[];\nfor(let j=start;j<=i;j++){\nconst w=Number(values[j]);\nif(Number.isFinite(w))win.push(w);\n}\nif(win.length<minPeriods)continue;\nif(method==='rollingIqr'){\nconst fences=iqrFences(win,{k});\nif(!fences)continue;\nif(v<fences.lower||v>fences.upper){flags[i]=true;flagged++;}\n}else{\nconst spread=robustSpread(win);\nif(!spread||spread.mad===0)continue;\nconst score=(MAD_SCALE*(v-spread.median))/spread.mad;\nscores[i]=score;\nif(Math.abs(score)>threshold){flags[i]=true;flagged++;}\n}\n}\nreturn{method,windowLen,minPeriods,threshold,k,scores,flags,flagged};\n}\nfunction anomalyCondition(opts={}){\nconst spec=opts||{};\nconst field=spec.field;\nif(typeof field!=='string'||!field){\nthrow new TypeError('[lattice] anomalyCondition: a string `field` naming the numeric property to monitor is required');\n}\nconst method=spec.method||'modifiedZScore';\nconst known=ANOMALY_METHODS.includes(method)||ROLLING_ANOMALY_METHODS.includes(method);\nif(!known||method==='mahalanobis'){\nthrow new RangeError(`[lattice] anomalyCondition: unknown or unsupported method '${method}'`);\n}\nconst orderBy=typeof spec.orderBy==='string'?spec.orderBy:null;\nconst latest=spec.latest===true;\nconst isRolling=ROLLING_ANOMALY_METHODS.includes(method);\nconst read=(row)=>Number(row==null?NaN:row[field]);\nreturn(rows)=>{\nconst list=Array.isArray(rows)?rows.slice():[...rows];\nif(orderBy){\nlist.sort((a,b)=>{\nconst av=a==null?undefined:a[orderBy];\nconst bv=b==null?undefined:b[orderBy];\nif(av===bv)return 0;\nif(av===undefined||av===null)return-1;\nif(bv===undefined||bv===null)return 1;\nreturn av<bv?-1:1;\n});\n}\nconst values=list.map(read);\nlet flags;\nlet scores;\nif(isRolling){\nconst r=rollingAnomalies(values,{\nmethod,windowLen:spec.windowLen,threshold:spec.threshold,k:spec.k,minPeriods:spec.minPeriods,\n});\n({flags,scores}=r);\n}else if(method==='iqr'){\nconst fences=iqrFences(values,{k:spec.k});\nflags=values.map((v)=>(fences?Number.isFinite(v)&&(v<fences.lower||v>fences.upper):false));\nscores=values.map(()=>null);\n}else{\nconst z=modifiedZScores(values,{threshold:spec.threshold});\n({flags,scores}=z);\n}\nif(latest){\nconst i=flags.length-1;\nif(i<0||!flags[i])return false;\nreturn{method,field,flagged:[{row:list[i],score:scores[i]}]};\n}\nconst flaggedRows=[];\nfor(let i=0;i<flags.length;i++){\nif(flags[i])flaggedRows.push({row:list[i],score:scores[i]});\n}\nreturn flaggedRows.length?{method,field,flagged:flaggedRows}:false;\n};\n}\n});\n__def(\"packages/core/src/compute/forecast.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"FORECAST_METHODS\",{enumerable:true,get:function(){return FORECAST_METHODS;}});\nObject.defineProperty(__exports,\"forecast\",{enumerable:true,get:function(){return forecast;}});\nObject.defineProperty(__exports,\"default\",{enumerable:true,get:function(){return __default;}});\nconst __m0=__req(\"packages/core/src/compute/special.js\");\nconst normalQuantile=__m0[\"normalQuantile\"];\nconst studentTQuantile=__m0[\"studentTQuantile\"];\nconst __m1=__req(\"packages/core/src/internal/util.js\");\nconst warnOnce=__m1[\"warnOnce\"];\nconst FORECAST_METHODS=Object.freeze([\n'movingAverage','ses','holt','holtWinters','linear',\n]);\nconst SMOOTH_LO=1e-4;\nconst SMOOTH_HI=1-1e-4;\nfunction normalise(seq){\nconst rows=[];\nfor(let i=0;i<seq.length;i++){\nconst el=seq[i];\nif(el!==null&&typeof el==='object'){\nconst at=Number.isFinite(el.at)?el.at:i;\nconst value=Number.isFinite(el.value)?el.value:null;\nrows.push({at,value});\n}else{\nrows.push({at:i,value:Number.isFinite(el)?Number(el):null});\n}\n}\nreturn rows;\n}\nfunction axis(rows){\nconst finite=rows.filter((r)=>r.value!==null);\nconst first=finite[0];\nconst last=finite[finite.length-1];\nconst span=last.at-first.at;\nconst step=finite.length>1&&span>0?span/(finite.length-1):1;\nreturn{lastAt:last.at,step};\n}\nfunction clamp(x){return Math.min(SMOOTH_HI,Math.max(SMOOTH_LO,x));}\nfunction goldenMin(f,lo=SMOOTH_LO,hi=SMOOTH_HI,iters=80){\nconst invphi=(Math.sqrt(5)-1)/2;\nlet a=lo;\nlet b=hi;\nlet c=b-invphi*(b-a);\nlet d=a+invphi*(b-a);\nlet fc=f(c);\nlet fd=f(d);\nfor(let i=0;i<iters;i++){\nif(fc<fd){b=d;d=c;fd=fc;c=b-invphi*(b-a);fc=f(c);}\nelse{a=c;c=d;fc=fd;d=a+invphi*(b-a);fd=f(d);}\n}\nreturn(a+b)/2;\n}\nfunction runSes(y,alpha){\nlet level=null;\nlet sse=0;\nlet m=0;\nfor(let i=0;i<y.length;i++){\nconst v=y[i];\nif(v===null)continue;\nif(level===null){level=v;continue;}\nsse+=(v-level)**2;\nm+=1;\nlevel=alpha*v+(1-alpha)*level;\n}\nreturn{level,sse,m};\n}\nfunction runHolt(y,alpha,beta){\nlet level=null;\nlet trend=null;\nlet sse=0;\nlet m=0;\nfor(let i=0;i<y.length;i++){\nconst v=y[i];\nif(v===null){if(level!==null&&trend!==null)level+=trend;continue;}\nif(level===null){level=v;continue;}\nif(trend===null){trend=v-level;}\nconst forecast=level+trend;\nsse+=(v-forecast)**2;\nm+=1;\nconst prev=level;\nlevel=alpha*v+(1-alpha)*(prev+trend);\ntrend=beta*(level-prev)+(1-beta)*trend;\n}\nreturn{level,trend,sse,m};\n}\nfunction runHoltWinters(y,m,alpha,beta,gamma){\nconst n=y.length;\nif(n<2*m)return null;\nconst seasonMean=(from)=>{\nlet s=0;\nlet c=0;\nfor(let i=from;i<from+m&&i<n;i++)if(y[i]!==null){s+=y[i];c+=1;}\nreturn c?s/c:null;\n};\nconst m0=seasonMean(0);\nconst m1=seasonMean(m);\nif(m0===null||m1===null)return null;\nlet level=m0;\nlet trend=(m1-m0)/m;\nconst season=new Array(m).fill(0);\nfor(let i=0;i<m;i++)season[i]=(y[i]===null?0:y[i]-level);\nconst bias=season.reduce((a,b)=>a+b,0)/m;\nfor(let i=0;i<m;i++)season[i]-=bias;\nlet sse=0;\nlet count=0;\nfor(let t=m;t<n;t++){\nconst phase=t%m;\nconst s=season[phase];\nconst v=y[t];\nif(v===null){level+=trend;continue;}\nconst forecast=level+trend+s;\nsse+=(v-forecast)**2;\ncount+=1;\nconst prevLevel=level;\nlevel=alpha*(v-s)+(1-alpha)*(level+trend);\ntrend=beta*(level-prevLevel)+(1-beta)*trend;\nseason[phase]=gamma*(v-level)+(1-gamma)*s;\n}\nreturn{level,trend,season,phase:(n-1)%m,sse,count};\n}\nfunction esBand(sigma2,c,z){\nlet acc=1;\nfor(const cj of c)acc+=cj*cj;\nconst se=Math.sqrt(sigma2*acc);\nreturn{se,margin:z*se};\n}\nfunction forecast(seq,opts={}){\nif(!seq||typeof seq.length!=='number'||seq.length===0)return null;\nconst method=FORECAST_METHODS.includes(opts.method)?opts.method:'linear';\nconst horizon=Math.max(1,Math.floor(Number(opts.horizon)||1));\nconst conf=Number.isFinite(opts.confidence)&&opts.confidence>0&&opts.confidence<1\n?opts.confidence:0.95;\nconst tail=1-(1-conf)/2;\nconst rows=normalise(seq);\nconst y=rows.map((r)=>r.value);\nconst finite=y.filter((v)=>v!==null);\nconst n=finite.length;\nconst{lastAt,step}=n?axis(rows):{lastAt:0,step:1};\nconst atOf=(h)=>lastAt+h*step;\nif(method==='linear')return forecastLinear(rows,n,horizon,conf,tail,atOf);\nif(method==='movingAverage')return forecastMovingAverage(finite,n,horizon,conf,tail,opts,atOf);\nif(method==='ses')return forecastSes(y,n,horizon,conf,tail,opts,atOf);\nif(method==='holt')return forecastHolt(y,n,horizon,conf,tail,opts,atOf);\nreturn forecastHoltWinters(y,n,horizon,conf,tail,opts,atOf);\n}\nfunction forecastLinear(rows,n,horizon,conf,tail,atOf){\nif(n<2)return null;\nlet mx=0;\nlet my=0;\nfor(const r of rows)if(r.value!==null){mx+=r.at;my+=r.value;}\nmx/=n;\nmy/=n;\nlet sxx=0;\nlet sxy=0;\nlet syy=0;\nfor(const r of rows){\nif(r.value===null)continue;\nconst dx=r.at-mx;\nconst dy=r.value-my;\nsxx+=dx*dx;\nsxy+=dx*dy;\nsyy+=dy*dy;\n}\nif(sxx===0)return null;\nconst slope=sxy/sxx;\nconst intercept=my-slope*mx;\nconst r2=syy===0?1:Math.max(0,Math.min(1,(sxy*sxy)/(sxx*syy)));\nconst sse=Math.max(0,syy-slope*sxy);\nconst s=n>2?Math.sqrt(sse/(n-2)):null;\nconst t=n>2?studentTQuantile(tail,n-2):null;\nconst points=[];\nfor(let h=1;h<=horizon;h++){\nconst x0=atOf(h);\nconst mean=intercept+slope*x0;\nlet lower=null;\nlet upper=null;\nlet lowerMean=null;\nlet upperMean=null;\nlet se=null;\nif(s!==null){\nconst leverage=1/n+((x0-mx)**2)/sxx;\nconst sePred=s*Math.sqrt(1+leverage);\nconst seMean=s*Math.sqrt(leverage);\nse=sePred;\nlower=mean-t*sePred;\nupper=mean+t*sePred;\nlowerMean=mean-t*seMean;\nupperMean=mean+t*seMean;\n}\npoints.push({step:h,at:x0,mean,lower,upper,lowerMean,upperMean,se});\n}\nreturn{\nmethod:'linear',horizon,confidence:conf,n,sigma:s,r2,\nparams:{slope,intercept},points,\n};\n}\nfunction forecastMovingAverage(finite,n,horizon,conf,tail,opts,atOf){\nif(n<1)return null;\nconst k=Math.max(1,Math.min(n,Math.floor(Number(opts.windowLen)||n)));\nconst recent=finite.slice(n-k);\nlet sum=0;\nfor(const v of recent)sum+=v;\nconst mean=sum/k;\nlet se=null;\nlet t=null;\nif(k>1){\nlet ss=0;\nfor(const v of recent)ss+=(v-mean)**2;\nconst s=Math.sqrt(ss/(k-1));\nse=s*Math.sqrt(1+1/k);\nt=studentTQuantile(tail,k-1);\n}\nconst margin=se===null?null:t*se;\nconst points=[];\nfor(let h=1;h<=horizon;h++){\npoints.push({\nstep:h,at:atOf(h),mean,\nlower:margin===null?null:mean-margin,\nupper:margin===null?null:mean+margin,\nse,\n});\n}\nreturn{\nmethod:'movingAverage',horizon,confidence:conf,n,\nsigma:se===null?null:se,params:{windowLen:k},points,\n};\n}\nfunction forecastSes(y,n,horizon,conf,tail,opts,atOf){\nif(n<1)return null;\nlet alpha=Number.isFinite(opts.alpha)?clamp(opts.alpha):null;\nif(alpha===null)alpha=goldenMin((x)=>runSes(y,x).sse);\nconst run=runSes(y,alpha);\nconst z=normalQuantile(tail);\nconst sigma2=run.m>0?run.sse/run.m:null;\nconst points=[];\nfor(let h=1;h<=horizon;h++){\nconst mean=run.level;\nlet lower=null;\nlet upper=null;\nlet se=null;\nif(sigma2!==null){\nconst c=[];\nfor(let j=1;j<h;j++)c.push(alpha);\nconst band=esBand(sigma2,c,z);\nse=band.se;\nlower=mean-band.margin;\nupper=mean+band.margin;\n}\npoints.push({step:h,at:atOf(h),mean,lower,upper,se});\n}\nreturn{\nmethod:'ses',horizon,confidence:conf,n,\nsigma:sigma2===null?null:Math.sqrt(sigma2),params:{alpha},points,\n};\n}\nfunction forecastHolt(y,n,horizon,conf,tail,opts,atOf){\nif(n<2)return null;\nlet alpha=Number.isFinite(opts.alpha)?clamp(opts.alpha):null;\nlet beta=Number.isFinite(opts.beta)?clamp(opts.beta):null;\nif(alpha===null||beta===null){\nlet a=alpha===null?0.5:alpha;\nlet b=beta===null?0.5:beta;\nfor(let round=0;round<6;round++){\nif(alpha===null)a=goldenMin((x)=>runHolt(y,x,b).sse);\nif(beta===null)b=goldenMin((x)=>runHolt(y,a,x).sse);\n}\nalpha=alpha===null?a:alpha;\nbeta=beta===null?b:beta;\n}\nconst run=runHolt(y,alpha,beta);\nconst z=normalQuantile(tail);\nconst sigma2=run.m>0?run.sse/run.m:null;\nconst phi=alpha*beta;\nconst points=[];\nfor(let h=1;h<=horizon;h++){\nconst mean=run.level+h*run.trend;\nlet lower=null;\nlet upper=null;\nlet se=null;\nif(sigma2!==null){\nconst c=[];\nfor(let j=1;j<h;j++)c.push(alpha+j*phi);\nconst band=esBand(sigma2,c,z);\nse=band.se;\nlower=mean-band.margin;\nupper=mean+band.margin;\n}\npoints.push({step:h,at:atOf(h),mean,lower,upper,se});\n}\nreturn{\nmethod:'holt',horizon,confidence:conf,n,\nsigma:sigma2===null?null:Math.sqrt(sigma2),params:{alpha,beta},points,\n};\n}\nfunction forecastHoltWinters(y,n,horizon,conf,tail,opts,atOf){\nconst m=Math.floor(Number(opts.period));\nif(!(m>=2)){\nwarnOnce('forecast.holtWinters.period','forecast: holtWinters needs a period (opts.period >= 2)');\nreturn null;\n}\nif(n<2*m)return null;\nlet alpha=Number.isFinite(opts.alpha)?clamp(opts.alpha):null;\nlet beta=Number.isFinite(opts.beta)?clamp(opts.beta):null;\nlet gamma=Number.isFinite(opts.gamma)?clamp(opts.gamma):null;\nconst sseAt=(a,b,g)=>{\nconst r=runHoltWinters(y,m,a,b,g);\nreturn r?r.sse:Infinity;\n};\nif(alpha===null||beta===null||gamma===null){\nlet a=alpha===null?0.5:alpha;\nlet b=beta===null?0.5:beta;\nlet g=gamma===null?0.5:gamma;\nfor(let round=0;round<8;round++){\nif(alpha===null)a=goldenMin((x)=>sseAt(x,b,g));\nif(beta===null)b=goldenMin((x)=>sseAt(a,x,g));\nif(gamma===null)g=goldenMin((x)=>sseAt(a,b,x));\n}\nalpha=alpha===null?a:alpha;\nbeta=beta===null?b:beta;\ngamma=gamma===null?g:gamma;\n}\nconst run=runHoltWinters(y,m,alpha,beta,gamma);\nif(!run)return null;\nconst z=normalQuantile(tail);\nconst sigma2=run.count>0?run.sse/run.count:null;\nconst phi=alpha*beta;\nconst gs=gamma*(1-alpha);\nconst points=[];\nfor(let h=1;h<=horizon;h++){\nconst s=run.season[(run.phase+h)%m];\nconst mean=run.level+h*run.trend+s;\nlet lower=null;\nlet upper=null;\nlet se=null;\nif(sigma2!==null){\nconst c=[];\nfor(let j=1;j<h;j++)c.push(alpha+j*phi+(j%m===0?gs:0));\nconst band=esBand(sigma2,c,z);\nse=band.se;\nlower=mean-band.margin;\nupper=mean+band.margin;\n}\npoints.push({step:h,at:atOf(h),mean,lower,upper,se});\n}\nreturn{\nmethod:'holtWinters',horizon,confidence:conf,n,\nsigma:sigma2===null?null:Math.sqrt(sigma2),\nparams:{alpha,beta,gamma,period:m},points,\n};\n}\nconst __default={FORECAST_METHODS,forecast};\n});\n__def(\"packages/core/src/compute/index.js\",function(__exports,__req){\n'use strict';\nconst __m0=__req(\"packages/core/src/compute/sort.js\");\nObject.defineProperty(__exports,\"sortColumn\",{enumerable:true,get:function(){return __m0[\"sortColumn\"];}});\nObject.defineProperty(__exports,\"sortMulti\",{enumerable:true,get:function(){return __m0[\"sortMulti\"];}});\nObject.defineProperty(__exports,\"radixSortFloat64\",{enumerable:true,get:function(){return __m0[\"radixSortFloat64\"];}});\nObject.defineProperty(__exports,\"radixSortInt32\",{enumerable:true,get:function(){return __m0[\"radixSortInt32\"];}});\nObject.defineProperty(__exports,\"rankSortDictionary\",{enumerable:true,get:function(){return __m0[\"rankSortDictionary\"];}});\nObject.defineProperty(__exports,\"mergeSortComparator\",{enumerable:true,get:function(){return __m0[\"mergeSortComparator\"];}});\nObject.defineProperty(__exports,\"collateStringRanks\",{enumerable:true,get:function(){return __m0[\"collateStringRanks\"];}});\nObject.defineProperty(__exports,\"rankSortStrings\",{enumerable:true,get:function(){return __m0[\"rankSortStrings\"];}});\nconst __m1=__req(\"packages/core/src/compute/sortspec.js\");\nObject.defineProperty(__exports,\"collationDescriptor\",{enumerable:true,get:function(){return __m1[\"collationDescriptor\"];}});\nObject.defineProperty(__exports,\"isPortableSort\",{enumerable:true,get:function(){return __m1[\"isPortableSort\"];}});\nObject.defineProperty(__exports,\"isPortableSortSet\",{enumerable:true,get:function(){return __m1[\"isPortableSortSet\"];}});\nObject.defineProperty(__exports,\"describeSortEntry\",{enumerable:true,get:function(){return __m1[\"describeSortEntry\"];}});\nObject.defineProperty(__exports,\"describeSort\",{enumerable:true,get:function(){return __m1[\"describeSort\"];}});\nconst __m2=__req(\"packages/core/src/compute/filter.js\");\nObject.defineProperty(__exports,\"evaluateFilters\",{enumerable:true,get:function(){return __m2[\"evaluateFilters\"];}});\nObject.defineProperty(__exports,\"evaluateCondition\",{enumerable:true,get:function(){return __m2[\"evaluateCondition\"];}});\nObject.defineProperty(__exports,\"compact\",{enumerable:true,get:function(){return __m2[\"compact\"];}});\nObject.defineProperty(__exports,\"testValue\",{enumerable:true,get:function(){return __m2[\"testValue\"];}});\nObject.defineProperty(__exports,\"compilePredicate\",{enumerable:true,get:function(){return __m2[\"compilePredicate\"];}});\nObject.defineProperty(__exports,\"releaseMask\",{enumerable:true,get:function(){return __m2[\"releaseMask\"];}});\nObject.defineProperty(__exports,\"pruneColumn\",{enumerable:true,get:function(){return __m2[\"pruneColumn\"];}});\nObject.defineProperty(__exports,\"mentionsColumn\",{enumerable:true,get:function(){return __m2[\"mentionsColumn\"];}});\nconst __m3=__req(\"packages/core/src/compute/group.js\");\nObject.defineProperty(__exports,\"groupByColumns\",{enumerable:true,get:function(){return __m3[\"groupByColumns\"];}});\nObject.defineProperty(__exports,\"packKeys\",{enumerable:true,get:function(){return __m3[\"packKeys\"];}});\nconst __m4=__req(\"packages/core/src/compute/facet.js\");\nObject.defineProperty(__exports,\"facet\",{enumerable:true,get:function(){return __m4[\"facet\"];}});\nObject.defineProperty(__exports,\"computeBounds\",{enumerable:true,get:function(){return __m4[\"computeBounds\"];}});\nObject.defineProperty(__exports,\"countInto\",{enumerable:true,get:function(){return __m4[\"countInto\"];}});\nObject.defineProperty(__exports,\"bucketOf\",{enumerable:true,get:function(){return __m4[\"bucketOf\"];}});\nObject.defineProperty(__exports,\"facetKind\",{enumerable:true,get:function(){return __m4[\"facetKind\"];}});\nObject.defineProperty(__exports,\"cardinalityOf\",{enumerable:true,get:function(){return __m4[\"cardinalityOf\"];}});\nObject.defineProperty(__exports,\"pickGranularity\",{enumerable:true,get:function(){return __m4[\"pickGranularity\"];}});\nObject.defineProperty(__exports,\"floorTo\",{enumerable:true,get:function(){return __m4[\"floorTo\"];}});\nObject.defineProperty(__exports,\"advance\",{enumerable:true,get:function(){return __m4[\"advance\"];}});\nObject.defineProperty(__exports,\"STRATEGIES\",{enumerable:true,get:function(){return __m4[\"STRATEGIES\"];}});\nObject.defineProperty(__exports,\"GRANULARITIES\",{enumerable:true,get:function(){return __m4[\"GRANULARITIES\"];}});\nObject.defineProperty(__exports,\"DEFAULT_BUCKETS\",{enumerable:true,get:function(){return __m4[\"DEFAULT_BUCKETS\"];}});\nObject.defineProperty(__exports,\"DEFAULT_CARDINALITY_LIMIT\",{enumerable:true,get:function(){return __m4[\"DEFAULT_CARDINALITY_LIMIT\"];}});\nObject.defineProperty(__exports,\"QUANTILE_SAMPLE\",{enumerable:true,get:function(){return __m4[\"QUANTILE_SAMPLE\"];}});\nconst __m5=__req(\"packages/core/src/compute/total.js\");\nObject.defineProperty(__exports,\"TOTAL_FNS\",{enumerable:true,get:function(){return __m5[\"TOTAL_FNS\"];}});\nObject.defineProperty(__exports,\"TOTAL_LABELS\",{enumerable:true,get:function(){return __m5[\"TOTAL_LABELS\"];}});\nObject.defineProperty(__exports,\"totalLabel\",{enumerable:true,get:function(){return __m5[\"totalLabel\"];}});\nObject.defineProperty(__exports,\"total\",{enumerable:true,get:function(){return __m5[\"total\"];}});\nObject.defineProperty(__exports,\"collectValues\",{enumerable:true,get:function(){return __m5[\"collectValues\"];}});\nconst __m6=__req(\"packages/core/src/compute/pivot.js\");\nObject.defineProperty(__exports,\"pivot\",{enumerable:true,get:function(){return __m6[\"pivot\"];}});\nObject.defineProperty(__exports,\"resolvePivotKeys\",{enumerable:true,get:function(){return __m6[\"resolvePivotKeys\"];}});\nObject.defineProperty(__exports,\"pivotKey\",{enumerable:true,get:function(){return __m6[\"pivotKey\"];}});\nObject.defineProperty(__exports,\"joinPath\",{enumerable:true,get:function(){return __m6[\"joinPath\"];}});\nObject.defineProperty(__exports,\"KEY_DELIMITER\",{enumerable:true,get:function(){return __m6[\"KEY_DELIMITER\"];}});\nObject.defineProperty(__exports,\"DEFAULT_PATH_SEPARATOR\",{enumerable:true,get:function(){return __m6[\"DEFAULT_PATH_SEPARATOR\"];}});\nObject.defineProperty(__exports,\"DEFAULT_MAX_COLUMNS\",{enumerable:true,get:function(){return __m6[\"DEFAULT_MAX_COLUMNS\"];}});\nconst __m7=__req(\"packages/core/src/compute/pivotmatrix.js\");\nObject.defineProperty(__exports,\"pivotMatrix\",{enumerable:true,get:function(){return __m7[\"pivotMatrix\"];}});\nObject.defineProperty(__exports,\"resolveAxis\",{enumerable:true,get:function(){return __m7[\"resolveAxis\"];}});\nObject.defineProperty(__exports,\"cellKey\",{enumerable:true,get:function(){return __m7[\"cellKey\"];}});\nObject.defineProperty(__exports,\"marginKey\",{enumerable:true,get:function(){return __m7[\"marginKey\"];}});\nObject.defineProperty(__exports,\"GRAND_PATH\",{enumerable:true,get:function(){return __m7[\"GRAND_PATH\"];}});\nconst __m8=__req(\"packages/core/src/compute/reference.js\");\nObject.defineProperty(__exports,\"referenceSort\",{enumerable:true,get:function(){return __m8[\"referenceSort\"];}});\nObject.defineProperty(__exports,\"referenceFilter\",{enumerable:true,get:function(){return __m8[\"referenceFilter\"];}});\nObject.defineProperty(__exports,\"referenceGroup\",{enumerable:true,get:function(){return __m8[\"referenceGroup\"];}});\nObject.defineProperty(__exports,\"referenceTotal\",{enumerable:true,get:function(){return __m8[\"referenceTotal\"];}});\nObject.defineProperty(__exports,\"referencePasses\",{enumerable:true,get:function(){return __m8[\"referencePasses\"];}});\nObject.defineProperty(__exports,\"referenceValue\",{enumerable:true,get:function(){return __m8[\"referenceValue\"];}});\nconst __m9=__req(\"packages/core/src/compute/handle.js\");\nObject.defineProperty(__exports,\"identity\",{enumerable:true,get:function(){return __m9[\"identity\"];}});\nObject.defineProperty(__exports,\"rowCount\",{enumerable:true,get:function(){return __m9[\"rowCount\"];}});\nObject.defineProperty(__exports,\"presenceReader\",{enumerable:true,get:function(){return __m9[\"presenceReader\"];}});\nObject.defineProperty(__exports,\"bitReader\",{enumerable:true,get:function(){return __m9[\"bitReader\"];}});\nObject.defineProperty(__exports,\"valueReader\",{enumerable:true,get:function(){return __m9[\"valueReader\"];}});\nObject.defineProperty(__exports,\"valueComparator\",{enumerable:true,get:function(){return __m9[\"valueComparator\"];}});\nObject.defineProperty(__exports,\"numericTotalOrder\",{enumerable:true,get:function(){return __m9[\"numericTotalOrder\"];}});\nObject.defineProperty(__exports,\"dictRanks\",{enumerable:true,get:function(){return __m9[\"dictRanks\"];}});\nObject.defineProperty(__exports,\"dictSize\",{enumerable:true,get:function(){return __m9[\"dictSize\"];}});\nObject.defineProperty(__exports,\"dictValue\",{enumerable:true,get:function(){return __m9[\"dictValue\"];}});\nObject.defineProperty(__exports,\"multiValue\",{enumerable:true,get:function(){return __m9[\"multiValue\"];}});\nObject.defineProperty(__exports,\"isMissing\",{enumerable:true,get:function(){return __m9[\"isMissing\"];}});\nconst __m10=__req(\"packages/core/src/compute/sketch.js\");\nObject.defineProperty(__exports,\"Welford\",{enumerable:true,get:function(){return __m10[\"Welford\"];}});\nObject.defineProperty(__exports,\"Reservoir\",{enumerable:true,get:function(){return __m10[\"Reservoir\"];}});\nObject.defineProperty(__exports,\"HyperLogLog\",{enumerable:true,get:function(){return __m10[\"HyperLogLog\"];}});\nObject.defineProperty(__exports,\"SpaceSaving\",{enumerable:true,get:function(){return __m10[\"SpaceSaving\"];}});\nObject.defineProperty(__exports,\"KLL\",{enumerable:true,get:function(){return __m10[\"KLL\"];}});\nObject.defineProperty(__exports,\"hash32\",{enumerable:true,get:function(){return __m10[\"hash32\"];}});\nObject.defineProperty(__exports,\"SKETCH_BOUNDS\",{enumerable:true,get:function(){return __m10[\"SKETCH_BOUNDS\"];}});\nconst __m11=__req(\"packages/core/src/compute/windowed.js\");\nObject.defineProperty(__exports,\"Window\",{enumerable:true,get:function(){return __m11[\"Window\"];}});\nObject.defineProperty(__exports,\"WINDOW_KINDS\",{enumerable:true,get:function(){return __m11[\"WINDOW_KINDS\"];}});\nObject.defineProperty(__exports,\"openWindow\",{enumerable:true,get:function(){return __m11[\"openWindow\"];}});\nconst __m12=__req(\"packages/core/src/compute/statistics.js\");\nObject.defineProperty(__exports,\"MAINTENANCE\",{enumerable:true,get:function(){return __m12[\"MAINTENANCE\"];}});\nObject.defineProperty(__exports,\"APPROXIMATE\",{enumerable:true,get:function(){return __m12[\"APPROXIMATE\"];}});\nObject.defineProperty(__exports,\"maintenanceOf\",{enumerable:true,get:function(){return __m12[\"maintenanceOf\"];}});\nconst __m13=__req(\"packages/core/src/compute/anomaly.js\");\nObject.defineProperty(__exports,\"ANOMALY_METHODS\",{enumerable:true,get:function(){return __m13[\"ANOMALY_METHODS\"];}});\nObject.defineProperty(__exports,\"modifiedZScores\",{enumerable:true,get:function(){return __m13[\"modifiedZScores\"];}});\nObject.defineProperty(__exports,\"iqrFences\",{enumerable:true,get:function(){return __m13[\"iqrFences\"];}});\nObject.defineProperty(__exports,\"mahalanobis\",{enumerable:true,get:function(){return __m13[\"mahalanobis\"];}});\nObject.defineProperty(__exports,\"ROLLING_ANOMALY_METHODS\",{enumerable:true,get:function(){return __m13[\"ROLLING_ANOMALY_METHODS\"];}});\nObject.defineProperty(__exports,\"rollingAnomalies\",{enumerable:true,get:function(){return __m13[\"rollingAnomalies\"];}});\nObject.defineProperty(__exports,\"anomalyCondition\",{enumerable:true,get:function(){return __m13[\"anomalyCondition\"];}});\nconst __m14=__req(\"packages/core/src/compute/forecast.js\");\nObject.defineProperty(__exports,\"FORECAST_METHODS\",{enumerable:true,get:function(){return __m14[\"FORECAST_METHODS\"];}});\nObject.defineProperty(__exports,\"forecast\",{enumerable:true,get:function(){return __m14[\"forecast\"];}});\n});\n__def(\"packages/worker/src/kernel.js\",function(__exports,__req){\n'use strict';\nObject.defineProperty(__exports,\"loadCompute\",{enumerable:true,get:function(){return loadCompute;}});\nObject.defineProperty(__exports,\"setCompute\",{enumerable:true,get:function(){return setCompute;}});\nObject.defineProperty(__exports,\"dispatch\",{enumerable:true,get:function(){return dispatch;}});\nObject.defineProperty(__exports,\"handleMessage\",{enumerable:true,get:function(){return handleMessage;}});\nObject.defineProperty(__exports,\"installKernel\",{enumerable:true,get:function(){return installKernel;}});\nconst __m0=__req(\"packages/worker/src/transport.js\");\nconst PROTOCOL=__m0[\"PROTOCOL\"];\nconst OPS=__m0[\"OPS\"];\nconst CONTROL=__m0[\"CONTROL\"];\nconst ERRORS=__m0[\"ERRORS\"];\nconst unpackHandle=__m0[\"unpackHandle\"];\nconst unpackHandles=__m0[\"unpackHandles\"];\nconst createMaskPool=__m0[\"createMaskPool\"];\nconst collectTransfers=__m0[\"collectTransfers\"];\nconst __m1=__req(\"packages/core/src/store/columnpack.js\");\nconst packChunk=__m1[\"packChunk\"];\nconst packedTransfers=__m1[\"packedTransfers\"];\nlet computeModule=null;\nlet computePromise=null;\nlet computeError=null;\nasync function loadCompute(loader){\nif(computeModule)return computeModule;\nif(!computePromise){\nconst load=loader||(()=>Promise.resolve(__req(\"packages/core/src/compute/index.js\")));\ncomputePromise=Promise.resolve()\n.then(load)\n.then((mod)=>{computeModule=mod;return mod;})\n.catch((err)=>{\ncomputeError=err;\ncomputeModule=null;\nreturn null;\n});\n}\nreturn computePromise;\n}\nfunction setCompute(mod){\ncomputeModule=mod;\ncomputePromise=mod?Promise.resolve(mod):null;\ncomputeError=mod?null:computeError;\n}\nfunction filterContext(handles,count,locale){\nconst byId=new Map();\nfor(const h of handles)if(h)byId.set(h.id,h);\nreturn{\nhandle(colId){return byId.get(colId);},\ncount,\npool:createMaskPool(),\nlocale,\n};\n}\nfunction dispatch(request,compute){\nconst{op,args}=request;\nif(op===OPS.COLUMNIZE){\nreturn packChunk(args.schema||[],args.rows||[],args.opts||{});\n}\nconst fn=compute[op];\nif(typeof fn!=='function'){\nconst err=new Error(`[lattice] compute kernel '${op}' is not exported`);\n(err).code=ERRORS.NO_KERNEL;\nthrow err;\n}\nswitch(op){\ncase OPS.COLLATE_STRING_RANKS:\nreturn fn(args.table||[],(args.table||[]).length,args.locale);\ncase OPS.SORT_COLUMN:\nreturn fn(unpackHandle(args.handle),args.order??null,args.opts||{});\ncase OPS.SORT_MULTI:{\nconst handles=unpackHandles(args.handles||[]);\nconst entries=(args.entries||[]).map((e)=>({\n...e,\nhandle:handles[e.index],\n}));\nreturn fn(handles,entries,args.order??null);\n}\ncase OPS.EVALUATE_FILTERS:\nreturn fn(args.filters,filterContext(unpackHandles(args.handles||[]),args.count,args.locale));\ncase OPS.COMPACT:\nreturn fn(args.mask,args.count,undefined);\ncase OPS.GROUP_BY_COLUMNS:\nreturn fn(unpackHandles(args.handles||[]),args.order??null,args.opts||{});\ncase OPS.TOTAL:\nreturn fn(unpackHandle(args.handle),args.indices??null,args.fn);\ncase OPS.PIVOT:\nreturn fn(unpackHandles(args.handles||[]),args.order??null,args.opts||{});\ncase OPS.FACET:\nreturn fn(unpackHandle(args.handle),args.indices??null,args.count,args.opts||{});\ndefault:{\nconst err=new Error(`[lattice] unknown worker op '${op}'`);\n(err).code=ERRORS.PROTOCOL;\nthrow err;\n}\n}\n}\nasync function handleMessage(message,opts={}){\nif(!message||message.lattice!==PROTOCOL)return null;\nconst{id,op}=message;\nif(op===CONTROL.CANCEL){\nopts.cancelled?.add(message.target);\nreturn null;\n}\nif(op===CONTROL.PING){\nreturn{reply:{lattice:PROTOCOL,id,ok:true,result:'pong'},transfer:[]};\n}\nif(op===OPS.COLUMNIZE){\nif(opts.cancelled?.has(id)){opts.cancelled.delete(id);return null;}\ntry{\nconst result=packChunk(message.args.schema||[],message.args.rows||[],message.args.opts||{});\nif(opts.cancelled?.has(id)){\nopts.cancelled.delete(id);\nreturn{reply:{lattice:PROTOCOL,id,ok:false,error:{code:ERRORS.ABORTED,message:'[lattice] request superseded'}},transfer:[]};\n}\nreturn{reply:{lattice:PROTOCOL,id,ok:true,result},transfer:packedTransfers(result)};\n}catch(err){\nconst e=(err);\nreturn{\nreply:{lattice:PROTOCOL,id,ok:false,error:{code:e.code||ERRORS.KERNEL,message:e.message||String(err),stack:e.stack}},\ntransfer:[],\n};\n}\n}\nconst compute=await loadCompute(opts.loader);\nif(!compute){\nreturn{\nreply:{\nlattice:PROTOCOL,\nid,\nok:false,\nerror:{\ncode:ERRORS.NO_COMPUTE,\nmessage:`[lattice] compute kernels unavailable in worker: ${computeError?computeError.message:'module not found'}`,\n},\n},\ntransfer:[],\n};\n}\nif(opts.cancelled?.has(id)){\nopts.cancelled.delete(id);\nreturn{reply:{lattice:PROTOCOL,id,ok:false,error:{code:ERRORS.ABORTED,message:'[lattice] request superseded'}},transfer:[]};\n}\ntry{\nconst result=dispatch(message,compute);\nif(opts.cancelled?.has(id)){\nopts.cancelled.delete(id);\nreturn{reply:{lattice:PROTOCOL,id,ok:false,error:{code:ERRORS.ABORTED,message:'[lattice] request superseded'}},transfer:[]};\n}\nreturn{reply:{lattice:PROTOCOL,id,ok:true,result},transfer:collectTransfers(result)};\n}catch(err){\nconst e=(err);\nreturn{\nreply:{\nlattice:PROTOCOL,\nid,\nok:false,\nerror:{code:e.code||ERRORS.KERNEL,message:e.message||String(err),stack:e.stack},\n},\ntransfer:[],\n};\n}\n}\nfunction installKernel(scope,opts={}){\nconst cancelled=new Set();\nconst onMessage=async(event)=>{\nconst outcome=await handleMessage(event.data,{loader:opts.loader,cancelled});\nif(!outcome)return;\nscope.postMessage(outcome.reply,outcome.transfer);\n};\nscope.addEventListener('message',onMessage);\nloadCompute(opts.loader).then((mod)=>{\nscope.postMessage({lattice:PROTOCOL,id:0,op:CONTROL.READY,compute:!!mod});\n});\nreturn()=>scope.removeEventListener('message',onMessage);\n}\n});\nvar __entry=__req(\"packages/worker/src/kernel.js\");\nroot[\"__latticeKernel\"]=__entry;\n})(typeof globalThis!=='undefined'?globalThis:this);\n__latticeKernel.installKernel(self);\n",{type:'classic'});
}catch(err){}
var __entry=__req("packages/modules/ai/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridAI"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);