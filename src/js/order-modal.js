import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
const BASE = 'https://furniture-store.b.goit.study/api';

const modal = document.getElementById('modal');
const openBtn = document.querySelector('.open-modal-btn');
const closeBtn = modal?.querySelector('.modal__close');
const overlay = modal?.querySelector('.modal__overlay');
const modalContent = modal?.querySelector('.modal__content');
const form = modal?.querySelector('form');

let handlersAttached = false;
let orderContext = { modelId: null, color: null, title: '' };

const onCloseClick = () => closeModal();
const onOverlayClick = e => { if (e.target === overlay) closeModal(); };
const onEsc = e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal(); };

const onFormSubmit = async e => {
  clearErrors();

  let ok = true;
  const nameEl  = form.querySelector('[name="name"]'); 
  const emailEl = form.querySelector('[name="email"]');
  const phoneEl = form.querySelector('[name="phone"]');
  const commEl  = form.querySelector('[name="comment"]');

  if (nameEl && !minLen(nameEl.value, 2)) { ok = false; showError(nameEl, 'Вкажіть ім’я (мінімум 2 символи).'); }
  if (!validateEmail(emailEl.value))      { ok = false; showError(emailEl, 'Некоректний email.'); }
  if (!validatePhone(phoneEl.value))      { ok = false; showError(phoneEl, 'Некоректний телефон.'); }

  if (!ok) {
    e.preventDefault();
    setStatus('Будь ласка, виправте помилки у формі.', 'error');
    (form.querySelector('[aria-invalid="true"]') || emailEl || phoneEl)?.focus();
    return;
  }

  e.preventDefault();

  const payload = {
    email: emailEl.value.trim(),
    phone: normalizePhone(phoneEl.value),
    modelId: orderContext.modelId || undefined,
    color: orderContext.color || undefined,
    comment: (commEl?.value || '').trim(),
  };

  const submitBtn = form.querySelector('.modal__submit');
  submitBtn.disabled = true;

  try {
    const res = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = 'Помилка відправки. Спробуйте ще раз.';
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {}
      notify('error', msg);
      submitBtn.disabled = false;
      return;
    }

    notify('success', 'Заявку надіслано! Ми зв’яжемося з вами найближчим часом.');
    form.reset();
    setStatus('');
    closeModal();

  } catch (err) {
    notify('error', 'Мережева помилка. Перевірте з’єднання і спробуйте пізніше.');
    submitBtn.disabled = false;
  }
};

function attachModalListeners() {
  if (handlersAttached || !modal) return;
  closeBtn?.addEventListener('click', onCloseClick);
  overlay?.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onEsc);
  form?.addEventListener('submit', onFormSubmit);
  handlersAttached = true;
}

function detachModalListeners() {
  if (!handlersAttached || !modal) return;
  closeBtn?.removeEventListener('click', onCloseClick);
  overlay?.removeEventListener('click', onOverlayClick);
  document.removeEventListener('keydown', onEsc);
  form?.removeEventListener('submit', onFormSubmit);
  handlersAttached = false;
}

function openModal(detail) {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  if (detail) {
    orderContext = {
      modelId: detail.productId || detail.modelId || null,
      color: detail.color || null,
      title: detail.title || '',
    };
  }

  attachModalListeners();
  modalContent?.focus({ preventScroll: true });
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');

  detachModalListeners();
  openBtn?.focus({ preventScroll: true });
}

openBtn?.addEventListener('click', () => openModal());
document.addEventListener('open-order-modal', e => openModal(e.detail));

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
  box.style.cssText = text ? 'margin-top:12px;font:600 13px/1.3 Raleway, sans-serif;' : 'display:none;';
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
function normalizePhone(v) {

  const d = v.replace(/\D/g, '');
  if (d.startsWith('380')) return d;
  if (d.startsWith('0')) return `38${d}`;
  return d;
}

function notify(type, message) {
  const izi = window.iziToast;
  if (!izi) {
    console[type === 'error' ? 'error' : 'log'](message);
    return;
  }
  if (type === 'error') {
    izi.error({ title: 'Помилка', message, position: 'topRight' });
  } else {
    izi.success({ title: 'Готово', message, position: 'topRight' });
  }
}

window.openOrderModal = d => openModal(d);
window.closeOrderModal = closeModal;
window.iziToast = iziToast;