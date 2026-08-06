// Hợp nhất nguồn dữ liệu: dùng chung strength.perElem (độ số đã tính đủ thông căn,
// hệ số Vượng-Tướng-Hưu-Tù-Tử, xung khắc — mục 2.3) làm nguồn "độ mạnh" duy nhất cho
// toàn app, thay vì mỗi mục tự đếm tàng can riêng (kém chính xác hơn, có thể lệch kết
// quả so với mục Vượng/Nhược). Chuẩn hóa tổng về 20 để giữ tương thích các ngưỡng cũ
// (>=3, >=4...) vốn hiệu chỉnh theo thang đếm cũ.
function tallyTenGodGroups(data, strength){
  const dm = data.day.can;
  const g = {tyKiep:0, an:0, thucThuong:0, tai:0, quanSat:0, chinhQuan:0, thatSat:0};

  if(strength && strength.perElem){
    const dmElem = strength.dmElem;
    const total = strength.perElem.reduce((a,b)=>a+b,0);
    const k = total>0 ? 20/total : 0;
    g.tyKiep = strength.perElem[dmElem]*k;
    g.an = strength.perElem[elemResource(dmElem)]*k;
    g.thucThuong = strength.perElem[elemOutput(dmElem)]*k;
    g.tai = strength.perElem[elemWealth(dmElem)]*k;
    g.quanSat = strength.perElem[elemAuthority(dmElem)]*k;
  }

  // Chính Quan/Thất Sát: perElem không phân biệt được âm/dương của can cụ thể, nên
  // vẫn đếm theo can như trước để lấy TỈ LỆ, rồi áp tỉ lệ đó lên g.quanSat đã chuẩn hóa
  // ở trên — vừa giữ đúng độ mạnh tổng thể, vừa tách được trai/gái theo §16.2.
  let rawChinhQuan=0, rawThatSat=0, rawTyKiep=0, rawAn=0, rawThucThuong=0, rawTai=0, rawQuanSat=0;
  function classify(canIdx,w){
    if(canIdx===dm) return;
    const t = tenGod(dm,canIdx);
    if(t==="Tỷ Kiên"||t==="Kiếp Tài") rawTyKiep+=w;
    else if(t==="Kiêu Thần"||t==="Chính Ấn") rawAn+=w;
    else if(t==="Thực Thần"||t==="Thương Quan") rawThucThuong+=w;
    else if(t==="Thiên Tài"||t==="Chính Tài") rawTai+=w;
    else if(t==="Thất Sát"){ rawQuanSat+=w; rawThatSat+=w; }
    else if(t==="Chính Quan"){ rawQuanSat+=w; rawChinhQuan+=w; }
  }
  classify(data.year.can,1); classify(data.month.can,1); classify(data.hour.can,1);
  [[data.year.chi,1],[data.month.chi,1.5],[data.day.chi,1],[data.hour.chi,1]].forEach(([chi,mult])=>{
    TANG_CAN[chi].forEach((tc,i)=> classify(tc, [1,0.5,0.3][i]*mult));
  });
  const rawTotal = rawChinhQuan+rawThatSat;
  if(rawTotal>0){
    g.chinhQuan = g.quanSat * (rawChinhQuan/rawTotal);
    g.thatSat = g.quanSat * (rawThatSat/rawTotal);
  }
  g.rawTyKiep = rawTyKiep; // giữ số đếm thô riêng cho ước tính SỐ LƯỢNG (anh chị em...),
                            // khác với "độ mạnh" — không nên lấy độ số làm số đếm người.

  // Dự phòng nếu chưa có strength.perElem (không nên xảy ra trong luồng bình thường của app)
  if(!strength || !strength.perElem){
    g.tyKiep = rawTyKiep; g.an = rawAn; g.thucThuong = rawThucThuong; g.tai = rawTai; g.quanSat = rawQuanSat;
  }
  return g;
}

function renderCategories(data, gender, strength, dungThan){
  const g = tallyTenGodGroups(data, strength);
  const entries = Object.entries(g).filter(([k])=>['tyKiep','an','thucThuong','tai','quanSat'].includes(k)).sort((a,b)=>b[1]-a[1]);
  const dominant = entries[0][0];
  const labelMap = {tyKiep:"Tỷ Kiếp", an:"Ấn (Chính/Kiêu)", thucThuong:"Thực Thương", tai:"Tài (Chính/Thiên)", quanSat:"Quan Sát"};
  const personalityMap = {
    tyKiep:"tự lập, mạnh mẽ, có tinh thần cạnh tranh, đôi khi cứng đầu và thích làm theo ý mình",
    an:"ham học hỏi, điềm đạm, trọng tình cảm, thiên về suy nghĩ hơn hành động",
    thucThuong:"sáng tạo, khéo ăn nói, thích thể hiện bản thân, nhạy cảm với nghệ thuật",
    tai:"thực tế, nhạy bén với tiền bạc và cơ hội, chăm chỉ nhưng đôi khi vụ lợi",
    quanSat:"có kỷ luật, trách nhiệm, chí tiến thủ cao, thích quy củ và địa vị"
  };
  const level = (v)=> v>=4? "mạnh" : (v>=2? "vừa phải" : "yếu");
  const taiLevel = level(g.tai), quanLevel = level(g.quanSat), thucLevel = level(g.thucThuong), anLevel = level(g.an);

  function conDauGioiTinh(){
    const dayElem = elementOfCan(data.day.can), hourElem = elementOfCan(data.hour.can);
    const gioKhacNgay = CONTROLS[ELEMENT_NAMES[hourElem]]===ELEMENT_NAMES[dayElem];
    const ngayKhacGio = CONTROLS[ELEMENT_NAMES[dayElem]]===ELEMENT_NAMES[hourElem];
    const dongHanh = dayElem===hourElem;
    const tuongSinh = GENERATES[ELEMENT_NAMES[dayElem]]===ELEMENT_NAMES[hourElem] || GENERATES[ELEMENT_NAMES[hourElem]]===ELEMENT_NAMES[dayElem];
    if(gender==='nam'){
      if(gioKhacNgay) return 'con đầu thiên hướng là <b>trai</b> (Can Giờ khắc Can Ngày, §16.2)';
      if(ngayKhacGio) return 'con đầu thiên hướng là <b>gái</b> (Can Ngày khắc Can Giờ, §16.2)';
      if(dongHanh || tuongSinh) return 'con đầu thiên hướng là <b>gái</b> (Ngày-Giờ đồng hành/tương sinh, §16.2)';
    } else {
      if(ngayKhacGio) return 'con đầu thiên hướng là <b>trai</b> (Can Ngày khắc Can Giờ, §16.2)';
      if(gioKhacNgay) return 'con đầu thiên hướng là <b>gái</b> (Can Giờ khắc Can Ngày, §16.2)';
      if(dongHanh || tuongSinh) return 'con đầu thiên hướng là <b>gái</b> (Ngày-Giờ đồng hành/tương sinh, §16.2)';
    }
    return null;
  }
  const conDauNote = conDauGioiTinh();

  // Đoạn 1 — Tính cách (tóm lược, chi tiết đầy đủ ở mục 2.12)
  let p1 = `Thập Thần nổi bật nhất trong lá số là <b>${labelMap[dominant]}</b>, cho thấy xu hướng ${personalityMap[dominant]} — xem phân tích đầy đủ hơn ở mục 2.12 (Tính Cách).`;

  // Đoạn 2 — Vợ/chồng & con cái (tóm lược, chi tiết ở mục 2.10)
  let p2;
  if(gender==='nam'){
    const chinhQuan = g.chinhQuan||0, thatSat = g.thatSat||0;
    let traiGai;
    if(chinhQuan===0 && thatSat===0) traiGai = 'không nghiêng rõ trai/gái theo tổng thể Quan Sát';
    else if(thatSat>chinhQuan) traiGai = 'nghiêng về con trai theo tổng thể Quan Sát (Thất Sát trội hơn Chính Quan)';
    else if(chinhQuan>thatSat) traiGai = 'nghiêng về con gái theo tổng thể Quan Sát (Chính Quan trội hơn Thất Sát)';
    else traiGai = 'Chính Quan và Thất Sát ngang nhau, không nghiêng rõ';
    p2 = `Về gia đình, sao Tài tinh (vợ) ở mức <b>${taiLevel}</b>${g.tai===0?" (không rõ trong Tứ Trụ)":""}, còn sao Quan Sát (con cái, với nam mệnh dùng Quan Sát chứ không phải Thực Thương) ở mức <b>${quanLevel}</b> — ${traiGai}${conDauNote?', và '+conDauNote:''}. Xem chi tiết ở mục 2.9 (Lục Thân) và 2.10 (Hôn Nhân).`;
  } else {
    p2 = `Về gia đình, sao Quan Sát (chồng) ở mức <b>${quanLevel}</b>${g.quanSat===0?" (không rõ trong Tứ Trụ)":""}, còn sao Thực Thương (con cái) ở mức <b>${thucLevel}</b>${conDauNote?', và '+conDauNote:''}. Xem chi tiết ở mục 2.9 (Lục Thân) và 2.10 (Hôn Nhân).`;
  }

  // Đoạn 3 — Sức khỏe: CHỈ tín hiệu chung, không quy bộ phận/bệnh cụ thể (đồng nhất với mục 2.3)
  let elemTotals=[0,0,0,0,0];
  function addElem(canIdx,w){ elemTotals[elementOfCan(canIdx)]+=w; }
  addElem(data.year.can,1); addElem(data.month.can,1); addElem(data.day.can,1); addElem(data.hour.can,1);
  [[data.year.chi,1],[data.month.chi,1.5],[data.day.chi,1],[data.hour.chi,1]].forEach(([chi,mult])=>{
    TANG_CAN[chi].forEach((tc,i)=> { elemTotals[elementOfCan(tc)] += [1,0.5,0.3][i]*mult; });
  });
  const avgElem = elemTotals.reduce((a,b)=>a+b,0)/5;
  let minIdx=0; for(let i=1;i<5;i++) if(elemTotals[i]<elemTotals[minIdx]) minIdx=i;
  let p3;
  if(avgElem<=0 || (avgElem-elemTotals[minIdx])/avgElem < 0.5){
    p3 = `Về sức khỏe, 5 hành trong lá số khá cân bằng, không có hành nào yếu vượt trội — không có tín hiệu gì đặc biệt cần lưu ý thêm ở khía cạnh này.`;
  } else {
    p3 = `Về sức khỏe, hành <b>${ELEMENT_NAMES[minIdx]}</b> hiện diện yếu nhất trong lá số — theo lý thuyết Ngũ Hành, đây thường được xem là dấu hiệu nên chú ý cân bằng nhịp sống, nghỉ ngơi và ăn uống điều độ hơn; đây chỉ là gợi ý chăm sóc bản thân nói chung, không phải chẩn đoán và không gắn với bộ phận cơ thể hay bệnh lý cụ thể nào.`;
  }

  // Đoạn 4 — Tài lộc, Công danh, Học tập (tóm lược, chi tiết ở mục 2.11)
  const taiDungHy = (dungThan.dungThan===elemWealth(strength.dmElem) || dungThan.hyThan===elemWealth(strength.dmElem));
  const quanDungHy = (dungThan.dungThan===elemAuthority(strength.dmElem) || dungThan.hyThan===elemAuthority(strength.dmElem));
  let p4 = `Về sự nghiệp, Tài tinh ở mức <b>${taiLevel}</b> và ${taiDungHy?'trùng Dụng/Hỷ Thần nên tài vận khá thuận':'không trùng Dụng/Hỷ Thần nên tài lộc thường cần nỗ lực nhiều hơn'}; Quan Sát ở mức <b>${quanLevel}</b> và ${quanDungHy?'cũng trùng Dụng/Hỷ Thần, khá thuận cho con đường công danh':'không trùng Dụng/Hỷ Thần, có thể hợp hướng tự chủ hơn là quan chức/công sở cứng nhắc'}. Riêng việc học, Ấn tinh ở mức <b>${anLevel}</b> — ${anLevel==='mạnh'?'có duyên với học hành, dễ được thầy cô/quý nhân nâng đỡ':'cần sự kiên trì chủ động hơn là dựa vào may mắn/quý nhân'}. Xem chi tiết ở mục 2.11 (Tài Vận · Quan Vận · Công Danh).`;

  const html = [p1,p2,p3,p4].map(p=>`<p>${p}</p>`).join('');
  document.getElementById('categories-content').innerHTML = html + `<div class="disclaimer">Mục này là bản <b>tóm lược nhanh</b> — các mục 2.9–2.13 phía trên đã phân tích đầy đủ và sâu hơn cho từng chủ đề. Riêng Con cái có 2 kỹ thuật nghiêng trai/gái độc lập theo §16.2 (tác giả tự nhận đã kiểm chứng qua khoảng 250 ca) — không phải quy tắc được mọi trường phái Tứ Trụ công nhận thống nhất, chỉ mang tính tham khảo, không phải căn cứ để khẳng định giới tính con.</div>`;
}

const ELEMENT_ADVICE = {
  0:{color:"Xanh lá, Xanh dương nhạt", dir:"Đông, Đông Nam", nums:"3, 8", jobs:"giáo dục, xuất bản/truyền thông, nông–lâm nghiệp, thời trang, nội thất gỗ"},
  1:{color:"Đỏ, Cam, Hồng, Tím", dir:"Nam", nums:"2, 7", jobs:"năng lượng, công nghệ, giải trí – truyền hình, ẩm thực, làm đẹp"},
  2:{color:"Vàng, Nâu đất", dir:"Đông Bắc, Tây Nam, Trung tâm", nums:"5, 0", jobs:"bất động sản, xây dựng, nông nghiệp, bảo hiểm, tư vấn"},
  3:{color:"Trắng, Xám, Ánh kim", dir:"Tây, Tây Bắc", nums:"4, 9", jobs:"tài chính – ngân hàng, luật, cơ khí, kim hoàn, công nghệ chính xác"},
  4:{color:"Đen, Xanh dương đậm", dir:"Bắc", nums:"1, 6", jobs:"vận tải – logistics, du lịch, thương mại, truyền thông, ngoại giao, nghiên cứu"}
};
function renderAdvice(data, strength, dungThan, name, cachCuc, hopXung, meta){
  const adv = ELEMENT_ADVICE[dungThan.dungThan];
  const g = tallyTenGodGroups(data, strength);
  const greeting = name ? `Gửi <b>${name}</b>: ` : '';

  // Sắc thái vượng/nhược theo mức độ, không chỉ nhị phân
  let mucDo;
  if(strength.ratio>=0.65) mucDo = 'khá vượng, nghiêng hẳn về một phía';
  else if(strength.ratio>=0.5) mucDo = 'vượng vừa phải';
  else if(strength.ratio>=0.35) mucDo = 'hơi nhược, chưa đến mức mất cân bằng';
  else mucDo = 'khá nhược, cần được bồi đắp nhiều';

  // Đoạn 1 — Cốt lõi lá số
  let p1 = `${greeting}Nhật Chủ mang hành <b>${ELEMENT_NAMES[strength.dmElem]}</b>, xét theo cách tính điểm độ số thì đang ở trạng thái ${mucDo} (Phe mình chiếm ${(strength.ratio*100).toFixed(0)}% tổng cục). Lá số thuộc cách cục <b>${cachCuc.name}</b>, và hành được chọn làm Dụng Thần là <b>${ELEMENT_NAMES[dungThan.dungThan]}</b>${dungThan.hyThan!==dungThan.dungThan?` (Hỷ Thần đi kèm là ${ELEMENT_NAMES[dungThan.hyThan]})`:''} — đây là hành nên được nuôi dưỡng, ưu tiên trong mọi lựa chọn lớn nhỏ của cuộc sống, trong khi hành <b>${ELEMENT_NAMES[dungThan.kyThan]}</b> (Kỵ Thần) nên được hạn chế bớt. Cổ thư có câu "Dụng Thần là thuốc, Hỷ Thần là người giúp, Kỵ Thần là bệnh" — Dụng Thần thuộc nhóm <b>${nhomThapThanCuaHanh(strength.dmElem, dungThan.dungThan)}</b>, người ${THAP_THAN_GROUP_QUOTES[nhomThapThanCuaHanh(strength.dmElem, dungThan.dungThan)]||''}`;

  // Đoạn 2 — Kết cấu nội tại (hợp xung 4 trụ)
  let p2;
  if(hopXung){
    if(hopXung.overallType==='nhuoc' && hopXung.score>=2){
      p2 = `Nhìn vào mối quan hệ giữa 4 trụ gốc, các can chi trong lá số khá hài hòa, ít va chạm với nhau${hopXung.topHighlight?` — nổi bật nhất là ${hopXung.topHighlight}`:''}. Đây là một nền tảng khá ổn định để dựa vào khi đối diện với các giai đoạn khó khăn về sau.`;
    } else if(hopXung.score<=-2){
      p2 = `Bốn trụ gốc lại có phần xung khắc nhiều hơn là hài hòa${hopXung.topHighlight?`, rõ nhất ở chỗ ${hopXung.topHighlight}`:''}. Điều này không có nghĩa là số phận xấu, nhưng gợi ý rằng bạn có thể cần chủ động dung hòa các mối quan hệ/giai đoạn cuộc đời liên quan hơn là để mọi việc tự nhiên trôi qua — xem chi tiết ở mục 2.2 để biết cụ thể trụ nào, người thân nào cần lưu tâm.`;
    } else {
      p2 = `Bốn trụ gốc ở mức tương đối cân bằng giữa hợp và xung khắc, không có yếu tố nào lấn át rõ rệt — nhìn chung đây là một cấu trúc trung tính, mọi việc tốt xấu sẽ phụ thuộc nhiều vào Đại Vận/Lưu Niên hơn là vào bản thân lá số gốc.`;
    }
  } else {
    p2 = '';
  }

  // Đoạn 3 — Giai đoạn hiện tại
  let p3 = '';
  if(meta && meta.currentDvCat && meta.centerCat){
    const dvL = meta.currentDvCat.label.toLowerCase(), lnL = meta.centerCat.label.toLowerCase();
    p3 = `Ở tuổi ${meta.currentAge} hiện tại (năm ${meta.predictYear}), bạn đang trải qua một Đại Vận được đánh giá ở mức <b>${dvL}</b>, và riêng năm nay lại rơi vào mức <b>${lnL}</b>. `;
    if(meta.currentDvCat.label==='Tốt' && meta.centerCat.label==='Tốt'){
      p3 += 'Đây là giai đoạn khá thuận lợi để chủ động triển khai các kế hoạch quan trọng thay vì chần chừ.';
    } else if(meta.currentDvCat.label==='Xấu' || meta.centerCat.label==='Xấu'){
      p3 += 'Đây là giai đoạn nên ưu tiên sự thận trọng, củng cố nền tảng hơn là mạo hiểm mở rộng — xem chi tiết ở mục 2.7 để biết vì sao.';
    } else {
      p3 += 'Nhìn chung đây không phải giai đoạn quá nổi bật theo hướng nào, phù hợp để duy trì nhịp độ ổn định hiện có.';
    }
  }

  // Đoạn 4 — Tính cách cốt lõi (rút gọn 1 câu từ mẫu hình đã tính ở 2.12)
  const coKhacChe = (g.thucThuong + g.quanSat) >= 2;
  const coSinhPhu = (g.an + g.tyKiep) >= 2;
  let p4;
  if(strength.verdict==='vuong'){
    p4 = coKhacChe ? 'Về tính cách, bạn thuộc dạng thân vượng có sự khắc chế vừa đủ — thường minh bạch, quyết đoán và giàu tình nghĩa.' : 'Về tính cách, thân vượng nhưng thiếu sự khắc chế rõ rệt — nên chủ động tự rèn tính điềm tĩnh để tránh nóng vội, thất thường.';
  } else {
    p4 = coSinhPhu ? 'Về tính cách, thân nhược nhưng có chỗ dựa (Ấn/Tỷ Kiếp) khá tốt — thường cẩn trọng, chu đáo, giữ chữ tín.' : 'Về tính cách, thân nhược mà thiếu chỗ dựa rõ rệt — nên rèn thêm sự quyết đoán, nhất quán trong lời nói và hành động.';
  }

  // Đoạn 5 — Gợi ý thực hành
  let p5 = `Về mặt thực hành hằng ngày, những gợi ý sau có thể giúp cân bằng năng lượng theo hướng có lợi cho Dụng Thần: ưu tiên màu <b>${adv.color}</b>, hướng <b>${adv.dir}</b> khi có thể chọn (chỗ ngồi làm việc, cửa chính), con số hợp mệnh <b>${adv.nums}</b>, và các lĩnh vực như <b>${adv.jobs}</b> nhìn chung phù hợp với cấu trúc lá số này hơn. Ngược lại, nên hạn chế lạm dụng hành ${ELEMENT_NAMES[dungThan.kyThan]} trong không gian sống và làm việc chính.`;

  const doanVan = [p1, p2, p3, p4, p5].filter(Boolean).map(p=>`<p>${p}</p>`).join('');
  document.getElementById('advice-content').innerHTML = doanVan +
    `<div class="disclaimer">Đây là bản tổng hợp tự động, kết nối lại các kết quả đã tính ở những mục phía trên (Vượng/Nhược, Cách Cục, Dụng Thần, Hợp Xung, Đại Vận/Lưu Niên, Tính Cách) thành một mạch văn liền — không phải một nguồn thông tin mới. Tứ Trụ là một góc nhìn tham khảo về xu hướng, không quyết định hoàn toàn số phận. Mọi quyết định quan trọng (sự nghiệp, hôn nhân, sức khỏe, tài chính) nên dựa trên thực tế cuộc sống, tư vấn từ chuyên gia trong lĩnh vực liên quan, và sự chủ động của chính bạn.</div>`;
}

function renderPhase2(data, manual){
  const gender = document.getElementById('p-gender').value;
  const name = document.getElementById('p-name').value.trim();

  // Chạy từng mục ĐỘC LẬP: nếu 1 mục lỗi, chỉ mục đó báo lỗi rõ ràng —
  // các mục khác vẫn tính và hiển thị bình thường, không bị kéo theo.
  function safe(label, panelId, fn){
    try{ return fn(); }
    catch(e){
      console.error(`[Lỗi ở mục "${label}"]`, e);
      const el = panelId && document.getElementById(panelId);
      if(el) el.innerHTML = `<p style="color:#a5342b;">⚠ Có lỗi khi tính mục "${label}": ${e.message}. Các mục khác vẫn hiển thị bình thường — vui lòng báo lại lỗi này kèm ngày giờ sinh đã nhập để được sửa.</p>`;
      return null;
    }
  }

  const strength = safe('Nhật Nguyên: Vượng/Nhược', 'strength-content', ()=>renderStrength(data, manual));
  if(!strength) return; // hầu hết các mục sau đều cần strength, không thể tiếp tục an toàn
  safe('12 Cung Trường Sinh', 'truongsinh-content', ()=>renderTruongSinh(data, strength));
  safe('Cách Cục', 'cachcuc-content', ()=>renderChinhCach(data, strength));
  safe('Cách Cục Đặc Biệt', 'cachcuc-content', ()=>renderCachCucDacBiet(data, strength));
  const cachCuc = safe('Xác định Cách Cục', null, ()=>xacDinhChinhCach(data)) || {name:'—'};
  const dungThan = safe('Dụng Thần', 'dungthan-content', ()=>renderDungThan(data, strength));
  if(!dungThan) return; // hầu hết các mục sau đều cần dungThan
  const hopXung = safe('Hợp Xung Hình Hại', 'hopxung-content', ()=>renderHopXungHinhHai(data, dungThan)) || {};
  safe('Thai Nguyên & Cung Mệnh', 'thainguyen-content', ()=>renderThaiNguyenCungMenh(data, strength, dungThan));
  safe('Thần Sát', 'thansat-content', ()=>renderThanSat(data, strength));
  safe('Thần Sát Mở Rộng', 'thansat-content', ()=>renderThanSatMoRong(data, strength));
  const meta = safe('Đại Vận & Lưu Niên', 'daivan-content', ()=>renderDaiVanLuuNien(data, gender, manual, dungThan));
  safe('Những Năm Đáng Chú Ý', 'specialyears-content', ()=>renderSpecialYears(data, dungThan, meta));
  safe('Lục Thân Mở Rộng', 'lucthan-content', ()=>renderLucThanMoRong(data, gender, strength, dungThan));
  safe('Hôn Nhân', 'honnhan-content', ()=>renderHonNhan(data, gender, strength, dungThan));
  safe('Tài Vận · Quan Vận · Công Danh', 'taiquan-content', ()=>renderTaiQuanCongDanh(data, strength, dungThan));
  safe('Tính Cách', 'tinhcach-content', ()=>renderTinhCach(data, strength, dungThan));
  safe('Giàu Nghèo · Sang Hèn · Cát Hung', 'giaunghesanghen-content', ()=>renderGiauNgheoSangHen(data, strength, dungThan));
  safe('Dự Đoán Theo Từng Mục', 'categories-content', ()=>renderCategories(data, gender, strength, dungThan));
  safe('Tư Vấn Tổng Hợp', 'advice-content', ()=>renderAdvice(data, strength, dungThan, name, cachCuc, hopXung, meta));
}
