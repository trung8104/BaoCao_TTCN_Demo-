// =====================================================================
// assets/js/calendar.js – trang LỊCH CANH TÁC (public/calendar.php)
//
// Người dùng có thể tạo NHIỀU kế hoạch (mỗi luống / chậu một kế hoạch),
// chọn kế hoạch để xem, sửa và xóa (có hộp thoại xác nhận).
// Dữ liệu lưu trong localStorage của trình duyệt (không gửi lên máy chủ).
//
// File gồm 6 phần:
//   1. Dữ liệu các mốc chăm sóc     4. Trạng thái và giao diện (render)
//   2. Hàm hỗ trợ (ngày, tạo thẻ)   5. Xử lý thao tác của người dùng
//   3. Lưu trữ (localStorage)        6. Khởi động
// CSS của trang: mục "9. TRANG LỊCH CANH TÁC" trong assets/css/style.css
// =====================================================================
(function () {
    "use strict";

    // ================================================================
    // 1. DỮ LIỆU: các mốc chăm sóc
    //    day   = số ngày kể từ ngày gieo hạt
    //    title = tên công việc          note = ghi chú hướng dẫn
    //    group = nhóm giống áp dụng:
    //            "all"           mọi giống
    //            "determinate"   giống hữu hạn (cây thấp)
    //            "indeterminate" giống vô hạn (cần giàn cao)
    //    Thêm mốc mới: thêm một dòng vào đây (chương trình tự sắp xếp theo day).
    //    LƯU Ý: trong CÙNG một nhóm giống, mỗi `day` chỉ nên xuất hiện MỘT lần,
    //    vì `day` được dùng để nhớ công việc nào đã hoàn thành.
    // ================================================================
    const MILESTONES = [
        { day: 0, group: "all", title: "Gieo hạt", note: "Gieo vào khay hoặc bầu, giá thể tơi xốp, giữ ẩm nhẹ." },
        { day: 7, group: "all", title: "Hạt nảy mầm, cây con lên đều", note: "Để nơi nhiều sáng, tưới nhẹ, tránh úng." },
        { day: 14, group: "all", title: "Cây con có lá thật", note: "Theo dõi sâu bệnh, tỉa bớt nếu gieo dày." },
        { day: 25, group: "all", title: "Chuẩn bị đem cây ra trồng", note: "Cây con khỏe, khoảng 4–6 lá thật. Cho cây làm quen nắng 2–3 ngày trước khi trồng." },
        { day: 28, group: "all", title: "Trồng cây ra vườn", note: "Trồng buổi chiều mát, tưới đẫm sau trồng." },

        { day: 38, group: "indeterminate", title: "Làm giàn cao, buộc dây, bắt đầu tỉa chồi nách", note: "Tỉa chồi nách thường xuyên, giữ 1–2 thân chính." },
        { day: 40, group: "determinate", title: "Làm giàn / cắm cọc, bón thúc lần 1", note: "Cắm cọc để cây không đổ, bón thúc theo hướng dẫn phân bón." },
        { day: 50, group: "indeterminate", title: "Ra hoa, bón thúc lần 1", note: "Giữ ẩm đều, hỗ trợ thụ phấn nếu trồng trong nhà lưới." },
        { day: 55, group: "determinate", title: "Ra hoa rộ", note: "Giữ ẩm đều, tránh tưới thất thường để hạn chế rụng hoa, nứt quả." },
        { day: 65, group: "indeterminate", title: "Đậu quả, tỉa lá già gốc", note: "Tỉa lá già giúp thông thoáng, giảm bệnh." },
        { day: 70, group: "determinate", title: "Đậu quả, bón thúc lần 2", note: "Chú ý sâu đục quả và các bệnh trên quả." },
        { day: 90, group: "determinate", title: "Bắt đầu thu hoạch", note: "Hái khi quả chuyển màu, hái lúc trời mát." },
        { day: 90, group: "indeterminate", title: "Bắt đầu thu hoạch", note: "Thu hoạch kéo dài nhiều đợt." },
        { day: 110, group: "determinate", title: "Thu hoạch rộ, kết thúc vụ", note: "Thu gom tàn dư cây để hạn chế mầm bệnh cho vụ sau." },
        { day: 130, group: "indeterminate", title: "Thu hoạch rộ, đánh giá kết thúc vụ", note: "Cắt ngọn khi cây quá cao, thu gom tàn dư cuối vụ." },
    ];

    const VARIETIES = ["determinate", "indeterminate"]; // các giá trị hợp lệ của ô "Nhóm giống"
    const DEFAULT_NAME = "Lịch cà chua"; // tên dùng khi người dùng để trống ô tên
    const MAX_PLANS = 20; // số kế hoạch tối đa (tránh danh sách quá dài)
    const STORE_KEY = "tomatoGuideCalendars"; // khóa localStorage: dữ liệu mới (nhiều kế hoạch)
    const OLD_KEY = "tomatoGuideCropCalendar"; // khóa localStorage: dữ liệu cũ (chỉ 1 kế hoạch)
    const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    // ================================================================
    // 2. HÀM HỖ TRỢ
    // ================================================================

    // Tạo một thẻ HTML: el("span", "tên-class", "chữ bên trong").
    // Dùng textContent nên chữ người dùng nhập (tên kế hoạch...) không thể chèn mã HTML độc hại.
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function pad(n) {
        return String(n).padStart(2, "0"); // 5 -> "05"
    }

    // Date -> "2026-11-14" (đúng định dạng của <input type="date">)
    function toIso(d) {
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    // "2026-11-14" -> Date. Sai định dạng hoặc ngày không có thật (ví dụ 2026-02-31) -> null
    function parseIso(text) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || "");
        if (!m) return null;
        const year = +m[1];
        const month = +m[2] - 1; // tháng trong JavaScript đếm từ 0
        const day = +m[3];
        const d = new Date(year, month, day);
        const valid = d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        return valid ? d : null;
    }

    // Date -> "Thứ 7, 14/11/2026"
    function formatLong(d) {
        return DAY_NAMES[d.getDay()] + ", " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
    }

    // "2026-11-14" -> "14/11/2026"
    function formatShort(iso) {
        const d = parseIso(iso);
        return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() : "";
    }

    // Danh sách mốc áp dụng cho một nhóm giống, xếp theo ngày tăng dần
    function milestonesFor(variety) {
        return MILESTONES.filter(function (m) {
            return m.group === "all" || m.group === variety;
        }).sort(function (a, b) {
            return a.day - b.day;
        });
    }

    // Mã định danh ngẫu nhiên cho mỗi kế hoạch, ví dụ "pm3k9x2a7f"
    function newId() {
        return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    // ================================================================
    // 3. LƯU TRỮ (localStorage)
    //
    // Dữ liệu lưu dạng JSON, ví dụ:
    //   {
    //     version: 2,
    //     activeId: "pm3k9x2a7f",              <- kế hoạch đang được chọn
    //     plans: [
    //       { id: "pm3k9x2a7f",
    //         name: "Cà chua bi ban công",
    //         date: "2026-11-14",              <- ngày gieo hạt
    //         variety: "determinate",
    //         done: { "0": true, "7": true },  <- các `day` đã đánh dấu hoàn thành
    //         createdAt: 1763100000000 }
    //     ]
    //   }
    // ================================================================

    // Kiểm tra trình duyệt có cho phép lưu không (chế độ riêng tư có thể chặn)
    const storageWorks = (function () {
        try {
            localStorage.setItem("__test__", "1");
            localStorage.removeItem("__test__");
            return true;
        } catch (e) {
            return false;
        }
    })();

    function emptyStore() {
        return { version: 2, activeId: null, plans: [] };
    }

    // Làm sạch dữ liệu của một kế hoạch đọc từ localStorage; dữ liệu hỏng -> null (bỏ qua)
    function cleanPlan(raw) {
        if (!raw || typeof raw !== "object" || !parseIso(raw.date)) return null;
        const done = {};
        Object.keys(raw.done || {}).forEach(function (key) {
            if (raw.done[key] === true && /^\d+$/.test(key)) done[key] = true;
        });
        return {
            id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
            name: String(raw.name || DEFAULT_NAME).slice(0, 50),
            date: raw.date,
            variety: VARIETIES.indexOf(raw.variety) >= 0 ? raw.variety : "determinate",
            done: done,
            createdAt: Number(raw.createdAt) || Date.now(),
        };
    }

    // Bản cũ chỉ lưu MỘT kế hoạch và đánh dấu việc đã làm theo số thứ tự (0, 1, 2...).
    // Bản mới đánh dấu theo `day` nên chuyển đổi: số thứ tự -> day của mốc ở vị trí đó.
    function migrateOldPlan() {
        let old = null;
        try {
            old = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
        } catch (e) {
            return null;
        }
        if (!old || !parseIso(old.date)) return null;
        const variety = VARIETIES.indexOf(old.variety) >= 0 ? old.variety : "determinate";
        const items = milestonesFor(variety); // thứ tự này giống hệt thứ tự bản cũ đã dùng để đánh số
        const done = {};
        Object.keys(old.done || {}).forEach(function (index) {
            if (old.done[index] && items[+index]) done[items[+index].day] = true;
        });
        return cleanPlan({ name: old.name, date: old.date, variety: variety, done: done });
    }

    function loadStore() {
        const result = emptyStore();
        if (!storageWorks) return result;
        let text = null;
        try {
            text = localStorage.getItem(STORE_KEY);
        } catch (e) {
            return result;
        }
        if (text) {
            let data = null;
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = null; // dữ liệu hỏng -> coi như chưa có gì
            }
            const plans = data && Array.isArray(data.plans) ? data.plans : [];
            plans.forEach(function (raw) {
                const plan = cleanPlan(raw);
                if (plan) result.plans.push(plan);
            });
            result.activeId = data ? data.activeId : null;
        } else {
            const migrated = migrateOldPlan(); // lần đầu dùng bản mới: đưa kế hoạch cũ sang
            if (migrated) {
                result.plans.push(migrated);
                result.activeId = migrated.id;
                if (writeStore(result)) {
                    try {
                        localStorage.removeItem(OLD_KEY); // đã chuyển xong, xóa dữ liệu cũ
                    } catch (e) {}
                }
            }
        }
        const found = result.plans.some(function (p) {
            return p.id === result.activeId;
        });
        if (!found) result.activeId = result.plans.length ? result.plans[0].id : null;
        return result;
    }

    function writeStore(data) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }

    // ================================================================
    // 4. TRẠNG THÁI VÀ GIAO DIỆN
    // ================================================================

    // Các phần tử trong calendar.php (tìm theo id)
    const form = document.getElementById("planForm");
    const formTitle = document.getElementById("formTitle");
    const nameInput = document.getElementById("cropName");
    const dateInput = document.getElementById("sowDate");
    const varietySelect = document.getElementById("variety");
    const submitLabel = document.getElementById("calcBtnLabel");
    const cancelEditBtn = document.getElementById("cancelEdit");
    const errorBox = document.getElementById("calcError");
    const statusBox = document.getElementById("calcStatus");
    const switcher = document.getElementById("planSwitcher");
    const planList = document.getElementById("planList");
    const progressBox = document.getElementById("calendarProgress");
    const planTitle = document.getElementById("planTitle");
    const completedCount = document.getElementById("completedCount");
    const totalCount = document.getElementById("totalCount");
    const editBtn = document.getElementById("editPlan");
    const deleteBtn = document.getElementById("deletePlan");
    const emptyBox = document.getElementById("calendarEmpty");
    const timeline = document.getElementById("timeline");
    const note = document.getElementById("calcNote");
    const dialog = document.getElementById("confirmDialog");
    const dialogName = document.getElementById("confirmName");

    let store = loadStore(); // toàn bộ dữ liệu: danh sách kế hoạch + kế hoạch đang chọn
    let editingId = null; // id kế hoạch đang được sửa trong form (null = form đang ở chế độ "tạo mới")
    let pendingDeleteId = null; // id kế hoạch đang chờ người dùng xác nhận xóa

    function getActivePlan() {
        return (
            store.plans.find(function (p) {
                return p.id === store.activeId;
            }) || null
        );
    }

    // Số công việc đã hoàn thành của một kế hoạch (chỉ đếm các mốc còn nằm trong danh sách)
    function countDone(plan, items) {
        return items.filter(function (m) {
            return plan.done[m.day];
        }).length;
    }

    function showError(text) {
        errorBox.textContent = text || "";
    }

    function showStatus(text) {
        statusBox.textContent = text || ""; // vùng chỉ dành cho trình đọc màn hình
    }

    // Ghi dữ liệu; nếu không ghi được thì báo cho người dùng (kế hoạch vẫn dùng được cho đến khi tải lại trang)
    function save() {
        if (!storageWorks) {
            showError("Trình duyệt đang chặn lưu trữ nên kế hoạch sẽ mất khi tải lại trang.");
            return false;
        }
        if (!writeStore(store)) {
            showError("Không lưu được kế hoạch trên trình duyệt này.");
            return false;
        }
        return true;
    }

    // Đọc lại dữ liệu mới nhất trước mỗi thao tác (phòng khi bạn mở trang này ở 2 tab)
    function refresh() {
        if (storageWorks) store = loadStore();
    }

    // Vẽ danh sách các nút chọn kế hoạch
    function renderSwitcher() {
        planList.innerHTML = "";
        switcher.hidden = store.plans.length === 0;
        store.plans.forEach(function (plan) {
            const items = milestonesFor(plan.variety);
            const button = el("button", "plan-chip");
            button.type = "button";
            button.dataset.planId = plan.id; // sẽ đọc lại khi người dùng bấm
            button.setAttribute("aria-pressed", String(plan.id === store.activeId));
            button.appendChild(el("span", "plan-chip__name", plan.name));
            button.appendChild(el("span", "plan-chip__meta", "Gieo " + formatShort(plan.date) + " · " + countDone(plan, items) + "/" + items.length + " việc"));
            const li = document.createElement("li");
            li.appendChild(button);
            planList.appendChild(li);
        });
    }

    // Cập nhật con số "3 / 10 công việc"
    function renderCounts(plan, items) {
        completedCount.textContent = countDone(plan, items);
        totalCount.textContent = "/ " + items.length + " công việc";
    }

    // Vẽ phần tiến độ + danh sách mốc của kế hoạch đang chọn
    function renderPlan() {
        const plan = getActivePlan();
        timeline.innerHTML = "";
        progressBox.hidden = !plan;
        note.hidden = !plan;
        emptyBox.hidden = !!plan;
        if (!plan) return;

        const items = milestonesFor(plan.variety);
        const start = parseIso(plan.date);
        planTitle.textContent = plan.name;
        renderCounts(plan, items);

        items.forEach(function (m) {
            const date = new Date(start.getTime());
            date.setDate(date.getDate() + m.day); // ngày gieo + số ngày của mốc
            const done = plan.done[m.day] === true;

            const li = el("li", done ? "is-complete" : "");
            const label = el("label", "task-check");
            const box = document.createElement("input");
            box.type = "checkbox";
            box.checked = done;
            box.dataset.day = m.day; // sẽ đọc lại khi người dùng tick
            const tick = el("span");
            tick.setAttribute("aria-hidden", "true"); // ô vuông trang trí, trình đọc màn hình bỏ qua
            label.appendChild(box);
            label.appendChild(tick);
            label.appendChild(el("span", "visually-hidden", "Đánh dấu " + m.title + " đã hoàn thành"));

            const content = el("div", "timeline-content");
            const dateLine = el("div", "date", formatLong(date) + " ");
            dateLine.appendChild(el("span", "text-muted fw-normal", "(ngày thứ " + m.day + ")"));
            content.appendChild(dateLine);
            content.appendChild(el("div", "fw-semibold task-title", m.title));
            content.appendChild(el("div", "text-muted small", m.note));

            li.appendChild(label);
            li.appendChild(content);
            timeline.appendChild(li);
        });
    }

    function render() {
        renderSwitcher();
        renderPlan();
    }

    // Đặt form về chế độ "Tạo kế hoạch mới" với giá trị mặc định
    function resetForm() {
        editingId = null;
        formTitle.textContent = "Tạo kế hoạch mới";
        submitLabel.textContent = "Tạo lịch";
        cancelEditBtn.hidden = true;
        nameInput.value = "";
        dateInput.value = toIso(new Date()); // mặc định: hôm nay
        varietySelect.value = "determinate";
    }

    // Đưa kế hoạch đang chọn vào form để sửa
    function startEditing(plan) {
        editingId = plan.id;
        formTitle.textContent = "Chỉnh sửa kế hoạch";
        submitLabel.textContent = "Lưu thay đổi";
        cancelEditBtn.hidden = false;
        nameInput.value = plan.name;
        dateInput.value = plan.date;
        varietySelect.value = plan.variety;
        showError("");
        nameInput.focus();
    }

    // ================================================================
    // 5. XỬ LÝ THAO TÁC CỦA NGƯỜI DÙNG
    // ================================================================

    // --- Bấm nút "Tạo lịch" / "Lưu thay đổi" (hoặc nhấn Enter trong form) ---
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // không cho trình duyệt tải lại trang
        refresh();
        showError("");
        showStatus("");

        const date = dateInput.value;
        if (!date) return fail("Hãy chọn ngày gieo hạt.");
        if (!parseIso(date)) return fail("Ngày gieo hạt chưa hợp lệ.");
        const variety = VARIETIES.indexOf(varietySelect.value) >= 0 ? varietySelect.value : "determinate";
        const typedName = nameInput.value.trim().slice(0, 50);

        if (editingId) {
            const plan = store.plans.find(function (p) {
                return p.id === editingId;
            });
            if (!plan) {
                resetForm(); // kế hoạch đã bị xóa ở tab khác
                render();
                return;
            }
            plan.name = typedName || plan.name; // để trống tên thì giữ tên cũ
            plan.date = date;
            plan.variety = variety;
            showStatus("Đã lưu thay đổi cho kế hoạch " + plan.name + ".");
        } else {
            if (store.plans.length >= MAX_PLANS) return fail("Tối đa " + MAX_PLANS + " kế hoạch. Hãy xóa bớt kế hoạch cũ.");
            const fallback = DEFAULT_NAME + (store.plans.length ? " " + (store.plans.length + 1) : "");
            const plan = { id: newId(), name: typedName || fallback, date: date, variety: variety, done: {}, createdAt: Date.now() };
            store.plans.push(plan);
            store.activeId = plan.id; // chọn luôn kế hoạch vừa tạo
            showStatus("Đã tạo kế hoạch " + plan.name + ".");
        }
        save();
        resetForm();
        render();

        function fail(message) {
            showError(message);
            dateInput.focus();
        }
    });

    cancelEditBtn.addEventListener("click", function () {
        resetForm();
        showError("");
    });

    // --- Bấm vào một kế hoạch trong danh sách để xem ---
    planList.addEventListener("click", function (event) {
        const button = event.target.closest("[data-plan-id]");
        if (!button) return;
        refresh();
        store.activeId = button.dataset.planId;
        if (!getActivePlan()) store.activeId = store.plans.length ? store.plans[0].id : null; // kế hoạch vừa bị xóa ở tab khác
        save();
        if (editingId) resetForm(); // đổi kế hoạch thì thoát chế độ sửa
        showError("");
        render();
        const pressed = planList.querySelector('[aria-pressed="true"]');
        if (pressed) pressed.focus(); // giữ con trỏ bàn phím trên nút vừa chọn
    });

    // --- Tick / bỏ tick một công việc ---
    timeline.addEventListener("change", function (event) {
        const box = event.target;
        if (!box.matches("input[data-day]")) return;
        refresh();
        const plan = getActivePlan();
        if (!plan) return;
        if (box.checked) plan.done[box.dataset.day] = true;
        else delete plan.done[box.dataset.day];
        save();
        // Chỉ cập nhật đúng chỗ cần thiết (không vẽ lại cả danh sách) để con trỏ bàn phím không bị mất
        box.closest("li").classList.toggle("is-complete", box.checked);
        renderCounts(plan, milestonesFor(plan.variety));
        renderSwitcher();
    });

    // --- Nút "Sửa" ---
    editBtn.addEventListener("click", function () {
        refresh();
        const plan = getActivePlan();
        if (plan) startEditing(plan);
    });

    // --- Nút "Xóa kế hoạch": hỏi xác nhận trước ---
    deleteBtn.addEventListener("click", function () {
        refresh();
        const plan = getActivePlan();
        if (!plan) return;
        pendingDeleteId = plan.id;
        dialogName.textContent = plan.name;
        if (typeof dialog.showModal === "function") {
            dialog.returnValue = ""; // đặt lại để lần mở trước không ảnh hưởng lần này
            dialog.showModal(); // mở hộp thoại; phím Esc = hủy
        } else if (window.confirm('Xóa kế hoạch "' + plan.name + '"? Không thể khôi phục.')) {
            removePlan(plan.id); // trình duyệt quá cũ chưa có <dialog>: dùng hộp thoại có sẵn
        }
    });

    // Hộp thoại đóng lại: chỉ xóa khi người dùng bấm nút "Xóa" (value="ok")
    dialog.addEventListener("close", function () {
        if (dialog.returnValue === "ok" && pendingDeleteId) removePlan(pendingDeleteId);
        pendingDeleteId = null;
    });

    // Bấm ra ngoài hộp thoại (vào vùng nền mờ) = hủy
    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) dialog.close("cancel");
    });

    function removePlan(id) {
        refresh();
        const index = store.plans.findIndex(function (p) {
            return p.id === id;
        });
        if (index < 0) return; // đã bị xóa ở tab khác
        store.plans.splice(index, 1);
        // Chọn kế hoạch kế tiếp; nếu vừa xóa kế hoạch cuối danh sách thì chọn kế hoạch liền trước
        const next = store.plans[index] || store.plans[index - 1] || null;
        store.activeId = next ? next.id : null;
        save();
        if (editingId === id) resetForm();
        showStatus("Đã xóa kế hoạch.");
        render();
        // Nút "Xóa" vừa biến mất nên đưa con trỏ bàn phím tới chỗ hợp lý
        const target = planList.querySelector('[aria-pressed="true"]') || nameInput;
        target.focus();
    }

    // Tab khác thay đổi dữ liệu -> cập nhật lại màn hình này
    window.addEventListener("storage", function (event) {
        if (event.key !== STORE_KEY) return;
        store = loadStore();
        if (editingId && !getActivePlan()) resetForm();
        render();
    });

    // ================================================================
    // 6. KHỞI ĐỘNG
    // ================================================================
    resetForm();
    render();
    if (!storageWorks) showError("Trình duyệt đang chặn lưu trữ nên kế hoạch sẽ mất khi tải lại trang.");
})();