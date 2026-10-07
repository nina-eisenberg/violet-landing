"""Replace the demo's prepared answers with the Oct 7 2026 (UTC) recapture from current production Violet.

Input: ../violet-landing-backups/rendered-answers.json — each reply rendered by the app's CitedAnswer (origin/main)
from the saved VioletMessage, plus its citations/sourceCorpus. Questions were asked verbatim as the demo shows them.
"""
import json, re, html
from pathlib import Path
B = Path(__file__).resolve().parents[2] / 'violet-landing-backups'; S = Path(__file__).resolve().parents[1] / 'sandbox'
A = json.loads((B / 'rendered-answers.json').read_text())
IDS = {"What would a credibility": 'credibility', "When did Doyle first learn": 'knowledge', "Who else was at the Sept 9": 'huddle',
       "Was Doyle's Sept 14": 'deadline', "Did anyone besides Kim": 'hearers', "Is Kevin Tran": 'tran', "Where do Doyle's and Rivera's": 'list',
       "Does anything in the documents": 'contradictions', "Goldberg says two dollars": 'pay', "Is Goldberg's account consistent": 'consistency',
       "I think retaliation": 'retaliation', "What's the strongest argument": 'harassment', "What evidence am I missing": 'gaps',
       "Write me follow-up questions": 'followup', "Draft an email to Doyle": 'email', "Draft the finding for allegation 3": 'finding3',
       "Write the executive summary": 'executive', "Reword allegation 5": 'reword5', "Redraft the religious-remarks": 'redraft'}
KEYS = [('Leah Goldberg', 'leah'), ('Marcus Doyle', 'marcus'), ('Jordan Kim', 'jordan'), ('Carla Rivera', 'carla'), ('01_Complaint', 'complaint'),
        ('07_Exhibit', 'records'), ('06_Exhibit', 'emails'), ('08_Religious', 'policy'), ('Religious Accommodation', 'policy'),
        ('Anti-Harassment', 'harassment-policy'), ('Anti-Retaliation', 'retaliation-policy')]
E = lambda s: html.escape(s, quote=False)
p = S / 'captured-responses.js'; head, body = p.read_text().split('export const capturedResponses=', 1)
resp = json.loads(body.rstrip().rstrip(';'))
src = json.loads((S / 'response-source-text.json').read_text())
clean = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s).replace('&#x27;', "'"))).strip()
done = []
for a in A:
    rid = next((v for k, v in IDS.items() if a['question'].startswith(k)), None)
    if not rid or not a['html']: continue
    m = re.search(r'<div class="prose-violet[^"]*">', a['html']); h = a['html']
    start = m.start(); depth = 0
    for t in re.finditer(r'<(/?)div\b[^>]*>', h[start:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: end = start + t.end(); break
    prose = h[start:end]
    requires = set()
    def cite(mm):
        tag = mm.group(); lab = html.unescape(re.search(r'aria-label="Source \d+: ([^"]+)"', tag)[1])
        key = next((k for tok, k in KEYS if tok in lab), 'record')
        if key not in ('complaint', 'harassment-policy', 'retaliation-policy', 'record'): requires.add(key)
        num = re.sub('<[^>]+>', '', tag)
        al = html.escape('Source ' + num + ': ' + lab, quote=True)
        return f'<button type="button" class="source-number" data-cite="{key}" aria-label="{al}" title="{al}">{num}</button>'
    prose = re.sub(r'<button\b[^>]*class="av-cite"[^>]*>.*?</button>', cite, prose, flags=re.S)
    prose = re.sub(r' class="(?!source-number)[^"]*"', '', prose)
    # Violet's own one-line follow-up after the answer (a "text" block) is part of the reply.
    tail = ''.join(f'<p class="violet-followup">{E(b["text"])}</p>' for b in (a['blocks'] or []) if b.get('kind') == 'text' and b.get('text'))
    full = prose + tail
    if rid == 'email': full = full.replace('Nina Eisenberg', '[Investigator name]')
    old = resp.get(rid, {})
    resp[rid] = {**old, 'html': full, 'text': clean(full), 'requires': sorted(requires | set(old.get('requires', []))) if rid in ('priya',) else sorted(requires),
                 'source': 'Marcus Doyle INV-2026-0096 · live Violet conversation · ' + a['at'][:16].replace('T', ' ') + ' UTC (current production, asked verbatim)',
                 'captureNote': 'Full captured answer.' + (' Investigator signature replaced with a placeholder.' if rid == 'email' else ''),
                 'stage': old.get('stage', 'record-review')}
    src[rid] = clean(full); done.append(rid)
p.write_text(head + 'export const capturedResponses=' + json.dumps(resp, ensure_ascii=False, indent=2) + ';\n')
(S / 'response-source-text.json').write_text(json.dumps(src, ensure_ascii=False, indent=1))
# Citation docks for the new answers, keyed by label as before.
cm = S / 'captured-citations.js'; ctext = cm.read_text()
cc = json.loads(re.search(r'export const capturedCitations=(\{.*?\});\nexport const summaryCitations=', ctext, re.S)[1])
label = lambda s: re.sub(r'\s*\[[0-9a-f]{8,16}\]\s*$', '', s or '', flags=re.I).strip()
def dock(srcd, sid, s0, e0):
    lines = srcd['lines']; meta = f"{sid} · " + (f"lines {s0}–{e0}" if e0 > s0 else f"line {s0}") + f" of {len(lines)}"; rows = []
    for i, l in enumerate(lines):
        n = i + 1; on = s0 <= n <= e0
        if not l.strip() and not on and i > 0 and not lines[i - 1].strip(): continue
        rows.append(f'<div class="vt-src-line{" is-on" if on else ""}{"" if l.strip() else " is-blank"}"><span class="vt-src-n" aria-hidden="true">{n if l.strip() else ""}</span><span class="vt-src-t">{E(l)}</span></div>')
    return {'title': label(srcd['label']), 'html': f'<div class="vt-dock-meta">{E(meta)}</div><div class="vt-src">{"".join(rows)}</div>'}
added = 0
for a in A:
    for c in a['citations']:
        srcd = a['sourceCorpus'].get(c['sourceId'])
        if not srcd: continue
        s0, e0 = c['lineStart'], c.get('lineEnd') or c['lineStart']
        key = label(srcd['label']) + (f", lines {s0}–{e0}" if e0 > s0 else f", line {s0}")
        if key not in cc: cc[key] = dock(srcd, c['sourceId'], s0, e0); added += 1
cm.write_text(re.sub(r'export const capturedCitations=\{.*?\};\nexport const summaryCitations=', lambda _: 'export const capturedCitations=' + json.dumps(cc, ensure_ascii=False) + ';\nexport const summaryCitations=', ctext, flags=re.S))
print('replaced', len(done), sorted(done), '| new docks', added)
