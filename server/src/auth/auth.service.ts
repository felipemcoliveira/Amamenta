import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserService } from '../user/user.service';

import { JwtPayload } from './types/jwt-payload.type';

import User from '../user/user.model';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  async login(user: User): Promise<string> {
    return this.jwtService.signAsync(<JwtPayload>{ sub: user.id });
  }

  async validateUserCredentials(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (isPasswordValid) {
        return user;
      }
    }
    throw new UnauthorizedException('Senha ou email inválidos.');
  }
}
