-- MySQL Database Initialization for AI Content Writer
CREATE DATABASE IF NOT EXISTS ai_content_writer;
USE ai_content_writer;

-- Drop table if exists (for fresh start)
DROP TABLE IF EXISTS content;

-- Create content table with proper structure
CREATE TABLE content (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    topic VARCHAR(500) NOT NULL,
    content_type ENUM('BLOG', 'ARTICLE', 'SOCIAL_MEDIA_POST', 
                      'PRODUCT_DESCRIPTION', 'EMAIL', 'LINKEDIN_POST',
                      'WEBSITE_CONTENT', 'ADVERTISEMENT_COPY') NOT NULL DEFAULT 'BLOG',
    tone VARCHAR(50) NOT NULL DEFAULT 'FRIENDLY',
    content TEXT NOT NULL,
    word_count INT DEFAULT 600,
    target_audience VARCHAR(200),
    additional_instructions TEXT,
    created_at TIMESTAMP CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert example system prompt for reference
INSERT INTO content (title, topic, content_type, tone, content, word_count, target_audience, additional_instructions) 
VALUES (
    'Generated Content Template',
    'System Prompt Example',
    'BLOG', 
    'FRIENDLY',
    '-- AI should generate content with: \n- engaging introduction\n- clear sections with headings\n- practical examples\n- actionable conclusion\n- formatted with proper markdown',
    100,
    '',
    ''
);

SELECT 'Database initialized successfully' as status;
