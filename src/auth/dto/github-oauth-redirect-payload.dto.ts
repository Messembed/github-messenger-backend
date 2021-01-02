import { IsOptional, IsString } from 'class-validator';

export class GitHubOAuthRedirectPayloadDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  state?: string;
}
