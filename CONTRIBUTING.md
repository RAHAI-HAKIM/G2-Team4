# Contributing to Crucible

This file is the team's rulebook for code. How we plan and run sprints is in
[docs/process/scrum.md](docs/process/scrum.md).

**The short version:** pick a card on Trello → branch from `main` → small commits →
pull request with the card ID → one review → squash-merge → move the card.

---

## 1. Work items and IDs

Every piece of work starts as a card on the Trello board, and every card has an ID.
The ID appears in the branch name, the pull-request title and the card title, which is
how we link Trello ↔ GitHub and keep the "who did what" record needed for individual
assessment (spec §14).

| Prefix | Kind | Example |
|--------|------|---------|
| `US-###` | User story — value for a user role | `US-021` Inspector enters a measurement |
| `EN-###` | Enabler — technical work with no direct user value (CI, Docker, schema) | `EN-004` CI pipeline |
| `RS-###` | Research, documentation or compliance task | `RS-003` ANPDP enquiry |
| `BUG-###` | Defect found after a story was marked Done | `BUG-007` |

The master list lives in [docs/process/product-backlog.md](docs/process/product-backlog.md).
New items get the next free number; numbers are never reused.

## 2. Branches

We use **GitHub Flow**: `main` is always buildable and demo-able; all work happens on
short-lived branches (ideally merged within 3 days).

```
<type>/<ID>-<short-kebab-description>
```

| Type | Use for |
|------|---------|
| `feat/` | New behaviour (user stories) |
| `fix/` | Bug fixes |
| `chore/` | Tooling, dependencies, configuration |
| `docs/` | Documentation only |
| `test/` | Tests only |
| `refactor/` | Code change with no behaviour change |

Examples: `feat/US-021-measurement-entry`, `fix/BUG-007-rtl-table-alignment`,
`chore/EN-004-ci-pipeline`, `docs/RS-001-srs-draft`.

Rules:

- Branch from an up-to-date `main`; rebase on `main` (or merge `main` in) before asking for review.
- Never commit directly to `main`.
- Delete the branch after merge (GitHub does it automatically if enabled).

## 3. Commits — Conventional Commits

```
<type>(<scope>): <imperative summary, ≤ 72 chars>

<optional body: what and why, not how>

Refs: US-021
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `ci`, `build`, `style`.

**Scopes** follow the domain modules, so the history reads by module:

| Scope | Covers | Scope | Covers |
|-------|--------|-------|--------|
| `accounts` | F1 auth, roles, PIN | `notifications` | F8 |
| `masterdata` | F2 | `analytics` | F9 dashboard, F10 SPC |
| `plans` | F3 | `reports` | F11 PDF / Excel / CSV |
| `inspections` | F4, AQL sampling | `audit` | F13 |
| `defects` | F5 | `i18n` | F14 |
| `ncr` | F6 | `offline` | F15 |
| `capa` | F7 | `suppliers`, `gauges`, `admin` | F16, F17, F18 |
| `frontend`, `shopfloor` | UI shell / tablet mode | `infra`, `ci`, `deps` | DevOps |
| `srs`, `process` | docs/srs, docs/process | `e2e` | Playwright |

Examples:

```
feat(inspections): compute ISO 2859-1 sample size from lot size and AQL
fix(i18n): mirror chevron icons in right-to-left layout
test(analytics): cross-check X-bar R limits against NumPy reference
```

Commit early and often on your branch; the branch is squash-merged, so the PR title becomes
the commit on `main`.

## 4. Pull requests

1. Title: `<ID> <type>(<scope>): <summary>` — e.g. `US-021 feat(inspections): measurement entry with limit check`.
2. Fill in the [PR template](.github/pull_request_template.md) — it contains the **Definition of Done** checklist.
3. Keep PRs small: aim for < 400 changed lines. Split big stories into several PRs.
4. At least **one approving review** from someone other than the author; changes to a folder
   also request its lead automatically via [CODEOWNERS](.github/CODEOWNERS).
5. CI must be green before merge.
6. Merge with **Squash and merge**, then move the Trello card to *Done* (only if the DoD is met).

### Reviewing

- Review within **one working day** — a waiting PR blocks a teammate.
- Check: does it meet the acceptance criteria on the card? Are there tests? Is any text
  hard-coded instead of going through translations? Is any industry-specific term hard-coded
  instead of being configuration data?
- Comment with prefixes so intent is clear: `blocking:`, `suggestion:`, `question:`, `nit:`.
- Each member reviews other members' work every week (spec §14) — the Scrum Master balances this.

## 5. Code rules that come from the specification

These are not style preferences; they are requirements (see the [SRS](docs/srs/SRS.md)).

- **No industry-specific code.** No sector names, field names or workflows in code — they are configuration data (SRS §2.1, BR-01).
- **Every user-visible string is translatable** (Arabic, French, English for development) — no literal UI text in components or API messages (I18N-*).
- **Use CSS logical properties** (`margin-inline-start`, not `margin-left`) so right-to-left works everywhere.
- **All quality calculations live in the backend** (sampling, indicators, SPC) and have reference tests (SRS §5.2 CAL-*, VER-02).
- **Permissions are checked on every API endpoint**, both by role and by site (SEC-03, SEC-04).
- **Records are deactivated, never deleted**; closed records are immutable; every change is written to the audit log (BR-06, BR-07, AUD-*).
- **No secrets in the repository.** Use environment variables; commit only `.env.example` (SEC-08).
- **No calls to foreign services** (analytics, fonts, maps, CDNs) from the application — fonts and assets are self-hosted (PRIV-04).
- **Domain logic coverage ≥ 70%** (sampling, indicators, control charts, workflow rules).

## 6. Code style

| Area | Tooling (set up in Sprint 0) |
|------|------------------------------|
| Python | `ruff` (lint + format, line length 100), `mypy` with django-stubs, `pytest` |
| TypeScript | ESLint, Prettier, `tsc --strict`, Vitest |
| E2E | Playwright |
| All files | [`.editorconfig`](.editorconfig) — UTF-8, LF, final newline |

Run the linters before pushing; CI runs them anyway.

## 7. Secrets and personal data

- Never commit `.env`, keys, real customer data or real staff names. Use the seeded fake data.
- Interview notes with personal data stay out of the repo; commit only anonymised summaries
  (Law 18-07, see SRS §7.4).
- If you commit a secret by mistake, tell the team immediately — rotating the secret is
  required; deleting the commit is not enough.
