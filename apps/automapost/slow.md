# Windows Dev Server Slow Compile Plan

## Current Symptoms
- `yarn dev` cold start on Windows: ~23 s to compile `/[locale]` (1173 modules).
- Mac dev boxes start noticeably faster, so the slowdown is platform-specific.

## Targets
- Cold start (from `next dev` start to first render) ≤ 8 s.
- Rebuild / hot refresh ≤ 2 s for typical file edits.
- Keep delta between Windows + macOS starts under 30%.

## 1. Instrument & Baseline
- Capture `next dev --profiling --no-lint` output to see which phases dominate (SWC compile, route bundling, ESLint, middleware, etc).
- Run `SET NEXT_PRIVATE__RSC_SERVER_DEBUG=true` and `NEXT_DEBUG_FUNCTION_SIZE=1` once to log oversized server components.
- Track file-count + module-count deltas with `NODE_OPTIONS=--trace-events-enabled` and analyze via Chrome tracing to spot pathological imports.
- Measure antivirus impact by timing `yarn dev` with Defender temporarily paused (with IT approval) to confirm I/O throttling theory.

## 2. Windows-Specific Environment Fixes
- Move repo + node_modules to an NTFS path excluded from Windows Defender + OneDrive.
- Turn off “Real-time protection” only during baseline tests; if it’s the culprit, add folder/process exclusions instead of leaving it off.
- Prefer WSL2 + ext4 disk for day-to-day dev; install Node, PNPM/Yarn, and Postgres inside WSL, then open the workspace via `\\wsl$` or the WSL VS Code server to bypass NTFS watcher bottlenecks.
- Ensure `node-gyp` prerequisites (Python, MSVC) are current so native module rebuilds aren’t retriggered every `yarn install`.
- Enable “Use WSL file watcher” in VS Code (settings `files.watcherExclude` / `files.useExperimentalFileWatcher`).

## 3. Next.js / Build-System Tweaks
- Run `next lint` separately and start dev server with `NEXT_DISABLE_ESLINT=1` (or `next dev --turbo --no-lint`) to avoid linting on every boot.
- Audit `next.config.mjs` for `transpilePackages` or large rewrites; only transpile what’s necessary to cut SWC workload.
- Turn on SWC caching: set `SWC_CACHE_DIR=.swc-cache` and ensure it lives on a fast disk; clear it between profiling runs.
- Split huge route groups: the `/[locale]` page imports most of the app. Evaluate route-level `await import()` or shared layout boundaries to trim the initial bundle.
- Enable `experimental.turbo` (Next 15+) and compare `next dev --turbo` vs legacy builder; keep whichever produces faster hot reloads.
- Add `modularizeImports` for libraries like `lucide-react`, `date-fns`, `lodash` to reduce module count per build.

## 4. Dependency & Code Hygiene
- Remove unused polyfills / global CSS from `app/globals.css`; large CSS forces slower Fast Refresh.
- Replace large JSON dictionaries in `dictionaries/*.json` with lazy-loaded chunks or server-side fetch.
- Review Radix + UI imports; switch to direct component imports to avoid bundling entire packages.
- Ensure dynamic environment flags (`feature-flags.ts`) don’t force server-side reevaluation by memoizing config objects.

## 5. Tooling & Workflow
- Introduce Turborepo task caching (already a monorepo) so `dev`, `lint`, and `test` reuse artifacts when deps unchanged.
- Prebuild Prisma/Drizzle types via `yarn db:generate` before `next dev` to avoid runtime codegen.
- Alias heavy mocks (e.g., `msw`, `playwright`) to noop modules in `tsconfig` during dev to shrink the graph.
- Document a “fast dev” script (e.g., `NODE_ENV=development NEXT_DISABLE_SOURCEMAPS=1 next dev --no-telemetry`) for contributors targeting quick iterations.
- Schedule periodic dependency audits; outdated SWC/Next versions sometimes carry Windows-specific regressions fixed in patch releases.

## Follow-Up
1. Implement instrumentation + Defender/WSL tests this week; record timings in `tests perf.md`.
2. Apply the quickest wins (lint offload, SWC cache, modularized imports) and re-measure.
3. If Windows remains >10 s, spin up WSL2 workflow trial and document setup in `docs/dev-windows.md`.
4. Revisit quarterly: repeat measurements after major dependency bumps.
