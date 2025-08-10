document.addEventListener('DOMContentLoaded', () => {
  console.log('Header script initialized');

  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMenu');
  const logo = document.getElementById('logo');
  const body = document.body;
  const loader = document.getElementById('loader');
  const notification = document.getElementById('notification');

  const toggleMobileMenu = (open = true) => {
    burger.classList.toggle('active', open);
    mobileMenu.classList.toggle('active', open);
    body.classList.toggle('menu-open', open);
  };

  burger?.addEventListener('click', () => toggleMobileMenu(true));
  closeMenuBtn?.addEventListener('click', () => toggleMobileMenu(false));

  mobileMenu?.addEventListener('click', e => {
    if (e.target === mobileMenu) toggleMobileMenu(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
      toggleMobileMenu(false);
    }
  });

  document
    .querySelectorAll('.mobile-nav-link, .mobile-cta-button')
    .forEach(link => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  logo?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const showLoader = () => loader && (loader.style.display = 'flex');
  const hideLoader = () => loader && (loader.style.display = 'none');

  hideLoader(); 

  const showNotification = (message, type = 'error') => {
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 4000);
  };

  const loadFurniture = async category => {
    showLoader();
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (Math.random() > 0.2) {
        showNotification(
          `Каталог "${category}" успішно завантажено!`,
          'success'
        );
      } else {
        throw new Error();
      }
    } catch {
      showNotification('Виникла помилка при завантаженні. Спробуйте пізніше.');
    } finally {
      hideLoader();
    }
  };

  document.querySelectorAll('a, button').forEach(el => {
    el.style.cursor = 'pointer';
  });

  if (window.devicePixelRatio > 1) {
    console.log('Retina display detected - loading high-res images');
  }

  window.loadFurniture = loadFurniture;
});