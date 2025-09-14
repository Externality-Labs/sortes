import { Link } from 'react-router-dom';
import { Table } from '../../components/Table';
import { DepositTransaction, getDepositHistory } from '../../services/api/xbit';
import {
  formatTime,
  readableAddr,
  transactionHash2Url,
} from '../../utils/format';

const DepositHistory = () => {
  return (
    <Table<DepositTransaction>
      isPool={true}
      pagination={true}
      dataFetcher={getDepositHistory}
      columns={[
        {
          title: 'Time',
          key: 'blockTimestamp',
          renderer: (data) => formatTime(data.blockTimestamp * 1000),
        },
        {
          title: 'Type',
          key: 'Deposit',
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
          key: 'jkptName',
          renderer: (data) => data.tokenName.toUpperCase(),
        },
        {
          title: 'Amount',
          key: 'amountJkpt',
          renderer: (data) => data.tokenAmount.toFixed(8),
        },
      ]}
    />
  );
};

export default DepositHistory;
