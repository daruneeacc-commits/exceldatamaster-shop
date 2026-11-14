/**
 * EDM งบกระแสเงินสด — หลังบ้านเก็บข้อมูลขึ้น Google Drive (แยกโฟลเดอร์ต่อบริษัท)
 * ไฟล์นี้ไม่มีข้อมูลลับ · รหัสผ่านตั้งใน Script Properties (KEY) เท่านั้น
 *
 * วิธีติดตั้ง (ครั้งเดียว)
 * 1) script.google.com › โครงการใหม่ › วางโค้ดนี้แทนทั้งหมด › บันทึก
 * 2) แก้รหัสในฟังก์ชัน setKey() เป็นรหัสของคุณเอง › เลือก setKey › กด ▶ เรียกใช้ (อนุญาตสิทธิ์ Drive) › ลบรหัสในโค้ดออกแล้วบันทึก
 * 3) ทำให้ใช้งานได้ › การทำให้ใช้งานได้รายการใหม่ › ประเภท: เว็บแอป
 *    ดำเนินการในฐานะ: ฉัน · ผู้มีสิทธิ์เข้าถึง: ทุกคน › ทำให้ใช้งานได้ › คัดลอกลิงก์ /exec
 * 4) ในระบบงบกระแสเงินสด กด 🏢 › ☁️ ตั้งค่า Drive › วางลิงก์ /exec + รหัส
 * แก้โค้ดภายหลัง: จัดการการทำให้ใช้งานได้ › ✏️ › เวอร์ชันใหม่ (ลิงก์เดิม)
 */
var ROOT_NAME = 'EDM งบกระแสเงินสด (ห้ามแชร์)';
var KEEP_DAYS = 30;           // เก็บไฟล์ย้อนหลังรายวันกี่วัน
var VERSION = 'cf-drive v1';

function setKey() {
  PropertiesService.getScriptProperties().setProperty('KEY', 'ใส่รหัสของคุณที่นี่');
}

function doGet() {
  return out_({ ok: true, v: VERSION });
}

function doPost(e) {
  try {
    var q = JSON.parse(e.postData.contents || '{}');
    var key = PropertiesService.getScriptProperties().getProperty('KEY');
    if (!key || q.k !== key) { Utilities.sleep(800); return out_({ ok: false, err: 'key' }); }
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      if (q.a === 'save') return out_(save_(q));
      if (q.a === 'list') return out_(list_());
      if (q.a === 'load') return out_(load_(q.id));
      return out_({ ok: false, err: 'action' });
    } finally { lock.releaseLock(); }
  } catch (err) {
    return out_({ ok: false, err: String(err) });
  }
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function root_() {
  var it = DriveApp.getFoldersByName(ROOT_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_NAME);
}

function safe_(s) { return String(s || '').replace(/[\\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) || '(ไม่มีชื่อ)'; }

/** โฟลเดอร์ของบริษัท หาจากรหัสที่เก็บไว้ในคำอธิบายโฟลเดอร์ (เปลี่ยนชื่อบริษัทได้ ไม่สร้างซ้ำ) */
function coFolder_(id, name, create) {
  var r = root_(), it = r.getFolders(), tag = 'cf:' + id;
  while (it.hasNext()) {
    var f = it.next();
    if (f.getDescription() === tag) {
      if (name && f.getName() !== safe_(name)) f.setName(safe_(name));
      return f;
    }
  }
  if (!create) return null;
  var nf = r.createFolder(safe_(name));
  nf.setDescription(tag);
  return nf;
}

function sub_(f, name) {
  var it = f.getFoldersByName(name);
  return it.hasNext() ? it.next() : f.createFolder(name);
}

function writeFile_(folder, name, text) {
  var it = folder.getFilesByName(name);
  if (it.hasNext()) { var f = it.next(); f.setContent(text); return f; }
  return folder.createFile(name, text, MimeType.PLAIN_TEXT);
}

function save_(q) {
  if (!q.id || !q.data) return { ok: false, err: 'data' };
  var text = JSON.stringify(q.data);
  var f = coFolder_(q.id, q.n, true);
  writeFile_(f, 'data.json', text);
  // สำเนารายวัน (ทับไฟล์ของวันเดียวกัน) + ลบที่เก่ากว่า KEEP_DAYS
  var day = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  var h = sub_(f, 'ย้อนหลังรายวัน');
  writeFile_(h, day + '.json', text);
  var cut = new Date(Date.now() - KEEP_DAYS * 864e5), it = h.getFiles();
  while (it.hasNext()) { var x = it.next(); if (x.getDateCreated() < cut) x.setTrashed(true); }
  return { ok: true, at: new Date().toISOString(), folder: f.getUrl() };
}

function list_() {
  var it = root_().getFolders(), L = [];
  while (it.hasNext()) {
    var f = it.next(), d = f.getDescription() || '';
    if (d.indexOf('cf:') !== 0) continue;
    var fi = f.getFilesByName('data.json');
    var at = fi.hasNext() ? fi.next().getLastUpdated().toISOString() : '';
    L.push({ id: d.slice(3), n: f.getName(), at: at });
  }
  return { ok: true, list: L };
}

function load_(id) {
  var f = coFolder_(id, '', false);
  if (!f) return { ok: false, err: 'notfound' };
  var fi = f.getFilesByName('data.json');
  if (!fi.hasNext()) return { ok: false, err: 'notfound' };
  return { ok: true, data: JSON.parse(fi.next().getBlob().getDataAsString()) };
}
