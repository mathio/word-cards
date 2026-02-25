# WordCards

Static mobile-first Spanish (Spain) to English learning app using swipe cards, spaced repetition, and quiz mode.

## Stack
- Plain HTML/CSS/JS
- CSV-based data files under `data/`
- Local state in browser `localStorage`
- PWA support via `manifest.json` + `service-worker.js`

## Local run
Use any static server. Example:

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Data
- Category index: `data/categories.csv`
- Word lists: `data/*.csv`
- Regenerate data files:

```bash
node scripts/generate_data.mjs
```

## GitHub Pages
This repo includes `.github/workflows/deploy-pages.yml` to deploy the static site on pushes to `main`.
