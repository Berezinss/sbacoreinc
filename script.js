
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

if (estimateForm && formStatus) {
  estimateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    formStatus.className = 'form-status';
    formStatus.textContent = '';

    const services = [...estimateForm.querySelectorAll('input[name="Services"]')];
    const selectedServices = services.filter(input => input.checked);
    const servicesError = document.getElementById('servicesError');

    if (!estimateForm.checkValidity()) {
      estimateForm.reportValidity();
      return;
    }

    if (selectedServices.length === 0) {
      servicesError.hidden = false;
      services[0].focus();
      return;
    }
    servicesError.hidden = true;

    const submitButton = estimateForm.querySelector('.submit-btn');
    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    const formData = new FormData(estimateForm);
    formData.delete('Services');
    formData.append('Services', selectedServices.map(input => input.value).join(', '));

    const payload = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/info@sbacoreinc.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || data.success === 'false' || data.success === false) {
        throw new Error(data.message || 'Unable to send the request.');
      }

      estimateForm.reset();
      formStatus.className = 'form-status success';
      formStatus.innerHTML = '<strong>Thank you!</strong> We received your request. A member of the SBA CORE team will review your project and contact you within 1 business day.';
      formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'We could not send the request right now. Please email info@sbacoreinc.com or call +1 (224) 672-2272.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
}
