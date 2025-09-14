import { Controller, Get, Query } from '@nestjs/common';
import { PagedResult, XbitService } from './xbit.service';
import { PlayerFilterDto, QueryOrder } from './filter.dto';
import { PlayFulfilledEventDto, TokenDepositedEventDto, TokenWithdrawnEventDto, WinnerRankingDto } from './events.dto';
import { GetPoolSizeDto, GetPriceDto } from './xbit.dto';

@Controller('xbit')
export class XbitController {
  constructor(private readonly xbitService: XbitService) {}

  @Get('pool-sizes')
  async getPoolSize(
    @Query() { tokenAddress, startTs, endTs }: GetPoolSizeDto,
  ): Promise<{ poolSize: number; time: number }[]> {
    const poolSizes = await this.xbitService.queryPoolSize(tokenAddress, startTs, endTs);
    return poolSizes.map((poolSize) => ({
      poolSize: poolSize.poolSize,
      time: poolSize.time.getTime(),
    }));
  }

  @Get('prices')
  async getPrice(
    @Query()
    { tokenAddress, lpAddress, startTs, endTs }: GetPriceDto,
  ): Promise<{ price: number; time: number }[]> {
    const xbitPrices = await this.xbitService.queryPrice(tokenAddress, lpAddress, startTs, endTs);
    return xbitPrices.map((xbitPrice) => ({
      price: xbitPrice.price,
      time: xbitPrice.time.getTime(),
    }));
  }

  @Get('play-history')
  async getLotteryHistory(
    @Query() { player, page = 0, order = QueryOrder.DESC, orderBy = '_id' }: PlayerFilterDto,
  ): PagedResult<PlayFulfilledEventDto> {
    return await this.xbitService.queryPlayFulfilledEvents(player.toLowerCase(), page, order, orderBy);
  }

  @Get('deposit-history')
  async getDepositHistory(
    @Query() { player, page = 0, order = QueryOrder.DESC, orderBy = '_id' }: PlayerFilterDto,
  ): PagedResult<TokenDepositedEventDto> {
    return await this.xbitService.queryTokenDepositedEvents(player.toLowerCase(), page, order, orderBy);
  }

  @Get('withdraw-history')
  async getWithdrawHistory(
    @Query() { player, page = 0, order = QueryOrder.DESC, orderBy = '_id' }: PlayerFilterDto,
  ): PagedResult<TokenWithdrawnEventDto> {
    return await this.xbitService.queryTokenWithDrawnEvents(player.toLowerCase(), page, order, orderBy);
  }

  @Get('winner-ranking')
  async getWinnerRanking(): Promise<WinnerRankingDto[]> {
    return await this.xbitService.getWinnerRanking();
  }

  @Get('exp-ranking')
  async getExpRanking(): Promise<WinnerRankingDto[]> {
    return await this.xbitService.getExpRanking();
  }

  @Get('lucky-ranking')
  async getLuckyRanking(): Promise<WinnerRankingDto[]> {
    return await this.xbitService.getLuckyRanking();
  }

  @Get('recent-winners')
  async getRecentWinners(): Promise<PlayFulfilledEventDto[]> {
    const events = await this.xbitService.getRecentWinners();
    return events;
  }

  @Get('charity-balance')
  async getCharityBalance(): Promise<{ balance: number }> {
    const balance = await this.xbitService.getCharityBalance();
    return { balance };
  }
}
