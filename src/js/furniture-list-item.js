import axios from "axios";

const moreBtn = document.querySelector("more-btn")
let page = 1;

function clearList() { 
    document.querySelector(".card-ul").innerHTML = ''
}

async function getImages(category, page = 1) {
  try {
    const response = await axios.get("https://furniture-store.b.goit.study/api-docs/furniture", {
      params: {
        limit: 15,
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

function createList(images) {
    const gallery = document.querySelector(".card-ul");
    const markup = images.map((image) => {
        const { images, name, color, price, } = image;
        return `<li class="card-li">
        <img src="${images}" alt="${name}" class="card-img">
        <p class="name">${name}</p>
        <div class="colors">${color}</div>
        <p class="price">${price} грн</p>
        <button class="more-li-btn">Детальніше</button>
        </li>`
    }).join("");
    gallery.insertAdjacentHTML("beforeend", markup);
}

document.querySelector(".furniture-list").addEventListener("click", async (ev) => {
    page = 1;
    clearList()
    try {
        const images = await getImages(ev.target.value)
        if (images.items > images.totalItems) {
            moreBtn.classList.delete("visually-hidden");
        }
        return createList(images.items);
    } catch {
        return;
    }

})

moreBtn.addEventListener("click", async (ev) => {
  ev.preventDefault()
  clearList()
  page += 1;
  try {
    const images = await getImages(ev.target.value, page);
    if (images.items.length === page * images.items.length) {
      moreBtn.classList.add("visually-hidden");
    }
    return createList(images.items);
  } catch {
    return;
  }
})