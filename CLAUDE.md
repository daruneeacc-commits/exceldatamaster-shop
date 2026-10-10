# Excel Data Master — กฎการทำงาน

- ตอบเป็นภาษาไทยเสมอ ตอบสั้น กระชับ
- ทุกครั้งที่แก้: เพิ่ม `?v=` ของไฟล์ที่เปลี่ยน + อัปเดต `app/version.json` และ `var APP_V` ใน `app/index.html` ให้ตรงกัน แล้ว commit/push
- ห้ามใส่ admin key หรือลิงก์ลับในหน้าเว็บหรือ repo
- ประหยัดโควตา: อ่านเฉพาะส่วนไฟล์ที่ต้องแก้ (ใช้ Grep หาก่อน) ไม่ทดสอบทั้งระบบถ้าไม่ได้ขอ ไม่ใช้ subagent ถ้าไม่ได้ขอ

## แผนที่โปรเจกต์ (GitHub Pages: exceldatamaster.com)
- `index.html` หน้าร้าน/หน้าหลัก (มี SEO + prerender: `tools/seo-home.py`, `tools/prerender.js`)
- `app/` เชลล์ระบบออนไลน์ (เมนู, iframe ระบบย่อย) · `app/edition.js` รุ่นแยก (bill, stock, cafe, book)
- `bill/` เปิดบิล/ใบกำกับภาษี/CN/DN · `account/` VAT, ลูกหนี้, 50 ทวิ · `payroll/` เงินเดือน/ประกันสังคม
- `cafe/` POS คาเฟ่ (ข้อมูลแยก edm_cafe_*) · `booking/` จองห้องพัก
- `assets/icons.js` ไอคอน · `assets/member.js` ซิงก์คลาวด์ · ข้อมูลเก็บใน localStorage (edm_*)
- ทดสอบ: `python3 -m http.server 8772` + Playwright
