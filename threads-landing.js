const workspace = document.querySelector('.tour-workspace');
const expand = document.querySelector('#expand-tour');
const frame = document.querySelector('#violet-tour');
const label = document.querySelector('#tour-label');
function setExpanded(value) {
  workspace.classList.toggle('is-expanded', value);
  document.body.classList.toggle('tour-expanded', value);
  expand.setAttribute('aria-expanded', String(value));
  expand.textContent = value ? 'Return to website ↙' : 'Expand ↗';
}
expand.addEventListener('click', () => setExpanded(expand.getAttribute('aria-expanded') !== 'true'));
window.addEventListener('keydown', event => { if (event.key === 'Escape') setExpanded(false); });

// Two ways in: the highlights tour or the full case. Switching keeps the page where it is.
function choose(name) {
  document.querySelectorAll('.tour-choice').forEach(b => {
    const on = b.dataset.name === name;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
    if (on && !frame.src.endsWith(b.dataset.src)) frame.src = b.dataset.src;
  });
  label.textContent = name === 'sandbox' ? 'Interactive case · fictional · 8 stages' : 'Highlights · fictional case';
  track(name === 'sandbox' ? 'sandbox_open' : 'highlights_open');
}
document.querySelectorAll('.tour-choice').forEach(b => b.addEventListener('click', () => choose(b.dataset.name)));

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
  if (event.data.violet === 'open-sandbox') { choose('sandbox'); return; }
  track(event.data.violet);
});
document.querySelectorAll('a[href*="/start/solo"]').forEach(a => a.addEventListener('click', () => track('trial_click', { from: a.closest('section')?.id || 'page' })));
