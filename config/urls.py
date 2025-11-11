from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.core import views as core_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Основные страницы
    path('', core_views.home, name='home'),
    path('catalog/', core_views.catalog, name='catalog'),
    path('product/<int:product_id>/', core_views.product_detail, name='product_detail'),

    # Аутентификация
    path('login/', core_views.login_view, name='login'),
    path('register/', core_views.register_view, name='register'),
    path('logout/', core_views.logout_view, name='logout'),

    # Личный кабинет
    path('profile/', core_views.user_profile, name='user_profile'),
    path('favorites/', core_views.favorites, name='favorites'),
    path('cart/', core_views.cart, name='cart'),

    # Поставщики
    path('supplier/', include('apps.suppliers.urls')),
    # Добавляем в urlpatterns
    path('cart/add/<int:product_id>/', core_views.add_to_cart, name='add_to_cart'),
    path('cart/remove/<int:item_id>/', core_views.remove_from_cart, name='remove_from_cart'),
    path('cart/update/<int:item_id>/', core_views.update_cart_quantity, name='update_cart_quantity'),
    # Временные API endpoints
    path('api/cart/items/', core_views.api_add_to_cart, name='api_add_to_cart'),
    path('api/cart/items/<int:item_id>/', core_views.api_remove_from_cart, name='api_remove_from_cart'),
    path('api/favorites/', core_views.api_add_to_favorites, name='api_add_to_favorites'),
    path('api/favorites/<int:product_id>/', core_views.api_remove_from_favorites, name='api_remove_from_favorites'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)