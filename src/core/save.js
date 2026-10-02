// Bản lưu có số phiên bản. Mỗi lần đổi cấu trúc: tăng VERSION và thêm một bước vào MIGRATIONS.
const KEY = 'ttkg-save';
const LEGACY_KEYS = ['ttkg-v1'];
export const VERSION = 2;

const defaults = () => ({ v: VERSION, control: 'keyboard', mouseMode: 'follow', metal: 0, best: 0 });

// MIGRATIONS[n] chuyển bản lưu phiên bản n lên n + 1.
const MIGRATIONS = {
  1: s => ({ ...s, v: 2 }), // bản ttkg-v1 chưa có trường v
};

function migrate(raw) {
  const s = { ...raw, v: raw.v || 1 };
  while (s.v < VERSION && MIGRATIONS[s.v]) Object.assign(s, MIGRATIONS[s.v](s));
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

// Mã lưu để chuyển giữa máy: JSON → base64 (an toàn với chữ có dấu).
export function exportCode() {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(SAVE))));
}

export function importCode(code) {
  const json = new TextDecoder().decode(Uint8Array.from(atob(code.trim()), c => c.charCodeAt(0)));
  const s = migrate(JSON.parse(json));
  for (const k of Object.keys(SAVE)) delete SAVE[k];
  Object.assign(SAVE, s);
  persist();
}
