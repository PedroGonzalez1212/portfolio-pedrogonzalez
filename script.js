(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  function syncThemeLabel() {
    const isDark = root.getAttribute('data-theme') !== 'light';
    themeToggle.textContent = isDark ? 'LIGHT' : 'DARK';
  }
  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') !== 'light';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    syncThemeLabel();
  });
  syncThemeLabel();

  /* ---------- Menu toggle ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  function syncMenuLabel() {
    menuToggle.textContent = body.classList.contains('menu-open') ? 'CERRAR' : 'MENÚ';
  }
  function toggleMenu() {
    body.classList.toggle('menu-open');
    syncMenuLabel();
  }
  function closeMenu() {
    body.classList.remove('menu-open');
    syncMenuLabel();
  }
  menuToggle.addEventListener('click', toggleMenu);
  menuClose.addEventListener('click', closeMenu);

  document.querySelectorAll('.menu-row').forEach((row) => {
    row.addEventListener('click', () => {
      const targetId = row.getAttribute('data-target');
      const el = document.getElementById(targetId);
      closeMenu();
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Services: active number driven by scroll ---------- */
  const serviceBlocks = document.querySelectorAll('[data-svc]');
  const numberEl = document.getElementById('services-number');
  let activeIndex = -1;
  let swapTimeout = null;

  function updateActiveService() {
    if (!serviceBlocks.length) return;
    const line = 120;
    let newIndex = 0;
    serviceBlocks.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= line) newIndex = i;
    });
    if (newIndex !== activeIndex) {
      if (activeIndex === -1) {
        activeIndex = newIndex;
        numberEl.textContent = String(newIndex + 1).padStart(2, '0');
        return;
      }
      activeIndex = newIndex;
      numberEl.classList.add('number-swap');
      clearTimeout(swapTimeout);
      swapTimeout = setTimeout(() => {
        numberEl.textContent = String(activeIndex + 1).padStart(2, '0');
        numberEl.classList.remove('number-swap');
      }, 350);
    }
  }

  /* ---------- Projects intro: scroll-driven circle reveal ---------- */
  const introSection = document.getElementById('s-projects-intro');
  const projectsTitle = document.getElementById('projects-title');
  const workTagWrap = document.getElementById('work-tag-wrap');

  function updateProjectsIntro() {
    if (!introSection) return;
    const rect = introSection.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    let progress = total > 0 ? (-rect.top) / total : 0;
    progress = Math.max(0, Math.min(1, progress));

    projectsTitle.style.clipPath = `circle(${(progress * 72).toFixed(1)}% at 50% 50%)`;
    projectsTitle.style.transform = `scale(${(0.78 + progress * 0.22).toFixed(3)})`;

    const tagVis = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
    workTagWrap.style.opacity = tagVis.toFixed(2);
  }

  function onScroll() {
    updateActiveService();
    updateProjectsIntro();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  setInterval(onScroll, 100);
  onScroll();

  /* ---------- Fade-ins on scroll into view ---------- */
  const aboutContent = document.getElementById('about-content');
  const contactSection = document.getElementById('s-contact');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target === aboutContent) aboutContent.classList.add('in-view');
        if (entry.target === contactSection) contactSection.classList.add('in-view');
      }
    });
  }, { threshold: 0.2 });

  if (aboutContent) io.observe(aboutContent);
  if (contactSection) io.observe(contactSection);
})();
