/* รีวิวสินค้า: <div data-rv="key" data-rvn="ชื่อสินค้า"></div> = กล่องรีวิว + ฟอร์ม · <span data-rvs="key"></span> = ดาวเฉลี่ย
   รีวิวใหม่ไปที่หลังบ้าน a=rv (รออนุมัติจากร้าน) · แสดงเฉพาะที่ร้านกด "แสดง" (a=rvs) */
(function () {
  if (window.EDM_RV) return;
  var API = window.EDM_API || "https://script.google.com/macros/s/AKfycbylmvweKvqw7t8snmpWOFm3Gr6TlN4eKZYX5_CCM_MUvwcgROoNkzwBdVb0DPb2Sqi4/exec";
  var css = document.createElement("style");
  css.textContent = ".rvw{margin-top:14px;border-top:1px solid #E6E8EB;padding-top:12px;display:flex;flex-direction:column;gap:10px;text-align:left;font-size:.92rem}" +
    ".rvw h4{margin:0;font-size:1rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.rvw .stx{color:#E3A008;letter-spacing:1px}.rvw .stx i{color:#D5D9DE;font-style:normal}.rvw .mut{color:#7A838C;font-size:.82rem;font-weight:400}" +
    ".rvw .it{background:#F7F8FA;border-radius:12px;padding:9px 12px}.rvw .it p{margin:3px 0 2px;white-space:pre-wrap;overflow-wrap:anywhere}.rvw .by{color:#7A838C;font-size:.8rem}.rvw .by b{color:#127A4B;font-weight:600}" +
    ".rvw button{font:inherit;cursor:pointer}.rvw .wb{align-self:flex-start;border:0;border-radius:999px;padding:7px 14px;background:#FFF4D6;color:#8A5A00;font-weight:700}.rvw .more{border:0;background:none;color:#1F6FD6;padding:0;align-self:flex-start}" +
    ".rvw form{display:flex;flex-direction:column;gap:8px;background:#FFFBEF;border-radius:12px;padding:12px}.rvw .pick{display:flex;gap:2px}.rvw .pick button{border:0;background:none;font-size:1.7rem;line-height:1;color:#D5D9DE;padding:0 2px}.rvw .pick button.on{color:#E3A008}" +
    ".rvw input,.rvw textarea{font:inherit;border:1px solid #E1E4E8;border-radius:10px;padding:8px 10px;width:100%;box-sizing:border-box;background:#fff}.rvw textarea{min-height:80px;resize:vertical}.rvw .send{border:0;border-radius:10px;padding:9px 14px;background:#127A4B;color:#fff;font-weight:700}" +
    ".rvw .msg{font-size:.86rem}.rvw .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}.rvs-b{display:inline-flex;align-items:center;gap:3px;font-size:.78rem;color:#7A5A00;font-weight:600;white-space:nowrap}.rvs-b span{color:#E3A008}.pm .rvw{margin:0 22px 20px}.modal-info .rvw{margin-top:10px}";
  document.head.appendChild(css);
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function stars(n) { n = Math.round(n); return '<span class="stx">' + "★".repeat(n) + "<i>" + "★".repeat(5 - n) + "</i></span>"; }
  function post(o) { return fetch(API, { method: "POST", body: JSON.stringify(o) }).then(function (r) { return r.json(); }); }
  var sumP = null, ok = null;
  function summary() {
    if (sumP) return sumP;
    try { var c = JSON.parse(sessionStorage.getItem("edm_rvs") || "null"); if (c && Date.now() - c.t < 6e5) { ok = true; return (sumP = Promise.resolve(c.s)); } } catch (e) {}
    sumP = post({ a: "rvs" }).then(function (r) { ok = !!(r && r.sum); if (!ok) return {}; var s = r.sum; try { sessionStorage.setItem("edm_rvs", JSON.stringify({ t: Date.now(), s: s })); } catch (e) {} return s; }).catch(function () { return {}; });
    return sumP;
  }
  function badge(el) {
    if (el._rvs) return; el._rvs = 1;
    summary().then(function (s) { var x = s[el.getAttribute("data-rvs")]; if (x && x.n) el.innerHTML = '<span class="rvs-b"><span>★</span>' + x.a.toFixed(1) + " (" + x.n + ")</span>"; });
  }
  function mount(el) {
    if (el._rv) return; el._rv = 1;
    var key = el.getAttribute("data-rv"), name = el.getAttribute("data-rvn") || "", list = [], all = false, open = false, pick = 0, sent = "";
    el.classList.add("rvw");
    function draw() {
      var n = list.length, avg = n ? list.reduce(function (a, x) { return a + x.s; }, 0) / n : 0, show = all ? list : list.slice(0, 3);
      el.innerHTML = "<h4>⭐ รีวิวจากลูกค้า " + (n ? stars(avg) + " <b>" + avg.toFixed(1) + '</b> <span class="mut">(' + n + " รีวิว)</span>" : '<span class="mut">ยังไม่มีรีวิว · เป็นคนแรกที่รีวิว</span>') + "</h4>" +
        show.map(function (x) { return '<div class="it">' + stars(x.s) + "<p>" + esc(x.t) + '</p><div class="by">— ' + esc(x.n) + (x.b ? " · <b>ซื้อจริง ✓</b>" : "") + "</div></div>"; }).join("") +
        (n > 3 && !all ? '<button type="button" class="more">ดูรีวิวทั้งหมด ' + n + " รายการ</button>" : "") +
        (sent ? '<div class="msg" style="color:#127A4B">' + esc(sent) + "</div>" : open ? '<form><b>รีวิวสินค้านี้</b><div class="pick">' + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-s="' + i + '" class="' + (i <= pick ? "on" : "") + '" aria-label="' + i + ' ดาว">★</button>'; }).join("") + "</div>" +
          '<input name="name" maxlength="40" placeholder="ชื่อที่จะแสดง เช่น คุณแอน (ร้านกาแฟ)"><textarea name="t" maxlength="600" placeholder="ใช้แล้วเป็นอย่างไรบ้าง ช่วยอะไรได้บ้าง"></textarea><input name="email" type="email" maxlength="120" placeholder="อีเมลที่ใช้ซื้อ (ไม่บังคับ · ไม่แสดงบนเว็บ ใช้ยืนยันว่าซื้อจริง)"><input class="hp" name="hp" tabindex="-1" autocomplete="off">' +
          '<div class="msg"></div><button type="submit" class="send">ส่งรีวิว</button><span class="mut">ร้านจะตรวจก่อนแสดงบนเว็บ</span></form>' : '<button type="button" class="wb">✍️ เขียนรีวิว</button>');
      var m = el.querySelector(".more"); if (m) m.onclick = function () { all = true; draw(); };
      var w = el.querySelector(".wb"); if (w) w.onclick = function () { open = true; draw(); var i = el.querySelector("input[name=name]"); if (i) i.focus(); };
      el.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { pick = +b.getAttribute("data-s"); el.querySelectorAll("[data-s]").forEach(function (x) { x.classList.toggle("on", +x.getAttribute("data-s") <= pick); }); }; });
      var f = el.querySelector("form");
      if (f) f.onsubmit = function (e) {
        e.preventDefault(); var msg = f.querySelector(".msg"), bt = f.querySelector(".send");
        if (!pick) { msg.textContent = "แตะดาวเพื่อให้คะแนนก่อน"; return; }
        bt.disabled = true; bt.textContent = "กำลังส่ง…";
        post({ a: "rv", k: key, pn: name, s: pick, name: f.elements["name"].value, t: f.elements["t"].value, email: f.elements["email"].value, hp: f.elements["hp"].value }).then(function (r) {
          if (r && r.ok) { sent = r.msg || "ขอบคุณสำหรับรีวิวค่ะ"; draw(); } else { msg.style.color = "#B3261E"; msg.textContent = (r && r.msg) || "ส่งไม่สำเร็จ ลองใหม่อีกครั้ง"; bt.disabled = false; bt.textContent = "ส่งรีวิว"; }
        }).catch(function () { msg.style.color = "#B3261E"; msg.textContent = "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง"; bt.disabled = false; bt.textContent = "ส่งรีวิว"; });
      };
    }
    el.style.display = "none";
    summary().then(function () { if (!ok) return; el.style.display = ""; draw(); });   // หลังบ้านยังไม่รองรับรีวิว = ซ่อนกล่อง
    post({ a: "rvs", k: key }).then(function (r) { list = (r && r.list) || []; draw(); }).catch(function () {});
  }
  function scan(root) { (root || document).querySelectorAll("[data-rv]").forEach(mount); (root || document).querySelectorAll("[data-rvs]").forEach(badge); }
  window.EDM_RV = { scan: scan };
  var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { scan(); }, 120); }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { scan(); }); else scan();
})();
