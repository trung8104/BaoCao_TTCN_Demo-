SET NAMES utf8mb4;
-- DỮ LIỆU MẪU để chạy thử website. Import SAU database.sql.
-- Bảng sâu bệnh được chuyển từ bang-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx; nguồn được lưu theo từng bản ghi.
-- Khuyến cáo thuốc trong tài liệu được giữ nguyên, cần đối chiếu nhãn đăng ký tại địa phương trước khi áp dụng.
USE tomato_guide;

-- Xóa các bản ghi mẫu cũ để không giữ dữ liệu trước bộ dữ liệu từ tài liệu Word.
DELETE FROM posts WHERE slug IN (
  'gioi-thieu-cay-ca-chua-va-cac-nhom-giong',
  'gieo-hat-va-uom-cay-con-ca-chua',
  'lam-gian-va-tia-canh-ca-chua',
  'nguyen-tac-tuoi-nuoc-va-bon-phan',
  'thu-hoach-va-bao-quan-ca-chua'
);
DELETE FROM pests WHERE slug IN (
  'benh-moc-suong',
  'benh-heo-xanh-vi-khuan',
  'sau-duc-qua',
  'thoi-day-qua',
  'benh-xoan-la-do-virus'
);

-- Dữ liệu sâu bệnh và triệu chứng chuyển từ bảng trong tài liệu Word.
-- Rối loạn sinh lý dùng type='disease' vì schema chỉ hỗ trợ pest/disease.
INSERT INTO pests (name, slug, type, description, cause, prevention, treatment, source) VALUES
('Bệnh đốm vi khuẩn(Bacterial Spot)', 'benh-dom-vi-khuan', 'disease', 'Đốm lá nhỏ úng nước, sau hoại tử xám nâu ở trung tâm; vết bệnh lõm mặt trên, lồi mặt dưới. Quả có đốm tròn nâu sẫm-đen lồi nhẹ.', 'Vi khuẩn Xanthomonas axonopodis pv. vesicatoria', 'Dùng hạt sạch kiểm định; ngâm nước nóng 50°C 25 phút. Luân canh 1 năm.', 'Phun phòng định kỳ thuốc gốc đồng (copper) + maneb bao phủ tán lá.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh đốm vi khuẩn nhỏ(Bacterial Speck)', 'benh-dom-vi-khuan-nho', 'disease', 'Đốm lá rất nhỏ, tròn, nâu đậm-đen; thời tiết mát ẩm làm lá chết mảng lớn. Quả có đốm ti li bao quanh bởi quầng màu xanh.', 'Vi khuẩn Pseudomonas syringae pv. tomato', 'Hạt giống sạch, xử lý nước nóng, sản xuất cây giống xa ruộng thương mại.', 'Phun thuốc gốc đồng + maneb phòng ngừa khi thời tiết ẩm mát.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh héo vi khuẩn(Bacterial Wilt)', 'benh-heo-vi-khuan', 'disease', 'Cây héo rũ đột ngột khi lá vẫn giữ màu xanh tươi rồi chết toàn bộ. Cắt thân ngâm nước thấy dịch vi khuẩn màu trắng sữa chảy ra.', 'Vi khuẩn Ralstonia solanacearum trong đất', 'Luân canh nhiều năm khỏi đất nhiễm bệnh (rất ít giống thương mại kháng).', 'Nhổ bỏ tiêu hủy cây bệnh; xông hơi khử trùng đất trước khi trồng.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Virus héo đốm cà chua(TSWV)', 'virus-heo-dom-ca-chua', 'disease', 'Cây còi cọc nghiêm trọng; lá xuất hiện đốm vòng biến màu đồng rõ rệt. Quả biến dạng nặng, xuất hiện sọc đen hoặc đốm úa vàng.', 'Tomato Spotted Wilt Virus (TSWV), truyền qua bọ trĩ', 'Trồng giống kháng (Amelia, BHN 444...); phủ màng phản quang; diệt cỏ dại.', 'Phun thuốc diệt bọ trĩ môi giới kịp thời ngăn lây lan.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Virus khảm dưa chuột(CMV)', 'virus-kham-dua-chuot', 'disease', 'Lá, thân biến dạng nghiêm trọng, co quắp, dẹt/dạng dải (strapped/faciated) giống ngộ độc thuốc trừ cỏ phenoxy (2,4-D).', 'Cucumber Mosaic Virus (CMV), truyền qua rệp mồi', 'Phát quang cỏ dại ký chủ quanh ruộng; dùng màng phủ xua đuổi rệp.', 'Phun thuốc trừ sâu kiểm soát mật độ rệp mồi môi giới.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Virus xoăn vàng lá(TYLCV)', 'virus-xoan-vang-la', 'disease', 'Toàn cây bị lùn còi cọc nặng, mất khả năng cho quả. Lá ngọn thu nhỏ dạng ''tai chuột'' và mép lá bị úa vàng rõ rệt.', 'Tomato Yellow Leaf Curl Virus, truyền qua bọ phấn trắng', 'Cây giống sạch bọ phấn; nhổ bỏ tiêu hủy cây bệnh ngay; dùng giống kháng.', 'Bón/phun thuốc trừ sâu hệ thống diệt bọ phấn trắng.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Virus khảm thuốc lá(TMV)', 'virus-kham-thuoc-la', 'disease', 'Vách ngoài quả xám lõm, cắt quả thấy các mảng mô hoại tử thâm nâu cứng kéo dài bên trong thịt quả.', 'Tobacco Mosaic Virus (TMV), lây qua tiếp xúc cơ học, dụng cụ', 'Sử dụng giống kháng TMV; vệ sinh dụng cụ, rửa tay xà phòng trước khi làm.', 'Loại bỏ cây bệnh; không có thuốc hóa học trị virus.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh sương mai sớm(Early Blight)', 'benh-suong-mai-som', 'disease', 'Đốm lá tròn-thuôn dài màu nâu sẫm có vòng đồng tâm rõ rệt kèm quầng vàng, gây rụng lá nặng. Cuống quả thối đen phủ mốc nâu/đen.', 'Nấm Alternaria solani trên tàn dư thực vật', 'Trồng giống kháng; luân canh cây trồng; cày lật sâu tàn dư vụ trước.', 'Phun thuốc trừ nấm (chlorothalonil, mancozeb...) định kỳ.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh sương mai muộn(Late Blight)', 'benh-suong-mai-muon', 'disease', 'Vết bệnh tối màu úng nước (bỏng mỡ) trên thân lá. Mặt dưới lá có lớp mốc xốp màu trắng-xám khi ẩm cao. Quả thối mềm nhũn.', 'Oomycete Phytophthora infestans phát tán theo gió mưa', 'Tiêu hủy tàn dư; tránh trồng vùng trũng thấp ẩm ướt; luân canh.', 'Phun phòng ngừa thuốc trừ nấm (copper, dimethomorph, metalaxyl...).', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh đốm lá Septoria & Đốm mục tiêu', 'benh-dom-la-septoria-dom-muc-tieu', 'disease', 'Vết đốm nhỏ hoại tử có viền nâu đen xuất hiện nhiều trên lá làm lá bị úa vàng và rụng hàng loạt, trọc thân cây.', 'Nấm Septoria lycopersici & Corynespora cassiicola', 'Trồng giống kháng, luân canh, vệ sinh đồng ruộng, tưới nước gốc.', 'Phun thuốc trừ nấm bảo vệ lá khi thời tiết ẩm ướt.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh héo Fusarium(Fusarium Wilt)', 'benh-heo-fusarium', 'disease', 'Cây bị vàng lá và héo ở một bên trước (lúc nắng nóng), sau héo toàn cây chết. Cắt dọc thân thấy mạch dẫn bị đổi màu nâu.', 'Nấm đất Fusarium oxysporum f.sp. lycopersici', 'Trồng giống kháng (Races 1, 2, 3); dùng giống sạch; luân canh 5-7 năm.', 'Khử trùng/xông hơi đất (fumigation) trước khi trồng.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bệnh thối gốc mốc trắng(Southern Stem Blight)', 'benh-thoi-goc-moc-trang', 'disease', 'Nấm tấn công gốc thân sát mặt đất tạo lớp mốc trắng lụa, sau hình thành hạt nâu như hạt cải (thể quả); cây héo suy yếu chết dần.', 'Nấm Sclerotium rolfsii tồn tại dạng hạch trong đất', 'Cày lật sâu tàn dư vùi thể quả >6 inch; luân canh cây trồng.', 'Khử trùng đất; bón thuốc trừ nấm chuyên trị vào gốc/tưới nhỏ giọt.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Thối đít quả(Blossom-End Rot)', 'thoi-dit-qua', 'disease', 'Mô phần rốn hoa (đít quả) bị hoại tử lõm sâu màu nâu sẫm đến đen. Thường xuất hiện trên quả non đang phát triển nhanh.', 'Thiếu Canxi cục bộ ở quả non do độ ẩm biến động hoặc thoát hơi nước mạnh', 'Duy trì độ ẩm đất đồng đều; tránh biến động khô/ướt; bón vôi nâng pH.', 'Phun phân bón lá Canxi nitrat/Canxi clorua từ khi bắt đầu ra hoa.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Rụng hoa sinh lý(Blossom Drop)', 'rung-hoa-sinh-ly', 'disease', 'Nụ hoa và hoa nở bị vàng cuống rồi rụng hàng loạt, cản trở hình thành quả non.', 'Nhiệt độ ban đêm >70°F (21°C) hoặc ban ngày >90°F', 'Bố trí thời vụ né nắng nóng; chọn giống chịu nhiệt (''hot set'').', 'Không có thuốc hóa học; điều chỉnh chế độ tưới che mát.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Nứt quả xuyên tâm(Radial Cracking)', 'nut-qua-xuyen-tam', 'disease', 'Vỏ quả bị xé nứt sâu dọc từ cuống ra ngoài, làm lộ thịt quả và dễ bị nấm vi khuẩn xâm nhiễm gây thối.', 'Mưa lớn hoặc tưới nhiều đột ngột sau đợt khô hạn + nhiệt độ cao', 'Duy trì độ ẩm đất ổn định; phủ bạt/rơm giữ ẩm; chọn giống kháng nứt.', 'Thu hoạch sớm quả sắp chín trước khi dự báo có mưa lớn.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Nứt quả đồng tâm(Concentric Cracking)', 'nut-qua-dong-tam', 'disease', 'Các đường nứt hình tròn đồng tâm xuất hiện xung quanh vai quả gần cuống khi quả chuyển sang chín.', 'Chu kỳ sinh trưởng tăng giảm đột ngột (nắng khô xen kẽ tưới đậm/mưa)', 'Cung cấp nước đồng đều; tránh tỉa lá quá tay làm nắng gắt chiếu quả.', 'Quản lý chế độ tưới tiêu nghiêm ngặt và cân đối.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Biến dạng đít quả(Catfacing)', 'bien-dang-dit-qua', 'disease', 'Quả phát triển không đều, đít biến dạng nhăn nheo gồ ghề với dải sẹo chai như mô gỗ.', 'Hoa hình thành trong thời tiết quá lạnh (<50-55°F) hoặc quá ẩm', 'Tránh để cây giống chịu lạnh; trồng đúng vụ; chọn giống ít bị mặt mèo.', 'Nhổ bỏ quả dị dạng sớm trong đợt tỉa quả đầu tiên.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Sẹo khóa kéo(Zippering)', 'seo-khoa-keo', 'disease', 'Vệt sẹo mỏng dài chai sần như dải khóa kéo chạy dọc bề mặt quả từ đít lên cuống.', 'Bao phấn dính chặt vào vách quả non trong thời tiết ẩm mát khi thụ phấn', 'Chọn giống ít nhạy cảm; giữ nhà kính thông thoáng khi ra hoa.', 'Loại bỏ quả bị sẹo nặng trong đợt tỉa quả.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Quả rỗng(Puffiness)', 'qua-rong', 'disease', 'Bề ngoài quả bình thường nhưng cắt ra thấy các khoang chứa hạt bị rỗng, thiếu lớp gel nhầy và hạt.', 'Thụ phấn kém do quá lạnh (<55°F) hoặc quá nóng (>90°F), dư Nitơ', 'Trồng đúng thời vụ; cân đối Nitơ; chọn giống chịu nhiệt thụ phấn tốt.', 'Điều chỉnh tỷ lệ phân bón N-P-K cân đối.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Cháy nắng(Sunscald)', 'chay-nang', 'disease', 'Mảng tổn thương màu trắng khô như giấy hoặc mảng chai vàng cứng trên phần quả hướng nắng.', 'Ánh nắng gắt chiếu trực tiếp do rụng lá hoặc tỉa lá quá mức', 'Duy trì tán lá che phủ quả; tránh tỉa lá quá tay; phòng bệnh rụng lá.', 'Phun chất phản quang kaolin lên quả nếu thiếu lá che.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Xám vách / Chín không đều(Graywall)', 'xam-vach-chin-khong-deu', 'disease', 'Vách ngoài quả xám sụp; cắt quả thấy mô hoại tử thâm nâu; quả chín vằn mảng xanh vàng đỏ.', 'Dư Nitơ, thiếu Kali, đất nén chặt, bọ phấn chích hút hoặc TMV', 'Cân đối phân bón (tăng Kali, giảm Nitơ); quản lý bọ phấn trắng & TMV.', 'Phun bổ sung phân bón lá giàu Kali giai đoạn quả chín.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Mô trắng bên trong(Internal White Tissue)', 'mo-trang-ben-trong', 'disease', 'Cắt quả thấy các mảng mô thịt màu trắng cứng xuất hiện ở vách ngăn bên trong quả.', 'Thiếu hụt phân bón Kali trong giai đoạn quả phát triển lớn', 'Cung cấp đầy đủ dinh dưỡng Kali theo đúng nhu cầu cây.', 'Phun phân bón lá Kali nitrat hoặc Kali sulfat.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Vết nứt vi mô do mưa(Rain Check)', 'vet-nut-vi-mo-do-mua', 'disease', 'Vô số vết nứt nhỏ nằm ngang làm bề mặt vỏ quả thô ráp, mất độ bóng mượt.', 'Mưa lớn đọng giọt trên bề mặt quả nóng + ẩm độ không khí cao', 'Che chắn màng phủ/nhà kính; giữ độ ẩm đất ổn định.', 'Thu hoạch quả kịp thời đúng độ chín thương phẩm.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Sâu xám(Cutworms)', 'sau-xam', 'pest', 'Ấu trùng nấp dưới đất ban ngày, ban đêm chui lên cắn đứt gục ngang thân cây con sát mặt đất.', 'Ấu trùng sâu xám Agrotis spp. phát sinh từ đất nhiều cỏ', 'Cày xới đất phơi ải; dọn sạch cỏ dại trước khi đặt cây giống.', 'Phun thuốc trừ sâu gốc thân chiều tối (khi 5% cây bị cắn).', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Ấu trùng bọ rê / Bọ dừa(White Grubs)', 'au-trung-bo-re-bo-dua', 'pest', 'Ấu trùng màu trắng cong hình chữ C cắn phá phần thân ngầm và rễ cây con.', 'Ấu trùng bọ rê thuộc họ Scarabaeidae trong đất', 'Làm đất kỹ, hạn chế bón phân rác chưa hoai mục.', 'Rải/tưới thuốc trừ sâu dạng hạt vào gốc cây.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bọ vòi voi, Dế, Châu chấu', 'bo-voi-voi-de-chau-chau', 'pest', 'Bọ gặm ăn lớp vỏ mềm xung quanh gốc thân cây con làm đứt mạch dẫn khiến cây bị cọp đổ.', 'Vegetable Weevils, Crickets, Grasshoppers từ bờ cỏ tràn vào', 'Phát quang cỏ dại quanh bờ ruộng; rào lưới chắn.', 'Phun thuốc trừ sâu xung quanh biên giới ruộng và gốc cây con.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bọ nhảy(Flea Beetles)', 'bo-nhay', 'pest', 'Bọ nhỏ màu đen nhảy rất nhanh, gặm tạo thành các lỗ thủng lốm đốm khắp bề mặt lá.', 'Bọ nhảy thuộc họ Chrysomelidae', 'Dùng lưới che phủ cây con; vệ sinh cỏ dại xung quanh.', 'Phun thuốc trừ sâu khi mật độ bọ làm mất >10% diện tích lá.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Sâu đo cắp(Cabbage Looper)', 'sau-do-cap', 'pest', 'Ấu trùng di chuyển uốn cong lưng như thước đo, ăn khuyết mảng lá.', 'Ấu trùng Trichoplusia ni', 'Bảo vệ thiên địch; vệ sinh tàn dư thực vật.', 'Phun thuốc sinh học Bt hoặc thuốc trừ sâu ăn lá.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Ruồi đục lá / Sâu vẽ bùa(Leafminers)', 'ruoi-duc-la-sau-ve-bua', 'pest', 'Ấu trùng màu vàng đục đường hầm ngoằn ngoèo, nhiễm nặng làm rụng lá hàng loạt.', 'Ấu trùng ruồi Liriomyza spp.', 'Bảo vệ ong ký sinh thiên địch; tránh phun hóa chất phổ rộng sớm.', 'Phun thuốc thấm sâu khi >5 đường hầm/lá & >25% có sâu sống.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Sâu đục quả cà chua(Tomato Fruitworm)', 'sau-duc-qua-ca-chua', 'pest', 'Ấu trùng đục sâu vào quả xanh/chín làm quả thối hoại, thường chuyển qua đục nhiều quả.', 'Ấu trùng Helicoverpa armigera / H. zea', 'Đặt bẫy bướm theo dõi; diệt ngô/bắp cải ký chủ gần kề.', 'Phun thuốc khi thấy trứng trên ngọn hoặc 1% quả bị đục.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Sâu keo / Sâu khoang(Armyworms)', 'sau-keo-sau-khoang', 'pest', 'Ấu trùng nhỏ ăn mỏng màng kính; ấu trùng lớn đục vào quả dưới đài hoa hoặc vách quả.', 'Ấu trùng Spodoptera spp.', 'Ngắt bỏ ổ trứng và mảng lá bị ăn tập trung (''hits'').', 'Phun thuốc sinh học/hóa học sớm khi ấu trùng còn nhỏ.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bọ trĩ(Thrips)', 'bo-tri', 'pest', 'Chích hút lá tạo đốm bạc; chích hoa gây rụng; chích quả tạo đốm hoại tử hoặc sẹo rám; truyền TSWV.', 'Bọ trĩ Frankliniella spp. / Thrips spp.', 'Trồng giống kháng TSWV; dùng màng phủ phản quang metalized.', 'Phun thuốc khi có ≥5 bọ trĩ/hoa hoặc 20% cây bị hại.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Rệp mồi(Aphids)', 'rep-moi', 'pest', 'Rệp bám dày đặc mặt dưới lá non chích hút nhựa làm búp xoăn biến dạng; truyền CMV.', 'Rệp Myzus persicae / Aphis gossypii', 'Dùng màng phủ phản quang; bảo vệ bọ rùa thiên địch.', 'Phun thuốc trừ rệp khi >10% cây bị nhiễm tập trung.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bọ phấn trắng(Whiteflies)', 'bo-phan-trang', 'pest', 'Côn trùng nhỏ màu trắng bay như phấn; chích hút suy yếu cây, tiết mật ngọt, truyền TYLCV.', 'Bọ phấn Bemisia tabaci', 'Bón thuốc trừ sâu hệ thống vào đất lúc trồng; che nhà lưới.', 'Phun phối hợp thuốc diệt bọ phấn trưởng thành và ấu trùng.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Bọ xít hút nụ & Bọ xít hôi', 'bo-xit-hut-nu-bo-xit-hoi', 'pest', 'Chích hút nụ hoa làm hoa rụng; chích quả non gây dị dạng; chích quả lớn tạo đốm đen thâm thối.', 'Lygus lineolaris, Nezara viridula, Leptoglossus spp.', 'Phát quang cỏ dại ven ruộng; diệt ổ bọ xít trên cây bụi.', 'Phun thuốc khi phát hiện bọ xít trên ruộng (1 bọ xít/6 cây).', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Nhện đỏ(Spider Mites)', 'nhen-do', 'pest', 'Chích hút mặt dưới lá làm lá khô sạm nâu đỏ, giăng màng nhện; làm quả chín không đều.', 'Nhện đỏ Tetranychus urticae', 'Tránh phun thuốc phổ rộng diệt thiên địch; tưới đủ nước.', 'Phun thuốc đặc trị nhện (acaricides) mặt dưới lá khi mật độ cao.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx'),
('Tuyến trùng sưng rễ(Root-Knot Nematodes)', 'tuyen-trung-sung-re', 'pest', 'Tấn công rễ tạo bướu sưng nốt sần dày đặc, phá hủy rễ khiến cây không hút được nước.', 'Tuyến trùng Meloidogyne spp. Trong đất', 'Trồng giống kháng tuyến trùng (gen Mi); luân canh cây khác họ.', 'Xử lý đất bằng thuốc trừ tuyến trùng hoặc chất xông hơi đất.', 'Tài liệu: bảng-tra-cuu-tong-hop-sau-benh-ca-chua-v2.docx')
ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), description=VALUES(description), cause=VALUES(cause), prevention=VALUES(prevention), treatment=VALUES(treatment), source=VALUES(source);


INSERT INTO symptoms (name, body_part) VALUES
('Đốm nhỏ úng nước, hoại tử nâu, rụng lá sớm; đốm quả tròn đen', 'whole_plant'),
('Đốm ti li màu đen trên lá/thân; đốm quả có viền xanh', 'whole_plant'),
('Cây héo rũ rất nhanh khi lá còn xanh; dịch vi khuẩn trắng sữa', 'whole_plant'),
('Đốm vòng (ringspots), lá sần màu đồng; quả sọc đen/vàng; lùn', 'whole_plant'),
('Lá co quắp, dẹt dải hình quạt; cây lùn còi cọc', 'whole_plant'),
('Lá thu nhỏ hình ''tai chuột'', viền vàng; cây lùn xòe', 'whole_plant'),
('Thâm đen hoại tử mô vách bên trong quả (internal browning)', 'whole_plant'),
('Đốm lá nâu sẫm tròn có vòng đồng tâm; thối đen cuống quả', 'whole_plant'),
('Vết tối màu úng nước bỏng mỡ; mốc trắng mặt dưới lá', 'whole_plant'),
('Các đốm tổn thương hoại tử nâu/xám rải rác mặt lá', 'leaf'),
('Vàng héo 1 bên cây trước; mạch gỗ bên trong thân hóa nâu', 'whole_plant'),
('Vỏ gốc thối mốc trắng, xuất hiện hạt hạch nâu; cây héo chết', 'whole_plant'),
('Đít quả trũng lõm hoại tử sạm đen thô ráp', 'fruit'),
('Hoa rụng cuống, cây giảm hoặc mất khả năng đậu quả', 'flower'),
('Vết nứt kéo dài từ cuống quả ra phía đít quả', 'fruit'),
('Vết nứt tạo thành các vòng tròn quanh cuống quả', 'fruit'),
('Đít quả gồ ghề kèm các gờ sẹo chai sần thô ráp', 'fruit'),
('Vết sẹo hình đường thẳng chai sần từ đít đến cuống', 'fruit'),
('Quả nhẹ, khoang hạt bên trong rỗng thiếu gel', 'fruit'),
('Mảng vỏ mỏng màu trắng hoặc mảng vàng cứng', 'fruit'),
('Vách quả xám sụp; bên trong hoại tử; chín vằn vện', 'fruit'),
('Mảng mô màu trắng xuất hiện ở vách thịt quả', 'fruit'),
('Vết nứt ngang ti li thô ráp trên bề mặt vỏ quả', 'fruit'),
('Cắt đứt ngang thân cây con sát hoặc tại mặt đất', 'stem'),
('Cắn đứt thân cây con ở vị trí nằm dưới mặt đất', 'whole_plant'),
('Gặm vỏ thân cây con khoanh gốc (girdle) gây gãy đổ', 'whole_plant'),
('Đục thủng nhiều lỗ nhỏ hình tròn ti li trên lá', 'leaf'),
('Gặm ăn tạo thành các lỗ kích thước không đều trên lá', 'leaf'),
('Đục đường hầm ngoằn ngoèo màu trắng giữa 2 bề mặt lá', 'leaf'),
('Đục lỗ tròn trực tiếp vào quả, đùn phân ra ngoài', 'whole_plant'),
('Lá non bị gặm xơ mảng (hits); đục vào quả dưới đài', 'whole_plant'),
('Đốm lá màu bạc/rám; rụng hoa; quả lõm rám vỏ', 'whole_plant'),
('Lá non xoăn búp co quắp; phủ mật ngọt nấm bồ hóng', 'whole_plant'),
('Lá rụng, phủ nấm bồ hóng; quả chín không đều màu', 'whole_plant'),
('Nụ hoa bị chích đen rụng; quả non biến dạng; quả lớn đốm thối', 'whole_plant'),
('Mặt dưới lá có chấm nhạt, lá khô sạm nâu đỏ có màng', 'whole_plant'),
('Rễ bị bướu sưng nốt sần; toàn cây còi cọc vàng lá', 'whole_plant')
ON DUPLICATE KEY UPDATE body_part=VALUES(body_part);

INSERT IGNORE INTO pest_symptoms (pest_id, symptom_id) VALUES
((SELECT id FROM pests WHERE slug='benh-dom-vi-khuan'), (SELECT id FROM symptoms WHERE name='Đốm nhỏ úng nước, hoại tử nâu, rụng lá sớm; đốm quả tròn đen')),
((SELECT id FROM pests WHERE slug='benh-dom-vi-khuan-nho'), (SELECT id FROM symptoms WHERE name='Đốm ti li màu đen trên lá/thân; đốm quả có viền xanh')),
((SELECT id FROM pests WHERE slug='benh-heo-vi-khuan'), (SELECT id FROM symptoms WHERE name='Cây héo rũ rất nhanh khi lá còn xanh; dịch vi khuẩn trắng sữa')),
((SELECT id FROM pests WHERE slug='virus-heo-dom-ca-chua'), (SELECT id FROM symptoms WHERE name='Đốm vòng (ringspots), lá sần màu đồng; quả sọc đen/vàng; lùn')),
((SELECT id FROM pests WHERE slug='virus-kham-dua-chuot'), (SELECT id FROM symptoms WHERE name='Lá co quắp, dẹt dải hình quạt; cây lùn còi cọc')),
((SELECT id FROM pests WHERE slug='virus-xoan-vang-la'), (SELECT id FROM symptoms WHERE name='Lá thu nhỏ hình ''tai chuột'', viền vàng; cây lùn xòe')),
((SELECT id FROM pests WHERE slug='virus-kham-thuoc-la'), (SELECT id FROM symptoms WHERE name='Thâm đen hoại tử mô vách bên trong quả (internal browning)')),
((SELECT id FROM pests WHERE slug='benh-suong-mai-som'), (SELECT id FROM symptoms WHERE name='Đốm lá nâu sẫm tròn có vòng đồng tâm; thối đen cuống quả')),
((SELECT id FROM pests WHERE slug='benh-suong-mai-muon'), (SELECT id FROM symptoms WHERE name='Vết tối màu úng nước bỏng mỡ; mốc trắng mặt dưới lá')),
((SELECT id FROM pests WHERE slug='benh-dom-la-septoria-dom-muc-tieu'), (SELECT id FROM symptoms WHERE name='Các đốm tổn thương hoại tử nâu/xám rải rác mặt lá')),
((SELECT id FROM pests WHERE slug='benh-heo-fusarium'), (SELECT id FROM symptoms WHERE name='Vàng héo 1 bên cây trước; mạch gỗ bên trong thân hóa nâu')),
((SELECT id FROM pests WHERE slug='benh-thoi-goc-moc-trang'), (SELECT id FROM symptoms WHERE name='Vỏ gốc thối mốc trắng, xuất hiện hạt hạch nâu; cây héo chết')),
((SELECT id FROM pests WHERE slug='thoi-dit-qua'), (SELECT id FROM symptoms WHERE name='Đít quả trũng lõm hoại tử sạm đen thô ráp')),
((SELECT id FROM pests WHERE slug='rung-hoa-sinh-ly'), (SELECT id FROM symptoms WHERE name='Hoa rụng cuống, cây giảm hoặc mất khả năng đậu quả')),
((SELECT id FROM pests WHERE slug='nut-qua-xuyen-tam'), (SELECT id FROM symptoms WHERE name='Vết nứt kéo dài từ cuống quả ra phía đít quả')),
((SELECT id FROM pests WHERE slug='nut-qua-dong-tam'), (SELECT id FROM symptoms WHERE name='Vết nứt tạo thành các vòng tròn quanh cuống quả')),
((SELECT id FROM pests WHERE slug='bien-dang-dit-qua'), (SELECT id FROM symptoms WHERE name='Đít quả gồ ghề kèm các gờ sẹo chai sần thô ráp')),
((SELECT id FROM pests WHERE slug='seo-khoa-keo'), (SELECT id FROM symptoms WHERE name='Vết sẹo hình đường thẳng chai sần từ đít đến cuống')),
((SELECT id FROM pests WHERE slug='qua-rong'), (SELECT id FROM symptoms WHERE name='Quả nhẹ, khoang hạt bên trong rỗng thiếu gel')),
((SELECT id FROM pests WHERE slug='chay-nang'), (SELECT id FROM symptoms WHERE name='Mảng vỏ mỏng màu trắng hoặc mảng vàng cứng')),
((SELECT id FROM pests WHERE slug='xam-vach-chin-khong-deu'), (SELECT id FROM symptoms WHERE name='Vách quả xám sụp; bên trong hoại tử; chín vằn vện')),
((SELECT id FROM pests WHERE slug='mo-trang-ben-trong'), (SELECT id FROM symptoms WHERE name='Mảng mô màu trắng xuất hiện ở vách thịt quả')),
((SELECT id FROM pests WHERE slug='vet-nut-vi-mo-do-mua'), (SELECT id FROM symptoms WHERE name='Vết nứt ngang ti li thô ráp trên bề mặt vỏ quả')),
((SELECT id FROM pests WHERE slug='sau-xam'), (SELECT id FROM symptoms WHERE name='Cắt đứt ngang thân cây con sát hoặc tại mặt đất')),
((SELECT id FROM pests WHERE slug='au-trung-bo-re-bo-dua'), (SELECT id FROM symptoms WHERE name='Cắn đứt thân cây con ở vị trí nằm dưới mặt đất')),
((SELECT id FROM pests WHERE slug='bo-voi-voi-de-chau-chau'), (SELECT id FROM symptoms WHERE name='Gặm vỏ thân cây con khoanh gốc (girdle) gây gãy đổ')),
((SELECT id FROM pests WHERE slug='bo-nhay'), (SELECT id FROM symptoms WHERE name='Đục thủng nhiều lỗ nhỏ hình tròn ti li trên lá')),
((SELECT id FROM pests WHERE slug='sau-do-cap'), (SELECT id FROM symptoms WHERE name='Gặm ăn tạo thành các lỗ kích thước không đều trên lá')),
((SELECT id FROM pests WHERE slug='ruoi-duc-la-sau-ve-bua'), (SELECT id FROM symptoms WHERE name='Đục đường hầm ngoằn ngoèo màu trắng giữa 2 bề mặt lá')),
((SELECT id FROM pests WHERE slug='sau-duc-qua-ca-chua'), (SELECT id FROM symptoms WHERE name='Đục lỗ tròn trực tiếp vào quả, đùn phân ra ngoài')),
((SELECT id FROM pests WHERE slug='sau-keo-sau-khoang'), (SELECT id FROM symptoms WHERE name='Lá non bị gặm xơ mảng (hits); đục vào quả dưới đài')),
((SELECT id FROM pests WHERE slug='bo-tri'), (SELECT id FROM symptoms WHERE name='Đốm lá màu bạc/rám; rụng hoa; quả lõm rám vỏ')),
((SELECT id FROM pests WHERE slug='rep-moi'), (SELECT id FROM symptoms WHERE name='Lá non xoăn búp co quắp; phủ mật ngọt nấm bồ hóng')),
((SELECT id FROM pests WHERE slug='bo-phan-trang'), (SELECT id FROM symptoms WHERE name='Lá rụng, phủ nấm bồ hóng; quả chín không đều màu')),
((SELECT id FROM pests WHERE slug='bo-xit-hut-nu-bo-xit-hoi'), (SELECT id FROM symptoms WHERE name='Nụ hoa bị chích đen rụng; quả non biến dạng; quả lớn đốm thối')),
((SELECT id FROM pests WHERE slug='nhen-do'), (SELECT id FROM symptoms WHERE name='Mặt dưới lá có chấm nhạt, lá khô sạm nâu đỏ có màng')),
((SELECT id FROM pests WHERE slug='tuyen-trung-sung-re'), (SELECT id FROM symptoms WHERE name='Rễ bị bướu sưng nốt sần; toàn cây còi cọc vàng lá'));

-- Gộp liên kết từ các tên triệu chứng cũ có hậu tố [bộ phận], rồi xóa tên cũ.
INSERT IGNORE INTO pest_symptoms (pest_id, symptom_id)
SELECT old_link.pest_id, clean_symptom.id
FROM pest_symptoms AS old_link
JOIN symptoms AS old_symptom ON old_symptom.id = old_link.symptom_id
JOIN symptoms AS clean_symptom
  ON clean_symptom.name = TRIM(SUBSTRING_INDEX(old_symptom.name, ' [', 1))
WHERE old_symptom.name LIKE '% [%';

DELETE FROM pest_symptoms
WHERE symptom_id IN (SELECT id FROM symptoms WHERE name LIKE '% [%');

DELETE FROM symptoms WHERE name LIKE '% [%';
>>>>>>> Stashed changes
