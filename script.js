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
      sections.forEach(function (s) { if (!s.hidden && s.getBoundingClientRect().top <= line) current = s; });
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
  var revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  function observeReveal(node) {
    if (revealObserver) revealObserver.observe(node);
    else node.classList.add('is-visible');
  }
  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), observeReveal);

  /* ---------- Repositories: pinned (data/pinned.json) + recent (GitHub API) ---------- */
  var cfg = window.REPO_CONFIG || {};
  var ghUser = cfg.user || 'Fernaniii';
  var recentCount = cfg.recentCount || 6;
  var excluded = Array.isArray(cfg.exclude) ? cfg.exclude : [];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(classes) {
    var i = el('i', classes);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  function linkEl(href, iconClass, label) {
    var a = el('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.appendChild(icon(iconClass));
    a.appendChild(document.createTextNode(' ' + label));
    return a;
  }

  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    var secs = (then - Date.now()) / 1000;
    var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;
    for (var i = 0; i < units.length; i++) {
      if (Math.abs(secs) >= units[i][1] || units[i][0] === 'minute') {
        var n = Math.round(secs / units[i][1]);
        return rtf ? rtf.format(n, units[i][0]) : Math.abs(n) + ' ' + units[i][0] + (Math.abs(n) === 1 ? '' : 's') + ' ago';
      }
    }
    return '';
  }

  function isHttpUrl(u) { return typeof u === 'string' && /^https?:\/\//i.test(u); }

  function fetchJson(url) {
    if (!window.fetch) return Promise.reject(new Error('fetch unavailable'));
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  // Every repo is reduced to this shape before rendering.
  function normalize(r) {
    return {
      name: r.name,
      fullName: r.fullName || r.full_name || (ghUser + '/' + r.name),
      description: r.description || '',
      url: r.url || r.html_url || '',
      homepage: r.homepage || '',
      language: r.language || '',
      stars: typeof r.stars === 'number' ? r.stars : (typeof r.stargazers_count === 'number' ? r.stargazers_count : null),
      pushedAt: r.pushedAt || r.pushed_at || ''
    };
  }

  function renderRepoCard(r, grid, pinned) {
    var card = el('article', 'card repo-card reveal');
    var body = el('div', 'card-body');

    var title = el('h3', 'repo-name');
    title.appendChild(icon(pinned ? 'fas fa-thumbtack' : 'fas fa-code-branch'));
    title.appendChild(document.createTextNode(' ' + r.name));
    body.appendChild(title);

    if (r.description) body.appendChild(el('p', 'repo-desc', r.description));

    var items = [];
    if (r.language) items.push(['fas fa-circle repo-lang', r.language]);
    if (r.stars !== null) items.push(['fas fa-star', String(r.stars)]);
    if (r.pushedAt) items.push(['fas fa-clock-rotate-left', 'Updated ' + timeAgo(r.pushedAt)]);
    if (items.length) {
      var meta = el('ul', 'repo-meta');
      items.forEach(function (it) {
        var li = el('li');
        li.appendChild(icon(it[0]));
        li.appendChild(document.createTextNode(' ' + it[1]));
        meta.appendChild(li);
      });
      body.appendChild(meta);
    }

    var links = el('div', 'card-links');
    if (isHttpUrl(r.url)) links.appendChild(linkEl(r.url, 'fab fa-github', 'Code'));
    if (isHttpUrl(r.homepage)) links.appendChild(linkEl(r.homepage, 'fas fa-arrow-up-right-from-square', 'Live'));
    body.appendChild(links);

    card.appendChild(body);
    grid.appendChild(card);
    observeReveal(card);
  }

  function showGroup(key, list, pinned) {
    var group = document.getElementById(key + '-group');
    var grid = document.getElementById(key + '-grid');
    if (!group || !grid) return 0;
    grid.textContent = '';
    list.forEach(function (r) { renderRepoCard(r, grid, pinned); });
    group.hidden = list.length === 0;
    return list.length;
  }

  function hideRepoSection() {
    var section = document.getElementById('repositories');
    if (section) section.hidden = true;
    var navItem = menu && menu.querySelector('a[href="#repositories"]');
    if (navItem && navItem.parentNode) navItem.parentNode.hidden = true;
  }

  function loadPinned() {
    return fetchJson('data/pinned.json').then(function (data) {
      return Array.isArray(data) ? data.filter(function (r) { return r && r.name; }).map(normalize) : [];
    }).catch(function () { return []; });
  }

  function loadRecent() {
    var cacheKey = 'repos:recent:' + ghUser;
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) return Promise.resolve(JSON.parse(cached));
    } catch (e) { /* storage unavailable */ }

    return fetchJson('https://api.github.com/users/' + encodeURIComponent(ghUser) + '/repos?sort=pushed&per_page=30')
      .then(function (data) {
        var slim = (Array.isArray(data) ? data : [])
          .filter(function (r) { return r && !r.fork && !r.archived; })
          .map(function (r) {
            return normalize({
              name: r.name, full_name: r.full_name, description: r.description,
              html_url: r.html_url, homepage: r.homepage, language: r.language,
              stargazers_count: r.stargazers_count, pushed_at: r.pushed_at
            });
          });
        try { sessionStorage.setItem(cacheKey, JSON.stringify(slim)); } catch (e) { /* ignore */ }
        return slim;
      })
      .catch(function () { return []; });
  }

  if (document.getElementById('repositories')) {
    Promise.all([loadPinned(), loadRecent()]).then(function (res) {
      var pinned = res[0];
      var pinnedNames = pinned.map(function (r) { return r.fullName.toLowerCase(); });
      var recent = res[1].filter(function (r) {
        return pinnedNames.indexOf(r.fullName.toLowerCase()) === -1 && excluded.indexOf(r.name) === -1;
      }).slice(0, recentCount);

      var shown = showGroup('pinned', pinned, true) + showGroup('recent', recent, false);
      if (!shown) hideRepoSection();
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
