/* ล็อกหน้าจอด้วย PIN + ผู้ใช้หลายคน (ไม่บังคับ) · ใช้กับทุกหน้าในระบบร้านค้า
   - โหมดเดิม: PIN เดียว (edm_lock เก็บในเครื่องนี้) ตั้งที่หน้า "สำรอง / กู้คืนข้อมูล"
   - โหมดผู้ใช้หลายคน: edm_users {on, idle, owner:{name,s,h}, list:[{id,name,s,h,perm:{cf,bk,inc,exp,stk,fin,rpt,set,pay,del}}]}
     ซิงก์ขึ้นคลาวด์กับข้อมูลร้าน ทุกเครื่องใช้รายชื่อเดียวกัน · เปิดเว็บใหม่/ไม่ได้ใช้งาน = เลือกผู้ใช้ + ใส่ PIN
   - เก็บเฉพาะค่าแฮชของ PIN ไม่เก็บ PIN จริง
   - หน้าย่อยที่ฝังอยู่ใน /app/ ไม่แสดงหน้าล็อกซ้ำ ใช้ผู้ใช้ของหน้าหลัก
   - หน้าที่ต้องมีสิทธิ์: <script src="lock.js" data-perm="pay"> (หลายสิทธิ์คั่นด้วย , = มีอย่างใดอย่างหนึ่งก็เข้าได้) */
(function () {
  "use strict";
  var KEY = "edm_lock", UN = "edm_unlocked", FAIL = "edm_lock_fail", UK = "edm_users", SU = "edm_user";
  var PERMS = [["inc", "🧾 ขาย / ออกบิล / รับเงิน"], ["cf", "☕ ขายหน้าร้านคาเฟ่"], ["bk", "📅 จอง / เช่า"], ["stk", "📦 สต๊อก"], ["exp", "🛒 ซื้อ / จ่าย"], ["fin", "🏦 ธนาคาร / เงินสด"], ["pay", "💰 เงินเดือน"], ["rpt", "📊 ดูรายงาน / ยอดขาย / กำไร"], ["set", "⚙️ ตั้งค่า ราคา เมนู สินค้า"], ["del", "🗑️ ยกเลิก / ลบเอกสาร (ไม่ต้องขอ PIN เจ้าของ)"]];
  var me = document.currentScript, needPerm = me && me.dataset && me.dataset.perm ? me.dataset.perm.split(",") : null;
  var embedded = false; try { embedded = window.top !== window.self && window.top.location.origin === location.origin; } catch (e) {}
  function cfg() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function users() { try { var u = JSON.parse(localStorage.getItem(UK) || "null"); return u && u.on && u.owner && u.owner.h ? u : null; } catch (e) { return null; } }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function hash(salt, pin) {
    var data = new TextEncoder().encode(salt + "|" + pin), p = crypto.subtle.digest("SHA-256", data), n = 0;
    function more(h) { return ++n >= 2000 ? hex(h) : crypto.subtle.digest("SHA-256", new Uint8Array([].concat(Array.from(new Uint8Array(h)), Array.from(new TextEncoder().encode(salt))))).then(more); }
    return p.then(more);
  }
  function salt() { return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setUnlocked() { try { sessionStorage.setItem(UN, String(Date.now())); } catch (e) {} }
  function isUnlocked(c) { var t = 0; try { t = Number(sessionStorage.getItem(UN) || 0); } catch (e) {} return t && (!c.idle || Date.now() - t < c.idle * 60000); }
  function sid() { try { return sessionStorage.getItem(SU) || ""; } catch (e) { return ""; } }
  /* ผู้ใช้ปัจจุบัน: null = ไม่ได้เปิดโหมดผู้ใช้หลายคน (ทุกคนทำได้ทุกอย่างเหมือนเดิม) */
  function user() {
    var U = users(); if (!U) return null; var id = sid();
    if (id === "owner") return { id: "owner", name: U.owner.name || "เจ้าของร้าน", owner: true, perm: {} };
    var x = (U.list || []).filter(function (y) { return y.id === id; })[0];
    return x ? { id: x.id, name: x.name, owner: false, perm: x.perm || {} } : { id: "", name: "", owner: false, perm: {}, none: true };
  }
  function can(k) { var u = user(); return !u || u.owner || !!u.perm[k]; }

  // หน้าย่อย: ใช้ผู้ใช้/สิทธิ์ของหน้าหลัก และบอกหน้าหลักว่ายังมีการใช้งาน
  if (embedded) {
    var last = 0;
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach(function (ev) { addEventListener(ev, function () { var n = Date.now(); if (n - last > 15000) { last = n; try { window.parent.postMessage({ edm: "active" }, location.origin); } catch (e) {} } }, { passive: true, capture: true }); });
    var T = null; try { T = window.top.EDM_LOCK; } catch (e) {}
    window.EDM_LOCK = T || { set: function () {}, clear: function () {}, get: cfg, user: user, can: can, users: users, PERMS: PERMS };
    return;
  }

  var css = document.createElement("style");
  css.textContent = ".edm-lock-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(14,22,18,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:grid;place-items:center;padding:20px;font-family:inherit;overflow:auto}" +
    ".edm-lock-box{background:#fff;color:#16201B;border-radius:20px;padding:26px 22px;width:100%;max-width:360px;text-align:center;box-shadow:0 30px 70px -20px rgba(0,0,0,.6)}" +
    ".edm-lock-box h3{margin:6px 0 4px;font-size:1.2rem}.edm-lock-box p{margin:0 0 14px;color:#5B6660;font-size:.9rem}" +
    ".edm-lock-box input{width:100%;box-sizing:border-box;font-size:22px!important;letter-spacing:.5em;text-align:center;padding:12px;border-radius:12px;border:1.5px solid #CBD3CE;outline:none;-webkit-text-security:disc}" +
    ".edm-lock-box input:focus{border-color:#127A4B}.edm-lock-box button[type=submit]{margin-top:12px;width:100%;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:700;background:#127A4B;color:#fff;cursor:pointer;font-size:1rem}" +
    ".edm-lock-box .err{color:#B3261E;font-size:.85rem;min-height:1.2em;margin-top:8px}.edm-lock-box a{display:inline-block;margin-top:12px;font-size:.82rem;color:#5B6660}" +
    ".edm-lock-us{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin:4px 0 14px}" +
    ".edm-lock-us button{border:1.5px solid #E1E6E3;background:#F6F8F7;border-radius:14px;padding:10px 6px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;color:#16201B;font-size:.86rem;font-weight:600;line-height:1.25;word-break:break-word}" +
    ".edm-lock-us button i{font-style:normal;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#DCEFE4;color:#127A4B;font-weight:700;font-size:1rem}" +
    ".edm-lock-us button.on{border-color:#127A4B;background:#EAF6EF}.edm-lock-us button small{font-weight:400;color:#7A847F;font-size:.72rem}" +
    ".edm-noperm{position:fixed;inset:0;z-index:2147482000;background:#F6F8F7;display:grid;place-items:center;padding:20px;text-align:center;font-family:inherit}";
  document.head.appendChild(css);
  var ov = null, timer = null;
  function fails() { var f = {}; try { f = JSON.parse(localStorage.getItem(FAIL) || "{}"); } catch (x) {} return f; }
  function bad(err, inp) {
    var f = fails(); f.n = (f.n || 0) + 1; if (f.n >= 5) { f.until = Date.now() + 60000 * Math.min(30, Math.pow(2, f.n - 5)); }
    localStorage.setItem(FAIL, JSON.stringify(f)); inp.value = ""; err.textContent = f.until && Date.now() < f.until ? "ใส่ผิดหลายครั้ง ล็อกชั่วคราว" : "PIN ไม่ถูกต้อง (ผิด " + f.n + " ครั้ง)";
  }
  function blocked(err) { var f = fails(); if (f.until && Date.now() < f.until) { err.textContent = "ใส่ผิดหลายครั้ง รอ " + Math.ceil((f.until - Date.now()) / 1000) + " วินาที"; return true; } return false; }
  function done() { localStorage.removeItem(FAIL); setUnlocked(); if (ov) ov.remove(); ov = null; arm(); fire(); }
  function fire() {
    var u = user(); if (u && u.name) { try { localStorage.setItem("edm_who", u.name); } catch (e) {} }
    try { window.dispatchEvent(new CustomEvent("edm-user", { detail: u })); } catch (e) {}
    gate();
  }
  function mkOv(html) {
    ov = document.createElement("div"); ov.className = "edm-lock-ov"; try { ov.style.fontFamily = document.body ? getComputedStyle(document.body).fontFamily : ""; } catch (e) {} if (!ov.style.fontFamily) ov.style.fontFamily = "'IBM Plex Sans Thai',Sarabun,system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif";
    ov.innerHTML = html; document.documentElement.appendChild(ov);
  }
  function forgot(e) {
    e.preventDefault();
    alert("ลืม PIN:\n\n• พนักงานลืม PIN: ให้เจ้าของร้านเข้าระบบ แล้วตั้ง PIN ใหม่ให้ที่หน้า สำรอง / กู้คืนข้อมูล → ผู้ใช้และสิทธิ์\n• เจ้าของลืม PIN: ถ้าข้อมูลสำรองขึ้นระบบร้านไว้แล้ว ให้ทัก LINE ร้าน @856tvnxs ให้ช่วยรีเซ็ต\n\nPIN ถูกออกแบบมาให้ปลดล็อกเองไม่ได้ เพื่อกันคนอื่นเปิดดูข้อมูลร้าน");
  }
  function show() {
    if (ov) return;
    var U = users(), c = cfg();
    if (!U && !c) return;
    try { sessionStorage.removeItem(UN); sessionStorage.removeItem(SU); } catch (e) {}
    if (U) return showUsers(U);
    mkOv('<form class="edm-lock-box" autocomplete="off"><div style="font-size:38px">🔒</div><h3>ระบบร้านค้าถูกล็อก</h3><p>ใส่ PIN เพื่อปลดล็อก</p>' +
      '<input id="edmPin" inputmode="numeric" maxlength="12" autocomplete="off" aria-label="PIN"><div class="err" id="edmPinErr"></div><button type="submit">ปลดล็อก</button>' +
      '<a href="#" id="edmPinForgot">ลืม PIN?</a></form>');
    var inp = ov.querySelector("#edmPin"), err = ov.querySelector("#edmPinErr");
    setTimeout(function () { inp.focus(); }, 50);
    ov.querySelector("form").onsubmit = function (e) {
      e.preventDefault(); if (blocked(err)) return;
      hash(c.s, inp.value).then(function (h) { if (h === c.h) done(); else bad(err, inp); });
    };
    ov.querySelector("#edmPinForgot").onclick = forgot;
  }
  function showUsers(U) {
    var L = [{ id: "owner", name: U.owner.name || "เจ้าของร้าน", s: U.owner.s, h: U.owner.h, tag: "เจ้าของ" }].concat((U.list || []).filter(function (x) { return x.h; }));
    var lastId = ""; try { lastId = localStorage.getItem("edm_user_last") || ""; } catch (e) {}
    var pick = L.some(function (x) { return x.id === lastId; }) ? lastId : (L.length === 1 ? "owner" : "");
    mkOv('<form class="edm-lock-box" autocomplete="off"><div style="font-size:34px">👥</div><h3>ใครกำลังใช้งาน?</h3><p>เลือกชื่อของคุณ แล้วใส่ PIN</p>' +
      '<div class="edm-lock-us">' + L.map(function (x) { return '<button type="button" data-u="' + esc(x.id) + '"><i>' + esc((x.name || "?").replace(/^(คุณ|น้อง|พี่)/, "").slice(0, 1)) + '</i>' + esc(x.name) + (x.tag ? '<small>' + x.tag + '</small>' : "") + '</button>'; }).join("") + '</div>' +
      '<input id="edmPin" inputmode="numeric" maxlength="12" autocomplete="off" aria-label="PIN" placeholder="PIN"><div class="err" id="edmPinErr"></div><button type="submit">เข้าใช้งาน</button>' +
      '<a href="#" id="edmPinForgot">ลืม PIN?</a></form>');
    var inp = ov.querySelector("#edmPin"), err = ov.querySelector("#edmPinErr");
    function sel(id) { pick = id; Array.prototype.forEach.call(ov.querySelectorAll("[data-u]"), function (b) { b.classList.toggle("on", b.dataset.u === id); }); err.textContent = ""; setTimeout(function () { inp.focus(); }, 30); }
    Array.prototype.forEach.call(ov.querySelectorAll("[data-u]"), function (b) { b.onclick = function () { sel(b.dataset.u); }; });
    if (pick) sel(pick);
    ov.querySelector("form").onsubmit = function (e) {
      e.preventDefault(); if (blocked(err)) return;
      var x = L.filter(function (y) { return y.id === pick; })[0]; if (!x) { err.textContent = "เลือกชื่อผู้ใช้ก่อน"; return; }
      hash(x.s, inp.value).then(function (h) {
        if (h !== x.h) return bad(err, inp);
        try { sessionStorage.setItem(SU, x.id); localStorage.setItem("edm_user_last", x.id); } catch (z) {}
        done();
      });
    };
    ov.querySelector("#edmPinForgot").onclick = forgot;
  }
  /* หน้าที่ต้องมีสิทธิ์ (เช่น เงินเดือน) */
  var np = null;
  function gate() {
    if (!needPerm) return; var u = user(), ok = !u || u.owner || needPerm.some(function (k) { return u.perm[k]; });
    if (ok || u.none) { if (np) { np.remove(); np = null; } return; }
    if (np) return; np = document.createElement("div"); np.className = "edm-noperm";
    np.innerHTML = '<div><div style="font-size:42px">🚫</div><h2 style="margin:8px 0 4px">' + esc(u.name) + ' ไม่มีสิทธิ์เปิดหน้านี้</h2><p style="color:#5B6660">ให้เจ้าของร้านเปิดสิทธิ์ที่หน้า สำรอง / กู้คืนข้อมูล → ผู้ใช้และสิทธิ์</p>' +
      '<p><button type="button" style="border:0;border-radius:12px;padding:11px 18px;background:#127A4B;color:#fff;font:inherit;font-weight:700;cursor:pointer">เปลี่ยนผู้ใช้</button> &nbsp; <a href="/app/" style="color:#5B6660">กลับหน้าระบบร้าน</a></p></div>';
    np.querySelector("button").onclick = function () { show(); };
    (document.body || document.documentElement).appendChild(np);
  }
  function lockCfg() { return users() || cfg(); }
  function arm() {
    clearTimeout(timer); var c = lockCfg(); if (!c || !c.idle) return;
    timer = setTimeout(function () { if (!ov) show(); }, c.idle * 60000);
  }
  function active() { if (ov) return; var c = lockCfg(); if (!c) return; setUnlocked(); arm(); }
  /* ตรวจว่าควรล็อกไหม (เช่น ข้อมูลผู้ใช้เพิ่งซิงก์มาจากคลาวด์) */
  function ensure() {
    var U = users(), c = lockCfg(); if (!c) { if (ov) { ov.remove(); ov = null; } return; }
    if (U) { var u = user(); if (!isUnlocked(c) || !u || u.none) show(); else gate(); } else if (!isUnlocked(c)) show();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { addEventListener(ev, active, { passive: true, capture: true }); });
  addEventListener("message", function (e) { if (e.origin === location.origin && e.data && e.data.edm === "active") active(); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") ensure(); });
  addEventListener("storage", function (e) { if (e.key === KEY || e.key === UK) { if (!lockCfg() && ov) { ov.remove(); ov = null; } else ensure(); fire(); } });
  setInterval(function () { if (!ov && users()) { var u = user(); if (!u || u.none) ensure(); } }, 4000);

  window.EDM_LOCK = {
    get: lockCfg,
    users: users, user: user, can: can, PERMS: PERMS, hash: hash, salt: salt, ensure: ensure,
    set: function (pin, idle) { var s = salt();
      return hash(s, pin).then(function (h) { localStorage.setItem(KEY, JSON.stringify({ s: s, h: h, idle: Number(idle) || 0 })); localStorage.removeItem(FAIL); setUnlocked(); arm(); }); },
    /* PIN เจ้าของร้าน (โหมดผู้ใช้หลายคนใช้ PIN เจ้าของในรายชื่อผู้ใช้) */
    check: function (pin) { var U = users(), c = U ? U.owner : cfg(); return c ? hash(c.s, pin).then(function (h) { return h === c.h; }) : Promise.resolve(true); },
    clear: function () { localStorage.removeItem(KEY); localStorage.removeItem(FAIL); clearTimeout(timer); },
    lockNow: function () { show(); },
    switchUser: function () { show(); },
    signedIn: function () { try { sessionStorage.setItem(SU, "owner"); localStorage.setItem("edm_user_last", "owner"); } catch (e) {} setUnlocked(); arm(); fire(); }
  };
  var c0 = lockCfg();
  if (c0) ensure(); arm();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", gate); else gate();
})();
