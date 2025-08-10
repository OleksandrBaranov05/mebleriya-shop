
const modal = document.getElementById('modal');
const openBtn = document.querySelector('.open-modal-btn');
const closeBtn = document.querySelector('.modal__close');
const overlay = document.querySelector('.modal__overlay');
const modalContent = document.querySelector('.modal__content');

openBtn.addEventListener('click', () => {
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  modalContent.focus();
});

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  openBtn.focus();
}
