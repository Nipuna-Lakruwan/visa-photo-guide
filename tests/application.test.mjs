import test from 'node:test';
import assert from 'node:assert/strict';
import {appHarness} from './app-harness.mjs';
test('Guided marking gives an explicit next action after the final point',async()=>{
 const a=await appHarness();await a.load(a.file());a.run("beginMark('crown',true);setMark('crown',{x:600,y:210});setMark('chin',{x:600,y:910});setMark('center',{x:600,y:500})");await a.settle();assert.match(a.get('fitMessage').textContent,/All three points are marked/);
});
test('Clearing erases every preview buffer and releases image URLs',async()=>{
 const a=await appHarness();await a.load(a.file());assert(a.get('mini').hasImage);await a.click('remove');assert.equal(a.get('mini').hasImage,false);assert.equal(a.get('preview').hasImage,false);assert.equal(a.get('source').hasImage,false);assert.equal(a.urls.size,0);assert(a.get('download').disabled);
});
test('Deleting a numeric landmark clears its measurement and disables fit',async()=>{
 const a=await appHarness();await a.load(a.file());await a.input('crownY','13.125');await a.input('chinY','56.875');await a.input('centreX','50');assert.equal(a.get('fit').disabled,false);await a.input('crownY','');assert.equal(a.run('marks.crown'),undefined);assert(a.get('fit').disabled);
});
test('Zero or negative file ceilings are rejected, not treated as unlimited',async()=>{
 const a=await appHarness();await a.load(a.file());for(const v of ['0','-5']){await a.input('limit',v);assert(a.get('download').disabled);assert.match(a.get('exportInfo').textContent,/ceiling must be/);}await a.input('limit','');assert.equal(a.get('download').disabled,false);
});
test('Reset message survives rendering',async()=>{const a=await appHarness();await a.load(a.file());await a.click('reset');assert.match(a.get('fitMessage').textContent,/Framing reset/)});
test('Original-preserving profiles download exactly the selected Blob',async()=>{const a=await appHarness(),b=a.file();await a.load(b);for(const id of ['uk-digital','ca-passport']){await a.profile(id);await a.click('download');assert.equal(a.downloads.at(-1).blob,b);assert.equal(a.get('exportControls').disabled,true)}});
test('Newest selected image wins even when a previous decode finishes later',async()=>{const a=await appHarness();let done;const wait=new Promise(r=>done=r),slow=a.file('slow.jpg',{decodeWait:wait}),fast=a.file('fast.jpg');const old=a.load(slow);await a.load(fast);done();await old;assert.equal(a.run('file.name'),'fast.jpg')});
test('Clear while an image is decoding prevents it from returning',async()=>{const a=await appHarness();let done;const wait=new Promise(r=>done=r),pending=a.load(a.file('slow.jpg',{decodeWait:wait}));a.run('discard()');done();await pending;assert.equal(a.run('image'),null);assert(a.get('download').disabled)});
test('Transparent, corrupt and unsupported files fail without enabling export',async()=>{for(const options of [{type:'image/png',transparent:true},{corrupt:true},{type:'image/heic'}]){const a=await appHarness();await a.load(a.file('bad',options));assert.equal(a.run('image'),null);assert(a.get('download').disabled);assert(a.get('downloadStatus').textContent)}});
test('Rapid changes invalidate previous export and publish only the latest settings',async()=>{const a=await appHarness();await a.load(a.file());a.get('pixels').value='700';a.run('draw()');a.get('pixels').value='420';a.run('draw()');await a.settle();assert.equal(a.run('lastResult.width'),420);assert.equal(a.run('lastResult.height'),600);assert.equal(a.get('download').disabled,false)});
