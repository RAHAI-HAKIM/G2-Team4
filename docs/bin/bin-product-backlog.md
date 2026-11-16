## Sprint 2 — Weeks 5–6 · *A quality manager can configure the plant*

| ID | Story | Prio | Refs |
|----|-------|------|------|
| US-001 | As a **user**, I log in with my work e-mail or work ID and password, so that only authorised staff use the system. | M | AUTH-01, AUTH-02, AUTH-09, AUTH-11 |
| US-002 | As an **administrator**, I want an account locked after repeated failed logins, so that passwords cannot be guessed. | M | AUTH-03, SEC-02 |
| US-003 | As an **administrator**, I create users, give them roles and sites, and deactivate them, so that access matches the organisation. | M | ADM-01, AUTH-04, AUTH-06 |
| US-004 | As an **inspector** on a shared tablet, I switch user with my badge number and PIN, so that I never type a password on the line. | M | AUTH-07 |
| US-005 | As a **user**, I choose Arabic or French and the whole interface, dates and numbers follow, so that I work in my language. | M | I18N-01..03 |
| US-006 | As a **quality manager**, I manage sites, lines, stations and shifts. | M | MD-01, MD-02 |
| US-007 | As a **quality manager**, I manage product families and products. | M | MD-01 |
| US-008 | As a **quality manager**, I manage suppliers. | M | MD-01 |
| US-009 | As a **quality manager**, I manage the defect catalogue (code, description, category, default severity) and the severity scale. | M | MD-01, MD-04, MD-06, I18N-04 |
| US-010 | As a **quality manager**, I import master data from CSV and get a row-by-row error report, so that setup takes hours, not days. | M | MD-03 |
| US-011 | As a **quality manager**, I register lots and work orders (manually or by CSV). | M | MD-05 |
| US-012 | As a **quality manager**, I create an inspection plan for a product and a stage, with attribute and variable characteristics. | M | PLAN-01, PLAN-02 |
| US-013 | As a **quality manager**, I set a plan's sampling rule and frequency. | M | PLAN-03, PLAN-04 |
| US-014 | As a **quality manager**, I submit a plan, and a second authorised user approves or rejects it. | M | PLAN-05, PLAN-08, BR-02 |
| US-015 | As a **quality manager**, editing an approved plan creates a new version, and earlier inspections keep the version they used. | M | PLAN-06, PLAN-07, BR-03 |
| EN-012 | Arabic PDF proof: WeasyPrint sample report with Arabic shaping and a right-to-left table | M | RPT-04, DC-08 |
| RS-012 | Hosting quotes from ≥ 2 Algerian providers and a test deployment | M | R2 |

**Acceptance criteria (Sprint 2):**

- US-001 — Valid credentials open the home page of the user's role; invalid ones show a generic error (no hint which field was wrong); password stored as Argon2id; session cookie is `Secure`, `HttpOnly`, `SameSite`; logout invalidates the session.
- US-002 — After *N* failures (setting, default per TBD-01) the account is locked for the set duration; the attempt and the lock are audit-logged; an admin can unlock.
- US-003 — Admin can create, edit, deactivate (not delete) users; roles from the six of SRS §2.3; one or more sites; a deactivated user cannot log in; all changes audit-logged.
- US-004 — From the shop-floor shell, "Switch user" accepts badge number + PIN; wrong PIN counts toward lockout; the previous user's unsaved entry is not visible to the next.
- US-005 — Language switch persists per user; Arabic sets `dir="rtl"` and mirrors layout; dates and numbers use the locale; no untranslated key visible on any Sprint-2 screen.
- US-006..009 — Create, edit, deactivate; deactivated items disappear from selection lists but remain on old records; names/descriptions in Arabic and French; site-scoped.
- US-010 — Upload a CSV; valid rows import; each invalid row is reported with row number and reason; nothing is half-imported for a row.
- US-012 — Plan has product, stage (incoming / in-process / final), characteristics; attribute = pass/fail; variable = LSL and/or USL + unit; photo-on-fail flag; failure instruction text.
- US-013 — Sampling rule ISO 2859-1 (inspection level + AQL); frequency stored (options per TBD-05).
- US-014 — Author cannot approve their own plan; only approved plans are offered to inspectors; rejection requires a comment.
- US-015 — Editing an approved plan creates version *n+1* in draft; version *n* stays in use until *n+1* is approved; each inspection stores the version ID.
- EN-012 — Generated PDF shows connected Arabic letters, RTL table order and mixed Arabic/Latin product codes correctly; reviewed by an Arabic reader.

```text
US-001 Log in with work e-mail or work ID and password [F1]
US-002 Lock account after repeated failed logins [F1]
US-003 Admin manages users, roles and sites [F1/F18]
US-004 Shop-floor user switch with badge number and PIN [F1]
US-005 Switch language Arabic/French with RTL [F14]
US-006 Manage sites, lines, stations and shifts [F2]
US-007 Manage product families and products [F2]
US-008 Manage suppliers [F2]
US-009 Manage defect catalogue and severity scale [F2]
US-010 CSV import of master data with row-level error report [F2]
US-011 Register lots and work orders [F2]
US-012 Create inspection plan with characteristics [F3]
US-013 Set sampling rule and frequency of a plan [F3]
US-014 Plan approval by a second authorised user [F3]
US-015 Plan versioning - inspections pinned to their version [F3]
EN-012 Arabic PDF proof with WeasyPrint (shaping + RTL table)
RS-012 Hosting quotes and test deployment (R2)
```

## Sprint 3 — Weeks 7–8 · *An inspector can inspect a lot end to end (UC1)*

| ID | Story | Prio | Refs |
|----|-------|------|------|
| US-016 | As an **inspector**, I select line and lot, and the system proposes the approved plan for that product and stage. | M | INSP-01 |
| US-017 | As an **inspector**, I see the sample size computed from ISO 2859-1 for the lot size, inspection level and AQL. | M | INSP-02, CAL-01 |
| EN-013 | ISO 2859-1 tables stored as data, with cell-by-cell reference tests (R7 gate) | M | VER-02, BR-04 |
| US-018 | As an **inspector**, I enter pass/fail marks and measurements per unit, and out-of-limit values are flagged at once. | M | INSP-03, INSP-04 |
| US-019 | As an **inspector**, I get an accept/reject proposal and sign the decision with my PIN. | M | INSP-05, INSP-06, BR-05 |
| US-020 | As a **supervisor**, a rejected lot is put on hold automatically, so that it cannot move on. | M | INSP-07, BR-08 |
| US-021 | As an **inspector**, I log a defect from a failed check in five taps or fewer, with code, quantity, severity, location and up to five photos. | M | DEF-01, DEF-02, DEF-05, INSP-08 |
| US-022 | As an **inspector**, I log a standalone defect not found during a planned inspection. | M | DEF-01, DEF-03 |
| US-023 | As a **quality manager**, a critical defect holds the lot automatically and alerts the supervisor and me. | M | DEF-04, BR-09 |
| US-024 | As an **inspector or quality manager**, I open an NCR from defects or a rejected lot and record containment and affected quantity. | M | NCR-01, NCR-02, NCR-05 |
| US-025 | As a **quality manager**, I decide the NCR disposition (rework, scrap, concession, return to supplier, regrade). | M | NCR-03, NCR-06 |
| US-026 | As a **quality manager**, I release a held lot, and the system requires a reason. | M | NCR-04, BR-10 |
| EN-014 | Playwright set-up and UC1 end-to-end test in Arabic and French | M | VER-04 |
| RS-013 | First end-to-end demonstration of UC1 (Week 8) | M | O1 |

```text
US-016 Select line and lot - system proposes approved plan [F4]
US-017 Sample size from ISO 2859-1 (lot size, level, AQL) [F4]
EN-013 ISO 2859-1 tables as data + cell-by-cell reference tests (R7)
US-018 Enter results per unit with immediate out-of-limit flag [F4]
US-019 Accept/reject proposal and PIN signature [F4]
US-020 Rejected lot goes on hold automatically [F4]
US-021 Log defect from failed check in 5 taps or fewer [F5]
US-022 Log standalone defect [F5]
US-023 Critical defect holds lot and alerts supervisor and QM [F5]
US-024 Open NCR with containment and affected quantity [F6]
US-025 Decide NCR disposition [F6]
US-026 Release held lot with mandatory reason [F6]
EN-014 Playwright set-up and UC1 E2E test (ar/fr)
RS-013 First end-to-end demonstration of UC1
```

## Sprint 4 — Weeks 9–10 · *MVP complete*

| ID | Story | Prio | Refs |
|----|-------|------|------|
| US-027 | As a **quality manager**, I open a CAPA from one or more NCRs. | M | CAPA-01, CAPA-08 |
| US-028 | As a **quality manager**, I document the root cause with 5 Whys and an Ishikawa (6M) diagram. | M | CAPA-02 |
| US-029 | As a **quality manager or supervisor**, I assign CAPA actions with an owner and a due date. | M | CAPA-03 |
| US-030 | As an **action owner**, I see only my actions, update their status and attach evidence. | M | CAPA-04, BR-13 |
| US-031 | As a **quality manager**, I close a CAPA only after the verification period, comparing defect rates before and after, with my PIN. | M | CAPA-05, CAPA-06, BR-11, CAL-12 |
| US-032 | As a **quality manager**, I export a CAPA and its NCRs as an 8D-style PDF. | M | CAPA-07, RPT-02 |
| US-033 | As a **user**, I receive in-app and e-mail notices for assignments, due dates and held lots. | S | NOT-01, NOT-03, NOT-04 |
| US-034 | As a **quality manager**, overdue items escalate after a configurable delay. | S | NOT-02 |
| US-035 | As an **inspector**, I inspect and log defects offline; entries sync when the network returns, with a visible queue counter (prototype). | S | OFF-01..04 |
| US-036 | As a **quality manager**, I see a dashboard: defect rate, first-pass yield, open NCRs, CAPA on-time rate, inspections today. | M | DASH-01, DASH-05, CAL-02..07 |
| US-037 | As a **quality manager**, I see a Pareto of defect types and trends by day, week and month, filtered by site, line, product, shift and period. | M | DASH-02..04 |
| US-038 | As a **quality manager**, I see X̄-R, p, np and c control charts with Western Electric signals. | S | SPC-01, SPC-02, CAL-09, CAL-10 |
| US-039 | As a **quality manager**, I see a histogram with Cp and Cpk, and a warning when data are too few or the process is not in control. | S | SPC-03..05, CAL-11 |
| EN-015 | SPC and capability reference tests against NumPy/R and textbook examples | S | VER-02 |
| US-040 | As an **inspector or quality manager**, I print an inspection report as PDF in Arabic or French. | M | RPT-01, RPT-04 |
| US-041 | As a **quality manager**, I generate the monthly quality summary for a period and product family. | M | RPT-03, RPT-06, RPT-07 |
| US-042 | As a **user with export rights**, I export any list to Excel and CSV. | M | RPT-05 |
| US-043 | As a **quality manager or auditor**, I search by lot code, serial number or supplier lot and see every linked record in one view. | M | TRC-01..03 |
| US-044 | As an **auditor**, I browse records and the audit log read-only and export them. | M | AUD-03, AUD-05 |
| US-045 | As a **quality manager**, closed records are locked and any correction is recorded as a new event. | M | AUD-02, BR-07 |

```text
US-027 Open CAPA from one or more NCRs [F7]
US-028 Root cause with 5 Whys and Ishikawa (6M) [F7]
US-029 Assign CAPA actions with owner and due date [F7]
US-030 Action owner updates own actions and attaches evidence [F7]
US-031 Close CAPA after verification period with before/after comparison and PIN [F7]
US-032 8D-style PDF of a CAPA [F7/F11]
US-033 In-app and e-mail notifications [F8 Should]
US-034 Escalation of overdue items [F8 Should]
US-035 Offline inspection queue prototype [F15 Should]
US-036 Quality dashboard indicators [F9]
US-037 Pareto and trends with filters [F9]
US-038 Control charts X-bar R, p, np, c with Western Electric rules [F10 Should]
US-039 Histogram, Cp and Cpk with data warnings [F10 Should]
EN-015 SPC and capability reference tests vs NumPy/R
US-040 Inspection report PDF in Arabic or French [F11]
US-041 Monthly quality summary PDF [F11]
US-042 Excel and CSV export of any list [F11]
US-043 Lot traceability view [F12]
US-044 Auditor read-only access and audit log export [F13]
US-045 Lock closed records, corrections as new events [F13]
```

## Sprint 5 — Weeks 11–12 · *Proven with users and hardened*

| ID | Item | Prio | Refs |
|----|------|------|------|
| RS-014 | Pilot at one plant, or a realistic simulation with seeded data | M | R3, R8 |
| RS-015 | Usability test with ≥ 5 users: median time to log a defect, task success | M | O3, R4, VER-08 |
| RS-016 | Arabic terminology review by a quality professional | M | NF7 |
| US-046 | As an **administrator**, a nightly encrypted backup of database and files runs, and the restore procedure is documented and tested. | M | ADM-03, ADM-04, NF3 |
| US-047 | As an **administrator**, I configure lockout, session timeout, escalation delays and data retention. | M | ADM-02, ADM-05 |
| EN-016 | Security review against OWASP ASVS level 2 and penetration test | M | NF4, SEC-12, R10 |
| EN-017 | Load test: 30 concurrent users on staging (NF1) | M | NF1, VER-07 |
| EN-018 | Low-end device test on the reference PC and an 8″ tablet | M | R5, NF8 |
| US-048 | As a **quality manager**, I see a score per supplier from incoming inspections, issue a supplier corrective-action request PDF, and see supplier trends. | C | SUP-01..03 |
| US-049 | As a **quality manager**, I keep a gauge register with calibration due dates, and an out-of-date gauge raises a warning in inspection. | C | GAU-01, GAU-02 |

```text
RS-014 Pilot at one plant or realistic simulation
RS-015 Usability test with at least 5 users (O3)
RS-016 Arabic terminology review by a quality professional
US-046 Nightly encrypted backup and tested restore [F18]
US-047 Admin settings - lockout, session, escalation, retention [F18]
EN-016 Security review (OWASP ASVS L2) and penetration test
EN-017 Load test with 30 concurrent users (NF1)
EN-018 Low-end device test (R5)
US-048 Supplier quality score and SCAR PDF [F16 Could]
US-049 Gauge register with calibration warnings [F17 Could]
```

## Sprint 6 — Weeks 13–14 · *Ready to present*

| ID | Item | Prio | Refs |
|----|------|------|------|
| RS-017 | Inspector guide and administrator guide in Arabic and French | M | spec §7.5 |
| RS-018 | Two industry configurations set up through the UI only, plus demonstration data | M | O7, VER-05 |
| EN-019 | On-premise installer and installation guide | M | spec §7.5 |
| EN-020 | E2E tests for UC2 and the O7 configurability scenario | M | VER-04, VER-05 |
| RS-019 | Bilingual website and 3-minute demo video of UC1 and UC2 | S | spec §11.2 |
| RS-020 | Final report against objectives (spec §2.5) and metrics (§12.2); final presentation | M | O1–O7 |

```text
RS-017 Inspector and admin guides in Arabic and French
RS-018 Two industry configurations via UI + demo data (O7)
EN-019 On-premise installer and installation guide
EN-020 E2E tests for UC2 and O7 configurability
RS-019 Bilingual website and 3-minute demo video
RS-020 Final report and final presentation
```