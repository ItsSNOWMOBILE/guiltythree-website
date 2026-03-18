/* Guiltythree — Shadow Slave | main.js */

    /* ── CUSTOM CURSOR ─────────────────────────────────────── */
    const cursorEl  = document.getElementById('cursor');
    const trailEl   = document.getElementById('cursorTrail');
    let mx = 0, my = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursorEl.style.left = mx - 4 + 'px';
      cursorEl.style.top  = my - 4 + 'px';
    });

    (function animTrail() {
      tx += (mx - tx) * 0.11;
      ty += (my - ty) * 0.11;
      trailEl.style.left = tx - 16 + 'px';
      trailEl.style.top  = ty - 16 + 'px';
      requestAnimationFrame(animTrail);
    })();

    document.querySelectorAll('a, button, .about-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorEl.style.transform = 'scale(2.8)';
        cursorEl.style.background = 'var(--gold)';
        trailEl.style.borderColor = 'rgba(201,168,76,0.65)';
        trailEl.style.transform = 'scale(1.6)';
      });
      el.addEventListener('mouseleave', () => {
        cursorEl.style.transform = 'scale(1)';
        cursorEl.style.background = 'var(--crimson)';
        trailEl.style.borderColor = 'rgba(201,168,76,0.45)';
        trailEl.style.transform = 'scale(1)';
      });
    });

    /* ── PROGRESS BAR ──────────────────────────────────────── */
    const progressBar = document.getElementById('progressBar');
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      progressBar.style.width = pct + '%';
    }, { passive: true });

    /* ── NAV SCROLL ────────────────────────────────────────── */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 70);
    }, { passive: true });

    /* ── SCROLL REVEAL ─────────────────────────────────────── */
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    /* ── PARTICLE SYSTEM ───────────────────────────────────── */
    const canvas = document.getElementById('particle-canvas');
    const ctx    = canvas.getContext('2d');
    let W = 0, H = 0;
    let pmx = null, pmy = null;

    function resizeCanvas() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('mousemove', e => { pmx = e.clientX; pmy = e.clientY; }, { passive: true });

    class Particle {
      constructor() { this.init(true); }

      init(scatter = false) {
        this.x  = Math.random() * W;
        this.y  = scatter ? Math.random() * H : H + Math.random() * 80;
        this.r  = Math.random() * 2 + 0.4;
        this.vy = -(Math.random() * 0.45 + 0.18);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.alpha    = 0;
        this.maxAlpha = Math.random() * 0.45 + 0.1;
        this.isEmber  = Math.random() < 0.14;
        this.life     = 0;
        this.lifespan = Math.random() * 380 + 180;
        this.wobble   = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.018 + 0.006;
      }

      tick() {
        this.life++;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.28;
        this.y += this.vy;

        // mouse repulsion
        if (pmx !== null) {
          const dx = this.x - pmx, dy = this.y - pmy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            this.x += (dx / dist) * 0.9;
            this.y += (dy / dist) * 0.9;
          }
        }

        // fade in/out
        const t = this.life / this.lifespan;
        if (t < 0.12)       this.alpha = this.maxAlpha * (t / 0.12);
        else if (t > 0.72)  this.alpha = this.maxAlpha * (1 - (t - 0.72) / 0.28);
        else                this.alpha = this.maxAlpha;

        if (this.isEmber) this.alpha *= 0.7 + 0.3 * Math.sin(this.life * 0.04 + this.wobble);

        if (this.life >= this.lifespan || this.y < -20) this.init(false);
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        if (this.isEmber) {
          ctx.shadowBlur  = 9;
          ctx.shadowColor = 'rgba(200,70,10,0.85)';
          ctx.fillStyle   = 'rgba(225,105,35,1)';
        } else {
          ctx.shadowBlur  = 0;
          ctx.fillStyle   = 'rgba(130,110,155,0.7)';
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const PARTICLE_COUNT = 140;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) { p.tick(); p.draw(); }
      requestAnimationFrame(loop);
    })();

    /* ── BUTTON RIPPLE ──────────────────────────────────────── */
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const r = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (e.clientX - r.left - 3) + 'px';
        ripple.style.top  = (e.clientY - r.top  - 3) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });

    /* ── NAV ACTIVE SECTION ─────────────────────────────────── */
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => sectionObs.observe(s));

    /* ── COUNT-UP ANIMATION ─────────────────────────────────── */
    function animateCount(el, target, suffix) {
      const duration = 1600;
      const start = performance.now();
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
        const current = Math.round(ease * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(update);
    }

    const countObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        // For the community big span, only animate the number part
        if (el.classList.contains('community-big')) {
          el.innerHTML = '0<em>' + suffix + '</em>';
          const startT = performance.now();
          const dur = 1800;
          const tick = now => {
            const p = Math.min((now - startT) / dur, 1);
            const val = Math.round((1 - Math.pow(1-p, 3)) * target);
            el.innerHTML = val + `<em>${suffix}</em>`;
            if (p < 1) requestAnimationFrame(tick);
            else el.innerHTML = target + `<em>${suffix}</em>`;
          };
          requestAnimationFrame(tick);
        } else {
          animateCount(el, target, suffix);
        }
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

    /* ── BOOK TILT ─────────────────────────────────────────── */
    const book3d   = document.getElementById('book3d');
    const showcase = book3d && book3d.closest('.book-outer');

    if (showcase) {
      let currentRotY = -28, currentRotX = 5;
      let targetRotY  = -28, targetRotX  = 5;
      let rafId = null;
      let isHovering = false;

      function lerp(a, b, t) { return a + (b - a) * t; }

      function tickBook() {
        currentRotY = lerp(currentRotY, targetRotY, 0.07);
        currentRotX = lerp(currentRotX, targetRotX, 0.07);
        book3d.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg)`;

        const stillMoving =
          Math.abs(currentRotY - targetRotY) > 0.01 ||
          Math.abs(currentRotX - targetRotX) > 0.01;

        if (stillMoving || isHovering) {
          rafId = requestAnimationFrame(tickBook);
        } else {
          // Settled back to resting — hand off to CSS animation
          book3d.style.transform = '';
          book3d.style.animation = 'bookFloat 7s ease-in-out infinite';
          rafId = null;
        }
      }

      showcase.addEventListener('mousemove', e => {
        const r  = book3d.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) / (r.width  / 2);
        const dy = (e.clientY - cy) / (r.height / 2);

        targetRotY = -28 + dx * 22;
        targetRotX =   5 - dy * 12;

        if (!isHovering) {
          isHovering = true;
          book3d.style.animation = 'none';
          if (!rafId) rafId = requestAnimationFrame(tickBook);
        }
      });

      showcase.addEventListener('mouseleave', () => {
        isHovering = false;
        targetRotY = -28;
        targetRotX = 5;
        if (!rafId) rafId = requestAnimationFrame(tickBook);
      });
    }
