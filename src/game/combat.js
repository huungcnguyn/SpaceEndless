// Sát thương, đạn, máy bay/trạm trúng đòn, vật phẩm rơi, kinh nghiệm và special.
import { W, H, TAU } from '../config.js';
import { rand } from '../util.js';
import { G } from '../core/state.js';
import { emit } from '../core/events.js';
import { SHIP, SPECIAL, LOOT, need } from '../data/player.js';
import { KEYS } from '../data/tree.js';
import { CV } from '../data/cards.js';
import { ring, sparks, shake, FX_LIMIT } from './fx.js';
import { checkBossPhase } from './bosses.js';

export function nearestEnemy(x, y, maxD, exclude) {
  let best = null, bd = maxD;
  for (const e of G.enemies) {
    if (e.hp <= 0 || (exclude && exclude.includes(e.id))) continue;
    if (e.x < -20 || e.x > W + 20 || e.y < -20 || e.y > H + 20) continue;
    const d = Math.hypot(e.x - x, e.y - y) - e.r;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

// raw: sát thương cố định (vd. bom theo % máu boss), bỏ qua hệ số tăng sát thương lên boss.
export function damageEnemy(e, d, raw) {
  if (e.hp <= 0) return;
  if (e.isBoss && e.inv > 0) return;
  if (e.isBoss && !raw) {
    const m = G.meta;
    d *= 1 + m.stats.bossDmg + (m.keys.has('finisher') && e.hp / e.max < KEYS.finisherHp ? KEYS.finisherDmg : 0);
  }
  e.hp -= d; e.flash = .07;
  if (e.isBoss) checkBossPhase(e);
}

export function addBullet(x, y, a, dmg, main, src) {
  G.pb.push({ x, y, vx: Math.cos(a) * SHIP.bulletSpd, vy: Math.sin(a) * SHIP.bulletSpd, dmg, life: SHIP.bulletLife, main, src, bounce: main ? G.p.bounce : 0, hit: [], bounced: false });
}

// Trả về true nếu đạn nảy tiếp (không bị xóa).
export function applyHit(b, e) {
  let d = b.dmg, crit = false;
  if (b.src === 'ship' && Math.random() < G.p.critCh) { d *= G.p.critMul; crit = true; }
  damageEnemy(e, d); b.hit.push(e.id);
  emit('hit', b, e, d, crit);
  sparks(e.x, e.y, crit ? 0xffcf55 : 0xbfefff, crit ? 7 : 3);
  if (b.main && G.p.explode && G.fx.length < FX_LIMIT.explosions) {
    const v = CV('explode'), lv = G.p.explode; let r = v.r + v.rPer * lv; if (crit) r *= v.critR;
    const ed = d * v.pct[lv] * (b.bounced ? v.bounceMul : 1);
    for (const o of G.enemies) if (o !== e && o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < r + o.r) damageEnemy(o, ed);
    ring(e.x, e.y, 6, r, crit ? '#ffcf55' : '#ff9a3d', .28, 3);
  }
  if (b.bounce > 0) {
    const v = CV('bounce'), n = nearestEnemy(e.x, e.y, v.range, b.hit);
    if (n) {
      const a = Math.atan2(n.y - e.y, n.x - e.x);
      b.bounce--; b.dmg *= v.falloff; b.bounced = true; b.x = e.x; b.y = e.y;
      b.vx = Math.cos(a) * SHIP.bulletSpd; b.vy = Math.sin(a) * SHIP.bulletSpd; b.life = v.life;
      return true;
    }
  }
  return false;
}

export function stationHit(d) {
  if (G.spx.aegisT > 0) return;
  const real = d * (1 - G.st.armor);
  G.st.hp -= real; G.stFlash = .15;
  if (real >= 6) shake(100, .003);
  if (G.st.hp <= 0) { G.st.hp = 0; emit('runOver', false, 'station'); }
}

// Năng lượng special khi máy bay trúng đòn (nút cây nâng cấp).
function energyOnHit() {
  const v = G.meta.stats.spOnHit;
  if (v) G.sp.energy = Math.min(G.sp.cost, G.sp.energy + v);
}

export function hitShip() {
  const S = G.ship, p = G.p;
  if (S.inv > 0 || G.state !== 'play' || G.spx.aegisT > 0) return;
  energyOnHit();
  if (p.shieldUp) {
    p.shieldUp = false; p.shieldT = p.shieldCd; S.inv = SHIP.invShield;
    ring(S.x, S.y, 14, 60, '#7de9ff', .35, 3);
    emit('shieldBreak');
    return;
  }
  p.lives--; S.inv = SHIP.invHit + G.meta.stats.invBonus; shake(220, .008);
  ring(S.x, S.y, 10, 90, '#ffb066', .45, 4); sparks(S.x, S.y, 0xffb066, 16);
  emit('lifeLost', p.lives);
  if (p.lives <= 0) emit('runOver', false, 'ship');
}

export function pickup(kind, x, y, v, burst) {
  const a = rand(0, TAU), s = rand(.3, 1) * burst, m = G.meta;
  if (kind === 'metal') {
    if (m.keys.has('metalPlus')) v += 1;
    if (m.keys.has('jackpot') && Math.random() < KEYS.jackpotChance) v *= KEYS.jackpotMul;
  }
  const pull = kind === 'chest' || (kind === 'metal' && m.keys.has('metalPull'));
  return { kind, x, y, v, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: LOOT.life + m.stats.pickupLife, pull };
}

export function dropLoot(e) {
  const xv = e.xp, metal = Math.floor(G.wave / LOOT.metalPerWaves);
  if (e.isBoss) {
    for (let i = 0; i < LOOT.bossXpPieces; i++) G.pickups.push(pickup('xp', e.x, e.y, xv / LOOT.bossXpPieces * LOOT.bossXpMul, 220));
    const bv = Math.round((LOOT.bossMetalBase + metal) * (1 + G.meta.stats.bossMetal));
    for (let i = 0; i < LOOT.bossMetalPieces; i++) G.pickups.push(pickup('metal', e.x, e.y, bv, 200));
    return;
  }
  G.pickups.push(pickup('xp', e.x, e.y, xv, 60));
  if (Math.random() < e.metal * (1 + G.meta.stats.metalDrop)) G.pickups.push(pickup('metal', e.x, e.y, LOOT.metalBase + metal, 80));
}

export function addXp(v) {
  G.xp += v * (1 + G.meta.stats.xpGain);
  G.sp.energy = Math.min(G.sp.cost, G.sp.energy + v * SPECIAL.xpGain * G.sp.gain);
  const from = G.level;
  while (G.xp >= G.xpNeed) { G.xp -= G.xpNeed; G.level++; G.xpNeed = need(G.level); G.pending++; }
  for (let l = from + 1; l <= G.level; l++) emit('levelUp', l);
}
