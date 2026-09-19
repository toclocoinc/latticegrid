/*!
 * Lattice Grid 1.65.0, tabs module
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
const STAMPED_VERSION="1.65.0";
async function resolveVersion(){
if(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;
return STAMPED_VERSION;
}
const VERSION="1.65.0";
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
__def("packages/modules/tabs/view.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"NS",{enumerable:true,get:function(){return NS;}});
Object.defineProperty(__exports,"BADGE_TONES",{enumerable:true,get:function(){return BADGE_TONES;}});
Object.defineProperty(__exports,"Emitter",{enumerable:true,get:function(){return Emitter;}});
Object.defineProperty(__exports,"injectStyles",{enumerable:true,get:function(){return injectStyles;}});
Object.defineProperty(__exports,"renderShell",{enumerable:true,get:function(){return renderShell;}});
Object.defineProperty(__exports,"paintBadge",{enumerable:true,get:function(){return paintBadge;}});
Object.defineProperty(__exports,"setRoving",{enumerable:true,get:function(){return setRoving;}});
Object.defineProperty(__exports,"wireKeyboard",{enumerable:true,get:function(){return wireKeyboard;}});
Object.defineProperty(__exports,"paintActive",{enumerable:true,get:function(){return paintActive;}});
Object.defineProperty(__exports,"revealPanel",{enumerable:true,get:function(){return revealPanel;}});
Object.defineProperty(__exports,"announce",{enumerable:true,get:function(){return announce;}});
const __m0=__req("packages/core/src/internal/util.js");
const isFunction=__m0["isFunction"];
const warnOnce=__m0["warnOnce"];
const NS='lat-tabs';
const BADGE_TONES=Object.freeze(['good','warn','bad','unknown']);
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
const resolved=(chosen==='api'||chosen==='user'||chosen==='init')?chosen:'user';
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
}catch{
prevent('error');
}
}
if(pending.length===0)return settle();
return Promise.allSettled(pending).then((results)=>{
for(const res of results){
if(res.status==='rejected')prevent('error');
else if(res.value===false)prevent('prevented');
}
return settle();
});
}
}
function injectStyles(doc){
if(!doc||(doc.getElementById&&doc.getElementById(`${NS}-styles`)))return;
const style=doc.createElement('style');
style.id=`${NS}-styles`;
style.setAttribute('id',`${NS}-styles`);
style.textContent=`
.${NS}{display:flex;flex-direction:column;height:100%;
  font-family:var(--${NS}-font-family,var(--lattice-font-family,var(--lat-chrome-font-family,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif)));
  font-size:var(--${NS}-font-size,var(--lattice-font-size,var(--lat-chrome-font-size,13px)));
  line-height:var(--${NS}-line-height,var(--lattice-line-height,var(--lat-chrome-line-height,1.4)))}
.${NS} .${NS}__list{display:flex;flex-wrap:wrap;gap:var(--${NS}-gap,0);background:var(--${NS}-band,#f7f8f9);
  border-bottom:1px solid var(--${NS}-border,#d7dbe0);padding:0;flex:0 0 auto}
.${NS} .${NS}__tab{font:inherit;appearance:none;display:inline-flex;align-items:center;justify-content:center;
  gap:var(--${NS}-item-gap,6px);min-height:var(--${NS}-min-height,var(--lat-chrome-header-height,24px));
  max-width:100%;
  border:0;border-radius:0;background:transparent;
  padding:var(--${NS}-pad-y,5px) var(--${NS}-pad-x,12px);cursor:pointer;color:var(--${NS}-muted,#586069)}
.${NS} .${NS}__tab + .${NS}__tab{border-left:1px solid var(--${NS}-separator,#e7eaee)}
.${NS} .${NS}__tab:hover{background:var(--${NS}-hover,#ebeef1)}
.${NS} .${NS}__tab:focus-visible{outline:2px solid var(--${NS}-focus,#2563eb);outline-offset:var(--${NS}-focus-offset,-4px)}
.${NS} .${NS}__tab[aria-selected="true"]{background:var(--${NS}-bg,#fff);color:var(--${NS}-active,#14171a);font-weight:600;
  margin-bottom:-1px;padding-bottom:calc(var(--${NS}-pad-y,5px) + 1px);
  box-shadow:inset 0 calc(-1 * var(--${NS}-accent-width,2px)) 0 0 var(--${NS}-accent,#1a6bc7)}
.${NS} .${NS}__icon{flex:none;display:inline-flex;align-items:center;justify-content:center;line-height:1}
.${NS} .${NS}__label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${NS} .${NS}__badge{flex:none;display:inline-flex;align-items:center;justify-content:center;
  min-width:var(--${NS}-badge-size,1.5em);padding:0 var(--${NS}-badge-pad,0.4em);
  border-radius:var(--${NS}-badge-radius,999px);font-size:var(--${NS}-badge-font-size,0.85em);
  font-weight:600;font-variant-numeric:tabular-nums;
  background:var(--${NS}-badge-bg,#e7eaee);color:var(--${NS}-badge-fg,#41474d)}
.${NS} .${NS}__badge[data-tone="good"]{background:var(--${NS}-badge-good-bg,#dcf3e4);color:var(--${NS}-badge-good-fg,#11632f)}
.${NS} .${NS}__badge[data-tone="warn"]{background:var(--${NS}-badge-warn-bg,#fdf0d5);color:var(--${NS}-badge-warn-fg,#7a4c05)}
.${NS} .${NS}__badge[data-tone="bad"]{background:var(--${NS}-badge-bad-bg,#fbe0e0);color:var(--${NS}-badge-bad-fg,#8a1c1c)}
.${NS} .${NS}__badge[data-tone="unknown"]{background:none;color:var(--${NS}-badge-unknown-fg,#586069);
  box-shadow:inset 0 0 0 1px var(--${NS}-badge-unknown-edge,#c3c9d0)}
.${NS}__unit{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.${NS}__panels{position:relative;flex:1 1 auto;min-height:0}
.${NS}__panel{position:absolute;inset:0}
.${NS}__panel[hidden]{display:none}
.${NS}__body{position:absolute;inset:0}
.${NS}__live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;
(doc.head||doc.documentElement).appendChild(style);
}
function renderShell(state){
const{doc,el,order}=state;
injectStyles(doc);
el.classList.add(NS);
const root=doc.createElement('div');
root.className=NS;
const list=doc.createElement('div');
list.className=`${NS}__list`;
list.setAttribute('role','tablist');
list.setAttribute('aria-label',state.ariaLabel);
if(state.orientation)list.setAttribute('aria-orientation',state.orientation);
const panels=doc.createElement('div');
panels.className=`${NS}__panels`;
for(let i=0;i<order.length;i++){
const id=order[i];
const desc=state.byId.get(id);
const tabDomId=`${state.baseId}-tab-${i}`;
const panelDomId=`${state.baseId}-panel-${i}`;
const btn=doc.createElement('button');
btn.type='button';
btn.className=`${NS}__tab`;
btn.id=tabDomId;
btn.setAttribute('role','tab');
btn.setAttribute('data-tab-id',id);
btn.setAttribute('aria-selected','false');
btn.setAttribute('aria-controls',panelDomId);
btn.setAttribute('tabindex','-1');
fillTab(state,btn,desc);
list.appendChild(btn);
state.tabButtons.set(id,btn);
const panel=doc.createElement('div');
panel.className=`${NS}__panel`;
panel.id=panelDomId;
panel.setAttribute('role','tabpanel');
panel.setAttribute('aria-labelledby',tabDomId);
panel.setAttribute('data-tab-id',id);
panel.hidden=true;
if(desc.ariaLabel)panel.setAttribute('aria-label',desc.ariaLabel);
panels.appendChild(panel);
state.panels.set(id,panel);
}
const live=doc.createElement('div');
live.className=`${NS}__live`;
live.setAttribute('role','status');
live.setAttribute('aria-live','polite');
root.appendChild(list);
root.appendChild(panels);
root.appendChild(live);
el.appendChild(root);
state.rootEl=root;
state.tablistEl=list;
state.panelsEl=panels;
state.liveEl=live;
}
function graphemeCount(text){
if(typeof Intl!=='undefined'&&isFunction(Intl.Segmenter)){
return[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].length;
}
return[...text].length;
}
function renderIcon(state,desc){
const{doc}=state;
const value=desc.icon;
const isElement=typeof value==='object'&&value!==null
&&(value.nodeType===1||isFunction(value.appendChild));
const isGlyph=typeof value==='string'&&value!==''&&graphemeCount(value)===1;
if(!isElement&&!isGlyph){
const got=typeof value==='string'
?`a ${graphemeCount(value)}-character string`
:`${typeof value}`;
warnOnce(
`tabs.icon:${desc.id}`,
`tabs: tab "${desc.id}" — icon must be a single character or emoji, or an Element; got ${got}. `
+'It is ignored. Markup is never parsed here: build the element and pass it instead.',
);
return null;
}
const slot=doc.createElement('span');
slot.className=`${NS}__icon`;
slot.setAttribute('aria-hidden','true');
if(isElement)slot.appendChild(value);
else slot.textContent=value;
return slot;
}
function fillTab(state,btn,desc){
const{doc}=state;
if(desc.icon!=null){
const icon=renderIcon(state,desc);
if(icon)btn.appendChild(icon);
}
const label=doc.createElement('span');
label.className=`${NS}__label`;
label.textContent=desc.label;
btn.appendChild(label);
state.tabLabels.set(desc.id,label);
if(desc.badge==null)return;
const badge=doc.createElement('span');
badge.className=`${NS}__badge`;
badge.hidden=true;
btn.appendChild(badge);
state.tabBadges.set(desc.id,badge);
}
function paintBadge(state,id,text,tone,unit){
const badge=state.tabBadges.get(id);
if(!badge)return;
const show=text!=null&&text!=='';
badge.hidden=!show;
badge.textContent='';
if(!show){
badge.removeAttribute('data-tone');
return;
}
badge.appendChild(state.doc.createTextNode(` ${text}`));
if(unit){
const unitEl=state.doc.createElement('span');
unitEl.className=`${NS}__unit`;
unitEl.textContent=` ${unit}`;
badge.appendChild(unitEl);
}
if(tone)badge.setAttribute('data-tone',tone);
else badge.removeAttribute('data-tone');
}
function setRoving(state,id,focus){
for(const[tid,btn]of state.tabButtons)btn.setAttribute('tabindex',tid===id?'0':'-1');
if(focus){
const btn=state.tabButtons.get(id);
if(btn&&isFunction(btn.focus))btn.focus();
}
}
function wireKeyboard(state,activate){
const tabOf=(target)=>(target&&target.closest?target.closest('[role="tab"]'):null);
state.off.push(listen(state.tablistEl,'keydown',(e)=>{
const btn=tabOf(e.target);
if(!btn)return;
const id=btn.getAttribute('data-tab-id');
const{order}=state;
const at=order.indexOf(id);
if(at===-1)return;
const key=e.key;
const ctrl=e.ctrlKey||e.metaKey;
const horizontal=key==='ArrowLeft'||key==='ArrowRight';
const back=key==='ArrowLeft';
if(horizontal){
const to=ctrl
?(back?0:order.length-1)
:Math.min(order.length-1,Math.max(0,at+(back?-1:1)));
if(to!==at)setRoving(state,order[to],true);
if(e.preventDefault)e.preventDefault();
return;
}
if(key==='Home'||key==='End'){
setRoving(state,key==='Home'?order[0]:order[order.length-1],true);
if(e.preventDefault)e.preventDefault();
return;
}
if(key==='Enter'||key===' '||key==='Spacebar'){
if(e.preventDefault)e.preventDefault();
activate(id,{origin:'user'});
}
}));
state.off.push(listen(state.tablistEl,'click',(e)=>{
const btn=tabOf(e.target);
if(!btn)return;
const id=btn.getAttribute('data-tab-id');
setRoving(state,id,true);
activate(id,{origin:'user'});
}));
}
function listen(target,type,fn){
target.addEventListener(type,fn);
return()=>target.removeEventListener(type,fn);
}
function paintActive(state,id,previousId){
if(previousId!=null&&previousId!==id){
const prevPanel=state.panels.get(previousId);
if(prevPanel)prevPanel.hidden=true;
const prevBtn=state.tabButtons.get(previousId);
if(prevBtn)prevBtn.setAttribute('aria-selected','false');
}
const panel=state.panels.get(id);
if(panel)panel.hidden=false;
const btn=state.tabButtons.get(id);
if(btn)btn.setAttribute('aria-selected','true');
setRoving(state,id,false);
}
function revealPanel(state,id){
const panel=state.panels.get(id);
if(panel)panel.hidden=false;
}
function announce(state,message){
if(state.liveEl)state.liveEl.textContent=message;
}
});
__def("packages/modules/shared/chrome.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"CHROME_TOKENS",{enumerable:true,get:function(){return CHROME_TOKENS;}});
Object.defineProperty(__exports,"findGridRoot",{enumerable:true,get:function(){return findGridRoot;}});
Object.defineProperty(__exports,"syncGridChrome",{enumerable:true,get:function(){return syncGridChrome;}});
Object.defineProperty(__exports,"adoptGridChrome",{enumerable:true,get:function(){return adoptGridChrome;}});
const CHROME_TOKENS=Object.freeze({
'--lattice-font-family':'--lat-chrome-font-family',
'--lattice-font-size':'--lat-chrome-font-size',
'--lattice-line-height':'--lat-chrome-line-height',
'--lattice-header-height':'--lat-chrome-header-height',
'--lattice-row-height':'--lat-chrome-row-height',
'--lattice-space':'--lat-chrome-space',
'--lattice-scale':'--lat-chrome-scale',
});
function findGridRoot(grid){
const host=grid&&grid.element;
if(!host||typeof host!=='object')return null;
if(host.classList&&host.classList.contains('lat-grid-root'))return(host);
if(typeof host.querySelector!=='function')return null;
return host.querySelector('.lat-grid-root');
}
function syncGridChrome(el,grid){
if(!el||!el.style||typeof el.style.setProperty!=='function')return false;
const root=findGridRoot(grid);
const view=root&&root.ownerDocument&&root.ownerDocument.defaultView;
if(!root||!view||typeof view.getComputedStyle!=='function')return false;
const computed=view.getComputedStyle(root);
if(!computed||typeof computed.getPropertyValue!=='function')return false;
for(const[token,published]of Object.entries(CHROME_TOKENS)){
const value=String(computed.getPropertyValue(token)||'').trim();
if(value){
if(el.style.getPropertyValue(published)!==value)el.style.setProperty(published,value);
}else if(typeof el.style.removeProperty==='function'){
el.style.removeProperty(published);
}
}
return true;
}
function adoptGridChrome(el,grid){
const refresh=()=>syncGridChrome(el,grid);
refresh();
let off=null;
if(grid&&typeof grid.on==='function'){
const bound=grid.on('config:changed',refresh);
off=typeof bound==='function'?bound:null;
}
return{
refresh,
release(){
if(off){try{off();}catch{}off=null;}
if(el&&el.style&&typeof el.style.removeProperty==='function'){
for(const published of Object.values(CHROME_TOKENS))el.style.removeProperty(published);
}
},
};
}
});
__def("packages/modules/tabs/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createTabs",{enumerable:true,get:function(){return createTabs;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const isObject=__m0["isObject"];
const isFunction=__m0["isFunction"];
const isNil=__m0["isNil"];
const warnOnce=__m0["warnOnce"];
const fail=__m0["fail"];
const uid=__m0["uid"];
const getPath=__m0["getPath"];
const __m1=__req("packages/modules/tabs/view.js");
const Emitter=__m1["Emitter"];
const renderShell=__m1["renderShell"];
const wireKeyboard=__m1["wireKeyboard"];
const paintActive=__m1["paintActive"];
const revealPanel=__m1["revealPanel"];
const announce=__m1["announce"];
const paintBadge=__m1["paintBadge"];
const BADGE_TONES=__m1["BADGE_TONES"];
const NS=__m1["NS"];
const __m2=__req("packages/modules/shared/chrome.js");
const adoptGridChrome=__m2["adoptGridChrome"];
const TABS_EVENTS=Object.freeze(['beforeTabChange','tab:changed','tabChange:cancelled']);
const BADGE_EVENTS=Object.freeze(['rows:changed','model:changed']);
const DERIVE_KEYS=Object.freeze([
'where','group','groupBy','bucket','join','unnest',
'refresh','crossFilter','follow','limit','sort','profile',
]);
const CALLBACKS=Object.freeze({
onTabChange:'tab:changed',
onBeforeTabChange:'beforeTabChange',
onTabChangeCancelled:'tabChange:cancelled',
});
function resolveMessages(state){
if(state.config.messages&&isFunction(state.config.messages.t))return state.config.messages;
for(const entry of state.instances.values()){
if(entry.grid&&entry.grid.messages&&isFunction(entry.grid.messages.t))return entry.grid.messages;
}
return{t:(key,params)=>formatFallback(key,params)};
}
const FALLBACK_EN=Object.freeze({
'tabs.tablist':'Tabs',
'a11y.tabs.selected':'{label} tab selected',
'a11y.tabs.badgeUnit':'rows',
});
function message(state,key,params){
const resolved=resolveMessages(state).t(key,params);
return resolved===key?formatFallback(key,params):resolved;
}
function formatFallback(key,params){
const template=FALLBACK_EN[key]||key;
if(!params)return template;
return template.replace(/\{(\w+)\}/g,(m,name)=>(name in params?String(params[name]):m));
}
function normaliseTabs(tabs){
if(!Array.isArray(tabs)||tabs.length===0){
fail('tabs: createTabs needs config.tabs — a non-empty array of tab descriptors.');
}
const seen=new Set();
const out=tabs.map((raw,i)=>{
if(!isObject(raw)||isNil(raw.id)||String(raw.id)===''){
fail(`tabs: tab at index ${i} needs a non-empty "id".`);
}
const id=String(raw.id);
if(seen.has(id))fail(`tabs: duplicate tab id "${id}".`);
seen.add(id);
if(!isNil(raw.from)&&!isObject(raw.config)&&isNil(raw.config)){
}
const desc={
id,
label:isNil(raw.label)||raw.label===''?id:String(raw.label),
from:isNil(raw.from)?null:String(raw.from),
config:isObject(raw.config)?raw.config:{},
view:normaliseView(raw.view,id),
ariaLabel:typeof raw.ariaLabel==='string'?raw.ariaLabel:undefined,
icon:isNil(raw.icon)?null:raw.icon,
badge:normaliseBadge(raw.badge,id),
badgeTone:normaliseBadgeTone(raw.badgeTone,id),
};
for(const key of DERIVE_KEYS)if(key in raw)desc[key]=raw[key];
return desc;
});
checkCycles(out);
return out;
}
function normaliseView(raw,id){
if(isNil(raw))return null;
if(isFunction(raw))return raw;
warnOnce(
`tabs.view.type:${id}`,
`tabs: tab "${id}" — view must be a factory function, (el, config) => instance, such as `
+`createKanban or createKPI; got ${typeof raw}. This tab is mounted as an ordinary grid.`,
);
return null;
}
function normaliseBadge(raw,id){
if(isNil(raw)||raw===false)return null;
if(raw===true||typeof raw==='number'||typeof raw==='string')return raw;
if(isFunction(raw))return raw;
warnOnce(
`tabs.badge.type:${id}`,
`tabs: tab "${id}" — badge must be true, a number, a string, or a function; `
+`got ${typeof raw}. No badge is shown for this tab.`,
);
return null;
}
function normaliseBadgeTone(raw,id){
if(isNil(raw))return null;
if(isFunction(raw))return raw;
if(typeof raw==='string'&&BADGE_TONES.includes(raw))return raw;
warnOnce(
`tabs.badgeTone.type:${id}`,
`tabs: tab "${id}" — badgeTone must be one of ${BADGE_TONES.join(', ')}, or a function `
+`returning one; got ${typeof raw==='string'?`"${raw}"`:typeof raw}. The badge is drawn untoned.`,
);
return null;
}
function checkCycles(descriptors){
const byId=new Map(descriptors.map((d)=>[d.id,d]));
for(const d of descriptors){
if(d.from!=null&&!byId.has(d.from)){
fail(`tabs: tab "${d.id}" declares from: "${d.from}", which is not a configured tab id.`);
}
}
const WHITE=0;const GREY=1;const BLACK=2;
const colour=new Map(descriptors.map((d)=>[d.id,WHITE]));
const stack=[];
const visit=(id)=>{
colour.set(id,GREY);
stack.push(id);
const from=byId.get(id).from;
if(from!=null){
const c=colour.get(from);
if(c===GREY){
const start=stack.indexOf(from);
fail(`tabs: cyclic derivation — ${[...stack.slice(start),from].join(' → ')}`);
}
if(c===WHITE)visit(from);
}
stack.pop();
colour.set(id,BLACK);
};
for(const d of descriptors)if(colour.get(d.id)===WHITE)visit(d.id);
}
function buildConfig(desc,parentGrid){
if(!desc.from)return desc.config;
if(desc.config&&desc.config.source){
warnOnce('tabs.source.overridden',
`tab "${desc.id}": config.source is replaced by the derived source built from `
+`from: "${desc.from}" — set the narrowing (where/group/join/…) on the tab `
+'descriptor itself rather than on config.source.');
}
const source={mode:'derived',from:parentGrid};
for(const key of DERIVE_KEYS)if(key in desc)source[key]=desc[key];
return{...desc.config,source};
}
function buildEngineConfig(desc,parentGrid){
const source={mode:'derived',from:parentGrid};
for(const key of DERIVE_KEYS)if(key in desc)source[key]=desc[key];
const config={source};
const{rowKey}=desc.config;
if(typeof rowKey==='string'||isFunction(rowKey))config.rowKey=rowKey;
return config;
}
function keyFnOf(desc){
const{rowKey}=desc.config;
if(isFunction(rowKey))return rowKey;
const path=typeof rowKey==='string'&&rowKey?rowKey:'id';
return(row)=>getPath(row,path);
}
function pushRows(state,entry){
if(state.destroyed)return;
const{grid,view}=entry;
if(!grid||!view||!view.rows||!isFunction(view.rows.apply))return;
const rows=isFunction(grid.rows.data)?grid.rows.data():[];
const keyFn=entry.keyFn;
const next=new Map();
for(const row of rows)next.set(keyFn(row),row);
const add=[];
const update=[];
const remove=[];
for(const[key,row]of next){
if(entry.sent.has(key))update.push(row);
else add.push(row);
}
for(const key of entry.sent.keys())if(!next.has(key))remove.push(key);
entry.sent=next;
if(!add.length&&!update.length&&!remove.length)return;
view.rows.apply({add,update,remove});
}
function buildEngine(state,desc,parentGrid){
if(!state.createHeadlessGridFn){
warnOnce(
'tabs.view.headless',
`tabs: tab "${desc.id}" derives from "${desc.from}" and its body is not a grid, so its rows `
+'have to be derived by a headless grid. Pass `config.createHeadlessGrid` — e.g. '
+"`import { createHeadlessGrid } from 'lattice-grid'` — or the body mounts with whatever "
+'rows its own config carries and does not follow its parent.',
);
return null;
}
if(!parentGrid)return null;
try{
return state.createHeadlessGridFn(buildEngineConfig(desc,parentGrid));
}catch(err){
warnOnce(
`tabs.view.build:${desc.id}`,
`tabs: tab "${desc.id}" — the headless grid deriving its rows could not be built `
+`(${err&&err.message}); the body mounts with its own config's rows and does not follow.`,
);
return null;
}
}
function pipeRows(state,entry){
const{grid}=entry;
if(!grid||!isFunction(grid.on))return;
const handler=()=>pushRows(state,entry);
const offs=[];
for(const name of BADGE_EVENTS){
const off=grid.on(name,handler);
offs.push(isFunction(off)?off:()=>{if(isFunction(grid.off))grid.off(name,handler);});
}
entry.off=()=>{
for(const off of offs){
try{off();}catch{}
}
};
}
function materialise(state,id){
const existing=state.instances.get(id);
if(existing)return existing;
const desc=state.byId.get(id);
const parent=desc.from?materialise(state,desc.from):null;
const panel=state.panels.get(id);
const parentGrid=parent&&parent.grid;
if(!desc.view){
const grid=state.createGridFn(panel,buildConfig(desc,parentGrid));
const entry={grid,view:null,off:null,sent:new Map(),keyFn:keyFnOf(desc)};
state.instances.set(id,entry);
return entry;
}
const engine=desc.from?buildEngine(state,desc,parentGrid):null;
const bodyEl=state.doc.createElement('div');
bodyEl.className=`${NS}__body`;
panel.appendChild(bodyEl);
const view=desc.view(bodyEl,desc.config);
const entry={
grid:engine,view,bodyEl,off:null,sent:new Map(),keyFn:keyFnOf(desc),
};
state.instances.set(id,entry);
if(engine){
pipeRows(state,entry);
pushRows(state,entry);
}
return entry;
}
function countOf(grid){
if(!grid||!grid.rows)return null;
const{rows}=grid;
if(isFunction(rows.matchCount))return rows.matchCount();
if(isFunction(rows.count))return rows.count();
if(typeof rows.count==='number')return rows.count;
return null;
}
function ancestorsOf(state,id){
const out=[];
let desc=state.byId.get(id);
while(desc&&desc.from){
out.push(desc.from);
desc=state.byId.get(desc.from);
}
return out;
}
function shadowGrid(state,id){
if(state.shadows.has(id))return state.shadows.get(id);
if(!state.createHeadlessGridFn){
warnOnce(
'tabs.badge.headless',
'tabs: a tab configured with `badge` has never been activated, so it has no grid to count '
+'and shows no badge until it is. Pass `config.createHeadlessGrid` — e.g. '
+"`import { createHeadlessGrid } from 'lattice-grid'` — to give every tab a live count "
+'from first paint.',
);
return null;
}
const desc=state.byId.get(id);
if(desc.view&&!desc.from){
state.shadows.set(id,null);
return null;
}
const parent=desc.from?badgeGrid(state,desc.from):null;
if(desc.from&&!parent){
state.shadows.set(id,null);
return null;
}
let grid=null;
try{
grid=state.createHeadlessGridFn(
desc.view?buildEngineConfig(desc,parent):buildConfig(desc,parent),
);
}catch(err){
warnOnce(
`tabs.badge.build:${id}`,
`tabs: tab "${id}" — its headless count grid could not be built `
+`(${err&&err.message}); no badge is shown for it.`,
);
grid=null;
}
state.shadows.set(id,grid);
return grid;
}
function badgeGrid(state,id){
const entry=state.instances.get(id);
if(entry){
if(entry.grid)return entry.grid;
if(entry.view)return entry.view;
}
return shadowGrid(state,id);
}
function watchBadge(state,id,grid){
if(!grid||state.badgeOff.has(id)||!isFunction(grid.on))return;
const handler=()=>refreshBadge(state,id);
const offs=[];
for(const name of BADGE_EVENTS){
const off=grid.on(name,handler);
offs.push(isFunction(off)
?off
:()=>{if(isFunction(grid.off))grid.off(name,handler);});
}
state.badgeOff.set(id,()=>{
for(const off of offs){
try{off();}catch{}
}
});
}
function dropShadow(state,id){
const off=state.badgeOff.get(id);
if(off){
state.badgeOff.delete(id);
try{off();}catch{}
}
if(!state.shadows.has(id))return;
const grid=state.shadows.get(id);
state.shadows.delete(id);
if(grid&&isFunction(grid.destroy)){
try{grid.destroy();}catch{}
}
}
function invalidateShadows(state,mountedId){
for(const id of[...state.shadows.keys()]){
if(id===mountedId||ancestorsOf(state,id).includes(mountedId))dropShadow(state,id);
}
dropShadow(state,mountedId);
}
function descFacade(desc){
return{id:desc.id,label:desc.label,from:desc.from};
}
function badgeTextOf(desc,count){
const spec=desc.badge;
if(isFunction(spec)){
let out;
try{
out=spec(count,descFacade(desc));
}catch(err){
warnOnce(
`tabs.badge.fn:${desc.id}`,
`tabs: tab "${desc.id}" — its badge function threw (${err&&err.message}); no badge is shown.`,
);
return null;
}
return isNil(out)?null:String(out);
}
if(spec===true)return count==null?null:String(count);
return String(spec);
}
function badgeToneOf(desc,count){
const spec=desc.badgeTone;
if(spec==null)return null;
if(!isFunction(spec))return spec;
let out;
try{
out=spec(count,descFacade(desc));
}catch(err){
warnOnce(
`tabs.badgeTone.fn:${desc.id}`,
`tabs: tab "${desc.id}" — its badgeTone function threw (${err&&err.message}); `
+'the badge is drawn untoned.',
);
return null;
}
if(isNil(out))return null;
if(BADGE_TONES.includes(out))return out;
warnOnce(
`tabs.badgeTone.value:${desc.id}`,
`tabs: tab "${desc.id}" — badgeTone returned "${out}", which is not one of `
+`${BADGE_TONES.join(', ')}. The badge is drawn untoned.`,
);
return null;
}
function refreshBadge(state,id){
if(state.destroyed)return;
const desc=state.byId.get(id);
if(!desc||desc.badge==null)return;
const needsCount=desc.badge===true||isFunction(desc.badge)||isFunction(desc.badgeTone);
const grid=needsCount?badgeGrid(state,id):null;
if(grid)watchBadge(state,id,grid);
const count=needsCount?countOf(grid):null;
const text=badgeTextOf(desc,count);
const tone=badgeToneOf(desc,count);
const painted=JSON.stringify([text,tone]);
if(state.badgePainted.get(id)===painted)return;
state.badgePainted.set(id,painted);
const unit=desc.badge===true&&text!=null?message(state,'a11y.tabs.badgeUnit'):null;
paintBadge(state,id,text,tone,unit);
}
function refreshBadges(state){
for(const id of state.order)refreshBadge(state,id);
}
function gateBefore(state,payload,apply){
const decision=state.emitter.emitBefore('beforeTabChange',payload,(payload).origin);
const cancel=()=>{
state.emitter.emit('tabChange:cancelled',{...payload,reason:(payload).reason||'prevented'});
return false;
};
if(decision===false)return cancel();
if(decision&&isFunction((decision).then)){
return(decision).then((ok)=>(ok?apply():cancel()));
}
return apply();
}
function adoptChrome(state,id){
if(state.chrome){
state.chrome.release();
state.chrome=null;
}
const entry=state.instances.get(id);
if(!entry||!entry.grid||!state.rootEl)return;
state.chrome=adoptGridChrome(state.rootEl,entry.grid);
}
function activate(state,id,opts={}){
if(state.destroyed)return false;
if(!state.byId.has(id)){
warnOnce('tabs.activate.unknown',`tabs: activate("${id}") — no such tab.`);
return false;
}
if(id===state.activeId)return true;
const previousId=state.activeId;
const finish=()=>{
revealPanel(state,id);
materialise(state,id);
invalidateShadows(state,id);
refreshBadges(state);
paintActive(state,id,previousId);
adoptChrome(state,id);
state.activeId=id;
announce(state,resolveMessages(state).t('a11y.tabs.selected',{label:state.byId.get(id).label}));
state.emitter.emit('tab:changed',{id,previousId});
return true;
};
if(opts.silent)return finish();
return gateBefore(state,{id,previousId,origin:opts.origin||'user'},finish);
}
function destroyTabs(state){
if(state.destroyed)return;
state.destroyed=true;
if(state.chrome){
state.chrome.release();
state.chrome=null;
}
for(const off of state.off.splice(0)){
try{off();}catch{}
}
for(const id of state.order)dropShadow(state,id);
for(const entry of state.instances.values()){
try{if(entry.off)entry.off();}catch{}
try{if(entry.view&&isFunction(entry.view.destroy))entry.view.destroy();}catch{}
try{if(entry.grid&&isFunction(entry.grid.destroy))entry.grid.destroy();}catch{}
}
state.instances.clear();
if(state.rootEl&&state.rootEl.parentNode)state.rootEl.parentNode.removeChild(state.rootEl);
state.el.classList.remove('lat-tabs-host');
}
function createTabs(el,config={}){
if(!el||typeof el!=='object'||!('appendChild'in el)){
fail('tabs: createTabs needs a host element as its first argument.');
}
if(!isFunction(config.createGrid)){
fail('tabs: createTabs needs config.createGrid — inject the grid factory, e.g. '
+"`import { createGrid } from 'lattice-grid'; createTabs(el, { createGrid, tabs })`.");
}
if(!isNil(config.createHeadlessGrid)&&!isFunction(config.createHeadlessGrid)){
warnOnce(
'tabs.createHeadlessGrid.type',
'tabs: config.createHeadlessGrid must be the headless grid factory (a function); got '
+`${typeof config.createHeadlessGrid}. It is ignored, so a tab that has never been `
+'activated shows no badge until it is.',
);
}
const doc=el.ownerDocument;
if(!doc)fail('tabs: createTabs needs a DOM (the host element has no ownerDocument).');
const descriptors=normaliseTabs(config.tabs);
const state={
el,doc,config,
createGridFn:config.createGrid,
createHeadlessGridFn:isFunction(config.createHeadlessGrid)?config.createHeadlessGrid:null,
byId:new Map(descriptors.map((d)=>[d.id,d])),
order:descriptors.map((d)=>d.id),
instances:new Map(),
activeId:null,
emitter:new Emitter(),
tabButtons:new Map(),
tabLabels:new Map(),
tabBadges:new Map(),
shadows:new Map(),
badgeOff:new Map(),
badgePainted:new Map(),
panels:new Map(),
off:[],
chrome:null,
destroyed:false,
baseId:uid('lat-tabs-'),
ariaLabel:typeof config.ariaLabel==='string'?config.ariaLabel:'Tabs',
};
el.classList.add('lat-tabs-host');
renderShell(state);
wireKeyboard(state,(id,opts)=>activate(state,id,opts));
const initial=(typeof config.active==='string'&&state.byId.has(config.active))
?config.active:state.order[0];
activate(state,initial,{silent:true,origin:'init'});
for(const[prop,name]of Object.entries(CALLBACKS)){
if(isFunction(config[prop]))state.emitter.on(name,config[prop]);
}
return{
get el(){return el;},
get activeId(){return state.activeId;},
tabs(){return state.order.slice();},
tab(id){const e=state.instances.get(id);return e?(e.view||e.grid):null;},
isMounted(id){return state.instances.has(id);},
activate(id,opts){return activate(state,id,{origin:'api',...opts});},
on(name,fn){
if(!TABS_EVENTS.includes(name)){
warnOnce(`tabs.on.unknown:${name}`,`tabs: "${name}" is not an event this module emits.`);
}
return state.emitter.on(name,fn);
},
off(name,fn){state.emitter.off(name,fn);},
destroy(){destroyTabs(state);},
};
}
const __default=createTabs;
});
var __entry=__req("packages/modules/tabs/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridTabs"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);