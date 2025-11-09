from django.db import models

class Favorite(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"