/* หน้าตาร่วมของเครื่องมือออนไลน์ (เปิดบิล · สต๊อก · บัญชี · เงินเดือน) เมื่อเปิดใช้แบบเดี่ยว
   - หัวเว็บใหม่: โลโก้ + ชื่อเครื่องมือ + ตัวสลับเครื่องมือ (มือถือย่อเป็นปุ่ม ☰)
   - การ์ดต้อนรับ "เริ่มใช้งานใน 3 ขั้นตอน" ตอนยังไม่มีข้อมูล (ปิดได้ เรียกดูใหม่ที่ปุ่ม ❓)
   - ท้ายเว็บพร้อมโลโก้ร้าน · ไม่ทำงานเมื่อฝังอยู่ในระบบร้านค้า (/app/) */
(function () {
  "use strict";
  var embedded = false; try { embedded = window.top !== window.self && window.top.location.origin === location.origin; } catch (e) {}
  if (embedded) return;
  var key = (location.pathname.match(/\/(bill|stock|account|payroll)\//) || [])[1];
  if (!key) return;
  function arr(k) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return Array.isArray(v) ? v.length : 0; } catch (e) { return 0; } }
  function accHas() { try { var a = JSON.parse(localStorage.getItem("edm_acc") || "{}"); return ((a.pur || []).length + (a.pay || []).length + arr("edm_bill_docs")) > 0; } catch (e) { return false; } }
  function clickDemo(sel) { var b = document.querySelector(sel); if (b) { b.click(); return; } var t = document.createElement("button"); t.setAttribute("data-act", "demo"); t.hidden = true; document.body.appendChild(t); t.click(); t.remove(); }
  var TOOLS = {
    bill: { ic: "🧾", n: "เปิดบิลออนไลน์", d: "ใบเสนอราคา ใบแจ้งหนี้ ใบกำกับภาษี ใบเสร็จ ใบวางบิล พิมพ์ A4 หรือบันทึก PDF ได้ทันที",
      steps: [["🏪", "ใส่ข้อมูลร้าน", "ชื่อ ที่อยู่ เลขผู้เสียภาษี โลโก้ (ทำครั้งเดียว)"], ["✍️", "กรอกเอกสาร", "เลือกประเภท ลูกค้า และรายการ ดูตัวอย่างบิลทันที"], ["🖨️", "พิมพ์ / ส่ง PDF", "กดบันทึกเก็บไว้ ค้นหาย้อนหลังได้ที่ 📁 เอกสารของฉัน"]],
      has: function () { return arr("edm_bill_docs") > 0; }, demo: function () { clickDemo("#demoBtn"); } },
    stock: { ic: "📦", n: "ระบบสต๊อกสินค้า", d: "รู้ยอดคงเหลือ ต้นทุนถัวเฉลี่ย สินค้าใกล้หมด และสร้างใบสั่งซื้อได้ในไม่กี่คลิก",
      steps: [["➕", "เพิ่มสินค้า", "รหัส ชื่อ แบรนด์ หน่วย ราคาทุน ราคาขาย จุดสั่งซื้อ"], ["⇄", "รับเข้า / เบิกออก", "บันทึกเมื่อของเข้า-ออก หรือตรวจนับปรับยอด"], ["📊", "ดูรายงาน", "คงเหลือ มูลค่าสต๊อก และสินค้าที่ต้องสั่งซื้อ"]],
      has: function () { return arr("edm_stock_items") > 0; }, demo: function () { clickDemo('[data-act="demo"]'); } },
    account: { ic: "📒", n: "บัญชีร้านค้า", d: "กำไรขาดทุน ลูกหนี้ เจ้าหนี้ ซื้อ-ค่าใช้จ่าย เงินสด-ธนาคาร และภาษีซื้อ-ขาย สรุปให้อัตโนมัติ",
      steps: [["🧾", "ขาย", "ออกบิลที่หน้าเปิดบิล ยอดขายและลูกหนี้เข้ามาเอง"], ["🛒", "ซื้อ / ค่าใช้จ่าย", "บันทึกใบซื้อและค่าใช้จ่ายของร้าน"], ["📊", "ดูกำไร / ภาษี", "งบกำไรขาดทุน รายงานภาษีแบบกรมสรรพากร"]],
      has: accHas, demo: function () { clickDemo('[data-act="demo"]'); } },
    payroll: { ic: "💰", n: "คำนวณเงินเดือน", d: "คำนวณเงินเดือน OT ประกันสังคม ภาษีหัก ณ ที่จ่าย และพิมพ์สลิปเงินเดือนได้ครบ",
      steps: [["👥", "เพิ่มพนักงาน", "ชื่อ เงินเดือน ประกันสังคม ค่าลดหย่อน"], ["🧮", "กรอกรายการเดือนนี้", "OT เบี้ยขยัน รายได้อื่น ขาด-ลา-สาย"], ["🖨️", "พิมพ์สลิป / สรุป", "สลิปรายคน สรุปยอดจ่าย และ Excel"]],
      has: function () { return arr("edm_pay_emps") > 0; }, demo: function () { clickDemo("#demo"); } }
  };
  var T = TOOLS[key];
  var LINKS = [["app", "🏪", "ระบบร้านค้า", "ครบทุกระบบในที่เดียว"], ["bill", "🧾", "เปิดบิล", ""], ["stock", "📦", "สต๊อก", ""], ["account", "📒", "บัญชี", ""], ["payroll", "💰", "เงินเดือน", ""]];

  var css = document.createElement("style");
  css.textContent =
    "header.top .brand.tu-brand{gap:10px;min-width:0;background:none!important;padding:0!important;color:var(--ink,#111)!important;box-shadow:none!important;flex-direction:row!important;align-items:center!important;border-radius:0!important}.tu-hero{grid-column:1/-1}header.top .brand.tu-brand img{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:none;box-shadow:0 0 0 2px var(--card,#fff),0 0 0 3px var(--line,#ddd)}" +
    "header.top .brand.tu-brand span{display:flex;flex-direction:column;line-height:1.15;min-width:0}header.top .brand.tu-brand b{font-size:1.02rem;white-space:nowrap}header.top .brand.tu-brand small{font-size:.72rem;color:var(--muted,#777);font-weight:500;margin:0}" +
    ".tu-sw{display:flex;gap:2px;background:var(--soft,#f1f3f2);border-radius:999px;padding:3px;margin-left:18px}" +
    ".tu-sw a{text-decoration:none;color:var(--muted,#666);font-size:.84rem;font-weight:600;padding:6px 12px;border-radius:999px;white-space:nowrap}.tu-sw a:hover{color:var(--ink,#111);background:rgba(0,0,0,.04)}" +
    ".tu-sw a.on{background:var(--card,#fff);color:var(--ink,#111);box-shadow:0 1px 3px rgba(0,0,0,.12)}.tu-sw a.app{color:var(--accent,#127A4B)}" +
    ".tu-help,.tu-menu{border:0;background:none;font:inherit;cursor:pointer;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:1.1rem;color:var(--ink,#111)}.tu-help:hover,.tu-menu:hover{background:var(--soft,#f1f3f2)}" +
    ".tu-menu{display:none;background:var(--soft,#f1f3f2)}" +
    "@media(max-width:900px){.tu-sw a span{display:none}.tu-sw a{padding:6px 10px}}" +
    "@media(max-width:760px){.tu-sw{display:none}.tu-menu{display:grid}header.top .nav{flex-wrap:nowrap!important;gap:6px!important}header.top .nav>.btn{padding:8px 10px}header.top .nav>.btn .tu-lbl{display:none}}" +
    ".tu-sheet{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center}.tu-sheet[hidden]{display:none}" +
    ".tu-sheet>div{background:var(--card,#fff);width:100%;max-width:520px;border-radius:22px 22px 0 0;padding:10px 14px calc(16px + env(safe-area-inset-bottom,0px));box-shadow:0 -20px 50px -20px rgba(0,0,0,.4);animation:tuUp .18s ease-out}" +
    "@keyframes tuUp{from{transform:translateY(30px);opacity:.4}to{transform:none;opacity:1}}" +
    ".tu-sheet .grab{width:42px;height:5px;border-radius:9px;background:var(--line,#ddd);margin:2px auto 10px}.tu-sheet h4{margin:4px 6px 8px;font-size:.8rem;color:var(--muted,#777);font-weight:600}" +
    ".tu-sheet a{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;text-decoration:none;color:var(--ink,#111);font-weight:600}.tu-sheet a:hover,.tu-sheet a.on{background:var(--soft,#f1f3f2)}" +
    ".tu-sheet a i{font-style:normal;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--soft,#f1f3f2);font-size:1.2rem}.tu-sheet a.on i{background:var(--accent,#127A4B)}" +
    ".tu-sheet a small{display:block;font-weight:400;color:var(--muted,#777);font-size:.78rem}.tu-sheet a em{margin-left:auto;font-style:normal;font-size:.75rem;color:var(--accent,#127A4B)}" +
    "@media print{.tu-hero,.tu-sheet,.tu-foot,footer.tu-ft{display:none!important}}" +
    ".tu-hero{position:relative;display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start;background:linear-gradient(135deg,color-mix(in srgb,var(--accent,#127A4B) 10%,var(--card,#fff)),var(--card,#fff) 60%);border-radius:20px;padding:22px;margin-bottom:14px;box-shadow:0 0 0 1px color-mix(in srgb,var(--accent,#127A4B) 22%,transparent)}" +
    ".tu-hero .ic{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;font-size:2rem;background:var(--card,#fff);box-shadow:0 8px 20px -10px rgba(0,0,0,.3)}" +
    ".tu-hero h3{margin:2px 0 4px;font-size:1.3rem}.tu-hero p{margin:0;color:var(--muted,#666);font-size:.92rem;max-width:62ch}" +
    ".tu-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0 14px}.tu-steps div{background:var(--card,#fff);border-radius:14px;padding:12px 12px 12px 48px;position:relative;box-shadow:0 0 0 1px var(--line,#e5e5e5)}" +
    ".tu-steps b{display:block;font-size:.9rem}.tu-steps span{display:block;font-size:.78rem;color:var(--muted,#777);margin-top:2px;line-height:1.4}" +
    ".tu-steps i{position:absolute;left:12px;top:12px;font-style:normal;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent,#127A4B) 14%,transparent);font-size:.9rem}" +
    ".tu-steps u{position:absolute;right:10px;top:8px;text-decoration:none;font-size:.7rem;font-weight:700;color:var(--muted,#999)}" +
    ".tu-hero .acts{display:flex;gap:8px;flex-wrap:wrap}.tu-hero .x{position:absolute;right:10px;top:10px;border:0;background:none;font-size:1rem;cursor:pointer;color:var(--muted,#888);width:32px;height:32px;border-radius:10px}.tu-hero .x:hover{background:rgba(0,0,0,.05)}" +
    "@media(max-width:700px){.tu-hero{grid-template-columns:1fr;padding:18px}.tu-hero .ic{width:52px;height:52px;font-size:1.6rem}.tu-steps{grid-template-columns:1fr}}" +
    ".tu-foot{max-width:1200px;margin:28px auto 0;padding:22px 16px calc(28px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line,#e5e5e5);display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;color:var(--muted,#777);font-size:.82rem}" +
    ".tu-foot .b{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.tu-foot .b img{width:42px;height:42px;border-radius:50%;object-fit:cover}.tu-foot .b strong{display:block;color:var(--ink,#111);font-size:.95rem}" +
    ".tu-foot nav{display:flex;gap:4px;flex-wrap:wrap}.tu-foot nav a{color:var(--muted,#666);text-decoration:none;padding:6px 10px;border-radius:9px;font-weight:500}.tu-foot nav a:hover{background:var(--soft,#f1f3f2);color:var(--ink,#111)}" +
    "body.has-mtabs .tu-foot{padding-bottom:90px}";
  document.head.appendChild(css);

  function go() {
    var hd = document.querySelector("header.top"), brand = hd && hd.querySelector(".brand"), nav = hd && hd.querySelector(".nav");
    if (brand) { brand.classList.add("tu-brand"); brand.setAttribute("href", "/"); brand.title = "ร้าน Excel Data Master"; brand.innerHTML = '<img src="/assets/logo.jpg" alt=""><span><b>' + T.ic + " " + T.n + "</b><small>Excel Data Master</small></span>"; }
    if (nav) {
      [].slice.call(nav.querySelectorAll("a.btn")).forEach(function (a) { a.remove(); });          // ลิงก์เครื่องมือย้ายไปตัวสลับ
      [].slice.call(nav.querySelectorAll("button.btn")).forEach(function (b) { if (b.querySelector(".tu-lbl")) return; var t = b.textContent.trim(), m = t.match(/^(\S+)\s+(.+)$/); if (m) b.innerHTML = m[1] + ' <span class="tu-lbl">' + m[2] + "</span>"; b.title = t; });
      var sw = document.createElement("div"); sw.className = "tu-sw"; sw.setAttribute("aria-label", "สลับเครื่องมือ");
      sw.innerHTML = LINKS.map(function (l) { return '<a href="/' + l[0] + '/" class="' + (l[0] === key ? "on" : "") + (l[0] === "app" ? " app" : "") + '">' + l[1] + " <span>" + l[2] + "</span></a>"; }).join("");
      hd.querySelector(".in").insertBefore(sw, nav);
      var help = document.createElement("button"); help.type = "button"; help.className = "tu-help"; help.title = "วิธีใช้"; help.textContent = "❓"; help.onclick = function () { hero(true); }; nav.appendChild(help);
      var mb = document.createElement("button"); mb.type = "button"; mb.className = "tu-menu"; mb.title = "เมนู"; mb.textContent = "☰"; mb.onclick = function () { sheet.hidden = false; }; nav.appendChild(mb);
    }
    var sheet = document.createElement("div"); sheet.className = "tu-sheet"; sheet.hidden = true;
    sheet.innerHTML = '<div><div class="grab"></div><h4>เครื่องมือของร้าน</h4>' + LINKS.map(function (l) { return '<a href="/' + l[0] + '/" class="' + (l[0] === key ? "on" : "") + '"><i>' + l[1] + "</i><span>" + l[2] + (l[3] ? "<small>" + l[3] + "</small>" : "") + "</span>" + (l[0] === key ? "<em>กำลังใช้</em>" : "") + "</a>"; }).join("") +
      '<h4 style="margin-top:12px">อื่น ๆ</h4><a href="/"><i>🛒</i><span>ร้านเทมเพลต Excel<small>เทมเพลตพร้อมใช้ทั้งหมด</small></span></a><a href="https://line.me/R/ti/p/@856tvnxs" target="_blank" rel="noopener"><i>💬</i><span>ติดต่อร้านทาง LINE<small>@856tvnxs</small></span></a></div>';
    sheet.onclick = function (e) { if (e.target === sheet) sheet.hidden = true; };
    document.body.appendChild(sheet);
    // ท้ายเว็บ
    var ft = document.createElement("footer"); ft.className = "tu-foot";
    ft.innerHTML = '<a class="b" href="/"><img src="/assets/logo.jpg" alt=""><span><strong>Excel Data Master</strong>เครื่องมือร้านค้าออนไลน์ · ข้อมูลเก็บในเครื่องนี้ ควรสำรองเป็นระยะ</span></a>' +
      '<nav><a href="/app/">🏪 ระบบร้านค้า</a><a href="/">🛒 ร้านเทมเพลต</a><a href="https://line.me/R/ti/p/@856tvnxs" target="_blank" rel="noopener">💬 LINE</a><a href="/privacy/">🔒 ความเป็นส่วนตัว</a></nav>';
    document.body.appendChild(ft);
    if (document.querySelector(".mtabs")) document.body.classList.add("has-mtabs");
    hero(false);
  }
  var heroEl = null;
  function hero(force) {
    var dk = "edm_tu_hide_" + key, hidden = false; try { hidden = localStorage.getItem(dk) === "1"; } catch (e) {}
    if (heroEl) { heroEl.remove(); heroEl = null; if (force) return; }
    if (!force && (hidden || T.has())) return;
    var main = document.querySelector("main"); if (!main) return;
    heroEl = document.createElement("section"); heroEl.className = "tu-hero";
    heroEl.innerHTML = '<div class="ic">' + T.ic + '</div><div><h3>' + T.n + '</h3><p>' + T.d + '</p><div class="tu-steps">' +
      T.steps.map(function (s, i) { return "<div><i>" + s[0] + "</i><u>" + (i + 1) + "</u><b>" + s[1] + "</b><span>" + s[2] + "</span></div>"; }).join("") +
      '</div><div class="acts"><button class="btn main" type="button" data-tu="start">เริ่มใช้งานเลย →</button>' + (T.has() ? "" : '<button class="btn ghost" type="button" data-tu="demo">✨ ลองดูข้อมูลตัวอย่าง</button>') + '<a class="btn ghost" href="/app/">🏪 ใช้แบบครบทุกระบบ</a></div></div><button class="x" type="button" title="ปิด" data-tu="x">✕</button>';
    main.insertBefore(heroEl, main.firstChild);
    heroEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tu]"); if (!b) return;
      if (b.dataset.tu === "demo") { T.demo(); setTimeout(function () { if (T.has() && heroEl) { heroEl.remove(); heroEl = null; } }, 600); return; }
      try { localStorage.setItem(dk, "1"); } catch (x) {}
      heroEl.remove(); heroEl = null;
      if (b.dataset.tu === "start") { var f = document.querySelector("main input:not([type=hidden]):not([type=checkbox]),main [data-act=add]"); if (f) { f.scrollIntoView({ block: "center", behavior: "smooth" }); if (f.focus) setTimeout(function () { f.focus(); }, 300); } }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
