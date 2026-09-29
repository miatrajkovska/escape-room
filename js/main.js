// =========================================
// Enigma Escape – заеднички JavaScript
// =========================================

// ---------- Мени на мобилен ----------
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', function () {
    // Ја додава класата ако ја нема, ја брише ако ја има
    const isOpen = mainNav.classList.toggle('nav-open');

    // За читачи на екран: дали менито е отворено
    menuToggle.setAttribute('aria-expanded', isOpen);
  });
}
