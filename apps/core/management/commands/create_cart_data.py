from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.orders.models import Cart, CartItem
from apps.catalog.models import Product

User = get_user_model()


class Command(BaseCommand):
    help = 'Добавление тестовых товаров в корзину'

    def handle(self, *args, **options):
        self.stdout.write('Добавление товаров в корзину...')

        # Находим тестового пользователя
        user = User.objects.filter(username='ivanov').first()
        if not user:
            self.stdout.write('❌ Тестовый пользователь не найден')
            return

        # Получаем или создаем корзину
        cart, created = Cart.objects.get_or_create(user=user)

        # Добавляем несколько товаров в корзину
        products = Product.objects.all()[:2]  # Берем первые 2 товара

        for product in products:
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': 1}
            )
            if created:
                self.stdout.write(f'✅ Добавлен товар: {product.name}')
            else:
                self.stdout.write(f'⚠️ Товар уже в корзине: {product.name}')

        self.stdout.write('✅ Корзина заполнена тестовыми товарами')