/* Excel Data Master — ส่ง / แชร์ / บันทึกเอกสารเป็น PDF
 * ทุกระบบที่เรียก window.print() จะขึ้นเมนู: ส่ง PDF · บันทึก PDF · พิมพ์
 * - หาเอกสารเอง: #printArea (บัญชี สต๊อก คาเฟ่ จอง) · #pages .page (เงินเดือน) · #previewWrap .paper (บิล)
 * - ตั้งชื่อไฟล์ได้ด้วย window.EDM_DOCNAME = "INV-0001" ก่อนเรียก print
 * - ไลบรารี (html2canvas-pro, jsPDF) โหลดเมื่อใช้ครั้งแรกเท่านั้น
 */
(function () {
  "use strict";
  if (window.EDM_DOCSHARE) return;
  var nativePrint = window.print.bind(window);
  var BASE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^/]*$/, "") : "../assets/"; })();
  var MM = 96 / 25.4; // px ต่อ มม.
  var libs = null, sheet = null, job = 0, pdf = null;

  function load(src) {
    return new Promise(function (ok, no) {
      var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = function () { no(new Error("โหลดไม่สำเร็จ")); };
      document.head.appendChild(s);
    });
  }
  function needLibs() {
    if (!libs) libs = Promise.all([load(BASE + "vendor/html2canvas.min.js?v=1"), load(BASE + "vendor/jspdf.min.js?v=1")])
      .catch(function (e) { libs = null; throw e; });
    return libs;
  }

  /* ---------- หาเอกสารที่กำลังจะพิมพ์ ---------- */
  function has(el) { return el && el.innerHTML.trim() && el.textContent.trim(); }
  function pageInfo() {
    var t = (document.getElementById("pageSize") || {}).textContent || "";
    var m = t.match(/size:\s*(\d+)mm\s+auto[^}]*margin:\s*(\d+)mm/);
    if (m) return { roll: true, w: +m[1], margin: +m[2] };
    var g = t.match(/margin:\s*(\d+)mm/);
    return { roll: false, w: 210, h: 297, margin: g ? +g[1] : 10 };
  }
  function findDoc(o) {
    if (o && o.el) return { el: o.el, pg: o.pg || { roll: false, w: 210, h: 297, margin: 10 }, ext: o.el.ownerDocument !== document, name: o.name, onPrint: o.onPrint };
    var c = window.EDM_DOC || {}, el;
    if (c.sel && (el = document.querySelector(c.sel)) && has(el)) return { el: el, pg: pageInfo() };
    var pa = document.getElementById("printArea");
    if (has(pa)) return { el: pa, pg: pageInfo() };
    var pages = document.getElementById("pages");
    if (pages && pages.querySelector(".page")) return { el: pages, pg: { roll: false, w: 210, h: 297, margin: 0, own: true } };
    var paper = document.querySelector("#previewWrap .paper, .preview-wrap .paper");
    if (has(paper)) return { el: paper, pg: { roll: false, w: 210, h: 297, margin: 0, own: true } };
    return null;
  }

  /* ---------- กฎ @media print → ใช้กับสำเนานอกจอ ---------- */
  function printCss() {
    var out = [];
    function walk(rules, inPrint) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.media && r.cssRules) { var mt = r.media.mediaText; walk(r.cssRules, inPrint || /\bprint\b/.test(mt) && !/\bscreen\b/.test(mt)); }
        else if (inPrint && r.selectorText) {
          var sel = r.selectorText.split(",").map(function (x) {
            x = x.trim().replace(/^(html|body|:root)\b\s*/, "");
            return x ? ".edm-pdfhost " + x : ".edm-pdfhost";
          }).join(",");
          out.push(sel + "{" + r.style.cssText + "}");
        }
      }
    }
    for (var i = 0; i < document.styleSheets.length; i++) { try { walk(document.styleSheets[i].cssRules, false); } catch (e) {} }
    return out.join("\n");
  }

  function stage(d) {
    var host = document.createElement("div"), st = document.createElement("style");
    var wmm = d.pg.own ? 210 : d.pg.w - 2 * d.pg.margin;
    host.className = "edm-pdfhost";
    host.style.cssText = "position:fixed;left:-20000px;top:0;width:" + Math.round(wmm * MM) + "px;background:#fff;color:#000;z-index:-1;pointer-events:none";
    st.textContent = printCss() + "\n.edm-pdfhost .paper,.edm-pdfhost .page{transform:none!important;zoom:1!important;box-shadow:none!important;margin:0!important}";
    var c = d.el.cloneNode(true);
    c.style.display = "block"; c.style.position = "static"; c.style.transform = "none"; c.style.zoom = "1"; c.style.margin = "0"; c.style.maxHeight = "none"; c.style.overflow = "visible";
    host.appendChild(st); host.appendChild(c); document.body.appendChild(host);
    return host;
  }

  /* ช่วงของแถว/บรรทัดในเอกสาร (px จากขอบบน) ใช้หาจุดตัดหน้าที่ไม่ผ่ากลางแถว */
  function spans(part) {
    var top = part.getBoundingClientRect().top, out = [], all = part.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var e = all[i], txt = false;
      if (e.tagName === "TR" || e.tagName === "IMG" || e.tagName === "CANVAS" || e.tagName === "SVG") txt = true;
      else for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) { txt = true; break; }
      if (!txt) continue;
      var b = e.getBoundingClientRect();
      if (b.height > 0 && b.height < 400) out.push([b.top - top, b.bottom - top]);
    }
    return out;
  }
  function domCut(sp, k, want, minY) {
    var best = -1;
    for (var i = 0; i < sp.length; i++) {
      var y = Math.round(sp[i][1] * k);
      if (y > want || y < minY || y <= best) continue;
      var ok = true;
      for (var j = 0; j < sp.length; j++) { var a = sp[j][0] * k, b = sp[j][1] * k; if (a < y - 3 && b > y + 3) { ok = false; break; } }
      if (ok) best = y;
    }
    return best;
  }
  /* หาแถวว่าง (ขาว) ใกล้จุดตัดหน้า จะได้ไม่ตัดกลางบรรทัด */
  function cutAt(cv, want, minY) {
    var ctx = cv.getContext("2d", { willReadFrequently: true }), w = cv.width, lo = Math.max(minY, want - Math.round((want - minY) * 0.18));
    for (var y = want; y > lo; y--) {
      var row = ctx.getImageData(0, y, w, 1).data, white = true;
      for (var x = 0; x < row.length; x += 16) { if (row[x] < 245 || row[x + 1] < 245 || row[x + 2] < 245) { white = false; break; } }
      if (white) return y;
    }
    return want;
  }

  function build(d) {
    var host = d.ext ? null : stage(d), JsPDF = window.jspdf && window.jspdf.jsPDF, h2c = window.html2canvas;
    var opt = { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false };
    function done(x) { if (host) host.remove(); return x; }
    var pg = d.pg, doc, ori = pg.land ? "landscape" : "portrait";
    var p = (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      var root = host ? host.lastChild : d.el;
      var parts = pg.own ? Array.prototype.filter.call(root.matches(".page,.paper") ? [root] : root.querySelectorAll(".page,.paper"), function (e) { return !e.parentElement.closest(".page,.paper") || e === root; }) : [root];
      if (!parts.length) parts = [root];
      var seq = Promise.resolve();
      parts.forEach(function (part) {
        var sp = spans(part), pw = part.getBoundingClientRect().width || 1;
        seq = seq.then(function () { return h2c(part, opt); }).then(function (cv) {
          var k = cv.width / pw;
          var cw = pg.w - 2 * pg.margin, ratio = cv.width / cw; // px ต่อ มม.
          if (pg.roll) {
            var hmm = cv.height / ratio + 2 * pg.margin;
            if (!doc) doc = new JsPDF({ unit: "mm", format: [pg.w, Math.max(hmm, 40)], orientation: "portrait" });
            else doc.addPage([pg.w, Math.max(hmm, 40)], "portrait");
            doc.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", pg.margin, pg.margin, cw, cv.height / ratio);
            return;
          }
          var ph = Math.round((pg.h - 2 * pg.margin) * ratio), y = 0;
          while (y < cv.height - 2) {
            var end = cv.height;
            if (y + ph < cv.height) { end = domCut(sp, k, y + ph, y + Math.round(ph * 0.5)); if (end < 0) end = cutAt(cv, y + ph, y + Math.round(ph * 0.5)); }
            var sl = document.createElement("canvas"); sl.width = cv.width; sl.height = end - y;
            sl.getContext("2d").drawImage(cv, 0, y, cv.width, end - y, 0, 0, cv.width, end - y);
            if (!doc) doc = new JsPDF({ unit: "mm", format: "a4", orientation: ori }); else doc.addPage("a4", ori);
            doc.addImage(sl.toDataURL("image/jpeg", 0.9), "JPEG", pg.margin, pg.margin, cw, (end - y) / ratio);
            y = end;
          }
        });
      });
      return seq;
    }).then(function () { return done(doc.output("blob")); }, function (e) { done(); throw e; });
    return p;
  }

  /* ---------- ชื่อไฟล์ ---------- */
  function fileName(d) {
    var n = d.name || window.EDM_DOCNAME;
    if (!n) {
      var h = d.el.querySelector(".doc-no,.docno,[data-docno]");
      n = h ? h.textContent : "";
    }
    if (!n) { var t = new Date(); n = "เอกสาร-" + t.getFullYear() + ("0" + (t.getMonth() + 1)).slice(-2) + ("0" + t.getDate()).slice(-2) + "-" + ("0" + t.getHours()).slice(-2) + ("0" + t.getMinutes()).slice(-2); }
    return String(n).trim().replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 80) + ".pdf";
  }

  /* ---------- เมนู ---------- */
  var CSS = ".edm-ds{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.45);font-family:inherit}" +
    ".edm-ds-b{background:#fff;color:#111;width:100%;max-width:420px;border-radius:18px 18px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.2)}" +
    "@media(min-width:700px){.edm-ds{align-items:center}.edm-ds-b{border-radius:18px}}" +
    ".edm-ds-t{font-weight:700;font-size:1.05rem;margin:0 0 2px}.edm-ds-s{color:#64748b;font-size:.85rem;margin:0 0 14px;min-height:1.2em;word-break:break-all}" +
    ".edm-ds button{display:flex;align-items:center;gap:10px;width:100%;border:1px solid #e2e8f0;background:#fff;color:#111;border-radius:12px;padding:13px 14px;font:inherit;font-size:1rem;font-weight:600;margin-top:8px;cursor:pointer;text-align:left}" +
    ".edm-ds button.pri{background:#0f6b45;border-color:#0f6b45;color:#fff}.edm-ds button[disabled]{opacity:.55;cursor:wait}" +
    ".edm-ds button.x{justify-content:center;border:0;color:#64748b;font-weight:500}.edm-ds i{font-style:normal;width:22px;text-align:center}" +
    "@media print{.edm-ds{display:none!important}}";

  function canShareFiles() {
    try { return !!(navigator.canShare && navigator.share && navigator.canShare({ files: [new File([new Blob(["%PDF"], { type: "application/pdf" })], "a.pdf", { type: "application/pdf" })] })); }
    catch (e) { return false; }
  }

  function close() { if (sheet) { sheet.remove(); sheet = null; } job++; pdf = null; }

  function open(o) {
    var d = findDoc(o);
    if (!d) { nativePrint(); return; }
    var doPrint = d.onPrint || nativePrint;
    close();
    var my = ++job, name = fileName(d), share = canShareFiles();
    if (!document.getElementById("edmDsCss")) { var s = document.createElement("style"); s.id = "edmDsCss"; s.textContent = CSS; document.head.appendChild(s); }
    sheet = document.createElement("div"); sheet.className = "edm-ds no-print"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "ส่งหรือพิมพ์เอกสาร");
    sheet.innerHTML = '<div class="edm-ds-b"><p class="edm-ds-t">ส่ง / พิมพ์เอกสาร</p><p class="edm-ds-s" id="edmDsS">กำลังเตรียม PDF…</p>' +
      (share ? '<button class="pri" id="edmDsShare" disabled><i>📤</i>ส่ง PDF (LINE · อีเมล · แชร์)</button>' : "") +
      '<button id="edmDsSave" class="' + (share ? "" : "pri") + '" disabled><i>⬇️</i>บันทึกเป็น PDF</button>' +
      '<button id="edmDsPrint"><i>🖨️</i>พิมพ์</button><button class="x" id="edmDsX">ปิด</button></div>';
    document.body.appendChild(sheet);
    var $ = function (id) { return document.getElementById(id); }, msg = $("edmDsS");
    sheet.addEventListener("click", function (e) { if (e.target === sheet) close(); });
    $("edmDsX").onclick = close;
    $("edmDsPrint").onclick = function () { close(); setTimeout(doPrint, 30); };

    var ready = needLibs().then(function () { return build(d); }).then(function (blob) {
      if (my !== job) return;
      pdf = new File([blob], name, { type: "application/pdf" });
      msg.textContent = name + " · " + Math.max(1, Math.round(blob.size / 1024)) + " KB";
      if ($("edmDsShare")) $("edmDsShare").disabled = false;
      $("edmDsSave").disabled = false;
    }, function (e) {
      if (my !== job) return;
      msg.textContent = "สร้าง PDF ไม่สำเร็จ ใช้ปุ่มพิมพ์ แล้วเลือก “บันทึกเป็น PDF” แทนได้";
      if (window.console) console.warn("docshare", e);
    });

    if ($("edmDsShare")) $("edmDsShare").onclick = function () {
      if (!pdf) return;
      navigator.share({ files: [pdf], title: name.replace(/\.pdf$/, "") }).then(close, function (e) {
        if (e && e.name === "AbortError") return;
        msg.textContent = "แชร์ไม่ได้ในเบราว์เซอร์นี้ กด “บันทึกเป็น PDF” แล้วส่งไฟล์แทน";
      });
    };
    $("edmDsSave").onclick = function () {
      if (!pdf) return;
      var u = URL.createObjectURL(pdf), a = document.createElement("a");
      a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      msg.textContent = "บันทึกแล้ว: " + name;
    };
    return ready;
  }

  window.print = function () { open(); };
  // หลังพิมพ์/แชร์ ล้างชื่อไฟล์ที่ตั้งไว้ จะได้ไม่ติดไปเอกสารถัดไป
  window.addEventListener("afterprint", function () { window.EDM_DOCNAME = ""; });
  window.EDM_DOCSHARE = { open: open, print: nativePrint, findDoc: findDoc };
})();
