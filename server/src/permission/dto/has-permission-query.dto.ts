import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { IsPermissionIdentifier } from '../decorators/is-permission-identifier.decorator';

export class HasPermissionQuery {
  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsPermissionIdentifier()
  permission: string;
}
