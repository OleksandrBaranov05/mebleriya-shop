import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../css/feedback.css';

import { Swiper } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const BASE = 'https://furniture-store.b.goit.study/api';

const normalizeRating = r => {
  const n = Number(r) || 0;
  const half = Math.round(n * 2) / 2;
  return Math.min(5, Math.max(0, half));
};

const STAR_PATH =
  'M9.5709 1.47649C9.91464 0.612003 11.0854 0.612004 11.4291 1.47649L13.4579 6.57884C13.6029 6.94328 13.9306 7.19229 14.3067 7.22384L19.5727 7.66545C20.4649 7.74027 20.8267 8.90496 20.1469 9.51407L16.1348 13.1091C15.8483 13.3659 15.723 13.7688 15.8106 14.1527L17.0364 19.528C17.244 20.4387 16.2969 21.1586 15.533 20.6706L11.0246 17.79C10.7025 17.5842 10.2975 17.5842 9.9755 17.79L5.467 20.6706C4.70312 21.1586 3.75596 20.4387 3.96364 19.528L5.18943 14.1527C5.27699 13.7688 5.15183 13.3659 4.86527 13.1091L0.853063 9.51407C0.173281 8.90496 0.535068 7.74027 1.42729 7.66545L6.69337 7.22384C7.06952 7.19229 7.39717 6.94328 7.54208 6.57884L9.5709 1.47649Z';


function makeStarsSVG(
  rating,
  {
    size = 21,
    gap = 4,     
    fill = '#080c09', 
    empty = '#ffffff',
    stroke = '#080c09',
    strokeWidth = 1.5,
  } = {}
) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const totalWidth = size * 5 + gap * 4;
  const uid = 'rate' + Math.random().toString(36).slice(2, 9);

  const parts = [];
  const defs = [];

  for (let i = 0; i < 5; i++) {
    const x = i * (size + gap);

    if (i < full) {
     
      parts.push(
        `<path d="${STAR_PATH}" transform="translate(${x} 0)" fill="${fill}"/>`
      );
    } else if (i === full && hasHalf) {
      
      parts.push(
        `<path d="${STAR_PATH}" transform="translate(${x} 0)" fill="${empty}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`
      );
  
      const clipId = `${uid}-h${i}`;
      defs.push(
        `<clipPath id="${clipId}"><rect x="0" y="0" width="${size / 2}" height="${size}"/></clipPath>`
      );
      parts.push(
        `<g transform="translate(${x} 0)" clip-path="url(#${clipId})"><path d="${STAR_PATH}" fill="${fill}"/></g>`
      );
    } else {
      parts.push(
        `<path d="${STAR_PATH}" transform="translate(${x} 0)" fill="${empty}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`
      );
    }
  }

  return `
    <svg class="rating-stars" width="${totalWidth}" height="${size}" viewBox="0 0 ${totalWidth} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      ${defs.length ? `<defs>${defs.join('')}</defs>` : ''}
      ${parts.join('')}
    </svg>
  `;
}

const slideTpl = item => {
  const name = item.name || 'Анонім';
  const text = item.descr || '';
  const rating = normalizeRating(item.rate || 0);

  return `
    <div class="swiper-slide">
      <article class="feedback-card">
        <div class="feedback-card__stars">
          ${makeStarsSVG(rating)}
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

function initSwiper() {
  return new Swiper('.feedbacks-swiper', {
    modules: [Navigation, Pagination],
    speed: 400,
    spaceBetween: 24,
    slidesPerView: 1,
    breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
    navigation: { prevEl: '#fbPrev', nextEl: '#fbNext', disabledClass: 'is-disabled' },
    pagination: { el: '#fbPagination', clickable: true, dynamicBullets: true, dynamicMainBullets: 6 },
  });
}

function defocusArrows() {
  document.querySelectorAll('#fbPrev, #fbNext').forEach(btn => {
    btn.addEventListener('mouseup', () => btn.blur());
    btn.addEventListener('mouseleave', () => btn.blur());
    btn.addEventListener('touchend', () => btn.blur(), { passive: true });
  });
}

async function initFeedback() {
  const wrapper = document.querySelector('#feedbacksWrapper');
  if (!wrapper) return;

  try {
    const items = await fetchFeedbacks();
    wrapper.innerHTML = items.map(slideTpl).join('');
    initSwiper();
    defocusArrows();
  } catch (e) {
    console.error(e);
    wrapper.innerHTML = '<div class="swiper-slide"><p>Сталася помилка</p></div>';
    initSwiper();
    defocusArrows();
  }
}

const observer = new MutationObserver(() => {
  if (document.querySelector('#feedbacksWrapper')) {
    observer.disconnect();
    initFeedback();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
