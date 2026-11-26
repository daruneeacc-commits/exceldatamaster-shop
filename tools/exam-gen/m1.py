# ตัวสร้างข้อสอบจำลองเข้า ม.1 (คณิต) → exam/bank-m1.js · แต่งใหม่ตามแนวโจทย์ ตัวเลข/เรื่อง/ตัวเลือกสุ่มใหม่ทั้งหมด
# คำตอบคำนวณด้วยโปรแกรม · seed คงที่ ห้ามเปลี่ยนหลังเปิดขาย (เพิ่มชุดใหม่ = เพิ่ม VAR แล้วต่อท้าย)
import random, json
from fractions import Fraction as F
from math import gcd
R = random.Random(20261127)
def n(x):
    if isinstance(x, F):
        if x.denominator == 1: return n(x.numerator)
        if x.denominator in (2, 4, 5, 8, 10, 20, 25, 40, 50, 100): return n(float(x))
        return f"{x.numerator}/{x.denominator}"
    if isinstance(x, float):
        if x == int(x): return n(int(x))
        return f"{x:,.2f}".rstrip("0").rstrip(".")
    return f"{x:,}"
def Q(t, q, ans, wr, ex, u=""):
    fm = lambda v: v if isinstance(v, str) else n(v) + (" " + u if u else "")
    A = fm(ans); op = []; why = {}
    for v, r in wr:
        s = fm(v)
        if s != A and s not in op and (isinstance(v, str) or v > 0): op.append(s); why[s] = r
    k = 1
    while len(op) < 3 and not isinstance(ans, str) and k < 40:
        for v in (ans + k, ans - k):
            s = fm(v)
            if len(op) < 3 and s != A and s not in op and v > 0: op.append(s); why[s] = "คำนวณคลาดไป ลองทำตามวิธีคิดทีละขั้น"
        k += 1
    if len(op) < 3: raise ValueError
    c = op[:3] + [A]; R.shuffle(c); a = c.index(A)
    return {"t": t, "q": q, "c": c, "a": a, "ex": ex, "w": {str(i): why[s] for i, s in enumerate(c) if i != a}}
NM = ["ต้นข้าว", "ใบเฟิร์น", "ภูมิ", "มะปราง", "ข้าวหอม", "ปลายฟ้า", "ธันวา", "น้ำใส", "กันต์", "พิมพ์ดาว"]
WD = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"]

def t1():  # หัวและขา
    a, b = R.choice([("แพะ", "เป็ด"), ("หมู", "ไก่"), ("ม้า", "ห่าน")]); c = R.randint(18, 40); h = R.randint(10, 40); T = c + h; D = 4*c - 2*h
    if D <= 0: raise ValueError
    return Q("สมการ", f"คอกหนึ่งมี{a}และ{b}รวมกัน {T} ตัว จำนวนขา{a}ทั้งหมดมากกว่าขา{b}ทั้งหมด {D} ขา มี{a}กี่ตัว", c, [(h, f"นั่นคือจำนวน{b}"), ((T+D)//4 if (T+D)%4==0 else c+3, "ตั้งสมการผิด ต้องเป็น 4x − 2(จำนวนทั้งหมด − x) = ผลต่าง"), (D//2, "เอาผลต่างหาร 2 ตรง ๆ ไม่ถูก")], f"ให้มี{a} x ตัว {b} {T} − x ตัว\n4x − 2({T} − x) = {D} → 6x = {D + 2*T} → x = {c}", "ตัว")
def t2():  # อัตราเร็วเฉลี่ยไปกลับ
    v1, v2 = R.choice([(40, 60), (30, 60), (60, 90), (36, 45), (60, 120), (30, 70)]); hm = F(2*v1*v2, v1+v2)
    return Q("อัตราเร็ว", f"ขับรถไปต่างจังหวัดด้วยอัตราเร็วเฉลี่ย {v1} กม./ชม. และขับกลับทางเดิมด้วยอัตราเร็วเฉลี่ย {v2} กม./ชม. อัตราเร็วเฉลี่ยตลอดการเดินทางไป–กลับเป็นเท่าไร", hm, [(F(v1+v2, 2), "เอาอัตราเร็วมาเฉลี่ยตรง ๆ ไม่ได้ เพราะเวลาไปกับกลับไม่เท่ากัน"), (v2 - v1, "ไม่ใช่ผลต่าง"), (hm + 5, "คิดเวลารวมคลาด")], f"สมมติระยะทาง = {v1*v2//gcd(v1,v2)} กม. (ค.ร.น.)\nอัตราเร็วเฉลี่ย = ระยะทางรวม ÷ เวลารวม = 2 × {v1} × {v2} ÷ ({v1} + {v2}) = {n(hm)} กม./ชม.", "กม./ชม.")
def t3():  # บันไดลูกบาศก์
    k = R.randint(8, 15); d = R.randint(3, 6); s = k*(k+1)//2
    G['img']=f_stair(k,d)
    return Q("แบบรูป", f"สร้างบันไดด้วยลูกบาศก์ ขั้นที่ 1 สูง 1 ลูก ขั้นที่ 2 สูง 2 ลูก … ทุกขั้นลึก {d} ลูก ถ้าบันไดมี {k} ขั้น ต้องใช้ลูกบาศก์กี่ลูก", s*d, [(s, f"ลืมคูณความลึก {d} ลูก"), (k*k*d, "แต่ละขั้นสูงไม่เท่ากัน ใช้ k × k ไม่ได้"), (k*d, "ลืมว่าขั้นสูงขึ้นทีละ 1 ลูก")], f"ด้านข้างใช้ 1 + 2 + … + {k} = {s} ลูก\nลึก {d} ลูก → {s} × {d} = {s*d} ลูก", "ลูก")
def t4():  # เปลี่ยนด้านสี่เหลี่ยม
    a, b = R.choice([(20, 10), (40, 20), (50, 20), (25, 20), (60, 25), (20, 25)]); ch = F((100+a)*(100-b) - 10000, 100)
    word = lambda x: f"เพิ่มขึ้นร้อยละ {n(x)}" if x > 0 else (f"ลดลงร้อยละ {n(-x)}" if x < 0 else "เท่าเดิม")
    return Q("ร้อยละ", f"สี่เหลี่ยมผืนผ้ารูปหนึ่ง ถ้าเพิ่มความยาวร้อยละ {a} และลดความกว้างร้อยละ {b} พื้นที่จะเปลี่ยนไปอย่างไร", word(ch), [(word(F(a-b)), "เอาร้อยละมาลบกันตรง ๆ ไม่ได้ ต้องคูณกัน"), (word(F(a+b)), "ความกว้างลดลง ต้องคิดเป็นการลด"), (word(-ch) if ch else "เพิ่มขึ้นร้อยละ 1", "ทิศทางผิด ลองแทนตัวเลขดู")], f"ให้ยาว 100 กว้าง 100 พื้นที่ 10,000\nใหม่ ยาว {100+a} กว้าง {100-b} พื้นที่ {(100+a)*(100-b):,}\n→ {word(ch)}")
def t5():  # ตั้งราคาแล้วลด ขาดทุน
    m = R.choice([10, 20, 25, 30]); L = R.choice([2, 3, 4, 5, 6, 8]) * (m*m//gcd(m*m, 10000)) * 10
    lf = F(m*m, 10000); C = F(L) / lf
    if C.denominator != 1 or C > 50000: raise ValueError
    C = int(C)
    return Q("กำไรขาดทุน", f"ร้านหนึ่งตั้งราคาสินค้าสูงกว่าทุนร้อยละ {m} แล้วลดให้ลูกค้าร้อยละ {m} ของราคาที่ตั้ง ปรากฏว่าขาดทุน {L:,} บาท สินค้ามีราคาทุนกี่บาท", C, [(C + L, "นั่นคือทุน + ขาดทุน"), (C - L, "นั่นคือราคาขาย"), (L*100//m, "ขาดทุนไม่ใช่ร้อยละ {m} ของทุน".replace("{m}", str(m)))], f"ทุน 100 → ตั้ง {100+m} → ขาย {100+m} × {100-m}/100 = {n(F((100+m)*(100-m),100))}\nขาดทุน {n(F(m*m,100))} บาทต่อทุน 100\nทุน = {L:,} × 100 ÷ {n(F(m*m,100))} = {C:,} บาท", "บาท")
def t6():  # สวมแว่น
    for _ in range(50):
        bp = R.choice([40, 60, 30, 50]); bq = R.choice([10, 20, 25, 50]); gq = R.choice([F(1, 4), F(1, 2), F(1, 5)]); N = R.choice([80, 100, 120, 200])
        W = F(N*bp, 100)*F(bq, 100) + F(N*(100-bp), 100)*gq
        if W.denominator == 1 and (F(N*bp,100)*F(bq,100)).denominator == 1: break
    else: raise ValueError
    W = int(W)
    return Q("ร้อยละ", f"ห้องเรียนหนึ่งมีนักเรียนชายร้อยละ {bp} นักเรียนชายร้อยละ {bq} ใส่แว่น นักเรียนหญิง {gq.numerator}/{gq.denominator} ของนักเรียนหญิงใส่แว่น ถ้ามีคนใส่แว่นรวม {W} คน ห้องนี้มีนักเรียนกี่คน", N, [(W*2, "ไม่ได้คิดสัดส่วนชาย–หญิง"), (int(N*bp/100), "นั่นคือจำนวนนักเรียนชาย"), (N + 20, "คำนวณสัดส่วนคนใส่แว่นผิด")], f"สัดส่วนคนใส่แว่น = {bp}% × {bq}% + {100-bp}% × {gq.numerator}/{gq.denominator} = {n(W/F(N))} ของทั้งหมด\nทั้งหมด = {W} ÷ {n(W/F(N))} = {N} คน", "คน")
def t7():  # คางหมูมุมฉาก
    a, b = R.choice([(12, 8), (14, 6), (16, 10), (9, 5), (20, 12)]); h = R.choice([6, 8, 10, 12, 14]); A = (a+b)*h//2
    if (a+b)*h % 2: raise ValueError
    G['img']=f_trap(a,b,h)
    return Q("พื้นที่", f"ABCD เป็นรูปสี่เหลี่ยมคางหมู AB ขนานกับ DC และ AD ตั้งฉากกับ AB ถ้า AB ยาว {a} ซม. DC ยาว {b} ซม. และพื้นที่คางหมูเท่ากับ {A} ตร.ซม. รูปสามเหลี่ยม ABC มีพื้นที่กี่ ตร.ซม.", a*h//2 if a*h % 2 == 0 else F(a*h, 2), [(b*h//2 if b*h%2==0 else F(b*h,2), "นั่นคือพื้นที่สามเหลี่ยม ACD"), (A, "นั่นคือพื้นที่คางหมูทั้งรูป"), (a*h, "ลืมคูณ 1/2")], f"สูง AD = 2 × {A} ÷ ({a} + {b}) = {h} ซม.\nสามเหลี่ยม ABC ฐาน AB = {a} สูง {h} → 1/2 × {a} × {h} = {n(F(a*h,2))} ตร.ซม.", "ตร.ซม.")
def t8():  # อัตราส่วนต่อเนื่อง
    x, y, z = R.choice([(2, 3, 5), (4, 3, 5), (3, 4, 2), (5, 2, 3), (6, 4, 5)]); k = R.choice([20, 30, 40, 50]); T = (x+y+z)*k
    p1, p2, p3 = R.sample(NM, 3)
    return Q("อัตราส่วน", f"{p1} {p2} และ{p3} แบ่งเงินกัน โดยเงินของ{p1} : {p2} = {x*2} : {y*2} และ{p2} : {p3} = {y} : {z} ถ้าเงินรวม {T:,} บาท {p1}กับ{p3}ได้เงินต่างกันกี่บาท", abs(x-z)*k, [(x*k, f"นั่นคือเงินของ{p1}"), (z*k, f"นั่นคือเงินของ{p3}"), (abs(2*x-z)*k if abs(2*x-z) != abs(x-z) else (abs(x-z)+1)*k, "ต้องทำให้ส่วนของคนกลางเท่ากันก่อน")], f"{p1} : {p2} = {x*2} : {y*2} = {x} : {y}\n{p1} : {p2} : {p3} = {x} : {y} : {z} รวม {x+y+z} ส่วน\n1 ส่วน = {T:,} ÷ {x+y+z} = {k} บาท → ต่างกัน {abs(x-z)} ส่วน = {abs(x-z)*k} บาท", "บาท")
def t9():  # เศษ
    m = R.choice([5, 6, 7, 8, 9]); r1, r2 = R.randint(1, m-1), R.randint(1, m-1); r = (r1*r1 + r2) % m
    return Q("เศษจากการหาร", f"จำนวนนับ A หารด้วย {m} เหลือเศษ {r1} และ B หารด้วย {m} เหลือเศษ {r2} ถ้านำ A × A + B หารด้วย {m} จะเหลือเศษเท่าใด", str(r), [(str((r1+r2) % m), "ลืมยกกำลังสองของเศษ A"), (str((2*r1+r2) % m), "A × A ไม่ใช่ 2 × A"), (str(r1*r1+r2), "ต้องหารด้วย {m} อีกครั้ง".replace("{m}", str(m)))], f"คิดเฉพาะเศษ: {r1} × {r1} + {r2} = {r1*r1+r2}\n{r1*r1+r2} ÷ {m} เหลือเศษ {r}")
def t10():  # มุมเข็มนาฬิกา
    h, mm = R.randint(1, 11), R.choice([10, 12, 16, 18, 20, 24, 36, 40, 44]); a = abs(F(60*h - 11*mm, 2)); a = min(a, 360 - a)
    G['img']=f_clock(h,mm)
    return Q("มุม", f"เวลา {h}.{mm:02d} น. เข็มชั่วโมงกับเข็มนาทีทำมุมกัน (มุมที่เล็กกว่า) กี่องศา", a, [(abs(30*h - 6*mm) if abs(30*h-6*mm) != a else a+5, "ลืมว่าเข็มชั่วโมงขยับนาทีละ 0.5°"), (360 - a, "นั่นคือมุมที่ใหญ่กว่า"), (a + mm//2 if mm//2 else a+6, "บวกการขยับเข็มชั่วโมงผิดทิศ")], f"เข็มนาที = {mm} × 6 = {6*mm}°\nเข็มชั่วโมง = {h} × 30 + {mm} × 0.5 = {n(F(60*h+mm,2))}°\nต่างกัน {n(a)}°", "องศา")
def t11():  # วันในสัปดาห์
    s = R.randint(0, 6); mo, mname, before = R.choice([(5, "พฤษภาคม", 120), (6, "มิถุนายน", 151), (8, "สิงหาคม", 212), (9, "กันยายน", 243), (10, "ตุลาคม", 273)]); d = R.randint(5, 28)
    off = before + d - 1; w = WD[(s + off) % 7]
    return Q("ปฏิทิน", f"ปีหนึ่งเดือนกุมภาพันธ์มี 28 วัน ถ้าวันที่ 1 มกราคม เป็น{WD[s]} วันที่ {d} {mname} ปีเดียวกันเป็นวันอะไร", w, [(WD[(s+off+1) % 7], "นับรวมวันที่ 1 มกราคมซ้ำ ต้องนับห่างจากวันที่ 1"), (WD[(s+off-1) % 7], "นับขาดไป 1 วัน"), (WD[(s+off+2) % 7], "คิดเดือนกุมภาพันธ์เป็น 29 วัน หรือนับจำนวนวันในเดือนผิด")], f"ห่างจาก 1 ม.ค. = {off} วัน\n{off} ÷ 7 เหลือเศษ {off % 7} → นับต่อจาก{WD[s]}ไป {off % 7} วัน = {w}")
def t12():  # สามเหลี่ยมบนตาราง
    for _ in range(50):
        P = [(R.randint(0, 2), R.randint(0, 2)), (R.randint(5, 7), R.randint(1, 4)), (R.randint(3, 5), R.randint(4, 6))]
        A2 = abs(P[0][0]*(P[1][1]-P[2][1]) + P[1][0]*(P[2][1]-P[0][1]) + P[2][0]*(P[0][1]-P[1][1]))
        if A2 > 4: break
    A = F(A2, 2); xs = [p[0] for p in P]; ys = [p[1] for p in P]; box = (max(xs)-min(xs))*(max(ys)-min(ys))
    G['img']=f_grid(P)
    return Q("พื้นที่", f"บนตารางช่องละ 1 ซม. มีจุด A({P[0][0]},{P[0][1]}) B({P[1][0]},{P[1][1]}) C({P[2][0]},{P[2][1]}) รูปสามเหลี่ยม ABC มีพื้นที่กี่ ตร.ซม.", A, [(box, "นั่นคือสี่เหลี่ยมที่ล้อมไว้ ต้องลบสามเหลี่ยมมุมฉากรอบ ๆ ออก"), (A + 1, "ลบสามเหลี่ยมรอบ ๆ ขาดไป"), (A2, "ลืมหาร 2")], f"ล้อมด้วยสี่เหลี่ยม {max(xs)-min(xs)} × {max(ys)-min(ys)} = {box} ตร.ซม. แล้วลบสามเหลี่ยมมุมฉาก 3 รูปรอบ ๆ\nได้ {n(A)} ตร.ซม.", "ตร.ซม.")
def t13():  # x/a + x/b = c
    a, b = R.choice([(3, 4), (2, 5), (3, 5), (4, 6), (2, 7), (5, 6)]); l = a*b//gcd(a, b); x = l*R.randint(1, 4); c = F(x, a) + F(x, b)
    if c.denominator != 1: raise ValueError
    c = int(c)
    return Q("สมการ", f"ถ้า x/{a} + x/{b} = {c} แล้ว x มีค่าเท่าใด", x, [(c*(a+b), "ไม่ได้ทำส่วนให้เท่ากันอย่างถูกต้อง"), (c*a*b, "ลืมรวมตัวเศษ"), (c, "นั่นคือค่าทางขวาของสมการ")], f"คูณตลอดด้วย {l}: {l//a}x + {l//b}x = {c*l} → {l//a + l//b}x = {c*l} → x = {x}")
def t14():  # แผนภูมิวงกลม
    al = R.choice([120, 150, 90, 135]); be = R.choice([30, 45, 60]); per = R.choice([4, 5, 6, 10]); M = al*per
    G['img']=f_pie(al,be)
    return Q("แผนภูมิวงกลม", f"แผนภูมิวงกลมแสดงการใช้เงินของนักเรียน “ค่าใช้จ่ายอื่น ๆ” เป็นมุม {al}° และ “ค่าหนังสือ” เป็นมุม {be}° ถ้าค่าใช้จ่ายอื่น ๆ เท่ากับ {M:,} บาท ค่าหนังสือเท่ากับกี่บาท", be*per, [(360*per, "นั่นคือเงินทั้งหมด"), (M - be*per, "นำมาลบกันไม่ได้"), (be*per*2, "หามุม 1° คลาด")], f"มุม 1° = {M:,} ÷ {al} = {per} บาท\nค่าหนังสือ {be}° = {be} × {per} = {be*per:,} บาท", "บาท")
def t15():  # ตู้ปลา
    w, l = R.choice([(20, 30), (25, 40), (20, 50), (30, 40)]); h0 = R.randint(15, 30); s = R.choice([10, 5]); k = R.randint(2, 6); V = k*s**3
    if V % (w*l): raise ValueError
    rise = V//(w*l)
    G['img']=f_tank(w,l,h0,s,k)
    return Q("ปริมาตร", f"ตู้ปลาทรงสี่เหลี่ยมมุมฉาก ฐานกว้าง {w} ซม. ยาว {l} ซม. มีน้ำสูง {h0} ซม. นำก้อนหินลูกบาศก์ยาวด้านละ {s} ซม. {k} ก้อนใส่จนจมมิด ระดับน้ำใหม่สูงกี่ ซม.", h0 + rise, [(rise, "นั่นคือระดับน้ำที่สูงขึ้น ต้องบวกระดับเดิม"), (h0 + k*s, "เอาความสูงก้อนหินมาบวกตรง ๆ ไม่ได้"), (h0 + rise*2, "หารพื้นที่ฐานผิด")], f"ปริมาตรหิน = {k} × {s}³ = {V:,} ลบ.ซม.\nน้ำสูงขึ้น = {V:,} ÷ ({w} × {l}) = {rise} ซม. → {h0} + {rise} = {h0+rise} ซม.", "ซม.")
def t16():  # นับสี่เหลี่ยมจัตุรัส
    k = R.choice([4, 5, 6]); s = sum(i*i for i in range(1, k+1))
    G['img']=f_sq(k)
    return Q("การนับ", f"ตารางขนาด {k} × {k} ช่อง มีรูปสี่เหลี่ยมจัตุรัสทุกขนาดรวมกันกี่รูป", s, [(k*k, "นับแค่ช่องเล็ก ลืมสี่เหลี่ยมขนาดใหญ่"), (s - 1, "ลืมนับรูปใหญ่ที่สุด"), (k*k + k, "นับขนาดใหญ่ไม่ครบ")], " + ".join(f"{i*i}" for i in range(k, 0, -1)) + f" = {s} รูป (ขนาด 1×1 มี {k*k} รูป, 2×2 มี {(k-1)**2} รูป, …)", "รูป")
def t17():  # 4 หลักเศษเท่ากัน
    D = R.choice([(6, 8, 10), (9, 12, 15), (8, 10, 12), (6, 9, 15)]); r = R.choice([1, 2, 3])
    if r >= min(D): raise ValueError
    l = D[0]
    for d in D[1:]: l = l*d//gcd(l, d)
    k = -(-(1000 - r)//l); ans = l*k + r
    return Q("ค.ร.น.", f"จำนวนนับสี่หลักที่น้อยที่สุด ที่หารด้วย {D[0]}, {D[1]} และ {D[2]} แล้วเหลือเศษ {r} ทุกครั้ง คือจำนวนใด", ans, [(ans - r, "ลืมบวกเศษ"), (ans + l, "ไม่ใช่ตัวที่น้อยที่สุด"), (ans - r + r + 1, "บวกเศษเกิน")], f"ค.ร.น. ของ {D[0]}, {D[1]}, {D[2]} = {l}\nจำนวน = {l} × k + {r} · ตัวที่เป็น 4 หลักน้อยสุดคือ {l} × {k} + {r} = {ans:,}")
def t18():  # หลักหน่วยของกำลัง
    a, b = R.sample([3, 7, 2, 8, 4, 9], 2); m, p = R.randint(100, 500), R.randint(100, 500)
    u = (pow(a, m, 10) + pow(b, p, 10)) % 10
    return Q("เลขยกกำลัง", f"เลขโดดในหลักหน่วยของ {a}^{m} + {b}^{p} คือเลขใด", str(u), [(str((pow(a, m, 10)*pow(b, p, 10)) % 10), "เอามาคูณกัน ต้องบวก"), (str((a + b) % 10), "ต้องดูรอบของหลักหน่วยก่อน"), (str((u+1) % 10), "หารหารอบคลาด")], f"หลักหน่วยของ {a}^{m} = {pow(a, m, 10)} · ของ {b}^{p} = {pow(b, p, 10)}\nรวมกันได้หลักหน่วย {u}")
def t19():  # รถสวนกัน
    v1, v2 = R.choice([(80, 60), (70, 50), (90, 60), (60, 40)]); dl = R.choice([F(1, 2), F(1, 1)]); t = R.choice([1, 2, F(3, 2)])
    D = v1*(t + dl) + v2*t
    if F(D).denominator != 1: raise ValueError
    ans = v1*(t + dl)
    return Q("อัตราเร็ว", f"เมือง ก และ ข ห่างกัน {n(D)} กม. รถคันแรกออกจาก ก ด้วยอัตราเร็ว {v1} กม./ชม. อีก {n(dl*60)} นาทีต่อมา รถคันที่สองออกจาก ข ด้วยอัตราเร็ว {v2} กม./ชม. วิ่งเข้าหากัน จุดที่พบกันห่างจากเมือง ก กี่กม.", ans, [(D - ans, "นั่นคือระยะจากเมือง ข"), (v1*t, "ลืมระยะที่รถคันแรกวิ่งไปก่อน"), (D/2, "รถสองคันเร็วไม่เท่ากัน ไม่ได้พบกันตรงกลาง")], f"คันแรกวิ่งไปก่อน {v1} × {n(dl)} = {n(v1*dl)} กม. เหลือ {n(D - v1*dl)} กม.\nเข้าหากันชั่วโมงละ {v1+v2} กม. → ใช้เวลา {n(t)} ชม.\nห่างจาก ก = {v1} × {n(t + dl)} = {n(ans)} กม.", "กม.")
def t20():  # มุมสามเหลี่ยมหน้าจั่ว
    al = R.choice([20, 30, 40, 36, 44]); be = F(180 - al, 2); ans = be - al
    G['img']=f_iso(al)
    return Q("มุม", f"สามเหลี่ยม ABC มี AB = AC และมุม BAC = {al}° จุด D อยู่บน AC โดย BD = BC มุม ABD มีขนาดกี่องศา", ans, [(be, "นั่นคือมุม ABC ทั้งมุม"), (al, "นั่นคือมุม DBC"), (180 - 2*be + 10, "คำนวณมุมฐานผิด")], f"มุมฐาน ABC = ACB = (180 − {al}) ÷ 2 = {n(be)}°\nBD = BC → มุม BDC = {n(be)}° → มุม DBC = 180 − 2 × {n(be)} = {al}°\nมุม ABD = {n(be)} − {al} = {n(ans)}°", "องศา")
def t21():  # ค่าเฉลี่ยเอาออก 1 คน
    N = R.randint(15, 30); a1 = R.randint(55, 75); a2 = a1 - R.choice([1, 2]); x = N*a1 - (N-1)*a2
    if not 0 < x <= 100: raise ValueError
    return Q("ค่าเฉลี่ย", f"นักเรียน {N} คน คะแนนเฉลี่ย {a1} คะแนน ถ้าไม่นับคะแนนของคนหนึ่ง คะแนนเฉลี่ยของที่เหลือเป็น {a2} คะแนน คนนั้นได้กี่คะแนน", x, [(a1, "นั่นคือคะแนนเฉลี่ยเดิม"), (a1 - a2, "นั่นคือผลต่างค่าเฉลี่ย"), (N*a1 - N*a2, "ที่เหลือมี {N1} คน ไม่ใช่ {N} คน".replace("{N1}", str(N-1)).replace("{N}", str(N)))], f"รวม {N} คน = {N} × {a1} = {N*a1:,}\nรวม {N-1} คน = {N-1} × {a2} = {(N-1)*a2:,}\nคนนั้น = {N*a1:,} − {(N-1)*a2:,} = {x}", "คะแนน")
def t22():  # สี่เหลี่ยม + ส่วนโค้ง 1/4 วงกลม 4 มุม
    s = R.choice([14, 28, 21]); r = F(s, 2); circ = F(22, 7)*r*r; ans = s*s - circ
    G['img']=f_quart(s)
    return Q("พื้นที่", f"สี่เหลี่ยมจัตุรัสยาวด้านละ {s} ซม. วาดส่วนโค้ง 1/4 วงกลมรัศมี {n(r)} ซม. ที่มุมทั้งสี่ (จุดศูนย์กลางที่มุม) พื้นที่ตรงกลางที่ไม่ถูกส่วนโค้งเท่ากับกี่ ตร.ซม. (π = 22/7)", ans, [(circ, "นั่นคือพื้นที่ส่วนโค้งรวม"), (s*s, "นั่นคือพื้นที่สี่เหลี่ยม"), (s*s - circ/4, "ส่วนโค้ง 4 ชิ้นรวมเป็นวงกลม 1 วง ต้องลบทั้งวง")], f"ส่วนโค้ง 1/4 วงกลม 4 ชิ้น = วงกลม 1 วง = 22/7 × {n(r)} × {n(r)} = {n(circ)}\nพื้นที่ตรงกลาง = {s*s} − {n(circ)} = {n(ans)} ตร.ซม.", "ตร.ซม.")
def t23():  # หารแล้วเป็นกำลังสองสมบูรณ์
    sq = R.choice([2, 3, 5, 7, 11]); f = R.choice([6, 10, 15, 21, 14, 35]); N = f*sq*sq
    if gcd(f, sq) != 1: raise ValueError
    return Q("กำลังสองสมบูรณ์", f"จำนวนนับที่น้อยที่สุดที่นำไปหาร {N:,} แล้วได้ผลหารเป็นกำลังสองสมบูรณ์ คือจำนวนใด", f, [(sq*sq, "นั่นคือผลหาร"), (f*2, "ต้องหารเฉพาะตัวประกอบเฉพาะที่มีกำลังคี่"), (sq, "หารแล้วไม่เป็นกำลังสองสมบูรณ์")], f"{N:,} = {f} × {sq}²\nหารด้วย {f} ได้ {sq*sq} = {sq}²")
def t24():  # จัตุรัสแนบในวงกลม
    r = R.choice([7, 14, 21, 28]); C = F(22, 7)*r*r; S = 2*r*r
    G['img']=f_insq(r)
    return Q("พื้นที่", f"รูปสี่เหลี่ยมจัตุรัสแนบในวงกลมรัศมี {r} ซม. พื้นที่ส่วนของวงกลมที่อยู่นอกรูปสี่เหลี่ยมเท่ากับกี่ ตร.ซม. (π = 22/7)", C - S, [(S, "นั่นคือพื้นที่สี่เหลี่ยม (= 1/2 × เส้นทแยง²)"), (C - r*r, "ด้านสี่เหลี่ยมไม่ใช่รัศมี เส้นทแยงมุมคือเส้นผ่านศูนย์กลาง"), (C, "นั่นคือพื้นที่วงกลมทั้งวง")], f"วงกลม = 22/7 × {r} × {r} = {n(C)}\nสี่เหลี่ยม = 1/2 × {2*r} × {2*r} = {S}\nส่วนนอก = {n(C)} − {S} = {n(C - S)} ตร.ซม.", "ตร.ซม.")
def t25():  # อนุกรมเศษส่วนตัดทอน
    m = R.choice([19, 21, 25, 33, 41]); ans = F(m-1, m)
    return Q("อนุกรม", f"ผลบวกของ 2/(1×3) + 2/(3×5) + 2/(5×7) + … + 2/({m-2}×{m}) เท่ากับเท่าไร", f"{ans.numerator}/{ans.denominator}", [(f"{m-2}/{m}", "ตัดทอนคลาด เหลือ 1 − 1/{m}".replace("{m}", str(m))), (f"{(m-1)//2}/{m}", "ลืมว่ามีตัวเศษเป็น 2"), (f"{m}/{m+2}", "พจน์สุดท้ายคือ 1/{m}".replace("{m}", str(m)))], f"2/(k(k+2)) = 1/k − 1/(k+2) ตัดกันเป็นคู่ ๆ\nเหลือ 1 − 1/{m} = {ans.numerator}/{ans.denominator}")
def t26():  # ผลบวกเลขคณิต
    a, d, k = R.randint(2, 9), R.choice([3, 4, 6, 7]), R.randint(15, 30); L = a + (k-1)*d; s = k*(a+L)//2
    if k*(a+L) % 2: raise ValueError
    return Q("อนุกรม", f"ผลบวก {a} + {a+d} + {a+2*d} + … + {L} เท่ากับเท่าใด", s, [(k*(a+L), "ลืมหาร 2"), ((k-1)*(a+L)//2, f"จำนวนพจน์คือ {k} ไม่ใช่ {k-1}"), (s + L, "นับพจน์เกิน")], f"จำนวนพจน์ = ({L} − {a}) ÷ {d} + 1 = {k}\nผลบวก = {k} × ({a} + {L}) ÷ 2 = {s:,}")
def t27():  # วิธีจ่ายเหรียญ
    T = R.choice([12, 14, 16, 17, 20]); ways = sum(1 for f in range(T//5+1) for t in range((T-5*f)//2+1))
    return Q("การนับ", f"มีเหรียญ 1 บาท 2 บาท และ 5 บาท อย่างละมาก ๆ ต้องการจ่ายเงิน {T} บาทพอดี มีวิธีจ่ายกี่วิธี (ไม่สนใจลำดับ)", ways, [(ways - 1, "ลืมกรณีใช้เหรียญ 1 บาทล้วน"), (ways + T//5, "นับซ้ำ"), (T//5 + T//2, "ต้องแยกกรณีตามจำนวนเหรียญ 5 บาท")], f"แยกกรณีจำนวนเหรียญ 5 บาท (0 ถึง {T//5}) แล้วนับวิธีใช้เหรียญ 2 บาทในเงินที่เหลือ\nรวม {ways} วิธี", "วิธี")
def t28():  # ผสมสี
    a, b, c = R.choice([(5, 3, 5), (3, 2, 4), (7, 3, 5), (4, 1, 3), (5, 2, 4)]); k = R.choice([3, 4, 5, 6]); tot = (a+b)*k; paint = a*k; need = F(paint*c, a) - b*k
    if need.denominator != 1 or need <= 0: raise ValueError
    return Q("อัตราส่วน", f"สีผสม {tot} ลิตร มีอัตราส่วนเนื้อสีต่อน้ำ {a} : {b} ต้องเติมน้ำอีกกี่ลิตร จึงจะได้อัตราส่วน {a} : {c}", int(need), [(F(paint*c, a), "นั่นคือน้ำทั้งหมดที่ต้องมี ต้องลบน้ำเดิม"), ((c-b)*k*2, "สัดส่วนเปลี่ยน คิดจากเนื้อสีเดิม"), (c - b, "ต่างกัน {d} ส่วน ต้องคูณขนาดของ 1 ส่วน".replace("{d}", str(c-b)))], f"เนื้อสี = {a}/{a+b} × {tot} = {paint} ลิตร น้ำเดิม {b*k} ลิตร\nต้องการ สี : น้ำ = {a} : {c} → น้ำ = {paint} × {c}/{a} = {n(F(paint*c,a))}\nเติม {n(F(paint*c,a))} − {b*k} = {n(need)} ลิตร", "ลิตร")
def t29():  # 2^(x+a) + 2^x
    a = R.choice([1, 2, 3]); x = R.randint(4, 9); N = 2**(x+a) + 2**x; p, q = R.choice([(2, 1), (3, 2), (4, 1), (2, 3)])
    return Q("เลขยกกำลัง", f"ถ้า 2^(x+{a}) + 2^x = {N:,} แล้ว {p}x + {q} มีค่าเท่าใด", p*x+q, [(p*(x+a)+q, "x ไม่ใช่ x + {a}".replace("{a}", str(a))), (x, "นั่นคือค่า x ยังต้องแทนค่า"), (p*(x-1)+q, "ดึงตัวร่วม 2^x ผิด")], f"2^x × (2^{a} + 1) = {N:,} → 2^x = {N:,} ÷ {2**a+1} = {2**x} = 2^{x}\nx = {x} → {p}({x}) + {q} = {p*x+q}")
def t30():  # ลำดับบวกสองพจน์
    a, b = R.choice([(2, 3), (1, 3), (2, 5), (3, 4), (1, 5)]); k = R.choice([9, 10, 12]); L = [a, b]
    while len(L) < k: L.append(L[-1] + L[-2])
    return Q("แบบรูป", f"ลำดับหนึ่งมีพจน์ที่ 1 เป็น {a} พจน์ที่ 2 เป็น {b} และพจน์ถัดไปเท่ากับผลบวกของสองพจน์ก่อนหน้า พจน์ที่ {k} คือจำนวนใด", L[-1], [(L[-2], f"นั่นคือพจน์ที่ {k-1}"), (L[-1] + L[-2], f"นั่นคือพจน์ที่ {k+1}"), (L[-1] - 1, "บวกคลาด")], "เขียนต่อไปเรื่อย ๆ: " + ", ".join(map(str, L)) + f"\nพจน์ที่ {k} = {L[-1]}")


import math, urllib.parse
G = {}
def svg(w, h, body):
    x = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="Sarabun,Tahoma,sans-serif" font-size="15"><rect width="{w}" height="{h}" fill="#fff"/>{body}</svg>'
    return "data:image/svg+xml;charset=utf-8," + urllib.parse.quote(x)
def tx(x, y, t, a="middle", c="#222", s=15): return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{a}" fill="{c}" font-size="{s}">{t}</text>'
def f_stair(k, d):
    u = min(22, 260 // k); W = k*u + 120; H = k*u + 60; b = ""; ox, oy = 30, H - 30
    for i in range(k):
        for j in range(i+1): b += f'<rect x="{ox+i*u}" y="{oy-(j+1)*u}" width="{u}" height="{u}" fill="#FCE7C8" stroke="#C07A2C"/>'
    b += tx(ox + k*u/2, oy + 20, f"มองด้านข้าง: {k} ขั้น") + tx(ox + k*u + 10, oy - k*u/2, f"ลึก {d} ลูก", "start", "#C07A2C")
    return svg(W, H, b)
def f_trap(a, b, h):
    W, H = 340, 210; sc = 260/a; hs = min(130, h*sc*0.9) ; A = (40, 170); B = (40+a*sc, 170); D = (40, 170-hs); C = (40+b*sc, 170-hs)
    P = lambda *q: " ".join(f"{x:.1f},{y:.1f}" for x, y in q)
    g = f'<polygon points="{P(A,B,C)}" fill="#CFE8FF"/><polygon points="{P(A,B,C,D)}" fill="none" stroke="#2E6F9E" stroke-width="2"/><line x1="{A[0]}" y1="{A[1]}" x2="{C[0]:.1f}" y2="{C[1]:.1f}" stroke="#2E6F9E" stroke-dasharray="5 4"/>'
    g += f'<polyline points="{A[0]},{A[1]-12} {A[0]+12},{A[1]-12} {A[0]+12},{A[1]}" fill="none" stroke="#555"/>'
    g += tx(A[0]-12, A[1]+5, "A") + tx(B[0]+12, B[1]+5, "B") + tx(C[0]+8, C[1]-6, "C") + tx(D[0]-12, D[1]+5, "D")
    g += tx((A[0]+B[0])/2, 195, f"{a} ซม.") + tx((D[0]+C[0])/2, D[1]-8, f"{b} ซม.")
    return svg(W, H, g)
def f_clock(h, mm):
    c, r = 110, 90; g = f'<circle cx="{c}" cy="{c}" r="{r}" fill="#FFFBEA" stroke="#333" stroke-width="3"/>'
    for i in range(1, 13):
        a = math.radians(i*30 - 90); g += tx(c + 72*math.cos(a), c + 72*math.sin(a) + 5, str(i))
    for i in range(60):
        a = math.radians(i*6 - 90); r1 = 84 if i % 5 else 80; g += f'<line x1="{c+r1*math.cos(a):.1f}" y1="{c+r1*math.sin(a):.1f}" x2="{c+88*math.cos(a):.1f}" y2="{c+88*math.sin(a):.1f}" stroke="#555"/>'
    ah = math.radians(h*30 + mm*0.5 - 90); am = math.radians(mm*6 - 90)
    g += f'<line x1="{c}" y1="{c}" x2="{c+48*math.cos(ah):.1f}" y2="{c+48*math.sin(ah):.1f}" stroke="#222" stroke-width="6" stroke-linecap="round"/><line x1="{c}" y1="{c}" x2="{c+76*math.cos(am):.1f}" y2="{c+76*math.sin(am):.1f}" stroke="#D2463C" stroke-width="3" stroke-linecap="round"/><circle cx="{c}" cy="{c}" r="5"/>'
    return svg(220, 220, g)
def f_grid(P):
    u, ox, oy, n = 34, 30, 260, 7; g = ""
    for i in range(n+1): g += f'<line x1="{ox+i*u}" y1="{oy}" x2="{ox+i*u}" y2="{oy-n*u}" stroke="#ddd"/><line x1="{ox}" y1="{oy-i*u}" x2="{ox+n*u}" y2="{oy-i*u}" stroke="#ddd"/>' + tx(ox+i*u, oy+18, str(i), s=12) + tx(ox-12, oy-i*u+4, str(i), s=12)
    pt = [(ox+x*u, oy-y*u) for x, y in P]
    g += f'<polygon points="{" ".join(f"{x},{y}" for x, y in pt)}" fill="#CFE8FF" stroke="#2E6F9E" stroke-width="2"/>'
    for (x, y), L in zip(pt, "ABC"): g += f'<circle cx="{x}" cy="{y}" r="4" fill="#2E6F9E"/>' + tx(x+10, y-8, L)
    return svg(290, 290, g)
def f_pie(al, be):
    c, r = 150, 95; g = ""; st = -90
    for ang, lab, col in ((al, "อื่น ๆ", "#FCE7C8"), (be, "หนังสือ", "#CFE8FF"), (360-al-be, "", "#E5F5E0")):
        a1, a2 = math.radians(st), math.radians(st+ang); lg = 1 if ang > 180 else 0
        g += f'<path d="M{c},{c} L{c+r*math.cos(a1):.1f},{c+r*math.sin(a1):.1f} A{r},{r} 0 {lg} 1 {c+r*math.cos(a2):.1f},{c+r*math.sin(a2):.1f} Z" fill="{col}" stroke="#555"/>'
        m = math.radians(st+ang/2)
        rr = 55 if ang >= 60 else 122
        if lab: g += tx(c+rr*math.cos(m), c+rr*math.sin(m), lab) + tx(c+rr*math.cos(m), c+rr*math.sin(m)+17, f"{ang}°", s=13)
        else: g += tx(c+55*math.cos(m), c+55*math.sin(m)+5, "อาหาร / เดินทาง", s=12)
        st += ang
    return svg(300, 300, g).replace('%3Crect%20width%3D%22300%22','%3Crect%20width%3D%22300%22')
def f_tank(w, l, h0, s, k):
    g = '<polygon points="40,60 230,60 280,30 90,30" fill="none" stroke="#2E6F9E"/><rect x="40" y="60" width="190" height="150" fill="none" stroke="#2E6F9E" stroke-width="2"/><polygon points="230,60 280,30 280,180 230,210" fill="none" stroke="#2E6F9E"/>'
    g += '<rect x="40" y="110" width="190" height="100" fill="#CFE8FF" opacity=".8"/><polygon points="230,110 280,80 280,180 230,210" fill="#CFE8FF" opacity=".6"/>'
    g += tx(135, 228, f"ยาว {l} ซม.") + tx(290, 120, f"กว้าง {w} ซม.", "start", s=13) + tx(30, 165, f"น้ำ {h0} ซม.", "end", s=13)
    for i in range(min(k, 6)): g += f'<rect x="{300+(i%3)*24}" y="{170-(i//3)*24}" width="20" height="20" fill="#bbb" stroke="#555"/>'
    g += tx(330, 218, f"หิน {k} ก้อน ด้าน {s} ซม.", s=12)
    return svg(470, 240, f'<g transform="translate(70,0)">{g}</g>')
def f_sq(k):
    u = 200//k; g = "".join(f'<rect x="{20+i*u}" y="{20+j*u}" width="{u}" height="{u}" fill="#FFFBEA" stroke="#555"/>' for i in range(k) for j in range(k))
    return svg(40+k*u, 40+k*u, g)
def f_iso(al):
    be = math.radians((180-al)/2); L = min(220, 380/math.tan(be)); B = (150-L/2, 220); C = (150+L/2, 220); A = (150, 220-L/2*math.tan(be))
    Lac = math.hypot(A[0]-C[0], A[1]-C[1]); ux, uy = (A[0]-C[0])/Lac, (A[1]-C[1])/Lac; dot = (B[0]-C[0])*ux + (B[1]-C[1])*uy; D = (C[0]+2*dot*ux, C[1]+2*dot*uy)
    g = f'<polygon points="{A[0]:.1f},{A[1]:.1f} {B[0]:.1f},{B[1]} {C[0]:.1f},{C[1]}" fill="#FFFBEA" stroke="#2E6F9E" stroke-width="2"/><line x1="{B[0]:.1f}" y1="{B[1]}" x2="{D[0]:.1f}" y2="{D[1]:.1f}" stroke="#D2463C" stroke-width="2"/><circle cx="{D[0]:.1f}" cy="{D[1]:.1f}" r="3" fill="#D2463C"/>'
    g += tx(A[0], A[1]-8, "A") + tx(B[0]-12, B[1]+5, "B") + tx(C[0]+12, C[1]+5, "C") + tx(D[0]+14, D[1]+2, "D") + tx(A[0], A[1]+34, f"{al}°", s=13)
    return svg(300, 240, g)
def f_quart(s):
    S = 200; o = 30; r = S/2; g = f'<rect x="{o}" y="{o}" width="{S}" height="{S}" fill="#FFFBEA" stroke="#333" stroke-width="2"/>'
    for cx, cy in ((o, o), (o+S, o), (o, o+S), (o+S, o+S)): g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#CFE8FF" stroke="#2E6F9E" clip-path="url(#k)"/>'
    g = f'<defs><clipPath id="k"><rect x="{o}" y="{o}" width="{S}" height="{S}"/></clipPath></defs>' + g + tx(o+S/2, o+S+20, f"ด้านละ {s} ซม.") + tx(o+S/2, o+S/2+5, "?", c="#D2463C", s=22)
    return svg(S+60, S+60, g)
def f_insq(r):
    c, R0 = 120, 95; a = R0/math.sqrt(2)
    g = f'<circle cx="{c}" cy="{c}" r="{R0}" fill="#CFE8FF" stroke="#2E6F9E" stroke-width="2"/><rect x="{c-a:.1f}" y="{c-a:.1f}" width="{2*a:.1f}" height="{2*a:.1f}" fill="#fff" stroke="#333" stroke-width="2"/><line x1="{c}" y1="{c}" x2="{c+R0}" y2="{c}" stroke="#D2463C" stroke-dasharray="4 3"/><circle cx="{c}" cy="{c}" r="3"/>' + tx(c+R0/2, c-6, f"{r} ซม.", c="#D2463C", s=13)
    return svg(240, 240, g)

TS = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20, t21, t22, t23, t24, t25, t26, t27, t28, t29, t30]
VAR = 2  # แต่ละแบบสุ่ม 2 ข้อ
items = []
for v in range(VAR):
    for f in TS:
        for _ in range(200):
            G.clear()
            try:
                it = f()
                if G.get('img'): it['img'] = G['img']
                items.append(it); break
            except (ValueError, ZeroDivisionError): pass
        else: raise SystemExit("สร้างไม่ได้: " + f.__name__)
out = []
order = list(range(len(items))); R.shuffle(order)
for i in range(0, len(order), 10):
    out.append({"id": f"m1-sim-{i//10+1}", "subj": "คณิตศาสตร์", "g": 6, "title": f"จำลองข้อสอบเข้า ม.1 คณิตศาสตร์ ชุดที่ {i//10+1}", "level": "ป.6 → ม.1 (แข่งขัน)", "items": [items[j] for j in order[i:i+10]]})
print("/* สร้างอัตโนมัติจาก tools/exam-gen/m1.py · ห้ามแก้มือ */")
print("window.EXAM_BANK=(window.EXAM_BANK||[]).concat(" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ");")
