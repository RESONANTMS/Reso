/* ─── Resonant Media Solutions — Shared Animation Layer ─── */
(function () {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:#C9A96E;z-index:9999;width:0%;transition:width .05s linear;pointer-events:none;';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── 2. CUSTOM CURSOR ── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.style.cssText = 'position:fixed;width:6px;height:6px;background:#C9A96E;border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:transform .1s,opacity .3s;mix-blend-mode:normal;';
    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.style.cssText = 'position:fixed;width:32px;height:32px;border:1px solid rgba(201,169,110,0.5);border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:transform .25s cubic-bezier(.16,1,.3,1),width .25s,height .25s,opacity .3s,border-color .25s;';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });

    // Lag the ring
    let rx = -100, ry = -100;
    function movRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(movRing);
    }
    movRing();

    // Hover state on interactive elements
    document.querySelectorAll('a, button, .svc-row, .ind-cell, .sw-item, .eeat-cell, .team-card, .p-cell, .proc-step, .t-card, .faq-btn, .radio-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '52px'; ring.style.height = '52px';
        ring.style.borderColor = 'rgba(201,169,110,0.85)';
        dot.style.transform = 'translate(-50%,-50%) scale(1.8)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '32px'; ring.style.height = '32px';
        ring.style.borderColor = 'rgba(201,169,110,0.5)';
        dot.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
  }

  /* ── 3. PAGE LOAD REVEAL ── */
  function initPageLoad() {
    const cover = document.createElement('div');
    cover.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9997;pointer-events:none;opacity:1;transition:opacity .5s ease;';
    document.body.appendChild(cover);
    // Use setTimeout for reliable paint cycle — rAF alone can be skipped on slow connections
    setTimeout(() => {
      cover.style.opacity = '0';
      setTimeout(() => { if (cover.parentNode) cover.remove(); }, 550);
    }, 80);
    // Page exit fade
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http') || href.startsWith('tel')) return;
      a.addEventListener('click', e => {
        e.preventDefault();
        const fade = document.createElement('div');
        fade.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9997;pointer-events:none;opacity:0;transition:opacity .35s;';
        document.body.appendChild(fade);
        setTimeout(() => { fade.style.opacity = '1'; }, 10);
        setTimeout(() => { window.location.href = href; }, 370);
      });
    });
  }

  /* ── 4. HERO WORD SPLIT ANIMATION ── */
  function initHeroSplit() {
    const hero = document.querySelector('.hero-h1');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Split on <br> then words
    const rawHTML = hero.innerHTML;
    const lines = rawHTML.split(/<br\s*\/?>/i);
    hero.innerHTML = '';
    hero.style.overflow = 'hidden';

    lines.forEach((line, li) => {
      const lineDiv = document.createElement('div');
      lineDiv.style.cssText = 'overflow:hidden;display:block;';
      // split into words
      const tempEl = document.createElement('span');
      tempEl.innerHTML = line;
      const text = tempEl.innerHTML;
      // wrap each word
      const words = text.split(/(\s+)/);
      words.forEach((word, wi) => {
        if (!word.trim()) { lineDiv.appendChild(document.createTextNode(word)); return; }
        const wrapper = document.createElement('span');
        wrapper.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
        const inner = document.createElement('span');
        inner.innerHTML = word;
        inner.style.cssText = 'display:inline-block;transform:translateY(100%);opacity:0;transition:transform .8s cubic-bezier(.16,1,.3,1),opacity .6s ease;transition-delay:' + ((li * 4 + wi) * 0.055 + 0.18) + 's;';
        wrapper.appendChild(inner);
        lineDiv.appendChild(wrapper);
      });
      hero.appendChild(lineDiv);
    });

    // Trigger after short delay
    setTimeout(() => {
      hero.querySelectorAll('span > span').forEach(el => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      });
    }, 60);
  }

  /* ── 5. COUNTER ANIMATION ── */
  function initCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stats = document.querySelectorAll('.stat-num');
    if (!stats.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const unit = el.querySelector('.stat-unit');
        const unitText = unit ? unit.outerHTML : '';
        // get just the number text
        const raw = el.textContent.replace(/[^0-9]/g, '');
        if (!raw) return;
        const target = parseInt(raw, 10);
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // ease out expo
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const val = Math.round(ease * target);
          el.innerHTML = val + unitText;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    stats.forEach(el => io.observe(el));
  }

  /* ── 6. MAGNETIC BUTTONS ── */
  function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.btn-gold, .btn-outline, .btn-black, .nav-cta').forEach(btn => {
      btn.style.transition = btn.style.transition + ',transform .35s cubic-bezier(.16,1,.3,1)';
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.22;
        const dy = (e.clientY - cy) * 0.22;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });
  }

  /* ── 7. GOLD RULE GROW ANIMATION ── */
  function initRuleGrow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.rule-gold').forEach(el => {
      el.style.width = '0';
      el.style.transition = 'none';
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          el.style.transition = 'width .9s cubic-bezier(.16,1,.3,1) .2s';
          el.style.width = '36px';
          io.unobserve(el);
        });
      }, { threshold: 0.8 });
      io.observe(el);
    });
  }

  /* ── 8. PARALLAX ON HERO BG ── */
  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bg = document.querySelector('.hero-bg');
    const noise = document.querySelector('.hero-noise');
    if (!bg) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (bg) bg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      if (noise) noise.style.transform = 'translateY(' + (y * 0.1) + 'px)';
    }, { passive: true });
  }

  /* ── 9. INDUSTRY CELL STAGGER ON SCROLL ── */
  function initIndHover() {
    // Already handled by CSS, but add a stagger entrance
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cells = document.querySelectorAll('.ind-cell, .sweps-grid .sw-item, .eeat-grid .eeat-cell');
    if (!cells.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // already handled by .reveal class - this adds micro bounce
          e.target.style.transition = (e.target.style.transition || '') + ',box-shadow .3s';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    cells.forEach(c => io.observe(c));
  }

  /* ── 10. TICKER SPEED ON SCROLL ── */
  function initTickerDynamics() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;
    let lastY = 0, velocity = 0, baseSpeed = 28;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      velocity = Math.abs(y - lastY);
      lastY = y;
      const speed = Math.max(8, baseSpeed - velocity * 0.4);
      track.style.animationDuration = speed + 's';
    }, { passive: true });
  }

  /* ── 11. SERVICE ROW ARROW REVEAL ── */
  function initServiceArrows() {
    document.querySelectorAll('.svc-row').forEach(row => {
      const arrow = document.createElement('div');
      arrow.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      arrow.style.cssText = 'position:absolute;right:0;top:50%;transform:translate(8px,-50%);opacity:0;transition:opacity .25s,transform .3s cubic-bezier(.16,1,.3,1);';
      row.style.position = 'relative';
      row.appendChild(arrow);
      row.addEventListener('mouseenter', () => { arrow.style.opacity='1'; arrow.style.transform='translate(0,-50%)'; });
      row.addEventListener('mouseleave', () => { arrow.style.opacity='0'; arrow.style.transform='translate(8px,-50%)'; });
    });
  }

  /* ── 12. PROCESS STEP NUMBER FILL ON SCROLL ── */
  function initStepNums() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.proc-n, .step-big-num, .p-num').forEach(el => {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            el.style.transition = 'color 1.2s cubic-bezier(.16,1,.3,1)';
            el.style.color = '#1a1a1a';
            setTimeout(() => { el.style.color = ''; }, 1200);
            io.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

  /* ── 13. GOLD LINE UNDERLINE on NAV hover ── */
  function initNavUnderlines() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const line = document.createElement('span');
      line.style.cssText = 'display:block;height:1px;background:#C9A96E;width:0;transition:width .3s cubic-bezier(.16,1,.3,1);margin-top:2px;';
      link.style.display = 'flex'; link.style.flexDirection = 'column';
      link.appendChild(line);
      link.addEventListener('mouseenter', () => { line.style.width = '100%'; });
      link.addEventListener('mouseleave', () => { if (!link.classList.contains('active')) line.style.width = '0'; });
      if (link.classList.contains('active')) line.style.width = '100%';
    });
  }

  /* ── 14. STAGGER GRID CHILDREN ── */
  function initGridStagger() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // For grids that don't already have reveal-d classes, add them
    const grids = document.querySelectorAll('.sweps-grid, .ind-grid, .proc-grid, .t-grid, .eeat-grid, .team-grid');
    grids.forEach(grid => {
      Array.from(grid.children).forEach((child, i) => {
        if (!child.classList.contains('reveal')) {
          child.classList.add('reveal');
          child.style.transitionDelay = (i % 4) * 0.08 + 's';
        }
      });
    });
  }

  /* ── 15. SECTION EYEBROW LETTER STAGGER ── */
  function initEyebrowAnim() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.eyebrow').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      el.style.overflow = 'hidden';
      [...text].forEach((char, i) => {
        const s = document.createElement('span');
        s.textContent = char === ' ' ? ' ' : char;
        s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(6px);transition:opacity .4s,transform .4s cubic-bezier(.16,1,.3,1);transition-delay:' + (i * 0.03) + 's;';
        el.appendChild(s);
      });
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            el.querySelectorAll('span').forEach(s => { s.style.opacity='1'; s.style.transform='translateY(0)'; });
            io.unobserve(el);
          }
        });
      }, { threshold: 0.9 });
      io.observe(el);
    });
  }

  /* ── INIT ── */
  function init() {
    initScrollProgress();
    initCursor();
    initPageLoad();
    initHeroSplit();
    initCounters();
    initMagneticButtons();
    initRuleGrow();
    initParallax();
    initIndHover();
    initTickerDynamics();
    initServiceArrows();
    initStepNums();
    initNavUnderlines();
    initGridStagger();
    initEyebrowAnim();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
