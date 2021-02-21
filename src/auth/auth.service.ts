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
import _ from 'lodash';

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

    const user = await this.usersService.createOrUpdateUser({
      _id: githubUser.id,
      tokenAuthentication: tokenAuthentication,
    });

    let messembedUser: MessembedUser;

    try {
      messembedUser = await this.messembedAdminSdk.getUser(user._id.toString());
    } catch (err) {
      messembedUser = await this.messembedAdminSdk.createUser({
        id: user._id.toString(),
        externalMetadata: {
          name: githubUser.name,
          username: githubUser.login,
          avatar: githubUser.avatar_url,
        },
      });
    }

    await this.createInitialChatsForUser(octokit, user._id);

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

  private async createInitialChatsForUser(
    octokit: Octokit,
    userId: number,
  ): Promise<void> {
    const followers = await octokit.users.listFollowersForAuthenticatedUser();
    const followings = await octokit.users.listFollowedByAuthenticated();

    const commonFollows = _.intersectionBy(
      followers.data,
      followings.data,
      'id',
    );

    await Promise.all(
      commonFollows.map(async (commonFollowUser) => {
        await this.usersService.createOrUpdateUser({
          _id: commonFollowUser.id,
        });

        try {
          await this.messembedAdminSdk.getUser(commonFollowUser.id.toString());
        } catch {
          const commonFollowUserFullObject = await octokit.users.getByUsername({
            username: commonFollowUser.login,
          });

          // if not found
          await this.messembedAdminSdk.createUser({
            id: commonFollowUserFullObject.data.id.toString(),
            externalMetadata: {
              name: commonFollowUserFullObject.data.name,
              username: commonFollowUserFullObject.data.login,
              avatar: commonFollowUserFullObject.data.avatar_url,
            },
          });
        }

        try {
          await this.messembedAdminSdk.createChat({
            firstCompanionId: userId.toString(),
            secondCompanionId: commonFollowUser.id.toString(),
          });
        } catch (err) {
          // chat already exists
          if (err?.response?.data?.code !== 'CHAT_ALREADY_EXISTS') {
            throw err;
          }
        }
      }),
    );
  }

  async createAccessTokensForUser(
    userId: number,
  ): Promise<{ messembedAccessToken: string; backendAccessToken: string }> {
    const user = await this.usersService.getUserOrFail(userId);
    const messembedUser = await this.messembedAdminSdk.getUser(
      user._id.toString(),
    );

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
