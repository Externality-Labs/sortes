import React, { useMemo, useState } from 'react';
import PrizeItem from './PrizeItem';
import { useJkpt, usePrizeItems } from '../../hooks/pool';
import { PrizeTableItem } from './type';
import { ProbabilityTable } from '../../services/type';
import ArrowIcon from './ArrowIcon';

interface PrizeTableProps {
  ticketPrice?: number;
  probabilityTable: ProbabilityTable;
  isSpd: boolean;
}

enum SortType {
  Asc = 'asc',
  Desc = 'desc',
  Default = 'default',
}

const PrizeTable: React.FC<PrizeTableProps> = ({
  probabilityTable,
  ticketPrice,
  isSpd,
}) => {
  const [sortType, setSortType] = useState(SortType.Default);
  const { outputToken } = probabilityTable;

  const { jkptPrice, jkptName } = useJkpt(outputToken);
  const items = usePrizeItems(probabilityTable);

  const handleSort = () => {
    if (sortType === SortType.Default) setSortType(SortType.Asc);
    else if (sortType === SortType.Asc) setSortType(SortType.Desc);
    else setSortType(SortType.Asc);
  };

  const allItems = useMemo(() => {
    const expPosibility =
      1 -
      items.reduce(
        (acc, item) =>
          acc +
          (item.isFixedReward
            ? item.possibility
            : item.possibility * (ticketPrice || 1)),
        0
      );
    const lastPrize = isSpd
      ? {
          prize: 1,
          possibility: expPosibility,
          isGood: true,
          jkptName,
        }
      : {
          prize: 1,
          possibility: expPosibility,
          isExp: true,
          jkptName,
        };
    const data = [...items, lastPrize];

    // Compare logic, EXP is always smaller than others, then sort by USD value
    const compare = (a: PrizeTableItem, b: PrizeTableItem) => {
      if (a.isExp) return -1;
      if (b.isExp) return 1;
      const getUsdValue = (item: PrizeTableItem) =>
        item.isFixedReward ? item.prize : item.prize * jkptPrice!;
      return getUsdValue(a) - getUsdValue(b);
    };

    if (sortType === SortType.Asc) data.sort(compare);
    else if (sortType === SortType.Desc) data.sort(compare).reverse();

    return data;
  }, [isSpd, items, jkptName, jkptPrice, sortType, ticketPrice]);

  return (
    <div className="flex w-full flex-col text-left max-sm:pl-0">
      <ul className="relative flex flex-1 flex-col space-y-[45px] pt-4 text-base font-normal sm:text-lg">
        <div className="flex h-6 justify-between text-lg font-bold text-[#666666]">
          <section className="flex items-center space-x-[10px]">
            <span className=" ">Prize Amount</span>
            <span
              className="mr-1.5 flex cursor-pointer flex-col items-center sm:mr-3.5"
              onClick={handleSort}
            >
              <ArrowIcon
                enable={sortType === SortType.Asc}
                className="-mb-1.5 mr-[1px]"
              />
              <ArrowIcon
                enable={sortType === SortType.Desc}
                className="ml-[1px] origin-center rotate-180"
              />
            </span>
            <span
              className="cursor-pointer"
              onClick={() => setSortType(SortType.Default)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="18"
                viewBox="0 0 19 18"
                fill="none"
              >
                <path
                  d="M13.8351 3.756L12.6831 5.172L18.6771 5.73L16.8831 0L15.4611 1.752C13.9071 0.612 12.0291 0 10.1031 0C5.1171 0 1.0791 4.032 1.0791 8.99999C1.0791 13.974 5.1231 18 10.1031 18C13.8411 18.006 17.1951 15.702 18.5391 12.21C18.6591 11.892 18.6531 11.538 18.5091 11.226C18.3711 10.914 18.1131 10.674 17.7951 10.548C17.1291 10.296 16.3851 10.626 16.1271 11.292C15.1671 13.788 12.7731 15.432 10.1031 15.426C6.5391 15.426 3.6531 12.546 3.6531 8.99399C3.6531 5.442 6.5391 2.568 10.1031 2.568C11.4651 2.574 12.7611 2.994 13.8351 3.756Z"
                  fill="#1890FF"
                />
                <defs>
                  <clipPath id="clip0_5188_9283">
                    <rect
                      width="18"
                      height="18"
                      fill="white"
                      transform="translate(0.875)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </section>
          <span>Chance</span>
        </div>
        {allItems.map((item, idx) => (
          <PrizeItem
            key={idx}
            {...item}
            ticketPrice={ticketPrice}
            jkptName={jkptName}
          />
        ))}
      </ul>
    </div>
  );
};
export default PrizeTable;
