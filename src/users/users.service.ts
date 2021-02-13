import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(data: {
    tokenAuthentication: TokenAuthentication;
    githubId: number;
  }): Promise<UserDocument> {
    let user = await this.userModel.findOne({
      githubId: data.githubId,
    });

    if (user) {
      user.tokenAuthentication = data.tokenAuthentication;
      user.githubId = data.githubId;

      await user.save();
    } else {
      user = await this.userModel.create({
        _id: new Types.ObjectId(),
        createdAt: new Date(),
        tokenAuthentication: data.tokenAuthentication,
        githubId: data.githubId,
      });
    }

    return user;
  }

  async getUserOrFail(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('No user found with id' + userId);
    }

    return user;
  }
}
