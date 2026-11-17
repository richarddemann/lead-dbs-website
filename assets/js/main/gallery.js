// The gallery (layouts/gallery/list.html): the pills show one section (a kind of picture) or all; a click on a
// picture opens the lightbox with the picture larger and its words (its .g-item__info), arrows and the
// arrow keys step through the pictures shown; #fig-… or #covers in the address opens or filters at once.
(() => {
  const walls = document.querySelectorAll('[data-gallery]');
  const box = document.querySelector('.g-box');
  if (!walls.length) return;
  const items = [...document.querySelectorAll('[data-gallery] .g-item')];
  const secs = document.querySelectorAll('.g-sec');
  const pills = document.querySelector('.g-pills');
  const show = (kind) => {
    pills?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.show === kind)));
    items.forEach((it) => { it.hidden = kind !== 'all' && it.dataset.kind !== kind; });
    secs.forEach((sec) => { sec.hidden = kind !== 'all' && sec.dataset.kind !== kind; });
  };
  if (pills) { pills.hidden = false; pills.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.show); }); }
  if (!box || !box.showModal) return;
  const img = box.querySelector('.g-box__img'), info = box.querySelector('.g-box__info');
  let cur = -1;
  const visible = () => items.filter((it) => !it.hidden);
  const open = (it) => {
    const a = it.querySelector('.g-item__img');
    img.src = a.href; img.alt = a.querySelector('img').alt;
    info.innerHTML = it.querySelector('.g-item__info').innerHTML;
    cur = visible().indexOf(it);
    if (!box.open) box.showModal();
  };
  const step = (d) => { const v = visible(); if (v.length) open(v[(cur + d + v.length) % v.length]); };
  items.forEach((it) => it.querySelector('.g-item__img').addEventListener('click', (e) => { e.preventDefault(); open(it); }));
  box.querySelector('.g-box__nav--prev').addEventListener('click', () => step(-1));
  box.querySelector('.g-box__nav--next').addEventListener('click', () => step(1));
  // Observe a single finger on the image. Safari keeps its native pan and pinch gestures.
  let start;
  img.addEventListener('touchstart', (e) => {
    start = e.touches.length === 1 && window.visualViewport?.scale === 1 ? e.touches[0] : null;
  }, { passive: true });
  box.addEventListener('touchstart', (e) => { if (e.touches.length > 1) start = null; }, { passive: true });
  img.addEventListener('touchcancel', () => { start = null; });
  img.addEventListener('touchend', (e) => {
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.clientX;
    const dy = e.changedTouches[0].clientY - start.clientY;
    start = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > 2 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
  }, { passive: true });
  box.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  const hash = () => {
    if (location.hash === '#covers') show('cover');
    else if (location.hash === '#renders') show('render');
    const it = location.hash.startsWith('#fig-') && document.getElementById(location.hash.slice(1));
    if (it) open(it);
  };
  hash(); addEventListener('hashchange', hash);
})();
