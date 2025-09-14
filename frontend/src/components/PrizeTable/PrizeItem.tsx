import { Link } from 'react-router-dom';
import Tooltip from '../Tooltip';
import { PrizeTableItem } from './type';
import { HTMLAttributes } from 'react';
import { useAMM } from '../../hooks/sortes';

const getPrize = (
  prize: number,
  isExp: boolean,
  isFixedReward: boolean,
  jkptName: string,
  ticketPrice?: number
) => {
  if (isExp) return ticketPrice ? `${ticketPrice * 10} EXP` : '10 EXP x Ticket';
  else if (isFixedReward)
    return ticketPrice ? `$${prize * ticketPrice}` : `$${prize} x Ticket`;
  else
    return `${prize.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      minimumSignificantDigits: 2,
      maximumSignificantDigits: 4,
    })} ${jkptName.toUpperCase()}`;
};

const formatPossibility = (possibility: number): string => {
  let value: number;
  let sign: string;
  if (possibility > 0.1) {
    value = possibility;
    sign = '%';
  } else if (possibility > 0.01) {
    value = possibility * 10;
    sign = '‰';
  } else {
    value = possibility * 100;
    sign = '‱';
  }
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    minimumSignificantDigits: 2,
    maximumSignificantDigits: 4,
  })}${sign}`;
};

const PrizeItem: React.FC<PrizeTableItem & HTMLAttributes<HTMLLIElement>> = ({
  prize,
  possibility,
  ticketPrice,
  isFixedReward = true,
  isExp = false,
  isGood = false,
  jkptName,
  className,
}) => {
  const { goodPrice } = useAMM();
  const isRelative = !isFixedReward && !isExp && !isGood;

  let possibilityDisp: string;
  if (ticketPrice) {
    possibilityDisp = formatPossibility(
      possibility * 100 * (isRelative ? ticketPrice : 1)
    );
  } else {
    possibilityDisp = isRelative
      ? `${formatPossibility(possibility * 100)} x Ticket`
      : formatPossibility(possibility * 100);
  }

  return (
    <li
      className={`flex justify-between rounded-xl leading-none hover:cursor-pointer hover:bg-dark0 max-sm:text-sm ${className} `}
    >
      <div className="relative">
        <span>
          {isGood
            ? ticketPrice
              ? `${(ticketPrice * 10 * goodPrice).toFixed(2)} GOOD`
              : `${(10 * goodPrice).toFixed(2)} GOOD x Ticket`
            : getPrize(prize, isExp, isFixedReward, jkptName, ticketPrice)}
        </span>
        {isGood && (
          <span className="absolute -right-5 -top-5 size-4 max-sm:-top-3 max-sm:size-[15px]">
            <Tooltip type="info">
              <span className="absolute -top-[90px] left-4 w-[220px] rounded-lg bg-dark0 px-3 py-2 max-sm:-top-[65px] sm:-top-[65px] sm:left-[20px]">
                GOOD is the Governance & Utility Token issued by Sortes.
                <Link to="/exp" target="_blank" className="text-link underline">
                  Explore its various utility scenarios.
                </Link>
              </span>
            </Tooltip>
          </span>
        )}
      </div>
      <span className="h-6 leading-none">
        {isExp ? '≈ ' : ''}
        {possibilityDisp}
      </span>
    </li>
  );
};

export default PrizeItem;
