# Thủ Thành Không Gian

Game thủ thành 2D bối cảnh không gian, chạy trên trình duyệt máy tính. Người chơi điều khiển một máy bay bảo vệ trạm không gian ở giữa màn hình khỏi các đợt kẻ địch.

Ngôn ngữ giao tiếp với người dùng và chữ trong game: **tiếng Việt**.

## Công nghệ

- Phaser 3 (JavaScript), ưu tiên chạy trên trình duyệt máy tính, khung 16:9 (1280×720 logic), co giãn theo cửa sổ.
- Code chia thành ES module trong `src/`, không cần bước build. Vì dùng `type="module"` nên **phải chạy qua máy chủ cục bộ** (vd. `python -m http.server 8000` rồi mở `http://localhost:8000`); mở thẳng file `index.html` sẽ không chạy.
- Cấu trúc thư mục:
  - `index.html` — chỉ chứa khung HTML; chữ tĩnh gắn qua `data-i18n` / `data-i18n-html`.
  - `src/data/` — số liệu cân bằng: `player.js` (máy bay, trạm, special, cấp, vật phẩm), `enemies.js`, `bosses.js` (pha = danh sách hành vi), `cards.js` (số liệu trong `v`), `stages.js` (màn, nhóm địch, công thức đợt, hệ số theo đợt).
  - `src/lang/` — `vi.js` chứa toàn bộ chữ hiển thị (cả mô tả thẻ), `index.js` có `t('khóa', ...tham số)`.
  - `src/core/` — `state.js` (trạng thái trận `G`, chỉ đổi qua `setRun`), `events.js` (kênh sự kiện), `save.js` (bản lưu có số phiên bản, chuyển đổi, xuất/nhập mã).
  - `src/game/` — logic: `step.js` (vòng lặp), `waves.js`, `enemies.js` + `behaviors.js`, `bosses.js` (hành vi boss), `combat.js`, `cards.js`, `fx.js`.
  - `src/ui/` — DOM: `flow.js` (luồng màn hình, phím), `hud.js`, `cards.js`, `banner.js`. `src/render/draw.js` — vẽ bằng Phaser.
- Sự kiện đang phát: `hit`, `kill`, `levelUp`, `lifeLost`, `shieldBreak`, `special`, `cardPicked`, `bossSpawn`, `runOver`.
- Chưa làm: object pool, lưới không gian cho va chạm, giao diện xuất/nhập mã lưu (đã có hàm `exportCode`/`importCode`).
- Về sau có thể đóng gói thành ứng dụng máy tính (Steam) và tối ưu cho điện thoại.

## Kiến trúc mục tiêu

- **Dữ liệu tách khỏi code:** kẻ địch, boss, thẻ, cây nâng cấp, màn chơi nằm trong file cấu hình (`src/data/*.js` hoặc JSON). Cân bằng game bằng cách sửa số, không sửa logic.
- **Hiệu ứng gắn vào sự kiện:** thẻ nâng cấp "nghe" các sự kiện như `onHit`, `onKill`, `onLevelUp`, `onLifeLost`, `onShieldBreak`.
- **Kẻ địch ghép từ hành vi:** lao vào trạm, đuổi máy bay, dừng và bắn, tàng hình, vỡ khi chết. Boss: mỗi pha là một tổ hợp hành vi.
- **Hiệu năng:** tái sử dụng đối tượng (object pool) cho đạn và địch; chia lưới không gian cho va chạm; giới hạn số vụ nổ.
- **Bản lưu có số phiên bản** để chuyển đổi khi cập nhật; lưu trong trình duyệt, có xuất/nhập mã lưu.
- **Chữ hiển thị nằm trong file ngôn ngữ**, không viết thẳng vào code.

## Luật chơi cốt lõi

- Trạm ở giữa; địch đến từ bốn phía rìa. Máy bay **tự bắn** địch gần nhất, người chơi chỉ di chuyển.
- Thua khi **máy bay hết mạng** hoặc **trạm hết máu**. Chạm địch hoặc trúng đạn: mất khiên, không có khiên thì mất 1 mạng, bất tử ~2 giây.
- Mạng: bắt đầu 2 (chưa chốt 1 hay 2), tối đa 5. Khiên: chặn 1 đòn, tự hồi sau 15–20 giây.
- Khoảng 80% địch chỉ lao vào trạm; loại biết bắn mở dần và giới hạn 3–4 con cùng lúc. Đạn địch chậm, màu nổi; máy bay bắn hạ được đạn pháo thủ.

## Tiến triển

- **Trong trận:** địch rơi **kinh nghiệm** (lên cấp → chọn 1 trong 3 thẻ, game tạm dừng) và **mảnh kim loại** (giữ lại sau trận). Vật phẩm phải bay tới nhặt, tồn tại ~15 giây; hết đợt tự bay về máy bay.
- **Ngoài trận:** mảnh kim loại mua nút chỉ số; **lõi boss** (một loại chung, chỉ rơi khi hạ mỗi boss **lần đầu**, boss phụ 1 lõi, boss chính 3 lõi) mua nút mấu chốt và đột phá trần chỉ số.
- **Cây nâng cấp ngoài trận:** 7 nhánh gom 3 nhóm tab — Chiến đấu (Máy bay, Trạm, Diệt boss), Phát triển (Tăng trưởng, May mắn, Chiến thuật), Tài nguyên (Kinh tế). Mỗi nhánh: thân chung rẽ 2 đường, **mỗi nhánh chỉ chọn 1 nút đỉnh**. Mỗi nút có số cấp tối đa giảm dần theo tầng; mỗi chỉ số có **trần tổng**, đạt trần thì nút hiện "Đã đạt tối đa", không mua được nhưng tính là hoàn thành để mở nút sau. Có nút giao giữa các nhánh. Đặt lại lõi tốn mảnh kim loại, lần đầu miễn phí.
- Nhánh Diệt boss tác động lên cả boss phụ và boss chính.

## Chế độ chơi

- **Chế độ Màn:** mỗi màn là một trận riêng, 15 đợt; boss phụ ở đợt 5 và 10, boss chính ở đợt 15. Hạ boss chính → về căn cứ, mở màn sau. Mức sàn độ khó nhân theo màn (gợi ý ×1, ×2.5, ×6), thưởng cũng nhân theo. Đánh giá sao là gợi ý, chưa chốt.
- **Chế độ Endless:** mở sau màn 1, bối cảnh xoay vòng mỗi 15 đợt, chỉ dùng địch và boss của các màn đã vượt, boss mỗi 5 đợt, không rơi lõi, có mốc thưởng 25/50/75/100.
- Đã bỏ "Tiếp tục endless" sau khi qua màn.

| Màn | Bối cảnh | Địch mới | Boss chính |
|---|---|---|---|
| 1 | Quỹ đạo hành tinh | Drone, bầy ong, kẻ săn, pháo thủ | Tàu mẹ |
| 2 | Vành đai thiên thạch | Thiên thạch giáp, kẻ phân tách, kẻ xuyên giáp | Pháo đài di động |
| 3 | Tinh vân | Bóng ma, tàu hồi máu, kẻ phá khiên | Kẻ săn đầu đàn |
| 4 | Gần lỗ đen | Xạ thủ săn + tinh anh 2 đặc tính | Kẻ nuốt sao |

Boss phụ màn 1–4: Bầy ong chúa / Pháo thủ hạng nặng; Thiên thạch mẹ / Mũi khoan; Bóng ma đôi / Tàu hồi máu mẹ; Xạ thủ hai nòng / Kẻ phá khiên lớn. Boss: báo trước đòn ≥0.8 giây, chuyển pha bất tử 1.5 giây và xóa đạn, mỗi pha tối thiểu ~8 giây, mỗi boss chính có điểm yếu.

Địch tinh anh (từ màn 2): Cuồng nộ, Khổng lồ, Có khiên, Tự hủy, Tái sinh. Sức mạnh theo đợt: máu ×1.08, sát thương lên trạm ×1.04, tốc độ tăng nhẹ có giới hạn.

## Thẻ nâng cấp trong trận

- Nhóm Máy bay, Đạn, Trạm, Special, Dự phòng. **Không giới hạn số loại thẻ.**
- Tỉ lệ: Thường 62% · Hiếm 30% · Huyền thoại 8%. Thẻ đã có trọng số ×1.5, luôn có ít nhất 1 thẻ mới; 3 lần không thấy thẻ hiếm thì lần sau chắc chắn có.
- "Tăng sát thương theo mạng" (+8%/mạng) và "Liều mạng" (3 mạng +10%, 2 +25%, 1 +50%) **loại trừ nhau**.
- Tăng sát thương theo phần trăm **cộng**, không nhân. Trần: giáp trạm 60%, chí mạng 50%, 5 mạng, 4 lần nảy.
- Nảy + nổ: vụ nổ từ lần nảy chỉ còn một nửa; tia phụ chỉ hưởng chí mạng; vụ nổ không kích hoạt vụ nổ khác.
- Tiến hóa (mở bằng lõi boss): Đạn chuỗi sét, Bão đạn, Pháo đài phản kích, Mạng lưới phòng thủ, Giáp năng lượng.
- Rương boss: chọn 1 trong 3 thẻ hiếm hoặc huyền thoại.

## Special

Chọn **1 special trước trận**, nạp bằng kinh nghiệm nhặt được: Bom tinh vân (có sẵn), Lao xung kích (vượt màn 1), Phi đội hộ tống (hạ 1.000 địch), Lá chắn tuyệt đối (vượt màn 2), Ngưng đọng thời gian (vượt màn 3). Dùng special xong khiên hồi ngay; bom chỉ gây phần trăm cố định lên boss.

## Điều khiển và giao diện

- Web máy tính: **chọn trong cài đặt**, mặc định bàn phím. Bàn phím WASD/mũi tên, Space special, 1-2-3 chọn thẻ, Esc/P tạm dừng. Chuột: bay theo con trỏ (có vùng chết, không dịch chuyển tức thời) hoặc giữ chuột trái để bay; chuột phải special.
- Tự tạm dừng khi chuyển tab hoặc mất focus.
- Luồng màn hình: Màn hình chính → Căn cứ (Xuất kích, Nâng cấp, Special, Hồ sơ) → Chọn màn/Endless → Chuẩn bị → Trận → Kết quả.
- HUD: giữa màn hình trống; máu trạm hiện cả ở góc và vòng quanh trạm; mũi tên cảnh báo địch ngoài màn hình.

## Trạng thái hiện tại (bản chơi thử 1)

Đã có: màn 1 đầy đủ 15 đợt và 3 boss, 4 loại địch, 21 thẻ, khiên, mạng, Bom tinh vân, cài đặt điều khiển, lưu tổng mảnh kim loại và đợt cao nhất.

Code đã tách module (xem "Công nghệ"); bản lưu chuyển từ khóa `ttkg-v1` sang `ttkg-save` (phiên bản 2), tự đọc bản cũ.

Chưa có: cây nâng cấp ngoài trận, lõi boss, căn cứ, chọn màn, các special khác, tiến hóa, rương boss, địch tinh anh, màn 2–4, chế độ Endless, âm thanh.

## Quy ước làm việc

- Mỗi thay đổi lớn: chạy thử trên trình duyệt trước khi commit.
- Commit nhỏ, thông điệp rõ ràng bằng tiếng Việt.
- Khi thêm tính năng mới, cập nhật mục "Trạng thái hiện tại".
