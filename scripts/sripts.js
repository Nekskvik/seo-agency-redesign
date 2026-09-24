const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Cursor ---------- */
(function initCursor() {
  if (window.innerWidth < 1024 || prefersReduced) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  (function anim() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(anim);
  })();

  document.querySelectorAll('a, button, .article, .tab, .faq-question, .case-card, .v-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
})();

/* ---------- Scroll Progress ---------- */
(function initProgress() {
  const bar = document.getElementById('scrollProgress');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = ((window.scrollY / h) * 100) + '%';
      ticking = false;
    });
  }, { passive: true });
})();

/* ---------- Nav ---------- */
(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ---------- Parallax ---------- */
(function initParallax() {
  if (prefersReduced) return;
  const layers = document.querySelectorAll('[data-parallax]');
  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.parallax);
      const rect = layer.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - vh / 2;
      const y = -center * speed;
      layer.style.transform = `translate3d(0, ${y}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', update);
  update();
})();

/* ---------- Split text reveal ---------- */
(function initSplit() {
  document.querySelectorAll('.split-line').forEach((line, i) => {
    setTimeout(() => line.classList.add('revealed'), 200 + i * 140);
  });
})();

/* ---------- Reveal ---------- */
(function initReveals() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ---------- Counters ---------- */
(function initCounters() {
  const seen = new WeakSet();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const comma = el.dataset.comma === 'true';
      const duration = 1700;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const cur = Math.floor(eased * target);
        let out = cur.toString();
        if (comma) out = cur.toLocaleString('ru-RU');
        el.textContent = prefix + out + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(c => obs.observe(c));
})();

/* ---------- Manifesto word-by-word ---------- */
(function initManifesto() {
  const container = document.getElementById('manifestoText');
  if (!container) return;

  // Wrap each word in a span, preserving accent-word elements
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  const fragments = [];

  function processNode(node) {
    if (node.nodeType === 3) {
      // text node
      const words = node.textContent.split(/(\s+)/);
      words.forEach(w => {
        if (w.trim() === '') {
          if (w) fragments.push(document.createTextNode(w));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          fragments.push(span);
        }
      });
    } else if (node.nodeType === 1) {
      // element node (accent-word spans)
      const isAccent = node.classList && node.classList.contains('accent-word');
      const text = node.textContent;
      const words = text.split(/(\s+)/);
      words.forEach(w => {
        if (w.trim() === '') {
          if (w) fragments.push(document.createTextNode(w));
        } else {
          const span = document.createElement('span');
          span.className = 'word' + (isAccent ? ' accent-word' : '');
          span.textContent = w;
          fragments.push(span);
        }
      });
    }
  }

  // Clone children first
  Array.from(container.childNodes).forEach(processNode);
  container.innerHTML = '';
  fragments.forEach(f => container.appendChild(f));

  const words = container.querySelectorAll('.word');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        words.forEach((w, i) => {
          setTimeout(() => w.classList.add('lit'), i * 45);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  obs.observe(container);
})();

/* ---------- Positions List Reveal ---------- */
(function initPositions() {
  const rows = document.querySelectorAll('.position-row');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay, 10) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  rows.forEach(r => obs.observe(r));
})();

/* ---------- Stat borders ---------- */
(function initStatBorders() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat').forEach(s => obs.observe(s));
})();

/* ---------- HORIZONTAL PINNED CASES (v4 - fixed) ---------- */
(function initCases() {
  const section  = document.getElementById('cases');
  const viewport = document.getElementById('casesViewport');
  const track    = document.getElementById('casesTrack');
  const counter  = document.getElementById('caseIndex');
  const fill     = document.getElementById('casesProgress');
  const dotsWrap = document.getElementById('casesDots');
  const btnPrev  = document.getElementById('casesPrev');
  const btnNext  = document.getElementById('casesNext');

  if (!section || !viewport || !track) {
    console.error('[cases] missing elements', { section: !!section, viewport: !!viewport, track: !!track });
    return;
  }

  const originalCards = Array.from(track.querySelectorAll('.case-card'));
  const N = originalCards.length;
  if (N === 0) { console.error('[cases] no cards'); return; }

  // ---- Клонирование для бесконечности ----
  const CLONES = 3;
  const oneSet = originalCards.map(c => c.outerHTML).join('');
  let before = '', after = '';
  for (let i = 0; i < CLONES; i++) { before = oneSet + before; after = after + oneSet; }
  track.innerHTML = before + track.innerHTML + after;

  const allCards = Array.from(track.querySelectorAll('.case-card'));
  const ORIGIN_START = N * CLONES;

  // ---- Точки ----
  const dots = [];
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'cases-dot' + (i === 0 ? ' active' : '');
      d.dataset.idx = String(i);
      d.setAttribute('aria-label', 'Кейс ' + (i + 1));
      dotsWrap.appendChild(d);
      dots.push(d);
    }
    dotsWrap.addEventListener('click', (e) => {
      const dot = e.target.closest('.cases-dot');
      if (!dot) return;
      e.preventDefault();
      e.stopPropagation();
      goToReal(parseInt(dot.dataset.idx, 10));
    });
  }

  // ---- Состояние ----
  let cardStep = 0;
  let cardWidth = 0;
  let viewportW = 0;
  let currentX = 0;
  let targetX = 0;
  let rafId = null;
  let activeReal = 0;
  let measured = false;

  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragStartTrackX = 0;
  let moved = false;
  let axis = null;
  let velocity = 0;
  let lastX = 0, lastT = 0;

  // ---- Измерение ----
  function measure() {
    track.style.transform = 'translate3d(0,0,0)';
    if (allCards.length < 2) { measured = false; return false; }
    const r1 = allCards[0].getBoundingClientRect();
    const r2 = allCards[1].getBoundingClientRect();
    cardWidth = r1.width;
    cardStep = r2.left - r1.left;
    viewportW = viewport.clientWidth;
    if (cardStep <= 0 || viewportW <= 0) { measured = false; return false; }

    const centerOffset = (viewportW - cardWidth) / 2;
    currentX = centerOffset - ORIGIN_START * cardStep;
    targetX = currentX;
    track.style.transform = `translate3d(${currentX}px,0,0)`;
    measured = true;
    updateActive();
    return true;
  }

  // ---- Активная карточка ----
  function updateActive() {
    if (!measured) return;
    const center = viewportW / 2;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < allCards.length; i++) {
      const r = allCards[i].getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - center);
      if (d < bestD) { bestD = d; best = i; }
    }
    const real = ((best - ORIGIN_START) % N + N) % N;
    if (real !== activeReal) {
      activeReal = real;
      if (counter) counter.textContent = String(real + 1).padStart(2, '0');
      dots.forEach((d, i) => d.classList.toggle('active', i === real));
      if (fill) fill.style.width = ((real / (N - 1)) * 100) + '%';
    }
    allCards.forEach((c, i) => c.classList.toggle('is-active', i === best));
  }

  // ---- Wrap ----
  function wrap() {
    if (!measured) return;
    const startX = (viewportW - cardWidth) / 2 - ORIGIN_START * cardStep;
    const endX = startX - (N - 1) * cardStep;
    const t = cardStep * 1.5;
    if (currentX > startX + t) { currentX -= N * cardStep; targetX -= N * cardStep; dragStartTrackX -= N * cardStep; }
    if (currentX < endX - t) { currentX += N * cardStep; targetX += N * cardStep; dragStartTrackX += N * cardStep; }
  }

  // ---- RAF ----
  function tick() {
    currentX += (targetX - currentX) * 0.14;
    if (Math.abs(targetX - currentX) < 0.5) currentX = targetX;
    wrap();
    track.style.transform = `translate3d(${currentX}px,0,0)`;
    updateActive();
    rafId = requestAnimationFrame(tick);
  }

  // ---- Snap ----
  function snap(vel) {
    if (!measured) return;
    let bias = 0;
    if (Math.abs(vel) > 0.4) bias = vel > 0 ? -1 : 1;
    const cx = (viewportW - cardWidth) / 2;
    const raw = (cx - currentX) / cardStep;
    const nearest = Math.round(raw) + bias;
    targetX = cx - nearest * cardStep;
  }

  // ---- Навигация ----
  function goToReal(real) {
    if (!measured) {
      // Попробуем перемерить и повторить
      if (measure()) {
        requestAnimationFrame(() => goToReal(real));
      }
      return;
    }
    const cx = (viewportW - cardWidth) / 2;
    const raw = (cx - currentX) / cardStep;
    const currentPhys = Math.round(raw);
    const currentReal = ((currentPhys - ORIGIN_START) % N + N) % N;
    let diff = real - currentReal;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    targetX = cx - (currentPhys + diff) * cardStep;
  }

  function next() { goToReal((activeReal + 1) % N); }
  function prev() { goToReal((activeReal - 1 + N) % N); }

  // ---- Кнопки ----
  if (btnNext) btnNext.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); next(); });
  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); prev(); });

  // ---- Клавиатура ----
  document.addEventListener('keydown', (e) => {
    if (!measured) return;
    const r = section.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  // ---- Drag ----
  function down(x, y) {
    dragging = true; moved = false; axis = null;
    viewport.classList.add('dragging');
    dragStartX = x; dragStartY = y;
    dragStartTrackX = currentX;
    targetX = currentX;
    lastX = x; lastT = performance.now(); velocity = 0;
  }
  function move(x, y, e) {
    if (!dragging) return;
    const dx = x - dragStartX, dy = y - dragStartY;
    if (axis === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis === 'y') { up(false); return; }
    if (Math.abs(dx) > 6) moved = true;
    currentX = dragStartTrackX + dx;
    targetX = currentX;
    wrap();
    track.style.transform = `translate3d(${currentX}px,0,0)`;
    updateActive();
    const now = performance.now();
    const dt = now - lastT || 1;
    velocity = (x - lastX) / dt;
    lastX = x; lastT = now;
    if (moved && e && e.cancelable) e.preventDefault();
  }
  function up(applySnap) {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('dragging');
    if (applySnap && moved) snap(velocity);
  }

  // Touch
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    if (e.target.closest('a, button')) return;
    const t = e.touches[0]; down(t.clientX, t.clientY);
  }, { passive: true });
  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0]; move(t.clientX, t.clientY, e);
  }, { passive: false });
  viewport.addEventListener('touchend', () => up(true));
  viewport.addEventListener('touchcancel', () => up(true));

  // Pointer (мышь)
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    if (e.target.closest('a, button')) return;
    down(e.clientX, e.clientY);
  });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    if (!dragging) return;
    move(e.clientX, e.clientY, e);
  });
  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') return;
    if (!dragging) return;
    up(true);
  });

  // ---- Setup ----
  function setup() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    // Пробуем измерить несколько раз, пока не получится (layout может быть не готов)
    let attempts = 0;
    function tryMeasure() {
      attempts++;
      const ok = measure();
      if (ok) {
        if (!rafId) rafId = requestAnimationFrame(tick);
        return;
      }
      if (attempts < 10) {
        setTimeout(tryMeasure, 80);
      } else {
        console.warn('[cases] failed to measure after 10 attempts');
      }
    }
    tryMeasure();
  }

  setup();

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 150); });
  window.addEventListener('orientationchange', () => { clearTimeout(rt); rt = setTimeout(setup, 250); });
  window.addEventListener('load', setup);
})();

/* ---------- PROCESS PINNED with SVG draw ---------- */
(function initProcess() {
  const pin = document.querySelector('.process-pin');
  const path = document.getElementById('flightPathDrawn');
  const percent = document.getElementById('processPercent');
  const steps = document.querySelectorAll('.process-step-item');
  const nodes = document.querySelectorAll('.flight-node');
  const labels = document.querySelectorAll('.flight-node-label');
  if (!pin || !path) return;

  // Set path length
  const len = path.getTotalLength();
  path.style.setProperty('--path-len', len);
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  function update() {
    const rect = pin.getBoundingClientRect();
    const pinTop = -rect.top;
    const totalScrollable = rect.height - window.innerHeight;
    const progress = Math.max(0, Math.min(1, pinTop / totalScrollable));

    // Draw SVG
    path.style.strokeDashoffset = len * (1 - progress);

    // Update percent text
    const pct = Math.round(progress * 100);
    percent.textContent = pct + '%';

    // Determine active step (0-3)
    const stepIdx = Math.min(3, Math.floor(progress * 4));

    steps.forEach((s, i) => s.classList.toggle('active', i === stepIdx));
    nodes.forEach((n, i) => n.classList.toggle('active', i <= stepIdx));
    labels.forEach((l, i) => l.classList.toggle('active', i <= stepIdx));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Vertical Ticker duplicate ---------- */
(function initVTicker() {
  const track = document.getElementById('vTickerTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

/* ---------- Stats spotlight ---------- */
(function initSpotlight() {
  if (window.innerWidth < 1024 || prefersReduced) return;
  const section = document.getElementById('statsSection');
  const glow = document.getElementById('statsGlow');
  if (!section || !glow) return;

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
  });
  // Initial position
  glow.style.transform = 'translate(-300px, -300px)';
})();

/* ---------- FAQ ---------- */
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();

/* ---------- Magnetic buttons ---------- */
(function initMagnetic() {
  if (window.innerWidth < 1024 || prefersReduced) return;
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();


/* ---------- Article 3D tilt ---------- */
(function initTilt() {
  if (window.innerWidth < 1024 || prefersReduced) return;
  document.querySelectorAll('.article').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      card.style.transformStyle = 'preserve-3d';
      card.style.perspective = '800px';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ---------- Mobile menu ---------- */
(function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    Object.assign(links.style, {
      display: open ? '' : 'flex',
      position: open ? '' : 'absolute',
      top: open ? '' : '100%',
      left: open ? '' : '0',
      right: open ? '' : '0',
      flexDirection: open ? '' : 'column',
      background: open ? '' : 'rgba(10,10,11,0.98)',
      padding: open ? '' : '32px',
      borderBottom: open ? '' : '1px solid rgba(255,255,255,0.08)',
      gap: open ? '' : '24px'
    });
  });
})();

/* ============================================================
   PROMO MODAL — открытие через 10 сек, таймер на 1 неделю
   ============================================================ */
(function initPromoModal() {
  const modal = document.getElementById('promoModal');
  if (!modal) return;

  const DELAY_MS = 10000;              // 10 секунд
  const DURATION_MS = 7 * 24 * 60 * 60 * 1000;  // 1 неделя

  // ---------- Открытие / закрытие ----------
  function open() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Клик по кнопке CTA тоже закрывает + скроллит к секции
      close();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      close();
    }
  });


  // ---------- Таймер на 1 неделю от первого визита ----------
  const DEADLINE_KEY = 'promoDeadline_v1';
  let deadline = parseInt(localStorage.getItem(DEADLINE_KEY), 10);

  if (!deadline || isNaN(deadline)) {
    deadline = Date.now() + DURATION_MS;
    localStorage.setItem(DEADLINE_KEY, String(deadline));
  }

  const units = {
    days:    modal.querySelector('[data-unit="days"]'),
    hours:   modal.querySelector('[data-unit="hours"]'),
    minutes: modal.querySelector('[data-unit="minutes"]'),
    seconds: modal.querySelector('[data-unit="seconds"]')
  };

  let prevValues = { days: '', hours: '', minutes: '', seconds: '' };
  let tickInterval = null;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    let remaining = deadline - Date.now();
    if (remaining < 0) {
      remaining = 0;
    }

    const totalSec = Math.floor(remaining / 1000);
    const days    = Math.floor(totalSec / 86400);
    const hours   = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const values = {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds)
    };

    Object.keys(values).forEach((key) => {
      const el = units[key];
      if (!el) return;
      if (prevValues[key] !== values[key]) {
        el.textContent = values[key];
        // Анимация при изменении
        el.classList.remove('tick');
        // Форсируем reflow
        void el.offsetWidth;
        el.classList.add('tick');
        prevValues[key] = values[key];
      }
    });
  }

  // Инициализация: сразу считаем значения
  tick();
  // Обновляем раз в секунду
  tickInterval = setInterval(tick, 1000);
})();

(function () {
  function boot() {
    var modal = document.getElementById('promoModal');
    if (!modal) {
      console.error('[promo] modal not found in DOM');
      return;
    }
    console.log('[promo] modal found, arming 10s timer');

    function open() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      console.log('[promo] opened');
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    // Запуск через 10 секунд
    setTimeout(open, 10000);

    // Таймер
    var KEY = 'promoDeadline_v1';
    var deadline = parseInt(localStorage.getItem(KEY), 10);
    if (!deadline || isNaN(deadline)) {
      deadline = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(KEY, String(deadline));
    }
    var u = {
      days: modal.querySelector('[data-unit="days"]'),
      hours: modal.querySelector('[data-unit="hours"]'),
      minutes: modal.querySelector('[data-unit="minutes"]'),
      seconds: modal.querySelector('[data-unit="seconds"]')
    };
    var prev = {};
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var rem = Math.max(0, deadline - Date.now());
      var s = Math.floor(rem / 1000);
      var vals = {
        days: pad(Math.floor(s / 86400)),
        hours: pad(Math.floor((s % 86400) / 3600)),
        minutes: pad(Math.floor((s % 3600) / 60)),
        seconds: pad(s % 60)
      };
      Object.keys(vals).forEach(function (k) {
        if (u[k] && prev[k] !== vals[k]) {
          u[k].textContent = vals[k];
          u[k].classList.remove('tick');
          void u[k].offsetWidth;
          u[k].classList.add('tick');
          prev[k] = vals[k];
        }
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


/* ============================================================
   CONTACT MODAL — открытие по data-modal-open="contactModal"
   ============================================================ */
(function () {

  /* ---------- Универсальный API ---------- */

  function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Автофокус на первое поле после появления
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus({ preventScroll: true });
    }, 700);
  }

  function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Сброс формы через 400мс (после анимации)
    setTimeout(() => {
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
        modal.querySelectorAll('.cmodal__field').forEach(f => {
          f.classList.remove('is-invalid');
        });
      }
    }, 400);
  }

  // Экспортируем, чтобы можно было вызывать программно:
  //   window.openModal()
  //   window.closeModal()
  window.openModal  = openContactModal;
  window.closeModal = closeContactModal;

  /* ---------- Делегированный обработчик клика ---------- */
  document.addEventListener('click', (e) => {

    // Открытие по data-modal-open
    const opener = e.target.closest('[data-modal-open="contactModal"]');
    if (opener) {
      e.preventDefault();
      openContactModal();
      return;
    }

    // Закрытие по data-close внутри модалки
    if (e.target.closest('#contactModal [data-close]')) {
      e.preventDefault();
      closeContactModal();
      return;
    }
  });

  // Esc закрывает
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('contactModal');
    if (modal && modal.classList.contains('is-open')) closeContactModal();
  });

  /* ---------- Валидация и отправка ---------- */
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = Array.from(form.querySelectorAll('.cmodal__field'));

  function validateField(field) {
    const input = field.querySelector('input');
    if (!input) return false;
    const v = input.value.trim();
    if (!v) { field.classList.remove('is-invalid'); return false; }

    let valid = true;
    if (input.type === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    } else if (input.type === 'tel') {
      valid = v.replace(/\D/g, '').length >= 10;
    } else if (input.name === 'site') {
      valid = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(v);
    } else if (input.name === 'name') {
      valid = v.length >= 2;
    }
    field.classList.toggle('is-invalid', !valid);
    return valid;
  }

  fields.forEach(field => {
    const input = field.querySelector('input');
    if (!input) return;
    input.addEventListener('blur', () => validateField(field));
    input.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    fields.forEach(f => { if (!validateField(f)) allValid = false; });

    if (!allValid) {
      // Тряска для невалидных полей
      fields.forEach(field => {
        if (!field.classList.contains('is-invalid')) return;
        field.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(0)' }
        ], { duration: 300, easing: 'ease-out' });
      });
      return;
    }

    // Успех — визуальный мок
    const submit = form.querySelector('.cmodal__submit');
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Отправлено ✓';
      submit.style.background = '#8FD400';
    }
    setTimeout(closeContactModal, 1400);
  });

})();


/* ============================================================
   SERVICES — staggered появление строк при скролле
   ============================================================ */
(function initServices() {
  const rows = document.querySelectorAll('.service-row');
  if (!rows.length) return;

  // IntersectionObserver — каждая строка появляется со своей задержкой
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const row = entry.target;
        const index = parseInt(row.dataset.index || '0', 10);
        setTimeout(() => {
          row.classList.add('is-visible');
        }, index * 60);
        observer.unobserve(row);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  rows.forEach((row, i) => {
    row.dataset.index = String(i);
    observer.observe(row);
  });
})();


/* ============================================================
   SCROLL TO TOP — появление + прогресс + клик
   ============================================================ */
(function initToTop() {
  const btn = document.getElementById('toTop');
  const progress = document.getElementById('toTopProgress');
  if (!btn || !progress) return;

  const SHOW_AFTER = 600;             // px — после какого скролла показывать
  const CIRCUMFERENCE = 138.23;       // 2 * π * 22 — длина окружности r=22

  let ticking = false;

  function update() {
    const scrolled = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressRatio = docHeight > 0 ? Math.min(1, scrolled / docHeight) : 0;

    // Прогресс вокруг кнопки
    progress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progressRatio));

    // Показ/скрытие
    if (scrolled > SHOW_AFTER) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }

    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // ---------- Клик: плавный скролл наверх ----------
  btn.addEventListener('click', () => {
    // Анимация стрелки "улетает вверх"
    btn.classList.add('is-clicking');
    setTimeout(() => btn.classList.remove('is-clicking'), 400);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth'
    });
  });
})();


/* ============================================================
   COOKIE BANNER — появление + сохранение выбора
   ============================================================ */
(function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const STORAGE_KEY = 'cookieConsent_v1';
  const SHOW_DELAY = 1500;   // мс — через сколько после загрузки показать

  // ---------- Проверяем, был ли уже выбор ----------
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    // Пользователь уже выбирал — не показываем
    return;
  }

  // ---------- Показ через 1.5 секунды ----------
  setTimeout(() => {
    banner.classList.add('is-visible');
  }, SHOW_DELAY);

  // ---------- Обработка клика по кнопкам ----------
  function hideBanner() {
    banner.classList.remove('is-visible');
    banner.classList.add('is-hiding');
    setTimeout(() => banner.remove(), 600);
  }

  banner.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-cookie-action]');
    if (!actionEl) return;
    e.preventDefault();

    const action = actionEl.dataset.cookieAction;

    let value;
    if (action === 'accept') {
      value = 'all';
    } else if (action === 'essential') {
      value = 'essential';
    } else if (action === 'dismiss') {
      value = 'dismissed';
    }

    // Сохраняем выбор
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        value: value,
        date: new Date().toISOString()
      }));
    } catch (err) {
      // localStorage может быть недоступен — тогда просто закрываем
    }

    // Скрываем плашку
    hideBanner();

    // Отправляем событие для других скриптов (аналитика и т.д.)
    window.dispatchEvent(new CustomEvent('cookieConsent', {
      detail: { value: value }
    }));

    console.log('[cookies] saved:', value);
  });
})();