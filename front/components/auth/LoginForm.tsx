'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { clearError, login } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { LoginFormData, LoginSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function LoginForm() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const auth = useAppSelector(state => state.auth);
	const { isLoading, error, user, requiresTwoFactor } = auth;

	const form = useForm<LoginFormData>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	useEffect(() => {
		console.log(
			'LoginForm useEffect - user:',
			user,
			'requiresTwoFactor:',
			requiresTwoFactor
		);

		if (user && !requiresTwoFactor) {
			console.log('Redirecting to dashboard...');
			// Очищаем временные данные при успешном входе
			localStorage.removeItem('tempEmail');
			localStorage.removeItem('tempPassword');
			router.push('/dashboard');
		}
		if (requiresTwoFactor) {
			console.log('Redirecting to two-factor...');
			router.push('/two-factor');
		}
	}, [user, requiresTwoFactor, router]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const onSubmit = (data: LoginFormData) => {
		console.log('Submitting login form with data:', data);
		// Сохраняем данные для возможного использования в 2FA
		localStorage.setItem('tempEmail', data.email);
		localStorage.setItem('tempPassword', data.password);
		dispatch(login(data));
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl text-center'>Вход</CardTitle>
					<CardDescription className='text-center'>
						Введите ваш email и пароль для входа
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='example@email.com'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Пароль</FormLabel>
										<FormControl>
											<Input
												type='password'
												placeholder='Введите пароль'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{error && (
								<div className='rounded-md bg-red-50 p-4'>
									<div className='text-sm text-red-800'>{error}</div>
								</div>
							)}

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? 'Вход...' : 'Войти'}
							</Button>

							<div className='text-center text-sm'>
								Нет аккаунта?{' '}
								<Link
									href='/register'
									className='text-blue-600 hover:underline'
								>
									Зарегистрироваться
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
