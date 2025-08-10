
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

  let currentProduct = null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const productsList = $('#productsList');

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function getCategoryText(category) {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return (
        category.name ??
        category.title ??
        category.label ??
        Object.values(category).find(v => typeof v === 'string') ??
        ''
      );
    }
    return '';
  }

  function getRating(p) {
    const r = p.rating;
    if (typeof r === 'number') return r;
    if (r && typeof r === 'object') return r.value ?? r.rate ?? r.score ?? r.stars ?? 0;
    if (typeof p.stars === 'number') return p.stars;
    if (typeof p.score === 'number') return p.score;
    if (typeof p.popularity === 'number') return Math.min(5, p.popularity);
    return 4.8;
  }

  function getColors(p) {
    const list = Array.isArray(p.colors || p.colours) ? (p.colors || p.colours) : [];
    const toCss = x => typeof x === 'string' ? x : (x && (x.hex ?? x.color ?? x.value ?? x.name)) || null;
    const out = list.map(toCss).filter(Boolean);
    return out.length ? out : ['#111', '#c0c0c0', '#f5f5f5'];
  }

  function open() {
    modal.hidden = false;
    document.body.classList.add('no-scroll');
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

  function getSelectedColor() {
    const checked = colorsForm.querySelector('input[name="color"]:checked');
    return checked ? checked.value : null;
  }

  orderBtn.addEventListener('click', () => {
    const detail = {
      productId: currentProduct?._id,
      title: titleEl.textContent,
      color: getSelectedColor(),
    };
    close();
    document.dispatchEvent(new CustomEvent('open-order-modal', { detail }));
    if (typeof window.openOrderModal === 'function') window.openOrderModal(detail);
  });

  function render(product) {
    currentProduct = product;

    const title = product.title || product.name || 'Модель';
    const categoryText = getCategoryText(product.category);
    const price = product.price;
    const rating = clamp(Number(getRating(product)) || 0, 0, 5);
    const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
    const description = product.description || '';
    const colors = getColors(product);
    const size = product.size || product.sizes || product.dimensions || {};

    titleEl.textContent = title;
    catEl.textContent = categoryText;
    priceEl.textContent = (price != null) ? `${price} грн` : '';
    rateEl.style.setProperty('--value', rating);

    const imgs = images.length ? images : [''];
    mainImg.src = imgs[0] || '';
    mainImg.alt = title;

    const thumbImgs = imgs.slice(1, 3); 
    thumbs.innerHTML = thumbImgs.map((src, i) =>
      `<li>
         <button type="button" aria-label="Зображення ${i + 2}">
           <img src="${src}" alt="${title}">
         </button>
       </li>`
    ).join('');

    thumbs.onclick = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const img = btn.querySelector('img');
      if (!img) return;
      mainImg.src = img.src;
      thumbs.querySelectorAll('img').forEach(x => x.removeAttribute('aria-current'));
      img.setAttribute('aria-current', 'true');
    };

    colorsForm.innerHTML = '';
    colors.forEach((clr, idx) => {
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
    colorsForm.onchange = (e) => {
      if (e.target.name !== 'color') return;
      [...colorsForm.querySelectorAll('input[name="color"]')].forEach(cb => {
        if (cb !== e.target) cb.checked = false;
      });
    };

    descEl.textContent = description;

    sizesEl.innerHTML = '';
    const s = (typeof size === 'object' && size) ? size : {};
    const W = s.width || s.w || s.W;
    const H = s.height || s.h || s.H;
    const D = s.depth || s.length || s.d || s.L;
    if (W && H && D) {
      sizesEl.innerHTML = `<li>Розміри: ${W} x ${H} x ${D}</li>`;
    } else {
      const rows = [];
      if (W) rows.push(`Ширина: ${W}`);
      if (H) rows.push(`Висота: ${H}`);
      if (D) rows.push(`Глибина: ${D}`);
      const asString = typeof size === 'string' ? [size] : [];
      sizesEl.innerHTML = [...rows, ...asString].map(v => `<li>${v}</li>`).join('');
    }
  }

  productsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('.details-btn');
    if (!btn) return;

    const id = btn.dataset.id || btn.closest('.product-card')?.dataset.id;
    const cache = (window.__productsCache instanceof Map) ? window.__productsCache : null;
    const product = cache?.get(id);

    if (!product) {
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
