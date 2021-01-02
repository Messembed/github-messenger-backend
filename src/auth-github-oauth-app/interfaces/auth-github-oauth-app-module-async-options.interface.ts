import { AuthGitHubOAuthAppModuleOptions } from './auth-github-oauth-app-module-options.interface';

export interface AuthGitHubOAuthAppModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) =>
    | AuthGitHubOAuthAppModuleOptions
    | Promise<AuthGitHubOAuthAppModuleOptions>;
  inject: any[];
}
