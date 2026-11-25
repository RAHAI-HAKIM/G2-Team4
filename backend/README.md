# Backend — Django modular monolith

> Status: **minimal backend for the F4 inspection prototype** (one app, SQLite, no login).
> The planned structure below is the target for the real product.

## Current prototype

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python manage.py migrate          # creates db.sqlite3 and the 4 demo lots
python manage.py runserver        # http://127.0.0.1:8000
python manage.py test             # sampling + API tests
python manage.py reset_demo       # dev only: put every lot back to "awaiting"
```

| Endpoint | Purpose |
|----------|---------|
| `GET /api/catalog/` | Lines → work orders → lots (status + ISO 2859-1 sampling plan), and the inspection plans |
| `POST /api/inspections/` | `{lot, inspector, pin, inspectedUnits, defects[]}` → server validates, recomputes accept/reject, numbers defects `DEF-YYYY-NNNN`, sets the lot to accepted or on hold |

- `inspections/sampling.py` — ISO 2859-1 tables (AQL 2.5, levels I/II); to verify against the standard.
- `inspections/data.py` — lines, work orders and plans as static data (configuration screens come later).
- `inspections/services.py` — validation and decision logic; `views.py` only translates HTTP.

**Lead:** Backend lead (spec §14) · **Stack:** Python 3.12, Django, Django REST Framework,
PostgreSQL 16, NumPy/SciPy, WeasyPrint.

## Planned structure (Not Decided yet)

```text
backend/
├── pyproject.toml          dependencies + ruff, mypy, pytest configuration
├── manage.py
├── .env.example            every environment variable, with safe example values
├── config/                 Django project (settings split by environment)
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   ├── test.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                   one Django app per domain module (spec §7.1)
│   ├── core/               shared base models (timestamps, site scoping, soft-deactivation)
│   ├── accounts/           F1  users, six roles, site access, PIN, Argon2id
│   ├── masterdata/         F2  sites, lines, products, lots, suppliers, shifts, defect catalogue
│   ├── plans/              F3  versioned inspection plans + approval
│   ├── inspections/        F4  execution, ISO 2859-1 sampling, accept/reject
│   ├── defects/            F5  defect records + photos
│   ├── ncr/                F6  NCR, containment, disposition, lot hold/release
│   ├── capa/               F7  CAPA, 5 Whys, Ishikawa, effectiveness check
│   ├── notifications/      F8  e-mail + in-app, escalation
│   ├── analytics/          F9, F10  indicators, Pareto, control charts, Cp/Cpk
│   ├── reports/            F11 PDF (Arabic/French) and Excel/CSV exports
│   ├── audit/              F13 append-only audit log
│   ├── suppliers/          F16 (Could)
│   └── gauges/             F17 (Could)
├── locale/                 ar/, fr/ translation catalogues
└── tests/
    └── reference/          ISO 2859-1 tables, SPC worked examples (SRS VER-02)
```

## Rules

- A module talks to another module through its service functions, not by reaching into its models' internals.
- Every endpoint declares its permission (role **and** site).
- Calculations (sampling, indicators, SPC) are pure functions in `services/` with unit tests against reference values.
- Periodic jobs (escalations, backups) are Django management commands run by the host scheduler.
