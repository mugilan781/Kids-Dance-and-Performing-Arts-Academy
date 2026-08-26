/* ============================================================
   DASHBOARD.JS — Tab Switching, Charts, Calendar
   ============================================================ */

'use strict';

// ── Theme-aware colors (dark-mode contrast) ─────────────────────
function themeIsDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}
function cssVarValue(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
function barPalette() {
  return themeIsDark()
    ? { color1: cssVarValue('--rose-gold', '#C78B9B'), color2: cssVarValue('--rose-gold-lt', '#D9A8B5') }
    : { color1: cssVarValue('--orchid', '#54245F'), color2: cssVarValue('--rose-gold', '#C78B9B') };
}
function ringColor() {
  return themeIsDark() ? cssVarValue('--rose-gold-lt', '#D9A8B5') : cssVarValue('--orchid', '#54245F');
}

// ── Sidebar Toggle (Mobile) ────────────────────────────────────
const DashboardSidebar = (() => {
  function init() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    toggleBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('open');
    });

    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  return { init };
})();

// ── Bar Chart (SVG-based) ──────────────────────────────────────
const AttendanceChart = (() => {
  function render(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      color1 = barPalette().color1,
      color2 = barPalette().color2,
      maxValue = 100
    } = options;

    const bars = container.classList.contains('chart-area')
      ? container
      : container.querySelector('.chart-area');
    if (!bars) return;

    bars.innerHTML = '';
    data.forEach(item => {
      const height = Math.round((item.value / maxValue) * 100);
      const group = document.createElement('div');
      group.className = 'chart-bar-group';
      group.innerHTML = `
        <div class="chart-bar" style="height: 0; background: linear-gradient(to top, ${color1}, ${color2});"
             data-target-height="${height}%" title="${item.label}: ${item.value}%"></div>
        <span class="chart-label">${item.label}</span>`;
      bars.appendChild(group);
    });

    // Animate bars in
    setTimeout(() => {
      container.querySelectorAll('.chart-bar').forEach(bar => {
        bar.style.height = bar.dataset.targetHeight;
      });
    }, 300);
  }

  function init() {
    const attendanceData = [
      { label: 'Mon', value: 95 },
      { label: 'Tue', value: 88 },
      { label: 'Wed', value: 100 },
      { label: 'Thu', value: 72 },
      { label: 'Fri', value: 90 },
      { label: 'Sat', value: 85 },
    ];
    render('attendance-chart-overview', attendanceData);
    render('attendance-chart-report', attendanceData);
  }

  return { init, render };
})();

// ── Mini Calendar ──────────────────────────────────────────────
const MiniCalendar = (() => {
  const eventDays = [3, 8, 14, 21, 28]; // days with events

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <button class="icon-btn" id="cal-prev" aria-label="Previous month">&#8592;</button>
        <strong style="font-family:var(--font-display);color:var(--text-primary)">
          ${monthNames[month]} ${year}
        </strong>
        <button class="icon-btn" id="cal-next" aria-label="Next month">&#8594;</button>
      </div>
      <div class="cal-grid">
    `;

    dayNames.forEach(d => {
      html += `<div class="cal-day header">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today;
      const isEvent = eventDays.includes(d);
      const cls = isToday ? 'today' : isEvent ? 'event' : '';
      const title = isEvent ? ` title="Class scheduled"` : '';
      html += `<div class="cal-day ${cls}"${title}${isEvent ? ' tabindex="0" role="button"' : ''}>${d}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function init() {
    render('mini-calendar');
  }

  return { init, render };
})();

// ── Dashboard Tab Navigation ────────────────────────────────────
const DashboardTabs = (() => {
  function init() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');

    function activate(id) {
      sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      sections.forEach(s => {
        s.hidden = s.id !== `section-${id}`;
        s.classList.toggle('active', s.id === `section-${id}`);
      });

      // Update page title
      const active = document.querySelector(`.sidebar-link[data-section="${id}"]`);
      const title = document.querySelector('.topbar-page-title');
      if (title && active) title.textContent = active.textContent.trim();
    }

    sidebarLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        activate(link.dataset.section);
      });
    });

    // Activate first
    if (sidebarLinks[0]) activate(sidebarLinks[0].dataset.section);

    // Deep-link support: dashboard.html#enrollment opens that section
    const hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`.sidebar-link[data-section="${hash}"]`)) {
      activate(hash);
    }
  }

  return { init };
})();

// ── Donut Chart (SVG) ──────────────────────────────────────────
const DonutChart = (() => {
  function render(containerId, percentage, color = ringColor()) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const r = 42;
    const circ = 2 * Math.PI * r;
    const dash = (percentage / 100) * circ;

    container.innerHTML = `
      <svg width="100" height="100" viewBox="0 0 100 100" aria-label="${percentage}% attendance">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--border-color)" stroke-width="10"/>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="10"
                stroke-dasharray="${dash} ${circ}"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
                style="transition: stroke-dasharray 1s var(--ease-out)"/>
        <text x="50" y="50" text-anchor="middle" dominant-baseline="middle"
              font-family="'Playfair Display', serif" font-size="18" font-weight="bold"
              fill="var(--text-primary)">${percentage}%</text>
      </svg>`;
  }

  return { render };
})();

// ── Enrollment Application Success ──────────────────────────────
function handleEnrollmentSuccess(form) {
  const ref = 'ENR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  // Add the new application to the Current Programs list
  const list = document.getElementById('current-enrollments');
  const programNames = {
    classical: 'Classical Dance', western: 'Western Dance', hiphop: 'Hip-Hop',
    ballet: 'Ballet', drama: 'Drama & Theater', music: 'Music'
  };
  const selected = Array.from(form.querySelectorAll('input[name="enf-program"]:checked'))
    .map(cb => programNames[cb.value] || cb.value);
  const childName = (document.getElementById('enf-child-name')?.value || '').trim() || 'New Student';
  const batch = document.getElementById('enf-batch')?.value || 'Batch TBD';

  if (list && selected.length) {
    const card = document.createElement('div');
    card.className = 'enrollment-card';
    card.style.animation = 'scaleIn 0.5s var(--ease-spring)';
    card.innerHTML = `
      <div class="enrollment-icon" style="background:rgba(199,139,155,0.15);color:var(--rose-gold);display:flex;align-items:center;justify-content:center;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>
      <div>
        <h4 style="font-family:var(--font-display);font-size:var(--text-lg);margin-bottom:4px;">${selected.join(', ')}</h4>
        <p style="font-size:var(--text-sm);color:var(--text-muted);">${childName} • ${batch}</p>
        <div style="margin-top:var(--space-3);display:flex;gap:var(--space-2);">
          <span class="badge badge-warning">Pending Confirmation</span>
          <span class="badge badge-orchid">Free Trial Class</span>
        </div>
      </div>`;
    list.prepend(card);
  }

  form.innerHTML = `
    <div style="text-align:center;padding:3rem 1rem;animation:scaleIn 0.5s var(--ease-spring);">
      <div class="success-icon" style="width:76px;height:76px;border-radius:50%;background:rgba(84,36,95,0.1);color:var(--orchid);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
        <svg class="icon-svg" style="width:38px;height:38px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h3 class="success-title" style="font-family:var(--font-display);font-size:var(--text-2xl);margin-bottom:0.5rem;color:var(--orchid);">
        Application Submitted!
      </h3>
      <p style="color:var(--text-muted);font-size:var(--text-sm);text-align:center;max-width:68ch;margin:0 auto var(--space-6);">
        Thank you! Our admissions team will contact you within 24 hours to confirm your child's free trial class.
      </p>
      <div class="success-ref" style="display:inline-block;padding:var(--space-2) var(--space-5);border:1.5px dashed var(--orchid);border-radius:var(--radius-lg);font-weight:700;color:var(--orchid);letter-spacing:0.05em;margin-bottom:var(--space-6);">
        Application Reference: ${ref}
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);max-width:420px;margin:0 auto var(--space-8);text-align:left;font-size:var(--text-sm);">
        <div style="display:flex;gap:var(--space-3);align-items:flex-start;">
          <span class="success-icon-sm" style="color:var(--orchid);display:inline-flex;margin-top:2px;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3C5.13 3 2 6.13 2 10c0 4.5 4 8 7 8 1.13 0 2.2-.4 3-1.07"/><path d="M5.5 8.5c.5-.5 1.5-.5 2 0"/><path d="M10.5 8.5c.5-.5 1.5-.5 2 0"/><path d="M6 13c1.5 2 4.5 2 6 0"/><path d="M15 6.5C18.87 6.5 22 9.63 22 13.5c0 4.5-4 8-7 8-1.5 0-2.8-.5-3.8-1.4"/><path d="M14 12c.5.5 1.5.5 2 0"/><path d="M18.5 12c.5.5 1.5.5 2 0"/><path d="M14 17.5c1.5-1.5 4.5-1.5 6 0"/></svg></span>
          <span style="color:var(--text-secondary);">Free trial class will be scheduled at your preferred batch timing.</span>
        </div>
        <div style="display:flex;gap:var(--space-3);align-items:flex-start;">
          <span class="success-phone" style="color:var(--orchid);display:inline-flex;margin-top:2px;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
          <span style="color:var(--text-secondary);">Questions? Call admissions at <strong>+91 44 1234 5678</strong>.</span>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;">
        <button type="button" class="btn btn-primary" onclick="document.querySelector('[data-section=overview]').click()">
          Back to Dashboard Overview
        </button>
        <button type="button" class="btn btn-secondary" onclick="window.location.reload()">
          Submit Another Application
        </button>
      </div>
    </div>`;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Theme Sync: re-render charts when dark/light toggles ───────
function initThemeSync() {
  const observer = new MutationObserver(() => {
    if (document.getElementById('attendance-chart-overview') || document.getElementById('attendance-chart-report')) {
      AttendanceChart.init();
    }
    if (document.getElementById('donut-chart')) DonutChart.render('donut-chart', 87);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

document.addEventListener('DOMContentLoaded', () => {
  DashboardSidebar.init();
  AttendanceChart.init();
  MiniCalendar.init();
  DashboardTabs.init();

  // Render donut chart if exists
  DonutChart.render('donut-chart', 87);

  initThemeSync();
});

window.Artiste_Dashboard = window.KDPA_Dashboard = { AttendanceChart, MiniCalendar, DonutChart };
