/* EDM_I18N สำหรับระบบสต๊อก (5 พ.ย. 2569) — เปลี่ยนภาษาหน้าจอ ไทย / English / 日本語 / 中文 / 한국어
   แปลเฉพาะข้อความของระบบ (ตรงทั้งข้อความ หรือรูปแบบตัวเลข/วันที่) ข้อมูลที่ลูกค้าพิมพ์เองไม่ถูกแปล
   เก็บภาษาที่เลือกใน localStorage edm_lang · ใส่ select ใน header .nav */
(function () {
  var LANGS = [["th", "ไทย"], ["en", "English"], ["ja", "日本語"], ["zh", "中文"], ["ko", "한국어"]], IX = { en: 0, ja: 1, zh: 2, ko: 3 };
  // คำไทย: [en, ja, zh, ko]
  var D = {
    "ระบบสต๊อกสินค้า": ["Stock System", "在庫管理システム", "库存系统", "재고 관리 시스템"],
    "· ระบบสต๊อกสินค้า": ["· Stock System", "· 在庫管理システム", "· 库存系统", "· 재고 관리 시스템"],
    "สำรอง / นำเข้า": ["Backup / Import", "バックアップ / インポート", "备份 / 导入", "백업 / 가져오기"],
    "ระบบร้านค้า": ["Shop System", "店舗システム", "店铺系统", "매장 시스템"],
    "เปิดบิล": ["Billing", "請求書", "开单", "청구서"],
    "บัญชี": ["Accounting", "会計", "会计", "회계"],
    "ร้านเทมเพลต": ["Template Shop", "テンプレートショップ", "模板商店", "템플릿 샵"],
    "ภาพรวม": ["Overview", "概要", "概览", "개요"],
    "แดชบอร์ด": ["Dashboard", "ダッシュボード", "仪表板", "대시보드"],
    "สินค้า": ["Products", "商品", "商品", "상품"],
    "รับเข้า": ["Stock In", "入庫", "入库", "입고"],
    "เบิกออก": ["Stock Out", "出庫", "出库", "출고"],
    "ตรวจนับ": ["Stock Count", "棚卸", "盘点", "재고 실사"],
    "ประวัติ": ["History", "履歴", "记录", "내역"],
    "ต้องสั่งซื้อ": ["To Reorder", "要発注", "需采购", "발주 필요"],
    "รายงาน": ["Report", "レポート", "报表", "보고서"],
    "สินค้าทั้งหมด": ["All products", "全商品", "全部商品", "전체 상품"],
    "รายการ": ["items", "件", "项", "항목"],
    "มูลค่าสต๊อก (ทุน)": ["Stock value (cost)", "在庫金額（原価）", "库存价值（成本）", "재고 가치(원가)"],
    "ใกล้หมด": ["Low stock", "残りわずか", "库存不足", "재고 부족"],
    "หมดสต๊อก": ["Out of stock", "在庫切れ", "缺货", "품절"],
    "รับสินค้าเข้า": ["Receive stock", "商品を入庫", "商品入库", "상품 입고"],
    "เบิก / จ่ายออก": ["Issue / Stock out", "出庫 / 払出", "领用 / 出库", "출고 / 불출"],
    "ตรวจนับสต๊อก": ["Count stock", "在庫を棚卸", "库存盘点", "재고 실사"],
    "ต้องสั่งเพิ่ม": ["Need to reorder", "追加発注が必要", "需要补货", "추가 주문 필요"],
    "คงเหลือ": ["Balance", "残高", "结存", "잔량"],
    "ขั้นต่ำ": ["Minimum", "最低数", "最低量", "최소"],
    "จ่ายออกมากสุด": ["Top stock out", "出庫数トップ", "出库最多", "최다 출고"],
    "ความเคลื่อนไหวล่าสุด": ["Recent movements", "最近の入出庫", "最近变动", "최근 입출고"],
    "ดูทั้งหมด": ["View all", "すべて表示", "查看全部", "전체 보기"],
    "วันที่": ["Date", "日付", "日期", "날짜"],
    "ประเภท": ["Type", "種類", "类型", "유형"],
    "จำนวน": ["Qty", "数量", "数量", "수량"],
    "ทุน/หน่วย": ["Cost/unit", "単価（原価）", "单位成本", "단가(원가)"],
    "คู่ค้า / อ้างอิง": ["Partner / Ref.", "取引先 / 参照", "往来方 / 参考", "거래처 / 참조"],
    "เบิก/ขายออก": ["Out / Sold", "出庫 / 販売", "出库 / 销售", "출고 / 판매"],
    "จากบิล": ["from bill", "請求書から", "来自单据", "청구서에서"],
    "จากใบซื้อ": ["from purchase", "仕入から", "来自采购单", "매입에서"],
    "จากคาเฟ่": ["from café", "カフェから", "来自咖啡店", "카페에서"],
    "ปรับยอด": ["Adjust", "調整", "调整", "조정"],
    "อยากได้ระบบสต๊อกใน Excel หรือ Google Sheets?": ["Want a stock system in Excel or Google Sheets?", "Excel / Googleスプレッドシート版の在庫管理が欲しいですか？", "想要 Excel 或 Google 表格版库存系统吗？", "Excel 또는 Google 시트용 재고 관리가 필요하세요?"],
    "เทมเพลตสต๊อก รับ-จ่าย และรายงานพร้อมใช้": ["Ready-made stock in/out & report templates", "入出庫・レポートのテンプレート", "现成的出入库及报表模板", "입출고·보고서 템플릿"],
    "ดูเทมเพลต": ["View templates", "テンプレートを見る", "查看模板", "템플릿 보기"],
    "แดชบอร์ดสต๊อก": ["Stock Dashboard", "在庫ダッシュボード", "库存仪表板", "재고 대시보드"],
    "สรุปอัตโนมัติจากรายการรับเข้า เบิกออก และใบสั่งซื้อ · เลือกเดือนเพื่อดูยอดเบิกออกรายวันและ Top 20": ["Auto summary from stock in, stock out and POs · choose a month to see daily stock out and Top 20", "入庫・出庫・発注書から自動集計 · 月を選ぶと日別出庫とTop 20を表示", "根据入库、出库和采购单自动汇总 · 选择月份查看每日出库和 Top 20", "입고·출고·발주서 자동 요약 · 월을 선택하면 일별 출고와 Top 20 표시"],
    "เดือน": ["Month", "月", "月份", "월"],
    "ต้นทุนเฉลี่ย": ["Average cost", "平均原価", "平均成本", "평균 원가"],
    "เจ้าหนี้ค้างจ่าย": ["Accounts payable", "買掛金残高", "应付账款", "미지급금"],
    "สถานะสินค้า": ["Product status", "商品ステータス", "商品状态", "상품 상태"],
    "ปกติ": ["Normal", "通常", "正常", "정상"],
    "หมด": ["Out", "在庫切れ", "缺货", "품절"],
    "รับเข้า vs เบิกออก (จำนวน) 12 เดือน": ["Stock in vs out (qty) 12 months", "入庫 vs 出庫（数量）12か月", "入库 vs 出库（数量）12个月", "입고 vs 출고(수량) 12개월"],
    "ดูรายสินค้า": ["By product", "商品別", "按商品", "상품별"],
    "เบิกออกเดือนนี้": ["Stock out this month", "今月の出庫", "本月出库", "이번 달 출고"],
    "เบิกออกทั้งหมด": ["Total stock out", "出庫合計", "出库总计", "전체 출고"],
    "มูลค่าคงเหลือ": ["Remaining value", "残高金額", "结存价值", "잔여 가치"],
    "สัดส่วน": ["Share", "割合", "占比", "비율"],
    "ยอดซื้อจากผู้ขาย 12 เดือน (บาท)": ["Purchases from suppliers, 12 months (THB)", "仕入先からの購入 12か月（バーツ）", "向供应商采购 12个月（泰铢）", "공급업체 매입 12개월(바트)"],
    "มาจากใบสั่งซื้อ/ซื้อสินค้าในระบบบัญชีร้าน (ปุ่ม \"ต้องสั่งซื้อ\" สร้างให้ได้)": ["From POs / purchases in the accounting system (the \"To Reorder\" button can create them)", "会計システムの発注書・仕入から（「要発注」ボタンで作成可）", "来自会计系统的采购单/进货（可用「需采购」按钮创建）", "회계 시스템의 발주서·매입에서 (\"발주 필요\" 버튼으로 생성 가능)"],
    "ผู้ขาย / เจ้าหนี้": ["Suppliers / Payables", "仕入先 / 買掛金", "供应商 / 应付", "공급업체 / 미지급"],
    "ผู้ขาย": ["Supplier", "仕入先", "供应商", "공급업체"],
    "ใบ": ["docs", "件", "张", "건"],
    "ยอดซื้อ": ["Purchases", "購入額", "采购额", "매입액"],
    "ค้างจ่าย": ["Unpaid", "未払", "未付", "미지급"],
    "ทุกหมวด": ["All categories", "全カテゴリ", "全部类别", "전체 카테고리"],
    "ทุกแบรนด์": ["All brands", "全ブランド", "全部品牌", "전체 브랜드"],
    "เพิ่มสินค้า": ["Add product", "商品を追加", "添加商品", "상품 추가"],
    "หมวด": ["Category", "カテゴリ", "类别", "카테고리"],
    "ทุนเฉลี่ย": ["Avg. cost", "平均原価", "平均成本", "평균 원가"],
    "ราคาขาย": ["Price", "販売価格", "售价", "판매가"],
    "มูลค่า": ["Value", "金額", "价值", "가치"],
    "สถานะ": ["Status", "ステータス", "状态", "상태"],
    "แตะที่สินค้าเพื่อดูบัญชีคุมสต๊อก (ประวัติรับ-จ่าย) หรือแก้ไขข้อมูล": ["Tap a product to see its stock card (in/out history) or edit it", "商品をタップすると在庫台帳（入出庫履歴）表示・編集", "点击商品查看库存卡（出入库记录）或编辑", "상품을 눌러 재고 카드(입출고 내역) 보기 또는 수정"],
    "ซื้อสินค้าจากผู้ขาย ให้บันทึกที่": ["To buy from a supplier, record it at", "仕入先からの購入は次で記録：", "向供应商采购请在此记录：", "공급업체 매입은 여기에서 기록:"],
    "ซื้อสินค้า / ค่าใช้จ่าย": ["Purchases / Expenses", "仕入 / 経費", "采购 / 费用", "매입 / 비용"],
    "ระบบจะรับเข้าสต๊อก ตั้งเจ้าหนี้ และลงภาษีซื้อให้ในครั้งเดียว · ช่องนี้ใช้กับการรับเข้าอื่น เช่น ยอดยกมา ของแถม ลูกค้าคืนสินค้า": ["It receives stock, records payables and input VAT at once · use this page for other receipts e.g. opening balance, freebies, customer returns", "入庫・買掛金・仕入税額を一度に記録 · このページはその他の入庫（繰越、おまけ、返品）用", "一次完成入库、应付账款和进项税 · 本页用于其他入库，如期初、赠品、客户退货", "입고·미지급금·매입세를 한 번에 기록 · 이 페이지는 기타 입고(이월, 증정품, 반품)용"],
    "ผู้ขาย / ซัพพลายเออร์": ["Supplier", "仕入先", "供应商", "공급업체"],
    "เลขที่เอกสารอ้างอิง": ["Reference no.", "参照番号", "参考单号", "참조 번호"],
    "ทุน/หน่วย (บาท)": ["Cost/unit (THB)", "単価（バーツ）", "单位成本（泰铢）", "단가(바트)"],
    "เพิ่มบรรทัด": ["Add line", "行を追加", "添加行", "줄 추가"],
    "หมายเหตุ": ["Note", "備考", "备注", "메모"],
    "บันทึกรับเข้า": ["Save stock in", "入庫を保存", "保存入库", "입고 저장"],
    "ประวัติรับเข้า": ["Stock-in history", "入庫履歴", "入库记录", "입고 내역"],
    "ยังไม่มีรายการ": ["No items yet", "まだありません", "暂无记录", "아직 없음"],
    "ขายสินค้าให้เปิดบิลที่ 🧾 เปิดบิล ระบบตัดสต๊อกให้อัตโนมัติ · หน้านี้ใช้สำหรับ": ["Sell via 🧾 Billing — stock is cut automatically · this page is for", "販売は🧾請求書で — 在庫は自動で減ります · このページは", "销售请用 🧾 开单，自动扣库存 · 本页用于", "판매는 🧾 청구서에서 — 재고 자동 차감 · 이 페이지는"],
    "เบิกใช้เองในร้าน ของเสีย/ชำรุด แจกตัวอย่าง หรือคืนผู้ขาย": ["internal use, damaged goods, samples or returns to supplier", "店内使用・破損・サンプル・仕入先への返品", "店内自用、损坏、样品或退货给供应商", "매장 내 사용, 파손, 샘플 또는 공급업체 반품"],
    "ขายสินค้า ให้เปิดบิลที่": ["To sell, create a bill at", "販売は次で請求書を作成：", "销售请在此开单：", "판매는 여기에서 청구서 작성:"],
    "ระบบตัดสต๊อกให้อัตโนมัติ · ช่องนี้ใช้กับการเบิกที่ไม่ใช่การขาย เช่น เบิกใช้ในร้าน ของเสีย ของหาย": ["stock is cut automatically · use this for non-sale stock out e.g. internal use, damaged, lost", "在庫は自動で減ります · 販売以外の出庫（店内使用・破損・紛失）用", "自动扣库存 · 用于非销售出库，如自用、损坏、丢失", "재고 자동 차감 · 판매 외 출고(매장 사용, 파손, 분실)용"],
    "ลูกค้า / ผู้เบิก": ["Customer / Requester", "顧客 / 請求者", "客户 / 领用人", "고객 / 요청자"],
    "บันทึกเบิกออก": ["Save stock out", "出庫を保存", "保存出库", "출고 저장"],
    "ประวัติเบิก / ขายออก": ["Stock-out / sales history", "出庫 / 販売履歴", "出库 / 销售记录", "출고 / 판매 내역"],
    "แก้ที่หน้าเปิดบิล": ["Edit in Billing", "請求書で編集", "在开单中编辑", "청구서에서 수정"],
    "แก้ที่หน้าบัญชี": ["Edit in Accounting", "会計で編集", "在会计中编辑", "회계에서 수정"],
    "ตรวจนับ / ปรับยอด": ["Count / Adjust", "棚卸 / 調整", "盘点 / 调整", "실사 / 조정"],
    "ใส่สินค้าทั้งหมดเพื่อนับ": ["Add all products to count", "全商品を棚卸に追加", "加入全部商品盘点", "전체 상품 실사에 추가"],
    "นับของจริงบนชั้น แล้วใส่จำนวนที่นับได้ ระบบจะเทียบกับยอดในระบบและปรับให้ตรง พร้อมเก็บส่วนต่างไว้ตรวจสอบ": ["Count items on the shelf and enter the counted qty — the system compares, adjusts and keeps the difference for review", "棚の実数を入力 — システムが照合・調整し差異を記録", "清点货架实物并输入数量，系统比对调整并记录差异", "선반 실물 수량 입력 — 시스템이 비교·조정하고 차이를 기록"],
    "ผู้ตรวจนับ": ["Counted by", "棚卸担当", "盘点人", "실사 담당"],
    "นับได้จริง": ["Counted qty", "実数", "实盘数", "실사 수량"],
    "บันทึกการตรวจนับ": ["Save count", "棚卸を保存", "保存盘点", "실사 저장"],
    "ใส่จำนวนที่นับได้จริง ระบบจะปรับยอดคงเหลือให้ตรงและบันทึกส่วนต่างไว้ให้ตรวจสอบย้อนหลัง": ["Enter the counted qty — the balance is adjusted and the difference is logged", "実数を入力 — 残高を調整し差異を記録", "输入实盘数量，系统调整结存并记录差异", "실사 수량 입력 — 잔량 조정 및 차이 기록"],
    "ประวัติปรับยอด": ["Adjustment history", "調整履歴", "调整记录", "조정 내역"],
    "รายการทั้งหมด": ["All entries", "全件", "全部记录", "전체 항목"],
    "เบิก / ขายออก": ["Out / Sold", "出庫 / 販売", "出库 / 销售", "출고 / 판매"],
    "ประวัติความเคลื่อนไหวสต๊อก": ["Stock movement history", "入出庫履歴", "库存变动记录", "재고 변동 내역"],
    "ทุกประเภท": ["All types", "全種類", "全部类型", "전체 유형"],
    "รายการจากบิลขายและใบซื้อ แก้ไขหรือลบได้ที่เอกสารต้นทาง · รายการที่บันทึกเองในหน้าสต๊อกลบได้ที่นี่": ["Entries from bills / purchases are edited at the source document · entries made here can be edited or deleted here", "請求書・仕入の明細は元の書類で編集 · ここで入力した明細はここで編集・削除", "来自单据/采购的记录请在原单据编辑 · 本页录入的可在此编辑或删除", "청구서·매입 항목은 원본에서 수정 · 여기서 입력한 항목은 여기서 수정·삭제"],
    "สั่งแล้ว รอรับของ": ["Ordered, awaiting", "発注済・入荷待ち", "已下单待收货", "주문됨·입고 대기"],
    "ประมาณการสั่งซื้อ": ["Estimated order", "発注見積", "预计采购", "예상 주문액"],
    "สินค้าที่ต้องสั่งซื้อ": ["Products to reorder", "要発注商品", "需采购商品", "발주 필요 상품"],
    "จุดสั่งซื้อ": ["Reorder point", "発注点", "再订货点", "발주점"],
    "สั่งแล้วรอรับ": ["On order", "発注済", "已订未到", "주문 중"],
    "จำนวนสั่ง": ["Order qty", "発注数", "订购数量", "주문 수량"],
    "ราคา/หน่วย": ["Price/unit", "単価", "单价", "단가"],
    "สร้างใบสั่งซื้อ (PO)": ["Create PO", "発注書を作成", "创建采购单", "발주서 생성"],
    "รายงานสต๊อกประจำเดือน": ["Monthly stock report", "月次在庫レポート", "月度库存报表", "월간 재고 보고서"],
    "พิมพ์ / ส่ง PDF": ["Print / PDF", "印刷 / PDF", "打印 / PDF", "인쇄 / PDF"],
    "ดาวน์โหลด Excel": ["Download Excel", "Excelをダウンロード", "下载 Excel", "Excel 다운로드"],
    "ยกมา": ["Opening", "繰越", "期初", "이월"],
    "จ่ายออก": ["Out", "出庫", "出库", "출고"],
    "มูลค่าสต๊อกคงเหลือ ณ สิ้นเดือน": ["Closing stock value", "月末在庫金額", "月末库存价值", "월말 재고 가치"],
    "ต้นทุนคิดแบบถัวเฉลี่ยถ่วงน้ำหนัก (Weighted Average) · ใช้ประกอบรายงานสินค้าคงเหลือและต้นทุนขาย": ["Cost uses Weighted Average · for inventory and cost-of-sales reports", "原価は加重平均法 · 棚卸資産・売上原価の報告用", "成本采用加权平均法 · 用于存货和销售成本报表", "원가는 가중평균법 · 재고 및 매출원가 보고용"],
    "แก้ไข": ["Edit", "編集", "编辑", "수정"],
    "ลบ": ["Delete", "削除", "删除", "삭제"],
    "บันทึก": ["Save", "保存", "保存", "저장"],
    "ยกเลิก": ["Cancel", "キャンセル", "取消", "취소"],
    "แก้ไขแล้ว ✓": ["Saved ✓", "更新しました ✓", "已更新 ✓", "수정됨 ✓"],
    "คู่ค้า / ผู้รับ": ["Partner / Recipient", "取引先 / 受取人", "往来方 / 接收人", "거래처 / 수령인"],
    "เลขที่อ้างอิง": ["Reference no.", "参照番号", "参考单号", "참조 번호"],
    "ทุนต่อหน่วย (บาท)": ["Cost per unit (THB)", "単価（バーツ）", "单位成本（泰铢）", "단가(바트)"],
    "ชื่อสินค้า": ["Product name", "商品名", "商品名称", "상품명"],
    "รหัสสินค้า": ["SKU", "商品コード", "商品编码", "상품 코드"],
    "หน่วยนับ": ["Unit", "単位", "单位", "단위"],
    "แบรนด์": ["Brand", "ブランド", "品牌", "브랜드"],
    "ค้นหาชื่อ รหัส หมวด แบรนด์": ["Search name, SKU, category, brand", "名前・コード・カテゴリ・ブランドで検索", "搜索名称、编码、类别、品牌", "이름·코드·카테고리·브랜드 검색"],
    "เช่น เลขใบส่งของ": ["e.g. delivery note no.", "例：納品書番号", "例如：送货单号", "예: 납품서 번호"],
    "พิมพ์ชื่อหรือรหัสสินค้า": ["Type product name or SKU", "商品名またはコードを入力", "输入商品名称或编码", "상품명 또는 코드 입력"],
    "ลบบรรทัด": ["Remove line", "行を削除", "删除行", "줄 삭제"],
    "เช่น เลขบิล": ["e.g. bill no.", "例：請求書番号", "例如：单据号", "예: 청구서 번호"],
    "ค้นหาสินค้า แบรนด์ คู่ค้า เลขที่": ["Search product, brand, partner, no.", "商品・ブランド・取引先・番号で検索", "搜索商品、品牌、往来方、单号", "상품·브랜드·거래처·번호 검색"],
    "ชื่อผู้ขาย": ["Supplier name", "仕入先名", "供应商名称", "공급업체명"],
    "ยังไม่มีสินค้าในสต๊อก": ["No products in stock yet", "まだ在庫商品がありません", "库存中还没有商品", "아직 재고 상품이 없습니다"],
    "เริ่มเพิ่มสินค้าชิ้นแรก หรือลองดูระบบด้วยข้อมูลตัวอย่าง": ["Add your first product, or try the system with sample data", "最初の商品を追加するか、サンプルデータで試してください", "添加第一个商品，或用示例数据试用", "첫 상품을 추가하거나 샘플 데이터로 체험해 보세요"],
    "ลองใส่ข้อมูลตัวอย่าง": ["Try sample data", "サンプルデータを試す", "试用示例数据", "샘플 데이터 사용"],
    "เดือนนี้รับเข้า": ["This month in", "今月の入庫", "本月入库", "이번 달 입고"],
    "จ่ายออก (ต้นทุน)": ["out (cost)", "出庫（原価）", "出库（成本）", "출고(원가)"],
    "คงเหลือรวม": ["Total balance", "残高合計", "结存合计", "총 잔량"],
    "เบิกออกรายวัน": ["Daily stock out", "日別出庫", "每日出库", "일별 출고"],
    "สินค้าเบิกออก": ["products out", "出庫商品", "出库商品", "출고 상품"],
    "เลือก": ["Selected", "選択", "已选", "선택"],
    "ประมาณ": ["approx.", "約", "约", "약"],
    "(ก่อน VAT)": ["(before VAT)", "（税抜）", "（未含增值税）", "(VAT 별도)"],
    "นับได้น้อยกว่าระบบ": ["Counted less than system by", "システムより少ない", "实盘少于系统", "시스템보다 적음"],
    "นับได้มากกว่าระบบ": ["Counted more than system by", "システムより多い", "实盘多于系统", "시스템보다 많음"],
    "(ในระบบ": ["(system", "（システム", "（系统", "(시스템"],
    "นับได้": ["Counted", "実数", "实盘", "실사"],
    "แก้ไขรายการ": ["Edit entry", "明細を編集", "编辑记录", "항목 수정"],
    "ปรับยอด (+ เพิ่ม / − ลด)": ["Adjust (+ add / − reduce)", "調整（＋増 / −減）", "调整（+ 增 / − 减）", "조정(+ 증가 / − 감소)"],
    "ใช้วันที่ / คู่ค้า / เลขที่อ้างอิง นี้กับอีก": ["Apply this date / partner / ref. to", "この日付・取引先・参照番号を他の", "将此日期/往来方/单号应用于另外", "이 날짜/거래처/참조번호를 다른"],
    "รายการในเอกสารเดียวกัน": ["more entries in the same document", "件にも適用", "条同一单据记录", "개 항목에도 적용"],
    "บัญชีคุมสต๊อก": ["Stock card", "在庫台帳", "库存卡", "재고 카드"],
    "แก้ไขสินค้า": ["Edit product", "商品を編集", "编辑商品", "상품 수정"],
    "รับ": ["In", "入", "入", "입"],
    "จ่าย": ["Out", "出", "出", "출"],
    "ภาษา": ["Language", "言語", "语言", "언어"]
  };
  var UNIT = { "รายการ": ["items", "件", "项", "개 항목"], "ครั้ง": ["times", "回", "次", "회"], "หน่วย": ["units", "個", "件", "개"], "สินค้า": ["products", "商品", "种商品", "개 상품"], "ผู้ขาย": ["suppliers", "社", "家供应商", "개 업체"], "ใบ": ["docs", "件", "张", "건"] };
  var MS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  var MF = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  var EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function yr(y) { y = +y; if (y < 100) y += 2500; return y > 2400 ? y - 543 : y; }
  var SHORT = false;
  function ym(L, m, y) { y = yr(y); if (SHORT) return L === "en" ? EN[m] : L === "ko" ? (m + 1) + "월" : (m + 1) + "月"; return L === "en" ? EN[m] + " " + y : L === "ko" ? y + "년 " + (m + 1) + "월" : y + "年" + (m + 1) + "月"; }
  function ymd(L, d, m, y) { y = yr(y); return L === "en" ? d + " " + EN[m] + " " + y : L === "ko" ? y + "년 " + (m + 1) + "월 " + d + "일" : y + "年" + (m + 1) + "月" + d + "日"; }
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  var reMS = new RegExp("(\\d{1,2}) (" + MS.map(esc).join("|") + ") (\\d{2,4})", "g"), reM = new RegExp("(" + MS.map(esc).join("|") + ") (\\d{2,4})", "g"), reMF = new RegExp("(" + MF.join("|") + ") (\\d{4})", "g");
  var lang = "th"; try { lang = localStorage.getItem("edm_lang") || "th"; } catch (e) {}
  if (!LANGS.some(function (l) { return l[0] === lang; })) lang = "th";
  function tr(s) {
    var k = IX[lang]; if (k == null || !/[฀-๿]/.test(s)) return s;
    var m = /^(\s*)([^\u0E00-\u0E7F\w"(\u0E3F]*)(.*?)(\s*→?\s*)$/.exec(s), pre = m[1] + m[2], core = m[3], post = m[4];
    if (D[core]) return pre + D[core][k] + post;
    var u = /^([\d,.\-−+]+)\s+(\S+)$/.exec(core); if (u && UNIT[u[2]]) return pre + u[1] + " " + UNIT[u[2]][k] + post;
    var out = core.replace(reMS, function (_, d, mo, y) { return ymd(lang, d, MS.indexOf(mo), y); }).replace(reM, function (_, mo, y) { return ym(lang, MS.indexOf(mo), y); }).replace(reMF, function (_, mo, y) { return ym(lang, MF.indexOf(mo), y); });
    // ข้อความผสมที่มีตัวเลข/วันที่ — แทนเป็นวลี (เรียงยาวก่อน)
    if (/[\d฿·]/.test(out)) PH.forEach(function (p) { out = out.split(p[0]).join(p[1][k]); });   // เฉพาะข้อความระบบที่มีตัวเลข/ยอดเงิน ไม่แตะชื่อสินค้า
    return pre + out + post;
  }
  var PH = Object.keys(D).filter(function (w) { return w.length >= 4; }).sort(function (a, b) { return b.length - a.length; }).map(function (w) { return [w, D[w]]; })
    .concat(Object.keys(UNIT).map(function (w) { return [" " + w, UNIT[w].map(function (x) { return " " + x; })]; }));
  var busy = false, ORIG = "__th";
  function skip(el) { return !el || el.closest("script,style,textarea,input,select,[contenteditable],.edm-gate,.edm-noi18n"); }
  function doNode(n) {
    if (n.nodeType === 3) { if (skip(n.parentElement)) return; if (n[ORIG] == null) n[ORIG] = n.nodeValue; SHORT = !!n.parentElement.closest("svg"); var v = lang === "th" ? n[ORIG] : tr(n[ORIG]); SHORT = false; if (n.nodeValue !== v) n.nodeValue = v; return; }
    if (n.nodeType !== 1 || n.matches("script,style,.edm-gate,.edm-noi18n")) return;
    ["placeholder", "title"].forEach(function (a) { if (!n.hasAttribute(a)) return; var key = "__th_" + a; if (n[key] == null) n[key] = n.getAttribute(a); var v = lang === "th" ? n[key] : tr(n[key]); if (n.getAttribute(a) !== v) n.setAttribute(a, v); });
    var w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), x;
    while ((x = w.nextNode())) { if (x.nodeType === 3) doNode(x); else if (x.hasAttribute && (x.hasAttribute("placeholder") || x.hasAttribute("title"))) doNode(x); }
  }
  function run(root) { busy = true; try { doNode(root || document.body); } finally { busy = false; } }
  var mo = new MutationObserver(function (ms) {
    if (busy) return; busy = true;
    try { ms.forEach(function (m) { if (m.type === "characterData") { var n = m.target; if (n[ORIG] != null && n.nodeValue !== (lang === "th" ? n[ORIG] : tr(n[ORIG]))) { n[ORIG] = n.nodeValue; } doNode(n); } else m.addedNodes.forEach(doNode); }); } finally { busy = false; }
  });
  function picker() {
    var nav = document.querySelector("header .nav"); if (!nav || document.getElementById("edmLang")) return;
    var s = document.createElement("select"); s.id = "edmLang"; s.className = "btn sm ghost edm-noi18n"; s.title = "Language / ภาษา"; s.style.cssText = "padding:4px 8px;cursor:pointer";
    s.innerHTML = LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === lang ? " selected" : "") + ">🌐 " + l[1] + "</option>"; }).join("");
    s.onchange = function () { lang = s.value; try { localStorage.setItem("edm_lang", lang); } catch (e) {} document.documentElement.lang = lang; run(); };
    nav.insertBefore(s, nav.firstChild);
  }
  function start() { picker(); document.documentElement.lang = lang; run(); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.EDM_I18N = { tr: tr, lang: function () { return lang; }, run: run };
})();
