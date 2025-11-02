import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Публичные маршруты - не нуждаются в аутентификации
	const publicPaths = ['/login', '/register', '/'];

	// Если это публичный путь, пропускаем
	if (publicPaths.includes(pathname)) {
		return NextResponse.next();
	}

	// Для остальных маршрутов (включая /dashboard) пропускаем тоже
	// Проверку аутентификации будем делать на клиенте
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
