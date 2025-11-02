import axios from 'axios';

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(config => {
	console.log('API Request:', config.method?.toUpperCase(), config.url);
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
	response => {
		console.log('API Response:', response.status, response.config.url);
		return response;
	},
	error => {
		console.error(
			'API Error:',
			error.response?.status,
			error.config?.url,
			error.response?.data
		);
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);
