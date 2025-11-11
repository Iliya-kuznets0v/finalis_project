from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from apps.catalog.models import Product, City, Category, Supplier
from apps.core.models import Favorite
from apps.orders.models import Order, Cart, CartItem
from apps.reviews.models import Review

User = get_user_model()


@login_required
def add_to_cart(request, product_id):
    """Добавление товара в корзину"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)

        if not product.in_stock:
            messages.error(request, 'Этот товар временно отсутствует в наличии')
            return redirect(request.META.get('HTTP_REFERER', 'home'))

        # Получаем или создаем корзину пользователя
        cart, created = Cart.objects.get_or_create(user=request.user)

        # Проверяем, есть ли уже этот товар в корзине
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )

        if not item_created:
            # Если товар уже есть в корзине, увеличиваем количество
            cart_item.quantity += 1
            cart_item.save()
            messages.success(request, f'Количество товара "{product.name}" увеличено')
        else:
            messages.success(request, f'Товар "{product.name}" добавлен в корзину')

    except Product.DoesNotExist:
        messages.error(request, 'Товар не найден')

    # Возвращаем на предыдущую страницу
    return redirect(request.META.get('HTTP_REFERER', 'home'))

@login_required
def remove_from_cart(request, item_id):
    """Удаление товара из корзины"""
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        product_name = cart_item.product.name
        cart_item.delete()
        messages.success(request, f'Товар "{product_name}" удален из корзины')
    except CartItem.DoesNotExist:
        messages.error(request, 'Товар не найден в корзине')

    return redirect('cart')

@login_required
def update_cart_quantity(request, item_id):
    """Обновление количества товара в корзине"""
    if request.method == 'POST':
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        quantity = int(request.POST.get('quantity', 1))

        if quantity > 0:
            cart_item.quantity = quantity
            cart_item.save()
            messages.success(request, 'Количество товара обновлено')
        else:
            cart_item.delete()
            messages.success(request, 'Товар удален из корзины')

    return redirect('cart')
# Временные API endpoints для фронтенда

@csrf_exempt
@login_required
def api_add_to_cart(request):
    """Временный endpoint для добавления в корзину"""
    if request.method == 'POST':
        return JsonResponse({'status': 'success', 'message': 'Товар добавлен в корзину'})
    return JsonResponse({'status': 'error', 'message': 'Метод не разрешен'}, status=405)

@csrf_exempt
@login_required
def api_remove_from_cart(request, item_id):
    """Временный endpoint для удаления из корзины"""
    if request.method == 'DELETE':
        return JsonResponse({'status': 'success', 'message': 'Товар удален из корзины'})
    return JsonResponse({'status': 'error', 'message': 'Метод не разрешен'}, status=405)

@csrf_exempt
@login_required
def api_add_to_favorites(request):
    """Временный endpoint для добавления в избранное"""
    if request.method == 'POST':
        return JsonResponse({'status': 'success', 'message': 'Товар добавлен в избранное'})
    return JsonResponse({'status': 'error', 'message': 'Метод не разрешен'}, status=405)

@csrf_exempt
@login_required
def api_remove_from_favorites(request, product_id):
    """Временный endpoint для удаления из избранного"""
    if request.method == 'DELETE':
        return JsonResponse({'status': 'success', 'message': 'Товар удален из избранного'})
    return JsonResponse({'status': 'error', 'message': 'Метод не разрешен'}, status=405)

def home(request):
    """Главная страница"""
    featured_products = Product.objects.filter(is_active=True, in_stock=True)[:8]
    cities = City.objects.filter(is_active=True)

    context = {
        'featured_products': featured_products,
        'cities': cities,
        'title': 'Finalis - Маркетплейс памятников'
    }
    return render(request, 'core/home.html', context)


def catalog(request):
    """Страница каталога"""
    products = Product.objects.filter(is_active=True, in_stock=True)
    cities = City.objects.filter(is_active=True)
    categories = Category.objects.filter(is_active=True)

    # Фильтрация
    city_id = request.GET.get('city')
    category_id = request.GET.get('category')
    material = request.GET.get('material')
    shape = request.GET.get('shape')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')

    if city_id:
        products = products.filter(supplier__cities__id=city_id)
    if category_id:
        products = products.filter(category_id=category_id)
    if material:
        products = products.filter(material=material)
    if shape:
        products = products.filter(shape=shape)
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)

    # Сортировка
    sort = request.GET.get('sort', '-created_at')
    products = products.order_by(sort)

    context = {
        'products': products,
        'cities': cities,
        'categories': categories,
        'material_choices': Product.MATERIAL_CHOICES,
        'shape_choices': Product.SHAPE_CHOICES,
        'title': 'Каталог памятников'
    }
    return render(request, 'catalog/product_list.html', context)


def product_detail(request, product_id):
    """Детальная страница товара"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        related_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product_id)[:4]

        context = {
            'product': product,
            'related_products': related_products,
            'title': product.name
        }
        return render(request, 'catalog/product_detail.html', context)
    except Product.DoesNotExist:
        messages.error(request, 'Товар не найден')
        return redirect('catalog')


@login_required
def user_profile(request):
    """Личный кабинет пользователя"""
    orders = Order.objects.filter(customer=request.user).order_by('-created_at')
    favorites = Favorite.objects.filter(user=request.user).select_related('product')
    reviews = Review.objects.filter(author=request.user)
    cities = City.objects.filter(is_active=True)

    context = {
        'orders': orders,
        'favorites': favorites,
        'reviews': reviews,
        'cities': cities,
        'orders_count': orders.count(),
        'favorites_count': favorites.count(),
        'reviews_count': reviews.count(),
        'title': 'Личный кабинет'
    }
    return render(request, 'users/profile.html', context)


@login_required
def favorites(request):
    """Страница избранного"""
    favorites = Favorite.objects.filter(user=request.user).select_related('product')

    context = {
        'favorites': favorites,
        'title': 'Избранное'
    }
    return render(request, 'core/favorites.html', context)


@login_required
def add_to_favorites(request, product_id):
    """Добавление товара в избранное"""
    product = get_object_or_404(Product, id=product_id, is_active=True)

    # Проверяем, есть ли уже в избранном
    favorite, created = Favorite.objects.get_or_create(
        user=request.user,
        product=product
    )

    if created:
        messages.success(request, f'Товар "{product.name}" добавлен в избранное')
    else:
        messages.info(request, f'Товар "{product.name}" уже в избранном')

    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required
def remove_from_favorites(request, product_id):
    """Удаление товара из избранного"""
    product = get_object_or_404(Product, id=product_id)

    try:
        favorite = Favorite.objects.get(user=request.user, product=product)
        favorite.delete()
        messages.success(request, f'Товар "{product.name}" удален из избранного')
    except Favorite.DoesNotExist:
        messages.error(request, 'Товар не найден в избранном')

    return redirect(request.META.get('HTTP_REFERER', 'home'))

@login_required
def cart(request):
    """Страница корзины"""
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.items.select_related('product').all()

    total_price = sum(item.total_price for item in cart_items)
    total_quantity = sum(item.quantity for item in cart_items)

    context = {
        'cart_items': cart_items,
        'total_price': total_price,
        'total_quantity': total_quantity,
        'delivery_price': 0,
        'final_price': total_price,
        'title': 'Корзина'
    }
    return render(request, 'orders/cart.html', context)


def login_view(request):
    """Упрощенный вход с перенаправлением"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f'Добро пожаловать, {user.username}!')

            # Перенаправляем на следующую страницу или на главную
            next_url = request.GET.get('next', 'home')
            return redirect(next_url)
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')

    return render(request, 'registration/login.html')


def logout_view(request):
    """Выход"""
    from django.contrib.auth import logout
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы')
    return redirect('home')
def register_view(request):
    """Упрощенная регистрация"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')

        if password != password_confirm:
            messages.error(request, 'Пароли не совпадают')
            return render(request, 'registration/register.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Пользователь с таким именем уже существует')
            return render(request, 'registration/register.html')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type='customer'
        )

        login(request, user)
        messages.success(request, f'Аккаунт создан! Добро пожаловать, {user.username}!')
        return redirect('home')

    return render(request, 'registration/register.html')


def debug_cart(request):
    """Отладочная страница для проверки корзины"""
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            cart_items = cart.items.all()
            context = {
                'cart': cart,
                'cart_items': cart_items,
                'total': sum(item.total_price for item in cart_items)
            }
        except Cart.DoesNotExist:
            context = {'cart': None, 'cart_items': [], 'total': 0}
    else:
        context = {'cart': None, 'cart_items': [], 'total': 0}

    return render(request, 'core/debug_cart.html', context)


