# SIH26263 APAAR Prototype Website Plan

## Scope and implementation approach

Build the complete responsive UI and route architecture for the SIH26263 prototype using **React, TypeScript and Vite**. The initialized workspace is empty and uses the managed Cloud Web project runtime on port 3000. Use React Router for explicit public and role-specific routes, and Lucide icons for consistent, purposeful navigation symbols.

This phase has no application backend, authentication, database connection, external API calls, analytics or tracking. Login is a visual prototype entry point only; “Login as Guest” leads to role selection, and the login action routes to the same clearly identified prototype flow. Actions for future workflows lead to explicit “Coming in next implementation phase” placeholder states rather than pretending to save or verify data. A typed service boundary and synthetic demo-data provider will keep future API calls outside visual components. Later integrations remain Node.js + Express and Supabase as specified by the brief; no alternate backend/database or secrets are added now. Keep student identity APAAR-centric and use only synthetic identifiers.

Disable managed site analytics before implementation so the default analytics injection does not conflict with the requested no-tracking prototype. Do not add analytics, cookies, external integrations, or an authentication/session mechanism. The initialized managed server and database remain off. This site-design plan does not represent operational backend, legal, privacy-compliance, or security claims.

## Route and page architecture

- Public: `/`, `/about`, `/security`, `/login`, `/prototype/access`, `/privacy`, `/terms`, `/cookies`, `/contact`.
- AICTE: `/aicte`, `/aicte/institutions`, `/aicte/students`, `/aicte/warnings`, `/aicte/review`, `/aicte/risk`, `/aicte/audit`, `/aicte/reports`, `/aicte/verification`, `/aicte/settings`.
- College Official: `/college`, `/college/students`, `/college/students/add`, `/college/students/upload`, `/college/validation`, `/college/flagged`, `/college/submission`, `/college/confirmation`, `/college/credentials`, `/college/activity`, `/college/settings`.
- Candidate / Student: `/student`, `/student/profile`, `/student/academic-record`, `/student/verification`, `/student/activity`, `/student/qr`, `/student/consent`, `/student/documents`, `/student/notifications`, `/student/verification-history`, `/student/settings`.
- Use intentional placeholder pages for unfinished functions and a clear not-found page for unknown routes. Include every application page in a static `public/manus-routes.json` route manifest and check it after the server starts.

The public landing page explains the institution → student → AICTE → authorized verifier ecosystem; the Validation, Transparency and Verification pillars; the Submit → Validate → Confirm → Review → Verify flow; and intended privacy principles without asserting that APAAR integration, validation, consent, security or verification is operational. The role picker presents exactly three choices: AICTE, College Official, and Candidate / Student, with the exact prototype-access disclosure from the brief. Each role gets a distinct shell and working sidebar links. Dashboards use restrained synthetic examples clearly marked “Demo Data” or “Prototype”; no fabricated official statistics, customer/institution endorsements, or unsupported claims. Legal and contact routes are visibly draft/prototype placeholders.

## Shared UI and data separation

Implement reusable `AppShell`, `Sidebar`, `TopBar`, `Breadcrumbs`, `PageHeader`, `SectionHeader`, `StatCard`, `DataTable`, `StatusBadge`, `EmptyState`, `Alert/Notice`, `Modal`, `ConfirmationDialog`, `FormField`, `Select`, `Tabs`, `SearchBar`, `FilterBar`, `Pagination`, `ActivityTimeline`, `AuditTimeline`, QR placeholder, `Footer`, and responsive mobile navigation. Keep controls clearly disabled or routed to a phase-two explanation when their operations do not exist; do not imply server-side results.

Organize the implemented code as follows:

- `src/main.tsx`: Vite/React entry point, app mount, locally bundled fonts and global styles.
- `src/app.tsx`: React Router route declarations, role-shell routing and the not-found route.
- `src/pages.tsx`: public pages, prototype login and role access, all three role dashboards, illustrative record views and intentional placeholders.
- `src/layout.tsx`: reusable `AppShell`, `Sidebar`, `TopBar` and `Breadcrumbs`, including responsive drawer behavior.
- `src/components.tsx`: reusable brand, notices, fields, tables, statuses, search/filter controls, modal/dialog helpers, timelines and QR placeholder.
- `src/data/demo.ts`: route metadata, role navigation, synthetic records and sample activity, separate from the UI and API boundary.
- `src/services/api.ts`: typed future service boundary with no network requests or database operations.
- `src/types.ts`: shared role, navigation, route, demo-record and activity types.
- `src/styles.css`: design tokens, global styles, public and dashboard layouts, responsive breakpoints and focus/motion behavior.
- `public/apaar-mark.svg` and `public/manus-routes.json`: the site mark and complete page-route manifest.
- Project root: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, Vite/TypeScript configuration, `index.html`, `app.config.ts`, this plan and the acceptance `TODO.md`.

## Design direction

**Design movement:** Swiss International Typographic Style adapted to a contemporary civic-service interface. The brief’s institutional, restrained direction is the design reference.

**Core principles:** procedural clarity; calm authority without imitating an official agency; compact, scannable information; explicit separation between demo and real operations.

**Color philosophy:** warm paper and cool stone surfaces make long tables comfortable to read; deep ink supplies authority; one ownable, muted evergreen-teal marks navigation and primary actions. Status colors are restrained and always paired with readable text or an icon. No gradients, neon, purple or decorative tricolor motifs.

**Layout paradigm:** a public-facing, editorial information rail flows into an aligned content canvas; authenticated pages use a narrow institutional navigation rail beside a working document surface. Participant steps appear as a simple connected register, not decorative cards or fabricated charts. Tables remain proper rows with horizontal overflow on narrow screens.

**Signature elements:** a compact register-mark wordmark built from three indexed record bars; fine rules and numbered section labels; small monospaced synthetic IDs/status metadata.

**Interaction philosophy:** direct, predictable navigation; visible focus and selected states; clear labels for every prototype-only or unavailable operation. Use ordinary rectangular controls with modest corners. Responsive navigation becomes an accessible mobile drawer; transition effects are brief and nonessential.

**Animation:** subtle color/opacity and drawer transitions only, respecting `prefers-reduced-motion`; no scroll-triggered, cursor, or ornamental motion.

**Typography:** locally bundled Public Sans for interface and headings, with IBM Plex Mono for record identifiers, timestamps and compact metadata. Use a deliberate type scale, tabular numerals for data, and readable line lengths.

**Brand essence:** a clear record and confirmation pathway for institutions, students, AICTE and authorized verification; **careful, legible, accountable**.

**Brand voice:** precise and plain, with no vague AI claims. Example lines: “A clearer record of enrolment, confirmation and review.” “Prototype interface. No production authentication is connected.”

**Wordmark & logo:** an original simple “APAAR Record” wordmark with a three-bar registry/index symbol, drawn as an inline SVG for the site. Platform logo metadata will use a durable HTTPS asset URL before checkpointing.

**Signature brand color:** muted evergreen-teal, reserved for key actions and the active navigation state.

## Build and handoff workflow

After plan approval, create `TODO.md` with the full user acceptance clauses grouped by independently deliverable outcomes. Register TypeScript diagnostics using the managed post-edit configuration before the first source-code batch. Pin pnpm in the project manifest, include the reviewed lifecycle-script policy before dependency installation, and use a lockfile. Implement and refine the React routes/components, design tokens, responsive states, demo fixtures, accessible placeholder states and route manifest. Start one development server on the configured port 3000, confirm readiness and verify that `/manus-routes.json` returns the intended JSON rather than the SPA fallback. Run the available build/type diagnostics and do one read-only requirements review for route coverage, scope boundaries, accessibility and unsupported claims. Do not publish unless separately requested; the current auto-publish setting is false.
