import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import UserPermission from './models/user-permission.model';
import Permission from './models/permission.model';

import { PermissionIdentifiers } from './identifiers.enum';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(UserPermission)
    private readonly userPermissionModel: typeof UserPermission,
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
    private readonly sequelize: Sequelize
  ) {}

  getAllPermissionIdentifiers(): Array<string> {
    return Object.values(PermissionIdentifiers);
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    return this.permissionModel.create({
      identifier: dto.identifier,
      description: dto.description
    });
  }

  async update(permission: Permission, updatePermissionDto: UpdatePermissionDto): Promise<void> {
    await permission.update(updatePermissionDto);
  }

  async delete(permission: Permission): Promise<void> {
    await permission.destroy();
  }

  async findAll(): Promise<Array<Permission>> {
    return this.permissionModel.findAll();
  }

  async findOneOrFail(id: number): Promise<Permission> {
    const permission = await this.permissionModel.findByPk(id);
    if (!permission) throw new NotFoundException();
    return permission;
  }

  async findByIdentifierOrFail(identifier: string): Promise<Permission> {
    const permission = await this.permissionModel.findOne({ where: { identifier } });
    if (!permission) throw new NotFoundException();
    return permission;
  }

  async updateUserPermissions(userId: number, identifiers: Array<string>): Promise<void> {
    await this.sequelize.transaction(async () => {
      // remove all permissions first
      await this.userPermissionModel.destroy({ where: { userId } });

      // then add the desired ones
      const permissions = await this.permissionModel.findAll({ where: { identifier: identifiers } });

      await this.userPermissionModel.bulkCreate(
        permissions.map((permission) => {
          return { userId, permissionId: permission.id };
        })
      );
    });
  }
}
