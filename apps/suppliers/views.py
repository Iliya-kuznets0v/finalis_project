from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum
from apps.catalog.models import Supplier, Product
from apps.orders.models import Order
from apps.reviews.models import Review


@login_required
def supplier_dashboard(request):
    """Кабинет поставщика"""
    try:
        supplier = request.user.supplier_profile
    except Supplier.DoesNotExist:
        messages.error(request, 'У вас нет прав поставщика')
        return redirect('home')

    # Статистика
    total_orders = Order.objects.filter(supplier=supplier).count()
    active_products = Product.objects.filter(supplier=supplier, is_active=True).count()
    total_revenue = Order.objects.filter(
        supplier=supplier,
        status__in=['delivered', 'shipped']
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    # Недавние заказы
    recent_orders = Order.objects.filter(supplier=supplier).order_by('-created_at')[:5]

    # Популярные товары
    popular_products = Product.objects.filter(
        supplier=supplier
    ).order_by('-total_orders')[:4]

    context = {
        'supplier': supplier,
        'total_orders': total_orders,
        'active_products': active_products,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders,
        'popular_products': popular_products,
        'orders_count': total_orders,
        'reviews_count': Review.objects.filter(supplier=supplier).count(),
        'title': 'Кабинет поставщика'
    }

    return render(request, 'suppliers/dashboard.html', context)


@login_required
def become_supplier(request):
    """Стать поставщиком"""
    if hasattr(request.user, 'supplier_profile'):
        messages.info(request, 'Вы уже являетесь поставщиком')
        return redirect('supplier_dashboard')

    if request.method == 'POST':
        company_name = request.POST.get('company_name')
        inn = request.POST.get('inn')
        description = request.POST.get('description')

        if company_name and inn:
            supplier = Supplier.objects.create(
                user=request.user,
                company_name=company_name,
                inn=inn,
                description=description,
                is_verified=False  # Требует модерации
            )
            messages.success(request, 'Заявка на регистрацию поставщика отправлена на модерацию')
            return redirect('home')
        else:
            messages.error(request, 'Заполните все обязательные поля')

    return render(request, 'suppliers/become_supplier.html')