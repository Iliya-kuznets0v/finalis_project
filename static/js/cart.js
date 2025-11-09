// JavaScript для корзины
document.addEventListener('DOMContentLoaded', function() {
    // Изменение количества товара
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            const itemElement = this.closest('.cart-item');
            const quantityInput = itemElement.querySelector('.quantity-input');
            let quantity = parseInt(quantityInput.value);
            const itemId = itemElement.dataset.itemId;

            if (action === 'increase' && quantity < 10) {
                quantity++;
            } else if (action === 'decrease' && quantity > 1) {
                quantity--;
            }

            if (quantity !== parseInt(quantityInput.value)) {
                updateCartItemQuantity(itemId, quantity, itemElement);
            }
        });
    });

    // Удаление товара из корзины
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.itemId;
            const itemElement = this.closest('.cart-item');
            removeCartItem(itemId, itemElement);
        });
    });

    // Оформление заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            proceedToCheckout();
        });
    }
});

async function updateCartItemQuantity(itemId, quantity, itemElement) {
    try {
        const response = await fetch(`/api/cart/items/${itemId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ quantity: quantity })
        });

        if (response.ok) {
            const data = await response.json();
            itemElement.querySelector('.quantity-input').value = quantity;
            itemElement.querySelector('.total').textContent = `× ${quantity} = ${data.total_price} ₽`;

            // Обновляем общую сумму
            updateOrderSummary(data.cart_total);

            showNotification('Количество товара обновлено', 'success');
        } else {
            showNotification('Ошибка при обновлении количества', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при обновлении количества', 'error');
    }
}

async function removeCartItem(itemId, itemElement) {
    if (!confirm('Удалить товар из корзины?')) return;

    try {
        const response = await fetch(`/api/cart/items/${itemId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            itemElement.style.opacity = '0';
            setTimeout(() => {
                itemElement.remove();
                updateCartCounter();

                // Проверяем, пуста ли корзина
                const remainingItems = document.querySelectorAll('.cart-item').length;
                if (remainingItems === 0) {
                    location.reload(); // Перезагружаем для показа пустой корзины
                } else {
                    // Обновляем общую сумму
                    fetchCartSummary();
                }
            }, 300);

            showNotification('Товар удален из корзины', 'success');
        } else {
            showNotification('Ошибка при удалении товара', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при удалении товара', 'error');
    }
}

async function fetchCartSummary() {
    try {
        const response = await fetch('/api/cart/summary/');
        if (response.ok) {
            const data = await response.json();
            updateOrderSummary(data);
        }
    } catch (error) {
        console.error('Error fetching cart summary:', error);
    }
}

function updateOrderSummary(summary) {
    // Обновляем элементы на странице с новыми данными
    const totalPriceElement = document.querySelector('.summary-row.total .final-price');
    const itemsPriceElement = document.querySelector('.summary-row:first-child span:last-child');
    const deliveryPriceElement = document.querySelector('.delivery-info');
    const itemsCountElement = document.querySelector('.items-count');

    if (totalPriceElement) totalPriceElement.textContent = `${summary.final_price} ₽`;
    if (itemsPriceElement) itemsPriceElement.textContent = `${summary.total_price} ₽`;
    if (deliveryPriceElement) {
        deliveryPriceElement.textContent = summary.delivery_price === 0 ? 'Бесплатно' : `${summary.delivery_price} ₽`;
    }
    if (itemsCountElement) itemsCountElement.textContent = `${summary.total_quantity} товар(ов)`;
}

async function proceedToCheckout() {
    try {
        const response = await fetch('/api/orders/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Перенаправляем на страницу оформления заказа
            window.location.href = `/orders/${data.order_id}/checkout/`;
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Ошибка при создании заказа', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при создании заказа', 'error');
    }
}