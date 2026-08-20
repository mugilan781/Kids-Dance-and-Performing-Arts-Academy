/* ============================================================
   HERO-SLIDER.JS — Full-Screen Auto-Play Carousel
   ============================================================ */

'use strict';

const HeroSlider = (() => {
  let slides, dots, current = 0, timer, isPlaying = true;
  const INTERVAL = 6000;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function initTouch() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let startX = 0;
    hero.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    });
  }

  function init() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    slides = Array.from(slider.querySelectorAll('.hero-slide'));
    dots = Array.from(document.querySelectorAll('.hero-dot'));

    if (!slides.length) return;

    // Set first slide
    slides[0].classList.add('active');
    dots[0]?.classList.add('active');

    // Dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startTimer();
      });
    });

    // Arrow buttons
    document.querySelector('.hero-arrow-prev')?.addEventListener('click', () => {
      prev(); startTimer();
    });
    document.querySelector('.hero-arrow-next')?.addEventListener('click', () => {
      next(); startTimer();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { prev(); startTimer(); }
      if (e.key === 'ArrowRight') { next(); startTimer(); }
    });

    // Pause on hover
    const heroEl = document.querySelector('.hero');
    heroEl?.addEventListener('mouseenter', stopTimer);
    heroEl?.addEventListener('mouseleave', startTimer);

    // Touch
    initTouch();

    // Auto-play
    startTimer();
  }

  return { init, next, prev, goTo };
})();

document.addEventListener('DOMContentLoaded', () => HeroSlider.init());
