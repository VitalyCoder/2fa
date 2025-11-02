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
import { clearError, loginWith2FA } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { TwoFactorFormData, TwoFactorSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function TwoFactorForm() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const auth = useAppSelector(state => state.auth);
	const { isLoading, error, user, requiresTwoFactor } = auth;

	const form = useForm<TwoFactorFormData>({
		resolver: zodResolver(TwoFactorSchema),
		defaultValues: {
			totpCode: '',
		},
	});

	useEffect(() => {
		if (user && !requiresTwoFactor) {
			router.push('/dashboard');
		}
		if (!requiresTwoFactor) {
			router.push('/login');
		}
	}, [user, requiresTwoFactor, router]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const onSubmit = (data: TwoFactorFormData) => {
		// Получаем данные из localStorage или состояния
		const email = localStorage.getItem('tempEmail') || '';
		const password = localStorage.getItem('tempPassword') || '';

		if (email && password) {
			dispatch(loginWith2FA({ email, password, totpCode: data.totpCode }));
		} else {
			// Если данных нет, перенаправляем на страницу логина
			router.push('/login');
		}
	};

	return (
		<div className='auth-container flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4'>
			<Card className='auth-card w-full max-w-md shadow-xl'>
				<CardHeader className='space-y-1 text-center'>
					<div className='flex justify-center mb-4'>
						<div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
							<Shield className='h-8 w-8 text-blue-600 dark:text-blue-400' />
						</div>
					</div>
					<CardTitle className='text-2xl'>
						Двухфакторная аутентификация
					</CardTitle>
					<CardDescription>
						Введите 6-значный код из вашего приложения-аутентификатора
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							<FormField
								control={form.control}
								name='totpCode'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-center block'>
											Код аутентификации
										</FormLabel>
										<FormControl>
											<Input
												type='text'
												placeholder='000000'
												maxLength={6}
												className='two-factor-input text-center text-3xl font-mono tracking-[0.5em] h-14 border-2 focus:border-blue-500'
												{...field}
												onChange={e => {
													const value = e.target.value
														.replace(/\D/g, '')
														.slice(0, 6);
													field.onChange(value);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{error && (
								<div className='slide-in-up rounded-md bg-red-50 dark:bg-red-900/50 p-4 border border-red-200 dark:border-red-800'>
									<div className='text-sm text-red-800 dark:text-red-200'>
										{error}
									</div>
								</div>
							)}

							<Button
								type='submit'
								className='w-full h-12 text-lg hover-scale'
								disabled={isLoading}
							>
								{isLoading ? (
									<div className='flex items-center'>
										<div className='loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2'></div>
										Проверка...
									</div>
								) : (
									'Подтвердить'
								)}
							</Button>

							<div className='text-center'>
								<Button
									type='button'
									variant='ghost'
									onClick={() => router.push('/login')}
									className='text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
								>
									← Вернуться к входу
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
