/* ============================================================
   NGÂN HÀNG CÂU PHÚ CỔ ĐIỂN (chọn lọc từ tài liệu 399 câu phú)
   Dùng làm "xương sống" cho văn bản ở các mục Tính Cách, Cách Cục,
   Tư Vấn Tổng Hợp — giúp câu văn có chiều sâu, có căn cứ cổ thư,
   thay vì chỉ diễn giải máy móc theo công thức nội bộ.
   CHỦ ĐỘNG LOẠI BỎ toàn bộ nội dung liên quan bệnh tật cụ thể theo
   ngũ hành (Phần I.III của tài liệu gốc) và Thọ/Yểu (Phần III.V) —
   giữ đúng ranh giới an toàn đã thống nhất xuyên suốt dự án.
   ============================================================ */

// 10 Nhật Can — ẩn dụ + tính cách cốt lõi (bỏ các mệnh đề bệnh tật đi kèm)
const NHAT_CAN_TINH_CACH = [
  'Giáp Mộc là cây to trong rừng — thẳng thắn, chính trực, có chí lãnh đạo, thích làm anh cả, đôi khi hơi cứng đầu, không thích bị quản thúc.',
  'Ất Mộc là hoa cỏ, dây leo — mềm mại, uyển chuyển, khéo léo, thích nghệ thuật, thông minh nhưng đôi khi thiếu quyết đoán.',
  'Bính Hỏa là mặt trời — nhiệt tình, hào phóng, năng lượng cao, thích giúp người, nhưng dễ nóng nảy, cả thèm chóng chán.',
  'Đinh Hỏa là ngọn đèn — tinh tế, tỉ mỉ, thông minh, thích văn hóa/giáo dục/nghệ thuật, hay trầm tư suy nghĩ.',
  'Mậu Thổ là đất núi đồi — chắc chắn, trung hậu, bao dung, giữ chữ tín, đôi khi hơi cố chấp.',
  'Kỷ Thổ là đất ruộng vườn — hiền lành, nhẫn nại, chăm chỉ, hay lo xa và thích tích lũy.',
  'Canh Kim là kim loại thô — cương nghị, quyết đoán, trượng nghĩa, thích sự rõ ràng dứt khoát.',
  'Tân Kim là trang sức — tinh tế, đẹp đẽ, thích làm đẹp, khéo léo, ưa sạch sẽ, hay suy nghĩ.',
  'Nhâm Thủy là nước sông biển — thông minh, lanh lợi, thích lưu động/ngoại giao, phóng khoáng, hay thay đổi.',
  'Quý Thủy là nước mưa sương — tinh tế, nhạy cảm, thông minh, thích huyền học, thiên về nội tâm.'
];

// 5 nhóm Thập Thần — tâm tính cốt lõi khi lộ rõ (chọn lọc từ Phần 2, bỏ các câu về bệnh/sảy thai)
const THAP_THAN_GROUP_QUOTES = {
  'Tỷ Kiếp': 'mang tâm tính mạo hiểm, dũng cảm, có chí tiến thủ — nhưng nếu quá nhiều dễ trở nên cứng nhắc, khó hòa nhập, thậm chí cô độc.',
  'Thực Thương': 'mang tâm tính thông minh, hoạt bát, tài hoa dồi dào — nhưng nếu quá nhiều (đặc biệt Thương Quan) dễ tùy tiện, thiếu kiềm chế.',
  'Tài': 'mang tâm tính cần cù, tiết kiệm, thật thà, đồng thời khảng khái và nhạy bén — nhưng nếu quá thiên lệch một chiều dễ hoặc cẩu thả thiếu tiến thủ, hoặc ba hoa phù phiếm.',
  'Quan Sát': 'mang tâm tính có tinh thần trách nhiệm, ngay thẳng, trượng nghĩa, năng động — nhưng nếu không được chế ngự đúng mức dễ bảo thủ cứng nhắc, hoặc khó làm chủ bản thân.',
  'Ấn': 'mang tâm tính nhân từ, bao dung, không màng danh lợi, thông minh — nhưng nếu quá nhiều dễ an phận, trì trệ, thiếu tính quyết đoán.'
};

// Câu phú theo VỊ TRÍ TRỤ cho 1 số Thập Thần quan trọng (Phần 2, tài liệu 399 câu phú)
// — dùng để làm giàu mục Lục Thân/Hôn Nhân theo đúng cung vị cụ thể, không chỉ chung chung.
const POSITION_QUOTES = {
  'Chính Quan': {
    year:  'Quan ở trụ Năm — thường là người có ý chí từ nhỏ, chăm chỉ học hành, được hưởng phúc tổ tiên.',
    month: 'Quan ở trụ Tháng — thường được nuông chiều, cuộc sống hanh thông.',
    day:   'Quan ở trụ Ngày — thường thông minh, tài giỏi văn võ song toàn; nam có vợ hiền, nữ có chồng chu đáo.',
    hour:  'Quan ở trụ Giờ — thường được nhờ phúc con cái về sau.'
  },
  'Thất Sát': {
    year:  'Sát ở trụ Năm — con đầu lòng thường là trai, gia đình dù nghèo khó nhưng có ý chí xuất chúng.',
    month: 'Sát ở trụ Tháng — nếu trụ Năm hoặc can Giờ có Thực Thần/Thương Quan chế ngự thì mệnh rất đáng quý.',
    day:   'Sát ở trụ Ngày — vợ/chồng thường là người ngay thẳng, được kính trọng; nhưng nếu không có Thực Thần tiết chế thì dễ mâu thuẫn.',
    hour:  'Sát ở trụ Giờ — theo tài liệu, đây là vị trí "một ngôi ở giờ là quý": nếu lá số đạt cách Thất Sát mà Sát chỉ xuất hiện đúng một ngôi ở trụ Giờ (không tràn lan các trụ khác) thì được xem là quý cách.'
  },
  'Chính Ấn': {
    year:  'Ấn ở trụ Năm — tiền đồ học hành rộng mở.',
    month: 'Ấn ở trụ Tháng — thường hiền lương, ít ốm đau vặt.',
    day:   'Ấn ở trụ Ngày — thường lấy được vợ/chồng hiền lành, được nhờ cậy từ nửa kia.'
  },
  'Thiên Ấn': {
    year:  'Thiên Ấn ở trụ Năm — cần chú ý giáo dục từ nhỏ, tài liệu cho rằng vị trí này dễ ảnh hưởng thanh danh gia đình nếu không được uốn nắn tốt.',
    month: 'Thiên Ấn ở trụ Tháng — khá phù hợp các nghề thiên về nghệ thuật/y học/tự do, cần môi trường sáng tạo hơn khuôn khổ cứng nhắc.'
  }
};
const CACH_CUC_ENRICH = {
  'Chính Quan': 'Cổ thư (Tử Bình): Chính Quan Cách quý nhất khi Thân vượng có Tài Ấn phù trợ; sợ nhất "Thương Quan gặp Quan" (họa trăm đường ập đến) — nếu có Ấn đứng giữa hóa giải (Thương sinh Ấn, Ấn sinh Thân) thì phá cách có thể trở lại thành cách.',
  'Thất Sát': 'Cổ thư (Tử Bình): Thất Sát Cách quý nhất khi Thân vượng có Thực Thần chế Sát vừa đủ — lúc đó Sát "hóa thành quyền bính"; nhưng chế quá tay khiến Sát mất hết lực thì cách cục cũng hỏng theo, lại thành bần tiện.',
  'Chính Ấn': 'Cổ thư: Chính Ấn Cách quý khi Thân nhược gặp Ấn, hoặc Thân vượng gặp Tài để chế bớt Ấn; kỵ nhất là Tài phá Ấn quá mạnh.',
  'Thiên Ấn': 'Cổ thư: Thiên Ấn Cách tốt khi Thân nhược được Kiêu sinh trợ vừa phải; nếu quá nhiều lại thành phúc mỏng, đặc biệt "Kiêu đoạt Thực" (Kiêu khắc mất Thực Thần) thì chỉ có Thiên Tài mới giải được.',
  'Chính Tài': 'Cổ thư: Chính Tài Cách giàu có khi Thân vượng Tài cũng vượng tương xứng; ngược lại Thân nhược mà Tài lại vượng thì không những khó giàu mà cầu tài còn vất vả.',
  'Thiên Tài': 'Cổ thư: Thiên Tài Cách quý khi Thân vượng Thiên Tài cũng vượng — tính phóng khoáng, thường dễ thành đạt khi xa quê lập nghiệp.',
  'Thực Thần': 'Cổ thư: Thực Thần Cách quý nhất khi Thân vượng, Thực Thần sinh Tài — "Thực Thần sinh Tài tự nhiên giàu"; nếu Thực Thần quá nhiều lại dễ sinh tính an nhàn hưởng thụ quá mức.',
  'Thương Quan': 'Cổ thư: Thương Quan Cách quý khi Thân vượng, Thương Quan sinh Tài — tài hoa mà giàu có; điều tối kỵ là gặp lại Chính Quan ("Thương Quan gặp Quan là họa trăm đường").',
  'Kiến Lộc': 'Cổ thư: Kiến Lộc Cách (Nhật Can vượng, gặp đúng Lộc tại tháng sinh) — Thân vượng nên có Tài Quan để tiết bớt, tránh kinh doanh mạo hiểm đơn độc, hợp hướng tự lập ổn định hơn.',
  'Kình Dương': 'Cổ thư: Dương Nhẫn Cách (Nhật Can vượng quá mức) — cực vượng cần Thất Sát chế ngự hoặc Thực Thương tiết bớt mới phát được; giàu thường đến nhờ sự liều lĩnh, quyết đoán hơn là ổn định từ tốn.'
};
