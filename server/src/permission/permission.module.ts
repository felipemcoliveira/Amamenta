import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';

import Permission from './models/permission.model';
import UserPermission from './models/user-permission.model';

import { PermissionGuard } from './permission.guard';

@Module({
  imports: [SequelizeModule.forFeature([Permission, UserPermission])],
  exports: [SequelizeModule, PermissionService],
  providers: [PermissionService, PermissionGuard],
  controllers: [PermissionController]
})
export class PermissionModule {}
