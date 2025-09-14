import { Table } from '../../components/Table';
import { getPlayHistory, PlayHistoryItem } from '../../services/api/xbit';
import {
  formatTime,
  formatUSD,
  readableAddr,
  transactionHash2Url,
} from '../../utils/format';
import PoolInfo from '../../components/Table/PoolInfo';
import { Link } from 'react-router-dom';
import { useJkpt } from '../../hooks/pool';

const PlayHistory = () => {
  return (
    <Table<PlayHistoryItem>
      pagination={true}
      dataFetcher={getPlayHistory}
      columns={[
        {
          title: 'Time',
          key: 'blockTimestamp',
          sortable: true,
          renderer: (data) => formatTime(data.blockTimestamp * 1000),
        },
        {
          title: 'Pool',
          key: 'tableId',
          renderer: (data) => <PoolInfo tableId={data.tableTag.toString()} />,
        },
        {
          title: 'Prize',
          key: 'outputTotalAmount',
          sortable: true,
          Component: ({ data }) => {
            const amount = data.outputTotalAmount;
            const { jkptPrice } = useJkpt(data.outputToken.toString());
            if (!jkptPrice) return amount.toFixed(6);
            return `${amount.toFixed(6)} (≈ ${formatUSD(amount * jkptPrice)} )`;
          },
        },
        {
          title: 'Draw Amount(USD)',
          key: 'inputAmount',
          sortable: true,
          renderer: (data) => formatUSD(data.inputAmount * data.repeats),
        },
        {
          title: 'EXP',
          key: 'outputXexpAmount',
          sortable: true,
        },
        {
          title: 'Reward Tx',
          key: 'rewardTx',
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
      ]}
    />
  );
};

export default PlayHistory;
