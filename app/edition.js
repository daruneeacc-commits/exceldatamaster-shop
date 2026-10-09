/* รุ่นของระบบ: ตัวเต็ม (ระบบร้านค้า) / ตัวแยก (เปิดบิล · สต๊อก)
   เปิดด้วย /app/?ed=bill หรือ /app/?ed=stock · ใช้ข้อมูลชุดเดียวกับตัวเต็ม อัปเกรดแล้วข้อมูลอยู่ครบ */
(function () {
  "use strict";
  var ed = (new URLSearchParams(location.search).get("ed") || "").toLowerCase();
  var EDS = {
    bill: {
      name: "เปิดบิลออนไลน์", ic: "🧾",
      sub: "ออกใบเสนอราคา ใบแจ้งหนี้ ใบกำกับภาษี ใบเสร็จ ใบวางบิล และติดตามลูกหนี้ได้ในที่เดียว",
      allow: ["home", "setup", "data", "cust", "prod", "quotes", "invoices", "billing", "receipts", "ar", "bill", "bills", "rpt"],
      rpt: { inc: 0, mst: ["custlist", "pricelist"] },
      tab: [["home", "🏠", "หน้าหลัก"], ["bill", "🧾", "เปิดบิล"], ["bills", "📋", "บิลทั้งหมด"], ["rpt", "📊", "รายงาน"], ["more", "☰", "เมนู"]]
    },
    stock: {
      name: "ระบบสต๊อกสินค้า", ic: "📦",
      sub: "รู้ยอดคงเหลือ ต้นทุนถัวเฉลี่ย รับเข้า-เบิกออก ตรวจนับ และสั่งซื้อสินค้าได้ในที่เดียว",
      allow: ["home", "setup", "data", "prod", "sup", "stock", "stkitems", "stkin", "stkout", "stkadj", "stkhist", "stkre", "stockrep", "cost", "rpt"],
      rpt: { stk: 0, exp: ["cost", "po", "pursup", "purbrand"], mst: ["suplist", "pricelist"] },
      labels: { cost: "ซื้อสินค้า / ใบสั่งซื้อ" }, groups: { exp: "ซื้อสินค้า" }, rptLabels: { exp: "ซื้อสินค้า" },
      tab: [["home", "🏠", "หน้าหลัก"], ["stkitems", "📦", "สินค้า"], ["stkin", "⬇️", "รับเข้า"], ["rpt", "📊", "รายงาน"], ["more", "☰", "เมนู"]]
    }
    ,book: {
      name: "ระบบจองและให้เช่า", ic: "📅",
      sub: "จองห้องพัก ห้องประชุม สนาม และอุปกรณ์ให้เช่า เช็กว่างอัตโนมัติ มัดจำ ค่าประกัน แล้วออกบิลต่อได้ทันที",
      allow: ["bk", "bkcal", "bklist", "bkres", "bkrpt", "bkset"], solo: "bk", start: "bk",
      shopName: function () { try { return ((JSON.parse(localStorage.getItem("edm_book_cfg") || "{}") || {}).shop || {}).name || ""; } catch (e) { return ""; } },
      rpt: {},
      tab: [["bk", "🏠", "หน้าหลัก"], ["bkcal", "📅", "ปฏิทิน"], ["bklist", "📋", "การจอง"], ["bkrpt", "📊", "รายงาน"], ["more", "☰", "เมนู"]]
    }
    ,cafe: {
      name: "ระบบร้านคาเฟ่", ic: "☕",
      sub: "ขายหน้าร้าน ออกคิว จอบาร์ ตัดสต๊อกวัตถุดิบตามสูตรต่อแก้ว ปิดกะแล้วลงบัญชีให้อัตโนมัติ",
      allow: ["cf", "cfpos", "cfbar", "cford", "cfmenu", "cfinv", "cfshift", "cfrpt", "cfset"], solo: "cf", start: "cf",
      shopName: function () { try { return ((JSON.parse(localStorage.getItem("edm_cafe_cfg") || "{}") || {}).shop || {}).name || ""; } catch (e) { return ""; } },
      rpt: {},
      tab: [["cfpos", "🧾", "ขาย"], ["cfbar", "🍹", "บาร์"], ["cf", "☕", "ภาพรวม"], ["cfrpt", "📊", "รายงาน"], ["more", "☰", "เมนู"]]
    }
  };
  var E = EDS[ed] || null;
  window.EDM_ED = E;
  if (!E) return;
  E.key = ed;
  E.ok = function (r) { return r === "upg" || E.allow.indexOf(r) >= 0; };
  E.rptOk = function (g, id) { if (!(g in E.rpt)) return false; var L = E.rpt[g]; return !L || !id || L.indexOf(id) >= 0; };
  document.documentElement.classList.add("ed-" + ed);
  if (E.solo) document.documentElement.classList.add("ed-solo");
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function setText(el, t) { if (!el) return; var n = [].slice.call(el.childNodes).filter(function (x) { return x.nodeType === 3 && x.nodeValue.trim(); })[0]; if (n) n.nodeValue = t; }

  // เมนูข้าง: เหลือเฉพาะเมนูของรุ่นนี้
  $$("aside a[data-r]").forEach(function (a) {
    var r = a.dataset.r, ok = r === "rpt" ? (a.dataset.g === "all" || (a.dataset.g in E.rpt)) : E.allow.indexOf(r) >= 0;
    if (!ok) a.remove(); else if (E.labels && E.labels[r]) setText(a, E.labels[r]); else if (r === "rpt" && E.rptLabels && E.rptLabels[a.dataset.g]) setText(a, E.rptLabels[a.dataset.g]);
  });
  // ระบบเดี่ยว (คาเฟ่ / จอง): เมนูของระบบนั้นขึ้นเป็นปุ่มหลักบนแถบดำ ไม่มีเมนูของระบบอื่น
  if (E.solo) {
    var IC = { cf: "☕", cfpos: "🧾", cfbar: "🍹", cford: "📋", cfmenu: "📖", cfinv: "🧂", cfshift: "💰", cfrpt: "📊", cfset: "⚙️", bk: "🏠", bkcal: "📅", bklist: "📋", bkres: "🛏️", bkrpt: "📊", bkset: "⚙️" };
    var NM = { cf: "ภาพรวม", cfpos: "ขาย", cfbar: "จอบาร์", cford: "ออเดอร์", cfmenu: "เมนู", cfinv: "วัตถุดิบ", cfshift: "กะ", cfrpt: "รายงาน", cfset: "ตั้งค่า", bk: "ภาพรวม", bkcal: "ปฏิทิน", bklist: "การจอง", bkres: "ห้อง / อุปกรณ์", bkrpt: "รายงาน", bkset: "ตั้งค่า" };
    var sg = $('aside .mg[data-g="' + E.solo + '"]'), foot = $("aside .foot");
    if (sg && foot) $$(".mg-b a", sg).forEach(function (a) { setText(a, NM[a.dataset.r] || ""); var i = document.createElement("span"); i.className = "step"; i.textContent = IC[a.dataset.r] || "•"; a.insertBefore(i, a.firstChild); foot.parentNode.insertBefore(a, foot); });
    $$("aside > a[data-r], aside .mg").forEach(function (x) { if (x.tagName === "A" ? E.allow.indexOf(x.dataset.r) < 0 : true) x.remove(); });
  }
  $$("aside .mg").forEach(function (g) {
    var as = $$(".mg-b a", g); if (!as.length) { g.remove(); return; }
    as.forEach(function (a, i) { var n = $(".no", a); if (n && n.textContent !== "★") n.textContent = i + 1; });
    if (E.groups && E.groups[g.dataset.g]) setText($(".mg-h", g), E.groups[g.dataset.g]);
  });
  // รุ่นสต๊อก: เอาเมนูสต๊อกขึ้นก่อน
  if (ed === "stock") { var sg = $('aside .mg[data-g="stk"]'), eg = $('aside .mg[data-g="exp"]'); if (sg && eg) eg.parentNode.insertBefore(sg, eg); }
  // ชื่อระบบ
  var br = $("header .brand"); setText(br, E.name + " ");
  var hs = $("#hiSub"); if (hs) hs.textContent = E.sub;
  var tt = $("title"); function fixTitle() { if (tt && tt.textContent.indexOf("ระบบร้านค้า") >= 0) tt.textContent = tt.textContent.replace("ระบบร้านค้า", E.name); }
  fixTitle(); if (tt) new MutationObserver(fixTitle).observe(tt, { childList: true, characterData: true, subtree: true });
  // การ์ดอัปเกรดท้ายเมนู
  var ft = $("aside .foot");
  if (ft && !E.solo) { var up = document.createElement("a"); up.className = "ed-up"; up.href = "/app/"; up.innerHTML = "<b>⭐ อัปเกรดเป็นระบบร้านค้าตัวเต็ม</b><span>เปิดบิล + สต๊อก + ซื้อ/ค่าใช้จ่าย + การเงิน + ภาษี + กำไรขาดทุน ข้อมูลเดิมอยู่ครบ</span>"; ft.insertBefore(up, ft.firstChild); }
  // แถบล่างมือถือ
  var tb = $("#tabbar"); if (tb) tb.innerHTML = E.tab.map(function (t) { return '<button data-go="' + t[0] + '"><i>' + t[1] + "</i>" + t[2] + "</button>"; }).join("");
  // หน้า "เมนูนี้อยู่ในตัวเต็ม"
  var home = $("#home");
  if (home) {
    var sec = document.createElement("section"); sec.id = "upg"; sec.className = "pane";
    sec.innerHTML = '<div class="wrap" style="max-width:760px"><div class="card ed-upg"><div class="ic">⭐</div><h1>เมนูนี้อยู่ในระบบร้านค้าตัวเต็ม</h1>' +
      "<p>คุณใช้ <b>" + E.ic + " " + E.name + "</b> อยู่ อัปเกรดเป็นระบบร้านค้าตัวเต็ม เพื่อใช้ทุกเมนูที่เชื่อมกันอัตโนมัติ · ข้อมูลที่บันทึกไว้แล้วใช้ต่อได้ทันที ไม่ต้องกรอกใหม่</p>" +
      '<div class="ed-feat"><span>🧾 เปิดบิล ใบเสนอราคา ใบวางบิล</span><span>📦 สต๊อก รับเข้า เบิกออก สั่งซื้อ</span><span>🛒 ซื้อสินค้า ค่าใช้จ่าย เจ้าหนี้</span><span>🏦 ธนาคาร เงินสด เงินสดย่อย</span><span>📑 ภาษีซื้อ-ขาย แบบกรมสรรพากร</span><span>📊 กำไรขาดทุน และรายงานครบทุกเมนู</span></div>' +
      '<div class="acts"><a class="btn main" href="/app/">ดูระบบร้านค้าตัวเต็ม →</a><a class="btn ghost" href="https://line.me/R/ti/p/@856tvnxs" target="_blank" rel="noopener">💬 สอบถามราคาทาง LINE</a><button class="btn ghost" type="button" data-go="home">← กลับหน้าหลัก</button></div></div></div>';
    home.parentNode.appendChild(sec);
  }
  var st = document.createElement("style");
  st.textContent = ".ed-up{display:block;text-decoration:none;margin:0 0 10px;padding:12px 13px;border-radius:14px;background:linear-gradient(135deg,#F6C445,#F29F38);color:#2B1A00!important}.ed-up b{display:block;font-size:.86rem}.ed-up span{display:block;font-size:.72rem;margin-top:3px;opacity:.85;line-height:1.35}.ed-up:hover{filter:brightness(1.05)}" +
    ".ed-upg{text-align:center;padding:30px 24px}.ed-upg .ic{font-size:2.6rem}.ed-upg h1{font-size:1.4rem;margin:8px 0}.ed-upg p{color:var(--muted);max-width:56ch;margin:0 auto 16px}.ed-feat{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;text-align:left;margin:0 0 18px}.ed-feat span{background:var(--soft);border-radius:10px;padding:9px 12px;font-size:.88rem}.ed-upg .acts{justify-content:center}" +
    "@media(max-width:600px){.ed-feat{grid-template-columns:1fr}}" +
    "html.ed-solo .search,html.ed-solo .sbtn{display:none!important}";
  document.head.appendChild(st);

  // หน้าหลักของแต่ละรุ่น (เรียกจาก renderHome ของระบบร้านค้า)
  E.home = function (c) {
    if (E.solo) return;
    if (ed === "book" || ed === "cafe") { var hh = location.hash.replace(/^#\/?/, "").split("?")[0]; if (!hh || hh === "home") location.replace(ed === "cafe" ? "#/cf" : "#/bk"); return; } // renderHome ถูกเรียกเพื่ออัปเดตตัวเลขเมนูด้วย จึงพาไปหน้าจองเฉพาะตอนอยู่หน้าหลัก
    var qa = $("#home .qa"), cards = $$("#home .grid2 > .card"), h2a = cards[0] && $("h2", cards[0]), h2b = cards[1] && $$("h2", cards[1]);
    function qbtns(L) { qa.innerHTML = L.map(function (x) { return '<button data-go="' + x[0] + '">' + x[1] + "</button>"; }).join(""); }
    if (ed === "bill") {
      var qt = c.docs.filter(function (d) { return d.type === "QT" && !c.docs.some(function (x) { return x.ref === d.no && x.type !== "QT"; }); });
      $("#kpis").innerHTML = '<button class="kpi" data-go="rpt?r=salecust"><span>ยอดขาย ' + c.m + ' (ก่อน VAT)</span><b>฿' + fmt0(c.s) + "</b><small>" + c.n + " บิล · เงินสด " + fmt0(c.sc) + " · เชื่อ " + fmt0(c.s - c.sc) + "</small></button>" +
        '<button class="kpi" data-go="rpt?r=rc"><span>ภาษีขาย ' + c.m + "</span><b>฿" + fmt(c.vat) + "</b><small>" + (c.seller.vat ? "จาก ใบกำกับภาษี" : "ยังไม่ได้จด VAT") + "</small></button>" +
        '<button class="kpi ' + (c.ar > 0 ? "warn" : "") + '" data-go="ar"><span>ลูกหนี้ค้างรับ</span><b>฿' + fmt0(c.ar) + "</b><small>" + c.arN + " ใบ · กดเพื่อรับชำระ</small></button>" +
        '<button class="kpi" data-go="quotes"><span>ใบเสนอราคารอตอบรับ</span><b>' + qt.length + " ใบ</b><small>ทั้งหมด " + c.docs.filter(function (d) { return d.type === "QT"; }).length + " ใบ</small></button>";
      var st = [{ done: !!(c.seller.name && c.seller.addr), t: "ตั้งค่าร้าน", d: "ชื่อร้าน ที่อยู่ เลขผู้เสียภาษี โลโก้ และการจด VAT", go: "setup", cta: "ตั้งค่าร้าน" },
        { done: (LS.get("edm_bill_customers", []) || []).length > 0, t: "ข้อมูลลูกค้า", d: "เพิ่มลูกค้าไว้ เวลาเปิดบิลพิมพ์ชื่อไม่กี่ตัวก็ขึ้นให้เลือก", go: "cust", cta: "ข้อมูลลูกค้า" },
        { done: c.sales.length > 0, t: "เปิดบิลขาย", d: "ใบเสนอราคา ใบแจ้งหนี้ ใบกำกับภาษี ใบเสร็จ พิมพ์ A4 ได้ทันที", go: "bill", cta: "เปิดบิล" },
        { done: (c.A.pay || []).some(function (p) { return p.dir === "in"; }), t: "รับชำระ / ติดตามหนี้", d: "บันทึกรับเงิน ออกใบเสร็จอัตโนมัติ และดูลูกหนี้ค้าง", go: "ar", cta: "ลูกหนี้" }];
      flow(st);
      qbtns([["bill", "🧾 เปิดบิลขาย"], ["quotes", "📝 ใบเสนอราคา"], ["billing", "📨 ใบวางบิล"], ["ar", "💳 รับเงินจากลูกค้า"], ["cust", "👥 ข้อมูลลูกค้า"], ["rpt?g=inc", "📊 รายงานรายรับ"]]);
      if (h2b && h2b[1]) h2b[1].textContent = "ลูกหนี้ใกล้ / เกินกำหนด";
      var pin = (c.A.pay || []).filter(function (p) { return p.dir === "in"; });
      var od = c.docs.filter(function (d) { return d.type === "IV" || (d.type === "IT" && d.term !== "cash"); }).map(function (d) { return { d: d, s: docStatus(d, c.docs, pin) }; }).filter(function (x) { return x.s.left > 0.009; }).sort(function (a, b) { return String(a.d.due || a.d.date).localeCompare(String(b.d.due || b.d.date)); }).slice(0, 5);
      $("#low").innerHTML = od.length ? od.map(function (x) { return '<div class="li"><div>' + esc(x.d.no) + "<small>" + esc(x.d.cust && x.d.cust.name || "-") + " · ครบ " + thD(x.d.due || x.d.date) + '</small></div><div class="r">฿' + fmt(x.s.left) + "<small>" + (x.s.late ? "เกินกำหนด" : "รอรับ") + "</small></div></div>"; }).join("") : '<div class="empty">ไม่มีลูกหนี้ค้าง 👍</div>';
    }
    if (ed === "stock") {
      var A = c.A, ordered = (A.pur || []).filter(function (p) { return p.status === "ordered"; }), val = 0, out = 0;
      c.items.forEach(function (i) { var b = c.B[i.id] || 0; val += Math.max(b, 0) * num(i.cost); if (b <= 0) out++; });
      $("#kpis").innerHTML = '<button class="kpi" data-go="stkitems"><span>สินค้าทั้งหมด</span><b>' + c.items.length + " รายการ</b><small>มูลค่าประมาณ ฿" + fmt0(val) + " (ตามราคาทุน)</small></button>" +
        '<button class="kpi ' + (c.low.length ? "warn" : "") + '" data-go="stkre"><span>ใกล้หมด / ต้องสั่ง</span><b>' + c.low.length + " รายการ</b><small>กดเพื่อสร้างใบสั่งซื้อ</small></button>" +
        '<button class="kpi ' + (out ? "warn" : "") + '" data-go="stkitems"><span>หมดสต๊อก</span><b>' + out + " รายการ</b><small>คงเหลือ 0 หรือติดลบ</small></button>" +
        '<button class="kpi" data-go="cost"><span>ใบสั่งซื้อรอรับของ</span><b>' + ordered.length + " ใบ</b><small>กด \"รับของ\" เมื่อสินค้ามาถึง</small></button>";
      var tx = LS.get("edm_stock_tx", []) || [];
      flow([{ done: !!(c.seller.name), t: "ตั้งค่าร้าน", d: "ชื่อร้าน ที่อยู่ ใช้บนใบสั่งซื้อและรายงาน", go: "setup", cta: "ตั้งค่าร้าน" },
        { done: c.items.length > 0, t: "เพิ่มสินค้า", d: "รหัส ชื่อ แบรนด์ หน่วย ราคาทุน ราคาขาย จุดสั่งซื้อ", go: "stkitems", cta: "รายการสินค้า" },
        { done: tx.some(function (t) { return t.type === "in"; }), t: "รับสินค้าเข้า", d: "ยอดยกมา หรือของเข้าจากผู้ขาย ต้นทุนเฉลี่ยคำนวณให้", go: "stkin", cta: "รับเข้า" },
        { done: tx.some(function (t) { return t.type === "adj"; }), t: "ตรวจนับสต๊อก", d: "นับของจริง ระบบปรับยอดให้ตรงและเก็บส่วนต่าง", go: "stkadj", cta: "ตรวจนับ" }]);
      qbtns([["stkin", "⬇️ รับสินค้าเข้า"], ["stkout", "⬆️ เบิก / จ่ายออก"], ["stkadj", "🔍 ตรวจนับสต๊อก"], ["stkre", "🛒 สินค้าต้องสั่งซื้อ"], ["cost", "📝 ใบสั่งซื้อ / รับของ"], ["rpt?g=stk", "📊 รายงานสต๊อก"]]);
      if (h2a) h2a.firstChild.textContent = "ความเคลื่อนไหวล่าสุด ";
      var bt = h2a && $("button", h2a); if (bt) bt.dataset.go = "stkhist";
      var byId = {}; c.items.forEach(function (i) { byId[i.id] = i; });
      var rec = tx.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)) || (b.ts || 0) - (a.ts || 0); }).slice(0, 6);
      var TY = { "in": ["รับเข้า", "+"], out: ["เบิก/ขาย", "−"], adj: ["ปรับยอด", ""] };
      $("#recent").innerHTML = rec.length ? rec.map(function (t) { var i = byId[t.pid] || { name: "-", unit: "" }, T = TY[t.type] || ["", ""]; return '<div class="li"><div><b>' + esc(i.name) + '</b> <span class="tag ' + (t.type === "in" ? "" : "cr") + '">' + T[0] + "</span><small>" + thD(t.date) + (t.party ? " · " + esc(t.party) : "") + '</small></div><div class="r">' + T[1] + fmt0(Math.abs(num(t.qty))) + " " + esc(i.unit || "") + "</div></div>"; }).join("") : '<div class="empty">ยังไม่มีความเคลื่อนไหว · กด "รับสินค้าเข้า" เพื่อเริ่ม</div>';
    }
  };
  function flow(st) { $("#flow").innerHTML = st.map(function (x, i) { return '<button class="fs ' + (x.done ? "done" : "") + '" data-go="' + x.go + '"><span class="no">' + (x.done ? "✓" : i + 1) + "</span><b>" + x.t + "</b><span>" + x.d + "</span><em>" + x.cta + " →</em></button>"; }).join(""); $("#flowNote").textContent = st.filter(function (x) { return x.done; }).length + "/4 ขั้นตอน"; }
})();
