import vm from 'node:vm';
import fs from 'node:fs';
import {Blob} from 'node:buffer';
import * as geometry from '../geometry.mjs';
import {profiles,checkedDate} from '../profiles.mjs';
export async function appHarness(){
 const urls=new Map(),downloads=[],timers=new Map(),elements=new Map();let counter=0,timerID=0,document;
 class Element{
  constructor(id='',tag='div'){this.id=id;this.tag=tag;this.value='';this.textContent='';this.children=[];this.dataset={};this.disabled=false;this.hidden=false;this.open=false;this.checked=false;this.style={};this.listeners={};this.min='';this.max='';this.className='';this.classes=new Set();this.classList={add:(k)=>this.classes.add(k),remove:(...ks)=>ks.forEach(k=>this.classes.delete(k)),toggle:(k,b)=>{if(b===undefined)b=!this.classes.has(k);b?this.classes.add(k):this.classes.delete(k)}};}
  get value(){return this._value??''}set value(v){this._value=String(v)}
  append(...c){this.children.push(...c)} replaceChildren(...c){this.children=c} add(c){this.children.push(c)}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
  setAttribute(k,v){this[k]=v} removeAttribute(k){delete this[k]}
  focus(){document.activeElement=this} setPointerCapture(){} scrollIntoView(){} showModal(){this.open=true} close(){this.open=false}
  getBoundingClientRect(){return {left:0,top:0,right:800,bottom:850,width:800,height:850}}
  click(){if(this.tag==='a')downloads.push({url:this.href,name:this.download,blob:urls.get(this.href)});else this.onclick?.({target:this});}
 }
 class Canvas extends Element{
  constructor(id){super(id,'canvas');this._width=420;this._height=600;this.hasImage=false;this.transparent=false;this.context={clearRect:()=>{this.hasImage=false},fillRect:()=>{this.hasImage=false},drawImage:(img)=>{this.hasImage=true;this.transparent=!!img.transparent},getImageData:()=>({data:new Uint8ClampedArray([0,0,0,this.transparent?0:255])})};for(const k of ['save','restore','translate','scale','rotate','setLineDash','beginPath','rect','moveTo','lineTo','closePath','fill','stroke','arc','strokeText','fillText'])this.context[k]=()=>{};}
  get width(){return this._width}set width(n){this._width=n;this.hasImage=false}get height(){return this._height}set height(n){this._height=n;this.hasImage=false}
  getContext(){return this.context}
  toBlob(fn,type,q){const size=Math.max(2000,Math.round(this.width*this.height*q*.4)),bytes=new Uint8Array(size);bytes.set([255,216,255,224,0,16,74,70,73,70,0]);new DataView(bytes.buffer).setUint16(30,this.width);new DataView(bytes.buffer).setUint16(32,this.height);queueMicrotask(()=>fn(new Blob([bytes],{type})));}
 }
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const m of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
  const el=m[1]==='canvas'?new Canvas(m[3]):new Element(m[3],m[1]);for(const a of ['value','min','max']){const match=m[2].match(new RegExp('\\b'+a+'="([^"]*)"'));if(match)el[a]=match[1]}el.checked=/\bchecked\b/.test(m[2]);el.hidden=/\bhidden\b/.test(m[2]);el.disabled=/\bdisabled\b/.test(m[2]);elements.set(el.id,el);
 }
 const markButtons=['markCrown','markChin','markCenter'].map((id,i)=>{const el=elements.get(id);el.dataset.mark=['crown','chin','center'][i];return el});const checks=[new Element(),new Element(),new Element()];
 document={activeElement:null,getElementById:id=>{if(!elements.has(id))throw Error('Missing element '+id);return elements.get(id)},createElement:tag=>tag==='canvas'?new Canvas():new Element('',tag),querySelectorAll:selector=>selector==='[data-mark]'?markButtons:selector==='.checklist input'?checks:[]};
 class Image{
  constructor(){this.width=0;this.height=0;this.src='';}
  async decode(){const b=urls.get(this.src);if(!b)throw Error('Missing image URL');if(b.decodeWait)await b.decodeWait;if(b.corrupt)throw Error('The source image could not be decoded.');if(b.dims){[this.width,this.height]=b.dims;this.transparent=b.transparent}else{const bytes=await b.arrayBuffer(),v=new DataView(bytes);this.width=v.getUint16(30);this.height=v.getUint16(32)}this.naturalWidth=this.width;this.naturalHeight=this.height;}
 }
 const context=vm.createContext({document,Image,Blob,Option:class{constructor(t,v){this.textContent=t;this.value=v}},URL:{createObjectURL:b=>{const u='blob:test-'+(++counter);urls.set(u,b);return u},revokeObjectURL:u=>urls.delete(u)},setTimeout:fn=>{const id=++timerID;timers.set(id,fn);return id},clearTimeout:id=>timers.delete(id),...geometry,profiles,checkedDate});
 const source=fs.readFileSync(new URL('../app.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');vm.runInContext(source,context);
 const run=code=>vm.runInContext(code,context),get=id=>elements.get(id);
 async function settle(){for(let i=0;i<80;i++){await new Promise(resolve=>setImmediate(resolve));const pending=[...timers];timers.clear();for(const[,fn]of pending)fn();if(!pending.length&&i>10)break;}}
 async function input(id,value){const el=get(id);el.value=String(value);document.activeElement=el;el.oninput?.({target:el});for(const fn of el.listeners.input||[])fn({target:el});await settle();}
 function file(name='sample.jpg',options={}){const b=new Blob(['test image'],{type:options.type||'image/jpeg'});const {type,...extra}=options;Object.assign(b,{name,dims:options.dims||[1200,1600],...extra});return b;}
 return {run,get,input,settle,file,downloads,urls,async load(b){context.upload=b;await run('loadFile(upload)');await settle()},async click(id){get(id).click();await settle()},async profile(id){context.nextProfile=id;run('setProfile(profiles.find(p=>p.id===nextProfile))');await settle()}};
}
