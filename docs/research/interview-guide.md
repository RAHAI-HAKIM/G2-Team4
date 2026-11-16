# Practitioner interview guide

> Draft for `RS-004`. Supports objective **O5** (validate the need and the configurable model
> with ≥ 5 practitioners by Week 4) and the **R3** go/no-go gate (access to real plants and data).
> Finalise wording in French and Arabic before the first interview.

## 1. Who and how

| | |
|---|---|
| **Who** | Plant quality staff (quality managers, quality engineers, inspectors, line supervisors) and ISO 9001 consultants. Aim for a mix of sectors (agro-food, plastics, electrical, building materials, mechanical — spec §3.3). |
| **How many** | At least 5 by Week 4; stop adding when new interviews stop teaching you anything. |
| **Format** | 45 minutes, on site if possible (seeing the line is worth more than any answer), otherwise video call. |
| **Team** | Two people: one asks, one writes notes. Rotate so every member does at least one interview. |
| **Language** | Whatever the interviewee prefers — French, Arabic or Darija. |

### Golden rules

1. **Ask about what they did, not what they would do.** "Tell me about the last defect you found" beats "Would you use an app for defects?".
2. **Do not pitch Crucible before Part 6.** Once you describe the product, answers become polite.
3. **Dig into numbers and stories:** how long, how often, who, what happened next.
4. **Silence is fine.** Let them fill it.
5. **Ask for documents** — a blank checklist, an NCR form, a report template (with names removed). These are gold for configuring the demo (O7).

### Consent and data protection (Law 18-07)

- At the start, explain the purpose, that participation is voluntary, and how notes are used.
- **Record audio only with explicit consent.** Note the consent (date, verbal/written).
- Personal data (name, phone, company) stays in the team's private interview log — **never in the
  Git repository**. Only anonymised summaries (`INT-01`, sector, plant size, role) go into
  `docs/research/`.
- Do not photograph people; photograph documents only with permission and blur names.

## 2. Hypotheses we are testing

Mark each one as confirmed, refuted or unclear in the summary of every interview.

| ID | Hypothesis | Source |
|----|-----------|--------|
| H1 | Inspections and defects are recorded on paper and individual spreadsheets. | AS-01 |
| H2 | A quality manager spends about two days a month assembling a defect report. | Persona, SRS §2.3 |
| H3 | Inspectors need to log a defect in under a minute, at the line. | O3, NF5 |
| H4 | Plants use (or are asked to use) AQL sampling — ISO 2859-1. | F4 |
| H5 | Tracing a lot from inspection to corrective action is slow or impossible today. | O2, F12 |
| H6 | Corrective actions are rarely checked for effectiveness. | F7 |
| H7 | Arabic is needed for shop-floor staff; French for management and reports. | F14 |
| H8 | Algerian hosting or on-premise installation matters to the plant. | DC-04 |
| H9 | Connectivity on the shop floor is unreliable. | F15 |
| H10 | A price of 6,000–35,000 DZD per month per site is acceptable. | spec §9.1 |

## 3. Questions

### Part 1 — Introduction and consent (3 min)

- Who we are, why we are here, how long it takes, consent for notes / recording.

### Part 2 — Profile (5 min)

- What does the plant make? Roughly how many staff? How many lines?
- What is your role? How long in quality?
- Is the plant ISO 9001-certified, preparing for it, or neither? Any customer-imposed standards (e.g. retailers, export buyers, automotive)?

### Part 3 — How inspections happen today (10 min) — H1, H3, H4, H9

- Walk me through **the last inspection** you did or supervised. Where, what was checked, how was it written down?
- How do you decide **how many units to check**? Do you use AQL tables? Who chose them?
- What do inspectors write on — paper, Excel, a system? Who types it up afterwards, and when?
- What equipment is on the line: PCs, tablets, phones? Is there Wi-Fi where inspectors stand?
- Which languages do inspectors read and write at work?

### Part 4 — When something goes wrong (10 min) — H5, H6

- Tell me about **the last serious defect**. What happened, step by step, from discovery to closure?
- Who decided what to do with the lot (rework, scrap, concession…)? How was it recorded?
- Was a root cause found? With which method (5 Whys, Ishikawa, 8D…)?
- How did you know the corrective action **worked**? Who checked, and when?
- If an auditor or a customer asked you tomorrow for everything about lot X, how long would it take? What would you look through?

### Part 5 — Reporting and analysis (5 min) — H2

- What quality reports do you produce, for whom, how often? **How long does each take?**
- Which indicators do you follow (defect rate, ppm, FPY…)? Do you use control charts or Cpk?
- Which question about quality would you like to answer but cannot today?

### Part 6 — Reaction to the configurable model (7 min) — H7, H8

*Now* show the one-page overview (core chain diagram + feature list) or the paper prototype.

- Looking at this chain — plan → inspection → defect → NCR → CAPA — what is missing for **your** line?
- Here are the things a plant would configure (products, characteristics, limits, defect codes, severities, sampling, frequencies). Could you describe your line with these? What would not fit?
- Which three features would you need from the first day? Which could wait?
- Hosting: would the plant accept data in an Algerian data centre, or must it stay on the plant network? Who decides?

### Part 7 — Price and next step (5 min) — H10, R3

- What do you spend today on quality tools, consultants or certification?
- Plans would cost between 6,000 and 35,000 DZD per month per site, depending on users and features. At what point would that be **too expensive** to consider? At what point so cheap you would doubt it?
- Would your plant be willing to **try it for three months as a free design partner**? Would you sign a short letter of intent?
- Who else should we talk to?

## 4. After the interview (same day)

1. Writer cleans the notes within 24 hours.
2. Fill in the summary below and save it as `docs/research/interviews/INT-NN.md` (anonymised).
3. Add any new requirement idea as a card in *Product Backlog* with the `Research / Docs` label, referencing `INT-NN`.
4. Store any personal data and documents only in the team's private drive.

### Summary template

```markdown
# INT-NN — <sector>, <plant size band>, <role>

- Date: … · Interviewers: … · Mode: on site / video · Consent: yes (verbal/written) · Recorded: yes/no

## Key facts
- …

## Strongest pains (ranked)
1. …

## Notable quotes (anonymised, translated if needed)
- "…"

## Hypotheses
| H | Result | Evidence |
|---|--------|----------|
| H1 | ✅/❌/❓ | … |

## Configuration data observed (for O7)
- Characteristics, defect codes, severities, sampling used: …

## Documents obtained
- …

## Pilot interest
- Design partner: yes / maybe / no · Letter of intent: yes / no · Referrals: …

## Requirement impact
- New / changed backlog cards: …
```
