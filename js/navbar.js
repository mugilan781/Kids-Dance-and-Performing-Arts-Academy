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

    if (!navbar) return;

    // Initial transparent state on hero pages
    if (navbar.dataset.transparent === 'true') {
      navbar.classList.add('transparent');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    hamburger?.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    // Close drawer
    drawerOverlay?.addEventListener('click', closeDrawer);
    document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);

    // Close drawer on link click
    document.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Profile dropdown — click toggle (touch friendly)
    const profileMenu = document.querySelector('.profile-menu');
    const profileBtn = document.querySelector('.profile-btn');
    function closeProfile() {
      profileMenu?.classList.remove('open');
      profileBtn?.setAttribute('aria-expanded', 'false');
    }
    profileBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const open = profileMenu.classList.toggle('open');
      profileBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => {
      if (profileMenu && !profileMenu.contains(e.target)) closeProfile();
    });

    // Keyboard ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDrawer(); closeProfile(); }
    });

    setActiveLink();
  }

  return { init, openDrawer, closeDrawer };
})();

document.addEventListener('DOMContentLoaded', () => Navbar.init());
