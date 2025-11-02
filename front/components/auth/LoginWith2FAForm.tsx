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
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const LoginWith2FASchema = z.object({
	email: z.string().email('Неверный формат email'),
	password: z.string().min(1, 'Пароль обязателен'),
	totpCode: z
		.string()
		.length(6, 'Код должен содержать 6 цифр')
		.regex(/^\d+$/, 'Код должен содержать только цифры'),
});

type LoginWith2FAFormData = z.infer<typeof LoginWith2FASchema>;

interface LoginWith2FAFormProps {
	initialEmail?: string;
	initialPassword?: string;
}

export function LoginWith2FAForm({
	initialEmail = '',
	initialPassword = '',
}: LoginWith2FAFormProps) {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { isLoading, error, user } = useAppSelector(state => state.auth);

	const form = useForm<LoginWith2FAFormData>({
		resolver: zodResolver(LoginWith2FASchema),
		defaultValues: {
			email: initialEmail,
			password: initialPassword,
			totpCode: '',
		},
	});

	useEffect(() => {
		if (user) {
			router.push('/dashboard');
		}
	}, [user, router]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const onSubmit = (data: LoginWith2FAFormData) => {
		dispatch(loginWith2FA(data));
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
			<Card className='w-full max-w-md shadow-xl'>
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
						Введите ваши данные и код из приложения-аутентификатора
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

							<FormField
								control={form.control}
								name='totpCode'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Код аутентификации</FormLabel>
										<FormControl>
											<Input
												type='text'
												placeholder='000000'
												maxLength={6}
												className='text-center text-lg tracking-widest'
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
								<div className='rounded-md bg-red-50 p-4'>
									<div className='text-sm text-red-800'>{error}</div>
								</div>
							)}

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? 'Вход...' : 'Войти с 2FA'}
							</Button>

							<div className='text-center'>
								<Button
									type='button'
									variant='ghost'
									onClick={() => router.push('/login')}
									className='text-sm'
								>
									← Вернуться к обычному входу
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
