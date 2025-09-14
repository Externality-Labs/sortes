import { useCallback, useState } from 'react';
import { faucet as faucetApi } from '../services/api/xbit';
import { useCurrentUser } from './user';
import { showSucc, showError } from '../utils/notify';

export const useFaucet = () => {
  const [faucetLoading, setFaucetLoading] = useState(false);
  const { address } = useCurrentUser();

  const faucet = useCallback(async () => {
    if (!address || faucetLoading) return;
    setFaucetLoading(true);
    try {
      const resp = await faucetApi(address as string);
      if (resp.status === 'success') {
        showSucc('Faucet Success!');
      } else {
        showError(resp.message);
      }
    } catch (e: any) {
      showError(e.message);
      console.error(e);
    } finally {
      setFaucetLoading(false);
    }
  }, [address, faucetLoading]);

  return { faucet, faucetLoading };
};
