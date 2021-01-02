import { Injectable } from '@nestjs/common';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import {
  GitHubOAuthAppAuth,
  InjectGitHubOAuthAppAuth,
} from '../auth-github-oauth-app';
import { GitHubOAuthRedirectPayloadDto } from './dto/github-oauth-redirect-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectGitHubOAuthAppAuth()
    private readonly githubOAuthAppAuth: GitHubOAuthAppAuth,
  ) {}

  async githubOAuthRedirectHandler(
    payload: GitHubOAuthRedirectPayloadDto,
  ): Promise<any> {
    const tokenAuthentication = (await this.githubOAuthAppAuth({
      type: 'token',
      code: payload.code,
      state: payload.state,
    })) as TokenAuthentication;

    return tokenAuthentication;
  }
}
