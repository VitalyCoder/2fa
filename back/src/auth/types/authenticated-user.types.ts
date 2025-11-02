export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated?: boolean;
}

export interface RequestWithUser {
  user?: AuthenticatedUser;
}
