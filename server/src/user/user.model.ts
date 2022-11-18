import { Expose, Transform, Type } from 'class-transformer';
import { Table, Column, Model, DataType, CreatedAt, BelongsToMany } from 'sequelize-typescript';
import Sequelize, { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';

import Permission from '../permission/models/permission.model';
import UserPermission from '../permission/models/user-permission.model';
import { getPermissionGroup } from '../permission/permission.utils';
import { PermissionIdentifiers } from '../permission/identifiers.enum';
import { ExcludeIfNull } from '../common/exclude-if-null.decorator';

import { IHasOwner } from '../serializer/serializer.interfaces';

@Table({ tableName: 'user', updatedAt: false })
export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> implements IHasOwner {
  @Expose()
  @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true })
  id: CreationOptional<number>;

  @Expose()
  @Column({ type: DataType.CHAR(128), unique: true, allowNull: false })
  email: string;

  @Expose()
  @Column({ type: DataType.STRING(32), allowNull: false })
  firstName: string;

  @Expose()
  @Column({ type: DataType.STRING(32), allowNull: false })
  lastName: string;

  @Column({ field: 'password_hash', type: DataType.CHAR(60), allowNull: false })
  passwordHash: string;

  @CreatedAt
  @Expose({ groups: [getPermissionGroup(PermissionIdentifiers.CanManageUsers), 'OWNER'] })
  @Column({ field: 'created_datetime', type: DataType.DATE, allowNull: false })
  createdAt: CreationOptional<Date>;

  @Expose({ groups: [getPermissionGroup(PermissionIdentifiers.CanManagePermissions), 'OWNER'] })
  @ExcludeIfNull()
  @Type(() => Permission)
  @Transform(({ value }) => value && value.map((p: Permission) => p.identifier))
  @BelongsToMany(() => Permission, () => UserPermission)
  permissions?: NonAttribute<Permission[]>;

  // ------------------------------------------------------------------------------------------------------------
  // IHasOwner Implementation
  // ------------------------------------------------------------------------------------------------------------

  getOwnerId(): number {
    return this.id;
  }

  // ------------------------------------------------------------------------------------------------------------
  // Model Association Methods
  // ------------------------------------------------------------------------------------------------------------

  declare addPermission: Sequelize.BelongsToManyAddAssociationMixin<Permission, number>;
  declare addPermissions: Sequelize.BelongsToManyAddAssociationsMixin<Permission, number>;
  declare removePermision: Sequelize.BelongsToManyRemoveAssociationMixin<Permission, number>;
  declare removePermisions: Sequelize.BelongsToManyRemoveAssociationsMixin<Permission, number>;
  declare hasPermission: Sequelize.BelongsToManyHasAssociationMixin<Permission, number>;
  declare getPermissions: Sequelize.BelongsToManyGetAssociationsMixin<Permission>;
}
