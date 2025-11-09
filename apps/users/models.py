from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('customer', 'Покупатель'),
        ('supplier', 'Поставщик'),
        ('admin', 'Администратор'),
    )

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='customer')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    preferred_city = models.ForeignKey('catalog.City', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Profile of {self.user.username}"