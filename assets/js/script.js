console.log('AI Course Loaded');

// Optional scroll-to-top button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.textContent = '↑';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.style.position = 'fixed';
  btn.style.bottom = '24px';
  btn.style.right = '24px';
  btn.style.padding = '10px 14px';
  btn.style.border = 'none';
  btn.style.borderRadius = '50%';
  btn.style.background = '#0b74d1';
  btn.style.color = '#fff';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 4px 10px rgba(0,0,0,.2)';
  btn.style.fontSize = '18px';
  btn.style.display = 'none';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 200 ? 'block' : 'none';
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
