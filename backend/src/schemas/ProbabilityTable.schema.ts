import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProbabilityTableDocument = HydratedDocument<ProbabilityTable>;

export enum ProbabilityTableRewardType {
  Pool = '0',
  Input = '1',
}

interface ProbabilityTableReward {
  type: ProbabilityTableRewardType;
  expect: number;
  reward: number;
}

@Schema()
export class ProbabilityTable {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  outputToken: string;

  @Prop({ required: true })
  rewards: ProbabilityTableReward[];
}

export const ProbabilityTableSchema = SchemaFactory.createForClass(ProbabilityTable);
