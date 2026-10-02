// Luật rút và chọn thẻ nâng cấp trong trận.
import { pick } from '../util.js';
import { G } from '../core/state.js';
import { emit } from '../core/events.js';
import { CARDS, FALLBACK, RARITY, CARD_RULES } from '../data/cards.js';

function cardAvail(c) {
  if (G.banned.has(c.id)) return false;
  const l = G.owned[c.id] || 0;
  if (c.id === 'life') return G.p.lives < G.p.maxLives;
  if (l >= c.max) return false;
  if (c.req && !G.owned[c.req]) return false;
  return true;
}

// chest: rương boss — chỉ thẻ hiếm và huyền thoại (thiếu thì bù thẻ thường rồi thẻ dự phòng).
export function rollCards(chest = false) {
  const m = G.meta, k = m.keys, st = m.stats;
  const N = (chest ? k.has('chest4') : k.has('card4')) ? 4 : CARD_RULES.choices;
  const isRare = c => c.r !== 'common';
  const all = CARDS.filter(cardAvail), out = [];
  const w = c => {
    let x = RARITY[c.r].w * (G.owned[c.id] ? CARD_RULES.ownedWeight : 1);
    if (isRare(c)) x *= 1 + st.rareLuck;
    if (c.r === 'legend') x *= (1 + st.legendLuck) * (chest ? CARD_RULES.chestLegendMul * (1 + st.chestLegend) : 1);
    return x;
  };
  const draw = pool => {
    while (out.length < N && pool.length) {
      let tot = pool.reduce((s, c) => s + w(c), 0), x = Math.random() * tot, ch = pool[pool.length - 1];
      for (const c of pool) { x -= w(c); if (x <= 0) { ch = c; break; } }
      out.push(ch); pool.splice(pool.indexOf(ch), 1);
    }
    return pool;
  };
  let left;
  if (chest) { left = draw(all.filter(isRare)); left = left.concat(draw(all.filter(c => !isRare(c)))); }
  else {
    left = draw(all.slice());
    // Bảo hiểm: nhiều lần liền không có thẻ hiếm thì lần này chắc chắn có.
    const pity = k.has('pity2') ? 2 : CARD_RULES.pityAfter;
    if (G.noRare >= pity && out.length && !out.some(isRare)) {
      const rr = left.filter(isRare); if (rr.length) { const c = pick(rr); left = left.filter(o => o !== c); out[out.length - 1] = c; }
    }
  }
  // Luôn có ít nhất 1 thẻ mới.
  if (out.length > 1 && out.every(c => G.owned[c.id])) {
    const nw = left.filter(c => !G.owned[c.id] && (!chest || isRare(c))); if (nw.length) out[0] = pick(nw);
  }
  let fi = 0; while (out.length < N) out.push(FALLBACK[fi++ % FALLBACK.length]);
  return out;
}

// Lượt chọn hiện tại là rương boss (rương được ưu tiên trước lượt lên cấp).
export const choosingChest = () => G.chests > 0;

export function reroll() {
  if (G.rerolls <= 0) return false;
  G.rerolls--; G.offer = rollCards(choosingChest());
  return true;
}

// Áp thẻ thứ i trong lượt rút hiện tại. Trả về true nếu còn lượt chọn (rương hoặc lên cấp).
export function applyCard(i) {
  const c = G.offer[i]; if (!c) return null;
  const chest = choosingChest();
  const l = (G.owned[c.id] || 0) + 1;
  if (!c.fb) G.owned[c.id] = l;
  c.apply(G, l, c.v);
  if (c.ex) G.banned.add(c.ex);
  if (chest) G.chests--;
  else { G.noRare = G.offer.some(o => o.r !== 'common') ? 0 : G.noRare + 1; G.pending--; if (G.startPicks > 0) G.startPicks--; }
  emit('cardPicked', c, l);
  return G.chests > 0 || G.pending > 0;
}
