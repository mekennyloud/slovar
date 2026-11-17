'use strict';
// Англо-русский словарь Мюллера. Весь словарь лежит на устройстве (data/mueller.json),
// поиск идёт без интернета: по английскому слову — по началу слова, по русскому — по переводам.

const $ = id => document.getElementById(id);
const q = $('q'), list = $('list'), entry = $('entry'), state = $('state'), back = $('back'), clear = $('clear'), tip = $('tip');

// иконки и котики из дизайн-системы (ds/doodles.js)
document.querySelectorAll('[data-d]').forEach(el => (el.innerHTML = DOODLES[el.dataset.d]));

// пустой экран, загрузка, «не нашлось»: котик + надпись
function showState(pic, title, text = '', extra = '', small = false) {
  state.className = 'state' + (small ? ' state--small' : '');
  state.innerHTML = `<div class="state__pic">${DOODLES[pic]}</div><div class="state__title">${title}</div>`
    + (text ? `<div class="state__text">${text}</div>` : '') + extra;
  state.hidden = false;
}
const BAR = '<div class="k-progress k-progress--run state__bar">' + '<i></i>'.repeat(12) + '</div>';

let H = [], B = [], K = [], ABBR = {}, SOURCE = '';
let plain = null;                       // переводы без ударений, строчными — для поиска по-русски
const LIMIT = 80;

const ACUTE = /́/g;
const CYR = /[а-яё]/i;
const keyOf = s => s.toLowerCase().replace(/’/g, "'").replace(/^['-]+/, '').replace(/\s+/g, ' ').trim();
const ruNorm = s => s.toLowerCase().replace(ACUTE, '').replace(/ё/g, 'е');
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- загрузка ----------

async function load() {
  try {
    const res = await fetch('data/mueller.json');
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    H = d.h; B = d.b; ABBR = d.abbr; SOURCE = d.source;
    K = H.map(keyOf);
    route();
    if (!location.hash) search();
  } catch (e) {
    showState('sit', 'Не получилось загрузить словарь', 'В первый раз нужен интернет, дальше словарь живёт в телефоне.',
      '<button class="k-btn k-btn--primary" id="retry">Ещё раз</button>');
    $('retry').onclick = () => { showState('lie', 'Загружаю словарь…', '', BAR); load(); };
  }
}

// ---------- поиск по-английски ----------

function lowerBound(key) {
  let lo = 0, hi = K.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (K[m] < key) lo = m + 1; else hi = m; }
  return lo;
}

function find(word) {                   // индекс статьи по слову или -1
  const k = keyOf(word), i = lowerBound(k);
  return K[i] === k ? i : -1;
}

function prefix(key, max) {
  const out = [];
  for (let i = lowerBound(key); i < K.length && out.length < max && K[i].startsWith(key); i++) out.push(i);
  return out;
}

// stopped → stop, cities → city, going → go, bigger → big …
function lemmas(w) {
  const c = new Set(), add = s => s.length > 1 && s !== w && c.add(s);
  const rules = [['ies', 'y'], ['ied', 'y'], ['ier', 'y'], ['iest', 'y'], ['ily', 'y'], ['es', ''], ['s', ''], ["'s", ''],
    ['ed', ''], ['ed', 'e'], ['ing', ''], ['ing', 'e'], ['er', ''], ['er', 'e'], ['est', ''], ['est', 'e'], ['ly', ''], ['ves', 'f'], ['ves', 'fe']];
  for (const [end, rep] of rules) {
    if (!w.endsWith(end)) continue;
    const stem = w.slice(0, -end.length);
    add(stem + rep);
    if (!rep && /([b-df-hj-np-tv-z])\1$/.test(stem)) add(stem.slice(0, -1));   // stopped → stop
  }
  return [...c];
}

function lev(a, b, max) {               // число опечаток (перестановка двух букв — одна), с ранним выходом
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let pp = null, prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (pp && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], pp[j - 2] + 1);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    pp = prev; prev = cur;
  }
  return prev[b.length];
}

function similar(key) {
  const max = key.length <= 4 ? 1 : 2, found = [];
  const multi = key.includes(' ');
  for (let i = 0; i < K.length; i++) {
    const k = K[i];
    if (!multi && k.includes(' ')) continue;
    const d = lev(key, k, max);
    if (d <= max) found.push([d, i]);
  }
  return found.sort((a, b) => a[0] - b[0] || (K[b[1]][0] === key[0]) - (K[a[1]][0] === key[0]) || K[a[1]].length - K[b[1]].length).slice(0, 12).map(x => x[1]);
}

const MAYBE = 'Может быть:';

function searchEn(raw) {
  const key = keyOf(raw);
  const hits = prefix(key, LIMIT);
  const groups = [];
  if (!hits.length || K[hits[0]] !== key) {
    const forms = lemmas(key).map(find).filter(i => i >= 0 && !hits.includes(i));
    if (forms.length) groups.push(['Похоже, это форма слова', [...new Set(forms)]]);
  }
  if (hits.length) groups.push([null, hits]);
  if (!groups.length) {
    const sim = similar(key);
    if (sim.length) groups.push([MAYBE, sim]);
  }
  return groups;
}

// ---------- поиск по-русски (по переводам) ----------

function searchRu(raw) {
  const n = ruNorm(raw).trim().replace(/\s+/g, ' ');
  if (n.length < 2) return [];
  if (!plain) plain = B.map(ruNorm);
  const isLetter = ch => ch && /[а-яёa-z0-9]/.test(ch);
  const found = [];
  for (let i = 0; i < plain.length; i++) {
    const t = plain[i];
    let pos = t.indexOf(n), best = null;
    while (pos !== -1) {
      if (!isLetter(t[pos - 1])) {
        const whole = !isLetter(t[pos + n.length]);
        const score = (whole ? 0 : 2000) + Math.min(pos, 1500) + (H[i].includes(' ') ? 400 : 0) + H[i].length;
        if (best === null || score < best[0]) best = [score, pos];
        if (whole) break;
      }
      pos = t.indexOf(n, pos + 1);
    }
    if (best) found.push([best[0], i, best[1]]);
  }
  found.sort((a, b) => a[0] - b[0]);
  return found;
}

// ---------- список ----------

function preview(i) {
  return B[i].replace(ACUTE, '').replace(/\[[^\]]*\]/g, '').replace(/_[^\s(),;{}:]+/g, '')
    .replace(/\{[^}]*\}/g, '').replace(/(^|\n)\s*(\d+[.)]|[а-я]\))/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
}

// позиции в plain[i] и в статье без ударений совпадают: строчные буквы и ё→е длину не меняют
function snippet(i, pos, len) {
  const t = B[i].replace(ACUTE, '');
  const s = Math.max(0, pos - 30);
  const tidy = x => esc(x.replace(/\[[^\]]*\]/g, '').replace(/(^|\n)(_[IVX]+|\d+[.)]|[а-я]\))\s*/g, ' ').replace(/_/g, '').replace(/\s+/g, ' '));
  return (s ? '…' : '') + tidy(t.slice(s, pos)) + '<mark class="k-mark">' + esc(t.slice(pos, pos + len)) + '</mark>' + tidy(t.slice(pos + len, pos + len + 100));
}

function item(i, html) {
  return `<li><a class="k-row" href="#w=${encodeURIComponent(H[i])}" data-i="${i}"><span class="w">${esc(H[i])}</span><span class="p">${html}</span></a></li>`;
}

let timer = 0;
function search() {
  clearTimeout(timer);
  const raw = q.value;
  clear.hidden = !raw;
  if (!K.length) return;
  if (!raw.trim()) {
    list.innerHTML = '';
    showState('loaf', 'Напиши слово по-английски или по-русски', `${H.length.toLocaleString('ru')} статей · словарь Мюллера`);
    return;
  }
  const ru = CYR.test(raw);
  timer = setTimeout(() => ru ? showRu(raw) : showEn(raw), ru ? 160 : 40);
}

function showEn(raw) {
  const groups = searchEn(raw);
  let html = '';
  for (const [title, ids] of groups) {
    if (title) html += `<li class="group">${title}</li>`;
    html += ids.map(i => item(i, esc(preview(i)))).join('');
  }
  list.innerHTML = html;
  if (!groups.length) showState('sit', 'Такого слова нет', 'Проверь, как написано, или попробуй по-русски.');
  else if (groups[0][0] === MAYBE) showState('sit', 'Такого слова нет', '', '', true);
  else state.hidden = true;
}

function showRu(raw) {
  const found = searchRu(raw);
  const len = ruNorm(raw).trim().replace(/\s+/g, ' ').length;
  list.innerHTML = found.length ? `<li class="group">В переводах: ${found.length.toLocaleString('ru')}${found.length > LIMIT ? `, вот первые ${LIMIT}` : ''}</li>`
    + found.slice(0, LIMIT).map(([, i, pos]) => item(i, snippet(i, pos, len))).join('') : '';
  if (found.length) state.hidden = true;
  else if (len < 2) showState('loaf', 'Ещё хотя бы одну букву', '', '', true);
  else showState('sit', 'В переводах такого нет', 'Попробуй другое слово или начальную форму.');
}

// ---------- статья ----------

const TOKEN = /(\[[^\]]*\])|_([IVX]+)(?![\wА-яЁё.])|_([^\s(),;_{}:\[]+)|\{([^}]*)\}|(?<![А-яЁё])(от )([A-Za-z][A-Za-z'’-]*)|([A-Za-z][A-Za-z0-9'’-]*[.!?]?(?: [A-Za-z][A-Za-z0-9'’-]*[.!?]?)*)/g;

function link(word, text = word) {
  const i = find(word);
  return i >= 0 ? `<a class="go" href="#w=${encodeURIComponent(H[i])}">${esc(text)}</a>` : `<span class="en">${esc(text)}</span>`;
}

function inline(s) {
  let out = '', last = 0;
  for (const m of s.matchAll(TOKEN)) {
    out += esc(s.slice(last, m.index));
    last = m.index + m[0].length;
    const [, tr, hom, label, ref, ot, otWord, en] = m;
    if (tr) out += `<span class="k-ipa">${esc(tr)}</span>`;
    else if (hom) out += `<span class="k-tag">${hom}</span>`;
    else if (label) {
      const full = ABBR[label] || ABBR[label + '.'];
      out += full ? `<button class="k-chip" data-k="${esc(full.replace(ACUTE, ''))}">${esc(label)}</button>` : `<span class="k-chip">${esc(label)}</span>`;
    } else if (ref !== undefined) {
      const r = ref.match(/^(см\.|ср\.)( тж\.)? ([A-Za-z].*)$/);
      out += '<span class="ref">(' + (r ? esc(r[1] + (r[2] || '') + ' ') + link(r[3].replace(/\s+\d+$/, ''), r[3]) : esc(ref)) + ')</span>';
    } else if (ot) out += 'от ' + link(otWord);
    else if (en) out += `<span class="en">${esc(en)}</span>`;
  }
  // ударение рисуем штрихом (см. .k-st в ds/components.css)
  return (out + esc(s.slice(last))).replace(/([А-яЁё])\u0301/g, '<span class="k-st">$1</span>');
}

function render(i) {
  let html = `<h1 class="k-title">${esc(H[i])}</h1>`;
  for (const line of B[i].split('\n')) {
    let m, cls = 'ln', mark = '', rest = line;
    if ((m = line.match(/^_([IVX]+)\s*(.*)$/))) { cls += ' l0'; mark = `<span class="k-tag k-tag--fill">${m[1]}</span>`; rest = m[2]; }
    else if ((m = line.match(/^(\d+)\.\s*(.*)$/))) { cls += ' l1'; mark = `<span class="k-tag">${m[1]}</span>`; rest = m[2]; }
    else if ((m = line.match(/^(\d+)\)\s*(.*)$/))) { cls += ' l2'; mark = `<span class="n">${m[1]})</span>`; rest = m[2]; }
    else if ((m = line.match(/^([а-я])\)\s*(.*)$/))) { cls += ' l3'; mark = `<span class="n">${m[1]})</span>`; rest = m[2]; }
    html += `<div class="${cls}">${mark}${inline(rest)}</div>`;
  }
  html += `<hr class="k-rule"><p class="src">${esc(SOURCE)}</p>`;
  entry.innerHTML = html;
}

// ---------- навигация: #w=слово — статья, пусто — поиск ----------

let listScroll = 0, opened = false;

function route() {
  const m = location.hash.match(/^#w=(.*)$/);
  const i = m && K.length ? find(decodeURIComponent(m[1])) : -1;
  if (i >= 0) {
    if (!opened) listScroll = scrollY;
    opened = true;
    render(i);
    entry.hidden = false; list.hidden = true; state.hidden = true; back.hidden = false;
    scrollTo(0, 0);
  } else {
    const was = opened;
    opened = false;
    entry.hidden = true; list.hidden = false; back.hidden = true;
    if (!K.length) return;
    search();
    if (was) requestAnimationFrame(() => scrollTo(0, listScroll));
  }
}

addEventListener('hashchange', route);

back.onclick = () => {
  if (history.length > 1 && history.state !== 'first') history.back();
  else location.hash = '';
};

q.addEventListener('input', () => {
  if (opened) history.replaceState(null, '', location.pathname + location.search);
  if (opened) { opened = false; entry.hidden = true; list.hidden = false; back.hidden = true; }
  search();
});

$('form').addEventListener('submit', e => {
  e.preventDefault();
  clearTimeout(timer);
  if (CYR.test(q.value)) showRu(q.value); else if (q.value.trim()) showEn(q.value);
  const first = list.querySelector('a');
  q.blur();
  if (first) location.hash = 'w=' + encodeURIComponent(H[+first.dataset.i]);
});

clear.onclick = () => { q.value = ''; if (opened) location.hash = ''; search(); q.focus(); };

// расшифровка помет: _разг. → «разговорное»
let tipTimer = 0;
entry.addEventListener('click', e => {
  const lb = e.target.closest('[data-k]');
  if (!lb) return;
  tip.hidden = true;            // спрятать и показать заново, чтобы анимация сыграла ещё раз
  tip.innerHTML = `<div class="k-say"><div class="k-say__who">${DOODLES.face}кот</div>`
    + `<div class="k-say__text"><b>${esc(lb.textContent)}</b> — ${esc(lb.dataset.k)}</div></div>`;
  requestAnimationFrame(() => (tip.hidden = false));
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => (tip.hidden = true), 3500);
});
tip.onclick = () => (tip.hidden = true);

// на Mac (localhost) кэш не включаем, чтобы правки были видны сразу
if ('serviceWorker' in navigator && location.hostname !== 'localhost') navigator.serviceWorker.register('sw.js');
load();
