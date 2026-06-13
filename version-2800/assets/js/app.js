(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startCarousel() {
            stopCarousel();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopCarousel() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startCarousel();
            });
        });

        carousel.addEventListener('mouseenter', stopCarousel);
        carousel.addEventListener('mouseleave', startCarousel);
        showSlide(0);
        startCarousel();
    }

    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list]'));
    var input = document.querySelector('[data-filter-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var emptyState = document.querySelector('[data-empty-state]');

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    if (input && getQueryValue()) {
        input.value = getQueryValue();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        var query = normalize(input ? input.value : '');
        var visibleCount = 0;

        lists.forEach(function (list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var content = normalize(card.getAttribute('data-search'));
                var visible = !query || content.indexOf(query) !== -1;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    function sortCards() {
        var mode = sortSelect ? sortSelect.value : 'default';
        if (mode === 'default') {
            filterCards();
            return;
        }

        lists.forEach(function (list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            cards.sort(function (a, b) {
                if (mode === 'title') {
                    return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
                }
                var av = Number(a.getAttribute('data-' + mode)) || 0;
                var bv = Number(b.getAttribute('data-' + mode)) || 0;
                return bv - av;
            });
            cards.forEach(function (card) {
                list.appendChild(card);
            });
        });

        filterCards();
    }

    if (input) {
        input.addEventListener('input', filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }

    if (input || sortSelect) {
        sortCards();
    }
})();
