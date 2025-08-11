const BASE = 'https://furniture-store.b.goit.study/api';
const catsList = document.getElementById('categoryList');
const grid = document.getElementById('productsList');
const more = document.getElementById('loadMoreBtn');

let activeCat = 'all';
let page = 1;
let limit = 8;
let total = 0;
let loadingMore = false;

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

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

function getColors(p) {
  const raw = Array.isArray(p?.colors || p?.colours) ? (p.colors || p.colours) : [];
  const toCss = x =>
    typeof x === 'string' ? x : (x && (x.hex ?? x.color ?? x.value ?? x.name)) || null;
  const list = raw.map(toCss).filter(Boolean);
  const safe = list.length ? list : ['#111111', '#c0c0c0', '#f5f5f5'];
  return safe.slice(0, 3);
}

async function initCategories() {
  const cats = await api.categories();
  const map = new Map(cats.map(c => [c.name.trim(), c._id]));
  catsList.querySelectorAll('.furniture-item').forEach(li => {
    const name = li.querySelector('.furniture-text')?.textContent.trim();
    li.dataset.cat = name === 'Всі товари' ? 'all' : map.get(name) || '';
  });
}

function clearProducts() {
  grid.innerHTML = '';
}

function appendProducts(arr) {
  window.__productsCache = window.__productsCache || new Map();
  arr.forEach(p => window.__productsCache.set(p._id, p));

  const html = arr.map(p => {
    const title = p.title || p.name || 'Без назви';
    const img = p.image || p.img || (p.images && p.images[0]) || '';
    const price = p.price != null ? `${p.price} грн` : '';
    const colors = getColors(p).slice(0, 3);

    const colorsHTML = `
      <ul class="card-colors">
        ${colors
          .map(
            c =>
              `<li class="card-color" title="${typeof c === 'string' ? c : 'Колір'}" style="background:${c}"></li>`
          )
          .join('')}
      </ul>
    `;

    return `<li class="product-card" data-id="${p._id}">
      ${img ? `<img src="${img}" alt="${title}">` : ''}
      <h3 class="gallery-title">${title}</h3>
      ${colorsHTML}
      ${price ? `<p class="gallery-text">${price}</p>` : ''}
      <button class="details-btn" data-id="${p._id}" type="button">Детальніше</button>
    </li>`;
  }).join('');

  grid.insertAdjacentHTML('beforeend', html);
}


function updateMore(receivedCount) {
  const shown = grid.querySelectorAll('.product-card').length;
  const finished = receivedCount < limit || shown >= total;
  more.hidden = finished;
  more.disabled = finished;
}

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

(async function init() {
  await initCategories();
  await loadFirstPage();
})();
