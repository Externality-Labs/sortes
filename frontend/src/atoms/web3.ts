import { PrimitiveAtom, atom } from 'jotai';
import { Reward } from '../utils/reward';
import { BigNumber } from 'ethers';
import { chainAtom, ChainId } from './chain';

// To mark if the web3 service is inited
export const web3ServiceInitedAtom = atom(false);

// To store the rewards and display status of the congratulation popup
export const congratulationAtom = atom<{ rewards: Reward[]; show: boolean }>({
  rewards: [],
  show: false,
});
export const refreshVoucherAtom = atom(0);
export enum PlayStages {
  WaitingForTrx = 0,
  WaitingForRecipt = 1,
  RequestingRandomness = 2,
  WaitingForResult = 3,
  Fulfilled = 4,
  Failed = 5,
}

export const PlayAnimationStages = [
  'Requesting Randomness',
  'Generating Randomness',
  'Applying Randomness',
  'Completed',
];

export interface PlayInfo {
  chainId?: ChainId;
  trxPromise?: Promise<any>;
  requestId?: BigNumber;
  playId?: BigNumber;
  startTime: number;
  stage: PlayStages;
  startAtBlock: number;
  transactionHash?: string;
  rewards?: Reward[];
  randomness?: string;
  goodsAmount?: BigNumber;
}

const playListAtom = atom<PrimitiveAtom<PlayInfo>[]>([]);

export const getPlayListAtom = atom((get) =>
  get(playListAtom)
    .map((playAtom) => get(playAtom))
    .filter((play) => play.chainId === get(chainAtom))
);

export const removePlayAtom = atom(
  null,
  (get, set, transactionHash: string) => {
    const list = get(playListAtom);
    const existedPlay = list.find(
      (l) => get(l)!.transactionHash === transactionHash
    );
    if (existedPlay) {
      set(playListAtom, [
        ...get(playListAtom).filter((l) => l !== existedPlay),
      ]);
    }
  }
);

export const setPlayAtom = atom(null, (get, set, plays: PlayInfo[]) => {
  const list = get(playListAtom);
  const chainId = get(chainAtom);
  let listChanged = false;

  for (const play of plays) {
    const existedPlay = list.find(
      (l) =>
        (play.trxPromise && get(l)!.trxPromise === play.trxPromise) ||
        (play.playId && get(l)!.playId === play.playId)
    );
    if (!existedPlay) {
      play.chainId = chainId;
      list.push(atom(play));
      listChanged = true;
    } else {
      set(existedPlay, { ...play });
    }
  }

  if (listChanged)
    set(
      playListAtom,
      [...list].sort((a, b) => get(a)!.startTime - get(b)!.startTime)
    );
});

export const AnimationPhase = {
  WAITING: -1,
  DICE_ROLLING: 0,
  BALL_DROPPING: 1,
  RESULT_SETTLING: 2,
  COMPLETED: 3,
} as const;

type AnimationPhaseType = (typeof AnimationPhase)[keyof typeof AnimationPhase];

// 新增 currentPhaseAtoms 用于存储每个play的phase；与抽屉的动画状态同步
export const currentPhaseAtomsAtom = atom<{
  [key: string]: PrimitiveAtom<AnimationPhaseType>;
}>({});

export const setCurrentPhaseAtom = atom(
  null,
  (get, set, payload: { playId: string; phase: AnimationPhaseType }) => {
    const { playId, phase } = payload;
    const atoms = get(currentPhaseAtomsAtom);

    if (!atoms[playId]) {
      const newAtom = atom<AnimationPhaseType>(phase);
      set(currentPhaseAtomsAtom, {
        ...atoms,
        [playId]: newAtom,
      });
    } else {
      set(atoms[playId], phase);
    }
  }
);

// 添加一个helper atom来获取或创建phase atom
export const getPhaseAtom = atom(null, (get, set, playId: string) => {
  const atoms = get(currentPhaseAtomsAtom);
  if (!atoms[playId]) {
    const newAtom = atom<AnimationPhaseType>(AnimationPhase.WAITING);
    set(currentPhaseAtomsAtom, {
      ...atoms,
      [playId]: newAtom,
    });
    return newAtom;
  }
  return atoms[playId];
});
