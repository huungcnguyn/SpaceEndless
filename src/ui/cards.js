// Màn chọn thẻ khi lên cấp và danh sách thẻ đã có.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { G } from '../core/state.js';
import { on } from '../core/events.js';
import { CARD_BY_ID } from '../data/cards.js';
import { rollCards, applyCard } from '../game/cards.js';

export function openCards() {
  G.state = 'cards'; G.offer = rollCards(); renderCards();
  $('cardsOv').hidden = false;
  setTimeout(() => { const b = document.querySelector('#cards .card'); if (b) b.focus({ preventScroll: true }); }, 30);
}

function renderCards() {
  $('cardsTitle').textContent = t('cardsUi.title', G.level - G.pending + 1);
  $('cardsSub').textContent = G.pending > 1 ? t('cardsUi.subMany', G.pending) : t('cardsUi.sub');
  const box = $('cards'); box.innerHTML = '';
  G.offer.forEach((c, i) => {
    const cur = G.owned[c.id] || 0, nl = cur + 1;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'card ' + c.r;
    let lv = '';
    if (!c.fb) lv = c.id === 'life' ? `<span class="lv">${t('cardsUi.lives', G.p.lives, G.p.lives + 1)}</span>`
      : cur ? `<span class="lv">${t('cardsUi.level', cur, nl, nl === c.max)}</span>` : `<span class="lv new">${t('cardsUi.new')}</span>`;
    const warn = c.ex ? `<span class="warn">${t('cardsUi.exclusive', t(`cards.${c.ex}.name`))}</span>` : '';
    el.innerHTML = `<div class="meta"><span class="r">${t(`rarity.${c.r}`)}</span><span class="g">${t(`groups.${c.g}`)}</span></div><h3>${t(`cards.${c.id}.name`)}</h3>${lv}<p>${t(`cards.${c.id}.d`, nl, c.v)}</p>${warn}<kbd>${i + 1}</kbd>`;
    el.addEventListener('click', () => chooseCard(i));
    box.appendChild(el);
  });
  renderBuild($('cardsBuild'));
}

export function chooseCard(i) {
  if (!G || G.state !== 'cards' || !G.offer[i]) return;
  if (applyCard(i)) { G.offer = rollCards(); renderCards(); return; }
  $('cardsOv').hidden = true; G.state = 'play';
}

export function renderBuild(el) {
  el.innerHTML = '';
  const ids = Object.keys(G.owned);
  if (!ids.length) { el.innerHTML = `<span class="chip">${t('cardsUi.none')}</span>`; return; }
  for (const id of ids) {
    const s = document.createElement('span'); s.className = 'chip';
    s.innerHTML = `${t(`cards.${CARD_BY_ID[id].id}.name`)}<b>${id === 'life' ? '×' + G.owned[id] : G.owned[id]}</b>`;
    el.appendChild(s);
  }
}

on('levelUp', () => { if (G.pending > 0 && G.state === 'play') openCards(); });
