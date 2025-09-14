import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BridgeModule } from './modules/bridge/bridge.module';
import helmet from 'helmet';
import compression from 'compression';
import { isBridgeService } from './utils/constant';
import { ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';

async function bootstrap() {
  console.log('isBridgeService: ', isBridgeService);
  console.log('api port', process.env.API_PORT);
  console.log('reset db', process.env.RESET_DB);

  const app = await NestFactory.create(isBridgeService ? BridgeModule : AppModule, { cors: { origin: '*' } });

  if (process.env.RESET_DB === 'true') {
    const appService = app.get(AppService);
    await appService.resetDatabase();
  }

  app.use(helmet()).use(compression());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.API_PORT);
}

bootstrap();
