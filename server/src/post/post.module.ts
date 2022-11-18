import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserModule } from '../user/user.module';
import { PermissionModule } from '../permission/permission.module';

import Post from './models/post.model';
import PostAttachment from './models/post-attachement.model';

@Module({
  imports: [PermissionModule, UserModule, SequelizeModule.forFeature([Post, PostAttachment])],
  exports: [SequelizeModule],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
