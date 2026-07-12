/* ============================================================
   LazyMondy · 慢调周记 — 多主题色自由切换 JS
   ------------------------------------------------------------
   - 提供浮动按钮 + 弹出面板
   - 切换 data-lm-theme 属性,触发 CSS 变量更新
   - localStorage 持久化
   - 不依赖任何外部库,无 AI 化元素
   ============================================================ */
(function () {
  'use strict';

  var THEMES = [
    { id: 'default', name: '暖木质', color: '#a8744a' },
    { id: 'forest',  name: '自然绿', color: '#6b8e5a' },
    { id: 'mist',    name: '雾霾蓝', color: '#6b88a8' },
    { id: 'mono',    name: '极简灰', color: '#3a3a3a' }
  ];

  var STORAGE_KEY = 'lm-theme-color';

  function applyTheme(id) {
    var valid = THEMES.some(function (t) { return t.id === id; });
    if (!valid) id = 'default';
    document.documentElement.setAttribute('data-lm-theme', id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
    // 同步面板激活态
    var dots = document.querySelectorAll('.lm-theme-dot');
    for (var i = 0; i < dots.length; i++) {
      if (dots[i].dataset.theme === id) {
        dots[i].classList.add('is-active');
      } else {
        dots[i].classList.remove('is-active');
      }
    }
  }

  function getCurrent() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var valid = THEMES.some(function (t) { return t.id === saved; });
    return valid ? saved : 'default';
  }

  function svgPalette() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<circle cx="12" cy="12" r="9"></circle>'
      + '<circle cx="9"  cy="9"  r="1.4" fill="currentColor" stroke="none"></circle>'
      + '<circle cx="15" cy="9"  r="1.4" fill="currentColor" stroke="none"></circle>'
      + '<circle cx="9"  cy="15" r="1.4" fill="currentColor" stroke="none"></circle>'
      + '<circle cx="15" cy="15" r="1.4" fill="currentColor" stroke="none"></circle>'
      + '</svg>';
  }

  function buildUI() {
    if (document.getElementById('lm-theme-toggle-btn')) return;

    // 触发按钮
    var btn = document.createElement('button');
    btn.id = 'lm-theme-toggle-btn';
    btn.type = 'button';
    btn.title = '切换主题色';
    btn.setAttribute('aria-label', '切换主题色');
    btn.innerHTML = svgPalette();
    btn.addEventListener('click', function () {
      var panel = document.getElementById('lm-theme-switcher');
      if (panel) panel.classList.toggle('is-open');
    });
    document.body.appendChild(btn);

    // 面板
    var panel = document.createElement('div');
    panel.id = 'lm-theme-switcher';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', '主题色选择');

    THEMES.forEach(function (t) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'lm-theme-dot';
      item.dataset.theme = t.id;
      item.setAttribute('role', 'menuitem');
      item.innerHTML =
        '<span class="lm-theme-swatch" style="background:' + t.color + '"></span>'
        + '<span class="lm-theme-name">' + t.name + '</span>';
      item.addEventListener('click', function () {
        applyTheme(t.id);
        var p = document.getElementById('lm-theme-switcher');
        if (p) p.classList.remove('is-open');
      });
      panel.appendChild(item);
    });

    document.body.appendChild(panel);

    // 点击空白处收起
    document.addEventListener('click', function (e) {
      var p = document.getElementById('lm-theme-switcher');
      var b = document.getElementById('lm-theme-toggle-btn');
      if (!p || !b) return;
      if (!p.contains(e.target) && !b.contains(e.target)) {
        p.classList.remove('is-open');
      }
    });
  }

  function init() {
    applyTheme(getCurrent());
    // 等待 body 就绪
    if (document.body) {
      buildUI();
    } else {
      document.addEventListener('DOMContentLoaded', buildUI);
    }
  }

  init();
})();
/* ============================================================
   清理旧的暗色模式 localStorage(暗色模式已关闭)
   ------------------------------------------------------------
   之前为排查暗色切换问题,在 localStorage 中写入了
   lm-theme-mode 和 theme 两个 key。现在暗色模式已关闭,
   这些旧值(可能是 dark)会导致页面异常。此段代码在
   页面加载时清理它们,并强制确保 data-theme=light。
   ============================================================ */
(function () {
  'use strict';
  try {
    // 清理旧的暗色状态备份
    localStorage.removeItem('lm-theme-mode');
    // 清理 Butterfly 的 theme key(可能是 dark)
    localStorage.removeItem('theme');
  } catch (e) {}
  // 强制确保亮色模式
  document.documentElement.setAttribute('data-theme', 'light');
})();