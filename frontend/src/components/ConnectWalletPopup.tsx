import { isMobileWeb } from '../utils/env';
import { Popup, PopupProps } from './Modal/Popup';
import WalletMobile from '../assets/svg/wallet-mobile.svg';
import useWalletConnect from '../hooks/walletConnect';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../hooks/user';
const MobileConnectWalletPopup = ({ visible, setVisible }: PopupProps) => {
  const { handleConnect, handleSignature } = useWalletConnect();
  const { address } = useCurrentUser();
  const walletConnected = !!address;

  return (
    <Popup visible={visible} clickModalClosable={true} setVisible={setVisible}>
      <div className="relative flex h-[220px] w-[220px] flex-col items-center rounded-2xl bg-white pb-5 pt-10">
        <img src={WalletMobile} alt="Connect Wallet" className="size-[100px]" />
        <button
          className="mt-6 rounded-xl bg-warning px-5 py-2 text-white"
          onClick={() => {
            walletConnected ? handleSignature() : handleConnect();
          }}
        >
          {walletConnected ? 'Verify Signature' : 'Connect Wallet'}
        </button>
        {/*!isMetaMaskBrowser && (
          <>
            <img
              src={Metamask}
              alt="Connect Wallet"
              className="h-auto w-[60px]"
            />
            <Link
              className="mt-6 rounded-xl bg-warning px-5 py-2 text-white"
              to={
                'https://metamask.app.link/dapp/' +
                window.location.host +
                '/miner'
              }
              target="_blank"
              rel="noreferrer"
            >
              Open Metamask
            </Link>
            <Link
              className="mt-4 flex w-full justify-center font-normal text-quaternary underline"
              to={`https://${homeDomain}`}
              target="_blank"
              rel="noreferrer"
            >
              Explore Sortes Home
            </Link>
          </>
        )*/}
      </div>
    </Popup>
  );
};

const DesktopConnectWalletPopup = ({ visible, setVisible }: PopupProps) => {
  const { handleConnect, handleSignature } = useWalletConnect();
  const { address } = useCurrentUser();
  const walletConnected = !!address;

  return (
    <Popup visible={visible} clickModalClosable={true} setVisible={setVisible}>
      <div className="flex w-[912px] flex-col rounded-lg bg-white p-10">
        <span className="mb-8 text-4xl font-bold">
          Please connect your wallet
        </span>
        <span className="mb-10 text-xl font-normal">
          To unlock all features and fully experience on our platform, please
          connect your wallet.
        </span>
        <div className="flex justify-end space-x-10 text-xl font-normal">
          <button
            className="rounded-lg border border-[#3370FF] px-5 py-2.5 text-[#3370FF]"
            onClick={() => setVisible(false)}
          >
            Cancel
          </button>
          <button
            className="rounded-lg border border-[#3370FF] bg-[#3370FF] px-5 py-2.5 text-white"
            onClick={() => {
              walletConnected ? handleSignature() : handleConnect();
            }}
          >
            {walletConnected ? 'Verify Signature' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </Popup>
  );
};

const ConnectWalletPopup = () => {
  const [visible, setVisible] = useState(true);
  const path = window.location.pathname;

  useEffect(() => {
    setVisible(true);
  }, [path]);

  if (isMobileWeb) {
    return (
      <MobileConnectWalletPopup visible={visible} setVisible={setVisible} />
    );
  } else {
    return (
      <DesktopConnectWalletPopup visible={visible} setVisible={setVisible} />
    );
  }
};

export default ConnectWalletPopup;
