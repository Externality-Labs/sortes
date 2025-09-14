import { useState } from 'react';
import { Link } from 'react-router-dom';
import PrizeTablePopup from '../PrizeTable/Popup';
import SharePosterPopup from '../SharePoster/Popup';
import { useProbabilityTable } from '../../hooks/probabilityTable';

const PoolInfo = ({ tableId }: { tableId: string }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sharePosterVisible, setSharePosterVisible] = useState(false);
  const probabilityTable = useProbabilityTable(tableId);

  if (!probabilityTable) return null;

  const { name } = probabilityTable;

  return (
    <>
      <div className="flex items-center space-x-2">
        <span className="max-w-28 truncate text-[#3370FF]">
          <Link to={`/play/tables/${tableId}`} target="__blank">
            {name}
          </Link>
        </span>
        <span
          className="cursor-pointer rounded bg-bg1 px-1 py-0.5 text-text2"
          onClick={() => setPreviewVisible(true)}
        >
          Preview
        </span>
        <span
          className="cursor-pointer rounded bg-[#93DC08] px-1 py-0.5 text-white"
          onClick={() => setSharePosterVisible(true)}
        >
          Share
        </span>
      </div>
      {sharePosterVisible && (
        <SharePosterPopup
          visible={sharePosterVisible}
          setVisible={setSharePosterVisible}
          tableId={tableId}
          label={name}
        />
      )}
      {previewVisible && probabilityTable && (
        <PrizeTablePopup
          visible={previewVisible}
          setVisible={setPreviewVisible}
          name={name}
          probabilityTable={probabilityTable}
          isSpd={false}
        />
      )}
    </>
  );
};
export default PoolInfo;
