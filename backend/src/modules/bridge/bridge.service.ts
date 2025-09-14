import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Contract, ethers } from 'ethers';
import { Model } from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';
import { PlayFulfilledEvent } from 'src/schemas/events/PlayFulfilledEvent.schema';
import { erc20Abi } from 'src/utils/abi/index.v3';

function getMondayMidnightUTCminus5Timestamp() {
  // 1. 获取当前时间
  const now = new Date();

  // 2. 转换为UTC-5时区的时间（减去5小时）
  const utcMinus5Time = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  // 3. 获取当前UTC-5时间是星期几
  // 注意：这里使用getUTCDay()因为我们已经在UTC-5时间上
  const dayOfWeek = utcMinus5Time.getUTCDay(); // 0=周日,1=周一,...,6=周六

  // 4. 计算距离本周一的天数差
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // 5. 计算本周一00:00 UTC-5时间
  const mondayMidnightUTCminus5 = new Date(utcMinus5Time);
  mondayMidnightUTCminus5.setUTCDate(utcMinus5Time.getUTCDate() - daysToMonday);
  mondayMidnightUTCminus5.setUTCHours(0, 0, 0, 0);

  // 6. 转换回UTC时间戳（加回5小时）
  const utcTimestamp = mondayMidnightUTCminus5.getTime() + 5 * 60 * 60 * 1000;

  return utcTimestamp;
}
function getCurrentTimeInUTCminus5(time: number) {
  // UTC-5 的偏移量（单位：分钟）
  const utcMinus5Offset = -5 * 60; // -300 分钟

  // 计算 UTC-5 时间（手动调整）
  const utcMinus5Time = new Date(time + utcMinus5Offset * 60 * 1000);

  // 格式化为 YYYY-MM-DD HH:MM:SS
  const year = utcMinus5Time.getUTCFullYear();
  const month = String(utcMinus5Time.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcMinus5Time.getUTCDate()).padStart(2, '0');
  const hours = String(utcMinus5Time.getUTCHours()).padStart(2, '0');
  const minutes = String(utcMinus5Time.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} UTC-5`;
}

@Injectable()
export class BridgeService {
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Signer;
  contracts: { [contractName: string]: ethers.Contract };
  bot: TelegramBot;

  constructor(
    @InjectModel(PlayFulfilledEvent.name, 'xbit-arbitrum')
    private readonly arbitrumPlayFulfilledEventModel: Model<PlayFulfilledEvent>,
    @InjectModel(PlayFulfilledEvent.name, 'xbit-base')
    private readonly basePlayFulfilledEventModel: Model<PlayFulfilledEvent>,
    @InjectModel(PlayFulfilledEvent.name, 'xbit-bnb')
    private readonly bnbPlayFulfilledEventModel: Model<PlayFulfilledEvent>,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/eth', 1);
    this.contracts = {
      usdt: new Contract('0xdac17f958d2ee523a2206206994597c13d831ec7', erc20Abi, this.provider),
      usdc: new Contract('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', erc20Abi, this.provider),
    };
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    }
  }
  async getPreviousWeeklyExpRanking(): Promise<{ player: string; totalExp: number }[]> {
    const endOfWeek = getMondayMidnightUTCminus5Timestamp();
    return this.getExpRanking(endOfWeek - 7 * 86400000, endOfWeek);
  }

  async getCurrentWeeklyExpRanking(): Promise<{ player: string; totalExp: number }[]> {
    const startOfWeek = getMondayMidnightUTCminus5Timestamp();
    return this.getExpRanking(startOfWeek, Date.now());
  }
  async getExpRanking(startTs: number, endTs: number): Promise<{ player: string; totalExp: number }[]> {
    const baseRanking = await this.getExpRankingOfChain(this.arbitrumPlayFulfilledEventModel, startTs, endTs);
    const arbitrumRanking = await this.getExpRankingOfChain(this.basePlayFulfilledEventModel, startTs, endTs);
    const bnbRanking = await this.getExpRankingOfChain(this.bnbPlayFulfilledEventModel, startTs, endTs);
    const expMap = {};
    [baseRanking, arbitrumRanking, bnbRanking].forEach((ranking) => {
      ranking.forEach(({ _id, totalExp }) => {
        expMap[_id] = (expMap[_id] || 0) + totalExp;
      });
    });
    return (Object.entries(expMap) as [string, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([player, totalExp]) => ({ player, totalExp }));
  }
  async getExpRankingOfChain(
    model: Model<PlayFulfilledEvent>,
    startTs: number,
    endTs: number,
  ): Promise<{ _id: string; totalExp: number }[]> {
    const expRankings = await model.aggregate([
      {
        $match: {
          blockTimestamp: {
            $gte: startTs / 1000,
            $lt: endTs / 1000,
          },
        },
      },
      {
        $group: {
          _id: '$player',
          totalExp: { $sum: '$outputXexpAmount' },
        },
      },
      {
        $sort: {
          totalExp: -1,
        },
      },
    ]);
    return expRankings;
  }

  async getMainnetCharityBalance(): Promise<number> {
    const charityAddr = '0xF8056c93B4C4cc3f5d5394Ce704f69F62BE41145';
    const usdtBalance = await this.contracts.usdt.balanceOf(charityAddr);
    const usdcBalance = await this.contracts.usdc.balanceOf(charityAddr);
    const usdtDecimal = await this.contracts.usdt.decimals();
    const sum = usdtBalance.add(usdcBalance);
    return parseFloat(ethers.utils.formatUnits(sum, usdtDecimal));
  }

  async sendRankingToTelegram(title: string, weeklyExpRanking: { player: string; totalExp: number }[]): Promise<void> {
    let msg = `
*${title}\n*
*Rank        EXP Earned        Address*\n`;
    weeklyExpRanking.forEach(({ player, totalExp }, index) => {
      const expLength = totalExp.toString().length;
      const rankLength = (index + 1).toString().length;
      const addrText = player.slice(0, 6) + '...' + player.slice(-4);
      msg += ` ${index + 1}${' '.repeat(15 - rankLength)}+ ${totalExp}${' '.repeat(
        21 - expLength,
      )}[${addrText}](https://etherscan.io/address/${player})\n`;
    });
    if (process.env.TELEGRAM_CHANNEL_ID) {
      this.bot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, msg, { parse_mode: 'Markdown' });
    }
  }

  @Cron('0 15,1 * * *')
  async sendWeeklyExpRankingToTelegram(): Promise<void> {
    const weeklyExpRanking = await this.getCurrentWeeklyExpRanking();
    const title = `Current Weekly EXP Ranking\n(From ${getCurrentTimeInUTCminus5(
      getMondayMidnightUTCminus5Timestamp(),
    )})`;

    await this.sendRankingToTelegram(title, weeklyExpRanking);
  }

  @Cron('0 15 * * 1')
  async sendPreviousWeeklyExpRankingToTelegram(): Promise<void> {
    const weeklyExpRanking = await this.getPreviousWeeklyExpRanking();
    const title = `Weekly EXP Ranking (Final)\nStart: ${getCurrentTimeInUTCminus5(
      getMondayMidnightUTCminus5Timestamp() - 7 * 86400000,
    )}\nEnd:   ${getCurrentTimeInUTCminus5(getMondayMidnightUTCminus5Timestamp())}
    `;
    await this.sendRankingToTelegram(title, weeklyExpRanking);
  }
}
