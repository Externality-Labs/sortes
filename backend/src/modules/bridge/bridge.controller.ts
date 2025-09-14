import { Controller, Get } from '@nestjs/common';
import { BridgeService } from './bridge.service';

@Controller()
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  @Get('weekly-exp-ranking')
  getCurrentWeeklyExpRanking(): Promise<{ player: string; totalExp: number }[]> {
    return this.bridgeService.getCurrentWeeklyExpRanking();
  }

  @Get('final-weekly-exp-ranking')
  getFinalWeeklyExpRanking(): Promise<{ player: string; totalExp: number }[]> {
    return this.bridgeService.getPreviousWeeklyExpRanking();
  }

  @Get('mainnet-charity-balance')
  getMainnetCharityBalance(): Promise<number> {
    return this.bridgeService.getMainnetCharityBalance();
  }
}
