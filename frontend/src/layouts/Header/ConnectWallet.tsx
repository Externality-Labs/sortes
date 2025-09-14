import useWalletConnect from '../../hooks/walletConnect.ts';

const ConnectWallet: React.FC = () => {
  const { connecting, handleConnect } = useWalletConnect();

  return (
    <>
      <div
        onClick={handleConnect}
        className="ml-auto flex h-10 w-[161px] justify-center space-x-2 rounded-full bg-white py-2 leading-[19px] hover:cursor-pointer max-sm:hidden"
      >
        {/*<span className="iconfont_old icon-qianbao relative text-xl"></span>*/}
        <span className="mt-[2px] font-roboto text-base font-medium leading-[19px] text-[#202020]">
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </div>
    </>
  );
};

export default ConnectWallet;
