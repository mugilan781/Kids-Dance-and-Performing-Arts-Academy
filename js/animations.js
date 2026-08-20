/* ============================================================
   ANIMATIONS.JS — Scroll Reveal, Counter, Parallax, Marquee
   ============================================================ */

'use strict';

// ── Scroll Reveal ──────────────────────────────────────────────
const ScrollReveal = (() => {
  let observer;

  function init() {
    const opts = {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // For stagger groups, keep observing to re-trigger
          if (!entry.target.classList.contains('stagger-children')) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, opts);

    document.querySelectorAll('.reveal, .stagger-children').forEach(el => {
      observer.observe(el);
    });
  }

  function observe(el) {
    observer?.observe(el);
  }

  return { init, observe };
})();

// ── Animated Counter ──────────────────────────────────────────
const CounterAnimation = (() => {
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g, ''), 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = parseInt(el.dataset.duration || '2000', 10);
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(easeOut(progress) * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => {
      observer.observe(el);
    });
  }

  return { init };
})();

// ── Parallax ──────────────────────────────────────────────────
const Parallax = (() => {
  let elements = [];

  function onScroll() {
    const scrollY = window.scrollY;
    elements.forEach(({ el, speed, initialY }) => {
      const rect = el.parentElement.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!isVisible) return;
      const offset = (scrollY - initialY) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }

  function init() {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax || '0.3');
      const initialY = el.parentElement.getBoundingClientRect().top + window.scrollY;
      elements.push({ el, speed, initialY });
    });

    if (elements.length) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  return { init };
})();

// ── Marquee ───────────────────────────────────────────────────
const Marquee = (() => {
  function init() {
    document.querySelectorAll('.marquee-track').forEach(track => {
      // Duplicate content for seamless loop
      const content = track.innerHTML;
      track.innerHTML = content + content;
    });
  }

  return { init };
})();

// ── Image Zoom (hover) ─────────────────────────────────────────
// CSS handles zoom, but JS adds lightbox for gallery
const Lightbox = (() => {
  let overlay, img, currentIndex = 0;
  let images = [];

  function open(src, alt, idx) {
    currentIndex = idx;
    overlay.querySelector('.lightbox-img').src = src;
    overlay.querySelector('.lightbox-img').alt = alt || '';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCounter();
  }

  function close() {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    const item = images[currentIndex];
    overlay.querySelector('.lightbox-img').src = item.src;
    overlay.querySelector('.lightbox-img').alt = item.alt || '';
    updateCounter();
  }

  function next() {
    currentIndex = (currentIndex + 1) % images.length;
    const item = images[currentIndex];
    overlay.querySelector('.lightbox-img').src = item.src;
    overlay.querySelector('.lightbox-img').alt = item.alt || '';
    updateCounter();
  }

  function updateCounter() {
    const counter = overlay.querySelector('.lightbox-counter');
    if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function init() {
    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
      <div class="lightbox-inner" role="document">
        <button class="lightbox-close modal-close" aria-label="Close lightbox"><svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <button class="lightbox-prev hero-arrow" aria-label="Previous image">&#8592;</button>
        <img class="lightbox-img" src="" alt="" />
        <button class="lightbox-next hero-arrow" aria-label="Next image">&#8594;</button>
        <div class="lightbox-counter" aria-live="polite"></div>
      </div>`;

    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.92);
      z-index: 9000;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 16px;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s;
    `;
    overlay.querySelector('.lightbox-inner').style.cssText = `
      position: relative;
      display: flex; align-items: center; justify-content: center;
      max-width: 90vw; max-height: 85vh;
      gap: 16px;
    `;
    overlay.querySelector('.lightbox-img').style.cssText = `
      max-width: 80vw; max-height: 80vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 20px 80px rgba(0,0,0,0.5);
    `;
    overlay.querySelector('.lightbox-close').style.cssText = `
      position: absolute; top: -48px; right: 0;
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
      color: #fff; border-radius: 50%; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1.1rem; z-index: 1;
    `;
    overlay.querySelector('.lightbox-counter').style.cssText = `
      position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.6); font-size: 0.8rem;
    `;
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');
    [prevBtn, nextBtn].forEach(btn => {
      btn.style.cssText = `
        flex-shrink: 0; width: 44px; height: 44px;
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        color: #fff; border-radius: 50%; display: flex;
        align-items: center; justify-content: center; cursor: pointer;
        font-size: 1.1rem; transition: background 0.2s;
      `;
    });

    document.body.appendChild(overlay);

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev').addEventListener('click', prev);
    overlay.querySelector('.lightbox-next').addEventListener('click', next);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Hook into gallery images
    document.querySelectorAll('[data-lightbox]').forEach((el, idx) => {
      images.push({ src: el.querySelector('img')?.src || el.src, alt: el.alt || el.dataset.alt || '' });
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', () => {
        open(images[idx].src, images[idx].alt, idx);
      });
    });
  }

  return { init, open, close };
})();

// ── Tabs ──────────────────────────────────────────────────────
const Tabs = (() => {
  function init() {
    document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
      const triggers = tabGroup.querySelectorAll('[data-tab-trigger]');
      const panels = tabGroup.querySelectorAll('[data-tab-panel]');

      function activate(id) {
        triggers.forEach(t => t.classList.toggle('active', t.dataset.tabTrigger === id));
        panels.forEach(p => {
          const active = p.dataset.tabPanel === id;
          p.classList.toggle('active', active);
          p.hidden = !active;
        });
      }

      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => activate(trigger.dataset.tabTrigger));
      });

      // Activate first
      if (triggers[0]) activate(triggers[0].dataset.tabTrigger);
    });
  }

  return { init };
})();

// ── FAQ Accordion ─────────────────────────────────────────────
const FAQ = (() => {
  function init() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.accordion-item.open').forEach(openItem => {
          if (openItem !== item) openItem.classList.remove('open');
        });

        // Toggle current
        item.classList.toggle('open', !isOpen);
      });
    });
  }

  return { init };
})();

// ── Init All ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ScrollReveal.init();
  CounterAnimation.init();
  Parallax.init();
  Marquee.init();
  Lightbox.init();
  Tabs.init();
  FAQ.init();
});

window.Artiste_Anim = window.KDPA_Anim = { ScrollReveal, CounterAnimation, Lightbox, FAQ };
