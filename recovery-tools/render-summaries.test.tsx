// @vitest-environment jsdom
// THROWAWAY (website demo recovery, 2026-10-06): render the real SummaryCard offline from a saved read-only dump.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { readFileSync, writeFileSync } from "fs";
import { it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SummaryCard } from "@/components/violet/SummaryCard";
import { sidecarFor, summaryCitations } from "@/lib/interviewSummaryView";
const dump = JSON.parse(readFileSync("/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/db-dumps/0096.json", "utf8"));
const caseId = dump.case.id;
vi.mock("@/lib/api", () => ({
  listAiArtifacts: vi.fn(async () => ({ data: dump.artifacts })),
  getCase: vi.fn(async () => ({ data: { id: caseId, parties: dump.parties } })),
  getInterviewStaleness: vi.fn(async () => ({ data: { summary: { stale: false } } })),
  createAiJob: vi.fn(), getAiJob: vi.fn(), quickRead: vi.fn(), updateArtifact: vi.fn(),
}));
const people: Record<string, string> = { leah: "Leah Goldberg", jordan: "Jordan Kim", carla: "Carla Rivera", marcus: "Marcus Doyle" };
it("renders", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const out: Record<string, Record<string, string>> = {};
  const cites: Record<string, Record<string, unknown>> = {};
  for (const [key, name] of Object.entries(people)) {
    const partyId = dump.artifacts.find((a: { type: string; title: string }) => a.type === "interview-summary" && a.title.endsWith(name)).partyId;
    out[key] = {}; cites[key] = {};
    const versions = dump.artifacts.filter((a: { type: string; partyId: string; status: string }) => a.type === "interview-summary" && a.partyId === partyId && a.status === "completed").sort((x: { createdAt: string }, y: { createdAt: string }) => y.createdAt.localeCompare(x.createdAt));
    const fmt = (a: { content: string; editedContent?: string }) => /^\s*[-*]\s/m.test(a.editedContent || a.content || "") ? "bullets" : "narrative";
    for (const format of ["narrative", "bullets"]) {
      localStorage.setItem(`violet:summary-format:${caseId}:${partyId}`, format);
      const el = document.createElement("div"); document.body.append(el);
      const root = createRoot(el);
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      await act(async () => root.render(<QueryClientProvider client={qc}><SummaryCard caseId={caseId} partyId={partyId} name={name} onSay={() => {}} /></QueryClientProvider>));
      await act(async () => { await new Promise((r) => setTimeout(r, 400)); });
      out[key][format] = el.querySelector(".vt-summary")?.outerHTML ?? "";
      const shown = versions.find((a: never) => fmt(a) === format); const side = shown ? sidecarFor(shown, dump.artifacts) : null;
      cites[key][format] = { artifactId: (shown as unknown as { id: string })?.id, citations: summaryCitations(side), corpus: side?.sourceCorpus ?? {} };
      act(() => root.unmount()); el.remove();
    }
  }
  writeFileSync("/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/rendered-summaries.json", JSON.stringify(out));
  writeFileSync("/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/summary-cites.json", JSON.stringify(cites));
}, 60000);
