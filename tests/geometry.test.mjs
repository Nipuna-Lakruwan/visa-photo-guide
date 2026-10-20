import test from 'node:test';
import assert from 'node:assert/strict';
import {frame,corners,toSource,toFrame,fitFrame,measurements} from '../geometry.mjs';
import {profiles} from '../profiles.mjs';
test('Every crop corner stays within original pixels across profiles, aspect ratios, rotation, zoom and pan',()=>{
 for(const p of profiles)for(const [W,H]of [[827,1181],[2000,700],[500,2000],[600,600]])for(const angle of [-10,-7.3,0,8.5,10])for(const zoom of [1,1.12,2,6])for(const [x,y]of [[-W,-H],[W/2,H/2],[2*W,2*H]]){
  const f=frame(W,H,p.w/p.h,zoom,angle,x,y);
  for(const q of corners(f)){assert(q.x>=-1e-7&&q.x<=W+1e-7);assert(q.y>=-1e-7&&q.y<=H+1e-7)}
  assert(Math.abs(f.w/f.h-p.w/p.h)<1e-9);
 }
});
test('Source and export coordinate mappings are inverse, including rotated images',()=>{
 for(const angle of [-10,0,10]){const f=frame(1300,1900,.7,1.4,angle,600,950);for(const p of [{x:0,y:0},{x:.5,y:.5},{x:1,y:1},{x:.3,y:.82}]){const q=toFrame(toSource(p,f),f);assert(Math.abs(q.x-p.x)<1e-9);assert(Math.abs(q.y-p.y)<1e-9)}}
});
test('A feasible Malaysian fit respects head and margin rules without added pixels',()=>{
 const p=profiles.find(p=>p.id==='my-vdr'),marks={crown:{x:600,y:210},chin:{x:600,y:910},center:{x:600,y:520}},f=fitFrame(1200,1600,p,marks),m=measurements(f,marks,p);
 assert(m.head>=30&&m.head<=35);assert(m.top>=4&&m.top<=6);assert(m.bottom>=5-1e-7&&m.bottom<=10+1e-7);assert(m.offset<1e-7);
});
test('An infeasible original is clamped instead of generating a background',()=>{
 const p=profiles[0],marks={crown:{x:400,y:100},chin:{x:400,y:850},center:{x:400,y:500}},f=fitFrame(800,1200,p,marks),m=measurements(f,marks,p);
 for(const c of corners(f)){assert(c.x>=-1e-7&&c.y>=-1e-7)}assert(m.bottom>10);
});
test('Reversed head landmarks cannot trigger a misleading fit',()=>assert.throws(()=>fitFrame(1000,1500,profiles[0],{crown:{x:500,y:900},chin:{x:500,y:200},center:{x:500,y:500}})));
test('Every country profile has a government source and an explicit application',()=>{
 assert.equal(new Set(profiles.map(p=>p.country)).size,7);
 for(const p of profiles){assert(p.country&&p.document&&p.id);assert(p.source.startsWith('https://'));assert(p.check||p.application);assert(p.rules.length>=3)}
 assert(profiles.find(p=>p.id==='uk-digital').originalOnly);assert(profiles.find(p=>p.id==='ca-passport').originalOnly);
});
