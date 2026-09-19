/*!
 * Lattice Grid 1.64.0, dhtmlx-compat module
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
var __extmods=Object.create(null);
__extmods["@toclocoinc/lattice-grid"]=(root["LatticeGrid"]||null);
function __ext(spec){
var mod=__extmods[spec];
var g=typeof globalThis!=='undefined'?globalThis:(typeof self!=='undefined'?self:null);
if(mod)return mod;
if(spec==="@toclocoinc/lattice-grid"&&g&&g["LatticeGrid"])return g["LatticeGrid"];
throw new Error('[lattice] this module shares the Lattice core with the page, but it was not found. Load lattice-grid (or its script build) before this module. Missing: '+spec);
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
const STAMPED_VERSION="1.64.0";
async function resolveVersion(){
if(STAMPED_VERSION!=='0.0.0-source')return STAMPED_VERSION;
return STAMPED_VERSION;
}
const VERSION="1.64.0";
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
__def("packages/modules/dhtmlx-compat/util.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"reportUntranslated",{enumerable:true,get:function(){return reportUntranslated;}});
Object.defineProperty(__exports,"indexOfKey",{enumerable:true,get:function(){return indexOfKey;}});
Object.defineProperty(__exports,"rowsFrom",{enumerable:true,get:function(){return rowsFrom;}});
Object.defineProperty(__exports,"rowShape",{enumerable:true,get:function(){return rowShape;}});
Object.defineProperty(__exports,"columnShape",{enumerable:true,get:function(){return columnShape;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
function reportUntranslated(source,translated,kind){
if(!source||typeof source!=='object')return;
for(const key of Object.keys(source)){
if(translated.has(key))continue;
warnOnce(
`dhtmlx.${kind}.dropped:${key}`,
`dhtmlx-compat does not translate the ${kind} key '${key}', so it has no effect. `
+'Nothing was applied for it.',
);
}
}
function indexOfKey(grid,key){
const count=grid.rows.count();
for(let i=0;i<count;i++){
const row=grid.rows.get(i);
if(row&&row.key===key)return i;
}
return-1;
}
function rowsFrom(data){
if(Array.isArray(data))return data;
if(data&&typeof data==='object'&&Array.isArray(data.data))return data.data;
return[];
}
function rowShape(grid,key){
const row=grid.rows.byKey(key);
return{...(row?row.data:undefined),id:key};
}
function columnShape(grid,colId){
return{id:colId};
}
});
__def("packages/modules/dhtmlx-compat/columns.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"translateColumn",{enumerable:true,get:function(){return translateColumn;}});
Object.defineProperty(__exports,"translateColumns",{enumerable:true,get:function(){return translateColumns;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const __m1=__ext("@toclocoinc/lattice-grid");
const sanitiseHtml=__m1["sanitiseHtml"];
const __m2=__req("packages/modules/dhtmlx-compat/util.js");
const reportUntranslated=__m2["reportUntranslated"];
const TRANSLATED_COLUMN=new Set([
'id','header','type','width','minWidth','maxWidth','resizable','hidden',
'draggable','align','tooltip','tooltipTemplate','template','htmlEnable',
'sortable','editable','editorType','editorConfig','options','summary',
]);
const EDITOR_NAMES=Object.freeze({
input:'text',
select:'select',
combobox:'select',
textarea:'textarea',
multiselect:'multiSelect',
datePicker:'date',
checkbox:'checkbox',
});
const COLUMN_TYPE_NAMES=Object.freeze({
number:'number',
date:'date',
});
function headerText(header){
if(typeof header==='string')return header;
if(Array.isArray(header)&&header.length>0){
if(header.length>1){
warnOnce(
'dhtmlx.header.multirow',
`dhtmlx-compat collapsed a ${header.length}-row header to its first row. `
+'Lattice titles are a single string; the remaining rows were not applied.',
);
}
const first=header[0];
if(typeof first==='string')return first;
if(first&&typeof first==='object'&&typeof first.text==='string')return first.text;
}
return undefined;
}
function wrapTemplate(template,htmlEnable){
return(el,p)=>{
const row={...(p.data||{}),id:p.row?p.row.key:undefined};
const out=template(p.value,row,{id:p.colId});
if(htmlEnable)el.innerHTML=sanitiseHtml(String(out));
else el.textContent=String(out);
};
}
function translateColumn(col){
if(!col||typeof col!=='object'||!col.id){
throw new TypeError('dhtmlx-compat: every column needs an id.');
}
reportUntranslated(col,TRANSLATED_COLUMN,'column');
const out={id:col.id,field:col.id};
const title=headerText(col.header);
if(title!==undefined)out.title=title;
if(col.type!==undefined){
const mapped=COLUMN_TYPE_NAMES[col.type];
if(mapped)out.type=mapped;
}
const hasLayout=col.width!==undefined||col.minWidth!==undefined
||col.maxWidth!==undefined||col.resizable!==undefined
||col.hidden!==undefined||col.draggable!==undefined;
if(hasLayout){
out.layout={};
if(col.width!==undefined)out.layout.width=col.width;
if(col.minWidth!==undefined)out.layout.min=col.minWidth;
if(col.maxWidth!==undefined)out.layout.max=col.maxWidth;
if(col.resizable!==undefined)out.layout.resizable=!!col.resizable;
if(col.hidden!==undefined)out.layout.hidden=!!col.hidden;
if(col.draggable!==undefined)out.layout.movable=!!col.draggable;
}
if(col.align!==undefined)out.cell={...(out.cell||{}),align:col.align};
if(col.tooltipTemplate!==undefined||col.tooltip!==undefined){
out.cell={...(out.cell||{}),tooltip:col.tooltipTemplate||col.tooltip};
}
if(typeof col.template==='function'){
out.cell={...(out.cell||{}),render:wrapTemplate(col.template,!!col.htmlEnable)};
}
if(col.sortable!==undefined)out.sort={enabled:!!col.sortable};
const hasEdit=col.editable!==undefined||col.editorType!==undefined
||col.editorConfig!==undefined||col.options!==undefined;
if(hasEdit){
out.edit={enabled:col.editable!==false};
if(col.editorType!==undefined){
const name=EDITOR_NAMES[col.editorType];
if(!name){
warnOnce(
`dhtmlx.editorType.unknown:${String(col.editorType)}`,
`dhtmlx-compat does not recognise editorType '${String(col.editorType)}'; `
+'the default text editor was used instead.',
);
}
out.edit.editor=name||'text';
}
if(col.editorConfig!==undefined||col.options!==undefined){
out.edit.props={...(col.editorConfig||{})};
if(col.options!==undefined)out.edit.props.options=col.options;
}
}
if(col.summary!==undefined)out.total=col.summary;
return out;
}
function translateColumns(columns){
if(!Array.isArray(columns))return[];
return columns.map(translateColumn);
}
});
__def("packages/modules/dhtmlx-compat/data.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createData",{enumerable:true,get:function(){return createData;}});
const __m0=__req("packages/modules/dhtmlx-compat/util.js");
const indexOfKey=__m0["indexOfKey"];
const rowsFrom=__m0["rowsFrom"];
function rowKeyOf(grid){
return grid.get('rowKey');
}
function createData(grid){
return{
add(item,index){
const change=index===undefined?{add:[item]}:{add:[item],at:index};
const result=grid.rows.apply(change);
if(result&&result.rejected&&result.rejected.length){
throw new Error(`dhtmlx-compat: data.add() was rejected: ${JSON.stringify(result.rejected[0])}.`);
}
return item[rowKeyOf(grid)];
},
update(id,item){
grid.rows.apply({update:[{...item,[rowKeyOf(grid)]:id}]});
},
remove(id){
grid.rows.apply({remove:Array.isArray(id)?id:[id]});
},
removeAll(){
grid.rows.load([]);
},
parse(data){
grid.rows.load(rowsFrom(data));
},
async load(url,callback){
const response=await fetch(url);
const data=await response.json();
grid.rows.load(rowsFrom(data));
if(typeof callback==='function')callback();
},
find(id){
const row=grid.rows.byKey(id);
return row?row.data:undefined;
},
findAll(predicate){
const out=[];
grid.rows.forEachAll((row)=>{if(predicate(row.data))out.push(row.data);});
return out;
},
exists(id){
return grid.rows.byKey(id)!==undefined&&grid.rows.byKey(id)!==null;
},
getItem(id){
const row=grid.rows.byKey(id);
return row?row.data:undefined;
},
serialize(){
return grid.rows.data();
},
getId(index){
const row=grid.rows.get(index);
return row?row.key:undefined;
},
getIndex(id){
return indexOfKey(grid,id);
},
getLength(){
return grid.rows.count();
},
forEach(fn){
grid.rows.forEach((row,index)=>fn(row.data,index));
},
sort(spec){
if(typeof spec==='function'){
throw new TypeError('dhtmlx-compat: data.sort(fn) is not supported: Lattice sorts by column, '
+'not a comparator. Pass a column id, or { by, dir }.');
}
const list=Array.isArray(spec)?spec:[spec];
grid.sort.set(list.map((entry)=>(typeof entry==='string'
?{col:entry,dir:'asc'}
:{col:entry.by,dir:entry.dir||'asc'})));
},
filter(condition){
if(typeof condition==='function'){
throw new TypeError('dhtmlx-compat: data.filter(fn) is not supported: Lattice filters are a '
+'declarative condition tree, not a predicate. Pass { col, op, value } instead.');
}
grid.filters.set(condition);
},
resetFilter(){
grid.filters.clear();
},
};
}
});
__def("packages/modules/dhtmlx-compat/selection.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createSelection",{enumerable:true,get:function(){return createSelection;}});
Object.defineProperty(__exports,"createRangeSelection",{enumerable:true,get:function(){return createRangeSelection;}});
const __m0=__req("packages/modules/dhtmlx-compat/util.js");
const indexOfKey=__m0["indexOfKey"];
const rowShape=__m0["rowShape"];
const columnShape=__m0["columnShape"];
function idOf(value){
return value&&typeof value==='object'&&'id'in value?value.id:value;
}
function createSelection(grid){
return{
setCell(rowId,colId,ctrlUp,shiftUp){
const index=indexOfKey(grid,idOf(rowId));
if(index===-1)return;
const col=idOf(colId);
if(shiftUp){grid.selection.extendRange(index,col);return;}
grid.selection.startRange(index,col,{additive:!!ctrlUp});
},
getCell(){
const cells=grid.selection.cells();
if(!cells.length)return undefined;
return{row:rowShape(grid,cells[0].key),column:columnShape(grid,cells[0].colId)};
},
getCells(){
return grid.selection.cells().map((c)=>({row:rowShape(grid,c.key),column:columnShape(grid,c.colId)}));
},
isSelectedCell(rowId,colId){
const index=indexOfKey(grid,idOf(rowId));
if(index===-1)return false;
return grid.selection.inRange(index,idOf(colId));
},
removeCell(){
grid.selection.clearRange();
},
enable(){},
disable(){
grid.selection.clearRange();
},
};
}
function toLatticeRange(range,grid){
const startRow=Math.min(range.start.row,range.end.row);
const endRow=Math.max(range.start.row,range.end.row);
const visible=grid.columns.visible().map((c)=>c.id);
const startIdx=visible.indexOf(range.start.column);
const endIdx=visible.indexOf(range.end.column);
const lo=Math.min(startIdx,endIdx);
const hi=Math.max(startIdx,endIdx);
const columns=lo===-1||hi===-1?[range.start.column]:visible.slice(lo,hi+1);
return{startRow,endRow,columns};
}
function fromLatticeRange(range){
return{
start:{row:range.startRow,column:range.columns[0]},
end:{row:range.endRow,column:range.columns[range.columns.length-1]},
};
}
function createRangeSelection(grid){
return{
setRange(range){
grid.selection.setRange(toLatticeRange(range,grid));
},
getRange(){
const ranges=grid.selection.ranges();
if(!ranges.length)return undefined;
return fromLatticeRange(ranges[ranges.length-1]);
},
getRangedCells(){
return grid.selection.cells().map((c)=>({row:rowShape(grid,c.key),column:columnShape(grid,c.colId)}));
},
resetRange(){
grid.selection.clearRange();
},
isRanged(){
return grid.selection.ranges().length>0;
},
enable(){},
disable(){
grid.selection.clearRange();
},
isDisabled(){
return false;
},
};
}
});
__def("packages/modules/dhtmlx-compat/passthrough.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createHistory",{enumerable:true,get:function(){return createHistory;}});
Object.defineProperty(__exports,"createExport",{enumerable:true,get:function(){return createExport;}});
function createHistory(grid){
return{
undo(){return grid.history.undo();},
redo(){return grid.history.redo();},
canUndo(){return grid.history.canUndo();},
canRedo(){return grid.history.canRedo();},
clear(){grid.history.clear();},
removeAll(){grid.history.clear();},
getHistory(){return grid.history.list();},
};
}
function createExport(grid){
return{
csv(opts){return grid.export.csv(opts);},
xlsx(opts){return grid.export.excel(opts);},
pdf(){
throw new Error('dhtmlx-compat: export.pdf() is not supported: Lattice has no PDF export. '
+'export.csv()/export.xlsx() work, or use the browser\'s own print-to-PDF via grid.export.print().');
},
png(){
throw new Error('dhtmlx-compat: export.png() is not supported: Lattice has no raster export.');
},
};
}
});
__def("packages/modules/dhtmlx-compat/events.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createEvents",{enumerable:true,get:function(){return createEvents;}});
const __m0=__req("packages/modules/dhtmlx-compat/util.js");
const rowShape=__m0["rowShape"];
const columnShape=__m0["columnShape"];
function cellArgs(e,grid){
return[rowShape(grid,e.key),columnShape(grid,e.colId),e.event];
}
function editStartArgs(e,grid){
const editor=e.column&&e.column.edit?e.column.edit.editor:undefined;
return[rowShape(grid,e.key),columnShape(grid,e.colId),editor];
}
function changedArgs(e,grid){
return[e.value,rowShape(grid,e.key),columnShape(grid,e.colId)];
}
function sortArgs(e,grid){
const first=e.sort&&e.sort[0];
if(!first)return null;
return[columnShape(grid,first.col),first.dir];
}
function rowDropArgs(e,grid){
let source;
let targetIndex;
if(e.key!==undefined){
source=[e.key];
targetIndex=e.to;
}else{
const rowKey=grid.get('rowKey');
const rows=Array.isArray(e.data)?e.data:[e.data];
source=rows.map((d)=>d&&d[rowKey]);
targetIndex=e.at;
}
const targetRow=targetIndex!==undefined?grid.rows.get(targetIndex):undefined;
return[{start:source[0],source,target:targetRow?targetRow.key:undefined},undefined];
}
const EVENT_NAME_MAP=Object.freeze({
cellClick:{latticeNames:['cell:clicked'],reshape:cellArgs},
cellDblClick:{latticeNames:['cell:dblclicked'],reshape:cellArgs},
cellRightClick:{latticeNames:['cell:contextmenu'],reshape:cellArgs},
afterEditStart:{latticeNames:['cell:edit:start'],reshape:editStartArgs},
afterEditEnd:{latticeNames:['cell:changed'],reshape:changedArgs},
afterSort:{latticeNames:['sort:changed'],reshape:sortArgs},
filterChange:{latticeNames:['filter:changed']},
afterColumnDrop:{latticeNames:['column:moved']},
afterResizeEnd:{latticeNames:['column:resized']},
resize:{latticeNames:['column:resized']},
afterColumnHide:{latticeNames:['column:visible']},
afterColumnShow:{latticeNames:['column:visible']},
afterExpand:{latticeNames:['group:toggled']},
afterCollapse:{latticeNames:['group:toggled']},
afterSelect:{latticeNames:['range:changed']},
afterUnSelect:{latticeNames:['range:changed']},
afterSetRange:{latticeNames:['range:changed']},
afterResetRange:{latticeNames:['range:changed']},
afterAdd:{latticeNames:['history:changed']},
afterUndo:{latticeNames:['history:applied']},
afterRedo:{latticeNames:['history:applied']},
afterCopy:{latticeNames:['clipboard:copy']},
scroll:{latticeNames:['scroll']},
afterRowDrop:{latticeNames:['row:moved','row:received'],reshape:rowDropArgs},
});
function createEvents(grid){
const warned=new Set();
return{
on(name,fn){
const mapped=EVENT_NAME_MAP[name];
if(!mapped){
if(!warned.has(name)){
warned.add(name);
console.warn(`dhtmlx-compat: "${name}" has no Lattice equivalent and will never fire.`);
}
return()=>{};
}
const offs=mapped.latticeNames.map((latticeName)=>grid.on(latticeName,(e)=>{
if(!mapped.reshape){fn(e);return;}
const args=mapped.reshape(e,grid);
if(args)fn(...args);
}));
return()=>{for(const off of offs)off();};
},
};
}
});
__def("packages/modules/dhtmlx-compat/rows.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createRowVisibility",{enumerable:true,get:function(){return createRowVisibility;}});
function createRowVisibility(grid){
const hidden=new Set();
const hostFilter={
active:()=>hidden.size>0,
passes:(row)=>!(row&&hidden.has(String(row.key))),
};
let installed=false;
function apply(){
if(!installed)installed=true;
grid.set('hostFilter',hostFilter);
}
return{
hideRow(id){
const key=String(id);
if(hidden.has(key))return;
hidden.add(key);
apply();
},
showRow(id){
const key=String(id);
if(!hidden.delete(key))return;
apply();
},
isRowHidden(id){
return hidden.has(String(id));
},
hiddenRows(){
return[...hidden];
},
};
}
});
__def("packages/modules/dhtmlx-compat/spans.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"createSpans",{enumerable:true,get:function(){return createSpans;}});
const __m0=__req("packages/core/src/internal/util.js");
const warnOnce=__m0["warnOnce"];
const TRANSLATED_SPAN=new Set(['row','column','rowspan','colspan']);
function cellKey(rowId,colId){
return`${String(rowId)}|${String(colId)}`;
}
function normaliseSpan(a,column,rowspan,colspan){
if(a&&typeof a==='object'){
for(const key of Object.keys(a)){
if(TRANSLATED_SPAN.has(key))continue;
warnOnce(
`dhtmlx.span.dropped:${key}`,
`dhtmlx-compat does not translate the span key '${key}', so it has no effect. `
+'Lattice spans carry only geometry (rowspan/colspan); the cell\'s value, css and '
+'tooltip come from its own column, not the span.',
);
}
return{
row:a.row,
column:a.column,
rows:Math.max(1,Math.floor(Number(a.rowspan)||1)),
cols:Math.max(1,Math.floor(Number(a.colspan)||1)),
};
}
return{
row:a,
column,
rows:Math.max(1,Math.floor(Number(rowspan)||1)),
cols:Math.max(1,Math.floor(Number(colspan)||1)),
};
}
function withSpanFunctions(columns,table){
return columns.map((col)=>({
...col,
cell:{
...(col.cell||{}),
spanColumns:(p)=>{
const entry=table.get(cellKey(p.row.key,p.colId));
return entry?entry.cols:1;
},
spanRows:(p)=>{
const entry=table.get(cellKey(p.row.key,p.colId));
return entry?entry.rows:1;
},
},
}));
}
function createSpans(grid){
const table=new Map();
let installed=false;
function apply(){
const columns=installed?grid.get('columns'):withSpanFunctions(grid.get('columns'),table);
installed=true;
grid.set('columns',columns);
}
return{
addSpan(a,column,rowspan,colspan){
const span=normaliseSpan(a,column,rowspan,colspan);
if(span.row===undefined||span.column===undefined){
throw new TypeError('dhtmlx-compat: addSpan needs a row and a column.');
}
if(span.rows<=1&&span.cols<=1){
this.removeSpan(span.row,span.column);
return;
}
table.set(cellKey(span.row,span.column),{rows:span.rows,cols:span.cols});
apply();
},
removeSpan(row,column){
if(!table.delete(cellKey(row,column)))return;
apply();
},
getSpan(row,column){
const entry=table.get(cellKey(row,column));
if(!entry)return undefined;
return{rowspan:entry.rows,colspan:entry.cols};
},
spanCount(){
return table.size;
},
};
}
});
__def("packages/modules/dhtmlx-compat/index.js",function(__exports,__req){
'use strict';
Object.defineProperty(__exports,"Grid",{enumerable:true,get:function(){return Grid;}});
Object.defineProperty(__exports,"default",{enumerable:true,get:function(){return __default;}});
const __m0=__ext("@toclocoinc/lattice-grid");
const createGrid=__m0["createGrid"];
const __m1=__req("packages/modules/dhtmlx-compat/columns.js");
const translateColumns=__m1["translateColumns"];
const __m2=__req("packages/modules/dhtmlx-compat/data.js");
const createData=__m2["createData"];
const __m3=__req("packages/modules/dhtmlx-compat/selection.js");
const createSelection=__m3["createSelection"];
const createRangeSelection=__m3["createRangeSelection"];
const __m4=__req("packages/modules/dhtmlx-compat/passthrough.js");
const createHistory=__m4["createHistory"];
const createExport=__m4["createExport"];
const __m5=__req("packages/modules/dhtmlx-compat/events.js");
const createEvents=__m5["createEvents"];
const __m6=__req("packages/modules/dhtmlx-compat/rows.js");
const createRowVisibility=__m6["createRowVisibility"];
const __m7=__req("packages/modules/dhtmlx-compat/spans.js");
const createSpans=__m7["createSpans"];
const __m8=__req("packages/modules/dhtmlx-compat/util.js");
const rowsFrom=__m8["rowsFrom"];
const reportUntranslated=__m8["reportUntranslated"];
const TRANSLATED_CONFIG=new Set([
'rowKey','columns','data','autoHeight','rowHeight','headerRowHeight',
'multiselection','dragItem','rowTransfer',
]);
function translateConfig(config){
reportUntranslated(config,TRANSLATED_CONFIG,'config');
const out={rowKey:config.rowKey||'id'};
if(config.columns!==undefined)out.columns=translateColumns(config.columns);
if(config.data!==undefined)out.rows=rowsFrom(config.data);
if(config.autoHeight!==undefined)out.autoHeight=config.autoHeight;
if(config.rowHeight!==undefined)out.rowHeight=config.rowHeight;
if(config.headerRowHeight!==undefined)out.headerHeight=config.headerRowHeight;
if(config.multiselection)out.selection='multiple';
if(config.dragItem==='row')out.rowReorder=true;
if(config.rowTransfer!==undefined)out.rowTransfer=config.rowTransfer;
return out;
}
class Grid{
#grid;
#rowVisibility;
#spans;
constructor(container,config={}){
this.#grid=createGrid(container,translateConfig(config));
this.data=createData(this.#grid);
this.selection=createSelection(this.#grid);
this.rangeSelection=createRangeSelection(this.#grid);
this.history=createHistory(this.#grid);
this.export=createExport(this.#grid);
this.events=createEvents(this.#grid);
this.#rowVisibility=createRowVisibility(this.#grid);
this.#spans=createSpans(this.#grid);
}
get lattice(){return this.#grid;}
hideRow(id){this.#rowVisibility.hideRow(id);}
showRow(id){this.#rowVisibility.showRow(id);}
isRowHidden(id){return this.#rowVisibility.isRowHidden(id);}
addSpan(a,column,rowspan,colspan){this.#spans.addSpan(a,column,rowspan,colspan);}
removeSpan(row,column){this.#spans.removeSpan(row,column);}
getSpan(row,column){return this.#spans.getSpan(row,column);}
setColumns(columns){
if(columns===undefined)return this.#grid.get('columns');
this.#grid.set('columns',translateColumns(columns));
return undefined;
}
destructor(){
this.#grid.destroy();
}
}
const __default=Grid;
});
var __entry=__req("packages/modules/dhtmlx-compat/index.js");
if(typeof module==='object'&&module.exports){module.exports=__entry;}
else if(typeof define==='function'&&define.amd){define(function(){return __entry;});}
else{
var __t=root["LatticeGrid"]||(root["LatticeGrid"]={});
for(var __k in __entry){if(__k!=='default')__t[__k]=__entry[__k];}
}
})(typeof globalThis!=='undefined'?globalThis:this);