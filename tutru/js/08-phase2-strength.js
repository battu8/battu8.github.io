/* ============================================================
   PHẦN 2 — ENGINE PHÂN TÍCH MỞ RỘNG (2.2 → 2.7)
   Phương pháp: trường phái "Vượng Suy dụng thần" phổ biến, có
   kết hợp Điều Hầu khi Bát Tự cân bằng. Đây là MỘT cách luận
   phổ thông trong nhiều trường phái Tứ Trụ — mang tính tham khảo.
   ============================================================ */
const ELEMENT_NAMES = ["Mộc","Hỏa","Thổ","Kim","Thủy"];
const ELEMENT_OF_CHI = [4,2,0,0,2,1,1,2,3,3,2,4]; // bổn khí của Tý..Hợi
function elementOfCan(canIdx){ return Math.floor(canIdx/2); }
function elemResource(e){ return (e+4)%5; }   // sinh ta (Ấn)
function elemOutput(e){ return (e+1)%5; }     // ta sinh (Thực Thương)
function elemWealth(e){ return (e+2)%5; }     // ta khắc (Tài)
function elemAuthority(e){ return (e+3)%5; }  // khắc ta (Quan Sát)
function controls(a,b){ return elemWealth(a)===b; } // a khắc b

/* ---- §8.2: hệ tính điểm độ số theo tài liệu tự học ----
   Giản lược có chủ đích ở 2 chỗ (sẽ ghi rõ trong disclaimer):
   1) Bỏ qua Ngũ hợp hóa Thiên Can (điều kiện "hóa thành công" khó xác định tự động đáng tin cậy).
   2) Mỗi Địa Chi tính gộp 1 khối 30° gán theo bổn khí, không tách riêng phần tạp khí. */
function canDegreeBase(canIdx, allChis){
  const e = elementOfCan(canIdx);
  let hasRoot = false;
  allChis.forEach(chiIdx=>{
    TANG_CAN[chiIdx].forEach(tc=>{
      const te = elementOfCan(tc);
      if(te===e || te===elemResource(e)) hasRoot = true;
    });
  });
  return hasRoot ? 36 : 9;
}
function computeCanDegrees(cans, chis){
  const elems = cans.map(elementOfCan);
  let deg = cans.map(c=>canDegreeBase(c, chis));
  for(let p=0;p<4;p++){
    const e = elems[p];
    let kep = false;
    if(p===1 || p===2){
      const leftKhac = controls(elems[p-1], e);
      const rightKhac = controls(elems[p+1], e);
      if(leftKhac && rightKhac){ deg[p] *= (1/3); kep = true; }
    }
    if(!kep){
      for(let o=0;o<4;o++){
        if(o===p) continue;
        const dist = Math.abs(o-p);
        if(dist===3) continue;
        if(controls(elems[o], e)) deg[p] *= (dist===1 ? (2/3) : (5/6));
      }
    }
  }
  return deg;
}
function applyCanChiInteraction(deg, cans, chis){
  for(let p=0;p<4;p++){
    const canE = elementOfCan(cans[p]);
    const chiE = ELEMENT_OF_CHI[chis[p]];
    if(chiE===canE || elemResource(canE)===chiE){ /* giữ nguyên */ }
    else if(elemOutput(canE)===chiE) deg[p] -= 6;   // can sinh chi
    else if(elemWealth(canE)===chiE) deg[p] -= 12;  // can khắc chi
    else if(elemAuthority(canE)===chiE) deg[p] -= 18; // chi khắc can
    if(deg[p]<0) deg[p] = 0;
  }
}
function computeChiDegrees(cans, chis){
  let deg = chis.map(()=>30);
  for(let p=0;p<4;p++){
    const canE = elementOfCan(cans[p]);
    const chiE = ELEMENT_OF_CHI[chis[p]];
    if(chiE===canE || elemOutput(canE)===chiE) deg[p] += 6;
    else if(elemWealth(canE)===chiE) deg[p] -= 8;
  }
  const oppose = (a,b)=> (a+6)%12===b;
  for(let p=0;p<3;p++){
    if(oppose(chis[p], chis[p+1])){ deg[p] *= (2/3); deg[p+1] *= (2/3); }
  }
  for(let i=0;i<4;i++) if(deg[i]<0) deg[i]=0;
  return deg;
}
function lenhThangInfo(data, manual){
  const chi = data.month.chi;
  const monoMap = {2:0,3:0, 5:1,6:1, 8:3,9:3, 11:4,0:4};
  if(monoMap[chi]!==undefined) return {lenhElem:monoMap[chi], khacElem:elemWealth(monoMap[chi])};
  const duKhiMap = {4:0, 7:1, 10:3, 1:4}; // Thìn-dư Mộc, Mùi-dư Hỏa, Tuất-dư Kim, Sửu-dư Thủy
  const duElem = duKhiMap[chi];
  if(manual) return {lenhElem:2, khacElem:elemWealth(2)}; // không rõ ngày giờ -> tạm coi Thổ lệnh
  const {dd,mm,yy,hh,mn} = data.solar;
  const dayJDN = jdFromDate(dd,mm,yy);
  const jdBirth = dayJDN - 0.5 + (hh+mn/60)/24 - TZ/24;
  const deg = sunLongitudeDeg(jdBirth);
  const orderFromDan = Math.floor((((deg-315)%360+360)%360)/30);
  const termStartDeg = normDeg(315+orderFromDan*30);
  const termEndDeg = normDeg(termStartDeg+30);
  const termStartJD = findTermCrossingJD(termStartDeg, jdBirth);
  const termEndJD = findTermCrossingJD(termEndDeg, jdBirth+15);
  const monthLen = termEndJD - termStartJD;
  const daysElapsed = jdBirth - termStartJD;
  const thoStart = monthLen - 18; // 18 ngày cuối tứ quý là Thổ lệnh (theo §8.2)
  if(daysElapsed >= thoStart) return {lenhElem:2, khacElem:elemWealth(2)};
  return {lenhElem:duElem, khacElem:elemWealth(duElem)};
}
function applyLenhThang(canDeg, chiDeg, cans, chis, lenh){
  for(let p=0;p<4;p++){
    const canE = elementOfCan(cans[p]);
    if(canE===lenh.lenhElem) canDeg[p] *= 1.2; else if(canE===lenh.khacElem) canDeg[p] *= 0.8;
    const chiE = ELEMENT_OF_CHI[chis[p]];
    if(chiE===lenh.lenhElem) chiDeg[p] *= 1.2; else if(chiE===lenh.khacElem) chiDeg[p] *= 0.8;
  }
}

function computeStrength(data, manual){
  const dmElem = elementOfCan(data.day.can);
  const cans = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const chis = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const canDeg = computeCanDegrees(cans, chis);
  applyCanChiInteraction(canDeg, cans, chis);
  const chiDeg = computeChiDegrees(cans, chis);
  const lenh = lenhThangInfo(data, manual);
  applyLenhThang(canDeg, chiDeg, cans, chis, lenh);

  const perElem = [0,0,0,0,0];
  cans.forEach((c,i)=>{ perElem[elementOfCan(c)] += canDeg[i]; });
  chis.forEach((c,i)=>{ perElem[ELEMENT_OF_CHI[c]] += chiDeg[i]; });

  const groups = {
    an: perElem[elemResource(dmElem)],
    tyKiep: perElem[dmElem],
    thucThuong: perElem[elemOutput(dmElem)],
    tai: perElem[elemWealth(dmElem)],
    quanSat: perElem[elemAuthority(dmElem)]
  };
  const pheMinh = groups.an + groups.tyKiep;
  const pheKhac = groups.thucThuong + groups.tai + groups.quanSat;
  const total = pheMinh + pheKhac;
  const ratio = total>0 ? pheMinh/total : 0.5;
  const verdict = ratio>=0.40 ? "vuong" : "nhuoc"; // ngưỡng 40% theo §8.2
  const nearBoundary = Math.abs(ratio-0.40) < 0.05;
  return {dmElem, perElem, groups, pheMinh, pheKhac, ratio, verdict, nearBoundary, lenh};
}

function computeDungThan(data, strength){
  const dm = strength.dmElem, g = strength.groups;
  let dungThan, hyThan, kyThan, note;
  if(strength.verdict==="nhuoc"){
    const maxG = Math.max(g.quanSat, g.tai, g.thucThuong);
    if(maxG===g.quanSat){
      dungThan = elemResource(dm); hyThan = dm; kyThan = elemAuthority(dm);
      note = "Thân nhược, Quan/Sát đang dư thừa khắc thân — theo bảng §10.1, dùng Ấn tinh (tiết Quan Sát, sinh thân) làm dụng thần; không có thì dùng Tỷ/Kiếp thay thế.";
    } else if(maxG===g.tai){
      dungThan = dm; hyThan = elemResource(dm); kyThan = elemWealth(dm);
      note = "Thân nhược, Tài tinh đang dư thừa hao thân — theo bảng §10.1, dùng Tỷ/Kiếp (áp chế Tài, trợ thân) làm dụng thần; không có thì dùng Ấn tinh thay thế.";
    } else {
      dungThan = elemResource(dm); hyThan = dm; kyThan = elemOutput(dm);
      note = "Thân nhược, Thực/Thương đang dư thừa tiết thân — theo bảng §10.1, dùng Ấn tinh (áp chế Thực Thương, sinh thân) làm dụng thần; không có thì dùng Tỷ/Kiếp thay thế.";
    }
  } else {
    const maxG2 = Math.max(g.an, g.tyKiep);
    if(maxG2===g.an){
      dungThan = elemWealth(dm); hyThan = elemAuthority(dm); kyThan = elemResource(dm);
      note = "Thân vượng, Ấn tinh đang dư thừa — theo bảng §10.1, dùng Tài tinh (áp chế Ấn, hao thân) làm dụng thần; không có thì dùng Quan/Sát, sau cùng mới Thực/Thương.";
    } else {
      dungThan = elemAuthority(dm); hyThan = elemOutput(dm); kyThan = dm;
      note = "Thân vượng, Tỷ/Kiếp đang dư thừa — theo bảng §10.1, dùng Quan/Sát (áp chế) làm dụng thần; không có thì dùng Thực/Thương (tiết bớt), sau cùng mới Tài tinh.";
    }
  }
  let dieuHau = null;
  if([5,6,7].includes(data.month.chi)){
    dieuHau = {elem:4, text:"Sinh vào mùa Hè (khí nóng) — theo phép Điều Hầu (§10.3), Thủy là dụng thần bổ trợ quan trọng để quân bình nhiệt táo, không thay thế nguyên tắc Phù Ức ở trên."};
  } else if([11,0,1].includes(data.month.chi)){
    dieuHau = {elem:1, text:"Sinh vào mùa Đông (khí lạnh) — theo phép Điều Hầu (§10.3), Hỏa là dụng thần bổ trợ quan trọng để sưởi ấm cục diện, không thay thế nguyên tắc Phù Ức ở trên."};
  }
  return {dungThan, hyThan, kyThan, note, dieuHau};
}

function renderStrength(data, manual){
  const s = computeStrength(data, manual);
  const verdictLabel = s.verdict==="vuong" ? "THÂN VƯỢNG" : "THÂN NHƯỢC";
  const supportPct = (s.ratio*100).toFixed(0);
  const drainPct = (100-s.ratio*100).toFixed(0);
  const rows = ELEMENT_NAMES.map((n,i)=>`<tr><td>${n}</td><td>${s.perElem[i].toFixed(1)}°</td></tr>`).join('');
  const boundaryNote = s.nearBoundary ? `<p style="color:var(--brass);">Tỷ lệ khá gần ranh giới 40% — mệnh cục thuộc dạng cân bằng, ít lệch cực đoan.</p>` : '';
  const extremeNote = (s.ratio>0.80 || s.ratio<0.20) ? `<div class="disclaimer">Tỷ lệ lệch rất mạnh về một phía — theo §9.2, lá số có thể rơi vào nhóm <b>Cách Cục Đặc Biệt (Tòng/Hóa cách)</b>, khi đó cách chọn dụng thần sẽ khác hẳn Chính cách thông thường. Trường hợp này nên được người có chuyên môn thẩm định thêm.</div>` : '';
  document.getElementById('strength-content').innerHTML = `
    <p>Nhật Chủ: <b>${CAN[data.day.can]} (${ELEMENT_NAMES[s.dmElem]})</b> — Lệnh tháng hiện do hành <b>${ELEMENT_NAMES[s.lenh.lenhElem]}</b> nắm giữ.</p>
    <div class="verdict-badge verdict-${s.verdict}">${verdictLabel}</div>
    <div class="bar-wrap"><div class="bar-support" style="width:${supportPct}%"></div><div class="bar-drain" style="width:${drainPct}%"></div></div>
    <div class="bar-legend"><span>Phe mình (Ấn+Tỷ/Kiếp): ${supportPct}%</span><span>Phe khác (Thực Thương+Tài+Quan Sát): ${drainPct}%</span></div>
    ${boundaryNote}
    <table class="data-table" style="margin-top:14px;"><tr><th>Ngũ Hành</th><th>Tổng độ số</th></tr>${rows}</table>
    <p style="margin-top:14px;">Phương pháp: tính điểm theo độ số (§8.2) — Thiên Can gốc 36°/9° tùy có thông căn hay không, trừ theo bị khắc liền/cách/kẹp; Địa Chi gốc 30°, cộng/trừ theo Thiên Can cùng trụ và lục xung; toàn cục nhân hệ số ±1/5 theo hành đang nắm lệnh tháng (tính theo đúng thời điểm tiết khí). Ngưỡng phân loại: Phe mình ≥ 40% tổng cục → Thân Vượng, dưới 40% → Thân Nhược.</p>
    ${extremeNote}
    <div class="disclaimer">Áp dụng theo tài liệu tự học Tứ Trụ đã cung cấp (§8.2), có 2 giản lược: bỏ qua Ngũ hợp hóa Thiên Can, và mỗi Địa Chi tính gộp một khối thay vì tách riêng tạp khí. Đây vẫn là một phương pháp trong nhiều trường phái Tứ Trụ — mang tính tham khảo.</div>`;
  return s;
}

function renderDungThan(data, strength){
  const d = computeDungThan(data, strength);
  const dieuHauHtml = d.dieuHau ? `<p style="margin-top:10px;">${d.dieuHau.text}</p>` : '';
  document.getElementById('dungthan-content').innerHTML = `
    <p>${d.note}</p>
    <div style="margin-top:10px;">
      <span class="elem-chip" style="border-color:var(--jade);color:var(--jade);">Dụng Thần: <b>${ELEMENT_NAMES[d.dungThan]}</b></span>
      <span class="elem-chip" style="border-color:var(--brass);color:var(--brass);">Hỷ Thần: <b>${ELEMENT_NAMES[d.hyThan]}</b></span>
      <span class="elem-chip" style="border-color:var(--seal);color:var(--seal);">Kỵ Thần: <b>${ELEMENT_NAMES[d.kyThan]}</b></span>
    </div>
    ${dieuHauHtml}`;
  return d;
}

/* ---- Thần Sát (§13) — chỉ đưa vào 5 sao được tài liệu xác nhận đáng tin cậy nhất ---- */
const THIEN_AT_MAP = {0:[1,7],4:[1,7],6:[1,7], 1:[0,8],5:[0,8], 2:[11,9],3:[11,9], 8:[3,5],9:[3,5], 7:[2,6]};
const KINH_DUONG_MAP = {0:3,1:2,2:6,4:6,3:5,5:5,6:9,7:8,8:0,9:11};
function daoHoaOf(chiIdx){
  if([8,0,4].includes(chiIdx)) return 9;
  if([5,9,1].includes(chiIdx)) return 6;
  if([2,6,10].includes(chiIdx)) return 3;
  if([11,3,7].includes(chiIdx)) return 0;
}
function dichMaOf(chiIdx){
  if([8,0,4].includes(chiIdx)) return 2;
  if([2,6,10].includes(chiIdx)) return 8;
  if([5,9,1].includes(chiIdx)) return 11;
  if([11,3,7].includes(chiIdx)) return 5;
}
function nguyetDucOf(monthChi){
  if([2,6,10].includes(monthChi)) return 2;
  if([8,0,4].includes(monthChi)) return 8;
  if([11,3,7].includes(monthChi)) return 0;
  if([5,9,1].includes(monthChi)) return 6;
}
function computeThanSat(data, strength){
  const results = [];
  const allChi = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const allCan = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const labels = ['Trụ Năm','Trụ Tháng','Trụ Ngày','Trụ Giờ'];

  const taSet = new Set([...(THIEN_AT_MAP[data.year.can]||[]), ...(THIEN_AT_MAP[data.day.can]||[])]);
  allChi.forEach((c,i)=>{ if(taSet.has(c)) results.push({name:'Thiên Ất Quý Nhân', pos:labels[i], type:'good', text:'Quý thần bậc nhất — gặp việc có người giúp, gặp nạn có người giải cứu.'}); });

  const kd = KINH_DUONG_MAP[data.day.can];
  allChi.forEach((c,i)=>{ if(c===kd) results.push({name:'Kình Dương', pos:labels[i], type: strength.verdict==='nhuoc'?'good':'bad', text: strength.verdict==='nhuoc' ? 'Thân nhược gặp Kình Dương lại có ích — giữ Lộc, chống đỡ Quan Sát tốt hơn.' : 'Thân vượng gặp Kình Dương càng thêm cực đoan — cực thịnh dễ sinh cực suy, cẩn trọng khi đại vận/lưu niên xung Thái Tuế.'}); });

  const dh1 = daoHoaOf(data.year.chi), dh2 = daoHoaOf(data.day.chi);
  allChi.forEach((c,i)=>{ if(c===dh1 || c===dh2) results.push({name:'Đào Hoa (Hàm Trì)', pos:labels[i], type:'neutral', text:'Thông minh, khéo tay, có duyên nghệ thuật/ngoại hình — cẩn trọng chuyện tình cảm nếu gặp tuế vận xấu.'}); });

  const dm1 = dichMaOf(data.year.chi), dm2 = dichMaOf(data.day.chi);
  allChi.forEach((c,i)=>{ if(c===dm1 || c===dm2) results.push({name:'Dịch Mã', pos:labels[i], type:'neutral', text:'Chủ về di chuyển, đi xa, thay đổi công việc/chỗ ở — gặp vận Tài thì phát nhanh.'}); });

  const nd = nguyetDucOf(data.month.chi);
  allCan.forEach((c,i)=>{ if(c===nd) results.push({name:'Nguyệt Đức Quý Nhân', pos:labels[i], type:'good', text:'Thần cứu giải hàng đầu — hóa hung thành cát, gặp nạn thường được cứu.'}); });

  return results;
}
function renderThanSat(data, strength){
  const list = computeThanSat(data, strength);
  const box = document.getElementById('thansat-content');
  if(!box) return;
  if(list.length===0){
    box.innerHTML = `<h4>Thần Sát nổi bật</h4><p>Không thấy Thần Sát nào trong nhóm 5 sao trọng yếu (Thiên Ất Quý Nhân, Kình Dương, Đào Hoa, Dịch Mã, Nguyệt Đức) xuất hiện trong lá số này.</p>`;
    return;
  }
  const rows = list.map(it=>`<span class="tag tag-${it.type==='good'?'good':(it.type==='bad'?'bad':'neutral')}">${it.name} (${it.pos})</span>`).join(' ');
  const details = list.map(it=>`<p><b>${it.name}</b> (${it.pos}): ${it.text}</p>`).join('');
  box.innerHTML = `<h4>Thần Sát nổi bật</h4><div style="margin-bottom:8px;">${rows}</div>${details}
    <div class="disclaimer">Theo tài liệu: đây là nhóm Thần Sát được đánh giá đáng tin cậy nhất, nhưng vẫn chỉ là "tiêu chí phụ trợ" — không thay thế nguyên lý sinh khắc chế hóa và cân bằng vượng/nhược ở trên.</div>`;
}

