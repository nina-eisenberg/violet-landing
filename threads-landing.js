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

// The quick look ends with "Try the full case yourself": bring the case into view (the visitor asked for it).
function openCase() {
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
