// Boss: sinh, chuyển pha và các hành vi ghép thành từng pha (cấu hình trong src/data/bosses.js).
import { CX, CY, ST_R, TAU } from '../config.js';
import { rand } from '../util.js';
import { t } from '../lang/index.js';
import { G, nextId, xpScale, dmgScale } from '../core/state.js';
import { emit } from '../core/events.js';
import { BOSSES, BOSS_RULES } from '../data/bosses.js';
import { spawnEnemy } from './enemies.js';
import { hitShip, stationHit } from './combat.js';
import { ring, shake } from './fx.js';
import { banner } from '../ui/banner.js';

export function spawnBoss(kind, pt) {
  const def = BOSSES[kind];
  const e = { id: nextId(), isBoss: true, kind, name: t(`bosses.${kind}.name`), x: pt.x, y: pt.y, kx: 0, ky: 0, r: def.r,
    hp: def.hp, max: def.hp, xp: def.xp * xpScale(), metal: 1, color: def.color, flash: 0, inv: 0, t: 0, phase: 1,
    dir: Math.random() < .5 ? 1 : -1, tele: 0, teleMax: 1, rot: 0, bs: [] };
  initPhase(e);
  G.enemies.push(e); G.boss = e;
  emit('bossSpawn', e, def);
  return e;
}

const phaseDef = e => BOSSES[e.kind].phases[e.phase - 1];

// Mỗi hành vi có một ô trạng thái riêng (bộ đếm thời gian...), làm mới khi đổi pha.
function initPhase(e) { e.bs = phaseDef(e).behaviors.map(([, p]) => ({ t: p.first || 0 })); }

export function checkBossPhase(e) {
  const next = BOSSES[e.kind].phases[e.phase];
  if (next && e.hp / e.max <= next.at) setPhase(e, e.phase + 1);
}

function setPhase(e, n) {
  e.phase = n; e.inv = BOSS_RULES.phaseInv; G.eb = [];
  initPhase(e);
  ring(e.x, e.y, 0, 0, '#ff5a7e', .6, 4);
  banner(t('banner.phase', n), t(`bosses.${e.kind}.phases.${n}`), true);
}

export function bossUpdate(e, dt) {
  const S = G.ship; e.t += dt; e.rot += dt; if (e.inv > 0) e.inv -= dt;
  phaseDef(e).behaviors.forEach(([name, p], i) => BOSS_BEHAVIORS[name](e, dt, p, e.bs[i], S));
  if (Math.hypot(S.x - e.x, S.y - e.y) < e.r + S.r) hitShip();
}

/* ---------- Hành vi ---------- */
function moveToward(e, tx, ty, spd, dt) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
  if (d > 1) { const s = Math.min(spd * dt, d); e.x += dx / d * s; e.y += dy / d * s; }
}

function shootRing(x, y, n, spd, gapAt, gap, off = 0) {
  for (let k = 0; k < n; k++) {
    const rel = (k - gapAt + n) % n; if (rel < gap) continue;
    const a = off + k * TAU / n;
    G.eb.push({ kind: 'ship', x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 5, hp: Infinity, shoot: false });
  }
}

export const BOSS_BEHAVIORS = {
  // Bay vòng quanh trạm ở bán kính R.
  orbit(e, dt, p) {
    const a = Math.atan2(e.y - CY, e.x - CX), d = Math.hypot(e.x - CX, e.y - CY);
    const na = d > p.R + 30 ? a : a + .35 * e.dir;
    moveToward(e, CX + Math.cos(na) * p.R, CY + Math.sin(na) * p.R, p.spd, dt);
  },
  // Gọi thêm địch quanh boss.
  summon(e, dt, p, s) {
    if ((s.t -= dt) > 0) return;
    s.t = p.cd;
    for (let i = 0; i < p.n; i++) spawnEnemy(p.type, e.x + rand(-p.spread, p.spread), e.y + rand(-p.spread, p.spread), p.override);
  },
  // Ngắm vào trạm (báo trước bằng tia), rồi bắn một viên lớn bắn hạ được.
  chargedShot(e, dt, p, s) {
    if (e.tele > 0) {
      if ((e.tele -= dt) <= 0) {
        const a = Math.atan2(CY - e.y, CX - e.x);
        G.eb.push({ kind: 'st', x: e.x, y: e.y, vx: Math.cos(a) * p.spd, vy: Math.sin(a) * p.spd, r: p.r, dmg: p.dmg * dmgScale(), hp: p.hp, shoot: true, big: true });
      }
    } else if ((s.t -= dt) <= 0) { s.t = p.cd; e.tele = e.teleMax = p.tele; }
  },
  // Chùm đạn hình quạt vào máy bay.
  fan(e, dt, p, s, S) {
    if ((s.t -= dt) > 0) return;
    s.t = p.cd;
    const a = Math.atan2(S.y - e.y, S.x - e.x);
    for (let i = 0; i < p.n; i++) {
      const k = i - (p.n - 1) / 2;
      G.eb.push({ kind: 'ship', x: e.x, y: e.y, vx: Math.cos(a + k * p.step) * p.spd, vy: Math.sin(a + k * p.step) * p.spd, r: 5, hp: Infinity, shoot: false });
    }
  },
  // Vòng đạn có khe hở; `echo` bắn thêm vòng thứ hai lệch khe.
  ring(e, dt, p, s) {
    if ((s.t -= dt) <= 0) {
      s.t = p.cd;
      s.gap = Math.floor(rand(0, p.n));
      shootRing(e.x, e.y, p.n, p.spd, s.gap, p.gap, e.t * .3);
      if (p.echo) s.later = p.echo.delay;
    }
    if (s.later > 0 && (s.later -= dt) <= 0) shootRing(e.x, e.y, p.n, p.echo.spd, (s.gap + p.n / 2) % p.n, p.gap, e.t * .3 + TAU / (2 * p.n));
  },
  // Lao thẳng vào trạm và nện định kỳ.
  ramStation(e, dt, p, s) {
    const d = Math.hypot(e.x - CX, e.y - CY);
    if (d > ST_R + e.r) moveToward(e, CX, CY, p.spd, dt);
    else if ((s.t -= dt) <= 0) { s.t = p.cd; stationHit(p.dmg); shake(300, .01); }
  },
};
