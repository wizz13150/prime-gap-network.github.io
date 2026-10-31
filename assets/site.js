'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('open', open);
}
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('keydown', event => {
  if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
nav?.addEventListener('click', event => {
  if(event.target.closest('a')) setMenu(false);
});

// Exact trial division for these deliberately small teaching examples only.
const isPrime = n => {
  if (!Number.isSafeInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const examples = [[23,29],[89,97],[113,127],[139,149],[2,3]];
const select = document.querySelector('#gap-example');
function showGap() {
  const index = select.value !== "" ? Number(select.value) : -1;
  const safeIndex = Number.isInteger(index) && index >= 0 && index < examples.length ? index : 2;
  select.value = String(safeIndex);
  const [p,q] = examples[safeIndex];
  const line = document.querySelector('#number-line');
  line.replaceChildren();
  for(let n=p;n<=q;n++) {
    const cell = document.createElement('span');
    cell.className = `integer${isPrime(n) ? ' prime' : ''}`;
    cell.textContent = n;
    cell.setAttribute('aria-label', `${n}, ${isPrime(n) ? 'prime' : 'composite'}`);
    line.append(cell);
  }
  document.querySelector('#gap-size').textContent = q-p;
  document.querySelector('#composite-count').textContent = q-p-1;
  document.querySelector('#gap-merit').textContent = ((q-p)/Math.log(p)).toFixed(3);
  document.querySelector('#gap-description').textContent = q-p === 1 ? `Between ${p} and ${q} there are no interior integers. The gap is 1, the only odd gap between consecutive primes.` : `Between ${p} and ${q}, all ${q-p-1} interior integers are composite. The gap is ${q-p}, including the final step to ${q}.`;
}
if(select){select.disabled=false;select.addEventListener('change',showGap);showGap();}

const search = document.querySelector('#resource-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const resources = [...document.querySelectorAll('.resource')];
let category = filters.some(b=>b.dataset.filter===history.state?.pgnLibraryCategory) ? history.state.pgnLibraryCategory : 'all';
function rememberCategory(){
  const base=history.state && typeof history.state==='object' ? history.state : {};
  history.replaceState({...base,pgnLibraryCategory:category},'');
}
function filterResources() {
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  resources.forEach(item => {
    item.hidden = !(category === 'all' || item.dataset.category === category) || !item.textContent.toLowerCase().includes(query);
    if(!item.hidden)visible++;
  });
  document.querySelector('#resource-count').textContent = `${visible} resource${visible===1?'':'s'}`;
  document.querySelector('#no-results').hidden = visible > 0;
}
if(search){
  search.disabled=false;
  filters.forEach(button => button.disabled=false);
  const reset = document.querySelector('#reset-library');
  if(reset){reset.disabled=false;reset.addEventListener('click',()=>{
    search.value='';category='all';rememberCategory();
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter==='all')));
    filterResources();search.focus();
  });}
  window.addEventListener('pageshow',filterResources);
  search.addEventListener('input',filterResources);
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;rememberCategory();
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    filterResources();
  }));
  filterResources();
}

// Exact sieve game: the board is small enough to verify every integer.
const passButtons = [...document.querySelectorAll('[data-sieve]')];
const answerButtons = [...document.querySelectorAll('[data-answer]')];
const sieveBoard = document.querySelector('#sieve-board');
const selectedPasses = new Set();
function renderSieve(){
  const complete = selectedPasses.size === 4;
  const passes = [...selectedPasses].sort((a,b)=>a-b);
  let removed = 0;
  sieveBoard.replaceChildren();
  for(let n=2;n<=49;n++){
    const factor = passes.find(p=>n!==p && n%p===0);
    const cell=document.createElement('span');
    cell.className='sieve-cell'+(factor?' eliminated':complete?' lab-prime':'');
    cell.textContent=n;
    cell.setAttribute('aria-label',factor ? n+', composite, crossed out by '+factor : n+(complete?', prime':', candidate'));
    cell.title=factor ? n+' is divisible by '+factor : complete ? n+' is prime' : n+' is still a candidate';
    sieveBoard.append(cell);
    if(factor)removed++;
  }
  passButtons.forEach(b=>b.setAttribute('aria-pressed',String(selectedPasses.has(Number(b.dataset.sieve)))));
  const progress=document.querySelector('#sieve-progress');progress.value=selectedPasses.size;progress.textContent=selectedPasses.size+' of 4';
  document.querySelector('#sieve-status').textContent=removed+' composites eliminated · '+(48-removed)+(complete?' primes remain.':' candidates remain.');
  document.querySelector('#sieve-explanation').textContent=complete?'Board cleared: every composite here has a prime factor at most √49 = 7. All 15 survivors are prime. In a large partial sieve, survivors still need primality checks.':'A surviving candidate is not always prime: 49 survives the passes by 2, 3, and 5. What happens when you use 7?';
  answerButtons.forEach(b=>{b.disabled=!complete;b.setAttribute('aria-pressed','false');});
  document.querySelector('#challenge-feedback').textContent=complete?'Compare consecutive surviving primes, then choose a gap.':'Finish the sieve to unlock the challenge.';
}
if(sieveBoard){
  passButtons.forEach(b=>{b.disabled=false;b.addEventListener('click',()=>{const p=Number(b.dataset.sieve);if(selectedPasses.has(p))selectedPasses.delete(p);else selectedPasses.add(p);renderSieve();});});
  const reset=document.querySelector('#reset-sieve');reset.disabled=false;reset.addEventListener('click',()=>{selectedPasses.clear();renderSieve();});
  answerButtons.forEach(b=>b.addEventListener('click',()=>{
    if(selectedPasses.size!==4)return;
    answerButtons.forEach(a=>a.setAttribute('aria-pressed',String(a===b)));
    document.querySelector('#challenge-feedback').textContent=Number(b.dataset.answer)===6?'Correct: 23 → 29 and 31 → 37 both have gap 6. This is a teaching example, not a new record or a network reward.':'Try comparing 23 → 29 and 31 → 37. A gap is the endpoint difference, not the number of crossed-out integers.';
  }));
  renderSieve();
}

// A state explanation, deliberately not a fake miner or progress counter.
const sessionButtons=[...document.querySelectorAll('[data-session]')];
const sessionSteps=[
  ['Choose an available GPU and a supported interval.','Use the official NVIDIA CUDA package and its documented range limits. A local range is your standalone search job; it is not a PGN network ticket.'],
  ['Search the interval; keep its policy attached.','Scout runs its CUDA search pipeline under the chosen minimum-gap policy. A speed observation depends on the GPU, clocks, interval and policy. It is not a record count or PGN network measurement.'],
  ['Request Pause, then wait for acknowledgement.','Pausing and paused are different states. The checkpoint must be acknowledged before you treat the session as safely suspended. Keep the application, worker metadata and session files together.'],
  ['Resume compatible saved work.','The published workflow discovers saved sessions and can resume compatible interrupted ranges. Check the restored interval and pinned policy. A partial range is still partial; resuming does not fill missing work retroactively.'],
  ['Read the report with its evidence.','Keep exact endpoints, interval, threshold, software version and verification method. Compare possible records with maintained tables. Standalone Scout does not automatically submit the report or turn it into accepted PGN work.']
];
sessionButtons.forEach(b=>{b.disabled=false;b.addEventListener('click',()=>{const i=Number(b.dataset.session);if(!sessionSteps[i])return;sessionButtons.forEach(a=>a.setAttribute('aria-pressed',String(a===b)));document.querySelector('#session-title').textContent=sessionSteps[i][0];document.querySelector('#session-description').textContent=sessionSteps[i][1];});});

const literaryNote=document.querySelector('.literary-egg');
literaryNote?.addEventListener('keydown',event=>{if(event.key==='Escape'&&literaryNote.open){literaryNote.open=false;literaryNote.querySelector('summary').focus();}});

// Make horizontal data tables predictably operable from their focus stop.
document.querySelectorAll('.table-scroll').forEach(table=>table.addEventListener('keydown',event=>{
  if(event.target!==table)return;
  const max=Math.max(0,table.scrollWidth-table.clientWidth);
  const positions={ArrowLeft:Math.max(0,table.scrollLeft-80),ArrowRight:Math.min(max,table.scrollLeft+80),Home:0,End:max};
  if(Object.prototype.hasOwnProperty.call(positions,event.key)){event.preventDefault();table.scrollLeft=positions[event.key];}
}));
