/* ─── Entropy: Chaos → Order visualisation ─── */
(function () {
  'use strict';

  function initEntropy(canvasEl, size) {
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvasEl.width  = size * dpr;
    canvasEl.height = size * dpr;
    canvasEl.style.width  = size + 'px';
    canvasEl.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const COLOR = '#ffffff';

    function Particle(x, y, order) {
      this.x = x;
      this.y = y;
      this.originalX = x;
      this.originalY = y;
      this.size = 1.5;
      this.order = order;
      this.velocity = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      };
      this.influence = 0;
      this.neighbors = [];
    }

    Particle.prototype.update = function () {
      if (this.order) {
        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;
        const chaos = { x: 0, y: 0 };
        for (let i = 0; i < this.neighbors.length; i++) {
          const n = this.neighbors[i];
          if (!n.order) {
            const dist = Math.hypot(this.x - n.x, this.y - n.y);
            const str  = Math.max(0, 1 - dist / 100);
            chaos.x += n.velocity.x * str;
            chaos.y += n.velocity.y * str;
            this.influence = Math.max(this.influence, str);
          }
        }
        const t = this.influence;
        this.x += dx * 0.05 * (1 - t) + chaos.x * t;
        this.y += dy * 0.05 * (1 - t) + chaos.y * t;
        this.influence *= 0.99;
      } else {
        this.velocity.x += (Math.random() - 0.5) * 0.5;
        this.velocity.y += (Math.random() - 0.5) * 0.5;
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if (this.x < size / 2 || this.x > size) this.velocity.x *= -1;
        if (this.y < 0 || this.y > size)          this.velocity.y *= -1;
        this.x = Math.max(size / 2, Math.min(size, this.x));
        this.y = Math.max(0, Math.min(size, this.y));
      }
    };

    Particle.prototype.draw = function (ctx) {
      const alpha = this.order ? 0.85 - this.influence * 0.5 : 0.75;
      const hex   = Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = COLOR + hex;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    };

    // Build particle grid
    const particles = [];
    const gridSize  = 28;
    const spacing   = size / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = spacing * i + spacing / 2;
        const y = spacing * j + spacing / 2;
        particles.push(new Particle(x, y, x < size / 2));
      }
    }

    function updateNeighbors() {
      for (let a = 0; a < particles.length; a++) {
        particles[a].neighbors = [];
        for (let b = 0; b < particles.length; b++) {
          if (a === b) continue;
          if (Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y) < 100) {
            particles[a].neighbors.push(particles[b]);
          }
        }
      }
    }

    updateNeighbors();

    let tick = 0;
    let rafId;

    function animate() {
      ctx.clearRect(0, 0, size, size);

      if (tick % 30 === 0) updateNeighbors();

      // Draw connections first
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let k = 0; k < p.neighbors.length; k++) {
          const n = p.neighbors[k];
          const dist = Math.hypot(p.x - n.x, p.y - n.y);
          if (dist < 48) {
            const alpha = 0.18 * (1 - dist / 48);
            const hex   = Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.strokeStyle = COLOR + hex;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }

      // Dividing line — subtle vertical rule at centre
      ctx.strokeStyle = COLOR + '18';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.stroke();

      tick++;
      rafId = requestAnimationFrame(animate);
    }

    animate();

    return function destroy() {
      cancelAnimationFrame(rafId);
    };
  }

  // ── Mount on all [data-entropy] elements ──────────────────────────────────
  function mount() {
    document.querySelectorAll('[data-entropy]').forEach(function (el) {
      const size = parseInt(el.getAttribute('data-entropy-size') || '560', 10);
      const canvas = document.createElement('canvas');
      el.appendChild(canvas);
      initEntropy(canvas, size);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
