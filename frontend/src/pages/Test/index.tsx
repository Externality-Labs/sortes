import { useConnectWallet } from '@web3-onboard/react';
import { Web3Service } from '../../services/web3';

const ConnectWallet: React.FC = () => {
  const [{ wallet, connecting }, connect] = useConnectWallet();
  if (wallet) {
    Web3Service.init(wallet);
  }

  return (
    <div
      onClick={() => connect()}
      className="ml-auto h-[52px] w-[204px] rounded-[36px] border border-solid border-quaternary leading-[48px] hover:cursor-pointer"
    >
      <span className="iconfont_old icon-qianbao relative top-[2px] mr-[10px] text-xl"></span>
      <span className="text-[18px]">
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </span>
    </div>
  );
};

export default ConnectWallet;
