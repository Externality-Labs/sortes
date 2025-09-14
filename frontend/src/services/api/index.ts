import axios from 'axios';
import { showError } from '../../utils/notify';
import { getDefaultStore } from 'jotai';
import { chainAtom } from '../../atoms/chain';
import { chainInfoMap } from '../../utils/env';
import { addAuthInterceptor } from './interceptors';
import { clearAccessTokenAtom } from '../../atoms/auth';
// import { startLoadingAtom, stopLoadingAtom } from "../../atoms/modal";
const store = getDefaultStore();

const api = axios.create();

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
api.interceptors.request.use(
  (config) => {
    // store.set(startLoadingAtom);
    config.baseURL = chainInfoMap[store.get(chainAtom)].apiEndpoint;
    return config;
  },
  (error) => {
    showError(error.message);
    // store.set(stopLoadingAtom);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // store.set(stopLoadingAtom);
    return response.data;
  },
  (error) => {
    showError(error.message);
    // store.set(stopLoadingAtom);
    return Promise.reject(error);
  }
);

export default api;
