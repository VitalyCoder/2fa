'use client';

import { DebugPanel } from '@/components/DebugPanel';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
	const router = useRouter();
	const { user, isLoading } = useAppSelector(state => state.auth);

	useEffect(() => {
		console.log(
			'HomePage redirect useEffect - user:',
			user,
			'isLoading:',
			isLoading
		);

		if (!isLoading && user) {
			console.log('User exists, redirecting to dashboard');
			router.push('/dashboard');
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-lg'>Загрузка...</div>
			</div>
		);
	}

	if (user) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-lg'>Перенаправление...</div>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center'>
					<h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white'>
						2FA Приложение
					</h1>
					<p className='mt-4 text-lg text-gray-600 dark:text-gray-300'>
						Безопасная аутентификация с двухфакторной проверкой
					</p>
				</div>

				<div className='space-y-4'>
					<Link href='/login' className='block'>
						<Button className='w-full' size='lg'>
							Войти
						</Button>
					</Link>

					<Link href='/register' className='block'>
						<Button variant='outline' className='w-full' size='lg'>
							Зарегистрироваться
						</Button>
					</Link>
				</div>
			</div>
			<DebugPanel />
		</div>
	);
}
