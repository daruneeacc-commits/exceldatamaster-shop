/* Excel Data Master · ระบบสมาชิกสำหรับเครื่องมือออนไลน์ (เปิดบิล / คำนวณเงินเดือน)
 * - ทดลองใช้ฟรี 7 วัน แล้วต่ออายุ 199 บาท / 30 วัน
 * - บัญชีและวันหมดอายุเก็บที่ระบบหลังร้าน (Google Apps Script) · ข้อมูลบิล/เงินเดือนอยู่ในเบราว์เซอร์ของผู้ใช้เท่านั้น
 */
(function () {
  "use strict";
  var API = window.EDM_API || "https://script.google.com/macros/s/AKfycbySRUPpZ5a61ceeLN6d3X2WRVeDV3w3n7u6whm71rSS2byTJl3YZEXfqUmwMukHpNgQ/exec";
  var PRICE = 199, DAYS = 30, TRIAL = 7, KEY = "edm_member";
  var BASE = (document.querySelector('script[src*="member.js"]') || {}).src || "";
  BASE = BASE.replace(/assets\/member\.js.*$/, "");

  var LS = {
    get: function () { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } },
    set: function (v) { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch (e) {} }
  };
  var me = LS.get();
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function thDate(ms) { var d = new Date(ms); return d.getDate() + " " + ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][d.getMonth()] + " " + (d.getFullYear() + 543); }
  function daysLeft() { return me && me.exp ? Math.ceil((me.exp - Date.now()) / 864e5) : 0; }
  function expired() { return !me || !me.exp || me.exp < Date.now(); }
  function call(o) {
    return fetch(API, { method: "POST", body: JSON.stringify(o) }).then(function (r) { return r.json(); });
  }

  /* ---------- styles ---------- */
  var css = "" +
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
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- gate (สมัคร / เข้าสู่ระบบ) ---------- */
  var gate = null, mode = "signup", note = "";
  function openGate(m, msg) {
    mode = m || (LS.get() || localStorage.getItem("edm_known") ? "login" : "signup");
    note = msg || "";
    document.body.classList.add("edm-locked");
    if (!gate) { gate = document.createElement("div"); gate.className = "edm-gate"; gate.setAttribute("role", "dialog"); gate.setAttribute("aria-modal", "true"); document.body.appendChild(gate); }
    renderGate();
  }
  function closeGate() { if (gate) { gate.remove(); gate = null; } document.body.classList.remove("edm-locked"); }
  function renderGate() {
    var tool = /payroll/.test(location.pathname) ? "คำนวณเงินเดือนพร้อมสลิป" : "เปิดบิลออนไลน์";
    var h = '<div class="edm-card">';
    if (mode === "sent") {
      h += '<div style="font-size:2.4rem;line-height:1">📩</div><h2>เช็กอีเมลของคุณ</h2><p>' + esc(note) + '</p>' +
        '<p class="edm-muted">กดปุ่ม "ยืนยันอีเมล" ในอีเมล แล้วกลับมาเข้าสู่ระบบที่หน้านี้</p>' +
        '<button class="edm-btn" data-go="login">ยืนยันแล้ว · เข้าสู่ระบบ</button><button class="edm-link" data-go="signup">ไม่ได้รับอีเมล? ส่งอีกครั้ง</button>';
    } else if (mode === "forgot") {
      h += '<h2>ลืมรหัสผ่าน</h2><p class="edm-muted">ใส่อีเมลที่สมัครไว้ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้</p>' +
        '<input class="edm-in" id="edmE" type="email" autocomplete="email" placeholder="อีเมล" value="' + esc(localStorage.getItem("edm_known") || "") + '">' +
        '<button class="edm-btn" id="edmGo">ส่งลิงก์ตั้งรหัสผ่านใหม่</button><div class="edm-msg" id="edmM"></div><button class="edm-link" data-go="login">← กลับไปเข้าสู่ระบบ</button>';
    } else {
      var su = mode === "signup";
      h += '<span class="edm-badge">ทดลองใช้ฟรี ' + TRIAL + ' วัน</span><h2>' + esc(tool) + '</h2>' +
        (note ? '<div class="edm-msg err">' + esc(note) + '</div>' : '') +
        (su ? '<ul class="edm-perks"><li>ใช้ได้ทั้งเปิดบิลและคำนวณเงินเดือน</li><li>ไม่ต้องใส่บัตรเครดิต</li><li>ใช้ต่อเดือนละ ' + PRICE + ' บาท ยกเลิกเมื่อไหร่ก็ได้</li></ul>' : '') +
        '<div class="edm-tabs"><button data-go="signup" class="' + (su ? "on" : "") + '">สมัครใหม่</button><button data-go="login" class="' + (su ? "" : "on") + '">เข้าสู่ระบบ</button></div>' +
        (su ? '<input class="edm-in" id="edmN" autocomplete="organization" placeholder="ชื่อร้าน / ชื่อของคุณ (ไม่บังคับ)">' : '') +
        '<input class="edm-in" id="edmE" type="email" autocomplete="email" inputmode="email" placeholder="อีเมล" value="' + esc(localStorage.getItem("edm_known") || "") + '">' +
        '<input class="edm-in" id="edmP" type="password" autocomplete="' + (su ? "new-password" : "current-password") + '" placeholder="' + (su ? "ตั้งรหัสผ่าน (อย่างน้อย 6 ตัว)" : "รหัสผ่าน") + '">' +
        '<button class="edm-btn" id="edmGo">' + (su ? "สมัครและเริ่มทดลองใช้ฟรี" : "เข้าสู่ระบบ") + '</button><div class="edm-msg" id="edmM"></div>' +
        (su ? '' : '<button class="edm-link" data-go="forgot" style="align-self:flex-start">ลืมรหัสผ่าน?</button>') +
        '<p class="edm-muted">เราเก็บเฉพาะอีเมลเพื่อจัดการบัญชี ข้อมูลบิลและเงินเดือนของคุณอยู่ในเครื่องนี้เท่านั้น · <a href="' + BASE + 'privacy/" target="_blank" style="color:inherit">นโยบายความเป็นส่วนตัว</a></p>' +
        '<a class="edm-link" href="' + BASE + '" style="align-self:center;color:var(--muted,#66706B)">← กลับไปร้าน Excel Data Master</a>';
    }
    h += '</div>';
    gate.innerHTML = h;
    gate.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { mode = b.dataset.go; note = ""; renderGate(); }; });
    var go = gate.querySelector("#edmGo"), M = gate.querySelector("#edmM");
    if (!go) return;
    var first = gate.querySelector(mode === "signup" ? "#edmN" : (gate.querySelector("#edmE").value ? "#edmP" : "#edmE"));
    if (first && innerWidth > 700) setTimeout(function () { first.focus(); }, 30);
    gate.querySelectorAll(".edm-in").forEach(function (i) { i.onkeydown = function (e) { if (e.key === "Enter") go.click(); }; });
    go.onclick = function () {
      var E = gate.querySelector("#edmE").value.trim(), P = gate.querySelector("#edmP"), N = gate.querySelector("#edmN");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(E)) { M.className = "edm-msg err"; M.textContent = "กรอกอีเมลให้ถูกต้อง"; return; }
      if (P && P.value.length < (mode === "signup" ? 6 : 1)) { M.className = "edm-msg err"; M.textContent = mode === "signup" ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" : "กรอกรหัสผ่าน"; return; }
      go.disabled = true; var t0 = go.textContent; go.textContent = "กำลังดำเนินการ..."; M.className = "edm-msg"; M.textContent = "";
      var req = mode === "signup" ? { a: "signup", email: E, pass: P.value, name: N ? N.value : "" }
        : mode === "forgot" ? { a: "forgot", email: E }
        : { a: "login", email: E, pass: P.value, device: deviceName() };
      call(req).then(function (r) {
        go.disabled = false; go.textContent = t0;
        try { localStorage.setItem("edm_known", E.toLowerCase()); } catch (e) {}
        if (!r.ok) { M.className = "edm-msg err"; M.textContent = r.msg || "ไม่สำเร็จ ลองอีกครั้ง"; if (r.code === "exists") { mode = "login"; note = ""; renderGate(); gate.querySelector("#edmM").className = "edm-msg err"; gate.querySelector("#edmM").textContent = r.msg; } return; }
        if (mode === "signup") { mode = "sent"; note = r.msg; renderGate(); return; }
        if (mode === "forgot") { M.className = "edm-msg ok"; M.textContent = r.msg; return; }
        me = { email: r.email, token: r.token, name: r.name, exp: r.exp, status: r.status, paid: r.paid, ts: Date.now() };
        LS.set(me); closeGate(); apply(); toast(expired() ? "บัญชีหมดอายุแล้ว ต่ออายุเพื่อใช้งานต่อ" : "ยินดีต้อนรับ ใช้งานได้ถึง " + thDate(me.exp));
      }).catch(function () { go.disabled = false; go.textContent = t0; M.className = "edm-msg err"; M.textContent = "เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง"; });
    };
  }
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

  /* ---------- account chip + banners ---------- */
  var chip = null, bar = null;
  function renewUrl() { return API + "?renew=1&e=" + encodeURIComponent(me.email) + "&t=" + encodeURIComponent(me.token); }
  function apply() {
    if (!me) { document.body.classList.remove("edm-ro"); if (chip) chip.remove(), chip = null; if (bar) bar.remove(), bar = null; return; }
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
        ' <a class="edm-btn" href="' + esc(renewUrl()) + '" target="_blank" rel="noopener">ต่ออายุ ' + PRICE + ' บาท / ' + DAYS + ' วัน</a>';
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
      '<a class="edm-btn" href="' + esc(renewUrl()) + '" target="_blank" rel="noopener">ต่ออายุ ' + PRICE + ' บาท / ' + DAYS + ' วัน</a>' +
      '<button class="edm-btn ghost" id="edmRe" type="button">↻ ตรวจสถานะล่าสุด</button>' +
      '<a class="edm-btn ghost" href="' + BASE + (/payroll/.test(location.pathname) ? "bill/" : "payroll/") + '">' + (/payroll/.test(location.pathname) ? "🧾 ไปหน้าเปิดบิล" : "💰 ไปหน้าคำนวณเงินเดือน") + '</a>' +
      '<button class="edm-link" id="edmOut" type="button" style="align-self:flex-start">ออกจากระบบ</button>' +
      '<p class="edm-muted" style="margin:0">โอนแล้วแนบสลิป ร้านตรวจแล้วจะต่ออายุให้และส่งอีเมลแจ้ง จากนั้นกด "ตรวจสถานะล่าสุด"</p>';
    chip.appendChild(menu);
    menu.onclick = function (e) { e.stopPropagation(); };
    menu.querySelector("#edmRe").onclick = function () { var b = this; b.disabled = true; b.textContent = "กำลังตรวจ..."; check(true).then(function () { if (menu) { menu.remove(); menu = null; } }); };
    menu.querySelector("#edmOut").onclick = function () {
      if (!confirm("ออกจากระบบ? (ข้อมูลในเครื่องนี้ยังอยู่ครบ)")) return;
      call({ a: "logout", email: me.email, token: me.token }).catch(function () {});
      me = null; LS.set(null); menu.remove(); menu = null; apply(); openGate("login");
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
      me.exp = r.exp; me.status = r.status; me.paid = r.paid; me.name = r.name; me.ts = Date.now(); LS.set(me); apply();
      if (loud) toast(expired() ? "ยังไม่ได้ต่ออายุ ถ้าโอนแล้ว รอร้านตรวจสลิปสักครู่นะคะ" : "ใช้งานได้ถึง " + thDate(me.exp));
      else if (was && !expired()) toast("ต่ออายุแล้ว ใช้งานได้ถึง " + thDate(me.exp));
    }).catch(function () { if (loud) toast("เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง"); });
  }

  function start() {
    if (!me || !me.token) {
      openGate();
      // ระบบหลังร้านยังไม่พร้อม (เช่น ยังไม่ได้ติดตั้งโค้ดสมาชิก) → เปิดให้ใช้ได้ตามปกติ ไม่ล็อกหน้า
      call({ a: "ping" }).then(function (r) { if (!r || !r.ok) closeGate(); }).catch(function () { closeGate(); });
      return;
    }
    apply(); check(false);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && me && Date.now() - (me.ts || 0) > 30 * 60e3) check(false); });
  }
  window.EDM_MEMBER = { get me() { return me; }, check: check, openGate: openGate };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
