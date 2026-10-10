/* Excel Data Master — ตัวคำนวณเวลาทำงาน (ใช้ร่วมกันระหว่าง /time/ และ /payroll/)
 * ข้อมูล (localStorage):
 *   edm_time_cfg   ตั้งค่า: กะ วันหยุด กฎ OT/สาย และกะ/สาขา/PIN ของพนักงานแต่ละคน
 *   edm_time_log   {"2026-10":[{id,e,d,in,out,src,by}]}  รอบการทำงาน (เข้า-ออก) · d = วันของกะ
 *   edm_time_day   {"2026-10":{empId:{"2026-10-05":{lv,off,work,ota,note}}}}  ลา / วันหยุดพิเศษ / อนุมัติ OT
 *   edm_time_audit [{ts,e,d,act,before,after,note}]  ประวัติการแก้ไขเวลา
 * พนักงานมาจากระบบเงินเดือน (edm_pay_emps) · ส่งผลเข้า edm_pay_records ด้วย apply()
 */
(function () {
  "use strict";
  var K = { cfg: "edm_time_cfg", log: "edm_time_log", day: "edm_time_day", audit: "edm_time_audit", emps: "edm_pay_emps", recs: "edm_pay_records", co: "edm_pay_company" };
  function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var ymd = function (dt) { return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()); };
  var r2 = function (n) { return Math.round((n + Number.EPSILON) * 100) / 100; };
  var num = function (v) { var n = parseFloat(v); return isFinite(n) ? n : 0; };
  var hm2m = function (s) { var p = String(s || "0:0").split(":"); return (+p[0] || 0) * 60 + (+p[1] || 0); };
  var m2hm = function (m) { m = Math.round(m); var neg = m < 0; m = Math.abs(m); return (neg ? "-" : "") + pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60); };
  var dur = function (m) { m = Math.round(m || 0); if (!m) return "-"; var h = Math.floor(m / 60), x = m % 60; return (h ? h + " ชม." : "") + (x ? (h ? " " : "") + x + " นาที" : ""); };

  var LEAVE = { sick: { n: "ลาป่วย", paid: true }, biz: { n: "ลากิจ", paid: true }, vac: { n: "พักร้อน", paid: true }, unpaid: { n: "ลาไม่รับค่าจ้าง", paid: false } };
  var CFG0 = {
    shifts: [{ id: "s1", name: "กะปกติ", start: "08:00", end: "17:00", brk: 60, days: [1, 2, 3, 4, 5, 6] }],
    grace: 5,          // สายไม่เกินกี่นาทีไม่นับ
    lateMode: "all",   // all = เกินผ่อนผันนับตั้งแต่เวลาเข้างาน · over = นับเฉพาะส่วนที่เกิน
    earlyCount: true,  // ออกก่อนเวลา หักรวมกับมาสาย
    otAfter: 30,       // ทำเกินเวลาเลิกงานกี่นาทีจึงนับ OT
    otRound: 30,       // ปัด OT ลงทีละกี่นาที
    otMode: "auto",    // auto = นับให้อัตโนมัติ · approve = นับเฉพาะวันที่อนุมัติ
    brkAuto: true,     // หักเวลาพักตามกะ เมื่อทำงานรอบเดียวเกิน 5 ชม.
    needPin: false,    // ต้องใส่ PIN ตอนตอกบัตร (พนักงานที่ตั้ง PIN ไว้)
    salt: "",
    emp: {},           // {empId:{shift,branch,pin}}
    hol: []            // [{d:"2026-12-05",n:"วันพ่อแห่งชาติ"}]
  };
  function cfg() {
    var c = Object.assign({}, CFG0, get(K.cfg, {}));
    c.emp = c.emp || {}; c.hol = c.hol || [];
    if (!c.shifts || !c.shifts.length) c.shifts = JSON.parse(JSON.stringify(CFG0.shifts));
    return c;
  }
  function emps() { return (get(K.emps, []) || []).filter(function (e) { return e && e.id; }); }
  function active(e, ym) { if (!e.end) return true; return String(e.end).slice(0, 7) >= ym; }
  function logOf(ym) { var L = get(K.log, {}) || {}; return (L[ym] || []).filter(function (s) { return !s.del; }); }
  function marksOf(ym) { return (get(K.day, {}) || {})[ym] || {}; }
  function shiftOf(c, empId) {
    var id = (c.emp[empId] || {}).shift;
    if (id === "none") return null;
    return c.shifts.find(function (s) { return s.id === id; }) || c.shifts[0] || null;
  }
  function shiftSpan(sh) { if (!sh) return null; var S = hm2m(sh.start), E = hm2m(sh.end); if (E <= S) E += 1440; return { S: S, E: E, len: E - S, brk: num(sh.brk) }; }
  function midnight(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }
  function holidayOf(c, d) { return c.hol.find(function (h) { return h.d === d; }) || null; }
  function today() { return ymd(new Date()); }

  /* ---------- หนึ่งวันของพนักงานหนึ่งคน ---------- */
  function day(c, emp, d, sess, mark, co) {
    mark = mark || {}; sess = sess || [];
    var sh = shiftOf(c, emp.id), sp = shiftSpan(sh), dow = new Date(midnight(d)).getDay(), hol = holidayOf(c, d);
    var sched = !!(sh && (sh.days || []).indexOf(dow) >= 0 && !hol && !mark.off);
    if (mark.work && sh) sched = true;
    var base = midnight(d), now = Date.now(), td = today();
    var ins = [], outs = [], work = 0, open = null, noout = 0;
    sess.slice().sort(function (a, b) { return a.in - b.in; }).forEach(function (s) {
      var i = (s.in - base) / 60000; ins.push(i);
      if (s.out) { var o = (s.out - base) / 60000; outs.push(o); work += Math.max(0, o - i); }
      else if (d === td || now - s.in < 20 * 3600000) open = s; else noout++;
    });
    var closed = sess.filter(function (s) { return s.out; }).length;
    var brk = 0;
    if (c.brkAuto && sp && closed === 1 && sess.length === 1 && work > 300) brk = Math.min(sp.brk, work - 300);
    work = Math.max(0, work - brk);
    var R = { d: d, dow: dow, sh: sh, sched: sched, hol: hol, mark: mark, sess: sess, ins: ins, outs: outs, first: ins.length ? Math.min.apply(null, ins) : null, last: outs.length ? Math.max.apply(null, outs) : null,
      work: work, brk: brk, reg: 0, late: 0, early: 0, ot15: 0, ot2: 0, ot3: 0, otRaw: 0, otPend: false, open: open, noout: noout, credit: 0, status: "" };
    var hpd = sp ? sp.len - sp.brk : (num((co || {}).hpd) || 8) * 60;
    var round = function (m) { var r = num(c.otRound) || 1; return Math.floor(m / r) * r; };
    var otOk = c.otMode !== "approve" || mark.ota;
    if (sched && sp) {
      if (R.first != null) {
        var lt = R.first - sp.S, g = num(c.grace);
        if (lt > g) R.late = Math.round(c.lateMode === "over" ? lt - g : lt);
      }
      if (R.last != null && !open) {
        if (R.last < sp.E - 0.5) R.early = Math.round(sp.E - R.last);
        var after = R.last - sp.E;
        if (after >= num(c.otAfter) && after > 0) R.otRaw = round(after);
      }
      if (R.otRaw) { if (otOk) R.ot15 = R.otRaw; else R.otPend = true; }
      R.reg = Math.max(0, Math.min(work - R.ot15, hpd));
      R.credit = work > 0 ? (R.reg >= hpd / 2 ? 1 : 0.5) : 0;
    } else if (work > 0) {
      if (sh) {          // ทำงานวันหยุด
        var w = round(work), a = Math.min(w, hpd), b = Math.max(0, w - hpd);
        if (otOk) { R.ot2 = a; R.ot3 = round(b); } else { R.otRaw = w; R.otPend = true; }
      } else { R.reg = work; R.credit = 1; }   // ไม่มีกะ (เวลายืดหยุ่น): นับชั่วโมงจริง
    }
    var past = d < td || (d === td && sp && (now - base) / 60000 > sp.E);
    if (d > td) R.status = "future";
    else if (mark.lv) R.status = "leave";
    else if (open) R.status = "open";
    else if (sess.length && noout && !closed) R.status = "noout";
    else if (!sched && hol && !work) R.status = "hol";
    else if (!sched && !work) R.status = sh ? "off" : "nowork";
    else if (sched && !sess.length) R.status = past ? "abs" : "wait";
    else if (R.late || R.early) R.status = "late";
    else R.status = "ok";
    if (noout && R.status !== "noout") R.flagNoout = true;
    return R;
  }

  /* ---------- ทั้งเดือน ---------- */
  function daysOf(ym, until) {
    var p = ym.split("-"), y = +p[0], m = +p[1] - 1, n = new Date(y, m + 1, 0).getDate(), out = [];
    for (var i = 1; i <= n; i++) { var d = ym + "-" + pad(i); if (!until || d <= until) out.push(d); }
    return out;
  }
  function month(empId, ym, opt) {
    opt = opt || {};
    var c = opt.c || cfg(), co = opt.co || get(K.co, {}) || {}, emp = (opt.emp) || emps().find(function (e) { return e.id === empId; });
    if (!emp) return null;
    var L = opt.log || logOf(ym), M = (opt.marks || marksOf(ym))[empId] || {}, list = [];
    var mine = L.filter(function (s) { return s.e === empId; });
    var S = { emp: emp, ym: ym, sched: 0, present: 0, abs: 0, lv: { sick: 0, biz: 0, vac: 0, unpaid: 0 }, lateN: 0, late: 0, early: 0, ot15: 0, ot2: 0, ot3: 0, otPend: 0, reg: 0, work: 0, noout: 0, holPaid: 0, credit: 0, sessions: mine.length, days: list };
    daysOf(ym, opt.until || null).forEach(function (d) {
      var R = day(c, emp, d, mine.filter(function (s) { return s.d === d; }), M[d], co);
      list.push(R);
      if (R.status === "future") return;
      if (R.sched) S.sched++;
      if (R.mark.lv && LEAVE[R.mark.lv]) { S.lv[R.mark.lv] += R.mark.half ? 0.5 : 1; }
      if (R.status === "abs") S.abs++;
      if (R.work > 0 && R.sched) S.present++;
      if (R.late) S.lateN++;
      S.late += R.late; S.early += R.early; S.ot15 += R.ot15; S.ot2 += R.ot2; S.ot3 += R.ot3; S.reg += R.reg; S.work += R.work; S.credit += R.credit;
      if (R.otPend) S.otPend += R.otRaw;
      if (R.status === "noout" || R.flagNoout) S.noout++;
      if (R.hol && R.sh && (R.sh.days || []).indexOf(R.dow) >= 0) S.holPaid++;
    });
    var paidLv = S.lv.sick + S.lv.biz + S.lv.vac;
    S.payDays = r2(S.credit + paidLv + S.holPaid);            // รายวัน: วันทำงาน + ลาที่ได้ค่าจ้าง + วันหยุดตามประเพณี
    S.payHrs = r2(S.reg / 60);                                 // รายชั่วโมง
    S.payLate = Math.round(S.late + (c.earlyCount ? S.early : 0));
    return S;
  }

  /* ---------- ส่งเข้าระบบเงินเดือน ---------- */
  function apply(ym, ids) {
    var c = cfg(), co = get(K.co, {}) || {}, L = logOf(ym), MK = marksOf(ym), recs = get(K.recs, {}) || {}, n = 0, skipped = [];
    if (!recs[ym]) recs[ym] = {};
    emps().forEach(function (e) {
      if (ids && ids.indexOf(e.id) < 0) return;
      if (!active(e, ym)) return;
      var t = e.type || "m";
      if (t === "p" || t === "f") return;
      if (!L.some(function (s) { return s.e === e.id; }) && !MK[e.id]) { skipped.push(e.name || e.code); return; }
      var S = month(e.id, ym, { c: c, co: co, emp: e, log: L, marks: MK });
      var r = recs[ym][e.id] || (recs[ym][e.id] = { rate: num(e.salary), days: 0, slf: num(e.slf) });
      if (t === "d") r.days = S.payDays;
      if (t === "h") r.hrs = S.payHrs;
      if (t === "m") { r.abs = S.abs; r.leave = S.lv.unpaid; }
      r.late = S.payLate;
      r.ot15 = r2(S.ot15 / 60); r.ot2 = r2(S.ot2 / 60); r.ot3 = r2(S.ot3 / 60);
      r.fromTime = Date.now();
      n++;
    });
    set(K.recs, recs);
    return { n: n, skipped: skipped };
  }

  window.EDM_TIME = { K: K, LEAVE: LEAVE, CFG0: CFG0, cfg: cfg, emps: emps, active: active, logOf: logOf, marksOf: marksOf, shiftOf: shiftOf, shiftSpan: shiftSpan,
    holidayOf: holidayOf, day: day, month: month, daysOf: daysOf, apply: apply, get: get, set: set, ymd: ymd, today: today, hm2m: hm2m, m2hm: m2hm, dur: dur, midnight: midnight, r2: r2, num: num, pad: pad };
})();
