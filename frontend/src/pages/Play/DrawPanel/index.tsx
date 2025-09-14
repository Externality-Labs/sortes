import PossibilityTable from './PossibilityTable.tsx';
import Balance from './Balance.tsx';
import DrawAmountSelection from './DrawAmountSelection/index.tsx';
import { useCallback, useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../../../atoms/web3.ts';
import {
  DrawAmount,
  getMinTicketPrice,
  MaxDrawAmount,
} from './DrawAmountSelection/constant.ts';
import ChooseCurrencyPopup from './ChooseCurrencyPopup.tsx';
import { formatUSD } from '../../../utils/format.ts';
import { VoucherStatus } from './DrawAmountSelection/VoucherItem.tsx';
import { ProbabilityTable } from '../../../services/type.ts';
import { usePlay } from '../../../hooks/play.ts';
import Jackpot from './Jackpot.tsx';
import { Spd } from '../../../hooks/probabilityTable.ts';
import JkptIcon from '../../../components/jkpt/Icon.tsx';
import { usePoolSize } from '../../../hooks/pool.ts';
import Token from '../../../utils/token.ts';
import SharePosterPopup from '../../../components/SharePoster/Popup.tsx';
interface DrawPanelProps {
  spd?: Spd;
  probabilityTable: ProbabilityTable;
  hasProposalCard?: boolean; // Whether to remove bottom border radius
}

const DrawPanel: React.FC<DrawPanelProps> = ({
  probabilityTable,
  spd,
  hasProposalCard = false,
}) => {
  const [drawAmount, setDrawAmount] = useState<number>(1);
  const [ticketPrice, setTicketPrice] = useState<number>(DrawAmount.OneUSD);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const [choosePaymentVisable, setChoosePaymentVisable] = useState(false);
  const poolSize = usePoolSize(probabilityTable.outputToken);
  const poolToken = Token.getTokenByAddress(probabilityTable.outputToken);

  const [voucher, setVoucher] = useState<VoucherStatus | null>(null);
  const { playWithVoucher } = usePlay();
  const [tablePopupVisible, setTablePopupVisible] = useState(false);
  const [sharePosterVisible, setSharePosterVisible] = useState(false);
  const valid =
    voucher !== null ||
    (!isNaN(drawAmount) &&
      drawAmount > 0 &&
      drawAmount <= MaxDrawAmount &&
      !isNaN(ticketPrice) &&
      ticketPrice >= getMinTicketPrice());

  const handleConfirm = useCallback(() => {
    if (voucher === null) {
      setChoosePaymentVisable(true);
      return;
    } else {
      playWithVoucher(voucher.voucherId, probabilityTable, spd?.donationId);
    }
  }, [playWithVoucher, probabilityTable, spd?.donationId, voucher]);

  // Memoize container className based on hasProposalCard
  const containerClassName = useMemo(() => {
    return `relative overflow-visible bg-white ${
      hasProposalCard ? 'rounded-t-2xl' : 'rounded-2xl'
    }`;
  }, [hasProposalCard]);

  return (
    <div className={containerClassName}>
      <i
        className="iconfont icon-link absolute right-4 top-4 size-5 cursor-pointer text-2xl text-[#93DC08] max-sm:text-base"
        onClick={() => setSharePosterVisible(true)}
      ></i>
      {probabilityTable && (
        <Jackpot
          probabilityTable={probabilityTable}
          name={spd?.name ?? probabilityTable.name}
        />
      )}
      <div className="direction-col flex w-full overflow-hidden pb-9 pl-[69px] pt-10 max-sm:flex-col max-sm:p-4">
        <div className="flex flex-col sm:w-[520px]">
          <div className="mb-4 flex items-center gap-2 text-[18px] font-bold text-[#00CCAA] sm:mb-10 sm:text-2xl">
            <JkptIcon
              tokenAddress={probabilityTable?.outputToken}
              sizeClz="max-sm:size-5 size-8"
            />
            <span>Pool</span>
            <span>
              {poolSize} {poolToken.name.toUpperCase()}
            </span>
          </div>
          <DrawAmountSelection
            drawAmount={drawAmount}
            ticketPrice={ticketPrice}
            setDrawAmount={setDrawAmount}
            setTicketPrice={setTicketPrice}
            voucher={voucher}
            setVoucher={setVoucher}
          />

          {probabilityTable && (
            <button
              className="mt-4 rounded-2xl bg-[#00CCAA] py-6 text-2xl text-white disabled:bg-[#00CCAA]/50 max-sm:mx-auto max-sm:w-full max-sm:rounded-[8px] max-sm:py-2 max-sm:text-xl sm:mt-8"
              disabled={!valid}
              onClick={handleConfirm}
            >
              {(() => {
                if (voucher === null) {
                  return `Draw: ${formatUSD(drawAmount * ticketPrice)}`;
                } else {
                  return `Draw with: ${formatUSD(voucher.amount)} Voucher`;
                }
              })()}
            </button>
          )}
          <Balance />
          <ChooseCurrencyPopup
            spd={spd}
            visible={choosePaymentVisable}
            repeats={drawAmount}
            ticket={ticketPrice}
            setVisible={setChoosePaymentVisable}
            probabilityTable={probabilityTable}
          />
        </div>
        {isWeb3ServiceInited && probabilityTable && (
          <PossibilityTable
            name={spd?.name ?? probabilityTable.name}
            probabilityTable={probabilityTable}
            tablePopupVisible={tablePopupVisible}
            setTablePopupVisible={setTablePopupVisible}
            ticketPrice={
              valid
                ? voucher === null
                  ? ticketPrice
                  : voucher.amount
                : ticketPrice
            }
            isSpd={!!spd}
          ></PossibilityTable>
        )}
      </div>
      <SharePosterPopup
        visible={sharePosterVisible}
        setVisible={setSharePosterVisible}
        tableId={probabilityTable.id}
        label={probabilityTable.name}
        spd={spd}
      />
    </div>
  );
};

export default DrawPanel;
