# Product backlog — seed

This is the **initial** product backlog derived from the specification (v1.1) and the
[SRS](../srs/SRS.md). It is used once to seed the Trello board; after that **Trello is the
source of truth** and this file is only updated when IDs are added (so numbers are never reused).

- **IDs:** `US` user story · `EN` enabler (technical) · `RS` research / documentation / compliance. See [CONTRIBUTING.md](../../CONTRIBUTING.md#1-work-items-and-ids).
- **Priority:** MoSCoW from spec §6.2 (M = Must, S = Should, C = Could).
- **Points:** left empty on purpose — the team estimates together at planning (planning poker).
- **Acceptance criteria:** written for Sprints 0–2 now; later stories get theirs at backlog refinement (Definition of Ready), not months in advance.
- **Sprint:** the target from the milestone plan (spec §15). The PO may reorder.

Each sprint section ends with a **Trello paste block**: copy it, open *Add a card* in the
target list, paste — Trello offers to create one card per line.

---

## Sprint 0 — Week 1 · *The problem is being validated, Architecture agreed and a walking skeleton runs on staging*

| ID | Item | Prio | Refs |
|----|------|------|------|
| RS-001 | Assign the five specialist lead roles (spec §14) and the Scrum Master rotation | M | scrum.md §1 |
| RS-002 | Set up the Trello board (lists, labels, card template) and seed it from this backlog | M | trello-setup.md |
| RS-003 | Team review of SRS draft v0.1 — every member reads their area and opens questions | M | SRS |
| RS-004 | Finalise the practitioner interview guide | M | O5, R3 |
| RS-005 | Recruit and run ≥ 5 practitioner interviews (continues into Sprint 1) | M | O5, R3 |
| RS-006 | Hands-on trial of a reference product (e.g. Odoo Quality) and write trial notes | M | O5, spec §4 |
| EN-001 | Repository conventions: layout, CONTRIBUTING, PR template, CODEOWNERS | M | — |
| EN-002 | Backend skeleton: Django project, split settings, custom `User`, health endpoint, ruff + mypy + pytest | M | DC-01 |
| EN-003 | Frontend skeleton: Vite + React + TS, router, i18next ar/fr/en with RTL switch, two layout shells | M | DC-01, I18N-01 |
| EN-004 | CI pipeline: lint, types, tests, build, dependency scan on every PR | M | SEC-11, VER-01 |
| EN-005 | Docker Compose dev stack (PostgreSQL 16, backend, frontend) and `.env.example` | M | DC-01, SEC-08 |
| EN-006 | Onboarding: every member runs the stack locally and merges one small PR | M | — |
| EN-007 | Architecture document + first ADRs (modular monolith, stack, one deployment per customer) | M | DC-01..04 |
| EN-008 | Data model v1: ER diagram and schema draft for F1–F7 | M | SRS §8 |
| EN-009 | Staging server and deployment from `main` (walking skeleton on staging) | M | spec §7.5 |
| EN-010 | Audit-log infrastructure: generic append-only event store used by every module | M | AUD-01, AUD-06 |
| EN-011 | Permission framework: role + site scoping base classes and test helpers | M | AUTH-05, AUTH-06, SEC-03, SEC-04 |
| RS-007 | Send written ANPDP enquiry; draft processing register and privacy notice | M | R1, O6, PRIV-05 |
| RS-008 | Plan the two-industry configuration demo (e.g. bottling line, metal parts): list their configuration data | M | O7 |
| RS-009 | Obtain ISO 2859-1 tables and SPC constants; build the reference test dataset | M | R7, VER-02 |
| RS-010 | Final specification / SRS v1.0 (Week 4 deliverable) | M | — |
| RS-011 | R3 gate evidence: documented interviews and letters of intent, or a simulated-pilot dataset | M | R3 |

**Acceptance criteria (Sprint 0):**

- RS-001 — Roles table in `docs/process/scrum.md` and CODEOWNERS filled with real handles.
- RS-004 — Guide covers current practice, pain points, configurable-model check, pricing question, consent; reviewed by one other member.
- RS-005 — Interview log with date, anonymised profile, notes stored outside the repo; anonymised summary in `docs/research/`.
- RS-006 — Notes: what the product does for inspection → defect → NCR → CAPA, gaps, screenshots.
- EN-002 — `python manage.py runserver` serves `/api/health/` returning 200; `pytest`, `ruff`, `mypy` pass.
- EN-003 — App switches between Arabic (RTL) and French (LTR) at runtime; one placeholder page per shell.
- EN-004 — A PR with a failing test or lint error is shown red; a clean PR is green.
- EN-005 — `docker compose up` starts the stack on a fresh machine using only README instructions.
- EN-006 — Six merged PRs, one per member.
- EN-008 — Diagram + Django model sketch reviewed by backend and frontend leads; covers lot → inspection → defect → NCR → CAPA chain (O2).
- EN-009 — A merge to `main` is visible on staging over HTTPS within 15 minutes, by a documented procedure.
- EN-010 — Creating/updating a sample record writes user, timestamp, entity, action, old and new values; no API exists to update or delete events.
- EN-011 — A test proves a user of site A gets 404/403 on a record of site B.
- RS-007 — Enquiry sent (date recorded), register and notice drafts in `docs/compliance/`.
- RS-009 — Tables stored as CSV/JSON with source noted; at least one SPC worked example with expected values.

```text
RS-001 Assign specialist lead roles and Scrum Master rotation
RS-002 Set up Trello board and seed backlog
RS-003 Team review of SRS draft v0.1
RS-004 Finalise practitioner interview guide
RS-005 Run at least 5 practitioner interviews
RS-006 Hands-on trial of a reference product (Odoo Quality)
EN-001 Repository conventions (layout, CONTRIBUTING, PR template)
EN-002 Backend skeleton (Django, settings, custom User, tooling)
EN-003 Frontend skeleton (Vite React TS, i18n ar/fr/en, RTL, shells)
EN-004 CI pipeline (lint, types, tests, build, dependency scan)
EN-005 Docker Compose dev stack and .env.example
EN-006 Onboarding - every member runs the stack and merges one PR
EN-007 Architecture document and first ADRs
EN-008 Data model v1 (ER diagram, schema draft F1-F7)
EN-009 Staging server and deployment from main
EN-010 Audit-log infrastructure (append-only events)
EN-011 Permission framework (role + site scoping)
RS-007 ANPDP enquiry, processing register and privacy notice drafts
RS-008 Plan the two-industry configuration demo (O7)
RS-009 ISO 2859-1 tables, SPC constants and reference dataset
RS-010 Final specification / SRS v1.0
RS-011 R3 gate evidence (interviews, letters of intent or simulated pilot)
```



## Icebox — optional extensions (spec §6.3)

Started only once every Should item is done.

| ID | Item |
|----|------|
| — | Industry packs (importable sector templates) |
| — | Recurring-defect detection and CAPA recommendation |
| — | Adaptive sampling (ISO 2859-1 switching rules) |
| — | Statistical significance test for CAPA effectiveness |
