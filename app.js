// Стеклянная шапка, меню на телефоне и форма бесплатного урока
(() => {
  const topbar = document.querySelector('[data-topbar]');
  const glass = () => topbar.classList.toggle('is-glass', scrollY > 30);
  glass();
  addEventListener('scroll', glass, { passive: true });

  const sheet = document.getElementById('sheet');
  const opener = document.querySelector('[data-open-sheet]');

  const setSheet = (open) => {
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    opener.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) sheet.querySelector('nav a').focus({ preventScroll: true });
    else opener.focus({ preventScroll: true });
  };

  opener.addEventListener('click', () => setSheet(true));
  sheet.querySelectorAll('[data-close-sheet]').forEach((el) => el.addEventListener('click', () => setSheet(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) setSheet(false); });

  const form = document.querySelector('[data-form]');
  const status = form.querySelector('.form__status');
  const email = form.querySelector('#f-email');
  const emailErr = form.querySelector('#f-email-err');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const okEmail = email.value.trim() === '' || email.checkValidity();
    email.setAttribute('aria-invalid', String(!okEmail));
    emailErr.textContent = okEmail ? '' : 'Проверьте адрес почты: в нем должен быть знак @.';
    if (!okEmail) { email.focus(); return; }
    // Форма пока не подключена к рассылке
    status.textContent = 'Заявка не отправлена: форму пока не подключили.';
  });
})();

// Анимации — как на основном сайте: блоки появляются снизу по очереди, заголовки выезжают из-под маски,
// логотип чертится линиями, цифры набегают до своего значения
(() => {
  document.documentElement.classList.add('js');
  const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window;
  const watch = (els, cls, opts) => {
    if (!io) { els.forEach((el) => el.classList.add(cls)); return; }
    const ob = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(cls); ob.unobserve(e.target); } }), opts);
    els.forEach((el) => ob.observe(el));
  };

  const revealSel = '.section-head, .aud__intro, .aud__list li, .about__text, .why__text, .example, .step, .path__foot, .income__head, .income__card, .author__photo, .author__text, .plot, .plot-region, .courts-intro, .court, .gcard, .result__list li, .plan, .note, .faq__head, .final > *';
  const items = [...document.querySelectorAll(revealSel)];
  items.forEach((el) => {
    el.classList.add('reveal');
    const sibs = [...el.parentElement.children].filter((c) => c.matches(revealSel));
    if (sibs.length > 1) el.style.setProperty('--rd', (sibs.indexOf(el) % 6) * 90 + 'ms');
  });
  watch(items, 'is-in', { rootMargin: '0px 0px -12% 0px' });

  const heads = [...document.querySelectorAll('main h2')];
  heads.forEach((h) => h.classList.add('mask-h'));
  watch(heads, 'h-in', { rootMargin: '0px 0px -10% 0px' });

  const logo = document.querySelector('.logo-draw');
  if (logo) {
    const strokes = [...logo.querySelectorAll('[stroke]')];
    strokes.forEach((el, i) => {
      el.style.setProperty('--len', Math.ceil(el.getTotalLength ? el.getTotalLength() : 400));
      el.style.setProperty('--d', (i / strokes.length * 1.4).toFixed(2) + 's');
    });
    logo.querySelectorAll('path:not([stroke])').forEach((el) => el.style.setProperty('--d', '1.6s'));
    watch([logo], 'is-drawn', { threshold: 0.35 });
  }

  const group = (n, sep) => sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : String(n);
  const countUp = (el) => {
    if (!motionOK) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const list = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const tpl = n.textContent; const nums = [];
      tpl.replace(/\d[\d\u00a0\u202f ]*\d|\d/g, (m) => { nums.push({ v: parseInt(m.replace(/\D/g, ''), 10), sep: /[\u00a0\u202f ]/.test(m) }); return m; });
      if (nums.length) list.push({ n, tpl, nums });
    }
    if (!list.length) return;
    const t0 = performance.now(), dur = 1300;
    const render = (k) => list.forEach(({ n, tpl, nums }) => { let i = 0; n.textContent = tpl.replace(/\d[\d\u00a0\u202f ]*\d|\d/g, () => { const x = nums[i++]; return group(Math.round(x.v * k), x.sep); }); });
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); render(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(step); };
    render(0); requestAnimationFrame(step);
  };
  if (io) {
    const co = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } }), { threshold: 0.6 });
    document.querySelectorAll('.gcard__num, .plot-region__num, .example__big, .fact b, .plan__price, .plot__market b, .income__big').forEach((el) => co.observe(el));
  }
})();

// Всплывающее окно бесплатного урока
(() => {
  const dialog = document.getElementById('lessonDialog');
  const form = dialog.querySelector('[data-modal-form]');
  const status = dialog.querySelector('.lesson-modal__status');
  let opener = null;

  document.querySelectorAll('[data-open-lesson]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    opener = el;
    status.textContent = '';
    dialog.showModal();
    dialog.querySelector('input').focus({ preventScroll: true });
  }));
  dialog.querySelector('[data-close-lesson]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener && opener.focus({ preventScroll: true }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.elements.email;
    const ok = email.value.trim() === '' || email.checkValidity();
    email.setAttribute('aria-invalid', String(!ok));
    if (!ok) { status.textContent = 'Проверьте адрес почты: в нем должен быть знак @.'; email.focus(); return; }
    // Форма пока не подключена к рассылке
    status.textContent = 'Заявка не отправлена: форму пока не подключили.';
  });
})();
