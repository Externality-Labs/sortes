import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class BaseWeb3Event {
  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  blockTimestamp: number;

  @Prop({ required: true })
  blockHash: string;

  @Prop({ required: true })
  transactionIndex: number;

  @Prop({ required: true })
  transactionHash: string;
}
