import React, { useEffect, useState, useRef } from 'react';
import logoTitle from '../../../assets/svg/logo-title-new.svg';
import wave from '../../../assets/svg/lott/wave.svg';
import wave2 from '../../../assets/svg/lott/wave2.svg';

import hook from '../../../assets/svg/lott/hook.svg';
import hook2 from '../../../assets/svg/lott/hook2.svg';
import dice from '../../../assets/svg/lott/dice.svg';
import playFilePng from '../../../assets/images/play/playFile.png';
import { RandomnessIcon } from '../RandomnessIcon';
import { PlayAnimationStages, PlayInfo, PlayStages } from '../../../atoms/web3';
import { readableAddr } from '../../../utils/format';
import { AnimationDuration } from '../../../utils/env';
import { atom, useAtom, useSetAtom } from 'jotai';
import {
  AnimationPhase,
  setCurrentPhaseAtom,
  currentPhaseAtomsAtom,
  getPhaseAtom,
} from '../../../atoms/web3';

interface AnimationWindowProps {
  playInfo: PlayInfo;
  showAnimationItem: string;
  playId: string;
  triggerAnimation: number;
}

const PROGRESS_PER_PHASE = 25.0;

const AnimationWindow: React.FC<AnimationWindowProps> = ({
  playInfo,
  showAnimationItem,
  playId,
  triggerAnimation,
}) => {
  const { stage } = playInfo;
  const setPhase = useSetAtom(getPhaseAtom);
  const [phaseAtoms] = useAtom(currentPhaseAtomsAtom);

  // 确保atom存在
  useEffect(() => {
    setPhase(playId);
  }, [playId, setPhase]);

  const [currentPhase] = useAtom(
    phaseAtoms[playId] || atom(AnimationPhase.WAITING)
  );
  const setCurrentPhase = useSetAtom(setCurrentPhaseAtom);
  const [zIndex, setZIndex] = useState(1);
  const [shouldHide, setShouldHide] = useState(false);
  const mountedRef = useRef(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  // console.log('currentPhase', currentPhase, 'stage', stage);
  useEffect(() => {
    if (stage === PlayStages.WaitingForRecipt) {
      setCurrentPhase({ playId, phase: AnimationPhase.DICE_ROLLING });

      const diceRollingTimer = setTimeout(() => {
        setCurrentPhase({ playId, phase: AnimationPhase.BALL_DROPPING });

        const ballDroppingTimer = setTimeout(() => {
          setCurrentPhase({ playId, phase: AnimationPhase.RESULT_SETTLING });
        }, AnimationDuration.BALL_DROPPING);

        return () => clearTimeout(ballDroppingTimer);
      }, AnimationDuration.DICE_ROLLING);

      return () => clearTimeout(diceRollingTimer);
    } else if (stage === PlayStages.Fulfilled) {
      setCurrentPhase({ playId, phase: AnimationPhase.COMPLETED });
      const hideTimer = setTimeout(() => {
        setZIndex(-1);
      }, AnimationDuration.RESULT_DISPLAY);

      return () => clearTimeout(hideTimer);
    }
  }, [stage, playId, setCurrentPhase]);

  // useEffect(() => {
  //   if (stage === PlayStages.Fulfilled) {
  //   }
  // }, [stage]);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    if (showAnimationItem === playId) {
      setZIndex(1);
    } else {
      setZIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnimationItem, triggerAnimation]);

  const handleClose = () => {
    setZIndex(-1);
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (stage === PlayStages.Fulfilled || stage === PlayStages.Failed) {
        const hideTimer = setTimeout(() => {
          setShouldHide(true);
        }, AnimationDuration.RESULT_DISPLAY);

        return () => clearTimeout(hideTimer);
      }
    }
  }, [stage]);

  // 如果状态为失败，立即返回 null
  if (stage === PlayStages.Failed) {
    return null;
  }

  if (shouldHide) return null;

  const calculateProgress = () => {
    if (stage === PlayStages.Fulfilled) {
      return 100.0;
    }
    const progress = (currentPhase + 1) * PROGRESS_PER_PHASE;
    return Number(progress.toFixed(1));
  };

  return (
    <li
      // 适配1440x900  适配1720之上的h为1080的情况
      className="absolute -top-[8rem] left-1/2 h-[1000px] w-[700px] -translate-x-1/2 scale-[0.65] transform rounded-[32px] bg-white shadow-[4px_4px_8px_10px_rgba(0,0,0,0.20)] transition-opacity duration-300 3xl:-top-[3rem] 3xl:scale-[0.8]"
      style={{
        zIndex: zIndex,
      }}
    >
      <h1 className="absolute right-[157px] top-[200px] z-10 text-3xl font-bold text-[#5962BA]">
        VRF
      </h1>
      <i
        onClick={handleClose}
        className="iconfont icon-close-outlined absolute right-[15px] top-[15px] cursor-pointer text-4xl"
      ></i>
      {/* 付款和申请随机数环节 */}
      {(currentPhase === AnimationPhase.WAITING ||
        currentPhase === AnimationPhase.DICE_ROLLING) && (
        <div className="relative ml-[90px] mt-[132px] h-[533px] w-[615px]">
          <div className="flex items-center pt-4">
            <img
              src={logoTitle}
              alt="Sortes"
              className="mr-[3px] mt-1 h-[37px]"
            />
            <img
              className="animate-price-wave mr-5 mt-2 h-[30px]"
              src={wave}
              alt=""
              style={{
                animation: ' WaveToLeft 1s ease-out infinite',
              }}
            />
          </div>
          {/* hook */}
          <img
            className="absolute right-24 top-9 w-[320px]"
            src={hook}
            alt=""
          />
          <img
            className="absolute left-2 top-[5rem] w-[320px]"
            src={hook2}
            alt=""
          />
          {/* 色子 */}
          <img
            className="ml-[115px] mt-[54px]"
            style={{
              animation:
                currentPhase === AnimationPhase.DICE_ROLLING
                  ? 'spin 4s linear infinite'
                  : 'none',
            }}
            src={dice}
            alt=""
          />
          {/* 球 */}
          <div
            className="absolute bottom-[15px] left-[280px] flex size-10 items-center justify-center rounded-full bg-[#31BC69] text-lg text-white"
            style={{
              animation:
                currentPhase === AnimationPhase.DICE_ROLLING
                  ? 'moveCircle 9s linear forwards'
                  : 'none',
            }}
          >
            r
          </div>
          <div className="absolute right-20 mt-[48px] flex">
            <img
              className="animate-price-wave mr-5 mt-[24px] h-[30px]"
              src={wave2}
              alt=""
              style={{
                animation: ' WaveToRight 1s ease-out infinite',
              }}
            />
            <RandomnessIcon
              className="h-20 w-[150px] object-contain"
              isPlay={true}
            />
          </div>
        </div>
      )}
      {/* 随机数生成和应用随机数环节 */}
      {(currentPhase === AnimationPhase.BALL_DROPPING ||
        currentPhase === AnimationPhase.RESULT_SETTLING ||
        currentPhase === AnimationPhase.COMPLETED) && (
        <div className="relative ml-[90px] mt-[132px] h-[533px] w-[615px]">
          <div className="flex items-center pt-4">
            <img
              src={logoTitle}
              alt="Sortes"
              className="mr-[3px] mt-1 h-[37px]"
            />
            <img
              className="animate-price-wave mr-5 mt-2 h-[30px]"
              src={wave}
              alt=""
              style={{
                animation: ' WaveToLeft 1s ease-out infinite',
              }}
            />
          </div>

          {/* hook */}
          <img
            className="absolute right-24 top-9 w-[320px]"
            src={hook}
            alt=""
          />
          <img
            className="absolute left-2 top-[5rem] w-[320px]"
            src={hook2}
            alt=""
          />

          <section className="animate-none">
            <div className="relative ml-[115px] mt-[54px]">
              <section className="absolute left-10 top-20">
                <div className="flex flex-col gap-2">
                  <div className="relative ml-[62px] h-[14px] w-[135px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative ml-[62px] h-[3px] w-[100px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative ml-[62px] h-[3px] w-[100px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative ml-[62px] h-[3px] w-[60px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                </div>
                {
                  <section className="mt-3">
                    {currentPhase === AnimationPhase.BALL_DROPPING ? (
                      <div className="ml-[0px]">
                        <div className="relative mt-2 h-[14px] w-[195px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                        <div className="relative mt-2 h-[6px] w-[170px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                        <div className="relative mt-2 h-[8px] w-[130px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                        <div className="relative mt-2 h-[10px] w-[150px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                        <div className="relative mt-2 h-[4px] w-[120px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                        <div className="relative mt-2 h-[6px] w-[135px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                      </div>
                    ) : (
                      <div className="ml-2 flex w-[180px] flex-col gap-2 font-['PingFang_SC'] text-[#5962BA]">
                        <div className="flex justify-between">
                          {'0 0 1 1 1 0 0 1 1 0 0 1 0 1'
                            .split(' ')
                            .map((bit, i) => (
                              <span key={i}>{bit}</span>
                            ))}
                        </div>
                        <div className="flex justify-between">
                          {'1 1 0 1 0 0 1 1 0 0 1 0 1 0'
                            .split(' ')
                            .map((bit, i) => (
                              <span key={i}>{bit}</span>
                            ))}
                        </div>
                        <div className="flex justify-between">
                          {'0 0 0 0 0 0 0 1 0 1 0 1 1 0'
                            .split(' ')
                            .map((bit, i) => (
                              <span key={i}>{bit}</span>
                            ))}
                        </div>
                      </div>
                    )}
                  </section>
                }
                <div className="ml-[4px] mt-4 flex flex-col gap-2">
                  <div className="relative h-[14px] w-[120px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative h-[3px] w-[100px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative h-[3px] w-[100px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative h-[3px] w-[60px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                  <div className="relative h-[3px] w-[80px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"></div>
                </div>
                {/* <div className="relative ml-[5px] mt-5 h-[80px] w-[150px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent"></div> */}
                {/* <div className="relative ml-[5px] mt-5 h-[40px] w-[150px] overflow-hidden bg-[#5962BA] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent"></div> */}
              </section>
              <img className=" " src={playFilePng} alt="" />
            </div>
          </section>

          <div className="absolute right-20 mt-[48px] flex">
            <img
              className="animate-price-wave mr-5 mt-[24px] h-[30px]"
              src={wave2}
              alt=""
              style={{
                animation: ' WaveToRight 1s ease-out infinite',
              }}
            />
            <RandomnessIcon
              className="h-20 w-[150px] object-contain"
              isPlay={true}
            />
          </div>
        </div>
      )}
      <div className="mt-[110px] px-[75px]">
        <section className="flex items-center justify-between">
          <h1 className="font-['PingFang_SC'] text-2xl font-normal leading-normal text-[#5962BA]">
            Block Progress: {calculateProgress()}%
          </h1>
          {playInfo?.transactionHash && (
            <div className="rounded-lg border border-[#5962BA] bg-white px-4 py-1 text-sm font-normal text-[#5962BA]">
              {readableAddr(playInfo.transactionHash, 4)}
            </div>
          )}
        </section>
        {stage !== PlayStages.Fulfilled && (
          <>
            <section className="my-5">
              <div className="h-5 w-full rounded-full bg-[#FFDD17]">
                <div
                  className="h-full rounded-full bg-[#93DC08] transition-all duration-1000 ease-in-out"
                  style={{
                    width: `${calculateProgress()}%`,
                  }}
                ></div>
              </div>
            </section>
            <section className="flex justify-between">
              <h1 className="font-['PingFang_SC'] text-2xl font-normal leading-normal text-[#7a81c8]">
                {currentPhase >= AnimationPhase.DICE_ROLLING &&
                  PlayAnimationStages[currentPhase]}
              </h1>
            </section>
          </>
        )}
        {stage === PlayStages.Fulfilled && (
          <section className="mt-[30px] text-2xl font-normal">
            <div className="flex justify-start text-[#5962BA]">
              Randomness number:
            </div>
            <div className="whitespace-pre-wrap break-words text-left leading-[40px] text-[#5962BA]">
              {playInfo.randomness &&
                playInfo.randomness.split('').map((char, index) => (
                  <span
                    key={index}
                    className="inline-block border-b border-[#5962BA]"
                  >
                    {char}
                  </span>
                ))}
            </div>
          </section>
        )}
      </div>
    </li>
  );
};

export default AnimationWindow;
