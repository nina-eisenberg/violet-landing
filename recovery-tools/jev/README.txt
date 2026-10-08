Typed-question routing test, Oct 7 2026. `node run.mjs cases.json` / `node run.mjs holdout.json`.
Calls Jev (typesafe-ai/jev) through the Vercel AI Gateway decision API (POST /v1/evaluate, one "choice" question),
key from caseforge/apps/api/.env. 65 questions cost about $0.003 in total.

Results (expected destination = one of the 20 prepared answers, a navigation step, or "none"):
  cases.json (38, written first):     Jev 37/38   keyword router before 26/38, after widening 36/38
  holdout.json (27, written after):   Jev 27/27   widened keyword router 21/27 before the last additions
Jev only routes; it cannot write answers. The demo keeps visitor AI calls off, so it uses the widened keyword router
plus sample answers (typed-answers.js) for common questions with no captured reply.

Oct 7: typed questions and Jev routing were removed from the demo (Nina). This folder is kept as the record of
the evaluation; typed-answers.js and api/route-question.js live in git history (before this commit).
