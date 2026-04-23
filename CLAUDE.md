# CLAUDE.md

This file provides guidance for Claude Code when working in this app.

Part of `console-trotsky-dev`. For cross-app context (other sub-repos, shared conventions, integration points), read `../CLAUDE.md` and `../.ai/`.

## App

`console-trotsky-dev-console-ui` — Internal web dashboard. Displays analytics, logs, and config across portfolio projects. Reads from `analytics-service` aggregation endpoints. Not customer-facing.

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Charts:** Recharts
- **Routing:** React Router v6
- **Auth:** JWT stored in memory (admin login only — no kids ever use this UI)
- **Testing:** Vitest + React Testing Library

## Project Setup

```bash
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL
```

## Commands

```bash
# Dev server
npm run dev       # Vite on :5173

# Build
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Lint / format
npm run lint
```

## Architecture

### Folder structure

```
console-trotsky-dev-console-ui/
├── src/
│   ├── pages/          # Route-level components (Dashboard, Games, Logs, etc.)
│   ├── components/     # Shared UI components (shadcn/ui wrappers, charts)
│   ├── hooks/          # Custom hooks (useAnalytics, useAuth, etc.)
│   ├── lib/            # API client, auth helpers, utils
│   └── main.tsx        # Entry point
├── public/
└── .env.example
```

### Key patterns

- Pages are route-level; components are reusable UI.
- API calls go through a thin client in `src/lib/api.ts` — never call fetch directly in components.
- Auth: JWT in memory (not localStorage — admin-only tool, XSS risk is lower priority but still avoid localStorage for tokens).
- Charts: Recharts components wrapped in `src/components/charts/` — don't use Recharts directly in pages.

### Configuration

- `.env` for environment config — never committed
- `VITE_API_BASE_URL` — analytics-service base URL (e.g. `http://localhost:3001` for dev)

## Code Conventions

- TypeScript throughout
- shadcn/ui components as the base — extend, don't override
- Tailwind utility classes; no custom CSS unless shadcn/ui doesn't cover it
- No inline styles

## Common Tasks

### Add a new dashboard page
1. Create `src/pages/<PageName>.tsx`
2. Add a route in `src/main.tsx` (or router config)
3. Add a nav link in the sidebar component
4. Add an API call in `src/lib/api.ts` if needed

### Add a new chart
1. Add a wrapper component in `src/components/charts/`
2. Use Recharts `ResponsiveContainer` — always make charts responsive
3. Data fetched in the parent page via a hook, passed as props to the chart component

## Important Notes

- Internal tool — polish matters less than function. Ship the data first, style second.
- This UI only ever shows aggregate data — never raw event data with sessionIds. Keep it that way.
- Check `../.ai/TECH_DEBT.md` before flagging issues.
