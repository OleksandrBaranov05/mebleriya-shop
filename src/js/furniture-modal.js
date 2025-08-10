// Furniture Details Modal
// Works with the existing gallery grid (#productsList) and "Детальніше" buttons.
// Minimal integration is required: add data-id for each card/button and cache the product (see patch below).

(function () {
  const modal = document.getElementById('furnitureModal');
  const mainImg = modal.querySelector('.furn-modal__main-img');
  const thumbs = modal.querySelector('.furn-modal__thumbs');
  const titleEl = modal.querySelector('.furn-modal__title');
  const catEl = modal.querySelector('.furn-modal__category');
  const priceEl = modal.querySelector('.furn-modal__price');
  const rateEl = modal.querySelector('.furn-modal__rating');
  const colorsForm = modal.querySelector('.furn-modal__colors');
  const descEl = modal.querySelector('.furn-modal__desc');
  const sizesEl = modal.querySelector('.furn-modal__sizes');
  const orderBtn = modal.querySelector('.furn-modal__order');

  // helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const productsList = $('#productsList'); // existing container from your markup

  // open/close
  function open() {
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    // focus close for accessibility
    modal.querySelector('[data-close]').focus({ preventScroll: true });
    window.addEventListener('keydown', onEsc);
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    window.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) {
    if (e.key === 'Escape') close();
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) close();
  });

  orderBtn.addEventListener('click', () => {
    // Close details modal
    close();
    // Open order modal if your app listens to this event
    document.dispatchEvent(new CustomEvent('open-order-modal', { detail: { from: 'furniture-details' } }));
    // Or trigger existing modal if you have one with a function:
    const maybe = window.openOrderModal;
    if (typeof maybe === 'function') maybe();
  });

  // main renderer
  function render(product) {
    const {
      title = product.name || 'Модель',
      category = product.category?.name || product.category || '',
      price,
      rating = product.rating ?? product.stars ?? 0,
      images = product.images || (product.image ? [product.image] : []),
      description = product.description || '',
      colors = product.colors || product.colours || [],
      size = product.size || product.sizes || product.dimensions || {}
    } = product;

    // Title, category, price
    titleEl.textContent = title;
    catEl.textContent = category ? `Категорія: ${category}` : '';
    priceEl.textContent = (price != null) ? `${price} грн` : '';

    // Rating 0..5 (supports float)
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    rateEl.style.setProperty('--value', clamp(Number(rating) || 0, 0, 5));

    // Images
    const imgs = images.length ? images : [''];
    mainImg.src = imgs[0] || '';
    mainImg.alt = title;

    thumbs.innerHTML = imgs.slice(0, 3).map((src, i) =>
      `<li><button type="button" aria-label="Зображення ${i+1}">
         <img src="${src}" alt="${title}" ${i===0?'aria-current="true"':''}>
       </button></li>`).join('');

    thumbs.addEventListener('click', onThumbClick);
    function onThumbClick(e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      const img = btn.querySelector('img');
      if (!img) return;
      mainImg.src = img.src;
      thumbs.querySelectorAll('img').forEach(x => x.removeAttribute('aria-current'));
      img.setAttribute('aria-current', 'true');
    }

    // Colors (single-select UX built with checkboxes)
    colorsForm.innerHTML = '';
    const list = (Array.isArray(colors) ? colors : []).filter(Boolean);
    list.forEach((clr, idx) => {
      const id = `color-${product._id || title}-${idx}`;
      const wrap = document.createElement('label');
      wrap.className = 'furn-color';
      wrap.style.background = clr;
      wrap.title = typeof clr === 'string' ? clr : 'Колір';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'color';
      input.value = clr;
      if (idx === 0) input.checked = true;

      wrap.appendChild(input);
      colorsForm.appendChild(wrap);
    });
    // ensure only one checked at a time (checkbox UI, radio behavior)
    colorsForm.addEventListener('change', (e) => {
      if (e.target.name !== 'color') return;
      [...colorsForm.querySelectorAll('input[name="color"]')].forEach(cb => {
        if (cb !== e.target) cb.checked = false;
      });
    }, { once: true });

    // Description
    descEl.textContent = description;

    // Sizes
    sizesEl.innerHTML = '';
    const s = (typeof size === 'object' && size) ? size : {};
    const rows = [];
    if (s.width) rows.push(`Ширина: ${s.width}`);
    if (s.height) rows.push(`Висота: ${s.height}`);
    if (s.depth || s.length) rows.push(`Глибина: ${s.depth ?? s.length}`);
    if (!rows.length && typeof size === 'string') rows.push(size);
    sizesEl.innerHTML = rows.map(v => `<li>${v}</li>`).join('');
  }

  // open from card button
  productsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('.details-btn');
    if (!btn) return;

    // Product is pulled from global cache written by the list renderer (see patch below)
    const id = btn.dataset.id || btn.closest('.product-card')?.dataset.id;
    const cache = (window.__productsCache instanceof Map) ? window.__productsCache : null;
    const product = cache?.get(id);

    if (!product) {
      // Fallback: try to read from DOM (title/price) — not ideal, but keeps the modal usable.
      const card = btn.closest('.product-card');
      const title = card?.querySelector('.gallery-title')?.textContent?.trim();
      const img = card?.querySelector('img')?.src;
      const price = card?.querySelector('.gallery-text')?.textContent?.trim();
      render({ title, images: [img], price });
    } else {
      render(product);
    }
    open();
  });
})();
