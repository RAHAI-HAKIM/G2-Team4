# Frontend — React + TypeScript

> Status: placeholder. The Vite project is created in Sprint 0 (`EN-003`). This file
> describes the agreed structure so everyone builds in the same place.

**Lead:** Frontend and PWA lead (spec §14) · **Stack:** React, TypeScript (strict), Vite,
React Router, TanStack Query, i18next, ECharts, Vitest.

## Two interfaces, one code base

| Shell | Users | Device | Constraints |
|-------|-------|--------|-------------|
| **Management** | Quality manager, supervisor, action owner, auditor, admin | Plant PC, desktop browser | WCAG 2.1 AA contrast, keyboard operation |
| **Shop floor** | Quality inspector | Android tablet ≥ 8″ | Touch targets ≥ 44 px, log a defect in ≤ 5 taps, offline queue (F15) |

## Planned structure

```text
frontend/
├── package.json
├── vite.config.ts
├── public/
│   └── fonts/              self-hosted Arabic + Latin fonts (no Google Fonts CDN — PRIV-04)
└── src/
    ├── app/                router, providers, the two layouts (ManagementLayout, ShopFloorLayout)
    ├── features/           one folder per domain module, mirroring backend/apps/
    │   ├── auth/
    │   ├── masterdata/
    │   ├── plans/
    │   ├── inspections/
    │   ├── defects/
    │   ├── ncr/
    │   ├── capa/
    │   ├── dashboard/
    │   ├── reports/
    │   └── admin/
    ├── shared/
    │   ├── api/            generated client from the backend OpenAPI schema
    │   ├── ui/             design-system components (buttons, tables, forms)
    │   └── lib/            helpers (dates, numbers — locale-aware)
    └── locales/
        ├── ar/             Arabic (right-to-left)
        ├── fr/             French
        └── en/             English (development)
```

## Rules

- No literal UI text in components — always `t('key')`.
- Use CSS logical properties (`padding-inline-start`, `inset-inline-end`) — never `left`/`right` for layout.
- Numbers, dates and units are formatted with `Intl` in the user's locale.
- Colour is never the only signal (severity also has an icon and a label) — NF6.
- The frontend displays calculations; it never computes quality results itself.
