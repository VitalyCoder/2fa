'use client';

import { useAppSelector } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
	const router = useRouter();
	const { user } = useAppSelector(state => state.auth);

	useEffect(() => {
		if (user) {
			router.push('/dashboard');
		} else {
			router.push('/login');
		}
	}, [user, router]);

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
		</div>
	);
}
