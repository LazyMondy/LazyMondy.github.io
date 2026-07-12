/* ============================================================
   LazyMondy · 慢调周记 — 起始页 Welcome Gate v2
   ------------------------------------------------------------
   - 首次进入根路径显示全屏起始页
   - 点击"开启"后淡出,本次会话不再显示
   - sessionStorage.lm_welcome_passed 标记本次会话
   - 导航栏注入"起始页"菜单项,点击返回起始页
   - 左上角站点名点击也返回起始页
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'lm_welcome_passed';

  function alreadyPassed() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markPassed() {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  function clearPassed() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function isRootPath() {
    var path = window.location.pathname;
    return (path === '/' || path === '/index.html');
  }

  function buildGate() {
    var div = document.createElement('div');
    div.id = 'lm-welcome-gate';
    div.innerHTML =
      '<div class="lm-wg-card">'
      + '<h1 class="lm-wg-brand">LazyMondy</h1>'
      + '<p class="lm-wg-subtitle">慢调周记</p>'
      + '<div class="lm-wg-divider"></div>'
      + '<p class="lm-wg-poem">日子慢一些<br>字就长出来</p>'
      + '<button class="lm-wg-enter-btn" type="button" aria-label="开启慢调周记">'
      + '<span class="lm-wg-btn-text">开启</span>'
      + '</button>'
      + '<p class="lm-wg-enter-hint">点击进入,慢慢停留</p>'
      + '</div>';
    return div;
  }

  function dismiss(gate) {
    gate.classList.add('is-leaving');
    setTimeout(function () {
      if (gate.parentNode) gate.parentNode.removeChild(gate);
      document.dispatchEvent(new CustomEvent('lm:welcome-dismissed'));
    }, 800);
  }

  function attachGateHandler(gate) {
    var btn = gate.querySelector('.lm-wg-enter-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      markPassed();
      dismiss(gate);
    });
    document.addEventListener('keydown', function onKey(e) {
      if (!document.getElementById('lm-welcome-gate')) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        markPassed();
        dismiss(gate);
        document.removeEventListener('keydown', onKey);
      }
    });
    console.log('[welcome-gate v2] 起始页已展示');
  }

  function showGate() {
    if (document.getElementById('lm-welcome-gate')) return;
    var gate = buildGate();
    if (!document.body) {
      // body 还没准备好,等待
      document.addEventListener('DOMContentLoaded', function () {
        if (!document.getElementById('lm-welcome-gate')) {
          document.body.appendChild(gate);
          attachGateHandler(gate);
        }
      });
    } else {
      document.body.appendChild(gate);
      attachGateHandler(gate);
    }
  }

  // 首次进入:根路径且未通过 -> 显示起始页
  function tryShowGate() {
    if (alreadyPassed()) return;
    if (!isRootPath()) return;
    showGate();
  }
  // ---------- 导航栏注入"起始页"菜单项 ----------
  function injectNavItem() {
    var menus = document.querySelector('#nav #menus .menus_items') || document.querySelector('.menus_items');
    if (!menus) return;
    if (menus.querySelector('#lm-nav-welcome')) return;
    var item = document.createElement('div');
    item.className = 'menus_item';
    item.id = 'lm-nav-welcome';
    var link = document.createElement('a');
    link.className = 'site-page';
    link.href = 'javascript:void(0);';
    link.setAttribute('role', 'button');
    link.setAttribute('aria-label', '返回起始页');
    link.innerHTML = '<i class="fa-fw fas fa-door-open"></i><span> 起始页</span>';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearPassed();
      if (isRootPath()) {
        showGate();
      } else {
        window.location.href = '/';
      }
    });
    item.appendChild(link);
    menus.appendChild(item);
  }

  // ---------- 拦截左上角站点名点击 ----------
  function attachSiteTitleHandler() {
    var link = document.querySelector('#blog-info a');
    if (!link) return;
    if (link._lmGateBound) return;
    link._lmGateBound = true;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearPassed();
      if (isRootPath()) {
        showGate();
      } else {
        window.location.href = '/';
      }
    }, true);
  }

  // ---------- 拦截"关于"页面中的站点链接 ----------
  function attachAboutSiteLink() {
    var link = document.getElementById('lm-about-site-link');
    if (!link) return;
    if (link._lmGateBound) return;
    link._lmGateBound = true;
    link.style.cursor = 'pointer';
    link.style.color = 'var(--lm-c-main, #a8744a)';
    link.style.textDecoration = 'underline';
    link.title = '返回起始页';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearPassed();
      // 关于页面不是根路径,整页跳转到首页
      window.location.href = '/';
    }, true);
  }

  // ---------- 启动 ----------
  function onReady() {
    tryShowGate();
    attachSiteTitleHandler();
    injectNavItem();
    attachAboutSiteLink();
  }

  // 尽早执行:body 可能还没好,但 tryShowGate 内部会等待
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // 兜底:window load 时再试一次(防止 DOMContentLoaded 被其他脚本抢占)
  window.addEventListener('load', function () {
    if (!alreadyPassed() && isRootPath() && !document.getElementById('lm-welcome-gate')) {
      showGate();
    }
    attachSiteTitleHandler();
    injectNavItem();
    attachAboutSiteLink();
  });

  // pjax 切换后重新绑定
  document.addEventListener('pjax:success', function () {
    attachSiteTitleHandler();
    injectNavItem();
    attachAboutSiteLink();
    if (alreadyPassed()) return;
    if (isRootPath() && !document.getElementById('lm-welcome-gate')) {
      showGate();
    }
  });

  // pjax 发送时移除起始页(防止残留)
  document.addEventListener('pjax:send', function () {
    var gate = document.getElementById('lm-welcome-gate');
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
  });
})();