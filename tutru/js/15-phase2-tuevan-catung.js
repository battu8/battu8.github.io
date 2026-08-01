/* ============================================================
   §11.3–11.6 — ĐÁNH GIÁ CÁT HUNG ĐẠI VẬN & LƯU NIÊN
   Bổ sung lớp đánh giá tốt/xấu cho Đại Vận/Lưu Niên đã tính sẵn ở
   09-phase2-daivan.js — KHÔNG sửa cách tính ngày/tháng khởi vận,
   chỉ thêm cột "Cát hung" và mục Phản ngâm/Phục ngâm.
   Tái dùng CHI_LUC_HOP/CHI_LUC_XUNG/... đã định nghĩa ở file 11.
   ============================================================ */
const PILLAR_LABELS_4 = ['Năm','Tháng','Ngày','Giờ'];

// §11.4 — chấm điểm cát hung của 1 tuế/vận (can,chi) so với mệnh cục + dụng thần
function danhGiaCatHungVan(vanCan, vanChi, data, dungThan){
  const chis4 = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const cans4 = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const vanElem = elementOfCan(vanCan);
  let score = 0;
  const notes = [];

  if(vanElem===dungThan.dungThan || vanElem===dungThan.hyThan){ score+=1.5; notes.push('Can vận thuộc Dụng/Hỷ Thần'); }
  else if(vanElem===dungThan.kyThan){ score-=1.5; notes.push('Can vận thuộc Kỵ Thần'); }

  let bothHitTKDX = false; // Thiên khắc địa xung với cùng 1 trụ
  chis4.forEach((c,i)=>{
    const cElem = ELEMENT_OF_CHI[c];
    const isXung = CHI_LUC_XUNG.some(([a,b])=> (a===vanChi&&b===c)||(b===vanChi&&a===c));
    const canKhac = CONTROLS[ELEMENT_NAMES[vanElem]]===ELEMENT_NAMES[elementOfCan(cans4[i])] || CONTROLS[ELEMENT_NAMES[elementOfCan(cans4[i])]]===ELEMENT_NAMES[vanElem];
    if(isXung){
      if(cElem===dungThan.kyThan){ score+=1.2; notes.push(`Xung mất Kỵ Thần ở trụ ${PILLAR_LABELS_4[i]} → chuyển xấu thành tốt`); }
      else if(cElem===dungThan.dungThan||cElem===dungThan.hyThan){ score-=1.2; notes.push(`Xung mất Dụng/Hỷ Thần ở trụ ${PILLAR_LABELS_4[i]} → chuyển tốt thành xấu`); }
      if(isXung && canKhac){
        score-=1.5; notes.push(`Thiên Khắc Địa Xung với trụ ${PILLAR_LABELS_4[i]}${(i===2)?' (trụ Ngày — cung bản thân/vợ chồng, cần đặc biệt thận trọng)':''}`);
        bothHitTKDX = true;
      }
    }
    CHI_LUC_HOP.forEach(h=>{
      if((h.a===vanChi&&h.b===c)||(h.b===vanChi&&h.a===c)){
        if(h.elem===dungThan.kyThan){ score+=0.8; notes.push(`Hợp cùng trụ ${PILLAR_LABELS_4[i]} hóa Kỵ Thần bị "khóa lại" → giảm xấu`); }
        else if(h.elem===dungThan.dungThan||h.elem===dungThan.hyThan){ score+=0.6; notes.push(`Hợp cùng trụ ${PILLAR_LABELS_4[i]} hóa Dụng/Hỷ Thần → khá tốt`); }
      }
    });
  });

  let level, label;
  if(score>=1.5){ level='good'; label='Tốt'; }
  else if(score<=-1.5){ level='bad'; label='Xấu'; }
  else { level='neutral'; label='Thường'; }
  return {score, level, label, notes, bothHitTKDX};
}

// §11.3 — bảng tổng hợp Đại Vận x Lưu Niên
const BANG_TONG_HOP_DV_LN = {
  'Tốt-Tốt':'Rất tốt', 'Tốt-Xấu':'Tốt nhiều, xấu ít', 'Tốt-Thường':'Tốt vừa',
  'Thường-Tốt':'Tốt ít', 'Thường-Xấu':'Xấu ít', 'Thường-Thường':'Bình thường',
  'Xấu-Tốt':'Tốt ít, xấu nhiều', 'Xấu-Xấu':'Xấu nhiều', 'Xấu-Thường':'Xấu vừa'
};

// §11.6 — Phục ngâm (trùng hệt can chi) / Phản ngâm (xung trực diện trụ Ngày, thiên khắc địa xung)
function kiemTraPhucPhanNgam(vanCan, vanChi, data){
  const dayCan = data.day.can, dayChi = data.day.chi;
  const flags = [];
  if(vanCan===dayCan && vanChi===dayChi){
    flags.push({type:'phuc-ngam-ngay', text:'Trùng hệt Can Chi trụ Ngày (Phục Ngâm với bản mệnh)'});
  }
  const xungDay = CHI_LUC_XUNG.some(([a,b])=>(a===vanChi&&b===dayChi)||(b===vanChi&&a===dayChi));
  const khacDay = CONTROLS[ELEMENT_NAMES[elementOfCan(vanCan)]]===ELEMENT_NAMES[elementOfCan(dayCan)] || CONTROLS[ELEMENT_NAMES[elementOfCan(dayCan)]]===ELEMENT_NAMES[elementOfCan(vanCan)];
  if(xungDay && khacDay){
    flags.push({type:'phan-ngam-ngay', text:'Thiên Khắc Địa Xung trực diện với trụ Ngày (Phản Ngâm)'});
  }
  return flags;
}
function kiemTraPhucNgamGiuaHaiVan(canA,chiA,canB,chiB){
  return canA===canB && chiA===chiB;
}

function catHungTag(level, label){
  return `<span class="tag tag-${level}">${label}</span>`;
}
