import { Expose } from 'class-transformer';
import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ExcludeIfNull } from '../../common/exclude-if-null.decorator';

@Table({ tableName: 'category' })
export default class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  @Expose()
  @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true })
  id: CreationOptional<number>;

  @Expose()
  @ExcludeIfNull()
  @Column({ type: DataType.STRING })
  description?: string;

  @Expose()
  @Column({ type: DataType.CHAR(64), allowNull: false, unique: true })
  name: string;

  @Expose()
  @Column({ type: DataType.CHAR(8), allowNull: false })
  color: string;
}
