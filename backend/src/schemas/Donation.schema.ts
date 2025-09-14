import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DonationDocument = HydratedDocument<Donation>;

export enum ReceiverType {
  Organization = 'Organization',
  Individual = 'Individual',
}

@Schema()
export class Donation {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  recipientId: string;

  @Prop({ required: true, index: true })
  creator: string;

  @Prop({ required: true })
  donationAmount: number;

  @Prop({ required: true })
  purpose: string;

  @Prop({ required: true })
  proposalTxId: string;

  @Prop({ required: false })
  donationTxId: string;

  @Prop({ required: false })
  donationProof: string;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
