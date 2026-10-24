-- Run this once in phpMyAdmin on an existing database.
USE relo_mofix_db;

CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ar_quote TEXT NOT NULL,
    en_quote TEXT NOT NULL,
    ar_name VARCHAR(150) NOT NULL,
    en_name VARCHAR(150) NOT NULL,
    ar_role VARCHAR(150) NOT NULL,
    en_role VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_testimonials_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;