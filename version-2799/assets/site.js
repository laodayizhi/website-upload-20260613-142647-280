(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function buildSearchItem(item) {
    return [
      '<a class="search-result-item" href="' + item.url + '">',
      '  <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
      '  <span>',
      '    <strong>' + item.title + '</strong>',
      '    <span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function initGlobalSearch() {
    var index = window.SITE_SEARCH_INDEX || [];
    var forms = queryAll('.site-search, .mobile-search');

    forms.forEach(function (form) {
      var input = form.querySelector('.global-search-input');
      var results = form.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }

      input.addEventListener('input', function () {
        var term = normalize(input.value);
        if (term.length < 2) {
          results.classList.remove('open');
          results.innerHTML = '';
          return;
        }

        var matches = index.filter(function (item) {
          return normalize(item.search).indexOf(term) !== -1;
        }).slice(0, 10);

        if (!matches.length) {
          results.innerHTML = '<div class="empty-message">没有匹配内容</div>';
        } else {
          results.innerHTML = matches.map(buildSearchItem).join('');
        }
        results.classList.add('open');
      });

      form.addEventListener('submit', function () {
        results.classList.remove('open');
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.site-search') && !event.target.closest('.mobile-search')) {
        queryAll('[data-search-results]').forEach(function (node) {
          node.classList.remove('open');
        });
      }
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = queryAll('.hero-slide', hero);
    var dotsWrap = hero.querySelector('[data-hero-dots]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer;

    function renderDots() {
      if (!dotsWrap) {
        return;
      }
      dotsWrap.innerHTML = slides.map(function (_, index) {
        return '<button type="button" aria-label="切换焦点" data-dot="' + index + '"></button>';
      }).join('');
    }

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      queryAll('[data-dot]', dotsWrap).forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5400);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (!slides.length) {
      return;
    }

    renderDots();
    show(0);
    start();

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    if (dotsWrap) {
      dotsWrap.addEventListener('click', function (event) {
        var button = event.target.closest('[data-dot]');
        if (!button) {
          return;
        }
        show(Number(button.getAttribute('data-dot')));
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
  }

  function initFilters() {
    var cards = queryAll('[data-movie-card]');
    var input = document.querySelector('[data-page-filter]');
    var region = document.querySelector('[data-region-filter]');
    var type = document.querySelector('[data-type-filter]');
    var year = document.querySelector('[data-year-filter]');

    if (!cards.length || (!input && !region && !type && !year)) {
      return;
    }

    function passes(card) {
      var term = input ? normalize(input.value) : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var search = normalize(card.getAttribute('data-search'));

      if (term && search.indexOf(term) === -1) {
        return false;
      }
      if (regionValue && card.getAttribute('data-region') !== regionValue) {
        return false;
      }
      if (typeValue && card.getAttribute('data-type') !== typeValue) {
        return false;
      }
      if (yearValue && card.getAttribute('data-year') !== yearValue) {
        return false;
      }
      return true;
    }

    function apply() {
      cards.forEach(function (card) {
        card.style.display = passes(card) ? '' : 'none';
      });
    }

    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  }

  function initPlayer() {
    queryAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      function startPlayback() {
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        shell.classList.add('playing');

        if (window.Hls && window.Hls.isSupported()) {
          if (video._hlsInstance) {
            video._hlsInstance.destroy();
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video._hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              video.controls = true;
            });
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              video.src = source;
              video.play().catch(function () {
                video.controls = true;
              });
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {
            video.controls = true;
          });
        }
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          shell.classList.remove('playing');
        }
      });
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var term = normalize(params.get('q'));
    var input = root.querySelector('[data-search-page-input]');
    var output = root.querySelector('[data-search-page-results]');
    var index = window.SITE_SEARCH_INDEX || [];

    if (input && term) {
      input.value = params.get('q');
    }

    function render(value) {
      var q = normalize(value);
      if (!q) {
        output.innerHTML = '<div class="empty-message">输入影片名、地区、类型或年份即可检索片库。</div>';
        return;
      }

      var matches = index.filter(function (item) {
        return normalize(item.search).indexOf(q) !== -1;
      }).slice(0, 96);

      if (!matches.length) {
        output.innerHTML = '<div class="empty-message">没有匹配内容，请尝试其他关键词。</div>';
        return;
      }

      output.innerHTML = '<div class="search-result-grid">' + matches.map(function (item) {
        return [
          '<article class="movie-card compact-card">',
          '  <a class="poster-wrap" href="' + item.url + '">',
          '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
          '    <span class="play-badge">▶</span>',
          '  </a>',
          '  <div class="movie-info">',
          '    <div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
          '    <h3><a href="' + item.url + '">' + item.title + '</a></h3>',
          '    <p>' + item.summary + '</p>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('') + '</div>';
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(term);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initGlobalSearch();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
}());
