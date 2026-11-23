/**
 * WebApi.gs — เปิดให้หน้าเว็บ exceldatamaster.com/edm-acc/ เรียกระบบได้ (v0.9.38: สมาชิกสมัครใช้ได้ ข้อมูลแยกต่อคน)
 * (เพิ่มไฟล์นี้ใหม่ ไม่ต้องแก้ไฟล์เดิม · doGet / api เดิมยังใช้ได้เหมือนเดิม)
 *
 * ความปลอดภัยเมื่อเรียกผ่านเว็บ:
 *  1) ต้องมีรหัสเชื่อมต่อ WEB_KEY (สุ่ม 40 ตัว เก็บใน Script Properties · ในเครื่องเจ้าของเท่านั้น)
 *  2) ต้องเข้าสู่ระบบด้วยรหัสผ่านเดิมของระบบ (ผิด 5 ครั้งล็อก 15 นาที เหมือนเดิม)
 *  3) Session Token หมดอายุเมื่อไม่ใช้งาน 2 ชม. เหมือนเดิม
 *  · ห้ามตั้งรหัสผ่านครั้งแรกผ่านเว็บ (ต้องตั้งจากลิงก์เดิมแบบ "เฉพาะฉัน" เท่านั้น)
 *
 * วิธีติดตั้ง:
 *  1) วางไฟล์นี้เป็นไฟล์ใหม่ชื่อ WebApi.gs แล้วกดบันทึก
 *  2) เลือกฟังก์ชัน setWebKey แล้วกด เรียกใช้ → เปิด "บันทึกการดำเนินการ" คัดลอกรหัสเชื่อมต่อ
 *  3) การทำให้ใช้งานได้ → การทำให้ใช้งานได้รายการใหม่ → เว็บแอป
 *     ดำเนินการในฐานะ: ฉัน · ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน → ได้ลิงก์ใหม่ (ลิงก์เดิม "เฉพาะฉัน" ยังอยู่)
 *  4) เปิด exceldatamaster.com/edm-acc/ วางลิงก์ใหม่ + รหัสเชื่อมต่อ ครั้งแรกครั้งเดียว
 *  ปิดการใช้ผ่านเว็บทันที: รันฟังก์ชัน disableWeb
 */
function doPost(e) {
  var b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) { }
  return ContentService.createTextOutput(JSON.stringify(webApi_(b))).setMimeType(ContentService.MimeType.JSON);
}

function webApi_(b) {
  rcClear_(); CTX = { cid: '', ss: null }; SH_OK = {}; HDRGEN = null; TEN = null;
  try {
    var k = props_().getProperty('WEB_KEY');
    if (!k) return fail_('ยังไม่ได้เปิดใช้งานผ่านเว็บ (รันฟังก์ชัน setWebKey ใน Apps Script)', 'NOWEB');
    if (b.mem) return memberApi_(b); // ลูกค้าสมาชิก: ข้อมูลแยกต่อคน ไม่ใช้รหัสเชื่อมต่อ/รหัสผ่านเจ้าของ
    if (k !== 'OPEN' && String(b.key || '') !== k) return fail_('รหัสเชื่อมต่อไม่ถูกต้อง', 'KEY');
    if (b.batch) {
      // หลายคำสั่งในรอบเดียว (หน้าเว็บโหลดเร็วขึ้น) — ตรวจ token ทุกคำสั่ง · ห้ามตั้งรหัสผ่านผ่านเว็บ
      var calls = (b.batch || []).slice(0, 12).filter(function (q) { return q && q[0] !== 'auth.setPassword'; });
      return { ok: true, batch: runBatch_(calls, b.token || '') };
    }
    var action = String(b.action || ''), fn = ROUTES[action];
    if (!fn) return fail_('ไม่พบคำสั่ง: ' + action);
    if (action === 'auth.setPassword') return fail_('ตั้งรหัสผ่านครั้งแรกได้จากลิงก์ Apps Script เดิมเท่านั้น');
    var token = b.token || '';
    if (!PUBLIC_ACTIONS[action] && !checkToken_(token)) return fail_('หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่', 'AUTH');
    var payload = b.payload || {};
    var data = WRITE_ACTIONS[action] ? withLock_(function () { return fn(payload, token); }) : fn(payload, token);
    return { ok: true, data: data };
  } catch (err) {
    console.error('web ' + b.action + ': ' + (err && err.stack ? err.stack : err));
    return fail_(err && err.message ? err.message : String(err));
  }
}

/** สร้างรหัสเชื่อมต่อใหม่ (รันจากตัวแก้ไข) · รหัสเก่าใช้ไม่ได้ทันที */
function setWebKey() {
  var k = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 40);
  props_().setProperty('WEB_KEY', k);
  Logger.log('รหัสเชื่อมต่อ (คัดลอกไปวางในหน้าเว็บ ห้ามส่งให้ใคร): ' + k);
  return k;
}

/** เปิดใช้ผ่านเว็บแบบไม่ต้องมีรหัสเชื่อมต่อ (ยังต้องเข้าสู่ระบบด้วยรหัสผ่าน · ผิด 5 ครั้งล็อก 15 นาที) */
function setWebOpen() {
  props_().setProperty('WEB_KEY', 'OPEN');
  Logger.log('เปิดใช้ผ่านเว็บแล้ว ไม่ต้องใช้รหัสเชื่อมต่อ (ใช้แค่ลิงก์ /exec + รหัสผ่านเข้าระบบ)');
}

/** ปิดการใช้งานผ่านเว็บทันที */
function disableWeb() {
  props_().deleteProperty('WEB_KEY');
  bumpSessionGen_();
  Logger.log('ปิดการใช้งานผ่านเว็บแล้ว');
}


/* =================== สมาชิก (ลูกค้าสมัครผ่าน exceldatamaster.com) ===================
 * - ตัวตนตรวจกับระบบสมาชิกของร้าน (a=check อีเมล + token เดียวกับ member.js) ทุก 5 นาที
 * - ต้องมีสิทธิ์ระบบ edmacc และยังไม่หมดอายุ (สมาชิกแพ็กเดิมที่ไม่ระบุระบบ ไม่ได้สิทธิ์นี้)
 * - ลูกค้าแต่ละคนมีไฟล์หลัก + โฟลเดอร์ของตัวเอง ใน "EDM Accounting ลูกค้า (ห้ามแชร์)/<อีเมล>"
 *   ไม่เห็นข้อมูลของเจ้าของหรือลูกค้าคนอื่น · ห้ามคำสั่งรหัสผ่าน/สำรอง-กู้คืนของเจ้าของ
 */
var MEMBER_SYS = 'edmacc', TEN_ROOT = 'EDM Accounting ลูกค้า (ห้ามแชร์)';
var MEMBER_API_DEF = 'https://script.google.com/macros/s/AKfycbylmvweKvqw7t8snmpWOFm3Gr6TlN4eKZYX5_CCM_MUvwcgROoNkzwBdVb0DPb2Sqi4/exec';
function memberDenied_(a) { return /^(auth|backup)\./.test(a); }

function memberApi_(b) {
  var m = memberAuth_(b.mem || {});
  if (!m.ok) return fail_(m.msg, m.code);
  if (b.batch) {
    var calls = (b.batch || []).slice(0, 12).map(function (q) { return q && !memberDenied_(q[0]) ? q : ['__deny']; });
    var out = runBatch_(calls, '', true); // '__deny' ไม่มีใน ROUTES → ไม่ถูกเรียก
    return { ok: true, batch: out.map(function (r, i) { return calls[i][0] === '__deny' ? fail_('คำสั่งนี้ใช้ได้เฉพาะเจ้าของระบบ', 'FORBIDDEN') : r; }) };
  }
  var action = String(b.action || ''), fn = ROUTES[action];
  if (!fn) return fail_('ไม่พบคำสั่ง: ' + action);
  if (memberDenied_(action)) return fail_('คำสั่งนี้ใช้ได้เฉพาะเจ้าของระบบ', 'FORBIDDEN');
  var payload = b.payload || {};
  return { ok: true, data: WRITE_ACTIONS[action] ? withLock_(function () { return fn(payload, ''); }) : fn(payload, '') };
}

function memberAuth_(m) {
  var email = String(m.email || '').trim().toLowerCase(), tok = String(m.token || '');
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email) || tok.length < 8) return { ok: false, msg: 'กรุณาเข้าสู่ระบบสมาชิก', code: 'MEMBER' };
  var cc = CacheService.getScriptCache(), ck = 'M|' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email + '|' + tok, Utilities.Charset.UTF_8));
  var r = null, v = cc.get(ck);
  if (v) { try { r = JSON.parse(v); } catch (e) { r = null; } }
  if (!r) {
    try {
      var res = UrlFetchApp.fetch(props_().getProperty('MEMBER_API') || MEMBER_API_DEF, { method: 'post', contentType: 'text/plain', payload: JSON.stringify({ a: 'check', email: email, token: tok }), muteHttpExceptions: true, followRedirects: true });
      r = JSON.parse(res.getContentText());
    } catch (e) { return { ok: false, msg: 'ตรวจสอบสมาชิกไม่ได้ ลองใหม่อีกครั้ง', code: 'MEMBERNET' }; }
    if (!r || !r.ok) return { ok: false, msg: (r && r.msg) || 'กรุณาเข้าสู่ระบบสมาชิกใหม่', code: 'MEMBER' };
    r = { ok: true, exp: Number(r.exp || 0), sx: r.sx || null, sys: r.sys == null ? '' : String(r.sys) };
    cc.put(ck, JSON.stringify(r), 300);
  }
  if (!memberHas_(r.sys)) return { ok: false, msg: 'บัญชีนี้ยังไม่ได้เปิดใช้ระบบบัญชี EDM', code: 'MEMBERSYS' };
  var exp = Number((r.sx && r.sx[MEMBER_SYS]) || r.exp || 0);
  if (!exp || exp < Date.now()) return { ok: false, msg: 'หมดอายุการใช้งานระบบบัญชี EDM กรุณาต่ออายุ', code: 'MEMBEREXP' };
  TEN = tenantOpen_(email);
  return { ok: true };
}
/** ต้องระบุระบบ edmacc ชัดเจน (ค่าว่าง = แพ็กเดิมทุกระบบ ไม่รวมระบบนี้) */
function memberHas_(sys) { return String(sys || '').toLowerCase().split(/[\s,|]+/).indexOf(MEMBER_SYS) >= 0; }

/** เปิดข้อมูลของลูกค้า (สร้างไฟล์+โฟลเดอร์ครั้งแรก) */
function tenantOpen_(email) {
  var P = props_(), key = 'T|' + email, t = null;
  try { t = JSON.parse(P.getProperty(key) || 'null'); } catch (e) { t = null; }
  if (!t) {
    withLock_(function () {
      try { t = JSON.parse(P.getProperty(key) || 'null'); } catch (e) { t = null; }
      if (t) return;
      var root = tenantRoot_(), folder = root.createFolder(email);
      var ss = SpreadsheetApp.create('EDM บัญชี – ' + email);
      DriveApp.getFileById(ss.getId()).moveTo(folder);
      t = { ss: ss.getId(), f: folder.getId(), at: now_() };
      P.setProperty(key, JSON.stringify(t));
      TEN = { email: email, fid: t.f, ss: ss };
      Object.keys(SHEETS).forEach(function (n) { if (!CO_SHEETS[n]) sh_(n); });
      ['Sheet1', 'ชีต1', 'แผ่น1'].forEach(function (n) { var d = ss.getSheetByName(n); if (d && ss.getSheets().length > 1) ss.deleteSheet(d); });
      audit_('', 'MEMBER', email, 'CREATE', 'สร้างข้อมูลลูกค้าสมาชิกใหม่'); // บันทึกลงไฟล์ของลูกค้า (TEN ยังชี้ลูกค้าตอนล้างบัฟเฟอร์)
      tenantLog_(email, t);
    });
  }
  return { email: email, fid: t.f, ss: SpreadsheetApp.openById(t.ss) };
}
function tenantRoot_() {
  var P = props_(), id = P.getProperty('TEN_ROOT_ID');
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) { } }
  var it = DriveApp.getFoldersByName(TEN_ROOT), f2 = it.hasNext() ? it.next() : DriveApp.createFolder(TEN_ROOT);
  P.setProperty('TEN_ROOT_ID', f2.getId());
  return f2;
}
/** รายชื่อลูกค้าในไฟล์หลักของเจ้าของ (ชีต "ลูกค้าสมาชิก") ไว้ดูอย่างเดียว */
function tenantLog_(email, t) {
  try {
    var ss = SpreadsheetApp.getActive(), s = ss.getSheetByName('ลูกค้าสมาชิก');
    if (!s) { s = ss.insertSheet('ลูกค้าสมาชิก'); s.getRange(1, 1, 1, 4).setValues([['อีเมล', 'เริ่มใช้', 'ไฟล์ข้อมูล', 'โฟลเดอร์']]).setFontWeight('bold'); }
    s.appendRow([email, t.at, 'https://docs.google.com/spreadsheets/d/' + t.ss, 'https://drive.google.com/drive/folders/' + t.f]);
  } catch (e) { }
}
