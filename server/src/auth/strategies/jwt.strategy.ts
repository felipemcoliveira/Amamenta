import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { JwtPayload } from '../types/jwt-payload.type';
import { UserService } from '../../user/user.service';

import User from '../../user/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractAuthCookie, ExtractJwt.fromAuthHeaderAsBearerToken]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  private static extractAuthCookie(req: Request) {
    if (req.cookies && 'amamentaufn_authtoken' in req.cookies) {
      return req.cookies['amamentaufn_authtoken'];
    }
    return null;
  }

  async validate({ sub }: JwtPayload): Promise<User> {
    const user = await this.userService.findByPkWithPermissions(sub);

    if (user === null) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
