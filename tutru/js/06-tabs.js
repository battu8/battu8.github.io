/* ============================================================
   6. TAB SWITCHING & GIỜ TÝ WARNING
   ============================================================ */
function switchTab(tab){
  ['a','b','c'].forEach(t=>{
    document.getElementById('panel-'+t).style.display = (t===tab)?'block':'none';
    document.querySelector(`[data-tab="${t}"]`).classList.toggle('active', t===tab);
  });
}

function checkTyWarning(hourSelectId, warnBoxId){
  const h = parseInt(document.getElementById(hourSelectId).value);
  const show = (h===23 || h===0);
  document.getElementById(warnBoxId).classList.toggle('show', show);
}

