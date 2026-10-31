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
const examples = [[23,29],[89,97],[113,127],[139,149]];
const select = document.querySelector('#gap-example');
function showGap() {
  const [p,q] = examples[Number(select.value)];
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
  document.querySelector('#gap-description').textContent = `Between ${p} and ${q}, all ${q-p-1} interior integers are composite. The gap is ${q-p}, including the final step to ${q}.`;
}
if(select){select.addEventListener('change',showGap);showGap();}

const search = document.querySelector('#resource-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const resources = [...document.querySelectorAll('.resource')];
let category = 'all';
function filterResources() {
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
  search.addEventListener('input',filterResources);
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    filterResources();
  }));
  filterResources();
}
