import { ReactNode, useCallback, useEffect, useState } from 'react';
import { QueryOrder } from '../../services/api/xbit';
import Pagation from './Pagation';
import { useCurrentUser } from '../../hooks/user';
import { useLocation } from 'react-router-dom';

interface TableColumnConf<T> {
  title: string | JSX.Element;
  sortable?: boolean;
  key: string;
  renderer?: (data: T, col: number) => ReactNode;
  Component?: React.FC<{ data: T; col: number }>;
}

interface TableProps<T> {
  columns: TableColumnConf<T>[];
  dataFetcher: (params: any) => Promise<{ data: T[]; total?: number }>;
  pagination?: boolean;
  initalData?: T[];
  tableWidth?: string;
  tableNullHeight?: string;
  tableItemPaddingY?: string;
  tableItemHoverBg?: string;
  isPool?: boolean;
}
export const Table: <T>(props: TableProps<T>) => ReactNode = ({
  columns,
  dataFetcher,
  pagination = true,
  initalData = [],
  tableWidth = '1200px',
  tableNullHeight = '',
  tableItemPaddingY = '',
  tableItemHoverBg = '',
  isPool = false,
}) => {
  const [data, setData] = useState(initalData);
  const [order, setOrder] = useState(QueryOrder.DESC);
  const [orderBy, setOrderBy] = useState('blockTimestamp');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const { address } = useCurrentUser();
  const location = useLocation();
  const isProfitPage = location.pathname.includes('/distributor-profit');
  const isSwapPage = location.pathname.includes('/swap-history');

  const fetchData = useCallback(async () => {
    const { data, total } = await dataFetcher({
      player: address?.toLowerCase(),
      orderBy,
      page,
      order,
    });
    setData(data);
    if (pagination && total !== undefined) {
      setTotal(total);
    }
  }, [address, dataFetcher, order, orderBy, page, pagination]);

  const handleSort = useCallback(
    (key: string) => {
      if (orderBy === key) {
        setOrder(order === QueryOrder.ASC ? QueryOrder.DESC : QueryOrder.ASC);
      } else {
        setOrderBy(key);
        setOrder(QueryOrder.ASC);
      }
    },
    [order, orderBy]
  );

  useEffect(() => {
    if (!address) return;
    fetchData();
  }, [address, fetchData]);

  return (
    <div
      style={{
        background:
          isSwapPage && data.length
            ? 'linear-gradient(90deg, #eceafe 0%, #f6eafd 50.65%, #fcebf3 100%)'
            : undefined,
      }}
      className={`${isProfitPage && 'max-sm:bg-mainV1'} ${isSwapPage} w-full overflow-hidden rounded-2xl text-left text-xs font-normal`}
    >
      <div
        className={`${isProfitPage && 'max-sm:bg-white'} overflow-x-auto rounded-2xl border border-dark1 bg-white`}
      >
        <div className="common-scroll-bar w-full overflow-x-auto rounded-2xl">
          <table className="rounded-2xl" style={{ width: tableWidth }}>
            <thead>
              <tr>
                {columns.map(({ title, key, sortable = false }, idx) => (
                  <th
                    key={idx}
                    className="border-b border-dark1 bg-bg1 p-5 font-normal text-text2"
                  >
                    <span
                      className="flex cursor-pointer items-center space-x-2"
                      onClick={() => handleSort(String(key))}
                    >
                      <span>{title}</span>
                      {sortable && (
                        <span className="flex flex-col">
                          <i
                            className={`iconfont icon-caret-up -mb-2.5 text-[10px] ${orderBy === key && order === QueryOrder.ASC ? 'text-link' : 'text-black/25'}`}
                          />
                          <i
                            className={`iconfont icon-caret-up inline-block rotate-180 text-[10px] ${orderBy === key && order === QueryOrder.DESC ? 'text-link' : 'text-black/25'}`}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((record, row) => {
                return (
                  <tr
                    key={row}
                    className={`bg-white hover:${tableItemHoverBg}`}
                  >
                    {columns.map(({ renderer, key, Component }, col) => {
                      return (
                        <td
                          key={String(key) ?? col}
                          className={`px-6 ${
                            tableItemPaddingY
                              ? ` ${tableItemPaddingY} `
                              : 'py-3'
                          }`}
                        >
                          {Component ? (
                            <Component data={record} col={col} />
                          ) : renderer ? (
                            renderer(record, col)
                          ) : (
                            String(record[key as keyof typeof record] ?? key)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {(!data || !data.length) && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className={`text-center ${
                      tableNullHeight && `h-[${tableNullHeight}]`
                    }`}
                  >
                    <i className="iconfont icon-empty-icon max-auto my-[15px] text-[70px] leading-normal text-[#E5E7EB] max-sm:-ml-[890px] md:text-[200px]" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && (
        <Pagation
          total={total}
          page={page}
          onPageChange={(page: number) => setPage(page)}
          isPool={isPool}
        />
      )}
    </div>
  );
};
