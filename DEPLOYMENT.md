# Deployment Guide - 2FA Application

Это руководство поможет вам развернуть 2FA приложение в различных окружениях.

## 📋 Подготовка к деплою

### 1. Безопасность

**Обязательно измените следующие значения в `.env`:**

```bash
# Сгенерируйте новые секреты
JWT_SECRET="$(openssl rand -base64 32)"
POSTGRES_PASSWORD="$(openssl rand -base64 24)"

# Обновите имя приложения
APP_NAME="Your Production App Name"
```

### 2. SSL сертификаты

**Для продакшена получите настоящие SSL сертификаты:**

```bash
# Использование Let's Encrypt (рекомендуется)
certbot certonly --standalone -d yourdomain.com

# Скопируйте сертификаты
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/certs/server.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/certs/server.key
```

### 3. Домен и DNS

Обновите конфигурацию nginx для вашего домена:

```nginx
# В nginx/conf.d/default.conf замените:
server_name localhost;
# на:
server_name yourdomain.com;
```

## 🚀 Варианты деплоя

### Option 1: VPS/Dedicated Server

1. **Подготовка сервера:**

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установите Docker Compose
sudo apt install docker-compose-plugin -y

# Создайте пользователя для приложения
sudo useradd -m -s /bin/bash app
sudo usermod -aG docker app
```

2. **Деплой приложения:**

```bash
# Склонируйте репозиторий
git clone <your-repo-url> /opt/2fa-app
cd /opt/2fa-app

# Настройте окружение
cp .env.example .env
nano .env  # Отредактируйте настройки

# Настройте SSL сертификаты
# (см. раздел SSL сертификаты выше)

# Запустите приложение
./manage.sh start
```

3. **Настройка автозапуска:**

```bash
# Создайте systemd service
sudo tee /etc/systemd/system/2fa-app.service > /dev/null <<EOF
[Unit]
Description=2FA Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/2fa-app
ExecStart=/opt/2fa-app/manage.sh start
ExecStop=/opt/2fa-app/manage.sh stop
User=app

[Install]
WantedBy=multi-user.target
EOF

# Включите и запустите сервис
sudo systemctl enable 2fa-app.service
sudo systemctl start 2fa-app.service
```

### Option 2: Docker Swarm

1. **Инициализация Swarm:**

```bash
docker swarm init
```

2. **Создайте secrets:**

```bash
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-db-password" | docker secret create db_password -
```

3. **Разверните стек:**

```bash
docker stack deploy -c docker-compose.yml 2fa-stack
```

### Option 3: Kubernetes

1. **Создайте namespace:**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: 2fa-app
```

2. **Создайте ConfigMap и Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: 2fa-secrets
  namespace: 2fa-app
type: Opaque
stringData:
  jwt-secret: 'your-jwt-secret-here'
  db-password: 'your-db-password-here'
```

3. **Разверните приложение:** (создайте соответствующие Deployment, Service, Ingress манифесты)

### Option 4: Cloud Platforms

#### AWS ECS/Fargate

- Используйте AWS ECS с Docker Compose интеграцией
- Настройте Application Load Balancer для SSL терминации
- Используйте AWS RDS для PostgreSQL
- Используйте AWS Secrets Manager для секретов

#### Google Cloud Run

- Разверните каждый сервис отдельно в Cloud Run
- Используйте Cloud SQL для PostgreSQL
- Настройте Cloud Load Balancer

#### Azure Container Instances

- Используйте Azure Container Instances
- Настройте Azure Database for PostgreSQL
- Используйте Azure Key Vault для секретов

## 🔒 Безопасность в продакшене

### 1. Firewall настройки

```bash
# Откройте только необходимые порты
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Nginx безопасность

Добавьте в конфигурацию nginx:

```nginx
# Скрыть версию nginx
server_tokens off;

# Дополнительные security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 3. Мониторинг и логирование

```bash
# Настройте ротацию логов
sudo tee /etc/logrotate.d/2fa-app > /dev/null <<EOF
/opt/2fa-app/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 app app
}
EOF
```

### 4. Резервное копирование

```bash
# Создайте скрипт для бэкапа БД
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec postgres_twofactor pg_dump -U postgres postgres_twofactor > \
  "$BACKUP_DIR/db_backup_$DATE.sql"

# Удалите старые бэкапы (оставьте последние 30)
find $BACKUP_DIR -name "db_backup_*.sql" -type f -mtime +30 -delete
```

## 🔍 Мониторинг

### Health Checks

Настройте мониторинг следующих endpoints:

- `https://yourdomain.com/` - Frontend
- `https://yourdomain.com/api/` - API
- `http://yourdomain.com/health` - Nginx health

### Метрики для отслеживания

- Время отклика приложения
- Использование CPU и памяти
- Использование дискового пространства
- Количество активных подключений к БД
- Частота ошибок аутентификации

### Alerting

Настройте уведомления для:

- Недоступность сервисов
- Высокое использование ресурсов
- Превышение лимитов rate limiting
- Ошибки в логах приложения

## 📊 Performance Tuning

### PostgreSQL оптимизация

```postgresql
-- Настройки для production в postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
```

### Nginx оптимизация

```nginx
# В nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 15;
client_max_body_size 50m;
```

## 🔄 CI/CD Pipeline

Пример GitHub Actions workflow:

```yaml
name: Deploy 2FA App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/2fa-app
            git pull origin main
            ./manage.sh restart
```

## 🆘 Troubleshooting

### Общие проблемы

1. **SSL сертификаты не работают**

   - Проверьте права доступа к файлам сертификатов
   - Убедитесь, что домен указан правильно
   - Проверьте срок действия сертификатов

2. **База данных недоступна**

   - Проверьте настройки подключения
   - Убедитесь, что контейнер PostgreSQL запущен
   - Проверьте сетевые настройки Docker

3. **Высокая нагрузка**
   - Увеличьте количество worker процессов nginx
   - Настройте кэширование статических файлов
   - Оптимизируйте запросы к БД

### Полезные команды для диагностики

```bash
# Проверка статуса всех сервисов
./manage.sh status

# Проверка логов всех сервисов
./manage.sh logs

# Проверка использования ресурсов
docker stats

# Проверка сетевых соединений
ss -tulpn | grep -E ':80|:443|:3000|:4200|:5432'
```
