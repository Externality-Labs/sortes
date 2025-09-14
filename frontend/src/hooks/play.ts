import { BigNumber } from 'ethers';
import { parseUnits, formatUnits } from 'ethers/lib/utils';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  PlayStages,
  setPlayAtom,
  PlayInfo,
  congratulationAtom,
  web3ServiceInitedAtom,
} from '../atoms/web3';
import { PlayCurrency, parseReward } from '../utils/reward';
import { Web3Service } from '../services/web3';
import { Event } from '@ethersproject/contracts';
import { retry, sleep } from '../utils/helper';
import { useCallback, useEffect, useState } from 'react';
import { showError } from '../utils/notify';
import { saveInvalidPlayIds } from '../services/persist';
import { chainAtom } from '../atoms/chain';
import { PlayStatus, ProbabilityTable, Relatives } from '../services/type';
import { priceAtom } from '../atoms/price';
import Token from '../utils/token';

const PlayPollingInterval = 2000;
const PlayTimeout = 10 * 60 * 1000;

interface AllowanceParams {
  transferNum: BigNumber;
  type: PlayCurrency;
  targetContractAddress: string;
}

const useAllowance = () => {
  const allowXexpToSortes = useCallback(async () => {
    const web3 = Web3Service.service;
    const { xexp } = web3.contracts!;
    const xexpAllowance = await xexp!.allowance(
      web3.address,
      web3.contracts!.sortes!.address
    );
    const needAllowance = xexpAllowance.lt(BigNumber.from(2).pow(128).sub(1));
    if (needAllowance) {
      await xexp!.approve(
        web3.contracts!.sortes!.address,
        BigNumber.from(2).pow(256).sub(1)
      );
    }
  }, []);

  const allowance = useCallback(
    async ({ transferNum, type, targetContractAddress }: AllowanceParams) => {
      const web3 = Web3Service.service;
      const { usdt, usdc } = web3.contracts!;
      if (type !== PlayCurrency.USDT && type !== PlayCurrency.USDC) {
        return;
      }
      const allowanceResult = await (type === PlayCurrency.USDT
        ? web3.usdtAllowance(targetContractAddress)
        : web3.usdcAllowance(targetContractAddress));

      const approveFunc =
        type === PlayCurrency.USDT ? usdt!.approve : usdc!.approve;

      if (allowanceResult.lt(transferNum)) {
        const decimals = Token.tokenMap['usdt'].decimals;
        const DefaultApproveAmount = parseUnits('1000', decimals);
        console.log('default approve amount', DefaultApproveAmount.toString());
        await approveFunc(
          targetContractAddress,
          transferNum.gt(DefaultApproveAmount)
            ? transferNum
            : DefaultApproveAmount
        );
      }
    },
    []
  );

  return { allowance, allowXexpToSortes };
};

interface PlayParams {
  value: string;
  repeats: string;
  table: ProbabilityTable;
  donationId?: string;
  currency?: PlayCurrency;
}

export const usePlay = () => {
  const setPlayInfo = useSetAtom(setPlayAtom);
  const [congratulation, setCongratulation] = useAtom(congratulationAtom);
  const chainId = useAtomValue(chainAtom);
  const priceMap = useAtomValue(priceAtom);
  const { allowance, allowXexpToSortes } = useAllowance();

  const handlePlayFailed = useCallback(
    (playInfo: PlayInfo, e: unknown) => {
      playInfo.stage = PlayStages.Failed;
      setPlayInfo([playInfo]);
      if (playInfo.playId) {
        saveInvalidPlayIds([playInfo.playId.toString()]);
      }

      if (e instanceof Error) showError(e.message);
      else if (typeof e === 'string') showError(e);
      else showError('Unknown error');
    },
    [setPlayInfo]
  );

  const parseStaus = useCallback(
    (playInfo: PlayInfo, table: ProbabilityTable, status: any) => {
      const web3 = Web3Service.service;
      const tokens = web3.tokens;
      const { outputToken } = table;
      const token = Token.getTokenByAddress(outputToken);

      const {
        outputTotalAmount,
        outcomeLevels,
        inputAmount,
        outputXexpAmount,
      } = status;
      console.log(status, 'status');
      const goodsAmount = playInfo.goodsAmount;
      // console.log(formatUnits(outputXexpAmount, tokens?.xexp.decimals), 'xexp');

      const rewards = parseReward({
        inputAmount: parseFloat(
          formatUnits(inputAmount, tokens?.usdt.decimals)
        ),
        outputAmount: parseFloat(
          formatUnits(outputTotalAmount, token.decimals)
        ),
        outputTokenPrice: priceMap[token.name],
        levels: outcomeLevels.map((level: BigNumber) => level?.toString()),
        table,
        outputXexpAmount: parseFloat(
          formatUnits(outputXexpAmount, tokens?.xexp.decimals)
        ),
        goodsAmount: goodsAmount
          ? parseFloat(formatUnits(goodsAmount, tokens?.good?.decimals))
          : undefined,
      });

      playInfo.stage = PlayStages.Fulfilled;
      playInfo.rewards = rewards;
      setPlayInfo([playInfo]);

      // show congratulation only if it's not shown and the chain is the same
      // prevent overwriting the previous result which user may still want to check
      // prevent showing congratulation of previous chain
      if (!congratulation.show && playInfo.chainId === chainId) {
        setTimeout(() => {
          setCongratulation({
            rewards,
            show: true,
          });
        }, 3000); // 3秒延迟
      }
    },
    [chainId, congratulation.show, priceMap, setCongratulation, setPlayInfo]
  );

  const waitForPlayResult = useCallback(
    async (playInfo: PlayInfo, table: ProbabilityTable) => {
      try {
        const web3 = Web3Service.service;
        const playId = playInfo.playId;
        const status = await Promise.race([
          (async () => {
            let status;
            while (!status || !status.fulfilled) {
              status = await retry(web3.getPlayStatusById(playId as BigNumber));
              if (status.fulfilled) return status;
              else await sleep(PlayPollingInterval);
            }
          })(),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('request timeout'));
            }, PlayTimeout);
          }),
        ]);

        playInfo.randomness = (<PlayStatus>status).randomWord.toHexString();

        parseStaus(playInfo, table, status);
      } catch (e: unknown) {
        handlePlayFailed(playInfo, e);
      }
    },
    [handlePlayFailed, parseStaus]
  );

  const handleTrxPromise = useCallback(
    async (
      trxPromise: Promise<any>,
      playInfo: PlayInfo,
      table: ProbabilityTable,
      isSpdPlay: boolean = false
    ) => {
      const web3 = Web3Service.service;
      const startBlockNumber = await web3.getCurrentBlockNumber();

      Object.assign(playInfo, {
        startTime: Date.now(),
        trxPromise: trxPromise,
        startAtBlock: startBlockNumber,
      });

      setPlayInfo([playInfo]);
      const trx = await retry(trxPromise);

      playInfo.stage = PlayStages.WaitingForRecipt;
      playInfo.transactionHash = trx.hash;
      setPlayInfo([playInfo]);
      console.log('trx', trx);
      const receipt = await trx.wait();
      console.log('receipt', receipt);

      playInfo.stage = PlayStages.RequestingRandomness;
      setPlayInfo([playInfo]);

      const events = receipt.events;
      if (isSpdPlay) {
        const statusEvent = events.filter(
          (e: Event) => e.event === 'PlayResult'
        )[0].args;
        const { playId, goodReceivedAmount } = statusEvent;

        const playStatus = await web3.getPlayStatusById(playId);

        playInfo.playId = playId;
        playInfo.requestId = playStatus.requestId;
        playInfo.goodsAmount = goodReceivedAmount;
      } else {
        const statusEvent = events.filter(
          (e: Event) => e.event === 'PlayRequested'
        )[0].args;
        const {
          status: { playId, requestId },
        } = statusEvent;

        playInfo.requestId = requestId;
        playInfo.playId = playId;
      }

      // a fake stage
      setTimeout(() => {
        if (playInfo.stage === PlayStages.RequestingRandomness) {
          playInfo.stage = PlayStages.WaitingForResult;
          setPlayInfo([playInfo]);
        }
      }, 15000);
      await waitForPlayResult(playInfo, table);
    },
    [setPlayInfo, waitForPlayResult]
  );

  const play = useCallback(
    async ({
      value,
      repeats,
      table,
      donationId,
      currency = PlayCurrency.USDT,
    }: PlayParams) => {
      const isSpdPlay = !!donationId;

      const web3 = Web3Service.service;
      const { tokens } = web3;
      const inputAmount = parseUnits(value, tokens?.usdt.decimals);
      const transferNum = inputAmount.mul(parseUnits(repeats, 0));
      const { id, outputToken, rewards } = table;
      const playInfo: PlayInfo = {
        startTime: 0,
        stage: PlayStages.WaitingForTrx,
        startAtBlock: 0,
      };

      try {
        if (isSpdPlay) {
          await allowXexpToSortes();
        }

        await allowance({
          transferNum,
          type: currency,
          targetContractAddress: isSpdPlay
            ? tokens!.charity!.address
            : tokens!.xbit.address,
        });

        const inputToken =
          currency === PlayCurrency.USDT
            ? web3.tokens!.usdt.address
            : web3.tokens!.usdc.address;

        const params = {
          inputToken,
          inputAmount: inputAmount,
          outputToken: outputToken,
          repeats: parseUnits(repeats, 0),
          table: {
            relatives: rewards.map((r) =>
              parseUnits(r.type === Relatives.Pool ? '0' : '1', 0)
            ),
            mExpectations: rewards.map((r) =>
              parseUnits(r.expect.toString(), 0)
            ),
            mRewards: rewards.map((r) => parseUnits(r.reward.toString(), 0)),
            tag: parseUnits(id.toString(), 0),
          },
        };

        const trxPromise = isSpdPlay
          ? web3.donationPlay({
              ...params,
              donationId: parseUnits(donationId, 0),
            })
          : web3.play(params);

        console.log('trxPromise', trxPromise);
        handleTrxPromise(trxPromise, playInfo, table, isSpdPlay);
      } catch (e: unknown) {
        handlePlayFailed(playInfo, e);
      }
    },
    [allowXexpToSortes, allowance, handlePlayFailed, handleTrxPromise]
  );

  const playWithVoucher = useCallback(
    async (
      voucherId: BigNumber,
      table: ProbabilityTable,
      donationId?: string
    ) => {
      const { outputToken, rewards, id } = table;
      const isSpdPlay = !!donationId;
      const playInfo: PlayInfo = {
        startTime: 0,
        stage: PlayStages.WaitingForTrx,
        startAtBlock: 0,
      };
      try {
        const web3 = Web3Service.service;
        const params = {
          voucherId: voucherId,
          outputToken,
          table: {
            relatives: rewards.map((r) =>
              parseUnits(r.type === Relatives.Pool ? '0' : '1', 0)
            ),
            mExpectations: rewards.map((r) =>
              parseUnits(r.expect.toString(), 0)
            ),
            mRewards: rewards.map((r) => parseUnits(r.reward.toString(), 0)),
            tag: parseUnits(id.toString(), 0),
          },
        };
        if (isSpdPlay) {
          await allowXexpToSortes();
        }
        const trxPromise = isSpdPlay
          ? web3.donationPlayWithVoucher({
              ...params,
              donationId: parseUnits(donationId, 0),
            })
          : web3.playWithVoucher(params);
        handleTrxPromise(trxPromise, playInfo, table, isSpdPlay);
      } catch (e: unknown) {
        handlePlayFailed(playInfo, e);
      }
    },
    [allowXexpToSortes, handlePlayFailed, handleTrxPromise]
  );

  return {
    play,
    playWithVoucher,
    waitForPlayResult,
  };
};

export const useDrawTrxHash = (requestId?: BigNumber, blockNumber?: number) => {
  const [trx, setTrx] = useState<string | undefined>(undefined);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);

  const fetchFulfillTrxHash = useCallback(
    async (requestId?: BigNumber, blockNumber?: number) => {
      if (!isWeb3ServiceInited || !requestId || !blockNumber) return;
      const web3 = Web3Service.service;
      console.log(
        'getRandomWordsFulfilledTrxHash: requestId',
        requestId.toString(),
        blockNumber
      );
      const fulfillTrxHash = await web3.getRandomWordsFulfilledTrxHash(
        requestId,
        blockNumber
      );
      console.log('fulfillTrxHash:', fulfillTrxHash);
      if (fulfillTrxHash) setTrx(fulfillTrxHash);
    },
    [isWeb3ServiceInited]
  );

  useEffect(() => {
    if (!isWeb3ServiceInited || trx !== undefined) return;
    let retryCount = 0;
    const timer = setInterval(() => {
      if (retryCount > 5 || trx !== undefined) {
        clearInterval(timer);
        return;
      }
      retryCount++;
      fetchFulfillTrxHash(requestId, blockNumber);
    }, 5000);
    return () => clearInterval(timer);
  }, [blockNumber, fetchFulfillTrxHash, isWeb3ServiceInited, requestId, trx]);

  return trx;
};
