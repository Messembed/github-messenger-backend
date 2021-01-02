import { ConfigType, registerAs } from '@nestjs/config';

export const githubConfigsFactory = registerAs('github', () => ({
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
}));

export const GITHUB_CONFIGS_KEY = githubConfigsFactory.KEY;

export type TGitHubConfigs = ConfigType<typeof githubConfigsFactory>;
