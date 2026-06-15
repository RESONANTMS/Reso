/* ─── Mobile navigation overlay ─── */
(function () {
  'use strict';

  function initMobileNav() {
    const toggle  = document.getElementById('mob-toggle');
    const overlay = document.getElementById('mob-overlay');
    const close   = document.getElementById('mob-close');
    const svcBtn  = document.getElementById('mob-svc-btn');
    const svcSub  = document.getElementById('mob-svc-sub');

    if (!toggle || !overlay) return;

    function open() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
    }
    function shut() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      overlay.classList.contains('open') ? shut() : open();
    });
    if (close) close.addEventListener('click', shut);

    // Services accordion
    if (svcBtn && svcSub) {
      svcBtn.addEventListener('click', function () {
        const expanded = svcSub.classList.toggle('open');
        svcBtn.querySelector('.mob-svc-arrow').style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }

    // Close on any link click
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', shut);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') shut();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
