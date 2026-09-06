# Cabin Three FAQ — Site Spec

Technical documentation for the Cabin Three guest-guide site. This is a
zero-build static FAQ hosted on GitHub Pages at **https://cabinthree.info**.
It renders plain Markdown topics in the browser, has live client-side search,
inline YouTube video players, a swipeable Shorts feed ("Cabin Channel 3"),
and PWA install support.

## Docs

| Document | Covers |
| --- | --- |
| [Architecture](architecture.md) | Pages, scripts, registries, and how a topic request is rendered |
| [Content authoring](content.md) | Topic registry, Markdown conventions, video embeds, and callouts |
| [Features](features.md) | Search, Cabin Channel 3, and PWA/install behavior |
| [Deployment](deployment.md) | GitHub Pages CI, domain setup, and static assets |

Companion docs elsewhere in the repo:

- `AGENTS.md` — content rules and the validation checklist.
- `CLAUDE.md` — the working supplement to this spec (search, embeds, callouts, changelog).
- `.claude/skills/` — the three curator skills (`channel-videos`, `search-tags`, `update-changelog`).

## Key facts

- **No build step.** `index.html`, `topic.html`, and `channel.html` are served as-is.
- **Content lives in Markdown** under `FAQ/` (18 topics). Plus `install.md`
  (PWA guide) and `CHANGELOG.md` (version history) rendered as pages.
- **Single source of truth for topics:** `topics.js:TOPIC_MAP` maps slugs to
  titles and markdown files; `TOPIC_ALIASES` keeps old URLs working.
- **Render pipeline:** `topic.js` parses markdown with marked.js, then
  transforms YouTube embeds, `[!ISSUE]`, and `[!CONTRIBUTE]` callouts, and
  hoists videos into a top-of-page rail.
- **Deploy:** GitHub Actions (`pages.yml`) publishes the repo root on every
  push to `main`.

## Review findings (Sep 2026)

Accuracy/architecture observations recorded while documenting the site:

1. **Homepage topic grid is hand-synced.** The 18 cards in `index.html` are
   copy-pasted alongside `TOPIC_MAP` (`topics.js`). There is no generator.
   Adding/renaming a topic means editing **both** files in lockstep — see the
   `index.md` / `Cabin Three - FAQ.md` drift below for the failure mode.
2. **`index.md` and `Cabin Three - FAQ.md` are orphaned legacy topic indexes.**
   They are not used by the site (GitHub Pages serves `index.html`, not
   `index.md`; `Cabin Three - FAQ.md` is the original Notion export entry).
   They currently list only 18 topics and will silently go stale as topics
   change. They are kept only as source artifacts per `AGENTS.md`.
3. **`AGENTS.md` says "`index.md` is the GitHub Pages landing page."** That is
   not accurate — `index.html` wins whenever both exist. The `.md` files are
   inert source references.
4. **Minor copy typos exist in the FAQ** (`FAQ/Fire.md`, `FAQ/Garbage.md`,
   `FAQ/Septic and drains.md` — e.g. "Theres", "if awesome", a garbled
   septic sentence). These are preserved on purpose per the "preserve wording
   unless asked for copy edits" rule; fix on request.
5. **No HTML validation step in CI.** Pages ship as static files with no
   lint/typecheck. The only automated gate is deployment success.

Everything below assumes the repo stays at **v1.x** — see the "Breaking
changes" note in `CHANGELOG.md` (`spec/content.md` documents the versioning
policy).