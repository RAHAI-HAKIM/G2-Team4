# End-to-end tests — Playwright

> Status: placeholder. Set up in Sprint 2 once UC1 can run end to end.

**Lead:** QA, security and compliance (spec §14).

These tests drive the real application (frontend + backend + database) the way a user would.
They live outside `frontend/` and `backend/` because each test crosses both.

## What must be covered (SRS §9)

| Scenario | Languages | Viewports |
|----------|-----------|-----------|
| UC1 — Inspect a lot at the line | Arabic, French | Desktop, tablet |
| UC2 — Handle a critical defect | Arabic, French | Desktop, tablet |
| O7 — Two industry configurations run UC1 + UC2 with no code change | French | Desktop |
| F15 — Offline inspection, reconnect, no loss or duplicate (if built) | French | Tablet |

## Planned structure

```text
e2e/
├── playwright.config.ts
├── fixtures/          seeded users per role, two industry configurations
└── tests/
    ├── uc1-inspect-lot.spec.ts
    ├── uc2-critical-defect.spec.ts
    └── o7-configurability.spec.ts
```
