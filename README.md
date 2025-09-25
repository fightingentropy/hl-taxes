# HL Taxes Dashboard

Dark, minimal Next.js dashboard that turns a CSV trade export into realized PnL insights and an estimated tax bill—right in your browser.

## Features

- Upload or drag-and-drop a CSV like `trade_history_20:09:2025.csv`; parsing happens entirely client-side.
- Automatic profit aggregation, fee tracking, win/loss metrics, asset breakdowns, and best/worst trades.
- Adjustable short-term and long-term capital-gains rates with live tax recalculation.
- Cumulative PnL chart plus recent position table for quick auditing.
- “Try sample data” button backed by `public/sample-trade-history.csv` for instant demos.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 to interact with the dashboard. Use the built-in sample dataset or drop your own exchange export to see results.

## CSV expectations

Columns should match the example file (`time`, `coin`, `dir`, `px`, `sz`, `ntl`, `fee`, `closedPnl`). The parser pairs open/close rows per asset/side to build position-level results; unmatched opens are surfaced so you know what still needs to close before taxes are accurate.

## Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 with shadcn/ui components
- Recharts for the animated PnL visualization
- PapaParse + Zod for resilient CSV ingestion

All calculations stay local—no API keys or uploads required.
