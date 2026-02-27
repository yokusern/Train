-- Database Schema for "Train" (Project Management & Contribution Tracking)
-- Focuses on flexible task management (Notion-like) and gamified contribution points.

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(255),
    role ENUM('member', 'admin') DEFAULT 'member',
    total_points INT DEFAULT 0, -- Overall contribution score
    pending_points INT DEFAULT 0, -- Points awaiting admin approval
    skill_score JSON, -- e.g., {"Development": 1500, "Design": 800, "Planning": 300}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Emoji or icon identifier
    status ENUM('active', 'completed', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Markdown or block-based content
    status ENUM('todo', 'in_progress', 'in_review', 'done') DEFAULT 'todo',
    assignee_id BIGINT UNSIGNED, -- Who is working on it
    difficulty_points INT DEFAULT 10, -- Points awarded upon completion (Weight)
    category VARCHAR(100), -- e.g., 'Development', 'Design' for skill mapping
    deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tracks what happened, who did it, and any points earned
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    project_id BIGINT UNSIGNED,
    action_type ENUM('task_created', 'task_completed', 'comment_added', 'points_awarded') NOT NULL,
    target_id BIGINT UNSIGNED, -- ID of the task or comment
    points_earned INT DEFAULT 0,
    message TEXT, -- e.g., "completed task 'API Design'"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Simple chat/comments attached to tasks or projects
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED, -- Can be null if it's a general project chat
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
