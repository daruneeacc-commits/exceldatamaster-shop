/* Excel Data Master · ระบบสมาชิกสำหรับเครื่องมือออนไลน์ (เปิดบิล / คำนวณเงินเดือน)
 * - ทดลองใช้ฟรี 7 วัน แล้วซื้อแยกตามระบบ (ระบบละ 149 · ร้านค้า 249 · To-Do 49 · การเงิน 199 บาท / 30 วัน; สมาชิกเดิม 199 / ครบทุกระบบ ใช้ต่อได้)
 * - บัญชีและวันหมดอายุเก็บที่ระบบหลังร้าน (Google Apps Script) · ข้อมูลบิล/เงินเดือนอยู่ในเบราว์เซอร์ของผู้ใช้เท่านั้น
 */
(function () {
  "use strict";
  var API = window.EDM_API || "https://script.google.com/macros/s/AKfycbwNExdnOGMAoDQVi0JtlWMVW2mqrteMPA8q8tXr0n3wgN9a9NprGec2RM6ASF_Ewy4/exec";
  /* ---------- สิทธิ์รายระบบ ----------
   * ระบบหลังร้านส่ง sys มากับ login/check เช่น "bill" · "payroll,time" · "shop" · "all"
   * ไม่มี sys (บัญชีเดิม/ระบบหลังร้านรุ่นเก่า) = ใช้ได้ทุกระบบเหมือนเดิม
   * shop = ระบบร้านค้า (เปิดบิล + สต๊อก + บัญชี) · all = ครบทุกระบบ (ไม่รวมลงเวลา ซึ่งขายแยก) */
  var SYS = {
    bill: { n: "เปิดบิลออนไลน์", u: "bill/" }, stock: { n: "สต๊อกสินค้า", u: "stock/" }, account: { n: "บัญชีร้านค้า", u: "account/" },
    shop: { n: "ระบบร้านค้า (บิล · สต๊อก · บัญชี)", u: "app/" }, cafe: { n: "ร้านคาเฟ่ (POS)", u: "cafe/" }, book: { n: "จองห้อง / ให้เช่า", u: "booking/" }, dorm: { n: "ระบบหอพัก / อพาร์ตเมนต์", u: "app/?ed=dorm" },
    payroll: { n: "คำนวณเงินเดือน", u: "payroll/" }, time: { n: "ลงเวลา / ตอกบัตร", u: "time/" }, todo: { n: "To-Do งานที่ต้องทำ", u: "todo/" },
    finance: { n: "การเงิน SME & ฟรีแลนซ์", u: "finance/" }, orders: { n: "จัดการออเดอร์ร้านออนไลน์", u: "orders/" }
  };
  var GROUP = { shop: ["shop", "bill", "stock", "account"], book: ["book", "dorm"], all: ["shop", "bill", "stock", "account", "cafe", "book", "dorm", "payroll", "todo"] }   // all = แพ็กเดิม (ยกเลิกขายแล้ว ใช้ต่อได้) ไม่รวม time / finance;
  function curSys() {
    var p = location.pathname, ed = (/[?&]ed=([a-z]+)/.exec(location.search) || [])[1];
    if (/\/app\//.test(p)) return { bill: "bill", stock: "stock", book: "book", cafe: "cafe", hotel: "book", resort: "book", dorm: "dorm", meet: "book" }[ed] || "shop"; // รุ่นที่ edition.js รู้จักเท่านั้น อื่น ๆ = ตัวเต็ม (ระบบร้านค้า)
    var m = /\/(bill|stock|account|payroll|time|todo|finance|cafe|booking|orders)\//.exec(p);
    return m ? (m[1] === "booking" ? "book" : m[1]) : "";
  }
  function sysList(u) {
    var raw = u && u.sys; if (raw == null || raw === "") return null;           // null = ทุกระบบ
    var out = [];
    String(Array.isArray(raw) ? raw.join(",") : raw).toLowerCase().split(/[\s,|]+/).forEach(function (k) {
      if (k === "booking") k = "book";
      (GROUP[k] || (SYS[k] ? [k] : [])).forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    });
    return out;
  }
  function allowed(u, k) { var L = sysList(u); return !k || !L || L.indexOf(k) >= 0; }
  var PRICE = 199, DAYS = 30, TRIAL = 7, KEY = "edm_member";
  var BASE = (document.querySelector('script[src*="member.js"]') || {}).src || "";
  BASE = BASE.replace(/assets\/member\.js.*$/, "");

  var LS = {
    // เก็บการเข้าสู่ระบบไว้แค่ระหว่างเปิดเบราว์เซอร์ ปิดแล้วต้องใส่อีเมล+รหัสผ่านใหม่ทุกครั้ง (เครื่องไม่จำ)
    get: function () { try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { return null; } },
    set: function (v) { try { v ? sessionStorage.setItem(KEY, JSON.stringify(v)) : sessionStorage.removeItem(KEY); } catch (e) {} }
  };
  try { localStorage.removeItem(KEY); localStorage.removeItem("edm_known"); } catch (e) {} // ล้างค่าที่เวอร์ชันก่อนเคยจำไว้
  var me = LS.get();
  // เปิดอยู่ในกรอบของ "ระบบร้านค้า" (/app/) บนเว็บเดียวกัน → หน้าหลักจัดการเข้าสู่ระบบให้
  var EMBED = false; try { EMBED = window.top !== window && window.top.location.origin === location.origin && /\/app\//.test(window.top.location.pathname); } catch (e) {} // อยู่ในกรอบ /app/ เท่านั้น (หน้า /app/ ตรวจสิทธิ์แล้ว)
  function tellFrames() { for (var i = 0; i < window.frames.length; i++) { try { window.frames[i].postMessage({ edm: "member" }, location.origin); } catch (e) {} } }
  var _set = LS.set; LS.set = function (v) { _set(v); tellFrames(); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function thDate(ms) { var d = new Date(ms); return d.getDate() + " " + ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][d.getMonth()] + " " + (d.getFullYear() + 543); }
  function daysLeft() { return me && me.exp ? Math.ceil((me.exp - Date.now()) / 864e5) : 0; }
  function expired() { return !me || !me.exp || me.exp < Date.now(); }
  function call(o) {
    return fetch(API, { method: "POST", body: JSON.stringify(o) }).then(function (r) { return r.json(); });
  }

  /* ---------- styles ---------- */
  var css = ".edm-paid .edm-brand{display:none!important}" +
    ".edm-gate{position:fixed;inset:0;z-index:100;background:rgba(244,246,245,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px;overflow:auto}" +
    "@media (prefers-color-scheme:dark){.edm-gate{background:rgba(13,17,16,.75)}}" +
    ".edm-card{background:var(--card,#fff);color:var(--ink,#0F1513);border-radius:22px;box-shadow:0 0 0 1px var(--line,#E2E6E4),0 30px 60px -30px rgba(0,0,0,.35);width:100%;max-width:420px;padding:26px 22px;display:flex;flex-direction:column;gap:12px;font:15px/1.6 'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif}" +
    ".edm-card h2{margin:0;font-size:1.35rem;line-height:1.3}.edm-card p{margin:0}.edm-muted{color:var(--muted,#66706B);font-size:.86rem}" +
    ".edm-badge{align-self:flex-start;background:var(--accent,#127A4B);color:var(--accent-ink,#fff);font-size:.78rem;font-weight:600;padding:3px 12px;border-radius:999px}" +
    ".edm-perks{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:.9rem}.edm-perks li::before{content:'✓ ';color:var(--accent,#127A4B);font-weight:700}" +
    ".edm-tabs{display:flex;background:var(--soft,#F4F6F5);border-radius:999px;padding:3px;gap:3px}.edm-tabs button{flex:1;border:0;background:none;border-radius:999px;padding:8px;font:inherit;font-weight:600;font-size:.9rem;color:var(--muted,#66706B);cursor:pointer}" +
    ".edm-tabs button.on{background:var(--card,#fff);color:var(--ink,#0F1513);box-shadow:0 1px 3px rgba(0,0,0,.12)}" +
    ".edm-in{width:100%;box-sizing:border-box;border:1px solid var(--line,#E2E6E4);background:var(--card,#fff);color:inherit;border-radius:12px;padding:11px 13px;font:inherit;font-size:16px;outline:none}.edm-in:focus{border-color:var(--accent,#127A4B)}" +
    ".edm-btn{border:0;border-radius:999px;padding:12px 18px;font:inherit;font-weight:600;cursor:pointer;background:var(--accent,#127A4B);color:var(--accent-ink,#fff);text-decoration:none;text-align:center;display:inline-flex;justify-content:center;align-items:center;gap:6px}" +
    ".edm-btn[disabled]{opacity:.55;cursor:wait}.edm-btn.ghost{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px var(--line,#E2E6E4)}" +
    ".edm-link{border:0;background:none;color:var(--accent,#127A4B);font:inherit;font-size:.86rem;cursor:pointer;padding:0;text-decoration:underline}" +
    ".edm-msg{font-size:.88rem;min-height:1.3em}.edm-msg.err{color:var(--danger,#B3261E)}.edm-msg.ok{color:var(--accent,#127A4B)}" +
    ".edm-chip{position:relative}.edm-chip>button{border:0;border-radius:999px;padding:6px 12px;font:inherit;font-size:.84rem;font-weight:600;cursor:pointer;background:var(--soft,#F4F6F5);color:var(--ink,#0F1513);display:inline-flex;gap:6px;align-items:center}" +
    ".edm-chip>button.warn{background:#FFF4DC;color:#8A5A00}.edm-chip>button.bad{background:#FDE8E7;color:#B3261E}" +
    ".edm-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:60;background:var(--card,#fff);color:var(--ink,#0F1513);border-radius:16px;box-shadow:0 0 0 1px var(--line,#E2E6E4),0 20px 40px -20px rgba(0,0,0,.35);padding:14px;width:260px;display:flex;flex-direction:column;gap:8px;font-size:.88rem}" +
    ".edm-menu b{word-break:break-all}" +
    ".edm-bar{position:sticky;top:0;z-index:19;background:#FDE8E7;color:#7A1C16;padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font-size:.9rem;text-align:center}" +
    ".edm-bar.warn{background:#FFF4DC;color:#6B4600}.edm-bar .edm-btn{padding:6px 14px;font-size:.85rem}" +
    "body.edm-ro .editor>*:not(.edm-free){pointer-events:none;opacity:.45;filter:grayscale(.4)}" +
    "body.edm-ro #saveBtn,body.edm-ro #convertBtn,body.edm-ro #newBtn,body.edm-ro #addEmp,body.edm-ro #delEmp,body.edm-ro #demo,body.edm-ro #empCard{display:none!important}" +
    "body.edm-locked main,body.edm-locked .mtabs{filter:blur(2px);pointer-events:none}" +
    "@media print{.edm-gate,.edm-bar,.edm-chip{display:none!important}}";
  css += ".edm-embed header.top{position:static}.edm-embed header.top .brand,.edm-embed header.top .nav>a{display:none!important}.edm-embed header.top .nav{margin-left:auto}.edm-embed .tabs{top:8px!important}" +
    // ในระบบร้านค้า: ปุ่มตัวอย่าง / สำรองข้อมูล / โฆษณาเทมเพลต มีที่หน้าหลักแล้ว ไม่ต้องซ้ำในแต่ละหน้า
    ".edm-embed #demoBtn,.edm-embed [data-act=demo],.edm-embed #demo,.edm-embed #dataBtn,.edm-embed #exp,.edm-embed label:has(#imp),.edm-embed .cta,.edm-embed #sellerCard{display:none!important}" +
    ".edm-embed .edm-only{display:block!important}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- gate (สมัคร / เข้าสู่ระบบ) ---------- */
  var gate = null, mode = "signup", note = "";
  function openGate(m, msg) {
    mode = m || (seen() ? "login" : "signup");
    note = msg || "";
    document.body.classList.add("edm-locked");
    if (!gate) { gate = document.createElement("div"); gate.className = "edm-gate"; gate.setAttribute("role", "dialog"); gate.setAttribute("aria-modal", "true"); document.body.appendChild(gate); }
    renderGate();
  }
  function closeGate() { if (gate) { gate.remove(); gate = null; } document.body.classList.remove("edm-locked"); }
  // ล้างอีเมลที่พิมพ์/วางมา: ช่องว่าง ตัวอักษรล่องหน @ และ . แบบเต็มความกว้าง ตัวพิมพ์ใหญ่
  function cleanEmail(v) {
    return String(v || "").replace(/[\s\u200b-\u200d\u2060\ufeff]/g, "").replace(/[＠]/g, "@").replace(/[．。]/g, ".").replace(/^mailto:/i, "").replace(/[.,;]+$/, "").toLowerCase();
  }
  function emailProblem(E) {
    if (!E) return "กรอกอีเมล";
    if (/[\u0E00-\u0E7F]/.test(E)) return "อีเมลมีตัวอักษรภาษาไทย ลองเปลี่ยนแป้นพิมพ์เป็นภาษาอังกฤษแล้วพิมพ์ใหม่";
    if (E.indexOf("@") < 0) return "อีเมลต้องมีเครื่องหมาย @ เช่น name@gmail.com";
    if (E.split("@").length > 2) return "อีเมลมีเครื่องหมาย @ มากกว่า 1 ตัว";
    if (!/^[^@]+@[^@]+\.[a-z]{2,}$/.test(E)) return "อีเมลไม่ครบ ตรวจส่วนหลัง @ เช่น @gmail.com";
    if (/@gmail\.co$|@gmial\.|@gamil\.|@hotmail\.co$/.test(E)) return "ตรวจสะกดอีเมลอีกครั้ง (เช่น @gmail.com)";
    return "";
  }
  /* ---------- ลองใช้ก่อนไม่ต้องสมัคร (หน้าที่ตั้ง window.EDM_TRY) 7 วัน ข้อมูลอยู่ในเครื่องเท่านั้น ---------- */
  var TRY_DAYS = 7, tryBarEl = null;
  function tryKey() { return "edm_try_" + (curSys() || "x"); }
  function tryStart() { try { if (!localStorage.getItem(tryKey())) localStorage.setItem(tryKey(), String(Date.now())); } catch (e) {} }
  function tryLeft() { var t = 0; try { t = Number(localStorage.getItem(tryKey()) || 0); } catch (e) {} return t ? Math.ceil((t + TRY_DAYS * 864e5 - Date.now()) / 864e5) : TRY_DAYS; }
  function tryOk() { return !!window.EDM_TRY && tryLeft() > 0; }
  function tryUsed() { try { return !!localStorage.getItem(tryKey()); } catch (e) { return false; } }
  function tryBar() {
    if (tryBarEl) tryBarEl.remove();
    tryBarEl = document.createElement("div"); tryBarEl.className = "edm-bar warn";
    tryBarEl.innerHTML = "🧪 โหมดลองใช้ เหลือ " + tryLeft() + " วัน · ข้อมูลอยู่ในเครื่องนี้เท่านั้น <button class=\"edm-btn\" type=\"button\">สมัครเพื่อเก็บข้อมูลถาวร</button> <a class=\"edm-btn\" href=\"" + buyUrl() + "\" target=\"_blank\" rel=\"noopener\" style=\"background:#D6457A;color:#fff;text-decoration:none\">🛒 ซื้อเลย</a>";
    tryBarEl.querySelector("button").onclick = function () { openGate("signup"); };
    var hd = document.querySelector("header.top"); if (hd) hd.parentNode.insertBefore(tryBarEl, hd.nextSibling);
  }
  function buyUrl(k, plan) { return API + "?buy=1&sys=" + encodeURIComponent(k || curSys() || "shop") + (plan ? "&plan=" + plan : ""); }
  function perk() { var k = curSys(); return k === "shop" || !k ? "ครบในระบบเดียว: เปิดบิล · ภาษี · สต๊อก · บัญชี" : "บัญชีนี้ใช้กับระบบ " + SYS[k].n; }
  function renderGate() {
    var ck = curSys(), tool = ck === "todo" ? "To-Do งานที่ต้องทำ" : ck === "finance" ? "บริหารการเงิน SME & ฟรีแลนซ์" : ck === "time" ? "ลงเวลา / ตอกบัตร" : /payroll/.test(location.pathname) ? "คำนวณเงินเดือนพร้อมสลิป" : /\/app\//.test(location.pathname) ? "ระบบร้านค้า" : /booking/.test(location.pathname) ? "ระบบจองและให้เช่า" : /cafe/.test(location.pathname) ? "ระบบร้านคาเฟ่" : /stock/.test(location.pathname) ? "ระบบสต๊อกสินค้า" : /account/.test(location.pathname) ? "บัญชีร้านค้า" : "เปิดบิลออนไลน์";
    var h = '<div class="edm-card">';
    if (mode === "sent") {
      h += '<div style="font-size:2.4rem;line-height:1">✅</div><h2>' + (/ยืนยัน/.test(note) ? '📧 เช็กอีเมล แล้วกดยืนยัน' : 'สมัครเรียบร้อย · รอร้านเปิดใช้งาน') + '</h2><p>' + esc(note) + '</p>' +
        '<p class="edm-muted">ร้านจะตรวจและเปิดใช้งานให้โดยเร็ว เมื่อได้อีเมลแจ้งแล้ว กลับมาเข้าสู่ระบบที่หน้านี้ได้เลย</p>' +
        '<a class="edm-btn" href="https://line.me/R/ti/p/%40856tvnxs" target="_blank" rel="noopener" style="background:#06C755;color:#fff">💬 แจ้งร้านทาง LINE ให้เปิดเร็วขึ้น</a>' +
        '<button class="edm-btn ghost" data-go="login">เปิดใช้งานแล้ว · เข้าสู่ระบบ</button>';
    } else if (mode === "forgot") {
      h += '<h2>ลืมรหัสผ่าน</h2><p class="edm-muted">ใส่อีเมลที่สมัครไว้ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้</p>' +
        '<input class="edm-in" id="edmE" type="email" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="อีเมล">' +
        '<button class="edm-btn" id="edmGo">ส่งลิงก์ตั้งรหัสผ่านใหม่</button><div class="edm-msg" id="edmM"></div><button class="edm-link" data-go="login">← กลับไปเข้าสู่ระบบ</button>';
    } else {
      var su = mode === "signup";
      h += '<span class="edm-badge">ทดลองใช้ฟรี ' + TRIAL + ' วัน</span><h2>' + esc(tool) + '</h2>' +
        (note ? '<div class="edm-msg err">' + esc(note) + '</div>' : '') +
        (su ? '<ul class="edm-perks"><li>' + esc(perk()) + '</li><li>ไม่ต้องใส่บัตรเครดิต · ร้านเปิดสิทธิ์ให้แล้วแจ้งทางอีเมล</li><li>ไม่ผูกสัญญา ไม่ตัดบัตรอัตโนมัติ ยกเลิกเมื่อไหร่ก็ได้</li></ul>' : '') +
        '<div class="edm-tabs"><button data-go="signup" class="' + (su ? "on" : "") + '">สมัครใหม่</button><button data-go="login" class="' + (su ? "" : "on") + '">เข้าสู่ระบบ</button></div>' +
        (su ? '<input class="edm-in" id="edmN" autocomplete="off" placeholder="ชื่อร้าน / ชื่อของคุณ (ไม่บังคับ)">' : '') +
        '<input class="edm-in" id="edmE" type="email" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="email" placeholder="อีเมล">' +
        '<input class="edm-in" id="edmP" type="password" autocomplete="new-password" placeholder="' + (su ? "ตั้งรหัสผ่าน (อย่างน้อย 8 ตัว)" : "รหัสผ่าน") + '">' +
        '<button class="edm-btn" id="edmGo">' + (su ? "สมัครทดลองใช้ฟรี" : "เข้าสู่ระบบ") + '</button><div class="edm-msg" id="edmM"></div>' +
        (su ? '' : '<button class="edm-link" data-go="forgot" style="align-self:flex-start">ลืมรหัสผ่าน?</button>') +
        (tryOk() ? '<button class="edm-btn ghost" data-go="try" type="button">' + (tryUsed() ? "ใช้ต่อแบบไม่สมัคร (เหลือ " + tryLeft() + " วัน)" : "ลองใช้ก่อน ไม่ต้องสมัคร") + '</button>' : (window.EDM_TRY && tryUsed() ? '<p class="edm-muted">ครบ ' + TRY_DAYS + ' วันของโหมดลองใช้แล้ว สมัครเพื่อใช้งานต่อ ข้อมูลที่ทำไว้ยังอยู่ในเครื่องนี้</p>' : '')) +
        '<p class="edm-muted">ข้อมูลของคุณบันทึกในเครื่องนี้ และสำรองไว้ในระบบของร้าน (เฉพาะคุณที่เรียกกลับได้) เพื่อใช้ต่อจากเครื่องอื่น · <a href="' + BASE + 'privacy/" target="_blank" rel="noopener" style="color:inherit">นโยบายความเป็นส่วนตัว</a></p>' +
        '<a class="edm-btn ghost" href="' + buyUrl() + '" target="_blank" rel="noopener">🛒 ซื้อเลย · โอนแล้วแนบสลิป ใช้ได้ทันทีหลังร้านตรวจ</a>' +
        '<a class="edm-link" href="' + BASE + '" style="align-self:center;color:var(--muted,#66706B)">← กลับไปร้าน Excel Data Master</a>';
    }
    h += '</div>';
    gate.innerHTML = h;
    // ไม่ให้เบราว์เซอร์ขึ้นป๊อปอัป "บันทึกรหัสผ่าน?" / "รหัสผ่านรั่วไหล" (ร้านตั้งใจไม่ให้เครื่องจำรหัสอยู่แล้ว)
    // ช่องรหัสเป็นช่องข้อความธรรมดาที่แสดงเป็นจุด เบราว์เซอร์จึงไม่มองว่าเป็นฟอร์มรหัสผ่าน
    var pw = gate.querySelector("#edmP");
    if (pw && window.CSS && CSS.supports && CSS.supports("-webkit-text-security", "disc")) {
      pw.type = "text"; pw.style.webkitTextSecurity = "disc"; pw.setAttribute("autocomplete", "off");
      pw.setAttribute("autocapitalize", "off"); pw.setAttribute("autocorrect", "off"); pw.setAttribute("spellcheck", "false");
      pw.setAttribute("data-lpignore", "true"); pw.setAttribute("data-1p-ignore", "true"); pw.setAttribute("data-form-type", "other");
    }
    gate.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { if (b.dataset.go === "try") { tryStart(); closeGate(); tryBar(); return; } mode = b.dataset.go; note = ""; renderGate(); }; });
    var go = gate.querySelector("#edmGo"), M = gate.querySelector("#edmM");
    if (!go) return;
    var first = gate.querySelector(mode === "signup" ? "#edmN" : "#edmE");
    if (first && innerWidth > 700) setTimeout(function () { first.focus(); }, 30);
    gate.querySelectorAll(".edm-in").forEach(function (i) { i.onkeydown = function (e) { if (e.key === "Enter") go.click(); }; });
    go.onclick = function () {
      var Ei = gate.querySelector("#edmE"), E = cleanEmail(Ei.value), P = gate.querySelector("#edmP"), N = gate.querySelector("#edmN");
      Ei.value = E;
      var bad = emailProblem(E);
      if (bad) { M.className = "edm-msg err"; M.textContent = bad; Ei.focus(); return; }
      if (P && P.value.length < (mode === "signup" ? 8 : 1)) { M.className = "edm-msg err"; M.textContent = mode === "signup" ? "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" : "กรอกรหัสผ่าน"; return; }
      go.disabled = true; var t0 = go.textContent; go.textContent = "กำลังดำเนินการ..."; M.className = "edm-msg"; M.textContent = "";
      var req = mode === "signup" ? { a: "signup", email: E, pass: P.value, name: N ? N.value : "", sys: curSys() }
        : mode === "forgot" ? { a: "forgot", email: E }
        : { a: "login", email: E, pass: P.value, device: deviceName() };
      call(req).then(function (r) {
        go.disabled = false; go.textContent = t0;
        try { localStorage.setItem("edm_seen", "1"); } catch (e) {}
        if (!r.ok) { M.className = "edm-msg err"; M.textContent = r.msg || "ไม่สำเร็จ ลองอีกครั้ง"; if (r.code === "exists") { mode = "login"; note = ""; renderGate(); gate.querySelector("#edmM").className = "edm-msg err"; gate.querySelector("#edmM").textContent = r.msg; } return; }
        if (mode === "signup") { mode = "sent"; note = r.msg; renderGate(); return; }
        if (mode === "forgot") { M.className = "edm-msg ok"; M.textContent = r.msg; return; }
        me = { email: r.email, token: r.token, name: r.name, exp: r.exp, status: r.status, paid: r.paid, sys: r.sys, ts: Date.now() };
        LS.set(me); closeGate(); if (tryBarEl) { tryBarEl.remove(); tryBarEl = null; } apply(); cloudInit(); toast(expired() ? "บัญชีหมดอายุแล้ว ต่ออายุเพื่อใช้งานต่อ" : "ยินดีต้อนรับ ใช้งานได้ถึง " + thDate(me.exp));
      }).catch(function () { go.disabled = false; go.textContent = t0; M.className = "edm-msg err"; M.textContent = "เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง"; });
    };
  }
  function seen() { try { return !!localStorage.getItem("edm_seen"); } catch (e) { return false; } }
  function deviceName() {
    var u = navigator.userAgent;
    var os = /iPhone|iPad/.test(u) ? "iOS" : /Android/.test(u) ? "Android" : /Mac/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : "อื่น ๆ";
    var br = /Edg\//.test(u) ? "Edge" : /Chrome\//.test(u) ? "Chrome" : /Safari\//.test(u) ? "Safari" : /Firefox\//.test(u) ? "Firefox" : "";
    return os + (br ? " · " + br : "");
  }
  function toast(m) {
    var t = document.getElementById("toast");
    if (t) { t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3200); }
  }

  /* ---------- บัญชีนี้ไม่ได้ซื้อระบบนี้ ---------- */
  var deny = null;
  function showDeny() {
    var k = curSys(), L = sysList(me) || [];
    document.body.classList.add("edm-locked");
    if (!deny) { deny = document.createElement("div"); deny.className = "edm-gate"; deny.setAttribute("role", "dialog"); deny.setAttribute("aria-modal", "true"); document.body.appendChild(deny); }
    var mine = L.filter(function (x) { return x !== "bill" && x !== "stock" && x !== "account" || L.indexOf("shop") < 0; });
    var line = "https://line.me/R/oaMessage/%40856tvnxs/?" + encodeURIComponent("ขอเพิ่มระบบ " + SYS[k].n + " ให้บัญชี " + me.email);
    deny.innerHTML = '<div class="edm-card"><span class="edm-badge">' + esc(me.email) + '</span><h2>บัญชีนี้ยังไม่ได้เปิดใช้ ' + esc(SYS[k].n) + '</h2>' +
      '<p class="edm-muted">บัญชีของคุณใช้ได้กับระบบต่อไปนี้</p>' +
      mine.map(function (x) { return '<a class="edm-btn ghost" href="' + BASE + SYS[x].u + '">' + esc(SYS[x].n) + '</a>'; }).join("") +
      '<a class="edm-btn" href="' + line + '" target="_blank" rel="noopener" style="background:#06C755;color:#fff">💬 ขอเพิ่มระบบนี้ทาง LINE</a>' +
      '<button class="edm-link" id="edmDenyOut" type="button" style="align-self:center">ใช้อีเมลอื่น · ออกจากระบบ</button></div>';
    deny.querySelector("#edmDenyOut").onclick = function () { call({ a: "logout", email: me.email, token: me.token }).catch(function () {}); cloudStop(); me = null; LS.set(null); hideDeny(); apply(); openGate("signup"); };
  }
  function hideDeny() { if (deny) { deny.remove(); deny = null; document.body.classList.remove("edm-locked"); } }

  /* ---------- account chip + banners ---------- */
  var chip = null, bar = null;
  function renewUrl() { return API + "?renew=1&e=" + encodeURIComponent(me.email) + "&t=" + encodeURIComponent(me.token); }
  // สมาชิกที่จ่ายเงินแล้ว (ยังไม่หมดอายุ): ซ่อนข้อความ "สร้างด้วย exceldatamaster.com" บนเอกสาร (.edm-brand) · ทดลองใช้ / ยังไม่สมัคร = แสดง
  function paidFlag() { try { document.documentElement.classList.toggle("edm-paid", !!(me && me.paid && !expired())); } catch (e) {} }
  function apply() {
    paidFlag();
    if (!me) { hideDeny(); document.body.classList.remove("edm-ro"); if (chip) chip.remove(), chip = null; if (bar) bar.remove(), bar = null; return; }
    if (!allowed(me, curSys())) showDeny(); else hideDeny();
    var left = daysLeft(), ex = expired();
    document.body.classList.toggle("edm-ro", ex);
    var nav = document.querySelector("header .nav") || document.querySelector("header");
    if (!chip) { chip = document.createElement("div"); chip.className = "edm-chip"; nav.insertBefore(chip, nav.firstChild); }
    var lbl = ex ? "⛔ หมดอายุ" : (me.status === "ทดลองใช้" ? "🎁 ทดลองใช้ · เหลือ " + left + " วัน" : "👤 สมาชิก · เหลือ " + left + " วัน");
    chip.innerHTML = '<button type="button" class="' + (ex ? "bad" : left <= 3 ? "warn" : "") + '" aria-haspopup="true">' + esc(lbl) + '</button>';
    chip.firstChild.onclick = function (e) { e.stopPropagation(); toggleMenu(); };
    // banner
    var need = ex || left <= 3;
    if (need) {
      if (!bar) { bar = document.createElement("div"); var hd = document.querySelector("header.top"); hd.parentNode.insertBefore(bar, hd.nextSibling); }
      bar.className = "edm-bar" + (ex ? "" : " warn");
      bar.innerHTML = (ex ? "บัญชีหมดอายุแล้ว · ยังเปิดดูและพิมพ์เอกสารเดิมได้ แต่สร้างหรือแก้ไขไม่ได้จนกว่าจะต่ออายุ"
        : (me.status === "ทดลองใช้" ? "ช่วงทดลองใช้" : "บัญชีของคุณ") + "จะหมดอายุใน " + left + " วัน (" + thDate(me.exp) + ")") +
        ' <a class="edm-btn" href="' + esc(renewUrl()) + '" target="_blank" rel="noopener">ต่ออายุสมาชิก</a>';
    } else if (bar) { bar.remove(); bar = null; }
    markFree();
  }
  // ส่วนที่ยังใช้ได้ตอนหมดอายุ (เลือกงวด/พนักงานเพื่อดูสลิป, ปุ่มพิมพ์)
  function markFree() {
    ["#printBtn", "#mSel", "#emps"].forEach(function (s) {
      var el = document.querySelector(s); if (!el) return;
      var c = el.closest(".editor > *"); if (c) c.classList.add("edm-free");
    });
  }
  var menu = null;
  function toggleMenu() {
    if (menu) { menu.remove(); menu = null; return; }
    menu = document.createElement("div"); menu.className = "edm-menu";
    menu.innerHTML = '<div><span class="edm-muted">บัญชี</span><br><b>' + esc(me.email) + '</b></div>' +
      '<div class="edm-muted">' + esc(expired() ? "หมดอายุเมื่อ " : (me.status === "ทดลองใช้" ? "ทดลองใช้ถึง " : "ใช้งานได้ถึง ")) + thDate(me.exp) + '</div>' +
      '<a class="edm-btn" href="' + esc(renewUrl()) + '" target="_blank" rel="noopener">ต่ออายุสมาชิก</a>' +
      '<button class="edm-btn ghost" id="edmRe" type="button">↻ ตรวจสถานะล่าสุด</button>' +
      '<div class="edm-muted" id="edmCl">' + esc(cloudLine()) + ' <button class="edm-link" id="edmPush" type="button">สำรองตอนนี้</button></div>' +
      Object.keys(SYS).filter(function (k) { var L = sysList(me); return k !== curSys() && (L ? L.indexOf(k) >= 0 && !(L.indexOf("shop") >= 0 && /^(bill|stock|account)$/.test(k)) : k !== "time" && k !== "bill" && k !== "stock" && k !== "account"); }).map(function (k) { return '<a class="edm-btn ghost" href="' + BASE + SYS[k].u + '">' + esc(SYS[k].n) + '</a>'; }).join("") +
      '<button class="edm-link" id="edmOut" type="button" style="align-self:flex-start">ออกจากระบบ</button>' +
      '<p class="edm-muted" style="margin:0">โอนแล้วแนบสลิป ร้านตรวจแล้วจะต่ออายุให้และส่งอีเมลแจ้ง จากนั้นกด "ตรวจสถานะล่าสุด"</p>';
    chip.appendChild(menu);
    menu.onclick = function (e) { e.stopPropagation(); };
    menu.querySelector("#edmRe").onclick = function () { var b = this; b.disabled = true; b.textContent = "กำลังตรวจ..."; check(true).then(function () { if (menu) { menu.remove(); menu = null; } }); };
    menu.querySelector("#edmPush").onclick = function () { var b = this; b.textContent = "กำลังสำรอง..."; cloudPush(true).then(function (ok) { var c = menu && menu.querySelector("#edmCl"); if (c) c.firstChild.textContent = ok ? cloudLine() + " " : "สำรองไม่สำเร็จ ลองใหม่อีกครั้ง "; b.textContent = "สำรองตอนนี้"; }); };
    menu.querySelector("#edmOut").onclick = function () {
      if (!confirm("ออกจากระบบ? (ข้อมูลในเครื่องนี้ยังอยู่ครบ)")) return;
      var em = me.email, tk = me.token;
      cloudPush(true).catch(function () {}).then(function () { call({ a: "logout", email: em, token: tk }).catch(function () {}); }); // สำรองครั้งสุดท้ายก่อนออก
      cloudStop(); me = null; LS.set(null); menu.remove(); menu = null; apply(); openGate("login");
    };
  }
  document.addEventListener("click", function () { if (menu) { menu.remove(); menu = null; } });

  /* ---------- ตรวจสิทธิ์กับระบบหลังร้าน ---------- */
  function check(loud) {
    if (!me) return Promise.resolve();
    return call({ a: "check", email: me.email, token: me.token }).then(function (r) {
      if (!r.ok) {
        if (r.code === "session" || /อีเมล/.test(r.msg || "")) { me = null; LS.set(null); apply(); openGate("login", r.msg); }
        return;
      }
      var was = expired();
      me.exp = r.exp; me.status = r.status; me.paid = r.paid; me.name = r.name; if ("sys" in r) me.sys = r.sys; me.ts = Date.now(); LS.set(me); apply();
      if (loud) toast(expired() ? "ยังไม่ได้ต่ออายุ ถ้าโอนแล้ว รอร้านตรวจสลิปสักครู่นะคะ" : "ใช้งานได้ถึง " + thDate(me.exp));
      else if (was && !expired()) toast("ต่ออายุแล้ว ใช้งานได้ถึง " + thDate(me.exp));
    }).catch(function () { if (loud) toast("เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง"); });
  }

  /* ---------- สำรองข้อมูลขึ้นระบบร้าน (Google Drive ของร้าน) ----------
   * เข้าสู่ระบบแล้ว: ดึงข้อมูลล่าสุดจากระบบ (ถ้าใหม่กว่า) แล้วสำรองให้อัตโนมัติทุกครั้งที่ข้อมูลเปลี่ยน
   * ใช้เปลี่ยนเครื่องได้ และข้อมูลไม่หายแม้ล้างเบราว์เซอร์ */
  var CK = ["edm_acc", "edm_bill_docs", "edm_bill_seller", "edm_bill_counter", "edm_bill_customers", "edm_suppliers", "edm_services", "edm_stock_items", "edm_stock_tx", "edm_stock_cfg", "edm_pay_company", "edm_pay_emps", "edm_pay_records", "edm_pay_summary", "edm_book_res", "edm_book_list", "edm_book_cfg", "edm_cafe_menu", "edm_cafe_orders", "edm_cafe_shifts", "edm_cafe_cfg", "edm_cafe_items", "edm_cafe_stx", "edm_audit", "edm_audit_cfg", "edm_time_cfg", "edm_time_log", "edm_time_day", "edm_time_audit", "edm_todo_items", "edm_todo_log", "edm_todo_cfg", "edm_tdsheet_items", "edm_tdsheet_cfg", "edm_fin_items", "edm_fin_cfg", "edm_book_lease", "edm_users", "edm_ord_items", "edm_ord_cfg"];
  var KEEP = ["edm_cafe_items", "edm_cafe_stx", "edm_audit", "edm_audit_cfg", "edm_time_cfg", "edm_time_log", "edm_time_day", "edm_time_audit", "edm_todo_items", "edm_todo_log", "edm_todo_cfg", "edm_tdsheet_items", "edm_tdsheet_cfg", "edm_fin_items", "edm_fin_cfg", "edm_book_lease", "edm_users", "edm_ord_items", "edm_ord_cfg"]; // วัตถุดิบคาเฟ่ (เพิ่มภายหลัง): ข้อมูลบนระบบรุ่นเก่ายังไม่มี ไม่ลบของในเครื่อง
  var NEWK = ["edm_book_res", "edm_book_list", "edm_book_cfg", "edm_cafe_menu", "edm_cafe_orders", "edm_cafe_shifts", "edm_cafe_cfg"]; // ระบบจอง (เพิ่มภายหลัง): ถ้าข้อมูลบนระบบยังไม่มี ไม่ลบข้อมูลในเครื่อง
  var SK = "edm_sync", cloudTimer = null, dirtySince = 0, pushing = false, cloudOn = false;
  function cGet() { try { return JSON.parse(localStorage.getItem(SK) || "{}") || {}; } catch (e) { return {}; } }
  function cSet(o) { try { localStorage.setItem(SK, JSON.stringify(o)); } catch (e) {} }
  function snap() { var o = {}; CK.forEach(function (k) { var v = null; try { v = localStorage.getItem(k); } catch (e) {} if (v != null) o[k] = v; }); return JSON.stringify({ v: 1, keys: o }); }
  function hashOf(str) { var h = 5381; for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return String(h >>> 0) + ":" + str.length; }
  function emptyLocal() { return ["edm_bill_docs", "edm_stock_items", "edm_pay_emps", "edm_book_list", "edm_book_res", "edm_cafe_menu", "edm_time_log", "edm_todo_items", "edm_tdsheet_items", "edm_fin_items", "edm_ord_items"].every(function (k) { var v = localStorage.getItem(k); return !v || v === "[]"; }) && !/"pur":\[\{|"cash":\[\{/.test(localStorage.getItem("edm_acc") || ""); }
  function timeTh(ts) { var d = new Date(ts); return thDate(ts) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  function cloudPush(force) {
    if (!me || !me.token || pushing) return Promise.resolve(false);
    var data = snap(), h = hashOf(data), S = cGet(), wipe = localStorage.getItem("edm_sync_wipe") === "1";
    if (!force && h === S.h) return Promise.resolve(true);
    if (emptyLocal() && !wipe) { S.h = h; cSet(S); return Promise.resolve(true); } // ไม่สำรองทับด้วยข้อมูลว่าง (เช่น เครื่องใหม่)
    pushing = true; var em = me.email;
    return call({ a: "push", email: em, token: me.token, data: data }).then(function (r) {
      pushing = false; if (!r || !r.ok) { var S2 = cGet(); S2.err = (r && r.msg) || "เชื่อมต่อไม่ได้"; S2.errAt = Date.now(); cSet(S2); return false; }
      cSet({ email: em, h: h, at: r.ts, ok: Date.now() }); dirtySince = 0;
      if (wipe) try { localStorage.removeItem("edm_sync_wipe"); } catch (e) {}
      return true;
    }).catch(function () { pushing = false; return false; });
  }
  /* สรุปข้อมูลชุดหนึ่ง (ใช้ถามผู้ใช้ตอนข้อมูลในเครื่องกับในระบบไม่ตรงกัน) */
  function keysNow() { var o = {}; CK.forEach(function (k) { var v = null; try { v = localStorage.getItem(k); } catch (e) {} if (v != null) o[k] = v; }); return o; }
  function summ(K) {
    var P = function (k) { try { return JSON.parse(K[k] || "null"); } catch (e) { return null; } }, n = function (k) { var v = P(k); return Array.isArray(v) ? v.length : 0; };
    var sel = P("edm_bill_seller") || {}, bk = P("edm_book_cfg") || {}, fin = P("edm_fin_cfg") || {}, td = P("edm_todo_cfg") || {}, shop = sel.name || (bk.shop && bk.shop.name) || "";
    var parts = [["บิล", n("edm_bill_docs")], ["สินค้า", n("edm_stock_items")], ["ออเดอร์คาเฟ่", n("edm_cafe_orders")], ["ใบจอง", n("edm_book_list")], ["พนักงาน", n("edm_pay_emps")], ["รายการการเงิน", n("edm_fin_items")], ["งาน To-Do", n("edm_tdsheet_items") + n("edm_todo_items")]].filter(function (x) { return x[1]; });
    var demo = /ตัวอย่าง/.test(shop) || fin.demo === true || td.demo === true;
    return { shop: shop, demo: demo, total: parts.reduce(function (a, x) { return a + x[1]; }, 0), txt: (shop ? "ร้าน: " + shop + "\n" : "") + (parts.length ? parts.map(function (x) { return x[0] + " " + x[1]; }).join(" · ") : "ไม่มีข้อมูล") + (demo ? "\n(เป็นข้อมูลตัวอย่าง)" : "") };
  }
  /* เก็บข้อมูลในเครื่องไว้ก่อนถูกแทน (ย้อนกลับได้ที่หน้า สำรอง / กู้คืนข้อมูล) */
  function keepPrev(why) { try { var d = snap(); if (emptyLocal() || d.length > 2500000) return; localStorage.setItem("edm_sync_prev", JSON.stringify({ at: Date.now(), why: why, data: d })); } catch (e) {} }
  function cloudRestore(r) {
    var o; try { o = JSON.parse(r.data); } catch (e) { return; }
    if (!o || !o.keys) return;
    keepPrev("ก่อนดึงข้อมูลจากระบบ (บันทึกในระบบเมื่อ " + timeTh(r.ts) + ")");
    // ระบบที่เพิ่มภายหลัง (จอง / คาเฟ่): ถ้าข้อมูลบนระบบยังไม่มีระบบนั้นเลย ให้เก็บข้อมูลในเครื่องไว้ ไม่ลบทิ้ง
    var fam = function (k) { return k.split("_").slice(0, 2).join("_"); };
    var hasFam = function (k) { return NEWK.some(function (x) { return fam(x) === fam(k) && o.keys[x] != null; }); };
    CK.forEach(function (k) { try { if (o.keys[k] != null) localStorage.setItem(k, o.keys[k]); else if (KEEP.indexOf(k) < 0 && (NEWK.indexOf(k) < 0 || hasFam(k))) localStorage.removeItem(k); } catch (e) {} });
    try { localStorage.removeItem("edm_bill_draft"); } catch (e) {}
    cSet({ email: me.email, h: hashOf(snap()), at: r.ts, ok: Date.now() });
    toast("ดึงข้อมูลล่าสุดจากระบบแล้ว (บันทึกเมื่อ " + timeTh(r.ts) + ")");
    setTimeout(function () { location.reload(); }, 900);
  }
  function cloudTick() {
    if (!me || !me.token) return;
    var h = hashOf(snap()), S = cGet();
    if (h === S.h) { dirtySince = 0; return; }
    if (!dirtySince) dirtySince = Date.now();
    if (Date.now() - dirtySince > 20000) cloudPush();
  }
  function cloudInit() {
    if (cloudOn || !me || !me.token) return; cloudOn = true;
    var S = cGet(), mine = S.email === me.email, other = !mine && S.email ? S.email : ""; // other = เครื่องนี้เคยเป็นข้อมูลของอีเมลอื่น
    if (!mine) S = { email: me.email, h: "", at: 0 };
    var wipe = localStorage.getItem("edm_sync_wipe") === "1";
    var begin = function () { if (!cloudTimer) cloudTimer = setInterval(cloudTick, 15000); if (!cGet().h) cloudPush(); else cloudTick(); };
    if (wipe) { cloudPush(true).then(begin); return; }
    call({ a: "pull", email: me.email, token: me.token, since: mine ? S.at || 0 : 0 }).then(function (r) {
      if (other && r && r.ok && !emptyLocal()) {
        // เปลี่ยนบัญชีบนเครื่องเดียวกัน: ไม่เอาข้อมูลของบัญชีเดิมไปปนกับบัญชีนี้
        if (r.data && !r.none) { CK.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); return cloudRestore(r); }
        if (confirm("เครื่องนี้มีข้อมูลของบัญชี " + other + "\n\nตกลง = เริ่มบัญชีนี้แบบว่าง (ข้อมูลของ " + other + " ยังอยู่ในระบบของบัญชีนั้น)\nยกเลิก = ใช้ข้อมูลในเครื่องนี้ต่อกับบัญชีนี้")) {
          CK.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
          cSet({ email: me.email, h: "", at: 0 }); setTimeout(function () { location.reload(); }, 300); return;
        }
        cSet(S); cloudPush(true).then(begin); return;
      }
      if (!r || !r.ok || r.none || r.same || !r.data) { if (r && r.ok && (r.same || r.none) && !mine) cSet(S); begin(); return; }
      var local = snap();
      if (emptyLocal() || (mine && hashOf(local) === S.h)) return cloudRestore(r); // เครื่องนี้ไม่มีอะไรใหม่ → ใช้ข้อมูลจากระบบ
      var cl = {}; try { cl = summ(JSON.parse(r.data).keys || {}); } catch (e) { cl = { txt: "", total: 0 }; }
      var lo = summ(keysNow());
      // ข้อมูลตัวอย่าง ไม่ทับข้อมูลจริง: เครื่องนี้มีแต่ตัวอย่าง → ใช้ข้อมูลจากระบบ · ระบบมีแต่ตัวอย่าง → สำรองข้อมูลจริงในเครื่องขึ้นระบบ
      if (lo.demo && !cl.demo && cl.total) return cloudRestore(r);
      if (cl.demo && !lo.demo && lo.total) { cSet(S); cloudPush(true).then(begin); return; }
      var msg = "ข้อมูลในเครื่องนี้ ไม่ตรงกับข้อมูลที่สำรองไว้ในระบบ\n\n☁️ ในระบบ (บันทึกเมื่อ " + timeTh(r.ts) + ")\n" + cl.txt + "\n\n📱 ในเครื่องนี้\n" + lo.txt +
        "\n\nตกลง = ใช้ข้อมูลในระบบ ☁️\nยกเลิก = ใช้ข้อมูลในเครื่องนี้ 📱 แล้วสำรองทับในระบบ\n\n(ข้อมูลอีกชุดเก็บสำรองไว้ ย้อนกลับได้ที่ สำรอง / กู้คืนข้อมูล)";
      if (confirm(msg)) return cloudRestore(r);
      try { localStorage.setItem("edm_sync_prev", JSON.stringify({ at: Date.now(), why: "ข้อมูลในระบบที่ถูกแทน (บันทึกเมื่อ " + timeTh(r.ts) + ")", data: r.data })); } catch (e) {}
      cSet(S); cloudPush(true).then(begin);
    }).catch(begin);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") cloudPush(); });
  }
  function cloudStop() { cloudOn = false; if (cloudTimer) clearInterval(cloudTimer); cloudTimer = null; }
  function cloudLine() { var S = cGet(); return S.email && me && S.email === me.email && S.ok ? "☁️ สำรองขึ้นระบบแล้ว · " + timeTh(S.ok) : "☁️ ยังไม่ได้สำรองขึ้นระบบ"; }

  function startEmbed() {
    document.documentElement.classList.add("edm-embed");
    var hd = document.querySelector("header.top"), nav = hd && hd.querySelector(".nav");
    if (hd && (!nav || ![].some.call(nav.querySelectorAll("button"), function (b) { return getComputedStyle(b).display !== "none"; }))) hd.style.display = "none";
    var lite = function () { me = LS.get(); paidFlag(); document.body.classList.toggle("edm-ro", !!me && expired()); markFree(); };
    lite();
    window.addEventListener("message", function (e) { if (e.origin === location.origin && e.data && e.data.edm === "member") lite(); });
    // ลิงก์ไปหน้าอื่นของระบบ → ให้ระบบร้านค้าเปลี่ยนเมนู
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]"); if (!a || a.target === "_blank") return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin) return;
      var m = /^\/(bill|stock|account|payroll|booking|cafe)?\/?$/.exec(u.pathname); if (!m) return;
      e.preventDefault(); window.top.postMessage({ edm: "go", tool: m[1] || "home", hash: u.hash }, location.origin);
    }, true);
  }
  function start() {
    paidFlag();
    if (EMBED) return startEmbed();
    if (!me || !me.token) {
      // เปิดหน้าสมัคร/เข้าสู่ระบบ เมื่อระบบหลังร้านพร้อมแล้วเท่านั้น
      // (ถ้ายังไม่ได้ติดตั้งโค้ดสมาชิก จะไม่ขึ้นหน้าต่างเลย และใช้งานได้ตามปกติ — ไม่มีหน้าต่างขึ้นแล้วเด้งหาย)
      var want = (/[?&]start=(signup|login)/.exec(location.search) || [])[1]; // ลิงก์จากหน้าร้าน: ?start=signup (ทดลองใช้) / ?start=login
      if (!want && tryOk() && tryUsed()) { tryBar(); return; }   // กำลังลองใช้แบบไม่สมัคร
      call({ a: "ping" }).then(function (r) { if (r && r.ok && !me) openGate(want); }).catch(function () {});
      return;
    }
    apply(); check(false); cloudInit();
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && me && Date.now() - (me.ts || 0) > 30 * 60e3) check(false); });
  }
  function prevGet() { try { return JSON.parse(localStorage.getItem("edm_sync_prev") || "null"); } catch (e) { return null; } }
  function prevRestore() {
    var p = prevGet(); if (!p) return false; var o; try { o = JSON.parse(p.data); } catch (e) { return false; } if (!o || !o.keys) return false;
    var cur = snap(); CK.forEach(function (k) { try { if (o.keys[k] != null) localStorage.setItem(k, o.keys[k]); else localStorage.removeItem(k); } catch (e) {} });
    try { localStorage.setItem("edm_sync_prev", JSON.stringify({ at: Date.now(), why: "ข้อมูลก่อนกดย้อนกลับ", data: cur })); localStorage.removeItem("edm_bill_draft"); } catch (e) {}
    if (me && me.token) cloudPush(true); return true;
  }
  window.EDM_MEMBER = { get me() { return me; }, prev: prevGet, prevRestore: prevRestore, summ: function (data) { try { return summ(JSON.parse(data).keys || {}); } catch (e) { return null; } }, allowed: function (k) { return allowed(me, k); }, buyUrl: buyUrl, sysList: function () { return sysList(me); }, call: call, check: check, openGate: openGate, push: cloudPush, cloud: cGet, ping: function () { return call({ a: "ping" }); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* มือถือ: ช่องกรอกตัวอักษร 16px กัน iPhone ซูมจอตอนแตะช่อง · ตารางกว้างเลื่อนซ้าย-ขวาได้แทนการบีบ */
(function () {
  var st = document.createElement("style");
  st.textContent = "@media (max-width:760px){input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea{font-size:16px!important}" +
    "}@media (max-width:600px){.tbl-wrap{margin:0!important;overflow:visible!important}.tbl-wrap>table.t{min-width:0!important}.tbl-wrap>table.t,.tbl-wrap>table.t>tbody,.tbl-wrap>table.t>tfoot{display:block;width:100%}.tbl-wrap>table.t>thead{display:none}" +
    ".tbl-wrap>table.t tr{display:block;padding:10px 2px;border-bottom:1px solid var(--line,#e5e5e5)}.tbl-wrap>table.t td{display:flex;justify-content:space-between;align-items:baseline;gap:12px;border:0!important;padding:3px 0!important;text-align:right!important;white-space:normal!important}" +
    ".tbl-wrap>table.t td::before{content:attr(data-l);color:var(--muted,#777);font-size:.8rem;font-weight:400;text-align:left;flex:none;max-width:48%}.tbl-wrap>table.t td:not([data-l])::before{content:none}.tbl-wrap>table.t td:not([data-l]):not(:first-child){justify-content:flex-end}" +
    ".tbl-wrap>table.t td:first-child{display:block;text-align:left!important;font-size:.98rem;padding-bottom:4px!important}.tbl-wrap>table.t td:first-child::before{content:none}.tbl-wrap>table.t td:empty{display:none}" +
    ".tbl-wrap>table.t td .acts{justify-content:flex-end;margin-left:auto}.tbl-wrap>table.t td[colspan]{display:block;text-align:center!important}}";
  (document.head || document.documentElement).appendChild(st);
  // ใส่ชื่อคอลัมน์ให้ทุกช่อง เพื่อแสดงเป็นการ์ดบนมือถือ
  function label() { document.querySelectorAll(".tbl-wrap>table.t").forEach(function (t) { var hs = [].map.call(t.querySelectorAll("thead th"), function (h) { return h.textContent.trim(); }); if (!hs.length) return;
    t.querySelectorAll("tbody tr,tfoot tr").forEach(function (tr) { var i = 0; [].forEach.call(tr.children, function (td) { if (i > 0 && hs[i] && !td.hasAttribute("data-l") && td.textContent.trim()) td.setAttribute("data-l", hs[i]); i += td.colSpan || 1; }); }); }); }
  var tm = 0; function sched() { if (tm) return; tm = setTimeout(function () { tm = 0; label(); }, 30); }
  function go() { label(); new MutationObserver(sched).observe(document.body, { childList: true, subtree: true }); }
  if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
})();
