const modal = document.getElementById('modal');
const openBtn = document.querySelector('.open-modal-btn');
const closeBtn = modal?.querySelector('.modal__close');
const overlay = modal?.querySelector('.modal__overlay');
const modalContent = modal?.querySelector('.modal__content');
const form = modal?.querySelector('form');

function openModal(detail) {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  if (detail) {
    modal.querySelector('[name="product"]')?.setAttribute('value', detail.title || '');
    modal.querySelector('[name="color"]')?.setAttribute('value', detail.color || '');
  }
  modalContent?.focus({ preventScroll: true });
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  openBtn?.focus({ preventScroll: true });
}

openBtn?.addEventListener('click', () => openModal());
document.addEventListener('open-order-modal', e => openModal(e.detail));
closeBtn?.addEventListener('click', closeModal);
overlay?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
});

window.openOrderModal = d => openModal(d);
window.closeOrderModal = closeModal;

function clearErrors() {
  form?.querySelectorAll('.input-error').forEach(n => n.remove());
  form?.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  setStatus('');
}

function showError(input, message) {
  input.setAttribute('aria-invalid', 'true');
  const msg = document.createElement('div');
  msg.className = 'input-error';
  msg.textContent = message;
  msg.style.cssText = 'margin-top:6px;color:#b00020;font:600 12px/1.2 Raleway, sans-serif;';
  input.insertAdjacentElement('afterend', msg);
}

function setStatus(text, type = 'info') {
  if (!form) return;
  let box = form.querySelector('.form-status');
  if (!box) {
    box = document.createElement('div');
    box.className = 'form-status';
    const submit = form.querySelector('[type="submit"]');
    (submit ? submit.parentElement : form).appendChild(box);
  }
  box.textContent = text || '';
  const color = type === 'error' ? '#b00020' : type === 'success' ? '#0e7a0d' : '#6c6f73';
  box.style.cssText = text
    ? 'margin-top:12px;font:600 13px/1.3 Raleway, sans-serif;'
    : 'display:none;';
  if (text) {
    box.style.display = 'block';
    box.style.color = color;
  }
}

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function validatePhone(v) {
  const d = v.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 15;
}
function minLen(v, n) {
  return v.trim().length >= n;
}

form?.addEventListener('submit', async e => {
  clearErrors();
  let ok = true;

  const nameEl = form.querySelector('[name="name"]');
  const emailEl = form.querySelector('[name="email"]');
  const phoneEl = form.querySelector('[name="phone"]');

  if (nameEl && !minLen(nameEl.value, 2)) { ok = false; showError(nameEl, 'Вкажіть ім’я (мінімум 2 символи).'); }
  if (emailEl && !validateEmail(emailEl.value)) { ok = false; showError(emailEl, 'Некоректний email.'); }
  if (phoneEl && !validatePhone(phoneEl.value)) { ok = false; showError(phoneEl, 'Некоректний телефон.'); }

  if (!ok) {
    e.preventDefault();
    setStatus('Будь ласка, виправте помилки у формі.', 'error');
    (form.querySelector('[aria-invalid="true"]') || nameEl || emailEl || phoneEl)?.focus();
    return;
  }
  e.preventDefault();
});
