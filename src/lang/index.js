// Tra chữ theo khóa dạng 'menu.start'. Giá trị là hàm thì gọi với các tham số còn lại.
import vi from './vi.js';

const LANGS = { vi };
let cur = vi;

export function setLang(code) { cur = LANGS[code] || vi; }

export function t(key, ...args) {
  let v = cur;
  for (const k of key.split('.')) { v = v == null ? undefined : v[k]; }
  if (v === undefined) { console.warn('Thiếu chữ:', key); return key; }
  return typeof v === 'function' ? v(...args) : v;
}

// Điền chữ cho phần HTML tĩnh: data-i18n (text), data-i18n-html (có thẻ), data-i18n-title, data-i18n-ph, data-i18n-aria.
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  root.querySelectorAll('[data-i18n-html]').forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  root.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  root.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  root.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.title = t('title');
}
