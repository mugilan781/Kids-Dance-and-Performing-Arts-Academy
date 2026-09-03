/* ============================================================
   NAVBAR.JS — Sticky, Mobile Drawer
   ============================================================ */

'use strict';

const Navbar = (() => {
  let navbar, drawer, drawerOverlay, hamburger;

  function onScroll() {
    const current = window.scrollY;

    // Transparent → scrolled
    if (current > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      if (navbar.dataset.transparent === 'true') {
        navbar.classList.add('transparent');
      }
    }
  }

  function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  function setActiveLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === path || href === './' + path)) {
        link.classList.add('active');
      }
    });
  }

  function init() {
    navbar = document.querySelector('.navbar');
    drawer = document.getElementById('mobile-drawer');
    drawerOverlay = document.getElementById('drawer-overlay');
    hamburger = document.getElementById('nav-hamburger');

    if (navbar) {
      // Initial transparent state on hero pages
      if (navbar.dataset.transparent === 'true') {
        navbar.classList.add('transparent');
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Hamburger
      hamburger?.addEventListener('click', () => {
        drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
      });

      // Close drawer
      drawerOverlay?.addEventListener('click', closeDrawer);
      document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);

      // Close drawer on link click
      document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
      });
    }

    // Profile dropdown — click toggle (touch friendly, supports all pages & dashboards)
    document.querySelectorAll('.profile-menu').forEach(menu => {
      const btn = menu.querySelector('.profile-btn');
      function closeProfile() {
        menu.classList.remove('open');
        btn?.setAttribute('aria-expanded', 'false');
      }
      btn?.addEventListener('click', e => {
        e.stopPropagation();
        const open = menu.classList.toggle('open');
        btn?.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', e => {
        if (!menu.contains(e.target)) closeProfile();
      });
    });

    // Keyboard ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDrawer();
        document.querySelectorAll('.profile-menu').forEach(m => {
          m.classList.remove('open');
          m.querySelector('.profile-btn')?.setAttribute('aria-expanded', 'false');
        });
      }
    });

    setActiveLink();
  }

  return { init, openDrawer, closeDrawer };
})();

document.addEventListener('DOMContentLoaded', () => Navbar.init());
