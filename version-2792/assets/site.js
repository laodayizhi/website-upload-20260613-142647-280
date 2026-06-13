(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var slideIndex = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === slideIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === slideIndex);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
      var container = panel.parentElement;
      var grid = container ? container.querySelector('[data-card-grid]') : null;
      if (!grid) {
        return;
      }
      var input = panel.querySelector('.site-search');
      var category = panel.querySelector('.category-filter');
      var year = panel.querySelector('.year-filter');
      var cards = Array.prototype.slice.call(grid.children);
      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var categoryValue = category ? category.value : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var search = (card.getAttribute('data-search') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (keyword && search.indexOf(keyword) === -1) {
            ok = false;
          }
          if (categoryValue && cardCategory !== categoryValue) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
        });
      }
      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (category) {
        category.addEventListener('change', applyFilter);
      }
      if (year) {
        year.addEventListener('change', applyFilter);
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      if (!video || !button) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;
      function attachVideo() {
        if (!streamUrl || loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          loaded = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          loaded = true;
          return;
        }
        video.src = streamUrl;
        loaded = true;
      }
      function startPlay() {
        attachVideo();
        player.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
      button.addEventListener('click', startPlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
