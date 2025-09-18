// Tracks visibility of user-defined elements and sends time to background
let visibleStart = null;
let currentSelector = null;

function urlMatches(url, patterns) {
  return patterns.some(pattern => {
    try {
      return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')).test(url);
    } catch {
      return false;
    }
  });
}

function getVisibleSelector(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.offsetParent !== null) {
      return selector;
    }
  }
  return null;
}

chrome.storage.local.get(['playMusic', 'musicDataUrl'], (result) => {
  const urlPatterns = ['https://*.s4hana.ondemand.com/*'];
  const selectors = ['.sapUiLocalBusyIndicatorAnimation.sapUiLocalBusyIndicatorAnimStandard'];
  const playMusic = !!result.playMusic;
  const musicDataUrl = result.musicDataUrl || 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b7e7.mp3';
  let audio = null;
  if (!urlMatches(window.location.href, urlPatterns)) return;

  function startMusic() {
    if (playMusic && !audio) {
      audio = document.createElement('audio');
      audio.src = musicDataUrl;
      audio.loop = true;
      audio.volume = 0.5;
      audio.play();
    }
  }

  function stopMusic() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.remove();
      audio = null;
    }
  }

  function checkVisibility() {
    const visibleSelector = getVisibleSelector(selectors);
    if (visibleSelector) {
      if (!visibleStart) {
        visibleStart = Date.now();
        currentSelector = visibleSelector;
        startMusic();
      }
    } else {
      if (visibleStart) {
        const seconds = Math.round((Date.now() - visibleStart) / 1000);
        visibleStart = null;
        stopMusic();
        if (seconds > 0) {
          chrome.runtime.sendMessage({ type: 'addTime', seconds });
        }
      }
    }
  }

  setInterval(checkVisibility, 1000);
  window.addEventListener('beforeunload', () => {
    if (visibleStart) {
      const seconds = Math.round((Date.now() - visibleStart) / 1000);
      stopMusic();
      if (seconds > 0) {
        chrome.runtime.sendMessage({ type: 'addTime', seconds });
      }
    }
  });
});
