// Bản lưu có số phiên bản. Mỗi lần đổi cấu trúc: tăng VERSION và thêm một bước vào MIGRATIONS.
const KEY = 'ttkg-save';
const LEGACY_KEYS = ['ttkg-v1'];
export const VERSION = 3;

const defaults = () => ({
  v: VERSION, control: 'keyboard', mouseMode: 'follow',
  metal: 0, cores: 0, best: 0, endlessBest: 0,
  stages: {},          // { [màn]: { cleared, best } }
  bossKills: {},       // { [loại boss]: số lần hạ }
  totalKills: 0, runs: 0, wins: 0,
  special: 'bomb',
  tree: {},            // { [id nút]: cấp }
  resetUsed: false,    // đã dùng lần đặt lại lõi miễn phí
});

// MIGRATIONS[n] chuyển bản lưu phiên bản n lên n + 1.
const MIGRATIONS = {
  1: s => ({ ...s, v: 2 }), // bản ttkg-v1 chưa có trường v
  2: s => ({ ...s, v: 3, stages: { 1: { cleared: false, best: s.best || 0 } } }),
};

function migrate(raw) {
  let s = { ...raw, v: raw.v || 1 };
  while (s.v < VERSION && MIGRATIONS[s.v]) s = MIGRATIONS[s.v](s);
  return { ...defaults(), ...s, v: VERSION };
}

function load() {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) for (const k of LEGACY_KEYS) { raw = localStorage.getItem(k); if (raw) break; }
    return raw ? migrate(JSON.parse(raw)) : defaults();
  } catch (e) { return defaults(); }
}

export const SAVE = load();

export function persist() { try { localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) {} }

export const stageSave = n => SAVE.stages[n] || (SAVE.stages[n] = { cleared: false, best: 0 });

// Mã lưu để chuyển giữa máy: JSON → base64 (an toàn với chữ có dấu).
export function exportCode() {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(SAVE))));
}

// Ném lỗi nếu mã không hợp lệ; bản lưu hiện tại giữ nguyên khi lỗi.
export function importCode(code) {
  const json = new TextDecoder().decode(Uint8Array.from(atob(code.trim()), c => c.charCodeAt(0)));
  const raw = JSON.parse(json);
  if (!raw || typeof raw !== 'object' || typeof raw.metal !== 'number') throw new Error('invalid');
  const s = migrate(raw);
  for (const k of Object.keys(SAVE)) delete SAVE[k];
  Object.assign(SAVE, s);
  persist();
}
