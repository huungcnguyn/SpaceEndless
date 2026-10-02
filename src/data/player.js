// Chỉ số khởi đầu của máy bay, trạm, special và các công thức tiến triển trong trận.
export const SHIP = {
  r: 11, startDy: 120,
  dmg: 10, rate: 3, speed: 270, magnet: 70, range: 700,
  lives: 2, maxLives: 5,
  shieldCd: 18, invHit: 2, invShield: 1,
  bulletSpd: 640, bulletLife: 1.1, spreadAngle: .16,
  // Số viên chẵn: cặp giữa bay song song cách nhau 2 × spreadGap để luôn có đạn trúng mục tiêu.
  spreadGap: 6,
};

export const STATION = { hp: 400, waveHeal: .04, firstShock: 6 };

// Năng lượng special nạp theo kinh nghiệm nhặt được: mỗi điểm kinh nghiệm cho xpGain năng lượng.
export const SPECIAL = { xpGain: 2.2 };

export const LEVEL = { base: 7, growth: 1.17 };
export const need = l => Math.floor(LEVEL.base * Math.pow(LEVEL.growth, l - 1));

export const LOOT = {
  life: 15, magnetSpd: 460, pullSpd: 700,
  bossXpPieces: 12, bossXpMul: 3, bossMetalPieces: 8, bossMetalBase: 3,
  metalBase: 1, metalPerWaves: 4,
};
