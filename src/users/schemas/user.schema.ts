import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import { Document, Types } from 'mongoose';

export type UserDocument = Document & User;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Object })
  tokenAuthentication?: TokenAuthentication;

  @Prop({ type: Number, unique: true, required: true })
  githubId: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
