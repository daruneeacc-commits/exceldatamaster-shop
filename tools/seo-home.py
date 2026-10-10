#!/usr/bin/env python3
"""ทำ SEO ให้หน้าแรก (index.html) จากข้อมูลร้านใน <script id="store">
- ใส่ title / description / canonical / Open Graph / JSON-LD ใน <head>
- เรียกซ้ำได้ทุกครั้งที่แก้สินค้า (แทนที่บล็อกเดิมระหว่าง <!--seo--> ... <!--/seo-->)
ใช้: python3 tools/seo-home.py   (แล้วรัน node tools/prerender.js เพื่อเก็บหน้าที่เรนเดอร์แล้วให้ Google อ่าน)"""
import json, re, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
F = ROOT / "index.html"
SITE = "https://exceldatamaster.com"
TITLE = "เทมเพลต Excel และโปรแกรมร้านค้าออนไลน์ เปิดบิล สต๊อก POS | Excel Data Master"
DESC = ("เทมเพลต Excel / Google Sheets พร้อมใช้ และโปรแกรมร้านค้าออนไลน์ เปิดบิล ใบกำกับภาษี สต๊อกสินค้า "
        "POS ร้านกาแฟ ระบบจองห้องพัก คำนวณเงินเดือน ใช้ผ่านเว็บ ไม่ต้องติดตั้ง ทดลองใช้ฟรี 7 วัน")
SYSTEMS = [("/app/", "ระบบร้านค้าออนไลน์ (ครบชุด)", "เปิดบิล ภาษี สต๊อก บัญชี และรายงานในที่เดียว"),
           ("/bill/", "โปรแกรมเปิดบิลออนไลน์", "ใบเสนอราคา ใบแจ้งหนี้ ใบกำกับภาษี ใบเสร็จ ใบวางบิล พิมพ์ A4 / PDF"),
           ("/stock/", "โปรแกรมสต๊อกสินค้าออนไลน์", "รับเข้า เบิกออก ตรวจนับ ต้นทุนเฉลี่ย แจ้งเตือนใกล้หมด"),
           ("/cafe/", "โปรแกรม POS ร้านกาแฟ", "ขายหน้าร้าน คิว จอบาร์ สูตรต่อแก้ว ตัดวัตถุดิบ ปิดกะ"),
           ("/booking/", "ระบบจองห้องพักและให้เช่า", "ปฏิทินห้องว่าง มัดจำ ค่าประกัน ใบเสร็จ จองออนไลน์"),
           ("/account/", "โปรแกรมบัญชีร้านค้า", "กำไรขาดทุน ลูกหนี้ เจ้าหนี้ ภาษีซื้อ-ขาย"),
           ("/payroll/", "โปรแกรมคำนวณเงินเดือน พร้อมสลิป", "ประกันสังคม ภาษีหัก ณ ที่จ่าย OT สลิปเงินเดือน"),
           ("/time/", "โปรแกรมลงเวลาทำงาน ตอกบัตรออนไลน์", "ตอกบัตรเข้า-ออก หลายกะ คิดสาย ขาด ลา OT รายงานตามแผนกและสาขา")]

# ราคาเริ่มต้นต่อ 30 วัน: ระบบเดี่ยว 149 · ร้านค้า (บิล+สต๊อก+บัญชี) 249 · ครบทุกระบบ 349
PRICE = {"/app/": "349", "/account/": "249", "/payroll/": "349"}

def main():
    s = F.read_text(encoding="utf-8")
    a = s.index('<script type="application/json" id="store">') + len('<script type="application/json" id="store">')
    st = json.loads(s[a:s.index("</script>", a)])
    shop = st["shop"]
    abs_ = lambda u: u if u.startswith("http") else SITE + u
    products = [p for p in st["products"] if p.get("type") != "course" and p.get("price")]
    ld = [{
        "@context": "https://schema.org", "@type": "Organization", "name": shop.get("name") or "Excel Data Master",
        "url": SITE + "/", "logo": SITE + "/assets/logo.jpg",
        "sameAs": [x for x in [shop.get("fb")] if x],
        "contactPoint": {"@type": "ContactPoint", "contactType": "customer support", "availableLanguage": ["th"],
                         "url": "https://line.me/R/ti/p/" + (shop.get("line") or "@856tvnxs")}},
        {"@context": "https://schema.org", "@type": "WebSite", "name": "Excel Data Master", "url": SITE + "/", "inLanguage": "th"},
        {"@context": "https://schema.org", "@type": "ItemList", "name": "เทมเพลต Excel และ Google Sheets",
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": {
             "@type": "Product", "name": re.sub(r"^\W+\s*", "", p["name"]).strip(),
             "description": re.sub(r"\s+", " ", str(p.get("desc") or "")).strip()[:300],
             "image": [abs_(x) for x in (p.get("images") or [])[:3]],
             "brand": {"@type": "Brand", "name": "Excel Data Master"},
             "offers": {"@type": "Offer", "price": str(p["price"]), "priceCurrency": "THB",
                        "availability": "https://schema.org/InStock", "url": SITE + "/#shop"}}}
             for i, p in enumerate(products)]}]
    for path, name, d in SYSTEMS:
        ld.append({"@context": "https://schema.org", "@type": "SoftwareApplication", "name": name, "description": d,
                   "url": SITE + path, "applicationCategory": "BusinessApplication", "operatingSystem": "Web, Windows, macOS, Android, iOS",
                   "inLanguage": "th", "offers": {"@type": "Offer", "price": PRICE.get(path, "149"), "priceCurrency": "THB",
                                                  "description": "ทดลองใช้ฟรี 7 วัน แล้ว " + PRICE.get(path, "149") + " บาท / 30 วัน"}})
    e = html.escape
    block = ("<!--seo-->"
             f'<title>{e(TITLE)}</title><meta name="description" content="{e(DESC)}">'
             f'<link rel="canonical" href="{SITE}/"><link rel="icon" href="/assets/logo.jpg"><link rel="apple-touch-icon" href="/assets/logo.jpg">'
             '<meta name="theme-color" content="#127A4B">'
             f'<meta property="og:type" content="website"><meta property="og:site_name" content="Excel Data Master"><meta property="og:locale" content="th_TH">'
             f'<meta property="og:title" content="{e(TITLE)}"><meta property="og:description" content="{e(DESC)}"><meta property="og:url" content="{SITE}/">'
             f'<meta property="og:image" content="{SITE}/assets/shop/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
             f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(TITLE)}"><meta name="twitter:description" content="{e(DESC)}"><meta name="twitter:image" content="{SITE}/assets/shop/og.jpg">'
             + "".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False).replace("</", "<\\/") + "</script>" for x in ld)
             + "<!--/seo-->")
    s = re.sub(r"<!--seo-->.*?<!--/seo-->", "", s, count=1, flags=re.S)
    head_end = s.index("</head>")
    s = s[:head_end] + block + s[head_end:]
    F.write_text(s, encoding="utf-8")
    print("SEO head updated:", len(products), "products")

if __name__ == "__main__":
    main()
