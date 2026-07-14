---
name: channel-videos
description: >-
  Keep Cabin Channel 3's video database (channel-videos.json) in sync. Use
  this whenever you add a vertical YouTube Short embed
  (![Title](https://www.youtube.com/shorts/<id>)) to any FAQ page — before
  committing, ask the user whether the new Short(s) should also be added to
  the Cabin Channel 3 feed, and update channel-videos.json accordingly.
  Long-form videos (youtu.be / watch?v=) never go on the channel.
---

# Cabin Channel 3 video database

`channel-videos.json` (repo root) is the channel's database — the ordered
list of Shorts that `channel.html` plays as a swipeable feed. The feed shows
exactly what's in this file, nothing else. Topic pages and the channel are
independent: a Short can be embedded on a topic page without being on the
channel, and vice versa.

## When you add a Short to a FAQ page

1. After adding one or more `![Title](https://www.youtube.com/shorts/<id>)`
   embeds, **ask the user** (use AskUserQuestion when available):
   "Should this Short also be added to Cabin Channel 3?" — one decision per
   video, listing each video's title.
2. If yes, append an entry to the `videos` array in `channel-videos.json`:

   ```json
   { "id": "<video id>", "title": "<the embed's alt text>", "topic": "<topic page title>" }
   ```

   - `id` must exactly match the ID in the embed URL.
   - `title` should match the embed's alt text (it becomes the caption in
     the feed).
   - Keep the array's existing order; new videos go at the end.
3. If no, do nothing — the Short still plays on its topic page.

## Rules

- **Shorts only.** Never add long-form videos (`youtu.be/...` or
  `watch?v=...`) to the channel, even if asked to embed them on a page.
- Don't add duplicate IDs.
- If a Short is removed from the FAQ entirely (e.g. an issue was solved and
  its video deleted), ask whether to remove it from the channel too.
- The watched-memory key in localStorage is `cabin3-watched-shorts`; the feed
  logic lives in `channel.js`. You don't need to touch either when adding
  videos — only `channel-videos.json`.
- A channel change is guest-facing: follow the `update-changelog` skill too.
