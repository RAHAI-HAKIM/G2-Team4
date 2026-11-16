# Documentation

| Folder | Contents | Owner |
|--------|----------|-------|
| [`srs/`](srs/) | Software Requirements Specification — the source of truth for *what* we build | Product owner |
| [`process/`](process/) | Scrum working agreement, product backlog, Trello guide, ceremony templates, sprint records | Product owner + Scrum Master |
| [`research/`](research/) | Interview guide, anonymised interview summaries, competitor trial notes | UX, documentation and business plan |
| `architecture/` | Architecture overview, data model, Architecture Decision Records (ADRs) — *Sprint 1* | Backend lead |
| `compliance/` | Processing register, privacy notice, breach procedure, ANPDP enquiry — *Sprint 1* | QA, security and compliance |
| `user-guide/` | Inspector guide and admin guide in Arabic and French — *Sprint 6* | UX, documentation |

## Writing rules

- Markdown, one sentence per line where practical (cleaner diffs).
- Diagrams in [Mermaid](https://mermaid.js.org/) inside the Markdown so GitHub renders them and they stay editable.
- Refer to requirements by their SRS ID (`INSP-03`, `BR-04`), never by page number.
- The original specification PDF (v1.1) is the input; the SRS supersedes it for requirements.
  Business-plan content (market, finances, marketing) stays in the specification.
