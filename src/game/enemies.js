// Sinh và cập nhật địch thường.
import { TAU } from '../config.js';
import { rand } from '../util.js';
import { G, nextId, hpScale, spdScale, dmgScale, xpScale } from '../core/state.js';
import { ENEMIES, BEHAVIOR } from '../data/enemies.js';
import { BEHAVIORS } from './behaviors.js';
import { bossUpdate } from './bosses.js';
import { hitShip } from './combat.js';
import { SPECIALS } from '../data/specials.js';

// `o` ghi đè chỉ số sau khi nhân hệ số đợt; o.spd được nhân thêm spdScale.
export function spawnEnemy(type, x, y, o = {}) {
  const d = ENEMIES[type], sf = BEHAVIOR.standoffShoot.firstFire;
  const e = { id: nextId(), type, x, y, kx: 0, ky: 0, r: d.r, hp: d.hp * hpScale(), spd: d.spd * spdScale(), dmg: d.dmg * dmgScale(),
    xp: d.xp * xpScale(), metal: d.metal, behaviors: d.behaviors, color: d.color, flash: 0,
    atk: BEHAVIOR.rushStation.firstAtk, fire: rand(sf[0], sf[1]), attached: false, rot: rand(0, TAU) };
  e.max = e.hp;
  Object.assign(e, o);
  if (o.spd !== undefined) e.spd = o.spd * spdScale();
  G.enemies.push(e); return e;
}

// Trả về false nếu trận kết thúc giữa chừng. frozen: Ngưng đọng thời gian (địch đứng yên, boss chậm lại).
export function updateEnemies(dt, frozen) {
  const S = G.ship, kb = BEHAVIOR.knockback, rdt = dt;
  for (const e of G.enemies) {
    if (e.flash > 0) e.flash -= rdt;
    if (e.isBoss) { bossUpdate(e, frozen ? rdt * SPECIALS.timestop.bossSlow : rdt); continue; }
    dt = frozen ? 0 : rdt;
    e.rot += dt * 2;
    for (const b of e.behaviors) BEHAVIORS[b](e, dt, S);
    e.x += e.kx * dt; e.y += e.ky * dt;
    const decay = Math.pow(kb.decay, dt); e.kx *= decay; e.ky *= decay;
    if (Math.hypot(S.x - e.x, S.y - e.y) < e.r + S.r && S.inv <= 0) {
      hitShip();
      const a = Math.atan2(e.y - S.y, e.x - S.x); e.kx += Math.cos(a) * kb.onShipHit; e.ky += Math.sin(a) * kb.onShipHit; e.attached = false;
    }
    if (G.state !== 'play') return false;
  }
  return true;
}
