import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecipientDocument = HydratedDocument<Recipient>;

export enum RecipientType {
  Organization = 'Organization',
  Individual = 'Individual',
}

export enum RecipientCategory {
  Disaster = 'Disaster',
  Poverty = 'Poverty',
  Health = 'Health',
  Education = 'Education',
  Society = 'Society',
  Justice = 'Justice',
  Animals = 'Animals',
  Nature = 'Nature',
  Tech = 'Tech',
  Other = 'Other',
}

@Schema()
export class Recipient {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  donationAddress: string;

  @Prop({ required: true, index: true })
  creator: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, enum: RecipientType, default: RecipientType.Individual })
  type: RecipientType;

  @Prop({ required: false, enum: RecipientCategory, default: RecipientCategory.Other })
  category: RecipientCategory;

  @Prop({ required: false, default: false })
  verified: boolean;

  @Prop()
  website: string;

  @Prop()
  twitter: string;

  @Prop()
  introduction: string;
}

export const RecipientSchema = SchemaFactory.createForClass(Recipient);
