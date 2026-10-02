// Boss: mỗi pha là một danh sách hành vi [tên, tham số] (xem src/game/bossBehaviors.js).
// `at`: phần máu còn lại (0–1) để chuyển sang pha đó.
export const BOSSES = {
  queen: {
    hp: 520, r: 30, xp: 30, color: 0xffd34d,
    phases: [
      { behaviors: [
        ['orbit', { R: 290, spd: 70 }],
        ['summon', { first: 2.5, cd: 3.6, type: 'bee', n: 6, spread: 24, override: { behaviors: ['chaseShip'], spd: 150, xp: .5 } }],
      ] },
    ],
  },
  heavy: {
    hp: 1250, r: 36, xp: 50, color: 0xb98bff,
    phases: [
      { behaviors: [
        ['orbit', { R: 410, spd: 55 }],
        ['chargedShot', { first: 2.5, cd: 3.4, tele: .9, spd: 95, r: 12, dmg: 55, hp: 30 }],
        ['fan', { first: 3.5, cd: 4.2, n: 5, step: .16, spd: 215 }],
      ] },
    ],
  },
  mother: {
    hp: 3000, r: 46, xp: 80, color: 0xff5a7e,
    phases: [
      { behaviors: [
        ['orbit', { R: 300, spd: 55 }],
        ['summon', { first: 2.5, cd: 5, type: 'drone', n: 4, spread: 30 }],
        ['ring', { first: 3.5, cd: 4, n: 18, spd: 150, gap: 3 }],
      ] },
      { at: .66, behaviors: [
        ['orbit', { R: 300, spd: 55 }],
        ['summon', { first: 2, cd: 4.5, type: 'bee', n: 8, spread: 30 }],
        ['ring', { first: 2, cd: 3.4, n: 18, spd: 150, gap: 3, echo: { delay: .45, spd: 125 } }],
      ] },
      { at: .33, behaviors: [
        ['ramStation', { spd: 24, cd: 2, dmg: 160 }],
      ] },
    ],
  },
};

// Quy tắc chung của mọi boss.
export const BOSS_RULES = { phaseInv: 1.5 };
