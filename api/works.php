<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

class WorksManager {
    private $db;
    private $auth;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }

    // Sanitize input
    private function sanitize($data) {
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    // Validate image upload
    private function validateImage($file) {
        $uploadError = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($uploadError !== UPLOAD_ERR_OK) {
            $messages = [
                UPLOAD_ERR_INI_SIZE => 'Image exceeds the server upload_max_filesize limit',
                UPLOAD_ERR_FORM_SIZE => 'Image exceeds the form upload limit',
                UPLOAD_ERR_PARTIAL => 'Image upload was interrupted',
                UPLOAD_ERR_NO_FILE => 'No file was selected',
                UPLOAD_ERR_NO_TMP_DIR => 'Server temporary upload directory is missing',
                UPLOAD_ERR_CANT_WRITE => 'Server could not write the uploaded image',
                UPLOAD_ERR_EXTENSION => 'A server extension stopped the image upload',
            ];
            throw new Exception($messages[$uploadError] ?? 'Image upload failed');
        }

        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('Uploaded file was not received by PHP');
        }

        // Check file size
        if ($file['size'] > MAX_FILE_SIZE) {
            throw new Exception('File size exceeds maximum limit');
        }

        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, ALLOWED_TYPES)) {
            throw new Exception('Invalid file type');
        }

        // Check if it's a real image
        if (!getimagesize($file['tmp_name'])) {
            throw new Exception('File is not a valid image');
        }

        return $mimeType;
    }

    // Generate safe filename
    private function generateSafeFilename($originalName) {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $basename = bin2hex(random_bytes(8));
        return $basename . '.' . $extension;
    }

    // Save uploaded image
    private function saveImage($file) {
        $mimeType = $this->validateImage($file);
        
        // Use Cloudinary if enabled
        if (USE_CLOUDINARY) {
            return $this->uploadToCloudinary($file);
        }
        
        // Fallback to local storage
        $extension = $this->getExtensionFromMime($mimeType);
        $filename = $this->generateSafeFilename($file['name']);
        $filepath = UPLOAD_DIR . '/' . $filename;

        // Create upload directory if it doesn't exist
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to save file');
        }

        // Set proper permissions
        chmod($filepath, 0644);

        return '/uploads/' . $filename;
    }

    // Upload to Cloudinary
    private function uploadToCloudinary($file) {
        $timestamp = time();
        $publicId = 'relo_works/' . bin2hex(random_bytes(8));
        
        // Generate signature for unsigned upload
        $params = [
            'timestamp' => $timestamp,
            'upload_preset' => CLOUDINARY_UPLOAD_PRESET,
            'public_id' => $publicId,
            'folder' => 'relo_works'
        ];
        
        // Prepare the file for upload
        $cfile = new CURLFile($file['tmp_name'], $file['type'], $file['name']);
        
        $ch = curl_init();
        $url = 'https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/image/upload';
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, array_merge($params, ['file' => $cfile]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception('Cloudinary upload failed: ' . $error);
        }
        
        $result = json_decode($response, true);
        
        if (isset($result['error'])) {
            throw new Exception('Cloudinary error: ' . $result['error']['message']);
        }
        
        // Return optimized URL with transformations
        return $result['secure_url'] . '?q_auto,f_auto,w_1200';
    }

    // Delete image from Cloudinary
    private function deleteFromCloudinary($publicId) {
        if (!USE_CLOUDINARY) {
            return;
        }
        
        // Extract public ID from URL if it's a Cloudinary URL
        if (strpos($publicId, 'cloudinary') !== false) {
            preg_match('/\/v\d+\/(.+?)\./', $publicId, $matches);
            if (isset($matches[1])) {
                $publicId = $matches[1];
            }
        }
        
        // For unsigned uploads, we need to use the API with credentials
        // This requires the API secret, so we'll skip deletion for now
        // In production, you should implement proper API-based deletion
    }

    private function getExtensionFromMime($mimeType) {
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif'
        ];
        return $mimeMap[$mimeType] ?? 'jpg';
    }

    // Get all works
    public function getAllWorks() {
        return $this->db->fetchAll(
            "SELECT works.id, works.ar_title, works.en_title, works.ar_type, works.en_type,
                    works.tag, works.category_id, works.image_url, works.created_at,
                    categories.slug AS category_slug,
                    categories.ar_name AS category_ar_name,
                    categories.en_name AS category_en_name
             FROM works
             LEFT JOIN categories ON categories.id = works.category_id
             ORDER BY works.created_at DESC"
        );
    }

    private function validateCategory($categoryId) {
        $categoryId = intval($categoryId);
        if ($categoryId < 1 || !$this->db->fetchOne("SELECT id FROM categories WHERE id = ? LIMIT 1", [$categoryId])) {
            throw new Exception('A valid category is required');
        }
        return $categoryId;
    }

    // Get single work
    public function getWork($id) {
        $id = intval($id);
        return $this->db->fetchOne(
            "SELECT * FROM works WHERE id = ? LIMIT 1",
            [$id]
        );
    }

    // Create work
    public function createWork($data, $file = null) {
        $user = $this->auth->requireAuth();

        // Validate required fields
        $required = ['ar_title', 'en_title', 'tag', 'category_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new Exception("Field '$field' is required");
            }
        }

        // Sanitize inputs
        $arTitle = $this->sanitize($data['ar_title']);
        $enTitle = $this->sanitize($data['en_title']);
        $arType = $this->sanitize($data['ar_type'] ?? '');
        $enType = $this->sanitize($data['en_type'] ?? '');
        $tag = $this->sanitize($data['tag']);
        $categoryId = $this->validateCategory($data['category_id']);

        // Handle image upload
        $imageUrl = null;
        if ($file && isset($file['tmp_name'])) {
            try {
                $imageUrl = $this->saveImage($file);
            } catch (Exception $e) {
                throw new Exception('Image upload failed: ' . $e->getMessage());
            }
        }

        // Insert into database
        $this->db->execute(
            "INSERT INTO works (ar_title, en_title, ar_type, en_type, tag, category_id, image_url, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
            [$arTitle, $enTitle, $arType, $enType, $tag, $categoryId, $imageUrl, $user['user_id']]
        );

        return [
            'success' => true,
            'message' => 'Work created successfully',
            'id' => $this->db->lastInsertId()
        ];
    }

    public function createBulkWorks($data, $files) {
        $user = $this->auth->requireAuth();
        $categoryId = $this->validateCategory($data['category_id'] ?? 0);
        $category = $this->db->fetchOne("SELECT slug FROM categories WHERE id = ? LIMIT 1", [$categoryId]);
        $created = 0;

        foreach ($files['name'] as $index => $originalName) {
            if (($files['error'][$index] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                throw new Exception('One of the selected images could not be uploaded');
            }

            $file = [
                'name' => $originalName,
                'type' => $files['type'][$index] ?? '',
                'tmp_name' => $files['tmp_name'][$index] ?? '',
                'error' => $files['error'][$index],
                'size' => $files['size'][$index] ?? 0,
            ];
            $imageUrl = $this->saveImage($file);
            $title = pathinfo($originalName, PATHINFO_FILENAME);
            $title = $this->sanitize($title) ?: 'Untitled work';

            $this->db->execute(
                "INSERT INTO works (ar_title, en_title, ar_type, en_type, tag, category_id, image_url, created_by, created_at)
                 VALUES (?, ?, '', '', ?, ?, ?, ?, NOW())",
                [$title, $title, strtoupper($category['slug']), $categoryId, $imageUrl, $user['user_id']]
            );
            $created++;
        }

        return ['success' => true, 'message' => "$created works created successfully", 'count' => $created];
    }

    // Update work
    public function updateWork($id, $data, $file = null) {
        $user = $this->auth->requireAuth();
        $id = intval($id);

        // Check if work exists
        $existing = $this->getWork($id);
        if (!$existing) {
            throw new Exception('Work not found');
        }

        // Build update query dynamically
        $updates = [];
        $params = [];

        if (!empty($data['ar_title'])) {
            $updates[] = "ar_title = ?";
            $params[] = $this->sanitize($data['ar_title']);
        }
        if (!empty($data['en_title'])) {
            $updates[] = "en_title = ?";
            $params[] = $this->sanitize($data['en_title']);
        }
        if (!empty($data['ar_type'])) {
            $updates[] = "ar_type = ?";
            $params[] = $this->sanitize($data['ar_type']);
        }
        if (!empty($data['en_type'])) {
            $updates[] = "en_type = ?";
            $params[] = $this->sanitize($data['en_type']);
        }
        if (!empty($data['tag'])) {
            $updates[] = "tag = ?";
            $params[] = $this->sanitize($data['tag']);
        }
        if (!empty($data['category_id'])) {
            $updates[] = "category_id = ?";
            $params[] = $this->validateCategory($data['category_id']);
        }

        // Handle image upload
        if ($file && isset($file['tmp_name'])) {
            try {
                $imageUrl = $this->saveImage($file);
                $updates[] = "image_url = ?";
                $params[] = $imageUrl;

                // Delete old image if exists
                if ($existing['image_url']) {
                    if (USE_CLOUDINARY && strpos($existing['image_url'], 'cloudinary') !== false) {
                        $this->deleteFromCloudinary($existing['image_url']);
                    } else {
                        $oldFile = __DIR__ . '/..' . $existing['image_url'];
                        if (file_exists($oldFile)) {
                            unlink($oldFile);
                        }
                    }
                }
            } catch (Exception $e) {
                throw new Exception('Image upload failed: ' . $e->getMessage());
            }
        }

        if (empty($updates)) {
            throw new Exception('No fields to update');
        }

        $params[] = $id;
        $sql = "UPDATE works SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        
        $this->db->execute($sql, $params);

        return [
            'success' => true,
            'message' => 'Work updated successfully'
        ];
    }

    // Delete work
    public function deleteWork($id) {
        $user = $this->auth->requireAuth();
        $id = intval($id);

        // Get work details
        $work = $this->getWork($id);
        if (!$work) {
            throw new Exception('Work not found');
        }

        // Delete image file
        if ($work['image_url']) {
            if (USE_CLOUDINARY && strpos($work['image_url'], 'cloudinary') !== false) {
                $this->deleteFromCloudinary($work['image_url']);
            } else {
                $file = __DIR__ . '/..' . $work['image_url'];
                if (file_exists($file)) {
                    unlink($file);
                }
            }
        }

        // Delete from database
        $this->db->execute("DELETE FROM works WHERE id = ?", [$id]);

        return [
            'success' => true,
            'message' => 'Work deleted successfully'
        ];
    }

    private function sendError($message, $code) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
        exit();
    }
}

// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];
$worksManager = new WorksManager();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                echo json_encode(['success' => true, 'data' => $worksManager->getWork($_GET['id'])]);
            } else {
                echo json_encode(['success' => true, 'data' => $worksManager->getAllWorks()]);
            }
            break;

        case 'POST':
            $data = $_POST;
            if (($data['bulk'] ?? '') === '1' && !empty($_FILES['images']['name']) && is_array($_FILES['images']['name'])) {
                echo json_encode($worksManager->createBulkWorks($data, $_FILES['images']));
                break;
            }
            $file = $_FILES['image'] ?? null;
            echo json_encode($worksManager->createWork($data, $file));
            break;

        case 'PUT':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Work ID is required');
            }
            $data = $_POST;
            $file = $_FILES['image'] ?? null;
            echo json_encode($worksManager->updateWork($id, $data, $file));
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Work ID is required');
            }
            echo json_encode($worksManager->deleteWork($id));
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
