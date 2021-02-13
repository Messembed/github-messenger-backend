import {
  Controller,
  Get,
  Inject,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { APP_CONFIGS_KEY, TAppConfigs } from '../config/app.config';
import { GITHUB_CONFIGS_KEY, TGitHubConfigs } from '../config/github.config';
import { UserDocument } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { GitHubOAuthRedirectPayloadDto } from './dto/github-oauth-redirect-payload.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    @Res() response: Response,
    @Query() payload: GitHubOAuthRedirectPayloadDto,
  ): Promise<any> {
    const {
      backendAccessToken,
      messembedAccessToken,
    } = await this.authService.githubOAuthRedirectHandler(payload);

    response.redirect(
      '/oauth/github/result?backendAccessToken=' +
        encodeURIComponent(backendAccessToken) +
        '&messembedAccessToken=' +
        encodeURIComponent(messembedAccessToken),
    );
  }

  @Get('oauth/github/result')
  routeForPassingGitHubOAuthToken(): string {
    return '';
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: UserDocument): UserDocument {
    return user;
  }
}
