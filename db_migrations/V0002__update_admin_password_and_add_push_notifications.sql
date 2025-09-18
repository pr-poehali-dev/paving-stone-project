-- Обновляем пароль для админа (пароль: admin)
-- Хеш сгенерирован с помощью bcrypt для пароля "admin"
UPDATE admin_users 
SET password_hash = '$2b$12$GXE0.vjwxkWTpBCb9h.kT.QHaJlkOhw8z7e7kVHaojJNr6J.yYCqC'
WHERE username = 'admin';

-- Добавляем таблицу для push уведомлений
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Индекс для быстрого поиска активных подписок
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Таблица для отправленных уведомлений
CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    icon VARCHAR(255),
    badge VARCHAR(255),
    tag VARCHAR(100),
    data JSONB,
    sent_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для статистики уведомлений
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_at ON push_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_push_notifications_tag ON push_notifications(tag);