// Special: chọn 1 trước trận, nạp bằng kinh nghiệm nhặt được. Tên và mô tả trong file ngôn ngữ (specials.<id>).
// unlock: null (có sẵn) | { stage: n } (vượt màn n) | { kills: n } (tổng số địch đã hạ).
export const SPECIALS = {
  bomb: { cost: 100, unlock: null, dmg: 50, dmgPerWave: 8, bossPct: .06 },
  dash: { cost: 70, unlock: { stage: 1 }, dist: 300, dur: .22, width: 26, dmg: 70, dmgPerWave: 9, bossPct: .03 },
  escort: { cost: 100, unlock: { kills: 1000 }, n: 3, dur: 10, orbit: 46, range: 420, rate: 4, dmg: 6, perWave: .08 },
  aegis: { cost: 110, unlock: { stage: 2 }, dur: 6 },
  timestop: { cost: 120, unlock: { stage: 3 }, dur: 4, bossSlow: .25 },
};

export const SPECIAL_ORDER = ['bomb', 'dash', 'escort', 'aegis', 'timestop'];
