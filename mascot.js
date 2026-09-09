const mascot = document.querySelector('.violet-mascot');
if (mascot) {
  const eyes = [...mascot.querySelectorAll('.violet-pupil')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let resetTimer;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    eyes.forEach(eye => eye.removeAttribute('transform'));
  };
  const look = event => {
    // Direct input feedback stays available with reduced motion; no idle animation or easing.
    if (document.hidden) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = mascot.querySelector('svg').getBoundingClientRect();
      if (!bounds.width || bounds.bottom < 0 || bounds.top > innerHeight) return;
      const x = (event.clientX - bounds.left) * 1254 / bounds.width;
      const y = (event.clientY - bounds.top) * 1254 / bounds.height;
      eyes.forEach(eye => {
        const dx = x - Number(eye.dataset.x);
        const dy = y - Number(eye.dataset.y);
        const distance = Math.hypot(dx, dy);
        const strength = Math.min(distance / 220, 1);
        eye.setAttribute('transform', `translate(${distance ? dx / distance * 16 * strength : 0} ${distance ? dy / distance * 16 * strength : 0})`);
      });
    });
  };
  document.addEventListener('pointermove', look, { passive: true });
  document.addEventListener('pointerdown', event => {
    look(event);
    if (event.pointerType !== 'mouse') {
      clearTimeout(resetTimer);
      resetTimer = setTimeout(reset, 1200);
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  reduced.addEventListener('change', reset);
  let greetingTimer;
  mascot.addEventListener('click', () => {
    const greeting = mascot.querySelector('.violet-greeting');
    greeting.textContent = 'Hello. I’m Violet.';
    clearTimeout(greetingTimer);
    greetingTimer = setTimeout(() => { greeting.textContent = ''; }, 2500);
  });
}
