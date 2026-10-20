/* นับคนเข้าชม (ไม่เก็บข้อมูลส่วนตัว: ใช้รหัสสุ่มของเครื่อง) → หลังบ้าน a=hit · ปิดนับเครื่องตัวเอง: เปิดหน้าใดก็ได้ใส่ ?notrack=1 */
(function () {
  try {
    if (window.top !== window.self) return;   // หน้าในกรอบของ /app/ ไม่นับซ้ำ
    if (/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) return;
    var q = new URLSearchParams(location.search), ls = window.localStorage, ss = window.sessionStorage;
    if (q.get("notrack") === "1") { ls.setItem("edm_notrack", "1"); return; }
    if (q.get("notrack") === "0") ls.removeItem("edm_notrack");
    if (ls.getItem("edm_notrack") === "1") return;
    var API = window.EDM_API || "https://script.google.com/macros/s/AKfycbwJkmZljZol1M-e46U_gGNHUu_FRgbjcqlXCCXLwz1GMjlhhRddkCkugtob2vrn9YCc/exec";
    var v = ls.getItem("edm_vid"), n = 0;
    if (!v) { v = Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4); ls.setItem("edm_vid", v); n = 1; }
    var src = ss.getItem("edm_src");
    if (src == null) {   // จำช่องทางที่มาครั้งแรกของการเข้าชมรอบนี้
      var r = "";
      try { if (document.referrer && new URL(document.referrer).host !== location.host) r = document.referrer.slice(0, 200); } catch (e) {}
      src = JSON.stringify({ u: (q.get("utm_source") || (q.get("fbclid") ? "facebook" : "")).slice(0, 40), r: r });
      ss.setItem("edm_src", src);
    }
    var s = JSON.parse(src || "{}"), ed = q.get("ed");
    var body = JSON.stringify({ a: "hit", p: location.pathname + (ed ? "?ed=" + ed : ""), u: s.u || "", r: s.r || "", v: v, n: n, m: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 1 : 0 });
    setTimeout(function () { try { fetch(API, { method: "POST", body: body, mode: "no-cors", keepalive: true }); } catch (e) {} }, 1200);
  } catch (e) {}
})();
