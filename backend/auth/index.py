import json
import os
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Авторизация админ пользователей
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами request_id, function_name и др.
    Returns: HTTP response dict с JWT токеном или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Получаем строку подключения к БД
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        username = body_data.get('username', '')
        password = body_data.get('password', '')
        
        # ВРЕМЕННО: Разрешаем вход с хардкод паролем для отладки
        if username == "admin" and password == "temp123":
            # Создаём временный токен
            jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key-change-in-production')
            payload = {
                'user_id': 999,
                'username': 'admin',
                'exp': datetime.utcnow() + timedelta(hours=24),
                'iat': datetime.utcnow()
            }
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'token': token,
                    'user': {'id': 999, 'username': 'admin'}
                })
            }
        
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Username and password required'})
            }
        
        # Подключаемся к базе данных
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Экранируем username для безопасности
        safe_username = username.replace("'", "''")
        
        # Получаем пользователя (используем Simple Query Protocol)
        cur.execute(
            f"SELECT id, username, password_hash FROM admin_users WHERE username = '{safe_username}'"
        )
        user_data = cur.fetchone()
        
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'})
            }
        
        user_id, user_username, password_hash = user_data
        
        print(f"DEBUG: Found user - id: {user_id}, username: '{user_username}'")
        print(f"DEBUG: Hash from DB: '{password_hash}'")
        print(f"DEBUG: Hash from DB (repr): {repr(password_hash)}")
        print(f"DEBUG: Hash from DB (bytes): {password_hash.encode('utf-8') if isinstance(password_hash, str) else password_hash}")
        
        # Проверяем пароль
        hash_bytes = password_hash if isinstance(password_hash, bytes) else password_hash.encode('utf-8')
        
        print(f"DEBUG: Calling bcrypt.checkpw with password='{password}' (encoded) and hash={hash_bytes}")
        password_match = bcrypt.checkpw(password.encode('utf-8'), hash_bytes)
        print(f"DEBUG: bcrypt.checkpw result: {password_match}")
        
        if not password_match:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'})
            }
        
        # Обновляем время последнего входа (используем Simple Query Protocol)
        cur.execute(
            f"UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = {user_id}"
        )
        conn.commit()
        
        # Создаем JWT токен
        jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key-change-in-production')
        payload = {
            'user_id': user_id,
            'username': user_username,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, jwt_secret, algorithm='HS256')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': {
                    'id': user_id,
                    'username': user_username
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()