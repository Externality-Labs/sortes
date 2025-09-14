import React, { useState, useCallback } from 'react';
import { Table } from '../../components/Table';
import { Link } from 'react-router-dom';
import { formatTime } from '../../utils/format';
import { Popup } from '../../components/Modal/Popup';
import SpdItem from './SpdItem';
import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../../atoms/web3';
import { VoucherStatus } from '../Play/DrawPanel/DrawAmountSelection/VoucherItem';
import { useProbabilityTable } from '../../hooks/probabilityTable';
import {
  DrawAmount,
  getMinTicketPrice,
  MaxDrawAmount,
} from '../Play/DrawPanel/DrawAmountSelection/constant';
import { useCurrentUser } from '../../hooks/user';
import { getMySpdTables, SpdTable } from '../../services/api/spd';
import SharePosterPopup from '../../components/SharePoster/Popup';

interface SpdTableData {
  id: string;
  tableName: string;
  tableId: string;
  proposalId: string;
  createTime: number;
  status: 'active' | 'inactive';
}

interface MySpdProps {}

const MySpd: React.FC<MySpdProps> = () => {
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<SpdTableData | null>(null);
  const [tablePopupVisible, setTablePopupVisible] = useState(false);
  const { address } = useCurrentUser();
  const [spdTablesMap, setSpdTablesMap] = useState<Record<string, SpdTable>>(
    {}
  );

  // SharePoster相关状态
  const [sharePosterVisible, setSharePosterVisible] = useState(false);
  const [sharingTable, setSharingTable] = useState<SpdTableData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Same state as index page
  const [drawAmount] = useState<number>(1);
  const [ticketPrice] = useState<number>(DrawAmount.OneUSD);
  const [voucher] = useState<VoucherStatus | null>(null);
  const probabilityTable = useProbabilityTable('1');
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);

  const valid =
    voucher !== null ||
    (!isNaN(drawAmount) &&
      drawAmount > 0 &&
      drawAmount <= MaxDrawAmount &&
      !isNaN(ticketPrice) &&
      ticketPrice >= getMinTicketPrice());

  const handleEdit = (data: SpdTableData) => {
    setEditingTable(data);
    setEditPopupVisible(true);
  };

  const handleShare = (data: SpdTableData) => {
    setSharingTable(data);
    setSharePosterVisible(true);
  };

  const handleEditComplete = () => {
    setEditPopupVisible(false);
    // 触发数据刷新
    setRefreshTrigger((prev) => prev + 1);
  };

  // Data fetcher function that matches the Table component's expected interface
  const dataFetcher = useCallback(async () => {
    if (!address) {
      return { data: [] };
    }

    try {
      const spdTables = await getMySpdTables(address);

      // Store the original SPD data for editing
      const tablesMap: Record<string, SpdTable> = {};
      spdTables.forEach((table) => {
        tablesMap[table.id] = table;
      });
      setSpdTablesMap(tablesMap);

      // Transform SpdTable to SpdTableData format
      const transformedData: SpdTableData[] = spdTables.map(
        (table: SpdTable) => ({
          id: table.id,
          tableName: table.name,
          tableId: table.probabilityTableId, // Using probabilityTableId as tableId
          proposalId: table.donationId,
          createTime: new Date(table.createdAt).getTime(),
          status: 'active' as const, // Default status, can be enhanced later
        })
      );

      return { data: transformedData };
    } catch (error) {
      console.error('Failed to fetch SPD tables:', error);
      return { data: [] };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshTrigger]); // refreshTrigger is intentionally used to trigger re-execution

  return (
    <>
      <Table<SpdTableData>
        tableWidth="1098px"
        pagination={true}
        dataFetcher={dataFetcher}
        columns={[
          {
            title: 'Go to Play',
            key: 'goToPlay',
            renderer: (data: SpdTableData) => (
              <Link
                to={`/play?table=${data.tableId}`}
                className="inline-flex items-center justify-center rounded bg-amber-500 px-2 py-0.5"
                role="button"
                aria-label={`Go to play with table ${data.tableId}`}
              >
                <span className="text-xs font-normal leading-none text-white">
                  Go to Play
                </span>
              </Link>
            ),
          },
          {
            title: 'My Table List',
            key: 'tableName',
            renderer: (data: SpdTableData) => (
              <div className="flex items-center gap-2">
                <Link
                  to={`/spd/table/${data.id}`}
                  className="text-blue-500 hover:underline"
                  aria-label={`View table: ${data.tableName}`}
                >
                  {data.tableName}
                </Link>
                <span className="text-xs text-gray-500">Preview</span>
                <button
                  className="inline-flex items-center justify-center rounded bg-lime-500 px-1 py-0.5"
                  onClick={() => handleShare(data)}
                  aria-label={`Share table: ${data.tableName}`}
                >
                  <span className="text-xs font-normal leading-none text-white">
                    Share
                  </span>
                </button>
              </div>
            ),
          },
          {
            title: 'Change Table Info',
            key: 'edit',
            renderer: (data: SpdTableData) => (
              <button
                className="inline-flex items-center justify-center rounded bg-blue-500 px-4 py-0.5"
                onClick={() => handleEdit(data)}
                aria-label={`Edit table: ${data.tableName}`}
              >
                <span className="text-xs font-normal leading-none text-white">
                  Edit
                </span>
              </button>
            ),
          },
          {
            title: (
              <button
                className="flex items-center gap-1 text-left"
                onClick={() => {
                  /* Handle sort */
                }}
                aria-label="Sort by Table ID"
              >
                <span>Table ID</span>
                <span className="text-blue-500" aria-hidden="true">
                  ⇅
                </span>
              </button>
            ),
            key: 'tableId',
            renderer: (data: SpdTableData) => (
              <span className="text-black">{data.tableId}</span>
            ),
          },
          {
            title: 'Proposal ID',
            key: 'proposalId',
            renderer: (data: SpdTableData) => (
              <span className="text-black">{data.proposalId}</span>
            ),
          },
          {
            title: (
              <button
                className="flex items-center gap-1 text-left"
                onClick={() => {
                  /* Handle sort */
                }}
                aria-label="Sort by Create Time"
              >
                <span>Create Time</span>
                <span className="text-blue-500" aria-hidden="true">
                  ⇅
                </span>
              </button>
            ),
            key: 'createTime',
            renderer: (data: SpdTableData) => (
              <span className="text-black">{formatTime(data.createTime)}</span>
            ),
          },
        ]}
      />

      <Popup visible={editPopupVisible} setVisible={setEditPopupVisible}>
        <div className="overflow-y-auto rounded-2xl bg-white px-[48px] py-6 max-sm:h-[90vh] max-sm:w-[95vw] max-sm:px-0">
          {editingTable && (
            <SpdItem
              isExpandable={false}
              expanded={true}
              isWeb3ServiceInited={isWeb3ServiceInited}
              probabilityTable={probabilityTable} // 可以先用固定的，后续可以根据editingTable.tableId获取
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
              mode="edit"
              editData={{
                id: editingTable.id,
                name: editingTable.tableName,
                proposalId: editingTable.proposalId,
                image: spdTablesMap[editingTable.id]?.image || '', // 使用真实的图片URL
              }}
              onToggle={handleEditComplete} // 使用新的处理函数
            />
          )}
        </div>
      </Popup>
      <SharePosterPopup
        visible={sharePosterVisible}
        setVisible={setSharePosterVisible}
        tableId={sharingTable?.tableId || ''}
        label={sharingTable?.tableName || ''}
      />
    </>
  );
};

export default MySpd;
