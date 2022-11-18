import { Expose } from 'class-transformer';
import Sequelize, { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, HasMany } from 'sequelize-typescript';

import { ExcludeIfNull } from '../../common/exclude-if-null.decorator';

import { IHasOwner } from '../../serializer';

import Category from '../../category/models/category.model';
import User from '../../user/user.model';
import PostAttachment from './post-attachement.model';

@Table({
  tableName: 'post',
  updatedAt: false,
  indexes: [
    {
      fields: ['created_datetime']
    }
  ]
})
export default class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> implements IHasOwner {
  @Expose()
  @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true })
  id: CreationOptional<number>;

  @Expose()
  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Expose()
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @CreatedAt
  @Expose()
  @Column({ field: 'created_datetime', type: DataType.DATE, allowNull: false })
  createdAt: CreationOptional<Date>;

  @Expose()
  @ExcludeIfNull()
  @BelongsTo(() => Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' })
  category?: NonAttribute<Category>;

  @ForeignKey(() => Category)
  @Column({ field: 'category_id', type: DataType.INTEGER.UNSIGNED, allowNull: false })
  categoryId: CreationOptional<number>;

  @Expose()
  @BelongsTo(() => User, { as: 'author', foreignKey: 'authorId', onDelete: 'CASCADE' })
  author?: NonAttribute<User>;

  @ForeignKey(() => User)
  @Column({ field: 'author_id', type: DataType.INTEGER.UNSIGNED })
  authorId: CreationOptional<number>;

  @Expose()
  @HasMany(() => PostAttachment)
  attachments?: NonAttribute<Array<PostAttachment>>;

  @Expose()
  @Column({ field: 'attachment_index_count', type: DataType.INTEGER.UNSIGNED })
  attachmentInstanceCount: number;

  // ------------------------------------------------------------------------------------------------------------
  // IHasOwner Implementation
  // ------------------------------------------------------------------------------------------------------------

  getOwnerId(): number {
    return this.authorId;
  }

  // ------------------------------------------------------------------------------------------------------------
  // Model Association Methods
  // ------------------------------------------------------------------------------------------------------------

  declare getAuthor: Sequelize.BelongsToGetAssociationMixin<User>;
  declare getCategory: Sequelize.BelongsToGetAssociationMixin<Category>;
}
