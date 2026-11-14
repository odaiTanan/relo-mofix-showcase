-- Run once on an existing installation after migration_categories.sql.
-- All new columns are optional so existing works remain compatible.
ALTER TABLE works
    ADD COLUMN slug VARCHAR(120) NULL UNIQUE AFTER id,
    ADD COLUMN result_value VARCHAR(120) NULL AFTER image_url,
    ADD COLUMN result_label VARCHAR(255) NULL AFTER result_value,
    ADD COLUMN problem TEXT NULL AFTER result_label,
    ADD COLUMN solution TEXT NULL AFTER problem,
    ADD COLUMN testimonial TEXT NULL AFTER solution,
    ADD COLUMN external_url VARCHAR(500) NULL AFTER testimonial,
    ADD COLUMN embed_code TEXT NULL AFTER external_url,
    ADD COLUMN sort_order INT NOT NULL DEFAULT 0 AFTER embed_code,
    ADD INDEX idx_works_sort_order (sort_order);