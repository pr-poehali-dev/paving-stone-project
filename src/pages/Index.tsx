import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function Index() {
  const products = [
    {
      title: 'Тротуарная плитка',
      description: 'Высококачественная плитка различных форм и размеров для любых задач',
      icon: 'Square',
      features: ['Морозостойкая', 'Износостойкая', 'Эко-материалы']
    },
    {
      title: 'Бордюры',
      description: 'Прочные бетонные бордюры для ограждения пешеходных и автомобильных зон',
      icon: 'Minus',
      features: ['Долговечные', 'Стандартные размеры', 'Быстрый монтаж']
    },
    {
      title: 'Водоотводы',
      description: 'Системы водоотвода для эффективного отвода дождевой воды',
      icon: 'Waves',
      features: ['Эффективный отвод', 'Простая установка', 'Долгий срок службы']
    }
  ];

  const services = [
    {
      title: 'Производство',
      description: 'Полный цикл производства от замеса до готовой продукции',
      icon: 'Factory'
    },
    {
      title: 'Доставка',
      description: 'Быстрая доставка по всему Крыму собственным автопарком',
      icon: 'Truck'
    },
    {
      title: 'Консультации',
      description: 'Профессиональные консультации по выбору и укладке материалов',
      icon: 'MessageSquare'
    },
    {
      title: 'Монтаж',
      description: 'Качественный монтаж силами опытной бригады специалистов',
      icon: 'Settings'
    }
  ];

  const portfolioItems = [
    {
      title: 'Парк Победы, Симферополь',
      description: 'Благоустройство центральной аллеи',
      image: '/img/be45156e-9db4-43e4-90bf-1e9a15580f2f.jpg'
    },
    {
      title: 'Набережная Ялты',
      description: 'Реконструкция пешеходной зоны',
      image: '/img/d975afe9-264d-4fd2-8597-2ade451e9b7a.jpg'
    },
    {
      title: 'ТЦ "Южная Галерея"',
      description: 'Мощение парковочной зоны',
      image: '/img/be04827a-c947-440b-a721-987aa53048f0.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="outline" className="mb-4 text-primary border-primary">
                🏗️ Производство в Крыму
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                Качественная
                <span className="text-primary block">тротуарная плитка</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Производим и поставляем высококачественную тротуарную плитку и бордюры
                по всему Крыму. Собственное производство, быстрая доставка, гарантия качества.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8">
                  <Icon name="Phone" className="mr-2 h-5 w-5" />
                  Заказать звонок
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Icon name="FileText" className="mr-2 h-5 w-5" />
                  Каталог продукции
                </Button>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <img 
                src="/img/be04827a-c947-440b-a721-987aa53048f0.jpg"
                alt="Производство тротуарной плитки КрымБлок"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                    <Icon name="Award" className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">15+ лет</p>
                    <p className="text-sm text-muted-foreground">на рынке</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Продукция</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Наша продукция</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Широкий ассортимент качественных материалов для благоустройства территорий
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon name={product.icon as any} className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{product.title}</CardTitle>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Услуги</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Наши услуги</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Полный спектр услуг от производства до укладки материалов
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="text-center group">
                <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon name={service.icon as any} className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Портфолио</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Наши проекты</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Реализованные проекты по всему Крыму
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contacts" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Контакты</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Свяжитесь с нами</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Готовы ответить на все ваши вопросы и рассчитать стоимость проекта
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="Phone" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Телефон</CardTitle>
                <CardDescription>+7 (978) 123-45-67</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="Mail" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Email</CardTitle>
                <CardDescription>info@krymblok.ru</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="MapPin" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Адрес</CardTitle>
                <CardDescription>г. Симферополь, ул. Производственная, 12</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name="Clock" className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Режим работы</CardTitle>
                <CardDescription>Пн-Сб: 8:00-18:00</CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="text-lg px-8">
              <Icon name="MessageSquare" className="mr-2 h-5 w-5" />
              Получить консультацию
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Building2" className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">КрымБлок</span>
              </div>
              <p className="text-muted-foreground">
                Производство качественной тротуарной плитки и бордюров в Крыму с 2009 года.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Продукция</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Тротуарная плитка</li>
                <li>Бордюры</li>
                <li>Водоотводы</li>
                <li>Малые архитектурные формы</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Услуги</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Производство</li>
                <li>Доставка</li>
                <li>Консультации</li>
                <li>Монтаж</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 КрымБлок. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}