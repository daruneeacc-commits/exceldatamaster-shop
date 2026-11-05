/* EDM_I18N ตัวแปลภาษากลาง (5 พ.ย. 2569) — คำแปลอยู่ใน assets/i18n-d-<ระบบ>.js (โหลดก่อน) · OPT {scope, picker} — เปลี่ยนภาษาหน้าจอ ไทย / English / 日本語 / 中文 / 한국어
   แปลเฉพาะข้อความของระบบ (ตรงทั้งข้อความ หรือรูปแบบตัวเลข/วันที่) ข้อมูลที่ลูกค้าพิมพ์เองไม่ถูกแปล
   เก็บภาษาที่เลือกใน localStorage edm_lang · ใส่ select ใน header .nav */
(function () {
  var LANGS = [["th", "ไทย"], ["en", "English"], ["ja", "日本語"], ["zh", "中文"], ["ko", "한국어"]], IX = { en: 0, ja: 1, zh: 2, ko: 3 };
  // คำไทย: [en, ja, zh, ko]
  var D = window.EDM_I18N_D || {}, OPT = window.EDM_I18N_OPT || {};
  var UNIT = { "รายการ": ["items", "件", "项", "개 항목"], "ครั้ง": ["times", "回", "次", "회"], "หน่วย": ["units", "個", "件", "개"], "สินค้า": ["products", "商品", "种商品", "개 상품"], "ผู้ขาย": ["suppliers", "社", "家供应商", "개 업체"], "ใบ": ["docs", "件", "张", "건"] };
  UNIT = Object.assign(UNIT, window.EDM_I18N_U || {});
  var MS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  var MF = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  var EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function yr(y) { y = +y; if (y < 100) y += 2500; return y > 2400 ? y - 543 : y; }
  var SHORT = false;
  function ym(L, m, y) { y = yr(y); if (SHORT) return L === "en" ? EN[m] : L === "ko" ? (m + 1) + "월" : (m + 1) + "月"; return L === "en" ? EN[m] + " " + y : L === "ko" ? y + "년 " + (m + 1) + "월" : y + "年" + (m + 1) + "月"; }
  function ymd(L, d, m, y) { y = yr(y); return L === "en" ? d + " " + EN[m] + " " + y : L === "ko" ? y + "년 " + (m + 1) + "월 " + d + "일" : y + "年" + (m + 1) + "月" + d + "日"; }
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  var reMS = new RegExp("(\\d{1,2}) (" + MS.map(esc).join("|") + ") (\\d{2,4})", "g"), reM = new RegExp("(" + MS.map(esc).join("|") + ") (\\d{2,4})", "g"), reMF = new RegExp("(" + MF.join("|") + ") (\\d{4})", "g");
  var lang = "th"; try { lang = localStorage.getItem("edm_lang") || "th"; } catch (e) {}
  if (!LANGS.some(function (l) { return l[0] === lang; })) lang = "th";
  function tr(s) {
    var k = IX[lang]; if (k == null || !/[฀-๿]/.test(s)) return s;
    var m = /^(\s*)([^\u0E00-\u0E7F\w"(\u0E3F]*)(.*?)(\s*[→↗]?\s*)$/.exec(s), pre = m[1] + m[2], core = m[3], post = m[4];
    if (D[core]) return pre + D[core][k] + post;
    var PF = window.EDM_I18N_PRE || []; for (var q = 0; q < PF.length; q++) if (core.indexOf(PF[q]) === 0 && D[PF[q]]) return pre + D[PF[q]][k] + tr(core.slice(PF[q].length)) + post;
    var u = /^([\d,.\-−+]+)\s+(\S+)$/.exec(core); if (u && UNIT[u[2]]) return pre + u[1] + " " + UNIT[u[2]][k] + post;
    var out = core.replace(reMS, function (_, d, mo, y) { return ymd(lang, d, MS.indexOf(mo), y); }).replace(reM, function (_, mo, y) { return ym(lang, MS.indexOf(mo), y); }).replace(reMF, function (_, mo, y) { return ym(lang, MF.indexOf(mo), y); });
    // ข้อความผสมที่มีตัวเลข/วันที่ — แทนเป็นวลี (เรียงยาวก่อน)
    if (/[\d฿·]/.test(out)) PH.forEach(function (p) { out = out.split(p[0]).join(p[1][k]); });   // เฉพาะข้อความระบบที่มีตัวเลข/ยอดเงิน ไม่แตะชื่อสินค้า
    return pre + out + post;
  }
  var PH = Object.keys(D).filter(function (w) { return w.length >= 4; }).sort(function (a, b) { return b.length - a.length; }).map(function (w) { return [w, D[w]]; })
    .concat(Object.keys(UNIT).map(function (w) { return [" " + w, UNIT[w].map(function (x) { return " " + x; })]; }));
  var busy = false, ORIG = "__th";
  function skip(el) { return !el || el.closest("script,style,textarea,input,#edmLang,[contenteditable],.edm-gate,.edm-noi18n"); }
  function doNode(n) {
    if (n.nodeType === 3) { if (skip(n.parentElement)) return; if (n[ORIG] == null) n[ORIG] = n.nodeValue; SHORT = !!n.parentElement.closest("svg"); var v = lang === "th" ? n[ORIG] : tr(n[ORIG]); SHORT = false; if (n.nodeValue !== v) n.nodeValue = v; return; }
    if (n.nodeType !== 1 || n.matches("script,style,.edm-gate,.edm-noi18n")) return;
    ["placeholder", "title"].forEach(function (a) { if (!n.hasAttribute(a)) return; var key = "__th_" + a; if (n[key] == null) n[key] = n.getAttribute(a); var v = lang === "th" ? n[key] : tr(n[key]); if (n.getAttribute(a) !== v) n.setAttribute(a, v); });
    var w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), x;
    while ((x = w.nextNode())) { if (x.nodeType === 3) doNode(x); else if (x.hasAttribute && (x.hasAttribute("placeholder") || x.hasAttribute("title"))) doNode(x); }
  }
  function scopeEl() { return (OPT.scope && document.querySelector(OPT.scope)) || document.body; }
  function run(root) { busy = true; try { doNode(root || scopeEl()); } finally { busy = false; } }
  var mo = new MutationObserver(function (ms) {
    if (busy) return; busy = true;
    try { ms.forEach(function (m) { if (m.type === "characterData") { var n = m.target; if (n[ORIG] != null && n.nodeValue !== (lang === "th" ? n[ORIG] : tr(n[ORIG]))) { n[ORIG] = n.nodeValue; } doNode(n); } else m.addedNodes.forEach(doNode); }); } finally { busy = false; }
  });
  function picker() {
    var nav = document.querySelector(OPT.picker || "header .nav"); if (!nav || document.getElementById("edmLang")) return;
    var s = document.createElement("select"); s.id = "edmLang"; s.className = "btn sm ghost edm-noi18n"; s.title = "Language / ภาษา"; s.style.cssText = "padding:4px 8px;cursor:pointer";
    s.innerHTML = LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === lang ? " selected" : "") + ">🌐 " + l[1] + "</option>"; }).join("");
    s.onchange = function () { lang = s.value; try { localStorage.setItem("edm_lang", lang); } catch (e) {} document.documentElement.lang = lang; run(); };
    if (OPT.wrap) { var w = document.createElement("div"); w.className = OPT.wrap; w.innerHTML = "<label>🌐 Language</label>"; w.appendChild(s); s.className = "in edm-noi18n"; s.style.cssText = ""; nav.insertBefore(w, nav.firstChild); } else nav.insertBefore(s, nav.firstChild);
  }
  function start() { picker(); document.documentElement.lang = lang; run(); mo.observe(scopeEl(), { childList: true, subtree: true, characterData: true }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.EDM_I18N = { tr: tr, lang: function () { return lang; }, run: run };
})();
