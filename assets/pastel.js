/* ชุดพาสเทล: วนสีหัวการ์ดตามลำดับบนหน้า (การ์ดคนละกลุ่มก็ได้สีไม่ซ้ำกัน) · ไม่แตะเอกสารที่พิมพ์ */
(function () {
  "use strict";
  var C = ["var(--accent-soft)", "var(--yel)", "var(--lav)", "var(--sky)", "var(--peach)", "var(--mintc)", "var(--rose)"], t = 0;
  function run() {
    var i = 0;
    Array.prototype.forEach.call(document.querySelectorAll(".card>h2:first-child"), function (h) {
      if (h.closest("#paper,.page,#printArea,.editor")) return;
      var v = C[i++ % C.length]; if (h.style.getPropertyValue("--cap") !== v) h.style.setProperty("--cap", v);
    });
  }
  function later() { clearTimeout(t); t = setTimeout(run, 50); }
  function start() { run(); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
