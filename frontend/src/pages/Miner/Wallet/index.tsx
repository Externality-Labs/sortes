import WalletExchange from './WalletExchange';
import { useCurrentUser } from '../../../hooks/user';
import WalletSrc from '../../../assets/images/wallet.png';
import { useConnectWallet } from '@web3-onboard/react';

interface WalletProps {
  tokenAddress: string;
  setTokens: (tokenAddress: string, lpAddress: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ tokenAddress, setTokens }) => {
  const currentUser = useCurrentUser();
  const [, connect] = useConnectWallet();

  if (currentUser.address === undefined) {
    return (
      <div className="flex flex-col rounded-lg bg-white p-8 text-center font-normal">
        <img
          src={WalletSrc}
          alt="Connect Wallet"
          className="mx-[18px] w-[340px]"
        />
        <span className="text-3xl text-dark4">Connect&nbsp;&nbsp;Wallet</span>
        <button
          className="mt-[60px] rounded-xl bg-warning py-[10px] text-2xl text-white"
          onClick={() => connect()}
        >
          Connect
        </button>
      </div>
    );
  }

  return <WalletExchange tokenAddress={tokenAddress} setTokens={setTokens} />;
};

export default Wallet;
