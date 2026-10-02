// Thẻ nâng cấp trong trận. Số liệu nằm trong `v`; tên và mô tả nằm trong file ngôn ngữ (cards.<id>).
// apply(G, cấp mới, v) áp hiệu ứng ngay khi chọn thẻ.
export const RARITY = { common: { w: 62 }, rare: { w: 30 }, legend: { w: 8 } };
export const CARD_RULES = { choices: 3, ownedWeight: 1.5, pityAfter: 3 };

export const CARDS = [
  { id: 'dmg', g: 'ship', r: 'common', max: 5, v: { pct: .15 }, apply: (G, l, v) => G.p.dmgPct += v.pct },
  { id: 'rate', g: 'ship', r: 'common', max: 5, v: { mul: 1.12 }, apply: (G, l, v) => G.p.rate *= v.mul },
  { id: 'speed', g: 'ship', r: 'common', max: 3, v: { mul: 1.1 }, apply: (G, l, v) => G.p.speed *= v.mul },
  { id: 'magnet', g: 'ship', r: 'common', max: 3, v: { add: 45 }, apply: (G, l, v) => G.p.magnet += v.add },
  { id: 'spread', g: 'ship', r: 'rare', max: 3, apply: (G) => G.p.spread++ },
  { id: 'side', g: 'ship', r: 'rare', max: 3, v: { angle: 1.05, dmg: [0, .5, .5, .7] }, apply: (G) => G.p.side++ },
  { id: 'shield', g: 'ship', r: 'rare', max: 1, apply: (G) => { G.p.shield = true; G.p.shieldUp = true; } },
  { id: 'shieldcd', g: 'ship', r: 'rare', max: 3, req: 'shield', v: { mul: .8 }, apply: (G, l, v) => G.p.shieldCd *= v.mul },
  { id: 'shielddmg', g: 'ship', r: 'rare', max: 3, req: 'shield', v: { bonus: [0, .2, .3, .4] }, apply: (G, l) => G.p.shieldDmg = l },
  { id: 'life', g: 'ship', r: 'legend', max: 99, apply: (G) => G.p.lives = Math.min(G.p.maxLives, G.p.lives + 1) },
  { id: 'lifepow', g: 'ship', r: 'rare', max: 1, ex: 'reckless', v: { perLife: .08 }, apply: (G) => G.p.lifeMode = 'per' },
  { id: 'reckless', g: 'ship', r: 'rare', max: 1, ex: 'lifepow', v: { byLives: { 1: .5, 2: .25, 3: .1 } }, apply: (G) => G.p.lifeMode = 'reckless' },
  { id: 'bounce', g: 'bullet', r: 'rare', max: 4, v: { falloff: .8, range: 260, life: .8 }, apply: (G) => G.p.bounce++ },
  { id: 'explode', g: 'bullet', r: 'rare', max: 3, v: { pct: [0, .3, .4, .5], r: 45, rPer: 12, critR: 1.35, bounceMul: .5 }, apply: (G) => G.p.explode++ },
  { id: 'crit', g: 'bullet', r: 'rare', max: 5, v: { per: .1, mul: [2, 2, 2, 2, 2.5, 3] }, apply: (G, l, v) => { G.p.critCh = v.per * l; G.p.critMul = v.mul[l]; } },
  { id: 'hp', g: 'station', r: 'common', max: 5, v: { pct: .2 }, apply: (G, l, v) => { const a = G.st.base * v.pct; G.st.max += a; G.st.hp += a; } },
  { id: 'armor', g: 'station', r: 'common', max: 5, v: { per: .12 }, apply: (G, l, v) => G.st.armor = v.per * l },
  { id: 'regen', g: 'station', r: 'common', max: 3, v: { per: .004 }, apply: (G, l, v) => G.st.regen = v.per * l },
  { id: 'turret', g: 'station', r: 'rare', max: 3, v: { range: 230, cd: .8, dmg: 7, perLv: .25, perWave: .06 }, apply: (G, l) => G.st.turret = l },
  { id: 'shock', g: 'station', r: 'rare', max: 3, v: { cdBase: 8, r: 150, rPer: 25, dmg: 12, perWave: .08, push: 320 }, apply: (G, l) => G.st.shock = l },
  { id: 'thorns', g: 'station', r: 'rare', max: 3, v: { dps: 15, perWave: .05 }, apply: (G, l) => G.st.thorns = l },
  { id: 'charge', g: 'special', r: 'common', max: 3, v: { per: .25 }, apply: (G, l, v) => G.sp.gain += v.per },
];

// Thẻ dự phòng khi không đủ thẻ để chọn.
export const FALLBACK = [
  { id: 'fb-heal', fb: true, g: 'fallback', r: 'common', v: { pct: .3 }, apply: (G, l, v) => G.st.hp = Math.min(G.st.max, G.st.hp + G.st.max * v.pct) },
  { id: 'fb-sp', fb: true, g: 'fallback', r: 'common', apply: (G) => G.sp.energy = G.sp.cost },
  { id: 'fb-metal', fb: true, g: 'fallback', r: 'common', v: { amount: 25 }, apply: (G, l, v) => G.metal += v.amount },
];

export const CARD_BY_ID = Object.fromEntries([...CARDS, ...FALLBACK].map(c => [c.id, c]));
export const CV = id => CARD_BY_ID[id].v;
