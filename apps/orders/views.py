from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Cart, CartItem


@login_required
def cart(request):
    """Страница корзины"""
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.items.select_related('product', 'product__supplier', 'product__images')

    # Расчет стоимости
    total_price = sum(item.total_price for item in cart_items)
    total_quantity = sum(item.quantity for item in cart_items)
    delivery_price = 0  # Бесплатная доставка в радиусе 50 км
    final_price = total_price + delivery_price

    context = {
        'cart_items': cart_items,
        'total_price': total_price,
        'total_quantity': total_quantity,
        'delivery_price': delivery_price,
        'final_price': final_price,
        'title': 'Корзина'
    }
    return render(request, 'orders/cart.html', context)