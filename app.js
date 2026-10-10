const engagementDate = new Date('2026-11-22T11:00:00+08:00');
const cover = document.querySelector('#cover');
const envelope = document.querySelector('#envelope-stage');
const invite = document.querySelector('#page-invite');
const quickNav = document.querySelector('#quick-nav');
const backdrop = document.querySelector('#modal-backdrop');
const modalContent = document.querySelector('#modal-content');
const toast = document.querySelector('#toast');
const weddingSong = document.querySelector('#wedding-song');
const wishesEndpoint = 'https://script.google.com/macros/s/AKfycbzHl6g009AtNq-qd2NDY5gjbyQXEbQCPdy4R_nrijzxLqvq2YV2ZMj6j6F1C3LRJryz0A/exec';
let activeElementBeforeModal;
let toastTimeout;
let modalCloseTimeout;
let revealObserver;
let invitationScrollFrame;

function updateCountdown() {
  const remaining = Math.max(0, engagementDate.getTime() - Date.now());
  const values = [
    Math.floor(remaining / 86_400_000),
    Math.floor((remaining % 86_400_000) / 3_600_000),
    Math.floor((remaining % 3_600_000) / 60_000),
    Math.floor((remaining % 60_000) / 1_000),
  ];
  document.querySelectorAll('#countdown strong').forEach((element, index) => {
    element.textContent = String(values[index]).padStart(2, '0');
  });
}

function stopInvitationAutoScroll() {
  if (invitationScrollFrame === undefined) return;
  window.cancelAnimationFrame(invitationScrollFrame);
  invitationScrollFrame = undefined;
}

function startInvitationAutoScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let previousFrameTime;
  const scrollFrame = time => {
    if (previousFrameTime !== undefined) {
      const elapsed = Math.min(time - previousFrameTime, 100);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nextScroll = Math.min(maxScroll, window.scrollY + elapsed * 0.03);
      window.scrollTo(0, nextScroll);
      if (nextScroll >= maxScroll) {
        invitationScrollFrame = undefined;
        return;
      }
    }
    previousFrameTime = time;
    invitationScrollFrame = window.requestAnimationFrame(scrollFrame);
  };
  invitationScrollFrame = window.requestAnimationFrame(scrollFrame);
}

function openInvitation() {
  if (envelope.classList.contains('is-opening')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  weddingSong.play().catch(error => {
    if (error.name === 'NotAllowedError') {
      showToast('Audio disekat oleh pelayar. Cuba tekan Open Invitation sekali lagi.');
      return;
    }
    if (window.location.protocol === 'file:') {
      showToast('Untuk mainkan lagu, buka jemputan melalui pelayan web.');
      return;
    }
    console.error('Unable to play the wedding song.', error);
    showToast('Lagu tidak dapat dimainkan.');
  });
  envelope.classList.add('is-opening');
  cover.classList.add('is-opening');
  invite.classList.add('is-open');
  invite.setAttribute('aria-hidden', 'false');
  quickNav.hidden = false;
  requestAnimationFrame(() => quickNav.classList.add('is-open'));
  startScrollReveals();
  window.setTimeout(() => {
    cover.hidden = true;
    document.querySelector('#page-invite').scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    if (!reducedMotion) window.setTimeout(startInvitationAutoScroll, 1400);
  }, reducedMotion ? 0 : 1100);
}

function startScrollReveals() {
  const sections = document.querySelectorAll('[data-aos="zoom-in-up"]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    sections.forEach(section => section.classList.add('aos-animate'));
    return;
  }
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('aos-animate');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  sections.forEach(section => revealObserver.observe(section));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function heading(title) {
  return `<h2 class="modal-title" id="modal-title">${title}</h2>`;
}

function contactModal() {
  return `${heading('CONTACT')}
    <article class="contact-card">
      <h3>Safawi</h3><p>Abah</p>
      <div class="contact-actions">
        <a href="https://api.whatsapp.com/send?phone=60194423400&amp;text=" target="_blank" rel="noreferrer" aria-label="WhatsApp Ahmad"><span class="brand-icon whatsapp-icon" aria-hidden="true"></span></a>
      </div>
    </article>
    <article class="contact-card">
      <h3>Syafiq</h3><p>Adik</p>
      <div class="contact-actions">
        <a href="https://api.whatsapp.com/send?phone=601165091400&amp;text=" target="_blank" rel="noreferrer" aria-label="WhatsApp Fateh"><span class="brand-icon whatsapp-icon" aria-hidden="true"></span></a>
      </div>
    </article>`;
}

function locationModal() {
  return `${heading('LOCATION')}
    <p class="location-title">IBUNDA GRAND HALL, SELAYANG CAPITOL</p>
    <div class="modal-actions">
      <a class="action-button" href="https://www.google.com/maps/search/?api=1&amp;query=IBUNDA%20GRAND%20HALL%2C%20SELAYANG%20CAPITOL" target="_blank" rel="noreferrer">Maps</a>
      <a class="action-button secondary" href="https://waze.com/ul?q=IBUNDA%20GRAND%20HALL%2C%20SELAYANG%20CAPITOL&amp;navigate=yes" target="_blank" rel="noreferrer">Waze</a>
    </div>`;
}

function songModal() {
  return `${heading('SONG')}
    <iframe class="song-frame" title="Wedding song" src="https://www.youtube.com/embed/jtK-xIM-7tU?autoplay=0&amp;loop=1&amp;playsinline=1&amp;enablejsapi=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

function calendarModal() {
  const googleCalendar = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Putra%20%26%20Najwa%20Merisik%20%26%20Pertunangan&dates=20261122T030000Z%2F20261122T053000Z&details=Majlis%20Merisik%20%26%20Pertunangan%20Putra%20and%20Najwa&location=IBUNDA%20GRAND%20HALL%2C%20SELAYANG%20CAPITOL';
  return `${heading('Sunday, 22 November 2026')}
    <p>11:00 AM - 1:30 PM</p>
    <div class="modal-actions">
      <a class="action-button" href="${googleCalendar}" target="_blank" rel="noreferrer">Calendar</a>
      <button class="action-button secondary" type="button" data-calendar-download>Calendar</button>
    </div>`;
}

function rsvpModal() {
  return rsvpForm();
}

function rsvpForm() {
  return `${heading('RSVP & WISHES')}
    <form id="rsvp-form">
      <label class="form-field">Name*<input name="name" required maxlength="80"></label>
      <label class="form-field">Wish*<textarea name="wish" required maxlength="300"></textarea></label>
      <p class="demo-note">Your name and wish will be sent to the host's Google Sheet.</p>
      <div class="modal-actions"><button type="button" class="action-button secondary" data-close>Cancel</button><button class="action-button" type="submit">Submit</button></div>
    </form>`;
}

function openModal(name, fromQuickNav = false) {
  const templates = {
    contact: contactModal,
    location: locationModal,
    song: songModal,
    rsvp: rsvpModal,
    calendar: calendarModal,
  };
  const render = templates[name];
  if (!render) return;
  activeElementBeforeModal = document.activeElement;
  modalContent.innerHTML = render();
  backdrop.classList.remove('is-closing');
  backdrop.classList.toggle('is-nav-popup', fromQuickNav);
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => backdrop.classList.add('is-open'));
  window.setTimeout(() => backdrop.querySelector('.modal-close')?.focus(), 0);
}

function closeModal() {
  if (backdrop.hidden || backdrop.classList.contains('is-closing')) return;
  backdrop.classList.add('is-closing');
  backdrop.classList.remove('is-open');
  window.clearTimeout(modalCloseTimeout);
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;
  modalCloseTimeout = window.setTimeout(finishCloseModal, duration);
}

function finishCloseModal() {
  backdrop.hidden = true;
  backdrop.classList.remove('is-closing');
  backdrop.classList.remove('is-nav-popup');
  document.body.style.overflow = '';
  if (activeElementBeforeModal instanceof HTMLElement) activeElementBeforeModal.focus();
}

function downloadCalendar() {
  const event = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jemputan//Putra and Najwa//EN',
    'BEGIN:VEVENT',
    'UID:putra-wawa-20261122@jemputan.me',
    'DTSTAMP:20261009T000000Z',
    'DTSTART:20261122T030000Z',
    'DTEND:20261122T053000Z',
    'SUMMARY:Putra and Najwa Merisik and Pertunangan',
    'LOCATION:IBUNDA GRAND HALL\\, SELAYANG CAPITOL',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const file = new Blob([event], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'putra-and-najwa-engagement.ics';
  link.click();
  URL.revokeObjectURL(url);
}

async function copyValue(value) {
  try {
    await navigator.clipboard.writeText(value);
    showToast('Copied');
  } catch (error) {
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    if (!document.execCommand('copy')) {
      field.remove();
      showToast('Copy is unavailable in this browser');
      return;
    }
    field.remove();
    showToast('Copied');
  }
}

document.querySelector('#open-invitation').addEventListener('click', openInvitation);
document.querySelector('.scroll-down-hint').addEventListener('click', () => {
  stopInvitationAutoScroll();
  document.querySelector('.invite-intro').scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });
});
window.addEventListener('wheel', stopInvitationAutoScroll, { passive: true });
window.addEventListener('touchstart', stopInvitationAutoScroll, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
    stopInvitationAutoScroll();
  }
});
quickNav.addEventListener('click', stopInvitationAutoScroll);
backdrop.addEventListener('click', stopInvitationAutoScroll);
document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    stopInvitationAutoScroll();
    openModal(button.dataset.open, button.closest('.quick-nav') !== null);
  });
});
document.querySelector('.date').addEventListener('click', () => {
  stopInvitationAutoScroll();
  openModal('calendar');
});
document.querySelector('.date').addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal('calendar');
  }
});
document.querySelector('#cover').addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') openInvitation();
});

backdrop.addEventListener('click', event => {
  if (event.target === backdrop || event.target.closest('.modal-close,[data-close]')) {
    closeModal();
    return;
  }
  const copyButton = event.target.closest('[data-copy]');
  if (copyButton) copyValue(copyButton.dataset.copy);
  if (event.target.closest('[data-calendar-download]')) downloadCalendar();
});

backdrop.addEventListener('submit', async event => {
  if (event.target.id !== 'rsvp-form') return;
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  if (wishesEndpoint === 'PASTE_DEPLOYED_WEB_APP_URL_HERE') {
    showToast('Sambungan Google Sheets belum disediakan.');
    return;
  }
  const form = new FormData(event.target);
  const name = form.get('name').toString().trim();
  const wishText = form.get('wish').toString().trim();
  if (!wishText) {
    showToast('Sila tulis wish sebelum hantar.');
    return;
  }
  const submitButton = event.target.querySelector('[type="submit"]');
  submitButton.disabled = true;
  try {
    await fetch(wishesEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, wish: wishText }),
    });
    const entry = document.createElement('article');
    const quote = document.createElement('q');
    quote.textContent = wishText;
    const author = document.createElement('span');
    author.textContent = name;
    entry.append(quote, author);
    document.querySelector('#wishes').prepend(entry);
    closeModal();
    showToast('Wish dihantar. Sila semak Google Sheets untuk pengesahan.');
  } catch (error) {
    console.error('Unable to send the wish to Google Sheets.', error);
    showToast('Wish tidak dapat dihantar. Sila cuba lagi.');
  } finally {
    submitButton.disabled = false;
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !backdrop.hidden) closeModal();
});

updateCountdown();
window.setInterval(updateCountdown, 1000);
