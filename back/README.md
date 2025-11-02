<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Система двухфакторной аутентификации (2FA) с использованием TOTP на базе NestJS, TypeScript, Prisma и PostgreSQL.

## Функциональность

- ✅ Регистрация и авторизация пользователей
- ✅ Настройка двухфакторной аутентификации (TOTP)
- ✅ Генерация QR-кодов для подключения к приложениям-аутентификаторам
- ✅ Верификация TOTP кодов
- ✅ Генерация резервных кодов
- ✅ JWT аутентификация
- ✅ Валидация входных данных
- ✅ Swagger документация
- ✅ Защита маршрутов guards

## Технологии

- **NestJS** - основной фреймворк
- **TypeScript** - язык программирования
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - база данных
- **JWT** - токены для аутентификации
- **Speakeasy** - генерация и верификация TOTP
- **QRCode** - генерация QR-кодов
- **Swagger** - документация API
- **Class-validator** - валидация входных данных
- **BCrypt** - хеширование паролей

## Структура проекта

```
src/
├── auth/                    # Модуль аутентификации
│   ├── dto/                # DTOs для валидации
│   ├── guards/             # Guards для защиты роутов
│   ├── strategies/         # JWT стратегия
│   ├── decorators/         # Кастомные декораторы
│   ├── types/              # Типы TypeScript
│   ├── auth.controller.ts  # Контроллер аутентификации
│   ├── auth.service.ts     # Сервис аутентификации
│   └── two-factor.service.ts # Сервис 2FA
├── users/                   # Модуль пользователей
│   ├── users.service.ts    # Сервис пользователей
│   └── users.module.ts     # Модуль пользователей
├── prisma/                  # Prisma конфигурация
│   ├── prisma.service.ts   # Сервис Prisma
│   └── prisma.module.ts    # Модуль Prisma
└── main.ts                  # Точка входа приложения
```

## API Endpoints

### Аутентификация

- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/login-2fa` - Вход с 2FA
- `GET /auth/profile` - Получение профиля пользователя

### Двухфакторная аутентификация

- `GET /auth/2fa/generate` - Генерация секрета для 2FA
- `POST /auth/2fa/enable` - Включение 2FA
- `POST /auth/2fa/disable` - Отключение 2FA
- `POST /auth/2fa/verify` - Верификация TOTP кода

## Примеры использования API

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. Генерация 2FA секрета

```bash
curl -X GET http://localhost:3000/auth/2fa/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Включение 2FA

```bash
curl -X POST http://localhost:3000/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "totpCode": "123456"
  }'
```

### 4. Вход с 2FA

```bash
curl -X POST http://localhost:3000/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "totpCode": "123456"
  }'
```

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

### 3. Запуск базы данных (PostgreSQL)

```bash
# Используя Docker
docker-compose up -d postgres

# Или установите PostgreSQL локально
# и создайте базу данных 'twofa_db'
```

### 4. Выполнение миграций

```bash
# Генерация Prisma клиента
npx prisma generate

# Выполнение миграций
npx prisma migrate dev --name init
```

### 5. Запуск приложения

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Автоматический запуск (все в одном скрипте)
./start-dev.sh
```

### 6. Доступ к API

- **Приложение:** http://localhost:3000
- **Swagger документация:** http://localhost:3000/api
- **Prisma Studio:** `npx prisma studio`

## Быстрый старт

1. Клонируйте репозиторий
2. Выполните: `chmod +x start-dev.sh && ./start-dev.sh`
3. Откройте http://localhost:3000/api для просмотра API документации

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Тестирование

### Автоматический тест API

```bash
# Современная версия (TypeScript)
npm run test:api

# Или напрямую
npx tsx test-api.ts

# Старая версия (JavaScript)
node test-api.js
```

### Коллекция Postman

Импортируйте файл `postman_collection.json` в Postman для быстрого тестирования всех endpoints.

### Ручное тестирование

1. Используйте приложение-аутентификатор (Google Authenticator, Authy, etc.)
2. Отсканируйте QR-код, полученный от `/auth/2fa/generate`
3. Введите 6-значный код из приложения для включения/верификации 2FA

## Безопасность

### Реализованные меры безопасности:

- ✅ Хеширование паролей с помощью bcrypt
- ✅ JWT токены для авторизации
- ✅ Валидация всех входных данных
- ✅ CORS настройки
- ✅ Тайм-аут для TOTP кодов (±60 секунд)
- ✅ Защита от несанкционированного доступа к 2FA endpoints

### Рекомендации для продакшена:

- Используйте HTTPS
- Настройте rate limiting
- Добавьте логирование действий пользователей
- Настройте мониторинг и алерты
- Регулярно обновляйте зависимости

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

```

```
