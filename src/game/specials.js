// Special: kích hoạt và cập nhật hiệu ứng đang chạy. Số liệu trong src/data/specials.js.
import { W, H, TAU } from '../config.js';
import { clamp } from '../util.js';
import { G } from '../core/state.js';
import { emit } from '../core/events.js';
import { SPECIALS } from '../data/specials.js';
import { damageEnemy, nearestEnemy, addBullet } from './combat.js';
import { ring, sparks, shake } from './fx.js';

const power = () => 1 + G.meta.stats.spPower;
const waveDmg = d => (d.dmg + d.dmgPerWave * G.wave) * power();

const USE = {
  // Bom tinh vân: sát thương toàn màn, xóa đạn địch. Lên boss chỉ gây % máu cố định.
  bomb(d) {
    for (const e of G.enemies) {
      if (e.isBoss) damageEnemy(e, e.max * (d.bossPct + G.meta.stats.bombBoss), true);
      else damageEnemy(e, waveDmg(d));
    }
    G.eb = [];
    ring(G.ship.x, G.ship.y, 20, 900, '#7de9ff', .7, 6);
    shake(250, .006);
  },
  // Lao xung kích: lướt nhanh theo hướng đang bay, bất tử, gây sát thương và phá đạn trên đường lướt.
  dash(d) {
    const S = G.ship, x = G.spx;
    x.dashA = Math.hypot(S.vx, S.vy) > 30 ? Math.atan2(S.vy, S.vx) : S.aim;
    x.dashT = d.dur; x.dashHit = [];
    S.inv = Math.max(S.inv, d.dur + .2);
    ring(S.x, S.y, 8, 50, '#ffb066', .3, 3);
  },
  // Phi đội hộ tống: vài máy bay nhỏ bay quanh và tự bắn.
  escort(d) {
    G.spx.escortT = d.dur;
    G.spx.escorts = Array.from({ length: d.n }, (_, i) => ({ i, x: G.ship.x, y: G.ship.y, fireT: i * .08 }));
    ring(G.ship.x, G.ship.y, 10, 70, '#7de9ff', .4, 3);
  },
  // Lá chắn tuyệt đối: trạm và máy bay không nhận sát thương.
  aegis(d) {
    G.spx.aegisT = d.dur;
    ring(G.ship.x, G.ship.y, 10, 80, '#ffcf55', .4, 4);
  },
  // Ngưng đọng thời gian: địch và đạn địch đứng yên, boss chậm lại.
  timestop(d) {
    G.spx.freezeT = d.dur;
    ring(G.ship.x, G.ship.y, 20, 900, '#b6c8ff', .6, 4);
  },
};

export function useSpecial() {
  if (!G || G.state !== 'play' || G.sp.energy < G.sp.cost) return;
  G.sp.energy = 0;
  USE[G.special](SPECIALS[G.special]);
  if (G.p.shield) G.p.shieldUp = true; // dùng special xong khiên hồi ngay
  emit('special', G.special);
}

export const isDashing = () => G.spx.dashT > 0;
export const isFrozen = () => G.spx.freezeT > 0;

export function updateSpecials(dt) {
  const x = G.spx, S = G.ship;
  if (x.dashT > 0) {
    const d = SPECIALS.dash, spd = d.dist / d.dur, st = Math.min(dt, x.dashT);
    x.dashT -= dt;
    S.vx = Math.cos(x.dashA) * spd * .25; S.vy = Math.sin(x.dashA) * spd * .25;
    S.x = clamp(S.x + Math.cos(x.dashA) * spd * st, 14, W - 14);
    S.y = clamp(S.y + Math.sin(x.dashA) * spd * st, 14, H - 14);
    for (const e of G.enemies) {
      if (e.hp <= 0 || x.dashHit.includes(e.id) || Math.hypot(e.x - S.x, e.y - S.y) > e.r + d.width) continue;
      x.dashHit.push(e.id);
      if (e.isBoss) damageEnemy(e, e.max * d.bossPct, true); else damageEnemy(e, waveDmg(d));
      sparks(e.x, e.y, 0xffb066, 6);
    }
    G.eb = G.eb.filter(b => Math.hypot(b.x - S.x, b.y - S.y) > b.r + d.width);
    sparks(S.x, S.y, 0xffb066, 1);
  }
  if (x.escortT > 0) {
    const d = SPECIALS.escort;
    x.escortT -= dt;
    for (const o of x.escorts) {
      const a = G.time * 2.2 + o.i * TAU / d.n;
      o.x = S.x + Math.cos(a) * d.orbit; o.y = S.y + Math.sin(a) * d.orbit;
      if ((o.fireT -= dt) > 0) continue;
      const e = nearestEnemy(o.x, o.y, d.range);
      if (!e) continue;
      o.fireT = 1 / d.rate;
      addBullet(o.x, o.y, Math.atan2(e.y - o.y, e.x - o.x), d.dmg * (1 + d.perWave * (G.wave - 1)) * power(), false, 'escort');
    }
    if (x.escortT <= 0) x.escorts = [];
  }
  if (x.aegisT > 0) x.aegisT -= dt;
  if (x.freezeT > 0) x.freezeT -= dt;
}
