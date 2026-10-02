// Luồng màn hình: menu → trận → tạm dừng → kết quả, cùng cài đặt và phím tắt.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { G, keys, newRun, setRun } from '../core/state.js';
import { SAVE, persist } from '../core/save.js';
import { on } from '../core/events.js';
import { useSpecial } from '../game/combat.js';
import { banner } from './banner.js';
import { chooseCard, renderBuild } from './cards.js';

export function startRun() {
  setRun(newRun('play'));
  ['menu', 'resultOv', 'pauseOv', 'cardsOv'].forEach(id => $(id).hidden = true);
  $('hud').hidden = false; $('boss').classList.remove('show');
  $('keyhint').textContent = t(SAVE.control === 'keyboard' ? 'hud.hintKeyboard' : 'hud.hintMouse');
  banner(...t('banner.start'));
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
  // gom mảnh kim loại còn trên màn hình
  for (const q of G.pickups) if (q.kind === 'metal') G.metal += q.v;
  G.pickups = [];
  SAVE.metal += G.metal; SAVE.best = Math.max(SAVE.best, G.wave); persist();
  $('cardsOv').hidden = true; $('pauseOv').hidden = true;
  $('resEyebrow').textContent = t(win ? 'result.eyebrowWin' : 'result.eyebrowLose');
  $('resTitle').textContent = t(win ? 'result.win' : `result.${reason}`);
  $('resLead').textContent = t(win ? 'result.leadWin' : 'result.leadLose');
  $('rWave').textContent = G.wave; $('rKills').textContent = G.kills; $('rLevel').textContent = G.level; $('rMetal').textContent = G.metal;
  renderBuild($('resBuild'));
  setTimeout(() => { $('resultOv').hidden = false; $('againBtn').focus({ preventScroll: true }); }, win ? 200 : 700);
}

export function toMenu() {
  setRun(newRun('menu'));
  ['resultOv', 'pauseOv', 'cardsOv'].forEach(id => $(id).hidden = true);
  $('hud').hidden = true; $('menu').hidden = false; refreshMenu();
}

export function refreshMenu() {
  $('ctlKey').setAttribute('aria-pressed', SAVE.control === 'keyboard');
  $('ctlMouse').setAttribute('aria-pressed', SAVE.control === 'mouse');
  $('mFollow').setAttribute('aria-pressed', SAVE.mouseMode === 'follow');
  $('mHold').setAttribute('aria-pressed', SAVE.mouseMode === 'hold');
  $('mouseRow').hidden = SAVE.control !== 'mouse';
  const rows = SAVE.control === 'keyboard' ? t('keys.keyboard') : t('keys.mouse', SAVE.mouseMode === 'follow');
  const html = rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('');
  $('keysList').innerHTML = html; $('keysList2').innerHTML = html;
  $('totalMetal').textContent = SAVE.metal; $('bestWave').textContent = SAVE.best;
}

export function bindUi() {
  on('runOver', endRun);

  document.querySelectorAll('[data-ctl]').forEach(b => b.addEventListener('click', () => { SAVE.control = b.dataset.ctl; persist(); refreshMenu(); }));
  document.querySelectorAll('[data-mm]').forEach(b => b.addEventListener('click', () => { SAVE.mouseMode = b.dataset.mm; persist(); refreshMenu(); }));
  $('startBtn').addEventListener('click', startRun);
  $('againBtn').addEventListener('click', startRun);
  $('menuBtn').addEventListener('click', toMenu);
  $('resumeBtn').addEventListener('click', resumeGame);
  $('quitBtn').addEventListener('click', () => { if (G) { G.state = 'play'; endRun(false, 'quit'); } });
  $('pauseBtn').addEventListener('click', pauseGame);
  $('spBtn').addEventListener('pointerdown', e => { e.stopPropagation(); useSpecial(); });

  window.addEventListener('keydown', e => {
    if (!G) return;
    if (G.state === 'play' || G.state === 'cards') {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    }
    if (G.state === 'cards') {
      const n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[e.code];
      if (n !== undefined) { chooseCard(n); return; }
    }
    if (e.code === 'Escape' || e.code === 'KeyP') { if (G.state === 'play') pauseGame(); else if (G.state === 'paused') resumeGame(); return; }
    if (e.code === 'Space' && G.state === 'play') { useSpecial(); return; }
    keys.add(e.code);
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); pauseGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
}
