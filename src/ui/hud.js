// HUD trong trận. Chỉ ghi vào DOM khi giá trị đổi.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { G, dmgMult } from '../core/state.js';
import { on } from '../core/events.js';
import { STAGES } from '../data/stages.js';

const cache = {};
function setT(id, v) { if (cache[id] !== v) { cache[id] = v; $(id).textContent = v; } }
function setH(id, v) { if (cache[id] !== v) { cache[id] = v; $(id).innerHTML = v; } }

export function hud() {
  if (!G || G.state === 'menu') return;
  const p = G.p, st = G.st;
  let pips = ''; for (let i = 0; i < p.maxLives; i++) if (i < p.lives) pips += '<span class="pip"></span>'; else if (i < Math.max(p.lives, 2)) pips += '<span class="pip off"></span>';
  setH('lives', pips);
  const sh = $('shield'); sh.classList.toggle('none', !p.shield); sh.classList.toggle('on', p.shieldUp);
  const f = st.hp / st.max; $('stFill').style.width = (f * 100).toFixed(1) + '%'; $('stBar').classList.toggle('low', f < .3);
  setH('waveText', t('hud.wave', Math.max(1, G.wave), G.mode === 'endless' ? 0 : STAGES[G.stage].waves));
  setT('levelText', t('hud.level', G.level));
  $('xpFill').style.width = (G.xp / G.xpNeed * 100).toFixed(1) + '%';
  setT('metalText', t('hud.metal', G.metal, G.cores));
  setH('dmgText', t('hud.dmg', Math.round((dmgMult() - 1) * 100)));
  const sp = Math.round(G.sp.energy / G.sp.cost * 100);
  const btn = $('spBtn'); btn.style.setProperty('--p', sp); btn.classList.toggle('ready', sp >= 100);
  const bb = $('boss');
  if (G.boss) { bb.classList.add('show'); $('bossFill').style.width = Math.max(0, G.boss.hp / G.boss.max * 100).toFixed(1) + '%'; }
  else bb.classList.remove('show');
}

// Thanh máu boss: vạch đánh dấu ngưỡng chuyển pha.
on('bossSpawn', (e, def) => {
  $('bossName').textContent = e.name;
  $('bossBar').querySelectorAll('.mark').forEach(m => m.remove());
  for (const ph of def.phases) if (ph.at) {
    const m = document.createElement('span'); m.className = 'mark'; m.style.left = Math.round(ph.at * 100) + '%'; $('bossBar').appendChild(m);
  }
});

on('special', id => {
  if (id !== 'bomb') return;
  const f = $('flash'); f.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));
});
