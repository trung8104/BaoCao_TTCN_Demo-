<?php
// =====================================================================
// public/calendar.php – trang LỊCH CANH TÁC
//
// File này chỉ là khung HTML. Mọi xử lý (tạo / chọn / sửa / xóa kế hoạch, lưu vào localStorage) nằm trong assets/js/calendar.js.
// JavaScript tìm các phần tử bên dưới theo id, nếu đổi id ở đây thì phải đổi cả trong calendar.js.
// CSS của trang: mục "9. TRANG LỊCH CANH TÁC" trong assets/css/style.css
// =====================================================================
require_once __DIR__ . '/../includes/helpers.php';
$page_title = 'Lịch canh tác';
$active = 'calendar';
require __DIR__ . '/../includes/header.php';
?>
<div class="calendar-intro">
    <span class="eyebrow">KẾ HOẠCH THEO VƯỜN CỦA BẠN</span>
    <h1>Lịch canh tác cà chua</h1>
    <p>Tạo các mốc chăm sóc từ ngày gieo hạt, rồi đánh dấu công việc khi hoàn thành. Bạn có thể tạo nhiều kế hoạch cho nhiều luống hoặc chậu khác nhau. Kế hoạch được lưu trên trình duyệt này.</p>
</div>

<!-- Form tạo kế hoạch mới. Khi bấm "Sửa", JavaScript đổi form sang chế độ chỉnh sửa kế hoạch đang chọn. -->
<form class="calendar-form card mb-4" id="planForm" novalidate>
    <div class="card-body">
        <div class="calendar-form__title">
            <h2 id="formTitle">Tạo kế hoạch mới</h2>
            <button class="calendar-form__cancel" id="cancelEdit" type="button" hidden>Hủy chỉnh sửa</button>
        </div>
        <div class="row g-3 align-items-end">
            <div class="col-12 col-md-3">
                <label class="form-label fw-semibold" for="cropName">Tên luống / chậu</label>
                <input class="form-control" type="text" id="cropName" maxlength="50" placeholder="Ví dụ: Cà chua bi ban công">
            </div>
            <div class="col-12 col-md-3">
                <label class="form-label fw-semibold" for="sowDate">Ngày gieo hạt</label>
                <input class="form-control" type="date" id="sowDate">
            </div>
            <div class="col-12 col-md-3">
                <label class="form-label fw-semibold" for="variety">Nhóm giống</label>
                <select class="form-select" id="variety">
                    <option value="determinate">Sinh trưởng hữu hạn (cây thấp)</option>
                    <option value="indeterminate">Sinh trưởng vô hạn (cần giàn cao)</option>
                </select>
            </div>
            <div class="col-12 col-md-3 d-grid">
                <button class="btn btn-danger" id="calcBtn" type="submit"><span id="calcBtnLabel">Tạo lịch</span> <span aria-hidden="true">→</span></button>
            </div>
        </div>
        <div id="calcError" class="text-danger small mt-2" role="alert"></div>
        <!-- Thông báo "Đã tạo / Đã xóa kế hoạch..." chỉ dành cho trình đọc màn hình -->
        <div id="calcStatus" class="visually-hidden" role="status"></div>
    </div>
</form>

<!-- Danh sách các kế hoạch đã tạo: bấm vào một nút để xem kế hoạch đó (JS đổ nội dung vào #planList) -->
<section class="plan-switcher" id="planSwitcher" aria-labelledby="planSwitcherLabel" hidden>
    <span class="eyebrow" id="planSwitcherLabel">CÁC KẾ HOẠCH CỦA BẠN</span>
    <ul class="plan-switcher__list" id="planList"></ul>
</section>

<!-- Tiến độ của kế hoạch đang chọn -->
<div class="calendar-progress" id="calendarProgress" hidden>
    <div>
        <span class="eyebrow">TIẾN ĐỘ CỦA BẠN</span>
        <h2 id="planTitle"></h2>
    </div>
    <div class="progress-count" aria-live="polite">
        <strong id="completedCount">0</strong><span id="totalCount">/ 0 công việc</span>
    </div>
    <div class="calendar-progress__actions">
        <button class="btn btn-sm btn-outline-secondary" id="editPlan" type="button">Sửa</button>
        <button class="btn btn-sm btn-outline-secondary" id="deletePlan" type="button">Xóa kế hoạch</button>
    </div>
</div>

<!-- Hiện khi chưa có kế hoạch nào -->
<p class="calendar-empty" id="calendarEmpty" hidden>Bạn chưa có kế hoạch nào. Điền form phía trên và bấm "Tạo lịch" để tạo kế hoạch đầu tiên.</p>

<ol class="timeline" id="timeline"></ol>
<p class="calendar-note small text-muted" id="calcNote" hidden><span>i</span> Các mốc là ước tính để lên kế hoạch. Hãy quan sát cây và điều chỉnh theo thực tế.</p>

<!-- Hộp thoại xác nhận xóa. <dialog> là thẻ có sẵn của trình duyệt: JS gọi showModal() để mở,
     <form method="dialog"> tự đóng hộp thoại khi bấm nút và ghi lại nút nào được bấm (value="ok" / "cancel"). -->
<dialog class="confirm-dialog" id="confirmDialog" aria-labelledby="confirmTitle" aria-describedby="confirmText">
    <form method="dialog">
        <h2 class="confirm-dialog__title" id="confirmTitle">Xác nhận xóa</h2>
        <div class="confirm-dialog__body">
            <p class="confirm-dialog__text" id="confirmText">Bạn có chắc muốn xóa kế hoạch “<strong id="confirmName"></strong>” không?</p>
            <p class="confirm-dialog__warning"><span aria-hidden="true">⚠</span> Tiến độ đã đánh dấu sẽ mất và không thể khôi phục.</p>
        </div>
        <div class="confirm-dialog__actions">
            <button class="confirm-dialog__btn confirm-dialog__btn--ghost" value="cancel" autofocus>Hủy</button>
            <button class="confirm-dialog__btn confirm-dialog__btn--danger" value="ok">Xóa kế hoạch</button>
        </div>
    </form>
</dialog>

<script src="<?= url('assets/js/calendar.js') ?>"></script>
<?php require __DIR__ . '/../includes/footer.php'; ?>