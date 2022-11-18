import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PermissionModule } from '../permission/permission.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './user.model';
import { CreateUserCommandRunner } from './command/create-user.command-runner';

@Module({
  imports: [PermissionModule, SequelizeModule.forFeature([User])],
  exports: [SequelizeModule, UserService],
  controllers: [UserController],
  providers: [UserService, CreateUserCommandRunner]
})
export class UserModule {}
