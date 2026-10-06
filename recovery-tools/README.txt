How the Oct 6 restoration was rebuilt (no AI calls, no writes to any database).

1. db-dump-readonly.ts — run from caseforge/apps/api (it reads apps/api/.env): read-only Prisma reads of the two
   fictional cases INV-2026-0096 and INV-2026-0105 (thread messages, action cards, artifacts, plan data). Output:
   ../violet-landing-backups/db-dumps/{0096,0105}.json
2. render-summaries.test.tsx and render-report.test.tsx — copy into caseforge apps/web/src of an origin/main
   checkout (a worktree works) and run `npx vitest run <file>`. They render the app's own SummaryCard,
   AnnotatedReportView and flag card offline (jsdom, API mocked from the dump) and write rendered-*.json,
   summary-cites.json, report-corpus.json into ../violet-landing-backups.
3. build-citation-modules.py — turns those into sandbox/captured-summaries.js, captured-citations.js,
   report-citations.js, captured-review.js and the report in real-artifacts.js.
Plan, scope card and Priya reply were rebuilt with one-off scripts described in the git log (commits 4098c01, 6bb84ad).
