import { NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import Permission from './permission.model';
import User from '../../user/user.model';

@Table({ tableName: 'user_permission' })
export default class UserPermission extends Model<InferAttributes<UserPermission>, InferCreationAttributes<UserPermission>> {
  @ForeignKey(() => Permission)
  @Column({ field: 'permission_id', type: DataType.INTEGER.UNSIGNED, allowNull: false })
  permissionId: number;

  @BelongsTo(() => Permission, { foreignKey: 'permissionId' })
  permission?: NonAttribute<Permission>;

  @ForeignKey(() => User)
  @Column({ field: 'user_id', type: DataType.INTEGER.UNSIGNED, allowNull: false })
  userId: number;

  @BelongsTo(() => User, { foreignKey: 'userId', foreignKeyConstraint: true })
  user?: NonAttribute<User>;
}
