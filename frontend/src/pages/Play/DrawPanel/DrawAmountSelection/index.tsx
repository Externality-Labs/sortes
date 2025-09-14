import { useCallback, useState } from 'react';
import { DrawAmount } from './constant';
import Item from './Item';
import CustomizedItem from './CustomizedItem';
import VoucherItem, { VoucherOptions, VoucherStatus } from './VoucherItem';
// import { currentChainInfo } from '../../../../utils/env';
// import { ChainId } from '../../../../atoms/chain';

enum ActiveSection {
  Fixed = 'Fixed',
  Customized = 'Customized',
  Voucher = 'Voucher',
}

interface DrawAmountSelectionProps extends VoucherOptions {
  drawAmount: number;
  ticketPrice: number;
  setDrawAmount: (drawAmount: number) => void;
  setTicketPrice: (ticketPrice: number) => void;
}

const DrawAmountSelection: React.FC<DrawAmountSelectionProps> = ({
  drawAmount,
  ticketPrice,
  setDrawAmount,
  setTicketPrice,
  voucher,
  setVoucher,
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    ActiveSection.Fixed
  );
  // const chainId = currentChainInfo().chainId;

  const handleSetVoucher = useCallback(
    (voucher: VoucherStatus | null) => {
      setVoucher(voucher);
      setActiveSection(ActiveSection.Voucher);
    },
    [setVoucher]
  );
  // const isBnbChain = chainId === ChainId.BNB;
  // const drawAmountOptions = isBnbChain
  //   ? [
  //       DrawAmount.TenUSD,
  //       DrawAmount.TwentyUSD,
  //       DrawAmount.FiftyUSD,
  //       DrawAmount.OnHundredUSD,
  //     ]
  //   : [
  //       DrawAmount.OneUSD,
  //       DrawAmount.FiveUSD,
  //       DrawAmount.TenUSD,
  //       DrawAmount.TwentyUSD,
  //     ];
  const drawAmountOptions = [
    DrawAmount.OneUSD,
    DrawAmount.FiveUSD,
    DrawAmount.TenUSD,
    DrawAmount.TwentyUSD,
  ];

  return (
    <div className="flex flex-col space-y-2.5">
      <div className="flex justify-between space-x-2">
        <VoucherItem
          amount={1}
          voucher={voucher}
          setVoucher={handleSetVoucher}
        />
        <VoucherItem
          amount={10}
          voucher={voucher}
          setVoucher={handleSetVoucher}
        />
      </div>
      <div className="flex justify-between space-x-2">
        {drawAmountOptions.map((val) => (
          <Item
            key={val}
            value={val}
            active={
              activeSection === ActiveSection.Fixed && ticketPrice === val
            }
            setValue={() => {
              setDrawAmount(1);
              setTicketPrice(val);
              setActiveSection(ActiveSection.Fixed);
              setVoucher(null);
            }}
          />
        ))}
      </div>
      <CustomizedItem
        drawAmount={drawAmount}
        ticketPrice={ticketPrice}
        setDrawAmount={(val) => {
          setDrawAmount(val);
          setActiveSection(ActiveSection.Customized);
          setVoucher(null);
        }}
        setTicketPrice={(val) => {
          setTicketPrice(val);
          setActiveSection(ActiveSection.Customized);
          setVoucher(null);
        }}
        active={activeSection === ActiveSection.Customized}
      />
    </div>
  );
};
export default DrawAmountSelection;
