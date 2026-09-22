/*!
 * Lattice Grid 1.68.1, angular module
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
__def("packages/modules/angular/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"EVENT_NAMES",{enumerable:true,get:function(){return EVENT_NAMES;}});
Object.defineProperty(__exports,"dashedName",{enumerable:true,get:function(){return dashedName;}});
Object.defineProperty(__exports,"createLatticeGrid",{enumerable:true,get:function(){return createLatticeGrid;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__req("packages/modules/shared/adapter.js");
const createGridController=__m1["createGridController"];
const EVENT_NAMES=__m1["EVENT_NAMES"];
const dashedName=__m1["dashedName"];
const handlerName=__m1["handlerName"];
const IMPERATIVE_INPUTS=Object.freeze(['sort','filters','quickFilter','selectedKeys']);
function emitterKey(event){
return String(event).replace(/:/g,'_');
}
function canCompileAtRuntime(ng){
const real=typeof((ng))['\u0275\u0275defineComponent']==='function';
if(!real)return true;
const globals=(globalThis);
return!!(globals.ng&&globals.ng['\u0275compilerFacade']);
}
function createLatticeGrid(deps){
const ng=deps&&deps.ng;
const createGrid=deps&&deps.createGrid;
if(!ng||typeof ng.Component!=='function'||typeof ng.Directive!=='function'
||typeof ng.Input!=='function'||typeof ng.Output!=='function'
||typeof ng.EventEmitter!=='function'||typeof ng.inject!=='function'){
throw new TypeError('createLatticeGrid needs the Angular core namespace: createLatticeGrid({ ng, createGrid }).');
}
if(typeof createGrid!=='function'){
throw new TypeError('createLatticeGrid needs createGrid: createLatticeGrid({ ng, createGrid }).');
}
warnOnce('angular.deprecated',
'modules/angular is deprecated: it needs the JIT compiler. '
+'Use @toclocoinc/lattice-grid/angular.');
if(!canCompileAtRuntime(ng)){
throw new Error(
'[lattice] modules/angular builds its component at run time, which needs Angular\'s JIT '
+'compiler, and this page has none — which is what a production (AOT) build looks like. '
+'Use @toclocoinc/lattice-grid/angular, the ahead-of-time Angular library in this same '
+'package, which needs no compiler: import { LatticeGridComponent, provideLattice } from '
+"'@toclocoinc/lattice-grid/angular'. (To keep using this adapter, import "
+"'@angular/compiler' before it — a development-server shape, not a production one.)");
}
const{
Component,Directive,Input,Output,EventEmitter,ElementRef,inject,
}=ng;
const PLATFORM_ID=ng.PLATFORM_ID;
const isPlatformBrowser=typeof deps.isPlatformBrowser==='function'?deps.isPlatformBrowser:null;
const init=(self)=>{
self.__elementRef=inject(ElementRef);
self.__platformId=PLATFORM_ID?inject(PLATFORM_ID):null;
self.__controller=null;
self.config=undefined;
for(const key of IMPERATIVE_INPUTS)self[key]=undefined;
for(const name of EVENT_NAMES)self[emitterKey(name)]=new EventEmitter();
};
const lifecycle={
__browser(){
if(isPlatformBrowser&&this.__platformId!=null)return isPlatformBrowser(this.__platformId);
return typeof document!=='undefined';
},
__props(){
const out=(this.config&&typeof this.config==='object')?{...this.config}:{};
for(const key of IMPERATIVE_INPUTS)if(this[key]!==undefined)out[key]=this[key];
for(const name of EVENT_NAMES){
const emitter=this[emitterKey(name)];
out[handlerName(name)]=
(event)=>{if(emitter&&typeof emitter.emit==='function')emitter.emit(event);};
}
return out;
},
ngOnInit(){
if(this.__controller||!this.__browser())return;
const element=this.__elementRef&&this.__elementRef.nativeElement;
if(!element)return;
this.__controller=createGridController({createGrid,element,props:this.__props()});
},
ngOnChanges(){
if(this.__controller)this.__controller.update(this.__props());
},
ngOnDestroy(){
if(this.__controller){
this.__controller.destroy();
this.__controller=null;
}
},
};
const build=(cls,classDecorator,configAlias)=>{
const proto=cls.prototype;
Object.assign(proto,lifecycle);
Object.defineProperty(proto,'grid',{
get(){return this.__controller?this.__controller.grid:null;},
configurable:true,
});
Input()(proto,'config');
if(configAlias){
Object.defineProperty(proto,configAlias,{
set(value){if(value!=='')this.config=value;},
get(){return this.config;},
configurable:true,
});
Input()(proto,configAlias);
}
for(const key of IMPERATIVE_INPUTS)Input()(proto,key);
for(const name of EVENT_NAMES)Output(dashedName(name))(proto,emitterKey(name));
const decorated=classDecorator(cls);
return decorated||cls;
};
const LatticeGridComponent=build(
class LatticeGridComponent{
constructor(){init(this);}
},
Component({selector:'lattice-grid',template:'',standalone:true}),
);
const LatticeGridDirective=build(
class LatticeGridDirective{
constructor(){init(this);}
},
Directive({selector:'[latticeGrid]',standalone:true}),
'latticeGrid',
);
return{LatticeGridComponent,LatticeGridDirective};
}
const __default=createLatticeGrid;
});
var __entry=__req("packages/modules/angular/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridAngular"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);