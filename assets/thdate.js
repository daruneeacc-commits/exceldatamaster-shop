/* Excel Data Master — วันที่แบบไทย: วันหยุด และแปลงข้อความภาษาไทยเป็นวัน/เวลา/งานซ้ำ
 * วันหยุด 2569 ตามประกาศ ครม. · 2570 ตามประกาศวันหยุดสถาบันการเงิน ธปท. · ปีอื่นใช้วันหยุดที่วันที่ตายตัว
 * ใช้: EDM_TH.hol("2026-10-13") → "วันนวมินทรมหาราช" · EDM_TH.parse("พรุ่งนี้บ่ายสองโทรหาลูกค้า") */
(function () {
  "use strict";
  var H = {
    "2026-01-01": "วันขึ้นปีใหม่", "2026-01-02": "วันหยุดพิเศษ", "2026-03-03": "วันมาฆบูชา", "2026-04-06": "วันจักรี",
    "2026-04-13": "วันสงกรานต์", "2026-04-14": "วันสงกรานต์", "2026-04-15": "วันสงกรานต์", "2026-05-01": "วันแรงงานแห่งชาติ",
    "2026-05-04": "วันฉัตรมงคล", "2026-05-13": "วันพืชมงคล (ราชการ)", "2026-05-31": "วันวิสาขบูชา", "2026-06-01": "ชดเชยวันวิสาขบูชา",
    "2026-06-03": "วันเฉลิมฯ พระราชินี", "2026-07-28": "วันเฉลิมฯ ร.10", "2026-07-29": "วันอาสาฬหบูชา", "2026-07-30": "วันเข้าพรรษา (ราชการ)",
    "2026-08-12": "วันแม่แห่งชาติ", "2026-10-13": "วันนวมินทรมหาราช", "2026-10-16": "วันหยุดพิเศษ (ราชการ)", "2026-10-23": "วันปิยมหาราช",
    "2026-12-05": "วันพ่อแห่งชาติ", "2026-12-07": "ชดเชยวันพ่อแห่งชาติ", "2026-12-10": "วันรัฐธรรมนูญ", "2026-12-31": "วันสิ้นปี",
    "2027-01-01": "วันขึ้นปีใหม่", "2027-02-21": "วันมาฆบูชา", "2027-02-22": "ชดเชยวันมาฆบูชา", "2027-04-06": "วันจักรี",
    "2027-04-13": "วันสงกรานต์", "2027-04-14": "วันสงกรานต์", "2027-04-15": "วันสงกรานต์", "2027-05-01": "วันแรงงานแห่งชาติ",
    "2027-05-03": "ชดเชยวันแรงงาน", "2027-05-04": "วันฉัตรมงคล", "2027-05-20": "วันวิสาขบูชา", "2027-06-03": "วันเฉลิมฯ พระราชินี",
    "2027-07-18": "วันอาสาฬหบูชา", "2027-07-19": "ชดเชยวันอาสาฬหบูชา", "2027-07-28": "วันเฉลิมฯ ร.10", "2027-08-12": "วันแม่แห่งชาติ",
    "2027-10-13": "วันนวมินทรมหาราช", "2027-10-23": "วันปิยมหาราช", "2027-10-25": "ชดเชยวันปิยมหาราช", "2027-12-05": "วันพ่อแห่งชาติ",
    "2027-12-06": "ชดเชยวันพ่อแห่งชาติ", "2027-12-10": "วันรัฐธรรมนูญ", "2027-12-31": "วันสิ้นปี"
  };
  var FIX = { "01-01": "วันขึ้นปีใหม่", "04-06": "วันจักรี", "04-13": "วันสงกรานต์", "04-14": "วันสงกรานต์", "04-15": "วันสงกรานต์", "05-01": "วันแรงงานแห่งชาติ",
    "05-04": "วันฉัตรมงคล", "06-03": "วันเฉลิมฯ พระราชินี", "07-28": "วันเฉลิมฯ ร.10", "08-12": "วันแม่แห่งชาติ", "10-13": "วันนวมินทรมหาราช",
    "10-23": "วันปิยมหาราช", "12-05": "วันพ่อแห่งชาติ", "12-10": "วันรัฐธรรมนูญ", "12-31": "วันสิ้นปี" };
  var KNOWN = { 2026: 1, 2027: 1 };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  function ymd(dt) { return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()); }
  function dt(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function add(d, n) { var x = dt(d); x.setDate(x.getDate() + n); return ymd(x); }
  function hol(d) { return KNOWN[+d.slice(0, 4)] ? H[d] || "" : FIX[d.slice(5)] || ""; }
  function lastDay(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function today() { return ymd(new Date()); }

  /* ---------- แปลงข้อความ ---------- */
  var DOW = [["อาทิตย์", 0], ["จันทร์", 1], ["อังคาร", 2], ["พุธ", 3], ["พฤหัสบดี", 4], ["พฤหัส", 4], ["ศุกร์", 5], ["เสาร์", 6]];
  var MON = [["มกราคม", 1], ["กุมภาพันธ์", 2], ["มีนาคม", 3], ["เมษายน", 4], ["พฤษภาคม", 5], ["มิถุนายน", 6], ["กรกฎาคม", 7], ["สิงหาคม", 8], ["กันยายน", 9], ["ตุลาคม", 10], ["พฤศจิกายน", 11], ["ธันวาคม", 12],
    ["ม.ค.", 1], ["ก.พ.", 2], ["มี.ค.", 3], ["เม.ย.", 4], ["พ.ค.", 5], ["มิ.ย.", 6], ["ก.ค.", 7], ["ส.ค.", 8], ["ก.ย.", 9], ["ต.ค.", 10], ["พ.ย.", 11], ["ธ.ค.", 12]];
  var NUMW = [["สิบสอง", 12], ["สิบเอ็ด", 11], ["สิบ", 10], ["หนึ่ง", 1], ["สอง", 2], ["สาม", 3], ["สี่", 4], ["ห้า", 5], ["หก", 6], ["เจ็ด", 7], ["แปด", 8], ["เก้า", 9]];
  var N = "(\\d{1,2}|สิบสอง|สิบเอ็ด|สิบ|หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)";
  function num(s) { if (/^\d+$/.test(s)) return +s; for (var i = 0; i < NUMW.length; i++) if (NUMW[i][0] === s) return NUMW[i][1]; return NaN; }
  var dowRe = "(?:วัน)?(อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|พฤหัส|ศุกร์|เสาร์)";
  function dowOf(s) { for (var i = 0; i < DOW.length; i++) if (DOW[i][0] === s) return DOW[i][1]; return -1; }
  function monOf(s) { for (var i = 0; i < MON.length; i++) if (MON[i][0] === s) return MON[i][1]; return 0; }
  var monRe = "(" + MON.map(function (m) { return m[0].replace(/\./g, "\\."); }).join("|") + ")";

  function parse(text, base) {
    var s = " " + String(text || "") + " ", t0 = base || today(), r = { d: "", tm: "", rep: null, pri: 0, cat: "", hit: [] };
    var cut = function (re, fn) { var m = re.exec(s); if (!m) return false; if (fn(m) === false) return false; r.hit.push(m[0].trim()); s = s.slice(0, m.index) + " " + s.slice(m.index + m[0].length); return true; };
    var Y = +t0.slice(0, 4), M = +t0.slice(5, 7) - 1, D = +t0.slice(8);
    // "วันจันทร์" = วันจันทร์ที่จะถึง (วันนี้ถ้าตรง) · "จันทร์หน้า" = วันจันทร์ของสัปดาห์หน้า (สัปดาห์เริ่มวันจันทร์)
    var nextDow = function (w, nextWeek) {
      var day = dt(t0).getDay();
      if (!nextWeek) return add(t0, (w - day + 7) % 7);
      var mon = add(t0, 8 - (day || 7));
      return add(mon, (w + 6) % 7);
    };
    // หมวด / ความสำคัญ
    cut(/\s#([^\s#]+)/, function (m) { r.cat = m[1]; });
    cut(/(\s!|ด่วน(มาก)?|สำคัญ)/, function () { r.pri = 1; });
    // งานซ้ำ
    if (!cut(/ทุก\s*สิ้นเดือน/, function () { r.rep = { k: "me" }; r.d = r.d || ymd(new Date(Y, M, lastDay(Y, M))); }))
      if (!cut(new RegExp("ทุก\\s*วันที่\\s*" + N), function (m) { var n = num(m[1]); if (!(n >= 1 && n <= 31)) return false; r.rep = { k: "m", n: n }; var d = Math.min(n, lastDay(Y, M)); var c = ymd(new Date(Y, M, d)); if (c < t0) c = ymd(new Date(Y, M + 1, Math.min(n, lastDay(Y, M + 1)))); r.d = c; }))
        if (!cut(new RegExp("ทุก\\s*" + dowRe), function (m) { var w = dowOf(m[1]); r.rep = { k: "w", dow: [w] }; r.d = nextDow(w); }))
          if (!cut(/ทุก\s*วัน(?!\s*ที่)/, function () { r.rep = { k: "d" }; }))
            if (!cut(/ทุก\s*(สัปดาห์|อาทิตย์)/, function () { r.rep = { k: "w" }; }))
              if (!cut(/ทุก\s*เดือน/, function () { r.rep = { k: "m" }; }))
                cut(/ทุก\s*ปี/, function () { r.rep = { k: "y" }; });
    // วันที่
    if (!r.d) {
      cut(/วันนี้|คืนนี้/, function () { r.d = t0; }) ||
      cut(/มะรืน(นี้)?/, function () { r.d = add(t0, 2); }) ||
      cut(/พรุ่งนี้/, function () { r.d = add(t0, 1); }) ||
      cut(/สิ้นเดือน(นี้)?/, function () { r.d = ymd(new Date(Y, M, lastDay(Y, M))); }) ||
      cut(/(สัปดาห์|อาทิตย์)หน้า(?!\s*วัน)/, function () { r.d = add(t0, 7); }) ||
      cut(new RegExp(dowRe + "\\s*(นี้|หน้า)?"), function (m) { r.d = nextDow(dowOf(m[1]), m[2] === "หน้า"); }) ||
      cut(/เดือนหน้า/, function () { r.d = ymd(new Date(Y, M + 1, Math.min(D, lastDay(Y, M + 1)))); }) ||
      cut(/(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2,4}))?/, function (m) {
        var d = +m[1], mo = +m[2] - 1, y = m[3] ? +m[3] : Y; if (y < 100) y += 2500; if (y > 2400) y -= 543;
        if (mo < 0 || mo > 11 || d < 1 || d > lastDay(y, mo)) return false; var c = ymd(new Date(y, mo, d)); if (!m[3] && c < t0) c = ymd(new Date(y + 1, mo, d)); r.d = c; }) ||
      cut(new RegExp("(?:วันที่\\s*)?(\\d{1,2})\\s*" + monRe + "(?:\\s*(\\d{2,4}))?"), function (m) {
        var d = +m[1], mo = monOf(m[2]) - 1, y = m[3] ? +m[3] : Y; if (y < 100) y += 2500; if (y > 2400) y -= 543;
        if (d < 1 || d > lastDay(y, mo)) return false; var c = ymd(new Date(y, mo, d)); if (!m[3] && c < t0) c = ymd(new Date(y + 1, mo, d)); r.d = c; }) ||
      cut(/วันที่\s*(\d{1,2})/, function (m) { var n = +m[1]; if (n < 1 || n > 31) return false; var c = ymd(new Date(Y, M, Math.min(n, lastDay(Y, M)))); if (c < t0) c = ymd(new Date(Y, M + 1, Math.min(n, lastDay(Y, M + 1)))); r.d = c; });
    }
    // เวลา
    var setT = function (h, mi) { if (h > 23 || mi > 59) return false; r.tm = pad(h) + ":" + pad(mi || 0); };
    cut(/(\d{1,2})[:.](\d{2})\s*(น\.|นาฬิกา)?/, function (m) { return setT(+m[1], +m[2]); }) ||
    cut(/เที่ยงคืน/, function () { setT(0, 0); }) ||
    cut(new RegExp("บ่าย\\s*(โมง|" + N + "\\s*(โมง)?)(\\s*ครึ่ง)?"), function (m) { var n = m[1] === "โมง" ? 1 : num(m[2]); return setT(n === 12 ? 12 : n + 12, m[4] ? 30 : 0); }) ||
    cut(new RegExp("(?:" + N + "\\s*โมงเย็น|เย็น\\s*" + N + "\\s*(โมง)?)(\\s*ครึ่ง)?"), function (m) { var n = num(m[1] || m[2]); return setT(n < 12 ? n + 12 : n, m[4] ? 30 : 0); }) ||
    cut(new RegExp(N + "\\s*ทุ่ม(\\s*ครึ่ง)?"), function (m) { return setT(18 + num(m[1]), m[2] ? 30 : 0); }) ||
    cut(new RegExp("ตี\\s*" + N + "(\\s*ครึ่ง)?"), function (m) { return setT(num(m[1]), m[2] ? 30 : 0); }) ||
    cut(/เที่ยง(วัน)?(\s*ครึ่ง)?/, function (m) { setT(12, m[2] ? 30 : 0); }) ||
    cut(new RegExp(N + "\\s*โมง(เช้า)?(\\s*ครึ่ง)?"), function (m) { var n = num(m[1]); if (!m[2] && n >= 1 && n <= 5) n += 12; return setT(n, m[3] ? 30 : 0); });
    if (r.rep && !r.d) r.d = t0;
    if (r.tm && !r.d) r.d = t0;
    r.t = s.replace(/\s+/g, " ").replace(/^[\s,·\-–]+|[\s,·\-–]+$/g, "").trim();
    return r;
  }

  /* ---------- งานซ้ำ / เลื่อนหนีวันหยุด ---------- */
  function isOff(d, work) { var w = dt(d).getDay(); return (work || [1, 2, 3, 4, 5]).indexOf(w) < 0 || !!hol(d); }
  function shift(d, mode, work) {
    if (!mode || !d) return d;
    for (var i = 0; i < 14 && isOff(d, work); i++) d = add(d, mode === "next" ? 1 : -1);
    return d;
  }
  // วันถัดไปของงานซ้ำ จากวันฐาน b (ยังไม่เลื่อนหนีวันหยุด)
  function next(b, rep) {
    var x = dt(b), y = x.getFullYear(), m = x.getMonth(), d = x.getDate();
    if (!rep) return "";
    if (rep.k === "d") return add(b, rep.n || 1);
    if (rep.k === "w") {
      var L = rep.dow && rep.dow.length ? rep.dow : [x.getDay()];
      for (var i = 1; i <= 7; i++) { var c = add(b, i); if (L.indexOf(dt(c).getDay()) >= 0) return c; }
      return add(b, 7);
    }
    if (rep.k === "m") { var n = rep.n || d; return ymd(new Date(y, m + 1, Math.min(n, lastDay(y, m + 1)))); }
    if (rep.k === "me") return ymd(new Date(y, m + 2, 0));
    if (rep.k === "y") return ymd(new Date(y + 1, m, Math.min(d, lastDay(y + 1, m))));
    return "";
  }
  function repText(rep) {
    if (!rep) return "";
    var D = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    if (rep.k === "d") return rep.n > 1 ? "ทุก " + rep.n + " วัน" : "ทุกวัน";
    if (rep.k === "w") return rep.dow && rep.dow.length ? "ทุก" + rep.dow.map(function (w) { return D[w]; }).join(" ") : "ทุกสัปดาห์";
    if (rep.k === "m") return rep.n ? "ทุกวันที่ " + rep.n : "ทุกเดือน";
    if (rep.k === "me") return "ทุกสิ้นเดือน";
    if (rep.k === "y") return "ทุกปี";
    return "";
  }
  window.EDM_TH = { hol: hol, parse: parse, next: next, shift: shift, isOff: isOff, repText: repText, ymd: ymd, dt: dt, add: add, today: today, lastDay: lastDay, known: function (y) { return !!KNOWN[y]; } };
})();
