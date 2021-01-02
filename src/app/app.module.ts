import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AuthGitHubOAuthAppModule } from '../auth-github-oauth-app';
import { configModuleOptions } from '../config';
import { GITHUB_CONFIGS_KEY, TGitHubConfigs } from '../config/github.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
