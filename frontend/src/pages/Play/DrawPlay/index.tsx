import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import TabButtons from './TabButtons';
import Filter from '../../../components/Filter';
import SortButton from './SortButton';
import Pagination from './Pagation';
import {
  ProbabilityTable,
  recipientCategoryOptions,
} from '../../../services/type';
import {
  getSpdTables,
  SpdTable,
  SpdTablePage,
} from '../../../services/api/spd';
import { getWinRate, getJackpot } from '../../../utils/probabilityTable';
import { useJkpt, usePoolSize } from '../../../hooks/pool';
import JkptIcon from '../../../components/jkpt/Icon';
import { probabilityTablesAtom } from '../../../atoms/probabilityTable';
import { useAtomValue } from 'jotai';
import Token from '../../../utils/token';
import { Web3Service } from '../../../services/web3';
import { web3ServiceInitedAtom } from '../../../atoms/web3';
import { priceAtom } from '../../../atoms/price';
import { chainAtom } from '../../../atoms/chain';
import { isMobileWeb } from '../../../utils/env';
import certificationSvg from '../../../assets/svg/certification.svg';
interface GameCardProps {
  spdTable?: SpdTable;
  probabilityTable?: ProbabilityTable;
}

// Game card component - simplified structure
const GameCard = ({ spdTable, probabilityTable }: GameCardProps) => {
  const tables = useAtomValue(probabilityTablesAtom);
  const table =
    probabilityTable ||
    (tables.find(
      (t) => t.id === spdTable?.probabilityTableId
    ) as ProbabilityTable);
  const poolSize = usePoolSize(table.outputToken);
  const { jkptPrice } = useJkpt(table.outputToken);

  if (!spdTable && !probabilityTable) {
    return null;
  }

  const targetUrl = spdTable
    ? `/play/spd-tables/${spdTable.id}`
    : `/play/tables/${probabilityTable?.id}`;

  const winRate = getWinRate(table, Number(poolSize), jkptPrice);
  const jackpot = getJackpot(table, Number(poolSize), jkptPrice);

  const rawTitle = spdTable ? spdTable.name : table.name;
  const displayTitle =
    isMobileWeb && rawTitle
      ? rawTitle.length > 14
        ? `${rawTitle.slice(0, 14)}...`
        : rawTitle
      : rawTitle;

  return (
    <a
      className="inline-flex w-[263px] cursor-pointer flex-col items-center overflow-hidden rounded-2xl bg-white pt-4 transition-shadow hover:shadow-lg max-sm:w-[173px] max-sm:rounded-lg max-sm:p-2"
      href={targetUrl}
      target="_blank"
    >
      {/* Image */}
      <div className="size-60 overflow-hidden rounded-2xl border border-[#E7E7E9] bg-zinc-300 max-sm:size-[168px] max-sm:rounded-lg">
        <img
          className="h-full w-full object-cover"
          src={spdTable ? spdTable.image : table.image}
          alt={spdTable ? spdTable.name : table.name}
        />
      </div>

      {/* Content */}
      <div className="w-full space-y-2 px-4 pb-4 pt-2 max-sm:space-y-1 max-sm:px-0 max-sm:py-1">
        {/* Title Row */}
        <div className="flex h-[42px] items-center space-x-[6px]">
          {spdTable && spdTable.verified && (
            <img
              className="h-4 w-[14px] flex-shrink-0 max-sm:h-[14px] max-sm:w-3"
              src={certificationSvg}
              alt="Verified"
            />
          )}
          <h3 className="text-left text-base font-bold leading-[21px] text-violet-500 max-sm:text-sm">
            {displayTitle}
          </h3>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col items-start gap-2">
          {/* Jackpot */}
          <div className="flex items-end gap-1">
            <div className="flex items-center gap-1">
              <JkptIcon
                tokenAddress={table.outputToken}
                sizeClz="size-4 max-sm:size-[14px]"
              />
              <span className="text-base font-bold leading-none text-lime-500 max-sm:text-sm">
                {jackpot.toFixed(4)}
              </span>
            </div>
            <span className="text-xs font-normal text-zinc-400 max-sm:text-[8px]">
              Jackpot
            </span>
          </div>

          {/* Win Rate */}
          <div className="flex items-end gap-1 leading-none">
            <span className="text-base font-bold leading-none text-lime-500 max-sm:text-sm">
              {(winRate * 100).toFixed(2)}%
            </span>
            <span className="text-xs font-normal text-zinc-400 max-sm:text-[8px]">
              Total Win Rate
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

const DrawPlay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Quick Play');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [quickPlayPoolFilter, setQuickPlayPoolFilter] = useState('All');
  const [purposeTypeFilter, setPurposeTypeFilter] = useState('All');
  const [purposePoolFilter, setPurposePoolFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const probabilityTables = useAtomValue(probabilityTablesAtom);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const priceMap = useAtomValue(priceAtom);
  const chainId = useAtomValue(chainAtom);

  // Check URL parameters on component mount to activate correct tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('spd-tables')) {
      setActiveTab('Play with Purpose');
      // Remove the parameter from URL after activating the tab
      searchParams.delete('spd-tables');
      const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      navigate(newUrl, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);

  // Sorting state for each mode (support selecting both buttons)
  type SortKey = 'jackpot' | 'winRate';
  type SortOrder = 'asc' | 'desc' | undefined;
  interface ModeSort {
    jackpot?: SortOrder;
    winRate?: SortOrder;
    lastKey: SortKey | null;
  }
  const [quickSort, setQuickSort] = useState<ModeSort>({ lastKey: null });
  const [purposeSort, setPurposeSort] = useState<ModeSort>({ lastKey: null });

  // SPD data states
  const [spdTables, setSpdTables] = useState<SpdTable[]>([]);
  const [spdTotal, setSpdTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Pagination uses 0-based indexing
  const itemsPerPage = isMobileWeb ? 6 : 12;
  const [poolSizeMap, setPoolSizeMap] = useState<Record<string, number>>({});

  // Debounced search keyword for Play with Purpose (1 second delay)
  const debouncedSearchKeyword = useDebounce(
    activeTab === 'Play with Purpose' ? searchKeyword : '',
    1000
  );

  // Fixed pool token options for Quick Play
  const quickPlayPoolOptions = useMemo(() => {
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

  // Fixed pool token options for Play with Purpose
  const purposePoolOptions = useMemo(() => {
    const uniqueTokens = new Set<string>();
    spdTables.forEach((spdTable) => {
      // Find the corresponding probability table
      const probabilityTable = probabilityTables.find(
        (table) => table.id === spdTable.probabilityTableId
      );
      if (probabilityTable) {
        try {
          const token = Token.getTokenByAddress(probabilityTable.outputToken);
          uniqueTokens.add(token.name.toUpperCase());
        } catch (error) {
          // Token not found, skip
          console.warn(
            `Token not found for address: ${probabilityTable.outputToken}`
          );
        }
      }
    });
    return ['All', ...Array.from(uniqueTokens).sort()];
  }, [spdTables, probabilityTables]);

  // Fetch SPD tables when "Play with Purpose" tab is active
  const fetchSpdTables = useCallback(async () => {
    if (activeTab !== 'Play with Purpose') return;

    try {
      setLoading(true);

      // Determine sort parameters based on current sort state
      let sortBy: string | undefined;
      let sortOrder: string | undefined;

      if (purposeSort.jackpot) {
        sortBy = 'jackpot';
        sortOrder = purposeSort.jackpot;
      } else if (purposeSort.winRate) {
        sortBy = 'winRate';
        sortOrder = purposeSort.winRate;
      }

      const res: SpdTablePage = await getSpdTables(
        currentPage,
        itemsPerPage,
        selectedCategory,
        sortBy,
        sortOrder,
        debouncedSearchKeyword,
        purposeTypeFilter
      );
      setSpdTables(res.items || []);
      setSpdTotal(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch SPD tables:', error);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    currentPage,
    itemsPerPage,
    selectedCategory,
    purposeSort,
    debouncedSearchKeyword,
    purposeTypeFilter,
  ]);

  useEffect(() => {
    fetchSpdTables();
  }, [fetchSpdTables]);

  // Reset page and clear search when switching tabs
  useEffect(() => {
    setCurrentPage(0);
    setSearchKeyword(''); // Clear search keyword when switching tabs
    setPurposeTypeFilter('All'); // Reset type filter when switching tabs
  }, [activeTab]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  // Reset page when sort parameters change
  useEffect(() => {
    setCurrentPage(0);
  }, [purposeSort.jackpot, purposeSort.winRate]);

  // Reset page when debounced search keyword changes
  useEffect(() => {
    if (activeTab === 'Play with Purpose') {
      setCurrentPage(0);
    }
  }, [debouncedSearchKeyword, activeTab]);

  // Reset page when purpose type filter changes
  useEffect(() => {
    if (activeTab === 'Play with Purpose') {
      setCurrentPage(0);
    }
  }, [purposeTypeFilter, activeTab]);

  // Load all required pool sizes for sorting
  useEffect(() => {
    const loadAllPoolSizes = async () => {
      if (!isWeb3ServiceInited) return;
      const tokenAddresses = new Set<string>();
      probabilityTables.forEach((t) => tokenAddresses.add(t.outputToken));
      spdTables.forEach((s) => {
        const t = probabilityTables.find(
          (pt) => pt.id === s.probabilityTableId
        );
        if (t) tokenAddresses.add(t.outputToken);
      });

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
  }, [isWeb3ServiceInited, probabilityTables, spdTables, chainId]);

  // Filter Quick Play tables
  const filteredQuickPlayTables = useMemo(() => {
    return probabilityTables.filter((table) => {
      // Pool token filter
      if (quickPlayPoolFilter !== 'All') {
        try {
          const token = Token.getTokenByAddress(table.outputToken);
          if (token.name.toUpperCase() !== quickPlayPoolFilter) {
            return false;
          }
        } catch (error) {
          return false;
        }
      }

      // Search keyword filter (if needed)
      if (searchKeyword) {
        return table.name.toLowerCase().includes(searchKeyword.toLowerCase());
      }

      return true;
    });
  }, [probabilityTables, quickPlayPoolFilter, searchKeyword]);

  // Sort Quick Play tables (support combining two sort keys)
  const sortedQuickPlayTables = useMemo(() => {
    const arr = [...filteredQuickPlayTables];
    const getMetric = (table: ProbabilityTable, key: SortKey) => {
      let tokenPrice = 0;
      try {
        const token = Token.getTokenByAddress(table.outputToken);
        tokenPrice = priceMap[token.name] ?? 0;
      } catch (e) {
        tokenPrice = 0;
      }
      const poolSize = poolSizeMap[table.outputToken] ?? 0;
      return key === 'jackpot'
        ? getJackpot(table, Number(poolSize), tokenPrice)
        : getWinRate(table, Number(poolSize), tokenPrice);
    };
    return arr.sort((a, b) => {
      const keys: SortKey[] = quickSort.lastKey
        ? [
            quickSort.lastKey,
            quickSort.lastKey === 'jackpot' ? 'winRate' : 'jackpot',
          ]
        : ['jackpot', 'winRate'];
      for (const key of keys) {
        const order = quickSort[key];
        if (!order) continue;
        const va = getMetric(a, key);
        const vb = getMetric(b, key);
        if (va === vb) continue;
        return order === 'asc' ? va - vb : vb - va;
      }
      return 0;
    });
  }, [filteredQuickPlayTables, quickSort, poolSizeMap, priceMap]);

  // Get current page data for SPD tables
  const getCurrentSpdPageData = () => {
    // Data is already sorted and filtered by the backend (including search)
    // Just apply client-side filters that can't be done on the server
    return spdTables.filter((spdTable) => {
      // Pool token filter
      if (purposePoolFilter !== 'All') {
        const probabilityTable = probabilityTables.find(
          (table) => table.id === spdTable.probabilityTableId
        );
        if (probabilityTable) {
          try {
            const token = Token.getTokenByAddress(probabilityTable.outputToken);
            if (token.name.toUpperCase() !== purposePoolFilter) {
              return false;
            }
          } catch (error) {
            return false;
          }
        } else {
          return false;
        }
      }

      // Search is now handled by the backend, no need for client-side filtering
      return true;
    });
  };

  // Get current page data for Quick Play tables
  const getCurrentQuickPlayPageData = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedQuickPlayTables.slice(startIndex, endIndex);
  };

  if (probabilityTables.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex w-full flex-col items-center">
      <TabButtons
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[
          { key: 'Quick Play', label: 'Quick Play' },
          { key: 'Play with Purpose', label: 'Play with Purpose' },
        ]}
      />
      <div className="mt-12 flex w-full items-center justify-center space-x-4 rounded-2xl bg-[#8670fb] p-4 max-sm:mt-6 max-sm:hidden">
        <div
          className={`flex h-8 flex-1 items-center rounded-lg border border-gray-200 bg-white px-4 max-sm:h-5 ${
            activeTab === 'Play with Purpose'
              ? 'w-[542px] max-sm:w-[83px]'
              : 'w-[650px] max-sm:w-[99px]'
          } max-sm:rounded-[2px] max-sm:px-0 placeholder:max-sm:text-[10px]`}
        >
          <div className="flex w-full items-center gap-2 max-sm:gap-1">
            <i className="iconfont icon-magnifier_RandSwap text-lg text-[#202020] max-sm:ml-[6px] max-sm:text-[8px]" />

            <input
              type="text"
              placeholder="Prize Table Name"
              className="flex-1 bg-transparent text-base font-normal text-[#202020] outline-none placeholder:text-[#202020] max-sm:h-5 max-sm:text-[10px] placeholder:max-sm:text-[10px]"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        {activeTab === 'Play with Purpose' && (
          <Filter
            className="h-8 w-[92px] text-xs"
            label="Type"
            value={purposeTypeFilter}
            mode="spdMode"
            options={[
              'All',
              'Certified Organization',
              'Non-certified Organization',
              'Individual',
            ]}
            onChange={setPurposeTypeFilter}
          />
        )}
        {activeTab === 'Quick Play' && (
          <>
            <Filter
              className="h-8 w-[129px] text-xs"
              label="Pool Token"
              value={
                activeTab === 'Quick Play'
                  ? quickPlayPoolFilter
                  : purposePoolFilter
              }
              mode="spdMode"
              options={
                activeTab === 'Quick Play'
                  ? quickPlayPoolOptions
                  : purposePoolOptions
              }
              onChange={
                activeTab === 'Quick Play'
                  ? setQuickPlayPoolFilter
                  : setPurposePoolFilter
              }
            />
            <SortButton
              className="w-[100px]"
              label="Jackpot"
              SortOrder={
                activeTab === 'Quick Play'
                  ? quickSort.jackpot
                  : purposeSort.jackpot
              }
              handleSortClick={() => {
                if (activeTab === 'Quick Play') {
                  setQuickSort((prev) => {
                    const next: ModeSort = { ...prev, lastKey: 'jackpot' };
                    next.jackpot =
                      prev.jackpot === 'asc'
                        ? 'desc'
                        : prev.jackpot === 'desc'
                          ? undefined
                          : 'asc';
                    return next;
                  });
                } else {
                  setPurposeSort((prev) => {
                    const next: ModeSort = { ...prev, lastKey: 'jackpot' };
                    next.jackpot =
                      prev.jackpot === 'asc'
                        ? 'desc'
                        : prev.jackpot === 'desc'
                          ? undefined
                          : 'asc';
                    return next;
                  });
                }
              }}
            />
            <SortButton
              className="w-[141px]"
              label="Total Win Rate"
              SortOrder={
                activeTab === 'Quick Play'
                  ? quickSort.winRate
                  : purposeSort.winRate
              }
              handleSortClick={() => {
                if (activeTab === 'Quick Play') {
                  setQuickSort((prev) => {
                    const next: ModeSort = { ...prev, lastKey: 'winRate' };
                    next.winRate =
                      prev.winRate === 'asc'
                        ? 'desc'
                        : prev.winRate === 'desc'
                          ? undefined
                          : 'asc';
                    return next;
                  });
                } else {
                  setPurposeSort((prev) => {
                    const next: ModeSort = { ...prev, lastKey: 'winRate' };
                    next.winRate =
                      prev.winRate === 'asc'
                        ? 'desc'
                        : prev.winRate === 'desc'
                          ? undefined
                          : 'asc';
                    return next;
                  });
                }
              }}
            />
          </>
        )}
      </div>
      <div className="mt-12 flex w-full items-center justify-center space-x-2 rounded-2xl max-sm:mt-6 md:hidden">
        <div
          className={`flex h-8 items-center rounded-lg border border-gray-200 bg-white px-4 max-sm:h-5 ${
            activeTab === 'Play with Purpose'
              ? 'w-[542px] max-sm:w-[300px]'
              : 'w-[650px] max-sm:w-[99px]'
          } max-sm:rounded-[2px] max-sm:px-0 placeholder:max-sm:text-[10px]`}
        >
          <div className="flex w-full items-center gap-2 max-sm:gap-1">
            <i className="iconfont icon-magnifier_RandSwap text-lg text-[#202020] max-sm:ml-[6px] max-sm:text-[8px]" />

            <input
              type="text"
              placeholder="Prize Table"
              className="flex-1 bg-transparent text-base font-normal text-[#202020] outline-none placeholder:text-[#202020] max-sm:h-5 max-sm:text-[10px] placeholder:max-sm:text-[10px]"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        {activeTab === 'Quick Play' && (
          <SortButton
            className=" "
            label="Jackpot"
            SortOrder={
              activeTab === 'Quick Play'
                ? quickSort.jackpot
                : purposeSort.jackpot
            }
            handleSortClick={() => {
              if (activeTab === 'Quick Play') {
                setQuickSort((prev) => {
                  const next: ModeSort = { ...prev, lastKey: 'jackpot' };
                  next.jackpot =
                    prev.jackpot === 'asc'
                      ? 'desc'
                      : prev.jackpot === 'desc'
                        ? undefined
                        : 'asc';
                  return next;
                });
              } else {
                setPurposeSort((prev) => {
                  const next: ModeSort = { ...prev, lastKey: 'jackpot' };
                  next.jackpot =
                    prev.jackpot === 'asc'
                      ? 'desc'
                      : prev.jackpot === 'desc'
                        ? undefined
                        : 'asc';
                  return next;
                });
              }
            }}
          />
        )}
        {activeTab === 'Quick Play' && (
          <SortButton
            className=" "
            label="Total Win Rate"
            SortOrder={
              activeTab === 'Quick Play'
                ? quickSort.winRate
                : purposeSort.winRate
            }
            handleSortClick={() => {
              if (activeTab === 'Quick Play') {
                setQuickSort((prev) => {
                  const next: ModeSort = { ...prev, lastKey: 'winRate' };
                  next.winRate =
                    prev.winRate === 'asc'
                      ? 'desc'
                      : prev.winRate === 'desc'
                        ? undefined
                        : 'asc';
                  return next;
                });
              } else {
                setPurposeSort((prev) => {
                  const next: ModeSort = { ...prev, lastKey: 'winRate' };
                  next.winRate =
                    prev.winRate === 'asc'
                      ? 'desc'
                      : prev.winRate === 'desc'
                        ? undefined
                        : 'asc';
                  return next;
                });
              }
            }}
          />
        )}
        {activeTab === 'Play with Purpose' && (
          <Filter
            className="h-8 w-[44px] text-xs"
            label="Type"
            value={purposeTypeFilter}
            mode="spdMode"
            options={[
              'All',
              'Certified Organization',
              'Non-certified Organization',
              'Individual',
            ]}
            onChange={setPurposeTypeFilter}
          />
        )}
        {activeTab === 'Quick Play' && (
          <Filter
            className="h-8 w-[72px] text-[10px]"
            label="Pool Token"
            value={
              activeTab === 'Quick Play'
                ? quickPlayPoolFilter
                : purposePoolFilter
            }
            mode="spdMode"
            options={
              activeTab === 'Quick Play'
                ? quickPlayPoolOptions
                : purposePoolOptions
            }
            onChange={
              activeTab === 'Quick Play'
                ? setQuickPlayPoolFilter
                : setPurposePoolFilter
            }
          />
        )}
      </div>
      {activeTab === 'Play with Purpose' && (
        <div className="mb-4 mt-2 inline-flex w-full max-w-[1100px] flex-col items-start justify-center gap-2 rounded-2xl bg-[#8670fb] px-4 py-2 max-sm:w-80 max-sm:min-w-[350px] max-sm:px-2.5 max-sm:py-2">
          <div className="inline-flex flex-wrap items-center justify-start gap-4 max-sm:gap-2">
            {recipientCategoryOptions.map((category) => (
              <div
                key={category}
                className={`flex cursor-pointer items-center justify-center gap-5 overflow-hidden rounded-3xl px-4 py-2 outline outline-1 outline-offset-[-0.50px] outline-white max-sm:gap-2 max-sm:rounded-2xl max-sm:px-2 max-sm:py-1 ${
                  selectedCategory === category ? 'bg-white' : 'bg-violet-400'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <div
                  className={`justify-start text-xs font-normal max-sm:text-[10px] ${
                    selectedCategory === category
                      ? 'text-violet-500'
                      : 'text-white'
                  }`}
                >
                  {category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Game Cards Grid */}
      <div className="mt-4 flex flex-col items-center max-sm:mt-2">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-lg text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 max-sm:gap-1 md:grid-cols-4">
              {activeTab === 'Play with Purpose'
                ? getCurrentSpdPageData().map((spdTable, index) => (
                    <GameCard
                      key={`spd-${spdTable.id || index}`}
                      spdTable={spdTable}
                    />
                  ))
                : // Default Quick Play cards
                  getCurrentQuickPlayPageData().map((table, index) => (
                    <GameCard
                      key={`table-${table.id || index}`}
                      probabilityTable={table}
                    />
                  ))}
            </section>
            <Pagination
              total={
                activeTab === 'Play with Purpose'
                  ? spdTotal
                  : filteredQuickPlayTables.length
              }
              page={currentPage}
              onPageChange={setCurrentPage}
              pageSize={itemsPerPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DrawPlay;
