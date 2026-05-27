const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const year = document.querySelector('[data-year]');
const form = document.querySelector('[data-contact-form]');
const formNote = document.querySelector('[data-form-note]');

if (year) year.textContent = new Date().getFullYear();

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (formNote) formNote.textContent = 'Le formulaire ouvre votre application email. Une connexion serveur pourra être ajoutée en phase 2.';
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const platform = String(data.get('platform') || '').trim();
    const type = String(data.get('request-type') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !subject || !message) {
      if (formNote) formNote.textContent = 'Merci de remplir tous les champs obligatoires.';
      return;
    }

    const body = [
      `Nom: ${name}`,
      `Email: ${email}`,
      phone ? `Téléphone: ${phone}` : '',
      platform ? `Plateforme: ${platform}` : '',
      type ? `Type: ${type}` : '',
      '',
      message
    ].filter(Boolean).join('\r\n');

    const mailto = `mailto:contact@synkora-group.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const link = document.createElement('a');
    link.href = mailto;
    link.click();
  });
}
