/* Progressive enhancement: all content and links work without JavaScript. */
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');
if (menu && navigation) {
  menu.hidden = false;
  navigation.classList.add('collapsible');
  const closeMenu = () => { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
}
if ('IntersectionObserver' in window) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        if (typeof entry.target.animate === 'function') {
          entry.target.animate([
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 750, delay: Math.min(index, 3) * 80, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' });
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-header,.about-card,.project-card,.experience-card,.contact-card,.project-section > h2').forEach(element => observer.observe(element));
  }

}
const gallery = document.querySelector('.project-gallery');
if (gallery && typeof HTMLDialogElement !== 'undefined') {
  const images = [...gallery.querySelectorAll('img')];
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Project image viewer');
  dialog.innerHTML = '<div class="viewer-toolbar"><span class="viewer-count" aria-live="polite"></span><div class="viewer-actions"><button type="button" data-action="previous" aria-label="Previous image">←</button><button type="button" data-action="next" aria-label="Next image">→</button><button type="button" data-action="close">Close ×</button></div></div><img class="viewer-image" alt=""><p class="viewer-caption"></p>';
  document.body.append(dialog);
  let current = 0;
  let imageRequest = 0;
  const show = index => {
    current = (index + images.length) % images.length;
    const source = images[current];
    const request = ++imageRequest;
    const count = `${current + 1} / ${images.length}`;
    const enlarged = dialog.querySelector('.viewer-image');
    const incoming = new Image(); incoming.src = source.src;
    const commitImage = () => {
      if (request !== imageRequest) return;
      enlarged.getAnimations?.().forEach(animation => animation.cancel());
      enlarged.src = source.src; enlarged.alt = source.alt;
      dialog.querySelector('.viewer-count').textContent = count;
      dialog.querySelector('.viewer-caption').textContent = source.alt;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && enlarged.animate) {
        enlarged.animate([{ opacity: 0, transform: 'translateY(8px) scale(.985)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    };
    if (incoming.decode) incoming.decode().then(commitImage, commitImage);
    else commitImage();
  };
  const hint = document.createElement('p');
  hint.className = 'gallery-hint'; hint.textContent = 'Select a photo to view it full size. Use the arrow keys to browse.';
  gallery.before(hint);
  images.forEach((image, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'gallery-button';
    button.setAttribute('aria-label', `Enlarge photo ${index + 1}: ${image.alt}`);
    image.before(button); button.append(image);
    button.addEventListener('click', () => { show(index); dialog.showModal(); document.body.style.overflow = 'hidden'; });
  });
  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') dialog.close();
    if (action === 'previous') show(current - 1);
    if (action === 'next') show(current + 1);
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('close', () => { imageRequest += 1; document.body.style.overflow = ''; });
}

// One scheduled update per frame keeps scroll feedback light, including on mobile.
const progress = document.createElement('div');
progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
const topButton = document.createElement('button');
topButton.type = 'button'; topButton.className = 'back-to-top';
topButton.textContent = '↑'; topButton.setAttribute('aria-label', 'Back to top');
topButton.hidden = true; document.body.append(topButton);
topButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const target = document.querySelector('.logo, .back-link, h1');
  if (target) { if (!target.matches('a')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
});
const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"], .project-nav a[href^="#"]')];
const sectionTargets = sectionLinks.map(link => ({ link, target: document.getElementById(link.hash.slice(1)) })).filter(item => item.target);
let scrollQueued = false;
const updateScroll = () => {
  scrollQueued = false;
  const offset = window.scrollY;
  document.querySelector('.hero-atmosphere')?.style.setProperty('--hero-drift', `${Math.min(80, offset * .12)}px`);
  const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.transform = `scaleX(${range ? Math.min(1, Math.max(0, offset / range)) : 0})`;
  document.querySelector('.navbar')?.classList.toggle('scrolled', offset > 24);
  topButton.hidden = offset < 700;
  let current = null;
  sectionTargets.forEach(item => { if (item.target.getBoundingClientRect().top <= window.innerHeight * 0.35) current = item; });
  sectionTargets.forEach(item => {
    if (item === current) item.link.setAttribute('aria-current', 'location');
    else item.link.removeAttribute('aria-current');
  });
};
window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScroll); } }, { passive: true });
window.addEventListener('resize', updateScroll);
window.addEventListener('load', updateScroll, { once: true });
updateScroll();

// Background-only pointer motion uses one shared loop, stops when settled,
// and reset immediately for reduced motion, tab hiding, or coarse pointers.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const fluidSurfaces = [...document.querySelectorAll('.hero')];
const fluidStates = fluidSurfaces.map(element => ({ element, x: .5, y: .5, targetX: .5, targetY: .5, vx: 0, vy: 0, active: false }));
let fluidFrame = 0;
let lastFluidTime = 0;
const canAnimate = () => !motionPreference.matches && precisePointer.matches && !document.hidden;
const runFluidFrame = timestamp => {
  fluidFrame = 0;
  if (!canAnimate()) { lastFluidTime = 0; return; }
  const dt = lastFluidTime ? Math.min(.032, Math.max(.004, (timestamp - lastFluidTime) / 1000)) : 1 / 60;
  lastFluidTime = timestamp;
  let unsettled = false;
  fluidStates.forEach(state => {
    const dx = state.targetX - state.x, dy = state.targetY - state.y;
    state.vx = (state.vx + dx * 180 * dt) * Math.exp(-18 * dt);
    state.vy = (state.vy + dy * 180 * dt) * Math.exp(-18 * dt);
    state.x += state.vx * dt; state.y += state.vy * dt;
    if (Math.abs(dx) + Math.abs(dy) + Math.abs(state.vx) + Math.abs(state.vy) > .001) unsettled = true;
    else { state.x = state.targetX; state.y = state.targetY; state.vx = state.vy = 0; }
    state.element.style.setProperty('--pointer-x', `${(state.x * 100).toFixed(2)}%`);
    state.element.style.setProperty('--pointer-y', `${(state.y * 100).toFixed(2)}%`);
    state.element.style.setProperty('--tilt-x', `${((.5 - state.y) * 2.4).toFixed(2)}deg`);
    state.element.style.setProperty('--tilt-y', `${((state.x - .5) * 2.4).toFixed(2)}deg`);
    state.element.style.setProperty('--float-x', `${((state.x - .5) * 8).toFixed(2)}px`);
    state.element.style.setProperty('--float-y', `${((state.y - .5) * 6).toFixed(2)}px`);
  });
  if (unsettled) fluidFrame = window.requestAnimationFrame(runFluidFrame);
  else lastFluidTime = 0;
};
const queueFluidFrame = () => { if (!fluidFrame && canAnimate()) fluidFrame = window.requestAnimationFrame(runFluidFrame); };
fluidStates.forEach(state => {
  state.element.addEventListener('pointermove', event => {
    if (!canAnimate()) return;
    const bounds = state.element.getBoundingClientRect();
    state.targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    state.targetY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    state.element.classList.add('pointer-active'); state.active = true; queueFluidFrame();
  }, { passive: true });
  const leave = () => { state.targetX = .5; state.targetY = .5; state.active = false; state.element.classList.remove('pointer-active'); queueFluidFrame(); };
  state.element.addEventListener('pointerleave', leave);
  state.element.addEventListener('pointercancel', leave);
});
const resetFluid = () => {
  if (fluidFrame) window.cancelAnimationFrame(fluidFrame);
  fluidFrame = 0; lastFluidTime = 0;
  fluidStates.forEach(state => {
    state.x = state.y = state.targetX = state.targetY = .5; state.active = false; state.vx = state.vy = 0;
    state.element.classList.remove('pointer-active');
    ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y', '--float-x', '--float-y'].forEach(name => state.element.style.removeProperty(name));
  });
  document.documentElement.classList.toggle('motion-paused', document.hidden);
};
motionPreference.addEventListener('change', resetFluid);
precisePointer.addEventListener('change', resetFluid);
document.addEventListener('visibilitychange', resetFluid);

// Pause decorative loops when the introduction leaves the viewport.
const atmosphere = document.querySelector('.hero-atmosphere');
if (atmosphere && 'IntersectionObserver' in window) {
  const atmosphereObserver = new IntersectionObserver(entries => {
    atmosphere.classList.toggle('ambient-paused', !entries[0].isIntersecting);
  });
  atmosphereObserver.observe(atmosphere);
}
