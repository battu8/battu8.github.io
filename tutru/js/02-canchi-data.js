/* ============================================================
   2. DỮ LIỆU CAN CHI / NGŨ HÀNH / NẠP ÂM / THẬP THẦN
   ============================================================ */
const CAN = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const CHI_ANIMAL = ["Chuột","Trâu","Hổ","Mèo","Rồng","Rắn","Ngựa","Dê","Khỉ","Gà","Chó","Lợn"];
const CAN_INFO = [
  {elem:"Mộc",yang:true},{elem:"Mộc",yang:false},
  {elem:"Hỏa",yang:true},{elem:"Hỏa",yang:false},
  {elem:"Thổ",yang:true},{elem:"Thổ",yang:false},
  {elem:"Kim",yang:true},{elem:"Kim",yang:false},
  {elem:"Thủy",yang:true},{elem:"Thủy",yang:false}
];
const GENERATES = {"Mộc":"Hỏa","Hỏa":"Thổ","Thổ":"Kim","Kim":"Thủy","Thủy":"Mộc"};
const CONTROLS  = {"Mộc":"Thổ","Thổ":"Thủy","Thủy":"Hỏa","Hỏa":"Kim","Kim":"Mộc"};

const NAP_AM = [
"Hải Trung Kim","Hải Trung Kim","Lư Trung Hỏa","Lư Trung Hỏa","Đại Lâm Mộc","Đại Lâm Mộc",
"Lộ Bàng Thổ","Lộ Bàng Thổ","Kiếm Phong Kim","Kiếm Phong Kim","Sơn Đầu Hỏa","Sơn Đầu Hỏa",
"Giản Hạ Thủy","Giản Hạ Thủy","Thành Đầu Thổ","Thành Đầu Thổ","Bạch Lạp Kim","Bạch Lạp Kim",
"Dương Liễu Mộc","Dương Liễu Mộc","Tuyền Trung Thủy","Tuyền Trung Thủy","Ốc Thượng Thổ","Ốc Thượng Thổ",
"Tích Lịch Hỏa","Tích Lịch Hỏa","Tùng Bách Mộc","Tùng Bách Mộc","Trường Lưu Thủy","Trường Lưu Thủy",
"Sa Trung Kim","Sa Trung Kim","Sơn Hạ Hỏa","Sơn Hạ Hỏa","Bình Địa Mộc","Bình Địa Mộc",
"Bích Thượng Thổ","Bích Thượng Thổ","Kim Bạc Kim","Kim Bạc Kim","Phú Đăng Hỏa","Phú Đăng Hỏa",
"Thiên Hà Thủy","Thiên Hà Thủy","Đại Trạch Thổ","Đại Trạch Thổ","Thoa Xuyến Kim","Thoa Xuyến Kim",
"Tang Đố Mộc","Tang Đố Mộc","Đại Khê Thủy","Đại Khê Thủy","Sa Trung Thổ","Sa Trung Thổ",
"Thiên Thượng Hỏa","Thiên Thượng Hỏa","Thạch Lựu Mộc","Thạch Lựu Mộc","Đại Hải Thủy","Đại Hải Thủy"
];
function sexagenaryIndex(canIdx, chiIdx){
  for(let i=0;i<60;i++){ if(i%10===canIdx && i%12===chiIdx) return i; }
  return -1;
}
function napAmOf(canIdx, chiIdx){
  const idx = sexagenaryIndex(canIdx, chiIdx);
  return idx>=0 ? NAP_AM[idx] : "—";
}

const TANG_CAN = [
  [9], //Tý: Quý
  [5,9,7], //Sửu: Kỷ, Quý, Tân
  [0,2,4], //Dần: Giáp, Bính, Mậu
  [1], //Mão: Ất
  [4,1,9], //Thìn: Mậu, Ất, Quý
  [2,6,4], //Tỵ: Bính, Canh, Mậu
  [3,5], //Ngọ: Đinh, Kỷ
  [5,3,1], //Mùi: Kỷ, Đinh, Ất
  [6,8,4], //Thân: Canh, Nhâm, Mậu
  [7], //Dậu: Tân
  [4,7,3], //Tuất: Mậu, Tân, Đinh
  [8,0]  //Hợi: Nhâm, Giáp
];
const TANG_ROLE = ["Chủ khí","Trung khí","Dư khí"];

function tenGod(dmIdx, targetIdx){
  const dm = CAN_INFO[dmIdx], t = CAN_INFO[targetIdx];
  const same = dm.yang === t.yang;
  if (dm.elem === t.elem) return same ? "Tỷ Kiên" : "Kiếp Tài";
  if (GENERATES[t.elem] === dm.elem) return same ? "Kiêu Thần" : "Chính Ấn";
  if (GENERATES[dm.elem] === t.elem) return same ? "Thực Thần" : "Thương Quan";
  if (CONTROLS[dm.elem] === t.elem)  return same ? "Thiên Tài" : "Chính Tài";
  if (CONTROLS[t.elem] === dm.elem)  return same ? "Thất Sát" : "Chính Quan";
  return "—";
}

const TIET_NAMES = ["Lập Xuân","Kinh Trập","Thanh Minh","Lập Hạ","Mang Chủng","Tiểu Thử",
                     "Lập Thu","Bạch Lộ","Hàn Lộ","Lập Đông","Đại Tuyết","Tiểu Hàn"];
// Trung khí — mỗi "tiết" (mở đầu tháng) đi kèm 1 "khí" cách 15° sau đó (giữa tháng), theo đúng thứ tự 24 tiết khí
const KHI_NAMES = ["Vũ Thủy","Xuân Phân","Cốc Vũ","Tiểu Mãn","Hạ Chí","Đại Thử",
                    "Xử Thử","Thu Phân","Sương Giáng","Tiểu Tuyết","Đông Chí","Đại Hàn"];

