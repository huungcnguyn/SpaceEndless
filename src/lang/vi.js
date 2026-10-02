// Chữ hiển thị tiếng Việt. Giá trị có thể là chuỗi, hoặc hàm nhận tham số và trả về chuỗi.
import { SHIP } from '../data/player.js';

const pct = x => Math.round(x * 100);

export default {
  title: 'Thủ Thành Không Gian',

  hud: {
    ship: 'Máy bay', station: 'Trạm', shield: 'Khiên',
    wave: (w, total) => `Đợt ${w}<small>/ ${total}</small>`,
    level: l => `Cấp ${l}`,
    metal: m => `${m} mảnh`,
    dmg: p => `Sát thương <b>+${p}%</b>`,
    pause: 'II  Tạm dừng',
    special: 'BOM<br>TINH VÂN',
    hintKeyboard: 'WASD / phím mũi tên để bay · Space: special · Esc: tạm dừng',
    hintMouse: 'Chuột để bay · chuột phải: special · Esc: tạm dừng',
  },

  menu: {
    eyebrow: 'Bản chơi thử · Màn 1 · Quỹ đạo hành tinh',
    title: 'Thủ Thành <em>Không Gian</em>',
    lead: 'Bảo vệ trạm qua <b>15 đợt</b> và hạ <b>3 boss</b>. Máy bay tự bắn, bạn lo di chuyển, chặn địch và né. Chạm địch hoặc trúng đạn là mất mạng; trạm hết máu cũng thua.',
    control: 'Điều khiển', controlAria: 'Kiểu điều khiển', keyboard: 'Bàn phím', mouse: 'Chuột',
    mouseMode: 'Kiểu chuột', mouseFollow: 'Bay theo con trỏ', mouseHold: 'Giữ chuột trái để bay',
    start: 'Xuất kích',
    totalMetal: 'Mảnh kim loại tích lũy:', bestWave: 'Đợt cao nhất:',
    note: 'Cây nâng cấp ngoài trận, special khác và các màn sau có ở bản tiếp theo.',
  },

  keys: {
    keyboard: [['WASD / ← ↑ → ↓', 'Bay'], ['Space', 'Bom tinh vân khi thanh năng lượng đầy'], ['1 · 2 · 3', 'Chọn thẻ khi lên cấp'], ['Esc / P', 'Tạm dừng']],
    mouse: follow => [[follow ? 'Di chuột' : 'Giữ chuột trái', 'Máy bay bay về phía con trỏ'], ['Chuột phải', 'Bom tinh vân khi thanh năng lượng đầy'], ['Nhấp thẻ', 'Chọn nâng cấp khi lên cấp'], ['Esc', 'Tạm dừng']],
  },

  cardsUi: {
    title: l => `Lên cấp ${l}`,
    subMany: n => `Chọn 1 nâng cấp · còn ${n} lần chọn`,
    sub: 'Chọn 1 nâng cấp · phím 1, 2, 3 hoặc nhấp vào thẻ',
    lives: (a, b) => `${a} → ${b} mạng`,
    level: (a, b, max) => `Cấp ${a} → ${b}${max ? ' (tối đa)' : ''}`,
    new: 'Mới',
    exclusive: name => `Không thể chọn cùng: ${name}`,
    none: 'Chưa có nâng cấp',
  },

  pause: { eyebrow: 'Tạm dừng', title: 'Trận đang chờ', resume: 'Tiếp tục', quit: 'Bỏ cuộc' },

  result: {
    eyebrow: 'Kết quả', eyebrowLose: 'Trận kết thúc', eyebrowWin: 'Màn 1 · Quỹ đạo hành tinh',
    win: 'Màn 1 hoàn thành', station: 'Trạm bị phá hủy', quit: 'Đã rút lui', ship: 'Máy bay bị hạ',
    leadWin: 'Bạn đã hạ cả 3 boss và giữ được trạm. Mảnh kim loại được cộng vào kho để dùng cho cây nâng cấp ở bản sau.',
    leadLose: 'Mảnh kim loại nhặt được vẫn được giữ lại. Thử đổi hướng build hoặc ưu tiên chặn địch sớm hơn.',
    wave: 'Đợt đạt được', kills: 'Địch đã hạ', level: 'Cấp', metal: 'Mảnh kim loại',
    again: 'Chơi lại', menu: 'Về menu',
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
    bossDownSub: 'Nhận nhiều kinh nghiệm và mảnh kim loại',
    stageClear: 'Màn 1 hoàn thành',
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
    charge: { name: 'Nạp năng lượng', d: (l, v) => `Bom tinh vân nạp nhanh hơn ${pct(v.per * l)}%` },
    'fb-heal': { name: 'Sửa chữa trạm', d: (l, v) => `Hồi ${pct(v.pct)}% máu tối đa của trạm` },
    'fb-sp': { name: 'Nạp đầy special', d: () => 'Bom tinh vân sẵn sàng ngay' },
    'fb-metal': { name: 'Thu gom phế liệu', d: (l, v) => `Nhận ngay ${v.amount} mảnh kim loại` },
  },
};
