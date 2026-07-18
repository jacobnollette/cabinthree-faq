---
name: search-tags
description: >-
  Keep the search's contextual-tag metadata (search-tags.json) in sync as
  content changes, so new content is semantically searchable. Use this
  whenever you add or rename a FAQ topic, or add notable content to a page —
  especially named places on Around Town (restaurants, shops, attractions),
  new appliances or gear, or new sections. Before committing, add matching
  concept tags so guests find the new content by meaning, not just exact
  words.
---

# Search tags: keep semantic search current

`search-tags.json` (repo root) gives each topic a display `category` and a
list of `tags` — concept words the search engine (`search.js`) matches in
addition to the page text. This is what makes "tacos" find Around Town and
"doctor" find Health Care. Tags rank slightly below literal text matches and
show a "· related" attribution chip, so they enrich results without burying
real hits.

## When to update

- **New topic** → add a `search-tags.json` entry keyed by the topic's slug,
  with a short human `category` (shown as a chip on results) and a generous
  `tags` list.
- **New named place on Around Town** (restaurant, shop, attraction) → add
  the words a guest would search for it: cuisine ("mexican", "tacos"), meal
  ("breakfast", "dinner"), type ("bakery", "bookstore", "mini golf"), and
  the town if new.
- **New appliance, gear, or section on any page** → add its synonyms and the
  ways a guest would ask ("hot tub", "sauna", "air fryer", "board games").
- **Renamed topic slug** → move the entry to the new slug key (search looks
  up tags by `TOPIC_MAP` slug).
- **Removed content** → prune tags that no longer point at anything.

## Writing good tags

Think "what would a guest type?", not "what does the page say":

- Synonyms and colloquial forms: "bbq" for grill, "sick"/"hurt" for health,
  "smores" for fire.
- Common misspellings worth catching that the fuzzy matcher won't
  (edit distance > 1), e.g. "expresso" is already covered, but add spellings
  guests actually use.
- Activities and intents: "swimming", "rainy day", "things to do".
- Brand and proper names guests remember ("dyson", "tesla", "weber").

Avoid tags that blanket-match everything ("cabin", "lake" on non-water
topics) — a too-generic tag pollutes every search. Lowercase, no punctuation
needed; multi-word tags are fine (each word is indexed).

## Mechanics

1. Edit `search-tags.json`; keep existing entries and ordering, append new
   tags at the end of a topic's list. No duplicates.
2. Validate the JSON parses (e.g. `python3 -c "import json;json.load(open('search-tags.json'))"`).
3. There is no index build — search picks the file up at runtime.
4. Commit the tag change together with the content change it supports, and
   follow the `update-changelog` skill for the content change as usual (the
   tag update itself doesn't need its own changelog entry).
