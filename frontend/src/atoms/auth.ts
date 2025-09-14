import { atom } from 'jotai';
import { loadAccessToken, saveAccessToken } from '../services/persist';
export const accessTokenAtom = atom<string | null>(loadAccessToken());

export const setAccessTokenAtom = atom(null, (_, set, accessToken: string) => {
  set(accessTokenAtom, accessToken);
  saveAccessToken(accessToken);
});

export const clearAccessTokenAtom = atom(null, (_, set) => {
  set(accessTokenAtom, null);
  saveAccessToken(null);
});
