import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseWeb3Event } from './BaseWeb3Event.schema';

export type TokenWithdrawnEventDocument = HydratedDocument<TokenWithdrawnEvent>;

@Schema({ timestamps: true })
export class TokenWithdrawnEvent extends BaseWeb3Event {
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

export const TokenWithdrawnEventSchema = SchemaFactory.createForClass(TokenWithdrawnEvent);
