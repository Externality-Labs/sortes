// support for spd and probability table

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpdController } from './spd.controller';
import { SpdService } from './spd.service';
import { Spd, SpdSchema } from 'src/schemas/Spd.schema';
import { ProbabilityTable, ProbabilityTableSchema } from 'src/schemas/ProbabilityTable.schema';
import { Donation, DonationSchema } from 'src/schemas/Donation.schema';
import { ProbabilityTableInitService } from './probability-table-init.service';
import { AuthModule } from '../auth/auth.module';
import { ProbabilityTableController } from './probabilityTable.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Spd.name, schema: SpdSchema },
      { name: ProbabilityTable.name, schema: ProbabilityTableSchema },
      { name: Donation.name, schema: DonationSchema },
    ]),
  ],
  controllers: [SpdController, ProbabilityTableController],
  providers: [SpdService, ProbabilityTableInitService],
})
export class SpdModule {}
