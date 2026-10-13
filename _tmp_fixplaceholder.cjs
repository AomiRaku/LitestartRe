const fs = require('fs');
const p = 'E:\\Librury\\doc\\Github Storge\\LitestartRe\\script.js';
let js = fs.readFileSync(p, 'utf8');
const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const jn = js.indexOf(CR + LF) >= 0 ? CR + LF : LF;
const toNl = (s) => s.split('\n').join(jn);
let edits = 0;

function rep(a, b, tag) {
  const i = js.indexOf(a);
  if (i < 0) throw new Error('[NOT FOUND ' + tag + ']');
  if (js.indexOf(a, i + 1) >= 0) throw new Error('[NOT UNIQUE ' + tag + ']');
  edits++;
  js = js.slice(0, i) + b + js.slice(i + a.length);
}

/* 1) 从 applyLanguage 函数体里撤掉：三个函数定义 + 裸调用 */
rep(toNl(`  // 13.搜索框提示与"自定义"选项都含引擎名，要在上面刷完后再覆盖一次
  applySearchPlaceholder();
  updateCustomEngineOption();

  // 当前搜索引擎的展示名：内置用固定名，自定义用用户填的名称
  function getEngineDisplayName() {
    const engine = selectEngine ? selectEngine.value : 'bing';
    const dict = i18nData[getResolvedLanguageCode(localStorage.getItem('liteStart_language') || 'auto')] || i18nData['zh-CN'];
    if (engine === 'custom') return customEngineConfig.name || dict.custom;
    const names = { bing: 'Bing', baidu: 'Baidu', google: 'Google' };
    return names[engine] || 'Bing';
  }

  // 搜索框提示文本：把模板里的 {name} 换成当前引擎名。
  // 必须排在 applyLanguage 之后执行——data-i18n 会先把带 {name} 的模板原样写进 DOM
  function applySearchPlaceholder() {
    const dict = i18nData[getResolvedLanguageCode(localStorage.getItem('liteStart_language') || 'auto')] || i18nData['zh-CN'];
    const text = String(dict.searchPlaceholder || '').replace('{name}', getEngineDisplayName());
    const placeholder = document.getElementById('placeholder');
    if (placeholder) placeholder.textContent = text;
    const fakebox = document.getElementById('fakebox');
    if (fakebox) fakebox.setAttribute('aria-label', text);
  }

  // 设置里的"自定义"选项：配过自定义引擎就显示成"自定义（名称）"
  function updateCustomEngineOption() {
    if (!selectEngine) return;
    const opt = selectEngine.querySelector('option[value="custom"]');
    if (!opt) return;
    const dict = i18nData[getResolvedLanguageCode(localStorage.getItem('liteStart_language') || 'auto')] || i18nData['zh-CN'];
    const name = customEngineConfig.name;
    opt.textContent = name
      ? String(dict.customEngineWithName || '').replace('{name}', name)
      : (dict.custom || '自定义');
    refreshCustomSelects();
  }`),
  toNl(`  // 13.搜索框提示与"自定义"选项都含引擎名，要在上面刷完后再覆盖一次。
  // 这里出错不该连累调用方（否则后面的初始化会被跳过、整个设置面板都打不开），所以单独兜住
  try {
    applySearchPlaceholder();
    updateCustomEngineOption();
  } catch (err) {
    console.warn('搜索框提示同步失败:', err);
  }`), 'remove-from-applyLanguage');

/* 2) 放到 DOMContentLoaded 顶层（这样引擎切换/保存/删除那几处也能引用到） */
rep(toNl(`  // 初始化自定义下拉组件
  initCustomSelects();`),
  toNl(`  // ===== 搜索框提示与"自定义"选项的引擎名同步 =====
  // 注意：这几个函数必须定义在 applyLanguage 之外——它内部也会调用，
  // 而外部（切换/保存/删除自定义引擎）同样要用到。
  // 实现上只读 DOM 与 localStorage，不依赖可能在前面尚未初始化的模块级变量。

  // 当前搜索引擎的展示名：内置用固定名，自定义用用户填的名称
  function getEngineDisplayName() {
    const sel = document.getElementById('select-engine');
    const engine = sel ? sel.value : 'bing';
    if (engine === 'custom') {
      const cfg = Storage.get('ntp_custom_engine_config', {}) || {};
      return cfg.name || 'Custom';
    }
    const names = { bing: 'Bing', baidu: 'Baidu', google: 'Google' };
    return names[engine] || 'Bing';
  }

  // 搜索框提示文本：把模板里的 {name} 换成当前引擎名。
  // 必须排在 applyLanguage 的 data-i18n 扫描之后——否则模板会被原样写进 DOM
  function applySearchPlaceholder() {
    const el = document.getElementById('placeholder');
    if (!el) return;
    const dict = i18nData[getResolvedLanguageCode(localStorage.getItem('liteStart_language') || 'auto')] || i18nData['zh-CN'];
    const tpl = dict.searchPlaceholder;
    if (!tpl) return;
    const text = String(tpl).replace('{name}', getEngineDisplayName());
    el.textContent = text;
    const fakebox = document.getElementById('fakebox');
    if (fakebox) fakebox.setAttribute('aria-label', text);
  }

  // 设置里的"自定义"选项：配过自定义引擎就显示成"自定义（名称）"
  function updateCustomEngineOption() {
    const sel = document.getElementById('select-engine');
    if (!sel) return;
    const opt = sel.querySelector('option[value="custom"]');
    if (!opt) return;
    const dict = i18nData[getResolvedLanguageCode(localStorage.getItem('liteStart_language') || 'auto')] || i18nData['zh-CN'];
    const cfg = Storage.get('ntp_custom_engine_config', {}) || {};
    const name = cfg.name;
    opt.textContent = name
      ? String(dict.customEngineWithName || '').replace('{name}', name)
      : (dict.custom || '自定义');
    refreshCustomSelects();
  }

  // 初始化自定义下拉组件
  initCustomSelects();`), 'move-to-top-level');

/* 校验 */
const cnt = (s, sub) => { let c = 0, i = 0; while ((i = s.indexOf(sub, i)) >= 0) { c++; i += sub.length; } return c; };
if (cnt(js, 'function applySearchPlaceholder') !== 1) throw new Error('placeholder fn');
if (cnt(js, 'function updateCustomEngineOption') !== 1) throw new Error('option fn');
if (cnt(js, 'function getEngineDisplayName') !== 1) throw new Error('name fn');
if (cnt(js, 'applySearchPlaceholder();') !== 4) throw new Error('calls = ' + cnt(js, 'applySearchPlaceholder();'));
if (cnt(js, 'updateCustomEngineOption();') !== 3) throw new Error('option calls = ' + cnt(js, 'updateCustomEngineOption();'));
if (cnt(js, "const engine = selectEngine ? selectEngine.value : 'bing';") !== 0) throw new Error('old risky impl left');
if (cnt(js, 'console.warn(\'搜索框提示同步失败:') !== 1) throw new Error('guard');

// 三个函数必须出现在 applyLanguage 结束之后（即 initCustomSelects 之前那段顶层代码里）
const fnPos = js.indexOf('function applySearchPlaceholder');
const initPos = js.indexOf('  // 初始化自定义下拉组件');
const applyLangPos = js.indexOf('function applyLanguage');
if (!(applyLangPos < fnPos)) throw new Error('fn still before/inside applyLanguage?');

fs.writeFileSync(p, js);
console.log('OK edits=' + edits);
