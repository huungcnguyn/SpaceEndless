// Kênh sự kiện đồng bộ. Thẻ nâng cấp và giao diện "nghe" sự kiện thay vì gọi thẳng vào nhau.
// Sự kiện trong trận: hit, kill, levelUp, lifeLost, shieldBreak, special, bossSpawn, runOver.
const handlers = new Map();

export function on(name, fn) {
  if (!handlers.has(name)) handlers.set(name, new Set());
  handlers.get(name).add(fn);
  return () => off(name, fn);
}

export function off(name, fn) { handlers.get(name)?.delete(fn); }

export function emit(name, ...args) {
  const set = handlers.get(name);
  if (set) for (const fn of [...set]) fn(...args);
}
