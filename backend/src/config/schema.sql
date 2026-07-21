-- ============================================================
--  Student Tools - Database Schema (MySQL)
-- ============================================================
--  Run this once to create the database and all tables.
--  You can also run `npm run db:init` which executes this file.
-- ============================================================

CREATE DATABASE IF NOT EXISTS student_tools
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_tools;

-- ------------------------------------------------------------
--  Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  student_id    VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt hash, never plain text
  university    VARCHAR(160),
  course        VARCHAR(160),
  created_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  Documents (uploaded PDFs / notes, shared by several tools)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  stored_name   VARCHAR(255) NOT NULL,          -- name on disk / storage key
  mime_type     VARCHAR(100),
  extracted_text LONGTEXT,
  uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Paraphrase / Writing Improvement history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paraphrase_history (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  original_text  LONGTEXT NOT NULL,
  rewritten_text LONGTEXT NOT NULL,
  style          VARCHAR(30),                   -- simple | academic | professional | short
  created_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Similarity reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS similarity_reports (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT NOT NULL,
  document_name        VARCHAR(255) NOT NULL,
  similarity_percentage DECIMAL(5,2) NOT NULL,
  details_json         JSON,                    -- per-section breakdown
  report_date          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Summaries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS summaries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  file_name    VARCHAR(255),
  summary      LONGTEXT NOT NULL,
  summary_type VARCHAR(30),                     -- short | detailed | exam_notes
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Citations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  source_type    VARCHAR(30),                   -- book | journal | website
  citation_style VARCHAR(30),                   -- apa7 | mla | harvard ...
  citation_text  TEXT NOT NULL,
  created_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Study plans
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  subject     VARCHAR(160) NOT NULL,
  task        VARCHAR(255),
  plan_date   DATE,
  start_time  TIME,
  end_time    TIME,
  status      VARCHAR(20) DEFAULT 'pending',    -- pending | done
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Research Assistant history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS research_history (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  topic        VARCHAR(255) NOT NULL,
  depth        VARCHAR(20),                      -- quick | deep
  content      LONGTEXT NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  NOTE ON PROGRESS
--  We intentionally do NOT store a "progress" table.
--  Progress (counts, study hours, %) is COMPUTED on the fly
--  from the tables above, so the numbers can never go stale.
-- ------------------------------------------------------------
