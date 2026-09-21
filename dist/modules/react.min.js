/*!
 * Lattice Grid 1.67.0, react module
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
__def("packages/modules/react/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"EVENT_NAMES",{enumerable:true,get:function(){return EVENT_NAMES;}});
Object.defineProperty(__exports,"handlerName",{enumerable:true,get:function(){return handlerName;}});
Object.defineProperty(__exports,"VIEWER_EVENTS",{enumerable:true,get:function(){return VIEWER_EVENTS;}});
Object.defineProperty(__exports,"VIEWER_APPLY",{enumerable:true,get:function(){return VIEWER_APPLY;}});
Object.defineProperty(__exports,"viewerHandlerName",{enumerable:true,get:function(){return viewerHandlerName;}});
Object.defineProperty(__exports,"createViewerController",{enumerable:true,get:function(){return createViewerController;}});
Object.defineProperty(__exports,"DEFAULT_GRID_NAME",{enumerable:true,get:function(){return DEFAULT_GRID_NAME;}});
Object.defineProperty(__exports,"createLatticeGrid",{enumerable:true,get:function(){return createLatticeGrid;}});
Object.defineProperty(__exports,"createLatticeGridContext",{enumerable:true,get:function(){return createLatticeGridContext;}});
Object.defineProperty(__exports,"createLatticeViewer",{enumerable:true,get:function(){return createLatticeViewer;}});
Object.defineProperty(__exports,"createLatticeKPI",{enumerable:true,get:function(){return createLatticeKPI;}});
Object.defineProperty(__exports,"createLatticeChart",{enumerable:true,get:function(){return createLatticeChart;}});
Object.defineProperty(__exports,"createLatticeKanban",{enumerable:true,get:function(){return createLatticeKanban;}});
Object.defineProperty(__exports,"createLatticeGantt",{enumerable:true,get:function(){return createLatticeGantt;}});
Object.defineProperty(__exports,"createLatticeLayout",{enumerable:true,get:function(){return createLatticeLayout;}});
Object.defineProperty(__exports,"createLatticeTabs",{enumerable:true,get:function(){return createLatticeTabs;}});
Object.defineProperty(__exports,"createLatticeRouter",{enumerable:true,get:function(){return createLatticeRouter;}});
Object.defineProperty(__exports,"createLatticeReact",{enumerable:true,get:function(){return createLatticeReact;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/shared/adapter.js");
const createGridController=__m1["createGridController"];
const EVENT_NAMES=__m1["EVENT_NAMES"];
const handlerName=__m1["handlerName"];
const __m2=__req("packages/modules/react/viewers.js");
const VIEWER_EVENTS=__m2["VIEWER_EVENTS"];
const VIEWER_APPLY=__m2["VIEWER_APPLY"];
const viewerHandlerName=__m2["viewerHandlerName"];
const createViewerController=__m2["createViewerController"];
const HOST_PROPS=new Set(['className','style','id']);
const GRID_OWN_PROPS=new Set([
'onGridReady','onGridDestroy','rowUpdates','predicates','name','route','routeOptions',
]);
const DEFAULT_GRID_NAME='default';
const CONTEXTS=new WeakMap();
function gridContext(React){
let ctx=CONTEXTS.get(React);
if(!ctx){
ctx=React.createContext(null);
ctx.displayName='LatticeGridContext';
CONTEXTS.set(React,ctx);
}
return ctx;
}
const ROUTER_CONTEXTS=new WeakMap();
function routerContext(React){
let ctx=ROUTER_CONTEXTS.get(React);
if(!ctx){
ctx=React.createContext(null);
ctx.displayName='LatticeRouterContext';
ROUTER_CONTEXTS.set(React,ctx);
}
return ctx;
}
function requireReact(React,fn){
if(!React||typeof React.createElement!=='function'){
throw new TypeError(`${fn} needs React: ${fn}({ React, … }).`);
}
}
function splitProps(props,own){
const host={};
const mine={};
const rest={};
for(const[key,value]of Object.entries(props||{})){
if(HOST_PROPS.has(key))host[key]=value;
else if(own.has(key))mine[key]=value;
else rest[key]=value;
}
return{host,own:mine,rest};
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
function createLatticeGrid(deps){
const React=deps&&deps.React;
const createGrid=deps&&deps.createGrid;
requireReact(React,'createLatticeGrid');
if(typeof createGrid!=='function'){
throw new TypeError('createLatticeGrid needs createGrid: createLatticeGrid({ React, createGrid }).');
}
const{
createElement,useRef,useEffect,useContext,useImperativeHandle,forwardRef,
}=React;
const hasContext=typeof React.createContext==='function'&&typeof useContext==='function';
const GridContext=hasContext?gridContext(React):null;
const RouterContext=hasContext?routerContext(React):null;
const LatticeGrid=(props,ref)=>{
const elementRef=useRef(null);
const controllerRef=useRef(null);
const propsRef=useRef(props);
propsRef.current=props;
const appliedRef=useRef({rowUpdates:undefined,predicates:undefined});
const registry=hasContext?useContext(GridContext):null;
const registryRef=useRef(registry);
registryRef.current=registry;
const router=hasContext?useContext(RouterContext):null;
const routerRef=useRef(router);
routerRef.current=router;
useEffect(()=>{
const element=elementRef.current;
if(!element)return undefined;
const current=propsRef.current;
const parts=splitProps(current,GRID_OWN_PROPS);
const controller=createGridController({
createGrid,
element,
props:parts.rest,
});
controllerRef.current=controller;
const{grid}=controller;
const name=typeof parts.own.name==='string'?parts.own.name:DEFAULT_GRID_NAME;
if(parts.own.predicates){
applyPredicates(grid,(parts.own.predicates),{});
appliedRef.current.predicates=parts.own.predicates;
}
if(registryRef.current&&typeof registryRef.current.publish==='function'){
registryRef.current.publish(name,grid);
}
const live=routerRef.current;
const route=parts.own.route;
if(live&&route!==undefined&&typeof live.attach==='function'){
live.attach(grid,route,(parts.own.routeOptions)||{});
}
if(typeof parts.own.onGridReady==='function'){
(parts.own.onGridReady)(grid);
}
return()=>{
controllerRef.current=null;
const latest=propsRef.current;
if(typeof latest.onGridDestroy==='function'){
(latest.onGridDestroy)();
}
if(live&&typeof live.detach==='function'){
try{live.detach(grid);}catch{}
}
if(registryRef.current&&typeof registryRef.current.publish==='function'){
registryRef.current.publish(name,null);
}
appliedRef.current={rowUpdates:undefined,predicates:undefined};
controller.destroy();
};
},[]);
useEffect(()=>{
const controller=controllerRef.current;
if(!controller)return;
const parts=splitProps(props,GRID_OWN_PROPS);
controller.update(parts.rest);
const{grid}=controller;
if(!Object.is(appliedRef.current.predicates,parts.own.predicates)){
applyPredicates(
grid,
(parts.own.predicates),
(appliedRef.current.predicates),
);
appliedRef.current.predicates=parts.own.predicates;
}
const updates=parts.own.rowUpdates;
if(updates&&!Object.is(appliedRef.current.rowUpdates,updates)){
appliedRef.current.rowUpdates=updates;
grid.rows.apply(updates);
}
});
useImperativeHandle(ref,()=>({
get grid(){return controllerRef.current?controllerRef.current.grid:null;},
}),[]);
const{host}=splitProps(props,GRID_OWN_PROPS);
return createElement('div',{...host,ref:elementRef});
};
LatticeGrid.displayName='LatticeGrid';
return typeof forwardRef==='function'?forwardRef(LatticeGrid):LatticeGrid;
}
function createLatticeGridContext(deps){
const React=deps&&deps.React;
requireReact(React,'createLatticeGridContext');
if(typeof React.createContext!=='function'){
throw new TypeError('createLatticeGridContext needs a React with createContext.');
}
const{
createElement,useState,useCallback,useMemo,useContext,
}=React;
const GridContext=gridContext(React);
const LatticeGridProvider=(props)=>{
const[grids,setGrids]=useState(()=>({}));
const publish=useCallback((name,grid)=>{
setGrids((held)=>{
if(Object.is(held[name],grid))return held;
const next={...held};
if(grid===null||grid===undefined)delete next[name];
else next[name]=grid;
return next;
});
},[]);
const value=useMemo(()=>({grids,publish}),[grids,publish]);
return createElement(GridContext.Provider,{value},props.children);
};
LatticeGridProvider.displayName='LatticeGridProvider';
const useLatticeGrid=(name=DEFAULT_GRID_NAME)=>{
const registry=useContext(GridContext);
return registry&&registry.grids?(registry.grids[name]??null):null;
};
return{LatticeGridProvider,useLatticeGrid};
}
function createLatticeViewer(options){
const React=options&&options.React;
requireReact(React,'createLatticeViewer');
const viewer=String(options.viewer||'');
const mount=options.mount;
const label=options.name||`Lattice${viewer.charAt(0).toUpperCase()}${viewer.slice(1)}`;
const requires=Array.isArray(options.requires)?options.requires:[];
const fromContext=options.fromContext||null;
if(typeof mount!=='function'){
throw new TypeError(`${label} needs a mount factory: createLatticeViewer({ React, mount }).`);
}
if(!Object.hasOwn(VIEWER_EVENTS,viewer)){
throw new TypeError(
`createLatticeViewer: "${viewer}" is not a viewer this adapter knows; expected one of `
+`${Object.keys(VIEWER_EVENTS).join(', ')}.`);
}
const{
createElement,useRef,useEffect,useContext,useImperativeHandle,forwardRef,
}=React;
const hasContext=typeof React.createContext==='function'&&typeof useContext==='function';
const GridContext=hasContext?gridContext(React):null;
const own=new Set(['gridName','onReady','onDestroy']);
const Viewer=(props,ref)=>{
const elementRef=useRef(null);
const controllerRef=useRef(null);
const propsRef=useRef(props);
const registry=hasContext?useContext(GridContext):null;
const contextGrid=fromContext&&registry&&registry.grids
?(registry.grids[typeof props.gridName==='string'?props.gridName:DEFAULT_GRID_NAME]??null)
:null;
const resolved=fromContext&&props[fromContext]===undefined&&contextGrid
?{...props,[fromContext]:contextGrid}
:props;
propsRef.current=resolved;
const identity=fromContext&&!requires.includes(fromContext)
?[...requires,fromContext]:requires;
const deps=identity.map((key)=>resolved[key]);
useEffect(()=>{
const element=elementRef.current;
if(!element)return undefined;
const current=propsRef.current;
if(requires.some((key)=>current[key]===null||current[key]===undefined)){
return undefined;
}
const parts=splitProps(current,own);
const controller=createViewerController({
viewer,mount,element,props:parts.rest,name:label,
});
controllerRef.current=controller;
if(typeof parts.own.onReady==='function'){
(parts.own.onReady)(controller.instance);
}
return()=>{
controllerRef.current=null;
const latest=propsRef.current;
if(typeof latest.onDestroy==='function')(latest.onDestroy)();
controller.destroy();
};
},deps);
useEffect(()=>{
const controller=controllerRef.current;
if(controller)controller.update(splitProps(propsRef.current,own).rest);
});
useImperativeHandle(ref,()=>({
get instance(){return controllerRef.current?controllerRef.current.instance:null;},
}),[]);
const{host}=splitProps(resolved,own);
return createElement('div',{...host,ref:elementRef});
};
Viewer.displayName=label;
return typeof forwardRef==='function'?forwardRef(Viewer):Viewer;
}
function createLatticeKPI(deps){
const createKPI=deps&&deps.createKPI;
if(typeof createKPI!=='function'){
throw new TypeError('createLatticeKPI needs createKPI: createLatticeKPI({ React, createKPI }).');
}
return createLatticeViewer({
React:deps.React,
viewer:'kpi',
name:'LatticeKPI',
mount:(el,config)=>createKPI(el,config),
fromContext:'grid',
});
}
function createLatticeChart(deps){
const createChart=deps&&deps.createChart;
if(typeof createChart!=='function'){
throw new TypeError('createLatticeChart needs createChart: createLatticeChart({ React, createChart }).');
}
return createLatticeViewer({
React:deps.React,
viewer:'chart',
name:'LatticeChart',
mount:(el,config)=>createChart({...config,container:el}),
requires:['grid'],
fromContext:'grid',
});
}
function createLatticeKanban(deps){
const createKanban=deps&&deps.createKanban;
if(typeof createKanban!=='function'){
throw new TypeError('createLatticeKanban needs createKanban: createLatticeKanban({ React, createKanban }).');
}
return createLatticeViewer({
React:deps.React,
viewer:'kanban',
name:'LatticeKanban',
mount:(el,config)=>createKanban(el,config),
fromContext:'grid',
});
}
function createLatticeGantt(deps){
const createGantt=deps&&deps.createGantt;
if(typeof createGantt!=='function'){
throw new TypeError('createLatticeGantt needs createGantt: createLatticeGantt({ React, createGantt }).');
}
return createLatticeViewer({
React:deps.React,
viewer:'gantt',
name:'LatticeGantt',
mount:(el,config)=>createGantt({...config,element:el}),
});
}
function createLatticeLayout(deps){
const createLayout=deps&&deps.createLayout;
if(typeof createLayout!=='function'){
throw new TypeError('createLatticeLayout needs createLayout: createLatticeLayout({ React, createLayout }).');
}
return createLatticeViewer({
React:deps.React,
viewer:'layout',
name:'LatticeLayout',
mount:(el,config)=>createLayout(el,config),
});
}
function createLatticeTabs(deps){
const React=deps&&deps.React;
const ReactDOM=deps&&deps.ReactDOM;
const createTabs=deps&&deps.createTabs;
requireReact(React,'createLatticeTabs');
if(!ReactDOM||typeof ReactDOM.createPortal!=='function'){
throw new TypeError(
'createLatticeTabs needs react-dom for createPortal: '
+"createLatticeTabs({ React, ReactDOM, createTabs }) with ReactDOM from 'react-dom'.");
}
if(typeof createTabs!=='function'){
throw new TypeError('createLatticeTabs needs createTabs: createLatticeTabs({ React, ReactDOM, createTabs }).');
}
const{
createElement,Fragment,useRef,useEffect,useState,useImperativeHandle,forwardRef,
}=React;
const LatticeTabs=(props,ref)=>{
const elementRef=useRef(null);
const controllerRef=useRef(null);
const propsRef=useRef(props);
propsRef.current=props;
const[hosts,setHosts]=useState(()=>({}));
const appliedTabsRef=useRef(null);
useEffect(()=>{
const element=elementRef.current;
if(!element)return undefined;
const current=propsRef.current;
const{host:unusedHost,own:unusedOwn,rest}=splitProps(current,new Set(['tabs','active']));
const declared=Array.isArray(current.tabs)?current.tabs:[];
const opened={};
const descriptors=declared.map((tab)=>{
const spec=(tab);
if(spec.content===undefined)return spec;
const{content:unusedContent,...withoutContent}=spec;
return{
...withoutContent,
view:(bodyEl)=>{
opened[spec.id]=bodyEl;
setHosts((held)=>(held[spec.id]===bodyEl?held:{...held,[spec.id]:bodyEl}));
return{
destroy(){
setHosts((held)=>{
if(!Object.hasOwn(held,spec.id))return held;
const next={...held};
delete next[spec.id];
return next;
});
},
};
},
};
});
const strip=createTabs(element,{
...rest,
tabs:descriptors,
createGrid:deps.createGrid||(()=>{
throw new Error(
'[lattice] LatticeTabs: a tab has no `content` and no `createGrid` was injected, so '
+'there is nothing to build it with. Give the tab a React `content`, or pass '
+'createGrid into createLatticeTabs.');
}),
...(typeof current.active==='string'?{active:current.active}:{}),
});
controllerRef.current=strip;
appliedTabsRef.current=current.tabs;
const off=[];
for(const event of VIEWER_EVENTS.tabs){
const prop=viewerHandlerName(event);
const stop=strip.on(event,(payload)=>{
const fn=(propsRef.current)[prop];
if(typeof fn==='function')fn(payload);
});
if(typeof stop==='function')off.push(stop);
}
return()=>{
controllerRef.current=null;
for(const stop of off){
try{stop();}catch{}
}
strip.destroy();
setHosts({});
};
},[]);
useEffect(()=>{
const strip=controllerRef.current;
if(!strip)return;
const wanted=props.active;
if(typeof wanted==='string'&&strip.activeId!==wanted)strip.activate(wanted);
if(!Object.is(appliedTabsRef.current,props.tabs)){
appliedTabsRef.current=props.tabs;
warnOnce('react.tabs.mountOnly.tabs',
'LatticeTabs: `tabs` changed (a label, a badge or a descriptor), but the strip takes '
+'it only when created — the module has no way to repaint an existing tab. Nothing was '
+'applied and the strip was NOT rebuilt — rebuilding it would lose whichever tab is open '
+'and any state its content holds. Give the component a `key` that changes when a '
+'genuine rebuild is wanted; a live badge otherwise needs to live in your own render, '
+"as `tab.badge` on this component's own props does today.");
}
});
useImperativeHandle(ref,()=>({
get instance(){return controllerRef.current;},
get tabs(){return controllerRef.current;},
}),[]);
const{host}=splitProps(props,new Set(['tabs','active']));
const declared=Array.isArray(props.tabs)?props.tabs:[];
const portals=declared
.filter((tab)=>(tab).content!==undefined&&hosts[(tab).id])
.map((tab)=>{
const spec=(tab);
const node=typeof spec.content==='function'?spec.content():spec.content;
return ReactDOM.createPortal(node,hosts[spec.id],spec.id);
});
return createElement(
Fragment,
null,
createElement('div',{...host,ref:elementRef}),
...portals,
);
};
LatticeTabs.displayName='LatticeTabs';
return typeof forwardRef==='function'?forwardRef(LatticeTabs):LatticeTabs;
}
function createLatticeRouter(deps){
const React=deps&&deps.React;
const createDataRouter=deps&&deps.createDataRouter;
requireReact(React,'createLatticeRouter');
if(typeof React.createContext!=='function'){
throw new TypeError('createLatticeRouter needs a React with createContext.');
}
if(typeof createDataRouter!=='function'){
throw new TypeError(
'createLatticeRouter needs createDataRouter: createLatticeRouter({ React, createDataRouter }).');
}
const{
createElement,useState,useEffect,useRef,useContext,
}=React;
const RouterContext=routerContext(React);
const useLatticeRouter=(config)=>{
const[router,setRouter]=useState(null);
const configRef=useRef(config);
useEffect(()=>{
const made=createDataRouter(configRef.current||{});
setRouter(made);
return()=>{
setRouter(null);
made.destroy();
};
},[]);
return router;
};
const LatticeRouterProvider=(props)=>createElement(
RouterContext.Provider,{value:props.router??null},props.children,
);
LatticeRouterProvider.displayName='LatticeRouterProvider';
const useRouter=()=>useContext(RouterContext);
return{useLatticeRouter,LatticeRouterProvider,useRouter};
}
function createLatticeReact(deps){
const React=deps&&deps.React;
requireReact(React,'createLatticeReact');
const{LatticeGridProvider,useLatticeGrid}=createLatticeGridContext({React});
const out={LatticeGridProvider,useLatticeGrid};
if(typeof deps.createGrid==='function'){
out.LatticeGrid=createLatticeGrid({React,createGrid:deps.createGrid});
}
if(typeof deps.createKPI==='function'){
out.LatticeKPI=createLatticeKPI({React,createKPI:deps.createKPI});
}
if(typeof deps.createChart==='function'){
out.LatticeChart=createLatticeChart({React,createChart:deps.createChart});
}
if(typeof deps.createKanban==='function'){
out.LatticeKanban=createLatticeKanban({React,createKanban:deps.createKanban});
}
if(typeof deps.createGantt==='function'){
out.LatticeGantt=createLatticeGantt({React,createGantt:deps.createGantt});
}
if(typeof deps.createLayout==='function'){
out.LatticeLayout=createLatticeLayout({React,createLayout:deps.createLayout});
}
if(typeof deps.createTabs==='function'&&deps.ReactDOM){
out.LatticeTabs=createLatticeTabs({
React,ReactDOM:deps.ReactDOM,createTabs:deps.createTabs,createGrid:deps.createGrid,
});
}
if(typeof deps.createDataRouter==='function'){
Object.assign(out,createLatticeRouter({React,createDataRouter:deps.createDataRouter}));
}
return out;
}
const __default=createLatticeGrid;
});
var __entry=__req("packages/modules/react/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridReact"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);