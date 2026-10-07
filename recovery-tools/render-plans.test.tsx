// @vitest-environment jsdom
// THROWAWAY (website demo, 2026-10-06): render the app's PlanCard offline from saved case data. No network.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { readFileSync, writeFileSync } from "fs";
import { it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const B = "/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/db-dumps";
let current: Record<string, unknown> = {};
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<object>()), getCase: vi.fn(async () => ({ data: current })), updateCase: vi.fn(), caseBaselineFor: vi.fn(async () => ({ data: null })) }));
import { PlanCard } from "@/components/violet/PlanCard";
it("renders plans", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const out: Record<string, string> = {};
  for (const [ref, mode, which] of [["0105", "policy", "planData"], ["0107", "conduct", "planData"]] as const) {
    const d = JSON.parse(readFileSync(`${B}/${ref}.json`, "utf8"));
    current = { ...d.case, planData: d.case[which], investigationMode: mode, parties: d.parties };
    const el = document.createElement("div"); document.body.append(el); const root = createRoot(el);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => root.render(<MemoryRouter><QueryClientProvider client={qc}><PlanCard caseId={d.case.id} onSay={() => {}} /></QueryClientProvider></MemoryRouter>));
    await act(async () => { await new Promise((r) => setTimeout(r, 500)); });
    out[ref] = el.querySelector(".vt-plan")?.outerHTML ?? el.innerHTML;
    act(() => root.unmount()); el.remove();
  }
  writeFileSync("/Users/ninaeisenberg/Documents/Codex/violet-landing-backups/rendered-plans.json", JSON.stringify(out));
}, 60000);
