(function () {
  'use strict';
  var K = 'cookies-eleccion', box = document.getElementById('ck');
  function get() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(K, v); } catch (e) {} box.hidden = true; }
  if (!get()) box.hidden = false;
  document.getElementById('ck-ok').onclick = function () { set('aceptado'); };
  document.getElementById('ck-no').onclick = function () { set('rechazado'); };

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tarjetas: girar al tocar
  var cards = document.querySelectorAll('.flip');
  cards.forEach(function (c) {
    c.addEventListener('click', function () {
      var on = c.getAttribute('aria-pressed') === 'true';
      c.setAttribute('aria-pressed', String(!on));
    });
    // Inclinación 3D con el puntero
    if (!still) {
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--ty', (x * 24).toFixed(1) + 'deg');
        c.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(0) + '%');
        c.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(0) + '%');
        c.style.setProperty('--ix', (-x * 14).toFixed(1) + 'px');
        c.style.setProperty('--iy', (-y * 14 + 10).toFixed(1) + 'px');
        c.style.setProperty('--tx', (-y * 24).toFixed(1) + 'deg');
      });
      c.addEventListener('pointerleave', function () {
        c.style.setProperty('--ty', '0deg');
        c.style.setProperty('--tx', '0deg');
        c.style.setProperty('--gx', '50%'); c.style.setProperty('--gy', '0%');
        c.style.setProperty('--ix', '0px'); c.style.setProperty('--iy', '10px');
      });
    }
  });

  // Escena 3D: sigue el puntero o el dedo
  var scene = document.getElementById('scene'), stack = document.getElementById('stack');
  if (!still) {
    function move(cx, cy) {
      var r = scene.getBoundingClientRect();
      var x = Math.max(-1, Math.min(1, (cx - r.left) / r.width * 2 - 1));
      var y = Math.max(-1, Math.min(1, (cy - r.top) / r.height * 2 - 1));
      stack.style.setProperty('--ry', (-24 + x * 22).toFixed(1) + 'deg');
      stack.style.setProperty('--rx', (56 - y * 14).toFixed(1) + 'deg');
      stack.style.setProperty('--rz', (18 + x * 10).toFixed(1) + 'deg');
    }
    document.addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); });
    scene.addEventListener('touchmove', function (e) { var t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true });
    // Balanceo suave si nadie interactúa
    var t0 = 0, idle = true, timer;
    function wake() { idle = false; clearTimeout(timer); timer = setTimeout(function () { idle = true; }, 2500); }
    document.addEventListener('pointermove', wake);
    scene.addEventListener('touchmove', wake, { passive: true });
    (function loop(t) {
      if (idle && Date.now() - (window.__tilt || 0) > 2500) {
        var s = Math.sin(t / 1800);
        stack.style.setProperty('--ry', (-24 + s * 14).toFixed(1) + 'deg');
        stack.style.setProperty('--rz', (18 + s * 8).toFixed(1) + 'deg');
      }
      requestAnimationFrame(loop);
    })(0);
  }
})();

(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Revelado al hacer scroll
  var revs = document.querySelectorAll('.rev');
  document.querySelectorAll('.flip').forEach(function (f, i) { f.classList.add('fade'); f.style.transitionDelay = '0s,' + (i * 0.12) + 's,' + (i * 0.12) + 's'; setTimeout(function () { f.style.transitionDelay = ''; }, 2200 + i * 120); });
  revs = document.querySelectorAll('.rev, .fade');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    revs.forEach(function (r) { io.observe(r); });
  } else {
    revs.forEach(function (r) { r.classList.add('vis'); });
  }

  // Inclinacion 3D de las tarjetas de conceptos
  if (!still) {
    document.querySelectorAll('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = c.getBoundingClientRect();
        c.style.setProperty('--ty', (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(1) + 'deg');
        c.style.setProperty('--tx', (-((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(1) + 'deg');
      });
      c.addEventListener('pointerleave', function () {
        c.style.setProperty('--ty', '0deg'); c.style.setProperty('--tx', '0deg');
        c.style.setProperty('--gx', '50%'); c.style.setProperty('--gy', '0%');
        c.style.setProperty('--ix', '0px'); c.style.setProperty('--iy', '10px');
      });
    });
  }

  // Vista 3D con el movimiento del celular
  var stack = document.getElementById('stack'), vr = document.getElementById('vr');
  function onTilt(e) {
    if (e.gamma == null) return;
    var x = clamp(e.gamma / 30, -1, 1), y = clamp((e.beta - 45) / 30, -1, 1);
    stack.style.setProperty('--ry', (-24 + x * 22).toFixed(1) + 'deg');
    stack.style.setProperty('--rx', (56 - y * 14).toFixed(1) + 'deg');
    stack.style.setProperty('--rz', (18 + x * 10).toFixed(1) + 'deg');
    document.querySelectorAll('.flip').forEach(function (f) {
      f.style.setProperty('--ty', (x * 12).toFixed(1) + 'deg');
      f.style.setProperty('--tx', (-y * 12).toFixed(1) + 'deg');
      f.style.setProperty('--gx', ((x + 1) * 50).toFixed(0) + '%');
      f.style.setProperty('--gy', ((y + 1) * 50).toFixed(0) + '%');
    });
    window.__tilt = Date.now();
  }
  if (!still && 'DeviceOrientationEvent' in window && 'ontouchstart' in window) {
    var needs = typeof DeviceOrientationEvent.requestPermission === 'function';
    if (needs) {
      vr.hidden = false;
      vr.addEventListener('click', function () {
        DeviceOrientationEvent.requestPermission().then(function (r) {
          if (r === 'granted') { window.addEventListener('deviceorientation', onTilt); vr.hidden = true; }
        }).catch(function () {});
      });
    } else {
      window.addEventListener('deviceorientation', onTilt);
    }
  }
})();

(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.flip').forEach(function (c) {
    c.addEventListener('click', function () {
      for (var i = 0; i < 14; i++) {
        var sp = document.createElement('span');
        sp.className = 'spark' + (i % 2 ? ' l' : '');
        var ang = (Math.PI * 2 * i) / 14, d = 70 + Math.random() * 50;
        sp.style.setProperty('--dx', (Math.cos(ang) * d).toFixed(0) + 'px');
        sp.style.setProperty('--dy', (Math.sin(ang) * d).toFixed(0) + 'px');
        c.appendChild(sp);
        setTimeout(function (n) { return function () { n.remove(); }; }(sp), 900);
      }
    });
  });
})();

(function () {
  'use strict';
  var h1 = document.getElementById('titulo');
  if (!h1) return;
  var full = h1.textContent.replace(/\s+/g, ' ').trim();
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var parts = [{ t: 'Lleva tu negocio al ', g: false }, { t: 'mundo digital', g: true }];
  h1.setAttribute('aria-label', full);
  h1.textContent = '';
  h1.classList.add('tw');
  var letters = [], grads = [];
  parts.forEach(function (p) {
    var holder = p.g ? document.createElement('span') : h1;
    if (p.g) { holder.className = 'grad'; holder.setAttribute('aria-hidden', 'true'); h1.appendChild(holder); }
    p.t.split(' ').forEach(function (word, wi, arr) {
      if (!word) return;
      var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) {
        var l = document.createElement('span'); l.className = 'l'; l.textContent = ch;
        w.appendChild(l); letters.push(l); if (p.g) grads.push(l);
      });
      holder.appendChild(w);
      if (wi < arr.length - 1) holder.appendChild(document.createTextNode(' '));
    });
    if (!p.g) h1.appendChild(document.createTextNode(' '));
  });
  function finish() {
    grads.forEach(function (l, i) { l.style.animationDelay = (i * 0.09) + 's'; l.classList.add('wave'); });
  }
  if (still) { letters.forEach(function (l) { l.classList.add('on'); }); finish(); return; }
  var i = 0, prev = null;
  setTimeout(function tick() {
    if (prev) prev.classList.remove('cur');
    if (i >= letters.length) { finish(); return; }
    var l = letters[i++]; l.classList.add('on', 'cur'); prev = l;
    if (i === letters.length) { setTimeout(function () { l.classList.remove('cur'); finish(); }, 700); return; }
    setTimeout(tick, 62);
  }, 700);
})();
