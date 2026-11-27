# ข้อสอบเข้า ม.1 ชุดฝึก 2 (แนวโรงเรียนห้องพิเศษ) → exam/bank-m2.js · แต่งใหม่ทั้งหมด ตัวเลข/เรื่อง/รูปสุ่มใหม่ คำตอบคำนวณด้วยโปรแกรม
# ใช้ Q()/svg()/tx() จาก m1.py · seed คงที่ ห้ามเปลี่ยนหลังเปิดขาย (เพิ่มชุด = ต่อท้าย)
import random, json, math, os
from fractions import Fraction as F
from math import gcd
_s = open(os.path.join(os.path.dirname(__file__), "m1.py"), encoding="utf-8").read()
exec(_s[:_s.index("def t1():")])            # n, Q, NM, WD
exec(_s[_s.index("import math, urllib.parse"):_s.index("\nTS = [")])  # svg, tx, f_*
R = random.Random(20261128)
P = lambda *q: " ".join(f"{x:.1f},{y:.1f}" for x, y in q)

def f_cyl(d, h, m):
    g = '<ellipse cx="150" cy="40" rx="110" ry="22" fill="none" stroke="#2E6F9E" stroke-width="2"/><line x1="40" y1="40" x2="40" y2="200" stroke="#2E6F9E" stroke-width="2"/><line x1="260" y1="40" x2="260" y2="200" stroke="#2E6F9E" stroke-width="2"/><path d="M40,200 A110,22 0 0 0 260,200" fill="none" stroke="#2E6F9E" stroke-width="2"/><path d="M40,200 A110,22 0 0 1 260,200" fill="none" stroke="#2E6F9E" stroke-dasharray="4 3"/>'
    g += '<rect x="80" y="120" width="140" height="80" fill="#FCE7C8" stroke="#C07A2C"/><ellipse cx="150" cy="120" rx="70" ry="12" fill="#FDF1DE" stroke="#C07A2C"/><path d="M80,200 A70,12 0 0 0 220,200" fill="#FCE7C8" stroke="#C07A2C"/>'
    g += tx(150, 165, f"เค้ก ⌀ {d} นิ้ว", s=13) + tx(150, 182, f"สูง {h} นิ้ว", s=13) + tx(240, 140, f"{m}", c="#D2463C", s=13) + '<line x1="220" y1="150" x2="260" y2="150" stroke="#D2463C" stroke-dasharray="3 2"/>' + '<line x1="150" y1="64" x2="150" y2="108" stroke="#D2463C" stroke-dasharray="3 2"/>' + tx(162, 92, f"{m}", "start", c="#D2463C", s=13)
    return svg(300, 235, g)
def f_zig(p, q):
    D = (110, 90); dd = math.radians(p - 180); L = 110; E = (D[0] + L*math.cos(dd), D[1] - L*math.sin(dd))
    ea = math.radians(p - q); A = (E[0] + 160*math.cos(ea)/math.sin(ea)*math.sin(ea) if False else E[0] + (E[1]-40)/math.tan(ea), 40)
    C = (20, 90); B = (A[0] + 100, 40)
    ar = lambda x, y: f'<polyline points="{x-7},{y-5} {x},{y} {x-7},{y+5}" fill="none" stroke="#222" stroke-width="2"/>'
    g = f'<polyline points="{P(C, D, E, A, B)}" fill="none" stroke="#222" stroke-width="2.5"/>' + ar(70, 90) + ar(A[0]+55, 40)
    g += tx(C[0], 80, "C") + tx(D[0], 80, "D") + tx(E[0], E[1]+20, "E") + tx(A[0], 30, "A") + tx(B[0], 30, "B")
    g += tx(D[0]-12, D[1]+30, f"{p}°", s=13) + tx(E[0]+10, E[1]-30, f"{q}°", "start", s=13)
    return svg(max(330, int(B[0]) + 20), 245, g)
def f_semi(D):
    o, Rr = 30, 130; r = Rr/2; cx, cy = o + Rr, 160
    g = f'<path d="M{o},{cy} A{Rr},{Rr} 0 0 1 {o+2*Rr},{cy} Z" fill="#fff" stroke="#222" stroke-width="2"/>'
    g += f'<path d="M{o},{cy} A{r},{r} 0 0 1 {o+2*r},{cy} Z" fill="#c9c9c9" stroke="#222"/><path d="M{cx},{cy} A{r},{r} 0 0 1 {o+2*Rr},{cy} Z" fill="#c9c9c9" stroke="#222"/><circle cx="{cx}" cy="{cy-r}" r="{r}" fill="#c9c9c9" stroke="#222"/>'
    g += f'<clipPath id="c1"><circle cx="{cx}" cy="{cy-r}" r="{r}"/></clipPath><g clip-path="url(#c1)"><path d="M{o},{cy} A{r},{r} 0 0 1 {o+2*r},{cy} Z" fill="#fff" stroke="#222"/><path d="M{cx},{cy} A{r},{r} 0 0 1 {o+2*Rr},{cy} Z" fill="#fff" stroke="#222"/></g><circle cx="{cx}" cy="{cy-r}" r="{r}" fill="none" stroke="#222"/>'
    g += f'<line x1="{o}" y1="{cy+20}" x2="{o+2*Rr}" y2="{cy+20}" stroke="#555"/>' + tx(cx, cy+16+20, f"{D} ซม.")
    return svg(2*Rr + 60, 205, g)
def f_piex(sl):
    c, r = 170, 100; st = -90; g = ""
    for ang, lab in sl:
        a1, a2 = math.radians(st), math.radians(st + ang)
        g += f'<path d="M{c},{c} L{c+r*math.cos(a1):.1f},{c+r*math.sin(a1):.1f} A{r},{r} 0 {1 if ang>180 else 0} 1 {c+r*math.cos(a2):.1f},{c+r*math.sin(a2):.1f} Z" fill="#fff" stroke="#222" stroke-width="1.5"/>'
        m = math.radians(st + ang/2); rr = 60 if ang >= 50 else 125
        g += tx(c + rr*math.cos(m), c + rr*math.sin(m) + 5, lab, s=13); st += ang
    g += f'<polyline points="{c},{c-12} {c+12},{c-12} {c+12},{c}" fill="none" stroke="#222"/>'
    return svg(340, 340, g)
def f_sqs(a, b, c):
    k = 300/(a+b+c); o, base = 20, 20 + a*k
    g = f'<polygon points="{P((o, base-a*k), (o+a*k, base-b*k), (o+(a+b+c)*k, base))}" fill="#c9c9c9"/>'
    g += f'<rect x="{o}" y="{base-a*k:.1f}" width="{a*k:.1f}" height="{a*k:.1f}" fill="none" stroke="#222"/><rect x="{o+a*k:.1f}" y="{base-b*k:.1f}" width="{b*k:.1f}" height="{b*k:.1f}" fill="none" stroke="#222"/><rect x="{o+(a+b)*k:.1f}" y="{base-c*k:.1f}" width="{c*k:.1f}" height="{c*k:.1f}" fill="none" stroke="#222"/>'
    g += f'<polyline points="{P((o, base-a*k), (o+a*k, base-b*k), (o+(a+b+c)*k, base))}" fill="none" stroke="#222" stroke-width="2"/><line x1="{o}" y1="{base-a*k:.1f}" x2="{o+(a+b+c)*k:.1f}" y2="{base}" stroke="#222" stroke-width="2"/>'
    g += tx(o+a*k/2, base+18, str(a)) + tx(o+(a+b/2)*k, base+18, str(b)) + tx(o+(a+b+c/2)*k, base+18, str(c))
    return svg(340, int(base) + 30, g)
def f_line(A, B, x0):
    u, h, ox, oy = 32, 24, 40, 200; n = 10; g = ""
    for i in range(n+1): g += f'<line x1="{ox+i*u}" y1="{oy}" x2="{ox+i*u}" y2="{oy-7*h}" stroke="#ddd"/>' + (tx(ox+i*u, oy+16, str(x0+i), s=12) if i < n else "")
    for j in range(8): g += f'<line x1="{ox}" y1="{oy-j*h}" x2="{ox+n*u}" y2="{oy-j*h}" stroke="#ddd"/>' + tx(ox-10, oy-j*h+4, str(j), s=12)
    for d, dash in ((A, "6 4"), (B, "")):
        pts = [(ox+(s-x0)*u, oy-v*h) for s, v in sorted(d.items())]
        g += f'<polyline points="{P(*pts)}" fill="none" stroke="#222" stroke-width="2" stroke-dasharray="{dash}"/>' + "".join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3"/>' for x, y in pts)
    g += '<line x1="370" y1="40" x2="395" y2="40" stroke="#222" stroke-width="2" stroke-dasharray="6 4"/><line x1="370" y1="62" x2="395" y2="62" stroke="#222" stroke-width="2"/>' + tx(400, 45, "กลุ่ม A", "start", s=13) + tx(400, 67, "กลุ่ม B", "start", s=13)
    g += tx(ox-6, 18, "ความถี่", "start", s=12) + tx(ox+n*u-10, oy+34, "คะแนน", s=12)
    return svg(460, 245, g)
def f_hex():
    c, r = 130, 90; V = {L: (c + r*math.cos(math.radians(a)), c - r*math.sin(math.radians(a))) for L, a in zip("ABCDEF", (120, 60, 0, -60, -120, 180))}; X = (c, c)
    g = f'<polygon points="{P(V["A"], V["B"], V["C"])}" fill="#c9c9c9"/><polygon points="{P(V["A"], X, V["E"])}" fill="#c9c9c9"/>'
    g += f'<polygon points="{P(*[V[k] for k in "ABCDEF"])}" fill="none" stroke="#222" stroke-width="2"/><polyline points="{P(V["C"], V["A"], V["E"])}" fill="none" stroke="#222"/><polyline points="{P(V["A"], X, V["E"])}" fill="none" stroke="#222"/><circle cx="{c}" cy="{c}" r="3"/>'
    for k, (dx, dy) in zip("ABCDEF", ((-6, -10), (6, -10), (16, 5), (6, 20), (-6, 20), (-16, 5))): g += tx(V[k][0]+dx, V[k][1]+dy, k)
    return svg(260, 260, g + tx(c+14, c+5, "X", "start"))

def hm(m): return f"{(m//60) % 24:02d}:{m % 60:02d} น."
def du(m): return f"{m//60} ชั่วโมง {m % 60} นาที" if m >= 60 else f"{m} นาที"
def rai(w):
    r, g_, v = w//400, (w % 400)//100, w % 100
    return " ".join(x for x in (f"{r} ไร่" if r else "", f"{g_} งาน" if g_ else "", f"{v} ตารางวา" if v else "") if x) or "0 ตารางวา"

def g1():  # กล่องทรงกระบอกรอบเค้ก
    rr = R.choice([7, 14]); m = R.choice([2, 3, 4]); d = 2*(rr - m); h = R.choice([3, 4, 5, 6]); pi = F(22, 7); V = pi*rr*rr*(h+m)
    G['img'] = f_cyl(d, h, m)
    nm = R.choice(NM)
    return Q("ปริมาตร", f"{nm}ทำกล่องทรงกระบอกใส่ขนมเค้ก เค้กมีเส้นผ่านศูนย์กลาง {d} นิ้ว สูง {h} นิ้ว โดยให้ข้างกล่องและฝากล่องห่างจากเค้ก {m} นิ้วทุกด้าน (เค้กวางชิดก้นกล่อง) กล่องมีปริมาตรกี่ลูกบาศก์นิ้ว (π ≈ 22/7)", V, [(pi*rr*rr*(h+2*m), "เค้กวางชิดก้นกล่อง จึงเว้นแค่ด้านบน ไม่ต้องบวกความสูงสองครั้ง"), (pi*rr*rr*h, "ลืมเว้นระยะด้านบน (ฝากล่อง)"), (3*rr*rr*(h+m), "ต้องใช้ π ≈ 22/7 ตามที่โจทย์กำหนด ไม่ใช่ 3")], f"รัศมีกล่อง = {d} ÷ 2 + {m} = {rr} นิ้ว\nความสูงกล่อง = {h} + {m} = {h+m} นิ้ว\nปริมาตร = 22/7 × {rr} × {rr} × {h+m} = {n(V)} ลูกบาศก์นิ้ว", "ลบ.นิ้ว")
def g2():  # มุมเส้นขนาน
    for _ in range(50):
        p = R.randrange(110, 150, 5); q = R.randrange(40, 80, 5)
        if 25 <= p - q <= 85: break
    else: raise ValueError
    ans = 180 - p + q; G['img'] = f_zig(p, q)
    return Q("มุมและเส้นขนาน", f"จากรูป AB ขนานกับ CD มุม CDE = {p}° และมุม AED = {q}° มุม BAE มีขนาดกี่องศา", ans, [(180 - p, "นั่นคือผลต่างของมุม BAE กับมุม DEA"), (p - q, "นั่นคือมุมที่ EA ทำกับแนวนอน"), (180 - q, "ลืมใช้มุม CDE")], f"ลากเส้นผ่าน E ขนานกับ AB และ CD\nมุมที่ ED ทำกับเส้นขนาน = 180 − {p} = {180-p}°\nมุมที่ EA ทำกับเส้นขนาน = {q} − {180-p} = {q-180+p}° (มุมแย้ง)\nมุม BAE = 180 − {q-180+p} = {ans}°", "องศา")
def g3():  # จำนวนที่มากที่สุดหารแล้วเหลือเศษ
    for _ in range(200):
        P_ = R.randint(11, 25); r1, r2 = R.randint(2, P_-1), R.randint(2, P_-1); a = P_*R.randint(3, 7) + r1; b = P_*R.randint(2, 6) + r2
        if gcd(a - r1, b - r2) == P_ and a != b: break
    else: raise ValueError
    N = R.randint(100, 300); r = N % P_; g2_ = gcd(a, b)
    return Q("ห.ร.ม.", f"ถ้า P เป็นจำนวนนับที่มากที่สุดที่หาร {a} แล้วเหลือเศษ {r1} และหาร {b} แล้วเหลือเศษ {r2} เมื่อนำ {N} ไปหารด้วย P จะเหลือเศษเท่าไร", str(r), [(str(N % g2_) if g2_ > 1 and N % g2_ != r else str((r+1) % P_), "ต้องลบเศษออกก่อนหา ห.ร.ม."), (str(P_), f"{P_} คือค่า P ไม่ใช่เศษ"), (str(N // P_), "นั่นคือผลหาร ไม่ใช่เศษ")], f"P หาร {a} − {r1} = {a-r1} และ {b} − {r2} = {b-r2} ลงตัว\nP = ห.ร.ม. ของ {a-r1} กับ {b-r2} = {P_}\n{N} ÷ {P_} = {N//P_} เศษ {r}")
def g4():  # อายุ
    m = R.randint(9, 14); k = R.choice([4, 5]); y = R.randint(2560, 2569); mom = k*(m+5) - 5
    if not 30 <= mom <= 85: raise ValueError
    ans = y + mom - m
    return Q("โจทย์อายุ", f"อีก 5 ปีข้างหน้า ฉันจะมีอายุเป็น 1/{k} ของอายุแม่ ในปี พ.ศ. {y} ฉันอายุ {m} ปี ในปี พ.ศ. ใดฉันจะมีอายุเท่ากับอายุแม่ในปีนี้", str(ans), [(str(ans + 5), "บวกอีก 5 ปีซ้ำ"), (str(y + mom), "ต้องบวกแค่ผลต่างอายุ ไม่ใช่อายุแม่ทั้งหมด"), (str(ans - 5), "อายุแม่ในอีก 5 ปีคือ {x} ต้องลบ 5 ก่อน".replace("{x}", str(mom+5)))], f"อีก 5 ปี ฉันอายุ {m+5} → แม่อายุ {m+5} × {k} = {k*(m+5)} → ปีนี้แม่อายุ {mom}\nฉันต้องรออีก {mom} − {m} = {mom-m} ปี\nพ.ศ. {y} + {mom-m} = {ans}")
def g5():  # แท็กซี่
    k = R.choice([1, 2, 3]); Fe = R.choice([35, 38, 40, 45]); p = R.choice([4, 5, 6, 7]); x = R.randint(60, 180); T = Fe + p*x
    return Q("โจทย์ปัญหา", f"ค่าโดยสารรถแท็กซี่ {k} กิโลเมตรแรก คิด {Fe} บาท และทุก ๆ 1 กิโลเมตรที่เพิ่มขึ้นคิดกิโลเมตรละ {p} บาท ถ้าจ่ายค่าโดยสาร {T:,} บาท รถวิ่งได้ระยะทางทั้งหมดกี่กิโลเมตร", k + x, [(x, f"นั่นคือระยะที่เพิ่ม ลืมบวก {k} กม.แรก"), (T // p, f"ต้องหักค่า {k} กม.แรก {Fe} บาทก่อน"), (k + x + 1, "นับเกินไป 1")], f"เงินส่วนที่เกิน = {T:,} − {Fe} = {T-Fe:,} บาท\nระยะเพิ่ม = {T-Fe:,} ÷ {p} = {x} กม.\nรวม {k} + {x} = {k+x} กม.", "กม.")
def g6():  # ครึ่งวงกลม + วงกลม
    D = R.choice([14, 28, 42, 56]); Rr = F(D, 2); r = Rr/2; pi = F(22, 7)
    big = pi*Rr*Rr/2; lens = r*r*(pi/2 - 1); shade = 2*pi*r*r - 4*lens; ans = big - shade
    G['img'] = f_semi(D)
    return Q("พื้นที่", f"จากรูป ครึ่งวงกลมใหญ่มีเส้นผ่านศูนย์กลาง {D} ซม. ภายในมีครึ่งวงกลมเล็ก 2 รูป และวงกลม 1 วง ขนาดเท่ากัน (เส้นผ่านศูนย์กลาง {n(Rr)} ซม.) พื้นที่ส่วนที่ไม่แรเงาภายในครึ่งวงกลมใหญ่เท่ากับกี่ ตร.ซม. (π ≈ 22/7)", ans, [(shade, "นั่นคือพื้นที่ส่วนที่แรเงา"), (big - 2*pi*r*r, "ลืมว่าส่วนซ้อนรูปใบไม้ไม่ได้แรเงา"), (big - shade - 2*lens, "นับส่วนซ้อนรูปใบไม้ไม่ครบ")], f"ครึ่งวงกลมใหญ่ = 1/2 × 22/7 × {n(Rr)}² = {n(big)}\nส่วนซ้อนรูปใบไม้ 1 ชิ้น = r² × (π/2 − 1) = {n(lens)} (มี 2 ชิ้น)\nแรเงา = (วงกลม + ครึ่งวงกลมเล็ก 2 รูป) − ใบไม้ 2 ชิ้นจากแต่ละฝั่ง = {n(2*pi*r*r)} − {n(4*lens)} = {n(shade)}\nไม่แรเงา = {n(big)} − {n(shade)} = {n(ans)} ตร.ซม.", "ตร.ซม.")
def g7():  # เสารั้ว
    for _ in range(100):
        w, L = R.choice([8, 9, 10, 12, 14, 15, 16, 18]), R.choice([20, 24, 28, 30, 32, 36, 40])
        if L % 2 == 0 and L > w: break
    s = gcd(w, L//2); ans = L//s + 1 + 3*w//s
    return Q("แบบรูปและการนับ", f"ที่ดินรูปสี่เหลี่ยมผืนผ้า กว้าง {w} เมตร ยาว {L} เมตร ด้านยาวด้านหนึ่งติดแม่น้ำ ต้องการล้อมรั้วโดยไม่ทำด้านที่ติดแม่น้ำ และทำรั้วกั้นกลางที่ดินจากด้านยาวอีกด้านตรงไปถึงริมแม่น้ำ แบ่งที่ดินเป็น 2 แปลงเท่ากัน ถ้าปักเสาทุกมุมและทุกปลายรั้ว และเสาบนรั้วทุกแนวห่างกันเท่า ๆ กัน จะต้องใช้เสาน้อยที่สุดกี่ต้น", ans, [(ans + 1, "นับเสาตรงจุดที่รั้วกั้นกลางชนรั้วด้านยาวซ้ำ"), (ans - w//s, "ลืมรั้วกั้นกลาง"), (L//s + 1 + 2*w//s + 2, "นับเสามุมซ้ำ")], f"ระยะห่างเสามากที่สุด = ห.ร.ม. ของ {w} กับ {L//2} = {s} เมตร\nด้านยาว {L//s + 1} ต้น · ด้านกว้าง 2 ด้าน เพิ่มด้านละ {w//s} ต้น · รั้วกั้นกลางเพิ่ม {w//s} ต้น\nรวม {L//s+1} + {2*w//s} + {w//s} = {ans} ต้น", "ต้น")
def g8():  # ผสมคอนกรีต
    for _ in range(100):
        a, b = R.choice([(2, 3), (1, 2), (1, 3), (2, 5)]); c, d = R.choice([(4, 3), (3, 2), (5, 4), (2, 1)]); C = R.choice([4, 6, 8, 10, 12])
        s = F(C*b, a); st = s*d/c
        if s.denominator == 1 and (st*4).denominator == 1: break
    else: raise ValueError
    f = lambda x, y: f"ทราย {n(x)} ถัง และหิน {n(y)} ถัง"
    return Q("อัตราส่วน", f"ในการผสมคอนกรีต อัตราส่วนปูนต่อทรายเป็น {a} : {b} และอัตราส่วนทรายต่อหินเป็น {c} : {d} ถ้าใช้ปูน {C} ถัง จะต้องใช้ทรายและหินอย่างละกี่ถัง", f(s, st), [(f(s, F(C*d, c)), "หินต้องคิดจากทราย ไม่ใช่จากปูน"), (f(s*c/b if s*c/b != s else s+3, st), "ทรายคิดจาก ปูน × {b}/{a}".replace("{b}", str(b)).replace("{a}", str(a))), (f(s, s*c/d), "ทราย : หิน = {c} : {d} กลับข้างไม่ได้".replace("{c}", str(c)).replace("{d}", str(d)))], f"ทราย = {C} × {b}/{a} = {n(s)} ถัง\nหิน = {n(s)} × {d}/{c} = {n(st)} ถัง")
def g9():  # ตารางเวลา งานคู่ขนาน
    for _ in range(100):
        W = [[R.randint(120, 600) for _ in range(k)] for k in (2, 3, 3)]; T = [sum(x) for x in W]
        if len(set(T)) == 3 and max(T) != T[2]: break
    dl = R.randint(60, 150); arr = R.randint(6*60, 10*60); lat = (arr - dl - max(T)) % 1440
    rows = "\n".join(f"พนักงาน {i+1}: " + " → ".join(du(x) for x in w) for i, w in enumerate(W))
    return Q("เวลา", f"ร้านขนมมีพนักงาน 3 คน ทุกคนเริ่มงานพร้อมกัน แต่ละคนทำงานของตัวเองเรียงตามลำดับ ใช้เวลาดังนี้\n{rows}\nเมื่อทุกคนทำเสร็จ ต้องใช้เวลาจัดส่งอีก {dl} นาที ถ้าลูกค้าได้รับขนมเวลา {hm(arr)} เวลาที่ช้าที่สุดที่ทั้งสามคนจะเริ่มงานได้คือเวลาใด", hm(lat), [(hm((arr - dl - T[2]) % 1440), "ต้องใช้เวลาของคนที่ทำนานที่สุด ไม่ใช่พนักงานคนที่ 3"), (hm((arr - max(T)) % 1440), f"ลืมหักเวลาจัดส่ง {dl} นาที"), (hm((arr - dl - min(T)) % 1440), "ใช้เวลาของคนที่เสร็จเร็วที่สุด ทำให้ส่งไม่ทัน")], "เวลารวมแต่ละคน: " + " · ".join(du(t) for t in T) + f"\nนานที่สุด {du(max(T))} + จัดส่ง {dl} นาที = {du(max(T)+dl)}\nย้อนจาก {hm(arr)} → เริ่มช้าสุด {hm(lat)} (ของวันก่อนหน้า ถ้าเลยเที่ยงคืน)")
def g10():  # แผนภูมิวงกลมมี x
    for _ in range(300):
        r_, h_, p_ = R.choice([54, 60, 72, 80]), R.choice([12, 18, 20, 24]), R.choice([30, 36, 40, 45]); rest = 360 - 90 - r_ - h_ - p_
        if rest % 4: continue
        x = rest//4; G_ = R.choice([40, 60, 80, 90, 100, 120]); per = F(G_, x); ans = per*(90 + r_)
        if x >= 20 and ans.denominator == 1: break
    else: raise ValueError
    ans = int(ans); G['img'] = f_piex([(90, "สวนผลไม้"), (p_, f"เลี้ยงหมู {p_}°"), (h_, f"ที่อยู่ {h_}°"), (x, "ผักสวนครัว x°"), (r_, f"ทำนา {r_}°"), (3*x, "บ่อปลา 3x°")])
    return Q("แผนภูมิวงกลม", f"ที่ดินแปลงหนึ่งแบ่งพื้นที่ดังแผนภูมิวงกลม (สวนผลไม้เป็นมุมฉาก) ถ้าพื้นที่ปลูกผักสวนครัวเป็น {G_} ตารางวา พื้นที่สวนผลไม้รวมกับพื้นที่ทำนาเป็นเท่าใด (1 ไร่ = 4 งาน, 1 งาน = 100 ตารางวา)", rai(ans), [(rai(int(per*90)), "ลืมรวมพื้นที่ทำนา"), (rai(int(per*(90+r_)) + 100), "แปลงหน่วยคลาด 1 งาน = 100 ตารางวา"), (rai(int(per*(90+3*x))), "บวกบ่อปลาแทนทำนา")], f"4x = 360 − 90 − {r_} − {h_} − {p_} = {4*x} → x = {x}°\n{x}° = {G_} ตร.วา → สวนผลไม้ + ทำนา = {90+r_}° = {ans} ตร.วา = {rai(ans)}")
def g11():  # สี่เหลี่ยมจัตุรัส 3 รูป
    for _ in range(100):
        a = R.randint(10, 18); b = R.randint(a-5, a-2); c = R.randint(max(3, b-5), b-2)
        up = F((a+b)*a, 2) + F((b+c)*b, 2); dg = F((a+b+c)*a, 2); ans = up - dg
        if ans > 5: break
    G['img'] = f_sqs(a, b, c)
    return Q("พื้นที่", f"รูปสี่เหลี่ยมจัตุรัส 3 รูป ยาวด้านละ {a}, {b} และ {c} หน่วย วางเรียงกันดังรูป พื้นที่ส่วนที่แรเงาเท่ากับกี่ตารางหน่วย", ans, [(dg, "นั่นคือพื้นที่ใต้เส้นทแยงยาว"), (up, "นั่นคือพื้นที่ใต้เส้นบน ต้องลบใต้เส้นทแยงยาวออก"), (ans + F(c*c, 2), "ลบพื้นที่ใต้เส้นไม่ครบ")], f"ใต้เส้นบน = คางหมู 1/2 × ({a} + {b}) × {a} + สามเหลี่ยม 1/2 × ({b} + {c}) × {b} = {n(up)}\nใต้เส้นทแยงยาว = 1/2 × {a+b+c} × {a} = {n(dg)}\nแรเงา = {n(up)} − {n(dg)} = {n(ans)}", "ตร.หน่วย")
def g12():  # กราฟเส้น 2 กลุ่ม หาข้อความที่ผิด
    x0 = R.choice([20, 30, 40, 50]); aL = x0 + R.randint(0, 1); aH = aL + R.randint(4, 6); bL = aL + R.randint(2, 4); bH = max(aH + R.randint(1, 3), bL + 4)
    if bH > x0 + 9: raise ValueError
    A = {s: R.randint(1, 6) for s in range(aL, aH+1)}; B = {s: R.randint(1, 7) for s in range(bL, bH+1)}
    both = [s for s in A if s in B]; s = R.choice(both)
    tru = [f"มีนักเรียน {A[s]+B[s]} คนได้ {s} คะแนนเท่ากัน", f"นักเรียนกลุ่ม A ได้คะแนนต่ำสุด {A[aL]} คน", f"คะแนนต่ำสุดของกลุ่ม B มากกว่าของกลุ่ม A อยู่ {bL-aL} คะแนน", f"คะแนนสูงสุดของกลุ่ม B มากกว่าของกลุ่ม A อยู่ {bH-aH} คะแนน"]
    fal = [f"มีนักเรียน {A[s]+B[s]+1} คนได้ {s} คะแนนเท่ากัน", f"นักเรียนกลุ่ม A ได้คะแนนต่ำสุด {A[aL]+1} คน", f"คะแนนต่ำสุดของกลุ่ม B มากกว่าของกลุ่ม A อยู่ {bL-aL+1} คะแนน", f"คะแนนสูงสุดของกลุ่ม B มากกว่าของกลุ่ม A อยู่ {bH-aH+1} คะแนน"]
    i = R.randrange(4); why = [f"ถูกแล้ว: กลุ่ม A {A[s]} คน + กลุ่ม B {B[s]} คน", f"ถูกแล้ว: คะแนนต่ำสุดกลุ่ม A คือ {aL} มี {A[aL]} คน", f"ถูกแล้ว: {bL} − {aL} = {bL-aL}", f"ถูกแล้ว: {bH} − {aH} = {bH-aH}"]
    G['img'] = f_line(A, B, x0)
    return Q("อ่านกราฟ", "กราฟเส้นแสดงผลการสอบของนักเรียน 2 กลุ่ม ข้อใดไม่ถูกต้อง", fal[i], [(tru[j], "ข้อความนี้" + why[j]) for j in range(4) if j != i], "อ่านแกนนอน = คะแนน แกนตั้ง = จำนวนคน\n" + "\n".join(why[j] for j in range(4) if j != i) + f"\nข้อที่ผิดคือ “{fal[i]}”")
def g13():  # หกเหลี่ยมด้านเท่า
    S = R.choice([36, 48, 54, 60, 72, 84, 90, 96, 108, 120]); G['img'] = f_hex()
    return Q("พื้นที่", f"รูปหกเหลี่ยมด้านเท่ามุมเท่า ABCDEF มีพื้นที่ {S} ตารางหน่วย X เป็นจุดศูนย์กลาง พื้นที่ส่วนที่แรเงา (สามเหลี่ยม ABC และสามเหลี่ยม AXE) รวมกันเท่ากับกี่ตารางหน่วย", S//3, [(S//6, "นั่นคือพื้นที่สามเหลี่ยมเพียงรูปเดียว"), (S//2, "แรเงามี 2 ส่วน ส่วนละ 1/6 ของทั้งหมด"), (S//3 + S//6, "นับสามเหลี่ยมด้านเท่าเกิน")], f"หกเหลี่ยมแบ่งเป็นสามเหลี่ยมด้านเท่า 6 รูป รูปละ {S} ÷ 6 = {S//6}\nสามเหลี่ยม ABC = ครึ่งหนึ่งของ ABCX = {S//6}\nสามเหลี่ยม AXE = ครึ่งหนึ่งของ AFEX = {S//6}\nรวม {S//3} ตารางหน่วย", "ตร.หน่วย")

TS = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13]
VAR = 3; items = []; seen = set()
for v in range(VAR):
    for f in TS:
        for _ in range(300):
            G.clear()
            try:
                it = f()
                key = it["q"] + "|".join(sorted(it["c"]))
                if key in seen: continue
                if G.get('img'): it['img'] = G['img']
                seen.add(key); items.append(it); break
            except (ValueError, ZeroDivisionError): pass
        else: raise SystemExit("สร้างไม่ได้: " + f.__name__)
order = list(range(len(items))); R.shuffle(order); out = []
for k, i in enumerate(range(0, len(order), 13)):
    out.append({"id": f"m1-gtr-{k+1}", "subj": "คณิตศาสตร์", "g": 6, "title": f"แนวข้อสอบเข้า ม.1 ห้องเรียนพิเศษ คณิตศาสตร์ ชุดที่ {k+1}", "level": "ป.6 → ม.1 (ห้องพิเศษ)", "items": [items[j] for j in order[i:i+13]]})
print("/* สร้างอัตโนมัติจาก tools/exam-gen/m2.py · ห้ามแก้มือ */")
print("window.EXAM_BANK=(window.EXAM_BANK||[]).concat(" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ");")
