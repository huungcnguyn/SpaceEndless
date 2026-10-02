// Tạo và điều phối đợt địch theo cấu hình màn (src/data/stages.js).
import { W, H, CX, CY, TAU } from '../config.js';
import { rand, pick } from '../util.js';
import { t } from '../lang/index.js';
import { G } from '../core/state.js';
import { STAGES, GROUPS, WAVE, ENDLESS } from '../data/stages.js';
import { STATION } from '../data/player.js';
import { spawnEnemy } from './enemies.js';
import { spawnBoss } from './bosses.js';
import { banner } from '../ui/banner.js';

export const stageDef = () => STAGES[G.stage];
export const isEndless = () => G.mode === 'endless';

// Boss của đợt w (hoặc null). Endless: boss mỗi `bossEvery` đợt, xoay vòng.
export function bossFor(w) {
  if (!isEndless()) return stageDef().bosses[w] || null;
  if (w % ENDLESS.bossEvery) return null;
  const c = ENDLESS.bossCycle;
  return c[(w / ENDLESS.bossEvery - 1) % c.length];
}
const isMainBoss = w => !isEndless() && w === stageDef().waves;

// Điểm trên rìa ngoài màn hình theo góc a nhìn từ tâm.
export function edgePoint(a, m = 34) {
  const dx = Math.cos(a), dy = Math.sin(a);
  const tx = dx ? ((dx > 0 ? W + m - CX : -m - CX) / dx) : Infinity;
  const ty = dy ? ((dy > 0 ? H + m - CY : -m - CY) / dy) : Infinity;
  const tt = Math.min(tx, ty);
  return { x: CX + dx * tt, y: CY + dy * tt };
}

export function buildWave(w) {
  const sd = stageDef(), boss = bossFor(w);
  let budget = Math.round((WAVE.budgetBase + w * WAVE.budgetPerWave) * (boss ? WAVE.bossBudgetMul : 1));
  const types = Object.keys(sd.unlock).filter(g => w >= sd.unlock[g]);
  const wt = sd.weight, cost = sd.cost;
  const pattern = w < WAVE.spreadUntil ? 'spread' : pick(WAVE.patterns);
  const dur = boss ? WAVE.bossDur : WAVE.dur + w * WAVE.durPerWave;
  const baseA = rand(0, TAU);
  const groups = [];
  while (budget > 0) {
    const ok = types.filter(g => cost[g] <= budget);
    if (!ok.length) break;
    let tot = ok.reduce((s, g) => s + wt[g], 0), x = Math.random() * tot, choice = ok[0];
    for (const g of ok) { x -= wt[g]; if (x <= 0) { choice = g; break; } }
    budget -= cost[choice]; groups.push(choice);
  }
  const q = [];
  groups.forEach((g, k) => {
    const tm = (boss ? WAVE.bossDelay : 0) + (k / Math.max(1, groups.length)) * dur + rand(0, WAVE.jitter);
    const a = pattern === 'side' ? baseA + rand(-.45, .45) : pattern === 'surround' ? baseA + (k % 4) * Math.PI / 2 + rand(-.2, .2) : rand(0, TAU);
    const gd = GROUPS[g];
    if (gd.n > 1) for (let i = 0; i < gd.n; i++) q.push({ type: gd.type, t: tm + i * gd.gap, a: a + rand(-gd.spread, gd.spread) });
    else q.push({ type: gd.type, t: tm, a });
  });
  if (boss) {
    const hpMul = isEndless() ? Math.pow(ENDLESS.bossHpGrowth, Math.max(0, w - sd.waves)) : 1;
    q.push({ type: 'boss', t: WAVE.bossSpawnAt, a: rand(0, TAU), boss, main: isMainBoss(w), hpMul });
  }
  return q.sort((a, b) => a.t - b.t);
}

export function startWave() {
  G.wave++; G.queue = buildWave(G.wave); G.waveT = 0; G.waveState = 'active';
  const sd = stageDef(), b = bossFor(G.wave), intro = sd.intro[G.wave];
  if (b) banner(t('banner.bossWarn'), t(`bosses.${b}.name`), true);
  else if (intro) { const [name, desc] = t(`intro.${intro}`); banner(t('banner.wave', G.wave), t('banner.newEnemy', name, desc)); }
  else banner(t('banner.wave', G.wave), '');
}

export function waveClear() {
  G.waveState = 'inter'; G.interT = WAVE.interAfter;
  G.pickups.forEach(p => p.pull = true);
  G.st.hp = Math.min(G.st.max, G.st.hp + G.st.max * (STATION.waveHeal + G.meta.stats.waveHeal));
  G.metal += Math.round(G.meta.stats.waveMetal);
  const reward = isEndless() && ENDLESS.milestones[G.wave];
  if (reward) { G.metal += reward; G.milestone = G.wave; banner(t('banner.milestone', G.wave), t('banner.milestoneSub', reward)); }
  else banner(t('banner.waveClear', G.wave), t('banner.waveClearSub'));
}

export function spawnEntry(q) {
  const pt = edgePoint(q.a);
  if (q.type === 'boss') return spawnBoss(q.boss, pt, { main: q.main, hpMul: q.hpMul });
  spawnEnemy(q.type, pt.x + rand(-10, 10), pt.y + rand(-10, 10));
}

export function updateWaves(dt) {
  if (G.waveState === 'inter') { if ((G.interT -= dt) <= 0) startWave(); }
  else {
    G.waveT += dt;
    while (G.queue.length && G.queue[0].t <= G.waveT) spawnEntry(G.queue.shift());
    if (!G.queue.length && !G.enemies.length) waveClear();
  }
}
