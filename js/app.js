/* Cached DOM references used across navigation, theme, architecture and contact features. */
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeColor = document.querySelector('meta[name="theme-color"]');
const architectureFolds = Array.from(document.querySelectorAll('[data-architecture-fold]'));
const year = document.querySelector('[data-year]');
const form = document.querySelector('[data-contact-form]');
const formNote = document.querySelector('[data-form-note]');
const formStartedInput = document.querySelector('[data-form-started-at]');
const contactPrefillLinks = Array.from(document.querySelectorAll('[data-contact-subject]'));

/* Contact form settings: local history, basic cooldown and anti-spam timing. */
const CONTACT_STORAGE_KEY = 'synkora-contact-history';
const CONTACT_COOLDOWN_KEY = 'synkora-contact-last-submit';
const CONTACT_HISTORY_LIMIT = 25;
const CONTACT_COOLDOWN_MS = 60000;
const MIN_FORM_TIME_MS = 2500;

if (year) year.textContent = new Date().getFullYear();

if (formStartedInput) formStartedInput.value = String(Date.now());

/* Contact helpers keep storage failures silent so the form can still open email. */
const setFormNote = (message, type = 'default') => {
  if (!formNote) return;

  formNote.textContent = message;
  formNote.classList.remove('is-error', 'is-success');

  if (type === 'error') formNote.classList.add('is-error');
  if (type === 'success') formNote.classList.add('is-success');
};

const readContactHistory = () => {
  try {
    const stored = localStorage.getItem(CONTACT_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const storeContactRecord = (record) => {
  try {
    const history = [record, ...readContactHistory()].slice(0, CONTACT_HISTORY_LIMIT);
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(history));
    localStorage.setItem(CONTACT_COOLDOWN_KEY, String(Date.now()));
    return true;
  } catch (error) {
    return false;
  }
};

const getLastContactSubmit = () => {
  try {
    return Number(localStorage.getItem(CONTACT_COOLDOWN_KEY) || 0);
  } catch (error) {
    return 0;
  }
};

const createContactId = () => {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SYN-${stamp}-${random}`;
};

/* Theme handling: respects localStorage first, then the document default. */
const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0b0f16' : '#f7f9fc');
  if (themeToggle) {
    const label = theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre';
    themeToggle.setAttribute('aria-label', label);
  }
};

const getStoredTheme = () => {
  try {
    return localStorage.getItem('synkora-theme');
  } catch (error) {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem('synkora-theme', theme);
  } catch (error) {
    /* localStorage can be unavailable in some private browsing modes. */
  }
};

setTheme(getStoredTheme() || document.documentElement.dataset.theme || 'light');

/* Header and mobile navigation behavior. */
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

const updateHeaderState = () => {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
};

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

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

/* Architecture accordions: compact on mobile, fully open on wider screens. */
if (architectureFolds.length) {
  const architectureMedia = window.matchMedia('(max-width: 720px)');
  let syncingArchitectureFolds = false;

  const syncArchitectureFolds = () => {
    syncingArchitectureFolds = true;
    architectureFolds.forEach((fold, index) => {
      fold.open = architectureMedia.matches ? index === 0 : true;
    });
    syncingArchitectureFolds = false;
  };

  architectureFolds.forEach((fold) => {
    fold.addEventListener('toggle', () => {
      if (syncingArchitectureFolds || !architectureMedia.matches || !fold.open) return;

      syncingArchitectureFolds = true;
      architectureFolds.forEach((otherFold) => {
        if (otherFold !== fold) otherFold.open = false;
      });
      syncingArchitectureFolds = false;
    });
  });

  syncArchitectureFolds();

  if (architectureMedia.addEventListener) {
    architectureMedia.addEventListener('change', syncArchitectureFolds);
  } else {
    architectureMedia.addListener(syncArchitectureFolds);
  }
}

/* Reveal animations progressively mark visible sections as they enter the viewport. */
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

/* Contact flow: prefill links, validate input, save local history, then open mailto. */
if (form) {
  contactPrefillLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const subjectInput = form.querySelector('[name="subject"]');
      const platformSelect = form.querySelector('[name="platform"]');
      const typeSelect = form.querySelector('[name="request-type"]');
      const subject = link.dataset.contactSubject || '';
      const platform = link.dataset.contactPlatform || '';
      const type = link.dataset.contactType || '';

      window.setTimeout(() => {
        if (subjectInput && subject) subjectInput.value = subject;
        if (platformSelect && platform) platformSelect.value = platform;
        if (typeSelect && type) typeSelect.value = type;
        if (subject) setFormNote(`Sujet prérempli : ${subject}`, 'success');
      }, 0);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    setFormNote('Préparation de votre demande...');

    const now = Date.now();
    const data = new FormData(form);
    const honeypot = String(data.get('website') || '').trim();
    const startedAt = Number(data.get('form-started-at') || 0);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const platform = String(data.get('platform') || '').trim();
    const type = String(data.get('request-type') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    const lastSubmit = getLastContactSubmit();
    const remainingCooldown = CONTACT_COOLDOWN_MS - (now - lastSubmit);

    if (!name || !email || !subject || !message) {
      setFormNote('Merci de remplir tous les champs obligatoires.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormNote('Merci d’indiquer une adresse email valide.', 'error');
      return;
    }

    if (honeypot) {
      setFormNote('Votre demande a bien été reçue. Merci.', 'success');
      return;
    }

    if (startedAt && now - startedAt < MIN_FORM_TIME_MS) {
      setFormNote('Merci de patienter quelques secondes avant d’envoyer le formulaire.', 'error');
      return;
    }

    if (lastSubmit && remainingCooldown > 0) {
      const seconds = Math.ceil(remainingCooldown / 1000);
      setFormNote(`Merci d’attendre ${seconds} s avant un nouvel envoi.`, 'error');
      return;
    }

    const requestId = createContactId();
    const submittedAt = new Date(now).toISOString();
    const record = {
      id: requestId,
      submittedAt,
      name,
      email,
      phone,
      platform,
      type,
      subject,
      message,
      status: 'mailto-ready'
    };
    const saved = storeContactRecord(record);

    const body = [
      `Identifiant: ${requestId}`,
      `Date: ${submittedAt}`,
      `Nom: ${name}`,
      `Email: ${email}`,
      phone ? `Téléphone: ${phone}` : '',
      platform ? `Plateforme: ${platform}` : '',
      type ? `Type: ${type}` : '',
      saved ? 'Historique local: enregistré dans ce navigateur' : 'Historique local: indisponible dans ce navigateur',
      '',
      'Message:',
      message
    ].filter(Boolean).join('\r\n');

    const mailSubject = `[Synkora] ${subject} - ${requestId}`;
    const mailto = `mailto:contact@synkora-group.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
    const link = document.createElement('a');
    link.href = mailto;
    link.rel = 'noopener';
    document.body.append(link);
    link.click();
    link.remove();

    setFormNote(
      saved
        ? `Demande ${requestId} enregistrée dans ce navigateur. Votre application email va s’ouvrir pour envoyer la copie à l’équipe.`
        : `Demande ${requestId} préparée. Votre application email va s’ouvrir pour envoyer la copie à l’équipe.`,
      'success'
    );
  });
}

/* PWA registration is skipped from file:// so local static previews keep working. */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    const workerUrl = new URL(
      location.pathname.includes('/pages/') ? '../service-worker.js' : 'service-worker.js',
      location.href
    );

    navigator.serviceWorker.register(workerUrl.href).catch(() => {});
  });
}
