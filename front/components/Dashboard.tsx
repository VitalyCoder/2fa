/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
	clearError,
	disableTwoFactor,
	enableTwoFactor,
	generate2FASecret,
	getProfile,
	logout,
} from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	Enable2FaFormData,
	Enable2FaSchema,
	Verify2FaFormData,
	Verify2FaSchema,
} from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, QrCode, Shield, ShieldCheck, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function Dashboard() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { user, isLoading, error, profileLoaded } = useAppSelector(
		state => state.auth
	);
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [secret, setSecret] = useState<string | null>(null);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [showEnableForm, setShowEnableForm] = useState(false);
	const [showDisableForm, setShowDisableForm] = useState(false);

	console.log(isLoading);

	const enableForm = useForm<Enable2FaFormData>({
		resolver: zodResolver(Enable2FaSchema),
		defaultValues: {
			totpCode: '',
		},
	});

	const disableForm = useForm<Verify2FaFormData>({
		resolver: zodResolver(Verify2FaSchema),
		defaultValues: {
			totpCode: '',
		},
	});

	useEffect(() => {
		if (!user) {
			router.push('/login');
		}
	}, [user, router]);

	// Загружаем профиль только один раз при монтировании компонента
	useEffect(() => {
		if (user && !profileLoaded) {
			dispatch(getProfile());
		}
	}, [dispatch, user, profileLoaded]);

	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleLogout = () => {
		dispatch(logout());
		router.push('/login');
	};

	const handleGenerate2FA = async () => {
		try {
			const result = await dispatch(generate2FASecret()).unwrap();
			setQrCode(result.qrCode);
			setSecret(result.secret);
			setShowEnableForm(true);
			toast.success('QR-код для настройки 2FA сгенерирован');
		} catch (error: any) {
			toast.error(error || 'Ошибка при генерации 2FA');
		}
	};

	const handleEnable2FA = async (data: Enable2FaFormData) => {
		try {
			const result = await dispatch(enableTwoFactor(data)).unwrap();
			setBackupCodes(result.backupCodes || []);
			setShowEnableForm(false);
			setQrCode(null);
			setSecret(null);
			toast.success('2FA успешно включена');
			dispatch(getProfile());
		} catch (error: any) {
			toast.error(error || 'Ошибка при включении 2FA');
		}
	};

	const handleDisable2FA = async (data: Verify2FaFormData) => {
		try {
			await dispatch(disableTwoFactor(data)).unwrap();
			setShowDisableForm(false);
			disableForm.reset();
			toast.success('2FA успешно отключена');
			dispatch(getProfile());
		} catch (error: any) {
			toast.error(error || 'Ошибка при отключении 2FA');
		}
	};

	if (!user) {
		return null;
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='mx-auto max-w-4xl p-6'>
				{/* Header */}
				<div className='mb-8 flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
							Панель управления
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Управление настройками безопасности аккаунта
						</p>
					</div>
					<Button onClick={handleLogout} variant='outline' size='sm'>
						<LogOut className='h-4 w-4 mr-2' />
						Выйти
					</Button>
				</div>

				<div className='grid gap-6 md:grid-cols-2'>
					{/* User Info Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center'>
								<User className='h-5 w-5 mr-2' />
								Информация о пользователе
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
									Email
								</label>
								<p className='text-gray-900 dark:text-white'>{user.email}</p>
							</div>
							{user.name && (
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Имя
									</label>
									<p className='text-gray-900 dark:text-white'>{user.name}</p>
								</div>
							)}
							<div>
								<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
									Статус 2FA
								</label>
								<div className='flex items-center mt-1'>
									{user.isTwoFactorEnabled ? (
										<ShieldCheck className='h-5 w-5 text-green-600 mr-2' />
									) : (
										<Shield className='h-5 w-5 text-gray-400 mr-2' />
									)}
									<span
										className={
											user.isTwoFactorEnabled
												? 'text-green-600'
												: 'text-gray-600'
										}
									>
										{user.isTwoFactorEnabled ? 'Включена' : 'Отключена'}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 2FA Management Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center'>
								<Shield className='h-5 w-5 mr-2' />
								Двухфакторная аутентификация
							</CardTitle>
							<CardDescription>
								Повысьте безопасность своего аккаунта
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!user.isTwoFactorEnabled ? (
								<div className='space-y-4'>
									{!showEnableForm ? (
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
												2FA не настроена. Настройте двухфакторную аутентификацию
												для дополнительной защиты.
											</p>
											<Button onClick={handleGenerate2FA} disabled={isLoading}>
												<QrCode className='h-4 w-4 mr-2' />
												{isLoading ? 'Генерация...' : 'Настроить 2FA'}
											</Button>
										</div>
									) : (
										<div className='space-y-4'>
											{qrCode && (
												<div className='text-center'>
													<p className='text-sm mb-4'>
														Отсканируйте QR-код в приложении Google
														Authenticator:
													</p>
													<div className='flex justify-center mb-4'>
														<Image
															src={qrCode}
															alt='QR Code для 2FA'
															width={200}
															height={200}
															className='border rounded-lg'
														/>
													</div>
													{secret && (
														<div className='bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs break-all'>
															<p className='font-medium mb-1'>
																Или введите код вручную:
															</p>
															<code>{secret}</code>
														</div>
													)}
												</div>
											)}

											<Form {...enableForm}>
												<form
													onSubmit={enableForm.handleSubmit(handleEnable2FA)}
													className='space-y-4'
												>
													<FormField
														control={enableForm.control}
														name='totpCode'
														render={({ field }) => (
															<FormItem>
																<FormLabel>Введите код из приложения</FormLabel>
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

													<div className='flex gap-2'>
														<Button type='submit' disabled={isLoading}>
															{isLoading ? 'Включение...' : 'Включить 2FA'}
														</Button>
														<Button
															type='button'
															variant='outline'
															onClick={() => {
																setShowEnableForm(false);
																setQrCode(null);
																setSecret(null);
																enableForm.reset();
															}}
														>
															Отмена
														</Button>
													</div>
												</form>
											</Form>
										</div>
									)}
								</div>
							) : (
								<div className='space-y-4'>
									<div className='flex items-center text-green-600'>
										<ShieldCheck className='h-5 w-5 mr-2' />
										<span>2FA активна и защищает ваш аккаунт</span>
									</div>

									{!showDisableForm ? (
										<Button
											variant='destructive'
											onClick={() => setShowDisableForm(true)}
										>
											Отключить 2FA
										</Button>
									) : (
										<Form {...disableForm}>
											<form
												onSubmit={disableForm.handleSubmit(handleDisable2FA)}
												className='space-y-4'
											>
												<FormField
													control={disableForm.control}
													name='totpCode'
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Введите код для отключения 2FA
															</FormLabel>
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

												<div className='flex gap-2'>
													<Button
														type='submit'
														variant='destructive'
														disabled={isLoading}
													>
														{isLoading ? 'Отключение...' : 'Отключить'}
													</Button>
													<Button
														type='button'
														variant='outline'
														onClick={() => {
															setShowDisableForm(false);
															disableForm.reset();
														}}
													>
														Отмена
													</Button>
												</div>
											</form>
										</Form>
									)}
								</div>
							)}

							{error && (
								<div className='mt-4 rounded-md bg-red-50 p-4'>
									<div className='text-sm text-red-800'>{error}</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Backup Codes */}
				{backupCodes.length > 0 && (
					<Card className='mt-6'>
						<CardHeader>
							<CardTitle>Резервные коды</CardTitle>
							<CardDescription>
								Сохраните эти коды в безопасном месте. Каждый код можно
								использовать только один раз.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid gap-2 grid-cols-2 md:grid-cols-4'>
								{backupCodes.map((code, index) => (
									<div
										key={index}
										className='bg-gray-100 dark:bg-gray-800 p-2 rounded text-center font-mono'
									>
										{code}
									</div>
								))}
							</div>
							<Button
								className='mt-4'
								onClick={() => setBackupCodes([])}
								variant='outline'
								size='sm'
							>
								Скрыть коды
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
