const cards = document.querySelectorAll('.topic-card');

cards.forEach((card, index) => {
  card.style.setProperty('--i', index.toString());
});

const yearEl = document.querySelector('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
