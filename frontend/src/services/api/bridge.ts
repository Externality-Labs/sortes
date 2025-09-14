import axios from 'axios';
import { addAuthInterceptor } from './interceptors';
import { getDefaultStore } from 'jotai';
import { clearAccessTokenAtom } from '../../atoms/auth';
import { apiDomain, protocol } from '../../utils/env';
const store = getDefaultStore();

const api = axios.create();

// 跨链共享接口
const bridgePrefix = `${protocol}://${apiDomain}/bridge`;

api.defaults.baseURL = bridgePrefix;
api.interceptors.request.use(addAuthInterceptor);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      store.set(clearAccessTokenAtom);
    }
    return Promise.reject(error);
  }
);
export const getMainnetBalance = async () =>
  await api.get('/mainnet-charity-balance');

export const walletLogin = async (
  address: string,
  signature: string,
  message: string
): Promise<string> => {
  const resp = await api.post('/auth/wallet-login', {
    address,
    signature,
    message,
  });
  return resp.data;
};

export const refreshAccessToken = async () => {
  const resp = await api.post('/auth/refresh-token');
  return resp.data;
};
