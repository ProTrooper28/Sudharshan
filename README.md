# APAAR-based Student Data Management & Verification Platform

**SIH 2026 prototype · Problem statement SIH26263**

> A prototype interface for exploring an APAAR-centred student enrolment record journey. It is not an official AICTE deployment, does not connect to APAAR, and is not production-ready.

This README is the project’s developer and AI-agent reference. It separates the current React UI from the proposed backend, database, AI/ML and verification capabilities. A screen, menu item, synthetic status or roadmap entry must not be treated as proof that the corresponding service is operational.

## Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Core Product Principles](#4-core-product-principles)
5. [User Roles](#5-user-roles)
6. [Current Implementation Status](#6-current-implementation-status)
7. [Technology Stack](#7-technology-stack)
8. [High-Level Architecture](#8-high-level-architecture)
9. [Future Data Model](#9-future-data-model)
10. [Future API Architecture](#10-future-api-architecture)
11. [Validation and ML Roadmap](#11-validation-and-ml-roadmap)
12. [Trust, Audit and Transparency](#12-trust-audit-and-transparency)
13. [QR and Verification](#13-qr-and-verification)
14. [Privacy and Compliance](#14-privacy-and-compliance)
15. [Privacy-First Data Rules](#15-privacy-first-data-rules)
16. [UI and Design System](#16-ui-and-design-system)
17. [Planned UX Features](#17-planned-ux-features)
18. [Future Roadmap](#18-future-roadmap)
19. [Rules for Future AI Coding Agents](#19-rules-for-future-ai-coding-agents)
20. [Folder Structure](#20-folder-structure)
21. [Local Development](#21-local-development)
22. [Environment Variables](#22-environment-variables)
23. [Testing](#23-testing)
24. [Demo and Hackathon Mode](#24-demo-and-hackathon-mode)
25. [Known Limitations](#25-known-limitations)
26. [Contribution and Change Process](#26-contribution-and-change-process)
27. [Documentation Maintenance](#27-documentation-maintenance)
28. [Documentation Integrity](#28-documentation-integrity)

## 1. Project Overview

SIH26263 explores a platform concept for managing and reviewing student enrolment information associated with AICTE-approved institutions. The intended participants are institutional officials, students, AICTE reviewers and authorized verifiers. The repository currently provides a React interface foundation that illustrates the proposed roles and record journey; it does not provide a connected student-data service.

APAAR ID is intended to be the primary student identity in the future architecture. Keeping the design APAAR-centric is important to the problem statement and to consistent enrolment records. This prototype does not validate, resolve or query an APAAR ID, and no real APAAR identifiers should be entered into it.

The central concept is **student-confirmed enrolment**:

1. An institution prepares and submits an enrolment record.
2. The student is sent a request to review the submitted information.
3. The student can confirm or reject the enrolment in a future operational system.
4. Institutional validation and authorized review can use that response as one additional signal.

A confirmation step could help surface incorrect or inconsistent records, duplicate enrolments, potential ghost-student patterns and cross-institution conflicts. It cannot guarantee that every record is correct, that fraud is detected, or that any particular outcome will follow. The prototype does not send confirmation requests or store student responses.

**Conceptual record journey:**

```text
Institution → Student → Validation → AICTE → Authorized Verification
```

## 2. Problem Statement

The SIH26263 problem statement concerns reliable visibility into student enrolment across AICTE-approved institutions. Institution-level information can be difficult to validate, authenticate, cross-check and monitor consistently when records are prepared and managed across different processes.

The proposed motivation for a centralized APAAR-based approach is to provide a more structured record path: institutions submit information, students are given a meaningful confirmation step, and AICTE and authorized verifiers receive appropriately scoped views for monitoring or review. This is problem framing for the prototype, not a measured claim about the quality of existing records or any institution.

This project does not claim official AICTE sponsorship or deployment, access to government systems, or live integration with APAAR.

## 3. Proposed Solution

The platform is intended to bring institution intake, validation, student confirmation and authorized review into a coherent workflow. All capabilities below are product direction unless explicitly marked as present in [Current Implementation Status](#6-current-implementation-status).

### Institution-side data intake

Future intake could support manual student entry, CSV/Excel bulk upload and a REST API. APAAR ID is the intended primary student identity. The current interface contains navigation and illustrative pages for student records and uploads; it does not accept or submit real student data.

### Validation

Future validation may cover identifier formats, duplicate records, intake or seat limits, inconsistent information, cross-institution conflicts, anomaly detection, fuzzy matching and risk scoring. The current prototype does not run these validation rules or an ML model.

### Student confirmation

The intended flow is:

```text
Institution submits record
    → Student receives a request
    → Student reviews the information
    → Student confirms or rejects
```

The interface may show this as an illustrative workflow. It does not send a request, authenticate a student, save a response or change an enrolment record.

### AICTE monitoring

A future AICTE workspace is intended to support institution overviews, flagged records, review queues, risk analytics, audit trails and reports. Current dashboards are static/synthetic UI examples; they are not official statistics, live feeds or operational review tools.

### Verification

Authorized verifiers may eventually check controlled student information through signed credentials or QR-based flows. Only appropriate information should be exposed based on authorization and consent where applicable. No live verification or credential issuance is implemented.

## 4. Core Product Principles

- **APAAR-centric identity:** APAAR ID is the intended primary identity. Aadhaar is not a replacement identity for this architecture.
- **Student-confirmed enrolment:** Student review and confirmation are intended as a trust mechanism, not as an automatic guarantee of correctness.
- **Privacy by design:** Collect and display only information needed for the stated purpose.
- **Consent-aware verification:** Disclose only appropriate information to an authorized party for an appropriate purpose, with consent where applicable.
- **Auditability:** Important future actions should produce reviewable, append-only audit events.
- **Role-based access:** AICTE, College Official and Candidate / Student experiences should be appropriately separated.
- **Backend-controlled sensitive operations:** Authentication, authorization, secrets, AI calls, external APIs and sensitive data processing belong behind backend services.

These principles describe intended product architecture. They are not claims that the prototype currently enforces them as production controls.

## 5. User Roles

| Role | Intended responsibilities |
|---|---|
| **AICTE** | Monitor institutions; inspect student records; review warnings and flagged cases; inspect risk information; access reports; inspect audit activity; and review or verify records through authorized workflows. |
| **College Official** | Manage student records; add students; upload data; inspect validation results; resolve flagged records; monitor submissions; track student confirmations; manage future credential/QR workflows; and inspect institution activity. |
| **Candidate / Student** | View their profile and academic record; confirm enrolment; inspect verification status and data activity; manage consent; view future QR/credentials; inspect verification history; and view notifications. |

The current UI simulates role selection for demonstration. It does not authenticate these roles or authorize access to real data.

## 6. Current Implementation Status

**Status meanings:** “Implemented” describes the named interface or local presentation behavior only. “Partial” means a UI shell or illustrative view exists, while its real workflow does not. “Planned” means the capability is not implemented.

### Phase 1: UI foundation

| Item | Status | Scope of the status |
|---|---|---|
| Landing page | **Implemented** | Public concept page with workflow, participant, design-intent and prototype-boundary content. |
| Login interface | **Implemented as UI only** | Form and guest entry are present. Submitting the form routes to prototype role selection; credentials are not checked. |
| Guest prototype access | **Implemented** | Guest link opens the role-selection interface without creating an authenticated session. |
| Role selection | **Implemented** | AICTE, College Official and Candidate / Student cards navigate to their UI simulations. |
| AICTE application shell | **Partial: UI shell and illustrative dashboard** | Navigation, dashboard structure and placeholder destinations exist. No official AICTE data or review service is connected. |
| College application shell | **Partial: UI shell and illustrative dashboard** | Navigation, dashboard structure and synthetic examples exist. Student intake, validation and submission are not active. |
| Student application shell | **Partial: UI shell and illustrative dashboard** | Student-oriented pages are represented. Confirmation, consent storage, notifications and verification are not active. |
| Shared component system | **Implemented for the prototype** | Shared navigation, notices, tables, status badges, forms, timelines and other presentation components are in the React source. |
| Responsive layouts | **Implemented as a UI baseline** | Responsive styling and mobile navigation are present. This is not a formal accessibility or device-compatibility certification. |
| Legal page placeholders | **Implemented as draft UI** | Privacy, terms and cookie routes contain prototype/draft content; they are not reviewed legal policies. |

### Backend and product workflows

| Capability | Status |
|---|---|
| Node.js + Express API | **Planned; not present in this repository** |
| Supabase schema or database operations | **Planned; not present or connected** |
| Production authentication, OTP, authorization or account recovery | **Planned; not implemented** |
| Live APAAR or Aadhaar service | **Not implemented** |
| Student intake, upload, submission and confirmation | **Planned; UI is illustrative only** |
| Operational validation engine or ML services | **Planned; not implemented** |
| Consent storage, audit-event persistence and verification | **Planned; not implemented** |
| Live AI, external API, email, WhatsApp, payment or analytics integration | **Not connected** |

The routes for role screens should not be read as evidence that the underlying workflow exists. Several destinations are intentionally explanatory placeholders.

## 7. Technology Stack

### Present in the repository

| Layer | Current implementation |
|---|---|
| Frontend | React 19 and React DOM, written in TypeScript and built with Vite 6. |
| Routing | React Router DOM 7. |
| UI icons | Lucide React. |
| Fonts | Locally bundled Public Sans and IBM Plex Mono through Fontsource packages. |
| Package manager | pnpm, pinned in `package.json` as `pnpm@11.25.0`, with a committed lockfile. |

### Intended future architecture

| Layer | Intended technology | Status |
|---|---|---|
| Backend | Node.js + Express | Planned; no backend service exists in the repository. |
| Database | Supabase | Planned; no project schema or database connection exists here. |
| Machine learning | Python services/models where needed | Planned; no ML code exists here. |
| AI and external APIs | Called by backend services | Planned; no provider integration is connected. |

The frontend must never contain privileged service-role credentials, AI provider keys or external integration secrets.

## 8. High-Level Architecture

### Current prototype

```text
Browser
  ↓
React + TypeScript single-page interface (Vite)
  ↓
Role shells, pages and shared components
  ↓
Synthetic fixtures in src/data/demo.ts

No backend, database, APAAR service or external API is called.
```

`src/services/api.ts` defines a future same-origin `/api` service boundary and TypeScript request/response types. It deliberately makes no network or database requests.

### Intended future system

```text
Browser
  ↓
React frontend
  ↓  same-origin application API
Node.js + Express backend
  ├── Supabase data services
  ├── AI and external APIs, when authorized and required
  └── Python ML services, where required
```

Privileged external services must not be called directly from browser code. The backend should own authentication, authorization, secret handling, sensitive operations and validation of requests before communicating with Supabase, AI providers or other integrations.

## 9. Future Data Model

The following are conceptual entities from the project scope, not implemented tables or a finalized schema:

- `institutions`
- `seat_config`
- `students`
- `enrolments`
- `submission_batches`
- `validation_issues`
- `review_cases`
- `consents`
- `credentials`
- `risk_scores`
- `audit_log`
- `users`

The exact database schema, relationships, retention rules and authorization model must be finalized before production implementation. No database fields are specified by this README. Sensitive student fields must be appropriately protected, access-controlled and minimized; do not infer that the UI examples establish a schema.

## 10. Future API Architecture

The following are **conceptual API categories**, not implemented endpoints. Exact paths, payloads, response schemas, permissions, error formats and versioning rules remain to be designed.

- Authentication and OTP verification
- Seat configuration
- Submission batches and batch reports
- Enrolments and batch submission
- Student confirmation
- AICTE dashboard and institution dashboard
- Risk information and review cases
- Consent management
- Authorized verification

The current `src/services/api.ts` file contains only a typed interface boundary. No API route, server controller, request persistence or live response exists. Do not invent endpoints in frontend components or present these categories as callable services.

## 11. Validation and ML Roadmap

### Potential rule-based validation

Future deterministic checks may include identifier-format checks, duplicate detection, intake/seat limits, internal inconsistencies and cross-institution conflicts. Rules, evidence requirements and review outcomes need to be defined before implementation. A flagged result should not automatically be treated as a finding of fraud or ineligibility.

### Potential ML capabilities

Future research may consider Isolation Forest, fuzzy matching, anomaly detection and institution risk scoring. These capabilities require suitable governance, data quality, evaluation, human review and safeguards against false positives. No model, training data, risk score or ML service currently exists in this repository. Naming a model here does not mean it has been implemented or validated.

## 12. Trust, Audit and Transparency

Students should eventually be able to understand the relevant stages of their data journey. An illustrative future sequence is:

```text
College submitted
  → Validation completed
  → Confirmation requested
  → Student confirmed
  → Submitted for AICTE review
  → Review completed
  → Credential issued, if eligible
```

An eventual activity or audit trail may record information such as when an event occurred, which actor or system performed it, what action took place, its status and a relevant reference. These are conceptual event details, not a finalized database schema. The intended audit model is append-only and reviewable, subject to access and retention design.

The current activity feed contains synthetic demonstration events; it does not record or preserve actual actions. A hash may support integrity checks in a future design, but a hash is not the student’s identity.

## 13. QR and Verification

An eligible student may eventually receive a QR-linked credential. The QR should open a controlled verification flow rather than expose raw personal information. A future verification design may communicate credential validity, issue time, expiry where applicable, revocation status and only authorized or consented information.

The current QR view is a visual placeholder. It does not issue a credential, sign data, contact a verifier, reveal a student record or establish verification status.

## 14. Privacy and Compliance

Privacy and compliance considerations belong in the architecture from the beginning. Future design and review should consider the applicable Digital Personal Data Protection framework, data minimization, purpose limitation, consent where applicable, withdrawal mechanisms, retention, access control, security, auditability, grievance/contact mechanisms, third-party services, cookies/storage and analytics consent where applicable.

The privacy, terms, cookie and security pages currently contain draft or intended-principle UI content. They are not legal advice, approved policy documents, security controls or evidence of legal compliance. Do not claim “DPDP compliant” or any other compliance status without appropriate legal and security review. Do not collect real Aadhaar information in the prototype. Any future consideration of Aadhaar as supporting verification evidence must follow applicable legal and security requirements; it must not replace APAAR as the intended primary identity.

## 15. Privacy-First Data Rules

During prototype development:

- Never commit real Aadhaar numbers, APAAR IDs, phone numbers, email addresses, government identifiers or student personal information.
- Never commit passwords, authentication tokens, API keys, AI provider keys or production database credentials.
- Use synthetic identifiers and synthetic/demo records only, and label them clearly.
- Do not send prototype data to external services.
- Do not use demo screens or placeholder statuses to imply that a real submission, notification, consent or verification took place.

The repository’s `.gitignore` excludes `.env` and `.env.*` files while allowing a future `.env.example`. No real credential file should be added to the repository.

## 16. UI and Design System

The intended visual character is institutional, modern, credible, information-oriented, accessible and restrained. The current interface uses warm paper surfaces, evergreen accents, compact navigation, indexed section details, thin rules, professional tables and Public Sans / IBM Plex Mono typography. Reuse the established components and design tokens when extending the UI.

Avoid purple AI gradients, neon, excessive glassmorphism, giant gradient typography, pill-shaped buttons, excessive rounded cards, generic SaaS templates, fake testimonials/reviews/statistics, fake partner or institutional logos, emoji-based UI, unnecessary animations, Y2K aesthetics and AI-slop imagery. Do not invent government logos or imply affiliation.

Use semantic HTML, meaningful labels, keyboard-operable controls, visible focus and status descriptions that do not rely on color alone. The mobile role-navigation drawer includes focus handling. These are implementation choices, not a claim of WCAG conformance or a completed accessibility audit. UI copy should avoid em dashes.

## 17. Planned UX Features

The items below are roadmap candidates, not commitments that they already exist. The prototype may contain limited controls over local synthetic examples; that does not constitute a data-backed product feature.

### Accessibility

- Dark mode
- Language switcher
- Adjustable text size
- Expanded keyboard navigation and optional shortcuts
- Further accessibility-focused form states and review

The existing UI has a keyboard-accessible baseline and visible focus behavior. No language switcher, dark mode, dedicated shortcut system or formal accessibility certification is claimed.

### Productivity

- Smart search and production-backed filters/sorting
- Recently viewed pages
- Save for later
- Copy to clipboard where appropriate
- Auto-save of form progress
- Notifications

### Content UX

- Back-to-top controls
- Reading progress
- Table of contents
- Searchable FAQs
- Estimated reading time
- Share-page action

### Forms

- Password visibility toggle
- Clear success/error notifications for real operations
- Auto-save where safe
- Clear, accessible validation states

### Offline

Potential PWA/offline capability is future work only. Offline access would require careful treatment of sensitive student information, local storage, device risk and synchronization conflicts.

## 18. Future Roadmap

Roadmap order is an intended progression and may change after design and security review.

| Phase | Intended outcome | Status |
|---|---|---|
| 1 | UI foundation and navigation | **Implemented as a prototype UI foundation only.** |
| 2 | Supabase schema and Node.js + Express API foundation | Planned |
| 3 | College student data intake | Planned |
| 4 | Validation engine | Planned |
| 5 | Student confirmation and consent | Planned |
| 6 | Transparency and audit trail | Planned |
| 7 | AICTE dashboard and review workflow | Planned |
| 8 | ML anomaly detection and institutional risk scoring | Planned |
| 9 | QR credentials and verification | Planned |
| 10 | AI/API integrations | Planned |
| 11 | Security, accessibility, compliance and production hardening | Planned |

Completing a roadmap item requires implementing and verifying its real behavior; adding a route, placeholder, diagram or README description is not sufficient.

## 19. Rules for Future AI Coding Agents

1. Read `README.md` before making architectural changes.
2. Do not replace the established technology stack without explicit approval.
3. Do not create duplicate architectures.
4. Do not expose secrets in frontend code.
5. Do not use real student or government data.
6. Do not claim an unimplemented feature works.
7. Do not invent APIs.
8. Do not invent production statistics.
9. Do not add unnecessary dependencies.
10. Reuse existing components.
11. Preserve the established design system.
12. Keep frontend, backend, database and ML responsibilities separated.
13. Keep sensitive operations on the backend.
14. Update the README when major architecture or feature status changes.
15. Do not silently modify database architecture.
16. Do not silently change primary identifiers.
17. Do not redesign the product around Aadhaar.
18. Do not claim live APAAR integration unless a real integration has actually been implemented and verified.
19. Use mock/synthetic data during prototype development.
20. Prefer small, testable implementation steps over large rewrites.

## 20. Folder Structure

### Current repository structure

```text
.
├── public/
│   ├── apaar-mark.svg
│   └── manus-routes.json
├── src/
│   ├── data/
│   │   └── demo.ts
│   ├── services/
│   │   └── api.ts
│   ├── app.tsx
│   ├── components.tsx
│   ├── layout.tsx
│   ├── main.tsx
│   ├── pages.tsx
│   ├── styles.css
│   └── types.ts
├── .gitignore
├── README.md
├── TODO.md
├── app.config.ts
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── plan.md
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.ts
```

Responsibilities in the current frontend:

- `src/app.tsx` defines public routes, role route groups and the not-found route.
- `src/layout.tsx` provides the reusable role shell, sidebar, top bar and responsive navigation.
- `src/pages.tsx` contains public pages, role dashboards and placeholder views.
- `src/components.tsx` contains shared visual and form components.
- `src/data/demo.ts` contains role navigation, route descriptions and synthetic demonstration fixtures.
- `src/services/api.ts` defines a future API boundary only; it makes no requests.
- `src/types.ts` contains shared TypeScript interfaces and unions.
- `src/styles.css` contains the design tokens and responsive styling.
- `public/manus-routes.json` declares the website page routes.

There are currently no `backend/`, `ml/` or `docs/` directories. A future separation into backend and ML services may be designed when those layers are approved; do not create duplicate or speculative structures before then.

## 21. Local Development

### Prerequisites

Use a Node.js release compatible with the Vite toolchain and the pnpm release pinned in `package.json` (`pnpm@11.25.0`). The repository does not pin a Node.js version.

### Install and run the frontend

```bash
pnpm install
pnpm dev
```

The Vite development server is configured to listen on `0.0.0.0:3000` with strict port binding. Open the local preview address reported by Vite.

### Build and preview

```bash
pnpm run build
pnpm preview
```

`pnpm run build` runs the TypeScript project build and creates the Vite production bundle in `dist/`. `pnpm preview` serves that built frontend locally. The repository currently has no backend or ML service commands; do not invent commands for services that are not present.

## 22. Environment Variables

The current frontend does not declare application environment-variable names and the repository has no `.env.example`. No backend credentials are required to run the present UI.

Future environment configuration may need categories for client-safe public settings and backend-only database access, privileged Supabase credentials, AI providers and external APIs. Exact variable names should be chosen and documented when those services are implemented; this README does not introduce names that are not already part of the codebase.

Never place secrets in Vite-exposed frontend variables or browser code. Keep `.env` and secret-bearing environment files out of Git; `.gitignore` currently ignores `.env` and `.env.*` and permits a future `.env.example`.

## 23. Testing

There is currently no automated unit, component, integration, API, database, validation, ML, authorization/RBAC, security, accessibility or end-to-end test suite, and no test script is declared in `package.json`.

The existing verification command is:

```bash
pnpm run build
```

It runs the TypeScript build and Vite production build. It is a compile/build check, not a substitute for behavioral tests or an accessibility, security or responsive audit.

Future testing should cover:

- UI/component and frontend integration behavior
- API contracts and database access controls
- Validation rules and edge cases
- ML evaluation and false-positive handling
- Authorization/RBAC boundaries
- Security and privacy risks
- Accessibility and responsive/mobile behavior
- End-to-end student, institution and reviewer journeys

Only mark a test layer as implemented after test code and evidence exist in the repository.

## 24. Demo and Hackathon Mode

The project is a UI prototype for SIH 2026. Synthetic student references and simulated role navigation may be used to explain the concept. Dashboard events and workflow states are examples, not live records or official decisions.

The current repository does **not** implement mock OTP, a mock APAAR service, mock API responses or a connected demo backend. Role access is simulated by navigation; there is no production authentication. If mock services are introduced later, label them clearly as prototype/demo behavior and never represent them as live government integrations.

## 25. Known Limitations

- No production authentication, OTP, account recovery or server-enforced role authorization.
- No Node.js + Express backend or Supabase database connection.
- No live APAAR or Aadhaar integration; no real identifiers should be entered.
- No operational student intake, bulk upload, submission or confirmation workflow.
- No connected validation engine, cross-institution matching, risk scoring or ML model.
- No persisted consent, audit trail, review case, notification or verification history.
- No official AICTE data, institution feed, report generation or production decision.
- QR/credential pages are placeholders and do not issue or verify credentials.
- Legal, privacy and security content is draft/intended-principle material and has not had formal review.
- Automated verification is limited to the configured TypeScript/Vite build; a product test suite is not present.

## 26. Contribution and Change Process

For each future change:

1. Read this README and understand the current architecture.
2. Identify the relevant layer before editing.
3. Make the smallest appropriate change.
4. Reuse existing components and design tokens.
5. Test the affected functionality with checks that actually exist or add focused tests where appropriate.
6. Review responsive behavior.
7. Review keyboard access, labels, focus and status communication.
8. Update documentation and implementation status when architecture or capability changes.
9. Do not silently introduce schema, API, identifier, privacy or authentication decisions.

## 27. Documentation Maintenance

This README is the master project reference for humans and future coding agents. Keep it synchronized with the repository when a significant feature, route, service, architecture decision or implementation status changes. Update the current structure from the actual tree, and separate implemented behavior from future intent.

Before adding a new dependency, service, data model or integration, verify that it is necessary and approved. Do not use documentation changes to imply that a feature has been built.

## 28. Documentation Integrity

This README describes what the repository contains today and what the product is intended to become in separate sections. It is not marketing copy, a legal policy, a security assessment, an API contract, a database migration or evidence of official deployment.

Do not add fake badges, build status, GitHub stars, downloads, coverage, deployments, institutional partnerships, statistics, certifications or performance claims. Keep statements specific, verifiable and aligned with the code. When evidence is missing, label the capability as planned or unknown rather than implying completion.
