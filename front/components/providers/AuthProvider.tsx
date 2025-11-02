'use client';

import { loadFromStorage } from '@/lib/features/auth/authSlice';
import { useAppDispatch } from '@/lib/hooks';
import { useEffect } from 'react';

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		console.log('AuthProvider: Loading from storage...');
		dispatch(loadFromStorage());
	}, [dispatch]);

	return <>{children}</>;
}
