'use client';

import { useAppSelector } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const router = useRouter();
	const { user, token, isLoading } = useAppSelector(state => state.auth);

	useEffect(() => {
		if (!isLoading && !user && !token) {
			router.push('/login');
		}
	}, [user, token, isLoading, router]);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!user && !token) {
		return null;
	}

	return <>{children}</>;
}
