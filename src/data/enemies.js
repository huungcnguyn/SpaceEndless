// Kẻ địch thường. `behaviors` là danh sách hành vi ghép lại (xem src/game/behaviors.js).
export const ENEMIES = {
  drone:  { hp: 12, spd: 72,  r: 10, dmg: 8,  xp: 2, metal: .30, color: 0xff5a7e, behaviors: ['rushStation'] },
  bee:    { hp: 4,  spd: 128, r: 6,  dmg: 3,  xp: 1, metal: .06, color: 0xffd34d, behaviors: ['rushStation'] },
  hunter: { hp: 22, spd: 118, r: 11, dmg: 0,  xp: 4, metal: .40, color: 0xff8a3d, behaviors: ['chaseShip'] },
  gunner: { hp: 34, spd: 62,  r: 13, dmg: 14, xp: 6, metal: .60, color: 0xb98bff, behaviors: ['standoffShoot'] },
};

// Tham số của từng hành vi.
export const BEHAVIOR = {
  rushStation: { atkCd: 1, firstAtk: .4 },
  standoffShoot: { range: 330, fireCd: 2.6, firstFire: [1, 2.4], bulletSpd: 115, bulletR: 6 },
  knockback: { decay: .02, onShipHit: 260 },
};
