/**
 * WebApi.gs — เปิดให้หน้าเว็บ exceldatamaster.com/edm-acc/ เรียกระบบได้
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
  rcClear_(); CTX = { cid: '', ss: null }; SH_OK = {};
  try {
    var k = props_().getProperty('WEB_KEY');
    if (!k) return fail_('ยังไม่ได้เปิดใช้งานผ่านเว็บ (รันฟังก์ชัน setWebKey ใน Apps Script)', 'NOWEB');
    if (String(b.key || '') !== k) return fail_('รหัสเชื่อมต่อไม่ถูกต้อง', 'KEY');
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

/** ปิดการใช้งานผ่านเว็บทันที */
function disableWeb() {
  props_().deleteProperty('WEB_KEY');
  bumpSessionGen_();
  Logger.log('ปิดการใช้งานผ่านเว็บแล้ว');
}
