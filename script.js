
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

// Simple smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const targetId = a.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

// Form handling (you can swap the endpoint with Formspree or your backend)
const form = document.getElementById('apply-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Submitting...';
    const data = new FormData(form);
    // Replace with your Formspree endpoint or server URL
    const ENDPOINT = 'https://formspree.io/f/your-endpoint-id';
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' }});
      if (response.ok) {
        form.reset();
        status.textContent = 'Thanks! We received your application.';
        status.style.color = 'var(--ok)';
      } else {
        status.textContent = 'Something went wrong. Please try again or email us directly.';
      }
    } catch (err) {
      status.textContent = 'Network error. Please try again later.';
    }
  });
}
