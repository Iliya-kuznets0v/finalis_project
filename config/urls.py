from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/suppliers/', include('apps.suppliers.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('', include('apps.core.urls')),
]