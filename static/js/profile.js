// JavaScript для личного кабинета
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
        });
    });

    // Редактирование профиля
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    const cancelEditBtn = document.querySelector('.cancel-btn');

    if (editProfileBtn && editProfileForm) {
        editProfileBtn.addEventListener('click', function() {
            editProfileForm.style.display = 'block';
            this.style.display = 'none';
        });

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
                editProfileForm.style.display = 'none';
                editProfileBtn.style.display = 'flex';
            });
        }

        // Отправка формы редактирования
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile(this);
        });
    }

    // Смена пароля
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const cancelPasswordBtn = document.querySelector('.cancel-password');

    if (changePasswordBtn && changePasswordForm) {
        changePasswordBtn.addEventListener('click', function() {
            changePasswordForm.style.display = 'block';
            this.style.display = 'none';
        });

        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', function() {
                changePasswordForm.style.display = 'none';
                changePasswordBtn.style.display = 'block';
            });
        }

        // Отправка формы смены пароля
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword(this);
        });
    }

    // Удаление из избранного
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const favoriteItem = this.closest('.favorite-item');
            removeFromFavorites(productId, favoriteItem);
        });
    });

    // Кнопки оставить отзыв
    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            openReviewModal(orderId);
        });
    });

    // Редактирование отзывов
    document.querySelectorAll('.edit-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.dataset.reviewId;
            editReview(reviewId);
        });
    });

    // Удаление отзывов
    document.querySelectorAll('.delete-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.dataset.reviewId;
            deleteReview(reviewId);
        });
    });
});

async function updateProfile(form) {
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/user/profile/', {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('Профиль успешно обновлен', 'success');
            // Обновляем данные на странице
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Ошибка при обновлении профиля', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при обновлении профиля', 'error');
    }
}

async function changePassword(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/user/change-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Пароль успешно изменен', 'success');
            form.reset();
            form.style.display = 'none';
            document.getElementById('changePasswordBtn').style.display = 'block';
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Ошибка при смене пароля', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при смене пароля', 'error');
    }
}

async function removeFromFavorites(productId, favoriteItem) {
    try {
        const response = await fetch(`/api/favorites/${productId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            favoriteItem.style.opacity = '0';
            setTimeout(() => {
                favoriteItem.remove();
                updateFavoritesCount();
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

function updateFavoritesCount() {
    const favoritesCount = document.querySelectorAll('.favorite-item').length;
    const navBadge = document.querySelector('[data-tab="favorites"] .nav-badge');
    const previewCount = document.querySelector('.favorites-preview .favorite-item').length;

    if (navBadge) {
        navBadge.textContent = favoritesCount;
    }

    // Если товаров не осталось, показываем пустое состояние
    if (favoritesCount === 0) {
        const favoritesTab = document.getElementById('favorites-tab');
        favoritesTab.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-heart"></i>
                <h3>В избранном пока ничего нет</h3>
                <p>Добавляйте товары в избранное, чтобы не потерять</p>
                <a href="/catalog/" class="btn-primary">Перейти в каталог</a>
            </div>
        `;
    }
}

function openReviewModal(orderId) {
    // Создаем модальное окно для отзыва
    const modalHtml = `
        <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem;">
            <div style="background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-bottom: 1.5rem; color: #2c3e50;">Оставить отзыв</h3>
                <form id="reviewForm">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #2c3e50; font-weight: 600;">Оценка</label>
                        <div class="rating-stars" style="display: flex; gap: 5px; margin-bottom: 1rem;">
                            ${[1,2,3,4,5].map(i => `
                                <i class="bi bi-star" data-rating="${i}" style="font-size: 1.5rem; color: #ddd; cursor: pointer;"></i>
                            `).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #2c3e50; font-weight: 600;">Заголовок</label>
                        <input type="text" name="title" class="form-input" placeholder="Краткий заголовок отзыва" required>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #2c3e50; font-weight: 600;">Текст отзыва</label>
                        <textarea name="text" rows="4" class="form-input" placeholder="Подробно опишите ваши впечатления..." required></textarea>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn-secondary cancel-review">Отмена</button>
                        <button type="submit" class="btn-primary">Отправить отзыв</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Обработка рейтинга
    const stars = document.querySelectorAll('.rating-stars .bi-star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            selectedRating = rating;

            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                    s.style.color = '#ffc107';
                } else {
                    s.classList.remove('bi-star-fill');
                    s.classList.add('bi-star');
                    s.style.color = '#ddd';
                }
            });
        });
    });

    // Отмена
    document.querySelector('.cancel-review').addEventListener('click', function() {
        document.querySelector('.modal-overlay').remove();
    });

    // Отправка формы
    document.getElementById('reviewForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview(orderId, selectedRating, this);
    });
}

async function submitReview(orderId, rating, form) {
    if (rating === 0) {
        showNotification('Пожалуйста, поставьте оценку', 'error');
        return;
    }

    const formData = new FormData(form);
    const data = {
        order_id: orderId,
        rating: rating,
        title: formData.get('title'),
        text: formData.get('text')
    };

    try {
        const response = await fetch('/api/reviews/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Отзыв успешно добавлен', 'success');
            document.querySelector('.modal-overlay').remove();
            // Обновляем список отзывов
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            const error = await response.json();
            showNotification(error.detail || 'Ошибка при добавлении отзыва', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при добавлении отзыва', 'error');
    }
}

async function editReview(reviewId) {
    // Реализация редактирования отзыва
    showNotification('Функция редактирования в разработке', 'info');
}

async function deleteReview(reviewId) {
    if (!confirm('Удалить этот отзыв?')) return;

    try {
        const response = await fetch(`/api/reviews/${reviewId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (response.ok) {
            showNotification('Отзыв удален', 'success');
            // Обновляем список отзывов
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showNotification('Ошибка при удалении отзыва', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка при удалении отзыва', 'error');
    }
}