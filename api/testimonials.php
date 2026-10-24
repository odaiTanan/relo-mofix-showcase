<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

class TestimonialsManager {
    private $db;
    private $auth;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }

    private function clean($value) {
        return htmlspecialchars(strip_tags(trim((string) $value)), ENT_QUOTES, 'UTF-8');
    }

    private function required($data, $field) {
        if (empty($data[$field])) throw new Exception("Field '$field' is required");
        return $this->clean($data[$field]);
    }

    public function getAll() {
        return $this->db->fetchAll('SELECT id, ar_quote, en_quote, ar_name, en_name, ar_role, en_role, sort_order FROM testimonials ORDER BY sort_order ASC, id ASC');
    }

    public function create($data) {
        $user = $this->auth->requireAuth();
        $values = [
            $this->required($data, 'ar_quote'), $this->required($data, 'en_quote'),
            $this->required($data, 'ar_name'), $this->required($data, 'en_name'),
            $this->required($data, 'ar_role'), $this->required($data, 'en_role'),
        ];
        $nextOrder = $this->db->fetchOne('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM testimonials');
        $this->db->execute('INSERT INTO testimonials (ar_quote, en_quote, ar_name, en_name, ar_role, en_role, sort_order, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', array_merge($values, [intval($nextOrder['next_order']), $user['user_id']]));
        return ['success' => true, 'message' => 'Testimonial created successfully'];
    }

    public function move($id, $direction) {
        $this->auth->requireAuth();
        if (!in_array($direction, ['up', 'down'])) throw new Exception('A valid direction is required');
        $current = $this->db->fetchOne('SELECT * FROM testimonials WHERE id = ? LIMIT 1', [intval($id)]);
        if (!$current) throw new Exception('Testimonial not found');
        $operator = $direction === 'up' ? '<' : '>';
        $sort = $direction === 'up' ? 'DESC' : 'ASC';
        $neighbor = $this->db->fetchOne("SELECT * FROM testimonials WHERE sort_order $operator ? ORDER BY sort_order $sort, id $sort LIMIT 1", [$current['sort_order']]);
        if ($neighbor) {
            $this->db->execute('UPDATE testimonials SET sort_order = ? WHERE id = ?', [$neighbor['sort_order'], $current['id']]);
            $this->db->execute('UPDATE testimonials SET sort_order = ? WHERE id = ?', [$current['sort_order'], $neighbor['id']]);
        }
        return ['success' => true];
    }

    public function delete($id) {
        $this->auth->requireAuth();
        $this->db->execute('DELETE FROM testimonials WHERE id = ?', [intval($id)]);
        return ['success' => true];
    }
}

$manager = new TestimonialsManager();
try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET': echo json_encode(['success' => true, 'data' => $manager->getAll()]); break;
        case 'POST': echo json_encode($manager->create(json_decode(file_get_contents('php://input'), true) ?: [])); break;
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