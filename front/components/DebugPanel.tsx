'use client';

import { useAppSelector } from '@/lib/hooks';
import { useState } from 'react';

export function DebugPanel() {
	const [isVisible, setIsVisible] = useState(false);
	const auth = useAppSelector(state => state.auth);

	if (process.env.NODE_ENV !== 'development') {
		return null;
	}

	return (
		<div className='fixed bottom-4 right-4 z-50'>
			<button
				onClick={() => setIsVisible(!isVisible)}
				className='bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium'
			>
				Debug
			</button>

			{isVisible && (
				<div className='absolute bottom-full right-0 mb-2 bg-black text-white p-4 rounded-md shadow-lg max-w-md text-xs'>
					<h3 className='font-bold mb-2'>Redux Auth State:</h3>
					<pre className='whitespace-pre-wrap'>
						{JSON.stringify(auth, null, 2)}
					</pre>

					<h3 className='font-bold mt-4 mb-2'>LocalStorage:</h3>
					<div>
						<div>
							Token:{' '}
							{typeof window !== 'undefined'
								? localStorage.getItem('token')
								: 'N/A'}
						</div>
						<div>
							User:{' '}
							{typeof window !== 'undefined'
								? localStorage.getItem('user')
								: 'N/A'}
						</div>
					</div>

					<button
						onClick={() => {
							if (typeof window !== 'undefined') {
								localStorage.clear();
								window.location.reload();
							}
						}}
						className='mt-4 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs'
					>
						Очистить localStorage
					</button>
				</div>
			)}
		</div>
	);
}
