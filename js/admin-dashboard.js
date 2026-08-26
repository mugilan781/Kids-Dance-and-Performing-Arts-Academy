/* ============================================================
   ADMIN-DASHBOARD.JS — Students, Enrollments, Batches, Faculty,
   Attendance, Events, Payments, Announcements, Reports
   ============================================================ */

'use strict';

/* ── Helpers ─────────────────────────────────────────── */
function adminThemeIsDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}
function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
function barPalette() {
  return adminThemeIsDark()
    ? { c1: cssVar('--rose-gold', '#C78B9B'), c2: cssVar('--rose-gold-lt', '#D9A8B5') }
    : { c1: cssVar('--orchid', '#54245F'), c2: cssVar('--rose-gold', '#C78B9B') };
}
function notify(message, type = 'info') {
  if (window.Artiste && window.Artiste.Toast) window.Artiste.Toast.show(message, type);
}
const rupees = n => '₹' + Number(n).toLocaleString('en-IN');

/* ── Bar Chart (SVG-free, CSS bars) ──────────────────── */
function renderBarChart(containerId, data, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const { c1, c2 } = barPalette();
  const maxValue = opts.maxValue || Math.max(...data.map(d => d.value)) * 1.15;
  container.innerHTML = '';
  data.forEach(item => {
    const height = Math.round((item.value / maxValue) * 100);
    const group = document.createElement('div');
    group.className = 'chart-bar-group';
    group.innerHTML = `
      <div class="chart-bar" style="height:0;background:linear-gradient(to top, ${c1}, ${c2});"
           data-target-height="${height}%" title="${item.label}: ${opts.prefix || ''}${item.value}${opts.suffix || ''}"></div>
      <span class="chart-label">${item.label}</span>`;
    container.appendChild(group);
  });
  setTimeout(() => {
    container.querySelectorAll('.chart-bar').forEach(bar => {
      bar.style.height = bar.dataset.targetHeight;
    });
  }, 300);
}

/* ── Donut Chart ─────────────────────────────────────── */
function renderDonut(containerId, percentage, label) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const color = adminThemeIsDark() ? cssVar('--rose-gold-lt', '#D9A8B5') : cssVar('--orchid', '#54245F');
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  container.innerHTML = `
    <svg width="130" height="130" viewBox="0 0 100 100" role="img" aria-label="${percentage}% — ${label}">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--border-color)" stroke-width="10"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="10"
              stroke-dasharray="${dash} ${circ}" stroke-linecap="round"
              transform="rotate(-90 50 50)" style="transition:stroke-dasharray 1s var(--ease-out)"/>
      <text x="50" y="50" text-anchor="middle" dominant-baseline="middle"
            font-family="'Playfair Display', serif" font-size="17" font-weight="bold"
            fill="var(--text-primary)">${percentage}%</text>
    </svg>`;
}

/* ── Mini Calendar ───────────────────────────────────── */
const AdminCalendar = (() => {
  const eventDays = [3, 8, 14, 21, 28];
  function render() {
    const container = document.getElementById('admin-calendar');
    const badge = document.getElementById('cal-month-badge');
    if (!container) return;
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (badge) badge.textContent = `${monthNames[month]} ${year}`;
    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = '<div class="cal-grid">';
    dayNames.forEach(d => { html += `<div class="cal-day header">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const cls = d === today ? 'today' : eventDays.includes(d) ? 'event' : '';
      const title = eventDays.includes(d) ? ' title="Class scheduled"' : '';
      html += `<div class="cal-day ${cls}"${title}${eventDays.includes(d) ? ' tabindex="0" role="button"' : ''}>${d}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
  }
  return { render };
})();

/* ── Data ────────────────────────────────────────────── */
const state = {
  students: [
    { id: 1, name: 'Meera Sharma',  age: 9,  programs: 'Classical Dance, Drama & Theater', batch: 'Mid-Stars',    parent: 'Ananya Sharma', phone: '+91 98765 43210' },
    { id: 2, name: 'Arjun Verma',   age: 13, programs: 'Western Dance',                    batch: 'Senior Stars', parent: 'Rekha Verma',   phone: '+91 98220 11002' },
    { id: 3, name: 'Sanvi Reddy',   age: 7,  programs: 'Ballet',                           batch: 'Junior Stars', parent: 'Sunita Reddy',  phone: '+91 99860 23341' },
    { id: 4, name: 'Kabir Singh',   age: 15, programs: 'Hip-Hop, Music',                   batch: 'Senior Stars', parent: 'Manpreet Singh',phone: '+91 90190 55467' },
    { id: 5, name: 'Anika Iyer',    age: 5,  programs: 'Classical Dance',                  batch: 'Little Stars', parent: 'Divya Iyer',    phone: '+91 97401 88231' },
    { id: 6, name: 'Riya Kapoor',   age: 8,  programs: 'Drama & Theater',                  batch: 'Junior Stars', parent: 'Neha Kapoor',   phone: '+91 96320 77412' },
    { id: 7, name: 'Ishaan Gupta',  age: 6,  programs: 'Western Dance',                    batch: 'Little Stars', parent: 'Amit Gupta',    phone: '+91 95350 66289' },
    { id: 8, name: 'Tara Mishra',   age: 14, programs: 'Classical Dance, Music',           batch: 'Senior Stars', parent: 'Kavita Mishra', phone: '+91 94480 33905' }
  ],
  nextId: 9,
  payments: [
    { student: 'Meera Sharma', batch: 'Mid-Stars',    amount: 9500, due: 'Nov 30, 2025', status: 'Paid' },
    { student: 'Arjun Verma',  batch: 'Senior Stars', amount: 9500, due: 'Nov 30, 2025', status: 'Paid' },
    { student: 'Anika Iyer',   batch: 'Little Stars', amount: 9500, due: 'Nov 30, 2025', status: 'Paid' },
    { student: 'Sanvi Reddy',  batch: 'Junior Stars', amount: 3500, due: 'Nov 30, 2025', status: 'Pending' },
    { student: 'Kabir Singh',  batch: 'Senior Stars', amount: 9500, due: 'Nov 20, 2025', status: 'Overdue' }
  ],
  applications: [
    { id: 'APP-1042', child: 'Aarav Patel',    age: 6,  program: 'Hip-Hop',         parent: 'Rohit Patel',      phone: '+91 98450 77120', date: 'Nov 24, 2025', status: 'pending' },
    { id: 'APP-1043', child: 'Diya Krishnan',  age: 9,  program: 'Classical Dance', parent: 'Lakshmi Krishnan', phone: '+91 99010 48226', date: 'Nov 25, 2025', status: 'pending' },
    { id: 'APP-1044', child: 'Advait Nair',    age: 12, program: 'Western Dance',   parent: 'Suresh Nair',      phone: '+91 96860 91573', date: 'Nov 26, 2025', status: 'pending' }
  ],
  attendance: {}, // key: batch|student → 'p' | 'a' | 'l'
  announcementsSent: 0,
  revenue: {
    '2025': [
      { label: 'Sep', value: 84000 }, { label: 'Oct', value: 91000 },
      { label: 'Nov', value: 96500 }, { label: 'Dec', value: 22000 }
    ],
    '2024': [
      { label: 'Sep', value: 72000 }, { label: 'Oct', value: 78500 },
      { label: 'Nov', value: 84000 }, { label: 'Dec', value: 30500 }
    ]
  }
};

const BATCH_BY_AGE = a =>
  a <= 6 ? 'Little Stars' : a <= 8 ? 'Junior Stars' : a <= 11 ? 'Mid-Stars' : 'Senior Stars';

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ── Sidebar (mobile) ────────────────────────────────── */
const AdminSidebar = (() => {
  function init() {
    const sidebar = $('#dashboard-sidebar');
    const overlay = $('#sidebar-overlay');
    $('#sidebar-toggle')?.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      overlay.classList.toggle('open', open);
      $('#sidebar-toggle').setAttribute('aria-expanded', open);
    });
    overlay?.addEventListener('click', close);
    function close() {
      sidebar.classList.remove('open');
      overlay?.classList.remove('open');
      $('#sidebar-toggle')?.setAttribute('aria-expanded', 'false');
    }
    return { close };
  }
  return { init };
})();

/* ── Tabs / Sections ─────────────────────────────────── */
const AdminTabs = (() => {
  let sidebarClose = null;

  function activate(id, pushHash = true) {
    $$('.sidebar-link[data-section]').forEach(l =>
      l.classList.toggle('active', l.dataset.section === id));
    $$('.dashboard-section').forEach(s => {
      s.hidden = s.id !== `section-${id}`;
      s.classList.toggle('active', s.id === `section-${id}`);
    });
    const active = $(`.sidebar-link[data-section="${id}"]`);
    if (active) $('#topbar-title').textContent = active.dataset.label || active.textContent.trim();
    if (pushHash) history.replaceState(null, '', '#' + id);
    sidebarClose?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'reports') renderReports();
  }

  function init() {
    sidebarClose = AdminSidebar.init().close;

    $$('.sidebar-link[data-section]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        activate(link.dataset.section);
      });
    });

    // Quick-action buttons that jump to a section
    $$('[data-goto]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        activate(btn.dataset.goto);
      });
    });

    // Deep-link support: admin-dashboard.html#students
    const hash = window.location.hash.replace('#', '');
    if (hash && $(`.sidebar-link[data-section="${hash}"]`)) activate(hash, false);
  }
  return { init, activate };
})();

/* ── Modals ──────────────────────────────────────────── */
const Modals = (() => {
  function open(id) {
    const m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m) return;
    m.classList.add('open');
    m.querySelector('.form-control')?.focus();
  }
  function close(m) {
    (typeof m === 'string' ? document.getElementById(m) : m)?.classList.remove('open');
  }
  function init() {
    $$('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', () => open(btn.dataset.openModal));
    });
    $$('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => close(btn.closest('.modal-overlay')));
    });
    $$('.modal-overlay').forEach(ov => {
      ov.addEventListener('click', e => { if (e.target === ov) close(ov); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') $$('.modal-overlay.open').forEach(close);
    });
  }
  return { init, open, close };
})();

/* ── Students ────────────────────────────────────────── */
const Students = (() => {
  function initials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
  function matches(s) {
    const q = ($('#student-search').value || '').toLowerCase().trim();
    const b = $('#student-batch-filter').value;
    const okQ = !q || s.name.toLowerCase().includes(q) || s.parent.toLowerCase().includes(q);
    const okB = !b || s.batch === b;
    return okQ && okB;
  }
  function renderRow(s) {
    return `
      <tr data-id="${s.id}">
        <td><div class="student-cell">
          <span class="student-avatar" aria-hidden="true">${initials(s.name)}</span>
          <strong>${s.name}</strong></div></td>
        <td>${s.age}</td>
        <td>${s.programs}</td>
        <td>${s.batch}</td>
        <td>${s.parent}<br><span style="color:var(--text-muted);font-size:var(--text-xs);">${s.phone}</span></td>
        <td><span class="badge badge-success">Active</span></td>
        <td><div class="table-actions">
          <button class="icon-btn" data-act="view" title="View" aria-label="View ${s.name}"><svg class="icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button class="icon-btn" data-act="edit" title="Edit" aria-label="Edit ${s.name}"><svg class="icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg></button>
          <button class="icon-btn" data-act="delete" title="Remove" aria-label="Remove ${s.name}"><svg class="icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div></td>
      </tr>`;
  }
  function render() {
    const tbody = $('#students-tbody');
    const list = state.students.filter(matches);
    tbody.innerHTML = list.map(renderRow).join('');
    $('#students-empty-note').hidden = list.length > 0;
    $('#students-count').textContent = list.length;
    $('#kpi-students').textContent = state.students.length;
  }
  function init() {
    render();
    $('#student-search').addEventListener('input', render);
    $('#student-batch-filter').addEventListener('change', render);

    $('#students-tbody').addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const tr = btn.closest('tr');
      const student = state.students.find(s => s.id === Number(tr.dataset.id));
      if (!student) return;

      if (btn.dataset.act === 'view') {
        $('#modal-view-title').textContent = student.name;
        $('#modal-view-body').innerHTML = `
          <table style="width:100%;font-size:var(--text-sm);">
            <tbody>
              <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0;color:var(--text-muted);">Student</td><td style="padding:10px 0;font-weight:600;">${student.name}</td></tr>
              <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0;color:var(--text-muted);">Age</td><td style="padding:10px 0;font-weight:600;">${student.age}</td></tr>
              <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0;color:var(--text-muted);">Batch</td><td style="padding:10px 0;font-weight:600;">${student.batch}</td></tr>
              <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0;color:var(--text-muted);">Programs</td><td style="padding:10px 0;font-weight:600;">${student.programs}</td></tr>
              <tr style="border-bottom:1px solid var(--border-color);"><td style="padding:10px 0;color:var(--text-muted);">Parent</td><td style="padding:10px 0;font-weight:600;">${student.parent}</td></tr>
              <tr><td style="padding:10px 0;color:var(--text-muted);">Phone</td><td style="padding:10px 0;font-weight:600;">${student.phone}</td></tr>
            </tbody>
          </table>`;
        Modals.open('modal-view');

      } else if (btn.dataset.act === 'edit') {
        $('#modal-student-title').textContent = 'Edit Student';
        $('#sf-id').value = student.id;
        $('#sf-name').value = student.name;
        $('#sf-age').value = student.age;
        $('#sf-batch').value = student.batch;
        $('#sf-programs').value = student.programs;
        $('#sf-parent').value = student.parent;
        $('#sf-phone').value = student.phone;
        Modals.open('modal-student');

      } else if (btn.dataset.act === 'delete') {
        state.students = state.students.filter(s => s.id !== student.id);
        render();
        notify(`${student.name} removed from students list.`, 'warning');
      }
    });

    // Save (add or edit)
    $('#save-student-btn').addEventListener('click', () => {
      const name = $('#sf-name').value.trim();
      const age = $('#sf-age').value;
      const batch = $('#sf-batch').value;
      const programs = $('#sf-programs').value.trim();
      const parent = $('#sf-parent').value.trim();
      if (!name || !age || !batch || !programs || !parent) {
        notify('Please fill all required fields marked with *.', 'error');
        return;
      }
      const id = $('#sf-id').value;
      if (id) {
        const s = state.students.find(x => x.id === Number(id));
        Object.assign(s, { name, age: Number(age), batch, programs, parent });
        notify(`${name}'s details updated.`, 'success');
      } else {
        state.students.push({
          id: state.nextId++, name, age: Number(age), batch, programs,
          parent, phone: $('#sf-phone').value.trim() || '—'
        });
        notify(`${name} added to ${batch}.`, 'success');
      }
      resetForm();
      render();
      Attendance.renderList();
      Modals.close('modal-student');
    });

    function resetForm() {
      ['sf-id','sf-name','sf-age','sf-programs','sf-parent','sf-phone'].forEach(
        f => ($('#' + f).value = ''));
      $('#sf-batch').value = '';
      $('#modal-student-title').textContent = 'Add Student';
    }
  }
  return { init, render };
})();

/* ── Enrollment Applications ─────────────────────────── */
const Applications = (() => {
  function card(a, compact = false) {
    return `
      <div class="${compact ? '' : 'app-card'}" data-app="${a.id}"
           style="${compact ? 'display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) 0;border-bottom:1px solid var(--border-color);flex-wrap:wrap;' : ''}">
        <div class="app-icon" aria-hidden="true" ${compact ? 'style="width:42px;height:42px;font-size:1.1rem;"' : ''}>
          <svg class="icon-svg" viewBox="0 0 24 24" width="${compact ? 18 : 24}" height="${compact ? 18 : 24}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
            <strong style="font-family:var(--font-display);font-size:${compact ? 'var(--text-base)' : 'var(--text-lg)'};">${a.child}</strong>
            <span class="badge ${a.status === 'approved' ? 'badge-success' : a.status === 'rejected' ? 'badge-rose' : 'badge-warning'}">${a.status === 'approved' ? 'Approved' : a.status === 'rejected' ? 'Rejected' : 'Pending'}</span>
          </div>
          <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:2px;">
            ${a.age} yrs • ${a.program} • Parent: ${a.parent} • ${a.date}
            ${compact ? '' : ` • <span>${a.phone}</span>`}
          </p>
        </div>
        <div class="app-actions" data-app-actions="${a.status}">
          ${a.status === 'pending' ? `
            <button class="btn btn-primary btn-sm" data-decide="approve">✓ Approve</button>
            <button class="btn btn-secondary btn-sm" data-decide="reject">✕ Reject</button>`
          : ''}
        </div>
      </div>`;
  }

  function pendingCount() {
    return state.applications.filter(a => a.status === 'pending').length;
  }

  function renderAll() {
    const list = $('#applications-list');
    list.innerHTML = state.applications.length
      ? state.applications.map(a => card(a)).join('')
      : `<div class="widget-card"><div class="widget-body" style="text-align:center;color:var(--text-muted);">
          <span style="display:inline-flex;margin-bottom:var(--space-3);color:#16a34a;"><svg class="icon-svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
          <p>No pending applications — all caught up!</p>
        </div></div>`;

    const preview = state.applications.slice(0, 3);
    $('#overview-applications').innerHTML = preview.length
      ? preview.map(a => card(a, true)).join('')
      : '<p style="color:var(--text-muted);font-size:var(--text-sm);">No recent requests.</p>';

    const n = pendingCount();
    $('#enroll-badge').textContent = n;
    $('#enroll-badge').style.display = n ? '' : 'none';
    $('#kpi-pending').textContent = n;
    $('#kpi-pending-note').textContent = n ? 'Needs review' : 'All reviewed';
    $$('.pending-count').forEach(el => { el.textContent = n; });
  }

  function decide(appId, decision) {
    const app = state.applications.find(a => a.id === appId);
    if (!app || app.status !== 'pending') return;
    app.status = decision;

    if (decision === 'approve') {
      state.students.push({
        id: state.nextId++,
        name: app.child,
        age: app.age,
        programs: app.program,
        batch: BATCH_BY_AGE(app.age),
        parent: app.parent,
        phone: app.phone
      });
      Students.render();
      Attendance.renderList();
      notify(`${app.child} approved and added to ${BATCH_BY_AGE(app.age)}.`, 'success');
    } else {
      notify(`Application for ${app.child} rejected.`, 'warning');
    }
    renderAll();
  }

  function init() {
    renderAll();

    // Full-list decisions
    $('#applications-list').addEventListener('click', e => {
      const btn = e.target.closest('[data-decide]');
      if (!btn) return;
      decide(btn.closest('[data-app]').dataset.app, btn.dataset.decide);
    });

    // Compact overview decisions
    $('#overview-applications').addEventListener('click', e => {
      const btn = e.target.closest('[data-decide]');
      if (!btn) return;
      decide(btn.closest('[data-app]').dataset.app, btn.dataset.decide);
    });
  }
  return { init };
})();

/* ── Batches ─────────────────────────────────────────── */
const Batches = (() => {
  let batches = [
    { name: 'Little Stars', ages: '4–6 yrs',   instructor: 'Sarah Thomas',    days: 'Mon, Wed, Fri', time: '5:00 – 6:30 PM', studio: 'Studio A', capacity: 20, enrolled: 18 },
    { name: 'Junior Stars', ages: '6–8 yrs',   instructor: 'Karthik Kumar',   days: 'Tue, Thu, Sat', time: '4:00 – 5:00 PM', studio: 'Studio B', capacity: 20, enrolled: 14 },
    { name: 'Mid-Stars',    ages: '9–11 yrs',  instructor: 'Priya Ramaswamy', days: 'Tue, Thu, Sat', time: '5:00 – 6:30 PM', studio: 'Studio A', capacity: 24, enrolled: 21 },
    { name: 'Senior Stars', ages: '12–16 yrs', instructor: 'Karthik Kumar',   days: 'Mon, Wed, Fri', time: '6:30 – 8:00 PM', studio: 'Studio B', capacity: 24, enrolled: 16 }
  ];

  function card(b) {
    const pct = Math.min(Math.round((b.enrolled / b.capacity) * 100), 100);
    return `
      <div class="batch-card" data-batch-name="${b.name}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-3);">
          <div>
            <h3 style="font-family:var(--font-display);font-size:var(--text-lg);">${b.name}</h3>
            <p style="font-size:var(--text-xs);color:var(--text-muted);">${b.ages} • ${b.studio}</p>
          </div>
          <span class="badge ${pct >= 90 ? 'badge-warning' : 'badge-success'}">${pct >= 90 ? 'Almost Full' : 'Open'}</span>
        </div>
        <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2);">
          <span class="icon-line"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${b.instructor}</span>
          <span class="icon-line"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${b.days}</span>
          <span class="icon-line"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${b.time}</span>
        </div>
        <div class="capacity-bar" aria-hidden="true"><div class="capacity-fill" data-fill="${pct}"></div></div>
        <div class="capacity-label"><span>Enrolled</span><span>${b.enrolled}/${b.capacity} (${pct}%)</span></div>
        <div style="margin-top:var(--space-4);display:flex;gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm" data-batch-view="${b.name}">View Students</button>
        </div>
      </div>`;
  }

  function render() {
    $('#batches-grid').innerHTML = batches.map(card).join('');
    $('#kpi-batches').textContent = batches.length;
    $('#batches-count').textContent = batches.length;
    setTimeout(() => {
      $$('#batches-grid .capacity-fill').forEach(f => { f.style.width = f.dataset.fill + '%'; });
    }, 150);
  }

  function init() {
    render();

    // Jump to students pre-filtered by this batch
    $('#batches-grid').addEventListener('click', e => {
      const btn = e.target.closest('[data-batch-view]');
      if (!btn) return;
      $('#student-batch-filter').value = btn.dataset.batchView;
      $('#student-search').value = '';
      Students.render();
      AdminTabs.activate('students');
      notify(`Showing students in ${btn.dataset.batchView}.`, 'info');
    });

    $('#save-batch-btn').addEventListener('click', () => {
      const name = $('#bf-name').value.trim();
      const capacity = Number($('#bf-capacity').value);
      if (!name || !capacity) {
        notify('Batch name and capacity are required.', 'error');
        return;
      }
      batches.push({
        name, capacity, enrolled: 0,
        instructor: $('#bf-instructor').value,
        days: $('#bf-days').value.trim() || 'TBD',
        time: $('#bf-time').value.trim() || 'TBD',
        studio: 'Studio C', ages: 'All ages'
      });
      ['bf-name','bf-days','bf-time'].forEach(f => ($('#' + f).value = ''));
      $('#bf-capacity').value = 20;
      render();
      Modals.close('modal-batch');
      notify(`Batch "${name}" created.`, 'success');
    });
  }
  return { init };
})();

/* ── Faculty ─────────────────────────────────────────── */
const Faculty = (() => {
  const faculty = [
    { name: 'Priya Ramaswamy', role: 'Classical Dance Lead', programs: 'Classical Dance • Ballet', batches: 2, phone: '+91 98450 12345', email: 'priya@artisteacademy.in' },
    { name: 'Ranjini Nair',    role: 'Theatre Director',     programs: 'Drama & Theater',          batches: 1, phone: '+91 98840 55210', email: 'ranjini@artisteacademy.in' },
    { name: 'Karthik Kumar',   role: 'Western & Hip-Hop Coach', programs: 'Western Dance • Hip-Hop', batches: 2, phone: '+91 97910 33485', email: 'karthik@artisteacademy.in' },
    { name: 'Sarah Thomas',    role: 'Ballet Instructor',    programs: 'Ballet • Little Stars',    batches: 1, phone: '+91 90030 77162', email: 'sarah@artisteacademy.in' },
    { name: 'Deepak Menon',    role: 'Music Teacher',        programs: 'Music (Vocal & Keys)',     batches: 1, phone: '+91 96000 49873', email: 'deepak@artisteacademy.in' }
  ];
  function card(f) {
    const ini = f.name.split(' ').map(w => w[0]).slice(0, 2).join('');
    return `
      <div class="faculty-card">
        <div class="faculty-avatar" aria-hidden="true">${ini}</div>
        <h3 style="font-family:var(--font-display);font-size:var(--text-lg);">${f.name}</h3>
        <p style="font-size:var(--text-sm);color:var(--rose-deep);font-weight:var(--weight-semi);margin-bottom:var(--space-2);">${f.role}</p>
        <p style="font-size:var(--text-xs);color:var(--text-muted);line-height:1.8;">
          ${f.programs}<br>${f.batches} active batch${f.batches > 1 ? 'es' : ''}<br>
        </p>
        <span class="icon-line" style="justify-content:center;font-size:var(--text-xs);color:var(--text-muted);">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${f.phone}
        </span>
        <div style="margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2);">
          <a class="btn btn-secondary btn-sm" href="mailto:${f.email}" style="justify-content:center;">✉ Email</a>
          <button class="btn btn-secondary btn-sm" data-fac-schedule="${f.name}" style="justify-content:center;">View Schedule</button>
        </div>
      </div>`;
  }
  function init() {
    $('#faculty-grid').innerHTML = faculty.map(card).join('');
    $('#faculty-grid').addEventListener('click', e => {
      const btn = e.target.closest('[data-fac-schedule]');
      if (!btn) return;
      notify(`${btn.dataset.facSchedule} teaches across the week — full timetable coming soon.`, 'info');
    });
  }
  return { init };
})();

/* ── Attendance ──────────────────────────────────────── */
const Attendance = (() => {
  function roster(batch) {
    return state.students.filter(s => s.batch === batch);
  }

  function rowHtml(s, batch) {
    const cur = state.attendance[`${batch}|${s.name}`] || '';
    const seg = (val, label, cls) => `
      <button type="button" class="seg-btn ${cur === val ? cls : ''}"
              data-att="${val}" data-key="${batch}|${s.name}"
              aria-pressed="${cur === val}">${label}</button>`;
    return `
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
        <div class="student-cell" style="flex:1;">
          <span class="student-avatar" aria-hidden="true">${s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
          <div><strong style="font-size:var(--text-sm);">${s.name}</strong>
          <div style="font-size:var(--text-xs);color:var(--text-muted);">${s.programs}</div></div>
        </div>
        <div class="seg-group" role="group" aria-label="Mark ${s.name}">
          ${seg('p', 'P', 'active-p')}${seg('a', 'A', 'active-a')}${seg('l', 'L', 'active-l')}
        </div>
      </div>`;
  }

  function renderList() {
    const batch = $('#att-batch').value;
    const list = $('#attendance-list');
    const students = roster(batch);
    if (!batch || !students.length) {
      list.innerHTML = `<p style="color:var(--text-muted);font-size:var(--text-sm);padding:var(--space-4) 0;">No students found for this batch yet.</p>`;
    } else {
      list.innerHTML = students.map(s => rowHtml(s, batch)).join('');
    }
    updateCounts();
  }

  function updateCounts() {
    const vals = Object.entries(state.attendance)
      .filter(([k]) => k.startsWith($('#att-batch').value + '|'))
      .map(([, v]) => v);
    $('#att-count-p').textContent = vals.filter(v => v === 'p').length;
    $('#att-count-a').textContent = vals.filter(v => v === 'a').length;
    $('#att-count-l').textContent = vals.filter(v => v === 'l').length;
  }

  function init() {
    $('#att-date').textContent = new Date().toLocaleDateString('en-US',
      { weekday:'short', month:'short', day:'numeric', year:'numeric' });
    renderList();

    $('#att-batch').addEventListener('change', renderList);

    $('#attendance-list').addEventListener('click', e => {
      const btn = e.target.closest('[data-att]');
      if (!btn) return;
      const key = btn.dataset.key;
      state.attendance[key] = btn.dataset.att;
      const group = btn.parentElement;
      group.querySelectorAll('.seg-btn').forEach(b => {
        b.classList.remove('active-p', 'active-a', 'active-l');
        b.setAttribute('aria-pressed', 'false');
      });
      const cls = { p: 'active-p', a: 'active-a', l: 'active-l' }[btn.dataset.att];
      btn.classList.add(cls);
      btn.setAttribute('aria-pressed', 'true');
      updateCounts();
    });

    $('#att-all-present').addEventListener('click', () => {
      const batch = $('#att-batch').value;
      roster(batch).forEach(s => { state.attendance[`${batch}|${s.name}`] = 'p'; });
      renderList();
      notify(`All students in ${batch} marked present.`, 'success');
    });

    $('#att-save').addEventListener('click', () => {
      const batch = $('#att-batch').value;
      if (!batch) { notify('Select a batch first.', 'error'); return; }
      const p = $('#att-count-p').textContent;
      const a = $('#att-count-a').textContent;
      const l = $('#att-count-l').textContent;
      notify(`Attendance saved for ${batch} — ${p} Present, ${a} Absent, ${l} Late.`, 'success');
    });
  }
  return { init, renderList };
})();

/* ── Events ──────────────────────────────────────────── */
const Events = (() => {
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  function eventHtml(ev) {
    return `
      <div class="recital-event" data-event-title="${ev.title}">
        <div class="recital-date-box"><div class="day">${ev.day}</div>${ev.month}</div>
        <div style="flex:1;">
          <h4 style="font-family:var(--font-display);font-size:var(--text-lg);">${ev.title}</h4>
          <p style="font-size:var(--text-sm);color:var(--text-muted);">${ev.venue} • ${ev.time}</p>
        </div>
        <button class="icon-btn" data-event-delete title="Remove event" aria-label="Remove ${ev.title}">
          <svg class="icon-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>`;
  }
  function init() {
    const list = $('#events-list');
    list.innerHTML =
      eventHtml({ day: '15', month: 'DEC', title: 'Winter Grand Recital 2025', venue: 'Music Academy Hall, Chennai', time: '5:00 PM – 8:00 PM' }) +
      eventHtml({ day: '30', month: 'DEC', title: 'Annual Awards Day', venue: 'School Auditorium', time: '4:00 PM – 7:00 PM' }) +
      eventHtml({ day: '22', month: 'MAR', title: 'Spring Drama Showcase 2026', venue: 'Kalakshetra Auditorium, Chennai', time: '4:00 PM – 7:00 PM' });

    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-event-delete]');
      if (!btn) return;
      const wrap = btn.closest('[data-event-title]');
      notify(`Event "${wrap.dataset.eventTitle}" removed.`, 'warning');
      wrap.remove();
    });

    $('#save-event-btn').addEventListener('click', () => {
      const title = $('#ef-title').value.trim();
      const dateVal = $('#ef-date').value;
      const venue = $('#ef-venue').value.trim();
      if (!title || !dateVal || !venue) {
        notify('Title, date and venue are required.', 'error');
        return;
      }
      const d = new Date(dateVal + 'T00:00:00');
      list.insertAdjacentHTML('afterbegin', eventHtml({
        day: String(d.getDate()).padStart(2, '0'),
        month: MONTHS[d.getMonth()],
        title, venue,
        time: $('#ef-time').value.trim() || 'Time TBD'
      }));
      ['ef-title','ef-date','ef-time','ef-venue'].forEach(f => ($('#' + f).value = ''));
      Modals.close('modal-event');
      notify(`Event "${title}" added to the calendar.`, 'success');
    });
  }
  return { init };
})();

/* ── Payments ────────────────────────────────────────── */
const Payments = (() => {
  const badgeCls = s => ({ Paid: 'badge-success', Pending: 'badge-warning', Overdue: 'badge-rose' }[s] || 'badge-orchid');

  function rowHtml(p) {
    return `
      <tr data-payment-student="${p.student}" data-payment-status="${p.status}">
        <td><strong>${p.student}</strong></td>
        <td>${p.batch}</td>
        <td>${rupees(p.amount)}</td>
        <td>${p.due}</td>
        <td><span class="badge ${badgeCls(p.status)}">${p.status}</span></td>
        <td><div class="table-actions">
          ${p.status !== 'Paid'
            ? `<button class="btn btn-secondary btn-sm" data-pay="remind">Send Reminder</button>
               <button class="btn btn-primary btn-sm" data-pay="paid">Mark Paid</button>`
            : `<span style="font-size:var(--text-xs);color:#15803d;font-weight:600;">✓ Settled</span>`}
        </div></td>
      </tr>`;
  }

  function totals() {
    const paid = state.payments.filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = state.payments.filter(p => p.status !== 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const overdue = state.payments.filter(p => p.status === 'Overdue').length;
    return { paid, pending, overdue };
  }

  function updateTotals() {
    const t = totals();
    $('#pay-collected').textContent = rupees(t.paid);
    $('#pay-pending').textContent = rupees(t.pending);
    $('#pay-overdue-count').textContent = t.overdue;
    $('#kpi-revenue').textContent = rupees(t.paid);
    const payBadge = $('.sidebar-link[data-section="payments"] .sidebar-badge');
    if (payBadge) {
      payBadge.textContent = t.overdue;
      payBadge.style.display = t.overdue ? '' : 'none';
    }
  }

  function applyFilter() {
    const f = $('#payment-status-filter').value;
    $$('#payments-tbody tr').forEach(tr => {
      tr.hidden = !!f && tr.dataset.paymentStatus !== f;
    });
  }

  function init() {
    $('#payments-tbody').innerHTML = state.payments.map(rowHtml).join('');
    updateTotals();
    $('#payment-status-filter').addEventListener('change', applyFilter);

    $('#payments-tbody').addEventListener('click', e => {
      const btn = e.target.closest('[data-pay]');
      if (!btn) return;
      const tr = btn.closest('tr');
      const payment = state.payments.find(p => p.student === tr.dataset.paymentStudent);
      if (!payment) return;

      if (btn.dataset.pay === 'remind') {
        notify(`Reminder sent to ${payment.student}'s parent (${rupees(payment.amount)} due).`, 'info');
      } else {
        payment.status = 'Paid';
        $('#payments-tbody').innerHTML = state.payments.map(rowHtml).join('');
        applyFilter();
        updateTotals();
        notify(`Payment recorded — ${payment.student}, ${rupees(payment.amount)} received.`, 'success');
      }
    });
  }
  return { init };
})();

/* ── Announcements ───────────────────────────────────── */
const Announcements = (() => {
  function itemHtml(a) {
    return `
      <div class="notif-item">
        <div class="notif-dot" aria-hidden="true"></div>
        <div class="notif-content">
          <div class="notif-title">${a.title}</div>
          <div class="notif-text">${a.message}</div>
          <div class="notif-time">Just now • To: ${a.audience} • From: Admin</div>
        </div>
      </div>`;
  }
  function init() {
    const list = $('#sent-list');
    list.innerHTML =
      itemHtml({ audience: 'All Parents', title: 'Winter Recital Costume Fitting', message: 'Please bring your child for costume fitting on Nov 30th, 10AM–1PM.' }) +
      itemHtml({ audience: 'Mid-Stars',   title: 'Term 3 Fees Due', message: 'Term 3 fees are due by November 30th. Please pay through the Parent Dashboard.' }) +
      itemHtml({ audience: 'All Parents', title: 'Holiday Schedule 2025–26', message: 'Classes on holiday from Dec 24 – Jan 2. Regular schedule resumes Jan 3.' });
    $('#sent-count').textContent = list.querySelectorAll('.notif-item').length;

    $('#announce-form').addEventListener('submit', e => {
      e.preventDefault();
      const title = $('#ann-title').value.trim();
      const message = $('#ann-message').value.trim();
      if (!title || !message) {
        notify('Title and message are required.', 'error');
        return;
      }
      const payload = { audience: $('#ann-audience').value, title, message };
      list.insertAdjacentHTML('afterbegin', itemHtml(payload));
      $('#sent-count').textContent = list.querySelectorAll('.notif-item').length;
      e.target.reset();
      notify(`Announcement "${title}" sent to ${payload.audience}.`, 'success');
    });
  }
  return { init };
})();

/* ── Reports ─────────────────────────────────────────── */
const Reports = (() => {
  function render() {
    const year = $('#report-year').value;
    renderBarChart('report-chart', state.revenue[year], { prefix: '₹' });
    renderDonut('program-donut', 32, 'students in Classical Dance');
  }
  function csvEscape(v) { return `"${String(v).replace(/"/g, '""')}"`; }
  function exportCsv() {
    const header = ['Name', 'Age', 'Programs', 'Batch', 'Parent', 'Phone'];
    const rows = state.students.map(s =>
      [s.name, s.age, s.programs, s.batch, s.parent, s.phone].map(csvEscape).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artiste-academy-students.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify('Students CSV exported successfully.', 'success');
  }
  function init() {
    $('#report-year').addEventListener('change', render);
    $('#export-csv').addEventListener('click', exportCsv);
    $('#print-report').addEventListener('click', () => window.print());
  }
  return { init, render };
})();

/* ── Settings ────────────────────────────────────────── */
function initSettings() {
  $('#admin-settings-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#settings-name').value.trim();
    if (name) $('.sidebar-user-name').textContent = name;
    notify('Admin profile saved.', 'success');
  });
}

/* ── Theme Sync: re-render charts when theme toggles ─── */
function initThemeSync() {
  const observer = new MutationObserver(() => {
    renderBarChart('revenue-chart', state.revenue['2025'], { prefix: '₹' });
    Reports.render();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/* ── Boot ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Modals.init();
  AdminTabs.init();
  Students.init();
  Applications.init();
  Batches.init();
  Faculty.init();
  Attendance.init();
  Events.init();
  Payments.init();
  Announcements.init();
  Reports.init();
  initSettings();

  renderBarChart('revenue-chart', state.revenue['2025'], { prefix: '₹' });
  AdminCalendar.render();
  initThemeSync();
});

// Expose for debugging
window.KDPA_Admin = { state, Students, Applications, Attendance, Payments };
