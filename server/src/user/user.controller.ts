import {
  Controller,
  Patch,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException
} from '@nestjs/common';

import { UserService } from './user.service';

import { Protected } from '../common/protected.decorator';
import { AuthenticatedUser } from '../auth/decorators/user.decorator';

import { PermissionIdentifiers } from '../permission/identifiers.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePermissionsDto } from './dto/update-permisons.dto';

import User from '../user/user.model';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Protected(PermissionIdentifiers.CanManageUsers)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @Protected(PermissionIdentifiers.CanManageUsers)
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/:id')
  @Protected()
  async findOne(@Param('id', ParseIntPipe) id: number, @AuthenticatedUser() requestingUser: User) {
    const user = await this.userService.findOrError(id);
    await this.userService.loadUserPermissions(user);

    if (!(await this.userService.canBeUpdatedBy(requestingUser, user.id))) {
      throw new ForbiddenException('Você não tem acesso a este usuário.');
    }

    return user;
  }

  @Patch('/:id')
  @Protected()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @AuthenticatedUser() requestingUser: User
  ) {
    if (!(await this.userService.canBeUpdatedBy(requestingUser, id))) {
      throw new ForbiddenException('Sem permissão para editar este usuário.');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete('/:id')
  @Protected(PermissionIdentifiers.CanManageUsers)
  async delete(@Param('id', ParseIntPipe) id: number, @AuthenticatedUser() requestingUser: User) {
    if (id === requestingUser.id) {
      throw new ForbiddenException('Você não pode deletar seu própio usuário.');
    }

    await this.userService.delete(id);
  }

  @Get('/permission/:id')
  @Protected(PermissionIdentifiers.CanManageUserPermissions)
  async getPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getPermissions(id);
  }

  @Patch('/:id/permissions')
  @Protected(PermissionIdentifiers.CanManageUserPermissions)
  async updatePermissions(@Param('id', ParseIntPipe) id: number, @Body() { permissions }: UpdatePermissionsDto) {
    await this.userService.updatePermissions(id, permissions);
  }
}
