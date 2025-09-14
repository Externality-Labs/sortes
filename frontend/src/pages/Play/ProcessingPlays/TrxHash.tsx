import { Link } from 'react-router-dom';
import { readableAddr, transactionHash2Url } from '../../../utils/format';

const TrxHash = ({ trxHash }: { trxHash?: string }) => {
  if (!trxHash) return null;
  const trxUrl = transactionHash2Url(trxHash);

  return (
    <span className="rounded-[4px] bg-white px-1 text-sm font-normal text-[#93DC08]">
      <Link to={trxUrl} target="_blank" rel="noreferrer">
        {readableAddr(trxHash, 4)}
      </Link>
    </span>
  );
};

export default TrxHash;
