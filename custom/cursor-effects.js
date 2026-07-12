/* ============================================================
   LazyMondy · 慢调周记 — 鼠标拖尾 + 烟花点击特效 v5
   ------------------------------------------------------------
   - 拖尾:连续光带 + 双层光珠(核心 + 光晕)
   - 点击:同步触发烟花爆炸(无延迟,业界主流做法)
   - pjax 切换时 canvas 保留,烟花继续播放
   - globalCompositeOperation = lighter 叠加发光
   - 颜色跟随主题色 (--lm-c-main)
   ============================================================ */
(function () {
  'use strict';

  console.log('[cursor-effects v5] 脚本已加载');

  var isMobileTouch = ('ontouchstart' in window) && (window.innerWidth < 768);
  if (isMobileTouch) {
    console.log('[cursor-effects v5] 移动触摸设备,禁用特效');
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = null;
  var ctx = null;
  var trails = [];
  var sparks = [];
  var MAX_TRAILS = 60;
  var MAX_SPARKS = 600;
  var lastX = -1, lastY = -1;
  var lastTime = 0;
  var colorCache = null;
  var colorFrame = 0;
  var rafId = null;

  function readColor() {
    try {
      var c = getComputedStyle(document.documentElement).getPropertyValue('--lm-c-main').trim();
      return c || '#a8744a';
    } catch (e) { return '#a8744a'; }
  }
  function hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    return {
      r: parseInt(hex.substring(0, 2), 16) || 168,
      g: parseInt(hex.substring(2, 4), 16) || 116,
      b: parseInt(hex.substring(4, 6), 16) || 74
    };
  }
  function getColor() {
    if (!colorCache || colorFrame % 30 === 0) colorCache = hexToRgb(readColor());
    colorFrame++;
    return colorCache;
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // ===== 拖尾光点 =====
  function addTrailPoint(x, y, speed) {
    if (trails.length >= MAX_TRAILS) trails.shift();
    var sizeFactor = Math.min(1, speed / 20);
    trails.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.3,
      life: 1,
      coreSize: 1.5 + sizeFactor * 1.5,
      glowSize: 6 + sizeFactor * 6,
      alpha: 0.7 + sizeFactor * 0.3
    });
  }

  // ===== 烟花爆炸(绽放阶段) =====
  function explode(x, y) {
    var count = reduceMotion ? 15 : 30 + Math.floor(Math.random() * 12);
    var c = getColor();
    for (var i = 0; i < count; i++) {
      if (sparks.length >= MAX_SPARKS) sparks.shift();
      var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      var speed = 1.5 + Math.random() * 5;
      var size = 1 + Math.random() * 2.5;
      // 90% 主题色,10% 白色或淡金点缀
      var isAccent = Math.random() < 0.1;
      var r2, g2, b2;
      if (isAccent) {
        if (Math.random() < 0.5) { r2 = 255; g2 = 245; b2 = 220; }
        else { r2 = 255; g2 = 255; b2 = 255; }
      } else {
        r2 = c.r; g2 = c.g; b2 = c.b;
      }
      sparks.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 1,
        coreSize: size,
        glowSize: size * 3.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        history: [],
        maxHistory: 6,
        r: r2, g: g2, b: b2
      });
    }
  }

  // ===== 烟花触发:同步爆炸,无延迟 =====
  function triggerFirework(x, y) {
    // 主爆炸
    explode(x, y);
    // 延迟 80ms 后再爆一次(小烟花),增加层次感
    setTimeout(function () {
      explode(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
    }, 80);
    console.log('[cursor-effects v5] 烟花 @ ' + Math.round(x) + ',' + Math.round(y));
  }

  // ===== 绘制光珠(核心 + 光晕) =====
  function drawGlow(x, y, coreSize, glowSize, r, g, b, alpha) {
    var radius = Math.max(0.5, glowSize);
    var grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.9) + ')');
    grad.addColorStop(0.15, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.6) + ')');
    grad.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.25) + ')');
    grad.addColorStop(0.7, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.08) + ')');
    grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (coreSize > 0.3) {
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.85) + ')';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.3, coreSize), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== 动画主循环 =====
  function tick() {
    if (!ctx || !canvas) { rafId = requestAnimationFrame(tick); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    var c = getColor();
    var r = c.r, g = c.g, b = c.b;

    // 拖尾光点
    for (var i = trails.length - 1; i >= 0; i--) {
      var t = trails[i];
      t.x += t.vx; t.y += t.vy;
      t.vy -= 0.005;
      t.life -= 0.018;
      if (t.life <= 0) { trails.splice(i, 1); continue; }
      var e = easeOut(t.life);
      drawGlow(t.x, t.y, t.coreSize * e, t.glowSize * e, r, g, b, t.alpha * e);
    }

    // 爆炸粒子
    for (var j = sparks.length - 1; j >= 0; j--) {
      var p = sparks[j];
      p.history.unshift({ x: p.x, y: p.y });
      if (p.history.length > p.maxHistory) p.history.pop();
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.97; p.vy *= 0.97;
      p.vy += 0.08;
      p.rot += p.rotSpeed;
      p.life -= 0.022;
      if (p.life <= 0) { sparks.splice(j, 1); continue; }
      var e2 = easeOut(p.life);
      // 拖尾线段
      if (p.history.length >= 2) {
        ctx.lineCap = 'round';
        for (var k = 0; k < p.history.length - 1; k++) {
          var h1 = p.history[k], h2 = p.history[k + 1];
          var la = e2 * (1 - k / p.history.length) * 0.6;
          var lw = Math.max(0.3, p.coreSize * (1 - k / p.history.length) * 0.8);
          ctx.strokeStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + la + ')';
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.moveTo(h1.x, h1.y);
          ctx.lineTo(h2.x, h2.y);
          ctx.stroke();
        }
      }
      drawGlow(p.x, p.y, p.coreSize * e2, p.glowSize * e2, p.r, p.g, p.b, e2);
    }

    ctx.globalCompositeOperation = 'source-over';
    rafId = requestAnimationFrame(tick);
  }

  // ===== 鼠标移动(拖尾) =====
  function onMouseMove(e) {
    var now = performance.now();
    if (lastX < 0) { lastX = e.clientX; lastY = e.clientY; lastTime = now; return; }
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var dt = Math.max(1, now - lastTime);
    var speed = dist / dt * 16;
    if (dist > 0.5) {
      var steps = reduceMotion ? 1 : Math.max(1, Math.ceil(dist / 1.5));
      for (var i = 1; i <= steps; i++) addTrailPoint(lastX + dx * (i / steps), lastY + dy * (i / steps), speed);
    }
    lastX = e.clientX; lastY = e.clientY; lastTime = now;
  }

  // ===== 点击:同步触发烟花,不阻止默认行为 =====
  function onClick(e) {
    if (e.button !== 0 && e.type === 'click') return;
    triggerFirework(e.clientX, e.clientY);
  }

  function resize() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'lm-cursor-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;display:block;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    rafId = requestAnimationFrame(tick);
    console.log('[cursor-effects v5] 初始化完成, canvas: ' + canvas.width + 'x' + canvas.height);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', function () { if (!canvas) init(); });
  // pjax 切换时 canvas 保留,烟花继续播放
  document.addEventListener('pjax:success', function () {
    if (!canvas && document.body) init();
    else resize();
  });
})();
