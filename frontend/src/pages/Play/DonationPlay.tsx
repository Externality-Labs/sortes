import { useCallback, useEffect } from 'react';
import rewardBgWBTC from '../../assets/images/rewards/bg-wbtc.svg';
import rewardBgSatoshi from '../../assets/images/rewards/bg-satoshi.svg';
import rewardBgTaiko from '../../assets/images/rewards/bg-taiko.svg';
import rewardBgExp from '../../assets/images/rewards/bg-exp.svg';
import { CustomEvents } from '../../utils/events';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpd } from '../../hooks/probabilityTable';
import PlayCommon from './PlayCommon';

const DonationPlayPage = () => {
  const { id } = useParams();
  const spd = useSpd(id as string);
  const navigate = useNavigate();

  const resetTableId = useCallback(() => {
    navigate(`/play/spd-tables/${id}`, { replace: true });
  }, [navigate, id]);

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
    document.addEventListener(CustomEvents.ChainIdChanged, resetTableId);
    return () =>
      document.removeEventListener(CustomEvents.ChainIdChanged, resetTableId);
  }, [resetTableId]);

  if (!spd || !id) {
    return null;
  }

  return (
    <PlayCommon
      probabilityTable={spd.probabilityTable}
      spd={spd}
      isSpd={true}
    />
  );
};

export default DonationPlayPage;
