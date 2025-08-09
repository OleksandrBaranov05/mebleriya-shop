import axios from "axios";

const moreBtn = document.querySelector(".more-btn")
let page = 1;
let category;

function clearList() { 
    document.querySelector(".card-ul").innerHTML = ''
}

async function getImages(category, page = 1) {
  try {
    const response = await axios.get("https://furniture-store.b.goit.study/api-docs/furniture", {
      params: {
        limit: 8,
        page: page,
        category: category,
      },
    });
    
    return {
        items: response.furnitures,
        totalItems: response.totalItems,
    };
  } catch (error) {
    throw error;
  }
};

function createList(products) {
    const gallery = document.querySelector(".card-ul");
    const markup = products.map((pr) => {
        const { images, name, color, price, } = pr;
        return `<li class="card-li">
        <img src="${images[0]}" alt="${name}" class="card-img">
        <p class="name">${name}</p>
        <div class="colors">${color}</div>
        <p class="price">${price} грн</p>
        <button class="more-li-btn">Детальніше</button>
        </li>`
    }).join("");
    gallery.insertAdjacentHTML("beforeend", markup);
}

document.querySelector(".furniture-list").addEventListener("click", async (ev) => {
  category = ev.target.textContent;
    page = 1;
    clearList()
    try {
        const images = await getImages(category)
        if (images.items.length < images.totalItems) {
            moreBtn.classList.remove("visually-hidden");
        }
        return createList(images.items);
    } catch(error) {
        return error;
    }

})

moreBtn.addEventListener("click", async (ev) => {
  ev.preventDefault()
  clearList()
  page += 1;
  try {
    const images = await getImages(category, page);
    const totalShown = page * images.items.length;
    if (totalShown >= images.totalItems) {
      moreBtn.classList.add("visually-hidden");
    }
    return createList(images.items);
  } catch(error) {
    return error;
  }
})