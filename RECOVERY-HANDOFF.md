# Violet website/demo recovery handoff — October 6, 2026

> **Update, Oct 6 evening — restoration tasks 1–10 below are done.** 29/29 tests pass, the build passes, and the
> full journey was walked in the browser. What was rebuilt, from which saved records, and the remaining
> deviations are in `sandbox/FIDELITY-AUDIT.txt`; how to reproduce is in `recovery-tools/README.txt`. Backups
> (git bundles and the read-only case dumps) are in `../violet-landing-backups/`. The text below is the original
> handoff, kept for history.

## Open the recovered work

- Website: http://127.0.0.1:4190/
- Interactive case: http://127.0.0.1:4190/sandbox/
- Permanent project: /Users/ninaeisenberg/Documents/Codex/violet-landing-recovered
- Start preview: `./start-preview.sh` from that project. It serves `dist` on localhost only.
- Build: `npm run build` (dependencies currently linked to the existing original landing repo's node_modules).
- Run existing checks: `node --test sandbox/*.test.js`.

## What happened

The latest prototype lived only in /private/tmp/violet-landing-rebuild. That folder disappeared; the localhost server therefore stopped. The late interactive sandbox/fidelity commits were not on the remote branch. An earlier website and narrated linear demo WERE pushed: codex/threads-homepage, a80f463. Recovery cloned that branch into the permanent folder above and replayed local file-edit instructions from the saved Codex session. The original repo at /Users/ninaeisenberg/Desktop/violet-landing was not changed.

This is a partial recovery of the latest prototype, not a fully verified replacement. Do not cite the old FIDELITY-AUDIT.txt completion claims as current evidence. It describes work before the temporary folder was lost.

## Recovered

- Landing page, hero typography/layout and mascot, pricing and FAQ; latest hero simplification and upper-right note spacing edits recovered from editing history.
- Interactive intake, mock drag-file trays, case stages, four people, seven finding choices, report workspace, source panel and return-navigation code.
- All original mock source files used for complaint/policy/interviews/exhibits, copied into complaint.js and materials.js.
- 20 complete real Violet response bodies recaptured from the saved INV-2026-0096 conversation, including the real client update and redraft. No new AI calls were made during recovery.
- All four original interview outlines recovered from saved INV-2026-0105 Outline tabs (created before transcripts).
- Four current stored bullet summaries recovered from INV-2026-0096. Narrative versions still need recovery.
- Full eight-section report and full three-policy confidence assessment recovered from INV-2026-0096.
- Expanded four-allegation plan, scope response and caveat recovered from INV-2026-0105.
- Earlier narrated linear demo and its recorded audio survive under demo/.
- Usability/joy recommendations: sandbox/USABILITY-AND-JOY.txt, recovered from the original editing history.

## Validation performed during recovery

- `npm run build` PASS after restoring sandbox copying in finish-build.mjs.
- Importing case-journey.js and its dependency graph PASS.
- Existing tests: 16 PASS, 13 FAIL. Exact output is recovery-validation-tests.txt. These failures matter: missing captures, incomplete chronological transformations, stage compatibility, and original-vs-recovered equality. Do not weaken/delete tests to make recovery look complete.
- Browser smoke check: website renders hero/mascot/pricing/FAQ and embedded demo; Use sample complaint can be clicked. One MutationObserver console error was observed in the in-app browser and is not yet diagnosed. Full journey has not been walked during recovery.
- Preview runs in active terminal session 65439. Restart with ./start-preview.sh if the session stops; the permanent files remain.

## Remaining restoration tasks, in priority order

1. Restore exact initial three-allegation plan. initial-plan.js currently assigns the surviving expanded four-allegation plan to both exports, marked RECOVERY. Do not present that as the original initial capture. The genuine initial capture was generated in INV-2026-0105, then the Anti-Discrimination group removed; expansion later added retaliation. Search session outputs for initial-plan markup before recreating anything.
2. Restore the original scope proposal card (Save/Keep), six excerpt docks and source wiring. captured-scope.js preserves the real response/caveat but card and sources are empty. The original editing instructions are recovered; sources are not. Scope currently must not be represented as fully working.
3. Restore all narrative summary HTML, their mode buttons and citation mapping. The live app has changed: current Details > Summary no longer exposed the old Quick bullets/Narrative radios during recovery. Use saved logs/captures first; do not generate new variants casually.
4. Restore exact citation excerpt modules: captured-citations.js, report-citations.js and summary-citation-map.js currently export empty objects. Full source records and older artifacts.citations still survive, but exact later excerpt docks do not. Source panel Close/Escape code survives.
5. Restore captured-review.js original flag card and flagged sentence. It is empty during recovery. Current saved report says No open flags, so the original checked flag must be recovered from log/surviving captures. Report rendering has an empty-string guard to avoid crashing meanwhile.
6. Restore captured Priya-add response and proposal. This is the only one of the 20 standard QA routes without a recaptured verified body (20 recovered bodies includes redraft). Avoid an authored stand-in.
7. Reapply response/stage compatibility and question-suggestion history filtering precisely. Some original patches failed because data files were missing during chronological replay. In particular, captured client response now comes from a completed case; ensure the early-stage update uses the actual early-stage captured body and doesn't imply completion.
8. Compare journey-state against the original 7-finding guard version and fix failed state/routing tests. Keep full case gates and no dead ends.
9. Re-run 29 existing tests, build, and visually walk intake -> plan -> all four interviews -> scope -> evidence -> findings -> confidence -> full report -> redraft -> reviews -> final. Verify every detour returns to the journey and completed suggestions aren't repeated.
10. Replace the stale FIDELITY-AUDIT.txt with a current honest audit. The recovered code does not imply recovered fidelity verification.

## User's requirements

Keep original 'Violet drafts. You decide.' typography/spacing/animation, adorable mascot, pricing and FAQ. Communicate 'just talk to Violet' in the right-side text. Demo must reproduce real Violet content and flow, not generic chat responses. Provide a mock file tray at every upload. Use Mock Case 7, real names Leah Goldberg, Marcus Doyle, Jordan Kim, Carla Rivera. Suggest the user's standard QA questions throughout, with cited record answers, honest gaps, credibility factors rather than deciding credibility, substantive plan/outlines, bullet/narrative summaries, full report, flag/citation docks and investigator redraft with Keep/Undo. Visitor AI calls should stay disabled; prefer prepared replies and keep costs under $3. No deployment requested.

## Recovery evidence and tools

Permanent evidence folder:
/Users/ninaeisenberg/.codex/visualizations/2026/10/04/01a10453-33be-7662-b7e2-94c80158be68/recovery

- commands/: 71 extracted chronological shell-edit steps (2695..7390).
- outputs/: text-only tool outputs through the prior final spacing edit. Output 6990 contains the full near-final case-journey.js.
- replay.py: guarded chronological local-write replay; many failure points listed in replay-log.json. DO NOT rerun over the current recovered project blindly: it rebuilds older intermediate content and can overwrite recaptured modules.
- assemble.py: partial assembly/reconnection. DO NOT rerun blindly for the same reason.
- scratch/recovered-live-responses.json: full saved 0096 replies, indexed.
- scratch/fresh-responses.json: saved 0105 scope conversation.
- scratch/violet-live-artifacts.json: full saved eight-section report.
- scratch/recovered-scope.json: actual scope response/caveat.
- site/: staging recovery mirror; permanent project is the handoff target.

Primary full session log:
/Users/ninaeisenberg/.codex/sessions/2026/10/03/rollout-2026-10-03T17-32-04-01a10453-33be-7662-b7e2-94c80158be68.jsonl
Limit historical extraction to lines before 7440 to avoid recursively extracting recovery work. Parse response_item tool calls/outputs. Raw session/tool-writes may contain old credential-related commands; do not publish or replay indiscriminately. Never send logs to third-party services.

Surviving original early captures/assets:
/Users/ninaeisenberg/Documents/Codex/caseforge/outputs/violet-homepage-mockup

Saved live fictional cases (read existing content; no need to regenerate):
- Completed artifacts/QA: https://app.violetinvestigations.com/v/cases/d7ba1c75-f559-4d7d-afe7-198b8c9e3110 (INV-2026-0096)
- Fresh initial outlines / expanded plan / scope: https://app.violetinvestigations.com/v/cases/01148faf-d04d-49a6-ac0f-6a036c1164fd (INV-2026-0105)

Keep recovered work permanently and make a Git commit/backup before further iteration. Do not place the only copy in /tmp again.
