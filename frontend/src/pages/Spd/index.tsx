import Filter from '../../components/Filter';

import {
  DrawAmount,
  getMinTicketPrice,
  MaxDrawAmount,
} from '../Play/DrawPanel/DrawAmountSelection/constant';
import SortButton from '../Play/DrawPlay/SortButton';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../../atoms/web3';
import { VoucherStatus } from '../Play/DrawPanel/DrawAmountSelection/VoucherItem';
import SpdItem from './SpdItem';
import MySpd from './MySpd';
import { probabilityTablesAtom } from '../../atoms/probabilityTable';
import { getWinRate, getJackpot } from '../../utils/probabilityTable';

import { priceAtom } from '../../atoms/price';
import { chainAtom } from '../../atoms/chain';
import Token from '../../utils/token';
import { Web3Service } from '../../services/web3';
import { ProbabilityTable } from '../../services/type';

const SpdPage = () => {
  const [filter, setFilter] = useState('All');
  const [tablePopupVisible, setTablePopupVisible] = useState(false);

  const [drawAmount] = useState<number>(1);
  const [ticketPrice] = useState<number>(DrawAmount.OneUSD);
  const [voucher] = useState<VoucherStatus | null>(null);

  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(
    {}
  );
  const createSpdTableRef = useRef<HTMLDivElement>(null);
  const probabilityTables = useAtomValue(probabilityTablesAtom);
  const priceMap = useAtomValue(priceAtom);
  const chainId = useAtomValue(chainAtom);

  // Sorting state
  type SortKey = 'jackpot' | 'winRate' | 'payoutRatio';
  type SortOrder = 'asc' | 'desc' | undefined;
  interface SortState {
    jackpot?: SortOrder;
    winRate?: SortOrder;
    payoutRatio?: SortOrder;
    lastKey: SortKey | null;
  }
  const [sortState, setSortState] = useState<SortState>({ lastKey: null });
  const [poolSizeMap, setPoolSizeMap] = useState<Record<string, number>>({});

  // Generate dynamic filter options from available probability tables
  const filterOptions = useMemo(() => {
    const uniqueTokens = new Set<string>();
    probabilityTables.forEach((table) => {
      try {
        const token = Token.getTokenByAddress(table.outputToken);
        uniqueTokens.add(token.name.toUpperCase());
      } catch (error) {
        // Token not found, skip
        console.warn(`Token not found for address: ${table.outputToken}`);
      }
    });
    return ['All', ...Array.from(uniqueTokens).sort()];
  }, [probabilityTables]);

  // Load all required pool sizes for calculations
  useEffect(() => {
    const loadAllPoolSizes = async () => {
      if (!isWeb3ServiceInited) return;
      const tokenAddresses = new Set<string>();
      probabilityTables.forEach((t) => tokenAddresses.add(t.outputToken));

      const addresses = Array.from(tokenAddresses);
      const results = await Promise.all(
        addresses.map(async (addr) => {
          try {
            const size = await Web3Service.service.getPoolSize(addr);
            return [addr, Number(size)] as const;
          } catch (e) {
            return [addr, 0] as const;
          }
        })
      );

      setPoolSizeMap((prev) => {
        const next = { ...prev };
        results.forEach(([addr, size]) => {
          next[addr] = size;
        });
        return next;
      });
    };

    loadAllPoolSizes();
  }, [isWeb3ServiceInited, probabilityTables, chainId]);

  // Handle click outside to hide the create SPD table
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const triggerDiv = document.querySelector('.spd-trigger-div');

      if (
        createSpdTableRef.current &&
        !createSpdTableRef.current.contains(target) &&
        !(triggerDiv && triggerDiv.contains(target)) &&
        Object.values(expandedTables).some((expanded) => expanded)
      ) {
        setExpandedTables({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedTables]);

  const toggleTable = (tableId: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableId]: !prev[tableId],
    }));
  };

  // Filter probability tables based on selected token
  const filteredTables = useMemo(() => {
    return probabilityTables.filter((table) => {
      // Pool token filter
      if (filter !== 'All') {
        try {
          const token = Token.getTokenByAddress(table.outputToken);
          if (token.name.toUpperCase() !== filter) {
            return false;
          }
        } catch (error) {
          return false;
        }
      }
      return true;
    });
  }, [probabilityTables, filter]);

  // Calculate metrics for a probability table
  const calculateMetrics = (table: ProbabilityTable) => {
    let tokenPrice = 0;
    try {
      const token = Token.getTokenByAddress(table.outputToken);
      tokenPrice = priceMap[token.name] ?? 0;
    } catch (e) {
      tokenPrice = 0;
    }
    const poolSize = poolSizeMap[table.outputToken] ?? 0;

    const jackpot = getJackpot(table, Number(poolSize), tokenPrice);
    const winRate = getWinRate(table, Number(poolSize), tokenPrice);
    // Calculate payout ratio (Expected Value)
    const payoutRatio = jackpot * winRate;

    return { jackpot, winRate, payoutRatio };
  };

  // Sort filtered tables
  const sortedTables = useMemo(() => {
    const arr = [...filteredTables];
    const getMetric = (table: ProbabilityTable, key: SortKey) => {
      const metrics = calculateMetrics(table);
      return metrics[key];
    };

    return arr.sort((a, b) => {
      const keys: SortKey[] = sortState.lastKey
        ? [
            sortState.lastKey,
            ...(['jackpot', 'winRate', 'payoutRatio'] as SortKey[]).filter(
              (k) => k !== sortState.lastKey
            ),
          ]
        : ['jackpot', 'winRate', 'payoutRatio'];

      for (const key of keys) {
        const order = sortState[key];
        if (!order) continue;
        const va = getMetric(a, key);
        const vb = getMetric(b, key);
        if (va === vb) continue;
        return order === 'asc' ? va - vb : vb - va;
      }
      return 0;
    });
  }, [filteredTables, sortState, poolSizeMap, priceMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const valid =
    voucher !== null ||
    (!isNaN(drawAmount) &&
      drawAmount > 0 &&
      drawAmount <= MaxDrawAmount &&
      !isNaN(ticketPrice) &&
      ticketPrice >= getMinTicketPrice());
  return (
    <main className="min-h-[calc(100svh-300px)] bg-mainV1 pb-16 pt-20 text-center max-sm:px-4 max-sm:pb-5 max-sm:pt-0">
      <div className="mx-auto flex w-[1100px] flex-col max-sm:w-full">
        <header className="flex flex-col text-center text-4xl font-bold text-white max-sm:mt-[30px] max-sm:items-center max-sm:justify-center max-sm:text-lg md:justify-start">
          <h1 className="text-4xl font-bold text-white max-sm:text-lg">
            Impact Draw
          </h1>
          <p className="mt-2 text-xl text-white max-sm:hidden max-sm:text-left max-sm:text-xs max-sm:font-normal">
            A community-powered draw where every ticket supports a specific
            cause.
          </p>
          <p className="mt-[2px] text-xl text-white max-sm:text-left max-sm:text-xs max-sm:font-normal md:hidden">
            A community-powered draw where <br /> every ticket supports a
            specific cause.
          </p>
        </header>
        <nav className="mt-10 flex w-full items-center justify-end space-x-4 rounded-2xl bg-[#8670fb] p-4 max-sm:hidden">
          <Filter
            className="h-8 w-[144px] text-xs"
            label="Pool Token"
            value={filter}
            options={filterOptions}
            onChange={setFilter}
          />

          <SortButton
            className="w-[100px]"
            label="Jackpot"
            SortOrder={sortState.jackpot}
            handleSortClick={() => {
              setSortState((prev) => {
                const next: SortState = { ...prev, lastKey: 'jackpot' };
                next.jackpot =
                  prev.jackpot === 'asc'
                    ? 'desc'
                    : prev.jackpot === 'desc'
                      ? undefined
                      : 'asc';
                return next;
              });
            }}
          />
          <SortButton
            className="w-[141px]"
            label="Total Win Rate"
            SortOrder={sortState.winRate}
            handleSortClick={() => {
              setSortState((prev) => {
                const next: SortState = { ...prev, lastKey: 'winRate' };
                next.winRate =
                  prev.winRate === 'asc'
                    ? 'desc'
                    : prev.winRate === 'desc'
                      ? undefined
                      : 'asc';
                return next;
              });
            }}
          />
          <SortButton
            className="w-[168px]"
            label="Payout Ratio (EV)"
            SortOrder={sortState.payoutRatio}
            handleSortClick={() => {
              setSortState((prev) => {
                const next: SortState = { ...prev, lastKey: 'payoutRatio' };
                next.payoutRatio =
                  prev.payoutRatio === 'asc'
                    ? 'desc'
                    : prev.payoutRatio === 'desc'
                      ? undefined
                      : 'asc';
                return next;
              });
            }}
          />
        </nav>
        <nav className="mt-6 flex w-full items-center justify-end space-x-4 rounded-2xl p-4 max-sm:mt-2 max-sm:space-x-1 max-sm:pb-0 max-sm:pr-0 md:hidden">
          <SortButton
            className="w-[100px]"
            label="Jackpot"
            SortOrder={sortState.jackpot}
            handleSortClick={() => {
              setSortState((prev) => {
                const next: SortState = { ...prev, lastKey: 'jackpot' };
                next.jackpot =
                  prev.jackpot === 'asc'
                    ? 'desc'
                    : prev.jackpot === 'desc'
                      ? undefined
                      : 'asc';
                return next;
              });
            }}
          />
          <SortButton
            className="w-[141px]"
            label="Total Win Rate"
            SortOrder={sortState.winRate}
            handleSortClick={() => {
              setSortState((prev) => {
                const next: SortState = { ...prev, lastKey: 'winRate' };
                next.winRate =
                  prev.winRate === 'asc'
                    ? 'desc'
                    : prev.winRate === 'desc'
                      ? undefined
                      : 'asc';
                return next;
              });
            }}
          />
          <SortButton
            className="w-[168px]"
            label="Payout Ratio (EV)"
            SortOrder={sortState.payoutRatio}
            handleSortClick={() => {
              setSortState((prev) => {
                const next: SortState = { ...prev, lastKey: 'payoutRatio' };
                next.payoutRatio =
                  prev.payoutRatio === 'asc'
                    ? 'desc'
                    : prev.payoutRatio === 'desc'
                      ? undefined
                      : 'asc';
                return next;
              });
            }}
          />
          <Filter
            className="h-8 w-[144px] text-xs max-sm:w-[150px]"
            buttonClassName="max-sm:rounded-[4px]"
            label="Pool Token"
            value={filter}
            options={filterOptions}
            onChange={setFilter}
          />
        </nav>

        <section className="mt-4 flex w-full flex-col items-center space-y-4 rounded-2xl max-sm:mt-2">
          {sortedTables.map((table) => (
            <SpdItem
              key={table.id}
              isExpandable={true}
              expanded={expandedTables[table.id] || false}
              onToggle={() => toggleTable(table.id)}
              isWeb3ServiceInited={isWeb3ServiceInited}
              probabilityTable={table}
              tablePopupVisible={tablePopupVisible}
              setTablePopupVisible={setTablePopupVisible}
              ticketPrice={
                valid
                  ? voucher === null
                    ? ticketPrice
                    : voucher.amount
                  : ticketPrice
              }
              valid={valid}
              voucher={voucher}
            />
          ))}
        </section>
      </div>

      <div className="mx-auto mt-20 flex w-[1100px] flex-col max-sm:mt-[36px] max-sm:w-full">
        <header className="text-left text-4xl font-bold text-white max-sm:text-lg md:w-[1100px]">
          My Table List
        </header>
        <div className="mt-8 max-sm:mt-4">
          <MySpd />
        </div>
      </div>
    </main>
  );
};

export default SpdPage;
