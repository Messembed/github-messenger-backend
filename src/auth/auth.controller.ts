import {
  Controller,
  Get,
  Inject,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { APP_CONFIGS_KEY, TAppConfigs } from '../config/app.config';
import { GITHUB_CONFIGS_KEY, TGitHubConfigs } from '../config/github.config';
import { AuthService } from './auth.service';
import { GitHubOAuthRedirectPayloadDto } from './dto/github-oauth-redirect-payload.dto';

@Controller()
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
    @Inject(GITHUB_CONFIGS_KEY)
    private readonly githubConfigs: TGitHubConfigs,
  ) {}

  @Get('oauth/github')
  async redirectToGitHubOAuth(@Res() response: Response): Promise<void> {
    response.redirect(
      `https://github.com/login/oauth/authorize?client_id=` +
        this.githubConfigs.clientId +
        `&redirect_uri=` +
        encodeURIComponent(this.appConfigs.baseUrl + '/oauth/github/callback'),
    );
  }

  @Get('oauth/github/callback')
  async oauthRedirectHandler(
    @Query() payload: GitHubOAuthRedirectPayloadDto,
  ): Promise<any> {
    return this.authService.githubOAuthRedirectHandler(payload);
  }
}
