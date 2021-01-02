import { Inject } from '@nestjs/common';
import { AUTH_GITHUB_OAUTH_APP_INSTANCE_TOKEN } from '../constants';

export function InjectGitHubOAuthAppAuth(): ParameterDecorator {
  return Inject(AUTH_GITHUB_OAUTH_APP_INSTANCE_TOKEN);
}
