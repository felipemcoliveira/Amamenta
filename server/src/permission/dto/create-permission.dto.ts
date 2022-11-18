import { IsOptional } from 'class-validator';
import { IsPermissionIdentifier } from '../decorators/is-permission-identifier.decorator';

export class CreatePermissionDto {
  @IsPermissionIdentifier()
  identifier: string;

  @IsOptional()
  description: string;
}
