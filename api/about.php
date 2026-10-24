<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

class AboutManager {
    private $db;
    private $auth;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }

    private function clean($value) {
        return htmlspecialchars(strip_tags(trim((string) $value)), ENT_QUOTES, 'UTF-8');
    }

    private function storeImage($file) {
        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || ($file['size'] ?? 0) > MAX_FILE_SIZE || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('A valid image under 5MB is required');
        }
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        if (!in_array($mimeType, ALLOWED_TYPES) || !getimagesize($file['tmp_name'])) throw new Exception('Invalid image type');
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) ?: 'jpg';
        $filename = bin2hex(random_bytes(8)) . '.' . $extension;
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        $filepath = UPLOAD_DIR . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $filepath)) throw new Exception('Failed to save image');
        chmod($filepath, 0644);
        return '/uploads/' . $filename;
    }

    public function get() {
        return $this->db->fetchOne('SELECT ar_title, en_title, ar_text, en_text, image_url FROM about_content WHERE id = 1 LIMIT 1');
    }

    public function save($data) {
        $user = $this->auth->requireAuth();
        foreach (['ar_title', 'en_title', 'ar_text', 'en_text'] as $field) {
            if (empty($data[$field])) throw new Exception("Field '$field' is required");
        }
        $values = [$this->clean($data['ar_title']), $this->clean($data['en_title']), $this->clean($data['ar_text']), $this->clean($data['en_text'])];
        $this->db->execute(
            'INSERT INTO about_content (id, ar_title, en_title, ar_text, en_text, updated_by) VALUES (1, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ar_title = VALUES(ar_title), en_title = VALUES(en_title), ar_text = VALUES(ar_text), en_text = VALUES(en_text), updated_by = VALUES(updated_by)',
            array_merge($values, [$user['user_id']])
        );
        return ['success' => true, 'message' => 'About content saved successfully'];
    }

    public function uploadImage($file) {
        $user = $this->auth->requireAuth();
        $imageUrl = $this->storeImage($file);
        $existing = $this->db->fetchOne('SELECT image_url FROM about_content WHERE id = 1 LIMIT 1');
        if ($existing && $existing['image_url'] && strpos($existing['image_url'], '/uploads/') === 0) {
            $oldFile = __DIR__ . '/..' . $existing['image_url'];
            if (file_exists($oldFile)) unlink($oldFile);
        }
        if ($existing) {
            $this->db->execute('UPDATE about_content SET image_url = ?, updated_by = ? WHERE id = 1', [$imageUrl, $user['user_id']]);
        } else {
            $this->db->execute('INSERT INTO about_content (id, ar_title, en_title, ar_text, en_text, image_url, updated_by) VALUES (1, ?, ?, ?, ?, ?, ?)', ['من نحن', 'About us', '', '', $imageUrl, $user['user_id']]);
        }
        return ['success' => true, 'image_url' => $imageUrl];
    }
}

$manager = new AboutManager();
try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET': echo json_encode(['success' => true, 'data' => $manager->get()]); break;
        case 'PUT': echo json_encode($manager->save(json_decode(file_get_contents('php://input'), true) ?: [])); break;
        case 'POST': echo json_encode($manager->uploadImage($_FILES['image'] ?? null)); break;
        default: http_response_code(405); echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}