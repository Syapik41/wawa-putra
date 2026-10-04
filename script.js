const opening = document.getElementById('opening');
const openButton = document.getElementById('openButton');
const weddingSong = document.getElementById('weddingSong');
let musicStarted = false;

openButton.addEventListener('click', () => {
  if (!musicStarted) {
    musicStarted = true;
    weddingSong.play().catch(() => {
      musicStarted = false;
    });
  }
  opening.classList.add('is-opening');
  document.body.classList.add('opened');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.setTimeout(() => opening.classList.add('is-hidden'), 520);
});

const countdownTarget = new Date('2026-11-22T11:00:00+08:00').getTime();
const countdownFields = Object.fromEntries(
  [...document.querySelectorAll('[data-countdown]')].map((field) => [field.dataset.countdown, field])
);

function updateCountdown() {
  const remaining = Math.max(0, countdownTarget - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000)
  };

  Object.entries(values).forEach(([unit, value]) => {
    countdownFields[unit].textContent = String(value).padStart(2, '0');
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const bottomNav = document.getElementById('bottomNav');
const navSheet = document.getElementById('navSheet');
const navSheetContent = document.getElementById('navSheetContent');
const navSheetBackdrop = document.getElementById('navSheetBackdrop');
const navSheetClose = document.getElementById('navSheetClose');
let activeSectionContent = null;
let activePlaceholder = null;
let activeNavLink = null;

function closeNavSheet(returnFocus = true) {
  if (!activeSectionContent) return;

  const previousLink = activeNavLink;
  activePlaceholder.replaceWith(activeSectionContent);
  activeSectionContent = null;
  activePlaceholder = null;
  activeNavLink = null;
  navSheet.classList.remove('is-open');
  navSheetContent.className = 'nav-sheet-content';
  navSheetBackdrop.hidden = true;
  document.body.classList.remove('sheet-open');
  bottomNav.querySelectorAll('a[aria-current]').forEach((link) => link.removeAttribute('aria-current'));
  if (window.location.hash) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
  window.setTimeout(() => {
    if (!activeSectionContent) navSheet.hidden = true;
  }, 420);
  if (returnFocus) previousLink.focus();
}

function showNavSheet(link) {
  if (activeNavLink === link) {
    closeNavSheet();
    return;
  }

  const section = document.querySelector(link.getAttribute('href'));
  const sectionContent = section?.querySelector('.section-inner');
  if (!section || !sectionContent) return;
  if (activeSectionContent) closeNavSheet(false);

  activePlaceholder = document.createComment('section content position');
  sectionContent.before(activePlaceholder);
  activeSectionContent = sectionContent;
  activeNavLink = link;
  navSheetContent.replaceChildren(sectionContent);
  navSheetContent.className = `nav-sheet-content ${Array.from(section.classList).filter((name) => name !== 'section').join(' ')}`;
  sectionContent.classList.add('visible');
  navSheet.setAttribute('aria-label', sectionContent.querySelector('.eyebrow')?.textContent || 'Invitation section');
  navSheet.hidden = false;
  navSheetBackdrop.hidden = false;
  document.body.classList.add('sheet-open');
  bottomNav.querySelectorAll('a[aria-current]').forEach((item) => item.removeAttribute('aria-current'));
  link.setAttribute('aria-current', 'page');
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${link.getAttribute('href')}`);
  window.requestAnimationFrame(() => navSheet.classList.add('is-open'));
  navSheetClose.focus({ preventScroll: true });
}

bottomNav.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.setAttribute('aria-controls', 'navSheet');
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showNavSheet(link);
  });
});
navSheetClose.addEventListener('click', () => closeNavSheet());
navSheetBackdrop.addEventListener('click', () => closeNavSheet());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNavSheet();
});

document.querySelectorAll('.copy-button').forEach((button) => {
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    const original = button.textContent;
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = original; }, 1800);
  });
});

document.getElementById('calendarButton').addEventListener('click', () => {
  const calendar = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=The+Wedding+Of+Putra+%26+Najwa&dates=20261122T030000Z/20261122T090000Z&details=Wedding+reception+of+Putra+and+Najwa&location=Glass+House+Glenmarie';
  window.open(calendar, '_blank', 'noopener');
});

const WISHER_STORAGE_KEY = 'wedding-wishers';
const defaultWishers = [
  { name: 'Aiman & Aina', attendance: 'Attending', message: 'Semoga berjodoh hingga ke syurga 🤍' },
  { name: 'Nadia', attendance: 'Attending', message: 'Wishing you both a lifetime of happiness 🤍' },
  { name: 'Hafiz', attendance: 'Not Attending', message: 'Wishing you both a lifetime of happiness 🤍' },
  { name: 'Farah', attendance: 'Attending', message: 'Semoga berjodoh hingga ke syurga 🤍' },
  { name: 'Azri', attendance: 'Attending', message: 'Wishing you both a lifetime of happiness 🤍' }
];
const previousDefaultMessages = [
  'Tahniah atas pertunangan! 💍 Semoga bahagia selalu 🤍',
  'Tahniah korang! 💍 Semoga kekal bahagia sampai bila-bila.'
];
const legacyDefaultMessages = [
  'Semoga bahagia hingga ke jannah.',
  'Terima kasih atas undangan. Selamat pengantin baru!',
  'Doakan kami semoga sentiasa diberkati.',
  'Moga rumah tangga diberkati dan dilimpahi rezeki.',
  'Tahniah! Semoga sentiasa bahagia bersama.'
];
const wisherList = document.getElementById('wisherList');
const footerStats = document.querySelector('footer p:nth-of-type(2)');

function applyDefaultWishers() {
  localStorage.setItem(WISHER_STORAGE_KEY, JSON.stringify(defaultWishers));
  return [...defaultWishers];
}

function formatWishers() {
  const savedWishers = localStorage.getItem(WISHER_STORAGE_KEY);

  if (!savedWishers) return applyDefaultWishers();

  try {
    const parsed = JSON.parse(savedWishers);
    if (!Array.isArray(parsed) || parsed.length === 0) return applyDefaultWishers();

    const hasLegacyDefault = parsed.some((entry, index) => {
      const expectedEntry = defaultWishers[index];
      return expectedEntry && entry.message === legacyDefaultMessages[index];
    });

    if (hasLegacyDefault) return applyDefaultWishers();
    const updated = parsed.map((entry) => {
      const defaultEntry = defaultWishers.find((wisher) => wisher.name === entry.name);
      if (!defaultEntry || !previousDefaultMessages.includes(entry.message)) return entry;
      return { ...entry, message: defaultEntry.message };
    });
    localStorage.setItem(WISHER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return applyDefaultWishers();
  }
}

function updateFooterStats(wishers) {
  if (!footerStats) return;

  const attending = wishers.filter((wisher) => wisher.attendance === 'Attending').length;
  const totalWishes = wishers.length;
  footerStats.innerHTML = `ATTENDANCE &nbsp; ${attending} &nbsp; ${totalWishes} &nbsp; WISHES`;
}

function renderWishers() {
  const wishers = formatWishers();

  if (!wisherList) return;

  wisherList.innerHTML = wishers.map((wisher) => `
    <article class="wisher-card">
      <header>
        <h3>${wisher.name}</h3>
        <span>${wisher.attendance}</span>
      </header>
      <p>${wisher.message || 'No message provided.'}</p>
    </article>
  `).join('');

  updateFooterStats(wishers);
}

document.getElementById('rsvpForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const nameInput = form.querySelector('input[type="text"]');
  const attendanceInput = form.querySelector('input[name="attendance"]:checked');
  const messageInput = form.querySelector('textarea');

  const entry = {
    name: nameInput.value.trim() || 'Guest',
    attendance: attendanceInput ? attendanceInput.value : 'Attending',
    message: messageInput.value.trim()
  };

  const wishers = formatWishers();
  wishers.unshift(entry);
  localStorage.setItem(WISHER_STORAGE_KEY, JSON.stringify(wishers));
  renderWishers();

  document.getElementById('formMessage').textContent = 'Thank you. Your response has been recorded.';
  form.reset();
  form.querySelector('input[name="attendance"][value="Attending"]').checked = true;
});

renderWishers();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add(entry.target.matches('.programme-timeline') ? 'is-animated' : 'visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelectorAll('.programme-timeline').forEach((element) => observer.observe(element));
