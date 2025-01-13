let currentIndex = 1;
const cards = document.querySelectorAll(".testimonial-card");
const container = document.querySelector(".container");

function updateCardVisibility() {
  cards.forEach((card, index) => {
    if (index + 1 === currentIndex) {
      card.classList.add("active");
      container.style.transform = `translateY(-${(currentIndex - 1) * 370}px)`; // Adjust the card position vertically
    } else {
      card.classList.remove("active");
    }
  });
}

function nextCard() {
  if (currentIndex < cards.length) {
    currentIndex++;
  } else {
    currentIndex = 1;
  }
  updateCardVisibility();
}

function prevCard() {
  if (currentIndex > 1) {
    currentIndex--;
  } else {
    currentIndex = cards.length;
  }
  updateCardVisibility();
}

updateCardVisibility();

window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowDown") {
    nextCard();
  } else if (event.key === "ArrowUp") {
    prevCard();
  }
});
