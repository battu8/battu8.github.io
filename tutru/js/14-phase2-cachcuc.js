/* ============================================================
   §9.1 — CHÍNH CÁCH (10 LOẠI)
   Lấy can lộ thiên can của Tứ Trụ trùng tàng can chi tháng để đặt
   tên cách theo Thập Thần so với Nhật Chủ. Không có thì lấy tàng
   can chủ khí. Hai trường hợp đặc biệt (Kiến Lộc, Kình Dương) xét
   trước, không cần tra tàng can — tái dùng đúng dữ liệu Trường
   Sinh (§5) và KINH_DUONG_MAP đã có trong app.
   ============================================================ */
function chinhCachTenFromThapThan(god){
  if(god==='Kiêu Thần') return 'Thiên Ấn';       // đồng nghĩa, tên gọi cách khác tên thập thần
  if(god==='Tỷ Kiên')   return 'Kiến Lộc';        // gộp theo quy ước cách cục
  if(god==='Kiếp Tài')  return 'Kình Dương';
  return god; // Chính Quan, Thất Sát, Chính Tài, Thiên Tài, Chính Ấn, Thực Thần, Thương Quan giữ nguyên tên
}

function xacDinhChinhCach(data){
  const dayCan = data.day.can, monthChi = data.month.chi;

  const ts = truongSinhIndex(dayCan, monthChi);
  if(ts===3){
    return {name:'Kiến Lộc', method:'đặc biệt', note:'Chi tháng đúng vị trí Lâm Quan của Nhật Chủ — không cần tra tàng can.'};
  }
  if(monthChi === KINH_DUONG_MAP[dayCan]){
    return {name:'Kình Dương', method:'đặc biệt', note:'Chi tháng đúng vị trí Đế Vượng (can dương) / Kiếp Tài (can âm) của Nhật Chủ — không cần tra tàng can.'};
  }

  const tang = TANG_CAN[monthChi];
  const cans4 = [data.year.can, data.month.can, data.day.can, data.hour.can];
  for(let k=0;k<tang.length;k++){
    const tc = tang[k];
    if(cans4.includes(tc)){
      const god = tenGod(dayCan, tc);
      return {name:chinhCachTenFromThapThan(god), method:'lộ thiên can', note:`Tàng can ${CAN[tc]} (${TANG_ROLE[k]} của chi tháng ${CHI[monthChi]}) lộ ra ở Thiên Can Tứ Trụ, là ${god} so với Nhật Chủ.`, god, tangCan:tc};
    }
  }
  const chuKhiCan = tang[0];
  const god = tenGod(dayCan, chuKhiCan);
  return {name:chinhCachTenFromThapThan(god), method:'chủ khí (không có can lộ)', note:`Không có tàng can nào của chi tháng ${CHI[monthChi]} lộ ra Thiên Can, dùng tàng can chủ khí ${CAN[chuKhiCan]}, là ${god} so với Nhật Chủ.`, god, tangCan:chuKhiCan};
}

const CACH_CUC_NOTE = {
  'Chính Quan': 'Tốt nếu thân vượng có Tài sinh Quan, hoặc thân nhược có Ấn hóa Quan sinh thân, không Quan-Sát hỗn tạp, không hình-xung-phá-hại. Xấu nếu thân vượng mà Tài nhẹ Tỷ Kiếp nhiều, hoặc Quan Sát hỗn tạp, hoặc bị hình xung.',
  'Thất Sát': 'Tốt nếu thân vượng gặp Sát (có Thực Thần chế nếu Sát quá mạnh), hoặc thân nhược có Ấn hóa Sát sinh thân, hoặc Thân-Sát cân bằng gặp thêm Chính Quan (không hỗn). Xấu nếu thân nhược mà Sát vượng không chế/hóa, hoặc Tài sinh thêm Sát mà không Thực Thương khắc chế.',
  'Chính Ấn': 'Tốt nếu thân vượng có Ấn gặp thêm Quan/Sát sinh Ấn, hoặc Ấn quá nhiều có Thực Thương xì bớt, hoặc có Tài chế Ấn vừa phải. Xấu nếu thân nhược mà Ấn cũng nhược lại bị Tài khắc, hoặc thân nhược Sát nhiều còn thêm Quan Ấn dồn về.',
  'Thiên Ấn': 'Tốt nếu thân vượng có Ấn gặp thêm Quan/Sát sinh Ấn, hoặc Ấn quá nhiều có Thực Thương xì bớt, hoặc có Tài chế Ấn vừa phải. Xấu nếu thân nhược mà Ấn cũng nhược lại bị Tài khắc, hoặc thân nhược Sát nhiều còn thêm Quan Ấn dồn về.',
  'Chính Tài': 'Tốt nếu thân vượng Tài cũng vượng có Quan tiết chế bớt thân, hoặc thân nhược Tài vượng có Ấn/Tỷ Kiếp hộ thân, hoặc thân vượng Tài nhược có Thực Thần xì thân sinh Tài. Xấu nếu thân vượng Tài nhược mà Tỷ Kiếp nhiều, hoặc Tài bị hình xung phá hại.',
  'Thiên Tài': 'Tốt nếu thân vượng Tài cũng vượng có Quan tiết chế bớt thân, hoặc thân nhược Tài vượng có Ấn/Tỷ Kiếp hộ thân, hoặc thân vượng Tài nhược có Thực Thần xì thân sinh Tài. Xấu nếu thân vượng Tài nhược mà Tỷ Kiếp nhiều, hoặc Tài bị hình xung phá hại.',
  'Thực Thần': 'Tốt nếu thân vượng Thực cũng vượng gặp Tài xì bớt, hoặc thân vượng Sát mạnh có Thực chế Sát, hoặc thân nhược có Ấn hộ thân. Xấu nếu thân vượng Thực yếu lại gặp Ấn sinh thân thêm, hoặc thân nhược Thực sinh Tài lại còn Thất Sát.',
  'Thương Quan': 'Tốt nếu thân vượng Thương xì thân sinh Tài, hoặc thân nhược có Ấn hộ thân chế Thương, hoặc thân vượng Sát nhiều có Thương khắc chế Sát. Xấu nếu thân nhược mà Quan Sát khắc thân hoặc Thương sinh thêm Quan Sát, hoặc thân vượng Thương nhẹ mà Ấn nhiều khắc mất/bị hình xung.',
  'Kiến Lộc': 'Tốt nếu thân vượng có Tài-Quan-Sát cũng vượng tương xứng, hoặc thân vượng có Thực Thương vượng tương xứng, hoặc thân nhược có Ấn/Tỷ Kiếp trợ giúp. Xấu nếu thân vượng Tài nhược mà Tỷ Kiếp nhiều, hoặc thân vượng Thực Thương yếu mà Ấn nhiều khắc mất, hoặc thân nhược & Ấn/Tỷ Kiếp cũng nhược mà Tài-Quan-Sát lại nhiều.',
  'Kình Dương': 'Tốt nếu thân vượng có Tài-Quan-Sát cũng vượng tương xứng, hoặc thân vượng có Thực Thương vượng tương xứng, hoặc thân nhược có Ấn/Tỷ Kiếp trợ giúp. Xấu nếu thân vượng Tài nhược mà Tỷ Kiếp nhiều, hoặc thân vượng Thực Thương yếu mà Ấn nhiều khắc mất, hoặc thân nhược & Ấn/Tỷ Kiếp cũng nhược mà Tài-Quan-Sát lại nhiều.'
};

function renderChinhCach(data, strength){
  const box = document.getElementById('cachcuc-content');
  if(!box) return;
  const c = xacDinhChinhCach(data);
  let html = `<h4>Cách Cục: ${c.name}</h4>`;
  html += `<p><span class="tag tag-neutral">${c.method}</span> ${c.note}</p>`;
  html += `<p>${CACH_CUC_NOTE[c.name] || ''}</p>`;
  html += `<p style="opacity:0.85;">Thân hiện đang <b>${strength.verdict==='vuong'?'Vượng':'Nhược'}</b> (theo mục 2.3) — đối chiếu nguyên tắc trên với các Thần Thập đang hiện diện/mạnh yếu trong lá số ở các mục Dụng Thần và Dự Đoán Theo Từng Mục bên dưới để luận tốt/xấu cụ thể.</p>`;
  html += `<div class="disclaimer">Áp dụng theo tài liệu §9.1. Đây chỉ là bước <b>đặt tên cách cục</b> (định danh) — chưa tự động phán tốt/xấu (đòi hỏi xét tổng hợp nhiều yếu tố như Quan Sát hỗn tạp, hình xung, mức độ vượng nhược của các thần liên quan... mang tính định tính cao, dễ sai nếu quy thành công thức cứng). Phần Cách Cục Đặc Biệt (§9.2 — Tòng cách/Hóa khí cách/Độc vượng) chưa được cài đặt, để dành cho giai đoạn nâng cấp sau; theo tài liệu, cách cục đặc biệt cần được ưu tiên xét trước Chính cách khi đủ điều kiện đặc thù (nhật chủ cực vượng/cực nhược một hành) — nếu lá số của bạn thuộc dạng đó, kết quả Chính Cách ở trên có thể chưa phản ánh đúng bản chất.</div>`;
  box.innerHTML = html;
}
