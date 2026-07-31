/* ============================================================
   4. RENDER
   ============================================================ */
function tietKhiLineHTML(m, caption){
  const t = m.timeline;
  return `${caption ? `<div class="tk2-caption">${caption}</div>` : ""}
    <div class="tk2-names">
      <span class="tk2-side l">← ${m.prevTiet.name}</span>
      <span class="tk2-main">${m.tiet}</span>
      <span class="tk2-side r">${m.nextTiet.name} →</span>
    </div>
    <div class="tk2-track">
      <div class="tk2-seg-main" style="left:${t.curStartPct}%;width:${t.curEndPct-t.curStartPct}%"></div>
      <span class="tk2-tick" style="left:${t.curStartPct}%"></span>
      <span class="tk2-tick" style="left:${t.curEndPct}%"></span>
      <span class="tk2-dot" style="left:${t.birthPct}%" title="Vị trí sinh"></span>
    </div>
    <div class="tk2-dates">
      <span style="left:${t.curStartPct}%">${pad(m.termStart.dd)}/${pad(m.termStart.mm)}</span>
      <span style="left:${t.curEndPct}%">${pad(m.termEnd.dd)}/${pad(m.termEnd.mm)}</span>
    </div>`;
}

function tietKhiLineDetailedHTML(m){
  const d = m.detail;
  return `<div class="tk3-names">
      <span class="tk3-name n-start">${m.tiet}</span>
      <span class="tk3-name n-khi" style="left:${d.khiPct}%">${d.khiName}</span>
      <span class="tk3-name n-end">${m.nextTiet.name}</span>
    </div>
    <div class="tk3-track">
      <span class="tk3-tick tk3-tick-major" style="left:0%"></span>
      <span class="tk3-tick tk3-tick-minor" style="left:25%"></span>
      <span class="tk3-tick tk3-tick-khi" style="left:${d.khiPct}%"></span>
      <span class="tk3-tick tk3-tick-minor" style="left:75%"></span>
      <span class="tk3-tick tk3-tick-major" style="left:100%"></span>
      <span class="tk2-dot" style="left:${d.birthPct}%" title="Vị trí sinh"></span>
    </div>
    <div class="tk3-dates">
      <span>${pad(m.termStart.dd)}/${pad(m.termStart.mm)}</span>
      <span style="left:25%">${pad(d.q1Date.dd)}/${pad(d.q1Date.mm)}</span>
      <span style="left:${d.khiPct}%">${pad(d.khiDate.dd)}/${pad(d.khiDate.mm)}</span>
      <span style="left:75%">${pad(d.q3Date.dd)}/${pad(d.q3Date.mm)}</span>
      <span style="left:100%">${pad(m.termEnd.dd)}/${pad(m.termEnd.mm)}</span>
    </div>
    <div class="tk3-context">← ${m.prevTiet.name} trước · sau là ${m.nextTiet.name} →</div>`;
}

function pillarBlock(canIdx, chiIdx, dmIdx, label){
  const canGod = (canIdx===dmIdx) ? "Nhật Chủ" : tenGod(dmIdx, canIdx);
  let tcHtml = "";
  TANG_CAN[chiIdx].forEach((tc, i)=>{
    const god = (tc===dmIdx && label==="Ngày") ? "Bản thân" : tenGod(dmIdx, tc);
    tcHtml += `<div class="tangcan-chip">
        <div class="tc-can">${CAN[tc]}</div>
        <div class="tc-role">${TANG_ROLE[i]||""}</div>
        <div class="tc-god">${god}</div>
      </div>`;
  });
  return `
    <div class="tengod-main">${label==="Ngày" ? "Nhật Chủ (Bản Mệnh)" : canGod}</div>
    <div class="canchi-name">${CAN[canIdx]} <span class="chi">${CHI[chiIdx]}</span></div>
    <div class="tangcan-title">Tàng Can — Tam Nguyên</div>
    <div class="tangcan-row">${tcHtml}</div>
  `;
}

let lastBaziData = null;
function renderResult(data){
  lastBaziData = data;
  const dm = data.day.can; // Nhật chủ = Can ngày
  const manual = !data.solar.yy; // Tab C: nhập trực tiếp, không có ngày giờ thật

  document.getElementById('bday-strip').innerHTML = manual
    ? `Nhập trực tiếp Tứ Trụ — không quy đổi lịch`
    : `Dương lịch: ${pad(data.solar.dd)}/${pad(data.solar.mm)}/${data.solar.yy}`+
      ` &nbsp;${pad(data.solar.hh)}:${pad(data.solar.mn)}`+
      ` &nbsp;·&nbsp; Âm lịch: ${data.lunar.d}/${data.lunar.m}${data.lunar.leap? " (nhuận)":""}/${data.lunar.y}`+
      ` &nbsp;·&nbsp; Năm Tứ Trụ (sau Lập Xuân): <b style="color:var(--brass)">${data.baziYear}</b>`;

  // ----- YEAR -----
  document.getElementById('p-year-top').innerHTML =
    `<div class="big-num">${manual? "—" : data.baziYear}</div>
     <div class="napam">${napAmOf(data.year.can, data.year.chi)}</div>`;
  document.getElementById('p-year-mid').innerHTML = pillarBlock(data.year.can, data.year.chi, dm, "Năm");
  document.getElementById('p-year-bottom').innerHTML = `Thái Tuế — gốc rễ tổ tiên, thời niên thiếu (1–16 tuổi)`;

  // ----- MONTH -----
  document.getElementById('p-month-top').innerHTML = manual
    ? `<div class="big-num">—</div><div class="tietkhi-name-top">—</div><div class="napam">${napAmOf(data.month.can, data.month.chi)}</div>`
    : `<div class="big-num">${pad(data.solar.mm)} DL · ${data.lunar.m}${data.lunar.leap? "N":""} ÂL</div>
     <div class="tietkhi-name-top">${data.month.tiet}</div>
     <div class="napam">${napAmOf(data.month.can, data.month.chi)}</div>`;
  document.getElementById('p-month-mid').innerHTML = pillarBlock(data.month.can, data.month.chi, dm, "Tháng");
  document.getElementById('p-month-bottom').innerHTML = manual
    ? `<div class="tk2-caption" style="margin-bottom:0;">Không áp dụng (nhập trực tiếp, không quy đổi lịch)</div>`
    : tietKhiLineDetailedHTML(data.month);

  // ----- DAY -----
  const tyFlag = data.isTyHourLate ? `<div class="tyzi-flag">GIỜ TÝ</div>` : "";
  document.getElementById('p-day-top').innerHTML = manual
    ? `<div class="big-num">—</div><div class="napam">${napAmOf(data.day.can, data.day.chi)}</div>`
    : `<div class="big-num">${pad(data.solar.dd)} DL · ${data.lunar.d} ÂL</div>
     <div class="napam">${napAmOf(data.day.can, data.day.chi)}</div>`;
  document.getElementById('p-day-mid').innerHTML = pillarBlock(data.day.can, data.day.chi, dm, "Ngày") + tyFlag;
  document.getElementById('p-day-bottom').innerHTML = manual
    ? `<div class="tk2-caption" style="margin-bottom:0;">Không áp dụng (nhập trực tiếp)</div>`
    : tietKhiLineHTML(data.month, "Vị trí ngày sinh trong tiết khí");

  // ----- HOUR -----
  document.getElementById('p-hour-top').innerHTML =
    `<div class="big-num">${manual? "—" : pad(data.solar.hh)+":"+pad(data.solar.mn)}</div>
     <div class="napam">${napAmOf(data.hour.can, data.hour.chi)}</div>`;
  document.getElementById('p-hour-mid').innerHTML = pillarBlock(data.hour.can, data.hour.chi, dm, "Giờ");
  document.getElementById('p-hour-bottom').innerHTML = `Thời trụ — cung Con cái, hậu vận (48 tuổi trở đi)`;

  document.getElementById('results').style.display = 'block';
  document.getElementById('next-note').classList.remove('show');
  document.getElementById('results').scrollIntoView({behavior:'smooth'});

  renderPhase2(data, manual);
}

function pad(n){ return String(n).padStart(2,'0'); }

