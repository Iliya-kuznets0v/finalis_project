#!/usr/bin/env python
import os
import sys
import subprocess


def run_command(command):
    """Выполняет команду и выводит результат"""
    print(f"🚀 Выполняю: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Ошибка: {result.stderr}")
        return False
    print(f"✅ Успешно: {result.stdout}")
    return True


def setup_project():
    """Настраивает проект с нуля"""

    print("🔧 Начинаю настройку проекта Finalis...")

    # 1. Удаляем старую базу
    if os.path.exists('db.sqlite3'):
        os.remove('db.sqlite3')
        print("🗑️  Удалена старая база данных")

    # 2. Удаляем старые миграции
    for app in ['users', 'catalog', 'orders', 'reviews', 'core', 'suppliers']:
        migrations_dir = f'apps/{app}/migrations'
        if os.path.exists(migrations_dir):
            for file in os.listdir(migrations_dir):
                if file != '__init__.py':
                    os.remove(os.path.join(migrations_dir, file))
            print(f"🗑️  Очищены миграции для {app}")

    # 3. Создаем миграции
    if not run_command('python manage.py makemigrations'):
        return False

    # 4. Применяем миграции
    if not run_command('python manage.py migrate'):
        return False

    # 5. Создаем суперпользователя (интерактивно)
    print("👤 Создайте суперпользователя:")
    subprocess.run('python manage.py createsuperuser', shell=True)

    # 6. Создаем тестовые данные
    if not run_command('python manage.py create_test_data'):
        return False

    print("🎉 Проект успешно настроен!")
    print("🌐 Запустите сервер: python manage.py runserver")
    print("📱 Откройте: http://localhost:8000/")


if __name__ == "__main__":
    setup_project()