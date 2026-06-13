document.addEventListener('DOMContentLoaded', function () {
  initMobileNavigation();
  initHeroCarousel();
  initFilters();
  initImageFallbacks();
});

function initMobileNavigation() {
  var button = document.querySelector('[data-mobile-menu-button]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function initHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentIndex = 0;

  if (slides.length === 0) {
    return;
  }

  function showSlide(nextIndex) {
    currentIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === currentIndex);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === currentIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(nextIndex);
    });
  });

  window.setInterval(function () {
    showSlide(currentIndex + 1);
  }, 5200);
}

function initFilters() {
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-target]'));
  var filterGroups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target]'));

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input.getAttribute('data-search-target'));
    });
  });

  filterGroups.forEach(function (group) {
    var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        applyFilter(group.getAttribute('data-filter-target'));
      });
    });
  });
}

function applyFilter(targetSelector) {
  if (!targetSelector) {
    return;
  }

  var scope = document.querySelector(targetSelector);

  if (!scope) {
    return;
  }

  var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
  var searchInput = scope.querySelector('[data-search-target="' + targetSelector + '"]');
  var activeButton = scope.querySelector('.filter-button.is-active');
  var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
  var filterValue = activeButton ? activeButton.getAttribute('data-filter-value') : 'all';
  var visibleCount = 0;

  cards.forEach(function (card) {
    var searchText = (card.getAttribute('data-search-text') || '').toLowerCase();
    var matchesKeyword = keyword === '' || searchText.indexOf(keyword) !== -1;
    var matchesFilter = filterValue === 'all' || searchText.indexOf(String(filterValue).toLowerCase()) !== -1;
    var isVisible = matchesKeyword && matchesFilter;

    card.classList.toggle('is-hidden', !isVisible);

    if (isVisible) {
      visibleCount += 1;
    }
  });

  var resultCount = scope.querySelector('[data-result-count]');

  if (resultCount) {
    resultCount.textContent = '共 ' + visibleCount + ' 部影片';
  }
}

function initImageFallbacks() {
  var images = Array.prototype.slice.call(document.querySelectorAll('.poster-image'));

  images.forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });
}
