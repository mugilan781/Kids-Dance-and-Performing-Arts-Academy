/* ============================================================
   DASHBOARD.JS — Tab Switching, Charts, Calendar
   ============================================================ */

'use strict';

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
      color1 = '#54245F',
      color2 = '#C78B9B',
      maxValue = 100
    } = options;

    const bars = container.querySelector('.chart-area');
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
    render('attendance-chart', attendanceData);
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
  }

  return { init };
})();

// ── Donut Chart (SVG) ──────────────────────────────────────────
const DonutChart = (() => {
  function render(containerId, percentage, color = '#54245F') {
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

document.addEventListener('DOMContentLoaded', () => {
  DashboardSidebar.init();
  AttendanceChart.init();
  MiniCalendar.init();
  DashboardTabs.init();

  // Render donut chart if exists
  DonutChart.render('donut-chart', 87);
});

window.Artiste_Dashboard = window.KDPA_Dashboard = { AttendanceChart, MiniCalendar, DonutChart };
