-- Run this once in phpMyAdmin on an existing database.
USE relo_mofix_db;

CREATE TABLE IF NOT EXISTS about_content (
    id TINYINT UNSIGNED PRIMARY KEY,
    ar_title VARCHAR(255) NOT NULL,
    en_title VARCHAR(255) NOT NULL,
    ar_text TEXT NOT NULL,
    en_text TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    updated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add the image column when this migration is run after an older about table already exists.
SET @about_image_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'about_content'
      AND COLUMN_NAME = 'image_url'
);
SET @about_image_sql = IF(
    @about_image_column_exists = 0,
    'ALTER TABLE about_content ADD COLUMN image_url VARCHAR(500) NULL AFTER en_text',
    'SELECT 1'
);
PREPARE about_image_statement FROM @about_image_sql;
EXECUTE about_image_statement;
DEALLOCATE PREPARE about_image_statement;