# AGENTS.md

## Project Goal
This repository is a cleaned Notion export for a simple static FAQ site hosted on GitHub Pages.

## Content Rules
- Keep source content as plain Markdown (`.md`) files.
- Do not re-introduce Notion metadata blocks such as `notion-id`, `base`, or Notion database view files.
- Do not use Notion-style embeds like `![[...]]`; replace with standard Markdown links or plain text notes.
- Preserve existing FAQ wording unless a user asks for copy edits.

## Site Structure
- `index.md` is the GitHub Pages landing page.
- `Cabin Three - FAQ.md` can remain as the original exported entry page.
- Topic pages live in `FAQ/`.

## Publishing Assumptions
- Target host is GitHub Pages.
- Prefer filename-safe links and standard Markdown link syntax.
- Avoid custom build tooling unless explicitly requested.

## Validation Checklist
Before finishing edits:
1. Ensure no Notion metadata remains:
   - `rg -n "notion-id:|^base:|\!\[\[|\[\[.*\.base\]\]" .`
2. Ensure top-level navigation links resolve.
3. Ensure `index.md` exists for GitHub Pages.
