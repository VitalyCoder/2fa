# Nginx Configuration для 2FA приложения

Эта конфигурация nginx обеспечивает:

## Основные возможности

1. **SSL/TLS терминация**: Автоматическое перенаправление HTTP на HTTPS
2. **Reverse proxy**: Проксирование запросов к клиенту (Next.js) и серверу (NestJS)
3. **Rate limiting**: Защита от DDoS и брутфорс атак
4. **Health checks**: Мониторинг состояния сервисов
5. **Оптимизация производительности**: Gzip сжатие, кэширование

## Структура файлов

```
nginx/
├── conf.d/
│   ├── default.conf    # Основная конфигурация с SSL и proxy
│   ├── gzip.conf      # Настройки сжатия и оптимизации
│   ├── health.conf    # Health check endpoints
│   └── limits.conf    # Rate limiting и защита от злоупотреблений
└── certs/
    ├── server.crt     # SSL сертификат (самоподписанный для dev)
    └── server.key     # Приватный ключ SSL
```

## Endpoints

- `https://localhost/` - Frontend приложение (Next.js)
- `https://localhost/api/` - Backend API (NestJS)
- `https://localhost/api/auth/` - Аутентификация (с дополнительными лимитами)
- `http://health.localhost/health` - Health check nginx
- `http://health.localhost/api/health` - Health check API сервера
- `http://health.localhost/client/health` - Health check клиента

## Rate Limiting

- **Общие запросы**: 1 запрос/сек
- **API запросы**: 10 запросов/сек
- **Аутентификация**: 5 запросов/мин (максимум 3 в burst)
- **Соединения**: До 10 одновременных соединений с одного IP

## Заголовки безопасности

- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `Referrer-Policy: no-referrer-when-downgrade`

## Для продакшена

⚠️ **Важно**: Для продакшена замените самоподписанный сертификат на настоящий от Let's Encrypt или другого CA:

```bash
# Пример получения сертификата от Let's Encrypt
certbot certonly --standalone -d yourdomain.com
```

И обновите пути в `default.conf`:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

## Мониторинг

Логи nginx доступны в контейнере:
- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`

Для просмотра логов:
```bash
docker logs nginx -f
```

## Тестирование конфигурации

Проверьте конфигурацию перед запуском:
```bash
docker-compose exec nginx nginx -t
```

Перезагрузка конфигурации без перезапуска контейнера:
```bash
docker-compose exec nginx nginx -s reload
```
