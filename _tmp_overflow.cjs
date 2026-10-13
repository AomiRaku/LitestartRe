const fs = require('fs');
const p = 'E:\\Librury\\doc\\Github Storge\\LitestartRe\\index.html';
let s = fs.readFileSync(p, 'utf8');
const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const hn = s.indexOf(CR + LF) >= 0 ? CR + LF : LF;
const H = (t) => t.split('\n').join(hn);
let edits = 0;

function rep(a, b, tag) {
  const i = s.indexOf(a);
  if (i < 0) throw new Error('[NOT FOUND ' + tag + ']');
  if (s.indexOf(a, i + 1) >= 0) throw new Error('[NOT UNIQUE ' + tag + ']');
  edits++;
  return s.slice(0, i) + b + s.slice(i + a.length);
}

/* 1) 主题项：min-width: 0 让三项严格等分（长文本不再撑宽），内距略微收窄 */
s = rep(H(`    .theme-option {
      position: relative;
      z-index: 1;
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 30px;
      padding: 0 4px;`),
  H(`    .theme-option {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;              /* 关键：不允许长文本把 flex 项撑得比 1/3 宽 */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 30px;
      padding: 0 3px;`), 'theme-option');

/* 2) 文本兜底：极端情况下省略而不是溢出 */
s = rep(H(`    .theme-option svg {
      flex-shrink: 0;
    }`),
  H(`    /* 文本再长也不越界（俄语等长文案） */
    .theme-option > span {
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .theme-option svg {
      flex-shrink: 0;
    }`), 'theme-text');

/* 3) 预设项同样不参与撑宽 */
s = rep(H(`    .preset-card {
      position: relative;
      z-index: 1;
      flex: 1;`),
  H(`    .preset-card {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;`), 'preset-card');

const cnt = (sub) => { let c = 0, k = 0; while ((k = s.indexOf(sub, k)) >= 0) { c++; k += sub.length; } return c; };
if (cnt('min-width: 0;') < 3) throw new Error('min-width count = ' + cnt('min-width: 0;'));
if (cnt('.theme-option > span') !== 1) throw new Error('text guard');

const style = s.match(/<style>([\s\S]*?)<\/style>/)[1];
const o = (style.match(/\{/g) || []).length, c2 = (style.match(/\}/g) || []).length;
if (o !== c2) throw new Error('CSS braces ' + o + '/' + c2);

fs.writeFileSync(p, s);
console.log('OK edits=' + edits + '  CSS 花括号 ' + o + '/' + c2);
