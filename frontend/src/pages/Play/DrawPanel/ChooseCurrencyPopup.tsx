import { useCallback, useEffect, useState } from 'react';
import { usePlay } from '../../../hooks/play.ts';
import { Popup, PopupProps } from '../../../components/Modal/Popup.tsx';
import { useUsdcBalance, useUsdtBalance } from '../../../hooks/balance.ts';
import { PlayCurrency } from '../../../utils/reward.ts';
import IconUSDC from '../../../assets/icons/icon-USDC.png';
import IconUSDT from '../../../assets/icons/icon-USDT2.png';
import Insufficient from '../../../assets/svg/lott/Insufficient.svg';
import Sufficient from '../../../assets/svg/lott/Sufficient.svg';
import { formatUSD } from '../../../utils/format.ts';
import { ProbabilityTable } from '../../../services/type.ts';
import { Spd } from '../../../hooks/probabilityTable.ts';

interface ChooseCurrencyPopupProps extends PopupProps {
  spd?: Spd;
  probabilityTable: ProbabilityTable | null;
  repeats: number;
  ticket: number;
}

const ChooseCurrencyPopup: React.FC<ChooseCurrencyPopupProps> = ({
  probabilityTable,
  repeats,
  ticket,
  visible,
  setVisible,
  spd,
}) => {
  const { play } = usePlay();
  const totalAmount = ticket * repeats;

  const { usdtBalance } = useUsdtBalance();
  const { usdcBalance, isUsdcSupported } = useUsdcBalance();
  const [currency, setCurrency] = useState<PlayCurrency | null>(null);

  const isUsdtSufficient = Number(usdtBalance) >= totalAmount;
  const isUsdcSufficient = Number(usdcBalance) >= totalAmount;
  const isBalanceSufficient =
    isUsdtSufficient || (isUsdcSupported && isUsdcSufficient);

  const defaultCurrency =
    isUsdcSufficient && isUsdcSupported
      ? PlayCurrency.USDC
      : isUsdtSufficient
        ? PlayCurrency.USDT
        : null;

  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const handlePlay = useCallback(
    (probabilityTable: ProbabilityTable | null) => {
      if (!probabilityTable || currency === null) return;

      play({
        value: ticket.toString(),
        repeats: repeats.toString(),
        table: probabilityTable,
        currency,
        donationId: spd?.donationId,
      });

      setVisible(false);
    },
    [currency, play, ticket, repeats, setVisible, spd]
  );

  const resetStates = () => {
    setVisible(false);
  };

  return (
    <Popup visible={visible} setVisible={setVisible}>
      <div
        style={{ boxShadow: '0 4px 4px #00000040' }}
        className="flex max-w-[695px] flex-col rounded-xl bg-white px-9 py-9 font-normal max-sm:max-w-[calc(100svw-48px)] max-sm:p-4"
      >
        {!isBalanceSufficient ? (
          <>
            <span className="flex flex-col">
              <span className="mb-[30px] text-left text-4xl font-bold">
                Insufficient Balance
              </span>
            </span>

            <span className="mb-[40px] w-full text-left text-xl leading-9">
              <p>
                Sorry, Sortes only supports payments in USDT and USDC currently,
                but your balance is insufficient.
              </p>

              <p>You can go to Uniswap to swap or recharge.</p>
            </span>

            <span className="flex justify-end space-x-6 max-sm:space-x-8">
              <button
                className="border-1 rounded-[0.5rem] border border-[#3370FF] px-4 py-2 text-[#3370FF]"
                onClick={resetStates}
              >
                Cancel
              </button>
              <button
                className="rounded-[0.5rem] bg-[#3370FF] px-4 py-2 font-bold text-white"
                onClick={() => {
                  resetStates();
                  window.open('https://app.uniswap.org/swap', '_blank');
                }}
              >
                Go to Uniswap
              </button>
            </span>
          </>
        ) : (
          <>
            <span className="flex flex-col text-left text-base sm:text-4xl">
              <span className="mb-3 font-bold">
                Ticket Amount:&nbsp;
                <span className="text-[#1BA27A]">{formatUSD(totalAmount)}</span>
              </span>
              <span className="mb-4 text-nowrap max-sm:font-bold sm:mb-7">
                Choose the payment currency
              </span>
            </span>

            <span className="w-full text-left text-sm sm:text-xl">
              Please choose your payment currency for this draw from below. More
              payment methods will be supported in the future.
            </span>
            <span className="mt-9 flex justify-start space-x-6 max-sm:space-x-8">
              <button
                className={`border-1 group relative flex items-center rounded-[0.5rem] border border-[#3370FF] p-2.5 sm:px-4 sm:py-2 ${
                  currency === PlayCurrency.USDT
                    ? 'bg-[#ebf1ff]'
                    : isUsdtSufficient
                      ? ' '
                      : 'border-none bg-[#F5F5F5]'
                }`}
                onClick={() =>
                  isUsdtSufficient && setCurrency(PlayCurrency.USDT)
                }
              >
                <img
                  src={IconUSDT}
                  alt=""
                  className="mr-2 size-6 sm:size-[34px]"
                />
                <span className="max-sm:text-sm">USDT</span>
                <img
                  className="absolute -right-[0.8px] -top-[0.8px]"
                  src={isUsdtSufficient ? Sufficient : Insufficient}
                  alt=""
                />
                <div className="absolute -right-[7rem] -top-[2.2rem] text-nowrap rounded bg-[#F8F8F8] px-[6px] py-2 text-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {isUsdtSufficient
                    ? 'Sufficient balance'
                    : 'Insufficient balance'}
                </div>
              </button>
              {isUsdcSupported && (
                <button
                  className={`border-1 group relative flex items-center rounded-[0.5rem] border border-[#3370FF] p-2.5 sm:px-4 sm:py-2 ${
                    currency === PlayCurrency.USDC
                      ? 'bg-[#ebf1ff]'
                      : isUsdcSufficient
                        ? ''
                        : 'border-none bg-[#F5F5F5]'
                  }`}
                  onClick={() =>
                    isUsdcSufficient && setCurrency(PlayCurrency.USDC)
                  }
                >
                  <img
                    src={IconUSDC}
                    alt=""
                    className="mr-2 size-6 sm:size-[34px]"
                  />
                  <span className="max-sm:text-sm">USDC</span>
                  <img
                    className="absolute -right-[0.8px] -top-[0.8px]"
                    src={isUsdcSufficient ? Sufficient : Insufficient}
                    alt=""
                  />
                  <div className="absolute -right-[7rem] -top-[2.2rem] text-nowrap rounded bg-[#F8F8F8] px-[6px] py-2 text-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {isUsdcSufficient
                      ? 'Sufficient balance'
                      : 'Insufficient balance'}
                  </div>
                </button>
              )}
            </span>
            <span className="mt-8 flex justify-end space-x-6 max-sm:space-x-5 max-sm:text-sm">
              <button
                className="border-1 rounded-[0.5rem] border border-[#3370FF] px-4 py-2 text-[#3370FF]"
                onClick={resetStates}
              >
                Cancel
              </button>
              <button
                disabled={currency === null}
                className={`rounded-[0.5rem] bg-[#3370FF] px-2 py-1 font-bold text-white sm:px-4 sm:py-2 ${currency === null && 'bg-[#3370FF]/50'}`}
                onClick={() => handlePlay(probabilityTable)}
              >
                Confirm
              </button>
            </span>
          </>
        )}
      </div>
    </Popup>
  );
};

export default ChooseCurrencyPopup;
