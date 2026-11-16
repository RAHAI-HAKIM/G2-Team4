# Scrum working agreement — Crucible (G2-Team4)

This is how we plan, build and show our work over the 14 weeks.
It is a living document: the retrospective may change it, and the change is committed here.

---

## 1. Roles

| Scrum role | Who | Responsibilities |
|------------|-----|------------------|
| **Product Owner (PO)** | RAHAI Mohamed Abdelhakim | Owns the product backlog and its order, writes and accepts stories, owns the [SRS](../srs/SRS.md), decides what is "done enough" for the demo, talks to the supervisor and pilot plants. |
| **Scrum Master (SM)** | *to be chosen at Sprint 0 planning* — recommended: **rotate every sprint** among the five other members | Runs the ceremonies and keeps them short, chases blockers, updates the burndown each week, makes sure every PR gets reviewed within a day, balances the weekly peer reviews. |
| **Developers** | All six members (the PO included) | Estimate, pull work, build, test, review each other's work. Each also holds one *specialist lead role* from spec §14 below. |


### Specialist lead roles (spec §14)

These are not Scrum roles; they say who **reviews and has the final technical word** in an
area. Everyone still writes code everywhere.

| Lead role | Owns | Member |
|-----------|------|--------|
| Project lead and product owner | Scope, deferred list, backlog, milestone reporting, go/no-go gates R1–R3, pilot-plant relations | RAHAI Mohamed Abdelhakim |
| Backend lead | Data model, REST API, workflow engine (F5–F8), audit trail (F13), hosting decision (R2) | *TBD* |
| Frontend and PWA lead | React app, shop-floor mode and offline queue (F4, F15), Arabic RTL (F14), performance budget (R5) | *TBD* |
| UX, documentation and business plan | Interviews and usability tests (R4), user guide, brand identity, business-plan sections | *TBD* |
| QA, security and compliance | Test plan and reference validation (R7), security tests, ANPDP enquiry and privacy documents (R1), DoD reviews | *TBD* |
| Data, analytics and DevOps | Dashboard and control charts (F9, F10), PDF/Excel reports (F11), CI, Docker, backups (F18) | *TBD* |

## 2. Sprint calendar

**One-week sprints**, seven in total, each aligned with two weeks of the milestone plan
(spec §15).


| Sprint | Week | Starts at | Sprint goal (draft — final wording agreed at planning) | Risk gates to clear |
|--------|-------|-------|--------------------------------------------------------|---------------------|
| **0** | 1 | 21-11 | repository, backlog, roles, interview guide; interviews started; reference product trialled; dev environment works for all the team, architecture + data model, CI green, final specification, plan for the two-industry demo (O7), ANPDP enquiry sent. | R1 enquiry sent · R3 evidence |
| **1** | 2 | 18-11 | *A quality manager can configure the plant*: login and roles (F1), master data (F2), inspection plan builder (F3), Arabic PDF sample. | R2 hosting quotes + test deployment |
| **2** | 3 | 05-12 | *An inspector can inspect a lot end to end (UC1)*: AQL sampling and decision (F4), defect logging (F5), NCR and disposition (F6). | R7 ISO 2859-1 table tests green |
| **3** | 4 | 12-12 | *MVP complete*: CAPA (F7), notifications (F8), offline prototype (F15), dashboard, control charts, reports, traceability (F9–F12). | Funding decision point |
| **4** | 5 | 19-12 | *Proven with users and hardened*: pilot or realistic simulation, 5-user usability test, Arabic terminology review, security review, load and penetration tests. | R4 usability · R5 low-end device · R8 pilot signal · R10 security |
| **5** | 6 | 26-12 | *Ready to present*: final documentation, demo data, on-premise installer, website, demo video, final presentation (UC1–UC3 + two industries). | — |


## 3. Ceremonies

Time boxes are maximums. If a meeting finishes early, it finishes.

| Event | When | Time box | Who | Output |
|-------|------|----------|-----|--------|
| **Sprint planning** | Day 1 of the sprint | 90 min | All | Sprint goal, sprint backlog on Trello (cards moved from *Product Backlog* to *Sprint Backlog*), each card has an owner and points |
| **Daily scrum** | Every working day, **async** in the team chat before 10:00, plus a **15-min call on Sunday and Wednesday** *(adjust days to the timetable)* | 15 min | Developers | Each person posts: *Done since last · Doing next · Blocked by* |
| **Backlog refinement** | Mid-sprint (day 5 or 6) | 45 min | PO + whoever takes the next stories | Next sprint's stories meet the Definition of Ready |
| **Sprint review** | Last day of the sprint | 45 min | All + supervisor when possible | Live demo **on staging** (from Sprint 1), PO accepts or rejects each story, backlog updated |
| **Sprint retrospective** | Right after the review | 30 min | All, SM facilitates | At most **2** improvement actions, each with an owner, added as cards to the next sprint |
| **Weekly burndown + peer review** | End of each week (spec §13 R6, §14) | 10 min | SM | Burndown updated; each member has reviewed at least one PR from someone else that week |

Everything is recorded in one file per sprint, `docs/process/sprints/sprint-NN.md`, created
from [the template](templates/sprint-record.md). The record of who did what (spec §14) comes
from three places: the Trello card owners, the git history, and these sprint records.

## 4. Artifacts

| Artifact | Where | Commitment |
|----------|-------|------------|
| Product backlog | Trello list *Product Backlog*, seeded from [product-backlog.md](product-backlog.md) | Ordered by the PO; top items meet the Definition of Ready |
| Sprint backlog | Trello list *Sprint Backlog* + *In Progress* + *In Review* | The sprint goal |
| Increment | `main` branch, tagged `v0.<sprint>.0` at each review, deployed to staging | The Definition of Done |

## 5. Estimation

- **Story points**, Fibonacci: 1, 2, 3, 5, 8, 13. Estimated together by planning poker
  (a free online tool or fingers on the count of three).
- **Anything above 8 is split** before it enters a sprint.
- A card that one person can finish in **≤ 2 days** is the target size: small cards keep the
  board moving and make blockers visible early.
- Points go at the start of the card title in brackets: `(5) US-021 …` — readable by the
  "Scrum for Trello" style extensions and by eye.
- Velocity = points of stories that met the Definition of Done in the sprint. Unfinished
  stories score 0 and return to the backlog (re-estimated if needed).

## 6. Definition of Ready (a story can enter a sprint when…)

- [ ] It has an ID and follows *As a <role>, I want <capability>, so that <benefit>*.
- [ ] It has testable **acceptance criteria** (a checklist on the card).
- [ ] It references the SRS requirements it implements (e.g. `INSP-03`, `BR-04`).
- [ ] It is estimated and is **8 points or less**.
- [ ] Dependencies are known and either done or planned earlier in the same sprint.
- [ ] For UI stories: a sketch or wireframe is attached, and the Arabic term is known or flagged.

## 7. Definition of Done (a story is done when…)

The pull-request template repeats this list so it is checked at review time.

- [ ] All acceptance criteria are met and the **PO has accepted** it (at review or earlier).
- [ ] Code is merged to `main` through a reviewed pull request; CI is green.
- [ ] Unit and API tests are written; domain logic coverage stays ≥ 70%.
- [ ] Permissions are enforced by **role and site** on every new endpoint, with a test for a forbidden access.
- [ ] All new UI text exists in Arabic, French and English; the screen was checked in RTL and LTR.
- [ ] Nothing industry-specific is hard-coded.
- [ ] Record changes are written to the audit log.
- [ ] It runs on **staging** (from Sprint 1 on).
- [ ] User-facing behaviour changes are reflected in the SRS or user guide if they differ from what was written.

## 8. Working agreements

These target the realities of a student team with exams and other courses.

1. **No card, no work.** If it is not on the board, it does not exist — create the card first, even for 1-hour tasks.
2. **Pull, don't push.** Take the top card you can do; do not wait to be assigned. Put your face on it immediately.
3. **WIP limit: 2 cards per person in *In Progress*.** Finish before starting.
4. **Review within one working day.**
5. **Meetings start on time** and have a written outcome in the sprint record.
6. **Decisions are written down** — in the sprint record, an ADR (`docs/architecture/adr/`) or the card. A decision only in a voice call did not happen.

## 9. Burndown

Updated by the SM every last working day of the week:
remaining story points in the sprint backlog. Keep it in a
Trello burndown Power-Up, and paste the chart into the sprint
record at the review.
