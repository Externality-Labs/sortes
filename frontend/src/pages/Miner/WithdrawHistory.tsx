import { Link } from 'react-router-dom';
import { Table } from '../../components/Table';
import {
  WithdrawTransaction,
  getWithdrawHistory,
} from '../../services/api/xbit';
import { currentChainInfo } from '../../utils/env';
import {
  formatTime,
  readableAddr,
  transactionHash2Url,
} from '../../utils/format';

const WithdrawHistory = () => {
  const xtoken = currentChainInfo().xTokenName;

  return (
    <Table<WithdrawTransaction>
      isPool={true}
      pagination={true}
      dataFetcher={getWithdrawHistory}
      columns={[
        {
          title: 'Time',
          key: 'blockTimestamp',
          renderer: (data) => formatTime(data.blockTimestamp * 1000),
        },
        {
          title: 'Type',
          key: 'Withdraw',
        },
        {
          title: 'Transaction Hash',
          key: 'transactionHash',
          renderer: (data) => (
            <Link
              to={transactionHash2Url(data.transactionHash)}
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              {readableAddr(data.transactionHash, 8)}
            </Link>
          ),
        },
        {
          title: 'Asset',
          key: xtoken.toUpperCase(),
        },
        {
          title: 'Amount',
          key: 'amountXbit',
          renderer: (data) => data.lpAmount.toFixed(8),
        },
      ]}
    />
  );
};

export default WithdrawHistory;
