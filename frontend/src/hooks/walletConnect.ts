import { useConnectWallet } from '@web3-onboard/react';
import { useCallback } from 'react';
import { Web3Service } from '../services/web3.ts';
import { walletLogin } from '../services/api/bridge.ts';
import { setAccessTokenAtom } from '../atoms/auth.ts';
import { useSetAtom } from 'jotai';
const useWalletConnect = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const setAccessToken = useSetAtom(setAccessTokenAtom);

  const handleSignature = useCallback(async () => {
    const msg = `Sign in to sortes.fun ${Date.now()}`;
    const signature = await Web3Service.service.signer.signMessage(msg);
    const accessToken = await walletLogin(
      Web3Service.service.address,
      signature,
      msg
    );
    setAccessToken(accessToken);
  }, [setAccessToken]);

  const handleConnect = useCallback(async () => {
    try {
      setTimeout(() => {
        const style = document.createElement('style');
        style.innerHTML = 'section.fixed { z-index: 9999; }';
        const onboardElm = document.querySelector('onboard-v2');
        if (onboardElm !== null) {
          onboardElm.shadowRoot?.appendChild(style);
        }
      }, 0);
      await connect();
      if (wallet) {
        Web3Service.init(wallet);
      }
      await handleSignature();
    } catch (e) {
      console.error('Connection failed:', e);
    }
  }, [connect, handleSignature, wallet]); // 这里只依赖于 connect

  return {
    wallet,
    connecting,
    handleConnect,
    handleSignature,
    disconnect,
  };
};

export default useWalletConnect;
