import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseWeb3Event } from './BaseWeb3Event.schema';

export type TokenDepositedEventDocument = HydratedDocument<TokenDepositedEvent>;

@Schema({ timestamps: true })
export class TokenDepositedEvent extends BaseWeb3Event {
  @Prop({ required: true, index: true })
  user: string;

  @Prop({ required: true, index: true })
  tokenName: string;

  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  tokenAmount: number;

  @Prop({ required: true })
  lpAmount: number;
}

export const TokenDepositedEventSchema = SchemaFactory.createForClass(TokenDepositedEvent);
