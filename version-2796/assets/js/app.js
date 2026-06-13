
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        play();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    hero.addEventListener("mouseleave", play);
    play();
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        card.style.display = haystack.indexOf(value) >= 0 ? "" : "none";
      });
    });
  }

  function setupBrokenImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.classList.add("is-hidden");
      }
    }, true);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var streamUrl = player.getAttribute("data-stream");
      var prepared = false;
      var hls = null;

      function startPlayback() {
        if (!video || !streamUrl) {
          return;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (!prepared) {
          prepared = true;
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal && hls) {
                hls.destroy();
                hls = null;
                prepared = false;
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", function () {
              video.play().catch(function () {});
            }, { once: true });
          } else {
            video.src = streamUrl;
          }
        }
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener("click", startPlayback);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback();
          }
        });
      }
    });
  }

  function setupCatalogSearch() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var starter = document.querySelector("[data-starter-grid]");
    if (!form || !results || !window.catalogItems && typeof catalogItems === "undefined") {
      return;
    }
    var items = typeof catalogItems !== "undefined" ? catalogItems : window.catalogItems;
    var input = form.querySelector("input[name='q']");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "all";
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }

    function match(item, query) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.line].join(" ").toLowerCase();
      var filterPass = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) >= 0;
      return filterPass && (!query || text.indexOf(query) >= 0);
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var found = items.filter(function (item) {
        return match(item, query);
      }).slice(0, 60);
      results.innerHTML = found.map(function (item) {
        return [
          '<a class="result-item" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
          '<span><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</p><p>' + escapeHtml(item.line) + '</p></span>',
          '<strong>' + escapeHtml(String(item.score)) + '</strong>',
          '</a>'
        ].join("");
      }).join("");
      if (starter) {
        starter.style.display = query || activeFilter !== "all" ? "none" : "grid";
      }
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    if (input) {
      input.addEventListener("input", render);
    }
    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filters.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        render();
      });
    });
    if (initial) {
      render();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupBrokenImages();
    setupPlayers();
    setupCatalogSearch();
  });
})();
