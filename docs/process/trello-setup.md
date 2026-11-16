# Trello board setup

Trello holds every work item (product backlog + sprint board). GitHub holds code and reviews.
This page says exactly how the board is organised so it stays the same whoever touches it.

---

## 1. Board settings

| Setting | Value |
|---------|-------|
| Name | `Crucible — G2-Team4` |
| Visibility | **Workspace** (all team members in the workspace), or **Private** with all six members invited. Never *Public* — the board will contain interview contacts and pilot-plant names. |
| Members | All six as *normal* members; the supervisor as a member if they want to follow progress |
| Power-Ups | **GitHub** (attach branches and pull requests to cards). Optional: a burndown Power-Up if the SM prefers it to a spreadsheet. |
| Card covers | Off (keeps the board compact) |

## 2. Lists (left to right)

| List | What goes there | Rule |
|------|-----------------|------|
| **Team Info** | The four pinned reference cards (§5) | Never moves |
| **Product Backlog** | Everything not in the current sprint, ordered by the PO — top = next | Only the PO reorders |
| **Sprint Backlog** | Cards committed at sprint planning | Fixed after planning, except by team agreement |
| **In Progress** | Cards someone is actively working on | **Max 2 cards per person**; card must have its owner's face |
| **In Review** | A pull request is open, or a document awaits review | PR link attached to the card |
| **Done — Sprint N** | Meets the Definition of Done and accepted by the PO | Only moved here after the PR is merged |


**End of each sprint:** rename the Done list's title to the sprint's dates
(e.g. `Done — Sprint 0 (16–27 Nov)`), **archive that list** (archived lists stay searchable and
keep the "who did what" record), and create a fresh `Done — Sprint N+1`.
Unfinished cards go back to the top of *Product Backlog*.

## 3. Labels

| Group | Label | Colour |
|-------|-------|--------|
| Priority | `Must` | red |
| | `Should` | orange |
| | `Could` | yellow |
| Type | `Story` | green |
| | `Enabler` | blue |
| | `Research / Docs` | purple |
| | `Bug` | black |
| Area | `Backend` | sky |
| | `Frontend` | lime |
| | `DevOps` | pink |
| | `QA / Security` | dark green (or any free colour) |
| | `UX / Docs` | light purple (or any free colour) |
| Flag | `Blocked` | dark red — add it the moment you are stuck, and say why in a comment |
| | `Risk gate` | dark orange — cards that clear R1–R11 gates |

Every card gets **one priority + one type + at least one area**.

## 4. Card conventions

**Title:** `(points) ID Short title [feature]` — points are added at planning.

```
(5) US-017 Sample size from ISO 2859-1 (lot size, level, AQL) [F4]
```

**Members:** exactly **one owner** (the person accountable). Helpers can be added but the owner
is the one who moves the card.

**Template card** — create a card named `📝 Story template`, fill it as below, then *Make template*
from the card menu. New stories are created from it with *Create card from template*.

Description:

```markdown
**As a** <role>
**I want** <capability>
**So that** <benefit>

**SRS:** INSP-03, BR-04
**Branch:** feat/US-0xx-short-name
**Notes / sketch:**
```

Checklist **Acceptance criteria** — one item per criterion (written at refinement).

Checklist **Definition of Done**:

- [ ] Acceptance criteria met, PO accepted
- [ ] PR reviewed and merged, CI green
- [ ] Tests written (incl. forbidden access by role and site)
- [ ] Arabic + French strings, RTL checked
- [ ] Nothing industry-specific hard-coded
- [ ] Audit log written for record changes
- [ ] Running on staging

**Linking to GitHub:** with the GitHub Power-Up, attach the pull request to the card.
Without it, paste the PR URL as an attachment. The card ID in the PR title also makes it
findable from GitHub.

## 5. Pinned info cards (in Team Info)

| Card | Content |
|------|---------|
|  **Current sprint goal** | Sprint number, dates, goal sentence, Scrum Master of the sprint. Updated at each planning. |
|  **Team and roles** | The roles table from [scrum.md §1](scrum.md#1-roles), with each member's GitHub handle. |
|  **DoR / DoD** | The two checklists from [scrum.md §6–7](scrum.md#6-definition-of-ready-a-story-can-enter-a-sprint-when). |
|  **Links** | GitHub repository, SRS, CONTRIBUTING, staging URL (once it exists), team chat, supervisor contact. |

## 6. Seeding from the backlog file

1. Open [product-backlog.md](product-backlog.md). Each sprint section ends with a code block of card titles.
2. Copy the block, click **Add a card** in the target list, paste. Trello asks whether to create
   one card per line — choose that.
3. Apply labels (priority / type / area). Tip: hover over a card and press `L` to open the label picker without opening the card.
4. Copy the story sentence and acceptance criteria from the backlog file into the card
   description for the **current** sprint's cards; later cards get them at refinement.

## 7. What the Scrum Master checks every week

- Every card *In Progress* has an owner and has moved in the last 3 days (otherwise ask, or add `Blocked`).
- Nobody has more than 2 cards *In Progress*.
- Every card *In Review* has a PR link, and no PR is waiting more than one working day.
- Remaining points are noted for the burndown.
