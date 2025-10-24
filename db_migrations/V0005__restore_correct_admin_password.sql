-- Восстанавливаем правильный bcrypt хеш для пароля "admin"
UPDATE admin_users 
SET password_hash = '$2b$12$GXE0.vjwxkWTpBCb9h.kT.QHaJlkOhw8z7e7kVHaojJNr6J.yYCqC'
WHERE username = 'admin';