<!--
Title format:  <ID> <type>(<scope>): <summary>
Example:       US-021 feat(inspections): measurement entry with limit check
-->

## Trello card

<!-- Link to the card. One PR may cover part of a story; say which part. -->
Card: <!-- https://trello.com/b/RYd88pvR/mon-tableau-trello -->
ID: <!-- US-### / EN-### / RS-### / BUG-### -->
Requirements covered: <!-- SRS IDs, e.g. INSP-03, BR-04 -->

## What and why

<!-- 2–5 lines: what this PR changes and why. Screenshots for UI changes. -->

## How to test

<!-- Steps a reviewer can follow locally, or the test names that cover it. -->

## Definition of Done

<!-- Tick what applies. Leave unticked with a reason if something does not apply. -->

- [ ] Acceptance criteria on the Trello card are met
- [ ] Unit / API tests added or updated, and passing locally
- [ ] CI is green (lint, types, tests, build)
- [ ] Permissions checked by **role and site** on any new endpoint
- [ ] No hard-coded UI text — all strings in Arabic, French and English translation files
- [ ] Layout checked in **right-to-left (Arabic)** and left-to-right (French)
- [ ] No industry-specific value hard-coded (it is configuration data)
- [ ] Changes to records are written to the audit log (if the PR touches records)
- [ ] Database migration included and reversible (if the model changed)
- [ ] API schema / docs updated (if an endpoint changed)
- [ ] No secrets, real personal data or debug code committed

## Notes for the reviewer

<!-- Anything you are unsure about, follow-up cards created, known limitations. -->
