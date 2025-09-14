import { readableAddr } from '../../utils/format.ts';
import Close2 from '../../assets/svg/close2.tsx';
import { useCurrentUser } from '../../hooks/user.ts';
import useWalletConnect from '../../hooks/walletConnect.ts';

const ConnectWalletMobile = ({ onClose }: { onClose: () => void }) => {
  const { connecting, handleConnect, wallet, disconnect } = useWalletConnect();

  const { avatar, address } = useCurrentUser();

  return (
    <div
      onClick={() => {
        if (!address) {
          handleConnect();
        }
      }}
      className={`flex h-[60px] w-[260px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-mainV1 p-4 ${
        address ? 'bg-white' : 'bg-mainV1'
      }`}
    >
      {!address ? (
        <span className="font-roboto text-lg font-semibold text-white">
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      ) : (
        <div className="flex h-full w-full items-center justify-between">
          {/*  todo 圆形不彻底*/}

          <div className="flex items-center space-x-4">
            <img
              className="size-8 rounded-full"
              src={avatar}
              alt={address}
            ></img>

            <span className="font-roboto text-lg font-semibold text-black">
              {readableAddr(address)}
            </span>
          </div>

          <span
            onClick={() => {
              if (wallet) {
                disconnect(wallet);
                onClose();
              }
            }}
          >
            <Close2 color="#202020"></Close2>
          </span>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletMobile;
