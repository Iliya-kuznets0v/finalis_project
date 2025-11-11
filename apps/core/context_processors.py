from apps.orders.models import Cart
from apps.core.models import Favorite


def cart_items_count(request):
    """Добавляет количество товаров в корзине в контекст"""
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            count = cart.items.count()
        except Cart.DoesNotExist:
            count = 0
    else:
        count = 0
    return {'cart_items_count': count}

def favorites_count(request):
    """Добавляет количество товаров в избранном в контекст"""
    if request.user.is_authenticated:
        count = Favorite.objects.filter(user=request.user).count()
    else:
        count = 0
    return {'favorites_count': count}
def favorite_ids(request):
    """Добавляет ID избранных товаров в контекст"""
    if request.user.is_authenticated:
        favorite_ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
    else:
        favorite_ids = []
    return {'favorite_ids': list(favorite_ids)}


def user_profile_data(request):
    """Данные для личного кабинета пользователя"""
    if request.user.is_authenticated:
        from apps.orders.models import Order
        from apps.core.models import Favorite
        from apps.reviews.models import Review

        return {
            'orders_count': Order.objects.filter(customer=request.user).count(),
            'favorites_count': Favorite.objects.filter(user=request.user).count(),
            'reviews_count': Review.objects.filter(author=request.user).count(),
        }
    return {}