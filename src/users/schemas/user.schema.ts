import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TokenAuthentication } from '@octokit/auth-oauth-app/dist-types/types';
import { Document } from 'mongoose';

export type UserDocument = Document & User;

@Schema()
export class User {
  @Prop({ type: Number })
  _id: number;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Object })
  tokenAuthentication?: TokenAuthentication;
}

export const UserSchema = SchemaFactory.createForClass(User);
