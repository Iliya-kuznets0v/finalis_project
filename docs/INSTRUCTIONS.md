
# Запуск проекта (локально с Docker)

Требования: Docker и docker-compose установлены.

1. Скопируйте `.env` и установите `SECRET_KEY` безопасно (или используйте тот, что в архиве для dev).
2. Запустите сервисы:
   ```bash
   docker-compose up --build
   ```
   - Это запустит: Postgres, Redis, web (gunicorn), celery, celery-beat, nginx.
3. Примените миграции (в другом терминале):
   ```bash
   docker-compose exec web python manage.py migrate
   docker-compose exec web python manage.py createsuperuser
   ```
4. Соберите static (если нужно):
   ```bash
   docker-compose exec web python manage.py collectstatic --noinput
   ```
5. Откройте в браузере: http://localhost/

Примечания:
- Для локальной разработки можно выставить DEBUG=1 в `.env` (уже установлен).
- Для продакшна измените DEBUG=0 и настройте безопасный SECRET_KEY и ALLOWED_HOSTS.
