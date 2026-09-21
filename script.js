
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();



const estimateForm = document.getElementById('estimateForm');
const formStatus = document.getElementById('formStatus');
const formNext = document.getElementById('formNext');
const formBack = document.getElementById('formBack');
const formSubmit = document.getElementById('formSubmit');
const progressFill = document.getElementById('progressFill');
const stepIndicators = [...document.querySelectorAll('[data-step-indicator]')];
const formSteps = [...document.querySelectorAll('.form-step')];
let currentStep = 1;

function fieldsForStep(step) {
  return [...document.querySelectorAll(`.form-step[data-step="${step}"] input, .form-step[data-step="${step}"] select, .form-step[data-step="${step}"] textarea`)];
}

function validateStep(step) {
  const fields = fieldsForStep(step);
  for (const field of fields) {
    if (field.type === 'checkbox') continue;
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }

  if (step === 3) {
    const services = [...estimateForm.querySelectorAll('input[name="Services"]')];
    const selected = services.filter(input => input.checked);
    const servicesError = document.getElementById('servicesError');
    if (!selected.length) {
      servicesError.hidden = false;
      services[0].focus();
      return false;
    }
    servicesError.hidden = true;
  }
  return true;
}

function showStep(step) {
  currentStep = Math.max(1, Math.min(4, step));
  formSteps.forEach(el => el.classList.toggle('active', Number(el.dataset.step) === currentStep));
  stepIndicators.forEach((el, index) => {
    const n = index + 1;
    el.classList.toggle('active', n === currentStep);
    el.classList.toggle('complete', n < currentStep);
  });
  if (progressFill) progressFill.style.width = `${((currentStep - 1) / 3) * 100}%`;
  formBack.hidden = currentStep === 1;
  formNext.hidden = currentStep === 4;
  formSubmit.hidden = currentStep !== 4;
  formStatus.className = 'form-status';
  formStatus.textContent = '';
}

if (estimateForm && formStatus && formNext && formBack && formSubmit) {
  showStep(1);

  formNext.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    showStep(currentStep + 1);
    document.querySelector('.estimate-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  formBack.addEventListener('click', () => {
    showStep(currentStep - 1);
    document.querySelector('.estimate-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  estimateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep(4)) return;

    const services = [...estimateForm.querySelectorAll('input[name="Services"]')];
    const selectedServices = services.filter(input => input.checked);

    const originalLabel = formSubmit.textContent;
    formSubmit.disabled = true;
    formSubmit.textContent = 'Sending...';
    formStatus.className = 'form-status';
    formStatus.textContent = '';

    const formData = new FormData(estimateForm);
    formData.delete('Services');
    formData.append('Services', selectedServices.map(input => input.value).join(', '));

    const payload = {};
    for (const [key, value] of formData.entries()) payload[key] = value;

    try {
      const response = await fetch('https://formsubmit.co/ajax/info@sbacoreinc.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || data.success === 'false' || data.success === false) throw new Error(data.message || 'Unable to send request.');

      estimateForm.reset();
      showStep(4);
      formStatus.className = 'form-status success';
      formStatus.innerHTML = '<strong>Thank you — your request is in.</strong><br>We’ll review the project and contact you within 1 business day.';
      formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'We could not send the request right now. Please email info@sbacoreinc.com or call +1 (224) 672-2272.';
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = originalLabel;
    }
  });
}
