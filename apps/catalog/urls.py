from django.urls import path
from . import views

urlpatterns = [
    path('cities/', views.CityListView.as_view(), name='cities-list'),
    path('categories/', views.CategoryListView.as_view(), name='categories-list'),
    path('products/', views.ProductListView.as_view(), name='products-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
]