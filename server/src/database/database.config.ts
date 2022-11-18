import { Logger } from '@nestjs/common';
import type { SequelizeModuleOptions } from '@nestjs/sequelize';

import Category from '../category/models/category.model';
import Permission from '../permission/models/permission.model';
import UserPermission from '../permission/models/user-permission.model';
import User from '../user/user.model';
import Post from '../post/models/post.model';
import PostAttachment from '../post/models/post-attachement.model';

const logger = new Logger('DatabaseQuery');

export default (): { sequelizeOptions: SequelizeModuleOptions } => {
  const logging = process.env.DATABASE_LOGGING === 'true';
  return {
    sequelizeOptions: {
      dialect: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_HOST) || 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      quoteIdentifiers: false,
      logging: logging
        ? (message) => {
            logger.debug(message);
          }
        : false,
      logQueryParameters: true,
      define: {
        freezeTableName: true,
        timestamps: false,
        underscored: true
      },
      dialectOptions: {
        bigNumberStrings: true
      },
      models: [User, Permission, UserPermission, Category, Post, PostAttachment]
    }
  };
};
