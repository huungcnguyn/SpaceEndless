// Vòng đời một trận: bắt đầu → tạm dừng → kết quả, cùng phím tắt trong trận.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { G, keys, newRun, setRun } from '../core/state.js';
import { SAVE, persist, stageSave } from '../core/save.js';
import { on } from '../core/events.js';
import { SPECIAL_ORDER } from '../data/specials.js';
import { ENDLESS } from '../data/stages.js';
import { applyMeta, currentSpecial, specialUnlocked } from '../game/meta.js';
import { useSpecial } from '../game/specials.js';
import { banner } from './banner.js';
import { chooseCard, rerollCards, renderBuild, maybeOpenCards } from './cards.js';
import { show, hideAll, sel, bindScreens, renderMenu } from './screens.js';

export function startRun() {
  setRun(newRun('play', { mode: sel.mode, stage: sel.stage, special: currentSpecial() }));
  applyMeta(G);
  hideAll();
  $('hud').hidden = false; $('boss').classList.remove('show');
  $('spLabel').innerHTML = t(`specials.${G.special}.short`);
  $('keyhint').textContent = t(SAVE.control === 'keyboard' ? 'hud.hintKeyboard' : 'hud.hintMouse');
  banner(...t('banner.start'));
  maybeOpenCards(); // thẻ chọn ngay đầu trận (nút "Khởi động")
}

export function pauseGame() {
  if (!G || G.state !== 'play') return;
  G.state = 'paused'; renderBuild($('pauseBuild')); $('pauseOv').hidden = false;
  setTimeout(() => $('resumeBtn').focus({ preventScroll: true }), 20);
}

export function resumeGame() { if (G && G.state === 'paused') { G.state = 'play'; $('pauseOv').hidden = true; keys.clear(); } }

export function endRun(win, reason) {
  if (!G || G.state === 'over') return;
  G.state = 'over';
  const before = SPECIAL_ORDER.filter(specialUnlocked), endlessBefore = !!SAVE.stages[ENDLESS.unlockStage]?.cleared;
  // gom mảnh kim loại còn trên màn hình
  for (const q of G.pickups) if (q.kind === 'metal') G.metal += q.v;
  G.pickups = [];
  const bonus = Math.round(G.metal * G.meta.stats.metalGain), total = G.metal + bonus;
  SAVE.metal += total;
  SAVE.best = Math.max(SAVE.best, G.wave);
  SAVE.totalKills += G.kills; SAVE.runs++;
  const endless = G.mode === 'endless';
  if (endless) SAVE.endlessBest = Math.max(SAVE.endlessBest, G.wave);
  else {
    const s = stageSave(G.stage);
    s.best = Math.max(s.best, G.wave);
    if (win) { s.cleared = true; SAVE.wins++; }
  }
  persist();
  const unlocked = SPECIAL_ORDER.filter(id => specialUnlocked(id) && !before.includes(id)).map(id => t(`specials.${id}.name`));
  if (!endlessBefore && SAVE.stages[ENDLESS.unlockStage]?.cleared) unlocked.push(t('stages.endless'));

  $('cardsOv').hidden = true; $('pauseOv').hidden = true;
  const stName = t(`stages.names.${G.stage}`);
  $('resEyebrow').textContent = endless ? t('stages.endless') : win ? t('result.eyebrowWin', G.stage, stName) : t('result.eyebrowLose');
  $('resTitle').textContent = endless ? (reason === 'quit' ? t('result.quit') : t('result.endless')) : win ? t('result.win', G.stage) : t(`result.${reason}`);
  let lead = endless ? t('result.leadEndless', G.wave) : t(win ? 'result.leadWin' : 'result.leadLose');
  if (bonus) lead += ' ' + t('result.bonus', bonus);
  if (unlocked.length) lead += ' ' + t('result.unlocked', unlocked.join(', '));
  $('resLead').textContent = lead;
  $('rWave').textContent = G.wave; $('rKills').textContent = G.kills; $('rCores').textContent = G.cores; $('rMetal').textContent = total;
  renderBuild($('resBuild'));
  setTimeout(() => { $('resultOv').hidden = false; $('againBtn').focus({ preventScroll: true }); }, win ? 200 : 700);
}

export function toBase() {
  setRun(newRun('menu'));
  $('hud').hidden = true;
  show('baseOv');
}

export function bindUi() {
  on('runOver', endRun);
  bindScreens();
  $('againBtn').addEventListener('click', startRun);
  $('menuBtn').addEventListener('click', toBase);
  $('resumeBtn').addEventListener('click', resumeGame);
  $('quitBtn').addEventListener('click', () => { if (G) { G.state = 'play'; endRun(false, 'quit'); } });
  $('pauseBtn').addEventListener('click', pauseGame);
  $('spBtn').addEventListener('pointerdown', e => { e.stopPropagation(); useSpecial(); });
  $('rerollBtn').addEventListener('click', rerollCards);

  window.addEventListener('keydown', e => {
    if (!G) return;
    if (G.state === 'play' || G.state === 'cards') {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    }
    if (G.state === 'cards') {
      const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3 }[e.code];
      if (n !== undefined) { chooseCard(n); return; }
      if (e.code === 'KeyR') { rerollCards(); return; }
    }
    if (e.code === 'Escape' || e.code === 'KeyP') { if (G.state === 'play') pauseGame(); else if (G.state === 'paused') resumeGame(); return; }
    if (e.code === 'Space' && G.state === 'play') { useSpecial(); return; }
    keys.add(e.code);
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); pauseGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
}

export { renderMenu as refreshMenu };
