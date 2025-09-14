import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Web3Module } from '../web3/web3.module';
import { Recipient, RecipientSchema } from 'src/schemas/Recipient.schema';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';
import { AuthModule } from '../auth/auth.module';
import { Donation, DonationSchema } from 'src/schemas/Donation.schema';
@Module({
  imports: [
    Web3Module,
    AuthModule,
    MongooseModule.forFeature([
      { name: Recipient.name, schema: RecipientSchema },
      { name: Donation.name, schema: DonationSchema },
    ]),
  ],
  controllers: [GovernanceController],
  providers: [GovernanceService],
})
export class GovernanceModule {}
