import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';

@Controller()
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('github-users')
  @UseGuards(JwtAuthGuard)
  async searchGitHubUsers(
    @Query('q') q: string,
    @CurrentUser() user: UserDocument,
  ): Promise<any> {
    return this.usersService.searchGitHubUsers(q, user);
  }

  @Post('ensure-github-user-integrity')
  async ensureGitHubUserIntegrity(
    @Body('githubUserId') githubUserId?: number,
    @Body('githubUsername') githubUsername?: string,
  ): Promise<any> {
    const messembedUser = await this.usersService.ensureGitHubUserIntegrity({
      githubUserId,
      githubUsername,
    });

    return { _id: messembedUser._id };
  }
}
