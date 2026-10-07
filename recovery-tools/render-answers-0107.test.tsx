// @vitest-environment jsdom
// THROWAWAY (website demo, 2026-10-06): render recaptured Ask Violet answers with the app's CitedAnswer. Offline.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { readFileSync, writeFileSync } from "fs";
import { it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CitedAnswer } from "@/components/ask-violet/CitedAnswer";
const B = "/Users/ninaeisenberg/Documents/Codex/violet-landing-backups";
const d0107 = JSON.parse(readFileSync(`${B}/db-dumps/0107.json`, "utf8")); const r = { threads: [{ messages: d0107.threads[0].messages.filter((m: { createdAt: string }) => m.createdAt >= "2026-10-07T16:18:40") }] };
it("renders answers", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const out: { question: string; html: string; text: string; content: string; citations: unknown; sourceCorpus: unknown; blocks: unknown; at: string }[] = [];
  const ms = r.threads[0].messages;
  for (let i = 0; i < ms.length; i++) {
    if (ms[i].author !== "user") continue;
    const reply = ms.slice(i + 1).find((m: { author: string }) => m.author === "violet");
    const meta = JSON.parse(reply?.meta || "{}");
    const block = (meta.blocks || []).find((b: { kind: string }) => b.kind === "answer");
    let html = "", text = reply?.text || "";
    if (block) {
      const el = document.createElement("div"); document.body.append(el); const root = createRoot(el);
      await act(async () => root.render(<MemoryRouter><CitedAnswer content={block.answer.content} sourced={block.answer} /></MemoryRouter>));
      html = el.innerHTML; act(() => root.unmount()); el.remove();
    }
    out.push({ question: ms[i].text, html, text, content: block?.answer.content ?? "", citations: block?.answer.citations ?? [], sourceCorpus: block?.answer.sourceCorpus ?? {}, blocks: meta.blocks, at: reply?.createdAt });
  }
  writeFileSync(`${B}/rendered-answers-0107.json`, JSON.stringify(out));
}, 60000);
