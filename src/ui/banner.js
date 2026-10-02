import { $ } from '../util.js';

let timer = 0;
export function banner(h, p, warn) {
  const b = $('banner'); $('bannerH').textContent = h; $('bannerP').textContent = p || '';
  b.classList.toggle('warn', !!warn); b.classList.add('show');
  clearTimeout(timer); timer = setTimeout(() => b.classList.remove('show'), 2200);
}
