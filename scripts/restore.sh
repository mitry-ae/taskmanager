#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

set -a
source "$PROJECT_DIR/.env"
set +a

BACKUP_DIR="$PROJECT_DIR/backups"

# $1 — первый аргумент, с которым запустили скрипт: bash scripts/restore.sh путь/к/файлу
# "${1:-}" — если аргумент не передали, подставить пустую строку вместо ошибки
# (без этого set -u остановил бы скрипт с "unbound variable", если файл не указали)
if [ -n "${1:-}" ]; then
  BACKUP_FILE="$1"
else
  # ls -t сортирует по времени изменения, самые новые — первыми; head -n 1 берёт первую строку
  BACKUP_FILE="$(ls -t "$BACKUP_DIR"/backup_*.dump | head -n 1)"
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Файл не найден: $BACKUP_FILE" >&2
  exit 1
fi

echo "База: ${POSTGRES_DB}"
echo "Файл бэкапа: ${BACKUP_FILE}"
echo "ВНИМАНИЕ: все текущие данные в базе будут удалены и заменены данными из бэкапа."

# read -p "текст" answer — показать текст, остановиться и подождать ввод с клавиатуры,
# положить то, что ввели, в переменную answer. Так скрипт не удалит данные молча.
read -p "Продолжить? (y/n) " answer
if [ "$answer" != "y" ]; then
  echo "Отменено"
  exit 1
fi

cd "$PROJECT_DIR"

echo "Останавливаю app, чтобы он не писал в базу во время восстановления..."
docker compose stop app

# trap 'команда' EXIT — выполнить эту команду перед выходом из скрипта,
# независимо от того, как скрипт закончился: успешно, с ошибкой, вручную прерван и т.д.
# Это защита от ситуации "restore упал на середине — app остался остановлен навсегда".
trap 'echo "Запускаю app обратно..."; docker compose up -d --wait app' EXIT

echo "Восстанавливаю дамп..."
# --clean     — удалить существующие таблицы/объекты перед восстановлением
#               (иначе pg_restore будет пытаться создать то, что уже есть, и упадёт)
# --if-exists — не ругаться, если объекта, который пытаемся удалить, ещё нет
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists < "$BACKUP_FILE"

echo "Готово"
