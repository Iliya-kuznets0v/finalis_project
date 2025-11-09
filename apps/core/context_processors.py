from apps.orders.models import Cart
from apps.core.models import Favorite

def cart_items_count(request):
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            count = cart.items.count()
        except Cart.DoesNotExist:
            count = 0
    else:
        count = 0
    return {'cart_items_count': count}

def favorite_ids(request):
    if request.user.is_authenticated:
        favorite_ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
    else:
        favorite_ids = []
    return {'favorite_ids': list(favorite_ids)}