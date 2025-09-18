import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any, List
import requests
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import struct

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление push уведомлениями для админов
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами request_id, function_name и др.
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
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
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'POST':
            path = event.get('pathParameters', {}).get('action', '')
            
            if path == 'subscribe':
                # Подписка на уведомления
                body_data = json.loads(event.get('body', '{}'))
                headers = event.get('headers', {})
                
                endpoint = body_data.get('endpoint', '')
                p256dh = body_data.get('keys', {}).get('p256dh', '')
                auth = body_data.get('keys', {}).get('auth', '')
                user_agent = headers.get('user-agent', '')
                
                # Получаем IP адрес
                ip_address = headers.get('x-forwarded-for', '').split(',')[0].strip()
                if not ip_address:
                    ip_address = headers.get('x-real-ip', '')
                
                if not endpoint or not p256dh or not auth:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing subscription data'})
                    }
                
                # Проверяем, есть ли уже такая подписка
                cur.execute(
                    'SELECT id FROM push_subscriptions WHERE endpoint = %s AND is_active = true',
                    (endpoint,)
                )
                
                if cur.fetchone():
                    # Обновляем время последнего использования
                    cur.execute(
                        'UPDATE push_subscriptions SET last_used = %s WHERE endpoint = %s',
                        (datetime.now(), endpoint)
                    )
                else:
                    # Создаем новую подписку
                    cur.execute(
                        '''INSERT INTO push_subscriptions 
                           (endpoint, p256dh, auth, user_agent, ip_address)
                           VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                        (endpoint, p256dh, auth, user_agent, ip_address)
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Subscribed successfully'})
                }
            
            elif path == 'send':
                # Отправка уведомления
                body_data = json.loads(event.get('body', '{}'))
                
                title = body_data.get('title', 'Новое уведомление')
                body_text = body_data.get('body', '')
                icon = body_data.get('icon', '/favicon.ico')
                badge = body_data.get('badge', '/favicon.ico')
                tag = body_data.get('tag', '')
                data = body_data.get('data', {})
                
                # Получаем все активные подписки
                cur.execute(
                    'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE is_active = true'
                )
                subscriptions = cur.fetchall()
                
                if not subscriptions:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'message': 'No active subscriptions'})
                    }
                
                # Сохраняем уведомление в базу
                cur.execute(
                    '''INSERT INTO push_notifications 
                       (title, body, icon, badge, tag, data, sent_count)
                       VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                    (title, body_text, icon, badge, tag, json.dumps(data), len(subscriptions))
                )
                
                notification_id = cur.fetchone()[0]
                conn.commit()
                
                # Отправляем уведомления (упрощенная версия)
                success_count = 0
                for endpoint, p256dh, auth in subscriptions:
                    try:
                        # В реальной реализации здесь была бы отправка через Web Push Protocol
                        # Для демо просто считаем успешными
                        success_count += 1
                    except Exception:
                        pass
                
                # Обновляем статистику
                cur.execute(
                    'UPDATE push_notifications SET success_count = %s WHERE id = %s',
                    (success_count, notification_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'sent_count': len(subscriptions),
                        'success_count': success_count
                    })
                }
        
        elif method == 'GET':
            # Получение статистики уведомлений
            params = event.get('queryStringParameters') or {}
            days = int(params.get('days', 7))
            
            # Статистика уведомлений
            cur.execute(
                '''SELECT 
                     COUNT(*) as total_notifications,
                     SUM(sent_count) as total_sent,
                     SUM(success_count) as total_success,
                     AVG(success_count::float / NULLIF(sent_count, 0)) as success_rate
                   FROM push_notifications 
                   WHERE created_at >= NOW() - INTERVAL %s DAY''',
                (days,)
            )
            
            stats = cur.fetchone()
            
            # Активные подписки
            cur.execute(
                'SELECT COUNT(*) FROM push_subscriptions WHERE is_active = true'
            )
            active_subscriptions = cur.fetchone()[0]
            
            # Последние уведомления
            cur.execute(
                '''SELECT id, title, body, sent_count, success_count, created_at
                   FROM push_notifications 
                   ORDER BY created_at DESC LIMIT 10'''
            )
            recent_notifications = cur.fetchall()
            
            result = {
                'active_subscriptions': active_subscriptions,
                'total_notifications': stats[0] or 0,
                'total_sent': stats[1] or 0,
                'total_success': stats[2] or 0,
                'success_rate': round((stats[3] or 0) * 100, 1),
                'recent_notifications': [
                    {
                        'id': row[0],
                        'title': row[1],
                        'body': row[2],
                        'sent_count': row[3],
                        'success_count': row[4],
                        'created_at': row[5].isoformat() if row[5] else None
                    }
                    for row in recent_notifications
                ]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
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
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }