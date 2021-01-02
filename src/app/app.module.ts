import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from 'src/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
