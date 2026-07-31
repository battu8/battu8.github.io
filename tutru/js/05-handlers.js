/* ============================================================
   5. HANDLERS THEO TAB
   ============================================================ */
function calcFromSolar(){
  const yy = clampYear(parseInt(document.getElementById('a-year').value));
  const mm = parseInt(document.getElementById('a-month').value);
  const dd = parseInt(document.getElementById('a-day').value);
  const hh = parseInt(document.getElementById('a-hour').value);
  const mn = parseInt(document.getElementById('a-minute').value);
  const tyRule = document.querySelector('input[name="tyzi-a"]:checked').value;
  const data = buildPillarsFromSolar(dd,mm,yy,hh,mn,tyRule);
  renderResult(data);
}

function calcFromLunar(){
  const ly = clampYear(parseInt(document.getElementById('b-year').value));
  const lm = parseInt(document.getElementById('b-month').value);
  const ld = parseInt(document.getElementById('b-day').value);
  const leap = parseInt(document.getElementById('b-leap').value);
  const hh = parseInt(document.getElementById('b-hour').value);
  const mn = parseInt(document.getElementById('b-minute').value);
  const tyRule = document.querySelector('input[name="tyzi-b"]:checked').value;

  const solar = convertLunar2Solar(ld, lm, ly, leap, TZ);
  if(!solar){ alert("Ngày âm lịch không hợp lệ (có thể tháng nhuận không tồn tại trong năm này). Vui lòng kiểm tra lại."); return; }
  const [dd,mm,yy] = solar;
  const data = buildPillarsFromSolar(dd,mm,yy,hh,mn,tyRule);
  renderResult(data);
}

function calcFromDirect(){
  const yIdx = parseInt(document.getElementById('c-year').value);
  const mIdx = parseInt(document.getElementById('c-month').value);
  const dIdx = parseInt(document.getElementById('c-day').value);
  const hIdx = parseInt(document.getElementById('c-hour').value);
  const yc = yIdx%10, yz = yIdx%12;
  const mc = mIdx%10, mz = mIdx%12;
  const dc = dIdx%10, dz = dIdx%12;
  const hc = hIdx%10, hz = hIdx%12;

  const data = {
    year:{can:yc, chi:yz},
    month:{can:mc, chi:mz, tiet:"—"},
    day:{can:dc, chi:dz},
    hour:{can:hc, chi:hz},
    solar:{dd:0,mm:0,yy:0,hh:0,mn:0},
    lunar:{d:"—",m:"—",y:"—",leap:0},
    baziYear:"—",
    isTyHourLate:(hz===0)
  };
  renderResult(data);
}

function clampYear(y){
  if(isNaN(y)) return 1990;
  return Math.min(2050, Math.max(1900, y));
}

function showLoading(calcFn){
  const ov = document.getElementById('loading-overlay');
  ov.classList.add('show');
  setTimeout(()=>{
    ov.classList.remove('show');
    calcFn();
  }, 1200);
}

function copyResult(){
  const d = lastBaziData;
  if(!d) return;
  const txt =
`TỨ TRỤ (BÁT TỰ)
Dương lịch: ${pad(d.solar.dd)}/${pad(d.solar.mm)}/${d.solar.yy} ${pad(d.solar.hh)}:${pad(d.solar.mn)}
Âm lịch: ${d.lunar.d}/${d.lunar.m}${d.lunar.leap? " (nhuận)":""}/${d.lunar.y}
Năm Tứ Trụ (sau Lập Xuân): ${d.baziYear}

Trụ Năm : ${CAN[d.year.can]} ${CHI[d.year.chi]}
Trụ Tháng: ${CAN[d.month.can]} ${CHI[d.month.chi]}
Trụ Ngày : ${CAN[d.day.can]} ${CHI[d.day.chi]} (Nhật Chủ)
Trụ Giờ : ${CAN[d.hour.can]} ${CHI[d.hour.chi]}${d.isTyHourLate ? "  [Giờ Tý — phái Vãn Tý]" : ""}`;
  navigator.clipboard.writeText(txt).then(()=>{
    const btn = document.getElementById('copy-result-btn');
    if(btn){
      const old = btn.innerHTML;
      btn.innerHTML = 'Đã sao chép ✓';
      setTimeout(()=>{ btn.innerHTML = old; }, 1800);
    }
  }).catch(()=>{ alert('Không thể sao chép — trình duyệt chặn quyền clipboard.'); });
}

function confirmYes(){
  document.getElementById('next-note').classList.add('show');
}
function confirmNo(){
  document.querySelector('.tab-main').scrollIntoView({behavior:'smooth', block:'center'});
}

