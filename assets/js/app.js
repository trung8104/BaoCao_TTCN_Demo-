// =====================================================================
// assets/js/app.js – JavaScript DÙNG CHUNG cho cả trang công khai và trang quản trị
// (được nạp ở cuối includes/footer.php và includes/admin_footer.php)
//
// Gồm 3 tính năng nhỏ, độc lập với nhau:
//   1. Menu điện thoại             – trang công khai (nút ☰ trong includes/header.php)
//   2. Hỏi xác nhận trước khi xóa  – trang quản trị (form có thuộc tính data-confirm)
//   3. Xem trước ảnh khi chọn file – trang quản trị (ô chọn file có thuộc tính data-preview)
// Trang nào không có phần tử tương ứng thì đoạn code đó tự bỏ qua, không gây lỗi.
// (Trang Lịch canh tác có hộp thoại xác nhận xóa riêng, nằm trong calendar.js.)
// =====================================================================

// DOMContentLoaded = trình duyệt đã đọc xong HTML của trang. Chỉ lúc đó mới tìm được các phần tử bên dưới.
document.addEventListener("DOMContentLoaded", function () {
    // ---------- 1. MENU ĐIỆN THOẠI ----------
    // Bấm nút ☰ thì thêm / bớt class "is-open" cho menu. CSS dựa vào class này để hiện hoặc ẩn menu
    // (xem mục "3. HEADER" trong assets/css/style.css).
    const menuButton = document.querySelector(".site-header__toggle"); // nút ☰
    const menu = document.getElementById("site-menu"); // khung chứa menu
    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            const isOpen = menu.classList.toggle("is-open"); // toggle: đang có class thì bỏ, chưa có thì thêm. Trả về true nếu menu đang mở
            menuButton.setAttribute("aria-expanded", String(isOpen)); // báo cho trình đọc màn hình: menu đang mở hay đóng
            menuButton.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu"); // đổi tên của nút cho trình đọc màn hình
        });
    }

    // ---------- 2. HỎI XÁC NHẬN TRƯỚC KHI XÓA ----------
    // Cách dùng trong HTML: <form data-confirm="Nội dung câu hỏi">
    // Khi gửi form sẽ hiện hộp thoại Đồng ý / Hủy của trình duyệt. Bấm Hủy thì form không được gửi (không xóa gì cả).
    document.querySelectorAll("form[data-confirm]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            if (!confirm(form.getAttribute("data-confirm"))) event.preventDefault(); // preventDefault = chặn, không cho gửi form
        });
    });

    // ---------- 3. XEM TRƯỚC ẢNH ----------
    // Cách dùng trong HTML: <input type="file" data-preview="#id-của-khung-hiển-thị">
    // Khi chọn ảnh từ máy, ảnh hiện ngay trong khung đó (chưa tải lên máy chủ).
    document.querySelectorAll("input[type=file][data-preview]").forEach(function (fileInput) {
        fileInput.addEventListener("change", function () {
            // change = người dùng vừa chọn file
            const previewBox = document.querySelector(fileInput.getAttribute("data-preview")); // khung sẽ chứa ảnh xem trước
            if (!previewBox) return;
            previewBox.innerHTML = ""; // xóa ảnh xem trước của lần chọn trước
            Array.prototype.forEach.call(fileInput.files, function (file) {
                if (!file.type.startsWith("image/")) return; // bỏ qua file không phải ảnh
                const image = document.createElement("img");
                image.src = URL.createObjectURL(file); // địa chỉ tạm để hiện ảnh ngay trên máy
                image.style.cssText = "height:70px;margin:4px;border-radius:6px";
                previewBox.appendChild(image);
            });
        });
    });
});