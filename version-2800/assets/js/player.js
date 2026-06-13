(function () {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var starter = shell.querySelector('[data-play]');
    if (!video || !starter) {
        return;
    }

    var stream = starter.getAttribute('data-stream');
    var hlsInstance = null;

    function prepareVideo() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                backBufferLength: 30
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
        } else {
            video.src = stream;
        }

        video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
        prepareVideo();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    starter.addEventListener('click', startPlayback);

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
