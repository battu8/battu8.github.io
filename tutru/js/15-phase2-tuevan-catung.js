/* ============================================================
   §11.3–11.6 — ĐÁNH GIÁ CÁT HUNG ĐẠI VẬN & LƯU NIÊN
   Bổ sung lớp đánh giá tốt/xấu cho Đại Vận/Lưu Niên đã tính sẵn ở
   09-phase2-daivan.js — KHÔNG sửa cách tính ngày/tháng khởi vận,
   chỉ thêm cột "Cát hung" và mục Phản ngâm/Phục ngâm.
   Tái dùng CHI_LUC_HOP/CHI_LUC_XUNG/... đã định nghĩa ở file 11.
   ============================================================ */
const PILLAR_LABELS_4 = ['Năm','Tháng','Ngày','Giờ'];

/* §6 (tài liệu "Tu_Tru_Tong_Hop") — MO_KHO_INFO đã định nghĩa ở file 11-phase2-hopxunghinhhai.js */
function chiTrigersKhai(vanChi, c){
  if(CHI_LUC_XUNG.some(([a,b])=>(a===vanChi&&b===c)||(b===vanChi&&a===c))) return true;
  if(vanChi===c && CHI_TU_HINH.includes(c)) return true;
  const hinhPairs = [...CHI_TUONG_HINH_NHOM.flatMap(g=>{const p=[];for(let i=0;i<g.set.length;i++)for(let j=i+1;j<g.set.length;j++)p.push([g.set[i],g.set[j]]);return p;}), CHI_TUONG_HINH_VO_LE];
  return hinhPairs.some(([a,b])=>(a===vanChi&&b===c)||(b===vanChi&&a===c));
}

// §11.4 — chấm điểm cát hung của 1 tuế/vận (can,chi) so với mệnh cục + dụng thần
function danhGiaCatHungVan(vanCan, vanChi, data, dungThan, gender, strength){
  const chis4 = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const cans4 = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const posNames = ['year','month','day','hour'];
  const vanElem = elementOfCan(vanCan);
  let score = 0;
  const notes = [];
  const quotes = [];

  if(vanElem===dungThan.dungThan){ score+=1.5; notes.push('Can vận thuộc Dụng Thần'); quotes.push(DAIVAN_QUOTES.dungThanVan); }
  else if(vanElem===dungThan.hyThan){ score+=1.5; notes.push('Can vận thuộc Hỷ Thần'); quotes.push(DAIVAN_QUOTES.hyThanVan); }
  else if(vanElem===dungThan.kyThan){ score-=1.5; notes.push('Can vận thuộc Kỵ Thần'); quotes.push(DAIVAN_QUOTES.kyThanVan); }

  // Câu thơ theo nhóm Thập Thần của vận, đối chiếu với cấu trúc sẵn có của mệnh cục
  if(strength && strength.perElem){
    const dmElem = strength.dmElem;
    const g = tallyTenGodGroups(data, strength);
    const nhomVan = nhomThapThanCuaHanh(dmElem, vanElem);
    if(nhomVan==='Tài' && g.tyKiep>=3.5) quotes.push(DAIVAN_QUOTES.taiVanGapTyKiep);
    else if(nhomVan==='Quan Sát' && g.thucThuong>=3.5) quotes.push(DAIVAN_QUOTES.quanVanGapThuongQuan);
    else if(nhomVan==='Ấn' && g.tai>=3.5) quotes.push(DAIVAN_QUOTES.anVanGapTaiPha);
  }

  let bothHitTKDX = false; // Thiên khắc địa xung với cùng 1 trụ
  chis4.forEach((c,i)=>{
    const cElem = ELEMENT_OF_CHI[c];
    const isXung = CHI_LUC_XUNG.some(([a,b])=> (a===vanChi&&b===c)||(b===vanChi&&a===c));
    const canKhac = CONTROLS[ELEMENT_NAMES[vanElem]]===ELEMENT_NAMES[elementOfCan(cans4[i])] || CONTROLS[ELEMENT_NAMES[elementOfCan(cans4[i])]]===ELEMENT_NAMES[vanElem];
    if(isXung){
      if(cElem===dungThan.kyThan){ score+=1.2; notes.push(`Xung mất Kỵ Thần ở trụ ${PILLAR_LABELS_4[i]} → chuyển xấu thành tốt`); }
      else if(cElem===dungThan.dungThan||cElem===dungThan.hyThan){ score-=1.2; notes.push(`Xung mất Dụng/Hỷ Thần ở trụ ${PILLAR_LABELS_4[i]} → chuyển tốt thành xấu`); }
      if(isXung && canKhac){
        let lucThanNote = '';
        if(gender && typeof lucThanTaiViTri==='function'){
          const roles = lucThanTaiViTri(data, posNames[i], gender);
          if(roles.length) lucThanNote = ` — liên quan đến ${roles.join(', ')} (mở tàng can trụ này)`;
        }
        score-=1.5; notes.push(`Thiên Khắc Địa Xung với trụ ${PILLAR_LABELS_4[i]}${(i===2)?' (trụ Ngày — cung bản thân/vợ chồng, cần đặc biệt thận trọng)':''}${lucThanNote}`);
        if(strength) notes.push(canCoText(strength.verdict, strength.ratio));
        bothHitTKDX = true;
      }
    }
    CHI_LUC_HOP.forEach(h=>{
      if((h.a===vanChi&&h.b===c)||(h.b===vanChi&&h.a===c)){
        if(h.elem===dungThan.kyThan){ score+=0.8; notes.push(`Hợp cùng trụ ${PILLAR_LABELS_4[i]} hóa Kỵ Thần bị "khóa lại" → giảm xấu`); }
        else if(h.elem===dungThan.dungThan||h.elem===dungThan.hyThan){ score+=0.6; notes.push(`Hợp cùng trụ ${PILLAR_LABELS_4[i]} hóa Dụng/Hỷ Thần → khá tốt`); }
      }
    });

    // §6 tài liệu bổ sung: nếu trụ này là 1 trong 4 chi Mộ/Khố (Thìn Tuất Sửu Mùi)
    // và bị vận Khai (xung/hình/tự hình) → xét hành được giải phóng ra là Dụng hay Kỵ.
    const mk = MO_KHO_INFO[c];
    if(mk && chiTrigersKhai(vanChi, c)){
      [mk.mo, mk.kho].forEach(elem=>{
        if(elem===dungThan.dungThan||elem===dungThan.hyThan){ score+=1; notes.push(`Khai Mộ/Khố tại trụ ${PILLAR_LABELS_4[i]} (chi ${CHI[c]}) — giải phóng hành ${ELEMENT_NAMES[elem]} là Dụng/Hỷ Thần → tốt (§6)`); }
        else if(elem===dungThan.kyThan){ score-=1; notes.push(`Khai Mộ/Khố tại trụ ${PILLAR_LABELS_4[i]} (chi ${CHI[c]}) — giải phóng hành ${ELEMENT_NAMES[elem]} là Kỵ Thần → xấu, cần thận trọng (§6)`); }
      });
    }
  });

  let level, label;
  if(score>=1.5){ level='good'; label='Tốt'; }
  else if(score<=-1.5){ level='bad'; label='Xấu'; }
  else { level='neutral'; label='Thường'; }
  return {score, level, label, notes, bothHitTKDX, quotes};
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

// §Phần V.1 (tài liệu Phục Ngâm bổ sung) — "Nhị xung nhất": khi Đại Vận VÀ Lưu Niên
// cùng rơi vào MỘT chi giống nhau, và chi đó xung 1 chi trong mệnh cục gốc, thì lực
// xung được xem là mạnh hơn hẳn so với xung 1-1 bình thường (2 nguồn cùng nhắm 1 điểm).
function kiemTraNhiXungNhat(dvChi, lnChi, data){
  if(dvChi !== lnChi) return null;
  const chis4 = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const labels = ['Năm','Tháng','Ngày','Giờ'];
  for(let i=0;i<4;i++){
    const isXung = CHI_LUC_XUNG.some(([a,b])=>(a===dvChi&&b===chis4[i])||(b===dvChi&&a===chis4[i]));
    if(isXung) return {pos:labels[i], chi:chis4[i]};
  }
  return null;
}

function catHungTag(level, label){
  return `<span class="tag tag-${level}">${label}</span>`;
}
