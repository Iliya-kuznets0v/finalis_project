from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.catalog.models import City, Category, Supplier, Product
from apps.orders.models import Order, OrderItem, Cart, CartItem
from apps.reviews.models import Review, ReviewImage
from apps.core.models import Favorite

User = get_user_model()


class Command(BaseCommand):
    help = 'Очистка базы данных от тестовых данных'

    def handle(self, *args, **options):
        self.stdout.write('Очистка базы данных...')

        # Удаляем в правильном порядке (из-за внешних ключей)
        ReviewImage.objects.all().delete()
        Review.objects.all().delete()
        CartItem.objects.all().delete()
        Cart.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Favorite.objects.all().delete()
        Product.objects.all().delete()
        Supplier.objects.all().delete()
        Category.objects.all().delete()
        City.objects.all().delete()

        # Удаляем пользователей кроме суперпользователей
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write(
            self.style.SUCCESS('✅ База данных очищена!')
        )