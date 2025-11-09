// Основной JavaScript файл
document.addEventListener('DOMContentLoaded', function() {
    // Фильтры
    const toggleFilters = document.getElementById('toggleFilters');
    const closeFilters = document.getElementById('closeFilters');
    const filtersContainer = document.getElementById('filtersContainer');

    if (toggleFilters && closeFilters && filtersContainer) {
        toggleFilters.addEventListener('click', function() {
            filtersContainer.classList.toggle('active');
        });

        closeFilters.addEventListener('click', function() {
            filtersContainer.classList.remove('active');
        });

        document.addEventListener('click', function(event) {
            if (!filtersContainer.contains(event.target) &&
                !toggleFilters.contains(event.target) &&
                filtersContainer.classList.contains('active')) {
                filtersContainer.classList.remove('active');
            }
        });
    }

    // Выбор города
    const citySelector = document.getElementById('citySelector');
    if (citySelector) {
        citySelector.addEventListener('click', function() {
            showCitySelectionModal();
        });
    }

    // Активное состояние нижнего меню
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Добавление в избранное
    const favoriteButtons = document.querySelectorAll('.btn-secondary');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const productId = this.dataset.productId;

            if (icon.classList.contains('bi-heart')) {
                // Добавить в избранное
                addToFavorites(productId, this);
            } else {
                // Удалить из избранного
                removeFromFavorites(productId, this);
            }
        });
    });

    // Добавление в корзину
    const addToCartButtons = document.querySelectorAll('.btn-primary');
    addToCartButtons.forEach(button => {
        if (button.textContent.includes('корзин')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                addToCart(productId);
            });
        }
    });

    // Поиск с автодополнением
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let timeoutId;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                performSearch(this.value);
            }, 500);
        });
    }
});

// Функции для работы с API
async function addToFavorites(productId, button) {
    try {
        const response = await fetch('/api/favorites/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ product_id: productId })
        });

        if (response.ok) {
            const icon = button.querySelector('i');
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
            button.style.color = '#667eea';
            showNotification('Товар добавлен в избранное', 'success');
        } else {
            showNotification('Ошибка при добавлении в избранное', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при добавлении в избранное', 'error');
    }
}

async function removeFromFavorites(productId, button) {
    try {
        const response = await fetch(`/api/favorites/${productId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            const icon = button.querySelector('i');
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
            button.style.color = '#2c3e50';
            showNotification('Товар удален из избранного', 'success');
        } else {
            showNotification('Ошибка при удалении из избранного', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при удалении из избранного', 'error');
    }
}

async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart/items/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        if (response.ok) {
            showNotification('Товар добавлен в корзину', 'success');
            updateCartCounter();
        } else {
            showNotification('Ошибка при добавлении в корзину', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при добавлении в корзину', 'error');
    }
}

function showCitySelectionModal() {
    // Здесь будет модальное окно выбора города
    const modalHtml = `
        <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 20px; border-radius: 12px; width: 90%; max-width: 400px;">
                <h3 style="margin-bottom: 15px;">Выберите город</h3>
                <input type="text" placeholder="Поиск города..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                <div style="max-height: 300px; overflow-y: auto;">
                    <div class="city-option" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;">Москва</div>
                    <div class="city-option" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;">Санкт-Петербург</div>
                    <div class="city-option" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;">Новосибирск</div>
                    <div class="city-option" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;">Екатеринбург</div>
                </div>
                <button onclick="this.closest('.modal-overlay').remove()" style="margin-top: 15px; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; width: 100%; cursor: pointer;">Закрыть</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Добавляем обработчики для выбора города
    document.querySelectorAll('.city-option').forEach(option => {
        option.addEventListener('click', function() {
            const cityName = this.textContent;
            document.getElementById('currentCity').textContent = cityName;
            document.querySelector('.modal-overlay').remove();
            // Сохраняем выбор города
            localStorage.setItem('selectedCity', cityName);
        });
    });
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

function updateCartCounter() {
    // Обновление счетчика корзины
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        // Запрос к API для получения количества товаров в корзине
        fetch('/api/cart/')
            .then(response => response.json())
            .then(data => {
                cartCounter.textContent = data.total_items || 0;
            });
    }
}