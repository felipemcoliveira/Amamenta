import { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Expose } from 'class-transformer';

import * as mime from 'mime';

import Post from './post.model';

@Table({ tableName: 'post_attachement' })
export default class PostAttachment extends Model<InferAttributes<PostAttachment>, InferCreationAttributes<PostAttachment>> {
  @Expose()
  @Column({ field: 'file_id', type: DataType.UUID, allowNull: false, primaryKey: true })
  fileId: string;

  @Expose()
  @Column({ field: 'mine_type', type: DataType.CHAR(24) })
  mimeType: string;

  @BelongsTo(() => Post, { foreignKey: 'attachedToPostId', onDelete: 'CASCADE' })
  attachedTo: NonAttribute<Post>;

  @Expose()
  @Column({ field: 'instance_id', type: DataType.INTEGER, allowNull: false })
  instanceId: number;

  @ForeignKey(() => Post)
  @Column({ field: 'post_id', type: DataType.INTEGER.UNSIGNED, allowNull: false })
  attachedToPostId: CreationOptional<number>;

  get filename() {
    const ext = mime.getExtension(this.mimeType);
    return `${this.fileId}.${ext}`;
  }
}
