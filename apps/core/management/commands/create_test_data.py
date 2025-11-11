from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.catalog.models import City, Category, Supplier, Product
from apps.orders.models import Order, OrderItem, Cart
from apps.reviews.models import Review
from apps.core.models import Favorite
from django.utils import timezone
from datetime import timedelta
import random
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Создание тестовых данных'

    def handle(self, *args, **options):
        self.stdout.write('Создание тестовых данных...')

        self.create_cities()
        self.create_categories()
        self.create_users_and_suppliers()
        self.create_products()
        self.create_orders()

        self.stdout.write(
            self.style.SUCCESS('✅ Тестовые данные успешно созданы!')
        )

        self.stdout.write('\n🔑 Тестовые пользователи:')
        self.stdout.write('   Обычные пользователи: ivanov / petrov / sidorova (пароль: testpass123)')
        self.stdout.write('   Поставщики: granit_master / mramor_lux (пароль: supplier123)')

    def create_cities(self):
        if City.objects.exists():
            self.stdout.write('✅ Города уже существуют')
            return

        cities_data = [
            {'name': 'Москва', 'region': 'Московская область'},
            {'name': 'Санкт-Петербург', 'region': 'Ленинградская область'},
            {'name': 'Новосибирск', 'region': 'Новосибирская область'},
            {'name': 'Екатеринбург', 'region': 'Свердловская область'},
            {'name': 'Казань', 'region': 'Татарстан'},
        ]

        for city_data in cities_data:
            City.objects.get_or_create(
                name=city_data['name'],
                defaults=city_data
            )

        self.stdout.write(f'✅ Создано {len(cities_data)} городов')

    def create_categories(self):
        if Category.objects.exists():
            self.stdout.write('✅ Категории уже существуют')
            return

        categories_data = [
            {'name': 'Гранитные памятники', 'slug': 'granitnye-pamyatniki'},
            {'name': 'Мраморные памятники', 'slug': 'mramornye-pamyatniki'},
            {'name': 'Бетонные памятники', 'slug': 'betonnye-pamyatniki'},
            {'name': 'Вертикальные памятники', 'slug': 'vertikalnye-pamyatniki'},
            {'name': 'Горизонтальные памятники', 'slug': 'gorizontalnye-pamyatniki'},
        ]

        for cat_data in categories_data:
            Category.objects.get_or_create(
                name=cat_data['name'],
                slug=cat_data['slug'],
                defaults={'is_active': True}
            )

        self.stdout.write(f'✅ Создано {len(categories_data)} категорий')

    def create_users_and_suppliers(self):
        users_data = [
            {'username': 'ivanov', 'email': 'ivanov@mail.ru', 'first_name': 'Иван', 'last_name': 'Иванов'},
            {'username': 'petrov', 'email': 'petrov@mail.ru', 'first_name': 'Петр', 'last_name': 'Петров'},
            {'username': 'sidorova', 'email': 'sidorova@mail.ru', 'first_name': 'Мария', 'last_name': 'Сидорova'},
        ]

        created_users = 0
        for user_data in users_data:
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    password='testpass123'
                )
                created_users += 1

        suppliers_data = [
            {
                'username': 'granit_master',
                'email': 'granit@master.ru',
                'company_name': 'Гранит Мастер',
                'description': 'Производство гранитных памятников высшего качества.',
                'inn': '123456789012'
            },
            {
                'username': 'mramor_lux',
                'email': 'lux@mramor.ru',
                'company_name': 'Мрамор Люкс',
                'description': 'Элитные мраморные памятники ручной работы.',
                'inn': '234567890123'
            },
        ]

        cities = list(City.objects.all())
        created_suppliers = 0

        for supplier_data in suppliers_data:
            if not User.objects.filter(username=supplier_data['username']).exists():
                user = User.objects.create_user(
                    username=supplier_data['username'],
                    email=supplier_data['email'],
                    user_type='supplier',
                    password='supplier123'
                )

                supplier = Supplier.objects.create(
                    user=user,
                    company_name=supplier_data['company_name'],
                    description=supplier_data['description'],
                    inn=supplier_data['inn'],
                    is_verified=True,
                    rating=round(random.uniform(4.0, 5.0), 1)
                )

                supplier_cities = random.sample(cities, min(2, len(cities)))
                supplier.cities.set(supplier_cities)
                created_suppliers += 1

        self.stdout.write(f'✅ Создано {created_users} пользователей и {created_suppliers} поставщиков')

    def create_products(self):
        suppliers = list(Supplier.objects.all())
        categories = list(Category.objects.all())

        if not suppliers or not categories:
            self.stdout.write('⚠️  Нет поставщиков или категорий для создания товаров')
            return

        products_data = [
            {
                'name': 'Гранитный памятник "Классик"',
                'material': 'granite',
                'shape': 'vertical',
                'price': Decimal('25000.00'),
                'height': Decimal('120.0'),
                'width': Decimal('60.0'),
                'description': 'Классический гранитный памятник высшего качества.'
            },
            {
                'name': 'Гранитный памятник "Престиж"',
                'material': 'granite',
                'shape': 'vertical',
                'price': Decimal('35000.00'),
                'discount_price': Decimal('32000.00'),
                'height': Decimal('140.0'),
                'width': Decimal('70.0'),
                'description': 'Престижный гранитный памятник с полированной поверхностью.'
            },
            {
                'name': 'Мраморный памятник "Элит"',
                'material': 'marble',
                'shape': 'vertical',
                'price': Decimal('45000.00'),
                'height': Decimal('130.0'),
                'width': Decimal('65.0'),
                'description': 'Элитный мраморный памятник ручной работы.'
            },
            {
                'name': 'Мраморный памятник "Нежность"',
                'material': 'marble',
                'shape': 'horizontal',
                'price': Decimal('38000.00'),
                'height': Decimal('80.0'),
                'width': Decimal('100.0'),
                'description': 'Горизонтальный мраморный памятник с плавными линиями.'
            },
            {
                'name': 'Бетонный памятник "Стандарт"',
                'material': 'concrete',
                'shape': 'vertical',
                'price': Decimal('12000.00'),
                'height': Decimal('100.0'),
                'width': Decimal('50.0'),
                'description': 'Доступный бетонный памятник стандартного размера.'
            },
        ]

        created_products = 0
        for product_data in products_data:
            if not Product.objects.filter(name=product_data['name']).exists():
                supplier = random.choice(suppliers)
                category = random.choice(categories)

                product = Product(
                    name=product_data['name'],
                    supplier=supplier,
                    category=category,
                    material=product_data['material'],
                    shape=product_data['shape'],
                    price=product_data['price'],
                    discount_price=product_data.get('discount_price'),
                    height=product_data['height'],
                    width=product_data['width'],
                    description=product_data['description'],
                    in_stock=True,
                    rating=round(random.uniform(4.0, 5.0), 1),
                    total_orders=random.randint(0, 20)
                )
                product.save()
                created_products += 1

        self.stdout.write(f'✅ Создано {created_products} товаров')

    def create_orders(self):
        """Создание тестовых заказов"""
        customers = list(User.objects.filter(user_type='customer'))
        products = list(Product.objects.all())
        cities = list(City.objects.all())

        if not customers or not products:
            self.stdout.write('⚠️  Недостаточно данных для создания заказов')
            return

        created_orders = 0
        for i in range(5):
            customer = random.choice(customers)
            product = random.choice(products)
            city = random.choice(cities)

            # Проверяем существование заказа через OrderItem
            if not OrderItem.objects.filter(order__customer=customer, product=product).exists():
                order = Order.objects.create(
                    customer=customer,
                    supplier=product.supplier,
                    city=city,
                    status='delivered',
                    total_amount=product.final_price,
                    delivery_address=f'г. {city.name}, ул. Примерная, д. {random.randint(1, 100)}',
                    created_at=timezone.now() - timedelta(days=random.randint(1, 30))
                )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=1,
                    price=product.final_price
                )
                created_orders += 1

        self.stdout.write(f'✅ Создано {created_orders} тестовых заказов')