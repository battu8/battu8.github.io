/* ============================================================
   §14 (tttt.md) + PHẦN II (Phục Ngâm doc) — LỤC THÂN MỞ RỘNG
   Nguyên tắc "mở tàng can": một cung vị không tự động quy về 1
   người cố định — phải mở từng tàng can trong Chi đó, đối chiếu
   Thập Thần theo VỊ TRÍ trụ mới xác định đúng ai bị ảnh hưởng.
   ============================================================ */
const LUC_THAN_POS_LABEL = {year:'Năm', month:'Tháng', day:'Ngày', hour:'Giờ'};

// Bản đồ chuẩn (Phần II): Thập Thần + vị trí trụ → lục thân. 1 tàng can có thể
// khớp nhiều vai trò (vd Tỷ Kiếp ở đâu cũng có thể là anh chị em).
function xacDinhLucThanTuTangCan(tangCanIdx, dayCan, position, gender){
  const god = tenGod(dayCan, tangCanIdx);
  const roles = [];
  if((position==='year'||position==='month') && (god==='Thiên Tài'||god==='Chính Tài')) roles.push('Cha');
  if(position==='month' && (god==='Chính Ấn'||god==='Kiêu Thần')) roles.push('Mẹ');
  if(god==='Tỷ Kiên'||god==='Kiếp Tài') roles.push('Anh chị em');
  if(position==='day'){
    if(gender==='nam' && (god==='Chính Tài'||god==='Thiên Tài')) roles.push('Vợ');
    if(gender==='nu' && (god==='Chính Quan'||god==='Thất Sát')) roles.push('Chồng');
  }
  if(position==='hour'){
    if(gender==='nam' && (god==='Chính Quan'||god==='Thất Sát')) roles.push('Con cái');
    if(gender==='nu' && (god==='Thực Thần'||god==='Thương Quan')) roles.push('Con cái');
  }
  return {god, roles};
}

// Trả về tất cả vai trò lục thân tìm thấy tại 1 vị trí trụ (mở hết tàng can) —
// dùng chung cho cả Bản Đồ Lục Thân tĩnh và phần Đại Vận/Lưu Niên (mục 2.7) khi
// cần biết ai bị ảnh hưởng lúc trụ đó bị xung/hình.
function lucThanTaiViTri(data, position, gender){
  const chi = data[position].chi;
  const roles = new Set();
  TANG_CAN[chi].forEach(tc=>{
    const r = xacDinhLucThanTuTangCan(tc, data.day.can, position, gender);
    r.roles.forEach(role=>roles.add(role));
  });
  return [...roles];
}

function renderLucThanMoRong(data, gender, strength, dungThan){
  const box = document.getElementById('lucthan-content');
  if(!box) return;
  const positions = ['year','month','day','hour'];
  const g = tallyTenGodGroups(data, strength);

  // 1) Bản đồ Lục Thân theo Tàng Can (mở từng tàng can của 4 trụ)
  let mapHtml = `<h4>Bản Đồ Lục Thân Theo Tàng Can</h4>`;
  const chaCandidates = [], meCandidates = [];
  const positionQuotesFound = [];
  positions.forEach(pos=>{
    const chi = data[pos].chi;
    const rows = TANG_CAN[chi].map((tc,i)=>{
      const {god, roles} = xacDinhLucThanTuTangCan(tc, data.day.can, pos, gender);
      if(roles.includes('Cha')) chaCandidates.push(pos);
      if(roles.includes('Mẹ')) meCandidates.push(pos);
      if(typeof POSITION_QUOTES!=='undefined' && POSITION_QUOTES[god] && POSITION_QUOTES[god][pos]){
        positionQuotesFound.push(POSITION_QUOTES[god][pos]);
      }
      const roleTxt = roles.length ? `<span class="tag tag-good">${roles.join(', ')}</span>` : '';
      return `${CAN[tc]}(${TANG_ROLE[i]}: ${god})${roleTxt?' '+roleTxt:''}`;
    }).join(' · ');
    mapHtml += `<p><b>Trụ ${LUC_THAN_POS_LABEL[pos]}</b> (${pos==='day'?CAN[data.day.can]+' ':''}${CHI[chi]}): ${rows}</p>`;
  });
  mapHtml += `<p style="font-size:0.9em;opacity:0.85;">Nguyên tắc: một cung vị (Năm/Tháng/Ngày/Giờ) không tự động gán cứng cho 1 người — phải mở tàng can rồi đối chiếu Thập Thần mới xác định đúng ai liên quan. Bảng trên áp dụng đúng cách đó cho cả 4 trụ gốc.</p>`;
  if(positionQuotesFound.length){
    mapHtml += `<h4 style="margin-top:10px;">Câu Phú Theo Vị Trí</h4>` + [...new Set(positionQuotesFound)].map(q=>`<p style="font-style:italic;opacity:0.9;">${q}</p>`).join('');
  }

  // 2) Cha Mẹ (§14.1)
  let chaMeHtml = `<h4 style="margin-top:14px;">Cha Mẹ</h4>`;
  if(chaCandidates.length){
    chaMeHtml += `<p>Dấu hiệu về Cha (Thiên/Chính Tài) xuất hiện ở trụ: <b>${[...new Set(chaCandidates)].map(p=>LUC_THAN_POS_LABEL[p]).join(', ')}</b>.</p>`;
  } else {
    chaMeHtml += `<p>Không thấy Thiên Tài/Chính Tài lộ hay tàng rõ ở trụ Năm/Tháng — theo tài liệu, dấu hiệu về Cha không nổi bật trong lá số này (không có nghĩa là không có Cha, chỉ là không có tín hiệu Thập Thần rõ để luận thêm).</p>`;
  }
  if(meCandidates.length){
    chaMeHtml += `<p>Dấu hiệu về Mẹ (Chính Ấn/Kiêu Thần) xuất hiện ở trụ Tháng.</p>`;
  } else {
    chaMeHtml += `<p>Không thấy Chính Ấn/Kiêu Thần tàng ở trụ Tháng — dấu hiệu về Mẹ không nổi bật theo Thập Thần trong lá số này.</p>`;
  }

  const dauHieuXau = [];
  if(g.tyKiep >= 3) dauHieuXau.push(`Tỷ/Kiếp khá nhiều (điểm ${g.tyKiep.toFixed(1)}) — theo nguyên tắc "Tỷ Kiếp trùng trùng thì khắc cha", cần lưu ý sức khỏe/duyên phận với Cha.`);
  if(g.tai >= 3.5) dauHieuXau.push(`Tài tinh khá vượng (điểm ${g.tai.toFixed(1)}) — theo nguyên tắc "Tài nhiều/vượng thì khắc mẹ" (Tài là kỵ thần trực tiếp của Ấn), cần lưu ý sức khỏe/duyên phận với Mẹ.`);
  const lenhElem = strength.lenh.lenhElem;
  const namNapAmElem = napAmElemIndex(data.year.can, data.year.chi);
  if(CONTROLS[ELEMENT_NAMES[lenhElem]]===ELEMENT_NAMES[namNapAmElem]){
    dauHieuXau.push(`Hành lệnh tháng (${ELEMENT_NAMES[lenhElem]}) khắc trực tiếp hành nạp âm trụ Năm (${ELEMENT_NAMES[namNapAmElem]}) — nguyên tắc "đề cương khắc năm thì cha mẹ khó toàn", thống kê tài liệu thường ứng vào Cha mất trước nhiều hơn.`);
  }
  const namChi = data.year.chi;
  if(MO_KHO_INFO[namChi]){
    dauHieuXau.push(`Chi Năm (${CHI[namChi]}) là Mộ/Khố — nguyên tắc "cha gặp Mộ/Khố địa thì cha mất trước" (chỉ là một dấu hiệu tham khảo, không phải khẳng định).`);
  }
  if(dauHieuXau.length){
    chaMeHtml += `<div style="margin-top:6px;">` + dauHieuXau.map(t=>`<p><span class="tag tag-bad">Lưu ý</span> ${t}</p>`).join('') + `</div>`;
  } else {
    chaMeHtml += `<p><span class="tag tag-good">Không có dấu hiệu khắc rõ</span> Không thấy nổi bật 3/4 nguyên tắc khắc Cha Mẹ chính theo tài liệu (Tỷ Kiếp trùng trùng, Tài quá vượng, đề cương khắc năm, Mộ/Khố tại Năm).</p>`;
  }

  // 3) Anh chị em (§14.3)
  const soLuongUocTinh = Math.max(0, Math.round(g.rawTyKiep));
  let acEHtml = `<h4 style="margin-top:14px;">Anh Chị Em</h4>`;
  acEHtml += `<p>Ước tính số lượng dựa trên Tỷ/Kiếp (kể cả tàng can, đã điều chỉnh sinh vượng/tử tuyệt một phần qua trọng số): khoảng <b>${soLuongUocTinh}</b> người — tài liệu lưu ý sai số thường 1-2 người, và ở Đông Nam Á thực tế hay nhiều hơn khoảng gấp đôi so với công thức gốc Trung Quốc.</p>`;
  const acENotes = [];
  const thangCan = data.month.can;
  const thangCanGod = tenGod(data.day.can, thangCan);
  if(thangCanGod==='Thương Quan') acENotes.push('Can Tháng là Thương Quan — dấu hiệu anh/chị (nhiều hơn em) dễ tổn thất hoặc liên lụy.');
  if(g.quanSat >= 4) acENotes.push(`Quan Sát khá nhiều (điểm ${g.quanSat.toFixed(1)}) — dấu hiệu khắc anh chị em.`);
  const moKhoCount = [data.year.chi,data.month.chi,data.day.chi,data.hour.chi].filter(c=>MO_KHO_INFO[c]).length;
  if(moKhoCount>=2) acENotes.push(`Có ${moKhoCount} trụ rơi vào Thìn/Tuất/Sửu/Mùi (Mộ/Khố) — dấu hiệu anh em xa cách, tình thân nhạt.`);
  if(data.month.chi===data.day.chi) acENotes.push('Chi Tháng trùng Chi Ngày — dấu hiệu mỗi người một phương / lệnh tháng bị xung nhau cần lưu ý riêng.');
  acEHtml += acENotes.length
    ? `<div style="margin-top:6px;">` + acENotes.map(t=>`<p><span class="tag tag-bad">Lưu ý</span> ${t}</p>`).join('') + `</div>`
    : `<p><span class="tag tag-good">Không có dấu hiệu bất lợi rõ</span> Không thấy nổi bật các dấu hiệu ly tán/bất hòa chính theo tài liệu.</p>`;

  box.innerHTML = mapHtml + chaMeHtml + acEHtml +
    `<div class="disclaimer">Áp dụng theo tài liệu §14 (tttt.md) và nguyên tắc "mở tàng can" (Phần II, tài liệu Phục Ngâm/Phản Ngâm bổ sung). Đây là bản rút gọn các dấu hiệu <b>chính/dễ nhớ nhất</b> được tài liệu nhấn mạnh — không liệt kê hết toàn bộ dấu hiệu phụ (Quý Nhân, Trạch Mã, Đào Hoa, Không Vong từng vị trí...) vì các sao đó chưa được cài đặt đầy đủ trong công cụ này. "Khắc cha/mẹ/anh chị em" ở đây là thuật ngữ Ngũ Hành khách quan (một hành lấn át hành khác trong lá số) — tài liệu gốc nói rõ điều này tách biệt khỏi đạo đức của người con, không nên hiểu theo nghĩa đen là chắc chắn xảy ra chuyện xấu.</div>`;
}
