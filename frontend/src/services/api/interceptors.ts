import { InternalAxiosRequestConfig } from 'axios';
import { accessTokenAtom } from '../../atoms/auth';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

export const addAuthInterceptor = (request: InternalAxiosRequestConfig) => {
  const accessToken = store.get(accessTokenAtom);
  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return request;
};
