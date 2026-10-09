const workspace = document.querySelector('.tour-workspace');
const expand = document.querySelector('#expand-tour');
const frame = document.querySelector('#violet-tour');
function setExpanded(value) {
  workspace.classList.toggle('is-expanded', value);
  document.body.classList.toggle('tour-expanded', value);
  expand.setAttribute('aria-expanded', String(value));
  expand.textContent = value ? 'Return to website ↙' : 'Expand ↗';
}
document.querySelector('#reset-tour').addEventListener('click', () => frame.contentWindow?.postMessage({ violet: 'reset' }, location.origin));
expand.addEventListener('click', () => setExpanded(expand.getAttribute('aria-expanded') !== 'true'));
window.addEventListener('keydown', event => { if (event.key === 'Escape') setExpanded(false); });

// PHONES OPEN THE DEMOS FULL SCREEN (Oct 8). Embedded, each demo was a scrolling box inside a scrolling page: a
// thumb scrolled the box instead of the page, and the quick look's controls sat under the pinned trial button. Under
// 700px the embedded frames are hidden (so they never load) and a card opens each demo over the page, with Close.
// An open demo keeps its place when closed and reopened; Back closes it too.
const phone = window.matchMedia('(max-width: 700px)');
// The embedded frames load only where they're shown: wider screens (and a phone turned or resized past 700px).
function loadEmbedded() { if (phone.matches) return; document.querySelectorAll('iframe[data-src]').forEach(f => { f.src = f.dataset.src; f.removeAttribute('data-src'); }); }
loadEmbedded();
phone.addEventListener('change', loadEmbedded);
const demos = {
  quicklook: { title: 'Quick look · fictional case', src: '/sandbox/quicklook.html', event: 'quicklook_open' },
  case: { title: 'Interactive case · fictional', src: '/sandbox/?embedded=1', event: 'sandbox_open', reset: true },
};
const overlays = {};
let openDemo = null;
function showDemo(name) {
  const demo = demos[name];
  let overlay = overlays[name];
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'demo-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', demo.title);
    overlay.innerHTML = `<div class="demo-overlay-bar"><span>${demo.title}</span><span class="demo-overlay-actions">${demo.reset ? '<button type="button" data-demo-reset>Start again</button>' : ''}<button type="button" data-demo-close>Close</button></span></div><iframe title="${demo.title}" src="${demo.src}"></iframe>`;
    overlay.querySelector('[data-demo-close]').addEventListener('click', () => history.state?.demo ? history.back() : hideDemo());
    overlay.querySelector('[data-demo-reset]')?.addEventListener('click', () => overlay.querySelector('iframe').contentWindow?.postMessage({ violet: 'reset' }, location.origin));
    document.body.append(overlay);
    overlays[name] = overlay;
  }
  if (openDemo && openDemo !== name) overlays[openDemo].hidden = true;
  overlay.hidden = false;
  openDemo = name;
  document.body.classList.add('demo-open');
  if (!history.state?.demo) history.pushState({ demo: name }, '');
  overlay.querySelector('[data-demo-close]').focus();
  track(demo.event);
}
function hideDemo() {
  if (!openDemo) return;
  overlays[openDemo].hidden = true;
  document.querySelector(`.demo-card[data-demo="${openDemo}"]`)?.focus();
  openDemo = null;
  document.body.classList.remove('demo-open');
}
window.addEventListener('popstate', () => hideDemo());
window.addEventListener('keydown', event => { if (event.key === 'Escape' && openDemo) history.state?.demo ? history.back() : hideDemo(); });
document.querySelectorAll('.demo-card').forEach(card => card.addEventListener('click', () => showDemo(card.dataset.demo)));

// The quick look ends with "Try the full case yourself": bring the case into view (the visitor asked for it).
function openCase() {
  if (phone.matches) { showDemo('case'); return; }
  document.querySelector('#journey').scrollIntoView({ behavior: 'smooth', block: 'start' });
  track('sandbox_open');
}
frame.addEventListener('load', () => { if (frame.src.includes('/sandbox/?')) track('sandbox_loaded'); }, { once: true });

// Engagement events. The site has no analytics yet, so nothing is sent anywhere: each event is announced as a
// `violet:track` DOM event (and pushed to window.dataLayer if a tag manager is ever added) for analytics to pick up.
const seen = new Set();
function track(name, detail = {}) {
  if (name !== 'trial_click' && seen.has(name)) return;
  seen.add(name);
  const event = { event: 'violet_' + name, ...detail };
  window.dispatchEvent(new CustomEvent('violet:track', { detail: event }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(event);
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || !event.data || typeof event.data.violet !== 'string') return;
  if (event.data.violet === 'open-sandbox') { openCase(); return; }
  track(event.data.violet);
});
document.querySelectorAll('a[href*="/start/solo"]').forEach(a => a.addEventListener('click', () => track('trial_click', { from: a.closest('section')?.id || 'page' })));
