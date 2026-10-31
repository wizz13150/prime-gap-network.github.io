// Synthetic architecture fixtures only. No Lafferty text or story events.
'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {validateBook,ReaderModel}=require('../assets/story-reader.js');
function fixture(n){
 const blocks=Array.from({length:n},(_,i)=>({id:'p'+i,kind:'paragraph',text:'Synthetic fixture '+i+'\nExact line break <not markup>.',sourceRef:'test fixture block '+i}));
 return {version:1,title:'Reader contract fixture',author:'Synthetic test data',source:{kind:'operator-supplied-text',reviewed:true,sha256:crypto.createHash('sha256').update(JSON.stringify(blocks)).digest('hex')},blocks,scenes:blocks.map((b,i)=>({id:'scene'+i,title:'Fixture '+i,blockIds:[b.id],visual:{kind:'image',src:'assets/story/fixture.svg',alt:'Synthetic visual fixture; not a published scene.'}}))};
}
for(const n of [1,7,17]){
 const source=fixture(n),model=new ReaderModel(source);assert.equal(model.count,n);assert.ok(Object.isFrozen(model.book.blocks));assert.throws(()=>{model.book.blocks[0].text='mutation';});
 for(let i=0;i<n;i++){model.select(i);assert.equal(model.currentBlocks[0].text,source.blocks[i].text);}
 assert.equal(model.next().id,'scene'+(n-1));model.select(0);assert.equal(model.previous().id,'scene0');
 assert.throws(()=>model.select(n));assert.throws(()=>model.select(-1));
 source.blocks[0].text='Host mutation';model.select(0);assert.notEqual(model.currentBlocks[0].text,'Host mutation');
}
const repeated=fixture(2);repeated.scenes.splice(1,0,{...repeated.scenes[0],id:'close-up'});assert.equal(new ReaderModel(repeated).count,3);
const missing=fixture(2);missing.scenes[1].blockIds=['unknown'];assert.throws(()=>validateBook(missing),/missing source block/);
const omitted=fixture(2);omitted.scenes.pop();assert.throws(()=>validateBook(omitted),/omitted/);
const order=fixture(2);order.scenes.reverse();assert.throws(()=>validateBook(order),/canonical source order/);
const duplicate=fixture(2);duplicate.scenes[1].id=duplicate.scenes[0].id;assert.throws(()=>validateBook(duplicate),/unique/);
const linked=fixture(1);linked.source.kind='linked-pdf';assert.throws(()=>validateBook(linked),/supplied source/);
const unreviewed=fixture(1);unreviewed.source.reviewed=false;assert.throws(()=>validateBook(unreviewed),/reviewed/);
const remote=fixture(1);remote.scenes[0].visual.src='https://example.test/story.pdf';assert.throws(()=>validateBook(remote),/local story assets/);
const privateMeta=fixture(1);privateMeta.source.path='private intake path';assert.throws(()=>validateBook(privateMeta),/personal intake metadata/);
console.log('PASS: 1/7/17 scenes; exact source preservation; extra shots can reuse source blocks; missing/omitted/reordered source rejected; URL-only and private intake metadata rejected.');
