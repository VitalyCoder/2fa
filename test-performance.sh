#!/bin/bash

# Performance Test Script for 2FA Application
# Простой тест производительности приложения

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    log_info "Проверка зависимостей для тестирования..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl не установлен!"
        exit 1
    fi
    
    log_success "Все зависимости для тестирования установлены"
}

# Тест скорости ответа
test_response_time() {
    log_info "Тестирование времени ответа..."
    
    # Тест Frontend
    log_info "Тестирование Frontend..."
    frontend_time=$(curl -k -o /dev/null -s -w "%{time_total}" https://localhost/)
    echo "Frontend response time: ${frontend_time}s"
    
    # Тест API
    log_info "Тестирование API..."
    api_time=$(curl -k -o /dev/null -s -w "%{time_total}" https://localhost/api/)
    echo "API response time: ${api_time}s"
    
    # Тест Health Check
    log_info "Тестирование Health Check..."
    health_time=$(curl -o /dev/null -s -w "%{time_total}" http://health.localhost/health)
    echo "Health check response time: ${health_time}s"
    
    # Оценка производительности
    if (( $(echo "$frontend_time < 2.0" | bc -l) )); then
        log_success "Frontend время ответа отличное (<2s)"
    elif (( $(echo "$frontend_time < 5.0" | bc -l) )); then
        log_warning "Frontend время ответа приемлемое (2-5s)"
    else
        log_error "Frontend время ответа слишком медленное (>5s)"
    fi
    
    if (( $(echo "$api_time < 1.0" | bc -l) )); then
        log_success "API время ответа отличное (<1s)"
    elif (( $(echo "$api_time < 3.0" | bc -l) )); then
        log_warning "API время ответа приемлемое (1-3s)"
    else
        log_error "API время ответа слишком медленное (>3s)"
    fi
}

# Нагрузочный тест
load_test() {
    local concurrent_users=${1:-5}
    local requests_per_user=${2:-10}
    
    log_info "Запуск нагрузочного теста ($concurrent_users пользователей, $requests_per_user запросов каждый)..."
    
    # Создаем временный файл для результатов
    temp_file=$(mktemp)
    
    # Запускаем параллельные запросы
    for i in $(seq 1 $concurrent_users); do
        {
            for j in $(seq 1 $requests_per_user); do
                response_code=$(curl -k -o /dev/null -s -w "%{http_code}" https://localhost/)
                response_time=$(curl -k -o /dev/null -s -w "%{time_total}" https://localhost/)
                echo "$response_code,$response_time" >> "$temp_file"
            done
        } &
    done
    
    # Ждем завершения всех процессов
    wait
    
    # Анализируем результаты
    total_requests=$(wc -l < "$temp_file")
    successful_requests=$(grep -c "^200," "$temp_file")
    failed_requests=$((total_requests - successful_requests))
    
    if [ $total_requests -gt 0 ]; then
        success_rate=$((successful_requests * 100 / total_requests))
        avg_time=$(awk -F, '{sum+=$2; count++} END {print sum/count}' "$temp_file")
        
        echo "Результаты нагрузочного теста:"
        echo "  Всего запросов: $total_requests"
        echo "  Успешных: $successful_requests"
        echo "  Неудачных: $failed_requests"
        echo "  Успешность: $success_rate%"
        echo "  Среднее время ответа: ${avg_time}s"
        
        if [ $success_rate -ge 95 ]; then
            log_success "Отличная стабильность (≥95% успешных запросов)"
        elif [ $success_rate -ge 90 ]; then
            log_warning "Хорошая стабильность (90-95% успешных запросов)"
        else
            log_error "Низкая стабильность (<90% успешных запросов)"
        fi
    fi
    
    # Удаляем временный файл
    rm "$temp_file"
}

# Тест SSL сертификата
test_ssl() {
    log_info "Тестирование SSL сертификата..."
    
    ssl_info=$(echo | openssl s_client -connect localhost:443 2>/dev/null | openssl x509 -noout -dates)
    
    if [ $? -eq 0 ]; then
        log_success "SSL сертификат валиден"
        echo "$ssl_info"
    else
        log_error "Проблема с SSL сертификатом"
    fi
    
    # Проверка срока действия
    expire_date=$(echo | openssl s_client -connect localhost:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    expire_timestamp=$(date -d "$expire_date" +%s)
    current_timestamp=$(date +%s)
    days_left=$(( (expire_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_left -gt 30 ]; then
        log_success "SSL сертификат действителен еще $days_left дней"
    elif [ $days_left -gt 7 ]; then
        log_warning "SSL сертификат истекает через $days_left дней"
    else
        log_error "SSL сертификат истекает очень скоро ($days_left дней)"
    fi
}

# Тест безопасности headers
test_security_headers() {
    log_info "Проверка security headers..."
    
    headers=$(curl -k -I -s https://localhost/)
    
    # Проверяем важные заголовки
    security_headers=(
        "x-frame-options"
        "x-xss-protection" 
        "x-content-type-options"
        "referrer-policy"
        "content-security-policy"
    )
    
    for header in "${security_headers[@]}"; do
        if echo "$headers" | grep -i "$header" > /dev/null; then
            log_success "✓ $header присутствует"
        else
            log_warning "⚠ $header отсутствует"
        fi
    done
}

# Тест rate limiting
test_rate_limiting() {
    log_info "Тестирование rate limiting..."
    
    # Делаем много запросов быстро
    success_count=0
    rate_limited_count=0
    
    for i in {1..15}; do
        response_code=$(curl -k -o /dev/null -s -w "%{http_code}" https://localhost/api/)
        if [ "$response_code" = "200" ]; then
            ((success_count++))
        elif [ "$response_code" = "429" ]; then
            ((rate_limited_count++))
        fi
        sleep 0.1
    done
    
    echo "Успешных запросов: $success_count"
    echo "Заблокированных (429): $rate_limited_count"
    
    if [ $rate_limited_count -gt 0 ]; then
        log_success "Rate limiting работает корректно"
    else
        log_warning "Rate limiting может не работать (не обнаружено блокировок)"
    fi
}

# Основной тест
run_all_tests() {
    echo "🚀 Запуск комплексного теста производительности 2FA приложения"
    echo "================================================================"
    
    check_dependencies
    
    echo ""
    test_response_time
    
    echo ""
    load_test 3 5
    
    echo ""
    test_ssl
    
    echo ""
    test_security_headers
    
    echo ""
    test_rate_limiting
    
    echo ""
    log_success "Все тесты завершены!"
}

# Помощь
show_help() {
    echo "Performance Test Script для 2FA Application"
    echo ""
    echo "Использование: $0 [КОМАНДА] [ПАРАМЕТРЫ]"
    echo ""
    echo "Команды:"
    echo "  all                    Запустить все тесты"
    echo "  response               Тест времени ответа"
    echo "  load [users] [reqs]    Нагрузочный тест"
    echo "  ssl                    Тест SSL сертификата"
    echo "  security               Тест security headers"
    echo "  rate-limit             Тест rate limiting"
    echo "  help                   Показать справку"
    echo ""
    echo "Примеры:"
    echo "  $0 all"
    echo "  $0 load 10 20"
    echo "  $0 response"
}

# Проверяем, что приложение запущено
if ! curl -k -s https://localhost/ > /dev/null; then
    log_error "Приложение недоступно. Запустите его с помощью './manage.sh start'"
    exit 1
fi

# Основная логика
case "${1:-all}" in
    all)
        run_all_tests
        ;;
    response)
        test_response_time
        ;;
    load)
        load_test "${2:-5}" "${3:-10}"
        ;;
    ssl)
        test_ssl
        ;;
    security)
        test_security_headers
        ;;
    rate-limit)
        test_rate_limiting
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Неизвестная команда: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
