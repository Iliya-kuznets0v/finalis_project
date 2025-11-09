// JavaScript для избранного
document.addEventListener('DOMContentLoaded', function() {
    // Удаление из избранного
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const favoriteItem = this.closest('.favorite-item');
            removeFromFavorites(productId, favoriteItem);
        });
    });

    // Добавление в корзину из избранного
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            addToCartFromFavorites(productId, this);
        });
    });

    // Групповые действия
    const addAllToCartBtn = document.getElementById('addAllToCart');
    const clearFavoritesBtn = document.getElementById('clearFavorites');

    if (addAllToCartBtn) {
        addAllToCartBtn.addEventListener('click', addAllToCart);
    }

    if (clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    }
});

async function removeFromFavorites(productId, favoriteItem) {
    try {
        const response = await fetch(`/api/favorites/${productId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            // Анимация удаления
            favoriteItem.style.opacity = '0';
            favoriteItem.style.transform = 'translateX(100px)';

            setTimeout(() => {
                favoriteItem.remove();
                updateFavoritesCount();

                // Проверяем, пусто ли избранное
                const remainingItems = document.querySelectorAll('.favorite-item').length;
                if (remainingItems === 0) {
                    location.reload(); // Показываем пустое состояние
                }
            }, 300);

            showNotification('Товар удален из избранного', 'success');
        } else {
            showNotification('Ошибка при удалении из избранного', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при удалении из избранного', 'error');
    }
}

async function addToCartFromFavorites(productId, button) {
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
            // Визуальный фидбэк
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check"></i> Добавлено';
            button.style.background = '#27ae60';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);

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

async function addAllToCart() {
    const favoriteItems = document.querySelectorAll('.favorite-item');
    const productIds = Array.from(favoriteItems).map(item => item.dataset.productId);

    if (productIds.length === 0) {
        showNotification('Нет товаров для добавления', 'info');
        return;
    }

    const addAllBtn = document.getElementById('addAllToCart');
    const originalText = addAllBtn.innerHTML;
    addAllBtn.innerHTML = '<i class="bi bi-arrow-repeat bi-spin"></i> Добавляем...';
    addAllBtn.disabled = true;

    try {
        let successCount = 0;

        for (const productId of productIds) {
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
                    successCount++;
                }
            } catch (error) {
                console.error(`Error adding product ${productId}:`, error);
            }
        }

        if (successCount > 0) {
            showNotification(`Добавлено ${successCount} товаров в корзину`, 'success');
            updateCartCounter();
        } else {
            showNotification('Не удалось добавить товары в корзину', 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при добавлении товаров', 'error');
    } finally {
        addAllBtn.innerHTML = originalText;
        addAllBtn.disabled = false;
    }
}

async function clearAllFavorites() {
    if (!confirm('Очистить все избранное?')) return;

    const clearBtn = document.getElementById('clearFavorites');
    const originalText = clearBtn.innerHTML;
    clearBtn.innerHTML = '<i class="bi bi-arrow-repeat bi-spin"></i> Очищаем...';
    clearBtn.disabled = true;

    try {
        const response = await fetch('/api/favorites/clear/', {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            // Анимация очистки всех элементов
            const favoriteItems = document.querySelectorAll('.favorite-item');
            favoriteItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(100px)';
                }, index * 100);
            });

            setTimeout(() => {
                location.reload(); // Показываем пустое состояние
            }, favoriteItems.length * 100 + 300);

            showNotification('Избранное очищено', 'success');
        } else {
            showNotification('Ошибка при очистке избранного', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при очистке избранного', 'error');
    } finally {
        clearBtn.innerHTML = originalText;
        clearBtn.disabled = false;
    }
}

function updateFavoritesCount() {
    const countElement = document.querySelector('.favorites-count');
    if (countElement) {
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = `${currentCount - 1} товар(ов)`;
    }
}