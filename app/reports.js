/* ศูนย์รายงาน: รวมรายงานของทุกเมนู เลือกช่วงวันที่ พิมพ์ / PDF / Excel
   ใช้ตัวช่วยจากสคริปต์หลักของหน้า /app/ ($, $$, LS, calcDoc, docStatus, fmt, esc, thD, today, go, toast) */
(function(){
const COST_CATS=["ต้นทุนบริการ / ค่าจ้างเหมาช่วง","วัตถุดิบ / วัสดุใช้ในงาน"];
const NOT_EXP=["จ่ายเงินเดือน","ถอนใช้ส่วนตัว","ชำระภาษี","คืนเงินกู้","โอนระหว่างบัญชี"],NOT_INC=["เงินลงทุนเพิ่ม","เงินกู้ยืม","โอนระหว่างบัญชี"];
const TN={QT:"ใบเสนอราคา",IV:"ใบแจ้งหนี้",IT:"ใบแจ้งหนี้/ใบกำกับ",RC:"ใบเสร็จรับเงิน",TX:"ใบกำกับ/ใบเสร็จ",BN:"ใบวางบิล"};
const r2=n=>Math.round((n+Number.EPSILON)*100)/100,r4=n=>Math.round(n*1e4)/1e4;
const n=v=>{v=parseFloat(String(v==null?"":v).replace(/,/g,""));return isFinite(v)?v:0};
const days=(a,b)=>Math.round((new Date(a)-new Date(b))/864e5);
const isCostP=p=>p.kind==="stock"||(p.kind==="expense"&&COST_CATS.includes(p.cat));
const calcPur=p=>calcDoc({items:(p.lines||[]).map(l=>({q:l.q,p:l.p})),vat:p.vat,wht:p.wht,billDisc:0});
const isInv=d=>d.type==="IV"||(d.type==="IT"&&d.term!=="cash");
const NB="(ไม่ระบุแบรนด์)";

function data(){const A=LS.get("edm_acc",{})||{};const X={docs:LS.get("edm_bill_docs",[])||[],A,pay:A.pay||[],pur:A.pur||[],cash:A.cash||[],accs:A.accounts||[],
  items:LS.get("edm_stock_items",[])||[],tx:LS.get("edm_stock_tx",[])||[],svcs:LS.get("edm_services",[])||[],custs:LS.get("edm_bill_customers",[])||[],sups:LS.get("edm_suppliers",[])||[],seller:LS.get("edm_bill_seller",{})||{}};
  X.byId={};X.items.forEach(i=>X.byId[i.id]=i);X.lb=l=>l.brand||(l.pid&&X.byId[l.pid]||{}).brand||"";X.pin=X.pay.filter(p=>p.dir==="in");X.pout=X.pay.filter(p=>p.dir==="out");
  const inv=new Set(X.docs.filter(d=>d.type==="IV"||d.type==="IT").map(d=>d.no));
  X.sales=X.docs.filter(d=>d.type==="IV"||d.type==="IT"||((d.type==="RC"||d.type==="TX")&&!(d.ref&&inv.has(d.ref))));
  X.docNo=id=>{const d=X.docs.find(x=>x.id===id);return d?d.no:""};X.pu=id=>X.pur.find(x=>x.id===id);X.acc=id=>(X.accs.find(a=>a.id===id)||{}).name||"";
  return X}
// ยอดที่รับชำระแล้วของใบแจ้งหนี้ ณ วันที่กำหนด
function arGot(X,d,upto){let g=X.pin.filter(p=>p.docId===d.id&&(!upto||p.date<=upto)).reduce((a,p)=>a+n(p.amount)+n(p.wht),0);
  X.docs.forEach(x=>{if((x.type==="RC"||x.type==="TX")&&x.ref===d.no&&!X.pin.some(p=>p.rcDocId===x.id)&&(!upto||x.date<=upto))g+=calcDoc(x).total});return r2(g)}
function apPaid(X,p,upto){return r2(X.pout.filter(y=>y.purId===p.id&&(!upto||y.date<=upto)).reduce((a,y)=>a+n(y.amount)+n(y.wht),0))}
function moves(X){const L=[];
  X.pay.forEach(p=>{let label,party="";if(p.dir==="in"){const d=X.docs.find(x=>x.id===p.docId);label=(p.src==="bill"?"ขายเงินสด ":"รับชำระ ")+(d?d.no:"");party=d&&d.cust?d.cust.name:""}else{const u=X.pu(p.purId);label="จ่าย "+(u?u.no:"");party=u&&u.sup?u.sup.name:""}
    L.push({date:p.date,acc:p.accId,amt:p.dir==="in"?n(p.amount):-n(p.amount),label,party,note:p.src==="bill"?(p.method||""):(p.note||"")})});
  X.cash.forEach(c=>L.push({date:c.date,acc:c.accId,amt:c.dir==="in"?n(c.amount):-n(c.amount),label:c.cat||"",party:"",note:c.note||""}));
  return L.sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function stockRun(X,upto){const S={};X.items.forEach(i=>S[i.id]={bal:0,avg:n(i.cost)});const cogs=[];
  X.tx.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||(a.ts||0)-(b.ts||0)).forEach(t=>{if(upto&&t.date>upto)return;const s=S[t.pid];if(!s)return;const q=n(t.qty);
    if(t.type==="in"){const c=n(t.cost)||s.avg;const nb=s.bal+q;s.avg=nb>0?r4((Math.max(s.bal,0)*s.avg+q*c)/(Math.max(s.bal,0)+q)):c;s.bal=r4(nb)}
    else if(t.type==="out"){cogs.push({date:t.date,v:q*s.avg});s.bal=r4(s.bal-q)}else s.bal=r4(s.bal+q)});return{S,cogs}}

/* ---------- นิยามรายงาน: cols [หัว, คีย์, ชนิด d=วันที่ n=เงิน q=จำนวน s=ข้อความ, รวม?] ---------- */
const G=[
 {k:"mst",g:"ข้อมูลหลัก",ic:"🗂️",L:[
  {id:"custlist",t:"ทะเบียนลูกค้า",d:"รายชื่อลูกค้า เลขผู้เสียภาษี ที่อยู่ ยอดขาย และยอดค้างรับ",nodate:1,run:X=>({cols:[["ลูกค้า","name"],["เลขผู้เสียภาษี","tax"],["สาขา","branch"],["ผู้ติดต่อ","contact"],["ที่อยู่","addr"],["ยอดขายรวม","sale","n",1],["ค้างรับ","left","n",1]],
    rows:X.custs.map(c=>{const ds=X.sales.filter(d=>d.cust&&d.cust.name===c.name);let left=0;ds.filter(isInv).forEach(d=>left+=Math.max(0,calcDoc(d).total-arGot(X,d)));return Object.assign({},c,{sale:ds.reduce((a,d)=>a+calcDoc(d).net,0),left:r2(left)})})})},
  {id:"suplist",t:"ทะเบียนเจ้าหนี้",d:"รายชื่อผู้ขาย เลขผู้เสียภาษี ยอดซื้อ และยอดค้างจ่าย",nodate:1,run:X=>{const seen=new Set(X.sups.map(s=>s.name)),L=X.sups.slice();X.pur.forEach(p=>{const nm=p.sup&&p.sup.name;if(nm&&!seen.has(nm)){seen.add(nm);L.push({name:nm,tax:p.sup.tax||"",branch:p.sup.branch||""})}});
    return{cols:[["เจ้าหนี้ / ผู้ขาย","name"],["เลขผู้เสียภาษี","tax"],["สาขา","branch"],["ผู้ติดต่อ","contact"],["บัญชีรับโอน","bank"],["ยอดซื้อรวม","buy","n",1],["ค้างจ่าย","left","n",1]],
    rows:L.map(s=>{const ps=X.pur.filter(p=>p.sup&&p.sup.name===s.name&&p.status!=="ordered");let b=0,l=0;ps.forEach(p=>{const t=calcPur(p).total;b+=t;l+=Math.max(0,t-apPaid(X,p))});return Object.assign({},s,{buy:r2(b),left:r2(l)})})}}},
  {id:"pricelist",t:"รายการสินค้า / บริการ และราคา",d:"ราคาขาย ต้นทุน หน่วย ของสินค้าและบริการทั้งหมด",nodate:1,run:X=>({cols:[["ประเภท","k"],["รหัส","sku"],["ชื่อ","name"],["แบรนด์","brand"],["หมวด","cat"],["หน่วย","unit"],["ต้นทุน","cost","n"],["ราคาขาย","price","n"],["กำไรต่อหน่วย","gp","n"]],
    rows:X.items.map(i=>({k:"สินค้า",sku:i.sku,name:i.name,brand:i.brand,cat:i.cat,unit:i.unit,cost:n(i.cost),price:n(i.price),gp:r2(n(i.price)-n(i.cost))})).concat(X.svcs.map(s=>({k:"บริการ",name:s.name,unit:s.unit,cat:s.note,price:n(s.price),cost:"",gp:""})))})}]},
 {k:"inc",g:"รายรับ",ic:"💰",L:[
  {id:"bills",t:"รายงานบิลทั้งหมด",d:"บิลทุกใบ ค้นหา ดู แก้ไข หรือลบบิลได้",link:"bills"},
  {id:"qt",t:"รายงานใบเสนอราคา",d:"ใบเสนอราคาที่ออก และสถานะว่าแปลงเป็นใบแจ้งหนี้แล้วหรือยัง",run:(X,f,t)=>({cols:[["วันที่","date","d"],["เลขที่","no"],["ลูกค้า","cust"],["ยืนราคาถึง","due","d"],["สถานะ","st"],["มูลค่ารวม","net","n",1]],
    rows:X.docs.filter(d=>d.type==="QT"&&d.date>=f&&d.date<=t).map(d=>{const cv=X.docs.find(x=>x.ref===d.no&&x.type!=="QT");return{date:d.date,no:d.no,cust:d.cust&&d.cust.name,due:d.due,st:cv?"แปลงเป็น "+cv.no:(d.due&&d.due<today()?"หมดอายุ":"รอตอบรับ"),net:calcDoc(d).net}})})},
  {id:"inv",t:"รายงานใบแจ้งหนี้ / ขายเชื่อ",d:"ใบแจ้งหนี้ทั้งหมด ยอดก่อน VAT ภาษี ยอดรับแล้ว และค้างชำระ",run:(X,f,t)=>({cols:[["วันที่","date","d"],["เลขที่","no"],["ลูกค้า","cust"],["ครบกำหนด","due","d"],["ก่อน VAT","base","n",1],["VAT","vat","n",1],["ยอดสุทธิ","net","n",1],["รับแล้ว","got","n",1],["ค้างชำระ","left","n",1],["สถานะ","st"]],
    rows:X.docs.filter(d=>isInv(d)&&d.date>=f&&d.date<=t).map(d=>{const c=calcDoc(d),g=Math.min(c.total,arGot(X,d)),l=r2(c.total-g);return{date:d.date,no:d.no,cust:d.cust&&d.cust.name,due:d.due,base:c.base,vat:c.vat,net:c.net,got:g,left:l,st:l<=.01?"รับครบ":(d.due||d.date)<today()?"เกินกำหนด":g>0?"รับบางส่วน":"ค้างชำระ"}})})},
  {id:"bn",t:"รายงานใบวางบิล",d:"ใบวางบิลที่ออก จำนวนใบแจ้งหนี้ และกำหนดชำระ",run:(X,f,t)=>({cols:[["วันที่","date","d"],["เลขที่","no"],["ลูกค้า","cust"],["จำนวนใบแจ้งหนี้","cnt","q"],["กำหนดชำระ","due","d"],["ยอดวางบิล","net","n",1]],
    rows:X.docs.filter(d=>d.type==="BN"&&d.date>=f&&d.date<=t).map(d=>({date:d.date,no:d.no,cust:d.cust&&d.cust.name,cnt:(d.items||[]).filter(i=>i.d).length,due:d.due,net:calcDoc(d).net}))})},
  {id:"rc",t:"รายงานใบเสร็จรับเงิน / ขายเงินสด",d:"บิลขายเงินสดและใบเสร็จจากการรับชำระ",run:(X,f,t)=>({cols:[["วันที่","date","d"],["เลขที่","no"],["ประเภท","k"],["ลูกค้า","cust"],["อ้างอิง","ref"],["ก่อน VAT","base","n",1],["VAT","vat","n",1],["ยอดรวม","net","n",1]],
    rows:X.docs.filter(d=>(d.type==="RC"||d.type==="TX"||(d.type==="IT"&&d.term==="cash"))&&d.date>=f&&d.date<=t).map(d=>{const c=calcDoc(d);return{date:d.date,no:d.no,k:d.ref?"รับชำระ":"ขายเงินสด",cust:d.cust&&d.cust.name,ref:d.ref,base:c.base,vat:c.vat,net:c.net}})})},
  {id:"rcv",t:"รายงานการรับชำระจากลูกหนี้",d:"เงินที่รับจากลูกค้าตามใบแจ้งหนี้ เข้าบัญชีไหน หักภาษี ณ ที่จ่ายเท่าไร",run:(X,f,t)=>({cols:[["วันที่","date","d"],["ลูกค้า","cust"],["ใบแจ้งหนี้","doc"],["วิธีรับ","m"],["เข้าบัญชี","acc"],["ภาษีถูกหัก ณ ที่จ่าย","wht","n",1],["รับจริง","amt","n",1]],
    rows:X.pin.filter(p=>p.src!=="bill"&&p.date>=f&&p.date<=t).map(p=>{const d=X.docs.find(x=>x.id===p.docId);return{date:p.date,cust:d&&d.cust&&d.cust.name,doc:d?d.no:"",m:p.method||"",acc:X.acc(p.accId),wht:n(p.wht),amt:n(p.amount)}})})},
  {id:"aging",t:"ลูกหนี้คงค้าง (แยกอายุหนี้)",d:"ยอดค้างรับ ณ วันสิ้นงวด แยกยังไม่ถึงกำหนด / เกิน 1-30 / 31-60 / 61-90 / เกิน 90 วัน",asof:1,run:(X,f,t)=>({cols:[["ลูกค้า","cust"],["เลขที่","no"],["วันที่","date","d"],["ครบกำหนด","due","d"],["ยังไม่ถึงกำหนด","b0","n",1],["1-30 วัน","b1","n",1],["31-60 วัน","b2","n",1],["61-90 วัน","b3","n",1],["เกิน 90 วัน","b4","n",1],["รวมค้าง","left","n",1]],
    rows:X.docs.filter(d=>isInv(d)&&d.date<=t).map(d=>{const l=r2(calcDoc(d).total-arGot(X,d,t));if(l<=.01)return null;const od=days(t,d.due||d.date),r={cust:d.cust&&d.cust.name,no:d.no,date:d.date,due:d.due,left:l,b0:"",b1:"",b2:"",b3:"",b4:""};r[od<=0?"b0":od<=30?"b1":od<=60?"b2":od<=90?"b3":"b4"]=l;return r}).filter(Boolean).sort((a,b)=>String(a.cust).localeCompare(String(b.cust),"th")||a.date.localeCompare(b.date))})},
  {id:"salecust",t:"ยอดขายตามลูกค้า",d:"สรุปยอดขายแต่ละราย พร้อมสัดส่วน",run:(X,f,t)=>{const M={};X.sales.filter(d=>d.date>=f&&d.date<=t).forEach(d=>{const k=d.cust&&d.cust.name||"ขายเงินสด (ไม่ระบุชื่อ)",c=calcDoc(d);const m=M[k]||(M[k]={cust:k,cnt:0,base:0,vat:0,net:0});m.cnt++;m.base+=c.base;m.vat+=c.vat;m.net+=c.net});
    const L=Object.values(M).sort((a,b)=>b.base-a.base),T=L.reduce((a,x)=>a+x.base,0);L.forEach(x=>x.pc=T?r2(x.base/T*100):0);return{cols:[["ลูกค้า","cust"],["จำนวนเอกสาร","cnt","q",1],["ก่อน VAT","base","n",1],["VAT","vat","n",1],["รวม","net","n",1],["สัดส่วน %","pc","q"]],rows:L}}},
  {id:"saleitem",t:"ยอดขายตามสินค้า / บริการ",d:"ขายอะไรไปเท่าไร จำนวนและมูลค่าแต่ละรายการ",run:(X,f,t)=>{const M={};X.sales.filter(d=>d.date>=f&&d.date<=t).forEach(d=>(d.items||[]).forEach(i=>{if(!i.d)return;const k=i.d;const m=M[k]||(M[k]={item:k,brand:X.lb(i),unit:i.u||"",q:0,amt:0});m.q+=n(i.q);m.amt+=r2(n(i.q)*n(i.p)-n(i.disc))}));
    const L=Object.values(M).sort((a,b)=>b.amt-a.amt),T=L.reduce((a,x)=>a+x.amt,0);L.forEach(x=>{x.avg=x.q?r2(x.amt/x.q):0;x.pc=T?r2(x.amt/T*100):0});return{cols:[["สินค้า / บริการ","item"],["แบรนด์","brand"],["จำนวน","q","q",1],["หน่วย","unit"],["ราคาเฉลี่ย","avg","n"],["มูลค่าขาย","amt","n",1],["สัดส่วน %","pc","q"]],rows:L,note:"มูลค่าตามราคาในบิล ก่อนหักส่วนลดท้ายบิล"}}},
  {id:"salebrand",t:"ยอดขายตามแบรนด์",d:"แบรนด์ไหนขายดี จำนวนชิ้น ยอดขาย ต้นทุน และกำไรขั้นต้นของแต่ละแบรนด์",run:(X,f,t)=>{const M={},R=stockRun(X,t);X.sales.filter(d=>d.date>=f&&d.date<=t&&d.mode!=="service").forEach(d=>(d.items||[]).forEach(i=>{if(!i.d)return;const k=X.lb(i)||NB;const m=M[k]||(M[k]={brand:k,items:new Set(),q:0,amt:0,cost:0});m.items.add(i.d);m.q+=n(i.q);m.amt+=r2(n(i.q)*n(i.p)-n(i.disc));const s=i.pid&&R.S[i.pid];m.cost+=n(i.q)*(s?s.avg:n((X.byId[i.pid]||{}).cost))}));
    const L=Object.values(M).map(m=>({brand:m.brand,cnt:m.items.size,q:m.q,amt:r2(m.amt),cost:r2(m.cost),gp:r2(m.amt-m.cost)})).sort((a,b)=>b.amt-a.amt),T=L.reduce((a,x)=>a+x.amt,0);L.forEach(x=>{x.gpp=x.amt?r2(x.gp/x.amt*100):0;x.pc=T?r2(x.amt/T*100):0});
    return{cols:[["แบรนด์","brand"],["จำนวนรายการสินค้า","cnt","q"],["จำนวนที่ขาย","q","q",1],["ยอดขาย","amt","n",1],["ต้นทุนโดยประมาณ","cost","n",1],["กำไรขั้นต้น","gp","n",1],["% กำไร","gpp","q"],["สัดส่วนยอดขาย %","pc","q"]],rows:L,note:"เฉพาะบิลขายสินค้า · ต้นทุนตามต้นทุนถัวเฉลี่ยในสต๊อก"}}}]},
 {k:"exp",g:"รายจ่าย",ic:"🛒",L:[
  {id:"cost",t:"รายงานต้นทุนสินค้า / บริการ",d:"ซื้อสินค้าเข้าสต๊อก และต้นทุนบริการ / ค่าจ้างเหมา",run:(X,f,t)=>({cols:[["วันที่","date","d"],["เลขที่","no"],["ผู้ขาย","sup"],["ประเภท","k"],["ก่อน VAT","base","n",1],["VAT","vat","n",1],["รวม","total","n",1],["ค้างจ่าย","left","n",1]],
    rows:X.pur.filter(p=>isCostP(p)&&p.status!=="ordered"&&p.date>=f&&p.date<=t).map(p=>{const c=calcPur(p);return{date:p.date,no:p.no,sup:p.sup&&p.sup.name,k:p.kind==="stock"?"ซื้อสินค้า "+(p.lines||[]).length+" รายการ":p.cat,base:c.base,vat:c.vat,total:c.total,left:Math.max(0,r2(c.total-apPaid(X,p)))}})
      .concat(X.cash.filter(c=>c.dir==="out"&&COST_CATS.includes(c.cat)&&c.date>=f&&c.date<=t).map(c=>({date:c.date,no:"-",sup:c.note,k:c.cat+" ("+X.acc(c.accId)+")",base:n(c.amount),vat:0,total:n(c.amount),left:0}))).sort((a,b)=>a.date.localeCompare(b.date))})},
  {id:"po",t:"ใบสั่งซื้อรอรับของ",d:"สั่งซื้อแล้วแต่ยังไม่ได้รับสินค้า",run:(X,f,t)=>({cols:[["วันที่สั่ง","date","d"],["เลขที่","no"],["ผู้ขาย","sup"],["รายการ","k"],["กำหนดส่ง","due","d"],["ยอดรวม","total","n",1]],
    rows:X.pur.filter(p=>p.status==="ordered"&&p.date>=f&&p.date<=t).map(p=>({date:p.date,no:p.no,sup:p.sup&&p.sup.name,k:(p.lines||[]).length+" รายการ",due:p.due,total:calcPur(p).total}))})},
  {id:"exp",t:"รายงานค่าใช้จ่าย",d:"ค่าใช้จ่ายทุกรายการ ทั้งที่บันทึกจากใบเสร็จ และจ่ายจากเงินสด / เงินสดย่อย",run:(X,f,t)=>({cols:[["วันที่","date","d"],["เลขที่","no"],["จ่ายให้","sup"],["หมวด","cat"],["รายละเอียด","desc"],["ก่อน VAT","base","n",1],["VAT","vat","n",1],["รวม","total","n",1]],
    rows:X.pur.filter(p=>p.kind==="expense"&&!isCostP(p)&&p.status!=="ordered"&&p.date>=f&&p.date<=t).map(p=>{const c=calcPur(p);return{date:p.date,no:p.no,sup:p.sup&&p.sup.name,cat:p.cat,desc:(p.lines||[]).map(l=>l.d).filter(Boolean).join(", "),base:c.base,vat:c.vat,total:c.total}})
      .concat(X.cash.filter(c=>c.dir==="out"&&c.date>=f&&c.date<=t&&!COST_CATS.includes(c.cat)&&(!NOT_EXP.includes(c.cat)||c.cat==="จ่ายเงินเดือน")).map(c=>({date:c.date,no:X.acc(c.accId),sup:"",cat:c.cat==="จ่ายเงินเดือน"?"เงินเดือน / ค่าจ้าง":c.cat,desc:c.note,base:n(c.amount),vat:0,total:n(c.amount)}))).sort((a,b)=>a.date.localeCompare(b.date))})},
  {id:"expcat",t:"ค่าใช้จ่ายตามหมวด",d:"สรุปค่าใช้จ่ายแต่ละหมวด ใช้ดูว่าเงินออกไปทางไหนมากที่สุด",run:(X,f,t)=>{const R=G[2].L.find(r=>r.id==="exp").run(X,f,t).rows,M={};R.forEach(r=>{const m=M[r.cat]||(M[r.cat]={cat:r.cat,cnt:0,base:0});m.cnt++;m.base+=r.base});
    const L=Object.values(M).sort((a,b)=>b.base-a.base),T=L.reduce((a,x)=>a+x.base,0);L.forEach(x=>x.pc=T?r2(x.base/T*100):0);return{cols:[["หมวด","cat"],["จำนวนรายการ","cnt","q",1],["ยอด (ก่อน VAT)","base","n",1],["สัดส่วน %","pc","q"]],rows:L}}},
  {id:"apaging",t:"เจ้าหนี้คงค้าง",d:"ยอดค้างจ่าย ณ วันสิ้นงวด และจำนวนวันที่เกินกำหนด",asof:1,run:(X,f,t)=>({cols:[["ผู้ขาย","sup"],["เลขที่","no"],["วันที่","date","d"],["ครบกำหนด","due","d"],["ยอดรวม","total","n",1],["จ่ายแล้ว","paid","n",1],["ค้างจ่าย","left","n",1],["เกินกำหนด (วัน)","od","q"]],
    rows:X.pur.filter(p=>p.status!=="ordered"&&p.date<=t).map(p=>{const c=calcPur(p),pd=apPaid(X,p,t),l=r2(c.total-pd);if(l<=.01)return null;const od=days(t,p.due||p.date);return{sup:p.sup&&p.sup.name,no:p.no,date:p.date,due:p.due,total:c.total,paid:pd,left:l,od:od>0?od:0}}).filter(Boolean).sort((a,b)=>String(a.sup).localeCompare(String(b.sup),"th")||a.date.localeCompare(b.date))})},
  {id:"payout",t:"รายงานการจ่ายชำระเจ้าหนี้",d:"จ่ายเงินให้ใคร จากบัญชีไหน หักภาษี ณ ที่จ่ายเท่าไร",run:(X,f,t)=>({cols:[["วันที่","date","d"],["ผู้ขาย","sup"],["เอกสาร","doc"],["จากบัญชี","acc"],["หัก ณ ที่จ่าย","wht","n",1],["จ่ายจริง","amt","n",1]],
    rows:X.pout.filter(p=>p.date>=f&&p.date<=t).map(p=>{const u=X.pu(p.purId);return{date:p.date,sup:u&&u.sup&&u.sup.name,doc:u?u.no:"",acc:X.acc(p.accId),wht:n(p.wht),amt:n(p.amount)}})})},
  {id:"purbrand",t:"ยอดซื้อสินค้าตามแบรนด์",d:"ซื้อสินค้าแต่ละแบรนด์เข้ามาเท่าไร จากผู้ขายกี่ราย",run:(X,f,t)=>{const M={};X.pur.filter(p=>p.kind==="stock"&&p.status!=="ordered"&&p.date>=f&&p.date<=t).forEach(p=>(p.lines||[]).forEach(l=>{const it=X.byId[l.pid];if(!it)return;const k=it.brand||NB;const m=M[k]||(M[k]={brand:k,sup:new Set(),q:0,amt:0});m.sup.add(p.sup&&p.sup.name);m.q+=n(l.q);m.amt+=r2(n(l.q)*n(l.p))}));
    return{cols:[["แบรนด์","brand"],["จำนวนผู้ขาย","ns","q"],["จำนวนที่ซื้อ","q","q",1],["มูลค่าซื้อ (ตามราคาในใบซื้อ)","amt","n",1]],rows:Object.values(M).map(m=>({brand:m.brand,ns:m.sup.size,q:m.q,amt:r2(m.amt)})).sort((a,b)=>b.amt-a.amt)}}},
  {id:"pursup",t:"ยอดซื้อตามผู้ขาย",d:"สรุปยอดซื้อสินค้าและค่าใช้จ่ายแยกตามผู้ขาย",run:(X,f,t)=>{const M={};X.pur.filter(p=>p.status!=="ordered"&&p.date>=f&&p.date<=t).forEach(p=>{const k=p.sup&&p.sup.name||"-",c=calcPur(p);const m=M[k]||(M[k]={sup:k,cnt:0,base:0,vat:0,total:0});m.cnt++;m.base+=c.base;m.vat+=c.vat;m.total+=c.total});
    return{cols:[["ผู้ขาย","sup"],["จำนวนรายการ","cnt","q",1],["ก่อน VAT","base","n",1],["VAT","vat","n",1],["รวม","total","n",1]],rows:Object.values(M).sort((a,b)=>b.total-a.total)}}}]},
 {k:"fin",g:"การเงิน",ic:"🏦",L:[
  {id:"bank",t:"สมุดบัญชีธนาคาร",d:"ยอดยกมา รายการฝาก-ถอน และยอดคงเหลือทุกวัน",book:"bank"},
  {id:"cashbook",t:"สมุดเงินสด",d:"ยอดยกมา รับ-จ่ายเงินสด และยอดคงเหลือ",book:"cash"},
  {id:"petty",t:"รายงานเงินสดย่อย",d:"เบิกเติม จ่ายเงินสดย่อย และยอดคงเหลือ",book:"petty"},
  {id:"cashsum",t:"สรุปเงินคงเหลือทุกบัญชี",d:"ยกมา รับ จ่าย คงเหลือ ของธนาคาร เงินสด และเงินสดย่อย",run:(X,f,t)=>{const M=moves(X);return{cols:[["บัญชี","acc"],["ประเภท","k"],["ยอดยกมา","open","n",1],["รับเข้า","in","n",1],["จ่ายออก","out","n",1],["คงเหลือ","bal","n",1]],
    rows:X.accs.map(a=>{let o=n(a.open),i=0,u=0;M.forEach(m=>{if(m.acc!==a.id||m.date>t)return;if(m.date<f)o+=m.amt;else if(m.amt>0)i+=m.amt;else u-=m.amt});return{acc:a.name,k:{bank:"ธนาคาร",cash:"เงินสด",petty:"เงินสดย่อย"}[a.type]||a.type,open:r2(o),in:r2(i),out:r2(u),bal:r2(o+i-u)}})}}}]},
 {k:"stk",g:"สต๊อก",ic:"📦",L:[
  {id:"stockbal",t:"สินค้าคงเหลือ ณ วันที่",d:"จำนวนคงเหลือ ต้นทุนเฉลี่ย และมูลค่าสต๊อก ณ วันสิ้นงวด",asof:1,run:(X,f,t)=>{const R=stockRun(X,t);return{cols:[["รหัส","sku"],["สินค้า","name"],["แบรนด์","brand"],["หน่วย","unit"],["คงเหลือ","bal","q"],["ต้นทุนเฉลี่ย","avg","n"],["มูลค่า","val","n",1],["จุดสั่งซื้อ","min","q"],["สถานะ","st"]],
    rows:X.items.map(i=>{const s=R.S[i.id]||{bal:0,avg:0};return{sku:i.sku,name:i.name,brand:i.brand,unit:i.unit,bal:s.bal,avg:r2(s.avg),val:r2(Math.max(s.bal,0)*s.avg),min:n(i.min),st:n(i.min)>0&&s.bal<=n(i.min)?"ใกล้หมด / ควรสั่ง":""}}),note:"มูลค่าตามต้นทุนถัวเฉลี่ย"}}},
  {id:"stockbrand",t:"สต๊อกคงเหลือตามแบรนด์",d:"แต่ละแบรนด์มีสินค้ากี่รายการ คงเหลือเท่าไร มูลค่าเท่าไร",asof:1,run:(X,f,t)=>{const R=stockRun(X,t),M={};X.items.forEach(i=>{const k=i.brand||NB,s=R.S[i.id]||{bal:0,avg:0};const m=M[k]||(M[k]={brand:k,cnt:0,q:0,val:0,low:0});m.cnt++;m.q+=Math.max(s.bal,0);m.val+=Math.max(s.bal,0)*s.avg;if(n(i.min)>0&&s.bal<=n(i.min))m.low++});
    const L=Object.values(M).map(m=>Object.assign(m,{val:r2(m.val)})).sort((a,b)=>b.val-a.val),T=L.reduce((a,x)=>a+x.val,0);L.forEach(x=>x.pc=T?r2(x.val/T*100):0);return{cols:[["แบรนด์","brand"],["จำนวนรายการสินค้า","cnt","q",1],["จำนวนคงเหลือ","q","q",1],["มูลค่าคงเหลือ","val","n",1],["สัดส่วน %","pc","q"],["ใกล้หมด (รายการ)","low","q",1]],rows:L,note:"มูลค่าตามต้นทุนถัวเฉลี่ย"}}},
  {id:"stockmove",t:"ความเคลื่อนไหวสินค้า",d:"ยกมา รับเข้า จ่ายออก ปรับปรุง และคงเหลือ ของแต่ละสินค้าในช่วงที่เลือก",run:(X,f,t)=>({cols:[["รหัส","sku"],["สินค้า","name"],["แบรนด์","brand"],["หน่วย","unit"],["ยกมา","o","q"],["รับเข้า","i","q",1],["จ่ายออก","u","q",1],["ปรับปรุง","a","q"],["คงเหลือ","b","q"]],
    rows:X.items.map(it=>{let o=0,i=0,u=0,a=0;X.tx.forEach(x=>{if(x.pid!==it.id||x.date>t)return;const q=n(x.qty),v=x.type==="out"?-q:q;if(x.date<f)o+=v;else if(x.type==="in")i+=q;else if(x.type==="out")u+=q;else a+=q});return{sku:it.sku,name:it.name,brand:it.brand,unit:it.unit,o:r4(o),i:r4(i),u:r4(u),a:r4(a),b:r4(o+i-u+a)}})})},
  {id:"stockrep",t:"รายงานสต๊อกแบบละเอียด",d:"เปิดหน้ารายงานในระบบสต๊อก (บัตรสินค้า / ตรวจนับ)",link:"stockrep"}]},
 {k:"tax",g:"ภาษีและงบการเงิน",ic:"📑",L:[
  {id:"pnlr",t:"งบกำไรขาดทุน (ตามช่วงวันที่)",d:"รายได้ ต้นทุนขาย กำไรขั้นต้น ค่าใช้จ่าย และกำไรสุทธิ",run:(X,f,t)=>{const inR=d=>d>=f&&d<=t;let sales=0;X.sales.forEach(d=>{if(inR(d.date))sales+=calcDoc(d).base});
    let cogs=0;stockRun(X).cogs.forEach(c=>{if(inR(c.date))cogs+=c.v});let svc=0;const E={};
    X.pur.forEach(p=>{if(p.kind!=="expense"||p.status==="ordered"||!inR(p.date))return;const b=calcPur(p).base;if(COST_CATS.includes(p.cat))svc+=b;else E[p.cat||"ค่าใช้จ่ายอื่น"]=(E[p.cat||"ค่าใช้จ่ายอื่น"]||0)+b});
    let oth=0;X.cash.forEach(c=>{if(!inR(c.date))return;const a=n(c.amount);if(c.dir==="out"){if(COST_CATS.includes(c.cat))svc+=a;else if(c.cat==="จ่ายเงินเดือน")E["เงินเดือน / ค่าจ้าง"]=(E["เงินเดือน / ค่าจ้าง"]||0)+a;else if(!NOT_EXP.includes(c.cat))E[c.cat||"ค่าใช้จ่ายอื่น"]=(E[c.cat||"ค่าใช้จ่ายอื่น"]||0)+a}else if(!NOT_INC.includes(c.cat))oth+=a});
    const cg=r2(cogs+svc),gp=r2(sales-cg),et=Object.values(E).reduce((a,v)=>a+v,0),net=r2(gp+oth-et),pc=v=>sales?r2(v/sales*100):"";
    const rows=[{l:"รายได้จากการขาย",v:r2(sales),p:pc(sales),b:1},{l:"หัก ต้นทุนขาย (สินค้า)",v:-r2(cogs),p:pc(cogs)},{l:"หัก ต้นทุนบริการ",v:-r2(svc),p:pc(svc)},{l:"กำไรขั้นต้น",v:gp,p:pc(gp),b:1},{l:"รายได้อื่น",v:r2(oth),p:pc(oth)}]
      .concat(Object.entries(E).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({l:"หัก "+k,v:-r2(v),p:pc(v)})),[{l:"รวมค่าใช้จ่าย",v:-r2(et),p:pc(et),b:1},{l:net>=0?"กำไรสุทธิ":"ขาดทุนสุทธิ",v:net,p:pc(net),b:1}]);
    return{cols:[["รายการ","l"],["จำนวนเงิน","v","n"],["% ของยอดขาย","p","q"]],rows,nototal:1,note:"ต้นทุนสินค้าคิดแบบถัวเฉลี่ยจากสต๊อก · ไม่รวมภาษีซื้อ-ขาย"}}},
  {id:"tax",t:"รายงานภาษีซื้อ-ภาษีขาย (แบบกรมสรรพากร)",d:"เปิดหน้ารายงานภาษีรายเดือน พิมพ์ตามแบบกรมสรรพากร",link:"tax"},
  {id:"pnl",t:"กำไรขาดทุนรายเดือน (กราฟ)",d:"เปิดหน้าภาพรวมกำไรขาดทุนแบบเปรียบเทียบรายเดือน",link:"pnl"},
  {id:"wht",t:"ภาษีหัก ณ ที่จ่าย",d:"ภาษีที่เราหักผู้ขาย (ต้องนำส่ง) และที่ลูกค้าหักเรา (เครดิตภาษี)",run:(X,f,t)=>({cols:[["วันที่","date","d"],["ประเภท","k"],["คู่ค้า","who"],["เอกสาร","doc"],["ยอดที่จ่าย/รับ","amt","n"],["ภาษีหัก ณ ที่จ่าย","wht","n",1]],
    rows:X.pay.filter(p=>n(p.wht)>0&&p.date>=f&&p.date<=t).map(p=>{if(p.dir==="out"){const u=X.pu(p.purId);return{date:p.date,k:"เราหัก (ภ.ง.ด.3/53 ต้องนำส่ง)",who:u&&u.sup&&u.sup.name,doc:u?u.no:"",amt:n(p.amount),wht:n(p.wht)}}const d=X.docs.find(x=>x.id===p.docId);return{date:p.date,k:"ลูกค้าหักเรา (เครดิตภาษี)",who:d&&d.cust&&d.cust.name,doc:d?d.no:"",amt:n(p.amount),wht:n(p.wht)}})})}]}];
const ALL={},GK={};G.forEach(g=>{GK[g.k]=g;g.L.forEach(r=>{r.g=g.g;r.gk=g.k;r.ic=g.ic;ALL[r.id]=r})});
// สมุดบัญชี (ธนาคาร / เงินสด / เงินสดย่อย) พร้อมยอดคงเหลือสะสม
function book(X,type,f,t){const M=moves(X),rows=[];X.accs.filter(a=>a.type===type).forEach(a=>{let b=n(a.open);M.forEach(m=>{if(m.acc===a.id&&m.date<f)b+=m.amt});
  rows.push({date:f,acc:a.name,l:"ยอดยกมา",in:"",out:"",bal:r2(b),b:1});M.forEach(m=>{if(m.acc!==a.id||m.date<f||m.date>t)return;b+=m.amt;rows.push({date:m.date,acc:a.name,l:m.label+(m.party?" · "+m.party:""),note:m.note,in:m.amt>0?m.amt:"",out:m.amt<0?-m.amt:"",bal:r2(b)})});
  rows.push({date:t,acc:a.name,l:"ยอดคงเหลือยกไป",in:"",out:"",bal:r2(b),b:1})});
  return{cols:[["วันที่","date","d"],["บัญชี","acc"],["รายการ","l"],["หมายเหตุ","note"],["รับเข้า","in","n",1],["จ่ายออก","out","n",1],["คงเหลือ","bal","n"]],rows,empty:rows.length?"":"ยังไม่มีบัญชีประเภทนี้ · เพิ่มได้ที่เมนูการเงิน → ⚙️ บัญชีเงิน"}}

/* ---------- ช่วงวันที่ ---------- */
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function preset(k){const d=new Date(),y=d.getFullYear(),m=d.getMonth();switch(k){
  case"tm":return[ymd(new Date(y,m,1)),ymd(new Date(y,m+1,0))];case"lm":return[ymd(new Date(y,m-1,1)),ymd(new Date(y,m,0))];
  case"tq":{const q=Math.floor(m/3)*3;return[ymd(new Date(y,q,1)),ymd(new Date(y,q+3,0))]}case"l3":return[ymd(new Date(y,m-2,1)),ymd(new Date(y,m+1,0))];
  case"ty":return[y+"-01-01",y+"-12-31"];case"ly":return[(y-1)+"-01-01",(y-1)+"-12-31"];case"all":return["2000-01-01","2099-12-31"]}return null}
let st=Object.assign({p:"tm",f:"",t:""},LS.get("edm_rpt",{}));if(st.p!=="cu"){const P=preset(st.p)||preset("tm");st.f=P[0];st.t=P[1]}
const saveSt=()=>{try{localStorage.setItem("edm_rpt",JSON.stringify(st))}catch(e){}};
const perTxt=r=>r&&r.nodate?"ข้อมูล ณ วันที่ "+thD(today()):r&&r.asof?"ณ วันที่ "+thD(st.t>today()?today():st.t):st.p==="all"?"ทุกช่วงเวลา":"ตั้งแต่ "+thD(st.f)+" ถึง "+thD(st.t);

/* ---------- แสดงผล ---------- */
let cur=null,last=null;
function run(r){const X=data(),t=r.asof&&st.t>today()?today():st.t;const R=r.book?book(X,r.book,st.f,t):r.run(X,st.f,t);R.rows=R.rows||[];return R}
const cell=(v,ty)=>v===""||v==null?"":ty==="n"?fmt(v):ty==="q"?(+v).toLocaleString("th-TH",{maximumFractionDigits:3}):ty==="d"?thD(v):String(v);
function totals(R){const T={};R.cols.forEach(c=>{if(c[3])T[c[1]]=r2(R.rows.reduce((a,x)=>a+n(x[c[1]]),0))});return T}
function renderRpt(){const id=(/[?&]r=([\w-]+)/.exec(location.hash)||[])[1],gk=(/[?&]g=(\w+)/.exec(location.hash)||[])[1];cur=id&&ALL[id]?ALL[id]:null;if(cur&&cur.link){const l=cur.link;cur=null;return go(l)}const grp=cur?GK[cur.gk]:GK[gk]||null;
  $("#rpHome").hidden=!!cur;$("#rpView").hidden=!cur;$("#rpPer").textContent=perTxt(cur);
  $("#rpP").value=st.p;$("#rpF").value=st.f;$("#rpT").value=st.t;$("#rpCustom").hidden=st.p!=="cu";
  $$("#rpBar [data-only]").forEach(e=>e.hidden=!cur);$("#rpBar").classList.toggle("nod",!!(cur&&cur.nodate));
  $$('aside a[data-r="rpt"]').forEach(a=>a.classList.toggle("on",a.dataset.g===(grp?grp.k:"all")));
  $("#rpH1").textContent=grp?grp.ic+" รายงาน"+(grp.k==="tax"?"ภาษีและงบการเงิน":grp.g):"📊 รายงานทั้งหมด";
  $("#rpBack").textContent="← รายงาน"+(grp?(grp.k==="tax"?"ภาษีและงบ":grp.g):"ทั้งหมด");
  if(!cur){const tile=(r,i)=>`<button class="rp-tile" data-rp="${r.id}"><span class="rp-n">${i+1}</span><b>${r.t}${r.link?" ↗":""}</b><span>${r.d}</span></button>`;
    $("#rpHome").innerHTML=(grp?[grp]:G).map(g=>`${grp?"":`<h2 class="rp-gh"><a href="#/rpt?g=${g.k}">${g.ic} ${g.g} <small>${g.L.length} รายงาน →</small></a></h2>`}<div class="rp-tiles">${g.L.map(tile).join("")}</div>`).join("");
    document.title=(grp?"รายงาน"+grp.g:"รายงานทั้งหมด")+" · ระบบร้านค้า";return}
  document.title=cur.t+" · ระบบร้านค้า";$("#rpTitle").textContent=cur.ic+" "+cur.t;$("#rpDesc").textContent=cur.d;
  const R=last=run(cur),q=$("#rpQ").value.trim().toLowerCase();const rows=q?R.rows.filter(x=>Object.values(x).some(v=>String(v==null?"":v).toLowerCase().includes(q))):R.rows;
  const RR=Object.assign({},R,{rows});const T=R.nototal?{}:totals(RR);last.view=RR;last.T=T;
  $("#rpCount").textContent=rows.length+" รายการ"+(R.note?" · "+R.note:"");
  $("#rpTbl").innerHTML=`<thead><tr>${R.cols.map(c=>`<th class="${c[2]==="n"||c[2]==="q"?"r":""}">${c[0]}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(x=>`<tr class="${x.b?"rb-b":""}">${R.cols.map(c=>`<td class="${c[2]==="n"||c[2]==="q"?"r":""}${c[2]==="n"&&n(x[c[1]])<0?" neg":""}">${esc(cell(x[c[1]],c[2]))}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${R.cols.length}"><div class="empty">${R.empty||"ไม่มีข้อมูลในช่วงนี้ · ลองเปลี่ยนช่วงวันที่ด้านบน"}</div></td></tr>`}</tbody>
    ${Object.keys(T).length&&rows.length?`<tfoot><tr>${R.cols.map((c,i)=>`<td class="${c[3]?"r":""}">${i===0?"รวม":c[3]?fmt(T[c[1]]):""}</td>`).join("")}</tr></tfoot>`:""}`}
window.renderRpt=renderRpt;
$("#rpHome").addEventListener("click",e=>{const b=e.target.closest("[data-rp]");if(!b)return;const r=ALL[b.dataset.rp];if(r.link)return go(r.link);$("#rpQ").value="";location.hash="#/rpt?r="+r.id});
$("#rpBack").onclick=()=>{location.hash=cur?"#/rpt?g="+cur.gk:"#/rpt"};
$("#rpP").onchange=e=>{st.p=e.target.value;if(st.p!=="cu"){const P=preset(st.p);st.f=P[0];st.t=P[1]}saveSt();renderRpt()};
["#rpF","#rpT"].forEach(s=>$(s).onchange=()=>{st.p="cu";st.f=$("#rpF").value||st.f;st.t=$("#rpT").value||st.t;if(st.f>st.t)[st.f,st.t]=[st.t,st.f];saveSt();renderRpt()});
$("#rpQ").addEventListener("input",renderRpt);

/* ---------- พิมพ์ / PDF ---------- */
$("#rpPrint").onclick=()=>{if(!cur||!last)return;const R=last.view,T=last.T,S=LS.get("edm_bill_seller",{})||{},wide=R.cols.length>7;
  const html=`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(cur.t)}</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet"><style>
  @page{size:A4 ${wide?"landscape":"portrait"};margin:10mm}*{box-sizing:border-box}body{font-family:Sarabun,Tahoma,sans-serif;color:#111;margin:0;font-size:${wide?"9.5":"10.5"}pt}
  .h{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:8px}.h b{font-size:13pt}.h small{display:block;color:#444}
  h1{font-size:14pt;margin:0;text-align:right}table{width:100%;border-collapse:collapse;table-layout:auto}th,td{border:1px solid #999;padding:3px 5px;vertical-align:top}th{background:#eee;font-weight:600}
  .r{text-align:right;white-space:nowrap}tr.b td{font-weight:700;background:#f6f6f6}tfoot td{font-weight:700;background:#eee}.neg{color:#b00}.f{margin-top:8px;color:#555;font-size:9pt;display:flex;justify-content:space-between}thead{display:table-header-group}tr{page-break-inside:avoid}</style></head><body>
  <div class="h"><div><b>${esc(S.name||"")}</b><small>${esc(S.tax?"เลขประจำตัวผู้เสียภาษี "+S.tax+(S.branch?" ("+S.branch+")":""):"")}</small></div><div><h1>${esc(cur.t)}</h1><small style="text-align:right;display:block">${esc(perTxt(cur))}</small></div></div>
  <table><thead><tr>${R.cols.map(c=>`<th class="${c[2]==="n"||c[2]==="q"?"r":""}">${c[0]}</th>`).join("")}</tr></thead><tbody>${R.rows.map(x=>`<tr class="${x.b?"b":""}">${R.cols.map(c=>`<td class="${c[2]==="n"||c[2]==="q"?"r":""}${c[2]==="n"&&n(x[c[1]])<0?" neg":""}">${esc(cell(x[c[1]],c[2]))}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${R.cols.length}">ไม่มีข้อมูล</td></tr>`}</tbody>
  ${Object.keys(T).length&&R.rows.length?`<tfoot><tr>${R.cols.map((c,i)=>`<td class="${c[3]?"r":""}">${i===0?"รวม":c[3]?fmt(T[c[1]]):""}</td>`).join("")}</tr></tfoot>`:""}</table>
  <div class="f"><span>${R.rows.length} รายการ${last.note?" · "+esc(last.note):""}</span><span>พิมพ์เมื่อ ${thD(today())} ${new Date().toTimeString().slice(0,5)}</span></div></body></html>`;
  let f=$("#rpFrame");if(f)f.remove();f=document.createElement("iframe");f.id="rpFrame";f.style.cssText="position:fixed;width:0;height:0;border:0;right:0;bottom:0";document.body.appendChild(f);
  f.onload=()=>{const w=f.contentWindow;const go2=()=>{try{w.focus();w.print()}catch(e){toast("พิมพ์ไม่ได้ ลองใหม่อีกครั้ง")}};(w.document.fonts&&w.document.fonts.ready?w.document.fonts.ready:Promise.resolve()).then(()=>setTimeout(go2,150))};f.srcdoc=html};

/* ---------- Excel ---------- */
function loadXLSX(){return window.XLSX?Promise.resolve(window.XLSX):new Promise((ok,no)=>{const s=document.createElement("script");s.src="/assets/vendor/xlsx.full.min.js";s.onload=()=>ok(window.XLSX);s.onerror=no;document.head.appendChild(s)})}
$("#rpXls").onclick=()=>{if(!cur||!last)return;toast("กำลังสร้างไฟล์ Excel...");loadXLSX().then(XL=>{const R=last.view,T=last.T,S=LS.get("edm_bill_seller",{})||{};
  const aoa=[[S.name||""],[cur.t],[perTxt(cur)],[],R.cols.map(c=>c[0])].concat(R.rows.map(x=>R.cols.map(c=>{const v=x[c[1]];return v===""||v==null?"":(c[2]==="n"||c[2]==="q")?n(v):c[2]==="d"?thD(v):String(v)})));
  if(Object.keys(T).length&&R.rows.length)aoa.push(R.cols.map((c,i)=>i===0?"รวม":c[3]?T[c[1]]:""));
  const ws=XL.utils.aoa_to_sheet(aoa);ws["!cols"]=R.cols.map(c=>({wch:c[2]==="n"?14:c[2]==="d"?12:c[2]==="q"?10:24}));
  R.cols.forEach((c,ci)=>{if(c[2]!=="n")return;for(let ri=5;ri<aoa.length;ri++){const a=XL.utils.encode_cell({r:ri,c:ci});if(ws[a]&&typeof ws[a].v==="number")ws[a].z="#,##0.00"}});
  const wb=XL.utils.book_new();XL.utils.book_append_sheet(wb,ws,cur.t.slice(0,28).replace(/[\\/?*\[\]:]/g," "));XL.writeFile(wb,cur.t.replace(/[\\/?*\[\]:]/g," ")+" "+st.f+"_"+st.t+".xlsx");toast("ดาวน์โหลดไฟล์ Excel แล้ว ✓")}).catch(()=>toast("สร้างไฟล์ไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่"))};
if(/^#\/?rpt/.test(location.hash)&&window.route)route();
})();
