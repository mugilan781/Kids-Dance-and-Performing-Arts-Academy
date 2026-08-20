/* ============================================================
   FORMS.JS — Validation, Multi-step Enrollment
   ============================================================ */

'use strict';

// ── Validation Rules ──────────────────────────────────────────
const validators = {
  required: (val) => val.trim() !== '' || 'This field is required.',
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email address.',
  phone: (val) => /^[\+]?[\d\s\-\(\)]{7,15}$/.test(val) || 'Please enter a valid phone number.',
  minLength: (n) => (val) => val.length >= n || `Must be at least ${n} characters.`,
  maxLength: (n) => (val) => val.length <= n || `Cannot exceed ${n} characters.`,
  password: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(val) ||
    'Password must be 8+ characters with uppercase, lowercase and a number.',
  match: (fieldId) => (val) => {
    const other = document.getElementById(fieldId);
    return !other || val === other.value || 'Passwords do not match.';
  }
};

// ── Form Validation Engine ────────────────────────────────────
const FormValidation = (() => {
  // Fields placed directly inside a <form> (e.g. footer newsletter pill)
  // host the error message next to the form so it cannot break the layout.
  function errorHost(field) {
    if (field.parentElement.classList.contains('subscribe-field') || field.parentElement.classList.contains('input-group')) {
      return field.parentElement.parentElement;
    }
    return field.parentElement.tagName === 'FORM'
      ? field.parentElement.parentElement
      : field.parentElement;
  }

  function showError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    const host = errorHost(field);
    let errEl = host.querySelector('.form-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'form-error';
      errEl.setAttribute('role', 'alert');
      host.appendChild(errEl);
    }
    errEl.innerHTML = `<svg class="icon-svg form-err-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${message}`;
    errEl.classList.add('visible');
    if (field.parentElement.tagName === 'FORM' || field.parentElement.classList.contains('subscribe-field')) {
      field.parentElement.classList.add('error-state');
    }
  }

  function showSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    const errEl = errorHost(field).querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
    if (field.parentElement.tagName === 'FORM' || field.parentElement.classList.contains('subscribe-field')) {
      field.parentElement.classList.remove('error-state');
    }
  }

  function clearState(field) {
    field.classList.remove('error', 'success');
    const errEl = errorHost(field).querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
    if (field.parentElement.tagName === 'FORM' || field.parentElement.classList.contains('subscribe-field')) {
      field.parentElement.classList.remove('error-state');
    }
  }

  function validateField(field) {
    const rules = (field.dataset.validate || '').split(',').map(r => r.trim()).filter(Boolean);
    let valid = true;

    for (const rule of rules) {
      const [ruleName, ...args] = rule.split(':');
      const fn = ruleName === 'minLength' ? validators.minLength(parseInt(args[0]))
               : ruleName === 'maxLength' ? validators.maxLength(parseInt(args[0]))
               : ruleName === 'match'     ? validators.match(args[0])
               : validators[ruleName];

      if (!fn) continue;
      const result = fn(field.value);
      if (result !== true) {
        showError(field, result);
        valid = false;
        break;
      }
    }

    if (valid && rules.length) showSuccess(field);
    return valid;
  }

  function validateForm(form) {
    let allValid = true;
    form.querySelectorAll('[data-validate]').forEach(field => {
      if (!validateField(field)) allValid = false;
    });
    return allValid;
  }

  function initForm(form) {
    form.querySelectorAll('[data-validate]').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
        else clearState(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm(form)) {
        const onSuccess = form.dataset.onSuccess;
        if (onSuccess && window[onSuccess]) window[onSuccess](form);
        else handleFormSuccess(form);
      }
    });
  }

  function handleFormSuccess(form) {
    // Default success — show toast
    window.Artiste?.Toast?.show('Message sent successfully! We\'ll be in touch soon.', 'success');
    form.reset();
    form.querySelectorAll('[data-validate]').forEach(f => clearState(f));
  }

  function init() {
    document.querySelectorAll('form[data-form]').forEach(initForm);
  }

  return { init, initForm, validateForm, validateField, showError, showSuccess };
})();

// ── Multi-Step Form ───────────────────────────────────────────
const MultiStepForm = (() => {
  let form, steps, stepDots, stepLines, current = 0;

  function showStep(index) {
    steps.forEach((s, i) => {
      s.hidden = i !== index;
      s.setAttribute('aria-hidden', i !== index);
    });

    stepDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.classList.toggle('done', i < index);
    });

    stepLines.forEach((line, i) => {
      line.classList.toggle('done', i < index);
    });

    current = index;

    // Update buttons
    form.querySelector('[data-step-prev]')?.toggleAttribute('hidden', index === 0);
    const nextBtn = form.querySelector('[data-step-next]');
    const submitBtn = form.querySelector('[data-step-submit]');
    if (nextBtn) nextBtn.hidden = index === steps.length - 1;
    if (submitBtn) submitBtn.hidden = index !== steps.length - 1;

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateCurrentStep() {
    const currentStep = steps[current];
    let valid = true;
    currentStep.querySelectorAll('[data-validate]').forEach(field => {
      if (!FormValidation.validateField(field)) valid = false;
    });
    return valid;
  }

  function init() {
    form = document.querySelector('[data-multistep]');
    if (!form) return;

    steps = Array.from(form.querySelectorAll('[data-step]'));
    stepDots = Array.from(form.querySelectorAll('.step-dot'));
    stepLines = Array.from(form.querySelectorAll('.step-line'));

    showStep(0);

    form.querySelector('[data-step-next]')?.addEventListener('click', () => {
      if (validateCurrentStep()) showStep(current + 1);
    });

    form.querySelector('[data-step-prev]')?.addEventListener('click', () => {
      showStep(current - 1);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (validateCurrentStep()) {
        // Custom success handler (e.g. dashboard enrollment)
        const onSuccess = form.dataset.onSuccess;
        if (onSuccess && window[onSuccess]) {
          window[onSuccess](form);
          return;
        }
        // Show success
        form.innerHTML = `
          <div style="text-align:center; padding: 3rem; animation: scaleIn 0.5s var(--ease-spring);">
            <div style="width:72px;height:72px;border-radius:50%;background:rgba(84,36,95,0.1);color:var(--orchid);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
              <svg class="icon-svg" style="width:36px;height:36px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1rem; color: var(--orchid);">
              Enrollment Submitted!
            </h3>
            <p style="color: var(--text-secondary);">
              Thank you! Our team will contact you within 24 hours to confirm your child's enrollment.
            </p>
            <a href="index.html" class="btn btn-primary" style="margin-top: 2rem; display: inline-flex;">
              Back to Home
            </a>
          </div>`;
      }
    });
  }

  return { init };
})();

// ── Password Toggle ───────────────────────────────────────────
function initPasswordToggle() {
  const eyeSvg = `<svg class="icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const eyeOffSvg = `<svg class="icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;

  document.querySelectorAll('[data-password-toggle]').forEach(btn => {
    const targetId = btn.dataset.passwordToggle;
    const field = document.getElementById(targetId);
    if (!field) return;

    btn.innerHTML = eyeSvg;

    btn.addEventListener('click', () => {
      const isPassword = field.type === 'password';
      field.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? eyeOffSvg : eyeSvg;
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  FormValidation.init();
  MultiStepForm.init();
  initPasswordToggle();
});

window.Artiste_Forms = window.KDPA_Forms = { FormValidation, MultiStepForm };
