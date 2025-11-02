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
import { clearError, register } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RegisterFormData, RegisterSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function RegisterForm() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const auth = useAppSelector(state => state.auth);
	const { isLoading, error, user } = auth;
	const form = useForm<RegisterFormData>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			name: '',
		},
	});

	useEffect(() => {
		console.log('RegisterForm useEffect - user:', user);

		if (user) {
			console.log('Redirecting to dashboard...');
			router.push('/dashboard');
		}
	}, [user, router]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);
	const onSubmit = (data: RegisterFormData) => {
		console.log('Submitting register form with data:', data);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { confirmPassword, ...registerData } = data;
		console.log('Dispatching register with:', registerData);
		dispatch(register(registerData));
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl text-center'>Регистрация</CardTitle>
					<CardDescription className='text-center'>
						Создайте новый аккаунт
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Имя (необязательно)</FormLabel>
										<FormControl>
											<Input type='text' placeholder='Ваше имя' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

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

							<FormField
								control={form.control}
								name='confirmPassword'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Подтверждение пароля</FormLabel>
										<FormControl>
											<Input
												type='password'
												placeholder='Повторите пароль'
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
								{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
							</Button>

							<div className='text-center text-sm'>
								Уже есть аккаунт?{' '}
								<Link href='/login' className='text-blue-600 hover:underline'>
									Войти
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
