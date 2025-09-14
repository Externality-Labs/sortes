import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LpPriceDocument = HydratedDocument<LpPrice>;

@Schema()
export class LpPrice {
  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  lpAddress: string;
}

export const LpPriceSchema = SchemaFactory.createForClass(LpPrice);
