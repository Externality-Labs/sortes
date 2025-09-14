import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useXexpBalance } from '../../hooks/balance';
import { formatExpBalance } from '../../utils/format';

interface ExpBtnProps {}

const ExpBtn: FunctionComponent<ExpBtnProps> = () => {
  const exp = useXexpBalance();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/token');
  };

  return (
    <div
      className="h-10 cursor-pointer rounded-lg bg-white p-[10px] font-roboto text-base font-medium leading-[19px] text-[#40DC6A] transition-colors hover:bg-gray-100"
      onClick={handleClick}
    >
      {formatExpBalance(exp.xexpBalance)} EXP
    </div>
  );
};

export default ExpBtn;
