from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.orders.models import Cart, CartItem
from apps.catalog.models import Product

User = get_user_model()


class Command(BaseCommand):
    help = 'Тестирование функциональности корзины'

    def handle(self, *args, **options):
        self.stdout.write('Тестирование корзины...')

        # Проверяем тестового пользователя
        user = User.objects.filter(username='ivanov').first()
        if not user:
            self.stdout.write('❌ Тестовый пользователь не найден')
            return

        # Проверяем корзину
        cart, created = Cart.objects.get_or_create(user=user)
        self.stdout.write(f'✅ Корзина пользователя: {cart}')

        # Показываем товары в корзине
        cart_items = cart.items.all()
        self.stdout.write(f'✅ Товаров в корзине: {cart_items.count()}')

        for item in cart_items:
            self.stdout.write(f'   - {item.product.name} x {item.quantity} = {item.total_price} ₽')

        # Показываем общую сумму
        total = sum(item.total_price for item in cart_items)
        self.stdout.write(f'✅ Общая сумма: {total} ₽')