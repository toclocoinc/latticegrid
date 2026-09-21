/*!
 * Lattice Grid 1.67.0, svelte module
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
__def("packages/modules/shared/adapter.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"EVENT_NAMES",{enumerable:true,get:function(){return EVENT_NAMES;}});
Object.defineProperty(__exports,"handlerName",{enumerable:true,get:function(){return handlerName;}});
Object.defineProperty(__exports,"dashedName",{enumerable:true,get:function(){return dashedName;}});
Object.defineProperty(__exports,"CONFIG_KEY_ALIASES",{enumerable:true,get:function(){return CONFIG_KEY_ALIASES;}});
Object.defineProperty(__exports,"aliasConfigKey",{enumerable:true,get:function(){return aliasConfigKey;}});
Object.defineProperty(__exports,"isHandlerProp",{enumerable:true,get:function(){return isHandlerProp;}});
Object.defineProperty(__exports,"partition",{enumerable:true,get:function(){return partition;}});
Object.defineProperty(__exports,"createGridController",{enumerable:true,get:function(){return createGridController;}});
const EVENT_NAMES=Object.freeze([
'ready','destroy','render:first','render:done','config:changed','licence:changed',
'model:changed','rows:changed','rows:queued','rows:deferred','rows:paused',
'rows:resumed','row:received','row:sent','row:copied','row:moved','source:error',
'stream:chunk','stream:end','stream:evicted',
'rowDrag:started','rowDrag:moved','rowDrag:left','rowDrag:ended',
'cell:changed','cell:pending',
'cell:confirmed','cell:reverted','cell:conflict','cell:clicked','cell:dblclicked','cell:contextmenu',
'cell:mouseover','cell:mouseout','cell:mousedown','cell:mouseup',
'cell:edit:start','cell:edit:end','row:edit:start','row:edit:end','row:clicked',
'row:dblclicked','row:pending','row:confirmed','row:reverted','row:conflict',
'form:opened','form:closed','form:saved','form:error',
'sort:changed','filter:changed','group:toggled','facet:computed','facet:filtered',
'facet:expanded','facet:failed','column:moved','column:resized','column:visible',
'column:pinned','column:grouped','column:pivoted','column:filter:open',
'column:profile:open',
'column:menu:open','columns:changed','columns:tagged','columngroup:changed',
'header:contextmenu','pivot:drill',
'selection:changed','range:changed','clipboard:copy','page:changed','scroll',
'scroll:end','size:changed','detail:toggled','toolpanel:focus','highlight:changed','find:changed',
'tree:loading','tree:loaded','tree:loadFailed','tree:loadAborted','state:changed',
'state:reset','history:changed','history:applied','views:changed','view:applied',
'view:saved','view:removed','view:renamed','view:default','formatting:changed',
'redaction:changed','permissions:changed','presentation:changed',
'presentation:started','presentation:ended','presentation:view','presentation:scale',
'presentation:spotlight','presentation:captured','comment:added','comment:edited',
'comment:deleted','comment:failed','comment:resolved','comment:unresolved',
'comment:threadOpened','comment:threadClosed','comment:indexLoaded',
'presence:published','presence:joined','presence:updated','presence:left',
'presence:failed','presence:lockRefused','diff:changed','diff:swapped',
'timeline:attached','timeline:detached','timeline:seek','timeline:seeking',
'annotation:changed',
'validation:failed','validation:cleared',
'export:progress','export:request','export:done',
'shortcuts:opened','shortcuts:closed',
'print:before','print:after',
'beforeEdit','beforeSort','beforeFilter',
'beforeColumnMove','beforeColumnResize','beforeColumnHide',
'beforeSelect','beforeRowAdd','beforeDelete','beforeRowMove','beforeGroup',
'beforeRowReceive',
'edit:cancelled','sort:cancelled','filter:cancelled',
'columnMove:cancelled','columnResize:cancelled','columnHide:cancelled',
'selection:cancelled','rowAdd:cancelled','delete:cancelled',
'rowMove:cancelled','group:cancelled','rowReceive:cancelled',
]);
const IMPERATIVE=Object.freeze({
sort:(grid,value)=>grid.sort.set(value||[]),
filters:(grid,value)=>grid.filters.set(value||null),
quickFilter:(grid,value)=>{
if(value&&typeof value==='object'){
grid.filters.quick((value).text||'',{mode:(value).mode});
return;
}
grid.filters.quick(typeof value==='string'?value:'');
},
selectedKeys:(grid,value)=>grid.selection.set(Array.isArray(value)?value:[]),
});
function handlerName(event){
const parts=String(event).split(':');
return`on${parts.map((p)=>p.charAt(0).toUpperCase()+p.slice(1)).join('')}`;
}
function dashedName(event){
return String(event).replace(/:/g,'-');
}
const CONFIG_KEY_ALIASES=Object.freeze({
'row-key':'rowKey',
'row-height':'rowHeight',
'header-height':'headerHeight',
'auto-height':'autoHeight',
});
function aliasConfigKey(key){
return Object.hasOwn(CONFIG_KEY_ALIASES,key)?CONFIG_KEY_ALIASES[key]:key;
}
const BY_HANDLER=Object.freeze(
Object.fromEntries(EVENT_NAMES.map((name)=>[handlerName(name),name])),
);
function isHandlerProp(key){
return Object.hasOwn(BY_HANDLER,key);
}
function partition(props){
const config={};
const imperative={};
const handlers={};
for(const[key,value]of Object.entries(props||{})){
if(isHandlerProp(key)){handlers[key]=value;continue;}
if(Object.hasOwn(IMPERATIVE,key)){imperative[key]=value;continue;}
config[key]=value;
}
return{config,imperative,handlers};
}
function createGridController(opts){
const create=opts.createGrid;
if(typeof create!=='function'){
throw new TypeError('createGridController needs createGrid; pass it in from the grid package.');
}
const initial=partition(opts.props||{});
const grid=create(opts.element,{...initial.config});
let handlers=initial.handlers;
let config=initial.config;
let imperative={};
const dispatch=(event)=>{
if(!event||typeof event.type!=='string')return;
const fn=handlers[handlerName(event.type)];
if(typeof fn==='function')fn(event);
};
const unsubscribe=grid.on('*',dispatch);
for(const[key,value]of Object.entries(initial.imperative)){
if(value===undefined)continue;
IMPERATIVE[key](grid,value);
imperative[key]=value;
}
let destroyed=false;
return{
grid,
update(next){
if(destroyed)return;
const parts=partition(next||{});
handlers=parts.handlers;
const changed={};
for(const[key,value]of Object.entries(parts.config)){
if(!Object.is(config[key],value))changed[key]=value;
}
for(const key of Object.keys(config)){
if(!Object.hasOwn(parts.config,key))changed[key]=undefined;
}
if(Object.keys(changed).length)grid.setAll(changed);
config=parts.config;
for(const[key,apply]of Object.entries(IMPERATIVE)){
const value=parts.imperative[key];
if(Object.is(imperative[key],value))continue;
if(value===undefined&&!Object.hasOwn(imperative,key))continue;
apply(grid,value);
imperative[key]=value;
}
},
destroy(){
if(destroyed)return;
destroyed=true;
unsubscribe();
grid.destroy();
},
};
}
});
__def("packages/modules/react/viewers.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"VIEWER_EVENTS",{enumerable:true,get:function(){return VIEWER_EVENTS;}});
Object.defineProperty(__exports,"VIEWER_APPLY",{enumerable:true,get:function(){return VIEWER_APPLY;}});
Object.defineProperty(__exports,"VIEWER_BULK_UPDATE",{enumerable:true,get:function(){return VIEWER_BULK_UPDATE;}});
Object.defineProperty(__exports,"viewerHandlerName",{enumerable:true,get:function(){return viewerHandlerName;}});
Object.defineProperty(__exports,"partitionViewerProps",{enumerable:true,get:function(){return partitionViewerProps;}});
Object.defineProperty(__exports,"createViewerController",{enumerable:true,get:function(){return createViewerController;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const VIEWER_EVENTS=Object.freeze({
kpi:Object.freeze([
'tile:click','tile:dblclick','tile:contextmenu','node:toggle','change',
]),
kanban:Object.freeze([
'card:click','card:dblclick','card:contextmenu',
'card:move','card:reverted','card:confirmed','selection:changed','column:collapse','card:add',
'drag:start','drag:end','swimlane:collapse','swimlane:reorder','column:reorder',
'filter:changed','sprint:changed','epic:changed','card:expand','card:drill','card:edit',
'card:sla',
'beforeMove','beforeAdd','beforeEdit',
'beforeLaneReorder','beforeColumnReorder','beforeColumnChange',
'move:cancelled','add:cancelled','edit:cancelled',
'laneReorder:cancelled','columnReorder:cancelled','columnChange:cancelled',
]),
tabs:Object.freeze(['beforeTabChange','tab:changed','tabChange:cancelled']),
chart:Object.freeze(['click','hover','leave','draw','legend']),
gantt:Object.freeze(['schedule','error']),
layout:Object.freeze([
'layout:changed','window:moved','window:resized','window:closed',
'beforeWindowClose','windowClose:cancelled',
]),
router:Object.freeze(['metrics']),
});
const VIEWER_APPLY=Object.freeze({
kpi:Object.freeze({
rows:(kpi,value)=>kpi.setRows(Array.isArray(value)?value:[]),
}),
kanban:Object.freeze({
rows:(board,value)=>board.setRows(Array.isArray(value)?value:[]),
quickFilter:(board,value)=>board.setQuickFilter(typeof value==='string'?value:''),
sprint:(board,value)=>board.setSprint(value),
epic:(board,value)=>board.setEpic(value),
loading:(board,value)=>board.setLoading(!!value),
error:(board,value)=>board.setError(value??null),
}),
gantt:Object.freeze({
tasks:(gantt,value)=>gantt.setTasks(Array.isArray(value)?value:[]),
dependencies:(gantt,value)=>gantt.setDependencies(Array.isArray(value)?value:[]),
}),
tabs:Object.freeze({
active:(tabs,value)=>{if(typeof value==='string')tabs.activate(value);},
}),
chart:Object.freeze({}),
layout:Object.freeze({}),
});
const VIEWER_BULK_UPDATE=Object.freeze({chart:'update'});
function viewerHandlerName(event){
const parts=String(event).split(':');
return`on${parts.map((p)=>p.charAt(0).toUpperCase()+p.slice(1)).join('')}`;
}
const BY_HANDLER=Object.freeze(Object.fromEntries(
Object.entries(VIEWER_EVENTS).map(([viewer,events])=>[
viewer,
Object.freeze(Object.fromEntries(events.map((e)=>[viewerHandlerName(e),e]))),
]),
));
function partitionViewerProps(viewer,props){
const byHandler=BY_HANDLER[viewer]||{};
const applies=VIEWER_APPLY[viewer]||{};
const config={};
const live={};
const handlers={};
for(const[key,value]of Object.entries(props||{})){
if(Object.hasOwn(byHandler,key)){handlers[key]=value;continue;}
if(Object.hasOwn(applies,key)){live[key]=value;config[key]=value;continue;}
config[key]=value;
}
return{config,live,handlers};
}
function createViewerController(opts){
const viewer=String(opts.viewer);
const mount=opts.mount;
const label=opts.name||viewer;
if(typeof mount!=='function'){
throw new TypeError(
`createViewerController needs a mount factory for "${viewer}"; pass the module's own `
+'factory in, e.g. { createKPI } from lattice-grid/modules/kpi.');
}
const initial=partitionViewerProps(viewer,opts.props||{});
const instance=mount(opts.element,{...initial.config});
if(!instance||typeof instance!=='object'){
throw new TypeError(`the ${label} factory returned no instance; nothing can be driven.`);
}
let handlers=initial.handlers;
let config=initial.config;
const live={...initial.live};
const off=[];
if(typeof instance.on==='function'){
for(const event of VIEWER_EVENTS[viewer]||[]){
const prop=viewerHandlerName(event);
const stop=instance.on(event,(payload)=>{
const fn=handlers[prop];
if(typeof fn==='function')fn(payload);
});
if(typeof stop==='function')off.push(stop);
}
}
const bulk=VIEWER_BULK_UPDATE[viewer];
const applies=VIEWER_APPLY[viewer]||{};
let destroyed=false;
return{
instance,
update(next){
if(destroyed)return;
const parts=partitionViewerProps(viewer,next||{});
handlers=parts.handlers;
const changed={};
for(const[key,value]of Object.entries(parts.config)){
if(!Object.is(config[key],value))changed[key]=value;
}
config=parts.config;
if(!Object.keys(changed).length)return;
const unapplied=[];
for(const key of Object.keys(changed)){
const apply=applies[key];
if(apply){
apply(instance,changed[key]);
live[key]=changed[key];
continue;
}
if(bulk&&typeof instance[bulk]==='function')continue;
unapplied.push(key);
}
if(bulk&&typeof instance[bulk]==='function'){
const spec={};
for(const key of Object.keys(changed))if(!applies[key])spec[key]=changed[key];
if(Object.keys(spec).length)instance[bulk](spec);
}
if(unapplied.length){
warnOnce(`react.viewer.${viewer}.mountOnly.${unapplied.join('.')}`,
`${label}: ${unapplied.map((k)=>`\`${k}\``).join(', ')} changed, but `
+`${label} takes ${unapplied.length===1?'it':'them'} only when the viewer is `
+'created. Nothing was applied and the viewer was NOT rebuilt — rebuilding it silently '
+'would throw away scroll position, selection and expansion. Give the component a '
+'`key` that changes when this must take effect, so the rebuild is yours and visible, '
+'or drive the instance through the ref.');
}
},
destroy(){
if(destroyed)return;
destroyed=true;
for(const stop of off){
try{stop();}catch{}
}
off.length=0;
if(typeof instance.destroy==='function')instance.destroy();
},
};
}
});
__def("packages/modules/svelte/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"EVENT_NAMES",{enumerable:true,get:function(){return EVENT_NAMES;}});
Object.defineProperty(__exports,"dashedName",{enumerable:true,get:function(){return dashedName;}});
Object.defineProperty(__exports,"VIEWER_EVENTS",{enumerable:true,get:function(){return VIEWER_EVENTS;}});
Object.defineProperty(__exports,"VIEWER_APPLY",{enumerable:true,get:function(){return VIEWER_APPLY;}});
Object.defineProperty(__exports,"viewerHandlerName",{enumerable:true,get:function(){return viewerHandlerName;}});
Object.defineProperty(__exports,"createViewerController",{enumerable:true,get:function(){return createViewerController;}});
Object.defineProperty(__exports,"createLatticeAction",{enumerable:true,get:function(){return createLatticeAction;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
Object.defineProperty(__exports,"GRID_REGISTRY_KEY",{enumerable:true,get:function(){return GRID_REGISTRY_KEY;}});
Object.defineProperty(__exports,"ROUTER_KEY",{enumerable:true,get:function(){return ROUTER_KEY;}});
Object.defineProperty(__exports,"DEFAULT_GRID_NAME",{enumerable:true,get:function(){return DEFAULT_GRID_NAME;}});
Object.defineProperty(__exports,"pickCallback",{enumerable:true,get:function(){return pickCallback;}});
Object.defineProperty(__exports,"adaptProps",{enumerable:true,get:function(){return adaptProps;}});
Object.defineProperty(__exports,"createGridRegistry",{enumerable:true,get:function(){return createGridRegistry;}});
Object.defineProperty(__exports,"bindGrid",{enumerable:true,get:function(){return bindGrid;}});
Object.defineProperty(__exports,"VIEWER_BINDING",{enumerable:true,get:function(){return VIEWER_BINDING;}});
Object.defineProperty(__exports,"viewerMount",{enumerable:true,get:function(){return viewerMount;}});
Object.defineProperty(__exports,"bindViewer",{enumerable:true,get:function(){return bindViewer;}});
Object.defineProperty(__exports,"snippetTabIds",{enumerable:true,get:function(){return snippetTabIds;}});
Object.defineProperty(__exports,"bindTabs",{enumerable:true,get:function(){return bindTabs;}});
Object.defineProperty(__exports,"createRouterHandle",{enumerable:true,get:function(){return createRouterHandle;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/shared/adapter.js");
const createGridController=__m1["createGridController"];
const EVENT_NAMES=__m1["EVENT_NAMES"];
const dashedName=__m1["dashedName"];
const handlerName=__m1["handlerName"];
const aliasConfigKey=__m1["aliasConfigKey"];
const __m2=__req("packages/modules/react/viewers.js");
const VIEWER_EVENTS=__m2["VIEWER_EVENTS"];
const VIEWER_APPLY=__m2["VIEWER_APPLY"];
const viewerHandlerName=__m2["viewerHandlerName"];
const createViewerController=__m2["createViewerController"];
const RESERVED=Object.freeze(['onGrid']);
function createLatticeAction(deps){
const createGrid=deps&&deps.createGrid;
if(typeof createGrid!=='function'){
throw new TypeError('createLatticeAction needs createGrid: createLatticeAction({ createGrid }).');
}
const Events=(deps&&deps.CustomEvent)
||(typeof CustomEvent!=='undefined'?CustomEvent:null);
return function lattice(node,params){
let controller;
let deliveredTo=null;
const forward=(name)=>(event)=>{
if(!Events)return;
const detail=(name==='ready'&&controller)
?{...event,grid:controller.grid}
:event;
(node).dispatchEvent(
new Events(dashedName(name),{detail}),
);
};
const propsFor=(next)=>{
const out={...(next||{})};
for(const key of RESERVED)delete out[key];
for(const name of EVENT_NAMES){
out[`on${name.split(':').map((p)=>p.charAt(0).toUpperCase()+p.slice(1)).join('')}`]=forward(name);
}
return out;
};
const deliverGrid=(next)=>{
const onGrid=next&&(next).onGrid;
if(typeof onGrid==='function'&&onGrid!==deliveredTo){
deliveredTo=onGrid;
onGrid(controller.grid);
}
};
controller=createGridController({
createGrid,element:node,props:propsFor(params),
});
deliverGrid(params);
return{
update(next){controller.update(propsFor(next));deliverGrid(next);},
destroy(){controller.destroy();},
};
};
}
const __default=createLatticeAction;
const GRID_REGISTRY_KEY=Symbol.for('lattice.svelte.gridRegistry');
const ROUTER_KEY=Symbol.for('lattice.svelte.router');
const DEFAULT_GRID_NAME='default';
const HOST_PROPS=new Set(['class','style','id','children']);
const OWN_PROPS=Object.freeze({
grid:new Set(['name','route','routeOptions','predicates','rowUpdates']),
viewer:new Set(['grid','gridName']),
tabs:new Set(['contentIds']),
});
const OWN_CALLBACKS=Object.freeze({
grid:Object.freeze(['onGridReady','onGridDestroyed']),
viewer:Object.freeze(['onReady','onDestroyed']),
});
function pickCallback(props,camel){
const bag=props||{};
const fn=Object.hasOwn(bag,camel)?bag[camel]:bag[camel.toLowerCase()];
return typeof fn==='function'?fn:null;
}
const HANDLERS=(()=>{
const out={};
const add=(kind,events,name)=>{
const canonical=new Set(events.map(name));
for(const own of OWN_CALLBACKS[kind==='grid'?'grid':'viewer'])canonical.add(own);
const lower=new Map([...canonical].map((c)=>[c.toLowerCase(),c]));
out[kind]={events,canonical,lower};
};
add('grid',EVENT_NAMES,handlerName);
for(const viewer of Object.keys(VIEWER_EVENTS)){
add(viewer,VIEWER_EVENTS[viewer],viewerHandlerName);
}
return out;
})();
function adaptProps(kind,props){
const table=HANDLERS[kind];
if(!table){
throw new TypeError(
`adaptProps: "${kind}" is not a component kind this adapter knows; expected grid or one of `
+`${Object.keys(VIEWER_EVENTS).join(', ')}.`);
}
const mine=OWN_PROPS[kind]||OWN_PROPS.viewer;
const config={};
const own={};
for(const[key,value]of Object.entries(props||{})){
if(HOST_PROPS.has(key))continue;
if(mine.has(key)){own[key]=value;continue;}
if(table.canonical.has(key)){config[key]=value;continue;}
const canonical=table.lower.get(key);
if(canonical){config[canonical]=value;continue;}
config[aliasConfigKey(key)]=value;
}
for(const name of OWN_CALLBACKS[kind==='grid'?'grid':'viewer']){
if(Object.hasOwn(config,name)){own[name]=config[name];delete config[name];}
}
return{config,own};
}
function createGridRegistry(){
const grids=new Map();
const listeners=new Set();
const notify=()=>{for(const fn of[...listeners])fn();};
return{
publish(name,grid){
const key=name||DEFAULT_GRID_NAME;
if(grid)grids.set(key,grid);
else grids.delete(key);
notify();
},
get(name){return grids.get(name||DEFAULT_GRID_NAME)||null;},
names(){return[...grids.keys()];},
subscribe(fn){
listeners.add(fn);
return()=>{listeners.delete(fn);};
},
};
}
function applyPredicates(grid,next,previous){
const now=next&&typeof next==='object'?next:{};
const before=previous&&typeof previous==='object'?previous:{};
for(const[name,fn]of Object.entries(now)){
if(Object.is(before[name],fn))continue;
grid.filters.where(name,typeof fn==='function'?fn:null);
}
for(const name of Object.keys(before)){
if(!Object.hasOwn(now,name))grid.filters.where(name,null);
}
}
function bindGrid(opts){
const createGrid=opts&&opts.createGrid;
if(typeof createGrid!=='function'){
throw new TypeError('bindGrid needs createGrid: bindGrid({ createGrid, element, props }).');
}
const registry=(opts&&opts.registry)||null;
const router=(opts&&opts.router)||null;
const first=adaptProps('grid',opts.props||{});
const controller=createGridController({
createGrid,element:opts.element,props:first.config,
});
const{grid}=controller;
let predicates;
if(first.own.predicates){
applyPredicates(grid,(first.own.predicates),{});
predicates=first.own.predicates;
}
const publishedAs=typeof first.own.name==='string'&&first.own.name
?first.own.name:DEFAULT_GRID_NAME;
if(registry)registry.publish(publishedAs,grid);
if(router&&first.own.route!==undefined){
router.attach(grid,first.own.route,first.own.routeOptions||{});
}
let rowUpdates=first.own.rowUpdates;
const ready=pickCallback(first.own,'onGridReady');
if(ready)ready(grid);
let destroyed=false;
return{
grid,
update(next){
if(destroyed)return;
const parts=adaptProps('grid',next||{});
controller.update(parts.config);
if(!Object.is(parts.own.predicates,predicates)){
applyPredicates(grid,(parts.own.predicates),
(predicates));
predicates=parts.own.predicates;
}
if(parts.own.rowUpdates&&!Object.is(parts.own.rowUpdates,rowUpdates)){
grid.rows.apply((parts.own.rowUpdates));
}
rowUpdates=parts.own.rowUpdates;
const name=typeof parts.own.name==='string'&&parts.own.name
?parts.own.name:DEFAULT_GRID_NAME;
if(name!==publishedAs){
warnOnce('svelte.grid.mountOnly.name',
`LatticeGrid: \`name\` changed from "${publishedAs}" to "${name}", but a grid publishes `
+'itself under the name it had when it mounted. Nothing was republished and the grid '
+'was NOT rebuilt — rebuilding it would throw away scroll position, selection and '
+'expansion. Give the component a `key`-style `{#if}` when a genuine rebuild is wanted.');
}
},
destroy(props){
if(destroyed)return;
destroyed=true;
const gone=pickCallback(adaptProps('grid',props||{}).own,'onGridDestroyed');
if(gone)gone();
if(router){
try{router.detach(grid);}catch{}
}
if(registry)registry.publish(publishedAs,null);
controller.destroy();
},
};
}
const VIEWER_BINDING=Object.freeze({
kpi:Object.freeze({label:'LatticeKPI',requires:Object.freeze([]),fromContext:'grid'}),
chart:Object.freeze({label:'LatticeChart',requires:Object.freeze(['grid']),fromContext:'grid'}),
kanban:Object.freeze({label:'LatticeKanban',requires:Object.freeze([]),fromContext:'grid'}),
gantt:Object.freeze({label:'LatticeGantt',requires:Object.freeze([]),fromContext:null}),
layout:Object.freeze({label:'LatticeLayout',requires:Object.freeze([]),fromContext:null}),
});
function viewerMount(viewer,factory){
if(viewer==='chart')return(el,config)=>factory({...config,container:el});
if(viewer==='gantt')return(el,config)=>factory({...config,element:el});
return(el,config)=>factory(el,config);
}
function bindViewer(opts){
const viewer=String((opts&&opts.viewer)||'');
const factory=opts&&opts.factory;
if(!Object.hasOwn(VIEWER_BINDING,viewer)){
throw new TypeError(
`bindViewer: "${viewer}" is not a viewer this adapter knows; expected one of `
+`${Object.keys(VIEWER_BINDING).join(', ')}.`);
}
const{label,requires,fromContext}=VIEWER_BINDING[viewer];
if(typeof factory!=='function'){
throw new TypeError(`${label} needs the module's factory: bindViewer({ viewer, factory, element }).`);
}
const mount=viewerMount(viewer,factory);
const registry=opts.registry||null;
let controller=null;
let builtAgainst=null;
let lastOwn={};
let destroyed=false;
const boundGrid=(own)=>{
if(!fromContext)return null;
if(own.grid!==undefined)return(own.grid)||null;
if(!registry)return null;
const key=typeof own.gridName==='string'&&own.gridName?own.gridName:DEFAULT_GRID_NAME;
return registry.get(key);
};
const tearDown=()=>{
const live=controller;
controller=null;
builtAgainst=null;
if(!live)return;
const gone=pickCallback(lastOwn,'onDestroyed');
if(gone)gone();
live.destroy();
};
return{
get instance(){return controller?controller.instance:null;},
sync(props){
if(destroyed)return;
const parts=adaptProps(viewer,props||{});
lastOwn=parts.own;
const bound=boundGrid(parts.own);
if(fromContext&&bound)parts.config[fromContext]=bound;
if(controller&&!Object.is(builtAgainst,bound))tearDown();
if(!controller){
for(const key of requires){
if(parts.config[key]===undefined||parts.config[key]===null)return;
}
controller=createViewerController({
viewer,mount,element:opts.element,props:parts.config,name:label,
});
builtAgainst=bound;
const ready=pickCallback(parts.own,'onReady');
if(ready)ready(controller.instance);
return;
}
controller.update(parts.config);
},
destroy(){
if(destroyed)return;
destroyed=true;
tearDown();
},
};
}
function snippetTabIds(tabs,props){
const declared=Array.isArray(tabs)?tabs:[];
const bag=props||{};
return declared
.map((tab)=>(tab&&(tab).id))
.filter((id)=>typeof id==='string'&&typeof bag[id]==='function');
}
function bindTabs(opts){
const createTabs=opts&&opts.createTabs;
if(typeof createTabs!=='function'){
throw new TypeError('bindTabs needs createTabs: bindTabs({ createTabs, element }).');
}
const onPanels=typeof opts.onPanels==='function'?opts.onPanels:()=>{};
const panels=new Map();
let controller=null;
let mountedTabs=null;
let destroyed=false;
const announce=()=>onPanels([...panels.keys()]);
const describe=(config,contentIds)=>{
const declared=Array.isArray(config.tabs)?config.tabs:[];
const owned=new Set(contentIds);
return declared.map((tab)=>{
const spec=(tab);
if(!owned.has(spec.id))return spec;
return{
...spec,
view:(bodyEl)=>{
panels.set(spec.id,bodyEl);
announce();
return{
destroy(){
panels.delete(spec.id);
announce();
},
};
},
};
});
};
return{
get instance(){return controller?controller.instance:null;},
sync(props){
if(destroyed)return;
const parts=adaptProps('tabs',props||{});
const contentIds=Array.isArray(parts.own.contentIds)
?(parts.own.contentIds):[];
if(!controller){
const config={...parts.config,tabs:describe(parts.config,contentIds)};
config.createGrid=opts.createGrid||(()=>{
throw new Error(
'[lattice] LatticeTabs: a tab has neither a {#snippet} nor a grid factory to build it '
+'with. Give the tab a snippet named after its id, or import the Tabs component from '
+'a build that carries createGrid.');
});
controller=createViewerController({
viewer:'tabs',mount:createTabs,element:opts.element,props:config,name:'LatticeTabs',
});
mountedTabs=parts.config.tabs;
const ready=pickCallback(parts.own,'onReady');
if(ready)ready(controller.instance);
return;
}
if(!Object.is(mountedTabs,parts.config.tabs)){
mountedTabs=parts.config.tabs;
warnOnce('svelte.tabs.mountOnly.tabs',
'LatticeTabs: `tabs` changed (a label, a badge or a descriptor), but the strip takes it '
+'only when created — the module has no way to repaint an existing tab. Nothing was '
+'applied and the strip was NOT rebuilt, which would have lost whichever tab is open '
+'and any state its content holds. Wrap the strip in an `{#if}` you toggle when a '
+'genuine rebuild is wanted; a live badge otherwise belongs in your own markup.');
}
const{tabs:_mountOnly,...live}=parts.config;
controller.update(live);
},
place(id,holder){
const panel=panels.get(id);
const node=(holder);
if(!node||!panel||node.parentNode===panel)return;
panel.appendChild(node);
},
destroy(props){
if(destroyed)return;
destroyed=true;
const live=controller;
controller=null;
panels.clear();
if(!live)return;
const gone=pickCallback(adaptProps('tabs',props||{}).own,'onDestroyed');
if(gone)gone();
live.destroy();
},
};
}
function createRouterHandle(opts){
const createDataRouter=opts&&opts.createDataRouter;
if(typeof createDataRouter!=='function'){
throw new TypeError(
'createRouterHandle needs createDataRouter: createRouterHandle({ createDataRouter }).');
}
const declared=opts&&opts.config;
let instance=null;
let torn=false;
const handle={
get router(){
if(!instance&&!torn){
instance=createDataRouter(
(typeof declared==='function'?declared():declared)||{});
}
return instance;
},
attach(grid,route,routeOptions){
if(torn)return;
(handle.router).attach(grid,route,routeOptions||{});
},
detach(grid){
if(torn||!instance)return;
(instance).detach(grid);
},
destroy(){
torn=true;
const live=instance;
instance=null;
if(live)(live).destroy();
},
};
return handle;
}
});
var __entry=__req("packages/modules/svelte/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridSvelte"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);