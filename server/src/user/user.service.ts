import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import User from '../user/user.model';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PermissionService } from '../permission/permission.service';
import Permission from '../permission/models/permission.model';
import { PermissionIdentifiers } from '../permission/identifiers.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly permissionService: PermissionService,
    private readonly sequelize: Sequelize
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.isEmailUnavailable(createUserDto.email)) {
      throw new ConflictException(`O email ${createUserDto.email} não está disponível.`);
    }
    return this.userModel.create(createUserDto);
  }

  async isEmailUnavailable(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { email } });
    return user != null;
  }

  async findOrError(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  async canBeUpdatedBy(requestingUser: User, targetUserId: number) {
    // the user can update itself
    if (requestingUser.id === targetUserId) {
      return true;
    }

    // or it has permission to update anyone else
    if (await this.hasPermission(requestingUser, PermissionIdentifiers.CanManageUsers)) {
      return true;
    }

    // otherwise it should no be able to update it
    return false;
  }

  async loadUserPermissions(user: User): Promise<void> {
    user.permissions = await user.getPermissions();
  }

  async findByPk(id: number): Promise<User> {
    return this.userModel.findByPk(id);
  }

  async findByPkWithPermissions(id: number): Promise<User> {
    return this.userModel.findByPk(id, { include: [Permission] });
  }

  async findAll(): Promise<Array<User>> {
    return this.userModel.findAll();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOrError(id);
    if (updateUserDto.email && user.email !== updateUserDto.email && (await this.isEmailUnavailable(updateUserDto.email))) {
      throw new ConflictException(`O email ${updateUserDto.email} não esta disponível.`);
    }
    await user.update(updateUserDto);
    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOrError(id);
    await user.destroy();
  }

  async getPermissions(id: number): Promise<Array<string>> {
    const user = await this.findOrError(id);
    const permissions = await user.getPermissions({ attributes: ['identifier'] });
    return permissions.map((p) => p.identifier);
  }

  async updatePermissions(id: number, permissionIdentifiers: Array<string>): Promise<void> {
    return this.permissionService.updateUserPermissions(id, permissionIdentifiers);
  }

  async removePermission(id: number, permissionIdentifier: string): Promise<void> {
    const user = await this.findOrError(id);
    const permission = await this.permissionService.findByIdentifierOrFail(permissionIdentifier);
    await user.removePermision(permission);
  }

  async hasPermission(user: User, permissionIdentifier: string): Promise<boolean> {
    const permission = await this.permissionService.findByIdentifierOrFail(permissionIdentifier);
    return await user.hasPermission(permission);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
      include: [Permission]
    });
  }
}
