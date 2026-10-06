// @vitest-environment jsdom
// THROWAWAY (website demo recovery, 2026-10-06): render the filed guided report 756439ba offline, exactly as the
// embedded Violet report review renders it (GuidedReport.tsx), from a saved read-only dump. No network, no DB.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { readFileSync, writeFileSync } from "fs";
import { it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AnnotatedReportView } from "@/components/case-detail/AnnotatedReportView";
import { FlagSentenceEditor } from "@/components/case-detail/FlagSentenceEditor";
import { displayCitationsFor } from "@/components/case-detail/GuidedCitationReview";
import { reviewDocument, toFlagAnnotations, REVIEW_BODY_CLASS } from "@/lib/guidedReviewMode";
import { partitionFlags } from "@/lib/guidedFlagDismissal";
import { faithfulnessLine } from "@/lib/guidedVerificationView";
import { guidedQuoteFlags, guidedAttributionFlags } from "@/lib/guidedQuoteFlags";
import { flagDetail, flagNextStep, quotedInRationale } from "@/lib/guidedFlagDetail";
import { flagVerdictLabel } from "@/lib/guidedFlagVerdict";
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<object>()), }));
const B = "/Users/ninaeisenberg/Documents/Codex/violet-landing-backups";
const dump = JSON.parse(readFileSync(`${B}/db-dumps/0096.json`, "utf8"));
const art = (p: string) => dump.artifacts.find((a: { id: string }) => a.id.startsWith(p));
it("renders the report", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const sections = JSON.parse(art("3548533f").content).sections;
  const content: string = art("756439ba").content;
  const O = "<!--guided-verification:"; const s = content.lastIndexOf(O);
  const run = JSON.parse(content.slice(s + O.length, content.indexOf("-->", s)));
  const side = JSON.parse(art("4d6065d7").content);
  const claimCitations = side.citations, corpus = side.sourceCorpus, contradictions = side.contradictions ?? [];
  const flagged = (faithfulnessLine(run) as { flagged?: unknown[] } | null)?.flagged ?? [];
  const live = partitionFlags([...flagged, ...guidedQuoteFlags(undefined, sections), ...guidedAttributionFlags(sections)] as never, []).live;
  const flags = toFlagAnnotations(live, claimCitations, corpus);
  const citations = displayCitationsFor(sections, claimCitations, corpus)
    .map((c) => ({ quote: c.sourceQuote || "", anchorText: c.claimText, sourceId: c.sourceId, lineStart: c.lineStart, lineEnd: c.lineEnd }));
  const el = document.createElement("div"); document.body.append(el);
  const root = createRoot(el);
  await act(async () => root.render(<MemoryRouter><AnnotatedReportView className={REVIEW_BODY_CLASS} content={reviewDocument(sections)} caseId={dump.case.id}
    flagAnnotations={flags.length ? flags : undefined} highlightOnly onFlagHighlightsChange={() => {}} selectedFlagIndex={-1} onFlagSelect={() => {}} suppressPopover
    citations={citations} onCitationClick={() => {}} suppressPlacementNotice /></MemoryRouter>));
  await act(async () => { await new Promise((r) => setTimeout(r, 800)); });
  const reportHtml = el.innerHTML;
  const marks = [...el.querySelectorAll("mark[data-flag-mark]")].map((m) => ({ idx: m.getAttribute("data-flag-mark"), text: m.textContent }));
  // The flag card exactly as GuidedReport renders it with `embedded` set.
  const cards: string[] = [];
  for (const f of live as never[]) {
    const d = flagDetail(f, claimCitations, corpus, contradictions);
    const host = document.createElement("div"); document.body.append(host); const r = createRoot(host);
    const body = sections.find((x: { id: string }) => x.id === (f as { sectionId?: string }).sectionId)?.body;
    await act(async () => r.render(
      <div className="cf-flag-card rounded-xl border border-border bg-card p-3">
        <p><span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${d.verdict === "UNCITED" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"}`}>{flagVerdictLabel(d.verdict)}</span></p>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground">{d.rationale}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{flagNextStep(d.kind, !!d.proposed)}</p>
        {d.kind === "contradiction" && d.proposed && (
          <div className="mt-1.5 rounded border-l-2 border-emerald-300 bg-white/70 px-2 py-1">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Suggested wording</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-foreground">{d.proposed}</p>
          </div>)}
        {d.sourceQuote && !quotedInRationale(d.rationale, d.sourceQuote) && (
          <div className="mt-1.5 rounded border-l-2 border-red-300 bg-white/70 px-2 py-1">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Checked against</p>
            <p className="mt-0.5 text-[10px] italic leading-relaxed text-muted-foreground">&ldquo;{d.sourceQuote}&rdquo;</p>
          </div>)}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <FlagSentenceEditor body={body} claim={d.claimText} shortened={d.claimTruncated} disabled={false} saveError={null} onSave={async () => false} />
          <button type="button" className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40">Remove the sentence</button>
          <button type="button" title="Records that you reviewed it and takes it off the open count" className="rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent">It&apos;s fine as is</button>
        </div>
      </div>));
    cards.push(host.innerHTML); act(() => r.unmount()); host.remove();
  }
  writeFileSync(`${B}/rendered-report.json`, JSON.stringify({ reportHtml, marks, cards, live, citations, corpusLabels: Object.fromEntries(Object.entries(corpus).map(([k, v]) => [k, (v as { label: string }).label])) }));
  writeFileSync(`${B}/report-corpus.json`, JSON.stringify(corpus));
  act(() => root.unmount());
}, 60000);
