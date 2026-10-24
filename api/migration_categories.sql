-- Run once on an existing installation after schema.sql was imported.
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    ar_name VARCHAR(100) NOT NULL,
    en_name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE works
    MODIFY class_name VARCHAR(50) NULL,
    ADD COLUMN category_id INT NULL AFTER class_name,
    ADD CONSTRAINT fk_works_category
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;