document.addEventListener('DOMContentLoaded', function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var message = player.querySelector('[data-player-message]');
  var source = player.getAttribute('data-video-src');
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function playVideo() {
    if (!video || !source) {
      setMessage('当前影片暂未配置播放源。');
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');

    if (window.Hls && window.Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }

      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          setMessage('浏览器已阻止自动播放，请再次点击播放器开始播放。');
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放源加载失败，请稍后重试或更换网络环境。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          setMessage('浏览器已阻止自动播放，请再次点击播放器开始播放。');
        });
      }, { once: true });
    } else {
      setMessage('当前浏览器不支持该播放格式，请更换浏览器访问。');
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }
});
