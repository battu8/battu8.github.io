/* ============================================================
   §9.2 — CÁCH CỤC ĐẶC BIỆT (Ngoại Cách / Tòng Cách / Hóa Khí Cách)
   Chỉ NHẬN DIỆN KHẢ NĂNG, không tự động thay thế Chính Cách/Dụng
   Thần đã tính ở các mục khác — vì một khi xác nhận đúng là Ngoại
   Cách thì TOÀN BỘ logic vượng/nhược phải đảo ngược, việc này cần
   người có chuyên môn thẩm định thêm, tài liệu cũng nhấn mạnh
   điều kiện "thuần" (không hành đối kháng phá cách) khó xác định
   tự động 100% chắc chắn.
   ============================================================ */
const DOC_VUONG_RULES = [
  {name:'Khúc Trực (Mộc độc vượng)', dm:[0,1], monthChi:[2,3,4], elem:0, phaCan:[6,7], phaChi:[9]},
  {name:'Viêm Thượng (Hỏa độc vượng)', dm:[2,3], monthChi:[5,6,7], elem:1, phaCan:[8,9], phaChi:[11,0]},
  {name:'Giá Sắc (Thổ độc vượng)', dm:[4,5], monthChi:[4,10,1,7], elem:2, phaCan:[0,1], phaChi:[2,3]},
  {name:'Tòng Cách Kim (Kim độc vượng)', dm:[6,7], monthChi:[8,9], elem:3, phaCan:[2,3], phaChi:[5,6]},
  {name:'Nhuận Hạ (Thủy độc vượng)', dm:[8,9], monthChi:[11,0,4,1], elem:4, phaCan:[4,5], phaChi:[]}
];

function xetCachCucDacBiet(data, strength){
  const cans4 = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const chis4 = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const dayCan = data.day.can, monthChi = data.month.chi;
  const candidates = [];

  // Nhóm Độc Vượng — cực vượng 1 hành, không tòng ai
  if(strength.ratio >= 0.75){
    DOC_VUONG_RULES.forEach(r=>{
      if(!r.dm.includes(dayCan)) return;
      if(!r.monthChi.includes(monthChi)) return;
      const coPhaCan = cans4.some(c=>r.phaCan.includes(c));
      const coPhaChi = chis4.some(c=>r.phaChi.includes(c));
      if(!coPhaCan && !coPhaChi){
        candidates.push({name:r.name, nhom:'Độc Vượng', text:`Nhật Chủ ${CAN[dayCan]} sinh tháng ${CHI[monthChi]}, tỷ lệ Phe Mình rất cao (${(strength.ratio*100).toFixed(0)}%), và không thấy Can/Chi nào phá cách rõ trong 4 trụ gốc.`});
      }
    });
  }

  // Nhóm Tòng — cực nhược, không gốc/trợ giúp, phải theo thế lực áp đảo
  if(strength.ratio <= 0.20){
    const g = tallyTenGodGroups(data);
    const khongGoc = g.tyKiep < 1 && g.an < 1;
    if(khongGoc){
      const max3 = [['Tài', g.tai], ['Quan Sát', g.quanSat], ['Thực Thương', g.thucThuong]].sort((a,b)=>b[1]-a[1])[0];
      if(max3[1] >= 4){
        const tenMap = {'Tài':'Tòng Tài', 'Quan Sát':'Tòng Sát', 'Thực Thương':'Tòng Nhi (theo con)'};
        candidates.push({name:tenMap[max3[0]], nhom:'Tòng', text:`Phe Mình rất yếu (${(strength.ratio*100).toFixed(0)}%), gần như không có Tỷ Kiếp/Ấn làm gốc, trong khi nhóm ${max3[0]} áp đảo rõ rệt (điểm ${max3[1].toFixed(1)}).`});
      }
    }
  }

  // Nhóm Hóa Khí — Can Ngày ngũ hợp Can Tháng/Giờ liền kề, hóa thần trùng khí lệnh tháng
  [['tháng', data.month.can], ['giờ', data.hour.can]].forEach(([viTri, canKhac])=>{
    CAN_NGU_HOP.forEach(h=>{
      if((dayCan===h.a && canKhac===h.b) || (dayCan===h.b && canKhac===h.a)){
        if(h.elem === strength.lenh.lenhElem){
          candidates.push({name:`Hóa ${ELEMENT_NAMES[h.elem]} Cách`, nhom:'Hóa Khí', text:`Can Ngày (${CAN[dayCan]}) ngũ hợp với Can ${viTri} (${CAN[canKhac]}) — ${h.name}, và hành hóa ra (${ELEMENT_NAMES[h.elem]}) trùng đúng khí đang nắm lệnh tháng, hội đủ điều kiện "hóa thần trùng khí lệnh tháng" để hóa thành công.`});
        }
      }
    });
  });

  return candidates;
}

function renderCachCucDacBiet(data, strength){
  const box = document.getElementById('cachcuc-content');
  if(!box) return;
  const candidates = xetCachCucDacBiet(data, strength);
  if(candidates.length===0) return;
  let html = `<h4 style="margin-top:16px;">Khả Năng Cách Cục Đặc Biệt (§9.2)</h4>`;
  candidates.forEach(c=>{
    html += `<p><span class="tag tag-bad">${c.name}</span> Nhóm <b>${c.nhom}</b>. ${c.text}</p>`;
  });
  html += `<div class="disclaimer"><b>Quan trọng:</b> đây chỉ là <b>nhận diện khả năng</b>, không phải kết luận chắc chắn. Nếu đúng là Ngoại Cách, toàn bộ Dụng Thần và cách luận vượng/nhược ở các mục khác trong công cụ này (vốn tính theo Chính Cách) <b>không còn áp dụng đúng nữa</b> — điều kiện "thuần" (không hành đối kháng phá cách) rất khó xác định tự động 100% chắc chắn, đặc biệt khi tính cả tương tác với Đại Vận/Lưu Niên. Nếu lá số của bạn rơi vào trường hợp này, nên nhờ người có chuyên môn thẩm định lại trước khi dựa vào các mục Dụng Thần/Đại Vận phía sau.</div>`;
  box.innerHTML += html;
}
