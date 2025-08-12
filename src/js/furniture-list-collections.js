document.addEventListener('DOMContentLoaded', () => {
  const furnitureItems = document.querySelectorAll('.furniture-item');

  function setDefaultActive() {
    
    let target =
      document.querySelector('.furniture-item[data-cat="all"]') ||
   
      document.querySelector('.furniture-item-all') ||
    
      Array.from(furnitureItems).find(
        el => el.querySelector('.furniture-text')?.textContent.trim() === 'Всі товари'
      ) ||
    
      furnitureItems[0];

    if (target) {
      furnitureItems.forEach(el => el.classList.remove('active'));
      target.classList.add('active');
    }
  }

  furnitureItems.forEach(item => {
    item.addEventListener('click', () => {
      furnitureItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });

  setDefaultActive();
});
