/* ไอคอนประจำร้าน Excel Data Master
   ทรง "กระดาษพับมุม" (เหมือนแผ่นเอกสาร/สเปรดชีต) สีตามหมวด ลายเส้นขาวหนา + เงาสีอ่อนในตัว
   ใช้: EDM_ICON("bill")  ได้ <svg> สำหรับใส่ในปุ่ม/เมนู · EDM_ICON_FOR(route) หาไอคอนจากชื่อหน้า */
(function () {
  "use strict";
  var F = 'fill="#fff" fill-opacity=".34" stroke="none"';
  var G = {
    clock: '<circle ' + F + ' cx="12" cy="12.5" r="8.5"/><circle cx="12" cy="12.5" r="8.5"/><path d="M12 8v4.8l3.2 2M9.5 2.8h5"/>',
    home: '<path ' + F + ' d="M4.5 11 12 4.6l7.5 6.4V20h-15z"/><path d="M3 11.6 12 4l9 7.6M5.5 10v10h13V10M10 20v-5.5h4V20"/>',
    bill: '<path ' + F + ' d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 15.5h3.5"/>',
    cart: '<path ' + F + ' d="M6.6 7h13.6l-2.1 8.2H8.3z"/><path d="M2.8 4h2.6l2.4 11.2h10.4l2.2-8.4H6.4"/><circle cx="9" cy="19.6" r="1.4" fill="#fff"/><circle cx="17" cy="19.6" r="1.4" fill="#fff"/>',
    box: '<path ' + F + ' d="M12 3 20.5 7.5 12 12 3.5 7.5z"/><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    boxin: '<path ' + F + ' d="M4 11h16v9H4z"/><path d="M4 11h16v9H4zM9 14.5h6M12 2.5v6M9.2 5.8 12 8.6l2.8-2.8"/>',
    coins: '<ellipse ' + F + ' cx="9" cy="7" rx="5.5" ry="2.6"/><path d="M3.5 7c0-1.4 2.5-2.6 5.5-2.6s5.5 1.2 5.5 2.6-2.5 2.6-5.5 2.6S3.5 8.4 3.5 7zM3.5 7v4c0 1.4 2.5 2.6 5.5 2.6M3.5 11v4c0 1.4 2.5 2.6 5.5 2.6"/><circle ' + F + ' cx="16" cy="15.5" r="5"/><circle cx="16" cy="15.5" r="5"/><path d="M16 13v5"/>',
    chart: '<rect x="4.5" y="12" width="3.6" height="7.5" rx="1" fill="#fff" stroke="none"/><rect x="10.2" y="7.5" width="3.6" height="12" rx="1" ' + F + '/><rect x="15.9" y="4" width="3.6" height="15.5" rx="1" fill="#fff" stroke="none"/><path d="M3 21h18"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.4" fill="#fff"/><circle cx="9" cy="17" r="2.4" fill="#fff"/><path ' + F + ' d="M4 11h16v2H4z"/>',
    cup: '<path ' + F + ' d="M4 9h12v4.5A5.5 5.5 0 0 1 10.5 19h-1A5.5 5.5 0 0 1 4 13.5z"/><path d="M4 9h12v4.5A5.5 5.5 0 0 1 10.5 19h-1A5.5 5.5 0 0 1 4 13.5zM16 10.5h1.3a2.6 2.6 0 0 1 0 5.2H16M7.5 3.3c-.7 1 .7 1.7 0 2.7M11.5 3.3c-.7 1 .7 1.7 0 2.7"/>',
    calendar: '<rect ' + F + ' x="3.5" y="5" width="17" height="5" rx="1"/><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8.5 15l2.4 2.4 4.6-4.6"/>',
    list: '<rect ' + F + ' x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 8h9M8 12h9M8 16h6"/><circle cx="5.6" cy="8" r=".2"/><circle cx="5.6" cy="12" r=".2"/><circle cx="5.6" cy="16" r=".2"/>',
    bed: '<path ' + F + ' d="M3 12h18v4H3z"/><path d="M3 6v13M21 12v7M3 16h18M3 12h18M6.5 12V9.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V12"/>',
    glass: '<path ' + F + ' d="M6.5 9.5h11l-1.3 10.2a1.5 1.5 0 0 1-1.5 1.3H9.3a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M5.5 5.5h13l-1.8 14.2a1.5 1.5 0 0 1-1.5 1.3H8.8a1.5 1.5 0 0 1-1.5-1.3zM13 5.5l2-3"/><circle cx="10.5" cy="13" r="1" fill="#fff"/><circle cx="13.5" cy="16" r="1" fill="#fff"/>',
    menu: '<path ' + F + ' d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17V5.5A1.5 1.5 0 0 1 6.5 4H19v13M5 17a3 3 0 0 0 3 3h11V17H8a3 3 0 0 0-3 3M9 8.5h6M9 12h4"/>',
    jar: '<path ' + F + ' d="M6.5 11h11v8a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z"/><path d="M7.5 3.5h9v3h-9zM6.5 6.5h11a1.5 1.5 0 0 1 0 0v12.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z"/><path d="M10 14.5h4"/>',
    drawer: '<path ' + F + ' d="M3.5 13h17v6.5h-17z"/><path d="M5 4h14v6H5zM3.5 13h17v6.5h-17zM3.5 13 5 10M20.5 13 19 10M10 16h4M8 7h3"/>',
    register: '<path ' + F + ' d="M4 13h16v7H4z"/><path d="M4 13h16v7H4zM6 13V9h12v4M8 9V4h8v5M10 6.5h4M8.5 16.5h2M13.5 16.5h2"/>',
    wallet: '<path ' + F + ' d="M3 10.5h18v9H3z"/><rect x="3" y="6.5" width="18" height="13" rx="2.5"/><path d="M3 10.5h18M7 6.5 9 3.6l7 2.9"/><circle cx="16.5" cy="15" r="1.4" fill="#fff"/>',
    store: '<path ' + F + ' d="M5 11.5h14V20H5z"/><path d="M3.5 9 5.3 4h13.4l1.8 5"/><path d="M3.5 9a2.8 2.8 0 0 0 5.7 0 2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.7 0M5 11.5V20h14v-8.5M10 20v-5h4v5"/>',
    sheet: '<rect ' + F + ' x="3.5" y="4" width="6" height="16"/><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M3.5 14.5h17M9.5 4v16"/>',
    doc: '<path ' + F + ' d="M8.5 11h7v6.5h-7z"/><path d="M7 3h7.5L19 7.5V21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14.5 3v4.5H19M8.5 11h7v6.5h-7zM8.5 14.2h7M12 11v6.5"/>',
    more: '<rect ' + F + ' x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect ' + F + ' x="13.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    data: '<ellipse ' + F + ' cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6c0-1.5 3.4-2.8 7.5-2.8s7.5 1.3 7.5 2.8-3.4 2.8-7.5 2.8S4.5 7.5 4.5 6zM4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    users: '<circle ' + F + ' cx="9" cy="8" r="3.5"/><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>'
  };
  // สีพื้นของแต่ละไอคอน (โทนเดียวกับแบรนด์ อ่านง่ายบนพื้นขาวและแถบดำ)
  var C = {
    home: "#0E6B43", bill: "#149060", cart: "#D4485C", box: "#D98A0B", boxin: "#D98A0B", coins: "#0E8C94", chart: "#2F6FD6",
    sliders: "#5B6B7F", cup: "#8B5A3C", calendar: "#7A4FC2", list: "#2F6FD6", bed: "#7A4FC2", glass: "#C26A2E", menu: "#B7791F",
    jar: "#D4485C", drawer: "#0E8C94", register: "#149060", wallet: "#C2410C", store: "#0E6B43", sheet: "#1F7A45", doc: "#0E8A5F",
    more: "#5B6B7F", data: "#5B6B7F", users: "#0E8C94", clock: "#0E7490"
  };
  function icon(k, opt) {
    var g = G[k]; if (!g) return "";
    var c = (opt && opt.color) || C[k] || "#0E6B43", cls = (opt && opt.cls) || "";
    return '<svg class="edm-ic ' + cls + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<path d="M7 1.5h15.5L30.5 9.5V25a5.5 5.5 0 0 1-5.5 5.5H7A5.5 5.5 0 0 1 1.5 25V7A5.5 5.5 0 0 1 7 1.5z" fill="' + c + '"/>' +
      '<path d="M22.5 1.5v4.3a3.7 3.7 0 0 0 3.7 3.7h4.3z" fill="#fff" fill-opacity=".42"/>' +
      '<g transform="translate(5.5 6.5) scale(.86)" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' + g + "</g></svg>";
  }
  // หน้า / หมวด → ไอคอน
  var R = {
    home: "home", setup: "sliders", data: "data", cust: "users", sup: "users", prod: "box",
    quotes: "doc", invoices: "bill", billing: "doc", receipts: "bill", ar: "coins", bill: "bill", bills: "list",
    cost: "cart", exp: "cart", ap: "coins", bank: "coins", cashv: "coins", petty: "coins",
    stock: "box", stkitems: "box", stkin: "boxin", stkout: "box", stkadj: "list", stkhist: "list", stkre: "cart", stockrep: "chart",
    rpt: "chart", more: "more",
    cf: "cup", cfpos: "register", cfbar: "glass", cford: "list", cfmenu: "menu", cfinv: "jar", cfshift: "drawer", cfrpt: "chart", cfset: "sliders",
    bk: "home", bkcal: "calendar", bklist: "list", bkres: "bed", bkrpt: "chart", bkset: "sliders",
    g_inc: "bill", g_exp: "cart", g_stk: "box", g_fin: "coins", g_rep: "chart", g_set: "sliders", g_cf: "cup", g_bk: "calendar",
    account: "chart", payroll: "wallet", app: "store", booking: "calendar", cafe: "cup", time: "clock"
  };
  window.EDM_ICON = icon;
  window.EDM_ICON_FOR = function (r, opt) { return icon(R[r] || R[String(r).split("?")[0]] || "more", opt); };
  window.EDM_ICON_KEYS = Object.keys(G);
})();
