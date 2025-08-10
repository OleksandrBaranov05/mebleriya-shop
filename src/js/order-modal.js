const modal = document.getElementById('modal');
const openBtn = document.querySelector('.open-modal-btn');
const closeBtn = document.querySelector('.modal__close');
const overlay = document.querySelector('.modal__overlay');

openBtn.addEventListener('click', () => {
  modal.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});
