/* ============================================================
   3. TÍNH TỨ TRỤ TỪ NGÀY GIỜ DƯƠNG LỊCH
   ============================================================ */
function buildPillarsFromSolar(dd, mm, yy, hh, mn, tyziRule){
  // Julian day (integer, ngày dương)
  let dayJDN = jdFromDate(dd, mm, yy);
  const isTyHourLate = (hh === 23); // giờ Tý đầu (23:00-23:59)
  let dayJDNforDayPillar = dayJDN;
  if (isTyHourLate && tyziRule === "next") dayJDNforDayPillar = dayJDN + 1;

  const dayCanIdx = ((dayJDNforDayPillar+9)%10+10)%10;
  const dayChiIdx = ((dayJDNforDayPillar+1)%12+12)%12;

  // JD liên tục có giờ, quy đổi UTC để tính vị trí mặt trời
  const jdBirth = dayJDN - 0.5 + (hh + mn/60)/24 - TZ/24;

  // Năm Tứ Trụ theo Lập Xuân
  const lx = findLapXuanJD(yy);
  const baziYear = (jdBirth >= lx) ? yy : yy - 1;
  const yearCanIdx = ((baziYear+6)%10+10)%10;
  const yearChiIdx = ((baziYear+8)%12+12)%12;

  // Tháng theo tiết khí (kinh độ mặt trời)
  const deg = sunLongitudeDeg(jdBirth);
  const orderFromDan = Math.floor((((deg-315)%360+360)%360)/30);
  const monthChiIdx = (2+orderFromDan)%12;
  const startStemDan = (((yearCanIdx%5)*2+2)%10+10)%10;
  const monthCanIdx = (startStemDan+orderFromDan)%10;
  const tietName = TIET_NAMES[orderFromDan];

  // Mốc thời gian của tiết khí hiện tại (đầu tháng -> tiết kế tiếp)
  const termStartDeg = normDeg(315+orderFromDan*30);
  const termEndDeg = normDeg(termStartDeg+30);
  const termStartJD = findTermCrossingJD(termStartDeg, jdBirth);
  const termEndJD = findTermCrossingJD(termEndDeg, jdBirth+15);
  const termStartDate = jdUTtoLocalDate(termStartJD, TZ);
  const termEndDate = jdUTtoLocalDate(termEndJD, TZ);
  const termPercent = Math.min(100, Math.max(0, (jdBirth-termStartJD)/(termEndJD-termStartJD)*100));

  // Tiết khí liền trước và liền sau (để tham chiếu luận khí)
  const prevOrder = (orderFromDan+11)%12;
  const nextOrder = (orderFromDan+1)%12;
  const prevStartDeg = normDeg(termStartDeg-30);
  const nextEndDeg = normDeg(termEndDeg+30);
  const prevStartJD = findTermCrossingJD(prevStartDeg, jdBirth-35);
  const nextEndJD = findTermCrossingJD(nextEndDeg, jdBirth+45);
  const prevStartDate = jdUTtoLocalDate(prevStartJD, TZ);
  const nextEndDate = jdUTtoLocalDate(nextEndJD, TZ);

  // Vị trí % trên trục đường thẳng [prevStartJD .. nextEndJD] — dùng cho timeline đơn giản (trụ ngày)
  const timelineSpan = nextEndJD - prevStartJD;
  const curStartPct = (termStartJD - prevStartJD) / timelineSpan * 100;
  const curEndPct = (termEndJD - prevStartJD) / timelineSpan * 100;
  const birthPct = Math.min(100, Math.max(0, (jdBirth - prevStartJD) / timelineSpan * 100));

  // Mốc chi tiết cho trụ tháng: zoom vào đúng 1 tháng [termStartJD..termEndJD], thêm khí (trung khí thật) + 2 mốc phần tư
  const khiDeg = normDeg(termStartDeg + 15);
  const khiJD = findTermCrossingJD(khiDeg, termStartJD + 15);
  const monthSpan = termEndJD - termStartJD;
  const q1JD = termStartJD + monthSpan * 0.25;
  const q3JD = termStartJD + monthSpan * 0.75;
  const khiDate = jdUTtoLocalDate(khiJD, TZ);
  const q1Date = jdUTtoLocalDate(q1JD, TZ);
  const q3Date = jdUTtoLocalDate(q3JD, TZ);
  const detail = {
    khiName: KHI_NAMES[orderFromDan],
    khiDate: {dd:khiDate[0], mm:khiDate[1]},
    khiPct: (khiJD - termStartJD) / monthSpan * 100,
    q1Date: {dd:q1Date[0], mm:q1Date[1]},
    q3Date: {dd:q3Date[0], mm:q3Date[1]},
    birthPct: Math.min(100, Math.max(0, (jdBirth - termStartJD) / monthSpan * 100))
  };

  // Giờ
  function hourChiOf(h){ if(h===23||h===0) return 0; return Math.floor((h+1)/2); }
  const hourChiIdx = hourChiOf(hh);
  const startStemTy = (((dayCanIdx%5)*2)%10+10)%10;
  const hourCanIdx = (startStemTy+hourChiIdx)%10;

  // Lịch âm tương ứng để hiển thị
  const lunar = convertSolar2Lunar(dd, mm, yy, TZ);

  return {
    year:{can:yearCanIdx, chi:yearChiIdx},
    month:{can:monthCanIdx, chi:monthChiIdx, tiet:tietName,
      termStart:{dd:termStartDate[0],mm:termStartDate[1]},
      termEnd:{dd:termEndDate[0],mm:termEndDate[1]},
      termPercent:termPercent,
      prevTiet:{name:TIET_NAMES[prevOrder], start:{dd:prevStartDate[0],mm:prevStartDate[1]}, end:{dd:termStartDate[0],mm:termStartDate[1]}},
      nextTiet:{name:TIET_NAMES[nextOrder], start:{dd:termEndDate[0],mm:termEndDate[1]}, end:{dd:nextEndDate[0],mm:nextEndDate[1]}},
      timeline:{curStartPct, curEndPct, birthPct}, detail},
    day:{can:dayCanIdx, chi:dayChiIdx},
    hour:{can:hourCanIdx, chi:hourChiIdx},
    solar:{dd,mm,yy,hh,mn},
    lunar:{d:lunar[0], m:lunar[1], y:lunar[2], leap:lunar[3]},
    baziYear, isTyHourLate
  };
}

