'use client';

import { Button } from '@/components/ui/button';
import { login } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

export function QuickTest() {
	const dispatch = useAppDispatch();
	const auth = useAppSelector(state => state.auth);

	const testLogin = async () => {
		console.log('Testing login...');
		try {
			const result = await dispatch(
				login({
					email: 'testuser@example.com',
					password: 'testpass123',
				})
			).unwrap();
			console.log('Login result:', result);
		} catch (error) {
			console.error('Login error:', error);
		}
	};

	if (process.env.NODE_ENV !== 'development') {
		return null;
	}

	return (
		<div className='fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-md shadow-lg max-w-md z-50'>
			<h3 className='font-bold mb-2'>Quick Test</h3>
			<div className='mb-4 text-xs'>
				<div>User: {auth.user ? auth.user.email : 'None'}</div>
				<div>Token: {auth.token ? 'Present' : 'None'}</div>
				<div>Loading: {auth.isLoading ? 'Yes' : 'No'}</div>
				<div>Error: {auth.error || 'None'}</div>
				<div>Requires 2FA: {auth.requiresTwoFactor ? 'Yes' : 'No'}</div>
			</div>
			<Button onClick={testLogin} size='sm'>
				Test Login
			</Button>
		</div>
	);
}
