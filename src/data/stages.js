// Màn chơi và công thức tạo đợt.
export const STAGES = {
  1: {
    waves: 15,
    bosses: { 5: 'queen', 10: 'heavy', 15: 'mother' },
    // Đợt bắt đầu xuất hiện từng nhóm địch.
    unlock: { drone: 1, bees: 3, hunter: 4, gunner: 6 },
    weight: { drone: 5, bees: 2, hunter: 2, gunner: 1.6 },
    cost: { drone: 1, bees: 4, hunter: 3, gunner: 5 },
    // Đợt giới thiệu địch mới (khóa trong file ngôn ngữ: intro.<type>).
    intro: { 3: 'bee', 4: 'hunter', 6: 'gunner' },
  },
};

// Nhóm sinh địch: một nhóm có thể gồm nhiều con.
export const GROUPS = {
  drone: { type: 'drone', n: 1 },
  bees: { type: 'bee', n: 8, gap: .06, spread: .12 },
  hunter: { type: 'hunter', n: 1 },
  gunner: { type: 'gunner', n: 1 },
};

export const WAVE = {
  budgetBase: 6, budgetPerWave: 4.2, bossBudgetMul: .35,
  dur: 11, durPerWave: .9, bossDur: 26, bossDelay: 4, bossSpawnAt: 3, jitter: .6,
  spreadUntil: 3, patterns: ['spread', 'spread', 'side', 'surround'],
  interFirst: 1.2, interAfter: 2.6, winDelay: 2.2,
};

// Sức mạnh địch tăng theo đợt.
export const SCALING = { hp: 1.08, dmg: 1.04, spdPer: .01, spdMax: 1.15, xpPer: .04 };
