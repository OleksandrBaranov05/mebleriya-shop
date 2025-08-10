// furniture-list-item.js — версія з правильним API (/furnitures),
// кешем для модалки і коректним підрахунком "Показати ще".

const BASE = 'https://furniture-store.b.goit.study/api';

// DOM
const catsList = document.getElementById('categoryList');
const grid = document.getElementById('productsList');
const more = document.getElementById('loadMoreBtn');

// state
let activeCat = 'all';
let page = 1;
let limit = 8;
let total = 0;
let loadingMore = false;

// helpers
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

// API (правильні ендпоінти)
const api = {
  categories: () => getJSON(`${BASE}/categories`),
  furnitures: (p = {}) => {
    const q = new URLSearchParams({
      page: p.page ?? 1,
      limit: p.limit ?? limit,
    });
    if (p.category && p.category !== 'all') q.set('category', p.category);
    return getJSON(`${BASE}/furnitures?${q.toString()}`);
  },
};

// ============ Категорії (будуємо data-cat з API) ============
async function initCategories() {
  const cats = await api.categories();
  const map = new Map(cats.map(c => [c.name.trim(), c._id]));
  // Назви беремо з твоєї розмітки .furniture-text і кладемо id в data-cat
  catsList.querySelectorAll('.furniture-item').forEach(li => {
    const name = li.querySelector('.furniture-text')?.textContent.trim();
    li.dataset.cat = name === 'Всі товари' ? 'all' : map.get(name) || '';
  });
}

// ============ Рендер ============

function clearProducts() {
  grid.innerHTML = '';
}

function appendProducts(arr) {
  // кеш усіх завантажених товарів для модалки
  window.__productsCache = window.__productsCache || new Map();
  arr.forEach(p => window.__productsCache.set(p._id, p));

  const html = arr
    .map(p => {
      const title = p.title || p.name || 'Без назви';
      const img = p.image || p.img || (p.images && p.images[0]) || '';
      const price = p.price != null ? `${p.price} грн` : '';
      return `<li class="product-card" data-id="${p._id}">
        ${img ? `<img src="${img}" alt="${title}">` : ''}
        <h3 class="gallery-title">${title}</h3>
        ${price ? `<p class="gallery-text">${price}</p>` : ''}
        <button class="details-btn" data-id="${p._id}" type="button">Детальніше</button>
      </li>`;
    })
    .join('');
  grid.insertAdjacentHTML('beforeend', html);
}

function updateMore(receivedCount) {
  // було grid.querySelector('.product-card').length — це помилка
  const shown = grid.querySelectorAll('.product-card').length;
  const finished = receivedCount < limit || shown >= total;
  more.hidden = finished;
  more.disabled = finished;
}

// ============ Завантаження ============

async function loadFirstPage() {
  page = 1;
  const data = await api.furnitures({ page, limit, category: activeCat });
  total = data.totalItems ?? data.total ?? data.furnitures.length;
  clearProducts();
  appendProducts(data.furnitures);
  updateMore(data.furnitures.length);
}

async function loadMore() {
  if (loadingMore) return;
  loadingMore = true;
  more.disabled = true;
  page += 1;
  try {
    const data = await api.furnitures({ page, limit, category: activeCat });
    appendProducts(data.furnitures);
    updateMore(data.furnitures.length);
  } finally {
    loadingMore = false;
    if (!more.hidden) more.disabled = false;
  }
}

// ============ Події ============

catsList.addEventListener('click', async e => {
  const li = e.target.closest('.furniture-item');
  if (!li) return;

  const cat = li.dataset.cat || 'all';
  if (cat === activeCat) return;

  activeCat = cat;
  page = 1;

  catsList.querySelectorAll('.furniture-item').forEach(x => x.classList.remove('active'));
  li.classList.add('active');

  await loadFirstPage();
});

more?.addEventListener('click', loadMore);

// ============ Старт ============
(async function init() {
  await initCategories();
  await loadFirstPage();
})();
