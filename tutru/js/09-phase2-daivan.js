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

function renderDaiVanLuuNien(data, gender, manual, dungThan){
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
  dv.list.forEach((p,i)=>{
    const endAge = p.startAge+9;
    const isCurrent = currentAge>=p.startAge && currentAge<=endAge;
    dvRows += `<tr class="${isCurrent?'current-row':''}"><td>${i+1}</td><td>${p.startAge}${i===0&&p.startMonths?'.'+p.startMonths+'th':''}–${endAge} tuổi</td><td>${CAN[p.can]} ${CHI[p.chi]}</td><td>${napAmOf(p.can,p.chi)}</td></tr>`;
  });
  document.getElementById('daivan-content').innerHTML = `
    <p>Hướng đi: <b>${dv.forward? "Thuận hành":"Nghịch hành"}</b> (${gender==="nam"?"Nam mệnh":"Nữ mệnh"}, năm sinh Can ${CAN[data.year.can]} thuộc ${data.year.can%2===0?"Dương":"Âm"}) — nhập vận lúc <b>${dv.startYears} tuổi ${dv.startMonths} tháng</b>.</p>
    <div class="table-scroll"><table class="data-table">
      <tr><th>#</th><th>Giai đoạn</th><th>Can Chi</th><th>Nạp Âm</th></tr>
      ${dvRows}
    </table></div>`;

  const centerYear = predictYear;
  let lnRows='';
  for(let y=centerYear-7; y<=centerYear+7; y++){
    const can = ((y+6)%10+10)%10;
    const chi = ((y+8)%12+12)%12;
    const age = y - birthYear;
    const isCurrent = (y===centerYear);
    let tagHtml='';
    const elemY = elementOfCan(can);
    if(elemY===dungThan.dungThan) tagHtml='<span class="tag tag-good">Dụng Thần</span>';
    else if(elemY===dungThan.kyThan) tagHtml='<span class="tag tag-bad">Kỵ Thần</span>';
    lnRows += `<tr class="${isCurrent?'current-row':''}"><td>${age}</td><td>${y}</td><td>${CAN[can]} ${CHI[chi]}</td><td>${tagHtml}</td></tr>`;
  }
  document.getElementById('luunien-content').innerHTML = `
    <h4>Lưu Niên quanh năm dự đoán (${centerYear})</h4>
    <div class="table-scroll"><table class="data-table">
      <tr><th>Tuổi</th><th>Năm</th><th>Can Chi</th><th>Ghi chú</th></tr>
      ${lnRows}
    </table></div>
    <p style="margin-top:8px;font-size:12px;">Đổi "Ngày dự đoán" ở Phần 1 rồi bấm lại "Lập Tứ Trụ" để xem lưu niên quanh năm khác.</p>`;

  return {dv, birthYear, predictYear, currentAge};
}

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
  document.getElementById('specialyears-content').innerHTML = `
    <div class="table-scroll"><table class="data-table"><tr><th>Năm</th><th>Ghi chú</th></tr>${rows}</table></div>
    <div class="disclaimer">Các mốc trên dựa theo quy tắc Xung/Phạm Thái Tuế và đối chiếu Dụng/Kỵ Thần — chỉ mang tính tham khảo, không thay thế việc xem hạn chi tiết theo từng lưu nguyệt.</div>`;
}

