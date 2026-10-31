// Dependency-free contract checks for the browser's teaching and filtering tools.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
class Element {
  constructor() { this.attributes = {}; this.events = {}; this.dataset = {}; this.children = []; this.value = ''; this.textContent = ''; this.hidden = false; this.focused = false; this.classes = new Set(); this.classList = { add: x => this.classes.add(x), toggle: (x,on) => on ? this.classes.add(x) : this.classes.delete(x) }; }
  setAttribute(k,v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  addEventListener(k,fn) { this.events[k] = fn; }
  replaceChildren() { this.children = []; }
  append(x) { this.children.push(x); }
  focus() { this.focused = true; }
}
const selectors = ['.menu','#navigation','#gap-example','#number-line','#gap-size','#composite-count','#gap-merit','#gap-description','#resource-search','#resource-count','#no-results','#reset-library','#sieve-board','#sieve-progress','#sieve-status','#sieve-explanation','#challenge-feedback','#reset-sieve','#session-title','#session-description'];
const dom = Object.fromEntries(selectors.map(s => [s,new Element()]));
dom['#gap-example'].value = '2';
dom['.menu'].setAttribute('aria-expanded','false');
const inventory = JSON.parse(fs.readFileSync(path.join(root,'sources.json'),'utf8'));
const resources = inventory.sources.map(s => { const e=new Element(); e.textContent=[s.title,s.author,s.purpose].join(' '); e.dataset.category=s.category.toLowerCase(); return e; });
const categories = ['all',...new Set(resources.map(e=>e.dataset.category))];
const filters = categories.map(c=>{const e=new Element();e.dataset.filter=c;return e;});
const sieveButtons=[2,3,5,7].map(n=>{const e=new Element();e.dataset.sieve=String(n);return e;});
const answers=[6,8,10].map(n=>{const e=new Element();e.dataset.answer=String(n);return e;});
const sessionButtons=Array.from({length:5},(_,i)=>{const e=new Element();e.dataset.session=String(i);return e;});
const scrollTables=[new Element()];scrollTables[0].scrollWidth=390;scrollTables[0].clientWidth=269;scrollTables[0].scrollLeft=0;
const document = {documentElement:new Element(),querySelector:s=>dom[s]||null,querySelectorAll:s=>s==='[data-filter]'?filters:s==='[data-sieve]'?sieveButtons:s==='[data-answer]'?answers:s==='[data-session]'?sessionButtons:s==='.resource'?resources:s==='.table-scroll'?scrollTables:[],createElement:()=>new Element()};
const history={state:null,replaceState(value){this.state=value;}};
const context={document,Number,Math,Set,history,window:{addEventListener(){}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/site.js'),'utf8'),context);
const prime = n => n > 1 && !Array.from({length:n-2},(_,i)=>i+2).some(d=>n%d===0);
for(const [i,[p,q]] of [[23,29],[89,97],[113,127],[139,149],[2,3]].entries()) {
  dom['#gap-example'].value=String(i); dom['#gap-example'].events.change();
  assert(prime(p) && prime(q));
  for(let n=p+1;n<q;n++) assert(!prime(n));
  assert.equal(Number(dom['#gap-size'].textContent),q-p);
  assert.equal(Number(dom['#composite-count'].textContent),q-p-1);
  assert.equal(dom['#gap-merit'].textContent,((q-p)/Math.log(p)).toFixed(3));
  assert.equal(dom['#number-line'].children.length,q-p+1);
}
filters.find(e=>e.dataset.filter==='videos').events.click();assert.equal(history.state.pgnLibraryCategory,'videos');
assert.equal(resources.filter(e=>!e.hidden).length,2);
dom['#resource-search'].value='Maynard';dom['#resource-search'].events.input();
assert.equal(resources.filter(e=>!e.hidden).length,1);
dom['#resource-search'].value='no-such-resource-xyz';dom['#resource-search'].events.input();
assert.equal(resources.filter(e=>!e.hidden).length,0);assert.equal(dom['#no-results'].hidden,false);
dom['#resource-search'].value='';filters[0].events.click();
assert.equal(resources.filter(e=>!e.hidden).length,inventory.sources.length);
dom['#resource-search'].value='x'.repeat(160);dom['#resource-search'].events.input();assert.equal(resources.filter(e=>!e.hidden).length,0);
dom['#reset-library'].events.click();assert.equal(resources.filter(e=>!e.hidden).length,inventory.sources.length);assert.equal(dom['#resource-search'].focused,true);
for(const bad of ['', '-1', '999', 'NaN']){dom['#gap-example'].value=bad;dom['#gap-example'].events.change();assert.equal(dom['#gap-size'].textContent,14);}
for(const mask of Array.from({length:16},(_,i)=>i)){
 dom['#reset-sieve'].events.click();
 sieveButtons.forEach((button,i)=>{if(mask&(1<<i))button.events.click();});
 const active=[2,3,5,7].filter((_,i)=>mask&(1<<i));
 const board=dom['#sieve-board'].children;assert.equal(board.length,48);
 for(const cell of board){const n=Number(cell.textContent);const removed=active.some(p=>n!==p&&n%p===0);assert.equal(cell.className.includes('eliminated'),removed);if(mask===15)assert.equal(!removed,prime(n));}
 assert.equal(answers[0].disabled,mask!==15);
}
answers[1].events.click();assert.match(dom['#challenge-feedback'].textContent,/Try comparing/);
answers[0].events.click();assert.match(dom['#challenge-feedback'].textContent,/Correct/);
assert.equal(dom['#sieve-board'].children.filter(c=>c.className.includes('lab-prime')).length,15);
const exactPrimes=Array.from({length:48},(_,i)=>i+2).filter(prime);assert.equal(Math.max(...exactPrimes.slice(1).map((p,i)=>p-exactPrimes[i])),6);
for(const button of sessionButtons){button.events.click();assert.equal(sessionButtons.filter(b=>b.getAttribute('aria-pressed')==='true').length,1);assert.ok(dom['#session-title'].textContent.length>10);}
dom['#reset-sieve'].events.click();assert.equal(dom['#sieve-progress'].value,0);
dom['.menu'].events.click();assert.equal(dom['.menu'].getAttribute('aria-expanded'),'true');
dom['#navigation'].events.keydown({key:'Escape'});
assert.equal(dom['.menu'].getAttribute('aria-expanded'),'false');assert.equal(dom['.menu'].focused,true);
filters.find(e=>e.dataset.filter==='videos').events.click();dom['#resource-search'].value='Maynard';
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/site.js'),'utf8'),{document,Number,Math,Set,history,window:{addEventListener(){}}});
assert.equal(filters.find(e=>e.dataset.filter==='videos').getAttribute('aria-pressed'),'true');assert.equal(resources.filter(e=>!e.hidden).length,1);
for(const [key,expected] of [['ArrowRight',80],['End',121],['ArrowRight',121],['ArrowLeft',41],['Home',0],['ArrowLeft',0]]){scrollTables[0].events.keydown({key,target:scrollTables[0],preventDefault(){}});assert.equal(scrollTables[0].scrollLeft,expected);}
console.log('PASS: five exact examples + invalid selections; all 16 sieve states; challenge/reset; five session stages; filters/long input/reset/history restoration; menu Escape/focus; table arrow/Home/End keys.');
