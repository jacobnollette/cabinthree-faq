// Fuzzy search across all FAQ topic pages, entirely in the browser.
// The corpus is tiny (a few dozen KB of markdown), so on first use we fetch
// every topic file from TOPIC_MAP (see topics.js), index it line by line,
// and score matches as you type. Typo-tolerant: exact > prefix > substring >
// one-edit-away (so "vaccum" finds Vacuum and "expresso" finds espresso).

const SEARCH_EXCLUDE = new Set(['changelog', 'install']);

const searchInput = document.querySelector('#faq-search');
const resultsEl = document.querySelector('#search-results');

let searchIndex = null;
let indexPromise = null;

function stripMarkdown(line) {
  return line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // embeds -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/^#+\s*/, '')
    .replace(/^>\s*(\[!\w+\]\s*)?/, '')
    .replace(/^[-*]\s+/, '')
    .replace(/[*_`]/g, '')
    .trim();
}

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function words(s) {
  const n = normalize(s);
  // index both hyphen-split and hyphen-collapsed forms, so "wifi" matches
  // "Wi-Fi" and "walk in" matches "walk-in"
  const parts = new Set([
    ...n.split(/[^a-z0-9']+/),
    ...n.replace(/(\w)-(\w)/g, '$1$2').split(/[^a-z0-9']+/),
  ]);
  parts.delete('');
  return [...parts];
}

// true if a and b are within one edit (insert/delete/substitute)
function oneEditAway(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0, j = 0, edits = 0;
  while (i < s.length && j < l.length) {
    if (s[i] === l[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (s.length === l.length) { i++; j++; } else { j++; }
  }
  return edits + (l.length - j) <= 1;
}

function tokenScore(token, word) {
  if (word === token) return 4;
  if (word.startsWith(token)) return 3;
  if (token.length >= 3 && word.includes(token)) return 2;
  if (token.length >= 4 && oneEditAway(token, word)) return 1.5;
  return 0;
}

function bestScore(token, wordList) {
  let best = 0;
  for (const w of wordList) {
    const s = tokenScore(token, w);
    if (s > best) best = s;
    if (best === 4) break;
  }
  return best;
}

async function buildIndex() {
  // Contextual tags: curated concept words per topic (search-tags.json), so
  // queries like "tacos" or "doctor" hit the right page even when the word
  // never appears in the text. Results attribute these hits to the category.
  let tagDb = {};
  try {
    tagDb = await fetch('search-tags.json').then((r) => (r.ok ? r.json() : {}));
  } catch {
    // tags are an enhancement - search still works without them
  }

  const entries = [];
  const jobs = Object.entries(TOPIC_MAP)
    .filter(([slug]) => !SEARCH_EXCLUDE.has(slug))
    .map(async ([slug, { title, file }]) => {
      try {
        const text = await fetch(file).then((r) => (r.ok ? r.text() : ''));
        const titleWords = words(title);
        const meta = tagDb[slug] || {};
        const category = meta.category || '';
        const tagWords = words((meta.tags || []).join(' '));
        let sectionWords = [];
        for (const raw of text.split('\n')) {
          const line = stripMarkdown(raw);
          if (/^#+\s/.test(raw)) {
            sectionWords = words(line); // e.g. "Wi-Fi and calls"
          }
          if (line.length < 8) continue;
          entries.push({ slug, title, titleWords, sectionWords, category, tagWords, line, lineWords: words(line) });
        }
      } catch {
        // page unavailable - skip it
      }
    });
  await Promise.all(jobs);
  return entries;
}

function search(query) {
  const tokens = words(query);
  if (!tokens.length) return [];
  const scored = [];
  for (const entry of searchIndex) {
    let total = 0;
    let ok = true;
    let tagMatched = false;
    for (const token of tokens) {
      const inLine = bestScore(token, entry.lineWords);
      const inTitle = bestScore(token, entry.titleWords);
      const inSection = bestScore(token, entry.sectionWords);
      const inTags = bestScore(token, entry.tagWords);
      // a token may match the line itself, the topic title, the section
      // heading the line sits under, or the topic's contextual tags (so
      // "tacos" finds Around Town and "doctor" finds Health Care)
      const s = Math.max(inLine, inTitle * 0.9, inSection * 0.95, inTags * 0.85);
      if (!s) { ok = false; break; }
      if (s === inTags * 0.85 && inTags > Math.max(inLine, inTitle, inSection)) {
        tagMatched = true;
      }
      total += s;
    }
    if (ok) scored.push({ ...entry, tagMatched, score: total });
  }
  scored.sort((a, b) => b.score - a.score);
  // keep the best line per topic first, at most two lines per topic
  const perTopic = new Map();
  const out = [];
  for (const hit of scored) {
    const n = perTopic.get(hit.slug) || 0;
    if (n < 2) {
      perTopic.set(hit.slug, n + 1);
      out.push(hit);
    }
    if (out.length >= 10) break;
  }
  return out;
}

function highlight(text, tokens) {
  let safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  for (const t of tokens) {
    if (t.length < 3) continue;
    safe = safe.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
  }
  return safe;
}

function render(hits, query) {
  if (!hits.length) {
    resultsEl.innerHTML = `<p class="search-empty">No matches - try different words, or browse the topics below.</p>`;
    resultsEl.hidden = false;
    return;
  }
  const tokens = words(query);
  resultsEl.innerHTML = hits
    .map(
      (h) => `<a class="search-hit" href="topic.html?topic=${h.slug}">
        <span class="search-hit-topic">${h.title}${h.category ? `<span class="search-hit-category">${h.category}${h.tagMatched ? ' · related' : ''}</span>` : ''}</span>
        <span class="search-hit-line">${highlight(h.line.slice(0, 160), tokens)}</span>
      </a>`
    )
    .join('');
  resultsEl.hidden = false;
}

let debounceTimer = null;

async function onQuery() {
  const q = searchInput.value.trim();
  if (q.length < 2) {
    resultsEl.hidden = true;
    resultsEl.innerHTML = '';
    return;
  }
  if (!searchIndex) {
    indexPromise = indexPromise || buildIndex();
    searchIndex = await indexPromise;
  }
  render(search(q), q);
}

if (searchInput) {
  // warm the index on first focus so the first keystrokes feel instant
  searchInput.addEventListener('focus', () => {
    indexPromise = indexPromise || buildIndex().then((ix) => (searchIndex = ix));
  }, { once: true });

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onQuery, 120);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      resultsEl.hidden = true;
    }
  });
}
