(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  function syncThemeLabel() {
    const isDark = root.getAttribute('data-theme') !== 'light';
    themeToggle.textContent = isDark ? 'LIGHT' : 'DARK';
    themeToggle.setAttribute('aria-pressed', String(!isDark));
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
  const menuOverlay = document.getElementById('menu-overlay');

  function syncMenuLabel() {
    menuToggle.textContent = body.classList.contains('menu-open') ? 'CERRAR' : 'MENÚ';
  }

  function syncMenuA11y(isOpen) {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      menuOverlay.removeAttribute('inert');
      menuOverlay.removeAttribute('aria-hidden');
    } else {
      menuOverlay.setAttribute('inert', '');
      menuOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  function getMenuFocusable() {
    return Array.from(menuOverlay.querySelectorAll('a, button'));
  }

  function openMenu() {
    body.classList.add('menu-open');
    syncMenuLabel();
    syncMenuA11y(true);
    menuClose.focus();
  }

  function closeMenu() {
    const wasOpen = body.classList.contains('menu-open');
    body.classList.remove('menu-open');
    syncMenuLabel();
    syncMenuA11y(false);
    if (wasOpen) menuToggle.focus();
  }

  function toggleMenu() {
    if (body.classList.contains('menu-open')) closeMenu();
    else openMenu();
  }

  menuToggle.addEventListener('click', toggleMenu);
  menuClose.addEventListener('click', closeMenu);
  syncMenuA11y(false);

  document.addEventListener('keydown', (event) => {
    if (!body.classList.contains('menu-open')) return;

    if (event.key === 'Escape') {
      closeMenu();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getMenuFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll('.menu-row').forEach((row) => {
    row.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = row.getAttribute('data-target');
      const el = document.getElementById(targetId);
      closeMenu();
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------- Services: active number driven by scroll ---------- */
  const serviceBlocks = document.querySelectorAll('[data-svc]');
  const numberEl = document.getElementById('services-number');
  const ACTIVE_SERVICE_LINE_PX = 170;
  let activeIndex = -1;
  let swapTimeout = null;

  function updateActiveService() {
    if (!serviceBlocks.length) return;
    let newIndex = 0;
    serviceBlocks.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= ACTIVE_SERVICE_LINE_PX) newIndex = i;
    });
    if (newIndex !== activeIndex) {
      if (activeIndex === -1 || prefersReducedMotion) {
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

    if (prefersReducedMotion) {
      projectsTitle.style.clipPath = 'circle(72% at 50% 50%)';
      projectsTitle.style.transform = 'scale(1)';
      workTagWrap.style.opacity = '1';
      return;
    }

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

  let scrollTicking = false;
  function requestScrollUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
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
