import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { XbitModule } from './modules/xbit/xbit.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { GovernanceModule } from './modules/governance/governance.module';
import { SpdModule } from './modules/spd/spd.module';
import { UploadModule } from './modules/upload/upload.module';

dotenv.config();

const { MONGO_USER, MONGO_PWD, MONGO_PORT, MONGO_URL, NODE_ENV, RANDSWAP_NETWORK } = process.env;

console.log('NODE_ENV', NODE_ENV, RANDSWAP_NETWORK);

let mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_URL}:${MONGO_PORT}/`;
if (NODE_ENV === 'development') {
  mongoUrl += '?authSource=admin';
} else {
  mongoUrl += '?retryWrites=false';
}

console.log('mongoUrl', mongoUrl);

@Module({
  imports: [
    MongooseModule.forRoot(mongoUrl, { dbName: `xbit-${RANDSWAP_NETWORK}` }),
    XbitModule,
    GovernanceModule,
    SpdModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
