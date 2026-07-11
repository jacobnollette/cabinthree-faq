---
name: update-changelog
description: >-
  Record a shipped change in CHANGELOG.md and bump the app version per semantic
  versioning. Use this whenever you make a guest-facing change to the Cabin
  Three FAQ site that is about to be committed — editing or adding FAQ topic
  content, adding/renaming/removing a topic, changing embeds/callouts, or
  touching index.html / topic.js / styles.css behavior. Do it as part of the
  same change, before committing, so every release lands in the log.
---

# Update the changelog and bump the version

`CHANGELOG.md` (repo root) is the version history, newest first, following
semantic versioning (`MAJOR.MINOR.PATCH`). It is rendered as a page via the
`changelog` entry in `topic.js` `TOPIC_MAP` and linked from the homepage
footer. Keep it current: every user-facing change gets an entry.

## When to update

Update the changelog for any change guests could notice or that alters site
behavior: new/edited topic content, adding/renaming/removing a topic, new
embeds or callouts, homepage or styling changes, script behavior. Skip it only
for changes with no guest-facing effect (e.g. editing this skill, a typo in a
code comment, CI/tooling).

## Choosing the version bump

Read the current top version in `CHANGELOG.md` and increment from it:

- **PATCH** (`x.y.Z+1`) — copy edits, corrections, a small content addition to
  an existing page (e.g. add one restaurant, fix a password, tweak wording).
- **MINOR** (`x.Y+1.0`) — a new topic, a new feature or system (embed type,
  callout type), a new content section, or a structural consolidation.
  **Slug renames and topic consolidations are MINOR, not MAJOR**, because we
  always add a `TOPIC_ALIASES` redirect so old URLs keep working.
- **MAJOR** (`X+1.0.0`) — only if a guest-facing URL breaks with no redirect
  fallback, or a page/feature is removed with nothing in its place. This has
  never happened; if you think you need it, first ask whether a redirect would
  keep it non-breaking (it usually will).

When a single PR bundles several changes, pick the highest applicable bump and
list each change as its own bullet under that one version.

## How to add the entry

1. Determine today's date (`YYYY-MM-DD`) — use the current date from context,
   not a guess.
2. Insert a new section directly below the intro/policy block and **above** the
   current top version, in this format:

   ```markdown
   ## X.Y.Z — YYYY-MM-DD
   - Short, guest-facing description of what changed.
   - One bullet per distinct change.
   ```

   Write bullets the way a guest would read them (plain, friendly), matching
   the tone of existing entries — not commit-message shorthand.
3. Leave the "Breaking changes to date" line accurate. If you ever ship a true
   MAJOR break, update that line to describe it.
4. Commit the `CHANGELOG.md` change together with the change it documents.

## Notes

- The version lives only in `CHANGELOG.md` — there is no `package.json` or
  version constant to update elsewhere.
- Don't add the changelog as a topic card on the homepage grid; it stays a
  footer link only (already wired via `TOPIC_MAP` + the footer in
  `index.html`).
