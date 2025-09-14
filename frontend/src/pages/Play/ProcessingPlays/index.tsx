import { useAtomValue, useSetAtom } from 'jotai';
import {
  PlayInfo,
  PlayStages,
  getPlayListAtom,
  setPlayAtom,
  web3ServiceInitedAtom,
} from '../../../atoms/web3';
import PlayItem from './PlayItem';
import { useCallback, useEffect, useState } from 'react';
import { Web3Service } from '../../../services/web3';
import { usePlay } from '../../../hooks/play';
import AnimationWindow from './AnimationWindow';
import { isMobileWeb } from '../../../utils/env';
import { ProbabilityTable } from '../../../services/type';

const MaxListSize = 3;

interface ProcessingPlaysProps {
  probabilityTable: ProbabilityTable;
}

const ProcessingPlays: React.FC<ProcessingPlaysProps> = ({
  probabilityTable,
}) => {
  const playList = useAtomValue(getPlayListAtom);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const setPlay = useSetAtom(setPlayAtom);
  const { waitForPlayResult } = usePlay();
  const [showAnimationItem, setShowAnimationItem] = useState<string>('');
  const [triggerAnimation, setTriggerAnimation] = useState(0);

  const length = playList.length;

  // load unfinished plays
  const fetchRequests = useCallback(async () => {
    if (isWeb3ServiceInited) {
      const validPlays = await Web3Service.service.getValidPlays();
      const currentBlock = await Web3Service.service.getCurrentBlockNumber();
      const playInfos: PlayInfo[] = validPlays.map((play) => ({
        playId: play.id,
        requestId: play.status.requestId,
        startTime: Date.now(),
        stage: PlayStages.WaitingForResult,
        startAtBlock: currentBlock,
        transactionHash: play.status.transactionHash,
      }));

      setPlay(playInfos);
      playInfos.forEach((playInfo) => {
        waitForPlayResult(playInfo, probabilityTable);
      });
    }
  }, [isWeb3ServiceInited, setPlay, probabilityTable, waitForPlayResult]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  // console.log('playList', playList);

  return (
    <>
      <ul className="fixed right-0 top-[180px] z-10 flex flex-col items-end">
        {playList.map((playInfo, index) => {
          const playId =
            playInfo.transactionHash || `${playInfo.startTime}-${index}`;
          return (
            <PlayItem
              openWindow={() => {
                if (
                  playInfo.stage !== PlayStages.Fulfilled &&
                  playInfo.stage !== PlayStages.Failed
                ) {
                  setShowAnimationItem(playId);
                  setTriggerAnimation((prev) => prev + 1);
                }
              }}
              key={`play-item-${playId}`}
              playInfo={playInfo}
              autoFade={
                length > MaxListSize &&
                index === 0 &&
                playInfo.stage === PlayStages.Fulfilled
              }
            />
          );
        })}
      </ul>
      <ul className="absolute left-1/2 top-[100px] flex items-center justify-center">
        {!isMobileWeb &&
          playList.map((playInfo, index) => {
            const playId =
              playInfo.transactionHash || `${playInfo.startTime}-${index}`;
            return (
              <AnimationWindow
                key={`animation-${playId}`}
                playInfo={playInfo}
                showAnimationItem={showAnimationItem}
                playId={playId}
                triggerAnimation={triggerAnimation}
              />
            );
          })}
      </ul>
    </>
  );
};

export default ProcessingPlays;
