import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import usePushNotifications from '@/hooks/usePushNotifications';

interface AnalyticsData {
  period_days: number;
  action_types: Array<{action_type: string; count: number}>;
  daily_stats: Array<{date: string; actions: number; sessions: number; visitors: number}>;
  popular_pages: Array<{url: string; visits: number; unique_visits: number}>;
  hourly_stats: Array<{hour: number; actions: number}>;
  browser_stats: Array<{browser: string; count: number}>;
  summary: {
    total_actions: number;
    unique_sessions: number;
    unique_visitors: number;
  };
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSupported, isSubscribed, subscribe, sendTestNotification } = usePushNotifications();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    fetchAnalytics();
  }, [period, navigate]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/90baacc3-9672-4e72-8453-a68fc83256e2?days=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Не удалось загрузить данные аналитики',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertTriangle" className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
          <p>Не удалось загрузить данные</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="BarChart3" className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Админ-панель КрымБлок</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="period-select" className="text-sm font-medium">
                Период:
              </label>
              <select
                id="period-select"
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value={1}>1 день</option>
                <option value={7}>7 дней</option>
                <option value={30}>30 дней</option>
                <option value={90}>90 дней</option>
              </select>
            </div>
            
            {isSupported && (
              <Button 
                variant={isSubscribed ? "default" : "outline"} 
                onClick={isSubscribed ? () => sendTestNotification('Тест', 'Тестовое уведомление от КрымБлок') : subscribe}
              >
                <Icon name="Bell" className="mr-2 h-4 w-4" />
                {isSubscribed ? 'Тест уведомления' : 'Включить уведомления'}
              </Button>
            )}
            
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего действий</CardTitle>
              <Icon name="Activity" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.total_actions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                за последние {analytics.period_days} дней
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Уникальные сессии</CardTitle>
              <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.unique_sessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                активные пользователи
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Уникальные посетители</CardTitle>
              <Icon name="UserCheck" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.unique_visitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                по IP адресам
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Активность по дням</CardTitle>
              <CardDescription>
                Действия, сессии и посетители за период
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.daily_stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="actions" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Действия"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Сессии"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Посетители"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Активность по часам</CardTitle>
              <CardDescription>
                Распределение активности в течение дня
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.hourly_stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="actions" fill="#22c55e" name="Действия" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Action Types */}
          <Card>
            <CardHeader>
              <CardTitle>Типы действий</CardTitle>
              <CardDescription>
                Наиболее популярные действия пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.action_types}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" name="Количество" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Browser Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Браузеры</CardTitle>
              <CardDescription>
                Распределение пользователей по браузерам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.browser_stats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ browser, percent }) => `${browser} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.browser_stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Популярные страницы</CardTitle>
            <CardDescription>
              Самые посещаемые страницы сайта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popular_pages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {page.url || 'Главная страница'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {page.unique_visits} уникальных просмотров
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {page.visits} посещений
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}