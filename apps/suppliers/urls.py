from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.supplier_dashboard, name='supplier_dashboard'),
    path('become-supplier/', views.become_supplier, name='become_supplier'),
]