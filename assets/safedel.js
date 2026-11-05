/* EDM_SAFEDEL — กันลบข้อมูลที่มีประวัติโดยไม่ตั้งใจ (5 พ.ย. 2569 หลังเคสลบพนักงานแล้วเงินเดือนหายทุกเดือน)
   EDM_SAFEDEL({name, lose:"ข้อความว่าจะหายอะไร", keep:{label,note,fn} (ไม่บังคับ), del:fn})
   - มีทางเลือกเก็บประวัติ = แนะนำก่อน
   - ลบถาวร ต้องพิมพ์คำว่า ลบ ก่อนถึงกดได้ */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var css = ".sdl{border:0;border-radius:18px;padding:0;max-width:min(440px,calc(100vw - 24px));width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25);font:inherit;color:#222}" +
    ".sdl::backdrop{background:rgba(0,0,0,.35)}.sdl .in{padding:18px;display:flex;flex-direction:column;gap:12px}" +
    ".sdl h3{margin:0;font-size:1.05rem}.sdl .bx{border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".sdl .k{background:#EEF8F1;box-shadow:0 0 0 1px #CDE9D6}.sdl .d{background:#FDF1F0;box-shadow:0 0 0 1px #F3D2CF}" +
    ".sdl p{margin:0;font-size:.88rem;color:#555;line-height:1.5}.sdl b.t{font-size:.95rem}" +
    ".sdl button{font:inherit;border:0;border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:600}" +
    ".sdl .bk{background:#2E8B57;color:#fff}.sdl .bd{background:#C0392B;color:#fff}.sdl .bd:disabled{opacity:.35;cursor:not-allowed}" +
    ".sdl .bc{background:#f1f1f1;color:#333;align-self:flex-end}.sdl input{font:inherit;padding:9px 10px;border-radius:10px;border:1px solid #ddd}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  window.EDM_SAFEDEL = function (o) {
    var d = document.createElement("dialog"); d.className = "sdl";
    d.innerHTML = '<div class="in"><h3>ลบ "' + esc(o.name) + '" ?</h3>' +
      (o.keep ? '<div class="bx k"><b class="t">✅ ' + esc(o.keep.label) + ' (แนะนำ)</b><p>' + esc(o.keep.note || "ประวัติเดิมยังอยู่ครบ") + '</p><button type="button" class="bk" data-a="k">' + esc(o.keep.label) + '</button></div>' : "") +
      '<div class="bx d"><b class="t">🗑️ ลบถาวร</b><p>' + esc(o.lose || "ข้อมูลนี้") + ' จะหายทั้งหมด <b>กู้คืนไม่ได้</b></p>' +
      '<input data-a="t" placeholder="พิมพ์คำว่า ลบ เพื่อยืนยัน" autocomplete="off"><button type="button" class="bd" data-a="d" disabled>ลบถาวร</button></div>' +
      '<button type="button" class="bc" data-a="c">ยกเลิก</button></div>';
    document.body.appendChild(d);
    var q = function (a) { return d.querySelector('[data-a="' + a + '"]'); }, done = function () { try { d.close(); } catch (e) {} d.remove(); };
    q("t").oninput = function () { q("d").disabled = q("t").value.trim() !== "ลบ"; };
    q("d").onclick = function () { done(); o.del(); };
    q("c").onclick = done; d.addEventListener("cancel", function () { setTimeout(function () { d.remove(); }, 0); });
    if (o.keep) q("k").onclick = function () { done(); o.keep.fn(); };
    try { d.showModal(); } catch (e) { d.setAttribute("open", ""); }
  };
})();
