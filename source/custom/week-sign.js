/* ============================================================
   LazyMondy · 慢调周记 — 本周签 JS
   ------------------------------------------------------------
   按当前月份在文章末尾插入原创诗句
   纯前端实现,无 AI,无后端
   ============================================================ */
(function () {
  'use strict';

  // 原创周签诗句,每月一句
  var SIGNS = [
    '一月的风很轻,日子还长。',          // 0: 一月
    '雪未化尽,茶已温好。',               // 1: 二月
    '春天来得慢,但不缺席。',             // 2: 三月
    '花开有声,只给愿意等的人。',         // 3: 四月
    '风穿过五月的午后,不赶时间。',       // 4: 五月
    '蝉鸣还没来,先让夏天凉一会儿。',     // 5: 六月
    '七月流火,我自清凉。',               // 6: 七月
    '暴雨忽至,茶杯未凉。',               // 7: 八月
    '秋天的第一片叶子,慢慢落。',         // 8: 九月
    '桂香迟来,正合我意。',               // 9: 十月
    '初冬的阳光,够用就好。',             // 10: 十一月
    '岁末不急,故事还在写。'              // 11: 十二月
  ];

  function buildSign() {
    var container = document.getElementById('article-container')
      || document.querySelector('.article-container');
    if (!container) return;

    // 避免重复插入
    if (container.querySelector('.lm-week-sign')) return;

    // 仅在文章页插入(有 post-meta 或 article-container 内有较多内容时)
    var isPost = document.querySelector('#post') || document.querySelector('.post-content');
    if (!isPost) return;

    var now = new Date();
    var month = now.getMonth();
    var text = SIGNS[month] || '不急,慢慢来。';

    var yyyy = now.getFullYear();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    var dateStr = yyyy + '-' + mm + '-' + dd;

    var block = document.createElement('blockquote');
    block.className = 'lm-week-sign';
    block.innerHTML =
      '<span class="lm-sign-text">' + text + '</span>'
      + '<span class="lm-sign-date">' + dateStr + '</span>';

    container.appendChild(block);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSign);
  } else {
    buildSign();
  }
})();
