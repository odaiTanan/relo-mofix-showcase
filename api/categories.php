<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

class CategoriesManager {
    private $db;
    private $auth;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }

    private function clean($value) {
        return htmlspecialchars(strip_tags(trim((string) $value)), ENT_QUOTES, 'UTF-8');
    }

    public function getAll() {
        return $this->db->fetchAll(
            "SELECT categories.id, categories.slug, categories.ar_name, categories.en_name,
                    COUNT(works.id) AS works_count
             FROM categories
             LEFT JOIN works ON works.category_id = categories.id
             GROUP BY categories.id
             ORDER BY categories.created_at ASC"
        );
    }

    public function create($data) {
        $user = $this->auth->requireAuth();
        $arName = $this->clean($data['ar_name'] ?? '');
        $enName = $this->clean($data['en_name'] ?? '');
        $slug = strtolower(trim($data['slug'] ?? ''));

        if (!$arName || !$enName || !preg_match('/^[a-z0-9-]+$/', $slug)) {
            throw new Exception('Category names and a valid slug are required');
        }

        $this->db->execute(
            "INSERT INTO categories (slug, ar_name, en_name, created_by) VALUES (?, ?, ?, ?)",
            [$slug, $arName, $enName, $user['user_id']]
        );

        return ['success' => true, 'id' => $this->db->lastInsertId()];
    }

    public function update($id, $data) {
        $this->auth->requireAuth();
        $arName = $this->clean($data['ar_name'] ?? '');
        $enName = $this->clean($data['en_name'] ?? '');
        $slug = strtolower(trim($data['slug'] ?? ''));

        if (!$arName || !$enName || !preg_match('/^[a-z0-9-]+$/', $slug)) {
            throw new Exception('Category names and a valid slug are required');
        }

        $this->db->execute(
            "UPDATE categories SET slug = ?, ar_name = ?, en_name = ? WHERE id = ?",
            [$slug, $arName, $enName, intval($id)]
        );

        return ['success' => true];
    }

    public function delete($id) {
        $this->auth->requireAuth();
        $this->db->execute("DELETE FROM categories WHERE id = ?", [intval($id)]);
        return ['success' => true];
    }
}

$manager = new CategoriesManager();
try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            echo json_encode(['success' => true, 'data' => $manager->getAll()]);
            break;
        case 'POST':
            echo json_encode($manager->create($_POST ?: (json_decode(file_get_contents('php://input'), true) ?? [])));
            break;
        case 'PUT':
            echo json_encode($manager->update($_GET['id'] ?? 0, json_decode(file_get_contents('php://input'), true) ?? []));
            break;
        case 'DELETE':
            echo json_encode($manager->delete($_GET['id'] ?? 0));
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}