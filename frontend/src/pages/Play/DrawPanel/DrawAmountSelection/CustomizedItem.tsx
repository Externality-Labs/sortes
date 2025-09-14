import { useRef, useState } from 'react';
import { getMinTicketPrice, MaxDrawAmount } from './constant';
import CustomizedItemInput from './CustomizedItemInput';

const MaxTicketPrice = 1000;

const CustomizedItem: React.FC<{
  drawAmount: number;
  ticketPrice: number;
  setDrawAmount: (drawAmount: number) => void;
  setTicketPrice: (ticketPrice: number) => void;
  active: boolean;
}> = ({ drawAmount, ticketPrice, active, setDrawAmount, setTicketPrice }) => {
  const amountRef = useRef<HTMLInputElement>(null);
  const ticketRef = useRef<HTMLInputElement>(null);
  const [focusOn, setFocuseOn] = useState<'ticket' | 'amount'>('ticket');
  const isAmountValid =
    !isNaN(drawAmount) && drawAmount > 0 && drawAmount <= MaxDrawAmount;
  const isTicketValid =
    !isNaN(ticketPrice) &&
    ticketPrice >= getMinTicketPrice() &&
    ticketPrice <= MaxTicketPrice;
  const isInputValid = isAmountValid && isTicketValid;
  const msg = !active
    ? 'Click to customize ticket value and amount'
    : focusOn === 'ticket'
      ? `Customizable tickets from $${getMinTicketPrice()} to $${MaxTicketPrice}`
      : `Ticket amount in the range of 1-${MaxDrawAmount}`;

  const isInputEmpty = amountRef.current?.value === '';
  const textColorClz = active ? 'text-white' : 'text-[#3370FF]';
  const borderColorClz = active ? 'border-none' : 'border-mainV1';
  const tipsColorClz =
    isInputValid || isInputEmpty ? textColorClz : 'text-[#FFDD17]';

  return (
    <div
      className={
        'sm:px-7.5 flex cursor-pointer flex-col rounded-lg border border-solid border-link px-3 py-3 text-sm sm:text-base ' +
        textColorClz +
        ' ' +
        borderColorClz
      }
      style={{
        background: active
          ? 'linear-gradient(289deg, #1CADFF 11.56%, #DBFF00 150.15%)'
          : 'white',
      }}
      onClick={() => {
        if (!active) {
          setDrawAmount(0);
          setTicketPrice(0);
          ticketRef.current?.focus();
        }
      }}
    >
      <div className="flex w-full items-center justify-between">
        <CustomizedItemInput
          refObj={ticketRef}
          value={active && ticketPrice !== 0 ? ticketPrice : ''}
          onChange={(price: number) => {
            if (isNaN(price) || price < 0) {
              return setTicketPrice(0);
            }
            if (price > MaxTicketPrice) {
              setTicketPrice(MaxTicketPrice);
              return;
            }
            setTicketPrice(price);
          }}
          onInputFocus={() => setFocuseOn('ticket')}
          active={active}
          valid={isTicketValid}
        />
        <span className="text-sm max-sm:-ml-2 sm:text-base">USD</span>
        <i className="icon-close iconfont max-sm:text-[10px]"></i>
        <span className="relative -mr-2 sm:mr-0">
          <CustomizedItemInput
            refObj={amountRef}
            value={active && drawAmount !== 0 ? drawAmount : ''}
            onChange={(amount: number) => {
              if (isNaN(amount) || amount < 0) {
                return setDrawAmount(0);
              }
              if (amount.toString().length > 3) return;
              setDrawAmount(amount);
            }}
            onInputFocus={() => setFocuseOn('amount')}
            active={active}
            valid={isAmountValid}
          />
          <span
            onClick={(e) => {
              setDrawAmount(MaxDrawAmount);
              amountRef.current?.focus();
              e.stopPropagation();
            }}
            className="absolute bottom-2 right-4 cursor-pointer border-b border-primary text-[#00CCAA] max-sm:bottom-2 max-sm:right-2"
          >
            Max
          </span>
        </span>
        <span className="self-end py-4">Times</span>
      </div>
      <div className={'text-left font-normal max-sm:text-xs ' + tipsColorClz}>
        {msg}
      </div>
    </div>
  );
};
export default CustomizedItem;
