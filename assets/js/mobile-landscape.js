(function () {
  'use strict';

  function isMobileDevice() {
    var userAgent = navigator.userAgent || '';
    var hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var hasTouchScreen = navigator.maxTouchPoints > 1;

    return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) || (hasCoarsePointer && hasTouchScreen);
  }

  function lockLandscape() {
    var orientation = screen.orientation || screen.webkitOrientation;
    if (!orientation || typeof orientation.lock !== 'function') return;

    var lockResult = orientation.lock('landscape');
    if (lockResult && typeof lockResult.catch === 'function') lockResult.catch(function () {});
  }

  function requestFullscreenAndLandscape() {
    var root = document.documentElement;
    var requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;

    if (!requestFullscreen) {
      lockLandscape();
      return;
    }

    var requestResult;
    try {
      requestResult = requestFullscreen.call(root, { navigationUI: 'hide' });
    } catch (error) {
      lockLandscape();
      return;
    }

    if (requestResult && typeof requestResult.then === 'function') {
      requestResult.then(lockLandscape).catch(function () {});
    } else {
      lockLandscape();
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  function initMobileLandscape() {
    if (!isMobileDevice()) return;

    lockLandscape();
    registerServiceWorker();
    document.addEventListener('fullscreenchange', lockLandscape);
    document.addEventListener('webkitfullscreenchange', lockLandscape);

    // Browsers only allow fullscreen from a user gesture. Support the common mobile gesture events.
    var interactionEvents = ['pointerup', 'touchend', 'click', 'keydown'];
    function onFirstInteraction() {
      interactionEvents.forEach(function (eventName) {
        document.removeEventListener(eventName, onFirstInteraction, true);
      });
      requestFullscreenAndLandscape();
    }

    interactionEvents.forEach(function (eventName) {
      document.addEventListener(eventName, onFirstInteraction, true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileLandscape);
  } else {
    initMobileLandscape();
  }
})();
