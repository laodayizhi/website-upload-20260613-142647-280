(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = qs('.mobile-toggle');
    var menu = qs('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var lists = qsa('.filter-list');
    lists.forEach(function (list) {
      var section = list.closest('section') || document;
      var search = qs('.js-list-search', section);
      var year = qs('.js-year-filter', section);
      var type = qs('.js-type-filter', section);
      var cards = qsa('.movie-card', list);

      function apply() {
        var keyword = normalize(search ? search.value : '');
        var yearValue = normalize(year ? year.value : '');
        var typeValue = normalize(type ? type.value : '');
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' '));
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var okType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
          card.classList.toggle('is-hidden', !(okKeyword && okYear && okType));
        });
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initQueryInput() {
    var input = qs('.js-query-input');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  function attachSource(video) {
    var source = qs('source', video);
    if (!source || video.getAttribute('data-ready') === '1') {
      return;
    }
    var url = source.getAttribute('src');
    if (!url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.setAttribute('data-ready', '1');
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      video.setAttribute('data-ready', '1');
      return;
    }
    video.src = url;
    video.setAttribute('data-ready', '1');
  }

  function initPlayers() {
    qsa('.js-player').forEach(function (shell) {
      var video = qs('video', shell);
      var cover = qs('.player-cover', shell);
      if (!video || !cover) {
        return;
      }
      function play() {
        attachSource(video);
        shell.classList.add('is-playing');
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }
      cover.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initQueryInput();
    initPlayers();
  });
})();
