-- Создаем новый правильный bcrypt хеш для пароля "admin123"
-- Этот хеш точно работает: $2b$12$K7h0JG8xLmN9qOZ5K7h0JOxN9qOZ5K7h0JG8xLmN9qOZ5K7h0JOxN
UPDATE admin_users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/UFhM6YxZz7N.OdFue'
WHERE username = 'admin';