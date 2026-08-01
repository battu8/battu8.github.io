/* ============================================================
   §5 — VÒNG TRƯỜNG SINH 12 CUNG
   Chỉ số Chi Trường Sinh xuất phát (i=0) của mỗi Can; dương can
   tính THUẬN (+i), âm can tính NGHỊCH (-i) — quy tắc "cực kỳ quan
   trọng" theo tài liệu, nhầm sẽ suy luận sai hoàn toàn vượng/nhược.
   Thứ tự Can: Giáp Ất Bính Đinh Mậu Kỷ Canh Tân Nhâm Quý (0..9)
   ============================================================ */
const TRUONG_SINH_START = [11,6,2,9,2,9,5,0,8,3]; // Chi Trường Sinh của Giáp..Quý
const TRUONG_SINH_STATES = ["Trường Sinh","Mộc Dục","Quan Đới","Lâm Quan","Đế Vượng","Suy","Bệnh","Tử","Mộ","Tuyệt","Thai","Dưỡng"];

function truongSinhIndex(canIdx, chiIdx){
  const start = TRUONG_SINH_START[canIdx];
  const isDuong = canIdx%2===0; // Giáp Bính Mậu Canh Nhâm = dương = thuận
  for(let i=0;i<12;i++){
    const c = isDuong ? (start+i)%12 : (start-i+12)%12;
    if(c===chiIdx) return i;
  }
  return -1;
}
function truongSinhQuality(idx){
  if(idx<=4) return {type:'good', text:'có lợi (từ Sinh đến Vượng)'};
  if(idx<=9) return {type:'bad', text:'bất lợi (từ Suy đến Tuyệt)'};
  return {type:'neutral', text:'trung tính (Thai/Dưỡng)'};
}

function renderTruongSinh(data, strength){
  const box = document.getElementById('truongsinh-content');
  if(!box) return;
  const labels = ['Năm','Tháng','Ngày','Giờ'];
  const chis = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const cans = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const dmCan = data.day.can;

  // 1) Trọng tâm: trạng thái của Nhật Chủ (can Ngày) tại cả 4 chi — đối chiếu trực tiếp với vượng/nhược
  let goodCount=0, badCount=0;
  const dmRows = chis.map((c,i)=>{
    const idx = truongSinhIndex(dmCan, c);
    const q = truongSinhQuality(idx);
    if(q.type==='good') goodCount++; else if(q.type==='bad') badCount++;
    return {pos:labels[i], state:TRUONG_SINH_STATES[idx], q};
  });

  let html = `<h4>12 Cung Trường Sinh của Nhật Chủ (${CAN[dmCan]})</h4>`;
  html += `<div style="margin:8px 0;">` + dmRows.map(r=>
    `<span class="tag tag-${r.q.type}">${r.pos}: ${r.state}</span>`
  ).join(' ') + `</div>`;

  let cross;
  if(goodCount>badCount){
    cross = strength.verdict==='vuong'
      ? `Có ${goodCount}/4 trụ ở trạng thái có lợi (Sinh→Vượng) cho Nhật Chủ — <b>phù hợp</b> với kết luận Thân Vượng ở phần tính theo độ số trên.`
      : `Có ${goodCount}/4 trụ ở trạng thái có lợi cho Nhật Chủ, nhưng phần tính theo độ số lại kết luận Thân Nhược — <b>hai góc nhìn không hoàn toàn khớp nhau</b>, khả năng lá số nằm gần ranh giới cân bằng, nên tham khảo thêm ý kiến chuyên môn.`;
  } else if(badCount>goodCount){
    cross = strength.verdict==='nhuoc'
      ? `Có ${badCount}/4 trụ ở trạng thái bất lợi (Suy→Tuyệt) cho Nhật Chủ — <b>phù hợp</b> với kết luận Thân Nhược ở phần tính theo độ số trên.`
      : `Có ${badCount}/4 trụ ở trạng thái bất lợi cho Nhật Chủ, nhưng phần tính theo độ số lại kết luận Thân Vượng — <b>hai góc nhìn không hoàn toàn khớp nhau</b>, khả năng lá số nằm gần ranh giới cân bằng, nên tham khảo thêm ý kiến chuyên môn.`;
  } else {
    cross = `Số trụ có lợi và bất lợi cho Nhật Chủ ngang nhau (${goodCount}/${badCount}) — không nghiêng rõ về bên nào, cần dựa chủ yếu vào kết quả tính theo độ số ở trên.`;
  }
  html += `<p>${cross}</p>`;

  // 2) Bổ sung: trạng thái của MỖI can trụ tại chính chi trụ đó (thông căn tại chỗ theo góc nhìn Trường Sinh)
  html += `<h4 style="margin-top:14px;">Từng Can tại chính Chi trụ của nó</h4>`;
  html += `<table class="data-table"><tr><th>Trụ</th><th>Can</th><th>Chi</th><th>Trạng thái</th></tr>` +
    cans.map((c,i)=>{
      const idx = truongSinhIndex(c, chis[i]);
      const q = truongSinhQuality(idx);
      return `<tr><td>${labels[i]}</td><td>${CAN[c]}</td><td>${CHI[chis[i]]}</td><td><span class="tag tag-${q.type}">${TRUONG_SINH_STATES[idx]}</span></td></tr>`;
    }).join('') + `</table>`;

  html += `<div class="disclaimer">Áp dụng theo tài liệu §5. Đây là góc nhìn <b>định tính, bổ trợ và đối chiếu chéo</b> cho kết quả tính điểm theo độ số (§8.2) ở trên — không dùng để tự thay thế kết luận vượng/nhược khi hai bên mâu thuẫn nhau, mà là tín hiệu cho thấy lá số cần được xem xét kỹ hơn. Quy tắc thuận/nghịch theo Can dương/âm đã được áp dụng đúng như tài liệu nhấn mạnh.</div>`;

  box.innerHTML = html;
}
