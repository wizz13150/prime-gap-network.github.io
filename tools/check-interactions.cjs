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
const selectors = ['.menu','#navigation','#gap-example','#number-line','#gap-size','#composite-count','#gap-merit','#gap-description','#resource-search','#resource-count','#no-results'];
const dom = Object.fromEntries(selectors.map(s => [s,new Element()]));
dom['#gap-example'].value = '2';
dom['.menu'].setAttribute('aria-expanded','false');
const inventory = JSON.parse(fs.readFileSync(path.join(root,'sources.json'),'utf8'));
const resources = inventory.sources.map(s => { const e=new Element(); e.textContent=[s.title,s.author,s.purpose].join(' '); e.dataset.category=s.category.toLowerCase(); return e; });
const categories = ['all',...new Set(resources.map(e=>e.dataset.category))];
const filters = categories.map(c=>{const e=new Element();e.dataset.filter=c;return e;});
const document = {documentElement:new Element(),querySelector:s=>dom[s]||null,querySelectorAll:s=>s==='[data-filter]'?filters:resources,createElement:()=>new Element()};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/site.js'),'utf8'),{document,Number,Math});
const prime = n => n > 1 && !Array.from({length:n-2},(_,i)=>i+2).some(d=>n%d===0);
for(const [i,[p,q]] of [[23,29],[89,97],[113,127],[139,149]].entries()) {
  dom['#gap-example'].value=String(i); dom['#gap-example'].events.change();
  assert(prime(p) && prime(q));
  for(let n=p+1;n<q;n++) assert(!prime(n));
  assert.equal(Number(dom['#gap-size'].textContent),q-p);
  assert.equal(Number(dom['#composite-count'].textContent),q-p-1);
  assert.equal(dom['#gap-merit'].textContent,((q-p)/Math.log(p)).toFixed(3));
  assert.equal(dom['#number-line'].children.length,q-p+1);
}
filters.find(e=>e.dataset.filter==='videos').events.click();
assert.equal(resources.filter(e=>!e.hidden).length,2);
dom['#resource-search'].value='Maynard';dom['#resource-search'].events.input();
assert.equal(resources.filter(e=>!e.hidden).length,1);
dom['#resource-search'].value='no-such-resource-xyz';dom['#resource-search'].events.input();
assert.equal(resources.filter(e=>!e.hidden).length,0);assert.equal(dom['#no-results'].hidden,false);
dom['#resource-search'].value='';filters[0].events.click();
assert.equal(resources.filter(e=>!e.hidden).length,inventory.sources.length);
dom['.menu'].events.click();assert.equal(dom['.menu'].getAttribute('aria-expanded'),'true');
dom['#navigation'].events.keydown({key:'Escape'});
assert.equal(dom['.menu'].getAttribute('aria-expanded'),'false');assert.equal(dom['.menu'].focused,true);
console.log('PASS: four exact examples; library category + text + empty + reset; menu Escape and focus.');
