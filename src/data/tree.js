// Cây nâng cấp ngoài trận. Tên và mô tả nằm trong file ngôn ngữ (tree.*).
//
// Mỗi nhánh có các ô (slot): thân chung t1 → t2, rẽ 2 đường l3 → l4 và r3 → r4, nút đỉnh kl / kr
// (mỗi nhánh chỉ chọn 1), và nút đột phá brk (nâng trần một chỉ số). Nút giao (cross) nối 2 nhánh.
// Nút sau mở khi nút trước "hoàn thành": đạt cấp tối đa, hoặc chỉ số của nó đã chạm trần.

// Chỉ số và trần tổng. fmt: cách hiển thị (pct: phần trăm, flat: số, sec: giây, pps: % mỗi giây).
export const STATS = {
  shipDmg: { cap: .2, fmt: 'pct' },
  shipRate: { cap: .15, fmt: 'pct' },
  shipSpeed: { cap: .12, fmt: 'pct' },
  magnet: { cap: 60, fmt: 'flat' },
  invBonus: { cap: .6, fmt: 'sec' },
  stHp: { cap: .4, fmt: 'pct' },
  stArmor: { cap: .2, fmt: 'pct' },
  stRegen: { cap: .0015, fmt: 'pps' },
  waveHeal: { cap: .06, fmt: 'pct' },
  bossDmg: { cap: .3, fmt: 'pct' },
  bossXp: { cap: .4, fmt: 'pct' },
  bombBoss: { cap: .04, fmt: 'pct' },
  bossMetal: { cap: .6, fmt: 'pct' },
  chestLegend: { cap: .3, fmt: 'pct' },
  xpGain: { cap: .3, fmt: 'pct' },
  spCharge: { cap: .3, fmt: 'pct' },
  freeCards: { cap: 2, fmt: 'flat' },
  pickupLife: { cap: 10, fmt: 'sec' },
  rareLuck: { cap: .5, fmt: 'pct' },
  legendLuck: { cap: .5, fmt: 'pct' },
  startCrit: { cap: .1, fmt: 'pct' },
  metalDrop: { cap: .3, fmt: 'pct' },
  shieldCd: { cap: .3, fmt: 'pct' },
  spPower: { cap: .2, fmt: 'pct' },
  spOnHit: { cap: 20, fmt: 'flat' },
  metalGain: { cap: .5, fmt: 'pct' },
  waveMetal: { cap: 6, fmt: 'flat' },
  resetDiscount: { cap: .5, fmt: 'pct' },
};

// Nhóm tab → các nhánh.
export const TABS = [
  { id: 'combat', branches: ['ship', 'station', 'boss'] },
  { id: 'growth', branches: ['growth', 'luck', 'tactics'] },
  { id: 'resource', branches: ['economy'] },
];

// Giá theo ô: [đơn vị, giá gốc, hệ số tăng mỗi cấp]. Giá cấp k (từ 0) = gốc × hệ số^k.
export const SLOT_COST = {
  t1: ['metal', 10, 1.35], t2: ['metal', 25, 1.35],
  l3: ['metal', 50, 1.4], r3: ['metal', 50, 1.4],
  l4: ['metal', 100, 1.45], r4: ['metal', 100, 1.45],
  kl: ['core', 2, 1], kr: ['core', 2, 1], brk: ['core', 1, 1],
  x: ['metal', 80, 1.5],
};

// Nút cần hoàn thành trước, theo ô.
export const SLOT_REQ = { t2: 't1', l3: 't2', r3: 't2', l4: 'l3', r4: 'r3', kl: 'l4', kr: 'r4', brk: 't2' };

// stat + per: cộng `per` vào chỉ số mỗi cấp. key: hiệu ứng đặc biệt của nút đỉnh. brk: nâng trần chỉ số `brk` thêm `per` mỗi cấp.
export const NODES = [
  // Máy bay
  { id: 'ship1', b: 'ship', slot: 't1', max: 5, stat: 'shipDmg', per: .03 },
  { id: 'ship2', b: 'ship', slot: 't2', max: 4, stat: 'shipSpeed', per: .03 },
  { id: 'ship3', b: 'ship', slot: 'l3', max: 3, stat: 'shipRate', per: .04 },
  { id: 'ship4', b: 'ship', slot: 'l4', max: 2, stat: 'shipDmg', per: .05 },
  { id: 'ship5', b: 'ship', slot: 'r3', max: 3, stat: 'magnet', per: 12 },
  { id: 'ship6', b: 'ship', slot: 'r4', max: 2, stat: 'invBonus', per: .25 },
  { id: 'shipK1', b: 'ship', slot: 'kl', max: 1, key: 'spreadStart' },
  { id: 'shipK2', b: 'ship', slot: 'kr', max: 1, key: 'extraLife' },
  { id: 'shipB', b: 'ship', slot: 'brk', max: 2, brk: 'shipDmg', per: .1 },
  // Trạm
  { id: 'st1', b: 'station', slot: 't1', max: 5, stat: 'stHp', per: .06 },
  { id: 'st2', b: 'station', slot: 't2', max: 4, stat: 'stArmor', per: .04 },
  { id: 'st3', b: 'station', slot: 'l3', max: 3, stat: 'stRegen', per: .0005 },
  { id: 'st4', b: 'station', slot: 'l4', max: 2, stat: 'stHp', per: .1 },
  { id: 'st5', b: 'station', slot: 'r3', max: 3, stat: 'waveHeal', per: .02 },
  { id: 'st6', b: 'station', slot: 'r4', max: 2, stat: 'stArmor', per: .04 },
  { id: 'stK1', b: 'station', slot: 'kl', max: 1, key: 'startTurret' },
  { id: 'stK2', b: 'station', slot: 'kr', max: 1, key: 'bossHeal' },
  { id: 'stB', b: 'station', slot: 'brk', max: 2, brk: 'stHp', per: .2 },
  // Diệt boss (tác động lên cả boss phụ và boss chính)
  { id: 'boss1', b: 'boss', slot: 't1', max: 5, stat: 'bossDmg', per: .04 },
  { id: 'boss2', b: 'boss', slot: 't2', max: 4, stat: 'bossXp', per: .1 },
  { id: 'boss3', b: 'boss', slot: 'l3', max: 3, stat: 'bossDmg', per: .05 },
  { id: 'boss4', b: 'boss', slot: 'l4', max: 2, stat: 'bombBoss', per: .02 },
  { id: 'boss5', b: 'boss', slot: 'r3', max: 3, stat: 'bossMetal', per: .2 },
  { id: 'boss6', b: 'boss', slot: 'r4', max: 2, stat: 'chestLegend', per: .15 },
  { id: 'bossK1', b: 'boss', slot: 'kl', max: 1, key: 'finisher' },
  { id: 'bossK2', b: 'boss', slot: 'kr', max: 1, key: 'chest4' },
  { id: 'bossB', b: 'boss', slot: 'brk', max: 2, brk: 'bossDmg', per: .1 },
  // Tăng trưởng
  { id: 'gr1', b: 'growth', slot: 't1', max: 5, stat: 'xpGain', per: .04 },
  { id: 'gr2', b: 'growth', slot: 't2', max: 4, stat: 'spCharge', per: .05 },
  { id: 'gr3', b: 'growth', slot: 'l3', max: 3, stat: 'xpGain', per: .05 },
  { id: 'gr4', b: 'growth', slot: 'l4', max: 2, stat: 'freeCards', per: 1 },
  { id: 'gr5', b: 'growth', slot: 'r3', max: 3, stat: 'pickupLife', per: 2 },
  { id: 'gr6', b: 'growth', slot: 'r4', max: 2, stat: 'magnet', per: 15 },
  { id: 'grK1', b: 'growth', slot: 'kl', max: 1, key: 'card4' },
  { id: 'grK2', b: 'growth', slot: 'kr', max: 1, key: 'reroll' },
  { id: 'grB', b: 'growth', slot: 'brk', max: 2, brk: 'xpGain', per: .1 },
  // May mắn
  { id: 'lk1', b: 'luck', slot: 't1', max: 5, stat: 'rareLuck', per: .06 },
  { id: 'lk2', b: 'luck', slot: 't2', max: 4, stat: 'startCrit', per: .02 },
  { id: 'lk3', b: 'luck', slot: 'l3', max: 3, stat: 'metalDrop', per: .05 },
  { id: 'lk4', b: 'luck', slot: 'l4', max: 2, stat: 'startCrit', per: .03 },
  { id: 'lk5', b: 'luck', slot: 'r3', max: 3, stat: 'rareLuck', per: .1 },
  { id: 'lk6', b: 'luck', slot: 'r4', max: 2, stat: 'legendLuck', per: .25 },
  { id: 'lkK1', b: 'luck', slot: 'kl', max: 1, key: 'pity2' },
  { id: 'lkK2', b: 'luck', slot: 'kr', max: 1, key: 'jackpot' },
  { id: 'lkB', b: 'luck', slot: 'brk', max: 2, brk: 'startCrit', per: .05 },
  // Chiến thuật
  { id: 'tc1', b: 'tactics', slot: 't1', max: 5, stat: 'shieldCd', per: .05 },
  { id: 'tc2', b: 'tactics', slot: 't2', max: 4, stat: 'invBonus', per: .1 },
  { id: 'tc3', b: 'tactics', slot: 'l3', max: 3, stat: 'spCharge', per: .06 },
  { id: 'tc4', b: 'tactics', slot: 'l4', max: 2, stat: 'spPower', per: .1 },
  { id: 'tc5', b: 'tactics', slot: 'r3', max: 3, stat: 'shieldCd', per: .05 },
  { id: 'tc6', b: 'tactics', slot: 'r4', max: 2, stat: 'spOnHit', per: 10 },
  { id: 'tcK1', b: 'tactics', slot: 'kl', max: 1, key: 'startShield' },
  { id: 'tcK2', b: 'tactics', slot: 'kr', max: 1, key: 'spFull' },
  { id: 'tcB', b: 'tactics', slot: 'brk', max: 2, brk: 'spCharge', per: .1 },
  // Kinh tế
  { id: 'ec1', b: 'economy', slot: 't1', max: 5, stat: 'metalGain', per: .06 },
  { id: 'ec2', b: 'economy', slot: 't2', max: 4, stat: 'pickupLife', per: 2 },
  { id: 'ec3', b: 'economy', slot: 'l3', max: 3, stat: 'metalGain', per: .08 },
  { id: 'ec4', b: 'economy', slot: 'l4', max: 2, stat: 'waveMetal', per: 2 },
  { id: 'ec5', b: 'economy', slot: 'r3', max: 3, stat: 'bossMetal', per: .15 },
  { id: 'ec6', b: 'economy', slot: 'r4', max: 2, stat: 'resetDiscount', per: .25 },
  { id: 'ecK1', b: 'economy', slot: 'kl', max: 1, key: 'metalPull' },
  { id: 'ecK2', b: 'economy', slot: 'kr', max: 1, key: 'metalPlus' },
  { id: 'ecB', b: 'economy', slot: 'brk', max: 2, brk: 'metalGain', per: .15 },
  // Nút giao giữa các nhánh
  { id: 'x1', b: 'cross', slot: 'x', max: 2, stat: 'shipDmg', per: .04, req: ['ship2', 'tc2'] },
  { id: 'x2', b: 'cross', slot: 'x', max: 3, stat: 'waveMetal', per: 1, req: ['st2', 'ec2'] },
  { id: 'x3', b: 'cross', slot: 'x', max: 2, stat: 'chestLegend', per: .1, req: ['boss2', 'lk2'] },
];

// Tham số của hiệu ứng nút đỉnh.
export const KEYS = {
  bossHealPct: .25,     // stK2: trạm hồi % máu khi hạ boss
  finisherHp: .3, finisherDmg: .3, // bossK1: thêm sát thương khi boss dưới ngưỡng máu
  rerolls: 2,           // grK2: số lần đổi thẻ mỗi trận
  jackpotChance: .1, jackpotMul: 3, // lkK2: mảnh kim loại nhân giá trị
};

// Đặt lại lõi: hoàn lõi đã dùng, tốn mảnh kim loại (lần đầu miễn phí).
export const RESET_COST = 150;
