// Упрощенный JavaScript без API вызовов - только формы
// Обработка кликабельных карточек товаров
document.addEventListener('DOMContentLoaded', function() {
    // Делаем карточки товаров кликабельными
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Игнорируем клики по кнопкам и формам
            if (e.target.closest('button') || e.target.closest('form') || e.target.closest('a')) {
                return;
            }

            // Находим ссылку на детальную страницу
            const link = this.querySelector('.product-card-link');
            if (link) {
                window.location.href = link.href;
            }
        });
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
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

    // Обработка форм добавления в корзину
    document.querySelectorAll('form[action*="add_to_cart"]').forEach(form => {
        form.addEventListener('submit', function(e) {
            // Показываем уведомление сразу
            showNotification('Товар добавляется в корзину...', 'info');
        });
    });

    // Обработка форм удаления из корзины
    document.querySelectorAll('.remove-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Удалить товар из корзины?')) {
                e.preventDefault();
            }
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

    // Переключение вкладок в личном кабинете
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
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.add('active');
            }
        });
    });
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10000';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '6px';
    notification.style.fontWeight = '500';

    if (type === 'success') {
        notification.style.background = '#d4edda';
        notification.style.color = '#155724';
        notification.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        notification.style.background = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.border = '1px solid #f5c6cb';
    } else if (type === 'info') {
        notification.style.background = '#cce7ff';
        notification.style.color = '#004085';
        notification.style.border = '1px solid #b3d7ff';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}