/* EDM Planner · ซิงก์ข้อมูลทั้งบ้าน (24 พ.ย.)
 * วิธีติดตั้ง (ครั้งเดียว): script.google.com → โปรเจกต์ใหม่ → วางโค้ดนี้ → แก้รหัสบ้านใน setKey แล้วกด Run setKey 1 ครั้ง (อนุญาตสิทธิ์)
 * → การทำให้ใช้งานได้ → รายการใหม่ → เว็บแอป · ดำเนินการในฐานะ: ฉัน · ผู้มีสิทธิ์เข้าถึง: ทุกคน → คัดลอกลิงก์ /exec ไปใส่ในหน้าตั้งค่าของแพลนเนอร์
 * ข้อมูลเก็บเป็นไฟล์เดียวใน Google Drive ของเจ้าของ: "EDM Planner ครอบครัว (ห้ามลบ).json" · ไม่มีข้อมูลลับในโค้ดนี้ */
var FILE = 'EDM Planner ครอบครัว (ห้ามลบ).json';
function setKey() { PropertiesService.getScriptProperties().setProperty('KEY', 'ตั้งรหัสบ้านของคุณที่นี่'); }
function doGet() { return out_({ ok: true, app: 'edm-planner-sync', v: 1 }); }
function doPost(e) {
  var o = {}; try { o = JSON.parse(e.postData.contents || '{}'); } catch (x) {}
  var K = PropertiesService.getScriptProperties().getProperty('KEY');
  if (!K || o.key !== K) return out_({ ok: false, msg: 'รหัสบ้านไม่ถูกต้อง' });
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var f = file_();
    if (o.a === 'load') return out_({ ok: true, data: f.getBlob().getDataAsString() || '' });
    if (o.a === 'save') { if (typeof o.data !== 'string' || o.data.length < 10) return out_({ ok: false, msg: 'ข้อมูลว่าง' }); backup_(f); f.setContent(o.data); return out_({ ok: true }); }
    return out_({ ok: false, msg: 'ไม่รู้จักคำสั่ง' });
  } finally { lock.releaseLock(); }
}
function file_() { var it = DriveApp.getFilesByName(FILE); return it.hasNext() ? it.next() : DriveApp.createFile(FILE, ''); }
// สำรองวันละ 1 ไฟล์ เก็บ 14 วัน (กู้คืนได้ถ้ามีคนลบผิด)
function backup_(f) {
  var d = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd'), n = 'สำรอง ' + FILE.replace('.json', '') + ' ' + d + '.json';
  if (DriveApp.getFilesByName(n).hasNext()) return; var c = f.getBlob().getDataAsString(); if (c) DriveApp.createFile(n, c);
  var all = DriveApp.searchFiles('title contains "สำรอง EDM Planner ครอบครัว"'), L = [];
  while (all.hasNext()) L.push(all.next()); L.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  L.slice(14).forEach(function (x) { x.setTrashed(true); });
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
