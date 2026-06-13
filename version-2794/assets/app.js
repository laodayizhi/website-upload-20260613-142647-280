(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-slide') || '0', 10);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll('.filter-bar'));
    filterBars.forEach(function (bar) {
        var list = bar.parentElement.querySelector('.searchable-list');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
        var search = bar.querySelector('.list-search');
        var year = bar.querySelector('.year-filter');
        var type = bar.querySelector('.type-filter');

        function runFilter() {
            var q = normalize(search && search.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            cards.forEach(function (card) {
                var content = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var match = (!q || content.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType === t);
                card.classList.toggle('is-hidden', !match);
            });
        }

        [search, year, type].forEach(function (el) {
            if (el) {
                el.addEventListener('input', runFilter);
                el.addEventListener('change', runFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && search) {
            search.value = q;
            runFilter();
        }
    });

    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var stream = shell.getAttribute('data-stream');
        var hlsInstance = null;
        var loaded = false;

        function start() {
            if (!video || !stream) {
                return;
            }
            if (cover) {
                cover.classList.add('hidden');
            }
            video.setAttribute('controls', 'controls');
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    loaded = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    loaded = true;
                } else {
                    video.src = stream;
                    loaded = true;
                }
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
