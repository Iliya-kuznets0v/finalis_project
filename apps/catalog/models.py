from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class City(models.Model):
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    inn = models.CharField(max_length=12)
    is_verified = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    cities = models.ManyToManyField(City)

    def __str__(self):
        return self.company_name


class Product(models.Model):
    MATERIAL_CHOICES = (
        ('granite', 'Гранит'),
        ('marble', 'Мрамор'),
        ('concrete', 'Бетон'),
    )

    SHAPE_CHOICES = (
        ('vertical', 'Вертикальный'),
        ('horizontal', 'Горизонтальный'),
    )

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    material = models.CharField(max_length=20, choices=MATERIAL_CHOICES)
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES)
    height = models.DecimalField(max_digits=5, decimal_places=2)
    width = models.DecimalField(max_digits=5, decimal_places=2)
    thickness = models.DecimalField(max_digits=5, decimal_places=2, default=8.0)  # Добавляем поле
    weight = models.DecimalField(max_digits=8, decimal_places=2, default=120.0)  # Добавляем поле
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    in_stock = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    total_orders = models.IntegerField(default=0)  # Добавляем поле для количества заказов
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def final_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def discount_percentage(self):
        """Процент скидки"""
        if self.discount_price and self.price:
            return ((self.price - self.discount_price) / self.price) * 100
        return 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name}"