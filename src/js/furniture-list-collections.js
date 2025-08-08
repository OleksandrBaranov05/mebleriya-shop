const furnitureItems = document.querySelectorAll('.furniture-item');

furnitureItems.forEach(item => {
  item.addEventListener('click', () => {
    furnitureItems.forEach(el => el.classList.remove('active'));
    item.classList.add('active');
  });
});
