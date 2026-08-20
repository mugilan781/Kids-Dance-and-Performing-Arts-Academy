/* ============================================================
   MAIN.JS — Core initialization, Theme, RTL, Cookie banner
   ============================================================ */

'use strict';

// ── Theme Manager ─────────────────────────────────────────────
const ThemeManager = (() => {
  const KEY = 'kdpa_theme';
  const ROOT = document.documentElement;

  function getTheme() {
    return localStorage.getItem(KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function apply(theme) {
    ROOT.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    updateToggleIcon(theme);
  }

  function toggle() {
    const next = ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  }

  function updateToggleIcon(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.querySelector('.theme-icon-sun')?.classList.toggle('hidden', theme === 'light');
      btn.querySelector('.theme-icon-moon')?.classList.toggle('hidden', theme === 'dark');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function init() {
    apply(getTheme());
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light');
    });
  }

  return { init, toggle, getTheme };
})();

// ── RTL Manager ───────────────────────────────────────────────
const RTLManager = (() => {
  const KEY = 'kdpa_dir';

  function getDir() {
    return localStorage.getItem(KEY) || 'ltr';
  }

  function apply(dir) {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
    localStorage.setItem(KEY, dir);
    updateToggleState(dir);
  }

  function toggle() {
    const next = document.documentElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    apply(next);
  }

  function updateToggleState(dir) {
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', dir === 'rtl' ? 'true' : 'false');
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
      btn.title = dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL';
      const label = btn.querySelector('.rtl-label');
      if (label) label.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  function init() {
    apply(getDir());
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, getDir };
})();

// ── Cookie Banner ─────────────────────────────────────────────
const CookieBanner = (() => {
  const KEY = 'kdpa_cookies_accepted';

  function show() {
    const banner = document.getElementById('cookie-banner');
    if (!banner || localStorage.getItem(KEY)) return;
    setTimeout(() => banner.classList.add('visible'), 1500);
  }

  function accept() {
    localStorage.setItem(KEY, 'true');
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 500);
    }
  }

  function init() {
    show();
    document.getElementById('cookie-accept')?.addEventListener('click', accept);
    document.getElementById('cookie-decline')?.addEventListener('click', () => {
      const banner = document.getElementById('cookie-banner');
      if (banner) {
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => banner.remove(), 500);
      }
    });
  }

  return { init };
})();

// ── Page Transition ───────────────────────────────────────────
const PageTransition = (() => {
  let overlay;

  function init() {
    overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);

    // Intercept internal links
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') ||
          href.startsWith('tel') || link.target === '_blank' ||
          link.hasAttribute('data-no-transition')) return;

      const isSamePage = link.href === window.location.href;
      if (isSamePage) return;

      e.preventDefault();
      overlay.classList.add('entering');
      setTimeout(() => {
        window.location.href = href;
      }, 500);
    });

    // On load — exit animation
    window.addEventListener('pageshow', () => {
      overlay.classList.remove('entering');
    });
  }

  return { init };
})();

// ── Toast Notification ────────────────────────────────────────
const Toast = (() => {
  function show(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: `<svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--orchid)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeDown 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { show };
})();

// ── Button Ripple Effect ──────────────────────────────────────
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

// ── Smooth anchor scrolling ───────────────────────────────────
function initSmoothAnchor() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 80;
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ── DOM Ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  CookieBanner.init();
  PageTransition.init();
  initRipple();
  initSmoothAnchor();
});

// Expose globally
window.Artiste = window.ArtisteAcademy = window.KDPA = { ThemeManager, RTLManager, Toast };
