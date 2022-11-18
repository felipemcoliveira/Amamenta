import { Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';

export interface SerializerOptions extends ClassTransformOptions {
  includePermissionGroups?: boolean;
  type?: Type<any>;
}

export interface IHasOwner {
  getOwnerId(): number;
}
