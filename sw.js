/* โหมดออฟไลน์ของระบบร้านค้า Excel Data Master
 * - หน้าเว็บ (HTML): ดึงจากเน็ตก่อน ถ้าเน็ตหลุดใช้หน้าที่เก็บไว้ล่าสุด
 * - ไฟล์ประกอบ (js รูป ฟอนต์ในเว็บ): ใช้ที่เก็บไว้ก่อน แล้วอัปเดตเบื้องหลัง (ไฟล์ที่มี ?v= ใหม่จะโหลดใหม่เสมอ)
 * - ไม่ยุ่งกับการเรียก Apps Script / เว็บอื่น / การส่งข้อมูล (POST) และไม่เก็บ version.json
 * ข้อมูลร้านยังอยู่ใน localStorage ของเครื่อง ไฟล์นี้เก็บเฉพาะหน้าเว็บ */
const CACHE = "edm-offline-v1";
const CORE = ["/app/", "/cafe/", "/stock/", "/assets/vendor/qrcode.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("edm-offline-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function put(req, res) {
  if (res && res.ok && res.type === "basic") { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)).catch(() => {}); }
  return res;
}
function offlinePage() {
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui,sans-serif;padding:40px 20px;text-align:center;color:#0F1513"><h2>ออฟไลน์อยู่</h2><p>หน้านี้ยังไม่เคยเปิดตอนมีเน็ตในเครื่องนี้<br>ต่อเน็ตแล้วเปิดอีกครั้ง หลังจากนั้นจะใช้ออฟไลน์ได้</p><button onclick="location.reload()" style="padding:10px 20px;border-radius:999px;border:0;background:#127A4B;color:#fff;font-size:16px">ลองใหม่</button></body>', { status: 503, headers: { "content-type": "text/html; charset=utf-8" } });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/app/version.json" || url.pathname === "/sw.js") return;
  const isPage = req.mode === "navigate" || req.destination === "document" || req.destination === "iframe";
  if (isPage) {
    e.respondWith(
      fetch(req).then((res) => put(req, res)).catch(() =>
        caches.match(req).then((m) => m || caches.match(url.pathname, { ignoreSearch: true })).then((m) => m || offlinePage())
      )
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => put(req, res)).catch(() => hit || caches.match(req, { ignoreSearch: true }));
      return hit || net;
    })
  );
});
