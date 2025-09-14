import { atom } from 'jotai';

export const enum ChainId {
  Sepolia = 11155111,
  // Arbitrum = 42161,
  // Hekla = 167009,
  // Base = 8453,
  // BNB = 56,
}

export const chainAtom = atom<ChainId>(ChainId.Sepolia);

export const setChainAtom = atom(null, (get, set, chainId: ChainId) => {
  const curChainId = get(chainAtom);
  if (curChainId !== chainId) {
    set(chainAtom, chainId);
  }
});
