import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

export type GitHubOAuthAppAuth = ReturnType<typeof createOAuthAppAuth>;
