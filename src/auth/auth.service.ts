import { Inject, Injectable } from '@nestjs/common';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import {
  GitHubOAuthAppAuth,
  InjectGitHubOAuthAppAuth,
} from '../auth-github-oauth-app';
import { GitHubOAuthRedirectPayloadDto } from './dto/github-oauth-redirect-payload.dto';
import { Octokit } from '@octokit/rest';
import { UsersService } from '../users/users.service';
import { MessembedConfigType, MESSEMBED_CONFIG_KEY } from '../config/messembed';
import { InjectMessembedSDK } from 'messembed-sdk/nestjs';
import { MessembedSDK } from 'messembed-sdk';
import { User as MessembedUser } from 'messembed-sdk/dist/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectGitHubOAuthAppAuth()
    private readonly githubOAuthAppAuth: GitHubOAuthAppAuth,
    @Inject(MESSEMBED_CONFIG_KEY)
    private readonly messembedConfig: MessembedConfigType,
    @InjectMessembedSDK()
    private readonly messembedSdk: MessembedSDK,
  ) {}

  async githubOAuthRedirectHandler(
    payload: GitHubOAuthRedirectPayloadDto,
  ): Promise<any> {
    const tokenAuthentication = (await this.githubOAuthAppAuth({
      type: 'token',
      code: payload.code,
      state: payload.state,
    })) as TokenAuthentication;

    const octokit = new Octokit({ auth: tokenAuthentication.token });

    const { data: githubUser } = await octokit.users.getAuthenticated();

    const user = await this.usersService.createUser({
      githubId: githubUser.id,
      tokenAuthentication: tokenAuthentication,
    });

    let messembedUser: MessembedUser;

    try {
      messembedUser = await this.messembedSdk.getUser(user.githubId.toString());
    } catch (err) {
      messembedUser = await this.messembedSdk.createUser(
        {
          id: user.githubId.toString(),
          externalMetadata: { objectId: user._id },
        },
        { password: this.messembedConfig.password },
      );
    }

    const accessToken = await this.messembedSdk.createAccessToken(
      messembedUser.externalId,
      {
        password: this.messembedConfig.password,
      },
    );

    return accessToken;
  }
}
