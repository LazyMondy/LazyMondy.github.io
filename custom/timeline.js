/* ============================================================
   LazyMondy · 慢调周记 — 时光页面 v1
   ------------------------------------------------------------
   - 建站计时:2026-07-10 22:57:00 起
     显示"第 X 年 X 月 X 日 X 时 X 分 X 秒"(日历差)
   - 节日倒计时:公历固定 + 农历预填,自动滚动到下一年
   ============================================================ */
(function () {
  'use strict';

  // 建站时间:2026-07-10 22:57:00
  var BUILT = new Date(2026, 6, 10, 22, 57, 0);

  // ---------- 节日配置 ----------
  var SOLAR_HOLIDAYS = [
    { name: '元旦', m: 1, d: 1 },
    { name: '情人节', m: 2, d: 14 },
    { name: '妇女节', m: 3, d: 8 },
    { name: '植树节', m: 3, d: 12 },
    { name: '清明节', m: 4, d: 5 },
    { name: '劳动节', m: 5, d: 1 },
    { name: '青年节', m: 5, d: 4 },
    { name: '儿童节', m: 6, d: 1 },
    { name: '建党节', m: 7, d: 1 },
    { name: '建军节', m: 8, d: 1 },
    { name: '教师节', m: 9, d: 10 },
    { name: '国庆节', m: 10, d: 1 },
    { name: '万圣节', m: 10, d: 31 },
    { name: '感恩节', m: 11, d: 26 },
    { name: '冬至', m: 12, d: 22 },
    { name: '平安夜', m: 12, d: 24 },
    { name: '圣诞节', m: 12, d: 25 }
  ];

  // 农历节日预填公历日期(2027-2032)
  var LUNAR_DATES = {
    '春节': ['2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03', '2031-01-23', '2032-02-11'],
    '元宵节': ['2027-02-20', '2028-02-09', '2029-02-27', '2030-02-17', '2031-02-06', '2032-02-25'],
    '端午节': ['2027-05-30', '2028-06-18', '2029-06-05', '2030-06-23', '2031-06-12', '2032-06-30'],
    '七夕节': ['2027-08-09', '2028-08-29', '2029-08-18', '2030-08-07', '2031-08-27', '2032-08-14'],
    '中元节': ['2027-08-16', '2028-09-04', '2029-08-24', '2030-08-13', '2031-09-02', '2032-08-20'],
    '中秋节': ['2027-09-15', '2028-09-03', '2029-09-22', '2030-09-12', '2031-10-01', '2032-09-19'],
    '重阳节': ['2027-10-08', '2028-09-27', '2029-10-17', '2030-10-05', '2031-10-24', '2032-10-12'],
    '腊八节': ['2027-12-26', '2028-12-15', '2030-01-03', '2030-12-23', '2032-01-11', '2032-12-30'],
    '除夕':   ['2027-02-05', '2028-01-25', '2029-02-12', '2030-02-02', '2031-01-22', '2032-02-10']
  };

  var SHOW_COUNT = 6;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function parseISODate(s) {
    var parts = s.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0);
  }

  function formatDateCN(d) {
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function nextSolarDate(m, d, from) {
    var y = from.getFullYear();
    var cand = new Date(y, m - 1, d, 0, 0, 0);
    if (cand < from) cand = new Date(y + 1, m - 1, d, 0, 0, 0);
    return cand;
  }

  function nextLunarDate(dates, from) {
    for (var i = 0; i < dates.length; i++) {
      var d = parseISODate(dates[i]);
      if (d >= from) return d;
    }
    return parseISODate(dates[dates.length - 1]);
  }

  function buildHolidays(now) {
    var list = [];
    var from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    for (var i = 0; i < SOLAR_HOLIDAYS.length; i++) {
      var h = SOLAR_HOLIDAYS[i];
      list.push({ name: h.name, date: nextSolarDate(h.m, h.d, from) });
    }
    for (var k in LUNAR_DATES) {
      if (!LUNAR_DATES.hasOwnProperty(k)) continue;
      list.push({ name: k, date: nextLunarDate(LUNAR_DATES[k], from) });
    }
    list.sort(function (a, b) { return a.date - b.date; });
    return list.slice(0, SHOW_COUNT);
  }
  var holidayCardsBuilt = false;
  var holidayList = [];

  function renderHolidayCards(now) {
    var grid = document.getElementById('lm-tl-holidays');
    if (!grid) return;
    holidayList = buildHolidays(now);
    var html = '';
    for (var i = 0; i < holidayList.length; i++) {
      var h = holidayList[i];
      var isNearest = (i === 0) ? ' is-nearest' : '';
      var badge = (i === 0) ? '<span class="lm-tl-holi-badge">最近</span>' : '';
      html += '<div class="lm-tl-holi-card' + isNearest + '" data-idx="' + i + '">'
        + badge
        + '<div class="lm-tl-holi-name">' + h.name + '</div>'
        + '<div class="lm-tl-holi-date">' + formatDateCN(h.date) + '</div>'
        + '<div class="lm-tl-holi-countdown" data-idx="' + i + '"></div>'
        + '<div class="lm-tl-holi-today-mark">就是今天</div>'
        + '</div>';
    }
    grid.innerHTML = html;
    holidayCardsBuilt = true;
  }

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function updateHolidayCountdowns(now) {
    var nowTime = now.getTime();
    for (var i = 0; i < holidayList.length; i++) {
      var h = holidayList[i];
      var target = h.date.getTime();
      var diff = target - nowTime;
      var card = document.querySelector('.lm-tl-holi-card[data-idx="' + i + '"]');
      if (!card) continue;
      if (diff <= 0) {
        if (isSameDay(h.date, now)) {
          card.classList.add('is-today');
        } else {
          // 节日已完全过去,标记需重建(下一 tick 自动替换为后续最近的 6 个)
          holidayCardsBuilt = false;
        }
        continue;
      }
      var days = Math.floor(diff / 86400000);
      diff -= days * 86400000;
      var hours = Math.floor(diff / 3600000);
      diff -= hours * 3600000;
      var minutes = Math.floor(diff / 60000);
      diff -= minutes * 60000;
      var seconds = Math.floor(diff / 1000);
      var cdEl = card.querySelector('.lm-tl-holi-countdown');
      if (cdEl) {
        cdEl.innerHTML =
          '<span class="lm-tl-holi-cd-num">' + days + '</span><span class="lm-tl-holi-cd-unit">天</span>'
          + '<span class="lm-tl-holi-cd-num">' + pad(hours) + '</span><span class="lm-tl-holi-cd-unit">时</span>'
          + '<span class="lm-tl-holi-cd-num">' + pad(minutes) + '</span><span class="lm-tl-holi-cd-unit">分</span>'
          + '<span class="lm-tl-holi-cd-num">' + pad(seconds) + '</span><span class="lm-tl-holi-cd-unit">秒</span>';
      }
    }
  }

  function updateBuiltTime(now) {
    var y2 = now.getFullYear(), m2 = now.getMonth() + 1, d2 = now.getDate();
    var h2 = now.getHours(), mi2 = now.getMinutes(), s2 = now.getSeconds();

    var y1 = BUILT.getFullYear(), m1 = BUILT.getMonth() + 1, d1 = BUILT.getDate();
    var h1 = BUILT.getHours(), mi1 = BUILT.getMinutes(), s1 = BUILT.getSeconds();

    var years = y2 - y1;
    var months = m2 - m1;
    var days = d2 - d1;
    var hours = h2 - h1;
    var minutes = mi2 - mi1;
    var seconds = s2 - s1;

    if (seconds < 0) { seconds += 60; minutes -= 1; }
    if (minutes < 0) { minutes += 60; hours -= 1; }
    if (hours < 0) { hours += 24; days -= 1; }
    if (days < 0) {
      var prevMonth = new Date(y2, m2 - 2, 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    if (months < 0) { months += 12; years -= 1; }
    if (years < 0) { years = 0; months = 0; days = 0; hours = 0; minutes = 0; seconds = 0; }

    var map = {
      years: years, months: months, days: days,
      hours: hours, minutes: minutes, seconds: seconds
    };
    var nums = document.querySelectorAll('#lm-tl-built .lm-tl-num');
    for (var i = 0; i < nums.length; i++) {
      var key = nums[i].getAttribute('data-u');
      if (map.hasOwnProperty(key)) {
        nums[i].textContent = map[key];
      }
    }
  }

  function tick() {
    var now = new Date();
    updateBuiltTime(now);
    if (!holidayCardsBuilt) renderHolidayCards(now);
    updateHolidayCountdowns(now);
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    tick();
    setInterval(tick, 1000);
    console.log('[timeline v1] 启动成功');
  }

  function tryStart() {
    if (document.getElementById('lm-tl-built')) start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStart);
  } else {
    tryStart();
  }
  document.addEventListener('pjax:success', function () {
    setTimeout(function () {
      if (document.getElementById('lm-tl-built')) {
        if (!started) start();
        else { holidayCardsBuilt = false; tick(); }
      }
    }, 100);
  });
  document.addEventListener('pjax:send', function () {
    holidayCardsBuilt = false;
  });
})();