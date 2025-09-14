import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PoolSizeDocument = HydratedDocument<PoolSize>;

@Schema()
export class PoolSize {
  @Prop({ required: true })
  poolSize: number;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: true })
  tokenAddress: string;
}

export const PoolSizeSchema = SchemaFactory.createForClass(PoolSize);
