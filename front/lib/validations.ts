import { z } from 'zod';

export const LoginSchema = z.object({
	email: z.string().email('Неверный формат email'),
	password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export const RegisterSchema = z
	.object({
		email: z.string().email('Неверный формат email'),
		password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
		confirmPassword: z.string(),
		name: z.string().optional(),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword'],
	});

export const LoginWith2FaSchema = z.object({
	email: z.string().email('Неверный формат email'),
	password: z.string().min(1, 'Пароль обязателен'),
	totpCode: z
		.string()
		.length(6, 'Код должен содержать 6 цифр')
		.regex(/^\d+$/, 'Код должен содержать только цифры'),
});

export const Enable2FaSchema = z.object({
	totpCode: z
		.string()
		.length(6, 'Код должен содержать 6 цифр')
		.regex(/^\d+$/, 'Код должен содержать только цифры'),
});

export const Verify2FaSchema = z.object({
	totpCode: z
		.string()
		.length(6, 'Код должен содержать 6 цифр')
		.regex(/^\d+$/, 'Код должен содержать только цифры'),
});

export const TwoFactorSchema = z.object({
	totpCode: z
		.string()
		.length(6, 'Код должен содержать 6 цифр')
		.regex(/^\d+$/, 'Код должен содержать только цифры'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type TwoFactorFormData = z.infer<typeof TwoFactorSchema>;
export type LoginWith2FaFormData = z.infer<typeof LoginWith2FaSchema>;
export type Enable2FaFormData = z.infer<typeof Enable2FaSchema>;
export type Verify2FaFormData = z.infer<typeof Verify2FaSchema>;
