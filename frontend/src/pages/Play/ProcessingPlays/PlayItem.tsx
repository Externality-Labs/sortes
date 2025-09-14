import { useSetAtom, useAtom } from 'jotai';
import {
  PlayInfo,
  PlayStages,
  congratulationAtom,
  removePlayAtom,
  AnimationPhase,
  currentPhaseAtomsAtom,
  getPhaseAtom,
} from '../../../atoms/web3';
import BlockProgress from './BlockProgress';
import Spin from '../../../components/Spin';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimationDuration } from '../../../utils/env';
import { atom } from 'jotai';
import TrxHash from './TrxHash';
import { useDrawTrxHash } from '../../../hooks/play';

interface PlayItemProps {
  playInfo: PlayInfo;
  autoFade: boolean;
  openWindow: () => void;
}

const wordingMap = {
  [PlayStages.WaitingForTrx]: 'Waiting For Transaction',
  [PlayStages.WaitingForRecipt]: 'Waiting For Receipt',
  [PlayStages.RequestingRandomness]: 'Requesting Randomness',
  [PlayStages.WaitingForResult]: 'Waiting For Result',
  [PlayStages.Fulfilled]: 'Completed',
  [PlayStages.Failed]: 'Transaction Failed',
};
const TotalDisplayBlocks = 8;

const ItemHeight = 115;
const FadeAfterTime = 10000;

const PlayItem: React.FC<PlayItemProps> = ({
  playInfo,
  autoFade,
  openWindow,
}) => {
  const [collapsCard, setCollapsCard] = useState(false);
  const [visible, setVisible] = useState(true);
  const playItemRef = useRef<HTMLLIElement>(null);
  const removePlay = useSetAtom(removePlayAtom);
  const setCongratulation = useSetAtom(congratulationAtom);
  const playId = playInfo.transactionHash || `${playInfo.startTime}`;
  const setPhase = useSetAtom(getPhaseAtom);
  const [phaseAtoms] = useAtom(currentPhaseAtomsAtom);
  const fulfillTrxHash = useDrawTrxHash(
    playInfo.requestId,
    playInfo.startAtBlock
  );

  // 确保atom存在
  useEffect(() => {
    setPhase(playId);
  }, [playId, setPhase]);

  const [currentPhase] = useAtom(
    phaseAtoms[playId] || atom(AnimationPhase.WAITING)
  );

  const { progress, displayBlocks } = useMemo(() => {
    const calculatedProgress =
      playInfo.stage === PlayStages.Fulfilled ? 100 : (currentPhase + 1) * 25;

    const blocks =
      playInfo.stage === PlayStages.Fulfilled
        ? TotalDisplayBlocks
        : Math.round((calculatedProgress / 100) * TotalDisplayBlocks);

    return {
      progress: calculatedProgress,
      displayBlocks: blocks,
    };
  }, [currentPhase, playInfo.stage]);

  const { transactionHash, stage, rewards } = playInfo;
  const tip = wordingMap[stage];
  const isFulfilled = stage === PlayStages.Fulfilled;
  const isFailed = stage === PlayStages.Failed;

  const collapseCls = collapsCard
    ? 'animate-[collapsePlayCardOut_0.2s_ease-in] w-0'
    : 'animate-[collapsePlayCardIn_0.2s_ease-in] w-48';

  useEffect(() => {
    if (!playItemRef.current || !transactionHash) return;
    if (!autoFade) return;

    let start = 0;
    let prevTs = 0;
    let done = false;

    function fadeOut(ts: number) {
      if (start === 0) start = ts;
      const elapsed = ts - start;
      if (prevTs !== ts) {
        // 使用 DICE_ROLLING 作为最长的动画持续时间
        const progress = Math.min(elapsed / AnimationDuration.DICE_ROLLING, 1);
        const opacity = 1 - progress;
        const marginTop = Math.floor(ItemHeight * progress);

        playItemRef.current!.style.opacity = `${opacity}`;
        playItemRef.current!.style.marginTop = `${-marginTop}px`;

        if (progress === 1) {
          done = true;
          removePlay(transactionHash as string);
        }
      }

      if (!done) {
        prevTs = ts;
        requestAnimationFrame(fadeOut);
      }
    }
    setTimeout(() => requestAnimationFrame(fadeOut), FadeAfterTime);
  }, [autoFade, removePlay, transactionHash]);

  if (!visible) return null;

  return (
    <li
      onClick={() => openWindow()}
      ref={playItemRef}
      className="group relative mb-3 flex h-[104px] w-max items-center rounded-l-lg bg-[#93DC08] px-3 py-2 text-white"
    >
      <span className="cursor-pointer px-2 py-6 text-xl">
        {(() => {
          if ((isFulfilled || isFailed) && !collapsCard) {
            return (
              <span
                className="absolute -left-2.5 -top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#93DC08]"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisible(false);
                  if (transactionHash) removePlay(transactionHash);
                }}
              >
                <i className="iconfont icon-close text-[12px] font-bold text-white" />
              </span>
            );
          }
          return (
            <span
              onClick={() => setCollapsCard(!collapsCard)}
              className="absolute left-2 top-9"
            >
              {collapsCard ? '<' : '>'}
            </span>
          );
        })()}
      </span>
      <div className={'flex flex-col overflow-hidden text-left ' + collapseCls}>
        <div className="flex flex-row items-center text-base">
          {isFulfilled && (
            <span
              className="mb-1 flex-1 underline hover:cursor-pointer"
              onClick={() =>
                setCongratulation({ rewards: rewards || [], show: true })
              }
            >
              {tip}
            </span>
          )}
          {!isFulfilled && !isFailed && (
            <span className="flex-1">{`${progress.toFixed(0)} %`}</span>
          )}
          {isFailed && <span className="flex-1">Failed</span>}
          {transactionHash && !isFulfilled && (
            <TrxHash trxHash={transactionHash} />
          )}
        </div>
        {isFulfilled ? (
          <div className="flex flex-col space-y-2 font-normal">
            <div className="flex items-center space-x-2">
              <span>Draw Tx:</span>
              <TrxHash trxHash={transactionHash} />
            </div>
            <div className="flex items-center space-x-2">
              <span>Reward Tx:</span>
              <TrxHash trxHash={fulfillTrxHash} />
            </div>
          </div>
        ) : (
          <BlockProgress confirmed={displayBlocks} total={TotalDisplayBlocks} />
        )}
        {!isFulfilled && (
          <span className="flex flex-row items-center text-sm font-normal text-white/65">
            <span className="flex flex-1">{tip}</span>
            {!isFailed && <Spin className="ml-2 h-4 w-4" />}
          </span>
        )}
      </div>
    </li>
  );
};

export default PlayItem;
