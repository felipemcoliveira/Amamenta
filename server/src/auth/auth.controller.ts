import { response, Response } from 'express';
import { Controller, Get, Post, UseGuards, Res } from '@nestjs/common';

import { AuthService } from './auth.service';

import { Protected } from '../common/protected.decorator';
import { AuthenticatedUser } from './decorators/user.decorator';

import { LocalAuthGuard } from './guards/local-auth.guard';

import User from '../user/user.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@AuthenticatedUser() user: User, @Res({ passthrough: true }) response: Response) {
    const authorizationToken = await this.authService.login(user);

    response.cookie('amamentaufn_authtoken', authorizationToken, {
      expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      httpOnly: true
    });

    return { authorizationToken, user };
  }

  @Get('signout')
  @Protected()
  signout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('amamentaufn_authtoken');
  }

  @Get()
  @Protected()
  async index(@AuthenticatedUser() user: User) {
    return user;
  }
}
