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
  function showError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    let errEl = field.parentElement.querySelector('.form-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'form-error';
      errEl.setAttribute('role', 'alert');
      field.parentElement.appendChild(errEl);
    }
    errEl.innerHTML = `<span>⚠</span> ${message}`;
    errEl.classList.add('visible');
  }

  function showSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    const errEl = field.parentElement.querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
  }

  function clearState(field) {
    field.classList.remove('error', 'success');
    const errEl = field.parentElement.querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
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
    window.KDPA?.Toast?.show('Message sent successfully! We\'ll be in touch soon. 🎭', 'success');
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
        // Show success
        form.innerHTML = `
          <div style="text-align:center; padding: 3rem; animation: scaleIn 0.5s var(--ease-spring);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
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
  document.querySelectorAll('[data-password-toggle]').forEach(btn => {
    const targetId = btn.dataset.passwordToggle;
    const field = document.getElementById(targetId);
    if (!field) return;

    btn.addEventListener('click', () => {
      const isPassword = field.type === 'password';
      field.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? '🙈' : '👁';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  FormValidation.init();
  MultiStepForm.init();
  initPasswordToggle();
});

window.KDPA_Forms = { FormValidation, MultiStepForm };
