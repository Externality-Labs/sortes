import { currentChainInfo } from '../utils/env';

enum StorageKey {
  InvalidPlayIds = 'invalid-play-ids',
  ValidPlayIdsFromBlockChain = 'valid-play-ids',
  AccessToken = 'access-token',
}

function load(key: string) {
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function save(key: string, data: object) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    return;
  }
}

const getStoreKey = (key: string) =>
  `chain-${currentChainInfo().chainId}:${key}`;

const loaderGen: <T>(key: string) => () => T | null = (key) => () =>
  load(getStoreKey(key)) ? load(getStoreKey(key)).data : null;

const saverGen: <T>(key: string) => (data: T) => void = (key) => (data) =>
  save(getStoreKey(key), { data: data as object });

export const loadInvalidPlayIds = loaderGen<string[]>(
  StorageKey.InvalidPlayIds
);
export const saveInvalidPlayIds = saverGen<string[]>(StorageKey.InvalidPlayIds);
export const loadValidPlayIds = loaderGen<{ id: string; time: number }[]>(
  StorageKey.ValidPlayIdsFromBlockChain
);

export const saveValidPlayIds = saverGen<{ id: string; time: number }[]>(
  StorageKey.ValidPlayIdsFromBlockChain
);

export const loadAccessToken = () =>
  <string | null>load(StorageKey.AccessToken)?.data;
export const saveAccessToken = (token: string | null) =>
  save(StorageKey.AccessToken, { data: token });
