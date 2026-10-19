/* Excel Data Master · ลิงก์หลังบ้าน "ระบบทีมขาย" (โค้ดอยู่ใน tools/sales-team/Code.gs)
 * ใส่ลิงก์เว็บแอปที่ลงท้าย /exec หลังเจ้าของ Deploy · ว่าง = ยังไม่เปิดทีมออนไลน์ (ใช้แบบเครื่องเดียวได้) */
(function () {
  "use strict";
  var API = window.EDM_SALES_API_OVERRIDE || "";
  function call(o) {
    if (!API) return Promise.reject(new Error("no_api"));
    return fetch(API, { method: "POST", body: JSON.stringify(o) }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) { var e = new Error((j && j.err) || "error"); e.res = j; throw e; }
      return j;
    });
  }
  var MSG = {
    no_api: "ยังไม่ได้เปิดระบบทีมออนไลน์", no_access: "สิทธิ์ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่", no_team: "ไม่พบทีมนี้ ตรวจลิงก์อีกครั้ง",
    team_expired: "ทีมนี้หมดอายุการใช้งาน ติดต่อหัวหน้าทีม", pin: "PIN ไม่ถูกต้อง", locked: "ใส่ PIN ผิดหลายครั้ง รอ 15 นาทีแล้วลองใหม่",
    max_reps: "เพิ่มเซลล์ได้สูงสุด 10 คน", too_many: "อีเมลนี้สร้างทีมครบ 3 ทีมแล้ว", busy: "ระบบไม่ว่าง ลองใหม่อีกครั้ง",
    too_old: "ลบได้เฉพาะรายการของตัวเองภายใน 24 ชม.", rep: "ไม่พบชื่อเซลล์นี้", kind: "ประเภทกิจกรรมไม่ถูกต้อง", date: "วันที่ไม่ถูกต้อง"
  };
  function msg(e) { var k = (e && e.message) || ""; return MSG[k] || (/fetch|network|Load failed/i.test(k) ? "เชื่อมต่ออินเทอร์เน็ตไม่ได้" : "เกิดข้อผิดพลาด: " + k); }
  window.EDM_SALES = { get api() { return API; }, call: call, msg: msg, repUrl: function (t) { return "https://exceldatamaster.com/sell/?t=" + encodeURIComponent(t); } };
})();
