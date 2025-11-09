from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class City(models.Model):
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Россия')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Cities'
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.region}"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='supplier_profile')
    company_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    inn = models.CharField(max_length=12, unique=True)
    logo = models.ImageField(upload_to='suppliers/logo/', null=True, blank=True)
    cities = models.ManyToManyField(City, related_name='suppliers')
    delivery_radius_km = models.IntegerField(default=50)
    is_verified = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    total_orders = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name


class Product(models.Model):
    MATERIAL_CHOICES = (
        ('granite', 'Гранит'),
        ('marble', 'Мрамор'),
        ('concrete', 'Бетон'),
        ('metal', 'Металл'),
        ('wood', 'Дерево'),
    )

    SHAPE_CHOICES = (
        ('vertical', 'Вертикальный'),
        ('horizontal', 'Горизонтальный'),
        ('complex', 'Сложная форма'),
        ('cross', 'Крест'),
        ('obelisk', 'Обелиск'),
    )

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    material = models.CharField(max_length=20, choices=MATERIAL_CHOICES)
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES)
    height = models.DecimalField(max_digits=5, decimal_places=2)  # в см
    width = models.DecimalField(max_digits=5, decimal_places=2)  # в см
    thickness = models.DecimalField(max_digits=5, decimal_places=2)  # в см
    weight = models.DecimalField(max_digits=8, decimal_places=2)  # в кг
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    in_stock = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    total_orders = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def final_price(self):
        return self.discount_price if self.discount_price else self.price


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']