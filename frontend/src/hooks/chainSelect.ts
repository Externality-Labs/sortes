import { useAtomValue, useSetAtom } from 'jotai';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chainAtom, setChainAtom } from '../atoms/chain.ts';
import { ChainInfo, chainInfoMap } from '../utils/env.ts';
import { CustomEvents } from '../utils/events.ts';

const useChainSelection = () => {
  const chainId = useAtomValue(chainAtom);
  const setChainId = useSetAtom(setChainAtom);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [reselectChainVisible, setReselectChainVisible] =
    useState<boolean>(false);
  const infos: ChainInfo[] = Object.values(chainInfoMap);

  const [{ wallet }] = useConnectWallet();
  const [, setChain] = useSetChain();

  const [searchParams] = useSearchParams();
  const chainName = searchParams.get('chain')?.toLocaleLowerCase().trim();

  let isUrlChainIdSupported = false;
  let urlChainId: number | undefined;
  if (chainName) {
    urlChainId = infos.find((info) =>
      info.name.toLocaleLowerCase().trim().includes(chainName)
    )?.chainId;
    isUrlChainIdSupported = infos.some((info) => info.chainId === urlChainId);
  }

  const walletChainId = Number(wallet?.chains[0].id);
  const isSupportedChainId = infos.some(
    (info) => info.chainId === walletChainId
  );

  const askUserToSwitchChain = useCallback(
    async (id: number) => {
      // call wallet to switch chain
      await setChain({
        chainId: '0x' + id.toString(16),
      });

      document.dispatchEvent(new CustomEvent(CustomEvents.ChainIdChanged));

      if (searchParams.has('chain')) {
        searchParams.delete('chain');
      }
      setTimeout(() => {
        setDropdownVisible(false);
      }, 1000);
    },
    [searchParams, setChain]
  );

  useEffect(() => {
    if (!wallet) {
      if (isUrlChainIdSupported) {
        setChainId(Number(urlChainId));
      }
    } else if (urlChainId) {
      if (!isUrlChainIdSupported) return;
      if (chainId !== urlChainId) {
        setChainId(Number(urlChainId));
      }
      if (walletChainId !== urlChainId) {
        askUserToSwitchChain(urlChainId);
      }
    } else {
      if (chainId !== walletChainId && isSupportedChainId) {
        setChainId(Number(walletChainId));
      }
      if (!isSupportedChainId) {
        setReselectChainVisible(true);
      }
    }
  }, [
    setChainId,
    wallet,
    chainId,
    walletChainId,
    isSupportedChainId,
    urlChainId,
    isUrlChainIdSupported,
    askUserToSwitchChain,
  ]);

  const currentChain = infos.find((info) => info.chainId === chainId);

  return {
    chainId,
    dropdownVisible,
    setDropdownVisible,
    reselectChainVisible,
    setReselectChainVisible,
    infos,
    currentChain,
    askUserToSwitchChain,
    wallet,
  };
};

export default useChainSelection;
