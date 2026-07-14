// Cabin Channel 3 - plays every YouTube Short found in the FAQ pages as a
// feed. Watched videos are remembered in localStorage so returning guests
// start with what they haven't seen. Only vertical Shorts are included;
// long-form videos (youtu.be / watch?v=) stay on their topic pages.

const WATCHED_KEY = 'cabin3-watched-shorts';
const INDEX_FILE = 'Cabin Three - FAQ.md';
const SHORTS_MD_RE = /!\[([^\]]*)\]\(https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})[^)]*\)/g;

const startBtn = document.querySelector('#start-btn');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const counterEl = document.querySelector('#channel-counter');
const captionEl = document.querySelector('#channel-caption');
const yearEl = document.querySelector('#year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

let queue = [];
let pos = 0;
let player = null;
let started = false;
let apiReadyResolve;
const apiReady = new Promise((resolve) => {
  apiReadyResolve = resolve;
});

window.onYouTubeIframeAPIReady = () => apiReadyResolve();

function getWatched() {
  try {
    return new Set(JSON.parse(localStorage.getItem(WATCHED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function markWatched(id) {
  try {
    const watched = getWatched();
    if (!watched.has(id)) {
      watched.add(id);
      localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched]));
    }
  } catch {
    // private browsing - the feed still works, we just can't remember
  }
}

async function collectShorts() {
  const index = await fetch(INDEX_FILE).then((r) => r.text());
  const files = [...index.matchAll(/\((FAQ\/[^)]+\.md)\)/g)].map((m) => decodeURIComponent(m[1]));
  const texts = await Promise.all(
    files.map((f) => fetch(f).then((r) => (r.ok ? r.text() : '')).catch(() => ''))
  );
  const seen = new Set();
  const shorts = [];
  for (const text of texts) {
    for (const m of text.matchAll(SHORTS_MD_RE)) {
      if (!seen.has(m[2])) {
        seen.add(m[2]);
        shorts.push({ id: m[2], title: m[1] || 'Cabin Three short' });
      }
    }
  }
  return shorts;
}

function updateHud() {
  if (!queue.length) {
    counterEl.textContent = 'No shorts on the channel yet - check back soon!';
    return;
  }
  const watched = getWatched();
  const fresh = queue.filter((v) => !watched.has(v.id)).length;
  counterEl.textContent = `${pos + 1} of ${queue.length}` + (fresh ? ` · ${fresh} new to you` : '');
  captionEl.textContent = queue[pos] ? queue[pos].title : '';
  prevBtn.disabled = !started || pos === 0;
  nextBtn.disabled = !started || pos >= queue.length - 1;
}

async function play(i) {
  pos = Math.max(0, Math.min(i, queue.length - 1));
  const video = queue[pos];
  await apiReady;
  if (!player) {
    player = new YT.Player('player', {
      videoId: video.id,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
      events: { onStateChange: onPlayerState },
    });
  } else {
    player.loadVideoById(video.id);
  }
  updateHud();
}

function onPlayerState(e) {
  if (e.data === YT.PlayerState.ENDED) {
    markWatched(queue[pos].id);
    if (pos < queue.length - 1) {
      play(pos + 1);
    } else {
      captionEl.textContent = "That's everything - you're all caught up! 🎉";
      updateHud();
    }
  }
}

startBtn.addEventListener('click', () => {
  started = true;
  startBtn.hidden = true;
  play(0);
});

prevBtn.addEventListener('click', () => play(pos - 1));
nextBtn.addEventListener('click', () => {
  markWatched(queue[pos].id);
  play(pos + 1);
});

(async () => {
  // load the YouTube IFrame API in parallel with scanning the FAQ
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  try {
    const shorts = await collectShorts();
    const watched = getWatched();
    // new-to-you videos first, already-watched ones at the end (stable order)
    queue = [...shorts.filter((v) => !watched.has(v.id)), ...shorts.filter((v) => watched.has(v.id))];
    if (queue.length) {
      startBtn.hidden = false;
    }
    updateHud();
  } catch {
    counterEl.textContent = 'Unable to load the channel right now.';
  }
})();
