# TRIPCHILLER Tilda Code Rules

This repository contains external CSS and JavaScript loaded by a Tilda website.

Work like a lazy senior developer: efficient, surgical, and suspicious of unnecessary code.

The best code is the code that did not need to be written.

## Main files

* `tripchiller.css`
* `tripchiller.js`

## Core mindset

Before writing code, check this ladder:

1. Does this need to be built at all?
2. Can this be fixed by deleting or narrowing existing code?
3. Can existing CSS, Tilda markup, or native browser behavior solve it?
4. Can an existing function/module solve it?
5. Can this be a tiny targeted patch?
6. Only then write the minimum new code that works.

Prefer:

* deletion over addition;
* CSS-only fixes for visual bugs;
* existing selectors over new components;
* existing functions over new modules;
* native browser features over custom JavaScript;
* boring, explicit code over clever abstractions.

## Critical rules

* Use vanilla JavaScript and CSS only.
* Do not add build tools unless explicitly requested.
* Do not add npm dependencies unless explicitly requested.
* Do not use secrets, tokens, passwords, or Tilda account credentials.
* Do not remove existing `window.__TC_...` guard variables unless the user explicitly asks.
* Keep changes localized and minimal.
* Prefer small patches over full rewrites.
* Keep all selectors compatible with Tilda-generated markup.
* Do not edit SEO meta tags, JSON-LD, canonical links, or Open Graph tags unless explicitly requested.
* Answers, PR titles, PR descriptions, and review notes must be in Russian.

## Do not touch unless explicitly requested

Do not change these systems unless the current task directly asks for it:

* mobile burger;
* mobile filters;
* mobile background reveal;
* mobile background assets;
* desktop aura;
* load-more loader;
* product-flow;
* product history/back behavior;
* product return scroll restore;
* product load-more restore;
* sessionStorage return logic;
* catalog/product data;
* prices;
* filters/categories logic.

## TRIPCHILLER design rules

* Main font: Corona / DS VTCorona Cyr.
* BetterVCR is only for ASCII/ARG/system-style inserts.
* Keep the cinematic, archive, punk-luxe, handmade visual language.
* Do not make generic UI-library-looking solutions.
* Shop/catalog logic: one product = one catalog entry.
* Categories, discounts, and states are product properties.
* Filters are slices of the catalog, not duplicated product cards.

## Anti-overengineering rules

* Do not add new abstractions unless explicitly requested.
* Do not create new modules if a small patch to the existing module is enough.
* Do not add `setInterval`.
* Do not add `MutationObserver` unless explicitly requested or absolutely necessary.
* If `MutationObserver` is used, explain why in the PR description.
* Do not add overlay, veil, curtain, backdrop, blur, or modal systems unless explicitly requested.
* Do not rewrite working systems to “clean them up”.
* Do not change unrelated files.
* One task = one focused PR.
* If a fix needs more than 60 added lines, explain in the PR description why a smaller patch was not enough.
* If a fix changes more than two files, explain why.
* If the task can be solved in 5 lines, do not write 50.

## Testing

Before finishing a JavaScript change, run:

```bash
node --check tripchiller.js
```

Before finishing any code change, run:

```bash
git diff --check
```

## PR requirements

Every PR description must include:

* what was changed;
* what was intentionally not touched;
* how it was tested;
* whether the change affects mobile, desktop, product pages, catalog, or global layout.

If the task is visual, preserve or add a small debug helper only when it helps verify real DOM state. Do not add debug helpers as a habit.

## Final rule

Solve the requested problem with the smallest safe diff.

Do not be impressive. Be useful.
