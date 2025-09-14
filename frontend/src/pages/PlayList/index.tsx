import { useCallback, useEffect } from 'react';
import rewardBgWBTC from '../../assets/images/rewards/bg-wbtc.svg';
import rewardBgSatoshi from '../../assets/images/rewards/bg-satoshi.svg';
import rewardBgTaiko from '../../assets/images/rewards/bg-taiko.svg';
import rewardBgExp from '../../assets/images/rewards/bg-exp.svg';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from '../../utils/events';
import Ranking from '../Play/Ranking';
import DrawPlay from '../Play/DrawPlay';
// import { BetTransactionTable } from '../../components/Table/TransactionTable';

const PlayListPage = () => {
  const navigate = useNavigate();

  const resetSwapId = useCallback(() => {
    navigate('/play', { replace: true });
  }, [navigate]);

  // preload images
  useEffect(() => {
    const imgs = [rewardBgExp, rewardBgSatoshi, rewardBgTaiko, rewardBgWBTC];
    Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            const image = new Image();
            image.src = img;
            image.onload = resolve;
            image.onerror = resolve;
          })
      )
    );
  }, []);

  useEffect(() => {
    document.addEventListener(CustomEvents.ChainIdChanged, resetSwapId);
    return () =>
      document.removeEventListener(CustomEvents.ChainIdChanged, resetSwapId);
  }, [resetSwapId]);

  return (
    <div className="min-h-[calc(100svh-300px)] bg-mainV1 pb-16 pt-10 text-center max-sm:px-4 max-sm:pb-5 max-sm:pt-0">
      <div className="mx-auto flex w-[1100px] flex-col max-sm:w-full">
        <div className="mb-20 mt-5 max-sm:mb-[18px]">
          <DrawPlay />
        </div>
        <Ranking />
      </div>
    </div>
  );
};

export default PlayListPage;
