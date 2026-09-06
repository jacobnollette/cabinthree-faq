# Deployment

Served on **GitHub Pages** at **https://cabinthree.info**. No build step — the
repo root *is* the published site.

## CI workflow (`.github/workflows/pages.yml`)

- Triggers: push to `main` or manual `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write` (Pages
  deployment requires the OIDC token).
- Uses the standard `configure-pages` → `upload-pages-artifact` (path `.`)
  → `deploy-pages` sequence with `concurrency` set so only one deploy runs at
  a time (`cancel-in-progress: false`).

To deploy is simply to push to `main`:

```bash
git add -A
git commit -m "Describe the guest-facing change"
git push origin main
```

## Custom domain

- `cabinthree.info` is a custom domain; the old `faq.cabinthree.info`
  subdomain redirects to it (per `CHANGELOG.md` 1.22.0) so nothing breaks.
- Domain records live outside this repo (DNS/enumeration in GitHub Pages
  settings); the workflow deploys the root with no subpath, so links are
  plain `topic.html?topic=...` relative URLs.

## Static assets checklist

| Asset | Purpose |
| --- | --- |
| `favicon.svg` | Source cabin-tree artwork + homepage logo + `<link rel="icon">` |
| `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Rendered PNG derivatives of the SVG for browser/OS/PWA icons |
| `manifest.webmanifest` | PWA manifest (name, theme colors, icons) |
| `styles.css` | All shared styling (hero, cards, players, callouts, rail, FAB, channel) |

If the SVG tree is redrawn, regenerate the PNGs (see CLAUDE.md "Icons and PWA").

## External dependencies (loaded at runtime)

- **marked.js** — via `cdn.jsdelivr.net`, only on `topic.html`. The render
  pipeline degrades to raw text if it's unreachable.
- **Google Fonts** — Fraunces + Manrope, preconnected in every page head.
- **YouTube IFrame API** — `youtube.com/iframe_api` (channel) and embedded
  `youtube-nocookie.com` players (topic videos). Embedding host is
  cookie-privacy focused.

There is no `package.json`, no dependencies to install, no lockfile, and no
lint/typecheck runner in CI (see the review notes in `spec/README.md`).

## Operating principles

- Relative URLs only — works at any Pages host/path scale.
- Content files are safe to hot-edit; a push is a release.
- Guest-facing changes also bump `CHANGELOG.md` (see `spec/content.md`).