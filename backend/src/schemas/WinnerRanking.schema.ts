import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WinnerRankingDocument = HydratedDocument<WinnerRanking>;

@Schema()
export class WinnerRanking {
  @Prop({ required: true })
  blockTimestamp: number;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  luckyRatio: number;

  @Prop({ required: true, index: true })
  player: string;

  @Prop({ required: true })
  outputUsdValue: number;

  @Prop({ required: true })
  inputUsdValue: number;

  @Prop({ required: true })
  xexpAmount: number;
}

export const WinnerRankingSchema = SchemaFactory.createForClass(WinnerRanking);
