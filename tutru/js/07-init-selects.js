/* ============================================================
   7. POPULATE SELECTS
   ============================================================ */
function fillOptions(id, count, start=1, pad2=false){
  const el = document.getElementById(id);
  el.innerHTML = "";
  for(let i=start;i<count+start;i++){
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = pad2 ? String(i).padStart(2,'0') : i;
    el.appendChild(opt);
  }
}

function daysInMonth(mm, yy){
  const dm = [31,28,31,30,31,30,31,31,30,31,30,31];
  if(mm===2 && ((yy%4===0 && yy%100!==0) || yy%400===0)) return 29;
  return dm[mm-1];
}

function initSelects(){
  // Tab A
  fillOptions('a-month', 12);
  fillOptions('a-day', 31);
  fillOptions('a-hour', 24, 0, true);
  fillOptions('a-minute', 60, 0, true);
  function refreshSolarDays(){
    const mm = parseInt(document.getElementById('a-month').value);
    const yy = clampYear(parseInt(document.getElementById('a-year').value)) || 2000;
    const prevDay = parseInt(document.getElementById('a-day').value) || 1;
    const n = daysInMonth(mm,yy);
    fillOptions('a-day', n);
    document.getElementById('a-day').value = Math.min(prevDay, n);
  }
  document.getElementById('a-month').addEventListener('change', refreshSolarDays);
  document.getElementById('a-year').addEventListener('change', refreshSolarDays);
  document.getElementById('a-hour').addEventListener('change', ()=>checkTyWarning('a-hour','warn-a'));

  // Tab B
  fillOptions('b-month', 12);
  fillOptions('b-day', 30);
  fillOptions('b-hour', 24, 0, true);
  fillOptions('b-minute', 60, 0, true);
  document.getElementById('b-hour').addEventListener('change', ()=>checkTyWarning('b-hour','warn-b'));
  function refreshLunarDays(){
    const lm = parseInt(document.getElementById('b-month').value);
    const ly = clampYear(parseInt(document.getElementById('b-year').value)) || 2000;
    const leap = parseInt(document.getElementById('b-leap').value);
    const prevDay = parseInt(document.getElementById('b-day').value) || 1;
    const n = daysInLunarMonth(lm, ly, leap, TZ);
    fillOptions('b-day', n);
    document.getElementById('b-day').value = Math.min(prevDay, n);
  }
  document.getElementById('b-month').addEventListener('change', refreshLunarDays);
  document.getElementById('b-year').addEventListener('change', refreshLunarDays);
  document.getElementById('b-leap').addEventListener('change', refreshLunarDays);

  // Tab C — mỗi trụ 1 dropdown gồm đúng 60 tổ hợp Can Chi hợp lệ (lục thập hoa giáp)
  ['c-year','c-month','c-day','c-hour'].forEach(id=>{
    const el = document.getElementById(id);
    for(let i=0;i<60;i++){
      const o = document.createElement('option');
      o.value = i;
      o.textContent = CAN[i%10] + ' ' + CHI[i%12];
      el.appendChild(o);
    }
  });
  function refreshCTyWarning(){
    const hz = parseInt(document.getElementById('c-hour').value)%12;
    document.getElementById('warn-c').classList.toggle('show', hz===0);
  }
  document.getElementById('c-hour').addEventListener('change', refreshCTyWarning);
  refreshCTyWarning();

  // defaults
  document.getElementById('a-year').value = 1987;
  document.getElementById('a-month').value = 4;
  fillOptions('a-day', daysInMonth(4, 1987));
  document.getElementById('a-day').value = 29;
  document.getElementById('a-hour').value = 23;
  document.getElementById('a-minute').value = 30;
  checkTyWarning('a-hour','warn-a');
  document.getElementById('b-hour').value = 12;
}
initSelects();
(function initPredictDate(){
  const el = document.getElementById('p-predict-date');
  const now = new Date();
  const iso = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
  el.value = iso;
})();

function initFadeHints(){
  const els = document.querySelectorAll('.fade-hint');
  if(!('IntersectionObserver' in window)){ els.forEach(el=>el.classList.add('in-view')); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in-view'); }
    });
  }, {threshold:0.35});
  els.forEach(el=>io.observe(el));
}
initFadeHints();

