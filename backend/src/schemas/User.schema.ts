import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum ReferStatus {
  Invalid = 'Invalid',
  Valid = 'Valid',
  Sent = 'Sent',
  Unknown = 'Unknown',
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  address: string;

  @Prop({ required: true, unique: true })
  referralCode: string;

  @Prop({ type: [String] })
  referLists: string[];

  @Prop()
  referredBy: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
