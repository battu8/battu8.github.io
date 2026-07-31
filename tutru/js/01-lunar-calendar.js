/* ============================================================
   1. LỊCH ÂM DƯƠNG VIỆT NAM — thuật toán thiên văn (UTC+7)
   ============================================================ */
const TZ = 7;

function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12*a - 3;
  let jd = dd + Math.floor((153*m+2)/5) + 365*y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;
  return jd;
}
function jdToDate(jd) {
  const a = jd + 32044;
  const b = Math.floor((4*a+3)/146097);
  const c = a - Math.floor((b*146097)/4);
  const d = Math.floor((4*c+3)/1461);
  const e = c - Math.floor((1461*d)/4);
  const m = Math.floor((5*e+2)/153);
  const day = e - Math.floor((153*m+2)/5) + 1;
  const month = m + 3 - 12*Math.floor(m/10);
  const year = b*100 + d - 4800 + Math.floor(m/10);
  return [day, month, year];
}
function NewMoon(k) {
  const T = k/1236.85, T2=T*T, T3=T2*T, dr=Math.PI/180;
  let Jd1 = 2415020.75933 + 29.53058868*k + 0.0001178*T2 - 0.000000155*T3;
  Jd1 += 0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);
  const M = 359.2242 + 29.10535608*k - 0.0000333*T2 - 0.00000347*T3;
  const Mpr = 306.0253 + 385.81691806*k + 0.0107306*T2 + 0.00001236*T3;
  const F = 21.2964 + 390.67050646*k - 0.0016528*T2 - 0.00000239*T3;
  let C1 = (0.1734-0.000393*T)*Math.sin(M*dr) + 0.0021*Math.sin(2*dr*M);
  C1 = C1 - 0.4068*Math.sin(Mpr*dr) + 0.0161*Math.sin(dr*2*Mpr);
  C1 = C1 - 0.0004*Math.sin(dr*3*Mpr);
  C1 = C1 + 0.0104*Math.sin(dr*2*F) - 0.0051*Math.sin(dr*(M+Mpr));
  C1 = C1 - 0.0074*Math.sin(dr*(M-Mpr)) + 0.0004*Math.sin(dr*(2*F+M));
  C1 = C1 - 0.0004*Math.sin(dr*(2*F-M)) - 0.0006*Math.sin(dr*(2*F+Mpr));
  C1 = C1 + 0.0010*Math.sin(dr*(2*F-Mpr)) + 0.0005*Math.sin(dr*(2*Mpr+M));
  let deltaT;
  if (T < -11) deltaT = 0.001 + 0.000839*T + 0.0002261*T2 - 0.00000845*T3 - 0.000000081*T*T3;
  else deltaT = -0.000278 + 0.000265*T + 0.000262*T2;
  return Jd1 + C1 - deltaT;
}
function SunLongitude(jdn) {
  const T = (jdn - 2451545.0)/36525, T2 = T*T, dr = Math.PI/180;
  const M = 357.52910 + 35999.05030*T - 0.0001559*T2 - 0.00000048*T*T2;
  const L0 = 280.46645 + 36000.76983*T + 0.0003032*T2;
  let DL = (1.914600 - 0.004817*T - 0.000014*T2)*Math.sin(dr*M);
  DL += (0.019993 - 0.000101*T)*Math.sin(dr*2*M) + 0.000290*Math.sin(dr*3*M);
  let L = L0 + DL;
  L = L*dr;
  L = L - Math.PI*2*Math.floor(L/(Math.PI*2));
  return L; // radian 0..2PI
}
function sunLongitudeDeg(jd){ return SunLongitude(jd) * 180/Math.PI; }
function getSunLongitudeSector(dayNumber, timeZone) {
  return Math.floor(SunLongitude(dayNumber - 0.5 - timeZone/24)/Math.PI*6);
}
function getNewMoonDay(k, timeZone) {
  return Math.floor(NewMoon(k) + 0.5 + timeZone/24);
}
function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31,12,yy) - 2415021;
  const k = Math.floor(off/29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitudeSector(nm, timeZone);
  if (sunLong >= 9) nm = getNewMoonDay(k-1, timeZone);
  return nm;
}
function getLeapMonthOffset(a11, timeZone) {
  const k = Math.floor((a11 - 2415021.076998695)/29.530588853 + 0.5);
  let last = 0, i = 1;
  let arc = getSunLongitudeSector(getNewMoonDay(k+i, timeZone), timeZone);
  do {
    last = arc; i++;
    arc = getSunLongitudeSector(getNewMoonDay(k+i, timeZone), timeZone);
  } while (arc != last && i < 14);
  return i-1;
}
function convertSolar2Lunar(dd, mm, yy, timeZone) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695)/29.530588853);
  let monthStart = getNewMoonDay(k+1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy-1, timeZone); }
  else { lunarYear = yy+1; b11 = getLunarMonth11(yy+1, timeZone); }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11)/29);
  let lunarLeap = 0, lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) { lunarMonth = diff + 10; if (diff == leapMonthDiff) lunarLeap = 1; }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}
function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) {
  let a11, b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear-1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear+1, timeZone);
  }
  let k = Math.floor(0.5 + (a11 - 2415021.076998695)/29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap != 0 && lunarMonth != leapMonth+1) return null;
    else if (lunarLeap != 0 || off >= leapOff) off += 1;
  }
  const monthStart = getNewMoonDay(k+off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}
function daysInLunarMonth(lm, ly, leap, timeZone){
  const startSolar = convertLunar2Solar(1, lm, ly, leap, timeZone);
  if(!startSolar) return 30;
  let jd = jdFromDate(startSolar[0], startSolar[1], startSolar[2]);
  let count = 0;
  for(let i=0;i<31;i++){
    const [d2,m2,y2] = jdToDate(jd+i);
    const lu = convertSolar2Lunar(d2,m2,y2,timeZone);
    if(lu[1]===lm && lu[3]===leap && lu[2]===ly) count++; else break;
  }
  return count || 30;
}
function findLapXuanJD(year){
  let lo = jdFromDate(25,1,year) - 1;
  let hi = jdFromDate(15,2,year) + 1;
  for(let i=0;i<50;i++){
    const mid=(lo+hi)/2;
    const deg=sunLongitudeDeg(mid);
    if(deg<315) lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}
function normDeg(d){ return ((d%360)+360)%360; }
// Tìm JD (UT, liên tục) tại thời điểm kinh độ mặt trời đi qua targetDeg, tìm quanh mốc approxJD
function findTermCrossingJD(targetDeg, approxJD){
  function rel(jd){
    let d = sunLongitudeDeg(jd) - targetDeg;
    return ((d+540)%360)-180; // đưa về khoảng -180..180
  }
  let lo = approxJD - 40, hi = approxJD + 40;
  let prev = rel(lo), foundLo=null, foundHi=null;
  for(let jd=lo+1; jd<=hi; jd++){
    const cur = rel(jd);
    if(prev<0 && cur>=0){ foundLo=jd-1; foundHi=jd; break; }
    prev=cur;
  }
  if(foundLo===null) return approxJD;
  for(let i=0;i<40;i++){
    const mid=(foundLo+foundHi)/2;
    if(rel(mid)<0) foundLo=mid; else foundHi=mid;
  }
  return (foundLo+foundHi)/2;
}
// JD liên tục (giờ UT) -> ngày dương lịch địa phương [dd,mm,yy]
function jdUTtoLocalDate(jdUT, timeZone){
  const localJDN = Math.floor(jdUT + 0.5 + timeZone/24 + 1e-9);
  return jdToDate(localJDN);
}

