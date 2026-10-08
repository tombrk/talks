# Talks

Content and supporting material for talks I give

## Slides

Every talk with a slide deck is published to GitHub Pages at
**<https://tombrk.github.io/talks/>**, under the same path as in this repo, e.g.
[`2026/2026-09-dockburg-coding-agents-safely`](https://tombrk.github.io/talks/2026/2026-09-dockburg-coding-agents-safely/).

A talk is picked up when it has a `deck/` folder with a `package.json` whose `build` script
writes `deck/dist/index.html` (a `deck/deck.pdf` is published next to it, if present).
The [`Slides`](.github/workflows/pages.yml) workflow builds all decks on every push and pull
request, and deploys from `main`. To build the site locally: `node .github/pages/build.mjs`
(output in `_site/`).
