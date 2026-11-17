(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var menu = document.getElementById('nav-menu');
  var navToggle = document.querySelector('.nav-toggle');
  var themeToggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var lightQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  /* ---------- Theme ---------- */
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return lightQuery && lightQuery.matches ? 'light' : 'dark';
  }

  function syncThemeUI() {
    var theme = currentTheme();
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#fafaf9' : '#0d0d10');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
      syncThemeUI();
    });
  }
  if (lightQuery && lightQuery.addEventListener) lightQuery.addEventListener('change', syncThemeUI);
  syncThemeUI();

  /* ---------- Header shadow on scroll ---------- */
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!menu || !navToggle) return;
    menu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    var icon = navToggle.querySelector('i');
    if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
  }

  if (navToggle && menu) {
    navToggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = menu ? Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]')) : [];
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var updateActive = function () {
      // At the very bottom, the last section can't reach the band, so force it.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive('#' + sections[sections.length - 1].id);
        return;
      }
      // Last section whose top has passed the line just under the sticky nav.
      var line = (header ? header.offsetHeight : 68) + window.innerHeight * 0.25;
      var current = sections[0];
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s; });
      setActive('#' + current.id);
    };
    // IntersectionObserver signals section boundary crossings; scroll covers the rest.
    var activeObserver = new IntersectionObserver(updateActive, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach(function (s) { activeObserver.observe(s); });
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  /* ---------- Project filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('#project-grid .card');
  Array.prototype.forEach.call(filterBtns, function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      Array.prototype.forEach.call(filterBtns, function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      Array.prototype.forEach.call(projectCards, function (card) {
        var cats = (card.getAttribute('data-category') || '').split(/\s+/);
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        card.hidden = !show;
        if (show) card.classList.add('is-visible');
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(reveals, function (el) { revealObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
