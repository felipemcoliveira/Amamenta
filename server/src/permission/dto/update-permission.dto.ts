import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(OmitType(CreatePermissionDto, ['identifier'])) {}
