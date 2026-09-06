# Features

The three guest-facing systems beyond the plain topic pages: homepage search,
Cabin Channel 3, and PWA install support.

## Search (`search.js`)

Fully client-side, line-based fuzzy search on the homepage.

**Indexing**
- On first focus of the search box the index is built (warm — the first
  keystrokes are instant). Results are debounced 120 ms per keystroke.
- Every file in `TOPIC_MAP` is fetched, except `SEARCH_EXCLUDE`
  (`changelog`, `install`).
- Each non-tiny line becomes an entry carrying: the line text, the topic
  title, the section heading it sits under, the topic's category + tags from
  `search-tags.json`, and a word list.
- Markdown is stripped (`stripMarkdown`) before scoring; hyphenated words are
  indexed both split **and** collapsed ("wi-fi" ↔ "wifi", "walk-in" ↔ "walk in").

**Scoring** (`tokenScore` — exact 4 > prefix 3 > substring 2 > one-edit-away
1.5, min token length guards apply). Per token a line can be matched by:

- the line text itself,
- the topic title (weight ×0.9),
- the section heading (×0.95), or
- the topic's contextual **tags** (×0.85).

Tags therefore enrich results without ever burying a literal match. A
tag-driven match shows the category chip with a small "· related" note
(`search.js:170`).

**Output**
- Best two lines per topic, maximum 10 results, sorted by score.
- View `topic.html?topic=<slug>`; matching text is `<mark>`-highlighted.
- Escape clears the box and hides results.
- `search-tags.json` is a pure enhancement — search works without it.

## Cabin Channel 3 (`channel.html` + `channel.js`)

A full-screen, swipeable feed of the cabin's YouTube Shorts, launched from
the 📺 hero button.

**Source of truth**
- `channel-videos.json` is the channel database. The feed plays exactly what's
  in `videos`, in order. Topic pages and the channel are independent.
- **Shorts only** — long-form (`youtu.be`/`watch?v=`) never goes on the
  channel, even if embedded on a page.

**Player & autoplay**
- Uses the YouTube IFrame API (`youtube.com/iframe_api`, loaded in parallel
  with the video list) hosted at `youtube-nocookie.com`.
- The player is created with the **first video cued but not playing** while
  the page loads, so the iframe is ready before the tap. The tap itself calls
  `playVideo()` inside the user-activation window, which is what makes
  sound-on autoplay stick.
- Fallback for strict mobile policies: if playback is still blocked, the
  channel starts muted and shows a "🔇 Tap for sound" chip (tapping is a fresh
  gesture, so unmuting is allowed).

**Interaction**
- Swipe up/left → next, down/right → previous, tap → play/pause
  (pointer events cover both touch and mouse drag; a small overlay sits above
  the iframe so gestures work).
- End-of-video auto-advances via `onStateChange`.

**Watched memory**
- Watched Short IDs live in `localStorage["cabin3-watched-shorts"]`; unseen
  videos play first. When everything has been watched, the memory resets and
  the loop starts fresh (all "new to you" again). In private browsing the
  feed still works, it just can't remember.

## PWA / install (`manifest.webmanifest` + `install.md`)

- The site declares `display: standalone`, cabin colors, and the 192/512px
  icons so iOS/Android/desktop can install it like an app with the cabin logo.
- The `<head>` of all three pages carries the manifest link, icons, and
  `apple-mobile-web-app-*` meta.
- `install.md` (the "📲 Make this an app" footer link) steps through
  iPhone/Safari, Android/Chrome, and desktop install.
- Favicon SVG is the source artwork; the PNGs (`favicon-32.png`,
  `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) are renders of it —
  regenerate from the SVG if the tree changes.

## Homepage extras

- **Hero CTAs:** "Get Connected" (→ Technology), a live MN DNR fire-ban link
  (external, `noopener`), and "Cabin Channel 3" (→ `channel.html`).
- **Quick Rules:** four non-negotiables (EV charger, umbrellas, drains, fires)
  surfaced above the topic grid.
- **Reveal animations on scroll** with per-card staggered `--i` indices
  (`script.js`), styled in `styles.css`.