# Intelligence & OSINT Platform (React)

React 19 + TypeScript + Material UI 7 + MUI X Charts, built with Vite 6 (runs on Node 18).
All data is fictional sample data; crawls are simulated and saved in the browser's localStorage.

```bash
npm install
npm run dev        # http://localhost:5173 with hot reload
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ at http://localhost:4173
          # unit + UI flow tests (vitest)
```



Open the app through `npm run dev` or `npm run preview`. Opening `dist/index.html` directly from the file
system does not work: browsers block module scripts on `file://`.

The sign-in screen is skipped during development: set `SKIP_LOGIN` to `false` in `src/state/reducer.ts`
to show it again (demo MFA code `123456`).

## Where things live

- `src/state/` – app state (`useReducer` + context), the shared 1-second clock for live crawl progress
- `src/lib/osint.ts` – search matching, crawl progress, storage, CSV export (pure functions, tested)
- `src/pages/` – one lazily loaded file per page; `src/dialogs/` – all dialogs
- `src/theme.tsx` – Blueprint-based dark/light palette, IBM Plex type, Carbon motion timings
