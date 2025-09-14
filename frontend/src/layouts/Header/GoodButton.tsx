import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoodBalance } from '../../hooks/balance';
import { formatGoodBalance } from '../../utils/format';

interface ExpBtnProps {}

const GoodButton: FunctionComponent<ExpBtnProps> = () => {
  const { goodBalance } = useGoodBalance();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/token');
  };

  return (
    <div
      className="h-10 cursor-pointer rounded-lg bg-white p-[10px] font-roboto text-base font-medium leading-[19px] text-mainV1 transition-colors hover:bg-gray-100"
      onClick={handleClick}
    >
      {formatGoodBalance(goodBalance)} GOOD
    </div>
  );
};

export default GoodButton;
