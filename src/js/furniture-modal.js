

const modalBackdrop = document.querySelector('.modal-backdrop');
const modalContent = document.querySelector('.modal-content');
const modalCloseBtn = document.querySelector('.modal-close');
const productsList = document.querySelector('.card-ul');

productsList.addEventListener('click', onProductClick);

async function onProductClick(e) {
  const card = e.target.closest('.card-li');
  if (!card) return;

  const id = card.dataset.id;

  try {
    const res = await axios.get(`https://furniture-store.b.goit.study/api/furnitures/${id}`);
    openModal(res.data);
  } catch (error) {
    iziToast.error({ message: 'invalid request params', position: 'topRight' });
  }
}

function openModal(product) {
  const galleryHTML = product.images
    .map(img => `<img class="modal-img" src="${img}" alt="${product.name}" />`)
    .join('');
  
  const colorsHTML = product.colors
    .map((color, index) => `
      <label class="color-option" style="background-color: ${color}">
        <input type="checkbox" name="color" value="${color}" ${index === 0 ? 'checked' : ''} />
      </label>
    `)
    .join('');
  
  modalBackdrop.classList.remove('is-hidden');
  
  modalContent.innerHTML = `
      <div class="modal-gallery">${galleryHTML}</div>
      <h2 class="modal-tittle">${product.name}</h2>
      <p class="modal-category">${product.category}</p>
      <p class="modal-price">${product.price} грн</p>
      <p class="modal-rate">${product.rate}</p>
      <p class="modal-color"><span class="modal-color-text">Колір</span>${colorsHTML}</p>
      <p class="modal-description">${product.description}</p>
      <p class="modal-size"><span class="modal-size-text">Розміри:</span> ${product.sizes}</p>
    `;
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
  
  function closeModal() {
    modalBackdrop.classList.add('is-hidden');
    modalContent.innerHTML = '';
  }

  document.querySelector('.modal-order-btn').addEventListener('click', () => {
    closeModal();
    openOrderModal();
  });
  



 
  

  
   

  
