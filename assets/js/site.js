/* MetMeSS 2026 - site.js
   Sticky header, mobile menu, countdown, tabs, scroll reveal.
   No libraries, no scroll listeners doing layout work. */
(function () {
  'use strict';

  /* ---- sticky header: IntersectionObserver, not a scroll handler ---- */
  var head = document.getElementById('siteHead');
  if (head) {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
    document.body.prepend(probe);
    new IntersectionObserver(function (e) {
      head.classList.toggle('stuck', !e[0].isIntersecting);
    }).observe(probe);
  }

  /* ---- mobile menu ---- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---- countdown ---- */
  var cd = document.getElementById('cd');
  if (cd) {
    var target = new Date('2026-10-26T09:00:00+05:30').getTime();
    var el = {
      d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
      m: document.getElementById('cd-m'), s: document.getElementById('cd-s')
    };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    (function tick() {
      var gap = target - Date.now();
      if (gap <= 0) {
        cd.innerHTML = '<div style="grid-column:1/-1"><b>Happening now</b></div>';
        return;
      }
      var s = Math.floor(gap / 1000);
      el.d.textContent = Math.floor(s / 86400);
      el.h.textContent = pad(Math.floor((s % 86400) / 3600));
      el.m.textContent = pad(Math.floor((s % 3600) / 60));
      el.s.textContent = pad(s % 60);
      setTimeout(tick, 1000);
    })();
  }

  /* ---- programme tabs, with arrow-key support ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  if (tabs.length) {
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (n) { io.observe(n); });
  } else {
    reveals.forEach(function (n) { n.classList.add('in'); });
  }
})();
