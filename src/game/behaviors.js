// Hành vi của địch thường. Mỗi địch có danh sách `behaviors`; mỗi hành vi là hàm (e, dt, S) chạy mỗi khung hình.
import { CX, CY, ST_R } from '../config.js';
import { G } from '../core/state.js';
import { BEHAVIOR } from '../data/enemies.js';
import { CV } from '../data/cards.js';
import { stationHit, damageEnemy } from './combat.js';

function toward(e, tx, ty) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1;
  return { dx, dy, d };
}
function advance(e, v, dt) { e.x += v.dx / v.d * e.spd * dt; e.y += v.dy / v.d * e.spd * dt; }

export const BEHAVIORS = {
  // Lao vào trạm, bám vào và gây sát thương định kỳ.
  rushStation(e, dt) {
    const v = toward(e, CX, CY), b = BEHAVIOR.rushStation;
    if (!e.attached && v.d <= ST_R + e.r) e.attached = true;
    if (!e.attached) advance(e, v, dt);
    else if ((e.atk -= dt) <= 0) {
      e.atk = b.atkCd; stationHit(e.dmg);
      const st = G.st;
      if (st.thorns) { const t = CV('thorns'); damageEnemy(e, t.dps * st.thorns * (1 + t.perWave * (G.wave - 1))); }
    }
  },
  // Bỏ qua trạm, đuổi theo máy bay.
  chaseShip(e, dt, S) { advance(e, toward(e, S.x, S.y), dt); },
  // Tiến lại gần trạm rồi đứng yên bắn đạn chậm, bắn hạ được.
  standoffShoot(e, dt) {
    const v = toward(e, CX, CY), b = BEHAVIOR.standoffShoot;
    if (v.d > b.range) advance(e, v, dt);
    else if ((e.fire -= dt) <= 0) {
      e.fire = b.fireCd;
      G.eb.push({ kind: 'st', x: e.x, y: e.y, vx: v.dx / v.d * b.bulletSpd, vy: v.dy / v.d * b.bulletSpd, r: b.bulletR, dmg: e.dmg, hp: 1, shoot: true });
    }
  },
};

// Mục tiêu mà địch hướng mũi về (dùng khi vẽ).
export const facesShip = e => e.behaviors.includes('chaseShip');
