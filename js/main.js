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

// ---------- Филтер на собите (sobi.html) ----------
// На страниците без филтер листите се празни, па кодот не прави ништо
const filterButtons = document.querySelectorAll('.filter-btn');
const roomRows = document.querySelectorAll('.room-row');

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    // Која тежина е избрана: all, easy, medium или hard
    const filter = button.dataset.filter;

    // Само кликнатото копче е означено како активно
    filterButtons.forEach(function (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    // Ги прикажуваме само собите со избраната тежина
    roomRows.forEach(function (room) {
      if (filter === 'all' || room.dataset.difficulty === filter) {
        room.classList.remove('hidden');
      } else {
        room.classList.add('hidden');
      }
    });
  });
});
