import React, { HTMLAttributes, useMemo } from 'react';
import { ProbabilityTable } from '../../services/type';
import { useJkpt, usePoolSize, usePrizeItems } from '../../hooks/pool';
import Loading from '../../assets/animations/loading.json';
import Lottie from 'lottie-react';
import PrizeItem from '../../components/PrizeTable/PrizeItem';
import { PrizeTableItem } from '../../components/PrizeTable/type';
import PrizeTablePopup from '../../components/PrizeTable/Popup';
import Tooltip from '../../components/Tooltip';

interface PossibilityTableProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  probabilityTable: ProbabilityTable;
  ticketPrice?: number;
  tablePopupVisible: boolean;
  setTablePopupVisible: (visible: boolean) => void;
  className?: string;
}

enum SortType {
  Asc = 'asc',
  Desc = 'desc',
  Default = 'default',
}

const ArrowIcon: React.FC<
  { enable: boolean } & HTMLAttributes<HTMLSpanElement>
> = ({ enable, className }) => {
  return (
    <span className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
      >
        {enable ? (
          <path
            d="M13.2104 10.222L8.15953 4.36524C8.01496 4.19759 7.73658 4.19759 7.59047 4.36524L2.5396 10.222C2.35196 10.4404 2.52114 10.7603 2.82413 10.7603H12.9259C13.2289 10.7603 13.398 10.4404 13.2104 10.222Z"
            fill="#1890FF"
          />
        ) : (
          <path
            d="M13.2104 10.222L8.15953 4.36524C8.01496 4.19759 7.73658 4.19759 7.59047 4.36524L2.5396 10.222C2.35196 10.4404 2.52114 10.7603 2.82413 10.7603H12.9259C13.2289 10.7603 13.398 10.4404 13.2104 10.222Z"
            fill="black"
            fillOpacity="0.25"
          />
        )}
      </svg>
    </span>
  );
};

const PossibilityTable: React.FC<PossibilityTableProps> = ({
  name,
  probabilityTable,
  ticketPrice,
  tablePopupVisible,
  setTablePopupVisible,
  className,
}) => {
  const [sortType, setSortType] = React.useState(SortType.Default);
  const { outputToken } = probabilityTable;
  const poolSize = usePoolSize(outputToken);
  const { jkptPrice, jkptName } = useJkpt(outputToken);
  const loading = poolSize === null || jkptPrice === null;
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
    const data = [
      ...items,
      {
        prize: 1,
        possibility: expPosibility,
        isGood: true,
        jkptName,
      },
    ];

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
  }, [items, jkptName, jkptPrice, sortType, ticketPrice]);

  if (loading) {
    return (
      <Lottie animationData={Loading} className="m-auto h-40 w-40 rounded-lg" />
    );
  }

  return (
    <div
      className={`relative flex w-[378px] flex-col max-sm:mb-4 sm:ml-14 ${className}`}
    >
      <div className="flex items-center justify-between text-left max-sm:mb-4 max-sm:text-stone-500">
        <section className="flex items-center">
          <span className="mr-2 text-lg max-sm:text-lg">Prize Amount</span>
          <span className="flex flex-1 items-center max-sm:hidden">
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
                className="origin-center rotate-180"
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
          </span>
        </section>
        <div className="relative text-lg max-sm:text-lg md:mr-2">
          chance
          <div className="absolute -right-[18px] -top-[15px] z-10 size-4">
            <Tooltip type="info">
              <div className="absolute -top-[100px] z-30 ml-5 w-[200px] rounded-lg bg-[#f8f8f8] p-2 shadow-lg max-sm:-top-[120px] max-sm:right-2">
                Prize table is based on a $1 ticket. Jackpot amount is fixed.
                USD & EXP prize amounts scale with ticket value. Jackpot chance
                rises, EXP chance drops with ticket value.
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto sm:pt-9">
        <div className="flex w-full flex-col text-left max-sm:pl-0">
          <div className="flex px-4 text-base text-dark3 sm:text-lg"></div>
          <ul className="relative flex flex-1 flex-col space-y-9 text-base font-normal sm:text-lg">
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
      </div>
      <div
        className="ml-4 mt-[41px] flex cursor-pointer items-center justify-center space-x-2.5 max-sm:hidden"
        onClick={() => setTablePopupVisible(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-3"
          viewBox="0 0 17 16"
          fill="none"
        >
          <path
            d="M7.02681 14.4292H3.25185L7.40069 10.2846C7.54809 10.1372 7.63089 9.93727 7.63089 9.72882C7.63089 9.52037 7.54809 9.32046 7.40069 9.17306C7.25329 9.02567 7.05338 8.94286 6.84493 8.94286C6.63648 8.94286 6.43657 9.02567 6.28917 9.17306L2.07381 13.3817V9.64293C2.07381 9.43423 1.99091 9.23408 1.84333 9.08651C1.69576 8.93893 1.49561 8.85603 1.28691 8.85603C1.07821 8.85603 0.878053 8.93893 0.73048 9.08651C0.582906 9.23408 0.5 9.43423 0.5 9.64293V15.2149C0.5 15.6485 0.851982 15.9997 1.28648 15.9997H7.02513C7.1283 15.9998 7.23049 15.9795 7.32585 15.9402C7.42121 15.9008 7.50788 15.843 7.58091 15.7701C7.65394 15.6973 7.71191 15.6107 7.75149 15.5154C7.79107 15.4202 7.8115 15.318 7.81161 15.2149C7.81173 15.1117 7.79151 15.0095 7.75213 14.9141C7.71275 14.8188 7.65498 14.7321 7.5821 14.6591C7.50923 14.586 7.42268 14.5281 7.3274 14.4885C7.23213 14.4489 7.12999 14.4285 7.02681 14.4284V14.4292ZM15.716 0.000492356H9.9774C9.87422 0.000492353 9.77206 0.0208138 9.67674 0.060296C9.58143 0.0997783 9.49482 0.157648 9.42186 0.230602C9.34891 0.303555 9.29104 0.390164 9.25156 0.485483C9.21208 0.580801 9.19175 0.682963 9.19175 0.786135C9.19175 0.889307 9.21208 0.991469 9.25156 1.08679C9.29104 1.18211 9.34891 1.26871 9.42186 1.34167C9.49482 1.41462 9.58143 1.47249 9.67674 1.51198C9.77206 1.55146 9.87422 1.57178 9.9774 1.57178H13.7507L9.60184 5.71472C9.49062 5.82411 9.4146 5.96423 9.38354 6.11711C9.35248 6.26999 9.36779 6.42866 9.4275 6.57278C9.48721 6.7169 9.58861 6.83991 9.71869 6.92602C9.84877 7.01214 10.0016 7.05744 10.1576 7.05612C10.2609 7.05621 10.3631 7.03587 10.4585 6.99627C10.5539 6.95667 10.6405 6.8986 10.7134 6.8254L14.927 2.61593V6.35637C14.927 6.56496 15.0099 6.765 15.1574 6.9125C15.3049 7.05999 15.5049 7.14285 15.7135 7.14285C15.9221 7.14285 16.1222 7.05999 16.2696 6.9125C16.4171 6.765 16.5 6.56496 16.5 6.35637V0.783609C16.5 0.680556 16.4797 0.578516 16.4401 0.483339C16.4006 0.388161 16.3427 0.301719 16.2697 0.228967C16.1968 0.156215 16.1101 0.0985834 16.0148 0.0593769C15.9195 0.0201705 15.8174 0.000159926 15.7144 0.000492356H15.7152H15.716Z"
            fill="#B3B3B3"
          />
        </svg>
        <span className="text-xs font-normal text-[#B3B3B3] underline">
          Click to see the full prize table
        </span>
      </div>
      <PrizeTablePopup
        name={name}
        visible={tablePopupVisible}
        setVisible={setTablePopupVisible}
        probabilityTable={probabilityTable}
        isSpd={true}
      />
    </div>
  );
};

export default PossibilityTable;
