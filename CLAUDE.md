# CLAUDE.md

Static FAQ site for Cabin Three guests, hosted on GitHub Pages. No build step:
`index.html` renders topic cards, `topic.html` + `topic.js` fetch a Markdown
file from `FAQ/` and render it in the browser with marked.js. Deploys happen
only on pushes to `main` (`.github/workflows/pages.yml`).

See `AGENTS.md` for general content rules (no Notion metadata, preserve FAQ
wording, etc.).

## Video tutorials: YouTube Shorts embeds

The site embeds YouTube **Shorts only** — no long-form videos until the site
is rewritten.

To add a video tutorial to a topic page, use Markdown image syntax pointing at
the Short's URL:

```markdown
![Dyson vacuum tutorial - basic training - day one](https://www.youtube.com/shorts/cBRnwyKxj9A)
```

How it renders:

- `upgradeShortsEmbeds()` in `topic.js` runs after marked.js parses the page
  and replaces each `<img>` whose `src` is a `youtube.com/shorts/<id>` URL
  with a `<figure class="shorts-player">` containing a vertical (9:16)
  `youtube-nocookie.com` iframe.
- The image alt text becomes the player's accessible title and a visible
  caption below the player — always include one.
- Styling lives in `styles.css` under `.shorts-player`.

Rules:

- Use the full `https://www.youtube.com/shorts/<id>` URL. Strip tracking
  params like `?feature=share`.
- Regular `[text](url)` links are never embedded — use a link when you
  deliberately want plain text, image syntax when you want the player.
- Image syntax with a non-Shorts YouTube URL (watch/youtu.be) is downgraded
  to a plain link at render time, not embedded. Don't add long-form videos.
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
