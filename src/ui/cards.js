// Màn chọn thẻ (lên cấp, rương boss) và danh sách thẻ đã có.
import { $ } from '../util.js';
import { t } from '../lang/index.js';
import { G } from '../core/state.js';
import { on } from '../core/events.js';
import { CARD_BY_ID } from '../data/cards.js';
import { rollCards, applyCard, choosingChest, reroll } from '../game/cards.js';

export function openCards() {
  G.state = 'cards'; G.offer = rollCards(choosingChest()); renderCards();
  $('cardsOv').hidden = false;
  setTimeout(() => { const b = document.querySelector('#cards .card'); if (b) b.focus({ preventScroll: true }); }, 30);
}

// Mở màn chọn thẻ nếu đang chơi và còn lượt chọn.
export function maybeOpenCards() {
  if (G && G.state === 'play' && (G.pending > 0 || G.chests > 0)) openCards();
}

function renderCards() {
  const chest = choosingChest(), left = G.pending + G.chests;
  $('cardsOv').classList.toggle('chest', chest);
  $('cardsTitle').textContent = chest ? t('cardsUi.chest') : G.startPicks > 0 ? t('cardsUi.start') : t('cardsUi.title', G.level - G.pending + 1);
  $('cardsSub').textContent = left > 1 ? t('cardsUi.subMany', left) : t(chest ? 'cardsUi.chestSub' : 'cardsUi.sub', G.offer.length);
  const box = $('cards'); box.innerHTML = '';
  box.classList.toggle('four', G.offer.length === 4);
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
  const rb = $('rerollBtn');
  rb.hidden = G.rerolls <= 0;
  rb.textContent = t('cardsUi.reroll', G.rerolls);
  renderBuild($('cardsBuild'));
}

export function chooseCard(i) {
  if (!G || G.state !== 'cards' || !G.offer[i]) return;
  if (applyCard(i)) { G.offer = rollCards(choosingChest()); renderCards(); return; }
  $('cardsOv').hidden = true; G.state = 'play';
}

export function rerollCards() {
  if (G && G.state === 'cards' && reroll()) renderCards();
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

on('levelUp', maybeOpenCards);
on('chest', maybeOpenCards);
