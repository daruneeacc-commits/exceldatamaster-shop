/* ช่องค้นหาแบบพิมพ์แล้วขึ้นรายการให้เลือก (ใช้ร่วมทุกหน้า)
   edmSuggest(input, { source: q => [{t:"ชื่อ", s:"รายละเอียดย่อย", v:ข้อมูล}], pick: v => {} }) */
(function () {
  if (window.edmSuggest) return;
  var css = document.createElement("style");
  css.textContent = ".edm-sg{position:fixed;z-index:9999;background:var(--card,#fff);color:var(--ink,#1a1a1a);border-radius:12px;box-shadow:0 14px 40px -10px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.08);max-height:280px;overflow:auto;padding:4px;font-size:.9rem}" +
    ".edm-sg div{padding:8px 10px;border-radius:8px;cursor:pointer;line-height:1.3}.edm-sg div small{display:block;opacity:.65;font-size:.78rem}" +
    ".edm-sg div.on,.edm-sg div:hover{background:color-mix(in srgb,var(--accent,#1F6E43) 14%,transparent)}.edm-sg mark{background:none;color:inherit;font-weight:700;text-decoration:underline}" +
    ".edm-sg .hd{cursor:default;font-size:.72rem;opacity:.6;padding:4px 10px}.edm-sg .hd:hover{background:none}";
  document.head.appendChild(css);
  var box = null, cur = null, sel = -1, list = [];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function hl(s, q) { s = esc(s); if (!q) return s; var i = s.toLowerCase().indexOf(esc(q).toLowerCase()); return i < 0 ? s : s.slice(0, i) + "<mark>" + s.slice(i, i + q.length) + "</mark>" + s.slice(i + q.length); }
  function close() { if (box) box.remove(); box = null; cur = null; sel = -1; list = []; }
  function place() { if (!box || !cur) return; var r = cur.getBoundingClientRect(); box.style.left = r.left + "px"; box.style.width = Math.max(r.width, 240) + "px"; var below = innerHeight - r.bottom; if (below < 200 && r.top > below) { box.style.top = ""; box.style.bottom = (innerHeight - r.top + 4) + "px"; } else { box.style.bottom = ""; box.style.top = (r.bottom + 4) + "px"; } }
  function draw(inp, o) {
    var q = inp.value.trim(); list = (o.source(q) || []).slice(0, o.max || 8);
    if (!list.length || (q && list.length === 1 && list[0].t === q && !o.keepExact)) { close(); return; }
    if (!box) { box = document.createElement("div"); box.className = "edm-sg"; document.body.appendChild(box); box.addEventListener("mousedown", function (e) { e.preventDefault(); }); }
    cur = inp; sel = -1;
    box.innerHTML = (q ? "" : '<div class="hd">' + esc(o.title || "เลือกจากรายการ") + "</div>") + list.map(function (x, i) { return '<div data-i="' + i + '">' + hl(x.t, q) + (x.s ? "<small>" + hl(x.s, q) + "</small>" : "") + "</div>"; }).join("");
    box.querySelectorAll("[data-i]").forEach(function (d) { d.onclick = function () { choose(+d.dataset.i, o); }; });
    place();
  }
  function choose(i, o) { var x = list[i]; var inp = cur; close(); if (x) { o.pick(x.v, inp); } }
  function mark() { if (!box) return; box.querySelectorAll("[data-i]").forEach(function (d) { d.classList.toggle("on", +d.dataset.i === sel); if (+d.dataset.i === sel) d.scrollIntoView({ block: "nearest" }); }); }
  window.edmSuggest = function (inp, o) {
    if (!inp || inp._sg) return; inp._sg = 1; inp.setAttribute("autocomplete", "off");
    inp.addEventListener("input", function () { draw(inp, o); });
    inp.addEventListener("focus", function () { if (o.onFocus !== false) draw(inp, o); });
    inp.addEventListener("blur", function () { setTimeout(function () { if (cur === inp) close(); }, 120); });
    inp.addEventListener("keydown", function (e) {
      if (!box || cur !== inp) return;
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(list.length - 1, sel + 1); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === "Enter" && sel >= 0) { e.preventDefault(); choose(sel, o); }
      else if (e.key === "Escape") close();
    });
  };
  // ค้นหาแบบไม่สนตัวพิมพ์ จากหลายช่อง
  window.edmMatch = function (q, arr, fields) { q = String(q || "").trim().toLowerCase(); if (!q) return arr; return arr.filter(function (x) { return fields.some(function (f) { return String(x[f] || "").toLowerCase().indexOf(q) >= 0; }); }).sort(function (a, b) { var A = String(a[fields[0]] || "").toLowerCase().indexOf(q) === 0 ? 0 : 1, B = String(b[fields[0]] || "").toLowerCase().indexOf(q) === 0 ? 0 : 1; return A - B; }); };
  addEventListener("scroll", place, true); addEventListener("resize", place);
})();
