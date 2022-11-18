import { Expose } from 'class-transformer';
import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Column, Model, DataType, AllowNull } from 'sequelize-typescript';

import { ExcludeIfNull } from '../../common/exclude-if-null.decorator';

@Table({ tableName: 'permission' })
export default class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
  @Expose()
  @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true })
  id: CreationOptional<number>;

  @Expose()
  @ExcludeIfNull()
  @Column({ type: DataType.STRING })
  description?: string;

  @Expose()
  @AllowNull(false)
  @Column({ type: DataType.CHAR(64), unique: true })
  identifier: string;
}
