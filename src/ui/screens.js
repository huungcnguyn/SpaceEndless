// Các màn hình ngoài trận: chính, căn cứ, chọn màn, chuẩn bị, special, hồ sơ.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { SAVE, persist, exportCode, importCode } from '../core/save.js';
import { STAGES, STAGE_LIST, ENDLESS } from '../data/stages.js';
import { SPECIALS, SPECIAL_ORDER } from '../data/specials.js';
import { STATS } from '../data/tree.js';
import { BOSSES } from '../data/bosses.js';
import { specialUnlocked, currentSpecial, computeMeta, coresSpent } from '../game/meta.js';
import { renderTree, bindTree, resLine } from './tree.js';
import { startRun } from './flow.js';

const SCREENS = ['menu', 'baseOv', 'stagesOv', 'prepOv', 'specialsOv', 'treeOv', 'profileOv', 'resultOv', 'pauseOv', 'cardsOv'];
const RENDER = { menu: renderMenu, baseOv: renderBase, stagesOv: renderStages, prepOv: renderPrep, specialsOv: renderSpecials, treeOv: renderTree, profileOv: renderProfile };

// Lựa chọn hiện tại cho trận sắp chơi.
export const sel = { mode: 'stage', stage: 1 };
let specialsBack = 'baseOv';

export function show(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
  RENDER[id]?.();
  setTimeout(() => { const b = $(id).querySelector('button:not(:disabled)'); if (b) b.focus({ preventScroll: true }); }, 20);
}
export const hideAll = () => SCREENS.forEach(s => $(s).hidden = true);

export function renderMenu() {
  $('ctlKey').setAttribute('aria-pressed', SAVE.control === 'keyboard');
  $('ctlMouse').setAttribute('aria-pressed', SAVE.control === 'mouse');
  $('mFollow').setAttribute('aria-pressed', SAVE.mouseMode === 'follow');
  $('mHold').setAttribute('aria-pressed', SAVE.mouseMode === 'hold');
  $('mouseRow').hidden = SAVE.control !== 'mouse';
  const rows = SAVE.control === 'keyboard' ? t('keys.keyboard') : t('keys.mouse', SAVE.mouseMode === 'follow');
  const html = rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('');
  $('keysList').innerHTML = html; $('keysList2').innerHTML = html;
  $('totalMetal').textContent = SAVE.metal; $('totalCores').textContent = SAVE.cores;
}

function renderBase() {
  $('baseRes').innerHTML = resLine();
  $('baseSpecial').textContent = t('base.specialSub', t(`specials.${currentSpecial()}.name`));
}

const stageUnlocked = n => n === 1 || !!SAVE.stages[n - 1]?.cleared;
const endlessUnlocked = () => !!SAVE.stages[ENDLESS.unlockStage]?.cleared;

function pickEl(html, opts = {}) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'pick' + (opts.cls ? ' ' + opts.cls : '');
  b.innerHTML = html; b.disabled = !!opts.disabled;
  if (opts.onClick) b.addEventListener('click', opts.onClick);
  return b;
}

function renderStages() {
  const box = $('stageList'); box.innerHTML = '';
  for (const n of STAGE_LIST) {
    const def = STAGES[n], s = SAVE.stages[n], open = def && stageUnlocked(n);
    let st;
    if (!def) st = `<span class="st lock">${t('stages.soon')}</span>`;
    else if (!open) st = `<span class="st lock">${t('stages.locked', n - 1)}</span>`;
    else if (s?.cleared) st = `<span class="st">${t('stages.cleared')} · ${t('stages.best', s.best, def.waves)}</span>`;
    else st = `<span class="st">${s?.best ? t('stages.best', s.best, def.waves) : t('stages.fresh')}</span>`;
    box.appendChild(pickEl(`<span class="k">${t('stages.label', n)}</span><b>${t(`stages.names.${n}`)}</b>${st}`,
      { disabled: !open, onClick: () => { sel.mode = 'stage'; sel.stage = n; show('prepOv'); } }));
  }
  const eo = endlessUnlocked();
  box.appendChild(pickEl(`<span class="k">${t('stages.endless')}</span><b>${t('stages.endless')}</b><p>${t('stages.endlessDesc')}</p>` +
    `<span class="st${eo ? '' : ' lock'}">${eo ? t('stages.endlessBest', SAVE.endlessBest) : t('stages.locked', ENDLESS.unlockStage)}</span>`,
    { cls: 'endless', disabled: !eo, onClick: () => { sel.mode = 'endless'; sel.stage = ENDLESS.baseStage; show('prepOv'); } }));
}

function renderPrep() {
  $('prepTitle').textContent = sel.mode === 'endless' ? t('prep.endless') : t('prep.stage', sel.stage, t(`stages.names.${sel.stage}`));
  const sp = currentSpecial();
  $('prepSpName').textContent = t(`specials.${sp}.name`);
  $('prepSpDesc').textContent = t(`specials.${sp}.d`, SPECIALS[sp]);
  const m = computeMeta(), ul = $('prepBonuses');
  const rows = Object.keys(STATS).filter(k => m.stats[k] > 0)
    .map(k => `<li>${t(`stat.names.${k}`)}: <b>+${t('stat.fmt', m.stats[k], STATS[k].fmt)}</b></li>`);
  for (const k of m.keys) rows.push(`<li class="key"><b>${t(`tree.keys.${k}`)}</b></li>`);
  ul.innerHTML = rows.join('') || `<li>${t('prep.none')}</li>`;
}

function renderSpecials() {
  const box = $('specialList'); box.innerHTML = '';
  const cur = currentSpecial();
  for (const id of SPECIAL_ORDER) {
    const d = SPECIALS[id], open = specialUnlocked(id), u = d.unlock;
    const st = id === cur ? t('specialsUi.using') : open ? t('specialsUi.cost', d.cost)
      : u.stage ? t('specialsUi.unlockStage', u.stage) : t('specialsUi.unlockKills', u.kills, SAVE.totalKills);
    box.appendChild(pickEl(`<b>${t(`specials.${id}.name`)}</b><p>${t(`specials.${id}.d`, d)}</p><span class="st${open ? '' : ' lock'}">${st}</span>`,
      { cls: id === cur ? 'on' : '', disabled: !open, onClick: () => { SAVE.special = id; persist(); renderSpecials(); } }));
  }
}

function renderProfile() {
  const best = Math.max(0, ...Object.values(SAVE.stages).map(s => s.best || 0));
  const items = [['runs', SAVE.runs], ['wins', SAVE.wins], ['kills', SAVE.totalKills], ['best', best],
    ['endless', SAVE.endlessBest], ['cores', SAVE.cores], ['spent', coresSpent()], ['metal', SAVE.metal]];
  $('profileStats').innerHTML = items.map(([k, v]) => `<div class="stat${k === 'metal' ? ' metal' : k === 'cores' ? ' core' : ''}"><span class="label">${t(`profile.${k}`)}</span><b>${v}</b></div>`).join('');
  const bosses = Object.keys(BOSSES).filter(k => SAVE.bossKills[k]);
  $('profileBosses').innerHTML = bosses.length
    ? bosses.map(k => `<span class="chip">${t('profile.bossCount', t(`bosses.${k}.name`), SAVE.bossKills[k])}</span>`).join('')
    : `<span class="chip">${t('profile.bossNone')}</span>`;
  $('saveCode').value = exportCode();
  note('');
}

function note(text, bad) { const n = $('codeNote'); n.textContent = text; n.classList.toggle('bad', !!bad); }

async function copyCode() {
  const ta = $('saveCode'); ta.value = exportCode();
  try { await navigator.clipboard.writeText(ta.value); }
  catch (e) { ta.select(); document.execCommand('copy'); }
  note(t('profile.copied'));
}

function doImport() {
  const code = $('saveCode').value;
  if (!code.trim() || code.trim() === exportCode()) return;
  if (!confirm(t('profile.importConfirm'))) return;
  try { importCode(code); renderProfile(); note(t('profile.importOk')); }
  catch (e) { note(t('profile.importBad'), true); }
}

export function bindScreens() {
  document.querySelectorAll('[data-ctl]').forEach(b => b.addEventListener('click', () => { SAVE.control = b.dataset.ctl; persist(); renderMenu(); }));
  document.querySelectorAll('[data-mm]').forEach(b => b.addEventListener('click', () => { SAVE.mouseMode = b.dataset.mm; persist(); renderMenu(); }));
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => show(b.dataset.back)));
  $('startBtn').addEventListener('click', () => show('baseOv'));
  $('baseBack').addEventListener('click', () => show('menu'));
  $('toStages').addEventListener('click', () => show('stagesOv'));
  $('toTree').addEventListener('click', () => show('treeOv'));
  $('toSpecials').addEventListener('click', () => { specialsBack = 'baseOv'; show('specialsOv'); });
  $('toProfile').addEventListener('click', () => show('profileOv'));
  $('prepChangeSp').addEventListener('click', () => { specialsBack = 'prepOv'; show('specialsOv'); });
  $('specialsBack').addEventListener('click', () => show(specialsBack));
  $('goBtn').addEventListener('click', () => startRun());
  $('copyCode').addEventListener('click', copyCode);
  $('importCode').addEventListener('click', doImport);
  bindTree();
}
