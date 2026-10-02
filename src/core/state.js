// Trạng thái trận đang chơi. Module khác đọc `G`, `scene`, `mouseIn` qua live binding; chỉ đổi qua các hàm set*.
import { CX, CY } from '../config.js';
import { SHIP, STATION, SPECIAL, need } from '../data/player.js';
import { SCALING, WAVE } from '../data/stages.js';
import { CV } from '../data/cards.js';

export let G = null;
export let scene = null;
export let mouseIn = false;
export const keys = new Set();
let uid = 1;

export const setRun = r => { G = r; };
export const setScene = s => { scene = s; };
export const setMouseIn = v => { mouseIn = v; };
export const nextId = () => uid++;

export function newRun(state, stage = 1) {
  uid = 1;
  return {
    state, stage, time: 0, wave: 0, waveState: 'inter', interT: WAVE.interFirst, waveT: 0, queue: [], winT: 0,
    enemies: [], pb: [], eb: [], pickups: [], fx: [],
    kills: 0, metal: 0, level: 1, xp: 0, xpNeed: need(1), pending: 0, owned: {}, banned: new Set(), noRare: 0, offer: [],
    boss: null, stFlash: 0,
    ship: { x: CX, y: CY + SHIP.startDy, vx: 0, vy: 0, r: SHIP.r, inv: 0, aim: -Math.PI / 2, fireT: 0 },
    p: { dmg: SHIP.dmg, dmgPct: 0, rate: SHIP.rate, speed: SHIP.speed, magnet: SHIP.magnet, spread: 0, side: 0,
         shield: false, shieldUp: false, shieldCd: SHIP.shieldCd, shieldT: 0, shieldDmg: 0,
         lives: SHIP.lives, maxLives: SHIP.maxLives, lifeMode: null, bounce: 0, explode: 0, critCh: 0, critMul: 2 },
    st: { base: STATION.hp, hp: STATION.hp, max: STATION.hp, armor: 0, regen: 0, turret: 0, tt: 0, shock: 0, sk: STATION.firstShock, thorns: 0 },
    sp: { energy: 0, cost: SPECIAL.cost, gain: 1 },
  };
}

export const hpScale = () => Math.pow(SCALING.hp, G.wave - 1);
export const dmgScale = () => Math.pow(SCALING.dmg, G.wave - 1);
export const spdScale = () => Math.min(1 + SCALING.spdPer * (G.wave - 1), SCALING.spdMax);
export const xpScale = () => 1 + SCALING.xpPer * (G.wave - 1);

// Hệ số sát thương: các phần trăm cộng dồn, không nhân.
export function dmgMult() {
  const p = G.p; let m = 1 + p.dmgPct;
  if (p.shieldUp) m += CV('shielddmg').bonus[p.shieldDmg];
  if (p.lifeMode === 'per') m += CV('lifepow').perLife * p.lives;
  if (p.lifeMode === 'reckless') m += CV('reckless').byLives[p.lives] || 0;
  return m;
}
