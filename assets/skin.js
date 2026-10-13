/* ธีมสีที่ผู้ใช้เลือก (เก็บในเครื่อง edm_skin) · โหลดใน <head> แบบไม่ defer เพื่อไม่ให้สีกระพริบ
   หน้าหลัก (ไม่ได้ฝังใน /app/) แสดงปุ่ม "🎨 ธีม" ที่หัวเว็บ · หน้าย่อยใน iframe เปลี่ยนตามอัตโนมัติ */
(function () {
  "use strict";
  var K = "edm_skin", SK = [
    ["", "พาสเทล", "สดใส สีประจำแต่ละระบบ (ค่าเริ่มต้น)", ["#F6B5C8", "#BFD9F2", "#FCEBB0", "#CDEBD9"]],
    ["minimal", "มินิมอล ขาว-ดำ", "เรียบ สะอาดตา เน้นตัวเลข", ["#FFFFFF", "#EFEFEF", "#9A9A9A", "#1C1C1C"]],
    ["cream", "มินิมอล ครีม", "โทนอบอุ่น เอิร์ธโทน", ["#FFFDF9", "#EFE7DA", "#C9B79F", "#7A6450"]],
    ["navy", "มินิมอล กรมท่า", "สุภาพ ดูเป็นทางการ", ["#FFFFFF", "#E6ECF4", "#8EA3BF", "#1F3A5F"]]
  ];
  function get() { try { return localStorage.getItem(K) || ""; } catch (e) { return ""; } }
  function apply(v, doc) {
    doc = doc || document; var h = doc.documentElement;
    if (v) h.setAttribute("data-look", v); else h.removeAttribute("data-look");
    var m = doc.querySelector('meta[name="theme-color"]');
    if (m) { if (!m.dataset.orig) m.dataset.orig = m.content; m.content = v === "minimal" ? "#1C1C1C" : v === "cream" ? "#7A6450" : v === "navy" ? "#1F3A5F" : m.dataset.orig; }
  }
  apply(get());
  addEventListener("storage", function (e) { if (e.key === K || e.key === null) apply(get()); });
  var embedded = false; try { embedded = window.top !== window.self; } catch (e) { embedded = true; }
  function set(v) {
    try { v ? localStorage.setItem(K, v) : localStorage.removeItem(K); } catch (e) {}
    apply(v);
    Array.prototype.forEach.call(document.querySelectorAll("iframe"), function (f) { try { apply(v, f.contentDocument); } catch (e) {} });
    var b = document.querySelector(".edm-skin-btn"); if (b) b.title = "ธีม: " + name(v);
  }
  function name(v) { for (var i = 0; i < SK.length; i++) if (SK[i][0] === v) return SK[i][1]; return SK[0][1]; }
  window.EDM_SKIN = { get: get, set: set, list: SK };
  if (embedded) return;
  var pop = null;
  function close() { if (pop) { pop.remove(); pop = null; document.removeEventListener("pointerdown", out, true); } }
  function out(e) { if (pop && !pop.contains(e.target) && !e.target.closest(".edm-skin-btn")) close(); }
  function open(btn) {
    if (pop) return close();
    var cur = get(); pop = document.createElement("div"); pop.className = "edm-skin-pop";
    pop.innerHTML = "<b>🎨 เลือกธีมสี</b>" + SK.map(function (s) {
      return '<button type="button" data-sk="' + s[0] + '" class="' + (s[0] === cur ? "on" : "") + '"><span class="sw">' + s[3].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</span><span>" + s[1] + "<small>" + s[2] + "</small></span></button>";
    }).join("") + '<small style="display:block;color:#999;font-size:.72rem;margin:6px 6px 0">ใช้กับทุกระบบในเครื่องนี้ · เอกสารที่พิมพ์ไม่เปลี่ยนสี</small>';
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect(), w = 270;
    pop.style.top = Math.min(innerHeight - pop.offsetHeight - 8, r.bottom + 8) + "px";
    pop.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + "px";
    Array.prototype.forEach.call(pop.querySelectorAll("[data-sk]"), function (b) { b.onclick = function () { set(b.dataset.sk); close(); }; });
    setTimeout(function () { document.addEventListener("pointerdown", out, true); }, 0);
  }
  function mount() {
    if (document.querySelector(".edm-skin-btn")) return;
    var hd = document.querySelector("header.top .in") || document.querySelector("header.top"); if (!hd) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "edm-skin-btn"; b.title = "ธีม: " + name(get());
    b.innerHTML = '<i></i><span class="edm-skin-t">ธีม</span>';
    b.onclick = function (e) { e.stopPropagation(); open(b); };
    var nav = hd.querySelector(".nav");
    if (nav) nav.insertBefore(b, nav.firstChild); else hd.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
