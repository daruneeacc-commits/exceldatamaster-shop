/**
 * Excel Data Master · หลังบ้าน "ระบบทีมขาย" (แยกจากหลังบ้านสมาชิก/สั่งซื้อ)
 * เก็บข้อมูลทีม เซลล์ และกิจกรรมการขาย ให้หัวหน้าและเซลล์หลายเครื่องใช้ร่วมกัน
 *
 * ติดตั้ง (ทำครั้งเดียว):
 *  1) สร้าง Google Sheet ใหม่ ตั้งชื่อ "EDM ทีมขาย (ห้ามแชร์)"
 *  2) ส่วนขยาย → Apps Script → ลบโค้ดเดิม วางไฟล์นี้ทั้งหมด → บันทึก
 *  3) เลือกฟังก์ชัน setup แล้วกด "เรียกใช้" 1 ครั้ง (อนุญาตสิทธิ์)
 *  4) การทำให้ใช้งานได้ → รายการใหม่ → เว็บแอป · ดำเนินการในฐานะ: ฉัน · ผู้ที่มีสิทธิ์: ทุกคน
 *  5) ส่งลิงก์ที่ลงท้าย /exec ให้ทีมเว็บ ใส่ใน assets/salesapi.js
 * แก้โค้ดครั้งต่อไป: จัดการการทำให้ใช้งานได้ → ✏️ → เวอร์ชันใหม่ (ลิงก์เดิม)
 *
 * ไม่มีข้อมูลลับในไฟล์นี้ · รหัส PIN / กุญแจหัวหน้า เก็บเป็นค่า hash เท่านั้น
 */
var SALES_V = 1;
var MAX_REPS = 10;          // เซลล์ที่ใช้งานได้ต่อทีม
var MAX_TEAMS_PER_EMAIL = 3;
var GRACE_MS = 3 * 864e5;   // หลังหมดอายุ เซลล์ยังเข้าได้อีก 3 วัน
var KINDS = { call: 1, meet: 1, quote: 1, follow: 1, sale: 1 };

function setup() { sheets_(); }

function doGet() { return out_({ ok: true, app: "edm-sales", v: SALES_V }); }

function doPost(e) {
  var req;
  try { req = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (x) { return out_({ ok: false, err: "bad_json" }); }
  try { return out_(route_(req || {})); }
  catch (x) { return out_({ ok: false, err: String(x && x.message || x).slice(0, 120) }); }
}

function route_(q) {
  var a = String(q.a || "");
  switch (a) {
    case "create": return locked_(function () { return create_(q); });
    case "m_get": return mGet_(q);
    case "m_save": return locked_(function () { return mSave_(q); });
    case "m_log": return locked_(function () { return mLog_(q); });
    case "m_del": return locked_(function () { return mDel_(q); });
    case "r_list": return rList_(q);
    case "r_login": return locked_(function () { return rLogin_(q); });
    case "r_get": return rGet_(q);
    case "r_log": return locked_(function () { return rLog_(q); });
    case "r_del": return locked_(function () { return rDel_(q); });
    case "r_idp": return locked_(function () { return rIdp_(q); });
    case "ping": return { ok: true, v: SALES_V };
  }
  return { ok: false, err: "unknown" };
}

/* ---------- ชีต ---------- */
var HEAD = {
  teams: ["team", "keyHash", "email", "name", "paidUntil", "created", "cfg", "updated"],
  reps: ["team", "rep", "data"],
  logs: ["team", "id", "rep", "date", "kind", "amount", "customer", "note", "ts", "by"]
};
function ss_() {
  var s = null;
  try { s = SpreadsheetApp.getActiveSpreadsheet(); } catch (x) {}
  if (s) return s;
  var P = PropertiesService.getScriptProperties(), id = P.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  s = SpreadsheetApp.create("EDM ทีมขาย (ห้ามแชร์)"); P.setProperty("SHEET_ID", s.getId()); return s;
}
function sheets_() {
  var s = ss_(), o = {};
  Object.keys(HEAD).forEach(function (n) {
    var sh = s.getSheetByName(n);
    if (!sh) { sh = s.insertSheet(n); sh.getRange(1, 1, 1, HEAD[n].length).setValues([HEAD[n]]); sh.setFrozenRows(1); }
    o[n] = sh;
  });
  return o;
}
function rows_(sh) { var n = sh.getLastRow(); return n < 2 ? [] : sh.getRange(2, 1, n - 1, sh.getLastColumn()).getValues(); }
function locked_(fn) {
  var L = LockService.getScriptLock();
  if (!L.tryLock(15000)) return { ok: false, err: "busy" };
  try { return fn(); } finally { L.releaseLock(); }
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- เครื่องมือ ---------- */
function hash_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ((x + 256) % 256).toString(16).replace(/^(.)$/, "0$1"); }).join("");
}
function rnd_(n, abc) {
  abc = abc || "abcdefghijkmnpqrstuvwxyz23456789"; var s = "";
  var u = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  for (var i = 0; i < n; i++) s += abc.charAt(parseInt(u.substr((i * 2) % 60, 2), 16) % abc.length);
  return s;
}
function str_(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n || 100); }
function num_(v, mx) { var n = Number(v); return isFinite(n) && n >= 0 ? Math.min(n, mx || 1e9) : 0; }
function date_(v) { v = String(v || ""); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ""; }
function json_(s, d) { try { return s ? JSON.parse(s) : d; } catch (x) { return d; } }

/* ---------- ทีม ---------- */
function findTeam_(id) {
  if (!/^[a-z0-9]{6,12}$/.test(String(id || ""))) return null;
  var sh = sheets_().teams, R = rows_(sh);
  for (var i = 0; i < R.length; i++) if (R[i][0] === id) return { row: i + 2, id: id, keyHash: R[i][1], email: R[i][2], name: R[i][3], paid: Number(R[i][4]) || 0, cfg: json_(R[i][6], {}), sh: sh };
  return null;
}
function mgr_(q) {
  var t = findTeam_(q.team);
  if (!t || !q.key || hash_(t.id + "|" + q.key) !== t.keyHash) throw new Error("no_access");
  var p = Number(q.paid) || 0;
  if (p && p !== t.paid) { t.sh.getRange(t.row, 5).setValue(p); t.paid = p; }
  return t;
}
function create_(q) {
  var email = str_(q.email, 120).toLowerCase(), name = str_(q.name, 60) || "ทีมขาย";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, err: "email" };
  var sh = sheets_().teams, R = rows_(sh), n = R.filter(function (r) { return r[2] === email; }).length;
  if (n >= MAX_TEAMS_PER_EMAIL) return { ok: false, err: "too_many" };
  var id = rnd_(8), key = rnd_(28, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"), now = Date.now();
  sh.appendRow([id, hash_(id + "|" + key), email, name, Number(q.paid) || 0, now, JSON.stringify(cleanCfg_(q.cfg || {})), now]);
  return { ok: true, team: id, key: key };
}
function cleanCfg_(c) {
  var std = c.std || {}, o = { std: {} };
  Object.keys(KINDS).forEach(function (k) { if (k !== "sale") o.std[k] = Math.round(num_(std[k], 999)); });
  o.skills = (Array.isArray(c.skills) ? c.skills : []).slice(0, 8).map(function (s) { return str_(s, 40); }).filter(String);
  o.plan = (Array.isArray(c.plan) ? c.plan : []).slice(0, 20).map(function (p) { return { id: str_(p.id, 20), t: str_(p.t, 120), m: str_(p.m, 120), done: !!p.done }; });
  o.days = Math.round(num_(c.days, 31)) || 0;
  return o;
}

/* ---------- เซลล์ ---------- */
function repsOf_(team) {
  var sh = sheets_().reps, R = rows_(sh), L = [];
  R.forEach(function (r, i) { if (r[0] === team) { var d = json_(r[2], null); if (d) { d._row = i + 2; L.push(d); } } });
  return { sh: sh, list: L };
}
function saveRep_(sh, team, d) {
  var c = {}; Object.keys(d).forEach(function (k) { if (k !== "_row") c[k] = d[k]; });
  if (d._row) sh.getRange(d._row, 3).setValue(JSON.stringify(c)); else sh.appendRow([team, d.id, JSON.stringify(c)]);
}
function pubRep_(d) {
  return { id: d.id, name: d.name, zone: d.zone || "", target: d.target || 0, active: d.active !== false, hasPin: !!d.pin, skills: d.skills || {}, idp: d.idp || [], notes: d.notes || [] };
}
function cleanIdp_(L) { return (Array.isArray(L) ? L : []).slice(0, 20).map(function (t) { return { id: str_(t.id, 20) || rnd_(6), t: str_(t.t, 120), m: str_(t.m, 160), due: str_(t.due, 30), done: !!t.done }; }).filter(function (t) { return t.t; }); }
function cleanNotes_(L) { return (Array.isArray(L) ? L : []).slice(0, 40).map(function (n) { return { d: date_(n.d), t: str_(n.t, 600) }; }).filter(function (n) { return n.t; }); }
function cleanSkills_(o) { var r = {}; Object.keys(o || {}).slice(0, 8).forEach(function (k) { r[str_(k, 40)] = Math.round(num_(o[k], 5) * 10) / 10; }); return r; }

/* ---------- กิจกรรม ---------- */
function cleanLog_(l, rep, by) {
  var k = String(l.kind || "");
  if (!KINDS[k]) throw new Error("kind");
  var d = date_(l.date); if (!d) throw new Error("date");
  return { id: str_(l.id, 24) || rnd_(10), rep: rep, date: d, kind: k, amount: k === "sale" ? num_(l.amount, 1e8) : 0, customer: str_(l.customer, 80), note: str_(l.note, 200), ts: Date.now(), by: by };
}
function logsOf_(team, from, to, rep) {
  var sh = sheets_().logs, R = rows_(sh), L = [];
  from = date_(from) || "0000-00-00"; to = date_(to) || "9999-12-31";
  R.forEach(function (r) {
    if (r[0] !== team) return;
    var d = r[3] instanceof Date ? Utilities.formatDate(r[3], "Asia/Bangkok", "yyyy-MM-dd") : String(r[3]);
    if (d < from || d > to || (rep && r[2] !== rep)) return;
    L.push({ id: String(r[1]), rep: String(r[2]), date: d, kind: String(r[4]), amount: Number(r[5]) || 0, customer: String(r[6] || ""), note: String(r[7] || ""), ts: Number(r[8]) || 0, by: String(r[9] || "") });
  });
  return L;
}
function putLog_(team, x) {
  var sh = sheets_().logs, R = rows_(sh);
  for (var i = 0; i < R.length; i++) if (R[i][0] === team && String(R[i][1]) === x.id) {
    sh.getRange(i + 2, 3, 1, 8).setValues([[x.rep, "'" + x.date, x.kind, x.amount, x.customer, x.note, x.ts, x.by]]); return;
  }
  sh.appendRow([team, x.id, x.rep, "'" + x.date, x.kind, x.amount, x.customer, x.note, x.ts, x.by]);
}
function delLog_(team, id, rep) {
  var sh = sheets_().logs, R = rows_(sh);
  for (var i = R.length - 1; i >= 0; i--) if (R[i][0] === team && String(R[i][1]) === String(id) && (!rep || R[i][2] === rep)) { sh.deleteRow(i + 2); return true; }
  return false;
}

/* ---------- หัวหน้า ---------- */
function mGet_(q) {
  var t = mgr_(q), r = repsOf_(t.id);
  return { ok: true, team: { id: t.id, name: t.name, cfg: t.cfg }, reps: r.list.filter(function (o) { return !o.deleted; }).map(pubRep_), logs: logsOf_(t.id, q.from, q.to) };
}
function mSave_(q) {
  var t = mgr_(q);
  if (q.name != null || q.cfg) {
    if (q.name != null) { t.name = str_(q.name, 60) || t.name; t.sh.getRange(t.row, 4).setValue(t.name); }
    if (q.cfg) { t.cfg = cleanCfg_(q.cfg); t.sh.getRange(t.row, 7).setValue(JSON.stringify(t.cfg)); }
    t.sh.getRange(t.row, 8).setValue(Date.now());
  }
  var r = repsOf_(t.id);
  if (Array.isArray(q.reps)) {
    q.reps.slice(0, 40).forEach(function (x) {
      var id = str_(x.id, 20), d = r.list.filter(function (o) { return o.id === id; })[0];
      if (x.del) { if (d) { d.active = false; d.deleted = true; d.tok = []; saveRep_(r.sh, t.id, d); } return; }
      if (!d) { d = { id: id || rnd_(6), tok: [] }; r.list.push(d); }
      if (x.name != null) d.name = str_(x.name, 40) || d.name || "เซลล์";
      if (x.zone != null) d.zone = str_(x.zone, 40);
      if (x.target != null) d.target = num_(x.target, 1e9);
      if (x.active != null) d.active = !!x.active;
      if (x.pin) { var p = String(x.pin); if (!/^\d{4,6}$/.test(p)) throw new Error("pin"); d.pin = hash_(t.id + "|" + d.id + "|" + p); d.tok = []; }
      if (x.skills) d.skills = cleanSkills_(x.skills);
      if (x.idp) d.idp = cleanIdp_(x.idp);
      if (x.notes) d.notes = cleanNotes_(x.notes);
      if (!d.name) d.name = "เซลล์";
    });
    var act = r.list.filter(function (o) { return o.active !== false && !o.deleted; });
    if (act.length > MAX_REPS) throw new Error("max_reps");
    r.list.forEach(function (d) { saveRep_(r.sh, t.id, d); });
  }
  return { ok: true, team: { id: t.id, name: t.name, cfg: t.cfg }, reps: r.list.filter(function (o) { return !o.deleted; }).map(pubRep_) };
}
function mLog_(q) {
  var t = mgr_(q), r = repsOf_(t.id), l = q.log || {};
  if (!r.list.some(function (o) { return o.id === l.rep && !o.deleted; })) return { ok: false, err: "rep" };
  var x = cleanLog_(l, String(l.rep), "mgr"); putLog_(t.id, x); return { ok: true, log: x };
}
function mDel_(q) { var t = mgr_(q); return { ok: delLog_(t.id, q.id) }; }

/* ---------- เซลล์ (มือถือ) ---------- */
function liveTeam_(id) {
  var t = findTeam_(id);
  if (!t) throw new Error("no_team");
  if (!t.paid || t.paid + GRACE_MS < Date.now()) throw new Error("team_expired");
  return t;
}
function rList_(q) {
  var t = liveTeam_(q.team), r = repsOf_(t.id);
  return { ok: true, name: t.name, reps: r.list.filter(function (o) { return o.active !== false && !o.deleted && o.pin; }).map(function (o) { return { id: o.id, name: o.name }; }) };
}
function rLogin_(q) {
  var t = liveTeam_(q.team), r = repsOf_(t.id), d = r.list.filter(function (o) { return o.id === q.rep && o.active !== false && !o.deleted; })[0];
  if (!d || !d.pin) return { ok: false, err: "rep" };
  var C = CacheService.getScriptCache(), ck = "f_" + t.id + "_" + d.id, f = Number(C.get(ck)) || 0;
  if (f >= 5) return { ok: false, err: "locked" };
  if (hash_(t.id + "|" + d.id + "|" + String(q.pin || "")) !== d.pin) { C.put(ck, String(f + 1), 900); return { ok: false, err: "pin", left: 4 - f }; }
  C.remove(ck);
  var tok = rnd_(32, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789");
  d.tok = (d.tok || []).concat([hash_(tok)]).slice(-3); saveRep_(r.sh, t.id, d);
  return { ok: true, tok: tok, rep: d.id, name: d.name };
}
function repAuth_(q) {
  var t = liveTeam_(q.team), r = repsOf_(t.id), h = hash_(String(q.tok || ""));
  var d = r.list.filter(function (o) { return o.active !== false && !o.deleted && (o.tok || []).indexOf(h) >= 0; })[0];
  if (!q.tok || !d) throw new Error("no_access");
  return { t: t, r: r, d: d };
}
function rGet_(q) {
  var A = repAuth_(q), from = date_(q.from), to = date_(q.to), all = logsOf_(A.t.id, from, to), sum = {};
  all.forEach(function (l) { if (l.kind === "sale") sum[l.rep] = (sum[l.rep] || 0) + l.amount; });
  var rank = A.r.list.filter(function (o) { return o.active !== false && !o.deleted; }).map(function (o) {
    var amt = sum[o.id] || 0; return { id: o.id, name: o.name, amount: amt, pct: o.target ? Math.round(amt / o.target * 100) : 0 };
  }).sort(function (a, b) { return b.pct - a.pct || b.amount - a.amount; });
  var d = A.d;
  return { ok: true, team: { name: A.t.name, std: (A.t.cfg || {}).std || {} }, me: { id: d.id, name: d.name, zone: d.zone || "", target: d.target || 0, idp: d.idp || [] },
    logs: all.filter(function (l) { return l.rep === d.id; }), rank: rank };
}
function rLog_(q) { var A = repAuth_(q), x = cleanLog_(q.log || {}, A.d.id, "rep"); putLog_(A.t.id, x); return { ok: true, log: x }; }
function rDel_(q) {
  var A = repAuth_(q), mine = logsOf_(A.t.id, "", "", A.d.id).filter(function (l) { return l.id === String(q.id); })[0];
  if (!mine || mine.by !== "rep" || Date.now() - mine.ts > 864e5) return { ok: false, err: "too_old" };
  return { ok: delLog_(A.t.id, q.id, A.d.id) };
}
function rIdp_(q) {
  var A = repAuth_(q), it = (A.d.idp || []).filter(function (t) { return t.id === String(q.id); })[0];
  if (!it) return { ok: false, err: "item" };
  it.done = !!q.done; saveRep_(A.r.sh, A.t.id, A.d); return { ok: true };
}
