/* ============================================================
   §12 — THAI NGUYÊN & CUNG MỆNH
   ============================================================ */
const CUNG_MENH_MEANING = {
  0:{name:'Thiên Quý', text:'chí khí khác thường, thanh bạch mà giàu'},
  1:{name:'Thiên Ách', text:'trước khó sau thuận, vất vả tha phương rồi mới yên'},
  2:{name:'Thiên Quyền', text:'thông minh sắc sảo, trung niên có quyền'},
  3:{name:'Thiên Xích', text:'khảng khái, có quyền nên khiêm tốn'},
  4:{name:'Thiên Như', text:'nhiều việc chồng chất, mưu trí tháo vát'},
  5:{name:'Thiên Văn', text:'văn chương phát đạt; nữ gặp chồng tốt'},
  6:{name:'Thiên Phúc', text:'vinh hoa, mệnh tốt'},
  7:{name:'Thiên Trạch', text:'vất vả, xa quê mới lập nghiệp được'},
  8:{name:'Thiên Cô', text:'không nên kết hôn sớm; nữ dễ khắc chồng'},
  9:{name:'Thiên Bí', text:'cương trực, hay vướng thị phi'},
  10:{name:'Thiên Ất', text:'tâm tính ôn hòa, có khiếu nghệ thuật'},
  11:{name:'Thiên Thọ', text:'hiền lành, sáng suốt, biết nhường nhịn, hay giúp người'}
};

function napAmElemIndex(canIdx, chiIdx){
  const s = napAmOf(canIdx, chiIdx);
  const last = s.trim().split(' ').pop();
  return ELEMENT_NAMES.indexOf(last);
}

// §12.1 — Thai Nguyên: Can của tháng liền sau + Chi của tháng thứ 3 sau tháng sinh
function computeThaiNguyen(data){
  const can = (data.month.can+1)%10;
  const chi = (data.month.chi+3)%12;
  return {can, chi};
}

// §12.2 — Cung Mệnh: Tí=tháng Giêng đếm ngược tới tháng sinh, rồi từ đó đếm
// thuận theo giờ sinh (khởi giờ Tí tại vị trí vừa tìm). Can suy theo "ngũ hổ độn"
// (an Can tháng theo Can năm) — dùng lại đúng công thức app đã dùng để lập trụ tháng.
function ngoHoDonCan(yearCanIdx, chiIdx){
  const orderFromDan = (chiIdx - 2 + 12) % 12;
  const startStemDan = (((yearCanIdx%5)*2+2)%10+10)%10;
  return (startStemDan+orderFromDan)%10;
}
function computeCungMenh(data){
  const M = data.lunar.m;
  const monthChiPos = (13 - M + 120) % 12;
  const H = data.hour.chi;
  const chi = (monthChiPos + H) % 12;
  const can = ngoHoDonCan(data.year.can, chi);
  return {can, chi};
}

function elemRelationText(elemA, elemB, nameA, nameB){
  const a = ELEMENT_NAMES[elemA], b = ELEMENT_NAMES[elemB];
  if(a===b) return {type:'good', text:`${nameA} và ${nameB} cùng hành ${a} — tỷ hòa, ổn định.`};
  if(GENERATES[a]===b) return {type:'good', text:`${nameA} (${a}) sinh cho ${nameB} (${b}) — tốt, có lợi.`};
  if(GENERATES[b]===a) return {type:'neutral', text:`${nameB} (${b}) sinh cho ${nameA} (${a}) — được nuôi dưỡng, khá thuận.`};
  if(CONTROLS[a]===b) return {type:'bad', text:`${nameA} (${a}) khắc ${nameB} (${b}) — bất lợi.`};
  if(CONTROLS[b]===a) return {type:'bad', text:`${nameB} (${b}) khắc ${nameA} (${a}) — bị tiêu hao, cần chú ý.`};
  return {type:'neutral', text:`${nameA} và ${nameB} không sinh khắc trực tiếp.`};
}

function chiHasRelation(chiX, chiSet4, listPairs){
  const found = [];
  listPairs.forEach(([a,b])=>{
    let other=null;
    if(a===chiX) other=b; else if(b===chiX) other=a;
    if(other!==null){
      chiSet4.forEach((c,i)=>{ if(c===other) found.push(i); });
    }
  });
  return found; // mảng vị trí trụ (0..3) có quan hệ với chiX
}

function renderThaiNguyenCungMenh(data, strength, dungThan){
  const box = document.getElementById('thainguyen-content');
  if(!box) return;
  const labels = ['Năm','Tháng','Ngày','Giờ'];
  const chis4 = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];

  const tn = computeThaiNguyen(data);
  const cm = computeCungMenh(data);
  const tnNapAm = napAmOf(tn.can, tn.chi);
  const cmNapAm = napAmOf(cm.can, cm.chi);
  const tnElem = napAmElemIndex(tn.can, tn.chi);
  const cmElem = napAmElemIndex(cm.can, cm.chi);
  const menhElem = napAmElemIndex(data.year.can, data.year.chi); // bổn mệnh = nạp âm năm sinh
  const gioElem = napAmElemIndex(data.hour.can, data.hour.chi);

  let html = `<h4>Thai Nguyên</h4>`;
  html += `<p><span class="elem-chip" style="border-color:var(--brass);color:var(--brass);">${CAN[tn.can]} ${CHI[tn.chi]}</span> — nạp âm <b>${tnNapAm}</b>.</p>`;

  const relMenh = elemRelationText(tnElem, menhElem, 'Thai Nguyên', 'Bổn Mệnh (nạp âm năm sinh)');
  html += `<p><span class="tag tag-${relMenh.type}">Thai Nguyên ↔ Bổn Mệnh</span> ${relMenh.text}</p>`;

  if(tn.can===8 || tn.can===9){
    html += `<p><span class="tag tag-good">Nhâm/Quý</span> Thai Nguyên can là Nhâm hoặc Quý — theo tài liệu, chủ về có âm phúc.</p>`;
  }
  const tnTS = truongSinhIndex(tn.can, tn.chi);
  if(tnTS===3){
    html += `<p><span class="tag tag-good">Lộc</span> Thai Nguyên chi đúng vị trí Lâm Quan (Kiến Lộc) của chính can Thai Nguyên — theo tài liệu, chủ về sinh nhà giàu sang.</p>`;
  }
  if(tnTS===4){
    html += `<p><span class="tag tag-good">Đế Vượng</span> Thai Nguyên chi đúng vị trí Đế Vượng của chính can Thai Nguyên — theo tài liệu, chủ về thọ.</p>`;
  }

  const tnXung = chiHasRelation(tn.chi, chis4, CHI_LUC_XUNG);
  const tnHai = chiHasRelation(tn.chi, chis4, CHI_TUONG_HAI);
  const tnHinhPairs = [...CHI_TUONG_HINH_NHOM.flatMap(g=>{ const p=[]; for(let i=0;i<g.set.length;i++) for(let j=i+1;j<g.set.length;j++) p.push([g.set[i],g.set[j]]); return p; }), CHI_TUONG_HINH_VO_LE];
  const tnHinh = chiHasRelation(tn.chi, chis4, tnHinhPairs);
  if(tnXung.length || tnHai.length || tnHinh.length){
    const parts = [];
    if(tnXung.length) parts.push(`xung với trụ ${tnXung.map(i=>labels[i]).join(', ')}`);
    if(tnHai.length) parts.push(`hại với trụ ${tnHai.map(i=>labels[i]).join(', ')}`);
    if(tnHinh.length) parts.push(`hình với trụ ${tnHinh.map(i=>labels[i]).join(', ')}`);
    html += `<p><span class="tag tag-bad">Hình/Xung/Hại</span> Thai Nguyên ${parts.join('; ')} — theo tài liệu, dù ngày giờ sinh tốt thì giá trị cũng bị giảm bớt, đời vất vả hơn.</p>`;
  } else {
    html += `<p><span class="tag tag-good">Không hình/xung/hại</span> Thai Nguyên không bị hình/xung/hại bởi 4 trụ gốc.</p>`;
  }

  const relGio = elemRelationText(tnElem, gioElem, 'Thai Nguyên', 'Nạp Âm Giờ sinh');
  const sinhKhoeType = (relGio.type==='good') ? 'thuận lợi hơn cho sức khỏe/tuổi thọ' : (relGio.type==='bad' ? 'cần chú ý chăm sóc sức khỏe nhiều hơn' : 'trung tính, không nổi bật theo tiêu chí này');
  html += `<p><span class="tag tag-${relGio.type}">Thai Nguyên ↔ Nạp Âm Giờ</span> ${relGio.text} → theo tài liệu, đây là dấu hiệu tham khảo ${sinhKhoeType} (không phải khẳng định chắc chắn).</p>`;

  html += `<h4 style="margin-top:16px;">Cung Mệnh</h4>`;
  const cmMean = CUNG_MENH_MEANING[cm.chi];
  html += `<p><span class="elem-chip" style="border-color:var(--jade);color:var(--jade);">${CAN[cm.can]} ${CHI[cm.chi]}</span> — nạp âm <b>${cmNapAm}</b>. Ý nghĩa riêng của cung <b>${CHI[cm.chi]}</b>: <b>${cmMean.name}</b> — ${cmMean.text}.</p>`;

  const relCmMenh = elemRelationText(cmElem, menhElem, 'Cung Mệnh', 'Bổn Mệnh (nạp âm năm sinh)');
  html += `<p><span class="tag tag-${relCmMenh.type}">Cung Mệnh ↔ Bổn Mệnh</span> ${relCmMenh.text}</p>`;

  if(cmElem===dungThan.dungThan || cmElem===dungThan.hyThan){
    html += `<p><span class="tag tag-good">Trùng Dụng/Hỷ Thần</span> Nạp âm Cung Mệnh trùng hành Dụng/Hỷ Thần của Tứ Trụ — theo tài liệu, cung mệnh là hỉ/dụng thần thì tốt.</p>`;
  } else if(cmElem===dungThan.kyThan){
    html += `<p><span class="tag tag-bad">Trùng Kỵ Thần</span> Nạp âm Cung Mệnh trùng hành Kỵ Thần của Tứ Trụ — cần thận trọng hơn.</p>`;
  }

  const cmXung = chiHasRelation(cm.chi, chis4, CHI_LUC_XUNG);
  const cmHai = chiHasRelation(cm.chi, chis4, CHI_TUONG_HAI);
  const cmHinh = chiHasRelation(cm.chi, chis4, tnHinhPairs);
  if(cmXung.length || cmHai.length || cmHinh.length){
    const parts = [];
    if(cmXung.length) parts.push(`xung với trụ ${cmXung.map(i=>labels[i]).join(', ')}`);
    if(cmHai.length) parts.push(`hại với trụ ${cmHai.map(i=>labels[i]).join(', ')}`);
    if(cmHinh.length) parts.push(`hình với trụ ${cmHinh.map(i=>labels[i]).join(', ')}`);
    html += `<p><span class="tag tag-bad">Hình/Xung/Hại</span> Cung Mệnh ${parts.join('; ')} — có thể bổ sung ý nghĩa cho các mục tương ứng (ví dụ chủ hay đi xa dù không có Dịch Mã) dù không hẳn là xấu tuyệt đối, cần xét cùng tổng thể.</p>`;
  } else {
    html += `<p><span class="tag tag-good">Không hình/xung/hại</span> Cung Mệnh không bị hình/xung/hại bởi 4 trụ gốc.</p>`;
  }

  html += `<div class="disclaimer">Áp dụng theo tài liệu §12.1–12.2. Ba điểm cần lưu ý: (1) "Bổn Mệnh" được quy ước dùng nạp âm trụ Năm — đây là quy ước phổ biến, tài liệu không nêu tường minh; (2) bước "đếm thuận theo giờ sinh" khi tính Cung Mệnh được cài đặt theo cách hiểu chuẩn phổ biến (khởi giờ Tí tại vị trí chi tháng vừa tìm, đếm thuận đến giờ sinh thực tế) — phần diễn đạt gốc trong tài liệu có chỗ chưa thật rõ ràng, nên nếu nghi ngờ kết quả, nên đối chiếu thêm với một nguồn tra cứu Cung Mệnh khác; (3) mục Tuần Không/Vong của Thai Nguyên (tài liệu có nhắc) chưa được cài đặt, để dành cho giai đoạn nâng cấp sau. Cách tính tuổi khi không nhớ năm sinh (§12.3) là kỹ thuật bấm tay thủ công, không áp dụng được cho công cụ này (đã có ngày sinh chính xác).</div>`;

  box.innerHTML = html;
}
