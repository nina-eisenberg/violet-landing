"""Build sandbox/conduct-path.js and sandbox/scope-review.js from saved records (Oct 7 2026).

conduct-path.js
  initialPlan   INV-2026-0107 (created Oct 7 from the complaint + policy, conduct-based): the app's PlanCard rendered
                offline from its saved plan (validated: the same render of 0105 equals the surviving live capture).
  allegations / findings / evidenceReview / report / reportCitations
                INV-2026-0076 (Sept 24, conduct-based, built from all eight files at once): saved determinations,
                Violet's per-allegation evidence review, and the filed report rendered by AnnotatedReportView.
scope-review.js
  INV-2026-0105: Violet's real answer to "Does Leah's interview raise anything outside the current investigation
  plan?" and the follow-up exchange, rendered by the app's CitedAnswer.
"""
import json, re, html
from pathlib import Path
B = Path(__file__).resolve().parents[2] / 'violet-landing-backups'; S = Path(__file__).resolve().parents[1] / 'sandbox'
E = lambda s: html.escape(s, quote=False)
label = lambda s: re.sub(r'\s*\[[0-9a-f]{8,16}\]\s*$', '', s or '', flags=re.I).strip()
def dock(srcd, sid, s0, e0=None, quote=''):
    e0 = e0 or s0; lines = srcd['lines']; meta = f"{sid} · " + (f"lines {s0}–{e0}" if e0 > s0 else f"line {s0}") + f" of {len(lines)}"; rows = []
    for i, l in enumerate(lines):
        n = i + 1; on = s0 <= n <= e0
        if not l.strip() and not on and i > 0 and not lines[i - 1].strip(): continue
        rows.append(f'<div class="vt-src-line{" is-on" if on else ""}{"" if l.strip() else " is-blank"}"><span class="vt-src-n" aria-hidden="true">{n if l.strip() else ""}</span><span class="vt-src-t">{E(l)}</span></div>')
    foot = f'<footer class="vt-dock-foot"><span class="vt-eyebrow">Cited</span> “{E(quote)}”</footer>' if quote else ''
    return {'title': label(srcd['label']), 'html': f'<div class="vt-dock-meta">{E(meta)}</div><div class="vt-src">{"".join(rows)}</div>{foot}'}
def inner(h, cls):
    m = re.search(r'<div class="' + cls + r'[^"]*">', h); start = m.start(); depth = 0
    for t in re.finditer(r'<(/?)div\b[^>]*>', h[start:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: return h[start:start + t.end()]
KEYS = [('Leah Goldberg', 'leah'), ('Marcus Doyle', 'marcus'), ('Jordan Kim', 'jordan'), ('Carla Rivera', 'carla'), ('01_Complaint', 'complaint'),
        ('07_Exhibit', 'records'), ('06_Exhibit', 'emails'), ('08_Religious', 'policy'), ('Religious Accommodation', 'policy'),
        ('Anti-Harassment', 'harassment-policy'), ('Anti-Retaliation', 'retaliation-policy')]
def answer_html(a):
    prose = inner(a['html'], 'prose-violet')
    def cite(mm):
        tag = mm.group(); lab = html.unescape(re.search(r'aria-label="Source \d+: ([^"]+)"', tag)[1]); num = re.sub('<[^>]+>', '', tag)
        key = next((k for tok, k in KEYS if tok in lab), 'record'); al = html.escape('Source ' + num + ': ' + lab, quote=True)
        return f'<button type="button" class="source-number" data-cite="{key}" aria-label="{al}" title="{al}">{num}</button>'
    prose = re.sub(r'<button\b[^>]*class="av-cite"[^>]*>.*?</button>', cite, prose, flags=re.S)
    prose = re.sub(r'<a\b[^>]*href="#flag-\d+"[^>]*>(.*?)</a>', r'<span class="uncited-flag" title="Violet marked this: \1">no source cited</span>', prose, flags=re.S)
    prose = re.sub(r' class="(?!source-number|uncited-flag)[^"]*"', '', prose)
    return prose, [b['text'] for b in (a['blocks'] or []) if b.get('kind') == 'text' and b.get('text')]

# Policy path: scope review answer + docks into capturedCitations
A5 = json.loads((B / 'rendered-answers-0105.json').read_text())
review, follow = answer_html(A5[0])
cm = S / 'captured-citations.js'; ctext = cm.read_text()
cc = json.loads(re.search(r'export const capturedCitations=(\{.*?\});\nexport const summaryCitations=', ctext, re.S)[1]); added = 0
for a in A5:
    for c in a['citations']:
        srcd = a['sourceCorpus'].get(c['sourceId'])
        if not srcd: continue
        s0, e0 = c['lineStart'], c.get('lineEnd') or c['lineStart']
        key = label(srcd['label']) + (f", lines {s0}–{e0}" if e0 > s0 else f", line {s0}")
        if key not in cc: cc[key] = dock(srcd, c['sourceId'], s0, e0); added += 1
cm.write_text(re.sub(r'export const capturedCitations=\{.*?\};\nexport const summaryCitations=', lambda _: 'export const capturedCitations=' + json.dumps(cc, ensure_ascii=False) + ';\nexport const summaryCitations=', ctext, flags=re.S))
(S / 'scope-review.js').write_text('// INV-2026-0105, Oct 6 2026 04:00 UTC: Violet\'s real answer to the investigator\'s open question about Leah\'s interview,\n// rendered by the app\'s CitedAnswer from the saved message. See recovery-tools/build-path-modules.py.\n'
  'export const scopeReview=' + json.dumps({'question': A5[0]['question'].replace('’', "'"), 'html': review, 'followup': follow,
   'savedReply': "Added allegation 4. The plan was already final, so this is a change to the final plan. Carla and Jordan and Marcus's outlines don't cover it yet."}, ensure_ascii=False) + ';\n')

# Conduct path
plans = json.loads((B / 'rendered-plans.json').read_text())
d76 = json.loads((B / 'db-dumps' / 'conduct-fad3808b.json').read_text())
det = json.loads([a for a in d76['artifacts'] if a['type'] == 'guided-report-determinations'][-1]['content'])
pa = det['evidenceReview']['assessment']['perAllegation']
rows = []
for i, sc in enumerate(det['reportScope']):
    ev = next(v for k, v in pa.items() if k.startswith(sc['id'] + ':'))
    rows.append({'id': sc['id'], 'n': i + 1, 'text': sc['text'], 'recorded': det['determinations'].get('verdict:' + sc['id']),
                 'recommended': ev['recommendedFinding'], 'confidence': ev['confidence'], 'keyFactors': ev['keyFactors'],
                 'counterFactors': ev.get('counterFactors') or [], 'limitations': ev.get('limitations') or []})
RR = json.loads((B / 'rendered-report-conduct.json').read_text()); corpus = json.loads((B / 'report-corpus-conduct.json').read_text())
rc = {str(i + 1): dock(corpus[c['sourceId']], c['sourceId'], c['lineStart'], c.get('lineEnd'), c.get('quote') or '') for i, c in enumerate(RR['citations']) if c['sourceId'] in corpus}
p0107 = json.loads((B / 'db-dumps' / '0107.json').read_text()); plan0107 = json.loads(p0107['case']['planData'])
(S / 'conduct-path.js').write_text('// Conduct-based path. See recovery-tools/build-path-modules.py for provenance.\n'
  'export const conductPath=' + json.dumps({'initialPlan': plans['0107'], 'planAllegations': [q['text'] for g in plan0107['allegations'] for q in g['scopeQuestions']],
   'findings': rows, 'overallNote': det['evidenceReview']['assessment'].get('overallNote'), 'report': inner(RR['reportHtml'], 'prose-violet'), 'reportCitations': rc,
   'source': {'plan': 'INV-2026-0107 · created Oct 7 2026 from the complaint and HR-114 · conduct-based', 'report': 'INV-2026-0076 · Sept 24 2026 · conduct-based run of the same fictional case from all eight files'}}, ensure_ascii=False) + ';\n')
print('scope docks added', added, '| conduct findings', len(rows), '| conduct report cites', len(rc), '| plan allegations', len(plan0107['allegations']))
