// Màn cây nâng cấp ngoài trận.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { SAVE } from '../core/save.js';
import { TABS, NODES, STATS } from '../data/tree.js';
import { level, statSum, statCap, nodeState, nodeCost, canAfford, blockedBy, buyNode, coresSpent, resetCost, resetCores, NODE_BY_ID } from '../game/meta.js';

let tab = TABS[0].id;
const LAYOUT = [['t1'], ['t2'], ['l3', 'r3'], ['l4', 'r4'], ['kl', 'kr'], ['brk']];
const fmt = (stat, v) => t('stat.fmt', v, STATS[stat].fmt);
const statName = s => t(`stat.names.${s}`);

export function resLine() {
  return `<span class="m">${t('res.metal', SAVE.metal)}</span><span class="c">${t('res.cores', SAVE.cores)}</span>`;
}

function nodeDesc(n) {
  if (n.key) return t(`tree.keys.${n.key}`);
  if (n.brk) return t('treeUi.capRaise', statName(n.brk), fmt(n.brk, n.per));
  return t('treeUi.perLevel', statName(n.stat), fmt(n.stat, n.per));
}

function nodeEl(n) {
  const st = nodeState(n), l = level(n.id), el = document.createElement('button');
  el.type = 'button';
  el.className = `node ${st}${n.key ? ' key' : ''}`;
  el.dataset.node = n.id;
  let tag = n.key ? t('treeUi.keystone') : n.brk ? t('treeUi.breakthrough') : '';
  let status = t('treeUi.level', l, n.max), cost = '';
  if (st === 'maxed' || st === 'capped') status = t('treeUi.maxed');
  else if (st === 'locked') status = t('treeUi.locked');
  else if (st === 'blocked') status = t('treeUi.blocked', t(`tree.names.${blockedBy(n).id}`));
  else {
    const c = nodeCost(n);
    cost = `<span class="cost${c.cur === 'core' ? ' core' : ''}${canAfford(c) ? '' : ' no'}">${t(c.cur === 'core' ? 'treeUi.costCore' : 'treeUi.costMetal', c.amount)}</span>`;
  }
  const s = n.stat || n.brk;
  const total = s ? `<span class="d">${t('treeUi.total', fmt(s, statSum(s)), fmt(s, statCap(s)))}</span>` : '';
  el.innerHTML = `${tag ? `<span class="tag">${tag}</span>` : ''}<b>${t(`tree.names.${n.id}`)}</b><span class="d">${nodeDesc(n)}</span>${total}<span class="row"><span class="lv">${status}</span>${cost}</span>`;
  el.disabled = st !== 'open';
  return el;
}

function renderBranch(b) {
  const col = document.createElement('div'); col.className = 'branch';
  col.innerHTML = `<h3>${t(`treeUi.branches.${b}`)}</h3>`;
  const grid = document.createElement('div'); grid.className = 'grid';
  for (const row of LAYOUT) for (const slot of row) {
    const n = NODES.find(o => o.b === b && o.slot === slot);
    if (!n) continue;
    const el = nodeEl(n);
    if (row.length === 1) el.classList.add('full');
    grid.appendChild(el);
  }
  col.appendChild(grid);
  return col;
}

export function renderTree() {
  $('treeRes').innerHTML = resLine();
  const tabs = $('treeTabs'); tabs.innerHTML = '';
  for (const tb of TABS) {
    const b = document.createElement('button');
    b.type = 'button'; b.role = 'tab'; b.textContent = t(`treeUi.tabs.${tb.id}`);
    b.setAttribute('aria-selected', tb.id === tab);
    b.addEventListener('click', () => { tab = tb.id; renderTree(); });
    tabs.appendChild(b);
  }
  const def = TABS.find(x => x.id === tab), body = $('treeBody');
  body.innerHTML = '';
  body.style.setProperty('--cols', Math.max(def.branches.length, 1));
  for (const b of def.branches) body.appendChild(renderBranch(b));
  // Nút giao có ít nhất một nhánh trong tab này.
  const cross = NODES.filter(n => n.b === 'cross' && n.req.some(id => def.branches.includes(NODE_BY_ID[id].b)));
  if (cross.length) {
    const sec = document.createElement('div'); sec.className = 'cross';
    sec.innerHTML = `<h3 class="label">${t('treeUi.branches.cross')}</h3>`;
    const grid = document.createElement('div'); grid.className = 'grid';
    for (const n of cross) {
      const el = nodeEl(n), [a, c] = n.req.map(id => t(`treeUi.branches.${NODE_BY_ID[id].b}`));
      el.querySelector('.tag')?.remove();
      el.insertAdjacentHTML('afterbegin', `<span class="tag">${t('treeUi.crossOf', a, c)}</span>`);
      grid.appendChild(el);
    }
    sec.appendChild(grid); body.appendChild(sec);
  }
  const rb = $('resetBtn'), spent = coresSpent();
  rb.textContent = t('treeUi.reset', resetCost());
  rb.disabled = !spent || SAVE.metal < resetCost();
  rb.title = spent ? '' : t('treeUi.resetNone');
}

export function bindTree() {
  $('treeBody').addEventListener('click', e => {
    const el = e.target.closest('[data-node]');
    if (!el || el.disabled) return;
    const id = el.dataset.node;
    if (buyNode(id)) {
      renderTree();
      document.querySelector(`[data-node="${id}"]`)?.focus({ preventScroll: true });
    }
  });
  $('resetBtn').addEventListener('click', () => {
    const n = coresSpent();
    if (!n || !confirm(t('treeUi.resetConfirm', n))) return;
    if (resetCores()) renderTree();
  });
}
