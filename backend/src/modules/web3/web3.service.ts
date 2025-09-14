import { ethers } from 'ethers';
import { Injectable } from '@nestjs/common';
import { int256ToNumber } from 'src/utils/format';
import { ProviderUrl, ChainId } from 'src/utils/constant';
import * as v2Abi from 'src/utils/abi/index.neon';
import * as v3Abi from 'src/utils/abi/index.v3';
import { formatUnits } from 'ethers/lib/utils';
import Token from 'src/utils/token';
import { Block, TokenWithdrawnEvent, TokenDepositedEvent, PlayFulfilledEvent, BaseWeb3Event } from './type';

export enum XbitEvents {
  TokenDeposited = 'TokenDeposited',
  TokenWithdrawn = 'TokenWithdrawn',
  PlayRequested = 'PlayRequested',
  PlayFulfilled = 'PlayFulfilled',
}

export enum VoucherEvents {
  VoucherIssued = 'VoucherIssued',
  VoucherTransferred = 'VoucherTransferred',
  VoucherBurned = 'VoucherBurned',
}

export enum XlptEvents {
  XlptMinted = 'Minted',
  XlptBurned = 'Burned',
}
@Injectable()
export class Web3Service {
  provider: ethers.providers.JsonRpcProvider;
  contracts: { [contractName: string]: ethers.Contract };
  blockCache: { [blockNumber: number]: Block } = {};
  isV3Abi: boolean = Token.tokenMap.sortes !== undefined;

  constructor() {
    const { xbitAbi, voucherAbi, erc20Abi } = this.isV3Abi ? v3Abi : v2Abi;
    this.provider = new ethers.providers.JsonRpcProvider(ProviderUrl, ChainId);
    this.contracts = Object.values(Token.tokenMap).reduce((acc, token) => {
      acc[token.name] = new ethers.Contract(
        token.address,
        (() => {
          if (token.name === 'xbit') return xbitAbi;
          if (token.name === 'voucher') return voucherAbi;
          if (token.name === 'sortes') return v3Abi.sortesAbi;
          return erc20Abi;
        })(),
        this.provider,
      );
      return acc;
    }, {});
  }

  async getPoolSize(tokenAddress: string): Promise<number> {
    const token = Token.getTokenByAddress(tokenAddress);
    const size = await this.contracts[token.name].balanceOf(Token.tokenMap.xbit.address);
    return Number(ethers.utils.formatUnits(size, token.decimals));
  }

  async getLpSupply(lpAddress: string): Promise<number> {
    const lpToken = Token.getTokenByAddress(lpAddress);
    const supply = await this.contracts[lpToken.name].totalSupply();
    return Number(Number(formatUnits(supply, lpToken.decimals)).toFixed(4));
  }

  async getLpPrice(tokenAddress: string, lpAddress: string): Promise<number> {
    const token = Token.getTokenByAddress(tokenAddress);
    const lpSupply = await this.getLpSupply(lpAddress);
    let poolSize = await this.contracts[token.name].balanceOf(Token.tokenMap.xbit.address);
    poolSize = Number(formatUnits(poolSize, token.decimals));

    if (lpSupply === 0 && poolSize === 0) {
      return 1;
    } else {
      const price = poolSize / lpSupply;
      if (Number.isNaN(price)) {
        throw new Error('price is NaN');
      }
      return Number(price.toFixed(8));
    }
  }

  async getCharityBalance(): Promise<number> {
    const charityAddr = '0xF8056c93B4C4cc3f5d5394Ce704f69F62BE41145';
    const usdtBalance = await this.contracts.usdt.balanceOf(charityAddr);
    const usdcBalance = await this.contracts.usdc.balanceOf(charityAddr);
    return Number(ethers.utils.formatUnits(usdtBalance.add(usdcBalance), Token.tokenMap.usdt.decimals));
  }

  async getEventsHistory(eventType: XbitEvents, fromBlock: number): Promise<{ events: any[]; lastBlock: number }> {
    const lastBlock = await this.getLatestBlockNumber();
    if (!this.contracts.xbit.filters[eventType]) {
      console.log('eventType', eventType, 'not found');
      return { events: [], lastBlock };
    }
    const loadStep = 9999;
    // if lastBlock > fromBlock + loadStep, then query loadStep blocks each time and merge the results
    const events = [];
    if (lastBlock > fromBlock + loadStep) {
      for (let i = fromBlock; i <= lastBlock; i += loadStep) {
        const chunk = await this.contracts.xbit.queryFilter(
          this.contracts.xbit.filters[eventType](),
          i,
          i + loadStep - 1,
        );
        events.push(...chunk);
      }
    } else {
      const chunk = await this.contracts.xbit.queryFilter(
        this.contracts.xbit.filters[eventType](),
        fromBlock,
        lastBlock,
      );
      events.push(...chunk);
    }
    return { events, lastBlock };
  }

  async getTokenWithdrawnEvents(fromBlock: number): Promise<[TokenWithdrawnEvent[], number]> {
    const { events, lastBlock } = await this.getEventsHistory(XbitEvents.TokenWithdrawn, fromBlock);
    const tokenWithdrawnEvents = await Promise.all(
      events.map(async (event: any) => {
        const eventBase = await this.parseWeb3EventBase(event);
        const token = Token.getTokenByAddress(event.args.tokenAddress);
        return {
          ...eventBase,
          user: event.args.user.toLowerCase(),
          tokenAddress: event.args.tokenAddress,
          lpAmount: int256ToNumber(event.args.lpAmount, token.pairsToken.decimals),
          tokenAmount: int256ToNumber(event.args.tokenAmount, token.decimals),
          tokenName: token.name,
        };
      }),
    );
    return [tokenWithdrawnEvents, lastBlock];
  }

  async getTokenDepositedEvents(fromBlock: number): Promise<[TokenDepositedEvent[], number]> {
    const { events, lastBlock } = await this.getEventsHistory(XbitEvents.TokenDeposited, fromBlock);
    const tokenDepositedEvents = await Promise.all(
      events.map(async (event: any) => {
        const eventBase = await this.parseWeb3EventBase(event);
        const token = Token.getTokenByAddress(event.args.tokenAddress);
        return {
          ...eventBase,
          user: event.args.user.toLowerCase(),
          tokenAddress: event.args.tokenAddress,
          tokenAmount: int256ToNumber(event.args.tokenAmount, token.decimals),
          lpAmount: int256ToNumber(event.args.lpAmount, token.pairsToken.decimals),
          tokenName: token.name,
        };
      }),
    );
    return [tokenDepositedEvents, lastBlock];
  }

  async getPlayFulfilledEvents(fromBlock: number): Promise<[PlayFulfilledEvent[], number]> {
    const { events, lastBlock } = await this.getEventsHistory(XbitEvents.PlayFulfilled, fromBlock);
    const playFulfilledEvents = await Promise.all(
      events.map(async (event: any) => {
        const args = event.args[0];
        const eventBase = await this.parseWeb3EventBase(event);
        const inputToken = Token.getTokenByAddress(args.inputToken);
        const outputToken = Token.getTokenByAddress(args.outputToken);
        const result = {
          ...eventBase,
          fulfilled: args.fulfilled,
          playId: args.playId.toString(),
          player: args.player.toLowerCase(),
          inputToken: args.inputToken,
          inputAmount: int256ToNumber(args.inputAmount, inputToken.decimals),
          outputToken: args.outputToken,
          tableTag: args.tableTag.toNumber(),
          repeats: args.repeats.toNumber(),
          requestId: args.requestId.toString(),
          randomWord: args.randomWord.toString(),
          outcomeLevels: args.outcomeLevels.map((level: any) => level.toNumber()),
          outputTotalAmount: int256ToNumber(args.outputTotalAmount, outputToken.decimals),
          outputXexpAmount: int256ToNumber(args.outputXexpAmount, Token.tokenMap.xexp.decimals),
        };
        return result;
      }),
    );
    return [playFulfilledEvents, lastBlock];
  }

  async getLatestBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBlock(blockNumber: number): Promise<Block> {
    if (this.blockCache[blockNumber]) {
      return this.blockCache[blockNumber];
    }
    const { timestamp } = await this.provider.getBlock(blockNumber);
    const block = { blockNumber, timestamp };
    this.blockCache[blockNumber] = block;

    return block;
  }

  async parseWeb3EventBase(event: any): Promise<BaseWeb3Event> {
    const { timestamp } = await this.getBlock(event.blockNumber);

    return {
      blockNumber: event.blockNumber,
      blockTimestamp: timestamp,
      blockHash: event.blockHash,
      transactionIndex: event.transactionIndex,
      transactionHash: event.transactionHash,
    };
  }

  async verifyRecipient(recipientId: string, creator: string, recipientAddress: string): Promise<boolean> {
    const userRecipients = await this.contracts.sortes.listReceivers(creator);
    const recipient = userRecipients.find(
      (recipient) =>
        recipient.id.toString() === recipientId && recipient.receiver.toLowerCase() === recipientAddress.toLowerCase(),
    );
    return recipient !== undefined;
  }

  async verifyDonation(donationId: string, creator: string, donationAddress: string): Promise<boolean> {
    const donations = await this.contracts.sortes.listDonations(creator);
    const donation = donations.find(
      (donation) =>
        donation.id.toString() === donationId &&
        donation.initiator.toLowerCase() === creator.toLowerCase() &&
        donation.receiver.toLowerCase() === donationAddress.toLowerCase(),
    );
    return donation !== undefined;
  }
}
