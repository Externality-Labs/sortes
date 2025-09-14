import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseWeb3Event } from './BaseWeb3Event.schema';

export type PlayFulfilledEventDocument = HydratedDocument<PlayFulfilledEvent>;
@Schema({ timestamps: true })
export class PlayFulfilledEvent extends BaseWeb3Event {
  @Prop({ required: true, index: true })
  player: string;

  @Prop({ required: true })
  fulfilled: boolean;

  @Prop({ required: true })
  playId: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  inputToken: string;

  @Prop({ required: true })
  inputAmount: number;

  @Prop({ required: true })
  outputToken: string;

  @Prop({ required: true })
  repeats: number;

  @Prop({ required: true })
  tableTag: number;

  @Prop({ required: true })
  randomWord: string;

  @Prop({ required: true, type: [Number] })
  outcomeLevels: number[];

  @Prop({ required: true })
  outputTotalAmount: number;

  @Prop({ required: true })
  outputXexpAmount: number;
}

export const PlayFulfilledEventSchema = SchemaFactory.createForClass(PlayFulfilledEvent);
