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
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); menu.focus(); } });
}
if ('IntersectionObserver' in window) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-header,.about-card,.project-card,.experience-card,.contact-card').forEach(element => {
      element.classList.add('reveal', 'pending'); observer.observe(element);
    });
  }
  const sections = [...document.querySelectorAll('main > section[id]')];
  const activeSections = new Map();
  const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => activeSections.set(entry.target.id, entry.isIntersecting));
    const active = sections.find(section => activeSections.get(section.id));
    document.querySelectorAll('.nav-links a').forEach(link => {
      if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -45% 0px' });
  sections.forEach(section => activeObserver.observe(section));
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
