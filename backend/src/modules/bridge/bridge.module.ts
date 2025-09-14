import { Module } from '@nestjs/common';
import { BridgeController } from './bridge.controller';
import { BridgeService } from './bridge.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { PlayFulfilledEvent, PlayFulfilledEventSchema } from 'src/schemas/events/PlayFulfilledEvent.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { User, UserSchema } from 'src/schemas/User.schema';
import { AuthModule } from '../auth/auth.module';

dotenv.config();

const { MONGO_USER, MONGO_PWD, MONGO_PORT, NODE_ENV, MONGO_URL } = process.env;
console.log('NODE_ENV', NODE_ENV);
const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_URL}:${MONGO_PORT}/?retryWrites=false`;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(mongoUrl, { connectionName: 'xbit-arbitrum', dbName: 'xbit-arbitrum' }),
    MongooseModule.forRoot(mongoUrl, { connectionName: 'xbit-base', dbName: 'xbit-base' }),
    MongooseModule.forRoot(mongoUrl, { connectionName: 'xbit-bnb', dbName: 'xbit-bnb' }),
    MongooseModule.forRoot(mongoUrl, { connectionName: 'xbit-bridge', dbName: 'xbit-bridge' }),
    MongooseModule.forFeature([{ name: PlayFulfilledEvent.name, schema: PlayFulfilledEventSchema }], 'xbit-arbitrum'),
    MongooseModule.forFeature([{ name: PlayFulfilledEvent.name, schema: PlayFulfilledEventSchema }], 'xbit-base'),
    MongooseModule.forFeature([{ name: PlayFulfilledEvent.name, schema: PlayFulfilledEventSchema }], 'xbit-bnb'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'xbit-bridge'),
    AuthModule,
  ],
  controllers: [BridgeController],
  providers: [BridgeService],
})
export class BridgeModule {}
