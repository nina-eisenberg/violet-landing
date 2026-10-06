const workspace = document.querySelector('.tour-workspace');
const expand = document.querySelector('#expand-tour');
function setExpanded(value) {
  workspace.classList.toggle('is-expanded', value);
  document.body.classList.toggle('tour-expanded', value);
  expand.setAttribute('aria-expanded', String(value));
  expand.textContent = value ? 'Return to website ↙' : 'Expand demo ↗';
}
expand.addEventListener('click', () => setExpanded(expand.getAttribute('aria-expanded') !== 'true'));
window.addEventListener('keydown', event => { if (event.key === 'Escape') setExpanded(false); });
