'use client';

import { useAppSelector } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
	const router = useRouter();
	const { user } = useAppSelector(state => state.auth);

	useEffect(() => {
		console.log('Main page - user:', user);
		if (user) {
			console.log('User found, redirecting to dashboard');
			router.push('/dashboard');
		} else {
			console.log('No user, redirecting to login');
			router.push('/login');
		}
	}, [user, router]);

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100'></div>
		</div>
	);
}
