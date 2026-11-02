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

/* Équipe et identité légale : rendues depuis js/team-data.js, rien n'apparaît tant que c'est vide. */
(() => {
  const company = window.SYNKORA_COMPANY || {};
  const team = window.SYNKORA_TEAM || {};
  const clean = (value) => (typeof value === 'string' ? value.trim() : '');
  const named = (list) => (Array.isArray(list) ? list.filter((person) => person && clean(person.name)) : []);

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

  const avatar = (person, size) => {
    const photo = clean(person.photo);
    const wrap = el('div', `team-avatar team-avatar-${size}`);
    if (photo) {
      const img = el('img');
      img.src = photo;
      img.alt = '';
      img.loading = 'lazy';
      wrap.append(img);
    } else {
      wrap.textContent = initials(clean(person.name));
      wrap.setAttribute('aria-hidden', 'true');
    }
    return wrap;
  };

  /* Fiche d'une personne : photo, fonction, formations et parcours. */
  const dialog = document.querySelector('[data-team-profile]');
  const entries = (list, primary, secondary, third) => (Array.isArray(list) ? list : [])
    .map((item) => [clean(item && item[primary]), clean(item && item[secondary]), clean(item && item[third])])
    .filter(([main]) => main);

  const openProfile = (person) => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const body = dialog.querySelector('[data-team-profile-body]');
    body.replaceChildren();

    const head = el('div', 'team-profile-head');
    const titles = el('div');
    titles.append(el('h2', '', clean(person.name)));
    if (clean(person.title)) titles.append(el('p', 'team-person-title', clean(person.title)));
    head.append(avatar(person, 'xl'), titles);
    body.append(head);

    if (clean(person.bio) || clean(person.focus)) body.append(el('p', 'team-profile-bio', clean(person.bio) || clean(person.focus)));

    [['Formations', entries(person.education, 'title', 'school', 'year')],
      ['Parcours', entries(person.career, 'title', 'org', 'period')]].forEach(([label, items]) => {
      if (!items.length) return;
      body.append(el('h3', 'team-profile-label', label));
      const list = el('ul', 'team-profile-list');
      items.forEach(([main, place, when]) => {
        const item = el('li');
        item.append(el('strong', '', main));
        const meta = [place, when].filter(Boolean).join(' · ');
        if (meta) item.append(el('span', '', meta));
        list.append(item);
      });
      body.append(list);
    });

    dialog.showModal();
  };

  if (dialog) {
    dialog.querySelector('[data-team-profile-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }

  const personCard = (person) => {
    const card = el('button', 'team-person');
    card.type = 'button';
    card.setAttribute('aria-haspopup', 'dialog');
    const info = el('span', 'team-person-info');
    info.append(el('strong', 'team-person-name', clean(person.name)));
    if (clean(person.title)) info.append(el('span', 'team-person-title', clean(person.title)));
    if (clean(person.focus)) info.append(el('span', 'team-person-focus', clean(person.focus)));
    card.append(avatar(person, 'lg'), info);
    card.addEventListener('click', () => openProfile(person));
    return card;
  };

  const collaborator = (person) => {
    const item = el('li');
    const button = el('button', 'team-collaborator');
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.append(avatar(person, 'sm'), el('span', '', clean(person.name)));
    button.addEventListener('click', () => openProfile(person));
    item.append(button);
    return item;
  };

  /* Identité légale complète = sous-titre factuel. */
  const legalName = clean(company.name) || 'Synkora Group';
  const hasRegistration = clean(company.legalForm) && clean(company.registeredIn) && clean(company.registration);

  const section = document.querySelector('[data-team]');
  if (section) {
    const direction = named(team.direction);
    const board = named(team.board);
    const areas = (Array.isArray(team.areas) ? team.areas : [])
      .map((area) => ({ ...area, people: named(area.people) }))
      .filter((area) => area.people.length);

    const legalLine = section.querySelector('[data-team-legal]');
    if (legalLine && hasRegistration) {
      legalLine.textContent = `${legalName}, société ${clean(company.legalForm)} immatriculée ${clean(company.registeredIn)} sous le numéro ${clean(company.registration)}.`;
      legalLine.hidden = false;
    }

    const directionWrap = section.querySelector('[data-team-direction]');
    if (directionWrap && (direction.length || board.length)) {
      if (direction.length) {
        const grid = el('div', 'team-direction-grid');
        direction.forEach((person) => grid.append(personCard(person)));
        directionWrap.append(grid);
      }
      if (board.length) {
        directionWrap.append(el('h3', 'team-board-title', 'Conseil'));
        const list = el('ul', 'team-collaborators');
        board.forEach((person) => {
          const item = collaborator(person);
          if (clean(person.title)) item.firstChild.append(el('small', '', clean(person.title)));
          list.append(item);
        });
        directionWrap.append(list);
      }
      directionWrap.hidden = false;
    }

    const areasWrap = section.querySelector('[data-team-areas]');
    const tabs = section.querySelector('[data-team-tabs]');
    const panels = section.querySelector('[data-team-panels]');
    if (areasWrap && tabs && panels && areas.length) {
      const select = (id) => {
        tabs.querySelectorAll('[role="tab"]').forEach((tab) => {
          const active = tab.dataset.area === id;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
        });
        panels.querySelectorAll('[role="tabpanel"]').forEach((panel) => { panel.hidden = panel.dataset.area !== id; });
      };

      areas.forEach((area, index) => {
        const tab = el('button', 'team-tab', clean(area.label));
        tab.type = 'button';
        tab.setAttribute('role', 'tab');
        tab.id = `team-tab-${area.id}`;
        tab.dataset.area = area.id;
        tab.setAttribute('aria-controls', `team-panel-${area.id}`);
        tab.addEventListener('click', () => select(area.id));
        tab.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          const step = event.key === 'ArrowRight' ? 1 : -1;
          const next = areas[(index + step + areas.length) % areas.length];
          select(next.id);
          tabs.querySelector(`[data-area="${next.id}"]`).focus();
        });
        tabs.append(tab);

        const panel = el('div', 'team-panel');
        panel.setAttribute('role', 'tabpanel');
        panel.id = `team-panel-${area.id}`;
        panel.dataset.area = area.id;
        panel.setAttribute('aria-labelledby', tab.id);
        const leads = area.people.filter((person) => person.lead);
        const others = area.people.filter((person) => !person.lead);
        if (leads.length) {
          const grid = el('div', 'team-grid-people');
          leads.forEach((person) => grid.append(personCard(person)));
          panel.append(grid);
        }
        if (others.length) {
          const list = el('ul', 'team-collaborators');
          others.forEach((person) => list.append(collaborator(person)));
          panel.append(list);
        }
        panels.append(panel);
      });

      select(areas[0].id);
      areasWrap.hidden = false;
    }

    const hasPeople = direction.length || board.length || areas.length;
    section.hidden = !hasPeople;
    if (hasPeople) section.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-visible'));
  }

  /* Liens « Équipe » masqués tant qu'aucune personne n'est nommée. */
  const anyone = named(team.direction).length || named(team.board).length
    || (Array.isArray(team.areas) && team.areas.some((area) => named(area && area.people).length));
  if (!anyone) {
    document.querySelectorAll('a[href="#equipes"], a[href$="index.html#equipes"]').forEach((link) => { link.hidden = true; });
  }

  /* Bloc légal en bas de page : seulement les champs renseignés. */
  const footer = document.querySelector('.site-footer');
  const facts = [
    ['Dénomination', legalName],
    ['Forme', clean(company.legalForm)],
    ['Pays', clean(company.country)],
    ["N° d'immatriculation", clean(company.registration)],
    ['Constitution', clean(company.founded)]
  ];
  if (footer && hasRegistration) {
    const block = el('div', 'container footer-legal');
    const list = el('dl');
    facts.filter(([, value]) => value).forEach(([label, value]) => {
      const row = el('div');
      row.append(el('dt', '', label), el('dd', '', value));
      list.append(row);
    });
    block.append(list);
    footer.append(block);
  }
})();
