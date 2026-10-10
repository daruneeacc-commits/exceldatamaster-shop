/* เก็บหน้าแรกที่เรนเดอร์แล้วไว้ในไฟล์ index.html ให้ Google อ่านเนื้อหาได้ทันที (สคริปต์หน้าเว็บจะวาดใหม่ทับเหมือนเดิม)
   ใช้: python3 -m http.server 8771 (ที่โฟลเดอร์เว็บ) แล้ว  node tools/prerender.js
   ต้องมี playwright · เรียกซ้ำทุกครั้งที่แก้สินค้าหรือข้อความหน้าแรก */
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const F = path.join(__dirname, "..", "index.html"), URL = process.env.URL || "http://localhost:8771/";
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(URL, { waitUntil: "load" }); await p.waitForTimeout(1200);
  const html = await p.evaluate(() => {
    const app = document.getElementById("app").cloneNode(true);
    app.querySelectorAll("#drawer,#modal,#toast,#scrim,video,script").forEach(x => x.remove());
    return app.innerHTML.replace(/<!--pre-->|<!--\/pre-->/g, "");
  });
  await b.close();
  let s = fs.readFileSync(F, "utf8");
  const re = /<div id="app">(?:<!--pre-->[\s\S]*?<!--\/pre-->)?<\/div>/;
  if (!re.test(s)) throw new Error("ไม่พบ <div id=\"app\"> ใน index.html");
  s = s.replace(re, () => '<div id="app"><!--pre-->' + html.trim() + "<!--/pre--></div>");
  fs.writeFileSync(F, s); console.log("prerendered", Math.round(html.length / 1024), "KB");
})();
