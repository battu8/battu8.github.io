/* ============================================================
   §15, §18, §20, §21 (tttt.md) — HÔN NHÂN · TÀI/QUAN VẬN/CÔNG DANH ·
   TÍNH CÁCH · GIÀU NGHÈO SANG HÈN CÁT HUNG
   Không cài §17 (tu hành — nội dung hẹp, ít ứng dụng số đông),
   §19 (bệnh tật/tử vong/lao tù) và §21.4 (Thọ/Yểu) — giữ đúng ranh
   giới an toàn đã thống nhất xuyên suốt dự án.
   ============================================================ */

// Nhóm Thập Thần của 1 hành bất kỳ so với Nhật Chủ — dùng chung cho cả 4 mục.
function nhomThapThanCuaHanh(dmElem, elem){
  if(elem===dmElem) return 'Tỷ Kiếp';
  if(elem===elemResource(dmElem)) return 'Ấn';
  if(elem===elemOutput(dmElem)) return 'Thực Thương';
  if(elem===elemWealth(dmElem)) return 'Tài';
  return 'Quan Sát';
}

/* ---------------- §15 — HÔN NHÂN ---------------- */
function renderHonNhan(data, gender, strength, dungThan){
  const box = document.getElementById('honnhan-content');
  if(!box) return;
  const g = tallyTenGodGroups(data);
  const dmCan = data.day.can;
  const dayChi = data.day.chi, hourChi = data.hour.chi;
  const saoVoChongLevel = gender==='nam' ? g.tai : g.quanSat;
  const label = gender==='nam' ? 'Tài tinh (sao vợ)' : 'Quan Sát (sao chồng)';

  let html = `<h4>Sao Vợ/Chồng</h4><p>${label} hiện ở mức <b>${saoVoChongLevel.toFixed(1)}</b> điểm. `;
  html += saoVoChongLevel===0 ? 'Không xuất hiện rõ trong Tứ Trụ — theo §15.4, có thể là dấu hiệu duyên vợ/chồng đến muộn hoặc cần chủ động hơn.' : '';
  html += `</p>`;

  const canElem = elementOfCan(dmCan), chiElem = ELEMENT_OF_CHI[dayChi];
  let canChiNote;
  if(GENERATES[ELEMENT_NAMES[canElem]]===ELEMENT_NAMES[chiElem]) canChiNote = {t:'good', text:'Can sinh Chi trụ Ngày — theo tài liệu, dấu hiệu người này chủ động yêu thương, quan tâm bạn đời.'};
  else if(GENERATES[ELEMENT_NAMES[chiElem]]===ELEMENT_NAMES[canElem]) canChiNote = {t:'good', text:'Chi sinh Can trụ Ngày — theo tài liệu, dấu hiệu được bạn đời yêu thương, chăm sóc.'};
  else if(canElem===chiElem) canChiNote = {t:'good', text:'Can Chi trụ Ngày cùng hành — khá hòa hợp, tính cách hai người gần gũi.'};
  else canChiNote = {t:'neutral', text:'Can Chi trụ Ngày không tương sinh rõ — không phải dấu hiệu xấu, chỉ là không có điểm cộng đặc biệt ở khía cạnh này.'};
  html += `<p><span class="tag tag-${canChiNote.t}">Can ↔ Chi trụ Ngày</span> ${canChiNote.text}</p>`;

  const chiNgayChuKhi = TANG_CAN[dayChi][0];
  const chiNgayGod = tenGod(dmCan, chiNgayChuKhi);
  const CHI_NGAY_MEANING = {
    'Chính Quan': {t:'good', text:'vợ/chồng đoan trang, hiền thục.'},
    'Thực Thần': {t:'good', text:'vợ/chồng rộng rãi, chăm lo gia đình (nếu không bị Kiêu Thần đoạt mất).'},
    'Chính Tài': {t:'good', text:'được vợ/chồng giúp đỡ về của cải/hậu thuẫn.'},
    'Thiên Tài': {t:'good', text:'được vợ/chồng giúp đỡ về của cải/hậu thuẫn.'},
    'Chính Ấn': {t:'good', text:'vợ/chồng hiền — nếu thân đang nhược thì càng tốt.'},
    'Tỷ Kiên': {t:'neutral', text:'vợ/chồng tháo vát — tốt hơn nếu thân đang nhược, không thì chỉ trung tính.'},
    'Kiếp Tài': {t:'neutral', text:'vợ/chồng tháo vát — tốt hơn nếu thân đang nhược, không thì chỉ trung tính.'},
    'Thất Sát': {t:'bad', text:'dễ thô bạo/không hòa thuận (nếu được chế ngự bởi Thực Thần khác trong lá số hoặc được hợp thì đỡ hơn nhiều).'},
    'Thương Quan': {t:'neutral', text:'thông minh sắc sảo nhưng cần chú ý dễ va chạm lời qua tiếng lại.'},
    'Kiêu Thần': {t:'bad', text:'cần chú ý duyên vợ chồng trắc trở hơn, dễ hiểu lầm.'}
  };
  const cnm = CHI_NGAY_MEANING[chiNgayGod];
  if(cnm) html += `<p><span class="tag tag-${cnm.t}">Chi Ngày = ${chiNgayGod}</span> ${cnm.text}</p>`;
  if(strength.verdict==='vuong' && KINH_DUONG_MAP[dmCan]===dayChi){
    html += `<p><span class="tag tag-bad">Kình Dương tại trụ Ngày</span> Thân đang vượng mà trụ Ngày là Kình Dương — theo tài liệu, dễ hao tài/vợ chồng không êm ấm.</p>`;
  }

  const dauHieu = [];
  if(gender==='nam'){
    if(strength.verdict==='nhuoc' && g.tai>=3) dauHieu.push('Thân nhược mà Tài khá vượng (không gánh nổi) — theo §15.4, dễ phá tài/hại vợ, nên chú ý cân bằng công việc và gia đình.');
    if(g.tyKiep>=3) dauHieu.push('Tỷ/Kiếp khá nhiều — theo §15.4, dễ có người tranh giành/cản trở duyên vợ chồng, hoặc bản thân dễ phân tâm ngoài luồng.');
    if(g.tai===0) dauHieu.push('Không thấy Tài tinh rõ trong Tứ Trụ — theo §15.4, đây là dấu hiệu cần chủ động hơn trong chuyện hôn nhân, không tự đến dễ dàng.');
  } else {
    if(g.chinhQuan>=1.5 && g.thatSat>=1.5) dauHieu.push('Chính Quan và Thất Sát cùng khá rõ (Quan Sát hỗn tạp) — theo §15.4, dễ có trắc trở/đắn đo trong chuyện tình cảm, nên chọn lọc kỹ.');
    if(g.tyKiep>=3 || (g.thucThuong>=3 && strength.verdict==='vuong')) dauHieu.push('Thân khá cứng (Tỷ/Kiếp hoặc Thực Thương đều mạnh trong khi thân đã vượng) — theo §15.6, nên chủ động mềm mỏng hơn trong ứng xử gia đình để giữ hòa khí, không phải là "khắc chồng" theo nghĩa đen.');
    if(g.quanSat===0) dauHieu.push('Không thấy Quan Sát rõ trong Tứ Trụ — theo §15.4, đây là dấu hiệu cần chủ động hơn trong chuyện hôn nhân.');
  }
  const xungNgayGio = CHI_LUC_XUNG.some(([a,b])=>(a===dayChi&&b===hourChi)||(b===dayChi&&a===hourChi));
  if(xungNgayGio) dauHieu.push('Chi Ngày xung Chi Giờ — theo §15.4, dấu hiệu cần chú ý dung hòa giữa hai vợ chồng và con cái.');

  html += dauHieu.length
    ? `<div style="margin-top:6px;">${dauHieu.map(t=>`<p><span class="tag tag-bad">Lưu ý</span> ${t}</p>`).join('')}</div>`
    : `<p><span class="tag tag-good">Không có dấu hiệu bất lợi rõ</span> Không thấy nổi bật các dấu hiệu trắc trở chính theo §15.4/§15.6.</p>`;

  html += `<div class="disclaimer">Áp dụng theo tài liệu §15 (rút gọn các dấu hiệu chính, không liệt kê hết Quý Nhân/Trạch Mã/Đào Hoa/Cô Loan Sát/Không Vong vì các sao đó chưa cài đủ). §15.5 (trụ năm hai vợ chồng có thể hóa giải mọi khắc kỵ khác) <b>không thể tự tính</b> vì cần Tứ Trụ của cả hai người — nếu bạn muốn xét hợp hôn cụ thể, hãy lập lá số người kia và so trụ Năm thủ công theo nguyên tắc tài liệu đã nêu. Tài liệu gốc cũng lưu ý nguyên lý nền §15.1 ("nam nên vượng, nữ nên nhu") mang đậm dấu ấn thời đại, nên đọc có phản biện chứ không xem là chân lý phổ quát.</div>`;
  box.innerHTML = html;
}

/* ---------------- §18 — TÀI VẬN · QUAN VẬN · CÔNG DANH ---------------- */
function renderTaiQuanCongDanh(data, strength, dungThan){
  const box = document.getElementById('taiquan-content');
  if(!box) return;
  const g = tallyTenGodGroups(data);
  const dmElem = strength.dmElem;
  const nhomDungThan = nhomThapThanCuaHanh(dmElem, dungThan.dungThan);

  let html = `<h4>Tài Vận</h4>`;
  html += `<p>Nhóm Thập Thần của Dụng Thần trong lá số này là <b>${nhomDungThan}</b>.</p>`;
  const taiNotes = [];
  if(strength.verdict==='vuong' && g.tai>=2.5) taiNotes.push({t:'good', text:'Thân vượng và Tài cũng khá vượng — theo §18.1, đây là tổ hợp có tiềm năng phú quý song toàn, đặc biệt nếu có thêm Quan tinh.'});
  if(strength.verdict==='nhuoc' && g.tai>=3){
    const canGanh = g.an>=1.5 || g.tyKiep>=1.5;
    taiNotes.push({t: canGanh?'neutral':'bad', text:`Thân nhược mà Tài khá nhiều — theo §18.1, cần Ấn hộ thân hoặc Tỷ/Kiếp gánh đỡ mới giữ được của. Lá số này ${canGanh?'đã có Ấn/Tỷ Kiếp hỗ trợ phần nào':'chưa thấy rõ Ấn hay Tỷ Kiếp hỗ trợ — nên thận trọng hơn với các quyết định tài chính lớn'}.`});
  }
  if(g.tyKiep>=3.5) taiNotes.push({t:'bad', text:'Tỷ/Kiếp khá nhiều — theo §18.1, cần đặc biệt thận trọng khi gặp vận/năm Tỷ Kiếp (dễ tranh giành, phá tài); nên hạn chế mở rộng đầu tư lớn trong giai đoạn đó.'});
  if(g.tai===0) taiNotes.push({t:'neutral', text:'Không có Tài tinh rõ trong Tứ Trụ — theo §18.1, không phải là dấu hiệu thuận lợi cho kinh doanh/buôn bán riêng, có thể hợp hướng đi ổn định (làm công, chuyên môn) hơn.'});
  html += taiNotes.length
    ? taiNotes.map(n=>`<p><span class="tag tag-${n.t}">Tài Vận</span> ${n.text}</p>`).join('')
    : `<p>Không có dấu hiệu Tài Vận nào nổi bật rõ để nhấn mạnh thêm.</p>`;

  html += `<h4 style="margin-top:14px;">Quan Vận</h4>`;
  const quanNotes = [];
  if(g.chinhQuan>=1 && g.thatSat>=1) quanNotes.push({t:'bad', text:'Quan và Sát cùng xuất hiện khá rõ (Quan Sát hỗn tạp) — theo §18.2, nói chung bất lợi cho đường quan chức/sự nghiệp ổn định, trừ khi công việc thiên hẳn về một hướng rõ ràng (quản lý ổn định hoặc cạnh tranh/kỷ luật) để "khử bớt một bên".'});
  if(g.thucThuong>=2 && g.chinhQuan>=1) quanNotes.push({t:'bad', text:'Thực/Thương khá rõ trong khi vẫn có Chính Quan — mô-típ gần với "Thương Quan gặp Quan" theo §18.2 (một mô-típ tài liệu nhấn mạnh là xấu lặp lại nhiều nhất trong quan trường) — nên thận trọng, tránh phát ngôn/quyết định nóng vội ở môi trường công sở/chính trị nội bộ.'});
  if(g.quanSat===0 && g.tai===0) quanNotes.push({t:'neutral', text:'Không có cả Quan Sát lẫn Tài tinh — theo §18.2, con đường quan chức truyền thống không phải thế mạnh của lá số này; có thể hợp hướng chuyên môn/tự do hơn.'});
  html += quanNotes.length
    ? quanNotes.map(n=>`<p><span class="tag tag-${n.t}">Quan Vận</span> ${n.text}</p>`).join('')
    : `<p>Không có dấu hiệu Quan Vận nào nổi bật rõ để nhấn mạnh thêm.</p>`;

  html += `<h4 style="margin-top:14px;">Công Danh (học hành)</h4>`;
  const congDanhNotes = [];
  if(g.an>=3 && g.tai<2) congDanhNotes.push({t:'good', text:'Ấn tinh khá vượng và không bị Tài phá — theo §18.3, đây là chỉ dấu trí tuệ/khả năng học rõ nhất trong tài liệu.'});
  if(strength.verdict==='nhuoc' && g.an<1.5) congDanhNotes.push({t:'bad', text:'Thân nhược mà Ấn cũng không mạnh — theo §18.3, không phải giai đoạn/nền tảng thuận lợi để "cố" thi cử nặng, nên chọn hướng học phù hợp sức thay vì chạy theo áp lực.'});
  if(g.tai>=3 && g.tyKiep<1.5) congDanhNotes.push({t:'bad', text:'Tài khá nhiều mà không có Tỷ/Kiếp giúp thân — theo §18.3, Tài vượng dễ kéo tâm trí khỏi việc học/nghiên cứu, nên cân bằng giữa kiếm tiền sớm và đầu tư dài hạn cho học vấn.'});
  html += congDanhNotes.length
    ? congDanhNotes.map(n=>`<p><span class="tag tag-${n.t}">Công Danh</span> ${n.text}</p>`).join('')
    : `<p>Không có dấu hiệu Công Danh nào nổi bật rõ để nhấn mạnh thêm.</p>`;

  html += `<div class="disclaimer">Áp dụng theo tài liệu §18 (rút gọn các dấu hiệu chính, không liệt kê hết Quý Nhân/Trạch Mã/Hoa Cái/Kim Thủy Thương Quan vì các sao/tổ hợp đó chưa cài đủ). "Tài nhập Mộ/Khố được xung mở → phát tài đột ngột" đã lồng vào mục 2.7 (Đại Vận/Lưu Niên → Khai Mộ/Khố) khi hành giải phóng ra trùng Dụng/Hỷ Thần thuộc nhóm Tài.</div>`;
  box.innerHTML = html;
}

/* ---------------- §20 — TÍNH CÁCH ---------------- */
const TINH_CACH_TABLE = {
  3:{
    vuongQua:'Khắc bạc, hiếu chiến, dễ vô liêm sỉ nếu không được tiết chế.',
    vuongVua:'Uy vũ bất khuất, quyết đoán, coi trọng tình nghĩa.',
    nhuoc:{4:'Thủy nhiều → dễ tỏ ra lễ độ bề ngoài nhưng thiếu thành thật bên trong.', 0:'Mộc nhiều → chính trực.', 1:'Hỏa nhiều → dễ hời hợt, thiếu chiều sâu.', 2:'Thổ nhiều → hay cãi vã, đa nghi.'},
    nhuocQua:'Có nghĩa khí nhưng dễ đầu voi đuôi chuột, thiếu kiên trì.'
  },
  4:{
    vuongQua:'Dễ xảo quyệt, tàn nhẫn, buông thả nếu không được tiết chế.',
    vuongVua:'Thông minh, học rộng, hào phóng, chu đáo.',
    nhuoc:{3:'Kim nhiều → dễ tham lam, ít tình cảm.', 0:'Mộc nhiều → suy nghĩ lan man, thiếu tập trung.', 1:'Hỏa nhiều → dễ ham vui hưởng thụ quá mức.', 2:'Thổ nhiều → ngoài cứng trong mềm, dễ thất tín.'},
    nhuocQua:'Nhút nhát, thiếu chủ kiến, dễ nói năng thô vụng.'
  },
  0:{
    vuongQua:'Dễ cố chấp, tủn mủn, thiếu bao dung nếu không được tiết chế.',
    vuongVua:'Khẳng khái, nhân hậu, tinh tế.',
    nhuoc:{3:'Kim nhiều → dễ hay thay đổi, thiếu kiên định.', 4:'Thủy nhiều → nói một đằng làm một nẻo.', 1:'Hỏa nhiều → thông minh nhưng thiếu thực tế.', 2:'Thổ nhiều → biết cương nhu đúng lúc (tương đối tích cực).'},
    nhuocQua:'Lời nói và hành động dễ mâu thuẫn nhau, hơi ích kỷ.'
  },
  1:{
    vuongQua:'Nóng nảy, kiêu ngạo, dễ gây mất lòng người khác nếu không được tiết chế.',
    vuongVua:'Phân minh, văn võ song toàn, ham học hỏi.',
    nhuoc:{3:'Kim nhiều → hiếu thắng, hay tranh cãi.', 4:'Thủy nhiều → dễ thành công nhanh nhưng cũng dễ thất bại nhanh.', 0:'Mộc nhiều → hơi thô, dễ áp đặt người khác.', 2:'Thổ nhiều → nói hay nhưng làm không tới.'},
    nhuocQua:'Có tài vặt nhưng khó đi đến thành công lớn nếu không rèn thêm ý chí.'
  },
  2:{
    vuongQua:'Dễ u mê, chậm chạp, thiếu linh hoạt nếu không được tiết chế.',
    vuongVua:'Trung hậu, giữ chữ tín, tận tâm.',
    nhuoc:{3:'Kim nhiều → cương trực nhưng dễ nóng nảy.', 4:'Thủy nhiều → ham công danh, ít chú trọng tình cảm.', 0:'Mộc nhiều → chí lớn nhưng dễ viển vông.', 1:'Hỏa nhiều → dễ nói quá, thiếu chân thực.'},
    nhuocQua:'Dễ thiếu chân thực, khó nắm bắt bản chất công việc.'
  }
};
const TC_DUNG_THAN_TEXT = {
  'Quan Sát':'chính trực, hào hiệp, hiếu thắng (nếu quá nhiều dễ thiếu quyết đoán hoặc rụt rè khi việc lớn thực sự đến).',
  'Thực Thương':'ôn hậu, thông minh sắc sảo (nếu quá nhiều dễ cố chấp hoặc kiêu ngạo).',
  'Tỷ Kiếp':'hòa nhã, nhiệt tình, thẳng thắn (nếu quá nhiều dễ khó hòa nhập tập thể hoặc lỗ mãng).',
  'Tài':'siêng năng, tiết kiệm, nhạy bén, khéo léo (nếu quá nhiều dễ vì của mà hại thân hoặc ham hưởng lạc).',
  'Ấn':'nhân từ, đoan chính, có chí tiến thủ (nếu quá nhiều dễ do dự, ít quyết đoán hoặc tham lam).'
};

function renderTinhCach(data, strength, dungThan){
  const box = document.getElementById('tinhcach-content');
  if(!box) return;
  const g = tallyTenGodGroups(data);
  const dmElem = strength.dmElem;

  let html = `<h4>Bốn Mẫu Hình Tổng Quát</h4>`;
  const coKhacChe = (g.thucThuong + g.quanSat) >= 2;
  const coSinhPhu = (g.an + g.tyKiep) >= 2;
  let mauHinh;
  if(strength.verdict==='vuong'){
    mauHinh = coKhacChe
      ? {t:'good', text:'Thân vượng và có khắc chế vừa đủ (Thực Thương/Quan Sát hiện diện) — theo §20.2, thiên hướng minh bạch, hào phóng, quyết đoán, lạc quan, giàu tình nghĩa.'}
      : {t:'bad', text:'Thân vượng mà gần như không có gì khắc chế — theo §20.2, cần chủ động tự rèn tính điềm tĩnh, dễ có xu hướng nóng nảy, thất thường, lấn át người yếu hơn nếu không ý thức điều chỉnh.'};
  } else {
    mauHinh = coSinhPhu
      ? {t:'good', text:'Thân nhược nhưng có sinh phù (Ấn/Tỷ Kiếp hiện diện) — theo §20.2, thiên hướng cần kiệm, chu đáo, kín đáo, giữ chữ tín.'}
      : {t:'bad', text:'Thân nhược mà gần như không có gì sinh phù — theo §20.2, cần chủ động rèn sự quyết đoán và nhất quán, dễ có xu hướng do dự, nói một đằng làm một nẻo nếu không ý thức điều chỉnh.'};
  }
  html += `<p><span class="tag tag-${mauHinh.t}">Mẫu hình</span> ${mauHinh.text}</p>`;

  html += `<h4 style="margin-top:14px;">Theo Mức Vượng/Suy Của Nhật Chủ (${ELEMENT_NAMES[dmElem]})</h4>`;
  const tb = TINH_CACH_TABLE[dmElem];
  if(strength.ratio>=0.65){
    html += `<p><span class="tag tag-bad">Vượng quá</span> ${tb.vuongQua}</p>`;
  } else if(strength.verdict==='vuong'){
    html += `<p><span class="tag tag-good">Vượng vừa phải</span> ${tb.vuongVua}</p>`;
  } else {
    let maxElem=-1, maxVal=-1;
    strength.perElem.forEach((v,i)=>{ if(i!==dmElem && v>maxVal){maxVal=v; maxElem=i;} });
    if(strength.ratio<=0.2){
      html += `<p><span class="tag tag-bad">Nhược quá</span> ${tb.nhuocQua}</p>`;
    } else {
      html += `<p><span class="tag tag-neutral">Nhược (do hành khắc chế nhiều)</span> ${tb.nhuoc[maxElem]}</p>`;
    }
  }

  const dtGod = nhomThapThanCuaHanh(dmElem, dungThan.dungThan);
  html += `<h4 style="margin-top:14px;">Theo Dụng Thần</h4>`;
  html += `<p>Dụng Thần thuộc nhóm <b>${dtGod}</b> — theo §20.5, thiên hướng ${TC_DUNG_THAN_TEXT[dtGod]||''}</p>`;

  html += `<div class="disclaimer">Áp dụng theo tài liệu §20. "Vượng quá" được coi là khi Phe Mình chiếm từ 65% tổng cục trở lên, "Nhược quá" khi dưới 20% — đây là ngưỡng công cụ tự chọn để minh họa, tài liệu gốc không cho số cụ thể. Đây là xu hướng tính cách tham khảo dựa trên cấu trúc Ngũ Hành/Thập Thần, không phải đánh giá con người toàn diện — tính cách thực tế còn do môi trường, giáo dục, và lựa chọn cá nhân định hình rất nhiều.</div>`;
  box.innerHTML = html;
}

/* ---------------- §21 — GIÀU NGHÈO · SANG HÈN · CÁT HUNG (không làm Thọ/Yểu) ---------------- */
function renderGiauNgheoSangHen(data, strength, dungThan){
  const box = document.getElementById('giaunghesanghen-content');
  if(!box) return;
  const dmElem = strength.dmElem;
  const dtGod = nhomThapThanCuaHanh(dmElem, dungThan.dungThan);
  const ktGod = nhomThapThanCuaHanh(dmElem, dungThan.kyThan);

  let html = `<h4>Giàu – Nghèo (xét Tài tinh)</h4>`;
  if(dtGod==='Tài'){
    html += `<p><span class="tag tag-good">Dụng Thần thuộc nhóm Tài</span> Theo §21.1, đây là tổ hợp có xu hướng thuận lợi về tài chính nếu Tài không bị hình/xung/hợp phá — nên xem thêm mục 2.2 (Hợp Xung Hình Hại) để kiểm tra Tài có bị phá hay không trước khi kết luận.</p>`;
  } else if(ktGod==='Tài'){
    html += `<p><span class="tag tag-bad">Kỵ Thần thuộc nhóm Tài</span> Theo §21.1, Tài đang là gánh nặng hơn là phúc trong lá số này — nên thận trọng với các quyết định tài chính lớn, đầu tư mạo hiểm.</p>`;
  } else {
    html += `<p>Tài tinh không phải Dụng hay Kỵ Thần rõ rệt trong lá số này — theo §21.1, mức độ giàu/nghèo phụ thuộc nhiều vào việc Tài "có nguồn, có kiện toàn" hay không, khó kết luận một chiều chỉ từ cấu trúc tĩnh.</p>`;
  }

  html += `<h4 style="margin-top:14px;">Sang – Hèn (xét Quan tinh)</h4>`;
  if(dtGod==='Quan Sát'){
    html += `<p><span class="tag tag-good">Dụng Thần thuộc nhóm Quan Sát</span> Theo §21.2, đây là tổ hợp có xu hướng thuận lợi về vị thế/sự nghiệp nếu Quan không hình/xung/khắc/hại — nên xem thêm mục 2.2 để kiểm tra.</p>`;
  } else if(ktGod==='Quan Sát'){
    html += `<p><span class="tag tag-bad">Kỵ Thần thuộc nhóm Quan Sát</span> Theo §21.2, Quan/Sát đang là gánh nặng hơn là phúc — môi trường làm việc nhiều áp lực/cấp trên khắt khe có thể không hợp, nên cân nhắc hướng đi tự chủ hơn.</p>`;
  } else {
    html += `<p>Quan tinh không phải Dụng hay Kỵ Thần rõ rệt trong lá số này — theo §21.2, khó kết luận một chiều chỉ từ cấu trúc tĩnh.</p>`;
  }

  html += `<h4 style="margin-top:14px;">Cát – Hung</h4>`;
  html += `<p>Theo §21.3, nguyên tắc cốt lõi là <b>Dụng Thần có được sinh/bảo vệ hay không, Kỵ Thần có bị chế ngự hay không</b> — chi tiết đã được xét ở mục 2.5 (Dụng Thần) và 2.2 (Hợp Xung Hình Hại). Xu hướng tổng quát: ${strength.verdict==='vuong'?'thân vượng nên ưu tiên có Thực Thương/Tài/Quan Sát tiết chế đúng mức':'thân nhược nên ưu tiên có Ấn/Tỷ Kiếp sinh trợ đúng mức'} — bạn có thể đối chiếu lại với mục Dụng Thần ở trên để xem lá số hiện tại có đang ở trạng thái này không.</p>`;

  html += `<div class="disclaimer">Áp dụng theo tài liệu §21.1–21.3 — tài liệu tự nhận đây là phần mang tính <b>tương đối</b>, phụ thuộc hoàn cảnh xã hội cụ thể chứ không tuyệt đối. Phần §21.4 (Thọ/Yểu) không được cài đặt, giữ đúng ranh giới không tự động dự đoán về tuổi thọ/an toàn tính mạng. Đây là xu hướng tham khảo, không phải lời khẳng định về tương lai tài chính hay địa vị — quyết định thực tế nên dựa trên hoàn cảnh, năng lực và nỗ lực thực tế của bạn.</div>`;
  box.innerHTML = html;
}
