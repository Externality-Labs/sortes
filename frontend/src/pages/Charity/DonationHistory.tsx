import { Link } from 'react-router-dom';
import { Table } from '../../components/Table';

import { formatTime, readableAddr } from '../../utils/format';
import { DepositTransaction, donationHistoryData } from './donationHistoryData';

const DonationHistory = () => {
  return (
    // todo 待添加后端api
    <Table<DepositTransaction>
      tableWidth="1098px"
      pagination={true}
      dataFetcher={() =>
        Promise.resolve({
          data: donationHistoryData,
        })
      }
      columns={[
        {
          title: 'Time',
          key: 'blockTimestamp',
          renderer: (data) => (
            <span className="text-black">
              {formatTime(data.blockTimestamp * 1000)}
            </span>
          ),
        },
        {
          title: 'Amount (USD)',
          key: 'amount',
          renderer: (data) => (
            <span className="text-black">{data.amount.toFixed(2)}</span>
          ),
        },
        {
          title: 'Transaction Hash',
          key: 'transactionHash',
          renderer: (data) => (
            <Link
              to={`https://etherscan.io/tx/${data.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              {readableAddr(data.transactionHash, 8)}
            </Link>
          ),
        },
        {
          title: 'Donation Recipients',
          key: 'recipient',
          renderer: (data) => (
            <Link
              className="text-link hover:underline"
              to={data.link}
              target="_blank"
              rel="noreferrer"
            >
              {data.recipient}
            </Link>
          ),
        },
        {
          title: 'Donation Proof',
          key: 'proof',
          renderer: (data) => (
            <a
              href={data.proof}
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              Donation Proof
            </a>
          ),
        },
      ]}
    />
  );
};

export default DonationHistory;
