// Chữ hiển thị tiếng Việt. Giá trị có thể là chuỗi, hoặc hàm nhận tham số và trả về chuỗi.
import { SHIP } from '../data/player.js';
import { KEYS } from '../data/tree.js';

const pct = x => Math.round(x * 100);
const num = x => +x.toFixed(2);
// Hiển thị giá trị chỉ số cây nâng cấp theo kiểu fmt trong src/data/tree.js.
const fmt = (v, f) => f === 'pct' ? `${pct(v)}%` : f === 'pps' ? `${num(v * 100)}%/giây` : f === 'sec' ? `${num(v)} giây` : `${num(v)}`;

export default {
  title: 'Thủ Thành Không Gian',

  hud: {
    ship: 'Máy bay', station: 'Trạm', shield: 'Khiên',
    wave: (w, total) => total ? `Đợt ${w}<small>/ ${total}</small>` : `Đợt ${w}<small>Endless</small>`,
    level: l => `Cấp ${l}`,
    metal: (m, c) => `${m} mảnh${c ? ` · ${c} lõi` : ''}`,
    dmg: p => `Sát thương <b>+${p}%</b>`,
    pause: 'II  Tạm dừng',
    hintKeyboard: 'WASD / phím mũi tên để bay · Space: special · Esc: tạm dừng',
    hintMouse: 'Chuột để bay · chuột phải: special · Esc: tạm dừng',
  },

  nav: { back: 'Quay lại', toBase: 'Về căn cứ', toMain: 'Màn hình chính' },
  res: { metal: n => `${n} mảnh kim loại`, cores: n => `${n} lõi boss` },

  menu: {
    eyebrow: 'Bản chơi thử',
    title: 'Thủ Thành <em>Không Gian</em>',
    lead: 'Bảo vệ trạm ở giữa màn hình khỏi các đợt kẻ địch. Máy bay tự bắn, bạn lo di chuyển, chặn địch và né. Chạm địch hoặc trúng đạn là mất mạng; trạm hết máu cũng thua.',
    control: 'Điều khiển', controlAria: 'Kiểu điều khiển', keyboard: 'Bàn phím', mouse: 'Chuột',
    mouseMode: 'Kiểu chuột', mouseFollow: 'Bay theo con trỏ', mouseHold: 'Giữ chuột trái để bay',
    start: 'Vào căn cứ',
    totalMetal: 'Mảnh kim loại:', totalCores: 'Lõi boss:',
    note: 'Màn 2–4, địch tinh anh và tiến hóa có ở bản sau.',
  },

  base: {
    eyebrow: 'Căn cứ', title: 'Trạm chỉ huy',
    sortie: 'Xuất kích', sortieSub: 'Chọn màn hoặc Endless',
    tree: 'Nâng cấp', treeSub: 'Cây nâng cấp ngoài trận',
    special: 'Special', specialSub: name => `Đang dùng: ${name}`,
    profile: 'Hồ sơ', profileSub: 'Thành tích và mã lưu',
  },

  stages: {
    eyebrow: 'Xuất kích', title: 'Chọn màn',
    label: n => `Màn ${n}`,
    names: { 1: 'Quỹ đạo hành tinh', 2: 'Vành đai thiên thạch', 3: 'Tinh vân', 4: 'Gần lỗ đen' },
    cleared: 'Đã vượt', best: (w, total) => `Đợt cao nhất: ${w}/${total}`, fresh: 'Chưa chơi',
    locked: n => `Vượt màn ${n} để mở`, soon: 'Sắp có',
    endless: 'Endless', endlessDesc: 'Đợt vô tận, boss mỗi 5 đợt, thưởng ở mốc 25 · 50 · 75 · 100. Không rơi lõi.',
    endlessBest: w => `Đợt cao nhất: ${w}`,
  },

  prep: {
    eyebrow: 'Chuẩn bị',
    stage: (n, name) => `Màn ${n} · ${name}`, endless: 'Endless',
    special: 'Special', change: 'Đổi special',
    bonuses: 'Hiệu ứng từ cây nâng cấp', none: 'Chưa có nâng cấp nào. Mua nút ở mục Nâng cấp trong căn cứ.',
    go: 'Xuất kích',
  },

  specialsUi: {
    eyebrow: 'Special', title: 'Chọn special',
    lead: 'Chọn 1 special trước trận. Special nạp bằng kinh nghiệm nhặt được; dùng xong khiên hồi ngay.',
    cost: n => `Cần ${n} năng lượng`,
    using: 'Đang dùng', select: 'Chọn',
    unlockStage: n => `Mở khi vượt màn ${n}`,
    unlockKills: (n, have) => `Mở khi hạ ${n} địch (${Math.min(have, n)}/${n})`,
  },

  // Special: short hiện trên nút HUD.
  specials: {
    bomb: { name: 'Bom tinh vân', short: 'BOM<br>TINH VÂN', d: v => `Gây ${v.dmg} (+${v.dmgPerWave} mỗi đợt) sát thương lên mọi địch và xóa đạn địch. Lên boss chỉ gây ${pct(v.bossPct)}% máu.` },
    dash: { name: 'Lao xung kích', short: 'LAO<br>XUNG KÍCH', d: v => `Lướt ${v.dist} theo hướng đang bay, bất tử khi lướt, gây ${v.dmg} (+${v.dmgPerWave} mỗi đợt) sát thương và phá đạn trên đường.` },
    escort: { name: 'Phi đội hộ tống', short: 'PHI<br>ĐỘI', d: v => `Gọi ${v.n} máy bay hộ tống bay quanh và tự bắn trong ${v.dur} giây.` },
    aegis: { name: 'Lá chắn tuyệt đối', short: 'LÁ<br>CHẮN', d: v => `Trạm và máy bay không nhận sát thương trong ${v.dur} giây.` },
    timestop: { name: 'Ngưng đọng thời gian', short: 'NGƯNG<br>ĐỌNG', d: v => `Địch và đạn địch đứng yên trong ${v.dur} giây; boss chậm lại còn ${pct(v.bossSlow)}% tốc độ.` },
  },

  profile: {
    eyebrow: 'Hồ sơ', title: 'Hồ sơ phi công',
    runs: 'Số trận', wins: 'Lần vượt màn', kills: 'Địch đã hạ', best: 'Đợt cao nhất',
    endless: 'Endless cao nhất', cores: 'Lõi boss', metal: 'Mảnh kim loại', spent: 'Lõi đã dùng',
    bosses: 'Boss đã hạ', bossNone: 'Chưa hạ boss nào', bossCount: (name, n) => `${name} ×${n}`,
    save: 'Mã lưu',
    saveHint: 'Sao chép mã để chuyển bản lưu sang máy khác. Dán mã vào ô rồi bấm Nhập để thay bản lưu hiện tại.',
    copy: 'Sao chép mã', copied: 'Đã sao chép', import: 'Nhập mã', importPh: 'Dán mã lưu vào đây',
    importConfirm: 'Thay toàn bộ bản lưu hiện tại bằng mã này? Không thể hoàn tác.',
    importOk: 'Đã nhập bản lưu', importBad: 'Mã lưu không hợp lệ',
  },

  treeUi: {
    eyebrow: 'Nâng cấp', title: 'Cây nâng cấp',
    lead: 'Mảnh kim loại mua nút chỉ số; lõi boss mua nút đỉnh và đột phá trần. Mỗi nhánh chỉ chọn 1 nút đỉnh.',
    tabs: { combat: 'Chiến đấu', growth: 'Phát triển', resource: 'Tài nguyên' },
    branches: { ship: 'Máy bay', station: 'Trạm', boss: 'Diệt boss', growth: 'Tăng trưởng', luck: 'May mắn', tactics: 'Chiến thuật', economy: 'Kinh tế', cross: 'Nút giao' },
    crossOf: (a, b) => `${a} × ${b}`,
    level: (l, max) => `Cấp ${l}/${max}`,
    maxed: 'Đã đạt tối đa', locked: 'Hoàn thành nút trước để mở', blocked: name => `Đã chọn: ${name}`,
    keystone: 'Nút đỉnh', breakthrough: 'Đột phá',
    costMetal: n => `${n} mảnh`, costCore: n => `${n} lõi`,
    perLevel: (name, v) => `${name} +${v} mỗi cấp`,
    capRaise: (name, v) => `Trần ${name.toLowerCase()} +${v} mỗi cấp`,
    total: (cur, cap) => `Tổng ${cur} / trần ${cap}`,
    reset: n => n ? `Đặt lại lõi (${n} mảnh)` : 'Đặt lại lõi (miễn phí lần đầu)',
    resetConfirm: n => `Hoàn lại ${n} lõi đã dùng cho nút đỉnh và đột phá?`,
    resetNone: 'Chưa dùng lõi nào',
  },

  // Tên chỉ số cây nâng cấp và hàm định dạng giá trị.
  stat: {
    fmt,
    names: {
      shipDmg: 'Sát thương máy bay', shipRate: 'Tốc độ bắn', shipSpeed: 'Tốc độ bay', magnet: 'Bán kính hút',
      invBonus: 'Thời gian bất tử sau khi trúng đòn', stHp: 'Máu trạm', stArmor: 'Giáp trạm', stRegen: 'Hồi máu trạm',
      waveHeal: 'Hồi máu trạm sau mỗi đợt', bossDmg: 'Sát thương lên boss', bossXp: 'Kinh nghiệm từ boss',
      bombBoss: 'Sát thương bom lên boss', bossMetal: 'Mảnh kim loại từ boss', chestLegend: 'Thẻ huyền thoại trong rương',
      xpGain: 'Kinh nghiệm nhận được', spCharge: 'Tốc độ nạp special', freeCards: 'Thẻ chọn ngay đầu trận',
      pickupLife: 'Thời gian tồn tại của vật phẩm', rareLuck: 'Tỉ lệ thẻ hiếm', legendLuck: 'Tỉ lệ thẻ huyền thoại',
      startCrit: 'Chí mạng khởi đầu', metalDrop: 'Tỉ lệ rơi mảnh kim loại', shieldCd: 'Hồi khiên nhanh hơn',
      spPower: 'Sức mạnh special', spOnHit: 'Năng lượng special khi trúng đòn', metalGain: 'Mảnh kim loại cuối trận',
      waveMetal: 'Mảnh kim loại mỗi đợt', resetDiscount: 'Giảm giá đặt lại lõi',
    },
  },

  tree: {
    names: {
      ship1: 'Nòng pháo', ship2: 'Động cơ', ship3: 'Nạp đạn nhanh', ship4: 'Đạn xuyên giáp', ship5: 'Nam châm', ship6: 'Khung bền',
      shipK1: 'Xạ thủ', shipK2: 'Phi công át', shipB: 'Đột phá hỏa lực',
      st1: 'Vỏ trạm', st2: 'Giáp trạm', st3: 'Tự sửa chữa', st4: 'Vỏ gia cường', st5: 'Bảo trì giữa đợt', st6: 'Giáp kép',
      stK1: 'Pháo đài', stK2: 'Tái tạo', stB: 'Đột phá kết cấu',
      boss1: 'Đạn phá boss', boss2: 'Phân tích boss', boss3: 'Điểm yếu', boss4: 'Bom xuyên giáp', boss5: 'Chiến lợi phẩm', boss6: 'Rương quý',
      bossK1: 'Đòn kết liễu', bossK2: 'Rương lớn', bossB: 'Đột phá săn boss',
      gr1: 'Học hỏi', gr2: 'Năng lượng dồi dào', gr3: 'Tiếp thu nhanh', gr4: 'Khởi động', gr5: 'Vật phẩm bền', gr6: 'Hút xa',
      grK1: 'Lựa chọn thứ tư', grK2: 'Tái chọn', grB: 'Đột phá tăng trưởng',
      lk1: 'Vận may', lk2: 'Chí mạng bẩm sinh', lk3: 'Hên xui', lk4: 'Bàn tay vàng', lk5: 'Vận đỏ', lk6: 'Huyền thoại',
      lkK1: 'Bảo hiểm', lkK2: 'Phát tài', lkB: 'Đột phá chí mạng',
      tc1: 'Khiên nhanh', tc2: 'Phản xạ', tc3: 'Nạp special', tc4: 'Special mạnh', tc5: 'Khiên dày', tc6: 'Bẫy năng lượng',
      tcK1: 'Khiên khởi đầu', tcK2: 'Nạp sẵn', tcB: 'Đột phá năng lượng',
      ec1: 'Thu gom', ec2: 'Kho bảo quản', ec3: 'Tinh luyện', ec4: 'Thưởng đợt', ec5: 'Khai thác boss', ec6: 'Thương lượng',
      ecK1: 'Nam châm vàng', ecK2: 'Phế liệu quý', ecB: 'Đột phá kinh tế',
      x1: 'Liên kết hỏa lực', x2: 'Trạm khai thác', x3: 'Săn tiền thưởng',
    },
    // Mô tả hiệu ứng của nút đỉnh.
    keys: {
      spreadStart: 'Bắt đầu trận với thẻ Bắn tỏa cấp 1',
      extraLife: 'Bắt đầu trận với thêm 1 mạng',
      startTurret: 'Bắt đầu trận với thẻ Tháp pháo cấp 1',
      bossHeal: `Hạ boss: trạm hồi ${pct(KEYS.bossHealPct)}% máu`,
      finisher: `+${pct(KEYS.finisherDmg)}% sát thương lên boss còn dưới ${pct(KEYS.finisherHp)}% máu`,
      chest4: 'Rương boss cho chọn 1 trong 4 thẻ',
      card4: 'Lên cấp cho chọn 1 trong 4 thẻ',
      reroll: `${KEYS.rerolls} lần đổi thẻ mỗi trận`,
      pity2: 'Bảo hiểm thẻ hiếm sau 2 lần thay vì 3',
      jackpot: `${pct(KEYS.jackpotChance)}% mảnh kim loại nhặt được có giá trị ×${KEYS.jackpotMul}`,
      startShield: 'Bắt đầu trận với thẻ Khiên',
      spFull: 'Special đầy khi bắt đầu trận và sau mỗi lần hạ boss',
      metalPull: 'Mảnh kim loại luôn tự bay về máy bay',
      metalPlus: 'Mỗi mảnh kim loại nhặt được có giá trị +1',
    },
  },

  cardsUi: {
    title: l => `Lên cấp ${l}`,
    subMany: n => `Chọn 1 nâng cấp · còn ${n} lần chọn`,
    sub: n => `Chọn 1 nâng cấp · phím 1–${n} hoặc nhấp vào thẻ`,
    start: 'Thẻ khởi đầu', chest: 'Rương boss', chestSub: n => `Chọn 1 thẻ hiếm hoặc huyền thoại · phím 1–${n}`,
    reroll: n => `Đổi thẻ (còn ${n}) · R`,
    lives: (a, b) => `${a} → ${b} mạng`,
    level: (a, b, max) => `Cấp ${a} → ${b}${max ? ' (tối đa)' : ''}`,
    new: 'Mới',
    exclusive: name => `Không thể chọn cùng: ${name}`,
    none: 'Chưa có nâng cấp',
  },

  keys: {
    keyboard: [['WASD / ← ↑ → ↓', 'Bay'], ['Space', 'Dùng special khi thanh năng lượng đầy'], ['1 · 2 · 3 · 4', 'Chọn thẻ khi lên cấp · R đổi thẻ'], ['Esc / P', 'Tạm dừng']],
    mouse: follow => [[follow ? 'Di chuột' : 'Giữ chuột trái', 'Máy bay bay về phía con trỏ'], ['Chuột phải', 'Dùng special khi thanh năng lượng đầy'], ['Nhấp thẻ', 'Chọn nâng cấp khi lên cấp'], ['Esc', 'Tạm dừng']],
  },

  pause: { eyebrow: 'Tạm dừng', title: 'Trận đang chờ', resume: 'Tiếp tục', quit: 'Bỏ cuộc' },

  result: {
    eyebrow: 'Kết quả', eyebrowLose: 'Trận kết thúc', eyebrowWin: (n, name) => `Màn ${n} · ${name}`,
    win: n => `Màn ${n} hoàn thành`, station: 'Trạm bị phá hủy', quit: 'Đã rút lui', ship: 'Máy bay bị hạ',
    endless: 'Endless kết thúc',
    leadWin: 'Bạn đã hạ boss chính và giữ được trạm. Mảnh kim loại và lõi boss đã vào kho, dùng ở mục Nâng cấp trong căn cứ.',
    leadLose: 'Mảnh kim loại và lõi boss nhặt được vẫn được giữ lại. Thử đổi hướng build hoặc ưu tiên chặn địch sớm hơn.',
    leadEndless: w => `Bạn trụ được tới đợt ${w}. Mảnh kim loại nhặt được đã vào kho.`,
    bonus: n => `+${n} mảnh từ nâng cấp Kinh tế.`,
    unlocked: names => `Mở khóa mới: ${names}.`,
    wave: 'Đợt đạt được', kills: 'Địch đã hạ', cores: 'Lõi boss', metal: 'Mảnh kim loại',
    again: 'Chơi lại', menu: 'Về căn cứ',
  },

  banner: {
    start: ['Xuất kích', 'Bảo vệ trạm. Nhặt tinh thể xanh để lên cấp'],
    wave: w => `Đợt ${w}`,
    newEnemy: (name, desc) => `Địch mới: ${name}. ${desc}`,
    waveClear: w => `Đợt ${w} hoàn thành`,
    waveClearSub: 'Vật phẩm còn lại tự bay về máy bay',
    bossWarn: 'Cảnh báo boss',
    phase: n => `Pha ${n}`,
    bossDown: name => `Đã hạ ${name}`,
    bossDownSub: 'Nhặt rương boss để chọn thẻ hiếm',
    cores: n => `+${n} lõi boss (lần đầu hạ boss này)`,
    stageClear: n => `Màn ${n} hoàn thành`,
    milestone: w => `Mốc đợt ${w}`,
    milestoneSub: n => `Thưởng ${n} mảnh kim loại`,
  },

  intro: {
    bee: ['Bầy ong', 'Rất yếu nhưng đến theo đàn'],
    hunter: ['Kẻ săn', 'Bỏ qua trạm, đuổi theo máy bay'],
    gunner: ['Pháo thủ', 'Dừng ở xa và bắn vào trạm. Bắn hạ được đạn của chúng'],
  },

  bosses: {
    queen: { name: 'Bầy ong chúa' },
    heavy: { name: 'Pháo thủ hạng nặng' },
    mother: { name: 'Tàu mẹ', phases: { 2: 'Vòng đạn dày hơn, bầy ong xuất hiện', 3: 'Tàu mẹ lao về trạm. Hạ nó trước khi chạm tới!' } },
  },

  rarity: { common: 'Thường', rare: 'Hiếm', legend: 'Huyền thoại' },
  groups: { ship: 'Máy bay', bullet: 'Đạn', station: 'Trạm', special: 'Special', fallback: 'Dự phòng' },

  // Mô tả thẻ: d(cấp sau khi chọn, tham số v của thẻ).
  cards: {
    dmg: { name: 'Sát thương', d: (l, v) => `Sát thương +${pct(v.pct)}% (tổng +${pct(v.pct * l)}%)` },
    rate: { name: 'Tốc độ bắn', d: (l, v) => `Bắn nhanh hơn ${pct(v.mul - 1)}%` },
    speed: { name: 'Tốc độ bay', d: (l, v) => `Máy bay bay nhanh hơn ${pct(v.mul - 1)}%` },
    magnet: { name: 'Nam châm', d: (l, v) => `Bán kính hút tinh thể và mảnh kim loại +${v.add}` },
    spread: { name: 'Bắn tỏa', d: l => `Đạn chính chia ${l + 1} viên hình quạt về phía trước` },
    side: { name: 'Tia phụ', d: (l, v) => ['', `Thêm 2 tia bắn chéo hai bên (${pct(v.dmg[1])}% sát thương)`, 'Thêm 1 tia bắn phía sau', `Tia phụ mạnh hơn (${pct(v.dmg[3])}% sát thương)`][l] },
    shield: { name: 'Khiên', d: () => `Chặn 1 lần va chạm hoặc trúng đạn, tự hồi sau ${SHIP.shieldCd} giây` },
    shieldcd: { name: 'Hồi khiên nhanh', d: (l, v) => `Thời gian hồi khiên còn ${(SHIP.shieldCd * Math.pow(v.mul, l)).toFixed(1)} giây` },
    shielddmg: { name: 'Sát thương khi có khiên', d: (l, v) => `Khi khiên còn: +${pct(v.bonus[l])}% sát thương` },
    life: { name: 'Thêm mạng', d: () => `Nhận thêm 1 mạng (tối đa ${SHIP.maxLives})` },
    lifepow: { name: 'Sức mạnh sinh tồn', d: (l, v) => `+${pct(v.perLife)}% sát thương cho mỗi mạng đang có` },
    reckless: { name: 'Liều mạng', d: (l, v) => `Còn 3 mạng +${pct(v.byLives[3])}% · còn 2 +${pct(v.byLives[2])}% · còn 1 +${pct(v.byLives[1])}% sát thương` },
    bounce: { name: 'Đạn nảy', d: (l, v) => `Đạn chính nảy sang ${l} địch kế tiếp, mỗi lần nảy −${pct(1 - v.falloff)}% sát thương` },
    explode: { name: 'Đạn nổ', d: (l, v) => `Trúng địch gây nổ ${pct(v.pct[l])}% sát thương xung quanh` },
    crit: { name: 'Chí mạng', d: (l, v) => `${pct(v.per * l)}% tỉ lệ gây sát thương x${v.mul[l]}` },
    hp: { name: 'Máu trạm', d: (l, v) => `+${pct(v.pct)}% máu tối đa và hồi lượng máu tăng thêm` },
    armor: { name: 'Giáp trạm', d: (l, v) => `Trạm giảm ${pct(v.per * l)}% sát thương nhận vào` },
    regen: { name: 'Hồi máu trạm', d: (l, v) => `Trạm tự hồi ${(v.per * 100 * l).toFixed(1)}% máu mỗi giây` },
    turret: { name: 'Tháp pháo', d: l => `${l} tháp pháo tự bắn địch đến gần trạm` },
    shock: { name: 'Sóng xung kích', d: (l, v) => `Cứ ${v.cdBase - l} giây phát sóng gây sát thương và đẩy lùi địch quanh trạm` },
    thorns: { name: 'Giáp gai', d: (l, v) => `Địch bám vào trạm nhận ${v.dps * l} sát thương mỗi giây` },
    charge: { name: 'Nạp năng lượng', d: (l, v) => `Special nạp nhanh hơn ${pct(v.per * l)}%` },
    'fb-heal': { name: 'Sửa chữa trạm', d: (l, v) => `Hồi ${pct(v.pct)}% máu tối đa của trạm` },
    'fb-sp': { name: 'Nạp đầy special', d: () => 'Special sẵn sàng ngay' },
    'fb-metal': { name: 'Thu gom phế liệu', d: (l, v) => `Nhận ngay ${v.amount} mảnh kim loại` },
  },
};
