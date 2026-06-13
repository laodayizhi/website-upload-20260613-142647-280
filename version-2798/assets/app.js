document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      const value = input ? input.value.trim() : "";
      if (value) {
        event.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(value);
      }
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    let index = 0;
    let timer = null;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    };

    const startHero = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const filterInput = document.querySelector("[data-filter-input]");
  const regionSelect = document.querySelector("[data-filter-region]");
  const categorySelect = document.querySelector("[data-filter-category]");
  const list = document.querySelector("[data-card-list]");

  if (filterInput && query) {
    filterInput.value = query;
  }

  const filterCards = function () {
    if (!list) {
      return;
    }

    const text = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const region = regionSelect ? regionSelect.value.trim().toLowerCase() : "";
    const category = categorySelect ? categorySelect.value.trim().toLowerCase() : "";
    const cards = Array.from(list.querySelectorAll(".movie-card"));

    cards.forEach(function (card) {
      const blob = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();

      const regionValue = (card.getAttribute("data-region") || "").toLowerCase();
      const categoryValue = blob;
      const matchText = !text || blob.indexOf(text) !== -1;
      const matchRegion = !region || regionValue.indexOf(region) !== -1;
      const matchCategory = !category || categoryValue.indexOf(category) !== -1;

      card.classList.toggle("is-hidden", !(matchText && matchRegion && matchCategory));
    });
  };

  if (filterInput || regionSelect || categorySelect) {
    [filterInput, regionSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
    filterCards();
  }
});

function initVideoPlayer(streamUrl) {
  const video = document.querySelector(".movie-video");
  const startButton = document.querySelector(".player-start");
  let ready = false;
  let hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  const loadStream = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  };

  const begin = function () {
    loadStream();
    if (startButton) {
      startButton.classList.add("is-hidden");
    }
    video.controls = true;
    const playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  };

  if (startButton) {
    startButton.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    if (startButton) {
      startButton.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
