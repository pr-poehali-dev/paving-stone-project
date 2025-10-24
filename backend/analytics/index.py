import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Сохранение статистики действий пользователей и получение аналитики
    Args: event - dict с httpMethod, body, headers, queryStringParameters
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        # Подключаемся к базе данных
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'POST':
            # Сохранение действия пользователя
            body_data = json.loads(event.get('body', '{}'))
            headers = event.get('headers', {})
            
            # Извлекаем данные
            session_id = body_data.get('session_id', '')
            action_type = body_data.get('action_type', '')
            action_details = body_data.get('action_details', {})
            page_url = body_data.get('page_url', '')
            referrer = body_data.get('referrer', '')
            user_agent = headers.get('user-agent', '')
            
            # Получаем IP адрес
            ip_address = headers.get('x-forwarded-for', '').split(',')[0].strip()
            if not ip_address:
                ip_address = headers.get('x-real-ip', '0.0.0.0')
            if not ip_address or ip_address == '':
                ip_address = '0.0.0.0'
            
            # Сохраняем в базу
            insert_query = '''
                INSERT INTO user_actions 
                (session_id, user_agent, ip_address, action_type, action_details, page_url, referrer)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            '''
            
            cur.execute(insert_query, (
                session_id, user_agent, ip_address, action_type, 
                json.dumps(action_details), page_url, referrer
            ))
            
            action_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'action_id': action_id})
            }
        
        elif method == 'GET':
            # Получение аналитики
            params = event.get('queryStringParameters') or {}
            days = int(params.get('days', 7))
            
            # Формируем интервал для SQL
            interval = f"{days} days"
            
            # Общая статистика
            summary_query = f"""
                SELECT 
                    COUNT(*) as total_actions,
                    COUNT(DISTINCT session_id) as unique_sessions,
                    COUNT(DISTINCT ip_address) as unique_visitors
                FROM user_actions 
                WHERE timestamp >= NOW() - INTERVAL '{interval}'
            """
            
            cur.execute(summary_query)
            summary_row = cur.fetchone()
            
            # Статистика по типам действий
            action_types_query = f"""
                SELECT 
                    action_type,
                    COUNT(*) as action_count
                FROM user_actions 
                WHERE timestamp >= NOW() - INTERVAL '{interval}'
                GROUP BY action_type
                ORDER BY action_count DESC
            """
            
            cur.execute(action_types_query)
            action_stats = cur.fetchall()
            
            # Статистика по дням
            daily_query = f"""
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as actions,
                    COUNT(DISTINCT session_id) as sessions,
                    COUNT(DISTINCT ip_address) as visitors
                FROM user_actions 
                WHERE timestamp >= NOW() - INTERVAL '{interval}'
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
            """
            
            cur.execute(daily_query)
            daily_stats = cur.fetchall()
            
            # Популярные страницы
            pages_query = f"""
                SELECT 
                    page_url,
                    COUNT(*) as visits,
                    COUNT(DISTINCT session_id) as unique_visits
                FROM user_actions 
                WHERE timestamp >= NOW() - INTERVAL '{interval}'
                AND page_url IS NOT NULL AND page_url != ''
                GROUP BY page_url
                ORDER BY visits DESC
                LIMIT 10
            """
            
            cur.execute(pages_query)
            popular_pages = cur.fetchall()
            
            # Статистика по часам
            hourly_query = f"""
                SELECT 
                    EXTRACT(HOUR FROM timestamp) as hour,
                    COUNT(*) as actions
                FROM user_actions 
                WHERE timestamp >= NOW() - INTERVAL '{interval}'
                GROUP BY EXTRACT(HOUR FROM timestamp)
                ORDER BY hour
            """
            
            cur.execute(hourly_query)
            hourly_stats = cur.fetchall()
            
            # Браузеры и устройства
            browsers_query = f"""
                SELECT 
                    CASE 
                        WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
                        WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
                        WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari'
                        WHEN user_agent LIKE '%Edge%' THEN 'Edge'
                        ELSE 'Other'
                    END as browser,
                    COUNT(*) as count
                FROM user_actions 
                WHERE timestamp >= NOW() - INTERVAL '{interval}'
                AND user_agent IS NOT NULL
                GROUP BY browser
                ORDER BY count DESC
            """
            
            cur.execute(browsers_query)
            browser_stats = cur.fetchall()
            
            # Формируем ответ
            result = {
                'period_days': days,
                'action_types': [
                    {'action_type': row[0], 'count': row[1]} 
                    for row in action_stats
                ],
                'daily_stats': [
                    {
                        'date': row[0].isoformat() if hasattr(row[0], 'isoformat') else str(row[0]),
                        'actions': row[1],
                        'sessions': row[2],
                        'visitors': row[3]
                    }
                    for row in daily_stats
                ],
                'popular_pages': [
                    {
                        'url': row[0],
                        'visits': row[1],
                        'unique_visits': row[2]
                    }
                    for row in popular_pages
                ],
                'hourly_stats': [
                    {'hour': int(row[0]), 'actions': row[1]}
                    for row in hourly_stats
                ],
                'browser_stats': [
                    {'browser': row[0], 'count': row[1]}
                    for row in browser_stats
                ],
                'summary': {
                    'total_actions': summary_row[0] if summary_row else 0,
                    'unique_sessions': summary_row[1] if summary_row else 0,
                    'unique_visitors': summary_row[2] if summary_row else 0
                }
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