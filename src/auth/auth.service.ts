import { Injectable } from '@nestjs/common';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import {
  GitHubOAuthAppAuth,
  InjectGitHubOAuthAppAuth,
} from '../auth-github-oauth-app';
import { GitHubOAuthRedirectPayloadDto } from './dto/github-oauth-redirect-payload.dto';
import { Octokit } from '@octokit/rest';
import { UsersService } from '../users/users.service';
import { InjectMessembedAdminSDK } from 'messembed-sdk/nestjs';
import { MessembedAdminSDK } from 'messembed-sdk';
import { User as MessembedUser } from 'messembed-sdk/dist/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectGitHubOAuthAppAuth()
    private readonly githubOAuthAppAuth: GitHubOAuthAppAuth,
    @InjectMessembedAdminSDK()
    private readonly messembedAdminSdk: MessembedAdminSDK,
    private readonly jwtService: JwtService,
  ) {}

  async githubOAuthRedirectHandler(
    payload: GitHubOAuthRedirectPayloadDto,
  ): Promise<{ messembedAccessToken: string; backendAccessToken: string }> {
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
      messembedUser = await this.messembedAdminSdk.getUser(
        user.githubId.toString(),
      );
    } catch (err) {
      messembedUser = await this.messembedAdminSdk.createUser({
        id: user.githubId.toString(),
        externalMetadata: { objectId: user._id },
      });
    }

    const messembedAccessToken = await this.messembedAdminSdk.createAccessToken(
      messembedUser._id,
    );

    const backendAccessToken = await this.jwtService.signAsync({
      sub: user._id,
    });

    return {
      messembedAccessToken: messembedAccessToken.accessToken,
      backendAccessToken,
    };
  }
}
