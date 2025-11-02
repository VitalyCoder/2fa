import type { RootState } from '@/lib/store';
import { store } from '@/lib/store';

// Тест типов
const testState: RootState = store.getState();
console.log('Auth state:', testState.auth);

export {};
