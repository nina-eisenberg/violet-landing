import "dotenv/config"; import { prisma } from "../src/lib/prisma"; import { writeFileSync } from "fs";
// READ-ONLY: find the conduct-based Mock 7 run (fad3808b…) and measure Ask Violet cost on 0096. No writes.
const OUT = "/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/db-dumps";
(async () => {
  const cs = await prisma.case.findMany({ where: { id: { startsWith: "fad3808b" } }, select: { id: true, caseNumber: true, title: true, investigationMode: true, organizationId: true, planData: true, createdAt: true } });
  console.log("conduct cases:", cs.map((c) => [c.id, c.caseNumber, c.title, c.investigationMode, c.createdAt.toISOString().slice(0, 10)]));
  for (const c of cs) {
    const artifacts = await prisma.aiArtifact.findMany({ where: { caseId: c.id }, orderBy: { createdAt: "asc" } });
    const threads = await prisma.violetThread.findMany({ where: { caseId: c.id }, include: { messages: { orderBy: { createdAt: "asc" } }, actions: true } });
    const parties = await prisma.caseParty.findMany({ where: { caseId: c.id }, select: { id: true, name: true, role: true } });
    writeFileSync(`${OUT}/conduct-${c.id.slice(0, 8)}.json`, JSON.stringify({ case: c, parties, threads, artifacts }, null, 1));
    console.log(" artifacts:", artifacts.map((a) => a.type).join(", "), "| thread msgs", threads.reduce((n, t) => n + t.messages.length, 0));
  }
  const rows = await prisma.apiCallLog.findMany({ where: { caseId: "d7ba1c75-f559-4d7d-afe7-198b8c9e3110", timestamp: { gte: new Date("2026-10-06T02:15:00Z"), lte: new Date("2026-10-06T02:30:00Z") } }, select: { timestamp: true, callSite: true, model: true, inputTokens: true, outputTokens: true, cachedInputTokens: true, cacheCreationTokens: true } });
  writeFileSync(`${OUT}/askviolet-cost-sample.json`, JSON.stringify(rows, null, 1));
  console.log("cost rows", rows.length);
  await prisma.$disconnect();
})();
