/* ============================================================
   THẦN SÁT MỞ RỘNG (Phần 5, tài liệu 399 câu phú)
   Bổ sung 7 sao có công thức rõ ràng, đủ tin cậy để cài đặt —
   nối tiếp 5 sao đã có (Thiên Ất Quý Nhân, Kình Dương, Đào Hoa,
   Dịch Mã, Nguyệt Đức). Các sao thiếu công thức cụ thể trong tài
   liệu (Kim Thần, Thiên Y, Tang Môn Điếu Khách, Kiếp Sát, Vong
   Thần, Tướng Tinh, Văn Khúc, Thiên Đức...) KHÔNG được cài vì
   không đủ căn cứ để tránh đoán sai vị trí.
   ============================================================ */

// Văn Xương Quý Nhân — tra theo Nhật Can (Giáp→Tỵ, Ất→Ngọ, Bính→Thân, Đinh→Dậu,
// Mậu→Thân, Kỷ→Dậu, Canh→Hợi, Tân→Tí, Nhâm→Dần, Quý→Mão)
const VAN_XUONG_MAP = [5,6,8,9,8,9,11,0,2,3];

// Hoa Cái — Mộ của Tam Hợp Cục chứa chi đang xét (tái dùng CHI_TAM_HOP từ file 11)
function hoaCaiOf(chiIdx){
  const found = CHI_TAM_HOP.find(h=>h.set.includes(chiIdx));
  return found ? found.set[2] : null;
}

// Cô Thần / Quả Tú — tra theo Chi Năm, dựa trên nhóm Tam Hội (tái dùng CHI_TAM_HOI)
const COTHAN_QUATU_MAP = {4:{co:2,qua:10}, 0:{co:5,qua:1}, 1:{co:8,qua:4}, 3:{co:11,qua:7}};
function coThanQuaTuOf(yearChi){
  const found = CHI_TAM_HOI.find(h=>h.set.includes(yearChi));
  return found ? COTHAN_QUATU_MAP[found.elem] : null;
}

// Không Vong — tra theo trụ Năm (đúng như tài liệu §Phần 5.VI nêu; một số tài liệu
// khác dùng trụ Ngày — đây là điểm khác biệt giữa các trường phái, xem disclaimer)
function khongVongOf(canIdx, chiIdx){
  const k1 = (chiIdx - canIdx + 10) % 12;
  return [k1, (k1+1)%12];
}

// Khôi Cương — 4 tổ hợp Can Chi cụ thể tại trụ Ngày
const KHOI_CUONG_SET = new Set(['0-4','4-10','6-4','6-10']); // Giáp Thìn, Mậu Tuất, Canh Thìn, Canh Tuất

// Tam Kỳ Quý Nhân — đủ 3 can Giáp-Mậu-Canh (Thiên Thượng) hoặc Ất-Bính-Đinh (Nhân Trung) trong 4 trụ
function tamKyOf(cans4){
  const set = new Set(cans4);
  if([0,4,6].every(c=>set.has(c))) return 'Thiên Thượng Tam Kỳ (Giáp-Mậu-Canh)';
  if([1,2,3].every(c=>set.has(c))) return 'Nhân Trung Tam Kỳ (Ất-Bính-Đinh)';
  return null;
}

function computeThanSatMoRong(data, strength){
  const results = [];
  const allChi = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const allCan = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const labels = ['Trụ Năm','Trụ Tháng','Trụ Ngày','Trụ Giờ'];

  const vx = VAN_XUONG_MAP[data.day.can];
  allChi.forEach((c,i)=>{ if(c===vx) results.push({name:'Văn Xương Quý Nhân', pos:labels[i], type:'good', text:'Chủ thông minh, học vấn, thi cử thuận lợi.'}); });

  const hc1 = hoaCaiOf(data.year.chi), hc2 = hoaCaiOf(data.day.chi);
  allChi.forEach((c,i)=>{ if(c===hc1 || c===hc2) results.push({name:'Hoa Cái', pos:labels[i], type:'neutral', text:'Chủ nghệ thuật, tâm linh, học thuật — nhưng cũng dễ cô độc; lâm vượng tướng thì quyền cao chức trọng.'}); });

  const cq = coThanQuaTuOf(data.year.chi);
  if(cq){
    allChi.forEach((c,i)=>{
      if(c===cq.co) results.push({name:'Cô Thần', pos:labels[i], type:'bad', text:'Chủ cô độc — nam mệnh cần đặc biệt lưu ý hơn.'});
      if(c===cq.qua) results.push({name:'Quả Tú', pos:labels[i], type:'bad', text:'Chủ cô độc, vợ chồng dễ ít gần nhau — nữ mệnh cần đặc biệt lưu ý hơn.'});
    });
  }

  const [kv1,kv2] = khongVongOf(data.year.can, data.year.chi);
  allChi.forEach((c,i)=>{ if((c===kv1||c===kv2) && i!==0) results.push({name:'Không Vong', pos:labels[i], type:'neutral', text:'Chủ hư ảo, dễ mất mát/lận đận ở vị trí này — nhưng cũng có thể là dấu hiệu một giai đoạn "chưa định hình", chưa hẳn xấu tuyệt đối.'}); });

  const dayKey = `${data.day.can}-${data.day.chi}`;
  if(KHOI_CUONG_SET.has(dayKey)) results.push({name:'Khôi Cương', pos:'Trụ Ngày', type:'neutral', text:'Tính cương cường, có thể nắm quyền lớn — nhưng theo tài liệu cũng dễ khắc cha mẹ/vợ con, nên chú ý dung hòa trong gia đình.'});

  allChi.forEach((c,i)=>{ if(truongSinhIndex(data.day.can, c)===3) results.push({name:'Lộc Thần (Kiến Lộc)', pos:labels[i], type:'good', text:'Chủ bổng lộc, ăn uống đầy đủ — có thêm Ấn phù trợ thì càng vững vàng.'}); });

  const tk = tamKyOf(allCan);
  if(tk) results.push({name:'Tam Kỳ Quý Nhân', pos:'Toàn cục', type:'good', text:`Đủ bộ ${tk} — theo tài liệu, chủ thông minh xuất chúng, tài năng hơn người.`});

  return results;
}

function renderThanSatMoRong(data, strength){
  const box = document.getElementById('thansat-content');
  if(!box) return;
  const list = computeThanSatMoRong(data, strength);
  if(list.length===0) return;
  const rows = list.map(it=>`<span class="tag tag-${it.type==='good'?'good':(it.type==='bad'?'bad':'neutral')}">${it.name} (${it.pos})</span>`).join(' ');
  const details = list.map(it=>`<p><b>${it.name}</b> (${it.pos}): ${it.text}</p>`).join('');
  box.innerHTML += `<h4 style="margin-top:16px;">Thần Sát Mở Rộng</h4><div style="margin-bottom:8px;">${rows}</div>${details}
    <div class="disclaimer">Bổ sung theo Phần 5 (tài liệu 399 câu phú), chỉ chọn các sao có công thức đủ rõ ràng để cài đặt tin cậy. Không Vong ở đây tính theo trụ Năm (một trong các quy ước phổ biến — một số tài liệu khác lại dùng trụ Ngày, đây là khác biệt giữa các trường phái chứ không phải sai). Vẫn chỉ là "tiêu chí phụ trợ" — không thay thế nguyên lý sinh khắc chế hóa và Dụng Thần ở các mục khác.</div>`;
}
