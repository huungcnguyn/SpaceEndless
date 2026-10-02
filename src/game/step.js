// Vòng lặp một khung hình của trận.
import { W, H, CX, CY, ST_R } from '../config.js';
import { clamp } from '../util.js';
import { t } from '../lang/index.js';
import { G, scene, mouseIn, keys, dmgMult } from '../core/state.js';
import { SAVE } from '../core/save.js';
import { emit } from '../core/events.js';
import { SHIP, LOOT } from '../data/player.js';
import { WAVE } from '../data/stages.js';
import { CV } from '../data/cards.js';
import { updateWaves, stageDef } from './waves.js';
import { updateEnemies } from './enemies.js';
import { nearestEnemy, damageEnemy, addBullet, applyHit, stationHit, hitShip, dropLoot, addXp } from './combat.js';
import { ring, sparks, shake, updateFx } from './fx.js';
import { banner } from '../ui/banner.js';

export function step(dt) {
  G.time += dt;
  if (G.winT > 0) { if ((G.winT -= dt) <= 0) return emit('runOver', true); }
  else updateWaves(dt);

  updateShip(dt);
  updateStation(dt);
  if (!updateEnemies(dt)) return;
  updatePlayerBullets(dt);
  if (!updateEnemyBullets(dt)) return;

  const dead = [];
  G.enemies = G.enemies.filter(e => { if (e.hp <= 0) { dead.push(e); return false; } return true; });
  for (const e of dead) onKill(e);

  if (!updatePickups(dt)) return;
  updateFx(dt);
  if (G.stFlash > 0) G.stFlash -= dt;
}

function inputVelocity() {
  const S = G.ship, p = G.p;
  if (SAVE.control === 'keyboard') {
    const ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    const iy = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
    const l = Math.hypot(ix, iy) || 1;
    return [ix / l * p.speed, iy / l * p.speed];
  }
  if (scene) {
    const ptr = scene.input.activePointer;
    const active = mouseIn && (SAVE.mouseMode === 'follow' || (ptr.isDown && !ptr.rightButtonDown()));
    if (active) {
      const dx = ptr.worldX - S.x, dy = ptr.worldY - S.y, d = Math.hypot(dx, dy);
      if (d > 6) { const s = Math.min(p.speed, d * 8); return [dx / d * s, dy / d * s]; }
    }
  }
  return [0, 0];
}

function updateShip(dt) {
  const S = G.ship, p = G.p;
  const [tvx, tvy] = inputVelocity();
  const k = Math.min(1, dt * 12);
  S.vx += (tvx - S.vx) * k; S.vy += (tvy - S.vy) * k;
  S.x = clamp(S.x + S.vx * dt, 14, W - 14); S.y = clamp(S.y + S.vy * dt, 14, H - 14);
  if (S.inv > 0) S.inv -= dt;
  if (p.shield && !p.shieldUp && (p.shieldT -= dt) <= 0) { p.shieldUp = true; ring(S.x, S.y, 10, 26, '#7de9ff', .3, 2); }

  // tự bắn địch gần nhất
  S.fireT -= dt;
  const tgt = nearestEnemy(S.x, S.y, SHIP.range);
  if (tgt) {
    S.aim = Math.atan2(tgt.y - S.y, tgt.x - S.x);
    if (S.fireT <= 0) {
      S.fireT = 1 / p.rate;
      const dmg = p.dmg * dmgMult(), n = 1 + p.spread;
      const even = n % 2 === 0, nx = -Math.sin(S.aim), ny = Math.cos(S.aim);
      for (let i = 0; i < n; i++) {
        // Số viên lẻ: viên giữa bay thẳng. Số viên chẵn: cặp giữa song song, các viên ngoài tỏa ra.
        const k = i - (n - 1) / 2, sg = Math.sign(k);
        const a = S.aim + (even ? sg * (Math.abs(k) - .5) : k) * SHIP.spreadAngle, off = even ? sg * SHIP.spreadGap : 0;
        addBullet(S.x + Math.cos(S.aim) * 14 + nx * off, S.y + Math.sin(S.aim) * 14 + ny * off, a, dmg, true, 'ship');
      }
      if (p.side) {
        const v = CV('side'), f = v.dmg[p.side], angs = [S.aim + v.angle, S.aim - v.angle];
        if (p.side >= 2) angs.push(S.aim + Math.PI);
        for (const a of angs) addBullet(S.x, S.y, a, dmg * f, false, 'ship');
      }
    }
  } else if (Math.hypot(S.vx, S.vy) > 30) S.aim = Math.atan2(S.vy, S.vx);
}

function updateStation(dt) {
  const st = G.st;
  if (st.regen) st.hp = Math.min(st.max, st.hp + st.max * st.regen * dt);
  if (st.turret && (st.tt -= dt) <= 0) {
    const v = CV('turret');
    st.tt = v.cd / st.turret;
    const e = nearestEnemy(CX, CY, v.range);
    if (e) {
      const a = Math.atan2(e.y - CY, e.x - CX);
      addBullet(CX + Math.cos(a) * 40, CY + Math.sin(a) * 40, a, v.dmg * (1 + v.perLv * (st.turret - 1)) * (1 + v.perWave * (G.wave - 1)), false, 'turret');
    }
  }
  if (st.shock && (st.sk -= dt) <= 0) {
    const v = CV('shock');
    st.sk = v.cdBase - st.shock;
    const R = v.r + v.rPer * st.shock, d = v.dmg * st.shock * (1 + v.perWave * (G.wave - 1));
    for (const e of G.enemies) {
      const dd = Math.hypot(e.x - CX, e.y - CY);
      if (dd < R + e.r) { damageEnemy(e, d); if (!e.isBoss) { e.kx += (e.x - CX) / (dd || 1) * v.push; e.ky += (e.y - CY) / (dd || 1) * v.push; e.attached = false; } }
    }
    G.eb = G.eb.filter(b => !(b.shoot && Math.hypot(b.x - CX, b.y - CY) < R));
    ring(CX, CY, ST_R, R, '#4fe3c1', .45, 4);
  }
}

function updatePlayerBullets(dt) {
  for (let i = G.pb.length - 1; i >= 0; i--) {
    const b = G.pb[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    let remove = b.life <= 0 || b.x < -60 || b.x > W + 60 || b.y < -60 || b.y > H + 60;
    if (!remove) for (const eb of G.eb) {
      if (eb.shoot && eb.hp > 0 && Math.hypot(eb.x - b.x, eb.y - b.y) < eb.r + 4) { eb.hp -= b.dmg; remove = true; sparks(eb.x, eb.y, 0xff9a3d, 3); break; }
    }
    if (!remove) for (const e of G.enemies) {
      if (e.hp <= 0 || b.hit.includes(e.id)) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + 4) { remove = !applyHit(b, e); break; }
    }
    if (remove) G.pb.splice(i, 1);
  }
}

function updateEnemyBullets(dt) {
  const S = G.ship;
  for (let i = G.eb.length - 1; i >= 0; i--) {
    const b = G.eb[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    let remove = b.hp <= 0 || b.x < -90 || b.x > W + 90 || b.y < -90 || b.y > H + 90;
    const ds = Math.hypot(b.x - CX, b.y - CY);
    if (!remove && b.kind === 'st' && ds < ST_R + b.r) { stationHit(b.dmg); remove = true; sparks(b.x, b.y, 0xff9a3d, 6); }
    else if (!remove && b.kind === 'ship') {
      if (Math.hypot(b.x - S.x, b.y - S.y) < S.r + b.r - 2) { hitShip(); remove = true; }
      else if (ds < ST_R) remove = true;
    }
    if (remove) G.eb.splice(i, 1);
    if (G.state !== 'play') return false;
  }
  return true;
}

function updatePickups(dt) {
  const S = G.ship, p = G.p;
  for (let i = G.pickups.length - 1; i >= 0; i--) {
    const q = G.pickups[i];
    q.life -= dt;
    const d = Math.hypot(S.x - q.x, S.y - q.y);
    if (q.pull || d < p.magnet) {
      const s = q.pull ? LOOT.pullSpd : LOOT.magnetSpd; q.x += (S.x - q.x) / (d || 1) * s * dt; q.y += (S.y - q.y) / (d || 1) * s * dt;
    } else {
      q.x += q.vx * dt; q.y += q.vy * dt; const dec = Math.pow(.05, dt); q.vx *= dec; q.vy *= dec;
    }
    if (d < S.r + 10) {
      G.pickups.splice(i, 1);
      if (q.kind === 'xp') addXp(q.v); else G.metal += q.v;
      if (G.state !== 'play' && G.state !== 'cards') return false;
      continue;
    }
    if (q.life <= 0 && !q.pull) G.pickups.splice(i, 1);
  }
  return true;
}

function onKill(e) {
  G.kills++;
  sparks(e.x, e.y, e.isBoss ? 0xffcf55 : e.color, e.isBoss ? 40 : 8);
  dropLoot(e);
  emit('kill', e);
  if (!e.isBoss) return;
  G.boss = null; shake(400, .012);
  ring(e.x, e.y, e.r, 260, '#ffcf55', .8, 6);
  if (G.wave >= stageDef().waves) {
    for (const o of G.enemies) { sparks(o.x, o.y, o.color || 0xff5a7e, 6); o.hp = 0; }
    G.enemies = []; G.eb = []; G.winT = WAVE.winDelay;
    G.pickups.forEach(p => p.pull = true);
    banner(t('banner.bossDown', e.name), t('banner.stageClear'));
  } else banner(t('banner.bossDown', e.name), t('banner.bossDownSub'));
}
