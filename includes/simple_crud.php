<?php
// Trang CRUD đơn giản dùng chung cho categories, growth_stages, symptoms.
// $cfg: table, title, active, slug (bool), fields [name => [label,type,options?,required?]], list [col => label],
//       order, in_use_msg. Checkbox fields can persist their values through a configured relation table.
require_once __DIR__ . '/auth.php';
function simple_crud(array $cfg) {
    require_login();
    $table = $cfg['table'];
    if (!in_array($table, ['categories', 'growth_stages', 'symptoms'], true)) throw new InvalidArgumentException('table');
    $fields = $cfg['fields'];
    $editId = (int)($_GET['edit'] ?? 0);
    $errors = [];
    $row = $editId ? q("SELECT * FROM $table WHERE id = ?", [$editId])->fetch() : null;
    if ($editId && !$row) { flash('error', 'Không tìm thấy mục cần sửa.'); redirect($cfg['self']); }
    $data = $row ?: array_fill_keys(array_keys($fields), '');
    foreach ($fields as $k => $f) {
        if (($f['type'] ?? '') === 'checkboxes') {
            $data[$k] = $row ? [] : ($f['default'] ?? []);
            if ($row && !empty($f['relation'])) {
                $relation = $f['relation'];
                $data[$k] = q("SELECT {$relation['value_column']} FROM {$relation['table']} WHERE {$relation['foreign_key']} = ?",
                              [$editId])->fetchAll(PDO::FETCH_COLUMN);
                if (!$data[$k] && isset($row[$k])) $data[$k] = [$row[$k]];
            }
        }
    }
    if (!$row && isset($fields['sort_order'])) $data['sort_order'] = 0;
    if (!$row && isset($fields['body_part']) && ($fields['body_part']['type'] ?? '') !== 'checkboxes') $data['body_part'] = 'leaf';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        csrf_verify();
        $action = $_POST['action'] ?? 'save';
        if ($action === 'delete') {
            try { q("DELETE FROM $table WHERE id = ?", [(int)$_POST['id']]); flash('success', 'Đã xóa.'); }
            catch (PDOException $ex) { flash('error', $cfg['in_use_msg'] ?? 'Không xóa được vì đang được sử dụng.'); }
            redirect($cfg['self']);
        }
        if ($action === 'delete_all') {
            try {
                $deleted = q("DELETE FROM $table")->rowCount();
                flash($deleted ? 'success' : 'info', $deleted ? 'Đã xóa tất cả mục.' : 'Không có mục nào để xóa.');
            } catch (PDOException $ex) {
                flash('error', $cfg['in_use_msg'] ?? 'Không xóa được vì đang có mục được sử dụng.');
            }
            redirect($cfg['self']);
        }
        foreach ($fields as $k => $f) {
            if (($f['type'] ?? '') === 'checkboxes') {
                $selected = $_POST[$k] ?? [];
                if (!is_array($selected)) $selected = [];
                $selected = array_map('strval', $selected);
                $invalid = array_diff($selected, array_keys($f['options']));
                if ($invalid) $errors[] = $f['label'] . ' không hợp lệ.';
                $data[$k] = array_values(array_intersect(array_keys($f['options']), $selected));
            } else {
                $data[$k] = trim($_POST[$k] ?? '');
            }
            if (!empty($f['required']) && ($data[$k] === '' || $data[$k] === [])) $errors[] = $f['label'] . ' không được để trống.';
        }
        if (isset($fields['body_part']) && ($fields['body_part']['type'] ?? '') !== 'checkboxes'
            && !isset($fields['body_part']['options'][$data['body_part']])) $errors[] = 'Bộ phận không hợp lệ.';
        if (!empty($cfg['unique_name']) && !$errors && q("SELECT id FROM $table WHERE name = ? AND id <> ?", [$data['name'], $editId])->fetch()) $errors[] = 'Tên này đã tồn tại.';
        if (!$errors) {
            $vals = [];
            foreach ($fields as $k => $f) {
                if (($f['type'] ?? '') === 'checkboxes') {
                    if (isset($f['relation']) && $k === 'body_part') $vals[$k] = $data[$k][0];
                    continue;
                }
                $vals[$k] = ($f['type'] ?? '') === 'number' ? (int)$data[$k] : ($data[$k] !== '' ? $data[$k] : null);
            }
            if (!empty($cfg['slug'])) $vals['slug'] = unique_slug($table, slugify($data['name']), $editId);
            $pdo = db();
            $pdo->beginTransaction();
            try {
                if ($row) {
                    $set = implode(', ', array_map(fn($k) => "$k = ?", array_keys($vals)));
                    q("UPDATE $table SET $set WHERE id = ?", array_merge(array_values($vals), [$editId]));
                    $savedId = $editId;
                } else {
                    $cols = implode(', ', array_keys($vals)); $ph = implode(', ', array_fill(0, count($vals), '?'));
                    q("INSERT INTO $table ($cols) VALUES ($ph)", array_values($vals));
                    $savedId = (int)$pdo->lastInsertId();
                }
                foreach ($fields as $k => $f) {
                    if (($f['type'] ?? '') !== 'checkboxes' || empty($f['relation'])) continue;
                    $relation = $f['relation'];
                    q("DELETE FROM {$relation['table']} WHERE {$relation['foreign_key']} = ?", [$savedId]);
                    foreach ($data[$k] as $value) {
                        q("INSERT INTO {$relation['table']} ({$relation['foreign_key']}, {$relation['value_column']}) VALUES (?,?)",
                          [$savedId, $value]);
                    }
                }
                $pdo->commit();
            } catch (Throwable $ex) {
                $pdo->rollBack();
                throw $ex;
            }
            flash('success', $row ? 'Đã cập nhật.' : 'Đã thêm.');
            redirect($cfg['self']);
        }
    }
    $rows = q("SELECT * FROM $table ORDER BY " . $cfg['order'])->fetchAll();
    $relationValues = [];
    foreach ($fields as $k => $f) {
        if (($f['type'] ?? '') !== 'checkboxes' || empty($f['relation'])) continue;
        $relation = $f['relation'];
        $relations = q("SELECT {$relation['foreign_key']}, {$relation['value_column']} FROM {$relation['table']}")->fetchAll();
        foreach ($relations as $item) $relationValues[$k][$item[$relation['foreign_key']]][] = $item[$relation['value_column']];
    }
    $page_title = $cfg['title']; $active = $cfg['active'];
    require __DIR__ . '/admin_header.php';
    ?>
    <h1 class="h3 mb-3"><?= e($cfg['title']) ?></h1>
    <div class="row g-4">
      <div class="col-lg-4"><div class="card"><div class="card-header fw-semibold"><?= $row ? 'Sửa' : 'Thêm mới' ?></div><div class="card-body">
        <?php foreach ($errors as $er): ?><div class="alert alert-danger py-2"><?= e($er) ?></div><?php endforeach; ?>
        <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="save">
          <?php foreach ($fields as $k => $f): $t = $f['type'] ?? 'text'; ?>
            <div class="mb-3"><label class="form-label fw-semibold" <?= $t !== 'checkboxes' ? 'for="f_' . e($k) . '"' : '' ?>><?= e($f['label']) ?><?= !empty($f['required']) ? ' *' : '' ?></label>
              <?php if ($t === 'textarea'): ?><textarea class="form-control" id="f_<?= e($k) ?>" name="<?= e($k) ?>" rows="3"><?= e($data[$k]) ?></textarea>
              <?php elseif ($t === 'checkboxes'): ?><div id="f_<?= e($k) ?>">
                <?php foreach ($f['options'] as $ov => $ol): $optionId = 'f_' . $k . '_' . $ov; ?>
                  <div class="form-check"><input class="form-check-input" type="checkbox" id="<?= e($optionId) ?>" name="<?= e($k) ?>[]" value="<?= e($ov) ?>" <?= in_array((string)$ov, array_map('strval', $data[$k]), true) ? 'checked' : '' ?>>
                    <label class="form-check-label" for="<?= e($optionId) ?>"><?= e($ol) ?></label></div>
                <?php endforeach; ?>
              </div>
              <?php elseif ($t === 'select'): ?><select class="form-select" id="f_<?= e($k) ?>" name="<?= e($k) ?>">
                <?php foreach ($f['options'] as $ov => $ol): ?><option value="<?= e($ov) ?>" <?= (string)$data[$k] === (string)$ov ? 'selected' : '' ?>><?= e($ol) ?></option><?php endforeach; ?></select>
              <?php else: ?><input class="form-control" id="f_<?= e($k) ?>" type="<?= $t === 'number' ? 'number' : 'text' ?>" name="<?= e($k) ?>" value="<?= e($data[$k]) ?>" <?= !empty($f['required']) ? 'required' : '' ?>><?php endif; ?>
            </div>
          <?php endforeach; ?>
          <button class="btn btn-danger"><?= $row ? 'Cập nhật' : 'Thêm' ?></button>
          <?php if ($row): ?><a class="btn btn-outline-secondary" href="<?= url($cfg['self']) ?>">Hủy</a><?php endif; ?>
        </form></div></div></div>
      <div class="col-lg-8"><div class="table-responsive card"><table class="table table-hover table-admin mb-0">
        <thead><tr><?php foreach ($cfg['list'] as $label): ?><th><?= e($label) ?></th><?php endforeach; ?><th></th></tr></thead><tbody>
        <?php if (!$rows): ?><tr><td colspan="<?= count($cfg['list']) + 1 ?>" class="text-center text-muted py-4">Chưa có dữ liệu.</td></tr><?php endif; ?>
        <?php foreach ($rows as $r): ?><tr>
          <?php foreach ($cfg['list'] as $col => $label): $v = $r[$col];
            if (($fields[$col]['type'] ?? '') === 'checkboxes') {
                $selected = $relationValues[$col][$r['id']] ?? [$v];
                $v = implode(', ', array_map(fn($value) => $fields[$col]['options'][$value] ?? $value, $selected));
            } elseif (isset($fields[$col]['options'][$v])) $v = $fields[$col]['options'][$v]; ?><td><?= e($v) ?></td><?php endforeach; ?>
          <td class="text-end text-nowrap"><a class="btn btn-sm btn-outline-primary" href="<?= url($cfg['self'] . '?edit=' . (int)$r['id']) ?>">Sửa</a>
            <form method="post" class="d-inline" data-confirm="Xóa mục này?"><?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <button class="btn btn-sm btn-outline-danger">Xóa</button></form></td></tr>
        <?php endforeach; ?></tbody></table></div>
        <div class="d-flex justify-content-end mt-3">
          <form method="post" data-confirm="Xóa tất cả mục trong danh sách? Thao tác này không thể hoàn tác."><?= csrf_field() ?>
            <input type="hidden" name="action" value="delete_all">
            <button class="btn btn-danger">Xóa tất cả</button>
          </form>
        </div>
      </div>
    </div>
    <?php
    require __DIR__ . '/admin_footer.php';
}
