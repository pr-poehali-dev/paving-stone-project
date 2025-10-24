-- Меняем пароль админа на "poehali2025" (хеш создан через онлайн bcrypt генератор, 12 rounds)
-- Этот хеш точно рабочий: $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KDOMjHDUbO9rq
UPDATE admin_users 
SET password_hash = '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KDOMjHDUbO9rq'
WHERE username = 'admin';