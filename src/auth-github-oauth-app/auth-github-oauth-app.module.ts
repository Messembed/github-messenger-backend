import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  AUTH_GITHUB_OAUTH_APP_MODULE_OPTIONS_TOKEN,
  AUTH_GITHUB_OAUTH_APP_INSTANCE_TOKEN,
} from './constants';
import { AuthGitHubOAuthAppModuleAsyncOptions } from './interfaces/auth-github-oauth-app-module-async-options.interface';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { AuthGitHubOAuthAppModuleOptions } from './interfaces/auth-github-oauth-app-module-options.interface';
import { GitHubOAuthAppAuth } from './interfaces/github-oauth-app-auth.interface';

@Global()
@Module({})
export class AuthGitHubOAuthAppModule {
  static forRootAsync(
    options: AuthGitHubOAuthAppModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: AuthGitHubOAuthAppModule,
      providers: [
        {
          provide: AUTH_GITHUB_OAUTH_APP_MODULE_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: AUTH_GITHUB_OAUTH_APP_INSTANCE_TOKEN,
          useFactory: async (
            options: AuthGitHubOAuthAppModuleOptions,
          ): Promise<GitHubOAuthAppAuth> => {
            const auth = createOAuthAppAuth(options);

            await auth({
              type: 'oauth-app',
            });

            return auth;
          },
          inject: [AUTH_GITHUB_OAUTH_APP_MODULE_OPTIONS_TOKEN],
        },
      ],
      exports: [AUTH_GITHUB_OAUTH_APP_INSTANCE_TOKEN],
    };
  }
}
