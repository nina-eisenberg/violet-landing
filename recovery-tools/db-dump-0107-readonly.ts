import "dotenv/config"; import { prisma } from "../src/lib/prisma"; import { writeFileSync } from "fs";
// READ-ONLY dump of two fictional demo cases for the website demo recovery. No writes.
const CASES = { "0107": "1c4544cb-1c79-41f3-a4c2-bd4cb646927a" };
const OUT = "/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/db-dumps";
(async () => {
  for (const [ref, caseId] of Object.entries(CASES)) {
    const c = await prisma.case.findUnique({ where: { id: caseId }, select: { id: true, caseNumber: true, title: true, organizationId: true, planData: true, previousPlanData: true } });
    const threads = await prisma.violetThread.findMany({ where: { caseId }, include: { messages: { orderBy: { createdAt: "asc" } }, actions: { orderBy: { createdAt: "asc" } } } });
    const artifacts = await prisma.aiArtifact.findMany({ where: { caseId }, orderBy: { createdAt: "asc" }, include: { editHistory: { orderBy: { createdAt: "asc" } } } });
    const parties = await prisma.caseParty.findMany({ where: { caseId }, select: { id: true, name: true, role: true } });
    writeFileSync(`${OUT}/${ref}.json`, JSON.stringify({ case: c, parties, threads, artifacts }, null, 1));
    console.log(ref, c?.caseNumber, "threads", threads.length, "msgs", threads.reduce((n, t) => n + t.messages.length, 0), "actions", threads.reduce((n, t) => n + t.actions.length, 0), "artifacts", artifacts.length, "history", artifacts.reduce((n, a) => n + a.editHistory.length, 0));
  }
  await prisma.$disconnect();
})();
