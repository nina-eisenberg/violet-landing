"""Rebuild the demo's summary, report, review and Ask Violet citation modules from saved records (2026-10-06).

Inputs (outside the repo, in ../violet-landing-backups):
  db-dumps/0096.json        read-only dump of INV-2026-0096 (thread messages + artifacts)
  rendered-summaries.json   the app's own SummaryCard rendered offline (origin/main, jsdom) from that dump
  summary-cites.json        summaryCitations(sidecar) + sourceCorpus for each rendered summary
  rendered-report.json      the app's AnnotatedReportView + flag card for filed report 756439ba
  report-corpus.json        that report's citation sidecar sourceCorpus
Docks are rendered the way SourcePanel.tsx renders a cited source.
"""
import json, re, html
from pathlib import Path
B = Path(__file__).resolve().parents[2] / 'violet-landing-backups'
S = Path(__file__).resolve().parents[1] / 'sandbox'
E = lambda s: html.escape(s, quote=False)
label = lambda s: re.sub(r'\s*\[[0-9a-f]{8,16}\]\s*$', '', s or '', flags=re.I).strip()

def dock(src, sid, start, end=None, quote=''):
    lines = src['lines']; end = end or start
    meta = f"{sid} · " + (f"lines {start}–{end}" if end > start else f"line {start}") + f" of {len(lines)}"
    rows = []
    for i, l in enumerate(lines):
        n = i + 1; on = start <= n <= end
        if not l.strip() and not on and i > 0 and not lines[i - 1].strip(): continue
        rows.append(f'<div class="vt-src-line{" is-on" if on else ""}{"" if l.strip() else " is-blank"}"><span class="vt-src-n" aria-hidden="true">{n if l.strip() else ""}</span><span class="vt-src-t">{E(l)}</span></div>')
    foot = f'<footer class="vt-dock-foot"><span class="vt-eyebrow">Cited</span> “{E(quote)}”</footer>' if quote else ''
    return {'title': label(src['label']), 'html': f'<div class="vt-dock-meta">{E(meta)}</div><div class="vt-src">{"".join(rows)}</div>{foot}'}

# Summaries: both formats, rendered by the app; citation n opens summaryCitations[person][format-n].
R = json.loads((B / 'rendered-summaries.json').read_text()); C = json.loads((B / 'summary-cites.json').read_text())
summaries, summary_cites = {}, {}
for person, forms in R.items():
    summaries[person] = {'bullets': forms['bullets'], 'narrative': forms['narrative']}
    summary_cites[person] = {}
    for fmt in ('bullets', 'narrative'):
        x = C[person][fmt]
        for i, c in enumerate(x['citations']):
            src = x['corpus'].get(c['sourceId'])
            if src: summary_cites[person][f'{fmt}-{i + 1}'] = dock(src, c['sourceId'], c['lineStart'], c.get('lineEnd'), c.get('quote') or '')

# Report: footnote n opens reportCitations[n].
RR = json.loads((B / 'rendered-report.json').read_text()); corpus = json.loads((B / 'report-corpus.json').read_text())
report_cites = {}
for i, c in enumerate(RR['citations']):
    src = corpus.get(c['sourceId'])
    if src: report_cites[str(i + 1)] = dock(src, c['sourceId'], c['lineStart'], c.get('lineEnd'), c.get('quote') or '')
m = re.search(r'<div class="prose-violet[^"]*">', RR['reportHtml'])
start = m.start(); depth = 0; i = start
for t in re.finditer(r'<(/?)div\b[^>]*>', RR['reportHtml'][start:]):
    depth += -1 if t.group(1) else 1
    if depth == 0: end = start + t.end(); break
report_html = RR['reportHtml'][start:end]

# Ask Violet answers: keyed by the citation label the answer shows ("<source>, line(s) …").
d = json.loads((B / 'db-dumps' / '0096.json').read_text()); answer_cites = {}
for msg in d['threads'][0]['messages']:
    try: meta = json.loads(msg['meta'])
    except Exception: continue
    for b in meta.get('blocks', []):
        a = b.get('answer') or {}
        for c in a.get('citations', []):
            src = (a.get('sourceCorpus') or {}).get(c['sourceId'])
            if not src: continue
            s0, e0 = c['lineStart'], c.get('lineEnd') or c['lineStart']
            key = label(src['label']) + (f", lines {s0}–{e0}" if e0 > s0 else f", line {s0}")
            answer_cites.setdefault(key, dock(src, c['sourceId'], s0, e0))

# Review: both flagged sentences as marked in the report; the card for the first, as the embedded report shows it.
review = {'flagHtml': RR['cards'][0], 'flaggedSentences': [x['text'] for x in RR['marks']]}

hdr = '// Rebuilt 2026-10-06 by recovery-tools/build-citation-modules.py from saved INV-2026-0096 records.\n'
(S / 'captured-summaries.js').write_text(hdr + '// Both formats rendered by the app\'s own SummaryCard (origin/main) from the saved summaries and their citation sidecars.\nexport const capturedSummaries=' + json.dumps(summaries, ensure_ascii=False) + ';\n')
(S / 'captured-citations.js').write_text(hdr + 'export const capturedCitations=' + json.dumps(answer_cites, ensure_ascii=False) + ';\nexport const summaryCitations=' + json.dumps(summary_cites, ensure_ascii=False) + ';\n')
(S / 'report-citations.js').write_text(hdr + '// Footnote n of filed report 756439ba (citation sidecar 4d6065d7).\nexport const reportCitations=' + json.dumps(report_cites, ensure_ascii=False) + ';\n')
(S / 'captured-review.js').write_text(hdr + '// Filed report 756439ba: both flagged sentences, and the flag card for the first as the embedded report renders it.\nexport const capturedReview=' + json.dumps(review, ensure_ascii=False) + ';\n')
(S / 'summary-citation-map.js').write_text(hdr + '// Each format now carries its own citations (captured-citations.js summaryCitations[person]["<format>-<n>"]).\nexport const summaryCitationMap={};\n')
(S / 'rendered-report.html').write_text(report_html)
print('summaries', {k: [len(v['bullets']), len(v['narrative'])] for k, v in summaries.items()})
print('summary cites', {k: len(v) for k, v in summary_cites.items()}, 'report cites', len(report_cites), 'answer cites', len(answer_cites))
print('report html', len(report_html), 'sections', len(re.findall(r'<h2', report_html)))
