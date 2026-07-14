// Cabin Channel 3 - a swipeable feed of the cabin's YouTube Shorts.
// The video list lives in channel-videos.json (the channel "database");
// the channel-videos skill asks whether new Shorts should be added to it.
// Watched videos are remembered in localStorage so returning guests see
// unseen videos first. When everything has been watched, the memory resets
// and the loop starts fresh. Swipe up/left = next, down/right = previous,
// tap = play/pause. Long-form videos are deliberately excluded.

const WATCHED_KEY = 'cabin3-watched-shorts';
const DB_FILE = 'channel-videos.json';

const startBtn = document.querySelector('#start-btn');
const unmuteBtn = document.querySelector('#unmute-btn');
const counterEl = document.querySelector('#channel-counter');
const captionEl = document.querySelector('#channel-caption');
const frameEl = document.querySelector('#channel-frame');
const touchEl = document.querySelector('#channel-touch');
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

function setWatched(set) {
  try {
    localStorage.setItem(WATCHED_KEY, JSON.stringify([...set]));
  } catch {
    // private browsing - the feed still works, we just can't remember
  }
}

function markWatched(id) {
  const watched = getWatched();
  if (!watched.has(id)) {
    watched.add(id);
    setWatched(watched);
  }
}

function orderQueue(videos) {
  const watched = getWatched();
  return [...videos.filter((v) => !watched.has(v.id)), ...videos.filter((v) => watched.has(v.id))];
}

function updateHud() {
  if (!queue.length) {
    counterEl.textContent = 'No videos on the channel yet - check back soon!';
    return;
  }
  const watched = getWatched();
  const fresh = queue.filter((v) => !watched.has(v.id)).length;
  counterEl.textContent = `${pos + 1} of ${queue.length}` + (fresh ? ` · ${fresh} new to you` : ' · all caught up, looping');
  captionEl.textContent = queue[pos] ? queue[pos].title : '';
}

// The player is created up front with the first video CUED (not playing),
// so the iframe is fully loaded before the user taps play. That way the tap
// itself triggers playVideo() while the browser's user-activation window is
// open, which is what makes autoplay-with-sound stick.
function createPlayer(videoId) {
  player = new YT.Player('player', {
    videoId,
    host: 'https://www.youtube-nocookie.com',
    playerVars: { playsinline: 1, rel: 0 },
    events: {
      onReady: () => {
        startBtn.disabled = false;
        startBtn.textContent = '▶  Play the channel';
      },
      onStateChange: onPlayerState,
    },
  });
}

function play(i) {
  if (!queue.length || !player) {
    return;
  }
  pos = ((i % queue.length) + queue.length) % queue.length;
  player.loadVideoById(queue[pos].id);
  updateHud();
}

// Advance to the next video. When every video has been watched, reset the
// memory so the loop starts fresh with everything "new to you" again.
function next() {
  markWatched(queue[pos].id);
  const watched = getWatched();
  if (queue.every((v) => watched.has(v.id))) {
    setWatched(new Set());
    queue = orderQueue(queue);
    play(0);
    return;
  }
  if (pos >= queue.length - 1) {
    play(0);
  } else {
    play(pos + 1);
  }
}

function prev() {
  play(pos - 1);
}

function togglePlay() {
  if (!player || typeof player.getPlayerState !== 'function') {
    return;
  }
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function onPlayerState(e) {
  if (e.data === YT.PlayerState.ENDED) {
    next();
  }
}

// Swipe handling (pointer events cover touch + mouse drag). The overlay sits
// above the iframe so gestures work; a plain tap is forwarded as play/pause.
let gesture = null;

touchEl.addEventListener('pointerdown', (e) => {
  gesture = { x: e.clientX, y: e.clientY, t: Date.now() };
  touchEl.setPointerCapture(e.pointerId);
});

touchEl.addEventListener('pointerup', (e) => {
  if (!gesture || !started) {
    gesture = null;
    return;
  }
  const dx = e.clientX - gesture.x;
  const dy = e.clientY - gesture.y;
  const dt = Date.now() - gesture.t;
  gesture = null;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absY > 50 && absY >= absX) {
    if (dy < 0) {
      next(); // swipe up
    } else {
      prev(); // swipe down
    }
  } else if (absX > 50) {
    if (dx < 0) {
      next(); // swipe left
    } else {
      prev(); // swipe right
    }
  } else if (absX < 12 && absY < 12 && dt < 400) {
    togglePlay(); // tap
  }
});

startBtn.addEventListener('click', () => {
  started = true;
  startBtn.hidden = true;
  frameEl.classList.add('is-playing');
  // The first video is already cued in the loaded iframe - playing it
  // synchronously inside this tap keeps the browser's autoplay permission,
  // and every loadVideoById() after that continues the playback session.
  player.playVideo();
  updateHud();
  // Fallback for the strictest mobile policies: if sound-on playback was
  // blocked anyway, start muted (always allowed) and offer a tap-for-sound
  // chip - tapping it is a fresh gesture, so unmuting is permitted.
  setTimeout(() => {
    if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
      player.mute();
      player.playVideo();
      if (unmuteBtn) {
        unmuteBtn.hidden = false;
      }
    }
  }, 1200);
});

if (unmuteBtn) {
  unmuteBtn.addEventListener('click', () => {
    player.unMute();
    unmuteBtn.hidden = true;
  });
}

(async () => {
  // load the YouTube IFrame API in parallel with fetching the channel list
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  try {
    const db = await fetch(DB_FILE).then((r) => r.json());
    queue = orderQueue(db.videos || []);
    updateHud();
    if (queue.length) {
      startBtn.hidden = false;
      startBtn.disabled = true;
      startBtn.textContent = 'Warming up the channel…';
      await apiReady;
      createPlayer(queue[0].id); // onReady enables the button
    }
  } catch {
    counterEl.textContent = 'Unable to load the channel right now.';
  }
})();
