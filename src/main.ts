import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('app.port');
  const appHost = configService.get<string>('app.host');

  await app.listen(appPort, appHost, () => {
    logger.log(`The server is listening on http://${appHost}:${appPort}`);
  });
}

bootstrap().catch((err) => {
  logger.error(err);
  process.exit(1);
});
