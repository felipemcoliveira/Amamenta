import { SetMetadata, UseGuards } from '@nestjs/common';

import { PermissionGuard, PERMISSION_IDENTIFIER_METADATA_KEY } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { PermissionIdentifiers } from '../permission/identifiers.enum';

export const Protected = (requiredPermission?: PermissionIdentifiers): MethodDecorator & ClassDecorator => {
  return function (target: any, key: string, descriptor: any) {
    UseGuards(JwtAuthGuard)(target, key, descriptor);

    if (requiredPermission) {
      UseGuards(PermissionGuard)(target, key, descriptor);
      SetMetadata(PERMISSION_IDENTIFIER_METADATA_KEY, requiredPermission)(target, key, descriptor);
    }
  } as any;
};

export const OverridePermission = (permission?: PermissionIdentifiers): MethodDecorator => {
  return function (target, key, descriptor) {
    SetMetadata(PERMISSION_IDENTIFIER_METADATA_KEY, permission)(target, key, descriptor);
  };
};

export const IgnorePermission = (): MethodDecorator => {
  return function (target, key, descriptor) {
    SetMetadata(PERMISSION_IDENTIFIER_METADATA_KEY, null)(target, key, descriptor);
  };
};
