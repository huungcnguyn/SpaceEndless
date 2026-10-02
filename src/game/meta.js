// Tiến triển ngoài trận: cây nâng cấp, mở khóa special, áp chỉ số vào trận mới.
import { SAVE, persist } from '../core/save.js';
import { STATS, NODES, SLOT_COST, SLOT_REQ, RESET_COST, KEYS } from '../data/tree.js';
import { SPECIALS } from '../data/specials.js';
import { CARD_BY_ID } from '../data/cards.js';
import { STATION, SHIP } from '../data/player.js';

export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]));
const EPS = 1e-9;

export const level = (id, tree = SAVE.tree) => tree[id] || 0;

export function statSum(stat, tree = SAVE.tree) {
  let s = 0;
  for (const n of NODES) if (n.stat === stat) s += level(n.id, tree) * n.per;
  return s;
}

export function statCap(stat, tree = SAVE.tree) {
  let c = STATS[stat].cap;
  for (const n of NODES) if (n.brk === stat) c += level(n.id, tree) * n.per;
  return c;
}

export const statValue = (stat, tree = SAVE.tree) => Math.min(statSum(stat, tree), statCap(stat, tree));

// Nút yêu cầu: theo ô trong nhánh, hoặc danh sách riêng (nút giao).
export function requires(n) {
  if (n.req) return n.req.map(id => NODE_BY_ID[id]);
  const s = SLOT_REQ[n.slot];
  return s ? NODES.filter(o => o.b === n.b && o.slot === s) : [];
}

// Đã đạt cấp tối đa, hoặc chỉ số đã chạm trần.
export const isMaxed = n => level(n.id) >= n.max;
export const isCapped = n => !!n.stat && statSum(n.stat) >= statCap(n.stat) - EPS;
export const isComplete = n => isMaxed(n) || isCapped(n);

export function nodeCost(n) {
  const [cur, base, grow] = SLOT_COST[n.slot];
  return { cur, amount: Math.round(base * Math.pow(grow, level(n.id))) };
}

// Nút đỉnh khác trong cùng nhánh đã được chọn.
export function blockedBy(n) {
  if (!n.key) return null;
  return NODES.find(o => o.b === n.b && o.key && o.id !== n.id && level(o.id) > 0) || null;
}

// Trạng thái hiển thị: maxed | capped | locked | blocked | open.
export function nodeState(n) {
  if (isMaxed(n)) return 'maxed';
  if (isCapped(n)) return 'capped';
  if (!requires(n).every(isComplete)) return 'locked';
  if (blockedBy(n)) return 'blocked';
  return 'open';
}

export const canAfford = c => (c.cur === 'core' ? SAVE.cores : SAVE.metal) >= c.amount;

export function buyNode(id) {
  const n = NODE_BY_ID[id];
  if (!n || nodeState(n) !== 'open') return false;
  const c = nodeCost(n);
  if (!canAfford(c)) return false;
  if (c.cur === 'core') SAVE.cores -= c.amount; else SAVE.metal -= c.amount;
  SAVE.tree[id] = level(id) + 1;
  persist();
  return true;
}

// Lõi đã dùng cho nút đỉnh và nút đột phá.
export function coresSpent() {
  let s = 0;
  for (const n of NODES) if (SLOT_COST[n.slot][0] === 'core') s += level(n.id) * SLOT_COST[n.slot][1];
  return s;
}

export const resetCost = () => SAVE.resetUsed ? Math.round(RESET_COST * (1 - statValue('resetDiscount'))) : 0;

export function resetCores() {
  const spent = coresSpent(), cost = resetCost();
  if (!spent || SAVE.metal < cost) return false;
  SAVE.metal -= cost; SAVE.resetUsed = true; SAVE.cores += spent;
  for (const n of NODES) if (SLOT_COST[n.slot][0] === 'core') delete SAVE.tree[n.id];
  persist();
  return true;
}

/* ---------- Special ---------- */
export function specialUnlocked(id) {
  const u = SPECIALS[id].unlock;
  if (!u) return true;
  if (u.stage) return !!SAVE.stages[u.stage]?.cleared;
  if (u.kills) return SAVE.totalKills >= u.kills;
  return false;
}

export const currentSpecial = () => specialUnlocked(SAVE.special) ? SAVE.special : 'bomb';

/* ---------- Áp vào trận ---------- */
export function computeMeta(tree = SAVE.tree) {
  const stats = {};
  for (const k of Object.keys(STATS)) stats[k] = statValue(k, tree);
  const keys = new Set(NODES.filter(n => n.key && level(n.id, tree) > 0).map(n => n.key));
  return { stats, keys };
}

function giveCard(G, id) {
  const c = CARD_BY_ID[id], l = (G.owned[id] || 0) + 1;
  G.owned[id] = l; c.apply(G, l, c.v);
  if (c.ex) G.banned.add(c.ex);
}

export function applyMeta(G) {
  const m = computeMeta(), s = m.stats, p = G.p, st = G.st;
  G.meta = m;
  p.dmgPct += s.shipDmg;
  p.rate *= 1 + s.shipRate;
  p.speed *= 1 + s.shipSpeed;
  p.magnet += s.magnet;
  p.shieldCd = SHIP.shieldCd * (1 - s.shieldCd);
  p.critBase = s.startCrit; p.critCh = s.startCrit;
  st.base = st.max = st.hp = STATION.hp * (1 + s.stHp);
  st.armorBase = st.armor = s.stArmor;
  st.regenBase = st.regen = s.stRegen;
  G.sp.gain += s.spCharge;
  G.pending += s.freeCards; G.startPicks = s.freeCards;
  if (m.keys.has('spreadStart')) giveCard(G, 'spread');
  if (m.keys.has('extraLife')) p.lives = Math.min(p.maxLives, p.lives + 1);
  if (m.keys.has('startTurret')) giveCard(G, 'turret');
  if (m.keys.has('startShield')) giveCard(G, 'shield');
  if (m.keys.has('spFull')) G.sp.energy = G.sp.cost;
  if (m.keys.has('reroll')) G.rerolls = KEYS.rerolls;
}
