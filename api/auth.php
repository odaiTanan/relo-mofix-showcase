<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

class Auth {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Rate limiting check
    private function checkRateLimit($identifier) {
        $ip = $_SERVER['REMOTE_ADDR'];
        $key = 'rate_limit_' . md5($ip . $identifier);
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = ['count' => 0, 'time' => time()];
        }
        
        $data = $_SESSION[$key];
        
        // Reset if window expired
        if (time() - $data['time'] > RATE_LIMIT_WINDOW) {
            $_SESSION[$key] = ['count' => 0, 'time' => time()];
            $data = $_SESSION[$key];
        }
        
        if ($data['count'] >= RATE_LIMIT_REQUESTS) {
            $this->sendError('Too many requests. Please try again later.', 429);
        }
        
        $_SESSION[$key]['count']++;
    }

    // Generate JWT token
    private function generateJWT($userId, $username) {
        $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
        $payload = json_encode([
            'user_id' => $userId,
            'username' => $username,
            'iat' => time(),
            'exp' => time() + JWT_EXPIRATION
        ]);
        
        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    // Verify JWT token
    private function verifyJWT($token) {
        if (!$token) {
            return null;
        }
        
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return null;
        }
        
        list($header, $payload, $signature) = $tokenParts;
        
        $expectedSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
        $base64UrlExpectedSignature = $this->base64UrlEncode($expectedSignature);
        
        if ($base64UrlExpectedSignature !== $signature) {
            return null;
        }
        
        $decodedPayload = json_decode($this->base64UrlDecode($payload), true);
        
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return null;
        }
        
        return $decodedPayload;
    }

    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    // Get current authenticated user
    public function getCurrentUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = $matches[1];
        $payload = $this->verifyJWT($token);
        
        return $payload;
    }

    // Require authentication
    public function requireAuth() {
        $user = $this->getCurrentUser();
        if (!$user) {
            $this->sendError('Unauthorized', 401);
        }
        return $user;
    }

    // Login
    public function login($username, $password) {
        $this->checkRateLimit('login');
        
        // Input validation
        if (empty($username) || empty($password)) {
            $this->sendError('Username and password are required', 400);
        }
        
        if (strlen($username) < 3 || strlen($username) > 50) {
            $this->sendError('Invalid username', 400);
        }
        
        if (strlen($password) < 8) {
            $this->sendError('Invalid password', 400);
        }
        
        $user = $this->db->fetchOne(
            "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
            [$username]
        );
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->sendError('Invalid credentials', 401);
        }
        
        $token = $this->generateJWT($user['id'], $user['username']);
        
        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username']
            ]
        ];
    }

    // Create initial admin user (run once)
    public function createAdminUser($username, $password) {
        // Check if user already exists
        $existing = $this->db->fetchOne(
            "SELECT id FROM users WHERE username = ? LIMIT 1",
            [$username]
        );
        
        if ($existing) {
            return ['success' => false, 'error' => 'User already exists'];
        }
        
        // Validate password strength
        if (strlen($password) < 12) {
            return ['success' => false, 'error' => 'Password must be at least 12 characters'];
        }
        
        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        
        $this->db->execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, NOW())",
            [$username, $passwordHash]
        );
        
        return ['success' => true, 'message' => 'Admin user created successfully'];
    }

    private function sendError($message, $code) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
        exit();
    }
}

// Handle requests only when this file is called as an endpoint.
// It is also included by works.php for token verification.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $auth = new Auth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        
        $action = $data['action'] ?? '';
        
        switch ($action) {
            case 'login':
                $username = $data['username'] ?? '';
                $password = $data['password'] ?? '';
                echo json_encode($auth->login($username, $password));
                break;
                
            case 'create_admin':
                $username = $data['username'] ?? '';
                $password = $data['password'] ?? '';
                echo json_encode($auth->createAdminUser($username, $password));
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
}
