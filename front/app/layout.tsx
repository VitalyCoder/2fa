import { AuthProvider } from '@/components/providers/AuthProvider';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: '2FA App',
	description: 'Приложение с двухфакторной аутентификацией',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ru'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ReduxProvider>
					<AuthProvider>
						{children}
						<Toaster />
						{process.env.NODE_ENV === 'development' && (
							<div>
								{/* Lazy load QuickTest to avoid SSR issues */}
								{typeof window !== 'undefined' &&
									(() => {
										const QuickTest =
											require('@/components/QuickTest').QuickTest;
										return <QuickTest />;
									})()}
							</div>
						)}
					</AuthProvider>
				</ReduxProvider>
			</body>
		</html>
	);
}
