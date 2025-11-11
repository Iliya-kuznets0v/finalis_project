// JavaScript для кабинета поставщика
document.addEventListener('DOMContentLoaded', function() {
    // Переключение вкладок
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Убираем активный класс у всех элементов
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            // Добавляем активный класс текущему элементу
            this.classList.add('active');

            // Показываем соответствующую вкладку
            const tabId = this.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');

            // Если переходим на вкладку статистики, инициализируем графики
            if (this.dataset.tab === 'statistics') {
                initializeCharts();
            }
        });
    });

    // Управление товарами
    const addProductBtn = document.getElementById('addProductBtn');
    const addFirstProductBtn = document.getElementById('addFirstProductBtn');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('productForm');

    // Открытие модального окна добавления товара
    [addProductBtn, addFirstProductBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                openProductModal();
            });
        }
    });

    // Закрытие модального окна
    if (closeProductModal) {
        closeProductModal.addEventListener('click', closeProductModalFunc);
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModalFunc);
    }

    // Закрытие модального окна при клике вне его
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeProductModalFunc();
            }
        });
    }

    // Отправка формы товара
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct(this);
        });
    }

    // Управление статусом товара
    document.querySelectorAll('.toggle-status').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const currentStatus = this.dataset.status;
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            toggleProductStatus(productId, newStatus, this);
        });
    });

    // Редактирование товара
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            editProduct(productId);
        });
    });

    // Удаление товара
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            deleteProduct(productId);
        });
    });

    // Управление заказами
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            const orderId = this.dataset.orderId;
            const newStatus = this.value;

            updateOrderStatus(orderId, newStatus, this);
        });
    });

    // Просмотр заказа
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            viewOrderDetails(orderId);
        });
    });

    // Управление отзывами
    document.querySelectorAll('.approve-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.dataset.reviewId;
            approveReview(reviewId, this);
        });
    });

    document.querySelectorAll('.reply-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.dataset.reviewId;
            replyToReview(reviewId);
        });
    });

    // Настройки поставщика
    const supplierSettingsForm = document.getElementById('supplierSettingsForm');
    if (supplierSettingsForm) {
        supplierSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateSupplierSettings(this);
        });
    }

    // Добавление города доставки
    const addCityBtn = document.getElementById('addCityBtn');
    if (addCityBtn) {
        addCityBtn.addEventListener('click', openCityModal);
    }

    // Удаление города доставки
    document.querySelectorAll('.remove-city').forEach(btn => {
        btn.addEventListener('click', function() {
            const cityId = this.dataset.cityId;
            removeDeliveryCity(cityId, this);
        });
    });

    // Поиск товаров
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        let searchTimeout;
        productSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchProducts(this.value);
            }, 500);
        });
    }

    // Фильтрация товаров
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    [statusFilter, categoryFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterProducts);
        }
    });

    // Фильтрация заказов
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }

    // Период статистики
    const statsPeriod = document.getElementById('statsPeriod');
    if (statsPeriod) {
        statsPeriod.addEventListener('change', function() {
            loadStatistics(this.value);
        });
    }

    // Инициализация графиков при загрузке страницы
    if (document.getElementById('overview-tab').classList.contains('active')) {
        initializeCharts();
    }
});

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = modal.querySelector('h3');
    const submitBtn = modal.querySelector('.btn-primary');

    if (productId) {
        // Режим редактирования
        modalTitle.textContent = 'Редактировать товар';
        submitBtn.textContent = 'Сохранить изменения';
        loadProductData(productId, form);
    } else {
        // Режим добавления
        modalTitle.textContent = 'Добавить товар';
        submitBtn.textContent = 'Сохранить товар';
        form.reset();
    }

    // Заполняем форму базовой структурой
    form.querySelector('.modal-body').innerHTML = getProductFormHTML();

    modal.style.display = 'flex';
}

function closeProductModalFunc() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

function getProductFormHTML() {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label for="product_name">Название товара *</label>
                <input type="text" id="product_name" name="name" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="product_category">Категория</label>
                <select id="product_category" name="category" class="form-select">
                    <option value="">Выберите категорию</option>
                    <!-- Категории будут загружены динамически -->
                </select>
            </div>
            <div class="form-group">
                <label for="product_material">Материал *</label>
                <select id="product_material" name="material" class="form-select" required>
                    <option value="">Выберите материал</option>
                    <option value="granite">Гранит</option>
                    <option value="marble">Мрамор</option>
                    <option value="concrete">Бетон</option>
                    <option value="metal">Металл</option>
                    <option value="wood">Дерево</option>
                </select>
            </div>
            <div class="form-group">
                <label for="product_shape">Форма *</label>
                <select id="product_shape" name="shape" class="form-select" required>
                    <option value="">Выберите форму</option>
                    <option value="vertical">Вертикальный</option>
                    <option value="horizontal">Горизонтальный</option>
                    <option value="complex">Сложная форма</option>
                    <option value="cross">Крест</option>
                    <option value="obelisk">Обелиск</option>
                </select>
            </div>
            <div class="form-group">
                <label for="product_price">Цена (₽) *</label>
                <input type="number" id="product_price" name="price" class="form-input" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product_discount_price">Цена со скидкой (₽)</label>
                <input type="number" id="product_discount_price" name="discount_price" class="form-input" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="product_height">Высота (см) *</label>
                <input type="number" id="product_height" name="height" class="form-input" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product_width">Ширина (см) *</label>
                <input type="number" id="product_width" name="width" class="form-input" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product_thickness">Толщина (см)</label>
                <input type="number" id="product_thickness" name="thickness" class="form-input" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="product_weight">Вес (кг)</label>
                <input type="number" id="product_weight" name="weight" class="form-input" min="0" step="0.01">
            </div>
            <div class="form-group full-width">
                <label for="product_description">Описание *</label>
                <textarea id="product_description" name="description" rows="4" class="form-input" required></textarea>
            </div>
            <div class="form-group full-width">
                <label>Изображения товара</label>
                <div class="images-upload">
                    <input type="file" name="images" multiple accept="image/*" class="file-input">
                    <div class="upload-area">
                        <i class="bi bi-cloud-upload"></i>
                        <span>Перетащите изображения или нажмите для загрузки</span>
                        <small>Максимум 5 изображений, каждое до 5MB</small>
                    </div>
                    <div class="upload-preview"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="in_stock" checked>
                    <span>В наличии</span>
                </label>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="is_active" checked>
                    <span>Активный товар</span>
                </label>
            </div>
        </div>
    `;
}

async function loadProductData(productId, form) {
    try {
        const response = await fetch(`/api/supplier/products/${productId}/`);
        if (response.ok) {
            const product = await response.json();

            // Заполняем форму данными
            form.querySelector('#product_name').value = product.name;
            form.querySelector('#product_category').value = product.category?.id || '';
            form.querySelector('#product_material').value = product.material;
            form.querySelector('#product_shape').value = product.shape;
            form.querySelector('#product_price').value = product.price;
            form.querySelector('#product_discount_price').value = product.discount_price || '';
            form.querySelector('#product_height').value = product.height;
            form.querySelector('#product_width').value = product.width;
            form.querySelector('#product_thickness').value = product.thickness || '';
            form.querySelector('#product_weight').value = product.weight || '';
            form.querySelector('#product_description').value = product.description;
            form.querySelector('[name="in_stock"]').checked = product.in_stock;
            form.querySelector('[name="is_active"]').checked = product.is_active;

            // Загружаем изображения
            if (product.images && product.images.length > 0) {
                const preview = form.querySelector('.upload-preview');
                preview.innerHTML = product.images.map(img => `
                    <div class="image-preview">
                        <img src="${img.image}" alt="Preview">
                        <button type="button" class="remove-image" data-image-id="${img.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading product data:', error);
        showNotification('Ошибка при загрузке данных товара', 'error');
    }
}

async function saveProduct(form) {
    const formData = new FormData(form);

    try {
        const url = form.dataset.productId ?
            `/api/supplier/products/${form.dataset.productId}/` :
            '/api/supplier/products/';

        const method = form.dataset.productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
        });

        if (response.ok) {
            showNotification('Товар успешно сохранен', 'success');
            closeProductModalFunc();
            // Обновляем список товаров
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Ошибка при сохранении товара', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при сохранении товара', 'error');
    }
}

async function toggleProductStatus(productId, newStatus, button) {
    try {
        const response = await fetch(`/api/supplier/products/${productId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ is_active: newStatus === 'active' })
        });

        if (response.ok) {
            const product = await response.json();

            // Обновляем UI
            const statusBadge = button.closest('.table-row').querySelector('.status-badge');
            const statusIcon = button.querySelector('i');

            if (newStatus === 'active') {
                statusBadge.className = 'status-badge active';
                statusBadge.textContent = 'Активен';
                statusIcon.className = 'bi bi-pause';
                button.dataset.status = 'active';
            } else {
                statusBadge.className = 'status-badge inactive';
                statusBadge.textContent = 'Неактивен';
                statusIcon.className = 'bi bi-play';
                button.dataset.status = 'inactive';
            }

            showNotification('Статус товара обновлен', 'success');
        } else {
            showNotification('Ошибка при изменении статуса', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при изменении статуса', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Удалить этот товар? Это действие нельзя отменить.')) return;

    try {
        const response = await fetch(`/api/supplier/products/${productId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            // Удаляем строку из таблицы
            const productRow = document.querySelector(`[data-product-id="${productId}"]`);
            productRow.style.opacity = '0';
            setTimeout(() => {
                productRow.remove();
            }, 300);

            showNotification('Товар удален', 'success');
        } else {
            showNotification('Ошибка при удалении товара', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при удалении товара', 'error');
    }
}

async function updateOrderStatus(orderId, newStatus, select) {
    try {
        const response = await fetch(`/api/supplier/orders/${orderId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showNotification('Статус заказа обновлен', 'success');
        } else {
            // Возвращаем предыдущее значение
            const order = await response.json().catch(() => null);
            showNotification('Ошибка при обновлении статуса', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при обновлении статуса', 'error');
    }
}

function viewOrderDetails(orderId) {
    // Открываем модальное окно с деталями заказа
    window.open(`/supplier/orders/${orderId}/`, '_blank');
}

async function approveReview(reviewId, button) {
    try {
        const response = await fetch(`/api/supplier/reviews/${reviewId}/approve/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            const reviewCard = button.closest('.review-card');
            const moderationStatus = reviewCard.querySelector('.moderation-status');

            moderationStatus.className = 'moderation-status approved';
            moderationStatus.textContent = 'Одобрен';

            button.remove();

            showNotification('Отзыв одобрен', 'success');
        } else {
            showNotification('Ошибка при одобрении отзыва', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при одобрении отзыва', 'error');
    }
}

function replyToReview(reviewId) {
    // Открываем модальное окно для ответа на отзыв
    const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`).closest('.review-card');
    const reviewerName = reviewCard.querySelector('.reviewer-info h4').textContent;

    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Ответить на отзыв</h3>
                    <button class="modal-close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <form class="reply-form">
                    <div class="modal-body">
                        <p>Ответ для: <strong>${reviewerName}</strong></p>
                        <div class="form-group">
                            <label>Ваш ответ</label>
                            <textarea name="reply_text" rows="4" class="form-input" placeholder="Напишите ответ на отзыв..." required></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary cancel-reply">Отмена</button>
                        <button type="submit" class="btn-primary">Отправить ответ</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Обработчики событий для модального окна
    const modal = document.querySelector('.modal-overlay:last-child');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.cancel-reply');
    const form = modal.querySelector('.reply-form');

    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReviewReply(reviewId, this);
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function submitReviewReply(reviewId, form) {
    const formData = new FormData(form);
    const replyText = formData.get('reply_text');

    try {
        const response = await fetch(`/api/supplier/reviews/${reviewId}/reply/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ reply_text: replyText })
        });

        if (response.ok) {
            showNotification('Ответ отправлен', 'success');
            form.closest('.modal-overlay').remove();
        } else {
            showNotification('Ошибка при отправке ответа', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при отправке ответа', 'error');
    }
}

async function updateSupplierSettings(form) {
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/supplier/settings/', {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
        });

        if (response.ok) {
            showNotification('Настройки сохранены', 'success');
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Ошибка при сохранении настроек', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при сохранении настроек', 'error');
    }
}

function openCityModal() {
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Добавить город доставки</h3>
                    <button class="modal-close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <form class="city-form">
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Поиск города</label>
                            <input type="text" class="form-input" placeholder="Введите название города" id="citySearch">
                            <div class="cities-suggestions" id="citiesSuggestions"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary cancel-city">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.querySelector('.modal-overlay:last-child');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.cancel-city');
    const citySearch = modal.querySelector('#citySearch');

    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());

    // Поиск городов
    let searchTimeout;
    citySearch.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchCities(this.value);
        }, 500);
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function searchCities(query) {
    if (query.length < 2) return;

    try {
        const response = await fetch(`/api/cities/?search=${encodeURIComponent(query)}`);
        if (response.ok) {
            const cities = await response.json();
            displayCitySuggestions(cities);
        }
    } catch (error) {
        console.error('Error searching cities:', error);
    }
}

function displayCitySuggestions(cities) {
    const suggestions = document.getElementById('citiesSuggestions');
    suggestions.innerHTML = '';

    cities.forEach(city => {
        const div = document.createElement('div');
        div.className = 'city-suggestion';
        div.textContent = `${city.name}, ${city.region}`;
        div.addEventListener('click', () => addDeliveryCity(city.id));
        suggestions.appendChild(div);
    });
}

async function addDeliveryCity(cityId) {
    try {
        const response = await fetch('/api/supplier/delivery-cities/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ city_id: cityId })
        });

        if (response.ok) {
            const city = await response.json();
            // Добавляем город в список
            addCityToUI(city);
            document.querySelector('.modal-overlay:last-child').remove();
            showNotification('Город добавлен', 'success');
        } else {
            showNotification('Ошибка при добавлении города', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при добавлении города', 'error');
    }
}

function addCityToUI(city) {
    const citiesList = document.querySelector('.cities-list');
    const cityTag = document.createElement('span');
    cityTag.className = 'city-tag';
    cityTag.innerHTML = `
        ${city.name}
        <button type="button" class="remove-city" data-city-id="${city.id}">
            <i class="bi bi-x"></i>
        </button>
    `;

    citiesList.appendChild(cityTag);

    // Добавляем обработчик для новой кнопки удаления
    cityTag.querySelector('.remove-city').addEventListener('click', function() {
        const cityId = this.dataset.cityId;
        removeDeliveryCity(cityId, this);
    });
}

async function removeDeliveryCity(cityId, button) {
    try {
        const response = await fetch(`/api/supplier/delivery-cities/${cityId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            button.closest('.city-tag').remove();
            showNotification('Город удален из зоны доставки', 'success');
        } else {
            showNotification('Ошибка при удалении города', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при удалении города', 'error');
    }
}

function searchProducts(query) {
    const rows = document.querySelectorAll('.table-row[data-product-id]');

    rows.forEach(row => {
        const productName = row.querySelector('.product-cell h4').textContent.toLowerCase();
        if (productName.includes(query.toLowerCase())) {
            row.style.display = 'grid';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterProducts() {
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const rows = document.querySelectorAll('.table-row[data-product-id]');

    rows.forEach(row => {
        const status = row.querySelector('.status-badge').classList.contains('active') ? 'active' : 'inactive';
        const category = row.querySelector('.col-category').textContent.trim();
        const categoryId = row.dataset.categoryId;

        let show = true;

        if (statusFilter && status !== statusFilter) {
            show = false;
        }

        if (categoryFilter && categoryId !== categoryFilter) {
            show = false;
        }

        row.style.display = show ? 'grid' : 'none';
    });
}

function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const rows = document.querySelectorAll('.order-row');

    rows.forEach(row => {
        const statusSelect = row.querySelector('.status-select');
        const status = statusSelect ? statusSelect.value : '';

        if (statusFilter && status !== statusFilter) {
            row.style.display = 'none';
        } else {
            row.style.display = 'grid';
        }
    });
}

function initializeCharts() {
    // График продаж по дням
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7'],
                datasets: [{
                    label: 'Продажи (₽)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // График категорий
    const categoriesCtx = document.getElementById('categoriesChart');
    if (categoriesCtx) {
        new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Гранит', 'Мрамор', 'Бетон', 'Металл'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c'
                    ]
                }]
            }
        });
    }
}

function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10000';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}