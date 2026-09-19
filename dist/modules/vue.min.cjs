/*!
 * Lattice Grid 1.65.0, vue module
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
__def("packages/modules/vue/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"EVENT_NAMES",{enumerable:true,get:function(){return EVENT_NAMES;}});
Object.defineProperty(__exports,"dashedName",{enumerable:true,get:function(){return dashedName;}});
Object.defineProperty(__exports,"createLatticeGrid",{enumerable:true,get:function(){return createLatticeGrid;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__req("packages/modules/shared/adapter.js");
const createGridController=__m0["createGridController"];
const EVENT_NAMES=__m0["EVENT_NAMES"];
const dashedName=__m0["dashedName"];
const isHandlerProp=__m0["isHandlerProp"];
const aliasConfigKey=__m0["aliasConfigKey"];
function createLatticeGrid(deps){
const vue=deps&&deps.vue;
const createGrid=deps&&deps.createGrid;
if(!vue||typeof vue.h!=='function'){
throw new TypeError('createLatticeGrid needs the Vue runtime: createLatticeGrid({ vue, createGrid }).');
}
if(typeof createGrid!=='function'){
throw new TypeError('createLatticeGrid needs createGrid: createLatticeGrid({ vue, createGrid }).');
}
const{h,ref,onMounted,onBeforeUnmount,watchEffect}=vue;
return{
name:'LatticeGrid',
emits:EVENT_NAMES.map(dashedName),
inheritAttrs:false,
setup(props,ctx){
const host=ref(null);
const controller=ref(null);
const gridProps=()=>{
const out={};
const attrs=ctx.attrs||{};
for(const[key,value]of Object.entries(attrs)){
if(isHandlerProp(key))continue;
const camel=aliasConfigKey(key);
if(camel!==key&&!Object.hasOwn(attrs,camel)){
out[camel]=value;
}else{
out[key]=value;
}
}
for(const name of EVENT_NAMES){
out[`on${name.split(':').map((p)=>p.charAt(0).toUpperCase()+p.slice(1)).join('')}`]=
(event)=>ctx.emit(dashedName(name),event);
}
return out;
};
onMounted(()=>{
controller.value=createGridController({
createGrid,element:host.value,props:gridProps(),
});
watchEffect(()=>{
const live=controller.value;
if(live)live.update(gridProps());
});
});
onBeforeUnmount(()=>{
const live=controller.value;
controller.value=null;
if(live)live.destroy();
});
const grid=()=>(controller.value?controller.value.grid:null);
if(typeof ctx.expose==='function')ctx.expose({grid});
return()=>h('div',{ref:host});
},
};
}
const __default=createLatticeGrid;
});
var __entry=__req("packages/modules/vue/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{root["LatticeGridVue"]=__entry;}
})(typeof globalThis!=='undefined'?globalThis:this);