/**
 * 极早执行的脚本：必须在 index.html 的 <head> 里同步引入（不能加 defer/async）。
 *
 * 为什么单独一个文件：MV3 扩展页面的默认 CSP 是 script-src 'self'，
 * 写在 index.html 里的内联 <script> 会被拦截，所以这类"首帧之前"要做的事只能放外部文件。
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

  // 2) 把"隐藏搜索框"的状态提前打到 <html> 上。
  //    主脚本要等 DOMContentLoaded 才运行，那时首帧已经画出来了，
  //    隐藏状态下会看到搜索框闪一下再消失，所以这里先同步读一次存储。
  try {
    if (JSON.parse(localStorage.getItem('ntp_search_visible')) === false) {
      document.documentElement.setAttribute('data-search-hidden', 'true');
    }
  } catch (e) {
    /* 读不到或格式异常时按默认（显示）处理，交给主脚本修正 */
  }
  // 3) 主题模式：把最终生效的主题提前写到 <html> 上，避免首帧闪成另一种配色。
  //    存储值是 'auto' / 'light' / 'dark'，auto 时按系统偏好解析。
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
