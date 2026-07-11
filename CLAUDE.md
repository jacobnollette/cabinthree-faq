# CLAUDE.md

Static FAQ site for Cabin Three guests, hosted on GitHub Pages at
**https://faq.cabinthree.info**. No build step:
`index.html` renders topic cards, `topic.html` + `topic.js` fetch a Markdown
file from `FAQ/` and render it in the browser with marked.js. Deploys happen
only on pushes to `main` (`.github/workflows/pages.yml`).

See `AGENTS.md` for general content rules (no Notion metadata, preserve FAQ
wording, etc.).

## Changelog and versioning

`CHANGELOG.md` (repo root) is the version history, newest first, following
semantic versioning (MAJOR.MINOR.PATCH). It's rendered as a page via the
`changelog` entry in `TOPIC_MAP` and linked from the homepage footer — it is
deliberately not a card on the Browse Topics grid. When you ship a change,
add an entry: PATCH for copy edits/corrections, MINOR for a new topic or
feature, MAJOR only if a guest-facing URL breaks with no redirect fallback
(slug renames add a `TOPIC_ALIASES` redirect, so they stay MINOR).

The `update-changelog` skill (`.claude/skills/update-changelog/`) walks through
this — invoke it when shipping a guest-facing change.

## Video tutorials: YouTube embeds

To add a video tutorial to a topic page, use Markdown image syntax pointing at
the video's URL:

```markdown
![Dyson vacuum tutorial - basic training - day one](https://www.youtube.com/shorts/cBRnwyKxj9A)
![how to make a latte](https://youtu.be/xoYviYRz64U)
```

How it renders:

- `upgradeVideoEmbeds()` in `topic.js` runs after marked.js parses the page
  and replaces each `<img>` whose `src` is a YouTube URL with a `<figure>`
  containing a `youtube-nocookie.com` iframe:
  - `youtube.com/shorts/<id>` → vertical 9:16 `.shorts-player`
  - `youtu.be/<id>` or `youtube.com/watch?v=<id>` → 16:9 `.video-player`
- The image alt text becomes the player's accessible title and a visible
  caption below the player — always include one.
- Styling lives in `styles.css` under `.shorts-player` and `.video-player`.

Rules:

- Prefer Shorts for quick topic tutorials; long-form videos are fine when the
  subject needs it (e.g. the latte walkthrough on the Coffee page).
- Strip tracking params like `?feature=share` from the URL.
- Regular `[text](url)` links are never embedded — use a link when you
  deliberately want plain text, image syntax when you want the player.
- Unlisted videos embed fine as long as embedding is enabled on the video.
- Put embeds after the topic's bullet list, introduced by a short line like
  `Video tutorial:` or `Video tutorials:`, with a blank line between each
  embed so each renders as its own player.

## Known issues: `[!ISSUE]` callouts

Unsolved problems around the cabin are tracked in the FAQ pages themselves
using a blockquote that opens with `[!ISSUE]`:

```markdown
## Known issues

> [!ISSUE]
> We have two light-up water pitchers. One pitcher's light turns on, but the
> other one's does not. We don't know the problem yet.
>
> ![issue - water pitchers (light!)](https://www.youtube.com/shorts/P3FepTbQTuk)
```

How it renders:

- `upgradeIssueCallouts()` in `topic.js` converts the blockquote into an
  `<aside class="issue-callout">` — an orange warning card with a
  "⚠️ Known issue — unsolved" badge.
- A footer is added automatically inviting readers to email Jacob
  (`jacob@jacobnollette.com`, with a prefilled subject naming the topic) or
  open a pull request against this repo if they know the fix. Don't hardcode
  the email in FAQ markdown — it lives in `ISSUE_CONTACT_EMAIL` in `topic.js`.
- Shorts embeds inside the callout work normally (the video documenting the
  issue goes inside the blockquote).
- Styling lives in `styles.css` under `.issue-callout`.

Rules:

- Group issue callouts under a `## Known issues` heading at the bottom of the
  topic page.
- One callout per issue. When an issue is solved, delete the callout and fold
  the fix into the page's regular bullets.
- Plain blockquotes without the `[!ISSUE]` marker are untouched.

## Suggestions: `[!CONTRIBUTE]` callouts

Pages that invite reader contributions (e.g. the Around Town list) use a
blockquote that opens with `[!CONTRIBUTE]`:

```markdown
> [!CONTRIBUTE]
> Found a great local spot we're missing? We'd love to add it to this list.
```

How it renders:

- `upgradeContributeCallouts()` in `topic.js` converts the blockquote into an
  `<aside class="contribute-callout">` — a friendly teal invitation card
  (distinct from the orange `[!ISSUE]` warning card).
- A footer is added automatically inviting readers to email Jacob (subject
  prefilled with the topic name) or open a pull request. Same
  `ISSUE_CONTACT_EMAIL` / `REPO_URL` as the issue callouts — don't hardcode
  the email in FAQ markdown.
- Styling lives in `styles.css` under `.contribute-callout`.
