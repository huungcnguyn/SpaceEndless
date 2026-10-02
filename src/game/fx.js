// Hiệu ứng hình ảnh, có giới hạn số lượng.
import { TAU } from '../config.js';
import { rand, reduceMotion } from '../util.js';
import { G, scene } from '../core/state.js';

export const FX_LIMIT = { sparks: 420, explosions: 260 };

export function ring(x, y, r0, r1, color, dur, w) {
  G.fx.push({ kind: 'ring', x, y, r0, r1: r1 || r0 + 60, t: 0, dur, color: Phaser.Display.Color.HexStringToColor(color).color, w });
}

export function sparks(x, y, color, n) {
  if (G.fx.length > FX_LIMIT.sparks) return;
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = rand(60, 220); G.fx.push({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, dur: rand(.25, .5), color }); }
}

export function shake(ms, i) { if (!reduceMotion && scene) scene.cameras.main.shake(ms, i); }

export function updateFx(dt) {
  for (let i = G.fx.length - 1; i >= 0; i--) {
    const f = G.fx[i]; f.t += dt;
    if (f.kind === 'spark') { f.x += f.vx * dt; f.y += f.vy * dt; }
    if (f.t >= f.dur) G.fx.splice(i, 1);
  }
}
