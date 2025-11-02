#!/bin/bash

# 2FA Project Management Script
# Скрипт для управления 2FA приложением

set -e

PROJECT_DIR="/Users/vitalyfrolov/Desktop/2fa"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

# Функции для цветного вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка зависимостей
check_dependencies() {
    log_info "Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose не установлен!"
        exit 1
    fi
    
    log_success "Все зависимости установлены"
}

# Тестирование nginx конфигурации
test_nginx() {
    log_info "Тестирование конфигурации nginx..."
    cd "$PROJECT_DIR"
    
    if docker-compose run --rm nginx nginx -t > /dev/null 2>&1; then
        log_success "Конфигурация nginx корректна"
    else
        log_error "Ошибка в конфигурации nginx"
        docker-compose run --rm nginx nginx -t
        exit 1
    fi
}

# Запуск приложения
start() {
    log_info "Запуск 2FA приложения..."
    cd "$PROJECT_DIR"
    
    check_dependencies
    test_nginx
    
    docker-compose up -d
    
    # Ждем запуска сервисов
    log_info "Ожидание запуска сервисов..."
    sleep 10
    
    # Проверка состояния
    if docker-compose ps | grep -q "Up"; then
        log_success "Приложение успешно запущено!"
        echo ""
        echo "🌐 Доступные endpoints:"
        echo "   Frontend: https://localhost (HTTP автоматически перенаправляется)"
        echo "   API:      https://localhost/api/"
        echo "   Health:   http://health.localhost/health"
        echo ""
        echo "📊 Состояние контейнеров:"
        docker-compose ps
    else
        log_error "Ошибка при запуске приложения"
        exit 1
    fi
}

# Остановка приложения
stop() {
    log_info "Остановка 2FA приложения..."
    cd "$PROJECT_DIR"
    
    docker-compose down
    log_success "Приложение остановлено"
}

# Перезапуск приложения
restart() {
    log_info "Перезапуск 2FA приложения..."
    stop
    start
}

# Показать логи
logs() {
    cd "$PROJECT_DIR"
    
    if [ -n "$1" ]; then
        log_info "Показ логов сервиса: $1"
        docker-compose logs -f "$1"
    else
        log_info "Показ логов всех сервисов"
        docker-compose logs -f
    fi
}

# Показать состояние
status() {
    cd "$PROJECT_DIR"
    
    log_info "Состояние сервисов:"
    docker-compose ps
    
    echo ""
    log_info "Тест подключений:"
    
    # Тест HTTP redirect
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "301"; then
        log_success "HTTP → HTTPS редирект работает"
    else
        log_error "HTTP редирект не работает"
    fi
    
    # Тест HTTPS
    if curl -k -s -o /dev/null -w "%{http_code}" https://localhost | grep -q "200"; then
        log_success "HTTPS frontend доступен"
    else
        log_error "HTTPS frontend недоступен"
    fi
    
    # Тест API
    if curl -k -s -o /dev/null -w "%{http_code}" https://localhost/api/ | grep -q "200"; then
        log_success "API доступно"
    else
        log_error "API недоступно"
    fi
    
    # Тест Health Check
    if curl -s http://health.localhost/health | grep -q "healthy"; then
        log_success "Health check работает"
    else
        log_error "Health check не работает"
    fi
}

# Очистка (остановка и удаление контейнеров, volumes, images)
clean() {
    log_warning "Очистка всех данных приложения..."
    cd "$PROJECT_DIR"
    
    read -p "Вы уверены? Это удалит все данные БД и контейнеры. [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker-compose rm -f
        log_success "Очистка завершена"
    else
        log_info "Очистка отменена"
    fi
}

# Показать помощь
help() {
    echo "2FA Project Management Script"
    echo ""
    echo "Использование: $0 [КОМАНДА]"
    echo ""
    echo "Команды:"
    echo "  start           Запустить приложение"
    echo "  stop            Остановить приложение"
    echo "  restart         Перезапустить приложение"
    echo "  status          Показать состояние сервисов"
    echo "  logs [service]  Показать логи (всех сервисов или конкретного)"
    echo "  test-nginx      Протестировать конфигурацию nginx"
    echo "  clean           Очистить все данные (ОСТОРОЖНО!)"
    echo "  help            Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 start"
    echo "  $0 logs nginx"
    echo "  $0 status"
}

# Основная логика
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    test-nginx)
        test_nginx
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Неизвестная команда: $1"
        echo ""
        help
        exit 1
        ;;
esac
