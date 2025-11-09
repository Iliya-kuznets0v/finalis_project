from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import City, Category, Product
from .serializers import CitySerializer, CategorySerializer, ProductListSerializer, ProductDetailSerializer


class CityListView(generics.ListAPIView):
    queryset = City.objects.filter(is_active=True)
    serializer_class = CitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'region']


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'supplier__company_name']
    filterset_fields = ['material', 'shape', 'category', 'supplier']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True, in_stock=True)

        # Фильтрация по городу
        city_id = self.request.query_params.get('city')
        if city_id:
            queryset = queryset.filter(supplier__cities__id=city_id)

        # Фильтрация по высоте
        min_height = self.request.query_params.get('min_height')
        max_height = self.request.query_params.get('max_height')
        if min_height:
            queryset = queryset.filter(height__gte=min_height)
        if max_height:
            queryset = queryset.filter(height__lte=max_height)

        # Фильтрация по цене
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset.distinct()


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer