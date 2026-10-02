export const $ = id => document.getElementById(id);
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
