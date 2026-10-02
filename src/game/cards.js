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

export function rollCards() {
  const N = CARD_RULES.choices;
  const pool = CARDS.filter(cardAvail), out = [];
  const w = c => RARITY[c.r].w * (G.owned[c.id] ? CARD_RULES.ownedWeight : 1);
  let left = pool.slice();
  while (out.length < N && left.length) {
    let tot = left.reduce((s, c) => s + w(c), 0), x = Math.random() * tot, ch = left[left.length - 1];
    for (const c of left) { x -= w(c); if (x <= 0) { ch = c; break; } }
    out.push(ch); left = left.filter(c => c !== ch);
  }
  // Bảo hiểm: nhiều lần liền không có thẻ hiếm thì lần này chắc chắn có.
  const isRare = c => c.r !== 'common';
  if (G.noRare >= CARD_RULES.pityAfter && out.length && !out.some(isRare)) {
    const rr = left.filter(isRare); if (rr.length) { const c = pick(rr); left = left.filter(o => o !== c); out[out.length - 1] = c; }
  }
  // Luôn có ít nhất 1 thẻ mới.
  if (out.length > 1 && out.every(c => G.owned[c.id])) {
    const nw = left.filter(c => !G.owned[c.id]); if (nw.length) out[0] = pick(nw);
  }
  let fi = 0; while (out.length < N) out.push(FALLBACK[fi++ % FALLBACK.length]);
  return out;
}

// Áp thẻ thứ i trong lượt rút hiện tại. Trả về true nếu còn lượt chọn.
export function applyCard(i) {
  const c = G.offer[i]; if (!c) return null;
  const l = (G.owned[c.id] || 0) + 1;
  if (!c.fb) G.owned[c.id] = l;
  c.apply(G, l, c.v);
  if (c.ex) G.banned.add(c.ex);
  G.noRare = G.offer.some(o => o.r !== 'common') ? 0 : G.noRare + 1;
  G.pending--;
  emit('cardPicked', c, l);
  return G.pending > 0;
}
