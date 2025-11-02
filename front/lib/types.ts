export interface User {
	id: string;
	email: string;
	name?: string;
	isTwoFactorEnabled: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	error: string | null;
	requiresTwoFactor: boolean;
	profileLoaded: boolean;
}
