import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Web3Service } from '../web3/web3.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PoolSize } from 'src/schemas/PoolSize.schema';
import { LpPrice } from 'src/schemas/LpPrice.schema';
import { WinnerRanking } from 'src/schemas/WinnerRanking.schema';
import { QueryOrder } from './filter.dto';
import axios from 'axios';
import { TokenDepositedEvent } from 'src/schemas/events/TokenDepositedEvent.schema';
import { TokenWithdrawnEvent } from 'src/schemas/events/TokenWithdrawnEvent.schema';
import { BaseWeb3Event } from 'src/schemas/events/BaseWeb3Event.schema';
import { PlayFulfilledEvent } from 'src/schemas/events/PlayFulfilledEvent.schema';
import Token from 'src/utils/token';
import TelegramBot from 'node-telegram-bot-api';
import { chainInfoMap, currentChainName } from 'src/utils/constant';
import { QueryCursor } from 'src/schemas/events/QueryCursor.schema';
const PageSize = 10;
export type PagedResult<T> = Promise<{
  data: T[];
  total: number;
}>;

@Injectable()
export class XbitService {
  winnerRankingCache: WinnerRanking[];
  luckyRankingCache: WinnerRanking[];
  expRankingCache: WinnerRanking[];
  winnerBroadcastCache: PlayFulfilledEvent[];
  recoardEventsLock = false;
  bot: TelegramBot;
  jkptPriceMap = chainInfoMap[currentChainName].jkpts || {};
  charityBalance: number;

  constructor(
    private readonly web3Service: Web3Service,
    @InjectModel(PoolSize.name) private poolSizeModel: Model<PoolSize>,
    @InjectModel(LpPrice.name) private lpPriceModel: Model<LpPrice>,
    @InjectModel(TokenDepositedEvent.name) private tokenDepositedEventModel: Model<TokenDepositedEvent>,
    @InjectModel(TokenWithdrawnEvent.name) private tokenWithdrawnEventModel: Model<TokenWithdrawnEvent>,
    @InjectModel(WinnerRanking.name) private winnerRankingModel: Model<WinnerRanking>,
    @InjectModel(PlayFulfilledEvent.name) private playFulfilledEventModel: Model<PlayFulfilledEvent>,
    @InjectModel(QueryCursor.name) private queryCursorModel: Model<QueryCursor>,
  ) {
    this.winnerRankingCache = [];
    this.winnerBroadcastCache = [];
    this.luckyRankingCache = [];
    this.expRankingCache = [];
    this.charityBalance = 0;
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
      this.updateJkptPrice();
    }
    this.updateCharityBalance();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async recordPoolSize(): Promise<void> {
    for (const tokenAddress of Object.keys(this.jkptPriceMap)) {
      const poolSize = await this.web3Service.getPoolSize(tokenAddress);
      if (poolSize === 0 || !poolSize) continue;
      const record = new this.poolSizeModel({
        tokenAddress,
        poolSize,
        time: new Date(),
      });
      record.save();
    }
  }
  @Cron(CronExpression.EVERY_HOUR)
  async recordPrice(): Promise<void> {
    for (const tokenAddress of Object.keys(this.jkptPriceMap)) {
      const token = Token.getTokenByAddress(tokenAddress);
      const lpToken = token.getPairToken();
      if (!lpToken) continue;
      const price = await this.web3Service.getLpPrice(tokenAddress, lpToken.address);
      const record = new this.lpPriceModel({
        price,
        tokenAddress: token.address,
        lpAddress: lpToken.address,
        time: new Date(),
      });
      record.save();
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateJkptPrice(): Promise<void> {
    for (const address of Object.keys(this.jkptPriceMap)) {
      let jkpt = 'BTC';
      switch (address) {
        case Token.tokenMap.wbtc.address:
          jkpt = 'BTC';
          break;
        case Token.tokenMap.weth.address:
          jkpt = 'ETH';
          break;
        case Token.tokenMap.wbnb.address:
          jkpt = 'BNB';
          break;
      }
      try {
        const res = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${jkpt}&tsyms=USD`);
        this.jkptPriceMap[address] = res.data.USD;
      } catch (e) {
        console.error(e);
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateCharityBalance(): Promise<void> {
    try {
      const balance = await this.web3Service.getCharityBalance();
      this.charityBalance = balance;
    } catch (e) {
      console.error(e);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async recordEvents(): Promise<void> {
    if (this.recoardEventsLock) return;
    this.recoardEventsLock = true;

    try {
      const { depositIdx, withdrawIdx, playFulfilledIdx } = await this.loadQueryCursor();

      const [
        [depositEvents, depositLastBlock],
        [withdrawEvents, withdrawLastBlock],
        [playFulfilledEvents, playFulfilledLastBlock],
      ] = await Promise.all([
        this.web3Service.getTokenDepositedEvents(depositIdx + 1),
        this.web3Service.getTokenWithdrawnEvents(withdrawIdx + 1),
        this.web3Service.getPlayFulfilledEvents(playFulfilledIdx + 1),
      ]);

      playFulfilledEvents.forEach((evt) => {
        const jkptPrice = this.jkptPriceMap[evt.outputToken];
        if (jkptPrice) return;
        const draw = evt.inputAmount * evt.repeats;
        const win = evt.outputTotalAmount * jkptPrice;
        const roi = ((win - draw) / draw) * 100;
        if (roi < 5) return;
        const msg = `🎉 Congratulations to a lucky winner who turned $${draw.toFixed(0)} into $${win.toFixed(
          2,
        )} with an ROI of ${roi.toFixed(2)}%!
🚀 Even $1 can pave your way to becoming a whale in Sortes!
🎯 Each play will donate to a [Charity Fund](https://app.sortes.fun/charity) that will be governed by EXP owners`;
        this.pushMsgToTelegramBot(msg);
      });

      await Promise.all([
        this.tokenDepositedEventModel.insertMany(depositEvents.map((evt) => new this.tokenDepositedEventModel(evt))),
        this.tokenWithdrawnEventModel.insertMany(withdrawEvents.map((evt) => new this.tokenWithdrawnEventModel(evt))),
        this.playFulfilledEventModel.insertMany(
          playFulfilledEvents.map((evt) => new this.playFulfilledEventModel(evt)),
        ),
        this.updateQueryCursor({
          depositIdx: depositLastBlock,
          withdrawIdx: withdrawLastBlock,
          playFulfilledIdx: playFulfilledLastBlock,
        }),
      ]);

      // calculate winner ranking
      const winnerMap: { [key in string]: WinnerRanking } = playFulfilledEvents.reduce((map, evt) => {
        const {
          outputToken,
          inputAmount,
          repeats,
          inputToken,
          outputTotalAmount,
          outputXexpAmount,
          blockNumber,
          blockTimestamp,
          player,
        } = evt;
        if (![Token.tokenMap.usdc.address, Token.tokenMap.usdt.address].includes(inputToken)) {
          // TODO: support more input token
          throw new Error(`Invalid input token: ${inputToken}`);
        }
        const outputUsdValue = outputTotalAmount * this.jkptPriceMap[outputToken];
        const inputUsdValue = inputAmount * this.jkptPriceMap[inputToken] * repeats;

        if (!map[player]) {
          map[player] = {
            blockNumber,
            blockTimestamp,
            player,
            outputUsdValue,
            inputUsdValue,
            xexpAmount: outputXexpAmount,
            luckyRatio: outputUsdValue / inputUsdValue,
          };
        } else {
          map[player].blockNumber = Math.max(map[player].blockNumber, blockNumber);
          map[player].blockTimestamp = Math.max(map[player].blockTimestamp, blockTimestamp);
          map[player].outputUsdValue += outputUsdValue;
          map[player].inputUsdValue += inputUsdValue;
          map[player].xexpAmount += outputXexpAmount;
          map[player].luckyRatio = map[player].outputUsdValue / map[player].inputUsdValue;
        }
        return map;
      }, {});

      for await (const winner of Object.values(winnerMap)) {
        const { player } = winner;
        const oldWinner = await this.winnerRankingModel.findOne({ player });
        if (!oldWinner) {
          const record = new this.winnerRankingModel(winner);
          await record.save();
        } else {
          await this.winnerRankingModel.findOneAndUpdate(
            { player },
            {
              blockNumber: Math.max(oldWinner.blockNumber, winner.blockNumber),
              blockTimestamp: Math.max(oldWinner.blockTimestamp, winner.blockTimestamp),
              outputUsdValue: oldWinner.outputUsdValue + winner.outputUsdValue,
              inputUsdValue: oldWinner.inputUsdValue + winner.inputUsdValue,
              xexpAmount: oldWinner.xexpAmount + winner.xexpAmount,
              luckyRatio:
                (oldWinner.outputUsdValue + winner.outputUsdValue) / (oldWinner.inputUsdValue + winner.inputUsdValue),
            },
            { upsert: true },
          );
        }
      }

      // update caches
      await Promise.all([
        this.flushWinnerRankingCache(),
        this.flushExpRankingCache(),
        this.flushWinnerBroadcastCache(),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      this.recoardEventsLock = false;
    }
  }

  async loadQueryCursor(): Promise<{
    depositIdx: number;
    withdrawIdx: number;
    playFulfilledIdx: number;
  }> {
    const lastBlock = await this.web3Service.getLatestBlockNumber();
    const [depositIdx, withdrawIdx, playFulfilledIdx] = await Promise.all(
      [this.tokenDepositedEventModel, this.tokenWithdrawnEventModel, this.playFulfilledEventModel].map((model) =>
        this.queryLatestSavedBlockNumber(model),
      ),
    );

    const minStartBlock = lastBlock - chainInfoMap[currentChainName].blocksCount30Days;
    const result = {
      depositIdx: Math.max(depositIdx || lastBlock, minStartBlock),
      withdrawIdx: Math.max(withdrawIdx || lastBlock, minStartBlock),
      playFulfilledIdx: Math.max(playFulfilledIdx || lastBlock, minStartBlock),
    };

    const cursor = await this.queryCursorModel.findOne({ _id: 'queryCursor' });

    if (!cursor) {
      await this.queryCursorModel.create({ _id: 'queryCursor', ...result });
      return result;
    } else {
      result.depositIdx = Math.max(result.depositIdx, cursor.depositIdx);
      result.withdrawIdx = Math.max(result.withdrawIdx, cursor.withdrawIdx);
      result.playFulfilledIdx = Math.max(result.playFulfilledIdx, cursor.playFulfilledIdx);
    }

    return result;
  }

  async updateQueryCursor(
    newCursor: Partial<{
      depositIdx: number;
      withdrawIdx: number;
      playFulfilledIdx: number;
    }>,
  ): Promise<void> {
    // update cursor, using the Math.max of each field of oldCursor and newCursor
    const oldCursor = await this.queryCursorModel.findOne({ _id: 'queryCursor' });

    await this.queryCursorModel.updateOne(
      { _id: 'queryCursor' },
      {
        $set: {
          depositIdx: Math.max(oldCursor?.depositIdx || -1, newCursor.depositIdx || -1),
          withdrawIdx: Math.max(oldCursor?.withdrawIdx || -1, newCursor.withdrawIdx || -1),
          playFulfilledIdx: Math.max(oldCursor?.playFulfilledIdx || -1, newCursor.playFulfilledIdx || -1),
        },
      },
    );
  }

  async flushWinnerRankingCache(): Promise<void> {
    this.winnerRankingCache = await this.winnerRankingModel
      .find()
      .sort({
        outputUsdValue: -1,
      })
      .limit(10);
  }

  async flushExpRankingCache(): Promise<void> {
    this.expRankingCache = await this.winnerRankingModel
      .find()
      .sort({
        xexpAmount: -1,
      })
      .limit(10);
  }

  async getCharityBalance(): Promise<number> {
    return this.charityBalance;
  }

  async flushWinnerBroadcastCache(): Promise<void> {
    this.winnerBroadcastCache = await this.playFulfilledEventModel
      .find({
        outputTotalAmount: { $gt: 0 },
      })
      .sort({
        blockNumber: -1,
      })
      .limit(10);
  }

  async flushLucyRankingCache(): Promise<void> {
    // DATA FIXING
    // const rankings = await this.winnerRankingModel.find().exec();
    // const bulkOps = rankings.map((ranking) => ({
    //   updateOne: {
    //     filter: { _id: ranking._id },
    //     update: {
    //       luckyRatio: (ranking.prizeAmount * this.jkptPrice) / ranking.usdBet,
    //     },
    //   },
    // }));
    // await this.winnerRankingModel.bulkWrite(bulkOps);

    this.luckyRankingCache = await this.winnerRankingModel
      .find()
      .sort({
        luckyRatio: -1,
      })
      .limit(10);
  }

  async getLuckyRanking(): Promise<WinnerRanking[]> {
    if (!this.luckyRankingCache.length) {
      await this.flushLucyRankingCache();
    }
    return this.luckyRankingCache;
  }

  async getWinnerRanking(): Promise<WinnerRanking[]> {
    if (!this.winnerRankingCache.length) {
      await this.flushWinnerRankingCache();
    }
    return this.winnerRankingCache;
  }

  async getExpRanking(): Promise<WinnerRanking[]> {
    if (!this.expRankingCache.length) {
      await this.flushExpRankingCache();
    }
    return this.expRankingCache;
  }

  async getRecentWinners(): Promise<PlayFulfilledEvent[]> {
    if (!this.winnerBroadcastCache.length) {
      await this.flushWinnerBroadcastCache();
    }
    return this.winnerBroadcastCache;
  }

  // query PoolSizes whose time is equal or greater than startTs while less than endTs
  async queryPoolSize(tokenAddress: string, startTs: number, endTs?: number): Promise<PoolSize[]> {
    // append latest poolSize if endTs is not provided
    if (!endTs) {
      const [latestPoolSize, storedPoolSize] = await Promise.all([
        this.web3Service.getPoolSize(tokenAddress),
        this.poolSizeModel.find({
          tokenAddress,
          time: { $gte: startTs, $lt: Date.now() },
        }),
      ]);
      return [...storedPoolSize, { poolSize: latestPoolSize, time: new Date(), tokenAddress }];
    } else {
      return await this.poolSizeModel.find({
        tokenAddress,
        time: { $gte: startTs, $lt: endTs },
      });
    }
  }

  async queryPrice(tokenAddress: string, lpAddress: string, startTs: number, endTs?: number): Promise<LpPrice[]> {
    // append latest price if endTs is not provided
    if (!endTs) {
      endTs = Date.now();
      const [latestPrice, storedPrice] = await Promise.all([
        this.web3Service.getLpPrice(tokenAddress, lpAddress),
        this.lpPriceModel.find({
          tokenAddress: tokenAddress,
          lpAddress: lpAddress,
          time: { $gte: startTs, $lt: endTs },
        }),
      ]);
      return [
        ...storedPrice,
        {
          price: latestPrice,
          time: new Date(),
          lpAddress: lpAddress,
          tokenAddress: tokenAddress,
        },
      ];
    } else {
      return await this.lpPriceModel.find({
        tokenAddress: tokenAddress,
        lpAddress: lpAddress,
        time: { $gte: startTs, $lt: endTs },
      });
    }
  }

  async queryLatestSavedBlockNumber(model: Model<BaseWeb3Event>): Promise<number> {
    const [latest] = await model
      .find()
      .sort({
        blockNumber: -1,
      })
      .limit(1);
    const result = latest ? latest.blockNumber : -1;
    return result;
  }

  async queryPlayFulfilledEvents(
    player: string,
    page: number,
    order: QueryOrder,
    orderBy: string,
  ): PagedResult<PlayFulfilledEvent> {
    const [data, total] = await Promise.all([
      this.playFulfilledEventModel
        .find({
          player,
        })
        .skip(PageSize * page)
        .sort({ [orderBy]: order === QueryOrder.ASC ? 1 : -1 })
        .limit(PageSize),
      this.playFulfilledEventModel.countDocuments({ player }),
    ]);
    return { data, total };
  }

  async queryTokenDepositedEvents(
    user: string,
    page: number,
    order: QueryOrder,
    orderBy: string,
  ): PagedResult<TokenDepositedEvent> {
    const [data, total] = await Promise.all([
      this.tokenDepositedEventModel
        .find({
          user,
        })
        .skip(PageSize * page)
        .sort({ [orderBy]: order === QueryOrder.ASC ? 1 : -1 })
        .limit(PageSize),
      this.tokenDepositedEventModel.countDocuments({ user }),
    ]);
    return { data, total };
  }

  async queryTokenWithDrawnEvents(
    user: string,
    page: number,
    order: QueryOrder,
    orderBy: string,
  ): PagedResult<TokenWithdrawnEvent> {
    const [data, total] = await Promise.all([
      this.tokenWithdrawnEventModel
        .find({
          user,
        })
        .skip(PageSize * page)
        .sort({ [orderBy]: order === QueryOrder.ASC ? 1 : -1 })
        .limit(PageSize),
      this.tokenWithdrawnEventModel.countDocuments({ user }),
    ]);
    return { data, total };
  }

  async pushMsgToTelegramBot(msg: string) {
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID) {
      return await this.bot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, msg, { parse_mode: 'Markdown' });
    }
  }
}
