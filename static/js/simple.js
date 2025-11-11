// Упрощенный JavaScript без API вызовов
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация избранного
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const icon = this.querySelector('i');

            if (icon.classList.contains('bi-heart')) {
                icon.classList.remove('bi-heart');
                icon.classList.add('bi-heart-fill');
                this.style.color = '#667eea';
                showNotification('Товар добавлен в избранное', 'success');
            } else {
                icon.classList.remove('bi-heart-fill');
                icon.classList.add('bi-heart');
                this.style.color = '';
                showNotification('Товар удален из избранного', 'success');
            }
        });
    });

    // Инициализация корзины
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Товар добавлен в корзину', 'success');
            updateCartCounter();
        });
    });

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
    }
});

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

function updateCartCounter() {
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        const currentCount = parseInt(cartCounter.textContent) || 0;
        cartCounter.textContent = currentCount + 1;
    }
}