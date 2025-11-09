// JavaScript для каталога
document.addEventListener('DOMContentLoaded', function() {
    // Сортировка
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const url = new URL(window.location);
            url.searchParams.set('ordering', this.value);
            window.location.href = url.toString();
        });
    }

    // Применение фильтров при изменении
    const filterForm = document.getElementById('filterForm');
    const filterInputs = filterForm.querySelectorAll('input, select');

    filterInputs.forEach(input => {
        if (input.type !== 'submit') {
            input.addEventListener('change', function() {
                // Для чекбоксов применяем сразу
                if (this.type === 'checkbox') {
                    applyFilters();
                }
            });
        }
    });

    // Кнопка применения фильтров
    const applyButton = filterForm.querySelector('.apply-filters');
    if (applyButton) {
        applyButton.addEventListener('click', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }

    function applyFilters() {
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        // Добавляем все поля формы
        for (let [key, value] of formData) {
            if (value) {
                params.append(key, value);
            }
        }

        // Сохраняем сортировку
        const currentSort = new URL(window.location).searchParams.get('ordering');
        if (currentSort) {
            params.set('ordering', currentSort);
        }

        // Перенаправляем с новыми параметрами
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    }

    // Динамическая загрузка товаров (для бесконечного скролла)
    let isLoading = false;
    let nextPage = 2; // Предполагаем, что первая страница уже загружена

    function setupInfiniteScroll() {
        window.addEventListener('scroll', function() {
            if (isLoading) return;

            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMoreProducts();
            }
        });
    }

    async function loadMoreProducts() {
        if (isLoading) return;

        isLoading = true;

        try {
            const currentUrl = new URL(window.location);
            currentUrl.searchParams.set('page', nextPage);

            const response = await fetch(currentUrl.toString(), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.products && data.products.length > 0) {
                    // Добавляем новые товары в сетку
                    appendProducts(data.products);
                    nextPage++;
                }
            }
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            isLoading = false;
        }
    }

    function appendProducts(products) {
        const catalogGrid = document.querySelector('.catalog');

        products.forEach(product => {
            const productCard = createProductCard(product);
            catalogGrid.appendChild(productCard);
        });
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.main_image}" alt="${product.name}">
                <button class="btn-secondary favorite-btn" data-product-id="${product.id}">
                    <i class="bi ${product.is_favorite ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-supplier">
                    <i class="bi bi-building"></i>
                    ${product.supplier_name}
                </p>
                <p class="product-location">
                    <i class="bi bi-geo-alt"></i>
                    ${product.city}
                </p>
                <div class="product-specs">
                    <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">
                        ${product.material}
                    </span>
                    <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">
                        ${product.height}×${product.width} см
                    </span>
                </div>
                <div class="product-price">
                    ${product.discount_price ?
                        `<span style="text-decoration: line-through; color: #7f8c8d; font-size: 0.9rem; margin-right: 8px;">
                            ${product.price} ₽
                         </span>
                         <span style="color: #e74c3c; font-weight: bold;">
                            ${product.discount_price} ₽
                         </span>` :
                        `<span style="font-weight: bold;">${product.price} ₽</span>`
                    }
                </div>
                <div class="product-rating">
                    <i class="bi bi-star-fill" style="color: #ffc107;"></i>
                    <span style="font-size: 0.8rem;">${product.rating}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                        <i class="bi bi-cart-plus"></i>
                        В корзину
                    </button>
                    <a href="/products/${product.id}/" class="btn-secondary">
                        <i class="bi bi-eye"></i>
                    </a>
                </div>
            </div>
        `;

        return card;
    }

    // Инициализация бесконечного скролла
    setupInfiniteScroll();
});