import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AuthGitHubOAuthAppModule } from '../auth-github-oauth-app';
import { configModuleOptions } from '../config';
import { GITHUB_CONFIGS_KEY, TGitHubConfigs } from '../config/github.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MongoDBConfigType,
  MONGODB_CONFIG_KEY,
} from '../config/mongodb.config';
import { MessembedSDKModule } from 'messembed-sdk/nestjs';
import { MessembedConfigType, MESSEMBED_CONFIG_KEY } from '../config/messembed';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    AuthGitHubOAuthAppModule.forRootAsync({
      useFactory: (githubConfigs: TGitHubConfigs) => ({
        clientId: githubConfigs.clientId,
        clientSecret: githubConfigs.clientSecret,
      }),
      inject: [GITHUB_CONFIGS_KEY],
    }),
    AuthModule,
    MongooseModule.forRootAsync({
      useFactory: (mongodbConfig: MongoDBConfigType) => ({
        uri: mongodbConfig.uri,
      }),
      inject: [MONGODB_CONFIG_KEY],
    }),
    MessembedSDKModule.forRootAsync({
      useFactory: (messembedConfig: MessembedConfigType) => messembedConfig.uri,
      inject: [MESSEMBED_CONFIG_KEY],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
