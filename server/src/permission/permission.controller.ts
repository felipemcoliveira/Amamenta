import { Body, Controller, Delete, Param, Post, HttpCode, HttpStatus, Patch, Get, ParseIntPipe } from '@nestjs/common';

import { Protected } from '../common/protected.decorator';

import { PermissionIdentifiers } from './identifiers.enum';

import { PermissionService } from './permission.service';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permission')
@Protected(PermissionIdentifiers.CanManagePermissions)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async findAll() {
    return await this.permissionService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOneOrFail(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createdPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionService.create(createdPermissionDto);
    return permission;
  }

  @Patch('/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionService.findOneOrFail(id);
    await this.permissionService.update(permission, updatePermissionDto);
    return permission;
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionService.findOneOrFail(id);
    await this.permissionService.delete(permission);
    return {};
  }
}
