# Aoogle — an AI-tools search engine (MVP)

Search by *task*, not by tool name. Type what you're trying to get done —
"remove background from photo", "clone a voice", "review my code" — and
Aoogle ranks the AI tools that actually fit, instead of handing you ten
blog-post links.

This is the Phase 1 MVP from our build plan: a working search + filter
experience over a curated index of 110 AI tools. No backend, no signup —
everything runs in the browser.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview   # serve the built files locally to check them
```

## Project structure

```
src/
  data/tools.js       the tool index — 110 tools, hand-tagged by task
  lib/search.js        the matching/ranking logic (see "How search works")
  components/          SearchBar, TrendingChips, FilterBar, ResultRow
  App.jsx               ties state + components together
  index.css             the whole design system (tokens at the top)
```

## How search works

`lib/search.js` is a small, hand-written relevance scorer — not a generic
fuzzy-search library. Each tool has `tags`: short task phrases a real
person might type ("remove background", "voice clone"). A query is
scored against every tool's name, tags, description and category:

- an exact multi-word phrase match against a tag scores highest
- individual query words matching a tag / name / description add smaller
  scores, weighted in that order
- results below ~35% of the top score are dropped, so a handful of
  loosely-related tools don't dilute a good match

This works well *because* the tags were written deliberately to cover
how people phrase tasks. If search feels off for a query, the fix is
almost always: add the missing phrase to that tool's `tags` array in
`data/tools.js`, not to touch the scoring code.

## Extending it (Phase 2 / 3, from the original plan)

- **More tools**: add objects to `TOOLS` in `data/tools.js`. Keep
  `tags` written as short task phrases, not feature names — that's
  what search actually matches against.
- **Semantic search**: swap the scorer in `lib/search.js` for an
  embeddings-based similarity search (e.g. call an embeddings API,
  cache vectors alongside each tool) if keyword/phrase matching starts
  missing paraphrased queries.
- **Freshness / auto-crawler**: pull new tools from Product Hunt's API
  or GitHub trending on a schedule, and feed them into the same `Tool`
  shape.
- **Reviews & trending**: both need a backend + database (Supabase is
  the easy path) since this MVP has no persistence.

## A note on the data

Tool names, categories and one-line descriptions are hand-curated from
general knowledge. Pricing tiers (Free / Freemium / Paid) and feature
sets in this space change often — treat this as a solid starting index
to keep updated, not a permanently accurate source.
