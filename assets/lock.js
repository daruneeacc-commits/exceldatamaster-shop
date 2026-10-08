/* ล็อกหน้าจอด้วย PIN (ไม่บังคับ) · ใช้กับทุกหน้าในระบบร้านค้า
   - ตั้ง PIN ที่หน้า "สำรอง / กู้คืนข้อมูล" · เก็บเฉพาะค่าแฮชของ PIN ในเครื่อง ไม่เก็บ PIN จริง
   - ล็อกเมื่อเปิดเบราว์เซอร์ใหม่ และเมื่อไม่ได้ใช้งานตามเวลาที่ตั้ง
   - หน้าย่อยที่ฝังอยู่ใน /app/ ไม่แสดงหน้าล็อกซ้ำ แต่ส่งสัญญาณ "มีการใช้งาน" ให้หน้าหลัก */
(function () {
  "use strict";
  var KEY = "edm_lock", UN = "edm_unlocked", FAIL = "edm_lock_fail";
  var embedded = false; try { embedded = window.top !== window.self && window.top.location.origin === location.origin; } catch (e) {}
  function cfg() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function hash(salt, pin) {
    var data = new TextEncoder().encode(salt + "|" + pin), p = crypto.subtle.digest("SHA-256", data), n = 0;
    function more(h) { return ++n >= 2000 ? hex(h) : crypto.subtle.digest("SHA-256", new Uint8Array([].concat(Array.from(new Uint8Array(h)), Array.from(new TextEncoder().encode(salt))))).then(more); }
    return p.then(more);
  }
  function setUnlocked() { try { sessionStorage.setItem(UN, String(Date.now())); } catch (e) {} }
  function isUnlocked(c) { var t = 0; try { t = Number(sessionStorage.getItem(UN) || 0); } catch (e) {} return t && (!c.idle || Date.now() - t < c.idle * 60000); }

  // หน้าย่อย: แค่บอกหน้าหลักว่ายังมีการใช้งาน
  if (embedded) {
    var last = 0;
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach(function (ev) { addEventListener(ev, function () { var n = Date.now(); if (n - last > 15000) { last = n; try { window.parent.postMessage({ edm: "active" }, location.origin); } catch (e) {} } }, { passive: true, capture: true }); });
    window.EDM_LOCK = { set: function () {}, clear: function () {}, get: cfg };
    return;
  }

  var css = document.createElement("style");
  css.textContent = ".edm-lock-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(14,22,18,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:grid;place-items:center;padding:20px;font-family:inherit}" +
    ".edm-lock-box{background:#fff;color:#16201B;border-radius:20px;padding:26px 22px;width:100%;max-width:340px;text-align:center;box-shadow:0 30px 70px -20px rgba(0,0,0,.6)}" +
    ".edm-lock-box h3{margin:6px 0 4px;font-size:1.2rem}.edm-lock-box p{margin:0 0 14px;color:#5B6660;font-size:.9rem}" +
    ".edm-lock-box input{width:100%;box-sizing:border-box;font-size:22px!important;letter-spacing:.5em;text-align:center;padding:12px;border-radius:12px;border:1.5px solid #CBD3CE;outline:none;-webkit-text-security:disc}" +
    ".edm-lock-box input:focus{border-color:#127A4B}.edm-lock-box button{margin-top:12px;width:100%;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:700;background:#127A4B;color:#fff;cursor:pointer;font-size:1rem}" +
    ".edm-lock-box .err{color:#B3261E;font-size:.85rem;min-height:1.2em;margin-top:8px}.edm-lock-box a{display:inline-block;margin-top:12px;font-size:.82rem;color:#5B6660}";
  document.head.appendChild(css);
  var ov = null, timer = null;
  function show() {
    var c = cfg(); if (!c || ov) return;
    try { sessionStorage.removeItem(UN); } catch (e) {}
    ov = document.createElement("div"); ov.className = "edm-lock-ov"; try { ov.style.fontFamily = document.body ? getComputedStyle(document.body).fontFamily : ""; } catch (e) {} if (!ov.style.fontFamily) ov.style.fontFamily = "'IBM Plex Sans Thai',Sarabun,system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif";
    ov.innerHTML = '<form class="edm-lock-box" autocomplete="off"><div style="font-size:38px">🔒</div><h3>ระบบร้านค้าถูกล็อก</h3><p>ใส่ PIN เพื่อปลดล็อก</p>' +
      '<input id="edmPin" inputmode="numeric" maxlength="12" autocomplete="off" aria-label="PIN"><div class="err" id="edmPinErr"></div><button type="submit">ปลดล็อก</button>' +
      '<a href="#" id="edmPinForgot">ลืม PIN?</a></form>';
    document.documentElement.appendChild(ov);
    var inp = ov.querySelector("#edmPin"), err = ov.querySelector("#edmPinErr");
    setTimeout(function () { inp.focus(); }, 50);
    ov.querySelector("form").onsubmit = function (e) {
      e.preventDefault();
      var f = {}; try { f = JSON.parse(localStorage.getItem(FAIL) || "{}"); } catch (x) {}
      if (f.until && Date.now() < f.until) { err.textContent = "ใส่ผิดหลายครั้ง รอ " + Math.ceil((f.until - Date.now()) / 1000) + " วินาที"; return; }
      hash(c.s, inp.value).then(function (h) {
        if (h === c.h) { localStorage.removeItem(FAIL); setUnlocked(); ov.remove(); ov = null; arm(); return; }
        f.n = (f.n || 0) + 1; if (f.n >= 5) { f.until = Date.now() + 60000 * Math.min(30, Math.pow(2, f.n - 5)); }
        localStorage.setItem(FAIL, JSON.stringify(f)); inp.value = ""; err.textContent = f.until && Date.now() < f.until ? "ใส่ผิดหลายครั้ง ล็อกชั่วคราว" : "PIN ไม่ถูกต้อง (ผิด " + f.n + " ครั้ง)";
      });
    };
    ov.querySelector("#edmPinForgot").onclick = function (e) {
      e.preventDefault();
      alert("ลืม PIN:\n\n• ถ้าข้อมูลสำรองขึ้นระบบร้านไว้แล้ว ให้ล้างข้อมูลเว็บของเบราว์เซอร์นี้ แล้วเข้าสู่ระบบใหม่ ข้อมูลจะกลับมาจากระบบร้าน\n• หรือทัก LINE ร้าน @856tvnxs ให้ช่วยแนะนำ\n\nPIN ถูกออกแบบมาให้ปลดล็อกเองไม่ได้ เพื่อกันคนอื่นเปิดดูข้อมูลร้าน");
    };
  }
  function arm() {
    clearTimeout(timer); var c = cfg(); if (!c || !c.idle) return;
    timer = setTimeout(function () { if (!ov) show(); }, c.idle * 60000);
  }
  function active() { if (ov) return; var c = cfg(); if (!c) return; setUnlocked(); arm(); }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { addEventListener(ev, active, { passive: true, capture: true }); });
  addEventListener("message", function (e) { if (e.origin === location.origin && e.data && e.data.edm === "active") active(); });
  document.addEventListener("visibilitychange", function () { var c = cfg(); if (document.visibilityState === "visible" && c && !isUnlocked(c)) show(); });
  addEventListener("storage", function (e) { if (e.key === KEY && !cfg() && ov) { ov.remove(); ov = null; } });

  window.EDM_LOCK = {
    get: cfg,
    set: function (pin, idle) { var s = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      return hash(s, pin).then(function (h) { localStorage.setItem(KEY, JSON.stringify({ s: s, h: h, idle: Number(idle) || 0 })); localStorage.removeItem(FAIL); setUnlocked(); arm(); }); },
    check: function (pin) { var c = cfg(); return c ? hash(c.s, pin).then(function (h) { return h === c.h; }) : Promise.resolve(true); },
    clear: function () { localStorage.removeItem(KEY); localStorage.removeItem(FAIL); clearTimeout(timer); },
    lockNow: function () { show(); }
  };
  var c0 = cfg();
  if (c0 && !isUnlocked(c0)) show(); else arm();
})();
