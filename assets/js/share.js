/* MetMeSS 2026 - share.js
   Share and Feedback buttons + dialogs. Self-contained: injects its own CSS
   and markup, so each page only needs one <script> tag.
   Feedback posts to the same Apps Script endpoint as abstracts (action:"feedback").
   Created by Kishan Tiwari. */
(function () {
  'use strict';
  var SITE = 'https://metmess.github.io/';
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxAWj5GyKPRIvSNLE-KfleeuR-2MB0nGisFkmZW_Ei_B8DVAi5P1VfQQNefZ-XOWD5yCw/exec';
  var MAIL = 'metmess2026@gmail.com';
  var PAGES = [
    ['', 'Home page'],
    ['register.html', 'How to register'],
    ['abstract.html', 'Submit an abstract'],
    ['school.html', 'Pre-conference school'],
    ['support.html', 'Student travel support']
  ];
  var TEXT = 'MetMeSS 2026, the 6th Symposium on Meteoroids, Meteors & Meteorites: Messengers from Space.\n' +
    'IIT Kharagpur, 24 to 29 October 2026, with PRL Ahmedabad.\n' +
    'Symposium 26-27 Oct, school for MSc/MTech/PhD students 25 Oct, field trip 28-29 Oct.\n' +
    'Registration and abstracts close 15 October 2026.';
  var TAGS = '#MetMeSS2026 #PlanetaryScience #Meteorites';

  var css =
  '.shfab{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;flex-direction:column;gap:8px}' +
  '.shfab button{display:flex;align-items:center;gap:7px;min-height:44px;padding:0 16px;border-radius:999px;cursor:pointer;' +
    'font:600 .85rem var(--sans);color:var(--ink);background:rgba(10,20,36,.82);border:1px solid var(--glass-line-2);' +
    '-webkit-backdrop-filter:var(--glass-blur);backdrop-filter:var(--glass-blur);box-shadow:0 6px 20px rgba(0,0,0,.35)}' +
  '.shfab button:hover{border-color:var(--accent);color:var(--accent)}' +
  '.shfab svg{width:17px;height:17px;flex:none}' +
  '@media (max-width:600px){.shfab .lbl{display:none}.shfab button{width:46px;padding:0;justify-content:center}}' +
  '@media print{.shfab{display:none}}' +
  'dialog.shd{margin:auto;width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 32px);padding:0;border-radius:var(--r-card);' +
    'border:1px solid var(--glass-line-2);background:var(--bg-2);color:var(--ink);font-family:var(--sans)}' +
  'dialog.shd::backdrop{background:rgba(3,7,14,.7)}' +
  '.shd-h{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--glass-line)}' +
  '.shd-h h3{font:600 1.05rem var(--disp);margin:0}' +
  '.shd-x{background:none;border:0;color:var(--ink-2);font-size:1.6rem;line-height:1;cursor:pointer;width:40px;height:40px}' +
  '.shd-b{padding:16px 20px 20px;overflow:auto}' +
  '.shd label.t{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);margin:12px 0 5px}' +
  '.shd input,.shd select,.shd textarea{width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);color:var(--ink);' +
    'border:1px solid var(--glass-line);border-radius:var(--r-ctrl);padding:10px 12px;font:inherit;font-size:.88rem}' +
  '.shd textarea{min-height:110px;resize:vertical}' +
  '.shd select option{background:var(--bg-2)}' +
  '.shd .lb{display:flex;gap:8px}.shd .lb input{flex:1}' +
  '.shd .b{min-height:40px;padding:0 14px;border-radius:var(--r-ctrl);cursor:pointer;font:600 .84rem var(--sans);' +
    'background:rgba(255,255,255,.07);border:1px solid var(--glass-line);color:var(--ink);white-space:nowrap}' +
  '.shd .b:hover{border-color:var(--glass-line-2)}' +
  '.shd .b.p{background:var(--accent);border-color:var(--accent);color:var(--accent-in)}' +
  '.shd .row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
  '.shg{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;margin-top:14px}' +
  '.shg a,.shg button{display:flex;align-items:center;justify-content:center;min-height:42px;border-radius:var(--r-ctrl);' +
    'text-decoration:none;cursor:pointer;font:600 .82rem var(--sans);color:var(--ink);background:rgba(255,255,255,.05);border:1px solid var(--glass-line)}' +
  '.shg a:hover,.shg button:hover{border-color:var(--accent);color:var(--accent)}' +
  '#shQRbox{display:none;margin-top:14px;text-align:center}#shQRbox img,#shQRbox canvas{background:#fff;padding:10px;border-radius:10px}' +
  '.shd .m{font-size:.78rem;color:var(--ink-3);margin-top:10px}' +
  '.shd .chips{display:flex;flex-wrap:wrap;gap:6px}' +
  '.shd .chips button{min-height:36px;padding:0 12px;border-radius:999px;cursor:pointer;font:500 .8rem var(--sans);' +
    'background:rgba(255,255,255,.05);border:1px solid var(--glass-line);color:var(--ink-2)}' +
  '.shd .chips button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-in);font-weight:600}' +
  '.shd .stars button{background:none;border:0;cursor:pointer;font-size:1.6rem;color:var(--ink-3);padding:2px 3px;line-height:1}' +
  '.shd .stars button.on{color:var(--accent)}' +
  '.shd .hp{position:absolute;left:0;top:0;width:1px;height:1px;opacity:0;clip-path:inset(50%)}' +
  '.shd .st{margin-top:10px;font-size:.84rem}.shd .st.ok{color:#7fe08d}.shd .st.bad{color:#ff9a9a}';

  var I = {
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  };

  var html =
  '<div class="shfab"><button type="button" id="shOpen" aria-haspopup="dialog">' + I.share + '<span class="lbl">Share</span></button>' +
  '<button type="button" id="fbOpen" aria-haspopup="dialog">' + I.fb + '<span class="lbl">Feedback</span></button></div>' +

  '<dialog class="shd" id="shDlg" aria-labelledby="shT"><div class="shd-h"><h3 id="shT">Share MetMeSS 2026</h3>' +
  '<button class="shd-x" data-close aria-label="Close">&times;</button></div><div class="shd-b">' +
  '<label class="t" for="shPage">Page to share</label><select id="shPage"></select>' +
  '<label class="t" for="shLink">Link</label><div class="lb"><input id="shLink" readonly><button class="b p" id="shCopyL" type="button">Copy</button></div>' +
  '<label class="t" for="shText">Message (edit before sharing if you like)</label><textarea id="shText"></textarea>' +
  '<div class="row"><button class="b" id="shCopyT" type="button">Copy message + link</button>' +
  '<button class="b" id="shNative" type="button" hidden>Share via device&hellip;</button></div>' +
  '<div class="shg">' +
    '<a id="sWA" target="_blank" rel="noopener">WhatsApp</a><a id="sLI" target="_blank" rel="noopener">LinkedIn</a>' +
    '<a id="sFB" target="_blank" rel="noopener">Facebook</a><a id="sX" target="_blank" rel="noopener">X / Twitter</a>' +
    '<a id="sTG" target="_blank" rel="noopener">Telegram</a><a id="sEM">Email</a>' +
    '<button id="sQR" type="button">QR code</button>' +
    '<a href="assets/img/social/MetMeSS2026_Poster_Square.jpg" download>Poster (Instagram)</a>' +
    '<a href="assets/img/social/MetMeSS2026_Poster_Wide.jpg" download>Poster (LinkedIn)</a>' +
    '<a href="assets/docs/MetMeSS2026_Flyer.pdf" download>Flyer (PDF)</a>' +
  '</div><div id="shQRbox"></div>' +
  '<p class="m" id="shNote">Instagram does not accept links from websites. Download the poster, post it, and put the link in your bio or story.</p>' +
  '</div></dialog>' +

  '<dialog class="shd" id="fbDlg" aria-labelledby="fbT"><div class="shd-h"><h3 id="fbT">Feedback &amp; suggestions</h3>' +
  '<button class="shd-x" data-close aria-label="Close">&times;</button></div><div class="shd-b"><form id="fbForm" novalidate>' +
  '<label class="t">Category</label><div class="chips" id="fbCats">' +
    '<button type="button" data-c="Website problem">Website problem</button>' +
    '<button type="button" data-c="Registration / abstract">Registration / abstract</button>' +
    '<button type="button" data-c="Programme / science">Programme / science</button>' +
    '<button type="button" data-c="Travel / stay">Travel / stay</button>' +
    '<button type="button" data-c="Suggestion" aria-pressed="true">Suggestion</button>' +
    '<button type="button" data-c="Other">Other</button></div>' +
  '<label class="t">Rating of this website (optional)</label><div class="stars" id="fbStars" role="radiogroup" aria-label="Rating"></div>' +
  '<label class="t" for="fbMsg">Message</label><textarea id="fbMsg" maxlength="3000" required></textarea>' +
  '<div class="m" id="fbCount">0 / 3000</div>' +
  '<label class="t" for="fbName">Name (optional)</label><input id="fbName" maxlength="120" autocomplete="name">' +
  '<label class="t" for="fbEmail">Email (optional, only if you want a reply)</label><input id="fbEmail" type="email" maxlength="200" autocomplete="email">' +
  '<input class="hp" id="fbWeb" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
  '<div class="row"><button class="b p" type="submit" id="fbSend">Send feedback</button></div>' +
  '<div class="st" id="fbSt" role="status"></div>' +
  '<p class="m">Goes to the organisers at ' + MAIL + '. The page you were on is attached so we can find problems.</p>' +
  '</form></div></dialog>';

  function $(id) { return document.getElementById(id); }
  function enc(s) { return encodeURIComponent(s); }

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var w = document.createElement('div'); w.innerHTML = html; document.body.appendChild(w);

  function open(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  document.querySelectorAll('dialog.shd').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });

  /* ---------- share ---------- */
  var sel = $('shPage'), here = location.pathname.split('/').pop();
  PAGES.forEach(function (p) {
    var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1];
    if (p[0] === here) o.selected = true; sel.appendChild(o);
  });
  $('shText').value = TEXT;

  function url() { return SITE + sel.value; }
  function msg() { return $('shText').value.trim(); }
  function refresh() {
    var u = url(), t = msg(), both = t + '\n' + u;
    $('shLink').value = u;
    $('sWA').href = 'https://wa.me/?text=' + enc(both);
    $('sTG').href = 'https://t.me/share/url?url=' + enc(u) + '&text=' + enc(t);
    $('sX').href = 'https://twitter.com/intent/tweet?text=' + enc(t.split('\n')[0] + ' ' + TAGS) + '&url=' + enc(u);
    $('sLI').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(u);
    $('sFB').href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc(u);
    $('sEM').href = 'mailto:?subject=' + enc('MetMeSS 2026, IIT Kharagpur, 24-29 October 2026') + '&body=' + enc(both + '\n\n' + TAGS);
    $('shQRbox').style.display = 'none';
  }
  sel.addEventListener('change', refresh);
  $('shText').addEventListener('input', refresh);

  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) {} t.remove(); }
  }
  $('shCopyL').addEventListener('click', function () { copy(url(), this); });
  $('shCopyT').addEventListener('click', function () { copy(msg() + '\n' + url() + '\n\n' + TAGS, this); });

  if (navigator.share) {
    $('shNative').hidden = false;
    $('shNative').addEventListener('click', function () {
      navigator.share({ title: 'MetMeSS 2026', text: msg(), url: url() }).catch(function () {});
    });
  }

  $('sQR').addEventListener('click', function () {
    var box = $('shQRbox');
    if (box.style.display === 'block') { box.style.display = 'none'; return; }
    box.style.display = 'block'; box.textContent = 'Making QR code…';
    function draw() {
      var q = window.qrcode(0, 'M'); q.addData(url()); q.make();
      box.innerHTML = q.createImgTag(6, 0) + '<div class="row" style="justify-content:center"><a class="b" id="qrDl" download="MetMeSS2026_QR.gif">Download QR</a></div>';
      $('qrDl').href = box.querySelector('img').src;
    }
    if (window.qrcode) return draw();
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    s.onload = draw; s.onerror = function () { box.textContent = 'QR code could not load. Check your connection.'; };
    document.head.appendChild(s);
  });

  $('shOpen').addEventListener('click', function () { refresh(); open($('shDlg')); });

  /* ---------- feedback ---------- */
  var cat = 'Suggestion', rating = 0;
  $('fbCats').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    cat = b.getAttribute('data-c');
  });
  var stars = $('fbStars');
  for (var i = 1; i <= 5; i++) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = '★'; b.dataset.v = i;
    b.setAttribute('role', 'radio'); b.setAttribute('aria-label', i + ' star' + (i > 1 ? 's' : ''));
    stars.appendChild(b);
  }
  stars.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    rating = +b.dataset.v === rating ? 0 : +b.dataset.v;
    stars.querySelectorAll('button').forEach(function (x) {
      x.classList.toggle('on', +x.dataset.v <= rating); x.setAttribute('aria-checked', String(+x.dataset.v === rating));
    });
  });
  $('fbMsg').addEventListener('input', function () { $('fbCount').textContent = this.value.length + ' / 3000'; });

  $('fbForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('fbMsg').value.trim(), em = $('fbEmail').value.trim(), s = $('fbSt'), btn = $('fbSend');
    s.className = 'st';
    if (m.length < 3) { s.className = 'st bad'; s.textContent = 'Please write a short message.'; return; }
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { s.className = 'st bad'; s.textContent = 'That email address does not look right.'; return; }
    var d = { action: 'feedback', category: cat, rating: rating || '', message: m,
      name: $('fbName').value.trim(), email: em, page: location.href, userAgent: navigator.userAgent, website: $('fbWeb').value };
    btn.disabled = true; s.textContent = 'Sending…';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.message || 'failed');
        s.className = 'st ok'; s.textContent = 'Thank you. Your feedback has reached the organisers.';
        $('fbForm').reset(); $('fbCount').textContent = '0 / 3000';
      })
      .catch(function () {
        s.className = 'st bad';
        var body = 'Category: ' + cat + '\nRating: ' + (rating || '-') + '\nPage: ' + location.href + '\n\n' + m;
        s.innerHTML = 'Could not send from here. <a href="mailto:' + MAIL + '?subject=' + enc('MetMeSS 2026 feedback') +
          '&body=' + enc(body) + '">Send it by email instead</a>, or write to ' + MAIL + '.';
      })
      .then(function () { btn.disabled = false; });
  });

  $('fbOpen').addEventListener('click', function () { $('fbSt').textContent = ''; open($('fbDlg')); });
})();
