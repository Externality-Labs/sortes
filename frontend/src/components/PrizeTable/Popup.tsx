import PrizeTable from '.';
import { ProbabilityTable } from '../../services/type';
import { Popup } from '../Modal/Popup';

interface PrizeTablePopupProps {
  name: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  probabilityTable: ProbabilityTable;
  isSpd: boolean;
}
const PrizeTablePopup: React.FC<PrizeTablePopupProps> = ({
  name,
  visible,
  setVisible,
  probabilityTable,

  isSpd,
}) => {
  return (
    <Popup visible={visible} setVisible={setVisible} clickModalClosable={false}>
      <div className="w-[310px] overflow-hidden rounded-2xl text-left sm:w-[512px]">
        <div className="relative flex max-h-[684px] w-full flex-col overflow-y-auto bg-white p-5 sm:p-10">
          <span
            onClick={() => setVisible(false)}
            className="absolute right-2.5 top-2.5 cursor-pointer"
          >
            <i className="iconfont icon-close-outlined text-2xl text-black" />
          </span>
          <span className="mb-[48px] text-xl font-bold max-sm:mb-6 max-sm:text-base">
            {name}
          </span>
          <PrizeTable probabilityTable={probabilityTable} isSpd={isSpd} />
        </div>
      </div>
    </Popup>
  );
};
export default PrizeTablePopup;
