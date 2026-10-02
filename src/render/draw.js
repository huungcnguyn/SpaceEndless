// Vẽ mọi thứ trong trận bằng Phaser Graphics.
import { W, H, CX, CY, ST_R, TAU } from '../config.js';
import { rand, clamp } from '../util.js';
import { G } from '../core/state.js';
import { facesShip } from '../game/behaviors.js';

function polyPath(g, x, y, r, n, rot) {
  g.beginPath();
  for (let i = 0; i < n; i++) { const a = rot + i * TAU / n, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath();
}

function tri(g, x, y, r, a, w = 2.5) {
  g.fillTriangle(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a + w) * r * .8, y + Math.sin(a + w) * r * .8, x + Math.cos(a - w) * r * .8, y + Math.sin(a - w) * r * .8);
}

// Nền màn 1: quỹ đạo hành tinh.
export function drawBackground(bg) {
  bg.fillStyle(0x0a1022, 1); bg.fillRect(0, 0, W, H);
  bg.fillStyle(0x2b2470, .10); bg.fillCircle(1060, 140, 260); bg.fillStyle(0x1b4a6a, .08); bg.fillCircle(980, 220, 180);
  for (let i = 0; i < 260; i++) { bg.fillStyle(0xffffff, rand(.12, .7)); bg.fillCircle(rand(0, W), rand(0, H), rand(.4, 1.3)); }
  bg.fillStyle(0x12264a, 1); bg.fillCircle(170, 900, 340);
  bg.fillStyle(0x183462, 1); bg.fillCircle(150, 920, 320);
  bg.lineStyle(2, 0x4fe3c1, .25); bg.strokeCircle(170, 900, 340);
}

const ENEMY_DRAW = {
  drone(g, e) { polyPath(g, e.x, e.y, e.r, 4, e.rot * .5); g.fillPath(); g.fillStyle(0x05080f, 1); g.fillCircle(e.x, e.y, 3); },
  bee(g, e, S) { const ship = facesShip(e); const a = Math.atan2((ship ? S.y : CY) - e.y, (ship ? S.x : CX) - e.x); tri(g, e.x, e.y, e.r + 2, a); },
  hunter(g, e, S) { const a = Math.atan2(S.y - e.y, S.x - e.x); tri(g, e.x, e.y, e.r + 4, a, 2.7); g.fillStyle(0x05080f, 1); g.fillCircle(e.x, e.y, 2.5); },
  gunner(g, e) { polyPath(g, e.x, e.y, e.r, 6, e.rot * .2); g.fillPath(); g.fillStyle(0x05080f, 1); g.fillCircle(e.x, e.y, 5); },
};

export function render(g) {
  g.clear();
  if (!G) return;
  const t = G.time, S = G.ship, st = G.st;

  // trạm
  const hpF = Math.max(0, st.hp / st.max);
  g.lineStyle(1, 0x4fe3c1, .12); g.strokeCircle(CX, CY, 230);
  for (let i = 0; i < 4; i++) {
    const a = t * .25 + i * Math.PI / 2;
    g.lineStyle(3, 0x2a5d73, 1); g.lineBetween(CX + Math.cos(a) * 20, CY + Math.sin(a) * 20, CX + Math.cos(a) * 38, CY + Math.sin(a) * 38);
    g.fillStyle(0x1d4a63, 1); g.fillRect(CX + Math.cos(a) * 32 - 5, CY + Math.sin(a) * 32 - 5, 10, 10);
  }
  g.fillStyle(G.stFlash > 0 ? 0x5a2236 : 0x0f2a3c, 1); g.fillCircle(CX, CY, 24);
  g.lineStyle(2, 0x4fe3c1, 1); g.strokeCircle(CX, CY, 24);
  g.fillStyle(0x4fe3c1, .9); g.fillCircle(CX, CY, 7 + Math.sin(t * 3) * 1.2);
  g.lineStyle(5, 0x4fe3c1, .14); g.strokeCircle(CX, CY, ST_R);
  const hc = hpF > .5 ? 0x4fe3c1 : hpF > .25 ? 0xffcf55 : 0xff5a7e;
  g.lineStyle(5, hc, 1); g.beginPath(); g.arc(CX, CY, ST_R, -Math.PI / 2, -Math.PI / 2 + hpF * TAU, false); g.strokePath();
  if (st.armor > 0) { g.lineStyle(1.5, 0x9fe8ff, .25 + st.armor); g.strokeCircle(CX, CY, ST_R + 6); }
  for (let i = 0; i < st.turret; i++) {
    const a = t * .8 + i * TAU / st.turret;
    g.fillStyle(0x4fe3c1, 1); polyPath(g, CX + Math.cos(a) * 52, CY + Math.sin(a) * 52, 5, 4, a); g.fillPath();
  }

  // vật phẩm
  for (const q of G.pickups) {
    const alpha = q.life < 3 && !q.pull ? (Math.floor(q.life * 8) % 2 ? .35 : 1) : 1;
    if (q.kind === 'xp') { g.fillStyle(0x7de9ff, alpha); polyPath(g, q.x, q.y, q.v > 3 ? 6 : 4.5, 4, t * 2); g.fillPath(); }
    else { g.fillStyle(0xff9a3d, alpha); g.fillRect(q.x - 4, q.y - 4, 8, 8); g.lineStyle(1, 0xffd2a8, alpha); g.strokeRect(q.x - 4, q.y - 4, 8, 8); }
  }

  // địch
  for (const e of G.enemies) {
    if (e.isBoss) { drawBoss(g, e); continue; }
    const col = e.flash > 0 ? 0xffffff : (e.color || 0xff5a7e);
    g.fillStyle(col, 1);
    ENEMY_DRAW[e.type](g, e, S);
    if (e.hp < e.max && e.max > 15) { g.fillStyle(0x05080f, .8); g.fillRect(e.x - 12, e.y - e.r - 8, 24, 3); g.fillStyle(col, 1); g.fillRect(e.x - 12, e.y - e.r - 8, 24 * Math.max(0, e.hp / e.max), 3); }
  }

  // đạn
  for (const b of G.pb) {
    const c = b.src === 'turret' ? 0x4fe3c1 : b.main ? 0xe6f8ff : 0x9fd8ff;
    g.lineStyle(b.main ? 3 : 2, c, 1); g.lineBetween(b.x - b.vx * .018, b.y - b.vy * .018, b.x, b.y);
  }
  for (const b of G.eb) {
    if (b.kind === 'st') { g.fillStyle(0xff9a3d, 1); g.fillCircle(b.x, b.y, b.r); g.fillStyle(0xfff0d8, 1); g.fillCircle(b.x, b.y, b.r * .45); }
    else { g.fillStyle(0xff5a7e, 1); g.fillCircle(b.x, b.y, b.r); g.fillStyle(0xffd8e0, 1); g.fillCircle(b.x, b.y, b.r * .4); }
  }

  // máy bay
  if (G.state !== 'over' || G.p.lives > 0) {
    const blink = S.inv > 0 && Math.floor(S.inv * 14) % 2 === 0;
    if (!blink) {
      g.fillStyle(0xffb066, .25 + Math.random() * .2); g.fillCircle(S.x - Math.cos(S.aim) * 11, S.y - Math.sin(S.aim) * 11, 5);
      g.fillStyle(0xffb066, 1); tri(g, S.x, S.y, 16, S.aim, 2.45);
      g.fillStyle(0x05080f, 1); g.fillCircle(S.x + Math.cos(S.aim) * 3, S.y + Math.sin(S.aim) * 3, 2.5);
    }
    if (G.p.shieldUp) { g.lineStyle(2, 0x7de9ff, .75); g.strokeCircle(S.x, S.y, 21); }
    if (G.p.magnet > 70) { g.lineStyle(1, 0x7de9ff, .07); g.strokeCircle(S.x, S.y, G.p.magnet); }
  }

  // hiệu ứng
  for (const f of G.fx) {
    const k = f.t / f.dur;
    if (f.kind === 'ring') { g.lineStyle(f.w * (1 - k) + .5, f.color, 1 - k); g.strokeCircle(f.x, f.y, f.r0 + (f.r1 - f.r0) * k); }
    else { g.fillStyle(f.color, 1 - k); g.fillRect(f.x - 1.5, f.y - 1.5, 3, 3); }
  }

  // mũi tên cảnh báo địch ngoài màn hình
  for (const e of G.enemies) {
    if (e.x >= 0 && e.x <= W && e.y >= 0 && e.y <= H) continue;
    const a = Math.atan2(e.y - CY, e.x - CX), px = clamp(e.x, 14, W - 14), py = clamp(e.y, 14, H - 14);
    g.fillStyle(e.isBoss ? 0xff5a7e : (e.color || 0xff5a7e), .85); tri(g, px, py, e.isBoss ? 13 : 8, a);
  }
}

const BOSS_DRAW = {
  queen(g, e, col) {
    g.fillStyle(col || 0xffd34d, 1); polyPath(g, e.x, e.y, e.r, 6, e.rot * .4); g.fillPath();
    g.fillStyle(0x05080f, 1); polyPath(g, e.x, e.y, e.r * .55, 6, e.rot * .4); g.fillPath();
    g.fillStyle(col || 0xffd34d, 1); g.fillCircle(e.x, e.y, 6);
    for (let i = 0; i < 6; i++) { const a = -e.rot * .9 + i * TAU / 6; g.fillCircle(e.x + Math.cos(a) * (e.r + 10), e.y + Math.sin(a) * (e.r + 10), 3); }
  },
  heavy(g, e, col) {
    const a = Math.atan2(CY - e.y, CX - e.x);
    if (e.tele > 0) { g.lineStyle(2 + (1 - e.tele / e.teleMax) * 4, 0xff5a7e, .35 + .5 * Math.abs(Math.sin(e.t * 20))); g.lineBetween(e.x, e.y, CX, CY); }
    g.fillStyle(col || 0xb98bff, 1); polyPath(g, e.x, e.y, e.r, 6, a); g.fillPath();
    g.lineStyle(6, col || 0xe0ccff, 1); g.lineBetween(e.x, e.y, e.x + Math.cos(a) * (e.r + 18), e.y + Math.sin(a) * (e.r + 18));
    g.fillStyle(0x05080f, 1); g.fillCircle(e.x, e.y, 10);
  },
  mother(g, e, col) {
    g.fillStyle(col || 0xff5a7e, 1); g.fillCircle(e.x, e.y, e.r);
    g.fillStyle(0x05080f, 1); g.fillCircle(e.x, e.y, e.r * .62);
    g.lineStyle(3, col || 0xff9ab2, 1);
    for (let i = 0; i < 8; i++) { const a = e.rot * .6 + i * TAU / 8; g.lineBetween(e.x + Math.cos(a) * e.r * .7, e.y + Math.sin(a) * e.r * .7, e.x + Math.cos(a) * (e.r + 8), e.y + Math.sin(a) * (e.r + 8)); }
    g.fillStyle(e.phase === 3 ? 0xffcf55 : 0xff9ab2, 1); g.fillCircle(e.x, e.y, 9 + Math.sin(e.t * 6) * 2);
  },
};

function drawBoss(g, e) {
  const col = e.flash > 0 ? 0xffffff : e.inv > 0 ? 0x8a93b8 : null;
  BOSS_DRAW[e.kind](g, e, col);
}
