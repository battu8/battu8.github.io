function computeDaiVan(data, gender){
  const yearCanDuong = (data.year.can % 2 === 0);
  const forward = gender==="nam" ? yearCanDuong : !yearCanDuong;
  const monthIdx = sexagenaryIndex(data.month.can, data.month.chi);
  const dir = forward ? 1 : -1;
  const {dd,mm,yy,hh,mn} = data.solar;
  const dayJDN = jdFromDate(dd,mm,yy);
  const jdBirth = dayJDN - 0.5 + (hh+mn/60)/24 - TZ/24;
  const deg = sunLongitudeDeg(jdBirth);
  const orderFromDan = Math.floor((((deg-315)%360+360)%360)/30);
  const termStartDeg = normDeg(315+orderFromDan*30);
  const termEndDeg = normDeg(termStartDeg+30);
  const termStartJD = findTermCrossingJD(termStartDeg, jdBirth);
  const termEndJD = findTermCrossingJD(termEndDeg, jdBirth+15);
  const daysDiff = forward ? (termEndJD - jdBirth) : (jdBirth - termStartJD);
  const totalMonths = daysDiff*4;
  const startYears = Math.floor(totalMonths/12);
  const startMonths = Math.round(totalMonths - startYears*12);
  const list=[];
  for(let i=1;i<=9;i++){
    const idx = ((monthIdx + dir*i)%60+60)%60;
    list.push({can:idx%10, chi:idx%12, startAge:startYears+(i-1)*10, startMonths: i===1?startMonths:0});
  }
  return {forward, startYears, startMonths, list};
}

function renderDaiVanLuuNien(data, gender, manual, dungThan, strength){
  if(manual){
    document.getElementById('daivan-content').innerHTML = `<div class="disclaimer">Không thể tính Đại Vận &amp; Lưu Niên chính xác khi nhập trực tiếp Tứ Trụ (không có ngày giờ sinh cụ thể). Vui lòng dùng tab "Dương lịch" hoặc "Âm lịch" để xem đầy đủ mục này.</div>`;
    document.getElementById('luunien-content').innerHTML = '';
    return null;
  }
  const dv = computeDaiVan(data, gender);
  const birthYear = data.solar.yy;
  const predictInput = document.getElementById('p-predict-date').value;
  const predictYear = predictInput ? parseInt(predictInput.slice(0,4)) : new Date().getFullYear();
  const currentAge = predictYear - birthYear;

  let dvRows='';
  let currentDvCat = null;
  let currentDvPillar = null;
  dv.list.forEach((p,i)=>{
    const endAge = p.startAge+9;
    const isCurrent = currentAge>=p.startAge && currentAge<=endAge;
    const cat = danhGiaCatHungVan(p.can, p.chi, data, dungThan, gender, strength);
    if(isCurrent){ currentDvCat = cat; currentDvPillar = p; }
    dvRows += `<tr class="${isCurrent?'current-row':''}"><td>${i+1}</td><td>${p.startAge}${i===0&&p.startMonths?'.'+p.startMonths+'th':''}–${endAge} tuổi</td><td>${CAN[p.can]} ${CHI[p.chi]}</td><td>${napAmOf(p.can,p.chi)}</td><td>${catHungTag(cat.level,cat.label)}</td></tr>`;
  });
  let currentDvNote = '';
  if(currentDvCat && currentDvCat.notes.length){
    currentDvNote = `<p style="margin-top:10px;font-size:0.92em;">Chi tiết đại vận hiện tại: ${currentDvCat.notes.join('; ')}.</p>`;
  }
  if(currentDvCat && currentDvCat.quotes && currentDvCat.quotes.length){
    currentDvNote += currentDvCat.quotes.filter(Boolean).map(q=>`<p style="font-style:italic;opacity:0.9;">${q}</p>`).join('');
  }
  // #16/#17 — vận đầu đời hoặc cuối đời mà tốt thì có sắc thái khác vận tốt giữa đời
  if(currentDvPillar && currentDvCat && currentDvCat.label==='Tốt'){
    if(currentDvPillar.startAge<=17) currentDvNote += `<p style="font-style:italic;opacity:0.9;">${DAIVAN_QUOTES.vanDauDoi}</p>`;
    else if(currentDvPillar.startAge>=58) currentDvNote += `<p style="font-style:italic;opacity:0.9;">${DAIVAN_QUOTES.vanCuoiDoi}</p>`;
  }
  const phucPhanDv = currentDvPillar ? kiemTraPhucPhanNgam(currentDvPillar.can, currentDvPillar.chi, data) : [];
  const phucPhanDvHtml = phucPhanDv.length ? `<p style="margin-top:8px;"><span class="tag tag-bad">Lưu ý (§11.6)</span> Đại vận hiện tại ${phucPhanDv.map(f=>f.text).join('; ')} — đây là giai đoạn tài liệu khuyến nghị nên đặc biệt thận trọng, không phải điềm báo chắc chắn (xem ghi chú cuối mục).</p>` : '';
  document.getElementById('daivan-content').innerHTML = `
    <p style="font-size:0.9em;opacity:0.8;">Nguyên tắc nền (theo khẩu quyết cổ): Lưu Niên ví như Vua, Đại Vận ví như Thần, Mệnh Cục ví như Dân — Vua có thể sinh khắc cả Thần lẫn Dân, Thần chỉ sinh khắc được Dân, còn Dân không khắc lại được Vua. Vì vậy khi Lưu Niên và Đại Vận cùng bất lợi cho mệnh cục, ảnh hưởng thường rõ hơn hẳn so với chỉ một bên bất lợi.</p>
    <p>Hướng đi: <b>${dv.forward? "Thuận hành":"Nghịch hành"}</b> (${gender==="nam"?"Nam mệnh":"Nữ mệnh"}, năm sinh Can ${CAN[data.year.can]} thuộc ${data.year.can%2===0?"Dương":"Âm"}) — nhập vận lúc <b>${dv.startYears} tuổi ${dv.startMonths} tháng</b>.</p>
    <div class="table-scroll"><table class="data-table">
      <tr><th>#</th><th>Giai đoạn</th><th>Can Chi</th><th>Nạp Âm</th><th>Cát hung</th></tr>
      ${dvRows}
    </table></div>
    ${currentDvNote}${phucPhanDvHtml}`;

  const centerYear = predictYear;
  let lnRows='';
  let centerCat = null;
  for(let y=centerYear-7; y<=centerYear+7; y++){
    const can = ((y+6)%10+10)%10;
    const chi = ((y+8)%12+12)%12;
    const age = y - birthYear;
    const isCurrent = (y===centerYear);
    const cat = danhGiaCatHungVan(can, chi, data, dungThan, gender, strength);
    if(isCurrent) centerCat = cat;
    lnRows += `<tr class="${isCurrent?'current-row':''}"><td>${age}</td><td>${y}</td><td>${CAN[can]} ${CHI[chi]}</td><td>${catHungTag(cat.level,cat.label)}</td></tr>`;
  }
  let tongHopHtml = '';
  if(currentDvCat && centerCat){
    const key = `${currentDvCat.label}-${centerCat.label}`;
    const ketQua = BANG_TONG_HOP_DV_LN[key] || 'Bình thường';
    tongHopHtml = `<p style="margin-top:10px;"><b>Nhận định tổng hợp năm ${centerYear}</b> (§11.3): Đại Vận <b>${currentDvCat.label}</b> × Lưu Niên <b>${centerCat.label}</b> → <b>${ketQua}</b>.</p>`;
    tongHopHtml += `<p style="font-style:italic;opacity:0.9;">"Đại vận 10 năm tốt, 1 năm xấu cũng qua; đại vận 10 năm xấu, 1 năm tốt cũng không nên [chủ quan]" — Đại Vận vẫn là khung nền chính của cả 10 năm, Lưu Niên chỉ điều chỉnh thêm chứ không đảo ngược hoàn toàn xu hướng lớn.</p>`;
    if(centerCat.notes.length) tongHopHtml += `<p style="font-size:0.92em;">Chi tiết lưu niên ${centerYear}: ${centerCat.notes.join('; ')}.</p>`;
    if(centerCat.quotes && centerCat.quotes.length) tongHopHtml += centerCat.quotes.filter(Boolean).map(q=>`<p style="font-style:italic;opacity:0.9;">${q}</p>`).join('');
    const phucPhanLn = kiemTraPhucPhanNgam(can2(centerYear), chi2(centerYear), data);
    if(phucPhanLn.length) tongHopHtml += `<p style="margin-top:6px;"><span class="tag tag-bad">Lưu ý (§11.6)</span> Lưu niên ${centerYear} ${phucPhanLn.map(f=>f.text).join('; ')} — nên thận trọng hơn, không phải điềm báo chắc chắn.</p>`;
    if(currentDvPillar){
      const nxn = kiemTraNhiXungNhat(currentDvPillar.chi, chi2(centerYear), data);
      if(nxn){
        tongHopHtml += `<p style="margin-top:6px;"><span class="tag tag-bad">Lưu ý — "Nhị Xung Nhất"</span> Đại Vận và Lưu Niên ${centerYear} cùng mang chi <b>${CHI[currentDvPillar.chi]}</b>, cùng xung vào chi <b>${CHI[nxn.chi]}</b> ở trụ ${nxn.pos} — theo tài liệu, lực xung khi 2 nguồn (Vận + Niên) cùng nhắm 1 điểm mạnh hơn hẳn xung 1-1 thông thường, nên đây là giai đoạn đáng chú ý cần đặc biệt thận trọng hơn, không phải điềm báo chắc chắn về điều gì cụ thể.</p>`;
        tongHopHtml += `<p style="font-style:italic;opacity:0.9;">${DAIVAN_QUOTES.tuevanTrungThaiTue}</p>`;
      }
    }
  }
  document.getElementById('luunien-content').innerHTML = `
    <h4>Lưu Niên quanh năm dự đoán (${centerYear})</h4>
    <div class="table-scroll"><table class="data-table">
      <tr><th>Tuổi</th><th>Năm</th><th>Can Chi</th><th>Cát hung</th></tr>
      ${lnRows}
    </table></div>
    ${tongHopHtml}
    <p style="margin-top:8px;font-size:12px;">Đổi "Ngày dự đoán" ở Phần 1 rồi bấm lại "Lập Tứ Trụ" để xem lưu niên quanh năm khác.</p>
    <div class="disclaimer">Đánh giá Cát Hung (§11.3–11.4) tính từ: can vận có thuộc Dụng/Hỷ/Kỵ Thần hay không, có xung/hợp làm mất Dụng/Hỷ/Kỵ Thần trong mệnh cục hay không, có Thiên Khắc Địa Xung với trụ nào không, và có Khai Mộ/Khố (Thìn-Tuất-Sửu-Mùi bị xung/hình) giải phóng ra Dụng hay Kỵ Thần hay không (bổ sung theo tài liệu Mộ/Khố) — đây là một cách quy đổi tương đối, <b>không thay thế</b> việc luận hạn chi tiết theo từng lưu nguyệt của người có chuyên môn. Phần Nhập Mộ/Khố tĩnh (chi Thìn-Tuất-Sửu-Mùi sẵn có trong tứ trụ gốc, không cần vận tác động) chưa được tính vào đây, xem thêm ở mục 2.2. Các ghi chú "Phục Ngâm/Phản Ngâm" (§11.6) chỉ nêu để tham khảo thận trọng hơn ở giai đoạn đó — tài liệu gốc nêu rõ đây không phải quy luật tuyệt đối, thực tế còn tùy mệnh cục cân bằng hay không và trùng vào thần sát tốt hay xấu; công cụ này không đưa ra bất kỳ dự đoán nào về sức khỏe/an toàn tính mạng.</div>`;

  return {dv, birthYear, predictYear, currentAge, currentDvCat, centerCat};
}
function can2(y){ return ((y+6)%10+10)%10; }
function chi2(y){ return ((y+8)%12+12)%12; }

function renderSpecialYears(data, dungThan, meta){
  if(!meta){
    document.getElementById('specialyears-content').innerHTML = `<div class="disclaimer">Cần có ngày sinh cụ thể (tab Dương lịch/Âm lịch) để xác định các năm đặc biệt.</div>`;
    return;
  }
  const birthChi = data.year.chi;
  const dayChi = data.day.chi;
  const oppositeChi = (birthChi+6)%12;
  const oppositeDayChi = (dayChi+6)%12;
  let items=[];
  for(let y=meta.predictYear; y<=meta.predictYear+15; y++){
    const can = ((y+6)%10+10)%10;
    const chi = ((y+8)%12+12)%12;
    const age = y-meta.birthYear;
    if(chi===birthChi) items.push({y,age,type:'bad',text:`Phạm Thái Tuế (trùng Chi năm sinh ${CHI[birthChi]})`});
    if(chi===oppositeChi) items.push({y,age,type:'bad',text:`Xung Thái Tuế (đối xung Chi năm sinh ${CHI[birthChi]})`});
    if(chi===oppositeDayChi) items.push({y,age,type:'neutral',text:`Xung Trụ Ngày — lưu ý chuyện hôn nhân, sức khỏe`});
    const elemY = elementOfCan(can);
    if(elemY===dungThan.dungThan) items.push({y,age,type:'good',text:`Năm hợp Dụng Thần — thuận lợi hơn`});
    if(elemY===dungThan.kyThan) items.push({y,age,type:'bad',text:`Năm phạm Kỵ Thần — cần thận trọng`});
  }
  if(items.length===0){
    document.getElementById('specialyears-content').innerHTML = `<p>Không có năm nào nổi bật đáng chú ý trong 15 năm tới theo các tiêu chí đang xét.</p>`;
    return;
  }
  const rows = items.map(it=>`<tr><td>${it.y} (${it.age} tuổi)</td><td><span class="tag tag-${it.type}">${it.text}</span></td></tr>`).join('');
  const badItems = items.filter(it=>it.type==='bad'), goodItems = items.filter(it=>it.type==='good');
  let summary = `Trong 15 năm tới, có <b>${items.length}</b> mốc đáng chú ý`;
  if(badItems.length && goodItems.length) summary += ` — ${badItems.length} năm cần thận trọng hơn (nổi bật nhất: năm ${badItems[0].y}, ${badItems[0].age} tuổi) và ${goodItems.length} năm khá thuận lợi.`;
  else if(badItems.length) summary += `, đều nghiêng về hướng cần thận trọng hơn — đáng chú ý nhất là năm ${badItems[0].y} (${badItems[0].age} tuổi).`;
  else summary += `, nhìn chung khá thuận lợi.`;
  document.getElementById('specialyears-content').innerHTML = `
    <p>${summary}</p>
    <div class="table-scroll"><table class="data-table"><tr><th>Năm</th><th>Ghi chú</th></tr>${rows}</table></div>
    <div class="disclaimer">Các mốc trên dựa theo quy tắc Xung/Phạm Thái Tuế và đối chiếu Dụng/Kỵ Thần — chỉ mang tính tham khảo, không thay thế việc xem hạn chi tiết theo từng lưu nguyệt.</div>`;
}

