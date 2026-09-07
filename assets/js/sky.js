/* ============================================================
   MetMeSS 2026 - sky.js
   The background: a slowly drifting starfield with meteors.
   One canvas, one requestAnimationFrame loop, no libraries.
   Sleeps when the tab is hidden. Under prefers-reduced-motion
   it paints a single still starfield and stops.
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('sky');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d', { alpha: true });
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var w = 0, h = 0, dpr = 1;
  var stars = [], motes = [], meteors = [];
  var raf = 0, last = 0, nextMeteor = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth;
    h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // density follows the area, capped so a large monitor stays cheap
    var n = Math.min(320, Math.round((w * h) / 5600));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rnd(0.35, 1.45),
        a: rnd(0.25, 0.92),
        tw: rnd(0.4, 1.9),          // twinkle rate
        ph: Math.random() * Math.PI * 2,
        vy: rnd(0.004, 0.02)        // a very slow drift downward
      });
    }
    motes = [];
    var m = Math.min(24, Math.round(n / 12));
    for (var j = 0; j < m; j++) {
      motes.push({
        x: Math.random() * w, y: Math.random() * h,
        r: rnd(1.5, 3), a: rnd(0.05, 0.15),
        vx: rnd(-0.05, 0.05), vy: rnd(0.02, 0.07)
      });
    }
    nextMeteor = (window.performance ? performance.now() : Date.now()) + rnd(1000, 3600);
  }

  function spawnMeteor() {
    var fromLeft = Math.random() < 0.62;
    var speed = rnd(0.42, 0.84);
    meteors.push({
      x: fromLeft ? rnd(-0.15 * w, 0.72 * w) : rnd(0.3 * w, 1.2 * w),
      y: rnd(-0.12 * h, 0.55 * h),
      vx: (fromLeft ? 1 : -1) * speed * rnd(1.5, 2.3),
      vy: speed * rnd(0.55, 0.95),
      len: rnd(95, 240),
      life: 0,
      max: rnd(640, 1180)
    });
  }

  function paint(dt, t) {
    ctx.clearRect(0, 0, w, h);

    var i, s;
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      ctx.globalAlpha = still ? s.a * 0.85
        : s.a * (0.62 + 0.38 * Math.sin(t / 900 * s.tw + s.ph));
      ctx.fillStyle = '#dbe6f6';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fill();
      if (!still) {
        s.y += s.vy * dt * 0.06;
        if (s.y > h + 2) { s.y = -2; s.x = Math.random() * w; }
      }
    }

    for (i = 0; i < motes.length; i++) {
      var d = motes[i];
      ctx.globalAlpha = d.a;
      ctx.fillStyle = '#8fb4ea';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, 6.2832);
      ctx.fill();
      if (!still) {
        d.x += d.vx * dt * 0.06;
        d.y += d.vy * dt * 0.06;
        if (d.y > h + 4) { d.y = -4; d.x = Math.random() * w; }
        if (d.x < -4) d.x = w + 4; else if (d.x > w + 4) d.x = -4;
      }
    }

    // meteors: a hot head with a trail that fades into nothing
    for (i = meteors.length - 1; i >= 0; i--) {
      var mt = meteors[i];
      mt.life += dt;
      var p = mt.life / mt.max;
      if (p >= 1) { meteors.splice(i, 1); continue; }
      mt.x += mt.vx * dt * 0.06;
      mt.y += mt.vy * dt * 0.06;

      var fade = Math.sin(Math.PI * p);       // eases in and out, never a hard cut
      var mag = Math.sqrt(mt.vx * mt.vx + mt.vy * mt.vy) || 1;
      var tx = mt.x - (mt.vx / mag) * mt.len;
      var ty = mt.y - (mt.vy / mag) * mt.len;

      var g = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
      g.addColorStop(0, 'rgba(255,246,228,' + (0.92 * fade) + ')');
      g.addColorStop(0.22, 'rgba(232,181,92,' + (0.5 * fade) + ')');
      g.addColorStop(1, 'rgba(232,181,92,0)');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mt.x, mt.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.globalAlpha = fade;
      ctx.fillStyle = '#fff6e4';
      ctx.beginPath();
      ctx.arc(mt.x, mt.y, 1.5, 0, 6.2832);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function frame(t) {
    var dt = Math.min(t - last, 48);   // clamp, so a backgrounded tab never jumps
    last = t;
    if (t > nextMeteor) {
      if (meteors.length < 3) spawnMeteor();
      nextMeteor = t + rnd(2400, 7600);
    }
    paint(dt, t);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (still) { paint(0, 0); return; }
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); if (still) paint(0, 0); }, 180);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  build();
  start();
})();
