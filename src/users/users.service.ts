import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import axios from 'axios';
import { InjectMessembedAdminSDK } from 'messembed-sdk/nestjs';
import * as messembed from 'messembed-sdk';
import { MessembedAdminSDK } from 'messembed-sdk';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectMessembedAdminSDK()
    private readonly messembedAdminSdk: MessembedAdminSDK,
  ) {}

  async createOrUpdateUser(data: {
    tokenAuthentication?: TokenAuthentication;
    _id: number;
  }): Promise<UserDocument> {
    let user = await this.userModel.findOne({
      _id: data._id,
    });

    if (user) {
      if (data.tokenAuthentication) {
        user.tokenAuthentication = data.tokenAuthentication;
      }

      await user.save();
    } else {
      user = await this.userModel.create({
        _id: data._id,
        createdAt: new Date(),
        tokenAuthentication: data.tokenAuthentication,
      });
    }

    return user;
  }

  async getUserOrFail(userId: number): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('No user found with id' + userId);
    }

    return user;
  }

  async searchGitHubUsers(q: string, currentUser: UserDocument): Promise<any> {
    const octokit = new Octokit({
      auth: currentUser.tokenAuthentication.token,
    });
    const result = await octokit.search.users({
      q,
    });

    return result;
  }

  async ensureGitHubUserIntegrity(options: {
    githubUserId?: number;
    githubUsername?: string;
  }): Promise<messembed.User> {
    let githubUserId = options.githubUserId;

    if (!githubUserId) {
      const octokit = new Octokit();
      const githubUser = await octokit.users.getByUsername({
        username: options.githubUsername,
      });

      githubUserId = githubUser.data.id;
    }

    await this.createOrUpdateUser({ _id: githubUserId });
    let messembedUser: messembed.User;

    try {
      messembedUser = await this.messembedAdminSdk.getUser(
        githubUserId.toString(),
      );
    } catch {
      const githubUser = await this.getGitHubUserById(githubUserId);

      // if not found
      messembedUser = await this.messembedAdminSdk.createUser({
        id: githubUser.id.toString(),
        externalMetadata: {
          name: githubUser.name,
          username: githubUser.login,
          avatar: githubUser.avatar_url,
        },
      });
    }

    return messembedUser;
  }

  /**
   * Here we use the undocumented GitHub's api to get
   * user by it's ID (not username)
   */
  async getGitHubUserById(
    githubUserId: number,
  ): Promise<
    RestEndpointMethodTypes['users']['getByUsername']['response']['data']
  > {
    const response = await axios.get<
      RestEndpointMethodTypes['users']['getByUsername']['response']['data']
    >('https://api.github.com/user/' + githubUserId);

    return response.data;
  }
}
