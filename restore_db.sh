#!/bin/bash
set -e

# Экспортируем пароль
export PGPASSWORD=$DB_PASSWORD

# Ожидание готовности PostgreSQL
echo "Waiting for PostgreSQL to become available..."
until psql -h "$DB_HOST" -U "postgres" -c '\l' &>/dev/null; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - creating user and initializing database..."

# Создание пользователя (если он не существует)
if ! psql -h "$DB_HOST" -U "postgres" -Atqc "\\du \"$DB_USER\"" | grep -q "$DB_USER"; then
    echo "User '$DB_USER' doesn't exist, creating..."
    psql -h "$DB_HOST" -U "postgres" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
else
    echo "User '$DB_USER' already exists."
fi

# Предоставление пользователю полномочий суперпользователя (если требуется)
psql -h "$DB_HOST" -U "postgres" -c "ALTER ROLE $DB_USER SUPERUSER;"

# Проверка существования базы данных
if ! psql -h "$DB_HOST" -U "postgres" -lqt | cut -d '|' -f 1 | grep -qw "$DB_NAME"; then
    # Если база данных не существует, создадим её
    echo "Creating database '$DB_NAME'"
    createdb -h "$DB_HOST" -U "postgres" "$DB_NAME"
else
    echo "Database '$DB_NAME' already exists"
fi

# Установка владельца базы данных
psql -h "$DB_HOST" -U "postgres" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Применение SQL-дампа
echo "Applying SQL dump..."
psql -h "$DB_HOST" -d "$DB_NAME" -U "$DB_USER" -f "/docker-entrypoint-initdb.d/universities.sql"

echo "Database restoration complete."