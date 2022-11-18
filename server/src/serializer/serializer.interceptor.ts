import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain, plainToClass } from 'class-transformer';

import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile, Optional } from '@nestjs/common';

import { SERIALIZER_OPTIONS } from './serializer.constants';

import { getPermissionGroup } from 'src/permission/permission.utils';

import { SerializerOptions, IHasOwner } from './serializer.interfaces';

import User from 'src/user/user.model';

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, @Optional() private readonly defaultOptions: SerializerOptions = {}) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const contextOptions = this.reflector.getAllAndOverride<SerializerOptions>(SERIALIZER_OPTIONS, [
      context.getHandler(),
      context.getClass()
    ]);

    const options = {
      ...this.defaultOptions,
      ...contextOptions
    };

    const request = context.switchToHttp().getRequest<Request>();

    if (request.user && options.includePermissionGroups) {
      const user = request.user as User;

      if (user.permissions) {
        const groups = options.groups || [];
        user.permissions.map((permission) => {
          groups.push(getPermissionGroup(permission.identifier));
        });
        options.groups = groups;
      }
    }
    return next.handle().pipe(map((res) => this.serialize(res, options, request.user as User)));
  }

  serialize(response: any, options: SerializerOptions, user?: User): any {
    if (response === undefined) {
      return {};
    }

    if (response instanceof StreamableFile) {
      return response;
    }

    return Array.isArray(response)
      ? response.map((item: any) => this.transformToPlain(item, options, user))
      : this.transformToPlain(response, options, user);
  }

  transformToPlain(res: any, options: SerializerOptions, user?: User) {
    if (!res) {
      return res;
    }

    if (!SerializerInterceptor.isObject(res) || res.constructor === Object) {
      return res;
    }

    if (user && 'getOwnerId' in res) {
      const ownerId = (<IHasOwner>res).getOwnerId();
      if (user.id === ownerId) {
        options.groups = [...options.groups, 'OWNER'];
      }
    }

    if (!options.type) {
      return instanceToPlain(res, options);
    }

    if (res instanceof options.type) {
      return instanceToPlain(res, options);
    }

    const instance = plainToClass(options.type, res);
    return instanceToPlain(instance, options);
  }

  static isObject(v: any): boolean {
    return (typeof v === 'object' || typeof v === 'function') && v !== null;
  }
}
