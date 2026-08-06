(function () {
  'use strict';

  function initMusicPlayer() {
    if (!document.body.classList.contains('blog-page') || document.querySelector('.music-player')) return;

    var player = document.createElement('aside');
    player.className = 'music-player is-collapsed';
    player.setAttribute('aria-label', '音乐播放器');
    player.innerHTML =
      '<button class="music-launcher" type="button" aria-expanded="false" aria-label="展开音乐播放器" title="展开音乐播放器">&#9835;</button>' +
      '<div class="music-panel"><div class="music-now-playing"><div class="music-cover"><img class="music-cover-image" alt="歌曲封面"></div><div class="music-meta">' +
      '<strong class="music-title">暂无曲目</strong><span class="music-artist">本地歌单</span></div></div>' +
      '<div class="music-controls"><button class="music-control music-prev" type="button" aria-label="上一首" title="上一首">&#9664;&#9664;</button>' +
      '<button class="music-control music-play" type="button" aria-label="播放" title="播放">&#9654;</button>' +
      '<button class="music-control music-next" type="button" aria-label="下一首" title="下一首">&#9654;&#9654;</button>' +
      '<span class="music-controls-divider" aria-hidden="true"></span>' +
      '<button class="music-control music-list-toggle" type="button" aria-expanded="false" aria-label="歌曲" title="歌曲">&#9776;</button>' +
      '<button class="music-control music-volume-toggle" type="button" aria-expanded="false" aria-label="音量" title="音量">&#128266;</button>' +
      '<button class="music-control music-lyrics-toggle" type="button" aria-pressed="false" aria-label="歌词" title="歌词">&#35789;</button></div>' +
      '<div class="music-volume"><input type="range" min="0" max="1" step="0.05" value="0.7" aria-label="音量"></div>' +
      '<div class="music-playlist" aria-label="歌单"></div></div>';
    document.body.appendChild(player);

    var lyricsWindow = document.createElement('div');
    lyricsWindow.className = 'music-lyrics-float is-hidden';
    lyricsWindow.setAttribute('aria-live', 'polite');
    document.body.appendChild(lyricsWindow);

    var audio = new Audio();
    audio.preload = 'metadata';
    var launcher = player.querySelector('.music-launcher');
    var title = player.querySelector('.music-title');
    var artist = player.querySelector('.music-artist');
    var coverImage = player.querySelector('.music-cover-image');
    var playButton = player.querySelector('.music-play');
    var playlist = player.querySelector('.music-playlist');
    var listToggle = player.querySelector('.music-list-toggle');
    var volumeToggle = player.querySelector('.music-volume-toggle');
    var lyricsToggle = player.querySelector('.music-lyrics-toggle');
    var tracks = [];
    var currentIndex = -1;
    var lyrics = [];
    var lyricIndex = -1;

    function renderLyrics(lines) {
      lyricsWindow.innerHTML = '';
      for (var i = 0; i < 2; i++) {
        var line = document.createElement('span');
        line.className = 'music-lyric-line' + (i === 0 ? ' is-current' : '');
        line.textContent = lines[i] || ' ';
        lyricsWindow.appendChild(line);
      }
    }

    function setCollapsed(collapsed) {
      player.classList.toggle('is-collapsed', collapsed);
      player.classList.remove('is-playlist-open', 'is-volume-open');
      launcher.setAttribute('aria-expanded', String(!collapsed));
      launcher.setAttribute('aria-label', collapsed ? '展开音乐播放器' : '收起音乐播放器');
      launcher.setAttribute('title', collapsed ? '展开音乐播放器' : '收起音乐播放器');
      listToggle.setAttribute('aria-expanded', 'false');
      volumeToggle.setAttribute('aria-expanded', 'false');
    }

    function parseLyrics(content) {
      var items = [];
      content.split(/\r?\n/).forEach(function (line) {
        var textMatch = line.match(/((?:\[\d{1,2}:\d{2}(?:\.\d{1,3})?\])+)(.*)/);
        if (!textMatch) return;
        var text = textMatch[2].trim();
        if (!text || /QQ音乐享有本翻译作品/.test(text)) return;
        (textMatch[1].match(/\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/g) || []).forEach(function (tag) {
          var match = tag.match(/\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/);
          items.push({ time: Number(match[1]) * 60 + Number(match[2]), text: text });
        });
      });
      items.sort(function (a, b) { return a.time - b.time; });
      return items.reduce(function (groups, item) {
        var group = groups[groups.length - 1];
        if (!group || group.time !== item.time) {
          groups.push({ time: item.time, lines: [item.text] });
        } else if (group.lines.indexOf(item.text) === -1) {
          group.lines.push(item.text);
        }
        return groups;
      }, []);
    }

    function getLyricLines(index) {
      if (index < 0 || !lyrics[index]) return ['...', ''];
      var lines = lyrics[index].lines.slice(0, 2);
      if (lines.length < 2 && lyrics[index + 1]) lines.push(lyrics[index + 1].lines[0]);
      return lines;
    }

    function updateLyrics(time) {
      var nextIndex = -1;
      for (var i = 0; i < lyrics.length; i++) {
        if (lyrics[i].time > time) break;
        nextIndex = i;
      }
      if (nextIndex === lyricIndex) return;
      lyricIndex = nextIndex;
      renderLyrics(getLyricLines(nextIndex));
    }

    function loadLyrics(track) {
      lyrics = [];
      lyricIndex = -1;
      renderLyrics(['加载歌词中...', '']);
      if (!track.lrc) return;
      fetch(track.lrc).then(function (response) {
        if (!response.ok) throw new Error('歌词加载失败');
        return response.text();
      }).then(function (content) {
        lyrics = parseLyrics(content);
        updateLyrics(audio.currentTime || 0);
      }).catch(function () { renderLyrics(['暂无歌词', '']); });
    }

    function renderPlaylist() {
      playlist.innerHTML = '';
      if (!tracks.length) {
        playlist.textContent = '暂无曲目';
        playlist.className = 'music-playlist music-playlist-empty';
        return;
      }
      playlist.className = 'music-playlist';
      tracks.forEach(function (track, index) {
        var item = document.createElement('button');
        item.className = 'music-track' + (index === currentIndex ? ' is-current' : '');
        item.type = 'button';
        item.dataset.trackIndex = String(index);
        item.textContent = track.title + ' - ' + track.artist;
        playlist.appendChild(item);
      });
    }

    function selectTrack(index) {
      if (!tracks.length) return;
      currentIndex = (index + tracks.length) % tracks.length;
      var track = tracks[currentIndex];
      audio.src = track.audio;
      audio.load();
      title.textContent = track.title;
      artist.textContent = track.artist;
      coverImage.hidden = !track.cover;
      coverImage.alt = track.title + ' 封面';
      coverImage.src = track.cover || '';
      renderPlaylist();
      loadLyrics(track);
    }

    function playCurrent() {
      if (currentIndex !== -1) audio.play().catch(function () { renderLyrics(['无法播放当前曲目', '']); });
    }

    coverImage.addEventListener('error', function () { coverImage.hidden = true; });
    launcher.addEventListener('click', function () { setCollapsed(!player.classList.contains('is-collapsed')); });
    player.querySelector('.music-prev').addEventListener('click', function () { selectTrack(currentIndex - 1); playCurrent(); });
    player.querySelector('.music-next').addEventListener('click', function () { selectTrack(currentIndex + 1); playCurrent(); });
    playButton.addEventListener('click', function () { audio.paused ? playCurrent() : audio.pause(); });
    listToggle.addEventListener('click', function (event) {
      var open = player.classList.toggle('is-playlist-open');
      player.classList.remove('is-volume-open');
      event.currentTarget.setAttribute('aria-expanded', String(open));
      volumeToggle.setAttribute('aria-expanded', 'false');
    });
    volumeToggle.addEventListener('click', function (event) {
      var open = player.classList.toggle('is-volume-open');
      player.classList.remove('is-playlist-open');
      event.currentTarget.setAttribute('aria-expanded', String(open));
      listToggle.setAttribute('aria-expanded', 'false');
    });
    lyricsToggle.addEventListener('click', function (event) {
      var hidden = lyricsWindow.classList.toggle('is-hidden');
      event.currentTarget.classList.toggle('is-active', !hidden);
      event.currentTarget.setAttribute('aria-pressed', String(!hidden));
    });
    playlist.addEventListener('click', function (event) {
      var item = event.target.closest('[data-track-index]');
      if (!item) return;
      selectTrack(Number(item.dataset.trackIndex));
      playCurrent();
    });
    player.querySelector('.music-volume input').addEventListener('input', function (event) { audio.volume = Number(event.target.value); });
    audio.addEventListener('timeupdate', function () {
      updateLyrics(audio.currentTime);
    });
    audio.addEventListener('play', function () { playButton.innerHTML = '&#10074;&#10074;'; });
    audio.addEventListener('pause', function () { playButton.innerHTML = '&#9654;'; });
    audio.addEventListener('ended', function () { selectTrack(currentIndex + 1); playCurrent(); });

    renderLyrics(['暂无歌词', '']);
    setCollapsed(true);
    renderPlaylist();
    fetch('assets/media/music/playlist.json').then(function (response) {
      if (!response.ok) throw new Error('歌单加载失败');
      return response.json();
    }).then(function (data) {
      var list = Array.isArray(data) ? data : data.tracks;
      tracks = Array.isArray(list) ? list.filter(function (track) { return track && track.title && track.artist && track.audio; }) : [];
      renderPlaylist();
      if (tracks.length) selectTrack(0);
    }).catch(function () { renderPlaylist(); });
  }

  document.addEventListener('DOMContentLoaded', initMusicPlayer);
}());
