import { Module } from '@nestjs/common';
import { XbitService } from './xbit.service';
import { XbitController } from './xbit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PoolSize, PoolSizeSchema } from 'src/schemas/PoolSize.schema';
import { Web3Module } from '../web3/web3.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LpPrice, LpPriceSchema } from 'src/schemas/LpPrice.schema';
import { WinnerRanking, WinnerRankingSchema } from 'src/schemas/WinnerRanking.schema';
import { TokenDepositedEvent, TokenDepositedEventSchema } from 'src/schemas/events/TokenDepositedEvent.schema';
import { TokenWithdrawnEvent, TokenWithdrawnEventSchema } from 'src/schemas/events/TokenWithdrawnEvent.schema';
import { PlayFulfilledEvent, PlayFulfilledEventSchema } from 'src/schemas/events/PlayFulfilledEvent.schema';
import { QueryCursor, QueryCursorSchema } from 'src/schemas/events/QueryCursor.schema';

@Module({
  imports: [
    Web3Module,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: PoolSize.name, schema: PoolSizeSchema },
      { name: LpPrice.name, schema: LpPriceSchema },
      { name: TokenDepositedEvent.name, schema: TokenDepositedEventSchema },
      { name: TokenWithdrawnEvent.name, schema: TokenWithdrawnEventSchema },
      { name: PlayFulfilledEvent.name, schema: PlayFulfilledEventSchema },
      { name: QueryCursor.name, schema: QueryCursorSchema },
      { name: WinnerRanking.name, schema: WinnerRankingSchema },
    ]),
  ],
  controllers: [XbitController],
  providers: [XbitService],
})
export class XbitModule {}
