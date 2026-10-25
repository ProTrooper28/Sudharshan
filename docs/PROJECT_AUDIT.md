# Project Audit

**Project:** APAAR-based Student Data Management & Verification Platform
**Problem statement:** SIH26263
**Repository:** `https://github.com/ProTrooper28/Sudharshan`
**Deployment:** `https://sudharshan-mauve.vercel.app`
**Audit date:** 25 October 2026
**Commit audited:** `dcd5c85 Document SIH26263 prototype project` (single commit, branch `main`)

This document is the technical baseline for the next development phase. It describes what the code actually does, which is the authority here, not what earlier documentation intended. Every status below was checked against source files or a command whose result is recorded in [Appendix D](#appendix-d-verification-log).

---

## 1. Executive Summary

The repository is a **complete, coherent, frontend-only prototype**: a React 19 + TypeScript + Vite single-page application with 41 declared routes, three role shells, a public marketing site and a hand-written CSS design system. It builds cleanly and is deployed.

It contains **no backend, no database, no authentication, no API calls, no persistence and no automated tests**. Every capability specific to SIH26263 (student intake, validation, confirmation, consent, audit, risk scoring, QR credentials, verification) exists only as navigation, static copy or synthetic fixtures.

| Question | Answer |
|---|---|
| Is the application built? | Yes, as a UI prototype. 23 tracked files, about 1,713 lines of application source, all three role shells present. |
| Does it build? | Yes. `tsc -b` exit 0; `vite build` exit 0 on 25 Oct 2026. |
| Is it deployed? | Yes at the root URL. **Every deep link 404s** because the deployment has no SPA rewrite (verified on 3 paths). |
| Is there a backend? | No. |
| Is Supabase integrated? | No. Not a dependency, not imported, no client, no schema. |
| Is there authentication or authorization? | No. Role is a URL prefix. The role selector is navigation, not authorization. |
| Is any real student data present? | No. Only synthetic references such as `STU-DEMO-104` and `APAAR-DEMO-0000`. |
| Are secrets exposed? | None found. No `.env` file is tracked, and the frontend makes no external requests at runtime. |
| Is the APAAR-centric design intact? | Yes, by copy and by the absence of Aadhaar anywhere in `src/`. There is no APAAR data model or adapter. |
| Is anything production-ready? | No, and the UI consistently says so. |

**Most important conclusion for the next phase:** the frontend is a usable, honest shell that should be *extended behind its existing seams*, not replaced. `src/services/api.ts` already defines the intended frontend/backend boundary and is currently unimported, which makes it the natural place to introduce real data access when the backend exists. The immediate release blocker is deployment configuration, not application code.

---

## 2. Repository Structure

### 2.1 Tracked files

```text
.
├── .gitignore                     # node_modules, dist, *.tsbuildinfo, .env*, allows .env.example
├── README.md                      # 31 kB, 28 sections, developer/AI-agent reference
├── TODO.md                        # phase-1 acceptance record (all sections marked complete)
├── plan.md                        # original build plan and design direction
├── app.config.ts                  # inherited scaffold config: one unused CDN logoUrl
├── index.html                     # SPA host page, title "APAAR Record | Student Data Platform"
├── package.json                   # 6 runtime deps, 5 dev deps, pnpm pinned
├── pnpm-lock.yaml                 # lockfileVersion 9.0, committed
├── pnpm-workspace.yaml            # allowBuilds: esbuild
├── tsconfig.json                  # project references only
├── tsconfig.app.json              # strict TS, noUnusedLocals/Parameters, jsx react-jsx
├── vite.config.ts                 # react plugin, host 0.0.0.0, port 3000, strictPort
├── public/
│   ├── apaar-mark.svg             # favicon / brand mark
│   └── manus-routes.json          # static manifest, 41 paths, currently in sync with routes
├── src/
│   ├── app.tsx                    # 52 lines: router, public layout, three role wildcards
│   ├── components.tsx             # 282 lines: 20 shared presentational components
│   ├── layout.tsx                 # 142 lines: AppShell, Sidebar, TopBar, Breadcrumbs, drawer
│   ├── pages.tsx                  # 311 lines: 18 exported page components
│   ├── main.tsx                   # 16 lines: mount, StrictMode, fonts, global CSS
│   ├── styles.css                 # 658 lines: tokens, public site, dashboard, responsive
│   ├── types.ts                   # 37 lines: Role, RouteInfo, NavigationItem, DemoRecord, ActivityItem
│   ├── data/demo.ts               # 188 lines: role metadata, navigation, route info, fixtures
│   └── services/api.ts            # 27 lines: type-only future API boundary, unimported
└── docs/
    └── PROJECT_AUDIT.md           # this document
```

Measured: 23 tracked files before this audit, 41 route paths, 1 commit, branch `main` tracking `origin/main`.

### 2.2 Directories that do not exist

`backend/`, `server/`, `api/`, `ml/`, `supabase/`, `tests/`, `e2e/`, `.github/`. There is no `vercel.json`, `netlify.toml`, `_redirects`, `.env.example`, ESLint config, Prettier config or CI workflow.

### 2.3 Scaffold inheritance

Two files are leftovers from the original hosting scaffold rather than product code:

- `app.config.ts` exports a `manuscdn.com` logo URL that no file imports (grep: 0 references).
- `public/manus-routes.json` is a hosted-tooling route manifest. It is useful as a route inventory but is not read by the application.

Neither is harmful. Neither should be treated as architecture.

---

## 3. Current Technology Stack

### 3.1 Present in the repository (resolved from the lockfile)

| Layer | Technology | Declared | Resolved |
|---|---|---|---|
| UI library | React | `^19.0.0` | 19.3.1 |
| DOM renderer | react-dom | `^19.0.0` | 19.3.1 |
| Routing | react-router-dom | `^7.2.0` | 7.18.4 |
| Language | TypeScript | `~5.7.3` | 5.7.3 |
| Bundler | Vite | `^6.0.11` | 6.4.5 |
| React plugin | @vitejs/plugin-react | `^4.3.4` | 4.7.0 |
| Icons | lucide-react | `^0.468.0` | 0.468.0 |
| Fonts | @fontsource/public-sans, @fontsource/ibm-plex-mono | `^5.2.6` | 5.3.0 |
| Package manager | pnpm | `packageManager: pnpm@11.25.0` | 11.25.0 |
| Styles | Hand-written global CSS (`src/styles.css`) | not a dependency | not applicable |
| Build output | Static SPA in `dist/` | `tsc -b && vite build` | verified |

Runtime used for this audit: Node 22.23.2. The repository does **not** pin a Node version and has no `engines` field.

### 3.2 Deliberately absent (confirmed, not assumed)

| Technology | Status | Evidence |
|---|---|---|
| Tailwind CSS | Not present | no dependency, no `tailwind.config.*`, no `@tailwind` directives |
| shadcn/ui or any component library | Not present | custom components in `src/components.tsx` |
| Convex or any BaaS SDK | Not present | not in `package.json`, no client |
| Express or any Node server | Not present | no dependency, no server entry point |
| Supabase client | Not present | not in `package.json`, no imports |
| Python or ML code | Not present | no `*.py`, no `requirements.txt` |
| State management library | Not present | local `useState` only |
| Data fetching library | Not present | no `fetch`, no axios, no TanStack Query |
| Test runner | Not present | no test script, no test files |
| Linter or formatter | Not present | no config, no script |
| Analytics, cookies, tracking | Not present | no script tags beyond the entry module |

**This project is not a framework starter template.** A future agent must not "restore" Tailwind, shadcn/ui, Convex or a Next.js app router here. The custom CSS system *is* the design system, and `BrowserRouter` *is* the routing choice.

---

## 4. Frontend Architecture

### 4.1 Bootstrapping

```text
index.html
  → /src/main.tsx
      → StrictMode
      → six @fontsource CSS imports (fonts bundled locally; no external font request)
      → ./styles.css
          → <App />
```

### 4.2 Routing model

`src/app.tsx` uses `BrowserRouter` with two routing patterns:

1. **Public routes** share a `PublicLayout` (`<Outlet />` plus `PublicFooter`). Nine paths.
2. **Role routes** use three wildcard mounts: `/aicte/*`, `/college/*`, `/student/*`. Each renders `AppShell` with a fixed `role` prop and a single `RolePage` component.
3. A final `*` route renders `NotFoundPage` with the current path. Unknown paths *inside* a role mount also resolve to `NotFoundPage`, but inside the role shell.

`RolePage` (`src/pages.tsx`) is a **pathname dispatcher**, not a set of `<Route>` elements:

```text
useLocation().pathname
  → strip trailing slash
  → look up routeInfo[path]           (src/data/demo.ts)
  → if missing, or routeInfo[path].role !== mounted role → NotFoundPage
  → if path === "/{role}"                                → role dashboard
  → if path in a small if-chain (students tables, QR, activity/audit, verification, consent)
                                                          → specialised view
  → otherwise                                            → generic PlaceholderPage
```

Consequences that matter for the next phase:

- **Adding a page touches four files**: `pages.tsx` (component and/or if-chain), `data/demo.ts` (`roleRoutes` or `publicRoutes`), `data/demo.ts` (`navigation`, for sidebar links) and `public/manus-routes.json`. There is no single source of truth and no route-generation step. Today the four are in sync (41/41 verified); the drift risk is structural.
- **No route-level code splitting.** All pages are imported eagerly by `app.tsx`.
- **No scroll restoration and no hash scrolling.** Nothing listens to route changes to reset scroll, and the `/#platform` nav target does not scroll because `<Link>` uses `pushState`, which browsers do not auto-scroll.
- **No route guards.** Role is determined solely by which wildcard mount matched.

### 4.3 State and data flow

- Component-local `useState` only: mobile menu state, table search, table tab, a login message.
- One `useMemo` (table filtering) and one `matchMedia` subscription (`AppShell`) with cleanup.
- No React context, no store, no persistence, no server state.
- Pages import fixtures directly from `src/data/demo.ts`. The API module is not in the graph.

### 4.4 Styling architecture

A single 658-line global stylesheet, no CSS modules and no utility framework.

| Aspect | Detail |
|---|---|
| Tokens | Two `:root` blocks in the same file: lines 1 and 576. The second silently overrides colour, spacing and radius tokens. |
| Colour literals | 184 unique hex values, many inline in rules rather than tokens |
| Breakpoints | Three, applied in several separate blocks: `1120px`, `850px`, `620px`; drawer behaviour at `850px` |
| Reduced motion | Honoured globally (`prefers-reduced-motion: reduce`, line 565) |
| Layout | CSS Grid shell: `258px` sidebar + fluid workspace; content max width `1500px` |
| Type | Public Sans (UI) + IBM Plex Mono (identifiers, timestamps, labels); root 16px, body 14px |
| Radii and shadows | Small (2 to 7px), restrained; no gradients, no glassmorphism |

The visual direction is coherent and matches the README. The token duplication is a maintainability problem, not a visual one.

### 4.5 Layout shell

`AppShell` (`src/layout.tsx`) owns the sidebar, top bar, main region, footer and the mobile drawer. It implements: skip link, `inert` and `aria-hidden` on the collapsed drawer, `role="dialog"` plus `aria-modal` when open as a drawer, first-focus, Tab/Shift+Tab cycling, Escape to close, focus restore to the menu button, `aria-controls="role-navigation"`, and `aria-current="page"` on the active link.

This is the most carefully engineered part of the application and should be preserved.

---

## 5. Route Inventory

Status definitions used below:

| Status | Meaning |
|---|---|
| **Functional** | The page renders and its own interactive behaviour works against static content. No data service implied. |
| **Mock** | Renders synthetic fixtures as if they were records. No persistence, no submission. |
| **UI-only** | Renders a truthful explanatory screen with no working operation. |
| **Partial** | Some real interface behaviour exists, but the described workflow does not. |
| **Planned** | Renders the shared placeholder panel ("coming in next implementation phase"). |
| **Broken** | Fails at runtime or in the deployed environment. |

**Deployment note that applies to every non-`/` row:** on the live Vercel deployment, direct navigation or refresh on any of these paths returns HTTP 404 (verified for `/college/students`, `/prototype/access`, `/student`). In-app client-side navigation works. See §11.4 and §17.

### 5.1 Public routes (9)

| Route | Purpose | Current State | Data Source | Notes |
|---|---|---|---|---|
| `/` | Landing page | **Functional** | Static copy in `pages.tsx` | Single-screen introduction: light rule, oversized wordmark, uppercase tagline, short description and a Get Started action into `/login`. Public links other than login live in the footer. |
| `/about` | Concept explanation | **Functional** | Static copy | Long-form prose plus prototype-boundary aside. |
| `/security` | Intended security/privacy principles | **Functional** | Static copy | Five numbered principles plus explicit "no compliance claim" notice. |
| `/login` | Entry screen | **UI-only** | None | Form submits nothing: `preventDefault` then `navigate('/prototype/access')`. Portal selection is ignored. Inputs are uncontrolled and never read. Not authentication. |
| `/prototype/access` | Role picker | **Functional** (as navigation) | `roleDetails` | Three role cards link to `/{role}`. No session, no authorization, no persistence. |
| `/privacy` | Privacy policy draft | **UI-only** | `legalContent` constant | Draft sections, warning notice. Not a legal document. |
| `/terms` | Terms draft | **UI-only** | `legalContent` constant | Draft. |
| `/cookies` | Cookie policy draft | **UI-only** | `legalContent` constant | States no analytics/cookie tracking is implemented. Accurate. |
| `/contact` | Contact | **UI-only** | None | Empty state: no contact channel exists. |

### 5.2 AICTE routes (10)

| Route | Purpose | Current State | Data Source | Notes |
|---|---|---|---|---|
| `/aicte` | Oversight dashboard | **Mock** | `demoRecords`, `demoActivity` | Four qualitative stat cards ("Illustrative", "Not connected"), demo timeline, 2-row table. All labelled Demo Data. |
| `/aicte/institutions` | Institution list | **Planned** | None | Generic placeholder panel. |
| `/aicte/students` | Student records | **Mock** | `demoRecords` (3 rows) | Search + tab filter operate on the 3 fixtures only. |
| `/aicte/warnings` | Flagged warnings | **Planned** | None | Placeholder. |
| `/aicte/review` | Review queue | **Planned** | None | Placeholder. |
| `/aicte/risk` | Risk analytics | **Planned** | None | Placeholder. |
| `/aicte/audit` | Audit trail | **Mock** | `demoActivity` | Rendered as an activity timeline, explicitly not an audit trail. |
| `/aicte/reports` | Reports | **Planned** | None | Placeholder. |
| `/aicte/verification` | Verification | **UI-only** | None | "Verification is not connected" panel. |
| `/aicte/settings` | Settings | **Planned** | None | Placeholder. |

### 5.3 College Official routes (11)

| Route | Purpose | Current State | Data Source | Notes |
|---|---|---|---|---|
| `/college` | Institution dashboard | **Mock** | `demoRecords`, `demoActivity` | Workflow strip, three qualitative stat cards, embedded 3-row table with search. |
| `/college/students` | Student records | **Mock** | `demoRecords` (3 rows) | Search and tab filter only. |
| `/college/students/add` | Add student | **Planned** | None | Placeholder. No form exists; the README already states that intake is not implemented. |
| `/college/students/upload` | Bulk upload | **Planned** | None | Placeholder. No file input, no parser. |
| `/college/validation` | Validation results | **Planned** | None | Placeholder. No rules engine. |
| `/college/flagged` | Flagged records | **Planned** | None | Placeholder. |
| `/college/submission` | Submission status | **Planned** | None | Placeholder. |
| `/college/confirmation` | Student confirmation | **Planned** | None | Placeholder. No requests, no responses. |
| `/college/credentials` | QR / credentials | **UI-only** | None | Non-scannable QR placeholder plus "not issued" notice. |
| `/college/activity` | Audit / activity | **Mock** | `demoActivity` | Same synthetic activity list as other roles. |
| `/college/settings` | Settings | **Planned** | None | Placeholder. |

### 5.4 Candidate / Student routes (11)

| Route | Purpose | Current State | Data Source | Notes |
|---|---|---|---|---|
| `/student` | Record overview | **Mock** | Local literals + `demoActivity` | Banner shows `APAAR-DEMO-0000` and an illustrative "Confirmation pending" badge. This is the only role dashboard with no sidebar entry. |
| `/student/profile` | Profile | **Planned** | None | Placeholder. |
| `/student/academic-record` | Academic record | **Mock** | `demoRecords` (3 rows) | Reuses `RecordsTable`; synthetic only. |
| `/student/verification` | Verification status | **UI-only** | None | "Verification is not connected" panel. |
| `/student/activity` | Data activity | **Mock** | `demoActivity` | Says no events are recorded. |
| `/student/qr` | My QR | **UI-only** | None | Placeholder QR, "No credential issued". |
| `/student/consent` | Consent | **UI-only** | None | Explains the future consent shape. Nothing is granted or stored. |
| `/student/documents` | Documents | **Planned** | None | Placeholder. |
| `/student/notifications` | Notifications | **Planned** | None | Placeholder. |
| `/student/verification-history` | Verification history | **Planned** | None | Placeholder. |
| `/student/settings` | Settings | **Planned** | None | Placeholder. |

### 5.5 Route summary

| Classification | Count | Routes |
|---|---|---|
| Functional (static content plus working navigation) | 4 | `/`, `/about`, `/security`, `/prototype/access` |
| UI-only | 10 | `/login`, `/privacy`, `/terms`, `/cookies`, `/contact`, `/aicte/verification`, `/college/credentials`, `/student/verification`, `/student/qr`, `/student/consent` |
| Mock | 9 | `/aicte`, `/aicte/students`, `/aicte/audit`, `/college`, `/college/students`, `/college/activity`, `/student`, `/student/academic-record`, `/student/activity` |
| Planned (generic placeholder) | 18 | AICTE 6, College 7, Student 5 |
| **Total** | **41** | Matches `public/manus-routes.json` exactly |

Broken in the current production deployment: all 40 non-`/` paths return 404 on direct load. That is a hosting configuration defect, not a per-route classification, so it is not counted in the table above.

Clicking a sidebar link and landing on a rendered page is **not** evidence that the workflow exists. For 18 routes the destination is the same generic panel.

---

## 6. Component Architecture

### 6.1 Shared components (`src/components.tsx`)

| Component | Purpose | Used by | Notes |
|---|---|---|---|
| `Brand` | SVG mark + wordmark | Header, sidebar, footer, 404 | `compact` variant |
| `PageHeader` | `h1`, eyebrow, description, actions | 13 call sites | Consistent page top |
| `SectionHeader` | `h2` plus optional action | 7 call sites | |
| `StatCard` | Label, value, detail, icon | Dashboards | Values are qualitative strings, not metrics |
| `StatusBadge` | Tone-coded text badge | Tables, banners | Dot plus text, so status is not colour-only |
| `Notice` | Inline info/warning/success panel | 10 call sites | `role="note"` |
| `EmptyState` | Empty/absent content block | Contact page | |
| `DataTable` | Presentational table | 2 call sites | Requires `caption`; `role="region"`, `tabIndex=0`, `scope="col"`, `<caption>` for screen readers |
| `SearchBar` | Search input | College/AICTE student tables | `useId` label, clear button |
| `FormField` | Labelled input with hint/error wiring | Login | Wires `aria-invalid` and `aria-describedby` |
| `SelectField` | Labelled select | Login portal select | |
| `Tabs` | Two-button filter | Student tables | `role="group"`, `aria-pressed` (not a tablist) |
| `ActivityTimeline` | Ordered event list | 4 call sites across dashboards and activity pages | |
| `QRPlaceholder` | Non-scannable QR graphic | QR routes | `role="img"` with label |
| `PublicFooter` | Legal and login links | Public layout | |

### 6.2 Components defined but never referenced

| Component | References outside its definition | Consequence |
|---|---|---|
| `FilterBar` | 0 | Dead code |
| `Pagination` | 0 | Dead code; no table paginates |
| `ConfirmationDialog` | 0 | Dead code |
| `Modal` | 1 (only inside `ConfirmationDialog`) | Unreachable in the rendered UI, so its accessibility gaps are latent, not live |
| `AuditTimeline` | 0 | Dead code |

These were built to satisfy the previous phase's TODO list but were never wired to a screen. Do not assume they are production-ready: `Modal` has no Escape handler, no focus trap, no focus restore and a hardcoded `id="modal-title"`.

### 6.3 Composition and file organisation

`src/layout.tsx` (`AppShell`, `Sidebar`, `TopBar`, `Breadcrumbs`) and `src/pages.tsx` (18 exported page components, plus local `PublicHeader`, `PublicPageFrame`, `RecordsTable`, `WorkflowStrip`, `QrCard` and dashboard functions) hold the rest.

Observations:

- `pages.tsx` at 311 lines is still manageable, but it mixes seven public pages, three dashboards, a dispatcher, legal content and specialised record views. It will not scale to real workflows without splitting. Do this gradually while adding pages, not as a speculative refactor.
- `DataTable` rows are typed as `Record<string, ReactNode>` and read `row.rowKey ?? row.id` through the index signature. It works, but the typing is loose; a typed generic row is worth introducing when the table gets sorting, pagination or server data.
- No barrel files, no path aliases. Imports are relative (`./components`, `../types`). Fine at this size.

---

## 7. Current Data Sources

### 7.1 Inventory

| Source | Location | Content | Reach |
|---|---|---|---|
| Synthetic fixtures | `src/data/demo.ts` | `demoRecords` (3), `demoActivity` (3) | 9 routes plus 2 dashboards |
| Role metadata | `src/data/demo.ts` | `roleDetails`, labels, summaries, dashboard names | Role picker, sidebar, top bar, breadcrumbs |
| Navigation config | `src/data/demo.ts` | 10 / 11 / 10 sidebar items | Sidebar only |
| Route metadata | `src/data/demo.ts` | 41 path/title/description/role entries | Top bar, page headers, dispatcher |
| Page constants | `src/pages.tsx` | `publicNav`, `legalContent` | Landing header, 3 legal pages |
| Inline literals | `src/pages.tsx` | Stat card values, notices, workflow labels, all marketing copy | Nearly every page |
| Component state | `src/pages.tsx`, `src/layout.tsx`, `src/components.tsx` | Search query, active tab, menu open, login message, modal open | Session only, not persisted |

### 7.2 Confirmed absent

Greps over `src/`, `public/` and `index.html` return **zero** matches for: `fetch(`, `axios`, `localStorage`, `sessionStorage`, `document.cookie`, `console.`, `supabase`, `express`, `import.meta`, and any environment variable access. There is no context provider, no reducer, no cache and no mock service worker.

### 7.3 Data-flow summary (current)

```text
Landing / About / Security / Legal / Contact
    ↓
Static copy in src/pages.tsx
    ↓
Rendered HTML (no data)

Role dashboard
    ↓
src/data/demo.ts exports (demoRecords, demoActivity)
    ↓
StatCard / DataTable / ActivityTimeline
    ↓
Synthetic rows and events, labelled "Demo Data"

Student records / Academic record table
    ↓
RecordsTable local state (query, tab)
    ↓
useMemo filter over 3 fixtures
    ↓
DataTable rows (browser only, nothing saved)

Login form
    ↓
preventDefault()
    ↓
navigate('/prototype/access')      <-- credentials are never read
```

### 7.4 Intended future flow (not implemented)

```text
Page
    ↓
src/services/api.ts (ApiService: get/post against /api)
    ↓
Node.js + Express
    ↓
Supabase PostgreSQL (service-role key server-side only)
    ↓
Audit log, validation results, consent records
```

`src/services/api.ts` defines `API_PREFIX = '/api'`, `ApiEnvelope<T>`, `ApiError` and an `ApiService` interface. It is **not imported anywhere** and performs no I/O. It is a documented seam, not a working client.

---

## 8. Existing Backend

**Backend not currently implemented.**

| Check | Result |
|---|---|
| Express or other server dependency | None in `package.json` |
| Server entry point (`server.*`, `app.*`, `index.*` at project root) | None |
| API route handlers or controllers | None |
| Middleware | None |
| Database layer | None |
| `process.env` reads | None |
| Serverless functions (`api/`, `netlify/functions/`) | None |
| CORS, proxy or dev-server proxy config | None (`vite.config.ts` has no `server.proxy`) |
| Runtime scripts | `dev`, `build`, `preview` only |

The only served "endpoint" is the static file `public/manus-routes.json`. There is no second architecture to preserve and none should be invented ahead of Phase C.

---

## 9. Existing Supabase Integration

### Supabase status: **Not present**

| Check | Result |
|---|---|
| Dependency (`@supabase/supabase-js`) | Absent |
| Imports of a Supabase client | None |
| Client factory / singleton | None |
| Environment variables (`VITE_SUPABASE_*` or otherwise) | None |
| Queries, RPCs, realtime subscriptions | None |
| Authentication calls | None |
| Storage buckets | None |
| Migrations or SQL files | None |
| Row Level Security policies | None |
| Edge functions | None |
| `.env.example` documenting required keys | None |

Do not create the schema in this phase. When it is created:

- the **service-role key must never reach the browser**; any `VITE_`-prefixed variable is embedded in the public bundle;
- browser access should go through the Express API (the `api.ts` seam), with Supabase used server-side;
- if direct browser access to Supabase is ever introduced, RLS policies become the authorization boundary and must be designed with the schema, not after it.

---

## 10. Authentication and Role Handling

### 10.1 What exists

| Mechanism | Implementation | Verdict |
|---|---|---|
| Role type | `type Role = 'aicte' \| 'college' \| 'student'` (`src/types.ts`) | Compile-time only |
| Role selection | Three `<Link>` cards on `/prototype/access` | Navigation, not authentication |
| Role assignment | Fixed by which wildcard route mount renders (`<RoutedRole role="..." />`) | Route-based, unguarded |
| Role coherence check | `RolePage` rejects a path whose `routeInfo.role` disagrees with the mounted role | Prevents cross-role pages inside a shell; not authorization |
| Session / token / cookie | None | No identity at all |
| Route guards / `RequireAuth` | None | Any URL is directly reachable |
| Login | `<form onSubmit>` calls `preventDefault()` then navigates | Credentials never read, never sent |
| Guest access | `Link` to `/prototype/access` | No distinction from login |
| Logout | "Change role" / "Switch prototype role" links | Just navigation |

### 10.2 Findings

- **Role selection is not authentication and is not authorization.** It is a set of client-side links. `curl`-equivalent access to `/aicte/students` renders exactly the same page.
- The login page contains a **false affordance**: a "Portal" select (AICTE / College Official / Candidate) whose value is never read, and a submit button that always lands on the role picker. A user who chooses "AICTE" and submits expects the AICTE workspace; they get the picker. This is intentional for a prototype but must be replaced, not extended, in Phase C.
- Password fields are present with `autoComplete="current-password"` and `required`, but no validation, error display or storage. No credentials are collected anywhere.
- The role model itself is sound and reusable: a single `Role` union, per-role navigation config and per-role shells mean a real authorization layer can be added without restructuring the UI. What is missing is the server side: authentication, session, role claims and **server-enforced authorization on every request**.
- Navigation gap: `/student` (the student's overview) has **no sidebar entry**. `navigation.student` starts at `/student/profile`, so students cannot return to their overview from within the shell; only breadcrumbs, the role picker URL or the browser's back button work.

**Required future enforcement:** a role string in a URL is never sufficient. The backend must authorize each operation from a verified session, and the frontend must treat every role-derived view as a convenience only.

---

## 11. Security Audit

### 11.1 Secrets and sensitive data

| Check | Result |
|---|---|
| Tracked `.env` / `.env.*` files | None. `.gitignore` ignores `.env` and `.env.*`, permits `.env.example` |
| API keys, tokens, passwords in source | None found |
| Supabase service-role key | None (no Supabase at all) |
| Hardcoded credentials in `app.config.ts` | No. It contains a public CDN logo URL only |
| Real Aadhaar numbers | None, and no Aadhaar references anywhere in `src/` |
| Real APAAR IDs | None. Only `APAAR-DEMO-0000` as display text |
| Real personal information | None. Names are "Candidate example"; references are `STU-DEMO-*` |
| Sensitive data in URLs | None. Only role path segments; no identifier query parameters |
| `console.*` logging | None |
| `dangerouslySetInnerHTML` | None; all content is escaped by React |
| Third-party runtime requests | None. Fonts are bundled locally; no analytics, no CDN script |

No secret was discovered, so there is nothing to redact. Do not treat this as a security review of a deployed service; it is a repository inspection.

### 11.2 Client-side risks

| Risk | Current exposure | Becomes critical when |
|---|---|---|
| Authorization exists only in the client | None today (all data is fake) | Any real student data exists |
| No CSP or security headers configured in the repo | Unknown; hosting defaults apply, no `vercel.json` to inspect | Public deployment with real data |
| `VITE_`-prefixed variables are publicly embedded | None exist yet | Any backend secret is mistakenly prefixed |
| No input validation layer | Login inputs unused; no forms submit | Student intake exists |
| Dev server binds `0.0.0.0:3000` with `strictPort` | Development only; expected in this managed workspace | Should not be exposed publicly |

### 11.3 Dependency and supply-chain posture

- Six runtime dependencies, all mainstream and narrowly scoped. `pnpm-lock.yaml` is committed (lockfile 9.0) and `pnpm install --frozen-lockfile` succeeds.
- `pnpm-workspace.yaml` allows build scripts for `esbuild` only. That is a reasonable minimal allowance.
- No automated vulnerability scan has been run, and none should be claimed. Add `pnpm audit` to CI in Phase A if desired.

### 11.4 Deployment security and availability

- Repository contains **no deployment configuration**. How `https://sudharshan-mauve.vercel.app` is built and routed is not encoded here, so the next contributor cannot reproduce or reason about production from the repo.
- **Verified defect:** the deployment serves `/` with HTTP 200, but `/college/students`, `/prototype/access` and `/student` all return HTTP 404. A `BrowserRouter` SPA requires a catch-all rewrite to `/index.html` (for example a `vercel.json` rewrite, or a host-level SPA fallback). This is a release blocker and an availability/UX problem, not a code vulnerability.
- No security headers, cache policy or rewrite rules are versioned. Phase A should add and document them.

**Security verdict:** clean today because the app is inert and data-free. The architecture has no security boundary to preserve, and also none to rely on. Everything sensitive must land behind the Express API in Phase C.

---

## 12. SIH26263 Feature Audit

### 12.1 Institution (College Official)

| Feature | Current Status | Existing Evidence | Gap | Priority |
|---|---|---|---|---|
| Dashboard | **Mock** | `/college` with workflow strip, 3 qualitative stat cards, 3-row table | No real submission, validation or confirmation state | P1 |
| Student records | **Mock** | `/college/students`, `RecordsTable` over 3 fixtures, search + tab | No record store, no APAAR identity, 3 rows hardcoded | P0 |
| Add student | **Planned** | `/college/students/add` generic placeholder | No form, no schema, no validation, no save | P0 |
| Bulk upload | **Planned** | `/college/students/upload` placeholder | No file input, parser, template, row errors or batch model | P0 |
| Validation results | **Planned** | `/college/validation` placeholder | No rules engine, no issue model, no results view | P1 |
| Flagged records | **Planned** | `/college/flagged` placeholder | No flagging, no resolution workflow | P1 |
| Submission status | **Planned** | `/college/submission` placeholder | No batch, no submission state machine, no receipts | P1 |
| Student confirmation | **Planned** | `/college/confirmation` placeholder | No requests, no responses, no notification channel | P2 |
| QR / credentials | **UI-only** | `QRPlaceholder`, `/college/credentials`, `QrCard` | No issuance, signing, expiry or revocation | P3 |
| Audit / activity | **Mock** | `/college/activity` shows `demoActivity` | Nothing is recorded; no actor, target or immutable log | P2 |

### 12.2 Candidate / Student

| Feature | Current Status | Existing Evidence | Gap | Priority |
|---|---|---|---|---|
| Profile | **Planned** | `/student/profile` placeholder | No identity, no profile model | P2 |
| Academic record | **Mock** | `/student/academic-record` reuses the 3 fixture rows | Not tied to a student, no enrolment fields | P2 |
| Verification status | **UI-only** | `/student/verification` "not connected" panel | No verification states, no issuer | P3 |
| Data activity | **Mock** | `/student/activity` demo timeline | No event history, no transparency log | P2 |
| QR | **UI-only** | `/student/qr`, `QRPlaceholder` | Not scannable, no credential | P3 |
| Consent | **UI-only** | `/student/consent` explains the shape | Nothing granted, withdrawn or stored | P2 |
| Documents | **Planned** | `/student/documents` placeholder | No storage, no access control | P3 |
| Notifications | **Planned** | `/student/notifications` placeholder | No delivery channel, no read state | P2 |
| Verification history | **Planned** | `/student/verification-history` placeholder | No verification events | P3 |

### 12.3 AICTE

| Feature | Current Status | Existing Evidence | Gap | Priority |
|---|---|---|---|---|
| Dashboard | **Mock** | `/aicte` qualitative stats, workflow strip, 2-row table | No aggregate data, no official feed | P1 |
| Institutions | **Planned** | `/aicte/institutions` placeholder | No institution model or list | P1 |
| Student records | **Mock** | `/aicte/students` 3 fixtures with search | No oversight data, no cross-institution view | P1 |
| Warnings | **Planned** | `/aicte/warnings` placeholder | No warning generation or lifecycle | P1 |
| Review queue | **Planned** | `/aicte/review` placeholder | No case model, assignment, decision or SLA | P1 |
| Risk analytics | **Planned** | `/aicte/risk` placeholder | No risk scores, no explanation surface | P2 |
| Audit trail | **Mock** | `/aicte/audit` demo timeline | No append-only log, no actor attribution | P2 |
| Reports | **Planned** | `/aicte/reports` placeholder | No export, no report templates | P3 |
| Verification | **UI-only** | `/aicte/verification` "not connected" panel | No verification desk, no credential checks | P3 |

### 12.4 Platform capabilities

| Capability | Current Status | Gap |
|---|---|---|
| Validation engine | **Not implemented** | No rules, no issue taxonomy, no severity model, no evidence trail |
| Duplicate detection | **Not implemented** | No identity key, no fuzzy matching, no duplicate groups |
| Intake / seat-limit checks | **Not implemented** | No seat configuration, no institution-level counts |
| Cross-institution conflict | **Not implemented** | No institution linkage on any record |
| Student confirmation | **Not implemented** | No request, token, response, expiry or audit |
| Consent | **Not implemented** | No consent record, purpose, recipient, withdrawal |
| Audit trail | **Not implemented** | Only synthetic timeline items; no persistence, no immutability |
| QR credentials | **Not implemented** | Only a decorative CSS grid |
| Verification | **Not implemented** | No verifier role, no token validation, no scoped disclosure |
| Revocation | **Not implemented** | No credential lifecycle |
| Mock APAAR service | **Not implemented** | Only display strings; no adapter, no format rules, no resolution |
| ML anomaly detection | **Not implemented** | No model, data, features, evaluation or service |
| Risk scoring | **Not implemented** | No score, no factors, no thresholds, no reviewer explanation |

### 12.5 APAAR architecture check

| Requirement | Status | Evidence |
|---|---|---|
| APAAR is the stated primary student identity | **Upheld in copy** | Landing tagline and description, About, student banner `APAAR-DEMO-0000` |
| APAAR is structurally modeled | **Not yet** | No `apaarId` field, type, format rule or adapter; demo records use institution-style `STU-DEMO-*` references only |
| Institution enrolment numbers allowed as secondary IDs | **Compatible** | `STU-DEMO-*` reads as an institution-level reference, which the target model permits |
| Aadhaar is not the primary identity | **Upheld** | Zero Aadhaar references in `src/`; README states the rule explicitly |
| No real Aadhaar or APAAR data | **Upheld** | All identifiers are clearly synthetic |
| No claim of live APAAR integration | **Upheld** | Repeated prototype disclosures on landing, login, about and footer |

Nothing in the UI contradicts the intended identity model. What is missing is the model itself: Phase B should introduce `apaar_id` as the primary key on the student identity record, with institution enrolment numbers as scoped secondary identifiers, and a mock APAAR adapter (format validation plus deterministic synthetic lookup) so intake and validation can be built against a stable seam without pretending to integrate.

---

## 13. UI/UX Audit

### 13.1 Strengths to preserve

- Coherent institutional identity: warm paper surfaces, deep evergreen accent, sand rule marks, thin borders, 3 to 5px radii. No purple gradients, neon, glassmorphism, pill buttons, emoji UI, fake logos, testimonials or statistics.
- Honest labelling: "Demo Data", "PROTOTYPE", per-page notices, and an explicit boundary sentence on every surface that could be mistaken for a live service.
- Real administrative tables: `<caption>`, monospaced identifiers, tabular numerals, hover rows, horizontal scroll rather than card-per-row collapse.
- Strong typographic pairing and a consistent index-number motif that carries through public and role screens.
- Motion is limited to colour and drawer transitions and is disabled under reduced motion.

### 13.2 Meaningful issues

| # | Issue | Where | Impact | Priority |
|---|---|---|---|---|
| 1 | Two `:root` token blocks; the second (line 576) silently overrides the first | `src/styles.css` | Editing the first block appears to do nothing; blocks theming work | P1 |
| 2 | Student shell has no link to the student overview | `navigation.student` in `src/data/demo.ts` | Inconsistent with AICTE/College; overview is orphaned inside the shell | P1 |
| 3 | Two sidebar items highlight at once on `/college/students/add` | Active-link test in `src/layout.tsx` (`startsWith(path + '/')`) | Navigation state is visibly wrong on a real route | P1 |
| 4 | No scroll reset on route change; `/#platform` does not scroll | `app.tsx` (no `ScrollRestoration`), `publicNav` in `pages.tsx` | Users land mid-page after navigation; the "Platform" nav link appears to do nothing | P1 |
| 5 | Login portal select does not influence destination | `LoginPage` in `src/pages.tsx` | False affordance; selecting AICTE still lands on the role picker | P2 |
| 6 | 18 distinct routes resolve to one identical placeholder panel | `PlaceholderPage` | Many sidebar destinations are indistinguishable; hard to tell planned areas apart at a glance | P2 |
| 7 | Ten separate `Notice` banners across role screens | Dashboards, tables, activity, QR, consent | Repetition risks banner blindness and dilutes the label that matters | P2 |
| 8 | Stat cards mix qualitative status ("Not connected", "Planned") into a metric-shaped grid | Three dashboards | Reads as a dashboard that failed to load rather than an honest preview | P2 |
| 9 | Dead brand config pointing at an external CDN logo that the app never uses | `app.config.ts` | Confuses branding ownership; unnecessary external reference | P3 |
| 10 | Naming drift: the package is `apaarhub` while the product, repo and deployment use Sudharshan | `package.json`, repo, URL | Onboarding friction only | P3 |
| 11 | `aria-label` on a plain `<div>` (no role) in the hero | `LandingPage` `hero-register` | Label may be ignored by assistive technology | P3 |

No redesign is warranted. Items 2, 3 and 4 are ordinary defects that belong in Phase A; the rest are judgement calls for later polish.

---

## 14. Accessibility Audit

### 14.1 Present and correct

- Skip link to `#main-content`; `main` has `tabIndex={-1}`.
- Semantic landmarks: `header`, `nav` (labelled), `main`, `aside`, `footer`.
- One `h1` per screen; `h2` for sections; no skipped levels found.
- Tables: `<caption>` (visually hidden), `scope="col"`, `role="region"` with `aria-label` and `tabIndex=0` on the scroll container.
- Active navigation uses `aria-current="page"`.
- Mobile drawer: `aria-expanded`, `aria-controls`, `role="dialog"`, `aria-modal`, first focus, Tab trap, Escape, focus restore, `inert` when collapsed.
- Global `:focus-visible` outline (`3px #a77d35`, offset 3px).
- `prefers-reduced-motion` honoured globally.
- Form fields: `useId`-based label association, `aria-invalid`, `aria-describedby` for hint and error.
- Status is text plus dot, not colour alone; badges are readable without colour.
- QR placeholder exposed as `role="img"` with a meaningful label.
- Search input has a visually hidden label and a labelled clear button.
- Decorative icons consistently `aria-hidden="true"`.

### 14.2 Issues

| # | Issue | Where | Impact |
|---|---|---|---|
| 1 | Several small muted text colours fall below 4.5:1 | see contrast table | Low-vision readability, compounded by 9 to 12px type |
| 2 | `Modal` has no Escape handling, no focus trap, no focus restore, no initial focus, and a hardcoded `id="modal-title"` | `components.tsx` | Unusable with keyboard; duplicate IDs if two dialogs mount. Latent today because no route renders it |
| 3 | `Tabs` uses `role="group"` with `aria-pressed`, not `tablist`/`tab`/`tabpanel`, has a hardcoded group label, and no arrow-key support | `components.tsx` | Acceptable as a filter control, misleading if reused as tabs |
| 4 | Public mobile menu has no Escape close and no `aria-controls`; the toggle icon is a rotated chevron | `pages.tsx` `PublicHeader` | Keyboard users must tab to a link to close |
| 5 | Filtering a table changes the row count with no live announcement | `RecordsTable` | Screen reader users get no feedback that the result set changed |
| 6 | Login validation relies on native required-field bubbles; no inline error text despite `FormField` supporting it | `LoginPage` | Inconsistent error experience |
| 7 | No focus move to `main` after client-side navigation | `AppShell` | Keyboard and screen reader users stay at the previous focused element |
| 8 | `aria-label` without a role on the hero register panel | `LandingPage` | Label may not be announced |
| 9 | Icon-only buttons are 38px | `.icon-button` | Below the 44px touch target guidance |
| 10 | At ≤850px the top-bar "Change role" link is icon-only; at ≤620px it is hidden | `layout.tsx`, `styles.css` | Discoverability loss for role switching on small screens |

### 14.3 Measured contrast (WCAG 2.x relative luminance, computed)

| Pair | Ratio | Small-text requirement |
|---|---|---|
| `--muted` `#626f69` on paper `#fffefa` | 5.21 | Pass |
| `--accent` `#155448` on paper | 8.69 | Pass |
| Table header `#53645b` on `#f3f1e8` | 5.55 | Pass |
| Sidebar link `#576564` on `#f8f7f0` | 5.67 | Pass |
| Stat card label `#68746c` on paper | 4.84 | Pass |
| App footer `#6b756e` on `#f8f7f0` | 4.45 | Borderline fail |
| `--muted-2` `#818b83` on paper | 3.49 | Fail |
| Sidebar section label `#7c857c` on `#f8f7f0` | 3.55 | Fail |
| Micro label `#7d8985` on white | 3.63 | Fail |
| Checklist value `#78847f` on paper | 3.85 | Fail |
| Timeline timestamp `#89938f` on white | 3.17 | Fail |

The failing pairs are all small metadata text (timestamps, section labels, secondary values). Raising them is a token or literal change, low risk, suitable for Phase A or L.

This is a static source review. No assistive-technology testing, automated axe run or formal WCAG conformance claim is made.

---

## 15. Responsive/Mobile Audit

Breakpoints: `1120px`, `850px`, `620px`, with the sidebar converting to a drawer at `850px`. `body` has `min-width: 320px`.

| Viewport class | Behaviour | Assessment |
|---|---|---|
| Desktop ≥1121px | 258px sticky sidebar, content max 1500px, 4-column stats, 5-column workflow strip | Sound |
| Laptop 851-1120px | Sidebar stays visible; stats drop to 2 columns; 5-column workflow strip retained | Workflow strip is the tightest element; labels wrap in 68px-tall cells. Verify visually before changing |
| Tablet 621-850px | Sidebar becomes a drawer; `dashboard-columns` still two columns with a 270px minimum right panel; workflow strip still 5 columns until 620px | **Most at-risk range.** Two side-by-side panels and a 5-column strip inside roughly 580-790px of content is cramped. Candidate for a small breakpoint adjustment |
| Mobile ≤620px | Single-column dashboards, stacked workflow strip with rotated chevrons, 2-column stat grid, tables scroll horizontally, stacked login, hamburger public nav | Generally sound; 4 stat cards become 2x2 and labels reach 0.58rem at 320px |

Other observations:

- Tables are protected by `overflow-x: auto` with a focusable scroll region, which is the correct approach for administrative tables. No sticky identifier column yet.
- Modals are absent from the live UI; the backdrop is scrollable with no body scroll lock (latent issue if `Modal` is adopted).
- Sidebar drawer width `min(300px, 84vw)` plus close button is appropriate.
- The top bar compresses in three steps (hidden back label at 850, hidden back link and dot-only status at 620). Status text becomes invisible but remains in the accessibility tree.
- No horizontal page overflow was found in source review; wide content is contained by table scroll containers.
- Not verified on physical devices or in a browser session during this audit. Findings are CSS review only.

---

## 16. Performance Audit

### 16.1 Measured build output (25 Oct 2026, re-measured after the landing-page revision)

| Asset | Size |
|---|---|
| `dist/assets/index-*.js` | 324.94 kB (98.96 kB gzip) |
| `dist/assets/index-*.css` | 56.59 kB (11.90 kB gzip) |
| Font files | 44 (woff and woff2 across several subsets) |
| Total files in `dist/assets` | 46 |

No Lighthouse, WebPageTest or field measurement has been run. No speed claim is made.

### 16.2 Findings

| # | Finding | Impact | Priority |
|---|---|---|---|
| 1 | Six `@fontsource` imports pull every subset for both families, producing 44 font files | Unnecessary bytes and requests, slower first paint on mobile | P2 |
| 2 | Single JS chunk, no route-level code splitting | Whole app downloads before any screen paints; only matters as the app grows | P3 |
| 3 | No third-party runtime requests, no images beyond the favicon and inline SVGs, no analytics | Genuinely light at runtime; preserve this | Strength |
| 4 | All data is 3 fixtures; filtering is `useMemo` over tiny arrays | Negligible; do not optimize | N/A |
| 5 | No caching strategy or immutable asset headers versioned in the repo | Hosting defaults apply; unknown | P3 |
| 6 | CSS is 53 kB unminified-in-source but has substantial duplication (token redefinition, repeated media queries) | Minor transfer cost, real maintenance cost | P3 |
| 7 | `lucide-react` is tree-shaken correctly (named imports only) | No action needed | Strength |

Concrete, low-risk wins for a later phase: switch to latin-only font entry points (for example `@fontsource/public-sans/latin-400.css`), which should remove roughly 28 font files and part of the CSS; and split role routes with `React.lazy` once real pages replace placeholders.

Do not restructure the app for performance now. It has no data, no images and no external calls.

---

## 17. Technical Debt

Ranked by cost of leaving it alone.

| # | Debt | Location | Impact | Effort | Priority |
|---|---|---|---|---|---|
| 1 | No SPA rewrite or versioned deployment config; all deep links 404 in production | repo root, hosting | Product looks broken on refresh or shared link; blocks demo and review | Low | **P0** |
| 2 | Duplicate `:root` token block plus 184 raw hex values; repeated media-query blocks; duplicate `.sidebar-close` rule | `styles.css` | Silent overrides, blocks dark mode and theming, slows every UI change | Medium | P1 |
| 3 | Route truth spread across four places (`app.tsx` wildcard, `routeInfo`, `navigation`, `manus-routes.json`) | routing | Drift as pages are added; no single source of truth | Low-medium | P1 |
| 4 | No tests, no lint, no CI; only a build-time typecheck | repo | Regressions ship silently; no behavioural safety net | Medium | P1 |
| 5 | `pages.tsx` monolith plus a pathname if-chain dispatcher | `pages.tsx`, `RolePage` | Every real workflow will grow this file; refactoring cost rises with each page | Medium | P2 |
| 6 | Unused API seam (`api.ts`, 0 imports) and four unreferenced components | `services/api.ts`, `components.tsx` | Suggests capability that does not exist; dead UI code is untested | Low | P2 |
| 7 | Navigation correctness bugs (missing student overview link, dual active state, no scroll reset/hash handling) | `demo.ts`, `layout.tsx`, `app.tsx` | Visible wrong behaviour on real routes | Low | P1 |
| 8 | Accessibility gaps: low-contrast metadata, 9 to 12px small type, `Modal` not keyboard-safe, no row-count announcement | `styles.css`, `components.tsx` | Exclusion and review risk | Low-medium | P2 |
| 9 | Scaffold leftovers (`app.config.ts`, `manus-routes.json` naming) | root, `public/` | Confusion about ownership and source of truth | Low | P3 |
| 10 | No Node version pin or `engines`; pnpm pinned only via `packageManager` | `package.json` | Environment drift across contributors and CI | Low | P2 |
| 11 | No `.env.example` and no documented environment variable names | repo | Needed before Phase B/C | Low | P2 |
| 12 | Naming drift across package, page title, repo and deployment | multiple | Onboarding friction | Low | P3 |
| 13 | Font payload (44 files) and no code splitting | build | Slower first load than necessary | Low | P3 |

**Not debt, do not "fix":** the custom CSS system, `BrowserRouter`, the route-wildcard shell, the fixture-based demo data and the explicit prototype copy. These are deliberate and consistent.

---

## 18. Architecture Gaps

### 18.1 Missing layers

| Layer | Status | Consequence |
|---|---|---|
| Identity and sessions | Missing | No actor to attribute data or actions to |
| Authorization | Missing | Role is decorative; nothing enforces scope |
| Persistence | Missing | Nothing survives a reload |
| Database schema and migrations | Missing | No entity model beyond README concepts |
| API | Missing | UI has nothing to call |
| Validation | Missing | No rules, issue taxonomy or evidence |
| Consent | Missing | No purpose, recipient or withdrawal record |
| Audit | Missing | No append-only event log |
| Credentialing | Missing | No signing, QR payload, expiry or revocation |
| ML / risk | Missing | No model, features or explainability |
| Secret management | Missing | Nothing to protect yet; no policy exists |
| Observability | Missing | No logging, metrics or error reporting |
| Test and CI | Missing | No regression protection |

### 18.2 Future feature compatibility

Full detail in [Appendix B](#appendix-b-future-feature-compatibility). Summary: the current boundaries (`pages` / `components` / `layout` / `data` / `services` / `types`) can absorb dark mode, search and filters, notifications, autosave, content UX and PWA shell work without restructuring. Two items are heavier but still non-structural: i18n (all copy is inline string literals) and dark mode (184 raw hex values and a duplicated token block).

### 18.3 Recommended future architecture

Based on what exists, and explicitly rejecting a rewrite:

```text
Browser
  ↓
React 19 + Vite SPA (existing, preserved)
  ├── src/pages, src/components, src/layout      unchanged structure
  ├── src/services/api.ts                        becomes the real HTTP client
  └── src/data/demo.ts                           retained only as demo fixtures / dev seed
  ↓  same-origin /api  (Vite dev proxy -> localhost:4000; prod rewrite or API origin)
Node.js + Express
  ├── auth + session + role claims
  ├── authorization middleware (per route, per resource)
  ├── intake, batches, validation, confirmation, consent, review, credentials
  ├── audit log writer (append-only)
  ├── Supabase client with service-role key (server-only)
  ├── AI / external API calls (server-only)
  └── Python ML service calls (internal network)
  ↓
Supabase PostgreSQL (schema, RLS as defence in depth, storage for documents)

Python ML service (separate process/container)
  ├── anomaly detection (Isolation Forest where justified)
  ├── fuzzy matching for duplicates
  └── risk scoring with explainable factors
```

Responsibility rules that follow from the audit:

| Concern | Owner |
|---|---|
| Rendered UI, navigation, local view state | React SPA |
| Authentication, session, role claims | Express |
| Authorization on every operation | Express (never the URL) |
| Validation rules and results | Express (deterministic), ML only as an additional signal |
| Secrets (Supabase service role, AI keys) | Express environment only |
| Audit trail writes | Express, append-only, never the browser |
| QR payload signing and revocation | Express |
| Student data storage | Supabase, reached only through Express |
| Model training and inference | Python service, called by Express |

Deployment decision still open and needed in Phase C: whether Express runs as a separate service (for example a container host) with a configured API origin, or as serverless functions alongside the static site. The SPA must work with either, which is why `API_PREFIX = '/api'` and same-origin calls are the right default.

### 18.4 Deliberate non-goals for the next phase

Do not introduce Next.js, Tailwind, shadcn/ui, Convex, a state library, tRPC or GraphQL. The existing stack is a deliberate constraint, and the current UI already satisfies the product's visual direction. Adding a second styling or data system would duplicate working code.

---

## 19. Recommended Development Order

The phase lettering from the brief is retained, with three justified changes: a deployment fix is inserted into Phase A, consent is designed inside the schema phase, and the mock APAAR adapter is pulled forward so it is not a late dependency.

### Phase A: Stabilize the existing frontend and its release

1. Add versioned deployment configuration with an SPA catch-all rewrite to `index.html`; verify deep links on the hosted URL.
2. Fix the three navigation defects: missing student overview link, dual active sidebar state, no scroll reset or hash scrolling.
3. Add the missing `lint` and `typecheck` scripts plus a minimal CI job, and pin Node via `engines`.
4. Consolidate the duplicated `:root` tokens and lift failing contrast values.
5. Correct the README discrepancies listed in [Appendix C](#appendix-c-documentation-reconciliation).

*Why first:* the deployed product currently loses every deep link, which makes review of any later phase unreliable, and these defects are cheap while the surface is small.

### Phase B: Database schema and mock APAAR adapter

- Model institutions, users, students, enrolments, batches, validation issues, review cases, consents, credentials, risk scores and audit events.
- Make `apaar_id` the primary student identity; keep institution enrolment numbers as scoped secondary identifiers.
- Define consent and audit as **data models**, not screens. They constrain every later phase and are expensive to retrofit.
- Build a mock APAAR adapter (format validation and deterministic synthetic lookup) with no claim of live integration.

*Why before the API:* every endpoint's contract depends on these entities.

### Phase C: Node.js + Express API foundation

- Auth, sessions, role claims, authorization middleware, error envelope, request validation, structured logging.
- `ApiService` implementation behind `src/services/api.ts`; the SPA keeps its components.
- Seed script that loads the existing fixtures so current screens can keep working against the API.
- Security baseline: headers, rate limits, environment separation, secret handling policy.

*Why after the schema:* endpoints without a model produce throwaway contracts.

### Phase D: College student intake

Manual add and bulk upload with row-level errors, APAAR validation, idempotency and batch receipts. This is the first phase that produces real data, so authorization and audit writes must land with it, not after.

### Phase E: Validation engine

Deterministic rules, issue taxonomy with severity, evidence and reviewer override. Duplicate and cross-institution checks depend on real intake from D, which is why they stay here rather than earlier.

### Phase F: Student confirmation

Request, notification, token, response, expiry and audit, converting `demoRecords` statuses into real states.

### Phase G: Consent and transparency

Consent records with purpose, recipient, duration and withdrawal, plus the student-facing data-activity view. Depends on F for meaningful events to disclose.

### Phase H: AICTE monitoring and review

Institution oversight, warnings, review queue, decisions and reports on top of real intake, validation and confirmation.

*Why before ML:* risk scores are only meaningful once review decisions exist to calibrate and evaluate against.

### Phase I: ML and risk scoring

Anomaly detection and risk factors with explanations, false-positive handling and human review. Requires a labelled, reviewable corpus from H; without it, any score is unverifiable.

### Phase J: QR credentials and verification

Signed, scoped, expiring, revocable credentials plus a verifier flow that discloses only consented fields. Depends on G for consent semantics.

### Phase K: AI integrations

Backend-mediated summarisation, anomaly explanation or document assistance, if a real need survives H to J. Never a prerequisite for core flows.

### Phase L: Hardening

Accessibility remediation and testing, privacy and legal review, penetration testing, retention and deletion, observability, load testing. Do not leave all security work here: the Phase C baseline and per-route authorization tests must exist much earlier.

---

## 20. Next Implementation Step

**Phase A, starting with the deployment rewrite.** Concretely, the next change should:

1. Add a versioned SPA rewrite so `/college/students`, `/student`, `/prototype/access` and any future deep link return the app rather than 404.
2. Fix the student overview nav entry, the dual active sidebar state and scroll/hash handling.
3. Add `typecheck`/`lint` scripts and a CI check, then consolidate the duplicated CSS token block.

Acceptance criteria for that step: a cold load of three deep links on the deployed URL renders the correct screen; the student sidebar can reach `/student`; exactly one sidebar item is highlighted on every route; `pnpm typecheck` and the build pass in CI; no application behaviour, visual identity or route is otherwise changed.

**Do not start Phase B in the same step.** No Supabase project, no schema, no auth, no API.

Then, with the release fixed, Phase B begins with the schema and the mock APAAR adapter. That order is deliberately different from a naive "build the backend first" plan because the current frontend already works and its release path is the only thing actively broken.

---

## Appendix A: Privacy and Legal Audit

| Item | Exists | Detail |
|---|---|---|
| Privacy Policy | Draft only | `/privacy`, four placeholder sections, explicit draft warning. Not a policy. |
| Terms & Conditions | Draft only | `/terms`, three placeholder sections. |
| Cookie Policy | Draft only | `/cookies`, states no analytics or cookie tracking is used. Accurate for the current build. |
| Contact information | **Missing** | `/contact` is an empty state; no email, address, phone or grievance channel anywhere in the repo. |
| Consent language for real processing | **Missing** | Consent is explained as future intent; nothing is collected, so nothing is consented. |
| Data-collection notice | **Missing** (not yet needed) | No data is collected. |
| Analytics / tracking | **None** | No analytics package, script, pixel or beacon. |
| Cookies set by the app | **None** | No `document.cookie` usage and no server to set cookies. Hosting may add its own technical cookies; that is outside this repo and unverified. |
| Third-party integrations at runtime | **None** | Fonts are bundled locally; the only external URL is an unused logo reference in `app.config.ts`. |
| Third-party fonts | **Not a remote request** | `@fontsource` packages ship the files. This is a privacy-positive choice; keep it. |
| Retention / deletion statements | **Missing** | Belongs with the Phase B schema. |
| Sub-processor / DPDP framing | **Missing** | Needs legal review, not engineering invention. |

No compliance claim is made anywhere in the UI, and the audit found no misleading compliance language to remove. The gap that matters for later phases is the complete absence of a real contact and grievance mechanism and of any data-collection notice, both of which become mandatory the moment real student data is accepted.

Do not add analytics or tracking during this phase.

## Appendix B: Future Feature Compatibility

| Planned feature | Accommodated by current architecture? | Work required | Restructure needed? |
|---|---|---|---|
| Dark mode | Partly | Consolidate duplicate `:root`, replace ~184 raw hex literals with tokens, add a theme attribute | No |
| Language switcher | Structurally yes, practically no | All copy is inline English string literals across `pages.tsx` and `demo.ts`; needs extraction plus a provider. Page titles and role labels live in typed config and would need locale-aware access | No, but the largest single effort here |
| Adjustable text size | Yes | Rem-based typography helps; add a root scale attribute and audit px paddings | No |
| Keyboard shortcuts | Yes | Add one small global hook; no store or router internals block it | No |
| Keyboard-friendly forms | Mostly | Native fields are keyboard reachable; add error summary, focus management and explicit validation states | No |
| Smart search | Yes, needs backend | `SearchBar` and filtering patterns exist; move query to the API in Phase C | No |
| Filters and sorting | Yes, needs backend | `DataTable` is presentational; add typed column definitions and server-side query params | No |
| Recently viewed | Yes | Needs a storage abstraction and route metadata (both absent today) | No |
| Save for later | Yes | Requires identity from Phase C | No |
| Copy to clipboard | Yes | Isolated addition | No |
| Notifications | Yes, needs backend | `Notice` covers inline messaging; a toast region plus server events are new primitives | No |
| Auto-save | Yes, needs backend | Requires debounced writes and conflict rules; do not use `localStorage` for student data | No |
| Back to top / reading progress / TOC / share | Yes | Content pages already use a prose layout; add primitives | No |
| Searchable FAQs | Yes | New static page; no data dependency | No |
| Password visibility | Yes | Small `FormField` extension for an adornment | No |
| Success notifications | Yes | New toast primitive; `Notice` is inline only | No |
| PWA / offline | Yes technically, risky in scope | No manifest or service worker today. Offline caching of student records is a privacy decision, not just a technical one; scope to app shell only | No |
| Local drafts / sync queue | Yes | Needs a storage abstraction plus conflict resolution; must be consent-aware | No |

**Conclusion:** no planned feature requires replacing the frontend architecture. The two real preparation tasks are extracting copy for i18n and consolidating the CSS token system. Both are Phase A or later polish, not blockers.

## Appendix C: Documentation Reconciliation

| Document | Verdict |
|---|---|
| `README.md` | Substantially accurate. It correctly states that there is no backend, database, auth, APAAR integration, validation, consent, audit, credential or test suite, and it correctly warns against treating routes as working workflows. Gaps fixed in this phase: no deployment state, stale `docs/` claim, no mention of unreferenced components or the unused API seam, no pointer to this audit, and no statement that the styling is a custom CSS system rather than a framework. |
| `TODO.md` | Read as a phase-1 acceptance log, not current status. All eight sections are marked Complete and that is defensible: they describe UI-only outcomes whose explicit boundary was "no backend". One nuance to keep in mind: several components named in section 6 (filter bar, pagination, confirmation dialog, audit timeline) were created but never wired to a screen. |
| `plan.md` | Historical build plan. Contains environment-specific notes (managed runtime on port 3000, disabling managed analytics, publishing disabled) that describe how the prototype was first generated, not how the repo is deployed now. Do not treat it as a specification for new work. |
| `public/manus-routes.json` | In sync with the code today (41/41 paths match). It is a scaffold manifest, not a contract. |
| `app.config.ts` | Unused scaffold config with an external logo URL. Documented as debt, not removed in an audit-only phase. |
| `docs/PROJECT_AUDIT.md` | New in this phase. Deeper technical baseline; the README remains the high-level reference. |

## Appendix D: Verification Log

Commands run during this audit, and their results:

| Check | Command | Result |
|---|---|---|
| Repository inventory | `find . -maxdepth 2` plus `wc -l` | 23 tracked files; about 1,713 lines of app source |
| History | `git log`, `git show --stat HEAD` | One commit `dcd5c85`; branch `main` |
| Dependency install | `pnpm install --frozen-lockfile` | Success, 76 packages, pnpm 11.25.0, no lockfile changes |
| Typecheck | `pnpm exec tsc -b` | Exit 0, no diagnostics |
| Production build | `pnpm exec vite build` | Exit 0; 329.18 kB JS (99.38 kB gzip), 52.76 kB CSS (10.92 kB gzip), 44 font files |
| Network, storage, logging scan | `grep` for `fetch(`, `localStorage`, `sessionStorage`, `console.`, `axios`, `supabase`, `express`, `import.meta` | Zero matches in `src/`, `public/`, `index.html` |
| Sensitive identifier scan | `grep -rni aadhaar src` | Zero matches |
| Unused API seam | `grep -rn "services/api" src` | No imports |
| Unreferenced components | Per-symbol reference counts | `FilterBar`, `Pagination`, `ConfirmationDialog`, `AuditTimeline` at 0; `Modal` only inside `ConfirmationDialog` |
| Route manifest consistency | Extracted 41 quoted paths from `demo.ts`, compared with JSON | 41 vs 41, no differences either direction |
| CSS token duplication | `grep -n "^:root" src/styles.css` | Two blocks: lines 1 and 576 |
| Colour count | Count of unique hex literals | 184 |
| Contrast ratios | Computed WCAG relative luminance in Node for 11 token pairs | 5 pass, 1 borderline, 5 fail at small-text sizes (listed in §14.3) |
| Deployment root | Fetch `https://sudharshan-mauve.vercel.app/` | HTTP 200 and the expected APAAR Record page title |
| Deployment deep links | Fetch `/college/students`, `/prototype/access`, `/student` | HTTP 404 on all three |

Not performed, and therefore not claimed: browser or device testing, Lighthouse or field performance measurement, automated accessibility tooling, dependency vulnerability audit, penetration testing, or any behavioural test suite (none exists in the repo).

The `dist/` directory produced by the build check is generated output and is ignored by Git.
