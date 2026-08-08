/* ============================================================
   HỎI THÊM AI — đóng gói toàn bộ kết quả đã tính (Cách Cục, Vượng/
   Nhược, Dụng Thần, Hợp Xung, Thần Sát, Đại Vận...) thành 1 đoạn
   văn bản có cấu trúc để dán vào cuộc trò chuyện với AI (Claude hay
   bất kỳ AI nào khác) và hỏi sâu hơn — không cần AI tính lại Can
   Chi từ đầu, tránh sai lệch do AI tự bịa số liệu.
   ============================================================ */
function buildClaudePrompt(){
  const af = lastFullAnalysis;
  if(!af) return '';
  const d = af.data;
  const dm = d.day.can;
  const pillarLine = (label, p) => `${label}: ${CAN[p.can]} ${CHI[p.chi]} (Nạp Âm: ${napAmOf(p.can,p.chi)}) — Tàng can: ${TANG_CAN[p.chi].map(tc=>CAN[tc]).join(', ')}`;
  const dvList = af.meta && af.meta.dv ? af.meta.dv.list.map((p,i)=>`  #${i+1}: ${p.startAge}–${p.startAge+9} tuổi — ${CAN[p.can]} ${CHI[p.chi]}`).join('\n') : '  (không có — do nhập trực tiếp Tứ Trụ, thiếu ngày giờ sinh)';
  const ngaySinhBlock = (d.solar && d.solar.yy)
    ? `Dương lịch: ${pad(d.solar.dd)}/${pad(d.solar.mm)}/${d.solar.yy} ${pad(d.solar.hh)}:${pad(d.solar.mn)}\nÂm lịch: ${d.lunar.d}/${d.lunar.m}${d.lunar.leap?' (nhuận)':''}/${d.lunar.y}\nNăm Tứ Trụ (sau Lập Xuân): ${d.baziYear}${d.isTyHourLate? '\n(Sinh giờ Tý — áp dụng phái Vãn Tý, tính theo ngày hôm sau)':''}`
    : 'Nhập trực tiếp Tứ Trụ — không có ngày giờ dương/âm lịch cụ thể.';

  const specialCachBlock = (af.specialCach && af.specialCach.length)
    ? af.specialCach.map(c=>`- ${c.name} (${c.nhom}): ${c.text}${c.altDungThan?` [Nếu đúng, Dụng Thần đổi thành: ${ELEMENT_NAMES[c.altDungThan.dung]}]`:''}`).join('\n')
    : '(không phát hiện khả năng Cách Cục Đặc Biệt nào — dùng Chính Cách như trên)';

  const hopXungBlock = af.hopXung
    ? `Điểm tổng hợp Hợp/Xung 4 trụ gốc: ${af.hopXung.score!==undefined?af.hopXung.score.toFixed(1):'—'} (${af.hopXung.overallType==='vuong'?'thiên về hài hòa':(af.hopXung.overallType==='nhuoc'?'thiên về xung khắc':'cân bằng')})${af.hopXung.topHighlight?`\nĐáng chú ý nhất: ${af.hopXung.topHighlight}`:''}`
    : '(chưa tính)';

  const daivanCatHungBlock = af.meta && af.meta.currentDvCat
    ? `Đại Vận hiện tại (${af.meta.currentAge} tuổi): cát hung mức "${af.meta.currentDvCat.label}"${af.meta.centerCat?`; Lưu Niên năm ${af.meta.predictYear}: mức "${af.meta.centerCat.label}"`:''}`
    : '(chưa xác định được đại vận hiện tại — có thể do chưa đủ tuổi nhập vận đầu tiên)';

  return `Tôi cung cấp thông tin Tứ Trụ (Bát Tự) đã được một công cụ tính toán sẵn dưới đây (theo phương pháp Tử Bình, có tham khảo nhiều tài liệu tự học và cổ thư). Nhờ bạn phân tích/luận giải sâu hơn hoặc trả lời câu hỏi cụ thể của tôi dựa trên các dữ liệu này — không cần tính lại Can Chi hay bịa thêm số liệu mới, chỉ luận giải từ những gì đã cho.

THÔNG TIN CÁ NHÂN
- Tên: ${af.name || '(không cung cấp)'}
- Giới tính: ${af.gender==='nam'?'Nam':'Nữ'}
- Ngày dự đoán (mốc hiện tại muốn xem): ${af.predictDate || '(không rõ)'}

NGÀY SINH
${ngaySinhBlock}

TỨ TRỤ
${pillarLine('Trụ Năm', d.year)}
${pillarLine('Trụ Tháng', d.month)}
${pillarLine('Trụ Ngày (Nhật Chủ = '+CAN[dm]+')', d.day)}
${pillarLine('Trụ Giờ', d.hour)}

CÁCH CỤC
- Chính Cách: ${af.cachCuc ? af.cachCuc.name : '—'}
- Khả năng Cách Cục Đặc Biệt (§9.2):
${specialCachBlock}

VƯỢNG / NHƯỢC
- Nhật Chủ hành ${ELEMENT_NAMES[af.strength.dmElem]} — kết luận: ${af.strength.verdict==='vuong'?'THÂN VƯỢNG':'THÂN NHƯỢC'} (phe mình chiếm ${(af.strength.ratio*100).toFixed(0)}% tổng cục)
- Lệnh tháng hiện do hành ${ELEMENT_NAMES[af.strength.lenh.lenhElem]} nắm giữ

DỤNG THẦN (theo Chính Cách)
- Dụng Thần: ${ELEMENT_NAMES[af.dungThan.dungThan]} | Hỷ Thần: ${ELEMENT_NAMES[af.dungThan.hyThan]} | Kỵ Thần: ${ELEMENT_NAMES[af.dungThan.kyThan]}
- Lý do: ${af.dungThan.note || '—'}

HỢP XUNG HÌNH HẠI (4 trụ gốc)
${hopXungBlock}

THẦN SÁT NỔI BẬT
${af.thanSatList.length ? af.thanSatList.map(t=>`- ${t.name} (${t.pos})`).join('\n') : '(không có sao nào trong nhóm Thần Sát chính)'}

ĐẠI VẬN (hướng ${af.meta && af.meta.dv ? (af.meta.dv.forward?'Thuận hành':'Nghịch hành') : '—'})
${dvList}

${daivanCatHungBlock}

Câu hỏi/yêu cầu cụ thể của tôi: [BẠN GÕ VÀO ĐÂY — ví dụ: "Năm nay tôi có nên đổi việc không?", "Phân tích kỹ hơn về đường con cái", "Có giai đoạn nào cần chú ý trong 5 năm tới không?"]`;
}

function copyClaudePrompt(){
  const txt = buildClaudePrompt();
  if(!txt){ alert('Chưa có dữ liệu — vui lòng lập Tứ Trụ trước.'); return; }
  navigator.clipboard.writeText(txt).then(()=>{
    const btn = document.getElementById('claude-prompt-btn');
    if(btn){
      const old = btn.innerHTML;
      btn.innerHTML = 'Đã sao chép ✓ — dán vào chat với AI';
      setTimeout(()=>{ btn.innerHTML = old; }, 2200);
    }
  }).catch(()=>{ alert('Không thể sao chép tự động — trình duyệt chặn quyền clipboard. Vui lòng thử lại hoặc sao chép thủ công.'); });
}
