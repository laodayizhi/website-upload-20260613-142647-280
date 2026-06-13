(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-target]"));
        if (!slides.length || !thumbs.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = index;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            thumbs.forEach(function (thumb, position) {
                thumb.classList.toggle("active", position === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5600);
        }
        thumbs.forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                var index = Number(thumb.getAttribute("data-hero-target"));
                show(index);
                start();
            });
        });
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var scope = document.querySelector("[data-card-scope]");
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var input = document.querySelector(".filter-input");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var reset = document.querySelector(".filter-reset");
        var empty = document.querySelector(".no-results");
        if (input) {
            input.value = getQueryValue("q");
        }
        function matchCard(card) {
            var keyword = normalize(input ? input.value : "");
            var text = normalize(card.getAttribute("data-search"));
            var visible = !keyword || text.indexOf(keyword) !== -1;
            selects.forEach(function (select) {
                var value = normalize(select.value);
                var field = select.getAttribute("data-filter");
                var cardValue = normalize(card.getAttribute("data-" + field));
                if (value && cardValue.indexOf(value) === -1) {
                    visible = false;
                }
            });
            return visible;
        }
        function apply() {
            var count = 0;
            cards.forEach(function (card) {
                var visible = matchCard(card);
                card.style.display = visible ? "" : "none";
                if (visible) {
                    count += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", count === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                selects.forEach(function (select) {
                    select.value = "";
                });
                apply();
            });
        }
        apply();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("play-overlay");
        var button = document.getElementById("play-button");
        var started = false;
        var hlsInstance = null;
        if (!video || !streamUrl) {
            return;
        }
        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }
        function start() {
            if (!started) {
                started = true;
                attach();
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
}());
