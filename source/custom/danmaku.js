/* LazyMondy danmaku v3 with likes */
(function () {
  var stage = null;
  var lanes = [];
  var LANE_COUNT = 5;
  var SPEED_MIN = 8000;
  var SPEED_MAX = 14000;
  var BUILT_IN = ['不急,慢慢说','日子会自己走过来','没有 deadline 的角落','星期绕着我转','风过林梢,日子慢慢长','慢一点也没关系','这里没有赶时间','留下你的足迹吧','一句话也行,一个字也行'];

  function getLikes(t) { try { var s = localStorage.getItem('lm_dmk_likes'); if (!s) return 0; return JSON.parse(s)[t] || 0; } catch (e) { return 0; } }
  function setLikes(t, n) { try { var s = localStorage.getItem('lm_dmk_likes'); var o = s ? JSON.parse(s) : {}; o[t] = n; localStorage.setItem('lm_dmk_likes', JSON.stringify(o)); } catch (e) {} }
  function isLiked(t) { try { var s = localStorage.getItem('lm_dmk_liked'); if (!s) return false; return JSON.parse(s).indexOf(t) >= 0; } catch (e) { return false; } }
  function setLiked(t) { try { var s = localStorage.getItem('lm_dmk_liked'); var a = s ? JSON.parse(s) : []; if (a.indexOf(t) < 0) { a.push(t); localStorage.setItem('lm_dmk_liked', JSON.stringify(a)); } } catch (e) {} }
  function unsetLiked(t) { try { var s = localStorage.getItem('lm_dmk_liked'); var a = s ? JSON.parse(s) : []; var i = a.indexOf(t); if (i >= 0) { a.splice(i, 1); localStorage.setItem('lm_dmk_liked', JSON.stringify(a)); } } catch (e) {} }

  function init() {
    stage = document.getElementById('lm-danmaku-stage');
    if (!stage) return;
    if (stage._lmDmkInit) return;
    stage._lmDmkInit = true;
    lanes = new Array(LANE_COUNT).fill(0);
    var saved = [];
    try { var s = localStorage.getItem('lm_danmaku'); if (s) saved = JSON.parse(s); } catch (e) {}
    var allTexts = BUILT_IN.concat(saved);
    allTexts.forEach(function (text, i) { setTimeout(function () { launch(text, i % LANE_COUNT); }, i * 600); });
    setInterval(function () { if (Math.random() < 0.4) { var p = BUILT_IN[Math.floor(Math.random() * BUILT_IN.length)]; var l = pickLane(); if (l >= 0) launch(p, l); } }, 2500);
    var btn = document.getElementById('lm-danmaku-send');
    var input = document.getElementById('lm-danmaku-input');
    if (btn && input) { btn.addEventListener('click', function () { send(input); }); input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(input); }); }
  }

  function send(input) {
    var text = (input.value || '').trim();
    if (!text) return;
    var lane = pickLane();
    if (lane < 0) lane = Math.floor(Math.random() * LANE_COUNT);
    launch(text, lane);
    input.value = '';
    try { var saved = []; var s = localStorage.getItem('lm_danmaku'); if (s) saved = JSON.parse(s); saved.push(text); if (saved.length > 20) saved = saved.slice(-20); localStorage.setItem('lm_danmaku', JSON.stringify(saved)); } catch (e) {}
  }

  function pickLane() { var now = Date.now(); for (var i = 0; i < LANE_COUNT; i++) { if (now > lanes[i]) return i; } return -1; }
  function launch(text, lane) {
    if (!stage) return;
    var el = document.createElement('div');
    el.className = 'lm-danmaku-item';
    el.style.top = (30 + lane * 48) + 'px';
    el.style.left = '0';
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';

    var textEl = document.createElement('span');
    textEl.className = 'lm-dmk-text';
    textEl.textContent = text;

    var likeEl = document.createElement('span');
    likeEl.className = 'lm-dmk-like';
    var liked = isLiked(text);
    var count = getLikes(text);
    var fillC = liked ? '#e74c3c' : 'none';
    var strokeC = liked ? '#e74c3c' : 'currentColor';
    likeEl.innerHTML = '<svg class="lm-dmk-heart" viewBox="0 0 24 24" width="13" height="13"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="' + fillC + '" stroke="' + strokeC + '" stroke-width="2"/></svg><span class="lm-dmk-count">' + (count > 0 ? count : '') + '</span>';
    likeEl.dataset.text = text;
    likeEl.dataset.liked = liked ? '1' : '0';
    if (liked) likeEl.classList.add('liked');

    likeEl.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      var t = likeEl.dataset.text;
      var wasLiked = likeEl.dataset.liked === '1';
      var cur = getLikes(t);
      var heart = likeEl.querySelector('.lm-dmk-heart path');
      var countEl = likeEl.querySelector('.lm-dmk-count');
      if (!wasLiked) {
        cur = cur + 1;
        setLikes(t, cur);
        setLiked(t);
        likeEl.dataset.liked = '1';
        likeEl.classList.add('liked');
        heart.setAttribute('fill', '#e74c3c');
        heart.setAttribute('stroke', '#e74c3c');
        countEl.textContent = cur;
        likeEl.classList.add('pulse');
        setTimeout(function () { likeEl.classList.remove('pulse'); }, 400);
      } else {
        cur = Math.max(0, cur - 1);
        setLikes(t, cur);
        unsetLiked(t);
        likeEl.dataset.liked = '0';
        likeEl.classList.remove('liked');
        heart.setAttribute('fill', 'none');
        heart.setAttribute('stroke', 'currentColor');
        countEl.textContent = cur > 0 ? cur : '';
      }
    });

    el.appendChild(textEl);
    el.appendChild(likeEl);
    stage.appendChild(el);

    var duration = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
    lanes[lane] = Date.now() + duration * 0.6;
    requestAnimationFrame(function () { el.style.transition = 'opacity 0.3s'; el.style.opacity = '1'; });

    var startTime = null;
    var pausedAt = null;
    var pausedOffset = 0;
    var isPaused = false;
    var stageWidth = stage.offsetWidth || 800;
    var elWidth = el.offsetWidth || 120;
    var totalDist = stageWidth + elWidth + 40;
    var rafId = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      if (isPaused) { rafId = requestAnimationFrame(step); return; }
      var elapsed = ts - startTime - pausedOffset;
      var progress = elapsed / duration;
      if (progress >= 1) { if (el.parentNode) el.parentNode.removeChild(el); return; }
      var x = stageWidth + elWidth - progress * totalDist;
      el.style.transform = 'translateX(' + x + 'px)';
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    el.addEventListener('mouseenter', function () { isPaused = true; pausedAt = Date.now(); });
    el.addEventListener('mouseleave', function () {
      if (isPaused && pausedAt !== null) { pausedOffset += Date.now() - pausedAt; pausedAt = null; }
      isPaused = false;
    });
  }

  function tryInit() { if (document.getElementById('lm-danmaku-stage')) { init(); } else { setTimeout(tryInit, 500); } }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', tryInit); } else { tryInit(); }
  document.addEventListener('pjax:success', tryInit);
})();