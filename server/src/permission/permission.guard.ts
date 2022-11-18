import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionService } from './permission.service';
import { PermissionIdentifiers } from './identifiers.enum';

import User from 'src/user/user.model';
import Permission from './models/permission.model';

export const PERMISSION_IDENTIFIER_METADATA_KEY = 'permission:identifier';

@Injectable()
export class PermissionGuard implements CanActivate {
  readonly cachedPermissions: Map<PermissionIdentifiers, Permission>;

  constructor(private readonly permissionService: PermissionService, private reflector: Reflector) {
    this.cachedPermissions = new Map<PermissionIdentifiers, Permission>();
  }

  async canActivate(context: ExecutionContext) {
    const permissionIdentifier = this.reflector.getAllAndOverride<PermissionIdentifiers>(PERMISSION_IDENTIFIER_METADATA_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!permissionIdentifier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    let permission = this.cachedPermissions.get(permissionIdentifier);
    if (!permission) {
      permission = await this.permissionService.findByIdentifierOrFail(permissionIdentifier);
      this.cachedPermissions.set(permissionIdentifier, permission);
    }

    if (await user.hasPermission(permission)) {
      return true;
    }

    throw new ForbiddenException();
  }
}
