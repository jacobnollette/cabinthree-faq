# Content Authoring

All guest-facing content is plain Markdown. Convention over tooling: there is
no build step, so the rules below are what keep the site coherent.

## Adding or renaming a topic

A topic touches four places. Renames/removals always ship a redirect so
bookmarked URLs keep working (that's why slug changes are MINOR, not MAJOR).

1. **Markdown file** in `FAQ/` (filename-safe name).
2. **`TOPIC_MAP`** in `topics.js` — the slug, title, and file. This is what
   `topic.js` renders and `search.js` indexes; without it the topic is dead.
3. **Homepage card** in `index.html` — the cards are hand-written and must
   stay in sync with `TOPIC_MAP` (there is no generator).
4. **`search-tags.json`** — a category + concept tags so the topic is
   findable by meaning (see the `search-tags` skill).

For a rename: add the old slug to `TOPIC_ALIASES` pointing at the new one
(`topics.js:28-38`) and update the `search-tags.json` key.

Footer-only pages live in `TOPIC_MAP` but deliberately **not** on the homepage
grid: `install` (`install.md`) and `changelog` (`CHANGELOG.md`). They are also
excluded from search via `SEARCH_EXCLUDE` in `search.js`.

## Markdown conventions

- Plain Markdown, no Notion constructs. No `notion-id`, no `base:` lines, no
  `![[...]]` embeds, no Notion database views.
- The homepage topic grid and topic pages are separate: a page's H2s become
  its visual sections; the card blurb on `index.html` is a separate preview
  snippet that must be updated by hand.
- Preserve existing FAQ wording unless the user asks for copy edits.

## YouTube embeds (video tutorials)

Use Markdown image syntax pointing at the video URL:

```markdown
![Dyson vacuum tutorial - basic training - day one](https://www.youtube.com/shorts/cBRnwyKxj9A)
![how to make a latte](https://youtu.be/6Kbm96qqlSc)
```

Rules of the road (implemented in `topic.js`,`upgradeVideoEmbeds()`):

- `youtube.com/shorts/<id>` → vertical 9:16 `.shorts-player`.
- `youtu.be/<id>` or `youtube.com/watch?v=<id>` → 16:9 `.video-player`.
- The **alt text is required** — it becomes the for-accessible title and the
  visible caption under the player.
- Players are iframes against `youtube-nocookie.com` (privacy mode), always
  `playsinline=1`.
- Strip tracking params (`?feature=share`) from embed URLs.
- Regular `[text](url)` links are never embedded — use image syntax only when
  you want the player.
- Any other YouTube URL in image syntax degrades to a plain external link
  instead of a broken `<img>`.
- Unlisted videos embed fine as long as embedding is enabled on the video.
- At render time every player is **hoisted into a "▶ Video tutorials" rail at
  the top of the page** (one or multiple players), unless it lives inside a
  `[!ISSUE]` callout (issue videos stay with their issue). Orphaned lines
  reading exactly `Video tutorial:` are removed automatically.
- Shorts also feed **Cabin Channel 3** — whether a new Short joins the
  channel is a separate decision (see `channel-videos` skill).

## `[!ISSUE]` callouts (known issues)

Unsolved problems live in the page under a `## Known issues` heading:

```markdown
> [!ISSUE]
> We have two light-up water pitchers. One pitcher's light turns on, but the
> other one's does not. We don't know the problem yet.
>
> ![issue - water pitchers (light!)](https://www.youtube.com/shorts/P3FepTbQTuk)
```

- Renders as an `aside.issue-callout` (orange warning card) with a
  "⚠️ Known issue — unsolved" badge and an auto-generated footer: "Know the
  fix? Email Jacob / open a pull request."
- The email and repo URL live in `topic.js` constants — never hardcode them in
  markdown.
- One callout per issue. When fixed, delete the callout and fold the fix into
  the page's regular bullets.
- Plain blockquotes without the tag are untouched.

## `[!CONTRIBUTE]` callouts (suggestions)

Pages that invite additions (e.g. Around Town) use:

```markdown
> [!CONTRIBUTE]
> Found a great local spot we're missing? We'd love to add it to this list.
```

Renders as a teal `aside.contribute-callout` invitation card with the same
automatic email/PR footer. Same authoring rules as `[!ISSUE]`.

## Changelog & versioning

`CHANGELOG.md` is the version history (newest first) and is rendered as a
page via the `changelog` topic. The version lives **only** there.

- **PATCH** — copy edits, corrections, small content additions.
- **MINOR** — a new topic, feature/system, content section, or consolidation.
  Slug renames and consolidations are MINOR because `TOPIC_ALIASES` keeps URLs
  working.
- **MAJOR** — a guest-facing URL breaks with no redirect. Never yet.

Every guest-facing change gets an entry in the same commit, dated `YYYY-MM-DD`,
written in plain guest-friendly language (see the `update-changelog` skill
for the full flow).

## Validation checklist

Before committing content changes:

1. No Notion metadata remains:
   `rg -n "notion-id:|^base:|\!\[\[|\[\[.*\.base\]\]" .`
2. Top-level navigation links resolve (topic URLs ↔ `TOPIC_MAP`).
3. `index.html` exists (the real Pages landing page; `index.md` is inert).
4. New Shorts: ask whether they belong on Cabin Channel 3
   (`channel-videos.json`).
5. New/renamed topics or notable content: update `search-tags.json`.
6. Changelog entry + version bump for any guest-facing change.