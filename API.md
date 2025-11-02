# API Documentation - 2FA Application

Документация API для приложения двухфакторной аутентификации.

## 🔗 Base URL

```
Development: https://localhost/api
Production:  https://yourdomain.com/api
```

## 🔐 Authentication

API использует JWT токены для аутентификации. Токен должен быть передан в заголовке:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints

### Authentication Endpoints

#### POST /auth/register

Регистрация нового пользователя.

**Request:**

```json
{
	"email": "user@example.com",
	"password": "securePassword123",
	"name": "John Doe"
}
```

**Response (201):**

```json
{
	"message": "User registered successfully",
	"userId": "uuid-here"
}
```

**Response (400):**

```json
{
	"message": "Email already exists",
	"statusCode": 400
}
```

---

#### POST /auth/login

Вход в систему.

**Request:**

```json
{
	"email": "user@example.com",
	"password": "securePassword123"
}
```

**Response (200):**

```json
{
	"access_token": "jwt-token-here",
	"user": {
		"id": "uuid-here",
		"email": "user@example.com",
		"name": "John Doe",
		"twoFactorEnabled": false
	}
}
```

**Response (401):**

```json
{
	"message": "Invalid credentials",
	"statusCode": 401
}
```

---

#### POST /auth/login/2fa

Вход с двухфакторной аутентификацией.

**Request:**

```json
{
	"email": "user@example.com",
	"password": "securePassword123",
	"twoFactorCode": "123456"
}
```

**Response (200):**

```json
{
	"access_token": "jwt-token-here",
	"user": {
		"id": "uuid-here",
		"email": "user@example.com",
		"name": "John Doe",
		"twoFactorEnabled": true
	}
}
```

---

#### POST /auth/logout

Выход из системы (опционально, для invalidation токена).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200):**

```json
{
	"message": "Logged out successfully"
}
```

---

### Two-Factor Authentication Endpoints

#### POST /auth/2fa/setup

Настройка 2FA для пользователя.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200):**

```json
{
	"qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
	"secret": "JBSWY3DPEHPK3PXP",
	"manualEntryKey": "JBSWY3DPEHPK3PXP",
	"appName": "2FA Demo App"
}
```

---

#### POST /auth/2fa/verify

Подтверждение настройки 2FA.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request:**

```json
{
	"token": "123456"
}
```

**Response (200):**

```json
{
	"message": "Two-factor authentication enabled successfully",
	"backupCodes": ["12345678", "87654321", "11111111", "22222222", "33333333"]
}
```

**Response (400):**

```json
{
	"message": "Invalid verification code",
	"statusCode": 400
}
```

---

#### POST /auth/2fa/disable

Отключение 2FA.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request:**

```json
{
	"token": "123456"
}
```

**Response (200):**

```json
{
	"message": "Two-factor authentication disabled successfully"
}
```

---

#### POST /auth/2fa/regenerate-backup-codes

Генерация новых backup кодов.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request:**

```json
{
	"token": "123456"
}
```

**Response (200):**

```json
{
	"message": "Backup codes regenerated successfully",
	"backupCodes": ["87654321", "12345678", "99999999", "88888888", "77777777"]
}
```

---

### User Profile Endpoints

#### GET /users/profile

Получение профиля текущего пользователя.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200):**

```json
{
	"id": "uuid-here",
	"email": "user@example.com",
	"name": "John Doe",
	"twoFactorEnabled": true,
	"createdAt": "2024-01-01T00:00:00.000Z",
	"updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### PUT /users/profile

Обновление профиля пользователя.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request:**

```json
{
	"name": "Jane Doe"
}
```

**Response (200):**

```json
{
	"id": "uuid-here",
	"email": "user@example.com",
	"name": "Jane Doe",
	"twoFactorEnabled": true,
	"updatedAt": "2024-01-01T01:00:00.000Z"
}
```

---

#### POST /users/change-password

Изменение пароля.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request:**

```json
{
	"currentPassword": "oldPassword123",
	"newPassword": "newSecurePassword456"
}
```

**Response (200):**

```json
{
	"message": "Password changed successfully"
}
```

**Response (400):**

```json
{
	"message": "Current password is incorrect",
	"statusCode": 400
}
```

---

## 📊 Error Responses

API возвращает ошибки в следующем формате:

```json
{
	"message": "Error description",
	"statusCode": 400,
	"error": "Bad Request",
	"timestamp": "2024-01-01T00:00:00.000Z",
	"path": "/api/auth/login"
}
```

### Общие HTTP статус коды:

- **200** - Success
- **201** - Created
- **400** - Bad Request (неверные данные)
- **401** - Unauthorized (неверные credentials или отсутствует токен)
- **403** - Forbidden (недостаточно прав)
- **404** - Not Found
- **429** - Too Many Requests (rate limiting)
- **500** - Internal Server Error

## 🔒 Rate Limiting

API защищен от злоупотреблений с помощью rate limiting:

- **Общие запросы**: 1 запрос/сек на IP
- **API запросы**: 10 запросов/сек на IP
- **Аутентификация**: 5 запросов/мин на IP

При превышении лимитов возвращается статус `429 Too Many Requests`.

## 🧪 Testing Examples

### cURL Examples

**Регистрация:**

```bash
curl -X POST https://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "name": "Test User"
  }' \
  -k
```

**Вход:**

```bash
curl -X POST https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }' \
  -k
```

**Получение профиля:**

```bash
curl -X GET https://localhost/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -k
```

### JavaScript/Fetch Examples

**Регистрация:**

```javascript
const response = await fetch('https://localhost/api/auth/register', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		email: 'test@example.com',
		password: 'testPassword123',
		name: 'Test User',
	}),
});

const data = await response.json();
```

**Аутентифицированный запрос:**

```javascript
const response = await fetch('https://localhost/api/users/profile', {
	headers: {
		Authorization: `Bearer ${localStorage.getItem('token')}`,
		'Content-Type': 'application/json',
	},
});

const userProfile = await response.json();
```

## 📱 Frontend Integration

### Authentication Flow

1. **Регистрация/Вход** → Получение JWT токена
2. **Сохранение токена** в localStorage/cookies
3. **Добавление токена** в каждый API запрос
4. **Обработка ошибок** 401/403 → Перенаправление на login
5. **Автоматическое обновление** токена (если реализовано)

### Example React Hook

```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
	const [token, setToken] = useState(localStorage.getItem('token'));
	const [user, setUser] = useState(null);

	const login = async (email, password) => {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});

		if (response.ok) {
			const data = await response.json();
			setToken(data.access_token);
			setUser(data.user);
			localStorage.setItem('token', data.access_token);
			return data;
		}

		throw new Error('Login failed');
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem('token');
	};

	return { token, user, login, logout };
};
```

## 🔧 Configuration

### Environment Variables

API настраивается через следующие переменные окружения:

```env
# JWT Configuration
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# 2FA
APP_NAME="Your App Name"

# Rate Limiting
RATE_LIMIT_GENERAL=1    # requests per second
RATE_LIMIT_API=10       # requests per second
RATE_LIMIT_AUTH=5       # requests per minute
```

## 🐛 Debugging

### Logging

API логирует следующие события:

- Все входящие HTTP запросы
- Ошибки аутентификации
- Ошибки валидации
- Критические ошибки системы

### Health Checks

**Health Check Endpoint:**

```
GET /health
```

**Response:**

```json
{
	"status": "ok",
	"timestamp": "2024-01-01T00:00:00.000Z",
	"uptime": 3600,
	"database": "connected",
	"version": "1.0.0"
}
```
