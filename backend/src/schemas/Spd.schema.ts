import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { setToJSON } from 'src/utils/setToJSON';

export type SpdDocument = HydratedDocument<Spd>;

@Schema({ timestamps: true })
export class Spd {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  creator: string;

  @Prop({ required: true, index: true })
  donationId: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  probabilityTableId: string;
}

export const SpdSchema = SchemaFactory.createForClass(Spd);

setToJSON(SpdSchema);
