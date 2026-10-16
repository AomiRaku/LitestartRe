/**
 * 极早执行的脚本，必须在 index.html 的 <head> 里同步引入（不加 defer/async）。
 * MV3 默认 CSP 为 script-src 'self'，内联脚本会被拦截，
 * 故此类「首帧之前」的逻辑需置于外部文件。
 */
(function () {
  // 1) 按系统主题设置标签页图标（深色用 icon_d，浅色用 icon_l）
  try {
    var isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    var link = document.createElement('link');
    link.rel = 'icon';
    link.id = 'favicon';
    link.type = 'image/svg+xml';
    link.href = (isDark ? 'img/icon_d.svg' : 'img/icon_l.svg') + '?r=' + Math.random();
    document.head.appendChild(link);
  } catch (e) {
    /* 图标设置失败不应影响页面 */
  }

  // 2) 提前把「隐藏搜索框」状态写到 <html>。
  //    主脚本在 DOMContentLoaded 时运行，届时首帧已绘制，隐藏状态下搜索框会先闪现再消失。
  try {
    if (JSON.parse(localStorage.getItem('ntp_search_visible')) === false) {
      document.documentElement.setAttribute('data-search-hidden', 'true');
    }
  } catch (e) {
    /* 读不到或格式异常时按默认（显示）处理，交给主脚本修正 */
  }
  // 3) 提前把布局模式写到 <html>。
  //    主脚本把 data-layout 写到 <body>，首帧会先按默认网格排布，搜索框随后跳位。
  //    CSS 用 :is(html, body)[data-layout=...] 同时识别这两个位置。
  try {
    var layout = JSON.parse(localStorage.getItem('ntp_layout') || '"centered"');
    if (layout === 'inspirational') {
      document.documentElement.setAttribute('data-layout', 'inspirational');
    }
  } catch (e) {
    /* 读不到时按默认布局处理，交给主脚本修正 */
  }

  // 4) 提前把生效主题写到 <html>，避免首帧配色闪烁。
  //    存储值为 'auto' / 'light' / 'dark'，auto 按系统偏好解析。
  try {
    var pref = JSON.parse(localStorage.getItem('ntp_theme') || '"auto"');
    var resolved = (pref === 'light' || pref === 'dark')
      ? pref
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    /* 失败时由主脚本补上 */
  }
})();
