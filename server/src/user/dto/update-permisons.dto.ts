import { Type } from 'class-transformer';
import { IsString, IsArray } from 'class-validator';

import { IsPermissionIdentifier } from '../../permission/decorators/is-permission-identifier.decorator';

export class UpdatePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  @IsPermissionIdentifier({ each: true })
  @Type(() => String)
  permissions: Array<string>;
}
