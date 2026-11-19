/*
 Người dùng có thể tạo NHIỀU kế hoạch (mỗi luống / chậu một kế hoạch),
 chọn kế hoạch để xem, sửa và xóa (có hộp thoại xác nhận).
 Dữ liệu lưu trong localStorage của trình duyệt (không gửi lên máy chủ).

 File gồm 6 phần:
   1. Dữ liệu các mốc chăm sóc      4. Trạng thái và giao diện (render...)
   2. Hàm hỗ trợ (ngày, tạo thẻ)    5. Xử lý thao tác của người dùng
   3. Lưu trữ (localStorage)         6. Khởi động
 CSS của trang: mục "9. TRANG LỊCH CANH TÁC" trong assets/css/style.css
*/

(function () {
    "use strict";
/*
1. DỮ LIỆU: các mốc chăm sóc

Chia thành 3 danh sách:
common         mốc áp dụng cho MỌI giống
determinate    mốc riêng của giống hữu hạn (cây thấp)
indeterminate  mốc riêng của giống vô hạn (cần giàn cao)
Lịch của một kế hoạch = common + danh sách của giống được chọn, rồi xếp theo ngày.

Mỗi mốc gồm:
day   = số ngày kể từ ngày gieo hạt
title = tên công việc
note  = ghi chú hướng dẫn

Thêm mốc mới: thêm một dòng vào đúng danh sách (thứ tự dòng không quan trọng).
LƯU Ý: trong lịch của MỘT giống (common + danh sách riêng), mỗi `day` chỉ nên
xuất hiện MỘT lần, vì `day` được dùng để nhớ công việc nào đã hoàn thành.
(Nếu lỡ trùng, mở Console bằng phím F12 sẽ thấy cảnh báo.)

*/
    const MILESTONES = {
        common: [
            { day: 0, title: "Gieo hạt", note: "Gieo vào khay hoặc bầu, giá thể tơi xốp, giữ ẩm nhẹ." },
            { day: 7, title: "Hạt nảy mầm, cây con lên đều", note: "Để nơi nhiều sáng, tưới nhẹ, tránh úng." },
            { day: 14, title: "Cây con có lá thật", note: "Theo dõi sâu bệnh, tỉa bớt nếu gieo dày." },
            { day: 25, title: "Chuẩn bị đem cây ra trồng", note: "Cây con khỏe, khoảng 4–6 lá thật. Cho cây làm quen nắng 2–3 ngày trước khi trồng." },
            { day: 28, title: "Trồng cây ra vườn", note: "Trồng buổi chiều mát, tưới đẫm sau trồng." },
        ],
        determinate: [
            { day: 40, title: "Làm giàn / cắm cọc, bón thúc lần 1", note: "Cắm cọc để cây không đổ, bón thúc theo hướng dẫn phân bón." },
            { day: 55, title: "Ra hoa rộ", note: "Giữ ẩm đều, tránh tưới thất thường để hạn chế rụng hoa, nứt quả." },
            { day: 70, title: "Đậu quả, bón thúc lần 2", note: "Chú ý sâu đục quả và các bệnh trên quả." },
            { day: 90, title: "Bắt đầu thu hoạch", note: "Hái khi quả chuyển màu, hái lúc trời mát." },
            { day: 110, title: "Thu hoạch rộ, kết thúc vụ", note: "Thu gom tàn dư cây để hạn chế mầm bệnh cho vụ sau." },
        ],
        indeterminate: [
            { day: 38, title: "Làm giàn cao, buộc dây, bắt đầu tỉa chồi nách", note: "Tỉa chồi nách thường xuyên, giữ 1–2 thân chính." },
            { day: 50, title: "Ra hoa, bón thúc lần 1", note: "Giữ ẩm đều, hỗ trợ thụ phấn nếu trồng trong nhà lưới." },
            { day: 65, title: "Đậu quả, tỉa lá già gốc", note: "Tỉa lá già giúp thông thoáng, giảm bệnh." },
            { day: 90, title: "Bắt đầu thu hoạch", note: "Thu hoạch kéo dài nhiều đợt." },
            { day: 130, title: "Thu hoạch rộ, đánh giá kết thúc vụ", note: "Cắt ngọn khi cây quá cao, thu gom tàn dư cuối vụ." },
        ],
    };

    const VARIETIES = ["determinate", "indeterminate"]; // các giá trị hợp lệ của ô "Nhóm giống"
    const DEFAULT_PLAN_NAME = "Lịch cà chua"; // tên dùng khi người dùng để trống ô tên
    const MAX_PLANS = 20; // số kế hoạch tối đa (tránh danh sách quá dài)
    const STORAGE_KEY = "tomatoGuideCalendars"; // tên ô nhớ trong localStorage: dữ liệu mới (nhiều kế hoạch)
    const OLD_STORAGE_KEY = "tomatoGuideCropCalendar"; // tên ô nhớ của bản cũ (chỉ 1 kế hoạch)
    const WEEKDAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]; // theo thứ tự getDay(): 0 = Chủ nhật

    // ================================================================
    // 2. HÀM HỖ TRỢ
    // ================================================================

    // Tạo một thẻ HTML mới. Ví dụ: makeElement("span", "plan-chip__name", "Ban công")
    // tạo <span class="plan-chip__name">Ban công</span>.
    // Dùng textContent nên chữ người dùng nhập (tên kế hoạch...) không thể chèn mã HTML độc hại.
    function makeElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    // Thêm số 0 phía trước cho đủ 2 chữ số: 5 -> "05", 12 -> "12"
    function twoDigits(number) {
        return String(number).padStart(2, "0");
    }

    // Đổi ngày (Date) thành chữ "2026-11-14" – đúng định dạng mà ô <input type="date"> dùng
    function formatDateForInput(date) {
        return date.getFullYear() + "-" + twoDigits(date.getMonth() + 1) + "-" + twoDigits(date.getDate());
    }

    // Ngược lại: đổi chữ "2026-11-14" thành ngày (Date).
    // Chữ sai định dạng hoặc ngày không có thật (ví dụ 2026-02-31) -> trả về null
    function parseInputDate(text) {
        const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || ""); // tách thành năm, tháng, ngày
        if (!parts) return null;
        const year = Number(parts[1]);
        const monthIndex = Number(parts[2]) - 1; // tháng trong JavaScript đếm từ 0 (tháng 1 = 0)
        const dayOfMonth = Number(parts[3]);
        const date = new Date(year, monthIndex, dayOfMonth);
        // Nếu ngày không có thật thì JavaScript tự "nhảy" sang tháng sau, nên kiểm tra lại cho khớp
        const isRealDate = date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === dayOfMonth;
        return isRealDate ? date : null;
    }

    // Đổi ngày thành chữ có thứ: "Thứ 7, 14/11/2026"
    function formatDateWithWeekday(date) {
        return WEEKDAY_NAMES[date.getDay()] + ", " + twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1) + "/" + date.getFullYear();
    }

    // Đổi chữ "2026-11-14" thành "14/11/2026" (để hiện cho người Việt đọc)
    function formatDayMonthYear(inputText) {
        const date = parseInputDate(inputText);
        return date ? twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1) + "/" + date.getFullYear() : "";
    }

    // Lấy danh sách mốc của một nhóm giống: các mốc chung + các mốc riêng, xếp theo ngày tăng dần
    function getMilestonesFor(variety) {
        return MILESTONES.common.concat(MILESTONES[variety] || []).sort(function (first, second) {
            return first.day - second.day;
        });
    }

    // Báo trong Console (phím F12) nếu có hai mốc trùng `day` trong cùng một giống
    function warnAboutDuplicateDays() {
        VARIETIES.forEach(function (variety) {
            const seenDays = {};
            getMilestonesFor(variety).forEach(function (milestone) {
                if (seenDays[milestone.day]) {
                    console.warn("calendar.js: giống " + variety + " có hai mốc cùng day = " + milestone.day + ". Hãy đổi một trong hai mốc.");
                }
                seenDays[milestone.day] = true;
            });
        });
    }

    // Tạo mã định danh ngẫu nhiên cho mỗi kế hoạch, ví dụ "pm3k9x2a7f"
    function createPlanId() {
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
    const canUseLocalStorage = (function () {
        try {
            localStorage.setItem("__test__", "1");
            localStorage.removeItem("__test__");
            return true;
        } catch (error) {
            return false;
        }
    })();

    // Dữ liệu trống: chưa có kế hoạch nào
    function createEmptyData() {
        return { version: 2, activeId: null, plans: [] };
    }

    // Kiểm tra và làm sạch một kế hoạch đọc từ localStorage.
    // Trả về kế hoạch hợp lệ, hoặc null nếu dữ liệu hỏng (khi đó kế hoạch bị bỏ qua).
    function validatePlan(savedPlan) {
        if (!savedPlan || typeof savedPlan !== "object" || !parseInputDate(savedPlan.date)) return null;
        const done = {};
        Object.keys(savedPlan.done || {}).forEach(function (day) {
            if (savedPlan.done[day] === true && /^\d+$/.test(day)) done[day] = true;
        });
        return {
            id: typeof savedPlan.id === "string" && savedPlan.id ? savedPlan.id : createPlanId(),
            name: String(savedPlan.name || DEFAULT_PLAN_NAME).slice(0, 50),
            date: savedPlan.date,
            variety: VARIETIES.indexOf(savedPlan.variety) >= 0 ? savedPlan.variety : "determinate",
            done: done,
            createdAt: Number(savedPlan.createdAt) || Date.now(),
        };
    }

    // Bản cũ chỉ lưu MỘT kế hoạch và đánh dấu việc đã làm theo số thứ tự (0, 1, 2...).
    // Bản mới đánh dấu theo `day`, nên hàm này đổi: số thứ tự -> `day` của mốc ở vị trí đó.
    // Trả về kế hoạch đã chuyển đổi, hoặc null nếu không có dữ liệu cũ.
    function importOldFormatPlan() {
        let oldPlan = null;
        try {
            oldPlan = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || "null");
        } catch (error) {
            return null;
        }
        if (!oldPlan || !parseInputDate(oldPlan.date)) return null;
        const variety = VARIETIES.indexOf(oldPlan.variety) >= 0 ? oldPlan.variety : "determinate";
        const milestones = getMilestonesFor(variety); // thứ tự này giống hệt thứ tự bản cũ đã dùng để đánh số
        const done = {};
        Object.keys(oldPlan.done || {}).forEach(function (position) {
            if (oldPlan.done[position] && milestones[Number(position)]) done[milestones[Number(position)].day] = true;
        });
        return validatePlan({ name: oldPlan.name, date: oldPlan.date, variety: variety, done: done });
    }

    // Đọc toàn bộ dữ liệu từ localStorage (và chuyển dữ liệu bản cũ sang nếu có)
    function loadData() {
        const data = createEmptyData();
        if (!canUseLocalStorage) return data;
        let savedText = null;
        try {
            savedText = localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return data;
        }
        if (savedText) {
            let savedData = null;
            try {
                savedData = JSON.parse(savedText);
            } catch (error) {
                savedData = null; // dữ liệu hỏng -> coi như chưa có gì
            }
            const savedPlans = savedData && Array.isArray(savedData.plans) ? savedData.plans : [];
            savedPlans.forEach(function (savedPlan) {
                const plan = validatePlan(savedPlan);
                if (plan) data.plans.push(plan);
            });
            data.activeId = savedData ? savedData.activeId : null;
        } else {
            const importedPlan = importOldFormatPlan(); // lần đầu dùng bản mới: đưa kế hoạch cũ sang
            if (importedPlan) {
                data.plans.push(importedPlan);
                data.activeId = importedPlan.id;
                if (writeData(data)) {
                    try {
                        localStorage.removeItem(OLD_STORAGE_KEY); // đã chuyển xong, xóa dữ liệu cũ
                    } catch (error) {}
                }
            }
        }
        // Nếu kế hoạch đang chọn không còn tồn tại thì chọn kế hoạch đầu tiên
        const activeExists = data.plans.some(function (plan) {
            return plan.id === data.activeId;
        });
        if (!activeExists) data.activeId = data.plans.length ? data.plans[0].id : null;
        return data;
    }

    // Ghi dữ liệu vào localStorage. Trả về true nếu ghi được, false nếu bị lỗi.
    function writeData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            return false;
        }
    }

    // ================================================================
    // 4. TRẠNG THÁI VÀ GIAO DIỆN
    // ================================================================

    // Các phần tử trong calendar.php (tìm theo id)
    const planForm = document.getElementById("planForm");
    const formTitle = document.getElementById("formTitle");
    const nameInput = document.getElementById("cropName");
    const dateInput = document.getElementById("sowDate");
    const varietySelect = document.getElementById("variety");
    const submitLabel = document.getElementById("calcBtnLabel");
    const cancelEditButton = document.getElementById("cancelEdit");
    const errorMessage = document.getElementById("calcError");
    const statusMessage = document.getElementById("calcStatus");
    const planListSection = document.getElementById("planSwitcher");
    const planList = document.getElementById("planList");
    const progressSection = document.getElementById("calendarProgress");
    const planTitle = document.getElementById("planTitle");
    const completedCountText = document.getElementById("completedCount");
    const totalCountText = document.getElementById("totalCount");
    const editButton = document.getElementById("editPlan");
    const deleteButton = document.getElementById("deletePlan");
    const emptyMessage = document.getElementById("calendarEmpty");
    const timeline = document.getElementById("timeline");
    const calendarNote = document.getElementById("calcNote");
    const confirmDialog = document.getElementById("confirmDialog");
    const confirmPlanName = document.getElementById("confirmName");

    let calendarData = loadData(); // toàn bộ dữ liệu: danh sách kế hoạch + kế hoạch đang chọn
    let editingPlanId = null; // id kế hoạch đang được sửa trong form (null = form đang ở chế độ "tạo mới")
    let planToDeleteId = null; // id kế hoạch đang chờ người dùng xác nhận xóa

    // Lấy kế hoạch đang được chọn (null nếu chưa có kế hoạch nào)
    function getActivePlan() {
        return (
            calendarData.plans.find(function (plan) {
                return plan.id === calendarData.activeId;
            }) || null
        );
    }

    // Đếm số công việc đã hoàn thành (chỉ đếm các mốc còn nằm trong danh sách)
    function countCompletedTasks(plan, milestones) {
        return milestones.filter(function (milestone) {
            return plan.done[milestone.day];
        }).length;
    }

    // Hiện / xóa dòng báo lỗi dưới form
    function showError(text) {
        errorMessage.textContent = text || "";
    }

    // Thông báo chỉ dành cho trình đọc màn hình ("Đã tạo kế hoạch...")
    function announceStatus(text) {
        statusMessage.textContent = text || "";
    }

    // Ghi dữ liệu; nếu không ghi được thì báo cho người dùng (kế hoạch vẫn dùng được cho đến khi tải lại trang)
    function saveData() {
        if (!canUseLocalStorage) {
            showError("Trình duyệt đang chặn lưu trữ nên kế hoạch sẽ mất khi tải lại trang.");
            return false;
        }
        if (!writeData(calendarData)) {
            showError("Không lưu được kế hoạch trên trình duyệt này.");
            return false;
        }
        return true;
    }

    // Đọc lại dữ liệu mới nhất trước mỗi thao tác (phòng khi bạn mở trang này ở 2 tab)
    function reloadData() {
        if (canUseLocalStorage) calendarData = loadData();
    }

    // Vẽ danh sách các nút chọn kế hoạch
    function renderPlanList() {
        planList.innerHTML = "";
        planListSection.hidden = calendarData.plans.length === 0;
        calendarData.plans.forEach(function (plan) {
            const milestones = getMilestonesFor(plan.variety);
            const planButton = makeElement("button", "plan-chip");
            planButton.type = "button";
            planButton.dataset.planId = plan.id; // sẽ đọc lại khi người dùng bấm
            planButton.setAttribute("aria-pressed", String(plan.id === calendarData.activeId));
            planButton.appendChild(makeElement("span", "plan-chip__name", plan.name));
            planButton.appendChild(makeElement("span", "plan-chip__meta", "Gieo " + formatDayMonthYear(plan.date) + " · " + countCompletedTasks(plan, milestones) + "/" + milestones.length + " việc"));
            const listItem = document.createElement("li");
            listItem.appendChild(planButton);
            planList.appendChild(listItem);
        });
    }

    // Cập nhật con số "3 / 10 công việc"
    function renderProgressCount(plan, milestones) {
        completedCountText.textContent = countCompletedTasks(plan, milestones);
        totalCountText.textContent = "/ " + milestones.length + " công việc";
    }

    // Vẽ phần tiến độ + danh sách mốc của kế hoạch đang chọn
    function renderSelectedPlan() {
        const plan = getActivePlan();
        timeline.innerHTML = "";
        progressSection.hidden = !plan;
        calendarNote.hidden = !plan;
        emptyMessage.hidden = !!plan;
        if (!plan) return;

        const milestones = getMilestonesFor(plan.variety);
        const sowDate = parseInputDate(plan.date);
        planTitle.textContent = plan.name;
        renderProgressCount(plan, milestones);

        milestones.forEach(function (milestone) {
            const milestoneDate = new Date(sowDate.getTime());
            milestoneDate.setDate(milestoneDate.getDate() + milestone.day); // ngày gieo + số ngày của mốc
            const isDone = plan.done[milestone.day] === true;

            const listItem = makeElement("li", isDone ? "is-complete" : "");
            const label = makeElement("label", "task-check");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = isDone;
            checkbox.dataset.day = milestone.day; // sẽ đọc lại khi người dùng tick
            const tickBox = makeElement("span");
            tickBox.setAttribute("aria-hidden", "true"); // ô vuông trang trí, trình đọc màn hình bỏ qua
            label.appendChild(checkbox);
            label.appendChild(tickBox);
            label.appendChild(makeElement("span", "visually-hidden", "Đánh dấu " + milestone.title + " đã hoàn thành"));

            const content = makeElement("div", "timeline-content");
            const dateLine = makeElement("div", "date", formatDateWithWeekday(milestoneDate) + " ");
            dateLine.appendChild(makeElement("span", "text-muted fw-normal", "(ngày thứ " + milestone.day + ")"));
            content.appendChild(dateLine);
            content.appendChild(makeElement("div", "fw-semibold task-title", milestone.title));
            content.appendChild(makeElement("div", "text-muted small", milestone.note));

            listItem.appendChild(label);
            listItem.appendChild(content);
            timeline.appendChild(listItem);
        });
    }

    // Vẽ lại toàn bộ phần động của trang
    function renderAll() {
        renderPlanList();
        renderSelectedPlan();
    }

    // Đặt form về chế độ "Tạo kế hoạch mới" với giá trị mặc định
    function resetFormToCreateMode() {
        editingPlanId = null;
        formTitle.textContent = "Tạo kế hoạch mới";
        submitLabel.textContent = "Tạo lịch";
        cancelEditButton.hidden = true;
        nameInput.value = "";
        dateInput.value = formatDateForInput(new Date()); // mặc định: hôm nay
        varietySelect.value = "determinate";
    }

    // Đưa kế hoạch đang chọn vào form để sửa
    function fillFormForEditing(plan) {
        editingPlanId = plan.id;
        formTitle.textContent = "Chỉnh sửa kế hoạch";
        submitLabel.textContent = "Lưu thay đổi";
        cancelEditButton.hidden = false;
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
    planForm.addEventListener("submit", function (event) {
        event.preventDefault(); // không cho trình duyệt tải lại trang
        reloadData();
        showError("");
        announceStatus("");

        const dateText = dateInput.value;
        if (!dateText) return stopWithError("Hãy chọn ngày gieo hạt.");
        if (!parseInputDate(dateText)) return stopWithError("Ngày gieo hạt chưa hợp lệ.");
        const variety = VARIETIES.indexOf(varietySelect.value) >= 0 ? varietySelect.value : "determinate";
        const typedName = nameInput.value.trim().slice(0, 50);

        if (editingPlanId) {
            const plan = calendarData.plans.find(function (item) {
                return item.id === editingPlanId;
            });
            if (!plan) {
                resetFormToCreateMode(); // kế hoạch đã bị xóa ở tab khác
                renderAll();
                return;
            }
            plan.name = typedName || plan.name; // để trống tên thì giữ tên cũ
            plan.date = dateText;
            plan.variety = variety;
            announceStatus("Đã lưu thay đổi cho kế hoạch " + plan.name + ".");
        } else {
            if (calendarData.plans.length >= MAX_PLANS) return stopWithError("Tối đa " + MAX_PLANS + " kế hoạch. Hãy xóa bớt kế hoạch cũ.");
            const fallbackName = DEFAULT_PLAN_NAME + (calendarData.plans.length ? " " + (calendarData.plans.length + 1) : "");
            const newPlan = { id: createPlanId(), name: typedName || fallbackName, date: dateText, variety: variety, done: {}, createdAt: Date.now() };
            calendarData.plans.push(newPlan);
            calendarData.activeId = newPlan.id; // chọn luôn kế hoạch vừa tạo
            announceStatus("Đã tạo kế hoạch " + newPlan.name + ".");
        }
        saveData();
        resetFormToCreateMode();
        renderAll();

        // Hiện lỗi và đưa con trỏ về ô ngày để người dùng sửa
        function stopWithError(message) {
            showError(message);
            dateInput.focus();
        }
    });

    cancelEditButton.addEventListener("click", function () {
        resetFormToCreateMode();
        showError("");
    });

    // --- Bấm vào một kế hoạch trong danh sách để xem ---
    planList.addEventListener("click", function (event) {
        const planButton = event.target.closest("[data-plan-id]");
        if (!planButton) return;
        reloadData();
        calendarData.activeId = planButton.dataset.planId;
        if (!getActivePlan()) calendarData.activeId = calendarData.plans.length ? calendarData.plans[0].id : null; // kế hoạch vừa bị xóa ở tab khác
        saveData();
        if (editingPlanId) resetFormToCreateMode(); // đổi kế hoạch thì thoát chế độ sửa
        showError("");
        renderAll();
        const selectedButton = planList.querySelector('[aria-pressed="true"]');
        if (selectedButton) selectedButton.focus(); // giữ con trỏ bàn phím trên nút vừa chọn
    });

    // --- Tick / bỏ tick một công việc ---
    timeline.addEventListener("change", function (event) {
        const checkbox = event.target;
        if (!checkbox.matches("input[data-day]")) return;
        reloadData();
        const plan = getActivePlan();
        if (!plan) return;
        if (checkbox.checked) plan.done[checkbox.dataset.day] = true;
        else delete plan.done[checkbox.dataset.day];
        saveData();
        // Chỉ cập nhật đúng chỗ cần thiết (không vẽ lại cả danh sách) để con trỏ bàn phím không bị mất
        checkbox.closest("li").classList.toggle("is-complete", checkbox.checked);
        renderProgressCount(plan, getMilestonesFor(plan.variety));
        renderPlanList();
    });

    // --- Nút "Sửa" ---
    editButton.addEventListener("click", function () {
        reloadData();
        const plan = getActivePlan();
        if (plan) fillFormForEditing(plan);
    });

    // --- Nút "Xóa kế hoạch": hỏi xác nhận trước ---
    deleteButton.addEventListener("click", function () {
        reloadData();
        const plan = getActivePlan();
        if (!plan) return;
        planToDeleteId = plan.id;
        confirmPlanName.textContent = plan.name;
        if (typeof confirmDialog.showModal === "function") {
            confirmDialog.returnValue = ""; // đặt lại để lần mở trước không ảnh hưởng lần này
            confirmDialog.showModal(); // mở hộp thoại; phím Esc = hủy
        } else if (window.confirm('Xóa kế hoạch "' + plan.name + '"? Không thể khôi phục.')) {
            removePlan(plan.id); // trình duyệt quá cũ chưa có <dialog>: dùng hộp thoại có sẵn
        }
    });

    // Hộp thoại đóng lại: chỉ xóa khi người dùng bấm nút "Xóa" (value="ok")
    confirmDialog.addEventListener("close", function () {
        if (confirmDialog.returnValue === "ok" && planToDeleteId) removePlan(planToDeleteId);
        planToDeleteId = null;
    });

    // Bấm ra ngoài hộp thoại (vào vùng nền mờ) = hủy
    confirmDialog.addEventListener("click", function (event) {
        if (event.target === confirmDialog) confirmDialog.close("cancel");
    });

    // Xóa một kế hoạch khỏi danh sách rồi chọn kế hoạch khác
    function removePlan(planId) {
        reloadData();
        const index = calendarData.plans.findIndex(function (plan) {
            return plan.id === planId;
        });
        if (index < 0) return; // đã bị xóa ở tab khác
        calendarData.plans.splice(index, 1);
        // Chọn kế hoạch kế tiếp; nếu vừa xóa kế hoạch cuối danh sách thì chọn kế hoạch liền trước
        const nextPlan = calendarData.plans[index] || calendarData.plans[index - 1] || null;
        calendarData.activeId = nextPlan ? nextPlan.id : null;
        saveData();
        if (editingPlanId === planId) resetFormToCreateMode();
        announceStatus("Đã xóa kế hoạch.");
        renderAll();
        // Nút "Xóa" vừa biến mất nên đưa con trỏ bàn phím tới chỗ hợp lý
        const focusTarget = planList.querySelector('[aria-pressed="true"]') || nameInput;
        focusTarget.focus();
    }

    // Tab khác thay đổi dữ liệu -> cập nhật lại màn hình này
    window.addEventListener("storage", function (event) {
        if (event.key !== STORAGE_KEY) return;
        calendarData = loadData();
        if (editingPlanId && !getActivePlan()) resetFormToCreateMode();
        renderAll();
    });

    // ================================================================
    // 6. KHỞI ĐỘNG
    // ================================================================
    warnAboutDuplicateDays();
    resetFormToCreateMode();
    renderAll();
    if (!canUseLocalStorage) showError("Trình duyệt đang chặn lưu trữ nên kế hoạch sẽ mất khi tải lại trang.");
})();