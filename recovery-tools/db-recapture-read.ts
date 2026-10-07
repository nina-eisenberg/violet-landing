import "dotenv/config"; import { prisma } from "../src/lib/prisma"; import { writeFileSync } from "fs";
// READ-ONLY: 0096 thread after the Oct 6 recapture + spend since it began. No writes.
const caseId = "d7ba1c75-f559-4d7d-afe7-198b8c9e3110"; const since = new Date(process.argv[2] || "2026-10-06T21:00:00Z");
(async () => {
  const threads = await prisma.violetThread.findMany({ where: { caseId }, include: { messages: { where: { createdAt: { gte: since } }, orderBy: { createdAt: "asc" } }, actions: { where: { createdAt: { gte: since } } } } });
  const calls = await prisma.apiCallLog.findMany({ where: { caseId, timestamp: { gte: since } }, select: { model: true, callSite: true, inputTokens: true, outputTokens: true, cachedInputTokens: true, cacheCreationTokens: true, timestamp: true } });
  writeFileSync("/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/db-dumps/0096-recapture.json", JSON.stringify({ since, threads, calls }, null, 1));
  console.log("msgs", threads.reduce((n, t) => n + t.messages.length, 0), "calls", calls.length);
  await prisma.$disconnect();
})();
