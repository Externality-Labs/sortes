import BlockConfirmed from '../../../assets/icons/block-confirmed.png';
import BlockPending from '../../../assets/icons/block-pending.png';

const BlockProgress: React.FC<{ confirmed: number; total: number }> = ({
  confirmed,
  total,
}) => {
  return (
    <div className="my-2 flex items-center space-x-1">
      {new Array(confirmed).fill(0).map((_, index) => (
        <img
          key={index}
          src={BlockConfirmed}
          alt="Confirmed"
          className="h-6 w-auto"
        />
      ))}
      {new Array(total - confirmed).fill(0).map((_, index) => (
        <img key={index} src={BlockPending} alt="Pending" className="h-6 w-6" />
      ))}
    </div>
  );
};

export default BlockProgress;
