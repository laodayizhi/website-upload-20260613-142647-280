(function() {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      var isOpen = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(next) {
      active = (next + slides.length) % slides.length;
      slides.forEach(function(slide, index) {
        slide.classList.toggle("is-active", index === active);
      });
      dots.forEach(function(dot, index) {
        dot.classList.toggle("is-active", index === active);
      });
    }
    function play() {
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        play();
      });
    });
    play();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function createResultCard(movie) {
    var tags = (movie.tags || "")
      .split(/[,，/]/)
      .filter(Boolean)
      .slice(0, 3)
      .map(function(tag) {
        return "<span>" + escapeHtml(tag.trim()) + "</span>";
      })
      .join("");
    return "<article class=\"movie-card card-hover\">" +
      "<a class=\"poster-wrap\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.one_line) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearch() {
    var form = document.querySelector(".search-panel");
    var input = document.querySelector("#site-search-input");
    var resultGrid = document.querySelector("#search-results");
    var status = document.querySelector("#search-status");
    if (!form || !input || !resultGrid || !status || !Array.isArray(window.movieSearchData)) {
      return;
    }
    function render(keyword) {
      var query = keyword.trim().toLowerCase();
      var results = [];
      if (query) {
        results = window.movieSearchData.filter(function(movie) {
          return [movie.title, movie.category, movie.region, movie.genre, movie.tags, movie.one_line]
            .join(" ")
            .toLowerCase()
            .indexOf(query) !== -1;
        }).slice(0, 80);
        status.textContent = results.length ? "搜索结果" : "没有找到匹配内容";
      } else {
        results = window.movieSearchData.slice(0, 24);
        status.textContent = "热门推荐";
      }
      resultGrid.innerHTML = results.map(createResultCard).join("");
    }
    var initial = getQuery("q");
    input.value = initial;
    render(initial);
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var keyword = input.value.trim();
      var target = keyword ? window.location.pathname + "?q=" + encodeURIComponent(keyword) : window.location.pathname;
      window.history.replaceState(null, "", target);
      render(keyword);
    });
    input.addEventListener("input", function() {
      render(input.value);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    players.forEach(function(player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var started = false;
      if (!video || !overlay || !stream) {
        return;
      }
      function attachStream() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function playVideo() {
        attachStream();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function() {});
        }
      }
      overlay.addEventListener("click", playVideo);
      video.addEventListener("click", function() {
        if (!started) {
          playVideo();
        }
      });
      window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function() {
    initMobileMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
