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
          ], { duration: 550, delay: Math.min(index, 3) * 65, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' });
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
  const show = index => {
    current = (index + images.length) % images.length;
    const source = images[current];
    const enlarged = dialog.querySelector('.viewer-image');
    enlarged.src = source.src; enlarged.alt = source.alt;
    dialog.querySelector('.viewer-count').textContent = `${current + 1} / ${images.length}`;
    dialog.querySelector('.viewer-caption').textContent = source.alt;
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
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
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
