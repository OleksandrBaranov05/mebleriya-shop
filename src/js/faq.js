import Accordion from "accordion-js";
import "accordion-js/dist/accordion.min.css";
import "../css/faq.css";

const faqData = [
  {
    question: "Як здійснюється доставка меблів?",
    answer: "Ми доставляємо замовлення по всій Україні через надійні служби. Термін доставки зазвичай складає 3-7 днів залежно від регіону."
  },
  {
    question: "Чи є можливість вибрати колір або матеріал?",
    answer: "Так, у багатьох моделях доступні варіанти оббивки та кольорів. Усі доступні опції вказані на сторінці товару."
  },
  {
    question: "Чи можна повернути товар, якщо він не підійшов?",
    answer: "Так, ви можете повернути товар протягом 14 днів, якщо він не був у користуванні та збережений у первинному вигляді."
  },
  {
    question: "Чи надаєте ви послугу збирання меблів?",
    answer: "Так, під час оформлення замовлення можна обрати послугу збирання. Наші майстри зберуть меблі у зручний для вас час."
  },
  {
    question: "Як здійснити оплату?",
    answer: "Ми приймаємо оплату карткою онлайн, банківським переказом або післяплатою при отриманні."
  },
];

const faqContainer = document.getElementById("faq-list");

faqData.forEach(item => {
  faqContainer.innerHTML += `
    <article class="ac">
      <h3 class="ac-header">
        <button type="button" class="ac-trigger">${item.question}</button>
      </h3>
      <div class="ac-panel">
        <p class="ac-text">${item.answer}</p>
      </div>
    </article>
  `;
});


const acc = new Accordion(".accordion-container", {
  duration: 500,
  showMultiple: false,
});

document.addEventListener("click", (e) => {
  const accordionContainer = document.querySelector(".accordion-container");

  if (!accordionContainer.contains(e.target)) {
    const activeItems = document.querySelectorAll(".accordion-container .ac.is-active");
    activeItems.forEach((item, index) => {
      const allItems = Array.from(document.querySelectorAll(".accordion-container .ac"));
      const itemIndex = allItems.indexOf(item);
      if (itemIndex !== -1) {
        acc.close(itemIndex);
      }
    });
  }
});