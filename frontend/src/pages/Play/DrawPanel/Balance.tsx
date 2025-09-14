import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../../../atoms/web3';
import { useUsdcBalance, useUsdtBalance } from '../../../hooks/balance';
import { useFaucet } from '../../../hooks/faucet';
import Spin from '../../../components/Spin';
import { currentChainInfo } from '../../../utils/env';
import { formatUSD } from '../../../utils/format';

const BalanceComp: React.FC = () => {
  const { usdtBalance } = useUsdtBalance();
  const { usdcBalance } = useUsdcBalance();
  const { faucet, faucetLoading } = useFaucet();
  const isTestnet = currentChainInfo().isTestnet;

  return (
    <div className="py-2 text-right text-sm font-normal max-sm:mb-2 max-sm:pt-[9px]">
      <span className="mr-2 text-[#00CCAA]">
        <span className="">Available:</span>
        <span className="ml-2 flex-1 truncate">
          {formatUSD(Number(usdtBalance || 0) + Number(usdcBalance || 0))}
        </span>
      </span>
      {isTestnet && (
        <span className="ml-2 max-sm:hidden">
          <span
            className="relative cursor-pointer text-sm text-link"
            onClick={faucet}
          >
            {faucetLoading ? (
              <Spin className="ml-[2px] mr-[3px] inline-block h-4 w-4" />
            ) : (
              <i className="iconfont icon-faucet" />
            )}
            <span className="underline">Get Testnet Tokens</span>
          </span>
        </span>
      )}
    </div>
  );
};

const Balance: React.FC = () => {
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  if (!isWeb3ServiceInited) return null;
  else return <BalanceComp />;
};

export default Balance;
