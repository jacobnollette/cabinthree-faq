# Architecture

Zero-build static site. GitHub Pages serves the repo root; every page is
plain HTML that pulls in client-side JavaScript. There is no server, no
templating, and no package.json.

## Pages

| File | Role |
| --- | --- |
| `index.html` | Landing page: hero, Quick Rules, search box, and the topic grid (18 hand-written cards). Loads `topics.js`, `search.js`, `script.js`. |
| `topic.html` | Reusable topic shell. Reads `?topic=<slug>` from the query string, renders the markdown file. Loads `marked` (CDN), `topics.js`, `topic.js`. |
| `channel.html` | Cabin Channel 3: full-screen swipeable Shorts feed. Loads `channel.js`. |

All three pages share the same `<head>` PWA wiring (manifest, icons,
theme-color meta) and the same `styles.css` + Fraunces/Manrope Google Fonts.
`topic.html` and `channel.html` both include the floating "back" FAB.

## Scripts

| Script | Loaded by | Responsibility |
| --- | --- | --- |
| `topics.js` | `index.html`, `topic.html` | Defines `TOPIC_MAP` (slug → `{title, file}`) and `TOPIC_ALIASES` (old slug → new slug). Shared, no side effects. |
| `topic.js` | `topic.html` | Resolves the slug, fetches + renders the markdown, runs the post-parse transforms, sets the title and current year. |
| `search.js` | `index.html` | Builds a line-by-line search index from every topic file (minus `SEARCH_EXCLUDE`), fuzzy-scores queries as you type, renders results. |
| `script.js` | `index.html` | Tags each `.topic-card` with a `--i` index for stagger animation; sets the footer year. |
| `channel.js` | `channel.html` | Loads `channel-videos.json`, drives the YT IFrame API player, swipe/tap gesture handling, and the watched-memory loop. |

## The two registries

- `TOPIC_MAP` (`topics.js:4-25`) — 20 entries: 18 FAQ topics + the two
  footer-only pages `changelog` and `install`. Search reads this to know which
  files to index; `topic.js` reads it to know what to fetch. Adding a topic
  **only** requires an entry here (plus a card in `index.html` and search
  tags — see [Content](content.md)) — there is no index to rebuild.
- `TOPIC_ALIASES` (`topics.js:28-38`) — keeps pre-2026-consolidation URLs
  working (e.g. `home-assistant`, `grills`, `restaurants`). Lookup order:
  `alias ?? requestedSlug` → `TOPIC_MAP`.

## Topic render pipeline (`topic.js`)

1. `URLSearchParams` reads `?topic=`; **defaults to `technology`** when
   missing. Alias is resolved, then `TOPIC_MAP[slug]`.
2. Unknown slug → "Topic Not Found" message; failing fetch → "Unable to load
   this topic right now."
3. Known topic → `fetch(file)`, parse with `window.marked.parse()` (marked.js
   loaded from CDN in `topic.html`).
4. Post-parse transforms, in order:

   | Transform | What it does |
   | --- | --- |
   | `upgradeVideoEmbeds()` | Replaces `<img>` with YouTube `src` with a privacy-enhanced `youtube-nocookie.com` iframe player (`figure.shorts-player` for Shorts, `figure.video-player` for 16:9). Non-player YouTube images degrade to plain external links. |
   | `upgradeIssueCallouts()` | Turns `[!ISSUE]` blockquotes into `aside.issue-callout` warning cards with a "know the fix?" footer (email + PR). |
   | `upgradeContributeCallouts()` | Turns `[!CONTRIBUTE]` blockquotes into `aside.contribute-callout` invitation cards with the same footer. |
   | `hoistVideosToTop()` | Moves every player into a labeled "▶ Video tutorials" rail prepended to the page. Embeds inside `[!ISSUE]` callouts stay put. Strips orphaned `Video tutorial:` intro lines. |

   The email (`jacob@jacobnollette.com`) and repo URL used by the callout
   footers are constants in `topic.js`, **not** in the markdown.

5. `#year` in the footer is stamped with the current year.

If marked.js ever fails to load, the page falls back to showing the raw
markdown as plain text (`topic.js:234-236`).

## Data flow at a glance

```text
Guest opens topic.html?topic=around-town
   └─ topic.js: slug → TOPIC_ALIASES → TOPIC_MAP → FAQ/Around Town.md
index.html loads topics.js + search.js
   └─ focus search box → fetch every TOPIC_MAP file → index lines (+ search-tags.json)
channel.html loads channel.js
   └─ fetch channel-videos.json → order by localStorage watched set → YT IFrame API
```

## Where state lives

| State | Location |
| --- | --- |
| Topic content | Static `.md` files under `FAQ/` |
| Topic registry | `TOPIC_MAP` / `TOPIC_ALIASES` in `topics.js` |
| Channel video list | `channel-videos.json` |
| Search context tags | `search-tags.json` |
| Watched-video memory | `localStorage["cabin3-watched-shorts"]` |
| Version history | `CHANGELOG.md` (no version constant elsewhere) |