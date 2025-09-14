import { atom } from 'jotai';

// Global GOOD balance state
export const goodBalanceAtom = atom<string>('0');

// Global GOOD balance loading state
export const goodBalanceLoadingAtom = atom<boolean>(false);

// Global EXP balance state
export const xexpBalanceAtom = atom<string>('0');

// Global EXP balance loading state
export const xexpBalanceLoadingAtom = atom<boolean>(false);
