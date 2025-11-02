/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api';
import { AuthState } from '../../types';
import {
	Enable2FaFormData,
	LoginFormData,
	RegisterFormData,
	Verify2FaFormData,
} from '../../validations';

const initialState: AuthState = {
	user: null,
	token: null,
	isLoading: false,
	error: null,
	requiresTwoFactor: false,
	profileLoaded: false,
};

export const register = createAsyncThunk(
	'auth/register',
	async (
		userData: Omit<RegisterFormData, 'confirmPassword'>,
		{ rejectWithValue }
	) => {
		try {
			const response = await api.post('/auth/register', userData);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || 'Ошибка регистрации'
			);
		}
	}
);

export const login = createAsyncThunk(
	'auth/login',
	async (credentials: LoginFormData, { rejectWithValue }) => {
		try {
			const response = await api.post('/auth/login', credentials);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Ошибка входа');
		}
	}
);

export const loginWith2FA = createAsyncThunk(
	'auth/loginWith2FA',
	async (
		data: { email: string; password: string; totpCode: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.post('/auth/login-2fa', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || 'Неверный код 2FA'
			);
		}
	}
);

export const generate2FASecret = createAsyncThunk(
	'auth/generate2FASecret',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/auth/2fa/generate');
			return response.data;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || 'Ошибка генерации секрета'
			);
		}
	}
);

export const enableTwoFactor = createAsyncThunk(
	'auth/enableTwoFactor',
	async (data: Enable2FaFormData, { rejectWithValue }) => {
		try {
			const response = await api.post('/auth/2fa/enable', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || 'Ошибка включения 2FA'
			);
		}
	}
);

export const disableTwoFactor = createAsyncThunk(
	'auth/disableTwoFactor',
	async (data: Verify2FaFormData, { rejectWithValue }) => {
		try {
			const response = await api.post('/auth/2fa/disable', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || 'Ошибка отключения 2FA'
			);
		}
	}
);

export const verifyTwoFactor = createAsyncThunk(
	'auth/verifyTwoFactor',
	async (data: Verify2FaFormData, { rejectWithValue }) => {
		try {
			const response = await api.post('/auth/2fa/verify', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Неверный код');
		}
	}
);

export const getProfile = createAsyncThunk(
	'auth/getProfile',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/auth/profile');
			return response.data;
		} catch (error: any) {
			return rejectWithValue(
				error.response?.data?.message || 'Ошибка загрузки профиля'
			);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearError: state => {
			state.error = null;
		},
		logout: state => {
			state.user = null;
			state.token = null;
			state.requiresTwoFactor = false;
			state.error = null;
			state.profileLoaded = false;
			if (typeof window !== 'undefined') {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
		},
		loadFromStorage: state => {
			if (typeof window !== 'undefined') {
				const token = localStorage.getItem('token');
				const user = localStorage.getItem('user');

				console.log('Loading from storage - token:', token, 'user:', user);

				if (token && user) {
					state.token = token;
					state.user = JSON.parse(user);
					console.log('User loaded from storage:', state.user);
				}
			}
		},
	},
	extraReducers: builder => {
		builder
			.addCase(register.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(register.fulfilled, (state, action) => {
				console.log('Register fulfilled with payload:', action.payload);
				state.isLoading = false;
				state.user = action.payload.user;
				state.token = action.payload.accessToken;
				if (typeof window !== 'undefined') {
					localStorage.setItem('token', action.payload.accessToken);
					localStorage.setItem('user', JSON.stringify(action.payload.user));
					console.log('Stored in localStorage - token and user');
				}
			})
			.addCase(register.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(login.pending, state => {
				state.isLoading = true;
				state.error = null;
				state.requiresTwoFactor = false;
			})
			.addCase(login.fulfilled, (state, action) => {
				console.log('Login fulfilled with payload:', action.payload);
				state.isLoading = false;
				if (action.payload.requiresTwoFactor) {
					console.log('2FA required, setting requiresTwoFactor to true');
					state.requiresTwoFactor = true;
				} else {
					console.log('Login successful, setting user and token');
					state.user = action.payload.user;
					state.token = action.payload.accessToken;
					if (typeof window !== 'undefined') {
						localStorage.setItem('token', action.payload.accessToken);
						localStorage.setItem('user', JSON.stringify(action.payload.user));
						console.log('Stored in localStorage - token and user');
					}
				}
			})
			.addCase(login.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(loginWith2FA.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginWith2FA.fulfilled, (state, action) => {
				state.isLoading = false;
				state.requiresTwoFactor = false;
				state.user = action.payload.user;
				state.token = action.payload.accessToken;
				if (typeof window !== 'undefined') {
					localStorage.setItem('token', action.payload.accessToken);
					localStorage.setItem('user', JSON.stringify(action.payload.user));
				}
			})
			.addCase(loginWith2FA.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(generate2FASecret.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(generate2FASecret.fulfilled, state => {
				state.isLoading = false;
			})
			.addCase(generate2FASecret.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(enableTwoFactor.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(enableTwoFactor.fulfilled, state => {
				state.isLoading = false;
				if (state.user) {
					state.user.isTwoFactorEnabled = true;
					if (typeof window !== 'undefined') {
						localStorage.setItem('user', JSON.stringify(state.user));
					}
				}
			})
			.addCase(enableTwoFactor.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(disableTwoFactor.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(disableTwoFactor.fulfilled, state => {
				state.isLoading = false;
				if (state.user) {
					state.user.isTwoFactorEnabled = false;
					if (typeof window !== 'undefined') {
						localStorage.setItem('user', JSON.stringify(state.user));
					}
				}
			})
			.addCase(disableTwoFactor.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(verifyTwoFactor.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(verifyTwoFactor.fulfilled, state => {
				state.isLoading = false;
			})
			.addCase(verifyTwoFactor.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(getProfile.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(getProfile.fulfilled, (state, action) => {
				state.isLoading = false;
				state.profileLoaded = true;
				// Обновляем пользователя только если есть изменения
				const currentUser = JSON.stringify(state.user);
				const newUser = JSON.stringify(action.payload);

				if (currentUser !== newUser) {
					state.user = action.payload;
					if (typeof window !== 'undefined') {
						localStorage.setItem('user', JSON.stringify(action.payload));
					}
				}
			})
			.addCase(getProfile.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearError, logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;
