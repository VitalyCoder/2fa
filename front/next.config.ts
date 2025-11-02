import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Включаем standalone output для Docker
	output: 'standalone',

	// Настройки для продакшена
	poweredByHeader: false,
	compress: true,

	// Environment variables для клиента
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},

	// Настройки изображений (если используете next/image)
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
			},
			{
				protocol: 'https',
				hostname: 'localhost',
			},
		],
		unoptimized: true, // Для Docker без дополнительной оптимизации
	},

	// Headers для безопасности
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
				],
			},
		];
	},
};

export default nextConfig;
