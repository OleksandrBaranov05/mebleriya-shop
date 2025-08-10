import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../css/feedback.css';

import { Swiper } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import raterJs from 'rater-js';

const BASE = 'https://furniture-store.b.goit.study/api';

const normalizeRating = r => {
  const n = Number(r) || 0;
  if (n >= 3.3 && n <= 3.7) return 3.5;
  if (n >= 3.8 && n <= 4.2) return 4;
  return Math.round(n * 2) / 2;
};

const slideTpl = item => {
  const name = item.name || 'Анонім';
  const text = item.descr || '';
  const rating = normalizeRating(item.rate || 0);

  return `
    <div class="swiper-slide">
      <article class="feedback-card">
        <div class="feedback-card__stars">
          <div class="rating" data-rating="${rating}"></div>
        </div>
        <p class="feedback-card__text">“${text}”</p>
        <p class="feedback-card__name">${name}</p>
      </article>
    </div>
  `;
};

async function fetchFeedbacks() {
  const res = await fetch(`${BASE}/feedbacks`);
  if (!res.ok) throw new Error('Feedbacks fetch failed');
  const data = await res.json();
  return Array.isArray(data.feedbacks) ? data.feedbacks.slice(0, 10) : [];
}

function mountStars(root) {
  root.querySelectorAll('.rating').forEach(el => {
    const val = Number(el.dataset.rating) || 0;
    raterJs({
      element: el,
      readOnly: true,
      rating: val,
      step: 0.5,
      max: 5,
      starSize: 21,
    });
  });
}

function initSwiper() {
  return new Swiper('.feedbacks-swiper', {
    modules: [Navigation, Pagination],
    speed: 400,
    spaceBetween: 24,
    slidesPerView: 1,
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
    navigation: {
      prevEl: '#fbPrev',
      nextEl: '#fbNext',
      disabledClass: 'is-disabled',
    },
    pagination: {
      el: '#fbPagination',
      clickable: true,
      dynamicBullets: true,
      dynamicMainBullets: 6,
      // bulletClass: 'fb-bullet',
      // bulletActiveClass: 'is-active',
    },
  });
}

async function initFeedback() {
  const wrapper = document.querySelector('#feedbacksWrapper');
  if (!wrapper) return;

  try {
    const items = await fetchFeedbacks();
    wrapper.innerHTML = items.map(slideTpl).join('');
    mountStars(document);
    initSwiper();
  } catch (e) {
    console.error(e);
    wrapper.innerHTML =
      '<div class="swiper-slide"><p>Сталася помилка</p></div>';
    initSwiper();
  }
}

const observer = new MutationObserver(() => {
  if (document.querySelector('#feedbacksWrapper')) {
    observer.disconnect();
    initFeedback();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
