/* ============================================================
   PHẦN 2.2 — HỢP · XUNG · HÌNH · HẠI CỦA CAN CHI (theo tài liệu §7)
   Chỉ xét quan hệ giữa 4 trụ gốc (Năm/Tháng/Ngày/Giờ).
   Quan hệ với Đại Vận/Lưu Niên sẽ bổ sung sau (§11.4).
   ============================================================ */

// §3.5 — Ngũ hợp Thiên Can (chỉ xác định "có hợp", KHÔNG phán "hóa thật"
// vì điều kiện hóa khá ngặt/khó xác định tự động đáng tin cậy — xem §3.5)
const CAN_NGU_HOP = [
  {a:0,b:5,elem:2,name:"Giáp-Kỷ hợp (Hợp trung chính)"},
  {a:1,b:6,elem:3,name:"Ất-Canh hợp (Hợp nhân nghĩa)"},
  {a:2,b:7,elem:4,name:"Bính-Tân hợp (Hợp uy chế)"},
  {a:3,b:8,elem:0,name:"Đinh-Nhâm hợp (Hợp dâm nặc)"},
  {a:4,b:9,elem:1,name:"Mậu-Quý hợp (Hợp vô tình)"}
];

// §7.1 — Lục hợp Địa Chi (hóa ngũ hành)
const CHI_LUC_HOP = [
  {a:0,b:1,elem:2},  // Tí - Sửu -> Thổ
  {a:2,b:11,elem:0}, // Dần - Hợi -> Mộc
  {a:3,b:10,elem:1}, // Mão - Tuất -> Hỏa
  {a:4,b:9,elem:3},  // Thìn - Dậu -> Kim
  {a:5,b:8,elem:4},  // Tị - Thân -> Thủy
  {a:6,b:7,elem:2}   // Ngọ - Mùi -> Thổ
];

// §7.1 — Tam hợp cục (Trường sinh - Đế vượng - Mộ), "vuong" = chi Đế vượng
const CHI_TAM_HOP = [
  {set:[8,0,4],  elem:4, vuong:0, name:"Thân-Tí-Thìn → Thủy cục"},
  {set:[11,3,7], elem:0, vuong:3, name:"Hợi-Mão-Mùi → Mộc cục"},
  {set:[2,6,10], elem:1, vuong:6, name:"Dần-Ngọ-Tuất → Hỏa cục"},
  {set:[5,9,1],  elem:3, vuong:9, name:"Tị-Dậu-Sửu → Kim cục"}
];

// §7.1 — Tam hội (theo phương, lực mạnh nhất)
const CHI_TAM_HOI = [
  {set:[2,3,4],   elem:0, name:"Dần-Mão-Thìn → Đông phương Mộc"},
  {set:[5,6,7],   elem:1, name:"Tị-Ngọ-Mùi → Nam phương Hỏa"},
  {set:[8,9,10],  elem:3, name:"Thân-Dậu-Tuất → Tây phương Kim"},
  {set:[11,0,1],  elem:4, name:"Hợi-Tí-Sửu → Bắc phương Thủy"}
];

// §7.2 — Lục xung
const CHI_LUC_XUNG = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
// §7.3 — Tương hại
const CHI_TUONG_HAI = [[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
// §7.4 — Tương hình (nhóm 3 chi hình lẫn nhau) + vô lễ hình + tự hình
const CHI_TUONG_HINH_NHOM = [
  {set:[2,5,8],  text:"hình do cậy quyền thế / vong ơn bội nghĩa"}, // Dần-Tị-Thân
  {set:[1,7,10], text:"hình do cậy đặc quyền đặc thế"}              // Sửu-Mùi-Tuất
];
const CHI_TUONG_HINH_VO_LE = [0,3]; // Tí - Mão: hình do vô lễ
const CHI_TU_HINH = [4,6,9,11];     // Thìn, Ngọ, Dậu, Hợi tự hình

function computeChiRelations(data){
  const chis = [data.year.chi, data.month.chi, data.day.chi, data.hour.chi];
  const cans = [data.year.can, data.month.can, data.day.can, data.hour.can];
  const labels = ['Năm','Tháng','Ngày','Giờ'];
  const r = {canHop:[], tamHoi:[], tamHop:[], banHop:[], hop:[], xung:[], hai:[], hinh:[]};

  // Thiên Can Ngũ Hợp
  for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
    CAN_NGU_HOP.forEach(h=>{
      if((cans[i]===h.a&&cans[j]===h.b)||(cans[i]===h.b&&cans[j]===h.a)){
        r.canHop.push({pos:`${labels[i]}-${labels[j]}`, name:h.name, elem:h.elem});
      }
    });
  }

  // §7.5: chi đã "tham gia" hội/hợp cục (Tam Hội, Tam Hợp cục, Lục Hợp) thì
  // không tính bị xung/hình nữa ("tham hợp quên xung/hình") — đánh dấu ở đây.
  const protectedPos = new Set();

  // Tam hội — kiểm tra trước vì lực mạnh nhất
  CHI_TAM_HOI.forEach(h=>{
    const positions = [];
    h.set.forEach(c=>{ chis.forEach((cc,idx)=>{ if(cc===c) positions.push(idx); }); });
    const found = new Set(positions.map(p=>chis[p]));
    if(h.set.every(c=>found.has(c))){
      r.tamHoi.push({name:h.name, elem:h.elem, positions:positions.map(p=>labels[p])});
      positions.forEach(p=>protectedPos.add(p));
    }
  });

  // Tam hợp cục (đủ cả 3) và Bán hợp (chỉ 2/3)
  CHI_TAM_HOP.forEach(h=>{
    const positions = [];
    h.set.forEach(c=>{ chis.forEach((cc,idx)=>{ if(cc===c) positions.push(idx); }); });
    const found = new Set(positions.map(p=>chis[p]));
    if(h.set.every(c=>found.has(c))){
      r.tamHop.push({name:h.name, elem:h.elem, positions:positions.map(p=>labels[p])});
      positions.forEach(p=>protectedPos.add(p));
    } else if(found.size===2){
      r.banHop.push({name:h.name.replace(' cục',''), elem:h.elem, vuong:found.has(h.vuong), positions:positions.map(p=>labels[p])});
    }
  });

  // Lục hợp
  CHI_LUC_HOP.forEach(h=>{
    const posA=[],posB=[];
    chis.forEach((cc,idx)=>{ if(cc===h.a) posA.push(idx); if(cc===h.b) posB.push(idx); });
    posA.forEach(pa=>posB.forEach(pb=>{
      r.hop.push({elem:h.elem, positions:[labels[pa],labels[pb]]});
      protectedPos.add(pa); protectedPos.add(pb);
    }));
  });

  // Lục xung
  CHI_LUC_XUNG.forEach(([a,b])=>{
    const posA=[],posB=[];
    chis.forEach((cc,idx)=>{ if(cc===a) posA.push(idx); if(cc===b) posB.push(idx); });
    posA.forEach(pa=>posB.forEach(pb=>{
      r.xung.push({positions:[labels[pa],labels[pb]], lienTru:Math.abs(pa-pb)===1, hoaGiai:protectedPos.has(pa)||protectedPos.has(pb)});
    }));
  });

  // Tương hại
  CHI_TUONG_HAI.forEach(([a,b])=>{
    const posA=[],posB=[];
    chis.forEach((cc,idx)=>{ if(cc===a) posA.push(idx); if(cc===b) posB.push(idx); });
    posA.forEach(pa=>posB.forEach(pb=>{
      r.hai.push({positions:[labels[pa],labels[pb]], hoaGiai:protectedPos.has(pa)||protectedPos.has(pb)});
    }));
  });

  // Tương hình (3 nhóm) + vô lễ
  [...CHI_TUONG_HINH_NHOM, {set:CHI_TUONG_HINH_VO_LE, text:"hình do vô lễ"}].forEach(g=>{
    for(let i=0;i<g.set.length;i++) for(let j=i+1;j<g.set.length;j++){
      const a=g.set[i], b=g.set[j];
      const posA=[],posB=[];
      chis.forEach((cc,idx)=>{ if(cc===a) posA.push(idx); if(cc===b) posB.push(idx); });
      posA.forEach(pa=>posB.forEach(pb=>{
        r.hinh.push({positions:[labels[pa],labels[pb]], text:g.text, hoaGiai:protectedPos.has(pa)||protectedPos.has(pb), tuHinh:false});
      }));
    }
  });
  // Tự hình
  CHI_TU_HINH.forEach(c=>{
    const pos=[]; chis.forEach((cc,idx)=>{ if(cc===c) pos.push(idx); });
    if(pos.length>=2){
      r.hinh.push({positions:pos.map(p=>labels[p]), text:"tự hình — khí quá vượng, thái quá sinh họa", hoaGiai:false, tuHinh:true});
    }
  });

  return r;
}

function judgeForDungThan(elem, dungThan){
  if(elem===dungThan.dungThan || elem===dungThan.hyThan) return {type:'good', text:'có lợi cho Dụng/Hỷ Thần → thiên về hỉ'};
  if(elem===dungThan.kyThan) return {type:'bad', text:'trùng Kỵ Thần → thiên về kỵ, cần thận trọng'};
  return {type:'neutral', text:'không trùng rõ rệt với Dụng/Hỷ/Kỵ Thần'};
}

function renderHopXungHinhHai(data, dungThan){
  const box = document.getElementById('hopxung-content');
  if(!box) return;
  const r = computeChiRelations(data);
  let html = '';
  let hasHopAny = r.canHop.length || r.tamHoi.length || r.tamHop.length || r.banHop.length || r.hop.length;

  html += `<h4>Hợp (Thiên Can &amp; Địa Chi)</h4>`;
  if(!hasHopAny){
    html += `<p>Không có tổ hợp Hợp nổi bật giữa 4 trụ.</p>`;
  } else {
    r.canHop.forEach(h=>{
      html += `<p><span class="tag tag-neutral">${h.pos}</span> Thiên Can ${h.name} — hóa <b>${ELEMENT_NAMES[h.elem]}</b> nếu đủ điều kiện "hóa thật" (xem ghi chú bên dưới).</p>`;
    });
    r.tamHoi.forEach(h=>{
      const j = judgeForDungThan(h.elem, dungThan);
      html += `<p><span class="tag tag-${j.type}">${h.positions.join(' · ')}</span> <b>Tam Hội</b> ${h.name} (lực mạnh nhất) — ${j.text}.</p>`;
    });
    r.tamHop.forEach(h=>{
      const j = judgeForDungThan(h.elem, dungThan);
      html += `<p><span class="tag tag-${j.type}">${h.positions.join(' · ')}</span> <b>Tam Hợp Cục</b> ${h.name} — ${j.text}.</p>`;
    });
    r.banHop.forEach(h=>{
      html += `<p><span class="tag tag-neutral">${h.positions.join(' · ')}</span> Bán hợp hướng ${h.name} (${h.vuong?'có chi Đế Vượng — bán hợp vượng, lực khá':'bán hợp không vượng, lực yếu hơn'}) — hành <b>${ELEMENT_NAMES[h.elem]}</b>.</p>`;
    });
    r.hop.forEach(h=>{
      const j = judgeForDungThan(h.elem, dungThan);
      html += `<p><span class="tag tag-${j.type}">${h.positions.join(' · ')}</span> Lục hợp hóa <b>${ELEMENT_NAMES[h.elem]}</b> — ${j.text}.</p>`;
    });
  }

  html += `<h4>Lục Xung</h4>`;
  if(r.xung.length){
    r.xung.forEach(x=>{
      const tag = x.hoaGiai ? 'tag-neutral' : 'tag-bad';
      const note = x.hoaGiai ? ' — đã tham gia hội/hợp khác nên được coi là giảm nhẹ ("tham hợp quên xung")' : (x.lienTru ? ' — xung liền trụ, lực mạnh hơn' : ' — xung cách trụ, lực nhẹ hơn');
      html += `<p><span class="tag ${tag}">${x.positions.join(' · ')}</span> Xung${note}.</p>`;
    });
  } else {
    html += `<p>Không có Lục Xung giữa 4 trụ.</p>`;
  }

  html += `<h4>Tương Hại</h4>`;
  if(r.hai.length){
    r.hai.forEach(x=>{
      const tag = x.hoaGiai ? 'tag-neutral' : 'tag-bad';
      const note = x.hoaGiai ? ' — được giảm nhẹ do tham gia hội/hợp khác' : ' — chủ về cô độc, tổn hại người thân, hao tài nếu không có sao giải';
      html += `<p><span class="tag ${tag}">${x.positions.join(' · ')}</span> Tương hại${note}.</p>`;
    });
  } else {
    html += `<p>Không có Tương Hại giữa 4 trụ.</p>`;
  }

  html += `<h4>Tương Hình</h4>`;
  if(r.hinh.length){
    r.hinh.forEach(x=>{
      const tag = x.hoaGiai ? 'tag-neutral' : 'tag-bad';
      const note = x.hoaGiai ? ' — được giảm nhẹ do tham gia hội/hợp khác' : ` — ${x.text}`;
      html += `<p><span class="tag ${tag}">${x.positions.join(' · ')}</span> Tương hình${note}.</p>`;
    });
  } else {
    html += `<p>Không có Tương Hình giữa 4 trụ.</p>`;
  }

  html += `<div class="disclaimer">Áp dụng theo tài liệu (§7). Hai giản lược có chủ đích: (1) Thiên Can Ngũ Hợp chỉ được xác định là "có hợp" — không tự phán "hóa thật" vì điều kiện hóa khá ngặt, khó xác định tự động đáng tin cậy (xem §3.5); (2) nguyên tắc "tham hợp quên xung/hình" được áp dụng khi có Lục Hợp/Tam Hợp/Tam Hội — mức độ giảm nhẹ trong thực tế còn tùy lực mạnh yếu cụ thể, nên tham khảo thêm ý kiến người có chuyên môn khi lá số có nhiều tổ hợp đan xen. Phần này hiện chỉ xét quan hệ giữa 4 trụ gốc — quan hệ với Đại Vận/Lưu Niên sẽ được bổ sung ở giai đoạn nâng cấp tiếp theo (§11.4).</div>`;

  box.innerHTML = html;
}
