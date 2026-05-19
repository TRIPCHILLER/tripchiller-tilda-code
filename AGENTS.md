# TRIPCHILLER Tilda Code Rules

This repository contains external CSS and JavaScript loaded by a Tilda website.

## Main files

- `tripchiller.css`
- `tripchiller.js`

## Critical rules

- Use vanilla JavaScript and CSS only.
- Do not add build tools unless explicitly requested.
- Do not add npm dependencies unless explicitly requested.
- Do not use secrets, tokens, passwords, or Tilda account credentials.
- Do not remove existing `window.__TC_...` guard variables unless the user explicitly asks.
- Keep changes localized and minimal.
- Prefer small patches over full rewrites.
- Keep all selectors compatible with Tilda-generated markup.
- Do not edit SEO meta tags, JSON-LD, canonical links, or Open Graph tags unless explicitly requested.

## Testing

Before finishing a JavaScript change, run:

```bash
node --check tripchiller.js