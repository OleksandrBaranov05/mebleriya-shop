document.addEventListener('DOMContentLoaded', () => {
  console.log('Footer script initialized');

  document.querySelectorAll('.nav-footer a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        console.warn(`Элемент с id="${targetId}" не найден на странице.`);
      }
    });
  });

  const copyright = document.querySelector('.copyright');
  if (copyright) {
    const currentYear = new Date().getFullYear();
    copyright.innerHTML = `&copy; ${currentYear} Relume. Всі права захищені`;
  }
});
