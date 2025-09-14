import { useConnectWallet, useWallets } from '@web3-onboard/react';
import { getUserAvatar } from '../utils/avatarGenerator';
import { useAtomValue, useSetAtom } from 'jotai';
import { web3ServiceInitedAtom } from '../atoms/web3';
import { useCallback } from 'react';
import { clearAccessTokenAtom } from '../atoms/auth';

export const useCurrentUser = () => {
  const [wallet] = useWallets();
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);

  if (!wallet || !isWeb3ServiceInited) {
    return { address: undefined, avatar: getUserAvatar('undefined') };
  } else {
    return {
      address: wallet.accounts[0].address,
      avatar: getUserAvatar(wallet.accounts[0].address),
    };
  }
};

export const useLogout = () => {
  const [{ wallet }, , disconnect] = useConnectWallet();
  const clearAccessToken = useSetAtom(clearAccessTokenAtom);

  const logout = useCallback(() => {
    if (wallet) {
      disconnect(wallet);
      clearAccessToken();
    }
  }, [disconnect, wallet, clearAccessToken]);

  return logout;
};
