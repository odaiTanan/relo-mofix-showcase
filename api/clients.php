<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

class ClientsManager {
    private $db;
    private $auth;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }

    private function validateImage($file) {
        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) throw new Exception('A valid logo image is required');
        if (($file['size'] ?? 0) > MAX_FILE_SIZE || !is_uploaded_file($file['tmp_name'])) throw new Exception('Logo image is invalid or exceeds 5MB');
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        if (!in_array($mimeType, ALLOWED_TYPES) || !getimagesize($file['tmp_name'])) throw new Exception('Logo image must be a valid JPG, PNG, WEBP or GIF');
    }

    private function saveImage($file) {
        $this->validateImage($file);
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = bin2hex(random_bytes(8)) . '.' . ($extension ?: 'jpg');
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        $filepath = UPLOAD_DIR . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $filepath)) throw new Exception('Failed to save logo image');
        chmod($filepath, 0644);
        return '/uploads/' . $filename;
    }

    private function deleteImage($url) {
        if ($url && strpos($url, '/uploads/') === 0) {
            $file = __DIR__ . '/..' . $url;
            if (file_exists($file)) unlink($file);
        }
    }

    public function getAll() { return $this->db->fetchAll('SELECT id, logo_url, sort_order FROM clients ORDER BY sort_order ASC, id ASC'); }

    public function create($file) {
        $user = $this->auth->requireAuth();
        $logoUrl = $this->saveImage($file);
        $nextOrder = $this->db->fetchOne('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM clients');
        $this->db->execute('INSERT INTO clients (logo_url, sort_order, created_by) VALUES (?, ?, ?)', [$logoUrl, intval($nextOrder['next_order']), $user['user_id']]);
        return ['success' => true, 'message' => 'Client logo created successfully'];
    }

    public function move($id, $direction) {
        $this->auth->requireAuth();
        if (!in_array($direction, ['up', 'down'])) throw new Exception('A valid direction is required');
        $current = $this->db->fetchOne('SELECT * FROM clients WHERE id = ? LIMIT 1', [intval($id)]);
        if (!$current) throw new Exception('Client not found');
        $operator = $direction === 'up' ? '<' : '>';
        $sort = $direction === 'up' ? 'DESC' : 'ASC';
        $neighbor = $this->db->fetchOne("SELECT * FROM clients WHERE sort_order $operator ? ORDER BY sort_order $sort, id $sort LIMIT 1", [$current['sort_order']]);
        if ($neighbor) {
            $this->db->execute('UPDATE clients SET sort_order = ? WHERE id = ?', [$neighbor['sort_order'], $current['id']]);
            $this->db->execute('UPDATE clients SET sort_order = ? WHERE id = ?', [$current['sort_order'], $neighbor['id']]);
        }
        return ['success' => true];
    }

    public function delete($id) {
        $this->auth->requireAuth();
        $client = $this->db->fetchOne('SELECT logo_url FROM clients WHERE id = ? LIMIT 1', [intval($id)]);
        if (!$client) throw new Exception('Client not found');
        $this->db->execute('DELETE FROM clients WHERE id = ?', [intval($id)]);
        $this->deleteImage($client['logo_url']);
        return ['success' => true];
    }
}

$manager = new ClientsManager();
try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET': echo json_encode(['success' => true, 'data' => $manager->getAll()]); break;
        case 'POST': echo json_encode($manager->create($_FILES['logo'] ?? null)); break;
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
            echo json_encode($manager->move($_GET['id'] ?? 0, $data['direction'] ?? '')); break;
        case 'DELETE': echo json_encode($manager->delete($_GET['id'] ?? 0)); break;
        default: http_response_code(405); echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}