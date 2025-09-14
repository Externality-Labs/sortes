import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QueryCursorDocument = HydratedDocument<QueryCursor>;

@Schema({ timestamps: true })
export class QueryCursor {
  @Prop({ required: true, default: 'queryCursor' })
  _id: string;

  @Prop({ required: true, default: -1 })
  depositIdx: number;

  @Prop({ required: true, default: -1 })
  withdrawIdx: number;

  @Prop({ required: true, default: -1 })
  playFulfilledIdx: number;
}

export const QueryCursorSchema = SchemaFactory.createForClass(QueryCursor);
