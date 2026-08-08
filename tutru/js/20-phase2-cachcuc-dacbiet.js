/* ============================================================
   §9.2 — CÁCH CỤC ĐẶC BIỆT (Ngoại Cách / Tòng Cách / Hóa Khí Cách)
   Nhận diện KHẢ NĂNG và tính luôn Dụng Thần thay thế NẾU đúng cách
   này — nhưng KHÔNG tự động ghi đè Dụng Thần chính đang dùng ở các
   mục khác, vì điều kiện "thuần" (không hành đối kháng phá cách)
   rất khó xác định tự động 100% chắc chắn, cần người có chuyên môn
   thẩm định thêm trước khi áp dụng.
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
  const dayCan = data.day.can, monthChi = data.month.chi, dm = strength.dmElem;
  const g = strength.groups;
  const total = strength.pheMinh + strength.pheKhac;
  const candidates = [];

  // Nhóm Độc Vượng — cực vượng 1 hành cụ thể theo đúng ngày/tháng sinh, không tòng ai
  if(strength.ratio >= 0.75){
    DOC_VUONG_RULES.forEach(r=>{
      if(!r.dm.includes(dayCan)) return;
      if(!r.monthChi.includes(monthChi)) return;
      const coPhaCan = cans4.some(c=>r.phaCan.includes(c));
      const coPhaChi = chis4.some(c=>r.phaChi.includes(c));
      if(!coPhaCan && !coPhaChi){
        candidates.push({name:r.name, nhom:'Độc Vượng', text:`Nhật Chủ ${CAN[dayCan]} sinh tháng ${CHI[monthChi]}, tỷ lệ Phe Mình rất cao (${(strength.ratio*100).toFixed(0)}%), và không thấy Can/Chi nào phá cách rõ trong 4 trụ gốc.`,
          altDungThan:{dung:dm, hy:elemResource(dm), ky:[elemWealth(dm), elemOutput(dm), elemAuthority(dm)]}});
      }
    });
  }

  // Nhóm Tòng Vượng/Tòng Cường — cực vượng nói chung (không cần đúng combo Độc Vượng),
  // và phe khắc gần như bằng 0 — ngưỡng tinh vi hơn ratio đơn thuần.
  if(total>0 && strength.ratio > 0.85 && strength.pheKhac < total*0.08){
    const thienVe = g.an >= g.tyKiep ? 'Ấn tinh' : 'Tỷ/Kiếp';
    candidates.push({name:'Tòng Cường/Tòng Vượng Cách', nhom:'Tòng', text:`Nhật Chủ cùng ${thienVe} đều cực vượng (Phe Mình ${(strength.ratio*100).toFixed(0)}%), hầu như không có Tài/Quan/Thực Thương nào khắc chế hay tiết giảm — cục diện quá mạnh nên thuận theo thế cường thay vì tìm cách chế ngự (chế ngự lúc này phản tác dụng, dễ "ngọc nát").`,
      altDungThan:{dung:dm, hy:elemResource(dm), ky:[elemWealth(dm), elemOutput(dm), elemAuthority(dm)]}});
  }

  // Nhóm Tòng (Tài/Sát/Nhi) — cực nhược, phe mình gần như bằng 0, phải theo thế lực áp đảo
  if(total>0 && strength.ratio < 0.15 && strength.pheMinh < total*0.08){
    const max3 = [['Tài', g.tai], ['Quan Sát', g.quanSat], ['Thực Thương', g.thucThuong]].sort((a,b)=>b[1]-a[1])[0];
    if(max3[1] >= 3){
      if(max3[0]==='Tài') candidates.push({name:'Tòng Tài Cách', nhom:'Tòng', text:`Nhật Chủ quá nhược, hầu như không có Ấn/Tỷ nương tựa (Phe Mình chỉ ${(strength.ratio*100).toFixed(0)}%), trong khi Tài tinh áp đảo tuyệt đối — đành bỏ Thân theo Tài thay vì cố sinh trợ Thân.`,
        altDungThan:{dung:elemWealth(dm), hy:elemOutput(dm), ky:[dm, elemResource(dm)]}});
      else if(max3[0]==='Quan Sát') candidates.push({name:'Tòng Sát Cách (Tòng Quan)', nhom:'Tòng', text:`Nhật Chủ quá nhược, hầu như không có Ấn/Tỷ nương tựa (Phe Mình chỉ ${(strength.ratio*100).toFixed(0)}%), trong khi Quan/Sát áp đảo tuyệt đối — đành thuận theo Quan Sát thay vì chống lại.`,
        altDungThan:{dung:elemAuthority(dm), hy:elemWealth(dm), ky:[dm, elemResource(dm)]}});
      else candidates.push({name:'Tòng Nhi Cách (Tòng Thực Thương)', nhom:'Tòng', text:`Nhật Chủ quá nhược nhưng Thực/Thương lại áp đảo tuyệt đối (Phe Mình chỉ ${(strength.ratio*100).toFixed(0)}%) — như mẹ yếu phải nương nhờ chính con mình.`,
        altDungThan:{dung:elemOutput(dm), hy:elemWealth(dm), ky:[dm, elemResource(dm), elemAuthority(dm)]}});
    }
  }

  // Nhóm Hóa Khí — Can Ngày ngũ hợp Can Tháng/Giờ liền kề, hóa thần trùng khí lệnh tháng
  const monthCan = data.month.can, hourCan = data.hour.can;
  const biTranhHop = monthCan === hourCan && CAN_NGU_HOP.some(h=>(dayCan===h.a&&monthCan===h.b)||(dayCan===h.b&&monthCan===h.a));
  [['tháng', data.month.can], ['giờ', data.hour.can]].forEach(([viTri, canKhac])=>{
    CAN_NGU_HOP.forEach(h=>{
      if((dayCan===h.a && canKhac===h.b) || (dayCan===h.b && canKhac===h.a)){
        if(h.elem === strength.lenh.lenhElem){
          const tranhHopNote = biTranhHop ? ` <b>Lưu ý:</b> Can Ngày đang bị "Tranh Hợp" — cả Can Tháng lẫn Can Giờ đều cùng là ${CAN[monthCan]}, cùng hợp vào Can Ngày một lúc (kẹp 2 bên). Đây là điểm gây tranh cãi trong cổ thư: có trường phái cho rằng tranh hợp vẫn hóa được nếu không có gì xung phá hóa cục (Chân Hóa), có trường phái cho rằng hợp bị tranh giành thì khó hóa sạch (Giả Hóa). Công cụ này vẫn liệt kê làm khả năng vì địa chi không xung phá, nhưng đây là trường hợp CẦN người có chuyên môn thẩm định thêm hơn hẳn các trường hợp Hóa Khí thông thường khác.` : '';
          const hoaElem = h.elem;
          const totalP = strength.perElem.reduce((a,b)=>a+b,0);
          const hoaRatio = totalP>0 ? strength.perElem[hoaElem]/totalP : 0.2;
          const altDungThan = hoaRatio>=0.30
            ? {dung:elemAuthority(hoaElem), hy:elemWealth(hoaElem), ky:[elemResource(hoaElem), hoaElem], vungHayNon:'khá vượng, nên dùng Quan/Sát của hành hóa để chế bớt, Tài của hành hóa để tiêu hao bớt'}
            : {dung:elemResource(hoaElem), hy:hoaElem, ky:[elemAuthority(hoaElem)], vungHayNon:'còn non yếu, nên dùng Ấn của hành hóa để sinh trợ thêm, tránh bị khắc chế sớm'};
          candidates.push({name:`Hóa ${ELEMENT_NAMES[h.elem]} Cách`, nhom:'Hóa Khí', text:`Can Ngày (${CAN[dayCan]}) ngũ hợp với Can ${viTri} (${CAN[canKhac]}) — ${h.name}, và hành hóa ra (${ELEMENT_NAMES[h.elem]}) trùng đúng khí đang nắm lệnh tháng, hội đủ điều kiện "hóa thần trùng khí lệnh tháng" để hóa thành công. Hành hóa hiện ${altDungThan.vungHayNon}.${tranhHopNote}`, altDungThan});
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
    if(c.altDungThan){
      const kyList = Array.isArray(c.altDungThan.ky) ? c.altDungThan.ky.map(e=>ELEMENT_NAMES[e]).join(', ') : ELEMENT_NAMES[c.altDungThan.ky];
      html += `<p style="font-size:0.92em;opacity:0.9;margin-left:8px;">→ <b>Nếu đúng là cách này</b>, Dụng Thần sẽ đổi thành <b>${ELEMENT_NAMES[c.altDungThan.dung]}</b>, Hỷ Thần <b>${ELEMENT_NAMES[c.altDungThan.hy]}</b>, Kỵ Thần <b>${kyList}</b> — khác với Dụng Thần đang hiển thị ở mục 2.5 (vốn tính theo Chính Cách).</p>`;
    }
  });
  html += `<div class="disclaimer"><b>Quan trọng:</b> đây chỉ là <b>nhận diện khả năng</b> kèm Dụng Thần thay thế để tham khảo — <b>không tự động ghi đè</b> Dụng Thần chính đang dùng ở mục 2.5 và các mục sau, vì điều kiện "thuần" (không hành đối kháng phá cách) rất khó xác định tự động 100% chắc chắn, đặc biệt khi tính cả tương tác với Đại Vận/Lưu Niên. Nếu lá số của bạn rơi vào trường hợp này, nên nhờ người có chuyên môn thẩm định lại xem cách nào đúng, rồi tự đối chiếu Dụng Thần thay thế ở trên với các mục Đại Vận/Lưu Niên phía sau.</div>`;
  box.innerHTML += html;
}
