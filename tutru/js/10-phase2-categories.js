function tallyTenGodGroups(data){
  const dm = data.day.can;
  const g = {tyKiep:0, an:0, thucThuong:0, tai:0, quanSat:0};
  function classify(canIdx,w){
    if(canIdx===dm) return;
    const t = tenGod(dm,canIdx);
    if(t==="Tỷ Kiên"||t==="Kiếp Tài") g.tyKiep+=w;
    else if(t==="Kiêu Thần"||t==="Chính Ấn") g.an+=w;
    else if(t==="Thực Thần"||t==="Thương Quan") g.thucThuong+=w;
    else if(t==="Thiên Tài"||t==="Chính Tài") g.tai+=w;
    else if(t==="Thất Sát"||t==="Chính Quan") g.quanSat+=w;
  }
  classify(data.year.can,1); classify(data.month.can,1); classify(data.hour.can,1);
  [[data.year.chi,1],[data.month.chi,1.5],[data.day.chi,1],[data.hour.chi,1]].forEach(([chi,mult])=>{
    TANG_CAN[chi].forEach((tc,i)=> classify(tc, [1,0.5,0.3][i]*mult));
  });
  return g;
}

function renderCategories(data, gender, strength, dungThan){
  const g = tallyTenGodGroups(data);
  const entries = Object.entries(g).sort((a,b)=>b[1]-a[1]);
  const dominant = entries[0][0];
  const labelMap = {tyKiep:"Tỷ Kiếp", an:"Ấn (Chính/Kiêu)", thucThuong:"Thực Thương", tai:"Tài (Chính/Thiên)", quanSat:"Quan Sát"};
  const personalityMap = {
    tyKiep:"tự lập, mạnh mẽ, có tinh thần cạnh tranh, đôi khi cứng đầu và thích làm theo ý mình.",
    an:"ham học hỏi, điềm đạm, trọng tình cảm, thiên về suy nghĩ hơn hành động.",
    thucThuong:"sáng tạo, khéo ăn nói, thích thể hiện bản thân, nhạy cảm với nghệ thuật.",
    tai:"thực tế, nhạy bén với tiền bạc và cơ hội, chăm chỉ nhưng đôi khi vụ lợi.",
    quanSat:"có kỷ luật, trách nhiệm, chí tiến thủ cao, thích quy củ và địa vị."
  };
  const level = (v)=> v>=4? "mạnh" : (v>=2? "vừa phải" : "yếu");
  const taiLevel = level(g.tai), quanLevel = level(g.quanSat), thucLevel = level(g.thucThuong), anLevel = level(g.an);

  let html = '';
  html += `<div class="category-block"><h4>Tính cách</h4><p>Thập Thần nổi bật nhất trong lá số là <b>${labelMap[dominant]}</b>, cho thấy xu hướng ${personalityMap[dominant]}</p></div>`;

  if(gender==='nam'){
    html += `<div class="category-block"><h4>Vợ / Con cái</h4><p>Sao Tài tinh (tượng trưng vợ) ở mức <b>${taiLevel}</b>${g.tai===0?" (không xuất hiện rõ trong Tứ Trụ)":""}. Sao Thực Thương (tượng trưng con cái) ở mức <b>${thucLevel}</b>. ${taiLevel==='yếu'?"Cần chủ động vun đắp tình cảm gia đình nhiều hơn.":"Duyên vợ chồng khá rõ nét trong lá số."}</p></div>`;
  } else {
    html += `<div class="category-block"><h4>Chồng / Con cái</h4><p>Sao Quan Sát (tượng trưng chồng) ở mức <b>${quanLevel}</b>${g.quanSat===0?" (không xuất hiện rõ trong Tứ Trụ)":""}. Sao Thực Thương (tượng trưng con cái) ở mức <b>${thucLevel}</b>.</p></div>`;
  }

  const elemNames=["Mộc (Gan – Mật)","Hỏa (Tim – Ruột non)","Thổ (Tỳ – Vị)","Kim (Phổi – Đại tràng)","Thủy (Thận – Bàng quang)"];
  let elemTotals=[0,0,0,0,0];
  function addElem(canIdx,w){ elemTotals[elementOfCan(canIdx)]+=w; }
  addElem(data.year.can,1); addElem(data.month.can,1); addElem(data.day.can,1); addElem(data.hour.can,1);
  [[data.year.chi,1],[data.month.chi,1.5],[data.day.chi,1],[data.hour.chi,1]].forEach(([chi,mult])=>{
    TANG_CAN[chi].forEach((tc,i)=> { elemTotals[elementOfCan(tc)] += [1,0.5,0.3][i]*mult; });
  });
  let minIdx=0; for(let i=1;i<5;i++) if(elemTotals[i]<elemTotals[minIdx]) minIdx=i;
  html += `<div class="category-block"><h4>Sức khỏe (tham khảo)</h4><p>Trong Ngũ Hành, hành <b>${ELEMENT_NAMES[minIdx]}</b> hiện diện yếu nhất trong lá số, tương ứng theo Ngũ Hành y học cổ truyền là <b>${elemNames[minIdx]}</b> — có thể là bộ phận cần quan tâm bồi bổ hơn. <i>Đây không phải chẩn đoán y khoa, chỉ là gợi ý tham khảo theo Ngũ Hành; mọi vấn đề sức khỏe cần được bác sĩ chuyên môn thăm khám.</i></p></div>`;

  const taiDungHy = (dungThan.dungThan===elemWealth(strength.dmElem) || dungThan.hyThan===elemWealth(strength.dmElem));
  html += `<div class="category-block"><h4>Tài lộc</h4><p>Tài tinh ở mức <b>${taiLevel}</b> và ${taiDungHy? "trùng với Dụng/Hỷ Thần — tài vận khá thuận, dễ tích lũy khi gặp đúng giai đoạn Đại Vận phù hợp." : "không trùng Dụng/Hỷ Thần — tài lộc thường phải nỗ lực nhiều mới ổn định, nên thận trọng khi đầu tư lớn."}</p></div>`;

  const quanDungHy = (dungThan.dungThan===elemAuthority(strength.dmElem) || dungThan.hyThan===elemAuthority(strength.dmElem));
  html += `<div class="category-block"><h4>Công danh / Sự nghiệp</h4><p>Quan Sát ở mức <b>${quanLevel}</b> và ${quanDungHy? "trùng Dụng/Hỷ Thần — thuận lợi trên con đường công danh, thích hợp môi trường có cấp bậc rõ ràng." : "không trùng Dụng/Hỷ Thần — nên cân nhắc kỹ trước khi theo đuổi con đường quan chức/công sở cứng nhắc, có thể hợp hơn với việc tự chủ."}</p></div>`;

  html += `<div class="category-block"><h4>Học tập</h4><p>Ấn tinh (đại diện học vấn, quý nhân) ở mức <b>${anLevel}</b>. ${anLevel==='mạnh'? "Có duyên với học hành, dễ được thầy cô/quý nhân nâng đỡ." : "Việc học cần sự kiên trì chủ động hơn là dựa vào yếu tố may mắn/quý nhân."}</p></div>`;

  document.getElementById('categories-content').innerHTML = html + `<div class="disclaimer">Các nhận định trên được suy ra tự động từ cấu trúc Thập Thần trong lá số, mang tính tham khảo phổ thông — không thay thế cho việc luận giải trực tiếp bởi người có chuyên môn.</div>`;
}

const ELEMENT_ADVICE = {
  0:{color:"Xanh lá, Xanh dương nhạt", dir:"Đông, Đông Nam", nums:"3, 8", jobs:"giáo dục, xuất bản/truyền thông, nông–lâm nghiệp, thời trang, nội thất gỗ"},
  1:{color:"Đỏ, Cam, Hồng, Tím", dir:"Nam", nums:"2, 7", jobs:"năng lượng, công nghệ, giải trí – truyền hình, ẩm thực, làm đẹp"},
  2:{color:"Vàng, Nâu đất", dir:"Đông Bắc, Tây Nam, Trung tâm", nums:"5, 0", jobs:"bất động sản, xây dựng, nông nghiệp, bảo hiểm, tư vấn"},
  3:{color:"Trắng, Xám, Ánh kim", dir:"Tây, Tây Bắc", nums:"4, 9", jobs:"tài chính – ngân hàng, luật, cơ khí, kim hoàn, công nghệ chính xác"},
  4:{color:"Đen, Xanh dương đậm", dir:"Bắc", nums:"1, 6", jobs:"vận tải – logistics, du lịch, thương mại, truyền thông, ngoại giao, nghiên cứu"}
};
function renderAdvice(data, strength, dungThan, name){
  const adv = ELEMENT_ADVICE[dungThan.dungThan];
  const verdictText = strength.verdict==="vuong" ? "Nhật Chủ vượng" : (strength.verdict==="nhuoc" ? "Nhật Chủ nhược" : "Nhật Chủ cân bằng");
  document.getElementById('advice-content').innerHTML = `
    <p>${name? `Gửi <b>${name}</b>: `:""}Với ${verdictText} và Dụng Thần là hành <b>${ELEMENT_NAMES[dungThan.dungThan]}</b>, một số gợi ý để tăng cường vận khí phù hợp:</p>
    <ul style="padding-left:18px;margin:10px 0;">
      <li>Màu sắc nên dùng nhiều: <b>${adv.color}</b></li>
      <li>Hướng nên ưu tiên (chỗ ngồi làm việc, cửa chính khi có thể): <b>${adv.dir}</b></li>
      <li>Con số hợp mệnh: <b>${adv.nums}</b></li>
      <li>Lĩnh vực/ngành nghề tương đối phù hợp: <b>${adv.jobs}</b></li>
    </ul>
    <p>Nên hạn chế lạm dụng hành <b>${ELEMENT_NAMES[dungThan.kyThan]}</b> (Kỵ Thần) trong màu sắc/không gian sống – làm việc chính, và thận trọng hơn trong những Đại Vận/Lưu Niên mang hành này.</p>
    <div class="disclaimer">Tứ Trụ là một góc nhìn tham khảo về xu hướng, không quyết định hoàn toàn số phận. Mọi quyết định quan trọng (sự nghiệp, hôn nhân, sức khỏe, tài chính) nên dựa trên thực tế cuộc sống, tư vấn từ chuyên gia trong lĩnh vực liên quan, và sự chủ động của chính bạn.</div>`;
}

function renderPhase2(data, manual){
  const gender = document.getElementById('p-gender').value;
  const name = document.getElementById('p-name').value.trim();
  const strength = renderStrength(data, manual);
  const dungThan = renderDungThan(data, strength);
  renderHopXungHinhHai(data, dungThan);
  renderThanSat(data, strength);
  const meta = renderDaiVanLuuNien(data, gender, manual, dungThan);
  renderSpecialYears(data, dungThan, meta);
  renderCategories(data, gender, strength, dungThan);
  renderAdvice(data, strength, dungThan, name);
}
